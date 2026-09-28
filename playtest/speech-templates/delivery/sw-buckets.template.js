// Super Ninja service worker, hash-bucketed asset caches (reference for src/pwa/sw.template.js; see
// docs/speech-templates/delivery.md §4). Tested by sw-test.mjs in Chromium and WebKit.
//
// The build fills in BUCKETS with { folder: 16 bucket versions × 6 hex chars } for everything under public/a/
// (buckets.ts), and CODE_FILES with the build's /assets/ file names. A clip lives in the cache named after its folder,
// bucket and bucket version ("sn-a:t/say_slowly:5:3fa9c1"), keyed by its bare path. When a deploy changes a clip, only
// that bucket's version changes: activate drops that one small cache, and every other cached clip stays. No step ever
// lists a big cache's entries (Chromium's Cache.keys() throws "Operation too large" at about 16–20 thousand entries).
const BUCKETS = __SN_BUCKETS__;
const CODE_FILES = new Set(__SN_CODE__);
const NB = 16;
const W = 6;
const SHELL = "sn-shell-v1";
const CODE = "sn-code";
const MEDIA = /^(audio|image|video)\//;

const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};
/** "/a/t/say_slowly/mat.mp3" → its bucket's version and cache name; null for a folder the build doesn't know. */
function slot(pathname) {
  const rel = pathname.slice(3);
  const i = rel.lastIndexOf("/");
  const vs = i > 0 ? BUCKETS[rel.slice(0, i)] : undefined;
  if (!vs) return null;
  const b = fnv(rel.slice(i + 1)) % NB;
  const v = vs.slice(b * W, b * W + W);
  return { v, name: `sn-a:${rel.slice(0, i)}:${b}:${v}` };
}
const current = (name) => {
  const m = /^sn-a:(.+):(\d+):([0-9a-f]+)$/.exec(name);
  return !!m && BUCKETS[m[1]]?.slice(+m[2] * W, +m[2] * W + W) === m[3];
};

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(
    (async () => {
      // only cache NAMES are listed here (a few hundred at most), never a big cache's entries
      for (const k of await caches.keys()) if (k !== SHELL && k !== CODE && !current(k)) await caches.delete(k);
      const code = await caches.open(CODE);
      for (const r of await code.keys()) if (!CODE_FILES.has(new URL(r.url).pathname)) await code.delete(r);
      await self.clients.claim();
    })(),
  ),
);

// Open caches per request (about 0.1 ms). Holding Cache handles across a worker update lost entries in WebKit's
// ephemeral (private) sessions in sw-test.mjs; persistent profiles were fine either way.
const cacheFor = (name) => caches.open(name);

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (e.request.headers.has("range")) return; // music streams with range requests: the network handles those
  if (url.pathname.startsWith("/a/")) {
    const s = slot(url.pathname);
    if (!s) return;
    e.respondWith(
      (async () => {
        const c = await cacheFor(s.name);
        const hit = await c.match(url.pathname);
        if (hit) return hit;
        // ?v= keeps the browser's HTTP cache from answering with an older copy; the asset server ignores the query
        const res = await fetch(`${url.pathname}?v=${s.v}`);
        // a missing file comes back as the SPA's index.html with 200 (Workers not_found_handling): never cache that
        if (res.status === 200 && MEDIA.test(res.headers.get("content-type") ?? "")) e.waitUntil(c.put(url.pathname, res.clone()));
        return res;
      })(),
    );
    return;
  }
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      (async () => {
        const c = await cacheFor(CODE);
        const hit = await c.match(url.pathname);
        if (hit) return hit;
        const res = await fetch(e.request);
        if (res.status === 200) e.waitUntil(c.put(url.pathname, res.clone()));
        return res;
      })(),
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
