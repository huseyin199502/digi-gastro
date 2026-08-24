import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  PLATFORM_COOKIE,
  SESSION_COOKIE,
  safeEqual,
  sessionCookieOptions,
} from "@/lib/auth";

// Port of legacy POST /login (main.py ~3501)
// Supports both the modern JSON client request and a native HTML form
// fallback for older WebKit/iPadOS versions where Client Component events
// may not hydrate reliably.

export async function POST(req: NextRequest) {
  let email = "";
  let password = "";
  const contentType = req.headers.get("content-type") ?? "";
  const nativeFormSubmit = !contentType.toLowerCase().includes("application/json");

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
    return NextResponse.json(
      { success: false, error: "Ungültige Anfrage." },
      { status: 400 }
    );
  }

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email und Passwort erforderlich." },
      { status: 400 }
    );
  }

  // Platform super-admin login (legacy: admin@digi-gastro.de + ADMIN_PASSWORD)
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (email === "admin@digi-gastro.de" && adminPassword && safeEqual(password, adminPassword)) {
    const redirect = "/digi-gastro-admin";
    const res = nativeFormSubmit
      ? NextResponse.redirect(new URL(redirect, req.url), 303)
      : NextResponse.json({ success: true, redirect });
    res.cookies.set(PLATFORM_COOKIE, adminPassword, sessionCookieOptions());
    return res;
  }

  const tenant = await prisma.tenant.findFirst({ where: { email } });
  if (!tenant || !safeEqual(password, tenant.password)) {
    return NextResponse.json(
      { success: false, error: "Ungültige Zugangsdaten." },
      { status: 401 }
    );
  }
  if (tenant.active === false) {
    return NextResponse.json(
      { success: false, error: "Dieses Restaurant ist derzeit deaktiviert." },
      { status: 403 }
    );
  }

  // Legacy-compatible session cookie: "{slug}:Owner:chef:{password}"
  const sessionValue = `${tenant.slug}:Owner:chef:${tenant.password}`;
  const redirect = `/${tenant.slug}/admin`;
  const res = nativeFormSubmit
    ? NextResponse.redirect(new URL(redirect, req.url), 303)
    : NextResponse.json({ success: true, redirect });
  res.cookies.set(SESSION_COOKIE, sessionValue, sessionCookieOptions());
  return res;
}