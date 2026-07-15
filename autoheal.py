#!/usr/bin/env python3
"""
digi-gastro Auto-Heal Monitor
Prüft regelmäßig PassKit/Wallet Gesundheit und repariert automatisch.

Läuft als Cronjob (alle 5 Minuten) auf dem Server.
Loggt nach /var/log/digi-gastro-autoheal.log

Einrichtung (auf Hetzner Server):
  crontab -e
  */5 * * * * /usr/bin/python3 /opt/digi-gastro/autoheal.py >> /var/log/digi-gastro-autoheal.log 2>&1

Oder via Coolify als Sidecar/Worker.
"""
import os
import sys
import json
import time
import sqlite3
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

# ─── KONFIGURATION ───────────────────────────────────────────────
DB_PATH = os.environ.get("DB_PATH", "/app/data/digi_gastro.db")
# Falls PostgreSQL genutzt wird (Produktion):
DATABASE_URL = os.environ.get("DATABASE_URL", "")
LOG_FILE = "/var/log/digi-gastro-autoheal.log"
MAX_LOG_SIZE = 10 * 1024 * 1024  # 10 MB → dann rotate
ALERT_WEBHOOK = os.environ.get("ALERT_WEBHOOK", "")  # Optional: Discord/Slack webhook
CHECK_INTERVAL_SECONDS = 300  # 5 Minuten (für direkten Aufruf, nicht cron)
# ─────────────────────────────────────────────────────────────────


def log(msg, level="INFO"):
    """Log mit Timestamp."""
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] [{level}] {msg}", flush=True)


def rotate_log_if_needed():
    """Rotiert Log-Datei wenn sie zu groß wird."""
    if not os.path.exists(LOG_FILE):
        return
    if os.path.getsize(LOG_FILE) > MAX_LOG_SIZE:
        os.rename(LOG_FILE, LOG_FILE + ".old")
        log("Log rotiert")


