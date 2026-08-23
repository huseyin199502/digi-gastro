import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/loyalty/delete-all-customers (main.py ~17163)
// Löscht ALLE Kunden des aktuellen Tenants (für Demo-Cleanup).
export async function POST() {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const customers = await prisma.loyaltyCustomer.findMany({
      where: { tenant_slug: slug },
      select: { id: true, pass_serial: true },
    });
    const customerIds = customers.map((c) => c.id);
    const serials = customers.map((c) => c.pass_serial);

    if (customerIds.length > 0) {
      await prisma.loyaltyStamp.deleteMany({ where: { customer_id: { in: customerIds } } });
      await prisma.loyaltyPushLog.deleteMany({ where: { customer_id: { in: customerIds } } });
      if (serials.length > 0) {
        await prisma.passkitDeviceRegistration.deleteMany({
          where: { pass_serial: { in: serials } },
        });
      }
      await prisma.loyaltyCustomer.deleteMany({ where: { tenant_slug: slug } });
    }

    return NextResponse.json({ success: true, deleted_count: customers.length });
  } catch (err) {
    return errorResponse(err);
  }
}