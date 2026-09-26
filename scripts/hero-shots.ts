// Filmstrips of the ninja's moves, tiers and the turn-your-phone prompt, for eyeballing (docs/HERO.md).
// Plays /play/?scene=ninja-demo in slow motion on an 844×390 phone viewport and screenshots each move mid-action.
// Usage: bun scripts/hero-shots.ts [--out playtest/hero/foundation] [--hero kai|suki] [--only kick,cast,tiers,rotate] [--slow 6]
import { chromium, type Page } from "playwright";
import { mkdirSync } from "node:fs";
import { save } from "./treadmill/bot";

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:5173")!; // tip: a second dev server with HMR off keeps other edits from remounting the demo mid-film
const OUT = arg("out", "playtest/hero/foundation")!;
const HERO = arg("hero", "kai")!;
const SLOW = Number(arg("slow", "6"));
const ONLY = arg("only")?.split(",");
const want = (k: string) => !ONLY || ONLY.includes(k);
mkdirSync(OUT, { recursive: true });

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("pageerror", e.message));
await page.goto(`${BASE}/play/`);
await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...save({ hero: HERO }), settings: { relaxed: false, music: 0, captions: true, unlockAll: true } });
await page.goto(`${BASE}/play/?scene=ninja-demo`);
await page.waitForTimeout(1200);
await page.mouse.click(422, 4);

const shot = (name: string) => page.screenshot({ path: `${OUT}/${name}.png` });
async function film(name: string, run: string, frames: number, every: number, startDelay = 0) {
  await page.evaluate(`void (${run})`); // don't await the move's promise
  if (startDelay) await page.waitForTimeout(startDelay);
  for (let i = 0; i < frames; i++) {
    await shot(`${name}_${String(i).padStart(2, "0")}`);
    await page.waitForTimeout(every);
  }
}
const tgt = (t: string) => `document.querySelector('[data-target="${t}"]')`;
const settle = async (streak: number) => {
  await page.evaluate(`__ninja.setSlowmo(1); __streak.set(0); __streak.set(${streak})`);
  await page.waitForTimeout(1800);
  await page.evaluate(`__ninja.setSlowmo(${SLOW})`);
};

const moves = ["kick", "punch", "throw", "cast", "spin", "jump", "flip", "cheer", "think", "hurt", "power"];
for (const tier of [0, 2, 3]) {
  const streak = [0, 3, 6, 10][tier];
  for (const m of moves) {
    if (!want(m)) continue;
    if (tier > 0 && ["cheer", "think", "hurt", "power"].includes(m)) continue;
    await settle(streak);
    await film(`move_${m}_t${tier}`, `__ninja.act("${m}", ${tgt(m === "cast" ? "card" : m === "throw" ? "chest" : "monster")})`, 12, 280 * (SLOW / 6));
  }
}
if (want("tiers")) {
  for (const [t, n] of [[0, 2], [1, 3], [2, 6], [3, 10]]) {
    await page.evaluate(`__ninja.setSlowmo(1); __streak.set(0); __streak.set(${n})`);
    await page.waitForTimeout(2600);
    await shot(`tier_${t}`);
  }
}
if (want("tierup")) {
  for (const n of [3, 6, 10]) {
    await page.evaluate(`__ninja.setSlowmo(1); __streak.set(${n - 1})`);
    await page.waitForTimeout(1500);
    await page.evaluate(`__ninja.setSlowmo(${SLOW})`);
    await film(`tierup_${n}`, `__streak.hit()`, 12, 330 * (SLOW / 6));
  }
}
if (want("miss")) {
  await page.evaluate(`__ninja.setSlowmo(1); __streak.set(7)`);
  await page.waitForTimeout(2200);
  await page.evaluate(`__ninja.setSlowmo(3)`);
  await film(`miss`, `__streak.miss()`, 10, 400);
}
if (want("celebrate")) {
  await settle(4);
  await film(`celebrate`, `__ninja.celebrate()`, 18, 330 * (SLOW / 6));
}
if (want("carry")) {
  await settle(0);
  await film(`carry`, `__ninja.carry(${tgt("tile")}, ${tgt("slot")})`, 10, 300 * (SLOW / 6));
  await settle(0);
  await film(`knock`, `__ninja.knock(${tgt("tile")})`, 12, 300 * (SLOW / 6));
}
if (want("rotate")) {
  await page.evaluate(`__ninja.setSlowmo(1); __streak.set(0)`);
  await page.evaluate(() => ((window as any).__audioLog = []));
  await page.setViewportSize({ width: 390, height: 844 });
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(425);
    await shot(`rotate_${String(i).padStart(2, "0")}`);
  }
  await page.waitForTimeout(2500);
  console.log("audio while upright:", JSON.stringify(await page.evaluate(() => (window as any).__audioLog.map((a: any) => a.url))));
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(600);
  await shot(`rotate_back`);
  console.log("rotate overlay after turning back:", await page.locator(".rotate").count());
}
await b.close();
console.log(`frames → ${OUT}`);

export type { Page };
