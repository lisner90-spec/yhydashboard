const CACHE_NAME = 'publisher-erp-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
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

self.addEventListener('fetch', (event) => {
  // אם זו בקשה לניווט בעמוד (כמו טעינה ראשונית)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // מחזיר דף HTML בסיסי שעובר את הבדיקות של גוגל/אפל למצב לא מקוון
        return new Response(
          '<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>אין חיבור</title></head><body style="text-align:center; padding:50px; font-family:sans-serif;"><h2>אין חיבור לאינטרנט</h2><p>אנא בדוק את החיבור שלך ונסה שוב.</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
  } else {
    // לשאר הבקשות (תמונות, סקריפטים)
    event.respondWith(
      fetch(event.request).catch(() => new Response())
    );
  }
});
