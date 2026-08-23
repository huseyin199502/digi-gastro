# Migration: Jinja2/FastAPI → Next.js (GitHub + Coolify/Hetzner)

> **Status:** Phase 0 fertig vorbereitet. Phasen 1–4 werden MANUELL ausgeführt.
> **Regel:** Kein Schritt ohne vollständiges Backup. Niemals `docker compose down -v`!

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

## Phase 2 – GitHub: alten Inhalt ersetzen (Clean-Room)

In einem NEUEN Ordner (nicht im Projekt!):

```bash
git clone https://github.com/huseyin199502/digi-gastro.git dg-repo
cd dg-repo

# Rollback-Zweig sichern
git push origin main:refs/heads/legacy-jinja

# Alten Inhalt komplett löschen
git rm -rf .

# ---- Inhalt von C:\Users\kinge\Downloads\digi-gastro-main\digi-gastro-main\digi-gastro-next kopieren
#     ALLES außer: node_modules, .next, .env*, secrets/, public/uploads,
#                  *.dump, dump.sql, digi_gastro.db, data/, dev-logs
# ---- (.env.example und .gitignore aus dem Next-Projekt gehören dazu!)

git add -A
git status          # ⚠️ KONTROLLE: keine .env / secrets / uploads / dumps sichtbar!
git commit -m "migrate: Jinja2/FastAPI → Next.js (Next 16, Prisma 7)"
git push origin main
```

Danach zeigt das Repo zu 100 % auf die Next.js-App; der Alt-Stack bleibt auf `legacy-jinja`.

---

## Phase 3 – Coolify: Deploy + DB-Delta + Staging-Test (NICHT live)

1. In Coolify das bestehende Projekt/Service auf **Deploy** drücken (holt neuen `main`-Stand).
2. Umgebungsvariablen setzen (Compose liest sie automatisch):
   - `AUTH_SECRET` = langer Zufallsstring (z. B. `openssl rand -hex 32`)
   - `ADMIN_PASSWORD` = Plattform-Admin-Passwort
   - `NEXT_PUBLIC_BASE_URL` = `https://digi-gastro.de`
   - `COOKIE_SECURE=1`, `AUTOHEAL_TOKEN` wie gehabt
3. Nach grünem Healthcheck **einmalig DB-Delta fahren** (Terminal Host):
   ```bash
   docker exec -i digi_gastro_db psql -U gastro_user -d digi_gastro < deploy/db-delta.sql
   ```
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
