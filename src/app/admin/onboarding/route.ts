import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import { errorResponse, parseFormBool, ApiError } from "@/lib/adminApi";
import { sessionCookieOptions } from "@/lib/auth";
import { applyCategoryList, buildCategoryList } from "@/lib/categorySync";

export const dynamic = "force-dynamic";

// Legacy GET /admin/onboarding (main.py ~7795)
// Markiert Setup/Onboarding als abgeschlossen und leitet ins Dashboard.
export async function GET(request: NextRequest) {
  const session = await getTenantSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }
  await prisma.tenant.update({
    where: { slug: session.slug },
    data: { is_setup_completed: true, is_onboarded: true },
  });
  return NextResponse.redirect(new URL("/admin/dashboard", request.url), 303);
}

// Legacy POST /admin/onboarding (main.py ~7812)
// Form fields: has_kitchen, is_shishabar, impressum_content,
// datenschutz_content, auto_tables, chef_name, chef_pin
export async function POST(request: NextRequest) {
  try {
    const session = await getTenantSession();
    if (!session) throw new ApiError("Nicht eingeloggt.", 401);
    const slug = session.slug;

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new ApiError("Dieses Restaurant existiert nicht.", 404);

    const form = await request.formData();
    const hasKitchen = parseFormBool(form.get("has_kitchen"));
    const isShishabar = parseFormBool(form.get("is_shishabar"));
    const impressumRaw = form.get("impressum_content");
    const datenschutzRaw = form.get("datenschutz_content");
    const chefName = String(form.get("chef_name") ?? "Chef") || "Chef";
    const chefPin = String(form.get("chef_pin") ?? "1111") || "1111";

    const impressum =
      impressumRaw !== null && String(impressumRaw).trim()
        ? String(impressumRaw).trim()
        : `Impressum\nAngaben gemäß § 5 TMG:\n${tenant.name} Gastro GmbH\nInhaber: ${chefName}\n${tenant.address || "Musterstraße 1, 80331 München"}`;
    const datenschutz =
      datenschutzRaw !== null && String(datenschutzRaw).trim()
        ? String(datenschutzRaw).trim()
        : `Datenschutz-Erklärung\nWir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Personenbezogene Daten werden auf dieser digitalen Speisekarte nur im technisch notwendigen Umfang (Tischzuordnung und Bestellübermittlung) erhoben und verarbeitet.`;

    await prisma.tenant.update({
      where: { slug },
      data: {
        is_setup_completed: true,
        has_kitchen: hasKitchen,
        is_shishabar: isShishabar,
        impressum_content: impressum,
        datenschutz_content: datenschutz,
      },
    });

    // Kategorien frisch aufbauen
    await applyCategoryList(
      slug,
      buildCategoryList([], hasKitchen, isShishabar, false)
    );

    // Tische zurücksetzen, Staff durch Chef ersetzen (legacy Semantik)
    await prisma.table.deleteMany({ where: { tenant_slug: slug } });
    await prisma.staff.deleteMany({ where: { tenant_slug: slug } });
    await prisma.staff.create({
      data: {
        tenant_slug: slug,
        name: chefName,
        role: "chef",
        pin: chefPin,
        pin_code: chefPin,
      },
    });

    const resp = NextResponse.redirect(new URL("/admin", request.url), 303);
    resp.cookies.set({
      name: "session",
      value: `${slug}:${chefName}:chef:${chefPin}`,
      ...sessionCookieOptions(),
    });
    return resp;
  } catch (err) {
    return errorResponse(err);
  }
}
