import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  guestCookieName,
  guestCookieOptions,
  isHttps,
  isQueryTokenValid,
  resolveTable,
} from "@/lib/guestSession";

// ──────────────────────────────────────────────────────────────────
// QR-Scan session bootstrap — port of the legacy menu GET flow
// (main.py ~5346-5500). Validates ?table=&token=[&z=&role=] and sets
// the guest_session_{slug} cookie, then redirects to the clean URL.
// Invalid scans → /{slug}/sitz-expired.
// ──────────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase().trim();

  const sp = req.nextUrl.searchParams;
  const tableQ = (
    sp.get("table") ??
    sp.get("tisch") ??
    sp.get("t") ??
    ""
  )
    .trim();
  const tokenQ = (sp.get("token") ?? sp.get("tk") ?? "").trim();
  const zoneQ = (sp.get("z") ?? "").trim();
  const role = sp.get("role") ?? "";

  // Öffentliche Basis hinter Reverse-Proxy. Priorität:
  // PUBLIC_BASE_URL (env) → X-Forwarded-* → Host-Header.
  const envBase = (process.env.PUBLIC_BASE_URL ?? "").trim();
  const fwdHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const fwdProto = req.headers.get("x-forwarded-proto") ?? (fwdHost.includes("localhost") ? "http" : "https");
  const pubBase = envBase || (fwdHost ? `${fwdProto}://${fwdHost}` : "");

  const toSitzExpired = () => {
    const res = NextResponse.redirect(
      new URL(`${pubBase}/${slug}/sitz-expired`)
    );
    res.cookies.set(guestCookieName(slug), "", {
      ...guestCookieOptions(isHttps(req.url)),
      maxAge: 0,
    });
    return res;
  };

  if (!tableQ || !tokenQ) return toSitzExpired();

  const table = await resolveTable(slug, tableQ, zoneQ || null);
  if (!table) return toSitzExpired();

  if (!(await isQueryTokenValid(slug, tokenQ, table))) {
    return toSitzExpired();
  }

  // Ensure an active session token exists (created once, kept for all
  // scanners at the same table until paid/cancelled — legacy Option B).
  let activeToken = table.activeSessionToken;
  if (!activeToken) {
    activeToken = randomBytes(4).toString("hex");
    await prisma.table.update({
      where: { id: table.id },
      data: { active_session_token: activeToken },
    });
  }

  const redirectUrl = new URL(`${pubBase}/${slug}`);
  if (role) redirectUrl.searchParams.set("role", role);

  const res = NextResponse.redirect(redirectUrl);
  res.cookies.set(
    guestCookieName(slug),
    `${table.displayName}:${activeToken}`,
    guestCookieOptions(isHttps(req.url))
  );
  return res;
}
