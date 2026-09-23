import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse } from "@/lib/adminApi";
import { loadOrder, updateOrderStatusByItems } from "@/lib/orderItems";
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
import { publishEvent } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

// Legacy POST /{slug}/tablet/transfer-order (main.py ~7573)
// Body JSON: { "order_id": int, "target_table": str }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();

    await getActiveTenant(slug);
    const auth = await tabletAuth(slug, ["chef", "kellner"]);
    const empName = auth.session?.name || "POS-Tablet";
    const empRole = auth.session?.role || "pos";

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    const orderId = parseInt(String(payload.order_id), 10);

    const order = Number.isFinite(orderId)
      ? await loadOrder(slug, orderId)
      : null;
    if (!order) throw new ApiError("Bestellung nicht gefunden.", 404);
    if (order.status === "bezahlt" || order.status === "storniert") {
      throw new ApiError("Bestellung ist bereits abgeschlossen.", 400);
    }

    // Audit Issue 3.27: Source==Target-Schutz
    const sourceTableStr = String(order.table ?? "");

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

    if (possibleTables.includes(sourceTableStr)) {
      throw new ApiError("Quell- und Zieltisch sind identisch.", 400);
    }

    const openOrders = await loadOpenOrders(slug);
    const targetOrder =
      openOrders.find(
        (o) => o.id !== order.id && possibleTables.includes(o.table)
      ) ?? null;

    let movedOriginalTotal = 0.0;
    const ops: Parameters<typeof persistOrderOps>[1] = { audit: [] };

    if (targetOrder) {
      // Merge items from the source order into target_order
      for (const item of order.items) {
        const sourceStatus = item.item_status || "pending";
        const pidStr = String(item.product_id);
        // legacy: .strip().replace(" ", "_") (kein \s+-Ersetzung hier)
        const noteSlug = (item.note ?? "").trim().replace(/ /g, "_");

        const tItem = targetOrder.items.find(
          (i) =>
            String(i.product_id) === pidStr &&
            (i.note ?? "").trim().replace(/ /g, "_") === noteSlug &&
            (i.item_status || "pending") === sourceStatus &&
            i.combo_id === item.combo_id &&
            i.combo_instance_id === item.combo_instance_id
        );
        if (tItem) {
          tItem.quantity += item.quantity;
        } else {
          targetOrder.items.push({ ...item });
        }
      }

      // Audit Issue 3.7: nur den NOCH OFFENEN Warenwert übertragen
      // (original_total enthält ggf. bereits bezahlte Positionen → sonst Doppelzählung)
      ensureOriginalTotal(targetOrder);
      ensureOriginalTotal(order);
      const movedOpenValue = round2(order.total ?? 0);
      targetOrder.original_total = round2(
        (targetOrder.original_total ?? 0) + movedOpenValue
      );

      // Audit Issue 3.10: tip_amount zusammenführen
      targetOrder.tip_amount = round2(
        (targetOrder.tip_amount ?? 0) + (order.tip_amount ?? 0)
      );

      // waiter_id erhalten, falls Ziel noch keinen hat
      if (!targetOrder.waiter_id && order.waiter_id) {
        targetOrder.waiter_id = order.waiter_id;
      }

      recalculateOrderTotals(targetOrder);
      updateOrderStatusByItems(targetOrder);

      movedOriginalTotal = movedOpenValue;

      ops.updates = [targetOrder];
      ops.deletes = [order.id];
    } else {
      // Just update the table name of the order
      order.table = targetTableStr;
      movedOriginalTotal = 0.0;
      ops.updates = [order];
    }

    ops.audit = [
      {
        name: empName,
        role: empRole,
        action: `Tisch-Umbuchung Bestellung #${order.id} von ${sourceTableStr} nach ${targetTableStr}`,
        details: `Original-Warenwert verschoben: ${movedOriginalTotal} €`,
      },
    ];

    await persistOrderOps(slug, ops);

    // Token-Sync: dynamischen Gast-Session-Token übertragen
    const [sDbTable, tDbTable] = await Promise.all([
      prisma.table.findFirst({
        where: {
          tenant_slug: slug,
          number: parseActiveTableNum(sourceTableStr).num,
        },
      }),
      prisma.table.findFirst({
        where: { tenant_slug: slug, number: targetNum },
      }),
    ]);
    if (sDbTable && tDbTable) {
      await prisma.table.update({
        where: { id: tDbTable.id },
        data: { active_session_token: sDbTable.active_session_token },
      });
    }

    publishEvent(slug, { type: "refresh_tables" });

    return NextResponse.json({ success: true, new_table: targetTableStr });
  } catch (err) {
    return errorResponse(err);
  }
}
