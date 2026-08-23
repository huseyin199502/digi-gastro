import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET /admin/impersonate/{table_number} (main.py ~7867)
// Chef schlüpft in die Gast-Rolle eines Tisches (Vorschau/Support).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table_number: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const { table_number } = await params;
    const tableNum = String(table_number).trim();
    const z = request.nextUrl.searchParams.get("z");

    const tablesList = await prisma.table.findMany({
      where: { tenant_slug: slug },
      orderBy: { id: "asc" },
    });

    // Nummer + Zone matchen (Zone case-insensitive)
    let dbTable: (typeof tablesList)[number] | undefined;
    if (z) {
      const zLower = z.trim().toLowerCase();
      dbTable = tablesList.find(
        (t) =>
          String(t.number) === tableNum &&
          String(t.zone ?? "").trim().toLowerCase() === zLower
      );
    }
    if (!dbTable && !z) {
      dbTable = tablesList.find((t) => String(t.number) === tableNum);
    }
    if (!dbTable) {
      throw new ApiError("Tisch nicht gefunden.", 404);
    }

    // Ohne active_session_token funktioniert das Bestellen nicht → anlegen
    let tableToken = dbTable.active_session_token;
    if (!tableToken) {
      tableToken = crypto.randomBytes(4).toString("hex");
      await prisma.table.update({
        where: { id: dbTable.id },
        data: { active_session_token: tableToken },
      });
    }

    let tableDisplayName = `Tisch ${tableNum}`;
    if (dbTable.zone) tableDisplayName += ` (${dbTable.zone})`;

    const zoneParam = z ? `&z=${z}` : "";
    const target = new URL(
      `/${slug}?tisch=${tableNum}&token=${tableToken}${zoneParam}`,
      request.url
    );
    const resp = NextResponse.redirect(target, 303);
    resp.cookies.set({
      name: `guest_session_${slug}`,
      value: `${tableDisplayName}:${tableToken}`,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.COOKIE_SECURE === "1",
      maxAge: 1800,
      path: "/",
    });
    return resp;
  } catch (err) {
    return errorResponse(err);
  }
}
