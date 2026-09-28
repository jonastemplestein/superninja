// decodeAudioData support, lengths and 24 kHz decode per format in Chromium and WebKit (delivery.md §3).
// node playtest/speech-templates/delivery/measure/codec-decode.mjs playtest/runs/speech-templates/delivery/fmt
import { chromium, webkit, firefox } from "../../../../node_modules/playwright/index.mjs";
import http from "node:http";
import { readFileSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";
const dir = process.argv[2];
const types = { ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".mp4": "audio/mp4", ".webm": "audio/webm", ".ogg": "audio/ogg", ".caf": "audio/x-caf", ".wav": "audio/wav", ".html": "text/html" };
const server = http.createServer((req, res) => {
  const p = join(dir, decodeURIComponent(req.url.split("?")[0]));
  try { const b = readFileSync(p); res.writeHead(200, { "content-type": types[extname(p)] ?? "application/octet-stream" }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(8765, r));
const files = readdirSync(dir).filter((f) => /\.(mp3|m4a|mp4|webm|ogg|caf|wav)$/.test(f) && !f.startsWith("o24.caf"));
const out = {};
for (const [name, bt] of [["chromium", chromium], ["webkit", webkit], ["firefox", firefox]]) {
  let browser;
  try { browser = await bt.launch(); } catch (e) { out[name] = "launch failed: " + e.message.slice(0, 200); continue; }
  const page = await browser.newPage();
  await page.goto("http://localhost:8765/");
  out[name] = await page.evaluate(async (files) => {
    const r = {};
    for (const f of files) {
      const ab = await (await fetch("/" + f)).arrayBuffer();
      const row = {};
      try { const b = await new OfflineAudioContext(1, 1, 48000).decodeAudioData(ab.slice(0)); row.at48 = `${b.sampleRate} ${b.length} ${b.duration.toFixed(4)}`; } catch (e) { row.at48 = "ERR " + (e.name || e); }
      try {
        const b = await new OfflineAudioContext(1, 1, 24000).decodeAudioData(ab.slice(0));
        row.at24 = `${b.sampleRate} ${b.length} ${b.duration.toFixed(4)}`;
        // play the 24 kHz buffer in a 48 kHz context
        const oc = new OfflineAudioContext(1, Math.ceil(b.duration * 48000) + 100, 48000);
        const s = oc.createBufferSource(); s.buffer = b; s.connect(oc.destination); s.start();
        const rendered = await oc.startRendering();
        const d = rendered.getChannelData(0); let e = 0; for (const v of d) e += v * v;
        row.play24in48 = `rms ${Math.sqrt(e / d.length).toFixed(4)}`;
      } catch (e) { row.at24 = row.at24 ?? "ERR " + (e.name || e); row.play24in48 = "ERR " + (e.name || e); }
      const a = document.createElement("audio");
      const mime = { mp3: "audio/mpeg", m4a: 'audio/mp4; codecs="mp4a.40.2"', mp4: 'audio/mp4; codecs="opus"', webm: 'audio/webm; codecs="opus"', ogg: 'audio/ogg; codecs="opus"', caf: "audio/x-caf; codecs=opus", wav: "audio/wav" }[f.split(".").pop()];
      row.canPlayType = a.canPlayType(mime) || "no";
      r[f] = row;
    }
    return r;
  }, files);
  out[name + "_ua"] = await page.evaluate(() => navigator.userAgent);
  await browser.close();
}
server.close();
console.log(JSON.stringify(out, null, 1));
