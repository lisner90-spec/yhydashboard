// Service Worker נקי ומאופס לחלוטין המאפשר התקנת PWA חלקה בטלפון
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // מעביר את הבקשות ישירות לרשת בלי חסימות מטמון
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
```
eof

### 🚨 חובה לבצע את 3 השלבים האלו בטלפון כדי שהשינוי יתפוס:
1. **מחק לגמרי** את האפליקציה ממסך הבית של הטלפון.
2. **סגור את כל הטאבים** הפתוחים של האתר בדפדפן (ספארי באייפון או כרום באנדרואיד).
3. היכנס מחדש לכתובת האתר, לחץ על **"הוסף למסך הבית"** – וכפתור ההתקנה יופיע ויעבוד מיד! תעדכן אותי.
