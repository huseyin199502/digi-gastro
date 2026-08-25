import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  errorResponse,
  MAX_IMAGE_UPLOAD_BYTES,
  parseFormBool,
  requireChef,
  uploadsDir,
} from "@/lib/adminApi";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

export const dynamic = "force-dynamic";

// GET /admin/landingpage — liefert die aktuelle Landing-Page-Konfiguration
// als JSON an den Admin-Editor (Neubau; Legacy hatte das inline im Template).
export async function GET() {
  try {
    const session = await requireChef();
    const slug = session.slug;
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new ApiError("Dieses Restaurant existiert nicht.", 404);
    let landingPage: Record<string, unknown> = {};
    if (tenant.landing_page_json) {
      try {
        const parsed = JSON.parse(tenant.landing_page_json);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          landingPage = parsed;
        }
      } catch {
        landingPage = {};
      }
    }
    return NextResponse.json(landingPage);
  } catch (err) {
    return errorResponse(err);
  }
}

const MAX_VIDEO_UPLOAD_BYTES = 50 * 1024 * 1024;
const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp"];
const VIDEO_EXTS = [".mp4", ".webm", ".mov", ".avi", ".mkv"];

function fileExt(name: string): string {
  const lower = name.toLowerCase();
  const idx = lower.lastIndexOf(".");
  return idx >= 0 ? lower.slice(idx) : "";
}
const isValidImage = (name: string) => IMAGE_EXTS.includes(fileExt(name));
const isValidVideo = (name: string) => VIDEO_EXTS.includes(fileExt(name));

