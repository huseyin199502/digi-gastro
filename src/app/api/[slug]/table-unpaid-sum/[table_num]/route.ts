import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import { ApiError, errorResponse } from "@/lib/adminApi";
import { getActiveTenant, parseActiveTableNum } from "@/lib/tabletOps";
import {
  isCookieSessionValid,
  parseGuestCookieValue,
  resolveTable,
} from "@/lib/guestSession";

export const dynamic = "force-dynamic";

// Legacy GET /api/{slug}/table-unpaid-sum/{table_num} (main.py ~9947)
// Auth: gültige Gast-Session für den Tisch ODER Staff-Session des Tenants.
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

    const cookieStore = await cookies();
    const sessionVal = cookieStore.get(`guest_session_${slug}`)?.value ?? null;
    const staffSession = await getTenantSession(cookieStore);
    const isStaff = staffSession !== null && staffSession.slug === slug;

    let allowed = false;
    let cookieZone = "";
    let cToken: string | null = null;

    if (isStaff) {
      allowed = true;
    } else if (sessionVal) {
      const parsedGuest = parseGuestCookieValue(sessionVal);
      if (parsedGuest) {
        const parsedTable = parseActiveTableNum(parsedGuest.table);
        if (parsedTable.num === tNum) {
          const table = await resolveTable(slug, parsedTable.num, parsedTable.zone || null);
          if (table && (await isCookieSessionValid(slug, table, parsedGuest.token))) {
            allowed = true;
            cToken = parsedGuest.token;
            cookieZone = parsedTable.zone;
          }
        }
      }
    }
    if (!allowed) {
      throw new ApiError("Kein Zugriff auf diesen Tisch.", 403);
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
