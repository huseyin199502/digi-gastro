import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  errorResponse,
  jsonError,
  parseFormBool,
  readBodyAny,
  requireChef,
} from "@/lib/adminApi";
import { nowIso } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

// Legacy POST /admin/loyalty/campaign (main.py ~16224)
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug.toLowerCase().trim();

    const body = await readBodyAny(request);
    const name = String(body.name ?? "").trim();
    const campaignType = String(body.campaign_type ?? "").trim();
    const title = String(body.title ?? "").trim();
    const message = String(body.message ?? "");
    if (!name || !campaignType || !title || !message) {
      throw new ApiError("Ungültige Daten.", 422);
    }
    if (!["geofence", "inactivity", "broadcast"].includes(campaignType)) {
      return jsonError(400, "Ungültiger Kampagnen-Typ.");
    }

    const radius = parseInt(String(body.geofence_radius_m ?? 200), 10) || 200;
    const days = parseInt(String(body.inactivity_days ?? 14), 10) || 14;
    const hours =
      parseInt(String(body.min_hours_between_pushs ?? 24), 10) || 24;

    const campaign = await prisma.loyaltyCampaign.create({
      data: {
        tenant_slug: slug,
        name,
        campaign_type: campaignType,
        title,
        message: message.trim(),
        geofence_radius_m: Math.max(50, Math.min(1000, radius)),
        inactivity_days: Math.max(1, Math.min(365, days)),
        min_hours_between_pushs: Math.max(1, Math.min(168, hours)),
        active_from: String(body.active_from ?? "00:00") || "00:00",
        active_to: String(body.active_to ?? "23:59") || "23:59",
        active_days:
          String(body.active_days ?? "") ||
          '["Mo","Di","Mi","Do","Fr","Sa","So"]',
        is_active:
          body.is_active === undefined ? true : parseFormBool(body.is_active),
        created_at: nowIso(),
      },
    });
    return NextResponse.json({ success: true, campaign_id: campaign.id });
  } catch (err) {
    return errorResponse(err);
  }
}
