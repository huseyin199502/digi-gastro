import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/renew-pos-secret (main.py ~6336)
// Rotiert POS-Pairing-Secret + pos_token → gekoppelte POS-Tablets
// bekommen beim nächsten Status-Poll einen 401/Auto-Kick.
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const newSecret = crypto.randomBytes(18).toString("base64url");
    const newToken = crypto.randomBytes(8).toString("hex");
    await prisma.tenant.update({
      where: { slug },
      data: { pos_secret: newSecret, pos_token: newToken },
    });

    const url = new URL("/admin/dashboard", request.url);
    url.hash = "landingpage";
    if (
      request.headers.get("accept")?.includes("application/json") ||
      request.headers.get("x-requested-with") === "fetch"
    ) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.redirect(url, 303);
  } catch (err) {
    return errorResponse(err);
  }
}
