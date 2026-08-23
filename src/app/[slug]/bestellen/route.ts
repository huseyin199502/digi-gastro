import { NextRequest, NextResponse } from "next/server";
import {
  createOrder,
  OrderRejectedError,
  TenantNotFoundError,
  TenantSuspendedError,
} from "@/lib/orders";

// Legacy-compatible path: POST /{slug}/bestellen (main.py ~5782)

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungültige Anfrage." },
      { status: 400 }
    );
  }

  const payload = body as {
    table?: unknown;
    items?: { product_id?: unknown; quantity?: unknown; note?: unknown; extras?: unknown }[];
    tip_amount?: unknown;
    waiter_id?: unknown;
    idempotency_key?: unknown;
  };

  if (!payload || typeof payload.table === "undefined") {
    return NextResponse.json(
      { success: false, error: "Tisch fehlt." },
      { status: 400 }
    );
  }

  try {
    const result = await createOrder(slug, {
      table: String(payload.table),
      items: (payload.items ?? []).map((i) => ({
        product_id: Number(i.product_id),
        quantity: Number(i.quantity) || 0,
        note: i.note ? String(i.note) : null,
        extras: Array.isArray(i.extras)
          ? (i.extras as { name?: unknown; price?: unknown }[]).map((e) => ({
              name: String(e.name ?? ""),
              price: Number(e.price) || 0,
            }))
          : undefined,
      })),
      tip_amount: payload.tip_amount ? Number(payload.tip_amount) : 0,
      waiter_id: payload.waiter_id ? String(payload.waiter_id) : null,
      idempotency_key: typeof payload.idempotency_key === "string" ? payload.idempotency_key : null,
    });
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    if (e instanceof OrderRejectedError) {
      return NextResponse.json(
        { success: false, error: e.message },
        { status: e.status }
      );
    }
    if (e instanceof TenantNotFoundError) {
      return NextResponse.json(
        { success: false, error: "Dieses Restaurant existiert nicht." },
        { status: 404 }
      );
    }
    if (e instanceof TenantSuspendedError) {
      return NextResponse.json(
        { success: false, error: "Restaurant vorübergehend nicht verfügbar." },
        { status: 403 }
      );
    }
    console.error("[bestellen] unexpected error", e);
    return NextResponse.json(
      { success: false, error: "Interner Fehler." },
      { status: 500 }
    );
  }
}
