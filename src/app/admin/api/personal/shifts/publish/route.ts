import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";
import { parseDateStr } from "@/lib/inventory";

export const dynamic = "force-dynamic";

// Legacy POST /admin/api/personal/shifts/publish (modules_personal_inventory.py 417)
// Schichten einer Woche veröffentlichen (draft → published).
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
    const startDateStr = body.start_date;
    const endDateStr = body.end_date;
    if (!startDateStr || !endDateStr) {
      throw new ApiError("start_date und end_date erforderlich", 400);
    }

    const result = await prisma.shift.updateMany({
      where: {
        tenant_slug: slug,
        shift_date: {
          gte: parseDateStr(startDateStr),
          lte: parseDateStr(endDateStr),
        },
        status: "draft",
      },
      data: { status: "published" },
    });

    return NextResponse.json({
      success: true,
      published_count: result.count,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
