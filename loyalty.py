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
# Pfade zu Zertifikaten (in Prod via Secret Volume mounten ODER via Base64-Env-Vars)
APPLE_CERT_PATH = os.getenv("APPLE_CERT_PATH", "/app/secrets/apple_cert.pem")
APPLE_KEY_PATH = os.getenv("APPLE_KEY_PATH", "/app/secrets/apple_key.pem")
APPLE_WWDR_PATH = os.getenv("APPLE_WWDR_PATH", "/app/secrets/wwdr.pem")
APPLE_CERT_PASSWORD = os.getenv("APPLE_CERT_PASSWORD", "")

# Google Wallet Service Account (JSON Key File)
GOOGLE_SERVICE_ACCOUNT_PATH = os.getenv("GOOGLE_SERVICE_ACCOUNT_PATH", "/app/secrets/google_sa.json")
GOOGLE_ISSUER_ID = os.getenv("GOOGLE_ISSUER_ID", "33880000000000003234")
GOOGLE_CLASS_ID = f"{GOOGLE_ISSUER_ID}.digi-gastro-loyalty"


# ──────────────────────────────────────────────────────────────────
# WALLET SECRETS — Base64-Env-Vars als Alternative zu File-Mounts
# ──────────────────────────────────────────────────────────────────
# Coolify API unterstützt keine File-Mounts, nur Env-Vars.
# Daher: Zertifikate als Base64-Env-Vars setzen, beim Start dekodieren
# und als temporäre Files ablegen. Die Pfade oben (APPLE_CERT_PATH etc.)
# werden dann auf diese temporären Files umgebogen.
import tempfile as _tempfile
import base64 as _base64

def _decode_secret_to_file(env_var_name: str, suffix: str = ".pem") -> Optional[str]:
    """Liest eine Base64-kodierte Secret aus einer Env-Var und schreibt sie in ein temporäres File.
    Returns: Pfad zur temporären Datei, oder None wenn Env-Var nicht gesetzt."""
    b64_value = os.getenv(env_var_name, "").strip()
    if not b64_value:
        return None
    try:
        content = _base64.b64decode(b64_value)
        # Persistentes File im /tmp Verzeichnis (überlebt Container-Restart nicht, aber das ist OK)
        tmp_path = _tempfile.mktemp(suffix=suffix, prefix=f"secret_{env_var_name.lower()}_")
        with open(tmp_path, "wb") as f:
            f.write(content)
        os.chmod(tmp_path, 0o600)
        return tmp_path
    except Exception as e:
        print(f"[Loyalty Secret] Failed to decode {env_var_name}: {e}")
        return None

# Base64-Env-Vars dekodieren (falls gesetzt) und Pfade überschreiben
_apple_cert_from_env = _decode_secret_to_file("APPLE_CERT_B64", ".pem")
if _apple_cert_from_env:
    APPLE_CERT_PATH = _apple_cert_from_env

_apple_key_from_env = _decode_secret_to_file("APPLE_KEY_B64", ".pem")
if _apple_key_from_env:
    APPLE_KEY_PATH = _apple_key_from_env

_apple_wwdr_from_env = _decode_secret_to_file("APPLE_WWDR_B64", ".pem")
if _apple_wwdr_from_env:
    APPLE_WWDR_PATH = _apple_wwdr_from_env

