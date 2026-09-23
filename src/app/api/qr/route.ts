import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantSession, safeEqual } from "@/lib/auth";
import { jsonError } from "@/lib/adminApi";
import { embedLogo, makeQrPng, resolveLogoFsPath } from "@/lib/qr";
import fs from "fs";

export const dynamic = "force-dynamic";

// Legacy GET /api/qr (main.py 9240)
// Serverseitige QR-Code-Erzeugung mit optionalem Logo-Overlay.
// Tokens bleiben privat (keine externen APIs).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("d") ?? "";
  if (!data) {
    return jsonError(400, "Keine Daten für QR-Code.");
  }
  const t = searchParams.get("t") ?? "";
  const z = searchParams.get("z") ?? "";

  // Slug ermitteln: Query-Param bevorzugt, sonst aus URL-Pfad von d
  let slug = searchParams.get("slug") ?? "";
  if (!slug) {
    try {
      const parsed = new URL(data);
      const pathParts = parsed.pathname.split("/").filter((p) => p);
      if (pathParts.length > 0) slug = pathParts[0];
    } catch {
      // kein gültiger URL — ignoriert wie im Legacy
    }
  }
  slug = slug.toLowerCase().trim();

  // Auth: Staff-Session des Tenants ODER gültiges pos_token_{slug}
  // (Wert muss dem tenant.pos_token entsprechen — nicht nur Cookie-Name).
  const session = await getTenantSession();
  let authorized = Boolean(session && (!slug || session.slug === slug));
  if (!authorized && slug) {
    const posCookie = request.cookies.get(`pos_token_${slug}`)?.value;
    if (posCookie) {
      const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: { pos_token: true },
      });
      if (tenant?.pos_token && safeEqual(posCookie, tenant.pos_token)) {
        authorized = true;
      }
    }
  }
  if (!authorized) {
    return jsonError(403, "Nicht autorisiert.");
  }

  // QR-Code erzeugen (ERROR_CORRECT_H, box_size=10, border=2)
  const qrPng = await makeQrPng(data);

  // Optional: Tenant-Logo mittig einbetten (best-effort, wie Legacy)
  let finalPng: Buffer = qrPng;
  if (slug) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: { logo_url: true, logo_path: true },
      });
      const logoUrl = tenant?.logo_url || tenant?.logo_path || "";
      const logoFsPath = resolveLogoFsPath(logoUrl);
      if (logoFsPath && fs.existsSync(logoFsPath)) {
        finalPng = await embedLogo(qrPng, logoFsPath);
      }
    } catch (e) {
      console.log(`[QR Logo] Could not embed logo: ${e}`);
    }
  }

  return new NextResponse(new Uint8Array(finalPng), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Disposition": `inline; filename=qr-tisch-${t}-${z}.png`,
    },
  });
}
