import { NextRequest, NextResponse } from "next/server";
import { ApiError, errorResponse } from "@/lib/adminApi";
import { loadOrder } from "@/lib/orderItems";
import {
  ensureOriginalTotal,
  getActiveTenant,
  maybeRotateTableSessionToken,
  persistOrderOps,
  readBodyFields,
  round2,
  tabletAuth,
} from "@/lib/tabletOps";
import { sendBonToPrinter, sendOrderToPos } from "@/lib/posWebhook";
import { publishEvent } from "@/lib/eventBus";
import { consumeVoucherIfTableEmpty } from "@/lib/voucherReset";

export const dynamic = "force-dynamic";

// Legacy POST /{slug}/tablet/bezahlen/{order_id} (main.py ~6372)
// Form/JSON body: waiter_id (optional)
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

    const order = Number.isFinite(orderId)
      ? await loadOrder(slug, orderId)
      : null;
    if (!order) throw new ApiError("Bestellung nicht gefunden.", 404);

    // Audit Fix 1.1: bezahl darf storniert-Status nicht überschreiben
    if (order.status === "storniert") {
      return NextResponse.json({
        success: true,
        already_done: true,
        detail: "Bestellung ist bereits storniert — nicht bezahlbar.",
      });
    }

    const fields = await readBodyFields(request);
    const waiterId = fields.waiter_id ?? null;

    if (order.status !== "bezahlt") {
      order.status = "bezahlt";
      // Audit Fix 3.x: tip_amount NICHT löschen, falls zuvor gesetzt
      if (order.tip_amount === null || order.tip_amount === undefined) {
        order.tip_amount = 0;
      }
      order.total_with_tip = round2(
        (order.total ?? 0) + (order.tip_amount ?? 0)
      );
      order.waiter_id = waiterId;

      // Fix 6: original_total sicherstellen (für Admin-Report)
      ensureOriginalTotal(order);

      // Ermittle Mitarbeiter-Namen für Audit-Log
      const empName = auth.session?.name || "POS-Tablet";
      const empRole = auth.session?.role || "pos";

      await persistOrderOps(slug, {
        updates: [order],
        addTagesumsatz: order.total ?? 0,
        incrementBestellungen: 1,
        audit: [
          {
            name: empName,
            role: empRole,
            action: `Bezahlung Bestellung #${orderId}`,
            details: `Tisch: ${order.table ?? "?"}, Betrag: ${(order.total ?? 0).toFixed(2)} €, Trinkgeld: ${(order.tip_amount ?? 0).toFixed(2)} €`,
          },
        ],
      });

      // Option B: Token-Rotation nur wenn keine offenen Bestellungen mehr
      await maybeRotateTableSessionToken(slug, order.table);
      // Rabatt konsumieren, wenn der ganze Tisch abgerechnet ist
      await consumeVoucherIfTableEmpty(slug, order.table);
    } else {
      await persistOrderOps(slug, { updates: [order] });
    }

    // POS Webhook + Bon-Druck (fire-and-forget wie im Legacy)
    try {
      await sendOrderToPos(slug, order);
      await sendBonToPrinter(slug, order, "receipt");
    } catch (e) {
      console.log(`[POS/Bon] Fehler im Hintergrund: ${e}`);
    }

    publishEvent(slug, { type: "refresh_tables" });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
