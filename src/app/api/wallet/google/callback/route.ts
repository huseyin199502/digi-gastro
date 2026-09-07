import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nowIso } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

// Legacy POST /api/wallet/google/callback (main.py ~15929)
// Google Wallet Save/Delete Callback. Google erwartet immer HTTP 200.
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      eventType?: string;
      objectId?: string;
      classId?: string;
      nonce?: string;
    };
    const eventType = body.eventType ?? "";
    const objectId = body.objectId ?? "";
    const classId = body.classId ?? "";
    const nonce = body.nonce ?? "";

    console.log(
      `[Google Wallet Callback] eventType=${eventType}, objectId=${objectId.slice(0, 40)}..., classId=${classId.slice(0, 40)}...`
    );

    // Object-ID Format: "{issuer_id}.{tenant_slug}-{serialShort}" mit
    // serialShort = pass_serial.slice(0,16) OHNE Bindestriche. Für den
    // Lookup müssen die UUID-Bindestriche an Position 8 und 13 zurück.
    if (objectId && objectId.includes(".")) {
      const objectPart = objectId.split(".").slice(1).join(".");
      if (objectPart.includes("-")) {
        const serialPrefix = objectPart.split("-").pop() ?? "";
        const dashed =
          serialPrefix.length >= 13
            ? `${serialPrefix.slice(0, 8)}-${serialPrefix.slice(8, 12)}-${serialPrefix.slice(12)}`
            : serialPrefix;
        // Customer finden dessen pass_serial mit dem rekonstruierten Prefix
        // beginnt. OHNE pass_type-Filter: Kunden wandern zwischen den
        // Wallets (Apple↔Google), das Google-Object bleibt aber bestehen.
        const customer = await prisma.loyaltyCustomer.findFirst({
          where: {
            pass_serial: { startsWith: dashed },
          },
        });

        if (customer) {
          if (eventType === "save") {
            // Pass wurde gespeichert → pass_downloaded_at setzen
            if (!customer.pass_downloaded_at) {
              await prisma.loyaltyCustomer.update({
                where: { id: customer.id },
                data: {
                  pass_downloaded_at: nowIso(),
                  pass_updated_at: nowIso(),
                },
              });
              console.log(
                `[Google Wallet Callback] ✅ pass_downloaded_at set for customer ${customer.id} (tenant=${customer.tenant_slug})`
              );
            }
          } else if (eventType === "del") {
            // Pass wurde gelöscht → pass_downloaded_at resetten
            if (customer.pass_downloaded_at) {
              await prisma.loyaltyCustomer.update({
                where: { id: customer.id },
                data: { pass_downloaded_at: null, pass_needs_update: false },
              });
              console.log(
                `[Google Wallet Callback] ❌ pass_downloaded_at reset for customer ${customer.id} (tenant=${customer.tenant_slug})`
              );
            }
          }
        } else {
          console.log(
            `[Google Wallet Callback] Customer nicht gefunden für object_part=${objectPart}`
          );
        }
      }
    }

    // Logging in passkit_logs Tabelle (zweckentfremdet für Google Wallet Logs)
    try {
      await prisma.passkitLog.create({
        data: {
          logs: JSON.stringify([
            {
              source: "google_wallet_callback",
              eventType,
              objectId,
              classId,
              nonce,
              timestamp: nowIso(),
            },
          ]),
          created_at: nowIso(),
        },
      });
    } catch {
      // ignore
    }
  } catch (e) {
    console.log(`[Google Wallet Callback] Error: ${e}`);
  }

  // Google erwartet HTTP 200
  return new NextResponse(null, { status: 200 });
}
