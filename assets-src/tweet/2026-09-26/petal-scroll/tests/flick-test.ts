// Quick check (no recording): how far does one touch flick home carry the petal scroll from the met petals?
import { chromium } from "playwright";
import { tweetSave, PREVIEW } from "../../../../../scripts/tweet-clips";
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
await ctx.addInitScript((s) => { localStorage.setItem("superninja.save.v1", JSON.stringify(s)); localStorage.setItem("superninja.scrollHint", "1"); }, tweetSave({ petals: ["a","s","ai","ay","l","f","e"], gems: ["ay>ae"] }));
const page = await ctx.newPage();
await page.goto(PREVIEW + "/play/?scene=tree", { waitUntil: "load" });
await page.waitForTimeout(2500);
await page.locator('[aria-label="Petal chart"]').dispatchEvent("pointerdown");
await page.waitForTimeout(2500);
const cdp = await ctx.newCDPSession(page);
for (const [dist, speed] of [[1000, 6000], [1050, 8000], [1050, 9500]]) {
  const from = await page.evaluate(() => { const el = document.querySelector(".petal-scroll") as HTMLElement; const s = el.querySelector('[aria-label="petal s"]') as HTMLElement; el.scrollLeft += s.getBoundingClientRect().left - 250; return el.scrollLeft; });
  await page.waitForTimeout(600);
  const t = Date.now();
  await cdp.send("Input.synthesizeScrollGesture", { x: 170, y: 326, xDistance: dist, yDistance: 0, speed, gestureSourceType: "touch", preventFling: false });
  const g = Date.now() - t;
  await page.waitForTimeout(2200);
  const to = await page.evaluate(() => (document.querySelector(".petal-scroll") as HTMLElement).scrollLeft);
  console.log({ dist, speed, from, to, gestureMs: g });
}
await browser.close();
process.exit(0);
