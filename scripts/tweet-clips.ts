// The camera rig for X/Twitter gameplay clips (docs: the header of this file; test output in
// assets-src/tweet/2026-09-26/rig-test/).
//
// record() plays the PREVIEW build in headless Chromium and films it with a CDP screencast (JPEG q92, 1920×1080: the
// game's 1280×720 layout at device scale 1.5), rebuilt to a constant 30 fps from the frames' own timestamps. The sound
// is the game's real soundtrack, rebuilt from window.__audioLog like scripts/record-clips.ts does (speech, sfx, music and
// stings at the times they played, with the game's own mix and ducking). A clapper (five claps of a small white square
// in the bottom-left corner, each with a 12 kHz beep) at the head and tail measures how late the picture is (the browser
// shows a change 40–90 ms after the code that makes it runs, at 1080p in a battle); the soundtrack is shifted by the
// median, and every clap is checked again on the finished master (rec.sync).
//
// It returns the raw master (H.264 video + the full mix), the full mix as a float WAV, a timeline of events (speech with
// its words, sfx, music, taps, scenes) and a contact sheet, so an editor can pick a window and trim() it for X.
//
//   import { record, trim, contactSheet, tweetSave } from "./tweet-clips";
//   const rec = await record({ name: "battle", url: "/play/?level=w2-2", seconds: 30, outDir: "assets-src/tweet/2026-09-26/raw" });
//   // look at rec.sheet (every second, labelled with what is said) and rec.events; then:
//   const clip = await trim(rec.master, 6.2, 18.4, "assets-src/tweet/2026-09-26/battle.mp4");
//
// CLI:  bun scripts/tweet-clips.ts record <name> <url> <seconds> <outDir>     (the bot plays)
//       bun scripts/tweet-clips.ts trim <master.mp4> <start> <end> <out.mp4> [posterAt]
//       bun scripts/tweet-clips.ts sheet <file.mp4> [everySec]
//
// Why this way (tested 26 Sep, rig-test/): Playwright's recordVideo is VP8 at 1 Mbps and 25 fps (smeared under motion;
// 25→30 fps repeats every sixth frame) and hangs outright with --force-device-scale-factor; the screencast delivers
// ~60 fps and the 30 fps rebuild repeats or drops <1% of frames. `capture: "playwright"` is kept for comparison.
//
// Gotchas:
// - Every master has the clapper at its head and tail (a white square flicking in the bottom-left corner, and 12 kHz
//   beeps): cut inside `game` (rec.game.start … rec.game.end), which leaves them out.
// - The headless shell renders with SwiftShader (the CPU): steady at ~60 fps for battles, but heavy scenes (the World
//   Flower's gem victory) draw only ~14 fps at 1080p on a busy machine, and the picture runs ~240 ms late (the
//   soundtrack follows it, so sync holds). For those, `gpu: true` (ANGLE Metal) draws ~59 fps but freezes now and then
//   (one 0.1–0.3 s freeze per 20 s in tests): every freeze over 70 ms is a "hitch" event on the timeline (and FREEZE on
//   the contact sheet), so pick a window without one. record() sets `advice` when the picture was poor.
//   (The new headless mode, channel "chromium", gives out-of-order frame timestamps: not used.)
// - A tap ripple shows where the bot taps (`showTaps: false` to hide it); the bot waits while a scene is `locked`/`busy`.
// - Sounds are the preview's own files (fetched into <outDir>/.audio/), sfx rendered by the preview's __renderSfx.
//   Speech cut off by hush() is cut in the mix too (the page's AudioBufferSourceNode.stop() is logged).
// - Under bun, a second browser in the same process sometimes fails to start or never finishes closing: record() retries
//   the launch and gives up waiting on close (then bun may not exit: end scripts with process.exit()). Separate processes
//   per recording are the most reliable.
// - Measuring audio: seek after -i (an input seek into AAC can land a packet, ~21 ms, off); alimiter needs latency=1.
//
// House rules: nothing is ever deleted; a file that would be overwritten, and the intermediate video, are moved to
// .trash/tweet-clips/. One browser at a time (calls to record() queue).
import { chromium, type Page } from "playwright";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { step as botStep, save as botSave } from "./treadmill/bot";

export const PREVIEW = "https://next.superninja.templestein.com";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TRASH = join(ROOT, ".trash", "tweet-clips");
const FPS = 30;
/** The game's own mix (src/engine/audio.ts): music bus = settings.music, ducked to 35% under speech; sfx rendered with
 *  their 0.55 bus gain, ducked to 50% under speech and 15% under a target sound or word; the gem-victory sting
 *  (Tree.tsx) at min(0.95, music × 2.6), ducked to 28%. */
const DEFAULT_MUSIC = 0.32;
const BEEP_HZ = 12000;
const BEEP_S = 0.06;

// ---------------------------------------------------------------------------------------------------------- types
export interface TimelineEvent {
  /** seconds on the master's clock (picture time: sounds are already shifted to line up with what they belong to) */
  t: number;
  kind: "speech" | "sfx" | "music" | "sting" | "music-stop" | "tap" | "scene" | "mark" | "slate" | "hitch";
  /** line id, "word:sun", "sound:s", sfx name, music id, tapped aria-label, scene, mark label; for a hitch (the
   *  browser drew no new frame for over 70 ms: the picture freezes there), how long */
  id: string;
  /** what is said (for a line), or the tapped element's label */
  text?: string;
  /** how long it sounds (seconds), when known */
  dur?: number;
}
export interface RecordOptions {
  name: string;
  /** "/play/?level=w2-2" (on `base`) or an absolute URL */
  url: string;
  /** the save (see tweetSave()); captions on, music at the game's default and unlockAll unless it says otherwise */
  save?: Record<string, unknown>;
  /** plays the moment; the default lets the bot play. The recording stops after `seconds` whatever the drive does. */
  drive?: (page: Page, rig: Rig) => Promise<void>;
  /** how long to film the game, from when the page starts loading (the master adds about 1.5 s of slates) */
  seconds: number;
  outDir: string;
  base?: string;
  /** "cdp" (default): CDP screencast, rebuilt to constant 30 fps. "playwright": recordVideo (VP8 1 Mbps at 25 fps; for
   *  comparison only) */
  capture?: "cdp" | "playwright";
  /** "1080p" (default): 1280×720 CSS at device scale 1.5. "720p": scale 1. */
  size?: "1080p" | "720p";
  /** screencast JPEG quality (92) */
  quality?: number;
  /** a soft touch ripple where the bot taps (default true: viewers can see what the child tapped) */
  showTaps?: boolean;
  /** contact sheet every n seconds (default 1; 0: none) */
  sheetEvery?: number;
  /** extra audio delay in ms on top of the measured picture latency (default 0) */
  audioNudgeMs?: number;
  /** render on the GPU (ANGLE Metal) instead of SwiftShader: heavy scenes run ~4× faster at 1080p (the gem victory:
   *  54 fps instead of 14), but it stalls now and then (0.2–1.4 s frozen); check rec.frames.hitches and max */
  gpu?: boolean;
}
export interface Rig {
  /** seconds since the master started */
  elapsed(): number;
  /** false once the recording has stopped (a drive should stop then) */
  live(): boolean;
  /** let the bot play: for `seconds` (default: until the recording stops), a tap every `every` ms (900); `mistakes`: the
   *  chance (0–1) of a deliberate wrong tile in a battle, so a correction shows */
  bot(opts?: { seconds?: number; every?: number; mistakes?: number }): Promise<void>;
  /** tap an element the way the bot does (a pointerdown); logged on the timeline, with a ripple */
  tap(selector: string): Promise<void>;
  /** put a named marker on the timeline */
  mark(label: string): void;
  wait(ms: number): Promise<void>;
}
export interface FrameStats {
  /** unique frames the browser delivered while the game played, and their rate */
  frames: number;
  fps: number;
  /** gaps between delivered frames, ms */
  p50: number;
  p95: number;
  p99: number;
  max: number;
  /** gaps over 50 ms (a visible hitch) */
  hitches: number;
  /** output slots (1/30 s) that had to repeat the previous frame although the game was animating */
  repeatedSlots: number;
  slots: number;
  /** how long after the browser drew a frame node received it (ms, mean) */
  deliveryMs: number;
}
export interface SyncReport {
  /** ms from the slate's DOM change to the first frame showing it, on the raw frames (head, tail) */
  pictureLatencyMs: number[];
  /** what the soundtrack was shifted by, ms */
  audioShiftMs: number;
  /** measured on the finished master: each beep's onset minus its square's first frame (positive = sound late), ms */
  residualMs: (number | null)[];
  residualMedianMs: number;
  residualMaxAbsMs: number;
}
export interface RecordResult {
  name: string;
  master: string;
  /** the full mix, float WAV, same clock as the master (trim() uses it) */
  audio: string;
  timeline: string;
  sheet?: string;
  events: TimelineEvent[];
  /** where the game starts and stops on the master's clock (the slates are outside) */
  game: { start: number; end: number };
  duration: number;
  width: number;
  height: number;
  capture: "cdp" | "playwright";
  frames?: FrameStats;
  sync: SyncReport;
  /** set when the picture was poor (e.g. a heavy scene at under 45 fps): what to try instead */
  advice?: string;
}

