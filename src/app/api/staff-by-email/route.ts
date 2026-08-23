import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Legacy GET /api/staff-by-email (main.py ~8075)
// Liefert alle Mitarbeiter eines Tenants (für Kellner-Login-Dropdown),
// gesucht anhand der Restaurant-E-Mail.
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email") ?? "";
  if (!email || !email.trim()) {
    return NextResponse.json({
      staff: [],
      error: "Keine E-Mail angegeben",
    });
  }

  const tenant = await prisma.tenant.findFirst({
    where: { email: email.trim() },
  });
  if (!tenant) {
    return NextResponse.json({
      staff: [],
      error: "Restaurant nicht gefunden",
    });
  }

  const staff = await prisma.staff.findMany({
    where: { tenant_slug: tenant.slug },
    orderBy: { id: "asc" },
  });

  return NextResponse.json({
    tenant: tenant.slug,
    restaurant_name: tenant.name || tenant.slug,
    staff: staff.map((s) => ({ name: s.name, role: s.role || "kellner" })),
  });
}
