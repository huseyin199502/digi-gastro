import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";
import { applyEventProducts } from "@/lib/eventsCrud";

export const dynamic = "force-dynamic";

// Legacy POST /admin/events/{event_id}/products (main.py ~11245)
// Bulk-Update der Event-Produkt-Zuordnungen mit Festpreisen.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ event_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { is_setup_completed: true },
    });
    if (!tenant?.is_setup_completed) {
      return NextResponse.json(
        { success: false, error: "Setup nicht abgeschlossen" },
        { status: 400 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const { event_id } = await params;
    const eventId = parseInt(event_id, 10);
    const dbEvent = await prisma.event.findFirst({
      where: { id: eventId, tenant_slug: slug },
    });
    if (!dbEvent) {
      return NextResponse.json(
        { success: false, error: "Event nicht gefunden" },
        { status: 404 }
      );
    }

    await applyEventProducts(
      dbEvent.id,
      Array.isArray(body.products)
        ? (body.products as { product_id?: unknown; event_price?: unknown }[])
        : []
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
