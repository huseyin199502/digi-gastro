// ──────────────────────────────────────────────────────────────────
// Etappe 5 — PDF-Reports mit pdfkit (Port der ReportLab-Layouts aus
// main.py 12555–13222): Bestellreport + Monatsreport/Umsatzreport.
// ──────────────────────────────────────────────────────────────────
import PDFDocument from "pdfkit";
import fs from "fs";

const MM = 2.83465; // 1 mm in pt

// ── Font-Registrierung (Legacy: DejaVuSans, Fallback Helvetica) ──
export function loadPdfFonts(): { regular: string; bold: string } | null {
  const candidates: [string, string][] = [
    [
      "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
      "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ],
    ["/usr/share/fonts/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"],
    ["C:\\Windows\\Fonts\\arial.ttf", "C:\\Windows\\Fonts\\arialbd.ttf"],
    ["C:\\Windows\\Fonts\\segoeui.ttf", "C:\\Windows\\Fonts\\seguisb.ttf"],
  ];
  for (const [regular, bold] of candidates) {
    try {
      // System-Font-Pfade sind absichtlich dynamisch (kein Projekt-Tracing)
      if (
        fs.existsSync(/* turbopackIgnore: true */ regular) &&
        fs.existsSync(/* turbopackIgnore: true */ bold)
      ) {
        return { regular, bold };
      }
    } catch {
      continue;
    }
  }
  return null;
}

function createDoc(opts: {
  margin: number;
  title: string;
  author: string;
}): { doc: PDFKit.PDFDocument; buffer: () => Promise<Buffer>; fonts: { regular: string; bold: string } } {
  const fonts = loadPdfFonts();
  const doc = new PDFDocument({
    size: "A4",
    margins: {
      top: opts.margin,
      bottom: opts.margin,
      left: opts.margin,
      right: opts.margin,
    },
    bufferPages: true,
    info: { Title: opts.title, Author: opts.author },
  });
  if (fonts) {
    doc.registerFont("regular", fonts.regular);
    doc.registerFont("bold", fonts.bold);
  }
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));
  const buffer = () =>
    new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.end();
    });
  return {
    doc,
    buffer,
    fonts: { regular: fonts ? "regular" : "Helvetica", bold: fonts ? "bold" : "Helvetica-Bold" },
  };
}

// ── Kleine Tabellen-Engine (ReportLab Table/TableStyle-Ersatz) ──
export interface Cell {
  text: string;
  align?: "left" | "right" | "center";
  bold?: boolean;
  color?: string;
  bg?: string;
  borderTop?: { width: number; color: string };
}

interface TableOpts {
  colWidths: number[];
  rows: Cell[][];
  fontSize: number;
  padding: number;
  headerBg?: string;
  headerColor?: string;
  stripe?: [string, string];
  gridColor?: string;
  repeatHeader?: boolean;
}

