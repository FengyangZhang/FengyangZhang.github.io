/* Offline cache for /escape/ only. Bump CACHE when assets change. */
const CACHE = 'xingzhu-escape-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',
  './css/game.css',
  './js/engine/iso.js',
  './js/engine/path.js',
  './js/engine/audio.js',
  './js/render/art.js',
  './js/render/scene.js',
  './js/data/world.js',
  './js/data/rooms.js',
  './js/game/logic.js',
  './js/game/grid.js',
  './js/game/state.js',
  './js/game/sim.js',
  './js/game/actions.js',
  './js/game/ui.js',
  './js/game/main.js',
  './icons/apple-touch-icon.png',
  './icons/icon-32.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/escape')) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return caches.match(event.request);
      });
    }),
  );
});
