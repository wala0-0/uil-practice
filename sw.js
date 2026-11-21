// keeps the practice page for offline: the network first, the saved copy when there's no wifi (ack.json: never saved)
var CACHE = 'practice-v2';
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png']);
  }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || /ack\.json$/.test(u.pathname)) return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () {
    return caches.match(e.request, {ignoreSearch: true}).then(function (r) { return r || caches.match('./'); });
  }));
});
