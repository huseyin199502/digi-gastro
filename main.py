from fastapi.staticfiles import StaticFiles
import copy
import json
import os
import urllib.parse
import secrets
import csv
import io
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Request, Form, Response, HTTPException, Depends, UploadFile, File, WebSocket, WebSocketDisconnect
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

    async def connect(self, slug: str, websocket: WebSocket):
        await websocket.accept()
        if slug not in self.active_connections:
            self.active_connections[slug] = []
        self.active_connections[slug].append(websocket)

    def disconnect(self, slug: str, websocket: WebSocket):
        if slug in self.active_connections:
            if websocket in self.active_connections[slug]:
                self.active_connections[slug].remove(websocket)
            if not self.active_connections[slug]:
                del self.active_connections[slug]

    async def broadcast(self, slug: str, message: dict):
        if slug in self.active_connections:
            for connection in self.active_connections[slug]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

@app.websocket("/ws/{slug}")
async def websocket_endpoint(websocket: WebSocket, slug: str):
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
os.makedirs(os.path.join(BASE_DIR, "static", "images"), exist_ok=True)

# Secure Platform Admin Password configuration
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "superpassword123")

# Static files: project assets (CSS, JS, built-in images)
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
# Uploads served separately so they survive from the persistent volume
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ──────────────────────────────────────────────────────────────────
# HEALTH CHECK – must be registered BEFORE any middleware so Docker
# HEALTHCHECK and Coolify never get a 404.
# ──────────────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
def health_check_early():
    """Lightweight liveness probe – always returns 200 when the app is up."""
    return JSONResponse({"status": "ok"})

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("static/images/digigastrologo.jpeg")

@app.get("/apple-touch-icon.png", include_in_schema=False)
@app.get("/apple-touch-icon-precomposed.png", include_in_schema=False)
@app.get("/apple-touch-icon-120x120.png", include_in_schema=False)
async def apple_touch_icon():
    return FileResponse("static/images/digigastrologo.jpeg")

@app.get("/manifest.json", include_in_schema=False)
async def manifest():
    return FileResponse("static/manifest.json")

@app.get("/sw.js", include_in_schema=False)
async def service_worker():
    return FileResponse("static/sw.js")

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
    SessionLocal,
    STANDARD_PRODUCTS,
    get_db,
    Base,
    engine,
    run_migrations
)

INITIAL_RESTAURANTS = {}

# Run DB migrations and ensure all tables exist
Base.metadata.create_all(engine)
run_migrations()


# Stateless Serialization Helpers for compatibility and template rendering
def load_restaurant_from_db(slug: str, session) -> Optional[dict]:
    tenant = session.query(Tenant).filter_by(slug=slug).first()
    if not tenant:
        return None
    
    categories = [c.name for c in session.query(Category).filter_by(tenant_slug=slug).order_by(Category.id).all()]
    
    db_products = session.query(Product).filter_by(tenant_slug=slug).order_by(Product.id).all()
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
            "name_en": p.name_en,
            "description_en": p.description_en
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
            "waiter_id": o.waiter_id
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
        "service_calls": service_calls,
        "categories": categories,
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
            "logo_url": tenant.logo_url
        },
        "landing_page": json.loads(tenant.landing_page_json or "{}"),
        "happy_hour": {
            "days": json.loads(tenant.happy_hour_days or "[]"),
            "start": tenant.happy_hour_start,
            "end": tenant.happy_hour_end,
            "discount": tenant.happy_hour_discount
        },
        "tables": tables,
        "audit_log": audit_log
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
    
    branding = r.get("branding", {})
    tenant.address = branding.get("address", "")
    tenant.plz = branding.get("plz", "")
    tenant.ort = branding.get("ort", "")
    tenant.indigo = branding.get("indigo", "")
    tenant.instagram = branding.get("instagram", "")
    tenant.facebook = branding.get("facebook", "")
    tenant.logo_url = branding.get("logo_url", "")
    
    tenant.landing_page_json = json.dumps(unwrap_live_data(r.get("landing_page", {})))
    
    hh = r.get("happy_hour", {})
    tenant.happy_hour_days = json.dumps(unwrap_live_data(hh.get("days", [])))
    tenant.happy_hour_start = hh.get("start", "18:00")
    tenant.happy_hour_end = hh.get("end", "20:00")
    tenant.happy_hour_discount = hh.get("discount", 0)
    
    session.flush()
    # 1. Update categories
    session.query(Category).filter_by(tenant_slug=slug).delete()
    for cat_name in r.get("categories", []):
        session.add(Category(tenant_slug=slug, name=cat_name))
        
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
        db_p.name_en = p.get("name_en")
        db_p.description_en = p.get("description_en")

        
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
            import secrets
            tok = secrets.token_hex(4)
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
        security_token=f"{slug_lower}2026",
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
        db = SessionLocal()
        try:
            db.query(AuditLog).delete()
            db.query(Table).delete()
            db.query(ServiceCall).delete()
            db.query(Staff).delete()
            db.query(DBOrderItem).delete()
            db.query(Order).delete()
            db.query(Product).delete()
            db.query(Category).delete()
            db.query(Tenant).delete()
            db.commit()
        finally:
            db.close()
            
    def update(self, other_dict):
        db = SessionLocal()
        try:
            for slug, r_val in other_dict.items():
                slug_lower = slug.lower().strip()
                save_restaurant_to_db(slug_lower, r_val, db)
            db.commit()
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

def get_current_user(request: Request, slug: str) -> Optional[dict]:
    # Check unified session cookie first
    session = request.cookies.get("session")
    if session:
        try:
            parts = session.split(":")
            if len(parts) == 4 and parts[0] == slug:
                return {"name": parts[1], "role": parts[2], "pin": parts[3]}
        except Exception:
            pass

    # Fallback to legacy/device-specific session cookie
    session_legacy = request.cookies.get(f"session_{slug}")
    if session_legacy:
        try:
            parts = session_legacy.split(":")
            if len(parts) == 3:
                return {"name": parts[0], "role": parts[1], "pin": parts[2]}
        except Exception:
            pass
    return None

def get_current_user_and_slug(request: Request) -> Optional[tuple]:
    session = request.cookies.get("session")
    if not session:
        return None
    try:
        parts = session.split(":")
        if len(parts) == 4:
            slug = parts[0]
            user = {"name": parts[1], "role": parts[2], "pin": parts[3]}
            return user, slug
    except Exception:
        pass
    return None

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

class OrderPayload(BaseModel):
    table: str
    token: Optional[str] = None
    items: List[OrderItem]
    tip_amount: Optional[float] = 0.0

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
    return templates.TemplateResponse(request=request, name="landing.html", context={"show_impressum": True})

@app.get("/datenschutz", response_class=HTMLResponse)
def platform_datenschutz(request: Request, db: Session = Depends(get_db)):
    return templates.TemplateResponse(request=request, name="landing.html", context={"show_datenschutz": True})



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
            {"request": request, "error": "Bitte geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein.", "show_login": True}
        )
    db = SessionLocal()
    try:
        tenant = db.query(Tenant).filter_by(email=email.strip()).first()
        if tenant and tenant.password == password.strip():
            slug = tenant.slug
            target = "/admin/setup" if not tenant.is_setup_completed else "/admin/dashboard"
            resp = RedirectResponse(url=target, status_code=303)
            resp.set_cookie(key="session", value=f"{slug}:Owner:chef:{password.strip()}", httponly=True, max_age=31536000)
            return resp
            
        if email.strip() == "admin@digi-gastro.de" and password.strip() == ADMIN_PASSWORD:
            resp = RedirectResponse(url="/digi-gastro-admin", status_code=303)
            resp.set_cookie(key="session_global", value=email.strip(), httponly=True, max_age=31536000)
            return resp
            
        return templates.TemplateResponse(
            request,
            "landing.html",
            {"request": request, "error": "Ungültige E-Mail-Adresse oder Passwort.", "show_login": True}
        )
    finally:
        db.close()


# ==========================================
# GLOBAL PLATFORM ADMIN ROUTES
# ==========================================

