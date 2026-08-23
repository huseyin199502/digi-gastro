import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  deleteLocalImageIfUnused,
  errorResponse,
  inferCategoryType,
  parseAllergens,
  parseRelatedIds,
  requireChef,
  saveProductImage,
} from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy PUT /api/products/{product_id} (main.py ~11329)
// Accepts JSON or multipart/form-data, returns {"success": true}.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ product_id: string }> }
) {
  try {
    const { product_id } = await params;
    const productId = parseInt(product_id, 10);
    const session = await requireChef();
    const slug = session.slug;

    const dbProduct = await prisma.product.findFirst({
      where: { id: productId, tenant_slug: slug },
    });
    if (!dbProduct) throw new ApiError("Produkt nicht gefunden.", 404);

    // ── Parse body depending on content type ──
    const contentType = request.headers.get("content-type") ?? "";
    let fields: Record<string, unknown> = {};
    let imageFile: File | null = null;
    if (contentType.includes("application/json")) {
      try {
        fields = await request.json();
      } catch {
        throw new ApiError("Invalid JSON payload", 400);
      }
    } else {
      const form = await request.formData();
      for (const [key, value] of form.entries()) {
        if (key === "image_file" && value instanceof File) imageFile = value;
        else fields[key] = value;
      }
    }

    const name = String(fields.name ?? "").trim();
    const price = Number(fields.price ?? 0);
    if (!Number.isFinite(price) || price < 0 || price > 99999) {
      throw new ApiError(
        "Ungültiger Preis. Der Preis muss zwischen 0 und 99.999 € liegen.",
        400
      );
    }
    const description = String(fields.description ?? "").trim();
    const category = String(fields.category ?? "").trim();
    const nameEn = String(fields.name_en ?? "").trim();
    const descriptionEn = String(fields.description_en ?? "").trim();
    const isVegan = fields.is_vegan === true || fields.is_vegan === "true";
    const isGlutenfree =
      fields.is_glutenfree === true || fields.is_glutenfree === "true";

    // Happy hour price: only update when explicitly provided
    const hhRaw = fields.happy_hour_price;
    let happyHourPrice: number | null | undefined = undefined;
    if (hhRaw !== undefined && hhRaw !== null && hhRaw !== "" && hhRaw !== "None") {
      happyHourPrice = Number(hhRaw);
    }

    const categoryType = inferCategoryType(category);
    const relatedIds = parseRelatedIds(fields.related_product_ids);
    const allergens = parseAllergens(fields.allergens);

    // Product extras / variants — nur überschreiben, wenn das Feld
    // explizit geschickt wurde (sonst würden z.B. Formular-Uploads ohne
    // Extras-Feld die bestehenden Optionen löschen).
    const parseOptionList = (raw: unknown): string | null => {
      if (raw === undefined || raw === null) return null;
      const list = Array.isArray(raw) ? raw : [];
      const cleaned = list
        .map((e) => {
          const item = e as { name?: unknown; price?: unknown };
          const name = String(item.name ?? "").trim();
          const price = Number(item.price) || 0;
          return name ? { name, price } : null;
        })
        .filter((x): x is { name: string; price: number } => x !== null);
      return JSON.stringify(cleaned);
    };
    const extrasJson = parseOptionList(fields.extras) ?? dbProduct.extras ?? "[]";
    const variantsJson =
      parseOptionList(fields.variants) ?? dbProduct.variants ?? "[]";

    // ── Image handling: file upload wins over URL ──
    const oldImage = dbProduct.image ?? "";
    let finalImage = oldImage;
    if (imageFile && imageFile.name) {
      try {
        finalImage = await saveProductImage(slug, productId, imageFile);
      } catch (e) {
        if (e instanceof ApiError) throw e;
        finalImage =
          oldImage ||
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400";
      }
    } else if (fields.image_url !== undefined && fields.image_url !== null) {
      const urlStr = String(fields.image_url).trim();
      finalImage =
        urlStr ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400";
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price: Math.round(price * 100) / 100,
        description,
        category,
        name_en: nameEn,
        description_en: descriptionEn,
        vegan: isVegan,
        is_vegan: isVegan,
        is_glutenfree: isGlutenfree,
        category_type: categoryType,
        related_product_ids: JSON.stringify(relatedIds),
        allergens: JSON.stringify(allergens),
        extras: extrasJson,
        variants: variantsJson,
        image: finalImage,
        ...(happyHourPrice !== undefined ? { happy_hour_price: happyHourPrice } : {}),
      },
    });

    // Clean up the old image if it was replaced and is unused
    if (oldImage && oldImage !== finalImage) {
      await deleteLocalImageIfUnused(oldImage, slug);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
