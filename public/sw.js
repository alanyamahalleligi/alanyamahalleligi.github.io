// Çevrimdışı destek: sayfalar önce ağdan alınır, bağlantı yoksa son kopya gösterilir.
const CACHE = 'aml-v5';
const SHELL = ['/', '/index.html', '/firebase-config.js', '/icon.svg', '/icon-192.png', '/manifest.webmanifest'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Sayfa adresleri (/fikstur, /takim/alara ...) hep aynı uygulama dosyasını açar
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch('/index.html').then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put('/index.html', copy)); return r;
    }).catch(() => caches.match('/index.html')));
    return;
  }
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
// Bildirime dokununca ilgili maç sayfasını aç
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data && e.notification.data.url || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => {
    for (const c of cs) { if ('focus' in c) { c.navigate(url); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
