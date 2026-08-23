import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET /admin/api/lager/recipes (modules_personal_inventory.py 939)
export async function GET(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const url = new URL(request.url);
    const productIdRaw = url.searchParams.get("product_id");

    const where: { tenant_slug: string; product_id?: number } = { tenant_slug: slug };
    if (productIdRaw != null && productIdRaw !== "") {
      const productId = Number(productIdRaw);
      if (!Number.isInteger(productId)) {
        throw new ApiError("Input should be a valid integer", 422);
      }
      where.product_id = productId;
    }

    const recipes = await prisma.recipe.findMany({ where });
    return NextResponse.json({
      recipes: recipes.map((r) => ({
        id: r.id,
        product_id: r.product_id,
        stock_item_id: r.stock_item_id,
        quantity: Number(r.quantity ?? 0),
        unit: r.unit,
        notes: r.notes,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy POST /admin/api/lager/recipes (modules_personal_inventory.py 952)
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
    const productId = Number(body.product_id);
    const stockItemId = Number(body.stock_item_id);
    const quantity = Number(body.quantity);
    const unit = body.unit;
    if (
      !Number.isInteger(productId) ||
      !Number.isInteger(stockItemId) ||
      Number.isNaN(quantity) ||
      !unit
    ) {
      throw new ApiError("Validation error", 422);
    }

    const recipe = await prisma.recipe.create({
      data: {
        tenant_slug: slug,
        product_id: productId,
        stock_item_id: stockItemId,
        quantity,
        unit: String(unit),
        notes: body.notes != null ? String(body.notes) : null,
      },
    });
    return NextResponse.json({ success: true, id: recipe.id });
  } catch (err) {
    return errorResponse(err);
  }
}
