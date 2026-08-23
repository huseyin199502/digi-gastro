import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy PUT /api/categories/{cat_id}/super-group (main.py 11885)
// Weist einer Kategorie eine Hauptgruppe zu. super_group_id=null setzt
// zurück auf Sonstiges.
export async function PUT(
  request: NextRequest,
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

    const cat = await prisma.category.findFirst({
      where: { id: catId, tenant_slug: slug },
    });
    if (!cat) throw new ApiError("Kategorie nicht gefunden.", 404);

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const newSgId = body.super_group_id;

    let superGroupId: number | null;
    if (newSgId === null || newSgId === undefined || newSgId === "null" || newSgId === "") {
      superGroupId = null;
    } else {
      const newSgIdInt = Number(newSgId);
      if (!Number.isInteger(newSgIdInt)) {
        throw new ApiError("Ungültige super_group_id.", 400);
      }
      const sg = await prisma.superGroup.findFirst({
        where: { id: newSgIdInt, tenant_slug: slug },
      });
      if (!sg) throw new ApiError("Hauptgruppe nicht gefunden.", 404);
      superGroupId = newSgIdInt;
    }

    await prisma.category.update({
      where: { id: cat.id },
      data: { super_group_id: superGroupId },
    });

    return NextResponse.json({
      success: true,
      category_id: cat.id,
      super_group_id: superGroupId,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
