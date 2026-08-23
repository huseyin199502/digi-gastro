import { NextResponse } from "next/server";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";
import { prisma } from "@/lib/prisma";
import { triggerPassUpdatePush } from "@/lib/loyalty";
import { nowIso } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

// Legacy POST /admin/loyalty/broadcast/{campaign_id} (main.py ~17332)
// Sendet eine Broadcast-Kampagne an ALLE Kunden des Tenants.
// Opt-out Kunden werden respektiert (DSGVO), Cooldown wird respektiert (Anti-Spam).
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ campaign_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug.toLowerCase().trim();
    const { campaign_id } = await params;
    const campaignId = parseInt(campaign_id, 10);
    if (!Number.isFinite(campaignId)) {
      throw new ApiError("Ungültige Kampagnen-ID.", 400);
    }

    const campaign = await prisma.loyaltyCampaign.findFirst({
      where: {
        id: campaignId,
        tenant_slug: slug,
        campaign_type: "broadcast",
      },
    });
    if (!campaign) {
      throw new ApiError("Broadcast-Kampagne nicht gefunden.", 404);
    }
    if (!campaign.is_active) {
      throw new ApiError("Kampagne ist pausiert.", 400);
    }

    const customers = await prisma.loyaltyCustomer.findMany({
      where: { tenant_slug: slug, push_opt_out: false },
      select: {
        id: true,
        pass_serial: true,
        pass_type: true,
        tenant_slug: true,
        last_message: true,
        msg_nonce: true,
        last_push_at: true,
      },
    });

    const cooldownHours = campaign.min_hours_between_pushs ?? 24;
    const now = new Date().getTime();
    const stats = {
      pushs_sent: 0,
      pushs_skipped_optout: 0,
      pushs_skipped_cooldown: 0,
    };

    for (const customer of customers) {
      // Cooldown prüfen
      if (customer.last_push_at) {
        const lastPush = new Date(
          String(customer.last_push_at).replace(" ", "T").replace(/Z$/, "+00:00")
        ).getTime();
        if (Number.isFinite(lastPush) && now - lastPush < cooldownHours * 3600000) {
          stats.pushs_skipped_cooldown += 1;
          continue;
        }
      }

      const fullMsg = (campaign.message ?? "").slice(0, 200);
      await prisma.loyaltyCustomer.update({
        where: { id: customer.id },
        data: {
          last_message: fullMsg,
          updated_at: nowIso(),
          msg_nonce: (customer.msg_nonce ?? 0) + 1,
          pass_needs_update: true,
          pass_updated_at: nowIso(),
        },
      });

      const success = await triggerPassUpdatePush(
        customer,
        campaign.title ?? "",
        campaign.message ?? ""
      );
      if (success) {
        await prisma.loyaltyCustomer.update({
          where: { id: customer.id },
          data: { last_push_at: nowIso() },
        });
        await prisma.loyaltyPushLog.create({
          data: {
            tenant_slug: slug,
            customer_id: customer.id,
            campaign_id: campaign.id,
            push_type: "broadcast",
            title: campaign.title ?? "",
            message: campaign.message ?? "",
            status: "sent",
            sent_at: nowIso(),
          },
        });
        stats.pushs_sent += 1;
      } else {
        stats.pushs_skipped_optout += 1;
      }
    }

    return NextResponse.json({ success: true, stats });
  } catch (err) {
    return errorResponse(err);
  }
}