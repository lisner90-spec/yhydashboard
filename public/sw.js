// Service Worker מעודכן להוצאה לאור ירוחם - ניקוי מטמון מלא
const CACHE_NAME = 'yhy-publisher-v3';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
```
eof

### 📱 שלבי חובה לאיפוס מלא בטלפון:
1. **מחק לחלוטין** את האפליקציה ממסך הבית של הטלפון.
2. **סגור את כל הטאבים** הפתוחים של האתר בדפדפן (ספארי או כרום).
3. היכנס מחדש לקישור האתר, לחץ על "הוסף למסך הבית" – ועכשיו ההתקנה תעבוד חלק ומהיר! תעדכן אותי.
