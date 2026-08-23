import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/adminApi";
import { getActiveTenant, tabletAuth } from "@/lib/tabletOps";
import { publishEvent } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

// Legacy POST /{slug}/service-erledigt/{ruf_id} (main.py ~6728)
// Auth: POS cookie OR chef/kellner/zubereiter session.
// Direkter DELETE — idempotent (Doppelklick → trotzdem success).
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; ruf_id: string }> }
) {
  try {
    const { slug: rawSlug, ruf_id } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const rufId = parseInt(ruf_id, 10);

    await getActiveTenant(slug);
    await tabletAuth(slug, ["chef", "kellner", "zubereiter"]);

    if (Number.isFinite(rufId)) {
      const deleted = await prisma.serviceCall.deleteMany({
        where: { tenant_slug: slug, id: rufId },
      });
      if (deleted.count === 0) {
        // Call war vielleicht schon gelöscht (Kellner hat 2× geklickt)
        console.log(
          `[service-erledigt] Call ${rufId} für ${slug} bereits gelöscht (idempotent)`
        );
      }
    }

    publishEvent(slug, { type: "update" });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
