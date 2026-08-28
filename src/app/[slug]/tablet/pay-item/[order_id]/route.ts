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

// Legacy POST /{slug}/tablet/pay-item/{order_id} (main.py ~6935)
// Body JSON: { "item_key": str, "quantity": int }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; order_id: string }> }
) {
  try {
    const { slug: rawSlug, order_id } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const orderId = parseInt(order_id, 10);

    await getActiveTenant(slug);
    const auth = await tabletAuth(slug, ["chef", "kellner"]);
    const empName = auth.session?.name || "POS-Tablet";
    const empRole = auth.session?.role || "pos";

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
    const itemKey = String(payload.item_key ?? "");
    let requestedQty = parseInt(String(payload.quantity ?? "1"), 10) || 1;

    // Identische Produkte sind getrennte Zeilen → über mehrere identische
    // Zeilen "absaugen", bis die gewünschte Menge bezahlt ist.
    let paidAmount = 0;
    let paidItemName = "Artikel";
    let totalPaidQty = 0;
    while (requestedQty > 0) {
      const matchedItem = findOrderItem(order.items, itemKey, orderId);
      if (!matchedItem) break;
      const take = Math.min(requestedQty, matchedItem.quantity);
      if (take <= 0) break;
      paidAmount = round2(paidAmount + take * matchedItem.price);
      paidItemName = matchedItem.name ?? "Artikel";
      totalPaidQty += take;
      requestedQty -= take;
      matchedItem.quantity -= take;
      if (matchedItem.quantity <= 0) {
        order.items = order.items.filter((i) => i !== matchedItem);
      }
    }
    // Audit Issue 3.8: keine nicht-positiven Zahlmengen
    if (paidAmount <= 0) {
      throw new ApiError("Artikel nicht gefunden.", 404);
    }
    const qtyToPay = totalPaidQty;

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
      addTagesumsatz: paidAmount,
      incrementBestellungen: completed ? 1 : 0,
      audit: [
        {
          name: empName,
          role: empRole,
          action: `Teilzahlung ${qtyToPay}x ${paidItemName} (Bestellung #${orderId})`,
          details: `Tisch: ${order.table}, Betrag: ${paidAmount} €`,
        },
      ],
    });

    if (completed) {
      await maybeRotateTableSessionToken(slug, order.table);
      await consumeVoucherIfTableEmpty(slug, order.table);
    }

    publishEvent(slug, { type: "update" });

    return NextResponse.json({
      success: true,
      paid_amount: paidAmount,
      remaining_items: order.items.length,
      order_status: order.status,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
