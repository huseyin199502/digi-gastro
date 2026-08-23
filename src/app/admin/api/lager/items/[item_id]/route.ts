import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

async function loadItem(slug: string, rawId: string) {
  const itemId = Number(rawId);
  if (!Number.isInteger(itemId)) {
    throw new ApiError("Input should be a valid integer", 422);
  }
  const item = await prisma.stockItem.findFirst({
    where: { id: itemId, tenant_slug: slug },
  });
  if (!item) throw new ApiError("Artikel nicht gefunden", 404);
  return item;
}

// Legacy PUT /admin/api/lager/items/{item_id}
// (modules_personal_inventory.py 761): partielle Updates (exclude_unset).
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ item_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const { item_id } = await params;
    const item = await loadItem(slug, item_id);

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const data: Record<string, unknown> = {};
    if ("name" in body && body.name != null) data.name = String(body.name);
    if ("sku" in body) data.sku = body.sku != null ? String(body.sku) : null;
    if ("category_id" in body) {
      data.category_id =
        body.category_id != null && Number.isInteger(Number(body.category_id))
          ? Number(body.category_id)
          : null;
    }
    if ("supplier_id" in body) {
      data.supplier_id =
        body.supplier_id != null && Number.isInteger(Number(body.supplier_id))
          ? Number(body.supplier_id)
          : null;
    }
    if ("min_stock" in body) data.min_stock = Number(body.min_stock ?? 0);
    if ("max_stock" in body) {
      data.max_stock = body.max_stock != null ? Number(body.max_stock) : null;
    }
    if ("reorder_qty" in body) {
      data.reorder_qty = body.reorder_qty != null ? Number(body.reorder_qty) : null;
    }
    if ("base_unit" in body && body.base_unit != null) {
      data.base_unit = String(body.base_unit);
    }
    if ("purchase_unit" in body) {
      data.purchase_unit = body.purchase_unit != null ? String(body.purchase_unit) : null;
    }
    if ("purchase_to_base_factor" in body) {
      data.purchase_to_base_factor = Number(body.purchase_to_base_factor ?? 1);
    }
    if ("product_id" in body) {
      data.product_id =
        body.product_id != null && Number.isInteger(Number(body.product_id))
          ? Number(body.product_id)
          : null;
    }
    if ("notes" in body) data.notes = body.notes != null ? String(body.notes) : null;
    if ("active" in body) data.active = Boolean(body.active);

    await prisma.stockItem.update({ where: { id: item.id }, data });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy DELETE /admin/api/lager/items/{item_id}
// (modules_personal_inventory.py 786)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ item_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const { item_id } = await params;
    const item = await loadItem(slug, item_id);

    await prisma.stockItem.delete({ where: { id: item.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
