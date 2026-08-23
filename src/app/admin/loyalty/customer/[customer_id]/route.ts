import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, jsonError, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy DELETE /admin/loyalty/customer/{customer_id} (main.py ~17133)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ customer_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug.toLowerCase().trim();
    const { customer_id } = await params;
    const customerId = parseInt(customer_id, 10);

    const customer = await prisma.loyaltyCustomer.findFirst({
      where: { tenant_slug: slug, id: customerId },
    });
    if (!customer) {
      return jsonError(404, "Kunde nicht gefunden.");
    }

    await prisma.loyaltyStamp.deleteMany({
      where: { customer_id: customer.id },
    });
    await prisma.loyaltyPushLog.deleteMany({
      where: { customer_id: customer.id },
    });
    await prisma.passkitDeviceRegistration.deleteMany({
      where: { pass_serial: customer.pass_serial },
    });
    await prisma.loyaltyCustomer.delete({ where: { id: customer.id } });

    return NextResponse.json({ success: true, deleted: customerId });
  } catch (err) {
    return errorResponse(err);
  }
}
