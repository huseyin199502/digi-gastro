import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requirePlatformAdmin } from "@/lib/adminApi";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /digi-gastro-admin/tenant-impersonate/{slug}
// Superadmin loggt sich per Klick direkt als Tenant ein (ohne Passwort).
// Setzt die Tenant-Session-Cookie und leitet zum Tenant-Admin weiter.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { slug } = await params;
    const slugLower = slug.toLowerCase().trim();

    const tenant = await prisma.tenant.findUnique({ where: { slug: slugLower } });
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Tenant nicht gefunden." },
        { status: 404 }
      );
    }
    if (tenant.active === false) {
      return NextResponse.json(
        { success: false, error: "Tenant ist deaktiviert." },
        { status: 400 }
      );
    }

    const sessionValue = `${tenant.slug}:Owner:chef:${tenant.password}`;
    const proto =
      request.headers.get("x-forwarded-proto") ??
      new URL(request.url).protocol.replace(":", "");
    const secure = process.env.COOKIE_SECURE === "1" && proto === "https";
    const res = NextResponse.redirect(
      new URL(`/${tenant.slug}/admin`, request.url),
      303
    );
    res.cookies.set(SESSION_COOKIE, sessionValue, {
      ...sessionCookieOptions(),
      secure,
    });
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}