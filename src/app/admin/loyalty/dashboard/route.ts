import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";
import { getCustomerAnalytics } from "@/lib/loyalty";
import { isAppleConfigured, isGoogleConfigured } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

// Legacy GET /admin/loyalty/dashboard (main.py ~16057)
// Analytics-Übersicht für Admin.
export async function GET() {
  try {
    const session = await requireChef();
    const slug = session.slug.toLowerCase().trim();

    const [analytics, cards, campaigns, geofence, tenant] = await Promise.all([
      getCustomerAnalytics(slug),
      prisma.loyaltyCard.findMany({ where: { tenant_slug: slug } }),
      prisma.loyaltyCampaign.findMany({ where: { tenant_slug: slug } }),
      prisma.tenantGeofence.findFirst({
        where: { tenant_slug: slug, is_primary: true },
      }),
      prisma.tenant.findUnique({ where: { slug } }),
    ]);

    return NextResponse.json({
      analytics,
      tenant: {
        name: tenant?.name ?? "",
        logo_url: tenant?.logo_path ?? "",
        slug,
      },
      cards: cards.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        stamps_required: c.stamps_required,
        reward_name: c.reward_name,
        is_active: c.is_active,
        color_hex: c.color_hex,
        icon: c.icon,
      })),
      campaigns: campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        campaign_type: c.campaign_type,
        title: c.title,
        message: c.message,
        geofence_radius_m: c.geofence_radius_m,
        inactivity_days: c.inactivity_days,
        min_hours_between_pushs: c.min_hours_between_pushs,
        active_from: c.active_from,
        active_to: c.active_to,
        active_days: c.active_days,
        is_active: c.is_active,
      })),
      geofence: geofence
        ? {
            latitude: geofence.latitude,
            longitude: geofence.longitude,
            address: geofence.address,
            name: geofence.name,
          }
        : null,
      apple_configured: isAppleConfigured(),
      google_configured: isGoogleConfigured(),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