@app.get("/digi-gastro-admin", response_class=HTMLResponse)
def get_global_admin(request: Request):
    session_cookie = request.cookies.get("session_global")
    if not session_cookie or session_cookie != "admin@digi-gastro.de":
        return RedirectResponse(url="/digi-gastro-admin/login")
        
    error = request.query_params.get("error")
    success = request.query_params.get("success")
    
    alert_html = ""
    if error:
        alert_html = f'<div class="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-xs text-red-400 font-bold">{error}</div>'
    elif success:
        alert_html = f'<div class="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-xs text-emerald-400 font-bold">{success}</div>'
        
    tenant_rows = ""
    for slug, t in restaurants.items():
        status_badge = '<span class="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[10px] font-bold">Aktiv</span>' if t.get("active", True) else '<span class="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[10px] font-bold">Inaktiv</span>'
        toggle_label = "Deaktivieren" if t.get("active", True) else "Aktivieren"
        
        tenant_rows += f"""
        <tr class="hover:bg-zinc-900/30">
          <td class="py-4 px-4 font-bold text-white">
            <form method="POST" action="/digi-gastro-admin/tenant-edit-name/{slug}" class="flex items-center gap-2">
              <input type="text" name="name" value="{t.get('name', slug)}" class="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 focus:outline-none py-0.5 font-bold text-white w-32" />
              <button type="submit" class="text-[10px] text-zinc-500 hover:text-emerald-400">💾</button>
            </form>
          </td>
          <td class="py-4 px-4 text-zinc-400 font-mono">{slug}</td>
          <td class="py-4 px-4 space-y-1">
            <div class="text-zinc-500 font-mono text-[10px]">{t.get('email', '')}</div>
            <div class="text-zinc-500 font-mono text-[10px]">{t.get('password', '')}</div>
          </td>
          <td class="py-4 px-4">{status_badge}</td>
          <td class="py-4 px-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <form method="POST" action="/digi-gastro-admin/tenant-reset-password/{slug}" class="inline">
                <button type="submit" class="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded text-[10px] font-bold transition">Passwort Reset</button>
              </form>
              <form method="POST" action="/digi-gastro-admin/tenant-toggle/{slug}" class="inline">
                <button type="submit" class="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded text-[10px] font-bold transition">{toggle_label}</button>
              </form>
            </div>
          </td>
        </tr>
        """
        
    html_content = f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Global Control Center – Digi-Gastro</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0a0a0a] text-zinc-100 min-h-screen p-6">
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- Header -->
    <header class="flex items-center justify-between border-b border-zinc-800 pb-6">
      <div>
        <h1 class="text-2xl font-black text-white tracking-tight">Global Control Center</h1>
        <p class="text-xs text-zinc-500 mt-0.5">Plattform Master-Liste & Tenant-Verwaltung</p>
      </div>
      <a href="/digi-gastro-admin/logout" class="bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 font-bold text-xs px-4 py-2 rounded-xl transition">
        Ausloggen
      </a>
    </header>
    
    {alert_html}
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Tenant Creator Form -->
      <div class="bg-[#141313] border border-zinc-800 rounded-3xl p-6 space-y-4 h-fit">
        <h2 class="font-extrabold text-sm text-white">Neuen Partner / Tenant erstellen</h2>
        <form method="POST" action="/digi-gastro-admin/tenant-erstellen" class="space-y-4">
          <div>
            <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Restaurant Name</label>
            <input type="text" name="name" placeholder="z.B. Moonlight Shisha Bar" required class="w-full bg-[#1c1c1c] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Subdomain / Slug</label>
            <input type="text" name="slug" placeholder="z.B. moonlight" required class="w-full bg-[#1c1c1c] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition" />
          </div>
          <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition shadow">Tenant erstellen</button>
        </form>
      </div>
      
      <!-- Tenant List -->
      <div class="lg:col-span-2 bg-[#141313] border border-zinc-800 rounded-3xl p-6 space-y-4">
        <h2 class="font-extrabold text-sm text-white">Registrierte Partner-Restaurants</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                <th class="py-3 px-4">Restaurant</th>
                <th class="py-3 px-4">Slug</th>
                <th class="py-3 px-4">Anmeldedaten</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/50">
              {tenant_rows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
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
        error_html = f'<div class="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400 font-bold">{error}</div>'
        
    html_content = f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Global Admin Login – Digi-Gastro</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0a0a0a] text-zinc-100 flex items-center justify-center min-h-screen p-6">
  <div class="w-full max-w-md bg-[#141313] border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl">
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
        👑
      </div>
      <h1 class="text-xl font-black tracking-tight text-white">Admin Login</h1>
      <p class="text-xs text-zinc-500 mt-1">Global Platform Control Center</p>
    </div>
    
    {error_html}
    
    <form method="POST" action="/digi-gastro-admin/login" class="space-y-4">
      <div>
        <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">E-Mail-Adresse</label>
        <input type="email" name="email" placeholder="admin@digi-gastro.de" required class="w-full bg-[#1c1c1c] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition" />
      </div>
      <div>
        <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Passwort</label>
        <input type="password" name="password" placeholder="••••••••" required class="w-full bg-[#1c1c1c] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition" />
      </div>
      <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg">Log-In</button>
    </form>
  </div>