// ------------------------------------------------------------------------------------------------------- helpers
const run = (cmd: string, args: string[], input?: Buffer) => {
  const r = spawnSync(cmd, args, { input, maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`${cmd} ${args.slice(0, 12).join(" ")}…\n${r.stderr?.toString().slice(-2000)}`);
  return r;
};
const ff = (args: string[]) => run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
const probe = (file: string): any => JSON.parse(run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file]).stdout.toString());
const durationOf = (file: string) => Number(probe(file).format.duration);
/** Move a file out of the way (never delete). */
function retire(file: string) {
  if (!existsSync(file)) return;
  mkdirSync(TRASH, { recursive: true });
  renameSync(file, join(TRASH, `${new Date().toISOString().replace(/[:.]/g, "-")}-${basename(file)}`));
}
const round = (x: number, d = 3) => Math.round(x * 10 ** d) / 10 ** d;
const aacEncoder = (() => {
  let v: string | null = null;
  return () => (v ??= run("ffmpeg", ["-hide_banner", "-encoders"]).stdout.toString().includes("aac_at") ? "aac_at" : "aac");
})();
/** Colour: Chrome's screencast JPEGs are full-range BT.601; H.264 for the web is limited-range BT.709, tagged. */
const TAG_709_VF = "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv";
const TO_709 = `scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p,${TAG_709_VF}`;
const TAG_709 = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"];

/** A save for filming: the bot's (scripts/treadmill/bot.ts) with captions ON (people watch muted), music at the game's
 *  default level and every level open. `extra` is merged over it (its `settings` too). */
export function tweetSave(extra: Record<string, any> = {}): Record<string, unknown> {
  const base = botSave() as Record<string, any>;
  return { ...base, ...extra, settings: { ...base.settings, music: DEFAULT_MUSIC, captions: true, unlockAll: true, ...(extra.settings ?? {}) } };
}

let queue: Promise<unknown> = Promise.resolve();

// ------------------------------------------------------------------------------------------------ in-page probes
/** Runs in every document before the game: the audio log (with which buffer source each sound was, so hush()'s stop()
 *  can cut it), tap logging and ripples, real music start times, scene changes, and the save. */
