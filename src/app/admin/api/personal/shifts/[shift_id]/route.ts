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

async function loadShift(slug: string, raw: string) {
  const shiftId = Number(raw);
  if (!Number.isInteger(shiftId)) {
    throw new ApiError("Input should be a valid integer", 422);
  }
  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, tenant_slug: slug },
  });
  if (!shift) throw new ApiError("Schicht nicht gefunden", 404);
  return shift;
}

// Legacy PUT /admin/api/personal/shifts/{shift_id} (modules_personal_inventory.py 364)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ shift_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const { shift_id } = await params;
    const shift = await loadShift(slug, shift_id);

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const update: Record<string, unknown> = {};
    if ("staff_id" in body && body.staff_id != null) update.staff_id = Number(body.staff_id);
    if ("role" in body && body.role != null) update.role = String(body.role);
    if ("shift_date" in body && body.shift_date) update.shift_date = parseDateStr(body.shift_date);
    if ("start_time" in body && body.start_time) update.start_time = parseTimeStr(body.start_time);
    if ("end_time" in body && body.end_time) update.end_time = parseTimeStr(body.end_time);
    if ("break_minutes" in body && body.break_minutes != null) {
      update.break_minutes = Number(body.break_minutes);
    }
    if ("hourly_rate" in body && body.hourly_rate != null) {
      update.hourly_rate = Number(body.hourly_rate);
    }
    if ("position_label" in body) {
      update.position_label = body.position_label != null ? String(body.position_label) : null;
    }
    if ("notes" in body) update.notes = body.notes != null ? String(body.notes) : null;
    if ("status" in body && body.status != null) update.status = String(body.status);

    const updated = await prisma.shift.update({
      where: { id: shift.id },
      data: update,
    });

    // ArbZG neu validieren, wenn Zeiten geändert wurden
    let warnings: string[] = [];
    if (
      "shift_date" in body ||
      "start_time" in body ||
      "end_time" in body ||
      "break_minutes" in body
    ) {
      if (updated.shift_date && updated.start_time && updated.end_time) {
        warnings = await validateArbzg(
          slug,
          updated.staff_id,
          updated.shift_date,
          updated.start_time,
          updated.end_time,
          updated.break_minutes ?? 0,
          updated.id
        );
      }
    }

    const staff = await prisma.staff.findUnique({
      where: { id: updated.staff_id },
      select: { name: true },
    });
    return NextResponse.json({
      success: true,
      shift: shiftToDict(updated, staff?.name ?? null),
      warnings,
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy DELETE /admin/api/personal/shifts/{shift_id} (modules_personal_inventory.py 404)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ shift_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const { shift_id } = await params;
    const shift = await loadShift(slug, shift_id);
    await prisma.shift.delete({ where: { id: shift.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
