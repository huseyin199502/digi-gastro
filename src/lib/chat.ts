import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";
import { getTenantSession } from "./auth";
import {
  guestCookieName,
  isCookieSessionValid,
  parseActiveTableNum,
  parseGuestCookieValue,
  resolveTable,
  tableDisplayName,
} from "./guestSession";

// ──────────────────────────────────────────────────────────────────
// Öffentlicher Gast-Chat (per Tenant abschaltbar via tenants.chat_enabled).
//
// Identität: Die Chat-Identität ist der TISCHNAME aus dem QR-Scan
// ("Tisch 1") — nicht frei wählbar (Betrugsschutz: niemand kann sich
// "Admin" oder einen anderen Tischnamen erschreiben). Zusätzlich läuft
// ein persistenter Geräte-Cookie (chat_device_{slug}, 1 Jahr,
// httpOnly) für Ban-Erzwingung und "own"-Zuordnung.
//
// DSGVO: Es werden nur Geräte-ID, Tischname und Nachrichtentext
// gespeichert, Nachrichten werden nach 7 Tagen automatisch gelöscht
// (siehe /api/auto-heal), gelöschte Nachrichten werden mit Inhalt
// entfernt (Datenminimierung).
// ──────────────────────────────────────────────────────────────────

export const CHAT_DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 Jahr
export const CHAT_MESSAGE_MAX_LEN = 300;
export const CHAT_RETENTION_DAYS = 7;
/** Gäste dürfen eigene Nachrichten nur binnen 5 Minuten löschen. */
export const CHAT_EDIT_WINDOW_MS = 5 * 60 * 1000;

/** Rate-Limit: max. CHAT_BURST Nachrichten in 60 s, min. Abstand 1,5 s. */
const CHAT_BURST = 10;
const CHAT_BURST_WINDOW_MS = 60_000;
const CHAT_MIN_INTERVAL_MS = 1_500;

export function chatDeviceCookieName(slug: string): string {
  return `chat_device_${slug.toLowerCase().trim()}`;
}

function chatCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.COOKIE_SECURE === "1",
    maxAge: CHAT_DEVICE_COOKIE_MAX_AGE,
    path: "/",
  };
}

/**
 * Liest die Geräte-ID aus dem Cookie oder erzeugt eine neue.
 * `isNew` → Aufrufer MUSS den Cookie über response.cookies.set() setzen.
 */
export function resolveChatDevice(
  slug: string,
  request: NextRequest
): { deviceId: string; isNew: boolean } {
  const name = chatDeviceCookieName(slug);
  const existing = request.cookies.get(name)?.value ?? "";
  if (/^[A-Za-z0-9_-]{8,64}$/.test(existing)) {
    return { deviceId: existing, isNew: false };
  }
  return { deviceId: crypto.randomUUID(), isNew: true };
}

/** Setzt den Geräte-Cookie auf die Antwort (nur bei isNew nötig). */
export function applyChatDeviceCookie(
  slug: string,
  response: NextResponse,
  deviceId: string
): void {
  response.cookies.set(chatDeviceCookieName(slug), deviceId, chatCookieOptions());
}

/** Erkennt eine Restaurant-Session (chef/kellner) für denselben Tenant. */
export async function resolveChatStaff(
  slug: string
): Promise<{ name: string; isOwner: boolean } | null> {
  const session = await getTenantSession();
  if (!session || session.slug !== slug.toLowerCase().trim()) return null;
  if (session.role !== "chef" && session.role !== "kellner") return null;
  return { name: session.name, isOwner: session.isOwner };
}

/**
 * Chat-Identität aus der GüLTIGEN Tisch-Session (QR-Scan) ableiten:
 * "Tisch 1" bzw. mit Zone "Tisch 1 (Innen)", wenn die Tischnummer im
 * Tenant mehrfach existiert. Ohne gültige Session → "Gast" (POST wird
 * in dem Fall abgelehnt — kein Schreiben ohne gescannten Tisch).
 */
export async function resolveChatIdentity(
  slug: string,
  request: NextRequest
): Promise<string> {
  const guest = request.cookies.get(guestCookieName(slug))?.value ?? "";
  const parsed = parseGuestCookieValue(guest);
  if (parsed) {
    const { num, zone } = parseActiveTableNum(parsed.table);
    const table =
      (await resolveTable(slug, num, zone || null)) ??
      (zone ? await resolveTable(slug, num, null) : null);
    if (table && (await isCookieSessionValid(slug, table, parsed.token))) {
      const sameNumberCount = await prisma.table.count({
        where: { tenant_slug: slug, number: num },
      });
      return sameNumberCount > 1 && table.zone
        ? tableDisplayName(num, table.zone)
        : `Tisch ${num}`;
    }
  }
  return "Gast";
}

// ── Rate-Limit (In-Memory, Single-Process wie eventBus) ──

const sendLog = new Map<string, number[]>();

export function chatRateLimitCheck(
  slug: string,
  deviceId: string
): { ok: true } | { ok: false; retryAfterS: number } {
  const key = `${slug}:${deviceId}`;
  const now = Date.now();
  const stamps = (sendLog.get(key) ?? []).filter(
    (t) => now - t < CHAT_BURST_WINDOW_MS
  );
  const last = stamps.length > 0 ? stamps[stamps.length - 1] : 0;
  if (now - last < CHAT_MIN_INTERVAL_MS) {
    return {
      ok: false,
      retryAfterS: Math.max(1, Math.ceil((CHAT_MIN_INTERVAL_MS - (now - last)) / 1000)),
    };
  }
  if (stamps.length >= CHAT_BURST) {
    return {
      ok: false,
      retryAfterS: Math.max(1, Math.ceil((CHAT_BURST_WINDOW_MS - (now - stamps[0])) / 1000)),
    };
  }
  stamps.push(now);
  sendLog.set(key, stamps);
  if (sendLog.size > 5000) {
    // Gelegenentlich aufräumen: veraltete Einträge verwerfen
    for (const [k, v] of sendLog) {
      if (v.length === 0 || now - v[v.length - 1] > CHAT_BURST_WINDOW_MS) {
        sendLog.delete(k);
      }
    }
  }
  return { ok: true };
}

// ── Sanitizing ──

/** Entfernt Steuerzeichen, begrenzt die Länge. */
export function sanitizeChatText(raw: unknown, maxLen: number): string {
  const s = String(raw ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return s.slice(0, maxLen);
}

/** Gültige Geräte-ID für Ban-Endpunkte (Format wie resolveChatDevice). */
export function isValidChatDeviceId(deviceId: string): boolean {
  return /^[A-Za-z0-9_-]{8,64}$/.test(deviceId);
}
