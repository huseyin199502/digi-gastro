import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  dashboardRedirect,
  errorResponse,
  requireChef,
  wantsJson,
} from "@/lib/adminApi";
import { sortTablesInGrid } from "@/lib/tabletOps";

export const dynamic = "force-dynamic";

// Legacy POST /admin/table-loeschen/{table_num} (main.py ~8417)
// Query-Param zone: mit Zone nur diesen Tisch löschen, ohne alle Zonen.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ table_num: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { is_setup_completed: true },
    });
    if (!tenant?.is_setup_completed) {
      return NextResponse.redirect(new URL("/admin/setup", request.url), 303);
    }

    const { table_num } = await params;
    const zone = request.nextUrl.searchParams.get("zone");

    if (zone) {
      await prisma.table.deleteMany({
        where: { tenant_slug: slug, number: table_num, zone },
      });
    } else {
      await prisma.table.deleteMany({
        where: { tenant_slug: slug, number: table_num },
      });
    }
    await sortTablesInGrid(slug);

    if (wantsJson(request)) {
      return NextResponse.json({ success: true, number: table_num });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
