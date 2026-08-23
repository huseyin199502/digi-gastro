import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET /admin/api/lager/suppliers (modules_personal_inventory.py 638)
export async function GET() {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const suppliers = await prisma.supplier.findMany({
      where: { tenant_slug: slug },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({
      suppliers: suppliers.map((s) => ({
        id: s.id,
        name: s.name,
        contact_name: s.contact_name,
        phone: s.phone,
        email: s.email,
        address: s.address,
        lead_time_days: s.lead_time_days,
        min_order_value: Number(s.min_order_value ?? 0),
        active: s.active,
        notes: s.notes,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy POST /admin/api/lager/suppliers (modules_personal_inventory.py 649)
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const name = body.name;
    if (!name) throw new ApiError("Validation error", 422);

    const supplier = await prisma.supplier.create({
      data: {
        tenant_slug: slug,
        name: String(name),
        contact_name: body.contact_name != null ? String(body.contact_name) : null,
        phone: body.phone != null ? String(body.phone) : null,
        email: body.email != null ? String(body.email) : null,
        address: body.address != null ? String(body.address) : null,
        lead_time_days: Number(body.lead_time_days ?? 2),
        min_order_value: Number(body.min_order_value ?? 0),
        notes: body.notes != null ? String(body.notes) : null,
      },
    });
    return NextResponse.json({ success: true, id: supplier.id });
  } catch (err) {
    return errorResponse(err);
  }
}
