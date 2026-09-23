import { NextRequest, NextResponse } from "next/server";
import { ApiError, errorResponse, requireChefOrKellner } from "@/lib/adminApi";
import { loadOrder } from "@/lib/orderItems";
import { persistOrderOps } from "@/lib/tabletOps";
import { applySplitPay } from "@/lib/splitPay";
import { publishEvent } from "@/lib/eventBus";
import { prisma } from "@/lib/prisma";
import { withLock } from "@/lib/idempotency";

export const dynamic = "force-dynamic";

// Legacy POST /admin/orders/split-pay (main.py ~14161)
// Session auth (chef/kellner). Body JSON:
//   { "order_id": int, "items": [{product_id, quantity, note?, combo_instance_id?}] }
// NOTE: No token rotation here (legacy: only the tablet variant rotates).
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

    const result = await withLock(`order:${slug}:${orderId}`, async () => {
      const order = Number.isFinite(orderId)
        ? await loadOrder(slug, orderId)
        : null;
      if (!order) throw new ApiError("Bestellung nicht gefunden.", 404);
      if (order.status === "bezahlt" || order.status === "storniert") {
        throw new ApiError("Bestellung ist bereits abgeschlossen.", 400);
      }

      const split = applySplitPay(order, payload.items);

      const completed = order.items.length === 0;
      if (completed) {
        order.status = "bezahlt";
      }

      await persistOrderOps(slug, {
        updates: [order],
        addTagesumsatz: split.splitAmount,
        incrementBestellungen: completed ? 1 : 0,
      });

      // Rabatt konsumieren, wenn der gesamte Tisch abgerechnet ist (egal ob
      // "Tisch abrechnen" oder Teilzahlung, die alles offene begleicht).
      if (completed) {
        const otherOpen = await prisma.order.count({
          where: {
            tenant_slug: slug,
            table: order.table,
            status: { notIn: ["bezahlt", "storniert"] },
          },
        });
        if (otherOpen === 0) {
          await prisma.voucher.updateMany({
            where: { tenant_slug: slug, status: "used", used_table: order.table },
            data: { status: "consumed" },
          });
        }
      }

      return {
        remaining_items_count: order.items.length,
        order_status: order.status,
        split_amount: split.splitAmount,
      };
    });

    publishEvent(slug, { type: "refresh_tables" });

    return NextResponse.json({
      success: true,
      remaining_items_count: result.remaining_items_count,
      order_status: result.order_status,
      split_amount: result.split_amount,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
