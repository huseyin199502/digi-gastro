import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/lib/auth";
import { errorResponse } from "@/lib/adminApi";
import { getDisplayTotal } from "@/lib/reports";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /admin/orders/[order_id] — einzelner Bon inkl. aller Positionen.
// Wird vom Reports-Tab geöffnet, wenn der Tenant auf einen vergangenen
// Bon klickt (z. B. "Letzte Zahlungen" oder Historie).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  try {
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ detail: "Nicht eingeloggt." }, { status: 401 });
    }
    const slug = session.slug.toLowerCase().trim();

    const { order_id } = await params;
    const orderId = parseInt(order_id, 10);
    if (!Number.isFinite(orderId)) {
      return NextResponse.json({ detail: "Ungültige Bon-ID." }, { status: 400 });
    }

    const o = await prisma.order.findFirst({
      where: { id: orderId, tenant_slug: slug },
      include: { items: { orderBy: { id: "asc" } } },
    });
    if (!o) {
      return NextResponse.json({ detail: "Bon nicht gefunden." }, { status: 404 });
    }

    const displayTotal = getDisplayTotal({
      id: o.id,
      table: o.table,
      items: [],
      total: o.total ?? 0,
      original_total: o.original_total ?? null,
      daily_bon_number: o.daily_bon_number ?? null,
      bon_date: o.bon_date ?? null,
      status: o.status ?? "",
      timestamp: o.timestamp,
      mwst_rate: o.mwst_rate ?? null,
      waiter: o.waiter_id ?? "",
      tip: o.tip_amount ?? 0,
    });

    return NextResponse.json({
      id: o.id,
      daily_bon_number: o.daily_bon_number ?? null,
      bon_date: o.bon_date ?? null,
      table: o.table,
      status: o.status,
      timestamp: o.timestamp,
      waiter: o.waiter_id ?? "",
      tip: o.tip_amount ?? 0,
      total: displayTotal,
      total_with_tip: o.total_with_tip ?? null,
      items: o.items.map((i) => ({
        id: i.id,
        product_id: i.product_id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        status: i.item_status,
        category_type: i.category_type ?? "küche",
        note: i.note,
        extras: i.extras ?? null,
        combo_name: i.combo_name,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
