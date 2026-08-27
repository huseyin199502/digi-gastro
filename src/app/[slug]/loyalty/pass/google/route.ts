import crypto from "crypto";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { errorResponse, jsonError } from "@/lib/adminApi";
import { getOrCreateCustomer, loyaltyCookieSecure } from "@/lib/loyalty";
import { appBaseUrl, generateGoogleWalletJwt, nowIso } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Legacy GET /{slug}/loyalty/pass/google (main.py ~15326)
// Generiert JWT-Link für Google Wallet.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();

    const card = await prisma.loyaltyCard.findFirst({
      where: { tenant_slug: slug, is_active: true },
    });
    if (!card) {
      return jsonError(404, "Keine aktive Stempelkarte vorhanden.");
    }
    const tenant = await prisma.tenant.findFirst({ where: { slug } });
    if (!tenant) {
      return jsonError(404, "Restaurant nicht gefunden.");
    }

    // CRITICAL FIX: customer_id Cookie heißt 'loyalty_{slug}_cid'
    const cookieVal =
      request.cookies.get(`loyalty_${slug}_cid`)?.value ||
      request.cookies.get(`loyalty_${slug}`)?.value;
    type Cust = Awaited<ReturnType<typeof prisma.loyaltyCustomer.findFirst>>;
    let customer: Cust = null;
    if (cookieVal) {
      const cid = parseInt(cookieVal, 10);
      if (!Number.isNaN(cid)) {
        customer = await prisma.loyaltyCustomer.findFirst({
          where: { tenant_slug: slug, id: cid },
        });
      }
    }
    // Drei-Kanal-Lookup: anonymous_id aus Query-Param
    const aid = (request.nextUrl.searchParams.get("aid") ?? "").trim();
    if (!customer && aid) {
      customer = await prisma.loyaltyCustomer.findFirst({
        where: { tenant_slug: slug, anonymous_id: aid },
      });
    }
    if (!customer) {
      const res = await getOrCreateCustomer(slug, card.id, "google", aid || null);
      customer = res.customer as Cust;
    }
    if (!customer) {
      return jsonError(500, "Kunde konnte nicht erstellt werden.");
    }

    const geofence = await prisma.tenantGeofence.findFirst({
      where: { tenant_slug: slug, is_primary: true },
    });
    const geofenceDict = geofence
      ? { latitude: geofence.latitude, longitude: geofence.longitude }
      : null;

    const customerDict = {
      id: customer.id,
      pass_serial: customer.pass_serial,
      current_stamps: customer.current_stamps,
      short_code: customer.short_code || "", // CRITICAL: für Google Pass barcode
    };
    const cardDict = {
      id: card.id,
      name: card.name,
      stamps_required: card.stamps_required,
      reward_name: card.reward_name,
      color_hex: card.color_hex,
    };

    // Logo-URL für Google Wallet (muss PNG/JPEG sein, erreichbar von Google)
    // WICHTIG: Google akzeptiert kein WebP → WebP wird nach PNG konvertiert.
    // Falls kein Logo verfügbar, greift generateGoogleClassPayload auf ein
    // gebündeltes Default-Logo zurück.
    let logoUrlForGoogle = "";
    if (tenant.logo_path) {
      const logoFilename = tenant.logo_path.split("/").pop() ?? "";
      const isWebp = /\.webp$/i.test(logoFilename);
      const pngFilename = logoFilename.replace(/\.webp$/i, ".png");
      const logoFsPath = path.join(UPLOAD_DIR, "logos", logoFilename);
      const pngFsPath = path.join(UPLOAD_DIR, "logos", pngFilename);
      try {
        if (isWebp && fs.existsSync(/* turbopackIgnore: true */ logoFsPath)) {
          await sharp(logoFsPath).png().toFile(pngFsPath);
          logoUrlForGoogle = `${appBaseUrl()}/uploads/logos/${pngFilename}`;
        } else if (fs.existsSync(/* turbopackIgnore: true */ pngFsPath)) {
          logoUrlForGoogle = `${appBaseUrl()}/uploads/logos/${pngFilename}`;
        } else if (fs.existsSync(/* turbopackIgnore: true */ logoFsPath)) {
          logoUrlForGoogle = `${appBaseUrl()}/uploads/logos/${logoFilename}`;
        }
      } catch (e) {
        console.log(`[Google Wallet] Logo conversion failed: ${e}`);
      }
    }

    const jwtToken = generateGoogleWalletJwt(
      slug,
      tenant.name ?? "",
      cardDict,
      customerDict,
      geofenceDict,
      logoUrlForGoogle
    );
    if (!jwtToken) {
      return jsonError(500, "Google Wallet JWT Generierung fehlgeschlagen.");
    }

    const updateData: Record<string, unknown> = { pass_needs_update: false };
    if (!customer.pass_downloaded_at) {
      updateData.pass_downloaded_at = nowIso();
      updateData.pass_updated_at = nowIso();
    }
    if (!customer.anonymous_id) {
      updateData.anonymous_id = aid || crypto.randomUUID();
    }
    await prisma.loyaltyCustomer.update({
      where: { id: customer.id },
      data: updateData,
    });

    const saveUrl = `https://pay.google.com/gp/v/save/${jwtToken}`;

    // WICHTIG: Bei direktem Browser-Besuch (Accept: text/html, kein
    // X-Requested-With) zur save_url weiterleiten. Bei AJAX/Fetch JSON.
    const acceptHeader = request.headers.get("accept") ?? "";
    const xRequested = request.headers.get("x-requested-with") ?? "";
    const isBrowserDirect =
      acceptHeader.includes("text/html") &&
      !acceptHeader.includes("application/json") &&
      !xRequested;

    const secure = loyaltyCookieSecure(request);
    const cookieOptsCid = {
      httpOnly: true,
      maxAge: 31536000,
      sameSite: "lax" as const,
      secure,
      path: "/",
    };
    const cookieOptsSaved = {
      httpOnly: false,
      maxAge: 31536000,
      sameSite: "lax" as const,
      secure,
      path: "/",
    };

    if (isBrowserDirect) {
      // Direkter Browser-Besuch → Redirect zur Google Wallet Save Page
      const response = NextResponse.redirect(saveUrl, 302);
      response.cookies.set(`loyalty_${slug}_cid`, String(customer.id), cookieOptsCid);
      response.cookies.set(`loyalty_${slug}`, "saved", cookieOptsSaved);
      return response;
    }

    // AJAX/Fetch → JSON Response für Frontend
    const response = NextResponse.json({
      save_url: saveUrl,
      customer_id: customer.id,
    });
    response.cookies.set(`loyalty_${slug}_cid`, String(customer.id), cookieOptsCid);
    response.cookies.set(`loyalty_${slug}`, "saved", cookieOptsSaved);
    return response;
  } catch (err) {
    return errorResponse(err);
  }
}
