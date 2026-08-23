import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/adminApi";
import { getActiveTenant, parseActiveTableNum } from "@/lib/tabletOps";

export const dynamic = "force-dynamic";

// Legacy GET /api/{slug}/table-unpaid-sum/{table_num} (main.py ~9947)
// Kein Auth-Gate — nur Gast-Session-Cookie für Zonen-Auflösung.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; table_num: string }> }
) {
  try {
    const { slug: rawSlug, table_num } = await params;
    const slug = rawSlug.toLowerCase().trim();
    await getActiveTenant(slug);

    let unpaidSum = 0.0;
    const { num: tNum } = parseActiveTableNum(String(table_num));

    // Guest-Session-Cookie parsen (Zone + Token)
    let cookieZone = "";
    let cToken: string | null = null;
    const sessionVal =
      (await cookies()).get(`guest_session_${slug}`)?.value ?? null;
    if (sessionVal) {
      try {
        const idx = sessionVal.indexOf(":");
        if (idx === -1) throw new Error("bad session");
        const cTable = sessionVal.slice(0, idx);
        const cTok = sessionVal.slice(idx + 1);
        const parsed = parseActiveTableNum(cTable);
        if (parsed.num === tNum) {
          cToken = cTok;
          cookieZone = parsed.zone;
        }
      } catch {
        // ignore
      }
    }

    const tablesList = await prisma.table.findMany({
      where: { tenant_slug: slug },
      orderBy: { id: "asc" },
    });

    let dbTable: (typeof tablesList)[number] | null = null;
    if (cToken) {
      if (cookieZone) {
        // Security: nur active_session_token für Kundenzugriff
        dbTable =
          tablesList.find(
            (t) =>
              String(t.number) === tNum &&
              t.zone === cookieZone &&
              t.active_session_token === cToken
          ) ?? null;
      }
      if (!dbTable) {
        dbTable =
          tablesList.find(
            (t) =>
              String(t.number) === tNum && t.active_session_token === cToken
          ) ?? null;
      }
    }
    if (!dbTable) {
      if (cookieZone) {
        dbTable =
          tablesList.find(
            (t) => String(t.number) === tNum && t.zone === cookieZone
          ) ?? null;
      }
      if (!dbTable) {
        dbTable =
          tablesList.find((t) => String(t.number) === tNum) ?? null;
      }
    }

    const zone = dbTable?.zone ?? "";
    const targetTableName = zone
      ? `Tisch ${tNum} (${zone})`
      : `Tisch ${tNum}`;

    const openOrders = await prisma.order.findMany({
      where: {
        tenant_slug: slug,
        status: { notIn: ["bezahlt", "storniert"] },
      },
      orderBy: { id: "asc" },
    });
    for (const o of openOrders) {
      if (
        o.table === targetTableName ||
        String(o.table).trim() === targetTableName.trim() ||
        String(o.table).trim() === `Tisch ${tNum}`
      ) {
        unpaidSum += o.total ?? 0;
      }
    }

    return NextResponse.json({ unpaid_sum: unpaidSum });
  } catch (err) {
    return errorResponse(err);
  }
}
