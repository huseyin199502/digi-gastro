import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/lib/auth";
import { errorResponse } from "@/lib/adminApi";
import {
  filterOrdersForExport,
  getDisplayTotal,
  loadAllOrdersForExport,
} from "@/lib/reports";

export const dynamic = "force-dynamic";

// GET /admin/orders-history?range=today|7d|30d|all|custom&status=all|aktiv|bezahlt|storniert&frm=YYYY-MM-DD&to=YYYY-MM-DD&search=...&limit=100
// Liste vergangener Bons INKL. Positionen — damit der Tenant im Admin
// auf einen Bon klicken und sehen kann, was bestellt wurde
// (Reklamation: "das habe ich nie gehabt").
export async function GET(request: NextRequest) {
  try {
    // Jede eingeloggte Tenant-Session (Chef + Personal) darf Bons einsehen.
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ detail: "Nicht eingeloggt." }, { status: 401 });
    }
    const slug = session.slug;

    const url = new URL(request.url);
    const params = {
      range: url.searchParams.get("range") ?? "today",
      status: url.searchParams.get("status") ?? "all",
      frm: url.searchParams.get("frm") ?? "",
      to: url.searchParams.get("to") ?? "",
      table: url.searchParams.get("table") ?? "all",
      search: url.searchParams.get("search") ?? "",
    };
    const limitRaw = parseInt(url.searchParams.get("limit") ?? "100", 10);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 500)
      : 100;

    const allOrders = await loadAllOrdersForExport(slug);
    const filtered = filterOrdersForExport(allOrders, params);
    const sliced = filtered.slice(0, limit);

    return NextResponse.json({
      orders: sliced.map((o) => ({
        id: o.id,
        daily_bon_number: o.daily_bon_number,
        bon_date: o.bon_date,
        table: o.table,
        status: o.status,
        timestamp: o.timestamp,
        waiter: o.waiter,
        tip: o.tip,
        total: getDisplayTotal(o),
        items: o.items.map((i) => ({
          id: i.id,
          product_id: i.product_id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          status: i.status,
          category_type: i.category_type,
          note: i.note,
          extras: i.extras ?? null,
          combo_name: i.combo_name,
        })),
      })),
      total_count: filtered.length,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
