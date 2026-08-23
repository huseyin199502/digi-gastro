// ──────────────────────────────────────────────────────────────────
// QR-Code-Erzeugung mit optionalem Logo-Overlay.
// Geteilt von /api/qr (PNG) und /admin/qr-print (base64-HTML).
// Legacy-Semantik: ERROR_CORRECT_H, box_size=10, border=2,
// Logo 30% der QR-Größe mit Helligkeitsprüfung (main.py 9240 / 13703).
// ──────────────────────────────────────────────────────────────────
import QRCode from "qrcode";
import path from "path";

export const QR_OPTIONS = {
  errorCorrectionLevel: "H",
  scale: 10,
  margin: 2,
  color: { dark: "#000000", light: "#ffffff" },
} as const;

export async function makeQrPng(data: string): Promise<Buffer> {
  return QRCode.toBuffer(data, QR_OPTIONS);
}

export async function makeQrBase64(data: string): Promise<string> {
  const png = await makeQrPng(data);
  return `data:image/png;base64,${png.toString("base64")}`;
}

/** Logo-URL eines Tenants → Dateisystem-Pfad (oder null). */
export function resolveLogoFsPath(logoUrl: string | null | undefined): string | null {
  const url = logoUrl ?? "";
  if (!url) return null;
  if (url.startsWith("/uploads/")) {
    return path.join(process.cwd(), "public", "uploads", url.slice("/uploads/".length));
  }
  if (url.startsWith("/static/")) {
    return path.join(process.cwd(), "public", url.slice(1));
  }
  return null;
}

// Logo-Overlay wie im Legacy: 30% der QR-Größe, Helligkeitsprüfung
// (avg > 180 → dunkler Hintergrund), 8px Padding, 1px Rahmen.
export async function embedLogo(qrPng: Buffer, logoFsPath: string): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const qrMeta = await sharp(qrPng).metadata();
  const qrWidth = qrMeta.width ?? 0;
  const qrHeight = qrMeta.height ?? 0;
  if (!qrWidth || !qrHeight) return qrPng;

  const logoMax = Math.floor(Math.min(qrWidth, qrHeight) * 0.3);
  const logoImg = sharp(logoFsPath).ensureAlpha().resize(logoMax, logoMax, {
    fit: "inside",
    withoutEnlargement: true,
  });
  const logoMeta = await logoImg.metadata();
  const logoW = logoMeta.width ?? 0;
  const logoH = logoMeta.height ?? 0;
  if (!logoW || !logoH) return qrPng;
  const logoBuffer = await logoImg.png().toBuffer();

  // Helligkeit der opaken Pixel prüfen (alpha >= 128)
  const rgba = await sharp(logoBuffer).ensureAlpha().raw().toBuffer();
  let sum = 0;
  let count = 0;
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    if (rgba[i + 3] >= 128) {
      sum += (rgba[i] + rgba[i + 1] + rgba[i + 2]) / 3;
      count++;
    }
  }
  const logoIsLight = count > 0 ? sum / count > 180 : true;
  const bgColor = logoIsLight
    ? { r: 30, g: 30, b: 30, alpha: 1 }
    : { r: 255, g: 255, b: 255, alpha: 1 };
  const borderColor = logoIsLight ? "rgb(60,60,60)" : "rgb(180,180,180)";

  // Logo auf Hintergrundfarbe flatten (Transparenz korrekt komponieren)
  const flattened = await sharp({
    create: { width: logoW, height: logoH, channels: 4, background: bgColor },
  })
    .composite([{ input: logoBuffer }])
    .png()
    .toBuffer();

  // Hintergrund mit Padding + 1px-Rahmen
  const padding = 8;
  const bgSize = Math.max(logoW, logoH) + padding * 2;
  const borderSvg = `<svg width="${bgSize}" height="${bgSize}"><rect x="1" y="1" width="${bgSize - 2}" height="${bgSize - 2}" fill="none" stroke="${borderColor}" stroke-width="1"/></svg>`;
  const bg = await sharp({
    create: { width: bgSize, height: bgSize, channels: 4, background: bgColor },
  })
    .composite([
      { input: Buffer.from(borderSvg) },
      { input: flattened, gravity: "center" },
    ])
    .png()
    .toBuffer();

  // Zentriert auf den QR-Code
  return sharp(qrPng)
    .ensureAlpha()
    .composite([{ input: bg, gravity: "center" }])
    .png()
    .toBuffer();
}
