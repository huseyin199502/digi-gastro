import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChefOrKellner } from "@/lib/adminApi";
import { findCustomerByShortCode } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

// Legacy GET /admin/loyalty/lookup-customer?code=XXXX (main.py ~17467)
// Live-Preview eines Kunden per Short-Code — ohne Stempel zu vergeben.
export async function GET(request: NextRequest) {
  try {
    const session = await requireChefOrKellner();
    const slug = session.slug;

    const code = (request.nextUrl.searchParams.get("code") ?? "").trim();
    if (!code) {
      return NextResponse.json({ exists: false });
    }

    const customer = await findCustomerByShortCode(slug, code);
    if (!customer) {
      return NextResponse.json({ exists: false });
    }

    const card = await prisma.loyaltyCard.findUnique({
      where: { id: customer.card_id },
    });

    return NextResponse.json({
      exists: true,
      customer_id: customer.id,
      nickname: customer.nickname || `Kunde ${customer.short_code}`,
      tier: customer.tier || "neu",
      current_stamps: customer.current_stamps ?? 0,
      stamps_required: card?.stamps_required ?? 10,
      reward_name: card?.reward_name ?? "",
      card_name: card?.name ?? "",
    });
  } catch (err) {
    return errorResponse(err);
  }
}