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
    plz = Column(String, default="")
    ort = Column(String, default="")
    indigo = Column(String, default="")
    instagram = Column(String, default="")
    facebook = Column(String, default="")
    tiktok = Column(String, default="")
    logo_url = Column(Text, default="")
    logo_path = Column(String, nullable=True)
    
    # Landing page configurations (JSON object)
    landing_page_json = Column(Text, default="{}")
    
    # Happy Hour / Aktionen
    happy_hour_days = Column(Text, default="[]")  # stored as JSON array string
    happy_hour_start = Column(String, default="18:00")
    happy_hour_end = Column(String, default="20:00")
    happy_hour_discount = Column(Integer, default=0)
    happy_hour_mode = Column(String, default="discount")  # "selected" = only chosen products, "discount" = % on everything
    happy_hour_display_name = Column(String, default="Aktion")  # What guests see: "Happy Hour", "Shisha Night", "Lunch Deal"
    theme = Column(String, default="dark")
    accepts_card_payment = Column(Boolean, default=True)
    price_mode = Column(String, default="brutto")  # "brutto" or "netto"


class SuperGroup(Base):
    """Hauptgruppen-System: fasst mehrere Kategorien zu einer Obergruppe zusammen.
    Wird verwendet für die Gruppierung im Kasse-Popup, Bon-Detail-Modal und PDF/Excel-Export.
    NULL super_group_id auf Category = automatisch 'Sonstiges' Bucket (kein Eintrag hier)."""
    __tablename__ = 'super_groups'

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)
    position = Column(Integer, default=0)
    color = Column(String, default="#374151")  # Hex-Farbe für Header/Hintergrund
    icon = Column(String, default="")  # Optional Material Symbols Name

class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)
    position = Column(Integer, default=0)
    super_group_id = Column(Integer, nullable=True)  # FK zu super_groups.id; NULL = 'Sonstiges' Bucket

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
    happy_hour_days = Column(Text, default=None)  # JSON array of day names, e.g. ["Samstag","Donnerstag"] — None = use global HH days
    name_en = Column(String, nullable=True)
    description_en = Column(Text, nullable=True)
    position = Column(Integer, default=0)


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
    original_total = Column(Float, default=0.0)  # Nie wieder 0€: echter Warenwert, wird beim Anlegen gesetzt und nie reduziert

class OrderItem(Base):
    __tablename__ = 'order_items'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey('orders.id', ondelete='CASCADE'), nullable=False)
    product_id = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    category_type = Column(String, default="küche")
    note = Column(String, nullable=True)
    item_status = Column(String, nullable=True, default="pending")

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
    active_session_token = Column(String, nullable=True)
    pos_x = Column(Float, default=0.0)
    pos_y = Column(Float, default=0.0)
    width = Column(Float, default=120.0)
    height = Column(Float, default=80.0)
    shape = Column(String, default="rect")
    active = Column(Boolean, default=True)
    qr_token = Column(String, unique=True, nullable=True)

class AuditLog(Base):
    __tablename__ = 'audit_log'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    action = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    user = Column(String, nullable=True)
    details = Column(Text, nullable=True)

class Event(Base):
    __tablename__ = 'events'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)  # Internal name, e.g. "Ladys Night"
    display_name = Column(String, nullable=False)  # What guests see, e.g. "Ladys Night"
    description = Column(Text, default="")  # Short description for admin
    days = Column(Text, default="[]")  # JSON array of German day names, e.g. ["Donnerstag"]
    start_time = Column(String, default="18:00")
    end_time = Column(String, default="20:00")
    mode = Column(String, default="selected")  # "selected" = only chosen products, "discount" = % on everything
    discount = Column(Integer, default=0)  # Percentage discount for "discount" mode
    is_active = Column(Boolean, default=True)
    position = Column(Integer, default=0)  # Sort order

class EventProduct(Base):
    __tablename__ = 'event_products'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    product_id = Column(Integer, nullable=False)
    event_price = Column(Float, nullable=True)  # Fixed event price (overrides discount %)

class EventCombo(Base):
    __tablename__ = 'event_combos'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)  # e.g. "Cola + Shisha"
    combo_price = Column(Float, nullable=False)  # e.g. 18.00
    position = Column(Integer, default=0)
    # Per-combo time/day restrictions (optional – if empty, inherits event's settings)
    days = Column(Text, default=None)  # JSON array of German day names, e.g. ["Donnerstag"] – null = inherit from event
    start_time = Column(String, default=None)  # e.g. "18:00" – null = inherit from event
    end_time = Column(String, default=None)  # e.g. "20:00" – null = inherit from event

