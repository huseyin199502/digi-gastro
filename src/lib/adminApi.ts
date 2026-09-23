import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "./prisma";
import { getPlatformSession, getTenantSession, TenantSession } from "./auth";
import { berlinTimestamp } from "./time";

// ──────────────────────────────────────────────────────────────────
// Shared helpers for the legacy admin CRUD endpoints ported from
// main.py. Response/error shapes mirror FastAPI:
//   errors  → {"detail": "..."} with matching HTTP status
//   success → legacy JSON bodies or 303 redirects for form clients
// ──────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 400
  ) {
    super(message);
  }
}

export function jsonError(status: number, detail: string) {
  return NextResponse.json({ detail }, { status });
}

export function errorResponse(err: unknown) {
  if (err instanceof ApiError) return jsonError(err.status, err.message);
  console.error("[admin-api]", err);
  return jsonError(500, "Interner Serverfehler.");
}

/** Legacy Accept-based dual behaviour: fetch → JSON, form post → 303 redirect */
export function wantsJson(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  if (
    accept.includes("application/json") ||
    request.headers.get("x-requested-with") === "fetch"
  ) {
    return true;
  }
  // fetch() sends `Accept: */*` by default (no explicit JSON accept) —
  // treat JSON POSTs as JSON clients so they get {success:true} instead
  // of a 303 redirect (which breaks behind reverse proxies and shows
  // "Verbindungsfehler" although the delete already succeeded).
  // Only real form navigations explicitly accept HTML.
  if (accept.includes("text/html")) return false;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return true;
  return false;
}

/**
 * FastAPI-Form-Bool-Semantik: "true"/"1"/"on"/"yes" → true,
 * alles andere (inkl. fehlendes Feld) → false.
 */
export function parseFormBool(raw: unknown): boolean {
  if (raw === true) return true;
  const s = String(raw ?? "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "on" || s === "yes";
}

/**
 * Liest den Request-Body als JSON oder FormData (Legacy FastAPI Form(...)
 * Endpunkte). Gibt immer ein flaches Record zurück (nie throw).
 */
export async function readBodyAny(
  request: Request
): Promise<Record<string, unknown>> {
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      const data = (await request.json()) as Record<string, unknown>;
      return data && typeof data === "object" ? data : {};
    } catch {
      return {};
    }
  }
  try {
    const fd = await request.formData();
    const out: Record<string, unknown> = {};
    for (const [k, v] of fd.entries()) out[k] = v;
    return out;
  } catch {
    return {};
  }
}

export function dashboardRedirect(request: Request, query = ""): NextResponse {
  const url = new URL("/admin/dashboard", request.url);
  if (query) url.search = query;
  return NextResponse.redirect(url, 303);
}

export function platformRedirect(request: Request, query = ""): NextResponse {
  const url = new URL("/digi-gastro-admin", request.url);
  if (query) url.search = query;
  return NextResponse.redirect(url, 303);
}

// ── Auth guards (legacy require_chef_user_flat) ──

/** require_chef_user_flat → 401 without session, 403 for non-chef */
export async function requireChef(): Promise<TenantSession> {
  const session = await getTenantSession();
  if (!session) throw new ApiError("Nicht eingeloggt.", 401);
  if (session.role !== "chef") {
    throw new ApiError("Kein Zugriff. Nur für Administratoren.", 403);
  }
  return session;
}

/** chef OR kellner — used by order management endpoints */
export async function requireChefOrKellner(): Promise<TenantSession> {
  const session = await getTenantSession();
  if (!session) throw new ApiError("Nicht eingeloggt.", 401);
  if (session.role !== "chef" && session.role !== "kellner") {
    throw new ApiError("Kein Zugriff.", 403);
  }
  return session;
}

/** Platform super-admin guard — only the validated digi_admin_session cookie. */
export async function requirePlatformAdmin(): Promise<void> {
  if (await getPlatformSession()) return;
  throw new ApiError("Kein Zugriff", 403);
}

// ── Price / category-type helpers (legacy semantics) ──

