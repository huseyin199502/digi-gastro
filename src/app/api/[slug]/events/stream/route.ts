import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscribeEvents, LiveEvent } from "@/lib/eventBus";
import { getTenantSession, safeEqual } from "@/lib/auth";
import {
  isCookieSessionValid,
  parseGuestCookieValue,
  resolveTable,
} from "@/lib/guestSession";

export const dynamic = "force-dynamic";

// Legacy GET /api/{slug}/events/stream (ersetzt WebSocket /ws/{slug}).
// SSE-Endpunkt: authentifizierte Clients abonnieren den per-tenant Event-Bus.
// Event-Format identisch zum Legacy-WebSocket:
//   data: {"type":"new_order","order_id":5,"table_number":"1","status":"eingegangen"}
// Heartbeat alle 25s als SSE-Kommentar hält Proxies/Timeouts offen.

const HEARTBEAT_MS = 25000;

function sseEncode(event: LiveEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// ─── Auth: Port von _validate_ws_cookies (main.py ~554) — echte Validierung ───
async function validateStreamAuth(
  slug: string,
  request: NextRequest
): Promise<boolean> {
  const slugLower = slug.toLowerCase().trim();
  const cookie = (name: string) => request.cookies.get(name)?.value ?? null;

  // 1. Unified admin/staff session — gegen DB validiert (nie nur Format)
  const sessionRaw = cookie("session");
  if (sessionRaw) {
    try {
      const store = await (await import("next/headers")).cookies();
      const session = await getTenantSession(store);
      if (session && session.slug === slugLower) return true;
    } catch {
      // fall through
    }
  }

  // 2. Legacy device-specific session cookie (slug:name:pin → 3 parts)
  const sessionLegacy = cookie(`session_${slugLower}`);
  if (sessionLegacy) {
    const parts = sessionLegacy.split(":");
    if (parts.length === 3 && parts[0] === slugLower) {
      const tenant = await prisma.tenant.findUnique({
        where: { slug: slugLower },
        select: {
          password: true,
          staff: { select: { name: true, pin: true, pin_code: true } },
        },
      });
      if (tenant) {
        const name = parts[1];
        const pin = parts.slice(2).join(":");
        if (name === "Owner" && tenant.password && safeEqual(pin, tenant.password)) {
          return true;
        }
        const staff = tenant.staff.find(
          (s) => s.name === name && (safeEqual(pin, s.pin) || safeEqual(pin, s.pin_code))
        );
        if (staff) return true;
      }
    }
  }

  // 3. POS device cookie — Token-Wert muss dem tenant.pos_token entsprechen
  const posCookie = cookie(`pos_token_${slugLower}`);
  if (posCookie) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: slugLower },
      select: { pos_token: true },
    });
    if (tenant?.pos_token && safeEqual(posCookie, tenant.pos_token)) return true;
  }

  // 4. Guest session cookie (table:token) — active_session_token prüfen
  const guest = cookie(`guest_session_${slugLower}`);
  if (guest) {
    const parsed = parseGuestCookieValue(guest);
    if (parsed) {
      const table = await resolveTable(slugLower, parsed.table);
      if (table && (await isCookieSessionValid(slugLower, table, parsed.token))) {
        return true;
      }
    }
  }

  return false;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase().trim();

  if (!(await validateStreamAuth(slug, request))) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const encoder = new TextEncoder();
  let unsubscribe: () => void = () => {};
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Initialer Kommentar — Verbindungsaufbau bestätigen
      controller.enqueue(encoder.encode(": connected\n\n"));

      const onEvent = (event: LiveEvent) => {
        try {
          controller.enqueue(encoder.encode(sseEncode(event)));
        } catch {
          // Stream geschlossen — Subscriber wird über cancel() entfernt
        }
      };

      unsubscribe = subscribeEvents(slug, onEvent);

      // Heartbeat alle 25s (hält Proxies/Idle-Timeout offen)
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          /* stream closed */
        }
      }, HEARTBEAT_MS);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}