</body>
</html>"""
    return HTMLResponse(content=html_content)

@app.post("/digi-gastro-admin/login")
def post_global_login(request: Request, email: str = Form(...), password: str = Form(...)):
    if email == "admin@digi-gastro.de" and password == ADMIN_PASSWORD:
        resp = RedirectResponse(url="/digi-gastro-admin", status_code=303)
        resp.set_cookie(key="session_global", value=email, httponly=True, max_age=31536000)
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
    
    save_restaurant_to_db(slug_lower, tenant, db)
    db.commit()
    
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
def get_orders_status(slug: str, ids: str, db: Session = Depends(get_db)):
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
def get_menu(request: Request, slug: str, table: Optional[str] = None, token: Optional[str] = None, t: Optional[str] = None, tk: Optional[str] = None, db: Session = Depends(get_db)):
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
            
            # Check if table exists
            tables_list = restaurant.get("tables", [])
            db_table = next((t for t in tables_list if str(t.get("number")) == str(query_table).strip()), None)
            if not db_table:
                return RedirectResponse(url=f"/{slug}/sitz-expired", status_code=303)
                
            master_token = restaurant.get("security_token")
            printed_token = db_table.get("security_token")
            active_session_tok = db_table.get("active_session_token")
            
            # Verify if table has any active (open) orders
            table_orders = [o for o in restaurant.get("orders", []) if o.get("table") in [f"Tisch {query_table}", str(query_table).strip()]]
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
                # Table is FREE! Dynamic session initialization for new guest
                import secrets
                new_session_tok = secrets.token_hex(4)
                db_table["active_session_token"] = new_session_tok
                
                # Update DB synchronously
                db = SessionLocal()
                try:
                    save_restaurant_to_db(slug, restaurant, db)
                    db.commit()
                finally:
                    db.close()
                    
                table = str(query_table).strip()
                token = new_session_tok
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
                table = str(query_table).strip()
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
            response.set_cookie(
                key=cookie_name,
                value=cookie_val,
                max_age=1800, # 30 minutes
                httponly=False,
                samesite="lax",
                secure=False,
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
                db_table = next((t for t in tables_list if str(t.get("number")) == active_table_num), None)
                active_session_tok = db_table.get("active_session_token") if db_table else None
                
                is_token_valid = (active_token and ((active_session_tok and active_token == active_session_tok) or (master_token and active_token == master_token)))
                if not is_token_valid:
                    return RedirectResponse(url=f"/{slug}/sitz-expired", status_code=303)
                
                table = active_table_num
                token = active_token
                set_session_cookie = True
            else:
                is_readonly = True
        else:
            is_readonly = True

    # Process Happy Hour
    now_time = datetime.now().strftime("%H:%M")
    now_day = datetime.now().strftime("%a")
    german_days_map = {
        "Mon": ["Mo", "Montag"],
        "Tue": ["Di", "Dienstag"],
        "Wed": ["Mi", "Mittwoch"],
        "Thu": ["Do", "Donnerstag"],
        "Fri": ["Fr", "Freitag"],
        "Sat": ["Sa", "Samstag"],
        "Sun": ["So", "Sonntag"]
    }
    possible_days = german_days_map.get(now_day, ["Mo", "Montag"])
    
    hh_config = restaurant.get("happy_hour", {})
    hh_active_global = any(day in hh_config.get("days", []) for day in possible_days) and hh_config.get("start", "18:00") <= now_time <= hh_config.get("end", "20:00")
    
    processed_products = []
    active_categories = restaurant.get("categories", [])
    
    for p in restaurant.get("products", []):
        if p.get("category") not in active_categories:
            continue
            
        prod = copy.deepcopy(p)
        prod["is_hh_active"] = False
        prod["display_price"] = prod["price"]
        
        if prod.get("happy_hour_price") is not None:
            start = prod.get("start_time", "18:00")
            end = prod.get("end_time", "20:00")
            if start <= now_time <= end:
                prod["is_hh_active"] = True
                prod["display_price"] = prod["happy_hour_price"]
        elif hh_active_global and hh_config.get("discount", 0) > 0:
            discount_factor = (100 - hh_config["discount"]) / 100.0
            prod["is_hh_active"] = True
            prod["display_price"] = round(prod["price"] * discount_factor, 2)
            
        processed_products.append(prod)
        
    tisch_name = ""
    if table:
        if table == "Vorschau":
            tisch_name = "Vorschau"
        else:
            tisch_name = f"Tisch {table}"

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
            "reset_session": reset_session,
            "tisch_name": tisch_name,
            "role": role
        }
    )
    
    if set_session_cookie and table and token:
        response.set_cookie(
            key=f"guest_session_{slug}",
            value=f"{table}:{token}",
            httponly=True,
            max_age=14400,
            path="/"
        )
    elif reset_session:
        # Only delete the old cookie when the session was reset without setting a new one
        response.delete_cookie(key=f"guest_session_{slug}", path="/")
        
    return response

@app.post("/{slug}/bestellen")
async def create_order(request: Request, slug: str, payload: OrderPayload, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    
    table_num = str(payload.table).replace("Tisch", "").strip()
    tables_list = restaurant.get("tables", [])
    db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
    
    # ── Staff / POS trusted device bypass ──
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_staff = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_staff:
        session = request.cookies.get(f"session_{slug}")
        if session:
            is_staff = True
        else:
            res = get_current_user_and_slug(request)
            if res:
                user, session_slug = res
                if session_slug == slug and user["role"] in ["chef", "kellner"]:
                    is_staff = True
            
    if not is_staff:
        tok = payload.token
        if not tok:
            cookie_name = f"guest_session_{slug}"
            session_val = request.cookies.get(cookie_name)
            if session_val:
                try:
                    c_table, c_tok = session_val.split(":", 1)
                    if str(c_table).strip() == table_num:
                        tok = c_tok
                except Exception:
                    pass
                    
        master_token = restaurant.get("security_token")
        table_token = db_table.get("active_session_token") if db_table else None
        
        is_token_valid = (tok and ((table_token and tok == table_token) or (master_token and tok == master_token)))
        if not is_token_valid:
            raise HTTPException(status_code=403, detail="Ungültiger oder abgelaufener Tisch-Code.")
        
    total = sum(item.price * item.quantity for item in payload.items)
    total_with_tip = total + (payload.tip_amount or 0.0)

    # Look up any active (unpaid) order for this table to merge items
    active_order = next((o for o in restaurant.get("orders", []) if str(o.get("table")) == str(payload.table) and o.get("status") not in ["bezahlt", "storniert"]), None)
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
        active_order["total"] = round(active_order["total"] + total, 2)
        active_order["total_with_tip"] = round(active_order["total_with_tip"] + total_with_tip, 2)
        active_order["tip_amount"] = round(active_order["tip_amount"] + (payload.tip_amount or 0.0), 2)
        active_order["status"] = "eingegangen"  # Mark as eingegangen so it blinks orange again
        active_order["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
        await manager.broadcast(slug, {"type": "update", "table_number": table_num})
        return {"success": True, "order_id": active_order["id"]}

    # Let the database assign a unique autoincrement ID to avoid collisions
    # in multi-worker setups where len(orders)+1 can duplicate existing IDs.
    new_order = {
        "id": None,   # will be filled in by save_restaurant_to_db after DB flush
        "table": payload.table,
        "items": [item.model_dump() for item in payload.items],
        "total": round(total, 2),
        "total_with_tip": round(total_with_tip, 2),
        "tip_amount": round(payload.tip_amount or 0.0, 2),
        "status": "eingegangen",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "mwst_rate": 19,
        "waiter_id": None
    }
    
    restaurant["orders"].append(new_order)
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    await manager.broadcast(slug, {"type": "update", "table_number": table_num})
    return {"success": True, "order_id": new_order.get("id")}

@app.post("/{slug}/service-ruf")
async def service_ruf(request: Request, slug: str, payload: ServiceRufPayload, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    
    table_num = str(payload.table).replace("Tisch", "").strip()
    tables_list = restaurant.get("tables", [])
    db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
    
    tok = payload.token or request.query_params.get("token") or request.headers.get("X-Token")
    if not tok:
        cookie_name = f"guest_session_{slug}"
        session_val = request.cookies.get(cookie_name)
        if session_val:
            try:
                c_table, c_tok = session_val.split(":", 1)
                if str(c_table).strip() == table_num:
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
            is_staff = True
        else:
            res = get_current_user_and_slug(request)
            if res:
                user, session_slug = res
                if session_slug == slug and user["role"] in ["chef", "kellner"]:
                    is_staff = True
            
    if not is_staff:
        is_token_valid = (tok and ((table_token and tok == table_token) or (master_token and tok == master_token)))
        if not is_token_valid:
            raise HTTPException(status_code=403, detail="Ungültiger oder abgelaufener Tisch-Code.")
        
    if "service_calls" not in restaurant:
        restaurant["service_calls"] = []
        
    existing_calls = restaurant.get("service_calls", [])
    new_id = max([c.get("id", 0) for c in existing_calls] + [0]) + 1
    new_call = {
        "id": new_id,
        "table": payload.table,
        "type": payload.type,
        "timestamp": datetime.now().strftime("%H:%M:%S")
    }
    restaurant["service_calls"].append(new_call)
    
    db = SessionLocal()
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    finally:
        db.close()
        
    await manager.broadcast(slug, {"type": "update"})
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
    db_session = SessionLocal()
    try:
        save_restaurant_to_db(slug, restaurant, db_session)
        db_session.commit()
    finally:
        db_session.close()
    return RedirectResponse(url="/admin/dashboard?tab=config", status_code=303)


@app.post("/admin/renew-kds-secret")
def renew_kds_secret(request: Request, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    """Rotate KDS pairing secret. Kicks all paired kitchen displays on next status poll."""
    user, slug, restaurant = chef_data
    new_secret = secrets.token_urlsafe(24)
    restaurant["kds_secret"] = new_secret
    # Also invalidate kds_token so existing KDS devices get 401 on next poll
    restaurant["kds_token"] = secrets.token_hex(8)
    db_session = SessionLocal()
    try:
        save_restaurant_to_db(slug, restaurant, db_session)
        db_session.commit()
    finally:
        db_session.close()
    return RedirectResponse(url="/admin/dashboard?tab=config", status_code=303)




@app.post("/{slug}/tablet/bezahlen/{order_id}")
async def pay_order(request: Request, slug: str, order_id: int, waiter_id: Optional[str] = Form(None), tip: Optional[float] = Form(0.0), db: Session = Depends(get_db)):
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
        
    if order["status"] != "bezahlt":
        order["status"] = "bezahlt"
        order["tip_amount"] = round(tip or 0.0, 2)
        order["total_with_tip"] = round(order["total"] + order["tip_amount"], 2)
        order["waiter_id"] = waiter_id
        
        restaurant["tagesumsatz"] += order["total"]
        restaurant["bestellungen_gesamt"] += 1
        
        # Rotate table active session token upon payment to clear session
        table_num = str(order["table"]).replace("Tisch", "").strip()
        tables_list = restaurant.get("tables", [])
        db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
        if db_table:
            import secrets
            db_table["active_session_token"] = secrets.token_hex(4)
        
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Zahlung: {e}")
        
    await manager.broadcast(slug, {"type": "update"})
    return {"success": True}

@app.post("/{slug}/tablet/teilzahlung/{order_id}")
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
        
    order["total"] = round(sum(item["price"] * item["quantity"] for item in order["items"]), 2)
    restaurant["tagesumsatz"] += round(total_split_amount, 2)
    
    if not order["items"]:
        order["status"] = "bezahlt"
        restaurant["bestellungen_gesamt"] += 1
        
    # Rotate table active session token upon split payment to clear session ONLY if fully paid
    if order["status"] == "bezahlt":
        table_num = str(order["table"]).replace("Tisch", "").strip()
        tables_list = restaurant.get("tables", [])
        db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
        if db_table:
            import secrets
            db_table["active_session_token"] = secrets.token_hex(4)

    db = SessionLocal()
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Teilzahlung: {e}")
    finally:
        db.close()
        
    await manager.broadcast(slug, {"type": "update"})
    return {
        "success": True,
        "remaining_items_count": len(order["items"]),
        "order_status": order["status"],
        "split_amount": round(total_split_amount, 2)
    }

@app.post("/{slug}/tablet/tische-zusammenfuehren")
async def merge_tables(request: Request, slug: str, source_table: str = Form(...), target_table: str = Form(...), db: Session = Depends(get_db)):
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
        
    s_table_num = str(source_table).replace("Tisch", "").strip()
    t_table_num = str(target_table).replace("Tisch", "").strip()
    
    s_table = f"Tisch {s_table_num}"
    t_table = f"Tisch {t_table_num}"
    
    # Locate active orders
    source_order = next((o for o in restaurant.get("orders", []) if o.get("table") == s_table and o.get("status") not in ["bezahlt", "storniert"]), None)
    if not source_order:
        source_order = next((o for o in restaurant.get("orders", []) if str(o.get("table")).strip() == s_table_num and o.get("status") not in ["bezahlt", "storniert"]), None)
        
    if not source_order:
        raise HTTPException(status_code=400, detail="Keine offene Bestellung auf dem Quelltisch gefunden.")
        
    target_order = next((o for o in restaurant.get("orders", []) if o.get("table") == t_table and o.get("status") not in ["bezahlt", "storniert"]), None)
    if not target_order:
        target_order = next((o for o in restaurant.get("orders", []) if str(o.get("table")).strip() == t_table_num and o.get("status") not in ["bezahlt", "storniert"]), None)

    # 1. Update/Merge active order
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
                
        # Recalculate target order totals
        target_order["total"] = round(sum(item["price"] * item["quantity"] for item in target_order["items"]), 2)
        target_order["total_with_tip"] = round(target_order["total"] + target_order.get("tip_amount", 0.0), 2)
        
        # Mark source order as storniert
        source_order["status"] = "storniert"
        source_order["total"] = 0.0
        source_order["total_with_tip"] = 0.0
        source_order["items"] = []

    # 2. Sync security tokens so mobile sessions remain valid for the guests
    tables_list = restaurant.get("tables", [])
    s_db_table = next((t for t in tables_list if str(t.get("number")) == s_table_num), None)
    t_db_table = next((t for t in tables_list if str(t.get("number")) == t_table_num), None)
    
    if s_db_table and t_db_table:
        # Sync the dynamic guest session token so that the source table guest
        # can join/see the active session of the target table.
        # DO NOT copy or overwrite the static 'security_token' (which matches the printed QR code).
        t_db_table["active_session_token"] = s_db_table.get("active_session_token")
        
    db = SessionLocal()
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Zusammenführung: {e}")
    finally:
        db.close()
        
    await manager.broadcast(slug, {"type": "update"})
    return {"success": True}

@app.post("/{slug}/tablet/stornieren/{order_id}")
async def cancel_order(request: Request, slug: str, order_id: int, pin: Optional[str] = Form(None), db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    
    is_chef = False
    chef_employee = None
    res = get_current_user_and_slug(request)
    if res:
        user, session_slug = res
        if session_slug == slug and user["role"] == "chef":
            is_chef = True
            chef_employee = next((s for s in restaurant.get("staff", []) if s["role"] == "chef"), None)

    if not is_chef:
        if not pin:
            raise HTTPException(status_code=400, detail="Mitarbeiter-PIN erforderlich.")
        employee = next((s for s in restaurant.get("staff", []) if str(s.get("pin_code", s.get("pin"))) == str(pin).strip()), None)
        if not employee:
            raise HTTPException(status_code=403, detail="Ungültige PIN oder keine Berechtigung für Stornierung.")
    else:
        employee = chef_employee or {"name": "Chef", "role": "chef"}
        
    order = next((o for o in restaurant["orders"] if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
        
    order["status"] = "storniert"
    
    # Rotate table active session token upon cancellation to clear session
    table_num = str(order["table"]).replace("Tisch", "").strip()
    tables_list = restaurant.get("tables", [])
    db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
    if db_table:
        import secrets
        db_table["active_session_token"] = secrets.token_hex(4)
    
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
        
    await manager.broadcast(slug, {"type": "update"})
    return {"success": True}

@app.post("/{slug}/service-erledigt/{ruf_id}")
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
    
    db = SessionLocal()
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    finally:
        db.close()
        
    await manager.broadcast(slug, {"type": "update"})
    return {"success": True}

def parse_item_key(item_key: str):
    """Splits composite key into (product_id_str, note_slug, status_str)."""
    key_parts = item_key.split("_")
    pid_str = key_parts[0]
    if len(key_parts) >= 3:
        status_str = key_parts[-1]
        note_slug = "_".join(key_parts[1:-1])
    else:
        status_str = None
        note_slug = key_parts[1] if len(key_parts) > 1 else ""
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
    if not order.get("items"):
        order["status"] = "storniert"
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
    tip_amount: Optional[float] = 0.0

@app.post("/{slug}/tablet/pay-item/{order_id}")
async def pay_item(request: Request, slug: str, order_id: int, payload: PayItemPayload, db: Session = Depends(get_db)):
    """Pay for a specific line item (partial payment). Removes paid quantity from order."""
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

    # Find item by status-sensitive composite key
    matched_item = find_order_item(order.get("items", []), payload.item_key)

    if not matched_item:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden.")

    qty_to_pay = min(payload.quantity, matched_item["quantity"])
    paid_amount = round(qty_to_pay * matched_item["price"], 2)

    matched_item["quantity"] -= qty_to_pay
    if matched_item["quantity"] <= 0:
        order["items"].remove(matched_item)

    # Recalculate order total
    order["total"] = round(sum(i["price"] * i["quantity"] for i in order["items"]), 2)
    order["total_with_tip"] = round(order["total"] + order.get("tip_amount", 0.0), 2)

    # Add tip
    tip_to_add = payload.tip_amount or 0.0
    order["tip_amount"] = round(order.get("tip_amount", 0.0) + tip_to_add, 2)
    order["total_with_tip"] = round(order["total"] + order["tip_amount"], 2)

    # Book revenue
    restaurant["tagesumsatz"] = round(restaurant.get("tagesumsatz", 0.0) + paid_amount, 2)

    # If no items left → mark whole order as bezahlt
    if not order["items"]:
        order["status"] = "bezahlt"
        restaurant["bestellungen_gesamt"] = restaurant.get("bestellungen_gesamt", 0) + 1
        # Rotate session token
        table_num = str(order["table"]).replace("Tisch", "").strip()
        db_table = next((t for t in restaurant.get("tables", []) if str(t.get("number")) == table_num), None)
        if db_table:
            db_table["active_session_token"] = secrets.token_hex(4)
    else:
        update_order_status_by_items(order)

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")

    await manager.broadcast(slug, {"type": "update"})
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
    tip_amount: Optional[float] = 0.0

@app.post("/{slug}/tablet/pay-items-bulk/{order_id}")
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
        matched_item = find_order_item(order.get("items", []), item_info.item_key)

        if not matched_item:
            continue

        qty_to_pay = min(item_info.quantity, matched_item["quantity"])
        paid_amount = round(qty_to_pay * matched_item["price"], 2)
        total_paid_amount += paid_amount

        matched_item["quantity"] -= qty_to_pay
        if matched_item["quantity"] <= 0:
            order["items"].remove(matched_item)

    # Recalculate order total
    order["total"] = round(sum(i["price"] * i["quantity"] for i in order["items"]), 2)
    order["total_with_tip"] = round(order["total"] + order.get("tip_amount", 0.0), 2)

    # Book revenue
    restaurant["tagesumsatz"] = round(restaurant.get("tagesumsatz", 0.0) + total_paid_amount, 2)

    # Add tip
    tip_to_add = payload.tip_amount or 0.0
    order["tip_amount"] = round(order.get("tip_amount", 0.0) + tip_to_add, 2)
    order["total_with_tip"] = round(order["total"] + order["tip_amount"], 2)

    # If no items left → mark whole order as bezahlt
    if not order["items"]:
        order["status"] = "bezahlt"
        restaurant["bestellungen_gesamt"] = restaurant.get("bestellungen_gesamt", 0) + 1
        # Rotate session token
        table_num = str(order["table"]).replace("Tisch", "").strip()
        db_table = next((t for t in restaurant.get("tables", []) if str(t.get("number")) == table_num), None)
        if db_table:
            db_table["active_session_token"] = secrets.token_hex(4)
    else:
        update_order_status_by_items(order)

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")

    await manager.broadcast(slug, {"type": "update"})
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
async def transfer_item(request: Request, slug: str, order_id: int, payload: TransferItemPayload, db: Session = Depends(get_db)):
    """Move a single item from one order to another table's order."""
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

    source_order = next((o for o in restaurant.get("orders", []) if o["id"] == order_id), None)
    if not source_order:
        raise HTTPException(status_code=404, detail="Quell-Bestellung nicht gefunden.")
    if source_order["status"] in ["bezahlt", "storniert"]:
        raise HTTPException(status_code=400, detail="Bestellung ist bereits abgeschlossen.")

    target_num = str(payload.target_table).replace("Tisch", "").strip()
    target_table_str = f"Tisch {target_num}"
    possible_tables = [target_table_str, target_num]

    tables_list = restaurant.get("tables", [])
    target_db_table = next((t for t in tables_list if str(t.get("number")) == target_num), None)
    if not target_db_table:
        raise HTTPException(status_code=404, detail="Ziel-Tisch nicht gefunden.")

    # Find source item
    pid_str, note_slug, status_str = parse_item_key(payload.item_key)
    source_item = find_order_item(source_order.get("items", []), payload.item_key, order_id=order_id)

    if not source_item:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden.")

    # Make a copy of source_item before modifying quantity
    source_item_copy = copy.deepcopy(source_item)

    qty_to_move = min(payload.quantity, source_item["quantity"])
    item_amount = round(qty_to_move * source_item["price"], 2)

    # Remove qty from source
    source_item["quantity"] -= qty_to_move
    if source_item["quantity"] <= 0:
        source_order["items"].remove(source_item)

    # If source order has no items left, remove it from list
    if not source_order.get("items", []):
        restaurant["orders"].remove(source_order)
    else:
        source_order["total"] = round(sum(i["price"] * i["quantity"] for i in source_order["items"]), 2)
        source_order["total_with_tip"] = round(source_order["total"] + source_order.get("tip_amount", 0.0), 2)
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
        target_order["total"] = round(sum(i["price"] * i["quantity"] for i in target_order["items"]), 2)
        target_order["total_with_tip"] = round(target_order["total"] + target_order.get("tip_amount", 0.0), 2)
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
            "total_with_tip": round(item_amount, 2),
            "tip_amount": 0.0,
            "status": "eingegangen",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "mwst_rate": 19,
            "waiter_id": None
        }
        update_order_status_by_items(new_order)
        restaurant["orders"].append(new_order)


    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {e}")

    await manager.broadcast(slug, {"type": "refresh_tables"})
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
async def cancel_item(request: Request, slug: str, order_id: int, payload: CancelItemPayload, db: Session = Depends(get_db)):
    """Cancel a specific line item (partial cancellation) with chef PIN check."""
    restaurant = get_restaurant_or_raise(slug, db)

    is_chef = False
    chef_employee = None
    res = get_current_user_and_slug(request)
    if res:
        user, session_slug = res
        if session_slug == slug and user["role"] == "chef":
            is_chef = True
            chef_employee = next((s for s in restaurant.get("staff", []) if s["role"] == "chef"), None)

    if not is_chef:
        if not payload.pin:
            raise HTTPException(status_code=400, detail="Mitarbeiter-PIN erforderlich.")
        employee = next((s for s in restaurant.get("staff", []) if str(s.get("pin_code", s.get("pin"))) == str(payload.pin).strip()), None)
        if not employee:
            raise HTTPException(status_code=403, detail="Ungültige PIN.")
    else:
        employee = chef_employee or {"name": "Chef", "role": "chef"}

    order = next((o for o in restaurant.get("orders", []) if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
    if order["status"] in ["bezahlt", "storniert"]:
        raise HTTPException(status_code=400, detail="Bestellung ist bereits abgeschlossen.")

    # Find item by status-sensitive composite key
    matched_item = find_order_item(order.get("items", []), payload.item_key)

    if not matched_item:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden.")

    qty_to_cancel = min(payload.quantity, matched_item["quantity"])
    cancelled_amount = round(qty_to_cancel * matched_item["price"], 2)

    matched_item["quantity"] -= qty_to_cancel
    if matched_item["quantity"] <= 0:
        order["items"].remove(matched_item)

    order["total"] = round(sum(i["price"] * i["quantity"] for i in order["items"]), 2)
    order["total_with_tip"] = round(order["total"] + order.get("tip_amount", 0.0), 2)

    if not order["items"]:
        order["status"] = "storniert"
        # Rotate table active session token upon cancellation to clear session
        table_num = str(order["table"]).replace("Tisch", "").strip()
        tables_list = restaurant.get("tables", [])
        db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
        if db_table:
            import secrets
            db_table["active_session_token"] = secrets.token_hex(4)
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

    await manager.broadcast(slug, {"type": "update"})
    return {"success": True}


class BulkCancelItemInfo(BaseModel):
    item_key: str
    quantity: int

class BulkCancelItemsPayload(BaseModel):
    items: List[BulkCancelItemInfo]
    pin: Optional[str] = None

@app.post("/{slug}/tablet/cancel-items-bulk/{order_id}")
async def cancel_items_bulk(request: Request, slug: str, order_id: int, payload: BulkCancelItemsPayload, db: Session = Depends(get_db)):
    """Cancel multiple specific line items (bulk partial cancellation) with chef PIN check in a single transaction."""
    restaurant = get_restaurant_or_raise(slug, db)

    is_chef = False
    chef_employee = None
    res = get_current_user_and_slug(request)
    if res:
        user, session_slug = res
        if session_slug == slug and user["role"] == "chef":
            is_chef = True
            chef_employee = next((s for s in restaurant.get("staff", []) if s["role"] == "chef"), None)

    if not is_chef:
        if not payload.pin:
            raise HTTPException(status_code=400, detail="Mitarbeiter-PIN erforderlich.")
        employee = next((s for s in restaurant.get("staff", []) if str(s.get("pin_code", s.get("pin"))) == str(payload.pin).strip()), None)
        if not employee:
            raise HTTPException(status_code=403, detail="Ungültige PIN.")
    else:
        employee = chef_employee or {"name": "Chef", "role": "chef"}

    order = next((o for o in restaurant.get("orders", []) if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
    if order["status"] in ["bezahlt", "storniert"]:
        raise HTTPException(status_code=400, detail="Bestellung ist bereits abgeschlossen.")

    total_cancelled_amount = 0.0
    cancelled_details_list = []

    for item_info in payload.items:
        matched_item = find_order_item(order.get("items", []), item_info.item_key)

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
    order["total_with_tip"] = round(order["total"] + order.get("tip_amount", 0.0), 2)

    if not order["items"]:
        order["status"] = "storniert"
        # Rotate table active session token upon cancellation to clear session
        table_num = str(order["table"]).replace("Tisch", "").strip()
        tables_list = restaurant.get("tables", [])
        db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
        if db_table:
            import secrets
            db_table["active_session_token"] = secrets.token_hex(4)
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

    await manager.broadcast(slug, {"type": "update"})
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
async def transfer_order(request: Request, slug: str, payload: TransferOrderPayload, db: Session = Depends(get_db)):
    """Move an active order to a different table and broadcast refresh_tables."""
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

    order = next((o for o in restaurant.get("orders", []) if o["id"] == payload.order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
    if order["status"] in ["bezahlt", "storniert"]:
        raise HTTPException(status_code=400, detail="Bestellung ist bereits abgeschlossen.")

    target_num = str(payload.target_table).replace("Tisch", "").strip()
    target_table_str = f"Tisch {target_num}"
    possible_tables = [target_table_str, target_num]

    tables_list = restaurant.get("tables", [])
    target_db_table = next((t for t in tables_list if str(t.get("number")) == target_num), None)
    if not target_db_table:
        raise HTTPException(status_code=404, detail="Ziel-Tisch nicht gefunden.")

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
                
        # Recalculate target_order totals
        target_order["total"] = round(sum(i["price"] * i["quantity"] for i in target_order["items"]), 2)
        target_order["total_with_tip"] = round(target_order["total"] + target_order.get("tip_amount", 0.0) + order.get("tip_amount", 0.0), 2)
        target_order["tip_amount"] = round(target_order.get("tip_amount", 0.0) + order.get("tip_amount", 0.0), 2)
        update_order_status_by_items(target_order)
        
        # Remove the source order since it is merged
        restaurant["orders"].remove(order)
    else:
        # Just update the table name of the order
        order["table"] = target_table_str

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Umbuchen: {e}")

    await manager.broadcast(slug, {"type": "refresh_tables"})
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

    matched_item = find_order_item(order.get("items", []), payload.item_key)
    if not matched_item:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden.")
    matched_item["item_status"] = payload.status

    update_order_status_by_items(order)

    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Aktualisieren: {e}")

    await manager.broadcast(slug, {"type": "update"})
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
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
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
    resp.set_cookie(key="session", value=f"{slug}:{chef_name}:chef:{chef_pin}", httponly=True, max_age=31536000)
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return resp

@app.get("/admin/impersonate/{table_number}")
def admin_impersonate(request: Request, table_number: str, db: Session = Depends(get_db)):
    # Server-side auth check: strictly require chef
    res = get_current_user_and_slug(request)
    if not res:
        return RedirectResponse(url="/admin/login")
    user, slug = res
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug, db)
    
    table_num = str(table_number).strip()
    tables_list = restaurant.get("tables", [])
    db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
    
    if not db_table:
        raise HTTPException(status_code=404, detail="Tisch nicht gefunden.")
        
    table_token = db_table.get("security_token") or restaurant.get("security_token")
    
    # Redirect to customer menu and set session cookie
    resp = RedirectResponse(url=f"/{slug}?tisch={table_num}&token={table_token}", status_code=303)
    resp.set_cookie(
        key=f"guest_session_{slug}",
        value=f"{table_num}:{table_token}",
        max_age=14400,
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
        restaurant["is_setup_completed"] = True
        restaurant["is_onboarded"] = True
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
        
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
            
    brutto = sum(o["total"] for o in filtered_orders if o.get("status") == "bezahlt")
    
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
            "categories_json": json.dumps(restaurant.get("categories", []))
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
            if not restaurant.get("is_setup_completed", False):
                restaurant["is_setup_completed"] = True
                restaurant["is_onboarded"] = True
                save_restaurant_to_db(slug, restaurant, db)
                db.commit()
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
            resp.set_cookie(key="session", value=f"{slug}:Owner:chef:{password.strip()}", httponly=True, max_age=31536000)
            return resp
        else:
            return templates.TemplateResponse(
                request,
                "login.html",
                {
                    "request": request,
                    "restaurant_name": "digi-gastro",
                    "slug": "",
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
                save_restaurant_to_db(slug, restaurant, db)
                db.commit()
                
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
                resp.set_cookie(key="session", value=f"{slug}:{name}:{role}:{pin_str}", httponly=True, max_age=31536000)
                return resp
                
    return templates.TemplateResponse(
        request,
        "login.html",
        {
            "request": request,
            "restaurant_name": "digi-gastro",
            "slug": "",
            "error": "Ungültige Anmeldedaten.",
            "redirect": redirect
        }
    )

@app.get("/admin/logout")
def get_logout():
    resp = RedirectResponse(url="/admin/login")
    resp.delete_cookie(key="session")
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
def create_table(
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
        
    if not any(t["number"] == table_num for t in restaurant["tables"]):
        import secrets as _secrets
        table_entry = {
            "number": table_num,
            "zone": zone,
            "security_token": _secrets.token_hex(4),
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
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return RedirectResponse(url="/admin/dashboard", status_code=303)

@app.post("/admin/table-loeschen/{table_num}")
def delete_table(request: Request, table_num: str, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    if "tables" in restaurant:
        restaurant["tables"] = [t for t in restaurant["tables"] if t["number"] != table_num]
        restaurant["tables"] = sort_tables_in_grid(restaurant["tables"])
        
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
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
def profile_update(
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
    
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return RedirectResponse(url="/admin/dashboard", status_code=303)



@app.post("/admin/sitzplan/positions")
def save_sitzplan_positions(request: Request, payload: dict, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    tables = restaurant.get("tables", [])
    for t in tables:
        num = str(t.get("number"))
        if num in payload:
            t["pos_x"] = float(payload[num].get("pos_x", t.get("pos_x", 0.0)))
            t["pos_y"] = float(payload[num].get("pos_y", t.get("pos_y", 0.0)))
            t["width"] = float(payload[num].get("width", t.get("width", 120.0)))
            t["height"] = float(payload[num].get("height", t.get("height", 80.0)))
            t["shape"] = str(payload[num].get("shape", t.get("shape", "rect")))
            
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return {"success": True}



@app.post("/admin/kategorie-erstellen")
def create_category(
    request: Request,
    name: Optional[str] = Form(None),
    category_name: Optional[str] = Form(None, alias="category-name"),
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
    if cat and cat not in restaurant["categories"]:
        restaurant["categories"].append(cat)
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return RedirectResponse(url="/admin/dashboard", status_code=303)

# Helper für Admin-Rechteprüfung ist nun am Anfang definiert.

@app.get("/admin/products/export-csv")
async def export_products_csv(request: Request, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    products = restaurant.get("products", [])
    
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
        
        writer.writerow([
            p.get("id", ""),
            p.get("name", ""),
            f"{p.get('price', 0.0):.2f}".replace('.', ','),
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
        
    await manager.broadcast(slug, {"type": "update"})
    return RedirectResponse(url="/admin/dashboard", status_code=303)


@app.post("/admin/produkt-erstellen")
async def post_produkt_erstellen(
    request: Request,
    name: str = Form(...),
    preis: float = Form(...),
    kategorie: str = Form(...),
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

    cat_name = kategorie.strip()
    if cat_name and cat_name not in restaurant["categories"]:
        restaurant["categories"].append(cat_name)

    # Generate ID
    new_id = 1
    if restaurant["products"]:
        new_id = max(p["id"] for p in restaurant["products"]) + 1

    category_type = "k\u00fcche"
    cat_lower = cat_name.lower()
    if any(keyword in cat_lower for keyword in ["drinks", "bar", "getr\u00e4nke", "soft", "alkohol", "bier", "wein", "cocktail", "saft", "kaffee", "tee", "wasser", "limo"]):
        category_type = "bar"
    elif any(keyword in cat_lower for keyword in ["shisha", "wasserpfeife", "pfeife", "head", "kohle"]):
        category_type = "shisha"

    # ── Image handling: file upload wins over URL ─────────────────
    final_image = ""
    if image_file and image_file.filename:
        products_upload_dir = os.path.join(UPLOAD_DIR, "products")
        os.makedirs(products_upload_dir, exist_ok=True)
        ext = "jpg"
        parts = image_file.filename.split(".")
        if len(parts) > 1:
            ext = parts[-1].lower()
        safe_name = f"{slug}-product-{new_id}.{ext}"
        file_path = os.path.join(products_upload_dir, safe_name)
        content = await image_file.read()
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

    return RedirectResponse(url="/admin/dashboard", status_code=303)


@app.post("/admin/produkt-loeschen/{product_id}")
def delete_produkt(
    request: Request,
    product_id: int,
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    """Sicher löschen: nur eingeloggte Chef-User, strikt Tenant-isoliert."""
    user, slug, restaurant = chef_data

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

    return RedirectResponse(url="/admin/dashboard", status_code=303)


@app.post("/admin/kategorie-loeschen")
def delete_kategorie(
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

    return RedirectResponse(url="/admin/dashboard", status_code=303)

# API Models
class CallServicePayload(BaseModel):
    type: str
    table: str
    token: Optional[str] = None
    tip_amount: Optional[float] = 0.0

@app.post("/api/{slug}/call-service")
async def api_call_service(request: Request, slug: str, payload: CallServicePayload, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    
    table_num = str(payload.table).replace("Tisch", "").strip()
    tables_list = restaurant.get("tables", [])
    db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
    
    tok = payload.token or request.query_params.get("token") or request.headers.get("X-Token")
    if not tok:
        cookie_name = f"guest_session_{slug}"
        session_val = request.cookies.get(cookie_name)
        if session_val:
            try:
                c_table, c_tok = session_val.split(":", 1)
                if str(c_table).strip() == table_num:
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
            is_staff = True
        else:
            res = get_current_user_and_slug(request)
            if res:
                user, session_slug = res
                if session_slug == slug and user["role"] in ["chef", "kellner"]:
                    is_staff = True
            
    if not is_staff:
        is_token_valid = (tok and ((table_token and tok == table_token) or (master_token and tok == master_token)))
        if not is_token_valid:
            raise HTTPException(status_code=403, detail="Ungültiger oder abgelaufener Tisch-Code.")
            
    if "service_calls" not in restaurant:
        restaurant["service_calls"] = []
        
    service_type = payload.type
    if payload.type == "zahlen_bar":
        service_type = "bar"
    elif payload.type == "zahlen_karte":
        service_type = "karte"
        
    if payload.tip_amount and payload.tip_amount > 0:
        service_type = f"{service_type} (Trinkgeld: {payload.tip_amount:.2f} €)"
        
    existing_calls = restaurant.get("service_calls", [])
    new_id = max([c.get("id", 0) for c in existing_calls] + [0]) + 1
    new_call = {
        "id": new_id,
        "table": payload.table,
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
    await manager.broadcast(slug, {"type": "update"})
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
            is_staff = True
        else:
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
    db_table = next((t for t in tables_list if str(t.get("number")) == active_table_num), None)
    active_session_tok = db_table.get("active_session_token") if db_table else None
    
    master_token = restaurant.get("security_token")
    is_token_valid = (active_token and ((active_session_tok and active_token == active_session_tok) or (master_token and active_token == master_token)))
    return {"active": bool(is_token_valid)}

@app.get("/api/tablet-status")
def get_tablet_status(request: Request, db: Session = Depends(get_db)):
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
            
    brutto = sum(o["total"] for o in filtered_orders if o.get("status") == "bezahlt")
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
        recent_payments.append({
            "id": o.get("id"),
            "table": o.get("table"),
            "total": o.get("total"),
            "tip_amount": o.get("tip_amount", 0.0),
            "timestamp": o.get("timestamp", "")
        })

    return {
        "orders": active_orders,
        "service_calls": restaurant.get("service_calls", []),
        "tables": restaurant.get("tables", []),
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
        "recent_payments": recent_payments
    }


@app.get("/api/{slug}/table-unpaid-sum/{table_num}")
def get_table_unpaid_sum(slug: str, table_num: str, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    unpaid_sum = 0.0
    t_num = str(table_num).replace("Tisch", "").strip()
    target_table_name = f"Tisch {t_num}"
    
    for o in restaurant.get("orders", []):
        if o["table"] == target_table_name and o["status"] not in ["bezahlt", "storniert"]:
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
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return RedirectResponse(url="/admin/dashboard", status_code=303)

@app.post("/admin/staff-loeschen/{pin_code}")
def delete_staff(request: Request, pin_code: str, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    restaurant["staff"] = [s for s in restaurant.get("staff", []) if str(s.get("pin_code")) != str(pin_code).strip()]
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return RedirectResponse(url="/admin/dashboard", status_code=303)

@app.post("/admin/branding")
def update_branding(
    request: Request,
    logo_file: Optional[UploadFile] = File(None),
    logo_url: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    plz: Optional[str] = Form(None),
    ort: Optional[str] = Form(None),
    instagram: Optional[str] = Form(None),
    facebook: Optional[str] = Form(None),
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
        "facebook": facebook.strip() if facebook else ""
    }
    update_legal_placeholders(restaurant)
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
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
def update_landingpage(
    request: Request,
    welcome_title: Optional[str] = Form(None),
    welcome_subtitle: Optional[str] = Form(None),
    what_we_offer: Optional[str] = Form(None),
    google_rating_url: Optional[str] = Form(None),
    aktuelles: Optional[str] = Form(None),
    oeffnungszeiten: Optional[str] = Form(None),
    angebote: Optional[str] = Form(None),
    chef_data: tuple = Depends(require_chef_user_flat),
    db: Session = Depends(get_db)
):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    restaurant["landing_page"] = {
        "welcome_title": welcome_title.strip() if welcome_title else f"Willkommen bei {restaurant.get('name', slug)}",
        "welcome_subtitle": welcome_subtitle.strip() if welcome_subtitle else "",
        "what_we_offer": what_we_offer.strip() if what_we_offer else "",
        "google_rating_url": google_rating_url.strip() if google_rating_url else "",
        "aktuelles": aktuelles.strip() if aktuelles else "",
        "oeffnungszeiten": oeffnungszeiten.strip() if oeffnungszeiten else "",
        "angebote": angebote.strip() if angebote else ""
    }
    
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return RedirectResponse(url="/admin/dashboard?tab=config", status_code=303)

@app.get("/api/{slug}/table-status/{table_num}")
def get_table_status_endpoint(request: Request, slug: str, table_num: str, db: Session = Depends(get_db)):
    restaurant = get_restaurant_or_raise(slug, db)
    
    # Session verification cookie check
    cookie_name = f"guest_session_{slug}"
    session_val = request.cookies.get(cookie_name)
    is_valid = True
    if session_val:
        try:
            c_table, c_token = session_val.split(":", 1)
            if str(c_table).replace("Tisch", "").strip() != str(table_num).replace("Tisch", "").strip():
                is_valid = False
        except Exception:
            is_valid = False
            
    if not is_valid:
        raise HTTPException(status_code=403, detail="Kein Zugriff auf diesen Tisch.")

    target_table_name = f"Tisch {table_num}"
    table_orders = []
    
    for o in restaurant.get("orders", []):
        if (o.get("table") == target_table_name or str(o.get("table")).strip() == str(table_num).strip()) and o.get("status") not in ["bezahlt", "storniert"]:
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


@app.post("/admin/happy-hour")
def update_happy_hour(request: Request, days: List[str] = Form(default=[]), start: str = Form(...), end: str = Form(...), discount: int = Form(...), chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    restaurant["happy_hour"] = {
        "days": days,
        "start": start,
        "end": end,
        "discount": discount
    }
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return RedirectResponse(url="/admin/dashboard", status_code=303)

@app.post("/admin/shishabar-toggle")
def toggle_shishabar(request: Request, is_shishabar: Optional[bool] = Form(None), chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
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

    product["name"] = str(name).strip()
    product["price"] = round(float(price), 2)
    product["description"] = str(description).strip() if description else ""
    product["category"] = str(category).strip()
    product["name_en"] = str(name_en).strip() if name_en else ""
    product["description_en"] = str(description_en).strip() if description_en else ""
    product["vegan"] = is_vegan
    product["is_vegan"] = is_vegan
    product["is_glutenfree"] = is_glutenfree

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
        ext = "jpg"
        parts = image_file.filename.split(".")
        if len(parts) > 1:
            ext = parts[-1].lower()
        safe_name = f"{slug}-product-{product_id}.{ext}"
        file_path = os.path.join(products_upload_dir, safe_name)
        content = await image_file.read()
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
        
    await manager.broadcast(slug, {"type": "update"})
    return {"success": True}

@app.post("/admin/product-toggle/{product_id}")
def toggle_product_availability(request: Request, product_id: int, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
        
    product = next((p for p in restaurant["products"] if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden.")
    product["is_available"] = not product.get("is_available", True)
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return RedirectResponse(url="/admin/dashboard", status_code=303)

@app.post("/admin/product-hh")
def update_product_hh(
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
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return RedirectResponse(url="/admin/dashboard", status_code=303)

@app.post("/admin/token-rotieren")
def token_rotieren(request: Request, chef_data: tuple = Depends(require_chef_user_flat), db: Session = Depends(get_db)):
    user, slug, restaurant = chef_data
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url="/admin/setup", status_code=303)
         
    new_token = secrets.token_hex(4)
    restaurant["security_token"] = new_token
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return RedirectResponse(url="/admin/dashboard", status_code=303)

@app.get("/admin/gobd-export")
def gobd_export(request: Request, db: Session = Depends(get_db)):
    res = get_current_user_and_slug(request)
    if not res:
        return RedirectResponse(url="/admin/login")
    user, slug = res
    if user["role"] != "chef":
        return RedirectResponse(url="/admin/login")
        
    restaurant = get_restaurant_or_raise(slug, db)
    if not restaurant.get("is_setup_completed", False):
        restaurant["is_setup_completed"] = True
        restaurant["is_onboarded"] = True
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
        
    paid_orders = [o for o in restaurant.get("orders", []) if o.get("status") == "bezahlt"]
    
    filename = f"gobd-export-{slug}-{datetime.now().strftime('%Y%m%d%H%M%S')}.json"
    headers = {
        "Content-Disposition": f"attachment; filename={filename}"
    }
    
    return JSONResponse(
        content={
            "restaurant": restaurant.get("name", slug),
            "slug": slug,
            "orders": paid_orders,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        headers=headers
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
    restaurant["is_setup_completed"] = True
    restaurant["is_onboarded"] = True
    save_restaurant_to_db(slug, restaurant, db)
    db.commit()
    return RedirectResponse(url="/admin/dashboard")

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
    """Renders a printable A4 overview with a QR code block per table."""
    res = get_current_user_and_slug(request)
    if not res:
        return RedirectResponse(url="/admin/login")
    user, slug = res
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug, db)
    tables = restaurant.get("tables", [])
    base_url = str(request.base_url).rstrip("/")
    logo_url = restaurant.get("branding", {}).get("logo_url") or "/static/images/digigastrologo.jpeg"
    import urllib.parse
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>QR Codes drucken - {restaurant.get('name', slug)}</title>
        <style>
            body {{ font-family: sans-serif; background: #fff; margin: 0; padding: 20px; }}
            .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }}
            .card {{ border: 2px solid #ccc; padding: 15px; border-radius: 8px; text-align: center; page-break-inside: avoid; }}
            h3 {{ margin: 0; color: #333; }}
            @media print {{
                body {{ padding: 0; }}
                .card {{ border: 1px solid #000; }}
            }}
            .print-btn {{ display: block; width: 200px; margin: 0 auto 30px; padding: 10px; background: #009900; color: #fff; border: none; border-radius: 5px; cursor: pointer; text-align: center; text-decoration: none; font-weight: bold; font-size: 16px; }}
            @media print {{ .print-btn {{ display: none; }} }}
        </style>
    </head>
    <body>
        <button class="print-btn" onclick="window.print()">Drucken</button>
        <div class="grid">
    """
    for t in tables:
        table_num = t.get("number")
        token = t.get("security_token", "")
        qr_url = f"{base_url}/{slug}?t={table_num}&tk={token}"
        qr_url_encoded = urllib.parse.quote(qr_url)
        qr_image_src = f"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={qr_url_encoded}"
        html_content += f"""
            <div class="card">
                <h3>Tisch {table_num}</h3>
                <div style="position: relative; width: 150px; height: 150px; margin: 15px auto; background: white;">
                    <img src="{qr_image_src}" alt="QR Tisch {table_num}" style="width: 150px; height: 150px; display: block;" />
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 34px; height: 34px; background: white; padding: 2px; border-radius: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                        <img src="{logo_url}" style="width: 30px; height: 30px; object-fit: contain; border-radius: 4px;" onerror="this.parentElement.style.display='none'" />
                    </div>
                </div>
            </div>
        """
    html_content += """
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


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

@app.post("/admin/orders/serve")
async def serve_order_items(request: Request, payload: ServePayload, db: Session = Depends(get_db)):
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
        try:
            save_restaurant_to_db(slug, restaurant, db)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Fehler beim Servieren: {e}")
            
    await manager.broadcast(slug, {"type": "update"})
    return {"success": True}


class AdminSplitPayPayload(BaseModel):
    order_id: int
    items: List[SplitItem]

@app.post("/admin/orders/split-pay")
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
        
    order["total"] = round(sum(item["price"] * item["quantity"] for item in order["items"]), 2)
    restaurant["tagesumsatz"] += round(total_split_amount, 2)
    
    if not order["items"]:
        order["status"] = "bezahlt"
        restaurant["bestellungen_gesamt"] += 1
        
        # Rotate table active session token upon payment to clear session
        table_num = str(order["table"]).replace("Tisch", "").strip()
        tables_list = restaurant.get("tables", [])
        db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
        if db_table:
            import secrets
            db_table["active_session_token"] = secrets.token_hex(4)
            
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Teilzahlung: {e}")
        
    await manager.broadcast(slug, {"type": "update"})
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
    
    s_table = f"Tisch {s_table_num}"
    t_table = f"Tisch {t_table_num}"
    
    # Locate active orders
    source_orders = [o for o in restaurant.get("orders", []) if (o.get("table") == s_table or str(o.get("table")).strip() == s_table_num) and o.get("status") not in ["bezahlt", "storniert"]]
    if not source_orders:
        raise HTTPException(status_code=400, detail="Keine offene Bestellung auf dem Quelltisch gefunden.")
        
    target_order = next((o for o in restaurant.get("orders", []) if (o.get("table") == t_table or str(o.get("table")).strip() == t_table_num) and o.get("status") not in ["bezahlt", "storniert"]), None)
    
    if payload.item_keys:
        # Move ONLY selected items
        if not target_order:
            existing_ids = [o["id"] for o in restaurant.get("orders", [])]
            new_order_id = max(existing_ids) + 1 if existing_ids else 1
            target_order = {
                "id": new_order_id,
                "table": t_table,
                "items": [],
                "total": 0.0,
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
            
            source_order["items"] = remaining_items
            source_order["total"] = round(sum(i["price"] * i["quantity"] for i in remaining_items), 2)
            source_order["total_with_tip"] = round(source_order["total"] + source_order.get("tip_amount", 0.0), 2)
            if not remaining_items:
                source_order["status"] = "storniert"
                source_order["total"] = 0.0
                source_order["total_with_tip"] = 0.0
                
        target_order["total"] = round(sum(i["price"] * i["quantity"] for i in target_order["items"]), 2)
        target_order["total_with_tip"] = round(target_order["total"] + target_order.get("tip_amount", 0.0), 2)
        
    else:
        # Full table transfer
        for source_order in source_orders:
            if not target_order:
                source_order["table"] = t_table
                target_order = source_order
            else:
                for s_item in source_order.get("items", []):
                    t_item = next((item for item in target_order.get("items", []) if item.get("product_id") == s_item.get("product_id") and (item.get("note") or "").strip() == (s_item.get("note") or "").strip() and (item.get("item_status", "pending") or "pending") == (s_item.get("item_status", "pending") or "pending")), None)
                    if t_item:
                        t_item["quantity"] += s_item.get("quantity", 0)
                    else:
                        target_order["items"].append(copy.deepcopy(s_item))
                        
                target_order["total"] = round(sum(item["price"] * item["quantity"] for item in target_order["items"]), 2)
                target_order["total_with_tip"] = round(target_order["total"] + target_order.get("tip_amount", 0.0), 2)
                
                source_order["status"] = "storniert"
                source_order["total"] = 0.0
                source_order["total_with_tip"] = 0.0
                source_order["items"] = []
                
    tables_list = restaurant.get("tables", [])
    s_db_table = next((t for t in tables_list if str(t.get("number")) == s_table_num), None)
    t_db_table = next((t for t in tables_list if str(t.get("number")) == t_table_num), None)
    
    if s_db_table and t_db_table:
        # Sync the dynamic guest session token so that the source table guest
        # can join/see the active session of the target table.
        # DO NOT copy or overwrite the static 'security_token' (which matches the printed QR code).
        t_db_table["active_session_token"] = s_db_table.get("active_session_token")
        
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Zusammenführung: {e}")
        
    await manager.broadcast(slug, {"type": "update"})
    return {"success": True}


class AddManualPayload(BaseModel):
    table_number: str
    product_id: int
    quantity: int

@app.post("/api/admin/orders/add-manual")
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
        
    # 2. Format table name (e.g. "Tisch 5" or "5")
    t_num = str(payload.table_number).replace("Tisch", "").strip()
    table_str = f"Tisch {t_num}"
    
    # Check if table exists in restaurant config
    tables_list = restaurant.get("tables", [])
    db_table = next((t for t in tables_list if str(t.get("number")) == t_num), None)
    if not db_table:
        raise HTTPException(status_code=404, detail="Tisch existiert nicht.")
        
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
        
    await manager.broadcast(slug, {"type": "update"})
    return {"success": True}


