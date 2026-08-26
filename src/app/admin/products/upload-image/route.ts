import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  errorResponse,
  MAX_IMAGE_UPLOAD_BYTES,
  requireChef,
  saveProductImage,
  uploadsDir,
} from "@/lib/adminApi";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// POST /admin/products/upload-image
// Multipart: image_file + optional product_id.
// Speichert ein manuell hochgeladenes Produktbild und liefert die URL.
// Ohne product_id (Neuanlage) wird eine timestamp-basierte Datei angelegt.
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const form = await request.formData();
    const file = form.get("image_file");
    if (!(file instanceof File) || !file.name) {
      throw new ApiError("Keine Datei hochgeladen.", 400);
    }
    if (!ALLOWED.includes(file.type)) {
      throw new ApiError("Ungültiges Bildformat (PNG/JPG/WebP/GIF).", 400);
    }
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      throw new ApiError("Bild ist zu groß (max. 10 MB).", 400);
    }

    const productIdRaw = String(form.get("product_id") ?? "").trim();
    let imageUrl: string;

    if (/^\d+$/.test(productIdRaw)) {
      // Bestehendes Produkt → Dateiname mit echter Produkt-ID
      const productId = parseInt(productIdRaw, 10);
      const owned = await prisma.product.findFirst({
        where: { id: productId, tenant_slug: slug },
        select: { id: true },
      });
      if (!owned) throw new ApiError("Produkt nicht gefunden.", 404);
      imageUrl = await saveProductImage(slug, productId, file);
    } else {
      // Neuanlage → timestamp-basierter Dateiname
      let ext = "png";
      const lower = file.name.toLowerCase();
      const idx = lower.lastIndexOf(".");
      if (idx >= 0) ext = lower.slice(idx + 1);
      const safeName = `${slug}-product-${Date.now()}.${ext}`;
      const dir = uploadsDir("products");
      fs.mkdirSync(dir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(path.join(dir, safeName), buffer);
      imageUrl = `/uploads/products/${safeName}`;
    }

    return NextResponse.json({ success: true, image_url: imageUrl });
  } catch (err) {
    return errorResponse(err);
  }
}