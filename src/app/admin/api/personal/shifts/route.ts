import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";
import {
  parseDateStr,
  parseTimeStr,
  shiftToDict,
  validateArbzg,
} from "@/lib/inventory";

export const dynamic = "force-dynamic";

// Legacy GET /admin/api/personal/shifts (modules_personal_inventory.py 288)
export async function GET(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const { searchParams } = new URL(request.url);
    const startDateRaw = searchParams.get("start_date");
    const endDateRaw = searchParams.get("end_date");

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDateRaw) dateFilter.gte = parseDateStr(startDateRaw);
    if (endDateRaw) dateFilter.lte = parseDateStr(endDateRaw);

    const shifts = await prisma.shift.findMany({
      where: {
        tenant_slug: slug,
        ...(dateFilter.gte || dateFilter.lte ? { shift_date: dateFilter } : {}),
      },
      orderBy: [{ shift_date: "asc" }, { start_time: "asc" }],
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

    return NextResponse.json({
      shifts: shifts.map((s) => shiftToDict(s, staffMap.get(s.staff_id) ?? null)),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy POST /admin/api/personal/shifts (modules_personal_inventory.py 317)
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
    // Pydantic-Validierung: Pflichtfelder
    const staffId = Number(body.staff_id);
    if (!Number.isInteger(staffId) || !body.role || !body.shift_date || !body.start_time || !body.end_time) {
      throw new ApiError("Validation error", 422);
    }
    const role = String(body.role);
    const breakMinutes = Number(body.break_minutes ?? 0) || 0;
    const hourlyRatePayload = Number(body.hourly_rate ?? 0) || 0;

    const staff = await prisma.staff.findFirst({
      where: { id: staffId, tenant_slug: slug },
    });
    if (!staff) throw new ApiError("Mitarbeiter nicht gefunden", 404);

    const shiftDate = parseDateStr(body.shift_date);
    const startTime = parseTimeStr(body.start_time);
    const endTime = parseTimeStr(body.end_time);

    const warnings = await validateArbzg(
      slug,
      staffId,
      shiftDate,
      startTime,
      endTime,
      breakMinutes
    );

    // Hourly Rate: aus Payload oder vom Staff
    const hourlyRate = hourlyRatePayload || Number(staff.hourly_rate ?? 0);

    // created_by = E-Mail des aktuellen Users (Legacy: user.email)
    const me = await prisma.staff.findFirst({
      where: { tenant_slug: slug, name: session.name },
      select: { email: true },
    });

    const shift = await prisma.shift.create({
      data: {
        tenant_slug: slug,
        staff_id: staffId,
        role,
        shift_date: shiftDate,
        start_time: startTime,
        end_time: endTime,
        break_minutes: breakMinutes,
        hourly_rate: hourlyRate,
        position_label: body.position_label != null ? String(body.position_label) : null,
        notes: body.notes != null ? String(body.notes) : null,
        status: "draft",
        created_by: me?.email ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      shift: shiftToDict(shift, staff.name),
      warnings,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
