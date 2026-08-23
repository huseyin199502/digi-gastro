import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse } from "@/lib/adminApi";
import {
  ensureOriginalTotal,
  getActiveTenant,
  loadOpenOrders,
  parseActiveTableNum,
  persistOrderOps,
  readBodyFields,
  round2,
  tabletAuth,
} from "@/lib/tabletOps";
import { publishEvent } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

// Legacy POST /{slug}/tablet/tische-zusammenfuehren (main.py ~6541)
// Form/JSON body: source_table, target_table
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();

    await getActiveTenant(slug);
    const auth = await tabletAuth(slug, ["chef", "kellner"]);
    const empName = auth.session?.name || "POS-Tablet";
    const empRole = auth.session?.role || "pos";

    const fields = await readBodyFields(request);
    const sourceRaw = fields.source_table;
    const targetRaw = fields.target_table;
    if (!sourceRaw || !targetRaw) {
      throw new ApiError("Ungültige Anfrage.", 400);
    }

    const s = parseActiveTableNum(sourceRaw);
    const t = parseActiveTableNum(targetRaw);
    const sTable = s.zone ? `Tisch ${s.num} (${s.zone})` : `Tisch ${s.num}`;
    const tTable = t.zone ? `Tisch ${t.num} (${t.zone})` : `Tisch ${t.num}`;

    const openOrders = await loadOpenOrders(slug);

    // Locate active orders (match with and without zone for compatibility)
    const sourceOrder = openOrders.find(
      (o) => o.table === sTable || o.table === `Tisch ${s.num}`
    );
    if (!sourceOrder) {
      throw new ApiError(
        "Keine offene Bestellung auf dem Quelltisch gefunden.",
        400
      );
    }
    const targetOrder =
      openOrders.find(
        (o) => o !== sourceOrder && (o.table === tTable || o.table === `Tisch ${t.num}`)
      ) ?? null;

    let movedAmountForLog = 0.0;
    const mergeTargetExisted = targetOrder !== null;
    const updates = [sourceOrder];
    if (targetOrder) updates.push(targetOrder);

    if (!targetOrder) {
      // Move order directly to new table
      sourceOrder.table = tTable;
    } else {
      // Merge items — product_id + note + item_status + combo_id + combo_instance_id
      for (const sItem of sourceOrder.items) {
        const tItem = targetOrder.items.find(
          (item) =>
            item.product_id === sItem.product_id &&
            (item.note ?? "").trim() === (sItem.note ?? "").trim() &&
            (item.item_status || "pending") === (sItem.item_status || "pending") &&
            item.combo_id === sItem.combo_id &&
            item.combo_instance_id === sItem.combo_instance_id
        );
        if (tItem) {
          tItem.quantity += sItem.quantity ?? 0;
        } else {
          targetOrder.items.push({ ...sItem });
        }
      }

      // Fix 6c: original_total auf Ziel-Bestellung übertragen
      ensureOriginalTotal(sourceOrder);
      ensureOriginalTotal(targetOrder);
      const movedAmount = round2(sourceOrder.original_total ?? 0);
      targetOrder.original_total = round2(
        (targetOrder.original_total ?? 0) + movedAmount
      );
      movedAmountForLog = movedAmount;

      targetOrder.total = round2(
        targetOrder.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
      );
      targetOrder.total_with_tip = round2(targetOrder.total);

      // Fix 6c: source storniert — total NICHT auf 0 setzen!
      sourceOrder.status = "storniert";
      sourceOrder.items = [];
      sourceOrder.total_with_tip = round2(sourceOrder.total ?? 0);
    }

    // Sync dynamic guest session token (never the printed security_token)
    const [sDbTable, tDbTable] = await Promise.all([
      prisma.table.findFirst({ where: { tenant_slug: slug, number: s.num } }),
      prisma.table.findFirst({ where: { tenant_slug: slug, number: t.num } }),
    ]);

    const audit = mergeTargetExisted
      ? {
          name: empName,
          role: empRole,
          action: `Tisch-Zusammenführung ${sTable} nach ${tTable}`,
          details: `Bestellung #${sourceOrder.id}, Original-Warenwert verschoben: ${movedAmountForLog} €`,
        }
      : {
          name: empName,
          role: empRole,
          action: `Tisch-Umbenennung ${sTable} nach ${tTable}`,
          details: `Bestellung #${sourceOrder.id} (kein Ziel-Tisch vorhanden, Bestellung wurde nur verschoben)`,
        };

    await persistOrderOps(slug, { updates, audit: [audit] });

    if (sDbTable && tDbTable) {
      await prisma.table.update({
        where: { id: tDbTable.id },
        data: { active_session_token: sDbTable.active_session_token },
      });
    }

    publishEvent(slug, { type: "refresh_tables" });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
