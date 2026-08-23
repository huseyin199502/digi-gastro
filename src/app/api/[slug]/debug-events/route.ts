import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBerlinNow, berlinTimeStr, berlinWeekdayIndex, DAYS_NAMES, possibleDaysToday } from "@/lib/time";

export const dynamic = "force-dynamic";

// Legacy GET /api/{slug}/debug-events (main.py ~9711)
// Debug-Endpoint: zeigt alle Events + EventProducts + ob sie aktuell aktiv sind.
// Hilft bei der Diagnose, warum Event-Preise nicht angezeigt werden.
function isEventActiveNow(start: string, end: string, now: string): boolean {
  const s = start.padStart(5, "0");
  const e = end.padStart(5, "0");
  const n = now.padStart(5, "0");
  if (s <= e) return s <= n && n <= e;
  return n >= s || n <= e; // Mitternachts-Überschreitung (z.B. 16:00-01:10)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const slugLower = slug.toLowerCase().trim();

  const tenant = await prisma.tenant.findUnique({ where: { slug: slugLower } });
  if (!tenant) {
    return NextResponse.json(
      { detail: "Dieses Restaurant existiert nicht." },
      { status: 404 }
    );
  }
  const active = tenant.active ?? true;
  if (!active) {
    return NextResponse.json(
      { detail: "Dieses Restaurant ist derzeit deaktiviert." },
      { status: 403 }
    );
  }

  const berlinNow = getBerlinNow();
  const nowTime = berlinTimeStr(berlinNow);
  const possibleDays = possibleDaysToday(berlinNow);

  const events = await prisma.event.findMany({
    where: { tenant_slug: slugLower },
    orderBy: [{ position: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      days: true,
      start_time: true,
      end_time: true,
      mode: true,
      discount: true,
      is_active: true,
      _count: { select: { combos: true } },
      products: true,
    },
  });

  const result: Record<string, unknown> = {
    server_time: nowTime,
    weekday: DAYS_NAMES[berlinWeekdayIndex(berlinNow)],
    possible_days: possibleDays,
    events: events.map((ev) => {
      let evDays: string[] = [];
      try {
        const parsed = JSON.parse(ev.days || "[]");
        evDays = Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        evDays = [];
      }
      const start = String(ev.start_time || "18:00").padStart(5, "0");
      const end = String(ev.end_time || "20:00").padStart(5, "0");
      const isActiveFlag = ev.is_active ?? true;
      const isToday = evDays.some((d) => possibleDays.includes(d));
      const isActiveNow = isToday && isEventActiveNow(start, end, nowTime);
      return {
        id: ev.id,
        name: ev.name,
        is_active: isActiveFlag,
        is_today: isToday,
        is_active_now: isActiveNow,
        days: evDays,
        start_time: start,
        end_time: end,
        mode: ev.mode,
        discount: ev.discount,
        products: ev.products,
        combos_count: ev._count.combos,
      };
    }),
  };

  // Auch alle Produkte mit ihren Preisen anzeigen
  const products = await prisma.product.findMany({
    where: { tenant_slug: slugLower },
    orderBy: [{ position: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      price: true,
      happy_hour_price: true,
      category: true,
      is_available: true,
    },
  });
  result["products"] = products;

  return NextResponse.json(result);
}