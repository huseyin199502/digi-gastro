import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { errorResponse, requirePlatformAdmin } from "@/lib/adminApi";
import { generateTenantPassword, platformError, platformSuccess } from "@/lib/platformAdmin";

export const dynamic = "force-dynamic";

// Legacy POST /digi-gastro-admin/tenant-erstellen (main.py ~4887)
export async function POST(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    let fields: Record<string, unknown>;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      fields = await request.json();
    } else {
      const form = await request.formData();
      fields = Object.fromEntries(form.entries());
    }

    const name = String(fields.name ?? "").trim();
    const slugLower = String(fields.slug ?? "")
      .trim()
      .toLowerCase()
      .replace(/ /g, "-");
    if (!slugLower) return platformError(request, "Ungueltiger Slug");

    const existing = await prisma.tenant.findUnique({ where: { slug: slugLower } });
    if (existing) {
      return platformError(request, "Restaurant-Slug existiert bereits");
    }

    const generatedEmail = `${slugLower}@digi-gastro.de`;
    const generatedPw = generateTenantPassword();

    await prisma.tenant.create({
      data: {
        slug: slugLower,
        name,
        email: generatedEmail,
        password: generatedPw,
        is_setup_completed: false,
        is_onboarded: false,
        active: true,
        tagesumsatz: 0,
        bestellungen_gesamt: 0,
        theme: "dark",
        price_mode: "brutto",
        orders_enabled: true,
        security_token: crypto.randomBytes(16).toString("hex"),
      },
    });

    const successMsg =
      `Konto erfolgreich erstellt! <br><b>Login:</b> ${generatedEmail} ` +
      `<br><b>Passwort:</b> ${generatedPw}`;
    return platformSuccess(request, successMsg, {
      email: generatedEmail,
      password: generatedPw,
      slug: slugLower,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
