import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, ApiError } from "@/lib/adminApi";
import { publishEvent } from "@/lib/eventBus";
import {
  applyChatDeviceCookie,
  CHAT_EDIT_WINDOW_MS,
  resolveChatDevice,
} from "@/lib/chat";
import { getTenantSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// DELETE /api/{slug}/chat/messages/{message_id}
// Zwei Pfade:
//   1. Chef (Tenant-Admin): darf JEDE Nachricht soft-deleten.
//   2. Gast: darf nur die EIGENE, nicht-Admin-Nachricht löschen —
//      und nur binnen 5 Minuten nach Versand (CHAT_EDIT_WINDOW_MS).
// Soft-Delete: is_deleted=true + Text entfernen (Datenminimierung).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; message_id: string }> }
) {
  try {
    const { slug: rawSlug, message_id } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const id = parseInt(message_id, 10);
    if (!Number.isFinite(id) || id <= 0) {
      throw new ApiError("Ungültige Nachrichten-ID.", 400);
    }

    const message = await prisma.chatMessage.findUnique({
      where: { id },
      select: {
        tenant_slug: true,
        device_id: true,
        is_admin: true,
        is_deleted: true,
        created_at: true,
      },
    });
    if (!message || message.tenant_slug !== slug) {
      throw new ApiError("Nachricht nicht gefunden.", 404);
    }
    if (message.is_deleted) {
      throw new ApiError("Nachricht ist bereits gelöscht.", 409);
    }

    // Pfad 1: Chef löscht jede Nachricht seines Tenants.
    const session = await getTenantSession();
    if (session && session.slug === slug && session.role === "chef") {
      await prisma.chatMessage.update({
        where: { id },
        data: { is_deleted: true, body: "" },
      });
      publishEvent(slug, { type: "chat_message", id });
      return NextResponse.json({ success: true, deleted_by: "admin" });
    }

    // Pfad 2: Gast löscht die eigene Nachricht binnen 5 Minuten.
    const { deviceId, isNew } = resolveChatDevice(slug, request);
    const ageMs = Date.now() - message.created_at.getTime();
    if (message.device_id !== deviceId) {
      throw new ApiError("Das ist nicht deine Nachricht.", 403);
    }
    if (message.is_admin) {
      throw new ApiError("Restaurant-Nachrichten können nicht gelöscht werden.", 403);
    }
    if (ageMs > CHAT_EDIT_WINDOW_MS) {
      throw new ApiError(
        "Nachrichten können nur innerhalb von 5 Minuten gelöscht werden.",
        403
      );
    }

    await prisma.chatMessage.update({
      where: { id },
      data: { is_deleted: true, body: "" },
    });
    publishEvent(slug, { type: "chat_message", id });

    const res = NextResponse.json({ success: true, deleted_by: "guest" });
    if (isNew) applyChatDeviceCookie(slug, res, deviceId);
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
