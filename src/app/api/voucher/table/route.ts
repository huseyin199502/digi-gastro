import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/voucher/table?slug=&table=
// Liefert den aktuell verwendeten Rabatt-Voucher für einen Tisch (falls vorhanden).
export async function GET(request: NextRequest) {
  try {
    const slug = (request.nextUrl.searchParams.get("slug") || "").toLowerCase().trim();
    const table = (request.nextUrl.searchParams.get("table") || "").trim();
    if (!slug || !table) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const voucher = await prisma.voucher.findFirst({
      where: { tenant_slug: slug, status: "used", used_table: table },
      orderBy: { used_at: "desc" },
      select: { discount_type: true, discount_value: true },
    });

    return NextResponse.json({
      ok: true,
      discount: voucher
        ? {
            type: voucher.discount_type,
            value: voucher.discount_value,
            label:
              voucher.discount_type === "percent"
                ? `${voucher.discount_value}%`
                : `${voucher.discount_value} €`,
          }
        : null,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}