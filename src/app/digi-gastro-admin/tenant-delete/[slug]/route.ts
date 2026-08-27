import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requirePlatformAdmin } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// POST /digi-gastro-admin/tenant-delete/{slug}
// Löscht einen Tenant vollständig (Cascade). Die UI zeigt einen Warnhinweis.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { slug } = await params;
    const slugLower = slug.toLowerCase().trim();

    // Schutz: keine systemkritischen Slugs löschen
    if (slugLower === "test-gastro") {
      return NextResponse.json(
        { success: false, error: "Test-Tenant darf nicht gelöscht werden." },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: slugLower },
      select: { slug: true, name: true },
    });
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Tenant nicht gefunden." },
        { status: 404 }
      );
    }

    // Cascade löscht abhängige Datensätze (Orders, Produkte, Kategorien, …)
    await prisma.tenant.delete({ where: { slug: slugLower } });

    return NextResponse.json({
      success: true,
      message: `Tenant "${tenant.name}" (${tenant.slug}) gelöscht.`,
    });
  } catch (err) {
    return errorResponse(err);
  }
}