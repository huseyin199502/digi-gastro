import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/api/personal/time-off/{req_id}/deny
// (modules_personal_inventory.py 580)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ req_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const { req_id } = await params;
    const reqId = Number(req_id);
    if (!Number.isInteger(reqId)) {
      throw new ApiError("Input should be a valid integer", 422);
    }

    const req = await prisma.timeOffRequest.findFirst({
      where: { id: reqId, tenant_slug: slug },
    });
    if (!req) throw new ApiError("Antrag nicht gefunden", 404);

    // reviewed_by = E-Mail des aktuellen Users (Legacy: user.email)
    let reviewedBy: string | null = null;
    const me = await prisma.staff.findFirst({
      where: { tenant_slug: slug, name: session.name },
      select: { email: true },
    });
    reviewedBy = me?.email ?? null;

    await prisma.timeOffRequest.update({
      where: { id: req.id },
      data: { status: "denied", reviewed_by: reviewedBy, reviewed_at: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
