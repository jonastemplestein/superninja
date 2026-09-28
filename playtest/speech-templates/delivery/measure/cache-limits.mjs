// Cache Storage at 2k-30k entries: keys(), match, ignoreSearch timings; Chromium's 'Operation too large' (delivery.md §4).
// node playtest/speech-templates/delivery/measure/cache-limits.mjs
import { chromium, webkit } from "../../../../node_modules/playwright/index.mjs";
import http from "node:http";
const server = http.createServer((req, res) => { res.writeHead(200, { "content-type": "text/html" }); res.end("<!doctype html><title>t</title>"); });
await new Promise((r) => server.listen(8768, r));
const out = {};
for (const [name, bt] of [["chromium", chromium], ["webkit", webkit]]) {
  const browser = await bt.launch(); const page = await browser.newPage(); await page.goto("http://localhost:8768/");
  out[name] = await page.evaluate(async () => {
    const r = []; const c = await caches.open("t"); const body = new Uint8Array(2048);
    let n = 0; const B = 500;
    for (const target of [2000, 4000, 6000, 8000, 10000, 12000, 16000, 20000, 30000]) {
      let t = performance.now();
      for (; n < target; n += B) await Promise.all(Array.from({ length: B }, (_, k) => c.put(`/a/t/tpl${(n + k) % 20}/w${n + k}.mp3?v=abc123`, new Response(body, { headers: { "content-type": "audio/mpeg" } }))));
      const putms = performance.now() - t;
      t = performance.now();
      let keys = "ok";
      try { const k = await c.keys(); keys = `ok ${k.length} in ${(performance.now() - t).toFixed(0)} ms`; } catch (e) { keys = "ERR " + e.message; }
      t = performance.now(); for (let i = 0; i < 100; i++) await c.match(`/a/t/tpl${i % 20}/w${i * 17}.mp3?v=abc123`); const m = ((performance.now() - t) / 100).toFixed(2);
      let pk = "";
      try { const t2 = performance.now(); const k = await c.keys(new Request("/a/t/tpl3/w63.mp3?v=abc123")); pk = `${k.length} in ${(performance.now() - t2).toFixed(1)} ms`; } catch (e) { pk = "ERR"; }
      let ign = "";
      try { const t2 = performance.now(); const k = await c.keys(new Request("/a/t/tpl3/w63.mp3"), { ignoreSearch: true }); ign = `${k.length} in ${(performance.now() - t2).toFixed(1)} ms`; } catch (e) { ign = "ERR " + e.message; }
      r.push({ entries: n, put_ms_per_1000: (putms / B / ((target - (n - (target - (n - B)))) / B || 1)).toFixed(0), keys, match_ms: m, keys_of_one: pk, keys_ignoreSearch: ign });
    }
    await caches.delete("t");
    return r;
  });
  await browser.close();
}
server.close(); console.log(JSON.stringify(out, null, 1));
