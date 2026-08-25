import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false }, { status: 400 });

    const id = Number(body.id);
    const event = String(body.event ?? "");
    if (!id || (event !== "impression" && event !== "click")) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const field = event === "impression" ? "impressions" : "clicks";
    await prisma.$executeRawUnsafe(
      `UPDATE ad_banners SET ${field} = ${field} + 1 WHERE id = $1`,
      id
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
