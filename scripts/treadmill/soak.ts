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
// Before the levels it opens the title untouched for 5 s (what the title decodes). After each level, on the map, it
// forces a GC and takes a "boundary" sample once Sensei has been quiet for 2.5 s (retaken once if a line starts during
// it): the soak invariant compares those with the first one (docs/PERF.md), which is taken after one bot action, and
// the heap with the one after the first level (--heap-warm). Event listeners are the game's: CDP's JSEventListeners
// less Playwright's own (its InjectedScript's window listeners in each world it uses; playwrightListeners). Then:
// --idle s on the still map; --idle-next s on a reward left alone with Next ready (NextArrow's idle nudge: the glow at
// 8 s, the pointing hand and the ninja's leap at 16 s, the line again at 40 s, in game time); the ninja demo standing
// still at streak 0 and 10 (the aura's standing cost); and --stress N: N streak-10 strikes fired at 7 a second (the
// "particles pile up on a streak" hypothesis), then 10 s to settle.
// The bot is bot.ts's step(): it taps Next through held steps and presentations (docs/NAVIGATION.md), as a child does.
//
// The game is served from a frozen snapshot of the working tree (frozen.ts --probes, soak.vite.config.ts: no HMR, no
// watcher), so edits made elsewhere mid-soak can't reload the page: --serve prod (default: a production build + vite
// preview, what phones run), --serve dev (vite dev server), or --serve none --base URL (an existing server, e.g.
// `frozen.ts --port N --probes --detach`; module probes only if it was built with the soak config).
//
// Usage: bun scripts/treadmill/soak.ts [--levels 16] [--from w1-2] [--fast 2] [--mobile] [--cpu 4] [--every 10]
//          [--minutes 60] [--idle 60] [--idle-next 40] [--stress 150] [--wrong 0.05] [--serve prod|dev|none] [--base URL] [--port N]
//          [--out playtest/soak/<run>] [--headed] [--check] [--findings file] [--heap] [--no-memdump]
//          [--no-title] [--no-aura] [--heap-warm 1]
//   --mobile: phone emulation (844×390 landscape, DPR 3, touch, mobile UA); --cpu 4: CDP CPU throttling (4× slower).
//   --check: judge the run against the budgets (docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and PERF.md §5; BOUNDARY and
//   judge() below), print the table, and exit 1 if any budget fails. The phone rows (fps, main thread %) are judged only
//   with --cpu > 1; on desktop they are shown, not judged. Without --check the table is printed and the exit is 0.
//   --heap: V8/Blink heap snapshots at the start and after the levels, diffed by constructor into heap-diff.md (what
//   the growth is made of). (--patched and soak-fixes.ts, the preview of the PERF.md fixes, were retired at integration:
//   FIX_PLAN Dec10. A plain soak now measures the fixes themselves.)
//   --heap-warm N: the heap row's start is the boundary after the first N levels (default 1: a first visit to each
//   screen compiles code and fills Blink's caches, which isn't a leak); 0 judges it from the cold map, as before 27 Sep.
//   --analyse <dir>: re-judge a finished soak (e.g. after a budget changes); the run's own flags are read from its
//   levels.json (older runs: pass the same --mobile/--cpu flags).
//   --findings <file>: also write the failed budgets as treadmill findings (types.ts), e.g. <runDir>/soak.json.
// Output: <out>/samples.json, samples.csv, levels.json, checks.json, summary.md (the budget table and the metrics),
// report.html (charts). Exit 0 pass, 1 a budget failed (--check), 2 the soak itself crashed.
import { chromium, type Page, type CDPSession } from "playwright";
import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { LEVELS } from "../../src/content/worlds";
import { save, step, unlockAudio } from "./bot";
import { frozen } from "./frozen";
import type { Finding } from "./types";
import { helpGuard } from "../lib/help";
helpGuard(import.meta.url); // --help prints the usage above and exits, before anything runs

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const flag = (k: string) => process.argv.includes(`--${k}`);
const N_LEVELS = Number(arg("levels", "16"));
const FROM = arg("from", "w1-2")!;
const FAST = Number(arg("fast", "2"));
// (let: --analyse reads them back from the finished run's levels.json)
let MOBILE = flag("mobile");
let CPU = Number(arg("cpu", "1"));
const EVERY = Number(arg("every", "10")) * 1000;
const MINUTES = Number(arg("minutes", "60"));
const IDLE_S = Number(arg("idle", "60"));
const IDLE_NEXT = Number(arg("idle-next", "40")); // s on a reward left alone with Next ready (the idle nudge); 0 skips it
const STRESS = Number(arg("stress", "150"));
const WRONG = Number(arg("wrong", "0.05"));
const SERVE = arg("serve", "prod")!;
const PORT = Number(arg("port", String(5186 + (MOBILE ? 1 : 0) + (CPU > 1 ? 2 : 0))));
const MEMDUMP = !flag("no-memdump");
const HEAP = flag("heap"); // heap snapshots at the start and after the levels, diffed by constructor (heap-diff.md)
/** The heap row's start: the boundary after this many levels (the warm-up), not the cold map. A first visit to each kind
 *  of screen grows the heap by compiled code and Blink's caches, which is not a leak: from a cold map the desktop soak went
 *  5.4 → 13.6 MB, 0.2 MB over start + 8, while four laps of the same four levels grew 0.3 MB a lap (verify round 1). 0
 *  judges from the cold map, as before. */
