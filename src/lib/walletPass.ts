/**
 * Wallet-Pass-Generierung für Loyalty (Port von loyalty.py).
 * - Apple Wallet .pkpass (pass.json, Manifest, PKCS#7-Signatur via node-forge)
 * - Google Wallet JWT (RS256, Service Account)
 * Ohne Secrets: degradierendes Dev-Mode-Verhalten (Legacy-_is_*_configured-Semantik).
 */
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import AdmZip from "adm-zip";
import forge from "node-forge";
import jwt from "jsonwebtoken";
import sharp from "sharp";

// ─── Config (Env-Vars wie im Legacy, inkl. Base64-Alternativen) ───
export const APPLE_PASS_TYPE_ID =
  process.env.APPLE_PASS_TYPE_ID || "de.digi-gastro.loyalty";
export const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID || "TEAMID123";
export const GOOGLE_ISSUER_ID =
  process.env.GOOGLE_ISSUER_ID || "33880000000000003234";
export const GOOGLE_CLASS_ID = `${GOOGLE_ISSUER_ID}.digi-gastro-loyalty`;
const APPLE_CERT_PASSWORD = process.env.APPLE_CERT_PASSWORD || "";

/** Dekodiert eine Base64-Env-Var in ein temporäres File (Legacy: _decode_secret_to_file). */
function decodeSecretToFile(envVarName: string, suffix: string): string | null {
  const b64 = (process.env[envVarName] || "").trim();
  if (!b64) return null;
  try {
    const content = Buffer.from(b64, "base64");
    const tmpPath = path.join(
      os.tmpdir(),
      `secret_${envVarName.toLowerCase()}_${crypto.randomBytes(6).toString("hex")}${suffix}`
    );
    fs.writeFileSync(tmpPath, content, { mode: 0o600 });
    return tmpPath;
  } catch (e) {
    console.log(`[Loyalty Secret] Failed to decode ${envVarName}: ${e}`);
    return null;
  }
}

export const APPLE_CERT_PATH =
  decodeSecretToFile("APPLE_CERT_B64", ".pem") ||
  process.env.APPLE_CERT_PATH ||
  "/app/secrets/apple_cert.pem";
export const APPLE_KEY_PATH =
  decodeSecretToFile("APPLE_KEY_B64", ".pem") ||
  process.env.APPLE_KEY_PATH ||
  "/app/secrets/apple_key.pem";
export const APPLE_WWDR_PATH =
  decodeSecretToFile("APPLE_WWDR_B64", ".pem") ||
  process.env.APPLE_WWDR_PATH ||
  "/app/secrets/wwdr.pem";
export const GOOGLE_SERVICE_ACCOUNT_PATH =
  decodeSecretToFile("GOOGLE_SA_B64", ".json") ||
  process.env.GOOGLE_SERVICE_ACCOUNT_PATH ||
  "/app/secrets/google_sa.json";

export function isAppleConfigured(): boolean {
  try {
    return (
      fs.existsSync(/* turbopackIgnore: true */ APPLE_CERT_PATH) &&
      fs.existsSync(/* turbopackIgnore: true */ APPLE_KEY_PATH) &&
      fs.existsSync(/* turbopackIgnore: true */ APPLE_WWDR_PATH)
    );
  } catch {
    return false;
  }
}

