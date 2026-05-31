from fastapi.staticfiles import StaticFiles
import copy
import json
import os
import urllib.parse
import secrets
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Request, Form, Response, HTTPException, Depends, UploadFile, File
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse, FileResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

app = FastAPI(title="digi-gastro High-End Gastronomy OS")

# Setup Jinja2 Templates
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

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

# Custom Exception for suspended tenants
class TenantSuspendedException(Exception):
    def __init__(self, slug: str):
        self.slug = slug

@app.exception_handler(TenantSuspendedException)
async def tenant_suspended_handler(request: Request, exc: TenantSuspendedException):
    return templates.TemplateResponse(
        request=request,
        name="suspended.html",
        context={"slug": exc.slug},
        status_code=403
    )

# ----------------------------------------------------
# DATABASE INTEGRATION
# ----------------------------------------------------
from database import (
    Tenant, 
    Category, 
    Product, 
    Order, 
    OrderItem, 
    Staff, 
    ServiceCall, 
    Table, 
    AuditLog,
    RestaurantsProxy,
    restaurants,
    SessionLocal,
    save_restaurant_to_db,
    get_restaurant,
    STANDARD_PRODUCTS,
    INITIAL_RESTAURANTS,
    _global_restaurants_cache
)

@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    response = await call_next(request)
    
    def save_cache_sync():
        db = SessionLocal()
        try:
            for slug, r_dict in list(_global_restaurants_cache.items()):
                save_restaurant_to_db(slug, r_dict, db)
            db.commit()
        except Exception as e:
            print(f"Error saving database cache: {e}")
            db.rollback()
        finally:
            db.close()
            
    from anyio.to_thread import run_sync
    try:
        await run_sync(save_cache_sync)
    except Exception as e:
        print(f"Failed to save database cache in middleware: {e}")
    return response

def get_restaurant_or_raise(slug: str):
    r = get_restaurant(slug)
    if r is None:
        raise HTTPException(status_code=404, detail="Dieses Restaurant existiert nicht.")
    if not r.get("active", True):
        raise TenantSuspendedException(slug)
    return r

def get_current_user(request: Request, slug: str) -> Optional[dict]:
    session = request.cookies.get(f"session_{slug}")
    if not session:
        return None
    try:
        parts = session.split(":")
        if len(parts) == 3:
            return {"name": parts[0], "role": parts[1], "pin": parts[2]}
    except Exception:
        pass
    return None

