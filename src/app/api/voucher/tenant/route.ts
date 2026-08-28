import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/voucher/tenant?slug=
// Liefert alle verwendeten (aktiven) Rabatt-Vouchers eines Tenants,
// aufgeschlüsselt nach Tisch: { table: { type, value, label } }
export async function GET(request: NextRequest) {
  try {
    const slug = (request.nextUrl.searchParams.get("slug") || "").toLowerCase().trim();
    if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

    const vouchers = await prisma.voucher.findMany({
      where: { tenant_slug: slug, status: "used" },
      select: { used_table: true, discount_type: true, discount_value: true },
    });

    const discounts: Record<string, { type: string; value: number; label: string }> = {};
    for (const v of vouchers) {
      if (!v.used_table) continue;
      discounts[v.used_table] = {
        type: v.discount_type,
        value: v.discount_value,
        label:
          v.discount_type === "percent"
            ? `${v.discount_value}%`
            : `${v.discount_value} €`,
      };
    }

    return NextResponse.json({ ok: true, discounts });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}