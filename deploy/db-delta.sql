-- ═══════════════════════════════════════════════════════════════
-- digi-gastro DB-Delta: Jinja2-Legacy-Schema → Next.js-Schema
--
-- Verifiziert per information_schema-Diff (Server-Dump vs. neu):
--   Genau diese 3 ADDITIVE Spalten fehlen auf dem Produktionsserver.
--   Kein DROP, keine Änderung bestehender Daten → kein Datenverlust.
--
-- Ausführen EINMALIG nach dem Deploy, z. B. vom Host:
--   docker exec -i digi_gastro_db psql -U gastro_user -d digi_gastro < deploy/db-delta.sql
-- (Alternativ: `npx prisma db push` im web-Container — macht dasselbe.)
-- Idempotent: kann gefahrlos mehrfach laufen.
-- ═══════════════════════════════════════════════════════════════

-- Produkt-Varianten (Kunden wählt im Bestelldialog genau eine Variante)
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants text DEFAULT '[]';

-- Produkt-Extras (Mehrfachauswahl im Bestelldialog)
ALTER TABLE products ADD COLUMN IF NOT EXISTS extras text DEFAULT '[]';

-- Strukturierte Extras je Bestellposition (JSON) für Kellner/Admin-Anzeige
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS extras varchar;
