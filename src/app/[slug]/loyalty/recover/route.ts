import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, jsonError } from "@/lib/adminApi";
import { loyaltyCookieSecure } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

// Legacy POST /{slug}/loyalty/recover (main.py ~14898)
// Recovery: Kunde gibt seinen 4-stelligen Code vom Wallet-Pass ein.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const shortCode = String(body.short_code ?? "").trim().toUpperCase();
    const anonymousId = String(body.anonymous_id ?? "").trim();

    if (!shortCode || shortCode.length < 3) {
      return jsonError(400, "Bitte gültigen Code eingeben");
    }

    // Customer via short_code finden
    let customer = await prisma.loyaltyCustomer.findFirst({
      where: { tenant_slug: slug, short_code: shortCode },
    });
    if (!customer) {
      return jsonError(
        404,
        "Code nicht gefunden. Bitte überprüfe deinen Code im Wallet-Pass."
      );
    }

    // anonymous_id verknüpfen (falls nicht bereits)
    if (anonymousId && customer.anonymous_id !== anonymousId) {
      await prisma.loyaltyCustomer.update({
        where: { id: customer.id },
        data: { anonymous_id: anonymousId },
      });
      customer = { ...customer, anonymous_id: anonymousId };
      console.log(
        `[Loyalty Recovery] Customer ${customer.id} verknüpft mit neuer anonymous_id (kurz: ${anonymousId.slice(0, 8)}...)`
      );
    }

    // Karte laden für Response
    const card = await prisma.loyaltyCard.findFirst({
      where: { id: customer.card_id },
    });

    // _cid Cookie via HTTP-Header setzen (überlebt Safari ITP!)
    const response = NextResponse.json({
      success: true,
      customer_id: customer.id,
      current_stamps: customer.current_stamps,
      stamps_required: card ? card.stamps_required : 0,
      tier: customer.tier,
      rewards_redeemed: customer.rewards_redeemed,
    });
    const secure = loyaltyCookieSecure(request);
    response.cookies.set(`loyalty_${slug}_cid`, String(customer.id), {
      httpOnly: true,
      maxAge: 31536000,
      sameSite: "lax",
      secure,
      path: "/",
    });
    // 'saved' Cookie auch setzen (Popup-Suppression)
    if (customer.pass_downloaded_at) {
      response.cookies.set(`loyalty_${slug}`, "saved", {
        httpOnly: false,
        maxAge: 31536000,
        sameSite: "lax",
        secure,
        path: "/",
      });
    }
    console.log(
      `[Loyalty Recovery] ✅ Customer ${customer.id} recovered via short_code ${shortCode}`
    );
    return response;
  } catch (err) {
    return errorResponse(err);
  }
}
