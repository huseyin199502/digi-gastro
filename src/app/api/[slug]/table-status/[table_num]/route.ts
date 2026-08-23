import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse } from "@/lib/adminApi";
import { getActiveTenant, parseActiveTableNum, round2 } from "@/lib/tabletOps";

export const dynamic = "force-dynamic";

// Legacy GET /api/{slug}/table-status/{table_num} (main.py ~10889)
// Liefert pending/delivered Artikel (pro Einheit expandiert) + Gesamtsumme
// für die Gäste-Menüansicht eines Tisches.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; table_num: string }> }
) {
  try {
    const { slug: rawSlug, table_num } = await params;
    const slug = rawSlug.toLowerCase().trim();
    await getActiveTenant(slug);

    // raw_num VORAB parsen — auch ohne Guest-Cookie verfügbar
    // (z. B. Admin-"Vorschau"-Modus, wo table_num "Vorschau" sein kann)
    const { num: rawNum } = parseActiveTableNum(String(table_num));

    // Session-Verifikation: Cookie-Tisch muss mit angefragtem Tisch übereinstimmen
    const sessionVal =
      (await cookies()).get(`guest_session_${slug}`)?.value ?? null;
    let isValid = true;
    let cToken: string | null = null;
    let cookieZone = "";
    if (sessionVal) {
      try {
        const idx = sessionVal.indexOf(":");
        if (idx === -1) throw new Error("bad session");
        const cTable = sessionVal.slice(0, idx);
        const cTok = sessionVal.slice(idx + 1);
        const parsed = parseActiveTableNum(cTable);
        if (parsed.num !== rawNum) {
          isValid = false;
        } else {
          cToken = cTok;
          cookieZone = parsed.zone;
        }
      } catch {
        isValid = false;
      }
    }
    if (!isValid) {
      throw new ApiError("Kein Zugriff auf diesen Tisch.", 403);
    }

    // Tisch-Lookup (Priorität: token+zone → token → zone → erste)
    const dbTablesForNum = await prisma.table.findMany({
      where: { tenant_slug: slug, number: rawNum },
      orderBy: { id: "asc" },
    });

    let dbTable: (typeof dbTablesForNum)[number] | null = null;
    if (cToken) {
      if (cookieZone) {
        dbTable =
          dbTablesForNum.find(
            (t) => t.zone === cookieZone && t.active_session_token === cToken
          ) ?? null;
      }
      if (!dbTable) {
        dbTable =
          dbTablesForNum.find((t) => t.active_session_token === cToken) ??
          null;
      }
    }
    if (!dbTable) {
      if (cookieZone) {
        dbTable =
          dbTablesForNum.find((t) => t.zone === cookieZone) ?? null;
      }
      if (!dbTable) {
        dbTable = dbTablesForNum[0] ?? null;
      }
    }

    const zone = dbTable?.zone ?? "";
    const targetTableName = zone
      ? `Tisch ${rawNum} (${zone})`
      : `Tisch ${rawNum}`;

    // Match-Logik: o.table kann target_table_name, raw_num oder
    // "Tisch {raw_num}" sein (verschiedene Speicher-Formate historisch)
    const possibleTableNames = [targetTableName, rawNum, `Tisch ${rawNum}`];
    const dbTableOrders = await prisma.order.findMany({
      where: {
        tenant_slug: slug,
        table: { in: possibleTableNames },
        status: { notIn: ["bezahlt", "storniert"] },
      },
      orderBy: { id: "asc" },
      include: { items: { orderBy: { id: "asc" } } },
    });

    const pending: Record<string, unknown>[] = [];
    const delivered: Record<string, unknown>[] = [];
    let total = 0.0;

    for (const order of dbTableOrders) {
      total += order.total ?? 0.0;
      for (const item of order.items) {
        const status = item.item_status || "pending";
        const noteSlug = (item.note || "").replace(/ /g, "_");
        const qty = item.quantity ?? 1;
        // Key im Admin-Cockpit-Format (admin-script-1.html ~2163):
        // {order_id}_{pid}_{note}_{status}_{comboId}_{comboInstanceId}_{idx}
        // Leere Kombi-Teile bleiben als leerer Platzhalter erhalten, damit
        // parseItemKey/findOrderItem normale Artikel eindeutig zuordnen kann.
        const comboIdKey = item.combo_id !== null ? String(item.combo_id) : "";
        const comboInstKey = item.combo_instance_id ?? "";
        for (let idx = 0; idx < qty; idx++) {
          const key = `${order.id}_${item.product_id}_${noteSlug}_${status}_${comboIdKey}_${comboInstKey}_${idx}`;
          const itemData = {
            order_id: order.id,
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: 1,
            note: item.note || "",
            extras: item.extras || null,
            status,
            key,
            unit_index: idx,
          };
          if (status === "pending") {
            pending.push(itemData);
          } else if (status === "confirmed" || status === "delivered") {
            delivered.push(itemData);
          }
        }
      }
    }

    return NextResponse.json({
      pending,
      delivered,
      total: round2(total),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
