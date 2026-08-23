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

// Legacy POST /admin/setup-complete (main.py ~13610)
// Form fields: has_kitchen, is_shishabar
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const fields = await readBodyFields(request);
    const hasKitchen = parseFormBool(fields.has_kitchen);
    const isShishabar = parseFormBool(fields.is_shishabar);

    await prisma.tenant.update({
      where: { slug },
      data: {
        has_kitchen: hasKitchen,
        is_shishabar: isShishabar,
        is_setup_completed: true,
        is_onboarded: true,
      },
    });

    // Kategorien neu aufbauen (ohne Custom-Erhalt, wie im Legacy)
    await applyCategoryList(slug, buildCategoryList([], hasKitchen, isShishabar, false));

    // Chef-Staff anlegen, falls noch keiner existiert
    const staffCount = await prisma.staff.count({ where: { tenant_slug: slug } });
    if (staffCount === 0) {
      // Legacy nutzt user["pin"] der aktuellen Session: bei Staff die
      // Staff-PIN, bei Owner das Tenant-Passwort.
      let chefPin = "1111";
      if (session.isOwner) {
        const t = await prisma.tenant.findUnique({
          where: { slug },
          select: { password: true },
        });
        chefPin = t?.password || "1111";
      } else {
        const me = await prisma.staff.findFirst({
          where: { tenant_slug: slug, name: session.name, role: session.role },
        });
        chefPin = me?.pin_code || me?.pin || "1111";
      }
      await prisma.staff.create({
        data: {
          tenant_slug: slug,
          name: session.name || "Chef",
          role: "chef",
          pin: chefPin,
          pin_code: chefPin,
        },
      });
    }

    if (wantsJson(request)) {
      return NextResponse.json({ success: true });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
