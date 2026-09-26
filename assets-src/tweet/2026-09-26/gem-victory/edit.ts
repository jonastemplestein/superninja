// The hand cut of the "gem-victory" tweet clip (26 Sep 2026), from one take filmed by drive.ts (--noshake).
//
//   bun assets-src/tweet/2026-09-26/gem-victory/edit.ts <take> [--poster <s>] [--nocaps]
//
// Writes assets-src/tweet/2026-09-26/gem-victory.mp4 + .jpg (captions burnt in); with --nocaps,
// gem-victory/alt/gem-victory-clean.mp4 + .jpg + .srt instead. Intermediate files go to gem-victory/work/.
// Used for the tweet: `edit.ts take4-noshake --poster 5.6`.
//
// Two pieces of the take, joined with a hard cut:
//   A  the win: from the first frame of "You won the gem! It's going into its petal!" (the celebration fading up
//      from dark) through the gem's dive into its petal, the burst and the bloom on the victory sting, to just after
//      "Look! Your new gem goes here, in its petal." (before Sensei's next line, and before the word cards pop in).
//   B  the homecoming: from the gong and "All the gems are in! The petal flies back onto the World Flower!" (the
//      picture cuts in as the word cards clear and the big World Flower grows in), the petal's flight and landing, the
//      bloom and the ninja's celebration, to just after the line ends.
// The sound cuts two frames before the picture (a J-cut): the gong lands on the cut, and nothing is clipped.
//
// On top of the take:
// - the game's screen shake, put back (the take films with it off, see drive.ts --noshake): styles.css
//   @keyframes screenshake, 0.4 s, `ease` between keyframes, on the whole stage, the edges showing the viewport's
//   #1d1230 behind it;
// - captions: the World Flower hides Sensei's caption bubble (Tree.tsx <SenseiDock hidden />), and X plays muted, so
//   the lines are burnt in, in the game's own bubble style (styles.css .bubble: cream, ink border, Baloo 2), with its
//   pop-in, bottom centre (clear of the ninja, the petal and the flower), for as long as each line is said;
// - the sound 30 ms later than the rig's alignment: the rig lines the sound up with the median picture delay of all
//   its claps, but the celebration draws slower than the calm scene at the tail (claps over the celebration: sound
//   39 ms early; the dive's burst and the ninja's landing flash on the take: 10 to 45 ms early).
// Then scripts/tweet-clips.ts trim() makes the X file: H.264 High yuv420p 30 fps, AAC 128k, -16 LUFS, faststart.
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import { existsSync, linkSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { trim, type TimelineEvent } from "../../../../scripts/tweet-clips";

const DIR = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/assets-src/tweet/2026-09-26";
const RAW = join(DIR, "gem-victory", "raw");
const WORK = join(DIR, "gem-victory", "work");
const TRASH = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/.trash/tweet-gem-victory";
const FPS = 30, W = 1280, H = 720;
/** extra audio delay (s), see above */
const D = 0.03;
/** the J-cut: the sound of B starts this many frames before its picture */
const LEAD_FRAMES = 2;

const args = process.argv.slice(2);
const take = args.find((a) => !a.startsWith("--")) ?? "take4-noshake";
const opt = (k: string) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : undefined;
};
const master = join(RAW, `${take}.master.mp4`);
const tl = JSON.parse(readFileSync(join(RAW, `${take}.timeline.json`), "utf8"));
const ev: TimelineEvent[] = tl.events;

const run = (cmd: string, a: string[]) => {
  const r = spawnSync(cmd, a, { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`${cmd} ${a.slice(0, 8).join(" ")}…\n${r.stderr?.toString().slice(-3000)}`);
  return r.stdout.toString();
};
const ff = (a: string[]) => run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a]);
/** move aside, never delete */
const retire = (f: string) => {
  if (!existsSync(f)) return;
  mkdirSync(TRASH, { recursive: true });
  renameSync(f, join(TRASH, `${new Date().toISOString().replace(/[:.]/g, "-")}-${f.split("/").pop()}`));
};
const fr = (t: number) => Math.round(t * FPS); // frame index at time t
const r3 = (x: number) => Math.round(x * 1000) / 1000;
const speech = (id: string, after = 0) => {
  const e = ev.find((x) => x.kind === "speech" && x.id === id && x.t >= after);
  if (!e) throw new Error(`${take}: no ${id} after ${after}`);
  return e;
};

