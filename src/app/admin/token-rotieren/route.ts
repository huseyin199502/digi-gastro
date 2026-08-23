import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import {
  dashboardRedirect,
  errorResponse,
  requireChef,
  wantsJson,
} from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/token-rotieren (main.py ~12052)
// Rotiert den Tenant-security_token (32 Hex-Zeichen wie secrets.token_hex(16)).
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { is_setup_completed: true },
    });
    if (!tenant?.is_setup_completed) {
      return NextResponse.redirect(new URL("/admin/setup", request.url), 303);
    }

    const newToken = crypto.randomBytes(16).toString("hex");
    await prisma.tenant.update({
      where: { slug },
      data: { security_token: newToken },
    });

    if (wantsJson(request)) {
      return NextResponse.json({ success: true });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
