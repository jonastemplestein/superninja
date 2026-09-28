// Stills for docs/SOUND_DISPLAY.md: open a URL at 844×390 (with an optional save), wait, and take frames at set times.
// Usage: bun scripts/treadmill/sound-shots.ts <out-dir> <name> <url> [ms,ms,...] [save-json] [--base URL | --build dir]
//        [--port N] [--freeze <ms>]
// Where it plays (never the shared dev server unless you name it): --base URL, a server already up (the game's root or
// its /play/ URL); --build dir, a finished frozen build folder, served here on --port (default 4186); neither, a fresh
// frozen build of the working tree (frozen.ts) on --port. Flags take `--k v` or `--k=v`.
// --freeze <ms> (FIX_PLAN §4.4 F4.7): before each shot, pause every running animation (CSS and Web Animations, and SVG
// SMIL animations: svg.pauseAnimations() at <ms>) at currentTime <ms>, so stills of a before and an after build can be
// compared frame for frame; they play on after it.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { save, unlockAudio } from "./bot";
import { frozen } from "./frozen";
import { helpGuard } from "../lib/help";
helpGuard(import.meta.url); // --help prints the usage above and exits, before anything runs

const argv = process.argv.slice(2);
const opt = (k: string) => {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === `--${k}`) return argv.splice(i, 2)[1];
    if (argv[i].startsWith(`--${k}=`)) return argv.splice(i, 1)[0].slice(k.length + 3);
  }
  return undefined;
};
const baseOf = (url: string) => url.trim().replace(/[?#].*$/, "").replace(/\/+$/, "").replace(/\/play(\/index\.html)?$/, "").replace(/\/+$/, "");
const GIVEN = opt("base");
const BUILD = opt("build");
const PORT = Number(opt("port") ?? "4186");
const FREEZE = opt("freeze");
const [out, name, url, times = "3000", saveJson] = argv;
if (!out || !name || !url) {
  console.error("usage: bun scripts/treadmill/sound-shots.ts <out-dir> <name> <url> [ms,ms,...] [save-json] [--base URL | --build dir] [--port N] [--freeze <ms>]");
  process.exit(2);
}
let BASE: string;
let stop = () => {};
try {
  if (GIVEN) BASE = baseOf(GIVEN);
  else {
    const f = await frozen({ port: PORT, out: BUILD, build: !BUILD, retry: 2, log: (s) => console.log(s) });
    BASE = f.base;
    stop = f.stop;
  }
} catch (e) {
  console.error(`sound-shots: ${(e as Error).message}`);
  process.exit(2);
}
if (!(await fetch(`${BASE}/play/`, { signal: AbortSignal.timeout(5000) }).then((r) => r.ok, () => false))) {
  console.error(`sound-shots: ${BASE}/play/ doesn't answer`);
  stop();
  process.exit(2);
}
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
const page = await ctx.newPage();
await page.goto(`${BASE}/play/`);
await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...save(saveJson ? JSON.parse(saveJson) : {}), settings: { relaxed: false, music: 0, captions: false, unlockAll: true } });
await page.goto(`${BASE}${url}`);
await unlockAudio(page); // (not a click at the top: it landed on whatever was there)
const t0 = Date.now();
for (const t of times.split(",").map(Number)) {
  await page.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
  if (FREEZE !== undefined) {
    await page.evaluate((ms) => {
      for (const a of document.getAnimations()) {
        a.pause();
        a.currentTime = ms;
      }
      // SVG SMIL (<animate>, <animateTransform>) runs on each <svg>'s own clock
      for (const svg of document.querySelectorAll("svg")) {
        svg.pauseAnimations();
        svg.setCurrentTime(ms / 1000);
      }
    }, Number(FREEZE));
    await page.waitForTimeout(50);
  }
  await page.screenshot({ path: `${out}/${name}-${t}${FREEZE !== undefined ? `-f${FREEZE}` : ""}.png` });
  if (FREEZE !== undefined)
    await page.evaluate(() => {
      document.getAnimations().forEach((a) => a.play());
      document.querySelectorAll("svg").forEach((svg) => svg.unpauseAnimations());
    });
}
await b.close();
stop();
