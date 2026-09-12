# ─────────────────────────────────────────────
# digi-gastro Spieleserver (Colyseus)
#
# WICHTIG: glibc-Basis (bookworm-slim), NICHT Alpine!
# Die Colyseus-Abhängigkeiten enthalten native Module
# (uWebSockets.js, msgpackr-extract), die nur glibc-Prebuilds
# mitbringen. Auf Alpine (musl) schlägt die Installation fehl
# (node-gyp ohne Build-Tools) bzw. das Laden zur Laufzeit.
# Node 22 wegen der engines-Anforderung von Colyseus 0.18.
# ─────────────────────────────────────────────
FROM node:22-bookworm-slim
WORKDIR /app

# Reproduzierbare Installation (Lock vorhanden). Fallback auf install,
# falls die Lock-Datei nicht exakt passt. NODE_ENV ist hier noch nicht
# "production", damit auch tsx (Runtime) installiert wird.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src

ENV NODE_ENV=production \
    PORT=2567
EXPOSE 2567

CMD ["npx", "tsx", "src/index.ts"]