function pageProbe({ save, showTaps }: { save: unknown; showTaps: boolean }) {
  const w = window as any;
  const log: any[] = [];
  let lastSrc: any = null;
  let sid = 0;
  // the game pushes {t, url, kind} right after src.start(): tag it with that source, so a later stop() can end it
  log.push = function (...items: any[]) {
    for (const e of items) if (e && lastSrc && (e.kind === "speech" || e.kind === "sting") && Date.now() - lastSrc.t < 50) e.sid = lastSrc.id;
    return Array.prototype.push.apply(this, items);
  };
  w.__audioLog = log;
  const AB = w.AudioBufferSourceNode?.prototype;
  if (AB) {
    const start = AB.start, stop = AB.stop;
    AB.start = function (...a: any[]) {
      this.__sid = ++sid;
      lastSrc = { id: this.__sid, t: Date.now() };
      return start.apply(this, a);
    };
    AB.stop = function (...a: any[]) {
      if (this.__sid && !this.__stopped) {
        this.__stopped = true;
        Array.prototype.push.call(log, { t: Date.now(), kind: "stop", url: "", sid: this.__sid });
      }
      return stop.apply(this, a);
    };
  }
  const HM = w.HTMLMediaElement?.prototype;
  if (HM) {
    const play = HM.play, pause = HM.pause;
    const path = (el: any) => {
      try {
        return new URL(el.currentSrc || el.src, location.href).pathname;
      } catch {
        return "";
      }
    };
    HM.play = function (...a: any[]) {
      if (!this.__snLogged) {
        this.__snLogged = true;
        this.addEventListener("playing", () => Array.prototype.push.call(log, { t: Date.now(), kind: "playing", url: path(this) }));
      }
      return play.apply(this, a);
    };
    HM.pause = function (...a: any[]) {
      if (!this.paused) Array.prototype.push.call(log, { t: Date.now(), kind: "pause", url: path(this) });
      return pause.apply(this, a);
    };
  }
  try {
    if (location.protocol.startsWith("http") && !localStorage.getItem("superninja.profiles.v1")) localStorage.setItem("superninja.save.v1", JSON.stringify(save));
  } catch {}
  addEventListener(
    "pointerdown",
    (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      const lab = el?.closest("[aria-label]");
      const r = (lab ?? el)?.getBoundingClientRect();
      // Playwright's dispatchEvent has no coordinates: use the element's middle
      const x = e.clientX || (r ? r.left + r.width / 2 : 0), y = e.clientY || (r ? r.top + r.height / 2 : 0);
      Array.prototype.push.call(log, { t: Date.now(), kind: "tap", url: "", label: lab?.getAttribute("aria-label") ?? el?.tagName ?? "", rect: r ? [r.left, r.top, r.width, r.height] : null });
      if (!showTaps || !document.body) return;
      const d = document.createElement("div");
      d.style.cssText = `position:fixed;left:${x - 30}px;top:${y - 30}px;width:60px;height:60px;border-radius:50%;pointer-events:none;z-index:2147483646;background:rgba(255,255,255,.38);border:3px solid rgba(255,255,255,.9);box-shadow:0 0 12px rgba(0,0,0,.25)`;
      document.body.appendChild(d);
      d.animate([{ transform: "scale(.55)", opacity: 1 }, { transform: "scale(1.35)", opacity: 0 }], { duration: 480, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => d.remove();
    },
    { capture: true },
  );
  let last = "";
  setInterval(() => {
    const s = w.__snState;
    const key = s?.scene ? `${s.scene}${s.word ? `:${s.word}` : ""}` : "";
    if (key && key !== last) Array.prototype.push.call(log, { t: Date.now(), kind: "scene", url: "", label: key });
    last = key || last;
  }, 150);
}

/** The clapper: a white square (CLAP CSS px) in the bottom-left corner for 120 ms; returns Date.now() when the DOM
 *  changed. The soundtrack gets a beep at that moment. */
const CLAP = 40;
const clap = (page: Page) =>
  page.evaluate((size) => {
    const d = document.createElement("div");
    d.style.cssText = `position:fixed;left:0;bottom:0;width:${size}px;height:${size}px;background:#fff;z-index:2147483647;pointer-events:none`;
    (document.body ?? document.documentElement).appendChild(d);
    const t = Date.now();
    setTimeout(() => d.remove(), 120);
    return t;
  }, CLAP);
/** The clapper's square in device pixels (inset, for measuring): [x, y, w, h] */
const clapRegion = (W: number, H: number, scale: number) => {
  const s = Math.round(CLAP * scale), m = Math.round(4 * scale);
  return [m, H - s + m, s - 2 * m, s - 2 * m] as const;
};
const dbg = (...a: unknown[]) => process.env.TWEET_DEBUG && console.log("[tweet-clips]", ...a);
const BLANK = "data:text/html,<body style='margin:0;background:#000'></body>";

// ----------------------------------------------------------------------------------------------------- the camera
interface Frame { ts: number; buf: Buffer; recv: number }
/** Constant-frame-rate rebuild: output slot k (time t0 + k/30 s) shows what was on screen then: the last delivered
 *  frame drawn by then (or up to half a 60 Hz frame after it). Chrome only sends a frame when something changed, so a
 *  frame after a still moment must not be pulled earlier (a nearest-frame rule would show it up to half the gap early). */
const LOOKAHEAD = 8;
class CfrWriter {
  ended = false;
  slot = 0;
  prev: Frame | null = null;
  prevIdx = -1;
  idx = -1;
  /** per slot: which delivered frame it shows */
  slotFrame: number[] = [];
  constructor(private t0: number, private out: (b: Buffer) => void) {}
  push(f: Frame) {
    if (this.ended || (this.prev && f.ts <= this.prev.ts)) return; // after the end, late, or a duplicate
    this.idx++;
    if (this.prev) this.fill(f.ts - LOOKAHEAD);
    this.prev = f;
    this.prevIdx = this.idx;
  }
  private fill(until: number) {
    while (this.t0 + (this.slot * 1000) / FPS < until) {
      this.out(this.prev!.buf);
      this.slotFrame.push(this.prevIdx);
      this.slot++;
    }
  }
  end(tEnd: number) {
    if (this.prev && !this.ended) this.fill(tEnd);
    this.ended = true;
  }
}

/** Encode a JPEG stream (already constant 30 fps) to a high-quality H.264 intermediate. */
function encoder(file: string) {
  const p = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "pipe:0",
    "-vf", TO_709, "-c:v", "libx264", "-preset", "veryfast", "-crf", "12", "-g", String(FPS), ...TAG_709, "-an", file], { stdio: ["pipe", "ignore", "pipe"] });
  let err = "";
  p.stderr.on("data", (d) => (err += d));
  const done = new Promise<void>((ok, bad) => p.on("close", (c) => (c === 0 ? ok() : bad(new Error(`encoder: ${err}`)))));
  return { write: (b: Buffer) => p.stdin.write(b), close: () => (p.stdin.end(), done) };
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0;
};
const cropTo = (r?: readonly number[]) => (r ? `crop=${r[2]}:${r[3]}:${r[0]}:${r[1]},` : "");
/** Mean luma (0–255) of JPEG frames (of a region [x, y, w, h] of them), via ffmpeg. */
function lumas(jpegs: Buffer[], region?: readonly number[]): number[] {
  if (!jpegs.length) return [];
  const r = run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-f", "image2pipe", "-c:v", "mjpeg", "-i", "pipe:0", "-vf", `${cropTo(region)}scale=32:18,format=gray`, "-f", "rawvideo", "pipe:1"], Buffer.concat(jpegs));
  const px = 32 * 18, out: number[] = [];
  for (let i = 0; i + px <= r.stdout.length; i += px) {
    let s = 0;
    for (let k = 0; k < px; k++) s += r.stdout[i + k];
    out.push(s / px);
  }
  return out;
}

// ------------------------------------------------------------------------------------------------------ record()
export function record(opts: RecordOptions): Promise<RecordResult> {
  const job = queue.then(() => recordNow(opts));
  queue = job.catch(() => {});
  return job;
}

