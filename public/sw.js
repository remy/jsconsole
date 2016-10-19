/* global self, caches, fetch, URL */
const version = '$VERSION';
const staticCacheName = `v${version}::static`;

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
        '/js/version.js',
        '/js/copy.js',
        '/js/console.js',
        '/js/EventSource.js',
        '/js/prettify.packed.js',
      ]).then(() => self.skipWaiting());
    })
  );
});

function clearOldCaches() {
  return caches.keys().then(keys => {
    return Promise.all(keys
      .filter(key => key !== staticCacheName)
      .map(key => caches.delete(key))
    );
  });
}

self.addEventListener('activate', event => {
  event.waitUntil(clearOldCaches().then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  var res = event.request;
  var url = new URL(res.url);
  if (url.pathname === '/') {
    // strip the query string
    url.search = '';
    res = url;
  }

  if (url.pathname === '/js/version.js') {
    return event.respondWith(new Response(`var version = '${version}' // generated`, {
      headers: {
        'content-type': 'text/javascript',
      },
    }));
  }

  // when the browser fetches a url, either response with the cached object
  // or go ahead and fetch the actual url
  event.respondWith(
    caches.open(staticCacheName).then(cache => {
      return cache.match(res).then(res => {
        return res || fetch(event.request);
      })
    })
  );
});
