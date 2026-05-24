const CACHE_NAME = 'gold-miner-v2';

const ASSETS = [
  'index.html',
  'manifest.json',
  'icon.svg',
  'css/style.css',
  'js/constants.js',
  'js/utils.js',
  'js/input.js',
  'js/mineral.js',
  'js/hook.js',
  'js/level.js',
  'js/shop.js',
  'js/renderer.js',
  'js/main.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