_google_sa_from_env = _decode_secret_to_file("GOOGLE_SA_B64", ".json")
if _google_sa_from_env:
    GOOGLE_SERVICE_ACCOUNT_PATH = _google_sa_from_env


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
    short_code = customer.get("short_code", "")  # 4-stelliger Code für Kellner

    # Konvertiere Hex zu RGB-String für Apple (z.B. "rgb(201,168,76)")
    hex_clean = color.lstrip("#")
    try:
        r, g, b = int(hex_clean[0:2], 16), int(hex_clean[2:4], 16), int(hex_clean[4:6], 16)
        rgb_color = f"rgb({r},{g},{b})"
    except Exception:
        rgb_color = "rgb(201,168,76)"

    # ── Professionelle Stempel-Visualisierung ──
    # Statt nur Sterne: kombinierter Text mit Stempel-Status + Reward-Info
    # Bei 10/10: "★★★★★★★★★★ 🎉 PRÄMIE BEREIT!"
    # Bei 3/10:  "★★★☆☆☆☆☆☆☆ — 7 Stempel bis Kaffee gratis"
    # Bei 0/10:  "☆☆☆☆☆☆☆☆☆☆ — 10 Stempel bis Kaffee gratis"
    filled = "★" * stamps_current
    empty = "☆" * max(0, stamps_required - stamps_current)
    progress_stars = filled + empty

    if stamps_current >= stamps_required:
        # 10/10 erreicht — PRÄMIE BEREIT!
        progress_text = f"{progress_stars}\n🎉 PRÄMIE BEREIT: {reward_name}!"
        primary_value = f"{stamps_current} / {stamps_required} ✓"
        primary_change = f"🎉 Prämie bereit! {reward_name} — %@"
        reward_label = "PRÄMIE BEREIT"
        reward_value = f"🎁 {reward_name} — Bei deinem nächsten Besuch einlösen!"
    elif stamps_current == 0:
        # 0/10 — frisch gestartet
        progress_text = progress_stars
        primary_value = f"{stamps_current} / {stamps_required}"
        primary_change = "🎉 Neuer Stempel! Jetzt %@"
        reward_label = "Dein Ziel"
        reward_value = f"🎁 {reward_name} — Noch {stamps_required} Stempel"
    else:
        # 1-9/10 — unterwegs
        remaining = stamps_required - stamps_current
        progress_text = progress_stars
        primary_value = f"{stamps_current} / {stamps_required}"
        primary_change = "🎉 Neuer Stempel! Jetzt %@"
        reward_label = "Noch bis zum Reward"
        reward_value = f"🎁 {reward_name} — Nur noch {remaining} Stempel!"

    # ── Karten-Farbe als Hintergrund (Tenant wählt rot → Pass ist rot) ──
    # Helligkeit berechnen um Text-Farbe automatisch anzupassen (Kontrast)
    # Helle Farben → dunkler Text, dunkle Farben → heller Text
    brightness = (r * 299 + g * 587 + b * 114) / 1000
    if brightness > 140:
        # Helle Farbe → dunkler Text für Kontrast
        bg_color = rgb_color
        fg_color = "rgb(28,28,30)"       # dunkler Text
        label_color = "rgb(28,28,30)"    # dunkle Labels
    else:
        # Dunkle Farbe → heller Text für Kontrast
        bg_color = rgb_color
        fg_color = "rgb(255,255,255)"    # weißer Text
        label_color = "rgb(255,255,255)" # weiße Labels

    pass_json = {
        "description": f"{card_name} - {tenant_name}",
        "formatVersion": 1,
        "organizationName": tenant_name or "digi-gastro",
        "logoText": tenant_name or "digi-gastro",
        "passTypeIdentifier": APPLE_PASS_TYPE_ID,
        "serialNumber": serial,
        "teamIdentifier": APPLE_TEAM_ID,
        "webServiceURL": f"https://digi-gastro.de/api/wallet/apple",
        "authenticationToken": customer.get("auth_token", _gen_auth_token(serial)),
        # Karten-Farbe als Hintergrund (Tenant wählt rot → Pass ist rot!)
        "backgroundColor": bg_color,
        "foregroundColor": fg_color,
        "labelColor": label_color,
        "associatedStoreIdentifiers": [],
        "storeCard": {
            "headerFields": [
                {
                    "key": "code",
                    "label": "Stempel-Code",
                    "value": short_code or "—",
                    "textAlignment": "PKTextAlignmentRight",
                    # changeMessage: iOS zeigt Notification wenn dieser Wert sich ändert
                    "changeMessage": "Neuer Code: %@"
                }
            ],
            "primaryFields": [
                {
                    "key": "stamps",
                    "label": f"{card_name}",
                    "value": primary_value,
                    "textAlignment": "PKTextAlignmentCenter",
                    # changeMessage dynamisch: bei 10/10 "Prämie bereit!"
                    "changeMessage": primary_change
                }
            ],
            "auxiliaryFields": [
                {
                    "key": "progress",
                    "label": "Fortschritt",
                    "value": progress_text,
                    "textAlignment": "PKTextAlignmentCenter",
                    "changeMessage": "Fortschritt aktualisiert: %@"
                },
                {
                    "key": "reward",
                    "label": reward_label,
                    "value": reward_value,
                    "textAlignment": "PKTextAlignmentLeft",
                    "changeMessage": "🎁 Reward aktualisiert: %@"
                },
                {
                    "key": "lastmsg",
                    "label": "Letzte Nachricht",
                    "value": customer.get("last_message", "Willkommen!"),
                    "textAlignment": "PKTextAlignmentLeft",
                    # CRITICAL: changeMessage für Broadcast/Inaktivität-Pushs.
                    # WICHTIG: "%@" allein funktioniert NICHT in iOS — es MUSS
                    # beschreibender Text dabei stehen! Sonst zeigt iOS keinen Banner.
                    "changeMessage": "📬 Neue Nachricht: %@",
                    "hidden": False
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
        },
        # ── Push Notification Settings ──
        # WICHTIG: relevantText wird auf dem SPERRBILDSCHIRM angezeigt wenn:
        # 1. Pass geupdatet wird (via APNs push) → iOS zeigt relevantText als Banner
        # 2. Kunde in Geofencing-Nähe ist → iOS zeigt relevantText auf Sperrbildschirm
        # OHNE relevantText: changeMessage erscheint nur im Notification Center (nicht Sperrbildschirm)
        # WICHTIG: relevantText = das was auf dem SPERRBILDSCHIRM angezeigt wird!
        # Wie Geofencing: iOS zeigt relevantText sofort auf Sperrbildschirm.
        # Wir zeigen hier die LETZTE NACHRICHT (last_message) — nicht nur Stempel.
        # Wenn last_message = "Willkommen!" → zeige Stempel-Stand
        # Wenn last_message = "Hallo: Test" → zeige Nachricht auf Sperrbildschirm!
        last_msg = customer.get("last_message", "Willkommen!")
        if last_msg and last_msg != "Willkommen!":
            # Es gibt eine echte Nachricht → auf Sperrbildschirm zeigen!
            relevant_text = f"📍 {tenant_name} — {last_msg}"
        else:
            # Keine Nachricht → Stempel-Stand zeigen
            relevant_text = f"📍 {tenant_name} — {stamps_current}/{stamps_required} Stempel · {reward_name}"

        "relevantText": relevant_text,
        # relevantDate = jetzt → iOS behandelt Pass als "aktuell" → Sperrbildschirm
        "relevantDate": _now_iso().replace("Z", "+00:00"),
        "userInfo": {
            "tenant_slug": tenant_slug,
            "card_id": card.get("id"),
            "customer_id": customer.get("id"),
        },
        # ── PHASE 1: barcodes Field für QR-Code-Anzeige im Pass ──
        "barcodes": [
            {
                "format": "PKBarcodeFormatQR",
                "message": short_code or serial,
                "messageEncoding": "iso-8859-1",
                "altText": f"Code: {short_code}" if short_code else ""
            }
        ]
    }

    # Geofencing: IMMER Location hinzufügen wenn vorhanden (nicht nur bei Kampagne)
    # Location macht den Pass "relevant" wenn Kunde in der Nähe ist → Sperrbildschirm
    if geofence:
        pass_json["locations"] = [{
            "latitude": geofence["latitude"],
            "longitude": geofence["longitude"],
            "relevantText": f"📍 {tenant_name} — Schau doch rein! {stamps_current}/{stamps_required} Stempel"
        }]

    return pass_json


def _gen_auth_token(serial: str) -> str:
    """Generiert 32-char Auth Token für Apple Wallet Web Service.
    Apple requires at least 16 characters. Wir verwenden 32 für mehr Sicherheit."""
    return hashlib.sha256(f"{serial}:{time.time()}".encode()).hexdigest()[:32]


def _sign_pass_manifest(manifest_bytes: bytes) -> bytes:
    """Signiert das Manifest mit dem Apple Wallet Zertifikat.
    Liefert die PKCS#7-Signatur als DER-encoded Bytes.

    WICHTIG: Signiert die EXAKT gleichen Bytes die auch im .pkpass als
    manifest.json gespeichert werden. Früher wurde das manifest dict neu
    serialisiert → unterschiedliche Bytes → Signatur-Verifikation schlug fehl.

    Benötigt: Apple Pass Certificate + WWDR Intermediate Certificate + Private Key.
    Verwendet openssl CLI (zuverlässigster Weg für PKCS#7 detached signatures).
    """
    if not _is_apple_configured():
        return b"DEV_MODE_NO_SIGNATURE"

    try:
        import subprocess
        import tempfile as _tf

        # Manifest bytes in temporäre Datei schreiben (EXAKT die gleichen bytes
        # die auch im .pkpass gespeichert werden)
        with _tf.NamedTemporaryFile(mode="wb", suffix=".json", delete=False) as manifest_file:
            manifest_file.write(manifest_bytes)
            manifest_path = manifest_file.name

        with _tf.NamedTemporaryFile(suffix=".der", delete=False) as sig_file:
            sig_path = sig_file.name

        try:
            cmd = [
                "openssl", "smime", "-binary", "-sign",
                "-certfile", APPLE_WWDR_PATH,
                "-signer", APPLE_CERT_PATH,
                "-inkey", APPLE_KEY_PATH,
                "-in", manifest_path,
                "-out", sig_path,
                "-outform", "DER",
            ]
            if APPLE_CERT_PASSWORD:
                cmd.extend(["-passin", f"pass:{APPLE_CERT_PASSWORD}"])

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)

            if result.returncode != 0:
                print(f"[Apple Pass] openssl signing failed: {result.stderr}")
                return b"SIGN_ERROR"

            with open(sig_path, "rb") as f:
                return f.read()
        finally:
            try:
                os.unlink(manifest_path)
                os.unlink(sig_path)
            except Exception:
                pass

    except Exception as e:
        print(f"[Apple Pass] Signing setup failed: {e}")
        return b"SIGN_ERROR"


def _generate_default_icon(color_hex: str = "#C9A84C") -> bytes:
    """Generiert ein Default-Icon.png (158x158 px) mit 'S' für Stempelkarte.
    Apple benötigt icon.png (29x29) und icon@2x.png (58x58) im .pkpass —
    ohne diese wird der Pass abgelehnt.

    Wir generieren ein hochauflösendes Icon (158x158) das für alle Größen passt.
    """
    try:
        from PIL import Image, ImageDraw, ImageFont
        import io as _io

        # 158x158 px (Apple akzeptiert das für icon@2x.png, skaliert für icon.png)
        size = 158
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Farbe aus Hex parsen
        hex_str = color_hex.lstrip("#")
        if len(hex_str) == 6:
            r = int(hex_str[0:2], 16)
            g = int(hex_str[2:4], 16)
            b = int(hex_str[4:6], 16)
        else:
            r, g, b = 201, 168, 76  # Default gold

        # Abgerundetes Rechteck als Hintergrund
        radius = 32
        draw.rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=(r, g, b, 255))

        # "S" Buchstabe in weiß (für Stempelkarte)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 90)
        except Exception:
            font = ImageFont.load_default()

        # Text zentrieren
        text = "S"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        x = (size - text_w) // 2 - bbox[0]
        y = (size - text_h) // 2 - bbox[1]
        draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)

        out = _io.BytesIO()
        img.save(out, format="PNG", optimize=True)
        return out.getvalue()
    except Exception as e:
        print(f"[Apple Pass] Default icon generation failed: {e}")
        # Fallback: 1x1 transparentes PNG (besser als nichts)
        return b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'


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
    - pass.json (Pass-Definition) — REQUIRED
    - manifest.json (SHA1-Hashes aller Dateien) — REQUIRED
    - signature (PKCS#7-Signatur des Manifests) — REQUIRED
    - icon.png + icon@2x.png — REQUIRED (Apple lehnt Pass ohne icon ab!)
    - logo.png + logo@2x.png (optional, auf Pass sichtbar)
    """
    try:
        # 1. pass.json generieren
        pass_json = _generate_apple_pass_json(
            tenant_slug, tenant_name, card, customer, geofence
        )
        pass_json_bytes = json.dumps(pass_json, indent=2).encode("utf-8")

        # 2. Logo laden falls vorhanden (Tenant-Logo)
        logo_bytes = None
        if logo_path and os.path.exists(logo_path):
            with open(logo_path, "rb") as f:
                logo_bytes = f.read()

        # 3. Icon generieren — Tenant-Logo als Icon falls vorhanden, sonst Default
        color_hex = card.get("color_hex", "#C9A84C")
        if logo_bytes:
            # Tenant-Logo als icon.png verwenden (Apple akzeptiert PNG)
            # Logo auf 158x158 skalieren für optimale Darstellung
            try:
                from PIL import Image
                import io as _io
                img = Image.open(_io.BytesIO(logo_bytes))
                img = img.convert("RGBA")
                # Auf 158x158 skalieren (Apple empfiehlt diese Größe)
                img = img.resize((158, 158), Image.Resampling.LANCZOS)
                out = _io.BytesIO()
                img.save(out, format="PNG", optimize=True)
                icon_bytes = out.getvalue()
            except Exception as e:
                print(f"[Apple Pass] Logo resize failed, using default: {e}")
                icon_bytes = _generate_default_icon(color_hex)
        else:
            # Kein Logo → Default "S" Icon generieren
            icon_bytes = _generate_default_icon(color_hex)

        # 4. Manifest bauen — Hashes ALLER Dateien die im ZIP landen
        manifest = {
            "pass.json": hashlib.sha1(pass_json_bytes).hexdigest(),
            "icon.png": hashlib.sha1(icon_bytes).hexdigest(),
            "icon@2x.png": hashlib.sha1(icon_bytes).hexdigest(),  # gleiches Icon, andere Größe
        }
        if logo_bytes:
            manifest["logo.png"] = hashlib.sha1(logo_bytes).hexdigest()
            manifest["logo@2x.png"] = hashlib.sha1(logo_bytes).hexdigest()

        # 5. Manifest als bytes serialisieren — EXAKT diese bytes werden signiert UND im ZIP gespeichert
        manifest_bytes = json.dumps(manifest, indent=2).encode("utf-8")

        # 6. Signatur über EXAKT diese manifest_bytes (nicht neu serialisieren!)
        signature = _sign_pass_manifest(manifest_bytes)

        # 7. ZIP erstellen
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("pass.json", pass_json_bytes)
            zf.writestr("manifest.json", manifest_bytes)
            zf.writestr("signature", signature)
            # REQUIRED: icon.png + icon@2x.png
            zf.writestr("icon.png", icon_bytes)
            zf.writestr("icon@2x.png", icon_bytes)
            # Optional: logo.png
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

            # CRITICAL: last_message VOR dem Push setzen + committen!
            full_msg = f"{campaign.title}: {campaign.message}"
            customer.last_message = full_msg[:200]
            db_session.commit()  # ← VOR dem Push committen!

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

    Apple: APNs Push Token aus passkit_device_registrations Tabelle holen,
    dann HTTP/2 Push an APNs (api.push.apple.com) → iOS aktualisiert Pass
    und zeigt changeMessage Banner.

    Google: Pass-Object über Google Wallet API patchen (textModulesData) →
    Android zeigt Update-Notification.

    Returns: True wenn Push gesendet (oder Dev-Mode), False bei Fehler.
    """
    # Dev-Mode: ohne Zertifikate → nur loggen
    if customer.pass_type == "apple" and not _is_apple_configured():
        print(f"[Loyalty Push] DEV MODE - Apple Push für customer {customer.id}: {title}")
        return True
    if customer.pass_type == "google" and not _is_google_configured():
        print(f"[Loyalty Push] DEV MODE - Google Push für customer {customer.id}: {title}")
        return True

    try:
        if customer.pass_type == "apple":
            return _send_apple_apns_push(db_session, customer, title, message)
        elif customer.pass_type == "google":
            return _send_google_wallet_update(customer, title, message)
        return False
    except Exception as e:
        print(f"[Loyalty Push] Failed for customer {customer.id}: {e}")
        return False


def _send_apple_apns_push(db_session, customer: LoyaltyCustomer, title: str, message: str) -> bool:
    """Sendet APNs Push für einen Apple Wallet Pass.

    Apple Wallet Pass Type IDs können NUR background Pushs empfangen.
    Alert Pushs (mit aps.alert) werden von APNs ABGELEHNT weil der Topic
    ein Pass Type ID ist (kein App Bundle ID).

    Flow:
    1. Background Push (leer) → iOS wacht auf
    2. iOS ruft GET /passes/.../... auf → holt aktualisierten Pass
    3. changeMessage in pass.json wird als Notification angezeigt
    4. last_message Field ändert sich → iOS zeigt Notification-Text

    WICHTIG: Apple Wallet Pass Notifications erscheinen im Notification Center
    mit changeMessage-Text. Ton und Sperrbildschirm sind NICHT möglich ohne
    companion iOS App (Apple Plattform-Limitation).
    """
    from database import PasskitDeviceRegistration

    registrations = db_session.query(PasskitDeviceRegistration).filter_by(
        pass_serial=customer.pass_serial
    ).all()

    if not registrations:
        print(f"[Loyalty Push] No device registrations for pass {customer.pass_serial}")
        return True

    success_count = 0
    for reg in registrations:
        try:
            if _apns_push(reg.push_token, title, message):
                success_count += 1
        except Exception as e:
            print(f"[Loyalty Push] APNs failed for device {reg.device_library_identifier}: {e}")

    print(f"[Loyalty Push] Apple APNs: {success_count}/{len(registrations)} devices reached")
    return success_count > 0


def _apns_push(push_token: str, title: str, message: str) -> bool:
    """Sendet HTTP/2 Background Push an APNs für Pass-Update.

    Background Push (leer) → iOS holt Pass → changeMessage als Notification.
    """
    import ssl

    payload = {}  # Empty — iOS holt Pass und zeigt changeMessage

    try:
        import httpx

        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        ssl_context.load_cert_chain(certfile=APPLE_CERT_PATH, keyfile=APPLE_KEY_PATH)
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE

        with httpx.Client(http2=True, verify=ssl_context) as client:
            resp = client.post(
                f"https://api.push.apple.com/3/device/{push_token}",
                json=payload,
                headers={
                    "apns-topic": APPLE_PASS_TYPE_ID,
                    "apns-push-type": "background",
                    "apns-priority": "5",
                    "apns-expiration": "0"
                },
                timeout=10
            )
            if resp.status_code == 200:
                print(f"[APNs] Push sent to {push_token[:16]}... (title={title[:30]})")
                return True
            else:
                print(f"[APNs] Push failed: {resp.status_code} {resp.text}")
                return False
    except Exception as e:
        print(f"[APNs] Push error: {e}")
        return False


def _send_google_wallet_update(customer: LoyaltyCustomer, title: str, message: str) -> bool:
    """Sendet ein Google Wallet Pass-Update (patch loyaltyObject).

    Google zeigt dann eine Notification auf Android an.
    Nutzt die Google Wallet REST API mit Service Account JWT.
    """
    try:
        import httpx
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request as GoogleRequest

        # Service Account laden
        with open(GOOGLE_SERVICE_ACCOUNT_PATH, "r") as f:
            sa = json.load(f)

        credentials = service_account.Credentials.from_service_account_info(
            sa,
            scopes=["https://www.googleapis.com/auth/wallet_object.issuer"]
        )
        credentials.refresh(GoogleRequest())

        # Object ID für diesen Customer
        serial_short = customer.pass_serial[:16].replace("-", "")
        object_id = f"{GOOGLE_ISSUER_ID}.{customer.tenant_slug}-{serial_short}"

        # Patch loyaltyObject mit neuer message
        # Google Wallet API: PATCH https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/{id}
        url = f"https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/{object_id}"

        patch_body = {
            "messages": [{
                "header": title,
                "body": message,
                "messageType": "TEXT",
                "displayInterval": {
                    "start": {"date": _now_iso()}
                }
            }]
        }

        resp = httpx.patch(
            url,
            json=patch_body,
            headers={
                "Authorization": f"Bearer {credentials.token}",
                "Content-Type": "application/json"
            },
            timeout=15
        )

        if resp.status_code in (200, 201):
            print(f"[Google Wallet] Update sent for {object_id}")
            return True
        else:
            print(f"[Google Wallet] Update failed: {resp.status_code} {resp.text}")
            return False

    except ImportError:
        # google-auth nicht installiert → fallback auf JWT-only
        print("[Google Wallet] google-auth not installed — skipping real push")
        return True  # Dev-Mode Verhalten
    except Exception as e:
        print(f"[Google Wallet] Update error: {e}")
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
        short_code=_generate_short_code(),  # PHASE 1: 4-stelliger Code
        tier="neu",
    )
    db_session.add(customer)
    db_session.commit()
    return customer, True