export function isGoogleConfigured(): boolean {
  try {
    return fs.existsSync(/* turbopackIgnore: true */ GOOGLE_SERVICE_ACCOUNT_PATH);
  } catch {
    return false;
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function appBaseUrl(): string {
  return (process.env.APP_BASE_URL || "https://digi-gastro.de").replace(/\/+$/, "");
}

/** Deterministischer 32-char-hex Auth-Token (Legacy: sha256(serial:':digi-gastro-auth')[:32]). */
export function deterministicAuthToken(serial: string): string {
  return crypto
    .createHash("sha256")
    .update(`${serial}:digi-gastro-auth`)
    .digest("hex")
    .slice(0, 32);
}

function hexToRgb(color: string): [number, number, number] {
  const h = color.replace(/^#/, "");
  if (h.length >= 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].every((v) => Number.isFinite(v))) return [r, g, b];
  }
  // BUG FIX Legacy: Fallback digi-gastro Gold
  return [201, 168, 76];
}

// ─── Apple pass.json ───
export interface PassCardDict {
  id?: number | null;
  name?: string | null;
  stamps_required?: number | null;
  reward_name?: string | null;
  color_hex?: string | null;
  icon?: string | null;
}
export interface PassCustomerDict {
  id?: number | null;
  pass_serial: string;
  current_stamps?: number | null;
  auth_token?: string;
  short_code?: string | null;
  last_message?: string | null;
  msg_nonce?: string;
}
export interface PassGeofenceDict {
  latitude: number;
  longitude: number;
  name?: string;
}

export function generateApplePassJson(
  tenantSlug: string,
  tenantName: string,
  card: PassCardDict,
  customer: PassCustomerDict,
  geofence: PassGeofenceDict | null = null,
  baseUrl?: string
): Record<string, unknown> {
  const serial = customer.pass_serial || crypto.randomUUID();
  const stampsCurrent = customer.current_stamps ?? 0;
  const stampsRequired = card.stamps_required ?? 10;
  const rewardName = card.reward_name || "Belohnung";
  const cardName = card.name || "Stempelkarte";
  const color = card.color_hex || "#C9A84C";
  const shortCode = customer.short_code || "";
  const base = (baseUrl || process.env.APP_BASE_URL || "https://digi-gastro.de").replace(/\/+$/, "");

  const [r, g, b] = hexToRgb(color);
  const rgbColor = `rgb(${r},${g},${b})`;

  let primaryValue: string;
  let primaryChange: string;
  let rewardLabel: string;
  let rewardValue: string;
  if (stampsCurrent >= stampsRequired) {
    primaryValue = `${stampsCurrent} / ${stampsRequired} ✓`;
    primaryChange = `🎉 Prämie bereit! ${rewardName} — %@`;
    rewardLabel = "PRÄMIE BEREIT";
    rewardValue = `${rewardName} — Bei deinem nächsten Besuch einlösen!`;
  } else if (stampsCurrent === 0) {
    primaryValue = `${stampsCurrent} / ${stampsRequired}`;
    primaryChange = "🎉 Neuer Stempel! Jetzt %@";
    rewardLabel = "Dein Ziel";
    rewardValue = `${rewardName} — Noch ${stampsRequired} Stempel`;
  } else {
    const remaining = stampsRequired - stampsCurrent;
    primaryValue = `${stampsCurrent} / ${stampsRequired}`;
    primaryChange = "🎉 Neuer Stempel! Jetzt %@";
    rewardLabel = "Noch bis zum Reward";
    rewardValue = `${rewardName} — Nur noch ${remaining} Stempel!`;
  }

  // Helligkeit → Text-Farbe (Kontrast)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const fgColor = brightness > 140 ? "rgb(28,28,30)" : "rgb(255,255,255)";
  const labelColor = fgColor;

  const lastMsg = customer.last_message || "Willkommen!";
  const nonce = customer.msg_nonce || "0";

  const backFields = [
    {
      key: "info",
      label: "So funktioniert's",
      value: `Bei jeder Bestellung erhältst du automatisch einen Stempel. Nach ${stampsRequired} Stempeln: ${rewardName}!`,
    },
    {
      key: "reward_info",
      label: "Deine Prämie",
      value: rewardName,
    },
    {
      key: "dsvo",
      label: "Datenschutz",
      value:
        "Diese Karte speichert keine persönlichen Daten. Du bist anonym — nur dein Pass-Code identifiziert deine Stempel. Opt-out jederzeit möglich.",
    },
    {
      key: "openmenu",
      label: "Speisekarte",
      value: `${base}/${tenantSlug}?recover=${shortCode || serial}`,
    },
    {
      key: "lastmsg",
      label: "Letzte Nachricht",
      value: lastMsg,
      changeMessage: "📬 Neue Nachricht: %@",
    },
    { key: "msgnonce", label: "Nonce", value: nonce },
  ];

  const passJson: Record<string, unknown> = {
    description: `${cardName} - ${tenantName}`,
    formatVersion: 1,
    organizationName: tenantName || "digi-gastro",
    logoText: tenantName || "digi-gastro",
    passTypeIdentifier: APPLE_PASS_TYPE_ID,
    serialNumber: serial,
    teamIdentifier: APPLE_TEAM_ID,
    webServiceURL: `${base}/api/wallet/apple`,
    authenticationToken: customer.auth_token || deterministicAuthToken(serial),
    backgroundColor: rgbColor,
    foregroundColor: fgColor,
    labelColor: labelColor,
    associatedStoreIdentifiers: [],
    storeCard: {
      headerFields: [
        {
          key: "code",
          label: "Code",
          value: shortCode || "—",
          textAlignment: "PKTextAlignmentRight",
        },
      ],
      primaryFields: [
        {
          key: "stamps",
          label: "Stempel",
          value: primaryValue,
          changeMessage: primaryChange,
        },
      ],
      secondaryFields: [
        { key: "reward", label: rewardLabel, value: rewardValue },
      ],
      auxiliaryFields: [],
      backFields,
    },
    voided: false,
    // KEIN relevantDate! (iOS expired-pass Bug — Fix aus Legacy)
    expirationDate: "2036-07-15T00:00:00+00:00",
    userInfo: {
      tenant_slug: tenantSlug,
      card_id: card.id ?? null,
      customer_id: customer.id ?? null,
    },
    barcodes: [
      {
        format: "PKBarcodeFormatQR",
        message: shortCode || serial,
        messageEncoding: "iso-8859-1",
      },
    ],
  };

  if (geofence) {
    const locName = geofence.name || tenantName || "Restaurant";
    passJson.locations = [
      {
        latitude: geofence.latitude,
        longitude: geofence.longitude,
        relevantText: `📍 ${locName} — Schau doch rein! ${stampsCurrent}/${stampsRequired} Stempel`,
      },
    ];
  }

  return passJson;
}

// ─── Manifest-Signatur (PKCS#7 via node-forge; Legacy nutzt openssl CLI) ───
export function signPassManifest(manifestBytes: Buffer): Buffer {
  if (!isAppleConfigured()) {
    return Buffer.from("DEV_MODE_NO_SIGNATURE", "utf-8");
  }
  try {
    const certPem = fs.readFileSync(APPLE_CERT_PATH, "utf-8");
    const keyPem = fs.readFileSync(APPLE_KEY_PATH, "utf-8");
    const wwdrPem = fs.readFileSync(APPLE_WWDR_PATH, "utf-8");
    const cert = forge.pki.certificateFromPem(certPem);
    const privateKey = APPLE_CERT_PASSWORD
      ? forge.pki.decryptRsaPrivateKey(keyPem, APPLE_CERT_PASSWORD)
      : forge.pki.privateKeyFromPem(keyPem);
    if (!privateKey) return Buffer.from("SIGN_ERROR", "utf-8");

    const p7 = forge.pkcs7.createSignedData();
    // EXAKT diese manifest-Bytes signieren
    p7.content = forge.util.createBuffer(
      manifestBytes.toString("binary"),
      "raw"
    );
    p7.addCertificate(cert);
    try {
      p7.addCertificate(forge.pki.certificateFromPem(wwdrPem));
    } catch {
      // WWDR evtl. kein Zertifikat — Signatur trotzdem mit eigenem Cert
    }
    p7.addSigner({
      key: privateKey,
      certificate: cert,
      digestAlgorithm: forge.pki.oids.sha1,
      authenticatedAttributes: [
        { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
        { type: forge.pki.oids.messageDigest },
        {
          type: forge.pki.oids.signingTime,
          value: new Date() as unknown as string,
        },
      ],
    });
    p7.sign({ detached: true });
    const der = forge.asn1.toDer(p7.toAsn1());
    return Buffer.from(der.getBytes(), "binary");
  } catch (e) {
    console.log(`[Apple Pass] Signing failed: ${e}`);
    return Buffer.from("SIGN_ERROR", "utf-8");
  }
}

// ─── Bilder (PIL → SVG/sharp) ───
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

/** Default-Icon: 158×158 rounded rect + weißes "S" (Legacy _generate_default_icon). */
export async function generateDefaultIcon(colorHex: string): Promise<Buffer> {
  try {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="158" height="158">
<rect x="4" y="4" width="150" height="150" rx="32" ry="32" fill="${colorHex}"/>
<text x="79" y="112" font-family="Arial, sans-serif" font-size="90" font-weight="bold" fill="#ffffff" text-anchor="middle">S</text>
</svg>`;
    return await sharp(Buffer.from(svg)).png().toBuffer();
  } catch {
    return TINY_PNG;
  }
}

function starPoints(cx: number, cy: number, outerR: number, innerR: number, points = 5, rotation = -Math.PI / 2): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = rotation + (i * Math.PI) / points;
    const rr = i % 2 === 0 ? outerR : innerR;
    pts.push(`${(cx + rr * Math.cos(angle)).toFixed(1)},${(cy + rr * Math.sin(angle)).toFixed(1)}`);
  }
  return pts.join(" ");
}

/**
 * Strip-Bild 1125×432 im getqard-Style (Legacy _generate_stamp_strip):
 * Brand-Flow, Coin mit Ringen, Glyph, Sparkles + Stempel-Sterne unten.
 */
export async function generateStampStrip(
  stampsCurrent: number,
  stampsRequired: number,
  cardIcon: string = "local_cafe",
  colorHex: string = "#C9A84C"
): Promise<Buffer> {
  try {
    const W = 1125;
    const H = 432;
    const [br, bg, bb] = hexToRgb(colorHex);
    const brand = `rgb(${br},${bg},${bb})`;
    const ccx = Math.round(W * 0.74);
    const ccy = Math.round(H * 0.36);
    const cr = 56;

    // Sterne unten (Y>280)
    const starsTop = 290;
    const starsH = H - starsTop - 14;
    const n = stampsRequired;
    const rows = n > 10 ? 2 : 1;
    const cols = Math.ceil(n / rows);
    const areaX = 40;
    const areaW = W - 80;
    const cellW = areaW / cols;
    const cellH = starsH / rows;
    const starSz = Math.min(cellW * 0.82, cellH * 0.92);

    let starsSvg = "";
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const cx = areaX + col * cellW + cellW / 2;
      const cy = starsTop + row * cellH + cellH / 2;
      const outerR = starSz / 2;
      const innerR = outerR * 0.42;
      const filled = i < stampsCurrent;
      if (filled) {
        // Schatten + Gradient-Fill + Outline
        starsSvg += `<polygon points="${starPoints(cx, cy + starSz * 0.04, outerR * 1.02, innerR * 1.02)}" fill="rgba(0,0,0,0.45)"/>`;
        starsSvg += `<polygon points="${starPoints(cx, cy, outerR, innerR)}" fill="url(#starGrad)"/>`;
        starsSvg += `<polygon points="${starPoints(cx, cy, outerR * 0.78, innerR * 0.78)}" fill="rgba(255,255,255,0.22)"/>`;
        starsSvg += `<polygon points="${starPoints(cx, cy, outerR, innerR)}" fill="none" stroke="rgba(0,0,0,0.45)" stroke-width="2"/>`;
      } else {
        starsSvg += `<polygon points="${starPoints(cx, cy, outerR, innerR)}" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.9)" stroke-width="${Math.max(3, starSz * 0.04)}"/>`;
      }
    }

    // Glyph im Coin (Branchen-Icon)
    let glyph = "";
    const ga = 0.85;
    const gs = cr * 0.62;
    const stroke = `stroke="rgba(255,255,255,${ga})" fill="none" stroke-linecap="round"`;
    if (cardIcon === "smoking_rooms") {
      glyph = `<ellipse cx="${ccx}" cy="${ccy - 4}" rx="${gs * 0.32}" ry="${gs * 0.2}" fill="rgba(255,255,255,${ga})"/>
<ellipse cx="${ccx - gs * 0.22}" cy="${ccy + 8}" rx="${gs * 0.26}" ry="${gs * 0.17}" fill="rgba(255,255,255,${ga})"/>
<ellipse cx="${ccx + gs * 0.22}" cy="${ccy + 8}" rx="${gs * 0.26}" ry="${gs * 0.17}" fill="rgba(255,255,255,${ga})"/>`;
    } else if (cardIcon === "restaurant") {
      glyph = `<line x1="${ccx - gs * 0.3}" y1="${ccy - gs * 0.5}" x2="${ccx - gs * 0.3}" y2="${ccy + gs * 0.5}" ${stroke} stroke-width="4"/>
<line x1="${ccx + gs * 0.3}" y1="${ccy - gs * 0.5}" x2="${ccx + gs * 0.3}" y2="${ccy + gs * 0.5}" ${stroke} stroke-width="4"/>
<line x1="${ccx}" y1="${ccy - gs * 0.5}" x2="${ccx}" y2="${ccy}" ${stroke} stroke-width="3"/>
<line x1="${ccx}" y1="${ccy}" x2="${ccx}" y2="${ccy + gs * 0.5}" ${stroke} stroke-width="5"/>`;
    } else if (cardIcon === "local_bar") {
      glyph = `<path d="M ${ccx - gs * 0.45} ${ccy - gs * 0.4} L ${ccx + gs * 0.45} ${ccy - gs * 0.4} L ${ccx} ${ccy + gs * 0.2} Z" ${stroke} stroke-width="4"/>
<line x1="${ccx}" y1="${ccy + gs * 0.2}" x2="${ccx}" y2="${ccy + gs * 0.5}" ${stroke} stroke-width="4"/>`;
    } else {
      // Kaffeetasse (local_cafe / Default)
      glyph = `<rect x="${ccx - gs * 0.5}" y="${ccy - gs * 0.4}" width="${gs * 0.9}" height="${gs * 0.75}" rx="${gs * 0.15}" ${stroke} stroke-width="4"/>
<path d="M ${ccx + gs * 0.4} ${ccy - gs * 0.2} q ${gs * 0.4} 0 ${gs * 0.0} ${gs * 0.35}" ${stroke} stroke-width="4"/>
<line x1="${ccx - gs * 0.6}" y1="${ccy + gs * 0.5}" x2="${ccx + gs * 0.6}" y2="${ccy + gs * 0.5}" ${stroke} stroke-width="4"/>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs>
<linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="rgba(${br},${bg},${bb},0.55)"/>
<stop offset="0.6" stop-color="rgba(${br},${bg},${bb},0.25)"/>
<stop offset="1" stop-color="rgba(${br},${bg},${bb},0.45)"/>
</linearGradient>
<radialGradient id="coinGrad" cx="0.4" cy="0.35" r="0.8">
<stop offset="0" stop-color="rgba(255,255,255,0.95)"/>
<stop offset="0.55" stop-color="rgba(${br},${bg},${bb},0.9)"/>
<stop offset="1" stop-color="rgba(${Math.max(0, br - 60)},${Math.max(0, bg - 60)},${Math.max(0, bb - 60)},0.9)"/>
</radialGradient>
<radialGradient id="starGrad" cx="0.42" cy="0.38" r="0.75">
<stop offset="0" stop-color="rgba(255,255,255,0.9)"/>
<stop offset="0.55" stop-color="${brand}"/>
<stop offset="1" stop-color="rgb(${Math.max(0, br - 70)},${Math.max(0, bg - 70)},${Math.max(0, bb - 70)})"/>
</radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
<path d="M 0 140 C ${W * 0.3} 100, ${W * 0.55} 60, ${W} 90" stroke="${brand}" stroke-width="3" fill="none" opacity="0.48"/>
<path d="M 0 160 C ${W * 0.3} 120, ${W * 0.55} 80, ${W} 110" stroke="${brand}" stroke-width="3" fill="none" opacity="0.74"/>
<path d="M 0 180 C ${W * 0.3} 140, ${W * 0.55} 100, ${W} 130" stroke="${brand}" stroke-width="3" fill="none" opacity="0.22"/>
<circle cx="${ccx}" cy="${ccy}" r="${cr}" fill="url(#coinGrad)"/>
<circle cx="${ccx}" cy="${ccy}" r="${cr}" fill="none" stroke="rgba(${br},${bg},${bb},0.42)" stroke-width="4"/>
<circle cx="${ccx}" cy="${ccy}" r="${Math.round(cr * 0.78)}" fill="none" stroke="rgba(${br},${bg},${bb},0.28)" stroke-width="2" stroke-dasharray="6 9"/>
<path d="M ${ccx - cr * 0.7} ${ccy - cr * 0.55} A ${cr} ${cr} 0 0 1 ${ccx + cr * 0.7} ${ccy - cr * 0.55}" stroke="rgba(255,255,255,0.46)" stroke-width="4" fill="none"/>
${glyph}
<circle cx="${Math.round(W * 0.34)}" cy="${Math.round(H * 0.55)}" r="7" fill="${brand}" opacity="0.66"/>
<circle cx="${Math.round(W * 0.49)}" cy="${Math.round(H * 0.48)}" r="4" fill="${brand}" opacity="0.4"/>
${starsSvg}
</svg>`;
    return await sharp(Buffer.from(svg)).png().toBuffer();
  } catch (e) {
    console.log(`[Apple Pass] Strip generation failed: ${e}`);
    return TINY_PNG;
  }
}

