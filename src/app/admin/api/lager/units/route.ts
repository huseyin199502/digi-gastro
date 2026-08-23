import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET /admin/api/lager/units (modules_personal_inventory.py 599)
// Alle Mengeneinheiten (tenant-übergreifend).
export async function GET() {
  try {
    await requireChef();
    const units = await prisma.unitOfMeasure.findMany();
    return NextResponse.json({
      units: units.map((u) => ({
        id: u.id,
        name: u.name,
        short: u.short,
        base_unit: u.base_unit,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
