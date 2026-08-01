const CACHE_NAME = 'construction-hub-v3.5.1';
const APP_SHELL = [
  './',
  './index.html',
  './style.css?v=3.5.1',
  './app.js?v=3.5.1',
  './manifest.json'
];
const OPTIONAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap',
  'https://unpkg.com/lucide@latest',
  'https://cdn-icons-png.flaticon.com/512/3063/3063823.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(APP_SHELL);
      await Promise.allSettled(OPTIONAL_ASSETS.map(asset => cache.add(asset)));
      console.log('[SW] App shell cached');
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);

  // Navigations use network-first so new deployments appear immediately.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Same-origin assets refresh safely in the background.
        if (requestUrl.origin === self.location.origin) {
          event.waitUntil(
            fetch(event.request).then(networkResponse => {
              if (networkResponse.ok) return caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
            }).catch(() => undefined)
          );
        }
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        if (requestUrl.origin === self.location.origin && networkResponse.ok) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return networkResponse;
      });
    })
  );
});