/**
 * Tenant-Logo als Pass-Icon aufbereiten (Legacy: Flood-Fill Hintergrund,
 * Auto-Crop, Wide-Logo-Crop, 158×158 Canvas, dunkler BG bleibt opak).
 */
export async function buildPassIconFromLogo(
  logoBytes: Buffer,
  colorHex: string
): Promise<Buffer> {
  try {
    // Für schnelle Pixel-Verarbeitung auf max. 800px begrenzen
    let img = sharp(logoBytes).ensureAlpha();
    const meta = await img.metadata();
    const maxSide = Math.max(meta.width ?? 0, meta.height ?? 0);
    if (maxSide > 800) img = img.resize({ width: 800, height: 800, fit: "inside" });
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const px = new Uint8Array(data);

    // Schritt 1: Eck-Pixel-Sampling (10×10 pro Ecke)
    const cornerColors: number[][] = [];
    const corners: [number, number][] = [
      [0, 0],
      [w - 1, 0],
      [0, h - 1],
      [w - 1, h - 1],
    ];
    for (const [cx, cy] of corners) {
      let sr = 0, sg = 0, sb = 0, sa = 0, cnt = 0;
      for (let dx = 0; dx < Math.min(10, w); dx++) {
        for (let dy = 0; dy < Math.min(10, h); dy++) {
          const x = Math.min(cx + dx, w - 1);
          const y = Math.min(cy + dy, h - 1);
          const o = (y * w + x) * 4;
          sr += px[o]; sg += px[o + 1]; sb += px[o + 2]; sa += px[o + 3];
          cnt++;
        }
      }
      if (cnt > 0) {
        cornerColors.push([
          Math.floor(sr / cnt),
          Math.floor(sg / cnt),
          Math.floor(sb / cnt),
          Math.floor(sa / cnt),
        ]);
      }
    }

    let bgColor: number[] | null = null;
    if (cornerColors.length === 4) {
      const first = cornerColors[0];
      const allSimilar = cornerColors.every(
        (c) =>
          Math.abs(c[0] - first[0]) < 15 &&
          Math.abs(c[1] - first[1]) < 15 &&
          Math.abs(c[2] - first[2]) < 15
      );
      if (allSimilar && first[3] > 200) bgColor = first;
    }

    // Schritt 2: Flood-Fill von den Rändern (nur verbundene Hintergrund-Pixel)
    if (bgColor) {
      const threshold = 25;
      const visited = new Uint8Array(w * h);
      const queue: number[] = [];
      const similar = (o: number) =>
        Math.abs(px[o] - bgColor![0]) < threshold &&
        Math.abs(px[o + 1] - bgColor![1]) < threshold &&
        Math.abs(px[o + 2] - bgColor![2]) < threshold;
      for (let x = 0; x < w; x++) {
        for (const y of [0, h - 1]) {
          if (similar((y * w + x) * 4)) queue.push(y * w + x);
        }
      }
      for (let y = 0; y < h; y++) {
        for (const x of [0, w - 1]) {
          if (similar((y * w + x) * 4)) queue.push(y * w + x);
        }
      }
      while (queue.length > 0) {
        const idx = queue.pop()!;
        if (visited[idx]) continue;
        visited[idx] = 1;
        const o = idx * 4;
        if (!similar(o)) continue;
        px[o + 3] = 0;
        const x = idx % w;
        const y = Math.floor(idx / w);
        if (x + 1 < w) queue.push(idx + 1);
        if (x - 1 >= 0) queue.push(idx - 1);
        if (y + 1 < h) queue.push(idx + w);
        if (y - 1 >= 0) queue.push(idx - w);
      }
    }

    let processed = sharp(px, { raw: { width: w, height: h, channels: 4 } });

    // Schritt 3: Auto-Crop auf Non-Transparent-Bereich
    try {
      processed = processed.trim({ threshold: 1 });
    } catch {
      // nichts zu croppen
    }

    // Schritt 3b/4: Wide-Logo-Behandlung + 90%-Skalierung
    const canvasSize = 158;
    const { data: d2, info: i2 } = await processed
      .raw()
      .toBuffer({ resolveWithObject: true });
    const cw0 = i2.width;
    const ch0 = i2.height;
    const aspectRatio = Math.max(cw0, ch0) / Math.max(1, Math.min(cw0, ch0));
    let logoSharp = sharp(d2, {
      raw: { width: cw0, height: ch0, channels: 4 },
    });
    if (aspectRatio > 1.5 && cw0 > ch0) {
      const newWFull = Math.round(cw0 * (canvasSize / ch0));
      logoSharp = logoSharp.resize(newWFull, canvasSize);
      const portionWidth = Math.min(newWFull, Math.round(newWFull * 0.5));
      logoSharp = logoSharp.extract({
        left: 0,
        top: 0,
        width: portionWidth,
        height: canvasSize,
      });
    }
    const targetSize = Math.round(canvasSize * 0.9);
    logoSharp = logoSharp.resize(targetSize, targetSize, {
      fit: "inside",
      withoutEnlargement: false,
    });
    const logoFinal = await logoSharp.png().toBuffer();

    // Schritt 5: Canvas — dunkler BG bleibt opak, sonst transparent
    const keepOpaque =
      bgColor !== null && (bgColor[0] + bgColor[1] + bgColor[2]) / 3 < 128;
    const canvasBg = keepOpaque
      ? { r: bgColor![0], g: bgColor![1], b: bgColor![2], alpha: 1 }
      : { r: 0, g: 0, b: 0, alpha: 0 };
    return await sharp({
      create: {
        width: canvasSize,
        height: canvasSize,
        channels: 4,
        background: canvasBg,
      },
    })
      .composite([
        {
          input: logoFinal,
          gravity: "center",
        },
      ])
      .png()
      .toBuffer();
  } catch (e) {
    console.log(`[Apple Pass] Logo resize failed, using default: ${e}`);
    return generateDefaultIcon(colorHex);
  }
}

