import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  dashboardRedirect,
  deleteLocalImageIfUnused,
  errorResponse,
  requireChef,
  wantsJson,
} from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/produkt-loeschen/{product_id} (main.py ~9012)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ product_id: string }> }
) {
  try {
    const { product_id } = await params;
    const productId = parseInt(product_id, 10);
    if (!Number.isFinite(productId)) {
      throw new ApiError("Produkt nicht gefunden.", 404);
    }
    const session = await requireChef();
    const slug = session.slug;

    // Strict tenant isolation: only products of the session tenant
    const product = await prisma.product.findFirst({
      where: { id: productId, tenant_slug: slug },
    });
    if (!product) throw new ApiError("Produkt nicht gefunden.", 404);

    const oldImage = product.image ?? "";
    await prisma.product.delete({ where: { id: productId } });

    // Clean up the image if no other product references it
    if (oldImage) await deleteLocalImageIfUnused(oldImage, slug);

    if (wantsJson(request)) {
      return NextResponse.json({ success: true });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
