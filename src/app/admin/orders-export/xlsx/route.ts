import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getTenantSession } from "@/lib/auth";
import { getActiveTenant } from "@/lib/tabletOps";
import { errorResponse } from "@/lib/adminApi";
import { getBerlinNow } from "@/lib/time";
import {
  buildFilterText,
  filterOrdersForExport,
  getDisplayTotal,
  loadAllOrdersForExport,
} from "@/lib/reports";

export const dynamic = "force-dynamic";

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
  name: "Calibri",
};
const HEADER_FILL: ExcelJS.FillPattern = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF064E3B" },
};
const HEADER_ALIGN: Partial<ExcelJS.Alignment> = {
  horizontal: "left",
  vertical: "middle",
  wrapText: true,
};
const TOTAL_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FF064E3B" },
  size: 11,
};
const TOTAL_FILL: ExcelJS.FillPattern = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFD1FAE5" },
};
const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFE5E7EB" } },
  left: { style: "thin", color: { argb: "FFE5E7EB" } },
  bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
  right: { style: "thin", color: { argb: "FFE5E7EB" } },
};

// Legacy GET /admin/orders-export/xlsx (main.py 13225)
// Export der gefilterten Bestellungen als Excel — für Buchhaltung & Steuerberater.
export async function GET(request: NextRequest) {
  try {
    const session = await getTenantSession();
    if (!session || session.role !== "chef") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const slug = session.slug;

    const tenant = await getActiveTenant(slug);
    const allOrders = await loadAllOrdersForExport(slug);
    const priceMode = tenant.price_mode ?? "brutto";
    const restaurantName = tenant.name || slug;

    const url = new URL(request.url);
    const params = {
      range: url.searchParams.get("range") ?? "today",
      status: url.searchParams.get("status") ?? "all",
      frm: url.searchParams.get("frm") ?? "",
      to: url.searchParams.get("to") ?? "",
      table: url.searchParams.get("table") ?? "all",
      search: url.searchParams.get("search") ?? "",
    };
    const orders = filterOrdersForExport(allOrders, params);

    const now = getBerlinNow();
    const p2 = (n: number) => String(n).padStart(2, "0");
    const nowStr = `${p2(now.getUTCDate())}.${p2(now.getUTCMonth() + 1)}.${now.getUTCFullYear()} ${p2(now.getUTCHours())}:${p2(now.getUTCMinutes())}`;
    const filterText = buildFilterText(params);

    const wb = new ExcelJS.Workbook();

    // ── Sheet 1: Bestellungen ──
    const ws = wb.addWorksheet("Bestellungen");
    const hasMwst = priceMode !== "netto";
    const colCount = hasMwst ? 7 : 6;

    // Title row
    ws.mergeCells(1, 1, 1, colCount);
    const titleCell = ws.getCell(1, 1);
    titleCell.value = `Bestellreport — ${restaurantName}`;
    titleCell.font = { bold: true, size: 14, color: { argb: "FF064E3B" } };
    titleCell.alignment = { horizontal: "left", vertical: "middle" };
    ws.getRow(1).height = 24;

    // Filter info row
    ws.mergeCells(2, 1, 2, colCount);
    const infoCell = ws.getCell(2, 1);
    infoCell.value = `${filterText}  ·  Erstellt am: ${nowStr}  ·  Preis-Modus: ${priceMode.charAt(0).toUpperCase() + priceMode.slice(1)}`;
    infoCell.font = { size: 9, color: { argb: "FF666666" }, italic: true };
    infoCell.alignment = { horizontal: "left", vertical: "middle" };
    ws.getRow(2).height = 16;
    ws.getRow(3).height = 6;

    // Header row (row 4)
    const headerRow = 4;
    const headers = ["Bon ID", "Tisch", "Zeitstempel", "Status"];
    if (hasMwst) headers.push("MwSt");
    headers.push("Gesamt (€)", "Original-Warenwert (€)");
    headers.forEach((h, idx) => {
      const cell = ws.getCell(headerRow, idx + 1);
      cell.value = h;
      cell.font = HEADER_FONT;
      cell.fill = HEADER_FILL;
      cell.alignment = HEADER_ALIGN;
      cell.border = THIN_BORDER;
    });
    ws.getRow(headerRow).height = 28;

    // Data rows
    const dataStart = headerRow + 1;
    orders.forEach((o, rowOffset) => {
      const row = dataStart + rowOffset;
      let col = 1;
      ws.getCell(row, col++).value = `#${o.id}`;
      ws.getCell(row, col++).value = String(o.table);
      ws.getCell(row, col++).value = String(o.timestamp);
      ws.getCell(row, col++).value = o.status
        ? o.status.charAt(0).toUpperCase() + o.status.slice(1)
        : "";
      if (hasMwst) {
        ws.getCell(row, col++).value = `${o.mwst_rate ?? 19}%`;
      }
      const displayTotal = getDisplayTotal(o);
      const gesamtCol = col;
      ws.getCell(row, col++).value = displayTotal;
      const origCol = col;
      ws.getCell(row, col++).value = o.original_total ?? displayTotal;

      for (let c = 1; c < col; c++) {
        const cell = ws.getCell(row, c);
        cell.border = THIN_BORDER;
        cell.font = { size: 10, name: "Calibri" };
        if (c === gesamtCol || c === origCol) {
          cell.numFmt = '#,##0.00 "€"';
          cell.alignment = { horizontal: "right" };
        } else if (c === 4) {
          cell.alignment = { horizontal: "left" };
        }
        if (rowOffset % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" },
          };
        }
      }
    });

    // Total row
    let totalRowIdx = dataStart + orders.length;
    if (orders.length > 0) totalRowIdx += 1; // empty row before total

    const labelCell = ws.getCell(totalRowIdx, 1);
    ws.mergeCells(totalRowIdx, 1, totalRowIdx, 3);
    labelCell.value = "GESAMT";
    labelCell.font = TOTAL_FONT;
    labelCell.fill = TOTAL_FILL;
    labelCell.alignment = { horizontal: "right", vertical: "middle" };

    // Status count
    const bezahltCount = orders.filter(
      (o) => (o.status || "").toLowerCase() === "bezahlt"
    ).length;
    const statusCell = ws.getCell(totalRowIdx, 4);
    statusCell.value = `${bezahltCount} bezahlt`;
    statusCell.font = TOTAL_FONT;
    statusCell.fill = TOTAL_FILL;

    if (hasMwst) {
      const mwstCell = ws.getCell(totalRowIdx, 5);
      mwstCell.value = "";
      mwstCell.fill = TOTAL_FILL;
    }

    // Sum of totals — NUR bezahlte Bons summieren (Legacy Bug-Fix)
    const gesamtCol = headers.length - 1;
    const origCol = headers.length;
    const paidOrders = orders.filter(
      (o) => (o.status || "").toLowerCase() === "bezahlt"
    );
    if (paidOrders.length > 0) {
      const gesamtSum = paidOrders.reduce((s, o) => s + getDisplayTotal(o), 0);
      const origSum = paidOrders.reduce(
        (s, o) => s + (o.original_total ?? getDisplayTotal(o)),
        0
      );
      ws.getCell(totalRowIdx, gesamtCol).value = Math.round(gesamtSum * 100) / 100;
      ws.getCell(totalRowIdx, origCol).value = Math.round(origSum * 100) / 100;
    }
    for (const c of [gesamtCol, origCol]) {
      const cell = ws.getCell(totalRowIdx, c);
      cell.font = TOTAL_FONT;
      cell.fill = TOTAL_FILL;
      cell.numFmt = '#,##0.00 "€"';
      cell.alignment = { horizontal: "right" };
      cell.border = { top: { style: "medium", color: { argb: "FF064E3B" } } };
    }

    // Column widths
    const widths = [10, 18, 22, 14];
    if (hasMwst) widths.push(8);
    widths.push(16, 20);
    widths.forEach((w, idx) => {
      ws.getColumn(idx + 1).width = w;
    });
    // Freeze header row
    ws.views = [{ state: "frozen", ySplit: headerRow }];

    // ── Sheet 2: Artikel-Details (eine Zeile pro Artikel) ──
    const ws2 = wb.addWorksheet("Artikel-Details");
    ws2.mergeCells("A1:I1");
    ws2.getCell("A1").value = `Artikel-Details — ${restaurantName}`;
    ws2.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF064E3B" } };
    ws2.getRow(1).height = 24;

    const itemHeaders = [
      "Bon ID", "Tisch", "Zeitstempel", "Artikel", "Kategorie",
      "MwSt (%)", "Einzelpreis (€)", "Menge", "Gesamt (€)",
    ];
    itemHeaders.forEach((h, idx) => {
      const cell = ws2.getCell(3, idx + 1);
      cell.value = h;
      cell.font = HEADER_FONT;
      cell.fill = HEADER_FILL;
      cell.alignment = HEADER_ALIGN;
      cell.border = THIN_BORDER;
    });
    ws2.getRow(3).height = 28;

    let itemRow = 4;
    for (const o of orders) {
      const oId = `#${o.id}`;
      const oTable = String(o.table);
      const oTimestamp = String(o.timestamp);
      if (o.items.length === 0) {
        // Wenn keine Artikel mehr (z.B. pay-item everything), trotzdem eine Zeile
        [oId, oTable, oTimestamp, "(keine Artikel)", "", "", "", "", ""].forEach(
          (val, idx) => {
            const cell = ws2.getCell(itemRow, idx + 1);
            cell.value = val;
            cell.border = THIN_BORDER;
            cell.font = { size: 10, italic: true, color: { argb: "FF9CA3AF" } };
          }
        );
        itemRow += 1;
      } else {
        for (const item of o.items) {
          const itemCat = (item.category_type || "küche").toLowerCase();
          const itemMwst = itemCat === "bar" ? 19 : 7;
          const categoryLabel =
            { küche: "Küche", bar: "Bar", shisha: "Shisha" }[itemCat] ??
            itemCat.charAt(0).toUpperCase() + itemCat.slice(1);
          const price = item.price || 0;
          const qty = item.quantity || 1;
          // Im Netto-Modus: Nettopreis aus Brutto-Preis berechnen
          const exportPrice =
            priceMode === "netto"
              ? Math.round((price / (itemCat === "bar" ? 1.19 : 1.07)) * 10000) / 10000
              : price;
          const lineTotal = Math.round(exportPrice * qty * 100) / 100;

          const values: (string | number)[] = [
            oId, oTable, oTimestamp,
            item.name, categoryLabel, itemMwst,
            exportPrice, qty, lineTotal,
          ];
          values.forEach((val, idx) => {
            const cell = ws2.getCell(itemRow, idx + 1);
            cell.value = val;
            cell.border = THIN_BORDER;
            cell.font = { size: 10, name: "Calibri" };
            if (idx + 1 === 7 || idx + 1 === 9) {
              cell.numFmt = '#,##0.00 "€"';
              cell.alignment = { horizontal: "right" };
            }
          });
          itemRow += 1;
        }
      }
    }
    [10, 14, 22, 28, 12, 10, 16, 8, 16].forEach((w, idx) => {
      ws2.getColumn(idx + 1).width = w;
    });
    ws2.views = [{ state: "frozen", ySplit: 3 }];

    // ── Sheet 3: Zusammenfassung ──
    const ws3 = wb.addWorksheet("Zusammenfassung");
    ws3.mergeCells("A1:B1");
    ws3.getCell("A1").value = "Zusammenfassung";
    ws3.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF064E3B" } };
    ws3.getRow(1).height = 24;

    const totalCount = orders.length;
    const paidCount = bezahltCount;
    const cancelledCount = orders.filter(
      (o) => (o.status || "").toLowerCase() === "storniert"
    ).length;
    const activeCount = totalCount - paidCount - cancelledCount;
    const totalRevenue = paidOrders.reduce((s, o) => s + getDisplayTotal(o), 0);
    const avgBasket = paidCount > 0 ? totalRevenue / paidCount : 0;

    const summaryRows: [string, number][] = [
      ["Bestellungen gesamt", totalCount],
      ["Davon bezahlt", paidCount],
      ["Davon aktiv", activeCount],
      ["Davon storniert", cancelledCount],
      ["Umsatz (bezahlt) in €", Math.round(totalRevenue * 100) / 100],
      ["Ø Bon-Wert in €", Math.round(avgBasket * 100) / 100],
    ];
    summaryRows.forEach(([label, value], idx) => {
      const row = 3 + idx;
      const labelCell3 = ws3.getCell(row, 1);
      labelCell3.value = label;
      labelCell3.font = { bold: true, size: 11 };
      labelCell3.alignment = { horizontal: "left", vertical: "middle" };
      const valueCell = ws3.getCell(row, 2);
      valueCell.value = value;
      valueCell.font = { size: 11 };
      valueCell.alignment = { horizontal: "right", vertical: "middle" };
      if (label.includes("€")) {
        valueCell.numFmt = '#,##0.00 "€"';
      }
      labelCell3.border = THIN_BORDER;
      valueCell.border = THIN_BORDER;
    });
    ws3.getColumn(1).width = 30;
    ws3.getColumn(2).width = 20;

    const xlsxBuffer = await wb.xlsx.writeBuffer();
    const filename = `bestellreport-${slug}-${now.getUTCFullYear()}${p2(now.getUTCMonth() + 1)}${p2(now.getUTCDate())}${p2(now.getUTCHours())}${p2(now.getUTCMinutes())}${p2(now.getUTCSeconds())}.xlsx`;
    return new NextResponse(new Uint8Array(xlsxBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=${filename}`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
