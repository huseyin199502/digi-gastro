import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nowIso } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

// Legacy POST /api/wallet/apple/v1/log (main.py ~15898)
// iOS schickt Fehler-Logs an diesen Endpoint. Immer 200.
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      logs?: unknown[];
    };
    const logs = Array.isArray(body.logs) ? body.logs : [];
    if (logs.length > 0) {
      await prisma.passkitLog.create({
        data: { logs: JSON.stringify(logs), created_at: nowIso() },
      });
      console.log(
        `[PassKit Log] ${logs.length} entries: ${JSON.stringify(logs.slice(0, 2))}`
      );
    }
  } catch (e) {
    console.log(`[PassKit Log] Error: ${e}`);
  }
  return new NextResponse(null, { status: 200 });
}
