import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, platformRedirect, requirePlatformAdmin, wantsJson } from "@/lib/adminApi";
import { platformSuccess } from "@/lib/platformAdmin";

export const dynamic = "force-dynamic";

// POST /digi-gastro-admin/announcement-loeschen/{id} — Neuigkeit löschen
// (Views werden per CASCADE mitgelöscht → bei Neuanlage erscheint sie
// wieder auf allen Geräten).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { id } = await params;
    const annId = parseInt(id, 10);
    if (!Number.isFinite(annId)) throw new Error("Ungültige ID.");

    await prisma.announcement.delete({ where: { id: annId } }).catch(() => null);

    if (wantsJson(request)) return platformSuccess(request, "OK");
    return platformRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
