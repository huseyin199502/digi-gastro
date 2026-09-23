import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import { ApiError, errorResponse, jsonError } from "@/lib/adminApi";
import {
  isCookieSessionValid,
  parseGuestCookieValue,
  parseActiveTableNum,
  resolveTable,
} from "@/lib/guestSession";

export const dynamic = "force-dynamic";

// Legacy GET /{slug}/orders/status?ids=1,2,3 (main.py ~5303)
// Auth: validierte Gast-Session (nur eigene Tisch-Bestellungen) ODER Staff-Session.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();

    const store = await cookies();
    const guestSessionRaw = store.get(`guest_session_${slug}`)?.value;
    const staffSession = await getTenantSession(store);
    const isStaff = staffSession !== null && staffSession.slug === slug;

    let guestTableNum: string | null = null;
    if (!isStaff) {
      if (!guestSessionRaw) {
        throw new ApiError("Nicht autorisiert.", 403);
      }
      const parsed = parseGuestCookieValue(guestSessionRaw);
      if (!parsed) throw new ApiError("Nicht autorisiert.", 403);
      const tableInfo = parseActiveTableNum(parsed.table);
      const table = await resolveTable(slug, tableInfo.num, tableInfo.zone || null);
      if (!table || !(await isCookieSessionValid(slug, table, parsed.token))) {
        throw new ApiError("Nicht autorisiert.", 403);
      }
      guestTableNum = tableInfo.num;
    }

    const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
    const idList = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^\d+$/.test(s))
      .map((s) => parseInt(s, 10));

    if (idList.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: { tenant_slug: slug, id: { in: idList } },
      orderBy: { id: "asc" },
      select: { id: true, table: true, status: true, total: true, timestamp: true },
    });

    // Gäste sehen nur Bestellungen am eigenen Tisch
    const visible = isStaff
      ? orders
      : orders.filter((o) => {
          const t = parseActiveTableNum(String(o.table ?? ""));
          return t.num === guestTableNum;
        });

    return NextResponse.json({
      orders: visible.map((o) => ({
        id: o.id,
        table: o.table,
        status: o.status,
        total: o.total,
        timestamp: o.timestamp,
      })),
    });
  } catch (err) {
    if (err instanceof ApiError) return jsonError(err.status, err.message);
    return errorResponse(err);
  }
}
