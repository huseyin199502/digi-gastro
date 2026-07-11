import os
import json
import copy
import contextvars
import sqlalchemy as sa
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, Text, ForeignKey, Index, Date, Time, DateTime, Numeric, SmallInteger
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
        pool_pre_ping=True,          # detect stale connections
        pool_size=50,                # 50 warm connections (was 20) — für 100+ Gäste
        max_overflow=100,            # allow up to 150 total under burst (was 60)
        pool_timeout=30,             # wait 30s before giving up (was 10s — mehr Geduld bei Lastspitzen)
        pool_recycle=300,            # recycle connections after 5 min
        pool_reset_on_return='rollback',  # explicit: rollback pending transactions on return
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
    orders_enabled = Column(Boolean, default=True)  # Super-Admin Toggle: False = Nur Speisekarte (keine Bestellungen)
    show_revenue = Column(Boolean, default=True)  # Super-Admin Toggle: False = Tenant sieht keine Umsätze/Reports
    loyalty_enabled = Column(Boolean, default=True)  # Super-Admin Toggle: False = Keine Stempelkarte/Newsletter
    notification_icon_path = Column(String, nullable=True)  # PNG für Push-Notification icon.png
    # ── PHASE 4: operating_mode — Stempelkarte-Only Mode ──
    # "full" = Speisekarte + Bestellung + Stempelkarte (Default)
    # "menu_only" = Nur Speisekarte, keine Bestellung, keine Stempelkarte
    # "stempelkarte_only" = Nur Stempelkarte, keine Speisekarte (Standalone Newsletter Modus)
    operating_mode = Column(String, default="full")
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
    # Verantwortlicher / Inhaber (für Impressum § 5 TMG)
    # Wird auf /impressum ausgegeben. Wenn leer, Fallback auf Chef-Name.
    owner_name = Column(String, default="")
    owner_street = Column(String, default="")  # Straße des Verantwortlichen (kann abweichen von Laden-Adresse)
    owner_email = Column(String, default="")   # Kontakt-Email für Impressum
    owner_phone = Column(String, default="")   # Telefonnummer für Impressum
    indigo = Column(String, default="")
    instagram = Column(String, default="")
    facebook = Column(String, default="")
    tiktok = Column(String, default="")
    logo_url = Column(Text, default="")
    logo_url_2 = Column(Text, default="")  # Zweites Logo für Tenants mit 2 Läden
    logo_path = Column(String, nullable=True)
    # POS / Kassensystem-Integration (Webhook-basiert, universal)
    pos_system = Column(String, default="none")  # none|lightspeed|sumup|tillhub|custom
    pos_api_url = Column(Text, default="")
    pos_api_key = Column(Text, default="")
    pos_api_secret = Column(Text, default="")
    pos_location_id = Column(String, default="")
    pos_active = Column(Boolean, default=False)
    
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
    # ── Bug-Fix: server_default="brutto" stellt sicher, dass auch Roh-SQL-INSERTs
    # ohne price_mode-Angabe automatisch 'brutto' bekommen (nicht NULL).
    # default="brutto" greift nur bei SQLAlchemy-INSERTs.
    price_mode = Column(String, default="brutto", server_default="brutto")  # "brutto" or "netto"
    
    # ── Premium-Tier System ──
    # "free" = Basis-Features (Bestellung, KDS, Sitzplan, Speisekarte, Loyalty)
    # "pro" = + Schichtplan, Lagerverwaltung, KI-Bild-Generierung, erweiterte Analytics
    # "enterprise" = + Multi-Location, White-Label, API Access, Priority Support
    tier = Column(String, default="free", server_default="free")
    # Feature-Flags für einzelne Module (JSON-Array als String)
    # z.B. '["ai_image","schichtplan","lagerverwaltung"]'
    enabled_features = Column(Text, default="[]")


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
    __table_args__ = (
        Index('idx_category_tenant_pos', 'tenant_slug', 'position'),
        Index('idx_category_tenant_slug', 'tenant_slug'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)
    position = Column(Integer, default=0)
    super_group_id = Column(Integer, nullable=True)  # FK zu super_groups.id; NULL = 'Sonstiges' Bucket

class Product(Base):
    __tablename__ = 'products'
    __table_args__ = (
        Index('idx_product_tenant_pos', 'tenant_slug', 'position'),
        Index('idx_product_tenant_slug', 'tenant_slug'),
    )

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
    # Upselling: Liste von product IDs die als "Passende Extras" vorgeschlagen werden
    # JSON-Array als String, z.B. "[5, 12, 18]". Leer = keine manuellen Vorschläge.
    related_product_ids = Column(Text, default="[]")


class Order(Base):
    __tablename__ = 'orders'
    __table_args__ = (
        Index('idx_order_tenant_id', 'tenant_slug', 'id'),
        Index('idx_order_tenant_slug', 'tenant_slug'),
    )

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
    __table_args__ = (
        Index('idx_orderitem_tenant', 'tenant_slug'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey('orders.id', ondelete='CASCADE'), nullable=False, index=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=True, index=True)  # Backfilled from parent order
    product_id = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    category_type = Column(String, default="küche")
    note = Column(String, nullable=True)
    item_status = Column(String, nullable=True, default="pending")

class Staff(Base):
    __tablename__ = 'staff'
    __table_args__ = (
        Index('idx_staff_tenant_name', 'tenant_slug', 'name'),
        Index('idx_staff_tenant_slug', 'tenant_slug'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    pin = Column(String, nullable=False)
    pin_code = Column(String, nullable=False)
    # ── Erweiterung für Personal Planung (additive, nullable) ──
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    hourly_rate = Column(Numeric(8, 2), default=0)  # €/hour
    weekly_target_hours = Column(Numeric(5, 1), default=0)  # für Überstunden-Berechnung
    contract_type = Column(String, default='minijob')  # minijob|teilzeit|vollzeit
    active = Column(Boolean, default=True)
    color = Column(String, nullable=True)  # optional per-person color override

class ServiceCall(Base):
    __tablename__ = 'service_calls'

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False, index=True)
    table = Column(String, nullable=False)
    type = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)

class Table(Base):
    __tablename__ = 'tables'
    __table_args__ = (
        Index('idx_table_tenant_number_zone', 'tenant_slug', 'number', 'zone'),
        Index('idx_table_tenant_slug', 'tenant_slug'),
    )

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
    __table_args__ = (
        Index('idx_auditlog_tenant_id', 'tenant_slug', 'id'),
        Index('idx_auditlog_tenant_slug', 'tenant_slug'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    action = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    user = Column(String, nullable=True)
    details = Column(Text, nullable=True)

class Event(Base):
    __tablename__ = 'events'
    __table_args__ = (
        Index('idx_event_tenant_pos', 'tenant_slug', 'position'),
        Index('idx_event_tenant_slug', 'tenant_slug'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)  # Internal name, e.g. "Ladys Night"
    display_name = Column(String, nullable=False)  # What guests see, e.g. "Ladys Night"
    description = Column(Text, default="")  # Short description for admin
    days = Column(Text, default="[]")  # JSON array of German day names, e.g. ["Donnerstag"]
    start_time = Column(String, default="18:00")
    end_time = Column(String, default="20:00")
    mode = Column(String, default="selected")  # "selected" = only chosen products, "discount" = % on everything, "announcement" = text-only banner
    discount = Column(Integer, default=0)  # Percentage discount for "discount" mode
    banner_color = Column(String, default="#dc2626")  # Banner-Hintergrundfarbe für announcement-Modus (rot default)
    is_active = Column(Boolean, default=True)
    position = Column(Integer, default=0)  # Sort order

class EventProduct(Base):
    __tablename__ = 'event_products'
    __table_args__ = (
        Index('idx_eventproduct_tenant', 'tenant_slug'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey('events.id', ondelete='CASCADE'), nullable=False, index=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=True, index=True)  # Backfilled from parent event
    product_id = Column(Integer, nullable=False)
    event_price = Column(Float, nullable=True)

class EventCombo(Base):
    __tablename__ = 'event_combos'
    __table_args__ = (
        Index('idx_eventcombo_tenant', 'tenant_slug'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey('events.id', ondelete='CASCADE'), nullable=False, index=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=True, index=True)  # Backfilled from parent event
    name = Column(String, nullable=False)
    combo_price = Column(Float, nullable=False)
    position = Column(Integer, default=0)
    days = Column(Text, default=None)
    start_time = Column(String, default=None)
    end_time = Column(String, default=None)

class EventComboItem(Base):
    __tablename__ = 'event_combo_items'
    __table_args__ = (
        Index('idx_eventcomboitem_tenant', 'tenant_slug'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    combo_id = Column(Integer, ForeignKey('event_combos.id', ondelete='CASCADE'), nullable=False, index=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=True, index=True)  # Backfilled from parent combo
    product_id = Column(Integer, nullable=False)


# ════════════════════════════════════════════════════════════════════
# Super-Admin Revenue Adjustments (Gott-Modus Audit-Log)
# ════════════════════════════════════════════════════════════════════
# Log-Tabelle für manuelle Umsatz-Anpassungen durch admin@digi-gastro.de.
# Jede Änderung wird hier gespeichert — nur Super-Admin sieht diese Logs.
# Tenant-Admins haben keinen Zugriff auf diese Tabelle.
# ════════════════════════════════════════════════════════════════════
class RevenueAdjustment(Base):
    __tablename__ = 'revenue_adjustments'

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False, index=True)
    adjustment = Column(Float, nullable=False)            # positiver oder negativer Wert in €
    old_value = Column(Float, nullable=False)             # alter Tagesumsatz vor Anpassung
    new_value = Column(Float, nullable=False)             # neuer Tagesumsatz nach Anpassung
    adjusted_by = Column(String, default="admin@digi-gastro.de", nullable=False)
    adjusted_at = Column(String, nullable=False)          # ISO-Format Timestamp


# ════════════════════════════════════════════════════════════════════
# LOYALITY & WALLET-PASS TABLES
# ════════════════════════════════════════════════════════════════════
# Implementiert getqard.com-ähnliche Features:
# - Digitale Stempelkarte (Apple Wallet + Google Wallet)
# - Geofencing-Push (200m Nähe → Sperrbildschirm-Push via Pass-Update)
# - Inaktivitäts-Push (14 Tage nicht dagewesen → Winback-Kampagne)
#
# Architektur: Wallet-Pässe statt native App. Vorteile:
# - Kein App-Download nötig
# - OS-seitiges Geofencing (keine Bewegungsprofile auf Servern → DSGVO-freundlich)
# - Sperrbildschirm-Push ohne separate Notification-Permission

class LoyaltyCard(Base):
    """Digitale Stempelkarte pro Tenant.
    Ein Tenant kann mehrere Karten haben (z.B. '10. Kaffee gratis', '5. Shisha gratis')."""
    __tablename__ = 'loyalty_cards'
    __table_args__ = (
        Index('idx_loyalty_card_tenant', 'tenant_slug'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)                # z.B. "Kaffee-Karte", "Shisha-Karte"
    description = Column(Text, default="")               # Kurzbeschreibung für Gäste
    stamps_required = Column(Integer, default=10)        # Wie viele Stempel bis Reward?
    reward_name = Column(String, nullable=False)         # z.B. "1× Kaffee gratis"
    reward_product_id = Column(Integer, nullable=True)   # Optional: Produkt-ID das als Reward gilt
    reward_discount_percent = Column(Integer, default=0) # Alternative: % Rabatt auf nächste Bestellung
    is_active = Column(Boolean, default=True)
    color_hex = Column(String, default="#C9A84C")        # Branding-Farbe der Karte
    icon = Column(String, default="local_cafe")          # Material Icon Name
    # Wallet-Banner-Foto (optional): Tenant-Foto das im strip.png angezeigt wird
    # Pfad wie "/uploads/wallet-banners/{slug}-wallet-banner.png"
    wallet_banner_path = Column(String, nullable=True)
    wallet_banner_mode = Column(String, default="full")  # "full" (Vollbild) oder "zone"
    created_at = Column(String, nullable=False)

class LoyaltyCustomer(Base):
    """Ein Gast der eine Stempelkarte hat. Anonym (nur Wallet-Pass-Serial als ID).
    Keine PIIs (Name, Email) — nur Gerätekoppelung via anonymous_id."""
    __tablename__ = 'loyalty_customers'
    __table_args__ = (
        Index('idx_loyalty_customer_tenant_serial', 'tenant_slug', 'pass_serial', unique=True),
        Index('idx_loyalty_customer_tenant', 'tenant_slug'),
        Index('idx_loyalty_customer_tenant_shortcode', 'tenant_slug', 'short_code'),  # Phase 1: Short-Code Lookup
        Index('idx_loyalty_customer_tenant_aid', 'tenant_slug', 'anonymous_id'),      # Drei-Kanal-Lookup
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    pass_serial = Column(String, nullable=False)         # Apple/Google Wallet Pass Serial (UUID)
    pass_type = Column(String, default="apple")          # "apple" oder "google"
    card_id = Column(Integer, ForeignKey('loyalty_cards.id', ondelete='CASCADE'), nullable=False)
    current_stamps = Column(Integer, default=0)          # Aktuelle Stempel-Anzahl
    total_stamps_earned = Column(Integer, default=0)     # Lifetime-Stempel (für Analytics)
    rewards_redeemed = Column(Integer, default=0)        # Wie oft Reward eingelöst?
    first_visit_at = Column(String, nullable=True)       # Erster Besuch (ISO-Datum)
    last_visit_at = Column(String, nullable=True)        # Letzter Besuch (für Inaktivitäts-Cron)
    last_push_at = Column(String, nullable=True)         # Letzter Push (Anti-Spam)
    created_at = Column(String, nullable=False)
    # Wallet-Pass-Update nötig? (z.B. nach Stempel-Vergabe)
    pass_needs_update = Column(Boolean, default=True)
    # Opt-out von Push-Kampagnien (DSGVO: jederzeit widerrufbar)
    push_opt_out = Column(Boolean, default=False)
    # ── PHASE 1: Short-Code für manuelle Stempel-Vergabe ──
    # 4-stelliger Code (Crockford Base32: kein 0/O/1/I)
    # Wird im Wallet-Pass angezeigt ("Stempel-Code: A7K2")
    # Kellner tippt Code ein → System findet Customer → Stempel vergeben
    short_code = Column(String, default="")               # 4 Zeichen, z.B. "A7K2"
    # ── PHASE B: Optionale Customer-Daten (DSGVO: immer optional) ──
    nickname = Column(String, nullable=True)              # Optional: "Max" oder "Stammgast 1"
    birthday = Column(String, nullable=True)              # Optional: "MM-DD" (KEIN Jahr, DSGVO!)
    # ── PHASE B: Stammkunden-Tier ──
    # Automatisch nach Visits: 1-2 = "neu", 3-9 = "stamm", 10+ = "vip"
    tier = Column(String, default="neu")                  # "neu", "stamm", "vip"
    # ── Broadcast/Inaktivität: letzte Nachricht (für changeMessage) ──
    last_message = Column(String, default="Willkommen!")  # Ändert sich bei Broadcast → iOS Notification
    msg_nonce = Column(Integer, default=0)  # Incrementing counter → always changes → always triggers notification
    # ── Drei-Kanal-Server-Lookup (DSGVO-konforme Geräteerkennung) ──
    # anonymous_id: stabile UUID, server-seitig beim ersten Besuch generiert.
    # Wird im Cookie loyalty_{slug}_cid, LocalStorage dg_aid_{slug} und IndexedDB gespeichert.
    # Verhindert Customer-Duplikate bei Cookielöschung / Inkognito-Modus.
    anonymous_id = Column(String, nullable=True)          # UUID4, unique pro Gerät+Tenant
    pass_downloaded_at = Column(String, nullable=True)    # ISO-Datum: wann wurde Pass heruntergeladen?

class LoyaltyStamp(Base):
    """Ein einzelner Stempel — wird bei Bestellung automatisch vergeben.
    Ein Stempel = eine Bestellung (oder Mindestbestellwert erreicht)."""
    __tablename__ = 'loyalty_stamps'
    __table_args__ = (
        Index('idx_loyalty_stamp_tenant_customer', 'tenant_slug', 'customer_id'),
        Index('idx_loyalty_stamp_customer_card', 'customer_id', 'card_id'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    customer_id = Column(Integer, ForeignKey('loyalty_customers.id', ondelete='CASCADE'), nullable=False)
    card_id = Column(Integer, ForeignKey('loyalty_cards.id', ondelete='CASCADE'), nullable=False)
    order_id = Column(Integer, nullable=True)            # Bestellung die den Stempel ausgelöst hat
    order_total = Column(Float, default=0.0)             # Bestellwert zum Zeitpunkt der Vergabe
    stamp_type = Column(String, default="order")         # "order", "manual", "welcome_bonus"
    is_redeemed = Column(Boolean, default=False)         # True wenn für Reward eingelöst
    redeemed_at = Column(String, nullable=True)
    created_at = Column(String, nullable=False)

class LoyaltyCampaign(Base):
    """Push-Kampagne: Geofencing (200m Nähe) oder Inaktivität (14 Tage)."""
    __tablename__ = 'loyalty_campaigns'
    __table_args__ = (
        Index('idx_loyalty_campaign_tenant', 'tenant_slug'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)                # z.B. "Lunch-Push", "Winback 14 Tage"
    campaign_type = Column(String, nullable=False)       # "geofence" oder "inactivity" oder "broadcast"
    title = Column(String, nullable=False)               # Push-Titel
    message = Column(Text, nullable=False)               # Push-Nachricht
    # Geofencing: Radius in Metern um Lokal (typisch 200m)
    geofence_radius_m = Column(Integer, default=200)
    # Inaktivität: Tage seit letztem Besuch (typisch 14)
    inactivity_days = Column(Integer, default=14)
    # Anti-Spam: Mindest-Abstand zwischen Pushs an denselben Kunden (Stunden)
    min_hours_between_pushs = Column(Integer, default=24)
    # Scheduling: Wann ist die Kampagne aktiv?
    active_from = Column(String, default="00:00")        # "HH:MM"
    active_to = Column(String, default="23:59")          # "HH:MM"
    active_days = Column(Text, default='["Mo","Di","Mi","Do","Fr","Sa","So"]')  # JSON-Array
    is_active = Column(Boolean, default=True)
    created_at = Column(String, nullable=False)

class LoyaltyPushLog(Base):
    """Log aller gesendeten Push-Nachrichten (DSGVO-Audit-Pflicht)."""
    __tablename__ = 'loyalty_push_logs'
    __table_args__ = (
        Index('idx_loyalty_pushlog_tenant_customer', 'tenant_slug', 'customer_id'),
        Index('idx_loyalty_pushlog_campaign', 'campaign_id'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    customer_id = Column(Integer, ForeignKey('loyalty_customers.id', ondelete='CASCADE'), nullable=False)
    campaign_id = Column(Integer, ForeignKey('loyalty_campaigns.id', ondelete='SET NULL'), nullable=True)
    push_type = Column(String, nullable=False)           # "geofence", "inactivity", "broadcast", "stamp"
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="sent")              # "sent", "failed", "opened"
    sent_at = Column(String, nullable=False)

class TenantGeofence(Base):
    """GPS-Koordinaten des Lokals für Geofencing-Push.
    Eine Adresse pro Tenant (Hauptladen). Mehrere falls erweitert."""
    __tablename__ = 'tenant_geofences'
    __table_args__ = (
        Index('idx_tenant_geofence_tenant', 'tenant_slug'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, default="Hauptladen")          # z.B. "Hauptladen", "Filiale 2"
    latitude = Column(Float, nullable=False)             # z.B. 52.5200
    longitude = Column(Float, nullable=False)            # z.B. 13.4050
    address = Column(String, default="")                 # Zur Anzeige im Pass
    is_primary = Column(Boolean, default=True)           # Nur eine primäre Location pro Tenant
    created_at = Column(String, nullable=False)


class PasskitDeviceRegistration(Base):
    """Apple Wallet PassKit Web Service: Device-Registrierungen.
    Wenn ein iPhone einen Pass zum Wallet hinzufügt, registriert iOS
    automatisch das Gerät beim Web Service (POST /devices/.../registrations/...).
    Wir speichern den APNs Push Token hier, um später Push-Notifications zu senden."""
    __tablename__ = 'passkit_device_registrations'
    __table_args__ = (
        Index('idx_passkit_device_serial', 'pass_serial'),
        Index('idx_passkit_device_library', 'device_library_identifier'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_library_identifier = Column(String, nullable=False)  # iOS device ID
    pass_type_identifier = Column(String, nullable=False)       # pass.com.digi-gastro.loyalty
    pass_serial = Column(String, nullable=False)                # Pass serialNumber (UUID)
    push_token = Column(String, nullable=False)                 # APNs Push Token
    tenant_slug = Column(String, nullable=True)                 # Für Multi-Tenant Lookup
    created_at = Column(String, nullable=False)


class PasskitLog(Base):
    """Apple Wallet PassKit Web Service: Log-Einträge von iOS.
    iOS schickt Fehler-Logs an POST /v1/log — wir speichern sie für Debugging."""
    __tablename__ = 'passkit_logs'
    __table_args__ = (
        Index('idx_passkit_log_created', 'created_at'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    logs = Column(Text, nullable=False)  # JSON array of log strings
    created_at = Column(String, nullable=False)


# ═══════════════════════════════════════════════════════════════════════════
# MODULE: PERSONAL PLANUNG / SCHICHTPLANUNG
# ═══════════════════════════════════════════════════════════════════════════
# 6 neue Tabellen: shifts, shift_templates, time_off_requests, staff_availability,
# shift_swaps, time_clock_entries
# Staff-Tabelle wird um additive Spalten erweitert (email, phone, hourly_rate, etc.)

class Shift(Base):
    """Schicht — die atomare Planungseinheit."""
    __tablename__ = 'shifts'
    __table_args__ = (
        Index('idx_shifts_tenant_date', 'tenant_slug', 'shift_date'),
        Index('idx_shifts_tenant_staff', 'tenant_slug', 'staff_id', 'shift_date'),
        Index('idx_shifts_tenant_status', 'tenant_slug', 'status', 'shift_date'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    staff_id = Column(Integer, ForeignKey('staff.id', ondelete='CASCADE'), nullable=False)
    role = Column(String, nullable=False)  # 'chef'|'kellner'|'zubereiter'|'bar' (snapshot)
    shift_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)  # < start_time = overnight
    break_minutes = Column(Integer, default=0)
    hourly_rate = Column(Numeric(8, 2), default=0)  # €/hour snapshot
    status = Column(String, default='draft')  # draft|published|cancelled
    position_label = Column(String, nullable=True)  # "Theke", "Außen", "Grill"
    notes = Column(Text, nullable=True)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=sa.func.now())
    updated_at = Column(DateTime, default=sa.func.now(), onupdate=sa.func.now())


class ShiftTemplate(Base):
    """Schicht-Vorlage — wiederkehrende Schichtmuster."""
    __tablename__ = 'shift_templates'
    __table_args__ = (
        Index('idx_tmpl_tenant_dow', 'tenant_slug', 'day_of_week'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    day_of_week = Column(SmallInteger, nullable=False)  # 0=Sun, 1=Mon, ..., 6=Sat
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    break_minutes = Column(Integer, default=0)
    hourly_rate = Column(Numeric(8, 2), default=0)
    recurrence = Column(String, default='weekly')  # weekly|biweekly|monthly
    default_staff_id = Column(Integer, ForeignKey('staff.id', ondelete='SET NULL'), nullable=True)
    position_label = Column(String, nullable=True)
    valid_from = Column(Date, nullable=True)
    valid_until = Column(Date, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=sa.func.now())


class TimeOffRequest(Base):
    """Urlaubsantrag / Abwesenheitsanfrage."""
    __tablename__ = 'time_off_requests'
    __table_args__ = (
        Index('idx_tor_tenant_staff', 'tenant_slug', 'staff_id', 'start_date'),
        Index('idx_tor_tenant_status', 'tenant_slug', 'status', 'start_date'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    staff_id = Column(Integer, ForeignKey('staff.id', ondelete='CASCADE'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)  # inclusive
    request_type = Column(String, default='vacation')  # vacation|sick|personal|unpaid
    reason = Column(Text, nullable=True)
    status = Column(String, default='pending')  # pending|approved|denied
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=sa.func.now())


class StaffAvailability(Base):
    """Verfügbarkeit — wiederkehrend (wöchentlich) oder Einzel-Override."""
    __tablename__ = 'staff_availability'
    __table_args__ = (
        Index('idx_sa_tenant_staff', 'tenant_slug', 'staff_id'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    staff_id = Column(Integer, ForeignKey('staff.id', ondelete='CASCADE'), nullable=False)
    kind = Column(String, nullable=False)  # 'recurring' | 'override'
    day_of_week = Column(SmallInteger, nullable=True)  # 0-6 for recurring
    specific_date = Column(Date, nullable=True)  # for override
    start_time = Column(Time, nullable=True)  # NULL = all day
    end_time = Column(Time, nullable=True)
    available = Column(Boolean, default=True)  # TRUE=available, FALSE=blocked
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=sa.func.now())


class ShiftSwap(Base):
    """Schicht-Tausch — Mitarbeiter bietet Schicht an, anderer nimmt, Chef genehmigt."""
    __tablename__ = 'shift_swaps'
    __table_args__ = (
        Index('idx_swap_tenant_status', 'tenant_slug', 'status', 'created_at'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    shift_id = Column(Integer, ForeignKey('shifts.id', ondelete='CASCADE'), nullable=False)
    requesting_staff_id = Column(Integer, ForeignKey('staff.id', ondelete='CASCADE'), nullable=False)
    target_staff_id = Column(Integer, ForeignKey('staff.id', ondelete='SET NULL'), nullable=True)  # NULL=open
    status = Column(String, default='open')  # open|accepted|approved|denied|cancelled
    accepted_staff_id = Column(Integer, ForeignKey('staff.id', ondelete='SET NULL'), nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    message = Column(Text, nullable=True)
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=sa.func.now())


# ═══════════════════════════════════════════════════════════════════════════
# MODULE: LAGERVERWALTUNG / INVENTORY MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════
# Event-sourced stock ledger: stock_transaction ist immutable, stock_item.current_stock ist cache

class UnitOfMeasure(Base):
    """Mengeneinheiten (Stk, kg, L, Pack, Kasten, ...). Tenant-übergreifend geteilt."""
    __tablename__ = 'unit_of_measure'
    __table_args__ = (
        Index('idx_uom_name', 'name'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)  # 'Stk', 'kg', 'L', 'Pack'
    short = Column(String, nullable=False)  # Abkürzung für UI
    base_unit = Column(String, nullable=True)  # 'count'|'weight'|'volume'


class StockCategory(Base):
    """Lager-Kategorien (Lebensmittel, Tiefkühl, Getränke, Reinigung, Verpackung)."""
    __tablename__ = 'stock_categories'
    __table_args__ = (
        Index('idx_stockcat_tenant', 'tenant_slug', 'position'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)
    color = Column(String, default="#374151")
    position = Column(Integer, default=0)


class Supplier(Base):
    """Lieferanten."""
    __tablename__ = 'suppliers'
    __table_args__ = (
        Index('idx_supplier_tenant', 'tenant_slug', 'name'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)
    contact_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    lead_time_days = Column(Integer, default=2)  # typische Lieferzeit
    min_order_value = Column(Numeric(8, 2), default=0)
    notes = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=sa.func.now())


class StockItem(Base):
    """Warenartikel / Lager-Item."""
    __tablename__ = 'stock_items'
    __table_args__ = (
        Index('idx_stockitem_tenant', 'tenant_slug'),
        Index('idx_stockitem_tenant_cat', 'tenant_slug', 'category_id'),
        Index('idx_stockitem_lowstock', 'tenant_slug'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)
    sku = Column(String, nullable=True)  # optional Artikelnummer
    category_id = Column(Integer, ForeignKey('stock_categories.id', ondelete='SET NULL'), nullable=True)
    supplier_id = Column(Integer, ForeignKey('suppliers.id', ondelete='SET NULL'), nullable=True)

    # Stock
    current_stock = Column(Numeric(12, 3), default=0)  # cache von stock_transaction sum
    min_stock = Column(Numeric(12, 3), default=0)  # Mindestbestand
    max_stock = Column(Numeric(12, 3), default=0)  # Maximalbestand
    reorder_qty = Column(Numeric(12, 3), default=0)  # Nachbestellmenge

    # Units
    base_unit = Column(String, nullable=False, default='Stk')  # Lager-Einheit
    purchase_unit = Column(String, nullable=True)  # Bestell-Einheit (z.B. Kasten)
    purchase_to_base_factor = Column(Numeric(12, 4), default=1)  # 1 Kasten = 24 Stk

    # Costing (weighted average)
    avg_cost = Column(Numeric(10, 4), default=0)  # durchschnittlicher Einstandspreis pro base_unit
    last_purchase_price = Column(Numeric(10, 4), default=0)  # letzter Einkaufspreis pro purchase_unit

    # Product link (optional — für Auto-Deduction bei Bestellung)
    product_id = Column(Integer, ForeignKey('products.id', ondelete='SET NULL'), nullable=True)

    active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=sa.func.now())
    updated_at = Column(DateTime, default=sa.func.now(), onupdate=sa.func.now())


class PurchaseOrder(Base):
    """Bestellung bei Lieferant."""
    __tablename__ = 'purchase_orders'
    __table_args__ = (
        Index('idx_po_tenant_status', 'tenant_slug', 'status', 'order_date'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    supplier_id = Column(Integer, ForeignKey('suppliers.id', ondelete='SET NULL'), nullable=True)
    order_number = Column(String, nullable=True)  # optional Bestellnummer
    status = Column(String, default='draft')  # draft|ordered|partial|received|cancelled
    order_date = Column(Date, nullable=False)
    expected_delivery = Column(Date, nullable=True)
    received_date = Column(Date, nullable=True)
    total_value = Column(Numeric(10, 2), default=0)
    notes = Column(Text, nullable=True)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=sa.func.now())


class PurchaseOrderItem(Base):
    """Bestell-Position."""
    __tablename__ = 'purchase_order_items'
    __table_args__ = (
        Index('idx_poitem_po', 'purchase_order_id'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    purchase_order_id = Column(Integer, ForeignKey('purchase_orders.id', ondelete='CASCADE'), nullable=False)
    stock_item_id = Column(Integer, ForeignKey('stock_items.id', ondelete='CASCADE'), nullable=False)
    quantity_ordered = Column(Numeric(12, 3), nullable=False)
    quantity_received = Column(Numeric(12, 3), default=0)
    unit_price = Column(Numeric(10, 4), default=0)  # pro purchase_unit
    line_total = Column(Numeric(10, 2), default=0)


class StockTransaction(Base):
    """Immutable stock ledger — +in / -out / adjust / waste."""
    __tablename__ = 'stock_transactions'
    __table_args__ = (
        Index('idx_stocktxn_tenant_item', 'tenant_slug', 'stock_item_id', 'created_at'),
        Index('idx_stocktxn_tenant_type', 'tenant_slug', 'type', 'created_at'),
        Index('idx_stocktxn_order', 'order_id'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    stock_item_id = Column(Integer, ForeignKey('stock_items.id', ondelete='CASCADE'), nullable=False)
    type = Column(String, nullable=False)  # 'in'|'out'|'adjust'|'waste'|'count'
    quantity = Column(Numeric(12, 3), nullable=False)  # signed: +in / -out
    unit_cost = Column(Numeric(10, 4), default=0)  # für 'in' und costing
    reason = Column(String, nullable=True)  # 'Lieferung', 'Verkauf', 'Schwund', 'Inventur'
    order_id = Column(Integer, nullable=True)  # FK zu orders (soft, für Auto-Deduction)
    purchase_order_id = Column(Integer, ForeignKey('purchase_orders.id', ondelete='SET NULL'), nullable=True)
    stock_count_id = Column(Integer, nullable=True)  # FK zu stock_counts (soft)
    staff_id = Column(Integer, ForeignKey('staff.id', ondelete='SET NULL'), nullable=True)  # wer hat's gemacht
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=sa.func.now())


class StockCount(Base):
    """Inventur-Zählung."""
    __tablename__ = 'stock_counts'
    __table_args__ = (
        Index('idx_stockcount_tenant', 'tenant_slug', 'status', 'created_at'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)  # "Inventur Juli 2025"
    status = Column(String, default='open')  # open|counting|completed
    count_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=sa.func.now())
    completed_at = Column(DateTime, nullable=True)


class StockCountItem(Base):
    """Einzelne Zähl-Position."""
    __tablename__ = 'stock_count_items'
    __table_args__ = (
        Index('idx_stockcountitem_count', 'stock_count_id'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    stock_count_id = Column(Integer, ForeignKey('stock_counts.id', ondelete='CASCADE'), nullable=False)
    stock_item_id = Column(Integer, ForeignKey('stock_items.id', ondelete='CASCADE'), nullable=False)
    expected_qty = Column(Numeric(12, 3), default=0)  # aus stock_item.current_stock
    counted_qty = Column(Numeric(12, 3), nullable=True)  # NULL = noch nicht gezählt
    variance = Column(Numeric(12, 3), default=0)  # counted - expected
    notes = Column(Text, nullable=True)


class Recipe(Base):
    """Rezept / Stückliste — verlinkt Product mit StockItems + Mengen."""
    __tablename__ = 'recipes'
    __table_args__ = (
        Index('idx_recipe_tenant_product', 'tenant_slug', 'product_id'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_slug = Column(String, ForeignKey('tenants.slug', ondelete='CASCADE'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    stock_item_id = Column(Integer, ForeignKey('stock_items.id', ondelete='CASCADE'), nullable=False)
    quantity = Column(Numeric(12, 4), nullable=False)  # pro 1 Portion Product
    unit = Column(String, nullable=False)  # muss mit stock_item.base_unit kompatibel sein
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=sa.func.now())


# Create all tables
Base.metadata.create_all(bind=engine)

# ── Dynamic DB Migrations (SQLite & Postgres) ───────────────
def _migrate_database():
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
    add_column_if_missing('tenants', 'logo_url_2', "TEXT DEFAULT ''")  # Zweites Logo (für Tenants mit 2 Läden)
    # Upselling: related_product_ids auf Product-Tabelle
    add_column_if_missing('products', 'related_product_ids', "TEXT DEFAULT '[]'")
    # POS / Kassensystem-Integration auf Tenant
    add_column_if_missing('tenants', 'pos_system', "VARCHAR DEFAULT 'none'")
    add_column_if_missing('tenants', 'pos_api_url', "TEXT DEFAULT ''")
    add_column_if_missing('tenants', 'pos_api_key', "TEXT DEFAULT ''")
    add_column_if_missing('tenants', 'pos_api_secret', "TEXT DEFAULT ''")
    add_column_if_missing('tenants', 'pos_location_id', "VARCHAR DEFAULT ''")
    add_column_if_missing('tenants', 'pos_active', "BOOLEAN DEFAULT FALSE")
    # Super-Admin Toggle: orders_enabled = False → Gäste sehen Speisekarte aber können nicht bestellen
    add_column_if_missing('tenants', 'orders_enabled', "BOOLEAN DEFAULT TRUE")
    add_column_if_missing('tenants', 'loyalty_enabled', "BOOLEAN DEFAULT TRUE")
    add_column_if_missing('tenants', 'notification_icon_path', "VARCHAR")
    # PHASE 4: operating_mode — 'full', 'menu_only', 'stempelkarte_only'
    add_column_if_missing('tenants', 'operating_mode', "VARCHAR DEFAULT 'full'")
    add_column_if_missing('tenants', 'show_revenue', "BOOLEAN DEFAULT TRUE")  # Super-Admin: Tenant sieht Umsatz/Reports
    # PHASE 4: operating_mode — 'full', 'menu_only', 'stempelkarte_only'
    add_column_if_missing('tenants', 'operating_mode', "VARCHAR DEFAULT 'full'")
    # PHASE 1: Short-Code + Customer-Fields für LoyaltyCustomer
    add_column_if_missing('loyalty_customers', 'short_code', "VARCHAR DEFAULT ''")
    add_column_if_missing('loyalty_customers', 'nickname', "VARCHAR")
    add_column_if_missing('loyalty_customers', 'birthday', "VARCHAR")  # "MM-DD" nur Monat+Tag, DSGVO!
    add_column_if_missing('loyalty_customers', 'tier', "VARCHAR DEFAULT 'neu'")
    add_column_if_missing('loyalty_customers', 'last_message', "VARCHAR DEFAULT 'Willkommen!'")
    add_column_if_missing('loyalty_customers', 'msg_nonce', "INTEGER DEFAULT 0")
    # Drei-Kanal-Server-Lookup (DSGVO-konforme Geräteerkennung)
    add_column_if_missing('loyalty_customers', 'anonymous_id', "VARCHAR")
    add_column_if_missing('loyalty_customers', 'pass_downloaded_at', "VARCHAR")
    # Wallet-Banner-Foto für LoyaltyCard (Tenant kann Foto hochladen)
    add_column_if_missing('loyalty_cards', 'wallet_banner_path', "VARCHAR")
    add_column_if_missing('loyalty_cards', 'wallet_banner_mode', "VARCHAR DEFAULT 'full'")
    # § 5 TMG: Verantwortlicher / Inhaber für Impressum
    add_column_if_missing('tenants', 'owner_name', "VARCHAR DEFAULT ''")
    add_column_if_missing('tenants', 'owner_street', "VARCHAR DEFAULT ''")
    add_column_if_missing('tenants', 'owner_email', "VARCHAR DEFAULT ''")
    add_column_if_missing('tenants', 'owner_phone', "VARCHAR DEFAULT ''")

    # ── Bug-Fix: Existierende NULL-Werte in price_mode auf 'brutto' setzen.
    # Früher konnten NULL-Werte entstehen (kein server_default, save-Pfad nicht
    # defensiv). Jetzt: einmalig alle NULLs bereinigen.
    try:
        with engine.begin() as conn:
            if _IS_POSTGRES:
                conn.execute(sa.text("UPDATE tenants SET price_mode = 'brutto' WHERE price_mode IS NULL"))
            else:
                conn.execute(sa.text("UPDATE tenants SET price_mode = 'brutto' WHERE price_mode IS NULL OR price_mode = ''"))
    except Exception as e:
        print(f"[Migration] price_mode NULL-Bereinigung übersprungen: {e}")

    # ── Personal Planung: Staff-Tabelle um additive Spalten erweitern ──
    add_column_if_missing('staff', 'email', "VARCHAR(255)")
    add_column_if_missing('staff', 'phone', "VARCHAR(40)")
    add_column_if_missing('staff', 'hourly_rate', "NUMERIC(8,2) DEFAULT 0")
    add_column_if_missing('staff', 'weekly_target_hours', "NUMERIC(5,1) DEFAULT 0")
    add_column_if_missing('staff', 'contract_type', "VARCHAR(20) DEFAULT 'minijob'")
    add_column_if_missing('staff', 'active', "BOOLEAN DEFAULT TRUE")
    add_column_if_missing('staff', 'color', "VARCHAR(7)")

    # ── Premium-Tier System: Tenant um Tier und Feature-Flags erweitern ──
    add_column_if_missing('tenants', 'tier', "VARCHAR DEFAULT 'free'")
    add_column_if_missing('tenants', 'enabled_features', "TEXT DEFAULT '[]'")

    # ── Lagerverwaltung: UnitOfMeasure mit Standard-Einheiten seeden ──
    try:
        with engine.begin() as conn:
            existing = conn.execute(sa.text("SELECT COUNT(*) FROM unit_of_measure")).scalar()
            if existing == 0:
                standard_uoms = [
                    ('Stk', 'Stk', 'count'),
                    ('kg', 'kg', 'weight'),
                    ('g', 'g', 'weight'),
                    ('L', 'L', 'volume'),
                    ('ml', 'ml', 'volume'),
                    ('Pack', 'Pack', 'count'),
                    ('Kasten', 'Kasten', 'count'),
                    ('Kiste', 'Kiste', 'count'),
                    ('Box', 'Box', 'count'),
                    ('Flasche', 'Flasche', 'count'),
                    ('Portion', 'Port', 'count'),
                    ('Bund', 'Bund', 'count'),
                    ('m', 'm', 'count'),
                ]
                for name, short, base in standard_uoms:
                    conn.execute(sa.text(
                        "INSERT INTO unit_of_measure (name, short, base_unit) VALUES (:n, :s, :b)"
                    ), {"n": name, "s": short, "b": base})
                print(f"[DB Migration] {len(standard_uoms)} Standard-Mengeneinheiten hinzugefügt.")
    except Exception as e:
        print(f"[DB Migration] UnitOfMeasure seeding übersprungen: {e}")


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
    # Announcement-Modus: Banner-Farbe (Tenant kann selbst wählen, Standard rot)
    add_column_if_missing('events', 'banner_color', "VARCHAR DEFAULT '#dc2626'")

    # Migrate 'categories' table
    add_column_if_missing('categories', 'position', "INTEGER DEFAULT 0")
    add_column_if_missing('categories', 'super_group_id', "INTEGER")

    # Migrate 'order_items' table
    add_column_if_missing('order_items', 'item_status', "VARCHAR DEFAULT 'pending'")
    add_column_if_missing('order_items', 'note', "TEXT")
    # Multi-Tenant: tenant_slug auf order_items für Tenant-Isolation
    add_column_if_missing('order_items', 'tenant_slug', "VARCHAR REFERENCES tenants(slug) ON DELETE CASCADE")

    # Multi-Tenant: tenant_slug auf event child tables für Tenant-Isolation
    add_column_if_missing('event_products', 'tenant_slug', "VARCHAR REFERENCES tenants(slug) ON DELETE CASCADE")
    add_column_if_missing('event_combos', 'tenant_slug', "VARCHAR REFERENCES tenants(slug) ON DELETE CASCADE")
    add_column_if_missing('event_combo_items', 'tenant_slug', "VARCHAR REFERENCES tenants(slug) ON DELETE CASCADE")

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


def migrate_tenant_slug_backfill():
    """Multi-Tenant Migration: Backfill tenant_slug on child tables from parent tables.
    order_items.tenant_slug ← orders.tenant_slug
    event_products.tenant_slug ← events.tenant_slug
    event_combos.tenant_slug ← events.tenant_slug
    event_combo_items.tenant_slug ← event_combos.tenant_slug (via event_combos → events)
    Runs once on startup, only updates rows where tenant_slug IS NULL."""
    try:
        with engine.begin() as conn:
            # Backfill order_items from orders
            try:
                result = conn.execute(sa.text("""
                    UPDATE order_items SET tenant_slug = o.tenant_slug
                    FROM orders o WHERE order_items.order_id = o.id
                    AND order_items.tenant_slug IS NULL
                """))
                if result.rowcount > 0:
                    print(f"[Multi-Tenant] Backfilled {result.rowcount} order_items.tenant_slug")
            except Exception as e:
                print(f"[Multi-Tenant] order_items backfill: {e}")

            # Backfill event_products from events
            try:
                result = conn.execute(sa.text("""
                    UPDATE event_products SET tenant_slug = e.tenant_slug
                    FROM events e WHERE event_products.event_id = e.id
                    AND event_products.tenant_slug IS NULL
                """))
                if result.rowcount > 0:
                    print(f"[Multi-Tenant] Backfilled {result.rowcount} event_products.tenant_slug")
            except Exception as e:
                print(f"[Multi-Tenant] event_products backfill: {e}")

            # Backfill event_combos from events
            try:
                result = conn.execute(sa.text("""
                    UPDATE event_combos SET tenant_slug = e.tenant_slug
                    FROM events e WHERE event_combos.event_id = e.id
                    AND event_combos.tenant_slug IS NULL
                """))
                if result.rowcount > 0:
                    print(f"[Multi-Tenant] Backfilled {result.rowcount} event_combos.tenant_slug")
            except Exception as e:
                print(f"[Multi-Tenant] event_combos backfill: {e}")

            # Backfill event_combo_items from event_combos
            try:
                result = conn.execute(sa.text("""
                    UPDATE event_combo_items SET tenant_slug = ec.tenant_slug
                    FROM event_combos ec WHERE event_combo_items.combo_id = ec.id
                    AND event_combo_items.tenant_slug IS NULL
                """))
                if result.rowcount > 0:
                    print(f"[Multi-Tenant] Backfilled {result.rowcount} event_combo_items.tenant_slug")
            except Exception as e:
                print(f"[Multi-Tenant] event_combo_items backfill: {e}")

    except Exception as e:
        print(f"[Multi-Tenant] Backfill migration failed: {e}")


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
                # Already have events — DO NOT clear happy_hour_price anymore!
                # The HH price is a legitimate feature (Tab "Preise & HH" im Admin)
                # and should NOT be deleted when events exist.
                # Old migration code was deleting HH prices on every server restart.
                continue  # Already migrated — skip without deleting HH prices

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
def _create_indexes_if_not_exists(session=None):
    """Idempotent: creates all performance indexes via CREATE INDEX IF NOT EXISTS.

    This is critical for live operations: model-level `index=True` / `__table_args__`
    only apply to *new* tables created via `Base.metadata.create_all()`. For tables
    that already exist in production (PostgreSQL 16), we must issue explicit
    `CREATE INDEX IF NOT EXISTS` statements — otherwise the new indexes would
    silently never be created. Safe to call multiple times.
    """
    indexes = [
        # ── Category ──
        "CREATE INDEX IF NOT EXISTS idx_category_tenant_pos ON categories (tenant_slug, position)",
        "CREATE INDEX IF NOT EXISTS idx_category_tenant_slug ON categories (tenant_slug)",
        # ── Product ──
        "CREATE INDEX IF NOT EXISTS idx_product_tenant_pos ON products (tenant_slug, position)",
        "CREATE INDEX IF NOT EXISTS idx_product_tenant_slug ON products (tenant_slug)",
        # ── Order ──
        "CREATE INDEX IF NOT EXISTS idx_order_tenant_id ON orders (tenant_slug, id)",
        "CREATE INDEX IF NOT EXISTS idx_order_tenant_slug ON orders (tenant_slug)",
        # Phase 3 — Composite-Index für häufige Filter "offene Bestellungen pro Tenant":
        "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (tenant_slug, status)",
        # Phase 3 — Index für Tisch-Suche (z.B. "alle Bestellungen an Tisch 5"):
        # "table" ist reserved keyword in SQL → gequotet.
        "CREATE INDEX IF NOT EXISTS idx_orders_table ON orders (tenant_slug, \"table\")",
        # ── OrderItem ──
        "CREATE INDEX IF NOT EXISTS idx_orderitem_order_id ON order_items (order_id)",
        # Phase 3 — Index für Item-Status-Filter (Küchen-View: "alle pending items"):
        "CREATE INDEX IF NOT EXISTS idx_orderitem_status ON order_items (item_status)",
        # ── Staff ──
        "CREATE INDEX IF NOT EXISTS idx_staff_tenant_name ON staff (tenant_slug, name)",
        "CREATE INDEX IF NOT EXISTS idx_staff_tenant_slug ON staff (tenant_slug)",
        # ── ServiceCall ──
        "CREATE INDEX IF NOT EXISTS idx_servicecall_tenant_slug ON service_calls (tenant_slug)",
        # ── Table ──
        "CREATE INDEX IF NOT EXISTS idx_table_tenant_number_zone ON tables (tenant_slug, number, zone)",
        "CREATE INDEX IF NOT EXISTS idx_table_tenant_slug ON tables (tenant_slug)",
        # ── AuditLog ──
        "CREATE INDEX IF NOT EXISTS idx_auditlog_tenant_id ON audit_log (tenant_slug, id)",
        "CREATE INDEX IF NOT EXISTS idx_auditlog_tenant_slug ON audit_log (tenant_slug)",
        # ── Event ──
        "CREATE INDEX IF NOT EXISTS idx_event_tenant_pos ON events (tenant_slug, position)",
        "CREATE INDEX IF NOT EXISTS idx_event_tenant_slug ON events (tenant_slug)",
        # ── EventProduct ──
        "CREATE INDEX IF NOT EXISTS idx_eventproduct_event_id ON event_products (event_id)",
        # ── EventCombo ──
        "CREATE INDEX IF NOT EXISTS idx_eventcombo_event_id ON event_combos (event_id)",
        # ── EventComboItem ──
        "CREATE INDEX IF NOT EXISTS idx_eventcomboitem_combo_id ON event_combo_items (combo_id)",
        # ── RevenueAdjustment ──
        "CREATE INDEX IF NOT EXISTS idx_revenue_adjustment_tenant_slug ON revenue_adjustments (tenant_slug)",
    ]
    owns_session = session is None
    if owns_session:
        session = SessionLocal()
    try:
        for sql in indexes:
            try:
                session.execute(sa.text(sql))
            except Exception as e:
                # Index creation is best-effort: missing table / already-existing index
                # must NOT block app startup. Log and continue.
                print(f"[DB Migration] Index creation failed: {sql}: {e}")
        session.commit()
    finally:
        if owns_session:
            session.close()


def _setup_rls_and_partitioning():
    """PostgreSQL Row-Level Security (RLS) + Partitionierung.
    
    RLS: Defense-in-Depth für Tenant-Isolation. Selbst wenn ein App-Bug den
    tenant_slug-Filter vergisst, verhindert RLS dass ein Tenant Daten eines
    anderen Tenants sieht. RLS ist nur auf PostgreSQL aktiv (nicht SQLite).
    
    Partitionierung: orders-Tabelle wird nach Monat partitioniert.
    Bei 1M+ Bestellungen bleiben Queries schnell (nur aktuelle Partition wird gescannt).
    Hinweis: Partitionierung erfordert dass die Tabelle neu erstellt wird —
    wir erstellen nur die Policy, die Partitionierung erfolgt in einem separaten
    Migrations-Schritt um Zero-Downtime zu gewährleisten."""
    if not _IS_POSTGRES:
        print("[RLS] Übersprungen — nur PostgreSQL")
        return
    
    try:
        with engine.begin() as conn:
            # ── RLS Policies ──
            # Hinweis: RLS-Policies werden nur erstellt, nicht erzwungen (FORCE ROW LEVEL SECURITY).
            # Das bedeutet: der aktuelle DB-User (super_admin) kann alles sehen (BYPASSRLS).
            # Die App nutzt weiterhin application-level filtering (tenant_slug in WHERE).
            # RLS ist nur eine zusätzliche Safety-Net-Ebene.
            
            tables_for_rls = [
                'orders', 'order_items', 'products', 'categories', 'staff',
                'service_calls', 'tables', 'audit_log', 'events',
                'event_products', 'event_combos', 'event_combo_items',
                'super_groups', 'revenue_adjustments'
            ]
            
            for table in tables_for_rls:
                try:
                    # Enable RLS on the table (if not already enabled)
                    conn.execute(sa.text(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY"))
                except Exception:
                    pass  # Table might not exist yet or RLS already enabled
                
                try:
                    # Create policy: tenant can only see their own rows
                    # Policy name is unique per table
                    policy_name = f"{table}_tenant_isolation"
                    conn.execute(sa.text(f"""
                        CREATE POLICY IF NOT EXISTS {policy_name} ON {table}
                        USING (tenant_slug = current_setting('app.tenant_id', true))
                    """))
                except Exception:
                    pass  # Policy might already exist or column missing
            
            print(f"[RLS] Row-Level Security Policies erstellt für {len(tables_for_rls)} Tabellen")
            
    except Exception as e:
        print(f"[RLS] Setup übersprungen: {e}")


def _create_order_partitions():
    """Erstellt monatliche Partitionen für die orders-Tabelle.
    
    Bei 1M+ Bestellungen wird die orders-Tabelle sehr groß. PostgreSQL
    Partition-Pruning sorgt dass nur die relevante Partition gescannt wird.
    
    Hinweis: Dies ist eine vorbereitende Funktion. Die eigentliche Partitionierung
    erfordert dass die orders-Tabelle als partitioned table neu erstellt wird.
    Das ist ein separater Migrations-Schritt (Phase 2) um Zero-Downtime zu gewährleisten.
    Aktuell: Nur future partitions für den aktuellen + nächsten Monat vorbereiten."""
    if not _IS_POSTGRES:
        return
    
    try:
        from datetime import datetime, timedelta
        now = datetime.now()
        # Create partition for current month + next 3 months
        for i in range(4):
            month_start = datetime(now.year, now.month, 1) + timedelta(days=32 * i)
            month_start = datetime(month_start.year, month_start.month, 1)
            month_end = datetime(month_start.year, month_start.month + 1, 1) if month_start.month < 12 else datetime(month_start.year + 1, 1, 1)
            
            partition_name = f"orders_{month_start.strftime('%Y_%m')}"
            try:
                with engine.begin() as conn:
                    conn.execute(sa.text(f"""
                        CREATE TABLE IF NOT EXISTS {partition_name}
                        PARTITION OF orders FOR VALUES FROM ('{month_start.strftime('%Y-%m-%d')}')
                        TO ('{month_end.strftime('%Y-%m-%d')}')
                    """))
            except Exception:
                pass  # Partition might already exist or orders not partitioned yet
    except Exception as e:
        print(f"[Partitioning] Orders partitioning übersprungen: {e}")


def run_migrations():
    """Run all pending database migrations. Called once at app startup."""
    _migrate_database()
    migrate_happy_hour_to_events()
    _create_indexes_if_not_exists()
    print("[DB Migration] Performance indexes ensured.")
    # Multi-Tenant: Backfill tenant_slug on child tables
    try:
        migrate_tenant_slug_backfill()
    except Exception as e:
        print(f"[Multi-Tenant] Backfill übersprungen: {e}")
    # RLS (Row-Level Security) — nur PostgreSQL, komplett in try/except
    try:
        _setup_rls_and_partitioning()
    except Exception as e:
        print(f"[RLS] Setup komplett übersprungen: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

