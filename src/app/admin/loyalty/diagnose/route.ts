import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET /admin/loyalty/diagnose (main.py ~16591)
// Diagnose von Duplikaten, verwaisten Device-Registrations und Datenqualität.
export async function GET() {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const customers = await prisma.loyaltyCustomer.findMany({
      where: { tenant_slug: slug },
    });
    const registrations = await prisma.passkitDeviceRegistration.findMany({
      where: { tenant_slug: slug },
    });

    // 1. Duplikate nach anonymous_id
    const aidGroups = new Map<string, typeof customers>();
    for (const c of customers) {
      const aid = c.anonymous_id || "NULL";
      if (!aidGroups.has(aid)) aidGroups.set(aid, []);
      aidGroups.get(aid)!.push(c);
    }
    const duplicateGroups: Record<
      string,
      { id: number; short_code: string; pass_serial: string; current_stamps: number | null }[]
    > = {};
    for (const [aid, group] of aidGroups.entries()) {
      if (group.length > 1 && aid !== "NULL") {
        duplicateGroups[aid] = group.map((c) => ({
          id: c.id,
          short_code: c.short_code ?? "",
          pass_serial: c.pass_serial.slice(0, 8) + "...",
          current_stamps: c.current_stamps,
        }));
      }
    }

    // 2. Customers ohne anonymous_id
    const noAid = customers
      .filter((c) => !c.anonymous_id)
      .map((c) => ({
        id: c.id,
        short_code: c.short_code ?? "",
        pass_serial: c.pass_serial.slice(0, 8) + "...",
      }));

    // 3. Verwaiste Device-Registrations (ohne Customer)
    const customerSerials = new Set(customers.map((c) => c.pass_serial));
    const orphanRegs = registrations
      .filter((r) => !customerSerials.has(r.pass_serial))
      .map((r) => ({
        device_id: r.device_library_identifier.slice(0, 16) + "...",
        pass_serial: r.pass_serial.slice(0, 8) + "...",
        created_at: r.created_at,
      }));

    // 4. Customers mit mehreren Geräten
    const regBySerial = new Map<string, number>();
    for (const r of registrations) {
      regBySerial.set(r.pass_serial, (regBySerial.get(r.pass_serial) ?? 0) + 1);
    }
    const multiDevice = [...regBySerial.entries()]
      .filter(([, count]) => count > 1)
      .map(([serial, count]) => {
        const c = customers.find((x) => x.pass_serial === serial);
        return {
          customer_id: c?.id ?? null,
          short_code: c?.short_code ?? "?",
          device_count: count,
        };
      });

    // 5. Statistik
    const totalStamps = customers.reduce((s, c) => s + (c.current_stamps ?? 0), 0);
    const totalRewards = customers.reduce((s, c) => s + (c.rewards_redeemed ?? 0), 0);
    const withPass = customers.filter((c) => c.pass_downloaded_at).length;
    const withStamps = customers.filter((c) => (c.current_stamps ?? 0) > 0).length;
    const withDeviceId = customers.filter((c) => c.last_known_device_id).length;

    // 6. Duplikate nach last_known_device_id
    const deviceGroups = new Map<string, typeof customers>();
    for (const c of customers) {
      const did = c.last_known_device_id;
      if (did) {
        if (!deviceGroups.has(did)) deviceGroups.set(did, []);
        deviceGroups.get(did)!.push(c);
      }
    }
    const duplicateDeviceIds: Record<string, { id: number; short_code: string }[]> = {};
    for (const [did, group] of deviceGroups.entries()) {
      if (group.length > 1) {
        duplicateDeviceIds[did] = group.map((c) => ({
          id: c.id,
          short_code: c.short_code ?? "",
        }));
      }
    }

    return NextResponse.json({
      stats: {
        total_customers: customers.length,
        total_device_registrations: registrations.length,
        customers_with_pass: withPass,
        customers_with_stamps: withStamps,
        total_stamps_active: totalStamps,
        total_rewards_redeemed: totalRewards,
        customers_with_device_id: withDeviceId,
        customers_without_device_id: customers.length - withDeviceId,
      },
      duplicate_anonymous_ids: {
        count: Object.keys(duplicateGroups).length,
        groups: duplicateGroups,
      },
      customers_without_anonymous_id: {
        count: noAid.length,
        customers: noAid,
      },
      orphan_device_registrations: {
        count: orphanRegs.length,
        registrations: orphanRegs,
      },
      multi_device_customers: {
        count: multiDevice.length,
        customers: multiDevice,
      },
      duplicate_device_ids: {
        count: Object.keys(duplicateDeviceIds).length,
        groups: duplicateDeviceIds,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}