// Self-unregistering Service Worker to clean up cache-stuck clients and prevent unexpected reloads
const CACHE_NAME = 'cleanup-v9';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => caches.delete(key))
      );
    }).then(() => {
      return self.registration.unregister();
    })
  );
});