let HEAP_WARM = Number(arg("heap-warm", "1"));
const OUT = arg("analyse") ?? arg("out", `playtest/soak/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}${MOBILE ? "-mobile" : ""}${CPU > 1 ? `-cpu${CPU}` : ""}`)!;
const CHECK = flag("check");
// (a run from before integration may have been a --patched preview: its levels.json says so, and the summary names it)
let PATCHED = false;
if (flag("patched")) {
  console.error("soak.ts: --patched was retired at integration (FIX_PLAN Dec10): the fixes are in the game now, so run a plain soak.");
  process.exit(2);
}
const TITLE = !flag("no-title");
const AURA = !flag("no-aura");
const LEVEL_MAX_MS = 7 * 60_000; // real time per level before the soak gives up on it and moves on
const STUCK_MS = 45_000;
const ROOT = resolve(import.meta.dirname, "../..");
mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- the snapshot server
async function startServer(): Promise<{ base: string; stop: () => void; built?: string }> {
  if (SERVE === "none") return { base: arg("base", "http://localhost:5173")!, stop: () => {} };
  const env: Record<string, string> = {};
  if (SERVE === "prod") {
    const f = await frozen({ port: PORT, out: `${tmpdir()}/superninja-soak-${PORT}`, probes: true, env, retry: 2, log: (s) => console.log(s) });
    return { base: f.base, stop: f.stop, built: f.built ?? undefined };
  }
  const cfg = "scripts/treadmill/soak.vite.config.ts";
  const built = new Date().toISOString();
  const proc: ChildProcess = spawn("node_modules/.bin/vite", ["--config", cfg, "--port", String(PORT), "--strictPort"], { stdio: "ignore", env: { ...process.env, ...env } });
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
    speechTotal: 0,
    long: { n: 0, ms: 0, max: 0 }, loaf: { n: 0, ms: 0, blocking: 0 },
    canvas: { cur: 0, last: 0, max: 0 },
    audio: { decoded: 0, decodedBytes: 0, liveBytes: 0, live: 0, pending: 0, sources: 0, osc: 0, gains: 0, filters: 0, mediaSources: 0, analysers: 0, buffers: 0 },
    media: [] as WeakRef<HTMLMediaElement>[], mediaCreated: 0,
    intervals: new Map<number, { ms: number; at: string }>(), pending: new Set<number>(),
  });
  // every speech clip the game starts (audio.ts and ui.tsx log each one when window.__audioLog exists): a log that only
  // counts, so nothing grows, for the boundary samples' "was anything said in the window?"
  w.__audioLog = { push: (...items: any[]) => { for (const it of items) if (it && it.kind === "speech") P.speechTotal++; return 0; } };
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
    // (pending: decodes still running, so a phase can wait for a slow one instead of measuring before it lands)
    AC.decodeAudioData = function (this: AudioContext, ...a: any[]) {
      P.audio.pending++;
      return dec.apply(this, a).then(
        (b: AudioBuffer) => {
          P.audio.pending--;
          const bytes = b.length * b.numberOfChannels * 4;
          P.audio.decoded++;
          P.audio.decodedBytes += bytes;
          P.audio.liveBytes += bytes;
          P.audio.live++;
          gone.register(b, bytes);
          return b;
        },
        (e: unknown) => {
          P.audio.pending--;
          throw e;
        },
      );
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
    // (not Playwright's: its InjectedScript in the main world adds 13 window listeners through this same prototype, its
    // hit-target interceptors and __playwright_global_listeners_check__; verify round 1)
    if (k && !/__playwright|InjectedScript|HitTargetInterceptor/.test(`${type} ${new Error().stack ?? ""}`)) (L.get(k) ?? L.set(k, new Set()).get(k)!).add(fn);
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
    /** Hidden: not rendered (display none, visibility hidden), or opacity 0 on it or an ancestor, except an opacity that
     *  is an animation's own (a fade in progress, an animation's delay, a twinkle at its dark end): those are on their way
     *  to being seen (27 Sep, screens-b: fade-in frames at exactly 0 counted as hidden). */
    const isHidden = (el: Element) => {
      if ((el as any).checkVisibility?.({ checkOpacity: false, checkVisibilityCSS: true, visibilityProperty: true }) === false) return true;
      for (let e: Element | null = el; e; e = e.parentElement)
        if (Number(getComputedStyle(e).opacity) < 0.01 && !e.getAnimations().some((x) => x.playState === "running" && ((x.effect as KeyframeEffect | null)?.getKeyframes() ?? []).some((k) => "opacity" in k))) return true;
      return false;
    };
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
        if (el && isHidden(el)) (hiddenInf++, (hiddenNames[name] = (hiddenNames[name] ?? 0) + 1));
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
    // the store's adjustLog without the module probe (a build without the soak config): the longest in any saved profile
    out.adjustLogSaved = null;
    if (!mods["engine/store.ts"])
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i) ?? "";
          if (!k.startsWith("superninja.save")) continue;
          const n = JSON.parse(localStorage.getItem(k) ?? "{}")?.adjustLog?.length;
          if (typeof n === "number") out.adjustLogSaved = Math.max(out.adjustLogSaved ?? 0, n);
        }
      } catch {}
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
    const p = procs.get(e.pid) ?? { pid: e.pid, name: names.get(e.pid) ?? "?", footprint: 0, top: {} as Record<string, number>, detail: {} as Record<string, number> };
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

// ---------------------------------------------------------------- Playwright's own listeners (the listener budget is the game's)
/** The page's execution contexts (the main world and Playwright's utility worlds), from Runtime events on our session. */
const worlds = new Map<number, { main: boolean; name: string }>();
async function trackWorlds(cdp: CDPSession) {
  cdp.on("Runtime.executionContextCreated", (e: any) => worlds.set(e.context.id, { main: !!e.context.auxData?.isDefault, name: String(e.context.name ?? "") }));
  cdp.on("Runtime.executionContextDestroyed", (e: any) => worlds.delete(e.executionContextId));
  cdp.on("Runtime.executionContextsCleared", () => worlds.clear());
  await cdp.send("Runtime.enable");
}
/** Playwright's listeners on the page's window: every InjectedScript it puts in a world adds 13 there (12 hit-target
 *  interceptors and __playwright_global_listeners_check__), in the main world and in each utility world, and CDP's
 *  JSEventListeners counts them all. It injects them at its first locator action, after the soak's first sample, so the
 *  listener row once rose by 26 to 80 with nothing wrong in the game (verify round 1). In a utility world every window
 *  listener is Playwright's (the page runs nothing there); in the main world, those whose handler is its code.
 *  DOMDebugger.getEventListeners reports a world's own listeners only. */
async function playwrightListeners(cdp: CDPSession): Promise<number> {
  let n = 0;
  for (const [id, w] of [...worlds]) {
    const win = (await cdp.send("Runtime.evaluate", { expression: "window", contextId: id, objectGroup: "sn-pwl" }).catch(() => null)) as any;
    const oid = win?.result?.objectId;
    if (!oid) continue;
    const ls = (await cdp.send("DOMDebugger.getEventListeners" as any, { objectId: oid, depth: 0 }).catch(() => null)) as any;
    for (const l of ls?.listeners ?? []) if (!w.main || /__playwright/.test(l.type) || /_hitTargetInterceptor|seenEvent\s*=\s*true/.test(String(l.handler?.description ?? ""))) n++;
  }
  await cdp.send("Runtime.releaseObjectGroup", { objectGroup: "sn-pwl" }).catch(() => {});
  return n;
}

