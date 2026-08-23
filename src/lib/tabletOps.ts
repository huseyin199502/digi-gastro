import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getTenantSession, safeEqual, TenantSession } from "./auth";
import { ApiError } from "./adminApi";
import { MutableOrder, MutableOrderItem } from "./orderItems";
import { berlinTimestamp } from "./time";

// ──────────────────────────────────────────────────────────────────
// Shared helpers for the tablet/POS-core endpoints ported from
// main.py (bezahlen, teilzahlung, transfers, cancels, service calls).
// Semantics mirror the legacy 1:1, including Fix-6 invariants:
//   - original_total is only ever increased, never reduced
//   - emptied source orders keep their total (nie wieder 0€-Bons)
// ──────────────────────────────────────────────────────────────────

export function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

/** Legacy parse_active_table_num (main.py ~3115) */
export function parseActiveTableNum(raw: string): { num: string; zone: string } {
  let num = String(raw ?? "").trim();
  let zone = "";
  if (num.startsWith("Tisch ")) num = num.slice(6).trim();
  if (num.includes("(") && num.endsWith(")")) {
    const idx = num.indexOf("(");
    zone = num.slice(idx + 1, -1).trim();
    num = num.slice(0, idx).trim();
  }
  return { num, zone };
}

/** Legacy get_restaurant_or_raise → 404/403 with exact German messages */
export async function getActiveTenant(slug: string) {
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) throw new ApiError("Dieses Restaurant existiert nicht.", 404);
  if (tenant.active === false) {
    throw new ApiError("Dieses Restaurant ist derzeit nicht erreichbar.", 403);
  }
  return tenant;
}

// ── Auth patterns ──

export interface TabletAuth {
  viaPos: boolean;
  session: TenantSession | null;
}

/**
 * POS device cookie (pos_token_{slug}) OR session with one of the allowed
 * roles → otherwise 403 "Keine Berechtigung." (legacy tablet endpoints).
 */
export async function tabletAuth(
  slug: string,
  allowedRoles: string[]
): Promise<TabletAuth> {
  const store = await cookies();
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { pos_token: true },
  });
  const posCookie = store.get(`pos_token_${slug}`)?.value;
  const viaPos = Boolean(
    posCookie && tenant?.pos_token && safeEqual(posCookie, tenant.pos_token)
  );
  if (viaPos) return { viaPos: true, session: null };
  const session = await getTenantSession(store);
  if (session && session.slug === slug && allowedRoles.includes(session.role)) {
    return { viaPos: false, session };
  }
  throw new ApiError("Keine Berechtigung.", 403);
}

export interface EmployeeRef {
  name: string;
  role: string;
}

/**
 * Resolve the audit-log employee. Session-auth → staff record by name
 * (fallback to session values); POS-auth → "POS-Tablet"/"pos"; otherwise
 * PIN fallback against staff.pin_code/pin with route-specific errors.
 */
export async function resolveEmployeeForCancel(
  slug: string,
  auth: TabletAuth,
  pin: string | null,
  pinMissingMsg: string,
  pinInvalidMsg: string
): Promise<EmployeeRef> {
  if (auth.viaPos || auth.session) {
    if (auth.session) {
      const staff = await prisma.staff.findFirst({
        where: { tenant_slug: slug, name: auth.session.name },
        select: { name: true, role: true },
      });
      return staff ?? { name: auth.session.name, role: auth.session.role };
    }
    return { name: "POS-Tablet", role: "pos" };
  }
  if (!pin) throw new ApiError(pinMissingMsg, 400);
  const wanted = String(pin).trim();
  const staffList = await prisma.staff.findMany({
    where: { tenant_slug: slug },
    select: { name: true, role: true, pin: true, pin_code: true },
  });
  const found = staffList.find(
    (s) => String(s.pin_code || s.pin) === wanted
  );
  if (!found) throw new ApiError(pinInvalidMsg, 403);
  return { name: found.name, role: found.role };
}

// ── Fix-6 order-total helpers (legacy 3179/3203) ──

export function ensureOriginalTotal(order: MutableOrder): void {
  if (order.original_total === null || order.original_total === undefined) {
    order.original_total = round2(order.total || 0);
  }
}

