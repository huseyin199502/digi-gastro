# Migration: Jinja2/FastAPI → Next.js (GitHub + Coolify/Hetzner)

> **Status:**
> - ✅ Phase 0 fertig (Dockerfile, Compose, Delta-SQL, Ignores)
> - ✅ Phase 2 FERTIG — Commit `3b6db13` auf `main` gepusht.
>     Repo-Root = reine Next.js-App; Alt-Stack auf Branch `legacy-jinja` gesichert.
> - ⏳ Phase 3: DU musst in Coolify einmalig auf **Deploy** klicken
>     (kein Auto-Deploy-Webhook aktiv — Live zeigt aktuell noch Jinja).
> - ⏳ Phase 4: Live-Schaltung passiert mit dem Deploy; danach Remote-Smoke-Check.

> **Regel:** Niemals `docker compose down -v`!

---

## ⚠️ VOR dem Deploy in Coolify setzen (PFLICHT, sonst startet `web` nicht!)

Umgebungsvariablen am Service in Coolify anlegen:

```
AUTH_SECRET      = <openssl rand -hex 32>
ADMIN_PASSWORD   = <dein Plattform-Admin-Passwort>
NEXT_PUBLIC_BASE_URL = https://digi-gastro.de
COOKIE_SECURE    = 1
AUTOHEAL_TOKEN   = autoheal-secret-2026   (oder eigener Wert)
```

Der Compose bricht mit klarer Fehlermeldung ab (`Bitte AUTH_SECRET ... setzen`),
wenn die ersten beiden fehlen — absichtlich, damit keine unsicheren Defaults live gehen.

---

## Phase 0 – Vorbereitung ✅ (bereits erledigt, liegt im Projekt)

| Datei | Zweck |
|---|---|
| `Dockerfile` | Multi-Stage Node-20-Alpine, standalone Build |
| `docker-compose.yml` | Produktion — Service-/Volume-Namen identisch zum Alt-Stack (`db`, `pgbouncer`, `web`, `cron`; Volumes `pgdata`, `uploads`). redis entfällt (Next nutzt keins). |
| `docker-compose.dev.yml` | Lokale Entwicklung (DB auf 5433) |
| `.dockerignore` | Blockt `.env`, `secrets/`, `public/uploads`, Dumps etc. |
| `deploy/db-delta.sql` | Exakt verifiziertes Delta (3 additive Spalten), idempotent |

**DB-Delta (verifiziert per information_schema-Diff):**
```sql
ALTER TABLE products    ADD COLUMN IF NOT EXISTS variants text DEFAULT '[]';
ALTER TABLE products    ADD COLUMN IF NOT EXISTS extras   text DEFAULT '[]';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS extras   varchar;
```

---

## Phase 1 – BACKUP auf dem Hetzner-Server (PFLICHT ZUERST!)

Im Coolify-Terminal des **db**-Containers (`digi_gastro_db`):

```bash
# 1) Datenbank-Dump erstellen
pg_dump -U gastro_user -Fc digi_gastro > /tmp/digi-gastro-pre-migration.dump

# 2) Aus dem Container herauskopieren (Coolify-Terminal des HOSTS oder scp):
docker cp digi_gastro_db:/tmp/digi-gastro-pre-migration.dump /root/backups/
# → Danach VON Hetzner herunterladen (scp/SFTP) und lokal prüfen!

# 3) Uploads-Volume sichern (Kundenbilder):
docker run --rm -v dg-digi-gastro_uploads:/data -v /root/backups:/backup alpine \
  tar czf /backup/uploads-pre-migration.tar.gz -C /data .
# (Volume-Name ggf. mit `docker volume ls | grep uploads` prüfen)
```

✅ Erst weiter, wenn beide Dateien außerhalb des Servers liegen.

---

## Phase 2 – GitHub: alten Inhalt ersetzen ✅ ERLEDIGT (automatisiert ausgeführt)

- Clean-Room-Klon → `legacy-jinja` gesichert → Inhalt ersetzt →
  Commit `3b6db13` gepusht. GitHub-API-Verifikation: Root enthält nur Next.js-
  Dateien (`main.py`, `templates/`, `static/` etc. weg), keine Secrets/Dumps.
- Lokaler Arbeitsklon für künftige Pushes:
  `C:\Users\kinge\AppData\Local\Temp\opencode\dg-repo`
  (Git-Identity dort repo-lokal gesetzt: huseyin199502 + noreply-E-Mail)

---

## Phase 3 – Coolify: Deploy + DB-Delta + Staging-Test (NICHT live)

1. In Coolify das bestehende Projekt/Service auf **Deploy** drücken (holt neuen `main`-Stand).
2. Umgebungsvariablen setzen (siehe Block oben — VOR dem Deploy!).
3. **DB-Delta läuft jetzt AUTOMATISCH**: der neue `migrate`-Service fährt
   `deploy/db-delta.sql` idempotent vor jedem Web-Start
   (`web` wartet auf `service_completed_successfully`).
4. **Staging-Checkliste (alles muss passen BEVOR live):**
   - [ ] `https://<domain>/api/health` → ok
   - [ ] Landingpage ohne Kunden-Namen, 3D-Kartenstapel, Scroll-Video läuft
   - [ ] `/memo` & `/deer-lounge`: Speisekarte, **Logos/Bilder sichtbar** (Uploads-Volume!)
   - [ ] Testbestellung MIT Variante + Extras → Kellner-Sicht: Chips sichtbar; Admin-Dashboard: Chips sichtbar
   - [ ] Doppelte Bestellung bei schlechtem Netz: Idempotenz (gleicher Key ⇒ gleiche Order)
   - [ ] Admin-Login, KDS/Orders-Ansichten laden
5. Rollback jederzeit möglich: vorheriges Coolify-Deployment ODER
   `git push --force origin legacy-jinja:main` (+ alten Compose-Stand zurück).

---

## Phase 4 – Live schalten

- Erst wenn Phase 3 komplett grün ist: Domain-Traffic läuft über den `web`-Container (Port-Mapping intern jetzt `8090:3000`, extern unverändert).
- Kurzes Wartungsfenster (1–2 Min) beim Swap einplanen.
- Danach Beobachten: `/api/auto-heal`-Cron-Logs, Bestellungen, Wallet.

---

## Datenschutz-Garantien (Checkliste)

- [x] `pgdata` & `uploads` Volume-Namen identisch → Hetzner hängt dieselben Daten ein
- [x] `.gitignore` + `.dockerignore` blocken `.env*`, `secrets/`, `public/uploads`, `*.dump`, `*.tar.gz`, `digi_gastro.db`
- [x] Delta nur ADDITIVE Spalten (IF NOT EXISTS, idempotent)
- [ ] Von dir: Backups (Phase 1) heruntergeladen & getestet
