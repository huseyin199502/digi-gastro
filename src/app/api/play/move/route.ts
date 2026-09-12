import { NextRequest, NextResponse } from "next/server";
import { makeMove, viewFor } from "@/lib/play/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { slug?: unknown; code?: unknown; playerId?: unknown; move?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Ungültige Anfrage." }, { status: 400 });
  }
  const slug = String(body.slug ?? "").toLowerCase().trim();
  if (!slug || !body.code || !body.playerId) {
    return NextResponse.json({ success: false, error: "Parameter fehlen." }, { status: 400 });
  }
  try {
    const state = await makeMove(slug, body.code, body.playerId, body.move);
    return NextResponse.json({ success: true, state: viewFor(state, body.playerId) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_TURN") {
      return NextResponse.json({ success: false, error: "Nicht dein Zug." }, { status: 409 });
    }
    if (msg === "INVALID") {
      return NextResponse.json({ success: false, error: "Zug nicht möglich." }, { status: 409 });
    }
    if (msg === "NOT_FOUND" || msg === "NOT_PLAYING" || msg === "NOT_PLAYER") {
      return NextResponse.json({ success: false, error: "Aktion nicht möglich." }, { status: 409 });
    }
    console.error("[play/move]", e);
    return NextResponse.json({ success: false, error: "Fehler." }, { status: 500 });
  }
}
