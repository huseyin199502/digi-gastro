import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

function parseSgId(raw: string): number {
  const n = Number(raw);
  if (!Number.isInteger(n)) {
    // FastAPI liefert hier 422 Validierung
    throw new ApiError("Input should be a valid integer", 422);
  }
  return n;
}

// Legacy PUT /api/super-groups/{sg_id} (main.py 11823)
// Hauptgruppe aktualisieren (Name, Farbe, Icon, Position).
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sg_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const { sg_id } = await params;
    const sgId = parseSgId(sg_id);

    const sg = await prisma.superGroup.findFirst({
      where: { id: sgId, tenant_slug: slug },
    });
    if (!sg) throw new ApiError("Hauptgruppe nicht gefunden.", 404);

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const update: { name?: string; color?: string; icon?: string; position?: number } = {};
    if ("name" in body) {
      const name = String(body.name ?? "").trim();
      if (!name) throw new ApiError("Name darf nicht leer sein.", 400);
      const dup = await prisma.superGroup.findFirst({
        where: { tenant_slug: slug, name },
      });
      if (dup && dup.id !== sgId) {
        throw new ApiError("Hauptgruppe mit diesem Namen existiert bereits.", 400);
      }
      update.name = name;
    }
    if ("color" in body) {
      update.color = String(body.color || "#374151").trim();
    }
    if ("icon" in body) {
      update.icon = String(body.icon ?? "").trim();
    }
    if ("position" in body) {
      const pos = Number(body.position);
      if (Number.isInteger(pos)) update.position = pos;
    }

    const updated = await prisma.superGroup.update({
      where: { id: sgId },
      data: update,
    });

    return NextResponse.json({
      success: true,
      id: updated.id,
      name: updated.name,
      color: updated.color,
      icon: updated.icon,
      position: updated.position,
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy DELETE /api/super-groups/{sg_id} (main.py 11863)
// Hauptgruppe löschen. Kategorien werden auf NULL (Sonstiges) zurückgesetzt.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sg_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const { sg_id } = await params;
    const sgId = parseSgId(sg_id);

    const sg = await prisma.superGroup.findFirst({
      where: { id: sgId, tenant_slug: slug },
    });
    if (!sg) throw new ApiError("Hauptgruppe nicht gefunden.", 404);

    const reset = await prisma.category.updateMany({
      where: { tenant_slug: slug, super_group_id: sgId },
      data: { super_group_id: null },
    });
    await prisma.superGroup.delete({ where: { id: sgId } });

    return NextResponse.json({
      success: true,
      reset_categories: reset.count,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