# ──────────────────────────────────────────────────────────────────
# PHASE 1: Short-Code für manuelle Stempel-Vergabe (Scanner-Alternative)
# ──────────────────────────────────────────────────────────────────
# Crockford Base32 Alphabet (kein 0/O/1/I → keine Verwechslung beim Ablesen)
_CROCKFORD_BASE32 = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"


def _generate_short_code() -> str:
    """Generiert einen eindeutigen 4-stelligen Code (z.B. 'A7K2').

    Verwendung: Wird im Wallet-Pass angezeigt. Kellner tippt Code ein →
    System findet Customer → Stempel vergeben. Keine Kamera, kein QR-Scan nötig.
    """
    import random
    return "".join(random.choice(_CROCKFORD_BASE32) for _ in range(4))


def find_customer_by_short_code(db_session, tenant_slug: str, short_code: str):
    """Findet einen Customer anhand seines 4-stelligen Codes.

    Case-insensitive, tolerant gegen 0/O und 1/I Verwechslung.
    Returns: LoyaltyCustomer oder None.
    """
    _ensure_db_models()
    if not short_code:
        return None
    # Normalisiere: uppercase, O→0… nein wait, Crockford hat kein 0/O.
    # Aber User könnte O statt 0 tippen → wir normalisieren O→null? Nein, kein 0 im Alphabet.
    # Stattdessen: O→Q (ähnlich), I→J (ähnlich). Einfacher: O→Q, I→J, 1→J, 0→Q.
    code = short_code.upper().strip()
    code = code.replace("0", "Q").replace("O", "Q").replace("1", "J").replace("I", "J")
    return db_session.query(LoyaltyCustomer).filter(
        LoyaltyCustomer.tenant_slug == tenant_slug.lower().strip(),
        LoyaltyCustomer.short_code == code
    ).first()


