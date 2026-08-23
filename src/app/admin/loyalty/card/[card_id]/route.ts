import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, jsonError, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy DELETE /admin/loyalty/card/{card_id} (main.py ~16208)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ card_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug.toLowerCase().trim();
    const { card_id } = await params;
    const cardId = parseInt(card_id, 10);

    const card = await prisma.loyaltyCard.findFirst({
      where: { tenant_slug: slug, id: cardId },
    });
    if (!card) {
      return jsonError(404, "Stempelkarte nicht gefunden.");
    }
    await prisma.loyaltyCard.delete({ where: { id: card.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
