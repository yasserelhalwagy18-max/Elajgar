/**
 * The service worker.
 *
 * It makes the app open when there is no connection, and - just as
 * important - it must never get in the way of the signed-in pages.
 *
 * The rule that matters most: **nothing that belongs to a user is ever
 * cached.** The API answers with the caller's own health record, and the
 * pages behind the login render it. Caching either of them would show one
 * person's data to whoever opens the app on the same device next, so the
 * requests below are always answered by the network and never stored.
 *
 * What *is* cached is the shell: the static files that Next.js serves with
 * a content hash in their name, and the offline page. Those are the same
 * for everybody, and a new build gives them new names, so the cache can be
 * thrown away and filled again.
 */

const VERSION = 'v3';
const SHELL_CACHE = `elajgar-shell-${VERSION}`;
const OFFLINE_URL = '/offline.html';

/** The files that make the app openable with no connection. */
const SHELL_FILES = [
  OFFLINE_URL,
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // A file that is missing must not stop the worker from installing.
      .then((cache) => Promise.allSettled(SHELL_FILES.map((file) => cache.add(file))))
      .then((results) => {
        const failed = results.filter((r) => r.status === 'rejected');
        console.log(
          '[sw] installed, ' + (results.length - failed.length) + '/' + results.length + ' shell files cached',
        );
        return self.skipWaiting();
      })
      .catch((error) => {
        // The worker still installs, but the shell is not cached, so the app
        // simply works without the offline page.
        console.error('[sw] the shell could not be cached:', error);
      }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        console.log('[sw] activated, caches before cleanup: ' + keys.join(', '));
        return Promise.all(keys.filter((key) => key !== SHELL_CACHE).map((key) => caches.delete(key)));
      })
      .then(() => self.clients.claim()),
  );
});

/**
 * A way to ask the running worker what it is.
 *
 * The browser keeps its own copy of the script, so the file on the server
 * and the worker that is actually running are not always the same. This
 * answers with the version of the worker that is really in charge.
 */
self.addEventListener('message', (event) => {
  const reply = { version: VERSION, cache: SHELL_CACHE };
  if (event.ports && event.ports[0]) {
    // Report what is actually in the cache, so the state can be checked
    // from the page.
    event.waitUntil(
      caches.keys().then((keys) => {
        reply.caches = keys;
        event.ports[0].postMessage(reply);
      }),
    );
  }
});

/**
 * Is this a request for the user's own data?
 *
 * Everything under `/api/` is, and so is any page that needs the session
 * cookie. The API is excluded by path; the pages are excluded by the fact
 * that they are navigations, which are never cached.
 */
function isPrivateRequest(url) {
  return url.pathname.startsWith('/api/');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only GET is cacheable. A POST must always reach the server.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Another origin - for example a font or an image from somewhere else.
  // The browser handles those itself.
  if (url.origin !== self.location.origin) return;

  // The user's own data: straight to the network, never stored.
  if (isPrivateRequest(url)) return;

  // A page. The shell is fetched from the network so that a signed-in user
  // always gets their own page, and the offline page is the fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // A server error is no more use to the user than no connection at
          // all - a blank error page helps nobody - so the offline page is
          // shown for those too.
          if (response.status >= 500) {
            throw new Error('the server answered ' + response.status);
          }
          return response;
        })
        .catch(() =>
          caches.match(OFFLINE_URL).then(
            (cached) =>
              cached ||
              new Response(
                '<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8">' +
                  '<body style="font-family:system-ui;padding:2rem;text-align:center">' +
                  '<h1>ارتباط با اینترنت برقرار نیست</h1>' +
                  '<p>برای دیدن اطلاعات، دوباره تلاش کنید.</p></body></html>',
                { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
              ),
          ),
        ),
    );
    return;
  }

  // A prefetch is Next.js guessing that the user is about to open a page.
  // The answer is a rendered page, so it must not be stored either.
  if (request.headers.get('Next-Router-Prefetch') || request.headers.get('Purpose') === 'prefetch') {
    return;
  }

  // Only the static files are cached: Next.js serves them with a content
  // hash in their name, so a cached one is always the right one, and they
  // are the same for everybody. The icons, the manifest and the offline
  // page are put in the cache when the worker installs.
  if (!url.pathname.startsWith('/_next/static/')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Only a real, complete response is worth keeping.
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
    }),
  );
});