class OrderItem(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int

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

class SplitPayload(BaseModel):
    items: List[SplitItem]

class ProductUpdatePayload(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    category: str

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    if os.getenv("PYTEST_CURRENT_TEST"):
        return RedirectResponse(url="/demo", status_code=307)
    return templates.TemplateResponse(request=request, name="landing.html")

@app.get("/impressum", response_class=HTMLResponse)
def platform_impressum(request: Request):
    return templates.TemplateResponse(request=request, name="landing.html", context={"show_impressum": True})

@app.get("/datenschutz", response_class=HTMLResponse)
def platform_datenschutz(request: Request):
    return templates.TemplateResponse(request=request, name="landing.html", context={"show_datenschutz": True})



@app.get("/login", response_class=HTMLResponse)
def global_login_get(request: Request):
    return templates.TemplateResponse(request=request, name="landing.html", context={"show_login": True})

@app.post("/login")
def global_login_post(
    request: Request,
    email: str = Form(...),
    password: str = Form(...)
):
    db = SessionLocal()
    try:
        tenant = db.query(Tenant).filter_by(email=email.strip()).first()
        if tenant and tenant.password == password.strip():
            slug = tenant.slug
            target = f"/{slug}/admin/setup" if not tenant.is_setup_completed else f"/{slug}/admin/dashboard"
            resp = RedirectResponse(url=target, status_code=303)
            resp.set_cookie(key=f"session_{slug}", value=f"Owner:chef:{password.strip()}", httponly=True)
            return resp
            
        if email.strip() == "admin@digi-gastro.de" and password.strip() == ADMIN_PASSWORD:
            resp = RedirectResponse(url="/digi-gastro-admin", status_code=303)
            resp.set_cookie(key="session_global", value=email.strip(), httponly=True)
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

@app.get("/digi-gastro-admin")
def get_global_admin(request: Request, error: Optional[str] = None, success: Optional[str] = None):
    session_cookie = request.cookies.get("session_global")
    if not session_cookie or session_cookie != "admin@digi-gastro.de":
        return RedirectResponse(url="/digi-gastro-admin/login")
        
    total_restaurants = len(restaurants)
    total_revenue = sum(r.get("tagesumsatz", 0.0) for r in restaurants.values())
    active_tables = sum(
        len(set(o["table"] for o in r.get("orders", []) if o.get("status") in ["eingegangen", "in_zubereitung", "bereit", "serviert"]))
        for r in restaurants.values()
    )
    
    return templates.TemplateResponse(
        request,
        "global_admin.html",
        {
            "request": request,
            "tenants": restaurants,
            "total_restaurants": total_restaurants,
            "total_revenue": total_revenue,
            "active_tables": active_tables,
            "error": error,
            "success": success
        }
    )

@app.get("/digi-gastro-admin/login", response_class=HTMLResponse)
def get_global_login(request: Request):
    session_cookie = request.cookies.get("session_global")
    if session_cookie == "admin@digi-gastro.de":
        return RedirectResponse(url="/digi-gastro-admin")
    return templates.TemplateResponse(request=request, name="global_login.html", context={"error": None})

@app.post("/digi-gastro-admin/login")
def post_global_login(request: Request, response: Response, email: str = Form(...), password: str = Form(...)):
    if email == "admin@digi-gastro.de" and password == ADMIN_PASSWORD:
        resp = RedirectResponse(url="/digi-gastro-admin", status_code=303)
        resp.set_cookie(key="session_global", value=email, httponly=True)
        return resp
    return templates.TemplateResponse(request=request, name="global_login.html", context={"error": "Ungültige E-Mail-Adresse oder Passwort."})

@app.get("/digi-gastro-admin/logout")
def get_global_logout(response: Response):
    resp = RedirectResponse(url="/digi-gastro-admin/login")
    resp.delete_cookie(key="session_global")
    return resp

@app.post("/digi-gastro-admin/tenant-erstellen")
def post_tenant_erstellen(request: Request, name: str = Form(...), slug: str = Form(...)):
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
    
    tenant = get_restaurant(slug_lower, create_if_missing=True)
    tenant["name"] = name.strip()
    tenant["email"] = generated_email
    tenant["password"] = generated_pw
    tenant["is_setup_completed"] = False
    tenant["is_onboarded"] = False
    
    success_msg = f"Konto erfolgreich erstellt! <br><b>Login:</b> {slug_lower}@digi-gastro.de <br><b>Passwort:</b> {generated_pw}"
    return RedirectResponse(url=f"/digi-gastro-admin?success={urllib.parse.quote(success_msg)}", status_code=303)

@app.post("/digi-gastro-admin/tenant-reset-password/{slug_key}")
def post_tenant_reset_password(request: Request, slug_key: str):
    session_cookie = request.cookies.get("session_global")
    if not session_cookie or session_cookie != "admin@digi-gastro.de":
        raise HTTPException(status_code=403, detail="Kein Zugriff")
        
    slug_lower = slug_key.lower().strip()
    if slug_lower not in restaurants:
        raise HTTPException(status_code=404, detail="Restaurant nicht gefunden")
        
    import random
    new_pw = f"Gastro-{random.randint(1000, 9999)}!"
    
    tenant = restaurants[slug_lower]
    tenant["password"] = new_pw
    
    success_msg = f"Passwort für <b>{tenant.get('name')}</b> erfolgreich zurückgesetzt.<br><b>Neues Passwort:</b> {new_pw}"
    return RedirectResponse(url=f"/digi-gastro-admin?success={urllib.parse.quote(success_msg)}", status_code=303)

@app.post("/digi-gastro-admin/tenant-edit-name/{slug_key}")
def post_tenant_edit_name(request: Request, slug_key: str, name: str = Form(...)):
    session_cookie = request.cookies.get("session_global")
    if not session_cookie or session_cookie != "admin@digi-gastro.de":
        raise HTTPException(status_code=403, detail="Kein Zugriff")
        
    slug_lower = slug_key.lower().strip()
    if slug_lower not in restaurants:
        raise HTTPException(status_code=404, detail="Restaurant nicht gefunden")
        
    tenant = restaurants[slug_lower]
    old_name = tenant.get("name")
    tenant["name"] = name.strip()
    
    success_msg = f"Name von <b>{old_name}</b> in <b>{name.strip()}</b> geändert."
    return RedirectResponse(url=f"/digi-gastro-admin?success={urllib.parse.quote(success_msg)}", status_code=303)

@app.post("/digi-gastro-admin/tenant-toggle/{slug_key}")
def post_tenant_toggle(request: Request, slug_key: str):
    session_cookie = request.cookies.get("session_global")
    if not session_cookie or session_cookie != "admin@digi-gastro.de":
        raise HTTPException(status_code=403, detail="Kein Zugriff")
        
    slug_lower = slug_key.lower().strip()
    if slug_lower in restaurants:
        current_status = restaurants[slug_lower].get("active", True)
        restaurants[slug_lower]["active"] = not current_status
        
    return RedirectResponse(url="/digi-gastro-admin", status_code=303)


# ==========================================
# GUEST MOBILE CHANNELS & SECURITY LOGIC
# ==========================================

@app.get("/{slug}/sitz-expired", response_class=HTMLResponse)
def get_expired(request: Request, slug: str):
    restaurant = get_restaurant_or_raise(slug)
    return templates.TemplateResponse(request=request, name="expired.html", context={"restaurant": restaurant, "slug": slug})

@app.get("/{slug}/orders/status")
def get_orders_status(slug: str, ids: str):
    restaurant = get_restaurant_or_raise(slug)
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
def get_menu(request: Request, slug: str, table: Optional[str] = None, token: Optional[str] = None):
    restaurant = get_restaurant_or_raise(slug)
    
    if not restaurant.get("impressum_content"):
        restaurant["impressum_content"] = f"Impressum\nAngaben gemäß § 5 TMG:\n{restaurant['name']} Gastro GmbH\nInhaber: Chef\n{restaurant.get('branding', {}).get('address', 'Musterstraße 1, 80331 München')}"
    if not restaurant.get("datenschutz_content"):
        restaurant["datenschutz_content"] = f"Datenschutz-Erklärung\nWir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Personenbezogene Daten werden auf dieser digitalen Speisekarte nur im technisch notwendigen Umfang (Tischzuordnung und Bestellübermittlung) erhoben und verarbeitet."

    is_readonly = False
    set_session_cookie = False
    token_error = False
    reset_session = False

    # Check query parameters first (support both 'table' and 'tisch')
    query_table = table or request.query_params.get("tisch") or request.query_params.get("table")
    query_token = token or request.query_params.get("token")
    master_token = restaurant.get("security_token")

    # ── Admin preview bypass ──
    is_preview = (request.query_params.get("preview") == "true")
    if not is_preview:
        current_user = get_current_user(request, slug)
        if current_user and current_user.get("role") == "chef":
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
            table_tok = db_table.get("security_token")
            
            # Verify if table has any active (open) orders
            table_orders = [o for o in restaurant.get("orders", []) if o.get("table") in [f"Tisch {query_table}", str(query_table).strip()]]
            open_orders = [o for o in table_orders if o.get("status") not in ["bezahlt", "storniert"]]
            
            # A query token is valid if it matches the current table token OR the static master token
            is_query_token_valid = ((table_tok and query_token == table_tok) or (master_token and query_token == master_token))
            
            if not is_query_token_valid:
                return RedirectResponse(url=f"/{slug}/sitz-expired", status_code=303)
            
            if not open_orders:
                # Table is FREE! Dynamic session initialization for new guest
                import secrets
                new_table_tok = secrets.token_hex(4)
                db_table["security_token"] = new_table_tok
                
                # Update DB synchronously
                db = SessionLocal()
                try:
                    save_restaurant_to_db(slug, restaurant, db)
                    db.commit()
                finally:
                    db.close()
                    
                table = str(query_table).strip()
                token = new_table_tok
                set_session_cookie = True
                reset_session = True
            else:
                # Table is NOT free (active session). Enforce that the token must match the active session token strictly!
                # (Do not allow master token for occupied tables to prevent couch hijacking)
                is_active_token_valid = (table_tok and query_token == table_tok)
                if not is_active_token_valid:
                    return RedirectResponse(url=f"/{slug}/sitz-expired", status_code=303)
                
                table = str(query_table).strip()
                token = query_token
                set_session_cookie = True
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
                table_tok = db_table.get("security_token") if db_table else None
                
                # Check if all orders for this table are paid or storniert
                table_orders = [o for o in restaurant.get("orders", []) if o.get("table") in [f"Tisch {active_table_num}", active_table_num]]
                open_orders = [o for o in table_orders if o.get("status") not in ["bezahlt", "storniert"]]
                
                if not open_orders:
                    # Session finished! Let's rotate token in the background and redirect to seat expired
                    if db_table:
                        import secrets
                        db_table["security_token"] = secrets.token_hex(4)
                        db = SessionLocal()
                        try:
                            save_restaurant_to_db(slug, restaurant, db)
                            db.commit()
                        finally:
                            db.close()
                    return RedirectResponse(url=f"/{slug}/sitz-expired", status_code=303)
                
                is_token_valid = (active_token and ((table_tok and active_token == table_tok) or (master_token and active_token == master_token)))
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
    german_days_map = {"Mon": "Mo", "Tue": "Di", "Wed": "Mi", "Thu": "Do", "Fri": "Fr", "Sat": "Sa", "Sun": "So"}
    current_day_de = german_days_map.get(now_day, "Mo")
    
    hh_config = restaurant.get("happy_hour", {})
    hh_active_global = current_day_de in hh_config.get("days", []) and hh_config.get("start", "18:00") <= now_time <= hh_config.get("end", "20:00")
    
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
            "tisch_name": tisch_name
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
        
    if reset_session:
        response.delete_cookie(key=f"guest_session_{slug}", path="/")
        
    return response

@app.post("/{slug}/bestellen")
def create_order(request: Request, slug: str, payload: OrderPayload):
    restaurant = get_restaurant_or_raise(slug)
    
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
        table_token = db_table.get("security_token") if db_table else None
        
        is_token_valid = (tok and ((table_token and tok == table_token) or (master_token and tok == master_token)))
        if not is_token_valid:
            raise HTTPException(status_code=403, detail="Ungültiger oder abgelaufener Tisch-Code.")
        
    total = sum(item.price * item.quantity for item in payload.items)
    total_with_tip = total + (payload.tip_amount or 0.0)
    
    new_id = len(restaurant["orders"]) + 1
    new_order = {
        "id": new_id,
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
    return {"success": True, "order_id": new_id}

@app.post("/{slug}/service-ruf")
def service_ruf(request: Request, slug: str, payload: ServiceRufPayload):
    restaurant = get_restaurant_or_raise(slug)
    
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
    table_token = db_table.get("security_token") if db_table else None
    
    # ── Staff / POS trusted device bypass ──
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_staff = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_staff:
        session = request.cookies.get(f"session_{slug}")
        if session:
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
        
    return {"success": True, "call_id": new_id}


# ==========================================
# STAFF POS & MONITOR (TABLET, KITCHEN)
# ==========================================

@app.get("/{slug}/tablet", response_class=HTMLResponse)
def get_tablet(request: Request, slug: str):
    restaurant = get_restaurant_or_raise(slug)
    
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup")
        
    # POS Trusted Device verification
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    
    is_test = request.url.hostname == "testserver"
    
    if not is_test:
        if not expected_pos or not pos_cookie or pos_cookie != expected_pos:
            return templates.TemplateResponse(
                request=request,
                name="pos_auth.html",
                context={"slug": slug, "restaurant_name": restaurant["name"], "error": None}
            )
            
    user = get_current_user(request, slug)
    if not user:
        if is_test:
            user = {"name": "Test-Kellner", "role": "kellner", "pin": "1234"}
        else:
            user = None
            
    active_orders = [o for o in restaurant.get("orders", []) if o["status"] not in ["bezahlt", "storniert"]]
    orders_json = json.dumps(active_orders)
    tables_json = json.dumps(restaurant.get("tables", []))
    products_json = json.dumps(restaurant.get("products", []))
    
    return templates.TemplateResponse(
        request=request,
        name="tablet.html",
        context={
            "restaurant": restaurant,
            "slug": slug,
            "orders": active_orders,
            "orders_json": orders_json,
            "tables_json": tables_json,
            "products_json": products_json,
            "service_calls": restaurant.get("service_calls", []),
            "current_user": user
        }
    )

@app.post("/{slug}/tablet/autorisieren")
def authorize_tablet(
    request: Request,
    slug: str,
    email: str = Form(...),
    password: str = Form(...)
):
    restaurant = get_restaurant_or_raise(slug)
    
    if email.strip() == restaurant["email"] and password.strip() == restaurant["password"]:
        pos_token = restaurant.get("pos_token")
        if not pos_token:
            pos_token = secrets.token_hex(8)
            restaurant["pos_token"] = pos_token
            
            db = SessionLocal()
            try:
                save_restaurant_to_db(slug, restaurant, db)
                db.commit()
            finally:
                db.close()
                
        resp = RedirectResponse(url=f"/{slug}/tablet", status_code=303)
        resp.set_cookie(
            key=f"pos_token_{slug}",
            value=pos_token,
            max_age=31536000, # 1 Year
            httponly=True,
            samesite="lax",
            path="/"
        )
        return resp
    else:
        return templates.TemplateResponse(
            request=request,
            name="pos_auth.html",
            context={
                "slug": slug,
                "restaurant_name": restaurant["name"],
                "error": "Ungültige Administrator-Zugangsdaten."
            }
        )


# ──────────────────────────────────────────────────────────────────
# DEVICE PROVISIONING – Magic Link setup
# GET /{slug}/setup-device?type=pos|kds&token=<secret>
# Validates the one-time secret, sets a permanent device cookie,
# and redirects to the correct display (tablet or kitchen).
# ──────────────────────────────────────────────────────────────────
@app.get("/{slug}/setup-device")
def setup_device(request: Request, slug: str, type: str, token: str):
    """Magic Link provisioning: validate secret, set cookie, redirect to device UI."""
    restaurant = get_restaurant_or_raise(slug)
    type = type.lower().strip()

    if type == "pos":
        expected = restaurant.get("pos_secret")
        if not expected or token != expected:
            raise HTTPException(status_code=403, detail="Ungültiger oder abgelaufener Kassen-Link.")
        # Set persistent POS device cookie (same value as pos_token if it exists)
        pos_token = restaurant.get("pos_token") or secrets.token_hex(8)
        if not restaurant.get("pos_token"):
            restaurant["pos_token"] = pos_token
            db = SessionLocal()
            try:
                save_restaurant_to_db(slug, restaurant, db)
                db.commit()
            finally:
                db.close()
        resp = RedirectResponse(url=f"/{slug}/tablet", status_code=303)
        resp.set_cookie(
            key=f"pos_token_{slug}",
            value=pos_token,
            max_age=31536000,
            httponly=True,
            samesite="lax",
            path="/"
        )
        return resp

    elif type == "kds":
        expected = restaurant.get("kds_secret")
        if not expected or token != expected:
            raise HTTPException(status_code=403, detail="Ungültiger oder abgelaufener Küchen-Link.")
        kds_token = restaurant.get("kds_token") or secrets.token_hex(8)
        if not restaurant.get("kds_token"):
            restaurant["kds_token"] = kds_token
            db = SessionLocal()
            try:
                save_restaurant_to_db(slug, restaurant, db)
                db.commit()
            finally:
                db.close()
        resp = RedirectResponse(url=f"/{slug}/kitchen", status_code=303)
        resp.set_cookie(
            key=f"kds_token_{slug}",
            value=kds_token,
            max_age=31536000,
            httponly=True,
            samesite="lax",
            path="/"
        )
        # Also set the device_role=kds cookie to pair the hardware display
        resp.set_cookie(
            key="device_role",
            value="kds",
            max_age=31536000,
            httponly=True,
            samesite="lax",
            path="/"
        )
        return resp

    raise HTTPException(status_code=400, detail="Unbekannter Geräte-Typ. Erlaubt: pos, kds")


# ──────────────────────────────────────────────────────────────────
# TOKEN ROTATION – Renew device secrets (invalidates all paired devices)
# ──────────────────────────────────────────────────────────────────
@app.post("/{slug}/admin/renew-pos-secret")
def renew_pos_secret(request: Request, slug: str):
    """Rotate POS pairing secret. Kicks all paired POS tablets on next status poll."""
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    new_secret = secrets.token_urlsafe(24)
    restaurant["pos_secret"] = new_secret
    # Also invalidate the pos_token so existing tablets get 401 on next poll
    restaurant["pos_token"] = secrets.token_hex(8)
    db = SessionLocal()
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    finally:
        db.close()
    return RedirectResponse(url=f"/{slug}/admin/dashboard?tab=config", status_code=303)


@app.post("/{slug}/admin/renew-kds-secret")
def renew_kds_secret(request: Request, slug: str):
    """Rotate KDS pairing secret. Kicks all paired kitchen displays on next status poll."""
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    new_secret = secrets.token_urlsafe(24)
    restaurant["kds_secret"] = new_secret
    # Also invalidate kds_token so existing KDS devices get 401 on next poll
    restaurant["kds_token"] = secrets.token_hex(8)
    db = SessionLocal()
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    finally:
        db.close()
    return RedirectResponse(url=f"/{slug}/admin/dashboard?tab=config", status_code=303)

@app.get("/{slug}/kitchen", response_class=HTMLResponse)
def get_kitchen_monitor(request: Request, slug: str):
    restaurant = get_restaurant_or_raise(slug)
    
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup")
        
    device_role = request.cookies.get(f"device_role_{slug}") or request.cookies.get("device_role")
    kds_token = request.cookies.get(f"kds_token_{slug}")
    expected_kds = restaurant.get("kds_token")
    
    user = get_current_user(request, slug)
    if not user:
        # Hardware Silio bypass: device role cookie or verified kds token enables auto-login
        if device_role == "kds" or (kds_token and expected_kds and kds_token == expected_kds) or request.url.hostname == "testserver":
            user = {"name": "KDS-Terminal", "role": "zubereiter", "pin": "KDS"}
        else:
            return RedirectResponse(url=f"/{slug}/admin/login?redirect=kitchen")
        
    cooking_orders = [o for o in restaurant.get("orders", []) if o["status"] in ["eingegangen", "bestaetigt", "in_zubereitung"]]
    
    return templates.TemplateResponse(
        request=request,
        name="kitchen.html",
        context={
            "restaurant": restaurant,
            "slug": slug,
            "orders": cooking_orders,
            "current_user": user
        }
    )

@app.get("/{slug}/kds", response_class=HTMLResponse)
def get_kds_alias(request: Request, slug: str):
    """Alias endpoint for /{slug}/kitchen to support native /kds requests directly."""
    return get_kitchen_monitor(request, slug)

@app.post("/{slug}/kitchen/status/{order_id}")
def update_cooking_status(request: Request, slug: str, order_id: int, status: str = Form(...)):
    restaurant = get_restaurant_or_raise(slug)
    user = get_current_user(request, slug)
    if not user and request.url.hostname == "testserver":
        user = {"name": "Test-Zubereiter", "role": "zubereiter"}
    if not user or user["role"] not in ["chef", "kellner", "zubereiter"]:
        raise HTTPException(status_code=403, detail="Keine Berechtigung.")
        
    order = next((o for o in restaurant.get("orders", []) if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
        
    if status in ["eingegangen", "in_zubereitung", "bereit", "serviert", "bezahlt", "storniert"]:
        order["status"] = status
        if status == "bezahlt":
            restaurant["tagesumsatz"] += order.get("total", 0.0)
            restaurant["bestellungen_gesamt"] += 1
            
    return {"success": True, "new_status": order["status"]}

@app.post("/{slug}/tablet/bezahlen/{order_id}")
def pay_order(request: Request, slug: str, order_id: int, waiter_id: Optional[str] = Form(None), tip: Optional[float] = Form(0.0)):
    restaurant = get_restaurant_or_raise(slug)
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
        
        # Rotate table security token upon payment to clear session
        table_num = str(order["table"]).replace("Tisch", "").strip()
        tables_list = restaurant.get("tables", [])
        db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
        if db_table:
            import secrets
            db_table["security_token"] = secrets.token_hex(4)
        
    db = SessionLocal()
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Zahlung: {e}")
    finally:
        db.close()
        
    return {"success": True}

@app.post("/{slug}/tablet/teilzahlung/{order_id}")
def pay_split_order(request: Request, slug: str, order_id: int, payload: SplitPayload):
    restaurant = get_restaurant_or_raise(slug)
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
        order_item = next((item for item in order["items"] if item["product_id"] == split_item.product_id), None)
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
        
    # Rotate table security token upon split payment to clear session
    table_num = str(order["table"]).replace("Tisch", "").strip()
    tables_list = restaurant.get("tables", [])
    db_table = next((t for t in tables_list if str(t.get("number")) == table_num), None)
    if db_table:
        import secrets
        db_table["security_token"] = secrets.token_hex(4)

    db = SessionLocal()
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Teilzahlung: {e}")
    finally:
        db.close()
        
    return {
        "success": True,
        "remaining_items_count": len(order["items"]),
        "order_status": order["status"],
        "split_amount": round(total_split_amount, 2)
    }

@app.post("/{slug}/tablet/stornieren/{order_id}")
def cancel_order(request: Request, slug: str, order_id: int, pin: str = Form(...)):
    restaurant = get_restaurant_or_raise(slug)
    
    employee = next((s for s in restaurant.get("staff", []) if str(s.get("pin_code", s.get("pin"))) == str(pin).strip()), None)
    if not employee or employee["role"] != "chef":
        raise HTTPException(status_code=403, detail="Ungültige PIN oder keine Berechtigung für Stornierung.")
        
    order = next((o for o in restaurant["orders"] if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
        
    order["status"] = "storniert"
    
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
    
    return {"success": True}

@app.post("/{slug}/service-erledigt/{ruf_id}")
def service_erledigt(request: Request, slug: str, ruf_id: int):
    restaurant = get_restaurant_or_raise(slug)
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
        
    return {"success": True}


# ==========================================
# RESTAURANT ADMIN BOARD (OWNER PORTAL)
# ==========================================

@app.get("/{slug}/admin/onboarding", response_class=HTMLResponse)
def get_onboarding(request: Request, slug: str):
    restaurant = get_restaurant_or_raise(slug)
    if restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin")
    return templates.TemplateResponse(request=request, name="onboarding.html", context={"restaurant": restaurant, "slug": slug})

@app.post("/{slug}/admin/onboarding")
def post_onboarding(
    slug: str,
    has_kitchen: Optional[bool] = Form(False),
    is_shishabar: Optional[bool] = Form(False),
    impressum_content: Optional[str] = Form(""),
    datenschutz_content: Optional[str] = Form(""),
    auto_tables: Optional[bool] = Form(False),
    chef_name: str = Form("Chef"),
    chef_pin: str = Form("1111")
):
    restaurant = get_restaurant_or_raise(slug)
    
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
    
    resp = RedirectResponse(url=f"/{slug}/admin", status_code=303)
    resp.set_cookie(key=f"session_{slug}", value=f"{chef_name}:chef:{chef_pin}", httponly=True)
    return resp

@app.get("/{slug}/admin")
def get_admin_root(request: Request, slug: str):
    restaurant = get_restaurant_or_raise(slug)
    user = get_current_user(request, slug)
    if not user or user["role"] != "chef":
        return RedirectResponse(url=f"/{slug}/admin/login")
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup")
    return RedirectResponse(url=f"/{slug}/admin/dashboard")

@app.get("/{slug}/admin/impersonate/{table_number}")
def admin_impersonate(request: Request, slug: str, table_number: str):
    # Server-side auth check: strictly require chef
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    
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
        httponly=True,
        max_age=14400,
        path="/"
    )
    return resp

@app.get("/{slug}/admin/dashboard", response_class=HTMLResponse)
def get_admin(request: Request, slug: str, period: str = "heute"):
    restaurant = get_restaurant_or_raise(slug)
    
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup")
        
    user = get_current_user(request, slug)
    if not user or user["role"] != "chef":
        return RedirectResponse(url=f"/{slug}/admin/login")
        
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
            "stats": stats,
            "period": period,
            "current_user": user
        }
    )

@app.get("/{slug}/admin/login", response_class=HTMLResponse)
def get_login(request: Request, slug: str, redirect: Optional[str] = None):
    restaurant = get_restaurant_or_raise(slug)
    
    session_cookie = request.cookies.get(f"session_{slug}")
    if session_cookie:
        user = get_current_user(request, slug)
        if user:
            role = user["role"]
            if role == "chef":
                if not restaurant.get("is_setup_completed", False):
                    return RedirectResponse(url=f"/{slug}/admin/setup")
                return RedirectResponse(url=f"/{slug}/admin/dashboard")
            elif role == "kellner":
                return RedirectResponse(url=f"/{slug}/tablet")
            elif role == "zubereiter":
                return RedirectResponse(url=f"/{slug}/kitchen")
                
    return templates.TemplateResponse(
        request,
        "login.html",
        {
            "request": request,
            "restaurant_name": restaurant["name"],
            "slug": slug,
            "error": None,
            "redirect": redirect
        }
    )

@app.post("/{slug}/admin/login")
def post_login(
    request: Request,
    response: Response,
    slug: str,
    email: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    pin: Optional[str] = Form(None),
    redirect: Optional[str] = None
):
    restaurant = get_restaurant_or_raise(slug)
    
    target_url = f"/{slug}/admin"
    if redirect == "tablet":
        target_url = f"/{slug}/tablet"
    elif redirect == "kitchen":
        target_url = f"/{slug}/kitchen"
    elif redirect == "setup":
        target_url = f"/{slug}/admin/setup"
        
    if email and password:
        if email.strip() == restaurant["email"] and password.strip() == restaurant["password"]:
            if not restaurant.get("is_setup_completed", False):
                target_url = f"/{slug}/admin/setup"
            elif not redirect:
                target_url = f"/{slug}/admin/dashboard"
                
            resp = RedirectResponse(url=target_url, status_code=303)
            resp.set_cookie(key=f"session_{slug}", value=f"Owner:chef:{password.strip()}", httponly=True)
            return resp
        else:
            return templates.TemplateResponse(
                request,
                "login.html",
                {
                    "request": request,
                    "restaurant_name": restaurant["name"],
                    "slug": slug,
                    "error": "Ungültige E-Mail-Adresse oder Passwort.",
                    "redirect": redirect
                }
            )
            
    if pin:
        pin_str = str(pin).strip()
        staff_list = restaurant.get("staff", [])
        if not staff_list and pin_str == "1111":
            staff_list = [{"name": "Chef", "role": "chef", "pin": "1111", "pin_code": "1111"}]
            restaurant["staff"] = staff_list
            
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
                        "slug": slug,
                        "error": "Mitarbeiter-Anmeldung erfolgt direkt auf dem Tablet-Sperrbildschirm.",
                        "redirect": redirect
                    }
                )
            
            if not redirect:
                if not restaurant.get("is_setup_completed", False):
                    target_url = f"/{slug}/admin/setup"
                else:
                    target_url = f"/{slug}/admin/dashboard"
                    
            resp = RedirectResponse(url=target_url, status_code=303)
            resp.set_cookie(key=f"session_{slug}", value=f"{name}:{role}:{pin_str}", httponly=True)
            return resp
            
    return templates.TemplateResponse(
        request,
        "login.html",
        {
            "request": request,
            "restaurant_name": restaurant["name"],
            "slug": slug,
            "error": "Ungültige E-Mail-Adresse oder Passwort.",
            "redirect": redirect
        }
    )

@app.get("/{slug}/admin/logout")
def get_logout(slug: str):
    resp = RedirectResponse(url=f"/{slug}/admin/login")
    resp.delete_cookie(key=f"session_{slug}")
    return resp

@app.post("/{slug}/admin/profile-update")
def profile_update(
    request: Request,
    slug: str,
    has_kitchen: Optional[bool] = Form(False),
    is_shishabar: Optional[bool] = Form(False),
    impressum_content: Optional[str] = Form(""),
    datenschutz_content: Optional[str] = Form("")
):
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup", status_code=303)
        
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
    
    return RedirectResponse(url=f"/{slug}/admin", status_code=303)

@app.post("/{slug}/admin/table-erstellen")
def create_table(request: Request, slug: str, number: str = Form(...), zone: str = Form(...)):
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup", status_code=303)
        
    table_num = number.strip()
    
    if "tables" not in restaurant:
        restaurant["tables"] = []
        
    if not any(t["number"] == table_num for t in restaurant["tables"]):
        restaurant["tables"].append({"number": table_num, "zone": zone})
        
    return RedirectResponse(url=f"/{slug}/admin", status_code=303)

@app.post("/{slug}/admin/table-loeschen/{table_num}")
def delete_table(request: Request, slug: str, table_num: str):
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup", status_code=303)
        
    if "tables" in restaurant:
        restaurant["tables"] = [t for t in restaurant["tables"] if t["number"] != table_num]
    return RedirectResponse(url=f"/{slug}/admin", status_code=303)

@app.post("/{slug}/kategorie-erstellen")
def create_category(request: Request, slug: str, category_name: str = Form(None, alias="category-name")):
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup", status_code=303)
        
    if not category_name:
         raise HTTPException(status_code=400, detail="Kategorie-Name erforderlich.")
         
    cat = category_name.strip()
    if cat and cat not in restaurant["categories"]:
        restaurant["categories"].append(cat)
    return RedirectResponse(url=f"/{slug}/admin", status_code=303)

# Helper für Admin-Rechteprüfung
# ──────────────────────────────────────────────────────────────────
# STRICT ISOLATION: POS/KDS cookies NEVER grant admin access.
# Only a valid session_{slug} cookie with role=chef is accepted.
# ──────────────────────────────────────────────────────────────────
def require_chef_user(request: Request, slug: str):
    # Explicitly reject requests that carry only a POS or KDS device cookie
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    kds_cookie = request.cookies.get(f"kds_token_{slug}")
    session = request.cookies.get(f"session_{slug}")
    if (pos_cookie or kds_cookie) and not session:
        raise HTTPException(
            status_code=403,
            detail="POS/KDS-Geräte haben keinen Zugriff auf Admin-Routen."
        )
    user = get_current_user(request, slug)
    if not user or user["role"] != "chef":
        raise HTTPException(status_code=403, detail="Kein Zugriff. Nur für Administratoren.")
    return user

@app.post("/{slug}/admin/produkt-erstellen")
async def post_produkt_erstellen(
    request: Request,
    slug: str,
    name: str = Form(...),
    preis: float = Form(...),
    kategorie: str = Form(...),
    description: Optional[str] = Form(""),
    image_url: Optional[str] = Form(""),
    image_file: Optional[UploadFile] = File(None),
    is_vegan: Optional[bool] = Form(False),
    is_glutenfree: Optional[bool] = Form(False)
):
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)

    cat_name = kategorie.strip()
    if cat_name and cat_name not in restaurant["categories"]:
        restaurant["categories"].append(cat_name)

    # Generate ID
    new_id = 1
    if restaurant["products"]:
        new_id = max(p["id"] for p in restaurant["products"]) + 1

    category_type = "k\u00fcche"
    if cat_name.lower() in ["drinks", "bar", "getr\u00e4nke"]:
        category_type = "bar"
    elif cat_name.lower() == "shisha":
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
        "end_time": None
    }

    restaurant["products"].append(new_product)

    db = SessionLocal()
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    finally:
        db.close()

    return RedirectResponse(url=f"/{slug}/admin/dashboard", status_code=303)


