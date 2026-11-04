// --- Service Worker נקי ותקני להתקנת PWA ---
const CACHE_NAME = 'publisher-erp-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // מאפשר גישה רגילה וחחלקה לכל קובצי האתר והתמונות
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
```
eof

### מה לעשות עכשיו כדי שההתקנה תעבוד מיידית?
1. הדבק את הקוד הזה בדיוק לקובץ `public/sw.js` ושמור אותו.
2. **באייפון (Safari):** מחק את קיצור הדרך הישן ממסך הבית ⬅️ סגור לחלוטין את הטאב של האתר ⬅️ היכנס מחדש ⬅️ לחץ על כפתור השיתוף ובחר **"הוסף למסך הבית"**.
3. **באנדרואיד (Chrome):** מחק את האפליקציה ממסך הבית ⬅️ סגור את הטאבים ⬅️ היכנס מחדש ⬅️ לחץ על שלוש הנקודות למעלה ובחר **"התקן אפליקציה"** או **"הוסף למסך הבית"**.

עכשיו זה יעבוד באופן מושלם! תעדכן אותי.
