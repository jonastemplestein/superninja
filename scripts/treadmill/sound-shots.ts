// Stills for docs/SOUND_DISPLAY.md: open a URL at 844×390 (with an optional save), wait, and take frames at set times.
// Usage: bun scripts/treadmill/sound-shots.ts <out-dir> <name> <url> [ms,ms,...] [save-json] [--base http://localhost:5173] [--freeze <ms>]
// --freeze <ms> (FIX_PLAN §4.4 F4.7): before each shot, pause every running animation (CSS and Web Animations) at
// currentTime <ms>, so stills of a before and an after build can be compared frame for frame; they play on after it.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { save } from "./bot";

const argv = process.argv.slice(2);
const opt = (k: string) => {
  const i = argv.indexOf(`--${k}`);
  if (i < 0) return undefined;
  const v = argv[i + 1];
  argv.splice(i, 2);
  return v;
};
const BASE = opt("base") ?? "http://localhost:5173";
const FREEZE = opt("freeze");
const [out, name, url, times = "3000", saveJson] = argv;
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
const page = await ctx.newPage();
await page.goto(`${BASE}/play/`);
await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...save(saveJson ? JSON.parse(saveJson) : {}), settings: { relaxed: false, music: 0, captions: false, unlockAll: true } });
await page.goto(`${BASE}${url}`);
await page.mouse.click(420, 4);
const t0 = Date.now();
for (const t of times.split(",").map(Number)) {
  await page.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
  if (FREEZE !== undefined) {
    await page.evaluate((ms) => {
      for (const a of document.getAnimations()) {
        a.pause();
        a.currentTime = ms;
      }
    }, Number(FREEZE));
    await page.waitForTimeout(50);
  }
  await page.screenshot({ path: `${out}/${name}-${t}${FREEZE !== undefined ? `-f${FREEZE}` : ""}.png` });
  if (FREEZE !== undefined) await page.evaluate(() => document.getAnimations().forEach((a) => a.play()));
}
await b.close();