// Legacy POST /admin/landingpage (main.py 10435)
// Multipart-Form: Textfelder + gemischte Bild/Video-Uploads pro Liste.
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new ApiError("Dieses Restaurant existiert nicht.", 404);
    if (!tenant.is_setup_completed) {
      return NextResponse.redirect(new URL("/admin/setup", request.url), 303);
    }

    // Bestehende Landing-Page-Daten laden
    let landingPage: Record<string, unknown> = {};
    if (tenant.landing_page_json) {
      try {
        const parsed = JSON.parse(tenant.landing_page_json);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          landingPage = parsed;
        }
      } catch {
        landingPage = {};
      }
    }
    const asList = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];

    const existingOffers = asList(landingPage.offer_images);
    const existingOfferVideos = asList(landingPage.offer_videos);
    const existingSlideshow = asList(landingPage.slideshow_images);
    const existingSlideshowVideos = asList(landingPage.slideshow_videos);
    const existingGallery = asList(landingPage.gallery_images);
    const existingGalleryVideos = asList(landingPage.gallery_videos);
    const existingVideos = asList(landingPage.videos);

    const form = await request.formData();
    const ts = Math.floor(Date.now() / 1000);

    const readBytes = async (file: File, maxBytes: number): Promise<Buffer> => {
      if (file.size > maxBytes) {
        throw new ApiError("Datei ist zu groß.", 400);
      }
      return Buffer.from(await file.arrayBuffer());
    };

    // Video speichern inkl. ffprobe-Dauerprüfung (>41s → verwerfen)
    const saveVideoFile = async (
      file: File,
      slugPrefix: string,
      idx: number
    ): Promise<string | null> => {
      const ext = fileExt(file.name);
      const vdir = uploadsDir("videos");
      fs.mkdirSync(vdir, { recursive: true });
      const safeName = `${slug}_${slugPrefix}_${ts}_${idx}${ext}`;
      const filePath = path.join(vdir, safeName);
      const content = await readBytes(file, MAX_VIDEO_UPLOAD_BYTES);
      fs.writeFileSync(filePath, content);
      // Dauer per ffprobe prüfen, falls verfügbar
      try {
        const stdout = execFileSync(
          "ffprobe",
          ["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", filePath],
          { timeout: 10000, encoding: "utf-8" }
        );
        const probeData = JSON.parse(stdout);
        const duration = parseFloat(probeData?.format?.duration ?? "0");
        if (duration > 41) {
          fs.rmSync(filePath, { force: true });
          return null;
        }
      } catch {
        // ffprobe nicht verfügbar → Upload akzeptieren
      }
      return `/uploads/videos/${safeName}`;
    };

    // Bild in Zielverzeichnis speichern (Original-Bytes, keine Konvertierung)
    const saveImageFile = async (
      file: File,
      subdir: string,
      safeName: string
    ): Promise<void> => {
      const dir = uploadsDir(subdir);
      fs.mkdirSync(dir, { recursive: true });
      const content = await readBytes(file, MAX_IMAGE_UPLOAD_BYTES);
      fs.writeFileSync(path.join(dir, safeName), content);
    };

    // Offer-Bilder (und beigemischte Videos) verarbeiten
    const offerImages = form.getAll("offer_images").filter((v): v is File => v instanceof File && !!v.name);
    for (let idx = 0; idx < offerImages.length; idx++) {
      const file = offerImages[idx];
      if (isValidVideo(file.name)) {
        const url = await saveVideoFile(file, "offer_vid", idx);
        if (url) existingOfferVideos.push(url);
      } else if (isValidImage(file.name)) {
        const safeName = `${slug}_offer_${ts}_${idx}.jpg`;
        await saveImageFile(file, "landing", safeName);
        existingOffers.push(`/uploads/landing/${safeName}`);
      }
    }

    // Slideshow-Bilder (und beigemischte Videos) verarbeiten
    const slideshowImages = form.getAll("slideshow_images").filter((v): v is File => v instanceof File && !!v.name);
    for (let idx = 0; idx < slideshowImages.length; idx++) {
      const file = slideshowImages[idx];
      if (isValidVideo(file.name)) {
        const url = await saveVideoFile(file, "slide_vid", idx);
        if (url) existingSlideshowVideos.push(url);
      } else if (isValidImage(file.name)) {
        const safeName = `${slug}_slide_${ts}_${idx}.jpg`;
        await saveImageFile(file, "slideshow", safeName);
        existingSlideshow.push(`/uploads/slideshow/${safeName}`);
      }
    }

    // Galerie-Bilder (und beigemischte Videos) verarbeiten
    const galleryImages = form.getAll("gallery_images").filter((v): v is File => v instanceof File && !!v.name);
    for (let idx = 0; idx < galleryImages.length; idx++) {
      const file = galleryImages[idx];
      if (isValidVideo(file.name)) {
        const url = await saveVideoFile(file, "gal_vid", idx);
        if (url) existingGalleryVideos.push(url);
      } else if (isValidImage(file.name)) {
        const safeName = `${slug}_gal_${ts}_${idx}.jpg`;
        await saveImageFile(file, "gallery", safeName);
        existingGallery.push(`/uploads/gallery/${safeName}`);
      }
    }

    // Video-Uploads (max. 40 Sekunden, kein Re-Encode)
    const landingVideos = form.getAll("landing_videos").filter((v): v is File => v instanceof File && !!v.name);
    for (let idx = 0; idx < landingVideos.length; idx++) {
      const file = landingVideos[idx];
      if (!isValidVideo(file.name)) continue;
      const url = await saveVideoFile(file, "vid", idx);
      if (url) existingVideos.push(url);
    }

    // Landing-Sections-JSON parsen (dynamisches Section-System)
    let landingSections: Array<Record<string, unknown>> = [];
    const landingSectionsRaw = form.get("landing_sections_json");
    if (typeof landingSectionsRaw === "string" && landingSectionsRaw) {
      try {
        const parsed = JSON.parse(landingSectionsRaw);
        if (Array.isArray(parsed)) landingSections = parsed;
      } catch {
        landingSections = [];
      }
    }

    let whatWeOffer = "";
    let titleAbout = "";
    let oeffnungszeiten = "";
    let titleHours = "";
    let angebote = "";
    let titleHappyhour = "";
    let aktuelles = "";
    let titleNews = "";
    const customSections: Array<{
      title: string;
      content: string;
      image: string;
      _has_new_image: boolean;
    }> = [];

    for (const rawSec of landingSections) {
      if (!rawSec || typeof rawSec !== "object") continue;
      const sec = rawSec as Record<string, unknown>;
      const secType = String(sec.type ?? "custom");
      const secTitle = String(sec.title ?? "").trim();
      const secContent = String(sec.content ?? "").trim();

      if (secType === "about") {
        whatWeOffer = secContent;
        titleAbout = secTitle;
      } else if (secType === "hours") {
        oeffnungszeiten = secContent;
        titleHours = secTitle;
      } else if (secType === "offers") {
        angebote = secContent;
        titleHappyhour = secTitle;
      } else if (secType === "news") {
        aktuelles = secContent;
        titleNews = secTitle;
      } else if (secType === "custom") {
        customSections.push({
          title: secTitle,
          content: secContent,
          image: String(sec.image ?? ""),
          _has_new_image: Boolean(sec._has_new_image),
        });
      }
    }

    // custom_sections_json nur rückwärtskompatibel: Bilder in noch
    // existierende Sections übernehmen, gelöschte NICHT wiederherstellen.
    const customSectionsRaw = form.get("custom_sections_json");
    if (typeof customSectionsRaw === "string" && customSectionsRaw) {
      try {
        const compatSections = JSON.parse(customSectionsRaw);
        if (Array.isArray(compatSections)) {
          for (const rawSec of compatSections) {
            if (!rawSec || typeof rawSec !== "object") continue;
            const sec = rawSec as Record<string, unknown>;
            for (const existing of customSections) {
              if (existing.title === String(sec.title ?? "").trim()) {
                if (!existing.image && sec.image) {
                  existing.image = String(sec.image);
                }
                break;
              }
            }
          }
        }
      } catch {
        // ignorieren
      }
    }

    // Custom-Section-Bild/Video-Uploads zuordnen.
    // BUG-FIX (legacy): leere File-Inputs herausfiltern, sonst Index-Versatz.
    const validUploads = form
      .getAll("custom_section_images")
      .filter((v): v is File => v instanceof File && !!v.name);
    if (validUploads.length > 0) {
      fs.mkdirSync(uploadsDir("landing"), { recursive: true });
      let customImageIdx = 0;
      for (let secIdx = 0; secIdx < customSections.length; secIdx++) {
        if (!customSections[secIdx]._has_new_image) continue;
        if (customImageIdx >= validUploads.length) break;
        const file = validUploads[customImageIdx];
        if (file.name) {
          if (isValidImage(file.name)) {
            const safeName = `${slug}_csec_${ts}_${customImageIdx}.jpg`;
            const content = await readBytes(file, MAX_IMAGE_UPLOAD_BYTES);
            fs.writeFileSync(path.join(uploadsDir("landing"), safeName), content);
            customSections[secIdx].image = `/uploads/landing/${safeName}`;
          } else if (isValidVideo(file.name)) {
            const safeName = `${slug}_csec_${ts}_${customImageIdx}.mp4`;
            const content = await readBytes(file, MAX_VIDEO_UPLOAD_BYTES);
            fs.writeFileSync(path.join(uploadsDir("landing"), safeName), content);
            customSections[secIdx].image = `/uploads/landing/${safeName}`;
          }
        }
        customImageIdx++;
      }
    }

    // Custom-Sections bereinigen
    const cleanedCustomSections = customSections
      .filter((sec) => sec.title || sec.content || sec.image)
      .map((sec) => ({
        title: String(sec.title ?? "").trim(),
        content: String(sec.content ?? "").trim(),
        image: String(sec.image ?? "").trim(),
      }));

    const strField = (name: string): string => {
      const v = form.get(name);
      return typeof v === "string" ? v.trim() : "";
    };
    const welcomeTitle = strField("welcome_title");

    const newLandingPage = {
      welcome_title: welcomeTitle || `Willkommen bei ${tenant.name || slug}`,
      welcome_subtitle: strField("welcome_subtitle"),
      what_we_offer: whatWeOffer,
      google_rating_url: strField("google_rating_url"),
      aktuelles,
      oeffnungszeiten,
      angebote,
      title_about: titleAbout,
      title_offers: strField("title_offers"),
      title_news: titleNews,
      title_hours: titleHours,
      title_happyhour: titleHappyhour,
      title_gallery: strField("title_gallery"),
      title_videos: strField("title_videos"),
      slideshow_enabled: parseFormBool(form.get("slideshow_enabled")),
      offer_images: existingOffers,
      offer_videos: existingOfferVideos,
      slideshow_images: existingSlideshow,
      slideshow_videos: existingSlideshowVideos,
      gallery_images: existingGallery,
      gallery_videos: existingGalleryVideos,
      videos: existingVideos,
      custom_sections: cleanedCustomSections,
    };

    try {
      await prisma.tenant.update({
        where: { slug },
        data: { landing_page_json: JSON.stringify(newLandingPage) },
      });
    } catch (e) {
      throw new ApiError(`Fehler beim Speichern: ${e}`, 500);
    }
    if (
      request.headers.get("accept")?.includes("application/json") ||
      request.headers.get("x-requested-with") === "fetch"
    ) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.redirect(new URL("/admin/dashboard?tab=config", request.url), 303);
  } catch (err) {
    return errorResponse(err);
  }
}