// ------------------------------------------------------------------ the cut (frame indices on the master)
const won = speech("trial_win"), here = speech("wf_new_gem_here"), another = speech("t_another_way", here.t);
const ways = speech("t_ways_2"), complete = speech("petal_complete", ways.t);
// A: from the last frame before the line (and the sting) starts, to 0.08 s before Sensei's next line
const a0 = opt("--a0") ? fr(Number(opt("--a0"))) : Math.floor((won.t - 0.005) * FPS);
const a1 = opt("--a1") ? fr(Number(opt("--a1"))) : Math.floor((another.t - 0.08) * FPS);
// B: the picture from the first frame without the word cards (they clear ~2 frames after the gong); to 0.4 s after
// the line ends
const b0 = opt("--b0") ? fr(Number(opt("--b0"))) : Math.ceil((complete.t + 0.045) * FPS);
const b1 = opt("--b1") ? fr(Number(opt("--b1"))) : Math.ceil((complete.t + (complete.dur ?? 4.36) + 0.4) * FPS);
const lenA = (a1 - a0) / FPS, lenB = (b1 - b0) / FPS, total = lenA + lenB;
const L = LEAD_FRAMES / FPS;
// the sound: master audio time for each piece (picture time − D), A shortened and B started early by L
const audA = [a0 / FPS - D, a1 / FPS - L - D], audB = [b0 / FPS - L - D, b1 / FPS - D];
/** edit time of a master sound event / picture moment */
const soundAt = (m: number) => (m < b0 / FPS - L - D - 0.001 ? m - a0 / FPS + D : lenA + (m - b0 / FPS) + D);
const pictureAt = (m: number) => (m < b0 / FPS ? m - a0 / FPS : lenA + (m - b0 / FPS));

// the cut must not split a line or a sound in the middle
const problems: string[] = [];
for (const e of ev) {
  if (!["speech", "sting", "sfx"].includes(e.kind)) continue;
  const e1 = e.t + (e.dur ?? (e.kind === "sfx" ? 0.4 : 0));
  for (const [x, name] of [[audA[0], "A start"], [audA[1], "A end"], [audB[0], "B start"], [audB[1], "B end"]] as const)
    if (e.t < x - 0.01 && e1 > x + 0.01) problems.push(`${name} (${r3(x)}) cuts ${e.kind} ${e.id} ${e.t}–${r3(e1)}`);
}
for (const e of ev) if (e.kind === "hitch" && ((e.t >= a0 / FPS && e.t < a1 / FPS) || (e.t >= b0 / FPS && e.t < b1 / FPS))) problems.push(`a ${e.id} freeze at ${e.t}`);
if (problems.length) console.warn("[edit] " + problems.join("\n[edit] "));

// ------------------------------------------------------------------ the shake, put back
let shakes: number[] = [];
const sj = join(RAW, `${take}.shakes.json`);
if (existsSync(sj)) shakes = [...new Set<number>(JSON.parse(readFileSync(sj, "utf8")).shakes)];
if (!shakes.length) {
  // (from the sounds that go with them: the dive's burst starts the ninja's celebration (its "charge" 4 s into the
  // sting) and each of the ninja's landings is a "boom"; both shake in the same moment, logged ~6 ms earlier)
  const sting = ev.find((e) => e.kind === "sting")!;
  const burst = ev.filter((e) => e.kind === "sfx" && e.id === "charge").sort((x, y) => Math.abs(x.t - sting.t - 4) - Math.abs(y.t - sting.t - 4))[0];
  shakes = [burst.t - 0.006, ...ev.filter((e) => e.kind === "sfx" && e.id === "boom").map((e) => e.t - 0.001)];
}
/** styles.css: 0%,100% {0 0} 20% {-10px 6px} 40% {9px -6px} 60% {-6px 3px} 80% {4px -2px}; 0.4 s; ease per step */
const KF = [[0, 0], [-10, 6], [9, -6], [-6, 3], [4, -2], [0, 0]];
const ease = (p: number) => {
  // cubic-bezier(0.25, 0.1, 0.25, 1): solve x(s) = p, return y(s)
  const bx = (s: number) => 3 * (1 - s) ** 2 * s * 0.25 + 3 * (1 - s) * s * s * 0.25 + s ** 3;
  const by = (s: number) => 3 * (1 - s) ** 2 * s * 0.1 + 3 * (1 - s) * s * s * 1 + s ** 3;
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (bx(m) < p) lo = m;
    else hi = m;
  }
  return by((lo + hi) / 2);
};
const offsets = new Map<number, [number, number]>();
// (on the picture as it was really drawn: D later than the rig's event clock, like the sound)
const shakeEdit = shakes.map((m) => pictureAt(m) + D).filter((t) => t > -0.4 && t < total);
for (const s of shakeEdit)
  for (let n = Math.max(0, Math.ceil(s * FPS)); n / FPS < s + 0.4 && n < Math.round(total * FPS); n++) {
    const u = n / FPS - s, k = Math.min(4, Math.floor(u / 0.08)), p = ease((u - k * 0.08) / 0.08);
    const dx = KF[k][0] + (KF[k + 1][0] - KF[k][0]) * p, dy = KF[k][1] + (KF[k + 1][1] - KF[k][1]) * p;
    offsets.set(n, [Math.round(dx), Math.round(dy)]);
  }
