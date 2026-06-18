// ════════════════════════════════════════════════════════════════════
// digi-gastro Service Worker v1.0
// Cache-First für statische Assets, Network-First für API/WebSocket
// ════════════════════════════════════════════════════════════════════

const CACHE_VERSION = 'digi-gastro-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Statische Assets die gecacht werden (Cache-First)
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/static/css/design_system.css?v=17',
    '/static/css/tailwind-built.css?v=3',
    '/static/css/sitzplan.css',
    '/static/images/digigastrologo.jpeg',
    '/static/images/icon-192.png',
    '/static/images/icon-512.png',
    '/static/images/favicon-32.png',
    '/static/images/favicon-16.png',
    '/apple-touch-icon.png',
];

// Pfade die NIEMALS gecacht werden sollen (immer Network-First)
const NEVER_CACHE_PATTERNS = [
    /\/api\//,              // API-Calls
    /\/admin\//,            // Admin-Dashboard (dynamisch)
    /\/ws\//,               // WebSocket
    /\/uploads\//,          // Kunden-Uploads (logos, produkte)
    /\/deer-lounge\//,      // Tenant-Slugs
    /\/digi-gastro-admin/,  // Platform-Admin
];

// ────────────────────────────────────────────────────────────────────
// INSTALL: Pre-cache statische Assets
// ────────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    console.log('[SW] Install — precaching static assets');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
            .catch((err) => console.warn('[SW] Pre-cache Fehler (nicht kritisch):', err))
    );
});

// ────────────────────────────────────────────────────────────────────
// ACTIVATE: Alte Caches löschen, neue übernehmen
// ────────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate —清理 alte caches');
    event.waitUntil(
        caches.keys()
            .then((keys) => {
                return Promise.all(
                    keys
                        .filter((key) => !key.startsWith(CACHE_VERSION))
                        .map((key) => {
                            console.log('[SW] Lösche alten Cache:', key);
                            return caches.delete(key);
                        })
                );
            })
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

    // Skip nicht-cachebare Pfade (API, Admin, WebSocket, Uploads)
    if (NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
        return; // Browser handles request normally
    }

    // ── Strategie 1: Cache-First für statische Assets ──
    // /static/* und manifest.json und apple-touch-icon.png
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
// CACHE-FIRST: Cache → Fallback: Network
// Für statische Assets (CSS, JS, Bilder, Icons)
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
// NETWORK-FIRST: Network → Fallback: Cache
// Für HTML-Seiten (immer frisch wenn online, Cache wenn offline)
// ────────────────────────────────────────────────────────────────────
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        // Offline: versuche Cache
        const cached = await caches.match(request);
        if (cached) return cached;

        // Fallback: Startseite aus Static-Cache
        const fallback = await caches.match('/');
        if (fallback) return fallback;

        // Letzter Ausweg: 508-Lookback-Response
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
