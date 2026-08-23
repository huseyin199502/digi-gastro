import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  dashboardRedirect,
  errorResponse,
  requireChef,
  wantsJson,
} from "@/lib/adminApi";
import { readBodyFields } from "@/lib/tabletOps";

export const dynamic = "force-dynamic";

// Legacy POST /admin/legal-update (main.py ~8511)
// Speichert Inhaber-Kontaktdaten und generiert § 5 TMG-konformes
// Impressum + Datenschutzerklärung automatisch.
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) {
      return NextResponse.redirect(new URL("/admin/setup", request.url), 303);
    }
    if (!tenant.is_setup_completed) {
      return NextResponse.redirect(new URL("/admin/setup", request.url), 303);
    }

    const fields = await readBodyFields(request);
    const ownerName = String(fields.owner_name ?? "").trim();
    const ownerStreet = String(fields.owner_street ?? "").trim();
    const ownerEmail = String(fields.owner_email ?? "").trim();
    const ownerPhone = String(fields.owner_phone ?? "").trim();

    // Auto-Generiertes Impressum (legacy main.py ~8542)
    const name = ownerName || session.name || "Chef";
    const street = ownerStreet || tenant.address || "";
    const plzOrt = `${tenant.plz ?? ""} ${tenant.ort ?? ""}`.trim();
    let addrLine = street;
    if (plzOrt) {
      addrLine = street ? `${street}, ${plzOrt}` : plzOrt;
    }

    const contactLines: string[] = [];
    if (ownerEmail) contactLines.push(`E-Mail: ${ownerEmail}`);
    if (ownerPhone) contactLines.push(`Telefon: ${ownerPhone}`);
    if (!ownerEmail && tenant.email) contactLines.push(`E-Mail: ${tenant.email}`);

    const impressum =
      `Impressum\n\n` +
      `Angaben gemäß § 5 TMG:\n\n` +
      `${tenant.name ?? ""}\n` +
      `Verantwortlich: ${name}\n` +
      `${addrLine}\n` +
      (contactLines.length > 0
        ? `\nKontakt:\n${contactLines.join("\n")}\n`
        : `\n`);

    const datenschutz =
      `Datenschutzerklärung\n\n` +
      `Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. ` +
      `Personenbezogene Daten werden auf dieser digitalen Speisekarte ` +
      `nur im technisch notwendigen Umfang (Tischzuordnung und ` +
      `Bestellübermittlung) erhoben und verarbeitet.\n\n` +
      `Verantwortlich im Sinne der DSGVO: ${ownerName || session.name || "Chef"}`;

    await prisma.tenant.update({
      where: { slug },
      data: {
        owner_name: ownerName,
        owner_street: ownerStreet,
        owner_email: ownerEmail,
        owner_phone: ownerPhone,
        impressum_content: impressum,
        datenschutz_content: datenschutz,
      },
    });

    if (wantsJson(request)) {
      return NextResponse.json({ success: true });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
