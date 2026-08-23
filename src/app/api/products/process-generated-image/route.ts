import { NextRequest, NextResponse } from "next/server";
import { ApiError, errorResponse, requireChef, uploadsDir } from "@/lib/adminApi";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// Legacy POST /api/products/process-generated-image (main.py ~12293)
// Empfängt ein vom Browser hochgeladenes KI-generiertes Bild (Puter.js txt2img),
// speichert es als public/uploads/products/ai-*.png und erzeugt eine WebP-Version.
// Die Legacy-Variante lief zudem durch rembg (Hintergrund-Entfernung) + Auto-Trim;
// hier wird das Bild best-effort auf Alpha transparent komprimiert (sharp), damit
// die Verarbeitung ohne rembg-Binary/Modell auskommt.
const MAX_AI_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    await requireChef();

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.name) {
      throw new ApiError("Keine Datei hochgeladen.", 400);
    }
    if (file.size > MAX_AI_UPLOAD_BYTES) {
      throw new ApiError("Bild ist zu groß (max. 10 MB).", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Auf 1024px maximieren + transparenten Hintergrund entfernen (white → alpha),
    // damit das Bild auf dunklen Karten gut aussieht. Best-effort.
    let processed: Buffer = buffer;
    try {
      processed = await sharp(buffer)
        .rotate()
        .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .png()
        .toBuffer();
    } catch {
      processed = buffer;
    }

    const dir = uploadsDir("products");
    fs.mkdirSync(dir, { recursive: true });
    const safeName = `ai-${randomUUID().slice(0, 8)}.png`;
    const filePath = path.join(dir, safeName);
    fs.writeFileSync(filePath, processed);

    // WebP-Version erzeugen (automatische Auslieferung via <picture>-Komponente).
    try {
      await sharp(processed).webp({ quality: 82 }).toFile(filePath.replace(/\.png$/, ".webp"));
    } catch {
      // best-effort; PNG bleibt gültig
    }

    return NextResponse.json({ success: true, image_url: `/uploads/products/${safeName}` });
  } catch (err) {
    return errorResponse(err);
  }
}