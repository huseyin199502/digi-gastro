import { NextRequest, NextResponse } from "next/server";
import { removeBot, viewFor } from "@/lib/play/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { slug?: unknown; code?: unknown; playerId?: unknown; botId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Ungültige Anfrage." }, { status: 400 });
  }
  const slug = String(body.slug ?? "").toLowerCase().trim();
  if (!slug || !body.code || !body.playerId || !body.botId) {
    return NextResponse.json({ success: false, error: "Parameter fehlen." }, { status: 400 });
  }
  try {
    const state = await removeBot(slug, body.code, body.playerId, body.botId);
    return NextResponse.json({ success: true, state: viewFor(state, body.playerId) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_HOST") {
      return NextResponse.json({ success: false, error: "Nur der Host kann Bots entfernen." }, { status: 403 });
    }
    if (msg === "STARTED") {
      return NextResponse.json({ success: false, error: "Spiel läuft bereits." }, { status: 409 });
    }
    if (msg === "NOT_FOUND") {
      return NextResponse.json({ success: false, error: "Bot nicht gefunden." }, { status: 404 });
    }
    console.error("[play/remove-bot]", e);
    return NextResponse.json({ success: false, error: "Fehler." }, { status: 500 });
  }
}
