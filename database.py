import os
import json
import copy
import contextvars
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.engine import Engine
from sqlalchemy import event

# ──────────────────────────────────────────────────────────────────
# DATABASE ENGINE – auto-switch between PostgreSQL and SQLite
# ──────────────────────────────────────────────────────────────────
# On production (Hetzner / Coolify) set the DATABASE_URL environment
# variable, e.g.:
#   DATABASE_URL=postgresql://user:pass@db-host:5432/digi_gastro
#
# Heroku / Railway may provide "postgres://" – we normalise that.
# Locally (no DATABASE_URL) we fall back to SQLite for easy dev.
# ──────────────────────────────────────────────────────────────────

_raw_db_url = os.getenv("DATABASE_URL", "")

if _raw_db_url:
    # Normalise legacy Heroku-style prefix
    if _raw_db_url.startswith("postgres://"):
        _raw_db_url = _raw_db_url.replace("postgres://", "postgresql://", 1)

    DATABASE_URL = _raw_db_url
    _IS_POSTGRES = True

    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,      # detect stale connections
        pool_size=10,            # keep 10 connections warm
        max_overflow=20,         # allow up to 30 total under burst
        pool_timeout=30,         # wait 30 s before giving up
        pool_recycle=1800,       # recycle connections after 30 min
    )
else:
    # ── Local development fallback: SQLite ──────────────────────
    DATABASE_URL = "sqlite:///digi_gastro.db"
    _IS_POSTGRES = False

    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )

print(f"[DB] Using {'PostgreSQL' if _IS_POSTGRES else 'SQLite (local fallback)'} backend")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Enforce foreign key constraints in SQLite (no-op on PostgreSQL)
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if not _IS_POSTGRES:
        try:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()
        except Exception:
            pass


# ----------------------------------------------------
# DATABASE MODELS
# ----------------------------------------------------

class Tenant(Base):
    __tablename__ = 'tenants'
    
    slug = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    password = Column(String, nullable=False)
    tagesumsatz = Column(Float, default=0.0)
    bestellungen_gesamt = Column(Integer, default=0)
    active = Column(Boolean, default=True)
    is_onboarded = Column(Boolean, default=False)
    is_setup_completed = Column(Boolean, default=False)
    has_kitchen = Column(Boolean, default=False)
    is_shishabar = Column(Boolean, default=False)
    impressum_content = Column(Text, default="")
    datenschutz_content = Column(Text, default="")
    security_token = Column(String, default="")
    pos_token = Column(String, nullable=True)
    # Device provisioning secrets (Magic Link)
    pos_secret = Column(String, nullable=True)  # one-time pairing secret for POS tablet
    kds_secret = Column(String, nullable=True)  # one-time pairing secret for KDS/kitchen display
    
    # Branding
    address = Column(String, default="")
    indigo = Column(String, default="")
    instagram = Column(String, default="")
    facebook = Column(String, default="")
    logo_url = Column(Text, default="")
    logo_path = Column(String, nullable=True)
    
    # Happy Hour
    happy_hour_days = Column(Text, default="[]")  # stored as JSON array string
    happy_hour_start = Column(String, default="18:00")
    happy_hour_end = Column(String, default="20:00")
    happy_hour_discount = Column(Integer, default=0)

class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)

class Product(Base):
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(Text, default="")
    image = Column(Text, default="")
    vegan = Column(Boolean, default=False)
    is_vegan = Column(Boolean, default=False)
    is_glutenfree = Column(Boolean, default=False)
    allergens = Column(Text, default="[]")  # stored as JSON array string
    category_type = Column(String, default="küche")
    category = Column(String, nullable=False)
    is_available = Column(Boolean, default=True)
    happy_hour_price = Column(Float, nullable=True)
    start_time = Column(String, nullable=True)
    end_time = Column(String, nullable=True)

