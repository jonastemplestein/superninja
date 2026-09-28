// Tests the hash-bucketed service worker (sw-buckets.template.js) in Chromium and WebKit:
//   node playtest/speech-templates/delivery/sw-test.mjs          (ONLY=chromium|webkit, EPHEMERAL=1 for a private-style context)
// A fake site with 2,000 templated clips (and a few lines) is served like Cloudflare serves dist/: a missing file comes
// back as index.html with 200. The page fetches 300 clips, reloads, re-records one clip, deploys a new worker and
// fetches them again. Expected: the second pass is all cache; after the re-record only the changed clip's bucket
// (about 1/16 of its folder) goes back to the network; the SPA fallback is never cached; stale caches are gone.
import { chromium, webkit } from "../../../node_modules/playwright/index.mjs";
import http from "node:http";
import { mkdirSync, writeFileSync, readFileSync, existsSync, renameSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomBytes } from "node:crypto";

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, "../../runs/speech-templates/delivery/sw-site");
const NB = 16, W = 6;
const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; };

// ---- the fake site
const clips = [];
mkdirSync(join(site, "../old"), { recursive: true });
if (existsSync(site)) renameSync(site, join(site, `../old/sw-site-${Date.now()}`)); // no rm: old copies stay under playtest/runs (git-ignored)
for (let i = 0; i < 2000; i++) clips.push(`/a/t/say_slowly/w${i}.mp3`);
for (let i = 0; i < 100; i++) clips.push(`/a/l/line_${i}.mp3`);
for (const c of clips) { mkdirSync(dirname(join(site, c)), { recursive: true }); writeFileSync(join(site, c), randomBytes(800)); }
writeFileSync(join(site, "index.html"), `<!doctype html><title>sw test</title><script>navigator.serviceWorker.register("/sw.js")</script>`);
mkdirSync(join(site, "assets"), { recursive: true });
writeFileSync(join(site, "assets/play-1.js"), "1");

function buildSw() {
  const byDir = {};
  for (const c of clips) {
    const rel = c.slice(3), i = rel.lastIndexOf("/"), dir = rel.slice(0, i), file = rel.slice(i + 1);
    (byDir[dir] ??= Array.from({ length: NB }, () => [])).at(fnv(file) % NB).push(`${file}\0${createHash("sha1").update(readFileSync(join(site, c))).digest("hex")}`);
  }
  const table = Object.fromEntries(Object.entries(byDir).map(([d, bs]) => [d, bs.map((b) => (b.length ? createHash("sha1").update(b.sort().join("\n")).digest("hex").slice(0, W) : "0".repeat(W))).join("")]));
  let src = readFileSync(join(here, "sw-buckets.template.js"), "utf8");
  src = src.replaceAll("__SN_BUCKETS__", JSON.stringify(table)).replaceAll("__SN_CODE__", JSON.stringify(["/assets/play-1.js"]))
    // debug: record what activate saw and did
    .replace("for (const k of await caches.keys()) if (k !== SHELL && k !== CODE && !current(k)) await caches.delete(k);", "const say = async (m) => { for (const c of await self.clients.matchAll({ includeUncontrolled: true })) c.postMessage(String(m)); }; await say('activate start ' + VERSION_TAG); const names = await caches.keys(); await say('keys ' + names.length); for (const k of names) if (k !== SHELL && k !== CODE && !current(k)) { await say('deleting ' + k); await say('deleted ' + k + ' ' + (await caches.delete(k))); } await say('loop done');")
    .replace("await self.clients.claim();", "await self.clients.claim(); for (const c of await self.clients.matchAll({ includeUncontrolled: true })) c.postMessage('claimed ' + VERSION_TAG);")
    .replace("const NB = 16;", `const NB = 16; const VERSION_TAG = ${JSON.stringify(Date.now().toString(36))};`);
  writeFileSync(join(site, "sw.js"), src);
}
buildSw();

// ---- the server: logs every /a/ request that reaches the network
let log = [];
const types = { ".mp3": "audio/mpeg", ".js": "text/javascript", ".html": "text/html" };
const server = http.createServer((req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]);
  if (path.startsWith("/a/")) log.push(req.url);
  const f = join(site, path === "/" ? "index.html" : path);
  if (existsSync(f) && !path.endsWith("/")) {
    res.writeHead(200, { "content-type": types[f.slice(f.lastIndexOf("."))] ?? "application/octet-stream", "cache-control": "public, max-age=0, must-revalidate" });
    res.end(readFileSync(f));
  } else {
    res.writeHead(200, { "content-type": "text/html" }); // Cloudflare's single-page-application fallback
    res.end(readFileSync(join(site, "index.html")));
  }
});
await new Promise((r) => server.listen(8771, r));
const BASE = "http://localhost:8771";