class EventComboItem(Base):
    __tablename__ = 'event_combo_items'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    combo_id = Column(Integer, ForeignKey('event_combos.id', ondelete='CASCADE'), nullable=False)
    product_id = Column(Integer, nullable=False)

# Create all tables
Base.metadata.create_all(bind=engine)

# ── Dynamic DB Migrations (SQLite & Postgres) ───────────────
def _migrate_database():
    import sqlalchemy as sa
    inspector = sa.inspect(engine)
    
    def add_column_if_missing(table_name, column_name, column_definition):
        try:
            columns = [c['name'] for c in inspector.get_columns(table_name)]
        except Exception as e:
            print(f"[DB Migration] Fehler beim Auslesen der Spalten für '{table_name}': {e}")
            return
            
        if column_name not in columns:
            try:
                with engine.begin() as conn:
                    conn.execute(sa.text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_definition}"))
                print(f"[DB Migration] Spalte '{column_name}' erfolgreich zu Tabelle '{table_name}' hinzugefügt.")
            except Exception as e:
                print(f"[DB Migration] Fehler beim Hinzufügen von '{column_name}' zu '{table_name}': {e}")

    # Migrate 'tenants' table
    add_column_if_missing('tenants', 'security_token', "VARCHAR DEFAULT ''")
    add_column_if_missing('tenants', 'pos_token', "VARCHAR")
    add_column_if_missing('tenants', 'pos_secret', "VARCHAR")
    add_column_if_missing('tenants', 'kds_secret', "VARCHAR")
    add_column_if_missing('tenants', 'plz', "VARCHAR DEFAULT ''")
    add_column_if_missing('tenants', 'ort', "VARCHAR DEFAULT ''")
    add_column_if_missing('tenants', 'landing_page_json', "TEXT DEFAULT '{}'")
    add_column_if_missing('tenants', 'theme', "VARCHAR DEFAULT 'dark'")
    add_column_if_missing('tenants', 'tiktok', "VARCHAR DEFAULT ''")
    add_column_if_missing('tenants', 'accepts_card_payment', "BOOLEAN DEFAULT TRUE")
    add_column_if_missing('tenants', 'happy_hour_mode', "VARCHAR DEFAULT 'discount'")
    add_column_if_missing('tenants', 'happy_hour_display_name', "VARCHAR DEFAULT 'Aktion'")
    add_column_if_missing('tenants', 'price_mode', "VARCHAR DEFAULT 'brutto'")


    # Migrate 'tables' table
    add_column_if_missing('tables', 'security_token', "VARCHAR DEFAULT ''")
    add_column_if_missing('tables', 'active_session_token', "VARCHAR")
    add_column_if_missing('tables', 'pos_x', "FLOAT DEFAULT 0.0")
    add_column_if_missing('tables', 'pos_y', "FLOAT DEFAULT 0.0")
    add_column_if_missing('tables', 'width', "FLOAT DEFAULT 120.0")
    add_column_if_missing('tables', 'height', "FLOAT DEFAULT 80.0")
    add_column_if_missing('tables', 'shape', "VARCHAR DEFAULT 'rect'")
    add_column_if_missing('tables', 'active', "BOOLEAN DEFAULT TRUE")
    add_column_if_missing('tables', 'qr_token', "VARCHAR")

    # Migrate 'products' table
    add_column_if_missing('products', 'name_en', "VARCHAR")
    add_column_if_missing('products', 'description_en', "TEXT")
    add_column_if_missing('products', 'position', "INTEGER DEFAULT 0")
    add_column_if_missing('products', 'happy_hour_price', "FLOAT")
    add_column_if_missing('products', 'start_time', "VARCHAR")
    add_column_if_missing('products', 'end_time', "VARCHAR")
    add_column_if_missing('products', 'happy_hour_days', "TEXT DEFAULT NULL")

    # Migrate 'event_combos' table – per-combo time/day restrictions
    add_column_if_missing('event_combos', 'days', "TEXT DEFAULT NULL")
    add_column_if_missing('event_combos', 'start_time', "VARCHAR DEFAULT NULL")
    add_column_if_missing('event_combos', 'end_time', "VARCHAR DEFAULT NULL")

    # Migrate 'categories' table
    add_column_if_missing('categories', 'position', "INTEGER DEFAULT 0")
    add_column_if_missing('categories', 'super_group_id', "INTEGER")

    # Migrate 'order_items' table
    add_column_if_missing('order_items', 'item_status', "VARCHAR DEFAULT 'pending'")
    add_column_if_missing('order_items', 'note', "TEXT")

    # Migrate 'orders' table — original_total sichert den echten Warenwert gegen 0€-Bug bei Teilzahlung/Storno/Transfer
    add_column_if_missing('orders', 'original_total', "FLOAT DEFAULT 0.0")

    # Ensure events and event_products tables exist
    try:
        with engine.begin() as conn:
            conn.execute(sa.text("""
                CREATE TABLE IF NOT EXISTS events (
                    id SERIAL PRIMARY KEY,
                    tenant_slug VARCHAR NOT NULL REFERENCES tenants(slug) ON DELETE CASCADE,
                    name VARCHAR NOT NULL,
                    display_name VARCHAR NOT NULL,
                    description TEXT DEFAULT '',
                    days TEXT DEFAULT '[]',
                    start_time VARCHAR DEFAULT '18:00',
                    end_time VARCHAR DEFAULT '20:00',
                    mode VARCHAR DEFAULT 'selected',
                    discount INTEGER DEFAULT 0,
                    is_active BOOLEAN DEFAULT TRUE,
                    position INTEGER DEFAULT 0
                )
            """))
    except Exception:
        # SQLite doesn't support SERIAL, try with INTEGER + AUTOINCREMENT
        try:
            with engine.begin() as conn:
                conn.execute(sa.text("""
                    CREATE TABLE IF NOT EXISTS events (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        tenant_slug VARCHAR NOT NULL REFERENCES tenants(slug) ON DELETE CASCADE,
                        name VARCHAR NOT NULL,
                        display_name VARCHAR NOT NULL,
                        description TEXT DEFAULT '',
                        days TEXT DEFAULT '[]',
                        start_time VARCHAR DEFAULT '18:00',
                        end_time VARCHAR DEFAULT '20:00',
                        mode VARCHAR DEFAULT 'selected',
                        discount INTEGER DEFAULT 0,
                        is_active BOOLEAN DEFAULT TRUE,
                        position INTEGER DEFAULT 0
                    )
                """))
        except Exception as e2:
            print(f"[DB Migration] events table creation skipped (may already exist): {e2}")

    try:
        with engine.begin() as conn:
            conn.execute(sa.text("""
                CREATE TABLE IF NOT EXISTS event_products (
                    id SERIAL PRIMARY KEY,
                    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
                    product_id INTEGER NOT NULL,
                    event_price FLOAT
                )
            """))
    except Exception:
        try:
            with engine.begin() as conn:
                conn.execute(sa.text("""
                    CREATE TABLE IF NOT EXISTS event_products (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
                        product_id INTEGER NOT NULL,
                        event_price FLOAT
                    )
                """))
        except Exception as e2:
            print(f"[DB Migration] event_products table creation skipped (may already exist): {e2}")

    # Ensure event_combos table exists
    try:
        with engine.begin() as conn:
            conn.execute(sa.text("""
                CREATE TABLE IF NOT EXISTS event_combos (
                    id SERIAL PRIMARY KEY,
                    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
                    name VARCHAR NOT NULL,
                    combo_price FLOAT NOT NULL,
                    position INTEGER DEFAULT 0
                )
            """))
    except Exception:
        try:
            with engine.begin() as conn:
                conn.execute(sa.text("""
                    CREATE TABLE IF NOT EXISTS event_combos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
                        name VARCHAR NOT NULL,
                        combo_price FLOAT NOT NULL,
                        position INTEGER DEFAULT 0
                    )
                """))
        except Exception as e2:
            print(f"[DB Migration] event_combos table creation skipped (may already exist): {e2}")

    # Ensure event_combo_items table exists
    try:
        with engine.begin() as conn:
            conn.execute(sa.text("""
                CREATE TABLE IF NOT EXISTS event_combo_items (
                    id SERIAL PRIMARY KEY,
                    combo_id INTEGER NOT NULL REFERENCES event_combos(id) ON DELETE CASCADE,
                    product_id INTEGER NOT NULL
                )
            """))
    except Exception:
        try:
            with engine.begin() as conn:
                conn.execute(sa.text("""
                    CREATE TABLE IF NOT EXISTS event_combo_items (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        combo_id INTEGER NOT NULL REFERENCES event_combos(id) ON DELETE CASCADE,
                        product_id INTEGER NOT NULL
                    )
                """))
        except Exception as e2:
            print(f"[DB Migration] event_combo_items table creation skipped (may already exist): {e2}")

    # Ensure super_groups table exists (Hauptgruppen für Kasse-Popup Gruppierung)
    try:
        with engine.begin() as conn:
            conn.execute(sa.text("""
                CREATE TABLE IF NOT EXISTS super_groups (
                    id SERIAL PRIMARY KEY,
                    tenant_slug VARCHAR NOT NULL REFERENCES tenants(slug) ON DELETE CASCADE,
                    name VARCHAR NOT NULL,
                    position INTEGER DEFAULT 0,
                    color VARCHAR DEFAULT '#374151',
                    icon VARCHAR DEFAULT ''
                )
            """))
    except Exception:
        try:
            with engine.begin() as conn:
                conn.execute(sa.text("""
                    CREATE TABLE IF NOT EXISTS super_groups (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        tenant_slug VARCHAR NOT NULL REFERENCES tenants(slug) ON DELETE CASCADE,
                        name VARCHAR NOT NULL,
                        position INTEGER DEFAULT 0,
                        color VARCHAR DEFAULT '#374151',
                        icon VARCHAR DEFAULT ''
                    )
                """))
        except Exception as e2:
            print(f"[DB Migration] super_groups table creation skipped (may already exist): {e2}")


