import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  errorResponse,
  readBodyAny,
  requireChef,
} from "@/lib/adminApi";
import { nowIso } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

// Legacy POST /admin/loyalty/geofence (main.py ~16277)
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug.toLowerCase().trim();

    const body = await readBodyAny(request);
    const latitude = parseFloat(String(body.latitude ?? ""));
    const longitude = parseFloat(String(body.longitude ?? ""));
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new ApiError("Ungültige Daten.", 422);
    }
    const address = String(body.address ?? "").trim();
    const name = String(body.name ?? "").trim() || "Hauptladen";

    const existing = await prisma.tenantGeofence.findFirst({
      where: { tenant_slug: slug, is_primary: true },
    });
    if (existing) {
      await prisma.tenantGeofence.update({
        where: { id: existing.id },
        data: { name, latitude, longitude, address },
      });
    } else {
      await prisma.tenantGeofence.create({
        data: {
          tenant_slug: slug,
          name,
          latitude,
          longitude,
          address,
          is_primary: true,
          created_at: nowIso(),
        },
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
