import { prisma } from "./prisma";
import {
  berlinTimeStr,
  getBerlinNow,
  possibleDaysToday,
} from "./time";

// ──────────────────────────────────────────────────────────────────
// Pricing & event logic — ported from legacy main.py
// (products-lite endpoint ~line 9767 and is_event_active_now ~3100)
// ──────────────────────────────────────────────────────────────────

export function isEventActiveNow(
  evStart: string,
  evEnd: string,
  nowTime: string
): boolean {
  const s = evStart.padStart(5, "0");
  const e = evEnd.padStart(5, "0");
  const n = nowTime.padStart(5, "0");
  if (s <= e) return s <= n && n <= e;
  // Midnight crossover, e.g. 16:00-01:10
  return n >= s || n <= e;
}

/**
 * Produkt-level Happy Hour: Preis gesetzt UND (optional) Zeitfenster/Wochentage
 * aktiv. Wird in Menü-Anzeige und Server-Preisberechnung identisch genutzt.
 */
export function isProductHappyHourActive(
  p: {
    happy_hour_price: number | null;
    start_time?: string | null;
    end_time?: string | null;
    happy_hour_days?: string | null;
  },
  nowTime: string,
  possibleDays: string[]
): boolean {
  if (
    p.happy_hour_price === null ||
    p.happy_hour_price === undefined ||
    !Number.isFinite(p.happy_hour_price) ||
    p.happy_hour_price <= 0
  ) {
    return false;
  }
  if (p.start_time && p.end_time) {
    if (!isEventActiveNow(p.start_time, p.end_time, nowTime)) return false;
  }
  const days = safeJsonArray(p.happy_hour_days);
  if (days.length > 0 && !days.some((d) => possibleDays.includes(d))) return false;
  return true;
}

/** MwSt rate: bar = 19%, everything else (küche) = 7% */
export function mwstRateFor(categoryType: string | null): number {
  return (categoryType ?? "küche").toLowerCase() === "bar" ? 0.19 : 0.07;
}

/**
 * DB stores NET prices. price_mode='brutto' → display = net × (1+MwSt);
 * price_mode='netto' → display = net unchanged. (Identical to legacy.)
 */
export function displayPrice(
  netPrice: number,
  categoryType: string | null,
  priceMode: string
): number {
  if (priceMode === "brutto") {
    return Math.round(netPrice * (1 + mwstRateFor(categoryType)) * 100) / 100;
  }
  return netPrice;
}

export function formatEur(value: number): string {
  return value.toFixed(2).replace(".", ",") + " €";
}

export interface ActiveEventInfo {
  id: number;
  displayName: string;
  mode: string;
  discount: number;
  bannerColor: string | null;
  description: string | null;
  /** "20:00" — für "bis 20:00 Uhr" im Event-Ticker */
  endTime?: string | null;
}

export interface CategoryExtras {
  name: string;
  price: number;
}

export interface ComboItem {
  product_id: number | null;
  category_name: string | null;
  excluded_product_ids?: number[];
}

export interface ComboInfo {
  id: number;
  name: string;
  combo_price: number;
  days: string[];
  start_time: string | null;
  end_time: string | null;
  items: ComboItem[];
}

export interface TodayComboEvent {
  displayName: string;
  start_time: string | null;
  end_time: string | null;
  combos: ComboInfo[];
}

export interface LandingPageSection {
  title?: string;
  content?: string;
  image?: string;
}

export interface LandingPageData {
  welcome_title?: string;
  welcome_subtitle?: string;
  what_we_offer?: string;
  google_rating_url?: string;
  aktuelles?: string;
  oeffnungszeiten?: string;
  angebote?: string;
  title_about?: string;
  title_offers?: string;
  title_news?: string;
  title_hours?: string;
  title_happyhour?: string;
  title_gallery?: string;
  title_videos?: string;
  slideshow_enabled?: boolean;
  offer_images?: string[];
  offer_videos?: string[];
  slideshow_images?: string[];
  slideshow_videos?: string[];
  gallery_images?: string[];
  gallery_videos?: string[];
  videos?: string[];
  custom_sections?: LandingPageSection[];
  [key: string]: unknown;
}

export interface MenuProduct {
  id: number;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  image: string | null;
  category: string;
  category_type: string | null;
  vegan: boolean;
  is_vegan: boolean;
  is_glutenfree: boolean;
  allergens: string[];
  is_available: boolean;
  price: number; // base price as stored (net)
  display_price: number; // guest-visible price after price_mode
  happy_hour_active: boolean;
  happy_hour_display_price: number | null;
  /** Netto-Preis, nur wenn produkt-level Happy Hour aktiv ist (sonst null). */
  happy_hour_price: number | null;
  position: number;
  extras: { name: string; price: number }[];
  variants: { name: string; price: number }[];
}

