// The ◀ ▶ lands: does the map page or scroll, what does the child find on an earlier land, and does a swipe do anything?
import { chromium } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/node_modules/playwright";
import { writeFileSync } from "fs";
import { LEVELS } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/src/content/worlds";
const OUT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/docs/map-design/current";
const BASE = "https://superninja.templestein.com";
const next = "w3-6";
const before = LEVELS.slice(0, LEVELS.findIndex((l) => l.id === next));
const sv = { v: 1, hero: "kai", seenIntro: true, seenTraining: true, seenPlacement: true, seenFlower: true, seenTimer: true, seenStreak: true, schoolYear: "none", schoolYearAt: Date.now(), band: "pre", captionsV2: true, stars: Object.fromEntries(before.map((l) => [l.id, l.warmup ? 1 : 3])), read: {}, spell: {}, words: {}, petals: ["s"], energy: {}, gems: [], placed: [], flowerSeen: ["world:1", "world:2", "world:3"], settings: { relaxed: false, music: 0, captions: false, unlockAll: false }, minutes: 200, sessions: 10, stickers: [], shiny: [], adjustLog: [] };
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.addInitScript((sv) => {
  (window as any).__audioLog = [];
  if (!sessionStorage.getItem("s")) { localStorage.clear(); localStorage.setItem("superninja.profiles.v1", JSON.stringify({ list: [{ id: "pa", name: "Ninja", hero: "kai", created: 1, last: 1 }], current: "pa" })); localStorage.setItem("superninja.save.pa", JSON.stringify(sv)); sessionStorage.setItem("s", "1"); }
  sessionStorage.setItem("sn.setup", "done");
}, sv);
await page.goto(`${BASE}/play/?scene=map`);
await page.waitForSelector(".scene.map .map-next");
await page.waitForTimeout(5000);
const res: any = {};
// a swipe right-to-left and left-to-right across the empty sky
const swipe = async (x0: number, x1: number, y: number) => {
  const c = await page.context().newCDPSession(page);
  await c.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y }] });
  for (let k = 1; k <= 8; k++) await c.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + ((x1 - x0) * k) / 8, y }] });
  await c.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
};
const banner = () => page.evaluate(() => document.querySelector(".scene.map .display")?.textContent ?? "");
res.start = await banner();
await swipe(600, 200, 110);
await page.waitForTimeout(800);
res.afterSwipeLeft = await banner();
await swipe(200, 600, 110);
await page.waitForTimeout(800);
res.afterSwipeRight = await banner();
const t0 = Date.now();
const prev = await page.locator('[aria-label="previous world"]').boundingBox();
await page.touchscreen.tap(prev!.x + prev!.width / 2, prev!.y + prev!.height / 2);
await page.waitForTimeout(3500);
res.afterPrev = await banner();
res.prevPage = await page.evaluate(() => ({
  stones: [...document.querySelectorAll(".scene.map button[aria-label^='level ']")].map((e) => ({ id: e.getAttribute("aria-label"), gold: e.classList.contains("map-next"), grey: /grayscale/.test((e.querySelector("img") as HTMLElement).style.filter) })),
  ninja: !!document.querySelector(".map-hero"), hand: [...document.querySelectorAll("div")].some((d) => (d as HTMLElement).style.animation.includes("taphint")),
}));
res.linesAfterPrev = await page.evaluate((t0) => ((window as any).__audioLog ?? []).filter((e: any) => e.kind === "speech" && e.t >= t0).map((e: any) => String(e.url).replace(/^.*\/l\//, "").replace(/\.mp3$/, "")), t0);
await page.screenshot({ path: `${OUT}/w3-tap-prev-land-blossom-844x390.jpg`, type: "jpeg", quality: 82 });
// Help on the map, twice
const help = await page.locator('[aria-label="Help"]').boundingBox();
const t1 = Date.now();
await page.touchscreen.tap(help!.x + help!.width / 2, help!.y + help!.height / 2);
await page.waitForTimeout(4000);
await page.touchscreen.tap(help!.x + help!.width / 2, help!.y + help!.height / 2);
await page.waitForTimeout(7000);
res.helpLines = await page.evaluate((t1) => ((window as any).__audioLog ?? []).filter((e: any) => e.kind === "speech" && e.t >= t1).map((e: any) => String(e.url).replace(/^.*\/l\//, "").replace(/\.mp3$/, "")), t1);
await page.screenshot({ path: `${OUT}/w3-prev-land-after-help-844x390.jpg`, type: "jpeg", quality: 82 });
// Home from the map
const home = await page.locator('[data-nav="home"]').first().boundingBox();
await page.touchscreen.tap(home!.x + home!.width / 2, home!.y + home!.height / 2);
await page.waitForTimeout(1500);
res.afterHome = await page.evaluate(() => String((window as any).__snRoute ?? ""));
console.log(JSON.stringify(res, null, 1));
writeFileSync(`${OUT}/measurements-paging.json`, JSON.stringify(res, null, 1));
await b.close();