function drawTable(doc: PDFKit.PDFDocument, fonts: { regular: string; bold: string }, x: number, startY: number, opts: TableOpts): number {
  const pageBottom = doc.page.height - (doc.page.margins?.bottom ?? 40);
  const rowHeight = opts.fontSize + opts.padding * 2;
  const totalWidth = opts.colWidths.reduce((a, b) => a + b, 0);
  let y = startY;
  let rowIndex = 0;

  const drawHeader = () => {
    if (!opts.headerBg) return;
    const header = opts.rows[0];
    doc.save();
    doc.rect(x, y, totalWidth, rowHeight).fill(opts.headerBg);
    doc.restore();
    let cx = x;
    header.forEach((cell, i) => {
      doc.font(fonts.bold).fontSize(opts.fontSize).fillColor(opts.headerColor ?? "#ffffff");
      const w = opts.colWidths[i];
      drawCellText(doc, cell, cx, y, w, rowHeight, opts.fontSize);
      cx += w;
    });
    if (opts.gridColor) {
      doc.moveTo(x, y + rowHeight).lineTo(x + totalWidth, y + rowHeight).lineWidth(0.5).stroke(opts.gridColor);
    }
    y += rowHeight;
  };

  if (opts.headerBg) drawHeader();

  const startIdx = opts.headerBg ? 1 : 0;
  for (let r = startIdx; r < opts.rows.length; r++) {
    if (y + rowHeight > pageBottom) {
      doc.addPage();
      y = doc.page.margins?.top ?? 40;
      if (opts.repeatHeader) drawHeader();
    }
    const row = opts.rows[r];
    // Zeilen-Hintergrund
    let bg: string | undefined;
    const firstRowCell = row[0];
    if (firstRowCell?.bg) bg = firstRowCell.bg;
    else if (opts.stripe) bg = opts.stripe[rowIndex % 2];
    if (bg) {
      doc.save();
      doc.rect(x, y, totalWidth, rowHeight).fill(bg);
      doc.restore();
    }
    if (firstRowCell?.borderTop) {
      doc.moveTo(x, y).lineTo(x + totalWidth, y).lineWidth(firstRowCell.borderTop.width).stroke(firstRowCell.borderTop.color);
    }
    let cx = x;
    row.forEach((cell, i) => {
      doc.font(cell.bold ? fonts.bold : fonts.regular)
        .fontSize(opts.fontSize)
        .fillColor(cell.color ?? "#111827");
      drawCellText(doc, cell, cx, y, opts.colWidths[i], rowHeight, opts.fontSize);
      cx += opts.colWidths[i];
    });
    if (opts.gridColor && r < opts.rows.length - 1) {
      doc.moveTo(x, y + rowHeight).lineTo(x + totalWidth, y + rowHeight).lineWidth(0.25).stroke(opts.gridColor);
    }
    y += rowHeight;
    rowIndex++;
  }
  return y;
}

function drawCellText(
  doc: PDFKit.PDFDocument,
  cell: Cell,
  x: number,
  y: number,
  w: number,
  h: number,
  fontSize: number
) {
  const align = cell.align ?? "left";
  doc.text(cell.text, x + 3, y + (h - fontSize) / 2, {
    width: w - 6,
    height: h,
    align,
    lineBreak: false,
    ellipsis: true,
  });
}

// ════════════════════════════════════════════════════════════════
// Bestellreport (Legacy main.py 12555)
// ════════════════════════════════════════════════════════════════
export interface OrdersPdfData {
  restaurantName: string;
  slug: string;
  priceMode: string;
  filterText: string;
  nowStr: string;
  orders: {
    id: number;
    table: string;
    timestamp: string;
    status: string;
    mwstRate: number;
    total: number;
  }[];
  summary: {
    totalCount: number;
    paidCount: number;
    activeCount: number;
    cancelledCount: number;
    totalRevenue: number;
    avgBasket: number;
    paidTotal: number;
  };
  fmtEur: (v: number) => string;
}

