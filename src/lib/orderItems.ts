import { prisma } from "./prisma";
import { berlinDateStr, berlinTimestamp, getBerlinNow } from "./time";

// ──────────────────────────────────────────────────────────────────
// Order item helpers — ports of legacy main.py functions:
//   parse_item_key / find_order_item / merge_duplicate_order_items /
//   update_order_status_by_items / _compute_daily_bon_number
// Orders are loaded as plain mutable objects and persisted by
// rewriting the order row + replacing its items (legacy
// save_restaurant_to_db semantics for a single order).
// ──────────────────────────────────────────────────────────────────

export interface MutableOrderItem {
  id?: number; // DB-Item-ID (bei loadOrder gesetzt) — für exaktes Zeilen-Matching
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  category_type: string | null;
  note: string | null;
  item_status: string | null;
  combo_id: number | null;
  combo_name: string | null;
  combo_instance_id: string | null;
}

export interface MutableOrder {
  id: number;
  tenant_slug: string;
  table: string;
  total: number;
  total_with_tip: number;
  tip_amount: number;
  status: string;
  timestamp: string;
  mwst_rate: number;
  waiter_id: string | null;
  original_total: number;
  daily_bon_number: number | null;
  bon_date: string | null;
  items: MutableOrderItem[];
}

export async function loadOrder(
  slug: string,
  orderId: number
): Promise<MutableOrder | null> {
  const o = await prisma.order.findFirst({
    where: { id: orderId, tenant_slug: slug },
    include: { items: { orderBy: { id: "asc" } } },
  });
  if (!o) return null;
  return {
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
      id: i.id,
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
  };
}

/** Persist a mutated order: update the row, delete + re-create items. */
export async function persistOrder(order: MutableOrder): Promise<void> {
  await prisma.$transaction(async (tx) => {
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
      await tx.orderItem.create({
        data: {
          order_id: order.id,
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
        },
      });
    }
  });
}

// ── item_key parsing (legacy parse_item_key, main.py ~6772) ──

const VALID_ITEM_STATUSES = ["pending", "confirmed", "delivered"];

export interface ParsedItemKey {
  pid: string;
  noteSlug: string;
  status: string | null;
  comboId: string | null;
  comboInstanceId: string | null;
}

export function parseItemKey(itemKey: string): ParsedItemKey {
  const parts = itemKey.split("_");
  const pid = parts[0];
  let comboId: string | null = null;
  let comboInstanceId: string | null = null;

  const statusIdx = parts.findIndex((p) => VALID_ITEM_STATUSES.includes(p));
  if (statusIdx === -1) {
    return { pid, noteSlug: parts.slice(1).join("_"), status: null, comboId: null, comboInstanceId: null };
  }
  const status = parts[statusIdx];
  const noteSlug = parts.slice(1, statusIdx).join("_");
  const after = parts.slice(statusIdx + 1);

  if (after.length === 1) {
    // X may be combo_id (new) or idx (legacy)
    if (/^\d+$/.test(after[0]) || after[0] === "") comboId = after[0];
  } else if (after.length === 2) {
    comboId = after[0];
  } else if (after.length === 3) {
    comboId = after[0];
    comboInstanceId = after[1];
  }
  return { pid, noteSlug, status, comboId, comboInstanceId };
}

export function findOrderItem(
  items: MutableOrderItem[],
  itemKey: string,
  orderId?: number
): MutableOrderItem | null {
  let key = itemKey;
  if (orderId !== undefined) {
    const prefix = `${orderId}_`;
    if (key.startsWith(prefix)) key = key.slice(prefix.length);
  }
  const { pid, noteSlug, status, comboId, comboInstanceId } = parseItemKey(key);

  for (const item of items) {
    const itemNoteSlug = (item.note ?? "").replace(/\s+/g, "_");
    const itemStatus = item.item_status || "pending";
    const itemComboIdStr = item.combo_id !== null && item.combo_id !== undefined ? String(item.combo_id) : "";
    const itemComboInstanceStr = item.combo_instance_id ?? "";

    if (String(item.product_id) === pid && itemNoteSlug === noteSlug) {
      if (status === null || itemStatus === status) {
        if (comboId === null || comboId === itemComboIdStr) {
          if (comboInstanceId === null || comboInstanceId === itemComboInstanceStr) {
            return item;
          }
        }
      }
    }
  }
  return null;
}

/** Merge items with same product_id + note + status + combo fields */
export function mergeDuplicateOrderItems(order: MutableOrder): void {
  const merged: MutableOrderItem[] = [];
  for (const item of order.items) {
    const status = item.item_status || "pending";
    const note = (item.note ?? "").trim();
    const existing = merged.find(
      (m) =>
        m.product_id === item.product_id &&
        (m.note ?? "").trim() === note &&
        (m.item_status || "pending") === status &&
        m.combo_id === item.combo_id &&
        m.combo_instance_id === item.combo_instance_id
    );
    if (existing) {
      existing.quantity = (existing.quantity ?? 0) + (item.quantity ?? 0);
    } else {
      merged.push(item);
    }
  }
  order.items = merged;
}

/** Derive order status from item statuses (legacy update_order_status_by_items) */
export function updateOrderStatusByItems(order: MutableOrder): void {
  if (!order.items || order.items.length === 0) return;
  if (order.status === "bezahlt" || order.status === "storniert") return;
  const allDone = order.items.every((i) =>
    ["confirmed", "delivered"].includes(i.item_status || "pending")
  );
  order.status = allDone ? "bestaetigt" : "eingegangen";
}

/**
 * Daily Bon number — legacy _compute_daily_bon_number counts orders with
 * today's bon_date; the migrated bestellen route uses max+1 on Berlin date.
 * We use max+1 on Berlin date here too for cross-route consistency.
 */
export async function nextDailyBonNumber(
  slug: string
): Promise<{ bonNumber: number; bonDate: string }> {
  const bonDate = berlinDateStr(getBerlinNow());
  const last = await prisma.order.findFirst({
    where: { tenant_slug: slug, bon_date: bonDate },
    orderBy: { daily_bon_number: "desc" },
    select: { daily_bon_number: true },
  });
  return { bonNumber: (last?.daily_bon_number ?? 0) + 1, bonDate };
}

export { berlinTimestamp };
