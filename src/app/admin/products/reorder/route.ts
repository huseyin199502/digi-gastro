import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/products/reorder (main.py ~11566)
// Body: {"product_ids": [3, 1, 2]} — listed ids get position = index,
// unlisted products fall back to position 9999.
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    let orderedIds: unknown;
    try {
      const body = await request.json();
      orderedIds = body.product_ids;
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    if (!Array.isArray(orderedIds)) {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }

    const idToPos = new Map<number, number>();
    orderedIds.forEach((pid, idx) => {
      const n = parseInt(String(pid), 10);
      if (Number.isFinite(n)) idToPos.set(n, idx);
    });

    const products = await prisma.product.findMany({
      where: { tenant_slug: slug },
      select: { id: true },
    });
    await prisma.$transaction(
      products.map((p) =>
        prisma.product.update({
          where: { id: p.id },
          data: { position: idToPos.has(p.id) ? idToPos.get(p.id)! : 9999 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
