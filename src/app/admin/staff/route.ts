import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  dashboardRedirect,
  errorResponse,
  requireChef,
  wantsJson,
} from "@/lib/adminApi";
import { readBodyFields } from "@/lib/tabletOps";

export const dynamic = "force-dynamic";

// Legacy POST /admin/staff (main.py ~9995)
// Form fields: name, role, pin
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
    const name = String(fields.name ?? "");
    const role = String(fields.role ?? "");
    const pinStr = String(fields.pin ?? "").trim();

    await prisma.staff.create({
      data: {
        tenant_slug: slug,
        name,
        role,
        pin: pinStr,
        pin_code: pinStr,
      },
    });

    if (wantsJson(request)) {
      return NextResponse.json({ success: true, name, role });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
