import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";
import { ensureDefaultSuperGroups } from "@/lib/superGroups";

export const dynamic = "force-dynamic";

// Legacy GET /api/super-groups (main.py 11716)
// Liste aller Hauptgruppen des Tenants + Kategorie-Zuordnung.
export async function GET() {
  try {
    const session = await requireChef();
    const slug = session.slug;

    await ensureDefaultSuperGroups(slug);

    const dbSgs = await prisma.superGroup.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });
    const superGroups = dbSgs.map((sg) => ({
      id: sg.id,
      name: sg.name,
      position: sg.position ?? 0,
      color: sg.color || "#374151",
      icon: sg.icon || "",
    }));

    const dbCats = await prisma.category.findMany({
      where: { tenant_slug: slug },
    });
    const catData = dbCats.map((c) => {
      let extras: unknown[] = [];
      try {
        extras = JSON.parse(c.extras || "[]");
      } catch {
        extras = [];
      }
      return {
        id: c.id,
        name: c.name,
        super_group_id: c.super_group_id ?? null,
        extras,
      };
    });

    return NextResponse.json({ super_groups: superGroups, categories: catData });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy POST /api/super-groups (main.py 11792)
// Neue Hauptgruppe anlegen.
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
    const name = String(body.name ?? "").trim();
    if (!name) throw new ApiError("Name darf nicht leer sein.", 400);
    const color = String(body.color || "#374151").trim();
    const icon = String(body.icon ?? "").trim();

    const existing = await prisma.superGroup.findFirst({
      where: { tenant_slug: slug, name },
    });
    if (existing) {
      throw new ApiError("Hauptgruppe mit diesem Namen existiert bereits.", 400);
    }

    const maxPos = await prisma.superGroup.count({
      where: { tenant_slug: slug },
    });
    const sg = await prisma.superGroup.create({
      data: { tenant_slug: slug, name, color, icon, position: maxPos },
    });

    return NextResponse.json({
      success: true,
      id: sg.id,
      name: sg.name,
      color: sg.color,
      icon: sg.icon,
      position: sg.position,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
