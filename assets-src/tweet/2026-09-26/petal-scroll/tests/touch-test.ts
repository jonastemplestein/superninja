// Quick check (no recording): does a CDP synthesized touch scroll gesture move the petal scroll smoothly?
import { chromium } from "playwright";
import { tweetSave, PREVIEW } from "../../../../../scripts/tweet-clips";
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
await ctx.addInitScript((s) => { localStorage.setItem("superninja.save.v1", JSON.stringify(s)); localStorage.setItem("superninja.scrollHint", "1"); }, tweetSave({ petals: ["a","s","ai","ay"], gems: ["ay>ae"] }));
const page = await ctx.newPage();
await page.goto(PREVIEW + "/play/?scene=tree", { waitUntil: "load" });
await page.waitForTimeout(2500);
await page.locator('[aria-label="Petal chart"]').dispatchEvent("pointerdown");
await page.waitForTimeout(2500);
const cdp = await ctx.newCDPSession(page);
const trace = () => page.evaluate(() => { const el = document.querySelector(".petal-scroll") as HTMLElement; const w = window as any; w.__tr = []; const t0 = performance.now(); const f = () => { w.__tr.push([Math.round(performance.now() - t0), Math.round(el.scrollLeft)]); if (performance.now() - t0 < 2500) requestAnimationFrame(f); }; requestAnimationFrame(f); });
const read = () => page.evaluate(() => (window as any).__tr);
for (const [name, dist, speed, fling] of [["swipe", -600, 1600, false], ["fling", -500, 2500, true], ["home", 1100, 4000, true]] as const) {
  await trace();
  const t = Date.now();
  await cdp.send("Input.synthesizeScrollGesture", { x: name === "home" ? 150 : 900, y: 330, xDistance: dist, yDistance: 0, speed, gestureSourceType: "touch", preventFling: !fling });
  console.log(name, "gesture took", Date.now() - t, "ms");
  await page.waitForTimeout(2600);
  const tr: number[][] = await read();
  const moves = tr.filter((x, i) => i && x[1] !== tr[i - 1][1]);
  console.log(name, "frames", tr.length, "moving frames", moves.length, "from", tr[0]?.[1], "to", tr.at(-1)?.[1], "path", moves.map((m) => m.join(":")).join(" "));
}
await browser.close();
process.exit(0);
