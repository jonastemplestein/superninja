// Treadmill soak test: does the game get slower the longer a child plays? One page, NO reloads: the bot plays level after
// level through the map (reward → Next → the World Flower trip if one is due → the map → the next stone), like a child
// on a long session, while this samples the page every --every seconds:
//   CDP Performance.getMetrics (heap, Nodes incl. detached, JSEventListeners, Layout/RecalcStyle counts and durations,
//   main-thread TaskDuration, AudioHandlers, ArrayBufferContents), renderer + GPU process CPU and RSS, and in-page counts:
//   animations (running, infinite, infinite on hidden elements, main-thread ones), DOM nodes (whole page, the fx layer,
//   ninja spots, flames), live canvas particles, rAF requests per second (≈ live rAF loops), fps and janky frames (a 1 s
//   probe per sample), live intervals and pending timeouts, long tasks, <audio>/<video> elements alive, Web Audio nodes
//   created, live decoded audio bytes, global (window/document) listeners, and module state (listener sets, caches) via
//   the probes in soak.vite.config.ts. At each level boundary also a memory-infra dump (footprint by allocator).
// After each level, on the map, it forces a GC and takes a "boundary" sample: the soak invariant compares those with
// the first one (docs/PERF.md). Then: --idle s on the map, and --stress N: N streak-10 strikes fired at 7 a second on
// the ninja demo (the "particles pile up on a streak" hypothesis), then 10 s to settle, then the aura's standing cost.
//
// The game is served from a frozen snapshot of the working tree (soak.vite.config.ts: no HMR, no watcher), so edits
// made elsewhere mid-soak can't reload the page: --serve prod (default: a production build + vite preview, what phones
// run), --serve dev (vite dev server), or --serve none --base URL (an existing server; module probes only if it uses
// the soak config).
//
// Usage: bun scripts/treadmill/soak.ts [--levels 16] [--from w1-2] [--fast 2] [--mobile] [--cpu 4] [--every 10]
//          [--minutes 60] [--idle 60] [--stress 150] [--wrong 0.05] [--serve prod|dev|none] [--base URL] [--port N]
//          [--out playtest/soak/<run>] [--headed] [--check] [--findings file] [--heap] [--patched] [--no-memdump]
//   --mobile: phone emulation (844×390 landscape, DPR 3, touch, mobile UA); --cpu 4: CDP CPU throttling (4× slower).
//   --check: exit 1 if the soak invariant fails (for the treadmill). --heap: V8/Blink heap snapshots at the start and after
//   the levels, diffed by constructor into heap-diff.md (what the growth is made of). --patched: see soak-fixes.ts.
//   --analyse <dir>: re-run the analysis on a finished soak (e.g. after a budget changes), with the same flags.
//   --findings <file>: also write the invariant's failures as treadmill findings (types.ts), e.g. <runDir>/soak.json.
// Output: <out>/samples.json, samples.csv, levels.json, summary.md (tables + the invariant), report.html (charts).
import { chromium, type Page, type CDPSession } from "playwright";
import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { LEVELS } from "../../src/content/worlds";
import { save, step } from "./bot";
import type { Finding } from "./types";

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const flag = (k: string) => process.argv.includes(`--${k}`);
const N_LEVELS = Number(arg("levels", "16"));
const FROM = arg("from", "w1-2")!;
const FAST = Number(arg("fast", "2"));
const MOBILE = flag("mobile");
const CPU = Number(arg("cpu", "1"));
const EVERY = Number(arg("every", "10")) * 1000;
const MINUTES = Number(arg("minutes", "60"));
const IDLE_S = Number(arg("idle", "60"));
const STRESS = Number(arg("stress", "150"));
const WRONG = Number(arg("wrong", "0.05"));
const SERVE = arg("serve", "prod")!;
const PORT = Number(arg("port", String(5186 + (MOBILE ? 1 : 0) + (CPU > 1 ? 2 : 0) + (flag("patched") ? 4 : 0))));
const MEMDUMP = !flag("no-memdump");
const HEAP = flag("heap"); // heap snapshots at the start and after the levels, diffed by constructor (heap-diff.md)
const OUT = arg("analyse") ?? arg("out", `playtest/soak/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}${MOBILE ? "-mobile" : ""}${CPU > 1 ? `-cpu${CPU}` : ""}${flag("patched") ? "-patched" : ""}`)!;
const CHECK = flag("check");
const PATCHED = flag("patched"); // a preview of docs/PERF.md's fixes, patched into the snapshot (soak-fixes.ts)
const LEVEL_MAX_MS = 7 * 60_000; // real time per level before the soak gives up on it and moves on
const STUCK_MS = 45_000;
mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- the snapshot server
async function startServer(): Promise<{ base: string; stop: () => void; built?: string }> {
  if (SERVE === "none") return { base: arg("base", "http://localhost:5173")!, stop: () => {} };
  const cfg = "scripts/treadmill/soak.vite.config.ts";
  const vite = "node_modules/.bin/vite";
  let proc: ChildProcess;
  const built = new Date().toISOString();
  const env = { ...process.env, SOAK_FIXES: PATCHED ? "1" : "0", SOAK_FIXES_REPORT: `${OUT}/fixes.json` };
  if (SERVE === "prod") {
    const dist = `${tmpdir()}/superninja-soak-${PORT}`;
    console.log(`building a production snapshot → ${dist}`);
    execFileSync(vite, ["build", "--config", cfg, "--outDir", dist, "--logLevel", "warn"], { stdio: "inherit", env });
    proc = spawn(vite, ["preview", "--config", cfg, "--outDir", dist, "--port", String(PORT), "--strictPort"], { stdio: "ignore", env });
  } else proc = spawn(vite, ["--config", cfg, "--port", String(PORT), "--strictPort"], { stdio: "ignore", env });
  const base = `http://127.0.0.1:${PORT}`;
  for (let i = 0; i < 120; i++) {
    const ok = await fetch(`${base}/play/`).then((r) => r.ok, () => false);
    if (ok) return { base, stop: () => proc.kill(), built };
    await new Promise((r) => setTimeout(r, 500));
  }
  proc.kill();
  throw new Error(`the ${SERVE} server on ${base} never came up`);
}