const sample = [...clips.slice(0, 250), ...clips.slice(2000, 2050)];
const changed = "/a/t/say_slowly/w7.mp3";
const sameBucket = sample.filter((c) => c.startsWith("/a/t/say_slowly/") && fnv(c.split("/").pop()) % NB === fnv("w7.mp3") % NB);

const results = {};
const only = process.env.ONLY;
for (const [name, bt] of [["chromium", chromium], ["webkit", webkit]].filter(([n]) => !only || n === only)) {
  const r = (results[name] = {});
  // a persistent profile, like a real phone (EPHEMERAL=1: Playwright's default private-style context)
  const persistent = process.env.EPHEMERAL !== "1";
  const browser = persistent ? null : await bt.launch();
  const ctx = persistent ? await bt.launchPersistentContext(join(site, `../old/profile-${name}-${Date.now()}`)) : await browser.newContext();
  const page = await ctx.newPage();
  const step = (m) => console.error(`[${name}] ${m}`);
  page.on("console", (m) => console.error(`[${name} console] ${m.text()}`));
  page.setDefaultTimeout(20000);
  await page.addInitScript(() => { window.__swlog = []; navigator.serviceWorker.addEventListener("message", (e) => window.__swlog.push(e.data)); });
  try {
    await page.goto(BASE + "/");
    step("loaded; sw in navigator: " + (await page.evaluate(() => "serviceWorker" in navigator)));
    await page.evaluate(async () => { await Promise.race([navigator.serviceWorker.ready, new Promise((_, no) => setTimeout(() => no(new Error("no sw ready")), 10000))]); if (!navigator.serviceWorker.controller) await new Promise((ok) => navigator.serviceWorker.addEventListener("controllerchange", ok, { once: true })); });
    const fetchAll = (urls) => page.evaluate(async (urls) => { const out = []; for (let i = 0; i < urls.length; i += 50) out.push(...(await Promise.all(urls.slice(i, i + 50).map((u) => fetch(u).then((x) => x.status))))); return out.every((s) => s === 200); }, urls);
    step("controlled");
    log = []; r.pass1_ok = await fetchAll(sample); r.pass1_network = log.length;
    await page.reload();
    await page.evaluate(() => navigator.serviceWorker.ready);
    step("pass1 done, reloaded");
    log = []; r.pass2_ok = await fetchAll(sample); r.pass2_network = log.length;
    // re-record one clip, rebuild, deploy
    writeFileSync(join(site, changed.slice(1)), randomBytes(900));
    buildSw();
    step("pass2 done, updating worker");
    await page.evaluate(async () => { const reg = await navigator.serviceWorker.getRegistration(); const changed = new Promise((ok) => navigator.serviceWorker.addEventListener("controllerchange", ok, { once: true })); await reg.update(); await changed; });
    r.before_pass3 = await page.evaluate(async (b) => (await caches.keys()).filter((n) => n.startsWith(`sn-a:t/say_slowly:${b}:`)), fnv("w7.mp3") % NB);
    log = []; r.pass3_ok = await fetchAll(sample); r.pass3_network = log.length; r.pass3_expected = sameBucket.length;
    r.pass3_only_changed_bucket = log.every((u) => sameBucket.includes(u.split("?")[0]));
    r.pass3_sample = log.slice(0, 3);
    await page.waitForTimeout(1500);
    r.debug = await page.evaluate(() => window.__swlog);
    r.after_counts = await page.evaluate(async () => { const out = {}; for (const n of (await caches.keys()).filter((n) => n.startsWith("sn-a:t/")).sort().slice(0, 6)) out[n] = (await (await caches.open(n)).keys()).length; return out; });
    r.pass3_controller = await page.evaluate(() => !!navigator.serviceWorker.controller);
    log = []; await fetchAll(sample); r.pass4_network = log.length;
    r.old_cache_entries = await page.evaluate(async (b) => { const out = {}; for (const n of (await caches.keys()).filter((n) => n.startsWith(`sn-a:t/say_slowly:${b}:`))) out[n] = (await (await caches.open(n)).keys()).length; return out; }, fnv("w7.mp3") % NB);
    // a missing clip: the SPA fallback must not be cached
    log = [];
    r.missing = await page.evaluate(async () => { const a = await fetch("/a/t/say_slowly/nope.mp3"); const b = await fetch("/a/t/say_slowly/nope.mp3"); return `${a.status} ${a.headers.get("content-type")}`; });
    r.missing_network_hits = log.length; // 2 = both went to the network (not cached)
    r.caches = await page.evaluate(async (b) => { const k = await caches.keys(); return { count: k.length, changedBucketCaches: k.filter((n) => n.startsWith(`sn-a:t/say_slowly:${b}:`)), names: k.filter((n) => n.startsWith("sn-a:t/")).sort() }; }, fnv("w7.mp3") % NB);
  } catch (e) { r.error = String(e).slice(0, 300); }
  await (browser ?? ctx).close();
}
server.close();
console.log(JSON.stringify(results, null, 1));
