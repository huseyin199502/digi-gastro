import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  dashboardRedirect,
  errorResponse,
  inferCategoryType,
  parsePrice,
  parseRelatedIds,
  requireChef,
  saveProductImage,
  wantsJson,
} from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/produkt-erstellen (main.py ~8845)
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    // ── Parse form-data or JSON body ──
    const contentType = request.headers.get("content-type") ?? "";
    let fields: Record<string, unknown> = {};
    let imageFile: File | null = null;
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      for (const [key, value] of form.entries()) {
        if (key === "image_file" && value instanceof File) imageFile = value;
        else fields[key] = value;
      }
    } else if (contentType.includes("application/json")) {
      fields = await request.json();
    } else {
      const form = await request.formData();
      for (const [key, value] of form.entries()) fields[key] = value;
    }

    const name = String(fields.name ?? "").trim();
    if (!name) throw new ApiError("Produktname erforderlich.", 400);
    const price = parsePrice(fields.preis ?? fields.price);

    // ── Category fallback (legacy: first existing or "Sonstiges") ──
    const dbCategories = await prisma.category.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });
    let catName = String(fields.kategorie ?? fields.category ?? "").trim();
    if (!catName) {
      catName = dbCategories[0]?.name ?? "Sonstiges";
    }
    if (!dbCategories.some((c) => c.name === catName)) {
      await prisma.category.create({
        data: { tenant_slug: slug, name: catName, position: dbCategories.length },
      });
    }

    // ── Category type: explicit value wins, else keyword inference ──
    const rawType = String(fields.category_type ?? "").trim();
    const categoryType = ["bar", "küche", "shisha"].includes(rawType)
      ? rawType
      : inferCategoryType(catName);

    // ── Create the product row first so the image gets the real id ──
    const created = await prisma.product.create({
      data: {
        tenant_slug: slug,
        name,
        price,
        description: String(fields.description ?? "").trim(),
        image: "",
        vegan: Boolean(fields.is_vegan),
        is_vegan: Boolean(fields.is_vegan),
        is_glutenfree: Boolean(fields.is_glutenfree),
        allergens: "[]",
        category_type: categoryType,
        category: catName,
        is_available: true,
        name_en: String(fields.name_en ?? "").trim(),
        description_en: String(fields.description_en ?? "").trim(),
        position: 0,
        related_product_ids: JSON.stringify(
          parseRelatedIds(fields.related_product_ids)
        ),
      },
    });

    // ── Image: file upload wins over URL (legacy semantics) ──
    let finalImage = "";
    try {
      if (imageFile && imageFile.name) {
        finalImage = await saveProductImage(slug, created.id, imageFile);
      } else if (String(fields.image_url ?? "").trim()) {
        finalImage = String(fields.image_url).trim();
      } else {
        finalImage =
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400";
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
      finalImage =
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400";
    }
    await prisma.product.update({
      where: { id: created.id },
      data: { image: finalImage },
    });

    const newProduct = {
      id: created.id,
      name,
      price,
      description: String(fields.description ?? "").trim(),
      image: finalImage,
      vegan: Boolean(fields.is_vegan),
      is_vegan: Boolean(fields.is_vegan),
      is_glutenfree: Boolean(fields.is_glutenfree),
      allergens: [],
      category_type: categoryType,
      category: catName,
      is_available: true,
      happy_hour_price: null,
      start_time: null,
      end_time: null,
      name_en: String(fields.name_en ?? "").trim(),
      description_en: String(fields.description_en ?? "").trim(),
      related_product_ids: parseRelatedIds(fields.related_product_ids),
    };

    if (wantsJson(request)) {
      return NextResponse.json({ success: true, product: newProduct });
    }
    return dashboardRedirect(request);
  } catch (err) {
    return errorResponse(err);
  }
}
