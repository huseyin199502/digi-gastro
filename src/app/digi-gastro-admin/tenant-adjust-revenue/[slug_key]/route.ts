import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requirePlatformAdmin } from "@/lib/adminApi";
import { platformError, platformSuccess, signedFixed } from "@/lib/platformAdmin";
import { berlinTimestamp } from "@/lib/time";

export const dynamic = "force-dynamic";

// Legacy POST /digi-gastro-admin/tenant-adjust-revenue/{slug_key} (main.py ~5052)
// Form field: adjustment (float; positive adds, negative subtracts).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug_key: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { slug_key } = await params;
    const slugLower = slug_key.toLowerCase().trim();

    let fields: Record<string, unknown>;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      fields = await request.json();
    } else {
      const form = await request.formData();
      fields = Object.fromEntries(form.entries());
    }
    const adjustment = Number(String(fields.adjustment ?? "").replace(",", "."));
    if (!Number.isFinite(adjustment)) {
      return platformError(request, "Ungueltige Anpassung");
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug: slugLower } });
    if (!tenant) return platformError(request, "Tenant nicht gefunden");

    const oldValue = Number(tenant.tagesumsatz ?? 0);
    let newValue = oldValue + adjustment;
    if (newValue < 0) newValue = 0; // negative Tagesumsatz not allowed

    await prisma.$transaction([
      prisma.tenant.update({
        where: { slug: slugLower },
        data: { tagesumsatz: newValue },
      }),
      prisma.revenueAdjustment.create({
        data: {
          tenant_slug: slugLower,
          adjustment,
          old_value: oldValue,
          new_value: newValue,
          adjusted_by: "admin@digi-gastro.de",
          adjusted_at: berlinTimestamp(),
        },
      }),
    ]);

    return platformSuccess(
      request,
      `Umsatz fuer ${slugLower} angepasst: ${signedFixed(adjustment)} EUR`,
      { old_value: oldValue, new_value: newValue }
    );
  } catch (err) {
    return errorResponse(err);
  }
}
