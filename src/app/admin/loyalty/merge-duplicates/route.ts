import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";
import { triggerPassUpdatePush } from "@/lib/loyalty";
import { nowIso } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

const TIER_ORDER: Record<string, number> = { neu: 0, stamm: 1, vip: 2 };

type Customer = Awaited<
  ReturnType<typeof prisma.loyaltyCustomer.findMany>
>[number];

// Legacy GET+POST /admin/loyalty/merge-duplicates (main.py ~16938)
async function mergeDuplicates() {
  const session = await requireChef();
  const slug = session.slug.toLowerCase().trim();

  const customers = await prisma.loyaltyCustomer.findMany({
    where: { tenant_slug: slug },
  });

  // Signatur = anonymous_id (stabilste) ODER last_known_device_id
  const getSignature = (c: Customer): string => {
    const aid = c.anonymous_id || "";
    const did = c.last_known_device_id || "";
    if (!aid && !did) return `UNIQUE_${c.id}`;
    if (aid) return `AID_${aid}`;
    return `DID_${did}`;
  };

  const signatureGroups = new Map<string, Customer[]>();
  for (const c of customers) {
    const sig = getSignature(c);
    const group = signatureGroups.get(sig) ?? [];
    group.push(c);
    signatureGroups.set(sig, group);
  }
  const duplicateGroups = Array.from(signatureGroups.entries()).filter(
    ([, g]) => g.length > 1
  );

  let mergedCount = 0;
  const mergedDetails: Array<Record<string, unknown>> = [];
  let reactivatedMasters = 0;

  for (const [sig, group] of duplicateGroups) {
    // Master: neueste mit device_id, sonst neueste insgesamt
    const withDevice = group.filter((c) => c.last_known_device_id);
    const pool = withDevice.length > 0 ? withDevice : group;
    const master = [...pool].sort((a, b) => b.id - a.id)[0];
    const duplicates = group.filter((c) => c.id !== master.id);

    const masterStampsBefore = master.current_stamps ?? 0;
    const card = master.card_id
      ? await prisma.loyaltyCard.findFirst({ where: { id: master.card_id } })
      : null;
    const stampsLimit = card ? (card.stamps_required ?? 10) * 2 : 20;

    let masterStamps = masterStampsBefore;
    let masterTotalEarned = master.total_stamps_earned ?? 0;
    let masterRewards = master.rewards_redeemed ?? 0;
    let masterDeviceId = master.last_known_device_id;
    let masterFirstVisit = master.first_visit_at;
    let masterLastVisit = master.last_visit_at;
    let masterTier = master.tier ?? "neu";

    for (const dup of duplicates) {
      masterStamps = Math.min(
        masterStamps + (dup.current_stamps ?? 0),
        stampsLimit
      );
      masterTotalEarned += dup.total_stamps_earned ?? 0;
      masterRewards += dup.rewards_redeemed ?? 0;
      if (!masterDeviceId && dup.last_known_device_id) {
        masterDeviceId = dup.last_known_device_id;
      }
      if (
        dup.first_visit_at &&
        (!masterFirstVisit || dup.first_visit_at < masterFirstVisit)
      ) {
        masterFirstVisit = dup.first_visit_at;
      }
      if (
        dup.last_visit_at &&
        (!masterLastVisit || dup.last_visit_at > masterLastVisit)
      ) {
        masterLastVisit = dup.last_visit_at;
      }
      if ((TIER_ORDER[dup.tier ?? "neu"] ?? 0) > (TIER_ORDER[masterTier] ?? 0)) {
        masterTier = dup.tier ?? masterTier;
      }

      // Duplikant deaktivieren
      await prisma.loyaltyCustomer.update({
        where: { id: dup.id },
        data: { last_known_device_id: null, pass_needs_update: false },
      });

      mergedCount += 1;
      mergedDetails.push({
        signature: sig.slice(0, 32) + (sig.length > 32 ? "..." : ""),
        master_id: master.id,
        master_code: master.short_code,
        master_stamps_after: masterStamps,
        duplicate_id: dup.id,
        duplicate_code: dup.short_code,
        duplicate_stamps_moved: dup.current_stamps ?? 0,
        master_stamps_before: masterStampsBefore,
      });
    }

    // Master: Update + Push
    const now = nowIso();
    const stampsRequiredStr = card?.stamps_required ?? 10;
    await prisma.loyaltyCustomer.update({
      where: { id: master.id },
      data: {
        current_stamps: masterStamps,
        total_stamps_earned: masterTotalEarned,
        rewards_redeemed: masterRewards,
        last_known_device_id: masterDeviceId,
        first_visit_at: masterFirstVisit,
        last_visit_at: masterLastVisit,
        tier: masterTier,
        pass_needs_update: true,
        pass_updated_at: now,
        updated_at: now,
        last_message: `✅ Stempel zusammengeführt: ${masterStamps}/${stampsRequiredStr}`,
        msg_nonce: (master.msg_nonce ?? 0) + 1,
      },
    });

    // APNs Push nur wenn Master device_reg hat
    const masterHasReg =
      (await prisma.passkitDeviceRegistration.count({
        where: { pass_serial: master.pass_serial },
      })) > 0;
    if (masterHasReg) {
      const fresh = await prisma.loyaltyCustomer.findUniqueOrThrow({
        where: { id: master.id },
      });
      const pushSuccess = await triggerPassUpdatePush(
        fresh,
        "Stempel aktualisiert",
        `✅ Du hast jetzt ${masterStamps} Stempel!`
      );
      if (pushSuccess) {
        reactivatedMasters += 1;
      }
    }
  }

  return NextResponse.json({
    success: true,
    duplicate_groups_found: duplicateGroups.length,
    duplicates_merged: mergedCount,
    masters_pushed: reactivatedMasters,
    strategy:
      "Signatur = anonymous_id ODER last_known_device_id; Master = neueste mit device_id",
    details: mergedDetails,
    message: `${mergedCount} Duplikate in ${duplicateGroups.length} Gruppen zusammengeführt. Master-Pushs: ${reactivatedMasters}.`,
  });
}

export async function GET() {
  try {
    return await mergeDuplicates();
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST() {
  try {
    return await mergeDuplicates();
  } catch (err) {
    return errorResponse(err);
  }
}
