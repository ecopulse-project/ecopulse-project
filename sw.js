```javascript
const CACHE_NAME = "ecopulse-v2";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon.svg"
];

self.addEventListener("install", event => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const request = event.request;

    if (
        request.method !== "GET" ||
        new URL(request.url).origin !== self.location.origin
    ) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request, { cache: "no-store" })
                .then(response => {
                    const copy = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => cache.put("./index.html", copy));

                    return response;
                })
                .catch(() => caches.match("./index.html"))
        );
    }
});
```
