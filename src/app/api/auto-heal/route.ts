import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Legacy GET /api/auto-heal (main.py ~16796)
// Auto-Heal: Prüft und repariert automatisch PassKit/Wallet Probleme.
// Wird alle 5 Minuten von externem Cron-Dienst aufgerufen (autoheal.py).
// Token: AUTOHEAL_TOKEN env variable (falls nicht gesetzt, deaktiviert).
//
// Checks:
//   1. Stuck pass_needs_update (>1h) → reset
//   2. pass_downloaded_at vs device_registrations mismatch → reset
//   3. Duplikate nach device_id → merge
//   4. pass_updated_at backfill
//   5. iOS Logs Fehler-Check
//   6. Kunden-Zahl

const HOUR_MS = 3600 * 1000;
const THIRTY_MIN_MS = 30 * 60 * 1000;

function parseIso(v: string | null | undefined): number | null {
  if (!v) return null;
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : null;
}

export async function GET(request: NextRequest) {
  const expectedToken = process.env.AUTOHEAL_TOKEN || "";
  if (!expectedToken) {
    return NextResponse.json(
      { status: "disabled", message: "AUTOHEAL_TOKEN nicht gesetzt" },
      { status: 404 }
    );
  }
  const token = request.nextUrl.searchParams.get("token") || "";
  if (token !== expectedToken) {
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
  }

  const nowMs = Date.now();
  const oneHourAgo = nowMs - HOUR_MS;
  const thirtyMinAgo = nowMs - THIRTY_MIN_MS;

  const results: { checks: Record<string, unknown>[]; fixes: number; alerts: number } = {
    checks: [],
    fixes: 0,
    alerts: 0,
  };

  // CHECK 1: Stuck pass_needs_update (>1h alt)
  const stuckCustomers = await prisma.loyaltyCustomer.findMany({
    where: { pass_needs_update: true, pass_downloaded_at: { not: null } },
  });
  let stuckFixed = 0;
  for (const c of stuckCustomers) {
    if (c.pass_updated_at) {
      const updateTime = parseIso(c.pass_updated_at);
      if (updateTime !== null && updateTime < oneHourAgo) {
        await prisma.loyaltyCustomer.update({
          where: { id: c.id },
          data: { pass_needs_update: false },
        });
        stuckFixed++;
      }
    } else if (c.pass_downloaded_at) {
      await prisma.loyaltyCustomer.update({
        where: { id: c.id },
        data: { pass_updated_at: c.pass_downloaded_at, pass_needs_update: false },
      });
      stuckFixed++;
    }
  }
  results.checks.push({ name: "stuck_pass_needs_update", found: stuckCustomers.length, fixed: stuckFixed });
  results.fixes += stuckFixed;

  // CHECK 2: pass_downloaded_at vs device_registrations mismatch
  const mismatched = await prisma.loyaltyCustomer.findMany({
    where: { pass_downloaded_at: { not: null }, pass_type: "apple" },
  });
  let mismatchFixed = 0;
  for (const c of mismatched) {
    const regCount = await prisma.passkitDeviceRegistration.count({
      where: { pass_serial: c.pass_serial },
    });
    if (regCount === 0) {
      await prisma.loyaltyCustomer.update({
        where: { id: c.id },
        data: { pass_downloaded_at: null, pass_needs_update: false },
      });
      mismatchFixed++;
    }
  }
  results.checks.push({ name: "registration_mismatch", found: mismatchFixed, fixed: mismatchFixed });
  results.fixes += mismatchFixed;

  // CHECK 3: Duplikate nach device_id
  const customersWithDevice = await prisma.loyaltyCustomer.findMany({
    where: { last_known_device_id: { not: null } },
  });
  const deviceGroups = new Map<string, typeof customersWithDevice>();
  for (const c of customersWithDevice) {
    const did = c.last_known_device_id!;
    const list = deviceGroups.get(did) ?? [];
    list.push(c);
    deviceGroups.set(did, list);
  }
  const dupGroups = [...deviceGroups.entries()].filter(([, v]) => v.length > 1);
  let dupMerged = 0;
  const tierOrder: Record<string, number> = { neu: 0, stamm: 1, vip: 2 };
  for (const [, group] of dupGroups) {
    const sorted = [...group].sort((a, b) => a.id - b.id);
    const master = sorted[0];
    for (const dup of sorted.slice(1)) {
      const mergedStamps = (master.current_stamps ?? 0) + (dup.current_stamps ?? 0);
      await prisma.loyaltyCustomer.update({
        where: { id: master.id },
        data: {
          current_stamps: Math.min(mergedStamps, 99),
          total_stamps_earned: (master.total_stamps_earned ?? 0) + (dup.total_stamps_earned ?? 0),
          rewards_redeemed: (master.rewards_redeemed ?? 0) + (dup.rewards_redeemed ?? 0),
          ...((tierOrder[dup.tier ?? "neu"] ?? 0) > (tierOrder[master.tier ?? "neu"] ?? 0)
            ? { tier: dup.tier }
            : {}),
        },
      });
      await prisma.loyaltyCustomer.update({
        where: { id: dup.id },
        data: { last_known_device_id: null, pass_needs_update: false },
      });
      dupMerged++;
    }
  }
  results.checks.push({ name: "duplicate_device_ids", groups: dupGroups.length, merged: dupMerged });
  results.fixes += dupMerged;

  // CHECK 4: pass_updated_at backfill
  const needsBackfill = await prisma.loyaltyCustomer.findMany({
    where: { pass_updated_at: null, pass_downloaded_at: { not: null } },
  });
  let backfillCount = 0;
  for (const c of needsBackfill) {
    await prisma.loyaltyCustomer.update({
      where: { id: c.id },
      data: { pass_updated_at: c.pass_downloaded_at },
    });
    backfillCount++;
  }
  results.checks.push({ name: "pass_updated_at_backfill", filled: backfillCount });
  results.fixes += backfillCount;

  // CHECK 5: iOS Logs in letzten 30 Min
  const recentLogs = await prisma.passkitLog.findMany({
    where: { created_at: { gte: new Date(thirtyMinAgo).toISOString() } },
  });
  let errorCount = 0;
  for (const log of recentLogs) {
    try {
      const entries = log.logs ? (JSON.parse(log.logs) as unknown) : [];
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          if (
            typeof entry === "string" &&
            (entry.toLowerCase().includes("error") || entry.toLowerCase().includes("spurious"))
          ) {
            errorCount++;
          }
        }
      }
    } catch {
      // ignore malformed logs
    }
  }
  results.checks.push({ name: "ios_logs_30min", total: recentLogs.length, errors: errorCount });
  results.alerts += errorCount;

  // CHECK 6: Kunden-Zahl
  const totalCustomers = await prisma.loyaltyCustomer.count();
  results.checks.push({ name: "customer_count", total: totalCustomers });

  // CHECK 7: Chat-Retention — Nachrichten nach 7 Tagen löschen (DSGVO)
  const sevenDaysAgo = new Date(nowMs - 7 * 24 * HOUR_MS);
  const chatDeleted = await prisma.chatMessage.deleteMany({
    where: { created_at: { lt: sevenDaysAgo } },
  });
  results.checks.push({
    name: "chat_retention_7d",
    deleted: chatDeleted.count,
  });
  results.fixes += chatDeleted.count;

  console.log(
    `[Auto-Heal] ${results.fixes} fixes, ${results.alerts} alerts, ${totalCustomers} customers`
  );
  return NextResponse.json(results);
}