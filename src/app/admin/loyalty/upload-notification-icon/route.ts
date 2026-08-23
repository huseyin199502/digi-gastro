import { NextRequest, NextResponse } from "next/server";
import {
  ApiError,
  errorResponse,
  MAX_LOGO_UPLOAD_BYTES,
  requireChef,
  uploadsDir,
} from "@/lib/adminApi";
import { prisma } from "@/lib/prisma";
import { triggerPassUpdatePush } from "@/lib/loyalty";
import { nowIso } from "@/lib/walletPass";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const dynamic = "force-dynamic";

// Legacy POST /admin/loyalty/upload-notification-icon (main.py ~16102)
// Lädt ein PNG-Icon hoch, das als icon.png in Apple Wallet Push-Notifications
// angezeigt wird (kleines Viereck links in der Notification).
// Apple icon.png: empfohlen 158x158 px, nur PNG akzeptiert.
// Wird per sharp auf 158x158 skaliert und in public/uploads/notification-icons gespeichert.
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug.toLowerCase().trim();

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.name) {
      throw new ApiError("Keine Datei hochgeladen.", 400);
    }
    if (file.size > MAX_LOGO_UPLOAD_BYTES) {
      throw new ApiError("Icon ist zu groß (max. 5 MB).", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Auf 158x158 skalieren (Apple empfiehlt diese Größe), als PNG speichern
    let pngBuffer: Buffer;
    try {
      pngBuffer = await sharp(buffer)
        .rotate()
        .resize(158, 158, { fit: "cover", position: "centre" })
        .png()
        .toBuffer();
    } catch {
      throw new ApiError("Ungültiges Bild-Format.", 400);
    }

    const dir = uploadsDir("notification-icons");
    fs.mkdirSync(dir, { recursive: true });
    const filename = `${slug}-notification-icon.png`;
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, pngBuffer);

    // WebP-Version fürs Web (Apple nutzt weiterhin das PNG im .pkpass)
    try {
      await sharp(pngBuffer).webp({ quality: 85 }).toFile(filePath.replace(/\.png$/, ".webp"));
    } catch {
      // best-effort
    }

    const iconUrl = `/uploads/notification-icons/${filename}`;
    await prisma.tenant.update({
      where: { slug },
      data: { notification_icon_path: iconUrl },
    });

    // Alle Kunden-Pässe aktualisieren (pass_needs_update + Push)
    const customers = await prisma.loyaltyCustomer.findMany({
      where: { tenant_slug: slug },
      select: {
        id: true,
        pass_serial: true,
        pass_type: true,
        tenant_slug: true,
        last_message: true,
        msg_nonce: true,
      },
    });
    for (const customer of customers) {
      await prisma.loyaltyCustomer.update({
        where: { id: customer.id },
        data: {
          pass_needs_update: true,
          pass_updated_at: nowIso(),
          updated_at: nowIso(),
        },
      });
      try {
        await triggerPassUpdatePush(customer, "Icon aktualisiert", "Icon aktualisiert");
      } catch {
        // best-effort pro Kunde
      }
    }

    return NextResponse.json({ success: true, icon_url: iconUrl });
  } catch (err) {
    return errorResponse(err);
  }
}