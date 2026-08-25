import { MutableOrder } from "./orderItems";
import { ensureOriginalTotal, round2 } from "./tabletOps";

// ──────────────────────────────────────────────────────────────────
// Split-pay core — shared by POST /{slug}/tablet/teilzahlung/{id}
// and POST /admin/orders/split-pay (legacy main.py ~6452 / ~14161).
// Matching semantics: product_id + note.trim() + combo_instance_id;
// qty = min(requested, available); paid items are removed when empty;
// original_total is ensured BEFORE the total recompute (Fix 6d).
// ──────────────────────────────────────────────────────────────────

export interface SplitResult {
  splitAmount: number;
}

export function applySplitPay(
  order: MutableOrder,
  rawItems: unknown
): SplitResult {
  const splitItems = Array.isArray(rawItems) ? rawItems : [];

  let totalSplitAmount = 0.0;
  const itemsToRemove: Set<unknown> = new Set();

  for (const raw of splitItems) {
    if (!raw || typeof raw !== "object") continue;
    const splitItem = raw as Record<string, unknown>;
    const pid = parseInt(String(splitItem.product_id), 10);
    const splitNote = String(splitItem.note ?? "").trim();
    const splitComboInst =
      splitItem.combo_instance_id === undefined ||
      splitItem.combo_instance_id === null
        ? null
        : String(splitItem.combo_instance_id);
    const itemId =
      splitItem.item_id === undefined || splitItem.item_id === null
        ? null
        : parseInt(String(splitItem.item_id), 10);
    const requestedQty = parseInt(String(splitItem.quantity), 10) || 0;

    // Bevorzugt exakt nach Item-ID (eindeutig pro Zeile): Zwei identische
    // Positionen (z.B. zwei "1× Döner") werden so getrennt bezahlt. Fallback
    // auf Composite-Key für Tablet/Legacy-Clients ohne item_id.
    const orderItem = Number.isFinite(itemId) && itemId !== null
      ? order.items.find((item) => item.id === itemId)
      : order.items.find(
          (item) =>
            item.product_id === pid &&
            (item.note ?? "").trim() === splitNote &&
            (item.combo_instance_id ?? null) === splitComboInst
        );
    if (!orderItem) continue;

    const qtyToPay = Math.min(requestedQty, orderItem.quantity);
    if (qtyToPay <= 0) continue;

    const paidItemAmount = qtyToPay * orderItem.price;
    totalSplitAmount += paidItemAmount;

    orderItem.quantity -= qtyToPay;
    if (orderItem.quantity <= 0) itemsToRemove.add(orderItem);
  }

  order.items = order.items.filter((item) => !itemsToRemove.has(item));

  // Fix 6d: original_total sichern VOR der Neuberechnung
  ensureOriginalTotal(order);
  order.total = round2(
    order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  order.total_with_tip = round2(order.total);

  return { splitAmount: round2(totalSplitAmount) };
}