export function recalculateOrderTotals(order: MutableOrder): void {
  const newTotal = round2(
    order.items.reduce(
      (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
      0
    )
  );
  order.total = newTotal;
  const tip = Number(order.tip_amount || 0);
  order.tip_amount = round2(tip);
  order.total_with_tip = round2(newTotal + tip);
  ensureOriginalTotal(order);
}

/**
 * Rotate a table's active_session_token when it has no more open orders
 * (legacy _maybe_rotate_table_session_token, main.py ~3127). Never touches
 * security_token — printed QR codes remain valid.
 */
export async function maybeRotateTableSessionToken(
  slug: string,
  orderTable: string | null
): Promise<void> {
  if (!orderTable) return;
  const { num, zone } = parseActiveTableNum(orderTable);
  if (!num) return;
  const possibleTables = [`Tisch ${num}`];
  if (zone) possibleTables.unshift(`Tisch ${num} (${zone})`);
  const openCount = await prisma.order.count({
    where: {
      tenant_slug: slug,
      table: { in: possibleTables },
      status: { notIn: ["bezahlt", "storniert"] },
    },
  });
  if (openCount > 0) return;
  let dbTable = null;
  if (zone) {
    dbTable = await prisma.table.findFirst({
      where: { tenant_slug: slug, number: num, zone },
    });
  }
  if (!dbTable) {
    dbTable = await prisma.table.findFirst({
      where: { tenant_slug: slug, number: num },
    });
  }
  if (dbTable) {
    await prisma.table.update({
      where: { id: dbTable.id },
      data: { active_session_token: crypto.randomBytes(4).toString("hex") },
    });
  }
}

/** Zone-aware open-order lookup: patterns ["Tisch N (Zone)", "Tisch N", "N"] */
export function findOpenOrdersByTable(
  orders: MutableOrder[],
  num: string,
  zone: string
): MutableOrder[] {
  const patterns: string[] = [];
  if (zone) patterns.push(`Tisch ${num} (${zone})`);
  patterns.push(`Tisch ${num}`);
  patterns.push(num);
  return orders.filter((o) => {
    if (o.status === "bezahlt" || o.status === "storniert") return false;
    const t = String(o.table ?? "").trim();
    return patterns.includes(t);
  });
}

// ── Persistence (legacy save_restaurant_to_db for a set of orders) ──

export interface PersistOps {
  updates?: MutableOrder[];
  deletes?: number[];
  creates?: Omit<MutableOrder, "id">[];
  /** increments of tenant.tagesumsatz */
  addTagesumsatz?: number;
  /** increments of tenant.bestellungen_gesamt */
  incrementBestellungen?: number;
  audit?: {
    name: string;
    role: string;
    action: string;
    details: string;
  }[];
}

/** Persist a batch of order mutations atomically (single transaction). */
export async function persistOrderOps(
  slug: string,
  ops: PersistOps
): Promise<number[]> {
  const createdIds: number[] = [];
  await prisma.$transaction(async (tx) => {
    for (const order of ops.updates ?? []) {
      await tx.order.update({
        where: { id: order.id },
        data: {
          table: order.table,
          total: order.total,
          total_with_tip: order.total_with_tip,
          tip_amount: order.tip_amount,
          status: order.status,
          timestamp: order.timestamp,
          mwst_rate: order.mwst_rate,
          waiter_id: order.waiter_id,
          original_total: order.original_total,
          daily_bon_number: order.daily_bon_number,
          bon_date: order.bon_date,
        },
      });
      await tx.orderItem.deleteMany({ where: { order_id: order.id } });
      for (const item of order.items) {
        await tx.orderItem.create({ data: orderItemData(order.id, item, slug) });
      }
    }
    for (const id of ops.deletes ?? []) {
      await tx.order.delete({ where: { id } });
    }
    for (const order of ops.creates ?? []) {
      const created = await tx.order.create({
        data: {
          tenant_slug: slug,
          table: order.table,
          total: order.total,
          total_with_tip: order.total_with_tip,
          tip_amount: order.tip_amount,
          status: order.status,
          timestamp: order.timestamp,
          mwst_rate: order.mwst_rate,
          waiter_id: order.waiter_id,
          original_total: order.original_total,
          daily_bon_number: order.daily_bon_number,
          bon_date: order.bon_date,
        },
      });
      createdIds.push(created.id);
      for (const item of order.items) {
        await tx.orderItem.create({
          data: orderItemData(created.id, item, slug),
        });
      }
    }
    if (ops.addTagesumsatz || ops.incrementBestellungen) {
      await tx.tenant.update({
        where: { slug },
        data: {
          ...(ops.addTagesumsatz
            ? { tagesumsatz: { increment: round2(ops.addTagesumsatz) } }
            : {}),
          ...(ops.incrementBestellungen
            ? { bestellungen_gesamt: { increment: ops.incrementBestellungen } }
            : {}),
        },
      });
    }
    for (const entry of ops.audit ?? []) {
      await tx.auditLog.create({
        data: {
          tenant_slug: slug,
          action: entry.action,
          timestamp: berlinTimestamp(),
          // legacy save_restaurant_to_db mapping: user = "name (role)"
          user: `${entry.name || "Unbekannt"} (${entry.role || "unbekannt"})`,
          details: entry.details,
        },
      });
    }
  });
  return createdIds;
}

function orderItemData(
  orderId: number,
  item: MutableOrderItem,
  slug: string
) {
  return {
    order_id: orderId,
    product_id: item.product_id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    category_type: item.category_type ?? "küche",
    note: item.note,
    item_status: item.item_status ?? "pending",
    combo_id: item.combo_id,
    combo_name: item.combo_name,
    combo_instance_id: item.combo_instance_id,
    tenant_slug: slug,
  };
}

/** Load ALL open orders of a tenant (for merge/transfer operations). */
export async function loadOpenOrders(slug: string): Promise<MutableOrder[]> {
  const orders = await prisma.order.findMany({
    where: { tenant_slug: slug, status: { notIn: ["bezahlt", "storniert"] } },
    include: { items: { orderBy: { id: "asc" } } },
    orderBy: { id: "asc" },
  });
  return orders.map((o) => ({
    id: o.id,
    tenant_slug: o.tenant_slug,
    table: o.table,
    total: o.total ?? 0,
    total_with_tip: o.total_with_tip ?? 0,
    tip_amount: o.tip_amount ?? 0,
    status: o.status ?? "eingegangen",
    timestamp: o.timestamp,
    mwst_rate: o.mwst_rate ?? 19,
    waiter_id: o.waiter_id,
    original_total: o.original_total ?? 0,
    daily_bon_number: o.daily_bon_number,
    bon_date: o.bon_date,
    items: o.items.map((i) => ({
      product_id: i.product_id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      category_type: i.category_type,
      note: i.note,
      item_status: i.item_status ?? "pending",
      combo_id: i.combo_id,
      combo_name: i.combo_name,
      combo_instance_id: i.combo_instance_id,
    })),
  }));
}

// ── Request body parsing (JSON or form-encoded, legacy Form(...) params) ──

export async function readBodyFields(
  request: Request
): Promise<Record<string, string>> {
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      const data = await request.json();
      if (data && typeof data === "object") {
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(data)) {
          if (v !== null && v !== undefined) out[k] = String(v);
        }
        return out;
      }
      return {};
    } catch {
      return {};
    }
  }
  const form = await request.formData();
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) out[k] = String(v);
  return out;
}

