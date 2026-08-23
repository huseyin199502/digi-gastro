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

// Legacy POST /admin/kategorie-loeschen (main.py ~9057)
// Deletes the category row; products keep their category string (legacy behaviour).
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    let fields: Record<string, unknown>;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      fields = await request.json();
    } else {
      const form = await request.formData();
      fields = Object.fromEntries(form.entries());
    }
    const catName = String(fields.name ?? "").trim();

    const cat = await prisma.category.findFirst({
      where: { tenant_slug: slug, name: catName },
    });
    if (!cat) throw new ApiError("Kategorie nicht gefunden.", 404);

    await prisma.category.delete({ where: { id: cat.id } });

    if (wantsJson(request)) {
      return NextResponse.json({ success: true });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
