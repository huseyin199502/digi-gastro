import { NextRequest, NextResponse } from "next/server";
import { recordGameScore } from "@/lib/play/store";

export const dynamic = "force-dynamic";

// POST /api/play/score — Ergebnis eines Spiels melden (Highscore/Rekord).
// Body: { slug, game, name, score }. Höhere Punktzahl = besser.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const slug = String(body.slug ?? "").toLowerCase().trim();
    const game = String(body.game ?? "").trim();
    const name = String(body.name ?? "").trim().slice(0, 24) || "Gast";
    const score = Number(body.score);
    if (!slug || !game || !Number.isFinite(score)) {
      return NextResponse.json(
        { success: false, error: "slug, game und score sind erforderlich." },
        { status: 400 },
      );
    }
    const result = await recordGameScore(slug, game, name, score);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("[play/score POST]", e);
    return NextResponse.json({ success: false, error: "Fehler." }, { status: 500 });
  }
}
