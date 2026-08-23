import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getTenantSession, safeEqual } from "@/lib/auth";
import {
  appendAuditLog,
  ApiError,
  errorResponse,
} from "@/lib/adminApi";
import { publishEvent } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

// Legacy POST /{slug}/orders/confirm/{order_id} (main.py ~11527)
// Auth: POS device cookie (pos_token_{slug}) OR chef/kellner session.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; order_id: string }> }
) {
  try {
    const { slug: rawSlug, order_id } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const orderId = parseInt(order_id, 10);

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { pos_token: true },
    });
    if (!tenant) throw new ApiError("Dieses Restaurant existiert nicht.", 404);

    // ── Auth: POS token cookie OR chef/kellner session ──
    const store = await cookies();
    const posCookie = store.get(`pos_token_${slug}`)?.value;
    let isAuth = Boolean(
      posCookie && tenant.pos_token && safeEqual(posCookie, tenant.pos_token)
    );
    let userName = "System";
    let userRole = "kellner";
    if (!isAuth) {
      const session = await getTenantSession(store);
      if (
        session &&
        session.slug === slug &&
        (session.role === "chef" || session.role === "kellner")
      ) {
        isAuth = true;
        userName = session.name;
        userRole = session.role;
      }
    }
    if (!isAuth) throw new ApiError("Keine Berechtigung.", 403);

    const order = await prisma.order.findFirst({
      where: { id: orderId, tenant_slug: slug },
      select: { id: true, table: true },
    });
    if (!order) throw new ApiError("Bestellung nicht gefunden.", 404);

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "bestaetigt" },
    });

    await appendAuditLog(
      slug,
      userName,
      userRole,
      `Bestellung #${orderId} bestätigt`,
      `Tisch: ${order.table ?? "unbekannt"}`
    );

    publishEvent(slug, { type: "update" });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
