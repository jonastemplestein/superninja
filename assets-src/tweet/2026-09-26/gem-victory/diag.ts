// Diagnostic for the gem-victory takes: are the 0.4 s stutters at the screen shakes the game's own frames (rAF gaps,
// long tasks) or the camera's (the CDP screencast)? Loads the celebration for 12 s and prints both.
//   bun assets-src/tweet/2026-09-26/gem-victory/diag.ts [--cast] [--gpu] [--1080p]
import { chromium } from "playwright";
import { tweetSave } from "../../../../scripts/tweet-clips";

const args = process.argv.slice(2);
const cast = args.includes("--cast"), gpu = args.includes("--gpu");
const scale = args.includes("--1080p") ? 1.5 : 1;
const ci = args.indexOf("--css");
const css = ci >= 0 ? args[ci + 1] : "";
const FLOWER = {
  petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"],
  gems: ["a>a", "t>t", "p>p", "m>m", "i>i", "s>s", "n>n", "ay>ae"],
  energy: { "o>o": 5, "c>k": 3, "b>b": 6, "ai>ae": 8, "ss>s": 4, "l>l": 7 },
  words: { rain: { n: 2, ok: 2, last: 3 }, tail: { n: 1, ok: 1, last: 2 }, day: { n: 1, ok: 1, last: 1 } },
};
const browser = await chromium.launch({
  args: ["--autoplay-policy=no-user-gesture-required", `--force-device-scale-factor=${scale}`, "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
    ...(gpu ? ["--use-angle=metal", "--enable-gpu", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"] : [])],
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: scale });
await ctx.addInitScript((css) => {
  if (!css) return;
  const add = () => { const s = document.createElement("style"); s.textContent = css; document.head.appendChild(s); };
  if (document.head) add(); else document.addEventListener("DOMContentLoaded", add, { once: true });
}, css);
await ctx.addInitScript((save) => {
  try {
    localStorage.setItem("superninja.save.v1", JSON.stringify(save));
  } catch {}
  const w = window as any;
  w.__raf = [] as number[];
  w.__lt = [] as number[][];
  const tick = (t: number) => {
    w.__raf.push(t);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  try {
    new PerformanceObserver((l) => l.getEntries().forEach((e) => w.__lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: "longtask", buffered: true });
  } catch {}
  w.__shakes = [] as number[];
  new MutationObserver((ms) => ms.forEach((m) => (m.target as Element).classList?.contains("screen-shake") && w.__shakes.push(Math.round(performance.now())))).observe(document, { attributes: true, attributeFilter: ["class"], subtree: true });
}, tweetSave(FLOWER));
const page = await ctx.newPage();
const frames: number[] = [];
if (cast) {
  const cdp = await ctx.newCDPSession(page);
  cdp.on("Page.screencastFrame", (f: any) => {
    cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
    frames.push(f.metadata.timestamp * 1000);
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1280 * scale, maxHeight: 720 * scale, everyNthFrame: 1 });
}
await page.goto("https://next.superninja.templestein.com/play/?scene=tree&gem=ai%3Eae&celebrate=1", { waitUntil: "load" });
await page.waitForTimeout(12_000);
const r: any = await page.evaluate(() => ({ raf: (window as any).__raf, lt: (window as any).__lt, shakes: (window as any).__shakes, origin: performance.timeOrigin }));
const gaps = (ts: number[]) => ts.slice(1).map((t, i) => [ts[i], t - ts[i]]).filter(([, g]) => g > 40).map(([t, g]) => `${(t / 1000).toFixed(2)}:${Math.round(g)}`);
console.log(JSON.stringify({ cast, gpu, scale, css, rafFrames: r.raf.length, rafFps: +(r.raf.length / ((r.raf.at(-1) - r.raf[0]) / 1000)).toFixed(1) }));
console.log("shakes at (s):", r.shakes.map((t: number) => (t / 1000).toFixed(2)).join(" "));
console.log("rAF gaps >40ms (s:ms):", gaps(r.raf).join(" "));
console.log("long tasks (s:ms):", r.lt.map(([s, d]: number[]) => `${(s / 1000).toFixed(2)}:${d}`).join(" "));
if (cast) {
  const rel = frames.map((t) => t - r.origin);
  console.log(`cast frames ${rel.length}; gaps >40ms (s:ms):`, gaps(rel).join(" "));
}
await browser.close().catch(() => {});
process.exit(0);