async function recordNow(o: RecordOptions): Promise<RecordResult> {
  const base = o.base ?? PREVIEW;
  const capture = o.capture ?? "cdp";
  const scale = (o.size ?? "1080p") === "1080p" ? 1.5 : 1;
  const W = Math.round(1280 * scale), H = Math.round(720 * scale);
  // Playwright's recordVideo hangs (no frames at all) with --force-device-scale-factor, so its 1080p is a 1920×1080
  // viewport at scale 1 (the game lays out the same way; it scales its stage to the window)
  const pw = capture === "playwright";
  const dsf = pw ? 1 : scale, VW = W / dsf, VH = H / dsf;
  const outDir = resolve(o.outDir);
  const work = join(outDir, ".work");
  mkdirSync(work, { recursive: true });
  const save = o.save ?? tweetSave();
  const music: number = (save as any).settings?.music ?? DEFAULT_MUSIC;
  const url = /^https?:/.test(o.url) ? o.url : base + o.url;

  // (under bun, a launch after an earlier browser in the same process sometimes loses its pipe and never connects:
  // a short timeout and another go)
  const launch = () => chromium.launch({
    timeout: 45_000,
    args: ["--autoplay-policy=no-user-gesture-required", ...(pw ? [] : [`--force-device-scale-factor=${scale}`]), "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
      ...(o.gpu ? ["--use-angle=metal", "--enable-gpu", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"] : [])],
  });
  let browser!: Awaited<ReturnType<typeof launch>>;
  for (let attempt = 1; ; attempt++) {
    try {
      browser = await launch();
      break;
    } catch (e) {
      if (attempt >= 3) throw e;
      console.warn(`[tweet-clips] ${o.name}: the browser did not start (${String((e as Error).message).split("\n")[0]}); trying again`);
    }
  }
  const videoTmp = join(work, `${o.name}.video.mp4`);
  retire(videoTmp);
  const ctx = await browser.newContext({
    viewport: { width: VW, height: VH }, deviceScaleFactor: dsf, hasTouch: false, isMobile: false,
    ...(capture === "playwright" ? { recordVideo: { dir: work, size: { width: W, height: H } } } : {}),
  });
  await ctx.addInitScript(pageProbe, { save, showTaps: o.showTaps ?? true });
  const page = await ctx.newPage();
  await page.goto(BLANK);

  // ---- the camera
  const frames: { ts: number; recv: number }[] = [];
  const keep: Frame[] = []; // frames near a slate, for measuring
  let keepUntil = 0;
  const region = clapRegion(W, H, dsf);
  let t0 = Date.now();
  let cfr: CfrWriter | null = null;
  let enc: ReturnType<typeof encoder> | null = null;
  let cdp: Awaited<ReturnType<typeof ctx.newCDPSession>> | null = null;
  if (capture === "cdp") {
    enc = encoder(videoTmp);
    cdp = await ctx.newCDPSession(page);
    cdp.on("Page.screencastFrame", (f: any) => {
      cdp!.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
      const fr: Frame = { ts: f.metadata.timestamp ? f.metadata.timestamp * 1000 : Date.now(), buf: Buffer.from(f.data, "base64"), recv: Date.now() };
      frames.push({ ts: fr.ts, recv: fr.recv });
      if (fr.ts <= keepUntil) keep.push(fr);
      cfr?.push(fr);
    });
    t0 = Date.now();
    cfr = new CfrWriter(t0, (b) => enc!.write(b));
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: o.quality ?? 92, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  } else {
    // Playwright's recorder started with the page; its clock is the webm's creation_time (read after closing)
  }
  // The slates clap over the game itself: how late the picture is depends on how hard the page is working (a change on
  // a still black page shows within ~5 ms; over the game at 1080p it takes 60–90 ms, steady but with rare outliers, so
  // five claps at the head and five at the tail, and their median).
  const slates: number[] = [];
  const slate = async () => {
    for (let i = 0; i < 5; i++) {
      keepUntil = Date.now() + 450;
      slates.push(await clap(page));
      await page.waitForTimeout(260 + Math.random() * 60); // (a random phase against the 60 Hz frames)
    }
    await page.waitForTimeout(250);
  };
  await page.waitForTimeout(200);

  // ---- the game
  const loadStart = Date.now();
  const marks: { t: number; label: string }[] = [];
  let live = true;
  const rig: Rig = {
    elapsed: () => (Date.now() - t0) / 1000,
    live: () => live,
    wait: (ms) => page.waitForTimeout(ms).catch(() => {}),
    mark: (label) => void marks.push({ t: Date.now(), label }),
    tap: async (sel) => {
      await page.locator(sel).first().dispatchEvent("pointerdown", undefined, { timeout: 1500 }).catch(() => {});
    },
    bot: async ({ seconds, every = 900, mistakes = 0 } = {}) => {
      const end = seconds == null ? Infinity : Date.now() + seconds * 1000;
      while (live && Date.now() < end) {
        // (a child waits while the scene is busy, e.g. Sensei's introduction: no taps, ripples or tap sounds then)
        const st: any = await page.evaluate(() => (window as any).__snState || {}).catch(() => ({}));
        const waiting = st.locked === true || (st.busy === true && st.scene !== "warmup");
        if (!waiting) {
          const wrong = mistakes > 0 && Math.random() < mistakes ? await wrongTile(page) : false;
          if (!wrong) await botStep(page).catch(() => {});
        }
        await page.waitForTimeout(waiting ? 200 : every * (0.8 + Math.random() * 0.4)).catch(() => {});
      }
    },
  };
  dbg(o.name, "loading", url);
  await page.goto(url, { waitUntil: "load", timeout: 60_000 });
  const loaded = Date.now();
  dbg(o.name, "loaded");
  await page.waitForTimeout(300);
  await slate();
  const gameStart = Date.now();
  const driving = (o.drive ?? ((_p: Page, r: Rig) => r.bot()))(page, rig).catch((e) => {
    if (live) console.warn(`[tweet-clips] ${o.name}: drive failed: ${e?.message ?? e}`);
  });
  const stopAt = loadStart + o.seconds * 1000;
  while (Date.now() < stopAt) await page.waitForTimeout(Math.min(250, stopAt - Date.now())).catch(() => {});
  live = false;
  const gameEnd = Date.now();
  await slate();
  // the film ends here (the soundtrack too)
  const stopAll = Date.now();
  if (cdp) {
    await cdp.send("Page.stopScreencast").catch(() => {});
    cfr!.end(stopAll);
    await enc!.close();
  }
  // everything the game played, and its synthesised sound effects (rendered by the preview build itself)
  const log: any[] = await page.evaluate(() => Array.from((window as any).__audioLog ?? [])).catch(() => []);
  const sfxDir = join(outDir, ".audio", "sfx");
  mkdirSync(sfxDir, { recursive: true });
  const sfxFiles = new Map<string, string>();
  for (const name of new Set(log.filter((e) => e.kind === "sfx").map((e) => String(e.url).slice(4)))) {
    try {
      const bytes: number[] = await page.evaluate((n) => (window as any).__renderSfx(n), name);
      const f = join(sfxDir, `${name}.wav`);
      writeFileSync(f, Buffer.from(bytes));
      sfxFiles.set(name, f);
    } catch (e) {
      console.warn(`[tweet-clips] sfx ${name} not rendered`);
    }
  }
  await page.goto(BLANK).catch(() => {});
  await Promise.race([driving, page.waitForTimeout(1500).catch(() => {})]);
  const pwVideo = capture === "playwright" ? page.video() : null;
  dbg(o.name, "closing the browser");
  // (under bun, closing sometimes never resolves although Chromium has gone: don't wait for ever)
  const within = (p: Promise<unknown>, ms: number) => Promise.race([p.catch(() => {}), new Promise((r) => setTimeout(r, ms))]);
  await within(ctx.close(), 20_000);
  await within(browser.close(), 10_000);
  if (browser.isConnected()) console.warn(`[tweet-clips] ${o.name}: the browser did not close in time (end the script with process.exit())`);
  dbg(o.name, "closed");

  // ---- the picture
  let frameStats: FrameStats | undefined;
  const latencies: number[] = [];
  const hitchList: { at: number; gap: number }[] = [];
  if (capture === "cdp") {
    // how late the picture is: the first frame showing each slate's flash
    const L = lumas(keep.map((f) => f.buf), region);
    for (const s of slates) {
      const i = keep.findIndex((f, k) => f.ts >= s - 5 && f.ts < s + 400 && L[k] > 235 && k > 0 && L[k - 1] <= 235);
      if (i >= 0) latencies.push(keep[i].ts - s);
    }
    const inGame = frames.filter((f) => f.ts >= gameStart + 500 && f.ts <= gameEnd);
    const gaps = inGame.slice(1).map((f, i) => f.ts - inGame[i].ts).sort((a, b) => a - b);
    const q = (p: number) => round(gaps[Math.min(gaps.length - 1, Math.floor(p * gaps.length))] ?? 0, 1);
    const s0 = Math.ceil(((gameStart + 500 - t0) * FPS) / 1000), s1 = Math.floor(((gameEnd - t0) * FPS) / 1000);
    const sf = cfr!.slotFrame;
    let rep = 0;
    for (let k = Math.max(1, s0); k < Math.min(s1, sf.length); k++) if (sf[k] === sf[k - 1]) rep++;
    const span = inGame.length > 1 ? (inGame[inGame.length - 1].ts - inGame[0].ts) / 1000 : 1;
    // freezes, for the timeline (an editor can pick a window without one)
    for (let i = 1; i < frames.length; i++) {
      const gap = frames[i].ts - frames[i - 1].ts;
      if (gap > 70 && frames[i].ts >= gameStart && frames[i - 1].ts <= gameEnd) hitchList.push({ at: frames[i - 1].ts, gap });
    }
    frameStats = {
      frames: inGame.length, fps: round(inGame.length / span, 1), p50: q(0.5), p95: q(0.95), p99: q(0.99), max: q(1), hitches: gaps.filter((g) => g > 50).length,
      repeatedSlots: rep, slots: Math.max(0, s1 - s0), deliveryMs: round(inGame.reduce((a, f) => a + f.recv - f.ts, 0) / Math.max(1, inGame.length), 1),
    };
  } else {
    // Playwright: the webm's clock starts at its creation_time; rebuild it to 30 fps like the screencast
    const webm = (await Promise.race([pwVideo!.path(), new Promise<string>((r) => setTimeout(() => r(""), 5000))])) || "";
    if (!webm || !existsSync(webm)) throw new Error("tweet-clips: Playwright's video never arrived");
    const info = probe(webm);
    const created = Date.parse(info.format.tags?.creation_time ?? "");
    // (frames are stamped from the recorder's creation; the rebuilt video starts at the first one)
    t0 = Number.isFinite(created) ? created + Number(info.format.start_time ?? 0) * 1000 : t0;
    ff(["-i", webm, "-vf", `fps=${FPS},scale=in_range=tv:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p,${TAG_709_VF}`, "-c:v", "libx264", "-preset", "veryfast", "-crf", "12", "-g", String(FPS), ...TAG_709, "-an", videoTmp]);
    retire(webm);
    for (const s of slates) {
      const at = flashAt(videoTmp, (s - t0) / 1000 - 0.05, 0.35, region);
      if (at != null) latencies.push(at * 1000 - (s - t0));
    }
  }
  // (+ the average wait for the next 1/30 s slot: a frame drawn at ts is first shown at the slot at or after ts − 8 ms)
  const shift = Math.max(0, Math.min(500, median(latencies))) + (capture === "cdp" ? 500 / FPS - LOOKAHEAD : 0) + (o.audioNudgeMs ?? 0);
  const duration = durationOf(videoTmp);

  // ---- the sound
  const entries = [...log, ...marks.map((m) => ({ t: m.t, kind: "mark", url: "", label: m.label }))];
  // the beep is a 12 kHz tone: it can be found under the game's own sound (onsetAt's band-pass)
  const beep = join(outDir, ".audio", "slate-beep-12k.wav");
  if (!existsSync(beep)) ff(["-f", "lavfi", "-i", `sine=frequency=${BEEP_HZ}:sample_rate=48000:duration=${BEEP_S}`, "-af", "volume=-6dB", beep]);
  dbg(o.name, "soundtrack", { latencies, shift });
  const { events, audio } = await soundtrack({ entries, slates, stopAll, t0, shift, duration, music, base, outDir, name: o.name, sfxFiles, beep });
  for (const h of hitchList) events.push({ t: round((h.at - t0) / 1000), kind: "hitch", id: `${Math.round(h.gap)} ms`, dur: round(h.gap / 1000) });
  events.sort((x, y) => x.t - y.t);

  // ---- the master: the picture and the full mix
  const master = join(outDir, `${o.name}.master.mp4`);
  retire(master);
  ff(["-i", videoTmp, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", "alimiter=limit=0.97:level=0:latency=1", "-c:a", aacEncoder(), "-b:a", "256k", "-ar", "48000", "-shortest", "-movflags", "+faststart", master]);
  retire(videoTmp);
  // the check, on the finished master: each beep against its square
  const residual = slates.map((s) => {
    const at = (s - t0 + shift) / 1000;
    const v = flashAt(master, at - 0.1, 0.3, region);
    const a = toneAt(master, at - 0.1, 0.3, BEEP_HZ, BEEP_S);
    return v == null || a == null ? null : round((a - v) * 1000, 1);
  });
  const ok = residual.filter((x): x is number => x != null);
  const sync: SyncReport = {
    pictureLatencyMs: latencies.map((x) => round(x, 1)), audioShiftMs: round(shift, 1), residualMs: residual,
    residualMedianMs: round(median(ok), 1), residualMaxAbsMs: round(Math.max(0, ...ok.map(Math.abs)), 1),
  };
  const game = { start: round((gameStart - t0) / 1000), end: round((gameEnd - t0) / 1000) };
  const timeline = join(outDir, `${o.name}.timeline.json`);
  retire(timeline);
  writeFileSync(timeline, JSON.stringify({ name: o.name, url, capture, gpu: !!o.gpu, width: W, height: H, fps: FPS, duration: round(duration), game, sync, frames: frameStats, master: basename(master), audio: basename(audio), recordedAt: new Date(t0).toISOString(), events }, null, 1));
  const every = o.sheetEvery ?? 1;
  const sheet = every > 0 ? contactSheet(master, every) : undefined;
  const advice = frameStats && frameStats.fps < 45
    ? `the browser drew only ${frameStats.fps} fps (${frameStats.repeatedSlots}/${frameStats.slots} frames repeat): ${o.gpu ? "try size: \"720p\", or a quieter machine" : "record again with gpu: true (or size: \"720p\")"}`
    : ok.length && Math.max(...ok.map(Math.abs)) > 80 ? `sound and picture differ by up to ${Math.round(Math.max(...ok.map(Math.abs)))} ms at the claps: record again` : undefined;
  if (advice) console.warn(`[tweet-clips] ${o.name}: ${advice}`);
  return { name: o.name, master, audio, timeline, sheet, events, game, duration: round(duration), width: W, height: H, capture, frames: frameStats, sync, ...(advice ? { advice } : {}) };
}

/** In a battle-like scene, tap a wrong tile (so the game's correction shows). */
async function wrongTile(page: Page) {
  const st: any = await page.evaluate(() => (window as any).__snState || {}).catch(() => ({}));
  if (!["battle", "build", "find", "learn"].includes(st.scene) || !st.next) return false;
  const wrong = await page.locator(".row .tile").evaluateAll((els, n) => els.map((e) => e.getAttribute("aria-label")).find((a) => a && a !== n), st.next).catch(() => null);
  if (!wrong) return false;
  await page.locator(`.row .tile[aria-label="${wrong}"]`).first().dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
  return true;
}

// -------------------------------------------------------------------------------------------------- measuring
/** Seconds (on the file's clock) of the first frame after `from` where the picture (or a region [x, y, w, h] of it)
 *  turns white (mean luma rising past 235: the clapper), or null. */
export function flashAt(file: string, from: number, len: number, region?: readonly number[]): number | null {
  const start = Math.floor(Math.max(0, from) * FPS) / FPS; // on a frame boundary, so frame k is at start + k/30
  const r = run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", String(start), "-i", file, "-t", String(len), "-vf", `${cropTo(region)}scale=16:16,format=gray`, "-f", "rawvideo", "pipe:1"]);
  const px = 16 * 16;
  let before = 255;
  for (let i = 0, k = 0; i + px <= r.stdout.length; i += px, k++) {
    let s = 0;
    for (let j = 0; j < px; j++) s += r.stdout[i + j];
    if (s / px > 235 && before <= 235) return start + k / FPS; // a rising edge
    before = s / px;
  }
  return null;
}
/** Where a tone burst (`hz`, `dur` seconds, e.g. the clapper's beep) starts in [from, from + len), in seconds, found with
 *  a matched filter (the burst's I/Q correlation), so the game's own sound underneath does not fool it; null if absent. */
export function toneAt(file: string, from: number, len: number, hz: number, dur: number): number | null {
  const start = Math.max(0, from), sr = 48000, M = Math.round(dur * sr);
  // (seeking after -i: decoding from the start is exact; an input seek in an AAC stream can land a packet off)
  const r = run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, "-ss", String(start), "-t", String(len + dur), "-vn", "-ac", "1", "-ar", String(sr), "-f", "f32le", "pipe:1"]);
  const x = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 4));
  if (x.length <= M) return null;
  const ci = new Float64Array(x.length + 1), cq = new Float64Array(x.length + 1);
  for (let n = 0; n < x.length; n++) {
    const w = (2 * Math.PI * hz * n) / sr;
    ci[n + 1] = ci[n] + x[n] * Math.cos(w);
    cq[n + 1] = cq[n] + x[n] * Math.sin(w);
  }
  let best = -1, at = -1;
  for (let L = 0; L + M <= x.length; L++) {
    const i = ci[L + M] - ci[L], q = cq[L + M] - cq[L], m = i * i + q * q;
    if (m > best) (best = m), (at = L);
  }
  // a real burst at −6 dBFS correlates to about (0.5 · M / 2)²; anything far below is not the beep
  return Math.sqrt(best) > 0.1 * (0.5 * M) / 2 ? start + at / sr : null;
}
/** Seconds of the first audio sample after `from` louder than a third of the loudest in the window (an onset), or null.
 *  `hz`: listen only around that frequency (a band-pass), e.g. for the slate's beep under the game's sound. */
export function onsetAt(file: string, from: number, len: number, hz?: number): number | null {
  const start = Math.max(0, from);
  const band = hz ? ["-af", `bandpass=f=${hz}:width_type=q:w=8,bandpass=f=${hz}:width_type=q:w=8`] : [];
  const r = run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, "-ss", String(start), "-t", String(len), "-vn", ...band, "-ac", "1", "-ar", "48000", "-f", "f32le", "pipe:1"]);
  const a = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 4));
  let peak = 0;
  for (const x of a) peak = Math.max(peak, Math.abs(x));
  if (peak < 0.01) return null;
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i]) > peak / 3) return start + i / 48000;
  return null;
}

