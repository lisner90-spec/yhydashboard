const CACHE_NAME = 'publisher-erp-v1';

self.addEventListener('install', (event) => {
  // מכריח את הדפדפן להתקין את הגרסה החדשה מיד
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // מפעיל את ה-Service Worker מיד ללא המתנה
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // מעביר את כל הבקשות לרשת כרגיל (חובה כדי לאפשר התקנת PWA)
  event.respondWith(
    fetch(event.request).catch(() => new Response('Offline'))
  );
});
