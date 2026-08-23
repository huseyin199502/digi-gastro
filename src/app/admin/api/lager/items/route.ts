import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET /admin/api/lager/items (modules_personal_inventory.py 694)
export async function GET(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const url = new URL(request.url);
    const categoryIdRaw = url.searchParams.get("category_id");
    const lowStockOnly = url.searchParams.get("low_stock_only") === "true";
    const search = url.searchParams.get("search");

    const where: {
      tenant_slug: string;
      category_id?: number;
      name?: { contains: string; mode: "insensitive" };
    } = { tenant_slug: slug };
    if (categoryIdRaw != null && categoryIdRaw !== "") {
      const categoryId = Number(categoryIdRaw);
      if (!Number.isInteger(categoryId)) {
        throw new ApiError("Input should be a valid integer", 422);
      }
      where.category_id = categoryId;
    }
    // low_stock wird unten per JS gefiltert (current_stock <= min_stock,
    // Spaltenvergleich ist in Prisma nicht direkt möglich)
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    let items = await prisma.stockItem.findMany({
      where,
      orderBy: { name: "asc" },
    });
    if (lowStockOnly) {
      // Legacy: min_stock > 0 und current_stock <= min_stock
      items = items.filter((i) => {
        const current = Number(i.current_stock ?? 0);
        const min = Number(i.min_stock ?? 0);
        return min > 0 && current <= min;
      });
    }
    return NextResponse.json({
      items: items.map((i) => {
        const current = Number(i.current_stock ?? 0);
        const min = Number(i.min_stock ?? 0);
        const avgCost = Number(i.avg_cost ?? 0);
        return {
          id: i.id,
          name: i.name,
          sku: i.sku,
          category_id: i.category_id,
          supplier_id: i.supplier_id,
          current_stock: current,
          min_stock: min,
          max_stock: i.max_stock != null ? Number(i.max_stock) : null,
          reorder_qty: i.reorder_qty != null ? Number(i.reorder_qty) : null,
          base_unit: i.base_unit,
          purchase_unit: i.purchase_unit,
          purchase_to_base_factor: Number(i.purchase_to_base_factor ?? 0) || 1,
          avg_cost: avgCost,
          last_purchase_price:
            i.last_purchase_price != null ? Number(i.last_purchase_price) : null,
          product_id: i.product_id,
          active: i.active,
          is_low_stock: min > 0 && current <= min,
          stock_value: Math.round(current * avgCost * 100) / 100,
        };
      }),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy POST /admin/api/lager/items (modules_personal_inventory.py 730)
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
    const name = body.name;
    if (!name) throw new ApiError("Validation error", 422);

    const currentStock = Number(body.current_stock ?? 0);
    const costPerUnit = Number(body.cost_per_unit ?? 0);

    const item = await prisma.stockItem.create({
      data: {
        tenant_slug: slug,
        name: String(name),
        sku: body.sku != null ? String(body.sku) : null,
        category_id:
          body.category_id != null && Number.isInteger(Number(body.category_id))
            ? Number(body.category_id)
            : null,
        supplier_id:
          body.supplier_id != null && Number.isInteger(Number(body.supplier_id))
            ? Number(body.supplier_id)
            : null,
        current_stock: currentStock,
        min_stock: Number(body.min_stock ?? 0),
        max_stock: body.max_stock != null ? Number(body.max_stock) : null,
        reorder_qty: body.reorder_qty != null ? Number(body.reorder_qty) : null,
        base_unit: String(body.base_unit ?? "Stk"),
        purchase_unit: body.purchase_unit != null ? String(body.purchase_unit) : null,
        purchase_to_base_factor: Number(body.purchase_to_base_factor ?? 1),
        avg_cost: costPerUnit,
        last_purchase_price: costPerUnit,
        product_id:
          body.product_id != null && Number.isInteger(Number(body.product_id))
            ? Number(body.product_id)
            : null,
        notes: body.notes != null ? String(body.notes) : null,
      },
    });

    // Initialbestand automatisch als Transaktion buchen (Legacy-Verhalten)
    if (currentStock > 0) {
      await prisma.stockTransaction.create({
        data: {
          tenant_slug: slug,
          stock_item_id: item.id,
          type: "in",
          quantity: currentStock,
          unit_cost: costPerUnit,
          reason: "Initialbestand bei Anlage",
          notes: "Automatisch beim Erstellen des Artikels gebucht",
        },
      });
    }
    return NextResponse.json({ success: true, id: item.id });
  } catch (err) {
    return errorResponse(err);
  }
}
