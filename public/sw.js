const CACHE_VERSION = 'ekantin-v1';
const OFFLINE_URL = '/offline.html';

// Install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => cache.add(OFFLINE_URL))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — network first for HTML, cache first for static assets
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip payment URLs — never cache
    if (request.url.includes('/payment/') || request.url.includes('bayarcash') || request.url.includes('toyyibpay')) {
        return;
    }

    // HTML pages — network first
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }

    // Static assets — cache first
    if (request.url.includes('/build/') || request.url.includes('/icons/')) {
        event.respondWith(
            caches.match(request).then((cached) =>
                cached || fetch(request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
                    return response;
                })
            )
        );
        return;
    }
});
