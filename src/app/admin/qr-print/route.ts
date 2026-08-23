import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import { embedLogo, makeQrPng, resolveLogoFsPath } from "@/lib/qr";
import fs from "fs";

export const dynamic = "force-dynamic";

// Legacy GET /admin/qr-print (main.py 13653)
// Druckbare A4-Übersicht mit einem QR-Code-Block pro Tisch.
// QR-Codes inline als base64-PNG (kein externer Request beim Drucken).
// Layout: 2x2-Raster pro A4-Seite mit expliziten Seitenumbrüchen.
export async function GET(request: NextRequest) {
  const session = await getTenantSession();
  if (!session || session.role !== "chef") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  const slug = session.slug;

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const dbTables = await prisma.table.findMany({ where: { tenant_slug: slug } });
  // natural sort wie im Legacy: ["2","10"] → ["2","10"] statt ["10","2"]
  const naturalKey = (s: string): (string | number)[] =>
    String(s)
      .split(/(\d+)/)
      .map((part) => (/^\d+$/.test(part) ? parseInt(part, 10) : part.toLowerCase()));
  const tables = [...dbTables].sort((a, b) => {
    const ka = naturalKey(a.number);
    const kb = naturalKey(b.number);
    for (let i = 0; i < Math.max(ka.length, kb.length); i++) {
      const xa = ka[i];
      const xb = kb[i];
      if (xa === undefined) return -1;
      if (xb === undefined) return 1;
      if (typeof xa === "number" && typeof xb === "number") {
        if (xa !== xb) return xa - xb;
      } else if (String(xa) !== String(xb)) {
        return String(xa) < String(xb) ? -1 : 1;
      }
    }
    return 0;
  });

  // Tenant-Logo für QR-Zentrum-Overlay laden (best-effort)
  let logoFsPath: string | null = null;
  try {
    const logoUrl = tenant.logo_path ?? "";
    const candidate = resolveLogoFsPath(logoUrl);
    if (candidate && fs.existsSync(candidate)) logoFsPath = candidate;
  } catch {
    logoFsPath = null;
  }

  // X-Forwarded-Header für korrekte öffentliche URL der QR-Codes
  const reqUrl = new URL(request.url);
  const fwdProto = request.headers.get("x-forwarded-proto") ?? reqUrl.protocol.replace(":", "");
  let fwdHost =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    reqUrl.hostname;
  if (fwdHost.includes(":")) fwdHost = fwdHost.split(":")[0];
  const baseUrl = `${fwdProto}://${fwdHost}`.replace(/\/+$/, "");

  const makeQrBase64 = async (dataStr: string): Promise<string> => {
    const png = await makeQrPng(dataStr);
    let finalPng = png;
    if (logoFsPath) {
      try {
        finalPng = await embedLogo(png, logoFsPath);
      } catch {
        finalPng = png;
      }
    }
    return `data:image/png;base64,${finalPng.toString("base64")}`;
  };

  // Karten-HTML pro Tisch
  const cards: string[] = [];
  for (const t of tables) {
    const qrUrl = `${baseUrl}/${slug}?t=${encodeURIComponent(t.number)}&z=${encodeURIComponent(t.zone)}&tk=${encodeURIComponent(t.security_token)}`;
    const qrB64 = await makeQrBase64(qrUrl);
    let displayNum = t.number;
    if (String(displayNum).startsWith("Tisch ")) {
      displayNum = String(displayNum).slice("Tisch ".length).trim();
    }
    const tableDisplayName =
      `Tisch ${displayNum}` + (t.zone ? ` (${t.zone})` : "");
    cards.push(`
            <div class="qr-card">
                <div class="qr-label">${escapeHtml(tableDisplayName)}</div>
                <img src="${qrB64}" alt="QR ${escapeHtml(tableDisplayName)}" />
            </div>`);
  }

  const restaurantName = tenant.name || slug;

  // Karten in Seiten zu je 4 gruppieren (2x2), letzte Seite auffüllen
  let pagesHtml = "";
  for (let i = 0; i < cards.length; i += 4) {
    const pageCards = cards.slice(i, i + 4);
    while (pageCards.length < 4) {
      pageCards.push('<div class="qr-card" style="border:none;"></div>');
    }
    pagesHtml += '<div class="page">\n' + pageCards.join("\n") + "\n</div>\n";
  }

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <title>QR Codes drucken - ${escapeHtml(restaurantName)}</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f3f4f6;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* ── Screen-only header ── */
        .print-header {
            text-align: center;
            padding: 30px 20px 20px;
        }
        .print-header h1 {
            font-size: 22px;
            font-weight: 800;
            color: #111;
            margin: 0 0 8px;
        }
        .print-header p {
            font-size: 14px;
            color: #666;
            margin: 0 0 20px;
        }
        .print-btn {
            display: inline-block;
            padding: 12px 32px;
            background: #16a34a;
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
            font-size: 16px;
        }
        .print-btn:hover { background: #15803d; }

        /* ── Page container: each holds exactly 4 QR cards (2x2) ── */
        .page {
            width: 210mm;
            height: 297mm;
            padding: 15mm;
            margin: 0 auto 20px;
            background: #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 10mm;
        }

        /* ── Individual QR card ── */
        .qr-card {
            border: 2px solid #d1d5db;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 12px 8px 16px;
            background: #fff;
        }
        .qr-label {
            font-size: 16px;
            font-weight: 800;
            color: #111;
            margin-bottom: 8px;
            text-align: center;
            letter-spacing: 0.02em;
        }
        .qr-card img {
            width: 140px;
            height: 140px;
            display: block;
            image-rendering: pixelated;
        }

        /* ── Print styles ── */
        @media print {
            .print-header { display: none !important; }
            body { background: #fff; margin: 0; padding: 0; }
            .page {
                margin: 0;
                box-shadow: none;
                width: 100%;
                height: auto;
                page-break-after: always;
                break-after: page;
            }
            .page:last-child {
                page-break-after: auto;
                break-after: auto;
            }
            .qr-card {
                border: 1.5px solid #000;
            }
        }
    </style>
</head>
<body>
    <div class="print-header">
        <h1>QR Codes – ${escapeHtml(restaurantName)}</h1>
        <p>${tables.length} Tisch${tables.length !== 1 ? "e" : ""} zum Ausdrucken</p>
        <button class="print-btn" onclick="window.print()">Drucken</button>
    </div>
    ${pagesHtml}
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
