import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, ApiError, readBodyAny } from "@/lib/adminApi";
import { publishEvent } from "@/lib/eventBus";
import {
  applyChatDeviceCookie,
  chatRateLimitCheck,
  CHAT_MESSAGE_MAX_LEN,
  resolveChatDevice,
  resolveChatIdentity,
  resolveChatStaff,
  sanitizeChatText,
} from "@/lib/chat";

export const dynamic = "force-dynamic";

// GET /api/{slug}/chat/messages — Nachrichten laden (inkrementell via ?after=ID).
// Gesperrte Geräte dürfen weiterhin LESEN, nur nicht schreiben.
// ?identity=1 (Initial-Load) → eigene Chat-Identität mitschicken.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { chat_enabled: true, name: true },
    });
    if (!tenant) throw new ApiError("Dieses Restaurant existiert nicht.", 404);

    const { deviceId, isNew } = resolveChatDevice(slug, request);

    if (!tenant.chat_enabled) {
      const res = NextResponse.json({
        enabled: false,
        banned: false,
        identity: null,
        messages: [],
      });
      if (isNew) applyChatDeviceCookie(slug, res, deviceId);
      return res;
    }

    const staff = await resolveChatStaff(slug);
    const banned = staff
      ? false
      : (await prisma.chatBan.findUnique({
          where: {
            tenant_slug_device_id: { tenant_slug: slug, device_id: deviceId },
          },
          select: { id: true },
        })) !== null;

    // Identität nur beim Initial-Load berechnen (spart Queries beim 4s-Poll)
    const identity =
      request.nextUrl.searchParams.get("identity") === "1"
        ? staff
          ? tenant.name
          : await resolveChatIdentity(slug, request)
        : null;

    // Inkrementell (?after=ID) oder initial (letzte 50, aufsteigend).
    const after = parseInt(request.nextUrl.searchParams.get("after") ?? "", 10);
    const messages =
      Number.isFinite(after) && after > 0
        ? await prisma.chatMessage.findMany({
            where: { tenant_slug: slug, id: { gt: after } },
            orderBy: { id: "asc" },
            take: 80,
          })
        : (
            await prisma.chatMessage.findMany({
              where: { tenant_slug: slug },
              orderBy: { id: "desc" },
              take: 50,
            })
          ).reverse();

    const res = NextResponse.json({
      enabled: true,
      banned,
      identity,
      messages: messages.map((m) => ({
        id: m.id,
        nickname: m.nickname,
        body: m.is_deleted ? "" : m.body,
        is_admin: m.is_admin,
        is_deleted: m.is_deleted,
        created_at: m.created_at.toISOString(),
        own: m.device_id === deviceId,
      })),
    });
    if (isNew) applyChatDeviceCookie(slug, res, deviceId);
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}

// POST /api/{slug}/chat/messages — Nachricht senden.
// Identität = Tischnamen aus der gültigen QR-Session (Betrugsschutz,
// kein freier Name). Ohne gültige Tisch-Session → 403.
// Gesperrte Geräte → 403 mit error:"banned" (lesen bleibt erlaubt).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { chat_enabled: true, name: true },
    });
    if (!tenant) throw new ApiError("Dieses Restaurant existiert nicht.", 404);
    if (!tenant.chat_enabled) {
      throw new ApiError("Der Chat ist derzeit deaktiviert.", 403);
    }

    const body = await readBodyAny(request);
    // body.nickname wird bewusst IGNORIERT — der Name kommt vom Tisch.
    const text = sanitizeChatText(body.body, CHAT_MESSAGE_MAX_LEN);
    if (!text) throw new ApiError("Nachricht ist leer.", 400);

    const staff = await resolveChatStaff(slug);
    const { deviceId, isNew } = resolveChatDevice(slug, request);

    let nickname: string;
    if (staff) {
      nickname = staff.isOwner ? tenant.name : staff.name;
    } else {
      const banned = (await prisma.chatBan.findUnique({
        where: {
          tenant_slug_device_id: { tenant_slug: slug, device_id: deviceId },
        },
        select: { id: true },
      })) !== null;
      if (banned) {
        return NextResponse.json(
          { detail: "Du wurdest vom Restaurant aus dem Chat entfernt.", error: "banned" },
          { status: 403 }
        );
      }
      nickname = await resolveChatIdentity(slug, request);
      if (nickname === "Gast") {
        throw new ApiError(
          "Bitte scanne zuerst den QR-Code an deinem Tisch.",
          403
        );
      }
      const rl = chatRateLimitCheck(slug, deviceId);
      if (!rl.ok) {
        return NextResponse.json(
          { detail: `Bitte kurz warten (${rl.retryAfterS}s).`, retry_after_s: rl.retryAfterS },
          { status: 429 }
        );
      }
    }

    const msg = await prisma.chatMessage.create({
      data: {
        tenant_slug: slug,
        device_id: deviceId,
        nickname,
        body: text,
        is_admin: staff !== null,
      },
    });

    publishEvent(slug, { type: "chat_message", id: msg.id });

    const res = NextResponse.json({
      id: msg.id,
      nickname: msg.nickname,
      body: msg.body,
      is_admin: msg.is_admin,
      is_deleted: false,
      created_at: msg.created_at.toISOString(),
      own: true,
    });
    if (isNew) applyChatDeviceCookie(slug, res, deviceId);
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
