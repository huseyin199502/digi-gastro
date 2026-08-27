/**
 * Loyalty-Business-Logik (Port von loyalty.py):
 * Kundenanlage/Shortcodes, Stempel-Vergabe, Push-Updates (APNs/Google),
 * Inaktivitäts-Cron, Analytics. DSGVO: Kunden anonym, Opt-out via Flag.
 */
import crypto from "crypto";
import fs from "fs";
import http2 from "http2";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBerlinNow } from "@/lib/time";
import jwt from "jsonwebtoken";
import {
  APPLE_CERT_PATH,
  APPLE_KEY_PATH,
  APPLE_PASS_TYPE_ID,
  GOOGLE_ISSUER_ID,
  GOOGLE_SERVICE_ACCOUNT_PATH,
  isAppleConfigured,
  isGoogleConfigured,
  nowIso,
} from "@/lib/walletPass";

/** Legacy-Cookie-Secure-Logik: https + kein lokaler Host. */
export function loyaltyCookieSecure(request: NextRequest): boolean {
  const url = new URL(request.url);
  const fwdProto = request.headers.get("x-forwarded-proto") ?? "";
  const isHttps = url.protocol === "https:" || fwdProto === "https";
  return (
    isHttps && !["localhost", "127.0.0.1", "testserver"].includes(url.hostname)
  );
}

// ─── Short-Code (Crockford Base32 ohne 0/O/1/I) ───
const CROCKFORD_BASE32 = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateShortCode(): string {
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += CROCKFORD_BASE32[crypto.randomInt(CROCKFORD_BASE32.length)];
  }
  return out;
}

