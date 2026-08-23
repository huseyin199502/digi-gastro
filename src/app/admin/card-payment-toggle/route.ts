import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  dashboardRedirect,
  errorResponse,
  parseFormBool,
  requireChef,
  wantsJson,
} from "@/lib/adminApi";
import { readBodyFields } from "@/lib/tabletOps";

export const dynamic = "force-dynamic";

// Legacy POST /admin/card-payment-toggle (main.py ~11304)
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
    const acceptsCard = parseFormBool(fields.accepts_card_payment);

    await prisma.tenant.update({
      where: { slug },
      data: { accepts_card_payment: acceptsCard },
    });

    if (wantsJson(request)) {
      return NextResponse.json({
        success: true,
        accepts_card_payment: acceptsCard,
      });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
