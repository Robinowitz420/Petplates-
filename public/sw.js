self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Intentionally minimal: no caching/offline behavior yet.
self.addEventListener('fetch', () => {
  // passthrough/no-op
});
