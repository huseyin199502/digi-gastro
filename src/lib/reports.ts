// ──────────────────────────────────────────────────────────────────
// Etappe 5 — Reports & CSV: shared helpers ported from main.py
//  - _load_all_orders_for_export (main.py 12500)
//  - _filter_orders_for_export   (main.py 12396)
//  - _get_display_total          (main.py 12481)
// ──────────────────────────────────────────────────────────────────
import { prisma } from "./prisma";
import { berlinDateStr, getBerlinNow } from "./time";

export interface ExportOrderItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  status: string | null;
  category_type: string;
  note: string | null;
  extras: string | null;
  combo_id: number | null;
  combo_name: string | null;
  combo_instance_id: string | null;
}

export interface ExportOrder {
  id: number;
  table: string;
  items: ExportOrderItem[];
  total: number;
  original_total: number | null;
  daily_bon_number: number | null;
  bon_date: string | null;
  status: string;
  timestamp: string;
  mwst_rate: number | null;
  waiter: string;
  tip: number;
}

/**
 * CRITICAL FIX C5: lädt ALLE Bestellungen direkt aus der DB — OHNE LIMIT 200.
 * Sanity-Cap 100.000 Orders (verhindert RAM-Overflow).
 */
export async function loadAllOrdersForExport(slug: string): Promise<ExportOrder[]> {
  const slugLower = slug.toLowerCase().trim();
  const dbOrders = await prisma.order.findMany({
    where: { tenant_slug: slugLower },
    orderBy: { id: "desc" },
    take: 100000,
    include: {
      items: { orderBy: { id: "asc" } },
    },
  });
  if (dbOrders.length === 0) return [];
  dbOrders.reverse(); // chronologisch (wie load_restaurant_from_db)
  return dbOrders.map((o) => ({
    id: o.id,
    table: o.table,
    items: o.items.map((i) => ({
      id: i.id,
      product_id: i.product_id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      status: i.item_status,
      category_type: i.category_type ?? "küche",
      note: i.note,
      extras: i.extras ?? null,
      combo_id: i.combo_id,
      combo_name: i.combo_name,
      combo_instance_id: i.combo_instance_id,
    })),
    total: o.total ?? 0,
    original_total: o.original_total ?? null,
    daily_bon_number: o.daily_bon_number ?? null,
    bon_date: o.bon_date,
    status: o.status ?? "",
    timestamp: o.timestamp,
    mwst_rate: o.mwst_rate,
    waiter: o.waiter_id ?? "",
    tip: o.tip_amount ?? 0,
  }));
}

/** Nie wieder 0€ im Export: zeige original_total wenn total=0. */
export function getDisplayTotal(o: ExportOrder): number {
  const t = o.total || 0;
  const ot = o.original_total;
  if (ot == null || ot === 0) return t;
  return Math.max(t, ot);
}

/** "YYYY-MM-DD HH:MM:SS" → Date (Berlin-naiv, wie datetime.strptime im Legacy) */
export function parseOrderDate(ts: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/.exec(ts);
  if (!m) return null;
  return new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
    Number(m[6])
  );
}

/** "YYYY-MM-DD" → Date um 00:00 oder null */
export function parseDateParam(raw: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw ?? "");
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export interface ExportFilterParams {
  range: string;
  status: string;
  frm: string;
  to: string;
  table: string;
  search: string;
}

/**
 * Shared filter logic for PDF/Excel exports. Mirrors the JS getFilteredOrders()
 * so the export always matches exactly what the admin sees on screen.
 */
export function filterOrdersForExport(
  orders: ExportOrder[],
  params: ExportFilterParams
): ExportOrder[] {
  const now = getBerlinNow();
  const todayStr = berlinDateStr(now);
  const searchLower = (params.search || "").trim().toLowerCase();
  const filtered: ExportOrder[] = [];

  for (const o of orders) {
    // 1. Date filter
    if (params.range && params.range !== "all") {
      const orderDate = parseOrderDate(o.timestamp);
      if (params.range === "today") {
        if (
          !orderDate ||
          berlinDateStr(orderDate) !== todayStr
        ) {
          continue;
        }
      } else if (params.range === "7d") {
        if (!orderDate || (now.getTime() - orderDate.getTime()) / 86400000 > 7) {
          continue;
        }
      } else if (params.range === "30d") {
        if (!orderDate || (now.getTime() - orderDate.getTime()) / 86400000 > 30) {
          continue;
        }
      } else if (params.range === "custom") {
        if (!orderDate) continue;
        if (params.frm) {
          const fromDate = parseDateParam(params.frm);
          if (fromDate && orderDate < fromDate) continue;
        }
        if (params.to) {
          const toDate = parseDateParam(params.to);
          if (toDate) {
            // inkl. Enddatum (bis 23:59:59)
            const toEnd = new Date(toDate);
            toEnd.setHours(23, 59, 59);
            if (orderDate > toEnd) continue;
          }
        }
      }
    }

    // 2. Status filter
    if (params.status && params.status !== "all") {
      const oStatus = (o.status || "").toLowerCase();
      if (params.status === "aktiv") {
        if (oStatus === "bezahlt" || oStatus === "storniert") continue;
      } else if (params.status === "bezahlt") {
        if (oStatus !== "bezahlt") continue;
      } else if (params.status === "storniert") {
        if (oStatus !== "storniert") continue;
      }
    }

    // 3. Tisch filter
    if (params.table && params.table !== "all") {
      if (String(o.table) !== params.table) continue;
    }

    // 4. Search filter
    if (searchLower) {
      const bonId = String(o.id).toLowerCase();
      const tableStr = String(o.table).toLowerCase();
      if (!bonId.includes(searchLower) && !tableStr.includes(searchLower)) {
        continue;
      }
    }

    filtered.push(o);
  }

  // Sort by timestamp desc (newest first) — same as default JS sort
  filtered.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  return filtered;
}

/** "12,50 €" — deutsches Format wie im Legacy */
export function fmtEur(v: unknown): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0,00 €";
  return n.toFixed(2).replace(".", ",") + " €";
}

/** Filter-Beschreibung für PDF/XLSX-Kopfzeilen */
export function buildFilterText(params: ExportFilterParams): string {
  const rangeLabels: Record<string, string> = {
    today: "Heute",
    "7d": "Letzte 7 Tage",
    "30d": "Letzte 30 Tage",
    all: "Alle Zeiträume",
  };
  const parts: string[] = [];
  if (params.range === "custom" && params.frm && params.to) {
    parts.push(`Zeitraum: ${params.frm} bis ${params.to}`);
  } else if (rangeLabels[params.range]) {
    parts.push(`Zeitraum: ${rangeLabels[params.range]}`);
  }
  if (params.status && params.status !== "all") {
    const statusLabels: Record<string, string> = {
      aktiv: "Aktiv",
      bezahlt: "Bezahlt",
      storniert: "Storniert",
    };
    parts.push(`Status: ${statusLabels[params.status] ?? params.status}`);
  }
  if (params.table && params.table !== "all") {
    parts.push(`Tisch: ${params.table}`);
  }
  if (params.search) {
    parts.push(`Suche: "${params.search}"`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Keine Filter aktiv";
}
