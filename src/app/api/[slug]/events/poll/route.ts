import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventVersion } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

// GET /api/{slug}/events/poll — Polling-Fallback für Clients ohne EventSource.
// Gibt { changed: boolean } zurück; der Client vergleicht per X-Live-Version
// Header (bzw. If-None-Match) mit seiner letzten bekannten Version.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase().trim();

  // Tenant muss existieren (Auth-light: Polling ist read-only, aber nur für
  // bestehende Tenants, damit kein Tenants-Brute-Forcing über Polls möglich ist).
  const tenant = await prisma.tenant.findFirst({
    where: { slug },
    select: { slug: true },
  });
  if (!tenant) {
    return NextResponse.json({ detail: "Restaurant nicht gefunden." }, { status: 404 });
  }

  const current = eventVersion(slug);
  const clientVersion = parseInt(
    request.headers.get("x-live-version") ?? request.nextUrl.searchParams.get("v") ?? "0",
    10
  );
  const changed = current > clientVersion;

  return NextResponse.json(
    { changed, version: current },
    {
      headers: { "X-Live-Version": String(current) },
    }
  );
}