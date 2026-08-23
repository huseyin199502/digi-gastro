import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requirePlatformAdmin } from "@/lib/adminApi";
import { platformRedirect } from "@/lib/adminApi";
import { platformSuccess } from "@/lib/platformAdmin";
import { wantsJson } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /digi-gastro-admin/tenant-toggle/{slug_key} (main.py ~4958)
// Toggles tenant.active; legacy always redirected back to the panel.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug_key: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { slug_key } = await params;
    const slugLower = slug_key.toLowerCase().trim();

    const tenant = await prisma.tenant.findUnique({ where: { slug: slugLower } });
    let active: boolean | null = null;
    if (tenant) {
      active = !(tenant.active ?? true);
      await prisma.tenant.update({
        where: { slug: slugLower },
        data: { active },
      });
    }

    if (wantsJson(request)) {
      return platformSuccess(request, "OK", { active });
    }
    return platformRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
