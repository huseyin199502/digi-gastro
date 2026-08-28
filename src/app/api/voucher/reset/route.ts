import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/voucher/reset — Body: { slug, table }
// Nach der Abrechnung eines Tisches wird der verwendete Rabatt-Code konsumiert
// (status -> "consumed"), damit der nächste Kunde am selben Tisch NICHT mehr
// den Rabatt des vorherigen Kunden erhält.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false }, { status: 400 });

    const slug = String(body.slug ?? "").trim().toLowerCase();
    const table = String(body.table ?? "").trim();
    if (!slug || !table) return NextResponse.json({ ok: false }, { status: 400 });

    await prisma.voucher.updateMany({
      where: { tenant_slug: slug, status: "used", used_table: table },
      data: { status: "consumed", used_table: null },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}