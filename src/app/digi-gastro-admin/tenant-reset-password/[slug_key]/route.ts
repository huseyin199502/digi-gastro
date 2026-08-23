import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requirePlatformAdmin } from "@/lib/adminApi";
import { generateTenantPassword, platformError, platformSuccess } from "@/lib/platformAdmin";

export const dynamic = "force-dynamic";

// Legacy POST /digi-gastro-admin/tenant-reset-password/{slug_key} (main.py ~4921)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug_key: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { slug_key } = await params;
    const slugLower = slug_key.toLowerCase().trim();

    const tenant = await prisma.tenant.findUnique({ where: { slug: slugLower } });
    if (!tenant) return platformError(request, "Restaurant nicht gefunden", 404);

    const newPw = generateTenantPassword();
    await prisma.tenant.update({
      where: { slug: slugLower },
      data: { password: newPw },
    });

    const successMsg =
      `Passwort für <b>${tenant.name}</b> erfolgreich zurückgesetzt.` +
      `<br><b>Neues Passwort:</b> ${newPw}`;
    return platformSuccess(request, successMsg, { password: newPw });
  } catch (err) {
    return errorResponse(err);
  }
}
