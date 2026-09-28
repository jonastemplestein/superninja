// Diagnostic (no filming): are the ~265 ms screencast gaps real main-thread stalls? Logs requestAnimationFrame gaps over
// 50 ms and long tasks, against what Sensei is saying, while the drive plays w1-2 on production at 720p.
import { chromium } from "playwright";
import { drive, saveFor, PROD } from "../drive";

const level = process.argv[2] ?? "w1-2";
const secs = Number(process.argv[3] ?? 50);
const gpu = process.argv.includes("--gpu");
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", ...(gpu ? ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] : [])] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
await ctx.addInitScript((save) => {
  const w = window as any;
  w.__audioLog = [];
  w.__gaps = [];
  w.__long = [];
  try { if (!localStorage.getItem("superninja.profiles.v1")) localStorage.setItem("superninja.save.v1", JSON.stringify(save)); } catch {}
  let last = performance.now();
  const tick = (t: number) => { if (t - last > 50) w.__gaps.push([Math.round(last), Math.round(t - last)]); last = t; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) w.__long.push([Math.round(e.startTime), Math.round(e.duration), JSON.stringify((e as any).attribution?.map((a: any) => a.containerSrc || a.name) ?? [])]); }).observe({ type: "longtask", buffered: true });
  } catch {}
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.duration > 50) w.__long.push([Math.round(e.startTime), Math.round(e.duration), "LoAF " + JSON.stringify(((e as any).scripts ?? []).map((s: any) => `${s.sourceFunctionName || s.invoker} ${s.sourceURL?.split("/").pop()}:${s.sourceCharPosition} ${Math.round(s.duration)}ms`))]); }).observe({ type: "long-animation-frame", buffered: true });
  } catch {}
}, saveFor(level, "kai"));
const page = await ctx.newPage();
await page.goto(`${PROD}/play/?level=${level}`, { waitUntil: "load" });
let live = true;
const rig: any = { live: () => live, wait: (ms: number) => page.waitForTimeout(ms).catch(() => {}), mark: () => {}, tap: (sel: string) => page.locator(sel).first().dispatchEvent("pointerdown", undefined, { timeout: 1500 }).catch(() => {}), elapsed: () => 0, bot: async () => {} };
const d = drive(page, rig);
await page.waitForTimeout(secs * 1000);
live = false;
await d.catch(() => {});
const r = await page.evaluate(() => {
  const w = window as any;
  const t0 = performance.timeOrigin;
  return { gaps: w.__gaps, long: w.__long, speech: w.__audioLog.filter((e: any) => e.kind === "speech" || e.kind === "tap" || e.kind === "sfx").map((e: any) => [Math.round(e.t - t0), e.kind, e.url]) };
});
const ev = [...r.gaps.map((g: any) => [g[0], `GAP ${g[1]} ms`]), ...r.long.map((l: any) => [l[0], `LONG ${l[1]} ms ${l[2]}`]), ...r.speech.map((s: any) => [s[0], `${s[1]} ${s[2]}`])].sort((a, b) => a[0] - b[0]);
for (const e of ev) console.log((e[0] / 1000).toFixed(2), e[1]);
await browser.close();
process.exit(0);
