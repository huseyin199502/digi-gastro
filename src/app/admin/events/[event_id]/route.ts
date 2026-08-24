import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";
import { applyEventCombos, applyEventProducts } from "@/lib/eventsCrud";

export const dynamic = "force-dynamic";

// GET /admin/events/{event_id} — Event inkl. Event-Produkten & Combos laden
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ event_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
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
    let days: string[] = [];
    try {
      const parsed = JSON.parse(dbEvent.days || "[]");
      if (Array.isArray(parsed)) days = parsed.map(String);
    } catch {
      days = [];
    }

    const products = await prisma.eventProduct.findMany({
      where: { event_id: dbEvent.id },
    });
    const combos = await prisma.eventCombo.findMany({
      where: { event_id: dbEvent.id },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      event: {
        id: dbEvent.id,
        name: dbEvent.name,
        display_name: dbEvent.display_name,
        description: dbEvent.description ?? "",
        days,
        start_time: dbEvent.start_time,
        end_time: dbEvent.end_time,
        mode: dbEvent.mode,
        discount: dbEvent.discount ?? 0,
        is_active: dbEvent.is_active ?? true,
        banner_color: dbEvent.banner_color ?? "#dc2626",
      },
      products: products.map((ep) => ({
        product_id: ep.product_id,
        event_price: ep.event_price,
      })),
      combos: combos.map((c) => ({
        id: c.id,
        name: c.name,
        combo_price: c.combo_price,
        days: c.days ? (() => { try { const d = JSON.parse(c.days); return Array.isArray(d) ? d.map(String) : []; } catch { return []; } })() : null,
        start_time: c.start_time,
        end_time: c.end_time,
        items: c.items.map((i) => ({
          product_id: i.product_id,
          category_name: i.category_name,
          excluded_product_ids: (() => { try { const d = JSON.parse(i.excluded_product_ids ?? "[]"); return Array.isArray(d) ? d.map(Number) : []; } catch { return []; } })(),
        })),
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy PUT /admin/events/{event_id} (main.py ~11113)
export async function PUT(
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

    let existingDays: unknown[] = [];
    try {
      const parsed = JSON.parse(dbEvent.days || "[]");
      if (Array.isArray(parsed)) existingDays = parsed;
    } catch {
      existingDays = [];
    }

    await prisma.event.update({
      where: { id: dbEvent.id },
      data: {
        name: String(body.name ?? dbEvent.name).trim() || "Event",
        display_name:
          String(
            body.display_name ?? body.name ?? dbEvent.display_name
          ).trim() || "Event",
        description: String(body.description ?? "").trim(),
        days: JSON.stringify(
          Array.isArray(body.days) ? body.days : existingDays
        ),
        start_time:
          body.start_time !== undefined
            ? String(body.start_time)
            : dbEvent.start_time,
        end_time:
          body.end_time !== undefined
            ? String(body.end_time)
            : dbEvent.end_time,
        mode: body.mode !== undefined ? String(body.mode) : dbEvent.mode,
        discount:
          body.mode === "discount"
            ? parseInt(String(body.discount ?? 0), 10) || 0
            : 0,
        ...("banner_color" in body
          ? {
              banner_color: String(body.banner_color ?? "") || "#dc2626",
            }
          : {}),
        is_active:
          body.is_active !== undefined
            ? Boolean(body.is_active)
            : dbEvent.is_active,
      },
    });

    if ("products" in body) {
      await applyEventProducts(
        dbEvent.id,
        Array.isArray(body.products)
          ? (body.products as { product_id?: unknown; event_price?: unknown }[])
          : []
      );
    }
    if ("combos" in body) {
      await applyEventCombos(
        dbEvent.id,
        Array.isArray(body.combos) ? (body.combos as never[]) : []
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy DELETE /admin/events/{event_id} (main.py ~11208)
export async function DELETE(
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

    // Combos + Items + Produkte löschen, dann das Event selbst
    const existingCombos = await prisma.eventCombo.findMany({
      where: { event_id: dbEvent.id },
      select: { id: true },
    });
    for (const ec of existingCombos) {
      await prisma.eventComboItem.deleteMany({ where: { combo_id: ec.id } });
    }
    await prisma.eventCombo.deleteMany({ where: { event_id: dbEvent.id } });
    await prisma.eventProduct.deleteMany({ where: { event_id: dbEvent.id } });
    await prisma.event.delete({ where: { id: dbEvent.id } });

    // Positionen der verbleibenden Events neu indizieren
    const remaining = await prisma.event.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: { id: true },
    });
    for (let idx = 0; idx < remaining.length; idx++) {
      await prisma.event.update({
        where: { id: remaining[idx].id },
        data: { position: idx },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
