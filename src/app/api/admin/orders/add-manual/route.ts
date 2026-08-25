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
  withLock,
} from "@/lib/idempotency";

export const dynamic = "force-dynamic";

// Legacy POST /api/admin/orders/add-manual (main.py ~14565)
// Body (neu, Batch): {"table_number": "5", "items": [{"product_id": int, "quantity": int}]}
// Body (legacy):     {"table_number": "5", "product_id": int, "quantity": int}
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
      throw new ApiError("Ungültige JSON-Format.", 400);
    }

    // Items auflösen — Batch oder legacy Einzelprodukt
    interface ManualItem { productId: number; quantity: number }
    let items: ManualItem[];
    if (Array.isArray(payload.items) && payload.items.length > 0) {
      items = payload.items.map((raw) => {
        const it = (raw ?? {}) as Record<string, unknown>;
        return {
          productId: parseInt(String(it.product_id), 10),
          quantity: parseInt(String(it.quantity), 10),
        };
      });
    } else {
      items = [
        {
          productId: parseInt(String(payload.product_id), 10),
          quantity: parseInt(String(payload.quantity), 10),
        },
      ];
    }
    if (
      items.length === 0 ||
      items.some((it) => !Number.isFinite(it.productId) || !Number.isFinite(it.quantity) || it.quantity < 1)
    ) {
      throw new ApiError("Ungültige Eingabe.", 400);
    }

    // Idempotenz: Browser-Retries bei schlechtem Internet dürfen keine
    // doppelte Menge buchen. Gleicher Key + gleicher Inhalt → no-op.
    const idemKey = isValidIdempotencyKey(payload.idempotency_key)
      ? payload.idempotency_key
      : null;
    const bodyFp = fingerprintOrderInput({
      table: payload.table_number,
      items: items.map((it) => ({ product_id: it.productId, quantity: it.quantity })),
    });
    if (idemKey) {
      const dupOrderId = await findOrderIdByIdempotencyKey(slug, idemKey, bodyFp);
      if (dupOrderId !== null) {
        return NextResponse.json({ success: true, order_id: dupOrderId, duplicate: true });
      }
    }

    // 1. Resolve table + zone (legacy: "Tisch 5" → number, zone lookup)
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

    const run = async (): Promise<number> => {
      // Produkte tenant-scoped laden
      const productIds = [...new Set(items.map((it) => it.productId))];
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, tenant_slug: slug },
      });
      if (products.length !== productIds.length) {
        throw new ApiError("Produkt nicht gefunden.", 404);
      }

      // 2. Find active (open) order for this table
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
        let addAmount = 0;
        for (const it of items) {
          const product = products.find((p) => p.id === it.productId)!;
          // Jede ausgewählte Position wird eine EIGENE order_item-Zeile
          // (kein Zusammenführen identischer Produkte): Der Kellner sieht
          // im Cockpit z.B. zwei getrennte "1× Döner Teller" statt einer
          // "2× Döner Teller"-Zeile.
          order.items.push({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: it.quantity,
            category_type: product.category_type ?? "küche",
            note: null,
            item_status: "pending",
            combo_id: null,
            combo_name: null,
            combo_instance_id: null,
          });
          addAmount += product.price * it.quantity;
        }
        addAmount = Math.round(addAmount * 100) / 100;
        order.total = Math.round((order.total + addAmount) * 100) / 100;
        order.total_with_tip =
          Math.round((order.total_with_tip + addAmount) * 100) / 100;
        updateOrderStatusByItems(order);
        await persistOrder(order);
        return activeOrderRow.id;
      } else {
        // Create a new order with daily Bon number — ALLE Positionen in
        // EINER Bestellung (ein Bon), nicht eine Order pro Produkt.
        const total =
          Math.round(
            items.reduce((s, it) => {
              const p = products.find((x) => x.id === it.productId)!;
              return s + p.price * it.quantity;
            }, 0) * 100
          ) / 100;
        const { bonNumber, bonDate } = await nextDailyBonNumber(slug);
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
              create: items.map((it) => {
                const product = products.find((p) => p.id === it.productId)!;
                return {
                  product_id: product.id,
                  name: product.name,
                  price: product.price,
                  quantity: it.quantity,
                  category_type: product.category_type ?? "küche",
                  note: null,
                  item_status: "pending",
                };
              }),
            },
          },
        });
        return created.id;
      }
    };

    const targetOrderId = await withLock(`${slug}:table:${dbTable.id}`, async () => {
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
