import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  PLATFORM_COOKIE,
  SESSION_COOKIE,
  safeEqual,
  sessionCookieOptions,
} from "@/lib/auth";

// Port of legacy POST /login (main.py ~3501)
// Unterstützt sowohl den modernen JSON-Client (fetch) als auch den nativen
// HTML-Form-POST (Fallback für ältere WebKit/iPadOS-Versionen, bei denen
// Client-Komponenten-Events nicht zuverlässig hydratisieren).
// Wichtig: Bei nativem Form-POST wird IMMER ein Redirect geliefert
// (Erfolg -> Dashboard, Fehler -> /login?error=...), nie JSON.

function cookieOptions(req: NextRequest) {
  const base = sessionCookieOptions();
  // Secure-Cookie nur setzen, wenn die Anfrage über HTTPS kam. Über HTTP
  // (z.B. altes iPad im LAN) würde ein Secure-Cookie sonst nie gespeichert
  // und der Login fehlschlägt.
  const proto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const isHttps = proto.toLowerCase() === "https";
  return { ...base, secure: process.env.COOKIE_SECURE === "1" && isHttps };
}

export async function POST(req: NextRequest) {
  let email = "";
  let password = "";
  const contentType = req.headers.get("content-type") ?? "";
  const nativeFormSubmit = !contentType
    .toLowerCase()
    .includes("application/json");

  try {
    if (contentType.toLowerCase().includes("application/json")) {
      const body = await req.json();
      email = String(body.email ?? "").trim();
      password = String(body.password ?? "").trim();
    } else {
      const form = await req.formData();
      email = String(form.get("email") ?? "").trim();
      password = String(form.get("password") ?? "").trim();
    }
  } catch {
    const msg = "Ungültige Anfrage.";
    if (nativeFormSubmit) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(msg)}`, req.url),
        303
      );
    }
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }

  const errRedirect = (msg: string, status: number) => {
    if (nativeFormSubmit) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(msg)}`, req.url),
        303
      );
    }
    return NextResponse.json({ success: false, error: msg }, { status });
  };

  if (!email || !password) {
    return errRedirect("Email und Passwort erforderlich.", 400);
  }

  // Platform super-admin login (legacy: admin@digi-gastro.de + ADMIN_PASSWORD)
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (
    email === "admin@digi-gastro.de" &&
    adminPassword &&
    safeEqual(password, adminPassword)
  ) {
    const redirect = "/digi-gastro-admin";
    const res = nativeFormSubmit
      ? NextResponse.redirect(new URL(redirect, req.url), 303)
      : NextResponse.json({ success: true, redirect });
    res.cookies.set(PLATFORM_COOKIE, adminPassword, cookieOptions(req));
    return res;
  }

  const tenant = await prisma.tenant.findFirst({ where: { email } });
  if (!tenant || !safeEqual(password, tenant.password)) {
    return errRedirect("Ungültige Zugangsdaten.", 401);
  }
  if (tenant.active === false) {
    return errRedirect(
      "Dieses Restaurant ist derzeit deaktiviert.",
      403
    );
  }

  // Legacy-compatible session cookie: "{slug}:Owner:chef:{password}"
  const sessionValue = `${tenant.slug}:Owner:chef:${tenant.password}`;
  const redirect = `/${tenant.slug}/admin`;
  const res = nativeFormSubmit
    ? NextResponse.redirect(new URL(redirect, req.url), 303)
    : NextResponse.json({ success: true, redirect });
  res.cookies.set(SESSION_COOKIE, sessionValue, cookieOptions(req));
  return res;
}