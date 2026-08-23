import crypto from "crypto";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, jsonError } from "@/lib/adminApi";
import { getOrCreateCustomer, loyaltyCookieSecure } from "@/lib/loyalty";
import {
  deterministicAuthToken,
  generateApplePkpass,
  nowIso,
} from "@/lib/walletPass";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Duplikat-Schutz: Code-Eingabe-Seite (Legacy main.py ~15043) ───
function codeEntryPage(slug: string, tenantName: string, aid: string): string {
  const aidAttr = escHtml(aid);
  const aidJs = JSON.stringify(aid).slice(1, -1);
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Stempelkarte - Code eingeben</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
<style>
body { font-family: 'Inter', sans-serif; background: #050507; color: #fafafa; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.card { background: #18181b; border: 1px solid #27272a; border-radius: 1.5rem; padding: 2rem; max-width: 420px; width: 100%; text-align: center; }
.logo { width: 64px; height: 64px; margin: 0 auto 1.5rem; background: linear-gradient(135deg, #c9a84c 0%, #e8c875 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
p { color: #a1a1aa; font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem; }
input { width: 100%; padding: 1rem; font-size: 1.5rem; font-weight: 800; text-align: center; letter-spacing: 0.5em; text-transform: uppercase; background: #09090b; border: 2px solid #27272a; border-radius: 0.75rem; color: #fafafa; outline: none; margin-bottom: 1rem; }
input:focus { border-color: #c9a84c; }
button { width: 100%; padding: 1rem; background: linear-gradient(135deg, #c9a84c 0%, #b8964a 100%); color: #0a0a0a; font-weight: 700; border: none; border-radius: 0.75rem; cursor: pointer; font-size: 1rem; }
button:hover { background: linear-gradient(135deg, #e8c875 0%, #c9a84c 100%); }
.msg { margin-top: 1rem; font-size: 0.85rem; font-weight: 600; }
.msg.ok { color: #10b981; }
.msg.err { color: #ef4444; }
.hint { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #27272a; font-size: 0.75rem; color: #71717a; line-height: 1.4; }
.hint a { color: #c9a84c; text-decoration: underline; cursor: pointer; }
</style>
</head>
<body>
<div class="card">
<div class="logo">🎟️</div>
<h1>Hast du schon eine Stempelkarte?</h1>
<p>Wir sehen dass für ${escHtml(tenantName)} bereits Stempelkarten existieren. Gib deinen 4-stelligen Code ein um deine Karte wiederherzustellen — ohne neuen Code.</p>
<input type="text" id="code" placeholder="A7K2" maxlength="4" oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9]/g,'')">
<button onclick="recover()">Stempelkarte wiederherstellen</button>
<p class="msg" id="msg"></p>
<div class="hint">
Du hast noch keine Stempelkarte? <a onclick="location.href='/${slug}/loyalty/pass/apple?aid=${aidAttr}&show_code=1'">Neue Karte erstellen</a>
</div>
</div>
<script>
async function recover() {
  const code = document.getElementById('code').value.trim();
  const msg = document.getElementById('msg');
  if (code.length < 4) { msg.className='msg err'; msg.textContent='Bitte 4-stelligen Code eingeben'; return; }
  msg.className='msg'; msg.textContent='Suche...';
  try {
    const res = await fetch('/${slug}/loyalty/recover', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ short_code: code, anonymous_id: "${aidJs}" })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      msg.className='msg ok';
      msg.textContent='✓ Willkommen zurück! ' + data.current_stamps + '/' + data.stamps_required + ' Stempel';
      setTimeout(() => window.location.href = '/${slug}/loyalty/pass/apple?aid=${aidAttr}&recovered=1', 1500);
    } else {
      msg.className='msg err';
      msg.textContent = data.detail || 'Code nicht gefunden';
    }
  } catch(e) { msg.className='msg err'; msg.textContent='Fehler'; }
}
</script>
</body>
</html>`;
}

// ─── Code-Bestätigungs-Seite vor dem Pass-Download (Legacy main.py ~15118) ───
function codeConfirmPage(slug: string, shortCode: string, aid: string): string {
  const aidAttr = escHtml(aid);
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Dein Stempel-Code</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #050507; color: #fafafa; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.card { background: #18181b; border: 1px solid #27272a; border-radius: 1.5rem; padding: 2rem; max-width: 420px; width: 100%; text-align: center; }
.logo { width: 64px; height: 64px; margin: 0 auto 1.5rem; background: linear-gradient(135deg, #c9a84c 0%, #e8c875 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
p { color: #a1a1aa; font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem; }
.code-box { background: #09090b; border: 2px solid #c9a84c; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem; }
.code { font-size: 2.5rem; font-weight: 900; letter-spacing: 0.3em; color: #c9a84c; font-family: monospace; }
.hint { color: #71717a; font-size: 0.8rem; margin-top: 0.5rem; }
button { width: 100%; padding: 1rem; background: linear-gradient(135deg, #c9a84c 0%, #b8964a 100%); color: #0a0a0a; font-weight: 700; border: none; border-radius: 0.75rem; cursor: pointer; font-size: 1rem; margin-bottom: 0.5rem; }
button:hover { background: linear-gradient(135deg, #e8c875 0%, #c9a84c 100%); }
.btn-secondary { background: transparent; color: #a1a1aa; border: 1px solid #27272a; }
.success-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.95); display: none; align-items: center; justify-content: center; z-index: 9999; flex-direction: column; padding: 2rem; text-align: center; }
.success-overlay.show { display: flex; }
.success-icon { font-size: 4rem; margin-bottom: 1rem; }
.success-title { font-size: 1.5rem; font-weight: 800; color: #10b981; margin-bottom: 0.5rem; }
.success-text { color: #a1a1aa; font-size: 0.95rem; line-height: 1.5; max-width: 320px; }
.spinner { width: 24px; height: 24px; border: 3px solid rgba(201,168,76,0.2); border-top-color: #c9a84c; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 1rem auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
<div class="card">
<div class="logo">🎉</div>
<h1>Dein Stempel-Code</h1>
<p>Notiere dir diesen Code! Du brauchst ihn falls du dein Gerät wechselst oder deine Stempelkarte nach einigen Tagen nicht mehr automatisch erkannt wird.</p>
<div class="code-box">
<div class="code">${escHtml(shortCode)}</div>
<div class="hint">4-stelliger Code — bitte notieren oder Screenshot machen</div>
</div>
<a id="download-apple" href="/${slug}/loyalty/pass/apple?aid=${aidAttr}&force_new=1" onclick="return onAppleDownload(event)">
<button style="width:100%;padding:1rem;background:linear-gradient(135deg,#c9a84c 0%,#b8964a 100%);color:#0a0a0a;font-weight:700;border:none;border-radius:0.75rem;cursor:pointer;font-size:1rem;margin-bottom:0.5rem;">Jetzt in Apple Wallet laden</button>
</a>
<a id="download-google" href="/${slug}/loyalty/pass/google?aid=${aidAttr}&force_new=1" onclick="return onGoogleDownload(event)">
<button class="btn-secondary" style="width:100%;padding:1rem;background:transparent;color:#a1a1aa;border:1px solid #27272a;font-weight:700;border-radius:0.75rem;cursor:pointer;font-size:1rem;">Oder Google Wallet</button>
</a>
<a href="/${slug}">
<button class="btn-secondary" style="width:100%;padding:0.75rem;background:transparent;color:#71717a;border:none;font-weight:600;border-radius:0.75rem;cursor:pointer;font-size:0.85rem;margin-top:0.5rem;">Später</button>
</a>
</div>

<!-- Auto-Close Overlay nach Pass-Download -->
<div id="success-overlay" class="success-overlay">
<div class="success-icon">✅</div>
<div class="success-title">Pass wird hinzugefügt!</div>
<div class="success-text">Dein Browser öffnet jetzt die Wallet-App. Du kannst dieses Fenster schließen.</div>
<div class="spinner"></div>
<button onclick="closeWindow()" style="margin-top:1.5rem;width:auto;padding:0.75rem 2rem;">Fenster schließen</button>
</div>

<script>
// Auto-Close nach Pass-Download — Multi-Layer Strategie
function onAppleDownload(event) {
    showSuccessOverlay();
    // Nach 2s versuchen zu schließen (iOS Wallet App sollte sich geöffnet haben)
    setTimeout(function() { tryCloseWindow(); }, 2000);
    return true; // Link trotzdem folgen (.pkpass Download)
}

function onGoogleDownload(event) {
    showSuccessOverlay();
    setTimeout(function() { tryCloseWindow(); }, 2000);
    return true;
}

function showSuccessOverlay() {
    var overlay = document.getElementById('success-overlay');
    if (overlay) overlay.classList.add('show');
}

function tryCloseWindow() {
    // Versuche Fenster zu schließen (nur bei per JS geöffneten Fenstern)
    try { window.close(); } catch(e) {}
    // Fallback: Redirect zur Speisekarte
    if (!window.closed) {
        window.location.href = '/${slug}';
    }
}

function closeWindow() {
    try { window.close(); } catch(e) {}
    if (!window.closed) { window.location.href = '/${slug}'; }
}

// visibilitychange: Wenn Wallet App sich öffnet → Tab wird hidden
// → Beim Zurückkommen Auto-Close versuchen
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        var overlay = document.getElementById('success-overlay');
        if (overlay && overlay.classList.contains('show')) {
            setTimeout(function() { tryCloseWindow(); }, 500);
        }
    }
});
</script>
</body>
</html>`;
}

// Legacy GET /{slug}/loyalty/pass/apple (main.py ~14979)
// Generiert .pkpass-File für Apple Wallet (inkl. Duplikat-Schutz).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();

    const card = await prisma.loyaltyCard.findFirst({
      where: { tenant_slug: slug, is_active: true },
    });
    if (!card) {
      return jsonError(404, "Keine aktive Stempelkarte vorhanden.");
    }
    const tenant = await prisma.tenant.findFirst({ where: { slug } });
    if (!tenant) {
      return jsonError(404, "Restaurant nicht gefunden.");
    }

    // CRITICAL FIX: customer_id Cookie heißt 'loyalty_{slug}_cid'
    const cookieVal =
      request.cookies.get(`loyalty_${slug}_cid`)?.value ||
      request.cookies.get(`loyalty_${slug}`)?.value;
    type Cust = Awaited<ReturnType<typeof prisma.loyaltyCustomer.findFirst>>;
    let customer: Cust = null;
    if (cookieVal) {
      const cid = parseInt(cookieVal, 10);
      if (!Number.isNaN(cid)) {
        customer = await prisma.loyaltyCustomer.findFirst({
          where: { tenant_slug: slug, id: cid },
        });
      }
    }
    // Drei-Kanal-Lookup: anonymous_id aus Query-Param
    const aid = (request.nextUrl.searchParams.get("aid") ?? "").trim();
    if (!customer && aid) {
      customer = await prisma.loyaltyCustomer.findFirst({
        where: { tenant_slug: slug, anonymous_id: aid },
      });
    }

    // DUPLIKAT-SCHUTZ: Kunde nicht identifizierbar ABER Tenant hat bereits
    // Pass-Kunden → Code-Eingabe-Seite statt neuen Customer erstellen.
    const forceNew = request.nextUrl.searchParams.get("force_new") === "1";
    const showCodeFirst =
      request.nextUrl.searchParams.get("show_code") === "1";
    if (!customer && !forceNew && !showCodeFirst) {
      const existingPassCount = await prisma.loyaltyCustomer.count({
        where: { tenant_slug: slug, pass_downloaded_at: { not: null } },
      });
      if (existingPassCount > 0) {
        console.log(
          `[Loyalty] Duplikat-Schutz aktiv: Kunde nicht identifizierbar, aber ${existingPassCount} Kunden mit Pass für '${slug}' → Code-Eingabe erforderlich`
        );
        return new NextResponse(codeEntryPage(slug, tenant.name ?? "", aid), {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    }

    // Kunde identifizierbar ODER kein bestehender Pass-Kunde → normal weiter
    if (!customer) {
      const res = await getOrCreateCustomer(slug, card.id, "apple", aid || null);
      customer = res.customer as Cust;
    }
    if (!customer) {
      return jsonError(500, "Kunde konnte nicht erstellt werden.");
    }

    // Code-Bestätigungs-Seite BEVOR der Pass heruntergeladen wird
    if (showCodeFirst && customer && customer.short_code) {
      const response = new NextResponse(
        codeConfirmPage(slug, customer.short_code, aid),
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
      const secure = loyaltyCookieSecure(request);
      response.cookies.set(`loyalty_${slug}_cid`, String(customer.id), {
        httpOnly: true,
        maxAge: 31536000,
        sameSite: "lax",
        secure,
        path: "/",
      });
      console.log(
        `[Loyalty] Code-Bestätigungs-Seite für Customer ${customer.id} (Code: ${customer.short_code})`
      );
      return response;
    }

    // CRITICAL FIX: pass_type auf "apple" updaten falls zuvor "google"
    if (customer.pass_type !== "apple") {
      await prisma.loyaltyCustomer.update({
        where: { id: customer.id },
        data: { pass_type: "apple" },
      });
      customer = { ...customer, pass_type: "apple" };
      console.log(`[Loyalty] Customer ${customer.id} pass_type updated: google → apple`);
    }

    const geofence = await prisma.tenantGeofence.findFirst({
      where: { tenant_slug: slug, is_primary: true },
    });
    const geofenceDict = geofence
      ? { latitude: geofence.latitude, longitude: geofence.longitude }
      : null;

    const customerDict = {
      id: customer.id,
      pass_serial: customer.pass_serial,
      current_stamps: customer.current_stamps,
      // CRITICAL: auth_token muss 32-char hex sein (deterministisch)
      auth_token: deterministicAuthToken(customer.pass_serial),
      short_code: customer.short_code || "",
      last_message: customer.last_message || "Willkommen!",
      msg_nonce: String(customer.msg_nonce || 0),
    };
    const cardDict = {
      id: card.id,
      name: card.name,
      stamps_required: card.stamps_required,
      reward_name: card.reward_name,
      color_hex: card.color_hex,
    };

    // CRITICAL FIX: Tenant-Logo in den Pass einbinden (WebP → PNG Fallback)
    let logoBytes: Buffer | null = null;
    if (tenant.logo_path) {
      const logoFilename = tenant.logo_path.split("/").pop() ?? "";
      const possiblePaths = [
        path.join(UPLOAD_DIR, "logos", logoFilename.replace(".webp", ".png")),
        path.join(UPLOAD_DIR, "logos", logoFilename),
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(/* turbopackIgnore: true */ p)) {
          logoBytes = fs.readFileSync(p);
          break;
        }
      }
    }

    const pkpassBytes = await generateApplePkpass(
      slug,
      tenant.name ?? "",
      cardDict,
      customerDict,
      geofenceDict,
      logoBytes
    );
    if (!pkpassBytes) {
      return jsonError(500, "Pass-Generierung fehlgeschlagen.");
    }

    // pass_downloaded_at markieren → Server weiß, dass Customer einen Pass hat
    const updateData: Record<string, unknown> = { pass_needs_update: false };
    if (!customer.pass_downloaded_at) {
      updateData.pass_downloaded_at = nowIso();
      updateData.pass_updated_at = nowIso();
    }
    if (!customer.anonymous_id) {
      updateData.anonymous_id = aid || crypto.randomUUID();
    }
    await prisma.loyaltyCustomer.update({
      where: { id: customer.id },
      data: updateData,
    });

    const response = new NextResponse(new Uint8Array(pkpassBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${slug}-stempelkarte.pkpass"`,
      },
    });
    // CRITICAL: customer_id Cookie mit EIGENEM Namen (_cid) — nicht überschreiben!
    const secure = loyaltyCookieSecure(request);
    response.cookies.set(`loyalty_${slug}_cid`, String(customer.id), {
      httpOnly: true,
      maxAge: 31536000,
      sameSite: "lax",
      secure,
      path: "/",
    });
    // 'saved' Cookie für Popup-Suppression (separater Name)
    response.cookies.set(`loyalty_${slug}`, "saved", {
      httpOnly: false,
      maxAge: 31536000,
      sameSite: "lax",
      secure,
      path: "/",
    });
    return response;
  } catch (err) {
    return errorResponse(err);
  }
}
