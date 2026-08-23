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

/** Legacy password generator: "Gastro-{1000..9999}!" */
export function generateTenantPassword(): string {
  return `Gastro-${Math.floor(1000 + Math.random() * 9000)}!`;
}

/** "+10.00"/"-5.00" — Python f"{value:+.2f}" equivalent */
export function signedFixed(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}