const BAR_KEYWORDS = [
  "drinks", "bar", "getränke", "soft", "alkohol", "bier", "wein",
  "cocktail", "saft", "kaffee", "tee", "wasser", "limo",
];
const SHISHA_KEYWORDS = ["shisha", "wasserpfeife", "pfeife", "head", "kohle"];

export function inferCategoryType(categoryName: string): string {
  const catLower = categoryName.toLowerCase();
  if (BAR_KEYWORDS.some((k) => catLower.includes(k))) return "bar";
  if (SHISHA_KEYWORDS.some((k) => catLower.includes(k))) return "shisha";
  return "küche";
}

/** Legacy robust price parsing: accepts "3.50" and "3,50", validates range */
export function parsePrice(raw: unknown, required = true): number {
  const clean = String(raw ?? "").trim().replace(",", ".");
  if (!clean) {
    if (required) throw new ApiError("Bitte gib einen Preis ein.", 400);
    return 0;
  }
  const val = Number(clean);
  if (!Number.isFinite(val)) {
    throw new ApiError(
      `Ungültiger Preis '${raw}'. Bitte im Format 3.50 oder 3,50 eingeben.`,
      400
    );
  }
  if (val < 0 || val > 99999) {
    throw new ApiError(
      "Ungültiger Preis. Der Preis muss zwischen 0 und 99.999 € liegen.",
      400
    );
  }
  return val;
}

/** Parse related_product_ids — list or JSON-array string (legacy semantics) */
export function parseRelatedIds(raw: unknown): number[] {
  try {
    if (Array.isArray(raw)) {
      return raw
        .filter((pid) => /^\d+$/.test(String(pid)))
        .map((pid) => parseInt(String(pid), 10));
    }
    const str = String(raw ?? "").trim();
    if (!str) return [];
    const parsed = JSON.parse(str);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((pid) => /^\d+$/.test(String(pid)))
      .map((pid) => parseInt(String(pid), 10));
  } catch {
    return [];
  }
}

export function parseAllergens(raw: unknown): string[] {
  try {
    if (Array.isArray(raw)) return raw.map((a) => String(a));
    const str = String(raw ?? "").trim();
    if (!str) return [];
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed.map((a) => String(a)) : [];
  } catch {
    return [];
  }
}

/** html.escape equivalent used by /api/categories/edit */
export function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ── Audit log (legacy _audit_log → audit_log table) ──

export async function appendAuditLog(
  slug: string,
  employeeName: string,
  employeeRole: string,
  action: string,
  details = ""
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      tenant_slug: slug,
      action,
      timestamp: berlinTimestamp(),
      // legacy save_restaurant_to_db mapping: user = f"{employee_name} ({employee_role})"
      user: `${employeeName || "Unbekannt"} (${employeeRole || "unbekannt"})`,
      details,
    },
  });
}

// ── Image file helpers (public/uploads/products) ──

export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

export function uploadsDir(...segments: string[]): string {
  return path.join(process.cwd(), "public", "uploads", ...segments);
}

/** Save an uploaded image file; returns the public URL path. */
export async function saveProductImage(
  slug: string,
  productId: number,
  file: File
): Promise<string> {
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new ApiError("Bild ist zu groß (max. 10 MB).", 400);
  }
  const dir = uploadsDir("products");
  fs.mkdirSync(dir, { recursive: true });
  const safeName = `${slug}-product-${productId}.png`;
  const buffer = Buffer.from(await file.arrayBuffer());
  // NOTE: legacy ran optional rembg/PIL background removal + WebP conversion
  // here; the migration stores the original bytes (PNG path kept, same URL).
  fs.writeFileSync(path.join(dir, safeName), buffer);
  return `/uploads/products/${safeName}`;
}

/**
 * Delete a local image if no other product of the tenant references it
 * (legacy delete_local_image_if_unused). Best-effort, never throws.
 */
