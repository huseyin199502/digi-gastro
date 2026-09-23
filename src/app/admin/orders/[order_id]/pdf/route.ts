import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/lib/auth";
import { errorResponse } from "@/lib/adminApi";
import { fmtEur, getDisplayTotal } from "@/lib/reports";
import { buildBonPdf } from "@/lib/pdfReport";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /admin/orders/[order_id]/pdf — einzelner Bon als PDF-Beleg
// (Drucken/Speichern aus dem Bon-Detail-Popup im Reports-Tab).
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

    const [tenant, o] = await Promise.all([
      prisma.tenant.findUnique({ where: { slug } }),
      prisma.order.findFirst({
        where: { id: orderId, tenant_slug: slug },
        include: { items: { orderBy: { id: "asc" } } },
      }),
    ]);
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

    const addressLine = [tenant?.address ?? "", `${tenant?.plz ?? ""} ${tenant?.ort ?? ""}`.trim()]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");

    const pdfBytes = await buildBonPdf({
      restaurantName: tenant?.name || slug,
      addressLine,
      orderId: o.id,
      dailyBonNumber: o.daily_bon_number ?? null,
      table: o.table,
      timestamp: o.timestamp,
      waiter: o.waiter_id ?? "",
      status: o.status ?? "",
      tip: o.tip_amount ?? 0,
      total: displayTotal,
      items: o.items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        note: i.note,
        extras: i.extras ?? null,
        comboName: i.combo_name,
      })),
      fmtEur: (v) => fmtEur(v),
    });

    const filename = `bon-${o.daily_bon_number ?? o.id}-${slug}.pdf`;
    return new NextResponse(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${filename}`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
