/* Offline cache for /escape/ only. Bump CACHE when assets change. */
const CACHE = 'xingzhu-escape-v13';

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
  './js/render/character.js',
  './js/render/scene.js',
  './js/render/nursery.js',
  './sprites/wife.png',
  './sprites/portrait.png',
  './sprites/silhouette.png',
  './sprites/toddler.png',
  './sprites/toddler-portrait.png',
  './sprites/nursery-bg.png',
  './sprites/nursery-crib.png',
  './sprites/nursery-shelf.png',
  './sprites/nursery-chest.png',
  './sprites/nursery-table.png',
  './sprites/actors/ranger.png',
  './sprites/actors/cowboy.png',
  './sprites/actors/cowgirl.png',
  './sprites/actors/dino.png',
  './sprites/actors/pig.png',
  './sprites/actors/potato.png',
  './sprites/actors/slinky.png',
  './sprites/actors/claw.png',
  './sprites/actors/horse.png',
  './sprites/actors/army.png',
  './sprites/toy-ranger.png',
  './sprites/toy-cowboy.png',
  './sprites/toy-cowgirl.png',
  './sprites/toy-dino.png',
  './sprites/toy-pig.png',
  './sprites/toy-potato.png',
  './sprites/toy-slinky.png',
  './sprites/toy-alien.png',
  './sprites/toy-horse.png',
  './sprites/toy-army.png',
  './sprites/parent-mom.png',
  './fonts/fusion-pixel-12px-zh_hans.woff2',
  './fonts/OFL.txt',
  './js/data/world.js',
  './js/data/levels.js',
  './js/data/rooms.js',
  './js/game/logic.js',
  './js/game/grid.js',
  './js/game/pick.js',
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
    caches.open(CACHE).then((cache) => cache.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.ok) cache.put(event.request, response.clone());
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') return cache.match('./index.html');
        return cache.match(event.request);
      });
    })),
  );
});
