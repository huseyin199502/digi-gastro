import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Legacy GET /api/staff-by-email (main.py ~8075)
// Liefert alle Mitarbeiter eines Tenants (für Kellner-Login-Dropdown),
// gesucht anhand der Restaurant-E-Mail.
// Rate-Limit schützt vor Enumeration bekannter E-Mail-Adressen.

const lookupAttempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 20;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = lookupAttempts.get(key);
  if (!entry || entry.resetAt <= now) {
    lookupAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (lookupAttempts.size > 5000) lookupAttempts.clear();
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function GET(request: NextRequest) {
  const fwd = request.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || "unknown";
  if (rateLimited(`ip:${ip}`)) {
    return NextResponse.json(
      { staff: [], error: "Zu viele Anfragen." },
      { status: 429 }
    );
  }

  const email = request.nextUrl.searchParams.get("email") ?? "";
  if (!email || !email.trim()) {
    return NextResponse.json({
      staff: [],
      error: "Keine E-Mail angegeben",
    });
  }
  if (rateLimited(`email:${email.trim().toLowerCase()}`)) {
    return NextResponse.json(
      { staff: [], error: "Zu viele Anfragen." },
      { status: 429 }
    );
  }

  const tenant = await prisma.tenant.findFirst({
    where: { email: email.trim() },
  });
  if (!tenant) {
    // Einheitliche Antwort — keine Enumeration, ob E-Mail existiert
    return NextResponse.json({
      staff: [],
      error: "Restaurant nicht gefunden",
    });
  }

  const staff = await prisma.staff.findMany({
    where: { tenant_slug: tenant.slug },
    orderBy: { id: "asc" },
  });

  return NextResponse.json({
    tenant: tenant.slug,
    restaurant_name: tenant.name || tenant.slug,
    staff: staff.map((s) => ({ name: s.name, role: s.role || "kellner" })),
  });
}
