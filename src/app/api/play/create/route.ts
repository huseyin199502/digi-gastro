import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/play/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { slug?: unknown; game?: unknown; name?: unknown; table?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Ungültige Anfrage." }, { status: 400 });
  }
  const slug = String(body.slug ?? "").toLowerCase().trim();
  const game = String(body.game ?? "getfour");
  if (!slug) {
    return NextResponse.json({ success: false, error: "slug fehlt." }, { status: 400 });
  }
  try {
    const result = await createSession(slug, game, body.name, body.table);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("[play/create]", e);
    return NextResponse.json({ success: false, error: "Konnte Raum nicht erstellen." }, { status: 500 });
  }
}
