import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Legacy POST /admin/landingpage/delete-image (main.py 10790)
// Form fields: image_url, image_type
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const form = await request.formData();
    const imageUrl = String(form.get("image_url") ?? "");
    const imageType = String(form.get("image_type") ?? "");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    let landingPage: Record<string, unknown> | null = null;
    if (tenant?.landing_page_json) {
      try {
        const parsed = JSON.parse(tenant.landing_page_json);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          landingPage = parsed;
        }
      } catch {
        landingPage = null;
      }
    }
    if (!landingPage) {
      // Legacy liefert hier ein normales 200-JSON zurück
      return NextResponse.json({
        success: false,
        error: "No landing page configuration",
      });
    }

    const asList = (key: string): string[] => {
      const v = landingPage![key];
      if (!Array.isArray(v)) return [];
      return v.filter((x) => typeof x === "string");
    };

    const deleteFile = (subdir: string) => {
      const filename = path.basename(imageUrl);
      const fullPath = path.join(process.cwd(), "public", "uploads", subdir, filename);
      try {
        if (fs.existsSync(fullPath)) fs.rmSync(fullPath, { force: true });
      } catch (e) {
        console.log(`[Cleanup] Failed to delete file ${fullPath}: ${e}`);
      }
    };

    const removeUrl = (key: string, subdir: string) => {
      const list = asList(key);
      const idx = list.indexOf(imageUrl);
      if (idx >= 0) {
        list.splice(idx, 1);
        landingPage![key] = list;
        deleteFile(subdir);
      }
    };

    if (imageType === "video") {
      removeUrl("videos", "videos");
    } else if (imageType === "offer_video") {
      removeUrl("offer_videos", "videos");
    } else if (imageType === "slideshow_video") {
      removeUrl("slideshow_videos", "videos");
    } else if (imageType === "gallery_video") {
      removeUrl("gallery_videos", "videos");
    } else if (imageType === "custom") {
      // Bild aus Custom-Sections entfernen
      const rawSections = landingPage.custom_sections;
      const customSections = Array.isArray(rawSections) ? rawSections : [];
      for (const sec of customSections) {
        if (sec && typeof sec === "object" && sec.image === imageUrl) {
          sec.image = "";
          deleteFile("landing");
          break;
        }
      }
      landingPage.custom_sections = customSections;
    } else {
      const key =
        imageType === "offer"
          ? "offer_images"
          : imageType === "gallery"
            ? "gallery_images"
            : "slideshow_images";
      const subdir =
        imageType === "offer"
          ? "landing"
          : imageType === "gallery"
            ? "gallery"
            : "slideshow";
      removeUrl(key, subdir);
    }

    try {
      await prisma.tenant.update({
        where: { slug },
        data: { landing_page_json: JSON.stringify(landingPage) },
      });
    } catch (e) {
      return NextResponse.json(
        { detail: `Fehler beim Speichern: ${e}` },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
