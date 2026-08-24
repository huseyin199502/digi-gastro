import { prisma } from "./prisma";

// ──────────────────────────────────────────────────────────────────
// Events-CRUD-Helper (legacy main.py ~11023–11281).
// EventProduct/EventCombo/EventComboItem werden direkt in der DB
// verwaltet (Legacy: "avoid LiveListProxy double-save bug").
// ──────────────────────────────────────────────────────────────────

interface EventProductPayload {
  product_id?: unknown;
  event_price?: unknown;
}

interface EventComboPayload {
  name?: unknown;
  combo_price?: unknown;
  items?: { product_id?: unknown; category_name?: unknown; excluded_product_ids?: unknown }[];
  days?: unknown;
  start_time?: unknown;
  end_time?: unknown;
}

/** Ersetzt die Event-Produkt-Liste (nur gültige Einträge). */
export async function applyEventProducts(
  eventId: number,
  products: EventProductPayload[]
): Promise<void> {
  await prisma.eventProduct.deleteMany({ where: { event_id: eventId } });
  for (const ep of products) {
    if (ep.product_id && ep.event_price) {
      await prisma.eventProduct.create({
        data: {
          event_id: eventId,
          product_id: parseInt(String(ep.product_id), 10),
          event_price: Math.round(parseFloat(String(ep.event_price)) * 100) / 100,
        },
      });
    }
  }
}

/** Ersetzt die Event-Combos inkl. Combo-Items (Kaskade). */
export async function applyEventCombos(
  eventId: number,
  combos: EventComboPayload[]
): Promise<void> {
  const existingCombos = await prisma.eventCombo.findMany({
    where: { event_id: eventId },
    select: { id: true },
  });
  for (const ec of existingCombos) {
    await prisma.eventComboItem.deleteMany({ where: { combo_id: ec.id } });
  }
  await prisma.eventCombo.deleteMany({ where: { event_id: eventId } });

  for (let idx = 0; idx < combos.length; idx++) {
    const combo = combos[idx];
    if (!(combo.name && combo.combo_price && combo.items)) continue;
    const comboDays = combo.days ?? null;
    const comboStart = combo.start_time ? String(combo.start_time) : null;
    const comboEnd = combo.end_time ? String(combo.end_time) : null;
    const created = await prisma.eventCombo.create({
      data: {
        event_id: eventId,
        name: String(combo.name).trim(),
        combo_price: Math.round(parseFloat(String(combo.combo_price)) * 100) / 100,
        position: idx,
        days: comboDays ? JSON.stringify(comboDays) : null,
        start_time: comboStart,
        end_time: comboEnd,
      },
    });
    for (const ci of combo.items) {
      const productId = ci.product_id;
      const categoryName = ci.category_name;
      const excludedIds = Array.isArray(ci.excluded_product_ids)
        ? (ci.excluded_product_ids as unknown[]).map((n) => Number(n)).filter((n) => Number.isFinite(n))
        : [];
      if (productId) {
        await prisma.eventComboItem.create({
          data: {
            combo_id: created.id,
            product_id: parseInt(String(productId), 10),
            category_name: categoryName ? String(categoryName) : null,
            excluded_product_ids: JSON.stringify(excludedIds),
          },
        });
      } else if (categoryName) {
        await prisma.eventComboItem.create({
          data: {
            combo_id: created.id,
            product_id: null,
            category_name: String(categoryName),
            excluded_product_ids: JSON.stringify(excludedIds),
          },
        });
      }
    }
  }
}
