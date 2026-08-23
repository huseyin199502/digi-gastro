# ─────────────────────────────────────────────
# digi-gastro Next.js — Produktions-Image
# Multi-Stage-Build (deps → builder → runner)
# Läuft als standalone-Server (next.config.ts: output = "standalone")
#
# Kundendaten kommen NIE ins Image:
#  - public/uploads wird per Volume gemountet (siehe docker-compose.yml)
#  - .env / secrets/ sind via .dockerignore ausgeschlossen
# ─────────────────────────────────────────────

# ── Stage 1: Dependencies (inkl. prisma generate) ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# postinstall führt `prisma generate` aus → Schema + Config nötig
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# ── Stage 2: Build ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* werden zur Build-Zeit eingebrannt
ARG NEXT_PUBLIC_BASE_URL=https://digi-gastro.de
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_TELEMETRY_DISABLED=1

# Generierten Prisma-Client sicherstellen (src/generated ist via
# .dockerignore vom Host ausgeschlossen und wird hier frisch erzeugt)
RUN npx prisma generate

RUN npm run build

# ── Stage 3: Runtime (schlank, standalone) ──
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    TZ=Europe/Berlin \
    NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache tzdata

# Statische Public-Assets (Icons, hero-poster, …).
# public/uploads wird im Compose per Volume überschrieben — Kundendaten
# liegen ausschließlich auf dem Server-Volume.
COPY --from=builder /app/public /app/public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=25s --retries=3 \
    CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
