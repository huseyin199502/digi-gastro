import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy DELETE /admin/api/lager/categories/{cat_id}
// (modules_personal_inventory.py 631)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ cat_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const { cat_id } = await params;
    const catId = Number(cat_id);
    if (!Number.isInteger(catId)) {
      throw new ApiError("Input should be a valid integer", 422);
    }

    const cat = await prisma.stockCategory.findFirst({
      where: { id: catId, tenant_slug: slug },
    });
    if (!cat) throw new ApiError("Kategorie nicht gefunden", 404);

    await prisma.stockCategory.delete({ where: { id: cat.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
