import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requirePlatformAdmin } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /digi-gastro-admin/tenant-operating-mode/{slug} (main.py ~17571)
// Form field: mode ("full" | "menu_only" | "stempelkarte_only")
// NOTE: the legacy endpoint forgot its auth check; the migration adds the
// platform super-admin guard (response shape unchanged for valid callers).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { slug } = await params;

    let fields: Record<string, unknown>;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      fields = await request.json();
    } else {
      const form = await request.formData();
      fields = Object.fromEntries(form.entries());
    }
    const mode = String(fields.mode ?? "");
    if (!["full", "menu_only", "stempelkarte_only"].includes(mode)) {
      throw new ApiError(
        "Ungültiger mode. Erlaubt: full, menu_only, stempelkarte_only",
        400
      );
    }

    const slugLower = slug.toLowerCase().trim();
    const tenant = await prisma.tenant.findUnique({ where: { slug: slugLower } });
    if (!tenant) throw new ApiError("Tenant nicht gefunden", 404);

    await prisma.tenant.update({
      where: { slug: slugLower },
      data: { operating_mode: mode },
    });

    return NextResponse.json({ success: true, operating_mode: mode });
  } catch (err) {
    return errorResponse(err);
  }
}
