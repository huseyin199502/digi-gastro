import { NextRequest, NextResponse } from "next/server";

// ──────────────────────────────────────────────────────────────────
// Generischer persistenter Geräte-Cookie (httpOnly, 1 Jahr).
// Genutzt für gerätespezifische Features (z. B. Onboarding-News im
// Admin-Dashboard: gleiche Zugangsdaten auf neuem Gerät → Neuigkeit
// erscheint dort erneut). Format/Optionen identisch zum Chat-Gerät.
// ──────────────────────────────────────────────────────────────────

export const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 Jahr

function deviceCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.COOKIE_SECURE === "1",
    maxAge: DEVICE_COOKIE_MAX_AGE,
    path: "/",
  };
}

/** Liest die Geräte-ID oder erzeugt eine neue (isNew → Cookie setzen!). */
export function resolvePersistentDevice(
  cookieName: string,
  request: NextRequest
): { deviceId: string; isNew: boolean } {
  const existing = request.cookies.get(cookieName)?.value ?? "";
  if (/^[A-Za-z0-9_-]{8,64}$/.test(existing)) {
    return { deviceId: existing, isNew: false };
  }
  return { deviceId: crypto.randomUUID(), isNew: true };
}

/** Setzt den Geräte-Cookie auf die Antwort (nur bei isNew nötig). */
export function applyPersistentDeviceCookie(
  response: NextResponse,
  cookieName: string,
  deviceId: string
): void {
  response.cookies.set(cookieName, deviceId, deviceCookieOptions());
}

export function isValidDeviceId(deviceId: string): boolean {
  return /^[A-Za-z0-9_-]{8,64}$/.test(deviceId);
}
