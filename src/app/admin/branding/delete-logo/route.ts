import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  deleteUploadFile,
  errorResponse,
  requireChef,
} from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/branding/delete-logo (main.py ~10036)
// Body JSON: { "logo_field": "logo_url" | "logo_url_2" }
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    const logoField = String(body.logo_field ?? "");
    if (logoField !== "logo_url" && logoField !== "logo_url_2") {
      throw new ApiError("Ungültiges Feld.", 400);
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    const oldLogo =
      logoField === "logo_url"
        ? tenant?.logo_url || tenant?.logo_path || ""
        : tenant?.logo_url_2 || "";

    await prisma.tenant.update({
      where: { slug },
      data:
        logoField === "logo_url"
          ? { logo_url: "", logo_path: "" }
          : { logo_url_2: "" },
    });

    // Datei löschen (optional, non-fatal)
    if (oldLogo) deleteUploadFile(oldLogo);

    console.log(`[Logo Delete] ${slug}: ${logoField} gelöscht`);
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
