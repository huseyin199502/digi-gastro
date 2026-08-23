import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getTenantSession, safeEqual } from "@/lib/auth";
import { ApiError, errorResponse } from "@/lib/adminApi";
import { getActiveTenant, parseActiveTableNum } from "@/lib/tabletOps";
import { publishEvent } from "@/lib/eventBus";
import { berlinClockStr } from "@/lib/time";

export const dynamic = "force-dynamic";

// Legacy POST /api/{slug}/call-service (main.py ~9093)
// Body JSON: { "type": str, "table": str, "token": str? }
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
    const serviceTypeRaw = String(payload.type ?? "");
    const tableRaw = String(payload.table ?? "");
    const payloadToken =
      payload.token === undefined || payload.token === null
        ? null
        : String(payload.token);

    const { num: cleanNum, zone: cleanZone } = parseActiveTableNum(tableRaw);

    const store = await cookies();
    const sessionVal = store.get(`guest_session_${slug}`)?.value ?? null;

    // Zone aus Cookie, falls Payload keine hat
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
    const resolvedZone = cleanZone || cookieZone;

    const tablesList = await prisma.table.findMany({
      where: { tenant_slug: slug },
      orderBy: { id: "asc" },
    });

    // 1. Zone-specific lookup
    let dbTable = resolvedZone
      ? tablesList.find((t) => t.number === cleanNum && t.zone === resolvedZone)
      : undefined;
    // 2. Token-based lookup
    const tokLookup =
      payloadToken ??
      request.nextUrl.searchParams.get("token") ??
      request.headers.get("x-token");
    if (!dbTable && tokLookup) {
      dbTable = tablesList.find(
        (t) =>
          t.number === cleanNum &&
          (t.security_token === tokLookup ||
            t.active_session_token === tokLookup)
      );
    }
    // 3. Fallback: number only
    if (!dbTable) {
      dbTable = tablesList.find((t) => t.number === cleanNum);
    }

    let tok = tokLookup;
    if (!tok && sessionVal) {
      try {
        const [cTable, cTok] = splitSession(sessionVal);
        const parsed = parseActiveTableNum(cTable);
        if (parsed.num === cleanNum) tok = cTok;
      } catch {
        // ignore
      }
    }

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
      // Security: Kunden nur mit active_session_token
      const isTokenValid = Boolean(tok && tableToken && tok === tableToken);
      if (!isTokenValid) {
        throw new ApiError(
          "Ungültiger oder abgelaufener Tisch-Code.",
          403
        );
      }
    }

    let serviceType = serviceTypeRaw;
    if (serviceTypeRaw === "zahlen_bar") serviceType = "bar";
    else if (serviceTypeRaw === "zahlen_karte") serviceType = "karte";

    // Tisch-Name normalisieren: Zone immer angeben, wenn verfügbar
    const finalZone = dbTable?.zone || resolvedZone || cleanZone;
    const normalizedTable = finalZone
      ? `Tisch ${cleanNum} (${finalZone})`
      : `Tisch ${cleanNum}`;

    const newCall = await prisma.serviceCall.create({
      data: {
        tenant_slug: slug,
        table: normalizedTable,
        type: serviceType,
        timestamp: berlinClockStr(),
      },
    });

    // Live-Broadcast (Legacy main.py ~9193)
    publishEvent(slug, {
      type: "service_call",
      call_id: newCall.id,
      table: normalizedTable,
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
