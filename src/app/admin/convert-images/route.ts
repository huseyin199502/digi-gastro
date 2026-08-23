import { NextResponse } from "next/server";
import { requireChef, uploadsDir } from "@/lib/adminApi";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const dynamic = "force-dynamic";

// Legacy POST /admin/convert-images (main.py ~11964)
// Batch-Konvertierung aller Upload-Bilder (jpg/jpeg/png) zu WebP.
// Überspringt, wenn die WebP-Version bereits neuer ist als das Original.
const IMAGE_EXTS = [".jpg", ".jpeg", ".png"];

export async function POST() {
  await requireChef();

  let converted = 0;
  let skipped = 0;
  let errors = 0;
  let savedBytes = 0;

  const root = uploadsDir();
  if (fs.existsSync(root)) {
    const walk = async (dir: string): Promise<void> => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(full);
        } else {
          const ext = path.extname(entry.name).toLowerCase();
          if (!IMAGE_EXTS.includes(ext)) continue;
          const webpPath = full.slice(0, -ext.length) + ".webp";
          try {
            if (fs.existsSync(webpPath) && fs.statSync(webpPath).mtimeMs > fs.statSync(full).mtimeMs) {
              skipped += 1;
              continue;
            }
            const origSize = fs.statSync(full).size;
            const outPath = full.slice(0, -ext.length) + ".webp";
            await sharp(full)
              .rotate()
              .resize({ width: 1200, withoutEnlargement: true })
              .webp({ quality: 85 })
              .toFile(outPath);
            const webpSize = fs.existsSync(outPath) ? fs.statSync(outPath).size : 0;
            savedBytes += Math.max(0, origSize - webpSize);
            converted += 1;
          } catch {
            errors += 1;
          }
        }
      }
    };
    await walk(root);
  }

  return NextResponse.json({
    success: true,
    converted,
    skipped,
    errors,
    saved_mb: Math.round(savedBytes / 1024 / 1024),
    message: `${converted} Bilder konvertiert, ${skipped} übersprungen, ${savedBytes / 1024} KB gespart`,
  });
}