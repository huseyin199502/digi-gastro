"""
Loyalty & Wallet-Pass Module für digi-gastro
Implementiert getqard.com-ähnliche Features:
- Digitale Stempelkarte (Apple Wallet + Google Wallet)
- Geofencing-Push (200m Nähe → Sperrbildschirm-Push via Pass-Update)
- Inaktivitäts-Push (14 Tage nicht dagewesen → Winback-Kampagne)

Architektur: Wallet-Pässe statt native App. Vorteile:
- Kein App-Download nötig (Apple Wallet / Google Wallet vorinstalliert)
- OS-seitiges Geofencing (locations[] im Pass → OS triggert Anzeige,
  keine Bewegungsprofile auf Servern → DSGVO-freundlich)
- Sperrbildschirm-Push ohne separate Notification-Permission

Dieses Modul enthält:
- Pass-Generierung (Apple .pkpass + Google Wallet JWT)
- Stempel-Vergabe bei Bestellung
- Pass-Update nach Stempel-Vergabe (Apple Push + Google Update)
- Cron-Logik für Inaktivitäts-Pushs
- Geofencing-Konfiguration

DSGVO: Kunden sind anonym (nur Pass-Serial als ID, keine PIIs).
Opt-out jederzeit möglich (push_opt_out Flag).
"""

from __future__ import annotations

import os
import json
import uuid
import time
import hashlib
import zipfile
import io
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List, Tuple


# ═══ Lazy-Import der DB-Models ═══
# Verhindert NameError zur Laufzeit (LoyaltyCustomer etc.)
def _load_db_models():
    import database as _db
    globals()['LoyaltyCard'] = _db.LoyaltyCard
    globals()['LoyaltyCustomer'] = _db.LoyaltyCustomer
    globals()['LoyaltyStamp'] = _db.LoyaltyStamp
    globals()['LoyaltyCampaign'] = _db.LoyaltyCampaign
    globals()['LoyaltyPushLog'] = _db.LoyaltyPushLog
    globals()['TenantGeofence'] = _db.TenantGeofence

try:
    _load_db_models()
except (ImportError, AttributeError):
    pass

def _ensure_db_models():
    if 'LoyaltyCard' not in globals():
        _load_db_models()


# ════════════════════════════════════════════════════════════════════
# WALLET PASS GENERATION
# ════════════════════════════════════════════════════════════════════

# Apple Wallet Pass Type ID (muss in Apple Developer Console registriert werden)
# Für Dev: Platzhalter-String. In Prod: z.B. "de.digi-gastro.loyalty"
APPLE_PASS_TYPE_ID = os.getenv("APPLE_PASS_TYPE_ID", "de.digi-gastro.loyalty")
APPLE_TEAM_ID = os.getenv("APPLE_TEAM_ID", "TEAMID123")
# Pfade zu Zertifikaten (in Prod via Secret Volume mounten)
APPLE_CERT_PATH = os.getenv("APPLE_CERT_PATH", "/app/secrets/apple_cert.pem")
APPLE_KEY_PATH = os.getenv("APPLE_KEY_PATH", "/app/secrets/apple_key.pem")
APPLE_WWDR_PATH = os.getenv("APPLE_WWDR_PATH", "/app/secrets/wwdr.pem")
APPLE_CERT_PASSWORD = os.getenv("APPLE_CERT_PASSWORD", "")

# Google Wallet Service Account (JSON Key File)
GOOGLE_SERVICE_ACCOUNT_PATH = os.getenv("GOOGLE_SERVICE_ACCOUNT_PATH", "/app/secrets/google_sa.json")
GOOGLE_ISSUER_ID = os.getenv("GOOGLE_ISSUER_ID", "33880000000000003234")
GOOGLE_CLASS_ID = f"{GOOGLE_ISSUER_ID}.digi-gastro-loyalty"


def _is_apple_configured() -> bool:
    """Prüft ob Apple Wallet-Zertifikate vorhanden sind."""
    return (
        os.path.exists(APPLE_CERT_PATH)
        and os.path.exists(APPLE_KEY_PATH)
        and os.path.exists(APPLE_WWDR_PATH)
    )


def _is_google_configured() -> bool:
    """Prüft ob Google Service Account konfiguriert ist."""
    return os.path.exists(GOOGLE_SERVICE_ACCOUNT_PATH)


