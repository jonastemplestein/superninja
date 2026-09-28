// Film the read slider's harness (playtest/read-slider/, a frozen build served by serve.ts) at 844×390 with REAL touch
// drags (CDP Input.dispatchTouchEvent: touchStart, a touchMove every 16 ms, touchEnd), playing as a child would:
//   · `__snState.next === "drag"` and Sensei quiet → drag the tortoise from the start dot to the end at the run's speed
//     (slow 3.2 s, normal 1.3 s, fast 0.18 s: a flick); the "wrong" case first swipes backwards (right to left), then
//     pulls the tortoise back across what it has read, then slides it the right way;
//   · `next === "rabbit"` → tap the rabbit about a second after Sensei stops; a held ▶ → tap it after a second.
// The picture is a CDP screencast (JPEG), rebuilt at 30 fps from the frames' own timestamps; the sound is the harness's
// real speech rebuilt from its audio log (every clip at the time it started, cut where it was stopped, the slow words'
// slices by their own offsets), muxed in. Writes docs/read-slider/videos/<case>-<speed>.mp4, a contact sheet (.jpg) and
// a log (.json: the drags, the taps, the slider's events and every clip heard).
//   bun playtest/read-slider/record.ts <compound|sounds|wrong> <slow|normal|fast> [--port 4971] [--max 120]
import { chromium, type CDPSession, type Page } from "playwright";
import { mkdirSync, writeFileSync, existsSync, renameSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

const ROOT = resolve(import.meta.dir, "../..");
const args = process.argv.slice(2);
const [cse = "compound", speed = "normal"] = args.filter((a, i) => !a.startsWith("--") && !["--port", "--max"].includes(args[i - 1]));
const port = Number(args.includes("--port") ? args[args.indexOf("--port") + 1] : 4971);
const maxS = Number(args.includes("--max") ? args[args.indexOf("--max") + 1] : 150);
const DRAG_MS: Record<string, number> = { slow: 3200, normal: 1300, fast: 180 };
const OUT = join(ROOT, "docs/read-slider/videos");
mkdirSync(OUT, { recursive: true });
const name = `${cse}-${speed}`;
const work = join(tmpdir(), `rs-rec-${name}-${Date.now()}`);
mkdirSync(join(work, "f"), { recursive: true });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const events: Record<string, unknown>[] = [];
const t0 = Date.now();
const mark = (e: Record<string, unknown>) => (events.push({ t: (Date.now() - t0) / 1000, ...e }), console.log(((Date.now() - t0) / 1000).toFixed(2), JSON.stringify(e)));

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, deviceScaleFactor: 2 });
await ctx.addInitScript(() => {
  // the audio log, with each clip's real start, offset, length and stop (hush) from its AudioBufferSourceNode
  const AB = AudioBufferSourceNode.prototype as any;
  const st = AB.start, sp = AB.stop;
  let last: any = null;
  AB.start = function (when = 0, offset = 0, dur?: number) {
    this.__rec = { t: Date.now(), offset, dur: dur ?? null, rate: this.playbackRate.value, stopT: null };
    last = this;
    return st.apply(this, arguments as any);
  };
  AB.stop = function () {
    if (this.__rec && this.__rec.stopT == null) this.__rec.stopT = Date.now();
    return sp.apply(this, arguments as any);
  };
  const log: any[] = [];
  log.push = function (e: any) {
    if (last?.__rec && !last.__rec.url) {
      last.__rec.url = e.url;
      e.rec = last.__rec;
    }
    return Array.prototype.push.call(this, e);
  };
  (window as any).__audioLog = log;
});
const page = await ctx.newPage();
page.on("pageerror", (e) => mark({ kind: "pageerror", msg: e.message }));
page.on("response", (r) => r.status() >= 400 && mark({ kind: "http", status: r.status(), url: r.url() }));
const cdp: CDPSession = await ctx.newCDPSession(page);

// ---- the picture: a screencast, every frame kept with its own timestamp
const frames: { t: number; file: string }[] = [];
cdp.on("Page.screencastFrame", async (f: any) => {
  const file = join(work, "f", `${String(frames.length).padStart(6, "0")}.jpg`);
  writeFileSync(file, Buffer.from(f.data, "base64"));
  frames.push({ t: f.metadata.timestamp * 1000, file });
  try {
    await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId });
  } catch {}
});

