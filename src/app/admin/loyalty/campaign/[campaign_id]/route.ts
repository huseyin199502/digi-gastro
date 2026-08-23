import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, jsonError, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy DELETE /admin/loyalty/campaign/{campaign_id} (main.py ~16259)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ campaign_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug.toLowerCase().trim();
    const { campaign_id } = await params;
    const campaignId = parseInt(campaign_id, 10);

    const campaign = await prisma.loyaltyCampaign.findFirst({
      where: { tenant_slug: slug, id: campaignId },
    });
    if (!campaign) {
      return jsonError(404, "Kampagne nicht gefunden.");
    }
    await prisma.loyaltyCampaign.delete({ where: { id: campaign.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
