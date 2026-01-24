const CACHE_VERSION = 'v2024-11-05';
const CACHE_NAME = `shoseijutsu-cache-${CACHE_VERSION}`;
const ASSETS = [
  './styles.css',
  './app.js',
  './admin.css',
  './admin.js',
  './manifest.webmanifest',
  './assets/icons/app-icon-192.png',
  './assets/icons/app-icon-512.png',
  './assets/icons/tab-home.png',
  './assets/icons/tab-techniques.png',
  './assets/icons/tab-foundation.png',
  './assets/icons/tab-hub.png',
  './assets/icons/demo-folder.png',
  './assets/icons/demo-file.png',
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

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const acceptHeader = event.request.headers.get('accept') || '';
  const isHtmlRequest =
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    acceptHeader.includes('text/html');
  const isScriptOrStyle =
    event.request.destination === 'script' || event.request.destination === 'style';

  if (isHtmlRequest) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(event.request, { cache: 'no-store' });
        } catch (error) {
          return Response.error();
        }
      })(),
    );
    return;
  }

  if (isScriptOrStyle) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const response = await fetch(event.request, { cache: 'no-store' });
          if (response && response.status === 200 && response.type !== 'opaque') {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch (error) {
          const cachedResponse = await cache.match(event.request);
          return cachedResponse || Response.error();
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type !== 'opaque') {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })(),
  );
});