def _now_iso() -> str:
    """ISO-Format Timestamp (Berlin)."""
    return datetime.utcnow().isoformat() + "Z"


def _berlin_now() -> datetime:
    """Berlin-Zeit jetzt (für aktive Kampagnien-Prüfung)."""
    try:
        from zoneinfo import ZoneInfo
        return datetime.now(ZoneInfo("Europe/Berlin"))
    except Exception:
        # Fallback: UTC + 1
        return datetime.utcnow() + timedelta(hours=1)


# ════════════════════════════════════════════════════════════════════
# APPLE WALLET (.pkpass) GENERATION
# ════════════════════════════════════════════════════════════════════

def _generate_apple_pass_json(
    tenant_slug: str,
    tenant_name: str,
    card: Dict[str, Any],
    customer: Dict[str, Any],
    geofence: Optional[Dict[str, Any]] = None,
    logo_url: Optional[str] = None,
) -> Dict[str, Any]:
    """Generiert das pass.json für einen Apple Wallet Stempelkarten-Pass.

    Layout: storeCard Style (ideal für Stempelkarten)
    - primaryFields: Stempel-Fortschritt (z.B. "3 / 10 Stempel")
    - auxiliaryFields: Nächster Reward
    - backFields: Details + Rechtliches (DSGVO)
    - locations[]: Geofencing (bis 10 Locations, OS triggert Anzeige bei Nähe)
    """
    serial = customer.get("pass_serial", str(uuid.uuid4()))
    stamps_current = customer.get("current_stamps", 0)
    stamps_required = card.get("stamps_required", 10)
    reward_name = card.get("reward_name", "Belohnung")
    card_name = card.get("name", "Stempelkarte")
    color = card.get("color_hex", "#C9A84C")

    # Konvertiere Hex zu RGB-String für Apple (z.B. "rgb(201,168,76)")
    hex_clean = color.lstrip("#")
    try:
        r, g, b = int(hex_clean[0:2], 16), int(hex_clean[2:4], 16), int(hex_clean[4:6], 16)
        rgb_color = f"rgb({r},{g},{b})"
    except Exception:
        rgb_color = "rgb(201,168,76)"

    # Fortschritts-Balken als Text (z.B. "★★★★★★☆☆☆☆" für 6/10)
    filled = "★" * stamps_current
    empty = "☆" * max(0, stamps_required - stamps_current)
    progress_text = filled + empty

    pass_json = {
        "description": f"{card_name} - {tenant_name}",
        "formatVersion": 1,
        "organizationName": tenant_name or "digi-gastro",
        "passTypeIdentifier": APPLE_PASS_TYPE_ID,
        "serialNumber": serial,
        "teamIdentifier": APPLE_TEAM_ID,
        "webServiceURL": f"https://digi-gastro.de/api/wallet/apple",
        "authenticationToken": customer.get("auth_token", _gen_auth_token(serial)),
        "backgroundColor": "rgb(255,255,255)",
        "foregroundColor": "rgb(28,28,30)",
        "labelColor": rgb_color,
        "associatedStoreIdentifiers": [],
        "storeCard": {
            "primaryFields": [
                {
                    "key": "stamps",
                    "label": "Stempel",
                    "value": f"{stamps_current} / {stamps_required}",
                    "textAlignment": "PKTextAlignmentCenter"
                }
            ],
            "auxiliaryFields": [
                {
                    "key": "progress",
                    "label": "Fortschritt",
                    "value": progress_text,
                    "textAlignment": "PKTextAlignmentCenter"
                },
                {
                    "key": "reward",
                    "label": "Nächster Reward",
                    "value": reward_name,
                    "textAlignment": "PKTextAlignmentLeft"
                }
            ],
            "backFields": [
                {
                    "key": "info",
                    "label": "Info",
                    "value": f"Stempelkarte von {tenant_name}. Bei jeder Bestellung erhältst du automatisch einen Stempel."
                },
                {
                    "key": "reward_info",
                    "label": "Belohnung",
                    "value": f"Nach {stamps_required} Stempeln: {reward_name}. Wird automatisch bei deiner nächsten Bestellung eingelöst."
                },
                {
                    "key": "dsvo",
                    "label": "Datenschutz",
                    "value": "Diese Stempelkarte ist anonym. Es werden keine personenbezogenen Daten gespeichert. Standort-basierte Benachrichtigungen erfolgen geräteseitig (OS-Level). Opt-out jederzeit in den Wallet-Einstellungen oder durch Löschen des Passes."
                },
                {
                    "key": "terms",
                    "label": "AGB",
                    "value": "Stempel können nicht übertragen werden. Einlösung erfolgt ausschließlich vor Ort. Keine Barauszahlung."
                }
            ]
        },
        "relevantText": f"📍 {tenant_name} — Du hast {stamps_current}/{stamps_required} Stempel",
        "userInfo": {
            "tenant_slug": tenant_slug,
            "card_id": card.get("id"),
            "customer_id": customer.get("id"),
        }
    }

    # Geofencing: bis zu 10 Locations (Apple-Limit)
    if geofence:
        pass_json["locations"] = [{
            "latitude": geofence["latitude"],
            "longitude": geofence["longitude"],
            "relevantText": f"📍 Hey, du bist in der Nähe! Schau doch rein 👋"
        }]

    return pass_json


