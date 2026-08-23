import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  dashboardRedirect,
  errorResponse,
  requireChef,
  wantsJson,
} from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/kategorie-erstellen (main.py ~8621)
// Form fields: name OR category-name (alias)
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

    let fields: Record<string, unknown>;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      fields = await request.json();
    } else {
      const form = await request.formData();
      fields = Object.fromEntries(form.entries());
    }

    const finalName = String(fields.name ?? fields["category-name"] ?? "").trim();
    if (!finalName) throw new ApiError("Kategorie-Name erforderlich.", 400);

    const existing = await prisma.category.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: { name: true },
    });
    if (!existing.some((c) => c.name === finalName)) {
      await prisma.category.create({
        data: { tenant_slug: slug, name: finalName, position: existing.length },
      });
    }

    if (wantsJson(request)) {
      return NextResponse.json({ success: true, category: finalName });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
