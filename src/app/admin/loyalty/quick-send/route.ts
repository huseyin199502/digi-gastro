import { NextRequest, NextResponse } from "next/server";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";
import { prisma } from "@/lib/prisma";
import { triggerPassUpdatePush } from "@/lib/loyalty";
import { nowIso } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

// Legacy POST /admin/loyalty/quick-send (main.py ~17192)
// Body: {"message": "...", "customer_id": null|int}
// - customer_id leer/null → an ALLE Kunden (push_opt_out=false)
// - customer_id gesetzt → nur an diesen einen Kunden
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug.toLowerCase().trim();

    let payload: { message?: unknown; customer_id?: unknown };
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }
    const message = String(payload.message ?? "").trim();
    const customerId = payload.customer_id
      ? parseInt(String(payload.customer_id), 10)
      : null;
    if (!message) {
      throw new ApiError("Nachricht erforderlich.", 400);
    }

    const customers = await prisma.loyaltyCustomer.findMany({
      where: {
        tenant_slug: slug,
        push_opt_out: false,
        ...(customerId ? { id: customerId } : {}),
      },
      select: {
        id: true,
        pass_serial: true,
        pass_type: true,
        tenant_slug: true,
        current_stamps: true,
        last_message: true,
        msg_nonce: true,
        last_push_at: true,
      },
    });
    if (customers.length === 0) {
      throw new ApiError("Keine Kunden gefunden.", 404);
    }

    // User-Wunsch: Nur Nachricht (ohne Titel-Präfix) in Push-Notification
    const fullMsg = message.slice(0, 200);
    const stats = { pushs_sent: 0, pushs_failed: 0 };

    for (const customer of customers) {
      // CRITICAL: last_message = saubere Nachricht (KEINE Uhrzeit), msg_nonce++
      // → ändert sich IMMER → triggert changeMessage → Notification erscheint
      await prisma.loyaltyCustomer.update({
        where: { id: customer.id },
        data: {
          last_message: fullMsg,
          updated_at: nowIso(),
          msg_nonce: (customer.msg_nonce ?? 0) + 1,
          pass_needs_update: true,
          pass_updated_at: nowIso(),
        },
      });

      const success = await triggerPassUpdatePush(customer, "", message);
      if (success) {
        await prisma.loyaltyCustomer.update({
          where: { id: customer.id },
          data: { last_push_at: nowIso() },
        });
        await prisma.loyaltyPushLog.create({
          data: {
            tenant_slug: slug,
            customer_id: customer.id,
            campaign_id: null,
            push_type: "quick_send",
            title: "",
            message,
            status: "sent",
            sent_at: nowIso(),
          },
        });
        stats.pushs_sent += 1;
      } else {
        stats.pushs_failed += 1;
      }
    }

    return NextResponse.json({ success: true, stats });
  } catch (err) {
    return errorResponse(err);
  }
}