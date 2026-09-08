import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, ApiError, requireChef, readBodyAny } from "@/lib/adminApi";
import { publishEvent } from "@/lib/eventBus";
import { isValidChatDeviceId, sanitizeChatText } from "@/lib/chat";

export const dynamic = "force-dynamic";

// GET /api/{slug}/chat/moderation — Admin-Daten für den Moderationstab:
// letzte Nachrichten (auch gelöschte, ohne Text), Teilnehmer der letzten
// 24 h und aktive Bans.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const session = await requireChef();
    if (session.slug !== slug) {
      throw new ApiError("Kein Zugriff auf dieses Restaurant.", 403);
    }

    const since = new Date(Date.now() - 24 * 3600 * 1000);
    const [messages, recent, bans] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { tenant_slug: slug },
        orderBy: { id: "desc" },
        take: 80,
      }),
      prisma.chatMessage.findMany({
        where: { tenant_slug: slug, created_at: { gte: since } },
        orderBy: { id: "desc" },
        take: 400,
      }),
      prisma.chatBan.findMany({
        where: { tenant_slug: slug },
        orderBy: { id: "desc" },
        take: 200,
      }),
    ]);

    // Teilnehmer: distinct Geräte der letzten 24 h mit letztem Nickname.
    const participants = new Map<
      string,
      { device_id: string; nickname: string; messages: number; last_at: string }
    >();
    for (const m of recent) {
      const p = participants.get(m.device_id);
      if (p) {
        p.messages += 1;
      } else {
        participants.set(m.device_id, {
          device_id: m.device_id,
          nickname: m.nickname,
          messages: 1,
          last_at: m.created_at.toISOString(),
        });
      }
    }

    const bannedSet = new Set(bans.map((b) => b.device_id));

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        device_id: m.device_id,
        nickname: m.nickname,
        body: m.is_deleted ? "" : m.body,
        is_admin: m.is_admin,
        is_deleted: m.is_deleted,
        created_at: m.created_at.toISOString(),
      })),
      participants: [...participants.values()].map((p) => ({
        ...p,
        banned: bannedSet.has(p.device_id),
      })),
      bans: bans.map((b) => ({
        device_id: b.device_id,
        nickname: b.nickname,
        reason: b.reason,
        banned_by: b.banned_by,
        created_at: b.created_at.toISOString(),
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// POST /api/{slug}/chat/bans — Gerät sperren (kann danach nur noch lesen).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const session = await requireChef();
    if (session.slug !== slug) {
      throw new ApiError("Kein Zugriff auf dieses Restaurant.", 403);
    }

    const body = await readBodyAny(request);
    const deviceId = String(body.device_id ?? "").trim();
    if (!isValidChatDeviceId(deviceId)) {
      throw new ApiError("Ungültige Geräte-ID.", 400);
    }
    const nickname = sanitizeChatText(body.nickname, 40) || null;
    const reason = sanitizeChatText(body.reason, 200) || null;

    await prisma.chatBan.upsert({
      where: {
        tenant_slug_device_id: { tenant_slug: slug, device_id: deviceId },
      },
      create: { tenant_slug: slug, device_id: deviceId, nickname, reason, banned_by: session.name },
      update: { nickname, reason, banned_by: session.name },
    });

    publishEvent(slug, { type: "chat_message" });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}

// DELETE /api/{slug}/chat/bans?device_id=… — Sperre aufheben.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const session = await requireChef();
    if (session.slug !== slug) {
      throw new ApiError("Kein Zugriff auf dieses Restaurant.", 403);
    }

    const deviceId = request.nextUrl.searchParams.get("device_id") ?? "";
    if (!isValidChatDeviceId(deviceId)) {
      throw new ApiError("Ungültige Geräte-ID.", 400);
    }

    await prisma.chatBan.deleteMany({
      where: { tenant_slug: slug, device_id: deviceId },
    });

    publishEvent(slug, { type: "chat_message" });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
