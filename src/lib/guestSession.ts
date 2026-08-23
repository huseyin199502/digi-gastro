import { prisma } from "./prisma";

// ──────────────────────────────────────────────────────────────────
// Guest session handling — port of the legacy QR-scan flow
// (main.py ~5306-5558): table/token validation, active session
// token, guest_session_{slug} cookie ("Tisch 1 (Drinnen):<token>").
// ──────────────────────────────────────────────────────────────────

export const GUEST_COOKIE_MAX_AGE = 1800; // 30 minutes, like legacy

export function guestCookieName(slug: string): string {
  return `guest_session_${slug.toLowerCase()}`;
}

export function loyaltyCustomerCookieName(slug: string): string {
  return `loyalty_${slug.toLowerCase()}_cid`;
}

/** "Tisch 1 (Drinnen):abc123" → { table, token } */
export function parseGuestCookieValue(
  value: string
): { table: string; token: string } | null {
  const idx = value.indexOf(":");
  if (idx <= 0) return null;
  return { table: value.slice(0, idx).trim(), token: value.slice(idx + 1) };
}

/** "Tisch 1 (Drinnen)" → { num: "1", zone: "Drinnen" } */
export function parseActiveTableNum(raw: string): {
  num: string;
  zone: string;
} {
  let clean = String(raw).trim();
  if (clean.startsWith("Tisch ")) clean = clean.slice("Tisch ".length).trim();
  let zone = "";
  if (clean.includes("(") && clean.endsWith(")")) {
    const idx = clean.indexOf("(");
    zone = clean.slice(idx + 1, -1).trim();
    clean = clean.slice(0, idx).trim();
  }
  return { num: clean, zone };
}

export function tableDisplayName(num: string, zone: string | null): string {
  return zone ? `Tisch ${num} (${zone})` : `Tisch ${num}`;
}

export interface ResolvedTable {
  id: number;
  num: string;
  zone: string | null;
  displayName: string;
  activeSessionToken: string | null;
}

/**
 * Find the table for a table number, matching the optional zone
 * (legacy semantics: if a zone is given it MUST match — no fallback).
 */
export async function resolveTable(
  slug: string,
  tableNum: string,
  zone?: string | null
): Promise<ResolvedTable | null> {
  const num = String(tableNum).trim();
  if (!num) return null;
  const candidates = await prisma.table.findMany({
    where: { tenant_slug: slug.toLowerCase(), number: num },
  });
  if (candidates.length === 0) return null;

  const match = zone
    ? candidates.find(
        (t) => (t.zone ?? "").toLowerCase() === zone.trim().toLowerCase()
      ) ?? null
    : candidates[0];

  if (!match) return null;
  return {
    id: match.id,
    num,
    zone: match.zone || null,
    displayName: tableDisplayName(num, match.zone || null),
    activeSessionToken: match.active_session_token ?? null,
  };
}

/**
 * Validate a token from a QR scan (?table=&token=) against the
 * printed table token, the active session token or the tenant master
 * token — identical to legacy main.py ~5421.
 */
export async function isQueryTokenValid(
  slug: string,
  queryToken: string,
  table: ResolvedTable
): Promise<boolean> {
  if (!queryToken) return false;
  const tenant = await prisma.tenant.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { security_token: true },
  });
  const masterToken = tenant?.security_token ?? null;
  const tableRow = await prisma.table.findUnique({
    where: { id: table.id },
    select: { security_token: true, active_session_token: true },
  });
  const printedToken = tableRow?.security_token ?? null;
  const activeSessionTok = tableRow?.active_session_token ?? null;
  return Boolean(
    (printedToken && queryToken === printedToken) ||
      (activeSessionTok && queryToken === activeSessionTok) ||
      (masterToken && queryToken === masterToken)
  );
}

/** Does this table have any open (not paid/cancelled) orders? */
export async function tableHasOpenOrders(
  slug: string,
  displayName: string
): Promise<boolean> {
  const count = await prisma.order.count({
    where: {
      tenant_slug: slug.toLowerCase(),
      status: { notIn: ["bezahlt", "storniert"] },
      table: displayName,
    },
  });
  return count > 0;
}

/**
 * Validate a cookie-held session token against the table's
 * active_session_token (legacy main.py ~5520-5526). Only the
 * active session token is valid for guest cookies.
 */
export async function isCookieSessionValid(
  slug: string,
  table: ResolvedTable,
  cookieToken: string
): Promise<boolean> {
  if (!cookieToken || !table.activeSessionToken) return false;
  return cookieToken === table.activeSessionToken;
}

export function guestCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    maxAge: GUEST_COOKIE_MAX_AGE,
    path: "/",
  };
}

export function isHttps(requestUrl: string): boolean {
  try {
    const u = new URL(requestUrl);
    return (
      u.protocol === "https:" && !["localhost", "127.0.0.1"].includes(u.hostname)
    );
  } catch {
    return false;
  }
}
