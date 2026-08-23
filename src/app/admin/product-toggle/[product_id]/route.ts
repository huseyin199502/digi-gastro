import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/product-toggle/{product_id} (main.py ~12010)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ product_id: string }> }
) {
  try {
    const { product_id } = await params;
    const productId = parseInt(product_id, 10);
    const session = await requireChef();
    const slug = session.slug;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { is_setup_completed: true },
    });
    if (!tenant?.is_setup_completed) {
      return NextResponse.redirect(
        new URL("/admin/setup", _request.url),
        303
      );
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, tenant_slug: slug },
      select: { id: true, is_available: true },
    });
    if (!product) throw new ApiError("Produkt nicht gefunden.", 404);

    const isAvailable = !(product.is_available ?? true);
    await prisma.product.update({
      where: { id: productId },
      data: { is_available: isAvailable },
    });

    return NextResponse.json({ success: true, is_available: isAvailable });
  } catch (err) {
    return errorResponse(err);
  }
}
