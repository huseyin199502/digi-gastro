import { randomInt, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { jsonError, platformRedirect, wantsJson } from "./adminApi";

// ──────────────────────────────────────────────────────────────────
// Response helpers for the /digi-gastro-admin platform endpoints.
// Legacy behaviour: form clients get 303 redirects back to the panel
// with ?success= / ?error= query params; fetch clients get JSON.
// ──────────────────────────────────────────────────────────────────

export function platformSuccess(
  request: Request,
  message: string,
  extra: Record<string, unknown> = {}
): NextResponse {
  if (wantsJson(request)) {
    return NextResponse.json({ success: true, message, ...extra });
  }
  return platformRedirect(
    request,
    `?success=${encodeURIComponent(message)}`
  );
}

export function platformError(
  request: Request,
  message: string,
  status = 400
): NextResponse {
  if (wantsJson(request)) {
    return jsonError(status, message);
  }
  return platformRedirect(
    request,
    `?error=${encodeURIComponent(message)}`
  );
}

/**
 * Legacy password generator format "Gastro-{NNNN}…!" — now CSPRNG with
 * additional entropy (numeric block + 8-char base64url suffix).
 */
export function generateTenantPassword(): string {
  const num = randomInt(1000, 10000);
  const suffix = randomBytes(8).toString("base64url");
  return `Gastro-${num}-${suffix}!`;
}

/** "+10.00"/"-5.00" — Python f"{value:+.2f}" equivalent */
export function signedFixed(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}
