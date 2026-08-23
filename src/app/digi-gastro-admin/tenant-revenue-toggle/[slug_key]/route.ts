import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, platformRedirect, requirePlatformAdmin, wantsJson } from "@/lib/adminApi";
import { platformSuccess } from "@/lib/platformAdmin";

export const dynamic = "force-dynamic";

// Legacy POST /digi-gastro-admin/tenant-revenue-toggle/{slug_key} (main.py ~5010)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug_key: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { slug_key } = await params;
    const slugLower = slug_key.toLowerCase().trim();

    const tenant = await prisma.tenant.findUnique({ where: { slug: slugLower } });
    let showRevenue: boolean | null = null;
    if (tenant) {
      // legacy: current = show_revenue or True; then toggle
      const current = tenant.show_revenue ?? true;
      showRevenue = !current;
      await prisma.tenant.update({
        where: { slug: slugLower },
        data: { show_revenue: showRevenue },
      });
    }

    if (wantsJson(request)) {
      return platformSuccess(request, "OK", { show_revenue: showRevenue });
    }
    return platformRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
