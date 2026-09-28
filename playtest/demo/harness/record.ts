// Film Sensei's demo harness (playtest/demo/harness/, a frozen build served by serve.ts) at 844×390 in a touch browser,
// at real speed, playing as a child would: watch the demo; at the Ready hold wait a moment and tap ▶ (or, with
// --replay, first tap the paw once: Show me again, then ▶); at "Can you find the sock?" tap the sock. With --taps, a busy
// child: it also taps the sausage while the sun is named, the sun during the rule and the sock while the paw flies (the
// cards are live throughout: each lights at once, says its word at Sensei's next pause, and the demo carries on).
// The picture is a CDP screencast (JPEG), rebuilt at 30 fps from the frames' own timestamps; the sound is the harness's
// real speech rebuilt from its audio log (every clip at the time it started, cut where it was stopped), muxed in.
// Writes docs/demo-choreography/harness/<name>.mp4, a contact sheet (<name>.jpg: a frame every 0.5 s through the demo),
// and <name>.json: the timeline (Sensei's clips, the demo's steps, the harness's moments, the taps) on one clock, in ms
// from the rule's first word.
//   bun playtest/demo/harness/record.ts [--port 4981] [--replay | --taps] [--name find-the-sausage] [--max 120]
import { chromium, type CDPSession } from "playwright";
import { mkdirSync, writeFileSync, existsSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

const ROOT = resolve(import.meta.dir, "../../..");
const args = process.argv.slice(2);
const arg = (k: string, d: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const port = Number(arg("--port", "4981"));
const maxS = Number(arg("--max", "120"));
const replay = args.includes("--replay");
const busy = args.includes("--taps");
const name = arg("--name", replay ? "find-the-sausage-replay" : busy ? "find-the-sausage-taps" : "find-the-sausage");
const OUT = join(ROOT, "docs/demo-choreography/harness");
mkdirSync(OUT, { recursive: true });
const work = join(tmpdir(), `sd-rec-${name}-${Date.now()}`);
mkdirSync(join(work, "f"), { recursive: true });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const taps: { t: number; why: string }[] = [];
const t0 = Date.now();
const mark = (why: string) => (taps.push({ t: Date.now(), why }), console.log(((Date.now() - t0) / 1000).toFixed(2), why));

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
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
page.on("pageerror", (e) => console.log("pageerror", e.message));
page.on("console", (m) => m.type() === "error" && console.log("console", m.text()));
page.on("response", (r) => r.status() >= 400 && !r.url().endsWith(".words.json") && console.log("http", r.status(), r.url()));
const cdp: CDPSession = await ctx.newCDPSession(page);

const frames: { t: number; file: string }[] = [];
cdp.on("Page.screencastFrame", async (f: any) => {
  const file = join(work, "f", `${String(frames.length).padStart(6, "0")}.jpg`);
  writeFileSync(file, Buffer.from(f.data, "base64"));
  frames.push({ t: f.metadata.timestamp * 1000, file });
  try {
    await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId });
  } catch {}
});
const touch = (type: string, pts: { x: number; y: number }[]) =>
  cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts.map((p) => ({ x: p.x, y: p.y, id: 1, radiusX: 11, radiusY: 11, force: 1 })) } as any);
async function tapSel(sel: string, why: string) {
  const r = await page.locator(sel).first().boundingBox();
  if (!r) return false;
  mark(why);
  await touch("touchStart", [{ x: r.x + r.width / 2, y: r.y + r.height / 2 }]);
  await sleep(70);
  await touch("touchEnd", []);
  return true;
}

await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForSelector("[data-start]");
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 88, maxWidth: 1688, maxHeight: 780, everyNthFrame: 1 });
await sleep(700);
const videoT0 = Date.now();
await tapSel("[data-start]", "start");

let quietSince = 0;
let showed = false;
/** --taps: the early taps still to make (each once), and when the page's own moment for each was first seen */
const early: { key: string; card: string; after: number; seen: number; done: boolean; why: string }[] = busy
  ? [
      { key: "names", card: "sausage", after: 1300, seen: 0, done: false, why: "the sausage, while the sun is named" },
      { key: "rule", card: "sun", after: 1600, seen: 0, done: false, why: "the sun, during the rule" },
      { key: "fly", card: "sock", after: 350, seen: 0, done: false, why: "the sock, while the paw flies" },
    ]
  : [];
