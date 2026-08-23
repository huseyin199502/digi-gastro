import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /api/super-groups/bulk-assign (main.py 11919)
// Body: {"assignments": [{"category_id": 1, "super_group_id": 2}, ...]}
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
    const assignments = body.assignments ?? [];
    if (!Array.isArray(assignments)) {
      throw new ApiError("assignments muss eine Liste sein.", 400);
    }

    const sgs = await prisma.superGroup.findMany({
      where: { tenant_slug: slug },
      select: { id: true },
    });
    const validSgIds = new Set(sgs.map((sg) => sg.id));

    let updated = 0;
    for (const raw of assignments) {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
      const a = raw as Record<string, unknown>;
      const catId = a.category_id;
      const newSgId = a.super_group_id;
      if (catId === null || catId === undefined) continue;
      const catIdInt = Number(catId);
      if (!Number.isInteger(catIdInt)) continue;
      const cat = await prisma.category.findFirst({
        where: { id: catIdInt, tenant_slug: slug },
      });
      if (!cat) continue;

      if (newSgId === null || newSgId === undefined || newSgId === "null" || newSgId === "") {
        await prisma.category.update({
          where: { id: cat.id },
          data: { super_group_id: null },
        });
      } else {
        const newSgIdInt = Number(newSgId);
        if (!Number.isInteger(newSgIdInt) || !validSgIds.has(newSgIdInt)) {
          continue;
        }
        await prisma.category.update({
          where: { id: cat.id },
          data: { super_group_id: newSgIdInt },
        });
      }
      updated++;
    }

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    return errorResponse(err);
  }
}
