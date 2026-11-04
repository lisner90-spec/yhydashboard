// Service Worker מעודכן להוצאה לאור ירוחם
const CACHE_NAME = 'yhy-publisher-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // מעבר רשת רגיל כדי למנוע חסימות טעינה
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