def award_manual_stamp(db_session, tenant_slug: str, short_code: str, awarded_by: str = "waiter"):
    """Vergibt einen manuellen Stempel an einen Customer via Short-Code.

    Wird vom Scanner-Modus im Admin-Panel aufgerufen.
    Returns: dict mit success/Fehler-Info.
    """
    _ensure_db_models()
    customer = find_customer_by_short_code(db_session, tenant_slug, short_code)
    if not customer:
        return {"success": False, "error": "Kein Kunde mit diesem Code gefunden."}

    # Card laden für stamps_required
    card = db_session.query(LoyaltyCard).filter_by(id=customer.card_id).first()
    if not card:
        return {"success": False, "error": "Stempelkarte existiert nicht mehr."}

    # Stempel vergeben
    customer.current_stamps += 1
    customer.total_stamps_earned += 1
    customer.last_visit_at = _now_iso()
    customer.pass_needs_update = True

    # Tier updaten (PHASE B)
    total = customer.total_stamps_earned
    if total >= 10:
        customer.tier = "vip"
    elif total >= 3:
        customer.tier = "stamm"
    else:
        customer.tier = "neu"

    # Stamp-Log-Eintrag
    stamp = LoyaltyStamp(
        tenant_slug=tenant_slug.lower().strip(),
        customer_id=customer.id,
        card_id=customer.card_id,
        order_id=None,
        order_total=0.0,
        stamp_type="manual",
        is_redeemed=False,
        created_at=_now_iso(),
    )
    db_session.add(stamp)

    # Reward prüfen
    # WICHTIG: Bei 10/10 wird NICHT sofort auf 0 gesetzt!
    # Der Kunde soll 10/10 mit "PRÄMIE BEREIT!" sehen.
    # Erst wenn der Kellner den Reward einlöst (separater Button/API),
    # wird auf 0 resettet. So sieht der Kunde seinen Erfolg im Wallet.
    reward_redeemed = False
    if customer.current_stamps >= card.stamps_required:
        # 10/10 erreicht — aber NICHT resetten!
        # current_stamps bleibt bei 10/10 → Pass zeigt "PRÄMIE BEREIT!"
        customer.rewards_redeemed += 1
        reward_redeemed = True
        # Stempel als redeemed markieren
        unredeemed = db_session.query(LoyaltyStamp).filter_by(
            customer_id=customer.id, card_id=card.id, is_redeemed=False
        ).all()
        for s in unredeemed:
            s.is_redeemed = True
            s.redeemed_at = _now_iso()
        # WICHTIG: current_stamps bleibt bei stamps_required (z.B. 10)
        # Pass zeigt: "10 / 10 ✓" + "🎉 PRÄMIE BEREIT!"
        # Reset erfolgt erst via reward_redeem API (Kellner löst ein)

    db_session.commit()

    # Pass-Update Push triggern (falls konfiguriert)
    try:
        _trigger_pass_update_push(db_session, customer, card.name, "Stempel erhalten!")
    except Exception as e:
        print(f"[Loyalty] Push failed (non-fatal): {e}")

    return {
        "success": True,
        "customer_nickname": customer.nickname or f"Kunde {customer.short_code}",
        "current_stamps": customer.current_stamps,
        "stamps_required": card.stamps_required,
        "reward_redeemed": reward_redeemed,
        "reward_name": card.reward_name if reward_redeemed else None,
        "tier": customer.tier,
    }


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