async function sample(page: Page, cdp: CDPSession, bcdp: CDPSession | null, tag: string, extra: Record<string, unknown> = {}): Promise<Sample | null> {
  let mem: Awaited<ReturnType<typeof memDump>> = null;
  if (tag === "boundary" || tag === "baseline" || tag === "settled" || tag === "title") {
    // a boundary is measured after a full GC, so garbage isn't mistaken for a leak; the rates (fps, CPU) are then
    // taken over a fresh 2 s window, so the GC itself isn't counted in them
    await cdp.send("HeapProfiler.collectGarbage").catch(() => {});
    await cdp.send("HeapProfiler.collectGarbage").catch(() => {});
    mem = await memDump(bcdp);
    // (on the map: a touch on nothing first, which starts the map's idle ladder again, so its hop at 8 s and its hint at
    // 16 s of game time don't land in the 2 s window: at --fast 2 they came 4 and 8 real seconds after the arrival, in the
    // middle of the sample, with Sensei's talking face and rAF; verify round 1)
    if (tag === "boundary" || tag === "baseline") await unlockAudio(page);
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
  const pwListeners = await playwrightListeners(cdp);
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
    // the game's own: CDP's count less Playwright's (playwrightListeners)
    listeners: m.JSEventListeners - pwListeners,
    listenersRaw: m.JSEventListeners,
    listenersPlaywright: pwListeners,
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
    decodesPending: inPage.audio.pending,
    audioSourcesCreated: inPage.audio.sources,
    audioBuffersCreated: inPage.audio.buffers,
    mediaSourceNodes: inPage.audio.mediaSources,
    globalListeners: inPage.globalListeners.total,
    navLog: inPage.navLog,
    adjustLog: inPage.mods.adjustLog ?? inPage.adjustLogSaved,
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

/** Is Sensei speaking (the audio module's probe; false on a build without the probes)? */
const speakingNow = (page: Page) =>
  ev(page, () => {
    const m = (window as any).__snPerfMods?.["engine/audio.ts"];
    return m ? (m().speaking ?? 0) > 0 : false;
  });
/** Wait until Sensei has been quiet for 2.5 s in a row (a map line can follow a moment's quiet: the arrival line, then
 *  the next stone's), at most 25 s. */
async function quiet(page: Page) {
  let since = Date.now();
  for (const t = Date.now(); Date.now() - t < 25_000; await page.waitForTimeout(250)) {
    if (await speakingNow(page)) since = Date.now();
    else if (Date.now() - since >= 2500) return;
  }
}

/** A sample of the still map (the baseline, a boundary): once Sensei has been quiet for 2.5 s, with the map's idle ladder
 *  started again by a touch on nothing (and again inside sample(), just before its window). If anything was said from
 *  then to the end of the sample (a clip started, or a say() still running), the lipsync's rAF loop and the speech's
 *  own listeners are in it: it is taken again, up to twice. (Verify round 1: a hint said during the memory dump ended
 *  inside the window, so "speaking" read 0 at its end while the lipsync asked for 60 frames a second.) */
async function stillSample(page: Page, cdp: CDPSession, bcdp: CDPSession | null, tag: "baseline" | "boundary", extra: Record<string, unknown>) {
  const said = () => ev(page, () => Number((window as any).__snPerf?.speechTotal ?? 0));
  let s: Sample | null = null;
  for (let k = 0; k < 3; k++) {
    await quiet(page);
    await unlockAudio(page);
    const n0 = await said();
    s = await sample(page, cdp, bcdp, tag, { ...extra, ...(k ? { retaken: k } : {}) });
    const spoke = Number((await said()) ?? 0) - Number(n0 ?? 0);
    if (!s) return s;
    s.speechDuring = spoke;
    if (!spoke && !(Number(s.mods?.speaking ?? 0) > 0)) break;
    if (k < 2) samples.pop();
  }
  return s;
}

let stopServer = () => {}; // (so a crash or Ctrl-C doesn't leave the snapshot server running)
async function main() {
  const server = await startServer();
  stopServer = server.stop;
  process.on("SIGINT", () => (stopServer(), process.exit(130)));
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
  await trackWorlds(cdp);
  if (CPU > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });
  const bcdp = await browser.newBrowserCDPSession().catch(() => null);
  await page.addInitScript(instrument);

  // one save for the whole session: a child who has done the intro and training, with everything unlocked
  await page.goto(`${BASE}/play/`);
  await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...save(), settings: { relaxed: false, music: 0.32, captions: false, unlockAll: true } });
  // ---- the title, untouched for 5 s: what does it decode before anyone taps? (music streams through <audio>, so the
  // title should decode no more than its own lines; PERF 5 / B1.1). A decode still running at 5 s is waited for.
  if (TITLE) {
    await page.goto(`${BASE}/play/?scene=title&fast=${FAST}`);
    if (CPU > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });
    await page.waitForTimeout(5000);
    for (let i = 0; i < 40 && Number(await ev(page, () => (window as any).__snPerf?.audio?.pending ?? 0)) > 0; i++) await page.waitForTimeout(500);
    await sample(page, cdp, bcdp, "title", { level: null, levelIndex: 0, phase: "the title, 5 s, untouched" });
  }
  await page.goto(`${BASE}/play/?scene=map&fast=${FAST}`);
  await unlockAudio(page); // the first gesture unlocks audio (bot.ts: on <html>, where no screen takes it)
  reloads = 0;
  if (CPU > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });
  // one bot action before the baseline, so Playwright's scripts are in both worlds when it is taken (a locator in the
  // utility world, an evaluate on an element in the main one), as they are at every later sample (verify round 1)
  await page.locator('[data-nav="next"], .scene.map').first().count().catch(() => 0);
  await page.locator("body").first().evaluate(() => 0, undefined, { timeout: 800 }).catch(() => 0);
  await page.waitForTimeout(4000);
  await stillSample(page, cdp, bcdp, "baseline", { level: null, levelIndex: 0 });
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
              await wrong.dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
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
    // then wait for Sensei to finish the map's lines: a boundary taken mid-line counted the speech's own listeners, rAF
    // and animations (about +50 listeners on no element: B1 and D6's finding; the talking face's @wave ×3 and @pulse at
    // 34 of 34 animations, when a map line started after a wait that ended at the first quiet moment: verify round 1)
    console.log(`— ${lv.id} (${lv.kind}) ${left && !stuck ? "done" : "NOT finished"} in ${secs}s, streak max ${levelMax}`);
    await stillSample(page, cdp, bcdp, "boundary", { level: lv.id, levelIndex: li + 1, streak: endStreak, maxStreak: levelMax });
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

  // ---- a held Next, left alone: the last level's reward, untouched once Next is ready. The idle nudge (the glow, the
  // hand, the ninja's leap and Sensei's line) must cost no more than a still screen: no rAF loop between its moments
  if (IDLE_NEXT > 0) {
    const lastId = levels[levels.length - 1]?.id ?? FROM;
    await page.evaluate(() => (window as any).__streak?.set(0)).catch(() => {});
    await page.evaluate((id) => (window as any).__sn?.go({ name: "reward", id, stars: 3 }), lastId).catch(() => {});
    for (let i = 0; i < 60 && (await ev(page, () => (window as any).__snNav?.next ?? null)) !== "ready"; i++) await page.waitForTimeout(500);
    await sample(page, cdp, bcdp, "settled", { level: null, levelIndex: levels.length, phase: `the reward (${lastId}), Next ready` });
    for (let s = 0; s < IDLE_NEXT; s += EVERY / 1000) {
      await page.waitForTimeout(EVERY);
      await sample(page, cdp, bcdp, "idle-next", { level: null, levelIndex: levels.length, phase: `the reward (${lastId}), a held Next, untouched` });
    }
    await page.evaluate(() => (window as any).__sn?.go({ name: "map" })).catch(() => {});
    await page.waitForTimeout(3000);
  }

  // ---- the ninja standing still (the ninja demo scene): the aura's standing cost at streak 0 and at streak 10
  if (AURA || STRESS > 0) {
    await page.evaluate(() => (window as any).__sn?.go({ name: "ninja-demo" })).catch(() => {});
    await page.waitForTimeout(2500);
    await page.evaluate(() => (window as any).__streak?.set(0)).catch(() => {});
  }
  if (AURA) {
    await page.waitForTimeout(EVERY);
    await sample(page, cdp, bcdp, "aura-t0", { phase: "ninja demo, streak 0, idle" });
    await page.waitForTimeout(EVERY);
    await sample(page, cdp, bcdp, "aura-t0", { phase: "ninja demo, streak 0, idle" });
    await page.evaluate(() => (window as any).__streak?.set(10)).catch(() => {});
    await page.waitForTimeout(EVERY);
    await sample(page, cdp, bcdp, "aura-t3", { phase: "ninja demo, streak 10, idle" });
    await page.waitForTimeout(EVERY);
    await sample(page, cdp, bcdp, "aura-t3", { phase: "ninja demo, streak 10, idle" });
  }
  // ---- the streak hypothesis: a tier-3 ninja striking fast, over and over
  if (STRESS > 0) {
    await page.evaluate(() => (window as any).__streak?.set(10)).catch(() => {});
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
      if (fired % 5 === 0) {
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
  }
  if (AURA || STRESS > 0) {
    // back to the map: the ninja unmounts, everything it owned should go
    await page.evaluate(() => (window as any).__streak?.set(0)).catch(() => {});
    await page.evaluate(() => (window as any).__sn?.go({ name: "map" })).catch(() => {});
    await page.waitForTimeout(6000);
    await sample(page, cdp, bcdp, "settled", { phase: "map after the stress" });
  }

  await browser.close();
  server.stop();
  // ---------------------------------------------------------------- report
  const meta: Meta = { mobile: MOBILE, cpu: CPU, fast: FAST, from: FROM, levels: N_LEVELS, patched: PATCHED, serve: SERVE, base: BASE, built: server.built ?? null, idle: IDLE_S, idleNext: IDLE_NEXT, stress: STRESS, heapWarm: HEAP_WARM };
  writeFileSync(`${OUT}/samples.json`, JSON.stringify(samples, null, 1));
  writeFileSync(`${OUT}/levels.json`, JSON.stringify({ levels, errors, reloads, meta }, null, 1));
  const cols = [...new Set(samples.flatMap((s) => Object.keys(s)))].filter((k) => !["mods", "detail", "peak", "mem"].includes(k));
  writeFileSync(`${OUT}/samples.csv`, [cols.join(","), ...samples.map((s) => cols.map((c) => JSON.stringify(s[c] ?? "")).join(","))].join("\n"));
  finish(OUT, meta, levels, errors, reloads, maxStreak);
}