export async function generateUniqueShortCode(
  tenantSlug: string,
  maxRetries: number = 10
): Promise<string> {
  const slug = tenantSlug.toLowerCase().trim();
  for (let i = 0; i < maxRetries; i++) {
    const code = generateShortCode();
    const exists = await prisma.loyaltyCustomer.findFirst({
      where: { tenant_slug: slug, short_code: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  // Fallback: 5-stelliger Code
  let out = "";
  for (let i = 0; i < 5; i++) {
    out += CROCKFORD_BASE32[crypto.randomInt(CROCKFORD_BASE32.length)];
  }
  return out;
}

/** Normalisierung tolerant gegen 0/O und 1/I Verwechslung (Legacy). */
export function normalizeShortCode(shortCode: string): string {
  return shortCode
    .toUpperCase()
    .trim()
    .replace(/0/g, "Q")
    .replace(/O/g, "Q")
    .replace(/1/g, "J")
    .replace(/I/g, "J");
}

export async function findCustomerByShortCode(
  tenantSlug: string,
  shortCode: string
) {
  if (!shortCode) return null;
  const code = normalizeShortCode(shortCode);
  return prisma.loyaltyCustomer.findFirst({
    where: {
      tenant_slug: tenantSlug.toLowerCase().trim(),
      short_code: code,
    },
  });
}

// ─── Customer-Anlage ───
export async function getOrCreateCustomer(
  tenantSlug: string,
  cardId: number,
  passType: string = "apple",
  anonymousId?: string | null
) {
  const slug = tenantSlug.toLowerCase().trim();
  // 1. Lookup via anonymous_id
  if (anonymousId) {
    const existing = await prisma.loyaltyCustomer.findFirst({
      where: { tenant_slug: slug, anonymous_id: anonymousId },
    });
    if (existing) {
      await prisma.loyaltyCustomer.update({
        where: { id: existing.id },
        data: { last_visit_at: nowIso() },
      });
      return { customer: { ...existing, last_visit_at: nowIso() }, created: false };
    }
  }
  // 2. Neuer Customer
  const serial = crypto.randomUUID();
  const shortCode = await generateUniqueShortCode(slug);
  const now = nowIso();
  const customer = await prisma.loyaltyCustomer.create({
    data: {
      tenant_slug: slug,
      pass_serial: serial,
      pass_type: passType,
      card_id: cardId,
      current_stamps: 0,
      total_stamps_earned: 0,
      rewards_redeemed: 0,
      first_visit_at: now,
      last_visit_at: now,
      created_at: now,
      updated_at: now,
      pass_needs_update: true,
      push_opt_out: false,
      short_code: shortCode,
      tier: "neu",
      anonymous_id: anonymousId || crypto.randomUUID(),
      last_message: "Willkommen!",
      msg_nonce: 0,
    },
  });
  return { customer, created: true };
}

// ─── Stempel-Vergabe ───

/**
 * Vergibt einen Stempel für eine Online-Bestellung.
 * Atomares Increment (Race-Condition-Fix aus Legacy) + Reward-Reset.
 */
export async function awardStampForOrder(
  tenantSlug: string,
  customerId: number,
  orderId: number,
  orderTotal: number
) {
  const now = nowIso();
  const customer = await prisma.loyaltyCustomer.findFirst({
    where: { tenant_slug: tenantSlug, id: customerId },
  });
  if (!customer) return { success: false, error: "customer_not_found" };

  const card = await prisma.loyaltyCard.findFirst({
    where: { tenant_slug: tenantSlug, id: customer.card_id, is_active: true },
  });
  if (!card) return { success: false, error: "card_not_active" };

  await prisma.loyaltyStamp.create({
    data: {
      tenant_slug: tenantSlug,
      customer_id: customerId,
      card_id: card.id,
      order_id: orderId,
      order_total: orderTotal,
      stamp_type: "order",
      is_redeemed: false,
      created_at: now,
    },
  });

  // Atomares UPDATE (current_stamps = current_stamps + 1)
  await prisma.loyaltyCustomer.update({
    where: { id: customer.id },
    data: {
      current_stamps: { increment: 1 },
      total_stamps_earned: { increment: 1 },
      updated_at: now,
      last_visit_at: now,
      pass_needs_update: true,
      pass_updated_at: now,
      first_visit_at: customer.first_visit_at || now,
    },
  });
  const fresh = await prisma.loyaltyCustomer.findUniqueOrThrow({
    where: { id: customer.id },
  });

  // Reward auslösen wenn Limit erreicht → Reset auf 0
  let rewardTriggered = false;
  const stampsRequired = card.stamps_required ?? 10;
  if ((fresh.current_stamps ?? 0) >= stampsRequired) {
    await prisma.loyaltyCustomer.update({
      where: { id: fresh.id },
      data: {
        current_stamps: 0,
        updated_at: now,
        rewards_redeemed: { increment: 1 },
      },
    });
    await prisma.loyaltyStamp.updateMany({
      where: {
        customer_id: customerId,
        card_id: card.id,
        is_redeemed: false,
      },
      data: { is_redeemed: true, redeemed_at: now },
    });
    rewardTriggered = true;
  }

  try {
    await triggerPassUpdatePush(fresh, card.name, "Stempel erhalten!");
  } catch (e) {
    console.log(`[Loyalty] Push failed (non-fatal): ${e}`);
  }

  return {
    success: true,
    card_id: card.id,
    card_name: card.name,
    stamps_current: rewardTriggered ? 0 : fresh.current_stamps,
    stamps_required: stampsRequired,
    reward_triggered: rewardTriggered,
    reward_name: rewardTriggered ? card.reward_name : null,
  };
}

/**
 * Manueller Stempel via Short-Code (Scanner-Alternative).
 * WICHTIG: Bei Limit wird NICHT resettet — Reset erst via /admin/loyalty/redeem.
 */
export async function awardManualStamp(
  tenantSlug: string,
  shortCode: string,
  _awardedBy: string = "waiter"
) {
  const code = normalizeShortCode(shortCode);
  const slug = tenantSlug.toLowerCase().trim();
  const now = nowIso();

  const customer = await prisma.loyaltyCustomer.findFirst({
    where: { tenant_slug: slug, short_code: code },
  });
  if (!customer) {
    return { success: false, error: "Kein Kunde mit diesem Code gefunden." };
  }

  const card = await prisma.loyaltyCard.findUnique({
    where: { id: customer.card_id },
  });
  if (!card) {
    return { success: false, error: "Stempelkarte existiert nicht mehr." };
  }

  // Atomares UPDATE (Race-Condition-Fix)
  await prisma.loyaltyCustomer.update({
    where: { id: customer.id },
    data: {
      current_stamps: { increment: 1 },
      total_stamps_earned: { increment: 1 },
      updated_at: now,
      last_visit_at: now,
      pass_needs_update: true,
      pass_updated_at: now,
    },
  });
  const fresh = await prisma.loyaltyCustomer.findUniqueOrThrow({
    where: { id: customer.id },
  });

  // Tier-Update (PHASE B)
  const total = fresh.total_stamps_earned ?? 0;
  const tier = total >= 10 ? "vip" : total >= 3 ? "stamm" : "neu";
  await prisma.loyaltyCustomer.update({
    where: { id: fresh.id },
    data: { tier },
  });

  await prisma.loyaltyStamp.create({
    data: {
      tenant_slug: slug,
      customer_id: fresh.id,
      card_id: fresh.card_id,
      order_id: null,
      order_total: 0.0,
      stamp_type: "manual",
      is_redeemed: false,
      created_at: now,
    },
  });

  // Reward-Check: current_stamps bleibt bei stamps_required ("PRÄMIE BEREIT!")
  let rewardRedeemed = false;
  const stampsRequired = card.stamps_required ?? 10;
  if ((fresh.current_stamps ?? 0) >= stampsRequired) {
    await prisma.loyaltyCustomer.update({
      where: { id: fresh.id },
      data: { rewards_redeemed: { increment: 1 } },
    });
    await prisma.loyaltyStamp.updateMany({
      where: {
        customer_id: fresh.id,
        card_id: card.id,
        is_redeemed: false,
      },
      data: { is_redeemed: true, redeemed_at: now },
    });
    rewardRedeemed = true;
  }

  try {
    await triggerPassUpdatePush(fresh, card.name, "Stempel erhalten!");
  } catch (e) {
    console.log(`[Loyalty] Push failed (non-fatal): ${e}`);
  }

  return {
    success: true,
    customer_nickname: fresh.nickname || `Kunde ${fresh.short_code}`,
    current_stamps: fresh.current_stamps,
    stamps_required: stampsRequired,
    reward_redeemed: rewardRedeemed,
    reward_name: rewardRedeemed ? card.reward_name : null,
    tier,
  };
}

// ─── Push via Pass-Update ───
type PushCustomer = {
  id: number;
  pass_serial: string;
  pass_type: string | null;
  tenant_slug: string;
  current_stamps?: number | null;
};

/** Returns true wenn Push gesendet wurde; Dev-Mode/Fehler → false (Legacy C6). */
export async function triggerPassUpdatePush(
  customer: PushCustomer,
  title: string,
  message: string
): Promise<boolean> {
  if (customer.pass_type === "apple" && !isAppleConfigured()) {
    console.log(
      `[Loyalty Push] DEV MODE - Apple Push für customer ${customer.id}: ${title}`
    );
    return false;
  }
  if (customer.pass_type === "google" && !isGoogleConfigured()) {
    console.log(
      `[Loyalty Push] DEV MODE - Google Push für customer ${customer.id}: ${title}`
    );
    return false;
  }
  try {
    if (customer.pass_type === "apple") {
      return await sendAppleApnsPush(customer, title, message);
    } else if (customer.pass_type === "google") {
      return await sendGoogleWalletUpdate(customer, title, message);
    }
    return false;
  } catch (e) {
    console.log(`[Loyalty Push] Failed for customer ${customer.id}: ${e}`);
    return false;
  }
}

/** APNs silent push (content-available:1, priority 5) via HTTP/2 + TLS-Client-Cert. */
async function sendAppleApnsPush(
  customer: PushCustomer,
  title: string,
  _message: string
): Promise<boolean> {
  const registrations = await prisma.passkitDeviceRegistration.findMany({
    where: { pass_serial: customer.pass_serial },
  });
  if (registrations.length === 0) {
    console.log(
      `[Loyalty Push] No device registrations for pass ${customer.pass_serial}`
    );
    return false; // C5: kein Push = kein Erfolg
  }

  let certPem: string;
  let keyPem: string;
  try {
    certPem = fs.readFileSync(APPLE_CERT_PATH, "utf-8");
    keyPem = fs.readFileSync(APPLE_KEY_PATH, "utf-8");
  } catch {
    return false;
  }

  const payload = JSON.stringify({ aps: { "content-available": 1 } });
  let successCount = 0;
  for (const reg of registrations) {
    try {
      const ok = await apnsPush(certPem, keyPem, reg.push_token, payload);
      if (ok) successCount++;
    } catch (e) {
      console.log(
        `[Loyalty Push] APNs failed for device ${reg.device_library_identifier}: ${e}`
      );
    }
  }
  console.log(
    `[Loyalty Push] Apple APNs: ${successCount}/${registrations.length} devices reached (title=${title.slice(0, 30)})`
  );
  return successCount > 0;
}

function apnsPush(
  certPem: string,
  keyPem: string,
  pushToken: string,
  payload: string
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const client = http2.connect("https://api.push.apple.com", {
        cert: certPem,
        key: keyPem,
        rejectUnauthorized: false,
      });
      const timer = setTimeout(() => {
        try {
          client.close();
        } catch {}
        resolve(false);
      }, 10000);
      const req = client.request({
        ":method": "POST",
        ":path": `/3/device/${pushToken}`,
        "apns-topic": APPLE_PASS_TYPE_ID,
        "apns-push-type": "background",
        // Pflicht für background push (priority 10 wäre ein Fehler)
        "apns-priority": "5",
        "apns-expiration": "0",
        "content-type": "application/json",
      });
      let status = 0;
      req.on("response", (headers) => {
        status = Number(headers[":status"] ?? 0);
      });
      req.on("data", () => {});
      req.on("end", () => {
        clearTimeout(timer);
        try {
          client.close();
        } catch {}
        if (status === 200) {
          console.log(`[APNs] Push sent to ${pushToken.slice(0, 16)}...`);
          resolve(true);
        } else {
          if (status === 410 || status === 404) {
            console.log(
              `[APNs] Token expired/invalid (${status}) for ${pushToken.slice(0, 16)}... → cleanup`
            );
          } else {
            console.log(`[APNs] Push failed: ${status}`);
          }
          resolve(false);
        }
      });
      req.on("error", (e) => {
        clearTimeout(timer);
        console.log(`[APNs] Push error: ${e.message}`);
        try {
          client.close();
        } catch {}
        resolve(false);
      });
      req.end(payload);
    } catch (e) {
      console.log(`[APNs] Push error: ${e}`);
      resolve(false);
    }
  });
}

/** OAuth2-Token aus Service Account (jwt-bearer Grant) — ersetzt google-auth. */
async function getGoogleAccessToken(): Promise<string> {
  const sa = JSON.parse(
    fs.readFileSync(GOOGLE_SERVICE_ACCOUNT_PATH, "utf-8")
  ) as { client_email: string; private_key: string; token_uri?: string };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/wallet_object.issuer",
    aud: sa.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const assertion = jwt.sign(claim, sa.private_key, { algorithm: "RS256" });
  const resp = await fetch(
    sa.token_uri || "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    }
  );
  if (!resp.ok) throw new Error(`Token exchange failed: ${resp.status}`);
  const data = (await resp.json()) as { access_token: string };
  return data.access_token;
}

/** Google Wallet Pass-Update (patch loyaltyObject messages). */
async function sendGoogleWalletUpdate(
  customer: PushCustomer,
  title: string,
  message: string
): Promise<boolean> {
  try {
    const token = await getGoogleAccessToken();
    const serialShort = customer.pass_serial.slice(0, 16).replace(/-/g, "");
    const objectId = `${GOOGLE_ISSUER_ID}.${customer.tenant_slug}-${serialShort}`;
    const url = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`;
    // Balance aktualisieren (Stempel) + Nachricht hinzufügen.
    // Google-Aktualisierung nur über das `balance`-Feld sichtbar.
    const patch: Record<string, unknown> = {};
    if (typeof customer.current_stamps === "number") {
      patch.loyaltyPoints = {
        balance: { int: customer.current_stamps },
      };
    }
    patch.messages = [
      {
        header: title,
        body: message,
        messageType: "TEXT",
        displayInterval: { start: { date: nowIso() } },
      },
    ];
    const resp = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patch),
    });
    if (resp.status === 200 || resp.status === 201) {
      console.log(`[Google Wallet] Update sent for ${objectId}`);
      return true;
    }
    console.log(`[Google Wallet] Update failed: ${resp.status}`);
    return false;
  } catch (e) {
    console.log(`[Google Wallet] Update error: ${e}`);
    return false;
  }
}

// ─── Inaktivitäts-Cron ───
export async function runInactivityCron(
  tenantSlug: string | null = null
): Promise<{
  campaigns_checked: number;
  pushs_sent: number;
  pushs_skipped_optout: number;
  pushs_skipped_cooldown: number;
}> {
  const berlinNow = getBerlinNow();
  const weekday = berlinNow.getUTCDay(); // 0=So
  const weekdayShort = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][weekday];
  const weekdayLong = [
    "Sonntag", "Montag", "Dienstag", "Mittwoch",
    "Donnerstag", "Freitag", "Samstag",
  ][weekday];
  const p2 = (n: number) => String(n).padStart(2, "0");
  const nowTime = `${p2(berlinNow.getUTCHours())}:${p2(berlinNow.getUTCMinutes())}`;

  const campaigns = await prisma.loyaltyCampaign.findMany({
    where: {
      campaign_type: "inactivity",
      is_active: true,
      ...(tenantSlug
        ? { tenant_slug: tenantSlug.toLowerCase().trim() }
        : {}),
    },
  });

  const stats = {
    campaigns_checked: 0,
    pushs_sent: 0,
    pushs_skipped_optout: 0,
    pushs_skipped_cooldown: 0,
  };

  for (const campaign of campaigns) {
    stats.campaigns_checked++;

    // Day + Time-Filter
    let activeDays: string[] = [];
    try {
      activeDays = JSON.parse(campaign.active_days || "[]");
    } catch {
      activeDays = [];
    }
    if (
      activeDays.length > 0 &&
      !activeDays.includes(weekdayShort) &&
      !activeDays.includes(weekdayLong)
    ) {
      continue;
    }
    if (campaign.active_from && campaign.active_from > nowTime) continue;
    if (campaign.active_to && campaign.active_to < nowTime) continue;

    // Inaktive Kunden finden (last_visit < cutoff)
    const cutoff = new Date(berlinNow.getTime());
    cutoff.setUTCDate(cutoff.getUTCDate() - (campaign.inactivity_days ?? 14));
    const cutoffIso = cutoff.toISOString();
    const customers = await prisma.loyaltyCustomer.findMany({
      where: {
        tenant_slug: campaign.tenant_slug,
        push_opt_out: false,
        last_visit_at: { not: null, lt: cutoffIso },
      },
    });

    const cooldownMs = (campaign.min_hours_between_pushs ?? 24) * 3600 * 1000;

    for (const customer of customers) {
      // Cooldown prüfen
      if (customer.last_push_at) {
        try {
          const lastPush = new Date(customer.last_push_at.replace("Z", ""));
          if (berlinNow.getTime() - lastPush.getTime() < cooldownMs) {
            stats.pushs_skipped_cooldown++;
            continue;
          }
        } catch {
          // ungültiges Datum → kein Cooldown
        }
      }

      // last_message = saubere Nachricht + nonce increment (VOR dem Push committen)
      const updated = await prisma.loyaltyCustomer.update({
        where: { id: customer.id },
        data: {
          last_message: campaign.message.slice(0, 200),
          updated_at: nowIso(),
          msg_nonce: { increment: 1 },
        },
      });

      const success = await triggerPassUpdatePush(
        updated,
        campaign.title,
        campaign.message
      );
      await prisma.loyaltyPushLog.create({
        data: {
          tenant_slug: customer.tenant_slug,
          customer_id: customer.id,
          campaign_id: campaign.id,
          push_type: "inactivity",
          title: campaign.title,
          message: campaign.message,
          status: success ? "sent" : "failed",
          sent_at: nowIso(),
        },
      });
      if (success) {
        await prisma.loyaltyCustomer.update({
          where: { id: customer.id },
          data: {
            last_push_at: nowIso(),
            pass_needs_update: true,
            pass_updated_at: nowIso(),
          },
        });
        stats.pushs_sent++;
      }
    }
  }
  return stats;
}

// ─── Analytics (SQL-Aggregation statt Python-Loop, Legacy C7) ───
export async function getCustomerAnalytics(tenantSlug: string) {
  const cutoff = new Date(getBerlinNow().getTime());
  cutoff.setUTCDate(cutoff.getUTCDate() - 30);
  const cutoffIso = cutoff.toISOString();

  const [
    totalCards,
    activeCards,
    totalCustomers,
    activeCustomers30d,
    rewardsAgg,
    totalStamps,
    pushsSent30d,
    pushsFailed30d,
  ] = await Promise.all([
    prisma.loyaltyCard.count({ where: { tenant_slug: tenantSlug } }),
    prisma.loyaltyCard.count({
      where: { tenant_slug: tenantSlug, is_active: true },
    }),
    prisma.loyaltyCustomer.count({ where: { tenant_slug: tenantSlug } }),
    prisma.loyaltyCustomer.count({
      where: {
        tenant_slug: tenantSlug,
        last_visit_at: { not: null, gt: cutoffIso },
      },
    }),
    prisma.loyaltyCustomer.aggregate({
      where: { tenant_slug: tenantSlug },
      _sum: { rewards_redeemed: true },
    }),
    prisma.loyaltyStamp.count({ where: { tenant_slug: tenantSlug } }),
    prisma.loyaltyPushLog.count({
      where: {
        tenant_slug: tenantSlug,
        status: "sent",
        sent_at: { gt: cutoffIso },
      },
    }),
    prisma.loyaltyPushLog.count({
      where: {
        tenant_slug: tenantSlug,
        status: "failed",
        sent_at: { gt: cutoffIso },
      },
    }),
  ]);

  return {
    total_cards: totalCards,
    active_cards: activeCards,
    total_customers: totalCustomers,
    active_customers_30d: activeCustomers30d,
    total_stamps: totalStamps,
    rewards_redeemed: rewardsAgg._sum.rewards_redeemed ?? 0,
    pushs_sent_30d: pushsSent30d,
    pushs_failed_30d: pushsFailed30d,
  };
}