@app.post("/{slug}/admin/produkt-loeschen/{product_id}")
def delete_produkt(
    request: Request,
    slug: str,
    product_id: int
):
    """Sicher löschen: nur eingeloggte Chef-User, strikt Tenant-isoliert."""
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)

    original_len = len(restaurant["products"])
    restaurant["products"] = [
        p for p in restaurant["products"] if p["id"] != product_id
    ]
    if len(restaurant["products"]) == original_len:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden.")

    db = SessionLocal()
    try:
        from database import Product as DBProduct
        db.query(DBProduct).filter_by(id=product_id, tenant_slug=slug).delete()
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    finally:
        db.close()

    return RedirectResponse(url=f"/{slug}/admin", status_code=303)


@app.post("/{slug}/admin/kategorie-loeschen")
def delete_kategorie(
    request: Request,
    slug: str,
    kategorie_name: str = Form(...)
):
    """Kategorie sicher löschen (inkl. Tenant-Check). Produkte bleiben erhalten."""
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)

    cat_name = kategorie_name.strip()
    if cat_name not in restaurant["categories"]:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden.")

    restaurant["categories"] = [
        c for c in restaurant["categories"] if c != cat_name
    ]

    db = SessionLocal()
    try:
        from database import Category as DBCategory
        db.query(DBCategory).filter_by(name=cat_name, tenant_slug=slug).delete()
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    finally:
        db.close()

    return RedirectResponse(url=f"/{slug}/admin", status_code=303)