// ---------------------------------------------------------------- in-page instrumentation (runs before the game)
function instrument() {
  const w = window as any;
  const P: any = (w.__snPerf = {
    raf: 0,
    long: { n: 0, ms: 0, max: 0 }, loaf: { n: 0, ms: 0, blocking: 0 },
    canvas: { cur: 0, last: 0, max: 0 },
    audio: { decoded: 0, decodedBytes: 0, liveBytes: 0, live: 0, sources: 0, osc: 0, gains: 0, filters: 0, mediaSources: 0, analysers: 0, buffers: 0 },
    media: [] as WeakRef<HTMLMediaElement>[], mediaCreated: 0,
    intervals: new Map<number, { ms: number; at: string }>(), pending: new Set<number>(),
  });
  // rAF: every request the game makes counts (requests per second / 60 ≈ live rAF loops). Frames are counted only in a
  // short probe (P.fps), because a loop of our own would itself keep the main thread producing frames, which is one of
  // the very costs this measures (an idle page with no rAF loop lets composited animations run without the main thread)
  const raf0 = window.requestAnimationFrame.bind(window);
  w.requestAnimationFrame = (cb: FrameRequestCallback) => (P.raf++, raf0(cb));
  P.fps = (ms: number) =>
    new Promise((resolve) => {
      let frames = 0, slow = 0, jank = 0, worst = 0, last = 0;
      const r0 = P.raf, t0 = performance.now();
      const f = (now: number) => {
        if (last) {
          const dt = now - last;
          if (dt > 25) slow++; // under 40 fps
          if (dt > 50) jank++; // under 20 fps
          worst = Math.max(worst, dt);
        }
        last = now;
        frames++;
        if (now - t0 < ms) raf0(f);
        else resolve({ fps: Math.round((frames / ((now - t0) / 1000)) * 10) / 10, frames, slow, jank, worst: Math.round(worst), rafPerFrame: Math.round(((P.raf - r0) / frames) * 10) / 10 });
      };
      raf0(f);
    });
  // timers: live intervals (with where they were set) and pending timeouts
  const st = window.setTimeout, ct = window.clearTimeout, si = window.setInterval, ci = window.clearInterval;
  w.setTimeout = (fn: any, ms?: number, ...a: unknown[]) => {
    let id = 0;
    const f = typeof fn === "function" ? (...x: unknown[]) => (P.pending.delete(id), fn(...x)) : fn;
    id = st(f, ms, ...a) as unknown as number;
    P.pending.add(id);
    return id;
  };
  w.clearTimeout = (id: number) => (P.pending.delete(id), ct(id));
  w.setInterval = (fn: any, ms?: number, ...a: unknown[]) => {
    const id = si(fn, ms, ...a) as unknown as number;
    P.intervals.set(id, { ms: ms ?? 0, at: (new Error().stack ?? "").split("\n").slice(2, 4).map((s) => s.trim()).join(" < ") });
    return id;
  };
  w.clearInterval = (id: number) => (P.intervals.delete(id), ci(id));
  // long tasks and long animation frames
  try {
    new PerformanceObserver((l) => l.getEntries().forEach((e) => ((P.long.n++), (P.long.ms += e.duration), (P.long.max = Math.max(P.long.max, e.duration))))).observe({ type: "longtask", buffered: true });
  } catch {}
  try {
    new PerformanceObserver((l) => l.getEntries().forEach((e: any) => ((P.loaf.n++), (P.loaf.ms += e.duration), (P.loaf.blocking += e.blockingDuration ?? 0)))).observe({ type: "long-animation-frame", buffered: true });
  } catch {}
  // resources fetched (unique image and audio URLs): decoded images and audio are what a long session piles up
  P.res = { img: new Set<string>(), audio: new Set<string>() };
  try {
    new PerformanceObserver((l) => l.getEntries().forEach((e) => (/\.(webp|png|jpe?g|avif|gif)(\?|$)/.test(e.name) ? P.res.img.add(e.name) : /\.(mp3|m4a|ogg|wav)(\?|$)/.test(e.name) && P.res.audio.add(e.name)))).observe({ type: "resource", buffered: true });
  } catch {}
  // the particle canvas (1280×720): save() calls between two full clears ≈ particles drawn that frame
  const C2D = CanvasRenderingContext2D.prototype;
  const save0 = C2D.save, clear0 = C2D.clearRect;
  C2D.save = function (this: CanvasRenderingContext2D) {
    if (this.canvas.width === 1280 && this.canvas.height === 720) P.canvas.cur++;
    return save0.call(this);
  };
  C2D.clearRect = function (this: CanvasRenderingContext2D, x: number, y: number, cw: number, ch: number) {
    if (this.canvas.width === 1280 && cw === 1280 && ch === 720) {
      P.canvas.last = P.canvas.cur;
      P.canvas.max = Math.max(P.canvas.max, P.canvas.cur);
      P.canvas.cur = 0;
    }
    return clear0.call(this, x, y, cw, ch);
  };
  // Web Audio: nodes created and bytes decoded (audio.ts keeps every decoded clip)
  const AC = (w.AudioContext ?? w.webkitAudioContext)?.prototype;
  if (AC) {
    const count: [string, string][] = [["createBufferSource", "sources"], ["createOscillator", "osc"], ["createGain", "gains"], ["createBiquadFilter", "filters"], ["createMediaElementSource", "mediaSources"], ["createAnalyser", "analysers"], ["createBuffer", "buffers"]];
    for (const [m, k] of count) {
      const f = AC[m];
      if (f) AC[m] = function (this: AudioContext, ...a: unknown[]) { P.audio[k]++; return f.apply(this, a); };
    }
    const dec = AC.decodeAudioData;
    // decoded bytes ever (decodedBytes) and still alive (liveBytes: a FinalizationRegistry takes them off once the
    // buffer is garbage collected, so an LRU that drops clips shows up here)
    const gone = new FinalizationRegistry<number>((bytes) => ((P.audio.liveBytes -= bytes), P.audio.live--));
    AC.decodeAudioData = function (this: AudioContext, ...a: any[]) {
      return dec.apply(this, a).then((b: AudioBuffer) => {
        const bytes = b.length * b.numberOfChannels * 4;
        P.audio.decoded++;
        P.audio.decodedBytes += bytes;
        P.audio.liveBytes += bytes;
        P.audio.live++;
        gone.register(b, bytes);
        return b;
      });
    };
  }
  // media elements, in the page or not (new Audio() for music)
  const A0 = w.Audio;
  w.Audio = function (...a: unknown[]) {
    const el = new A0(...a);
    P.media.push(new WeakRef(el));
    P.mediaCreated++;
    return el;
  };
  w.Audio.prototype = A0.prototype;
  const ce = Document.prototype.createElement;
  Document.prototype.createElement = function (this: Document, t: string, o?: ElementCreationOptions) {
    const el = ce.call(this, t, o);
    if (/^(audio|video)$/i.test(t)) (P.media.push(new WeakRef(el as HTMLMediaElement)), P.mediaCreated++);
    return el;
  } as typeof ce;
  // window/document listeners, by type (the kind that leak when an effect forgets to remove them)
  const ET = EventTarget.prototype, add0 = ET.addEventListener, rem0 = ET.removeEventListener;
  const L = (P.listeners = new Map<string, Set<unknown>>());
  const key = (t: unknown, type: string, o: any) => {
    const n = t === window ? "window" : t === document ? "document" : null;
    return n && `${n}:${type}${(typeof o === "boolean" ? o : o?.capture) ? ":capture" : ""}`;
  };
  ET.addEventListener = function (this: EventTarget, type: string, fn: any, o?: any) {
    const k = fn && !o?.once && key(this, type, o);
    if (k) (L.get(k) ?? L.set(k, new Set()).get(k)!).add(fn);
    return add0.call(this, type, fn, o);
  };
  ET.removeEventListener = function (this: EventTarget, type: string, fn: any, o?: any) {
    const k = fn && key(this, type, o);
    if (k) L.get(k)?.delete(fn);
    return rem0.call(this, type, fn, o);
  };
  // a snapshot, reset-on-read for the per-window counters
  P.read = () => {
    const out: any = {};
    // animations
    const anims = document.getAnimations();
    const COMPOSITED = new Set(["transform", "translate", "rotate", "scale", "opacity", "filter", "offset", "easing", "composite", "computedOffset"]);
    let running = 0, infinite = 0, hiddenInf = 0, mainInf = 0, finished = 0;
    const byName: Record<string, number> = {};
    const mainNames: Record<string, number> = {};
    const hiddenNames: Record<string, number> = {};
    for (const a of anims) {
      const eff = a.effect as KeyframeEffect | null;
      const inf = eff?.getTiming().iterations === Infinity;
      if (a.playState === "running") running++;
      if (a.playState === "finished") finished++;
      const el = eff?.target as Element | null;
      const cls = el ? String((el as any).className?.baseVal ?? el.className ?? "").split(" ").filter(Boolean)[0] ?? el.tagName.toLowerCase() : "?";
      const name = (a as any).animationName ? `@${(a as any).animationName}` : `.${cls}`;
      byName[name] = (byName[name] ?? 0) + 1;
      if (inf) infinite++;
      // (a paused endless animation costs nothing: only running ones count as hidden or main-thread)
      if (inf && a.playState === "running") {
        if (el && !(el as any).checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true, opacityProperty: true, visibilityProperty: true })) (hiddenInf++, (hiddenNames[name] = (hiddenNames[name] ?? 0) + 1));
        let props: string[] = [];
        try {
          props = eff!.getKeyframes().flatMap((k) => Object.keys(k));
        } catch {}
        // (a property the compositor can't animate, e.g. z-index, or any animation on an SVG element: Chrome runs both
        // on the main thread, with a style recalc and a repaint every frame)
        if (props.some((p) => !COMPOSITED.has(p)) || el instanceof SVGElement) (mainInf++, (mainNames[name] = (mainNames[name] ?? 0) + 1));
      }
    }
    out.anims = { total: anims.length, running, infinite, hiddenInfinite: hiddenInf, mainThreadInfinite: mainInf, finishedKept: finished, top: Object.entries(byName).sort((a, b) => b[1] - a[1]).slice(0, 8), mainThread: mainNames, hidden: hiddenNames };
    // DOM
    let all = 0;
    const tw = document.createTreeWalker(document, NodeFilter.SHOW_ALL);
    while (tw.nextNode()) all++;
    const fxd = document.querySelector(".fx-dom");
    out.dom = {
      attachedNodes: all,
      elements: document.getElementsByTagName("*").length,
      fxDom: fxd ? fxd.getElementsByTagName("*").length : null,
      fxDomTop: fxd ? fxd.childElementCount : null,
      scenes: document.querySelectorAll(".stage > .scene").length,
      ninjaSpots: document.querySelectorAll(".ninja-spot").length,
      flames: document.querySelectorAll(".nj-flame").length,
      ghosts: document.querySelectorAll(".nj-ghost").length,
      svgs: document.getElementsByTagName("svg").length,
      imgs: document.getElementsByTagName("img").length,
      canvases: document.getElementsByTagName("canvas").length,
    };
    // frames, rAF, timers, long tasks
    out.rafCalls = P.raf;
    P.raf = 0;
    out.long = { ...P.long, ms: Math.round(P.long.ms), max: Math.round(P.long.max) };
    out.loaf = { ...P.loaf, ms: Math.round(P.loaf.ms), blocking: Math.round(P.loaf.blocking) };
    P.long = { n: 0, ms: 0, max: 0 };
    P.loaf = { n: 0, ms: 0, blocking: 0 };
    out.canvas = { ...P.canvas };
    P.canvas.max = 0;
    const ivs: Record<string, number> = {};
    for (const v of P.intervals.values()) ivs[`${v.ms}ms ${v.at}`.slice(0, 160)] = (ivs[`${v.ms}ms ${v.at}`.slice(0, 160)] ?? 0) + 1;
    out.timers = { intervals: P.intervals.size, pendingTimeouts: P.pending.size, intervalSites: ivs };
    // media and audio
    P.media = P.media.filter((r: WeakRef<HTMLMediaElement>) => r.deref());
    let withSrc = 0, playing = 0;
    for (const r of P.media) {
      const e = r.deref();
      if (!e) continue;
      if (e.getAttribute("src") || e.currentSrc) withSrc++;
      if (!e.paused) playing++;
    }
    out.media = { created: P.mediaCreated, alive: P.media.length, withSrc, playing, inDom: document.querySelectorAll("audio, video").length };
    out.res = { images: P.res.img.size, audio: P.res.audio.size };
    let imgPx = 0;
    for (const im of document.images) if (im.complete) imgPx += im.naturalWidth * im.naturalHeight;
    out.res.imgInDomMB = Math.round((imgPx * 4) / 104857.6) / 10;
    out.audio = { ...P.audio, decodedMB: Math.round((P.audio.liveBytes / 1048576) * 10) / 10, decodedTotalMB: Math.round((P.audio.decodedBytes / 1048576) * 10) / 10 };
    const gl: Record<string, number> = {};
    let glN = 0;
    for (const [k, s] of L) if (s.size) ((gl[k] = s.size), (glN += s.size));
    out.globalListeners = { total: glN, byType: gl };
    // module state (soak.vite.config.ts probes)
    const mods = w.__snPerfMods ?? {};
    out.mods = Object.assign({}, ...Object.values(mods).map((f: any) => { try { return f(); } catch { return {}; } }));
    out.route = w.__snRoute ?? null;
    out.snScene = w.__snState?.scene ?? null;
    out.navLog = w.__snNavLog?.length ?? 0;
    out.audioLog = w.__audioLog?.length ?? 0;
    return out;
  };
}