def migrate_happy_hour_to_events():
    """One-time migration: convert old Happy Hour data per tenant to the new Events system.
    Only runs if events table is empty for a given tenant but they have HH config.
    After migrating, clears happy_hour_price on products and HH config on tenant
    to prevent ghost events from reappearing on subsequent restarts."""
    try:
        session = SessionLocal()
        # Check which tenants already have events (including deleted ones that were re-migrated before)
        tenants_with_events = set()
        try:
            rows = session.execute(sa.text("SELECT DISTINCT tenant_slug FROM events")).fetchall()
            tenants_with_events = {r[0] for r in rows}
        except Exception:
            pass

        # Get all tenants
        tenants = session.query(Tenant).all()
        for t in tenants:
            if t.slug in tenants_with_events:
                # Already have events (possibly from previous migration) – clear old HH data
                # to prevent future ghost events if admin deletes all events
                hh_products = session.query(Product).filter(
                    Product.tenant_slug == t.slug,
                    Product.happy_hour_price != None
                ).all()
                if hh_products:
                    for p in hh_products:
                        p.happy_hour_price = None
                        p.happy_hour_days = None
                        p.start_time = None
                        p.end_time = None
                    # Clear tenant-level HH config too
                    t.happy_hour_days = "[]"
                    t.happy_hour_discount = 0
                    print(f"[DB Migration] Cleared stale Happy Hour data for tenant '{t.slug}' ({len(hh_products)} products)")
                continue  # Already migrated

            hh_days = json.loads(t.happy_hour_days or "[]")
            hh_start = t.happy_hour_start or "18:00"
            hh_end = t.happy_hour_end or "20:00"
            hh_discount = t.happy_hour_discount or 0
            hh_mode = getattr(t, 'happy_hour_mode', None) or 'discount'
            hh_display_name = getattr(t, 'happy_hour_display_name', None) or 'Aktion'

            # Only migrate if there's meaningful HH config
            has_hh_config = bool(hh_days) or hh_discount > 0
            has_hh_products = session.query(Product).filter(
                Product.tenant_slug == t.slug,
                Product.happy_hour_price != None
            ).first() is not None

            if not has_hh_config and not has_hh_products:
                continue  # No HH data to migrate

            # Create an Event from the HH config
            event = Event(
                tenant_slug=t.slug,
                name=hh_display_name or "Aktion",
                display_name=hh_display_name or "Aktion",
                description="Migriert aus Happy Hour",
                days=json.dumps(hh_days),
                start_time=hh_start,
                end_time=hh_end,
                mode=hh_mode,
                discount=hh_discount,
                is_active=True,
                position=0
            )
            session.add(event)
            session.flush()  # Get event.id

            # Migrate products with happy_hour_price
            hh_products = session.query(Product).filter(
                Product.tenant_slug == t.slug,
                Product.happy_hour_price != None
            ).all()

            for p in hh_products:
                ep = EventProduct(
                    event_id=event.id,
                    product_id=p.id,
                    event_price=p.happy_hour_price
                )
                session.add(ep)
                # Clear old HH fields on the product so it won't be re-migrated later
                p.happy_hour_price = None
                p.happy_hour_days = None
                p.start_time = None
                p.end_time = None

            # Clear tenant-level HH config to prevent re-migration
            t.happy_hour_days = "[]"
            t.happy_hour_discount = 0

            print(f"[DB Migration] Migrated Happy Hour data for tenant '{t.slug}': {len(hh_products)} products -> Event '{hh_display_name}'")

        session.commit()
        session.close()
    except Exception as e:
        print(f"[DB Migration] Happy Hour -> Events migration error: {e}")
        try:
            session.rollback()
            session.close()
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

# ── Public migration runner (called by main.py at startup) ──
def run_migrations():
    """Run all pending database migrations. Called once at app startup."""
    _migrate_database()
    migrate_happy_hour_to_events()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

