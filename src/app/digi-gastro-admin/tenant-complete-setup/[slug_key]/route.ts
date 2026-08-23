import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, platformRedirect, requirePlatformAdmin, wantsJson } from "@/lib/adminApi";
import { platformSuccess } from "@/lib/platformAdmin";

export const dynamic = "force-dynamic";

// Legacy POST /digi-gastro-admin/tenant-complete-setup/{slug_key} (main.py ~5032)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug_key: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { slug_key } = await params;
    const slugLower = slug_key.toLowerCase().trim();

    const tenant = await prisma.tenant.findUnique({ where: { slug: slugLower } });
    if (tenant) {
      await prisma.tenant.update({
        where: { slug: slugLower },
        data: { is_setup_completed: true },
      });
    }

    if (wantsJson(request)) {
      return platformSuccess(request, "OK", { is_setup_completed: true });
    }
    return platformRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
