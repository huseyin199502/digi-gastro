import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/voucher/claim
// Gast gibt einen Rabattcode ein und validiert ihn (1x gültig).
// Bei Erfolg wird der Voucher als "used" markiert und an den Tisch gebunden.
// Body: { slug, code, table }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "Invalid" }, { status: 400 });

    const slug = String(body.slug ?? "").trim().toLowerCase();
    const code = String(body.code ?? "").trim().toUpperCase();
    const table = String(body.table ?? "").trim();
    if (!slug || !code || !table) {
      return NextResponse.json({ ok: false, error: "Code und Tisch fehlen." }, { status: 400 });
    }

    const voucher = await prisma.voucher.findUnique({ where: { code } });
    if (!voucher) {
      return NextResponse.json({ ok: false, error: "Ungültiger Code." }, { status: 404 });
    }
    if (voucher.tenant_slug !== slug) {
      return NextResponse.json({ ok: false, error: "Code gilt nicht für dieses Restaurant." }, { status: 400 });
    }
    if (voucher.status === "used") {
      return NextResponse.json({ ok: false, error: "Code wurde bereits verwendet." }, { status: 409 });
    }
    if (voucher.status !== "active") {
      return NextResponse.json({ ok: false, error: "Code ist nicht aktiv." }, { status: 400 });
    }

    // Atomar markieren (1x gültig) — nur wenn noch aktiv
    const updated = await prisma.voucher.updateMany({
      where: { id: voucher.id, status: "active" },
      data: { status: "used", used_table: table, used_at: new Date() },
    });
    if (updated.count === 0) {
      return NextResponse.json({ ok: false, error: "Code wurde bereits verwendet." }, { status: 409 });
    }

    return NextResponse.json({
      ok: true,
      discount: {
        type: voucher.discount_type,
        value: voucher.discount_value,
        label:
          voucher.discount_type === "percent"
            ? `${voucher.discount_value}%`
            : `${voucher.discount_value} €`,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Serverfehler." }, { status: 500 });
  }
}