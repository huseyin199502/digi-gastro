import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET+POST /admin/loyalty/sync-pass-status (main.py ~16425)
async function syncPassStatus() {
  const session = await requireChef();
  const slug = session.slug.toLowerCase().trim();

  const customers = await prisma.loyaltyCustomer.findMany({
    where: { tenant_slug: slug },
  });

  let fixedCount = 0;
  let skippedGoogle = 0;
  const fixedCustomers: Array<Record<string, unknown>> = [];

  for (const c of customers) {
    if (!c.pass_downloaded_at) continue;
    if (c.pass_type === "google") {
      skippedGoogle += 1;
      continue;
    }
    const regCount = await prisma.passkitDeviceRegistration.count({
      where: { pass_serial: c.pass_serial },
    });
    if (regCount === 0) {
      await prisma.loyaltyCustomer.update({
        where: { id: c.id },
        data: { pass_downloaded_at: null, pass_needs_update: false },
      });
      fixedCount += 1;
      fixedCustomers.push({
        id: c.id,
        short_code: c.short_code,
        pass_type: c.pass_type,
        old_pass_downloaded_at: c.pass_downloaded_at,
      });
    }
  }

  return NextResponse.json({
    success: true,
    total_customers: customers.length,
    fixed_count: fixedCount,
    skipped_google: skippedGoogle,
    fixed_customers: fixedCustomers,
    message: `${fixedCount} Apple-Kunden resettet. ${skippedGoogle} Google-Kunden übersprungen (Save/Delete Callback noch nicht implementiert).`,
  });
}

export async function GET() {
  try {
    return await syncPassStatus();
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST() {
  try {
    return await syncPassStatus();
  } catch (err) {
    return errorResponse(err);
  }
}
