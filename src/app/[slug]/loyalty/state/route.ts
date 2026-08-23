import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/adminApi";
import { loyaltyCookieSecure } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

// Legacy GET /{slug}/loyalty/state (main.py ~14757)
// Drei-Kanal-Server-Lookup: Hat dieser Kunde schon einen Pass?
// Lookup-Priorität: 0. ?recover=CODE, 1. anonymous_id, 2. _cid Cookie.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const sp = request.nextUrl.searchParams;
    const aid = (sp.get("aid") ?? "").trim();
    const recoverCode = (sp.get("recover") ?? "").trim().toUpperCase();

    // Tenant-Test-Override: ?no_loyalty_popup=1 → Popup immer unterdrücken
    if (sp.get("no_loyalty_popup") === "1") {
      return NextResponse.json({
        show_popup: false,
        customer_id: null,
        has_pass: false,
        anonymous_id: aid,
      });
    }

    const card = await prisma.loyaltyCard.findFirst({
      where: { tenant_slug: slug, is_active: true },
    });
    if (!card) {
      return NextResponse.json({
        show_popup: false,
        customer_id: null,
        has_pass: false,
        anonymous_id: aid,
      });
    }

    type Cust = Awaited<
      ReturnType<typeof prisma.loyaltyCustomer.findFirst>
    >;
    let customer: Cust = null;

    // 0. AUTO-RECOVERY via ?recover=CODE
    if (recoverCode && recoverCode.length >= 3) {
      customer = await prisma.loyaltyCustomer.findFirst({
        where: { tenant_slug: slug, short_code: recoverCode },
      });
      if (customer) {
        // anonymous_id verknüpfen (falls nicht bereits)
        if (aid && customer.anonymous_id !== aid) {
          await prisma.loyaltyCustomer.update({
            where: { id: customer.id },
            data: { anonymous_id: aid },
          });
          customer = { ...customer, anonymous_id: aid };
        }
        console.log(
          `[Loyalty Auto-Recovery] Customer ${customer.id} (Code: ${recoverCode}) via /loyalty/state?recover= erkannt`
        );
      }
    }

    // 1. anonymous_id (DB)
    if (!customer && aid) {
      customer = await prisma.loyaltyCustomer.findFirst({
        where: { tenant_slug: slug, anonymous_id: aid },
      });
    }

    // 2. _cid Cookie
    if (!customer) {
      const cidCookie = request.cookies.get(`loyalty_${slug}_cid`)?.value;
      if (cidCookie) {
        try {
          const cid = parseInt(cidCookie, 10);
          if (!Number.isNaN(cid)) {
            customer = await prisma.loyaltyCustomer.findFirst({
              where: { tenant_slug: slug, id: cid },
            });
            // Bestehenden Customer mit anonymous_id anreichern
            if (customer && !customer.anonymous_id && aid) {
              await prisma.loyaltyCustomer.update({
                where: { id: customer.id },
                data: { anonymous_id: aid },
              });
              customer = { ...customer, anonymous_id: aid };
            }
          }
        } catch {
          customer = null;
        }
      }
    }

    let hasPass = Boolean(customer && customer.pass_downloaded_at);
    // POPUP ENTFERNT — show_popup immer False (Stempelkarte ist jetzt ein Button)
    let showPopup = false;

    // Apple Auto-heal: pass_downloaded_at gesetzt aber keine Device-Registration
    // mehr → Pass wurde aus dem Wallet gelöscht → Reset damit Popup wieder kommt
    if (
      customer &&
      customer.pass_downloaded_at &&
      customer.pass_type === "apple"
    ) {
      const regCount = await prisma.passkitDeviceRegistration.count({
        where: { pass_serial: customer.pass_serial },
      });
      if (regCount === 0) {
        await prisma.loyaltyCustomer.update({
          where: { id: customer.id },
          data: { pass_downloaded_at: null, pass_needs_update: false },
        });
        customer = {
          ...customer,
          pass_downloaded_at: null,
          pass_needs_update: false,
        };
        hasPass = false;
        showPopup = true;
        console.log(
          `[Loyalty] Auto-heal: Customer ${customer.id} had pass_downloaded_at but no device_registration → resetted`
        );
      }
    }

    // CRITICAL FIX: _cid Cookie via HTTP-Header setzen (überlebt Safari ITP)
    const responseData = {
      show_popup: showPopup,
      customer_id: customer ? customer.id : null,
      has_pass: hasPass,
      anonymous_id: aid || (customer ? customer.anonymous_id : null),
    };
    if (customer && customer.id) {
      const response = NextResponse.json(responseData);
      const secure = loyaltyCookieSecure(request);
      response.cookies.set(`loyalty_${slug}_cid`, String(customer.id), {
        httpOnly: true,
        maxAge: 31536000,
        sameSite: "lax",
        secure,
        path: "/",
      });
      // 'saved' Cookie auch server-seitig setzen (für Popup-Suppression)
      if (hasPass) {
        response.cookies.set(`loyalty_${slug}`, "saved", {
          httpOnly: false,
          maxAge: 31536000,
          sameSite: "lax",
          secure,
          path: "/",
        });
      }
      return response;
    }
    return NextResponse.json(responseData);
  } catch (err) {
    return errorResponse(err);
  }
}
