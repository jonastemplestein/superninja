// The enemies supercut (27 Sep 2026): every enemy's best moments from the takes of ./drive.ts, cut on the beat of ONE
// continuous music bed (the game's own boss theme, public/a/m/boss.mp3: 144 BPM, its first beat at 0.158 s, a phrase
// every 32 beats, the lift at beat 96, 40.16 s), with each shot's own hit sounds and a few shouts from the takes on top.
// No text: the game's art (and its captions, as the game shows them) only.
//
//   bun assets-src/clips/2026-09-27/supercut/edit.ts long|short [--dry]
//
// A shot puts an anchor of its take (the entrance's landing boom or whoosh, a big hit, the knockout: ./anchors.ts) on
// a beat of the bed; it starts `pre` seconds before that and runs until the next shot starts (cutting on action: each
// cut lands just before the next hit). The sound: the bed from its first beat, then per shot the take's own sound
// effects (and the listed lines) at their times in the take, so each hit is heard on its frame. Mixed, limited to
// −16 LUFS (true peak ≤ −1.5 dBTP), faded out at the end (the picture fades to black with it).
//
// Checks: `--dry` lists each shot's window and flags freezes (the rig's hitch events) and exact repeated frames in it;
// ./check.ts puts one frame per enemy side by side (every enemy there, each facing the ninja); the rig's contact sheet
// (every 0.5 s) lands beside this file.
//
// Decisions (27 Sep, logged here: this editor writes only under assets-src/clips/2026-09-27/):
// - The bed is boss.mp3, not battle.mp3 (139.5 BPM): its phrases fall every 32 beats and it lifts at beat 96 (40.16 s),
//   so the little monsters fill the first two phrases, the bosses the third, and Baron Muddle lands on the lift. Its
//   first beat is a hit, so the film opens on Gloop's landing boom on it. (Tempo and phase measured: ./tempo.ts, then
//   a finer search: 144.00 BPM, beat 0 at 0.1576 s; the low-band onsets sit on that grid to 60 s.)
// - The monsters' landings are the game's, but their boom is heard on the landing frame: the drop's picture lands
//   ~0.1 s after the code that plays the boom (the new scene's first heavy frames), in every take.
// - The lines are mixed at 0.4 (−8 dB): at full level Baron Muddle's "Nooo!" stood ~9 LU over the bed once the mix was
//   brought to −16 LUFS; now the finale sits ~2–3 LU over the rest.
// - Baron Muddle's "Nooo! My muddle! This is not over, ninja... I will be back!" is cut in its pause after "My
//   muddle!" and picked up again before "I will be back!" (the ninja's leap and the bonk come with it): the framing is
//   locked off and the jump cut doesn't show. The take cuts to the reward 0.46 s after the bonk, so the last frame is
//   held (1.6 s long, 0.7 s short) while it fades to black and the bed fades out.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { contactSheet, type TimelineEvent } from "../../../../scripts/tweet-clips";
import { anchors, lateAt, loadTake, type Take } from "./anchors";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "../../../..");
const OUT = join(HERE, "..");
const TRASH = join(ROOT, ".trash", "clips-2026-09-27-supercut");
const FPS = 30;
export const BED = join(ROOT, "public/a/m/boss.mp3");
export const BEAT = 60 / 144;
/** the lines' level in the mix (the bed at `music`, the effects at 1: as the game renders them, with their bus gain) */
export const SPEECH = 0.4;
export const BEAT0 = 0.1576;
/** video time of beat k (the bed starts with the video) */
export const beatAt = (k: number) => BEAT0 + k * BEAT;

