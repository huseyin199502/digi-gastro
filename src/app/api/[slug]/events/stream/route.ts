import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscribeEvents, LiveEvent } from "@/lib/eventBus";

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

// ─── Auth: Port von _validate_ws_cookies (main.py ~554) ───
async function validateStreamAuth(
  slug: string,
  request: NextRequest
): Promise<boolean> {
  const slugLower = slug.toLowerCase().trim();
  const cookie = (name: string) => request.cookies.get(name)?.value ?? null;

  // 1. Unified admin session cookie (format: slug:name:role:pin)
  const session = cookie("session");
  if (session) {
    const parts = session.split(":");
    if (parts.length === 4 && parts[0] === slugLower) return true;
  }

  // 2. Legacy device-specific session cookie (slug:name:pin → 3 parts)
  const sessionLegacy = cookie(`session_${slugLower}`);
  if (sessionLegacy) {
    const parts = sessionLegacy.split(":");
    if (parts.length === 3) return true;
  }

  // 3. POS device cookie
  if (cookie(`pos_token_${slugLower}`)) return true;

  // 4. KDS device cookie
  const kds = cookie("kds_session");
  if (kds) {
    const parts = kds.split(":");
    if (parts.length >= 2 && parts[0] === slugLower) return true;
  }

  // 5. Guest session cookie (table:token) — Tenant muss existieren
  const guest = cookie(`guest_session_${slugLower}`);
  if (guest) {
    const parts = guest.split(":");
    if (parts.length === 2 && parts[0] && parts[1]) {
      const tenant = await prisma.tenant.findFirst({
        where: { slug: slugLower },
        select: { slug: true },
      });
      if (tenant) return true;
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