// ---- touch, in stage px
async function toPage(x: number, y: number) {
  return page.evaluate(([x, y]) => {
    const s = document.querySelector(".stage")!.getBoundingClientRect();
    const k = s.width / 1280;
    return { x: s.left + x * k, y: s.top + y * k };
  }, [x, y] as const);
}
const touch = (type: string, pts: { x: number; y: number }[]) =>
  cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts.map((p) => ({ x: p.x, y: p.y, id: 1, radiusX: 11, radiusY: 11, force: 1 })) } as any);
/** A real finger: down at (x0,y), moving to (x1,y) over ms (with a little wobble), up. The moves are paced by the wall
 *  clock (each touchMove goes where the finger would be by now), so a loaded machine sends fewer moves rather than a
 *  slower drag; the stage's rect is read once. `back`: then pulled back left that far over 320 ms. */
async function drag(x0: number, x1: number, y: number, ms: number, why: string, o: { back?: number } = {}) {
  const rect = await page.evaluate(() => {
    const s = document.querySelector(".stage")!.getBoundingClientRect();
    return { l: s.left, t: s.top, k: s.width / 1280 };
  });
  const P = (x: number, yy: number) => ({ x: rect.l + x * rect.k, y: rect.t + yy * rect.k });
  const t0 = Date.now();
  await touch("touchStart", [P(x0, y)]);
  let k = 0;
  const glide = async (from: number, to: number, dur: number) => {
    const s0 = Date.now();
    for (;;) {
      const f = Math.min(1, (Date.now() - s0) / dur);
      const wob = Math.sin(k++ * 0.7) * 9; // a small child's finger wanders up and down
      await touch("touchMove", [P(from + (to - from) * f, y + wob)]);
      if (f >= 1) break;
      await sleep(16);
    }
  };
  await glide(x0, x1, ms);
  if (o.back) await glide(x1, x1 - o.back, 320);
  await touch("touchEnd", []);
  mark({ kind: "drag", why, x0: Math.round(x0), x1: Math.round(x1), ms, back: o.back, realMs: Date.now() - t0, moves: k });
}
async function tapStage(x: number, y: number, why: string) {
  mark({ kind: "tap", why });
  const p = await toPage(x, y);
  await touch("touchStart", [p]);
  await sleep(70);
  await touch("touchEnd", []);
}
async function tapSel(sel: string, why: string) {
  const r = await page.locator(sel).first().boundingBox();
  if (!r) return false;
  mark({ kind: "tap", why });
  await touch("touchStart", [{ x: r.x + r.width / 2, y: r.y + r.height / 2 }]);
  await sleep(70);
  await touch("touchEnd", []);
  return true;
}

await page.goto(`http://127.0.0.1:${port}/?case=${cse}`);
await page.waitForSelector("[data-start]");
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 88, maxWidth: 1688, maxHeight: 780, everyNthFrame: 1 });
await sleep(700);
const videoT0 = Date.now();
await tapSel("[data-start]", "start");

// ---- play as a child would
let drags = 0;
let quietSince = 0;
const deadline = Date.now() + maxS * 1000;
while (Date.now() < deadline) {
  await sleep(120);
  const s: any = await page.evaluate(() => ({ st: (window as any).__snState, nav: (window as any).__snNav, done: (window as any).__rsDone, talking: !!document.querySelector(".help-btn.talking") })).catch(() => null);
  if (!s) continue;
  if (s.done) {
    await sleep(2500);
    break;
  }
  const st = s.st;
  const quiet = !s.talking && !(st?.busy);
  if (!quiet) quietSince = 0;
  else if (!quietSince) quietSince = Date.now();
  const calm = quietSince && Date.now() - quietSince > 700;
  if (s.nav?.next === "ready" && calm) {
    await sleep(600);
    await tapSel('[data-nav="next"]', "ready ▶");
    quietSince = 0;
    continue;
  }
  if (st?.scene !== "slider") continue;
  if (st.next === "rabbit" && calm) {
    await sleep(500);
    await tapStage(st.rabbit.x, st.rabbit.y, "rabbit");
    quietSince = 0;
    continue;
  }
  // a child waits for Sensei's hand-over before sliding: 1.3 s of quiet (the harness says it about 1 s after a slider
  // mounts, so 0.7 s let the finger in under the line's first word)
  if (st.next === "drag" && calm && Date.now() - quietSince > 1300 && st.phase === "idle") {
    const y = st.from.y + 6;
    if (cse === "wrong" && drags === 0) await drag(st.to.x - 20, st.from.x + 120, y, 700, "backwards: a swipe from the right to the left");
    else if (cse === "wrong" && drags === 1) await drag(st.from.x, st.from.x + 250, y, 900, "the tortoise pulled back across what it has read", { back: 200 });
    else await drag(st.from.x, st.to.x, y, DRAG_MS[speed] ?? 1300, `a ${speed} slide`);
    drags++;
    quietSince = 0;
  }
}
await cdp.send("Page.stopScreencast").catch(() => {});
const page_ = await page.evaluate(() => ({ audio: (window as any).__audioLog, rs: (window as any).__rsLog, nav: (window as any).__snNavLog }));
await b.close();

