import { cookies } from "next/headers";
import { prisma } from "./prisma";

// ──────────────────────────────────────────────────────────────────
// Session handling — legacy-compatible cookie format.
// Legacy (main.py ~line 3518): session cookie value is
//   "{slug}:Owner:chef:{password}"        for tenant owners
//   "{slug}:{staffName}:{role}:{pin}"     for staff logins
// and is validated against the DB (never trusted blindly).
// NOTE: the legacy system stores tenant passwords in plaintext;
// comparison semantics are preserved so restored data keeps working.
// ──────────────────────────────────────────────────────────────────

export const SESSION_COOKIE = "session";
export const PLATFORM_COOKIE = "digi_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 year, like legacy

/** Constant-time string comparison (anti timing-attack). */
export function safeEqual(a: string, b: string): boolean {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export interface TenantSession {
  slug: string;
  name: string;
  role: string; // "chef" | "kellner" | "zubereiter" | "bar"
  isOwner: boolean;
}

export function parseSessionCookie(value: string): {
  slug: string;
  name: string;
  role: string;
  pin: string;
} | null {
  const parts = value.split(":");
  if (parts.length < 4) return null;
  const slug = parts[0];
  const pin = parts.slice(3).join(":"); // password may contain ':'
  return { slug, name: parts[1], role: parts[2], pin };
}

/** Validates the unified session cookie against the database. */
export async function getTenantSession(
  cookieStore?: Awaited<ReturnType<typeof cookies>>
): Promise<TenantSession | null> {
  const store = cookieStore ?? (await cookies());
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const parsed = parseSessionCookie(raw);
  if (!parsed) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: parsed.slug },
    select: { slug: true, password: true, staff: { select: { name: true, role: true, pin: true, pin_code: true } } },
  });
  if (!tenant) return null;

  // Owner session
  if (parsed.name === "Owner" && parsed.role === "chef") {
    if (tenant.password && safeEqual(parsed.pin, tenant.password)) {
      return { slug: tenant.slug, name: "Owner", role: "chef", isOwner: true };
    }
    return null;
  }

  // Staff session — validate name+role+pin against DB (legacy behaviour)
  const staff = tenant.staff.find(
    (s) =>
      s.name === parsed.name &&
      s.role === parsed.role &&
      (safeEqual(parsed.pin, s.pin) || safeEqual(parsed.pin, s.pin_code))
  );
  if (!staff) return null;
  return { slug: tenant.slug, name: staff.name, role: staff.role, isOwner: false };
}

export function sessionCookieOptions() {
  // Legacy equivalent: secure=not _IS_LOCAL_DEV. Set COOKIE_SECURE=1 on
  // HTTPS production deployments; local HTTP runs keep plain cookies.
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.COOKIE_SECURE === "1",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };
}

/** Platform super-admin check (digi-gastro-admin panel). */
export async function getPlatformSession(
  cookieStore?: Awaited<ReturnType<typeof cookies>>
): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const store = cookieStore ?? (await cookies());
  const raw = store.get(PLATFORM_COOKIE)?.value;
  if (!raw) return false;
  return safeEqual(raw, adminPassword);
}
