import { NextRequest, NextResponse } from "next/server";
import {
  appendAuditLog,
  ApiError,
  errorResponse,
  requireChefOrKellner,
} from "@/lib/adminApi";
import {
  findOrderItem,
  loadOrder,
  mergeDuplicateOrderItems,
  MutableOrderItem,
  persistOrder,
  updateOrderStatusByItems,
} from "@/lib/orderItems";
import { publishEvent } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

// ── In-memory serve dedup (legacy _check_serve_dedup, 5s TTL, single-worker) ──
const serveDedupCache = new Map<string, number>();
const SERVE_DEDUP_TTL_MS = 5000;

function checkServeDedup(orderId: number, itemKey: string | null): boolean {
  const key = `${orderId}:${itemKey ?? "all"}`;
  const now = Date.now();
  for (const [k, t] of serveDedupCache) {
    if (now - t > SERVE_DEDUP_TTL_MS * 2) serveDedupCache.delete(k);
  }
  const last = serveDedupCache.get(key);
  if (last !== undefined && now - last < SERVE_DEDUP_TTL_MS) return true;
  serveDedupCache.set(key, now);
  return false;
}

// Legacy POST /admin/orders/serve (main.py ~14034)
// Body: {"order_id": int, "item_key": "pid_note_status[_combo[_instance]_idx]"?}
export async function POST(request: NextRequest) {
  try {
    const session = await requireChefOrKellner();
    const slug = session.slug;

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    const orderId = parseInt(String(payload.order_id), 10);
    if (!Number.isFinite(orderId)) {
      throw new ApiError("Bestellung nicht gefunden.", 404);
    }
    const itemKey =
      payload.item_key === undefined || payload.item_key === null
        ? null
        : String(payload.item_key);

    if (checkServeDedup(orderId, itemKey)) {
      return NextResponse.json({ success: true, dedup: true });
    }

    const order = await loadOrder(slug, orderId);
    if (!order) throw new ApiError("Bestellung nicht gefunden.", 404);
    if (order.status === "bezahlt" || order.status === "storniert") {
      throw new ApiError("Bestellung ist bereits abgeschlossen.", 400);
    }

    let updated = false;
    let matchedItem: MutableOrderItem | null = null;

    if (itemKey) {
      matchedItem = findOrderItem(order.items, itemKey, orderId);
      const currentStatus = matchedItem?.item_status || "pending";
      if (matchedItem && currentStatus !== "delivered") {
        if (matchedItem.quantity > 1) {
          // Serve one unit: decrement and track it in a delivered item
          matchedItem.quantity -= 1;
          const deliveredItem = order.items.find(
            (it) =>
              it.product_id === matchedItem!.product_id &&
              (it.note ?? "").trim() === (matchedItem!.note ?? "").trim() &&
              (it.item_status || "pending") === "delivered" &&
              it.combo_id === matchedItem!.combo_id &&
              it.combo_instance_id === matchedItem!.combo_instance_id
          );
          if (deliveredItem) {
            deliveredItem.quantity += 1;
          } else {
            order.items.push({
              ...matchedItem,
              quantity: 1,
              item_status: "delivered",
            });
          }
        } else {
          // Mark as delivered, merge with an existing delivered twin if any
          matchedItem.item_status = "delivered";
          const deliveredItem = order.items.find(
            (it) =>
              it !== matchedItem &&
              it.product_id === matchedItem!.product_id &&
              (it.note ?? "").trim() === (matchedItem!.note ?? "").trim() &&
              (it.item_status || "pending") === "delivered" &&
              it.combo_id === matchedItem!.combo_id &&
              it.combo_instance_id === matchedItem!.combo_instance_id
          );
          if (deliveredItem) {
            deliveredItem.quantity += matchedItem.quantity;
            order.items = order.items.filter((it) => it !== matchedItem);
          }
        }
        updated = true;
      }
    } else {
      // Serve everything
      for (const item of order.items) {
        const currentStatus = item.item_status || "pending";
        if (currentStatus !== "delivered") {
          item.item_status = "delivered";
          updated = true;
        }
      }
    }

    if (updated) {
      mergeDuplicateOrderItems(order);
      updateOrderStatusByItems(order);
      if (itemKey) {
        await appendAuditLog(
          slug,
          session.name || "Unbekannt",
          session.role || "unbekannt",
          `Serviert: 1x ${matchedItem?.name ?? "Artikel"} (Bestellung #${orderId})`,
          `Tisch: ${order.table}, item_key: ${itemKey}`
        );
      } else {
        await appendAuditLog(
          slug,
          session.name || "Unbekannt",
          session.role || "unbekannt",
          `Alle Artikel serviert (Bestellung #${orderId})`,
          `Tisch: ${order.table}`
        );
      }
      await persistOrder(order);
      publishEvent(slug, { type: "update" });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
