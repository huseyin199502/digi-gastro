import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { errorResponse, requirePlatformAdmin } from "@/lib/adminApi";
import { platformError, platformSuccess } from "@/lib/platformAdmin";
import { berlinTimestamp } from "@/lib/time";

export const dynamic = "force-dynamic";

// Legacy POST /digi-gastro-admin/tenant-cleanup-orders/{slug_key} (main.py ~5110)
// Form fields: mode ("all" | "before_date" | "cancelled"), cutoff_date (YYYY-MM-DD)
// Writes a JSON backup before hard-deleting; recalculates tenant revenue counters.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug_key: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { slug_key } = await params;
    const slugLower = slug_key.toLowerCase().trim();

    let fields: Record<string, unknown>;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      fields = await request.json();
    } else {
      const form = await request.formData();
      fields = Object.fromEntries(form.entries());
    }
    const mode = String(fields.mode ?? "");
    const cutoffDate = String(fields.cutoff_date ?? "") || null;

    const tenant = await prisma.tenant.findUnique({ where: { slug: slugLower } });
    if (!tenant) return platformError(request, "Tenant nicht gefunden");

    if (!["all", "before_date", "cancelled"].includes(mode)) {
      return platformError(request, "Ungueltiger Modus");
    }
    let cutoffMs: number | null = null;
    if (mode === "before_date") {
      if (!cutoffDate) return platformError(request, "Datum erforderlich");
      const parsed = new Date(`${cutoffDate}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        return platformError(request, "Ungueltiges Datum");
      }
      cutoffMs = parsed.getTime();
    }

    // Load ALL orders directly from DB (legacy CRITICAL FIX C9 — no LIMIT 200)
    const allOrders = await prisma.order.findMany({
      where: { tenant_slug: slugLower },
      orderBy: { id: "asc" },
      select: { id: true, table: true, total: true, status: true, timestamp: true, waiter_id: true, tip_amount: true },
    });

    const ordersToDelete: typeof allOrders = [];
    const ordersToKeep: typeof allOrders = [];
    for (const o of allOrders) {
      let deleteThis = false;
      if (mode === "all") {
        deleteThis = true;
      } else if (mode === "cancelled") {
        deleteThis = (o.status ?? "").toLowerCase() === "storniert";
      } else if (mode === "before_date" && cutoffMs !== null) {
        // legacy timestamp format "YYYY-MM-DD HH:MM:SS" (Berlin local time)
        const orderMs = new Date((o.timestamp ?? "").replace(" ", "T")).getTime();
        deleteThis = !Number.isNaN(orderMs) && orderMs < cutoffMs;
      }
      (deleteThis ? ordersToDelete : ordersToKeep).push(o);
    }

    if (ordersToDelete.length === 0) {
      return platformSuccess(
        request,
        `Keine Bestellungen zum Loeschen gefunden (${slugLower})`,
        { deleted: 0 }
      );
    }

    // ── JSON backup before hard delete (accounting duty, legacy) ──
    const backupDir =
      process.env.BACKUP_DIR && path.isAbsolute(process.env.BACKUP_DIR)
        ? process.env.BACKUP_DIR
        : path.join(process.cwd(), "data", "backups");
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestampStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const backupFilename = `${slugLower}_orders_backup_${timestampStr}_mode-${mode}.json`;
    try {
      fs.mkdirSync(backupDir, { recursive: true });
      fs.writeFileSync(
        path.join(backupDir, backupFilename),
        JSON.stringify(
          {
            tenant_slug: slugLower,
            mode,
            cutoff_date: cutoffDate,
            deleted_at: berlinTimestamp(),
            deleted_by: "admin@digi-gastro.de",
            orders_count: ordersToDelete.length,
            orders: ordersToDelete.map((o) => ({
              id: o.id,
              table: o.table,
              items: [],
              total: o.total,
              status: o.status,
              timestamp: o.timestamp,
              waiter: o.waiter_id ?? "",
              tip: o.tip_amount ?? 0,
            })),
          },
          null,
          2
        ),
        "utf-8"
      );
    } catch (e) {
      console.error(`[Cleanup] Backup fehlgeschlagen: ${e}`);
      // continue anyway — deletion is more important than backup (legacy)
    }

    // ── Hard delete in chunks (PG parameter limit, legacy CHUNK_SIZE=5000) ──
    const deletedIds = ordersToDelete.map((o) => o.id);
    const CHUNK_SIZE = 5000;
    for (let i = 0; i < deletedIds.length; i += CHUNK_SIZE) {
      const chunk = deletedIds.slice(i, i + CHUNK_SIZE);
      await prisma.orderItem.deleteMany({ where: { order_id: { in: chunk } } });
      await prisma.order.deleteMany({ where: { id: { in: chunk } } });
    }

    // ── Recalculate revenue counters from remaining "bezahlt" orders ──
    const paidKept = ordersToKeep.filter(
      (o) => (o.status ?? "").toLowerCase() === "bezahlt"
    );
    const newTagesumsatz = paidKept.reduce(
      (sum, o) => sum + (o.total ?? 0),
      0
    );
    const oldTagesumsatz = Number(tenant.tagesumsatz ?? 0);

    await prisma.$transaction([
      prisma.tenant.update({
        where: { slug: slugLower },
        data: {
          tagesumsatz: newTagesumsatz,
          bestellungen_gesamt: paidKept.length,
        },
      }),
      prisma.revenueAdjustment.create({
        data: {
          tenant_slug: slugLower,
          adjustment: -(oldTagesumsatz - newTagesumsatz),
          old_value: oldTagesumsatz,
          new_value: newTagesumsatz,
          adjusted_by: "admin@digi-gastro.de (cleanup)",
          adjusted_at: berlinTimestamp(),
        },
      }),
    ]);

    const modeLabels: Record<string, string> = {
      all: "alle Bestellungen",
      before_date: `Bestellungen vor ${cutoffDate}`,
      cancelled: "stornierte Bestellungen",
    };
    return platformSuccess(
      request,
      `${ordersToDelete.length} ${modeLabels[mode] ?? "Bestellungen"} von <b>${slugLower}</b> gelöscht. Backup: ${backupFilename}`,
      { deleted: ordersToDelete.length, backup: backupFilename }
    );
  } catch (err) {
    return errorResponse(err);
  }
}