const deadline = Date.now() + maxS * 1000;
while (Date.now() < deadline) {
  await sleep(120);
  const s: any = await page.evaluate(() => ({ st: (window as any).__snState, nav: (window as any).__snNav, done: (window as any).__demoDone, talking: !!document.querySelector(".help-btn.talking") })).catch(() => null);
  if (!s) continue;
  if (early.length) {
    const m: any = await page.evaluate(() => ({ log: (window as any).__demoLog ?? [], st: (window as any).__snState })).catch(() => null);
    const at: Record<string, boolean> = {
      names: !!m?.log?.some((e: any) => e.step === "cards"),
      rule: m?.st?.scene === "demo" && m.st.step === "rule",
      fly: m?.st?.scene === "demo" && m.st.step === "fly",
    };
    for (const e of early) {
      if (e.done) continue;
      if (!e.seen && at[e.key]) e.seen = Date.now();
      if (e.seen && Date.now() - e.seen >= e.after) {
        e.done = true;
        await tapSel(`.demo-row [data-pic="${e.card}"]`, `early tap: ${e.why}`);
      }
    }
  }
  if (s.done) {
    await sleep(2000);
    break;
  }
  const quiet = !s.talking && !s.st?.busy;
  const calmNav = !s.talking;
  if (!calmNav) quietSince = 0;
  else if (!quietSince) quietSince = Date.now();
  const calm = quietSince && Date.now() - quietSince > 900;
  if (s.nav?.next === "ready" && calm) {
    await sleep(700);
    if (replay && !showed) {
      showed = true;
      await tapSel('[data-nav="show"]', "the paw (Show me again)");
    } else await tapSel('[data-nav="next"]', "ready ▶");
    quietSince = 0;
    continue;
  }
  if (s.st?.scene === "demo-harness" && s.st.next === "sock" && quiet && calm) {
    await sleep(600);
    await tapSel('.demo-row [data-pic="sock"]', "the sock");
    quietSince = 0;
  }
}
await cdp.send("Page.stopScreencast").catch(() => {});
const got = await page.evaluate(() => ({ origin: performance.timeOrigin, audio: (window as any).__audioLog, demo: (window as any).__snDemoLog, harness: (window as any).__demoLog, nav: (window as any).__snNavLog }));
// the sound effects the page played, rendered by the build itself (for the soundtrack)
const sfxPlayed = ((got.audio ?? []) as { t: number; url: string; kind: string }[]).filter((e) => e.kind === "sfx");
const sfxFiles = new Map<string, string>();
for (const nm of new Set(sfxPlayed.map((e) => e.url.slice(4)))) {
  try {
    const bytes: number[] = await page.evaluate((n) => (window as any).__renderSfx(n), nm);
    const f = join(work, `sfx-${nm}.wav`);
    writeFileSync(f, Buffer.from(bytes));
    sfxFiles.set(nm, f);
  } catch {}
}
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