class Order(Base):
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    table = Column(String, nullable=False)
    total = Column(Float, default=0.0)
    total_with_tip = Column(Float, default=0.0)
    tip_amount = Column(Float, default=0.0)
    status = Column(String, default="eingegangen")
    timestamp = Column(String, nullable=False)
    mwst_rate = Column(Integer, default=19)
    waiter_id = Column(String, nullable=True)

class OrderItem(Base):
    __tablename__ = 'order_items'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey('orders.id', ondelete='CASCADE'), nullable=False)
    product_id = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    category_type = Column(String, default="küche")

class Staff(Base):
    __tablename__ = 'staff'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    pin = Column(String, nullable=False)
    pin_code = Column(String, nullable=False)

class ServiceCall(Base):
    __tablename__ = 'service_calls'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    table = Column(String, nullable=False)
    type = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)

class Table(Base):
    __tablename__ = 'tables'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    number = Column(String, nullable=False)
    zone = Column(String, nullable=False)
    security_token = Column(String, nullable=False, default="")

class AuditLog(Base):
    __tablename__ = 'audit_log'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    action = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    user = Column(String, nullable=True)
    details = Column(Text, nullable=True)

# Create all tables
Base.metadata.create_all(bind=engine)

# ── Dynamic DB Migrations (SQLite & Postgres) ───────────────
def _migrate_database():
    import sqlalchemy as sa
    inspector = sa.inspect(engine)
    
    # Migrate 'tenants' table
    tenant_columns = [c['name'] for c in inspector.get_columns('tenants')]
    with engine.begin() as conn:
        if 'security_token' not in tenant_columns:
            try:
                conn.execute(sa.text("ALTER TABLE tenants ADD COLUMN security_token VARCHAR DEFAULT ''"))
            except Exception:
                pass
        if 'pos_token' not in tenant_columns:
            try:
                conn.execute(sa.text("ALTER TABLE tenants ADD COLUMN pos_token VARCHAR"))
            except Exception:
                pass
        if 'pos_secret' not in tenant_columns:
            try:
                conn.execute(sa.text("ALTER TABLE tenants ADD COLUMN pos_secret VARCHAR"))
            except Exception:
                pass
        if 'kds_secret' not in tenant_columns:
            try:
                conn.execute(sa.text("ALTER TABLE tenants ADD COLUMN kds_secret VARCHAR"))
            except Exception:
                pass

    # Migrate 'tables' table
    table_columns = [c['name'] for c in inspector.get_columns('tables')]
    with engine.begin() as conn:
        if 'security_token' not in table_columns:
            try:
                conn.execute(sa.text("ALTER TABLE tables ADD COLUMN security_token VARCHAR DEFAULT ''"))
            except Exception:
                pass

try:
    _migrate_database()
except Exception as e:
    print(f"[DB Migration] Warnung: Migration fehlgeschlagen: {e}")

# ----------------------------------------------------
# SEED CONSTANTS
# ----------------------------------------------------

