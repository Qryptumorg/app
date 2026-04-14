/* QryptAir Service Worker — scoped to /app/air */
const CACHE = "qryptair-v1";

const SHELL = [
    "/app/",
    "/app/air-manifest.json",
    "/app/logo-192.png",
    "/app/apple-touch-icon.png",
    "/app/favicon.ico",
    "/app/qryptum-logo.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== "GET") return;

    const isSameOrigin = url.origin === self.location.origin;

    if (!isSameOrigin) return;

    if (url.pathname.startsWith("/api/")) return;

    const isNavigation = request.mode === "navigate";
    const isStaticAsset = /\.(js|css|woff2?|png|jpg|jpeg|svg|ico|webp|wasm)(\?.*)?$/.test(url.pathname);

    if (isNavigation) {
        event.respondWith(
            fetch(request)
                .then((res) => {
                    const clone = res.clone();
                    caches.open(CACHE).then((c) => c.put(request, clone));
                    return res;
                })
                .catch(() =>
                    caches.match("/app/").then((r) => r || caches.match(request))
                )
        );
        return;
    }

    if (isStaticAsset) {
        event.respondWith(
            fetch(request)
                .then((res) => {
                    if (res.ok) {
                        const clone = res.clone();
                        caches.open(CACHE).then((c) => c.put(request, clone));
                    }
                    return res;
                })
                .catch(() => caches.match(request))
        );
        return;
    }
});
