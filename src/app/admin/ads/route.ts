import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireChef, errorResponse, ApiError } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireChef();
    const banners = await prisma.adBanner.findMany({
      where: { tenant_slug: session.slug },
      orderBy: [{ priority: "desc" }, { created_at: "desc" }],
    });
    return NextResponse.json({ success: true, banners });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const body = await request.json().catch(() => null);
    if (!body) throw new ApiError("Ungültiges JSON-Format.", 400);

    const company_name = String(body.company_name ?? "").trim();
    const title = String(body.title ?? "").trim();
    if (!company_name) throw new ApiError("Firmenname ist erforderlich.", 400);
    if (!title) throw new ApiError("Titel ist erforderlich.", 400);

    const banner = await prisma.adBanner.create({
      data: {
        tenant_slug: session.slug,
        company_name,
        title,
        subtitle: body.subtitle ? String(body.subtitle).trim() : null,
        image_url: body.image_url ? String(body.image_url).trim() : null,
        target_url: body.target_url ? String(body.target_url).trim() : null,
        placement: String(body.placement ?? "menu_mid"),
        status: String(body.status ?? "active"),
        start_at: body.start_at ? new Date(body.start_at) : null,
        end_at: body.end_at ? new Date(body.end_at) : null,
        priority: Number(body.priority ?? 0),
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireChef();
    const body = await request.json().catch(() => null);
    if (!body) throw new ApiError("Ungültiges JSON-Format.", 400);

    const id = Number(body.id);
    if (!id) throw new ApiError("Banner-ID ist erforderlich.", 400);

    const existing = await prisma.adBanner.findFirst({
      where: { id, tenant_slug: session.slug },
    });
    if (!existing) throw new ApiError("Banner nicht gefunden.", 404);

    const data: Record<string, unknown> = {};
    if (body.company_name !== undefined) data.company_name = String(body.company_name).trim();
    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.subtitle !== undefined) data.subtitle = body.subtitle ? String(body.subtitle).trim() : null;
    if (body.image_url !== undefined) data.image_url = body.image_url ? String(body.image_url).trim() : null;
    if (body.target_url !== undefined) data.target_url = body.target_url ? String(body.target_url).trim() : null;
    if (body.placement !== undefined) data.placement = String(body.placement);
    if (body.status !== undefined) data.status = String(body.status);
    if (body.start_at !== undefined) data.start_at = body.start_at ? new Date(body.start_at) : null;
    if (body.end_at !== undefined) data.end_at = body.end_at ? new Date(body.end_at) : null;
    if (body.priority !== undefined) data.priority = Number(body.priority);

    const updated = await prisma.adBanner.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, banner: updated });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireChef();
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) throw new ApiError("Banner-ID ist erforderlich.", 400);

    const existing = await prisma.adBanner.findFirst({
      where: { id, tenant_slug: session.slug },
    });
    if (!existing) throw new ApiError("Banner nicht gefunden.", 404);

    await prisma.adBanner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