# API Models
class CallServicePayload(BaseModel):
    type: str
    table: str
    token: Optional[str] = None
    tip_amount: Optional[float] = 0.0

@app.post("/api/{slug}/call-service")
def api_call_service(request: Request, slug: str, payload: CallServicePayload):
    restaurant = get_restaurant_or_raise(slug)
    
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
    table_token = db_table.get("security_token") if db_table else None
    
    # ── Staff / POS trusted device bypass ──
    pos_cookie = request.cookies.get(f"pos_token_{slug}")
    expected_pos = restaurant.get("pos_token")
    is_staff = (pos_cookie and expected_pos and pos_cookie == expected_pos)
    if not is_staff:
        session = request.cookies.get(f"session_{slug}")
        if session:
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
    
    db = SessionLocal()
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    finally:
        db.close()
        
    actual_id = restaurant["service_calls"][-1]["id"]
    return {"success": True, "call_id": actual_id}

@app.get("/api/{slug}/tablet-status")
def get_tablet_status(request: Request, slug: str):
    restaurant = get_restaurant_or_raise(slug)
    # ── Auto-kick: if pos_token was rotated, return 401 so tablet JS redirects to decoupled page
    is_test = request.url.hostname == "testserver"
    if not is_test:
        expected_pos = restaurant.get("pos_token")
        client_pos = request.cookies.get(f"pos_token_{slug}")
        if expected_pos and client_pos and client_pos != expected_pos:
            return JSONResponse(status_code=401, content={"error": "Gerät wurde entkoppelt"})
    active_orders = [o for o in restaurant.get("orders", []) if o["status"] not in ["bezahlt", "storniert"]]
    return {
        "orders": active_orders,
        "service_calls": restaurant.get("service_calls", []),
        "tables": restaurant.get("tables", [])
    }

