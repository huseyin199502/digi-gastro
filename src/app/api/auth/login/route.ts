import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  PLATFORM_COOKIE,
  SESSION_COOKIE,
  safeEqual,
  sessionCookieOptions,
} from "@/lib/auth";

// Port of legacy POST /login (main.py ~3501)

export async function POST(req: NextRequest) {
  let email = "";
  let password = "";
  try {
    const body = await req.json();
    email = String(body.email ?? "").trim();
    password = String(body.password ?? "").trim();
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
    const res = NextResponse.json({ success: true, redirect: "/digi-gastro-admin" });
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
  const res = NextResponse.json({
    success: true,
    redirect: `/${tenant.slug}/admin`,
  });
  res.cookies.set(SESSION_COOKIE, sessionValue, sessionCookieOptions());
  return res;
}
