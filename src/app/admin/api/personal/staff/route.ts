import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET /admin/api/personal/staff (modules_personal_inventory.py 244)
export async function GET() {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const staffList = await prisma.staff.findMany({
      where: { tenant_slug: slug },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({
      staff: staffList.map((s) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        email: s.email,
        phone: s.phone,
        hourly_rate: Number(s.hourly_rate ?? 0),
        weekly_target_hours: Number(s.weekly_target_hours ?? 0),
        contract_type: s.contract_type,
        active: s.active,
        color: s.color,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