// ---- the picture at 30 fps (each frame held until the next one arrived)
const list = frames.filter((f) => f.t >= videoT0 - 200);
const cc = list.map((f, i) => `file '${f.file}'\nduration ${(((list[i + 1]?.t ?? f.t + 33) - f.t) / 1000).toFixed(4)}`).join("\n") + `\nfile '${list.at(-1)!.file}'\n`;
writeFileSync(join(work, "frames.txt"), "ffconcat version 1.0\n" + cc);
const vStart = list[0].t;
const run = (a: string[]) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(r.stderr.toString().slice(-1500));
};
const silent = join(work, "video.mp4");
run(["-f", "concat", "-safe", "0", "-i", join(work, "frames.txt"), "-vf", "fps=30,scale=1688:780:flags=lanczos,format=yuv420p", "-c:v", "libx264", "-crf", "20", "-preset", "medium", silent]);

// ---- the soundtrack: every speech clip at its start, from its offset, cut at its stop
type Clip = { url: string; rec?: { t: number; offset: number; dur: number | null; rate: number; stopT: number | null } };
const clips = ((page_.audio ?? []) as Clip[]).filter((c) => c.rec && c.url);
const inputs: string[] = [];
const filters: string[] = [];
clips.forEach((c, i) => {
  const path = join(ROOT, "public", c.url.replace(/#.*$/, "").replace(/\?.*$/, ""));
  if (!existsSync(path)) return;
  const r = c.rec!;
  const at = Math.max(0, r.t - vStart);
  const len = Math.min(r.dur ?? 99, r.stopT ? (r.stopT - r.t) / 1000 : 99);
  inputs.push("-i", path);
  const k = inputs.length / 2 - 1;
  filters.push(`[${k}:a]atrim=start=${r.offset}:duration=${len.toFixed(3)},asetpts=PTS-STARTPTS,aresample=44100,adelay=${Math.round(at)}|${Math.round(at)}[a${k}]`);
});
const n = inputs.length / 2;
const master = join(OUT, `${name}.mp4`);
if (existsSync(master)) {
  mkdirSync(join(ROOT, ".trash/read-slider-videos"), { recursive: true });
  renameSync(master, join(ROOT, ".trash/read-slider-videos", `${Date.now()}-${name}.mp4`));
}
if (n) {
  const mix = `${filters.join(";")};${Array.from({ length: n }, (_, k) => `[a${k}]`).join("")}amix=inputs=${n}:normalize=0:dropout_transition=0,alimiter=limit=0.95[mix]`;
  writeFileSync(join(work, "mix.txt"), mix);
  run([...inputs, "-/filter_complex", join(work, "mix.txt"), "-map", "[mix]", "-ac", "1", "-ar", "44100", join(work, "mix.wav")]);
  run(["-i", silent, "-i", join(work, "mix.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", master]);
} else run(["-i", silent, "-c", "copy", master]);
// a contact sheet: a frame every 1.5 s, 6 across
run(["-i", master, "-vf", "fps=1/1.5,scale=422:-1,tile=6x8:padding=4", "-frames:v", "1", "-q:v", "3", join(OUT, `${name}.jpg`)]);
writeFileSync(join(OUT, `${name}.json`), JSON.stringify({ case: cse, speed, videoStart: vStart, frames: list.length, events, slider: page_.rs, nav: page_.nav?.slice(-60), clips: clips.map((c) => ({ url: c.url, at: ((c.rec!.t - vStart) / 1000).toFixed(2), offset: c.rec!.offset, dur: c.rec!.dur, cut: c.rec!.stopT ? ((c.rec!.stopT - c.rec!.t) / 1000).toFixed(2) : null })) }, null, 1));
console.log("→", master, `${list.length} frames, ${n} clips`);
process.exit(0);
