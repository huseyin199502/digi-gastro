import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  dashboardRedirect,
  errorResponse,
  requireChef,
  wantsJson,
} from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/product-hh (main.py ~12025)
// Form fields: product_id, happy_hour_price, start_time, end_time
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

    let fields: Record<string, unknown>;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      fields = await request.json();
    } else {
      const form = await request.formData();
      fields = Object.fromEntries(form.entries());
    }

    const productId = parseInt(String(fields.product_id ?? ""), 10);
    if (!Number.isFinite(productId)) {
      throw new ApiError("Produkt nicht gefunden.", 404);
    }
    const product = await prisma.product.findFirst({
      where: { id: productId, tenant_slug: slug },
      select: { id: true },
    });
    if (!product) throw new ApiError("Produkt nicht gefunden.", 404);

    const hhRaw = fields.happy_hour_price;
    const parsedHh = hhRaw === undefined || hhRaw === null || hhRaw === ""
      ? null
      : Number(hhRaw);
    // 0 / ungültig = Happy Hour aus
    const hhPrice =
      parsedHh !== null && Number.isFinite(parsedHh) && parsedHh > 0
        ? parsedHh
        : null;
    const startTime = String(fields.start_time ?? "") || null;
    const endTime = String(fields.end_time ?? "") || null;

    await prisma.product.update({
      where: { id: productId },
      data: {
        happy_hour_price: hhPrice,
        start_time: startTime,
        end_time: endTime,
        // happy_hour_days intentionally NOT updated here (legacy uses bulk endpoint)
      },
    });

    if (wantsJson(request)) {
      return NextResponse.json({ success: true });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