// ------------------------------------------------------------------------------------------------ the soundtrack
let linesCache: Map<string, { text: string; who?: string }> | null = null;
async function lineTexts() {
  if (linesCache) return linesCache;
  linesCache = new Map();
  try {
    const { LINES } = await import("../src/content/lines");
    for (const l of LINES) linesCache.set(l.id, { text: l.text, who: l.who });
  } catch {}
  return linesCache;
}
const fetched = new Map<string, Promise<string | null>>();
/** The preview's own copy of a sound (fetched once per run, into <outDir>/.audio/). */
function fetchAudio(base: string, url: string, outDir: string): Promise<string | null> {
  const key = `${base}${url}|${outDir}`;
  let p = fetched.get(key);
  if (!p) {
    p = (async () => {
      const f = join(outDir, ".audio", url.replace(/^\//, ""));
      try {
        const r = await fetch(base + url);
        if (!r.ok) throw new Error(String(r.status));
        const bytes = Buffer.from(await r.arrayBuffer());
        mkdirSync(dirname(f), { recursive: true });
        if (!existsSync(f) || !readFileSync(f).equals(bytes)) {
          retire(f); // (a newer take of the same sound: keep the old one in the trash)
          writeFileSync(f, bytes);
        }
        return f;
      } catch {
        const local = join(ROOT, "public", url);
        return existsSync(local) ? local : null;
      }
    })();
    fetched.set(key, p);
  }
  return p;
}
const idOf = (url: string) => {
  const m = url.match(/^\/a\/(\w)\/(.+)\.mp3$/);
  if (!m) return url;
  const kind: Record<string, string> = { l: "", w: "word:", p: "sound:", x: "stretch:", o: "onset:", s: "story:", m: "" };
  return (kind[m[1]] ?? `${m[1]}:`) + m[2];
};
/** target sounds and words (the sfx duck right down under them) */
const isTarget = (url: string) => /^\/a\/[pwxo]\//.test(url);

async function soundtrack(a: {
  entries: any[]; slates: number[]; stopAll: number; t0: number; shift: number; duration: number; music: number; base: string; outDir: string; name: string;
  sfxFiles: Map<string, string>; beep: string;
}) {
  const { entries, t0, shift, duration, music } = a;
  const sec = (t: number) => (t - t0 + shift) / 1000;
  const texts = await lineTexts();
  const stops = new Map<number, number>();
  for (const e of entries) if (e.kind === "stop" && e.sid) stops.set(e.sid, e.t);
  const stopAll = sec(a.stopAll);
  type Clip = { file: string; at: number; len: number; gain: number; stem: "speech" | "music" | "sfx" | "sting" | "slate"; loop?: boolean; fadeIn?: number; fadeOut?: number };
  const clips: Clip[] = [];
  const events: TimelineEvent[] = [];
  const speaking: [number, number][] = [];
  const targets: [number, number][] = [];
  const dur = new Map<string, number>();
  const lengthOf = (f: string) => {
    if (!dur.has(f)) dur.set(f, durationOf(f));
    return dur.get(f)!;
  };
  const sorted = [...entries].sort((x, y) => x.t - y.t);
  for (let n = 0; n < sorted.length; n++) {
    const e = sorted[n];
    const at = sec(e.t);
    if (e.kind === "speech" || e.kind === "sting") {
      const file = await fetchAudio(a.base, e.url, a.outDir);
      if (!file) continue;
      const full = lengthOf(file);
      const cut = e.sid && stops.has(e.sid) ? sec(stops.get(e.sid)!) : Infinity;
      const end = Math.min(at + full, cut, stopAll);
      if (end <= at) continue;
      const id = idOf(e.url);
      if (e.kind === "speech") {
        clips.push({ file, at, len: end - at, gain: 1, stem: "speech", fadeOut: end < at + full ? 0.02 : 0 });
        speaking.push([at, end]);
        if (isTarget(e.url)) targets.push([at, end]);
        const l = texts.get(id);
        events.push({ t: round(at), kind: "speech", id, dur: round(end - at), ...(l ? { text: l.who === "baron" ? `Baron: ${l.text}` : l.text } : {}) });
      } else {
        clips.push({ file, at, len: end - at, gain: Math.min(0.95, music * 2.6), stem: "sting", fadeOut: end < at + full ? 0.3 : 0 });
        events.push({ t: round(at), kind: "sting", id, dur: round(end - at) });
      }
    } else if (e.kind === "sfx") {
      const name = String(e.url).slice(4);
      const file = a.sfxFiles.get(name);
      if (!file || at >= stopAll) continue;
      clips.push({ file, at, len: Math.min(lengthOf(file), stopAll - at), gain: 1, stem: "sfx" });
      events.push({ t: round(at), kind: "sfx", id: name });
    } else if (e.kind === "music") {
      const file = await fetchAudio(a.base, e.url, a.outDir);
      if (!file) continue;
      // it starts when the element really plays; it fades out when the next music starts, or ~1.8 s before the game
      // pauses it (playMusic(null) fades, then pauses), or when the game is left
      const playing = sorted.find((x, k) => k > n && x.kind === "playing" && x.url === e.url && x.t - e.t < 5000);
      const start = playing ? sec(playing.t) : at + 0.15;
      const next = sorted.find((x, k) => k > n && (x.kind === "music" || x.kind === "music-stop"));
      const pause = sorted.find((x, k) => k > n && x.kind === "pause" && x.url === e.url);
      const ends = [stopAll, next ? sec(next.t) + 1.0 : Infinity, pause ? sec(pause.t) - 0.8 : Infinity];
      const end = Math.min(...ends);
      if (end <= start) continue;
      const fadeOut = end === stopAll ? 0.04 : Math.min(1.0, end - start);
      clips.push({ file, at: start, len: end - start, gain: music, stem: "music", loop: true, fadeIn: 1.2, fadeOut });
      events.push({ t: round(start), kind: "music", id: idOf(e.url), dur: round(end - start) });
    } else if (e.kind === "music-stop") {
      events.push({ t: round(at), kind: "music-stop", id: "" });
    } else if (e.kind === "tap") {
      events.push({ t: round(at), kind: "tap", id: e.label ?? "", ...(e.rect ? { text: `rect ${e.rect.map((v: number) => Math.round(v)).join(",")}` } : {}) });
    } else if (e.kind === "scene") {
      events.push({ t: round(at), kind: "scene", id: e.label });
    } else if (e.kind === "mark") {
      events.push({ t: round(at), kind: "mark", id: e.label });
    }
  }
  for (const s of a.slates) {
    clips.push({ file: a.beep, at: sec(s), len: 0.06, gain: 1, stem: "slate" });
    events.push({ t: round(sec(s)), kind: "slate", id: "clap" });
  }
  events.sort((x, y) => x.t - y.t);

  // ducking (the game's mix(): setTargetAtTime τ 0.15 s, here a 0.15 s ramp in and a 0.3 s ramp out)
  const merge = (xs: [number, number][], gap: number) => {
    const s = [...xs].sort((p, q) => p[0] - q[0]);
    const out: [number, number][] = [];
    for (const [x, y] of s) if (out.length && x - out[out.length - 1][1] < gap) out[out.length - 1][1] = Math.max(out[out.length - 1][1], y);
    else out.push([x, y]);
    return out;
  };
  const env = (xs: [number, number][]) => merge(xs, 0.45).map(([x, y]) => `clip((t-${round(x - 0.05)})/0.15,0,1)*clip((${round(y + 0.3)}-t)/0.3,0,1)`).join("+") || "0";
  const speechEnv = env(speaking);
  const duck: Record<Clip["stem"], string> = {
    speech: "",
    slate: "",
    music: `volume='1-0.65*(${speechEnv})':eval=frame`,
    sting: `volume='1-0.72*(${speechEnv})':eval=frame`,
    sfx: `volume='(1-0.5*(${speechEnv}))*(1-0.7*(${env(targets)}))':eval=frame`,
  };

  // one ffmpeg graph: each file once (split as often as it is used), each clip placed to the sample, stems ducked, mixed
  const files = [...new Set(clips.map((c) => c.file))];
  const inputs: string[] = [];
  const graph: string[] = [];
  const branch = new Map<string, string[]>();
  files.forEach((f, i) => {
    const uses = clips.filter((c) => c.file === f);
    if (uses.some((c) => c.loop)) inputs.push("-stream_loop", "-1");
    inputs.push("-i", f);
    const names = uses.map((_, k) => `f${i}_${k}`);
    branch.set(f, names);
    graph.push(`[${i}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,${names.length > 1 ? `asplit=${names.length}` : "anull"}${names.map((x) => `[${x}]`).join("")}`);
  });
  const used = new Map<string, number>();
  const stems: Record<string, string[]> = { speech: [], music: [], sfx: [], sting: [], slate: [] };
  clips.forEach((c, j) => {
    const k = used.get(c.file) ?? 0;
    used.set(c.file, k + 1);
    const skip = Math.max(0, -c.at), len = c.len - skip;
    if (len <= 0) {
      graph.push(`[${branch.get(c.file)![k]}]anullsink`);
      return;
    }
    const f: string[] = [`atrim=start=${round(skip, 4)}:duration=${round(len, 4)}`, "asetpts=PTS-STARTPTS"];
    if (c.fadeIn && skip < c.fadeIn) f.push(`afade=t=in:d=${c.fadeIn}:curve=qsin`);
    if (c.fadeOut) f.push(`afade=t=out:st=${round(Math.max(0, len - c.fadeOut), 4)}:d=${c.fadeOut}`);
    if (c.gain !== 1) f.push(`volume=${round(c.gain, 4)}`);
    f.push(`adelay=${Math.round(Math.max(0, c.at) * 48000)}S:all=1`);
    graph.push(`[${branch.get(c.file)![k]}]${f.join(",")}[c${j}]`);
    stems[c.stem].push(`[c${j}]`);
  });
  const total = round(duration, 4);
  const stemOut: string[] = [];
  for (const [stem, list] of Object.entries(stems)) {
    const pad = `apad=whole_dur=${total},atrim=0:${total}`;
    const mixed = list.length ? `${list.join("")}${list.length > 1 ? `amix=inputs=${list.length}:normalize=0:duration=longest,` : "anull,"}` : `anullsrc=r=48000:cl=stereo,atrim=0:${total},`;
    graph.push(`${mixed}${pad}${duck[stem as Clip["stem"]] ? `,asetnsamples=n=240,${duck[stem as Clip["stem"]]}` : ""}[s_${stem}]`);
    stemOut.push(`[s_${stem}]`);
  }
  graph.push(`${stemOut.join("")}amix=inputs=${stemOut.length}:normalize=0:duration=first[mix]`);
  const audio = join(a.outDir, `${a.name}.master.wav`);
  retire(audio);
  const scriptFile = join(a.outDir, ".work", `${a.name}.soundtrack.filter`);
  writeFileSync(scriptFile, graph.join(";\n"));
  ff([...inputs, "-/filter_complex", scriptFile, "-map", "[mix]", "-t", String(total), "-c:a", "pcm_f32le", "-ar", "48000", audio]);
  return { events, audio };
}

// ------------------------------------------------------------------------------------------------------- trim()
export interface TrimResult {
  mp4: string;
  poster: string;
  duration: number;
  /** measured on the finished file */
  loudness: { I: number; TP: number; LRA: number };
  spec: Record<string, string | number>;
  /** from the master's timeline: a line cut off at either end, a freeze or a clapper inside the window */
  warnings: string[];
}
/** Cut [start, end] seconds of a master into an X-ready MP4: H.264 High yuv420p CRF 18 at 30 fps, AAC-LC 128 kbps
 *  48 kHz, +faststart; loudness normalised to −16 LUFS (true peak ≤ −1.5 dBTP) with 80 ms fades; and a JPG poster
 *  (at `posterAt` seconds into the clip, default a third of the way in). The sound comes from the master's WAV when
 *  it sits beside it (lossless), else from the master itself. */
export function trim(master: string, start: number, end: number, out: string, opts: { posterAt?: number; fadeMs?: number; lufs?: number; crf?: number } = {}): TrimResult {
  // on frame boundaries, so the first frame and the first sample are the same moment
  start = Math.round(start * FPS) / FPS;
  const len = round(Math.round((end - start) * FPS) / FPS, 4);
  if (!(len > 0)) throw new Error(`trim: bad window ${start}–${end}`);
  const wav = master.replace(/\.mp4$/, ".wav");
  const src = existsSync(wav) ? wav : master;
  const target = opts.lufs ?? -16, fade = (opts.fadeMs ?? 80) / 1000;
  mkdirSync(dirname(resolve(out)), { recursive: true });
  // the window, cut in the filter graph (exact to the sample even from the master's AAC, and the fades and meters see
  // the clip's own clock; an -ss after -i would leave them on the source's)
  const cut = ["-i", src];
  const win = `atrim=start=${start}:duration=${len},asetpts=PTS-STARTPTS`;
  // pass 1: how loud is this window?
  const m1 = measure(cut, win);
  const gain = Number.isFinite(m1.I) ? target - m1.I : 0;
  // a true-peak-safe limiter (4× oversampled) before the gain, so the gain can be linear; then the fades
  const chain = (g: number) => `${win},aresample=192000,alimiter=limit=${round(Math.min(1, Math.max(0.0625, 10 ** ((-2.2 - g) / 20))), 5)}:attack=3:release=60:level=0:latency=1,aresample=48000,volume=${round(g, 3)}dB,afade=t=in:d=${fade},afade=t=out:st=${round(len - fade, 4)}:d=${fade}`;
  const audioTmp = join(dirname(resolve(out)), `.${basename(out, ".mp4")}.audio.m4a`);
  const encodeAudio = (g: number) => {
    retire(audioTmp);
    ff([...cut, "-af", chain(g), "-c:a", aacEncoder(), "-b:a", "128k", "-ar", "48000", "-ac", "2", ...(aacEncoder() === "aac_at" ? ["-aac_at_mode", "cbr"] : []), audioTmp]);
    return measure(["-i", audioTmp]);
  };
  let g = gain, m2 = encodeAudio(g);
  // AAC can lift peaks a little, and the limiter can cost loudness: one correction pass
  const fix = Math.min(target - m2.I, -1.5 - m2.TP);
  if (Math.abs(target - m2.I) > 0.5 || m2.TP > -1.5) {
    g += fix;
    m2 = encodeAudio(g);
  }
  retire(out);
  ff(["-ss", String(start), "-t", String(len), "-i", master, "-i", audioTmp, "-map", "0:v", "-map", "1:a",
    "-vf", `fps=${FPS},format=yuv420p,${TAG_709_VF}`, "-c:v", "libx264", "-profile:v", "high", "-level:v", "4.1", "-preset", "slow", "-crf", String(opts.crf ?? 18), "-pix_fmt", "yuv420p",
    "-g", String(FPS * 2), "-bf", "2", ...TAG_709, "-c:a", "copy", "-shortest", "-movflags", "+faststart", out]);
  retire(audioTmp);
  const poster = out.replace(/\.mp4$/, ".jpg");
  retire(poster);
  ff(["-ss", String(opts.posterAt ?? round(len / 3, 3)), "-i", out, "-frames:v", "1", "-q:v", "2", poster]);
  const warnings: string[] = [];
  const tlFile = master.replace(/\.master\.mp4$/, ".timeline.json");
  if (tlFile !== master && existsSync(tlFile)) {
    const end2 = start + len;
    for (const e of JSON.parse(readFileSync(tlFile, "utf8")).events as TimelineEvent[]) {
      const e1 = e.t + (e.dur ?? 0);
      if (e.kind === "speech" && e.t < start - 0.02 && e1 > start + 0.02) warnings.push(`starts in the middle of ${e.id} (${e.t}–${round(e1)} s)`);
      if (e.kind === "speech" && e.t < end2 - 0.02 && e1 > end2 + 0.02) warnings.push(`ends in the middle of ${e.id} (${e.t}–${round(e1)} s)`);
      if ((e.kind === "hitch" || e.kind === "slate") && e.t >= start && e.t < end2) warnings.push(`${e.kind === "hitch" ? `a ${e.id} freeze` : "the clapper"} at ${e.t} s`);
    }
  }
  if (warnings.length) console.warn(`[tweet-clips] trim ${basename(out)}: ${warnings.join("; ")}`);
  const p = probe(out);
  const v = p.streams.find((s: any) => s.codec_type === "video"), au = p.streams.find((s: any) => s.codec_type === "audio");
  const spec = {
    video: `${v.codec_name} ${v.profile} ${v.pix_fmt} ${v.width}x${v.height} ${v.r_frame_rate}`,
    audio: `${au.codec_name} ${au.profile} ${au.sample_rate} Hz ${au.channels}ch ${Math.round(Number(au.bit_rate) / 1000)} kb/s`,
    sizeMB: round(Number(p.format.size) / 1e6, 2),
  };
  return { mp4: out, poster, duration: round(Number(p.format.duration)), loudness: m2, spec, warnings };
}
/** Integrated loudness, true peak and loudness range (EBU R128), after an optional filter (e.g. the window). */
function measure(input: string[], pre?: string): { I: number; TP: number; LRA: number } {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...input, "-vn", "-af", `${pre ? pre + "," : ""}ebur128=peak=true:framelog=quiet`, "-f", "null", "-"], { maxBuffer: 1 << 28 });
  const s = r.stderr.toString();
  const sum = s.slice(s.lastIndexOf("Summary:"));
  const num = (re: RegExp) => Number(sum.match(re)?.[1]);
  return { I: num(/I:\s+(-?[\d.]+|-inf) LUFS/), TP: num(/Peak:\s+(-?[\d.]+|-inf) dBFS/), LRA: num(/LRA:\s+(-?[\d.]+) LU/) };
}

