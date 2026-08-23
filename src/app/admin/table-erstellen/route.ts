import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import {
  dashboardRedirect,
  errorResponse,
  requireChef,
  wantsJson,
} from "@/lib/adminApi";
import { readBodyFields, sortTablesInGrid } from "@/lib/tabletOps";

export const dynamic = "force-dynamic";

// Legacy POST /admin/table-erstellen (main.py ~8372)
// Form fields: number, zone, shape (default "rect")
export async function POST(request: NextRequest) {
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

    const fields = await readBodyFields(request);
    const tableNum = String(fields.number ?? "").trim();
    const zone = String(fields.zone ?? "");
    const shape = String(fields.shape ?? "rect") || "rect";

    const exists = await prisma.table.findFirst({
      where: { tenant_slug: slug, number: tableNum, zone },
    });
    if (!exists) {
      await prisma.table.create({
        data: {
          tenant_slug: slug,
          number: tableNum,
          zone,
          security_token: crypto.randomBytes(16).toString("hex"),
          active_session_token: null,
          pos_x: 0.0,
          pos_y: 0.0,
          width: 120.0,
          height: 80.0,
          shape,
          active: true,
          qr_token: crypto.randomBytes(12).toString("base64url"),
        },
      });
      await sortTablesInGrid(slug);
    }

    if (wantsJson(request)) {
      return NextResponse.json({ success: true, number: tableNum, zone });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