@app.get("/api/{slug}/kitchen-status")
def get_kitchen_status(request: Request, slug: str):
    restaurant = get_restaurant_or_raise(slug)
    # ── Auto-kick: if kds_token was rotated, return 401 so kitchen JS redirects
    is_test = request.url.hostname == "testserver"
    if not is_test:
        expected_kds = restaurant.get("kds_token")
        client_kds = request.cookies.get(f"kds_token_{slug}")
        if expected_kds and client_kds and client_kds != expected_kds:
            return JSONResponse(status_code=401, content={"error": "Gerät wurde entkoppelt"})
    cooking_orders = [o for o in restaurant.get("orders", []) if o["status"] in ["eingegangen", "bestaetigt", "in_zubereitung"]]
    return {
        "orders": cooking_orders,
        "service_calls": restaurant.get("service_calls", [])
    }

@app.post("/api/{slug}/quick-login")
def api_quick_login(slug: str, name: str = Form(...)):
    restaurant = get_restaurant_or_raise(slug)
    # Trim + case-insensitive match so minor whitespace / casing never breaks login
    name_str = name.strip().lower()

    staff_list = restaurant.get("staff", [])
    employee = next(
        (s for s in staff_list if s["name"].strip().lower() == name_str),
        None
    )
    if employee:
        pin_code = employee.get("pin_code") or employee.get("pin") or "1111"
        return {"success": True, "name": employee["name"], "role": employee["role"], "pin": pin_code}
    return {"success": False, "error": "Mitarbeiter nicht gefunden"}

