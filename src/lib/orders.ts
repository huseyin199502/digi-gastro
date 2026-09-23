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

type ComboDef = {
  id: number;
  name: string;
  combo_price: number;
  items: {
    product_id: number | null;
    category_name: string | null;
    excluded_product_ids: number[];
  }[];
};

/**
 * Prüft, ob jede physikalische Kombi-Einheit auf genau einen Slot der
 * Server-Kombi-Definition gematcht werden kann (kein Produkt-Substitution-Exploit).
 */
function validateComboUnits(
  combo: ComboDef,
  unitProductIds: number[],
  productsMap: Map<number, { id: number; category: string }>
): void {
  if (combo.items.length === 0) {
    throw new OrderRejectedError(`Kombi ungültig: ${combo.name}`, 400);
  }
  const remaining = [...unitProductIds];
  // Mehrfach-Sets (z. B. 2× Kombi): jeder Satz Slots wird pro Set gematcht.
  const slots = combo.items;
  const sets = Math.max(1, Math.floor(remaining.length / slots.length));
  for (let s = 0; s < sets; s++) {
    for (const slot of slots) {
      let idx = -1;
      if (slot.product_id !== null) {
        idx = remaining.indexOf(slot.product_id);
      } else if (slot.category_name) {
        idx = remaining.findIndex((pid) => {
          const prod = productsMap.get(pid);
          if (!prod) return false;
          if (slot.excluded_product_ids.includes(pid)) return false;
          return prod.category === slot.category_name;
        });
      } else {
        // Slot ohne Produkt- und Kategorie-Bindung: Wildcard (wie vor der
        // Slot-Validierung jedes Produkt akzeptieren).
        idx = remaining.length > 0 ? 0 : -1;
      }
      if (idx === -1) {
        throw new OrderRejectedError(
          `Produkt passt nicht in Kombi: ${combo.name}`,
          400
        );
      }
      remaining.splice(idx, 1);
    }
  }
  if (remaining.length > 0) {
    throw new OrderRejectedError(
      `Unvollständige oder ungültige Kombi: ${combo.name}`,
      400
    );
  }
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
    const activeCombos = new Map<number, { id: number; name: string; combo_price: number; items: { product_id: number | null; category_name: string | null; excluded_product_ids: number[] }[] }>();
    const activeCombosByName = new Map<string, { id: number; name: string; combo_price: number; items: { product_id: number | null; category_name: string | null; excluded_product_ids: number[] }[] }>();
    for (const event of menu.todayComboEvents) {
      for (const combo of event.combos) {
        const record = {
          id: combo.id,
          name: combo.name,
          combo_price: combo.combo_price,
          items: combo.items.map((ci) => ({
            product_id: ci.product_id ?? null,
            category_name: ci.category_name ?? null,
            excluded_product_ids: ci.excluded_product_ids ?? [],
          })),
        };
        activeCombos.set(combo.id, record);
        activeCombosByName.set(combo.name.trim().toLowerCase(), record);
      }
    }

    // Determine the number of units in each combo from the submitted items.
    // The client only sends the human-readable "Kombi: <name>" note, so the
    // server resolves the actual combo and price from its own active menu.
    const comboGroups = new Map<string, {
      combo: (typeof activeCombosByName extends Map<string, infer V> ? V : never);
      totalUnits: number;
      assignedUnits: number;
      instanceId: string;
      unitProductIds: number[];
    }>();
    for (const item of input.items) {
      const comboName = comboNameFromNote(item.note);
      if (!comboName) continue;
      const combo = activeCombosByName.get(comboName.toLowerCase());
      if (!combo) {
        throw new OrderRejectedError(`Kombi nicht mehr verfügbar: ${comboName}`, 400);
      }
      const key = combo.name.trim().toLowerCase();
      const qty = Math.max(0, item.quantity || 0);
      const existing = comboGroups.get(key);
      if (existing) {
        existing.totalUnits += qty;
        for (let i = 0; i < qty; i++) existing.unitProductIds.push(item.product_id);
      } else {
        comboGroups.set(key, {
          combo,
          totalUnits: qty,
          assignedUnits: 0,
          instanceId: `combo-${combo.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          unitProductIds: Array.from({ length: qty }, () => item.product_id),
        });
      }
    }

    // ── Server-side price recomputation ──
    const priceMode = menu.tenant.price_mode;
    const productsMap = new Map(menu.products.map((p) => [p.id, p]));

    // Jede Kombi-Einheit muss auf einen Slot der Server-Definition passen
    // (verhindert beliebige Produkte zum Kombipreis zu bestellen).
    for (const group of comboGroups.values()) {
      validateComboUnits(group.combo, group.unitProductIds, productsMap);
      const slots = Math.max(1, group.combo.items.length);
      if (group.totalUnits === 0 || group.totalUnits % slots !== 0) {
        throw new OrderRejectedError(
          `Unvollständige Kombi: ${group.combo.name}`,
          400
        );
      }
    }

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
      } else if (
        prod.happy_hour_price != null &&
        prod.happy_hour_price > 0 &&
        prod.happy_hour_active
      ) {
        // Produkt-level Happy Hour muss auch im Preis ankommen (nicht nur Anzeige);
        // happy_hour_price (net) ist nur gesetzt, wenn dieser Fall greift.
        netPrice = prod.happy_hour_price;
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
          // Preis = Anzahl Sets × Kombipreis, gleichmäßig auf alle Einheiten
          const slots = Math.max(1, comboGroup.combo.items.length);
          const numSets = Math.max(1, Math.floor(comboGroup.totalUnits / slots));
          const totalComboCharge = Math.round(comboGroup.combo.combo_price * numSets * 100) / 100;
          const units = Math.max(1, comboGroup.totalUnits);
          const baseShare = Math.round((totalComboCharge / units) * 100) / 100;
          unitPrice = assigned === units
            ? Math.round((totalComboCharge - baseShare * (units - 1)) * 100) / 100
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

    const bonDate = berlinDateStr(berlinNow);
    const timestamp = berlinTimestamp(berlinNow);

    const order = await prisma.$transaction(async (tx) => {
      // Bon-Nummer seriell pro Tenant+Tag vergeben (advisory lock verhindert
      // doppelte daily_bon_number bei gleichzeitigen Bestellungen).
      // $executeRaw statt $queryRaw: pg_advisory_xact_lock() gibt void zurück
      // und Prisma kann void-Spalten in $queryRaw nicht deserialisieren (P2010).
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${slug}:${bonDate}`}))`;
      const lastBonInTx = await tx.order.findFirst({
        where: { tenant_slug: slug, bon_date: bonDate },
        orderBy: { daily_bon_number: "desc" },
        select: { daily_bon_number: true },
      });
      const dailyBonNumber = (lastBonInTx?.daily_bon_number ?? 0) + 1;

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

      // Umsatzzähler NUR bei Zahlung (tablet/bezahlen & Co.) inkrementieren —
      // nicht schon bei Bestellungslegung (sonst doppelter Tagesumsatz).
      await tx.auditLog.create({
        data: {
          tenant_slug: slug,
          action: "order_created",
          timestamp,
          user: input.waiter_id ?? "guest",
          details: `Order #${created.id} (${orderTableName}) — ${total.toFixed(2)} €`,
        },
      });

      return { created, dailyBonNumber };
    });

    if (idemKey) {
      await rememberOrderId(slug, idemKey, bodyFp, order.created.id);
    }

    publishEvent(slug, {
      type: "new_order",
      order_id: order.created.id,
      table_number: tableRaw,
      status: "eingegangen",
    });

    return { order_id: order.created.id, daily_bon_number: order.dailyBonNumber };
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