// ---------------------------------------------------------------- sampling
type Sample = Record<string, any>;
const samples: Sample[] = [];
const t0 = Date.now();
let lastCpu: { at: number; renderer: number; gpu: number; browser: number } | null = null;
let lastMetrics: Record<string, number> | null = null;
let lastAt = 0;

async function procInfo(bcdp: CDPSession | null) {
  if (!bcdp) return null;
  try {
    const { processInfo } = (await bcdp.send("SystemInfo.getProcessInfo" as any)) as { processInfo: { type: string; id: number; cpuTime: number }[] };
    const sum = (t: string) => processInfo.filter((p) => p.type === t).reduce((a, p) => a + p.cpuTime, 0);
    const rss = (t: string) => {
      const ids = processInfo.filter((p) => p.type === t).map((p) => p.id).filter(Boolean);
      if (!ids.length) return null;
      try {
        return Math.round(execFileSync("ps", ["-o", "rss=", "-p", ids.join(",")], { encoding: "utf8" }).split("\n").filter(Boolean).reduce((a, s) => a + Number(s.trim()), 0) / 1024);
      } catch {
        return null;
      }
    };
    return { renderer: sum("renderer"), gpu: sum("GPU") + sum("gpu"), browser: sum("browser"), rendererRssMB: rss("renderer"), gpuRssMB: rss("GPU") ?? rss("gpu") };
  } catch {
    return null;
  }
}

/** A memory-infra dump (what chrome://tracing shows): each process's private footprint and its allocators (v8,
 *  blink_gc, partition_alloc, malloc, cc = compositor tiles, discardable = decoded images, web_cache, gpu, ...). */
async function memDump(bcdp: CDPSession | null) {
  if (!bcdp || !MEMDUMP) return null;
  const chunks: any[] = [];
  const on = (e: any) => chunks.push(...e.value);
  bcdp.on("Tracing.dataCollected" as any, on);
  try {
    await bcdp.send("Tracing.start" as any, { traceConfig: { includedCategories: ["disabled-by-default-memory-infra"], excludedCategories: ["*"], memoryDumpConfig: { triggers: [] } } });
    await bcdp.send("Tracing.requestMemoryDump" as any, { deterministic: true, levelOfDetail: "detailed" });
    const done = new Promise((r) => bcdp.once("Tracing.tracingComplete" as any, r));
    await bcdp.send("Tracing.end" as any);
    await done;
  } catch {
    return null;
  } finally {
    bcdp.off("Tracing.dataCollected" as any, on);
  }
  const MB = (hex?: string) => Math.round((parseInt(hex ?? "0", 16) / 1048576) * 10) / 10;
  const names = new Map<number, string>(chunks.filter((e) => e.ph === "M" && e.name === "process_name").map((e) => [e.pid, String(e.args?.name ?? "")]));
  const procs = new Map<number, { pid: number; name: string; footprint: number; top: Record<string, number>; detail: Record<string, number> }>();
  for (const e of chunks.filter((x) => x.ph === "v")) {
    const p = procs.get(e.pid) ?? { pid: e.pid, name: names.get(e.pid) ?? "?", footprint: 0, top: {}, detail: {} };
    const tot = e.args?.dumps?.process_totals;
    if (tot?.private_footprint_bytes) p.footprint = MB(tot.private_footprint_bytes);
    for (const [k, v] of Object.entries<any>(e.args?.dumps?.allocators ?? {})) {
      const mb = MB(v.attrs?.size?.value);
      const depth = k.split("/").length;
      if (depth === 1) p.top[k] = mb;
      else if (depth <= 3 && mb >= 1 && /^(cc|discardable|web_cache|partition_alloc\/partitions|gpu|v8|blink_gc|media|skia|canvas)/.test(k)) p.detail[k] = mb;
    }
    procs.set(e.pid, p);
  }
  const all = [...procs.values()];
  const renderer = all.filter((p) => /renderer/i.test(p.name)).sort((a, b) => b.footprint - a.footprint)[0] ?? null;
  const gpu = all.find((p) => /gpu/i.test(p.name)) ?? null;
  return { renderer, gpu, browser: all.find((p) => /browser/i.test(p.name))?.footprint ?? null };
}

