import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/lib/auth";
import { getActiveTenant } from "@/lib/tabletOps";
import { ApiError, errorResponse } from "@/lib/adminApi";
import { getBerlinNow } from "@/lib/time";
import {
  fmtEur,
  getDisplayTotal,
  loadAllOrdersForExport,
  parseOrderDate,
} from "@/lib/reports";
import { buildMonatsreportPdf } from "@/lib/pdfReport";

export const dynamic = "force-dynamic";

// Legacy GET /admin/monatsreport/pdf (main.py 12818)
// Professioneller Umsatzreport PDF für einen Zeitraum (von-bis).
// Netto-Only Darstellung — keine MwSt, kein Brutto im Report.
export async function GET(request: NextRequest) {
  try {
    const session = await getTenantSession();
    if (!session || session.role !== "chef") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const slug = session.slug;

    const url = new URL(request.url);
    const frm = url.searchParams.get("frm");
    const to = url.searchParams.get("to");
    if (!frm || !to) throw new ApiError("Validation error", 422);

    const tenant = await getActiveTenant(slug);
    const restaurantName = tenant.name || slug;
    const priceMode = tenant.price_mode ?? "brutto";
    const allOrders = await loadAllOrdersForExport(slug);

    // ── Zeitraum parsen ──
    const dateFrom = parseOrderDate(`${frm} 00:00:00`);
    const dateTo = parseOrderDate(`${to} 00:00:00`);
    if (!dateFrom || !dateTo) {
      throw new ApiError("Ungültiges Datum. Format: YYYY-MM-DD", 400);
    }
    const dateToEnd = new Date(dateTo);
    dateToEnd.setHours(23, 59, 59);
    if (dateFrom > dateTo) {
      throw new ApiError("Start-Datum muss vor End-Datum liegen", 400);
    }

    // ── Bestellungen im Zeitraum filtern (nur bezahlt) ──
    const paidInRange: { order: (typeof allOrders)[number]; date: Date }[] = [];
    for (const o of allOrders) {
      if (o.status !== "bezahlt") continue;
      if (!o.timestamp) continue;
      const orderDate = parseOrderDate(o.timestamp);
      if (!orderDate) continue;
      if (orderDate >= dateFrom && orderDate <= dateToEnd) {
        paidInRange.push({ order: o, date: orderDate });
      }
    }

    // ── Metriken berechnen ──
    let totalRevenue = 0;
    const byTable = new Map<string, { count: number; revenue: number }>();
    const byProduct = new Map<string, { qty: number; revenue: number }>();
    const byDay = new Map<string, { count: number; revenue: number }>();

    for (const { order: o, date: orderDate } of paidInRange) {
      let orderRevenue: number;
      if (priceMode === "netto") {
        let orderNetto = 0;
        for (const item of o.items) {
          const itemTotal = (item.price || 0) * (item.quantity || 0);
          const isFood = (item.category_type || "küche") === "küche";
          orderNetto += isFood ? itemTotal / 1.07 : itemTotal / 1.19;
        }
        orderRevenue = orderNetto;
      } else {
        orderRevenue = getDisplayTotal(o);
      }
      totalRevenue += orderRevenue;

      // Nach Tisch
      const tableName = o.table || "Unbekannt";
      const t = byTable.get(tableName) ?? { count: 0, revenue: 0 };
      t.count += 1;
      t.revenue += orderRevenue;
      byTable.set(tableName, t);

      // Nach Produkt
      for (const item of o.items) {
        const name = item.name || "Unbekannt";
        const qty = item.quantity || 0;
        let itemTotal = (item.price || 0) * qty;
        if (priceMode === "netto") {
          const isFood = (item.category_type || "küche") === "küche";
          itemTotal = isFood ? itemTotal / 1.07 : itemTotal / 1.19;
        }
        const p = byProduct.get(name) ?? { qty: 0, revenue: 0 };
        p.qty += qty;
        p.revenue += itemTotal;
        byProduct.set(name, p);
      }

      // Nach Tag
      const p2 = (n: number) => String(n).padStart(2, "0");
      const dayStr = `${p2(orderDate.getDate())}.${p2(orderDate.getMonth() + 1)}.${orderDate.getFullYear()}`;
      const d = byDay.get(dayStr) ?? { count: 0, revenue: 0 };
      d.count += 1;
      d.revenue += orderRevenue;
      byDay.set(dayStr, d);
    }

    const totalBons = paidInRange.length;
    const avgBasket = totalBons > 0 ? totalRevenue / totalBons : 0;

    // Top-Tische (nach Umsatz)
    const topTables = [...byTable.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5);
    const maxTableRevenue = topTables.length > 0 ? topTables[0][1].revenue : 1;

    // Top-Produkte (nach Menge)
    const topProducts = [...byProduct.entries()]
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 10);

    // Tägliche Umsätze (sortiert nach Datum)
    const dailySorted = [...byDay.entries()].sort((a, b) => {
      const da = parseOrderDate(`${a[0].split(".").reverse().join("-")} 00:00:00`);
      const db = parseOrderDate(`${b[0].split(".").reverse().join("-")} 00:00:00`);
      return (da?.getTime() ?? 0) - (db?.getTime() ?? 0);
    });

    const p2 = (n: number) => String(n).padStart(2, "0");
    const fmtDe = (d: Date) =>
      `${p2(d.getDate())}.${p2(d.getMonth() + 1)}.${d.getFullYear()}`;
    const now = getBerlinNow();
    // getBerlinNow liefert eine UTC-verschobene Date → UTC-Getter = Berlin-Zeit
    const nowDe = `${p2(now.getUTCDate())}.${p2(now.getUTCMonth() + 1)}.${now.getUTCFullYear()}`;

    const pdfBytes = await buildMonatsreportPdf({
      restaurantName,
      fromStr: fmtDe(dateFrom),
      toStr: fmtDe(dateTo),
      nowStr: `${nowDe}, ${p2(now.getUTCHours())}:${p2(now.getUTCMinutes())} Uhr`,
      totalRevenue,
      totalBons,
      avgBasket,
      topTables: topTables.map(([name, d]) => {
        const pct = totalRevenue > 0 ? (d.revenue / totalRevenue) * 100 : 0;
        // Balken aus █-Zeichen (Legacy)
        const barCount =
          maxTableRevenue > 0 ? Math.floor((d.revenue / maxTableRevenue) * 10) : 0;
        const bar = "█".repeat(barCount) + "░".repeat(10 - barCount);
        return { name, count: d.count, revenue: d.revenue, pct, bar };
      }),
      topProducts: topProducts.map(([name, d]) => ({
        name,
        qty: d.qty,
        revenue: d.revenue,
      })),
      daily: dailySorted.map(([day, d]) => ({
        day,
        count: d.count,
        revenue: d.revenue,
      })),
      fmtEur,
      fmtPct: (v: number) => `${v.toFixed(1)}%`,
    });

    const filename = `umsatzreport-${slug}-${frm}-bis-${to}.pdf`;
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
