const CACHE_NAME = 'publisher-erp-v5'; // העלינו גרסה כדי לאפס לחלוטין את הטלפון

// 1. התקנה חלקה ומיידית ברקע
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. הפעלה וניקוי מוחלט של כל קאש או אפליקציה ישנה שתקועה בטלפון
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. אסטרטגיית רשת פשוטה: בלי לשמור בכוח דברים שעלולים להפיל את ההתקנה
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
