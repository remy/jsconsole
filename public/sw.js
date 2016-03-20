/* global self, caches, fetch, URL */
const version = 'v1.00::';
const staticCacheName = version + 'static';

self.addEventListener('install', e => {
  // once the SW is installed, go ahead and fetch the resources to make this
  // work offline
  e.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll([
        '/',
        '/css/console.css',
        '/assets/share.svg',
        '/assets/info.svg',
        '/assets/out.svg',
        '/assets/prompt.svg',
        '/assets/error.svg',
        '/js/console.js',
        '/js/EventSource.js',
        '/js/prettify.packed.js',
      ]).then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  var res = event.request;
  var url = new URL(res.url);
  if (url.pathname === '/') {
    // strip the query string
    url.search = '';
    res = url;
  }

  // when the browser fetches a url, either response with the cached object
  // or go ahead and fetch the actual url
  event.respondWith(
    caches.match(res).then(res => {
      if (!res) {
        // for me
        // console.warn('not in cache: %s', event.request.url);
      }

      return res || fetch(event.request);
    })
  );
});