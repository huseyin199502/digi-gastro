import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, platformRedirect, requirePlatformAdmin, wantsJson } from "@/lib/adminApi";
import { platformSuccess } from "@/lib/platformAdmin";

export const dynamic = "force-dynamic";

// POST /digi-gastro-admin/announcement-erstellen — neue Tenant-Neuigkeit
// (erscheint als animiertes Popup 1x pro Gerät im Admin-Dashboard).
export async function POST(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const fd = await request.formData().catch(() => null);
    const get = (k: string) => String(fd?.get(k) ?? "").trim();
    const title = get("title");
    const body = get("body");
    const icon = get("icon") || "celebration";
    const isActive = fd ? fd.get("is_active") !== null : true;

    if (!title || !body) {
      throw new Error("Titel und Text sind erforderlich.");
    }

    await prisma.announcement.create({
      data: { title: title.slice(0, 120), body: body.slice(0, 1000), icon: icon.slice(0, 40), is_active: isActive },
    });

    if (wantsJson(request)) return platformSuccess(request, "OK");
    return platformRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
