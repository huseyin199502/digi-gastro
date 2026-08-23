import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy PUT /admin/api/lager/suppliers/{supplier_id}
// (modules_personal_inventory.py 663): vollständiger Feld-Ersatz.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ supplier_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const { supplier_id } = await params;
    const supplierId = Number(supplier_id);
    if (!Number.isInteger(supplierId)) {
      throw new ApiError("Input should be a valid integer", 422);
    }

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, tenant_slug: slug },
    });
    if (!supplier) throw new ApiError("Lieferant nicht gefunden", 404);

    await prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        name: String(body.name ?? supplier.name),
        contact_name: body.contact_name != null ? String(body.contact_name) : null,
        phone: body.phone != null ? String(body.phone) : null,
        email: body.email != null ? String(body.email) : null,
        address: body.address != null ? String(body.address) : null,
        lead_time_days: Number(body.lead_time_days ?? supplier.lead_time_days),
        min_order_value: Number(body.min_order_value ?? supplier.min_order_value),
        active: body.active != null ? Boolean(body.active) : supplier.active,
        notes: body.notes != null ? String(body.notes) : null,
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy DELETE /admin/api/lager/suppliers/{supplier_id}
// (modules_personal_inventory.py 678)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ supplier_id: string }> }
) {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const { supplier_id } = await params;
    const supplierId = Number(supplier_id);
    if (!Number.isInteger(supplierId)) {
      throw new ApiError("Input should be a valid integer", 422);
    }

    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, tenant_slug: slug },
    });
    if (!supplier) throw new ApiError("Lieferant nicht gefunden", 404);

    await prisma.supplier.delete({ where: { id: supplier.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
