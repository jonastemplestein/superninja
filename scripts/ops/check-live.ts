// Load a deployed build like a first-time player and fail on anything broken: the page must serve the expected
// build, start the game, and throw no page errors. Used by scripts/preview.sh between the preview deploy and the
// production promotion.
// Usage: bun scripts/ops/check-live.ts <base-url> [expected /play/ html md5]
import { chromium } from "playwright";
import { createHash } from "node:crypto";

const base = process.argv[2]?.replace(/\/$/, "");
const want = process.argv[3];
if (!base) throw new Error("usage: bun scripts/ops/check-live.ts <base-url> [md5]");

// the edge can take a few seconds to serve a new version
if (want) {
  let got = "";
  for (let i = 0; i < 20 && got !== want; i++) {
    if (i) await new Promise((r) => setTimeout(r, 3000));
    const html = await (await fetch(`${base}/play/?v=${Date.now()}`, { headers: { "cache-control": "no-cache" } })).text();
    got = createHash("md5").update(html).digest("hex");
  }
  if (got !== want) throw new Error(`${base}/play/ serves ${got}, expected ${want}`);
}

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
const page = await ctx.newPage();
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
const bad: string[] = [];
page.on("response", (r) => { if (r.status() >= 400 && r.url().startsWith(base)) bad.push(`${r.status()} ${r.url()}`); });
await page.goto(`${base}/play/`, { waitUntil: "load" });
await page.mouse.click(420, 200);
// the game is up once any scene has published its state or drawn a button
await page.waitForFunction(() => (window as any).__snState || document.querySelector("button"), null, { timeout: 20000 });
await page.waitForTimeout(2500);
const landing = await (await fetch(`${base}/`)).status;
await b.close();
if (landing !== 200) bad.push(`${landing} ${base}/`);
if (errors.length || bad.length) {
  console.error(`✗ ${base}\n` + [...errors.map((e) => `page error: ${e}`), ...bad].join("\n"));
  process.exit(1);
}
console.log(`✓ ${base} is up (no page errors, no failed requests)`);
