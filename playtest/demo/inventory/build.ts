// The demo inventory's editor: turns a recording (record.ts) into
//   · timeline.json / timeline.md: every clip Sensei said (with its text, start, end, and whether it was cut short),
//     the paw, the ninja's calls and poses, card and tile states, the child's taps, turns and held Nexts, in ms from
//     the video's first frame (the page's own clock, so speech and motion are on one clock);
//   · final.mp4: the recording at real speed with its soundtrack (speech and sound effects, rebuilt from the game's
//     audio log at the times they played; music is off in the recording's save), 844×390.
//
//   bun playtest/demo/inventory/build.ts [case ...]        (all recorded cases when none is named)
//
// Clips are fetched once from the recording's build into cache/ and measured there with ffprobe.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "../../..");
const HERE = resolve(import.meta.dir);
const RUNS = join(HERE, "runs");
const CACHE = join(HERE, "cache");
mkdirSync(CACHE, { recursive: true });

// line texts: the recording's build is this checkout's (the build of 27 Sep 09:17); a line id missing here is shown
// as its id
const LINE_TEXT = new Map<string, string>();
try {
  const src = readFileSync(join(ROOT, "src/content/lines.ts"), "utf8");
  for (const m of src.matchAll(/\b[sb]\(\s*"([a-z0-9_]+)"\s*,\s*("(?:[^"\\]|\\.)*")/g)) LINE_TEXT.set(m[1], JSON.parse(m[2]));
  const gen = readFileSync(join(ROOT, "src/content/teach-lines.gen.ts"), "utf8");
  for (const m of gen.matchAll(/"id":\s*"([a-z0-9_]+)",\s*"text":\s*("(?:[^"\\]|\\.)*")/g)) LINE_TEXT.set(m[1], JSON.parse(m[2]));
} catch {}

const run = (cmd: string, args: string[]) => {
  const r = spawnSync(cmd, args, { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`${cmd} ${args.slice(0, 10).join(" ")}…\n${r.stderr?.toString().slice(-1500)}`);
  return r.stdout.toString();
};
const durFile = join(CACHE, "durations.json");
const durs: Record<string, number> = existsSync(durFile) ? JSON.parse(readFileSync(durFile, "utf8")) : {};
async function clip(base: string, url: string): Promise<{ file: string; ms: number } | null> {
  const file = join(CACHE, url.replace(/^\//, ""));
  if (!existsSync(file)) {
    const r = await fetch(base + url);
    if (!r.ok) return null;
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  }
  if (durs[url] == null) {
    const out = run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]);
    durs[url] = Math.round(Number(out.trim()) * 1000);
    writeFileSync(durFile, JSON.stringify(durs, null, 1));
  }
  return { file, ms: durs[url] };
}

/** What a clip url says: a line's text, a word, a stretched word, a sound, a held first sound. */
export function describe(url: string): { id: string; text: string; kind: "line" | "word" | "stretch" | "sound" | "onset" | "story" | "other" } {
  let m;
  if ((m = url.match(/\/a\/l\/([^/]+)\.mp3/))) return { id: m[1], text: LINE_TEXT.get(m[1]) ?? `[${m[1]}]`, kind: "line" };
  if ((m = url.match(/\/a\/w\/([^/]+)\.mp3/))) return { id: `word:${m[1]}`, text: `"${m[1]}"`, kind: "word" };
  if ((m = url.match(/\/a\/x\/([^/]+)\.mp3/))) return { id: `slow:${m[1]}`, text: `"${m[1]}", slowly`, kind: "stretch" };
  if ((m = url.match(/\/a\/o\/([^/]+)\.mp3/))) return { id: `onset:${m[1]}`, text: `"${m[1]}", first sound held`, kind: "onset" };
  if ((m = url.match(/\/a\/p\/([^/]+)\.mp3/))) return { id: `sound:${m[1]}`, text: `/${m[1]}/`, kind: "sound" };
  if ((m = url.match(/\/a\/s\/([^/]+)\.mp3/))) return { id: `story:${m[1]}`, text: `[story page ${m[1]}]`, kind: "story" };
  return { id: url, text: url, kind: "other" };
}

export interface Ev {
  /** ms from the video's first frame */
  t: number;
  kind: "say" | "paw" | "paw-off" | "ninja" | "pose" | "state" | "tap" | "turn" | "hold" | "beat" | "sfx";
  /** say: until (ms); cut: hushed before its end */
  end?: number;
  cut?: boolean;
  id?: string;
  text?: string;
  words?: number;
  el?: string;
  move?: string;
  add?: string[];
  rem?: string[];
}

async function build(name: string) {
  const dir = join(RUNS, name);
  const meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"));
  const events: any[] = JSON.parse(readFileSync(join(dir, "events.json"), "utf8"));
  const audio: any[] = JSON.parse(readFileSync(join(dir, "audio.json"), "utf8"));
  const t0: number = meta.videoT0;
  const rel = (t: number) => Math.round(t - t0);
  const out: Ev[] = [];

  // ---- speech
  const stops = new Map<number, number>();
  for (const a of audio) if (a.kind === "stop" && a.sid) stops.set(a.sid, a.t);
  const mixIn: { file: string; at: number; ms: number; vol: number }[] = [];
  for (const a of audio) {
    if (a.kind === "speech") {
      const c = await clip(meta.base, a.url);
      const d = describe(a.url);
      const full = c?.ms ?? 1000;
      const stop = a.sid ? stops.get(a.sid) : undefined;
      const cut = stop != null && stop < a.t + full - 60;
      const end = cut ? stop! : a.t + full;
      out.push({ t: rel(a.t), end: rel(end), kind: "say", id: d.id, text: d.text, cut, words: d.kind === "line" ? d.text.split(/\s+/).filter(Boolean).length : 1 });
      if (c) mixIn.push({ file: c.file, at: rel(a.t), ms: end - a.t, vol: 1 });
    } else if (a.kind === "sfx") {
      const n = String(a.url).slice(4);
      out.push({ t: rel(a.t), kind: "sfx", id: n });
      const f = join(dir, "sfx", `${n}.wav`);
      if (existsSync(f)) mixIn.push({ file: f, at: rel(a.t), ms: 4000, vol: 0.4 });
    }
  }
  // ---- the page's events
  let lastPose = "", lastBeat = "", turnOpen = false, held = false;
  for (const e of events) {
    const t = rel(e.t);
    if (e.k === "paw") {
      if (e.on) out.push({ t, kind: "paw", el: e.over, id: String(e.id) });
      else if (e.on === false) out.push({ t, kind: "paw-off", id: String(e.id) });
    } else if (e.k === "ninja") {
      if (e.m === "pose" && e.pose == null) continue;
      const tgt = e.target?.el ?? e.to?.el ?? (e.target ? `(${e.target.x}, ${e.target.y})` : e.to ? `(${e.to.x}, ${e.to.y})` : "");
      out.push({ t, kind: "ninja", id: e.m, move: e.move ?? e.pose ?? "", el: tgt, text: e.soft ? "soft" : "" });
    } else if (e.k === "pose") {
      if (e.pose === lastPose) continue;
      lastPose = e.pose;
      out.push({ t, kind: "pose", move: e.pose });
    } else if (e.k === "cls") {
      if (e.cls === "help-btn" || e.cls === "wu-bead") continue;
      out.push({ t, kind: "state", el: e.el, add: e.add, rem: e.rem, id: e.cls });
    } else if (e.k === "tap") {
      out.push({ t, kind: "tap", el: e.el });
    } else if (e.k === "state") {
      const s = e.s ?? {};
      if (s.beat && s.beat !== lastBeat) {
        lastBeat = s.beat;
        out.push({ t, kind: "beat", id: `${s.scene}:${s.beat}` });
      } else if (!s.beat && s.scene && `${s.scene}` !== lastBeat) {
        lastBeat = `${s.scene}`;
        out.push({ t, kind: "beat", id: `${s.scene}` });
      }
      const open = s.next != null && s.busy !== true && s.locked !== true && (s.scene !== "warmup" || s.asked === true);
      if (open && !turnOpen) out.push({ t, kind: "turn", el: String(s.next) });
      turnOpen = open;
    } else if (e.k === "nav") {
      const h = e.n?.next === "ready";
      if (h && !held) out.push({ t, kind: "hold", id: e.n?.pres ?? "" });
      held = h;
    }
  }
  out.sort((a, b) => a.t - b.t);
  writeFileSync(join(dir, "timeline.json"), JSON.stringify(out, null, 0));

  // ---- a readable timeline
  const fmt = (ms: number) => (ms / 1000).toFixed(2);
  const rows: string[] = [`# ${meta.title}`, "", `${meta.url} · recorded ${new Date(meta.loadAt).toISOString()} · 844×390, touch, real speed · times are seconds from the video's first frame`, "", "| t (s) | what | detail |", "|---|---|---|"];
  for (const e of out) {
    const d =
      e.kind === "say" ? `**${e.text}** (${e.id}, until ${fmt(e.end!)}${e.cut ? ", cut short" : ""})`
      : e.kind === "paw" ? `the paw appears over **${e.el}**`
      : e.kind === "paw-off" ? "the paw goes"
      : e.kind === "ninja" ? `ninja.${e.id}(${e.move}${e.el ? ` → ${e.el}` : ""}${e.text ? `, ${e.text}` : ""})`
      : e.kind === "pose" ? `pose ${e.move}`
      : e.kind === "state" ? `${e.el} (${e.id}) ${e.add?.map((x) => `+${x}`).join(" ") ?? ""} ${e.rem?.map((x) => `-${x}`).join(" ") ?? ""}`
      : e.kind === "tap" ? `CHILD TAPS **${e.el}**`
      : e.kind === "turn" ? `the child's turn opens (answer: ${e.el})`
      : e.kind === "hold" ? `held on Next (${e.id})`
      : e.kind === "beat" ? `— ${e.id} —`
      : e.kind === "sfx" ? `sfx ${e.id}`
      : "";
    rows.push(`| ${fmt(e.t)} | ${e.kind} | ${d} |`);
  }
  writeFileSync(join(dir, "timeline.md"), rows.join("\n") + "\n");

  // ---- the soundtrack, and the film with it
  const raw = join(dir, "raw.mp4");
  const vdur = Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", raw]).trim());
  const wav = join(dir, "mix.wav");
  const inputs: string[] = [];
  const filters: string[] = [];
  const use = mixIn.filter((m) => m.at >= 0 && m.at < vdur * 1000);
  use.forEach((m, i) => {
    inputs.push("-i", m.file);
    filters.push(`[${i + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${(Math.max(50, m.ms) / 1000).toFixed(3)},volume=${m.vol},adelay=${m.at}|${m.at}[a${i}]`);
  });
  const graph = `${filters.join(";")};[0:a]${use.map((_, i) => `[a${i}]`).join("")}amix=inputs=${use.length + 1}:normalize=0:duration=first,alimiter=limit=0.95:latency=1[out]`;
  const gfile = join(dir, "mix.filter");
  writeFileSync(gfile, graph);
  run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-t", vdur.toFixed(3), "-i", "anullsrc=r=48000:cl=stereo", ...inputs, "-/filter_complex", gfile, "-map", "[out]", "-c:a", "pcm_s16le", wav]);
  const fin = join(dir, "final.mp4");
  if (existsSync(fin)) {
    const trash = join(ROOT, ".trash", "demo-inventory");
    mkdirSync(trash, { recursive: true });
    renameSync(fin, join(trash, `${Date.now()}-${name}-final.mp4`));
  }
  run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-i", wav, "-vf", "scale=844:390:flags=lanczos,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", fin]);
  console.log(`${name}: ${out.length} events, ${use.length} sounds mixed, ${vdur.toFixed(1)} s → ${fin}`);
}

const names = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(RUNS).filter((d) => existsSync(join(RUNS, d, "meta.json")));
for (const n of names) await build(n);
process.exit(0);
