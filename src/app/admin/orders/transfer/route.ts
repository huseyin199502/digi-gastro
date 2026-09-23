import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, requireChefOrKellner } from "@/lib/adminApi";
import { isValidIdempotencyKey, withLock } from "@/lib/idempotency";
import {
  MutableOrder,
  nextDailyBonNumber,
} from "@/lib/orderItems";
import {
  ensureOriginalTotal,
  findOpenOrdersByTable,
  loadOpenOrders,
  parseActiveTableNum,
  persistOrderOps,
  recalculateOrderTotals,
  round2,
} from "@/lib/tabletOps";
import { berlinTimestamp } from "@/lib/time";
import { publishEvent } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

// Legacy POST /admin/orders/transfer (main.py ~14265)
// Body JSON: { source_table, target_table, item_keys?: [str], items?: {key: qty}, idempotency_key: str }
export async function POST(request: NextRequest) {
  try {
    const session = await requireChefOrKellner();
    const slug = session.slug;

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    const itemKeys = Array.isArray(payload.item_keys)
      ? (payload.item_keys as unknown[]).map(String)
      : null;
    if (itemKeys && itemKeys.length === 0) {
      throw new ApiError(
        "Bitte zuerst die umzubuchende Produkte auswählen.",
        400
      );
    }
    const itemsMap =
      payload.items && typeof payload.items === "object" && !Array.isArray(payload.items)
        ? (payload.items as Record<string, unknown>)
        : null;
    const transferIdempotencyKey =
      typeof payload.idempotency_key === "string" ? payload.idempotency_key : null;
    if (!isValidIdempotencyKey(transferIdempotencyKey)) {
      throw new ApiError("Fehlender oder ungültiger Umbuchungs-Key.", 400);
    }

    // Zone aus Tisch-String extrahieren — "Tisch 1 (Draußen)" → num/zone
    const s = parseActiveTableNum(String(payload.source_table ?? ""));
    const t = parseActiveTableNum(String(payload.target_table ?? ""));

    const normalizedItemsMap = itemsMap
      ? Object.fromEntries(
          Object.entries(itemsMap).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        )
      : null;
    const transferFingerprint = createHash("sha256")
      .update(
        JSON.stringify({
          source_table: String(payload.source_table ?? ""),
          target_table: String(payload.target_table ?? ""),
          item_keys: itemKeys ? [...itemKeys].sort() : null,
          items: normalizedItemsMap,
        })
      )
      .digest("hex");

    const transferMarker = `transfer_idem:${transferIdempotencyKey}`;

    // Serialisiert Umbuchungen derselben Tischkombination. Damit sehen
    // parallele Wiederholungen den ersten Commit und erzeugen keine doppelten
    // Ziel-Bestellungen oder doppelten Bonnummern.
    return await withLock(
      `transfer:${slug}:${s.num}:${s.zone}:${t.num}:${t.zone}`,
      async () => {
        const existing = await prisma.auditLog.findFirst({
          where: { tenant_slug: slug, action: transferMarker },
          orderBy: { id: "desc" },
          select: { details: true },
        });
        if (existing?.details) {
          try {
            const marker = JSON.parse(existing.details) as {
              fingerprint?: unknown;
            };
            if (marker.fingerprint === transferFingerprint) {
              return NextResponse.json({ success: true, duplicate: true });
            }
          } catch {
            // Ungültiger Marker darf eine Umbuchung nicht unbemerkt doppelt ausführen.
            throw new ApiError("Doppelter Umbuchungs-Key.", 409);
          }
          throw new ApiError("Doppelter Umbuchungs-Key.", 409);
        }


    // Zone info from table database (string zone first, then DB fallback)
    const tablesList = await prisma.table.findMany({
      where: { tenant_slug: slug },
      orderBy: { id: "asc" },
    });
    const findDbTable = (num: string, zoneFromStr: string) => {
      let dbTable = zoneFromStr
        ? tablesList.find((x) => x.number === num && x.zone === zoneFromStr)
        : undefined;
      if (!dbTable) dbTable = tablesList.find((x) => x.number === num);
      return dbTable ?? null;
    };
    const sDbTable = findDbTable(s.num, s.zone);
    const tDbTable = findDbTable(t.num, t.zone);
    const sZone = sDbTable?.zone ?? "";
    const tZone = tDbTable?.zone ?? "";

    const openOrders = await loadOpenOrders(slug);

    const sourceOrders = findOpenOrdersByTable(openOrders, s.num, sZone);
    if (sourceOrders.length === 0) {
      throw new ApiError(
        "Keine offene Bestellung auf dem Quelltisch gefunden. Falls du es gerade versucht hast: bitte Ziel-Tisch prüfen – die Umbuchung ist evtl. bereits durch.",
        400
      );
    }

    // Retry-Schutz bei neuer Key, gleicher Ausführung: Item-IDs werden beim
    // Persistieren neu vergeben, ein Retry mit neuem Key könnte sonst erneut
    // (teil-)umbuchen. Der Ausführungs-Fingerprint enthält die Quell-Order-IDs
    // und ist daher pro Ausführung eindeutig, aber stabil über Retries.
    // (Hinweis: NICHT nur nach dem Payload-Fingerprint suchen – zwei echte
    // Umbuchungen zwischen denselben Tischen hätten denselben Payload-Hash.)
    const executionFingerprint = createHash("sha256")
      .update(
        `${transferFingerprint}|src:${sourceOrders
          .map((o) => o.id)
          .sort((a, b) => a - b)
          .join(",")}`
      )
      .digest("hex");
    const recentMarkers = await prisma.auditLog.findMany({
      where: { tenant_slug: slug, action: { startsWith: "transfer_idem:" } },
      orderBy: { id: "desc" },
      take: 200,
      select: { details: true },
    });
    for (const row of recentMarkers) {
      try {
        const m = JSON.parse(row.details ?? "") as {
          executionFingerprint?: unknown;
        };
        if (m.executionFingerprint === executionFingerprint) {
          return NextResponse.json({ success: true, duplicate: true });
        }
      } catch {
        // ignore malformed markers
      }
    }

    let targetOrder: MutableOrder | null =
      findOpenOrdersByTable(openOrders, t.num, tZone).find(
        (o) => !sourceOrders.includes(o)
      ) ?? null;

    const transferredAmounts: number[] = [];
    const ops: Parameters<typeof persistOrderOps>[1] = { audit: [] };
    const tTableDisplay = tZone ? `Tisch ${t.num} (${tZone})` : `Tisch ${t.num}`;

    if (itemKeys) {
      // Move ONLY selected items
      if (!targetOrder) {
        const { bonNumber, bonDate } = await nextDailyBonNumber(slug);
        targetOrder = {
          id: -1, // placeholder — created via ops.creates
          tenant_slug: slug,
          table: tTableDisplay,
          items: [],
          total: 0.0,
          original_total: 0.0,
          total_with_tip: 0.0,
          tip_amount: 0.0,
          status: "eingegangen",
          timestamp: berlinTimestamp(),
          mwst_rate: 19,
          waiter_id: null,
          daily_bon_number: bonNumber,
          bon_date: bonDate,
        };
        ops.creates = [
          {
            table: targetOrder.table,
            items: targetOrder.items,
            total: targetOrder.total,
            total_with_tip: targetOrder.total_with_tip,
            tip_amount: targetOrder.tip_amount,
            status: targetOrder.status,
            timestamp: targetOrder.timestamp,
            mwst_rate: targetOrder.mwst_rate,
            waiter_id: targetOrder.waiter_id,
            original_total: targetOrder.original_total,
            daily_bon_number: targetOrder.daily_bon_number,
            bon_date: targetOrder.bon_date,
            tenant_slug: slug,
          },
        ];
      } else {
        ops.updates = ops.updates ?? [];
        if (!ops.updates.includes(targetOrder)) ops.updates.push(targetOrder);
      }

      for (const sourceOrder of sourceOrders) {
        // Issue 3.5: Track the actually-transferred amount per source order
        let sourceTransferred = 0.0;
        const remainingItems = [];
        for (const item of sourceOrder.items) {
          const itemStatus = item.item_status || "pending";
          // Frontend macht .replace(/\s+/g, '_') ohne trim
          const noteSlug = (item.note ?? "").replace(/\s+/g, "_");

          const itemComboId = item.combo_id ?? "";
          const itemComboInst = item.combo_instance_id ?? "";
          // Eindeutig pro Zeile (item.id): Zwei identische Positionen (z.B.
          // zwei "1× Döner") erhalten getrennte Keys und werden getrennt
          // umgebucht. Fallbacks bleiben für ältere Clients ohne Item-ID.
          const uniqueKey = `${sourceOrder.id}_${item.id}_${item.product_id}_${noteSlug}_${itemStatus}_${itemComboId}_${itemComboInst}`;
          const legacyKey = `${item.product_id}_${noteSlug}_${itemStatus}_${itemComboId}_${itemComboInst}`;
          const legacyKeyNoInst = `${item.product_id}_${noteSlug}_${itemStatus}_${itemComboId}`;
          const legacyKeyNoCombo = `${item.product_id}_${noteSlug}_${itemStatus}`;

          let matchedKey: string | null = null;
          for (const k of [
            uniqueKey,
            legacyKey,
            legacyKeyNoInst,
            legacyKeyNoCombo,
          ]) {
            if (itemKeys.includes(k)) {
              matchedKey = k;
              break;
            }
          }

          if (matchedKey) {
            let qtyToMove = item.quantity ?? 0;
            if (itemsMap && matchedKey in itemsMap) {
              qtyToMove = Math.min(
                parseInt(String(itemsMap[matchedKey]), 10) || 0,
                item.quantity ?? 0
              );
            }
            if (qtyToMove <= 0) {
              remainingItems.push(item);
              continue;
            }

            sourceTransferred = round2(
              sourceTransferred + qtyToMove * (item.price ?? 0)
            );

            // Add to target order — als EIGENE Position (kein Zusammenführen
            // identischer Produkte), damit getrennte Positionen getrennt bleiben.
            targetOrder!.items.push({ ...item, quantity: qtyToMove });

            // Keep remaining quantity in source order
            const remQty = (item.quantity ?? 0) - qtyToMove;
            if (remQty > 0) {
              item.quantity = remQty;
              remainingItems.push(item);
            }
          } else {
            remainingItems.push(item);
          }
        }

        transferredAmounts.push(sourceTransferred);

        sourceOrder.items = remainingItems;
        // Issue 3.6: original_total wird NIE reduziert
        recalculateOrderTotals(sourceOrder);
        if (remainingItems.length === 0) {
          sourceOrder.status = "storniert";
        }
        ops.updates = ops.updates ?? [];
        if (!ops.updates.includes(sourceOrder)) ops.updates.push(sourceOrder);
      }

      // Issue 3.5: Add ONLY the actually-transferred amount to target
      ensureOriginalTotal(targetOrder);
      targetOrder.original_total = round2(
        (targetOrder.original_total ?? 0) +
          transferredAmounts.reduce((a, b) => a + b, 0)
      );
      recalculateOrderTotals(targetOrder);
      if (ops.creates && ops.creates.length > 0) {
        // sync the create payload with the mutated target
        const c = ops.creates[0];
        c.items = targetOrder.items;
        c.total = targetOrder.total;
        c.total_with_tip = targetOrder.total_with_tip;
        c.original_total = targetOrder.original_total;
        c.tip_amount = targetOrder.tip_amount;
        c.status = targetOrder.status;
      }
    } else {
      // Full table transfer
      ops.updates = ops.updates ?? [];
      for (const sourceOrder of sourceOrders) {
        if (!targetOrder) {
          sourceOrder.table = tTableDisplay;
          targetOrder = sourceOrder;
          // No value moved — source IS the target now (just renamed)
          transferredAmounts.push(0.0);
        } else {
          ensureOriginalTotal(sourceOrder);
          ensureOriginalTotal(targetOrder);
          // Nur den NOCH OFFENEN Warenwert übertragen (original_total kann
          // bereits bezahlte Positionen enthalten → sonst Doppelzählung)
          const movedAmount = round2(sourceOrder.total ?? 0);
          targetOrder.original_total = round2(
            (targetOrder.original_total ?? 0) + movedAmount
          );
          transferredAmounts.push(movedAmount);

          for (const sItem of sourceOrder.items) {
            // Als EIGENE Position übernehmen (kein Zusammenführen identischer
            // Produkte), damit getrennte Positionen getrennt bleiben.
            targetOrder.items.push({ ...sItem });
          }

          targetOrder.total = round2(
            targetOrder.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            )
          );
          targetOrder.total_with_tip = round2(
            targetOrder.total + (targetOrder.tip_amount || 0)
          );

          // Fix 6c: source NICHT auf 0€ setzen
          sourceOrder.status = "storniert";
          sourceOrder.items = [];
          sourceOrder.total_with_tip = round2(sourceOrder.total ?? 0);
        }
        if (!ops.updates.includes(sourceOrder)) ops.updates.push(sourceOrder);
      }
    }

    // Token-Sync (dynamischer Gast-Session-Token, nie security_token)
    const sTokTable = tablesList.find((x) => x.number === s.num) ?? null;
    const tTokTable = tablesList.find((x) => x.number === t.num) ?? null;

    const totalTransferred = round2(
      transferredAmounts.reduce((a, b) => a + b, 0)
    );
    ops.audit = [
      {
        name: session.name || "Unbekannt",
        role: session.role || "unbekannt",
        action: `Admin-Transfer von ${payload.source_table} nach ${payload.target_table}`,
        details: `Verschobener Betrag: ${totalTransferred} €`,
      },
      {
        name: "System",
        role: "system",
        action: transferMarker,
        details: JSON.stringify({
          fingerprint: transferFingerprint,
          executionFingerprint,
          source_table: String(payload.source_table ?? ""),
          target_table: String(payload.target_table ?? ""),
          moved_amount: totalTransferred,
        }),
      },
    ];

    await persistOrderOps(slug, ops);

    // Voucher: Rabatt dem Ziel-Tisch zuordnen, damit er der umgebuchten
    // Rechnung folgt und NICHT am Quelltisch hängen bleibt (sonst bekäme der
    // nächste Gast am Quelltisch den Rabatt des vorherigen).
    const sTableDisplay = sZone ? `Tisch ${s.num} (${sZone})` : `Tisch ${s.num}`;
    await prisma.voucher.updateMany({
      where: { tenant_slug: slug, status: "used", used_table: sTableDisplay },
      data: { used_table: tTableDisplay },
    });

    if (sTokTable && tTokTable) {
      await prisma.table.update({
        where: { id: tTokTable.id },
        data: { active_session_token: sTokTable.active_session_token },
      });
    }

    publishEvent(slug, { type: "refresh_tables" });

    return NextResponse.json({ success: true });
      }
    );
  } catch (err) {
    return errorResponse(err);
  }
}