def send_alert(title, message):
    """Sendet Alert an Discord/Slack Webhook (falls konfiguriert)."""
    if not ALERT_WEBHOOK:
        return
    try:
        import urllib.request
        payload = json.dumps({"content": f"🚨 **{title}**\n{message}"}).encode()
        req = urllib.request.Request(ALERT_WEBHOOK, data=payload, headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        log(f"Alert senden fehlgeschlagen: {e}", "WARN")


# ═════════════════════════════════════════════════════════════════
# DATABASE HELPER (unterstützt SQLite und PostgreSQL)
# ═════════════════════════════════════════════════════════════════

def get_db_connection():
    """Öffnet DB-Verbindung (PostgreSQL oder SQLite)."""
    if DATABASE_URL and DATABASE_URL.startswith("postgresql"):
        import psycopg2
        return psycopg2.connect(DATABASE_URL)
    elif os.path.exists(DB_PATH):
        return sqlite3.connect(DB_PATH)
    else:
        # Fallback: versuche lokale Dev-DB
        dev_paths = [
            "/home/z/my-project/digi-gastro-work/digi_gastro.db",
            "./digi_gastro.db",
        ]
        for p in dev_paths:
            if os.path.exists(p):
                return sqlite3.connect(p)
        log("Keine DB gefunden!", "ERROR")
        return None


def execute_query(conn, query, params=None, fetch=True):
    """Führt SQL Query aus."""
    try:
        cursor = conn.cursor()
        cursor.execute(query, params or [])
        if fetch:
            return cursor.fetchall()
        conn.commit()
        return None
    except Exception as e:
        log(f"SQL Fehler: {e}", "ERROR")
        return None


# ═════════════════════════════════════════════════════════════════
# CHECK 1: pass_needs_update stuck (True für >1 Stunde)
# ═════════════════════════════════════════════════════════════════
def check_stuck_pass_needs_update(conn):
    """Findet Kunden mit pass_needs_update=True aber pass_updated_at älter als 1 Stunde.
    Setzt pass_needs_update=False (verhindert spurious pushs)."""
    results = execute_query(conn, """
        SELECT id, short_code, pass_serial, pass_updated_at, pass_downloaded_at
        FROM loyalty_customers
        WHERE pass_needs_update = 1
        AND pass_downloaded_at IS NOT NULL
    """)

    if not results:
        log("✓ Check 1: Keine stuck pass_needs_update Kunden")
        return 0

    fixed = 0
    now = datetime.utcnow()
    one_hour_ago = now - timedelta(hours=1)

    for row in results:
        customer_id, short_code, pass_serial, pass_updated_at, pass_downloaded_at = row
        # Prüfe ob pass_updated_at älter als 1 Stunde ist
        if pass_updated_at:
            try:
                update_time = datetime.fromisoformat(pass_updated_at.replace("Z", "").replace("+00:00", ""))
                if update_time < one_hour_ago:
                    # Stuck! pass_needs_update=True aber Pass wurde vor >1h aktualisiert
                    execute_query(conn, """
                        UPDATE loyalty_customers
                        SET pass_needs_update = 0
                        WHERE id = ?
                    """, [customer_id], fetch=False)
                    log(f"  🔧 Auto-Heal: Customer {customer_id} ({short_code}) pass_needs_update stuck → reset to False")
                    fixed += 1
            except Exception:
                pass
        else:
            # pass_updated_at ist NULL — setze es auf pass_downloaded_at
            if pass_downloaded_at:
                execute_query(conn, """
                    UPDATE loyalty_customers
                    SET pass_updated_at = ?, pass_needs_update = 0
                    WHERE id = ?
                """, [pass_downloaded_at, customer_id], fetch=False)
                log(f"  🔧 Auto-Heal: Customer {customer_id} ({short_code}) pass_updated_at=NULL → gesetzt auf {pass_downloaded_at[:16]}")
                fixed += 1

    conn.commit()
    if fixed > 0:
        log(f"⚠️ Check 1: {fixed} stuck pass_needs_update Kunden repariert")
    else:
        log(f"✓ Check 1: {len(results)} Kunden mit pass_needs_update=True, aber alle <1h alt (OK)")
    return fixed


# ═════════════════════════════════════════════════════════════════
# CHECK 2: pass_downloaded_at vs device_registrations Mismatch
# ═════════════════════════════════════════════════════════════════
def check_pass_registration_mismatch(conn):
    """Findet Apple-Kunden mit pass_downloaded_at=SET aber keine device_registration.
    Setzt pass_downloaded_at=NULL (Auto-Heal)."""
    results = execute_query(conn, """
        SELECT lc.id, lc.short_code, lc.pass_serial, lc.pass_downloaded_at
        FROM loyalty_customers lc
        WHERE lc.pass_downloaded_at IS NOT NULL
        AND lc.pass_type = 'apple'
        AND NOT EXISTS (
            SELECT 1 FROM passkit_device_registrations pdr
            WHERE pdr.pass_serial = lc.pass_serial
        )
    """)

    if not results:
        log("✓ Check 2: Keine pass_downloaded_at/registration Mismatches")
        return 0

    fixed = 0
    for row in results:
        customer_id, short_code, pass_serial, pass_downloaded_at = row
        execute_query(conn, """
            UPDATE loyalty_customers
            SET pass_downloaded_at = NULL, pass_needs_update = 0
            WHERE id = ?
        """, [customer_id], fetch=False)
        log(f"  🔧 Auto-Heal: Customer {customer_id} ({short_code}) hat pass_downloaded_at aber keine device_registration → reset")
        fixed += 1

    conn.commit()
    log(f"⚠️ Check 2: {fixed} Mismatches repariert")
    return fixed


# ═════════════════════════════════════════════════════════════════
# CHECK 3: Duplikate nach last_known_device_id
# ═════════════════════════════════════════════════════════════════
def check_duplicate_device_ids(conn):
    """Findet Kunden mit gleicher last_known_device_id (Duplikate).
    Merge: ältester Customer = Master, andere werden deaktiviert."""
    results = execute_query(conn, """
        SELECT last_known_device_id, COUNT(*) as cnt
        FROM loyalty_customers
        WHERE last_known_device_id IS NOT NULL
        GROUP BY last_known_device_id
        HAVING COUNT(*) > 1
    """)

    if not results:
        log("✓ Check 3: Keine Duplikate nach device_id")
        return 0

    merged = 0
    for row in results:
        device_id, count = row
        log(f"  ⚠️ Check 3: {count} Duplikate für device_id {device_id[:16]}...")

        # Hole alle Kunden mit dieser device_id, sortiert nach ID (älteste = Master)
        customers = execute_query(conn, """
            SELECT id, short_code, current_stamps, total_stamps_earned, rewards_redeemed,
                   first_visit_at, last_visit_at, tier
            FROM loyalty_customers
            WHERE last_known_device_id = ?
            ORDER BY id ASC
        """, [device_id])

        if not customers or len(customers) < 2:
            continue

        master = customers[0]
        duplicates = customers[1:]
        master_id = master[0]

        for dup in duplicates:
            dup_id = dup[0]
            # Stempel zusammenführen
            dup_stamps = dup[2] or 0
            dup_total = dup[3] or 0
            dup_rewards = dup[4] or 0
            dup_first = dup[5]
            dup_last = dup[6]
            dup_tier = dup[7]

            execute_query(conn, """
                UPDATE loyalty_customers
                SET current_stamps = min(current_stamps + ?, 99),
                    total_stamps_earned = total_stamps_earned + ?,
                    rewards_redeemed = rewards_redeemed + ?,
                    last_known_device_id = NULL,
                    pass_needs_update = 0
                WHERE id = ?
            """, [dup_stamps, dup_total, dup_rewards, dup_id], fetch=False)

            # Master aktualisieren
            if dup_first and dup_first < (master[5] or "9999"):
                execute_query(conn, "UPDATE loyalty_customers SET first_visit_at = ? WHERE id = ?", [dup_first, master_id], fetch=False)
            if dup_last and dup_last > (master[6] or "0000"):
                execute_query(conn, "UPDATE loyalty_customers SET last_visit_at = ? WHERE id = ?", [dup_last, master_id], fetch=False)
            tier_order = {"neu": 0, "stamm": 1, "vip": 2}
            if tier_order.get(dup_tier, 0) > tier_order.get(master[7], 0):
                execute_query(conn, "UPDATE loyalty_customers SET tier = ? WHERE id = ?", [dup_tier, master_id], fetch=False)

            merged += 1
            log(f"  🔧 Auto-Heal: Duplikat {dup_id} in Master {master_id} gemerged (Stempel: +{dup_stamps})")

    conn.commit()
    if merged > 0:
        log(f"⚠️ Check 3: {merged} Duplikate zusammengeführt")
        send_alert("Duplikate gefunden", f"{merged} Duplikate automatisch zusammengeführt")
    return merged


# ═════════════════════════════════════════════════════════════════
# CHECK 4: pass_updated_at Backfill (NULL Werte füllen)
# ═════════════════════════════════════════════════════════════════
def check_pass_updated_at_backfill(conn):
    """Füllt pass_updated_at=NULL mit pass_downloaded_at oder created_at."""
    results = execute_query(conn, """
        SELECT id, short_code, pass_downloaded_at, created_at
        FROM loyalty_customers
        WHERE pass_updated_at IS NULL
        AND pass_downloaded_at IS NOT NULL
    """)

    if not results:
        log("✓ Check 4: Keine pass_updated_at Backfills nötig")
        return 0

    fixed = 0
    for row in results:
        customer_id, short_code, pass_downloaded_at, created_at = row
        fill_value = pass_downloaded_at or created_at
        if fill_value:
            execute_query(conn, """
                UPDATE loyalty_customers
                SET pass_updated_at = ?
                WHERE id = ?
            """, [fill_value, customer_id], fetch=False)
            fixed += 1

    conn.commit()
    if fixed > 0:
        log(f"🔧 Check 4: {fixed} pass_updated_at Werte backfilled")
    return fixed


# ═════════════════════════════════════════════════════════════════
# CHECK 5: iOS PassKit Logs auf neue Fehler prüfen
# ═════════════════════════════════════════════════════════════════
def check_passkit_logs(conn):
    """Prüft ob in den letzten 30 Minuten neue iOS Fehler-Logs aufgetaucht sind."""
    thirty_min_ago = (datetime.utcnow() - timedelta(minutes=30)).isoformat()

    results = execute_query(conn, """
        SELECT id, logs, created_at
        FROM passkit_logs
        WHERE created_at > ?
        ORDER BY created_at DESC
        LIMIT 20
    """, [thirty_min_ago])

    if not results:
        log("✓ Check 5: Keine neuen iOS Logs in den letzten 30 Minuten")
        return 0

    error_count = 0
    for row in results:
        log_id, logs_json, created_at = row
        try:
            logs = json.loads(logs_json) if isinstance(logs_json, str) else logs_json
            for entry in logs:
                if isinstance(entry, str) and ("error" in entry.lower() or "spurious" in entry.lower()):
                    error_count += 1
        except Exception:
            pass

    if error_count > 0:
        log(f"⚠️ Check 5: {error_count} iOS Fehler in den letzten 30 Minuten!")
        send_alert("iOS PassKit Fehler", f"{error_count} Fehler in den letzten 30 Minuten. Prüfe /admin/passkit/logs")
    else:
        log(f"✓ Check 5: {len(results)} iOS Logs in 30min, keine Fehler")

    return error_count


# ═════════════════════════════════════════════════════════════════
# CHECK 6: Kunden-Zahl plötzlich gesunken (Pass-Löschung Indikator)
# ═════════════════════════════════════════════════════════════════
def check_customer_count_drop(conn):
    """Prüft ob die Kunden-Zahl plötzlich gesunken ist (Indikator für Massen-Löschung)."""
    results = execute_query(conn, """
        SELECT COUNT(*) FROM loyalty_customers
    """)
    current_count = results[0][0] if results else 0

    # Lese letzten gespeicherten Wert
    state_file = "/tmp/digi-gastro-autoheal-state.json"
    last_count = current_count
    if os.path.exists(state_file):
        try:
            with open(state_file) as f:
                state = json.load(f)
                last_count = state.get("customer_count", current_count)
        except Exception:
            pass

    # Speichere aktuellen Wert
    with open(state_file, "w") as f:
        json.dump({"customer_count": current_count, "timestamp": datetime.utcnow().isoformat()}, f)

    if current_count < last_count - 5:
        drop = last_count - current_count
        log(f"🚨 Check 6: Kunden-Zahl gesunken von {last_count} auf {current_count} (-{drop})!")
        send_alert("Kunden-Zahl gesunken", f"Von {last_count} auf {current_count} (-{drop}). Mögliche Massen-Löschung!")
    elif current_count > last_count:
        log(f"✓ Check 6: Kunden-Zahl gestiegen von {last_count} auf {current_count} (neue Kunden)")
    else:
        log(f"✓ Check 6: Kunden-Zahl stabil bei {current_count}")

    return current_count


# ═════════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════════
def run_checks():
    """Führt alle Checks aus."""
    log("=" * 60)
    log("digi-gastro Auto-Heal Monitor gestartet")
    log("=" * 60)

    conn = get_db_connection()
    if not conn:
        log("Keine DB-Verbindung — Abbruch", "ERROR")
        return

    total_fixes = 0
    total_alerts = 0

    try:
        # Check 1: Stuck pass_needs_update
        total_fixes += check_stuck_pass_needs_update(conn)

        # Check 2: pass_downloaded_at vs device_registrations
        total_fixes += check_pass_registration_mismatch(conn)

        # Check 3: Duplikate nach device_id
        total_fixes += check_duplicate_device_ids(conn)

        # Check 4: pass_updated_at Backfill
        total_fixes += check_pass_updated_at_backfill(conn)

        # Check 5: iOS Logs auf neue Fehler
        total_alerts += check_passkit_logs(conn)

        # Check 6: Kunden-Zahl plötzlich gesunken
        check_customer_count_drop(conn)

    except Exception as e:
        log(f"Fehler beim Auto-Heal: {e}", "ERROR")
        send_alert("Auto-Heal Fehler", str(e))
    finally:
        conn.close()

    log(f"--- Zusammenfassung: {total_fixes} Fixes, {total_alerts} Alerts ---")
    log("=" * 60)


if __name__ == "__main__":
    rotate_log_if_needed()

    # Wenn --loop als Argument: läuft endlos mit CHECK_INTERVAL
    if "--loop" in sys.argv:
        log("Loop-Modus aktiviert — läuft alle " + str(CHECK_INTERVAL_SECONDS) + "s")
        while True:
            run_checks()
            time.sleep(CHECK_INTERVAL_SECONDS)
    else:
        # Einmaliger Lauf (für Cronjob)
        run_checks()