export async function buildOrdersExportPdf(data: OrdersPdfData): Promise<Buffer> {
  const { doc, buffer, fonts } = createDoc({
    margin: 15 * MM,
    title: `Bestellreport — ${data.restaurantName}`,
    author: data.restaurantName,
  });
  const left = doc.page.margins?.left ?? 15 * MM;
  const rightEdge = doc.page.width - (doc.page.margins?.right ?? 15 * MM);
  let y = doc.page.margins?.top ?? 15 * MM;

  // Titel
  doc.font(fonts.bold).fontSize(18).fillColor("#064e3b");
  doc.text(`Bestellreport — ${data.restaurantName}`, left, y, { lineBreak: false });
  y += 22 + 4;

  // Filter-Beschreibung + Meta
  doc.font(fonts.regular).fontSize(9).fillColor("#666666");
  doc.text(data.filterText, left, y, { width: rightEdge - left });
  y = doc.y + 2;
  doc.text(
    `Erstellt am: ${data.nowStr} · Preis-Modus: ${data.priceMode.charAt(0).toUpperCase() + data.priceMode.slice(1)}`,
    left,
    y,
    { width: rightEdge - left }
  );
  y = doc.y + 10;

  // Zusammenfassung
  doc.font(fonts.bold).fontSize(11).fillColor("#1f2937");
  doc.text("Zusammenfassung", left, y, { lineBreak: false });
  y += 14 + 6;

  const s = data.summary;
  const summaryRows: Cell[][] = [
    [{ text: "Bestellungen gesamt:", bold: true, color: "#374151" }, { text: String(s.totalCount), color: "#111827" }],
    [{ text: "Davon bezahlt:", bold: true, color: "#374151" }, { text: String(s.paidCount), color: "#111827" }],
    [{ text: "Davon aktiv:", bold: true, color: "#374151" }, { text: String(s.activeCount), color: "#111827" }],
    [{ text: "Davon storniert:", bold: true, color: "#374151" }, { text: String(s.cancelledCount), color: "#111827" }],
    [{ text: "Umsatz (bezahlt):", bold: true, color: "#374151" }, { text: data.fmtEur(s.totalRevenue), color: "#111827" }],
    [{ text: "Ø Bon-Wert:", bold: true, color: "#374151" }, { text: data.fmtEur(s.avgBasket), color: "#111827" }],
  ];
  // Linien ober-/unterhalb der Zusammenfassung
  doc.moveTo(left, y).lineTo(left + 130 * MM, y).lineWidth(0.5).stroke("#9ca3af");
  y = drawTable(doc, fonts, left, y, {
    colWidths: [80 * MM, 50 * MM],
    rows: summaryRows,
    fontSize: 9,
    padding: 4,
  });
  doc.moveTo(left, y).lineTo(left + 130 * MM, y).lineWidth(0.5).stroke("#9ca3af");
  y += 10;

  // Bestellungen im Detail
  doc.font(fonts.bold).fontSize(11).fillColor("#1f2937");
  doc.text("Bestellungen im Detail", left, y, { lineBreak: false });
  y += 14 + 6;

  const hasMwst = data.priceMode !== "netto";
  const header: Cell[] = [
    { text: "Bon ID", bold: true },
    { text: "Tisch", bold: true },
    { text: "Zeitstempel", bold: true },
    { text: "Status", bold: true },
  ];
  if (hasMwst) header.push({ text: "MwSt", bold: true });
  header.push({ text: "Gesamt", bold: true, align: "right" });

  const rows: Cell[][] = [header];
  for (const o of data.orders) {
    const row: Cell[] = [
      { text: `#${o.id}` },
      { text: String(o.table) },
      { text: String(o.timestamp) },
      { text: o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1) : "" },
    ];
    if (hasMwst) row.push({ text: `${o.mwstRate}%` });
    row.push({ text: data.fmtEur(o.total), align: "right" });
    rows.push(row);
  }
  // Total row — NUR bezahlte Bons summieren (Legacy Bug-Fix C5)
  const totalRow: Cell[] = [
    { text: "", bg: "#d1fae5", bold: true, color: "#064e3b", borderTop: { width: 1, color: "#064e3b" } },
    { text: "", bg: "#d1fae5", bold: true, color: "#064e3b" },
    { text: "", bg: "#d1fae5", bold: true, color: "#064e3b" },
    { text: "GESAMT", bg: "#d1fae5", bold: true, color: "#064e3b" },
  ];
  if (hasMwst) totalRow.push({ text: "", bg: "#d1fae5", bold: true, color: "#064e3b" });
  totalRow.push({ text: data.fmtEur(s.paidTotal), bg: "#d1fae5", bold: true, color: "#064e3b", align: "right" });
  rows.push(totalRow);

  const colWidths = hasMwst
    ? [20 * MM, 30 * MM, 38 * MM, 25 * MM, 15 * MM, 30 * MM]
    : [22 * MM, 33 * MM, 42 * MM, 28 * MM, 35 * MM];

  y = drawTable(doc, fonts, left, y, {
    colWidths,
    rows,
    fontSize: 8.5,
    padding: 5,
    headerBg: "#064e3b",
    headerColor: "#ffffff",
    stripe: ["#ffffff", "#f9fafb"],
    gridColor: "#e5e7eb",
    repeatHeader: true,
  });

  // Footer note
  y += 14;
  const pageBottom = doc.page.height - (doc.page.margins?.bottom ?? 15 * MM);
  if (y + 10 > pageBottom) {
    doc.addPage();
    y = doc.page.margins?.top ?? 15 * MM;
  }
  doc.font(fonts.regular).fontSize(7).fillColor("#9ca3af");
  doc.text(
    `Dieser Report wurde maschinell erstellt — ${data.restaurantName} · digi-gastro.de`,
    left,
    y,
    { width: rightEdge - left, align: "center" }
  );

  return buffer();
}