STANDARD_PRODUCTS = [
    {
        "id": 1,
        "name": "Premium Burger",
        "price": 14.50,
        "description": "Prime beef patty, aged cheddar, signature lounge sauce, crisp lettuce, brioche bun.",
        "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400",
        "vegan": False,
        "is_vegan": False,
        "is_glutenfree": False,
        "allergens": ["A", "G"],
        "category_type": "küche",
        "category": "Burger",
        "is_available": True,
        "happy_hour_price": 11.90,
        "start_time": "18:00",
        "end_time": "20:00"
    },
    {
        "id": 2,
        "name": "Truffle Mushroom",
        "price": 16.00,
        "description": "Roasted portobello, truffle mayo, swiss cheese, caramelized onions.",
        "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=400",
        "vegan": False,
        "is_vegan": False,
        "is_glutenfree": False,
        "allergens": ["A", "G"],
        "category_type": "küche",
        "category": "Burger",
        "is_available": True
    },
    {
        "id": 3,
        "name": "Beyond Burger",
        "price": 15.50,
        "description": "Plant-based patty, vegan cheddar, avocado smash, pico de gallo.",
        "image": "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=400",
        "vegan": True,
        "is_vegan": True,
        "is_glutenfree": True,
        "allergens": ["A"],
        "category_type": "küche",
        "category": "Burger",
        "is_available": True
    },
    {
        "id": 4,
        "name": "Spezi",
        "price": 3.50,
        "description": "0.33L cold beverage.",
        "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400",
        "vegan": True,
        "is_vegan": True,
        "is_glutenfree": True,
        "allergens": [],
        "category_type": "bar",
        "category": "Drinks",
        "is_available": True,
        "happy_hour_price": 2.50,
        "start_time": "18:00",
        "end_time": "20:00"
    },
    {
        "id": 5,
        "name": "Chocolate Lava Cake",
        "price": 6.50,
        "description": "Warm chocolate cake with vanilla ice cream.",
        "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400",
        "vegan": False,
        "is_vegan": False,
        "is_glutenfree": False,
        "allergens": ["A", "C", "G"],
        "category_type": "küche",
        "category": "Desserts",
        "is_available": True
    },
    {
        "id": 6,
        "name": "Caesar Salad",
        "price": 9.50,
        "description": "Romaine lettuce, croutons, parmesan, caesar dressing.",
        "image": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=400",
        "vegan": False,
        "is_vegan": False,
        "is_glutenfree": False,
        "allergens": ["C", "G", "D"],
        "category_type": "küche",
        "category": "Salads",
        "is_available": True
    }
]

INITIAL_RESTAURANTS = {}

# ----------------------------------------------------
# DATABASE SYNC & CONTEXT UTILS
# ----------------------------------------------------

_global_restaurants_cache = {}

def load_restaurant_from_db(slug: str, session) -> dict:
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
            "end_time": p.end_time
        })
        
    db_orders = session.query(Order).filter_by(tenant_slug=slug).order_by(Order.id).all()
    orders = []
    for o in db_orders:
        db_items = session.query(OrderItem).filter_by(order_id=o.id).order_by(OrderItem.id).all()
        items = [{
            "product_id": item.product_id,
            "name": item.name,
            "price": item.price,
            "quantity": item.quantity,
            "category_type": item.category_type
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
        "security_token": t.security_token
    } for t in db_tables]
    
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
            "instagram": tenant.instagram,
            "facebook": tenant.facebook,
            "logo_url": tenant.logo_url,
            "indigo": tenant.indigo
        },
        "happy_hour": {
            "days": json.loads(tenant.happy_hour_days or "[]"),
            "start": tenant.happy_hour_start,
            "end": tenant.happy_hour_end,
            "discount": tenant.happy_hour_discount
        },
        "tables": tables,
        "audit_log": audit_log
    }

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
    tenant.indigo = branding.get("indigo", "")
    tenant.instagram = branding.get("instagram", "")
    tenant.facebook = branding.get("facebook", "")
    tenant.logo_url = branding.get("logo_url", "")
    
    hh = r.get("happy_hour", {})
    tenant.happy_hour_days = json.dumps(hh.get("days", []))
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
        db_p.allergens = json.dumps(p.get("allergens", []))
        db_p.category_type = p.get("category_type", "küche")
        db_p.category = p.get("category", "")
        db_p.is_available = p.get("is_available", True)
        db_p.happy_hour_price = p.get("happy_hour_price")
        db_p.start_time = p.get("start_time")
        db_p.end_time = p.get("end_time")
        
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
            
        session.query(OrderItem).filter_by(order_id=db_o.id).delete()
        for item in o.get("items", []):
            db_item = OrderItem(
                order_id=db_o.id,
                product_id=item.get("product_id"),
                name=item.get("name"),
                price=item.get("price"),
                quantity=item.get("quantity"),
                category_type=item.get("category_type", "küche")
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
            security_token=tok
        )
        session.add(db_t)
        
    # 7. Update audit log
    session.query(AuditLog).filter_by(tenant_slug=slug).delete()
    for l in r.get("audit_log", []):
        db_l = AuditLog(
            tenant_slug=slug,
            action=l.get("action"),
            timestamp=l.get("timestamp"),
            user=l.get("user"),
            details=l.get("details")
        )
        session.add(db_l)
        
    session.commit()

