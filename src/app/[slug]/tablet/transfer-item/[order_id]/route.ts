import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse } from "@/lib/adminApi";
import {
  findOrderItem,
  loadOrder,
  nextDailyBonNumber,
  parseItemKey,
  updateOrderStatusByItems,
} from "@/lib/orderItems";
import {
  ensureOriginalTotal,
  getActiveTenant,
  loadOpenOrders,
  parseActiveTableNum,
  persistOrderOps,
  recalculateOrderTotals,
  round2,
  tabletAuth,
} from "@/lib/tabletOps";
import { berlinTimestamp } from "@/lib/time";
import { publishEvent } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

// Legacy POST /{slug}/tablet/transfer-item/{order_id} (main.py ~7124)
// Body JSON: { "item_key": str, "target_table": str, "quantity": int }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; order_id: string }> }
) {
  try {
    const { slug: rawSlug, order_id } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const orderId = parseInt(order_id, 10);

    await getActiveTenant(slug);
    const auth = await tabletAuth(slug, ["chef", "kellner"]);
    const empName = auth.session?.name || "POS-Tablet";
    const empRole = auth.session?.role || "pos";

    const sourceOrder = Number.isFinite(orderId)
      ? await loadOrder(slug, orderId)
      : null;
    if (!sourceOrder) {
      throw new ApiError("Quell-Bestellung nicht gefunden.", 404);
    }
    if (sourceOrder.status === "bezahlt" || sourceOrder.status === "storniert") {
      throw new ApiError("Bestellung ist bereits abgeschlossen.", 400);
    }

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    const itemKey = String(payload.item_key ?? "");
    const requestedQty = parseInt(String(payload.quantity ?? "1"), 10) || 1;

    // ── Ziel-Tisch auflösen (zone-aware) ──
    const { num: targetNum, zone: targetZone } = parseActiveTableNum(
      String(payload.target_table ?? "")
    );
    let targetDbTable = null as Awaited<
      ReturnType<typeof prisma.table.findFirst>
    >;
    if (targetZone) {
      targetDbTable = await prisma.table.findFirst({
        where: { tenant_slug: slug, number: targetNum, zone: targetZone },
      });
    }
    if (!targetDbTable) {
      targetDbTable = await prisma.table.findFirst({
        where: { tenant_slug: slug, number: targetNum },
      });
    }
    if (!targetDbTable) throw new ApiError("Ziel-Tisch nicht gefunden.", 404);

    const targetTableStr = targetDbTable.zone
      ? `Tisch ${targetNum} (${targetDbTable.zone})`
      : `Tisch ${targetNum}`;
    const possibleTables = [targetTableStr, targetNum];

    // ── Quell-Artikel finden ──
    const { pid: pidStr, noteSlug } = parseItemKey(itemKey);
    const sourceItem = findOrderItem(sourceOrder.items, itemKey, orderId);
    if (!sourceItem) throw new ApiError("Artikel nicht gefunden.", 404);

    const sourceItemCopy = { ...sourceItem };

    const qtyToMove = Math.min(requestedQty, sourceItem.quantity);
    const itemAmount = round2(qtyToMove * sourceItem.price);

    // Audit Issue 3.8: keine nicht-positiven Transfer-Mengen
    if (qtyToMove <= 0) {
      throw new ApiError("Ungültige Menge für Transfer.", 400);
    }

    // Remove qty from source
    sourceItem.quantity -= qtyToMove;
    if (sourceItem.quantity <= 0) {
      sourceOrder.items = sourceOrder.items.filter((i) => i !== sourceItem);
    }

    // Fix 6c: original_total sichern — wird NIE reduziert
    ensureOriginalTotal(sourceOrder);

    // Audit Issue 3.6: Quell-Bestellung NICHT hart löschen (total=0, original_total>0)
    recalculateOrderTotals(sourceOrder);
    updateOrderStatusByItems(sourceOrder);

    // Find or create target order
    const openOrders = await loadOpenOrders(slug);
    const targetOrder =
      openOrders.find(
        (o) => o.id !== sourceOrder.id && possibleTables.includes(o.table)
      ) ?? null;

    const sourceStatus = sourceItemCopy.item_status || "pending";

    const ops: Parameters<typeof persistOrderOps>[1] = {
      updates: [sourceOrder],
      audit: [],
    };

    if (targetOrder) {
      // Merge into existing order ONLY if same status (+ combo fields)
      const tItem = targetOrder.items.find(
        (i) =>
          String(i.product_id) === pidStr &&
          (i.note ?? "").replace(/\s+/g, "_") === noteSlug &&
          (i.item_status || "pending") === sourceStatus &&
          i.combo_id === sourceItemCopy.combo_id &&
          i.combo_instance_id === sourceItemCopy.combo_instance_id
      );
      if (tItem) {
        tItem.quantity += qtyToMove;
      } else {
        targetOrder.items.push({ ...sourceItemCopy, quantity: qtyToMove });
      }
      // Fix 6c: original_total auf Ziel-Bestellung addieren
      ensureOriginalTotal(targetOrder);
      targetOrder.original_total = round2(
        (targetOrder.original_total ?? 0) + itemAmount
      );
      targetOrder.total = round2(
        targetOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      );
      targetOrder.total_with_tip = round2(targetOrder.total);
      updateOrderStatusByItems(targetOrder);
      ops.updates!.push(targetOrder);
    } else {
      // Create new order for target table (DB assigns autoincrement ID)
      const { bonNumber, bonDate } = await nextDailyBonNumber(slug);
      const newOrder = {
        table: targetTableStr,
        items: [{ ...sourceItemCopy, quantity: qtyToMove }],
        total: round2(itemAmount),
        original_total: round2(itemAmount),
        total_with_tip: round2(itemAmount),
        tip_amount: 0.0,
        status: "eingegangen",
        timestamp: berlinTimestamp(),
        mwst_rate: 19,
        waiter_id: null,
        daily_bon_number: bonNumber,
        bon_date: bonDate,
        tenant_slug: slug,
      };
      ops.creates = [newOrder];
    }

    ops.audit = [
      {
        name: empName,
        role: empRole,
        action: `Transfer ${qtyToMove}x ${sourceItemCopy.name ?? "Artikel"} von ${sourceOrder.table} nach ${targetTableStr}`,
        details: `Bestellung #${orderId}, Betrag: ${itemAmount} €`,
      },
    ];

    await persistOrderOps(slug, ops);

    // Legacy main.py ~7302: refresh_tables nach Item-Transfer
    publishEvent(slug, { type: "refresh_tables" });

    return NextResponse.json({
      success: true,
      moved_to: targetTableStr,
      qty_moved: qtyToMove,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
