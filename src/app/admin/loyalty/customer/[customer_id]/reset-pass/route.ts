import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, jsonError, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/loyalty/customer/{customer_id}/reset-pass (main.py ~16394)
export async function POST(
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
      return jsonError(404, "Customer nicht gefunden");
    }

    const oldPassDownloadedAt = customer.pass_downloaded_at;
    await prisma.loyaltyCustomer.update({
      where: { id: customer.id },
      data: { pass_downloaded_at: null, pass_needs_update: false },
    });

    return NextResponse.json({
      success: true,
      customer_id: customer.id,
      old_pass_downloaded_at: oldPassDownloadedAt,
      new_pass_downloaded_at: null,
      message:
        "Customer wird das Loyalty-Popup wieder sehen beim nächsten Speisekarten-Besuch",
    });
  } catch (err) {
    return errorResponse(err);
  }
}
