import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/sitzplan/positions (main.py ~8594)
// Body JSON: { "<nummer>:<zone>" | "<nummer>": { pos_x, pos_y, width, height, shape } }
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    let payload: Record<string, Record<string, unknown>>;
    try {
      payload = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }

    const tables = await prisma.table.findMany({
      where: { tenant_slug: slug },
      orderBy: { id: "asc" },
    });

    for (const t of tables) {
      const num = String(t.number);
      const zone = String(t.zone ?? "");
      const key = `${num}:${zone}`;
      const payloadKey =
        key in payload ? key : num in payload ? num : null;
      if (!payloadKey) continue;
      const entry = payload[payloadKey] ?? {};
      await prisma.table.update({
        where: { id: t.id },
        data: {
          pos_x: Number(entry.pos_x ?? t.pos_x ?? 0.0),
          pos_y: Number(entry.pos_y ?? t.pos_y ?? 0.0),
          width: Number(entry.width ?? t.width ?? 120.0),
          height: Number(entry.height ?? t.height ?? 80.0),
          shape: String(entry.shape ?? t.shape ?? "rect"),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
