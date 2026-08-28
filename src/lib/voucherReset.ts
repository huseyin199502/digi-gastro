import { prisma } from "./prisma";

/**
 * Konsumiert einen am Tisch eingelösten Rabatt-Voucher, sobald der Tisch keine
 * offenen Bestellungen mehr hat (egal ob durch Bezahlung, Teilzahlung oder
 * Stornierung). Verhindert, dass der nächste Gast am selben Tisch den Rabatt
 * des vorherigen Gastes erhält.
 */
export async function consumeVoucherIfTableEmpty(
  slug: string,
  table: string | null | undefined
): Promise<void> {
  if (!table) return;
  try {
    const open = await prisma.order.count({
      where: {
        tenant_slug: slug,
        table,
        status: { notIn: ["bezahlt", "storniert"] },
      },
    });
    if (open === 0) {
      await prisma.voucher.updateMany({
        where: { tenant_slug: slug, status: "used", used_table: table },
        data: { status: "consumed", used_table: null },
      });
    }
  } catch {
    /* non-fatal */
  }
}