export interface MenuData {
  tenant: {
    slug: string;
    name: string;
    logo_url: string | null;
    logo_path: string | null;
    logo_url_2: string | null;
    theme: string | null;
    address: string | null;
    plz: string | null;
    ort: string | null;
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    indigo: string | null;
    orders_enabled: boolean;
    loyalty_enabled: boolean;
    has_loyalty_card: boolean;
    operating_mode: string;
    accepts_card_payment: boolean;
    price_mode: string;
    is_shishabar: boolean;
    active: boolean;
    impressum_content: string | null;
    datenschutz_content: string | null;
    landing_page: LandingPageData;
  };
  categories: {
    id: number;
    name: string;
    position: number;
    extras: CategoryExtras[];
    super_group_id: number | null;
  }[];
  parentCategories: { name: string; count: number; image: string | null }[];
  products: MenuProduct[];
  activeEvents: ActiveEventInfo[];
  todayComboEvents: TodayComboEvent[];
  ads: {
    id: number;
    company_name: string;
    title: string;
    subtitle: string | null;
    image_url: string | null;
    target_url: string | null;
    placement: string;
  }[];
}

export class TenantNotFoundError extends Error {}
export class TenantSuspendedError extends Error {}

/** Loads the full public menu for a tenant (guest-facing). */
export async function getTenantMenu(rawSlug: string): Promise<MenuData> {
  const slug = rawSlug.toLowerCase().trim();
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) throw new TenantNotFoundError(slug);
  if (tenant.active === false) throw new TenantSuspendedError(slug);

  const berlinNow = getBerlinNow();

  const [dbCategories, dbProducts, dbEvents, dbAds, dbLoyaltyCard] =
    await Promise.all([
    prisma.category.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    }),
    prisma.product.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    }),
    prisma.event.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      include: {
        products: true,
        combos: { include: { items: true }, orderBy: { position: "asc" } },
      },
    }),
    prisma.adBanner.findMany({
      where: {
        tenant_slug: slug,
        status: "active",
        OR: [
          { start_at: null, end_at: null },
          { start_at: null, end_at: { gte: berlinNow } },
          { start_at: { lte: berlinNow }, end_at: null },
          { start_at: { lte: berlinNow }, end_at: { gte: berlinNow } },
        ],
      },
      orderBy: [{ priority: "desc" }, { created_at: "desc" }],
      select: {
        id: true,
        company_name: true,
        title: true,
        subtitle: true,
        image_url: true,
        target_url: true,
        placement: true,
      },
    }),
    prisma.loyaltyCard.count({ where: { tenant_slug: slug } }),
  ]);

  const priceMode = tenant.price_mode || "brutto";
  const activeCategoryNames = new Set(dbCategories.map((c) => c.name));

  // Determine currently active events (Berlin time, identical to legacy)
  const nowTime = berlinTimeStr(berlinNow);
  const possibleDays = possibleDaysToday(berlinNow);

  const activeEvents: ActiveEventInfo[] = [];
  const activeEventProducts = new Map<number, number>(); // product_id → event price (net)
  let activeDiscountEvent: { discount: number; displayName: string } | null =
    null;
  const todayComboEvents: TodayComboEvent[] = [];

  for (const ev of dbEvents) {
    if (ev.is_active === false) continue;
    const days: string[] = safeJsonArray(ev.days);
    const isToday = days.some((d) => possibleDays.includes(d));
    const activeNow =
      isToday &&
      isEventActiveNow(ev.start_time ?? "18:00", ev.end_time ?? "20:00", nowTime);
    if (!activeNow) continue;

    activeEvents.push({
      id: ev.id,
      displayName: ev.display_name,
      mode: ev.mode ?? "selected",
      discount: ev.discount ?? 0,
      bannerColor: ev.banner_color ?? null,
      description: ev.description ?? null,
      endTime: ev.end_time ?? null,
    });

    if (ev.combos.length > 0) {
      todayComboEvents.push({
        displayName: ev.display_name,
        start_time: ev.start_time ?? null,
        end_time: ev.end_time ?? null,
        combos: ev.combos.map((c) => ({
          id: c.id,
          name: c.name,
          combo_price: c.combo_price,
          days: safeJsonArray(c.days),
          start_time: c.start_time ?? null,
          end_time: c.end_time ?? null,
          items: c.items.map((ci) => ({
            product_id: ci.product_id,
            category_name: ci.category_name ?? null,
            excluded_product_ids: (() => { try { const d = JSON.parse(ci.excluded_product_ids ?? "[]"); return Array.isArray(d) ? d.map(Number) : []; } catch { return []; } })(),
          })),
        })),
      });
    }

    if ((ev.mode ?? "selected") === "discount" && (ev.discount ?? 0) > 0) {
      // Höchsten aktiven Rabatt behalten — identisch zur Bestell-Preislogik
      if (!activeDiscountEvent || (ev.discount ?? 0) > activeDiscountEvent.discount) {
        activeDiscountEvent = {
          discount: ev.discount ?? 0,
          displayName: ev.display_name,
        };
      }
    }
    for (const ep of ev.products) {
      if (ep.event_price !== null) {
        activeEventProducts.set(ep.product_id, ep.event_price);
      }
    }
  }

  const products: MenuProduct[] = [];
  for (const p of dbProducts) {
    // Products whose category no longer exists are hidden (legacy behaviour)
    if (!activeCategoryNames.has(p.category)) continue;

    const allergens = safeJsonArray(p.allergens);
    const base = displayPrice(p.price, p.category_type, priceMode);

    let hhActive = false;
    let hhPrice: number | null = null;
    let hhPriceNet: number | null = null;

    const eventPriceNet = activeEventProducts.get(p.id);
    if (eventPriceNet !== undefined) {
      hhActive = true;
      hhPrice = displayPrice(eventPriceNet, p.category_type, priceMode);
    } else if (activeDiscountEvent) {
      hhActive = true;
      hhPrice =
        Math.round(base * (1 - activeDiscountEvent.discount / 100) * 100) /
        100;
    } else if (
      p.happy_hour_price != null &&
      p.happy_hour_price > 0 &&
      isProductHappyHourActive(p, nowTime, possibleDays)
    ) {
      // Produkt-level Happy Hour: aktives Flag + angezeigter Preis
      hhActive = true;
      hhPrice = displayPrice(p.happy_hour_price, p.category_type, priceMode);
      hhPriceNet = p.happy_hour_price;
    }

    products.push({
      id: p.id,
      name: p.name,
      name_en: p.name_en,
      description: p.description,
      description_en: p.description_en,
      image: p.image,
      category: p.category,
      category_type: p.category_type,
      vegan: p.vegan === true || p.is_vegan === true,
      is_vegan: p.is_vegan === true || p.vegan === true,
      is_glutenfree: p.is_glutenfree === true,
      allergens,
      is_available: p.is_available !== false,
      price: p.price,
      display_price: base,
      happy_hour_active: hhActive,
      happy_hour_display_price: hhPrice,
      happy_hour_price: hhPriceNet,
      position: p.position ?? 0,
      extras: safeJsonExtras(p.extras),
      variants: safeJsonExtras(p.variants),
    });
  }

  // ── Parent categories (strip " > Child") with product counts + first image ──
  const parentOrder: string[] = [];
  for (const c of dbCategories) {
    const parent = c.name.split(" > ")[0];
    if (!parentOrder.includes(parent)) parentOrder.push(parent);
  }
  const parentCategories = parentOrder.map((name) => {
    const members = products.filter(
      (p) => p.category === name || p.category.startsWith(`${name} > `)
    );
    return {
      name,
      count: members.length,
      image: members.find((p) => p.image)?.image ?? null,
    };
  });

  return {
    tenant: {
      slug: tenant.slug,
      name: tenant.name,
      logo_url: tenant.logo_url,
      logo_path: tenant.logo_path,
      logo_url_2: tenant.logo_url_2 || null,
      theme: tenant.theme,
      address: tenant.address,
      plz: tenant.plz,
      ort: tenant.ort,
      instagram: tenant.instagram,
      facebook: tenant.facebook,
      tiktok: tenant.tiktok,
      indigo: tenant.indigo,
      orders_enabled: tenant.orders_enabled !== false,
      loyalty_enabled: tenant.loyalty_enabled !== false,
      has_loyalty_card: dbLoyaltyCard > 0,
      operating_mode: tenant.operating_mode ?? "full",
      accepts_card_payment: tenant.accepts_card_payment !== false,
      price_mode: priceMode,
      is_shishabar: tenant.is_shishabar === true,
      active: true, // null or true — false already rejected above
      impressum_content: tenant.impressum_content ?? null,
      datenschutz_content: tenant.datenschutz_content ?? null,
      landing_page: parseLandingPage(tenant.landing_page_json),
    },
    categories: dbCategories.map((c) => ({
      id: c.id,
      name: c.name,
      position: c.position ?? 0,
      extras: safeJsonExtras(c.extras),
      super_group_id: c.super_group_id ?? null,
    })),
    parentCategories,
    products,
    activeEvents,
    todayComboEvents,
    ads: dbAds,
  };
}

export function safeJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function safeJsonExtras(
  raw: string | null | undefined
): CategoryExtras[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((e) => {
        if (!e || typeof e !== "object") return null;
        const obj = e as Record<string, unknown>;
        return {
          name: String(obj.name ?? ""),
          price: Number(obj.price ?? 0),
        };
      })
      .filter((e): e is CategoryExtras => e !== null && e.name.length > 0);
  } catch {
    return [];
  }
}

export function parseLandingPage(raw: string | null | undefined): LandingPageData {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
