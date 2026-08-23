import { NextRequest, NextResponse } from "next/server";
import { ApiError, errorResponse } from "@/lib/adminApi";
import { loadOrder } from "@/lib/orderItems";
import {
  getActiveTenant,
  maybeRotateTableSessionToken,
  persistOrderOps,
  tabletAuth,
} from "@/lib/tabletOps";
import { applySplitPay } from "@/lib/splitPay";
import { publishEvent } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

// Legacy POST /{slug}/tablet/teilzahlung/{order_id} (main.py ~6452)
// Body JSON: { "items": [{product_id, quantity, note?, combo_instance_id?}] }
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

    const result = applySplitPay(order, payload.items);

    const completed = order.items.length === 0;
    if (completed) {
      order.status = "bezahlt";
    }

    await persistOrderOps(slug, {
      updates: [order],
      addTagesumsatz: result.splitAmount,
      incrementBestellungen: completed ? 1 : 0,
    });

    if (completed) {
      // Option B: Token-Rotation nur wenn keine offenen Bestellungen mehr
      await maybeRotateTableSessionToken(slug, order.table);
    }

    publishEvent(slug, { type: "refresh_tables" });

    return NextResponse.json({
      success: true,
      remaining_items_count: order.items.length,
      order_status: order.status,
      split_amount: result.splitAmount,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
