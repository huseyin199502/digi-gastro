import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";
import { triggerPassUpdatePush } from "@/lib/loyalty";
import { nowIso } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

// Legacy GET+POST /admin/loyalty/recover-all-passes (main.py ~16484)
async function recoverAllPasses() {
  const session = await requireChef();
  const slug = session.slug.toLowerCase().trim();

  const customers = await prisma.loyaltyCustomer.findMany({
    where: { tenant_slug: slug },
  });

  const stats = {
    total_customers: customers.length,
    reactivated: 0,
    skipped_no_device: 0,
    skipped_google: 0,
    push_failed: 0,
    details: [] as Array<Record<string, unknown>>,
  };

  for (const c of customers) {
    if (c.pass_type === "google") {
      stats.skipped_google += 1;
      continue;
    }

    const regCount = await prisma.passkitDeviceRegistration.count({
      where: { pass_serial: c.pass_serial },
    });
    if (regCount === 0) {
      stats.skipped_no_device += 1;
      continue;
    }

    const now = nowIso();
    await prisma.loyaltyCustomer.update({
      where: { id: c.id },
      data: {
        pass_needs_update: true,
        pass_updated_at: now,
        updated_at: now,
        last_message: "🎉 Deine Stempelkarte ist wieder aktiv!",
        msg_nonce: (c.msg_nonce ?? 0) + 1,
      },
    });

    const fresh = await prisma.loyaltyCustomer.findUniqueOrThrow({
      where: { id: c.id },
    });
    const success = await triggerPassUpdatePush(
      fresh,
      "Stempelkarte aktiviert",
      "🎉 Deine Stempelkarte ist wieder aktiv!"
    );

    if (success) {
      stats.reactivated += 1;
      stats.details.push({
        customer_id: c.id,
        short_code: c.short_code,
        stamps: c.current_stamps,
        push_sent: true,
      });
    } else {
      stats.push_failed += 1;
      stats.details.push({
        customer_id: c.id,
        short_code: c.short_code,
        stamps: c.current_stamps,
        push_sent: false,
        error: "APNs Push fehlgeschlagen (Dev-Mode oder Zertifikate fehlen)",
      });
    }
  }

  return NextResponse.json({
    success: true,
    ...stats,
    message: `${stats.reactivated} Kunden reaktiviert (Push gesendet). ${stats.skipped_no_device} ohne Device-Reg übersprungen. ${stats.skipped_google} Google übersprungen. ${stats.push_failed} Push-Fehler.`,
  });
}

export async function GET() {
  try {
    return await recoverAllPasses();
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST() {
  try {
    return await recoverAllPasses();
  } catch (err) {
    return errorResponse(err);
  }
}