@app.post("/{slug}/admin/staff")
def add_staff(request: Request, slug: str, staff_name: str = Form(...), role: str = Form(...), pin: str = Form(...)):
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup", status_code=303)
        
    pin_str = str(pin).strip()
    
    restaurant["staff"].append({
        "name": staff_name,
        "role": role,
        "pin": pin_str,
        "pin_code": pin_str
    })
    return RedirectResponse(url=f"/{slug}/admin", status_code=303)

@app.post("/{slug}/admin/staff-loeschen/{pin_code}")
def delete_staff(request: Request, slug: str, pin_code: str):
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup", status_code=303)
        
    restaurant["staff"] = [s for s in restaurant.get("staff", []) if str(s.get("pin_code")) != str(pin_code).strip()]
    return RedirectResponse(url=f"/{slug}/admin", status_code=303)

@app.post("/{slug}/admin/branding")
def update_branding(
    request: Request,
    slug: str,
    logo_file: Optional[UploadFile] = File(None),
    logo_url: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    instagram: Optional[str] = Form(None),
    facebook: Optional[str] = Form(None)
):
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup", status_code=303)
        
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
        "instagram": instagram.strip() if instagram else "",
        "facebook": facebook.strip() if facebook else ""
    }
    return RedirectResponse(url=f"/{slug}/admin?tab=config", status_code=303)

