// Stills for docs/SOUND_DISPLAY.md: open a URL at 844×390 (with an optional save), wait, and take frames at set times.
// Usage: bun scripts/treadmill/sound-shots.ts <out-dir> <name> <url> [ms,ms,...] [save-json]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { save } from "./bot";

const [out, name, url, times = "3000", saveJson] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
const page = await ctx.newPage();
await page.goto("http://localhost:5173/play/");
await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...save(saveJson ? JSON.parse(saveJson) : {}), settings: { relaxed: false, music: 0, captions: false, unlockAll: true } });
await page.goto(`http://localhost:5173${url}`);
await page.mouse.click(420, 4);
const t0 = Date.now();
for (const t of times.split(",").map(Number)) {
  await page.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
  await page.screenshot({ path: `${out}/${name}-${t}.png` });
}
await b.close();