// ---------------------------------------------------------------- analysis: the budgets (docs/PERF.md §5, FIX_PLAN §11.1)
/** How the run was made (levels.json), so --analyse judges it the same way. */
interface Meta { mobile: boolean; cpu: number; fast: number; from: string; levels: number; patched?: boolean; serve: string; base: string; built: string | null; idle: number; idleNext?: number; stress: number; heapWarm?: number }

/** One budget judged on one run. ok: null when this run doesn't judge it (the phone rows on desktop, no World Flower
 *  visit, an older run without that sample); `measured` is still filled in when there is something to show. */
interface Check { id: string; when: string; what: string; budget: string; measured: string; ok: boolean | null; owner: string; detail?: string }

/** After each level, back on the map after a forced GC (and the first sample, on the map before any level), every metric
 *  here must be ≤ start × slack + abs: a level leaves nothing behind, and a still screen asks for no frames.
 *  (No budget on footprintMB/rendererRssMB: under Playwright they include DevTools' own copies of every response body,
 *  since Playwright always enables the Network domain, and Chrome's decoded-image cache; see docs/PERF.md §2.2.) */
const BOUNDARY: { k: string; what: string; slack: number; abs: number; owner: string }[] = [
  { k: "nodes", what: "DOM nodes (CDP, attached + detached)", slack: 1, abs: 600, owner: "all" },
  { k: "heapMB", what: "JS heap, MB", slack: 1, abs: 8, owner: "all" },
  { k: "listeners", what: "event listeners", slack: 1, abs: 40, owner: "all" },
  { k: "animations", what: "animations on the map", slack: 1, abs: 5, owner: "all" },
  { k: "intervals", what: "live intervals", slack: 1, abs: 1, owner: "all" },
  { k: "particles", what: "particles on the canvas", slack: 0, abs: 5, owner: "F1" },
  { k: "fxDomNodes", what: "nodes in the fx layer", slack: 0, abs: 0, owner: "F1" },
  { k: "rafPerSec", what: "rAF requests/s on the still map", slack: 0, abs: 5, owner: "F1" },
  { k: "decodedMB", what: "live decoded audio, MB", slack: 0, abs: 64, owner: "F1, B1" },
  { k: "audioHandlers", what: "Web Audio nodes (AudioHandlers)", slack: 1, abs: 8, owner: "F1" },
  { k: "mediaAlive", what: "<audio> elements alive", slack: 1, abs: 2, owner: "F1" },
  { k: "navLog", what: "window.__snNavLog entries", slack: 0, abs: 500, owner: "F3" },
  { k: "adjustLog", what: "the save's adjustLog entries", slack: 0, abs: 200, owner: "F1" },
];
const ANIM_MAX = 2; // endless non-compositable animations, and endless ones on hidden elements, in any sample
const IDLE_RAF_MAX = 5; // rAF requests/s (median) on the still map through --idle, and on a held Next through --idle-next
const TITLE_MB = 2; // live decoded audio on the untouched title after 5 s
const FPS_MIN = 50; // phone ×4: every screen's median fps while playing
const IDLE_MAIN_MAX = 5; // phone ×4: % main thread on the still map (median over --idle)
const AURA_MAX: Record<string, number> = { "aura-t0": 6, "aura-t3": 14 }; // phone ×4: % main thread, the ninja standing still
const IDLE_NEXT_MAIN_MAX = 6; // phone ×4: % main thread (median) on a held Next: a still screen with the ninja at streak 0
const FLOWER = { main: 30, longTask: 120 }; // phone ×4: the World Flower's median main thread %, its longest task (ms)
const STRESS_PEAK = 350; // particles at the peak of 150 streak-10 strikes (MAX_PARTICLES)

