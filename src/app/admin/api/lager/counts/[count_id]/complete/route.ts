import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/api/lager/counts/{count_id}/complete
// (modules_personal_inventory.py 1067): Inventur abschließen, Abweichungen
// als adjust-Transaktionen buchen und Bestände auf die gezählten Mengen setzen.
export async function POST(
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

    const countItems = await prisma.stockCountItem.findMany({
      where: { stock_count_id: count.id },
    });

    let adjustments = 0;
    for (const ci of countItems) {
      if (ci.counted_qty == null) continue;
      const variance = ci.variance != null ? Number(ci.variance) : 0;
      if (Math.abs(variance) < 0.001) continue;

      const expected = ci.expected_qty != null ? Number(ci.expected_qty) : 0;
      const counted = Number(ci.counted_qty);

      await prisma.stockTransaction.create({
        data: {
          tenant_slug: slug,
          stock_item_id: ci.stock_item_id,
          type: "adjust",
          quantity: variance,
          reason: `Inventur ${count.name}`,
          stock_count_id: count.id,
          notes: `Erwartet: ${expected}, Gezählt: ${counted}`,
        },
      });
      await prisma.stockItem.update({
        where: { id: ci.stock_item_id },
        data: { current_stock: counted },
      });
      adjustments += 1;
    }

    await prisma.stockCount.update({
      where: { id: count.id },
      data: { status: "completed", completed_at: new Date() },
    });

    return NextResponse.json({ success: true, adjustments });
  } catch (err) {
    return errorResponse(err);
  }
}
