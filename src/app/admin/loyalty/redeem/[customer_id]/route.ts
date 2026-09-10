import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChefOrKellner } from "@/lib/adminApi";
import { triggerPassUpdatePush } from "@/lib/loyalty";
import { nowIso } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

// Legacy POST /admin/loyalty/redeem/{customer_id} (main.py ~17276)
// Löst die Prämie ein → current_stamps = 0, Pass-Update-Push.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ customer_id: string }> }
) {
  try {
    const session = await requireChefOrKellner();
    const slug = session.slug;

    const { customer_id } = await params;
    const customerId = parseInt(customer_id, 10);

    const customer = await prisma.loyaltyCustomer.findFirst({
      where: { id: customerId, tenant_slug: slug },
    });
    if (!customer) throw new ApiError("Kunde nicht gefunden.", 404);

    const card = await prisma.loyaltyCard.findUnique({
      where: { id: customer.card_id },
    });
    if (!card) throw new ApiError("Karte nicht gefunden.", 404);

    const stampsRequired = card.stamps_required ?? 10;
    if ((customer.current_stamps ?? 0) < stampsRequired) {
      throw new ApiError(
        `Kunde hat erst ${customer.current_stamps ?? 0}/${stampsRequired} Stempel — Prämie noch nicht bereit.`,
        400
      );
    }

    const oldStamps = customer.current_stamps ?? 0;
    const now = nowIso();

    // Im Manual-Stamp-Flow wird der Reward bereits beim Erreichen des Limits
    // gezählt (Stempel sind dann alle als redeemed markiert). Hier nur zählen,
    // wenn noch un-abgerechnete Stempel existieren — sonst Double-Count.
    const unredeemed = await prisma.loyaltyStamp.count({
      where: {
        customer_id: customer.id,
        card_id: card.id,
        is_redeemed: false,
      },
    });

    await prisma.loyaltyCustomer.update({
      where: { id: customer.id },
      data: {
        current_stamps: 0,
        ...(unredeemed > 0 ? { rewards_redeemed: { increment: 1 } } : {}),
        updated_at: now,
        pass_needs_update: true,
        pass_updated_at: now,
      },
    });

    await prisma.loyaltyStamp.updateMany({
      where: { customer_id: customer.id, card_id: card.id, is_redeemed: false },
      data: { is_redeemed: true, redeemed_at: now },
    });

    try {
      // Balance muss die NEUE (0) sein — `customer` enthält noch den alten
      // Stand, Google-Wallet-Pushes würden sonst z.B. 15 Stempel zeigen.
      await triggerPassUpdatePush(
        { ...customer, current_stamps: 0 },
        card.name,
        `Prämie eingelöst: ${card.reward_name}!`
      );
    } catch (e) {
      console.log(`[Loyalty] Reward redeem push failed: ${e}`);
    }

    return NextResponse.json({
      success: true,
      customer_id: customerId,
      reward_name: card.reward_name,
      old_stamps: oldStamps,
      new_stamps: 0,
    });
  } catch (err) {
    return errorResponse(err);
  }
}