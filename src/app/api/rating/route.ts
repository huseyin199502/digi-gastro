import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/rating — Gast bewertet das Restaurant in der App.
// Body: { slug, rating (1-5), comment?, table? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false }, { status: 400 });

    const slug = String(body.slug ?? "").trim().toLowerCase();
    const rating = Math.max(1, Math.min(5, Math.round(Number(body.rating))));
    if (!slug) return NextResponse.json({ ok: false }, { status: 400 });
    if (Number.isNaN(rating)) return NextResponse.json({ ok: false }, { status: 400 });

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) return NextResponse.json({ ok: false }, { status: 404 });

    await prisma.review.create({
      data: {
        tenant_slug: slug,
        table_name: body.table ? String(body.table).slice(0, 80) : null,
        rating,
        comment: body.comment ? String(body.comment).slice(0, 2000) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}