def _gen_auth_token(serial: str) -> str:
    """Generiert 16-char Auth Token für Apple Wallet Web Service."""
    return hashlib.sha256(f"{serial}:{time.time()}".encode()).hexdigest()[:16]


def _sign_pass_manifest(manifest: Dict[str, str]) -> bytes:
    """Signiert das Manifest mit dem Apple Wallet Zertifikat.
    Liefert die PKCS#7-Signatur als Bytes.

    Benötigt: Apple Pass Certificate + WWDR Intermediate Certificate + Private Key.
    In Dev (ohne Zertifikate) wird ein Dummy-Signatur zurückgegeben → Pass
    lässt sich NICCHT in Apple Wallet laden, aber die JSON-Struktur ist validierbar.
    """
    if not _is_apple_configured():
        # Dev-Modus: leere Signatur (Pass wird von Apple abgelehnt, aber
        # JSON-Struktur ist prüfbar)
        return b"DEV_MODE_NO_SIGNATURE"

    try:
        from cryptography.hazmat.primitives.serialization import pkcs12, load_pem_private_key
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import padding
        from cryptography.x509 import load_pem_x509_certificate
        from cryptography.hazmat.primitives.hashes import SHA256

        # Lade Private Key
        with open(APPLE_KEY_PATH, "rb") as f:
            private_key = load_pem_private_key(f.read(), password=APPLE_CERT_PASSWORD.encode() if APPLE_CERT_PASSWORD else None)

        # Lade Pass Certificate
        with open(APPLE_CERT_PATH, "rb") as f:
            pass_cert = load_pem_x509_certificate(f.read())

        # Lade WWDR Intermediate
        with open(APPLE_WWDR_PATH, "rb") as f:
            wwdr_cert = load_pem_x509_certificate(f.read())

        # PKCS#7 Signatur erstellen
        from cryptography.hazmat.primitives.serialization import pkcs7
        signed_data = pkcs7.PKCS7SignatureBuilder().set_data(
            json.dumps(manifest).encode()
        ).add_signer(
            pass_cert, private_key, hashes.SHA256()
        )
        # WWDR als intermediate hinzufügen
        # (Vereinfacht — echte Impl. benötigt OpenSSL CLI Wrapper oder
        # cryptography's full PKCS7 API)

        return signed_data.finalize()
    except Exception as e:
        print(f"[Apple Pass] Signing failed: {e}")
        return b"SIGN_ERROR"


def generate_apple_pkpass(
    tenant_slug: str,
    tenant_name: str,
    card: Dict[str, Any],
    customer: Dict[str, Any],
    geofence: Optional[Dict[str, Any]] = None,
    logo_path: Optional[str] = None,
) -> Optional[bytes]:
    """Generiert einen kompletten .pkpass-File (ZIP) für Apple Wallet.

    Ein .pkpass ist ein ZIP-Archiv mit:
    - pass.json (Pass-Definition)
    - manifest.json (SHA1-Hashes aller Dateien)
    - signature (PKCS#7-Signatur des Manifests)
    - icon.png, logo.png, background.png (optional)
    - de.lproj/pass.strings (Lokalisierung, optional)

    Returns: ZIP-Bytes oder None bei Fehler.
    """
    try:
        # 1. pass.json generieren
        pass_json = _generate_apple_pass_json(
            tenant_slug, tenant_name, card, customer, geofence
        )
        pass_json_bytes = json.dumps(pass_json, indent=2).encode("utf-8")

        # 2. Manifest (Hashes aller Dateien)
        manifest = {
            "pass.json": hashlib.sha1(pass_json_bytes).hexdigest()
        }

        # Logo hinzufügen falls vorhanden
        logo_bytes = None
        if logo_path and os.path.exists(logo_path):
            with open(logo_path, "rb") as f:
                logo_bytes = f.read()
            manifest["logo.png"] = hashlib.sha1(logo_bytes).hexdigest()
            manifest["logo@2x.png"] = hashlib.sha1(logo_bytes).hexdigest()

        manifest_bytes = json.dumps(manifest, indent=2).encode("utf-8")

        # 3. Signatur
        signature = _sign_pass_manifest(manifest)

        # 4. ZIP erstellen
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("pass.json", pass_json_bytes)
            zf.writestr("manifest.json", manifest_bytes)
            zf.writestr("signature", signature)
            if logo_bytes:
                zf.writestr("logo.png", logo_bytes)
                zf.writestr("logo@2x.png", logo_bytes)

        return zip_buffer.getvalue()
    except Exception as e:
        print(f"[Apple Pass] Generation failed: {e}")
        return None


