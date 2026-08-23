import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  errorResponse,
  requireChefOrKellner,
} from "@/lib/adminApi";
import {
  loadOrder,
  MutableOrder,
  nextDailyBonNumber,
  persistOrder,
  updateOrderStatusByItems,
} from "@/lib/orderItems";
import { berlinTimestamp } from "@/lib/time";
import { publishEvent } from "@/lib/eventBus";
import {
  fingerprintOrderInput,
  findOrderIdByIdempotencyKey,
  isValidIdempotencyKey,
  rememberOrderId,
  serializeIdempotent,
} from "@/lib/idempotency";

export const dynamic = "force-dynamic";

// Legacy POST /api/admin/orders/add-manual (main.py ~14565)
// Body: {"table_number": "5", "product_id": int, "quantity": int}
export async function POST(request: NextRequest) {
  try {
    const session = await requireChefOrKellner();
    const slug = session.slug;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { orders_enabled: true },
    });
    if (!tenant) throw new ApiError("Dieses Restaurant existiert nicht.", 404);
    // Super-Admin toggle: orders_enabled = False → staff cannot order either
    if (tenant.orders_enabled === false) {
      throw new ApiError("Bestellungen derzeit nicht verfügbar.", 403);
    }

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    const productId = parseInt(String(payload.product_id), 10);
    const quantity = parseInt(String(payload.quantity), 10);
    if (!Number.isFinite(productId) || !Number.isFinite(quantity) || quantity < 1) {
      throw new ApiError("Ungültige Eingabe.", 400);
    }

    // Idempotenz: Browser-Retries bei schlechtem Internet dürfen keine
    // doppelte Menge buchen. Gleicher Key + gleicher Inhalt → no-op.
    const idemKey = isValidIdempotencyKey(payload.idempotency_key)
      ? payload.idempotency_key
      : null;
    const bodyFp = fingerprintOrderInput({
      table: payload.table_number,
      items: [{ product_id: productId, quantity }],
    });
    if (idemKey) {
      const dupOrderId = await findOrderIdByIdempotencyKey(slug, idemKey, bodyFp);
      if (dupOrderId !== null) {
        return NextResponse.json({ success: true, order_id: dupOrderId, duplicate: true });
      }
    }

    const run = async (): Promise<number> => {

    // 1. Find product (tenant-scoped)
    const product = await prisma.product.findFirst({
      where: { id: productId, tenant_slug: slug },
    });
    if (!product) throw new ApiError("Produkt nicht gefunden.", 404);

    // 2. Resolve table + zone (legacy: "Tisch 5" → number, zone lookup)
    // Accept both "5" and "6 (Draußen)" / "Tisch 6 (Draußen)".
    const rawTable = String(payload.table_number ?? "").replace(/^Tisch\s*/i, "").trim();
    const zoneMatch = rawTable.match(/^(.+?)\s*\(([^)]+)\)$/);
    const tNum = (zoneMatch ? zoneMatch[1] : rawTable).trim();
    const zoneFromStr = zoneMatch ? zoneMatch[2].trim() : "";

    const tables = await prisma.table.findMany({ where: { tenant_slug: slug } });
    let dbTable =
      zoneFromStr
        ? tables.find((x) => x.number === tNum && (x.zone || "").toLowerCase() === zoneFromStr.toLowerCase())
        : null;
    if (!dbTable) dbTable = tables.find((x) => x.number === tNum) ?? null;
    if (!dbTable) throw new ApiError("Tisch existiert nicht.", 404);
    const tableStr = dbTable.zone
      ? `Tisch ${tNum} (${dbTable.zone})`
      : `Tisch ${tNum}`;

    const itemPrice = product.price;

    // 3. Find active (open) order for this table
    const activeOrderRow = await prisma.order.findFirst({
      where: {
        tenant_slug: slug,
        table: tableStr,
        status: { notIn: ["bezahlt", "storniert"] },
      },
      orderBy: { id: "asc" },
    });

    if (activeOrderRow) {
      const order: MutableOrder = (await loadOrder(slug, activeOrderRow.id))!;
      // Merge into existing pending item with same product & no note (no combos)
      const existingItem = order.items.find(
        (i) =>
          i.product_id === product.id &&
          !i.note &&
          i.item_status === "pending" &&
          !i.combo_id
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        order.items.push({
          product_id: product.id,
          name: product.name,
          price: itemPrice,
          quantity,
          category_type: product.category_type ?? "küche",
          note: null,
          item_status: "pending",
          combo_id: null,
          combo_name: null,
          combo_instance_id: null,
        });
      }
      const addAmount = Math.round(itemPrice * quantity * 100) / 100;
      order.total = Math.round((order.total + addAmount) * 100) / 100;
      order.total_with_tip =
        Math.round((order.total_with_tip + addAmount) * 100) / 100;
      updateOrderStatusByItems(order);
      await persistOrder(order);
      return activeOrderRow.id;
    } else {
      // Create a new order with daily Bon number
      const { bonNumber, bonDate } = await nextDailyBonNumber(slug);
      const total = Math.round(itemPrice * quantity * 100) / 100;
      const created = await prisma.order.create({
        data: {
          tenant_slug: slug,
          table: tableStr,
          total,
          total_with_tip: total,
          tip_amount: 0,
          status: "eingegangen",
          timestamp: berlinTimestamp(),
          mwst_rate: 19,
          waiter_id: session.name,
          original_total: total,
          daily_bon_number: bonNumber,
          bon_date: bonDate,
          items: {
            create: [
              {
                product_id: product.id,
                name: product.name,
                price: itemPrice,
                quantity,
                category_type: product.category_type ?? "küche",
                note: null,
                item_status: "pending",
              },
            ],
          },
        },
      });
      return created.id;
    }
    };

    const targetOrderId = await serializeIdempotent(slug, idemKey, bodyFp, async () => {
      // Double-Check nach Lock-Erwerb
      if (idemKey) {
        const dupOrderId = await findOrderIdByIdempotencyKey(slug, idemKey, bodyFp);
        if (dupOrderId !== null) return dupOrderId;
      }
      const orderId = await run();
      if (idemKey) {
        await rememberOrderId(slug, idemKey, bodyFp, orderId);
      }
      return orderId;
    });

    publishEvent(slug, { type: "update" });

    return NextResponse.json({ success: true, order_id: targetOrderId });
  } catch (err) {
    return errorResponse(err);
  }
}
