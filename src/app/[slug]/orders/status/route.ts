import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import { ApiError, errorResponse, jsonError } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET /{slug}/orders/status?ids=1,2,3 (main.py ~5303)
// Auth: guest session cookie for the tenant OR any staff/owner session.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();

    const store = await cookies();
    const guestSession = store.get(`guest_session_${slug}`)?.value;
    const staffSession = await getTenantSession(store);
    const isAdmin = staffSession !== null && staffSession.slug === slug;
    if (!guestSession && !isAdmin) {
      throw new ApiError("Nicht autorisiert.", 403);
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

    return NextResponse.json({
      orders: orders.map((o) => ({
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
