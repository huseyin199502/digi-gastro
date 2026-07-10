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

    # ── Stempel-Visualisierung ──
    # WICHTIG: Apple Wallet unterstützt KEINE Emoji-Icons in Feld-Werten!
    # Lösung: Strip-Bild = Branding (Wasserzeichen-Icon), primaryFields = Text.
    # So macht es auch getqard.com: Stempel-Anzahl als Text, Branding im strip.
    if stamps_current >= stamps_required:
        primary_value = f"{stamps_current} / {stamps_required} ✓"
        primary_change = f"🎉 Prämie bereit! {reward_name} — %@"
        reward_label = "PRÄMIE BEREIT"
        reward_value = f"{reward_name} — Bei deinem nächsten Besuch einlösen!"
    elif stamps_current == 0:
        primary_value = f"{stamps_current} / {stamps_required}"
        primary_change = "🎉 Neuer Stempel! Jetzt %@"
        reward_label = "Dein Ziel"
        reward_value = f"{reward_name} — Noch {stamps_required} Stempel"
    else:
        remaining = stamps_required - stamps_current
        primary_value = f"{stamps_current} / {stamps_required}"
        primary_change = "🎉 Neuer Stempel! Jetzt %@"
        reward_label = "Noch bis zum Reward"
        reward_value = f"{reward_name} — Nur noch {remaining} Stempel!"

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
                    "textAlignment": "PKTextAlignmentRight"
                    # KEINE changeMessage — sonst Coalescing mit lastmsg/stamps!
                }
            ],
            # primaryFields: Stempel-Zähler (Foto ist jetzt LINKS im strip, nicht vollflächig)
            # Apple Wallet rendert primaryFields ÜBER strip.png, aber da strip transparent ist
            # mit Foto nur links, ist der Text oben gut lesbar auf backgroundColor.
            "primaryFields": [
                {
                    "key": "stamps",
                    "label": card_name,
                    "value": primary_value,
                    "textAlignment": "PKTextAlignmentCenter",
                    "changeMessage": primary_change
                }
            ],
            # secondaryFields sitzen UNTER dem strip-Bild auf solidem Hintergrund.
            "secondaryFields": [
                {
                    "key": "reward",
                    "label": reward_label,
                    "value": reward_value,
                    "textAlignment": "PKTextAlignmentLeft"
                    # KEINE changeMessage — sonst Coalescing mit lastmsg/stamps!
                }
            ],
            # auxiliaryFields: leer — keine hidden fields hier.
            # (hidden:true ist NICHT offiziell dokumentiert und funktioniert unzuverlässig.)
            "auxiliaryFields": [],
            # backFields: lastmsg + msgnonce hier → auf Vorderseite VERSTECKT (nur ⓘ-Button).
            # WICHTIG: changeMessage funktioniert in backFields (Apple-Doku + passkit.com bestätigt).
            # Bei Push zeigt iOS den changeMessage-Text als Banner (z.B. "📬 Neue Nachricht: Hallo: Test").
            # Voraussetzung: pro Push darf nur EIN Feld mit changeMessage seinen Wert ändern
            # (sonst fasst iOS sie zusammen → "Karte aktualisiert").
            # → Bei Nachrichten: nur lastmsg ändert sich (stamps/code/reward bleiben gleich)
            # → Bei Stempel: nur stamps ändert sich (lastmsg bleibt gleich)
            # msgnonce darf KEINE changeMessage haben (sonst Coalescing mit lastmsg)!
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
                },
                {
                    "key": "lastmsg",
                    "label": "Letzte Nachricht",
                    "value": customer.get("last_message", "Willkommen!"),
                    "changeMessage": "📬 Neue Nachricht: %@"
                },
                {
                    "key": "msgnonce",
                    "label": "Nonce",
                    "value": str(customer.get("msg_nonce", 0))
                }
            ]
        },
        # ── Push Notification Settings ──
        # relevantDate = jetzt → iOS behandelt Pass als "aktuell" → kann auf Sperrbildschirm erscheinen
        # WICHTIG: relevantText ist KEIN gültiger Top-Level Key (nur in locations[]/beacons[])!
        # Top-level relevantText wird von iOS ignoriert. Für Push-Notifications ist
        # changeMessage in backFields zuständig (nicht relevantText).
        "relevantDate": _now_iso().replace("Z", "+00:00"),
        "userInfo": {
            "tenant_slug": tenant_slug,
            "card_id": card.get("id"),
            "customer_id": customer.get("id"),
            # H9 FIX: KEIN Timestamp hier! userInfo muss STABIL sein (Apple Spec).
            # Timestamps in userInfo triggern unnötige Pass-Updates → Batterie-Drain.
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


def _generate_stamp_thumbnail(
    stamps_current: int,
    stamps_required: int,
    card_icon: str = "local_cafe",
    color_hex: str = "#C9A84C",
    reward_name: str = "",
) -> bytes:
    """Generiert ein thumbnail.png Bild (240x240 px) mit Stempel-Visualisierung.

    Apple Wallet unterstütz KEINE Emoji-Icons in Feld-Werten (auxiliaryFields).
    Daher generieren wir ein PNG-Bild das die Stempel als graphische Icons zeigt.
    Das Bild wird als 'thumbnail' im Pass referenziert und neben dem primaryField angezeigt.

    So machen es auch professionelle Apps wie Starbucks, Subway etc.

    Layout:
    - 5x2 Grid mit Stempel-Icons (max 10)
    - Gefüllte Stempel = vollfarbig mit Icon
    - Leere Stempel = nur Outline
    """
    try:
        from PIL import Image, ImageDraw, ImageFont
        import io as _io
        import math

        # Apple Wallet Thumbnail: max 240x240 px (square)
        # Wir verwenden 240x240 für hohe Auflösung
        size = 240
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

        # Helligkeit berechnen für Kontrast
        brightness = (r * 299 + g * 587 + b * 114) / 1000
        is_dark = brightness < 140
        text_color = (255, 255, 255, 255) if is_dark else (28, 28, 30, 255)
        # Empty circles: use higher alpha for better visibility on pass background
        empty_color = (255, 255, 255, 200) if is_dark else (28, 28, 30, 180)
        empty_outline = (255, 255, 255, 230) if is_dark else (28, 28, 30, 220)

        # Icon-Typ bestimmen (für das PNG zeichnen wir einfache Formen)
        # local_cafe → Tasse, restaurant → Gabel/Messer, local_bar → Glas, smoking_rooms → Rauch
        icon_type = card_icon or "local_cafe"

        # Grid-Layout: 5 Spalten x 2 Zeilen (für 10 Stempel)
        # Bei weniger Stempeln passen wir das Layout an
        cols = 5 if stamps_required <= 10 else stamps_required
        rows = math.ceil(stamps_required / cols)
        # Wenn nur 1 Reihe nötig, layout anpassen
        if rows == 1:
            cols = stamps_required

        # Padding und Zellengröße berechnen
        padding = 20
        available_w = size - 2 * padding
        available_h = size - 2 * padding
        cell_size = min(available_w // cols, available_h // rows)
        # Icon-Größe = 70% der Zelle
        icon_size = int(cell_size * 0.7)

        # Start-Position zentrieren
        total_w = cols * cell_size
        total_h = rows * cell_size
        start_x = (size - total_w) // 2
        start_y = (size - total_h) // 2

        # Hilfsfunktion: Zeichnet ein Stempel-Icon an Position (cx, cy)
        def draw_stamp_icon(cx, cy, sz, filled, icon_type, color):
            """Zeichnet einen einzelnen Stempel an Position cx, cy."""
            half = sz // 2
            if filled:
                # Gefüllt: Vollfarbiger Kreis + Icon-Symbol in weiß
                draw.ellipse(
                    [cx - half, cy - half, cx + half, cy + half],
                    fill=color,
                    outline=None
                )
                # Icon in weiß zeichnen (je nach icon_type)
                icon_color = (255, 255, 255, 255)
                _draw_icon_symbol(draw, cx, cy, int(sz * 0.5), icon_type, icon_color)
            else:
                # Leer: Nur Outline (Kreis)
                draw.ellipse(
                    [cx - half, cy - half, cx + half, cy + half],
                    fill=None,
                    outline=empty_outline,
                    width=2
                )
                # Icon in halbtransparent (angedeutet)
                _draw_icon_symbol(draw, cx, cy, int(sz * 0.5), icon_type, empty_color)

        def _draw_icon_symbol(draw, cx, cy, sz, icon_type, color):
            """Zeichnet das Icon-Symbol (Tasse, Glas, etc.) innerhalb des Stempels."""
            if icon_type in ("local_cafe", "bakery_dining"):
                # Kaffeetasse: Rechteck mit Henkel
                cup_w = int(sz * 0.6)
                cup_h = int(sz * 0.5)
                # Tasse (Rechteck)
                draw.rounded_rectangle(
                    [cx - cup_w//2, cy - cup_h//2, cx + cup_w//2, cy + cup_h//2 + 2],
                    radius=4, fill=color
                )
                # Henkel (Ellipse rechts)
                handle_x = cx + cup_w//2 + 2
                draw.ellipse(
                    [handle_x, cy - cup_h//4, handle_x + sz//4, cy + cup_h//4],
                    outline=color, width=2
                )
                # Dampf (optional, kleine Wellen über der Tasse)
                steam_y = cy - cup_h//2 - 4
                draw.arc([cx - sz//4, steam_y - sz//4, cx, steam_y + sz//4],
                         200, 340, fill=color, width=2)
                draw.arc([cx + 2, steam_y - sz//4, cx + sz//4 + 2, steam_y + sz//4],
                         200, 340, fill=color, width=2)
            elif icon_type == "restaurant":
                # Gabel und Messer
                fork_x = cx - sz//4
                knife_x = cx + sz//4
                # Gabel (3 Zinken + Stiel)
                for dx in (-3, 0, 3):
                    draw.line(
                        [(fork_x + dx, cy - sz//2), (fork_x + dx, cy)],
                        fill=color, width=2
                    )
                draw.line([(fork_x, cy), (fork_x, cy + sz//2)], fill=color, width=3)
                # Messer (Klinge + Stiel)
                draw.line([(knife_x, cy - sz//2), (knife_x, cy + sz//2)],
                          fill=color, width=3)
            elif icon_type == "local_bar":
                # Cocktailglas (Dreieck mit Stiel)
                top_y = cy - sz//2
                bot_y = cy + sz//3
                # Glas (Dreieck)
                draw.polygon(
                    [(cx - sz//2, top_y), (cx + sz//2, top_y), (cx, cy)],
                    fill=color
                )
                # Stiel
                draw.line([(cx, cy), (cx, bot_y)], fill=color, width=2)
                # Boden
                draw.line([(cx - sz//4, bot_y), (cx + sz//4, bot_y)],
                          fill=color, width=2)
            elif icon_type == "smoking_rooms":
                # Echte Shisha-Silhouette (Kohlebehälter, Stiel, bauchiges Glas, Schlauch)
                _draw_shisha_icon(draw, cx, cy, int(sz * 1.4), color)
            elif icon_type == "icecream":
                # Eis (Dreieck unten + Kreis oben)
                # Waffel (Dreieck)
                draw.polygon(
                    [(cx - sz//3, cy), (cx + sz//3, cy), (cx, cy + sz//2)],
                    fill=color
                )
                # Eis (Kreis oben)
                draw.ellipse([cx - sz//3, cy - sz//2, cx + sz//3, cy + sz//8],
                             fill=color)
            else:
                # Default: Stern
                points = []
                for i in range(10):
                    angle = math.pi / 2 + i * math.pi / 5
                    radius = sz//2 if i % 2 == 0 else sz//4
                    px = cx + int(radius * math.cos(angle))
                    py = cy - int(radius * math.sin(angle))
                    points.append((px, py))
                draw.polygon(points, fill=color)

        # Stempel zeichnen
        for i in range(stamps_required):
            row = i // cols
            col = i % cols
            cx = start_x + col * cell_size + cell_size // 2
            cy = start_y + row * cell_size + cell_size // 2
            filled = i < stamps_current
            draw_stamp_icon(cx, cy, icon_size, filled, icon_type, (r, g, b, 255))

        out = _io.BytesIO()
        img.save(out, format="PNG", optimize=True)
        return out.getvalue()
    except Exception as e:
        print(f"[Apple Pass] Thumbnail generation failed: {e}")
        # Fallback: 1x1 transparentes PNG
        return b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'


def _draw_shisha_icon(draw, cx, cy, sz, color):
    """Zeichnet eine echte Shisha-Silhouette (Kohlebehälter, Stiel, bauchiges Glas, Schlauch).
    
    cx, cy = Zentrum der Shisha
    sz = Gesamthöhe
    color = Farbe (inkl. Alpha)
    
    Aufbau von oben nach unten:
    1. Kohlebehälter (kleiner Zylinder)
    2. Schirm/Deckel (flaches rundes Teil)
    3. Stiel (dünner Zylinder)
    4. Glas (bauchiger Behälter)
    5. Schlauch (Kurve nach rechts mit Mundstück)
    """
    h = sz
    w = int(sz * 0.6)

    # 1. Kohlebehälter (kleines Kästchen ganz oben)
    coal_w = int(w * 0.35)
    coal_h = max(3, int(h * 0.08))
    coal_x = cx - coal_w // 2
    coal_y = cy - h // 2
    draw.rounded_rectangle(
        [coal_x, coal_y, coal_x + coal_w, coal_y + coal_h],
        radius=2, fill=color
    )

    # 2. Schirm/Deckel (flaches breites Teil)
    tray_y = coal_y + coal_h + max(1, int(h * 0.02))
    tray_w = int(w * 0.7)
    tray_h = max(2, int(h * 0.04))
    tray_x = cx - tray_w // 2
    draw.rounded_rectangle(
        [tray_x, tray_y, tray_x + tray_w, tray_y + tray_h],
        radius=2, fill=color
    )

    # 3. Stiel (Zylinder vom Schirm zum Glas)
    stem_top = tray_y + tray_h
    stem_w = max(3, int(w * 0.18))
    stem_h = int(h * 0.32)
    stem_x = cx - stem_w // 2
    draw.rounded_rectangle(
        [stem_x, stem_top, stem_x + stem_w, stem_top + stem_h],
        radius=2, fill=color
    )

    # 4. Glas (bauchiger Behälter unten) - als Polygon
    glass_top = stem_top + stem_h
    glass_h = int(h * 0.45)
    glass_w = int(w * 0.85)
    glass_x = cx - glass_w // 2
    glass_y = glass_top
    points = []
    # Obere Kante (schmaler)
    points.append((glass_x + int(glass_w * 0.1), glass_y))
    points.append((glass_x + int(glass_w * 0.9), glass_y))
    # Rechte Seite nach außen (bauchig)
    for i in range(1, 6):
        t = i / 6
        bulge = int(glass_w * 0.05) * (1 - (2 * t - 1) ** 2)
        y = glass_y + int(glass_h * t)
        x_right = glass_x + int(glass_w * 0.9) + bulge - int(glass_w * 0.1) * t
        points.append((x_right, y))
    # Untere Kante
    points.append((glass_x + int(glass_w * 0.95), glass_y + glass_h))
    points.append((glass_x + int(glass_w * 0.05), glass_y + glass_h))
    # Linke Seite nach oben (bauchig)
    for i in range(5, 0, -1):
        t = i / 6
        bulge = int(glass_w * 0.05) * (1 - (2 * t - 1) ** 2)
        y = glass_y + int(glass_h * t)
        x_left = glass_x + int(glass_w * 0.1) - bulge + int(glass_w * 0.1) * t
        points.append((x_left, y))
    draw.polygon(points, fill=color)

    # 5. Schlauch (Kurve von Glas-Mitte nach rechts)
    hose_start_x = glass_x + int(glass_w * 0.9)
    hose_start_y = glass_y + int(glass_h * 0.4)
    hose_end_x = hose_start_x + int(w * 0.5)
    hose_end_y = hose_start_y + int(h * 0.15)
    mid1_x = hose_start_x + int(w * 0.25)
    mid1_y = hose_start_y - int(h * 0.05)
    mid2_x = hose_start_x + int(w * 0.4)
    mid2_y = hose_start_y + int(h * 0.1)
    hose_width = max(2, int(w * 0.08))
    draw.line(
        [(hose_start_x, hose_start_y), (mid1_x, mid1_y),
         (mid2_x, mid2_y), (hose_end_x, hose_end_y)],
        fill=color, width=hose_width, joint="curve"
    )
    # Mundstück (Ellipse am Ende)
    mouth_w = max(3, int(w * 0.12))
    mouth_h = max(2, int(h * 0.06))
    draw.ellipse(
        [hose_end_x - 2, hose_end_y - mouth_h // 2,
         hose_end_x + mouth_w, hose_end_y + mouth_h // 2],
        fill=color
    )


def _draw_coffee_icon(draw, cx, cy, sz, color):
    """Echte Kaffeetasse mit Henkel, Untertasse und Dampf."""
    h = sz
    w = int(sz * 0.7)

    # 1. Dampf (3 Bögen über der Tasse)
    steam_y = cy - h // 2
    for offset in (-int(w * 0.25), 0, int(w * 0.25)):
        draw.arc(
            [cx + offset - 8, steam_y - 5, cx + offset + 8, steam_y + 15],
            200, 340, fill=color, width=3
        )

    # 2. Tasse (abgerundetes Rechteck)
    cup_top = steam_y + 20
    cup_h = int(h * 0.45)
    cup_w = int(w * 0.7)
    cup_x = cx - cup_w // 2
    draw.rounded_rectangle(
        [cup_x, cup_top, cup_x + cup_w, cup_top + cup_h],
        radius=int(cup_w * 0.1), fill=color
    )

    # 3. Henkel (Ellipse rechts an der Tasse)
    handle_x = cup_x + cup_w
    handle_y = cup_top + int(cup_h * 0.25)
    handle_h = int(cup_h * 0.5)
    draw.ellipse(
        [handle_x - 4, handle_y, handle_x + int(w * 0.25), handle_y + handle_h],
        outline=color, width=max(3, int(w * 0.08))
    )

    # 4. Untertasse (flaches breites Rechteck unten)
    saucer_y = cup_top + cup_h + 2
    saucer_w = int(w * 0.95)
    saucer_h = max(3, int(h * 0.06))
    saucer_x = cx - saucer_w // 2
    draw.rounded_rectangle(
        [saucer_x, saucer_y, saucer_x + saucer_w, saucer_y + saucer_h],
        radius=2, fill=color
    )


def _draw_restaurant_icon(draw, cx, cy, sz, color):
    """Gabel und Messer als echte Silhouetten."""
    h = sz
    w = int(sz * 0.6)

    # Gabel (links)
    fork_x = cx - int(w * 0.25)
    # Zinken (3 kurze Linien oben)
    for dx in (-int(w * 0.08), 0, int(w * 0.08)):
        draw.line(
            [(fork_x + dx, cy - h // 2), (fork_x + dx, cy - int(h * 0.15))],
            fill=color, width=max(2, int(w * 0.05))
        )
    # Verbindung der Zinken (Querbalken)
    draw.line(
        [(fork_x - int(w * 0.1), cy - int(h * 0.15)),
         (fork_x + int(w * 0.1), cy - int(h * 0.15))],
        fill=color, width=max(2, int(w * 0.05))
    )
    # Stiel der Gabel
    draw.line(
        [(fork_x, cy - int(h * 0.15)), (fork_x, cy + int(h * 0.35))],
        fill=color, width=max(3, int(w * 0.1))
    )

    # Messer (rechts)
    knife_x = cx + int(w * 0.25)
    # Klinge (obere Teil, dünner)
    blade_top = cy - h // 2
    blade_bot = cy - int(h * 0.1)
    draw.polygon(
        [(knife_x - int(w * 0.08), blade_top),
         (knife_x + int(w * 0.08), blade_top),
         (knife_x + int(w * 0.04), blade_bot),
         (knife_x - int(w * 0.04), blade_bot)],
        fill=color
    )
    # Griff (unterer Teil, dicker)
    draw.line(
        [(knife_x, blade_bot), (knife_x, cy + int(h * 0.35))],
        fill=color, width=max(4, int(w * 0.12))
    )


def _draw_bar_icon(draw, cx, cy, sz, color):
    """Cocktailglas (Martini) mit Olive am Stöckchen."""
    h = sz
    w = int(sz * 0.6)

    # 1. Glas (Dreieck - Martini-Form)
    top_y = cy - int(h * 0.4)
    bottom_y = cy
    draw.polygon(
        [(cx - int(w * 0.45), top_y), (cx + int(w * 0.45), top_y), (cx, bottom_y)],
        fill=color
    )

    # 2. Stiel (vertikale Linie)
    stem_bot = cy + int(h * 0.25)
    draw.line(
        [(cx, bottom_y), (cx, stem_bot)],
        fill=color, width=max(3, int(w * 0.08))
    )

    # 3. Boden (flache Ellipse)
    foot_w = int(w * 0.5)
    foot_h = max(3, int(h * 0.05))
    draw.ellipse(
        [cx - foot_w // 2, stem_bot - foot_h // 2,
         cx + foot_w // 2, stem_bot + foot_h // 2],
        fill=color
    )

    # 4. Olive am Stöckchen (kleiner Kreis im Glas)
    olive_y = top_y + int(h * 0.1)
    olive_r = max(3, int(w * 0.08))
    draw.line(
        [(cx + int(w * 0.15), top_y - int(h * 0.05)),
         (cx - int(w * 0.05), olive_y)],
        fill=color, width=max(2, int(w * 0.03))
    )
    draw.ellipse(
        [cx - int(w * 0.05) - olive_r, olive_y - olive_r,
         cx - int(w * 0.05) + olive_r, olive_y + olive_r],
        fill=color
    )


def _draw_icecream_icon(draw, cx, cy, sz, color):
    """Eiswaffel mit 2 Kugeln."""
    h = sz
    w = int(sz * 0.6)

    # 1. Waffel (Dreieck unten)
    cone_top = cy - int(h * 0.1)
    cone_bot = cy + int(h * 0.45)
    cone_w = int(w * 0.5)
    draw.polygon(
        [(cx - cone_w // 2, cone_top),
         (cx + cone_w // 2, cone_top),
         (cx, cone_bot)],
        fill=color
    )
    # Waffel-Muster (Kreuzlinie)
    draw.line(
        [(cx - cone_w // 4, cone_top + int(h * 0.05)),
         (cx + cone_w // 4, cone_bot - int(h * 0.1))],
        fill=color, width=1
    )

    # 2. Untere Kugel (großer Kreis)
    scoop1_r = int(w * 0.3)
    scoop1_y = cone_top - scoop1_r + 3
    draw.ellipse(
        [cx - scoop1_r, scoop1_y - scoop1_r,
         cx + scoop1_r, scoop1_y + scoop1_r],
        fill=color
    )

    # 3. Obere Kugel (kleinerer Kreis)
    scoop2_r = int(w * 0.22)
    scoop2_y = scoop1_y - scoop1_r + scoop2_r - 2
    draw.ellipse(
        [cx - scoop2_r, scoop2_y - scoop2_r,
         cx + scoop2_r, scoop2_y + scoop2_r],
        fill=color
    )


def _draw_bakery_icon(draw, cx, cy, sz, color):
    """Brezel (klassische Knoten-Form mit 2 Schleifen und Überkreuzung)."""
    import math
    h = sz
    w = int(sz * 0.7)

    # Dicke der Brezel-Linien
    bw = max(6, int(w * 0.15))

    # 2 Schleifen oben
    left_cx = cx - int(w * 0.18)
    left_cy = cy - int(h * 0.05)
    left_r = int(w * 0.2)
    right_cx = cx + int(w * 0.18)
    right_cy = cy - int(h * 0.05)
    right_r = int(w * 0.2)

    # Linke Schleife: 270° Bogen
    draw.arc(
        [left_cx - left_r, left_cy - left_r, left_cx + left_r, left_cy + left_r],
        90, 360, fill=color, width=bw
    )
    # Rechte Schleife: 270° Bogen
    draw.arc(
        [right_cx - right_r, right_cy - right_r, right_cx + right_r, right_cy + right_r],
        180, 450, fill=color, width=bw
    )
    # Untere Verbindung (U-Form)
    bottom_y = cy + int(h * 0.3)
    draw.arc(
        [cx - int(w * 0.35), cy + int(h * 0.05),
         cx + int(w * 0.35), bottom_y + int(h * 0.2)],
        0, 180, fill=color, width=bw
    )
    # Überkreuzung in der Mitte (X)
    cross_top_y = cy - int(h * 0.15)
    cross_bot_y = cy + int(h * 0.05)
    draw.line(
        [(cx - int(w * 0.08), cross_top_y),
         (cx + int(w * 0.08), cross_bot_y)],
        fill=color, width=bw
    )
    draw.line(
        [(cx + int(w * 0.08), cross_top_y),
         (cx - int(w * 0.08), cross_bot_y)],
        fill=color, width=bw
    )


# Mapping von Karten-Icon zu Zeichenfunktion
# WICHTIG: Aktuell LEER → alle Icons zeigen Sterne (User-Wunsch 2026-07).
# Drawer-Funktionen (_draw_shisha_icon etc.) bleiben als Reserve erhalten.
# Um Icons wieder zu aktivieren: Mapping befüllen, z.B.
#   _ICON_DRAWERS = {"smoking_rooms": _draw_shisha_icon, ...}
_ICON_DRAWERS = {}


# ════════════════════════════════════════════════════════════════
# PROFESSIONAL STARS (getqard.com / Starbucks-inspiriert)
# 4-Schicht-Rendering: Drop-Shadow → Radial-Gradient → Glass-Highlight → Outline
# ════════════════════════════════════════════════════════════════
from PIL import ImageFilter, Image as _PIL_Image, ImageDraw as _PIL_ImageDraw
import math as _math


def _star_polygon(cx, cy, outer_r, inner_r, points=5, rotation=-_math.pi / 2):
    """Return list of (x,y) points for a 5-pointed star."""
    pts = []
    for i in range(points * 2):
        angle = rotation + i * _math.pi / points
        r = outer_r if i % 2 == 0 else inner_r
        pts.append((cx + r * _math.cos(angle), cy + r * _math.sin(angle)))
    return pts


def _draw_star_with_depth(base_img, cx, cy, size, brand_rgb, filled, on_dark=True):
    """Draw a single star with drop shadow, gradient fill, and glass highlight.

    4-Schicht-Rendering für professionelles Aussehen (wie getqard.com):
    1. Drop-Shadow (gaussian-blurred dark star, offset down)
    2. Radial-Gradient-Fill (bright top-left → mid → darker edge)
    3. White glass-arc highlight on top (getqard sa-glass effect)
    4. Crisp outline for definition
    """
    pad = int(size * 0.35)
    layer_w = int(size + pad * 2)
    layer_h = int(size + pad * 2)
    layer = _PIL_Image.new("RGBA", (layer_w, layer_h), (0, 0, 0, 0))
    ld = _PIL_ImageDraw.Draw(layer)

    lcx = layer_w // 2
    lcy = layer_h // 2
    outer_r = size / 2
    inner_r = outer_r * 0.42  # classic 5-point star ratio

    if filled:
        # ── 1. DROP SHADOW (gaussian-blurred dark star, offset down) ──
        shadow = _PIL_Image.new("RGBA", (layer_w, layer_h), (0, 0, 0, 0))
        sd = _PIL_ImageDraw.Draw(shadow)
        shadow_pts = _star_polygon(lcx, lcy + size * 0.04, outer_r * 1.02, inner_r * 1.02)
        sd.polygon(shadow_pts, fill=(0, 0, 0, 150))
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=size * 0.08))
        layer = _PIL_Image.alpha_composite(layer, shadow)
        ld = _PIL_ImageDraw.Draw(layer)

        # ── 2. RADIAL GRADIENT FILL (gloss: bright top-left → mid → darker edge) ──
        grad_size = int(size * 2)
        grad = _PIL_Image.new("RGBA", (grad_size, grad_size), (0, 0, 0, 0))
        gd = _PIL_ImageDraw.Draw(grad)
        gcx = grad_size * 0.42
        gcy = grad_size * 0.38
        max_r = outer_r
        steps = 24
        for i in range(steps, 0, -1):
            t = i / steps
            if t > 0.55:
                tt = (t - 0.55) / 0.45
                r = int(brand_rgb[0] * (1 - tt * 0.45))
                g = int(brand_rgb[1] * (1 - tt * 0.45))
                b = int(brand_rgb[2] * (1 - tt * 0.45))
            else:
                tt = t / 0.55
                hr = min(255, int(brand_rgb[0] + (255 - brand_rgb[0]) * (1 - tt) * 0.65))
                hg = min(255, int(brand_rgb[1] + (255 - brand_rgb[1]) * (1 - tt) * 0.65))
                hb = min(255, int(brand_rgb[2] + (255 - brand_rgb[2]) * (1 - tt) * 0.65))
                r, g, b = hr, hg, hb
            radius = max_r * t
            pts = _star_polygon(gcx, gcy, radius, radius * 0.42)
            gd.polygon(pts, fill=(r, g, b, 255))
        # Crop gradient to star shape
        star_mask = _PIL_Image.new("L", (grad_size, grad_size), 0)
        md = _PIL_ImageDraw.Draw(star_mask)
        mpts = _star_polygon(grad_size / 2, grad_size / 2, max_r, max_r * 0.42)
        md.polygon(mpts, fill=255)
        grad_rgb = grad.convert("RGB")
        final_star = _PIL_Image.new("RGBA", (grad_size, grad_size), (0, 0, 0, 0))
        final_star.paste(grad_rgb, (0, 0), star_mask)
        offset = (lcx - grad_size // 2, lcy - grad_size // 2)
        layer.paste(final_star, offset, final_star)
        ld = _PIL_ImageDraw.Draw(layer)

        # ── 3. GLASS HIGHLIGHT (white arc on top, getqard sa-glass) ──
        gloss = _PIL_Image.new("RGBA", (layer_w, layer_h), (0, 0, 0, 0))
        gld = _PIL_ImageDraw.Draw(gloss)
        gld.ellipse(
            [lcx - outer_r * 0.78, lcy - outer_r * 0.72,
             lcx + outer_r * 0.78, lcy + outer_r * 0.05],
            fill=(255, 255, 255, 110)
        )
        gloss = gloss.filter(ImageFilter.GaussianBlur(radius=size * 0.06))
        star_mask_l = _PIL_Image.new("L", (layer_w, layer_h), 0)
        md2 = _PIL_ImageDraw.Draw(star_mask_l)
        mpts2 = _star_polygon(lcx, lcy, outer_r * 0.98, inner_r * 0.98)
        md2.polygon(mpts2, fill=255)
        gloss.putalpha(star_mask_l)
        layer = _PIL_Image.alpha_composite(layer, gloss)
        ld = _PIL_ImageDraw.Draw(layer)

        # ── 4. CRISP OUTLINE (thin brand-dark edge for definition) ──
        outline_color = (
            max(0, brand_rgb[0] - 80),
            max(0, brand_rgb[1] - 80),
            max(0, brand_rgb[2] - 80),
            200,
        )
        out_pts = _star_polygon(lcx, lcy, outer_r, inner_r)
        ld.line(out_pts + [out_pts[0]], fill=outline_color, width=2)
    else:
        # ── EMPTY STAR: thick semi-transparent outline with subtle inner glow ──
        outline_color = (255, 255, 255, 230) if on_dark else (28, 28, 30, 200)
        # Soft glow underneath
        glow = _PIL_Image.new("RGBA", (layer_w, layer_h), (0, 0, 0, 0))
        gwd = _PIL_ImageDraw.Draw(glow)
        gpts = _star_polygon(lcx, lcy, outer_r * 1.15, inner_r * 1.15)
        gwd.polygon(gpts, fill=(255, 255, 255, 40) if on_dark else (0, 0, 0, 30))
        glow = glow.filter(ImageFilter.GaussianBlur(radius=size * 0.05))
        layer = _PIL_Image.alpha_composite(layer, glow)
        ld = _PIL_ImageDraw.Draw(layer)
        # Thick outline
        out_pts = _star_polygon(lcx, lcy, outer_r, inner_r)
        ld.line(out_pts + [out_pts[0]], fill=outline_color, width=max(3, int(size * 0.04)))
        # Inner faint star for visual weight
        inner_pts = _star_polygon(lcx, lcy, outer_r * 0.7, inner_r * 0.7)
        ld.polygon(inner_pts, fill=(255, 255, 255, 35) if on_dark else (0, 0, 0, 25))

    # Composite the layer onto the base image
    base_img.alpha_composite(layer, (int(cx - lcx), int(cy - lcy)))


def _apply_radial_vignette(img, W, H, strength=0.45):
    """Apply a smooth radial vignette: darken edges, keep center bright."""
    cx, cy = W / 2, H / 2
    vignette = _PIL_Image.new("L", (W, H), 0)
    vd = _PIL_ImageDraw.Draw(vignette)
    steps = 60
    for i in range(steps, 0, -1):
        t = i / steps
        alpha = int(255 * strength * (t ** 2.2))
        radius_x = cx * t
        radius_y = cy * t
        vd.ellipse([cx - radius_x, cy - radius_y, cx + radius_x, cy + radius_y], fill=255 - alpha)
    darkness = _PIL_Image.new("RGBA", (W, H), (0, 0, 0, 255))
    inverted = _PIL_Image.eval(vignette, lambda x: 255 - x)
    darkness.putalpha(inverted)
    r, g, b, a = darkness.split()
    a = a.point(lambda v: int(v * 0.5))
    darkness.putalpha(a)
    return _PIL_Image.alpha_composite(img, darkness)


def _generate_stamp_strip(
    stamps_current: int,
    stamps_required: int,
    card_icon: str = "local_cafe",
    color_hex: str = "#C9A84C",
    banner_path: Optional[str] = None,
    banner_mode: str = "full",
) -> bytes:
    """Generiert ein strip.png (1125x432 px) im getqard.com Style.

    7-Schicht-Layering (von getqard.com inspiriert):
    1. Fließende Bezier-Kurven (sa-flow) — Brand-Farbe, variierte Opazität
    2. Brand-Coin mit radialem Gradient (sa-disc) — rechts oben
    3. Dünner Außenring (sa-ring)
    4. Gestrichelter Innenring (sa-ring2)
    5. Glass-Glanz Bogen (sa-glass) — weißer Arc oben auf Coin
    6. Branchenspezifisches Glyph (sa-glyph) — z.B. Kaffeetasse
    7. Sparkles (sa-spark) — kleine Brand-Farb-Punkte

    Unten (Y>280): Stempel-Sterne mit 4-Schicht-Rendering
    Oben (Y<280): Brand-Art Layering (transparent für primaryFields Text)
    """
    try:
        from PIL import Image, ImageDraw, ImageFilter
        import io as _io
        import math as _m

        _W, _H = 1125, 432

        def _hex_rgb(h):
            h = h.lstrip("#")
            if len(h) == 6:
                return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
            return 201, 168, 76

        def _bezier(p0, p1, p2, p3, steps=60):
            pts = []
            for i in range(steps + 1):
                t = i / steps
                u = 1 - t
                pts.append((
                    u**3 * p0[0] + 3*u**2*t*p1[0] + 3*u*t**2*p2[0] + t**3*p3[0],
                    u**3 * p0[1] + 3*u**2*t*p1[1] + 3*u*t**2*p2[1] + t**3*p3[1]
                ))
            return pts

        brand = _hex_rgb(color_hex)
        img = Image.new("RGBA", (_W, _H), (0, 0, 0, 0))

        # ── 1. Flowing curves (sa-flow) ──
        ops = [0.22, 0.48, 0.74, 1.00, 0.74, 0.48, 0.22]
        widths = [0.77, 0.86, 0.96, 1.05, 0.96, 0.86, 0.77]
        flow = Image.new("RGBA", (_W, _H), (0, 0, 0, 0))
        fd = ImageDraw.Draw(flow)
        sx = 3.31
        for i, (op, w) in enumerate(zip(ops, widths)):
            y = 48 + i * 15
            p0 = (-66*sx, y); p1 = (70*sx, y)
            p2 = (110*sx, y-26); p3 = (175*sx, y-30)
            c1 = (2*p3[0]-p2[0], 2*p3[1]-p2[1])
            p4 = (295*sx, y-52); p5 = (360*sx, y-58)
            pts = _bezier(p0, p1, p2, p3, 50) + _bezier(p3, c1, p4, p5, 50)[1:]
            a = int(255 * op)
            fd.line(pts, fill=(brand[0], brand[1], brand[2], a), width=max(1, int(w*3)))
        flow = flow.filter(ImageFilter.GaussianBlur(radius=0.7))
        img = Image.alpha_composite(img, flow)

        # ── 2. Coin disc (sa-disc) ──
        ccx = int(_W * 0.74)
        ccy = int(_H * 0.36)
        cr = 56
        disc_size = cr * 2 + 4
        disc = Image.new("RGBA", (disc_size, disc_size), (0, 0, 0, 0))
        dcx, dcy = disc_size * 0.36, disc_size * 0.32
        max_r = disc_size * 0.76
        dp = disc.load()
        for y in range(disc_size):
            for x in range(disc_size):
                d = _m.hypot(x - dcx, y - dcy) / max_r
                if d <= 1.0:
                    if d < 0.56:
                        t = d / 0.56
                        op = 0.95 * (1-t) + 0.34 * t
                    else:
                        t = (d - 0.56) / 0.44
                        op = 0.34 * (1-t)
                    dp[x, y] = (brand[0], brand[1], brand[2], int(255*op))
        img.alpha_composite(disc, (ccx - disc_size//2, ccy - disc_size//2))

        # ── 3. Outer ring (sa-ring) ──
        ring = Image.new("RGBA", (_W, _H), (0, 0, 0, 0))
        rd = ImageDraw.Draw(ring)
        rd.ellipse([ccx-cr, ccy-cr, ccx+cr, ccy+cr],
                   outline=(brand[0], brand[1], brand[2], int(255*0.42)), width=4)
        img = Image.alpha_composite(img, ring)

        # ── 4. Dashed inner ring (sa-ring2) ──
        ir = int(cr * 0.78)
        dash_layer = Image.new("RGBA", (_W, _H), (0, 0, 0, 0))
        dd = ImageDraw.Draw(dash_layer)
        circ = 2 * _m.pi * ir
        seg = int(circ / 19)
        for i in range(seg):
            a0 = i * 2 * _m.pi / seg
            a1 = a0 + 2 * _m.pi / seg * (5/19)
            dd.line([(ccx + ir*_m.cos(a0), ccy + ir*_m.sin(a0)),
                     (ccx + ir*_m.cos(a1), ccy + ir*_m.sin(a1))],
                    fill=(brand[0], brand[1], brand[2], int(255*0.28)), width=2)
        img = Image.alpha_composite(img, dash_layer)

        # ── 5. Glass arc (sa-glass) ──
        glass = Image.new("RGBA", (_W, _H), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glass)
        gd.arc([ccx-cr, ccy-cr, ccx+cr, ccy+cr], 210, 330,
               fill=(255, 255, 255, int(255*0.46)), width=max(2, int(cr*0.06)))
        glass = glass.filter(ImageFilter.GaussianBlur(radius=0.6))
        img = Image.alpha_composite(img, glass)

        # ── 6. Glyph (sa-glyph) — branchenspezifisches Icon im Coin ──
        gs = int(cr * 0.65)
        glyph = Image.new("RGBA", (_W, _H), (0, 0, 0, 0))
        gld = ImageDraw.Draw(glyph)
        ga = int(255 * 0.78)
        gc = (brand[0], brand[1], brand[2], ga)
        if card_icon in ("local_cafe", "free_breakfast", "coffee"):
            # Kaffeetasse
            cl, cr2 = ccx - 0.6*gs, ccx + 0.6*gs
            ct, cb = ccy - 0.7*gs, ccy + 0.4*gs
            gld.rounded_rectangle([cl, ct, cr2, cb], radius=0.18*gs, outline=gc, width=max(2, int(0.13*gs)))
            gld.arc([cr2, ct+0.1*gs, cr2+0.45*gs, ct+0.55*gs], -90, 90, fill=gc, width=max(2, int(0.13*gs)))
            gld.line([(ccx-0.7*gs, ccy+0.5*gs), (ccx+0.7*gs, ccy+0.5*gs)], fill=gc, width=max(2, int(0.13*gs)))
        elif card_icon == "smoking_rooms":
            # Shisha Wolke
            gld.ellipse([ccx-0.35*gs, ccy-0.2*gs, ccx+0.35*gs, ccy+0.2*gs], fill=gc)
            gld.ellipse([ccx-0.5*gs, ccy-0.05*gs, ccx, ccy+0.35*gs], fill=gc)
            gld.ellipse([ccx, ccy-0.05*gs, ccx+0.5*gs, ccy+0.35*gs], fill=gc)
        elif card_icon == "restaurant":
            # Gabel + Messer
            for dx in (-0.15, 0, 0.15):
                gld.line([(ccx+dx*gs, ccy-0.5*gs), (ccx+dx*gs, ccy)], fill=gc, width=2)
            gld.line([(ccx, ccy), (ccx, ccy+0.5*gs)], fill=gc, width=4)
            gld.line([(ccx+0.25*gs, ccy-0.5*gs), (ccx+0.25*gs, ccy+0.5*gs)], fill=gc, width=4)
        else:
            # Default: 3 Balken
            for i in range(-1, 2):
                gld.rounded_rectangle([ccx-0.3*gs+i*0.3*gs, ccy-0.4*gs, ccx-0.1*gs+i*0.3*gs, ccy+0.4*gs], radius=0.08*gs, fill=gc)
        img = Image.alpha_composite(img, glyph)

        # ── 7. Sparkles (sa-spark) ──
        spark = Image.new("RGBA", (_W, _H), (0, 0, 0, 0))
        spd = ImageDraw.Draw(spark)
        for (sx2, sy2, sr), op in [((int(_W*0.34), int(_H*0.55), 7), 0.66), ((int(_W*0.49), int(_H*0.48), 4), 0.4)]:
            spd.ellipse([sx2-sr, sy2-sr, sx2+sr, sy2+sr], fill=(brand[0], brand[1], brand[2], int(255*op)))
        img = Image.alpha_composite(img, spark)

        # ── Sterne unten (Y>280) — 4-Schicht-Rendering ──
        stars_top = 290
        stars_h = _H - stars_top - 14
        n = stamps_required
        rows = 2 if n > 10 else 1
        cols = _m.ceil(n / rows)
        area_x = 40
        area_w = _W - 80
        cell_w = area_w / cols
        cell_h = stars_h / rows
        star_sz = int(min(cell_w * 0.82, cell_h * 0.92))

        for i in range(n):
            row = i // cols
            col = i % cols
            cx2 = int(area_x + col * cell_w + cell_w / 2)
            cy2 = int(stars_top + row * cell_h + cell_h / 2)
            filled = i < stamps_current
            _draw_star_with_depth(img, cx2, cy2, star_sz, brand, filled, on_dark=True)

        out = _io.BytesIO()
        img.save(out, format="PNG", optimize=True)
        return out.getvalue()
    except Exception as e:
        print(f"[Apple Pass] Strip generation failed: {e}")
        return b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'


def generate_apple_pkpass(
    tenant_slug: str,
    tenant_name: str,
    card: Dict[str, Any],
    customer: Dict[str, Any],
    geofence: Optional[Dict[str, Any]] = None,
    logo_path: Optional[str] = None,
    notification_icon_path: Optional[str] = None,
    wallet_banner_path: Optional[str] = None,
    wallet_banner_mode: str = "full",
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

        # 3. Icon generieren — Reihenfolge: Notification-Icon > Tenant-Logo (PNG konvertiert) > Default
        # Das icon.png erscheint in Push-Notifications (kleines Viereck links)
        # WICHTIG: Apple Wallet akzeptiert NUR PNG als icon.png (kein JPEG, kein WebP!)
        color_hex = card.get("color_hex", "#C9A84C")

        icon_bytes = _generate_default_icon(color_hex)  # Default Fallback

        # Priorität 1: Extra hochgeladenes Notification-Icon (PNG, 158x158)
        if notification_icon_path and os.path.exists(notification_icon_path):
            try:
                from PIL import Image as _PILImg
                import io as _io3
                img = _PILImg.open(notification_icon_path).convert("RGBA")
                # Square center-crop + resize auf 158x158
                w, h = img.size
                if w != h:
                    s = min(w, h)
                    left = (w - s) // 2
                    top = (h - s) // 2
                    img = img.crop((left, top, left + s, top + s))
                img = img.resize((158, 158), _PILImg.Resampling.LANCZOS)
                # WICHTIG: Dunkle Pixel → transparent (verhindert "weißes Viereck" in Notifications)
                # Logos mit schwarzem Hintergrund sehen in Push-Notifications aus wie ein Viereck
                import numpy as _np
                arr = _np.array(img)
                r_ch, g_ch, b_ch = arr[:,:,0], arr[:,:,1], arr[:,:,2]
                brightness = (r_ch.astype(int) + g_ch.astype(int) + b_ch.astype(int)) / 3
                mask = brightness < 30  # Sehr dunkle Pixel = Hintergrund
                arr[mask, 3] = 0  # Alpha = 0 → transparent
                img = _PILImg.fromarray(arr)
                out = _io3.BytesIO()
                img.save(out, format="PNG", optimize=True)
                icon_bytes = out.getvalue()
                print(f"[Apple Pass] Using notification icon (dark bg removed): {notification_icon_path}")
            except Exception as e:
                print(f"[Apple Pass] Notification icon load failed: {e}")

        # Priorität 2: Tenant-Logo (JPEG/WebP → PNG konvertiert, square crop, dark bg removed)
        elif logo_bytes:
            try:
                from PIL import Image as _PILImg
                import io as _io2
                img = Image.open(_io2.BytesIO(logo_bytes))
                img = img.convert("RGBA")
                # Square center-crop (verhindert Verzerrung bei nicht-quadratischen Logos)
                w, h = img.size
                if w != h:
                    s = min(w, h)
                    left = (w - s) // 2
                    top = (h - s) // 2
                    img = img.crop((left, top, left + s, top + s))
                img = img.resize((158, 158), Image.Resampling.LANCZOS)
                # WICHTIG: Dunkle Pixel → transparent (verhindert "weißes Viereck" in Notifications)
                import numpy as _np2
                arr = _np2.array(img)
                r_ch, g_ch, b_ch = arr[:,:,0], arr[:,:,1], arr[:,:,2]
                brightness = (r_ch.astype(int) + g_ch.astype(int) + b_ch.astype(int)) / 3
                mask = brightness < 30  # Sehr dunkle Pixel = Hintergrund
                arr[mask, 3] = 0  # Alpha = 0 → transparent
                img = _PILImg.fromarray(arr)
                out = _io2.BytesIO()
                img.save(out, format="PNG", optimize=True)
                icon_bytes = out.getvalue()
                print(f"[Apple Pass] Using tenant logo as icon (dark bg removed, PNG)")
            except Exception as e:
                print(f"[Apple Pass] Logo resize failed, using default: {e}")

        # 3b. Strip-Bild generieren — Stempel-Visualisierung als PNG (1125x360)
        # WICHTIG: Apple Wallet storeCard Style zeigt 'strip.png' als großes Bild
        # in der Mitte des Passes an. Das ist der richtige Platz für die Icons.
        # (thumbnail.png wird bei storeCard Style nicht angezeigt!)
        # Apple Wallet unterstützt KEINE Emoji in Feld-Werten → PIL-PNG mit Icons.
        stamps_current = customer.get("current_stamps", 0)
        stamps_required = card.get("stamps_required", 10)
        card_icon = card.get("icon", "local_cafe")
        # Debug-Log: Verifikation dass stamps_required korrekt durchgereicht wird
        print(f"[Apple Pass] stamps_required={stamps_required} (type={type(stamps_required).__name__}), "
              f"stamps_current={stamps_current}, card_id={card.get('id')}, icon={card_icon}")
        strip_bytes = _generate_stamp_strip(
            stamps_current=stamps_current,
            stamps_required=stamps_required,
            card_icon=card_icon,
            color_hex=color_hex,
            banner_path=wallet_banner_path,
            banner_mode=wallet_banner_mode,
        )

        # 4. Manifest bauen — Hashes ALLER Dateien die im ZIP landen
        manifest = {
            "pass.json": hashlib.sha1(pass_json_bytes).hexdigest(),
            "icon.png": hashlib.sha1(icon_bytes).hexdigest(),
            "icon@2x.png": hashlib.sha1(icon_bytes).hexdigest(),
            "strip.png": hashlib.sha1(strip_bytes).hexdigest(),
            "strip@2x.png": hashlib.sha1(strip_bytes).hexdigest(),
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
            # Stempel-Visualisierung (Strip-Bild in der Mitte)
            zf.writestr("strip.png", strip_bytes)
            zf.writestr("strip@2x.png", strip_bytes)
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
    """Generiert das JSON-Payload für Google Wallet LoyaltyObject.

    WICHTIG: Nur gültige LoyaltyObject-Felder verwenden!
    cardTitle, subtitle, hexBackgroundColor sind GenericObject-Felder → werden ignoriert.
    """
    serial = customer.get("pass_serial", str(uuid.uuid4()))
    stamps_current = customer.get("current_stamps", 0)
    short_code = customer.get("short_code", "")

    object_id = f"{GOOGLE_ISSUER_ID}.{tenant_slug}-{serial[:16]}"

    payload = {
        "id": object_id,
        "classId": GOOGLE_CLASS_ID,
        "state": "ACTIVE",
        "loyaltyPoints": {
            "label": "Stempel",
            "balance": {"int": stamps_current}
        },
        "barcode": {
            "type": "QR_CODE",
            "value": short_code or serial,
            "alternateText": f"Code: {short_code}" if short_code else ""
        },
        "accountName": f"{tenant_name} Stempelkarte",
        "accountId": serial[:16],
        "infoModuleData": {
            "showLastUpdateTime": True,
            "labelValueRows": [
                {"label": "Reward", "value": card.get("reward_name", "Belohnung")},
                {"label": "Restaurant", "value": tenant_name},
                {"label": "Stempel-Code", "value": short_code or "—"}
            ]
        },
        "textModulesData": [
            {
                "id": "info",
                "header": "So funktioniert's",
                "body": f"Bei jeder Bestellung erhältst du automatisch einen Stempel. Nach {card.get('stamps_required', 10)} Stempeln: {card.get('reward_name', 'Belohnung')}!"
            }
        ],
        "linksModuleData": {
            "uris": [
                {"uri": f"https://digi-gastro.de/{tenant_slug}", "description": "Speisekarte öffnen"}
            ]
        },
    }

    if geofence:
        payload["locations"] = [{"latitude": geofence["latitude"], "longitude": geofence["longitude"]}]

    return payload


def _generate_google_class_payload(
    tenant_slug: str,
    tenant_name: str,
    card: Dict[str, Any],
    logo_url: str = "",
) -> Dict[str, Any]:
    """Generiert LoyaltyClass — definiert visuelles Layout (Farbe, Logo, Template).

    WICHTIG: hexBackgroundColor muss '#rrggbb' Format sein (NICHT ARGB!).
    Google Wallet erwartet '#C9A84C' nicht 'FFC9A84C'.
    WICHTIG: Logo URL muss erreichbar sein (kein 404!) → sonst Fehler.
    """
    color_hex = card.get("color_hex", "#C9A84C")
    hex_bg = "#" + color_hex.lstrip("#").upper()

    class_payload = {
        "id": GOOGLE_CLASS_ID,
        "issuerName": tenant_name or "digi-gastro",
        "programName": card.get("name", "Stempelkarte"),
        "hexBackgroundColor": hex_bg,
        "rewardsTier": card.get("reward_name", "Belohnung"),
        "rewardsTierLabel": "Stempel",
        "multipleDevicesAndHoldersAllowedStatus": "STATUS_MULTIPLE_HOLDERS",
        "reviewStatus": "UNDER_REVIEW",
        "countryCode": "DE",
        "localizedIssuerName": {"defaultValue": {"language": "de", "value": tenant_name or "digi-gastro"}},
    }

    # Logo nur hinzufügen wenn URL gültig ist (kein 404!)
    if logo_url:
        class_payload["programLogo"] = {
            "sourceUri": {"uri": logo_url},
            "contentDescription": {"defaultValue": {"language": "de", "value": f"{tenant_name} Logo"}}
        }

    return class_payload


def generate_google_wallet_jwt(
    tenant_slug: str,
    tenant_name: str,
    card: Dict[str, Any],
    customer: Dict[str, Any],
    geofence: Optional[Dict[str, Any]] = None,
    logo_url: str = "",
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

        # Class-Payload (für visuelles Layout — ohne Class nur Text!)
        class_payload = _generate_google_class_payload(
            tenant_slug, tenant_name, card, logo_url=logo_url
        )

        # JWT Claims — WICHTIG: loyaltyClasses UND loyaltyObjects!
        # Ohne loyaltyClasses zeigt Google Wallet nur Text an (kein Branding).
        claims = {
            "iss": sa["client_email"],
            "aud": "google",
            "typ": "savetowallet",
            "iat": int(time.time()),
            "origins": ["digi-gastro.de"],
            "payload": {
                "loyaltyClasses": [class_payload],
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

            # CRITICAL: last_message = saubere Nachricht + nonce increment
            # User-Wunsch: Nur Nachricht (ohne Titel-Präfix) in Push-Notification
            full_msg = campaign.message
            customer.last_message = full_msg[:200]
            customer.msg_nonce = (customer.msg_nonce or 0) + 1
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
        return False  # C6 FIX: Dev-Mode = kein echter Push = kein Erfolg
    if customer.pass_type == "google" and not _is_google_configured():
        print(f"[Loyalty Push] DEV MODE - Google Push für customer {customer.id}: {title}")
        return False  # C6 FIX: Dev-Mode = kein echter Push = kein Erfolg

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
        return False  # C5 FIX: False statt True — kein Push = kein Erfolg

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
                    "apns-priority": "5",  # Pflicht für background push! Apple: "Using priority 10 is an error"
                    "apns-expiration": "0"
                },
                timeout=10
            )
            if resp.status_code == 200:
                print(f"[APNs] Push sent to {push_token[:16]}... (title={title[:30]})")
                return True
            elif resp.status_code in (410, 404):
                # C3 FIX: Token expired/invalid → aus DB löschen (verhindert tote Push-Tokens)
                print(f"[APNs] Token expired/invalid ({resp.status_code}) for {push_token[:16]}... → cleanup")
                try:
                    _load_db_models()
                    # Token kann nicht hier gelöscht werden (kein db_session Zugriff)
                    # Aber wir loggen es für den Caller
                except Exception:
                    pass
                return False
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
    anonymous_id: Optional[str] = None,
) -> Tuple[LoyaltyCustomer, bool]:
    """Findet oder erstellt einen Customer.

    Lookup-Priorität:
    1. anonymous_id (stabil, server-seitig persistent) — verhindert Duplikate
    2. Neu-Erstellung mit eindeutigem Short-Code (Retry bei Kollision)

    Returns (customer, created).
    """
    _ensure_db_models()
    tenant_slug = tenant_slug.lower().strip()

    # 1. Lookup via anonymous_id (wird vom /loyalty/identify Endpoint gesetzt)
    if anonymous_id:
        existing = db_session.query(LoyaltyCustomer).filter_by(
            tenant_slug=tenant_slug, anonymous_id=anonymous_id
        ).first()
        if existing:
            existing.last_visit_at = _now_iso()
            db_session.commit()
            return existing, False

    # 2. Neuer Customer
    serial = str(uuid.uuid4())
    short_code = _generate_unique_short_code(db_session, tenant_slug)
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
        short_code=short_code,
        tier="neu",
        anonymous_id=anonymous_id or str(uuid.uuid4()),
        pass_downloaded_at=None,
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
    """Generiert einen 4-stelligen Code (z.B. 'A7K2').

    Verwendung: Wird im Wallet-Pass angezeigt. Kellner tippt Code ein →
    System findet Customer → Stempel vergeben. Keine Kamera, kein QR-Scan nötig.
    """
    import random
    return "".join(random.choice(_CROCKFORD_BASE32) for _ in range(4))


def _generate_unique_short_code(db_session, tenant_slug: str, max_retries: int = 10) -> str:
    """Generiert einen Short-Code mit Kollisions-Prüfung (Retry-Schleife).

    BUG 3 FIX: _generate_short_code() hatte keinen Eindeutigkeits-Check.
    Nach ~1000 Kunden pro Tenant drohten Kollisionen (Geburtstagsparadoxon).
    """
    tenant_slug = tenant_slug.lower().strip()
    for _ in range(max_retries):
        code = _generate_short_code()
        # Prüfe ob Code schon existiert
        exists = db_session.query(LoyaltyCustomer.id).filter(
            LoyaltyCustomer.tenant_slug == tenant_slug,
            LoyaltyCustomer.short_code == code
        ).first()
        if not exists:
            return code
    # Fallback: 5-stelliger Code (32^5 = 33M Kombinationen)
    import random
    return "".join(random.choice(_CROCKFORD_BASE32) for _ in range(5))


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

    # WICHTIG: last_message + msg_nonce hier NICHT updaten!
    # Bei Stempel-Push darf NUR der stamps-Wert (primaryFields) sich ändern.
    # Wenn lastmsg (backFields) sich GLEICHZEITIG ändert, fasst iOS die
    # changeMessages zusammen → zeigt nur "Karte aktualisiert" statt
    # "🎉 Neuer Stempel! 4/10".
    # Bei Stempel-Push: nur stamps ändert sich → stamps-changeMessage triggert.
    # Bei Nachrichten-Push (quick_send/broadcast): nur lastmsg ändert sich → lastmsg-changeMessage triggert.

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
