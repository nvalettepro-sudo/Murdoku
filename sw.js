/* Murdoku — service worker : jeu jouable hors ligne après la première visite. */
const CACHE = 'murdoku-1.14'; // = VERSION de js/version.js
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/version.js', './js/engine.js', './js/icons.js', './js/avatars.js', './js/board.js', './js/app.js',
  './fonts/montserrat-latin-400.woff2', './fonts/montserrat-latin-500.woff2', './fonts/montserrat-latin-600.woff2',
  './fonts/montserrat-latin-700.woff2', './fonts/montserrat-latin-800.woff2', './fonts/montserrat-latin-900.woff2',
  './assets/icon.svg', './assets/icon-180.png', './assets/icon-192.png', './assets/icon-512.png',
  './puzzles/art-school.js',
  './puzzles/backyard-garden.js',
  './puzzles/botanical-garden.js',
  './puzzles/car-repair.js',
  './puzzles/courtroom.js',
  './puzzles/golf-course.js',
  './puzzles/holiday-shopping.js',
  './puzzles/mystery-islands.js',
  './puzzles/netflix-and-kill.js',
  './puzzles/preppers.js',
  './puzzles/zoo.js',
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Réseau d'abord pour les fichiers du jeu (mises à jour), cache en secours (polices comprises : elles sont hébergées avec le jeu).
self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(function (res) {
      const copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () { return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match('./index.html'); }); }));
  }
});
