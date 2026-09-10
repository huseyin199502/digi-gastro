import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, jsonError, requireChef } from "@/lib/adminApi";
import { triggerPassUpdatePush } from "@/lib/loyalty";
import { nowIso } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

// Legacy POST /admin/loyalty/customer/{customer_id}/set-stamps?stamps= (main.py ~17099)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customer_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug.toLowerCase().trim();
    const { customer_id } = await params;
    const customerId = parseInt(customer_id, 10);
    const stamps =
      parseInt(request.nextUrl.searchParams.get("stamps") ?? "0", 10) || 0;

    const customer = await prisma.loyaltyCustomer.findFirst({
      where: { tenant_slug: slug, id: customerId },
    });
    if (!customer) {
      return jsonError(404, "Kunde nicht gefunden.");
    }

    const oldStamps = customer.current_stamps ?? 0;
    const newStamps = Math.max(0, Math.min(stamps, 99));
    const now = nowIso();
    await prisma.loyaltyCustomer.update({
      where: { id: customer.id },
      data: {
        current_stamps: newStamps,
        pass_needs_update: true,
        pass_updated_at: now,
        updated_at: now,
      },
    });

    // WICHTIG: Wallet sofort aktualisieren. Ohne Push blieb z.B. Google Wallet
    // auf dem alten Stempelstand, obwohl die DB bereits den neuen hatte.
    try {
      const card = customer.card_id
        ? await prisma.loyaltyCard.findUnique({ where: { id: customer.card_id } })
        : null;
      const required = card?.stamps_required ?? 10;
      await triggerPassUpdatePush(
        { ...customer, current_stamps: newStamps },
        card?.name ?? "Stempelkarte",
        `Deine Stempel: ${newStamps}/${required}`
      );
    } catch (e) {
      console.log(`[Loyalty] set-stamps push failed (non-fatal): ${e}`);
    }

    return NextResponse.json({
      success: true,
      customer_id: customerId,
      old_stamps: oldStamps,
      new_stamps: newStamps,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
