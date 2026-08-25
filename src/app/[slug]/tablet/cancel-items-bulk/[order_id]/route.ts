import { NextRequest, NextResponse } from "next/server";
import { ApiError, errorResponse } from "@/lib/adminApi";
import {
  findOrderItem,
  loadOrder,
  updateOrderStatusByItems,
} from "@/lib/orderItems";
import {
  getActiveTenant,
  maybeRotateTableSessionToken,
  persistOrderOps,
  round2,
  resolveEmployeeForCancel,
  tabletAuth,
} from "@/lib/tabletOps";
import { publishEvent } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

// Legacy POST /{slug}/tablet/cancel-items-bulk/{order_id} (main.py ~7471)
// Body JSON: { "items": [{ "item_key": str, "quantity": int }], "pin": str? }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; order_id: string }> }
) {
  try {
    const { slug: rawSlug, order_id } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const orderId = parseInt(order_id, 10);

    await getActiveTenant(slug);

    // 1. POS/chef/kellner auth (ohne Fehlerabbruch)
    let auth = null as Awaited<ReturnType<typeof tabletAuth>> | null;
    try {
      auth = await tabletAuth(slug, ["chef", "kellner"]);
    } catch {
      auth = null;
    }

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    const bulkItems = Array.isArray(payload.items) ? payload.items : [];
    const pin =
      payload.pin === undefined || payload.pin === null
        ? null
        : String(payload.pin);

    // 2. PIN fallback
    const employee = await resolveEmployeeForCancel(
      slug,
      auth ?? { viaPos: false, session: null },
      pin,
      "Mitarbeiter-PIN erforderlich.",
      "Ungültige PIN."
    );

    const order = Number.isFinite(orderId)
      ? await loadOrder(slug, orderId)
      : null;
    if (!order) throw new ApiError("Bestellung nicht gefunden.", 404);
    if (order.status === "bezahlt" || order.status === "storniert") {
      throw new ApiError("Bestellung ist bereits abgeschlossen.", 400);
    }

    let totalCancelledAmount = 0.0;
    const cancelledDetailsList: string[] = [];

    for (const raw of bulkItems) {
      if (!raw || typeof raw !== "object") continue;
      const info = raw as Record<string, unknown>;
      const itemKey = String(info.item_key ?? "");
      let requestedQty = parseInt(String(info.quantity), 10) || 0;
      // Identische Produkte sind getrennte Zeilen → über mehrere identische
      // Zeilen absaugen, bis die Stornierungsmenge erfüllt ist.
      while (requestedQty > 0) {
        const matchedItem = findOrderItem(order.items, itemKey, orderId);
        if (!matchedItem) break;
        const take = Math.min(requestedQty, matchedItem.quantity);
        const cancelledAmount = round2(take * matchedItem.price);
        totalCancelledAmount += cancelledAmount;
        requestedQty -= take;
        matchedItem.quantity -= take;
        cancelledDetailsList.push(`${take}x ${matchedItem.name}`);
        if (matchedItem.quantity <= 0) {
          order.items = order.items.filter((i) => i !== matchedItem);
        }
      }
    }

    order.total = round2(
      order.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    );
    order.total_with_tip = round2(order.total);

    const emptied = order.items.length === 0;
    if (emptied) {
      order.status = "storniert";
    } else {
      updateOrderStatusByItems(order);
    }

    const audit =
      cancelledDetailsList.length > 0
        ? [
            {
              name: employee.name,
              role: employee.role,
              action: `Stornierung von ${cancelledDetailsList.join(", ")} (Bestellung #${orderId})`,
              details: `Tisch: ${order.table}, Betrag: ${totalCancelledAmount} € storniert.`,
            },
          ]
        : [];

    await persistOrderOps(slug, { updates: [order], audit });

    if (emptied) {
      await maybeRotateTableSessionToken(slug, order.table);
    }

    publishEvent(slug, { type: "update" });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
