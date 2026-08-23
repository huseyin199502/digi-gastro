import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/renew-kds-secret (main.py ~6353)
// Rotiert KDS-Pairing-Secret. (Legacy setzt zusätzlich restaurant["kds_token"],
// das aber nie als DB-Spalte persistiert wurde — daher nur kds_secret.)
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const newSecret = crypto.randomBytes(18).toString("base64url");
    await prisma.tenant.update({
      where: { slug },
      data: { kds_secret: newSecret },
    });

    if (
      request.headers.get("accept")?.includes("application/json") ||
      request.headers.get("x-requested-with") === "fetch"
    ) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.redirect(
      new URL("/admin/dashboard?tab=config", request.url),
      303
    );
  } catch (err) {
    return errorResponse(err);
  }
}
