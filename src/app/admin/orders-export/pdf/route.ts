import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/lib/auth";
import { getActiveTenant } from "@/lib/tabletOps";
import { errorResponse } from "@/lib/adminApi";
import { getBerlinNow } from "@/lib/time";
import {
  buildFilterText,
  filterOrdersForExport,
  fmtEur,
  getDisplayTotal,
  loadAllOrdersForExport,
} from "@/lib/reports";
import { buildOrdersExportPdf } from "@/lib/pdfReport";

export const dynamic = "force-dynamic";

// Legacy GET /admin/orders-export/pdf (main.py 12555)
// Export der gefilterten Bestellungen als PDF — für Buchhaltung & Steuerberater.
export async function GET(request: NextRequest) {
  try {
    // Legacy: RedirectResponse(url="/admin/login") ohne Session / als Nicht-Chef
    const session = await getTenantSession();
    if (!session || session.role !== "chef") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const slug = session.slug;

    const tenant = await getActiveTenant(slug);
    // CRITICAL FIX C5: ALLE Bestellungen aus DB — nicht nur die letzten 200
    const allOrders = await loadAllOrdersForExport(slug);
    const priceMode = tenant.price_mode ?? "brutto";
    const restaurantName = tenant.name || slug;

    const url = new URL(request.url);
    const params = {
      range: url.searchParams.get("range") ?? "today",
      status: url.searchParams.get("status") ?? "all",
      frm: url.searchParams.get("frm") ?? "",
      to: url.searchParams.get("to") ?? "",
      table: url.searchParams.get("table") ?? "all",
      search: url.searchParams.get("search") ?? "",
    };
    const orders = filterOrdersForExport(allOrders, params);

    // Summary
    const totalCount = orders.length;
    const paidOrders = orders.filter((o) => (o.status || "").toLowerCase() === "bezahlt");
    const cancelledCount = orders.filter((o) => (o.status || "").toLowerCase() === "storniert").length;
    const paidCount = paidOrders.length;
    const activeCount = totalCount - paidCount - cancelledCount;
    const totalRevenue = paidOrders.reduce((sum, o) => sum + getDisplayTotal(o), 0);
    const avgBasket = paidCount > 0 ? totalRevenue / paidCount : 0;

    const now = getBerlinNow();
    const p2 = (n: number) => String(n).padStart(2, "0");
    const nowStr = `${p2(now.getUTCDate())}.${p2(now.getUTCMonth() + 1)}.${now.getUTCFullYear()} ${p2(now.getUTCHours())}:${p2(now.getUTCMinutes())}`;

    const pdfBytes = await buildOrdersExportPdf({
      restaurantName,
      slug,
      priceMode,
      filterText: buildFilterText(params),
      nowStr,
      orders: orders.map((o) => ({
        id: o.id,
        table: o.table,
        timestamp: o.timestamp,
        status: o.status,
        mwstRate: o.mwst_rate ?? 19,
        total: getDisplayTotal(o),
      })),
      summary: {
        totalCount,
        paidCount,
        activeCount,
        cancelledCount,
        totalRevenue,
        avgBasket,
        paidTotal: totalRevenue,
      },
      fmtEur,
    });

    const filename = `bestellreport-${slug}-${now.getUTCFullYear()}${p2(now.getUTCMonth() + 1)}${p2(now.getUTCDate())}${p2(now.getUTCHours())}${p2(now.getUTCMinutes())}${p2(now.getUTCSeconds())}.pdf`;
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
