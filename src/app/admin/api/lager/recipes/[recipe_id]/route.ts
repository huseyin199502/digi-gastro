import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy DELETE /admin/api/lager/recipes/{recipe_id}
// (modules_personal_inventory.py 966)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ recipe_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const { recipe_id } = await params;
    const recipeId = Number(recipe_id);
    if (!Number.isInteger(recipeId)) {
      throw new ApiError("Input should be a valid integer", 422);
    }

    const recipe = await prisma.recipe.findFirst({
      where: { id: recipeId, tenant_slug: slug },
    });
    if (!recipe) throw new ApiError("Rezept nicht gefunden", 404);

    await prisma.recipe.delete({ where: { id: recipe.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
