import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, ApiError, readBodyAny } from "@/lib/adminApi";
import { getTenantSession } from "@/lib/auth";
import {
  applyPersistentDeviceCookie,
  isValidDeviceId,
  resolvePersistentDevice,
} from "@/lib/device";

export const dynamic = "force-dynamic";

const ADMIN_DEVICE_COOKIE = "admin_device";

// GET /api/{slug}/admin/announcements — aktive Neuigkeiten, die dieses
// GERÄT noch nicht gesehen hat (1x pro Gerät — gleiche Zugangsdaten
// auf einem neuen Gerät/PC/Tablet/Handy → Popup erscheint dort erneut).
//beliebige Tenant-Session (chef, kellner, …), Gerät-Cookie wird beim
// ersten Aufruf gesetzt.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();

    const session = await getTenantSession();
    if (!session || session.slug !== slug) {
      throw new ApiError("Nicht eingeloggt.", 401);
    }

    const { deviceId, isNew } = resolvePersistentDevice(
      ADMIN_DEVICE_COOKIE,
      request
    );

    const active = await prisma.announcement.findMany({
      where: { is_active: true },
      orderBy: [{ position: "asc" }, { id: "desc" }],
    });
    const seen = await prisma.announcementView.findMany({
      where: {
        device_id: deviceId,
        announcement_id: { in: active.map((a) => a.id) },
      },
      select: { announcement_id: true },
    });
    const seenIds = new Set(seen.map((v) => v.announcement_id));
    const unseen = active
      .filter((a) => !seenIds.has(a.id))
      .map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        icon: a.icon,
        created_at: a.created_at.toISOString(),
      }));

    const res = NextResponse.json({ announcements: unseen });
    if (isNew) applyPersistentDeviceCookie(res, ADMIN_DEVICE_COOKIE, deviceId);
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}

// POST /api/{slug}/admin/announcements — Neuigkeit als gesehen markieren.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();

    const session = await getTenantSession();
    if (!session || session.slug !== slug) {
      throw new ApiError("Nicht eingeloggt.", 401);
    }

    const body = await readBodyAny(request);
    const announcementId = parseInt(String(body.id ?? ""), 10);
    if (!Number.isFinite(announcementId) || announcementId <= 0) {
      throw new ApiError("Ungültige Neuigkeits-ID.", 400);
    }

    const { deviceId, isNew } = resolvePersistentDevice(
      ADMIN_DEVICE_COOKIE,
      request
    );
    if (!isValidDeviceId(deviceId)) {
      throw new ApiError("Ungültige Geräte-ID.", 400);
    }

    await prisma.announcementView.upsert({
      where: {
        announcement_id_device_id: {
          announcement_id: announcementId,
          device_id: deviceId,
        },
      },
      create: { announcement_id: announcementId, device_id: deviceId, tenant_slug: slug },
      update: {},
    });

    const res = NextResponse.json({ success: true });
    if (isNew) applyPersistentDeviceCookie(res, ADMIN_DEVICE_COOKIE, deviceId);
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
