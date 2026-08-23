import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  parseFormBool,
  requireChef,
} from "@/lib/adminApi";
import { readBodyFields } from "@/lib/tabletOps";

export const dynamic = "force-dynamic";

// Legacy POST /admin/pos-config (main.py ~10206)
// Speichert POS/Kassensystem-Konfiguration (flache Tenant-Spalten).
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

    const fields = await readBodyFields(request);
    await prisma.tenant.update({
      where: { slug },
      data: {
        pos_system: String(fields.pos_system ?? "none") || "none",
        pos_api_url: String(fields.pos_api_url ?? "").trim(),
        pos_api_key: String(fields.pos_api_key ?? "").trim(),
        pos_api_secret: String(fields.pos_api_secret ?? "").trim(),
        pos_location_id: String(fields.pos_location_id ?? "").trim(),
        pos_active: parseFormBool(fields.pos_active),
      },
    });

    if (
      request.headers.get("accept")?.includes("application/json") ||
      request.headers.get("x-requested-with") === "fetch"
    ) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.redirect(
      new URL("/admin/dashboard?tab=einstellungen", request.url),
      303
    );
  } catch (err) {
    return errorResponse(err);
  }
}