// ------------------------------------------------------------------------------------------------ contactSheet()
/** A contact sheet of `file`: a frame every `everySec` seconds, six across, each labelled with its time and (for a
 *  master, from its timeline) what is said or tapped then. Returns the JPG's path (<file>.sheet.jpg). */
export function contactSheet(file: string, everySec = 1, out?: string): string {
  const d = durationOf(file);
  const sheet = out ?? file.replace(/(\.master)?\.mp4$/, ".sheet.jpg");
  const tl = file.replace(/\.master\.mp4$/, ".timeline.json");
  const events: TimelineEvent[] = file.endsWith(".master.mp4") && existsSync(tl) ? JSON.parse(readFileSync(tl, "utf8")).events : [];
  const n = Math.max(1, Math.floor(d / everySec + 1e-6));
  const tw = 320, th = 180;
  const r = run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, "-vf", `fps=1/${everySec}:round=down,scale=${tw}:${th}:flags=bicubic,format=rgb24`, "-frames:v", String(n), "-f", "rawvideo", "pipe:1"]);
  const frames = Math.floor(r.stdout.length / (tw * th * 3));
  const labels = Array.from({ length: frames }, (_, k) => {
    const t = k * everySec;
    const said = events.filter((e) => e.t >= t && e.t < t + everySec && ["speech", "tap", "scene", "mark", "sting", "hitch"].includes(e.kind))
      .map((e) => (e.kind === "speech" ? `“${(e.text ?? e.id).slice(0, 40)}”` : e.kind === "tap" ? `tap ${e.id}` : e.kind === "hitch" ? `FREEZE ${e.id}` : `${e.kind} ${e.id}`))
      .sort((x, y) => Number(y.startsWith("FREEZE")) - Number(x.startsWith("FREEZE"))).slice(0, 2);
    return [`${t.toFixed(1)}s`, ...said].join("  ");
  });
  retire(sheet);
  const py = `
import sys, json
from PIL import Image, ImageDraw, ImageFont
raw = sys.stdin.buffer.read(); tw, th, n, cols = ${tw}, ${th}, ${frames}, 6
labels = json.loads(sys.argv[2]); rows = (n + cols - 1) // cols; lh = 30
sheet = Image.new("RGB", (cols * tw, rows * (th + lh)), (24, 22, 30)); d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 11)
except Exception: font = ImageFont.load_default()
for k in range(n):
    im = Image.frombytes("RGB", (tw, th), raw[k*tw*th*3:(k+1)*tw*th*3]); x, y = (k % cols) * tw, (k // cols) * (th + lh)
    sheet.paste(im, (x, y)); lab = labels[k]
    d.text((x + 4, y + th + 2), lab[:58], fill=(235, 235, 235), font=font); d.text((x + 4, y + th + 15), lab[58:116], fill=(180, 180, 190), font=font)
sheet.save(sys.argv[1], quality=85)
`;
  run("python3", ["-c", py, sheet, JSON.stringify(labels)], r.stdout);
  return sheet;
}

// ------------------------------------------------------------------------------------------------------------ CLI
if (import.meta.main) {
  const [cmd, ...a] = process.argv.slice(2);
  if (cmd === "record") {
    const r = await record({ name: a[0], url: a[1], seconds: Number(a[2]), outDir: a[3] });
    console.log(JSON.stringify({ ...r, events: `${r.events.length} events` }, null, 1));
  } else if (cmd === "trim") {
    console.log(JSON.stringify(trim(a[0], Number(a[1]), Number(a[2]), a[3], a[4] ? { posterAt: Number(a[4]) } : {}), null, 1));
  } else if (cmd === "sheet") {
    console.log(contactSheet(a[0], a[1] ? Number(a[1]) : 1));
  } else {
    console.log("usage: bun scripts/tweet-clips.ts record <name> <url> <seconds> <outDir> | trim <master.mp4> <start> <end> <out.mp4> [posterAt] | sheet <file.mp4> [everySec]");
  }
  process.exit(0); // (a browser that never finished closing would keep bun alive)
}
