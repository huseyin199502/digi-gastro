import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, jsonError } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /{slug}/loyalty/opt-out (main.py ~16031)
// DSGVO: Kunde meldet sich von Push-Benachrichtigungen ab.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();

    const cidCookie = request.cookies.get(`loyalty_${slug}_cid`)?.value;
    if (!cidCookie) {
      return jsonError(404, "Keine Stempelkarte gefunden.");
    }
    const cid = parseInt(cidCookie, 10);
    if (Number.isNaN(cid)) {
      return jsonError(404, "Keine Stempelkarte gefunden.");
    }
    const customer = await prisma.loyaltyCustomer.findFirst({
      where: { tenant_slug: slug, id: cid },
    });
    if (!customer) {
      return jsonError(404, "Kunde nicht gefunden.");
    }

    await prisma.loyaltyCustomer.update({
      where: { id: customer.id },
      data: { push_opt_out: true },
    });
    return NextResponse.json({
      success: true,
      message:
        "Du wurdest erfolgreich von Push-Benachrichtigungen abgemeldet.",
    });
  } catch (err) {
    return errorResponse(err);
  }
}
