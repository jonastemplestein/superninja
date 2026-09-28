// Verifier: does production /play/ still load without page errors? One browser at a time.
import { webkit, chromium, devices } from "playwright";
const OUT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/landing/verify";
const runs = [
  { name: "webkit-iphone-390x664", engine: webkit, opts: { viewport: { width: 390, height: 664 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: devices["iPhone 15"].userAgent } },
  { name: "chromium-desktop-1280x800", engine: chromium, opts: { viewport: { width: 1280, height: 800 } } },
];
for (const r of runs) {
  const b = await r.engine.launch();
  const ctx = await b.newContext(r.opts);
  const p = await ctx.newPage();
  const pageErrors: string[] = [], consoleErrors: string[] = [], bad: string[] = [];
  p.on("pageerror", (e) => pageErrors.push(String(e)));
  p.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  p.on("requestfailed", (q) => bad.push(`FAILED ${q.url()} ${q.failure()?.errorText}`));
  p.on("response", (q) => { if (q.status() >= 400) bad.push(`${q.status()} ${q.url()}`); });
  const resp = await p.goto("https://superninja.templestein.com/play/?v=" + Date.now(), { waitUntil: "load", timeout: 90000 });
  await p.waitForTimeout(8000);
  const info = await p.evaluate(() => ({ title: document.title, canvas: document.querySelectorAll("canvas").length, bodyText: document.body.innerText.slice(0, 160).replace(/\s+/g, " ") }));
  await p.screenshot({ path: `${OUT}/play-${r.name}.png` });
  // one tap to get past any "tap to start" screen, then look again
  await p.mouse.click((r.opts.viewport.width / 2) | 0, (r.opts.viewport.height / 2) | 0);
  await p.waitForTimeout(4000);
  await p.screenshot({ path: `${OUT}/play-${r.name}-after-tap.png` });
  console.log(`${r.name}: HTTP ${resp?.status()} title "${info.title}" canvases ${info.canvas} text "${info.bodyText}"`);
  console.log(`  pageerrors: ${pageErrors.length ? JSON.stringify(pageErrors) : "none"}`);
  console.log(`  console errors: ${consoleErrors.length ? JSON.stringify(consoleErrors.slice(0, 10)) : "none"}`);
  console.log(`  bad requests: ${bad.length ? JSON.stringify(bad.slice(0, 10)) : "none"}`);
  await b.close();
}
