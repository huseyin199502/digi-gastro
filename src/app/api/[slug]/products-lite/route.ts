import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isEventActiveNow } from "@/lib/menu";
import {
  berlinTimeStr,
  getBerlinNow,
  possibleDaysToday,
} from "@/lib/time";

// Port of legacy GET /api/{slug}/products-lite (main.py ~9767).
// Response shape kept identical so existing tablet/kiosk clients work.

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase().trim();

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) {
    return NextResponse.json(
      { detail: "Dieses Restaurant existiert nicht." },
      { status: 404 }
    );
  }
  if (tenant.active === false) {
    return NextResponse.json(
      { detail: "Restaurant vorübergehend nicht verfügbar." },
      { status: 403 }
    );
  }

  const [dbCategories, dbProducts, dbEvents] = await Promise.all([
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
      include: { products: true },
    }),
  ]);

  const activeCategories = dbCategories.map((c) => c.name);

  const products = dbProducts.map((p) => ({
    id: p.id,
    price: p.price,
    category_type: p.category_type,
    category: p.category,
    is_available: p.is_available ?? true,
    happy_hour_price: p.happy_hour_price,
  }));

  const berlinNow = getBerlinNow();
  const nowTime = berlinTimeStr(berlinNow);
  const possibleDays = possibleDaysToday(berlinNow);

  const events = dbEvents.map((ev) => {
    let days: string[] = [];
    try {
      days = JSON.parse(ev.days || "[]");
    } catch {
      days = [];
    }
    const isToday = days.some((d: string) => possibleDays.includes(d));
    const isCurrentlyActive =
      ev.is_active !== false &&
      isToday &&
      isEventActiveNow(
        ev.start_time ?? "18:00",
        ev.end_time ?? "20:00",
        nowTime
      );
    return {
      id: ev.id,
      name: ev.name,
      display_name: ev.display_name,
      days,
      start_time: ev.start_time ?? "18:00",
      end_time: ev.end_time ?? "20:00",
      mode: ev.mode ?? "selected",
      discount: ev.discount ?? 0,
      is_active: ev.is_active ?? true,
      products: ev.products.map((ep) => ({
        product_id: ep.product_id,
        event_price: ep.event_price,
      })),
      _is_currently_active: isCurrentlyActive,
    };
  });

  const priceMode = tenant.price_mode || "brutto";

  const productsLite: Record<string, unknown>[] = [];
  for (const p of products) {
    if (!activeCategories.includes(p.category)) continue;

    let isHhActive = false;
    let displayPrice = p.price;

    const catType = (p.category_type ?? "küche").toLowerCase();
    const mwstRate = catType === "bar" ? 0.19 : 0.07;
    if (priceMode === "brutto") {
      displayPrice = Math.round(displayPrice * (1 + mwstRate) * 100) / 100;
    }

    for (const ev of events) {
      if (!ev.is_active || !ev._is_currently_active) continue;
      const matched = ev.products.find((ep) => ep.product_id === p.id);
      if (matched && matched.event_price !== null) {
        isHhActive = true;
        let eventPrice = matched.event_price;
        if (priceMode === "brutto") {
          eventPrice = Math.round(eventPrice * (1 + mwstRate) * 100) / 100;
        }
        displayPrice = eventPrice;
        break;
      }
      if (ev.mode === "discount" && ev.discount > 0) {
        isHhActive = true;
        displayPrice =
          Math.round(displayPrice * (1 - ev.discount / 100) * 100) / 100;
        break;
      }
    }

    productsLite.push({
      id: p.id,
      price: displayPrice,
      is_available: p.is_available,
      is_hh_active: isHhActive,
    });
  }

  return NextResponse.json({
    products: productsLite,
    events,
    price_mode: priceMode,
  });
}
