import { NextRequest, NextResponse } from "next/server";
import { joinSession } from "@/lib/play/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { slug?: unknown; code?: unknown; name?: unknown; table?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Ungültige Anfrage." }, { status: 400 });
  }
  const slug = String(body.slug ?? "").toLowerCase().trim();
  if (!slug || !body.code) {
    return NextResponse.json({ success: false, error: "slug/code fehlt." }, { status: 400 });
  }
  try {
    const result = await joinSession(slug, body.code, body.name, body.table);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_FOUND") {
      return NextResponse.json({ success: false, error: "Raum nicht gefunden." }, { status: 404 });
    }
    if (msg === "FULL") {
      return NextResponse.json({ success: false, error: "Raum ist voll." }, { status: 409 });
    }
    if (msg === "STARTED") {
      return NextResponse.json({ success: false, error: "Spiel läuft bereits." }, { status: 409 });
    }
    console.error("[play/join]", e);
    return NextResponse.json({ success: false, error: "Beitritt fehlgeschlagen." }, { status: 500 });
  }
}
