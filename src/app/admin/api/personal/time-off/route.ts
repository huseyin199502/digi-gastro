import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";
import { formatDate, parseDateStr } from "@/lib/inventory";

export const dynamic = "force-dynamic";

// Legacy GET /admin/api/personal/time-off (modules_personal_inventory.py 510)
export async function GET() {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const requests = await prisma.timeOffRequest.findMany({
      where: { tenant_slug: slug },
      orderBy: { created_at: "desc" },
    });

    const staffIds = Array.from(new Set(requests.map((r) => r.staff_id)));
    const staffMap = new Map<number, string>();
    if (staffIds.length > 0) {
      const staffs = await prisma.staff.findMany({
        where: { id: { in: staffIds } },
        select: { id: true, name: true },
      });
      for (const s of staffs) staffMap.set(s.id, s.name);
    }

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        staff_id: r.staff_id,
        staff_name: staffMap.get(r.staff_id) ?? null,
        start_date: formatDate(r.start_date),
        end_date: formatDate(r.end_date),
        request_type: r.request_type,
        reason: r.reason,
        status: r.status,
        created_at: r.created_at ? r.created_at.toISOString() : null,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy POST /admin/api/personal/time-off (modules_personal_inventory.py 542)
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const staffId = Number(body.staff_id);
    if (!Number.isInteger(staffId) || !body.start_date || !body.end_date) {
      throw new ApiError("Validation error", 422);
    }

    const staff = await prisma.staff.findFirst({
      where: { id: staffId, tenant_slug: slug },
    });
    if (!staff) throw new ApiError("Mitarbeiter nicht gefunden", 404);

    const req = await prisma.timeOffRequest.create({
      data: {
        tenant_slug: slug,
        staff_id: staffId,
        start_date: parseDateStr(body.start_date),
        end_date: parseDateStr(body.end_date),
        request_type: String(body.request_type ?? "vacation"),
        reason: body.reason != null ? String(body.reason) : null,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, id: req.id });
  } catch (err) {
    return errorResponse(err);
  }
}
