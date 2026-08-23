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

// Legacy POST /admin/loyalty/card (main.py ~16162)
// LIMIT: 1 Stempelkarte pro Tenant.
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug.toLowerCase().trim();

    const existingCount = await prisma.loyaltyCard.count({
      where: { tenant_slug: slug },
    });
    if (existingCount >= 1) {
      return jsonError(
        400,
        "Du hast bereits eine Stempelkarte. Bitte lösche zuerst die bestehende Karte, um eine neue zu erstellen."
      );
    }

    const body = await readBodyAny(request);
    const name = String(body.name ?? "").trim();
    const rewardName = String(body.reward_name ?? "").trim();
    const stampsRaw = String(body.stamps_required ?? "").trim();
    if (!name || !rewardName || !stampsRaw) {
      throw new ApiError("Ungültige Daten.", 422);
    }
    const stampsRequired = parseInt(stampsRaw, 10);
    if (!Number.isFinite(stampsRequired)) {
      throw new ApiError("Ungültige Daten.", 422);
    }
    const rewardProductIdRaw = body.reward_product_id;
    const rewardProductId =
      rewardProductIdRaw === null ||
      rewardProductIdRaw === undefined ||
      String(rewardProductIdRaw).trim() === ""
        ? null
        : parseInt(String(rewardProductIdRaw), 10) || null;
    const discount = parseInt(String(body.reward_discount_percent ?? 0), 10) || 0;

    const card = await prisma.loyaltyCard.create({
      data: {
        tenant_slug: slug,
        name,
        description: String(body.description ?? "").trim(),
        stamps_required: Math.max(1, Math.min(50, stampsRequired)),
        reward_name: rewardName,
        reward_product_id: rewardProductId,
        reward_discount_percent: Math.max(0, Math.min(100, discount)),
        color_hex: String(body.color_hex ?? "#C9A84C") || "#C9A84C",
        icon: String(body.icon ?? "local_cafe") || "local_cafe",
        is_active:
          body.is_active === undefined ? true : parseFormBool(body.is_active),
        created_at: nowIso(),
      },
    });
    return NextResponse.json({ success: true, card_id: card.id });
  } catch (err) {
    return errorResponse(err);
  }
}
