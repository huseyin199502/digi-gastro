import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, htmlEscape, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy PATCH /api/categories/edit (main.py ~11655)
// Body: {"old_name": "...", "new_name": "..."}
// Renames a category and reassigns all products (incl. "A > B" prefixes).
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    const oldFullName = String(payload.old_name ?? "").trim();
    const newNameRaw = htmlEscape(String(payload.new_name ?? "").trim());

    if (!oldFullName || !newNameRaw) {
      throw new ApiError("Name darf nicht leer sein.", 400);
    }
    const newFullName = newNameRaw;
    if (newFullName === oldFullName) {
      return NextResponse.json({ success: true, message: "Keine Änderung." });
    }

    const existingNames = (
      await prisma.category.findMany({
        where: { tenant_slug: slug },
        select: { name: true },
      })
    ).map((c) => c.name);
    if (existingNames.includes(newFullName)) {
      throw new ApiError(
        "Eine Kategorie mit diesem Namen existiert bereits.",
        400
      );
    }

    // 1. Reassign products (exact match + " > " subcategory prefixes, legacy)
    const exactProducts = await prisma.product.updateMany({
      where: { tenant_slug: slug, category: oldFullName },
      data: { category: newFullName },
    });
    const prefixed = await prisma.product.findMany({
      where: { tenant_slug: slug, category: { startsWith: `${oldFullName} > ` } },
      select: { id: true, category: true },
    });
    for (const p of prefixed) {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          category: p.category.replace(
            `${oldFullName} > `,
            `${newFullName} > `
          ),
        },
      });
    }
    const affectedProducts = exactProducts.count + prefixed.length;

    // 2. Rename the category itself (row update keeps id/super_group_id)
    const cat = await prisma.category.findFirst({
      where: { tenant_slug: slug, name: oldFullName },
    });
    if (!cat) throw new ApiError("Kategorie nicht gefunden.", 404);
    await prisma.category.update({
      where: { id: cat.id },
      data: { name: newFullName },
    });

    // 3. Legacy also rewrote "parent > child" category names
    const prefixedCats = await prisma.category.findMany({
      where: { tenant_slug: slug, name: { startsWith: `${oldFullName} > ` } },
      select: { id: true, name: true },
    });
    for (const c of prefixedCats) {
      await prisma.category.update({
        where: { id: c.id },
        data: { name: c.name.replace(`${oldFullName} > `, `${newFullName} > `) },
      });
    }

    return NextResponse.json({
      success: true,
      new_name: newFullName,
      affected: affectedProducts,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
