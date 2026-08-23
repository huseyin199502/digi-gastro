import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy PUT /admin/api/personal/staff/{staff_id} (modules_personal_inventory.py 268)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ staff_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const { staff_id } = await params;
    const staffId = Number(staff_id);
    if (!Number.isInteger(staffId)) {
      throw new ApiError("Input should be a valid integer", 422);
    }

    const staff = await prisma.staff.findFirst({
      where: { id: staffId, tenant_slug: slug },
    });
    if (!staff) throw new ApiError("Mitarbeiter nicht gefunden", 404);

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // Pydantic StaffUpdate mit exclude_unset: nur vorhandene Keys übernehmen
    const update: Record<string, unknown> = {};
    const allowed = [
      "name",
      "role",
      "email",
      "phone",
      "hourly_rate",
      "weekly_target_hours",
      "contract_type",
      "active",
      "color",
    ] as const;
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    await prisma.staff.update({ where: { id: staff.id }, data: update });
    return NextResponse.json({ success: true, staff_id: staff.id });
  } catch (err) {
    return errorResponse(err);
  }
}
