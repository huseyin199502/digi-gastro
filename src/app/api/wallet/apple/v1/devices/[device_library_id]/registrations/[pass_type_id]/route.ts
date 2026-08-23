import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/adminApi";
import { nowIso } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

// Legacy GET /api/wallet/apple/v1/devices/{device_library_id}/registrations/{pass_type_id}
// (main.py ~15569) — Liste der Pässe auf dem Device + passesUpdatedSince-Logik.
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ device_library_id: string; pass_type_id: string }>;
  }
) {
  try {
    const { device_library_id, pass_type_id } = await params;
    const passesUpdatedSince = (
      request.nextUrl.searchParams.get("passesUpdatedSince") ?? ""
    ).trim();

    const regs = await prisma.passkitDeviceRegistration.findMany({
      where: {
        device_library_identifier: device_library_id,
        pass_type_identifier: pass_type_id,
      },
    });
    if (regs.length === 0) {
      return new NextResponse(null, { status: 204 });
    }

    const serials = regs.map((r) => r.pass_serial);
    const customers = await prisma.loyaltyCustomer.findMany({
      where: { pass_serial: { in: serials } },
    });

    // lastUpdated = neuester pass_updated_at aller Customers
    // (pass_updated_at ist der echte Pass-Update-Zeitpunkt, nicht last_visit_at)
    const allPassUpdates = customers.map(
      (c) => c.pass_updated_at || c.created_at
    );
    const latestUpdate =
      allPassUpdates.length > 0
        ? allPassUpdates.reduce((a, b) => (a > b ? a : b))
        : nowIso();

    // Wenn passesUpdatedSince vorhanden und nichts neues → 204
    if (passesUpdatedSince && latestUpdate <= passesUpdatedSince) {
      return new NextResponse(null, { status: 204 });
    }

    // Pässe die ein Update brauchen (pass_needs_update=true)
    const needsUpdateSerials = customers
      .filter((c) => c.pass_needs_update)
      .map((c) => c.pass_serial);

    if (needsUpdateSerials.length === 0) {
      // Kein Pass braucht ein Update — aber ohne passesUpdatedSince
      // (erster Check) alle Serials senden
      if (!passesUpdatedSince) {
        return NextResponse.json({
          lastUpdated: latestUpdate,
          serialNumbers: serials,
        });
      }
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json({
      lastUpdated: latestUpdate,
      serialNumbers: needsUpdateSerials,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