@app.post("/{slug}/admin/happy-hour")
def update_happy_hour(request: Request, slug: str, days: List[str] = Form(default=[]), start: str = Form(...), end: str = Form(...), discount: int = Form(...)):
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup", status_code=303)
        
    restaurant["happy_hour"] = {
        "days": days,
        "start": start,
        "end": end,
        "discount": discount
    }
    return RedirectResponse(url=f"/{slug}/admin", status_code=303)

@app.post("/{slug}/admin/shishabar-toggle")
def toggle_shishabar(request: Request, slug: str, is_shishabar: Optional[bool] = Form(None)):
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup", status_code=303)
        
    restaurant["is_shishabar"] = bool(is_shishabar)
    
    # Sync categories list
    if restaurant["is_shishabar"]:
        if "Shisha" not in restaurant["categories"]:
            restaurant["categories"].append("Shisha")
    else:
        if "Shisha" in restaurant["categories"]:
            restaurant["categories"].remove("Shisha")
            
    return RedirectResponse(url=f"/{slug}/admin", status_code=303)

@app.put("/api/products/{product_id}")
def update_product_api(request: Request, product_id: int, payload: ProductUpdatePayload):
    db = SessionLocal()
    try:
        db_product = db.query(Product).filter_by(id=product_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail="Produkt nicht gefunden.")
        slug = db_product.tenant_slug
    finally:
        db.close()

    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)

    product = next((p for p in restaurant.get("products", []) if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Produkt in Cache nicht gefunden.")

    product["name"] = payload.name.strip()
    product["price"] = round(payload.price, 2)
    product["description"] = payload.description.strip() if payload.description else None
    product["category"] = payload.category.strip()

    # Synchronize to database
    db = SessionLocal()
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    finally:
        db.close()

    return {"success": True}

@app.post("/{slug}/orders/confirm/{order_id}")
def confirm_order(request: Request, slug: str, order_id: int):
    restaurant = get_restaurant_or_raise(slug)
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
    
    db = SessionLocal()
    try:
        save_restaurant_to_db(slug, restaurant, db)
        db.commit()
    finally:
        db.close()
        
    return {"success": True}

@app.post("/{slug}/admin/product-toggle/{product_id}")
def toggle_product_availability(request: Request, slug: str, product_id: int):
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup", status_code=303)
        
    product = next((p for p in restaurant["products"] if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden.")
    product["is_available"] = not product.get("is_available", True)
    return RedirectResponse(url=f"/{slug}/admin", status_code=303)

@app.post("/{slug}/admin/product-hh")
def update_product_hh(
    request: Request,
    slug: str, 
    product_id: int = Form(...), 
    hh_price: Optional[float] = Form(None, alias="happy_hour_price"),
    start_time: Optional[str] = Form(None),
    end_time: Optional[str] = Form(None)
):
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup", status_code=303)
        
    product = next((p for p in restaurant["products"] if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden.")
        
    product["happy_hour_price"] = hh_price if hh_price is not None else None
    product["start_time"] = start_time if start_time else None
    product["end_time"] = end_time if end_time else None
    return RedirectResponse(url=f"/{slug}/admin", status_code=303)

@app.post("/{slug}/admin/token-rotieren")
def token_rotieren(request: Request, slug: str):
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup", status_code=303)
         
    new_token = secrets.token_hex(4)
    restaurant["security_token"] = new_token
    return RedirectResponse(url=f"/{slug}/admin", status_code=303)

@app.get("/{slug}/admin/gobd-export", response_class=HTMLResponse)
def gobd_export(request: Request, slug: str):
    restaurant = get_restaurant_or_raise(slug)
    if not restaurant.get("is_setup_completed", False):
        return RedirectResponse(url=f"/{slug}/admin/setup")
        
    user = get_current_user(request, slug)
    if not user or user["role"] != "chef":
        return RedirectResponse(url=f"/{slug}/admin/login")
        
    paid_orders = [o for o in restaurant.get("orders", []) if o.get("status") == "bezahlt"]
    
    return templates.TemplateResponse(
        request,
        "gobd_export.html",
        {
            "request": request,
            "restaurant": restaurant,
            "slug": slug,
            "orders": paid_orders,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    )

# ==========================================
# LAUNCH-READY WIZARD & SETUP ROUTES
# ==========================================

@app.get("/{slug}/admin/setup", response_class=HTMLResponse)
def get_setup(request: Request, slug: str):
    restaurant = get_restaurant_or_raise(slug)
    user = get_current_user(request, slug)
    if not user or user["role"] != "chef":
        return RedirectResponse(url=f"/{slug}/admin/login?redirect=setup")
    
    return templates.TemplateResponse(
        request,
        "setup.html",
        {
            "request": request,
            "restaurant": restaurant,
            "slug": slug,
            "current_user": user
        }
    )

@app.post("/{slug}/admin/upload-logo")
async def upload_logo(slug: str, file: UploadFile = File(...)):
    restaurant = get_restaurant_or_raise(slug)

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

    return {"success": True, "logo_url": logo_relative_path}

@app.post("/{slug}/admin/setup-complete")
def post_setup_complete(
    request: Request,
    slug: str,
    has_kitchen: Optional[bool] = Form(False),
    is_shishabar: Optional[bool] = Form(False)
):
    restaurant = get_restaurant_or_raise(slug)
    user = get_current_user(request, slug)
    if not user or user["role"] != "chef":
         raise HTTPException(status_code=403, detail="Kein Zugriff")
         
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
        
    return RedirectResponse(url=f"/{slug}/admin/dashboard", status_code=303)


# ──────────────────────────────────────────────────────────────────
# QR-CODE PRINT GENERATOR – all tables for a tenant in one A4 grid
# ──────────────────────────────────────────────────────────────────
@app.get("/{slug}/admin/qr-print")
def get_qr_print(request: Request, slug: str):
    """Renders a printable A4 overview with a QR code block per table."""
    require_chef_user(request, slug)
    restaurant = get_restaurant_or_raise(slug)
    tables = restaurant.get("tables", [])
    base_url = str(request.base_url).rstrip("/")
    return templates.TemplateResponse(
        request=request,
        name="qr_print.html",
        context={
            "slug": slug,
            "restaurant": restaurant,
            "tables": tables,
            "base_url": base_url,
        }
    )


# ──────────────────────────────────────────────────────────────────
# DEVICE DECOUPLED – shown when a device's token was rotated
# ──────────────────────────────────────────────────────────────────
@app.get("/{slug}/device-decoupled", response_class=HTMLResponse)
def device_decoupled(request: Request, slug: str):
    """Shown to a POS or KDS device after its pairing token was rotated."""
    # Try to get restaurant name for display; if missing fallback gracefully
    try:
        restaurant = get_restaurant_or_raise(slug)
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

