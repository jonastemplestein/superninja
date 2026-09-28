// Checks the mockup's interactions with real touch events at 844×390 and screenshots them:
// 7 players (two rows), picking another player (no start), the gear's short tap (the hint), one tap on Play = one start,
// and the phone held upright.   bun docs/title-design/ninja-ready/tools/interact.ts [tag]
import { chromium } from "playwright";
import { existsSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "../../../..");
const SHOTS = resolve(import.meta.dir, "../shots");
const tag = process.argv[2] ?? "i";
const TYPES: Record<string, string> = { html: "text/html", webp: "image/webp", png: "image/png", mp3: "audio/mpeg" };
const server = Bun.serve({ port: 0, fetch(req) {
  const p = decodeURIComponent(new URL(req.url).pathname), f = join(ROOT, p.endsWith("/") ? p + "index.html" : p);
  if (!f.startsWith(ROOT) || !existsSync(f) || statSync(f).isDirectory()) return new Response("nf", { status: 404 });
  return new Response(Bun.file(f), { headers: { "content-type": TYPES[f.split(".").pop()!] ?? "application/octet-stream" } });
} });
const BASE = `http://localhost:${server.port}/docs/title-design/ninja-ready/`;
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const out: Record<string, any> = {};
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const tap = async (sel: string, holdMs = 30) => {
  const r = await page.locator(sel).first().boundingBox();
  const x = r!.x + r!.width / 2, y = r!.y + r!.height / 2;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await sleep(holdMs);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
};
await page.goto(`${BASE}?state=lots&ui=0`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await sleep(1500);
await page.screenshot({ path: join(SHOTS, `${tag}-lots-844x390.png`) });
out.lotsBadges = await page.locator(".badge").count();
out.lotsBadgeCss = await page.locator(".badge:not(.on) .b-face").first().evaluate((e) => Math.round(e.getBoundingClientRect().width));
// pick Leo (Kai): the ninja on the rock changes, nothing starts
await tap('.badge[aria-label="player Leo"]');
await sleep(1400);
out.afterPick = await page.evaluate(() => ({ hero: document.querySelector(".ninja-wrap.front")?.getAttribute("data-hero"), name: document.querySelector("#nameplate")?.textContent, started: !!document.querySelector(".shock, .next") }));
await page.screenshot({ path: join(SHOTS, `${tag}-picked-leo-844x390.png`) });
// the gear: a short tap shows the grown-ups hint, and nothing starts
await tap(".gear", 200);
await sleep(150);
out.gearHint = await page.locator(".gear .hint").count();
out.gearStarted = await page.evaluate(() => !!document.querySelector(".shock, .next"));
await page.screenshot({ path: join(SHOTS, `${tag}-gear-hint-844x390.png`) });
// the gear held for 2 s opens the grown-ups stand-in
await tap(".gear", 2200);
await sleep(300);
out.gearSheet = await page.locator(".sheet").count();
await page.screenshot({ path: join(SHOTS, `${tag}-gear-held-844x390.png`) });
await tap(".sheet button");
await sleep(200);
// one tap on Play: exactly one start (one shockwave, one burst of petals)
await page.evaluate(() => { (window as any).__starts = 0; new MutationObserver((m) => m.forEach((r) => r.addedNodes.forEach((n) => (n as Element).classList?.contains("shock") && (window as any).__starts++))).observe(document.getElementById("world")!, { childList: true }); });
await tap('button[aria-label="Start"]');
await sleep(400);
out.startsFromOneTap = await page.evaluate(() => (window as any).__starts);
out.burstPetals = await page.locator(".burst").count();
await sleep(1500);
out.nextShown = await page.evaluate(() => document.querySelector(".next .card")?.textContent?.trim().slice(0, 40));
// upright
await page.setViewportSize({ width: 390, height: 844 });
await sleep(300);
await page.screenshot({ path: join(SHOTS, `${tag}-upright-390x844.png`) });
writeFileSync(join(SHOTS, `${tag}-interact.json`), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
await b.close();
server.stop();