const M = 12;
const expr = (i: 0 | 1) => {
  const terms = [...offsets].filter(([, o]) => o[i] !== 0).map(([n, o]) => `${o[i]}*eq(n,${n})`);
  return terms.length ? `${M}-(${terms.join("+")})` : String(M);
};

// ------------------------------------------------------------------ single repeated frames
// The screencast now and then delivers a frame late (a 40-50 ms gap at the heaviest moments, e.g. the homecoming's
// landing), and the rig's 30 fps rebuild shows the previous frame twice. Each such lone repeat (moving before and
// after) is dropped and drawn again by motion-compensated interpolation from its neighbours (ffmpeg minterpolate,
// which copies every other frame untouched). A plain 50/50 blend was tried first: it doubles the flying petal and the
// ninja. Where interpolation smears (the ninja's pose changing between the two frames) the repeat stays: HAND_KEEP.
const HAND_KEEP: Record<string, { A?: number[]; B?: number[] }> = {
  // piece B frame 67 (edit 12.77 s): the ninja swaps from his tuck to his flip pose; interpolated, he is a blur
  "take4-noshake": { B: [67] },
};
function repeats(f0: number, f1: number): number[] {
  const w = 160, h = 90;
  const raw = spawnSync("ffmpeg", ["-v", "error", "-i", master, "-vf", `select=between(n\\,${f0}\\,${f1 - 1}),scale=${w}:${h},format=gray`, "-fps_mode", "passthrough", "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 }).stdout;
  const n = Math.floor(raw.length / (w * h));
  const d = (i: number) => {
    let s = 0;
    for (let k = 0; k < w * h; k++) s += Math.abs(raw[i * w * h + k] - raw[(i - 1) * w * h + k]);
    return s / (w * h);
  };
  const out: number[] = [];
  for (let i = 2; i < n - 1; i++) if (d(i) < 0.3 && d(i - 1) > 0.6 && d(i + 1) > 0.6) out.push(i); // (index within the piece)
  return out;
}
const keep = HAND_KEEP[take] ?? {};
const repA = repeats(a0, a1).filter((k) => !keep.A?.includes(k)), repB = repeats(b0, b1).filter((k) => !keep.B?.includes(k));
/** the piece [f0, f1) of the master, its lone repeats drawn again */
const piece = (x: string, f0: number, f1: number, list: number[]) =>
  `[${x}]trim=start_frame=${f0}:end_frame=${f1}` +
  (list.length
    ? `,tpad=stop_mode=clone:stop=3,select='not(${list.map((k) => `eq(n,${k})`).join("+")})',minterpolate=fps=${FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,trim=end_frame=${f1 - f0}`
    : "") +
  `,setpts=PTS-STARTPTS`;

// ------------------------------------------------------------------ captions
const caps = ev
  .filter((e) => e.kind === "speech" && e.text && ((e.t >= audA[0] && e.t < audA[1]) || (e.t >= audB[0] && e.t < audB[1])))
  .map((e) => {
    let from = soundAt(e.t), to = soundAt(e.t + (e.dur ?? 2));
    if (e.t >= audB[0]) from = Math.max(from, lenA); // (no caption over piece A's last frames)
    return { id: e.id, text: e.text!, from: r3(from), to: r3(Math.min(to, total)) };
  });
const noCaps = args.includes("--nocaps");
const POP = 8; // frames of the pop-in (0.25 s)
mkdirSync(WORK, { recursive: true });
const capDir = join(WORK, `caps-${take}${noCaps ? "-none" : ""}`);
const seqDir = join(capDir, "seq");
if (existsSync(capDir)) retire(capDir);
mkdirSync(seqDir, { recursive: true });
{
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  // the game's .bubble (styles.css), a little larger for a phone screen, centred at the bottom, no tail
  await page.setContent(`<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700&display=block" rel="stylesheet">
<style>
html,body{margin:0;background:transparent}
#f{position:relative;width:${W}px;height:${H}px;overflow:hidden}
.bubble{position:absolute;left:50%;bottom:26px;translate:-50% 0;width:max-content;max-width:600px;padding:10px 26px 8px;
  font-family:"Baloo 2",system-ui,sans-serif;font-weight:700;font-size:31px;line-height:1.18;color:#2b1d14;text-align:center;
  text-wrap:balance;background:#fffdf6;border:4px solid #2b1d14;border-radius:26px;box-shadow:0 6px 0 #2b1d14;
  animation:pop .25s cubic-bezier(.3,1.6,.6,1) both;animation-play-state:paused}
@keyframes pop{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}
</style></head><body><div id="f"></div></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.fonts.load('700 31px "Baloo 2"'));
  const empty = join(capDir, "empty.png");
  await page.screenshot({ path: empty, omitBackground: true });
  const files: string[][] = [];
  for (const [i, c] of caps.entries()) {
    const list: string[] = [];
    await page.evaluate((text) => {
      const f = document.getElementById("f")!;
      f.innerHTML = "";
      const b = document.createElement("div");
      b.className = "bubble";
      b.textContent = text;
      f.appendChild(b);
    }, c.text);
    for (let k = 0; k <= POP; k++) {
      await page.evaluate((ms) => document.getAnimations().forEach((a) => ((a.currentTime = ms), a.pause())), (Math.min(k, POP) * 1000) / FPS);
      const out = join(capDir, `c${i}-${k}.png`);
      await page.screenshot({ path: out, omitBackground: true });
      list.push(out);
    }
    files.push(list);
  }
  await browser.close();
  const N = Math.round(total * FPS);
  for (let n = 0; n < N; n++) {
    const t = n / FPS;
    const i = noCaps ? -1 : caps.findIndex((c) => t >= c.from - 0.5 / FPS && t < c.to - 0.5 / FPS);
    const src = i < 0 ? empty : files[i][Math.min(POP, n - Math.round(caps[i].from * FPS))];
    linkSync(src, join(seqDir, `${String(n).padStart(5, "0")}.png`));
  }
}

// ------------------------------------------------------------------ the picture and the sound
const name = noCaps ? "gem-victory-clean" : "gem-victory";
const edit = join(WORK, `${name}-edit.master.mp4`), editWav = join(WORK, `${name}-edit.master.wav`);
retire(edit);
retire(editWav);
const graph = [
  `[0:v]split=2[v1][v2]`,
  `${piece("v1", a0, a1, repA)}[pa]`,
  `${piece("v2", b0, b1, repB)}[pb]`,
  `[pa][pb]concat=n=2:v=1:a=0,scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=gbrp[rgb]`,
  `[1:v]format=gbrap[cap]`,
  `[rgb][cap]overlay=0:0:format=gbrp:eof_action=pass[ov]`,
  `[ov]pad=${W + 2 * M}:${H + 2 * M}:${M}:${M}:color=0x1d1230,crop=${W}:${H}:x='${expr(0)}':y='${expr(1)}':exact=1[sh]`,
  `[sh]scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv444p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv[v]`,
  `[2:a]asplit=2[x1][x2]`,
  `[x1]atrim=start=${r3(audA[0])}:end=${r3(audA[1])},asetpts=PTS-STARTPTS,afade=t=out:st=${r3(audA[1] - audA[0] - 0.006)}:d=0.006[s1]`,
  `[x2]atrim=start=${r3(audB[0])}:end=${r3(audB[1])},asetpts=PTS-STARTPTS,afade=t=in:d=0.006[s2]`,
  `[s1][s2]concat=n=2:v=0:a=1[a]`,
].join(";\n");
const gfile = join(WORK, `${name}-edit.filter`);
writeFileSync(gfile, graph);
const wav = master.replace(/\.mp4$/, ".wav");
ff(["-i", master, "-framerate", String(FPS), "-i", join(seqDir, "%05d.png"), "-i", wav, "-/filter_complex", gfile,
  "-map", "[v]", "-c:v", "libx264", "-preset", "medium", "-crf", "10", "-pix_fmt", "yuv444p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
  "-map", "[a]", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-t", String(total), edit]);
ff(["-i", wav, "-filter_complex", graph.split(";\n").filter((l) => l.includes("[2:a]") || l.includes("[x1]") || l.includes("[x2]") || l.startsWith("[s1]")).join(";").replaceAll("[2:a]", "[0:a]"),
  "-map", "[a]", "-c:a", "pcm_f32le", "-ar", "48000", editWav]);
// a timeline for the edit (trim() reads it for its checks; the contact sheet labels)
const editEvents: TimelineEvent[] = ev
  .filter((e) => (e.t >= audA[0] && e.t < audA[1]) || (e.t >= audB[0] && e.t < audB[1]))
  .map((e) => ({ ...e, t: r3(["speech", "sfx", "sting", "music"].includes(e.kind) ? soundAt(e.t) : pictureAt(e.t)) }));
for (const s of shakeEdit) editEvents.push({ t: r3(s), kind: "mark", id: "shake (put back)" });
editEvents.push({ t: r3(lenA), kind: "mark", id: "cut" });
editEvents.sort((x, y) => x.t - y.t);
const editTl = edit.replace(/\.master\.mp4$/, ".timeline.json");
retire(editTl);
writeFileSync(editTl, JSON.stringify({ name, take, pieces: { A: [a0 / FPS, a1 / FPS], B: [b0 / FPS, b1 / FPS] }, audio: { A: audA.map(r3), B: audB.map(r3), delay: D }, shakes: shakeEdit.map(r3), captions: noCaps ? [] : caps, events: editEvents }, null, 1));

// ------------------------------------------------------------------ the X file
// the captioned cut is the tweet's file; the clean one (and its SRT, for X's caption upload) waits in gem-victory/alt/
const out = noCaps ? join(DIR, "gem-victory", "alt", `${name}.mp4`) : join(DIR, `${name}.mp4`);
const posterAt = opt("--poster") ? Number(opt("--poster")) : undefined;
const t = trim(edit, 0, total, out, { fadeMs: 20, ...(posterAt != null ? { posterAt } : {}) });
// the captions as an SRT (for X's caption upload, with the clean cut only: the main file has them burnt in)
const srt = (s: number) => {
  const ms = Math.round(s * 1000);
  const p = (x: number, n = 2) => String(x).padStart(n, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const srtCaps = ev
  .filter((e) => e.kind === "speech" && e.text && ((e.t >= audA[0] && e.t < audA[1]) || (e.t >= audB[0] && e.t < audB[1])))
  .map((e) => ({ from: Math.max(soundAt(e.t), e.t >= audB[0] ? lenA : 0), to: Math.min(total, soundAt(e.t + (e.dur ?? 2))), text: e.text! }));
const srtFile = out.replace(/\.mp4$/, ".srt");
retire(srtFile);
if (noCaps) writeFileSync(srtFile, srtCaps.map((c, i) => `${i + 1}\n${srt(c.from)} --> ${srt(c.to)}\n${c.text}\n`).join("\n"));
console.log(JSON.stringify({ take, repeatsRedrawn: { A: repA.map((k) => r3(k / FPS)), B: repB.map((k) => r3(lenA + k / FPS)) }, repeatsKept: keep, pieces: { A: [r3(a0 / FPS), r3(a1 / FPS)], B: [r3(b0 / FPS), r3(b1 / FPS)] }, audio: { A: audA.map(r3), B: audB.map(r3) }, total: r3(total), shakes: shakeEdit.map(r3), captions: noCaps ? [] : caps, problems, trim: t }, null, 1));
process.exit(0);
