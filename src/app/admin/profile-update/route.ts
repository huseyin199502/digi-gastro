import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  dashboardRedirect,
  errorResponse,
  parseFormBool,
  requireChef,
  wantsJson,
} from "@/lib/adminApi";
import { readBodyFields } from "@/lib/tabletOps";
import { applyCategoryList, buildCategoryList } from "@/lib/categorySync";

export const dynamic = "force-dynamic";

// Legacy POST /admin/profile-update (main.py ~8460)
// Form fields: has_kitchen, is_shishabar, impressum_content, datenschutz_content
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { is_setup_completed: true },
    });
    if (!tenant?.is_setup_completed) {
      return NextResponse.redirect(new URL("/admin/setup", request.url), 303);
    }

    const fields = await readBodyFields(request);
    const hasKitchen = parseFormBool(fields.has_kitchen);
    const isShishabar = parseFormBool(fields.is_shishabar);
    const impressum = fields.impressum_content
      ? String(fields.impressum_content).trim()
      : "";
    const datenschutz = fields.datenschutz_content
      ? String(fields.datenschutz_content).trim()
      : "";

    await prisma.tenant.update({
      where: { slug },
      data: {
        has_kitchen: hasKitchen,
        is_shishabar: isShishabar,
        impressum_content: impressum,
        datenschutz_content: datenschutz,
      },
    });

    // Kategorien dynamisch mit den Flags synchronisieren (Custom bleiben erhalten)
    const existingCats = await prisma.category.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: { name: true },
    });
    const target = buildCategoryList(
      existingCats.map((c) => c.name),
      hasKitchen,
      isShishabar,
      true
    );
    await applyCategoryList(slug, target);

    if (wantsJson(request)) {
      return NextResponse.json({ success: true });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
