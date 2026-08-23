import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  dashboardRedirect,
  errorResponse,
  requireChef,
  wantsJson,
} from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/staff-loeschen/{pin_code} (main.py ~10017)
// Löscht alle Mitarbeiter mit passendem pin_code.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pin_code: string }> }
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

    const { pin_code } = await params;
    await prisma.staff.deleteMany({
      where: { tenant_slug: slug, pin_code: String(pin_code).trim() },
    });

    if (wantsJson(request)) {
      return NextResponse.json({ success: true });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