async function sample(page: Page, cdp: CDPSession, bcdp: CDPSession | null, tag: string, extra: Record<string, unknown> = {}): Promise<Sample | null> {
  let mem: Awaited<ReturnType<typeof memDump>> = null;
  if (tag === "boundary" || tag === "baseline" || tag === "settled") {
    // a boundary is measured after a full GC, so garbage isn't mistaken for a leak; the rates (fps, CPU) are then
    // taken over a fresh 2 s window, so the GC itself isn't counted in them
    await cdp.send("HeapProfiler.collectGarbage").catch(() => {});
    await cdp.send("HeapProfiler.collectGarbage").catch(() => {});
    mem = await memDump(bcdp);
    await page.evaluate(() => (window as any).__snPerf?.read?.()).catch(() => null);
    const m0 = (await cdp.send("Performance.getMetrics")) as { metrics: { name: string; value: number }[] };
    lastMetrics = Object.fromEntries(m0.metrics.map((x) => [x.name, x.value]));
    lastAt = Date.now();
    const p0 = await procInfo(bcdp);
    if (p0) lastCpu = { at: Date.now(), renderer: p0.renderer, gpu: p0.gpu, browser: p0.browser };
    await page.waitForTimeout(2000);
  }
  const inPage = await page.evaluate(() => (window as any).__snPerf?.read?.() ?? null).catch(() => null);
  if (!inPage) return null;
  const { metrics } = (await cdp.send("Performance.getMetrics")) as { metrics: { name: string; value: number }[] };
  const m: Record<string, number> = Object.fromEntries(metrics.map((x) => [x.name, x.value]));
  const now = Date.now();
  const dt = lastAt ? (now - lastAt) / 1000 : 0;
  const d = (k: string) => (lastMetrics && dt ? (m[k] - lastMetrics[k]) / dt : null);
  const pi = await procInfo(bcdp);
  // a 1 s frame probe, after the window's counters are read (so its own rAF loop is at most 1 s of the next window)
  const fr: any = await page.evaluate(() => (window as any).__snPerf?.fps?.(1000) ?? null).catch(() => null);
  let cpu: Record<string, number | null> = {};
  if (pi) {
    if (lastCpu && dt) {
      const w = (now - lastCpu.at) / 1000;
      cpu = { rendererPct: Math.round(((pi.renderer - lastCpu.renderer) / w) * 100), gpuPct: Math.round(((pi.gpu - lastCpu.gpu) / w) * 100), browserPct: Math.round(((pi.browser - lastCpu.browser) / w) * 100) };
    }
    cpu.rendererRssMB = pi.rendererRssMB;
    cpu.gpuRssMB = pi.gpuRssMB;
    lastCpu = { at: now, renderer: pi.renderer, gpu: pi.gpu, browser: pi.browser };
  }
  const s: Sample = {
    t: Math.round((now - t0) / 1000),
    tag,
    ...extra,
    heapMB: Math.round((m.JSHeapUsedSize / 1048576) * 10) / 10,
    heapTotalMB: Math.round((m.JSHeapTotalSize / 1048576) * 10) / 10,
    nodes: m.Nodes,
    listeners: m.JSEventListeners,
    documents: m.Documents,
    frames: m.Frames,
    layoutObjects: m.LayoutObjects,
    audioHandlers: m.AudioHandlers,
    arrayBuffers: m.ArrayBufferContents,
    detachedScriptStates: m.DetachedScriptStates,
    layoutCount: m.LayoutCount,
    recalcStyleCount: m.RecalcStyleCount,
    // rates over the window since the last sample
    fps: fr?.fps ?? null,
    rafPerSec: dt ? Math.round((inPage.rafCalls / dt) * 10) / 10 : null,
    rafPerFrame: fr?.rafPerFrame ?? null,
    slowFramePct: fr?.frames ? Math.round((fr.slow / fr.frames) * 1000) / 10 : null,
    jankFrames: fr?.jank ?? null,
    worstFrameMs: fr?.worst ?? null,
    mainThreadPct: d("TaskDuration") != null ? Math.round(d("TaskDuration")! * 1000) / 10 : null,
    scriptPct: d("ScriptDuration") != null ? Math.round(d("ScriptDuration")! * 1000) / 10 : null,
    stylePct: d("RecalcStyleDuration") != null ? Math.round(d("RecalcStyleDuration")! * 1000) / 10 : null,
    layoutPct: d("LayoutDuration") != null ? Math.round(d("LayoutDuration")! * 1000) / 10 : null,
    recalcPerSec: d("RecalcStyleCount") != null ? Math.round(d("RecalcStyleCount")! * 10) / 10 : null,
    layoutPerSec: d("LayoutCount") != null ? Math.round(d("LayoutCount")! * 10) / 10 : null,
    ...cpu,
    longTasks: inPage.long.n,
    longTaskMs: inPage.long.ms,
    longTaskMax: inPage.long.max,
    loafBlockingMs: inPage.loaf.blocking,
    animations: inPage.anims.total,
    animRunning: inPage.anims.running,
    animInfinite: inPage.anims.infinite,
    animHiddenInfinite: inPage.anims.hiddenInfinite,
    animMainThreadInfinite: inPage.anims.mainThreadInfinite,
    animFinishedKept: inPage.anims.finishedKept,
    attachedNodes: inPage.dom.attachedNodes,
    detachedNodes: m.Nodes - inPage.dom.attachedNodes,
    elements: inPage.dom.elements,
    fxDomNodes: inPage.dom.fxDom,
    fxDomTop: inPage.dom.fxDomTop,
    scenes: inPage.dom.scenes,
    ninjaSpots: inPage.dom.ninjaSpots,
    flames: inPage.dom.flames,
    particles: inPage.mods.particles ?? inPage.canvas.last,
    particlesPeak: inPage.canvas.max,
    intervals: inPage.timers.intervals,
    pendingTimeouts: inPage.timers.pendingTimeouts,
    mediaAlive: inPage.media.alive,
    mediaWithSrc: inPage.media.withSrc,
    mediaPlaying: inPage.media.playing,
    mediaCreated: inPage.media.created,
    decodedClips: inPage.audio.live,
    decodedMB: inPage.audio.decodedMB,
    decodedTotalMB: inPage.audio.decodedTotalMB,
    audioSourcesCreated: inPage.audio.sources,
    audioBuffersCreated: inPage.audio.buffers,
    mediaSourceNodes: inPage.audio.mediaSources,
    globalListeners: inPage.globalListeners.total,
    navLog: inPage.navLog,
    route: inPage.route,
    snScene: inPage.snScene,
    imagesFetched: inPage.res.images,
    audioFetched: inPage.res.audio,
    imgInDomMB: inPage.res.imgInDomMB,
    ...(mem ? { footprintMB: mem.renderer?.footprint ?? null, gpuFootprintMB: mem.gpu?.footprint ?? null, ...Object.fromEntries(Object.entries(mem.renderer?.top ?? {}).map(([k, v]) => [`mem_${k}`, v])) } : {}),
    mods: inPage.mods,
    mem,
    detail: { anims: inPage.anims, globalListeners: inPage.globalListeners.byType, intervals: inPage.timers.intervalSites, dom: inPage.dom },
  };
  lastMetrics = m;
  lastAt = now;
  samples.push(s);
  const line = `${String(s.t).padStart(5)}s ${tag.padEnd(9)} ${String(s.route ?? "").padEnd(16)} fps ${String(s.fps ?? "-").padStart(4)} main ${String(s.mainThreadPct ?? "-").padStart(5)}% cpu ${String(s.rendererPct ?? "-").padStart(4)}%/${String(s.gpuPct ?? "-").padStart(3)}% heap ${s.heapMB}MB nodes ${s.nodes} (fx ${s.fxDomNodes}) listeners ${s.listeners} anims ${s.animations}/${s.animInfinite}inf particles ${s.particles}/${s.particlesPeak} raf/s ${s.rafPerSec} iv ${s.intervals} decoded ${s.decodedMB}MB`;
  console.log(line);
  return s;
}