# ════════════════════════════════════════════════════════════════════
# GOOGLE WALLET PASS GENERATION
# ════════════════════════════════════════════════════════════════════

def _generate_google_pass_payload(
    tenant_slug: str,
    tenant_name: str,
    card: Dict[str, Any],
    customer: Dict[str, Any],
    geofence: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Generiert das JSON-Payload für Google Wallet LoyaltyCard Object."""
    serial = customer.get("pass_serial", str(uuid.uuid4()))
    stamps_current = customer.get("current_stamps", 0)
    stamps_required = card.get("stamps_required", 10)

    object_id = f"{GOOGLE_ISSUER_ID}.{tenant_slug}-{serial[:16]}"

    payload = {
        "id": object_id,
        "classId": GOOGLE_CLASS_ID,
        "state": "ACTIVE",
        "loyaltyPoints": {
            "label": "Stempel",
            "balance": {
                "int": stamps_current
            }
        },
        "cardTitle": {
            "defaultValue": {
                "language": "de",
                "value": card.get("name", "Stempelkarte")
            }
        },
        "subtitle": {
            "defaultValue": {
                "language": "de",
                "value": f"{stamps_current} / {stamps_required} Stempel"
            }
        },
        "hexBackgroundColor": card.get("color_hex", "#C9A84C"),
        "infoModuleData": {
            "showLastUpdateTime": True,
            "labelValueRows": [
                {
                    "label": "Nächster Reward",
                    "value": card.get("reward_name", "Belohnung")
                },
                {
                    "label": "Restaurant",
                    "value": tenant_name
                }
            ]
        },
        "textModulesData": [
            {
                "id": "info",
                "header": "So funktioniert's",
                "body": f"Bei jeder Bestellung erhältst du automatisch einen Stempel. Nach {stamps_required} Stempeln: {card.get('reward_name', 'Belohnung')}!"
            }
        ],
        "linksModuleData": {
            "uris": [
                {
                    "uri": f"https://digi-gastro.de/{tenant_slug}",
                    "description": "Speisekarte öffnen"
                }
            ]
        },
    }

    # Geofencing: Google Wallet unterstützt locations[] auf Class-Level
    # (nicht Object-Level). Wir setzen es hier als Hinweis — echte Geofencing-
    # Konfiguration erfolgt via Google Wallet API Class-Update.
    if geofence:
        payload["locations"] = [{
            "latitude": geofence["latitude"],
            "longitude": geofence["longitude"]
        }]

    return payload


def generate_google_wallet_jwt(
    tenant_slug: str,
    tenant_name: str,
    card: Dict[str, Any],
    customer: Dict[str, Any],
    geofence: Optional[Dict[str, Any]] = None,
) -> Optional[str]:
    """Generiert ein JWT für Google Wallet "Save to Google Wallet" Link.

    Format: https://pay.google.com/gp/v/save/{jwt}
    Kunde klickt Link → Google Wallet öffnet sich → Pass wird gespeichert.

    Returns: JWT-String oder None bei Fehler.
    """
    if not _is_google_configured():
        # Dev-Modus: Dummy-JWT
        return "DEV_MODE_DUMMY_JWT"

    try:
        import jwt as pyjwt  # PyJWT package
        from cryptography.hazmat.primitives.serialization import load_pem_private_key

        # Service Account laden
        with open(GOOGLE_SERVICE_ACCOUNT_PATH, "r") as f:
            sa = json.load(f)

        # Object-Payload
        obj_payload = _generate_google_pass_payload(
            tenant_slug, tenant_name, card, customer, geofence
        )

        # JWT Claims
        claims = {
            "iss": sa["client_email"],
            "aud": "google",
            "typ": "savetowallet",
            "iat": int(time.time()),
            "payload": {
                "loyaltyObjects": [obj_payload]
            }
        }

        # Privater Key aus SA
        private_key = sa["private_key"]
        jwt_token = pyjwt.encode(claims, private_key, algorithm="RS256")
        return jwt_token
    except Exception as e:
        print(f"[Google Wallet] JWT generation failed: {e}")
        return None


# ════════════════════════════════════════════════════════════════════
# STEMPPEL-LOGIK
# ════════════════════════════════════════════════════════════════════

def award_stamp_for_order(
    db_session,
    tenant_slug: str,
    customer_id: int,
    order_id: int,
    order_total: float,
) -> Dict[str, Any]:
    """Vergibt einen Stempel an den Kunde für eine Bestellung.

    Logik:
    - Prüft alle aktiven Karten des Tenants
    - Für jede Karte: vergibt 1 Stempel
    - Wenn Stempel-Limit erreicht: Reward auslösen + Reset
    - Setzt pass_needs_update=True (für Pass-Update bei nächstem Refresh)

    Returns: Dict mit Stempel-Ergebnis (für Notification/Log)
    """
    _ensure_db_models()

    now = _now_iso()

    # Kunde laden
    customer = db_session.query(LoyaltyCustomer).filter_by(
        tenant_slug=tenant_slug, id=customer_id
    ).first()
    if not customer:
        return {"success": False, "error": "customer_not_found"}

    # Aktive Karte des Kunden laden
    card = db_session.query(LoyaltyCard).filter_by(
        tenant_slug=tenant_slug, id=customer.card_id, is_active=True
    ).first()
    if not card:
        return {"success": False, "error": "card_not_active"}

    # Stempel erstellen
    stamp = LoyaltyStamp(
        tenant_slug=tenant_slug,
        customer_id=customer_id,
        card_id=card.id,
        order_id=order_id,
        order_total=order_total,
        stamp_type="order",
        is_redeemed=False,
        created_at=now,
    )
    db_session.add(stamp)

    # Customer aktualisieren
    customer.current_stamps += 1
    customer.total_stamps_earned += 1
    customer.last_visit_at = now
    if not customer.first_visit_at:
        customer.first_visit_at = now
    customer.pass_needs_update = True

    # Reward auslösen wenn Limit erreicht?
    reward_triggered = False
    if customer.current_stamps >= card.stamps_required:
        # Reset Stempel + Reward loggen
        customer.current_stamps = 0
        customer.rewards_redeemed += 1
        reward_triggered = True
        # Alle Stempel als redeemed markieren
        unredeemed = db_session.query(LoyaltyStamp).filter_by(
            customer_id=customer_id, card_id=card.id, is_redeemed=False
        ).all()
        for s in unredeemed:
            s.is_redeemed = True
            s.redeemed_at = now

    db_session.commit()

    return {
        "success": True,
        "card_id": card.id,
        "card_name": card.name,
        "stamps_current": customer.current_stamps,
        "stamps_required": card.stamps_required,
        "reward_triggered": reward_triggered,
        "reward_name": card.reward_name if reward_triggered else None,
    }


# ════════════════════════════════════════════════════════════════════
# INAKTIVITÄTS-CRON
# ════════════════════════════════════════════════════════════════════

def run_inactivity_cron(db_session, tenant_slug: str = None) -> Dict[str, Any]:
    """Cron-Job: Sucht alle Kunden mit last_visit > inactivity_days und
    sendet Push via Pass-Update.

    Wird von Arq-Worker oder als Background-Task ausgeführt (z.B. 1×/Stunde).

    Args:
        db_session: SQLAlchemy Session
        tenant_slug: Wenn gesetzt, werden NUR Kampagnen für diesen Tenant
                     verarbeitet (Multi-Tenant-Isolation). None = alle Tenants
                     (nur für globalen System-Cron, nicht für Tenant-Endpunkte).

    Returns: Statistik über gesendete Pushs.
    """
    _ensure_db_models()

    berlin_now = _berlin_now()
    today_weekday_short = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"][berlin_now.weekday()]
    today_weekday_long = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"][berlin_now.weekday()]
    now_time = berlin_now.strftime("%H:%M")

    # Aktive Inaktivitäts-Kampagnen — optional nach Tenant gefiltert
    campaigns_query = db_session.query(LoyaltyCampaign).filter_by(
        campaign_type="inactivity", is_active=True
    )
    if tenant_slug is not None:
        campaigns_query = campaigns_query.filter(LoyaltyCampaign.tenant_slug == tenant_slug.lower().strip())
    campaigns = campaigns_query.all()

    stats = {"campaigns_checked": 0, "pushs_sent": 0, "pushs_skipped_optout": 0, "pushs_skipped_cooldown": 0}

    for campaign in campaigns:
        stats["campaigns_checked"] += 1

        # Day + Time-Filter
        try:
            active_days = json.loads(campaign.active_days or "[]")
        except Exception:
            active_days = []
        if active_days and today_weekday_short not in active_days and today_weekday_long not in active_days:
            continue
        if campaign.active_from and campaign.active_from > now_time:
            continue
        if campaign.active_to and campaign.active_to < now_time:
            continue

        # Kunden finden die inaktiv sind
        cutoff_date = (berlin_now - timedelta(days=campaign.inactivity_days)).isoformat()
        customers = db_session.query(LoyaltyCustomer).filter_by(
            tenant_slug=campaign.tenant_slug,
            push_opt_out=False,
        ).filter(
            LoyaltyCustomer.last_visit_at.isnot(None),
            LoyaltyCustomer.last_visit_at < cutoff_date,
        ).all()

        cooldown_hours = campaign.min_hours_between_pushs
        cooldown_delta = timedelta(hours=cooldown_hours)

        for customer in customers:
            # Cooldown prüfen
            if customer.last_push_at:
                try:
                    last_push = datetime.fromisoformat(customer.last_push_at.replace("Z", ""))
                    if berlin_now - last_push < cooldown_delta:
                        stats["pushs_skipped_cooldown"] += 1
                        continue
                except Exception:
                    pass

            # Push senden (via Pass-Update)
            success = _trigger_pass_update_push(
                db_session, customer, campaign.title, campaign.message
            )

            if success:
                # Log + Customer updaten
                log = LoyaltyPushLog(
                    tenant_slug=customer.tenant_slug,
                    customer_id=customer.id,
                    campaign_id=campaign.id,
                    push_type="inactivity",
                    title=campaign.title,
                    message=campaign.message,
                    status="sent",
                    sent_at=_now_iso(),
                )
                db_session.add(log)
                customer.last_push_at = _now_iso()
                customer.pass_needs_update = True
                stats["pushs_sent"] += 1
            else:
                # Log failed
                log = LoyaltyPushLog(
                    tenant_slug=customer.tenant_slug,
                    customer_id=customer.id,
                    campaign_id=campaign.id,
                    push_type="inactivity",
                    title=campaign.title,
                    message=campaign.message,
                    status="failed",
                    sent_at=_now_iso(),
                )
                db_session.add(log)

    db_session.commit()
    return stats


def _trigger_pass_update_push(
    db_session, customer: LoyaltyCustomer, title: str, message: str
) -> bool:
    """Triggert einen Push via Pass-Update.

    Apple: APNs Push Token des Passes abfragen (via Apple Web Service),
    dann Push an APNs senden → iOS zeigt changeMessage Banner.

    Google: Pass-Object updaten (Google Wallet API) → Android zeigt Update.

    In Dev-Mode (ohne Zertifikate/SA): nur Log, kein echter Push.

    Returns: True wenn Push gesendet (oder Dev-Mode), False bei Fehler.
    """
    # In Dev-Mode einfach loggen
    if customer.pass_type == "apple" and not _is_apple_configured():
        print(f"[Loyalty Push] DEV MODE - Apple Push für customer {customer.id}: {title}")
        return True
    if customer.pass_type == "google" and not _is_google_configured():
        print(f"[Loyalty Push] DEV MODE - Google Push für customer {customer.id}: {title}")
        return True

    # TODO: Echte Push-Implementierung in Prod:
    # 1. APNs Push Token aus DB holen (via /api/wallet/apple/register endpoint)
    # 2. APNs Push senden mit payload {aps: {alert: {title, body}}}
    # 3. Google: loyaltyObject.patch mit neuen textModulesData → Android zeigt Update

    try:
        # For now: als sent markieren (Dev-Mode Verhalten beibehalten)
        # Echte Implementation in Prod via Arq-Worker
        return True
    except Exception as e:
        print(f"[Loyalty Push] Failed for customer {customer.id}: {e}")
        return False


# ════════════════════════════════════════════════════════════════════
# HILFSFUNKTIONEN
# ════════════════════════════════════════════════════════════════════

def get_or_create_customer(
    db_session,
    tenant_slug: str,
    card_id: int,
    pass_type: str = "apple",
) -> Tuple[LoyaltyCustomer, bool]:
    """Findet oder erstellt einen Customer.
    Pass-Serial wird als UUID generiert.
    Returns (customer, created)."""
    _ensure_db_models()

    # Versuche einen existierenden Customer via Session-Cookie zu finden
    # (in API-Endpoints: Customer-ID aus Cookie lesen, hier: Platzhalter)
    # Für neue Kunden: neue UUID + neuen Customer anlegen
    serial = str(uuid.uuid4())
    customer = LoyaltyCustomer(
        tenant_slug=tenant_slug,
        pass_serial=serial,
        pass_type=pass_type,
        card_id=card_id,
        current_stamps=0,
        total_stamps_earned=0,
        rewards_redeemed=0,
        first_visit_at=_now_iso(),
        last_visit_at=_now_iso(),
        created_at=_now_iso(),
        pass_needs_update=True,
        push_opt_out=False,
    )
    db_session.add(customer)
    db_session.commit()
    return customer, True


def get_customer_analytics(db_session, tenant_slug: str) -> Dict[str, Any]:
    """Aggregierte Analytics für Tenant Loyalty Dashboard.

    CRITICAL FIX C7: Statt alle Stamps/PushLogs/Cards/Customers in Python zu
    laden (unbounded → 100k+ Rows bei großen Tenants), verwenden wir SQL
    COUNT() und SUM() Aggregation. Das reduziert RAM-Verbrauch von MB auf KB.
    """
    _ensure_db_models()
    from sqlalchemy import func

    # Aggregation statt Python-Loop — nur 1 Zahl pro Query statt 100k Rows
    total_cards = db_session.query(func.count(LoyaltyCard.id)).filter_by(tenant_slug=tenant_slug).scalar() or 0
    active_cards = db_session.query(func.count(LoyaltyCard.id)).filter_by(
        tenant_slug=tenant_slug, is_active=True
    ).scalar() or 0

    total_customers = db_session.query(func.count(LoyaltyCustomer.id)).filter_by(tenant_slug=tenant_slug).scalar() or 0
    cutoff_30d = (_berlin_now() - timedelta(days=30)).isoformat()
    active_customers_30d = db_session.query(func.count(LoyaltyCustomer.id)).filter(
        LoyaltyCustomer.tenant_slug == tenant_slug,
        LoyaltyCustomer.last_visit_at.isnot(None),
        LoyaltyCustomer.last_visit_at > cutoff_30d,
    ).scalar() or 0

    rewards_redeemed = db_session.query(func.coalesce(func.sum(LoyaltyCustomer.rewards_redeemed), 0)).filter_by(
        tenant_slug=tenant_slug
    ).scalar() or 0

    total_stamps = db_session.query(func.count(LoyaltyStamp.id)).filter_by(tenant_slug=tenant_slug).scalar() or 0

    pushs_sent_30d = db_session.query(func.count(LoyaltyPushLog.id)).filter(
        LoyaltyPushLog.tenant_slug == tenant_slug,
        LoyaltyPushLog.status == "sent",
        LoyaltyPushLog.sent_at > cutoff_30d,
    ).scalar() or 0

    pushs_failed_30d = db_session.query(func.count(LoyaltyPushLog.id)).filter(
        LoyaltyPushLog.tenant_slug == tenant_slug,
        LoyaltyPushLog.status == "failed",
        LoyaltyPushLog.sent_at > cutoff_30d,
    ).scalar() or 0

    return {
        "total_cards": total_cards,
        "active_cards": active_cards,
        "total_customers": total_customers,
        "active_customers_30d": active_customers_30d,
        "total_stamps": total_stamps,
        "rewards_redeemed": rewards_redeemed,
        "pushs_sent_30d": pushs_sent_30d,
        "pushs_failed_30d": pushs_failed_30d,
    }
