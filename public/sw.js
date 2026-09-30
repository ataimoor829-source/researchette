/* Researchette service worker: lets the portal install as an app and open offline.
   Network first, so a new deploy is picked up straight away; the cache is only a fallback. */
var CACHE = 'researchette-v40';
var SHELL = ['portal.html', 'assets/portal.css', 'assets/liquid.css', 'assets/portal.js', 'assets/store.js', 'assets/curriculum.js', 'assets/fx.js', 'assets/icons/icon-192.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.indexOf('/api/') === 0) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('portal.html'); });
  }));
});
