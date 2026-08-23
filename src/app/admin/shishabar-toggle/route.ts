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
import { applyCategoryList } from "@/lib/categorySync";

export const dynamic = "force-dynamic";

// Legacy POST /admin/shishabar-toggle (main.py ~11283)
// Form field: is_shishabar — synchronisiert die "Shisha"-Kategorie.
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
    const isShishabar = parseFormBool(fields.is_shishabar);

    await prisma.tenant.update({
      where: { slug },
      data: { is_shishabar: isShishabar },
    });

    // Kategorie-Sync: "Shisha" hinzufügen bzw. entfernen
    const existingCats = await prisma.category.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: { name: true },
    });
    let names = existingCats.map((c) => c.name);
    if (isShishabar) {
      if (!names.includes("Shisha")) names.push("Shisha");
    } else {
      names = names.filter((n) => n !== "Shisha");
    }
    await applyCategoryList(slug, names);

    if (wantsJson(request)) {
      return NextResponse.json({ success: true, is_shishabar: isShishabar });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
