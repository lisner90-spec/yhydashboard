self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // נוכחות של הפונקציה הזו מספיקה כדי שהטלפון יאשר התקנה (PWA).
  // אין כאן שום לוגיקה שיכולה לחסום את הרשת או להתנגש עם הקאש.
});
