const CACHE_NAME = 'shoseijutsu-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './admin.html',
  './admin.css',
  './admin.js',
  './manifest.webmanifest',
  './assets/icons/app-icon-192.svg',
  './assets/icons/app-icon-512.svg',
  './assets/icons/tab-home.svg',
  './assets/icons/tab-techniques.svg',
  './assets/icons/tab-foundation.svg',
  './assets/icons/tab-mypage.svg',
  './assets/icons/demo-folder.svg',
  './assets/icons/demo-file.svg',
  './data/featured-techniques.js',
  './data/techniques.js',
  './data/foundation/index.js',
  './data/foundation/behavior.js',
  './data/foundation/cognition.js',
  './data/foundation/social.js',
  './data/foundation/structure.js',
  './data/foundation/wisdom.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match('./index.html'));
    }),
  );
});
