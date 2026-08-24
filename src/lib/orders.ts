import { prisma } from "./prisma";
import { publishEvent } from "./eventBus";
import {
  fingerprintOrderInput,
  findOrderIdByIdempotencyKey,
  isValidIdempotencyKey,
  rememberOrderId,
  serializeIdempotent,
} from "./idempotency";
import {
  displayPrice,
  getTenantMenu,
  isEventActiveNow,
  mwstRateFor,
  TenantNotFoundError,
  TenantSuspendedError,
} from "./menu";
import { berlinDateStr, berlinTimeStr, berlinTimestamp, getBerlinNow, possibleDaysToday } from "./time";

// ──────────────────────────────────────────────────────────────────
// Order creation — port of legacy POST /{slug}/bestellen (main.py ~5782).
// Security-relevant core:
//  - orders_enabled gate
//  - empty-cart rejection
//  - unknown-product rejection
//  - server-side price recomputation (never trust client prices)
//  - combo price validation against the active server-side combo
//  - one OrderItem row per physical product unit (no Cockpit quantity merge)
//  - daily Bon number per tenant (bon_date + daily_bon_number)
//  - tenant revenue counters + audit log
// ──────────────────────────────────────────────────────────────────

export interface OrderItemInput {
  product_id: number;
  quantity: number;
  note?: string | null;
  extras?: { name: string; price: number }[];
}

export interface CreateOrderInput {
  table: string; // e.g. "1" or "1 (Drinnen)" or "Tisch 1 (Drinnen)"
  items: OrderItemInput[];
  tip_amount?: number;
  waiter_id?: string | null;
  idempotency_key?: string | null;
}

export class OrderRejectedError extends Error {
  constructor(
    message: string,
    public status: number = 400
  ) {
    super(message);
  }
}

async function loadExistingOrderResult(
  slug: string,
  orderId: number
): Promise<{ order_id: number; daily_bon_number: number } | null> {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, daily_bon_number: true },
  });
  if (!existing) return null;
  return { order_id: existing.id, daily_bon_number: existing.daily_bon_number ?? 0 };
}

function comboNameFromNote(note?: string | null): string | null {
  const value = String(note ?? "").trim();
  if (!value.startsWith("Kombi:")) return null;
  const name = value.slice("Kombi:".length).trim();
  return name || null;
}