// ---------------------------------------------------------------- heap snapshots (V8 + Blink objects), by constructor
type HeapAgg = Map<string, { n: number; size: number }>;
async function heapSummary(cdp: CDPSession): Promise<HeapAgg> {
  await cdp.send("HeapProfiler.enable");
  await cdp.send("HeapProfiler.collectGarbage");
  const parts: string[] = [];
  const on = (e: any) => parts.push(e.chunk);
  cdp.on("HeapProfiler.addHeapSnapshotChunk" as any, on);
  await cdp.send("HeapProfiler.takeHeapSnapshot" as any, { reportProgress: false, captureNumericValue: false });
  cdp.off("HeapProfiler.addHeapSnapshotChunk" as any, on);
  const snap = JSON.parse(parts.join(""));
  const f: string[] = snap.snapshot.meta.node_fields;
  const types: string[] = snap.snapshot.meta.node_types[0];
  const W = f.length, iType = f.indexOf("type"), iName = f.indexOf("name"), iSize = f.indexOf("self_size");
  const agg: HeapAgg = new Map();
  const nodes: number[] = snap.nodes;
  for (let i = 0; i < nodes.length; i += W) {
    const type = types[nodes[i + iType]];
    let name = type === "object" || type === "native" || type === "closure" ? String(snap.strings[nodes[i + iName]]) : `(${type})`;
    name = name.replace(/\s+/g, " ").slice(0, 80);
    const a = agg.get(name) ?? { n: 0, size: 0 };
    a.n++;
    a.size += nodes[i + iSize];
    agg.set(name, a);
  }
  return agg;
}
function heapDiff(a: HeapAgg, b: HeapAgg): string {
  const rows = [...new Set([...a.keys(), ...b.keys()])].map((k) => {
    const x = a.get(k) ?? { n: 0, size: 0 }, y = b.get(k) ?? { n: 0, size: 0 };
    return { k, dn: y.n - x.n, ds: y.size - x.size, n: y.n, size: y.size };
  });
  const kb = (v: number) => (Math.round(v / 102.4) / 10).toLocaleString("en-GB");
  const table = (list: typeof rows) => ["| constructor | count now | Δ count | size now KB | Δ size KB |", "|---|---|---|---|---|", ...list.map((r) => `| ${r.k.replace(/\|/g, "/")} | ${r.n} | ${r.dn > 0 ? "+" : ""}${r.dn} | ${kb(r.size)} | ${r.ds > 0 ? "+" : ""}${kb(r.ds)} |`)].join("\n");
  const tot = (m: HeapAgg) => [...m.values()].reduce((s, v) => s + v.size, 0);
  return [
    `# Heap growth over the soak (${OUT.split("/").pop()})`,
    "",
    `Snapshots after a forced GC: at the start (on the map) and after the last level (on the map). Total ${kb(tot(a))} KB → ${kb(tot(b))} KB. Blink (C++) objects are included by the snapshot as native nodes.`,
    "",
    "## Biggest growth by size",
    "",
    table(rows.filter((r) => r.ds > 0).sort((x, y) => y.ds - x.ds).slice(0, 30)),
    "",
    "## Biggest growth by count",
    "",
    table(rows.filter((r) => r.dn > 0).sort((x, y) => y.dn - x.dn).slice(0, 30)),
    "",
  ].join("\n");
}

// ---------------------------------------------------------------- the bot, level after level through the map
const ev = <T,>(page: Page, fn: () => T) => page.evaluate(fn).catch(() => null as T | null);
async function tap(page: Page, sel: string) {
  const el = page.locator(sel).first();
  if (!(await el.count().catch(() => 0))) return false;
  await el.dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
  return true;
}