// ─── .pkpass Assembly ───
export async function generateApplePkpass(
  tenantSlug: string,
  tenantName: string,
  card: PassCardDict,
  customer: PassCustomerDict,
  geofence: PassGeofenceDict | null = null,
  logoBytes: Buffer | null = null
): Promise<Buffer | null> {
  try {
    // 1. pass.json
    const passJson = generateApplePassJson(
      tenantSlug,
      tenantName,
      card,
      customer,
      geofence,
      process.env.APP_BASE_URL
    );
    const passJsonBytes = Buffer.from(JSON.stringify(passJson, null, 2), "utf-8");

    // 2. Icon: Tenant-Logo aufbereitet, sonst Default
    const colorHex = card.color_hex || "#C9A84C";
    const iconBytes = logoBytes
      ? await buildPassIconFromLogo(logoBytes, colorHex)
      : await generateDefaultIcon(colorHex);

    // 3. Strip (Stempel-Visualisierung)
    const stripBytes = await generateStampStrip(
      customer.current_stamps ?? 0,
      card.stamps_required ?? 10,
      card.icon || "local_cafe",
      colorHex
    );

    // 4. Manifest — Hashes ALLER Dateien im ZIP
    const sha1 = (b: Buffer) => crypto.createHash("sha1").update(b).digest("hex");
    const manifest: Record<string, string> = {
      "pass.json": sha1(passJsonBytes),
      "icon.png": sha1(iconBytes),
      "icon@2x.png": sha1(iconBytes),
      "strip.png": sha1(stripBytes),
      "strip@2x.png": sha1(stripBytes),
    };
    if (logoBytes) {
      manifest["logo.png"] = sha1(logoBytes);
      manifest["logo@2x.png"] = sha1(logoBytes);
    }

    // 5. EXAKT diese manifest-Bytes signieren UND zippen
    const manifestBytes = Buffer.from(JSON.stringify(manifest, null, 2), "utf-8");
    const signature = signPassManifest(manifestBytes);

    // 6. ZIP
    const zip = new AdmZip();
    zip.addFile("pass.json", passJsonBytes);
    zip.addFile("manifest.json", manifestBytes);
    zip.addFile("signature", signature);
    zip.addFile("icon.png", iconBytes);
    zip.addFile("icon@2x.png", iconBytes);
    zip.addFile("strip.png", stripBytes);
    zip.addFile("strip@2x.png", stripBytes);
    if (logoBytes) {
      zip.addFile("logo.png", logoBytes);
      zip.addFile("logo@2x.png", logoBytes);
    }
    return zip.toBuffer();
  } catch (e) {
    console.log(`[Apple Pass] Generation failed: ${e}`);
    return null;
  }
}