const f30 = (t: number) => Math.round(t * FPS) / FPS;
const round = (x: number, d = 3) => Math.round(x * 10 ** d) / 10 ** d;
const run = (cmd: string, args: string[], input?: Buffer) => {
  const r = spawnSync(cmd, args, { input, maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`${cmd} ${args.slice(0, 14).join(" ")}…\n${r.stderr?.toString().slice(-3000)}`);
  return r;
};
const ff = (args: string[]) => run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
const durationOf = (f: string) => Number(JSON.parse(run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", f]).stdout.toString()).format.duration);
function retire(file: string) {
  if (!existsSync(file)) return;
  mkdirSync(TRASH, { recursive: true });
  renameSync(file, join(TRASH, `${new Date().toISOString().replace(/[:.]/g, "-")}-${basename(file)}`));
}
const aac = run("ffmpeg", ["-hide_banner", "-encoders"]).stdout.toString().includes("aac_at") ? "aac_at" : "aac";
const TAG_709_VF = "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv";
const TAG_709 = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"];

export type Anchor = "entrance" | "ko" | { hit: number } | { line: string; plus?: number } | { sfx: string; after?: string } | { at: number };
export interface Shot {
  enemy: string;
  take: string;
  anchor: Anchor;
  /** the beat of the bed the anchor lands on */
  beat: number;
  /** seconds shown before the anchor */
  pre: number;
  /** lines of the take heard in this shot (ids), e.g. "baron_lose"; `tail`: how far past the shot's end they may run */
  lines?: string[];
  tail?: number;
  /** sound effects left out of this shot (besides the taps) */
  mute?: string[];
  note?: string;
}
export interface Plan { name: string; /** where the finished file goes (default: the clips folder) */ dir?: string; shots: Shot[]; /** the beat the last shot ends on */ endBeat: number; /** seconds the last frame is held after it (fading to black) */ hold?: number; fadeOut: number; videoFade: number; poster: number; music: number }

/** Sound effects never used: the child's taps on the tiles, and the reward screen's. */
const NEVER = new Set(["tap", "fanfare", "place"]);

function anchorTime(tk: Take, a: Anchor): number {
  const an = anchors(tk);
  if (a === "entrance") {
    if (!an.entrance) throw new Error(`${tk.name}: no entrance`);
    return an.entrance.land;
  }
  if (a === "ko") {
    if (an.ko == null) throw new Error(`${tk.name}: no knockout`);
    return an.ko;
  }
  if ("hit" in a) {
    const h = a.hit < 0 ? an.hits[an.hits.length + a.hit] : an.hits[a.hit];
    if (h == null) throw new Error(`${tk.name}: no hit ${a.hit}`);
    return h;
  }
  if ("sfx" in a) {
    const from = a.after ? tk.events.find((e) => e.kind === "speech" && e.id === a.after && e.t >= an.fight.from)?.t ?? an.fight.from : an.fight.from;
    const e = tk.events.find((x) => x.kind === "sfx" && x.id === a.sfx && x.t > from);
    if (!e) throw new Error(`${tk.name}: no ${a.sfx} after ${a.after}`);
    return e.t;
  }
  if ("line" in a) {
    const l = tk.events.find((e) => e.kind === "speech" && e.id === a.line && e.t >= an.fight.from);
    if (!l) throw new Error(`${tk.name}: no line ${a.line}`);
    return l.t + (a.plus ?? 0);
  }
  return a.at;
}

export interface Placed { shot: Shot; tk: Take; v: number; len: number; src: number; anchorAt: number; late: number; /** seconds the shot's sounds move (an entrance's boom onto the landing frame) */ nudge: number }
export function place(plan: Plan): Placed[] {
  const takes = new Map<string, Take>();
  const tk = (n: string) => takes.get(n) ?? (takes.set(n, loadTake(n)), takes.get(n)!);
  const starts = plan.shots.map((s) => f30(Math.max(0, beatAt(s.beat) - s.pre)));
  const end = f30(beatAt(plan.endBeat));
  return plan.shots.map((s, k) => {
    const t = tk(s.take);
    const at = anchorTime(t, s.anchor);
    const v = starts[k];
    const len = f30((k + 1 < starts.length ? starts[k + 1] : end) - v);
    // the frame at video time v shows master time src; the anchor lands on its beat to the nearest frame
    const src = f30(at - (beatAt(s.beat) - v));
    if (len <= 0) throw new Error(`shot ${k} (${s.enemy}) has no length`);
    // an entrance's boom (and the ninja's kiai with it) is heard on the landing frame, ~0.1 s after the game plays it
    const en = s.anchor === "entrance" ? anchors(t).entrance : null;
    const nudge = en ? en.land - en.t : 0;
    return { shot: s, tk: t, v, len, src, anchorAt: at, late: lateAt(t, src + len / 2), nudge };
  });
}

/** Freezes (the rig's hitch events) and exact repeats in each shot's window of its master. */
function frameCheck(p: Placed): string[] {
  const out: string[] = [];
  for (const e of p.tk.events) if (e.kind === "hitch" && e.t >= p.src - 0.1 && e.t < p.src + p.len) out.push(`freeze ${e.id} at ${e.t}`);
  // repeats: consecutive frames that are identical (the 30 fps rebuild had no new frame), while the picture moves
  // (at 640×360: at a smaller size a moment of little motion can round to the same picture; an exact repeat is exact)
  const r = run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", String(p.src), "-i", p.tk.master, "-t", String(p.len), "-vf", "scale=640:360,format=gray", "-f", "rawvideo", "pipe:1"]);
  const px = 640 * 360, n = Math.floor(r.stdout.length / px);
  let reps = 0;
  const at: number[] = [];
  for (let k = 1; k < n; k++) {
    let d = 0;
    for (let i = 0; i < px; i++) d += Math.abs(r.stdout[k * px + i] - r.stdout[(k - 1) * px + i]);
    if (d / px < 0.002) (reps++, at.push(k));
  }
  if (reps) out.push(`${reps} repeated frames (at +${at.map((k) => (k / FPS).toFixed(2)).join(", ")} s)`);
  return out;
}

function audioFile(tk: Take, e: TimelineEvent): string | null {
  const dir = join(dirname(tk.master), ".audio");
  if (e.kind === "sfx") return existsSync(join(dir, "sfx", `${e.id}.wav`)) ? join(dir, "sfx", `${e.id}.wav`) : null;
  // speech ids: a line (a/l/<id>.mp3); words and sounds are never used here
  const f = join(dir, "a", "l", `${e.id}.mp3`);
  return existsSync(f) ? f : existsSync(join(ROOT, "public/a/l", `${e.id}.mp3`)) ? join(ROOT, "public/a/l", `${e.id}.mp3`) : null;
}

interface Clip { file: string; at: number; skip: number; len: number; gain: number; stem: "sfx" | "speech"; fadeOut: number; label: string }
export function soundClips(placed: Placed[], total: number): Clip[] {
  const clips: Clip[] = [];
  const lens = new Map<string, number>();
  const lengthOf = (f: string) => lens.get(f) ?? (lens.set(f, durationOf(f)), lens.get(f)!);
  for (const p of placed) {
    const s = p.shot;
    const shift = -p.late / 1000 + p.nudge; // sound late by `late` ms in the take: its events belong that much earlier
    for (const e of p.tk.events) {
      const isSfx = e.kind === "sfx" && !NEVER.has(e.id) && !(s.mute ?? []).includes(e.id);
      const isLine = e.kind === "speech" && (s.lines ?? []).includes(e.id);
      if (!isSfx && !isLine) continue;
      // (a sound that began just before the cut is heard from the cut, if it is a line; an effect only if it starts in the shot)
      const from = isLine ? p.src - (e.dur ?? 0) : p.src - 0.02 - p.nudge;
      if (e.t < from || e.t >= p.src + p.len - p.nudge) continue;
      const file = audioFile(p.tk, e);
      if (!file) {
        console.warn(`no sound for ${e.kind} ${e.id} in ${p.tk.name}`);
        continue;
      }
      const at = p.v + (e.t - p.src) + shift;
      const skip = Math.max(0, p.v - at);
      const full = Math.min(lengthOf(file), isLine && e.dur ? e.dur : Infinity);
      // an effect may ring on for 0.35 s into the next shot; a line for its shot's `tail`
      const until = Math.min(total, p.v + p.len + (isLine ? (s.tail ?? 0) : 0.35));
      const len = Math.min(full, until - at) - skip;
      if (len <= 0.02) continue;
      clips.push({ file, at: Math.max(p.v, at), skip, len, gain: 1, stem: isLine ? "speech" : "sfx", fadeOut: len < full - skip - 0.01 ? 0.06 : 0, label: `${p.shot.enemy}:${e.id}` });
    }
  }
  return clips;
}

export function build(plan: Plan, o: { dry?: boolean } = {}) {
  const placed = place(plan);
  const shotsEnd = f30(beatAt(plan.endBeat));
  const total = f30(shotsEnd + (plan.hold ?? 0));
  console.log(`${plan.name}: ${placed.length} shots, ${total.toFixed(2)} s`);
  const problems: string[] = [];
  for (const p of placed) {
    const chk = frameCheck(p);
    const w = p.tk.width === 1920 ? "" : ` (${p.tk.width}p!)`;
    console.log(`  ${p.v.toFixed(2)} +${p.len.toFixed(2)}  ${p.shot.enemy.padEnd(14)} ${p.tk.name} ${p.src.toFixed(2)}–${(p.src + p.len).toFixed(2)} anchor ${p.anchorAt.toFixed(2)}→beat ${p.shot.beat} (${beatAt(p.shot.beat).toFixed(2)} s) late ${p.late.toFixed(0)} ms${w}${chk.length ? "  !! " + chk.join("; ") : ""}`);
    if (chk.length || w) problems.push(`${p.shot.enemy}: ${chk.join("; ")}${w}`);
  }
  if (o.dry) return { placed, problems };
  mkdirSync(join(HERE, ".work"), { recursive: true });
  const out = join(plan.dir ?? OUT, `${plan.name}.mp4`);

  // ---- the picture: each shot's window of its master, cut together, the last `videoFade` s faded to black
  const vin: string[] = [];
  const vg: string[] = [];
  placed.forEach((p, k) => {
    vin.push("-ss", String(p.src), "-t", String(round(p.len + 0.2, 4)), "-i", p.tk.master);
    // exactly round(len × 30) frames from the seek point, with clean timestamps (a fps filter here added a frame now
    // and then: 0.4 s of drift over 40 shots)
    vg.push(`[${k}:v]trim=start_frame=0:end_frame=${Math.round(p.len * FPS)},setpts=N/${FPS}/TB,scale=1920:1080:flags=lanczos,format=yuv420p,setsar=1[v${k}]`);
  });
  const hold = plan.hold ? `,tpad=stop_mode=clone:stop_duration=${plan.hold}` : "";
  vg.push(`${placed.map((_, k) => `[v${k}]`).join("")}concat=n=${placed.length}:v=1:a=0${hold},fade=t=out:st=${round(total - plan.videoFade, 4)}:d=${plan.videoFade},${TAG_709_VF}[v]`);
  const vScript = join(HERE, ".work", `${plan.name}.video.filter`);
  writeFileSync(vScript, vg.join(";\n"));
  const video = join(HERE, ".work", `${plan.name}.video.mp4`);
  retire(video);
  ff([...vin, "-/filter_complex", vScript, "-map", "[v]", "-t", String(total), "-c:v", "libx264", "-profile:v", "high", "-level:v", "4.1", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-g", String(FPS * 2), "-bf", "2", ...TAG_709, "-an", video]);

  // ---- the sound: the bed, the shots' effects and lines, the bed ducked a little under the lines
  const clips = soundClips(placed, total);
  const files = [...new Set(clips.map((c) => c.file))];
  const ain: string[] = ["-i", BED];
  const ag: string[] = [];
  const speech = clips.filter((c) => c.stem === "speech").map((c) => [c.at, c.at + c.len] as [number, number]);
  const env = speech.map(([x, y]) => `clip((t-${round(x - 0.1)})/0.15,0,1)*clip((${round(y + 0.25)}-t)/0.3,0,1)`).join("+") || "0";
  ag.push(`[0:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,atrim=0:${total},asetpts=PTS-STARTPTS,volume=${plan.music},asetnsamples=n=240,volume='1-0.45*min(1,${env})':eval=frame[bed]`);
  files.forEach((f, i) => {
    const uses = clips.filter((c) => c.file === f);
    ain.push("-i", f);
    ag.push(`[${i + 1}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,asplit=${uses.length + 1}${uses.map((_, k) => `[f${i}_${k}]`).join("")}[f${i}_x]`, `[f${i}_x]anullsink`);
  });
  const used = new Map<string, number>();
  const names: string[] = [];
  clips.forEach((c, j) => {
    const i = files.indexOf(c.file);
    const k = used.get(c.file) ?? 0;
    used.set(c.file, k + 1);
    const chain = [`atrim=start=${round(c.skip, 4)}:duration=${round(c.len, 4)}`, "asetpts=PTS-STARTPTS"];
    if (c.fadeOut) chain.push(`afade=t=out:st=${round(Math.max(0, c.len - c.fadeOut), 4)}:d=${c.fadeOut}`);
    // (the lines are mastered loud: at full level they stood ~9 LU over the bed once the mix was brought to −16 LUFS)
    if (c.stem === "speech") chain.push(`volume=${SPEECH}`);
    chain.push(`adelay=${Math.round(c.at * 48000)}S:all=1`);
    ag.push(`[f${i}_${k}]${chain.join(",")}[c${j}]`);
    names.push(`[c${j}]`);
  });
  ag.push(`[bed]${names.join("")}amix=inputs=${names.length + 1}:normalize=0:duration=first,atrim=0:${total}[mix]`);
  const aScript = join(HERE, ".work", `${plan.name}.audio.filter`);
  writeFileSync(aScript, ag.join(";\n"));
  const mixWav = join(HERE, ".work", `${plan.name}.mix.wav`);
  retire(mixWav);
  ff([...ain, "-/filter_complex", aScript, "-map", "[mix]", "-t", String(total), "-c:a", "pcm_f32le", "-ar", "48000", mixWav]);
  // −16 LUFS: a 4× oversampled limiter before a linear gain (as the rig's trim()), then the fade-out
  const target = -16;
  const measure = (input: string[], pre?: string) => {
    const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...input, "-vn", "-af", `${pre ? pre + "," : ""}ebur128=peak=true:framelog=quiet`, "-f", "null", "-"], { maxBuffer: 1 << 28 });
    const s = r.stderr.toString();
    const sum = s.slice(s.lastIndexOf("Summary:"));
    const num = (re: RegExp) => Number(sum.match(re)?.[1]);
    return { I: num(/I:\s+(-?[\d.]+|-inf) LUFS/), TP: num(/Peak:\s+(-?[\d.]+|-inf) dBFS/), LRA: num(/LRA:\s+(-?[\d.]+) LU/) };
  };
  const fade = `afade=t=out:st=${round(total - plan.fadeOut, 4)}:d=${plan.fadeOut}:curve=tri,afade=t=in:d=0.01`;
  const m1 = measure(["-i", mixWav], fade);
  const chain = (g: number) => `aresample=192000,alimiter=limit=${round(Math.min(1, Math.max(0.0625, 10 ** ((-2.2 - g) / 20))), 5)}:attack=3:release=80:level=0:latency=1,aresample=48000,volume=${round(g, 3)}dB,${fade}`;
  const audio = join(HERE, ".work", `${plan.name}.audio.m4a`);
  const encode = (g: number) => {
    retire(audio);
    ff(["-i", mixWav, "-af", chain(g), "-c:a", aac, "-b:a", "128k", "-ar", "48000", "-ac", "2", ...(aac === "aac_at" ? ["-aac_at_mode", "cbr"] : []), audio]);
    return measure(["-i", audio]);
  };
  let g = target - m1.I, m2 = encode(g);
  for (let i = 0; i < 5 && (Math.abs(target - m2.I) > 0.15 || m2.TP > -1.5); i++) {
    g += Math.min(target - m2.I, -1.5 - m2.TP);
    m2 = encode(g);
  }

  // ---- the file: picture and sound, +faststart; the poster; the contact sheet
  retire(out);
  ff(["-i", video, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "copy", "-t", String(total), "-movflags", "+faststart", out]);
  const poster = out.replace(/\.mp4$/, ".jpg");
  retire(poster);
  ff(["-ss", String(plan.poster), "-i", out, "-frames:v", "1", "-q:v", "2", poster]);
  const sheet = contactSheet(out, 0.5, join(HERE, `${plan.name}.sheet.jpg`));
  const p = JSON.parse(run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", out]).stdout.toString());
  const v = p.streams.find((s: any) => s.codec_type === "video"), au = p.streams.find((s: any) => s.codec_type === "audio");
  const head = readFileSync(out).subarray(0, 64 * 1024).toString("latin1");
  const spec = {
    video: `${v.codec_name} ${v.profile} ${v.pix_fmt} ${v.width}x${v.height} ${v.r_frame_rate} ${v.color_space}/${v.color_range}`,
    audio: `${au.codec_name} ${au.profile} ${au.sample_rate} Hz ${au.channels}ch ${Math.round(Number(au.bit_rate) / 1000)} kb/s`,
    faststart: head.indexOf("moov") >= 0 && (head.indexOf("mdat") < 0 || head.indexOf("moov") < head.indexOf("mdat")),
    duration: round(Number(p.format.duration)),
    sizeMB: round(Number(p.format.size) / 1e6, 2),
  };
  const res = { out, poster, sheet, spec, loudness: m2, problems, clips: clips.length };
  console.log(JSON.stringify(res, null, 1));
  return res;
}

if (import.meta.main) {
  const [which, ...a] = process.argv.slice(2);
  const plans: Record<string, Plan> = await import("./plans");
  const plan = plans[which.toUpperCase()];
  if (!plan) throw new Error(`plans: ${Object.keys(plans).join(" ")}`);
  build(plan, { dry: a.includes("--dry") });
  process.exit(0);
}
