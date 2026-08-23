import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, jsonError } from "@/lib/adminApi";
import {
  deterministicAuthToken,
  generateApplePkpass,
  nowIso,
} from "@/lib/walletPass";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Legacy GET /api/wallet/apple/v1/passes/{pass_type_id}/{serial_number}
// (main.py ~15696) — iOS fragt nach Pass-Update.
// CRITICAL: Niemals 404/500 senden wenn Pass im Wallet liegt — immer 304,
// sonst löscht iOS den Pass aus dem Wallet.
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ pass_type_id: string; serial_number: string }>;
  }
) {
  try {
    const { serial_number } = await params;

    const auth = request.headers.get("authorization") ?? "";
    if (!auth.startsWith("ApplePass ")) {
      return jsonError(401, "Unauthorized");
    }

    const notModified = (lastMod: string) =>
      new NextResponse(null, {
        status: 304,
        headers: { "Last-Modified": lastMod },
      });

    // Customer finden
    const customer = await prisma.loyaltyCustomer.findFirst({
      where: { pass_serial: serial_number },
    });

    // CRITICAL FIX 2: Customer nicht gefunden → 304 statt 404!
    if (!customer) {
      console.log(
        `[PassKit] ⚠️  Customer not found for serial ${serial_number.slice(0, 8)}... → 304 (NOT 404!)`
      );
      const reg = await prisma.passkitDeviceRegistration.findFirst({
        where: { pass_serial: serial_number },
      });
      if (reg) {
        console.log(
          `  → Serial found in device_registrations (tenant=${reg.tenant_slug})`
        );
        return notModified(reg.created_at || nowIso());
      }
      console.log(`  → Serial not in device_registrations either → 304 fallback`);
      return notModified(nowIso());
    }

    // Kein Update nötig → 304 Not Modified
    if (!customer.pass_needs_update) {
      console.log(
        `[PassKit] ⏭️  304 Not Modified for ${serial_number.slice(0, 8)}... (no update needed)`
      );
      return notModified(
        customer.pass_updated_at || customer.created_at || nowIso()
      );
    }

    const card = await prisma.loyaltyCard.findFirst({
      where: { id: customer.card_id },
    });
    if (!card) {
      return jsonError(404, "Card not found");
    }
    const tenant = await prisma.tenant.findFirst({
      where: { slug: customer.tenant_slug },
    });
    if (!tenant) {
      return jsonError(404, "Tenant not found");
    }

    const geofence = await prisma.tenantGeofence.findFirst({
      where: { tenant_slug: customer.tenant_slug, is_primary: true },
    });
    const geofenceDict = geofence
      ? { latitude: geofence.latitude, longitude: geofence.longitude }
      : null;

    const customerDict = {
      id: customer.id,
      pass_serial: customer.pass_serial,
      current_stamps: customer.current_stamps,
      // CRITICAL: Same deterministic auth_token as in initial pass download
      auth_token: deterministicAuthToken(customer.pass_serial),
      short_code: customer.short_code || "",
      last_message: customer.last_message || "Willkommen!",
      msg_nonce: String(customer.msg_nonce || 0),
    };
    const cardDict = {
      id: card.id,
      name: card.name,
      stamps_required: card.stamps_required,
      reward_name: card.reward_name,
      color_hex: card.color_hex,
    };

    // Logo für Pass-Update (gleiche Logik wie beim initialen Download)
    let logoBytes: Buffer | null = null;
    if (tenant.logo_path) {
      const logoFilename = tenant.logo_path.split("/").pop() ?? "";
      const possiblePaths = [
        path.join(UPLOAD_DIR, "logos", logoFilename.replace(".webp", ".png")),
        path.join(UPLOAD_DIR, "logos", logoFilename),
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(/* turbopackIgnore: true */ p)) {
          logoBytes = fs.readFileSync(p);
          break;
        }
      }
    }

    // CRITICAL: Bei Generierungs-Fehler NICHT 500/503 senden — Apple würde
    // den Pass aus dem Wallet löschen. Stattdessen 304.
    let pkpassBytes: Buffer | null = null;
    try {
      pkpassBytes = await generateApplePkpass(
        customer.tenant_slug,
        tenant.name ?? "",
        cardDict,
        customerDict,
        geofenceDict,
        logoBytes
      );
    } catch (e) {
      console.log(
        `[PassKit] ❌ Pass generation FAILED for ${serial_number.slice(0, 8)}...: ${e}`
      );
      return notModified(
        customer.pass_updated_at || customer.created_at || nowIso()
      );
    }
    if (!pkpassBytes) {
      console.log(
        `[PassKit] ❌ Pass generation returned None for ${serial_number.slice(0, 8)}...`
      );
      return notModified(
        customer.pass_updated_at || customer.created_at || nowIso()
      );
    }

    // Pass erfolgreich generiert → pass_needs_update zurücksetzen
    await prisma.loyaltyCustomer.update({
      where: { id: customer.id },
      data: { pass_needs_update: false, pass_updated_at: nowIso() },
    });

    // FIX: If-Modified-Since Header korrekt behandeln
    const ifModifiedSince = request.headers.get("if-modified-since");
    if (ifModifiedSince) {
      try {
        const headerDate = new Date(ifModifiedSince);
        const lastChange = customer.pass_updated_at || customer.created_at;
        if (lastChange && !Number.isNaN(headerDate.getTime())) {
          const changeDate = new Date(lastChange.replace("Z", "+00:00"));
          if (changeDate.getTime() <= headerDate.getTime()) {
            console.log(
              `[PassKit] 304 Not Modified for ${serial_number.slice(0, 8)}... (pass unchanged since ${ifModifiedSince})`
            );
            return notModified(lastChange);
          }
        }
      } catch {
        // Bei Parse-Fehlern: normalen 200 zurückgeben
      }
    }

    console.log(
      `[PassKit] ✅ Pass served for ${serial_number.slice(0, 8)}... (stamps: ${customer.current_stamps}/${card.stamps_required})`
    );
    // Last-Modified = letztes Pass-Update oder Erstellung (nicht NOW()!)
    const lastMod =
      customer.pass_updated_at || customer.created_at || nowIso();
    return new NextResponse(new Uint8Array(pkpassBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${customer.tenant_slug}-stempelkarte.pkpass"`,
        "Last-Modified": lastMod,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
