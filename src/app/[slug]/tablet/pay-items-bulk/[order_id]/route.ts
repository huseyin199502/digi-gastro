import { NextRequest, NextResponse } from "next/server";
import { ApiError, errorResponse } from "@/lib/adminApi";
import {
  findOrderItem,
  loadOrder,
  updateOrderStatusByItems,
} from "@/lib/orderItems";
import {
  ensureOriginalTotal,
  getActiveTenant,
  maybeRotateTableSessionToken,
  persistOrderOps,
  round2,
  tabletAuth,
} from "@/lib/tabletOps";
import { publishEvent } from "@/lib/eventBus";
import { consumeVoucherIfTableEmpty } from "@/lib/voucherReset";

export const dynamic = "force-dynamic";

// Legacy POST /{slug}/tablet/pay-items-bulk/{order_id} (main.py ~7037)
// Body JSON: { "items": [{ "item_key": str, "quantity": int }] }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; order_id: string }> }
) {
  try {
    const { slug: rawSlug, order_id } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const orderId = parseInt(order_id, 10);

    await getActiveTenant(slug);
    await tabletAuth(slug, ["chef", "kellner"]);

    const order = Number.isFinite(orderId)
      ? await loadOrder(slug, orderId)
      : null;
    if (!order) throw new ApiError("Bestellung nicht gefunden.", 404);
    if (order.status === "bezahlt" || order.status === "storniert") {
      throw new ApiError("Bestellung ist bereits abgeschlossen.", 400);
    }

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    const bulkItems = Array.isArray(payload.items) ? payload.items : [];

    let totalPaidAmount = 0.0;

    for (const raw of bulkItems) {
      if (!raw || typeof raw !== "object") continue;
      const info = raw as Record<string, unknown>;
      const itemKey = String(info.item_key ?? "");
      let requestedQty = parseInt(String(info.quantity), 10) || 0;
      if (requestedQty <= 0) continue;

      // Identische Produkte sind getrennte Zeilen (z.B. zwei "1× Döner").
      // findOrderItem trifft nur die erste — daher über mehrere identische
      // Zeilen "absaugen", bis die angefragte Menge erfüllt ist.
      while (requestedQty > 0) {
        const matchedItem = findOrderItem(order.items, itemKey, orderId);
        if (!matchedItem) break;
        const take = Math.min(requestedQty, matchedItem.quantity);
        totalPaidAmount += round2(take * matchedItem.price);
        requestedQty -= take;
        matchedItem.quantity -= take;
        if (matchedItem.quantity <= 0) {
          order.items = order.items.filter((i) => i !== matchedItem);
        }
      }
    }

    // Fix 6b: original_total sichern, dann total neu berechnen
    ensureOriginalTotal(order);
    order.total = round2(
      order.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    );
    order.total_with_tip = round2(order.total);

    const completed = order.items.length === 0;
    if (completed) {
      order.status = "bezahlt";
    } else {
      updateOrderStatusByItems(order);
    }

    await persistOrderOps(slug, {
      updates: [order],
      addTagesumsatz: round2(totalPaidAmount),
      incrementBestellungen: completed ? 1 : 0,
    });

    if (completed) {
      await maybeRotateTableSessionToken(slug, order.table);
      await consumeVoucherIfTableEmpty(slug, order.table);
    }

    publishEvent(slug, { type: "update" });

    return NextResponse.json({
      success: true,
      paid_amount: totalPaidAmount,
      remaining_items: order.items.length,
      order_status: order.status,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
