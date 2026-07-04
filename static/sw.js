// digi-gastro Service Worker — DEAKTIVIERT
// SW wurde komplett deaktiviert um Cache-Probleme zu lösen.
// Kein fetch-Handler, kein caching, keine offline-page.
// Browser macht alle Requests direkt ohne SW-Interception.
const SW_VERSION = '2026-07-02-v4';
const CACHE_NAME = `digi-gastro-${SW_VERSION}`;

// INSTALL: Sofort skipWaiting
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// ACTIVATE: ALLE Caches löschen, alle Clients reloaden
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
            .then(() => self.clients.matchAll({ type: 'window' }))
            .then((clients) => {
                clients.forEach((client) => client.navigate(client.url));
            })
    );
});

// FETCH: Nichts tun — Browser macht normale Requests
self.addEventListener('fetch', (event) => {
    return;
});