const r1 = (v: number) => Math.round(v * 10) / 10;
const nums = (a: unknown[]) => a.map(Number).filter((v) => Number.isFinite(v));
function median(a: number[]) {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y), m = Math.floor(s.length / 2);
  return r1(s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2);
}
const mean = (a: number[]) => (a.length ? r1(a.reduce((x, y) => x + y, 0) / a.length) : null);

let keyframesAt: Map<string, Set<string>> | null = null;
/** Where an animation is defined: the files under src/ (the current tree) with `@keyframes <name>`, i.e. its owner. */
function definedIn(name: string): string {
  if (!keyframesAt) {
    const at = (keyframesAt = new Map<string, Set<string>>());
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = `${dir}/${e.name}`;
        if (e.isDirectory()) walk(p);
        else if (/\.(css|tsx?)$/.test(e.name)) for (const m of readFileSync(p, "utf8").matchAll(/@keyframes\s+([\w-]+)/g)) (at.get(m[1]) ?? at.set(m[1], new Set()).get(m[1])!).add(p.slice(ROOT.length + 1));
      }
    };
    try {
      walk(`${ROOT}/src`);
    } catch {}
  }
  return [...(keyframesAt.get(name.replace(/^@/, "")) ?? [])].join(", ");
}
/** The offending animations across samples: each name at the most instances seen at once, with where it's defined. */
function offenders(list: Sample[], key: "mainThread" | "hidden"): string {
  const most: Record<string, number> = {};
  for (const s of list) for (const [n, c] of Object.entries<number>(s.detail?.anims?.[key] ?? {})) most[n] = Math.max(most[n] ?? 0, Number(c));
  const names = Object.entries(most)
    .sort((a, b) => b[1] - a[1])
    .map(([n, c]) => {
      const at = n.startsWith("@") ? definedIn(n) || "not in src/ now" : "";
      return `${n.replace(/^@/, "")} ×${c}${at ? ` (${at})` : ""}`;
    });
  const screens = [...new Set(list.map((s) => String(s.route ?? "?")))];
  return `${names.join(", ")}. On ${screens.slice(0, 8).join(", ")}${screens.length > 8 ? ` and ${screens.length - 8} more` : ""}`;
}

