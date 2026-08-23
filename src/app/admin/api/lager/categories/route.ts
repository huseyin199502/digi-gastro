import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET /admin/api/lager/categories (modules_personal_inventory.py 607)
export async function GET() {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const cats = await prisma.stockCategory.findMany({
      where: { tenant_slug: slug },
      orderBy: { position: "asc" },
    });
    return NextResponse.json({
      categories: cats.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        position: c.position,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy POST /admin/api/lager/categories (modules_personal_inventory.py 615)
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const name = body.name;
    if (!name) throw new ApiError("Validation error", 422);

    const cat = await prisma.stockCategory.create({
      data: {
        tenant_slug: slug,
        name: String(name),
        color: String(body.color ?? "#374151"),
      },
    });
    return NextResponse.json({ success: true, id: cat.id });
  } catch (err) {
    return errorResponse(err);
  }
}
