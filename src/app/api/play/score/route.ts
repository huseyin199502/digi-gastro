import { NextRequest, NextResponse } from "next/server";
import { recordGameScore } from "@/lib/play/store";

export const dynamic = "force-dynamic";

// Nur diese Spiele dürfen über die 3D-Clients Highscores melden.
const ALLOWED_GAMES = new Set(["kart", "ludo", "quiz", "bingo", "poker", "liar"]);
const MAX_SCORE = 1_000_000;

// Einfaches In-Memory-Rate-Limit (best effort; schützt vor Spam).
const lastSubmit = new Map<string, number>();
const MIN_INTERVAL_MS = 1500;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const prev = lastSubmit.get(key) ?? 0;
  if (now - prev < MIN_INTERVAL_MS) return true;
  lastSubmit.set(key, now);
  if (lastSubmit.size > 5000) lastSubmit.clear();
  return false;
}

// POST /api/play/score — Ergebnis eines Spiels melden (Highscore/Rekord).
// Body: { slug, game, name, score }. Höhere Punktzahl = besser.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const slug = String(body.slug ?? "").toLowerCase().trim().slice(0, 255);
    const game = String(body.game ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim().replace(/\s+/g, " ").slice(0, 24) || "Gast";
    const rawScore = Number(body.score);
    const score = Math.round(rawScore);

    if (!slug || !game || !Number.isFinite(rawScore)) {
      return NextResponse.json(
        { success: false, error: "slug, game und score sind erforderlich." },
        { status: 400 },
      );
    }
    if (!ALLOWED_GAMES.has(game)) {
      return NextResponse.json(
        { success: false, error: "Unbekanntes Spiel." },
        { status: 400 },
      );
    }
    if (score < 0 || score > MAX_SCORE) {
      return NextResponse.json(
        { success: false, error: "Ungültige Punktzahl." },
        { status: 400 },
      );
    }
    if (rateLimited(`${slug}:${game}:${name}`)) {
      return NextResponse.json(
        { success: false, error: "Zu viele Anfragen. Bitte kurz warten." },
        { status: 429 },
      );
    }

    const result = await recordGameScore(slug, game, name, score);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("[play/score POST]", e);
    return NextResponse.json({ success: false, error: "Fehler." }, { status: 500 });
  }
}
