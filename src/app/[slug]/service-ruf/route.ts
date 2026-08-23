import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getTenantSession, safeEqual } from "@/lib/auth";
import { ApiError, errorResponse } from "@/lib/adminApi";
import { getActiveTenant, parseActiveTableNum } from "@/lib/tabletOps";
import { publishEvent } from "@/lib/eventBus";
import { berlinClockStr } from "@/lib/time";

export const dynamic = "force-dynamic";

// DEPRECATED legacy POST /{slug}/service-ruf (main.py ~6230)
// Kept for backwards compatibility — prefer POST /api/{slug}/call-service.
// Differences to call-service: table lookup order token→zone→number,
// no zahlen_bar/zahlen_karte type mapping.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const tenant = await getActiveTenant(slug);

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    const serviceType = String(payload.type ?? "");
    const payloadTable = String(payload.table ?? "");

    const tableNum = payloadTable.replace("Tisch", "").split("(")[0].trim();
    // Zone aus Payload extrahieren
    let payloadZone = "";
    if (payloadTable.includes("(") && payloadTable.trim().endsWith(")")) {
      const idxP = payloadTable.indexOf("(");
      payloadZone = payloadTable.slice(idxP + 1, payloadTable.lastIndexOf(")")).trim();
    }

    const store = await cookies();
    const sessionVal = store.get(`guest_session_${slug}`)?.value ?? null;

    let cookieZone = "";
    if (sessionVal) {
      try {
        const [cTable] = splitSession(sessionVal);
        const parsed = parseActiveTableNum(cTable);
        if (parsed.zone) cookieZone = parsed.zone;
      } catch {
        // ignore
      }
    }
    const resolvedZone = payloadZone || cookieZone;

    let tok =
      (payload.token === undefined || payload.token === null
        ? null
        : String(payload.token)) ??
      request.nextUrl.searchParams.get("token") ??
      request.headers.get("x-token");
    if (!tok && sessionVal) {
      try {
        const [cTable, cTok] = splitSession(sessionVal);
        if (cTable.replace("Tisch", "").split("(")[0].trim() === tableNum) {
          tok = cTok;
        }
      } catch {
        // ignore
      }
    }

    const tablesList = await prisma.table.findMany({
      where: { tenant_slug: slug },
      orderBy: { id: "asc" },
    });

    // 1. Token-based lookup
    let dbTable = tok
      ? tablesList.find(
          (t) =>
            t.number === tableNum &&
            (t.security_token === tok || t.active_session_token === tok)
        )
      : undefined;
    // 2. Zone-specific lookup
    if (!dbTable && resolvedZone) {
      dbTable = tablesList.find(
        (t) => t.number === tableNum && t.zone === resolvedZone
      );
    }
    // 3. Fallback: number only
    if (!dbTable) {
      dbTable = tablesList.find((t) => t.number === tableNum);
    }

    const zone = dbTable?.zone ?? "";
    const callTableName = zone
      ? `Tisch ${tableNum} (${zone})`
      : `Tisch ${tableNum}`;
    const tableToken = dbTable?.active_session_token ?? null;

    // ── Staff / POS trusted device bypass ──
    const posCookie = store.get(`pos_token_${slug}`)?.value;
    let isStaff = Boolean(
      posCookie && tenant.pos_token && safeEqual(posCookie, tenant.pos_token)
    );
    if (!isStaff) {
      const session = await getTenantSession(store);
      if (
        session &&
        session.slug === slug &&
        (session.role === "chef" || session.role === "kellner")
      ) {
        isStaff = true;
      }
    }

    if (!isStaff) {
      const isTokenValid = Boolean(tok && tableToken && tok === tableToken);
      if (!isTokenValid) {
        throw new ApiError(
          "Ungültiger oder abgelaufener Tisch-Code.",
          403
        );
      }
    }

    const newCall = await prisma.serviceCall.create({
      data: {
        tenant_slug: slug,
        table: callTableName,
        type: serviceType,
        timestamp: berlinClockStr(),
      },
    });

    // Live-Broadcast (Legacy main.py ~6327)
    publishEvent(slug, {
      type: "service_call",
      call_id: newCall.id,
      table: callTableName,
      service_type: serviceType,
    });

    return NextResponse.json({ success: true, call_id: newCall.id });
  } catch (err) {
    return errorResponse(err);
  }
}

function splitSession(value: string): [string, string] {
  const idx = value.indexOf(":");
  if (idx === -1) throw new Error("bad session");
  return [value.slice(0, idx), value.slice(idx + 1)];
}
