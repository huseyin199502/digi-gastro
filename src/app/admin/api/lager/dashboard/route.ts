import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET /admin/api/lager/dashboard (modules_personal_inventory.py 866)
export async function GET() {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const items = await prisma.stockItem.findMany({
      where: { tenant_slug: slug, active: true },
    });
    const totalValue = items.reduce(
      (sum, i) => sum + Number(i.current_stock ?? 0) * Number(i.avg_cost ?? 0),
      0
    );

    const lowStockItems = items.filter((i) => {
      const min = Number(i.min_stock ?? 0);
      return min > 0 && Number(i.current_stock ?? 0) <= min;
    });

    const recent = await prisma.stockTransaction.findMany({
      where: { tenant_slug: slug },
      orderBy: { created_at: "desc" },
      take: 10,
    });

    return NextResponse.json({
      total_items: items.length,
      total_value: Math.round(totalValue * 100) / 100,
      low_stock_count: lowStockItems.length,
      low_stock_items: lowStockItems.map((i) => ({
        id: i.id,
        name: i.name,
        current_stock: Number(i.current_stock ?? 0),
        min_stock: Number(i.min_stock ?? 0),
        base_unit: i.base_unit,
        reorder_qty: i.reorder_qty != null ? Number(i.reorder_qty) : null,
      })),
      recent_transactions: recent.map((t) => ({
        id: t.id,
        stock_item_id: t.stock_item_id,
        type: t.type,
        quantity: Number(t.quantity ?? 0),
        reason: t.reason,
        created_at: t.created_at ? t.created_at.toISOString() : null,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
