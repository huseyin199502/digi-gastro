import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET /admin/api/lager/transactions (modules_personal_inventory.py 845)
export async function GET(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const url = new URL(request.url);
    const itemIdRaw = url.searchParams.get("stock_item_id");
    const limitRaw = url.searchParams.get("limit");
    const limit = limitRaw != null ? Number(limitRaw) : 50;
    if (!Number.isInteger(limit) || limit < 1) {
      throw new ApiError("Input should be a valid integer", 422);
    }

    const where: { tenant_slug: string; stock_item_id?: number } = {
      tenant_slug: slug,
    };
    if (itemIdRaw != null && itemIdRaw !== "") {
      const itemId = Number(itemIdRaw);
      if (!Number.isInteger(itemId)) {
        throw new ApiError("Input should be a valid integer", 422);
      }
      where.stock_item_id = itemId;
    }

    const transactions = await prisma.stockTransaction.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: limit,
    });
    return NextResponse.json({
      transactions: transactions.map((t) => ({
        id: t.id,
        stock_item_id: t.stock_item_id,
        type: t.type,
        quantity: Number(t.quantity ?? 0),
        unit_cost: t.unit_cost != null ? Number(t.unit_cost) : null,
        reason: t.reason,
        notes: t.notes,
        created_at: t.created_at ? t.created_at.toISOString() : null,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy POST /admin/api/lager/transactions (modules_personal_inventory.py 800):
// Bestands-Buchung mit Vorzeichen-Logik und gewichteter Ø-Preis-Aktualisierung.
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
    const stockItemId = Number(body.stock_item_id);
    if (!Number.isInteger(stockItemId)) {
      throw new ApiError("Validation error", 422);
    }
    const item = await prisma.stockItem.findFirst({
      where: { id: stockItemId, tenant_slug: slug },
    });
    if (!item) throw new ApiError("Artikel nicht gefunden", 404);

    const type = String(body.type ?? "in");
    let signedQty = Number(body.quantity ?? 0);
    const unitCost = Number(body.unit_cost ?? 0);

    // Vorzeichen-Logik wie im Legacy:
    // out/waste: positive Menge wird negativ gebucht; in: negative Menge → Betrag
    if ((type === "out" || type === "waste") && signedQty > 0) signedQty = -signedQty;
    if (type === "in" && signedQty < 0) signedQty = Math.abs(signedQty);

    const txn = await prisma.stockTransaction.create({
      data: {
        tenant_slug: slug,
        stock_item_id: item.id,
        type,
        quantity: signedQty,
        unit_cost: unitCost,
        reason: body.reason != null ? String(body.reason) : null,
        notes: body.notes != null ? String(body.notes) : null,
      },
    });

    const oldStock = Number(item.current_stock ?? 0);
    const newStock = oldStock + signedQty;

    const itemData: Record<string, unknown> = { current_stock: newStock };
    // Gewichteten Durchschnittspreis aktualisieren (nur bei Wareneingang mit Preis)
    if (type === "in" && unitCost > 0) {
      const oldAvg = Number(item.avg_cost ?? 0);
      const oldValue = oldAvg * (newStock - signedQty);
      const newValue = unitCost * Math.abs(signedQty);
      if (newStock > 0) {
        itemData.avg_cost = (oldValue + newValue) / newStock;
      }
      itemData.last_purchase_price = unitCost;
    }
    await prisma.stockItem.update({ where: { id: item.id }, data: itemData });

    return NextResponse.json({
      success: true,
      transaction_id: txn.id,
      new_stock: newStock,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