/** Judge a finished run (the module-level `samples`) against every budget. */
function judge(meta: Meta, levels: any[], reloads: number): Check[] {
  const C: Check[] = [];
  const phone = meta.cpu > 1;
  const onPhone = (ok: boolean | null) => (phone ? ok : null);
  const bounds = samples.filter((s) => s.tag === "baseline" || s.tag === "boundary");
  const base = bounds[0];
  const where = (s: Sample) => s.level ?? "start";

  for (const b of BOUNDARY) {
    let pts = bounds.filter((s) => s[b.k] != null && Number.isFinite(Number(s[b.k])));
    const budget = b.slack ? `≤ start + ${b.abs}` : `≤ ${b.abs}`;
    if (!pts.length || !base) {
      C.push({ id: b.k, when: "after each level, back on the map (GC'd)", what: b.what, budget, measured: "not measured (a build without the soak probes, or an older run)", ok: null, owner: b.owner });
      continue;
    }
    // the heap: from the boundary after the warm-up level(s) (--heap-warm), the cold map shown beside it
    const warm = b.k === "heapMB" ? Math.min(meta.heapWarm ?? HEAP_WARM, pts.length - 1) : 0;
    const cold = warm > 0 ? `cold map ${r1(Number(pts[0][b.k]))}, ` : "";
    if (warm > 0) pts = pts.slice(warm);
    const b0 = Number(pts[0][b.k]);
    const limit = r1(b0 * b.slack + b.abs);
    const worst = pts.reduce((w, s) => (Number(s[b.k]) > Number(w[b.k]) ? s : w));
    const over = pts.filter((s) => Number(s[b.k]) > limit);
    C.push({
      id: b.k,
      when: "after each level, back on the map (GC'd)",
      what: b.what,
      budget: b.slack ? `${budget} (${limit})` : budget,
      measured: `${cold}start ${r1(b0)}${warm > 0 ? ` (after ${where(pts[0])}, the warm-up)` : ""}, worst ${r1(Number(worst[b.k]))} (after ${where(worst)})${over.length ? `; over after ${over.length} of ${pts.length} boundaries, from ${where(over[0])}` : ""}`,
      ok: !over.length,
      owner: b.owner,
    });
  }

  const title = samples.find((s) => s.tag === "title");
  C.push({
    id: "titleDecodedMB",
    when: "on the title, untouched for 5 s",
    what: "live decoded audio, MB",
    budget: `≤ ${TITLE_MB}`,
    measured: title ? `${title.decodedMB} MB in ${title.decodedClips} clip${title.decodedClips === 1 ? "" : "s"}${title.decodesPending ? ` (${title.decodesPending} still decoding)` : ""}` : "not measured (--no-title, or an older run)",
    ok: title ? Number(title.decodedMB) <= TITLE_MB : null,
    owner: "B1",
  });

  const play = samples.filter((s) => ["periodic", "idle-map", "idle-next", "title"].includes(s.tag));
  for (const [k, key, what, owner] of [
    ["animMainThreadInfinite", "mainThread", "endless animations the compositor can't run", "F1, B, C, D (by file)"],
    ["animHiddenInfinite", "hidden", "endless animations running on hidden elements", "F1, D2 (by file)"],
  ] as const) {
    const over = play.filter((s) => Number(s[k] ?? 0) > ANIM_MAX);
    const max = Math.max(0, ...nums(play.map((s) => s[k])));
    C.push({ id: k, when: "while playing, and on still screens (title, map, a held Next), every sample", what, budget: `≤ ${ANIM_MAX}`, measured: play.length ? `max ${max}; over in ${over.length} of ${play.length} samples` : "not measured", ok: play.length ? !over.length : null, owner, detail: over.length ? offenders(over, key) : undefined });
  }

  const idle = samples.filter((s) => s.tag === "idle-map");
  for (const [id, tag, when, off, owner] of [
    ["idleRaf", "idle-map", `the still map, ${meta.idle} s untouched`, "--idle 0", "F1, B1"],
    ["idleNextRaf", "idle-next", `a held Next (a reward), ${meta.idleNext ?? 0} s untouched, the idle nudge included`, "--idle-next 0, or an older run", "F1, F3 (nav.tsx), B1"],
  ] as const) {
    const pts = samples.filter((s) => s.tag === tag);
    const raf = nums(pts.map((s) => s.rafPerSec)), main = nums(pts.map((s) => s.mainThreadPct));
    C.push({
      id,
      when,
      what: "rAF requests/s, median",
      budget: `≤ ${IDLE_RAF_MAX}`,
      measured: raf.length ? `${median(raf)} (max ${Math.max(...raf)}); main thread ${median(main)} %${meta.cpu > 1 ? "" : " (desktop)"}` : `not measured (${off})`,
      ok: raf.length ? median(raf)! <= IDLE_RAF_MAX : null,
      owner,
    });
  }

  // ---- the phone profile (--cpu > 1): measured on desktop too, judged only when throttled
  const nj = phone ? "" : " (not judged: desktop)";
  const byRoute = new Map<string, number[]>();
  for (const s of samples.filter((x) => x.tag === "periodic" && x.fps != null)) (byRoute.get(String(s.route)) ?? byRoute.set(String(s.route), []).get(String(s.route))!).push(Number(s.fps));
  const screens = [...byRoute].map(([r, v]) => [r, median(v)!] as const).sort((a, b) => a[1] - b[1]);
  const slow = screens.filter(([, m]) => m < FPS_MIN);
  C.push({
    id: "fps",
    when: "phone ×4, while playing",
    what: "every screen's median fps",
    budget: `≥ ${FPS_MIN}`,
    measured: screens.length ? (slow.length ? `under on ${slow.map(([r, m]) => `${r} (${m})`).join(", ")}` : `lowest ${screens[0][0]} (${screens[0][1]})`) + nj : "not measured",
    ok: screens.length ? onPhone(!slow.length) : null,
    owner: "D5 (the runner); otherwise the screen's owner",
  });
  const idleMain = nums(idle.map((s) => s.mainThreadPct));
  C.push({ id: "idleMain", when: "phone ×4, the still map", what: "main thread %, median", budget: `≤ ${IDLE_MAIN_MAX} %`, measured: idleMain.length ? `${median(idleMain)} %${nj}` : "not measured (--idle 0)", ok: idleMain.length ? onPhone(median(idleMain)! <= IDLE_MAIN_MAX) : null, owner: "F1" });
  const nextMain = nums(samples.filter((s) => s.tag === "idle-next").map((s) => s.mainThreadPct));
  C.push({ id: "idleNextMain", when: "phone ×4, a held Next (a reward), the idle nudge included", what: "main thread %, median", budget: `≤ ${IDLE_NEXT_MAIN_MAX} %`, measured: nextMain.length ? `${median(nextMain)} % (${nextMain.join(", ")})${nj}` : "not measured (--idle-next 0, or an older run)", ok: nextMain.length ? onPhone(median(nextMain)! <= IDLE_NEXT_MAIN_MAX) : null, owner: "F1 (the ninja), F3 (the nudge), B1 (the reward)" });
  for (const [tag, max] of Object.entries(AURA_MAX)) {
    const v = nums(samples.filter((s) => s.tag === tag).map((s) => s.mainThreadPct));
    C.push({ id: tag === "aura-t0" ? "auraT0" : "auraT3", when: "phone ×4, the ninja standing still", what: `main thread % at streak ${tag === "aura-t0" ? 0 : 10}, mean`, budget: `≤ ${max} %`, measured: v.length ? `${mean(v)} % (${v.join(", ")})${nj}` : "not measured (--no-aura)", ok: v.length ? onPhone(mean(v)! <= max) : null, owner: "F1" });
  }
  const tree = samples.filter((s) => s.tag === "periodic" && (String(s.route ?? "").startsWith("tree") || s.snScene === "tree"));
  const treeMain = nums(tree.map((s) => s.mainThreadPct)), treeTask = nums(tree.map((s) => s.longTaskMax));
  const noTree = "not measured (no World Flower visit in this run)";
  C.push({ id: "flowerMain", when: "phone ×4, the World Flower", what: "main thread %, median", budget: `≤ ${FLOWER.main} %`, measured: treeMain.length ? `${median(treeMain)} % over ${treeMain.length} sample${treeMain.length === 1 ? "" : "s"} (${treeMain.join(", ")})${nj}` : noTree, ok: treeMain.length ? onPhone(median(treeMain)! <= FLOWER.main) : null, owner: "B2" });
  C.push({ id: "flowerTask", when: "phone ×4, the World Flower", what: "longest task, ms", budget: `≤ ${FLOWER.longTask} ms`, measured: treeTask.length ? `${Math.max(...treeTask)} ms${nj}` : noTree, ok: treeTask.length ? onPhone(Math.max(...treeTask) <= FLOWER.longTask) : null, owner: "B2" });

  // ---- the strike stress
  const stress = samples.filter((s) => s.tag === "stress");
  const peak = Math.max(0, ...nums(stress.flatMap((s) => [s.peak?.particles, s.mods?.particles ?? s.particles])));
  const fxPeak = Math.max(0, ...nums(stress.flatMap((s) => [s.peak?.fx, s.fxDomNodes])));
  C.push({ id: "stressPeak", when: `the strike stress (${meta.stress ? `${meta.stress} ` : ""}streak-10 strikes, 7 a second)`, what: "particles at the peak", budget: `≤ ${STRESS_PEAK}`, measured: stress.length ? `${peak} (fx nodes ${fxPeak})` : "not measured (--stress 0)", ok: stress.length ? peak <= STRESS_PEAK : null, owner: "F1" });
  const after = samples.find((s) => s.tag === "settled" && s.phase === "10 s after the stress");
  C.push({ id: "stressAfter", when: "10 s after the stress", what: "particles / fx nodes left", budget: "0 / 0", measured: after ? `${after.particles} / ${after.fxDomNodes}` : "not measured (--stress 0)", ok: after ? Number(after.particles) === 0 && Number(after.fxDomNodes) === 0 : null, owner: "F1" });

  // ---- the soak itself
  C.push({ id: "reloaded", when: "the whole soak", what: "page reloads", budget: "0", measured: String(reloads), ok: reloads === 0, owner: "all" });
  const unfinished = levels.filter((l) => !l.ok);
  C.push({ id: "levels", when: "the whole soak", what: "levels the bot finished", budget: "all", measured: `${levels.length - unfinished.length} of ${levels.length}${unfinished.length ? `; not: ${unfinished.map((l) => `${l.id}${l.stuck ? ` (${l.stuck.slice(0, 80)})` : ""}`).join(", ")}` : ""}`, ok: levels.length ? !unfinished.length : null, owner: "the scene's owner (or bot.ts)" });
  return C;
}

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/</g, "&lt;");
const verdict = (c: Check) => (c.ok === false ? "**FAIL**" : c.ok ? "pass" : "n/a");
function checkTable(checks: Check[]): string {
  return ["| result | when | check | budget | measured | owner |", "|---|---|---|---|---|---|", ...checks.map((c) => `| ${verdict(c)} | ${cell(c.when)} | ${cell(c.what)} | ${cell(c.budget)} | ${cell(c.measured)}${c.detail ? `<br>${cell(c.detail)}` : ""} | ${cell(c.owner)} |`)].join("\n");
}
/** The same table for the terminal: grouped by when it's measured, one line a budget, offenders indented below. */
function checkText(checks: Check[]): string {
  const w1 = Math.max(...checks.map((c) => c.what.length)), w2 = Math.max(...checks.map((c) => c.budget.length));
  const lines: string[] = [];
  let when = "";
  for (const c of checks) {
    if (c.when !== when) lines.push(`${(when = c.when)}`);
    lines.push(`  ${c.ok === false ? "FAIL" : c.ok ? "pass" : "n/a "}  ${c.what.padEnd(w1)}  ${c.budget.padEnd(w2)}  ${c.measured}  [${c.owner}]`);
    if (c.detail) lines.push(`        ↳ ${c.detail}`);
  }
  const judged = checks.filter((c) => c.ok != null).length, fails = checks.filter((c) => c.ok === false);
  lines.push("", fails.length ? `soak --check: ${fails.length} of ${judged} budgets FAIL: ${fails.map((c) => c.id).join(", ")}` : `soak --check: all ${judged} budgets pass (${checks.length - judged} n/a)`);
  return lines.join("\n");
}