// ── Natural sort for table numbers (legacy tablet-status) ──

export function naturalSortKey(s: string): (string | number)[] {
  return String(s)
    .split(/(\d+)/)
    .filter((t) => t !== "")
    .map((t) => (/^\d+$/.test(t) ? parseInt(t, 10) : t.toLowerCase()));
}

export function compareNatural(a: string, b: string): number {
  const ka = naturalSortKey(a);
  const kb = naturalSortKey(b);
  for (let i = 0; i < Math.max(ka.length, kb.length); i++) {
    const x = ka[i];
    const y = kb[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    if (typeof x === "number" && typeof y === "number") {
      if (x !== y) return x - y;
    } else {
      const sx = String(x);
      const sy = String(y);
      if (sx !== sy) return sx < sy ? -1 : 1;
    }
  }
  return 0;
}

// ── Sitzplan-Grid (legacy sort_tables_in_grid, main.py ~8337) ──
// Ordnet alle Tische nach Nummer und verteilt pos_x/pos_y prozentual
// in einem Raster (2–6 Spalten je nach Anzahl).
export async function sortTablesInGrid(slug: string): Promise<void> {
  const tables = await prisma.table.findMany({
    where: { tenant_slug: slug },
    orderBy: { id: "asc" },
  });
  const sorted = [...tables].sort((a, b) => compareNatural(a.number, b.number));
  const count = sorted.length;
  if (count === 0) return;

  const cols =
    count <= 4 ? 2 : count <= 9 ? 3 : count <= 16 ? 4 : count <= 25 ? 5 : 6;
  const maxRows = Math.ceil(count / cols);

  await prisma.$transaction(
    sorted.map((t, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const posX = cols > 1 ? col * (90 / (cols - 1)) : 0;
      const posY = maxRows > 1 ? row * (84 / (maxRows - 1)) : 0;
      return prisma.table.update({
        where: { id: t.id },
        data: { pos_x: Math.round(posX), pos_y: Math.round(posY) },
      });
    })
  );
}
