import { NextRequest, NextResponse } from "next/server";
import { startSession, viewFor } from "@/lib/play/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { slug?: unknown; code?: unknown; playerId?: unknown };
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
    const state = await startSession(slug, body.code, body.playerId);
    return NextResponse.json({ success: true, state: viewFor(state, body.playerId) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_HOST") {
      return NextResponse.json({ success: false, error: "Nur der Host kann starten." }, { status: 403 });
    }
    if (msg === "NOT_FOUND") {
      return NextResponse.json({ success: false, error: "Raum nicht gefunden." }, { status: 404 });
    }
    console.error("[play/start]", e);
    return NextResponse.json({ success: false, error: "Start fehlgeschlagen." }, { status: 500 });
  }
}