// ---- the soundtrack: every clip at its start, from its offset, cut at its stop (speech and sound effects)
type Rec = { t: number; offset: number; dur: number | null; rate: number; stopT: number | null };
type Clip = { url: string; rec?: Rec };
const clips = ((got.audio ?? []) as Clip[]).filter((c) => c.rec && c.url && !c.url.startsWith("sfx:"));
const inputs: string[] = [];
const filters: string[] = [];
for (const c of clips) {
  const path = join(ROOT, "public", c.url.replace(/#.*$/, "").replace(/\?.*$/, ""));
  if (!existsSync(path)) continue;
  const r = c.rec!;
  const at = Math.max(0, r.t - vStart);
  const len = Math.min(r.dur ?? 99, r.stopT ? (r.stopT - r.t) / 1000 : 99);
  inputs.push("-i", path);
  const k = inputs.length / 2 - 1;
  filters.push(`[${k}:a]atrim=start=${r.offset}:duration=${len.toFixed(3)},asetpts=PTS-STARTPTS,aresample=44100,adelay=${Math.round(at)}|${Math.round(at)}[a${k}]`);
}
for (const e of sfxPlayed) {
  const f = sfxFiles.get(e.url.slice(4));
  if (!f) continue;
  const at = Math.max(0, e.t - vStart);
  inputs.push("-i", f);
  const k = inputs.length / 2 - 1;
  filters.push(`[${k}:a]aresample=44100,volume=0.5,adelay=${Math.round(at)}|${Math.round(at)}[a${k}]`);
}
const n = inputs.length / 2;
const master = join(OUT, `${name}.mp4`);
if (existsSync(master)) {
  mkdirSync(join(ROOT, ".trash/demo-harness"), { recursive: true });
  renameSync(master, join(ROOT, ".trash/demo-harness", `${Date.now()}-${name}.mp4`));
}
if (n) {
  const mix = `${filters.join(";")};${Array.from({ length: n }, (_, k) => `[a${k}]`).join("")}amix=inputs=${n}:normalize=0:dropout_transition=0,alimiter=limit=0.95[mix]`;
  writeFileSync(join(work, "mix.txt"), mix);
  run([...inputs, "-/filter_complex", join(work, "mix.txt"), "-map", "[mix]", "-ac", "1", "-ar", "44100", join(work, "mix.wav")]);
  run(["-i", silent, "-i", join(work, "mix.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", master]);
} else run(["-i", silent, "-c", "copy", master]);

// ---- the timeline, on one clock (ms from the rule's first word; the video's own time in brackets)
const perf = (t: number) => got.origin + t; // performance.now() → Date.now()
const clipName = (u: string) => u.replace(/^\/a\/[a-z]\//, "").replace(/\.mp3$/, "");
const rows: { t: number; what: string; kind: string }[] = [];
const lenOf = (u: string) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", join(ROOT, "public", u)], { encoding: "utf8" });
  return Number(r.stdout.trim()) || 0;
};
for (const c of clips) {
  const len = lenOf(c.url);
  const heard = c.rec!.stopT ? (c.rec!.stopT - c.rec!.t) / 1000 : len;
  rows.push({ t: c.rec!.t, kind: "say", what: `${clipName(c.url)} (${len.toFixed(2)} s${heard < len - 0.08 ? `, cut at ${heard.toFixed(2)} s` : ""})` });
}
for (const e of (got.demo ?? []) as { t: number; id: string; step: string; i: number }[]) rows.push({ t: perf(e.t), kind: "demo", what: `${e.step}${e.i ? ` #${e.i}` : ""}` });
for (const e of (got.harness ?? []) as { t: number; step: string }[]) rows.push({ t: perf(e.t), kind: "harness", what: e.step });
for (const e of taps) rows.push({ t: e.t, kind: "tap", what: e.why });
for (const e of sfxPlayed) rows.push({ t: e.t, kind: "sfx", what: e.url.slice(4) });
rows.sort((a, b) => a.t - b.t);
const rule = clips.find((c) => c.url.includes("tv_demo_rule_find_sausage"));
const zero = rule ? rule.rec!.t : vStart;
const timeline = rows.map((r) => ({ ms: Math.round(r.t - zero), video: +((r.t - vStart) / 1000).toFixed(2), kind: r.kind, what: r.what }));
writeFileSync(join(OUT, `${name}.json`), JSON.stringify({ name, replay, frames: list.length, clips: clips.length, videoStart: vStart, ruleAt: +((zero - vStart) / 1000).toFixed(2), timeline }, null, 1));
// a contact sheet through the demo: a frame every 0.5 s from the rule to 16 s after it, 8 across
const from = Math.max(0, (zero - vStart) / 1000 - 0.5);
run(["-ss", from.toFixed(2), "-t", "16", "-i", master, "-vf", "fps=2,scale=420:-1,tile=8x4:padding=4", "-frames:v", "1", "-q:v", "3", join(OUT, `${name}.jpg`)]);
console.log("→", master, `${list.length} frames, ${n} clips; the rule at ${((zero - vStart) / 1000).toFixed(2)} s`);
process.exit(0);
