// Diagnostic (no filming): the rig reports ~265 ms screencast gaps ("hitches") around each right answer. Chrome's
// screencast sends a frame only when the picture changes, so a gap is either a real freeze or a moment where nothing on
// screen moves. Here a 2 px square in a corner changes colour every animation frame (so the picture always changes);
// if the gaps remain, they are real freezes. Also logs rAF gaps. Plays w1-2 on production with the clip drive.
import { chromium } from "playwright";
import { drive, saveFor, PROD } from "../drive";

const level = process.argv[2] ?? "w1-2";
const secs = Number(process.argv[3] ?? 40);
const scale = process.argv.includes("--1080") ? 1.5 : 1;
const beat = !process.argv.includes("--nobeat");
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", `--force-device-scale-factor=${scale}`, "--disable-background-timer-throttling", "--disable-renderer-backgrounding"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: scale });
await ctx.addInitScript(({ save, beat }) => {
  const w = window as any;
  w.__audioLog = [];
  w.__gaps = [];
  try { if (!localStorage.getItem("superninja.profiles.v1")) localStorage.setItem("superninja.save.v1", JSON.stringify(save)); } catch {}
  let last = performance.now(), k = 0;
  const tick = (t: number) => {
    if (t - last > 50) w.__gaps.push([Math.round(performance.timeOrigin + last), Math.round(t - last)]);
    last = t;
    const d = document.getElementById("__hb");
    if (d) d.style.background = k++ % 2 ? "#010101" : "#020202";
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  if (beat) addEventListener("DOMContentLoaded", () => {
    const d = document.createElement("div");
    d.id = "__hb";
    d.style.cssText = "position:fixed;right:0;top:0;width:2px;height:2px;z-index:2147483647;pointer-events:none;background:#010101";
    document.body.appendChild(d);
  });
}, { save: saveFor(level, "kai"), beat });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const frames: number[] = [];
cdp.on("Page.screencastFrame", (f: any) => {
  cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  frames.push(f.metadata.timestamp * 1000);
});
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1280 * scale, maxHeight: 720 * scale, everyNthFrame: 1 });
await page.goto(`${PROD}/play/?level=${level}`, { waitUntil: "load" });
const t0 = Date.now();
let live = true;
const rig: any = { live: () => live, wait: (ms: number) => page.waitForTimeout(ms).catch(() => {}), mark: () => {}, tap: (sel: string) => page.locator(sel).first().dispatchEvent("pointerdown", undefined, { timeout: 1500 }).catch(() => {}), elapsed: () => 0, bot: async () => {} };
const d = drive(page, rig);
await page.waitForTimeout(secs * 1000);
live = false;
await d.catch(() => {});
await cdp.send("Page.stopScreencast").catch(() => {});
const r = await page.evaluate(() => ({ gaps: (window as any).__gaps, log: (window as any).__audioLog.filter((e: any) => e.kind === "speech" || e.kind === "sfx").map((e: any) => [e.t, e.url]) }));
const inGame = frames.filter((t) => t > t0 + 2000);
const gaps = inGame.slice(1).map((t, i) => [inGame[i], t - inGame[i]]).filter(([, g]) => g > 70);
console.log(`screencast: ${inGame.length} frames, ${(inGame.length / ((inGame.at(-1)! - inGame[0]) / 1000)).toFixed(1)} fps, gaps >70 ms: ${gaps.length}`);
const ev = [...gaps.map(([t, g]) => [t, `SCREENCAST GAP ${Math.round(g)} ms`]), ...r.gaps.map(([t, g]: any) => [t, `RAF GAP ${g} ms`]), ...r.log.map(([t, u]: any) => [t, u])].sort((a: any, b: any) => a[0] - b[0]);
for (const e of ev) console.log(((e[0] as number - t0) / 1000).toFixed(2), e[1]);
await browser.close();
process.exit(0);
