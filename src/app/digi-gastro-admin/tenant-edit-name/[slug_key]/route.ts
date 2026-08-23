import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requirePlatformAdmin } from "@/lib/adminApi";
import { platformError, platformSuccess } from "@/lib/platformAdmin";

export const dynamic = "force-dynamic";

// Legacy POST /digi-gastro-admin/tenant-edit-name/{slug_key} (main.py ~4940)
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
    const newName = String(fields.name ?? "").trim();

    const tenant = await prisma.tenant.findUnique({ where: { slug: slugLower } });
    if (!tenant) return platformError(request, "Restaurant nicht gefunden", 404);

    const oldName = tenant.name;
    await prisma.tenant.update({
      where: { slug: slugLower },
      data: { name: newName },
    });

    return platformSuccess(
      request,
      `Name von <b>${oldName}</b> in <b>${newName}</b> geändert.`
    );
  } catch (err) {
    return errorResponse(err);
  }
}
