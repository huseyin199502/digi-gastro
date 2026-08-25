import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireChef, errorResponse, ApiError } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// DELETE /admin/ads/[id] — Banner löschen (Pfad-Route, robust gegen
// DELETE+Query-String-Probleme im Produktiv-Build).
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireChef();
    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!id) throw new ApiError("Banner-ID ist erforderlich.", 400);

    const existing = await prisma.adBanner.findFirst({
      where: { id, tenant_slug: session.slug },
    });
    if (!existing) throw new ApiError("Banner nicht gefunden.", 404);

    await prisma.adBanner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}