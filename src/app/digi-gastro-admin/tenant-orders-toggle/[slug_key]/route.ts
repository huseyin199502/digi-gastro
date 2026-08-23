import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, platformRedirect, requirePlatformAdmin, wantsJson } from "@/lib/adminApi";
import { platformSuccess } from "@/lib/platformAdmin";

export const dynamic = "force-dynamic";

// Legacy POST /digi-gastro-admin/tenant-orders-toggle/{slug_key} (main.py ~4980)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug_key: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { slug_key } = await params;
    const slugLower = slug_key.toLowerCase().trim();

    const tenant = await prisma.tenant.findUnique({ where: { slug: slugLower } });
    let ordersEnabled: boolean | null = null;
    if (tenant) {
      ordersEnabled = !(tenant.orders_enabled ?? true);
      await prisma.tenant.update({
        where: { slug: slugLower },
        data: { orders_enabled: ordersEnabled },
      });
    }

    if (wantsJson(request)) {
      return platformSuccess(request, "OK", { orders_enabled: ordersEnabled });
    }
    return platformRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