# ----------------------------------------------------
# GET RESTAURANT HELPER (with Fallback Cache)
# ----------------------------------------------------

def get_restaurant(slug: str, create_if_missing: bool = False):
    slug_lower = slug.lower().strip()
    
    # 1. Check fallback in-memory cache first
    if slug_lower in _global_restaurants_cache:
        return _global_restaurants_cache[slug_lower]
        
    db = SessionLocal()
    try:
        tenant_dict = load_restaurant_from_db(slug_lower, db)
        if tenant_dict is not None:
            _global_restaurants_cache[slug_lower] = tenant_dict
            return tenant_dict
            
        # Only allow auto-creating the "demo" tenant or when explicitly requested
        if not create_if_missing and slug_lower != "demo":
            return None
            
        # 2. Create default fallback tenant structure
        new_tenant = {
            "name": slug.replace("-", " ").title(),
            "email": f"admin@{slug_lower}.de",
            "password": "password123",
            "tagesumsatz": 0.00,
            "bestellungen_gesamt": 0,
            "active": True,
            "is_onboarded": False,
            "is_setup_completed": False,
            "logo_path": None,
            "has_kitchen": False,
            "is_shishabar": False,
            "impressum_content": (
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
            "datenschutz_content": (
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
            "security_token": f"{slug_lower}2026",
            "pos_token": None,
            "pos_secret": None,  # Magic Link secret for POS tablet
            "kds_secret": None,  # Magic Link secret for KDS display
            "service_calls": [],
            "categories": ["Drinks", "Desserts"],
            "products": copy.deepcopy(STANDARD_PRODUCTS),
            "orders": [],
            "staff": [],
            "branding": {
                "address": "",
                "instagram": "",
                "facebook": "",
                "logo_url": "/static/images/digigastrologo.jpeg",
                "indigo": ""
            },
            "happy_hour": {
                "days": [],
                "start": "18:00",
                "end": "20:00",
                "discount": 0
            },
            "tables": [],
            "audit_log": []
        }
        
        # Always add the shisha product option, but it will only be visible if 'Shisha' category is active
        new_tenant["products"].append({
            "id": 7,
            "name": "Klassische Shisha",
            "price": 12.00,
            "description": "Premium traditional shisha.",
            "image": "https://images.unsplash.com/photo-1527137341206-1a2ab818aa6a?auto=format&fit=crop&q=80&w=400",
            "vegan": True,
            "is_vegan": True,
            "is_glutenfree": True,
            "allergens": [],
            "category_type": "shisha",
            "category": "Shisha",
            "is_available": True
        })
        
        save_restaurant_to_db(slug_lower, new_tenant, db)
        db.commit()
        tenant_dict = load_restaurant_from_db(slug_lower, db)
        _global_restaurants_cache[slug_lower] = tenant_dict
        return tenant_dict
    finally:
        db.close()

# ----------------------------------------------------
# RESTAURANTS PROXY
# ----------------------------------------------------

class RestaurantsProxy(dict):
    def __getitem__(self, slug):
        slug_lower = slug.lower().strip()
        return get_restaurant(slug_lower)
        
    def __setitem__(self, slug, value):
        slug_lower = slug.lower().strip()
        _global_restaurants_cache[slug_lower] = value
        
    def __contains__(self, slug):
        slug_lower = slug.lower().strip()
        if slug_lower in _global_restaurants_cache:
            return True
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
            db.query(OrderItem).delete()
            db.query(Order).delete()
            db.query(Product).delete()
            db.query(Category).delete()
            db.query(Tenant).delete()
            db.commit()
        finally:
            db.close()
        _global_restaurants_cache.clear()
        
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
