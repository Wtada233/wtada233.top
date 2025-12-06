const CACHE_NAME = 'fuwari-cache-v1';
const urlsToCache = [
  '/'
];

// Dynamically add all files from the public directory
// This approach is simplified for static files known at build time.
// For dynamic content, a more advanced caching strategy would be needed.
self.addEventListener('install', event => {
  const allUrlsToCache = [
    '/',
    '/gemini-color.png',
    '/hk4e_zh-cn.woff2',
    '/favicon/favicon-dark-128.png',
    '/favicon/favicon-dark-180.png',
    '/favicon/favicon-dark-192.png',
    '/favicon/favicon-dark-32.png',
    '/favicon/favicon-light-128.png',
    '/favicon/favicon-light-180.png',
    '/favicon/favicon-light-192.png',
    '/favicon/favicon-light-32.png'
  ];

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(allUrlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
