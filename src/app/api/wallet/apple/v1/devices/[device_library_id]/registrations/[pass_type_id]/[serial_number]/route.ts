import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, jsonError } from "@/lib/adminApi";
import { nowIso } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

// Legacy POST /api/wallet/apple/v1/devices/{device_library_id}/registrations/{pass_type_id}/{serial_number}
// (main.py ~15452) — iOS registriert Device beim Pass-Download.
export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      device_library_id: string;
      pass_type_id: string;
      serial_number: string;
    }>;
  }
) {
  try {
    const { device_library_id, pass_type_id, serial_number } = await params;

    // Auth: ApplePass <token>
    const auth = request.headers.get("authorization") ?? "";
    if (!auth.startsWith("ApplePass ")) {
      return jsonError(401, "Unauthorized");
    }

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const pushToken = String(body.pushToken ?? "");
    if (!pushToken) {
      return jsonError(400, "pushToken missing");
    }

    // Customer finden für tenant_slug
    const customer = await prisma.loyaltyCustomer.findFirst({
      where: { pass_serial: serial_number },
    });
    const tenantSlug = customer ? customer.tenant_slug : null;

    // CRITICAL FIX: pass_downloaded_at beim Registrieren setzen
    // (absoluter Beweis: iOS hat den Pass zum Wallet hinzugefügt)
    if (customer && !customer.pass_downloaded_at) {
      await prisma.loyaltyCustomer.update({
        where: { id: customer.id },
        data: { pass_downloaded_at: nowIso(), pass_updated_at: nowIso() },
      });
      console.log(
        `[PassKit] ✅ pass_downloaded_at set for customer ${customer.id} (device registration)`
      );
    }

    // Auto-Recovery: last_known_device_id auf Customer setzen/updaten
    if (customer) {
      if (!customer.last_known_device_id) {
        await prisma.loyaltyCustomer.update({
          where: { id: customer.id },
          data: { last_known_device_id: device_library_id },
        });
        console.log(
          `[PassKit] ✅ last_known_device_id set for customer ${customer.id}: ${device_library_id.slice(0, 16)}...`
        );
      } else if (customer.last_known_device_id !== device_library_id) {
        const oldDevice = customer.last_known_device_id;
        await prisma.loyaltyCustomer.update({
          where: { id: customer.id },
          data: { last_known_device_id: device_library_id },
        });
        console.log(
          `[PassKit] 🔄 last_known_device_id updated for customer ${customer.id}: ${oldDevice.slice(0, 16)}... → ${device_library_id.slice(0, 16)}...`
        );
      }
    }

    // Auto-Recovery: existiert für dieses Gerät bereits ein ANDERER Customer?
    // → Stempel/Rewards migrieren statt Duplikat entstehen lassen.
    if (tenantSlug && customer) {
      const existingDeviceCustomer = await prisma.loyaltyCustomer.findFirst({
        where: {
          tenant_slug: tenantSlug,
          last_known_device_id: device_library_id,
          id: { not: customer.id },
        },
      });
      if (existingDeviceCustomer) {
        console.log(
          `[PassKit] ⚠️  Auto-Recovery: Device ${device_library_id.slice(0, 16)}... war früher Customer ${existingDeviceCustomer.id} (Serial ${existingDeviceCustomer.pass_serial.slice(0, 8)}...)`
        );
        console.log(
          `  Now registering as Customer ${customer.id} (Serial ${serial_number.slice(0, 8)}...)`
        );
        // Stempel + Rewards vom alten Customer übernehmen (nur wenn neu leer)
        if (
          (existingDeviceCustomer.current_stamps ?? 0) > 0 &&
          (customer.current_stamps ?? 0) === 0
        ) {
          const migrateData: Record<string, unknown> = {
            current_stamps: existingDeviceCustomer.current_stamps,
            total_stamps_earned: {
              increment: existingDeviceCustomer.total_stamps_earned,
            },
            rewards_redeemed: {
              increment: existingDeviceCustomer.rewards_redeemed,
            },
          };
          if (
            existingDeviceCustomer.first_visit_at &&
            (!customer.first_visit_at ||
              existingDeviceCustomer.first_visit_at < customer.first_visit_at)
          ) {
            migrateData.first_visit_at = existingDeviceCustomer.first_visit_at;
          }
          // Tier updaten falls alter Customer VIP/Stamm war
          if (
            ["stamm", "vip"].includes(existingDeviceCustomer.tier ?? "") &&
            customer.tier === "neu"
          ) {
            migrateData.tier = existingDeviceCustomer.tier;
          }
          await prisma.loyaltyCustomer.update({
            where: { id: customer.id },
            data: migrateData,
          });
          console.log(
            `  → Stempel ${existingDeviceCustomer.current_stamps} + Rewards ${existingDeviceCustomer.rewards_redeemed} migriert`
          );
        }
        // Alten Customer als "abgelöst" markieren (nicht löschen — Audit-Trail)
        await prisma.loyaltyCustomer.update({
          where: { id: existingDeviceCustomer.id },
          data: { last_known_device_id: null, pass_needs_update: false },
        });
      }
    }

    // Existierende Registration updaten oder neue erstellen
    const reg = await prisma.passkitDeviceRegistration.findFirst({
      where: {
        device_library_identifier: device_library_id,
        pass_serial: serial_number,
      },
    });
    if (reg) {
      await prisma.passkitDeviceRegistration.update({
        where: { id: reg.id },
        data: { push_token: pushToken, tenant_slug: tenantSlug },
      });
    } else {
      await prisma.passkitDeviceRegistration.create({
        data: {
          device_library_identifier: device_library_id,
          pass_type_identifier: pass_type_id,
          pass_serial: serial_number,
          push_token: pushToken,
          tenant_slug: tenantSlug,
          created_at: nowIso(),
        },
      });
    }

    console.log(
      `[PassKit] ✅ Device registered: ${device_library_id.slice(0, 16)}... → pass ${serial_number.slice(0, 8)}... push_token=${pushToken.slice(0, 16)}...`
    );
    return new NextResponse(null, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

// Legacy DELETE …/{serial_number} (main.py ~15642)
// iOS löscht Pass aus Wallet → Registration entfernen; letztes Device →
// pass_downloaded_at resetten damit das Popup wieder erscheint.
export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      device_library_id: string;
      pass_type_id: string;
      serial_number: string;
    }>;
  }
) {
  try {
    const { device_library_id, serial_number } = await params;

    const auth = request.headers.get("authorization") ?? "";
    if (!auth.startsWith("ApplePass ")) {
      return jsonError(401, "Unauthorized");
    }

    const reg = await prisma.passkitDeviceRegistration.findFirst({
      where: {
        device_library_identifier: device_library_id,
        pass_serial: serial_number,
      },
    });
    if (reg) {
      await prisma.passkitDeviceRegistration.delete({ where: { id: reg.id } });
      console.log(
        `[PassKit] Device unregistered: ${device_library_id.slice(0, 16)}... → pass ${serial_number.slice(0, 8)}...`
      );
    }

    // CRITICAL FIX: letztes Device entfernt → pass_downloaded_at zurücksetzen
    const remainingRegs = await prisma.passkitDeviceRegistration.count({
      where: { pass_serial: serial_number },
    });
    if (remainingRegs === 0) {
      const customer = await prisma.loyaltyCustomer.findFirst({
        where: { pass_serial: serial_number },
      });
      if (customer && customer.pass_downloaded_at) {
        await prisma.loyaltyCustomer.update({
          where: { id: customer.id },
          data: { pass_downloaded_at: null, pass_needs_update: false },
        });
        console.log(
          `[PassKit] ⚠️  Last device removed for ${serial_number.slice(0, 8)}... → pass_downloaded_at reset to None`
        );
        console.log(
          `  Customer ${customer.id} will see loyalty popup again on next menu visit`
        );
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    return errorResponse(err);
  }
}
