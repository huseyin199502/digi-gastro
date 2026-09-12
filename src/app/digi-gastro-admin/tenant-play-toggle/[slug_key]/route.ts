import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, platformRedirect, requirePlatformAdmin, wantsJson } from "@/lib/adminApi";
import { platformSuccess } from "@/lib/platformAdmin";

export const dynamic = "force-dynamic";

// POST /digi-gastro-admin/tenant-play-toggle/{slug_key}
// Super-Admin: Play World pro Tenant an/aus schalten.
// Gespeichert in enabled_features als Marker "play_off" (Play World ist
// standardmäßig aktiv, sofern das Bestellsystem aktiv ist).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug_key: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { slug_key } = await params;
    const slugLower = slug_key.toLowerCase().trim();

    const tenant = await prisma.tenant.findUnique({
      where: { slug: slugLower },
      select: { enabled_features: true },
    });

    let playEnabled: boolean | null = null;
    if (tenant) {
      let features: string[] = [];
      try {
        const parsed = JSON.parse(tenant.enabled_features ?? "[]");
        if (Array.isArray(parsed)) {
          features = parsed.filter((x): x is string => typeof x === "string");
        }
      } catch {
        features = [];
      }
      const idx = features.indexOf("play_off");
      if (idx >= 0) {
        features.splice(idx, 1);
        playEnabled = true;
      } else {
        features.push("play_off");
        playEnabled = false;
      }
      await prisma.tenant.update({
        where: { slug: slugLower },
        data: { enabled_features: JSON.stringify(features) },
      });
    }

    if (wantsJson(request)) {
      return platformSuccess(request, "OK", { play_enabled: playEnabled });
    }
    return platformRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