async function main() {
  const server = await startServer();
  const BASE = server.base;
  console.log(`soak: ${N_LEVELS} levels from ${FROM} at fast=${FAST}${MOBILE ? ", phone emulation" : ""}${CPU > 1 ? `, CPU ${CPU}× slower` : ""}, served ${SERVE} from ${BASE} → ${OUT}`);
  const browser = await chromium.launch({ headless: !flag("headed"), args: ["--autoplay-policy=no-user-gesture-required"] });
  const ctx = await browser.newContext(
    MOBILE
      ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36" }
      : { viewport: { width: 844, height: 390 }, hasTouch: true },
  );
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${Math.round((Date.now() - t0) / 1000)}s pageerror ${e.message.slice(0, 200)}`));
  page.on("console", (m) => m.type() === "error" && !/favicon|404|net::ERR/.test(m.text()) && errors.push(`${Math.round((Date.now() - t0) / 1000)}s console ${m.text().slice(0, 200)}`));
  let reloads = 0;
  page.on("load", () => void reloads++);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Performance.enable", { timeDomain: "timeTicks" } as any);
  if (CPU > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });
  const bcdp = await browser.newBrowserCDPSession().catch(() => null);
  await page.addInitScript(instrument);

  // one save for the whole session: a child who has done the intro and training, with everything unlocked
  await page.goto(`${BASE}/play/`);
  await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...save(), settings: { relaxed: false, music: 0.32, captions: false, unlockAll: true } });
  await page.goto(`${BASE}/play/?scene=map&fast=${FAST}`);
  await page.mouse.click(422, 4); // the first gesture unlocks audio
  reloads = 0;
  if (CPU > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });
  await page.waitForTimeout(4000);
  await sample(page, cdp, bcdp, "baseline", { level: null, levelIndex: 0 });
  const heap0 = HEAP ? await heapSummary(cdp) : null;

  const start = LEVELS.findIndex((l) => l.id === FROM);
  const plan = LEVELS.slice(Math.max(0, start), Math.max(0, start) + N_LEVELS);
  const levels: { id: string; kind: string; secs: number; ok: boolean; streakEnd: number | null; maxStreak: number; stuck?: string }[] = [];
  let nextSample = Date.now() + EVERY;
  const deadline = t0 + MINUTES * 60_000;
  let maxStreak = 0;

  for (let li = 0; li < plan.length && Date.now() < deadline; li++) {
    const lv = plan[li];
    const tl = Date.now();
    let entered = false, left = false, stuck: string | undefined, lastSig = "", lastChange = Date.now(), wrongDone = new Set<string>();
    let levelMax = 0;
    while (Date.now() - tl < LEVEL_MAX_MS && Date.now() < deadline) {
      if (Date.now() >= nextSample) {
        await sample(page, cdp, bcdp, "periodic", { level: lv.id, levelIndex: li + 1 });
        nextSample = Date.now() + EVERY;
      }
      const route: string = (await ev(page, () => (window as any).__snRoute ?? "")) ?? "";
      const nav: any = await ev(page, () => (window as any).__snNav ?? null);
      const st: any = (await ev(page, () => (window as any).__snState ?? {})) ?? {};
      const sn = (await ev(page, () => (window as any).__streak?.n ?? null)) ?? 0;
      levelMax = Math.max(levelMax, sn);
      if (route === `level:${lv.id}`) entered = true;
      if (entered && !route.startsWith("level:")) left = true;
      // on the map: before this level, tap its stone; after it, the level is done
      if (route.startsWith("map")) {
        if (left) break;
        if (nav?.next === "ready") await tap(page, '[data-nav="next"]');
        else if (!(await tap(page, `button[aria-label="level ${lv.id}"]`))) {
          // (the stone is on another land's map)
          await page.evaluate((w) => (window as any).__sn?.go({ name: "map", world: w }), lv.world).catch(() => {});
          await page.waitForTimeout(1500);
        }
        await page.waitForTimeout(700);
        continue;
      }
      // the end of a level or a reward holds on Next with "Play again" beside it: a child taps Next
      const playAgain = await page.locator('button[aria-label="Play again"]').count().catch(() => 0);
      if (playAgain && nav?.next === "ready") {
        await tap(page, '[data-nav="next"]');
        await page.waitForTimeout(600);
        continue;
      }
      // now and then a first try is wrong (streaks break, the ninja thinks), about WRONG of the answerable items
      if (WRONG > 0 && route.startsWith("level:") && typeof st.next === "string" && !st.busy) {
        const k = `${st.scene}|${st.next}`;
        if (!wrongDone.has(k)) {
          wrongDone.add(k);
          if (Math.random() < WRONG) {
            const wrong = page.locator(`.row button.tile:not([aria-label="${st.next}"]), .pick-row button:not([aria-label="${st.next}"])`).first();
            if (await wrong.count().catch(() => 0)) {
              await wrong.dispatchEvent("pointerdown").catch(() => {});
              await page.waitForTimeout(900 / FAST);
            }
          }
        }
      }
      await step(page).catch(() => {});
      const sig = `${route}|${JSON.stringify(st)}|${(await ev(page, () => (window as any).__audioLog?.length ?? 0)) ?? 0}`;
      if (sig !== lastSig) (lastSig = sig), (lastChange = Date.now());
      else if (Date.now() - lastChange > STUCK_MS) {
        stuck = `no change for ${STUCK_MS / 1000}s on ${route} ${JSON.stringify(st).slice(0, 160)}`;
        console.log(`stuck: ${stuck}`);
        await page.screenshot({ path: `${OUT}/stuck-${lv.id}.png` }).catch(() => {});
        await page.evaluate((w) => (window as any).__sn?.go({ name: "map", world: w }), lv.world).catch(() => {});
        await page.waitForTimeout(2500);
        break;
      }
      await page.waitForTimeout(300);
    }
    maxStreak = Math.max(maxStreak, levelMax);
    const endStreak = await ev(page, () => (window as any).__streak?.n ?? null);
    const secs = Math.round((Date.now() - tl) / 1000);
    levels.push({ id: lv.id, kind: lv.kind, secs, ok: left && !stuck, streakEnd: endStreak, maxStreak: levelMax, ...(stuck ? { stuck } : {}) });
    // settle on the map (its arrival animation, the walk), then the boundary sample
    for (let k = 0; k < 20; k++) {
      const r = await ev(page, () => (window as any).__snRoute ?? "");
      if (String(r).startsWith("map")) break;
      const nav: any = await ev(page, () => (window as any).__snNav ?? null);
      if (nav?.next === "ready") await tap(page, '[data-nav="next"]');
      else await step(page).catch(() => {});
      await page.waitForTimeout(700);
    }
    await page.waitForTimeout(3500);
    console.log(`— ${lv.id} (${lv.kind}) ${left && !stuck ? "done" : "NOT finished"} in ${secs}s, streak max ${levelMax}`);
    await sample(page, cdp, bcdp, "boundary", { level: lv.id, levelIndex: li + 1, streak: endStreak, maxStreak: levelMax });
    nextSample = Date.now() + EVERY;
  }

  if (heap0) {
    const heap1 = await heapSummary(cdp);
    writeFileSync(`${OUT}/heap-diff.md`, heapDiff(heap0, heap1));
    console.log(`heap snapshots diffed → ${OUT}/heap-diff.md`);
  }
  // ---- idle on the map: what does standing still cost, and does anything keep running?
  for (let s = 0; s < IDLE_S; s += EVERY / 1000) {
    await page.waitForTimeout(EVERY);
    await sample(page, cdp, bcdp, "idle-map", { level: null, levelIndex: levels.length });
  }
  await sample(page, cdp, bcdp, "settled", { level: null, levelIndex: levels.length, phase: "after soak" });

  // ---- the streak hypothesis: a tier-3 ninja striking fast, over and over (the ninja demo scene)
  if (STRESS > 0) {
    await page.evaluate(() => (window as any).__sn?.go({ name: "ninja-demo" })).catch(() => {});
    await page.waitForTimeout(2500);
    await page.evaluate(() => (window as any).__streak?.set(0)).catch(() => {});
    await page.waitForTimeout(EVERY);
    await sample(page, cdp, bcdp, "aura-t0", { phase: "ninja demo, streak 0, idle" });
    await page.waitForTimeout(EVERY);
    await sample(page, cdp, bcdp, "aura-t0", { phase: "ninja demo, streak 0, idle" });
    await page.evaluate(() => (window as any).__streak?.set(10)).catch(() => {});
    await page.waitForTimeout(EVERY);
    await sample(page, cdp, bcdp, "aura-t3", { phase: "ninja demo, streak 10, idle" });
    await page.waitForTimeout(EVERY);
    await sample(page, cdp, bcdp, "aura-t3", { phase: "ninja demo, streak 10, idle" });
    await sample(page, cdp, bcdp, "settled", { phase: "before stress" });
    const ts = Date.now();
    let fired = 0;
    let peak = { particles: 0, fx: 0, anims: 0 };
    while (fired < STRESS) {
      await page.evaluate(() => {
        const w = window as any;
        const t = document.querySelector('[data-target="monster"]');
        w.__streak?.hit();
        void w.__ninja?.strike(t);
      }).catch(() => {});
      fired++;
      if (fired % 15 === 0) {
        const p: any = await ev(page, () => ({ particles: (window as any).__snPerfMods?.["ui/ui.tsx"]?.().particles ?? 0, fx: document.querySelector(".fx-dom")?.getElementsByTagName("*").length ?? 0, anims: document.getAnimations().length }));
        if (p) peak = { particles: Math.max(peak.particles, p.particles), fx: Math.max(peak.fx, p.fx), anims: Math.max(peak.anims, p.anims) };
      }
      if (Date.now() >= nextSample) {
        await sample(page, cdp, bcdp, "stress", { phase: `strike ${fired}/${STRESS}` });
        nextSample = Date.now() + EVERY;
      }
      await page.waitForTimeout(140);
    }
    console.log(`stress: ${fired} strikes in ${Math.round((Date.now() - ts) / 1000)}s, peak particles ${peak.particles}, fx nodes ${peak.fx}, animations ${peak.anims}`);
    await sample(page, cdp, bcdp, "stress", { phase: "last strike", peak });
    await page.waitForTimeout(10_000);
    await sample(page, cdp, bcdp, "settled", { phase: "10 s after the stress" });
    // back to the map: the ninja unmounts, everything it owned should go
    await page.evaluate(() => (window as any).__streak?.set(0)).catch(() => {});
    await page.evaluate(() => (window as any).__sn?.go({ name: "map" })).catch(() => {});
    await page.waitForTimeout(6000);
    await sample(page, cdp, bcdp, "settled", { phase: "map after the stress" });
  }

  await browser.close();
  server.stop();
  // ---------------------------------------------------------------- report
  const bounds = samples.filter((s) => s.tag === "baseline" || s.tag === "boundary");
  const report = analyse(bounds, levels, errors, reloads, maxStreak, server.built);
  writeFileSync(`${OUT}/samples.json`, JSON.stringify(samples, null, 1));
  writeFileSync(`${OUT}/levels.json`, JSON.stringify({ levels, errors, reloads }, null, 1));
  const cols = [...new Set(samples.flatMap((s) => Object.keys(s)))].filter((k) => !["mods", "detail", "peak", "mem"].includes(k));
  writeFileSync(`${OUT}/samples.csv`, [cols.join(","), ...samples.map((s) => cols.map((c) => JSON.stringify(s[c] ?? "")).join(","))].join("\n"));
  writeFileSync(`${OUT}/summary.md`, report.md);
  writeFileSync(`${OUT}/report.html`, html(report.md));
  if (arg("findings")) writeFileSync(arg("findings")!, JSON.stringify(toFindings(report.fails), null, 1));
  console.log(`\n${report.md}\n→ ${OUT}`);
  if (CHECK && !report.pass) process.exit(1);
}

// ---------------------------------------------------------------- analysis: the soak invariant (docs/PERF.md)
/** The soak invariant (docs/PERF.md). After each level, back on the map after a forced GC, every metric here must be
 *  ≤ baseline × slack + abs: a level leaves nothing behind, and a still screen asks for no frames. */
const BUDGET: Record<string, { slack: number; abs: number }> = {
  nodes: { slack: 1, abs: 600 }, // CDP Nodes: attached and detached DOM nodes
  heapMB: { slack: 1, abs: 8 },
  listeners: { slack: 1, abs: 40 },
  animations: { slack: 1, abs: 5 }, // nothing left animating from the level
  particles: { slack: 0, abs: 5 },
  fxDomNodes: { slack: 0, abs: 0 },
  intervals: { slack: 1, abs: 1 },
  rafPerSec: { slack: 0, abs: 5 }, // no always-on rAF loops: an idle screen lets the main thread sleep
  decodedMB: { slack: 0, abs: 64 }, // decoded audio stays within a budget
  audioHandlers: { slack: 1, abs: 8 }, // Web Audio nodes don't pile up
  mediaAlive: { slack: 1, abs: 2 }, // nor <audio> elements
  // (no budget on footprintMB/rendererRssMB: under Playwright they include DevTools' own copies of every response
  // body, since Playwright always enables the Network domain, and Chrome's decoded-image cache; see docs/PERF.md)
};
/** While playing (every periodic sample): at most this many endless animations the compositor can't run, or on hidden
 *  elements. */
const PLAYING_MAX = { animMainThreadInfinite: 2, animHiddenInfinite: 2 };
const FPS_MIN = 50; // every screen's median fps while playing (the phone profile: --mobile --cpu 4)
const IDLE_MAIN_MAX = 5; // % main thread on the still map, when throttled (--cpu > 1): a still screen lets the phone rest

function slope(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 2) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) (num += (xs[i] - mx) * (ys[i] - my)), (den += (xs[i] - mx) ** 2);
  return den ? num / den : 0;
}

function analyse(bounds: Sample[], levels: any[], errors: string[], reloads: number, maxStreak: number, built?: string) {
  const base = bounds[0];
  const last = bounds[bounds.length - 1];
  const metrics = ["heapMB", "nodes", "detachedNodes", "attachedNodes", "listeners", "globalListeners", "animations", "animInfinite", "animHiddenInfinite", "animMainThreadInfinite", "fxDomNodes", "particles", "rafPerSec", "intervals", "pendingTimeouts", "mediaAlive", "decodedMB", "decodedTotalMB", "decodedClips", "audioHandlers", "arrayBuffers", "layoutObjects", "navLog", "imagesFetched", "audioFetched", "imgInDomMB", "rendererRssMB", "gpuRssMB", "footprintMB", "gpuFootprintMB", ...[...new Set(bounds.flatMap((s) => Object.keys(s).filter((k) => k.startsWith("mem_"))))].sort()];
  const rows: string[] = [];
  const fails: string[] = [];
  for (const k of metrics) {
    const ys = bounds.map((s) => Number(s[k] ?? NaN)).filter((v) => !Number.isNaN(v));
    if (!ys.length) continue;
    const xs = bounds.filter((s) => !Number.isNaN(Number(s[k] ?? NaN))).map((s) => s.levelIndex ?? 0);
    const sl = slope(xs, ys);
    const b = (BUDGET as any)[k];
    let verdict = "";
    if (b && base) {
      const limit = Number(base[k] ?? 0) * b.slack + b.abs;
      const over = bounds.filter((s) => Number(s[k] ?? 0) > limit);
      verdict = over.length ? `FAIL (> ${Math.round(limit * 10) / 10} after ${over.map((s) => s.level ?? "start").slice(0, 4).join(", ")}${over.length > 4 ? "…" : ""})` : `ok (≤ ${Math.round(limit * 10) / 10})`;
      if (over.length) fails.push(`${k}: ${verdict}`);
    }
    rows.push(`| ${k} | ${base?.[k] ?? "-"} | ${ys.map((v) => Math.round(v * 10) / 10).join(" ")} | ${last?.[k] ?? "-"} | ${Math.round(sl * 100) / 100} | ${verdict} |`);
  }
  const play = samples.filter((s) => s.tag === "periodic");
  const med = (a: number[]) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor((a.length - 1) / 2)] : null);
  // fps per screen (level, reward, World Flower...): its median over the play windows
  const byRoute = new Map<string, number[]>();
  for (const s of play) if (s.fps != null) (byRoute.get(String(s.route)) ?? byRoute.set(String(s.route), []).get(String(s.route))!).push(s.fps);
  const slowScreens = [...byRoute].map(([r, v]) => [r, med(v)!] as const).filter(([, m]) => m < FPS_MIN);
  if (slowScreens.length) fails.push(`fps: median under ${FPS_MIN} on ${slowScreens.map(([r, m]) => `${r} (${m})`).join(", ")}`);
  const idle = samples.filter((s) => s.tag === "idle-map" && s.mainThreadPct != null);
  const idleMain = med(idle.map((s) => s.mainThreadPct));
  if (CPU > 1 && idleMain != null && idleMain > IDLE_MAIN_MAX) fails.push(`idle: the still map keeps the main thread ${idleMain}% busy (> ${IDLE_MAIN_MAX}%, CPU ×${CPU})`);
  for (const [k, max] of Object.entries(PLAYING_MAX)) {
    const over = play.filter((s) => Number(s[k] ?? 0) > max);
    if (over.length) fails.push(`${k} while playing: > ${max} in ${over.length}/${play.length} samples (max ${Math.max(...over.map((s) => Number(s[k])))}, e.g. ${JSON.stringify((k === "animHiddenInfinite" ? over[0].detail?.anims?.hidden : over[0].detail?.anims?.mainThread) ?? {})})`);
  }
  if (reloads) fails.push(`the page reloaded ${reloads}× during the soak`);
  const firstHalf = play.slice(0, Math.floor(play.length / 2)), secondHalf = play.slice(Math.floor(play.length / 2));
  const avg = (a: Sample[], k: string) => {
    const v = a.map((s) => s[k]).filter((x) => x != null) as number[];
    return v.length ? Math.round((v.reduce((x, y) => x + y, 0) / v.length) * 10) / 10 : null;
  };
  const perf = ["fps", "slowFramePct", "mainThreadPct", "scriptPct", "stylePct", "layoutPct", "recalcPerSec", "rendererPct", "gpuPct", "longTaskMs", "rafPerSec", "rafPerFrame", "animHiddenInfinite", "animMainThreadInfinite", "animations", "animInfinite", "particles", "particlesPeak"];
  const perfRows = perf.map((k) => `| ${k} | ${avg(firstHalf, k)} | ${avg(secondHalf, k)} |`);
  const phases = samples.filter((s) => !["periodic", "boundary", "baseline"].includes(s.tag));
  const phaseRows = phases.map((s) => `| ${s.tag} | ${s.phase ?? s.route ?? ""} | ${s.fps} | ${s.mainThreadPct} | ${s.stylePct} | ${s.recalcPerSec} | ${s.rendererPct ?? "-"} | ${s.gpuPct ?? "-"} | ${s.particles} / ${s.particlesPeak} | ${s.fxDomNodes} | ${s.animations} (${s.animInfinite} inf, ${s.animMainThreadInfinite} main) | ${s.nodes} | ${s.heapMB} |`);
  const lvRows = levels.map((l) => `| ${l.id} | ${l.kind} | ${l.secs} | ${l.ok ? "yes" : "NO"} | ${l.maxStreak} | ${l.streakEnd ?? ""} | ${l.stuck ?? ""} |`);
  const lastDetail = last?.detail;
  const md = [
    `# Soak ${OUT.split("/").pop()}`,
    "",
    `${levels.length} levels in one page (no reloads: ${reloads === 0 ? "none" : reloads}), fast=${FAST}${MOBILE ? ", phone emulation (844×390, DPR 3)" : ", desktop 844×390"}${CPU > 1 ? `, CPU throttled ${CPU}×` : ""}, served ${SERVE}${built ? ` (snapshot built ${built})` : ""}${PATCHED ? ", **with the docs/PERF.md fixes patched in (preview)**" : ""}. Longest streak: ${maxStreak}. Page errors: ${errors.length}.`,
    "",
    `**Soak invariant: ${fails.length ? "FAIL" : "pass"}**${fails.length ? "\n\n" + fails.map((f) => `- ${f}`).join("\n") : ""}`,
    "",
    "## After each level (on the map, after a forced GC)",
    "",
    "| metric | baseline | per level → | last | slope / level | budget |",
    "|---|---|---|---|---|---|",
    ...rows,
    "",
    "## While playing (periodic samples): first half vs second half",
    "",
    "| metric | first half | second half |",
    "|---|---|---|",
    ...perfRows,
    "",
    "## Phases (idle, the ninja's aura, the strike stress)",
    "",
    "| phase | what | fps | main % | style % | recalcs/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | Nodes | heap MB |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|",
    ...phaseRows,
    "",
    "## Levels",
    "",
    "| level | kind | secs | finished | max streak | streak at end | stuck |",
    "|---|---|---|---|---|---|---|",
    ...lvRows,
    "",
    "## Last boundary: what is still running",
    "",
    "```",
    JSON.stringify({ animations: lastDetail?.anims, globalListeners: lastDetail?.globalListeners, intervals: lastDetail?.intervals, mods: last?.mods }, null, 1),
    "```",
    "",
    errors.length ? `## Errors\n\n${errors.slice(0, 30).map((e) => `- ${e}`).join("\n")}\n` : "",
  ].join("\n");
  return { md, pass: !fails.length, fails };
}

