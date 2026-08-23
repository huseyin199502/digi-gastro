import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET+POST /admin/loyalty/backfill-device-ids (main.py ~16735)
async function backfillDeviceIds() {
  const session = await requireChef();
  const slug = session.slug.toLowerCase().trim();

  const customers = await prisma.loyaltyCustomer.findMany({
    where: { tenant_slug: slug },
  });

  let backfilledCount = 0;
  let alreadySetCount = 0;
  let noRegistrationCount = 0;
  const details: Array<Record<string, unknown>> = [];

  for (const c of customers) {
    if (c.last_known_device_id) {
      alreadySetCount += 1;
      continue;
    }

    const reg = await prisma.passkitDeviceRegistration.findFirst({
      where: { pass_serial: c.pass_serial },
    });
    if (reg && reg.device_library_identifier) {
      await prisma.loyaltyCustomer.update({
        where: { id: c.id },
        data: { last_known_device_id: reg.device_library_identifier },
      });
      backfilledCount += 1;
      details.push({
        customer_id: c.id,
        short_code: c.short_code,
        stamps: c.current_stamps,
        device_id: reg.device_library_identifier.slice(0, 16) + "...",
        pass_serial: c.pass_serial.slice(0, 8) + "...",
      });
    } else {
      noRegistrationCount += 1;
    }
  }

  return NextResponse.json({
    success: true,
    total_customers: customers.length,
    backfilled_count: backfilledCount,
    already_set_count: alreadySetCount,
    no_registration_count: noRegistrationCount,
    details: details.slice(0, 20),
  });
}

export async function GET() {
  try {
    return await backfillDeviceIds();
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST() {
  try {
    return await backfillDeviceIds();
  } catch (err) {
    return errorResponse(err);
  }
}
