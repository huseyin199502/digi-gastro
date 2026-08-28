import { NextRequest, NextResponse } from "next/server";
import { ApiError, errorResponse } from "@/lib/adminApi";
import { loadOrder } from "@/lib/orderItems";
import {
  ensureOriginalTotal,
  getActiveTenant,
  maybeRotateTableSessionToken,
  persistOrderOps,
  readBodyFields,
  resolveEmployeeForCancel,
  tabletAuth,
} from "@/lib/tabletOps";
import { publishEvent } from "@/lib/eventBus";
import { consumeVoucherIfTableEmpty } from "@/lib/voucherReset";

export const dynamic = "force-dynamic";

// Legacy POST /{slug}/tablet/stornieren/{order_id} (main.py ~6661)
// Auth: POS cookie OR chef/kellner session, fallback to staff PIN (Form field).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; order_id: string }> }
) {
  try {
    const { slug: rawSlug, order_id } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const orderId = parseInt(order_id, 10);

    await getActiveTenant(slug);

    // 1. POS/chef/kellner auth (without throwing on failure)
    let auth = null as Awaited<ReturnType<typeof tabletAuth>> | null;
    try {
      auth = await tabletAuth(slug, ["chef", "kellner"]);
    } catch {
      auth = null;
    }

    // 2. PIN fallback
    const fields = await readBodyFields(request);
    const employee = await resolveEmployeeForCancel(
      slug,
      auth ?? { viaPos: false, session: null },
      fields.pin ?? null,
      "Mitarbeiter-PIN erforderlich.",
      "Ungültige PIN oder keine Berechtigung für Stornierung."
    );

    const order = Number.isFinite(orderId)
      ? await loadOrder(slug, orderId)
      : null;
    if (!order) throw new ApiError("Bestellung nicht gefunden.", 404);

    order.status = "storniert";

    // Fix 6: original_total backfillen (total bleibt unangetastet)
    ensureOriginalTotal(order);

    await persistOrderOps(slug, {
      updates: [order],
      audit: [
        {
          name: employee.name,
          role: employee.role,
          action: `Stornierung der Bestellung #${orderId}`,
          details: `Tisch: ${order.table}, Betrag: ${order.total} € storniert.`,
        },
      ],
    });

    // Option B: Token-Rotation nur wenn keine offenen Bestellungen mehr
    await maybeRotateTableSessionToken(slug, order.table);
    // Rabatt konsumieren, wenn der ganze Tisch abgerechnet ist
    await consumeVoucherIfTableEmpty(slug, order.table);

    publishEvent(slug, { type: "refresh_tables" });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
