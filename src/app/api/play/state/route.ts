import { NextRequest, NextResponse } from "next/server";
import { advanceSession, viewFor } from "@/lib/play/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = String(req.nextUrl.searchParams.get("slug") ?? "").toLowerCase().trim();
  const code = String(req.nextUrl.searchParams.get("code") ?? "").toUpperCase().trim();
  const playerId = req.nextUrl.searchParams.get("playerId") ?? "";
  if (!slug || !code) {
    return NextResponse.json({ success: false, error: "slug/code fehlt." }, { status: 400 });
  }
  try {
    const session = await advanceSession(slug, code);
    if (!session) {
      return NextResponse.json({ success: false, error: "Raum nicht gefunden." }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      room_code: session.room_code,
      game: session.game,
      state: viewFor(session.state, playerId),
      now: Date.now(),
      updated_at: session.updated_at,
    });
  } catch (e) {
    console.error("[play/state]", e);
    return NextResponse.json({ success: false, error: "Fehler." }, { status: 500 });
  }
}
