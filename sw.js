const CACHE_NAME = 'sebquest-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',

  // Pages
  '/pages/carte.html',
  '/pages/jeu1.html',
  '/pages/jeu2.html',
  '/pages/jeu3.html',

  // JS
  '/assets/js/carte.js',
  '/assets/js/cinematic.js',
  '/assets/js/jeu1.js',
  '/assets/js/jeu2.js',
  '/assets/js/jeu3.js',
  '/assets/js/lang.js',
  '/assets/js/main_menu.js',

  // CSS
  '/assets/styles/base.css',
  '/assets/styles/carte.css',
  '/assets/styles/jeu2.css',
  '/assets/styles/jeu3.css',
  '/assets/styles/jeu_1.css',
  '/assets/styles/main_menu.css',

  // Fonts
  '/assets/styles/fonts/Jersey10-Regular.ttf',
  '/assets/styles/fonts/JoyquestSample.ttf',

  // Images menu
  '/assets/img/menu/game_title.svg',
  '/assets/img/menu/intro.jpg',

  // Images jeu1
  '/assets/img/jeu1/benner.png',
  '/assets/img/jeu1/jeu_1.jpg',
  '/assets/img/jeu1/lehmann.svg',
  '/assets/img/jeu1/pigeon.png',
  '/assets/img/jeu1/poop.png',
  '/assets/img/jeu1/status_bar.svg',

  // Images jeu2
  '/assets/img/jeu2/background-mobile.png',
  '/assets/img/jeu2/background2.jpg',
  '/assets/img/jeu2/cadre_recette.svg',
  '/assets/img/jeu2/dollfus.png',
  '/assets/img/jeu2/eau.svg',
  '/assets/img/jeu2/floss-idle-no-sail-transp.png',
  '/assets/img/jeu2/ingredients/dye.svg',
  '/assets/img/jeu2/ingredients/fabric.svg',
  '/assets/img/jeu2/ingredients/needle.svg',
  '/assets/img/jeu2/ingredients/scissors.svg',
  '/assets/img/jeu2/lehmann.png',
  '/assets/img/jeu2/malus/beer1.svg',
  '/assets/img/jeu2/malus/beer2.svg',
  '/assets/img/jeu2/malus/beer3.svg',
  '/assets/img/jeu2/malus/beer4.svg',
  '/assets/img/jeu2/river.svg',

  // Images jeu3
  '/assets/img/jeu3/engel-removebg-preview.png',
  '/assets/img/jeu3/koechlin_spritesheet.png',
  '/assets/img/jeu3/lambert-removebg-preview.png',

  // Sons
  '/assets/sound/music/discussion.mp3',
  '/assets/sound/music/intro.mp3',
  '/assets/sound/music/jeu2.mp3',
  '/assets/sound/music/jeu3.mp3',
  '/assets/sound/music/pigeon.mp3',
  '/assets/sound/sfx/poop.mp3',
  '/assets/sound/sfx/talking.mp3',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() =>
        new Response('<h1>Pas de connexion</h1>', {
          status: 503,
          headers: { 'Content-Type': 'text/html' },
        })
      );
    })
  );
});
