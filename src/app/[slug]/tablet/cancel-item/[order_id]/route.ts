import { NextRequest, NextResponse } from "next/server";
import { ApiError, errorResponse } from "@/lib/adminApi";
import {
  findOrderItem,
  loadOrder,
  updateOrderStatusByItems,
} from "@/lib/orderItems";
import {
  getActiveTenant,
  maybeRotateTableSessionToken,
  persistOrderOps,
  round2,
  resolveEmployeeForCancel,
  tabletAuth,
} from "@/lib/tabletOps";
import { publishEvent } from "@/lib/eventBus";
import { consumeVoucherIfTableEmpty } from "@/lib/voucherReset";

export const dynamic = "force-dynamic";

// Legacy POST /{slug}/tablet/cancel-item/{order_id} (main.py ~7316)
// Body JSON: { "item_key": str, "quantity": int, "pin": str? }
// Idempotenz: abgeschlossene Bestellung / fehlender Artikel → 200 mit
// already_cancelled (verhindert Panik-Zweitbestellungen, "Wasser doppelt
// gebucht"-Bug).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; order_id: string }> }
) {
  try {
    const { slug: rawSlug, order_id } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const orderId = parseInt(order_id, 10);

    await getActiveTenant(slug);

    // 1. POS/chef/kellner auth (ohne Fehlerabbruch)
    let auth = null as Awaited<ReturnType<typeof tabletAuth>> | null;
    try {
      auth = await tabletAuth(slug, ["chef", "kellner"]);
    } catch {
      auth = null;
    }

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      throw new ApiError("Ungültiges JSON-Format", 400);
    }
    const itemKey = String(payload.item_key ?? "");
    const requestedQty = parseInt(String(payload.quantity ?? "1"), 10) || 1;
    const pin =
      payload.pin === undefined || payload.pin === null
        ? null
        : String(payload.pin);

    // 2. PIN fallback
    const employee = await resolveEmployeeForCancel(
      slug,
      auth ?? { viaPos: false, session: null },
      pin,
      "Mitarbeiter-PIN erforderlich.",
      "Ungültige PIN."
    );

    const order = Number.isFinite(orderId)
      ? await loadOrder(slug, orderId)
      : null;
    if (!order) throw new ApiError("Bestellung nicht gefunden.", 404);

    if (order.status === "bezahlt" || order.status === "storniert") {
      // Idempotenz: bereits abgeschlossen → 200 OK mit Hinweis
      await persistOrderOps(slug, {
        audit: [
          {
            name: employee.name,
            role: employee.role,
            action: `Storno-Versuch (bereits erledigt) für Bestellung #${orderId}`,
            details: `Tisch: ${order.table}, Status: ${order.status}. Bestellung ist bereits abgeschlossen — vermutlich vorheriger Storno erfolgreich.`,
          },
        ],
      });
      return NextResponse.json({
        success: true,
        already_cancelled: true,
        detail: `Bestellung ist bereits ${order.status}`,
      });
    }

    const matchedItem = findOrderItem(order.items, itemKey, orderId);
    if (!matchedItem) {
      // Idempotenz-Schutz: Artikel vermutlich bereits storniert
      let itemPid: number | null = null;
      try {
        let keyStr = itemKey;
        const prefix = `${orderId}_`;
        if (keyStr.startsWith(prefix)) keyStr = keyStr.slice(prefix.length);
        const parts = keyStr.split("_");
        if (parts.length > 0 && /^\d+$/.test(parts[0])) {
          itemPid = parseInt(parts[0], 10);
        }
      } catch {
        // ignore
      }
      await persistOrderOps(slug, {
        audit: [
          {
            name: employee.name,
            role: employee.role,
            action: `Storno-Versuch (bereits erledigt) für Artikel in Bestellung #${orderId}`,
            details: `Tisch: ${order.table}, item_key: ${itemKey}, product_id: ${itemPid}. Artikel wurde nicht gefunden — vermutlich bereits storniert.`,
          },
        ],
      });
      return NextResponse.json({
        success: true,
        already_cancelled: true,
        detail: "Artikel wurde bereits storniert",
      });
    }

    // Negative-Quantity-Prüfung — verhindert dass quantity WÄCHST statt sinkt
    if (requestedQty <= 0) {
      throw new ApiError(
        "Ungültige Menge für Storno — muss > 0 sein.",
        400
      );
    }

    // Identische Produkte sind getrennte Zeilen → über mehrere identische
    // Zeilen stornieren, bis die gewünschte Menge erfüllt ist.
    let remainingQty = requestedQty;
    let cancelledAmount = 0;
    let cancelledName = "Artikel";
    let totalCancelledQty = 0;
    while (remainingQty > 0) {
      const m = findOrderItem(order.items, itemKey, orderId);
      if (!m) break;
      const take = Math.min(remainingQty, m.quantity);
      if (take <= 0) break;
      cancelledAmount = round2(cancelledAmount + take * m.price);
      cancelledName = m.name ?? "Artikel";
      totalCancelledQty += take;
      remainingQty -= take;
      m.quantity -= take;
      if (m.quantity <= 0) {
        order.items = order.items.filter((i) => i !== m);
      }
    }
    const qtyToCancel = totalCancelledQty;
    if (qtyToCancel <= 0) {
      throw new ApiError(
        "Ungültige Menge für Storno — muss > 0 sein.",
        400
      );
    }
    const cancelledItemName = cancelledName;

    order.total = round2(
      order.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    );
    order.total_with_tip = round2(order.total + (order.tip_amount || 0));

    const emptied = order.items.length === 0;
    if (emptied) {
      order.status = "storniert";
    } else {
      updateOrderStatusByItems(order);
    }

    await persistOrderOps(slug, {
      updates: [order],
      audit: [
        {
          name: employee.name,
          role: employee.role,
          action: `Stornierung von ${qtyToCancel}x ${cancelledItemName} (Bestellung #${orderId})`,
          details: `Tisch: ${order.table}, Betrag: ${cancelledAmount} € storniert.`,
        },
      ],
    });

    if (emptied) {
      await maybeRotateTableSessionToken(slug, order.table);
      await consumeVoucherIfTableEmpty(slug, order.table);
    }

    publishEvent(slug, { type: "update" });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
