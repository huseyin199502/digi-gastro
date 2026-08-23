# digi-gastro — Next.js Migration

Modern rewrite of the legacy FastAPI/SQLAlchemy application (`main.py`,
`database.py`) as a **Next.js 16 + TypeScript** app backed by **PostgreSQL**
through **Prisma**.

This directory is the migrated application. The original FastAPI project still
lives one level up and is untouched.

## Stack

| Concern    | Legacy                     | Migrated                                  |
| ---------- | -------------------------- | ----------------------------------------- |
| Framework  | FastAPI + Jinja templates  | Next.js 16 (App Router, React Server Components) |
| Language   | Python                     | TypeScript (strict)                       |
| Database   | SQLite ↔ PostgreSQL        | PostgreSQL 16 only                        |
| ORM        | SQLAlchemy                 | Prisma 7 (driver-adapter `@prisma/adapter-pg`) |
| Styling    | Hand-written CSS / Tailwind| Tailwind CSS v4                           |

## Data migration performed

1. **Database** — the production dump `digi-gastro-backup.dump` (PostgreSQL
   custom format) was restored into a fresh `postgres:16-alpine` container:
   ```
   docker cp digi-gastro-backup.dump digi_gastro_next_db:/tmp/backup.dump
   docker exec digi_gastro_next_db pg_restore -U gastro_user -d digi_gastro \
       --no-owner --no-privileges /tmp/backup.dump
   ```
   All 38 tables and their data came across (tenants, products, orders,
   loyalty, shifts, inventory, …).

2. **Prisma schema** — generated from the *restored* database via
   `prisma db pull` so it matches production exactly, then refactored to
   idiomatic `PascalCase` model names while keeping the original table names
   through `@@map`. Verified with `prisma migrate diff` → **empty migration**
   (zero schema drift).

3. **Uploads** — `digi-gastro-uploads.tar.gz` was extracted so that the URL
   structure is preserved:
   - `public/uploads/**`  → served at `/uploads/**` (same paths the DB stores)
   - `data/backups/**`    → kept out of the web root
   All 280 product images referenced in the DB resolve on disk.

## Running locally

```bash
# 1. Start PostgreSQL (or reuse an existing one)
docker compose up -d db

# 2. Configure environment
cp .env.example .env       # then edit values

# 3. Install + generate Prisma client (postinstall runs prisma generate)
npm install

# 4. Develop
npm run dev                # http://localhost:3000

# Production build
npm run build && npm start
```

> The DB port defaults to **5433** (see `docker-compose.yml` and `.env`) so it
> does not collide with any PostgreSQL already running on 5432.

## What was migrated (working today)

- **Guest menu** — `/{slug}` server-rendered menu with categories, product
  images, dietary badges, sold-out state, and active-event (happy hour)
  pricing. Price-mode (brutto/netto) and Berlin-time event logic ported 1:1.
- **Order placement** — `POST /{slug}/bestellen` with server-side price
  recomputation, unknown-product rejection, empty-cart rejection, daily Bon
  numbering, tenant revenue counters, and audit logging.
- **products-lite API** — `GET /api/{slug}/products-lite` returns the exact
  legacy response shape for tablet/kiosk clients.
- **Authentication** — `POST /api/auth/login` + logout, using the same
  session-cookie format as the legacy app (`{slug}:Owner:chef:{password}`) so
  existing data keeps working. Tenant admin and platform admin are gated.
- **Tenant admin dashboard** — `/{slug}/admin` (today's revenue/orders,
  product/table counts, recent orders).
- **Admin CRUD (products/categories)** — legacy paths kept 1:1:
  `POST /admin/produkt-erstellen`, `POST /admin/produkt-loeschen/{id}`,
  `PUT /api/products/{id}`, `POST /admin/product-toggle/{id}`,
  `POST /admin/product-hh`, `POST /admin/products/reorder`,
  `POST /admin/kategorie-erstellen`, `POST /admin/kategorie-loeschen`,
  `POST /admin/categories/reorder`, `POST /api/categories/extras`,
  `PATCH /api/categories/edit`. Same auth gates, `{'detail': ...}` errors
  and JSON/redirect dual behaviour as the FastAPI app.
- **Orders management** — `GET /{slug}/orders/status`,
  `POST /{slug}/orders/confirm/{id}`, `POST /admin/orders/serve`
  (incl. 5s dedup, quantity splitting, delivered-item merging) and
  `POST /api/admin/orders/add-manual` (merge-into-active-order semantics).
- **Platform tenant management** — `/digi-gastro-admin/tenant-erstellen`,
  `tenant-reset-password`, `tenant-edit-name`, `tenant-toggle`,
  `tenant-orders-toggle`, `tenant-loyalty-toggle`, `tenant-revenue-toggle`,
  `tenant-complete-setup`, `tenant-adjust-revenue`, `tenant-cleanup-orders`
  (JSON backup + chunked delete + revenue recompute) and
  `tenant-operating-mode/{slug}`.
- **Platform admin** — `/digi-gastro-admin` tenant overview.
- **Health check** — `GET /api/health`.

## Not yet migrated (next steps)

These are intentionally out of scope for the foundation and remain on the
legacy app until ported:

- WebSocket live updates (`/ws/{slug}`) — use SSE or WebSockets in Next.
- Remaining admin CRUD (events/staff/tables editing).
- Apple Wallet / Google Wallet PassKit endpoints.
- Loyalty stamp/redeem/campaign flows.
- POS integrations, CSV import/export, PDF/XLSX reports.
- Inventory (stock/recipes/purchase orders) and shift-planning UIs.

## Notes

- Tenant passwords are stored **in plaintext** (legacy behaviour). The
  comparison semantics are preserved so restored data works; migrating to
  hashed passwords is a recommended follow-up.
- Uploaded assets in `public/uploads` and `data/backups` are gitignored;
  restore them from `digi-gastro-uploads.tar.gz`.
