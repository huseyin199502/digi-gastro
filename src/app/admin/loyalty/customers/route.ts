import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";
import { generateShortCode } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

// Legacy GET /admin/loyalty/customers (main.py ~16309)
export async function GET(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug.toLowerCase().trim();

    const page = Math.max(
      1,
      parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10) || 1
    );
    const perPageRaw = parseInt(
      request.nextUrl.searchParams.get("per_page") ?? "25",
      10
    );
    const perPage =
      Number.isFinite(perPageRaw) && perPageRaw >= 1 && perPageRaw <= 100
        ? perPageRaw
        : 25;

    // Backfill: Customers ohne short_code bekommen einen (Legacy-Heal)
    const withoutCode = await prisma.loyaltyCustomer.findMany({
      where: {
        tenant_slug: slug,
        OR: [{ short_code: "" }, { short_code: null }],
      },
      select: { id: true },
    });
    for (const c of withoutCode) {
      await prisma.loyaltyCustomer.update({
        where: { id: c.id },
        data: { short_code: generateShortCode() },
      });
    }

    const total = await prisma.loyaltyCustomer.count({
      where: { tenant_slug: slug },
    });
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    const customers = await prisma.loyaltyCustomer.findMany({
      where: { tenant_slug: slug },
      orderBy: { id: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const cardIds = Array.from(
      new Set(
        customers
          .map((c) => c.card_id)
          .filter((id): id is number => id !== null && id !== undefined)
      )
    );
    const cards = cardIds.length
      ? await prisma.loyaltyCard.findMany({ where: { id: { in: cardIds } } })
      : [];
    const cardById = new Map(cards.map((card) => [card.id, card]));

    const serials = customers.map((c) => c.pass_serial);
    const regs = serials.length
      ? await prisma.passkitDeviceRegistration.findMany({
          where: { pass_serial: { in: serials } },
          select: { pass_serial: true },
        })
      : [];
    const regCounts = new Map<string, number>();
    for (const reg of regs) {
      regCounts.set(
        reg.pass_serial,
        (regCounts.get(reg.pass_serial) ?? 0) + 1
      );
    }

    const items = customers.map((c) => {
      const card = c.card_id ? cardById.get(c.card_id) : undefined;
      return {
        id: c.id,
        pass_serial: c.pass_serial.slice(0, 8) + "…",
        short_code: c.short_code,
        pass_type: c.pass_type,
        current_stamps: c.current_stamps,
        total_stamps_earned: c.total_stamps_earned,
        rewards_redeemed: c.rewards_redeemed,
        tier: c.tier || "neu",
        nickname: c.nickname,
        last_message: c.last_message || "Willkommen!",
        first_visit_at: c.first_visit_at,
        last_visit_at: c.last_visit_at,
        push_opt_out: c.push_opt_out,
        pass_downloaded_at: c.pass_downloaded_at,
        has_device_registration: (regCounts.get(c.pass_serial) ?? 0) > 0,
        stamps_required: card?.stamps_required || 10,
        card_name: card?.name || "Stempelkarte",
        reward_name: card?.reward_name || "Belohnung",
      };
    });

    return NextResponse.json({
      customers: items,
      pagination: { page, per_page: perPage, total, total_pages: totalPages },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
