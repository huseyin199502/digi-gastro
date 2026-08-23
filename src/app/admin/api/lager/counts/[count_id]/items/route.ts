import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";
import { formatDate } from "@/lib/inventory";

export const dynamic = "force-dynamic";

// Legacy GET /admin/api/lager/counts/{count_id}/items
// (modules_personal_inventory.py 1022)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ count_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const { count_id } = await params;
    const countId = Number(count_id);
    if (!Number.isInteger(countId)) {
      throw new ApiError("Input should be a valid integer", 422);
    }

    const count = await prisma.stockCount.findFirst({
      where: { id: countId, tenant_slug: slug },
    });
    if (!count) throw new ApiError("Inventur nicht gefunden", 404);

    const items = await prisma.stockCountItem.findMany({
      where: { stock_count_id: count.id },
      include: { stockItem: true },
    });
    return NextResponse.json({
      count: {
        id: count.id,
        name: count.name,
        status: count.status,
        count_date: formatDate(count.count_date),
      },
      items: items.map((ci) => ({
        id: ci.id,
        stock_item_id: ci.stock_item_id,
        stock_item_name: ci.stockItem?.name ?? "",
        base_unit: ci.stockItem?.base_unit ?? "",
        expected_qty: ci.expected_qty != null ? Number(ci.expected_qty) : null,
        counted_qty: ci.counted_qty != null ? Number(ci.counted_qty) : null,
        variance: ci.variance != null ? Number(ci.variance) : null,
        notes: ci.notes,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
