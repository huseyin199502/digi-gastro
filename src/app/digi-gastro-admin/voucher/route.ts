import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requirePlatformAdmin } from "@/lib/adminApi";
import { platformSuccess } from "@/lib/platformAdmin";

export const dynamic = "force-dynamic";

// POST /digi-gastro-admin/voucher
// Superadmin erstellt einen Rabatt-Code (1x gültig) für einen Tenant.
export async function POST(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    const body = await request.json().catch(() => ({}));
    const tenantSlug = String(body.tenant_slug ?? "").trim().toLowerCase();
    const discountType = String(body.discount_type ?? "percent");
    const discountValue = Math.max(1, Math.round(Number(body.discount_value) || 0));
    const code = String(body.code ?? "").trim().toUpperCase();

    if (!tenantSlug) throw new Error("Tenant fehlt.");
    if (discountType !== "percent" && discountType !== "fixed") {
      throw new Error("Ungültige Rabattart.");
    }
    if (!discountValue) throw new Error("Rabattwert fehlt.");
    if (!code) throw new Error("Code fehlt.");

    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new Error("Tenant nicht gefunden.");

    const existing = await prisma.voucher.findUnique({ where: { code } });
    if (existing) throw new Error("Code existiert bereits.");

    const voucher = await prisma.voucher.create({
      data: {
        code,
        tenant_slug: tenantSlug,
        discount_type: discountType,
        discount_value:
          discountType === "percent" ? Math.min(100, discountValue) : discountValue,
        status: "active",
        created_by: "superadmin",
      },
    });

    return platformSuccess(request, "OK", { voucher });
  } catch (err) {
    return errorResponse(err);
  }
}

// GET /digi-gastro-admin/voucher?tenant=slug — Vouchers eines Tenants auflisten
export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const tenant = request.nextUrl.searchParams.get("tenant");
    const vouchers = await prisma.voucher.findMany({
      where: tenant ? { tenant_slug: tenant } : {},
      orderBy: { created_at: "desc" },
      take: 100,
    });
    return NextResponse.json({ success: true, vouchers });
  } catch (err) {
    return errorResponse(err);
  }
}

// DELETE /digi-gastro-admin/voucher?id= — Voucher löschen (Liste bereinigen)
export async function DELETE(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!id) throw new Error("Voucher-ID fehlt.");
    await prisma.voucher.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}