function slope(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 2) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) (num += (xs[i] - mx) * (ys[i] - my)), (den += (xs[i] - mx) ** 2);
  return den ? num / den : 0;
}

function analyse(meta: Meta, checks: Check[], levels: any[], errors: string[], reloads: number, maxStreak: number) {
  const bounds = samples.filter((s) => s.tag === "baseline" || s.tag === "boundary");
  const base = bounds[0];
  const last = bounds[bounds.length - 1];
  const metrics = ["heapMB", "nodes", "detachedNodes", "attachedNodes", "listeners", "globalListeners", "animations", "animInfinite", "animHiddenInfinite", "animMainThreadInfinite", "fxDomNodes", "particles", "rafPerSec", "intervals", "pendingTimeouts", "mediaAlive", "decodedMB", "decodedTotalMB", "decodedClips", "audioHandlers", "arrayBuffers", "layoutObjects", "navLog", "adjustLog", "imagesFetched", "audioFetched", "imgInDomMB", "rendererRssMB", "gpuRssMB", "footprintMB", "gpuFootprintMB", ...[...new Set(bounds.flatMap((s) => Object.keys(s).filter((k) => k.startsWith("mem_"))))].sort()];
  const byK = new Map(checks.map((c) => [c.id, c]));
  const rows: string[] = [];
  for (const k of metrics) {
    const pts = bounds.filter((s) => s[k] != null && Number.isFinite(Number(s[k])));
    if (!pts.length) continue;
    const ys = pts.map((s) => Number(s[k]));
    const sl = slope(pts.map((s) => s.levelIndex ?? 0), ys);
    const c = BOUNDARY.some((b) => b.k === k) ? byK.get(k) : undefined;
    rows.push(`| ${k} | ${base?.[k] ?? "-"} | ${ys.map(r1).join(" ")} | ${last?.[k] ?? "-"} | ${Math.round(sl * 100) / 100} | ${c ? `${c.ok === false ? "FAIL" : "ok"} (${c.budget})` : ""} |`);
  }
  const play = samples.filter((s) => s.tag === "periodic");
  const firstHalf = play.slice(0, Math.floor(play.length / 2)), secondHalf = play.slice(Math.floor(play.length / 2));
  const avg = (a: Sample[], k: string) => mean(nums(a.map((s) => s[k]).filter((x) => x != null)));
  const perf = ["fps", "slowFramePct", "mainThreadPct", "scriptPct", "stylePct", "layoutPct", "recalcPerSec", "layoutPerSec", "rendererPct", "gpuPct", "longTaskMs", "rafPerSec", "rafPerFrame", "animHiddenInfinite", "animMainThreadInfinite", "animations", "animInfinite", "particles", "particlesPeak"];
  const perfRows = perf.map((k) => `| ${k} | ${avg(firstHalf, k)} | ${avg(secondHalf, k)} |`);
  const phases = samples.filter((s) => !["periodic", "boundary", "baseline"].includes(s.tag));
  const phaseRows = phases.map((s) => `| ${s.tag} | ${s.phase ?? s.route ?? ""} | ${s.fps} | ${s.mainThreadPct} | ${s.stylePct} | ${s.recalcPerSec} | ${s.rafPerSec} | ${s.rendererPct ?? "-"} | ${s.gpuPct ?? "-"} | ${s.particles} / ${s.particlesPeak} | ${s.fxDomNodes} | ${s.animations} (${s.animInfinite} inf, ${s.animMainThreadInfinite} main) | ${s.decodedMB} | ${s.nodes} | ${s.heapMB} |`);
  const lvRows = levels.map((l) => `| ${l.id} | ${l.kind} | ${l.secs} | ${l.ok ? "yes" : "NO"} | ${l.maxStreak} | ${l.streakEnd ?? ""} | ${l.stuck ?? ""} |`);
  const fails = checks.filter((c) => c.ok === false);
  const md = [
    `# Soak ${OUT.split("/").pop()}`,
    "",
    `${levels.length} levels in one page (reloads: ${reloads === 0 ? "none" : reloads}), fast=${meta.fast}${meta.mobile ? ", phone emulation (844×390, DPR 3)" : ", desktop 844×390"}${meta.cpu > 1 ? `, CPU throttled ${meta.cpu}×` : ""}, served ${meta.serve}${meta.base && meta.base !== "?" ? ` from ${meta.base}` : ""}${meta.built ? ` (snapshot built ${meta.built})` : ""}${meta.patched ? ", **with the docs/PERF.md fixes patched in (preview)**" : ""}. Longest streak: ${maxStreak}. Page errors: ${errors.length}.`,
    "",
    `## Budgets: ${fails.length ? `**FAIL** (${fails.length}: ${fails.map((c) => c.id).join(", ")})` : "pass"}`,
    "",
    `docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run${meta.cpu > 1 ? "" : " (the phone rows are judged only with --mobile --cpu 4; their desktop values are shown)"}. Owners are the fix plan's lanes; an offending animation names the file that defines it.`,
    "",
    checkTable(checks),
    "",
    "## After each level (on the map, after a forced GC)",
    "",
    "| metric | start | per level → | last | slope / level | budget |",
    "|---|---|---|---|---|---|",
    ...rows,
    "",
    "## While playing (periodic samples): first half vs second half",
    "",
    "| metric | first half | second half |",
    "|---|---|---|",
    ...perfRows,
    "",
    "## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)",
    "",
    "| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|",
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
    JSON.stringify({ animations: last?.detail?.anims, globalListeners: last?.detail?.globalListeners, intervals: last?.detail?.intervals, mods: last?.mods }, null, 1),
    "```",
    "",
    errors.length ? `## Errors\n\n${errors.slice(0, 30).map((e) => `- ${e}`).join("\n")}\n` : "",
  ].join("\n");
  return md;
}