// ─── Google Wallet ───
export function generateGoogleObjectPayload(
  tenantSlug: string,
  tenantName: string,
  card: PassCardDict,
  customer: PassCustomerDict,
  geofence: PassGeofenceDict | null = null
): Record<string, unknown> {
  const serial = customer.pass_serial || crypto.randomUUID();
  const stampsCurrent = customer.current_stamps ?? 0;
  const shortCode = customer.short_code || "";
  const serialShort = serial.slice(0, 16).replace(/-/g, "");
  const objectId = `${GOOGLE_ISSUER_ID}.${tenantSlug}-${serialShort}`;

  const payload: Record<string, unknown> = {
    id: objectId,
    classId: GOOGLE_CLASS_ID,
    state: "ACTIVE",
    loyaltyPoints: {
      label: "Stempel",
      balance: { int: stampsCurrent },
    },
    barcode: {
      type: "QR_CODE",
      value: shortCode || serial,
      alternateText: shortCode ? `Code: ${shortCode}` : "",
    },
    accountName: `${tenantName} Stempelkarte`,
    accountId: serial.slice(0, 16),
    infoModuleData: {
      showLastUpdateTime: true,
      labelValueRows: [
        { label: "Reward", value: card.reward_name || "Belohnung" },
        { label: "Restaurant", value: tenantName },
        { label: "Stempel-Code", value: shortCode || "—" },
      ],
    },
    textModulesData: [
      {
        id: "info",
        header: "So funktioniert's",
        body: `Bei jeder Bestellung erhältst du automatisch einen Stempel. Nach ${card.stamps_required ?? 10} Stempeln: ${card.reward_name || "Belohnung"}!`,
      },
    ],
    linksModuleData: {
      uris: [
        {
          uri: `${appBaseUrl()}/${tenantSlug}`,
          description: "Speisekarte öffnen",
        },
      ],
    },
  };
  if (geofence) {
    payload.locations = [
      { latitude: geofence.latitude, longitude: geofence.longitude },
    ];
  }
  return payload;
}

