import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  applyLegalPlaceholders,
  errorResponse,
  requireChef,
  saveLogoFile,
} from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/branding (main.py ~10091)
// Multipart-Form: logo_file, logo_file_2 (Uploads) + address/plz/ort/
// instagram/facebook/tiktok/theme/logo_url/logo_url_2.
// Branding ist im migrierten Schema in flache Tenant-Spalten aufgelöst.
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) {
      return NextResponse.redirect(new URL("/admin/setup", request.url), 303);
    }
    if (!tenant.is_setup_completed) {
      return NextResponse.redirect(new URL("/admin/setup", request.url), 303);
    }

    const form = await request.formData();
    const logoUrlField = form.get("logo_url");
    const logoUrl2Field = form.get("logo_url_2");
    const address = form.get("address");
    const plz = form.get("plz");
    const ort = form.get("ort");
    const instagram = form.get("instagram");
    const facebook = form.get("facebook");
    const tiktok = form.get("tiktok");
    const theme = form.get("theme");

    // Fallback auf bestehende Werte, wenn Feld nicht (oder leer) gesendet
    let finalLogoUrl =
      logoUrlField !== null && String(logoUrlField).trim() !== ""
        ? String(logoUrlField).trim()
        : tenant.logo_url || tenant.logo_path || "";
    let finalLogoUrl2 =
      logoUrl2Field !== null && String(logoUrl2Field).trim() !== ""
        ? String(logoUrl2Field).trim()
        : tenant.logo_url_2 || "";

    // BUG-FIX-Port: explizite Logo-Löschung via delete_logo=1
    const deleteLogo =
      request.nextUrl.searchParams.get("delete_logo") ||
      String(form.get("delete_logo") ?? "");
    if (deleteLogo === "1") {
      if (logoUrlField !== null && String(logoUrlField).trim() === "") {
        finalLogoUrl = "";
      }
      if (logoUrl2Field !== null && String(logoUrl2Field).trim() === "") {
        finalLogoUrl2 = "";
      }
    }

    // Logo-Uploads verarbeiten
    const logoFile = form.get("logo_file");
    if (logoFile instanceof File && logoFile.name) {
      finalLogoUrl = await saveLogoFile(slug, "logo", logoFile);
    }
    const logoFile2 = form.get("logo_file_2");
    if (logoFile2 instanceof File && logoFile2.name) {
      finalLogoUrl2 = await saveLogoFile(slug, "logo2", logoFile2);
    }

    const newAddress = address !== null ? String(address).trim() : "";
    const updateData: Record<string, unknown> = {
      logo_url: finalLogoUrl,
      logo_path: finalLogoUrl,
      logo_url_2: finalLogoUrl2,
      address: newAddress,
      plz: plz !== null ? String(plz).trim() : "",
      ort: ort !== null ? String(ort).trim() : "",
      instagram: instagram !== null ? String(instagram).trim() : "",
      facebook: facebook !== null ? String(facebook).trim() : "",
      tiktok: tiktok !== null ? String(tiktok).trim() : "",
    };
    if (theme !== null && String(theme)) {
      updateData.theme = String(theme);
    }

    // Legal-Platzhalter mit neuen Branding-Daten ersetzen
    const legal = applyLegalPlaceholders({
      name: tenant.name,
      email: tenant.email,
      address: newAddress,
      plz: updateData.plz as string,
      ort: updateData.ort as string,
      impressum_content: tenant.impressum_content,
      datenschutz_content: tenant.datenschutz_content,
    });
    updateData.impressum_content = legal.impressum;
    updateData.datenschutz_content = legal.datenschutz;

    await prisma.tenant.update({ where: { slug }, data: updateData });

    if (
      request.headers.get("accept")?.includes("application/json") ||
      request.headers.get("x-requested-with") === "fetch"
    ) {
      return NextResponse.json({
        success: true,
        logo_url: finalLogoUrl,
        logo_url_2: finalLogoUrl2,
      });
    }
    return NextResponse.redirect(
      new URL("/admin/dashboard?tab=config", request.url),
      303
    );
  } catch (err) {
    return errorResponse(err);
  }
}