const LABEL: Record<string, string> = {
  rafPerSec: "a still screen keeps asking for frames (an always-on rAF loop)",
  idle: "the still map keeps a slow phone's main thread busy",
  fps: "a screen runs under 50 fps on a slow phone",
  decodedMB: "decoded audio keeps growing",
  audioHandlers: "Web Audio nodes pile up",
  mediaAlive: "<audio> elements pile up",
  nodes: "DOM nodes pile up",
  heapMB: "the JS heap keeps growing",
  listeners: "event listeners pile up",
  animations: "animations left running after a level",
  particles: "particles left after a level",
  fxDomNodes: "effect nodes left after a level",
  intervals: "intervals left running after a level",
  animMainThreadInfinite: "endless animations the compositor can't run (repainted every frame)",
  animHiddenInfinite: "endless animations running on hidden elements",
  reloaded: "the page reloaded during the soak",
};
/** The invariant's failures as treadmill findings (types.ts), for playtest/INBOX.md: --findings <file>. */
function toFindings(fails: string[]): Finding[] {
  const SEV: Record<string, Finding["severity"]> = { reloaded: "blocker", animMainThreadInfinite: "minor", animHiddenInfinite: "minor" };
  const cmd = `bun scripts/treadmill/soak.ts ${process.argv.slice(2).filter((a, i, all) => !["--findings", "--out", "--analyse"].includes(all[i - 1] ?? "") && !["--findings", "--out", "--analyse"].includes(a)).join(" ")}`.trim();
  return fails.map((f) => {
    const key = f.startsWith("the page reloaded") ? "reloaded" : f.split(/[: ]/)[0];
    return { sig: `soak:${key}`, source: "invariant", severity: SEV[key] ?? "major", case: "soak", title: `soak: ${LABEL[key] ?? key}`, detail: f, evidence: [`${OUT}/summary.md`, `${OUT}/report.html`], repro: cmd };
  });
}