const LABEL: Record<string, string> = {
  rafPerSec: "a still screen keeps asking for frames (an always-on rAF loop)",
  idleRaf: "the still map keeps asking for frames while nobody touches it",
  idleNextRaf: "a held Next keeps asking for frames while it waits (the idle nudge included)",
  idleNextMain: "a held Next keeps a slow phone's main thread busy while it waits",
  idleMain: "the still map keeps a slow phone's main thread busy",
  fps: "a screen runs under 50 fps on a slow phone",
  decodedMB: "decoded audio keeps growing",
  titleDecodedMB: "the title decodes audio it never plays",
  audioHandlers: "Web Audio nodes pile up",
  mediaAlive: "<audio> elements pile up",
  nodes: "DOM nodes pile up",
  heapMB: "the JS heap keeps growing",
  listeners: "event listeners pile up",
  animations: "animations left running after a level",
  particles: "particles left after a level",
  fxDomNodes: "effect nodes left after a level",
  intervals: "intervals left running after a level",
  navLog: "the nav log grows without a cap",
  adjustLog: "the save's adjustLog grows without a cap",
  animMainThreadInfinite: "endless animations the compositor can't run (repainted every frame)",
  animHiddenInfinite: "endless animations running on hidden elements",
  auraT0: "the ninja standing still at streak 0 keeps a slow phone busy",
  auraT3: "the ninja standing still at streak 10 keeps a slow phone busy",
  flowerMain: "the World Flower keeps a slow phone's main thread busy",
  flowerTask: "the World Flower freezes on a slow phone (a long task)",
  stressPeak: "a fast streak piles up too many particles",
  stressAfter: "a fast streak leaves particles or effect nodes behind",
  reloaded: "the page reloaded during the soak",
  levels: "the soak's bot couldn't finish a level",
};
/** The failed budgets as treadmill findings (types.ts), for playtest/INBOX.md: --findings <file>. */
function toFindings(checks: Check[]): Finding[] {
  const SEV: Record<string, Finding["severity"]> = { reloaded: "blocker", animMainThreadInfinite: "minor", animHiddenInfinite: "minor", navLog: "minor", adjustLog: "minor" };
  const cmd = `bun scripts/treadmill/soak.ts ${process.argv.slice(2).filter((a, i, all) => !["--findings", "--out", "--analyse"].includes(all[i - 1] ?? "") && !["--findings", "--out", "--analyse"].includes(a)).join(" ")}`.trim();
  return checks
    .filter((c) => c.ok === false)
    .map((c) => ({ sig: `soak:${c.id}`, source: "invariant", severity: SEV[c.id] ?? "major", case: "soak", title: `soak: ${LABEL[c.id] ?? c.what}`, detail: `${c.when}, ${c.what}: ${c.measured} (budget ${c.budget}; owner ${c.owner})${c.detail ? `. ${c.detail}` : ""}`, evidence: [`${OUT}/summary.md`, `${OUT}/report.html`], repro: cmd }));
}

/** Judge the run in `samples`, write checks.json, summary.md and report.html (and --findings), print the budget table,
 *  and exit 1 on a failed budget with --check. */
function finish(dir: string, meta: Meta, levels: any[], errors: string[], reloads: number, maxStreak: number) {
  const checks = judge(meta, levels, reloads);
  const md = analyse(meta, checks, levels, errors, reloads, maxStreak);
  writeFileSync(`${dir}/checks.json`, JSON.stringify({ pass: !checks.some((c) => c.ok === false), meta, checks }, null, 1));
  writeFileSync(`${dir}/summary.md`, md);
  writeFileSync(`${dir}/report.html`, html(md));
  if (arg("findings")) writeFileSync(arg("findings")!, JSON.stringify(toFindings(checks), null, 1));
  console.log(`\n${checkText(checks)}\n→ ${dir}/summary.md`);
  if (CHECK && checks.some((c) => c.ok === false)) process.exit(1);
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

/** --analyse <dir>: re-judge a finished soak from its samples.json (checks.json, summary.md, report.html), e.g. after a
 *  budget changes. The run's flags come from its levels.json; for older runs, pass the same --mobile/--cpu. */
function reanalyse(dir: string) {
  samples.push(...(JSON.parse(readFileSync(`${dir}/samples.json`, "utf8")) as Sample[]));
  const { levels, errors, reloads, meta: saved } = JSON.parse(readFileSync(`${dir}/levels.json`, "utf8"));
  if (!saved) console.log(`(${dir}/levels.json has no meta, an older run: judging it as ${CPU > 1 ? `a phone run, CPU ${CPU}×` : "a desktop run"} from the flags; a phone run needs --mobile --cpu 4)`);
  const struck = Math.max(0, ...samples.map((s) => Number(/strike \d+\/(\d+)/.exec(String(s.phase ?? ""))?.[1] ?? 0)));
  const meta: Meta = saved ?? { mobile: MOBILE, cpu: CPU, fast: FAST, from: levels[0]?.id ?? FROM, levels: levels.length, patched: PATCHED, serve: "?", base: "?", built: null, idle: (samples.filter((s) => s.tag === "idle-map").length * EVERY) / 1000, idleNext: (samples.filter((s) => s.tag === "idle-next").length * EVERY) / 1000, stress: struck };
  MOBILE = meta.mobile;
  CPU = meta.cpu;
  PATCHED = meta.patched ?? false;
  const maxStreak = Math.max(0, ...levels.map((l: any) => l.maxStreak ?? 0));
  finish(dir, meta, levels, errors ?? [], reloads ?? 0, maxStreak);
}

if (arg("analyse")) reanalyse(arg("analyse")!);
else
  main().catch((e) => {
    console.error(e);
    stopServer();
    process.exit(2);
  });
