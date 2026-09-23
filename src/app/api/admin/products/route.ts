import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPlatformSession, getTenantSession } from '@/lib/auth';
import { ApiError, errorResponse, parsePrice, parseRelatedIds } from '@/lib/adminApi';

export const dynamic = 'force-dynamic';

async function assertProductAccess(tenantSlug: string): Promise<void> {
  if (await getPlatformSession()) return;
  const session = await getTenantSession();
  if (session && session.slug === tenantSlug && session.role === 'chef') return;
  throw new ApiError('Nicht autorisiert.', 403);
}

function str(v: unknown, fallback = ''): string {
  return v === undefined || v === null ? fallback : String(v);
}

function jsonList(v: unknown, fallback: string): string {
  if (v === undefined || v === null) return fallback;
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v);
  } catch {
    return fallback;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSlug = searchParams.get('tenantSlug');
    if (!rawSlug) {
      return NextResponse.json({ error: 'tenantSlug required' }, { status: 400 });
    }
    const tenantSlug = rawSlug.toLowerCase().trim();
    await assertProductAccess(tenantSlug);

    const products = await prisma.product.findMany({
      where: { tenant_slug: tenantSlug },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json(products);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getTenantSession();
    if (!session || session.role !== 'chef') {
      throw new ApiError('Nicht autorisiert.', 403);
    }
    const tenantSlug = session.slug;
    await assertProductAccess(tenantSlug);

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== 'object') {
      throw new ApiError('Ungültiges JSON-Format', 400);
    }

    const name = str(body.name).trim();
    if (!name) throw new ApiError('Produktname erforderlich.', 400);
    const category = str(body.category).trim();
    if (!category) throw new ApiError('Kategorie erforderlich.', 400);
    const price = parsePrice(body.price);

    // Whitelist — kein Mass-Assignment auf das Prisma-Model
    const data = {
      tenant_slug: tenantSlug,
      name,
      price,
      category,
      description: str(body.description),
      image: str(body.image) || null,
      name_en: str(body.name_en) || null,
      description_en: str(body.description_en) || null,
      category_type: str(body.category_type) || null,
      vegan: body.vegan === true || body.vegan === 'true',
      is_vegan: body.is_vegan === true || body.is_vegan === 'true',
      is_glutenfree: body.is_glutenfree === true || body.is_glutenfree === 'true',
      is_available: body.is_available === undefined ? true : body.is_available === true || body.is_available === 'true',
      position: Number.isFinite(Number(body.position)) ? Math.trunc(Number(body.position)) : 0,
      allergens: jsonList(body.allergens, '[]'),
      extras: jsonList(body.extras, '[]'),
      variants: jsonList(body.variants, '[]'),
      related_product_ids: jsonList(parseRelatedIds(body.related_product_ids), '[]'),
      happy_hour_price:
        body.happy_hour_price === undefined || body.happy_hour_price === null || body.happy_hour_price === ''
          ? null
          : Number(body.happy_hour_price),
      start_time: str(body.start_time) || null,
      end_time: str(body.end_time) || null,
      happy_hour_days: str(body.happy_hour_days) || null,
    };
    if (data.happy_hour_price !== null && !Number.isFinite(data.happy_hour_price)) {
      data.happy_hour_price = null;
    }

    const product = await prisma.product.create({ data });
    return NextResponse.json(product);
  } catch (err) {
    return errorResponse(err);
  }
}
