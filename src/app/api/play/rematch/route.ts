import { NextRequest, NextResponse } from "next/server";
import { requestRematch, viewFor } from "@/lib/play/store";

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
    const state = await requestRematch(slug, body.code, body.playerId);
    return NextResponse.json({ success: true, state: viewFor(state, body.playerId) });
  } catch (e) {
    console.error("[play/rematch]", e);
    return NextResponse.json({ success: false, error: "Fehler." }, { status: 500 });
  }
}
