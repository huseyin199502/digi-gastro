import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/categories/reorder (main.py ~11593)
// Body: {"categories": ["B", "A"]} — keeps existing names only, appends missing at end.
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    let orderedCategories: unknown;
    try {
      const body = await request.json();
      orderedCategories = body.categories;
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    if (!Array.isArray(orderedCategories)) {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }

    const dbCategories = await prisma.category.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });
    const existingNames = dbCategories.map((c) => c.name);

    // legacy: keep only known names in the requested order, append the rest
    const newOrder = orderedCategories
      .map((c) => String(c))
      .filter((c) => existingNames.includes(c));
    for (const cat of existingNames) {
      if (!newOrder.includes(cat)) newOrder.push(cat);
    }

    await prisma.$transaction(
      newOrder.map((name, idx) =>
        prisma.category.updateMany({
          where: { tenant_slug: slug, name },
          data: { position: idx },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