export async function createOrder(
  rawSlug: string,
  input: CreateOrderInput
): Promise<{ order_id: number; daily_bon_number: number }> {
  const slug = rawSlug.toLowerCase().trim();
  const menu = await getTenantMenu(slug); // throws TenantNotFound/Suspended

  if (!menu.tenant.orders_enabled) {
    throw new OrderRejectedError("Bestellungen derzeit nicht verfügbar.", 403);
  }
  if (menu.tenant.operating_mode === "stempelkarte_only") {
    throw new OrderRejectedError("Bestellungen derzeit nicht verfügbar.", 403);
  }
  if (!input.items || input.items.length === 0) {
    throw new OrderRejectedError(
      "Warenkorb ist leer — Bestellung abgelehnt.",
      400
    );
  }
  const totalQty = input.items.reduce(
    (sum, i) => sum + (i.quantity || 0),
    0
  );
  if (totalQty <= 0) {
    throw new OrderRejectedError(
      "Warenkorb enthält keine gültige Artikel.",
      400
    );
  }

  // ── Idempotenz-Schutz ──
  const idemKey = isValidIdempotencyKey(input.idempotency_key)
    ? input.idempotency_key
    : null;
  const bodyFp = fingerprintOrderInput({
    table: input.table,
    items: input.items,
    tip_amount: input.tip_amount,
  });

  const createNewOrder = async (): Promise<{
    order_id: number;
    daily_bon_number: number;
  }> => {
    // ── Resolve table + zone (legacy parse_active_table_num) ──
    let tableRaw = String(input.table ?? "").trim();
    if (tableRaw.startsWith("Tisch ")) tableRaw = tableRaw.slice(6).trim();
    let zone = "";
    if (tableRaw.includes("(") && tableRaw.endsWith(")")) {
      const idx = tableRaw.indexOf("(");
      zone = tableRaw.slice(idx + 1, -1).trim();
      tableRaw = tableRaw.slice(0, idx).trim();
    }
    const dbTable = zone
      ? await prisma.table.findFirst({
          where: { tenant_slug: slug, number: tableRaw, zone },
        })
      : await prisma.table.findFirst({
          where: { tenant_slug: slug, number: tableRaw },
        });
    const resolvedZone = dbTable?.zone ?? zone;
    const orderTableName = resolvedZone
      ? `Tisch ${tableRaw} (${resolvedZone})`
      : `Tisch ${tableRaw}`;

    // ── Active events for price recomputation ──
    const berlinNow = getBerlinNow();
    const nowTime = berlinTimeStr(berlinNow);
    const possibleDays = possibleDaysToday(berlinNow);
    const dbEvents = await prisma.event.findMany({
      where: { tenant_slug: slug },
      include: { products: true },
    });
    const activeEventProducts = new Map<number, number>();
    let activeDiscount = 0;
    for (const ev of dbEvents) {
      if (ev.is_active === false) continue;
      let days: string[] = [];
      try {
        days = JSON.parse(ev.days || "[]");
      } catch {
        days = [];
      }
      const isToday = days.some((d: string) => possibleDays.includes(d));
      const activeNow =
        isToday &&
        isEventActiveNow(
          ev.start_time ?? "18:00",
          ev.end_time ?? "20:00",
          nowTime
        );
      if (!activeNow) continue;
      if (ev.mode === "discount" && (ev.discount ?? 0) > 0) {
        activeDiscount = Math.max(activeDiscount, ev.discount ?? 0);
      }
      for (const ep of ev.products) {
        if (ep.event_price !== null) activeEventProducts.set(ep.product_id, ep.event_price);
      }
    }

    // ── Validate active combo definitions server-side ──
    const activeCombos = new Map<number, { id: number; name: string; combo_price: number }>();
    const activeCombosByName = new Map<string, { id: number; name: string; combo_price: number }>();
    for (const event of menu.todayComboEvents) {
      for (const combo of event.combos) {
        const record = { id: combo.id, name: combo.name, combo_price: combo.combo_price };
        activeCombos.set(combo.id, record);
        activeCombosByName.set(combo.name.trim().toLowerCase(), record);
      }
    }

    // Determine the number of units in each combo from the submitted items.
    // The client only sends the human-readable "Kombi: <name>" note, so the
    // server resolves the actual combo and price from its own active menu.
    const comboGroups = new Map<string, {
      combo: { id: number; name: string; combo_price: number };
      totalUnits: number;
      assignedUnits: number;
      instanceId: string;
    }>();
    for (const item of input.items) {
      const comboName = comboNameFromNote(item.note);
      if (!comboName) continue;
      const combo = activeCombosByName.get(comboName.toLowerCase());
      if (!combo) {
        throw new OrderRejectedError(`Kombi nicht mehr verfügbar: ${comboName}`, 400);
      }
      const key = combo.name.trim().toLowerCase();
      const existing = comboGroups.get(key);
      if (existing) {
        existing.totalUnits += Math.max(0, item.quantity || 0);
      } else {
        comboGroups.set(key, {
          combo,
          totalUnits: Math.max(0, item.quantity || 0),
          assignedUnits: 0,
          instanceId: `combo-${combo.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        });
      }
    }

    // ── Server-side price recomputation ──
    const priceMode = menu.tenant.price_mode;
    const productsMap = new Map(menu.products.map((p) => [p.id, p]));
    let total = 0;
    let mwstRate = 7;
    let physicalUnitIdentity = 0;

    const orderItems: {
      product_id: number;
      name: string;
      price: number;
      quantity: number;
      category_type: string;
      note: string | null;
      extras: string;
      item_status: string;
      tenant_slug: string;
      combo_id?: number | null;
      combo_name?: string | null;
      combo_instance_id?: string | null;
    }[] = [];

    for (let itemIndex = 0; itemIndex < input.items.length; itemIndex++) {
      const item = input.items[itemIndex];
      const prod = productsMap.get(item.product_id);
      if (!prod) {
        throw new OrderRejectedError(`Unbekanntes Produkt: ${item.product_id}`, 400);
      }
      if (!prod.is_available) {
        throw new OrderRejectedError(
          `Produkt derzeit nicht verfügbar: ${prod.name}`,
          400
        );
      }

      let netPrice = prod.price;
      const eventPrice = activeEventProducts.get(prod.id);
      if (eventPrice !== undefined) {
        netPrice = eventPrice;
      } else if (activeDiscount > 0) {
        netPrice = Math.round(netPrice * (1 - activeDiscount / 100) * 100) / 100;
      }
      const normalUnitPrice = displayPrice(netPrice, prod.category_type, priceMode);

      const rate = mwstRateFor(prod.category_type) > 0.1 ? 19 : 7;
      if (rate > mwstRate) mwstRate = rate;

      const extras = (item.extras ?? [])
        .map((e) => ({ name: String(e.name).trim(), price: Number(e.price) || 0 }))
        .filter((e) => e.name !== "");
      const extrasTotal = extras.reduce((s, e) => s + e.price, 0);

      const comboName = comboNameFromNote(item.note);
      const comboGroup = comboName
        ? comboGroups.get(comboName.trim().toLowerCase()) ?? null
        : null;

      const quantity = Math.max(0, Math.floor(item.quantity || 0));
      for (let unit = 0; unit < quantity; unit++) {
        let unitPrice = normalUnitPrice;
        let comboId: number | null = null;
        let comboNameForItem: string | null = null;
        let comboInstanceId: string | null = null;

        if (comboGroup) {
          comboId = comboGroup.combo.id;
          comboNameForItem = comboGroup.combo.name;
          comboInstanceId = comboGroup.instanceId;
          comboGroup.assignedUnits += 1;
          const assigned = comboGroup.assignedUnits;
          const units = Math.max(1, comboGroup.totalUnits);
          const baseShare = Math.round((comboGroup.combo.combo_price / units) * 100) / 100;
          unitPrice = assigned === units
            ? Math.round((comboGroup.combo.combo_price - baseShare * (units - 1)) * 100) / 100
            : baseShare;
        } else {
          // A negative combo_id is used only as an internal line identity for
          // duplicated normal products. The UI does not treat combo_id alone
          // as a combo, while the Cockpit grouping/key logic keeps each unit
          // as its own physical product row.
          comboId = quantity > 1
            ? -(1000000000 + itemIndex * 100000 + physicalUnitIdentity++)
            : null;
        }

        const itemTotal = unitPrice + extrasTotal;
        total += itemTotal;
        orderItems.push({
          product_id: prod.id,
          name: prod.name,
          price: itemTotal,
          quantity: 1,
          category_type: prod.category_type ?? "küche",
          note: item.note ?? null,
          extras: JSON.stringify(extras),
          item_status: "pending",
          tenant_slug: slug,
          combo_id: comboId,
          combo_name: comboNameForItem,
          combo_instance_id: comboInstanceId,
        });
      }
    }

    total = Math.round(total * 100) / 100;
    const tip = Math.max(0, input.tip_amount ?? 0);

    // ── Daily Bon number (reset per tenant per day) ──
    const bonDate = berlinDateStr(berlinNow);
    const lastBon = await prisma.order.findFirst({
      where: { tenant_slug: slug, bon_date: bonDate },
      orderBy: { daily_bon_number: "desc" },
      select: { daily_bon_number: true },
    });
    const dailyBonNumber = (lastBon?.daily_bon_number ?? 0) + 1;

    const timestamp = berlinTimestamp(berlinNow);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          tenant_slug: slug,
          table: orderTableName,
          total,
          total_with_tip: Math.round((total + tip) * 100) / 100,
          tip_amount: tip,
          status: "eingegangen",
          timestamp,
          mwst_rate: mwstRate,
          waiter_id: input.waiter_id ?? null,
          original_total: total,
          daily_bon_number: dailyBonNumber,
          bon_date: bonDate,
          items: { create: orderItems },
        },
      });

      await tx.tenant.update({
        where: { slug },
        data: {
          tagesumsatz: { increment: total },
          bestellungen_gesamt: { increment: 1 },
        },
      });

      await tx.auditLog.create({
        data: {
          tenant_slug: slug,
          action: "order_created",
          timestamp,
          user: input.waiter_id ?? "guest",
          details: `Order #${created.id} (${orderTableName}) — ${total.toFixed(2)} €`,
        },
      });

      return created;
    });

    if (idemKey) {
      await rememberOrderId(slug, idemKey, bodyFp, order.id);
    }

    publishEvent(slug, {
      type: "new_order",
      order_id: order.id,
      table_number: tableRaw,
      status: "eingegangen",
    });

    return { order_id: order.id, daily_bon_number: dailyBonNumber };
  };

  if (!idemKey) return createNewOrder();

  const fastDupId = await findOrderIdByIdempotencyKey(slug, idemKey, bodyFp);
  if (fastDupId !== null) {
    const fastDup = await loadExistingOrderResult(slug, fastDupId);
    if (fastDup) return fastDup;
  }

  return serializeIdempotent(slug, idemKey, bodyFp, async () => {
    const dupId = await findOrderIdByIdempotencyKey(slug, idemKey, bodyFp);
    if (dupId !== null) {
      const dup = await loadExistingOrderResult(slug, dupId);
      if (dup) return dup;
    }
    return createNewOrder();
  });
}

export { TenantNotFoundError, TenantSuspendedError };