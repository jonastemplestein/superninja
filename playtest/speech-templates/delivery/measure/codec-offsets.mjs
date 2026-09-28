// Leading/trailing silence of each decoded format per engine: encoder-delay handling (delivery.md §3).
// node playtest/speech-templates/delivery/measure/codec-offsets.mjs playtest/runs/speech-templates/delivery/fmt
import { chromium, webkit } from "../../../../node_modules/playwright/index.mjs";
import http from "node:http";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const dir = process.argv[2];
const server = http.createServer((req, res) => { try { res.writeHead(200); res.end(readFileSync(join(dir, req.url.split("?")[0]))); } catch { res.writeHead(404); res.end(); } });
await new Promise((r) => server.listen(8766, r));
const files = readdirSync(dir).filter((f) => /\.(mp3|m4a|mp4|webm|ogg|caf|wav)$/.test(f) && f !== "o24.caf");
const out = {};
for (const [name, bt] of [["chromium", chromium], ["webkit", webkit]]) {
  const browser = await bt.launch(); const page = await browser.newPage(); await page.goto("http://localhost:8766/index.html");
  out[name] = await page.evaluate(async (files) => {
    const r = {};
    for (const f of files) {
      try {
        const ab = await (await fetch("/" + f)).arrayBuffer();
        const b = await new OfflineAudioContext(1, 1, 48000).decodeAudioData(ab);
        const d = b.getChannelData(0); let first = -1, last = -1;
        for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > 0.003) { if (first < 0) first = i; last = i; }
        r[f] = `len ${d.length} first ${first} (${(first / 48).toFixed(1)} ms) tail ${d.length - 1 - last} (${((d.length - 1 - last) / 48).toFixed(1)} ms)`;
      } catch (e) { r[f] = "ERR " + e.name; }
    }
    return r;
  }, files);
  await browser.close();
}
server.close(); console.log(JSON.stringify(out, null, 1));
