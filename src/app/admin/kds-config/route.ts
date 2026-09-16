import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, readBodyAny, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Erlaubte Service-Ruf-Typen für das KDS.
const SERVICE_TYPES = ["kellner", "kohle", "rechnung", "bar", "karte"];

function parseStringList(raw: unknown): string[] {
  let arr: unknown[] = [];
  if (Array.isArray(raw)) arr = raw;
  else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) arr = parsed;
    } catch {
      arr = [];
    }
  }
  return [...new Set(arr.map((v) => String(v).trim()))].filter(Boolean);
}

// POST /admin/kds-config
// Speichert pro Tenant, ob der KDS aktiv ist, welche Hauptgruppen
// (Super-Groups) und welche Service-Ruf-Typen auf dem Küchen-Display
// sichtbar sind.
// Body: { enabled: boolean, super_group_ids: number[], service_types: string[] }
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const body = await readBodyAny(request);

    const enabled =
      body.enabled === true ||
      ["true", "1", "on", "yes"].includes(
        String(body.enabled ?? "").trim().toLowerCase()
      );

    const ids = parseStringList(body.super_group_ids)
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n));
    const unique = [...new Set(ids)];

    const serviceTypes = parseStringList(body.service_types).filter((t) =>
      SERVICE_TYPES.includes(t)
    );

    await prisma.tenant.update({
      where: { slug },
      data: {
        kds_enabled: enabled,
        kds_super_group_ids: JSON.stringify(unique),
        kds_service_types: JSON.stringify(serviceTypes),
      },
    });

    return NextResponse.json({
      success: true,
      enabled,
      super_group_ids: unique,
      service_types: serviceTypes,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
