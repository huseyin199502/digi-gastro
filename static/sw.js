// ════════════════════════════════════════════════════════════════════
// digi-gastro Service Worker
// Cache-First für statische Assets, Network-First (OHNE HTML-Cache) für Navigationen
// ════════════════════════════════════════════════════════════════════

// SW_VERSION — Auto-Versionierung via Build-Timestamp.
// Format YYYY-MM-DD-v<N>: Datum = Deploy-Tag, v<N> = Revisionszähler pro Tag.
// Bei JEDEM Code-/Asset-Update bumpen (sonst merkt der Browser kein SW-Update
// wegen Byte-Equal-Check). Bei gleichem Tag v2, v3, ... sonst neues Datum ab v1.
// Update 2026-06-22-v1: Phase 2 — IMAGE_CACHE (Cache-First für /uploads/ und
// /static/images/, 30 Tage TTL), Auto-Versionierung, Static-Cache-Kommentare.
const SW_VERSION = '2026-06-28-v2'; // bumped: Produkt-Grid Mobile 2-Spalten + Load-More Pagination (25/Seite)
const CACHE_NAME = `digi-gastro-${SW_VERSION}`;
const STATIC_CACHE = `${CACHE_NAME}-static`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;  // separater Cache für Bilder (Cache-First + 30d TTL)
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`;

// TTL für Bild-Cache: 30 Tage in ms (Bilder ändern sich selten, WebP-Conversion ist one-shot)
const IMAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
// HTTP-Header-Name zum Speichern des Cache-Zeitstempels an Bild-Responses
const SW_CACHED_AT_HEADER = 'X-SW-Cached-At';
// Pattern für Bild-URLs (Datei-Endungen + destination=image Fallback)
const IMAGE_URL_PATTERN = /\.(?:png|jpe?g|webp|gif|svg|avif|ico)$/i;

// Statische Assets die gecacht werden (Cache-First, Pre-Cache bei Install).
// WICHTIG: '/' bewusst NICHT precachen — Landingpage ist dynamisch
// (Login-Status, login_target) und würde sonst veraltete/personalisierte
// Versionen ausliefern (Issues 6.21 + 6.22).
//
// Phase 2: /static/css/ und /static/js/ sind im Fetch-Handler über
// url.pathname.startsWith('/static/') bereits Cache-First abgedeckt. Die
// Precache-Liste enthält nur die konkret bekannten Dateien mit Versions-Query.
// /static/js/ existiert aktuell nicht als Verzeichnis — JS wird inline oder
// über CDN geliefert. Falls künftig /static/js/*.js Dateien hinzukommen, hier
// ergänzen (z.B. '/static/js/app.js?v=1').
const STATIC_ASSETS = [
    '/manifest.json',
    // ── /static/css/ (Cache-First bei jedem Request via fetch-handler) ──
    '/static/css/design_system.css?v=17',
    '/static/css/tailwind-built.css?v=3',
    '/static/css/sitzplan.css',
    '/apple-touch-icon.png',
];

// Bild-Assets die beim Install in den IMAGE_CACHE precached werden (mit
// X-SW-Cached-At Timestamp, sodass die 30-Tage-TTL-Logik sofort greift).
// /static/images/* geht durch imageCacheFirst() — nicht durch cacheFirst().
const IMAGE_ASSETS = [
    '/static/images/digigastrologo.jpeg',
    '/static/images/icon-192.png',
    '/static/images/icon-512.png',
    '/static/images/favicon-32.png',
    '/static/images/favicon-16.png',
];

// Pfade die NIEMALS gecacht werden sollen (immer Network-First)
// Phase 2: /uploads/ ENTFERNT — Bilder aus /uploads/ sind jetzt Cache-First
// via IMAGE_CACHE (30 Tage TTL). Siehe imageCacheFirst() und Fetch-Handler.
// /uploads/ enthält nur Kunden-Uploads (Logos, Produktbilder), alles Bilder.
const NEVER_CACHE_PATTERNS = [
    /\/api\//,              // API-Calls
    /\/admin\//,            // Admin-Dashboard (dynamisch)
    /\/ws\//,               // WebSocket
    /\/deer-lounge\//,      // Tenant-Slugs
    /\/digi-gastro-admin/,  // Platform-Admin
    /\/login/,              // Login-Seite (authed-context)
    /^\/$/,                 // Root-Landingpage (dynamisch, personalisiert)
];

// ────────────────────────────────────────────────────────────────────
// INSTALL: Pre-cache statische Assets + Bild-Assets (parallel)
// ────────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    console.log('[SW] Install — precaching static + image assets');
    event.waitUntil(
        Promise.all([
            // ── Static assets (CSS, manifest, apple-touch-icon) → STATIC_CACHE ──
            caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
            // ── Image assets → IMAGE_CACHE (mit TTL-Timestamp) ──
            // fetch einzeln (statt addAll), weil wir Custom-Header setzen müssen.
            caches.open(IMAGE_CACHE).then((cache) =>
                Promise.all(IMAGE_ASSETS.map(async (url) => {
                    try {
                        const response = await fetch(url);
                        if (!response || response.status !== 200) return;
                        const headers = new Headers(response.headers);
                        headers.set(SW_CACHED_AT_HEADER, Date.now().toString());
                        const cachedResponse = new Response(response.clone().body, {
                            status: response.status,
                            statusText: response.statusText,
                            headers,
                        });
                        await cache.put(url, cachedResponse);
                    } catch (e) {
                        // Einzelnes Bild darf fehlschlagen — nicht kritisch.
                        console.warn(`[SW] Pre-cache Bild fehlgeschlagen: ${url}`, e);
                    }
                }))
            ),
        ])
            .then(() => self.skipWaiting())
            .catch((err) => console.warn('[SW] Pre-cache Fehler (nicht kritisch):', err))
    );
});

// ────────────────────────────────────────────────────────────────────
// ACTIVATE: Alte Caches löschen, neue übernehmen
// ────────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate — cleanup alte caches für Version:', SW_VERSION);
    event.waitUntil(
        caches.keys()
            .then((keys) => {
                return Promise.all(
                    keys
                        .filter((key) => !key.startsWith(CACHE_NAME))
                        .map((key) => {
                            console.log('[SW] Lösche alten Cache:', key);
                            return caches.delete(key);
                        })
                );
            })
            // clients.claim() aktiviert den neuen SW sofort für alle offenen Tabs
            // (zusammen mit skipWaiting() in install). Verhindert, dass Nutzer
            // alte HTML/JS-Version mit neuem SW-Cache mismatch haben.
            .then(() => self.clients.claim())
    );
});

// ────────────────────────────────────────────────────────────────────
// FETCH: Strategie basierend auf URL-Pattern
// ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Nur GET-Requests behandeln
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Skip cross-origin requests (CDN, Google Fonts, etc.)
    if (url.origin !== self.location.origin) return;

    // Skip nicht-cachebare Pfade (API, Admin, WebSocket, etc.)
    // /uploads/ ist bewusst NICHT mehr hier — siehe imageCacheFirst().
    if (NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
        return; // Browser handles request normally
    }

    // ── Strategie 0: Bild-Cache-First NUR für /static/images/ ──
    // Bilder ändern sich selten (WebP-Conversion ist one-shot) → 30 Tage TTL,
    // separater IMAGE_CACHE (isoliert vom STATIC_CACHE, einfach zu invalidieren).
    //
    // WICHTIG: /uploads/ wird BEWUSST NICHT gecacht! Backend-Middleware
    // (main.py:717 no_cache_uploads_middleware) setzt Cache-Control: no-store
    // für /uploads/ — Kunden-Uploads (Logos, Produktfotos) dürfen nicht
    // offline-verfügbar sein (Schutz vor Cache-Klau).
    // Nur /static/images/ (Plattform-Icons, digi-gastro-Logos) bekommt 30d Cache.
    if (url.pathname.startsWith('/static/images/') &&
        (request.destination === 'image' || IMAGE_URL_PATTERN.test(url.pathname))) {
        event.respondWith(imageCacheFirst(request));
        return;
    }

    // ── Strategie 1: Cache-First für statische Assets ──
    // /static/* (css, js, verbleibende images) und manifest.json und apple-touch-icon.png
    if (url.pathname.startsWith('/static/') ||
        url.pathname === '/manifest.json' ||
        url.pathname === '/apple-touch-icon.png') {
        event.respondWith(cacheFirst(request));
        return;
    }

    // ── Strategie 2: Network-First für HTML-Seiten ──
    // /, /landing, /login, tenant-slug-Seiten
    if (request.mode === 'navigate' ||
        request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirst(request));
        return;
    }
});

// ────────────────────────────────────────────────────────────────────
// IMAGE-CACHE-FIRST: Cache (mit TTL) → Fallback: Network → Cache
// Für Bilder aus /uploads/ und /static/images/ (WebP/PNG/JPG/SVG/GIF/AVIF).
// Reines Cache-First mit 30-Tage-TTL (kein Background-Revalidate wie bei
// statischen Assets — Bilder ändern sich praktisch nie, WebP-Conversion ist
// one-shot). Cache-Zeitstempel wird via Custom-Header X-SW-Cached-At an der
// gecachten Response gespeichert (Original-Response an Client bleibt unverändert).
// ────────────────────────────────────────────────────────────────────
async function imageCacheFirst(request) {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);

    if (cached) {
        // TTL-Check: ist der Cache-Eintrag noch frisch?
        const cachedAtStr = cached.headers.get(SW_CACHED_AT_HEADER);
        const cachedAt = cachedAtStr ? parseInt(cachedAtStr, 10) : null;
        const isFresh = cachedAt !== null && (Date.now() - cachedAt) < IMAGE_TTL_MS;

        if (isFresh) {
            // Frisch → sofort ausliefern, kein Network-Call
            return cached;
        }
        // Abgelaufen → versuche Network-Refresh, behalte altes Bild als Fallback
    }

    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            // Response für Cache mit Custom-Header klonen und timestamp setzen.
            // Body-Stream wird vom Clone in die neue Response gepiped; Original
            // response bleibt für return unangetastet.
            const cacheHeaders = new Headers(response.headers);
            cacheHeaders.set(SW_CACHED_AT_HEADER, Date.now().toString());
            const cachedResponse = new Response(response.clone().body, {
                status: response.status,
                statusText: response.statusText,
                headers: cacheHeaders,
            });
            cache.put(request, cachedResponse);
        }
        return response;
    } catch (err) {
        // Network-Fehler → veralteten Cache als Notfall-Fallback ausliefern
        // (liefer veraltetes Bild als gar keines). Bei Cache-Miss: 204 No Content.
        if (cached) return cached;
        return new Response('', { status: 204, headers: { 'Content-Type': 'image/svg+xml' } });
    }
}

// ────────────────────────────────────────────────────────────────────
// CACHE-FIRST: Cache → Fallback: Network (+ Background-SWR)
// Für statische Assets (CSS, JS, Icons, manifest.json).
// Hinweis: Bilder (png/jpg/webp) aus /static/images/ werden VOR dieser Funktion
// in imageCacheFirst() abgefangen — sie bekommen 30d-TTL ohne Background-SWR.
// ────────────────────────────────────────────────────────────────────
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        // Im Hintergrund updaten (stale-while-revalidate)
        fetch(request).then((response) => {
            if (response && response.status === 200) {
                caches.open(STATIC_CACHE).then((cache) => cache.put(request, response));
            }
        }).catch(() => {});
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        // Offline-Fallback für Bilder
        if (request.destination === 'image') {
            return new Response('', { status: 204 });
        }
        throw err;
    }
}

// ────────────────────────────────────────────────────────────────────
// NETWORK-FIRST: Network → Fallback: Offline-Response (KEIN HTML-Cache!)
// Für HTML-Seiten (immer frisch wenn online, Offline-Response wenn offline)
//
// WICHTIG (Issue 6.22): HTML-Navigationen werden bewusst NICHT im Cache
// abgelegt, damit keine authentifizierten/personalisierten Seiten
// (Login-Status, Chef-Ansicht, etc.) überleben und versehentlich anderen
// Nutzern auf demselben Gerät angezeigt werden. Statische Assets bleiben
// weiterhin cache-first (siehe cacheFirst()).
// ────────────────────────────────────────────────────────────────────
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        // HTML-Navigationen bewusst NICHT cachen (Issue 6.21 + 6.22).
        // Statische Assets werden bereits in cacheFirst() behandelt.
        return response;
    } catch (err) {
        // Offline: versuche Cache (sollte bei HTML nichts finden — by design)
        const cached = await caches.match(request);
        if (cached) return cached;

        // Letzter Ausweg: 503-Offline-Response
        return new Response(
            `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;text-align:center;">
            <h2>Offline</h2>
            <p>Du bist offline. Bitte überprüfe deine Internetverbindung.</p>
            </body></html>`,
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
    }
}

// ────────────────────────────────────────────────────────────────────
// MESSAGE: Erlaube Page-Reload nach Update
// ────────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