export async function deleteLocalImageIfUnused(
  imagePath: string,
  slug: string
): Promise<void> {
  try {
    if (!imagePath || !imagePath.startsWith("/uploads/")) return;
    const stillUsed = await prisma.product.count({
      where: { tenant_slug: slug, image: imagePath },
    });
    if (stillUsed > 0) return;
    const filePath = path.join(process.cwd(), "public", imagePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    // also clean a WebP sibling if present
    const webpPath = filePath.replace(/\.[^.]+$/, ".webp");
    if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath);
  } catch (e) {
    console.error("[image-cleanup]", e);
  }
}

// ── Tenant existence gate (legacy get_restaurant_or_raise) ──

export async function getActiveTenantOrThrow(slug: string) {
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) throw new ApiError("Dieses Restaurant existiert nicht.", 404);
  if (tenant.active === false) {
    throw new ApiError("Dieses Restaurant ist derzeit nicht erreichbar.", 403);
  }
  return tenant;
}

// ── Logo-Upload (legacy /admin/branding + /admin/upload-logo) ──

export const MAX_LOGO_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Speichert eine Logo-Datei nach public/uploads/logos.
 * Legacy-Dateiname: {slug}_{prefix}_{timestamp}_{originalname},
 * nur alphanumerisch + "._-". WebP-Konvertierung entfällt (Original bleibt).
 */
export async function saveLogoFile(
  slug: string,
  prefix: string,
  file: File
): Promise<string> {
  if (file.size > MAX_LOGO_UPLOAD_BYTES) {
    throw new ApiError("Logo ist zu groß (max. 5 MB).", 400);
  }
  const dir = uploadsDir("logos");
  fs.mkdirSync(dir, { recursive: true });
  const ts = Math.floor(Date.now() / 1000);
  const rawName = `${slug}_${prefix}_${ts}_${file.name}`;
  const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "");
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, safeName), buffer);
  return `/uploads/logos/${safeName}`;
}

/**
 * Löscht eine Upload-Datei (best-effort, nie throwend).
 * imagePath muss mit "/uploads/" beginnen.
 */
export function deleteUploadFile(imagePath: string): void {
  try {
    if (!imagePath || !imagePath.startsWith("/uploads/")) return;
    const filePath = path.join(process.cwd(), "public", imagePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    const webpPath = filePath.replace(/\.[^.]+$/, ".webp");
    if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath);
  } catch (e) {
    console.error("[upload-cleanup]", e);
  }
}

/**
 * Legacy update_legal_placeholders (main.py ~10400): ersetzt
 * Platzhalter in Impressum/Datenschutz durch echten Branding-Daten.
 */
export function applyLegalPlaceholders(tenant: {
  name: string;
  email: string;
  address: string | null;
  plz: string | null;
  ort: string | null;
  impressum_content: string | null;
  datenschutz_content: string | null;
}): { impressum: string; datenschutz: string } {
  const addr = tenant.address ?? "";
  const plzOrt = `${tenant.plz ?? ""} ${tenant.ort ?? ""}`.trim();
  const name = tenant.name ?? "";
  const email = tenant.email ?? "";

  let imp = tenant.impressum_content ?? "";
  if (imp) {
    imp = imp.replace(/\[Vorname Nachname \/ Firmenname\]/g, name);
    imp = imp.replace(/\[Name \/ Firmenname\]/g, name);
    imp = imp.replace(/\[Straße und Hausnummer\]/g, addr);
    imp = imp.replace(/\[Adresse\]/g, `${addr}, ${plzOrt}`);
    imp = imp.replace(/\[PLZ Ort\]/g, plzOrt);
    if (email) imp = imp.replace(/\[info@beispiel\.de\]/g, email);
  }

  let ds = tenant.datenschutz_content ?? "";
  if (ds) {
    ds = ds.replace(/\[Name \/ Firmenname\]/g, name);
    ds = ds.replace(/\[Adresse\]/g, `${addr}, ${plzOrt}`);
    if (email) {
      ds = ds.replace(/\[E-Mail-Adresse\]/g, email);
      ds = ds.replace(/\[info@beispiel\.de\]/g, email);
    }
  }
  return { impressum: imp, datenschutz: ds };
}
