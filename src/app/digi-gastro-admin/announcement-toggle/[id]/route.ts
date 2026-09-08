import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, platformRedirect, requirePlatformAdmin, wantsJson } from "@/lib/adminApi";
import { platformSuccess } from "@/lib/platformAdmin";

export const dynamic = "force-dynamic";

// POST /digi-gastro-admin/announcement-toggle/{id} — Neuigkeit an/aus.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { id } = await params;
    const annId = parseInt(id, 10);
    if (!Number.isFinite(annId)) throw new Error("Ungültige ID.");

    const ann = await prisma.announcement.findUnique({ where: { id: annId } });
    if (ann) {
      await prisma.announcement.update({
        where: { id: annId },
        data: { is_active: !(ann.is_active ?? true) },
      });
    }

    if (wantsJson(request)) return platformSuccess(request, "OK");
    return platformRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
