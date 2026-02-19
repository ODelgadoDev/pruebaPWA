const CACHE = "rpglog-cache-v1";

// Archivos base para que NO se rompa offline (incluye CSS y JS)
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/src/app.js",
  "/src/style.css"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Cache-first para assets
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});