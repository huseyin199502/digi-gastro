import { NextRequest, NextResponse } from "next/server";
import { listHighlights, listRecords } from "@/lib/play/store";

export const dynamic = "force-dynamic";

// Highlights entstehen ausschließlich durch neue Rekorde (siehe store.makeMove).
export async function GET(req: NextRequest) {
  const slug = String(req.nextUrl.searchParams.get("slug") ?? "").toLowerCase().trim();
  if (!slug) {
    return NextResponse.json({ success: false, error: "slug fehlt." }, { status: 400 });
  }
  try {
    const [highlights, records] = await Promise.all([
      listHighlights(slug),
      listRecords(slug),
    ]);
    return NextResponse.json({ success: true, highlights, records });
  } catch (e) {
    console.error("[play/highlights GET]", e);
    return NextResponse.json({ success: false, error: "Fehler." }, { status: 500 });
  }
}
