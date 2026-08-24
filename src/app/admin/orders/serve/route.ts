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
  MutableOrder,
  MutableOrderItem,
  persistOrder,
  updateOrderStatusByItems,
} from "@/lib/orderItems";
import { publishEvent } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

// Legacy POST /admin/orders/serve (main.py ~14034)
// Body: {"order_id": int, "item_key"?: str, "item_keys"?: str[], "all_units"?: bool}
//  - item_key + all_units=true  → komplette Restmenge der Position servieren
//  - item_keys=[...]            → mehrere Positionen in EINEM Request servieren
//  - ohne item_key(s)           → alles servieren
// Der Endpoint ist idempotent: bereits servierte Positionen werden übersprungen.
function deliverWholeItem(order: MutableOrder, matched: MutableOrderItem): void {
  const twin = order.items.find(
    (it) =>
      it !== matched &&
      it.product_id === matched.product_id &&
      (it.note ?? "").trim() === (matched.note ?? "").trim() &&
      (it.item_status || "pending") === "delivered" &&
      it.combo_id === matched.combo_id &&
      it.combo_instance_id === matched.combo_instance_id
  );
  if (twin) {
    twin.quantity += matched.quantity;
    order.items = order.items.filter((it) => it !== matched);
  } else {
    matched.item_status = "delivered";
  }
}

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
    const itemKeys = Array.isArray(payload.item_keys)
      ? payload.item_keys.map((k) => String(k))
      : null;
    const allUnits = payload.all_units === true;

    const order = await loadOrder(slug, orderId);
    if (!order) throw new ApiError("Bestellung nicht gefunden.", 404);
    if (order.status === "bezahlt" || order.status === "storniert") {
      throw new ApiError("Bestellung ist bereits abgeschlossen.", 400);
    }

    let updated = false;
    let servedCount = 0;
    let firstName = "";
    let lastKey: string | null = null;

    // Tolerantes Matching: Schlägt der exakte item_key fehl (z.B. Key-Drift
    // zwischen älterem Frontend-Bundle und Server), wird ersatzweise die erste
    // noch offene Position desselben Produkts bedient. Verhindert "Geister-
    // Positionen", die nach dem Servieren scheinbar zurückkehren.
    const ord: MutableOrder = order;
    function resolveItem(key: string): MutableOrderItem | null {
      const matched = findOrderItem(ord.items, key, orderId);
      const status = matched?.item_status || "pending";
      if (matched && status !== "delivered") return matched;
      const pid = key.split("_")[0];
      return (
        ord.items.find(
          (it) =>
            String(it.product_id) === pid &&
            (it.item_status || "pending") !== "delivered"
        ) ?? matched
      );
    }

    if (itemKeys && itemKeys.length > 0) {
      // Batch: mehrere Positionen komplett servieren
      const seenKeys = new Set<string>();
      for (const key of itemKeys) {
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        const matched = resolveItem(key);
        if (matched) {
          servedCount += matched.quantity;
          if (!firstName) firstName = matched.name ?? "Artikel";
          lastKey = key;
          deliverWholeItem(order, matched);
          updated = true;
        }
      }
    } else if (itemKey) {
      const matchedItem = resolveItem(itemKey);
      const currentStatus = matchedItem?.item_status || "pending";
      if (matchedItem && currentStatus !== "delivered") {
        if (allUnits || matchedItem.quantity <= 1) {
          servedCount = matchedItem.quantity;
          deliverWholeItem(order, matchedItem);
        } else {
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
          servedCount = 1;
        }
        firstName = matchedItem.name ?? "Artikel";
        updated = true;
      }
      lastKey = itemKey;
    } else {
      // Serve everything
      for (const item of order.items) {
        const currentStatus = item.item_status || "pending";
        if (currentStatus !== "delivered") {
          item.item_status = "delivered";
          servedCount += item.quantity;
          updated = true;
        }
      }
    }

    if (updated) {
      mergeDuplicateOrderItems(order);
      updateOrderStatusByItems(order);
      await appendAuditLog(
        slug,
        session.name || "Unbekannt",
        session.role || "unbekannt",
        itemKeys && itemKeys.length > 0
          ? `${servedCount} Artikel serviert (${firstName}${itemKeys.length > 1 ? ` +${itemKeys.length - 1}` : ""}) (Bestellung #${orderId})`
          : itemKey
            ? `Serviert: ${allUnits ? `${servedCount}x` : "1x"} ${firstName} (Bestellung #${orderId})`
            : `Alle Artikel serviert (Bestellung #${orderId})`,
        `Tisch: ${order.table}${lastKey ? `, item_key: ${lastKey}` : ""}`
      );
      await persistOrder(order);
      publishEvent(slug, { type: "update" });
    }

    // Ehrliche Antwort: served=0 heißt, es gab nichts (mehr) zu bedienen —
    // das Frontend verwirft dann seine optimistische Anzeige sofort.
    return NextResponse.json({ success: true, served: servedCount });
  } catch (err) {
    return errorResponse(err);
  }
}
