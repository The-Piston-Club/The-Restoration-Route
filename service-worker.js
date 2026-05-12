
const CACHE_NAME = 'restoration-route-v3-scale-fix';
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./route-data.json",
  "./assets/workshop-bg.jpg",
  "./assets/service-book-bg.jpg",
  "./assets/parts/airfilter-broken.png",
  "./assets/parts/airfilter-repaired.png",
  "./assets/parts/battery-broken.png",
  "./assets/parts/battery-repaired.png",
  "./assets/parts/brakepads-broken.png",
  "./assets/parts/brakepads-repaired.png",
  "./assets/parts/drivebelt-broken.png",
  "./assets/parts/drivebelt-repaired.png",
  "./assets/parts/headlight-broken.png",
  "./assets/parts/headlight-repaired.png",
  "./assets/parts/oilfilter-broken.png",
  "./assets/parts/oilfilter-repaired.png",
  "./assets/parts/sparkplugs-broken.png",
  "./assets/parts/sparkplugs-repaired.png",
  "./assets/parts/tyre-broken.png",
  "./assets/parts/tyre-repaired.png"
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => cached)));
});
