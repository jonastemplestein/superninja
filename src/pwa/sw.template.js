// Super Ninja service worker: cache-first for game assets, network-first for the app shell so updates arrive quickly.
// Audio and pictures under /a/ keep their URLs when they're re-recorded or redrawn, so the asset cache is versioned:
// the build emits this file as /sw.js with __SN_ASSETS__ replaced by a hash of everything under /a/ (vite.config.ts, swVersion). A changed asset
// changes this file, the browser installs the new worker, and activate drops the old caches.
const ASSETS = "sn-assets-__SN_ASSETS__";
const SHELL = "sn-shell-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k !== ASSETS && k !== SHELL) await caches.delete(k);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.startsWith("/a/") || url.pathname.startsWith("/assets/")) {
    // music is streamed with range requests; let the network handle those
    if (e.request.headers.has("range")) return;
    e.respondWith(
      caches.open(ASSETS).then(async (c) => {
        const hit = await c.match(e.request);
        if (hit) return hit;
        const res = await fetch(e.request);
        if (res.ok && res.status === 200) c.put(e.request, res.clone());
        return res;
      }),
    );
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r ?? caches.match(url.pathname.startsWith("/play") ? "/play/" : "/"))),
  );
});
