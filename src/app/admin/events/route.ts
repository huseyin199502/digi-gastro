import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";
import { applyEventCombos, applyEventProducts } from "@/lib/eventsCrud";

export const dynamic = "force-dynamic";

// Legacy POST /admin/events (main.py ~11023)
// Legt ein Event inkl. Event-Produkten und -Combos an.
export async function POST(request: NextRequest) {
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

    const existingCount = await prisma.event.count({
      where: { tenant_slug: slug },
    });

    const name =
      String(body.name ?? "Neues Event").trim() || "Neues Event";
    const displayName =
      String(body.display_name ?? body.name ?? "Event").trim() || "Event";

    const event = await prisma.event.create({
      data: {
        tenant_slug: slug,
        name,
        display_name: displayName,
        description: String(body.description ?? "").trim(),
        days: JSON.stringify(Array.isArray(body.days) ? body.days : []),
        start_time: String(body.start_time ?? "18:00"),
        end_time: String(body.end_time ?? "20:00"),
        mode: String(body.mode ?? "selected"),
        discount: parseInt(String(body.discount ?? 0), 10) || 0,
        banner_color: String(body.banner_color ?? "#dc2626") || "#dc2626",
        is_active:
          body.is_active === undefined ? true : Boolean(body.is_active),
        position: existingCount,
      },
    });

    try {
      await applyEventProducts(
        event.id,
        Array.isArray(body.products)
          ? (body.products as { product_id?: unknown; event_price?: unknown }[])
          : []
      );
      await applyEventCombos(
        event.id,
        Array.isArray(body.combos)
          ? (body.combos as never[])
          : []
      );
    } catch (e) {
      console.error("[events-create]", e);
      return NextResponse.json(
        { success: false, error: "Interner Serverfehler." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, event_id: event.id });
  } catch (err) {
    return errorResponse(err);
  }
}
