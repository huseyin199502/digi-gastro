import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";
import { formatDate, parseDateStr } from "@/lib/inventory";

export const dynamic = "force-dynamic";

// Legacy GET /admin/api/lager/counts (modules_personal_inventory.py 976)
export async function GET() {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const counts = await prisma.stockCount.findMany({
      where: { tenant_slug: slug },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({
      counts: counts.map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        count_date: formatDate(c.count_date),
        created_at: c.created_at ? c.created_at.toISOString() : null,
        completed_at: c.completed_at ? c.completed_at.toISOString() : null,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy POST /admin/api/lager/counts (modules_personal_inventory.py 987):
// neue Inventur anlegen und alle aktiven Artikel als Positionen übernehmen.
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const today = formatDate(new Date()) ?? "";
    const name = body.name ? String(body.name) : `Inventur ${today}`;
    const countDate = parseDateStr(body.count_date ?? today);

    const staff = await prisma.staff.findFirst({
      where: { tenant_slug: slug, name: session.name },
      select: { email: true },
    });

    const count = await prisma.stockCount.create({
      data: {
        tenant_slug: slug,
        name,
        status: "open",
        count_date: countDate,
        notes: body.notes != null ? String(body.notes) : null,
        created_by: staff?.email ?? null,
      },
    });

    const activeItems = await prisma.stockItem.findMany({
      where: { tenant_slug: slug, active: true },
    });
    if (activeItems.length > 0) {
      await prisma.stockCountItem.createMany({
        data: activeItems.map((i) => ({
          stock_count_id: count.id,
          stock_item_id: i.id,
          expected_qty: i.current_stock,
          counted_qty: null,
          variance: 0,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      id: count.id,
      item_count: activeItems.length,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
