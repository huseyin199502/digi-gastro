import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import { ApiError, errorResponse } from "@/lib/adminApi";
import { getActiveTenant, round2, compareNatural } from "@/lib/tabletOps";
import { berlinDateStr, berlinTimestamp } from "@/lib/time";

export const dynamic = "force-dynamic";

// Legacy GET /api/tablet-status (main.py ~9399)
// Auth: 1. admin/staff session → 2. pos_session cookie "slug:token" →
// 3. any "pos_token_{slug}" cookie. Non-admin POS devices with stale
// token get auto-kicked ({"error": "Gerät wurde entkoppelt"}).
export async function GET(request: NextRequest) {
  try {
    const store = await cookies();

    let slug: string | null = null;
    let isAdmin = false;
    let clientPosToken: string | null = null;

    // 1. Admin/Staff-Session
    const session = await getTenantSession(store);
    if (session) {
      slug = session.slug;
      isAdmin = true;
    } else {
      // 2. POS-Session-Cookie "slug:token"
      const posSession = store.get("pos_session")?.value;
      if (posSession) {
        const parts = posSession.split(":");
        if (parts.length === 2) {
          slug = parts[0];
          clientPosToken = parts[1];
        }
      } else {
        // 3. Fallback: erstes "pos_token_{slug}"-Cookie
        for (const c of store.getAll()) {
          if (c.name.startsWith("pos_token_")) {
            slug = c.name.replace("pos_token_", "").trim();
            clientPosToken = c.value;
            break;
          }
        }
      }
    }

    if (!slug) {
      throw new ApiError("Nicht autorisiert.", 401);
    }

    const slugLower = slug.toLowerCase().trim();
    const tenant = await getActiveTenant(slugLower);

    // Auto-kick für POS-Geräte mit veraltetem Token (nicht für Admins)
    if (!isAdmin) {
      const isTest = request.nextUrl.hostname === "testserver";
      if (!isTest && tenant.pos_token && clientPosToken !== tenant.pos_token) {
        return NextResponse.json(
          { error: "Gerät wurde entkoppelt" },
          { status: 401 }
        );
      }
    }

    // 1. Aktive Orders (nicht bezahlt/storniert) + Items
    const dbActiveOrders = await prisma.order.findMany({
      where: {
        tenant_slug: slugLower,
        status: { notIn: ["bezahlt", "storniert"] },
      },
      orderBy: { id: "asc" },
      include: { items: { orderBy: { id: "asc" } } },
    });

    const activeOrders = dbActiveOrders.map((o) => ({
      id: o.id,
      table: o.table,
      items: o.items.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category_type: item.category_type,
        note: item.note,
        extras: item.extras ?? null,
        item_status: item.item_status || "pending",
        combo_id: item.combo_id ?? null,
        combo_name: item.combo_name ?? null,
        combo_instance_id: item.combo_instance_id ?? null,
      })),
      total: o.total,
      total_with_tip: o.total_with_tip,
      tip_amount: o.tip_amount,
      status: o.status,
      timestamp: o.timestamp,
      original_timestamp: null,
      mwst_rate: o.mwst_rate,
      waiter_id: o.waiter_id,
      original_total: o.original_total ?? null,
      daily_bon_number: o.daily_bon_number ?? null,
      bon_date: o.bon_date ?? null,
    }));

    // 2. Tables (natürlich sortiert nach Nummer)
    const dbTables = await prisma.table.findMany({
      where: { tenant_slug: slugLower },
      orderBy: { id: "asc" },
    });
    const tables = dbTables
      .map((t) => ({
        number: t.number,
        zone: t.zone,
        security_token: t.security_token,
        active_session_token: t.active_session_token,
        pos_x: t.pos_x ?? 0.0,
        pos_y: t.pos_y ?? 0.0,
        width: t.width ?? 120.0,
        height: t.height ?? 80.0,
        shape: t.shape || "rect",
        active: t.active ?? true,
        qr_token: t.qr_token ?? null,
      }))
      .sort((a, b) => compareNatural(a.number, b.number));

    // 3. Service Calls (neueste zuerst, max. 100)
    const dbCalls = await prisma.serviceCall.findMany({
      where: { tenant_slug: slugLower },
      orderBy: { id: "desc" },
      take: 100,
    });
    const serviceCalls = dbCalls.map((c) => ({
      id: c.id,
      table: c.table,
      type: c.type,
      timestamp: c.timestamp,
    }));

    // 4. Tagesstatistik — nicht storniert UND timestamp beginnt mit heute
    const today = berlinDateStr();
    const dbTodayOrders = await prisma.order.findMany({
      where: {
        tenant_slug: slugLower,
        status: { not: "storniert" },
        timestamp: { startsWith: today },
      },
      orderBy: { id: "asc" },
    });

    const paidToday = dbTodayOrders.filter((o) => o.status === "bezahlt");
    const paidTodayIds = paidToday.map((o) => o.id);
    const paidTodayItems =
      paidTodayIds.length > 0
        ? await prisma.orderItem.findMany({
            where: { order_id: { in: paidTodayIds } },
          })
        : [];

    // Fix 6e: brutto verwendet max(total, original_total)
    let brutto = 0;
    let totalTip = 0;
    for (const o of paidToday) {
      brutto += Math.max(o.total ?? 0, o.original_total ?? 0);
      totalTip += o.tip_amount ?? 0;
    }
    const totalOrders = paidToday.length;

    let netto7 = 0;
    let netto19 = 0;
    let brutto7 = 0;
    let brutto19 = 0;
    const paidItemsByOrder = new Map<number, typeof paidTodayItems>();
    for (const item of paidTodayItems) {
      const list = paidItemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      paidItemsByOrder.set(item.order_id, list);
    }
    for (const o of paidToday) {
      for (const item of paidItemsByOrder.get(o.id) ?? []) {
        const itemTotal = (item.price ?? 0) * (item.quantity ?? 0);
        const isFood = (item.category_type || "küche") === "küche";
        if (isFood) {
          brutto7 += itemTotal;
          netto7 += itemTotal / 1.07;
        } else {
          brutto19 += itemTotal;
          netto19 += itemTotal / 1.19;
        }
      }
    }

    const avgBasket = totalOrders > 0 ? brutto / totalOrders : 0;

    // 5. recent_payments — Top 5 zuletzt bezahlte Orders (aller Zeiten)
    const dbPaidRecent = await prisma.order.findMany({
      where: { tenant_slug: slugLower, status: "bezahlt" },
      orderBy: [{ timestamp: "desc" }, { id: "asc" }],
      take: 5,
    });
    const recentPayments = dbPaidRecent.map((o) => {
      const t = o.total ?? 0;
      let ot = o.original_total ?? null;
      if (ot === null) ot = t;
      const displayTotal = ot ? Math.max(t, ot) : t;
      return {
        id: o.id,
        table: o.table,
        total: displayTotal,
        original_total: ot,
        tip_amount: o.tip_amount ?? 0,
        timestamp: o.timestamp || "",
      };
    });

    // 6. recent_cancellations — Top 10 zuletzt stornierte Orders
    const dbCancelledRecent = await prisma.order.findMany({
      where: { tenant_slug: slugLower, status: "storniert" },
      orderBy: [{ timestamp: "desc" }, { id: "asc" }],
      take: 10,
    });
    const recentCancellations = dbCancelledRecent.map((o) => {
      const t = o.total ?? 0;
      let ot = o.original_total ?? null;
      if (ot === null) ot = t;
      const displayTotal = ot ? Math.max(t, ot) : t;
      return {
        id: o.id,
        table: o.table,
        total: displayTotal,
        original_total: ot,
        timestamp: o.timestamp || "",
      };
    });

    return NextResponse.json({
      orders: activeOrders,
      service_calls: serviceCalls,
      tables,
      server_time: berlinTimestamp(),
      price_mode: tenant.price_mode || "brutto",
      stats: {
        brutto: round2(brutto),
        netto_7: round2(netto7),
        netto_19: round2(netto19),
        brutto_7: round2(brutto7),
        brutto_19: round2(brutto19),
        tip: round2(totalTip),
        orders_count: totalOrders,
        avg_basket: round2(avgBasket),
      },
      recent_payments: recentPayments,
      recent_cancellations: recentCancellations,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
