import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy PUT /admin/api/lager/counts/{count_id}/items/{item_id}
// (modules_personal_inventory.py 1044): gezählte Menge + Notizen erfassen.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ count_id: string; item_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const { count_id, item_id } = await params;
    const countId = Number(count_id);
    const itemId = Number(item_id);
    if (!Number.isInteger(countId) || !Number.isInteger(itemId)) {
      throw new ApiError("Input should be a valid integer", 422);
    }

    const count = await prisma.stockCount.findFirst({
      where: { id: countId, tenant_slug: slug },
    });
    if (!count) throw new ApiError("Inventur nicht gefunden", 404);

    const countItem = await prisma.stockCountItem.findFirst({
      where: { id: itemId, stock_count_id: count.id },
    });
    if (!countItem) throw new ApiError("Position nicht gefunden", 404);

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const data: Record<string, unknown> = {};
    let variance =
      countItem.variance != null ? Number(countItem.variance) : null;
    if ("counted_qty" in body) {
      const counted = body.counted_qty != null ? Number(body.counted_qty) : null;
      data.counted_qty = counted;
      const expected =
        countItem.expected_qty != null ? Number(countItem.expected_qty) : 0;
      variance = counted != null ? counted - expected : null;
      data.variance = variance;
    }
    if ("notes" in body) {
      data.notes = body.notes != null ? String(body.notes) : null;
    }

    await prisma.stockCountItem.update({ where: { id: countItem.id }, data });
    return NextResponse.json({ success: true, variance });
  } catch (err) {
    return errorResponse(err);
  }
}
