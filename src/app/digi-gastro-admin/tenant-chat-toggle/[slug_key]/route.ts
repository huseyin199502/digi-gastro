import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, platformRedirect, requirePlatformAdmin, wantsJson } from "@/lib/adminApi";
import { platformSuccess } from "@/lib/platformAdmin";

export const dynamic = "force-dynamic";

// POST /digi-gastro-admin/tenant-chat-toggle/{slug_key}
// Super-Admin: öffentlichen Gast-Chat pro Tenant an/aus schalten
// (Default: aus — der Chat ist nur aktiv, wenn die Plattform ihn freischaltet).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug_key: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { slug_key } = await params;
    const slugLower = slug_key.toLowerCase().trim();

    const tenant = await prisma.tenant.findUnique({ where: { slug: slugLower } });
    let chatEnabled: boolean | null = null;
    if (tenant) {
      chatEnabled = !(tenant.chat_enabled ?? false);
      await prisma.tenant.update({
        where: { slug: slugLower },
        data: { chat_enabled: chatEnabled },
      });
    }

    if (wantsJson(request)) {
      return platformSuccess(request, "OK", { chat_enabled: chatEnabled });
    }
    return platformRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