export function generateGoogleClassPayload(
  tenantName: string,
  card: PassCardDict,
  logoUrl: string = ""
): Record<string, unknown> {
  const colorHex = card.color_hex || "#C9A84C";
  const hexBg = "#" + colorHex.replace(/^#/, "").toUpperCase();
  const classPayload: Record<string, unknown> = {
    id: GOOGLE_CLASS_ID,
    issuerName: tenantName || "digi-gastro",
    programName: card.name || "Stempelkarte",
    hexBackgroundColor: hexBg,
    rewardsTier: card.reward_name || "Belohnung",
    rewardsTierLabel: "Stempel",
    multipleDevicesAndHoldersAllowedStatus: "STATUS_MULTIPLE_HOLDERS",
    reviewStatus: "UNDER_REVIEW",
    countryCode: "DE",
    localizedIssuerName: {
      defaultValue: { language: "de", value: tenantName || "digi-gastro" },
    },
    callbackOptions: {
      updateUrl: `${appBaseUrl()}/api/wallet/google/callback`,
      // base64 JSON {version:1,registrationType:SAFE}
      urlContext: "eyJ2ZXJzaW9uIjogMSwgInJlZ2lzdHJhdGlvblR5cGUiOiAiU0FGRSJ9",
    },
  };
  if (logoUrl) {
    classPayload.programLogo = {
      sourceUri: { uri: logoUrl },
      contentDescription: {
        defaultValue: { language: "de", value: `${tenantName} Logo` },
      },
    };
  }
  return classPayload;
}

/** "Save to Google Wallet" JWT. Dev-Mode ohne Secrets → "DEV_MODE_DUMMY_JWT". */
export function generateGoogleWalletJwt(
  tenantSlug: string,
  tenantName: string,
  card: PassCardDict,
  customer: PassCustomerDict,
  geofence: PassGeofenceDict | null = null,
  logoUrl: string = ""
): string | null {
  if (!isGoogleConfigured()) return "DEV_MODE_DUMMY_JWT";
  try {
    const sa = JSON.parse(
      fs.readFileSync(GOOGLE_SERVICE_ACCOUNT_PATH, "utf-8")
    ) as { client_email: string; private_key: string };
    const objPayload = generateGoogleObjectPayload(
      tenantSlug,
      tenantName,
      card,
      customer,
      geofence
    );
    const classPayload = generateGoogleClassPayload(tenantName, card, logoUrl);
    const claims = {
      iss: sa.client_email,
      aud: "google",
      typ: "savetowallet",
      iat: Math.floor(Date.now() / 1000),
      origins: ["digi-gastro.de"],
      payload: {
        loyaltyClasses: [classPayload],
        loyaltyObjects: [objPayload],
      },
    };
    return jwt.sign(claims, sa.private_key, { algorithm: "RS256" });
  } catch (e) {
    console.log(`[Google Wallet] JWT generation failed: ${e}`);
    return null;
  }
}