// ════════════════════════════════════════════════════════════════
// Monats-/Umsatzreport (Legacy main.py 12818)
// ════════════════════════════════════════════════════════════════
export interface MonatsreportPdfData {
  restaurantName: string;
  fromStr: string; // dd.mm.yyyy
  toStr: string;
  nowStr: string;
  totalRevenue: number;
  totalBons: number;
  avgBasket: number;
  topTables: { name: string; count: number; revenue: number; pct: number; bar: string }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  daily: { day: string; count: number; revenue: number }[];
  fmtEur: (v: number) => string;
  fmtPct: (v: number) => string;
}

export async function buildMonatsreportPdf(data: MonatsreportPdfData): Promise<Buffer> {
  const { doc, buffer, fonts } = createDoc({
    margin: 18 * MM,
    title: `Umsatzreport — ${data.restaurantName}`,
    author: data.restaurantName,
  });
  const left = doc.page.margins?.left ?? 18 * MM;
  const contentWidth = doc.page.width - (left + (doc.page.margins?.right ?? 18 * MM));
  let y = doc.page.margins?.top ?? 18 * MM;

  // ── Header ──
  doc.font(fonts.bold).fontSize(20).fillColor("#0f172a");
  doc.text(data.restaurantName, left, y, { lineBreak: false });
  y += 24 + 2;
  doc.font(fonts.regular).fontSize(11).fillColor("#64748b");
  doc.text("Umsatzreport", left, y, { lineBreak: false });
  y += 14 + 14;
  doc.font(fonts.regular).fontSize(8).fillColor("#94a3b8");
  doc.text(`Zeitraum: ${data.fromStr} – ${data.toStr}`, left, y, { lineBreak: false });
  y += 11 + 1;
  doc.text(`Erstellt am: ${data.nowStr}`, left, y, { lineBreak: false });
  y += 11 + 10;

  // ── Großer Gesamtumsatz-Block ──
  const boxHeight = 12 * 2 + 12 + 32 + 12;
  doc.save();
  doc.rect(left, y, contentWidth, boxHeight).fillAndStroke("#f0fdf4", "#bbf7d0");
  doc.restore();
  doc.font(fonts.bold).fontSize(9).fillColor("#64748b");
  doc.text("GESAMTUMSATZ", left + 18, y + 12, { lineBreak: false });
  doc.font(fonts.bold).fontSize(28).fillColor("#064e3b");
  doc.text(data.fmtEur(data.totalRevenue), left + 18, y + 12 + 12 + 4, { lineBreak: false });
  doc.font(fonts.regular).fontSize(9).fillColor("#64748b");
  doc.text(
    `${data.totalBons} Bons · Ø ${data.fmtEur(data.avgBasket)} pro Bon`,
    left + 18,
    y + 12 + 12 + 4 + 32 + 4,
    { lineBreak: false }
  );
  y += boxHeight + 18;

  const section = (title: string) => {
    doc.font(fonts.bold).fontSize(12).fillColor("#0f172a");
    doc.text(title, left, y, { lineBreak: false });
    y += 15 + 8;
  };

  // ── Zusammenfassung ──
  section("Zusammenfassung");
  doc.moveTo(left, y).lineTo(left + contentWidth, y).lineWidth(0.4).stroke("#cbd5e1");
  y = drawTable(doc, fonts, left, y, {
    colWidths: [100 * MM, 70 * MM],
    rows: [
      [{ text: "Bestellungen gesamt:", bold: true, color: "#475569" }, { text: String(data.totalBons), color: "#0f172a" }],
      [{ text: "Bezahlt:", bold: true, color: "#475569" }, { text: String(data.totalBons), color: "#0f172a" }],
      [{ text: "Ø Bon-Wert:", bold: true, color: "#475569" }, { text: data.fmtEur(data.avgBasket), color: "#0f172a" }],
    ],
    fontSize: 9,
    padding: 5,
  });
  doc.moveTo(left, y).lineTo(left + contentWidth, y).lineWidth(0.4).stroke("#cbd5e1");
  y += 14;

  const boxedTable = (colWidths: number[], rows: Cell[][], opts?: { totalRow?: boolean }) => {
    const w = colWidths.reduce((a, b) => a + b, 0);
    doc.save();
    doc.rect(left, y, w, (rows.length) * 19).lineWidth(0.4).stroke("#cbd5e1");
    doc.restore();
    y = drawTable(doc, fonts, left, y, {
      colWidths,
      rows,
      fontSize: 9,
      padding: 5,
      headerBg: "#f1f5f9",
      headerColor: "#475569",
      gridColor: "#e2e8f0",
      repeatHeader: false,
    });
    void opts;
    y += 14;
  };

  // ── Top-Tische ──
  if (data.topTables.length > 0) {
    section("Umsatz nach Tisch (Top 5)");
    const rows: Cell[][] = [
      [
        { text: "Tisch", bold: true },
        { text: "Bons", bold: true, align: "right" },
        { text: "Umsatz", bold: true, align: "right" },
        { text: "Anteil", bold: true },
      ],
    ];
    for (const t of data.topTables) {
      rows.push([
        { text: t.name },
        { text: String(t.count), align: "right" },
        { text: data.fmtEur(t.revenue), align: "right" },
        { text: `${data.fmtPct(t.pct)}  ${t.bar}` },
      ]);
    }
    boxedTable([55 * MM, 20 * MM, 35 * MM, 60 * MM], rows);
  }

  // ── Top-Produkte ──
  if (data.topProducts.length > 0) {
    section("Top-Produkte");
    const rows: Cell[][] = [
      [
        { text: "#", bold: true, align: "center" },
        { text: "Produkt", bold: true },
        { text: "Menge", bold: true, align: "right" },
        { text: "Umsatz", bold: true, align: "right" },
      ],
    ];
    data.topProducts.forEach((p, i) => {
      rows.push([
        { text: String(i + 1), align: "center" },
        { text: p.name },
        { text: String(p.qty), align: "right" },
        { text: data.fmtEur(p.revenue), align: "right" },
      ]);
    });
    boxedTable([10 * MM, 85 * MM, 25 * MM, 50 * MM], rows);
  }

  // ── Tägliche Umsätze ──
  if (data.daily.length > 0) {
    section("Tägliche Umsätze");
    const rows: Cell[][] = [
      [
        { text: "Datum", bold: true },
        { text: "Bons", bold: true, align: "right" },
        { text: "Umsatz", bold: true, align: "right" },
      ],
    ];
    for (const d of data.daily) {
      rows.push([
        { text: d.day },
        { text: String(d.count), align: "right" },
        { text: data.fmtEur(d.revenue), align: "right" },
      ]);
    }
    rows.push([
      { text: "GESAMT", bold: true, color: "#92400e", bg: "#fef3c7", borderTop: { width: 0.6, color: "#92400e" } },
      { text: String(data.totalBons), bold: true, color: "#92400e", bg: "#fef3c7", align: "right" },
      { text: data.fmtEur(data.totalRevenue), bold: true, color: "#92400e", bg: "#fef3c7", align: "right" },
    ]);
    boxedTable([60 * MM, 30 * MM, 50 * MM], rows);
  }

  y += 16;

  // ── Footer: Unterschrift-Linie + Branding ──
  const pageBottom = doc.page.height - (doc.page.margins?.bottom ?? 18 * MM);
  if (y + 45 > pageBottom) {
    doc.addPage();
    y = doc.page.margins?.top ?? 18 * MM;
  }
  doc.font(fonts.regular).fontSize(9).fillColor("#64748b");
  doc.text("Ort/Datum: ____________________", left, y + 20, { width: 85 * MM, lineBreak: false });
  doc.text("Unterschrift: ____________________", left + 85 * MM, y + 20, { width: 85 * MM, lineBreak: false });
  y += 20 + 12 + 12;
  doc.font(fonts.regular).fontSize(8).fillColor("#94a3b8");
  doc.text("Generiert von digi-gastro · digi-gastro.de", left, y, {
    width: contentWidth,
    align: "center",
  });

  return buffer();
}
