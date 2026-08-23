import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, jsonError } from "@/lib/adminApi";
import { isAppleConfigured, isGoogleConfigured } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

// Legacy GET /{slug}/loyalty/card (main.py ~14725)
// Öffentliche Stempelkarten-Info für Gäste.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();

    const card = await prisma.loyaltyCard.findFirst({
      where: { tenant_slug: slug, is_active: true },
    });
    if (!card) {
      return jsonError(404, "Keine aktive Stempelkarte vorhanden.");
    }
    const tenant = await prisma.tenant.findFirst({ where: { slug } });
    if (!tenant) {
      return jsonError(404, "Restaurant nicht gefunden.");
    }

    // Tenant-Branding für Popup-Preview (Logo)
    let tenantLogoUrl = "";
    try {
      if (tenant.logo_path) tenantLogoUrl = tenant.logo_path;
    } catch {
      // ignore
    }

    return NextResponse.json({
      card: {
        id: card.id,
        name: card.name,
        description: card.description,
        stamps_required: card.stamps_required,
        reward_name: card.reward_name,
        color_hex: card.color_hex,
        icon: card.icon,
      },
      tenant_name: tenant.name,
      tenant_logo: tenantLogoUrl,
      apple_configured: isAppleConfigured(),
      google_configured: isGoogleConfigured(),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
