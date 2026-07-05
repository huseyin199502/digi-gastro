// digi-gastro — Service Worker DEAKTIVIERT
// PWA-Install funktioniert weiterhin via manifest.json (Chrome/Edge brauchen keinen SW seit 2023)
const SW_VERSION = '2026-07-03-v2'; // Performance + Memory-Leak Fixes
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', () => {});
