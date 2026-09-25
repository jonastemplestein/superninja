// Full-page screenshots of the landing page (desktop + phone) for review.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
mkdirSync("assets-src/landing-review", { recursive: true });
const BASE = process.argv[2] ?? "http://localhost:5173";
const b = await chromium.launch();
for (const [name, vp, mobile] of [["desktop", { width: 1440, height: 900 }, false], ["phone", { width: 390, height: 844 }, true]] as const) {
  const p = await (await b.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile })).newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  // trigger reveal-on-scroll everywhere
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in"));
    document.querySelectorAll<HTMLVideoElement>("video[data-src]").forEach((v) => (v.src = v.dataset.src!));
    scrollTo(0, 0);
  });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `assets-src/landing-review/${name}.png`, fullPage: true });
  console.log(name, await p.evaluate(() => document.body.scrollHeight));
}
await b.close();
