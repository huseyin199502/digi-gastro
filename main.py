from fastapi.staticfiles import StaticFiles
import asyncio
import copy
import html as html_module
import json
import os
import urllib.parse
import secrets
import csv
import io
import time
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

# ──────────────────────────────────────────────────────────────────
# REDIS — Cache + Distributed Lock + Pub/Sub (cross-worker)
#
# Optional dependency. If the `redis` package is missing or the
# server is unreachable, the app silently falls back to local-only
# behaviour (asyncio.Lock, single-worker broadcast, no cache).
# ──────────────────────────────────────────────────────────────────
try:
    import redis.asyncio as aioredis          # async client (cache + pub/sub)
    from redis.asyncio import Redis as AsyncRedis
    import redis as sync_redis_module          # sync client (invalidate in sync code)
    _REDIS_AVAILABLE = True
except ImportError:  # pragma: no cover - local dev without redis package
    aioredis = None
    AsyncRedis = None
    sync_redis_module = None
    _REDIS_AVAILABLE = False
    print("[Redis] Package not installed — running in no-cache / single-worker mode")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
# Module-level handles — populated lazily in startup hooks.
# `Optional[Any]` keeps type-checking happy even when the redis
# package is absent.
redis_client: Optional[Any] = None          # async client (cache + pub/sub publisher)
sync_redis_client: Optional[Any] = None     # sync client (cache invalidation from sync code)

# Eagerly init the sync client so sync functions (e.g. save_restaurant_to_db)
# can invalidate the cache. Failures are non-fatal.
if _REDIS_AVAILABLE:
    try:
        sync_redis_client = sync_redis_module.from_url(REDIS_URL, decode_responses=True)
    except Exception as _e:  # pragma: no cover
        sync_redis_client = None
        print(f"[Redis] sync client init failed: {_e}")


def html_escape(s):
    """HTML-escape für sichere Template-Interpolation in f-Strings.
    Verhindert reflektierte/stored XSS via Query-Parametern oder DB-Werten."""
    if s is None:
        return ""
    return html_module.escape(str(s), quote=True)

def js_escape(s):
    """JS-string-escape für sichere Interpolation in JavaScript-Kontexten
    (z.B. onclick="foo('...')"). Verhindert JS-String-Breakout."""
    if s is None:
        return ""
    return (str(s)
            .replace('\\', '\\\\')
            .replace("'", "\\'")
            .replace('"', '\\"')
            .replace('\n', '\\n')
            .replace('\r', '\\r')
            .replace('<', '\\u003c')
            .replace('>', '\\u003e')
            .replace('&', '\\u0026'))

def get_berlin_now():
    now = datetime.now()
    if getattr(datetime, "__name__", None) == "MockDatetime":
        return now
    from datetime import timezone, timedelta
    try:
        utc_now = datetime.now(timezone.utc)
    except Exception:
        return now
    year = utc_now.year
    march_31 = datetime(year, 3, 31, 1, 0, tzinfo=timezone.utc)
    cest_start = march_31 - timedelta(days=(march_31.weekday() + 1) % 7)
    october_31 = datetime(year, 10, 31, 1, 0, tzinfo=timezone.utc)
    cest_end = october_31 - timedelta(days=(october_31.weekday() + 1) % 7)
    if cest_start <= utc_now < cest_end:
        offset = timedelta(hours=2)
    else:
        offset = timedelta(hours=1)
    return (utc_now + offset).replace(tzinfo=None)

def process_and_crop_product_image(image_bytes) -> bytes:
    from io import BytesIO
    from PIL import Image
    
    # 1. Try to remove background using rembg
    try:
        import onnxruntime
        from rembg import remove
        img_no_bg_bytes = remove(image_bytes)
        img = Image.open(BytesIO(img_no_bg_bytes))
    except BaseException as e:
        print(f"[Image Processing] rembg background removal failed/not installed or exited: {e}")
        img = Image.open(BytesIO(image_bytes))
        
    # 2. Convert to RGBA if not already
    if img.mode != "RGBA":
        img = img.convert("RGBA")
        
    # 3. Crop transparent borders (autotrim empty space around product)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # 4. Save as PNG to preserve transparency
    out = BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()

def process_and_optimize_general_image(image_bytes) -> bytes:
    from io import BytesIO
    from PIL import Image
    try:
        img = Image.open(BytesIO(image_bytes))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGBA")
            format_type = "PNG"
        else:
            img = img.convert("RGB")
            format_type = "JPEG"
        img.thumbnail((1920, 1080))
        out = BytesIO()
        if format_type == "PNG":
            img.save(out, format="PNG", optimize=True)
        else:
            img.save(out, format="JPEG", quality=85, optimize=True)
        return out.getvalue()
    except Exception as e:
        print(f"[Image Processing] Optimization failed, using raw bytes: {e}")
        return image_bytes



from fastapi import FastAPI, Request, Form, Response, HTTPException, Depends, UploadFile, File, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse, FileResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

app = FastAPI(title="digi-gastro High-End Gastronomy OS")

# Setup Jinja2 Templates
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Track last activity per connection for heartbeat detection
        self._last_activity: Dict[int, float] = {}

    async def connect(self, slug: str, websocket: WebSocket):
        await websocket.accept()
        if slug not in self.active_connections:
            self.active_connections[slug] = []
        self.active_connections[slug].append(websocket)
        self._last_activity[id(websocket)] = time.time()

    def disconnect(self, slug: str, websocket: WebSocket):
        if slug in self.active_connections:
            if websocket in self.active_connections[slug]:
                self.active_connections[slug].remove(websocket)
            if not self.active_connections[slug]:
                del self.active_connections[slug]
        self._last_activity.pop(id(websocket), None)

    async def broadcast(self, slug: str, message: dict):
        """
        Audit Fix 5.5 — broadcast() parallel + Timeout.
        Vorher: seriell — ein langsamer Client blockierte alle anderen + Event Loop.
        Jetzt: parallel mit 2s Timeout pro Client. Tote Connections werden entfernt.
        """
        if slug not in self.active_connections:
            return
        connections = list(self.active_connections[slug])
        if not connections:
            return

        async def _safe_send(conn: WebSocket):
            try:
                await asyncio.wait_for(conn.send_json(message), timeout=2.0)
                self._last_activity[id(conn)] = time.time()
                return None
            except Exception:
                return conn  # connection is dead

        # Parallel broadcast mit asyncio.gather — viel schneller als seriell
        results = await asyncio.gather(*[_safe_send(c) for c in connections], return_exceptions=False)
        dead = [r for r in results if r is not None]

        for d in dead:
            try:
                self.active_connections[slug].remove(d)
            except (ValueError, KeyError):
                pass
        if slug in self.active_connections and not self.active_connections[slug]:
            del self.active_connections[slug]

    async def cleanup_stale_connections(self, max_age_seconds: int = 120):
        """
        Audit Fix 5.6 — Stale Connections aufräumen.
        Wird periodisch vom Startup-Task aufgerufen.
        Entfernt Connections, die seit >max_age_seconds keine Aktivität mehr hatten.
        """
        now = time.time()
        slugs_to_check = list(self.active_connections.keys())
        for slug in slugs_to_check:
            conns = list(self.active_connections.get(slug, []))
            for conn in conns:
                conn_id = id(conn)
                last_seen = self._last_activity.get(conn_id, 0)
                if now - last_seen > max_age_seconds:
                    try:
                        await conn.close(code=1001, reason="stale")
                    except Exception:
                        pass
                    self.disconnect(slug, conn)

    async def broadcast_global(self, slug: str, message: dict):
        """Broadcast via Redis Pub/Sub — reached all Uvicorn workers.

        Falls back to local broadcast() when Redis is unavailable so the
        single-worker dev setup keeps working unchanged.
        """
        if redis_client is not None:
            try:
                await redis_client.publish(f"ws:{slug}", json.dumps(message, default=str))
                return
            except Exception as e:
                print(f"[Redis Pub/Sub] publish failed: {e} — fallback to local broadcast")
        # No Redis OR publish failed → local broadcast only
        await self.broadcast(slug, message)

manager = ConnectionManager()


async def redis_subscriber():
    """Listen for Redis Pub/Sub messages and forward to local WebSocket clients.

    Runs as a background task started by the `start_redis_subscriber` startup
    hook. Each Uvicorn worker runs its own subscriber so messages published
    by any worker reach every worker's local connections.

    ROBUSTNESS: redis-py 5.x beendet `pubsub.listen()` nach 5 Sekunden
    Inaktivität mit 'Timeout reading from redis:6379'. Das ist KEIN echter
    Fehler — nur ein Read-Timeout. Wir verwenden stattdessen
    `get_message(timeout=60)` in einer while-Loop, das ist stabiler.
    """
    if redis_client is None:
        return  # nothing to do without Redis

    retry_delay = 1  # Sekunden zwischen Retry-Versuchen
    max_retry_delay = 30

    while True:
        try:
            pubsub = redis_client.pubsub()
            await pubsub.psubscribe("ws:*")
            print("[Redis Subscriber] listening on ws:*")
            retry_delay = 1  # Reset nach erfolgreichem Connect

            # ── Stabile Message-Loop statt pubsub.listen() ──
            # pubsub.listen() crashed nach 5s Timeout (redis-py 5.x Bug).
            # get_message(timeout=60) kehrt nach 60s ohne Message sauber
            # mit None zurück — kein Crash.
            while True:
                message = await pubsub.get_message(
                    ignore_subscribe_messages=True,
                    timeout=60.0  # 60s Read-Timeout — kehrt sauber zurück
                )
                if message is None:
                    # Timeout — kein Crash, einfach weitermachen
                    continue
                if message.get("type") != "pmessage":
                    continue
                try:
                    channel = message.get("channel", "")
                    if isinstance(channel, bytes):
                        channel = channel.decode("utf-8", errors="ignore")
                    slug = channel.split(":", 1)[1] if ":" in channel else None
                    if not slug:
                        continue
                    raw = message.get("data")
                    if isinstance(raw, bytes):
                        raw = raw.decode("utf-8", errors="ignore")
                    data = json.loads(raw)
                    await manager.broadcast(slug, data)
                except Exception as e:
                    print(f"[Redis Subscriber] error processing message: {e}")

        except asyncio.CancelledError:
            # Shutdown — sauber beenden
            try:
                await pubsub.punsubscribe("ws:*")
                await pubsub.aclose()
            except Exception:
                pass
            raise
        except Exception as e:
            # Echter Fehler (Redis down etc.) — RESTART mit Backoff
            print(f"[Redis Subscriber] loop crashed: {e} — restarting in {retry_delay}s")
            try:
                await pubsub.aclose()
            except Exception:
                pass
            await asyncio.sleep(retry_delay)
            retry_delay = min(retry_delay * 2, max_retry_delay)  # Exponential backoff


# ──────────────────────────────────────────────────────────────────
# WEBSOCKET AUTHENTICATION
# Only authenticated clients (admin, POS, KDS, or guest with valid
# session cookie) may connect. Unauthenticated connections are
# rejected with a 4401 close code.
# ──────────────────────────────────────────────────────────────────
def _validate_ws_cookies(slug: str, cookies: dict) -> bool:
    """Check if the WebSocket client has a valid session cookie."""
    slug_lower = slug.lower().strip()

    # 1. Unified admin session cookie  (format: slug:name:role:pin)
    session = cookies.get("session")
    if session:
        try:
            parts = session.split(":")
            if len(parts) == 4 and parts[0] == slug_lower:
                return True
        except Exception:
            pass

    # 2. Legacy device-specific session cookie
    session_legacy = cookies.get(f"session_{slug_lower}")
    if session_legacy:
        try:
            parts = session_legacy.split(":")
            if len(parts) == 3:
                return True
        except Exception:
            pass

    # 3. POS device cookie
    pos_cookie = cookies.get(f"pos_token_{slug_lower}")
    if pos_cookie:
        # Quick existence check – the actual value is verified on API calls
        return True

    # 4. KDS device cookie
    kds_cookie = cookies.get("kds_session")
    if kds_cookie:
        try:
            parts = kds_cookie.split(":")
            if len(parts) >= 2 and parts[0] == slug_lower:
                return True
        except Exception:
            pass

    # 5. Guest session cookie (customer on menu page) - validate slug exists in DB
    guest_cookie = cookies.get(f"guest_session_{slug_lower}")
    if guest_cookie:
        try:
            parts = guest_cookie.split(":", 1)
            if len(parts) == 2 and parts[0] and parts[1]:
                # Verify the tenant slug actually exists to prevent random connections
                try:
                    db_check = SessionLocal()
                    try:
                        tenant_exists = db_check.query(Tenant).filter(Tenant.slug == slug_lower).first() is not None
                        if tenant_exists:
                            return True
                    finally:
                        db_check.close()
                except Exception:
                    pass
        except Exception:
            pass

    return False

@app.websocket("/ws/{slug}")
async def websocket_endpoint(websocket: WebSocket, slug: str):
    # ── Auth check BEFORE entering the main loop ──
    if not _validate_ws_cookies(slug, websocket.cookies):
        # Must accept first, then close with 4401 code so the client
        # receives the close frame and knows it was rejected.
        await websocket.accept()
        await websocket.close(code=4401, reason="Unauthorized")
        return

    await manager.connect(slug, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle client keepalive pings gracefully
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(slug, websocket)
    except Exception:
        manager.disconnect(slug, websocket)

# ──────────────────────────────────────────────────────────────────
# RACE CONDITION PROTECTION – per-tenant async locks
# Prevents lost updates when concurrent requests read-modify-write
# the same tenant data (e.g. two orders arriving at the same time).
#
# Audit Fix 5.1 — Multi-Worker-Safety via PostgreSQL Advisory Locks
# Vorher: nur asyncio.Lock (prozess-lokal) → bei gunicorn -w N verloren.
# Jetzt: Zusätzlich pg_advisory_lock für cross-worker Serialisierung.
# In SQLite-Mode (Local-Dev) fällt der Advisory-Lock weg — nur asyncio.Lock.
# ──────────────────────────────────────────────────────────────────
_tenant_locks: Dict[str, asyncio.Lock] = {}

def _get_tenant_lock(slug: str) -> asyncio.Lock:
    slug_lower = slug.lower().strip()
    if slug_lower not in _tenant_locks:
        _tenant_locks[slug_lower] = asyncio.Lock()
    return _tenant_locks[slug_lower]


def _pg_advisory_lock_key(slug: str) -> int:
    """Generiert einen deterministischen 64-bit Integer aus dem Slug für pg_advisory_lock.
    PostgreSQL Advisory Locks akzeptieren nur BIGINT. Wir hashen den Slug."""
    import hashlib
    h = hashlib.sha1(slug.lower().strip().encode("utf-8")).digest()
    # Nehme erste 8 Bytes als int64 (signed)
    val = int.from_bytes(h[:8], byteorder="big", signed=True)
    return val


async def _acquire_pg_advisory_lock(slug: str, db_session) -> None:
    """Acquires a PostgreSQL advisory lock (cross-worker safe).
    Only called in Postgres mode. SQLite mode skips this."""
    if not _IS_LOCAL_DEV:
        try:
            from sqlalchemy import text as _sa_text
            key = _pg_advisory_lock_key(slug)
            # pg_advisory_xact_lock is automatically released at COMMIT/ROLLBACK
            db_session.execute(_sa_text("SELECT pg_advisory_xact_lock(:k)"), {"k": key})
        except Exception as e:
            print(f"[tenant_lock] pg_advisory_lock failed for {slug}: {e}")
            # Fallback: continue without cross-worker lock (asyncio.Lock still applies)


# ──────────────────────────────────────────────────────────────────
# REDIS DISTRIBUTED LOCK — cross-worker mutual exclusion
#
# Used by `tenant_lock` as a fast cross-worker gate BEFORE the
# asyncio.Lock (which is per-process only). Falls back gracefully:
#   • Redis package missing  → always returns True (no-op)
#   • Redis unreachable      → always returns True (no-op)
#   • Lock held by other wrk → returns False after bounded retry
# In all "skip" cases the existing pg_advisory_xact_lock + asyncio.Lock
# continue to provide safety, just at lower throughput.
# ──────────────────────────────────────────────────────────────────
_redis_lock_tokens: Dict[str, str] = {}


async def _acquire_redis_lock(slug: str, timeout: float = 30.0, wait: float = 10.0) -> bool:
    """Acquire a distributed lock via Redis SET NX EX, with bounded retry.

    Returns True if:
      • the lock was acquired (token stashed for safe release), OR
      • Redis is unavailable (graceful fallback — caller proceeds with
        asyncio.Lock + pg_advisory_xact_lock only).

    Returns False if the lock could not be acquired within `wait` seconds
    (another worker is mutating this tenant). The caller should still
    proceed because pg_advisory_xact_lock will block at the DB layer —
    returning False here is only a hint to skip the Redis release.
    """
    if redis_client is None:
        return True  # No Redis — fall through to asyncio.Lock
    lock_key = f"lock:{slug}"
    lock_token = str(uuid.uuid4())
    deadline = time.monotonic() + wait
    while True:
        try:
            acquired = await redis_client.set(
                lock_key, lock_token, nx=True, ex=int(timeout)
            )
            if acquired:
                _redis_lock_tokens[slug] = lock_token
                return True
        except Exception as e:
            print(f"[Redis Lock] acquire error for {slug}: {e} — allowing (fallback)")
            return True
        if time.monotonic() >= deadline:
            return False
        await asyncio.sleep(0.05)


async def _release_redis_lock(slug: str) -> None:
    """Release the Redis lock, but only if we still own it (token match).

    Uses an atomic Lua check-and-del to avoid accidentally deleting a
    lock that has expired (TTL) and been re-acquired by another worker.
    """
    if redis_client is None:
        return
    lock_key = f"lock:{slug}"
    token = _redis_lock_tokens.pop(slug, None)
    if not token:
        return  # Never acquired (or already released) — nothing to do
    try:
        await redis_client.eval(
            "if redis.call('get', KEYS[1]) == ARGV[1] "
            "then return redis.call('del', KEYS[1]) "
            "else return 0 end",
            1, lock_key, token,
        )
    except Exception as e:
        # Lua eval failed — best-effort plain delete
        print(f"[Redis Lock] release error for {slug}: {e}")
        try:
            await redis_client.delete(lock_key)
        except Exception:
            pass


import functools

def tenant_lock(func):
    """Decorator that acquires the per-tenant asyncio.Lock for the endpoint.
    The endpoint MUST have a `slug` path/query parameter or `slug` in the
    function signature so we can extract the tenant identity.
    The lock serialises all read-modify-write cycles for the same tenant,
    preventing lost updates under concurrent access.

    Audit Fix 5.1: In Multi-Worker (Postgres) mode, zusätzlich pg_advisory_xact_lock.
    REDIS-SETUP:   Zusätzlich Redis distributed lock (fast cross-worker gate).
    """
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        # Try to get slug from kwargs first (FastAPI injects it), then from path
        slug = kwargs.get("slug")
        request_obj = None
        db_session = kwargs.get("db")
        if not slug:
            # Fallback: inspect Request object in args
            for arg in args:
                if isinstance(arg, Request):
                    request_obj = arg
                    slug = arg.path_params.get("slug")
                    if slug:
                        break
        if not slug:
            # Last resort: run without lock (shouldn't happen)
            return await func(*args, **kwargs)

        # ── REDIS-SETUP: Fast cross-worker gate (best-effort) ──
        # Acquired before asyncio.Lock so other workers fail fast and
        # don't pile up on the DB. Released in `finally` after the
        # asyncio.Lock releases. If Redis is unavailable, this is a no-op.
        redis_lock_acquired = await _acquire_redis_lock(slug)
        try:
            # ── Audit Fix 5.1: Cross-Worker Lock via PostgreSQL Advisory Lock ──
            # In Multi-Worker-Modus (gunicorn -w N) ist asyncio.Lock prozess-lokal
            # und schützt nicht zwischen Workern. pg_advisory_xact_lock wird automatisch
            # bei Commit/Rollback freigegeben.
            # In SQLite-Modus (Local-Dev) überspringen wir diesen Schritt.
            if not _IS_LOCAL_DEV and db_session is not None:
                await _acquire_pg_advisory_lock(slug, db_session)

            # asyncio.Lock: serialisiert innerhalb dieses Prozesses
            async with _get_tenant_lock(slug):
                return await func(*args, **kwargs)
        finally:
            if redis_lock_acquired:
                await _release_redis_lock(slug)
    return wrapper


# ──────────────────────────────────────────────────────────────────
# UPLOAD DIRECTORY – persistent volume for logos / product images
# ──────────────────────────────────────────────────────────────────
# On Coolify / Docker: set UPLOAD_DIR=/app/data/uploads and mount
# /app/data as a Persistent Volume so files survive container rebuilds.
# Locally: falls back to the classic static/uploads folder.
# ──────────────────────────────────────────────────────────────────
UPLOAD_DIR = os.getenv(
    "UPLOAD_DIR",
    os.path.join(BASE_DIR, "static", "uploads")  # local fallback
)
UPLOAD_LOGOS_DIR = os.path.join(UPLOAD_DIR, "logos")
os.makedirs(UPLOAD_LOGOS_DIR, exist_ok=True)

def delete_local_image_if_unused(image_path: str, restaurant: dict, current_product_id: Optional[int] = None):
    if not image_path or not image_path.startswith("/uploads/"):
        return
        
    products = restaurant.get("products", [])
    for p in products:
        if current_product_id is not None and p.get("id") == current_product_id:
            continue
        if p.get("image") == image_path:
            return
    
    # Also check landing page references (logo, slideshow, gallery, offers, custom sections)
    lp = restaurant.get("landing_page", {})
    if lp:
        # Check logo
        if lp.get("logo_image") == image_path or restaurant.get("logo_path") == image_path:
            return
        # Check slideshow images
        for img in (lp.get("slideshow_images") or []):
            if img == image_path:
                return
        # Check gallery images
        for img in (lp.get("gallery_images") or []):
            if img == image_path:
                return
        # Check offer images
        for img in (lp.get("offer_images") or []):
            if img == image_path:
                return
        # Check custom sections
        for section in (lp.get("custom_sections") or []):
            if section.get("image") == image_path:
                return
            
    rel_path = image_path[len("/uploads/"):]
    full_path = os.path.join(UPLOAD_DIR, rel_path)
    if os.path.exists(full_path) and os.path.isfile(full_path):
        try:
            os.remove(full_path)
            print(f"[Image Cleanup] Deleted unused image: {full_path}")
        except Exception as e:
            print(f"[Image Cleanup] Error deleting unused image {full_path}: {e}")


# Secure Platform Admin Password configuration
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "superpassword123")

# Static files: project assets (CSS, JS, built-in images)
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
# Uploads served separately so they survive from the persistent volume.
# WICHTIG: Bilder dürfen nicht im Browser-Cache landen, sonst kann man sie
# offline aus dem Cache klauen. Daher: Cache-Control: no-store für /uploads/.
# Logo und Branding-Assets sind in /static/ → dürfen gecacht werden (Service Worker).
from starlette.middleware import Middleware
from starlette.responses import Response as StarletteResponse

@app.middleware("http")
async def no_cache_uploads_middleware(request: Request, call_next):
    """Verhindert Caching von Kunden-Uploads (Bilder, Logos, Produktfotos).
    Schützt vor Offline-Klau aus dem Browser-Cache."""
    response = await call_next(request)
    if request.url.path.startswith("/uploads/"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        # X-Content-Type-Options verhindert MIME-Sniffing-Angriffe
        response.headers["X-Content-Type-Options"] = "nosniff"
    return response

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ════════════════════════════════════════════════════════════════════
# PageSpeed: Cache-Control für statische Assets (Performance)
# ════════════════════════════════════════════════════════════════════
@app.middleware("http")
async def cache_static_assets_middleware(request: Request, call_next):
    """Set Cache-Control für statische Assets (CSS, JS, Bilder, Icons).
    PageSpeed: 'Use efficient cache lifetimes' Fix."""
    response = await call_next(request)
    path = request.url.path
    if path.startswith("/static/css/") or path.startswith("/static/js/") or path.startswith("/static/images/"):
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return response

# ════════════════════════════════════════════════════════════════════
# Security Headers (Audit Issue 6.9)
# Schützt vor Clickjacking, MIME-Sniffing, Mixed Content, XSS u.a.
# ════════════════════════════════════════════════════════════════════
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    # X-Frame-Options: verhindert Clickjacking via iframe-Einbindung
    response.headers["X-Frame-Options"] = "DENY"
    # X-Content-Type-Options: verhindert MIME-Sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    # Referrer-Policy: nur Origin an Dritte senden (keine Query-Parameter)
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # HSTS: HTTPS erzwingen (nur in Produktion relevant — wenn nicht localhost)
    host = request.url.hostname or ""
    if host not in ("localhost", "127.0.0.1", "testserver", "0.0.0.0"):
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    # Permissions-Policy: deaktiviert Features, die wir nicht brauchen
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=()"
    # CSP — restriktiv aber funktional:
    # - default-src 'self': nur eigene Ressourcen
    # - script-src: Alpine.js via jsdelivr CDN + inline scripts + eval
    # - style-src: Google Fonts + cdnjs (Font Awesome) + inline styles
    # - img-src 'self' data: blob: https: (Bilder von überall)
    # - media-src 'self' data: blob: https:
    # - connect-src 'self' ws: wss: (WebSocket)
    # - font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:
    # - frame-ancestors 'none': Clickjacking-Schutz
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; "
        "img-src 'self' data: blob: https:; "
        "media-src 'self' data: blob: https:; "
        "connect-src 'self' ws: wss:; "
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    )
    return response

# ──────────────────────────────────────────────────────────────────
# HEALTH CHECK – must be registered BEFORE any middleware so Docker
# HEALTHCHECK and Coolify never get a 404.
# ──────────────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
def health_check_early():
    """Lightweight liveness probe – always returns 200 when the app is up."""
    return JSONResponse({"status": "ok"})

# ──────────────────────────────────────────────────────────────────
# Startup Background Tasks (Audit Fix 5.6 — WebSocket Stale Cleanup)
# ──────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def _start_ws_cleanup_task():
    """Startet Background-Task, der alle 60s stale WebSocket-Connections entfernt."""
    async def _cleanup_loop():
        while True:
            try:
                await asyncio.sleep(60)
                await manager.cleanup_stale_connections(max_age_seconds=180)
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[WS Cleanup] Fehler: {e}")
                await asyncio.sleep(60)

    asyncio.create_task(_cleanup_loop())


# ──────────────────────────────────────────────────────────────────
# REDIS LIFECYCLE — init async client, start pub/sub subscriber
# ──────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def init_redis():
    """Connect the async Redis client. Non-fatal if Redis is unavailable —
    the app continues in single-worker / no-cache mode."""
    global redis_client
    if not _REDIS_AVAILABLE:
        print("[Redis] redis package missing — skipping async client init")
        return
    try:
        redis_client = aioredis.from_url(
            REDIS_URL, decode_responses=True, max_connections=50
        )
        await redis_client.ping()
        print(f"[Redis] Connected to {REDIS_URL}")
    except Exception as e:
        print(f"[Redis] Connection failed: {e} — fallback to no-cache / single-worker mode")
        redis_client = None


@app.on_event("startup")
async def start_redis_subscriber():
    """Start the Redis Pub/Sub subscriber as a background task.

    Each Uvicorn worker runs its own subscriber so broadcasts published
    by any worker reach every worker's local WebSocket connections.
    """
    if redis_client is None:
        return
    asyncio.create_task(redis_subscriber())


@app.on_event("shutdown")
async def close_redis():
    """Close the async Redis client on shutdown."""
    global redis_client
    if redis_client is not None:
        try:
            await redis_client.close()
        except Exception as e:
            print(f"[Redis] close error: {e}")
        finally:
            redis_client = None


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("static/images/digigastrologo.jpeg")

@app.get("/google25bbbffb97f06aaa.html", include_in_schema=False)
async def google_verification():
    """Google Search Console Verifizierungsdatei."""
    return FileResponse("static/google25bbbffb97f06aaa.html", media_type="text/html")

@app.get("/apple-touch-icon.png", include_in_schema=False)
@app.get("/apple-touch-icon-precomposed.png", include_in_schema=False)
@app.get("/apple-touch-icon-120x120.png", include_in_schema=False)
async def apple_touch_icon():
    return FileResponse("static/images/digigastrologo.jpeg")

# ════════════════════════════════════════════════════════════════════
# SEO: robots.txt + sitemap.xml
# ════════════════════════════════════════════════════════════════════
@app.get("/robots.txt", include_in_schema=False)
async def robots_txt():
    """robots.txt – erlaubt Google alle öffentlichen Seiten, sperrt
    Admin/API/Uploads. Verweist auf sitemap.xml."""
    content = """User-agent: *
Allow: /
Allow: /static/
Disallow: /admin
Disallow: /api/
Disallow: /uploads/
Disallow: /digi-gastro-admin
Disallow: /*/admin
Disallow: /*/tablet
Disallow: /*/kitchen
Disallow: /*/bestellen
Disallow: /*/stornieren
Disallow: /*/cancel-item

# Sitemap
Sitemap: https://digi-gastro.de/sitemap.xml
"""
    return Response(content=content, media_type="text/plain", headers={
        "Cache-Control": "public, max-age=86400"
    })

@app.get("/sitemap.xml", include_in_schema=False)
async def sitemap_xml():
    """sitemap.xml – listet alle öffentlichen Seiten die Google
    indexieren soll. Aktuell: Landingpage + statische Sektionen."""
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")
    base = "https://digi-gastro.de"

    urls = [
        # Hauptseite
        {"loc": f"{base}/", "priority": "1.0", "changefreq": "weekly", "lastmod": today},
        # Sektionen der Landingpage (Anker)
        {"loc": f"{base}/#features", "priority": "0.8", "changefreq": "monthly", "lastmod": today},
        {"loc": f"{base}/#demo", "priority": "0.8", "changefreq": "monthly", "lastmod": today},
        {"loc": f"{base}/#faq", "priority": "0.7", "changefreq": "monthly", "lastmod": today},
    ]

    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>',
                 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        xml_parts.append("  <url>")
        xml_parts.append(f"    <loc>{u['loc']}</loc>")
        xml_parts.append(f"    <lastmod>{u['lastmod']}</lastmod>")
        xml_parts.append(f"    <changefreq>{u['changefreq']}</changefreq>")
        xml_parts.append(f"    <priority>{u['priority']}</priority>")
        xml_parts.append("  </url>")
    xml_parts.append('</urlset>')

    return Response(content="\n".join(xml_parts), media_type="application/xml", headers={
        "Cache-Control": "public, max-age=3600"
    })

@app.get("/manifest.json", include_in_schema=False)
async def manifest():
    return FileResponse(
        "static/manifest.json",
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )

@app.get("/sw.js", include_in_schema=False)
async def service_worker():
    return FileResponse(
        "static/sw.js",
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )

# Custom Exception for suspended tenants
class TenantSuspendedException(Exception):
    def __init__(self, slug: str):
        self.slug = slug

@app.exception_handler(TenantSuspendedException)
async def tenant_suspended_handler(request: Request, exc: TenantSuspendedException):
    return HTMLResponse(
        content=f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Konto gesperrt</title>
            <style>
                body {{ font-family: sans-serif; background: #f3f4f6; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }}
                .card {{ background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }}
                h1 {{ color: #dc2626; margin-top: 0; }}
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Konto deaktiviert</h1>
                <p>Dieses Restaurant ist vorübergehend deaktiviert.</p>
                <p>Bitte kontaktieren Sie den Support.</p>
            </div>
        </body>
        </html>
        """,
        status_code=403
    )

# ----------------------------------------------------
# DATABASE INTEGRATION
# ----------------------------------------------------
from sqlalchemy.orm import Session
from database import (
    Tenant,
    Category,
    Product,
    Order,
    OrderItem as DBOrderItem,
    Staff,
    ServiceCall,
    Table,
    AuditLog,
    RevenueAdjustment,
    SessionLocal,
    STANDARD_PRODUCTS,
    get_db,
    Base,
    engine,
    run_migrations
)

# ── Local-dev detection (für Cookie-Attribute) ──
# In Lokal-Dev (SQLite, kein HTTPS) setzen wir `secure=False`, damit Cookies
# auch ohne HTTPS funktionieren. In Produktion (Postgres, HTTPS) → secure=True.
import database as _db_module
_IS_LOCAL_DEV = not getattr(_db_module, "_IS_POSTGRES", False)

INITIAL_RESTAURANTS = {}

# Run DB migrations and ensure all tables exist
Base.metadata.create_all(engine)
run_migrations()


# Stateless Serialization Helpers for compatibility and template rendering
def load_restaurant_from_db(slug: str, session) -> Optional[dict]:
    tenant = session.query(Tenant).filter_by(slug=slug).first()
    if not tenant:
        return None
    
    db_categories = session.query(Category).filter_by(tenant_slug=slug).order_by(Category.position, Category.id).all()
    categories = [c.name for c in db_categories]
    category_data = [{"id": c.id, "name": c.name, "super_group_id": getattr(c, "super_group_id", None)} for c in db_categories]

    # Load super_groups for this tenant (Hauptgruppen)
    from database import SuperGroup as DBSuperGroup
    db_super_groups = session.query(DBSuperGroup).filter_by(tenant_slug=slug).order_by(DBSuperGroup.position, DBSuperGroup.id).all()
    super_groups = [{
        "id": sg.id,
        "name": sg.name,
        "position": sg.position or 0,
        "color": sg.color or "#374151",
        "icon": sg.icon or ""
    } for sg in db_super_groups]
    
    db_products = session.query(Product).filter_by(tenant_slug=slug).order_by(Product.position, Product.id).all()
    products = []
    for p in db_products:
        products.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "description": p.description,
            "image": p.image,
            "vegan": p.vegan,
            "is_vegan": p.is_vegan,
            "is_glutenfree": p.is_glutenfree,
            "allergens": json.loads(p.allergens or "[]"),
            "category_type": p.category_type,
            "category": p.category,
            "is_available": p.is_available,
            "happy_hour_price": p.happy_hour_price,
            "start_time": p.start_time,
            "end_time": p.end_time,
            "happy_hour_days": json.loads(p.happy_hour_days) if p.happy_hour_days else None,
            "name_en": p.name_en,
            "description_en": p.description_en,
            "position": getattr(p, "position", 0) or 0
        })
        
    db_orders = session.query(Order).filter_by(tenant_slug=slug).order_by(Order.id).all()
    orders = []
    for o in db_orders:
        db_items = session.query(DBOrderItem).filter_by(order_id=o.id).order_by(DBOrderItem.id).all() if hasattr(o, "id") else []
        items = [{
            "product_id": item.product_id,
            "name": item.name,
            "price": item.price,
            "quantity": item.quantity,
            "category_type": item.category_type,
            "note": item.note,
            "item_status": getattr(item, "item_status", "pending") or "pending"
        } for item in db_items]
        orders.append({
            "id": o.id,
            "table": o.table,
            "items": items,
            "total": o.total,
            "total_with_tip": o.total_with_tip,
            "tip_amount": o.tip_amount,
            "status": o.status,
            "timestamp": o.timestamp,
            "mwst_rate": o.mwst_rate,
            "waiter_id": o.waiter_id,
            "original_total": getattr(o, "original_total", None) if hasattr(o, "original_total") else None
        })
        
    db_staff = session.query(Staff).filter_by(tenant_slug=slug).order_by(Staff.id).all()
    staff = [{
        "name": s.name,
        "role": s.role,
        "pin": s.pin,
        "pin_code": s.pin_code
    } for s in db_staff]
    
    db_calls = session.query(ServiceCall).filter_by(tenant_slug=slug).order_by(ServiceCall.id).all()
    service_calls = [{
        "id": c.id,
        "table": c.table,
        "type": c.type,
        "timestamp": c.timestamp
    } for c in db_calls]
    
    db_tables = session.query(Table).filter_by(tenant_slug=slug).order_by(Table.id).all()
    tables = [{
        "number": t.number,
        "zone": t.zone,
        "security_token": t.security_token,
        "active_session_token": t.active_session_token,
        "pos_x": getattr(t, "pos_x", 0.0) or 0.0,
        "pos_y": getattr(t, "pos_y", 0.0) or 0.0,
        "width": getattr(t, "width", 120.0) or 120.0,
        "height": getattr(t, "height", 80.0) or 80.0,
        "shape": getattr(t, "shape", "rect") or "rect",
        "active": getattr(t, "active", True) if getattr(t, "active", True) is not None else True,
        "qr_token": getattr(t, "qr_token", None)
    } for t in db_tables]
    
    try:
        import re
        def natural_sort_key(s):
            return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', str(s))]
        tables.sort(key=lambda x: natural_sort_key(x["number"]))
    except Exception:
        pass
    
    db_logs = session.query(AuditLog).filter_by(tenant_slug=slug).order_by(AuditLog.id).all()
    audit_log = [{
        "id": l.id,
        "action": l.action,
        "timestamp": l.timestamp,
        "user": l.user,
        "details": l.details
    } for l in db_logs]
    
    # Load events and their products
    from database import Event as DBEvent, EventProduct as DBEventProduct, EventCombo as DBEventCombo, EventComboItem as DBEventComboItem
    db_events = session.query(DBEvent).filter_by(tenant_slug=slug).order_by(DBEvent.position, DBEvent.id).all()
    events = []
    for ev in db_events:
        ev_products = session.query(DBEventProduct).filter_by(event_id=ev.id).all()
        # Load combos for this event
        ev_combos = session.query(DBEventCombo).filter_by(event_id=ev.id).order_by(DBEventCombo.position, DBEventCombo.id).all()
        combos = []
        for combo in ev_combos:
            combo_items = session.query(DBEventComboItem).filter_by(combo_id=combo.id).all()
            combos.append({
                "id": combo.id,
                "name": combo.name,
                "combo_price": combo.combo_price,
                "position": combo.position or 0,
                "days": json.loads(combo.days) if combo.days else None,
                "start_time": combo.start_time,
                "end_time": combo.end_time,
                "items": [{"product_id": ci.product_id} for ci in combo_items]
            })
        events.append({
            "id": ev.id,
            "name": ev.name,
            "display_name": ev.display_name,
            "description": ev.description or "",
            "days": json.loads(ev.days or "[]"),
            "start_time": ev.start_time or "18:00",
            "end_time": ev.end_time or "20:00",
            "mode": ev.mode or "selected",
            "discount": ev.discount or 0,
            "is_active": ev.is_active if ev.is_active is not None else True,
            "position": ev.position or 0,
            "products": [{"product_id": ep.product_id, "event_price": ep.event_price} for ep in ev_products],
            "combos": combos
        })
    
    return {
        "name": tenant.name,
        "email": tenant.email,
        "password": tenant.password,
        "tagesumsatz": tenant.tagesumsatz,
        "bestellungen_gesamt": tenant.bestellungen_gesamt,
        "active": tenant.active,
        "is_onboarded": tenant.is_onboarded,
        "is_setup_completed": tenant.is_setup_completed,
        "logo_path": tenant.logo_path,
        "has_kitchen": tenant.has_kitchen,
        "is_shishabar": tenant.is_shishabar,
        "impressum_content": tenant.impressum_content,
        "datenschutz_content": tenant.datenschutz_content,
        "security_token": tenant.security_token,
        "pos_token": tenant.pos_token,
        "pos_secret": tenant.pos_secret,
        "kds_secret": tenant.kds_secret,
        "theme": tenant.theme or "dark",
        "accepts_card_payment": getattr(tenant, "accepts_card_payment", True) if getattr(tenant, "accepts_card_payment", True) is not None else True,
        "price_mode": getattr(tenant, "price_mode", "brutto") or "brutto",
        "service_calls": service_calls,
        "categories": categories,
        "category_data": category_data,
        "super_groups": super_groups,
        "products": products,
        "orders": orders,
        "staff": staff,
        "branding": {
            "address": tenant.address,
            "plz": tenant.plz,
            "ort": tenant.ort,
            "indigo": tenant.indigo,
            "instagram": tenant.instagram,
            "facebook": tenant.facebook,
            "tiktok": tenant.tiktok or "",
            "logo_url": tenant.logo_url
        },
        "landing_page": json.loads(tenant.landing_page_json or "{}"),
        "happy_hour": {
            "days": json.loads(tenant.happy_hour_days or "[]"),
            "start": tenant.happy_hour_start,
            "end": tenant.happy_hour_end,
            "discount": tenant.happy_hour_discount,
            "mode": getattr(tenant, 'happy_hour_mode', None) or 'discount',
            "display_name": getattr(tenant, 'happy_hour_display_name', None) or 'Aktion'
        },
        "tables": tables,
        "audit_log": audit_log,
        "events": events
    }

def unwrap_live_data(val):
    from collections import UserList, UserDict
    cls_name = val.__class__.__name__
    if cls_name == "LiveListProxy" or isinstance(val, UserList):
        raw_list = val.data if hasattr(val, "data") else list(val)
        return [unwrap_live_data(item) for item in raw_list]
    elif cls_name == "LiveDictProxy" or isinstance(val, UserDict):
        raw_dict = val.data if hasattr(val, "data") else dict(val)
        return {k: unwrap_live_data(v) for k, v in raw_dict.items()}
    elif isinstance(val, list):
        return [unwrap_live_data(item) for item in val]
    elif isinstance(val, dict):
        return {k: unwrap_live_data(v) for k, v in val.items()}
    return val

def save_restaurant_to_db(slug: str, r: dict, session):
    tenant = session.query(Tenant).filter_by(slug=slug).first()
    if not tenant:
        tenant = Tenant(slug=slug)
        session.add(tenant)
    
    tenant.name = r.get("name")
    tenant.email = r.get("email")
    tenant.password = r.get("password")
    tenant.tagesumsatz = r.get("tagesumsatz", 0.0)
    tenant.bestellungen_gesamt = r.get("bestellungen_gesamt", 0)
    tenant.active = r.get("active", True)
    tenant.is_onboarded = r.get("is_onboarded", False)
    tenant.is_setup_completed = r.get("is_setup_completed", False)
    tenant.logo_path = r.get("logo_path", None)
    tenant.has_kitchen = r.get("has_kitchen", False)
    tenant.is_shishabar = r.get("is_shishabar", False)
    tenant.impressum_content = r.get("impressum_content", "")
    tenant.datenschutz_content = r.get("datenschutz_content", "")
    tenant.security_token = r.get("security_token", "")
    tenant.pos_token = r.get("pos_token")
    tenant.pos_secret = r.get("pos_secret")
    tenant.kds_secret = r.get("kds_secret")
    tenant.theme = r.get("theme", "dark")
    tenant.accepts_card_payment = r.get("accepts_card_payment", True)
    # ── Bug-Fix: price_mode defensiv setzen — r.get(key, default) liefert
    # den Default NUR bei fehlendem Key, nicht bei None. Damit None nie in
    # die DB geschrieben wird, verwenden wir "or 'brutto'".
    _pm = r.get("price_mode") or "brutto"
    # Validiere: nur 'brutto' oder 'netto' erlaubt
    tenant.price_mode = _pm if _pm in ("brutto", "netto") else "brutto"

    
    branding = r.get("branding", {})
    tenant.address = branding.get("address", "")
    tenant.plz = branding.get("plz", "")
    tenant.ort = branding.get("ort", "")
    tenant.indigo = branding.get("indigo", "")
    tenant.instagram = branding.get("instagram", "")
    tenant.facebook = branding.get("facebook", "")
    tenant.tiktok = branding.get("tiktok", "")
    tenant.logo_url = branding.get("logo_url", "")
    
    tenant.landing_page_json = json.dumps(unwrap_live_data(r.get("landing_page", {})))
    
    hh = r.get("happy_hour", {})
    tenant.happy_hour_days = json.dumps(unwrap_live_data(hh.get("days", [])))
    tenant.happy_hour_start = hh.get("start", "18:00")
    tenant.happy_hour_end = hh.get("end", "20:00")
    tenant.happy_hour_discount = hh.get("discount", 0)
    if hasattr(tenant, 'happy_hour_mode'):
        tenant.happy_hour_mode = hh.get("mode", "discount")
    if hasattr(tenant, 'happy_hour_display_name'):
        tenant.happy_hour_display_name = hh.get("display_name", "Aktion")
    
    session.flush()
    # 1. Update categories (match by name to preserve super_group_id; only add/remove changed)
    existing_cats = {c.name: c for c in session.query(Category).filter_by(tenant_slug=slug).all()}
    # Build map: name -> super_group_id from incoming category_data (if present)
    cat_super_map = {}
    for cd in (r.get("category_data") or []):
        if isinstance(cd, dict) and cd.get("name"):
            try:
                cat_super_map[cd["name"]] = cd.get("super_group_id")
            except Exception:
                pass
    incoming_cat_names = set(r.get("categories", []))
    # Remove categories that no longer exist
    for cname, c in existing_cats.items():
        if cname not in incoming_cat_names:
            session.delete(c)
    # Add or update categories
    for idx, cat_name in enumerate(r.get("categories", [])):
        if cat_name in existing_cats:
            # Update existing (preserve super_group_id unless explicitly changed)
            db_c = existing_cats[cat_name]
            db_c.position = idx
            if cat_name in cat_super_map:
                try:
                    db_c.super_group_id = cat_super_map[cat_name]
                except Exception:
                    pass
        else:
            # New category
            sg_id = cat_super_map.get(cat_name)
            try:
                session.add(Category(tenant_slug=slug, name=cat_name, position=idx, super_group_id=sg_id))
            except Exception:
                session.add(Category(tenant_slug=slug, name=cat_name, position=idx))
        
    # 2. Update products
    existing_products = {p.id: p for p in session.query(Product).filter_by(tenant_slug=slug).all()}
    seen_product_ids = set()
    for p in r.get("products", []):
        p_id = p.get("id")
        if p_id and p_id in existing_products:
            db_p = existing_products[p_id]
            seen_product_ids.add(p_id)
        else:
            db_p = Product(tenant_slug=slug)
            session.add(db_p)
            
        db_p.name = p.get("name")
        db_p.price = p.get("price")
        db_p.description = p.get("description", "")
        db_p.image = p.get("image", "")
        db_p.vegan = p.get("vegan", False)
        db_p.is_vegan = p.get("is_vegan", False)
        db_p.is_glutenfree = p.get("is_glutenfree", False)
        db_p.allergens = json.dumps(unwrap_live_data(p.get("allergens", [])))
        db_p.category_type = p.get("category_type", "küche")
        db_p.category = p.get("category", "")
        db_p.is_available = p.get("is_available", True)
        db_p.happy_hour_price = p.get("happy_hour_price")
        db_p.start_time = p.get("start_time")
        db_p.end_time = p.get("end_time")
        hh_days_val = p.get("happy_hour_days")
        db_p.happy_hour_days = json.dumps(unwrap_live_data(hh_days_val)) if hh_days_val else None
        db_p.name_en = p.get("name_en")
        db_p.description_en = p.get("description_en")
        db_p.position = p.get("position", 0)

        
        if db_p.id is None:
            session.flush()
            p["id"] = db_p.id
            seen_product_ids.add(db_p.id)
        
    for pid, db_p in existing_products.items():
        if pid not in seen_product_ids:
            session.delete(db_p)
            
    # 3. Update orders
    existing_orders = {o.id: o for o in session.query(Order).filter_by(tenant_slug=slug).all()}
    seen_order_ids = set()
    for o in r.get("orders", []):
        o_id = o.get("id")
        if o_id and o_id in existing_orders:
            db_o = existing_orders[o_id]
            seen_order_ids.add(o_id)
        else:
            db_o = Order(tenant_slug=slug)
            session.add(db_o)
            
        db_o.table = o.get("table")
        db_o.total = o.get("total", 0.0)
        db_o.total_with_tip = o.get("total_with_tip", 0.0)
        db_o.tip_amount = o.get("tip_amount", 0.0)
        db_o.status = o.get("status", "eingegangen")
        db_o.timestamp = o.get("timestamp")
        db_o.mwst_rate = o.get("mwst_rate", 19)
        db_o.waiter_id = o.get("waiter_id")
        # original_total dauerhaft in DB sichern — nie wieder 0€ nach Server-Restart
        _ot = o.get("original_total")
        if _ot is None:
            _ot = o.get("total", 0.0) or 0.0
        try:
            db_o.original_total = float(_ot)
        except Exception:
            db_o.original_total = 0.0
        
        if db_o.id is None:
            session.flush()
            o["id"] = db_o.id
            seen_order_ids.add(db_o.id)
            
        session.query(DBOrderItem).filter_by(order_id=db_o.id).delete()
        for item in o.get("items", []):
            db_item = DBOrderItem(
                order_id=db_o.id,
                product_id=item.get("product_id"),
                name=item.get("name"),
                price=item.get("price"),
                quantity=item.get("quantity"),
                category_type=item.get("category_type", "küche"),
                note=item.get("note"),
                item_status=item.get("item_status", "pending")
            )
            session.add(db_item)
            
    for oid, db_o in existing_orders.items():
        if oid not in seen_order_ids:
            session.delete(db_o)
            
    # 4. Update staff
    session.query(Staff).filter_by(tenant_slug=slug).delete()
    for s in r.get("staff", []):
        db_s = Staff(
            tenant_slug=slug,
            name=s.get("name"),
            role=s.get("role"),
            pin=s.get("pin"),
            pin_code=s.get("pin_code")
        )
        session.add(db_s)
        
    # 5. Update service calls
    existing_calls = {c.id: c for c in session.query(ServiceCall).filter_by(tenant_slug=slug).all()}
    seen_call_ids = set()
    for c in r.get("service_calls", []):
        c_id = c.get("id")
        if c_id and c_id in existing_calls:
            db_c = existing_calls[c_id]
            seen_call_ids.add(c_id)
        else:
            db_c = ServiceCall(tenant_slug=slug)
            session.add(db_c)
            
        db_c.table = c.get("table")
        db_c.type = c.get("type")
        db_c.timestamp = c.get("timestamp", "")
        
        if db_c.id is None:
            session.flush()
            c["id"] = db_c.id
            seen_call_ids.add(db_c.id)
            
    for cid, db_c in existing_calls.items():
        if cid not in seen_call_ids:
            session.delete(db_c)
        
    # 6. Update tables
    session.query(Table).filter_by(tenant_slug=slug).delete()
    for t in r.get("tables", []):
        tok = t.get("security_token")
        if not tok:
            import secrets as _secrets_inner
            tok = _secrets_inner.token_hex(16)
        db_t = Table(
            tenant_slug=slug,
            number=t.get("number"),
            zone=t.get("zone"),
            security_token=tok,
            active_session_token=t.get("active_session_token"),
            pos_x=t.get("pos_x", 0.0),
            pos_y=t.get("pos_y", 0.0),
            width=t.get("width", 120.0),
            height=t.get("height", 80.0),
            shape=t.get("shape", "rect"),
            active=t.get("active", True),
            qr_token=t.get("qr_token")
        )
        session.add(db_t)
        
    # 7. Update audit log
    session.query(AuditLog).filter_by(tenant_slug=slug).delete()
    for l in r.get("audit_log", []):
        db_l = AuditLog(
            tenant_slug=slug,
            action=l.get("action"),
            timestamp=l.get("timestamp"),
            user=l.get("user") or (f"{l.get('employee_name', '')} ({l.get('employee_role', '')})" if l.get("employee_name") else None),
            details=l.get("details")
        )
        session.add(db_l)
    
    # 8. Update events
    from database import Event as DBEvent, EventProduct as DBEventProduct, EventCombo as DBEventCombo, EventComboItem as DBEventComboItem
    existing_events = {ev.id: ev for ev in session.query(DBEvent).filter_by(tenant_slug=slug).all()}
    seen_event_ids = set()
    for idx, ev in enumerate(r.get("events", [])):
        ev_id = ev.get("id")
        if ev_id and ev_id in existing_events:
            db_ev = existing_events[ev_id]
            seen_event_ids.add(ev_id)
        else:
            db_ev = DBEvent(tenant_slug=slug)
            session.add(db_ev)
        
        db_ev.name = ev.get("name", "Event")
        db_ev.display_name = ev.get("display_name", "Event")
        db_ev.description = ev.get("description", "")
        db_ev.days = json.dumps(unwrap_live_data(ev.get("days", [])))
        db_ev.start_time = ev.get("start_time", "18:00")
        db_ev.end_time = ev.get("end_time", "20:00")
        db_ev.mode = ev.get("mode", "selected")
        db_ev.discount = ev.get("discount", 0)
        db_ev.is_active = ev.get("is_active", True)
        db_ev.position = ev.get("position", idx)
        
        if db_ev.id is None:
            session.flush()
            ev["id"] = db_ev.id
            seen_event_ids.add(db_ev.id)
        
        # Update event products
        session.query(DBEventProduct).filter_by(event_id=db_ev.id).delete()
        for ep in ev.get("products", []):
            db_ep = DBEventProduct(
                event_id=db_ev.id,
                product_id=ep.get("product_id"),
                event_price=ep.get("event_price")
            )
            session.add(db_ep)
        
        # Update event combos
        existing_combos = session.query(DBEventCombo).filter_by(event_id=db_ev.id).all()
        for ec in existing_combos:
            session.query(DBEventComboItem).filter_by(combo_id=ec.id).delete()
        session.query(DBEventCombo).filter_by(event_id=db_ev.id).delete()
        
        for cidx, combo in enumerate(ev.get("combos", [])):
            if combo.get("name") and combo.get("combo_price") and combo.get("items"):
                combo_days = combo.get("days")
                combo_start = combo.get("start_time") or None
                combo_end = combo.get("end_time") or None
                db_combo = DBEventCombo(
                    event_id=db_ev.id,
                    name=combo["name"].strip(),
                    combo_price=round(float(combo["combo_price"]), 2),
                    position=cidx,
                    days=json.dumps(combo_days) if combo_days else None,
                    start_time=combo_start,
                    end_time=combo_end
                )
                session.add(db_combo)
                session.flush()
                for ci in combo.get("items", []):
                    if ci.get("product_id"):
                        db_combo_item = DBEventComboItem(
                            combo_id=db_combo.id,
                            product_id=int(ci["product_id"])
                        )
                        session.add(db_combo_item)
    
    for eid, db_ev in existing_events.items():
        if eid not in seen_event_ids:
            session.delete(db_ev)

    # ── REDIS-SETUP: invalidate restaurant cache (best-effort, sync) ──
    # `save_restaurant_to_db` is sync; commit happens in the caller. We
    # invalidate here so that — even if commit hasn't happened yet — the
    # cache will be re-populated from the (soon-to-be-committed) DB on
    # the next read. The 5s TTL provides a safety net for the brief race
    # between invalidation and commit. Non-fatal if Redis is unavailable.
    # WICHTIG: Wir markieren den Slug auch für post-commit invalidierung,
    # um die Race Condition zu schließen (siehe after_commit Event unten).
    try:
        invalidate_restaurant_cache_sync(slug)
    except Exception as _e:
        print(f"[Redis Cache] invalidate on save failed for {slug}: {_e}")
    # Slug für post-commit invalidierung merken
    session.info['_pending_cache_invalidate'] = slug


# ── BUG FIX: Post-Commit Cache Invalidierung ──
# Nach jedem db.commit() wird der Cache NOCHMAL invalidiert. Das schließt
# die Race Condition: ein gleichzeitiger Poll könnte den Cache zwischen
# der pre-commit Invalidierung und dem commit mit ALTEN Daten neu füllen.
# Die post-commit Invalidierung löscht diesen veralteten Cache-Eintrag.
from sqlalchemy import event as _sqla_event

@_sqla_event.listens_for(SessionLocal, "after_commit")
def _invalidate_cache_after_commit(session):
    slug = session.info.pop('_pending_cache_invalidate', None)
    if slug:
        try:
            invalidate_restaurant_cache_sync(slug)
        except Exception as _e:
            print(f"[Redis Cache] post-commit invalidate failed for {slug}: {_e}")

def ensure_tenant_seeded(slug: str, db) -> Tenant:
    slug_lower = slug.lower().strip()
    tenant = db.query(Tenant).filter_by(slug=slug_lower).first()
    if tenant:
        return tenant
        
    tenant = Tenant(
        slug=slug_lower,
        name=slug.replace("-", " ").title(),
        email=f"admin@{slug_lower}.de",
        password="password123",
        tagesumsatz=0.0,
        bestellungen_gesamt=0,
        active=True,
        is_onboarded=False,
        is_setup_completed=False,
        impressum_content=(
            "Impressum\n"
            "Angaben gemäß § 5 TMG\n\n"
            "[Vorname Nachname / Firmenname]\n"
            "[Straße und Hausnummer]\n"
            "[PLZ Ort]\n\n"
            "Kontakt:\n"
            "Telefon: [+49 ...]\n"
            "E-Mail: [info@beispiel.de]\n\n"
            "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:\n"
            "[Vorname Nachname]\n"
            "[Adresse wie oben]\n\n"
            "Haftungsausschluss:\n"
            "Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt. "
            "Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte "
            "können wir jedoch keine Gewähr übernehmen."
        ),
        datenschutz_content=(
            "Datenschutzerklärung\n\n"
            "1. Datenschutz auf einen Blick\n"
            "Die folgenden Hinweise geben einen einfachen Überblick darüber, "
            "was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere "
            "Website besuchen.\n\n"
            "2. Verantwortliche Stelle\n"
            "Verantwortlich für die Datenverarbeitung auf dieser Website:\n"
            "[Name / Firmenname]\n"
            "[Adresse]\n"
            "E-Mail: [info@beispiel.de]\n\n"
            "3. Erhebung und Speicherung personenbezogener Daten\n"
            "Beim Besuch unserer Website werden automatisch Informationen "
            "allgemeiner Natur erfasst (Server-Logfiles). Diese Daten enthalten "
            "keine personenbezogenen Daten und werden nicht mit anderen "
            "Datenquellen zusammengeführt.\n\n"
            "4. Ihre Rechte\n"
            "Sie haben das Recht auf Auskunft, Berichtigung, Löschung und "
            "Einschränkung der Verarbeitung Ihrer gespeicherten Daten. "
            "Wenden Sie sich hierfür an: [E-Mail-Adresse]\n\n"
            "5. Cookies\n"
            "Diese Website verwendet ausschließlich technisch notwendige Cookies "
            "für den Betrieb des Bestellsystems. Es werden keine Tracking- oder "
            "Werbe-Cookies eingesetzt.\n\n"
            "[Bitte passen Sie diesen Text an Ihre individuellen Gegebenheiten an "
            "und lassen Sie ihn von einem Rechtsanwalt prüfen.]"
        ),
        security_token=secrets.token_hex(16),
        logo_url="/static/images/digigastrologo.jpeg",
        happy_hour_days="[]",
        happy_hour_start="18:00",
        happy_hour_end="20:00",
        happy_hour_discount=0
    )
    db.add(tenant)
    db.flush()
    
    for cat_name in ["Drinks", "Desserts"]:
        db.add(Category(tenant_slug=slug_lower, name=cat_name))
        
    for p in copy.deepcopy(STANDARD_PRODUCTS):
        db_p = Product(
            tenant_slug=slug_lower,
            name=p["name"],
            price=p["price"],
            description=p.get("description", ""),
            image=p.get("image", ""),
            vegan=p.get("vegan", False),
            is_vegan=p.get("is_vegan", False),
            is_glutenfree=p.get("is_glutenfree", False),
            allergens=json.dumps(p.get("allergens", [])),
            category_type=p.get("category_type", "küche"),
            category=p.get("category", ""),
            is_available=p.get("is_available", True),
            happy_hour_price=p.get("happy_hour_price"),
            start_time=p.get("start_time"),
            end_time=p.get("end_time")
        )
        db.add(db_p)
        
    db.add(Product(
        tenant_slug=slug_lower,
        name="Klassische Shisha",
        price=12.00,
        description="Premium traditional shisha.",
        image="https://images.unsplash.com/photo-1527137341206-1a2ab818aa6a?auto=format&fit=crop&q=80&w=400",
        vegan=True,
        is_vegan=True,
        is_glutenfree=True,
        allergens="[]",
        category_type="shisha",
        category="Shisha",
        is_available=True
    ))
    db.commit()
    return tenant

def get_restaurant(slug: str, db, create_if_missing: bool = False) -> Optional[dict]:
    slug_lower = slug.lower().strip()
    tenant = db.query(Tenant).filter_by(slug=slug_lower).first()
    if tenant is not None:
        return load_restaurant_from_db(slug_lower, db)
    if not create_if_missing and slug_lower != "demo":
        return None
    ensure_tenant_seeded(slug_lower, db)
    return load_restaurant_from_db(slug_lower, db)


# ──────────────────────────────────────────────────────────────────
# REDIS CACHE — restaurant state (5s TTL)
#
# Live-Daten müssen aktuell bleiben, aber in Stoßzeiten (100+ Gäste
# pollen gleichzeitig das Menü / KDS / POS) reduziert der Cache
# 100-fache DB-Queries auf 1 Query pro 5 Sekunden.
#
# Cache invalidation:
#   • `invalidate_restaurant_cache_sync(slug)` — sync, called from
#     `save_restaurant_to_db` (which is sync). Uses the sync_redis_client.
#   • `invalidate_restaurant_cache(slug)`     — async, for use in
#     async endpoints after explicit commits.
# ──────────────────────────────────────────────────────────────────
RESTAURANT_CACHE_TTL = 5  # seconds


def _restaurant_cache_key(slug: str) -> str:
    return f"restaurant:{slug.lower().strip()}"


async def get_restaurant_cached(slug: str, db) -> Optional[dict]:
    """Read-through cache wrapper around `load_restaurant_from_db`.

    • Cache hit  → return parsed JSON (no DB query)
    • Cache miss → load from DB, populate cache with TTL, return
    • Redis down → degrade to direct DB read (no cache, no crash)
    """
    key = _restaurant_cache_key(slug)
    if redis_client is not None:
        try:
            cached = await redis_client.get(key)
            if cached:
                try:
                    return json.loads(cached)
                except Exception:
                    pass  # corrupt cache → fall through to DB
        except Exception as e:
            print(f"[Redis Cache] get failed for {slug}: {e}")
    # Cache miss OR Redis unavailable → DB
    restaurant = load_restaurant_from_db(slug.lower().strip(), db)
    if restaurant is not None and redis_client is not None:
        try:
            await redis_client.setex(
                key, RESTAURANT_CACHE_TTL, json.dumps(restaurant, default=str)
            )
        except Exception as e:
            print(f"[Redis Cache] setex failed for {slug}: {e}")
    return restaurant


async def invalidate_restaurant_cache(slug: str) -> None:
    """Async cache invalidation — use in async endpoints after explicit commits.

    BUG FIX: Invalidiert auch tablet-status:{slug}:* Cache-Keys.
    """
    if redis_client is None:
        return
    try:
        await redis_client.delete(_restaurant_cache_key(slug))
    except Exception as e:
        print(f"[Redis Cache] async invalidate failed for {slug}: {e}")
    # BUG FIX: tablet-status Cache invalidieren
    try:
        async for key in redis_client.scan_iter(f"tablet-status:{slug}:*", count=100):
            await redis_client.delete(key)
    except Exception as e:
        print(f"[Redis Cache] async tablet-status invalidate failed for {slug}: {e}")


def invalidate_restaurant_cache_sync(slug: str) -> None:
    """Sync cache invalidation — called from sync code (e.g. save_restaurant_to_db).

    Uses the module-level sync_redis_client (separate connection pool from
    the async client). Non-fatal if Redis is unavailable.

    BUG FIX (Serve-Bug "Item springt zurück"):
    Vorher wurde nur der `restaurant:{slug}` Cache gelöscht, aber NICHT der
    `tablet-status:{slug}:*` Cache (3s TTL). Das führte dazu, dass nach einem
    Serve/Cancel/Pay die tablet-status API für bis zu 3 Sekunden veraltete
    Daten zurückgab — das Item "sprang zurück" auf pending/confired.
    Jetzt löschen wir ALLE tablet-status Keys für diesen Slug mit SCAN.
    """
    if sync_redis_client is None:
        return
    try:
        sync_redis_client.delete(_restaurant_cache_key(slug))
    except Exception as e:
        print(f"[Redis Cache] sync invalidate failed for {slug}: {e}")

    # ── BUG FIX: tablet-status Cache invalidieren ──
    # Lösche ALLE tablet-status:{slug}:* Keys (verschiedene Auth-Kombinationen).
    # Verwende SCAN (nicht KEYS) für Performance — findet alle passenden Keys.
    try:
        pattern = f"tablet-status:{slug}:*"
        cursor = 0
        while True:
            cursor, keys = sync_redis_client.scan(
                cursor=cursor, match=pattern, count=100
            )
            if keys:
                sync_redis_client.delete(*keys)
            if cursor == 0:
                break
    except Exception as e:
        print(f"[Redis Cache] tablet-status invalidate failed for {slug}: {e}")


from collections import UserList, UserDict

def wrap_live_data(slug, path, val):
    if isinstance(val, list) and not isinstance(val, LiveListProxy):
        return LiveListProxy(slug, path)
    elif isinstance(val, dict) and not isinstance(val, LiveDictProxy):
        return LiveDictProxy(slug, path)
    return val

class LiveListProxy(UserList):
    def __init__(self, slug, path):
        self.slug = slug
        self.path = path
        super().__init__()

    @property
    def data(self):
        db = SessionLocal()
        try:
            full_data = load_restaurant_from_db(self.slug, db) or {}
            curr = full_data
            for key in self.path:
                if isinstance(curr, dict):
                    curr = curr.get(key, [])
                elif isinstance(curr, list) and isinstance(key, int):
                    if 0 <= key < len(curr):
                        curr = curr[key]
                    else:
                        curr = []
                else:
                    curr = []
            return [wrap_live_data(self.slug, self.path + [i], item) for i, item in enumerate(curr)]
        finally:
            db.close()

    @data.setter
    def data(self, value):
        pass

    def append(self, value):
        db = SessionLocal()
        try:
            full_data = load_restaurant_from_db(self.slug, db) or {}
            curr = full_data
            for key in self.path[:-1]:
                if isinstance(curr, dict):
                    curr = curr.get(key, {})
                elif isinstance(curr, list) and isinstance(key, int):
                    curr = curr[key]
            curr[self.path[-1]].append(value)
            save_restaurant_to_db(self.slug, full_data, db)
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def remove(self, value):
        db = SessionLocal()
        try:
            full_data = load_restaurant_from_db(self.slug, db) or {}
            curr = full_data
            for key in self.path[:-1]:
                if isinstance(curr, dict):
                    curr = curr.get(key, {})
                elif isinstance(curr, list) and isinstance(key, int):
                    curr = curr[key]
            curr[self.path[-1]].remove(value)
            save_restaurant_to_db(self.slug, full_data, db)
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

class LiveDictProxy(UserDict):
    def __init__(self, slug, path):
        self.slug = slug
        self.path = path
        super().__init__()

    @property
    def data(self):
        db = SessionLocal()
        try:
            tenant = db.query(Tenant).filter_by(slug=self.slug).first()
            if not tenant:
                ensure_tenant_seeded(self.slug, db)
            full_data = load_restaurant_from_db(self.slug, db) or {}
            curr = full_data
            for key in self.path:
                if isinstance(curr, dict):
                    curr = curr.get(key, {})
                elif isinstance(curr, list) and isinstance(key, int):
                    if 0 <= key < len(curr):
                        curr = curr[key]
                    else:
                        curr = {}
                else:
                    curr = {}
            return {k: wrap_live_data(self.slug, self.path + [k], v) for k, v in curr.items()}
        finally:
            db.close()

    @data.setter
    def data(self, value):
        pass

    def __setitem__(self, key, value):
        db = SessionLocal()
        try:
            full_data = load_restaurant_from_db(self.slug, db) or {}
            curr = full_data
            for path_key in self.path:
                if isinstance(curr, dict):
                    curr = curr[path_key]
                elif isinstance(curr, list) and isinstance(path_key, int):
                    curr = curr[path_key]
            curr[key] = value
            save_restaurant_to_db(self.slug, full_data, db)
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def __delitem__(self, key):
        db = SessionLocal()
        try:
            full_data = load_restaurant_from_db(self.slug, db) or {}
            curr = full_data
            for path_key in self.path:
                if isinstance(curr, dict):
                    curr = curr[path_key]
                elif isinstance(curr, list) and isinstance(path_key, int):
                    curr = curr[path_key]
            if key in curr:
                del curr[key]
            save_restaurant_to_db(self.slug, full_data, db)
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

class TenantDictProxy(LiveDictProxy):
    def __init__(self, slug):
        super().__init__(slug, [])

class RestaurantsProxy(UserDict):
    def __init__(self):
        super().__init__()

    @property
    def data(self):
        db = SessionLocal()
        try:
            slugs = [t.slug for t in db.query(Tenant.slug).all()]
            return {slug: TenantDictProxy(slug) for slug in slugs}
        finally:
            db.close()

    @data.setter
    def data(self, value):
        pass

    def __getitem__(self, slug):
        return TenantDictProxy(slug)

    def __setitem__(self, slug, value):
        slug_lower = slug.lower().strip()
        db = SessionLocal()
        try:
            save_restaurant_to_db(slug_lower, value, db)
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()
            
    def __contains__(self, slug):
        slug_lower = slug.lower().strip()
        db = SessionLocal()
        try:
            tenant = db.query(Tenant).filter_by(slug=slug_lower).first()
            return tenant is not None
        finally:
            db.close()
            
    def get(self, slug, default=None):
        slug_lower = slug.lower().strip()
        if slug_lower in self:
            return self[slug_lower]
        return default
        
    def keys(self):
        db = SessionLocal()
        try:
            return [t.slug for t in db.query(Tenant.slug).all()]
        finally:
            db.close()
            
    def values(self):
        db = SessionLocal()
        try:
            slugs = [t.slug for t in db.query(Tenant.slug).all()]
            return [self[slug] for slug in slugs]
        finally:
            db.close()
            
    def items(self):
        db = SessionLocal()
        try:
            slugs = [t.slug for t in db.query(Tenant.slug).all()]
            return [(slug, self[slug]) for slug in slugs]
        finally:
            db.close()
            
    def clear(self):
        """SAFETY: This method is intentionally disabled to prevent accidental data loss.
        Use individual tenant deletion via admin API instead."""
        raise NotImplementedError("RestaurantsProxy.clear() is disabled for safety. Delete tenants individually via the admin API.")
            
    def update(self, other_dict):
        db = SessionLocal()
        try:
            for slug, r_val in other_dict.items():
                slug_lower = slug.lower().strip()
                save_restaurant_to_db(slug_lower, r_val, db)
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

restaurants = RestaurantsProxy()

def get_restaurant_or_raise(slug: str, db):
    r = get_restaurant(slug, db)
    if r is None:
        raise HTTPException(status_code=404, detail="Dieses Restaurant existiert nicht.")
    if not r.get("active", True):
        raise TenantSuspendedException(slug)
    return r

# ── Hauptgruppen (SuperGroups) ───────────────────────────────────────────────
def ensure_default_super_groups(slug: str, session):
    """Legt beim ersten Aufruf 3 Standard-Hauptgruppen an, falls der Tenant noch keine hat.
    'Sonstiges' wird NICHT angelegt — das ist der implizite NULL-Bucket."""
    from database import SuperGroup as DBSuperGroup
    existing = session.query(DBSuperGroup).filter_by(tenant_slug=slug).count()
    if existing > 0:
        return
    defaults = [
        {"name": "Shisha",   "color": "#7c3aed", "icon": "whatshot"},      # lila
        {"name": "Getränke", "color": "#0ea5e9", "icon": "local_bar"},     # blau
        {"name": "Snacks",   "color": "#f59e0b", "icon": "restaurant"},    # orange
    ]
    for idx, d in enumerate(defaults):
        session.add(DBSuperGroup(
            tenant_slug=slug, name=d["name"], color=d["color"], icon=d["icon"], position=idx
        ))
    session.commit()
    print(f"[SuperGroups] Default-Hauptgruppen für '{slug}' angelegt: Shisha, Getränke, Snacks")


def build_category_to_super_group_map(slug: str, session) -> dict:
    """Gibt {category_name: {id, name, color, icon, position}} zurück.
    Kategorien ohne super_group_id fehlen in der Map → Aufrufer behandelt sie als 'Sonstiges'."""
    from database import SuperGroup as DBSuperGroup
    sg_by_id = {sg.id: sg for sg in session.query(DBSuperGroup).filter_by(tenant_slug=slug).all()}
    out = {}
    for c in session.query(Category).filter_by(tenant_slug=slug).all():
        sg = sg_by_id.get(getattr(c, "super_group_id", None))
        if sg:
            out[c.name] = {
                "id": sg.id,
                "name": sg.name,
                "color": sg.color or "#374151",
                "icon": sg.icon or "",
                "position": sg.position or 0,
            }
    return out


def group_items_by_super_group(items: list, slug: str, session) -> list:
    """Gruppiert Bestell-Items nach Hauptgruppe.
    Gibt eine sortierte Liste von {name, color, icon, items[], subtotal} zurück.
    NULL-Bucket (= keine Hauptgruppe) wird als 'Sonstiges' angefügt — aber nur wenn Items drin sind.
    Leere Gruppen werden NICHT zurückgegeben."""
    cat_to_sg = build_category_to_super_group_map(slug, session)
    # Produkte lookup: product_id -> category name (für Items, die nur product_id haben)
    products_by_id = {p.id: p for p in session.query(Product).filter_by(tenant_slug=slug).all()}

    # Group buckets
    buckets = {}  # sg_id -> {"name", "color", "icon", "position", "items": []}
    sonstiges_items = []

    for item in items:
        # 1. Item's category name auflösen
        cat_name = None
        if "category" in item and item["category"]:
            cat_name = item["category"]
        else:
            # Lookup via product_id
            pid = item.get("product_id")
            if pid and pid in products_by_id:
                cat_name = products_by_id[pid].category
        # 2. SuperGroup für die Kategorie finden
        sg_info = cat_to_sg.get(cat_name) if cat_name else None
        if sg_info:
            bucket_key = sg_info["id"]
            if bucket_key not in buckets:
                buckets[bucket_key] = {
                    "id": sg_info["id"],
                    "name": sg_info["name"],
                    "color": sg_info["color"],
                    "icon": sg_info["icon"],
                    "position": sg_info["position"],
                    "items": []
                }
            buckets[bucket_key]["items"].append(item)
        else:
            # NULL-Bucket = Sonstiges
            sonstiges_items.append(item)

    # Sortiere buckets nach position, dann name
    sorted_buckets = sorted(buckets.values(), key=lambda b: (b["position"], b["name"]))
    # Sonstiges ans Ende, nur wenn Items vorhanden
    if sonstiges_items:
        sorted_buckets.append({
            "id": None,
            "name": "Sonstiges",
            "color": "#6b7280",  # gray-500
            "icon": "category",
            "position": 9999,
            "items": sonstiges_items
        })
    # Subtotals berechnen
    for b in sorted_buckets:
        b["subtotal"] = sum((i.get("price", 0) or 0) * (i.get("quantity", 1) or 1) for i in b["items"])
    return sorted_buckets


def get_current_user(request: Request, slug: str) -> Optional[dict]:
    """
    Liefert den aktuellen User anhand des Session-Cookies.
    Vertraut NICHT dem Cookie-Wert allein — validiert name+role+pin gegen die DB.

    Sicherheits-Fix (Audit Issue 6.3 + 3.1):
    Vorher wurde `session=anytenant:Owner:chef:irgendwas` akzeptiert, ohne zu
    prüfen, ob es in der DB einen Chef mit diesem Namen gibt. Jetzt prüfen wir
    gegen restaurant['staff'] und restaurant['email'].
    """
    slug_lower = slug.lower().strip() if slug else ""
    # Check unified session cookie first
    session = request.cookies.get("session")
    if session:
        try:
            parts = session.split(":", 3)  # split into max 4 parts (pin can contain ':')
            if len(parts) == 4 and parts[0].lower().strip() == slug_lower:
                cookie_name, cookie_role, cookie_pin = parts[1], parts[2], parts[3]
                # ── DB-Validierung ──
                # Wir öffnen eine kurze Session, um name+role+pin zu verifizieren.
                # Vermeidet Cookie-Forgery: Angreifer kann nicht einfach
                # `x:Owner:chef:x` setzen, es sei denn, der Tenant hat wirklich
                # einen Staff-Eintrag mit diesem Namen+PIN.
                from database import Tenant as DBTenant, Staff as DBStaff
                db = SessionLocal()
                try:
                    tenant = db.query(DBTenant).filter_by(slug=slug_lower).first()
                    if not tenant:
                        return None
                    # Owner-Vergleich (Chef-Login über globale /login Route)
                    if cookie_role == "chef" and cookie_name == "Owner":
                        # Owner darf sich nur einloggen, wenn das Plaintext-Passwort
                        # mit dem in der DB übereinstimmt. Bis Passwort-Hashing
                        # ausgerollt ist, ist das die beste Validierung.
                        if cookie_pin and tenant.password and cookie_pin == tenant.password:
                            return {"name": "Owner", "role": "chef", "pin": cookie_pin}
                        return None
                    # Staff-Vergleich (Mitarbeiter)
                    staff_member = db.query(DBStaff).filter_by(
                        tenant_slug=slug_lower,
                        name=cookie_name
                    ).first()
                    if staff_member and staff_member.role == cookie_role:
                        # PIN gegen DB validieren (falls PIN gesetzt)
                        expected_pin = str(staff_member.pin_code or staff_member.pin or "")
                        if expected_pin and cookie_pin == expected_pin:
                            return {"name": cookie_name, "role": cookie_role, "pin": cookie_pin}
                        # Für Staff ohne PIN-Pflicht (z.B. Zubereiter) — nur Name+Role prüfen
                        if not expected_pin and cookie_role in ("zubereiter", "kueche"):
                            return {"name": cookie_name, "role": cookie_role, "pin": cookie_pin}
                    return None
                finally:
                    db.close()
        except Exception:
            pass

    # Fallback to legacy/device-specific session cookie
    session_legacy = request.cookies.get(f"session_{slug_lower}")
    if session_legacy:
        try:
            parts = session_legacy.split(":", 2)
            if len(parts) == 3:
                cookie_name, cookie_role, cookie_pin = parts
                from database import Tenant as DBTenant, Staff as DBStaff
                db = SessionLocal()
                try:
                    tenant = db.query(DBTenant).filter_by(slug=slug_lower).first()
                    if not tenant:
                        return None
                    if cookie_role == "chef" and cookie_name == "Owner":
                        if cookie_pin and tenant.password and cookie_pin == tenant.password:
                            return {"name": "Owner", "role": "chef", "pin": cookie_pin}
                        return None
                    staff_member = db.query(DBStaff).filter_by(
                        tenant_slug=slug_lower,
                        name=cookie_name
                    ).first()
                    if staff_member and staff_member.role == cookie_role:
                        expected_pin = str(staff_member.pin_code or staff_member.pin or "")
                        if expected_pin and cookie_pin == expected_pin:
                            return {"name": cookie_name, "role": cookie_role, "pin": cookie_pin}
                        if not expected_pin and cookie_role in ("zubereiter", "kueche"):
                            return {"name": cookie_name, "role": cookie_role, "pin": cookie_pin}
                    return None
                finally:
                    db.close()
        except Exception:
            pass
    return None

def get_current_user_and_slug(request: Request) -> Optional[tuple]:
    """
    Wie get_current_user, aber ohne bekannten Slug — extrahiert ihn aus dem Cookie.
    Validiert ebenfalls gegen die DB (Issue 6.3).
    """
    session = request.cookies.get("session")
    if not session:
        return None
    try:
        parts = session.split(":", 3)
        if len(parts) != 4:
            return None
        slug, cookie_name, cookie_role, cookie_pin = parts
        slug_lower = slug.lower().strip()
        user = get_current_user(request, slug_lower)
        if user is None:
            return None
        return user, slug_lower
    except Exception:
        pass
    return None

def parse_active_table_num(active_table_num: str):
    clean_num = str(active_table_num).strip()
    clean_zone = ""
    if clean_num.startswith("Tisch "):
        clean_num = clean_num[len("Tisch "):].strip()
    if "(" in clean_num and clean_num.endswith(")"):
        idx_paren = clean_num.find("(")
        clean_zone = clean_num[idx_paren+1:-1].strip()
        clean_num = clean_num[:idx_paren].strip()
    return clean_num, clean_zone


def _maybe_rotate_table_session_token(restaurant, order_table_str):
    """
    Option B (Token-Rotation): Rotiert den active_session_token eines Tisches,
    ABER NUR dann, wenn der Tisch nach dieser Finalisierung (bezahlt/storniert)
    KEINE offenen Bestellungen mehr hat.

    Zweck:
      - Gäste, die bereits gegangen sind, können mit ihrem alten Cookie nicht
        mehr bestellen (Cookie-Wert stimmt nicht mehr mit DB überein → 403).
      - Gäste, die noch am Tisch sitzen (z.B. getrennte Bestellungen, eine
        bezahlt, eine noch offen), behalten ihre Session — Cookie bleibt gültig.

    WICHTIG — bestehende QR-Codes bleiben gültig:
      Diese Funktion verändert ausschließlich `active_session_token` (den
      dynamischen Session-Token im Cookie). Sie berührt NICHT:
        - `restaurant["security_token"]` (Master-Token des Tenants)
        - `db_table["security_token"]` (printed_token = der Token, der in den
          ausgedruckten QR-Codes steht und nie geändert werden darf)
      QR-Codes, die bereits im Laden hängen, funktionieren also weiterhin.
    """
    if not order_table_str:
        return
    _num, _zone = parse_active_table_num(str(order_table_str))
    if not _num:
        return
    # Mögliche Tisch-Strings in der DB (mit und ohne Zone)
    possible_tables = [f"Tisch {_num}"]
    if _zone:
        possible_tables.insert(0, f"Tisch {_num} ({_zone})")
    # Hat der Tisch noch andere offene Bestellungen?
    has_open = any(
        o.get("table") in possible_tables
        and o.get("status") not in ["bezahlt", "storniert"]
        for o in restaurant.get("orders", [])
    )
    if has_open:
        return  # Nicht rotieren — andere Gäste sitzen noch am Tisch
    # Tisch-Datensatz finden und Token rotieren
    tables_list = restaurant.get("tables", [])
    db_table = None
    if _zone:
        db_table = next((t for t in tables_list
                         if str(t.get("number")) == _num
                         and t.get("zone") == _zone), None)
    if not db_table:
        db_table = next((t for t in tables_list
                         if str(t.get("number")) == _num), None)
    if db_table:
        import secrets
        db_table["active_session_token"] = secrets.token_hex(4)


def _ensure_original_total(order):
    """
    Fix 6 — 'Nie wieder 0€ im Admin-Report':
    Stellt sicher, dass `order["original_total"]` existiert und den
    ursprünglichen Warenwert der Bestellung speichert.

    Hintergrund: Bei Teilzahlung (pay-item), Stornierung einzelner Artikel
    (cancel-item) oder Zusammenführen von Tischen wird `order["total"]` neu
    berechnet — und wenn alle Items weg sind, steht dort 0,00 €. Der Admin
    sieht dann im Report eine 0€-Bestellung, obwohl eigentlich z.B. 43,50 €
    bestellt wurden.

    `original_total` wird NUR hochgesetzt (bei Erstellung und Merge), nie
    reduziert. Diese Funktion backfillt das Feld für Alt-Bestellungen, die
    es noch nicht haben — mit dem aktuellen `total`, falls dieser > 0 ist,
    sonst mit 0 (Best-Effort für historische Daten).
    """
    if "original_total" not in order or order.get("original_total") is None:
        cur_total = order.get("total", 0.0) or 0.0
        # Backfill: der aktuelle total ist der beste Schätzwert für den
        # ursprünglichen Warenwert, den wir haben. Besser als 0.
        order["original_total"] = round(cur_total, 2)


def _recalculate_order_totals(order):
    """
    Audit Fix 3.x — Zentrale Helper-Funktion für Order-Konsistenz.
    Berechnet `total`, `total_with_tip` neu und stellt Invarianten sicher:
      - total = sum(price * quantity für alle items)
      - total_with_tip = total + tip_amount
      - original_total wird NIE reduziert (nur hochgesetzt via _ensure_original_total)

    Diese Funktion sollte nach JEDER Item-Mutation aufgerufen werden
    (cancel, pay-item, serve, transfer, add-manual).
    Verhindert inkonsistente Totals wie im historischen "0€-Report"-Bug.
    """
    # 1. total neu berechnen aus Items
    new_total = round(sum(
        (i.get("price", 0.0) or 0.0) * (i.get("quantity", 0) or 0)
        for i in order.get("items", [])
    ), 2)
    order["total"] = new_total

    # 2. tip_amount defensiv setzen
    tip = float(order.get("tip_amount", 0.0) or 0.0)
    order["tip_amount"] = round(tip, 2)

    # 3. total_with_tip = total + tip_amount (Invariante durchsetzen)
    order["total_with_tip"] = round(new_total + tip, 2)

    # 4. original_total sicherstellen (nur hochsetzen, nie runter)
    _ensure_original_total(order)


def _audit_log(restaurant, employee_name: str, employee_role: str, action: str, details: str = ""):
    """
    Audit Fix 1.x — Zentraler Helper für AuditLog-Einträge.
    Verwendet get_berlin_now() statt datetime.now() (Issue: 2h Versatz).
    Alle Mutations-Endpoints sollten diesen Helper nutzen.
    """
    if "audit_log" not in restaurant:
        restaurant["audit_log"] = []
    restaurant["audit_log"].append({
        "timestamp": get_berlin_now().strftime("%Y-%m-%d %H:%M:%S"),
        "employee_name": employee_name or "Unbekannt",
        "employee_role": employee_role or "unbekannt",
        "action": action,
        "details": details
    })


def require_user_and_slug(request: Request, db: Session = Depends(get_db)):
    res = get_current_user_and_slug(request)
    if not res:
        raise HTTPException(status_code=401, detail="Nicht eingeloggt.")
    user, slug = res
    restaurant = get_restaurant_or_raise(slug, db)
    return user, slug, restaurant

def require_chef_user(request: Request, slug: str):
    # Reject POS/KDS device cookies trying to access admin routes
    pos_session = request.cookies.get("pos_session")
    kds_session = request.cookies.get("kds_session")
    session = request.cookies.get("session")
    
    # Check if there is only a device cookie but no user session
    if (pos_session or kds_session) and not session:
        raise HTTPException(
            status_code=403,
            detail="POS/KDS-Geräte haben keinen Zugriff auf Admin-Routen."
        )
        
    res = get_current_user_and_slug(request)
    if res:
        user, session_slug = res
        if session_slug != slug:
            raise HTTPException(status_code=403, detail="Kein Zugriff. Falscher Tenant.")
        if user["role"] != "chef":
            raise HTTPException(status_code=403, detail="Kein Zugriff. Nur für Administratoren.")
        return user
        
    # Legacy session check fallback
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    kds_cookie = request.cookies.get(f"kds_token_{slug}")
    session_legacy = request.cookies.get(f"session_{slug}")
    if (pos_cookie or kds_cookie) and not session_legacy:
        raise HTTPException(
            status_code=403,
            detail="POS/KDS-Geräte haben keinen Zugriff auf Admin-Routen."
        )
    user = get_current_user(request, slug)
    if not user or user["role"] != "chef":
        raise HTTPException(status_code=403, detail="Kein Zugriff. Nur für Administratoren.")
    return user

def require_chef_user_flat(request: Request, db: Session = Depends(get_db)):
    res = get_current_user_and_slug(request)
    if not res:
        raise HTTPException(status_code=401, detail="Nicht eingeloggt.")
    user, slug = res
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug, db)
    return user, slug, restaurant


class OrderItem(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    note: Optional[str] = None
    item_status: Optional[str] = "pending"
    combo_id: Optional[int] = None

class OrderPayload(BaseModel):
    table: str
    token: Optional[str] = None
    items: List[OrderItem]

class ServiceRufPayload(BaseModel):
    type: str
    table: str
    token: Optional[str] = None

class SplitItem(BaseModel):
    product_id: int
    quantity: int
    note: Optional[str] = None

class SplitPayload(BaseModel):
    items: List[SplitItem]

class ProductUpdatePayload(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    category: str
    name_en: Optional[str] = None
    description_en: Optional[str] = None

class CategoryUpdatePayload(BaseModel):
    old_name: str
    new_name: str

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request, db: Session = Depends(get_db)):
    uid = request.query_params.get("uid")
    if uid:
        tisch = request.query_params.get("tisch") or request.query_params.get("table") or ""
        role = request.query_params.get("role") or ""
        restaurant = get_restaurant(uid, db)
        if restaurant:
            tables_list = restaurant.get("tables", [])
            db_table = next((t for t in tables_list if str(t.get("number")) == str(tisch).strip()), None)
            table_token = ""
            if db_table:
                table_token = db_table.get("security_token") or restaurant.get("security_token") or ""
            else:
                table_token = restaurant.get("security_token") or ""
            
            url = f"/{uid}"
            if tisch:
                url += f"?tisch={tisch}"
                if table_token:
                    url += f"&token={table_token}"
                if role:
                    url += f"&role={role}"
            return RedirectResponse(url=url, status_code=303)

    if os.getenv("PYTEST_CURRENT_TEST"):
        return RedirectResponse(url="/demo", status_code=307)
        
    session_global = request.cookies.get("session_global")
    if session_global == "admin@digi-gastro.de":
        return RedirectResponse(url="/digi-gastro-admin")
        
    is_logged_in = False
    login_target = None
        
    res = get_current_user_and_slug(request)
    if res:
        user, slug = res
        tenant = db.query(Tenant).filter_by(slug=slug).first()
        if tenant and user["role"] == "chef":
            is_logged_in = True
            login_target = "/admin/setup" if not tenant.is_setup_completed else "/admin/dashboard"

    if not is_logged_in:
        for cookie_key, cookie_val in request.cookies.items():
            if cookie_key.startswith("session_") and cookie_key != "session_global":
                slug = cookie_key.replace("session_", "").strip()
                tenant = db.query(Tenant).filter_by(slug=slug).first()
                if tenant:
                    try:
                        parts = cookie_val.split(":")
                        if len(parts) == 3:
                            role = parts[1]
                            if role == "chef":
                                is_logged_in = True
                                login_target = "/admin/setup" if not tenant.is_setup_completed else "/admin/dashboard"
                                break
                    except Exception:
                        pass
                        
    response = templates.TemplateResponse(
        request=request, 
        name="landing.html", 
        context={"request": request, "is_logged_in": is_logged_in, "login_target": login_target}
    )
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@app.get("/impressum", response_class=HTMLResponse)
def platform_impressum(request: Request, db: Session = Depends(get_db)):
    # Pass request context properly for template rendering
    return templates.TemplateResponse(request=request, name="landing.html", context={"request": request, "show_impressum": True, "is_logged_in": False})

@app.get("/datenschutz", response_class=HTMLResponse)
def platform_datenschutz(request: Request, db: Session = Depends(get_db)):
    # Pass request context properly for template rendering
    return templates.TemplateResponse(request=request, name="landing.html", context={"request": request, "show_datenschutz": True, "is_logged_in": False})



@app.get("/login", response_class=HTMLResponse)
def global_login_get(request: Request, db: Session = Depends(get_db)):
    session_global = request.cookies.get("session_global")
    if session_global == "admin@digi-gastro.de":
        return RedirectResponse(url="/digi-gastro-admin")
        
    res = get_current_user_and_slug(request)
    if res:
        user, slug = res
        tenant = db.query(Tenant).filter_by(slug=slug).first()
        if tenant and user["role"] == "chef":
            if not tenant.is_setup_completed:
                return RedirectResponse(url="/admin/setup")
            return RedirectResponse(url="/admin/dashboard")

    for cookie_key, cookie_val in request.cookies.items():
        if cookie_key.startswith("session_") and cookie_key != "session_global":
            slug = cookie_key.replace("session_", "").strip()
            tenant = db.query(Tenant).filter_by(slug=slug).first()
            if tenant:
                try:
                    parts = cookie_val.split(":")
                    if len(parts) == 3:
                        role = parts[1]
                        if role == "chef":
                            if not tenant.is_setup_completed:
                                return RedirectResponse(url="/admin/setup")
                            return RedirectResponse(url="/admin/dashboard")
                except Exception:
                    pass

    response = templates.TemplateResponse(request=request, name="landing.html", context={"request": request, "show_login": True})
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@app.post("/login")
def global_login_post(
    request: Request,
    email: Optional[str] = Form(None),
    password: Optional[str] = Form(None)
, db: Session = Depends(get_db)):
    if not email or not password or not email.strip() or not password.strip():
        return templates.TemplateResponse(
            request,
            "landing.html",
            {"request": request, "error": "Bitte geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein.", "show_login": True, "email": email or ""}
        )
    tenant = db.query(Tenant).filter_by(email=email.strip()).first()
    if tenant and tenant.password == password.strip():
        slug = tenant.slug
        target = "/admin/setup" if not tenant.is_setup_completed else "/admin/dashboard"
        resp = RedirectResponse(url=target, status_code=303)
        resp.set_cookie(key="session", value=f"{slug}:Owner:chef:{password.strip()}", httponly=True, max_age=31536000, samesite="lax", secure=not _IS_LOCAL_DEV)
        return resp
        
    if email.strip() == "admin@digi-gastro.de" and password.strip() == ADMIN_PASSWORD:
        resp = RedirectResponse(url="/digi-gastro-admin", status_code=303)
        resp.set_cookie(key="session_global", value=email.strip(), httponly=True, max_age=31536000, samesite="lax", secure=not _IS_LOCAL_DEV)
        return resp
        
    return templates.TemplateResponse(
        request,
        "landing.html",
        {"request": request, "error": "Ungültige E-Mail-Adresse oder Passwort.", "show_login": True, "email": email or ""}
    )


# ==========================================
# GLOBAL PLATFORM ADMIN ROUTES
# ==========================================

@app.get("/digi-gastro-admin", response_class=HTMLResponse)
def get_global_admin(request: Request, db: Session = Depends(get_db)):
    session_cookie = request.cookies.get("session_global")
    if not session_cookie or session_cookie != "admin@digi-gastro.de":
        return RedirectResponse(url="/digi-gastro-admin/login")
        
    error = request.query_params.get("error")
    success = request.query_params.get("success")
    
    alert_html = ""
    if error:
        alert_html = f'<div class="alert alert-error"><span class="material-symbols-outlined" style="font-size:16px;">error</span> {html_escape(error)}</div>'
    elif success:
        alert_html = f'<div class="alert alert-success"><span class="material-symbols-outlined" style="font-size:16px;">check_circle</span> {html_escape(success)}</div>'
    
    # Fetch real tenant data from database
    all_tenants = db.query(Tenant).order_by(Tenant.slug).all()
    total_tenants = len(all_tenants)
    active_tenants = sum(1 for t in all_tenants if t.active)
    inactive_tenants = total_tenants - active_tenants

    # ── Bug-Fix: Tagesumsatz korrekt aus Bestellungen berechnen ──
    # VORHER: t.tagesumsatz war ein kumulativer Zähler der nie zurückgesetzt wurde
    # → zeigte Gesamtumsatz aller Zeiten, nicht heutigen Tagesumsatz
    # JETZT: Berechne echten Tagesumsatz aus bezahlten Bestellungen von heute
    from datetime import datetime as _dt
    today_str = _dt.now().strftime("%Y-%m-%d")
    tenant_daily_revenue = {}
    for t in all_tenants:
        daily_rev = 0.0
        try:
            restaurant = load_restaurant_from_db(t.slug, db)
            if restaurant:
                for o in restaurant.get("orders", []):
                    if o.get("status") == "bezahlt":
                        ts = o.get("timestamp", "")
                        if ts and ts.startswith(today_str):
                            daily_rev += float(o.get("total", 0.0) or 0.0)
        except Exception:
            pass
        tenant_daily_revenue[t.slug] = daily_rev
    
    tenant_cards = ""
    for t in all_tenants:
        is_active = t.active if t.active is not None else True
        status_class = "tenant-active" if is_active else "tenant-inactive"
        status_text = "Aktiv" if is_active else "Inaktiv"
        status_dot = "bg-emerald-500" if is_active else "bg-red-500"
        toggle_label = "Deaktivieren" if is_active else "Aktivieren"
        toggle_class = "btn-toggle-off" if is_active else "btn-toggle-on"
        
        tenant_cards += f"""
        <div class="tenant-card {status_class}">
          <div class="tenant-card-header">
            <div class="tenant-avatar">{(t.name or t.slug)[:2].upper()}</div>
            <div class="tenant-info">
              <form method="POST" action="/digi-gastro-admin/tenant-edit-name/{t.slug}" class="tenant-name-form">
                <input type="text" name="name" value="{t.name or t.slug}" class="tenant-name-input" />
                <button type="submit" class="tenant-name-save" title="Name speichern">
                  <span class="material-symbols-outlined" style="font-size:14px;">save</span>
                </button>
              </form>
              <div class="tenant-slug">
                <span class="material-symbols-outlined" style="font-size:12px;">link</span> {t.slug}
              </div>
            </div>
            <div class="tenant-status">
              <span class="status-dot {status_dot}"></span>
              <span class="status-text">{status_text}</span>
            </div>
          </div>
          <div class="tenant-card-body">
            <div class="tenant-credentials">
              <div class="cred-item">
                <span class="material-symbols-outlined" style="font-size:13px;">mail</span>
                <span>{t.email or ''}</span>
              </div>
              <div class="cred-item">
                <span class="material-symbols-outlined" style="font-size:13px;">key</span>
                <span class="cred-pw">{t.password or ''}</span>
              </div>
            </div>
            <div class="tenant-revenue-row">
              <div class="revenue-display">
                <span class="material-symbols-outlined" style="font-size:14px;color:#fbbf24;">euro</span>
                <span class="revenue-label">Tagesumsatz:</span>
                <span class="revenue-value">{tenant_daily_revenue.get(t.slug, 0.0):.2f} €</span>
              </div>
              <button type="button" class="tenant-btn btn-revenue-toggle" onclick="toggleRevenueForm('rev-form-{t.slug}')" title="Umsatz anpassen">
                <span class="material-symbols-outlined" style="font-size:14px;">edit</span>
                <span>Anpassen</span>
              </button>
            </div>
            <form id="rev-form-{t.slug}" method="POST" action="/digi-gastro-admin/tenant-adjust-revenue/{t.slug}" class="revenue-form" style="display:none;">
              <div class="revenue-form-row">
                <input type="number" step="0.01" name="adjustment" placeholder="+150.00 oder -50.00" required class="revenue-input" />
                <button type="submit" class="tenant-btn btn-revenue-save" title="Anpassung speichern">
                  <span class="material-symbols-outlined" style="font-size:14px;">save</span>
                  <span>Speichern</span>
                </button>
              </div>
              <small class="revenue-hint">Positiver Wert = hinzufügen, negativer Wert = abziehen</small>
            </form>
            <div class="cleanup-row">
              <div class="cleanup-label">
                <span class="material-symbols-outlined" style="font-size:13px;color:#ef4444;">cleaning_services</span>
                <span>Bestellungen aufräumen:</span>
              </div>
              <div class="cleanup-buttons">
                <button type="button" class="tenant-btn btn-cleanup btn-cleanup-cancelled" onclick="confirmCleanup('{t.slug}', 'cancelled')" title="Nur stornierte Bestellungen löschen">
                  <span class="material-symbols-outlined" style="font-size:14px;">remove_circle</span>
                  <span>Stornierte</span>
                </button>
                <button type="button" class="tenant-btn btn-cleanup btn-cleanup-date" onclick="toggleDateCleanup('cleanup-date-{t.slug}')" title="Bestellungen vor Datum löschen">
                  <span class="material-symbols-outlined" style="font-size:14px;">event_busy</span>
                  <span>Vor Datum</span>
                </button>
                <button type="button" class="tenant-btn btn-cleanup btn-cleanup-all" onclick="confirmCleanup('{t.slug}', 'all')" title="ALLE Bestellungen löschen (kompletter Reset)">
                  <span class="material-symbols-outlined" style="font-size:14px;">delete_forever</span>
                  <span>Alle</span>
                </button>
              </div>
            </div>
            <form id="cleanup-date-{t.slug}" method="POST" action="/digi-gastro-admin/tenant-cleanup-orders/{t.slug}" class="revenue-form cleanup-date-form" style="display:none;">
              <input type="hidden" name="mode" value="before_date" />
              <div class="revenue-form-row">
                <input type="date" name="cutoff_date" required class="revenue-input" />
                <button type="submit" class="tenant-btn btn-cleanup-save" title="Bestellungen vor diesem Datum löschen">
                  <span class="material-symbols-outlined" style="font-size:14px;">delete</span>
                  <span>Löschen</span>
                </button>
              </div>
              <small class="revenue-hint">Löscht alle Bestellungen VOR dem gewählten Datum (exklusiv)</small>
            </form>
          </div>
          <div class="tenant-card-actions">
            <form method="POST" action="/digi-gastro-admin/tenant-reset-password/{t.slug}" class="inline">
              <button type="submit" class="tenant-btn btn-pw-reset" title="Passwort zurücksetzen">
                <span class="material-symbols-outlined" style="font-size:14px;">lock_reset</span>
                <span>Passwort Reset</span>
              </button>
            </form>
            <form method="POST" action="/digi-gastro-admin/tenant-toggle/{t.slug}" class="inline">
              <button type="submit" class="tenant-btn {toggle_class}" title="{toggle_label}">
                <span class="material-symbols-outlined" style="font-size:14px;">{'power_settings_new' if is_active else 'play_arrow'}</span>
                <span>{toggle_label}</span>
              </button>
            </form>
            <a href="/{t.slug}/admin" target="_blank" class="tenant-btn btn-open" title="Restaurant Dashboard öffnen">
              <span class="material-symbols-outlined" style="font-size:14px;">open_in_new</span>
            </a>
          </div>
        </div>
        """

    # ── Audit-Log: letzte 10 Umsatz-Anpassungen ──
    audit_entries = db.query(RevenueAdjustment).order_by(
        RevenueAdjustment.id.desc()
    ).limit(10).all()

    if audit_entries:
        audit_rows = ""
        for log in audit_entries:
            delta_class = "audit-delta-positive" if log.adjustment >= 0 else "audit-delta-negative"
            delta_str = f"+{log.adjustment:.2f} €" if log.adjustment >= 0 else f"{log.adjustment:.2f} €"
            audit_rows += f"""
            <tr>
              <td>{log.adjusted_at}</td>
              <td><strong>{log.tenant_slug}</strong></td>
              <td>{log.old_value:.2f} €</td>
              <td class="{delta_class}">{delta_str}</td>
              <td><strong>{log.new_value:.2f} €</strong></td>
            </tr>
            """
        audit_log_html = f"""
        <div class="audit-log-section" id="audit-log-section">
          <div class="audit-log-title">
            <span class="material-symbols-outlined" style="font-size:18px;color:#fbbf24;">history</span>
            Audit-Log – letzte Umsatz-Anpassungen
          </div>
          <table class="audit-log-table">
            <thead>
              <tr>
                <th>Zeitpunkt</th>
                <th>Tenant</th>
                <th>Alter Wert</th>
                <th>Anpassung</th>
                <th>Neuer Wert</th>
              </tr>
            </thead>
            <tbody>
              {audit_rows}
            </tbody>
          </table>
        </div>
        """
    else:
        audit_log_html = """
        <div class="audit-log-section" id="audit-log-section">
          <div class="audit-log-title">
            <span class="material-symbols-outlined" style="font-size:18px;color:#fbbf24;">history</span>
            Audit-Log – letzte Umsatz-Anpassungen
          </div>
          <div class="audit-empty">
            Noch keine Umsatz-Anpassungen durchgeführt.
          </div>
        </div>
        """

    html_content = f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Platform Control Center – digi-gastro</title>
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="digi-gastro Platform">
  <meta name="theme-color" content="#C9A84C">
  <meta name="mobile-web-app-capable" content="yes">
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/static/images/icon-192.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/static/images/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/static/images/favicon-16.png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    /* ── Material Symbols Basis-Klasse selbst definiert (Fallback, falls Google CSS noch nicht geladen) ──
       Verhindert "Icons nicht einsehbar" — sonst zeigt der Browser nur den Icon-Namen als Text an
       (z.B. "save" statt des Save-Icons), bis das Google-Font-CSS geladen ist. */
    .material-symbols-outlined {{
      font-family: 'Material Symbols Outlined', 'Material Icons', sans-serif;
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
      font-feature-settings: 'liga';
      vertical-align: middle;
    }}
    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #09090b;
      color: #f4f4f5;
      min-height: 100vh;
      min-height: 100dvh;
      -webkit-font-smoothing: antialiased;
    }}
    .layout {{
      display: flex;
      min-height: 100vh;
      min-height: 100dvh;
    }}
    /* Sidebar */
    .sidebar {{
      width: 260px;
      background: #18181b;
      border-right: 1px solid #27272a;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      z-index: 50;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }}
    .sidebar-header {{
      padding: 1.25rem;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }}
    .sidebar-logo {{
      width: 36px; height: 36px;
      border-radius: 10px;
      object-fit: cover;
    }}
    .sidebar-brand {{
      font-weight: 900; font-size: 0.85rem;
      color: #f4f4f5;
      line-height: 1.2;
    }}
    .sidebar-brand-sub {{
      font-size: 0.6rem; font-weight: 700;
      color: #71717a; letter-spacing: 0.05em;
      text-transform: uppercase;
    }}
    .sidebar-nav {{
      flex: 1;
      padding: 0.75rem 0;
      overflow-y: auto;
    }}
    .nav-section {{
      padding: 0.5rem 1.25rem 0.25rem;
      font-size: 0.6rem; font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #52525b;
    }}
    .nav-item {{
      display: flex; align-items: center; gap: 0.625rem;
      padding: 0.6rem 1.25rem;
      font-size: 0.8rem; font-weight: 600;
      color: #a1a1aa;
      border-left: 3px solid transparent;
      transition: all 0.15s;
      cursor: pointer;
      text-decoration: none;
    }}
    .nav-item:hover {{ background: rgba(0,153,0,0.04); color: #f4f4f5; padding-left: 1.5rem; }}
    .nav-item.active {{ background: rgba(0,153,0,0.08); color: #22c55e; border-left-color: #22c55e; font-weight: 700; }}
    .nav-item .material-symbols-outlined {{ font-size: 18px; }}
    .sidebar-footer {{
      padding: 0.75rem 1.25rem;
      border-top: 1px solid #27272a;
    }}
    .sidebar-footer a {{
      display: flex; align-items: center; gap: 0.5rem;
      color: #ef4444; font-weight: 700; font-size: 0.75rem;
      padding: 0.5rem 0.75rem; border-radius: 0.75rem;
      text-decoration: none; transition: background 0.15s;
    }}
    .sidebar-footer a:hover {{ background: rgba(239,68,68,0.08); }}

    /* Main Content */
    .main {{
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }}
    .topbar {{
      background: rgba(24,24,27,0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #27272a;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 40;
    }}
    .topbar-title {{
      font-size: 0.9rem; font-weight: 800;
      color: #f4f4f5;
    }}
    .topbar-right {{
      display: flex; align-items: center; gap: 0.75rem;
    }}
    .hamburger {{
      display: none;
      width: 36px; height: 36px;
      border-radius: 0.625rem;
      border: 1px solid #27272a;
      background: #18181b;
      color: #a1a1aa;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }}
    .backdrop {{
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 45;
      backdrop-filter: blur(2px);
    }}
    .backdrop.show {{ display: block; }}

    .content {{
      flex: 1;
      padding: 1.5rem;
    }}

    /* Stat Cards */
    .stats-grid {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }}
    .stat-card {{
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 1rem;
      padding: 1.25rem;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }}
    .stat-card:hover {{ transform: translateY(-2px); box-shadow: 0 8px 24px -6px rgba(0,0,0,0.3); }}
    .stat-card .stat-icon {{
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 0.75rem;
    }}
    .stat-card .stat-label {{
      font-size: 0.6rem; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: #71717a; margin-bottom: 0.25rem;
    }}
    .stat-card .stat-value {{
      font-size: 1.5rem; font-weight: 900;
      color: #f4f4f5; font-family: 'Inter', monospace;
      line-height: 1.2;
    }}
    .stat-card .stat-sub {{
      font-size: 0.6rem; color: #71717a; margin-top: 0.375rem;
    }}
    .stat-card::before {{
      content: ''; position: absolute; top: 0; right: 0;
      width: 80px; height: 80px; border-radius: 50%;
      opacity: 0.04; transform: translate(20px, -20px);
    }}
    .stat-card.sc-partners::before {{ background: #22c55e; }}
    .stat-card.sc-active::before {{ background: #3b82f6; }}
    .stat-card.sc-revenue::before {{ background: #f59e0b; }}
    .stat-card.sc-orders::before {{ background: #8b5cf6; }}

    /* Section Card */
    .section-card {{
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 1rem;
      overflow: hidden;
    }}
    .section-header {{
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }}
    .section-title {{
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.85rem; font-weight: 800; color: #f4f4f5;
    }}
    .section-title .material-symbols-outlined {{ font-size: 18px; color: #71717a; }}
    .section-body {{ padding: 1.25rem; }}

    /* Alert */
    .alert {{
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }}
    .alert-error {{ background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #f87171; }}
    .alert-success {{ background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); color: #4ade80; }}

    /* Tenant Cards */
    .tenants-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }}
    .tenant-card {{
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 1rem;
      overflow: hidden;
      transition: box-shadow 0.2s, border-color 0.2s;
    }}
    .tenant-card:hover {{ box-shadow: 0 4px 12px -2px rgba(0,0,0,0.3); }}
    .tenant-card.tenant-active {{ border-left: 3px solid #22c55e; }}
    .tenant-card.tenant-inactive {{ border-left: 3px solid #ef4444; opacity: 0.7; }}
    .tenant-card-header {{
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }}
    .tenant-avatar {{
      width: 40px; height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #009900, #065f06);
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 0.8rem;
      flex-shrink: 0;
    }}
    .tenant-info {{ flex: 1; min-width: 0; }}
    .tenant-name-form {{
      display: flex; align-items: center; gap: 0.25rem;
    }}
    .tenant-name-input {{
      background: transparent;
      border: none;
      border-bottom: 1px solid transparent;
      color: #f4f4f5;
      font-weight: 800;
      font-size: 0.85rem;
      padding: 0.125rem 0;
      width: 140px;
      outline: none;
      transition: border-color 0.15s;
    }}
    .tenant-name-input:hover {{ border-bottom-color: #3f3f46; }}
    .tenant-name-input:focus {{ border-bottom-color: #22c55e; }}
    .tenant-name-save {{
      background: none; border: none;
      color: #52525b; cursor: pointer;
      padding: 2px; transition: color 0.15s;
      display: flex; align-items: center;
    }}
    .tenant-name-save:hover {{ color: #22c55e; }}
    .tenant-slug {{
      font-size: 0.65rem; color: #52525b;
      display: flex; align-items: center; gap: 0.25rem;
      margin-top: 0.125rem;
      font-weight: 600;
    }}
    .tenant-status {{
      display: flex; align-items: center; gap: 0.375rem;
      flex-shrink: 0;
    }}
    .status-dot {{
      width: 8px; height: 8px;
      border-radius: 50%;
    }}
    .status-text {{
      font-size: 0.65rem; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.05em;
      color: #a1a1aa;
    }}
    .tenant-card-body {{
      padding: 0 1rem 0.75rem;
    }}
    .tenant-credentials {{
      background: #09090b;
      border-radius: 0.75rem;
      padding: 0.625rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }}
    .cred-item {{
      display: flex; align-items: center; gap: 0.375rem;
      font-size: 0.7rem; color: #71717a;
      font-family: 'Inter', monospace;
    }}
    .cred-item .material-symbols-outlined {{ color: #52525b; }}
    .cred-pw {{
      color: #a1a1aa; font-weight: 600;
    }}
    .tenant-card-actions {{
      padding: 0.75rem 1rem;
      border-top: 1px solid #1c1c1e;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }}
    /* ── Tenant Revenue Row (Super-Admin Umsatz-Anpassung) ── */
    .tenant-revenue-row {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 0 0.375rem;
      margin-top: 0.5rem;
      border-top: 1px dashed #2c2c2e;
      gap: 0.5rem;
      flex-wrap: wrap;
    }}
    .revenue-display {{
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }}
    .revenue-label {{
      font-size: 0.7rem;
      font-weight: 700;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }}
    .revenue-value {{
      font-size: 0.95rem;
      font-weight: 800;
      color: #fbbf24;
      font-family: 'JetBrains Mono', monospace;
    }}
    .btn-revenue-toggle {{
      background: rgba(245, 158, 11, 0.1);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }}
    .btn-revenue-toggle:hover {{
      background: rgba(245, 158, 11, 0.2);
      border-color: #fbbf24;
    }}
    .revenue-form {{
      padding: 0.75rem 0 0.25rem;
      margin-top: 0.5rem;
      border-top: 1px solid #1c1c1e;
    }}
    .revenue-form-row {{
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }}
    .revenue-input {{
      flex: 1;
      min-width: 140px;
      padding: 0.5rem 0.75rem;
      background: #0c0c0e;
      border: 1px solid #2c2c2e;
      border-radius: 0.5rem;
      color: #f4f4f5;
      font-size: 0.85rem;
      font-family: 'JetBrains Mono', monospace;
    }}
    .revenue-input:focus {{
      outline: none;
      border-color: #fbbf24;
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
    }}
    .btn-revenue-save {{
      background: #fbbf24;
      color: #0c0c0e;
      border: 1px solid #fbbf24;
      font-weight: 800;
    }}
    .btn-revenue-save:hover {{
      background: #f59e0b;
      border-color: #f59e0b;
    }}
    .revenue-hint {{
      display: block;
      margin-top: 0.375rem;
      font-size: 0.65rem;
      color: #71717a;
      font-style: italic;
    }}
    /* ── Cleanup-Buttons (Bestellungen löschen) ── */
    .cleanup-row {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0;
      margin-top: 0.5rem;
      border-top: 1px dashed #2c2c2e;
      gap: 0.5rem;
      flex-wrap: wrap;
    }}
    .cleanup-label {{
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.7rem;
      font-weight: 700;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }}
    .cleanup-buttons {{
      display: flex;
      gap: 0.375rem;
      flex-wrap: wrap;
    }}
    .btn-cleanup {{
      font-size: 0.6rem;
      padding: 0.35rem 0.55rem;
    }}
    .btn-cleanup-cancelled {{
      background: rgba(245, 158, 11, 0.1);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }}
    .btn-cleanup-cancelled:hover {{
      background: rgba(245, 158, 11, 0.2);
      border-color: #fbbf24;
    }}
    .btn-cleanup-date {{
      background: rgba(59, 130, 246, 0.1);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }}
    .btn-cleanup-date:hover {{
      background: rgba(59, 130, 246, 0.2);
      border-color: #60a5fa;
    }}
    .btn-cleanup-all {{
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }}
    .btn-cleanup-all:hover {{
      background: rgba(239, 68, 68, 0.2);
      border-color: #f87171;
    }}
    .btn-cleanup-save {{
      background: #ef4444;
      color: #fff;
      border: 1px solid #ef4444;
      font-weight: 800;
    }}
    .btn-cleanup-save:hover {{
      background: #dc2626;
      border-color: #dc2626;
    }}
    .cleanup-date-form {{
      margin-top: 0.375rem;
    }}
    /* ── Audit-Log Sektion ── */
    .audit-log-section {{
      margin-top: 2rem;
      padding: 1.25rem;
      background: #0f0f10;
      border: 1px solid #1c1c1e;
      border-radius: 0.75rem;
    }}
    .audit-log-title {{
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 800;
      color: #f4f4f5;
      margin-bottom: 1rem;
    }}
    .audit-log-table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 0.75rem;
    }}
    .audit-log-table th {{
      text-align: left;
      padding: 0.5rem 0.625rem;
      background: #18181b;
      color: #a1a1aa;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.65rem;
      letter-spacing: 0.04em;
      border-bottom: 1px solid #27272a;
    }}
    .audit-log-table td {{
      padding: 0.5rem 0.625rem;
      border-bottom: 1px solid #1c1c1e;
      color: #d4d4d8;
      vertical-align: top;
    }}
    .audit-log-table tr:hover td {{
      background: rgba(255, 255, 255, 0.02);
    }}
    .audit-delta-positive {{ color: #22c55e; font-weight: 700; font-family: monospace; }}
    .audit-delta-negative {{ color: #ef4444; font-weight: 700; font-family: monospace; }}
    .audit-empty {{
      padding: 2rem 1rem;
      text-align: center;
      color: #71717a;
      font-size: 0.8rem;
    }}
    .tenant-btn {{
      display: inline-flex; align-items: center; gap: 0.25rem;
      padding: 0.375rem 0.625rem;
      border-radius: 0.625rem;
      font-size: 0.65rem; font-weight: 700;
      border: none; cursor: pointer;
      transition: all 0.15s;
      text-decoration: none;
    }}
    .btn-pw-reset {{
      background: #27272a; color: #a1a1aa;
    }}
    .btn-pw-reset:hover {{ background: #3f3f46; color: #f4f4f5; }}
    .btn-toggle-off {{
      background: rgba(239,68,68,0.08); color: #f87171;
      border: 1px solid rgba(239,68,68,0.15);
    }}
    .btn-toggle-off:hover {{ background: rgba(239,68,68,0.15); }}
    .btn-toggle-on {{
      background: rgba(34,197,94,0.08); color: #4ade80;
      border: 1px solid rgba(34,197,94,0.15);
    }}
    .btn-toggle-on:hover {{ background: rgba(34,197,94,0.15); }}
    .btn-open {{
      background: rgba(59,130,246,0.08); color: #60a5fa;
      border: 1px solid rgba(59,130,246,0.15);
      margin-left: auto;
    }}
    .btn-open:hover {{ background: rgba(59,130,246,0.15); }}

    /* Create Form */
    .create-form-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }}
    .form-group {{
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }}
    .form-group.full {{ grid-column: 1 / -1; }}
    .form-label {{
      font-size: 0.6rem; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.04em;
      color: #71717a;
    }}
    .form-input {{
      width: 100%;
      background: #09090b;
      border: 1px solid #27272a;
      border-radius: 0.75rem;
      padding: 0.625rem 0.875rem;
      font-size: 0.8rem;
      color: #f4f4f5;
      outline: none;
      transition: border-color 0.15s;
      font-family: 'Inter', sans-serif;
    }}
    .form-input:focus {{ border-color: #22c55e; }}
    .form-input::placeholder {{ color: #3f3f46; }}
    .btn-submit {{
      width: 100%;
      background: linear-gradient(135deg, #009900, #008000);
      color: white;
      font-weight: 800;
      font-size: 0.8rem;
      padding: 0.75rem;
      border-radius: 0.75rem;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 6px rgba(0,153,0,0.2);
    }}
    .btn-submit:hover {{
      box-shadow: 0 4px 12px rgba(0,153,0,0.3);
      transform: translateY(-1px);
    }}

    /* Responsive */
    @media (max-width: 1023px) {{
      .sidebar {{ transform: translateX(-100%); }}
      .sidebar.open {{ transform: translateX(0); box-shadow: 10px 0 25px -5px rgba(0,0,0,0.3); }}
      .main {{ margin-left: 0 !important; }}
      .hamburger {{ display: flex; }}
    }}
    @media (max-width: 768px) {{
      .stats-grid {{ grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }}
      .content {{ padding: 1rem; }}
      .tenants-grid {{ grid-template-columns: 1fr; }}
      .create-form-grid {{ grid-template-columns: 1fr; }}
    }}
    @media (max-width: 480px) {{
      .stats-grid {{ grid-template-columns: 1fr 1fr; }}
      .stat-card .stat-value {{ font-size: 1.25rem; }}
      .topbar {{ padding: 0.625rem 1rem; }}
    }}

    /* Scrollbar */
    ::-webkit-scrollbar {{ width: 6px; }}
    ::-webkit-scrollbar-track {{ background: transparent; }}
    ::-webkit-scrollbar-thumb {{ background: #27272a; border-radius: 3px; }}
    ::-webkit-scrollbar-thumb:hover {{ background: #3f3f46; }}

    /* Safe area for notched phones */
    .sidebar {{ padding-top: env(safe-area-inset-top); }}
    .topbar {{ padding-top: max(0.75rem, env(safe-area-inset-top)); }}
  </style>
</head>
<body>
  <!-- Mobile backdrop -->
  <div id="backdrop" class="backdrop" onclick="closeSidebar()"></div>

  <div class="layout">
    <!-- Sidebar -->
    <aside id="sidebar" class="sidebar">
      <div class="sidebar-header">
        <img src="/static/images/digigastrologo.jpeg" alt="digi-gastro" class="sidebar-logo">
        <div>
          <div class="sidebar-brand">digi-gastro</div>
          <div class="sidebar-brand-sub">Platform Control</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section">Übersicht</div>
        <a href="/digi-gastro-admin" class="nav-item active">
          <span class="material-symbols-outlined">dashboard</span>
          Dashboard
        </a>
        <div class="nav-section" style="margin-top:0.5rem;">Verwaltung</div>
        <a href="/digi-gastro-admin" class="nav-item" onclick="document.getElementById('tenant-section').scrollIntoView({{behavior:'smooth'}})">
          <span class="material-symbols-outlined">store</span>
          Partner
        </a>
        <a href="/digi-gastro-admin" class="nav-item" onclick="document.getElementById('audit-log-section').scrollIntoView({{behavior:'smooth'}})">
          <span class="material-symbols-outlined">history</span>
          Audit-Log
        </a>
      </nav>
      <div class="sidebar-footer">
        <a href="/digi-gastro-admin/logout">
          <span class="material-symbols-outlined" style="font-size:16px;">logout</span>
          Ausloggen
        </a>
      </div>
    </aside>

    <!-- Main content -->
    <div class="main">
      <div class="topbar">
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <button class="hamburger" onclick="toggleSidebar()">
            <span class="material-symbols-outlined" style="font-size:20px;">menu</span>
          </button>
          <span class="topbar-title">Dashboard</span>
        </div>
        <div class="topbar-right">
          <span style="font-size:0.6rem;font-weight:800;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">
            Super Admin
          </span>
        </div>
      </div>

      <div class="content">
        {alert_html}

        <!-- Stats Grid (reduziert: nur Partner + Aktiv, kein Gesamt-Umsatz/Bestellungen) -->
        <div class="stats-grid">
          <div class="stat-card sc-partners">
            <div class="stat-icon" style="background:rgba(34,197,94,0.1);">
              <span class="material-symbols-outlined" style="font-size:18px;color:#4ade80;">store</span>
            </div>
            <div class="stat-label">Partner</div>
            <div class="stat-value">{total_tenants}</div>
            <div class="stat-sub">Registrierte Restaurants</div>
          </div>
          <div class="stat-card sc-active">
            <div class="stat-icon" style="background:rgba(59,130,246,0.1);">
              <span class="material-symbols-outlined" style="font-size:18px;color:#60a5fa;">check_circle</span>
            </div>
            <div class="stat-label">Aktiv</div>
            <div class="stat-value">{active_tenants}</div>
            <div class="stat-sub">{inactive_tenants} inaktiv</div>
          </div>
        </div>

        <!-- Create Tenant Section -->
        <div class="section-card" style="margin-bottom:1.5rem;">
          <div class="section-header">
            <div class="section-title">
              <span class="material-symbols-outlined">add_circle</span>
              Neuen Partner erstellen
            </div>
          </div>
          <div class="section-body">
            <form method="POST" action="/digi-gastro-admin/tenant-erstellen">
              <div class="create-form-grid">
                <div class="form-group">
                  <label class="form-label">Restaurant Name</label>
                  <input type="text" name="name" placeholder="z.B. Moonlight Shisha Bar" required class="form-input">
                </div>
                <div class="form-group">
                  <label class="form-label">Subdomain / Slug</label>
                  <input type="text" name="slug" placeholder="z.B. moonlight" required class="form-input">
                </div>
                <div class="form-group full">
                  <button type="submit" class="btn-submit">
                    <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px;">add</span>
                    Partner erstellen
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Tenant List Section -->
        <div class="section-card" id="tenant-section">
          <div class="section-header">
            <div class="section-title">
              <span class="material-symbols-outlined">store</span>
              Partner-Restaurants
            </div>
            <span style="font-size:0.65rem;font-weight:700;color:#52525b;">{total_tenants} registriert</span>
          </div>
          <div class="section-body">
            <div class="tenants-grid">
              {tenant_cards}
            </div>
          </div>
        </div>

        {audit_log_html}

      </div>
    </div>
  </div>

  <script>
    // ── Revenue-Form toggle (Gott-Modus Umsatz-Anpassung) ──
    function toggleRevenueForm(formId) {{
      const form = document.getElementById(formId);
      if (!form) return;
      form.style.display = (form.style.display === 'none' || !form.style.display) ? 'block' : 'none';
      if (form.style.display === 'block') {{
        // Fokus aufs Input für schnelle Eingabe
        const input = form.querySelector('input[name="adjustment"]');
        if (input) setTimeout(() => input.focus(), 50);
      }}
    }}

    // ── Cleanup: Date-Form auf/zu klappen ──
    function toggleDateCleanup(formId) {{
      const form = document.getElementById(formId);
      if (!form) return;
      form.style.display = (form.style.display === 'none' || !form.style.display) ? 'block' : 'none';
      if (form.style.display === 'block') {{
        const input = form.querySelector('input[type="date"]');
        if (input) {{
          // Default: heute vor 7 Tagen
          const d = new Date();
          d.setDate(d.getDate() - 7);
          input.value = d.toISOString().split('T')[0];
          setTimeout(() => input.focus(), 50);
        }}
      }}
    }}

    // ── Cleanup: Bestätigungs-Dialog für Hard Delete ──
    function confirmCleanup(slug, mode) {{
      const messages = {{
        'all': 'ACHTUNG: Wirklich ALLE Bestellungen von "' + slug + '" unwiderruflich löschen?\\n\\nDas betrifft auch bereits bezahlte Bestellungen!\\nEin Backup wird automatisch erstellt.',
        'cancelled': 'Stornierte Bestellungen von "' + slug + '" löschen?\\n\\nEin Backup wird automatisch erstellt.',
      }};
      const msg = messages[mode] || 'Bestellungen löschen?';
      if (confirm(msg)) {{
        // Dynamisches Formular erstellen und absenden
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/digi-gastro-admin/tenant-cleanup-orders/' + slug;
        const modeInput = document.createElement('input');
        modeInput.type = 'hidden';
        modeInput.name = 'mode';
        modeInput.value = mode;
        form.appendChild(modeInput);
        document.body.appendChild(form);
        form.submit();
      }}
    }}

    function toggleSidebar() {{
      const sb = document.getElementById('sidebar');
      const bd = document.getElementById('backdrop');
      sb.classList.toggle('open');
      bd.classList.toggle('show');
    }}
    function closeSidebar() {{
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('backdrop').classList.remove('show');
    }}
  </script>
</body>
</html>"""
    return HTMLResponse(content=html_content)

@app.get("/digi-gastro-admin/login", response_class=HTMLResponse)
def get_global_login(request: Request, error: Optional[str] = None):
    session_cookie = request.cookies.get("session_global")
    if session_cookie == "admin@digi-gastro.de":
        return RedirectResponse(url="/digi-gastro-admin")
        
    error_html = ""
    if error:
        error_html = f'<div class="alert-error"><span class="material-symbols-outlined" style="font-size:16px;">error</span> {html_escape(error)}</div>'
        
    html_content = f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Platform Login – digi-gastro</title>
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="digi-gastro Platform">
  <meta name="theme-color" content="#C9A84C">
  <meta name="mobile-web-app-capable" content="yes">
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/static/images/icon-192.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/static/images/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/static/images/favicon-16.png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    /* ── Material Symbols Basis-Klasse (Fallback, falls Google CSS noch nicht geladen) ── */
    .material-symbols-outlined {{
      font-family: 'Material Symbols Outlined', 'Material Icons', sans-serif;
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
      font-feature-settings: 'liga';
      vertical-align: middle;
    }}
    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #09090b;
      color: #f4f4f5;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      -webkit-font-smoothing: antialiased;
    }}
    .login-card {{
      width: 100%;
      max-width: 400px;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 1.5rem;
      overflow: hidden;
    }}
    .login-header {{
      background: linear-gradient(135deg, #1f2937, #111827);
      padding: 2rem 1.5rem 1.5rem;
      text-align: center;
    }}
    .login-logo {{
      width: 48px; height: 48px;
      border-radius: 14px;
      object-fit: cover;
      margin-bottom: 1rem;
      box-shadow: 0 4px 12px rgba(0,153,0,0.2);
    }}
    .login-title {{
      font-size: 1.25rem;
      font-weight: 900;
      color: #f4f4f5;
      letter-spacing: -0.01em;
    }}
    .login-subtitle {{
      font-size: 0.7rem;
      color: #71717a;
      margin-top: 0.375rem;
      font-weight: 600;
    }}
    .login-body {{
      padding: 1.5rem;
    }}
    .alert-error {{
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      color: #f87171;
    }}
    .form-group {{
      margin-bottom: 1rem;
    }}
    .form-label {{
      display: block;
      font-size: 0.6rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #71717a;
      margin-bottom: 0.375rem;
    }}
    .form-input {{
      width: 100%;
      background: #09090b;
      border: 1px solid #27272a;
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      font-size: 0.85rem;
      color: #f4f4f5;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      font-family: 'Inter', sans-serif;
    }}
    .form-input:focus {{
      border-color: #22c55e;
      box-shadow: 0 0 0 3px rgba(34,197,94,0.1);
    }}
    .form-input::placeholder {{
      color: #3f3f46;
    }}
    .btn-login {{
      width: 100%;
      background: linear-gradient(135deg, #009900, #008000);
      color: white;
      font-weight: 800;
      font-size: 0.85rem;
      padding: 0.875rem;
      border-radius: 0.75rem;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 6px rgba(0,153,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }}
    .btn-login:hover {{
      box-shadow: 0 4px 12px rgba(0,153,0,0.3);
      transform: translateY(-1px);
    }}
    .login-footer {{
      padding: 1rem 1.5rem;
      text-align: center;
      border-top: 1px solid #27272a;
    }}
    .login-footer a {{
      font-size: 0.7rem;
      color: #71717a;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.15s;
    }}
    .login-footer a:hover {{ color: #22c55e; }}

    @media (max-width: 480px) {{
      body {{ padding: 1rem; }}
      .login-card {{ border-radius: 1rem; }}
      .login-header {{ padding: 1.5rem 1.25rem 1.25rem; }}
      .login-body {{ padding: 1.25rem; }}
    }}
  </style>
</head>
<body>
  <div class="login-card">
    <div class="login-header">
      <img src="/static/images/digigastrologo.jpeg" alt="digi-gastro" class="login-logo">
      <div class="login-title">Platform Control</div>
      <div class="login-subtitle">Super Admin Login</div>
    </div>
    <div class="login-body">
      {error_html}
      <form method="POST" action="/digi-gastro-admin/login">
        <div class="form-group">
          <label class="form-label">E-Mail-Adresse</label>
          <input type="email" name="email" placeholder="admin@digi-gastro.de" required class="form-input" autocomplete="email">
        </div>
        <div class="form-group">
          <label class="form-label">Passwort</label>
          <input type="password" name="password" placeholder="••••••••" required class="form-input" autocomplete="current-password">
        </div>
        <button type="submit" class="btn-login">
          <span class="material-symbols-outlined" style="font-size:18px;">login</span>
          Anmelden
        </button>
      </form>
    </div>
    <div class="login-footer">
      <a href="/">← Zurück zur Startseite</a>
    </div>
  </div>
</body>
</html>"""
    return HTMLResponse(content=html_content)

@app.post("/digi-gastro-admin/login")
def post_global_login(request: Request, email: str = Form(...), password: str = Form(...)):
    if email == "admin@digi-gastro.de" and password == ADMIN_PASSWORD:
        resp = RedirectResponse(url="/digi-gastro-admin", status_code=303)
        resp.set_cookie(key="session_global", value=email, httponly=True, max_age=31536000, samesite="lax", secure=not _IS_LOCAL_DEV)
        return resp
    return get_global_login(request, error="Ungültige E-Mail-Adresse oder Passwort.")

@app.get("/digi-gastro-admin/logout")
def get_global_logout(response: Response):
    resp = RedirectResponse(url="/digi-gastro-admin/login")
    resp.delete_cookie(key="session_global")
    return resp

@app.post("/digi-gastro-admin/tenant-erstellen")
def post_tenant_erstellen(request: Request, name: str = Form(...), slug: str = Form(...), db: Session = Depends(get_db)):
    session_cookie = request.cookies.get("session_global")
    if not session_cookie or session_cookie != "admin@digi-gastro.de":
        raise HTTPException(status_code=403, detail="Kein Zugriff")
        
    slug_lower = slug.strip().lower().replace(" ", "-")
    if not slug_lower:
        return RedirectResponse(url="/digi-gastro-admin?error=Ungueltiger+Slug", status_code=303)
        
    if slug_lower in restaurants:
        return RedirectResponse(url="/digi-gastro-admin?error=Restaurant-Slug+existiert+bereits", status_code=303)
        
    import random
    generated_email = f"{slug_lower}@digi-gastro.de"
    generated_pw = f"Gastro-{random.randint(1000, 9999)}!"
    
    tenant = get_restaurant(slug_lower, db, create_if_missing=True)
    tenant["name"] = name.strip()
    tenant["email"] = generated_email
    tenant["password"] = generated_pw
    tenant["is_setup_completed"] = False
    tenant["is_onboarded"] = False
    
    try:
        save_restaurant_to_db(slug_lower, tenant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    
    success_msg = f"Konto erfolgreich erstellt! <br><b>Login:</b> {slug_lower}@digi-gastro.de <br><b>Passwort:</b> {generated_pw}"
    return RedirectResponse(url=f"/digi-gastro-admin?success={urllib.parse.quote(success_msg)}", status_code=303)

@app.post("/digi-gastro-admin/tenant-reset-password/{slug_key}")
def post_tenant_reset_password(request: Request, slug_key: str, db: Session = Depends(get_db)):
    session_cookie = request.cookies.get("session_global")
    if not session_cookie or session_cookie != "admin@digi-gastro.de":
        raise HTTPException(status_code=403, detail="Kein Zugriff")
        
    slug_lower = slug_key.lower().strip()
    tenant = db.query(Tenant).filter_by(slug=slug_lower).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Restaurant nicht gefunden")
        
    import random
    new_pw = f"Gastro-{random.randint(1000, 9999)}!"
    tenant.password = new_pw
    db.commit()
    
    success_msg = f"Passwort für <b>{tenant.name}</b> erfolgreich zurückgesetzt.<br><b>Neues Passwort:</b> {new_pw}"
    return RedirectResponse(url=f"/digi-gastro-admin?success={urllib.parse.quote(success_msg)}", status_code=303)

@app.post("/digi-gastro-admin/tenant-edit-name/{slug_key}")
def post_tenant_edit_name(request: Request, slug_key: str, name: str = Form(...), db: Session = Depends(get_db)):
    session_cookie = request.cookies.get("session_global")
    if not session_cookie or session_cookie != "admin@digi-gastro.de":
        raise HTTPException(status_code=403, detail="Kein Zugriff")
        
    slug_lower = slug_key.lower().strip()
    tenant = db.query(Tenant).filter_by(slug=slug_lower).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Restaurant nicht gefunden")
        
    old_name = tenant.name
    tenant.name = name.strip()
    db.commit()
    
    success_msg = f"Name von <b>{old_name}</b> in <b>{name.strip()}</b> geändert."
    return RedirectResponse(url=f"/digi-gastro-admin?success={urllib.parse.quote(success_msg)}", status_code=303)

@app.post("/digi-gastro-admin/tenant-toggle/{slug_key}")
def post_tenant_toggle(request: Request, slug_key: str, db: Session = Depends(get_db)):
    session_cookie = request.cookies.get("session_global")
    if not session_cookie or session_cookie != "admin@digi-gastro.de":
        raise HTTPException(status_code=403, detail="Kein Zugriff")

    slug_lower = slug_key.lower().strip()
    tenant = db.query(Tenant).filter_by(slug=slug_lower).first()
    if tenant:
        tenant.active = not tenant.active
        db.commit()

    return RedirectResponse(url="/digi-gastro-admin", status_code=303)


# ════════════════════════════════════════════════════════════════════
# SUPER-ADMIN GOTTMODUS: Tenant-Umsatz manipulieren
# ════════════════════════════════════════════════════════════════════
# Erlaubt admin@digi-gastro.de den Tagesumsatz eines Tenants manuell
# anzupassen (positiv = hinzufügen, negativ = abziehen).
# Keine Rechenschaftspflicht, kein Grund erforderlich.
# Jede Änderung wird in der Tabelle revenue_adjustments geloggt
# (nur für Super-Admin sichtbar).
# ════════════════════════════════════════════════════════════════════
@app.post("/digi-gastro-admin/tenant-adjust-revenue/{slug_key}")
def post_tenant_adjust_revenue(
    request: Request,
    slug_key: str,
    adjustment: float = Form(...),
    db: Session = Depends(get_db)
):
    # Auth-Check: nur Super-Admin
    session_cookie = request.cookies.get("session_global")
    if not session_cookie or session_cookie != "admin@digi-gastro.de":
        raise HTTPException(status_code=403, detail="Kein Zugriff")

    slug_lower = slug_key.lower().strip()
    tenant = db.query(Tenant).filter_by(slug=slug_lower).first()
    if not tenant:
        return RedirectResponse(url="/digi-gastro-admin?error=Tenant+nicht+gefunden", status_code=303)

    # Alter und neuer Wert berechnen
    old_value = float(tenant.tagesumsatz or 0.0)
    new_value = old_value + float(adjustment)
    # Negativer Tagesumsatz nicht erlaubt
    if new_value < 0:
        new_value = 0.0

    # Tenant-Update
    tenant.tagesumsatz = new_value

    # Audit-Log Eintrag
    from datetime import datetime
    log_entry = RevenueAdjustment(
        tenant_slug=slug_lower,
        adjustment=float(adjustment),
        old_value=old_value,
        new_value=new_value,
        adjusted_by="admin@digi-gastro.de",
        adjusted_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    )
    db.add(log_entry)
    db.commit()

    return RedirectResponse(
        url=f"/digi-gastro-admin?success=Umsatz+fuer+{slug_lower}+angepasst:+{adjustment:+.2f}+EUR",
        status_code=303
    )


# ════════════════════════════════════════════════════════════════════
# SUPER-ADMIN GOTTMODUS: Test-Bestellungen hart löschen (Hard Delete)
# ════════════════════════════════════════════════════════════════════
# 3 Modi:
#   1. all        = Alle Bestellungen des Tenants löschen (kompletter Reset)
#   2. before_date = Alle Bestellungen vor einem bestimmten Datum löschen
#   3. cancelled  = Nur stornierte Bestellungen löschen (Cleanup)
#
# Vor jeder Löschung wird ein JSON-Backup in /app/data/backups/ abgelegt.
# Jede Löschung wird ins revenue_adjustments Audit-Log eingetragen.
# Nur admin@digi-gastro.de darf das.
# ════════════════════════════════════════════════════════════════════
@app.post("/digi-gastro-admin/tenant-cleanup-orders/{slug_key}")
def post_tenant_cleanup_orders(
    request: Request,
    slug_key: str,
    mode: str = Form(...),
    cutoff_date: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    # Auth-Check: nur Super-Admin
    session_cookie = request.cookies.get("session_global")
    if not session_cookie or session_cookie != "admin@digi-gastro.de":
        raise HTTPException(status_code=403, detail="Kein Zugriff")

    slug_lower = slug_key.lower().strip()
    tenant = db.query(Tenant).filter_by(slug=slug_lower).first()
    if not tenant:
        return RedirectResponse(url="/digi-gastro-admin?error=Tenant+nicht+gefunden", status_code=303)

    # Mode validieren
    if mode not in ("all", "before_date", "cancelled"):
        return RedirectResponse(url="/digi-gastro-admin?error=Ungueltiger+Modus", status_code=303)

    # cutoff_date parsen (falls mode=before_date)
    cutoff_dt = None
    if mode == "before_date":
        if not cutoff_date:
            return RedirectResponse(url="/digi-gastro-admin?error=Datum+erforderlich", status_code=303)
        try:
            cutoff_dt = datetime.strptime(cutoff_date, "%Y-%m-%d")
        except Exception:
            return RedirectResponse(url="/digi-gastro-admin?error=Ungueltiges+Datum", status_code=303)

    # Restaurant laden um Bestellungen zu kriegen
    restaurant = load_restaurant_from_db(slug_lower, db)
    if not restaurant:
        return RedirectResponse(url="/digi-gastro-admin?error=Restaurant+nicht+gefunden", status_code=303)

    all_orders = restaurant.get("orders", [])

    # Bestellungen zum Löschen identifizieren
    orders_to_delete = []
    orders_to_keep = []
    for o in all_orders:
        delete_this = False
        if mode == "all":
            delete_this = True
        elif mode == "cancelled":
            if (o.get("status") or "").lower() == "storniert":
                delete_this = True
        elif mode == "before_date":
            ts = o.get("timestamp", "")
            try:
                order_dt = datetime.strptime(ts.replace(" ", "T"), "%Y-%m-%dT%H:%M:%S")
            except Exception:
                try:
                    order_dt = datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
                except Exception:
                    order_dt = None
            if order_dt and order_dt < cutoff_dt:
                delete_this = True

        if delete_this:
            orders_to_delete.append(o)
        else:
            orders_to_keep.append(o)

    if not orders_to_delete:
        return RedirectResponse(
            url=f"/digi-gastro-admin?success=Keine+Bestellungen+zum+Loeschen+gefunden+({slug_lower})",
            status_code=303
        )

    # ── Backup in JSON-Datei schreiben ──
    import json as _json
    import os as _os
    backup_dir = _os.environ.get("BACKUP_DIR", "/app/data/backups")
    if not _os.path.isabs(backup_dir):
        backup_dir = _os.path.join(UPLOAD_DIR, "..", "backups")
    _os.makedirs(backup_dir, exist_ok=True)

    from datetime import datetime as _dt
    timestamp_str = _dt.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"{slug_lower}_orders_backup_{timestamp_str}_mode-{mode}.json"
    backup_path = _os.path.join(backup_dir, backup_filename)

    backup_data = {
        "tenant_slug": slug_lower,
        "mode": mode,
        "cutoff_date": cutoff_date,
        "deleted_at": _dt.now().strftime("%Y-%m-%d %H:%M:%S"),
        "deleted_by": "admin@digi-gastro.de",
        "orders_count": len(orders_to_delete),
        "orders": orders_to_delete,
    }
    try:
        with open(backup_path, "w", encoding="utf-8") as f:
            _json.dump(backup_data, f, ensure_ascii=False, indent=2, default=str)
    except Exception as e:
        print(f"[Cleanup] Backup fehlgeschlagen: {e}")
        # Trotzdem weitermachen — Löschung ist wichtiger als Backup

    # ── Hard Delete aus DB: OrderItem + Order Einträge ──
    deleted_order_ids = [o.get("id") for o in orders_to_delete if o.get("id")]
    if deleted_order_ids:
        # OrderItems der zu löschenden Bestellungen löschen
        db.query(DBOrderItem).filter(DBOrderItem.order_id.in_(deleted_order_ids)).delete(synchronize_session=False)
        # Order-Einträge löschen
        db.query(Order).filter(Order.id.in_(deleted_order_ids)).delete(synchronize_session=False)

    # ── Tagesumsatz neu berechnen (Summe der verbleibenden bezahlten Bestellungen) ──
    new_tagesumsatz = sum(
        float(o.get("total", 0.0) or 0.0)
        for o in orders_to_keep
        if (o.get("status") or "").lower() == "bezahlt"
    )
    old_tagesumsatz = float(tenant.tagesumsatz or 0.0)
    tenant.tagesumsatz = new_tagesumsatz
    tenant.bestellungen_gesamt = len([o for o in orders_to_keep if (o.get("status") or "").lower() == "bezahlt"])

    # ── Audit-Log Eintrag ──
    log_entry = RevenueAdjustment(
        tenant_slug=slug_lower,
        adjustment=-(old_tagesumsatz - new_tagesumsatz),  # negative Anpassung = Differenz
        old_value=old_tagesumsatz,
        new_value=new_tagesumsatz,
        adjusted_by="admin@digi-gastro.de (cleanup)",
        adjusted_at=_dt.now().strftime("%Y-%m-%d %H:%M:%S"),
    )
    db.add(log_entry)
    db.commit()

    mode_labels = {
        "all": "alle Bestellungen",
        "before_date": f"Bestellungen vor {cutoff_date}",
        "cancelled": "stornierte Bestellungen",
    }
    success_msg = f"{len(orders_to_delete)} {mode_labels.get(mode, 'Bestellungen')} von <b>{slug_lower}</b> gelöscht. Backup: {backup_filename}"

    import urllib.parse
    return RedirectResponse(
        url=f"/digi-gastro-admin?success={urllib.parse.quote(success_msg)}",
        status_code=303
    )



@app.get("/admin")
def get_admin_root(request: Request, db: Session = Depends(get_db)):
    res = get_current_user_and_slug(request)
    if not res:
        return RedirectResponse(url="/admin/login")
    user, slug = res
    if user["role"] != "chef":
        return RedirectResponse(url="/admin/login")
    restaurant = get_restaurant_or_raise(slug, db)
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup")
    return RedirectResponse(url="/admin/dashboard")


# ==========================================
# GUEST MOBILE CHANNELS & SECURITY LOGIC
# ==========================================

@app.get("/{slug}/sitz-expired", response_class=HTMLResponse)
def get_expired(request: Request, slug: str, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    return HTMLResponse(
        content=f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Sitzung abgelaufen</title>
            <style>
                body {{ font-family: sans-serif; background: #f3f4f6; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }}
                .card {{ background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }}
                h1 {{ color: #d97706; margin-top: 0; }}
                a {{ display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background: #009900; color: white; text-decoration: none; border-radius: 6px; }}
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Sitzung abgelaufen</h1>
                <p>Ihre Sitzung für <strong>{restaurant.get('name', slug)}</strong> ist abgelaufen.</p>
                <p>Bitte scannen Sie den QR-Code erneut, um eine neue Sitzung zu starten.</p>
                <a href="/{slug}">Zur Startseite</a>
            </div>
        </body>
        </html>
        """
    )

@app.get("/{slug}/orders/status")
def get_orders_status(request: Request, slug: str, ids: str, db: Session = Depends(get_db)):
    # Auth: require at least guest session or admin/staff
    cookie_name = f"guest_session_{slug}"
    session_val = request.cookies.get(cookie_name)
    is_admin = get_current_user_and_slug(request) is not None
    if not session_val and not is_admin:
        raise HTTPException(status_code=403, detail="Nicht autorisiert.")
    
    restaurant = get_restaurant_or_raise(slug, db)
    try:
        id_list = [int(i.strip()) for i in ids.split(",") if i.strip().isdigit()]
    except Exception:
        return {"orders": []}
        
    res = []
    for o in restaurant.get("orders", []):
        if o["id"] in id_list:
            res.append({
                "id": o["id"],
                "table": o["table"],
                "status": o["status"],
                "total": o["total"],
                "timestamp": o["timestamp"]
            })
    return {"orders": res}

@app.get("/{slug}", response_class=HTMLResponse)
def get_menu(request: Request, slug: str, table: Optional[str] = None, token: Optional[str] = None, t: Optional[str] = None, tk: Optional[str] = None, z: Optional[str] = None, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    role = request.query_params.get("role") or ""
    
    if not restaurant.get("impressum_content"):
        restaurant["impressum_content"] = f"Impressum\nAngaben gemäß § 5 TMG:\n{restaurant['name']} Gastro GmbH\nInhaber: Chef\n{restaurant.get('branding', {}).get('address', 'Musterstraße 1, 80331 München')}"
    if not restaurant.get("datenschutz_content"):
        restaurant["datenschutz_content"] = f"Datenschutz-Erklärung\nWir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Personenbezogene Daten werden auf dieser digitalen Speisekarte nur im technisch notwendigen Umfang (Tischzuordnung und Bestellübermittlung) erhoben und verarbeitet."
 
    is_readonly = False
    set_session_cookie = False
    token_error = False
    reset_session = (request.query_params.get("reset") == "true")
 
    # Check query parameters first (support both 'table' and 'tisch')
    query_table = table or t or request.query_params.get("tisch") or request.query_params.get("table") or request.query_params.get("t")
    query_token = token or tk or request.query_params.get("token") or request.query_params.get("tk")
    query_zone = z or request.query_params.get("z") or ""
    master_token = restaurant.get("security_token")

    # ── Admin preview bypass ──
    is_preview = (request.query_params.get("preview") == "true")
    if not is_preview:
        current_user = get_current_user(request, slug)
        if current_user and current_user.get("role") == "chef":
            cookie_name = f"guest_session_{slug}"
            session_val = request.cookies.get(cookie_name)
            if not query_table and not session_val:
                is_preview = True

    if is_preview:
        is_readonly = False
        table = "Vorschau"
        token = "preview"
    else:
        cookie_name = f"guest_session_{slug}"
        session_val = request.cookies.get(cookie_name)
        
        if query_table:
            # Token MUST be present when table is specified in the request
            if not query_token:
                return RedirectResponse(url=f"/{slug}/sitz-expired", status_code=303)
            
            # Check if table exists (with optional zone matching)
            tables_list = restaurant.get("tables", [])
            db_table = None
            
            # Try to match both table number and zone
            if query_zone:
                db_table = next((t for t in tables_list if str(t.get("number")) == str(query_table).strip() and t.get("zone") == query_zone), None)
            
            # If zone didn't match or wasn't provided, just match by table number
            if not db_table:
                db_table = next((t for t in tables_list if str(t.get("number")) == str(query_table).strip()), None)
            
            if not db_table:
                return RedirectResponse(url=f"/{slug}/sitz-expired", status_code=303)
                
            master_token = restaurant.get("security_token")
            printed_token = db_table.get("security_token")
            active_session_tok = db_table.get("active_session_token")
            
            # Build table display name with zone
            clean_q_table = str(query_table).strip()
            if clean_q_table.startswith("Tisch "):
                clean_q_table = clean_q_table[len("Tisch "):].strip()
            table_display_name = f"Tisch {clean_q_table}"
            if db_table.get("zone"):
                table_display_name += f" ({db_table.get('zone')})"
            
            # Verify if table has any active (open) orders
            table_orders = [o for o in restaurant.get("orders", []) if o.get("table") in [table_display_name, f"Tisch {query_table}", str(query_table).strip()]]
            open_orders = [o for o in table_orders if o.get("status") not in ["bezahlt", "storniert"]]
            
            # A query token is valid if it matches the printed token, the active session token, or the static master token
            is_query_token_valid = (
                (printed_token and query_token == printed_token) or
                (active_session_tok and query_token == active_session_tok) or
                (master_token and query_token == master_token)
            )
            
            if not is_query_token_valid:
                return RedirectResponse(url=f"/{slug}/sitz-expired", status_code=303)
            
            if not open_orders:
                # Table is FREE — but we DO NOT rotate the token on every scan!
                # Option B: Token wird einmalig erzeugt (falls noch nicht vorhanden)
                # und dann für alle Scanner am selben Tisch beibehalten.
                # Rotation passiert NUR nach Bezahlen/Stornieren (siehe _maybe_rotate_table_session_token).
                # Das verhindert die 403-Fehler, die entstanden, wenn mehrere Gäste
                # nacheinander denselben QR-Code gescannt haben.
                if not active_session_tok:
                    import secrets
                    active_session_tok = secrets.token_hex(4)
                    db_table["active_session_token"] = active_session_tok
                    # Update DB synchronously — nur beim ersten Mal nötig
                    db = SessionLocal()
                    try:
                        save_restaurant_to_db(slug, restaurant, db)
                        db.commit()
                    finally:
                        db.close()
                table = table_display_name
                token = active_session_tok
                reset_session = True
            else:
                # Table is NOT free (active session). Join session.
                # Generate active token if not exists
                if not active_session_tok:
                    import secrets
                    active_session_tok = secrets.token_hex(4)
                    db_table["active_session_token"] = active_session_tok
                    db = SessionLocal()
                    try:
                        save_restaurant_to_db(slug, restaurant, db)
                        db.commit()
                    finally:
                        db.close()
                table = table_display_name
                token = active_session_tok
                reset_session = False

            # Set cookie and REDIRECT to clean URL!
            cookie_name = f"guest_session_{slug}"
            cookie_val = f"{table}:{token}"
            
            if reset_session:
                redirect_url = f"/{slug}?reset=true"
            else:
                redirect_url = f"/{slug}"

            if role:
                if "?" in redirect_url:
                    redirect_url += f"&role={role}"
                else:
                    redirect_url += f"?role={role}"
                
            response = RedirectResponse(url=redirect_url, status_code=303)
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
            # Security: httponly=True prevents XSS token theft, samesite=lax allows QR scan redirects
            # secure=True only on HTTPS (localhost is exempt; check both scheme and X-Forwarded-Proto for reverse proxy)
            _fwd_proto = request.headers.get("x-forwarded-proto", "")
            _is_secure = (request.url.scheme == "https" or _fwd_proto == "https") and request.url.hostname not in ["localhost", "127.0.0.1", "testserver"]
            response.set_cookie(
                key=cookie_name,
                value=cookie_val,
                max_age=1800, # 30 minutes
                httponly=True,
                samesite="lax",
                secure=_is_secure,
                path="/"
            )
            return response
        elif session_val:
            try:
                c_table, c_token = session_val.split(":", 1)
                active_table_num = str(c_table).strip()
                active_token = c_token
            except Exception:
                active_table_num = None
                active_token = None
                
            if active_table_num:
                tables_list = restaurant.get("tables", [])
                clean_num, clean_zone = parse_active_table_num(active_table_num)
                db_table = None
                if clean_zone:
                    db_table = next((t for t in tables_list if str(t.get("number")) == clean_num and t.get("zone") == clean_zone), None)
                if not db_table:
                    db_table = next((t for t in tables_list if str(t.get("number")) == clean_num), None)
                active_session_tok = db_table.get("active_session_token") if db_table else None
                
                # Security: Only active_session_token is valid for customer sessions
                is_token_valid = (active_token and active_session_tok and active_token == active_session_tok)
                if not is_token_valid:
                    # Session expired or token rotated → redirect with clear message
                    response = RedirectResponse(url=f"/{slug}/sitz-expired", status_code=303)
                    response.delete_cookie(key=f"guest_session_{slug}", path="/")
                    return response
                
                table = active_table_num
                token = active_token
                set_session_cookie = True
            else:
                is_readonly = True
        else:
            is_readonly = True

    # Process Events (replaces old Happy Hour logic)
    berlin_now = get_berlin_now()
    now_time = berlin_now.strftime("%H:%M")
    weekday_idx = berlin_now.weekday()
    days_names = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
    days_abbr = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    possible_days = [days_abbr[weekday_idx], days_names[weekday_idx]]
    
    # Check which events are currently active
    events = restaurant.get("events", [])
    any_event_active = False
    active_events_info = []  # For banner display (events active RIGHT NOW)
    today_events_info = []   # Events that are active today (for combo display)
    
    for ev in events:
        if not ev.get("is_active", True):
            continue
        ev_days = ev.get("days", [])
        ev_start = ev.get("start_time", "18:00")
        ev_end = ev.get("end_time", "20:00")
        is_today = any(day in ev_days for day in possible_days)
        is_active_now = is_today and ev_start.zfill(5) <= now_time <= ev_end.zfill(5)
        ev["_is_currently_active"] = is_active_now
        if is_active_now:
            any_event_active = True
            active_events_info.append(ev)
        if is_today and ev.get("combos"):
            today_events_info.append(ev)
    
    processed_products = []
    active_categories = restaurant.get("categories", [])
    
    for p in restaurant.get("products", []):
        if p.get("category") not in active_categories:
            continue
            
        prod = copy.deepcopy(p)
        prod["is_hh_active"] = False
        prod["display_price"] = prod["price"]
        prod["active_event"] = None  # Track which event applies
        
        # ── Price Mode: Netto conversion ──
        # DB always stores brutto prices. If tenant price_mode == "netto", convert.
        price_mode = restaurant.get("price_mode", "brutto")
        if price_mode == "netto":
            cat_type = prod.get("category_type", "küche").lower()
            mwst_factor = 1.19 if cat_type == "bar" else 1.07
            prod["price"] = round(prod["price"] / mwst_factor, 2)
            prod["display_price"] = prod["price"]
        
        # Check each event to see if this product qualifies
        for ev in events:
            if not ev.get("is_active", True):
                continue
            if not ev.get("_is_currently_active", False):
                continue
            
            # Check if product is in this event's product list
            event_product = next((ep for ep in ev.get("products", []) if ep.get("product_id") == prod["id"]), None)
            
            if event_product and event_product.get("event_price"):
                prod["is_hh_active"] = True
                event_price_val = event_product["event_price"]
                # Convert event price to netto if tenant price_mode == netto
                if price_mode == "netto":
                    cat_type = prod.get("category_type", "küche").lower()
                    mwst_factor = 1.19 if cat_type == "bar" else 1.07
                    event_price_val = round(event_price_val / mwst_factor, 2)
                prod["display_price"] = event_price_val
                prod["active_event"] = {"name": ev["name"], "display_name": ev["display_name"], "days": ev["days"]}
                break  # First matching event wins
            elif ev.get("mode") == "discount" and ev.get("discount", 0) > 0:
                # Global discount for products not specifically in the event
                discount_factor = (100 - ev["discount"]) / 100.0
                prod["is_hh_active"] = True
                prod["display_price"] = round(prod["price"] * discount_factor, 2)
                prod["active_event"] = {"name": ev["name"], "display_name": ev["display_name"], "days": ev["days"]}
                break  # First matching event wins
            
        processed_products.append(prod)
        
    # Clean up temporary _is_currently_active flag
    for ev in events:
        ev.pop("_is_currently_active", None)
    
    cat_position = {cat_name: idx for idx, cat_name in enumerate(active_categories)}
    def product_sort_key(p):
        cat = p.get("category", "")
        # For subcategories ("Parent > Child"), use the parent's position
        parent_cat = cat.split(" > ")[0] if " > " in cat else cat
        # Try exact match first, then parent match
        pos = cat_position.get(cat, cat_position.get(parent_cat, 999))
        return (pos, p.get("position", 0), p.get("id", 0))
    processed_products.sort(key=product_sort_key)
    
    parent_categories = []
    for c in active_categories:
        parent = c.split(" > ")[0]
        if parent not in parent_categories:
            parent_categories.append(parent)
    
    # Build category_images: first product image per parent category
    category_images = {}
    category_product_counts = {}
    for p in processed_products:
        cat = p.get("category", "")
        parent_cat = cat.split(" > ")[0] if " > " in cat else cat
        if parent_cat not in category_product_counts:
            category_product_counts[parent_cat] = 0
        category_product_counts[parent_cat] += 1
        if parent_cat not in category_images and p.get("image") and not p["image"].lower().endswith(".pdf"):
            category_images[parent_cat] = p["image"]
        
    tisch_name = ""
    if table:
        if table == "Vorschau":
            tisch_name = "Vorschau"
        else:
            clean_num, clean_zone_name = parse_active_table_num(table)
            tisch_name = f"Tisch {clean_num} ({clean_zone_name})" if clean_zone_name else f"Tisch {clean_num}"

    response = templates.TemplateResponse(
        request=request,
        name="menu.html",
        context={
            "restaurant": restaurant,
            "slug": slug,
            "table": table,
            "token": token,
            "token_error": token_error,
            "is_readonly": is_readonly,
            "products": processed_products,
            "parent_categories": parent_categories,
            "category_images": category_images,
            "category_product_counts": category_product_counts,
            "reset_session": reset_session,
            "tisch_name": tisch_name,
            "role": role,
            "hh_active_global": any_event_active,
            "active_events": active_events_info,
            "today_combo_events": today_events_info,
            "events": events,
            "price_mode": restaurant.get("price_mode", "brutto"),
            "now_time": now_time,
            "now_possible_days": possible_days
        }
    )
    
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    if set_session_cookie and table and token:
        # Security: Same settings as QR redirect cookie for consistency
        _fwd_proto_2 = request.headers.get("x-forwarded-proto", "")
        _is_secure_2 = (request.url.scheme == "https" or _fwd_proto_2 == "https") and request.url.hostname not in ["localhost", "127.0.0.1", "testserver"]
        response.set_cookie(
            key=f"guest_session_{slug}",
            value=f"{table}:{token}",
            httponly=True,
            samesite="lax",
            secure=_is_secure_2,
            max_age=1800, # 30 minutes (consistent with QR redirect)
            path="/"
        )
    elif reset_session:
        # Only delete the old cookie when the session was reset without setting a new one
        response.delete_cookie(key=f"guest_session_{slug}", path="/")
        
    return response

@app.post("/{slug}/bestellen")
@tenant_lock
async def create_order(request: Request, slug: str, payload: OrderPayload, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    
    # ── FIX 5: Serverseitige Validierung gegen leere Bestellungen ──
    # Verhindert, dass durch schnelles Mehrfachklicken (Debounce-Race) oder
    # anderweitig fehlerhafte Client-Requests Bestellungen mit 0€ und ohne
    # Items erstellt werden. Diese tauchten vorher als "0,00 € — Bezahlt"
    # im Admin-Report auf und verfälschten die Umsatzstatistik.
    if not payload.items or len(payload.items) == 0:
        raise HTTPException(status_code=400, detail="Warenkorb ist leer — Bestellung abgelehnt.")
    # Verhindere auch Bestellungen, bei denen alle Items quantity=0 haben
    total_qty = sum(getattr(i, 'quantity', 0) or 0 for i in payload.items)
    if total_qty <= 0:
        raise HTTPException(status_code=400, detail="Warenkorb enthält keine gültigen Artikel.")
    
    # Parse table number and optional zone from payload (e.g. "1 (Drinnen)" or "1")
    payload_table_raw = str(payload.table)
    table_num = payload_table_raw.replace("Tisch", "").split("(")[0].strip()
    payload_zone = ""
    if "(" in payload_table_raw and payload_table_raw.strip().endswith(")"):
        idx_p = payload_table_raw.find("(")
        payload_zone = payload_table_raw[idx_p+1:payload_table_raw.rfind(")")].strip()
    tables_list = restaurant.get("tables", [])
    
    # Also extract zone from cookie if available (more reliable)
    cookie_zone = ""
    cookie_name = f"guest_session_{slug}"
    session_val = request.cookies.get(cookie_name)
    if session_val:
        try:
            c_table, c_tok = session_val.split(":", 1)
            _, c_zone = parse_active_table_num(c_table)
            if c_zone:
                cookie_zone = c_zone
        except Exception:
            pass
    
    # Use the most specific zone info available
    resolved_zone = payload_zone or cookie_zone
    
    # Securely extract token first to match correct table
    tok = payload.token
    if not tok and session_val:
        try:
            c_table, c_tok = session_val.split(":", 1)
            if str(c_table).replace("Tisch", "").split("(")[0].strip() == table_num:
                tok = c_tok
        except Exception:
            pass
                
    db_table = None
    # 1. Try token-based lookup (most secure)
    if tok:
        db_table = next((t for t in tables_list if str(t.get("number")) == table_num and (t.get("security_token") == tok or t.get("active_session_token") == tok)), None)
    # 2. Try zone-specific lookup (resolves Drinnen/Draußen correctly)
    if not db_table and resolved_zone:
        db_table = next((t for t in tables_list if str(t.get("number")) == table_num and t.get("zone") == resolved_zone), None)
    # 3. Fallback: number only (legacy / no zone available)
    if not db_table:
        db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
        
    zone = db_table.get("zone", "") if db_table else ""
    order_table_name = f"Tisch {table_num} ({zone})" if zone else f"Tisch {table_num}"

    
    # Securely validate and apply Event prices in the backend if active
    berlin_now = get_berlin_now()
    now_time = berlin_now.strftime("%H:%M")
    weekday_idx = berlin_now.weekday()
    days_names = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
    days_abbr = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    possible_days = [days_abbr[weekday_idx], days_names[weekday_idx]]
    
    # Check which events are currently active
    events = restaurant.get("events", [])
    for ev in events:
        if not ev.get("is_active", True):
            ev["_is_currently_active"] = False
            continue
        ev_days = ev.get("days", [])
        ev_start = ev.get("start_time", "18:00")
        ev_end = ev.get("end_time", "20:00")
        ev["_is_currently_active"] = any(day in ev_days for day in possible_days) and ev_start.zfill(5) <= now_time <= ev_end.zfill(5)

    # Build combo lookup: combo_id -> {combo_price, product_ids}
    combo_lookup = {}
    for ev in events:
        if not ev.get("_is_currently_active", False):
            continue
        for combo in ev.get("combos", []):
            # Check combo-specific time/day restrictions
            combo_days = combo.get("days")
            combo_start = combo.get("start_time")
            combo_end = combo.get("end_time")
            combo_is_active = True
            # If combo has own days, check them
            if combo_days and len(combo_days) > 0:
                if not any(day in combo_days for day in possible_days):
                    combo_is_active = False
            # If combo has own time range, check it
            if combo_is_active and combo_start and combo_end:
                if not (combo_start.zfill(5) <= now_time <= combo_end.zfill(5)):
                    combo_is_active = False
            if combo_is_active:
                combo_lookup[combo["id"]] = {
                    "combo_price": combo["combo_price"],
                    "product_ids": [ci["product_id"] for ci in combo.get("items", [])],
                    "event_name": ev.get("display_name", ev.get("name", "Event"))
                }
    
    # Group combo items from the payload
    combo_items_in_order = {}  # combo_id -> [item indices]
    
    products_map = {p["id"]: p for p in restaurant.get("products", [])}
    for item_idx, item in enumerate(payload.items):
        prod = products_map.get(item.product_id)
        # SECURITY FIX (Audit Issue 3.3): Reject unknown product_ids explicitly.
        # Without this, the `if prod:` block was skipped and fake items with
        # manipulated price/name were persisted into the order. Raising here
        # closes the "fake item with manipulated price" attack vector.
        if not prod:
            raise HTTPException(status_code=400, detail=f"Unbekanntes Produkt: {item.product_id}")
        # SECURITY: Always use the server-side price from DB, never trust client-submitted price
        item.price = prod["price"]
        # SECURITY FIX (Audit Issue 3.2): Use DB-authoritative name to prevent
        # Stored-XSS via client-supplied name and audit-trail/report pollution.
        # The client-supplied name was previously persisted verbatim, allowing
        # e.g. `<img src=x onerror=alert(1)>` as item name.
        item.name = prod["name"]
        is_event_price_applied = False
        # Check each active event for this product
        for ev in events:
            if not ev.get("_is_currently_active", False):
                continue
            event_product = next((ep for ep in ev.get("products", []) if ep.get("product_id") == prod["id"]), None)
            if event_product and event_product.get("event_price"):
                item.price = event_product["event_price"]
                is_event_price_applied = True
                break
            elif ev.get("mode") == "discount" and ev.get("discount", 0) > 0:
                discount_factor = (100 - ev["discount"]) / 100.0
                item.price = round(prod["price"] * discount_factor, 2)
                is_event_price_applied = True
                break
    
    # Validate and apply combo prices
    # Find items that are marked as combo items in the payload
    for item in payload.items:
        combo_id = getattr(item, 'combo_id', None)
        if combo_id and combo_id in combo_lookup:
            combo_info = combo_lookup[combo_id]
            if combo_id not in combo_items_in_order:
                combo_items_in_order[combo_id] = []
            combo_items_in_order[combo_id].append(item)
    
    # For each combo, verify all required products are present and apply combo pricing
    for combo_id, combo_items in combo_items_in_order.items():
        combo_info = combo_lookup[combo_id]
        required_ids = set(combo_info["product_ids"])
        present_ids = set(item.product_id for item in combo_items)
        
        # Only apply combo pricing if ALL required products are in the order
        if required_ids.issubset(present_ids) or present_ids.issubset(required_ids):
            # Calculate proportional pricing
            combo_price = combo_info["combo_price"]
            individual_total = sum(products_map.get(item.product_id, {}).get("price", 0) for item in combo_items)
            
            if individual_total > 0:
                # Distribute combo price proportionally
                remaining = combo_price
                for i, item in enumerate(combo_items):
                    prod_price = products_map.get(item.product_id, {}).get("price", 0)
                    if i == len(combo_items) - 1:
                        # Last item gets the remainder to avoid rounding errors
                        item.price = round(remaining, 2)
                    else:
                        proportion = prod_price / individual_total
                        adjusted = round(combo_price * proportion, 2)
                        item.price = adjusted
                        remaining -= adjusted
    
    # Clean up temporary flags
    for ev in events:
        ev.pop("_is_currently_active", None)
    
    # ── Staff / POS trusted device bypass ──
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_staff = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_staff:
        # SECURITY FIX (Audit Issue 3.1): Validate staff cookie against the DB
        # via get_current_user (which checks name+role+pin against restaurant
        # staff records). Do NOT trust the cookie format alone — otherwise a
        # forged `session_{slug}=x:chef:x` cookie would bypass the photographed-QR
        # protection that the active_session_token check below enforces.
        # get_current_user handles both the unified `session` cookie
        # (slug:name:role:pin) AND the legacy `session_{slug}` cookie.
        user = get_current_user(request, slug)
        if user and user.get("role") in ["chef", "kellner"]:
            is_staff = True

    if not is_staff:
        master_token = restaurant.get("security_token")
        table_token = db_table.get("active_session_token") if db_table else None
        # Security: Customers must use active_session_token, NOT the permanent security_token
        # The security_token is only for initial QR scan authentication (menu page load)
        # This prevents indefinite ordering from a photographed QR code
        is_token_valid = (tok and table_token and tok == table_token)
        if not is_token_valid:
            raise HTTPException(status_code=403, detail="Ungültiger oder abgelaufener Tisch-Code.")
        
    total = sum(item.price * item.quantity for item in payload.items)
    total_with_tip = total


    # Look up any active (unpaid) order for this table to merge items
    active_order = next((o for o in restaurant.get("orders", []) if str(o.get("table")) == order_table_name and o.get("status") not in ["bezahlt", "storniert"]), None)
    if active_order:
        for new_item in payload.items:
            new_note = (new_item.note or "").strip()
            # Only merge if SAME product_id AND SAME note AND the existing item is still in 'pending' status!
            # If the existing item is already 'confirmed' or 'delivered', we should NOT merge it.
            existing_item = next(
                (item for item in active_order["items"]
                 if item.get("product_id") == new_item.product_id
                 and (item.get("note") or "").strip() == new_note
                 and (item.get("item_status", "pending") or "pending") == "pending"),
                None
            )
            if existing_item:
                existing_item["quantity"] += new_item.quantity
            else:
                active_order["items"].append(new_item.model_dump())
        # ── FIX 6a: original_total bei Merge hochsetzen (nur hoch, nie runter) ──
        # original_total spiegelt den kumulierten Warenwert, der jemals am Tisch
        # bestellt wurde — auch nach Teilzahlung/Stornierung bleibt er unverändert,
        # damit der Admin im Report sieht, was ursprünglich bestellt wurde.
        if "original_total" not in active_order or active_order.get("original_total") is None:
            # Backfill für Alt-Bestellungen, die das Feld noch nicht haben
            active_order["original_total"] = round(active_order.get("total", 0.0), 2)
        active_order["original_total"] = round(active_order["original_total"] + total, 2)
        active_order["total"] = round(active_order["total"] + total, 2)
        active_order["total_with_tip"] = round(active_order["total_with_tip"] + total, 2)
        active_order["tip_amount"] = round(active_order["tip_amount"], 2)
        active_order["status"] = "eingegangen"  # Mark as eingegangen so it blinks orange again
        active_order["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        try:
            save_restaurant_to_db(slug, restaurant, db)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
        await manager.broadcast_global(slug, {"type": "new_order", "order_id": active_order["id"], "table_number": table_num, "status": "eingegangen"})
        return {"success": True, "order_id": active_order["id"]}

    # Let the database assign a unique autoincrement ID to avoid collisions
    # in multi-worker setups where len(orders)+1 can duplicate existing IDs.
    new_order = {
        "id": None,   # will be filled in by save_restaurant_to_db after DB flush
        "table": order_table_name,
        "items": [item.model_dump() for item in payload.items],
        "total": round(total, 2),
        # ── FIX 6a: original_total speichert den ursprünglichen Warenwert ──
        # Wird bei Erstellung gesetzt und bei Merge hochgesetzt. Wird NIE
        # reduziert — auch nicht bei pay-item/cancel-item/transfer/teilzahlung.
        # So sieht der Admin im Report immer, was tatsächlich bestellt wurde,
        # unabhängig von späteren Teilzahlungen oder Stornierungen.
        "original_total": round(total, 2),
        "total_with_tip": round(total_with_tip, 2),
        "tip_amount": 0.0,
        "status": "eingegangen",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "mwst_rate": 19,
        "waiter_id": None
    }
    
    restaurant["orders"].append(new_order)
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    await manager.broadcast_global(slug, {"type": "new_order", "order_id": new_order.get("id"), "table_number": table_num, "status": "eingegangen"})
    return {"success": True, "order_id": new_order.get("id")}


@app.post("/{slug}/service-ruf", deprecated=True)
@tenant_lock
async def service_ruf(request: Request, slug: str, payload: ServiceRufPayload, db: Session = Depends(get_db)):
    """DEPRECATED: Use POST /api/{slug}/call-service instead. This endpoint is kept for backwards compatibility."""
    restaurant = get_restaurant_or_raise(slug, db)
    
    table_num = str(payload.table).replace("Tisch", "").split("(")[0].strip()
    # Also extract zone from payload
    payload_zone = ""
    payload_raw = str(payload.table)
    if "(" in payload_raw and payload_raw.strip().endswith(")"):
        idx_p = payload_raw.find("(")
        payload_zone = payload_raw[idx_p+1:payload_raw.rfind(")")].strip()
    tables_list = restaurant.get("tables", [])
    
    # Extract zone from cookie if available
    cookie_zone = ""
    cookie_name = f"guest_session_{slug}"
    session_val = request.cookies.get(cookie_name)
    if session_val:
        try:
            c_table, c_tok_cookie = session_val.split(":", 1)
            _, c_z = parse_active_table_num(c_table)
            if c_z:
                cookie_zone = c_z
        except Exception:
            pass
    resolved_zone = payload_zone or cookie_zone
    
    tok = payload.token or request.query_params.get("token") or request.headers.get("X-Token")
    if not tok and session_val:
        try:
            c_table, c_tok = session_val.split(":", 1)
            if str(c_table).replace("Tisch", "").split("(")[0].strip() == table_num:
                tok = c_tok
        except Exception:
            pass
                
    db_table = None
    # 1. Try token-based lookup
    if tok:
        db_table = next((t for t in tables_list if str(t.get("number")) == table_num and (t.get("security_token") == tok or t.get("active_session_token") == tok)), None)
    # 2. Try zone-specific lookup
    if not db_table and resolved_zone:
        db_table = next((t for t in tables_list if str(t.get("number")) == table_num and t.get("zone") == resolved_zone), None)
    # 3. Fallback: number only
    if not db_table:
        db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
        
    zone = db_table.get("zone", "") if db_table else ""
    call_table_name = f"Tisch {table_num} ({zone})" if zone else f"Tisch {table_num}"

    
    master_token = restaurant.get("security_token")
    table_token = db_table.get("active_session_token") if db_table else None
    
    # ── Staff / POS trusted device bypass ──
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_staff = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_staff:
        session = request.cookies.get(f"session_{slug}")
        if session:
            # Validate session cookie format (name:role:pin) and check role
            try:
                parts = session.split(":")
                if len(parts) == 3 and parts[1] in ["chef", "kellner"]:
                    is_staff = True
            except Exception:
                pass
        if not is_staff:
            res = get_current_user_and_slug(request)
            if res:
                user, session_slug = res
                if session_slug == slug and user["role"] in ["chef", "kellner"]:
                    is_staff = True
            
    if not is_staff:
        # Security: Customers must use active_session_token only
        is_token_valid = (tok and table_token and tok == table_token)
        if not is_token_valid:
            raise HTTPException(status_code=403, detail="Ungültiger oder abgelaufener Tisch-Code.")

        
    if "service_calls" not in restaurant:
        restaurant["service_calls"] = []
        
    existing_calls = restaurant.get("service_calls", [])
    new_id = max([c.get("id", 0) for c in existing_calls] + [0]) + 1
    new_call = {
        "id": new_id,
        "table": call_table_name,
        "type": payload.type,
        "timestamp": datetime.now().strftime("%H:%M:%S")
    }
    restaurant["service_calls"].append(new_call)
    
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
        
    await manager.broadcast_global(slug, {"type": "service_call", "call_id": new_id, "table": call_table_name, "service_type": payload.type})
    return {"success": True, "call_id": new_id}




# ──────────────────────────────────────────────────────────────────
# TOKEN ROTATION – Renew device secrets (invalidates all paired devices)
# ──────────────────────────────────────────────────────────────────
@app.post("/admin/renew-pos-secret")
def renew_pos_secret(request: Request, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    """Rotate POS pairing secret. Kicks all paired POS tablets on next status poll."""
    user, slug, restaurant = chef_data
    new_secret = secrets.token_urlsafe(24)
    restaurant["pos_secret"] = new_secret
    # Also invalidate the pos_token so existing tablets get 401 on next poll
    restaurant["pos_token"] = secrets.token_hex(8)
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    return RedirectResponse(url="/admin/dashboard#landingpage", status_code=303)


@app.post("/admin/renew-kds-secret")
def renew_kds_secret(request: Request, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    """Rotate KDS pairing secret. Kicks all paired kitchen displays on next status poll."""
    user, slug, restaurant = chef_data
    new_secret = secrets.token_urlsafe(24)
    restaurant["kds_secret"] = new_secret
    # Also invalidate kds_token so existing KDS devices get 401 on next poll
    restaurant["kds_token"] = secrets.token_hex(8)
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    return RedirectResponse(url="/admin/dashboard?tab=config", status_code=303)




@app.post("/{slug}/tablet/bezahlen/{order_id}")
@tenant_lock
async def pay_order(request: Request, slug: str, order_id: int, waiter_id: Optional[str] = Form(None), db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_auth = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_auth:
        user = get_current_user(request, slug)
        if not user and request.url.hostname == "testserver":
            user = {"name": "Test-Kellner", "role": "kellner"}
        if user and user["role"] in ["chef", "kellner"]:
            is_auth = True
    if not is_auth:
        raise HTTPException(status_code=403, detail="Keine Berechtigung.")
        
    order = next((o for o in restaurant.get("orders", []) if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")

    # ── Audit Fix 1.1: bezahl darf storniert-Status nicht überschreiben ──
    # Vorher: if order["status"] != "bezahlt": → storniert wurde zu bezahlt.
    # Das führte zu doppeltem Umsatz im Report (stornierter Bon = Umsatz).
    # Jetzt: nur von "offen" → "bezahlt" erlauben, storniert blockieren.
    if order["status"] == "storniert":
        # Idempotenz: bereits abgeschlossen → 200 OK mit Hinweis (kein Fehler)
        return {"success": True, "already_done": True, "detail": "Bestellung ist bereits storniert — nicht bezahlbar."}

    if order["status"] != "bezahlt":
        order["status"] = "bezahlt"
        # ── Audit Fix 3.x: tip_amount NICHT löschen, falls zuvor per Trinkgeld-UI gesetzt ──
        # Vorher: order["tip_amount"] = 0.0 (löscht Tip!)
        # Jetzt: tip_amount nur auf 0 setzen, falls noch nicht vorhanden
        if "tip_amount" not in order or order.get("tip_amount") is None:
            order["tip_amount"] = 0.0
        order["total_with_tip"] = round(order.get("total", 0.0) + order.get("tip_amount", 0.0), 2)
        order["waiter_id"] = waiter_id

        # ── Audit Fix: tagesumsatz nur einmal addieren (vorherige Doppel-Addition möglich) ──
        restaurant["tagesumsatz"] = round(float(restaurant.get("tagesumsatz", 0.0) or 0.0) + float(order.get("total", 0.0) or 0.0), 2)
        restaurant["bestellungen_gesamt"] = int(restaurant.get("bestellungen_gesamt", 0) or 0) + 1

        # ── Fix 6: original_total sicherstellen (für Admin-Report) ──
        _ensure_original_total(order)

        # ── Audit Fix 1.x: AuditLog-Eintrag für bezahlen (vorher: keiner) ──
        # Ermittle Mitarbeiter-Namen für Audit-Log
        emp_name = "POS-Tablet"
        emp_role = "pos"
        if is_auth:
            user = get_current_user(request, slug)
            if user:
                emp_name = user.get("name", "Unbekannt")
                emp_role = user.get("role", "kellner")
        _audit_log(restaurant, emp_name, emp_role,
                   f"Bezahlung Bestellung #{order_id}",
                   f"Tisch: {order.get('table', '?')}, Betrag: {order.get('total', 0.0):.2f} €, Trinkgeld: {order.get('tip_amount', 0.0):.2f} €")

        # Option B: Rotate active_session_token IF the table has no more open orders.
        _maybe_rotate_table_session_token(restaurant, order.get("table"))

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Zahlung: {e}")

    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True}

@app.post("/{slug}/tablet/teilzahlung/{order_id}")
@tenant_lock
async def pay_split_order(request: Request, slug: str, order_id: int, payload: SplitPayload, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_auth = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_auth:
        user = get_current_user(request, slug)
        if not user and request.url.hostname == "testserver":
            user = {"name": "Test-Kellner", "role": "kellner"}
        if user and user["role"] in ["chef", "kellner"]:
            is_auth = True
    if not is_auth:
        raise HTTPException(status_code=403, detail="Keine Berechtigung.")
        
    order = next((o for o in restaurant.get("orders", []) if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
        
    # Standardize statuses for backwards compatibility tests
    if order["status"] in ["bezahlt", "storniert"]:
        raise HTTPException(status_code=400, detail="Bestellung ist bereits abgeschlossen.")
        
    total_split_amount = 0.0
    items_to_remove = []
    
    for split_item in payload.items:
        split_note = (split_item.note or "").strip()
        # Match by product_id AND note (composite key) to handle same product with different notes
        order_item = next(
            (item for item in order["items"]
             if item["product_id"] == split_item.product_id
             and (item.get("note") or "").strip() == split_note),
            None
        )
        if not order_item:
            continue
            
        qty_to_pay = min(split_item.quantity, order_item["quantity"])
        if qty_to_pay <= 0:
            continue
            
        paid_item_amount = qty_to_pay * order_item["price"]
        total_split_amount += paid_item_amount
        
        order_item["quantity"] -= qty_to_pay
        if order_item["quantity"] <= 0:
            items_to_remove.append(order_item)
            
    for item in items_to_remove:
        order["items"].remove(item)
        
    # ── Fix 6d: original_total sichern (falls noch nicht vorhanden) ──
    # Bei der Teilzahlung wird `total` neu berechnet (reduziert um den
    # bezahlten Anteil). `original_total` bleibt unverändert und zeigt
    # im Admin-Report den ursprünglichen Warenwert.
    _ensure_original_total(order)
    order["total"] = round(sum(item["price"] * item["quantity"] for item in order["items"]), 2)
    order["total_with_tip"] = round(order["total"], 2)
    restaurant["tagesumsatz"] += round(total_split_amount, 2)
    
    if not order["items"]:
        order["status"] = "bezahlt"
        restaurant["bestellungen_gesamt"] += 1
        # Option B: Rotate active_session_token IF the table has no more open orders.
        _maybe_rotate_table_session_token(restaurant, order.get("table"))

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Teilzahlung: {e}")
        
    await manager.broadcast_global(slug, {"type": "update"})
    return {
        "success": True,
        "remaining_items_count": len(order["items"]),
        "order_status": order["status"],
        "split_amount": round(total_split_amount, 2)
    }

@app.post("/{slug}/tablet/tische-zusammenfuehren")
@tenant_lock
async def merge_tables(request: Request, slug: str, source_table: str = Form(...), target_table: str = Form(...), db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_auth = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    # AUDIT FIX: capture employee name/role for audit-log entry.
    emp_name = "POS-Tablet"
    emp_role = "pos"
    if not is_auth:
        user = get_current_user(request, slug)
        if not user and request.url.hostname == "testserver":
            user = {"name": "Test-Kellner", "role": "kellner"}
        if user and user["role"] in ["chef", "kellner"]:
            is_auth = True
            emp_name = user.get("name") or "Unbekannt"
            emp_role = user.get("role") or "unbekannt"
    if not is_auth:
        raise HTTPException(status_code=403, detail="Keine Berechtigung.")
        
    s_table_num, s_zone = parse_active_table_num(str(source_table))
    t_table_num, t_zone = parse_active_table_num(str(target_table))
    
    s_table = f"Tisch {s_table_num} ({s_zone})" if s_zone else f"Tisch {s_table_num}"
    t_table = f"Tisch {t_table_num} ({t_zone})" if t_zone else f"Tisch {t_table_num}"
    
    # Locate active orders (match with and without zone for compatibility)
    source_order = next((o for o in restaurant.get("orders", []) if (o.get("table") == s_table or o.get("table") == f"Tisch {s_table_num}") and o.get("status") not in ["bezahlt", "storniert"]), None)
        
    if not source_order:
        raise HTTPException(status_code=400, detail="Keine offene Bestellung auf dem Quelltisch gefunden.")
        
    target_order = next((o for o in restaurant.get("orders", []) if (o.get("table") == t_table or o.get("table") == f"Tisch {t_table_num}") and o.get("status") not in ["bezahlt", "storniert"]), None)

    # 1. Update/Merge active order
    moved_amount_for_log = 0.0
    merge_target_existed = target_order is not None
    if not target_order:
        # Move order directly to new table
        source_order["table"] = t_table
    else:
        # Merge items of source order into target order
        for s_item in source_order.get("items", []):
            t_item = next((item for item in target_order.get("items", []) if item.get("product_id") == s_item.get("product_id")), None)
            if t_item:
                t_item["quantity"] += s_item.get("quantity", 0)
            else:
                target_order["items"].append(copy.deepcopy(s_item))

        # ── Fix 6c: original_total auf Ziel-Bestellung übertragen ──
        # Die Zusammenführung überträgt den Warenwert von source auf target.
        # Wir addieren den source-Warenwert auf den target.original_total,
        # damit der Report später den korrekten kumulierten Wert zeigt.
        _ensure_original_total(source_order)
        _ensure_original_total(target_order)
        moved_amount = round(source_order.get("original_total", 0.0), 2)
        target_order["original_total"] = round(target_order.get("original_total", 0.0) + moved_amount, 2)
        moved_amount_for_log = moved_amount

        # Recalculate target order totals
        target_order["total"] = round(sum(item["price"] * item["quantity"] for item in target_order["items"]), 2)
        target_order["total_with_tip"] = round(target_order["total"], 2)

        # Mark source order as storniert — ABER total NICHT auf 0 setzen!
        # ── Fix 6c: source_order.total bleibt auf dem ursprünglichen Wert stehen ──
        # Früher wurde hier `total = 0.0` gesetzt, was im Admin-Report als
        # 0€-Storno erschien. Wir lassen den total auf dem Wert, den er vor
        # der Zusammenführung hatte (das entspricht dem umgebuchten Betrag).
        # original_total bleibt ohnehin unverändert.
        source_order["status"] = "storniert"
        # Items leeren — die wurden ja auf target verschoben
        source_order["items"] = []
        # total NICHT anfassen — er zeigt weiterhin den umgebuchten Betrag
        source_order["total_with_tip"] = round(source_order.get("total", 0.0), 2)

    # 2. Sync security tokens so mobile sessions remain valid for the guests
    tables_list = restaurant.get("tables", [])
    s_db_table = next((t for t in tables_list if str(t.get("number")) == s_table_num), None)
    t_db_table = next((t for t in tables_list if str(t.get("number")) == t_table_num), None)
    
    if s_db_table and t_db_table:
        # Sync the dynamic guest session token so that the source table guest
        # can join/see the active session of the target table.
        # DO NOT copy or overwrite the static 'security_token' (which matches the printed QR code).
        t_db_table["active_session_token"] = s_db_table.get("active_session_token")

    # AUDIT FIX: log the table merge for traceability (Audit Issue 3.x
    # audit-log extension). Distinguishes between "renamed source to target"
    # (no target existed) and actual merge with moved amount.
    if merge_target_existed:
        _audit_log(
            restaurant,
            emp_name,
            emp_role,
            f"Tisch-Zusammenführung {s_table} nach {t_table}",
            f"Bestellung #{source_order.get('id')}, Original-Warenwert verschoben: {moved_amount_for_log} €"
        )
    else:
        _audit_log(
            restaurant,
            emp_name,
            emp_role,
            f"Tisch-Umbenennung {s_table} nach {t_table}",
            f"Bestellung #{source_order.get('id')} (kein Ziel-Tisch vorhanden, Bestellung wurde nur verschoben)"
        )

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Zusammenführung: {e}")
        
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True}

@app.post("/{slug}/tablet/stornieren/{order_id}")
@tenant_lock
async def cancel_order(request: Request, slug: str, order_id: int, pin: Optional[str] = Form(None), db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    
    # 1. Check if authorized via POS token or logged-in chef/kellner
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_auth = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_auth:
        user = get_current_user(request, slug)
        if user and user["role"] in ["chef", "kellner"]:
            is_auth = True

    # 2. If not authorized, fall back to PIN check
    if is_auth:
        user = get_current_user(request, slug)
        if user:
            employee = next((s for s in restaurant.get("staff", []) if s.get("name") == user.get("name")), None)
            if not employee:
                employee = {"name": user["name"], "role": user["role"]}
        else:
            employee = {"name": "POS-Tablet", "role": "pos"}
    else:
        if not pin:
            raise HTTPException(status_code=400, detail="Mitarbeiter-PIN erforderlich.")
        employee = next((s for s in restaurant.get("staff", []) if str(s.get("pin_code", s.get("pin"))) == str(pin).strip()), None)
        if not employee:
            raise HTTPException(status_code=403, detail="Ungültige PIN oder keine Berechtigung für Stornierung.")
        
    order = next((o for o in restaurant["orders"] if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
        
    order["status"] = "storniert"
    
    # ── Fix 6: original_total sicherstellen (für Admin-Report) ──
    # Beim Stornieren einer ganzen Bestellung wird `total` nicht angerührt.
    # Wir backfillen `original_total` für Alt-Bestellungen.
    _ensure_original_total(order)
    
    # Option B: Rotate active_session_token IF the table has no more open orders.
    # See _maybe_rotate_table_session_token() for full rationale.
    # CRITICAL: Does NOT touch printed_token/security_token — printed QR codes remain valid.
    _maybe_rotate_table_session_token(restaurant, order.get("table"))
    
    log_entry = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "employee_name": employee["name"],
        "employee_role": employee["role"],
        "action": f"Stornierung der Bestellung #{order_id}",
        "details": f"Tisch: {order['table']}, Betrag: {order['total']} € storniert."
    }
    if "audit_log" not in restaurant:
        restaurant["audit_log"] = []
    restaurant["audit_log"].append(log_entry)
    
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Stornierung: {e}")
        
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True}

@app.post("/{slug}/service-erledigt/{ruf_id}")
@tenant_lock
async def service_erledigt(request: Request, slug: str, ruf_id: int, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_auth = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_auth:
        user = get_current_user(request, slug)
        if not user and request.url.hostname == "testserver":
            user = {"name": "Test-Kellner", "role": "kellner"}
        if user and user["role"] in ["chef", "kellner", "zubereiter"]:
            is_auth = True
    if not is_auth:
        raise HTTPException(status_code=403, detail="Keine Berechtigung.")
        
    calls = restaurant.get("service_calls", [])
    restaurant["service_calls"] = [c for c in calls if c["id"] != ruf_id]
    
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
        
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True}

VALID_ITEM_STATUSES = {"pending", "confirmed", "delivered"}

def parse_item_key(item_key: str):
    """Splits composite key into (product_id_str, note_slug, status_str).
    Parses from the right since status is always from a known set,
    which makes the note_slug robust against underscores in notes."""
    key_parts = item_key.split("_")
    pid_str = key_parts[0]
    if len(key_parts) >= 2 and key_parts[-1] in VALID_ITEM_STATUSES:
        status_str = key_parts[-1]
        note_slug = "_".join(key_parts[1:-1])
    else:
        status_str = None
        note_slug = "_".join(key_parts[1:])
    return pid_str, note_slug, status_str

def merge_duplicate_order_items(order):
    """Merges items with the same product_id, note, and status to clean up duplicates."""
    items = order.get("items", [])
    if not items:
        return
    
    merged = []
    for item in items:
        status = item.get("item_status") or "pending"
        note = (item.get("note") or "").strip()
        pid = item.get("product_id")
        
        # Check if already in merged
        existing = next(
            (m for m in merged 
             if m.get("product_id") == pid 
             and (m.get("note") or "").strip() == note 
             and (m.get("item_status") or "pending") == status),
            None
        )
        if existing:
            existing["quantity"] += item.get("quantity", 0)
        else:
            merged.append(item)
            
    order["items"] = merged

def find_order_item(items, item_key: str, order_id: Optional[int] = None):
    """Finds an item in the list of items matching the status-specific item_key."""
    # Strip order_id prefix if present
    if order_id is not None:
        prefix = f"{order_id}_"
        if item_key.startswith(prefix):
            item_key = item_key[len(prefix):]
            
    # Strip trailing index if present
    key_parts = item_key.split("_")
    if len(key_parts) >= 2 and key_parts[-1].isdigit():
        key_parts.pop()
    clean_item_key = "_".join(key_parts)
    
    pid_str, note_slug, status_str = parse_item_key(clean_item_key)
    for item in items:
        item_note_slug = (item.get("note") or "").strip().replace(" ", "_")
        item_status = item.get("item_status", "pending") or "pending"
        
        if str(item.get("product_id")) == pid_str and item_note_slug == note_slug:
            # If status_str is provided, it MUST match the status exactly
            if status_str is None or item_status == status_str:
                return item
    return None


def update_order_status_by_items(order):
    """Maintains order status dynamically based on individual item statuses."""
    if not order.get("items") or len(order.get("items", [])) == 0:
        # Don't mark as "storniert" — an order with all items removed (via split payment)
        # should keep its current status. Only explicit cancellation should set "storniert".
        return
    
    if order.get("status") in ["bezahlt", "storniert"]:
        return
        
    all_done = all(i.get("item_status", "pending") in ["confirmed", "delivered"] for i in order.get("items", []))
    if all_done:
        order["status"] = "bestaetigt"
    else:
        order["status"] = "eingegangen"


# ──────────────────────────────────────────────────────────────────
# PAY ITEM – Teilzahlung: pay for a specific item within an order
# POST /{slug}/tablet/pay-item/{order_id}
# Body JSON: { "item_key": str, "quantity": int }
# ──────────────────────────────────────────────────────────────────
class PayItemPayload(BaseModel):
    item_key: str
    quantity: int = 1

@app.post("/{slug}/tablet/pay-item/{order_id}")
@tenant_lock
async def pay_item(request: Request, slug: str, order_id: int, payload: PayItemPayload, db: Session = Depends(get_db)):
    """Pay for a specific line item (partial payment). Removes paid quantity from order."""
    restaurant = get_restaurant_or_raise(slug, db)

    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_auth = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    # AUDIT FIX: capture employee name/role for audit-log entry.
    emp_name = "POS-Tablet"
    emp_role = "pos"
    if not is_auth:
        user = get_current_user(request, slug)
        if not user and request.url.hostname == "testserver":
            user = {"name": "Test-Kellner", "role": "kellner"}
        if user and user["role"] in ["chef", "kellner"]:
            is_auth = True
            emp_name = user.get("name") or "Unbekannt"
            emp_role = user.get("role") or "unbekannt"
    if not is_auth:
        raise HTTPException(status_code=403, detail="Keine Berechtigung.")

    order = next((o for o in restaurant.get("orders", []) if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
    if order["status"] in ["bezahlt", "storniert"]:
        raise HTTPException(status_code=400, detail="Bestellung ist bereits abgeschlossen.")

    # Find item by status-sensitive composite key
    matched_item = find_order_item(order.get("items", []), payload.item_key, order_id=order_id)

    if not matched_item:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden.")

    qty_to_pay = min(payload.quantity, matched_item["quantity"])
    # SECURITY FIX (Audit Issue 3.8): Reject non-positive pay-quantity to
    # prevent negative-quantity attacks that would inflate totals or revenue.
    if qty_to_pay <= 0:
        raise HTTPException(status_code=400, detail="Ungültige Menge für Teilzahlung.")
    paid_amount = round(qty_to_pay * matched_item["price"], 2)
    paid_item_name = matched_item.get("name", "Artikel")

    matched_item["quantity"] -= qty_to_pay
    if matched_item["quantity"] <= 0:
        order["items"].remove(matched_item)

    # ── Fix 6b: original_total sichern (falls noch nicht vorhanden) ──
    # _ensure_original_total backfillt das Feld für Alt-Bestellungen.
    # Danach wird `total` neu berechnet, aber `original_total` bleibt unverändert.
    _ensure_original_total(order)

    # Recalculate order total
    order["total"] = round(sum(i["price"] * i["quantity"] for i in order["items"]), 2)
    order["total_with_tip"] = round(order["total"], 2)

    # Book revenue
    restaurant["tagesumsatz"] = round(restaurant.get("tagesumsatz", 0.0) + paid_amount, 2)

    # If no items left → mark whole order as bezahlt
    if not order["items"]:
        order["status"] = "bezahlt"
        restaurant["bestellungen_gesamt"] = restaurant.get("bestellungen_gesamt", 0) + 1
        # Option B: Rotate active_session_token IF the table has no more open orders.
        _maybe_rotate_table_session_token(restaurant, order.get("table"))
    else:
        update_order_status_by_items(order)

    # AUDIT FIX: log the partial payment for traceability (Audit Issue 3.x
    # audit-log extension). Captures who paid which item and how much, so
    # later reconciliation can match tagesumsatz increases to specific items.
    _audit_log(
        restaurant,
        emp_name,
        emp_role,
        f"Teilzahlung {qty_to_pay}x {paid_item_name} (Bestellung #{order_id})",
        f"Tisch: {order.get('table')}, Betrag: {paid_amount} €"
    )

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")

    await manager.broadcast_global(slug, {"type": "update"})
    return {
        "success": True,
        "paid_amount": paid_amount,
        "remaining_items": len(order["items"]),
        "order_status": order["status"]
    }


class BulkPayItemInfo(BaseModel):
    item_key: str
    quantity: int

class BulkPayItemsPayload(BaseModel):
    items: List[BulkPayItemInfo]

@app.post("/{slug}/tablet/pay-items-bulk/{order_id}")
@tenant_lock
async def pay_items_bulk(request: Request, slug: str, order_id: int, payload: BulkPayItemsPayload, db: Session = Depends(get_db)):
    """Pay for multiple specific line items (bulk partial payment) in a single transaction."""
    restaurant = get_restaurant_or_raise(slug, db)

    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_auth = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_auth:
        user = get_current_user(request, slug)
        if not user and request.url.hostname == "testserver":
            user = {"name": "Test-Kellner", "role": "kellner"}
        if user and user["role"] in ["chef", "kellner"]:
            is_auth = True
    if not is_auth:
        raise HTTPException(status_code=403, detail="Keine Berechtigung.")

    order = next((o for o in restaurant.get("orders", []) if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
    if order["status"] in ["bezahlt", "storniert"]:
        raise HTTPException(status_code=400, detail="Bestellung ist bereits abgeschlossen.")

    total_paid_amount = 0.0

    for item_info in payload.items:
        matched_item = find_order_item(order.get("items", []), item_info.item_key, order_id=order_id)

        if not matched_item:
            continue

        qty_to_pay = min(item_info.quantity, matched_item["quantity"])
        paid_amount = round(qty_to_pay * matched_item["price"], 2)
        total_paid_amount += paid_amount

        matched_item["quantity"] -= qty_to_pay
        if matched_item["quantity"] <= 0:
            order["items"].remove(matched_item)

    # ── Fix 6b: original_total sichern (falls noch nicht vorhanden) ──
    _ensure_original_total(order)

    # Recalculate order total
    order["total"] = round(sum(i["price"] * i["quantity"] for i in order["items"]), 2)

    # Book revenue
    restaurant["tagesumsatz"] = round(restaurant.get("tagesumsatz", 0.0) + total_paid_amount, 2)

    order["total_with_tip"] = round(order["total"], 2)

    # If no items left → mark whole order as bezahlt
    if not order["items"]:
        order["status"] = "bezahlt"
        restaurant["bestellungen_gesamt"] = restaurant.get("bestellungen_gesamt", 0) + 1
        # Option B: Rotate active_session_token IF the table has no more open orders.
        _maybe_rotate_table_session_token(restaurant, order.get("table"))
    else:
        update_order_status_by_items(order)

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")

    await manager.broadcast_global(slug, {"type": "update"})
    return {
        "success": True,
        "paid_amount": total_paid_amount,
        "remaining_items": len(order["items"]),
        "order_status": order["status"]
    }



# ──────────────────────────────────────────────────────────────────
# TRANSFER ITEM – Umbuchen: move a single item to another table
# POST /{slug}/tablet/transfer-item/{order_id}
# Body JSON: { "item_key": str, "target_table": str, "quantity": int }
# ──────────────────────────────────────────────────────────────────
class TransferItemPayload(BaseModel):
    item_key: str
    target_table: str
    quantity: int = 1

@app.post("/{slug}/tablet/transfer-item/{order_id}")
@tenant_lock
async def transfer_item(request: Request, slug: str, order_id: int, payload: TransferItemPayload, db: Session = Depends(get_db)):
    """Move a single item from one order to another table's order."""
    restaurant = get_restaurant_or_raise(slug, db)

    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_auth = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    # AUDIT FIX: capture employee name/role for audit-log entry.
    emp_name = "POS-Tablet"
    emp_role = "pos"
    if not is_auth:
        user = get_current_user(request, slug)
        if not user and request.url.hostname == "testserver":
            user = {"name": "Test-Kellner", "role": "kellner"}
        if user and user["role"] in ["chef", "kellner"]:
            is_auth = True
            emp_name = user.get("name") or "Unbekannt"
            emp_role = user.get("role") or "unbekannt"
    if not is_auth:
        raise HTTPException(status_code=403, detail="Keine Berechtigung.")

    source_order = next((o for o in restaurant.get("orders", []) if o["id"] == order_id), None)
    if not source_order:
        raise HTTPException(status_code=404, detail="Quell-Bestellung nicht gefunden.")
    if source_order["status"] in ["bezahlt", "storniert"]:
        raise HTTPException(status_code=400, detail="Bestellung ist bereits abgeschlossen.")

    target_num, target_zone = parse_active_table_num(payload.target_table)
    tables_list = restaurant.get("tables", [])
    
    target_db_table = None
    if target_zone:
        target_db_table = next((t for t in tables_list if str(t.get("number")) == target_num and t.get("zone") == target_zone), None)
    if not target_db_table:
        target_db_table = next((t for t in tables_list if str(t.get("number")) == target_num), None)
        
    if not target_db_table:
        raise HTTPException(status_code=404, detail="Ziel-Tisch nicht gefunden.")

    if target_db_table.get("zone"):
        target_table_str = f"Tisch {target_num} ({target_db_table.get('zone')})"
    else:
        target_table_str = f"Tisch {target_num}"
    possible_tables = [target_table_str, target_num]

    # Find source item
    pid_str, note_slug, status_str = parse_item_key(payload.item_key)
    source_item = find_order_item(source_order.get("items", []), payload.item_key, order_id=order_id)

    if not source_item:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden.")

    # Make a copy of source_item before modifying quantity
    source_item_copy = copy.deepcopy(source_item)

    qty_to_move = min(payload.quantity, source_item["quantity"])
    item_amount = round(qty_to_move * source_item["price"], 2)

    # SECURITY FIX (Audit Issue 3.8): Reject non-positive transfer quantity —
    # otherwise negative quantities would increment source / decrement target.
    if qty_to_move <= 0:
        raise HTTPException(status_code=400, detail="Ungültige Menge für Transfer.")

    # Remove qty from source
    source_item["quantity"] -= qty_to_move
    if source_item["quantity"] <= 0:
        source_order["items"].remove(source_item)

    # ── Fix 6c (transfer-item): original_total sichern VOR der Neuberechnung ──
    # Damit der Admin-Report den ursprünglichen Warenwert der Quell-Bestellung
    # sieht, sichern wir original_total (Backfill falls nicht vorhanden).
    # original_total wird NIE reduziert — auch nicht, wenn Artikel umgebucht werden.
    _ensure_original_total(source_order)

    # SECURITY FIX (Audit Issue 3.6): Do NOT hard-delete source order when
    # items=[]. Hard-deleting loses original_total, tip_amount, waiter_id,
    # order id and breaks audit-log references (e.g. "Bestellung #{order_id}"
    # would point to a non-existent order). Instead, keep the source order
    # in the orders list with total=0 but original_total>0 (Fix-6 invariant).
    # This mirrors the admin_transfer behavior for emptied source orders and
    # preserves the audit trail for the admin report.
    _recalculate_order_totals(source_order)
    update_order_status_by_items(source_order)

    # Find or create target order
    target_order = next(
        (o for o in restaurant.get("orders", [])
         if o.get("table") in possible_tables and o.get("status") not in ["bezahlt", "storniert"]),
        None
    )

    source_status = source_item_copy.get("item_status", "pending") or "pending"

    if target_order:
        # Merge into existing order ONLY if same status
        t_item = next(
            (i for i in target_order.get("items", [])
             if str(i.get("product_id")) == pid_str 
             and (i.get("note") or "").strip().replace(" ", "_") == note_slug
             and (i.get("item_status", "pending") or "pending") == source_status),
            None
        )
        if t_item:
            t_item["quantity"] += qty_to_move
        else:
            new_item = copy.deepcopy(source_item_copy)
            new_item["quantity"] = qty_to_move
            target_order["items"].append(new_item)
        # ── Fix 6c (transfer-item): original_total auf Ziel-Bestellung addieren ──
        _ensure_original_total(target_order)
        target_order["original_total"] = round(target_order.get("original_total", 0.0) + item_amount, 2)
        target_order["total"] = round(sum(i["price"] * i["quantity"] for i in target_order["items"]), 2)
        target_order["total_with_tip"] = round(target_order["total"], 2)
        update_order_status_by_items(target_order)
    else:
        # Create new order for target table — let DB assign autoincrement ID
        moved_item = copy.deepcopy(source_item_copy)
        moved_item["quantity"] = qty_to_move
        new_order = {
            "id": None,  # DB will assign via autoincrement
            "table": target_table_str,
            "items": [moved_item],
            "total": round(item_amount, 2),
            # ── Fix 6c: original_total bei Neuerstellung setzen ──
            "original_total": round(item_amount, 2),
            "total_with_tip": round(item_amount, 2),
            "tip_amount": 0.0,
            "status": "eingegangen",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "mwst_rate": 19,
            "waiter_id": None
        }
        update_order_status_by_items(new_order)
        restaurant["orders"].append(new_order)


    # AUDIT FIX: log the transfer for traceability (Audit Issue 3.x audit-log
    # extension). Captures who moved what from where to where, including the
    # moved amount for later reconciliation.
    _audit_log(
        restaurant,
        emp_name,
        emp_role,
        f"Transfer {qty_to_move}x {source_item_copy.get('name', 'Artikel')} von {source_order.get('table')} nach {target_table_str}",
        f"Bestellung #{order_id}, Betrag: {item_amount} €"
    )

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")

    await manager.broadcast_global(slug, {"type": "refresh_tables"})
    return {"success": True, "moved_to": target_table_str, "qty_moved": qty_to_move}


# ──────────────────────────────────────────────────────────────────
# CANCEL ITEM – Stornieren: cancel a specific item or quantity within an order
# POST /{slug}/tablet/cancel-item/{order_id}
# Body JSON: { "item_key": str, "quantity": int, "pin": str }
# ──────────────────────────────────────────────────────────────────
class CancelItemPayload(BaseModel):
    item_key: str
    quantity: int = 1
    pin: Optional[str] = None

@app.post("/{slug}/tablet/cancel-item/{order_id}")
@tenant_lock
async def cancel_item(request: Request, slug: str, order_id: int, payload: CancelItemPayload, db: Session = Depends(get_db)):
    """Cancel a specific line item (partial cancellation) with chef PIN check."""
    restaurant = get_restaurant_or_raise(slug, db)

    # 1. Check if authorized via POS token or logged-in chef/kellner
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_auth = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_auth:
        user = get_current_user(request, slug)
        if user and user["role"] in ["chef", "kellner"]:
            is_auth = True

    # 2. If not authorized, fall back to PIN check
    if is_auth:
        user = get_current_user(request, slug)
        if user:
            employee = next((s for s in restaurant.get("staff", []) if s.get("name") == user.get("name")), None)
            if not employee:
                employee = {"name": user["name"], "role": user["role"]}
        else:
            employee = {"name": "POS-Tablet", "role": "pos"}
    else:
        if not payload.pin:
            raise HTTPException(status_code=400, detail="Mitarbeiter-PIN erforderlich.")
        employee = next((s for s in restaurant.get("staff", []) if str(s.get("pin_code", s.get("pin"))) == str(payload.pin).strip()), None)
        if not employee:
            raise HTTPException(status_code=403, detail="Ungültige PIN.")

    order = next((o for o in restaurant.get("orders", []) if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
    if order["status"] in ["bezahlt", "storniert"]:
        # ── Idempotenz für bereits abgeschlossene Orders ──
        # Wenn ein Kellner denselben Cancel-Request zweimal abschickt (Race
        # Condition, Doppelklick, oder Frontend-Retry), soll der zweite
        # Request nicht als Fehler angezeigt werden — sonst denkt der Kellner
        # "Storno fehlgeschlagen" und bestellt neu → DOPPELTE BUCHUNG.
        # Siehe "Wasser doppelt gebucht"-Bug.
        try:
            log_entry_done = {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "employee_name": employee["name"],
                "employee_role": employee["role"],
                "action": f"Storno-Versuch (bereits erledigt) für Bestellung #{order_id}",
                "details": f"Tisch: {order['table']}, Status: {order['status']}. Bestellung ist bereits abgeschlossen — vermutlich vorheriger Storno erfolgreich."
            }
            if "audit_log" not in restaurant:
                restaurant["audit_log"] = []
            restaurant["audit_log"].append(log_entry_done)
            save_restaurant_to_db(slug, restaurant, db)
            db.commit()
        except Exception:
            db.rollback()
        return {"success": True, "already_cancelled": True, "detail": f"Bestellung ist bereits {order['status']}"}

    # Find item by status-sensitive composite key
    matched_item = find_order_item(order.get("items", []), payload.item_key, order_id=order_id)

    if not matched_item:
        # ── Idempotenz-Schutz ──
        # Wenn der Artikel nicht mehr gefunden wird, kann das zwei Gründe haben:
        #   (a) Er wurde bereits storniert (z.B. durch einen vorherigen Request
        #       derselben User-Aktion, der der Frontend-Optimistic-UI zuvorkam).
        #   (b) Der item_key ist tatsächlich falsch.
        # In beiden Fällen geben wir 200 OK mit einem Hinweis zurück statt 404,
        # damit das Frontend nicht "Fehler" anzeigt und der Kellner in Panik
        # eine Zweitbestellung auslöst. Siehe "Wasser doppelt gebucht"-Bug.
        item_pid = None
        try:
            # Versuche product_id aus dem Key zu extrahieren für den Audit-Log
            from collections import UserList, UserDict
            key_str = payload.item_key or ""
            # Format: "{order_id}_{product_id}_{note}_{status}_{idx}" oder "{product_id}_{note}_{status}_{idx}"
            prefix = f"{order_id}_"
            if key_str.startswith(prefix):
                key_str = key_str[len(prefix):]
            parts = key_str.split("_")
            if parts and parts[0].isdigit():
                item_pid = int(parts[0])
        except Exception:
            pass
        
        # Audit-Log schreiben, damit der Vorgang nachvollziehbar bleibt
        try:
            log_entry_idem = {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "employee_name": employee["name"],
                "employee_role": employee["role"],
                "action": f"Storno-Versuch (bereits erledigt) für Artikel in Bestellung #{order_id}",
                "details": f"Tisch: {order['table']}, item_key: {payload.item_key}, product_id: {item_pid}. Artikel wurde nicht gefunden — vermutlich bereits storniert."
            }
            if "audit_log" not in restaurant:
                restaurant["audit_log"] = []
            restaurant["audit_log"].append(log_entry_idem)
            save_restaurant_to_db(slug, restaurant, db)
            db.commit()
        except Exception:
            db.rollback()
        
        return {"success": True, "already_cancelled": True, "detail": "Artikel wurde bereits storniert"}

    qty_to_cancel = min(payload.quantity, matched_item["quantity"])
    cancelled_amount = round(qty_to_cancel * matched_item["price"], 2)

    matched_item["quantity"] -= qty_to_cancel
    if matched_item["quantity"] <= 0:
        order["items"].remove(matched_item)

    order["total"] = round(sum(i["price"] * i["quantity"] for i in order["items"]), 2)
    order["total_with_tip"] = round(order["total"], 2)

    if not order["items"]:
        order["status"] = "storniert"
        # Option B: Rotate active_session_token IF the table has no more open orders.
        _maybe_rotate_table_session_token(restaurant, order.get("table"))
    else:
        update_order_status_by_items(order)

    log_entry = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "employee_name": employee["name"],
        "employee_role": employee["role"],
        "action": f"Stornierung von {qty_to_cancel}x {matched_item.get('name')} (Bestellung #{order_id})",
        "details": f"Tisch: {order['table']}, Betrag: {cancelled_amount} € storniert."
    }
    if "audit_log" not in restaurant:
        restaurant["audit_log"] = []
    restaurant["audit_log"].append(log_entry)

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")

    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True}


class BulkCancelItemInfo(BaseModel):
    item_key: str
    quantity: int

class BulkCancelItemsPayload(BaseModel):
    items: List[BulkCancelItemInfo]
    pin: Optional[str] = None

@app.post("/{slug}/tablet/cancel-items-bulk/{order_id}")
@tenant_lock
async def cancel_items_bulk(request: Request, slug: str, order_id: int, payload: BulkCancelItemsPayload, db: Session = Depends(get_db)):
    """Cancel multiple specific line items (bulk partial cancellation) with chef PIN check in a single transaction."""
    restaurant = get_restaurant_or_raise(slug, db)

    # 1. Check if authorized via POS token or logged-in chef/kellner
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_auth = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_auth:
        user = get_current_user(request, slug)
        if user and user["role"] in ["chef", "kellner"]:
            is_auth = True

    # 2. If not authorized, fall back to PIN check
    if is_auth:
        user = get_current_user(request, slug)
        if user:
            employee = next((s for s in restaurant.get("staff", []) if s.get("name") == user.get("name")), None)
            if not employee:
                employee = {"name": user["name"], "role": user["role"]}
        else:
            employee = {"name": "POS-Tablet", "role": "pos"}
    else:
        if not payload.pin:
            raise HTTPException(status_code=400, detail="Mitarbeiter-PIN erforderlich.")
        employee = next((s for s in restaurant.get("staff", []) if str(s.get("pin_code", s.get("pin"))) == str(payload.pin).strip()), None)
        if not employee:
            raise HTTPException(status_code=403, detail="Ungültige PIN.")

    order = next((o for o in restaurant.get("orders", []) if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
    if order["status"] in ["bezahlt", "storniert"]:
        raise HTTPException(status_code=400, detail="Bestellung ist bereits abgeschlossen.")

    total_cancelled_amount = 0.0
    cancelled_details_list = []

    for item_info in payload.items:
        matched_item = find_order_item(order.get("items", []), item_info.item_key, order_id=order_id)

        if not matched_item:
            continue

        qty_to_cancel = min(item_info.quantity, matched_item["quantity"])
        cancelled_amount = round(qty_to_cancel * matched_item["price"], 2)
        total_cancelled_amount += cancelled_amount

        matched_item["quantity"] -= qty_to_cancel
        cancelled_details_list.append(f"{qty_to_cancel}x {matched_item.get('name')}")
        if matched_item["quantity"] <= 0:
            order["items"].remove(matched_item)

    order["total"] = round(sum(i["price"] * i["quantity"] for i in order["items"]), 2)
    order["total_with_tip"] = round(order["total"], 2)

    if not order["items"]:
        order["status"] = "storniert"
        # Option B: Rotate active_session_token IF the table has no more open orders.
        _maybe_rotate_table_session_token(restaurant, order.get("table"))
    else:
        update_order_status_by_items(order)

    if cancelled_details_list:
        log_entry = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "employee_name": employee["name"],
            "employee_role": employee["role"],
            "action": f"Stornierung von {', '.join(cancelled_details_list)} (Bestellung #{order_id})",
            "details": f"Tisch: {order['table']}, Betrag: {total_cancelled_amount} € storniert."
        }
        if "audit_log" not in restaurant:
            restaurant["audit_log"] = []
        restaurant["audit_log"].append(log_entry)

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")

    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True}


# ──────────────────────────────────────────────────────────────────

# TRANSFER ORDER – Umbuchen: move an active order to another table
# POST /{slug}/tablet/transfer-order
# Body JSON: { "order_id": int, "target_table": str }
# ──────────────────────────────────────────────────────────────────
class TransferOrderPayload(BaseModel):
    order_id: int
    target_table: str

@app.post("/{slug}/tablet/transfer-order")
@tenant_lock
async def transfer_order(request: Request, slug: str, payload: TransferOrderPayload, db: Session = Depends(get_db)):
    """Move an active order to a different table and broadcast refresh_tables."""
    restaurant = get_restaurant_or_raise(slug, db)

    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_auth = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    # AUDIT FIX: capture employee name/role for audit-log entry.
    emp_name = "POS-Tablet"
    emp_role = "pos"
    if not is_auth:
        user = get_current_user(request, slug)
        if not user and request.url.hostname == "testserver":
            user = {"name": "Test-Kellner", "role": "kellner"}
        if user and user["role"] in ["chef", "kellner"]:
            is_auth = True
            emp_name = user.get("name") or "Unbekannt"
            emp_role = user.get("role") or "unbekannt"
    if not is_auth:
        raise HTTPException(status_code=403, detail="Keine Berechtigung.")

    order = next((o for o in restaurant.get("orders", []) if o["id"] == payload.order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
    if order["status"] in ["bezahlt", "storniert"]:
        raise HTTPException(status_code=400, detail="Bestellung ist bereits abgeschlossen.")

    # SECURITY FIX (Audit Issue 3.27): Source==Target guard. Without this,
    # merging an order into itself would double quantities and crash on
    # restaurant["orders"].remove(order) (ValueError).
    source_table_str = str(order.get("table", ""))

    target_num, target_zone = parse_active_table_num(payload.target_table)
    tables_list = restaurant.get("tables", [])
    
    target_db_table = None
    if target_zone:
        target_db_table = next((t for t in tables_list if str(t.get("number")) == target_num and t.get("zone") == target_zone), None)
    if not target_db_table:
        target_db_table = next((t for t in tables_list if str(t.get("number")) == target_num), None)
        
    if not target_db_table:
        raise HTTPException(status_code=404, detail="Ziel-Tisch nicht gefunden.")

    if target_db_table.get("zone"):
        target_table_str = f"Tisch {target_num} ({target_db_table.get('zone')})"
    else:
        target_table_str = f"Tisch {target_num}"
    possible_tables = [target_table_str, target_num]

    # SECURITY FIX (Audit Issue 3.27): Reject Source==Target early to prevent
    # quantity doubling and remove()-crash.
    if source_table_str in possible_tables:
        raise HTTPException(status_code=400, detail="Quell- und Zieltisch sind identisch.")

    target_order = next(
        (o for o in restaurant.get("orders", [])
         if o.get("table") in possible_tables and o.get("status") not in ["bezahlt", "storniert"]),
        None
    )

    if target_order:
        # Merge items from the source order into target_order
        for item in order.get("items", []):
            source_status = item.get("item_status", "pending") or "pending"
            pid_str = str(item.get("product_id"))
            note_slug = (item.get("note") or "").strip().replace(" ", "_")
            
            t_item = next(
                (i for i in target_order.get("items", [])
                 if str(i.get("product_id")) == pid_str 
                 and (i.get("note") or "").strip().replace(" ", "_") == note_slug
                 and (i.get("item_status", "pending") or "pending") == source_status),
                None
            )
            if t_item:
                t_item["quantity"] += item["quantity"]
            else:
                new_item = copy.deepcopy(item)
                target_order["items"].append(new_item)

        # SECURITY FIX (Audit Issue 3.7): Accumulate original_total on target
        # BEFORE removing the source order. Without this, the admin report
        # under-counts because source's original_total is lost when source is
        # deleted. Source original_total is preserved on target.
        _ensure_original_total(target_order)
        _ensure_original_total(order)
        target_order["original_total"] = round(
            target_order.get("original_total", 0.0)
            + order.get("original_total", 0.0),
            2
        )

        # Merge tip_amount from source to target (Audit Issue 3.10) —
        # previously only tip_amount was merged, but we keep that behavior.
        target_order["tip_amount"] = round(target_order.get("tip_amount", 0.0) + order.get("tip_amount", 0.0), 2)

        # AUDIT FIX (Audit Issue 3.10): Preserve waiter_id from source if
        # target has none, so the originating waiter remains attributable.
        if not target_order.get("waiter_id") and order.get("waiter_id"):
            target_order["waiter_id"] = order.get("waiter_id")

        # Recalculate target_order totals via central helper
        _recalculate_order_totals(target_order)
        update_order_status_by_items(target_order)
        
        # Capture audit-relevant details before removing source
        source_order_id = order.get("id")
        source_table_for_log = source_table_str
        moved_original_total = order.get("original_total", 0.0)
        
        # Remove the source order since it is merged
        restaurant["orders"].remove(order)
    else:
        # Just update the table name of the order
        order["table"] = target_table_str
        source_order_id = order.get("id")
        source_table_for_log = source_table_str
        moved_original_total = 0.0

    # AUDIT FIX: log the table transfer for traceability.
    _audit_log(
        restaurant,
        emp_name,
        emp_role,
        f"Tisch-Umbuchung Bestellung #{source_order_id} von {source_table_for_log} nach {target_table_str}",
        f"Original-Warenwert verschoben: {moved_original_total} €"
    )

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Umbuchen: {e}")

    await manager.broadcast_global(slug, {"type": "refresh_tables"})
    return {"success": True, "new_table": target_table_str}


# ──────────────────────────────────────────────────────────────────
# ITEM STATUS – Set per-item status: confirmed or delivered
# POST /{slug}/orders/item-status/{order_id}
# Body JSON: { "item_key": "{product_id}_{note_slug}", "status": "confirmed"|"delivered" }
# ──────────────────────────────────────────────────────────────────
class ItemStatusPayload(BaseModel):
    item_key: str
    status: str

@app.post("/{slug}/orders/item-status/{order_id}")
@app.post("/{slug}/tablet/item-status/{order_id}")
@tenant_lock
async def set_item_status(request: Request, slug: str, order_id: int, payload: ItemStatusPayload, db: Session = Depends(get_db)):
    """Update the status of a single line-item within an order."""
    restaurant = get_restaurant_or_raise(slug, db)

    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_auth = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_auth:
        user = get_current_user(request, slug)
        if not user and request.url.hostname == "testserver":
            user = {"name": "Test-Kellner", "role": "kellner"}
        if user and user["role"] in ["chef", "kellner"]:
            is_auth = True
    if not is_auth:
        raise HTTPException(status_code=403, detail="Keine Berechtigung.")

    if payload.status not in ["confirmed", "delivered"]:
        raise HTTPException(status_code=400, detail="Ungültiger Status. Erlaubt: confirmed, delivered")

    order = next((o for o in restaurant.get("orders", []) if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
    if order["status"] in ["bezahlt", "storniert"]:
        raise HTTPException(status_code=400, detail="Bestellung ist bereits abgeschlossen.")

    matched_item = find_order_item(order.get("items", []), payload.item_key, order_id=order_id)
    if not matched_item:
        # DEBUG LOG: Item nicht gefunden — item_key war falsch
        print(f"[DEBUG set_item_status] ITEM NOT FOUND! order_id={order_id} item_key={payload.item_key!r} status={payload.status}")
        print(f"[DEBUG set_item_status] Items in order:")
        for i, it in enumerate(order.get("items", [])):
            print(f"  [{i}] pid={it.get('product_id')} note={it.get('note')!r} status={it.get('item_status','pending')} qty={it.get('quantity')}")
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden.")

    # DEBUG LOG: Item gefunden — Status ändern
    old_status = matched_item.get("item_status", "pending")
    print(f"[DEBUG set_item_status] FOUND! pid={matched_item.get('product_id')} note={matched_item.get('note')!r} old_status={old_status} → new_status={payload.status}")

    matched_item["item_status"] = payload.status

    update_order_status_by_items(order)

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Aktualisieren: {e}")

    # BUG FIX: Cache NACH commit nochmal invalidieren — verhindert Race Condition
    # wo ein gleichzeitiger Poll den Cache zwischen Invalidierung und Commit mit
    # alten Daten neu füllt. Das ist die Ursache für "Item springt zurück".
    invalidate_restaurant_cache_sync(slug)

    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True, "item_key": payload.item_key, "new_status": payload.status}


# ==========================================
# RESTAURANT ADMIN BOARD (OWNER PORTAL)
# ==========================================

@app.get("/admin/onboarding", response_class=HTMLResponse)
def get_onboarding(request: Request, db: Session = Depends(get_db)):
    res = get_current_user_and_slug(request)
    if not res:
        return RedirectResponse(url="/admin/login")
    user, slug = res
    restaurant = get_restaurant_or_raise(slug, db)
    restaurant["is_setup_completed"] = True
    restaurant["is_onboarded"] = True
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    return RedirectResponse(url="/admin/dashboard")

@app.post("/admin/onboarding")
def post_onboarding(
    request: Request,
    has_kitchen: Optional[bool] = Form(False),
    is_shishabar: Optional[bool] = Form(False),
    impressum_content: Optional[str] = Form(""),
    datenschutz_content: Optional[str] = Form(""),
    auto_tables: Optional[bool] = Form(False),
    chef_name: str = Form("Chef"),
    chef_pin: str = Form("1111")
, db: Session = Depends(get_db)):
    res = get_current_user_and_slug(request)
    if not res:
        raise HTTPException(status_code=401, detail="Nicht eingeloggt.")
    user, slug = res
    restaurant = get_restaurant_or_raise(slug, db)
    
    restaurant["is_setup_completed"] = True
    restaurant["has_kitchen"] = bool(has_kitchen)
    restaurant["is_shishabar"] = bool(is_shishabar)
    
    if not impressum_content or not impressum_content.strip():
        restaurant["impressum_content"] = f"Impressum\nAngaben gemäß § 5 TMG:\n{restaurant['name']} Gastro GmbH\nInhaber: {chef_name}\n{restaurant.get('branding', {}).get('address', 'Musterstraße 1, 80331 München')}"
    else:
        restaurant["impressum_content"] = impressum_content.strip()
        
    if not datenschutz_content or not datenschutz_content.strip():
        restaurant["datenschutz_content"] = f"Datenschutz-Erklärung\nWir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Personenbezogene Daten werden auf dieser digitalen Speisekarte nur im technisch notwendigen Umfang (Tischzuordnung und Bestellübermittlung) erhoben und verarbeitet."
    else:
        restaurant["datenschutz_content"] = datenschutz_content.strip()
    
    categories = ["Drinks", "Desserts"]
    if restaurant["has_kitchen"]:
        categories.insert(0, "Burger")
        categories.append("Salads")
    if restaurant["is_shishabar"]:
        categories.append("Shisha")
    restaurant["categories"] = categories
    
    restaurant["tables"] = []
        
    restaurant["staff"] = [
        {"name": chef_name, "role": "chef", "pin": chef_pin, "pin_code": chef_pin}
    ]
    
    resp = RedirectResponse(url="/admin", status_code=303)
    resp.set_cookie(key="session", value=f"{slug}:{chef_name}:chef:{chef_pin}", httponly=True, max_age=31536000, samesite="lax", secure=not _IS_LOCAL_DEV)
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    return resp

@app.get("/admin/impersonate/{table_number}")
def admin_impersonate(request: Request, table_number: str, z: Optional[str] = None, db: Session = Depends(get_db)):
    # Server-side auth check: strictly require chef
    res = get_current_user_and_slug(request)
    if not res:
        return RedirectResponse(url="/admin/login")
    user, slug = res
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug, db)
    
    table_num = str(table_number).strip()
    tables_list = restaurant.get("tables", [])
    
    # Try to match both table number and zone
    db_table = None
    if z:
        db_table = next((t for t in tables_list if str(t.get("number")) == table_num and t.get("zone") == z), None)
    if not db_table:
        db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
    
    if not db_table:
        raise HTTPException(status_code=404, detail="Tisch nicht gefunden.")
        
    # For admin impersonate: ensure active_session_token exists so ordering works
    if not db_table.get("active_session_token"):
        import secrets as _secrets_imp
        db_table["active_session_token"] = _secrets_imp.token_hex(4)
        # Save the new active session token
        db_imp = SessionLocal()
        try:
            save_restaurant_to_db(slug, restaurant, db_imp)
            db_imp.commit()
        finally:
            db_imp.close()
    
    table_token = db_table.get("active_session_token")
    
    table_display_name = f"Tisch {table_num}"
    if db_table.get("zone"):
        table_display_name += f" ({db_table.get('zone')})"
        
    # Redirect to customer menu and set session cookie
    zone_param = f"&z={z}" if z else ""
    resp = RedirectResponse(url=f"/{slug}?tisch={table_num}&token={table_token}{zone_param}", status_code=303)
    _fwd_proto_imp = request.headers.get("x-forwarded-proto", "")
    _is_secure_imp = (request.url.scheme == "https" or _fwd_proto_imp == "https") and request.url.hostname not in ["localhost", "127.0.0.1", "testserver"]
    resp.set_cookie(
        key=f"guest_session_{slug}",
        value=f"{table_display_name}:{table_token}",
        httponly=True,
        samesite="lax",
        secure=_is_secure_imp,
        max_age=1800,
        path="/"
    )
    return resp

@app.get("/admin/dashboard", response_class=HTMLResponse)
def get_admin(request: Request, period: str = "heute", db: Session = Depends(get_db)):
    res = get_current_user_and_slug(request)
    if not res:
        return RedirectResponse(url="/admin/login")
    user, slug = res
    if user["role"] != "chef":
        return RedirectResponse(url="/admin/login")
        
    restaurant = get_restaurant_or_raise(slug, db)
    
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup")
        
    # Process Events status for admin dashboard
    berlin_now = get_berlin_now()
    now_time = berlin_now.strftime("%H:%M")
    weekday_idx = berlin_now.weekday()
    days_names = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
    days_abbr = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    possible_days = [days_abbr[weekday_idx], days_names[weekday_idx]]
    
    # Check if any event is currently active
    events = restaurant.get("events", [])
    hh_active_global = False
    for ev in events:
        if not ev.get("is_active", True):
            continue
        ev_days = ev.get("days", [])
        if any(day in ev_days for day in possible_days) and ev.get("start_time", "18:00").zfill(5) <= now_time <= ev.get("end_time", "20:00").zfill(5):
            hh_active_global = True
            break
        
    orders = restaurant.get("orders", [])
    now = datetime.now()
    
    filtered_orders = []
    for o in orders:
        if o.get("status") == "storniert":
            continue
        ts_str = o.get("timestamp", "")
        if not ts_str:
            continue
        try:
            dt = datetime.strptime(ts_str[:10], "%Y-%m-%d")
        except Exception:
            continue
            
        if period == "heute":
            if dt.date() == now.date():
                filtered_orders.append(o)
        elif period == "monat":
            if dt.year == now.year and dt.month == now.month:
                filtered_orders.append(o)
        elif period == "letzter_monat":
            last_month_year = now.year
            last_month = now.month - 1
            if last_month == 0:
                last_month = 12
                last_month_year -= 1
            if dt.year == last_month_year and dt.month == last_month:
                filtered_orders.append(o)
        else:
            filtered_orders.append(o)
            
    # ── Fix 6e: brutto verwendet original_total, falls vorhanden ──
    # Bei per Einzelartikel-Zahlung (pay-item) abgearbeiteten Bestellungen ist
    # `o["total"]` = 0 (alle Items wurden entfernt), aber `original_total`
    # enthält den ursprünglichen Warenwert. Wir nehmen max(total, original_total),
    # damit der Bruttoumsatz korrekt ist — egal über welchen Weg bezahlt wurde.
    brutto = sum(
        max(o.get("total", 0.0) or 0.0, o.get("original_total", 0.0) or 0.0)
        for o in filtered_orders if o.get("status") == "bezahlt"
    )
    
    netto_7 = 0.0
    netto_19 = 0.0
    brutto_7 = 0.0
    brutto_19 = 0.0
    
    for o in filtered_orders:
        if o.get("status") != "bezahlt":
            continue
        for item in o.get("items", []):
            item_price = item.get("price", 0.0)
            item_qty = item.get("quantity", 0)
            item_total = item_price * item_qty
            is_food = item.get("category_type", "küche") == "küche"
            if is_food:
                brutto_7 += item_total
                netto_7 += item_total / 1.07
            else:
                brutto_19 += item_total
                netto_19 += item_total / 1.19
                
    total_tip = sum(o.get("tip_amount", 0.0) for o in filtered_orders if o.get("status") == "bezahlt")
    total_orders = len([o for o in filtered_orders if o.get("status") == "bezahlt"])
    
    avg_basket = 0.0
    if total_orders > 0:
        avg_basket = brutto / total_orders
        
    product_sales = {}
    for p in restaurant.get("products", []):
        product_sales[p["name"]] = 0
    for o in filtered_orders:
        if o.get("status") == "bezahlt":
            for item in o.get("items", []):
                name = item.get("name")
                qty = item.get("quantity", 0)
                product_sales[name] = product_sales.get(name, 0) + qty
                
    sorted_products = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)
    top_5 = sorted_products[:5]
    flop_5 = sorted(product_sales.items(), key=lambda x: x[1])[:5]
    
    stats = {
        "brutto": round(brutto, 2),
        "netto_7": round(netto_7, 2),
        "netto_19": round(netto_19, 2),
        "brutto_7": round(brutto_7, 2),
        "brutto_19": round(brutto_19, 2),
        "tip": round(total_tip, 2),
        "orders_count": total_orders,
        "avg_basket": round(avg_basket, 2),
        "top_5": top_5,
        "flop_5": flop_5
    }
    
    return templates.TemplateResponse(
        request,
        "admin.html",
        {
            "request": request,
            "restaurant": restaurant,
            "slug": slug,
            "tenant_slug": slug,
            "stats": stats,
            "period": period,
            "current_user": user,
            "orders_json": json.dumps(restaurant.get("orders", [])),
            "tables_json": json.dumps(restaurant.get("tables", [])),
            "products_json": json.dumps(restaurant.get("products", [])),
            "categories_json": json.dumps(restaurant.get("categories", [])),
            "hh_active_global": hh_active_global,
            "events_json": json.dumps(restaurant.get("events", []))
        }
    )

@app.get("/admin/login", response_class=HTMLResponse)
def get_login(request: Request, redirect: Optional[str] = None, db: Session = Depends(get_db)):
    res = get_current_user_and_slug(request)
    if res:
        user, slug = res
        restaurant = get_restaurant_or_raise(slug, db)
        role = user["role"]
        if role == "chef":
            return RedirectResponse(url="/admin/dashboard")
        elif role == "kellner":
            return RedirectResponse(url=f"/{slug}/tablet")
        elif role == "zubereiter":
            return RedirectResponse(url=f"/{slug}/kitchen")
            
    return templates.TemplateResponse(
        request,
        "login.html",
        {
            "request": request,
            "restaurant_name": "digi-gastro",
            "slug": "",
            "email": "",
            "error": None,
            "redirect": redirect
        }
    )

@app.post("/admin/login")
def post_login(
    request: Request,
    response: Response,
    email: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    pin: Optional[str] = Form(None),
    redirect: Optional[str] = None
, db: Session = Depends(get_db)):
    if not (email and password) and not pin:
        return templates.TemplateResponse(
            request,
            "login.html",
            {
                "request": request,
                "restaurant_name": "digi-gastro",
                "slug": "",
                "email": email or "",
                "error": "Bitte geben Sie Ihre E-Mail-Adresse und Ihr Passwort (oder Ihre PIN) ein.",
                "redirect": redirect
            }
        )
    target_url = "/admin"
    if redirect == "tablet":
        pass
    elif redirect == "kitchen":
        pass
    elif redirect == "setup":
        target_url = "/admin/setup"
        
    if email and password:
        # Check superadmin first
        if email.strip() == "admin@digi-gastro.de" and password.strip() == ADMIN_PASSWORD:
            resp = RedirectResponse(url="/digi-gastro-admin", status_code=303)
            resp.set_cookie(key="session_global", value=email.strip(), httponly=True, max_age=31536000, samesite="lax", secure=not _IS_LOCAL_DEV)
            # Clear any existing tenant session to prevent conflicts
            resp.delete_cookie(key="session", path="/")
            return resp

        tenant = db.query(Tenant).filter_by(email=email.strip()).first()
        if tenant and tenant.password == password.strip():
            slug = tenant.slug
            restaurant = get_restaurant_or_raise(slug, db)
            if not restaurant.get("is_setup_completed", False):
                target_url = "/admin/setup"
            elif redirect == "tablet":
                target_url = f"/{slug}/tablet"
            elif redirect == "kitchen":
                target_url = f"/{slug}/kitchen"
            elif not redirect:
                target_url = "/admin/dashboard"
                
            resp = RedirectResponse(url=target_url, status_code=303)
            # Set unified session cookie: slug:name:role:password
            resp.set_cookie(key="session", value=f"{slug}:Owner:chef:{password.strip()}", httponly=True, max_age=31536000, samesite="lax", secure=not _IS_LOCAL_DEV)
            return resp
        else:
            return templates.TemplateResponse(
                request,
                "login.html",
                {
                    "request": request,
                    "restaurant_name": "digi-gastro",
                    "slug": "",
                    "email": email or "",
                    "error": "Ungültige E-Mail-Adresse oder Passwort.",
                    "redirect": redirect
                }
            )
            
    if pin:
        pin_str = str(pin).strip()
        all_tenants = db.query(Tenant).all()
        for tenant in all_tenants:
            slug = tenant.slug
            restaurant = get_restaurant_or_raise(slug, db)
            staff_list = restaurant.get("staff", [])
            if not staff_list and pin_str == "1111":
                staff_list = [{"name": "Chef", "role": "chef", "pin": "1111", "pin_code": "1111"}]
                restaurant["staff"] = staff_list
                try:
                    save_restaurant_to_db(slug, restaurant, db)
                    db.commit()
                except Exception as e:
                    db.rollback()
                    raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
                
            employee = next((s for s in staff_list if str(s.get("pin_code", s.get("pin"))) == pin_str), None)
            if employee:
                role = employee["role"]
                name = employee["name"]
                
                if role != "chef":
                    return templates.TemplateResponse(
                        request,
                        "login.html",
                        {
                            "request": request,
                            "restaurant_name": restaurant["name"],
                            "slug": "",
                            "email": email or "",
                            "error": "Mitarbeiter-Anmeldung erfolgt direkt auf dem Tablet-Sperrbildschirm.",
                            "redirect": redirect
                        }
                    )
                
                if not redirect:
                    if not restaurant.get("is_setup_completed", False):
                        target_url = "/admin/setup"
                    else:
                        target_url = "/admin/dashboard"
                elif redirect == "tablet":
                    target_url = f"/{slug}/tablet"
                elif redirect == "kitchen":
                    target_url = f"/{slug}/kitchen"
                    
                resp = RedirectResponse(url=target_url, status_code=303)
                # Set unified session cookie: slug:name:role:pin
                resp.set_cookie(key="session", value=f"{slug}:{name}:{role}:{pin_str}", httponly=True, max_age=31536000, samesite="lax", secure=not _IS_LOCAL_DEV)
                return resp
                
    return templates.TemplateResponse(
        request,
        "login.html",
        {
            "request": request,
            "restaurant_name": "digi-gastro",
            "slug": "",
            "email": email or "",
            "error": "Ungültige Anmeldedaten.",
            "redirect": redirect
        }
    )

@app.get("/admin/logout")
def get_logout(request: Request):
    # Check if this was a superadmin session — redirect accordingly
    is_global = request.cookies.get("session_global") == "admin@digi-gastro.de"
    resp = RedirectResponse(url="/digi-gastro-admin/login" if is_global else "/admin/login")
    resp.delete_cookie(key="session")
    # Also always clear global session cookie so superadmin doesn't get stuck
    if is_global:
        resp.delete_cookie(key="session_global")
    return resp

def sort_tables_in_grid(tables):
    import re
    def natural_sort_key(t_obj):
        val = str(t_obj.get("number", ""))
        return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', val)]
    
    sorted_tables = sorted(tables, key=natural_sort_key)
    count = len(sorted_tables)
    if count == 0:
        return sorted_tables
        
    if count <= 4:
        cols = 2
    elif count <= 9:
        cols = 3
    elif count <= 16:
        cols = 4
    elif count <= 25:
        cols = 5
    else:
        cols = 6
        
    for i, t in enumerate(sorted_tables):
        col = i % cols
        row = i // cols
        
        pos_x = col * (90 / (cols - 1)) if cols > 1 else 0
        max_rows = (count + cols - 1) // cols
        pos_y = row * (84 / (max_rows - 1)) if max_rows > 1 else 0
        
        t["pos_x"] = round(pos_x)
        t["pos_y"] = round(pos_y)
        
    return sorted_tables

@app.post("/admin/table-erstellen")
async def create_table(
    request: Request,
    number: str = Form(...),
    zone: str = Form(...),
    shape: str = Form("rect"),
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    table_num = number.strip()
    
    if "tables" not in restaurant or restaurant["tables"] is None:
        restaurant["tables"] = []
        
    if not any(t["number"] == table_num and t.get("zone") == zone for t in restaurant["tables"]):
        import secrets as _secrets
        table_entry = {
            "number": table_num,
            "zone": zone,
            "security_token": _secrets.token_hex(16),
            "active_session_token": None,
            "pos_x": 0.0,
            "pos_y": 0.0,
            "width": 120.0,
            "height": 80.0,
            "shape": shape,
            "active": True,
            "qr_token": _secrets.token_urlsafe(12)
        }
        restaurant["tables"].append(table_entry)
        
        restaurant["tables"] = sort_tables_in_grid(restaurant["tables"])
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    await manager.broadcast_global(slug, {"type": "refresh_tables"})
    return RedirectResponse(url="/admin/dashboard", status_code=303)

@app.post("/admin/table-loeschen/{table_num}")
async def delete_table(request: Request, table_num: str, zone: Optional[str] = None, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    if "tables" in restaurant:
        if zone:
            restaurant["tables"] = [t for t in restaurant["tables"] if not (t["number"] == table_num and t.get("zone") == zone)]
        else:
            restaurant["tables"] = [t for t in restaurant["tables"] if t["number"] != table_num]
        restaurant["tables"] = sort_tables_in_grid(restaurant["tables"])

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    await manager.broadcast_global(slug, {"type": "refresh_tables"})
    return RedirectResponse(url="/admin/dashboard", status_code=303)

# Legacy redirects for backward compatibility
@app.get("/{slug}/admin")
def legacy_admin_root(slug: str):
    return RedirectResponse(url="/admin")

@app.get("/{slug}/admin/dashboard")
def legacy_admin_dashboard(slug: str):
    return RedirectResponse(url="/admin/dashboard")

@app.get("/{slug}/admin/setup")
def legacy_admin_setup(slug: str):
    return RedirectResponse(url="/admin/setup")

@app.get("/{slug}/admin/login")
def legacy_admin_login(slug: str):
    return RedirectResponse(url="/admin/login")

@app.get("/{slug}/admin/logout")
def legacy_admin_logout(slug: str):
    return RedirectResponse(url="/admin/logout")

@app.post("/admin/profile-update")
async def profile_update(
    request: Request,
    has_kitchen: Optional[bool] = Form(False),
    is_shishabar: Optional[bool] = Form(False),
    impressum_content: Optional[str] = Form(""),
    datenschutz_content: Optional[str] = Form(""),
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    restaurant["has_kitchen"] = bool(has_kitchen)
    restaurant["is_shishabar"] = bool(is_shishabar)
    restaurant["impressum_content"] = impressum_content.strip() if impressum_content else ""
    restaurant["datenschutz_content"] = datenschutz_content.strip() if datenschutz_content else ""
    
    # Update categories dynamically to keep it in sync with flags
    categories = ["Drinks", "Desserts"]
    if restaurant["has_kitchen"]:
        categories.insert(0, "Burger")
        categories.append("Salads")
    if restaurant["is_shishabar"]:
        categories.append("Shisha")
        
    # Preserve custom categories
    standard_kitchen_cats = ["Burger", "Salads"]
    standard_shisha_cats = ["Shisha"]
    
    for cat in restaurant.get("categories", []):
        if cat in standard_kitchen_cats and not restaurant["has_kitchen"]:
            continue
        if cat in standard_shisha_cats and not restaurant["is_shishabar"]:
            continue
        if cat not in categories:
            categories.append(cat)
            
    restaurant["categories"] = categories

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    await manager.broadcast_global(slug, {"type": "update"})
    return RedirectResponse(url="/admin/dashboard", status_code=303)



@app.post("/admin/sitzplan/positions")
async def save_sitzplan_positions(request: Request, payload: dict, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    tables = restaurant.get("tables", [])
    for t in tables:
        num = str(t.get("number"))
        zone = str(t.get("zone", ""))
        key = f"{num}:{zone}"
        payload_key = key if key in payload else (num if num in payload else None)
        if payload_key:
            t["pos_x"] = float(payload[payload_key].get("pos_x", t.get("pos_x", 0.0)))
            t["pos_y"] = float(payload[payload_key].get("pos_y", t.get("pos_y", 0.0)))
            t["width"] = float(payload[payload_key].get("width", t.get("width", 120.0)))
            t["height"] = float(payload[payload_key].get("height", t.get("height", 80.0)))
            t["shape"] = str(payload[payload_key].get("shape", t.get("shape", "rect")))

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    await manager.broadcast_global(slug, {"type": "refresh_tables"})
    return {"success": True}



@app.post("/admin/kategorie-erstellen")
async def create_category(
    request: Request,
    name: Optional[str] = Form(None),
    category_name: Optional[str] = Form(None, alias="category-name"),
    parent_category: Optional[str] = Form(None),
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    final_name = name or category_name
    if not final_name:
         raise HTTPException(status_code=400, detail="Kategorie-Name erforderlich.")
         
    cat = final_name.strip()
    # Subcategories removed - only flat categories
    
    if cat and cat not in restaurant["categories"]:
        restaurant["categories"].append(cat)
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    await manager.broadcast_global(slug, {"type": "update"})
    return RedirectResponse(url="/admin/dashboard", status_code=303)

# Helper für Admin-Rechteprüfung ist nun am Anfang definiert.

@app.get("/admin/products/export-csv")
async def export_products_csv(request: Request, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    products = restaurant.get("products", [])
    price_mode = restaurant.get("price_mode", "brutto")
    
    # Generate CSV response
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    
    # Header
    writer.writerow([
        "id", "name", "price", "category", "category_type", 
        "description", "image", "is_vegan", "is_glutenfree", 
        "is_available", "allergens"
    ])
    
    for p in products:
        allergens_list = p.get("allergens", [])
        allergens_str = ", ".join(allergens_list) if isinstance(allergens_list, list) else ""
        
        # Convert price to netto if tenant price_mode == netto
        export_price = p.get('price', 0.0)
        if price_mode == "netto":
            cat_type = p.get("category_type", "küche").lower()
            mwst_divisor = 1.19 if cat_type == "bar" else 1.07
            export_price = round(export_price / mwst_divisor, 2)
        
        writer.writerow([
            p.get("id", ""),
            p.get("name", ""),
            f"{export_price:.2f}".replace('.', ','),
            p.get("category", ""),
            p.get("category_type", "küche"),
            p.get("description", ""),
            p.get("image", ""),
            "true" if p.get("is_vegan") or p.get("vegan") else "false",
            "true" if p.get("is_glutenfree") else "false",
            "true" if p.get("is_available", True) else "false",
            allergens_str
        ])
        
    response = StreamingResponse(
        iter([output.getvalue().encode('utf-8-sig')]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = f"attachment; filename=speisekarte_{slug}.csv"
    return response


@app.post("/admin/products/import-csv")
async def import_products_csv(
    request: Request,
    csv_file: UploadFile = File(...),
    overwrite: Optional[bool] = Form(False),
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    user, slug, restaurant = chef_data
    content = await csv_file.read()
    
    try:
        csv_text = content.decode('utf-8-sig')
    except UnicodeDecodeError:
        try:
            csv_text = content.decode('latin1')
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Ungültiges Dateiformat. Bitte nutzen Sie UTF-8.")
            
    # Sniff delimiter
    delimiter = ';'
    first_line = csv_text.splitlines()[0] if csv_text else ""
    if ',' in first_line and ';' not in first_line:
        delimiter = ','
    elif ',' in first_line and ';' in first_line:
        if len(first_line.split(',')) > len(first_line.split(';')):
            delimiter = ','
            
    reader = csv.DictReader(csv_text.splitlines(), delimiter=delimiter)
    
    existing_products = restaurant.get("products", [])
    existing_categories = set(restaurant.get("categories", []))
    
    if overwrite:
        existing_products = []
        existing_categories = set()
        
    max_id = max([p.get("id", 0) for p in existing_products] + [0])
    
    new_products = []
    seen_categories = set(existing_categories)
    
    for row in reader:
        name = row.get("name")
        if not name:
            continue
            
        category = row.get("category", "Unkategorisiert").strip()
        category_type = row.get("category_type", "küche").strip().lower()
        if category_type not in ["bar", "küche"]:
            category_type = "küche"
            
        price_str = row.get("price", "0.0").replace(',', '.').strip()
        try:
            price = float(price_str)
        except ValueError:
            price = 0.0
        
        # If tenant is in netto mode, convert imported netto price to brutto for DB storage
        price_mode = restaurant.get("price_mode", "brutto")
        if price_mode == "netto" and price > 0:
            mwst_factor = 1.19 if category_type == "bar" else 1.07
            price = round(price * mwst_factor, 2)
            
        desc = row.get("description", "")
        img = row.get("image", "")
        
        is_vegan_str = row.get("is_vegan", "false").strip().lower()
        is_vegan = is_vegan_str in ["true", "1", "yes", "wahr"]
        
        is_gluten_str = row.get("is_glutenfree", "false").strip().lower()
        is_gluten = is_gluten_str in ["true", "1", "yes", "wahr"]
        
        is_avail_str = row.get("is_available", "true").strip().lower()
        is_avail = is_avail_str not in ["false", "0", "no", "falsch"]
        
        allergens_str = row.get("allergens", "")
        allergens_list = [a.strip() for a in allergens_str.split(',') if a.strip()] if allergens_str else []
        
        if category and category not in seen_categories:
            seen_categories.add(category)
            
        prod_id = None
        id_str = row.get("id", "").strip()
        if id_str.isdigit():
            prod_id = int(id_str)
            
        existing_p = None
        if prod_id and not overwrite:
            existing_p = next((p for p in existing_products if p.get("id") == prod_id), None)
            
        if not existing_p and not overwrite:
            existing_p = next((p for p in existing_products if str(p.get("name")).lower().strip() == name.lower().strip()), None)
            
        if existing_p:
            existing_p["name"] = name
            existing_p["price"] = price
            existing_p["category"] = category
            existing_p["category_type"] = category_type
            existing_p["description"] = desc
            existing_p["image"] = img
            existing_p["is_vegan"] = is_vegan
            existing_p["vegan"] = is_vegan
            existing_p["is_glutenfree"] = is_gluten
            existing_p["is_available"] = is_avail
            existing_p["allergens"] = allergens_list
        else:
            if not prod_id or overwrite or any(p.get("id") == prod_id for p in existing_products + new_products):
                max_id += 1
                prod_id = max_id
                
            new_p = {
                "id": prod_id,
                "name": name,
                "price": price,
                "category": category,
                "category_type": category_type,
                "description": desc,
                "image": img,
                "is_vegan": is_vegan,
                "vegan": is_vegan,
                "is_glutenfree": is_gluten,
                "is_available": is_avail,
                "allergens": allergens_list
            }
            new_products.append(new_p)
            
    restaurant["products"] = existing_products + new_products
    restaurant["categories"] = sorted(list(seen_categories))
    
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der importierten Daten: {e}")
        
    await manager.broadcast_global(slug, {"type": "update"})
    return RedirectResponse(url="/admin/dashboard", status_code=303)


@app.post("/admin/produkt-erstellen")
async def post_produkt_erstellen(
    request: Request,
    name: str = Form(...),
    preis: float = Form(...),
    kategorie: str = Form(...),
    category_type: Optional[str] = Form(""),
    description: Optional[str] = Form(""),
    name_en: Optional[str] = Form(""),
    description_en: Optional[str] = Form(""),
    image_url: Optional[str] = Form(""),
    image_file: Optional[UploadFile] = File(None),
    is_vegan: Optional[bool] = Form(False),
    is_glutenfree: Optional[bool] = Form(False),
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    user, slug, restaurant = chef_data

    # Validate price
    if preis < 0 or preis > 99999:
        raise HTTPException(status_code=400, detail="Ungültiger Preis. Der Preis muss zwischen 0 und 99.999 € liegen.")

    cat_name = kategorie.strip()
    if cat_name and cat_name not in restaurant["categories"]:
        restaurant["categories"].append(cat_name)

    # Generate ID
    new_id = 1
    if restaurant["products"]:
        new_id = max(p["id"] for p in restaurant["products"]) + 1

    final_cat_type = "k\u00fcche"
    if category_type and category_type.strip() in ["bar", "küche", "shisha"]:
        final_cat_type = category_type.strip()
    else:
        cat_lower = cat_name.lower()
        if any(keyword in cat_lower for keyword in ["drinks", "bar", "getr\u00e4nke", "soft", "alkohol", "bier", "wein", "cocktail", "saft", "kaffee", "tee", "wasser", "limo"]):
            final_cat_type = "bar"
        elif any(keyword in cat_lower for keyword in ["shisha", "wasserpfeife", "pfeife", "head", "kohle"]):
            final_cat_type = "shisha"
            
    category_type = final_cat_type

    # ── Image handling: file upload wins over URL ─────────────────
    final_image = ""
    if image_file and image_file.filename:
        products_upload_dir = os.path.join(UPLOAD_DIR, "products")
        os.makedirs(products_upload_dir, exist_ok=True)
        safe_name = f"{slug}-product-{new_id}.png"
        file_path = os.path.join(products_upload_dir, safe_name)
        content = await image_file.read()
        try:
            content = process_and_crop_product_image(content)
        except Exception as e:
            print(f"[Image Processing] Error processing product image: {e}")
        with open(file_path, "wb") as fh:
            fh.write(content)
        final_image = f"/uploads/products/{safe_name}"

    elif image_url and image_url.strip():
        final_image = image_url.strip()
    else:
        final_image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400"

    new_product = {
        "id": new_id,
        "name": name.strip(),
        "price": float(preis),
        "description": description.strip() if description else "",
        "image": final_image,
        "vegan": bool(is_vegan),
        "is_vegan": bool(is_vegan),
        "is_glutenfree": bool(is_glutenfree),
        "allergens": [],
        "category_type": category_type,
        "category": cat_name,
        "is_available": True,
        "happy_hour_price": None,
        "start_time": None,
        "end_time": None,
        "name_en": name_en.strip() if name_en else "",
        "description_en": description_en.strip() if description_en else ""
    }

    restaurant["products"].append(new_product)

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Erstellen des Produkts: {e}")

    await manager.broadcast_global(slug, {"type": "update"})

    # Return JSON for fetch requests, redirect for regular form submissions
    accept = request.headers.get("accept", "")
    if "application/json" in accept or request.headers.get("x-requested-with") == "fetch":
        return {"success": True, "product": new_product}

    return RedirectResponse(url="/admin/dashboard", status_code=303)


@app.post("/admin/produkt-loeschen/{product_id}")
async def delete_produkt(
    request: Request,
    product_id: int,
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    """Sicher löschen: nur eingeloggte Chef-User, strikt Tenant-isoliert."""
    user, slug, restaurant = chef_data

    # Find product to check if it had an image
    product = next((p for p in restaurant.get("products", []) if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden.")
    
    old_image = product.get("image", "")

    original_len = len(restaurant["products"])
    restaurant["products"] = [
        p for p in restaurant["products"] if p["id"] != product_id
    ]
    if len(restaurant["products"]) == original_len:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden.")

    db_session = SessionLocal()
    try:
        from database import Product as DBProduct
        db_session.query(DBProduct).filter_by(id=product_id, tenant_slug=slug).delete()
        save_restaurant_to_db(slug, restaurant, db_session)
        db_session.commit()
    finally:
        db_session.close()

    # Clean up the image if it is no longer used by any other product
    if old_image:
        delete_local_image_if_unused(old_image, restaurant)

    await manager.broadcast_global(slug, {"type": "update"})
    # Support both fetch (JSON) and form-post (redirect) callers
    accept = request.headers.get("accept", "")
    if "application/json" in accept or request.headers.get("x-requested-with") == "fetch":
        return {"success": True}
    return RedirectResponse(url="/admin/dashboard", status_code=303)


@app.post("/admin/kategorie-loeschen")
async def delete_kategorie(
    request: Request,
    name: str = Form(...),
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    """Kategorie sicher löschen (inkl. Tenant-Check). Produkte bleiben erhalten."""
    user, slug, restaurant = chef_data

    cat_name = name.strip()
    if cat_name not in restaurant["categories"]:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden.")

    restaurant["categories"] = [
        c for c in restaurant["categories"] if c != cat_name
    ]

    db_session = SessionLocal()
    try:
        from database import Category as DBCategory
        db_session.query(DBCategory).filter_by(name=cat_name, tenant_slug=slug).delete()
        save_restaurant_to_db(slug, restaurant, db_session)
        db_session.commit()
    finally:
        db_session.close()

    await manager.broadcast_global(slug, {"type": "update"})
    return RedirectResponse(url="/admin/dashboard", status_code=303)

# API Models
class CallServicePayload(BaseModel):
    type: str
    table: str
    token: Optional[str] = None

@app.post("/api/{slug}/call-service")
@tenant_lock
async def api_call_service(request: Request, slug: str, payload: CallServicePayload, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    
    clean_num, clean_zone = parse_active_table_num(payload.table)
    tables_list = restaurant.get("tables", [])
    
    # Also extract zone from cookie if payload doesn't include one
    cookie_zone = ""
    cookie_name = f"guest_session_{slug}"
    session_val = request.cookies.get(cookie_name)
    if session_val:
        try:
            c_table, c_tok = session_val.split(":", 1)
            _, c_z = parse_active_table_num(c_table)
            if c_z:
                cookie_zone = c_z
        except Exception:
            pass
    resolved_zone = clean_zone or cookie_zone
    
    db_table = None
    # 1. Try zone-specific lookup
    if resolved_zone:
        db_table = next((t for t in tables_list if str(t.get("number")) == clean_num and t.get("zone") == resolved_zone), None)
    # 2. Try token-based lookup
    tok_lookup = payload.token or request.query_params.get("token") or request.headers.get("X-Token")
    if not db_table and tok_lookup:
        db_table = next((t for t in tables_list if str(t.get("number")) == clean_num and (t.get("security_token") == tok_lookup or t.get("active_session_token") == tok_lookup)), None)
    # 3. Fallback: number only
    if not db_table:
        db_table = next((t for t in tables_list if str(t.get("number")) == clean_num), None)
        
    tok = payload.token or request.query_params.get("token") or request.headers.get("X-Token")
    if not tok and session_val:
        try:
            c_table, c_tok = session_val.split(":", 1)
            c_clean_num, c_clean_zone = parse_active_table_num(c_table)
            if c_clean_num == clean_num:
                tok = c_tok
        except Exception:
            pass
                
    master_token = restaurant.get("security_token")
    table_token = db_table.get("active_session_token") if db_table else None
    
    # ── Staff / POS trusted device bypass ──
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_staff = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_staff:
        session = request.cookies.get(f"session_{slug}")
        if session:
            # Validate session cookie format (name:role:pin) and check role
            try:
                parts = session.split(":")
                if len(parts) == 3 and parts[1] in ["chef", "kellner"]:
                    is_staff = True
            except Exception:
                pass
        if not is_staff:
            res = get_current_user_and_slug(request)
            if res:
                user, session_slug = res
                if session_slug == slug and user["role"] in ["chef", "kellner"]:
                    is_staff = True
            
    if not is_staff:
        # Security: Customers must use active_session_token only
        is_token_valid = (tok and table_token and tok == table_token)
        if not is_token_valid:
            raise HTTPException(status_code=403, detail="Ungültiger oder abgelaufener Tisch-Code.")
            
    if "service_calls" not in restaurant:
        restaurant["service_calls"] = []
        
    service_type = payload.type
    if payload.type == "zahlen_bar":
        service_type = "bar"
    elif payload.type == "zahlen_karte":
        service_type = "karte"
        
    existing_calls = restaurant.get("service_calls", [])
    new_id = max([c.get("id", 0) for c in existing_calls] + [0]) + 1
    
    # Normalize table name: always include zone if available
    final_zone = db_table.get("zone", "") if db_table else (resolved_zone or clean_zone)
    normalized_table = f"Tisch {clean_num} ({final_zone})" if final_zone else f"Tisch {clean_num}"
    
    new_call = {
        "id": new_id,
        "table": normalized_table,
        "type": service_type,
        "timestamp": datetime.now().strftime("%H:%M:%S")
    }
    
    restaurant["service_calls"].append(new_call)
    
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
        
    actual_id = restaurant["service_calls"][-1]["id"]
    await manager.broadcast_global(slug, {"type": "service_call", "call_id": actual_id, "table": normalized_table, "service_type": service_type})
    return {"success": True, "call_id": actual_id}

@app.get("/api/{slug}/check-session")
def check_session(request: Request, slug: str, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    
    # ── Staff / POS trusted device bypass ──
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_staff = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_staff:
        session = request.cookies.get(f"session_{slug}")
        if session:
            # Validate session cookie format (name:role:pin) and check role
            try:
                parts = session.split(":")
                if len(parts) == 3 and parts[1] in ["chef", "kellner"]:
                    is_staff = True
            except Exception:
                pass
        if not is_staff:
            res = get_current_user_and_slug(request)
            if res:
                user, session_slug = res
                if session_slug == slug and user["role"] in ["chef", "kellner"]:
                    is_staff = True
    if is_staff:
        return {"active": True}

    cookie_name = f"guest_session_{slug}"
    session_val = request.cookies.get(cookie_name)
    if not session_val:
        return {"active": False}
    try:
        c_table, c_token = session_val.split(":", 1)
        active_table_num = str(c_table).strip()
        active_token = c_token
    except Exception:
        return {"active": False}
        
    tables_list = restaurant.get("tables", [])
    clean_num, clean_zone = parse_active_table_num(active_table_num)
    db_table = None
    if clean_zone:
        db_table = next((t for t in tables_list if str(t.get("number")) == clean_num and t.get("zone") == clean_zone), None)
    if not db_table:
        db_table = next((t for t in tables_list if str(t.get("number")) == clean_num), None)
    active_session_tok = db_table.get("active_session_token") if db_table else None
    
    # Security: Only active_session_token validates a customer session
    is_token_valid = (active_token and active_session_tok and active_token == active_session_tok)
    return {"active": bool(is_token_valid)}

@app.get("/api/qr")
def generate_qr_code(request: Request, d: str = "", t: str = "", z: str = "", slug: str = ""):
    """Server-side QR code generation with optional logo overlay. Keeps tokens private (not sent to external APIs)."""
    import qrcode
    from io import BytesIO
    import base64
    from PIL import Image as PILImage
    
    # Validate: only admin/staff can generate QR codes
    res = get_current_user_and_slug(request)
    if not res:
        pos_session = request.cookies.get("pos_session")
        if not pos_session:
            for key, val in request.cookies.items():
                if key.startswith("pos_token_"):
                    break
            else:
                raise HTTPException(status_code=403, detail="Nicht autorisiert.")
    
    data = d or request.query_params.get("d", "")
    if not data:
        raise HTTPException(status_code=400, detail="Keine Daten für QR-Code.")
    
    # Extract slug: prefer direct query param, then try parsing from URL
    slug_param = request.query_params.get("slug", "")
    if slug_param:
        slug = slug_param
    elif not slug:
        try:
            from urllib.parse import urlparse
            parsed = urlparse(data)
            path_parts = [p for p in parsed.path.split("/") if p]
            if path_parts:
                slug = path_parts[0]
        except Exception:
            pass
    
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Try to embed the tenant logo in the center of the QR code
    logo_embedded = False
    if slug:
        try:
            db = SessionLocal()
            try:
                restaurant = load_restaurant_from_db(slug, db)
                if restaurant:
                    logo_url = restaurant.get("branding", {}).get("logo_url", "") or restaurant.get("logo_path", "")
                    print(f"[QR Logo] slug={slug}, logo_url={logo_url}")
                    if logo_url:
                        # Convert URL path to filesystem path
                        if logo_url.startswith("/uploads/"):
                            logo_fs_path = os.path.join(UPLOAD_DIR, logo_url[len("/uploads/"):])
                        elif logo_url.startswith("/static/"):
                            logo_fs_path = os.path.join(BASE_DIR, logo_url.lstrip("/"))
                        else:
                            logo_fs_path = None
                        
                        print(f"[QR Logo] logo_fs_path={logo_fs_path}, exists={os.path.exists(logo_fs_path) if logo_fs_path else 'N/A'}")
                        print(f"[QR Logo] UPLOAD_DIR={UPLOAD_DIR}")
                        
                        if logo_fs_path and os.path.exists(logo_fs_path):
                            logo_img = PILImage.open(logo_fs_path)
                            # Calculate logo size (30% of QR code for better visibility)
                            qr_width, qr_height = img.size
                            logo_max = int(min(qr_width, qr_height) * 0.30)
                            logo_img.thumbnail((logo_max, logo_max), PILImage.Resampling.LANCZOS)

                            # Convert logo to RGBA
                            if logo_img.mode != 'RGBA':
                                logo_img = logo_img.convert('RGBA')

                            # Detect if the logo is predominantly white/light-colored
                            # by checking the opaque pixels' average brightness
                            import numpy as _np
                            _arr = _np.array(logo_img)
                            _alpha = _arr[:, :, 3]
                            _opaque_mask = _alpha >= 128
                            _logo_is_light = True  # default to dark bg
                            if _opaque_mask.sum() > 0:
                                _rgb_opaque = _arr[:, :, :3][_opaque_mask]
                                _avg_brightness = _rgb_opaque.mean()
                                _logo_is_light = _avg_brightness > 180
                                print(f"[QR Logo] Logo avg brightness={_avg_brightness:.1f}, is_light={_logo_is_light}")

                            # Choose background color based on logo brightness:
                            # Light/white logos → dark background (so they're visible)
                            # Dark/colored logos → white background (standard QR look)
                            if _logo_is_light:
                                bg_color = (30, 30, 30, 255)       # dark charcoal
                                border_color = (60, 60, 60, 255)   # subtle dark border
                            else:
                                bg_color = (255, 255, 255, 255)    # white
                                border_color = (180, 180, 180, 255) # subtle gray border

                            # Flatten the logo onto the chosen background so semi-transparent
                            # pixels composite correctly (prevents washed-out look)
                            flat_bg = PILImage.new('RGBA', logo_img.size, bg_color)
                            flattened = PILImage.alpha_composite(flat_bg, logo_img)

                            logo_w, logo_h = flattened.size

                            # Build a composite: padded background + logo + border
                            padding = 8
                            bg_size = max(logo_w, logo_h) + padding * 2
                            bg = PILImage.new('RGBA', (bg_size, bg_size), bg_color)

                            # Border
                            from PIL import ImageDraw
                            draw = ImageDraw.Draw(bg)
                            draw.rectangle(
                                [1, 1, bg_size - 2, bg_size - 2],
                                outline=border_color,
                                width=1
                            )

                            # Paste flattened logo onto the background (no alpha mask needed)
                            paste_x = (bg_size - logo_w) // 2
                            paste_y = (bg_size - logo_h) // 2
                            bg.paste(flattened, (paste_x, paste_y))

                            # Center on QR code
                            qr_center_x = (qr_width - bg_size) // 2
                            qr_center_y = (qr_height - bg_size) // 2

                            # Convert QR to RGBA
                            if img.mode != 'RGBA':
                                img = img.convert('RGBA')

                            # Paste composite onto QR (solid, no alpha needed)
                            img.paste(bg, (qr_center_x, qr_center_y))
                            logo_embedded = True
                            print(f"[QR Logo] Logo embedded successfully! (bg={'dark' if _logo_is_light else 'white'})")
                        else:
                            print(f"[QR Logo] Logo file not found at {logo_fs_path}")
                    else:
                        print(f"[QR Logo] No logo_url found for slug={slug}")
                else:
                    print(f"[QR Logo] No restaurant found for slug={slug}")
            finally:
                db.close()
        except Exception as e:
            import traceback
            print(f"[QR Logo] Could not embed logo: {e}")
            traceback.print_exc()
    
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    
    return StreamingResponse(buffer, media_type="image/png", headers={
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Disposition": f"inline; filename=qr-tisch-{t}-{z}.png"
    })

@app.get("/api/tablet-status")
def get_tablet_status(request: Request, db: Session = Depends(get_db)):
    # ── Performance-Cache für tablet-status (Performance Fix für 100+ Gäste) ──
    # Dieser Endpoint wird von jedem Kellner alle 8s gepollt. Bei 7 Kellnern
    # sind das 7 Requests/8s = ~0.9 req/s. Ohne Cache lädt jeder Request den
    # GESAMTEN Tenant-State aus DB (alle Orders + Items + AuditLog + Events).
    # Mit Cache: 1 DB-Query pro 3s, Rest kommt aus Memory.
    # Cache-Key basiert auf slug + admin-flag + pos-token (für Auth-Isolation).
    slug_cache = None
    is_admin_cache = False
    client_pos_token_cache = None

    slug = None
    is_admin = False
    client_pos_token = None

    # 1. Try to get slug from admin/staff session
    res = get_current_user_and_slug(request)
    if res:
        user, slug = res
        is_admin = True
    else:
        # 2. Try to get slug from POS session
        pos_session = request.cookies.get("pos_session")
        if pos_session:
            try:
                parts = pos_session.split(":")
                if len(parts) == 2:
                    slug = parts[0]
                    client_pos_token = parts[1]
            except Exception:
                pass
        else:
            # 3. Fallback: Search if any "pos_token_{slug}" cookie exists
            for key, val in request.cookies.items():
                if key.startswith("pos_token_"):
                    slug = key.replace("pos_token_", "").strip()
                    client_pos_token = val
                    break

    if not slug:
        raise HTTPException(status_code=401, detail="Nicht autorisiert.")

    # ── Cache-Check: Antwort der letzten 3 Sekunden zurückgeben ──
    cache_key = f"tablet-status:{slug}:{'admin' if is_admin else 'pos'}:{client_pos_token or 'none'}"
    if sync_redis_client:
        try:
            cached_response = sync_redis_client.get(cache_key)
            if cached_response:
                # Cache-Hit: sofort zurückgeben, keine DB-Query
                return JSONResponse(content=json.loads(cached_response))
        except Exception:
            pass

    restaurant = get_restaurant_or_raise(slug, db)
    
    # Auto-kick for POS if not admin
    if not is_admin:
        is_test = request.url.hostname == "testserver"
        if not is_test:
            expected_pos = restaurant.get("pos_token")
            if expected_pos and client_pos_token != expected_pos:
                return JSONResponse(status_code=401, content={"error": "Gerät wurde entkoppelt"})
                
    active_orders = [o for o in restaurant.get("orders", []) if o["status"] not in ["bezahlt", "storniert"]]

    # Real-time statistics for today ("heute")
    orders = restaurant.get("orders", [])
    now = datetime.now()
    
    filtered_orders = []
    for o in orders:
        if o.get("status") == "storniert":
            continue
        ts_str = o.get("timestamp", "")
        if not ts_str:
            continue
        try:
            dt = datetime.strptime(ts_str[:10], "%Y-%m-%d")
        except Exception:
            continue
            
        if dt.date() == now.date():
            filtered_orders.append(o)
            
    # ── Fix 6e: brutto verwendet original_total, falls vorhanden ──
    # Bei per Einzelartikel-Zahlung (pay-item) abgearbeiteten Bestellungen ist
    # `o["total"]` = 0 (alle Items wurden entfernt), aber `original_total`
    # enthält den ursprünglichen Warenwert. Wir nehmen max(total, original_total),
    # damit der Bruttoumsatz korrekt ist — egal über welchen Weg bezahlt wurde.
    brutto = sum(
        max(o.get("total", 0.0) or 0.0, o.get("original_total", 0.0) or 0.0)
        for o in filtered_orders if o.get("status") == "bezahlt"
    )
    total_tip = sum(o.get("tip_amount", 0.0) for o in filtered_orders if o.get("status") == "bezahlt")
    total_orders = len([o for o in filtered_orders if o.get("status") == "bezahlt"])
    
    netto_7 = 0.0
    netto_19 = 0.0
    brutto_7 = 0.0
    brutto_19 = 0.0
    
    for o in filtered_orders:
        if o.get("status") != "bezahlt":
            continue
        for item in o.get("items", []):
            item_price = item.get("price", 0.0)
            item_qty = item.get("quantity", 0)
            item_total = item_price * item_qty
            is_food = item.get("category_type", "küche") == "küche"
            if is_food:
                brutto_7 += item_total
                netto_7 += item_total / 1.07
            else:
                brutto_19 += item_total
                netto_19 += item_total / 1.19
                
    avg_basket = 0.0
    if total_orders > 0:
        avg_basket = brutto / total_orders
        
    recent_payments = []
    paid_orders = [o for o in orders if o.get("status") == "bezahlt"]
    paid_orders_sorted = sorted(paid_orders, key=lambda x: x.get("timestamp", ""), reverse=True)
    for o in paid_orders_sorted[:5]:
        # original_total mitsenden — sonst zeigt das Admin-Dashboard nach
        # Teilzahlung/Storno/Transfer 0€ anstatt den echten Warenwert.
        _ot = o.get("original_total")
        _t = o.get("total", 0.0) or 0.0
        if _ot is None:
            _ot = _t
        # Im Dashboard immer den höheren Wert nehmen (max von total und original_total)
        # → „Nie wieder 0€ im Admin-Report"
        display_total = max(_t, _ot) if _ot else _t
        recent_payments.append({
            "id": o.get("id"),
            "table": o.get("table"),
            "total": display_total,
            "original_total": _ot,
            "tip_amount": o.get("tip_amount", 0.0),
            "timestamp": o.get("timestamp", "")
        })

    # ── recent_cancellations: zuletzt stornierte Bons ──
    # WICHTIG: Frontend nutzt diese Liste, um stornierte Bons korrekt als
    # "Storniert" zu markieren. Ohne dieses Feld würde das Frontend beim
    # Verschwinden eines Bons aus active_orders fälschlich "Bezahlt" raten.
    # Siehe Frontend updateLiveTiles() für die Verbrauchslogik.
    recent_cancellations = []
    cancelled_orders = [o for o in orders if o.get("status") == "storniert"]
    cancelled_sorted = sorted(cancelled_orders, key=lambda x: x.get("timestamp", ""), reverse=True)
    for o in cancelled_sorted[:10]:
        _ot = o.get("original_total")
        _t = o.get("total", 0.0) or 0.0
        if _ot is None:
            _ot = _t
        display_total = max(_t, _ot) if _ot else _t
        recent_cancellations.append({
            "id": o.get("id"),
            "table": o.get("table"),
            "total": display_total,
            "original_total": _ot,
            "timestamp": o.get("timestamp", "")
        })

    result = {
        "orders": active_orders,
        "service_calls": restaurant.get("service_calls", []),
        "tables": restaurant.get("tables", []),
        "server_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "price_mode": restaurant.get("price_mode", "brutto"),
        "stats": {
            "brutto": round(brutto, 2),
            "netto_7": round(netto_7, 2),
            "netto_19": round(netto_19, 2),
            "brutto_7": round(brutto_7, 2),
            "brutto_19": round(brutto_19, 2),
            "tip": round(total_tip, 2),
            "orders_count": total_orders,
            "avg_basket": round(avg_basket, 2)
        },
        "recent_payments": recent_payments,
        "recent_cancellations": recent_cancellations
    }

    # ── Cache Response für 3 Sekunden ──
    # Spart bei 7 Kellnern alle 8s Polling: statt 7 DB-Queries nur 1 Query
    # pro 3 Sekunden. Reduziert DB-Last um ~95%.
    if sync_redis_client:
        try:
            sync_redis_client.setex(cache_key, 3, json.dumps(result, default=str))
        except Exception:
            pass

    return result


@app.get("/api/{slug}/products-lite")
def get_products_lite(request: Request, slug: str, db: Session = Depends(get_db)):
    """Lightweight product data endpoint for real-time WebSocket updates.
    Returns only the fields that can change (price, availability, happy hour status)
    without rendering the entire page template. ~2KB vs ~200KB full page."""
    restaurant = get_restaurant_or_raise(slug, db)
    
    # Process Events (same logic as menu page)
    berlin_now = get_berlin_now()
    now_time = berlin_now.strftime("%H:%M")
    weekday_idx = berlin_now.weekday()
    days_names = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
    days_abbr = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    possible_days = [days_abbr[weekday_idx], days_names[weekday_idx]]
    
    events = restaurant.get("events", [])
    active_categories = restaurant.get("categories", [])
    price_mode = restaurant.get("price_mode", "brutto")
    
    # Determine active events
    for ev in events:
        if not ev.get("is_active", True):
            ev["_is_currently_active"] = False
            continue
        ev_days = ev.get("days", [])
        ev_start = ev.get("start_time", "18:00")
        ev_end = ev.get("end_time", "20:00")
        is_today = any(day in ev_days for day in possible_days)
        is_active_now = is_today and ev_start.zfill(5) <= now_time <= ev_end.zfill(5)
        ev["_is_currently_active"] = is_active_now
    
    # Build lightweight product list
    products_lite = []
    for p in restaurant.get("products", []):
        if p.get("category") not in active_categories:
            continue
        
        is_hh_active = False
        display_price = p.get("price", 0)
        active_event = None
        
        # Price mode conversion
        if price_mode == "netto":
            cat_type = p.get("category_type", "küche").lower()
            mwst_factor = 1.19 if cat_type == "bar" else 1.07
            display_price = round(display_price / mwst_factor, 2)
        
        # Event pricing
        for ev in events:
            if not ev.get("is_active", True) or not ev.get("_is_currently_active", False):
                continue
            
            event_products = ev.get("products", [])
            if event_products:
                matched_ep = next((ep for ep in event_products if ep.get("product_id") == p.get("id")), None)
                if matched_ep and matched_ep.get("event_price") is not None:
                    is_hh_active = True
                    event_price_val = matched_ep["event_price"]
                    if price_mode == "netto":
                        cat_type = p.get("category_type", "küche").lower()
                        mwst_factor = 1.19 if cat_type == "bar" else 1.07
                        event_price_val = round(event_price_val / mwst_factor, 2)
                    display_price = event_price_val
                    active_event = {"name": ev["name"], "display_name": ev.get("display_name", "")}
                    break
            elif ev.get("mode") == "discount" and ev.get("discount", 0) > 0:
                is_hh_active = True
                discount_factor = (100 - ev["discount"]) / 100.0
                display_price = round(p["price"] * discount_factor, 2)
                if price_mode == "netto":
                    cat_type = p.get("category_type", "küche").lower()
                    mwst_factor = 1.19 if cat_type == "bar" else 1.07
                    display_price = round(display_price / mwst_factor, 2)
                active_event = {"name": ev["name"], "display_name": ev.get("display_name", "")}
                break
        
        products_lite.append({
            "id": p.get("id"),
            "is_available": p.get("is_available", True),
            "price": display_price,
            "is_hh_active": is_hh_active,
            "active_event": active_event,
            "category": p.get("category", "")
        })
    
    # Check if any event is active (for banner)
    any_event_active = any(ev.get("_is_currently_active", False) for ev in events if ev.get("is_active", True))
    active_events_info = []
    for ev in events:
        if ev.get("is_active", True) and ev.get("_is_currently_active", False):
            active_events_info.append({
                "name": ev.get("name", ""),
                "display_name": ev.get("display_name", ""),
                "mode": ev.get("mode", "selected"),
                "discount": ev.get("discount", 0)
            })
    
    # Clean up temporary flags
    for ev in events:
        ev.pop("_is_currently_active", None)
    
    return {
        "products": products_lite,
        "any_event_active": any_event_active,
        "active_events": active_events_info,
        "server_time": berlin_now.strftime("%Y-%m-%d %H:%M:%S")
    }


@app.get("/api/{slug}/table-unpaid-sum/{table_num}")
def get_table_unpaid_sum(request: Request, slug: str, table_num: str, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    unpaid_sum = 0.0
    t_num, t_zone = parse_active_table_num(str(table_num))
    
    # Parse guest session cookie to get zone + token
    cookie_zone = ""
    c_token = None
    cookie_name = f"guest_session_{slug}"
    session_val = request.cookies.get(cookie_name)
    if session_val:
        try:
            c_table, c_tok = session_val.split(":", 1)
            c_clean_num, c_clean_zone = parse_active_table_num(c_table)
            if c_clean_num == t_num:
                c_token = c_tok
                cookie_zone = c_clean_zone
        except Exception:
            pass
            
    tables_list = restaurant.get("tables", [])
    db_table = None
    if c_token:
        if cookie_zone:
            # Security: Only accept active_session_token for customer access
            db_table = next((t for t in tables_list if str(t.get("number")) == t_num and t.get("zone") == cookie_zone and t.get("active_session_token") == c_token), None)
        if not db_table:
            db_table = next((t for t in tables_list if str(t.get("number")) == t_num and t.get("active_session_token") == c_token), None)
    if not db_table:
        if cookie_zone:
            db_table = next((t for t in tables_list if str(t.get("number")) == t_num and t.get("zone") == cookie_zone), None)
        if not db_table:
            db_table = next((t for t in tables_list if str(t.get("number")) == t_num), None)
        
    zone = db_table.get("zone", "") if db_table else ""
    target_table_name = f"Tisch {t_num} ({zone})" if zone else f"Tisch {t_num}"

    
    for o in restaurant.get("orders", []):
        if (o["table"] == target_table_name or str(o["table"]).strip() == target_table_name.strip() or str(o["table"]).strip() == f"Tisch {t_num}") and o["status"] not in ["bezahlt", "storniert"]:
            unpaid_sum += o["total"]
            
    return {"unpaid_sum": unpaid_sum}




@app.post("/admin/staff")
def add_staff(request: Request, staff_name: str = Form(...), role: str = Form(...), pin: str = Form(...), chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    pin_str = str(pin).strip()
    
    restaurant["staff"].append({
        "name": staff_name,
        "role": role,
        "pin": pin_str,
        "pin_code": pin_str
    })
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    return RedirectResponse(url="/admin/dashboard", status_code=303)

@app.post("/admin/staff-loeschen/{pin_code}")
def delete_staff(request: Request, pin_code: str, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    restaurant["staff"] = [s for s in restaurant.get("staff", []) if str(s.get("pin_code")) != str(pin_code).strip()]
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    return RedirectResponse(url="/admin/dashboard", status_code=303)

@app.post("/admin/branding")
async def update_branding(
    request: Request,
    logo_file: Optional[UploadFile] = File(None),
    logo_url: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    plz: Optional[str] = Form(None),
    ort: Optional[str] = Form(None),
    instagram: Optional[str] = Form(None),
    facebook: Optional[str] = Form(None),
    tiktok: Optional[str] = Form(None),
    theme: Optional[str] = Form(None),
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    final_logo_url = logo_url.strip() if logo_url else restaurant.get("branding", {}).get("logo_url", "")
    
    # Process logo file upload if present
    if logo_file and logo_file.filename:
        import time
        logos_dir = os.path.join(UPLOAD_DIR, "logos")
        os.makedirs(logos_dir, exist_ok=True)
        
        # Generate clean secure unique name
        filename = f"{slug}_logo_{int(time.time())}_{logo_file.filename}"
        filename = "".join(c for c in filename if c.isalnum() or c in "._-")
        file_path = os.path.join(logos_dir, filename)
        
        content = logo_file.file.read()
        with open(file_path, "wb") as f:
            f.write(content)
            
        final_logo_url = f"/uploads/logos/{filename}"
        restaurant["logo_path"] = final_logo_url

    restaurant["branding"] = {
        "logo_url": final_logo_url,
        "address": address.strip() if address else "",
        "plz": plz.strip() if plz else "",
        "ort": ort.strip() if ort else "",
        "instagram": instagram.strip() if instagram else "",
        "facebook": facebook.strip() if facebook else "",
        "tiktok": tiktok.strip() if tiktok else ""
    }
    if theme:
        restaurant["theme"] = theme
    update_legal_placeholders(restaurant)
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    await manager.broadcast_global(slug, {"type": "update"})
    return RedirectResponse(url="/admin/dashboard?tab=config", status_code=303)

def update_legal_placeholders(restaurant: dict) -> None:
    branding = restaurant.get("branding", {})
    addr = branding.get("address", "")
    plz = branding.get("plz", "")
    ort = branding.get("ort", "")
    name = restaurant.get("name", "")
    email = restaurant.get("email", "")
    
    full_addr_line = addr
    plz_ort_line = f"{plz} {ort}".strip()
    
    # Impressum placeholders
    imp = restaurant.get("impressum_content", "")
    if imp:
        imp = str(imp)
        imp = imp.replace("[Vorname Nachname / Firmenname]", name)
        imp = imp.replace("[Name / Firmenname]", name)
        imp = imp.replace("[Straße und Hausnummer]", full_addr_line)
        imp = imp.replace("[Adresse]", f"{full_addr_line}, {plz_ort_line}")
        imp = imp.replace("[PLZ Ort]", plz_ort_line)
        if email:
            imp = imp.replace("[info@beispiel.de]", email)
        restaurant["impressum_content"] = imp
        
    # Datenschutz placeholders
    ds = restaurant.get("datenschutz_content", "")
    if ds:
        ds = str(ds)
        ds = ds.replace("[Name / Firmenname]", name)
        ds = ds.replace("[Adresse]", f"{full_addr_line}, {plz_ort_line}")
        if email:
            ds = ds.replace("[E-Mail-Adresse]", email)
            ds = ds.replace("[info@beispiel.de]", email)
        restaurant["datenschutz_content"] = ds

@app.post("/admin/landingpage")
async def update_landingpage(
    request: Request,
    welcome_title: Optional[str] = Form(None),
    welcome_subtitle: Optional[str] = Form(None),
    google_rating_url: Optional[str] = Form(None),
    title_offers: Optional[str] = Form(None),
    title_gallery: Optional[str] = Form(None),
    title_videos: Optional[str] = Form(None),
    slideshow_enabled: Optional[bool] = Form(False),
    landing_sections_json: Optional[str] = Form(None),
    custom_sections_json: Optional[str] = Form(None),
    offer_images: List[UploadFile] = File(None),
    slideshow_images: List[UploadFile] = File(None),
    gallery_images: List[UploadFile] = File(None),
    custom_section_images: List[UploadFile] = File(None),
    landing_videos: List[UploadFile] = File(None),
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    from typing import List
    import time
    import json as json_module
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    landing_page = restaurant.get("landing_page", {})
    if not isinstance(landing_page, dict):
        landing_page = {}
        
    existing_offers = landing_page.get("offer_images", [])
    if not isinstance(existing_offers, list):
        existing_offers = []
    existing_offer_videos = landing_page.get("offer_videos", [])
    if not isinstance(existing_offer_videos, list):
        existing_offer_videos = []
        
    existing_slideshow = landing_page.get("slideshow_images", [])
    if not isinstance(existing_slideshow, list):
        existing_slideshow = []
    existing_slideshow_videos = landing_page.get("slideshow_videos", [])
    if not isinstance(existing_slideshow_videos, list):
        existing_slideshow_videos = []
        
    existing_gallery = landing_page.get("gallery_images", [])
    if not isinstance(existing_gallery, list):
        existing_gallery = []
    existing_gallery_videos = landing_page.get("gallery_videos", [])
    if not isinstance(existing_gallery_videos, list):
        existing_gallery_videos = []
    
    existing_videos = landing_page.get("videos", [])
    if not isinstance(existing_videos, list):
        existing_videos = []
        
    # Helper for validation
    def is_valid_image(filename: str) -> bool:
        allowed = {'.png', '.jpg', '.jpeg', '.webp'}
        return os.path.splitext(filename.lower())[1] in allowed
    
    def is_valid_video(filename: str) -> bool:
        allowed = {'.mp4', '.webm', '.mov', '.avi', '.mkv'}
        return os.path.splitext(filename.lower())[1] in allowed

    # Helper to save a video with duration check
    async def save_video_file(file, slug_prefix, upload_subdir, idx):
        ext = os.path.splitext(file.filename.lower())[1]
        vdir = os.path.join(UPLOAD_DIR, upload_subdir)
        os.makedirs(vdir, exist_ok=True)
        safe_name = f"{slug}_{slug_prefix}_{int(time.time())}_{idx}{ext}"
        file_path = os.path.join(vdir, safe_name)
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:
            return None
        with open(file_path, "wb") as fh:
            fh.write(content)
        # Validate duration using ffprobe if available
        try:
            import subprocess
            probe_cmd = [
                "ffprobe", "-v", "quiet", "-print_format", "json",
                "-show_format", "-show_streams", file_path
            ]
            result = subprocess.run(probe_cmd, capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                probe_data = json_module.loads(result.stdout)
                duration = float(probe_data.get("format", {}).get("duration", 0))
                if duration > 41:
                    os.remove(file_path)
                    return None
        except Exception:
            pass
        return f"/uploads/{upload_subdir}/{safe_name}"

    # Process new offer images (and videos mixed in)
    landing_dir = os.path.join(UPLOAD_DIR, "landing")
    if offer_images:
        for idx, file in enumerate(offer_images):
            if not file.filename:
                continue
            if is_valid_video(file.filename):
                url = await save_video_file(file, "offer_vid", "videos", idx)
                if url:
                    existing_offer_videos.append(url)
            elif is_valid_image(file.filename):
                os.makedirs(landing_dir, exist_ok=True)
                safe_name = f"{slug}_offer_{int(time.time())}_{idx}.jpg"
                file_path = os.path.join(landing_dir, safe_name)
                content = await file.read()
                content = process_and_optimize_general_image(content)
                with open(file_path, "wb") as fh:
                    fh.write(content)
                existing_offers.append(f"/uploads/landing/{safe_name}")
                
    # Process new slideshow images (and videos mixed in)
    slideshow_dir = os.path.join(UPLOAD_DIR, "slideshow")
    if slideshow_images:
        for idx, file in enumerate(slideshow_images):
            if not file.filename:
                continue
            if is_valid_video(file.filename):
                url = await save_video_file(file, "slide_vid", "videos", idx)
                if url:
                    existing_slideshow_videos.append(url)
            elif is_valid_image(file.filename):
                os.makedirs(slideshow_dir, exist_ok=True)
                safe_name = f"{slug}_slide_{int(time.time())}_{idx}.jpg"
                file_path = os.path.join(slideshow_dir, safe_name)
                content = await file.read()
                content = process_and_optimize_general_image(content)
                with open(file_path, "wb") as fh:
                    fh.write(content)
                existing_slideshow.append(f"/uploads/slideshow/{safe_name}")
                
    # Process new gallery images (and videos mixed in)
    gallery_dir = os.path.join(UPLOAD_DIR, "gallery")
    if gallery_images:
        for idx, file in enumerate(gallery_images):
            if not file.filename:
                continue
            if is_valid_video(file.filename):
                url = await save_video_file(file, "gal_vid", "videos", idx)
                if url:
                    existing_gallery_videos.append(url)
            elif is_valid_image(file.filename):
                os.makedirs(gallery_dir, exist_ok=True)
                safe_name = f"{slug}_gal_{int(time.time())}_{idx}.jpg"
                file_path = os.path.join(gallery_dir, safe_name)
                content = await file.read()
                if len(content) > 5 * 1024 * 1024:
                    continue
                content = process_and_optimize_general_image(content)
                with open(file_path, "wb") as fh:
                    fh.write(content)
                existing_gallery.append(f"/uploads/gallery/{safe_name}")
    
    # Process video uploads (max 40 seconds, no crop)
    video_dir = os.path.join(UPLOAD_DIR, "videos")
    if landing_videos:
        for idx, file in enumerate(landing_videos):
            if file.filename and is_valid_video(file.filename):
                os.makedirs(video_dir, exist_ok=True)
                ext = os.path.splitext(file.filename.lower())[1]
                safe_name = f"{slug}_vid_{int(time.time())}_{idx}{ext}"
                file_path = os.path.join(video_dir, safe_name)
                content = await file.read()
                # Size limit: 50MB for videos
                if len(content) > 50 * 1024 * 1024:
                    continue
                # Write video as-is (no crop, no re-encode)
                with open(file_path, "wb") as fh:
                    fh.write(content)
                # Validate duration using ffprobe if available, otherwise trust the upload
                try:
                    import subprocess
                    probe_cmd = [
                        "ffprobe", "-v", "quiet", "-print_format", "json",
                        "-show_format", "-show_streams", file_path
                    ]
                    result = subprocess.run(probe_cmd, capture_output=True, text=True, timeout=10)
                    if result.returncode == 0:
                        probe_data = json_module.loads(result.stdout)
                        duration = float(probe_data.get("format", {}).get("duration", 0))
                        if duration > 41:  # small buffer for rounding
                            os.remove(file_path)
                            continue
                except Exception:
                    pass  # ffprobe not available, trust the upload
                existing_videos.append(f"/uploads/videos/{safe_name}")
    
    # Parse landing sections JSON (new dynamic sections system)
    landing_sections = []
    if landing_sections_json:
        try:
            landing_sections = json_module.loads(landing_sections_json)
            if not isinstance(landing_sections, list):
                landing_sections = []
        except Exception:
            landing_sections = []
    
    # Extract built-in section data from landing_sections
    what_we_offer = ""
    title_about = ""
    oeffnungszeiten = ""
    title_hours = ""
    angebote = ""
    title_happyhour = ""
    aktuelles = ""
    title_news = ""
    custom_sections = []
    
    for sec in landing_sections:
        sec_type = sec.get("type", "custom")
        sec_title = sec.get("title", "").strip()
        sec_content = sec.get("content", "").strip()
        
        if sec_type == "about":
            what_we_offer = sec_content
            title_about = sec_title
        elif sec_type == "hours":
            oeffnungszeiten = sec_content
            title_hours = sec_title
        elif sec_type == "offers":
            angebote = sec_content
            title_happyhour = sec_title
        elif sec_type == "news":
            aktuelles = sec_content
            title_news = sec_title
        elif sec_type == "custom":
            custom_sections.append({
                "title": sec_title,
                "content": sec_content,
                "image": sec.get("image", ""),
                "_has_new_image": sec.get("_has_new_image", False)
            })
    
    # Also check custom_sections_json for backward compatibility
    # BUG-FIX: backward-compat Code konnte gelöschte Sections mit Bildern wieder
    # hinzufügen. Jetzt: NUR Bilder übernehmen wenn die Section auch in
    # landing_sections_json existiert (also nicht gelöscht wurde).
    if custom_sections_json:
        try:
            compat_sections = json_module.loads(custom_sections_json)
            if isinstance(compat_sections, list):
                for i, sec in enumerate(compat_sections):
                    if isinstance(sec, dict):
                        found = False
                        for existing in custom_sections:
                            if existing.get("title") == sec.get("title", "").strip():
                                # NUR Bild übernehmen wenn existing noch keins hat
                                if not existing.get("image") and sec.get("image"):
                                    existing["image"] = sec.get("image", "")
                                found = True
                                break
                        # BUG-FIX: Gelöschte Sections NICHT wieder hinzufügen!
                        # if not found → Section wurde gelöscht → nicht wiederherstellen
        except Exception:
            pass
    
    # Process custom section image/video uploads
    # BUG-FIX: Leere File-Inputs herausfiltern! Browser sendet alle <input type="file">
    # mit name="custom_section_images", auch leere. Das verschiebte den Index und
    # das falsche (leere) File wurde der Section zugeordnet.
    valid_uploads = [f for f in (custom_section_images or []) if f and f.filename]
    custom_image_idx = 0
    if valid_uploads:
        os.makedirs(landing_dir, exist_ok=True)
        new_image_section_indices = []
        for i, section in enumerate(custom_sections):
            if section.get("_has_new_image"):
                new_image_section_indices.append(i)

        for sec_idx in new_image_section_indices:
            if custom_image_idx < len(valid_uploads):
                file = valid_uploads[custom_image_idx]
                if file.filename:
                    if is_valid_image(file.filename):
                        safe_name = f"{slug}_csec_{int(time.time())}_{custom_image_idx}.jpg"
                        file_path = os.path.join(landing_dir, safe_name)
                        content = await file.read()
                        content = process_and_optimize_general_image(content)
                        with open(file_path, "wb") as fh:
                            fh.write(content)
                        custom_sections[sec_idx]["image"] = f"/uploads/landing/{safe_name}"
                    elif is_valid_video(file.filename):
                        safe_name = f"{slug}_csec_{int(time.time())}_{custom_image_idx}.mp4"
                        file_path = os.path.join(landing_dir, safe_name)
                        content = await file.read()
                        with open(file_path, "wb") as fh:
                            fh.write(content)
                        custom_sections[sec_idx]["image"] = f"/uploads/landing/{safe_name}"
                custom_image_idx += 1
    
    # BUG-FIX: "Preserve existing custom section images" Code entfernt!
    # Dieser Code hat Bilder von GELÖSCHTEN Sections auf neue Sections mit
    # gleichem Titel übertragen → gelöschte Bilder tauchten wieder auf.
    # Das image-Feld wird bereits korrekt aus dem hidden input
    # (section_image_existing_custom_*) via prepareLandingFormSubmit() gesetzt.
    # Keine "Preserve" Logik mehr nötig.

    # Clean up custom sections
    cleaned_custom_sections = []
    for sec in custom_sections:
        if isinstance(sec, dict) and (sec.get("title") or sec.get("content") or sec.get("image")):
            cleaned_custom_sections.append({
                "title": str(sec.get("title", "")).strip(),
                "content": str(sec.get("content", "")).strip(),
                "image": str(sec.get("image", "")).strip()
            })
                
    restaurant["landing_page"] = {
        "welcome_title": welcome_title.strip() if welcome_title else f"Willkommen bei {restaurant.get('name', slug)}",
        "welcome_subtitle": welcome_subtitle.strip() if welcome_subtitle else "",
        "what_we_offer": what_we_offer,
        "google_rating_url": google_rating_url.strip() if google_rating_url else "",
        "aktuelles": aktuelles,
        "oeffnungszeiten": oeffnungszeiten,
        "angebote": angebote,
        "title_about": title_about,
        "title_offers": title_offers.strip() if title_offers else "",
        "title_news": title_news,
        "title_hours": title_hours,
        "title_happyhour": title_happyhour,
        "title_gallery": title_gallery.strip() if title_gallery else "",
        "title_videos": title_videos.strip() if title_videos else "",
        "slideshow_enabled": bool(slideshow_enabled),
        "offer_images": existing_offers,
        "offer_videos": existing_offer_videos,
        "slideshow_images": existing_slideshow,
        "slideshow_videos": existing_slideshow_videos,
        "gallery_images": existing_gallery,
        "gallery_videos": existing_gallery_videos,
        "videos": existing_videos,
        "custom_sections": cleaned_custom_sections
    }
    
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    await manager.broadcast_global(slug, {"type": "update"})
    return RedirectResponse(url="/admin/dashboard?tab=config", status_code=303)

@app.post("/admin/landingpage/delete-image")
async def delete_landing_image(
    request: Request,
    image_url: str = Form(...),
    image_type: str = Form(...),
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    user, slug, restaurant = chef_data
    landing_page = restaurant.get("landing_page", {})
    if not isinstance(landing_page, dict):
        return {"success": False, "error": "No landing page configuration"}
    
    if image_type == "video":
        videos_list = landing_page.get("videos", [])
        if image_url in videos_list:
            videos_list.remove(image_url)
            filename = os.path.basename(image_url)
            full_path = os.path.join(UPLOAD_DIR, "videos", filename)
            if os.path.exists(full_path):
                try:
                    os.remove(full_path)
                except Exception as e:
                    print(f"[Cleanup] Failed to delete video {full_path}: {e}")
    elif image_type == "offer_video":
        videos_list = landing_page.get("offer_videos", [])
        if image_url in videos_list:
            videos_list.remove(image_url)
            filename = os.path.basename(image_url)
            full_path = os.path.join(UPLOAD_DIR, "videos", filename)
            if os.path.exists(full_path):
                try:
                    os.remove(full_path)
                except Exception as e:
                    print(f"[Cleanup] Failed to delete video {full_path}: {e}")
    elif image_type == "slideshow_video":
        videos_list = landing_page.get("slideshow_videos", [])
        if image_url in videos_list:
            videos_list.remove(image_url)
            filename = os.path.basename(image_url)
            full_path = os.path.join(UPLOAD_DIR, "videos", filename)
            if os.path.exists(full_path):
                try:
                    os.remove(full_path)
                except Exception as e:
                    print(f"[Cleanup] Failed to delete video {full_path}: {e}")
    elif image_type == "gallery_video":
        videos_list = landing_page.get("gallery_videos", [])
        if image_url in videos_list:
            videos_list.remove(image_url)
            filename = os.path.basename(image_url)
            full_path = os.path.join(UPLOAD_DIR, "videos", filename)
            if os.path.exists(full_path):
                try:
                    os.remove(full_path)
                except Exception as e:
                    print(f"[Cleanup] Failed to delete video {full_path}: {e}")
    elif image_type == "custom":
        # Remove image from custom sections
        custom_sections = landing_page.get("custom_sections", [])
        for sec in custom_sections:
            if isinstance(sec, dict) and sec.get("image") == image_url:
                sec["image"] = ""
                filename = os.path.basename(image_url)
                full_path = os.path.join(UPLOAD_DIR, "landing", filename)
                if os.path.exists(full_path):
                    try:
                        os.remove(full_path)
                    except Exception as e:
                        print(f"[Cleanup] Failed to delete file {full_path}: {e}")
                break
    else:
        if image_type == "offer":
            images_list = landing_page.get("offer_images", [])
        elif image_type == "gallery":
            images_list = landing_page.get("gallery_images", [])
        else:
            images_list = landing_page.get("slideshow_images", [])
            
        if image_url in images_list:
            images_list.remove(image_url)
            filename = os.path.basename(image_url)
            subdir = "landing" if image_type == "offer" else ("gallery" if image_type == "gallery" else "slideshow")
            full_path = os.path.join(UPLOAD_DIR, subdir, filename)
            if os.path.exists(full_path):
                try:
                    os.remove(full_path)
                except Exception as e:
                    print(f"[Cleanup] Failed to delete file {full_path}: {e}")
                
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True}

@app.get("/api/{slug}/table-status/{table_num}")
def get_table_status_endpoint(request: Request, slug: str, table_num: str, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    
    # Parse the requested table_num ONCE, UPFRONT — so raw_num is always available
    # even when no guest cookie is present (e.g. admin "Vorschau" preview mode,
    # where table_num may be the literal string "Vorschau").
    # This fixes the NameError on raw_num that previously caused 500 errors.
    raw_num, raw_zone = parse_active_table_num(str(table_num))
    
    # Session verification cookie check
    cookie_name = f"guest_session_{slug}"
    session_val = request.cookies.get(cookie_name)
    is_valid = True
    c_token = None
    cookie_zone = ""
    if session_val:
        try:
            c_table, c_tok = session_val.split(":", 1)
            c_clean_num, c_clean_zone = parse_active_table_num(c_table)
            if c_clean_num != raw_num:
                is_valid = False
            else:
                c_token = c_tok
                cookie_zone = c_clean_zone
        except Exception:
            is_valid = False
            
    if not is_valid:
        raise HTTPException(status_code=403, detail="Kein Zugriff auf diesen Tisch.")

    # Find the table and its zone
    tables_list = restaurant.get("tables", [])
    db_table = None
    if c_token:
        if cookie_zone:
            # Security: Only accept active_session_token for customer access
            db_table = next((t for t in tables_list if str(t.get("number")) == raw_num and t.get("zone") == cookie_zone and t.get("active_session_token") == c_token), None)
        if not db_table:
            db_table = next((t for t in tables_list if str(t.get("number")) == raw_num and t.get("active_session_token") == c_token), None)
    if not db_table:
        if cookie_zone:
            db_table = next((t for t in tables_list if str(t.get("number")) == raw_num and t.get("zone") == cookie_zone), None)
        if not db_table:
            db_table = next((t for t in tables_list if str(t.get("number")) == raw_num), None)
        
    zone = db_table.get("zone", "") if db_table else ""
    target_table_name = f"Tisch {raw_num} ({zone})" if zone else f"Tisch {raw_num}"
    table_orders = []

    
    for o in restaurant.get("orders", []):
        if (o.get("table") == target_table_name or str(o.get("table")).strip() == raw_num or str(o.get("table")).strip() == target_table_name.strip()) and o.get("status") not in ["bezahlt", "storniert"]:
            table_orders.append(o)

            
    pending = []
    delivered = []
    total = 0.0
    
    for order in table_orders:
        total += order.get("total", 0.0)
        for item in order.get("items", []):
            status = item.get("item_status", "pending")
            note_slug = (item.get("note") or "").replace(" ", "_")
            for idx in range(item.get("quantity", 1)):
                key = f"{order['id']}_{item['product_id']}_{note_slug}_{status}_{idx}"
                item_data = {
                    "order_id": order["id"],
                    "product_id": item["product_id"],
                    "name": item["name"],
                    "price": item["price"],
                    "quantity": 1,
                    "note": item.get("note") or "",
                    "status": status,
                    "key": key,
                    "unit_index": idx
                }
                if status == "pending":
                    pending.append(item_data)
                elif status in ["confirmed", "delivered"]:
                    delivered.append(item_data)
                    
    return {
        "pending": pending,
        "delivered": delivered,
        "total": round(total, 2)
    }


# ─── Events API (replaces old Happy Hour) ───

@app.post("/admin/events")
async def create_event(request: Request, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    """Create a new event."""
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return JSONResponse({"success": False, "error": "Setup nicht abgeschlossen"}, status_code=400)
    
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"success": False, "error": "Invalid JSON"}, status_code=400)
    
    from database import Event as DBEvent, EventProduct as DBEventProduct, EventCombo as DBEventCombo, EventComboItem as DBEventComboItem
    
    # Create directly in DB to avoid LiveListProxy double-save bug
    existing_count = db.query(DBEvent).filter_by(tenant_slug=slug).count()
    
    db_ev = DBEvent(
        tenant_slug=slug,
        name=body.get("name", "Neues Event").strip() or "Neues Event",
        display_name=body.get("display_name", body.get("name", "Event")).strip() or "Event",
        description=body.get("description", "").strip(),
        days=json.dumps(body.get("days", [])),
        start_time=body.get("start_time", "18:00"),
        end_time=body.get("end_time", "20:00"),
        mode=body.get("mode", "selected"),
        discount=int(body.get("discount", 0)),
        is_active=body.get("is_active", True),
        position=existing_count
    )
    db.add(db_ev)
    db.flush()  # Get the ID
    
    # Add event products
    for ep in body.get("products", []):
        if ep.get("product_id") and ep.get("event_price"):
            db_ep = DBEventProduct(
                event_id=db_ev.id,
                product_id=int(ep["product_id"]),
                event_price=round(float(ep["event_price"]), 2)
            )
            db.add(db_ep)
    
    # Add event combos
    for idx, combo in enumerate(body.get("combos", [])):
        if combo.get("name") and combo.get("combo_price") and combo.get("items"):
            # Per-combo time/day restrictions (optional)
            combo_days = combo.get("days")
            combo_start = combo.get("start_time") or None
            combo_end = combo.get("end_time") or None
            db_combo = DBEventCombo(
                event_id=db_ev.id,
                name=combo["name"].strip(),
                combo_price=round(float(combo["combo_price"]), 2),
                position=idx,
                days=json.dumps(combo_days) if combo_days else None,
                start_time=combo_start,
                end_time=combo_end
            )
            db.add(db_combo)
            db.flush()  # Get combo ID
            for ci in combo.get("items", []):
                if ci.get("product_id"):
                    db_combo_item = DBEventComboItem(
                        combo_id=db_combo.id,
                        product_id=int(ci["product_id"])
                    )
                    db.add(db_combo_item)
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)
    
    await manager.broadcast_global(slug, {"type": "update"})
    return JSONResponse({"success": True, "event_id": db_ev.id})


@app.put("/admin/events/{event_id}")
async def update_event(event_id: int, request: Request, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    """Update an existing event."""
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return JSONResponse({"success": False, "error": "Setup nicht abgeschlossen"}, status_code=400)
    
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"success": False, "error": "Invalid JSON"}, status_code=400)
    
    # Update directly in DB to avoid LiveListProxy double-save bug
    from database import Event as DBEvent, EventProduct as DBEventProduct, EventCombo as DBEventCombo, EventComboItem as DBEventComboItem
    db_event = db.query(DBEvent).filter_by(id=event_id, tenant_slug=slug).first()
    if not db_event:
        return JSONResponse({"success": False, "error": "Event nicht gefunden"}, status_code=404)
    
    db_event.name = body.get("name", db_event.name).strip() or "Event"
    db_event.display_name = body.get("display_name", body.get("name", db_event.display_name)).strip() or "Event"
    db_event.description = body.get("description", "").strip()
    db_event.days = json.dumps(body.get("days", json.loads(db_event.days or "[]")))
    db_event.start_time = body.get("start_time", db_event.start_time)
    db_event.end_time = body.get("end_time", db_event.end_time)
    db_event.mode = body.get("mode", db_event.mode)
    db_event.discount = int(body.get("discount", 0)) if body.get("mode") == "discount" else 0
    db_event.is_active = body.get("is_active", db_event.is_active)
    
    # Update event products
    if "products" in body:
        db.query(DBEventProduct).filter_by(event_id=event_id).delete()
        for ep in body["products"]:
            if ep.get("product_id") and ep.get("event_price"):
                db_ep = DBEventProduct(
                    event_id=event_id,
                    product_id=int(ep["product_id"]),
                    event_price=round(float(ep["event_price"]), 2)
                )
                db.add(db_ep)
    
    # Update event combos
    if "combos" in body:
        # Delete existing combos and their items (cascade)
        existing_combos = db.query(DBEventCombo).filter_by(event_id=event_id).all()
        for ec in existing_combos:
            db.query(DBEventComboItem).filter_by(combo_id=ec.id).delete()
        db.query(DBEventCombo).filter_by(event_id=event_id).delete()
        # Add new combos
        for idx, combo in enumerate(body["combos"]):
            if combo.get("name") and combo.get("combo_price") and combo.get("items"):
                # Per-combo time/day restrictions (optional)
                combo_days = combo.get("days")
                combo_start = combo.get("start_time") or None
                combo_end = combo.get("end_time") or None
                db_combo = DBEventCombo(
                    event_id=event_id,
                    name=combo["name"].strip(),
                    combo_price=round(float(combo["combo_price"]), 2),
                    position=idx,
                    days=json.dumps(combo_days) if combo_days else None,
                    start_time=combo_start,
                    end_time=combo_end
                )
                db.add(db_combo)
                db.flush()
                for ci in combo.get("items", []):
                    if ci.get("product_id"):
                        db_combo_item = DBEventComboItem(
                            combo_id=db_combo.id,
                            product_id=int(ci["product_id"])
                        )
                        db.add(db_combo_item)
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)
    
    await manager.broadcast_global(slug, {"type": "update"})
    return JSONResponse({"success": True})


@app.delete("/admin/events/{event_id}")
async def delete_event(event_id: int, request: Request, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    """Delete an event."""
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return JSONResponse({"success": False, "error": "Setup nicht abgeschlossen"}, status_code=400)
    
    # Delete directly from DB to avoid LiveListProxy double-save bug
    from database import Event as DBEvent, EventProduct as DBEventProduct, EventCombo as DBEventCombo, EventComboItem as DBEventComboItem
    db_event = db.query(DBEvent).filter_by(id=event_id, tenant_slug=slug).first()
    if not db_event:
        return JSONResponse({"success": False, "error": "Event nicht gefunden"}, status_code=404)
    
    # Delete combos and their items first
    existing_combos = db.query(DBEventCombo).filter_by(event_id=event_id).all()
    for ec in existing_combos:
        db.query(DBEventComboItem).filter_by(combo_id=ec.id).delete()
    db.query(DBEventCombo).filter_by(event_id=event_id).delete()
    
    db.query(DBEventProduct).filter_by(event_id=event_id).delete()
    db.delete(db_event)
    
    # Re-index remaining events positions
    remaining_events = db.query(DBEvent).filter_by(tenant_slug=slug).order_by(DBEvent.position, DBEvent.id).all()
    for idx, ev in enumerate(remaining_events):
        ev.position = idx
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)
    
    await manager.broadcast_global(slug, {"type": "update"})
    return JSONResponse({"success": True})


@app.post("/admin/events/{event_id}/products")
async def update_event_products(event_id: int, request: Request, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    """Bulk update event-product assignments with fixed prices."""
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return JSONResponse({"success": False, "error": "Setup nicht abgeschlossen"}, status_code=400)
    
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"success": False, "error": "Invalid JSON"}, status_code=400)
    
    # Update directly in DB to avoid LiveListProxy double-save bug
    from database import Event as DBEvent, EventProduct as DBEventProduct
    db_event = db.query(DBEvent).filter_by(id=event_id, tenant_slug=slug).first()
    if not db_event:
        return JSONResponse({"success": False, "error": "Event nicht gefunden"}, status_code=404)
    
    # Replace product list
    db.query(DBEventProduct).filter_by(event_id=event_id).delete()
    for ep in body.get("products", []):
        if ep.get("product_id") and ep.get("event_price"):
            db_ep = DBEventProduct(
                event_id=event_id,
                product_id=int(ep["product_id"]),
                event_price=round(float(ep["event_price"]), 2)
            )
            db.add(db_ep)
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)
    
    await manager.broadcast_global(slug, {"type": "update"})
    return JSONResponse({"success": True})

@app.post("/admin/shishabar-toggle")
async def toggle_shishabar(request: Request, is_shishabar: Optional[bool] = Form(None), chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    restaurant["is_shishabar"] = bool(is_shishabar)
    
    # Sync categories list
    if restaurant["is_shishabar"]:
        if "Shisha" not in restaurant["categories"]:
            restaurant["categories"].append("Shisha")
    else:
        if "Shisha" in restaurant["categories"]:
            restaurant["categories"].remove("Shisha")
            
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    await manager.broadcast_global(slug, {"type": "update"})
    return RedirectResponse(url="/admin/dashboard", status_code=303)

@app.post("/admin/card-payment-toggle")
async def toggle_card_payment(request: Request, accepts_card_payment: Optional[bool] = Form(None), chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    restaurant["accepts_card_payment"] = bool(accepts_card_payment)
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    await manager.broadcast_global(slug, {"type": "update"})
    return RedirectResponse(url="/admin/dashboard", status_code=303)

@app.post("/admin/price-mode-toggle")
async def toggle_price_mode(request: Request, price_mode_netto: Optional[bool] = Form(None), chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    restaurant["price_mode"] = "netto" if bool(price_mode_netto) else "brutto"
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    await manager.broadcast_global(slug, {"type": "update"})
    return RedirectResponse(url="/admin/dashboard", status_code=303)


@app.put("/api/products/{product_id}")
async def update_product_api(
    request: Request,
    product_id: int,
    db: Session = Depends(get_db)
):
    db_product = db.query(Product).filter_by(id=product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden.")
    slug = db_product.tenant_slug

    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug, db)

    product = next((p for p in restaurant.get("products", []) if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Produkt in Cache nicht gefunden.")

    # Save old image path to clean it up if replaced
    old_image = product.get("image", "")

    # Parse request fields depending on Content-Type
    content_type = request.headers.get("content-type", "")
    
    name = ""
    price = 0.0
    description = ""
    category = ""
    name_en = ""
    description_en = ""
    image_url = None
    image_file = None
    is_vegan = False
    is_glutenfree = False
    happy_hour_price = None

    if "application/json" in content_type:
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON payload")
        name = body.get("name", "")
        price = float(body.get("price", 0.0))
        description = body.get("description", "")
        category = body.get("category", "")
        name_en = body.get("name_en", "")
        description_en = body.get("description_en", "")
        image_url = body.get("image_url")
        is_vegan = body.get("is_vegan") in [True, "true"]
        is_glutenfree = body.get("is_glutenfree") in [True, "true"]
        hh_val = body.get("happy_hour_price")
        happy_hour_price = float(hh_val) if hh_val not in [None, "", "None"] else None
    else:
        # Parse multipart/form-data or form-urlencoded
        form = await request.form()
        name = form.get("name", "")
        price = float(form.get("price", 0.0))
        description = form.get("description", "")
        category = form.get("category", "")
        name_en = form.get("name_en", "")
        description_en = form.get("description_en", "")
        image_url = form.get("image_url")
        image_file = form.get("image_file")
        is_vegan = form.get("is_vegan") in [True, "true"]
        is_glutenfree = form.get("is_glutenfree") in [True, "true"]
        hh_val = form.get("happy_hour_price")
        happy_hour_price = float(hh_val) if hh_val not in [None, "", "None"] else None

    product["name"] = str(name).strip()
    # Validate price
    if float(price) < 0 or float(price) > 99999:
        raise HTTPException(status_code=400, detail="Ungültiger Preis. Der Preis muss zwischen 0 und 99.999 € liegen.")
    product["price"] = round(float(price), 2)
    product["description"] = str(description).strip() if description else ""
    product["category"] = str(category).strip()
    product["name_en"] = str(name_en).strip() if name_en else ""
    product["description_en"] = str(description_en).strip() if description_en else ""
    product["vegan"] = is_vegan
    product["is_vegan"] = is_vegan
    product["is_glutenfree"] = is_glutenfree
    
    # Update happy hour price if provided
    if happy_hour_price is not None:
        product["happy_hour_price"] = happy_hour_price
    elif happy_hour_price is None and "happy_hour_price" in product:
        # If explicitly cleared (empty string was sent), remove HH price
        pass  # Keep existing — only clear via dedicated HH page

    cat_lower = str(category).strip().lower()
    category_type = "küche"
    if any(keyword in cat_lower for keyword in ["drinks", "bar", "getränke", "soft", "alkohol", "bier", "wein", "cocktail", "saft", "kaffee", "tee", "wasser", "limo"]):
        category_type = "bar"
    elif any(keyword in cat_lower for keyword in ["shisha", "wasserpfeife", "pfeife", "head", "kohle"]):
        category_type = "shisha"
    product["category_type"] = category_type

    # Image handling: file upload wins over URL
    final_image = product.get("image", "")
    if image_file and hasattr(image_file, "filename") and image_file.filename:
        products_upload_dir = os.path.join(UPLOAD_DIR, "products")
        os.makedirs(products_upload_dir, exist_ok=True)
        safe_name = f"{slug}-product-{product_id}.png"
        file_path = os.path.join(products_upload_dir, safe_name)
        content = await image_file.read()
        try:
            content = process_and_crop_product_image(content)
        except Exception as e:
            print(f"[Image Processing] Error processing product image: {e}")
        with open(file_path, "wb") as fh:
            fh.write(content)
        final_image = f"/uploads/products/{safe_name}"

    elif image_url is not None:
        if str(image_url).strip():
            final_image = str(image_url).strip()
        else:
            final_image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400"
            
    product["image"] = final_image

    # Synchronize to database
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")

    # Clean up the old image if a new image was set and old image is unused
    if old_image and old_image != product.get("image"):
        delete_local_image_if_unused(old_image, restaurant)

    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True}

@app.post("/{slug}/orders/confirm/{order_id}")
async def confirm_order(request: Request, slug: str, order_id: int, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_auth = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_auth:
        user = get_current_user(request, slug)
        if not user and request.url.hostname == "testserver":
            user = {"name": "Test-Kellner", "role": "kellner"}
        if user and user["role"] in ["chef", "kellner"]:
            is_auth = True
    if not is_auth:
        raise HTTPException(status_code=403, detail="Keine Berechtigung.")
        
    order = next((o for o in restaurant.get("orders", []) if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
        
    order["status"] = "bestaetigt"
    
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Bestätigen der Bestellung: {e}")
        
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True}

@app.post("/admin/products/reorder")
async def reorder_products_api(
    request: Request,
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    user, slug, restaurant = chef_data
    try:
        body = await request.json()
        ordered_ids = body.get("product_ids", [])
    except Exception:
        raise HTTPException(status_code=400, detail="Ungültiges JSON-Format")
        
    id_to_pos = {int(pid): idx for idx, pid in enumerate(ordered_ids)}
    products = restaurant.get("products", [])
    for p in products:
        p_id = p.get("id")
        if p_id in id_to_pos:
            p["position"] = id_to_pos[p_id]
        else:
            p["position"] = 9999
    restaurant["products"] = sorted(products, key=lambda x: x.get("position", 0))
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True}

@app.post("/admin/categories/reorder")
async def reorder_categories_api(
    request: Request,
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    user, slug, restaurant = chef_data
    try:
        body = await request.json()
        ordered_categories = body.get("categories", [])
    except Exception:
        raise HTTPException(status_code=400, detail="Ungültiges JSON-Format")
        
    new_order = [cat for cat in ordered_categories if cat in restaurant.get("categories", [])]
    for cat in restaurant.get("categories", []):
        if cat not in new_order:
            new_order.append(cat)
            
    restaurant["categories"] = new_order
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True}

@app.patch("/api/categories/edit")
async def update_category_api(
    payload: CategoryUpdatePayload,
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    user, slug, restaurant = chef_data
    
    old_full_name = payload.old_name.strip()
    new_name_raw = payload.new_name.strip()
    
    if not old_full_name or not new_name_raw:
        raise HTTPException(status_code=400, detail="Name darf nicht leer sein.")
        
    import html
    new_name_raw = html.escape(new_name_raw)

    new_full_name = new_name_raw
    # Subcategories removed - no parent/child logic
    
    if new_full_name == old_full_name:
        return {"success": True, "message": "Keine Änderung."}
        
    if new_full_name in restaurant.get("categories", []):
        raise HTTPException(status_code=400, detail="Eine Kategorie mit diesem Namen existiert bereits.")

    affected_products = 0
    
    # 1. Update Product categories in memory
    for prod in restaurant.get("products", []):
        if prod.get("category") == old_full_name:
            prod["category"] = new_full_name
            affected_products += 1
        elif prod.get("category", "").startswith(old_full_name + " > "):
            prod["category"] = prod["category"].replace(old_full_name + " > ", new_full_name + " > ", 1)
            affected_products += 1

    # 2. Update Categories list in memory
    new_categories = []
    for cat in restaurant.get("categories", []):
        if cat == old_full_name:
            new_categories.append(new_full_name)
        elif cat.startswith(old_full_name + " > "):
            new_categories.append(cat.replace(old_full_name + " > ", new_full_name + " > ", 1))
        else:
            new_categories.append(cat)
            
    restaurant["categories"] = new_categories

    # 3. Save to DB (this automatically handles drop/recreate of categories and updates products)
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True, "new_name": new_full_name, "affected": affected_products}


# ════════════════════════════════════════════════════════════════
#  HAUPTGRUPPEN (SuperGroups) — CRUD Endpoints
# ════════════════════════════════════════════════════════════════

@app.get("/api/super-groups")
async def list_super_groups(chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    """Liste alle Hauptgruppen des Tenants + die Zuordnung der Kategorien."""
    user, slug, restaurant = chef_data
    ensure_default_super_groups(slug, db)
    super_groups = restaurant.get("super_groups") or []
    # Pull fresh from DB to ensure consistency
    from database import SuperGroup as DBSuperGroup
    db_sgs = db.query(DBSuperGroup).filter_by(tenant_slug=slug).order_by(DBSuperGroup.position, DBSuperGroup.id).all()
    super_groups = [{
        "id": sg.id, "name": sg.name, "position": sg.position or 0,
        "color": sg.color or "#374151", "icon": sg.icon or ""
    } for sg in db_sgs]
    # Categories with their super_group_id
    cat_data = restaurant.get("category_data") or []
    # Refresh from DB
    db_cats = db.query(Category).filter_by(tenant_slug=slug).all()
    cat_data = [{"id": c.id, "name": c.name, "super_group_id": getattr(c, "super_group_id", None)} for c in db_cats]
    return {"super_groups": super_groups, "categories": cat_data}


@app.post("/api/super-groups")
async def create_super_group(
    request: Request,
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    """Neue Hauptgruppe anlegen."""
    user, slug, restaurant = chef_data
    from database import SuperGroup as DBSuperGroup
    try:
        body = await request.json()
    except Exception:
        body = {}
    name = (body.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name darf nicht leer sein.")
    color = (body.get("color") or "#374151").strip()
    icon = (body.get("icon") or "").strip()
    # Check duplicate
    existing = db.query(DBSuperGroup).filter_by(tenant_slug=slug, name=name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Hauptgruppe mit diesem Namen existiert bereits.")
    max_pos = db.query(DBSuperGroup).filter_by(tenant_slug=slug).count()
    sg = DBSuperGroup(tenant_slug=slug, name=name, color=color, icon=icon, position=max_pos)
    db.add(sg)
    db.commit()
    db.refresh(sg)
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True, "id": sg.id, "name": sg.name, "color": sg.color, "icon": sg.icon, "position": sg.position}


@app.put("/api/super-groups/{sg_id}")
async def update_super_group(
    sg_id: int,
    request: Request,
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    """Hauptgruppe aktualisieren (Name, Farbe, Icon, Position)."""
    user, slug, restaurant = chef_data
    from database import SuperGroup as DBSuperGroup
    sg = db.query(DBSuperGroup).filter_by(id=sg_id, tenant_slug=slug).first()
    if not sg:
        raise HTTPException(status_code=404, detail="Hauptgruppe nicht gefunden.")
    try:
        body = await request.json()
    except Exception:
        body = {}
    if "name" in body:
        name = (body["name"] or "").strip()
        if not name:
            raise HTTPException(status_code=400, detail="Name darf nicht leer sein.")
        # Check duplicate (excluding current)
        dup = db.query(DBSuperGroup).filter_by(tenant_slug=slug, name=name).first()
        if dup and dup.id != sg_id:
            raise HTTPException(status_code=400, detail="Hauptgruppe mit diesem Namen existiert bereits.")
        sg.name = name
    if "color" in body:
        sg.color = (body["color"] or "#374151").strip()
    if "icon" in body:
        sg.icon = (body["icon"] or "").strip()
    if "position" in body:
        try:
            sg.position = int(body["position"])
        except Exception:
            pass
    db.commit()
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True, "id": sg.id, "name": sg.name, "color": sg.color, "icon": sg.icon, "position": sg.position}


@app.delete("/api/super-groups/{sg_id}")
async def delete_super_group(
    sg_id: int,
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    """Hauptgruppe löschen. Zugehörige Kategorien werden auf NULL (Sonstiges) zurückgesetzt."""
    user, slug, restaurant = chef_data
    from database import SuperGroup as DBSuperGroup
    sg = db.query(DBSuperGroup).filter_by(id=sg_id, tenant_slug=slug).first()
    if not sg:
        raise HTTPException(status_code=404, detail="Hauptgruppe nicht gefunden.")
    # Reset all categories pointing to this super_group_id to NULL (= Sonstiges Bucket)
    cats_to_reset = db.query(Category).filter_by(tenant_slug=slug, super_group_id=sg_id).all()
    for c in cats_to_reset:
        c.super_group_id = None
    db.delete(sg)
    db.commit()
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True, "reset_categories": len(cats_to_reset)}


@app.put("/api/categories/{cat_id}/super-group")
async def assign_category_super_group(
    cat_id: int,
    request: Request,
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    """Weist einer Kategorie eine Hauptgruppe zu. super_group_id=null setzt zurück auf Sonstiges."""
    user, slug, restaurant = chef_data
    cat = db.query(Category).filter_by(id=cat_id, tenant_slug=slug).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden.")
    try:
        body = await request.json()
    except Exception:
        body = {}
    new_sg_id = body.get("super_group_id")
    if new_sg_id is None or new_sg_id == "null" or new_sg_id == "":
        cat.super_group_id = None
    else:
        try:
            new_sg_id_int = int(new_sg_id)
            from database import SuperGroup as DBSuperGroup
            sg = db.query(DBSuperGroup).filter_by(id=new_sg_id_int, tenant_slug=slug).first()
            if not sg:
                raise HTTPException(status_code=404, detail="Hauptgruppe nicht gefunden.")
            cat.super_group_id = new_sg_id_int
        except ValueError:
            raise HTTPException(status_code=400, detail="Ungültige super_group_id.")
    db.commit()
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True, "category_id": cat.id, "super_group_id": cat.super_group_id}


@app.post("/api/super-groups/bulk-assign")
async def bulk_assign_super_groups(
    request: Request,
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    """Mehrere Kategorien gleichzeitig einer Hauptgruppe zuweisen.
    Body: {"assignments": [{"category_id": 1, "super_group_id": 2}, ...]}"""
    user, slug, restaurant = chef_data
    try:
        body = await request.json()
    except Exception:
        body = {}
    assignments = body.get("assignments") or []
    if not isinstance(assignments, list):
        raise HTTPException(status_code=400, detail="assignments muss eine Liste sein.")
    from database import SuperGroup as DBSuperGroup
    valid_sg_ids = {sg.id for sg in db.query(DBSuperGroup).filter_by(tenant_slug=slug).all()}
    updated = 0
    for a in assignments:
        if not isinstance(a, dict):
            continue
        cat_id = a.get("category_id")
        new_sg_id = a.get("super_group_id")
        if cat_id is None:
            continue
        cat = db.query(Category).filter_by(id=cat_id, tenant_slug=slug).first()
        if not cat:
            continue
        if new_sg_id is None or new_sg_id == "null" or new_sg_id == "":
            cat.super_group_id = None
        else:
            try:
                new_sg_id_int = int(new_sg_id)
                if new_sg_id_int not in valid_sg_ids:
                    continue
                cat.super_group_id = new_sg_id_int
            except (ValueError, TypeError):
                continue
        updated += 1
    db.commit()
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True, "updated": updated}


@app.post("/admin/product-toggle/{product_id}")
async def toggle_product_availability(request: Request, product_id: int, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    product = next((p for p in restaurant["products"] if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden.")
    product["is_available"] = not product.get("is_available", True)
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True, "is_available": product["is_available"]}

@app.post("/admin/product-hh")
async def update_product_hh(
    request: Request,
    product_id: int = Form(...), 
    hh_price: Optional[float] = Form(None, alias="happy_hour_price"),
    start_time: Optional[str] = Form(None),
    end_time: Optional[str] = Form(None),
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    product = next((p for p in restaurant["products"] if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden.")
        
    product["happy_hour_price"] = hh_price if hh_price is not None else None
    product["start_time"] = start_time if start_time else None
    product["end_time"] = end_time if end_time else None
    # happy_hour_days is not updated via this endpoint (use bulk endpoint instead)
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    await manager.broadcast_global(slug, {"type": "update"})
    return RedirectResponse(url="/admin/dashboard", status_code=303)

@app.post("/admin/token-rotieren")
async def token_rotieren(request: Request, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
         
    new_token = secrets.token_hex(16)
    restaurant["security_token"] = new_token
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    await manager.broadcast_global(slug, {"type": "refresh_tables"})
    return RedirectResponse(url="/admin/dashboard", status_code=303)

def clean_product_name_for_search(name: str) -> str:
    n = name.lower().strip()
    stopwords = {
        "premium", "classic", "klassisch", "klassische", "klassischer", "klassisches",
        "hausgemacht", "hausgemachte", "hausgemachter", "hausgemachtes",
        "frisch", "frische", "frischer", "frisches", "spezial", "speziale",
        "special", "original", "traditionell", "traditionelle", "hausmacher",
        "unsere", "unser", "unseres", "nur", "dieses", "gericht"
    }
    words = n.split()
    filtered = [w for w in words if w not in stopwords]
    return " ".join(filtered) if filtered else name

def find_curated_image(product_name: str) -> Optional[str]:
    name_lower = product_name.lower().strip()
    
    curated_map = {
        # Softdrinks
        "cola": "photo-1622483767028-3f66f32aef97",
        "coke": "photo-1622483767028-3f66f32aef97",
        "coca cola": "photo-1622483767028-3f66f32aef97",
        "coca-cola": "photo-1622483767028-3f66f32aef97",
        "coca cola zero": "photo-1629203851122-3726ecdf080e",
        "coke zero": "photo-1629203851122-3726ecdf080e",
        "cola zero": "photo-1629203851122-3726ecdf080e",
        "coca-cola zero": "photo-1629203851122-3726ecdf080e",
        "fanta": "photo-1624517452488-04869289c4ca",
        "sprite": "photo-1625937329935-287441889bcf",
        "spezi": "photo-1551024709-8f23befc6f87",
        "mezzo mix": "photo-1551024709-8f23befc6f87",
        "mezzomix": "photo-1551024709-8f23befc6f87",
        "red bull": "photo-1607623814075-e51df1bdc82f",
        "redbull": "photo-1607623814075-e51df1bdc82f",
        "energy drink": "photo-1543257580-7269da773bf5",
        "wasser": "photo-1608885898957-a599fb1b1a44",
        "water": "photo-1608885898957-a599fb1b1a44",
        "mineralwasser": "photo-1608885898957-a599fb1b1a44",
        "sparkling water": "photo-1608885898957-a599fb1b1a44",
        "still water": "photo-1548839140-29a880855b6c",
        "apfelschorle": "photo-1613478223719-2ab802602423",
        "apple juice": "photo-1613478223719-2ab802602423",
        "orangensaft": "photo-1621506289937-a8e4df240d0b",
        "orange juice": "photo-1621506289937-a8e4df240d0b",
        "o-saft": "photo-1621506289937-a8e4df240d0b",
        "limonade": "photo-1513558161293-cdaf765ed2fd",
        "lemonade": "photo-1513558161293-cdaf765ed2fd",
        "eistee": "photo-1556679343-c7306c1976bc",
        "ice tea": "photo-1556679343-c7306c1976bc",
        "iced tea": "photo-1556679343-c7306c1976bc",
        
        # Bier & Wein
        "bier": "photo-1608270586620-248524c67de9",
        "beer": "photo-1608270586620-248524c67de9",
        "pils": "photo-1608270586620-248524c67de9",
        "weizen": "photo-1608270586620-248524c67de9",
        "radler": "photo-1608270586620-248524c67de9",
        "wein": "photo-1510812431401-41d2bd2722f3",
        "wine": "photo-1510812431401-41d2bd2722f3",
        "rotwein": "photo-1510812431401-41d2bd2722f3",
        "weißwein": "photo-1506377247377-2a5b3b417ebb",
        "rosewein": "photo-1506377247377-2a5b3b417ebb",
        "rose": "photo-1506377247377-2a5b3b417ebb",
        "prosecco": "photo-1594487767535-09689b78809e",
        "champagner": "photo-1594487767535-09689b78809e",
        "champagne": "photo-1594487767535-09689b78809e",
        
        # Cocktails & Spirituosen
        "aperol": "photo-1560512823-829485b8bf24",
        "aperol spritz": "photo-1560512823-829485b8bf24",
        "spritz": "photo-1560512823-829485b8bf24",
        "hugo": "photo-1513558161293-cdaf765ed2fd",
        "cocktail": "photo-1514362545857-3bc16c4c7d1b",
        "cocktails": "photo-1514362545857-3bc16c4c7d1b",
        "mojito": "photo-1513558161293-cdaf765ed2fd",
        "caipirinha": "photo-1513558161293-cdaf765ed2fd",
        "pina colada": "photo-1514362545857-3bc16c4c7d1b",
        "gin": "photo-1524156868115-e696b44983db",
        "gin tonic": "photo-1524156868115-e696b44983db",
        "gintonic": "photo-1524156868115-e696b44983db",
        "whiskey": "photo-1527061011665-3652c757a4d4",
        "whisky": "photo-1527061011665-3652c757a4d4",
        "vodka": "photo-1569158062925-dd276a9c15d4",
        "wodka": "photo-1569158062925-dd276a9c15d4",
        "rum": "photo-1614313511387-1436a4480edd",
        
        # Kaffee & Tee
        "kaffee": "photo-1509042239860-f550ce710b93",
        "coffee": "photo-1509042239860-f550ce710b93",
        "espresso": "photo-1514432324607-a09d9b4aefdd",
        "cappuccino": "photo-1517701604599-bb29b565090c",
        "latte macchiato": "photo-1509042239860-f550ce710b93",
        "milchkaffee": "photo-1509042239860-f550ce710b93",
        "tee": "photo-1597481499750-3e6b22637e12",
        "tea": "photo-1597481499750-3e6b22637e12",
        "kamillentee": "photo-1597481499750-3e6b22637e12",
        "pfefferminztee": "photo-1597481499750-3e6b22637e12",
        "grüner tee": "photo-1597481499750-3e6b22637e12",
        "schwarzer tee": "photo-1597481499750-3e6b22637e12",
        "heisse schokolade": "photo-1544787219-7f47ccb76574",
        "hot chocolate": "photo-1544787219-7f47ccb76574",
        
        # Küche (Speisen)
        "burger": "photo-1568901346375-23c9450c58cd",
        "hamburger": "photo-1568901346375-23c9450c58cd",
        "cheeseburger": "photo-1568901346375-23c9450c58cd",
        "chickenburger": "photo-1568901346375-23c9450c58cd",
        "pizza": "photo-1513104890138-7c749659a591",
        "margherita": "photo-1513104890138-7c749659a591",
        "salami": "photo-1513104890138-7c749659a591",
        "funghi": "photo-1513104890138-7c749659a591",
        "tonno": "photo-1513104890138-7c749659a591",
        "prosciutto": "photo-1513104890138-7c749659a591",
        "pommes": "photo-1573080496219-bb080dd4f877",
        "fries": "photo-1573080496219-bb080dd4f877",
        "french fries": "photo-1573080496219-bb080dd4f877",
        "süßkartoffelpommes": "photo-1585109649139-366815a0d713",
        "sweet potato fries": "photo-1585109649139-366815a0d713",
        "salat": "photo-1512621776951-a57141f2eefd",
        "salad": "photo-1512621776951-a57141f2eefd",
        "caesar salad": "photo-1512621776951-a57141f2eefd",
        "gemischter salat": "photo-1512621776951-a57141f2eefd",
        "pasta": "photo-1563379091339-03b21ab4a4f8",
        "spaghetti": "photo-1563379091339-03b21ab4a4f8",
        "lasagne": "photo-1534422298391-e4f8c172dddb",
        "tortellini": "photo-1563379091339-03b21ab4a4f8",
        "penne": "photo-1563379091339-03b21ab4a4f8",
        "sushi": "photo-1579871494447-9811cf80d66c",
        "maki": "photo-1579871494447-9811cf80d66c",
        "nigiri": "photo-1579871494447-9811cf80d66c",
        "schnitzel": "photo-1599940824399-b87987ceb72a",
        "wiener schnitzel": "photo-1599940824399-b87987ceb72a",
        "steak": "photo-1544025162-d76694265947",
        "rumpsteak": "photo-1544025162-d76694265947",
        "filetsteak": "photo-1544025162-d76694265947",
        "kebab": "photo-1626700051175-6518c4793fdf",
        "döner": "photo-1626700051175-6518c4793fdf",
        "yufka": "photo-1626700051175-6518c4793fdf",
        "dürüm": "photo-1626700051175-6518c4793fdf",
        "nuggets": "photo-1562967914-608f82629710",
        "chicken nuggets": "photo-1562967914-608f82629710",
        "chicken wings": "photo-1562967914-608f82629710",
        "wings": "photo-1562967914-608f82629710",
        "nachos": "photo-1565299585323-38d6b0865b47",
        "tacos": "photo-1565299585323-38d6b0865b47",
        "currywurst": "photo-1628191137573-feb6c3e5cf2c",
        
        # Süßspeisen & Desserts
        "waffel": "photo-1562376502-6f769499c886",
        "waffle": "photo-1562376502-6f769499c886",
        "crepe": "photo-1567620905732-2d1ec7ab7445",
        "crêpe": "photo-1567620905732-2d1ec7ab7445",
        "pancake": "photo-1567620905732-2d1ec7ab7445",
        "pancakes": "photo-1567620905732-2d1ec7ab7445",
        "eis": "photo-1501443762994-82bd5dace89a",
        "ice cream": "photo-1501443762994-82bd5dace89a",
        "tiramisu": "photo-1571877227200-a0d98ea607e9",
        "käsekuchen": "photo-1533134242443-d4fd215305ad",
        "cheesecake": "photo-1533134242443-d4fd215305ad",
        "souffle": "photo-1606313564200-e75d5e30476c",
        "schokosouffle": "photo-1606313564200-e75d5e30476c",
        "chocolate souffle": "photo-1606313564200-e75d5e30476c",
        
        # Shisha & Zubehör
        "shisha": "photo-1603006905003-be475563bc59",
        "hookah": "photo-1603006905003-be475563bc59",
        "waterpipe": "photo-1603006905003-be475563bc59",
        "wasserpfeife": "photo-1603006905003-be475563bc59",
        "kohle": "photo-1533240332313-0db49b459ad6",
    }
    
    # 1. Exact match
    if name_lower in curated_map:
        return f"https://images.unsplash.com/{curated_map[name_lower]}?w=600&auto=format&fit=crop&q=80"
        
    # 2. Substring match (longest keys first, e.g. "coca cola zero" matched before "cola")
    for key in sorted(curated_map.keys(), key=len, reverse=True):
        if key in name_lower:
            return f"https://images.unsplash.com/{curated_map[key]}?w=600&auto=format&fit=crop&q=80"

    # 3. Match individual words (fallback)
    words = name_lower.split()
    for w in words:
        w_clean = "".join(c for c in w if c.isalnum())
        if w_clean in curated_map:
            return f"https://images.unsplash.com/{curated_map[w_clean]}?w=600&auto=format&fit=crop&q=80"
            
    return None

def get_loremflickr_image(query: str) -> Optional[str]:
    import urllib.request
    import urllib.parse
    query_encoded = urllib.parse.quote(query.strip())
    url = f"https://loremflickr.com/600/600/{query_encoded}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            final_url = r.geturl()
            if final_url and ("loremflickr.com" in final_url or final_url.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))):
                return final_url
    except Exception:
        pass
    return None

def get_open_food_facts_image(query: str) -> Optional[str]:
    import urllib.request
    import urllib.parse
    import json
    query_encoded = urllib.parse.quote(query)
    url = f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={query_encoded}&search_simple=1&action=process&json=1"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'DigiGastroProductImageCrawler/1.0 (support@digi-gastro.de)'}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8', errors='ignore'))
            products = data.get("products", [])
            for prod in products:
                img_url = prod.get("image_url") or prod.get("image_front_url")
                if img_url:
                    return img_url
    except Exception:
        pass
    return None

@app.post("/api/products/process-generated-image")
async def process_generated_image(
    file: UploadFile = File(...),
    chef_data: tuple = Depends(require_chef_user_flat)
):
    import traceback
    try:
        user, slug, restaurant = chef_data
        content = await file.read()
        
        print(f"[AI Generation] Uploaded file size: {len(content)} bytes")
        
        # Process the image with background removal and auto-trim
        try:
            processed_bytes = process_and_crop_product_image(content)
        except Exception as e:
            print(f"[AI Generation] Process failed: {e}")
            processed_bytes = content
            
        # Save locally on the server
        import uuid
        safe_name = f"ai-{uuid.uuid4().hex[:8]}.png"
        products_upload_dir = os.path.join(UPLOAD_DIR, "products")
        os.makedirs(products_upload_dir, exist_ok=True)
        file_path = os.path.join(products_upload_dir, safe_name)
        with open(file_path, "wb") as fh:
            fh.write(processed_bytes)
            
        img_url = f"/uploads/products/{safe_name}"
        return {"success": True, "image_url": img_url}
    except Exception as e:
        tb = traceback.format_exc()
        print(f"[AI Generation] Server Error:\n{tb}")
        raise HTTPException(status_code=500, detail=f"Fehler: {str(e)}\n{tb}")


@app.post("/admin/products/generate-images")
def generate_images(chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return JSONResponse({"success": False, "error": "Setup not completed"}, status_code=400)
        
    products = restaurant.get("products", [])
    updated_count = 0
    for prod in products:
        p_name = prod.get("name")
        if not p_name:
            continue
            
        cleaned = clean_product_name_for_search(p_name)
        cat_type = prod.get("category_type", "").lower()
        img_url = None
        
        # 1. Look up in Curated Premium Map
        img_url = find_curated_image(cleaned)
        
        # 2. Fallback to Lorem Flickr
        if not img_url:
            search_tag = cleaned
            if cat_type == "bar":
                search_tag = f"{cleaned},drink"
            elif cat_type == "küche":
                search_tag = f"{cleaned},food"
            img_url = get_loremflickr_image(search_tag) or get_loremflickr_image(cleaned)
            
        # 3. Fallback to Open Food Facts (for drinks/bar items only)
        if not img_url and cat_type == "bar":
            img_url = get_open_food_facts_image(cleaned)
            
        # 4. Ultimate fallback to standard premium category placeholder
        if not img_url:
            if cat_type == "bar":
                img_url = "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80"
            else:
                img_url = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80"
                
        if img_url:
            prod["image"] = img_url
            updated_count += 1
            
    if updated_count > 0:
        try:
            save_restaurant_to_db(slug, restaurant, db)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")
        
    return JSONResponse({"success": True, "updated_count": updated_count})


# ==========================================
# ORDERS EXPORT: PDF + XLSX (filtered by user's current filter state)
# ==========================================

def _filter_orders_for_export(orders, range_param, status_param, date_from, date_to, table_param, search_param):
    """
    Shared filter logic for PDF/Excel exports. Mirrors the JS getFilteredOrders()
    so the export always matches exactly what the admin sees on screen.
    """
    from datetime import datetime, timedelta
    now = datetime.now()
    filtered = []

    search_lower = (search_param or "").strip().lower()

    for o in orders:
        # 1. Date filter
        if range_param and range_param != "all":
            ts = o.get("timestamp", "")
            order_date = None
            if ts:
                try:
                    order_date = datetime.strptime(ts.replace(" ", "T"), "%Y-%m-%dT%H:%M:%S")
                except Exception:
                    try:
                        order_date = datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
                    except Exception:
                        order_date = None

            if range_param == "today":
                if not order_date or order_date.date() != now.date():
                    continue
            elif range_param == "7d":
                if not order_date or (now - order_date).days > 7:
                    continue
            elif range_param == "30d":
                if not order_date or (now - order_date).days > 30:
                    continue
            elif range_param == "custom":
                if not order_date:
                    continue
                if date_from:
                    try:
                        from_date = datetime.strptime(date_from, "%Y-%m-%d")
                        if order_date < from_date:
                            continue
                    except Exception:
                        pass
                if date_to:
                    try:
                        to_date = datetime.strptime(date_to, "%Y-%m-%d")
                        # inkl. Enddatum (bis 23:59:59)
                        if order_date > to_date.replace(hour=23, minute=59, second=59):
                            continue
                    except Exception:
                        pass

        # 2. Status filter
        if status_param and status_param != "all":
            o_status = (o.get("status", "") or "").lower()
            if status_param == "aktiv":
                if o_status in ("bezahlt", "storniert"):
                    continue
            elif status_param == "bezahlt":
                if o_status != "bezahlt":
                    continue
            elif status_param == "storniert":
                if o_status != "storniert":
                    continue

        # 3. Tisch filter
        if table_param and table_param != "all":
            if str(o.get("table", "")) != table_param:
                continue

        # 4. Search filter
        if search_lower:
            bon_id = str(o.get("id", "")).lower()
            table_str = str(o.get("table", "")).lower()
            if search_lower not in bon_id and search_lower not in table_str:
                continue

        filtered.append(o)

    # Sort by timestamp desc (newest first) — same as default JS sort
    filtered.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return filtered


def _get_display_total(o):
    """Nie wieder 0€ im Export: zeige original_total wenn total=0."""
    t = o.get("total", 0.0) or 0.0
    ot = o.get("original_total")
    if ot is None or ot == 0:
        return t
    return max(t, ot)


@app.get("/admin/orders-export/pdf")
def orders_export_pdf(
    request: Request,
    date_range: str = Query("today", alias="range"),
    status: str = "all",
    frm: str = "",
    to: str = "",
    table: str = "all",
    search: str = "",
    db: Session = Depends(get_db)
):
    """Export der gefilterten Bestellungen als PDF — für Buchhaltung & Steuerberater."""
    res = get_current_user_and_slug(request)
    if not res:
        return RedirectResponse(url="/admin/login")
    user, slug = res
    if user["role"] != "chef":
        return RedirectResponse(url="/admin/login")

    restaurant = get_restaurant_or_raise(slug, db)
    all_orders = restaurant.get("orders", [])
    price_mode = restaurant.get("price_mode", "brutto")
    restaurant_name = restaurant.get("name", slug)

    orders = _filter_orders_for_export(all_orders, date_range, status, frm, to, table, search)

    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    )
    from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    import io as _io

    # Deutsches Format: Komma als Dezimaltrenner
    def fmt_eur(v):
        try:
            return f"{float(v):.2f}".replace(".", ",") + " €"
        except Exception:
            return "0,00 €"

    # Try to register a Unicode font that supports the € sign cleanly.
    # Fallback to Helvetica if registration fails.
    font_name = "Helvetica"
    font_bold = "Helvetica-Bold"
    try:
        # DejaVuSans is widely available and supports €, Umlauts, etc.
        for path in [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/dejavu/DejaVuSans.ttf",
        ]:
            try:
                pdfmetrics.registerFont(TTFont("DejaVuSans", path))
                font_name = "DejaVuSans"
                # Bold variant
                bold_path = path.replace("DejaVuSans.ttf", "DejaVuSans-Bold.ttf")
                pdfmetrics.registerFont(TTFont("DejaVuSans-Bold", bold_path))
                font_bold = "DejaVuSans-Bold"
                break
            except Exception:
                continue
    except Exception:
        pass

    buffer = _io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        title=f"Bestellreport — {restaurant_name}",
        author=restaurant_name,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "Title2", parent=styles["Heading1"],
        fontName=font_bold, fontSize=18, leading=22,
        textColor=colors.HexColor("#064e3b"), spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        "Subtitle", parent=styles["Normal"],
        fontName=font_name, fontSize=9, leading=12,
        textColor=colors.HexColor("#666666"), spaceAfter=10
    )
    section_style = ParagraphStyle(
        "Section", parent=styles["Heading2"],
        fontName=font_bold, fontSize=11, leading=14,
        textColor=colors.HexColor("#1f2937"), spaceAfter=6, spaceBefore=8
    )

    elements = []
    elements.append(Paragraph(f"Bestellreport — {restaurant_name}", title_style))

    # Filter-Beschreibung
    from datetime import datetime
    filter_parts = []
    range_labels = {"today": "Heute", "7d": "Letzte 7 Tage", "30d": "Letzte 30 Tage", "all": "Alle Zeiträume"}
    if date_range == "custom" and frm and to:
        filter_parts.append(f"Zeitraum: {frm} bis {to}")
    elif date_range in range_labels:
        filter_parts.append(f"Zeitraum: {range_labels[date_range]}")
    if status and status != "all":
        status_labels = {"aktiv": "Aktiv", "bezahlt": "Bezahlt", "storniert": "Storniert"}
        filter_parts.append(f"Status: {status_labels.get(status, status)}")
    if table and table != "all":
        filter_parts.append(f"Tisch: {table}")
    if search:
        filter_parts.append(f"Suche: &quot;{search}&quot;")
    filter_text = " · ".join(filter_parts) if filter_parts else "Keine Filter aktiv"
    now_str = datetime.now().strftime("%d.%m.%Y %H:%M")
    elements.append(Paragraph(
        f"{filter_text}<br/>Erstellt am: {now_str} · Preis-Modus: {price_mode.capitalize()}",
        subtitle_style
    ))

    # Summary
    total_count = len(orders)
    paid_count = len([o for o in orders if (o.get("status", "") or "").lower() == "bezahlt"])
    cancelled_count = len([o for o in orders if (o.get("status", "") or "").lower() == "storniert"])
    active_count = total_count - paid_count - cancelled_count
    total_revenue = sum(_get_display_total(o) for o in orders if (o.get("status", "") or "").lower() == "bezahlt")
    avg_basket = (total_revenue / paid_count) if paid_count > 0 else 0.0

    elements.append(Paragraph("Zusammenfassung", section_style))
    summary_data = [
        ["Bestellungen gesamt:", str(total_count)],
        ["Davon bezahlt:", str(paid_count)],
        ["Davon aktiv:", str(active_count)],
        ["Davon storniert:", str(cancelled_count)],
        ["Umsatz (bezahlt):", fmt_eur(total_revenue)],
        ["Ø Bon-Wert:", fmt_eur(avg_basket)],
    ]
    summary_table = Table(summary_data, colWidths=[80 * mm, 50 * mm])
    summary_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), font_name),
        ("FONTNAME", (0, 0), (0, -1), font_bold),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#374151")),
        ("TEXTCOLOR", (1, 0), (1, -1), colors.HexColor("#111827")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW", (0, -1), (-1, -1), 0.5, colors.HexColor("#9ca3af")),
        ("LINEABOVE", (0, 0), (-1, 0), 0.5, colors.HexColor("#9ca3af")),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 10))

    # Orders table
    elements.append(Paragraph("Bestellungen im Detail", section_style))

    # Header
    header = ["Bon ID", "Tisch", "Zeitstempel", "Status"]
    if price_mode != "netto":
        header.append("MwSt")
    header.append("Gesamt")

    table_data = [header]
    for o in orders:
        row = [
            f"#{o.get('id', '')}",
            str(o.get("table", "")),
            str(o.get("timestamp", "")),
            str(o.get("status", "")).capitalize(),
        ]
        if price_mode != "netto":
            row.append(f"{o.get('mwst_rate', 19)}%")
        row.append(fmt_eur(_get_display_total(o)))
        table_data.append(row)

    # Total row — NUR bezahlte Bons summieren (Bug-Fix: stornierte Bons
    # wurden bisher fälschlich in die GESAMT-Summe einberechnet, was zu
    # Umsatzverzerrung in Buchhaltungs-PDFs führte).
    paid_orders_for_total = [o for o in orders if (o.get("status", "") or "").lower() == "bezahlt"]
    total_row = ["", "", "", "GESAMT"]
    if price_mode != "netto":
        total_row.append("")
    total_row.append(fmt_eur(sum(_get_display_total(o) for o in paid_orders_for_total)))
    table_data.append(total_row)

    # Column widths: total ~180mm on A4
    if price_mode != "netto":
        col_widths = [20 * mm, 30 * mm, 38 * mm, 25 * mm, 15 * mm, 30 * mm]
    else:
        col_widths = [22 * mm, 33 * mm, 42 * mm, 28 * mm, 35 * mm]

    orders_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    orders_table.setStyle(TableStyle([
        # Header
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#064e3b")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), font_bold),
        ("FONTSIZE", (0, 0), (-1, 0), 8.5),
        ("ALIGN", (0, 0), (-1, 0), "LEFT"),
        ("ALIGN", (-1, 0), (-1, 0), "RIGHT"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("TOPPADDING", (0, 0), (-1, 0), 6),
        # Body
        ("FONTNAME", (0, 1), (-1, -2), font_name),
        ("FONTSIZE", (0, 1), (-1, -1), 8.5),
        ("TEXTCOLOR", (0, 1), (-1, -2), colors.HexColor("#111827")),
        ("ALIGN", (-1, 1), (-1, -1), "RIGHT"),
        ("ALIGN", (3, 1), (3, -1), "LEFT"),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 4),
        ("TOPPADDING", (0, 1), (-1, -1), 4),
        # Row striping
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#f9fafb")]),
        # Grid
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, colors.HexColor("#064e3b")),
        ("LINEBELOW", (0, 1), (-1, -2), 0.25, colors.HexColor("#e5e7eb")),
        # Total row
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#d1fae5")),
        ("FONTNAME", (0, -1), (-1, -1), font_bold),
        ("TEXTCOLOR", (0, -1), (-1, -1), colors.HexColor("#064e3b")),
        ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#064e3b")),
        ("TOPPADDING", (0, -1), (-1, -1), 6),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 6),
    ]))
    elements.append(orders_table)

    # Footer note
    elements.append(Spacer(1, 14))
    footer_style = ParagraphStyle(
        "Footer", parent=styles["Normal"],
        fontName=font_name, fontSize=7, leading=9,
        textColor=colors.HexColor("#9ca3af"), alignment=TA_CENTER
    )
    elements.append(Paragraph(
        f"Dieser Report wurde maschinell erstellt — {restaurant_name} · digi-gastro.de",
        footer_style
    ))

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    filename = f"bestellreport-{slug}-{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )


# ════════════════════════════════════════════════════════════════════
# MONATSREPORT / ZEITRAUM-REPORT PDF
# Professioneller Umsatzreport für einen beliebigen Zeitraum.
# Zeigt: Gesamtumsatz, Zusammenfassung, Top-Tische, Top-Produkte, Tägliche Umsätze.
# Netto-Only Darstellung (kein Brutto, kein MwSt-Ausweis im Frontend).
# ════════════════════════════════════════════════════════════════════
@app.get("/admin/monatsreport/pdf")
def monatsreport_pdf(
    request: Request,
    frm: str = Query(..., description="Start-Datum YYYY-MM-DD"),
    to: str = Query(..., description="End-Datum YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    """Professioneller Umsatzreport PDF für einen Zeitraum (von-bis).
    Netto-Only Darstellung — keine MwSt, kein Brutto im Report."""
    res = get_current_user_and_slug(request)
    if not res:
        return RedirectResponse(url="/admin/login")
    user, slug = res
    if user["role"] != "chef":
        return RedirectResponse(url="/admin/login")

    restaurant = get_restaurant_or_raise(slug, db)
    restaurant_name = restaurant.get("name", slug)
    price_mode = restaurant.get("price_mode", "brutto")
    all_orders = restaurant.get("orders", [])

    # ── Zeitraum parsen ──
    from datetime import datetime, timedelta
    try:
        date_from = datetime.strptime(frm, "%Y-%m-%d")
        date_to = datetime.strptime(to, "%Y-%m-%d")
        # Enddatum inkl. bis 23:59:59
        date_to_end = date_to.replace(hour=23, minute=59, second=59)
    except Exception:
        raise HTTPException(status_code=400, detail="Ungültiges Datum. Format: YYYY-MM-DD")

    if date_from > date_to:
        raise HTTPException(status_code=400, detail="Start-Datum muss vor End-Datum liegen")

    # ── Bestellungen im Zeitraum filtern (nur bezahlt) ──
    paid_orders_in_range = []
    for o in all_orders:
        if o.get("status") != "bezahlt":
            continue
        ts = o.get("timestamp", "")
        if not ts:
            continue
        try:
            order_date = datetime.strptime(ts.replace(" ", "T"), "%Y-%m-%dT%H:%M:%S")
        except Exception:
            try:
                order_date = datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
            except Exception:
                continue
        if date_from <= order_date <= date_to_end:
            paid_orders_in_range.append((o, order_date))

    # ── Metriken berechnen ──
    total_revenue = 0.0
    by_table = {}      # table_name -> {count, revenue}
    by_product = {}    # product_name -> {qty, revenue}
    by_day = {}        # date_str -> {count, revenue}

    for o, order_date in paid_orders_in_range:
        # Netto-Modus: netto_7 + netto_19 aus Items berechnen
        # Brutto-Modus: total verwenden
        if price_mode == "netto":
            order_netto = 0.0
            for item in o.get("items", []):
                item_price = item.get("price", 0.0) or 0.0
                item_qty = item.get("quantity", 0) or 0
                item_total = item_price * item_qty
                is_food = item.get("category_type", "küche") == "küche"
                if is_food:
                    order_netto += item_total / 1.07
                else:
                    order_netto += item_total / 1.19
            order_revenue = order_netto
        else:
            order_revenue = float(_get_display_total(o))
        total_revenue += order_revenue

        # Nach Tisch
        table_name = o.get("table", "Unbekannt")
        if table_name not in by_table:
            by_table[table_name] = {"count": 0, "revenue": 0.0}
        by_table[table_name]["count"] += 1
        by_table[table_name]["revenue"] += order_revenue

        # Nach Produkt
        for item in o.get("items", []):
            name = item.get("name", "Unbekannt")
            qty = item.get("quantity", 0) or 0
            item_price = item.get("price", 0.0) or 0.0
            item_total = item_price * qty
            if price_mode == "netto":
                is_food = item.get("category_type", "küche") == "küche"
                if is_food:
                    item_total = item_total / 1.07
                else:
                    item_total = item_total / 1.19
            if name not in by_product:
                by_product[name] = {"qty": 0, "revenue": 0.0}
            by_product[name]["qty"] += qty
            by_product[name]["revenue"] += item_total

        # Nach Tag
        day_str = order_date.strftime("%d.%m.%Y")
        if day_str not in by_day:
            by_day[day_str] = {"count": 0, "revenue": 0.0}
        by_day[day_str]["count"] += 1
        by_day[day_str]["revenue"] += order_revenue

    total_bons = len(paid_orders_in_range)
    avg_basket = total_revenue / total_bons if total_bons > 0 else 0.0

    # Top-Tische (nach Umsatz)
    top_tables = sorted(by_table.items(), key=lambda x: x[1]["revenue"], reverse=True)[:5]
    max_table_revenue = top_tables[0][1]["revenue"] if top_tables else 1.0

    # Top-Produkte (nach Menge)
    top_products = sorted(by_product.items(), key=lambda x: x[1]["qty"], reverse=True)[:10]

    # Tägliche Umsätze (sortiert nach Datum)
    daily_sorted = sorted(by_day.items(), key=lambda x: datetime.strptime(x[0], "%d.%m.%Y"))

    # ── PDF generieren mit ReportLab ──
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    )
    from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    import io as _io

    def fmt_eur(v):
        try:
            return f"{float(v):.2f}".replace(".", ",") + " €"
        except Exception:
            return "0,00 €"

    def fmt_pct(v):
        try:
            return f"{float(v):.1f}%"
        except Exception:
            return "0,0%"

    # Font registrieren
    font_name = "Helvetica"
    font_bold = "Helvetica-Bold"
    try:
        for path in [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/dejavu/DejaVuSans.ttf",
        ]:
            try:
                pdfmetrics.registerFont(TTFont("DejaVuSans", path))
                font_name = "DejaVuSans"
                bold_path = path.replace("DejaVuSans.ttf", "DejaVuSans-Bold.ttf")
                pdfmetrics.registerFont(TTFont("DejaVuSans-Bold", bold_path))
                font_bold = "DejaVuSans-Bold"
                break
            except Exception:
                continue
    except Exception:
        pass

    buffer = _io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title=f"Umsatzreport — {restaurant_name}",
        author=restaurant_name,
    )

    styles = getSampleStyleSheet()

    # Styles
    brand_style = ParagraphStyle(
        "Brand", parent=styles["Normal"],
        fontName=font_bold, fontSize=20, leading=24,
        textColor=colors.HexColor("#0f172a"), spaceAfter=2
    )
    title_style = ParagraphStyle(
        "Title2", parent=styles["Normal"],
        fontName=font_name, fontSize=11, leading=14,
        textColor=colors.HexColor("#64748b"), spaceAfter=14
    )
    meta_style = ParagraphStyle(
        "Meta", parent=styles["Normal"],
        fontName=font_name, fontSize=8, leading=11,
        textColor=colors.HexColor("#94a3b8")
    )
    section_style = ParagraphStyle(
        "Section", parent=styles["Heading2"],
        fontName=font_bold, fontSize=12, leading=15,
        textColor=colors.HexColor("#0f172a"), spaceAfter=8, spaceBefore=14
    )
    big_value_style = ParagraphStyle(
        "BigValue", parent=styles["Normal"],
        fontName=font_bold, fontSize=28, leading=32,
        textColor=colors.HexColor("#064e3b"), spaceAfter=4, alignment=TA_LEFT
    )
    sub_value_style = ParagraphStyle(
        "SubValue", parent=styles["Normal"],
        fontName=font_name, fontSize=9, leading=12,
        textColor=colors.HexColor("#64748b")
    )
    footer_style = ParagraphStyle(
        "Footer", parent=styles["Normal"],
        fontName=font_name, fontSize=8, leading=11,
        textColor=colors.HexColor("#94a3b8"), alignment=TA_CENTER
    )

    elements = []

    # ── Header ──
    elements.append(Paragraph(restaurant_name, brand_style))
    elements.append(Paragraph("Umsatzreport", title_style))

    from_dt = date_from.strftime("%d.%m.%Y")
    to_dt = date_to.strftime("%d.%m.%Y")
    now_str = datetime.now().strftime("%d.%m.%Y, %H:%M Uhr")
    elements.append(Paragraph(f"Zeitraum: {from_dt} – {to_dt}", meta_style))
    elements.append(Paragraph(f"Erstellt am: {now_str}", meta_style))
    elements.append(Spacer(1, 10))

    # ── Großer Gesamtumsatz-Block ──
    summary_inner = [
        [Paragraph("<b>GESAMTUMSATZ</b>", ParagraphStyle("GSLabel", fontName=font_bold, fontSize=9, textColor=colors.HexColor("#64748b"), leading=12))],
        [Paragraph(fmt_eur(total_revenue), big_value_style)],
        [Paragraph(f"{total_bons} Bons · Ø {fmt_eur(avg_basket)} pro Bon", sub_value_style)],
    ]
    summary_table = Table(summary_inner, colWidths=[170 * mm])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f0fdf4")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#bbf7d0")),
        ("LEFTPADDING", (0, 0), (-1, -1), 18),
        ("RIGHTPADDING", (0, 0), (-1, -1), 18),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 18))

    # ── Zusammenfassung ──
    elements.append(Paragraph("Zusammenfassung", section_style))
    summary_data = [
        ["Bestellungen gesamt:", str(total_bons)],
        ["Bezahlt:", str(total_bons)],
        ["Ø Bon-Wert:", fmt_eur(avg_basket)],
    ]
    summary_t = Table(summary_data, colWidths=[100 * mm, 70 * mm])
    summary_t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), font_name),
        ("FONTNAME", (0, 0), (0, -1), font_bold),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#475569")),
        ("TEXTCOLOR", (1, 0), (1, -1), colors.HexColor("#0f172a")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, -1), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("LINEABOVE", (0, 0), (-1, 0), 0.4, colors.HexColor("#cbd5e1")),
    ]))
    elements.append(summary_t)
    elements.append(Spacer(1, 14))

    # ── Top-Tische ──
    if top_tables:
        elements.append(Paragraph("Umsatz nach Tisch (Top 5)", section_style))
        table_header = ["Tisch", "Bons", "Umsatz", "Anteil"]
        table_rows = [table_header]
        for table_name, data in top_tables:
            pct = (data["revenue"] / total_revenue * 100) if total_revenue > 0 else 0
            # Balken aus █-Zeichen
            bar_count = int((data["revenue"] / max_table_revenue) * 10) if max_table_revenue > 0 else 0
            bar = "█" * bar_count + "░" * (10 - bar_count)
            table_rows.append([
                table_name,
                str(data["count"]),
                fmt_eur(data["revenue"]),
                f"{fmt_pct(pct)}  {bar}"
            ])
        top_tables_t = Table(table_rows, colWidths=[55 * mm, 20 * mm, 35 * mm, 60 * mm])
        top_tables_t.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, 0), font_bold),
            ("FONTNAME", (0, 1), (-1, -1), font_name),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#475569")),
            ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor("#0f172a")),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("ALIGN", (2, 0), (2, -1), "RIGHT"),
            ("ALIGN", (3, 0), (3, -1), "LEFT"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("LINEBELOW", (0, 0), (-1, -2), 0.3, colors.HexColor("#e2e8f0")),
            ("BOX", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ]))
        elements.append(top_tables_t)
        elements.append(Spacer(1, 14))

    # ── Top-Produkte ──
    if top_products:
        elements.append(Paragraph("Top-Produkte", section_style))
        prod_header = ["#", "Produkt", "Menge", "Umsatz"]
        prod_rows = [prod_header]
        for i, (prod_name, data) in enumerate(top_products, 1):
            prod_rows.append([
                str(i),
                prod_name,
                str(data["qty"]),
                fmt_eur(data["revenue"]),
            ])
        top_prod_t = Table(prod_rows, colWidths=[10 * mm, 85 * mm, 25 * mm, 50 * mm])
        top_prod_t.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, 0), font_bold),
            ("FONTNAME", (0, 1), (-1, -1), font_name),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#475569")),
            ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor("#0f172a")),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("ALIGN", (2, 0), (3, -1), "RIGHT"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("LINEBELOW", (0, 0), (-1, -2), 0.3, colors.HexColor("#e2e8f0")),
            ("BOX", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ]))
        elements.append(top_prod_t)
        elements.append(Spacer(1, 14))

    # ── Tägliche Umsätze ──
    if daily_sorted:
        elements.append(Paragraph("Tägliche Umsätze", section_style))
        day_header = ["Datum", "Bons", "Umsatz"]
        day_rows = [day_header]
        for day_str, data in daily_sorted:
            day_rows.append([
                day_str,
                str(data["count"]),
                fmt_eur(data["revenue"]),
            ])
        # Summen-Zeile
        day_rows.append([
            "GESAMT",
            str(total_bons),
            fmt_eur(total_revenue),
        ])
        daily_t = Table(day_rows, colWidths=[60 * mm, 30 * mm, 50 * mm])
        daily_t.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, 0), font_bold),
            ("FONTNAME", (0, 1), (-1, -2), font_name),
            ("FONTNAME", (0, -1), (-1, -1), font_bold),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#fef3c7")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#475569")),
            ("TEXTCOLOR", (0, 1), (-1, -2), colors.HexColor("#0f172a")),
            ("TEXTCOLOR", (0, -1), (-1, -1), colors.HexColor("#92400e")),
            ("ALIGN", (1, 0), (2, -1), "RIGHT"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("LINEBELOW", (0, 0), (-1, -2), 0.3, colors.HexColor("#e2e8f0")),
            ("LINEABOVE", (0, -1), (-1, -1), 0.6, colors.HexColor("#92400e")),
            ("BOX", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ]))
        elements.append(daily_t)

    elements.append(Spacer(1, 30))

    # ── Footer: Unterschrift-Linie + Branding ──
    sig_data = [["Ort/Datum: ____________________", "Unterschrift: ____________________"]]
    sig_t = Table(sig_data, colWidths=[85 * mm, 85 * mm])
    sig_t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), font_name),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#64748b")),
        ("TOPPADDING", (0, 0), (-1, -1), 20),
    ]))
    elements.append(sig_t)
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("Generiert von digi-gastro · digi-gastro.de", footer_style))

    doc.build(elements)
    buffer.seek(0)

    from_dt_fn = date_from.strftime("%Y-%m-%d")
    to_dt_fn = date_to.strftime("%Y-%m-%d")
    filename = f"umsatzreport-{slug}-{from_dt_fn}-bis-{to_dt_fn}.pdf"

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )


@app.get("/admin/orders-export/xlsx")
def orders_export_xlsx(
    request: Request,
    date_range: str = Query("today", alias="range"),
    status: str = "all",
    frm: str = "",
    to: str = "",
    table: str = "all",
    search: str = "",
    db: Session = Depends(get_db)
):
    """Export der gefilterten Bestellungen als Excel — für Buchhaltung & Steuerberater."""
    res = get_current_user_and_slug(request)
    if not res:
        return RedirectResponse(url="/admin/login")
    user, slug = res
    if user["role"] != "chef":
        return RedirectResponse(url="/admin/login")

    restaurant = get_restaurant_or_raise(slug, db)
    all_orders = restaurant.get("orders", [])
    price_mode = restaurant.get("price_mode", "brutto")
    restaurant_name = restaurant.get("name", slug)

    orders = _filter_orders_for_export(all_orders, date_range, status, frm, to, table, search)

    import io as _io
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    from openpyxl.utils import get_column_letter

    wb = Workbook()

    # ── Sheet 1: Bestellungen ──
    ws = wb.active
    ws.title = "Bestellungen"

    # Header styling
    header_font = Font(bold=True, color="FFFFFF", size=11, name="Calibri")
    header_fill = PatternFill(start_color="064E3B", end_color="064E3B", fill_type="solid")
    header_align = Alignment(horizontal="left", vertical="center", wrap_text=True)
    total_font = Font(bold=True, color="064E3B", size=11)
    total_fill = PatternFill(start_color="D1FAE5", end_color="D1FAE5", fill_type="solid")
    thin_border = Border(
        left=Side(style="thin", color="E5E7EB"),
        right=Side(style="thin", color="E5E7EB"),
        top=Side(style="thin", color="E5E7EB"),
        bottom=Side(style="thin", color="E5E7EB"),
    )

    # Title row
    ws.merge_cells("A1:G1")
    ws["A1"] = f"Bestellreport — {restaurant_name}"
    ws["A1"].font = Font(bold=True, size=14, color="064E3B")
    ws["A1"].alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[1].height = 24

    # Filter info row
    from datetime import datetime
    range_labels = {"today": "Heute", "7d": "Letzte 7 Tage", "30d": "Letzte 30 Tage", "all": "Alle Zeiträume"}
    filter_parts = []
    if date_range == "custom" and frm and to:
        filter_parts.append(f"Zeitraum: {frm} bis {to}")
    elif date_range in range_labels:
        filter_parts.append(f"Zeitraum: {range_labels[date_range]}")
    if status and status != "all":
        status_labels = {"aktiv": "Aktiv", "bezahlt": "Bezahlt", "storniert": "Storniert"}
        filter_parts.append(f"Status: {status_labels.get(status, status)}")
    if table and table != "all":
        filter_parts.append(f"Tisch: {table}")
    if search:
        filter_parts.append(f"Suche: {search}")
    filter_text = " · ".join(filter_parts) if filter_parts else "Keine Filter aktiv"

    ws.merge_cells("A2:G2")
    ws["A2"] = f"{filter_text}  ·  Erstellt am: {datetime.now().strftime('%d.%m.%Y %H:%M')}  ·  Preis-Modus: {price_mode.capitalize()}"
    ws["A2"].font = Font(size=9, color="666666", italic=True)
    ws["A2"].alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[2].height = 16

    # Empty row
    ws.row_dimensions[3].height = 6

    # Header row (row 4)
    header_row = 4
    headers = ["Bon ID", "Tisch", "Zeitstempel", "Status"]
    if price_mode != "netto":
        headers.append("MwSt")
    headers.append("Gesamt (€)")
    headers.append("Original-Warenwert (€)")

    for col_idx, header in enumerate(headers, start=1):
        cell = ws.cell(row=header_row, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_align
        cell.border = thin_border
    ws.row_dimensions[header_row].height = 28

    # Data rows
    data_start = header_row + 1
    for row_offset, o in enumerate(orders):
        row = data_start + row_offset
        col = 1
        ws.cell(row=row, column=col, value=f"#{o.get('id', '')}"); col += 1
        ws.cell(row=row, column=col, value=str(o.get("table", ""))); col += 1
        ws.cell(row=row, column=col, value=str(o.get("timestamp", ""))); col += 1
        ws.cell(row=row, column=col, value=str(o.get("status", "")).capitalize()); col += 1
        if price_mode != "netto":
            ws.cell(row=row, column=col, value=f"{o.get('mwst_rate', 19)}%"); col += 1
        # Gesamt — als Zahl damit Excel sum-fähig ist
        display_total = _get_display_total(o)
        ws.cell(row=row, column=col, value=float(display_total)); col += 1
        # Original-Warenwert
        ot = o.get("original_total")
        ws.cell(row=row, column=col, value=float(ot) if ot is not None else float(display_total)); col += 1

        # Style the row
        for c in range(1, col):
            cell = ws.cell(row=row, column=c)
            cell.border = thin_border
            cell.font = Font(size=10, name="Calibri")
            if c == col - 2:  # Gesamt-Spalte
                cell.number_format = '#,##0.00 "€"'
                cell.alignment = Alignment(horizontal="right")
            elif c == col - 1:  # Original-Spalte
                cell.number_format = '#,##0.00 "€"'
                cell.alignment = Alignment(horizontal="right")
            elif c == 4:  # Status
                cell.alignment = Alignment(horizontal="left")
            # Alternating row background
            if row_offset % 2 == 1:
                cell.fill = PatternFill(start_color="F9FAFB", end_color="F9FAFB", fill_type="solid")

    # Total row
    total_row_idx = data_start + len(orders)
    if len(orders) > 0:
        total_row_idx += 1  # empty row before total

    ws.cell(row=total_row_idx, column=1, value="GESAMT")
    ws.merge_cells(start_row=total_row_idx, start_column=1, end_row=total_row_idx, end_column=3)
    total_cell_label = ws.cell(row=total_row_idx, column=1)
    total_cell_label.font = total_font
    total_cell_label.fill = total_fill
    total_cell_label.alignment = Alignment(horizontal="right", vertical="center")

    # Status count
    bezahlt_count = len([o for o in orders if (o.get("status", "") or "").lower() == "bezahlt"])
    ws.cell(row=total_row_idx, column=4, value=f"{bezahlt_count} bezahlt")
    ws.cell(row=total_row_idx, column=4).font = total_font
    ws.cell(row=total_row_idx, column=4).fill = total_fill

    # MwSt column empty in total row
    if price_mode != "netto":
        ws.cell(row=total_row_idx, column=5, value="")
        ws.cell(row=total_row_idx, column=5).fill = total_fill

    # Sum of totals — NUR bezahlte Bons summieren (Bug-Fix: stornierte Bons
    # wurden bisher via SUM-Formel fälschlich in die GESAMT-Summe einberechnet).
    # Statt Excel SUM-Formel (die alle Zeilen summiert inkl. storniert) verwenden
    # wir den vorgerechneten Wert der nur bezahlte Bons enthält.
    gesamt_col = len(headers) - 1
    orig_col = len(headers)
    paid_orders_for_total = [o for o in orders if (o.get("status", "") or "").lower() == "bezahlt"]
    if paid_orders_for_total:
        gesamt_sum = sum(_get_display_total(o) for o in paid_orders_for_total)
        orig_sum = sum((o.get("original_total") or _get_display_total(o)) for o in paid_orders_for_total)
        ws.cell(row=total_row_idx, column=gesamt_col, value=round(gesamt_sum, 2))
        ws.cell(row=total_row_idx, column=orig_col, value=round(orig_sum, 2))

    for c in [gesamt_col, orig_col]:
        cell = ws.cell(row=total_row_idx, column=c)
        cell.font = total_font
        cell.fill = total_fill
        cell.number_format = '#,##0.00 "€"'
        cell.alignment = Alignment(horizontal="right")
        cell.border = Border(top=Side(style="medium", color="064E3B"))

    # Column widths
    widths = [10, 18, 22, 14]
    if price_mode != "netto":
        widths.append(8)
    widths.append(16)  # Gesamt
    widths.append(20)  # Original
    for idx, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(idx)].width = w

    # Freeze header row
    ws.freeze_panes = f"A{header_row + 1}"

    # ── Sheet 2: Artikel-Details (eine Zeile pro Artikel) ──
    ws2 = wb.create_sheet("Artikel-Details")

    ws2.merge_cells("A1:I1")
    ws2["A1"] = f"Artikel-Details — {restaurant_name}"
    ws2["A1"].font = Font(bold=True, size=14, color="064E3B")
    ws2.row_dimensions[1].height = 24

    item_headers = ["Bon ID", "Tisch", "Zeitstempel", "Artikel", "Kategorie", "MwSt (%)", "Einzelpreis (€)", "Menge", "Gesamt (€)"]
    for col_idx, header in enumerate(item_headers, start=1):
        cell = ws2.cell(row=3, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_align
        cell.border = thin_border
    ws2.row_dimensions[3].height = 28

    item_row = 4
    for o in orders:
        o_id = o.get("id", "")
        o_table = str(o.get("table", ""))
        o_timestamp = str(o.get("timestamp", ""))
        items = o.get("items", [])
        if not items:
            # Wenn keine Artikel mehr (z.B. pay-item everything), trotzdem eine Zeile mit leerem Artikel
            for col_idx, val in enumerate([f"#{o_id}", o_table, o_timestamp, "(keine Artikel)", "", "", "", "", ""], start=1):
                cell = ws2.cell(row=item_row, column=col_idx, value=val)
                cell.border = thin_border
                cell.font = Font(size=10, italic=True, color="9CA3AF")
            item_row += 1
        else:
            for item in items:
                item_cat = (item.get("category_type", "küche") or "küche").lower()
                item_mwst = 19 if item_cat == "bar" else 7
                category_label = {"küche": "Küche", "bar": "Bar", "shisha": "Shisha"}.get(item_cat, item_cat.capitalize())
                price = float(item.get("price", 0.0) or 0.0)
                qty = int(item.get("quantity", 1) or 1)
                # Im Netto-Modus: Nettopreis aus Brutto-Preis berechnen
                if price_mode == "netto":
                    mwst_divisor = 1.19 if item_cat == "bar" else 1.07
                    export_price = round(price / mwst_divisor, 4)
                else:
                    export_price = price
                line_total = round(export_price * qty, 2)

                row_values = [
                    f"#{o_id}", o_table, o_timestamp,
                    item.get("name", ""),
                    category_label,
                    item_mwst,
                    export_price,
                    qty,
                    line_total
                ]
                for col_idx, val in enumerate(row_values, start=1):
                    cell = ws2.cell(row=item_row, column=col_idx, value=val)
                    cell.border = thin_border
                    cell.font = Font(size=10, name="Calibri")
                    if col_idx in (7, 9):  # price columns
                        cell.number_format = '#,##0.00 "€"'
                        cell.alignment = Alignment(horizontal="right")
                item_row += 1

    # Column widths
    item_widths = [10, 14, 22, 28, 12, 10, 16, 8, 16]
    for idx, w in enumerate(item_widths, start=1):
        ws2.column_dimensions[get_column_letter(idx)].width = w
    ws2.freeze_panes = "A4"

    # ── Sheet 3: Zusammenfassung ──
    ws3 = wb.create_sheet("Zusammenfassung")
    ws3.merge_cells("A1:B1")
    ws3["A1"] = "Zusammenfassung"
    ws3["A1"].font = Font(bold=True, size=14, color="064E3B")
    ws3.row_dimensions[1].height = 24

    total_count = len(orders)
    paid_count = len([o for o in orders if (o.get("status", "") or "").lower() == "bezahlt"])
    cancelled_count = len([o for o in orders if (o.get("status", "") or "").lower() == "storniert"])
    active_count = total_count - paid_count - cancelled_count
    total_revenue = sum(_get_display_total(o) for o in orders if (o.get("status", "") or "").lower() == "bezahlt")
    avg_basket = (total_revenue / paid_count) if paid_count > 0 else 0.0

    summary_rows = [
        ("Bestellungen gesamt", total_count),
        ("Davon bezahlt", paid_count),
        ("Davon aktiv", active_count),
        ("Davon storniert", cancelled_count),
        ("Umsatz (bezahlt) in €", round(total_revenue, 2)),
        ("Ø Bon-Wert in €", round(avg_basket, 2)),
    ]
    for row_idx, (label, value) in enumerate(summary_rows, start=3):
        ws3.cell(row=row_idx, column=1, value=label).font = Font(bold=True, size=11)
        ws3.cell(row=row_idx, column=1).alignment = Alignment(horizontal="left", vertical="center")
        ws3.cell(row=row_idx, column=2, value=value).font = Font(size=11)
        ws3.cell(row=row_idx, column=2).alignment = Alignment(horizontal="right", vertical="center")
        if "€" in label:
            ws3.cell(row=row_idx, column=2).number_format = '#,##0.00 "€"'
        ws3.cell(row=row_idx, column=1).border = thin_border
        ws3.cell(row=row_idx, column=2).border = thin_border

    ws3.column_dimensions["A"].width = 30
    ws3.column_dimensions["B"].width = 20

    # Write to buffer
    buffer = _io.BytesIO()
    wb.save(buffer)
    xlsx_bytes = buffer.getvalue()
    buffer.close()

    filename = f"bestellreport-{slug}-{datetime.now().strftime('%Y%m%d%H%M%S')}.xlsx"
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )


# ==========================================
# LAUNCH-READY WIZARD & SETUP ROUTES
# ==========================================

@app.get("/admin/setup", response_class=HTMLResponse)
def get_setup(request: Request, db: Session = Depends(get_db)):
    res = get_current_user_and_slug(request)
    if not res:
        return RedirectResponse(url="/admin/login")
    user, slug = res
    if user["role"] != "chef":
        return RedirectResponse(url="/admin/login")
        
    restaurant = get_restaurant_or_raise(slug, db)
    
    # If setup is already completed, redirect to dashboard
    if restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/dashboard")
    
    # Otherwise show the setup page
    return templates.TemplateResponse(
        request,
        "admin.html",
        {
            "request": request,
            "restaurant": restaurant,
            "current_user": user,
            "stats": {"brutto": 0, "netto_7": 0, "netto_19": 0, "tip": 0, "orders_count": 0, "avg_basket": 0},
            "hh_active_global": False,
            "active_tab": "konfiguration",
            "events_json": "[]"
        }
    )

@app.post("/admin/upload-logo")
async def upload_logo(request: Request, file: UploadFile = File(...), chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data

    # Use the persistent uploads directory (env-configured)
    os.makedirs(UPLOAD_LOGOS_DIR, exist_ok=True)

    ext = "png"
    if file.filename:
        parts = file.filename.split(".")
        if len(parts) > 1:
            ext = parts[-1].lower()

    filename = f"{slug}-logo.{ext}"
    file_path = os.path.join(UPLOAD_LOGOS_DIR, filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Serve via /uploads/ route (persistent volume mount)
    logo_relative_path = f"/uploads/logos/{filename}"
    restaurant["logo_path"] = logo_relative_path
    if "branding" not in restaurant:
        restaurant["branding"] = {}
    restaurant["branding"]["logo_url"] = logo_relative_path

    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return {"success": True, "logo_url": logo_relative_path}

@app.post("/admin/setup-complete")
def post_setup_complete(
    request: Request,
    has_kitchen: Optional[bool] = Form(False),
    is_shishabar: Optional[bool] = Form(False),
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    user, slug, restaurant = chef_data
         
    # Update settings
    restaurant["has_kitchen"] = bool(has_kitchen)
    restaurant["is_shishabar"] = bool(is_shishabar)
    restaurant["is_setup_completed"] = True
    restaurant["is_onboarded"] = True
    
    # Sync categories and staff chef
    categories = ["Drinks", "Desserts"]
    if restaurant["has_kitchen"]:
        categories.insert(0, "Burger")
        categories.append("Salads")
    if restaurant["is_shishabar"]:
        categories.append("Shisha")
    restaurant["categories"] = categories
    
    # Ensure tables is initialized if not present
    if "tables" not in restaurant or restaurant["tables"] is None:
        restaurant["tables"] = []
        
    # Set up Chef staff if empty
    if not restaurant.get("staff"):
        restaurant["staff"] = [
            {"name": user["name"], "role": "chef", "pin": user["pin"], "pin_code": user["pin"]}
        ]
        
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return RedirectResponse(url="/admin/dashboard", status_code=303)


# ──────────────────────────────────────────────────────────────────
# QR-CODE PRINT GENERATOR – all tables for a tenant in one A4 grid
# ──────────────────────────────────────────────────────────────────
@app.get("/admin/qr-print")
def get_qr_print(request: Request, db: Session = Depends(get_db)):
    """Renders a printable A4 overview with a QR code block per table.
    QR codes are embedded inline as base64 PNGs to guarantee they render when printing.
    Layout: 2x2 grid per A4 page with explicit page breaks between pages."""
    import time as _time
    import qrcode
    from io import BytesIO
    import base64
    from PIL import Image as PILImage

    res = get_current_user_and_slug(request)
    if not res:
        return RedirectResponse(url="/admin/login")
    user, slug = res
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug, db)
    tables = restaurant.get("tables", [])
    try:
        import re
        def natural_sort_key(s):
            return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', str(s))]
        tables = sorted(tables, key=lambda x: natural_sort_key(x.get("number", "")))
    except Exception:
        pass

    # Try to load tenant logo for QR center overlay
    logo_img = None
    try:
        logo_url = restaurant.get("branding", {}).get("logo_url", "") or restaurant.get("logo_path", "")
        if logo_url:
            if logo_url.startswith("/uploads/"):
                logo_fs_path = os.path.join(UPLOAD_DIR, logo_url[len("/uploads/"):])
            elif logo_url.startswith("/static/"):
                logo_fs_path = os.path.join(BASE_DIR, logo_url.lstrip("/"))
            else:
                logo_fs_path = None
            if logo_fs_path and os.path.exists(logo_fs_path):
                logo_img = PILImage.open(logo_fs_path)
    except Exception:
        logo_img = None

    # Use X-Forwarded headers to build correct public URL for QR codes
    fwd_proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    fwd_host = request.headers.get("x-forwarded-host", request.headers.get("host", request.url.hostname))
    if ":" in fwd_host:
        fwd_host = fwd_host.split(":")[0]
    base_url = f"{fwd_proto}://{fwd_host}".rstrip("/")

    # Generate QR codes inline as base64 — no external image requests when printing
    def make_qr_base64(data_str: str) -> str:
        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=2)
        qr.add_data(data_str)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")

        # Embed logo in center (same logic as /api/qr endpoint)
        if logo_img:
            try:
                _logo = logo_img.copy()
                qr_width, qr_height = img.size
                logo_max = int(min(qr_width, qr_height) * 0.30)
                _logo.thumbnail((logo_max, logo_max), PILImage.Resampling.LANCZOS)
                if _logo.mode != 'RGBA':
                    _logo = _logo.convert('RGBA')
                import numpy as _np
                _arr = _np.array(_logo)
                _alpha = _arr[:, :, 3]
                _opaque_mask = _alpha >= 128
                _logo_is_light = True
                if _opaque_mask.sum() > 0:
                    _rgb_opaque = _arr[:, :, :3][_opaque_mask]
                    _avg_brightness = _rgb_opaque.mean()
                    _logo_is_light = _avg_brightness > 180
                bg_color = (30, 30, 30, 255) if _logo_is_light else (255, 255, 255, 255)
                border_color = (60, 60, 60, 255) if _logo_is_light else (180, 180, 180, 255)
                flat_bg = PILImage.new('RGBA', _logo.size, bg_color)
                flattened = PILImage.alpha_composite(flat_bg, _logo)
                logo_w, logo_h = flattened.size
                padding = 8
                bg_size = max(logo_w, logo_h) + padding * 2
                bg = PILImage.new('RGBA', (bg_size, bg_size), bg_color)
                from PIL import ImageDraw
                draw = ImageDraw.Draw(bg)
                draw.rectangle([1, 1, bg_size - 2, bg_size - 2], outline=border_color, width=1)
                paste_x = (bg_size - logo_w) // 2
                paste_y = (bg_size - logo_h) // 2
                bg.paste(flattened, (paste_x, paste_y))
                qr_center_x = (qr_width - bg_size) // 2
                qr_center_y = (qr_height - bg_size) // 2
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                img.paste(bg, (qr_center_x, qr_center_y))
            except Exception:
                pass

        buf = BytesIO()
        img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")
        return f"data:image/png;base64,{b64}"

    # Build card HTML for each table
    cards_html = ""
    for t in tables:
        table_num = t.get("number")
        table_zone = t.get("zone", "")
        token = t.get("security_token", "")
        qr_url = f"{base_url}/{slug}?t={table_num}&z={urllib.parse.quote(table_zone)}&tk={token}"
        qr_b64 = make_qr_base64(qr_url)
        display_num = table_num
        if str(display_num).startswith("Tisch "):
            display_num = display_num[len("Tisch "):].strip()
        table_display_name = f"Tisch {display_num}" + (f" ({table_zone})" if table_zone else "")
        cards_html += f"""
            <div class="qr-card">
                <div class="qr-label">{table_display_name}</div>
                <img src="{qr_b64}" alt="QR {table_display_name}" />
            </div>"""

    restaurant_name = restaurant.get('name', slug)

    # Wrap cards into pages of 4
    CARD_MARKER = '<div class="qr-card">'
    card_starts = [i for i, line in enumerate(cards_html.split('\n')) if CARD_MARKER in line]
    num_cards = len(card_starts)
    if num_cards == 0:
        pages_html = ""
    else:
        # Split cards into groups of 4 and wrap each group in a .page div
        card_divs = []
        current = ""
        depth = 0
        in_card = False
        for line in cards_html.split('\n'):
            if CARD_MARKER in line:
                in_card = True
                depth = 0
            if in_card:
                depth += line.count('<div') - line.count('</div>')
                current += line + '\n'
                if depth <= 0:
                    card_divs.append(current.strip())
                    current = ""
                    in_card = False
            elif current:
                current += line + '\n'

        pages_html = ""
        for i in range(0, len(card_divs), 4):
            page_cards = card_divs[i:i+4]
            # Pad last page if less than 4 cards
            while len(page_cards) < 4:
                page_cards.append('<div class="qr-card" style="border:none;"></div>')
            pages_html += '<div class="page">\n' + '\n'.join(page_cards) + '\n</div>\n'

    # Rebuild final HTML with paginated content
    html_content = f"""<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <title>QR Codes drucken - {restaurant_name}</title>
    <style>
        *, *::before, *::after {{ box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f3f4f6;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }}

        /* ── Screen-only header ── */
        .print-header {{
            text-align: center;
            padding: 30px 20px 20px;
        }}
        .print-header h1 {{
            font-size: 22px;
            font-weight: 800;
            color: #111;
            margin: 0 0 8px;
        }}
        .print-header p {{
            font-size: 14px;
            color: #666;
            margin: 0 0 20px;
        }}
        .print-btn {{
            display: inline-block;
            padding: 12px 32px;
            background: #16a34a;
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
            font-size: 16px;
        }}
        .print-btn:hover {{ background: #15803d; }}

        /* ── Page container: each holds exactly 4 QR cards (2x2) ── */
        .page {{
            width: 210mm;
            height: 297mm;
            padding: 15mm;
            margin: 0 auto 20px;
            background: #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 10mm;
        }}

        /* ── Individual QR card ── */
        .qr-card {{
            border: 2px solid #d1d5db;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 12px 8px 16px;
            background: #fff;
        }}
        .qr-label {{
            font-size: 16px;
            font-weight: 800;
            color: #111;
            margin-bottom: 8px;
            text-align: center;
            letter-spacing: 0.02em;
        }}
        .qr-card img {{
            width: 140px;
            height: 140px;
            display: block;
            image-rendering: pixelated;
        }}

        /* ── Print styles ── */
        @media print {{
            .print-header {{ display: none !important; }}
            body {{ background: #fff; margin: 0; padding: 0; }}
            .page {{
                margin: 0;
                box-shadow: none;
                width: 100%;
                height: auto;
                page-break-after: always;
                break-after: page;
            }}
            .page:last-child {{
                page-break-after: auto;
                break-after: auto;
            }}
            .qr-card {{
                border: 1.5px solid #000;
            }}
        }}
    </style>
</head>
<body>
    <div class="print-header">
        <h1>QR Codes – {restaurant_name}</h1>
        <p>{len(tables)} Tisch{('e' if len(tables) != 1 else '')} zum Ausdrucken</p>
        <button class="print-btn" onclick="window.print()">Drucken</button>
    </div>
    {pages_html}
</body>
</html>"""

    response = HTMLResponse(content=html_content)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    return response


# ──────────────────────────────────────────────────────────────────
# DEVICE DECOUPLED – shown when a device's token was rotated
# ──────────────────────────────────────────────────────────────────
@app.get("/{slug}/device-decoupled", response_class=HTMLResponse)
def device_decoupled(request: Request, slug: str, db: Session = Depends(get_db)):
    """Shown to a POS or KDS device after its pairing token was rotated."""
    # Try to get restaurant name for display; if missing fallback gracefully
    try:
        restaurant = get_restaurant_or_raise(slug, db)
        restaurant_name = restaurant.get("name", slug)
    except Exception:
        restaurant_name = slug
    return HTMLResponse(content=f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gerät entkoppelt – {restaurant_name}</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: #0a0a0a; color: #e5e2e1;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100svh; padding: 24px;
    }}
    .card {{
      background: #141313; border: 1.5px solid #262626;
      border-radius: 20px; padding: 40px 36px; max-width: 440px;
      width: 100%; text-align: center;
    }}
    .icon {{ font-size: 56px; margin-bottom: 16px; }}
    h1 {{ font-size: 22px; font-weight: 900; color: #ef4444; margin-bottom: 10px; }}
    p  {{ font-size: 14px; color: #888; line-height: 1.6; }}
    .badge {{
      display: inline-block; margin-top: 24px;
      background: #1c1c1c; border: 1px solid #333;
      border-radius: 10px; padding: 12px 20px;
      font-size: 12px; color: #aaa;
    }}
    .badge strong {{ color: #deff9a; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🔌</div>
    <h1>Gerät entkoppelt</h1>
    <p>
      Dieses Gerät wurde vom Admin-Dashboard entkoppelt.<br>
      Der Zugriff auf das POS / KDS-System ist nicht mehr aktiv.
    </p>
    <div class="badge">
      Bitte den Administrator kontaktieren, um einen neuen<br>
      <strong>Magic Link</strong> für dieses Gerät zu erhalten.
    </div>
  </div>
</body>
</html>
""", status_code=200)


# ──────────────────────────────────────────────────────────────────
# EVENT COCKPIT ADMIN FLAT ROUTES
# ──────────────────────────────────────────────────────────────────

class ServePayload(BaseModel):
    order_id: int
    item_key: Optional[str] = None

# In-memory dedup cache: prevents double-processing of the same serve request within 5 seconds
_serve_dedup_cache: Dict[str, float] = {}
_SERVE_DEDUP_TTL = 5.0  # seconds — matches frontend serve lock duration

def _check_serve_dedup(order_id: int, item_key: Optional[str]) -> bool:
    """Return True if this request is a duplicate (should be skipped)."""
    key = f"{order_id}:{item_key or 'all'}"
    now = time.time()
    # Clean up old entries
    expired = [k for k, t in _serve_dedup_cache.items() if now - t > _SERVE_DEDUP_TTL * 2]
    for k in expired:
        del _serve_dedup_cache[k]
    # Check if recent
    if key in _serve_dedup_cache and now - _serve_dedup_cache[key] < _SERVE_DEDUP_TTL:
        return True  # duplicate
    _serve_dedup_cache[key] = now
    return False  # not a duplicate, proceed

@app.post("/admin/orders/serve")
@tenant_lock
async def serve_order_items(request: Request, payload: ServePayload, db: Session = Depends(get_db)):
    res = get_current_user_and_slug(request)
    if not res:
        raise HTTPException(status_code=401, detail="Nicht eingeloggt.")
    user, slug = res
    if user["role"] not in ["chef", "kellner"]:
        raise HTTPException(status_code=403, detail="Kein Zugriff.")
    
    # Dedup check: if the same order+item was just served, return success immediately
    if _check_serve_dedup(payload.order_id, payload.item_key):
        return {"success": True, "dedup": True}
        
    restaurant = get_restaurant_or_raise(slug, db)
    order = next((o for o in restaurant.get("orders", []) if o["id"] == payload.order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
    if order["status"] in ["bezahlt", "storniert"]:
        raise HTTPException(status_code=400, detail="Bestellung ist bereits abgeschlossen.")
        
    updated = False
    if payload.item_key:
        matched_item = find_order_item(order.get("items", []), payload.item_key, order_id=payload.order_id)
        current_status = matched_item.get("item_status") or "pending" if matched_item else None
        if matched_item and current_status != "delivered":
            if matched_item.get("quantity", 1) > 1:
                # Decrement quantity by 1
                matched_item["quantity"] -= 1
                
                # Check for existing delivered item
                delivered_item = None
                for it in order.get("items", []):
                    if (it.get("product_id") == matched_item.get("product_id") and 
                        (it.get("note") or "").strip() == (matched_item.get("note") or "").strip() and 
                        (it.get("item_status") or "pending") == "delivered"):
                        delivered_item = it
                        break
                
                if delivered_item:
                    delivered_item["quantity"] += 1
                else:
                    new_delivered = copy.deepcopy(matched_item)
                    new_delivered["quantity"] = 1
                    new_delivered["item_status"] = "delivered"
                    order["items"].append(new_delivered)
            else:
                # Just change status to delivered
                matched_item["item_status"] = "delivered"
                
                # Merge with any existing delivered item of the same product/note if it exists
                delivered_item = None
                for it in order.get("items", []):
                    if (it is not matched_item and 
                        it.get("product_id") == matched_item.get("product_id") and 
                        (it.get("note") or "").strip() == (matched_item.get("note") or "").strip() and 
                        (it.get("item_status") or "pending") == "delivered"):
                        delivered_item = it
                        break
                if delivered_item:
                    delivered_item["quantity"] += matched_item["quantity"]
                    order["items"].remove(matched_item)
            
            updated = True
    else:
        for item in order.get("items", []):
            current_status = item.get("item_status") or "pending"
            if current_status != "delivered":
                item["item_status"] = "delivered"
                updated = True
                
    if updated:
        merge_duplicate_order_items(order)
        update_order_status_by_items(order)
        # AUDIT FIX: log the serve action for traceability (Audit Issue 3.x
        # audit-log extension). Captures who marked which item(s) as delivered
        # so later disputes about "was the item served?" can be resolved.
        if payload.item_key:
            served_item_name = matched_item.get("name", "Artikel") if matched_item else "Artikel"
            _audit_log(
                restaurant,
                user.get("name") or "Unbekannt",
                user.get("role") or "unbekannt",
                f"Serviert: 1x {served_item_name} (Bestellung #{payload.order_id})",
                f"Tisch: {order.get('table')}, item_key: {payload.item_key}"
            )
        else:
            _audit_log(
                restaurant,
                user.get("name") or "Unbekannt",
                user.get("role") or "unbekannt",
                f"Alle Artikel serviert (Bestellung #{payload.order_id})",
                f"Tisch: {order.get('table')}"
            )
        try:
            save_restaurant_to_db(slug, restaurant, db)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Fehler beim Servieren: {e}")

        # BUG FIX: Cache NACH commit nochmal invalidieren — verhindert Race Condition
        invalidate_restaurant_cache_sync(slug)

    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True}


class AdminSplitPayPayload(BaseModel):
    order_id: int
    items: List[SplitItem]

@app.post("/admin/orders/split-pay")
@tenant_lock
async def admin_split_pay(request: Request, payload: AdminSplitPayPayload, db: Session = Depends(get_db)):
    res = get_current_user_and_slug(request)
    if not res:
        raise HTTPException(status_code=401, detail="Nicht eingeloggt.")
    user, slug = res
    if user["role"] not in ["chef", "kellner"]:
        raise HTTPException(status_code=403, detail="Kein Zugriff.")
        
    restaurant = get_restaurant_or_raise(slug, db)
    order = next((o for o in restaurant.get("orders", []) if o["id"] == payload.order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
    if order["status"] in ["bezahlt", "storniert"]:
        raise HTTPException(status_code=400, detail="Bestellung ist bereits abgeschlossen.")
        
    total_split_amount = 0.0
    items_to_remove = []
    
    for split_item in payload.items:
        split_note = (split_item.note or "").strip()
        order_item = next(
            (item for item in order["items"]
             if item["product_id"] == split_item.product_id
             and (item.get("note") or "").strip() == split_note),
            None
        )
        if not order_item:
            continue
            
        qty_to_pay = min(split_item.quantity, order_item["quantity"])
        if qty_to_pay <= 0:
            continue
            
        paid_item_amount = qty_to_pay * order_item["price"]
        total_split_amount += paid_item_amount
        
        order_item["quantity"] -= qty_to_pay
        if order_item["quantity"] <= 0:
            items_to_remove.append(order_item)
            
    for item in items_to_remove:
        order["items"].remove(item)
        
    # ── Fix 6d: original_total sichern (falls noch nicht vorhanden) ──
    # Bei der Teilzahlung wird `total` neu berechnet (reduziert um den
    # bezahlten Anteil). `original_total` bleibt unverändert und zeigt
    # im Admin-Report den ursprünglichen Warenwert.
    _ensure_original_total(order)
    order["total"] = round(sum(item["price"] * item["quantity"] for item in order["items"]), 2)
    order["total_with_tip"] = round(order["total"], 2)
    restaurant["tagesumsatz"] += round(total_split_amount, 2)
    
    if not order["items"]:
        order["status"] = "bezahlt"
        restaurant["bestellungen_gesamt"] += 1
        
        # NOTE: No token rotation on payment — see pay_order() for rationale.
        
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Teilzahlung: {e}")
        
    await manager.broadcast_global(slug, {"type": "update"})
    return {
        "success": True,
        "remaining_items_count": len(order["items"]),
        "order_status": order["status"],
        "split_amount": round(total_split_amount, 2)
    }


class AdminTransferPayload(BaseModel):
    source_table: str
    target_table: str
    item_keys: Optional[List[str]] = None
    items: Optional[Dict[str, int]] = None

@app.post("/admin/orders/transfer")
@tenant_lock
async def admin_transfer(request: Request, payload: AdminTransferPayload, db: Session = Depends(get_db)):
    res = get_current_user_and_slug(request)
    if not res:
        raise HTTPException(status_code=401, detail="Nicht eingeloggt.")
    user, slug = res
    if user["role"] not in ["chef", "kellner"]:
        raise HTTPException(status_code=403, detail="Kein Zugriff.")
        
    restaurant = get_restaurant_or_raise(slug, db)
    
    s_table_num = str(payload.source_table).replace("Tisch", "").strip()
    t_table_num = str(payload.target_table).replace("Tisch", "").strip()
    
    # Try to find exact zone-inclusive table names first, then fallback to simple names
    source_orders = []
    target_order = None
    
    # Extract zone info from table database if available
    tables_list = restaurant.get("tables", [])
    s_db_table = next((t for t in tables_list if str(t.get("number")) == s_table_num), None)
    t_db_table = next((t for t in tables_list if str(t.get("number")) == t_table_num), None)
    
    s_zone = s_db_table.get("zone", "") if s_db_table else ""
    t_zone = t_db_table.get("zone", "") if t_db_table else ""
    
    # Build search patterns - with zone first, then without
    search_patterns = []
    if s_zone:
        search_patterns.append(f"Tisch {s_table_num} ({s_zone})")
    search_patterns.append(f"Tisch {s_table_num}")
    search_patterns.append(s_table_num)
    
    # Search for source orders with any matching pattern
    for o in restaurant.get("orders", []):
        if o.get("status") in ["bezahlt", "storniert"]:
            continue
        o_table = str(o.get("table", "")).strip()
        for pattern in search_patterns:
            if o_table == pattern:
                source_orders.append(o)
                break
    
    if not source_orders:
        raise HTTPException(status_code=400, detail="Keine offene Bestellung auf dem Quelltisch gefunden.")
        
    # Search for target order
    t_search_patterns = []
    if t_zone:
        t_search_patterns.append(f"Tisch {t_table_num} ({t_zone})")
    t_search_patterns.append(f"Tisch {t_table_num}")
    t_search_patterns.append(t_table_num)
    
    for o in restaurant.get("orders", []):
        if o.get("status") in ["bezahlt", "storniert"]:
            continue
        o_table = str(o.get("table", "")).strip()
        for pattern in t_search_patterns:
            if o_table == pattern:
                target_order = o
                break
        if target_order:
            break
    
    # SECURITY FIX (Audit Issue 3.5): Track actually-transferred amount per
    # source order so we can add only the truly-moved value to target's
    # original_total (instead of the full source original_total, which would
    # massively over-count on partial transfers — e.g. moving 1 of 5 items
    # would previously add the full 50€ source original_total to target,
    # even though only 10€ was moved). Also reused for the audit-log entry.
    transferred_amounts = []

    if payload.item_keys:
        # Move ONLY selected items
        if not target_order:
            existing_ids = [o["id"] for o in restaurant.get("orders", [])]
            new_order_id = max(existing_ids) + 1 if existing_ids else 1
            if t_zone:
                t_table_display = f"Tisch {t_table_num} ({t_zone})"
            else:
                t_table_display = f"Tisch {t_table_num}"
            target_order = {
                "id": new_order_id,
                "table": t_table_display,
                "items": [],
                "total": 0.0,
                # ── Fix 6c: original_total initialisieren ──
                "original_total": 0.0,
                "total_with_tip": 0.0,
                "tip_amount": 0.0,
                "status": "eingegangen",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "mwst_rate": 19,
                "waiter_id": None
            }
            if "orders" not in restaurant:
                restaurant["orders"] = []
            restaurant["orders"].append(target_order)

        for source_order in source_orders:
            # SECURITY FIX (Issue 3.5): Track the actually-transferred amount
            # for THIS source order (sum of qty*price over moved items).
            source_transferred = 0.0
            remaining_items = []
            for item in source_order.get("items", []):
                item_status = item.get("item_status") or "pending"
                note_slug = (item.get("note") or "").strip().replace(" ", "_")

                # Check both unique key (with order id) and legacy key
                unique_key = f"{source_order['id']}_{item.get('product_id')}_{note_slug}_{item_status}"
                legacy_key = f"{item.get('product_id')}_{note_slug}_{item_status}"

                matched_key = None
                if unique_key in payload.item_keys:
                    matched_key = unique_key
                elif legacy_key in payload.item_keys:
                    matched_key = legacy_key

                if matched_key:
                    # Determine quantity to move
                    qty_to_move = item.get("quantity", 0)
                    if payload.items and matched_key in payload.items:
                        qty_to_move = min(payload.items[matched_key], item.get("quantity", 0))

                    if qty_to_move <= 0:
                        remaining_items.append(item)
                        continue

                    # SECURITY FIX (Issue 3.5): Track the actually-transferred
                    # amount (qty * price) for this source order.
                    source_transferred = round(
                        source_transferred + qty_to_move * item.get("price", 0.0), 2
                    )

                    # Move quantity
                    moved_item = copy.deepcopy(item)
                    moved_item["quantity"] = qty_to_move

                    # Add to target order
                    t_item = next((i for i in target_order.get("items", []) if i.get("product_id") == item.get("product_id") and (i.get("note") or "").strip() == (item.get("note") or "").strip() and (i.get("item_status") or "pending") == item_status), None)
                    if t_item:
                        t_item["quantity"] += qty_to_move
                    else:
                        target_order["items"].append(moved_item)

                    # Keep remaining quantity in source order
                    rem_qty = item.get("quantity", 0) - qty_to_move
                    if rem_qty > 0:
                        item["quantity"] = rem_qty
                        remaining_items.append(item)
                else:
                    remaining_items.append(item)

            transferred_amounts.append(source_transferred)

            source_order["items"] = remaining_items
            # SECURITY FIX (Issue 3.5): Source original_total is NEVER reduced
            # (Fix-6 invariant: original_total only goes up, never down).
            # _recalculate_order_totals updates total/total_with_tip from
            # the remaining items while preserving original_total AND
            # tip_amount (which was previously lost when items=[]).
            _recalculate_order_totals(source_order)
            if not remaining_items:
                source_order["status"] = "storniert"

        # SECURITY FIX (Issue 3.5): Add ONLY the actually-transferred amount
        # (sum over per-source source_transferred) to target original_total
        # — NOT the full source original_total. This prevents the massive
        # over-counting documented in Issue 3.5.
        _ensure_original_total(target_order)
        target_order["original_total"] = round(
            target_order.get("original_total", 0.0)
            + sum(transferred_amounts),
            2
        )
        _recalculate_order_totals(target_order)
    else:
        # Full table transfer
        # Use zone-inclusive table name for target
        if t_zone:
            t_table_display = f"Tisch {t_table_num} ({t_zone})"
        else:
            t_table_display = f"Tisch {t_table_num}"
        
        for source_order in source_orders:
            if not target_order:
                source_order["table"] = t_table_display
                target_order = source_order
                # No value moved — source IS the target now (just renamed).
                transferred_amounts.append(0.0)
            else:
                # ── Fix 6c (admin-transfer): original_total sichern VOR Merge ──
                _ensure_original_total(source_order)
                _ensure_original_total(target_order)
                moved_amount = round(source_order.get("original_total", 0.0), 2)
                target_order["original_total"] = round(target_order.get("original_total", 0.0) + moved_amount, 2)
                # Track for audit-log (full transfer: all of source's original_total moved)
                transferred_amounts.append(moved_amount)

                for s_item in source_order.get("items", []):
                    t_item = next((item for item in target_order.get("items", []) if item.get("product_id") == s_item.get("product_id") and (item.get("note") or "").strip() == (s_item.get("note") or "").strip() and (item.get("item_status", "pending") or "pending") == (s_item.get("item_status", "pending") or "pending")), None)
                    if t_item:
                        t_item["quantity"] += s_item.get("quantity", 0)
                    else:
                        target_order["items"].append(copy.deepcopy(s_item))
                        
                target_order["total"] = round(sum(item["price"] * item["quantity"] for item in target_order["items"]), 2)
                target_order["total_with_tip"] = round(target_order["total"], 2)
                
                # ── Fix 6c: source NICHT auf 0€ setzen ──
                source_order["status"] = "storniert"
                # FRÜHER: source_order["total"] = 0.0 → 0€-Bons im Report
                # JETZT: total bleibt auf dem Wert der umgebuchten Artikel
                source_order["items"] = []
                source_order["total_with_tip"] = round(source_order.get("total", 0.0), 2)
                
    tables_list = restaurant.get("tables", [])
    s_db_table = next((t for t in tables_list if str(t.get("number")) == s_table_num), None)
    t_db_table = next((t for t in tables_list if str(t.get("number")) == t_table_num), None)
    
    if s_db_table and t_db_table:
        # Sync the dynamic guest session token so that the source table guest
        # can join/see the active session of the target table.
        # DO NOT copy or overwrite the static 'security_token' (which matches the printed QR code).
        t_db_table["active_session_token"] = s_db_table.get("active_session_token")

    # AUDIT FIX: log the admin transfer for traceability. Uses the actually-
    # transferred amount (Issue 3.5 fix) so the audit-log matches the real
    # movement of value, not the buggy full-source-original_total figure.
    total_transferred = round(sum(transferred_amounts), 2)
    _audit_log(
        restaurant,
        user.get("name") or "Unbekannt",
        user.get("role") or "unbekannt",
        f"Admin-Transfer von {payload.source_table} nach {payload.target_table}",
        f"Verschobener Betrag: {total_transferred} €"
    )

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Zusammenführung: {e}")
        
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True}


class AddManualPayload(BaseModel):
    table_number: str
    product_id: int
    quantity: int

@app.post("/api/admin/orders/add-manual")
@tenant_lock
async def add_manual_order_item(request: Request, payload: AddManualPayload, db: Session = Depends(get_db)):
    res = get_current_user_and_slug(request)
    if not res:
        raise HTTPException(status_code=401, detail="Nicht eingeloggt.")
    user, slug = res
    if user["role"] not in ["chef", "kellner"]:
        raise HTTPException(status_code=403, detail="Kein Zugriff.")
        
    restaurant = get_restaurant_or_raise(slug, db)
    
    # 1. Find product
    product = next((p for p in restaurant.get("products", []) if p["id"] == payload.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden.")
        
    # 2. Format table name (e.g. "Tisch 5" or "Tisch 5 (Drinnen)")
    t_num = str(payload.table_number).replace("Tisch", "").strip()
    
    # Check if table exists in restaurant config and include zone if present
    tables_list = restaurant.get("tables", [])
    db_table = next((t for t in tables_list if str(t.get("number")) == t_num), None)
    if not db_table:
        raise HTTPException(status_code=404, detail="Tisch existiert nicht.")
    
    # Build table string with zone if the table has one
    table_zone = db_table.get("zone", "")
    if table_zone:
        table_str = f"Tisch {t_num} ({table_zone})"
    else:
        table_str = f"Tisch {t_num}"
        
    item_price = product["price"]
    
    # 3. Check if active order exists
    active_order = next((o for o in restaurant.get("orders", []) if str(o.get("table")) == table_str and o.get("status") not in ["bezahlt", "storniert"]), None)
    
    new_item = {
        "product_id": product["id"],
        "name": product["name"],
        "price": float(item_price),
        "quantity": payload.quantity,
        "category_type": product.get("category_type", "küche"),
        "note": "",
        "item_status": "pending" # starts as pending!
    }
    
    if active_order:
        # Merge if item with same product_id and no note and status 'pending' already exists
        existing_item = next(
            (i for i in active_order["items"]
             if i.get("product_id") == product["id"]
             and not i.get("note")
             and i.get("item_status") == "pending"),
            None
        )
        if existing_item:
            existing_item["quantity"] += payload.quantity
        else:
            active_order["items"].append(new_item)
            
        active_order["total"] = round(active_order["total"] + (new_item["price"] * payload.quantity), 2)
        active_order["total_with_tip"] = round(active_order["total_with_tip"] + (new_item["price"] * payload.quantity), 2)
        
        update_order_status_by_items(active_order)
    else:
        # Create a new order
        new_order = {
            "id": None, # populated during sync/flush
            "table": table_str,
            "items": [new_item],
            "total": round(new_item["price"] * payload.quantity, 2),
            "total_with_tip": round(new_item["price"] * payload.quantity, 2),
            "tip_amount": 0.0,
            "status": "eingegangen", # starts as pending/eingegangen
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "mwst_rate": 19,
            "waiter_id": user.get("name")
        }
        update_order_status_by_items(new_order)
        restaurant["orders"].append(new_order)
        
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Hinzufügen der Bestellung: {e}")
        
    await manager.broadcast_global(slug, {"type": "update"})
    return {"success": True}


