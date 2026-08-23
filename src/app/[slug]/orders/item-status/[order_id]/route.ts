import { NextRequest, NextResponse } from "next/server";
import { ApiError, errorResponse } from "@/lib/adminApi";
import {
  findOrderItem,
  loadOrder,
  updateOrderStatusByItems,
} from "@/lib/orderItems";
import {
  getActiveTenant,
  persistOrderOps,
  tabletAuth,
} from "@/lib/tabletOps";
import { publishEvent } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

// Legacy POST /{slug}/orders/item-status/{order_id} and
// POST /{slug}/tablet/item-status/{order_id} (main.py ~7730, dual path)
// Body JSON: { "item_key": str, "status": "confirmed" | "delivered" }
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

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    const itemKey = String(payload.item_key ?? "");
    const newStatus = String(payload.status ?? "");

    if (newStatus !== "confirmed" && newStatus !== "delivered") {
      throw new ApiError(
        "Ungültiger Status. Erlaubt: confirmed, delivered",
        400
      );
    }

    const order = Number.isFinite(orderId)
      ? await loadOrder(slug, orderId)
      : null;
    if (!order) throw new ApiError("Bestellung nicht gefunden.", 404);
    if (order.status === "bezahlt" || order.status === "storniert") {
      throw new ApiError("Bestellung ist bereits abgeschlossen.", 400);
    }

    const matchedItem = findOrderItem(order.items, itemKey, orderId);
    if (!matchedItem) throw new ApiError("Artikel nicht gefunden.", 404);

    matchedItem.item_status = newStatus;
    updateOrderStatusByItems(order);

    await persistOrderOps(slug, { updates: [order] });

    publishEvent(slug, { type: "update" });

    return NextResponse.json({
      success: true,
      item_key: itemKey,
      new_status: newStatus,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
