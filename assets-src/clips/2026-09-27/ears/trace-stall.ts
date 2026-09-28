// Why does the warm-up freeze ~260 ms at the same moments in every take (w1-wu3: ~0.8 s into "Now you tap the
// tortoise...", and as the van/bag cards arrive)? A Chrome trace of production over the first 27 s of w1-wu3, and the
// long main-thread tasks in it with what they spent their time on.
//
//   bun assets-src/clips/2026-09-27/ears/trace-stall.ts [level] [seconds]
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { saveFor, PROD } from "./drive";
import { antiSampler } from "./antisampler";

const [level = "w1-wu3", secs = "27"] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--force-device-scale-factor=1.5", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", ...(process.env.VLOG ? ["--enable-logging=stderr", "--vmodule=video_capture_oracle=3,animated_content_sampler=3,frame_sink_video_capturer_impl=3"] : [])] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
await ctx.addInitScript((save) => {
  (window as any).__audioLog = [];
  try {
    if (!localStorage.getItem("superninja.profiles.v1")) localStorage.setItem("superninja.save.v1", JSON.stringify(save));
  } catch {}
}, saveFor("kai"));
if (process.env.SPECK === "1") await ctx.addInitScript(antiSampler);
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const chunks: any[] = [];
cdp.on("Tracing.dataCollected", (d: any) => chunks.push(...d.value));
const done = new Promise((r) => cdp.once("Tracing.tracingComplete", r));
await cdp.send("Tracing.start", { traceConfig: { includedCategories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "v8.execute", "blink", "cc", "gpu", "disabled-by-default-devtools.timeline.frame", "loading", "v8", "gpu.capture", "viz", "devtools", "disabled-by-default-devtools.screenshot", "media"] }, transferMode: "ReportEvents" });
// SCREENCAST=1: film it the way the rig does (JPEG q92 1920×1080, every frame acked), and report the gaps between frames
const shots: number[] = [];
const metas: any[] = [];
if (process.env.SCREENCAST === "1") {
  cdp.on("Page.screencastFrame", (f: any) => {
    cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
    shots.push(f.metadata.timestamp * 1000);
    metas.push(f.metadata);
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
}
const t0 = Date.now();
await page.goto(`${PROD}/play/?level=${level}`, { waitUntil: "load" });
// the child taps the tortoise once asked
let tapped = false;
while (Date.now() - t0 < Number(secs) * 1000) {
  const st: any = await page.evaluate(() => (window as any).__snState || {}).catch(() => ({}));
  if (!tapped && st.next === "tortoise" && st.asked) {
    await page.waitForTimeout(1000);
    await page.locator('.wu [aria-label="tortoise"]').first().dispatchEvent("pointerdown").catch(() => {});
    tapped = true;
  }
  await page.waitForTimeout(100);
}
const said: any[] = await page.evaluate(() => (window as any).__audioLog).catch(() => []);
await cdp.send("Tracing.end");
for (let i = 1; i < shots.length; i++) if (shots[i] - shots[i - 1] > 70) console.log(`screencast gap @${((shots[i - 1] - t0) / 1000).toFixed(2)} s: ${Math.round(shots[i] - shots[i - 1])} ms`, JSON.stringify(metas[i - 1]), JSON.stringify(metas[i]));
for (const a of said ?? []) if (a.kind === "speech") console.log(`speech @${((a.t - t0) / 1000).toFixed(2)} ${a.url}`);
await done;
const out = join(import.meta.dir, "takes", `trace-${level}.json`);
writeFileSync(out, JSON.stringify(chunks));
// long tasks on the renderer main thread
const main = chunks.find((e) => e.name === "thread_name" && e.args?.name === "CrRendererMain");
const tid = main?.tid, pid = main?.pid;
const onMain = chunks.filter((e) => e.tid === tid && e.pid === pid && e.ph === "X");
let tsBase = Infinity;
for (const e of chunks) if (e.ts > 0 && e.ts < tsBase) tsBase = e.ts;
const long = onMain.filter((e) => e.name === "RunTask" && e.dur > 120_000);
for (const t of long) {
  const kids = onMain.filter((e) => e !== t && e.ts >= t.ts && e.ts + (e.dur ?? 0) <= t.ts + t.dur && (e.dur ?? 0) > 15_000);
  console.log(`\n@${((t.ts - tsBase) / 1e6).toFixed(2)} s  ${(t.dur / 1000).toFixed(0)} ms`);
  for (const k of kids.slice(0, 25)) console.log(`   ${k.name} ${(k.dur / 1000).toFixed(0)} ms ${JSON.stringify(k.args?.data ?? {}).slice(0, 220)}`);
}
await browser.close();
process.exit(0);
