import { NextRequest, NextResponse } from "next/server";
import { ApiError, errorResponse, requireChefOrKellner } from "@/lib/adminApi";
import { awardManualStamp } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

// Legacy POST /admin/loyalty/stamp-manual (main.py ~17438)
// Body: {"short_code": "A7K2"} — vergibt einen manuellen Stempel.
export async function POST(request: NextRequest) {
  try {
    const session = await requireChefOrKellner();
    const slug = session.slug;

    let payload: { short_code?: unknown };
    try {
      payload = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }

    const shortCode = String(payload.short_code ?? "").trim().toUpperCase();
    if (!shortCode || shortCode.length < 3) {
      throw new ApiError(
        "Bitte gültigen Code eingeben (mindestens 3 Zeichen).",
        400
      );
    }

    const result = await awardManualStamp(
      slug,
      shortCode,
      session.name || "waiter"
    );
    if (!result.success) {
      throw new ApiError(
        (result as { error?: string }).error || "Kunde nicht gefunden.",
        404
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}