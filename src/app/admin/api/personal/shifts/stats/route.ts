import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";
import { parseDateStr } from "@/lib/inventory";

export const dynamic = "force-dynamic";

// Legacy GET /admin/api/personal/shifts/stats (modules_personal_inventory.py 447)
// Statistiken: Stunden, Kosten pro Mitarbeiter. Beide Query-Params Pflicht.
export async function GET(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const { searchParams } = new URL(request.url);
    const startDateRaw = searchParams.get("start_date");
    const endDateRaw = searchParams.get("end_date");
    if (!startDateRaw || !endDateRaw) {
      // FastAPI Query(...) → 422 bei fehlenden Pflicht-Parametern
      throw new ApiError("start_date and end_date are required", 422);
    }

    const shifts = await prisma.shift.findMany({
      where: {
        tenant_slug: slug,
        shift_date: {
          gte: parseDateStr(startDateRaw),
          lte: parseDateStr(endDateRaw),
        },
        status: { not: "cancelled" },
      },
    });

    const staffIds = Array.from(new Set(shifts.map((s) => s.staff_id)));
    const staffMap = new Map<number, string>();
    if (staffIds.length > 0) {
      const staffs = await prisma.staff.findMany({
        where: { id: { in: staffIds } },
        select: { id: true, name: true },
      });
      for (const s of staffs) staffMap.set(s.id, s.name);
    }

    const statsPerStaff = new Map<
      number,
      { staff_id: number; staff_name: string | null; total_hours: number; total_cost: number; shift_count: number }
    >();
    for (const shift of shifts) {
      const sid = shift.staff_id;
      if (!statsPerStaff.has(sid)) {
        statsPerStaff.set(sid, {
          staff_id: sid,
          staff_name: staffMap.get(sid) ?? null,
          total_hours: 0,
          total_cost: 0,
          shift_count: 0,
        });
      }
      if (!shift.start_time || !shift.end_time) continue;
      let totalMin =
        (shift.end_time.getTime() - shift.start_time.getTime()) / 60000;
      if (totalMin <= 0) totalMin += 24 * 60; // overnight
      const workedMin = totalMin - (shift.break_minutes ?? 0);
      const hours = workedMin / 60;
      const cost = hours * Number(shift.hourly_rate ?? 0);

      const entry = statsPerStaff.get(sid)!;
      entry.total_hours += hours;
      entry.total_cost += cost;
      entry.shift_count += 1;
    }

    const perStaff = Array.from(statsPerStaff.values()).map((s) => ({
      ...s,
      total_hours: Math.round(s.total_hours * 10) / 10,
      total_cost: Math.round(s.total_cost * 100) / 100,
    }));

    return NextResponse.json({
      per_staff: perStaff,
      total_hours: Math.round(perStaff.reduce((a, s) => a + s.total_hours, 0) * 10) / 10,
      total_cost: Math.round(perStaff.reduce((a, s) => a + s.total_cost, 0) * 100) / 100,
      shift_count: perStaff.reduce((a, s) => a + s.shift_count, 0),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
