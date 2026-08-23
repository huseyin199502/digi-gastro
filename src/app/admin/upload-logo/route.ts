import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  errorResponse,
  MAX_LOGO_UPLOAD_BYTES,
  requireChef,
  uploadsDir,
} from "@/lib/adminApi";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Legacy POST /admin/upload-logo (main.py ~13573)
// Multipart-Form mit "file" — speichert als {slug}-logo.{ext}.
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.name) {
      throw new ApiError("Keine Datei hochgeladen.", 400);
    }
    if (file.size > MAX_LOGO_UPLOAD_BYTES) {
      throw new ApiError("Logo ist zu groß (max. 5 MB).", 400);
    }

    let ext = "png";
    const parts = file.name.split(".");
    if (parts.length > 1) ext = parts[parts.length - 1].toLowerCase();

    const filename = `${slug}-logo.${ext}`;
    const dir = uploadsDir("logos");
    fs.mkdirSync(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(dir, filename), buffer);

    const logoRelativePath = `/uploads/logos/${filename}`;
    await prisma.tenant.update({
      where: { slug },
      data: { logo_path: logoRelativePath, logo_url: logoRelativePath },
    });

    return NextResponse.json({ success: true, logo_url: logoRelativePath });
  } catch (err) {
    return errorResponse(err);
  }
}