function html(md: string) {
  const keys = ["fps", "mainThreadPct", "rendererPct", "gpuPct", "heapMB", "nodes", "detachedNodes", "listeners", "animations", "animInfinite", "particles", "particlesPeak", "fxDomNodes", "rafPerSec", "intervals", "decodedMB", "footprintMB", "audioHandlers", "recalcPerSec", "longTaskMs"];
  const chart = (k: string) => {
    const pts = samples.filter((s) => s[k] != null);
    if (pts.length < 2) return "";
    const xs = pts.map((s) => s.t), ys = pts.map((s) => Number(s[k]));
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(0, ...ys), y1 = Math.max(...ys) || 1;
    const X = (x: number) => 10 + ((x - x0) / (x1 - x0 || 1)) * 580, Y = (y: number) => 110 - ((y - y0) / (y1 - y0 || 1)) * 100;
    const line = pts.map((s, i) => `${i ? "L" : "M"}${X(s.t).toFixed(1)},${Y(Number(s[k])).toFixed(1)}`).join(" ");
    const marks = pts.filter((s) => s.tag !== "periodic").map((s) => `<circle cx="${X(s.t).toFixed(1)}" cy="${Y(Number(s[k])).toFixed(1)}" r="2.5" class="m ${s.tag}"><title>${s.tag} ${s.level ?? s.phase ?? ""}: ${s[k]}</title></circle>`).join("");
    return `<figure><figcaption>${k} <span>${Math.round(Math.min(...ys) * 10) / 10} – ${Math.round(y1 * 10) / 10}</span></figcaption><svg viewBox="0 0 600 120"><path d="${line}"/>${marks}</svg></figure>`;
  };
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<!doctype html><meta charset="utf-8"><title>Soak report</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>:root{--bg:#fffaf0;--ink:#2b1d14;--line:#c9602e;--mute:#8a7866}@media (prefers-color-scheme:dark){:root{--bg:#1d1712;--ink:#f3e6d3;--line:#ff9a5c;--mute:#a8957f}}
body{background:var(--bg);color:var(--ink);font:14px/1.45 system-ui,sans-serif;margin:0;padding:16px;max-width:1100px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}figure{margin:0}figcaption{font-weight:600}figcaption span{color:var(--mute);font-weight:400;margin-left:6px}
svg{width:100%;height:auto;overflow:visible}path{fill:none;stroke:var(--line);stroke-width:1.5}.m{fill:var(--ink)}.m.boundary{fill:#2f8f5a}.m.stress{fill:#d1453b}
pre{white-space:pre-wrap;overflow-x:auto;font-size:12px}</style>
<h1>Soak report</h1><p>Dots: green = after a level (GC'd, on the map), red = strike stress, dark = other phases.</p><div class="grid">${keys.map(chart).join("")}</div><pre>${esc(md)}</pre>`;
}

/** --analyse <dir>: re-run the analysis (the invariant, summary.md, report.html) on a finished soak's samples.json, e.g.
 *  after the budgets change. Pass the same --mobile/--cpu/--patched flags the soak ran with. */
function reanalyse(dir: string) {
  const got = JSON.parse(readFileSync(`${dir}/samples.json`, "utf8")) as Sample[];
  samples.push(...got);
  const { levels, errors, reloads } = JSON.parse(readFileSync(`${dir}/levels.json`, "utf8"));
  const bounds = samples.filter((s) => s.tag === "baseline" || s.tag === "boundary");
  const maxStreak = Math.max(0, ...levels.map((l: any) => l.maxStreak ?? 0));
  const report = analyse(bounds, levels, errors, reloads, maxStreak);
  writeFileSync(`${dir}/summary.md`, report.md);
  writeFileSync(`${dir}/report.html`, html(report.md));
  if (arg("findings")) writeFileSync(arg("findings")!, JSON.stringify(toFindings(report.fails), null, 1));
  console.log(report.md.split("\n## ")[0]);
  if (CHECK && !report.pass) process.exit(1);
}

if (arg("analyse")) reanalyse(arg("analyse")!);
else
  main().catch((e) => {
    console.error(e);
    process.exit(2);
  });
