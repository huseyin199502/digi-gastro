import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET /admin/passkit/logs?limit=50 (main.py ~16008)
// Zeigt die letzten PassKit-Logs die iOS geschickt hat.
export async function GET(request: NextRequest) {
  try {
    await requireChef();
    const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? 50);
    const limit = Math.min(Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 50, 200);

    const logs = await prisma.passkitLog.findMany({
      orderBy: { id: "desc" },
      take: limit,
    });

    return NextResponse.json({
      total: logs.length,
      logs: logs.map((l) => ({
        id: l.id,
        created_at: l.created_at,
        logs: (() => {
          try {
            const parsed = JSON.parse(l.logs);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })(),
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}