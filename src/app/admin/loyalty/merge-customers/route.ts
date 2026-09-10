import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChef } from "@/lib/adminApi";
import { findCustomerByShortCode, normalizeShortCode, triggerPassUpdatePush } from "@/lib/loyalty";
import { nowIso } from "@/lib/walletPass";

export const dynamic = "force-dynamic";

// Manuelles Zusammenführen von Mehrfach-Karten eines Gastes
// (z.B. altes iPhone + neues Android-Handy → zwei Kundenreihen).
// Body: { master_id, duplicate_id? , duplicate_code? }
// master_id = Karte, die behalten wird; Stempel/Nachweise des Duplikats
// werden übertragen, das Duplikat danach gelöscht (alte Pass-Karte auf dem
// Zweitgerät wird beim nächsten Abruf ungültig).
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug.toLowerCase().trim();

    const payload = (await request.json().catch(() => ({}))) as {
      master_id?: number;
      duplicate_id?: number;
      duplicate_code?: string;
    };

    const masterId = Number(payload.master_id);
    if (!Number.isInteger(masterId) || masterId <= 0) {
      throw new ApiError("Ungültige master_id.", 400);
    }

    const master = await prisma.loyaltyCustomer.findFirst({
      where: { id: masterId, tenant_slug: slug },
    });
    if (!master) throw new ApiError("Ziel-Kunde nicht gefunden.", 404);

    let dup: Awaited<ReturnType<typeof prisma.loyaltyCustomer.findFirst>> = null;
    if (Number.isInteger(Number(payload.duplicate_id))) {
      dup = await prisma.loyaltyCustomer.findFirst({
        where: { id: Number(payload.duplicate_id), tenant_slug: slug },
      });
    } else if (payload.duplicate_code) {
      const code = normalizeShortCode(String(payload.duplicate_code));
      dup = await findCustomerByShortCode(slug, code);
    }
    if (!dup) throw new ApiError("Duplikat-Kunde nicht gefunden.", 404);
    if (dup.id === master.id) {
      throw new ApiError("Kann Karte nicht mit sich selbst zusammenführen.", 400);
    }

    const card = await prisma.loyaltyCard.findUnique({
      where: { id: master.card_id },
    });
    const stampsRequired = card?.stamps_required ?? 10;

    const combined = (master.current_stamps ?? 0) + (dup.current_stamps ?? 0);
    const newStamps = Math.min(combined, stampsRequired);
    const newTotal = (master.total_stamps_earned ?? 0) + (dup.total_stamps_earned ?? 0);
    const newRewards = (master.rewards_redeemed ?? 0) + (dup.rewards_redeemed ?? 0);
    const tier = newTotal >= 10 ? "vip" : newTotal >= 3 ? "stamm" : "neu";
    const now = nowIso();

    await prisma.$transaction([
      // Stempelnachweise des Duplikats auf den Master umhängen
      prisma.loyaltyStamp.updateMany({
        where: { customer_id: dup.id },
        data: { customer_id: master.id },
      }),
      // Alte Geräte-Registrations des Duplikats löschen (Pass wird ungültig)
      prisma.passkitDeviceRegistration.deleteMany({
        where: { pass_serial: dup.pass_serial },
      }),
      prisma.loyaltyCustomer.update({
        where: { id: master.id },
        data: {
          current_stamps: newStamps,
          total_stamps_earned: newTotal,
          rewards_redeemed: newRewards,
          tier,
          first_visit_at:
            master.first_visit_at && dup.first_visit_at
              ? (master.first_visit_at < dup.first_visit_at ? master.first_visit_at : dup.first_visit_at)
              : (master.first_visit_at || dup.first_visit_at),
          last_visit_at:
            master.last_visit_at && dup.last_visit_at
              ? (master.last_visit_at > dup.last_visit_at ? master.last_visit_at : dup.last_visit_at)
              : (master.last_visit_at || dup.last_visit_at),
          nickname: master.nickname || dup.nickname,
          pass_needs_update: true,
          pass_updated_at: now,
          updated_at: now,
          last_message: `✅ Stempel zusammengeführt: ${newStamps}/${stampsRequired}`,
          msg_nonce: (master.msg_nonce ?? 0) + 1,
        },
      }),
      prisma.loyaltyCustomer.delete({ where: { id: dup.id } }),
    ]);

    let pushSent = false;
    try {
      const fresh = await prisma.loyaltyCustomer.findUniqueOrThrow({
        where: { id: master.id },
      });
      pushSent = await triggerPassUpdatePush(
        fresh,
        card?.name ?? "Stempelkarte",
        `✅ Deine Stempel wurden zusammengeführt (${newStamps}/${stampsRequired}).`
      );
    } catch (e) {
      console.log(`[Loyalty] Merge push failed (non-fatal): ${e}`);
    }

    return NextResponse.json({
      success: true,
      master_id: master.id,
      master_code: master.short_code,
      duplicate_id: dup.id,
      duplicate_code: dup.short_code,
      current_stamps: newStamps,
      stamps_required: stampsRequired,
      total_stamps_earned: newTotal,
      rewards_redeemed: newRewards,
      push_sent: pushSent,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
