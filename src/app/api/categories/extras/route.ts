import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /api/categories/extras (main.py ~11621)
// Body: {"category_name": "Getränke", "extras": [{"name": "Sojamilch", "price": 1.0}]}
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    const catName = String(body.category_name ?? "").trim();
    const extras = Array.isArray(body.extras) ? body.extras : [];

    if (!catName) throw new ApiError("Kategorie-Name fehlt.", 400);

    const cat = await prisma.category.findFirst({
      where: { tenant_slug: slug, name: catName },
    });
    if (!cat) throw new ApiError("Kategorie nicht gefunden.", 404);

    await prisma.category.update({
      where: { id: cat.id },
      data: { extras: JSON.stringify(extras) },
    });

    console.log(`[Extras] ${slug}/${catName}: ${extras.length} Extras gespeichert`);
    return NextResponse.json({ success: true, extras });
  } catch (err) {
    return errorResponse(err);
  }
}
