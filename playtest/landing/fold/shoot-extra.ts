// Regression shots beyond the phone list: tablets, desktops, a tiny landscape phone, and the hero scrolled one step
// (Watch the story, lede, promises). bun playtest/landing/fold/shoot-extra.ts <base-url> <label>
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const BASE = (process.argv[2] ?? "https://superninja.templestein.com").replace(/\/$/, "");
const LABEL = process.argv[3] ?? "shot";
const OUT = process.env.OUT ?? "playtest/landing/fold/extra";
mkdirSync(OUT, { recursive: true });
const SIZES = [
  ["ipad-portrait", 768, 954, true, 0],
  ["ipad-air-portrait", 820, 1106, true, 0],
  ["small-tablet-portrait", 600, 900, true, 0],
  ["old-se-landscape", 568, 320, true, 0],
  ["desktop", 1440, 900, false, 0],
  ["laptop", 1024, 700, false, 0],
  ["iphone15-safari-scrolled-420", 390, 664, true, 420],
] as const;
const b = await chromium.launch();
for (const [name, width, height, mobile, scroll] of SIZES) {
  const ctx = await b.newContext({ viewport: { width, height }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  if (scroll) await p.evaluate((y) => { document.documentElement.style.scrollBehavior = "auto"; scrollTo(0, y); }, scroll);
  await p.waitForTimeout(700);
  const m = await p.evaluate(() => { const r = document.querySelector(".hero-copy .btn-go")!.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight }; });
  console.log(name.padEnd(30), `${width}x${height}`, `play ${m.top}-${m.bottom}`, `margin ${m.vh - m.bottom - 5}`);
  await p.screenshot({ path: `${OUT}/${LABEL}-${name}-${width}x${height}.png` });
  await ctx.close();
}
await b.close();
