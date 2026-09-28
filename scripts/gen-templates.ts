// Render speech templates (docs/SPEECH_TEMPLATES.md §3): every piece a template needs, for every value the content can
// reach, as one Gemini TTS take each, checked by machine gates and the judge, into /a/t/<template>/<piece>-<key>.mp3
// with public/a/t/manifest.json listing what is recorded (src/engine/speech.ts reads it).
//
//   bun scripts/gen-templates.ts --dry [--unit R|Y1|all|IC5] [--only w_say_slowly,…]   the plan: what would be rendered
//   bun scripts/gen-templates.ts --check [--unit R]                                     the coverage check (exit 1 if a clip is missing)
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/gen-templates.ts [--unit R] [--only …] [--limit 20 [--spread]]
//
// Options: --unit (default R: Initial Code and the Bridging Unit; Y1 to EC26; all; or a unit id) · --only ids · --limit N
// (the first N members of each template, or N spread across them with --spread: the listening samples) · --takes N (2)
// · --concurrency N (4) · --judge-rate R (0.05) · --no-judge · --tighten MS (100; 0 turns the fluency repair off) · --force
// (re-render what is recorded) · --root DIR (default public/a/t; a trial run can go to playtest/runs/…) · --voice ·
// --model · --whisper (small.en).
//
// How a piece is made (§3.2–§3.5):
//   - Plain text only (Gemini reads instructions aloud). A lead-in ends on "..." and is recorded suspended; a
//     continuation starts with "..."; a function word or homograph is quoted ("Say 'at' slowly.", R10).
//   - Each take is finished (trimmed, 25 ms fades, −16 LUFS, −19 under 1.2 s, −1.5 dBTP) at 24 kHz and encoded to MP3
//     48 kbps CBR; a lead-in keeps up to 300 ms of its own tail, so the breath before a pure sound isn't digital silence.
//   - Gates on every take: Whisper hears the text word for word and every value in it; no letter names; pace (3.3 words
//     a second, 4.0 for a piece under 6 words); loudness; a sane length; FLUENCY (no silence of 250 ms or more inside a
//     phrase; the most fluent take is kept, and a piece that talks about a word keeps trying for one under 150 ms); a
//     lead-in's tail (falls ≤ 2 semitones, clean); no stray sound before the first word.
//   - Takes: 2, then more while failing, up to 4 (6 for a lead-in or a piece about a word). The judge (Gemini) hears
//     every fixed piece, each template's first 20 members, every R10 value and BATH word, anything Whisper was unsure of,
//     and 5% of the rest; under 8 fails the take.
//   - The fluency repair: if no take gets its odd pauses under 150 ms, the best one's odd pauses are shortened to 100 ms
//     (silence only; the result is gated again). Gemini pauses round a word a sentence talks about ("Say… mat… slowly").
//   - A piece whose takes all fail is listed in the manifest's `failed` and never shipped: its template's fallback plays.
// Idempotent and resumable: a piece whose file exists and whose input hash (voice, model, exact text, finishing) matches
// the manifest is skipped; each finished piece is appended to a journal first, and the journal is replayed on the next
// start. Masters (FLAC) go to assets-src/speech/t/, which git ignores. Pure sounds (/a/p/) are never touched.
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { execFileSync, spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { TEMPLATE_LIST, check, members, picturesWithoutNoun, renderJobs, tierOf, type ContentWord, type RenderJob, type TemplateContent, type TemplateDef } from "../src/content/templates";
import { decodeTemplateClip } from "../src/content/templates-decode";
import type { ManifestEntry, TemplateManifest } from "../src/engine/speech";
import { SW_SEQUENCE, gpcsOfUnit, OFFICIAL_SWAP_CHAINS, type SwUnitId } from "../src/content/sw";
import { GRAPHEMES, ORAL_WORDS, PHONEMES, WORDS, unitOfSpelling, type PhonemeId } from "../src/content/phonics";
import { LEVELS } from "../src/content/worlds";
import { TEACH_EXAMPLES } from "../src/content/teach-lines.gen";
import { wordCount } from "./lib/words";

// ---------------------------------------------------------------- options
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const flag = (k: string) => args.includes(`--${k}`);
const arg = (k: string, d?: string) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 && args[i + 1] != null && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};
const DEFAULT_OUT = resolve(ROOT, "public/a/t");
const OUT = resolve(ROOT, arg("root", "public/a/t")!);
const RUNS = resolve(ROOT, arg("runs") ?? (OUT === DEFAULT_OUT ? "playtest/runs/speech-templates/gen" : join(OUT, "_gen")));
const MASTERS = resolve(ROOT, arg("masters") ?? (OUT === DEFAULT_OUT ? "assets-src/speech/t" : join(OUT, "_masters")));
const MANIFEST = join(OUT, "manifest.json");
const JOURNAL = join(RUNS, "journal.jsonl");
/** Pinned for templates (§3.6, risk 7): a model change re-renders every template, so it is never implicit. */
const MODEL = arg("model", "gemini-3.8-flash-tts")!;
/** Sensei's voice: the game's (scripts/gen-audio.ts VOICES.sensei; Erinome since DECISIONS 27 Sep). */
const VOICE = arg("voice") ?? readFileSync(join(ROOT, "scripts/gen-audio.ts"), "utf8").match(/VOICES\s*=\s*\{\s*sensei:\s*"(\w+)"/)?.[1] ?? "Erinome";
const RATE = 24000;
const KBPS = 48;
/** The finishing, in the input hash: change it and every piece re-renders. */
const FINISH = `mp3 ${RATE} Hz ${KBPS}k CBR; trim 30/60 ms, lead-in tail 300 ms; fades 25 ms; -16 LUFS (-19 under 1.2 s); -1.5 dBTP; pad 30 ms`;
const UNIT = arg("unit", "R")!;
const ONLY = arg("only")?.split(",").filter(Boolean);
const LIMIT = arg("limit") ? Number(arg("limit")) : Infinity;
const SPREAD = flag("spread");
const TAKES = Math.max(1, Number(arg("takes", "2")));
const CONCURRENCY = Math.max(1, Number(arg("concurrency", "4")));
const JUDGE_RATE = Number(arg("judge-rate", "0.05"));
const JUDGE = !flag("no-judge");
const FORCE = flag("force");
const WHISPER = arg("whisper", "small.en")!;
/** The fluency repair: odd pauses in the chosen take shortened to this many ms (0: off). */
const TIGHTEN = Number(arg("tighten", "100"));

// the gates (§3.3, with the critic's amendments)
const MAX_FALL = 2;
const AIM_FALL = 1.5;
const MAX_SILENCE = 250;
const AIM_SILENCE = 150;
const PACE_LONG = 3.3;
const PACE_SHORT = 4.0;
const JUDGE_MIN = 8;
const UNSURE_LOGPROB = -0.45;
const CAP = { plain: 4, lead: 6, about: 6 };
/** BATH words: the long British /ɑː/ (TEACHER_SCRIPT §9.8). Sulafat and Erinome say "fast" and "last" with /æ/ often. */
const BATH = /\b(last|fast|past|after|ask|asked|bath|path|grass|glass|class|plant|can't|rather|castle|dance|chance|answer|branch|laugh|half|calm|palm)\b/i;

// ---------------------------------------------------------------- the content
const unitIndex = (id: string) => SW_SEQUENCE.indexOf(id as SwUnitId);
/** phonics.ts's game units 1–11 are Initial Code Units 1–11; unit 12 starts the Extended Code. */
const gameUnit = (n: number) => (n <= 11 ? unitIndex(`IC${n}`) : unitIndex("EC1"));
function maxUnitOf(u: string): number {
  if (u === "all") return Infinity;
  const i = unitIndex(u === "R" ? "BR" : u === "Y1" ? "EC26" : u);
  if (i < 0) throw new Error(`--unit ${u}: use R, Y1, all or a unit id (${SW_SEQUENCE.slice(0, 3).join(", ")}…)`);
  return i;
}
type Segs = { g: string; p: string }[];
const parseSegs = (spec: string): Segs => spec.split(".").map((part) => {
  const [g, p] = part.split("=");
  return { g, p: p ?? GRAPHEMES[g] ?? g };
});

async function buildContent(): Promise<TemplateContent & { segs: Map<string, Segs> }> {
  const words = new Map<string, ContentWord>();
  const pictures = new Map<string, ContentWord>();
  const add = (m: Map<string, ContentWord>, w: ContentWord) => {
    const o = m.get(w.text);
    if (!o || w.unit < o.unit) m.set(w.text, { ...w, segs: w.segs ?? o?.segs });
    else if (!o.segs && w.segs) m.set(w.text, { ...o, segs: w.segs });
  };
  const chains: { unit: number; words: readonly string[] }[] = [];
  for (const id of SW_SEQUENCE) {
    const u = unitIndex(id);
    let mod: { words?: { text: string; segs: string; pic?: string; tags?: readonly string[] }[]; chains?: readonly (readonly string[])[] };
    try {
      mod = await import(`../src/content/units/${id}.ts`);
    } catch {
      continue;
    }
    for (const w of mod.words ?? []) {
      const cw = { text: w.text, unit: u, segs: parseSegs(String(w.segs)) };
      add(words, cw);
      if (w.pic || w.tags?.includes("picture")) add(pictures, cw);
    }
    for (const ch of mod.chains ?? []) chains.push({ unit: u, words: ch });
  }
  // today's game (phonics.ts), which runs ahead of the unit files in places
  for (const w of WORDS) {
    const cw = { text: w.text, unit: gameUnit(w.unit), segs: w.segs };
    add(words, cw);
    if (w.pic) add(pictures, cw);
  }
  for (const [text, o] of Object.entries(ORAL_WORDS)) add(pictures, { text, unit: 0, segs: (o.segs ?? [o.first]).map((p) => ({ g: p, p })) });
  for (const l of LEVELS) if (l.chain) chains.push({ unit: gameUnit(Math.max(...l.units)), words: l.chain });
  for (const c of OFFICIAL_SWAP_CHAINS) if (!c.nonsense) chains.push({ unit: unitIndex(c.unit), words: c.chain });
  // spellings, with the canonical pinned example (SPT6), at the first unit that teaches them
  const gpcUnit = new Map<string, number>();
  for (const id of SW_SEQUENCE) for (const k of gpcsOfUnit(id)) if (!gpcUnit.has(k)) gpcUnit.set(k, unitIndex(id));
  const spellings = Object.entries(TEACH_EXAMPLES).flatMap(([k, ex]) => {
    if (!k.startsWith("gem:") || !ex[0]) return [];
    const key = k.slice(4);
    const [g, p] = key.split(">");
    return [{ unit: gpcUnit.get(key) ?? gameUnit(unitOfSpelling(g)), key, p, example: ex[0] }];
  });
  const byUnit = <T extends { unit: number }>(xs: T[]) => xs.sort((a, b) => a.unit - b.unit);
  const segs = new Map<string, Segs>();
  for (const w of [...words.values(), ...pictures.values()]) if (w.segs) segs.set(w.text, [...w.segs]);
  return { words: byUnit([...words.values()]), pictures: byUnit([...pictures.values()]), chains: byUnit(chains), spellings: byUnit(spellings), segs };
}

// ---------------------------------------------------------------- the plan
interface Job extends RenderJob { h: string; pk: string; unit: number; member: number; file: string; bath: boolean; ipa: Record<string, string> }
const sha = (s: string) => createHash("sha1").update(s).digest("hex");
/** The input hash: everything that changes the audio, nothing else (§3.6, critic: no pipeline version). */
const inputHash = (text: string) => sha(JSON.stringify([VOICE, MODEL, text, FINISH])).slice(0, 8);
function pick<T>(xs: T[]): T[] {
  if (xs.length <= LIMIT) return xs;
  if (!SPREAD) return xs.slice(0, LIMIT);
  return Array.from({ length: LIMIT }, (_, i) => xs[Math.floor((i * xs.length) / LIMIT)]);
}
function plan(defs: readonly TemplateDef[], c: Awaited<ReturnType<typeof buildContent>>, maxUnit: number) {
  const jobs: Job[] = [];
  const perTemplate = new Map<string, { members: number; jobs: number }>();
  const seen = new Set<string>();
  const ipaOf = (w: string) => (c.segs.get(w) ?? []).map((s) => PHONEMES[s.p as PhonemeId]?.ipa ?? s.p).join("");
  for (const t of defs) {
    const ms = pick(members(t, c, maxUnit));
    let n = 0;
    ms.forEach((m, member) => {
      for (const j of renderJobs(t, m.values)) {
        if (seen.has(j.clip)) continue;
        seen.add(j.clip);
        n++;
        const pk = `${j.piece}-${j.key}`;
        const bath = BATH.test(j.text) || j.words.some((w) => (c.segs.get(w) ?? []).some((s) => s.g === "a" && s.p === "ar"));
        jobs.push({ ...j, h: inputHash(j.text), pk, unit: m.unit, member, file: join(OUT, t.id, `${pk}.mp3`), bath, ipa: Object.fromEntries(j.quoted.map((w) => [w, `/${ipaOf(w)}/`])) });
      }
    });
    perTemplate.set(t.id, { members: ms.length, jobs: n });
  }
  return { jobs, perTemplate };
}

// ---------------------------------------------------------------- the manifest and the journal
function freshManifest(): TemplateManifest {
  return { v: 1, voice: VOICE, model: MODEL, rate: RATE, kbps: KBPS, updated: new Date().toISOString(), templates: {} };
}
/** The manifest on disk, with the journal replayed into it (a crash between a clip's write and the manifest's) and
 *  every entry that no longer matches its template's current words, the voice, the model or the finishing dropped: the
 *  manifest only ever lists what speech.ts may play. */
function loadManifest(): TemplateManifest {
  const m: TemplateManifest = existsSync(MANIFEST) ? { ...freshManifest(), ...JSON.parse(readFileSync(MANIFEST, "utf8")) } : freshManifest();
  if (existsSync(JOURNAL)) {
    for (const line of readFileSync(JOURNAL, "utf8").split("\n")) {
      if (!line.trim()) continue;
      let e: { tpl: string; pk: string; ok: boolean; entry?: ManifestEntry; reason?: string };
      try {
        e = JSON.parse(line);
      } catch {
        continue;
      }
      const t = (m.templates[e.tpl] ??= { text: "", entries: {} });
      if (e.ok && e.entry && existsSync(join(OUT, e.tpl, `${e.pk}.mp3`))) {
        t.entries[e.pk] = e.entry;
        if (t.failed) delete t.failed[e.pk];
      } else if (!e.ok && e.reason && !t.entries[e.pk]) (t.failed ??= {})[e.pk] = e.reason;
    }
  }
  let stale = 0;
  for (const [id, t] of Object.entries(m.templates)) {
    const def = TEMPLATE_LIST.find((x) => x.id === id);
    if (!def) continue; // a template this build doesn't know: left alone
    t.text = def.text;
    for (const [pk, e] of Object.entries(t.entries)) {
      const d = decodeTemplateClip(`t:${id}/${pk}`);
      if (!d || e.h !== inputHash(d.text) || !existsSync(join(OUT, id, `${pk}.mp3`))) {
        delete t.entries[pk];
        stale++;
      }
    }
  }
  if (stale) console.log(`${stale} manifest entries dropped as stale (their words, the voice, the model or the finishing changed, or the file is gone)`);
  m.voice = VOICE;
  m.model = MODEL;
  return m;
}
function writeManifest(m: TemplateManifest) {
  mkdirSync(OUT, { recursive: true });
  m.updated = new Date().toISOString();
  const sorted: TemplateManifest = { ...m, templates: {} };
  for (const id of Object.keys(m.templates).sort()) {
    const t = m.templates[id];
    sorted.templates[id] = { text: t.text, entries: Object.fromEntries(Object.entries(t.entries).sort(([a], [b]) => a.localeCompare(b))) };
    if (t.failed && Object.keys(t.failed).length) sorted.templates[id].failed = t.failed;
  }
  // compact for the phones that fetch it, one piece a line for readable diffs
  const J = JSON.stringify;
  const body = Object.entries(sorted.templates).map(([id, t]) =>
    `${J(id)}:{"text":${J(t.text)},"entries":{${Object.entries(t.entries).map(([pk, e]) => `\n${J(pk)}:${J(e)}`).join(",")}}${t.failed ? `,"failed":${J(t.failed)}` : ""}}`);
  const head = J({ ...sorted, templates: undefined }).slice(0, -1);
  const tmp = `${MANIFEST}.tmp`;
  writeFileSync(tmp, `${head},"templates":{\n${body.join(",\n")}\n}}\n`);
  renameSync(tmp, MANIFEST);
}
const journal = (e: Record<string, unknown>) => {
  mkdirSync(RUNS, { recursive: true });
  appendFileSync(JOURNAL, JSON.stringify({ at: new Date().toISOString(), ...e }) + "\n");
};
const isFresh = (m: TemplateManifest, j: Job) => m.templates[j.tpl]?.entries[j.pk]?.h === j.h && existsSync(j.file);

// ---------------------------------------------------------------- the QA worker: Whisper, speech edges, silences, tail
const QA_PY = String.raw`
import sys, json, re, subprocess, difflib, tempfile
import numpy as np
from faster_whisper import WhisperModel
GLOSSARY = "Sensei Maple, Kai, Suki, Baron Muddle, ninja, Sound Swap."
NUMS = {str(i): w for i, w in enumerate("zero one two three four five six seven eight nine ten eleven twelve".split())}
ALIAS = {"kye": "kai", "ky": "kai", "sookie": "suki", "sukey": "suki", "okay": "ok", "practice": "practise", "too": "to", "two": "to"}
LETTER_NAMES = {"ess", "em", "en", "tee", "dee", "bee", "cee", "pee", "kay", "gee", "jay", "aitch", "haitch", "eff", "el", "ell", "zed", "zee", "ex", "vee", "double", "ay"}
HOMOPHONES = [{"mat", "matt", "matte"}, {"pie", "pi"}, {"tray", "trey"}, {"bee", "b", "be"}, {"for", "four"}, {"sun", "son"}, {"sea", "see", "c"},
              {"tea", "tee", "t"}, {"knight", "night"}, {"high", "hi"}, {"tail", "tale"}, {"write", "right"}, {"won", "one"}, {"pan", "pam"},
              {"sock", "sok"}, {"yak", "yack"}, {"kit", "kitt"}, {"which", "witch"}, {"in", "inn"}]

def norm(t):
    t = t.lower().replace("…", " ").replace("...", " ").replace("-", " ").replace("’", "'")
    t = re.sub(r"[^a-z0-9' ]+", " ", t)
    out = []
    for w in t.split():
        w = w.strip("'")
        w = NUMS.get(w, w)
        out.append(ALIAS.get(w, w))
    return [w for w in out if w]

def same(x, y):
    return x == y or any(x in h and y in h for h in HOMOPHONES)

def homophones(want, got):
    return len(want) == len(got) and all(same(x, y) for x, y in zip(want, got))

def has_seq(got, want):
    n = len(want)
    return n == 0 or any(all(same(g, w) for g, w in zip(got[i:i + n], want)) for i in range(len(got) - n + 1))

def pcm(p, sr=16000):
    raw = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", p, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)

def shape(x, sr=16000, ms=5, below=40.0):
    """Speech edges and inner silences on 5 ms frames, relative to the clip's peak (peak - 40 dB: a quiet /h/ or /f/
    onset isn't found late). A short island before a pause at the very start is a stray breath or click."""
    hop = sr * ms // 1000
    n = len(x) // hop
    if n < 2: return {"on": 0, "off": 0, "silences": [], "head": None}
    db = 10 * np.log10((x[: n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-12)
    loud = db > db.max() - below
    idx = np.where(loud)[0]
    a, b = int(idx[0]), int(idx[-1])
    runs, start = [], a
    for i in range(a + 1, b + 2):
        if i > b or loud[i] != loud[start]:
            runs.append((start, i - start, bool(loud[start])))
            start = i
    silences = sorted(([l * ms, s * ms] for s, l, isl in runs if not isl and l * ms >= 60), reverse=True)
    head = runs[0][1] * ms if len(runs) >= 3 and runs[0][1] * ms < 120 and runs[1][1] * ms >= 100 else None
    return {"on": a * ms, "off": (b + 1) * ms, "silences": silences, "head": head}

def tail_fall(p):
    """gen-audio.ts tailFalls(): the fall (semitones) of a line fitted to the last 300 ms of voicing, by the gate's
    measure (120-500 Hz, frames over 6 st from the median dropped) and the low-floor one (75 Hz, octaves folded)."""
    import parselmouth
    with tempfile.TemporaryDirectory() as td:
        wav = td + "/a.wav"
        subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", p, "-ac", "1", "-ar", "24000", wav], check=True)
        s = parselmouth.Sound(wav)
    def fit(t, st):
        return round(float(-np.polyfit(t, st, 1)[0] * (t[-1] - t[0])), 2) if len(t) >= 4 else None
    out = {}
    for name, floor in (("gate", 120), ("low", 75)):
        pitch = s.to_pitch_ac(time_step=0.01, pitch_floor=floor, pitch_ceiling=500)
        f = pitch.selected_array["frequency"]; t = pitch.xs()
        v = np.where(f > 0)[0]
        if len(v) < 5: out[name] = None; continue
        st = 12 * np.log2(np.maximum(f, 1) / 100)
        if name == "gate":
            m = (t >= t[v[-1]] - 0.3) & (f > 0)
            tt, ff = t[m], st[m]
            if len(tt) < 4: out[name] = None; continue
            keep = np.abs(ff - np.median(ff)) < 6
            out[name] = fit(tt[keep], ff[keep])
        else:
            for a, b in zip(v[:-1], v[1:]):
                while st[b] - st[a] > 7: st[b] -= 12
                while st[a] - st[b] > 7: st[b] += 12
            m = [i for i in v if t[i] >= t[v[-1]] - 0.3]
            out[name] = fit(t[m], st[m])
    return out

def check(req):
    p, text = req["file"], req["text"]
    segs, _ = model.transcribe(p, language="en", beam_size=5, temperature=0, condition_on_previous_text=False, initial_prompt=GLOSSARY, vad_filter=False)
    segs = list(segs)
    heard = " ".join(s.text.strip() for s in segs).strip()
    want, got = norm(text), norm(heard)
    ops = [o for o in difflib.SequenceMatcher(None, want, got).get_opcodes() if o[0] != "equal"]
    ops = [o for o in ops if not (o[0] == "replace" and homophones(want[o[1]:o[2]], got[o[3]:o[4]]))]
    exact = not ops or "".join(want) == "".join(got)
    extra = [w for o in ops for w in got[o[3]:o[4]]]
    letters = sorted({w for w in extra if w not in want and (w in LETTER_NAMES or (len(w) == 1 and w not in ("a", "i")))})
    x = pcm(p)
    sh = shape(x)
    inner = text.strip().lstrip(".").rstrip(".?!… ")
    allowed = len(re.findall(r"[.?!,;:…]+(?=\s)", inner))
    odd = sh["silences"][allowed:]  # the longest pauses are taken to be the punctuation's; the rest are odd
    out = {"heard": heard, "exact": exact, "diff": [f"{op} {' '.join(want[a1:a2])!r}->{' '.join(got[b1:b2])!r}" for op, a1, a2, b1, b2 in ops][:4],
           "letters": letters, "words": all(has_seq(got, norm(w)) for w in req.get("words", [])),
           "logprob": round(float(np.mean([s.avg_logprob for s in segs])), 3) if segs else -9.0,
           "ms": int(round(len(x) / 16)), "on": sh["on"], "off": sh["off"], "pauses": [d for d, _ in sh["silences"][:6]],
           "silence": odd[0][0] if odd else 0, "odd": odd, "head": sh["head"]}
    if req.get("lead"): out["fall"] = tail_fall(p)
    return out

# float32: CTranslate2's int8 path is about 5x slower on Apple silicon (measured 27 Sep: 11 s against 2 s a clip)
model = WhisperModel(sys.argv[1], device="cpu", compute_type="float32", cpu_threads=6)
print(json.dumps({"ready": True}), flush=True)
for line in sys.stdin:
    if not line.strip(): continue
    req = json.loads(line)
    try: out = check(req)
    except Exception as e: out = {"error": repr(e)[:300]}
    out["id"] = req["id"]
    print(json.dumps(out), flush=True)
`;
interface Qa {
  heard: string; exact: boolean; diff: string[]; letters: string[]; words: boolean; logprob: number;
  /** `silence`: the longest odd pause (ms); `odd`: every odd pause as [ms, where it starts (ms)], longest first */
  ms: number; on: number; off: number; pauses: number[]; silence: number; odd: [number, number][]; head: number | null;
  fall?: { gate: number | null; low: number | null }; error?: string;
}
class QaWorker {
  private proc: ChildProcessWithoutNullStreams;
  private pending = new Map<number, (r: Qa) => void>();
  private n = 0;
  private buf = "";
  private dead: string | null = null;
  readonly ready: Promise<void>;
  constructor() {
    this.proc = spawn("uv", ["run", "-q", "--with", "numpy", "--with", "praat-parselmouth", "--with", "faster-whisper", "python", "-u", "-c", QA_PY, WHISPER], { cwd: ROOT });
    let onReady: () => void = () => {};
    this.ready = new Promise((r) => (onReady = r));
    this.proc.stdout.setEncoding("utf8");
    this.proc.stdout.on("data", (d: string) => {
      this.buf += d;
      for (let i = this.buf.indexOf("\n"); i >= 0; i = this.buf.indexOf("\n")) {
        const line = this.buf.slice(0, i).trim();
        this.buf = this.buf.slice(i + 1);
        if (!line.startsWith("{")) continue;
        const r = JSON.parse(line);
        if (r.ready) {
          onReady();
          continue;
        }
        this.pending.get(r.id)?.(r);
        this.pending.delete(r.id);
      }
    });
    this.proc.stderr.setEncoding("utf8");
    this.proc.stderr.on("data", (d: string) => /error|Traceback/i.test(d) && process.stderr.write(`[qa] ${d}`));
    this.proc.on("exit", (code) => {
      this.dead = `the QA worker exited (${code})`;
      onReady();
      for (const f of this.pending.values()) f({ error: this.dead } as Qa);
      this.pending.clear();
    });
  }
  async check(req: { file: string; text: string; lead: boolean; words: string[] }): Promise<Qa> {
    await this.ready;
    if (this.dead) throw new Error(this.dead);
    const id = ++this.n;
    return new Promise((res) => {
      this.pending.set(id, res);
      this.proc.stdin.write(JSON.stringify({ id, ...req }) + "\n");
    });
  }
  close() {
    this.proc.stdin.end();
  }
}

// ---------------------------------------------------------------- one piece: takes, gates, the best take
type Tts = typeof import("./tts");
interface Take { i: number; mp3: string; flac: string; qa: Qa; seconds: number; lufs: number; target: number; wps: number; fall: number | null; blip: number | null; fails: string[]; judge?: { score: number; heard: string; notes: string }; tightened?: number }
const ff = (...a: string[]) => execFileSync("ffmpeg", ["-nostdin", "-loglevel", "error", "-y", ...a]);
const withTimeout = <T>(p: Promise<T>, ms: number, what: string) =>
  Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`${what}: no answer in ${ms / 1000} s`)), ms))]);

/** Trim, fade, level and encode one take: a FLAC master and the MP3 that ships (§3.5). */
function finish(T: Tts, wav: Buffer, job: Job, flac: string, mp3: string): { seconds: number; lufs: number; target: number } {
  const dir = join(RUNS, "tmp", job.tpl, job.pk);
  mkdirSync(dir, { recursive: true });
  mkdirSync(dirname(flac), { recursive: true });
  const inp = join(dir, "in.wav");
  const trimmed = join(dir, "trim.wav");
  writeFileSync(inp, wav);
  const tail = job.lead ? 0.3 : 0.06;
  const trim = `silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=${tail},areverse`;
  const fades = `afade=t=in:d=0.025,areverse,afade=t=in:d=${job.lead ? 0.01 : 0.025},areverse`;
  ff("-i", inp, "-af", `${trim},${fades}`, "-ar", String(RATE), "-ac", "1", trimmed);
  const target = T.durationOf(trimmed) + 0.03 < 1.2 ? -19 : -16;
  const gain = T.gainTo(trimmed, target);
  ff("-i", trimmed, "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=${Math.pow(10, -1.5 / 20).toFixed(4)}:level=disabled,apad=pad_dur=0.03`, "-ar", String(RATE), "-ac", "1", "-c:a", "flac", flac);
  ff("-i", flac, "-ar", String(RATE), "-ac", "1", "-c:a", "libmp3lame", "-b:a", `${KBPS}k`, mp3);
  return { seconds: T.durationOf(mp3), lufs: T.measureLufs(mp3), target };
}

function gates(job: Job, t: Omit<Take, "fails">): string[] {
  const f: string[] = [];
  if (t.qa.error) return [`qa: ${t.qa.error}`];
  if (!t.qa.exact) f.push(`Whisper heard "${t.qa.heard}"`);
  if (!t.qa.words) f.push(`a value wasn't heard (${job.words.join(", ")})`);
  if (t.qa.letters.length) f.push(`letter names: ${t.qa.letters.join(" ")}`);
  const n = wordCount(job.text);
  if (n >= 2 && t.wps > (n >= 6 ? PACE_LONG : PACE_SHORT)) f.push(`pace ${t.wps.toFixed(2)} words/s`);
  if (Number.isFinite(t.lufs) && t.lufs > -60 && Math.abs(t.lufs - t.target) > 1) f.push(`loudness ${t.lufs} LUFS (want ${t.target})`);
  // a gross-error catch (extra words read out, a take cut short), looser than §3.3's 0.6–1.8 for the shortest pieces
  const est = n / 2.6 + 0.25 + (job.lead ? 0.3 : 0);
  if (t.seconds < 0.5 * est || t.seconds > 1.8 * est) f.push(`length ${t.seconds.toFixed(2)} s (about ${est.toFixed(2)} expected)`);
  if (t.qa.silence >= MAX_SILENCE) f.push(`a ${t.qa.silence} ms pause inside a phrase`);
  if (t.qa.head != null) f.push(`a stray ${t.qa.head} ms sound before the first word`);
  if (job.lead && t.fall != null && t.fall > MAX_FALL) f.push(`the tail falls ${t.fall} semitones`);
  if (job.lead && t.blip != null) f.push(`a ${t.blip} s sound after the last word`);
  return f;
}
/** Passing first, then the fewest faults, then (a lead-in) the least fall, then the shortest odd pause, then a pace
 *  nearest Sensei's, then Whisper's confidence. */
const better = (job: Job) => (a: Take, b: Take) =>
  a.fails.length - b.fails.length || (job.lead ? (a.fall ?? 0) - (b.fall ?? 0) : 0) || a.qa.silence - b.qa.silence || Math.abs(a.wps - 2.8) - Math.abs(b.wps - 2.8) || b.qa.logprob - a.qa.logprob;

function rubric(job: Job): string {
  const said = job.text.replace(/^\.\.\./, "").replace(/\.\.\.$/, "");
  return (
    `The clip should be a warm, calm British (Southern English) teacher saying exactly this to a four-year-old, as ONE natural take: "${said}". ` +
    `Score 10 if every word matches, the accent is British, and it sounds like one fluent sentence a teacher would say. Score 6 or less for a word missing, added or wrong, an odd pause around a word, a rushed, barked or shouted delivery, or an American accent. ` +
    (job.quoted.length ? `${job.quoted.map((w) => `"${w}" (${job.ipa[w]})`).join(" and ")} is a word being talked about: it must be said in its full, strong form. Score 5 or less for a weak or reduced form. ` : "") +
    (job.bath ? `A BATH word (last, fast, after, ask, path, grass…) must have the long British vowel /ɑː/, never the American /æ/: score 5 or less if not. ` : "") +
    (job.lead ? `It is a lead-in: a pure speech sound plays straight after it, so it must end cleanly on its last word, suspended, as if more is coming. Score 4 or less for a breath, hiss, click or extra sound after it, and 6 or less for a finished, falling full-stop ending. ` : "") +
    (job.cont ? `It carries on a sentence after a pause, so it starts straight on its first word, with no breath before it. ` : "")
  );
}
const judgeWanted = (job: Job, t: Take) =>
  JUDGE && (!job.words.length || job.member < 20 || job.quoted.length > 0 || job.bath || t.qa.logprob < UNSURE_LOGPROB || parseInt(sha(job.clip).slice(0, 8), 16) / 0xffffffff < JUDGE_RATE);

/** The fluency repair (the critic's risk 1: Gemini pauses round a word the sentence talks about, "Say… mat… slowly").
 *  When no take gets its odd pauses under AIM_SILENCE, the best take's odd pauses are shortened to TIGHTEN ms: only the
 *  middle of each pause is cut (every cut is in silence, 40 dB under the peak, so nothing clicks), the rest of the take
 *  is untouched, and the result goes through every gate again. Punctuation's own pauses are never touched. */
async function tighten(T: Tts, qa: QaWorker, job: Job, t: Take): Promise<Take | null> {
  const cuts = t.qa.odd.filter(([ms]) => ms > TIGHTEN).map(([ms, at]) => [(at + TIGHTEN / 2) / 1000, (at + ms - TIGHTEN / 2) / 1000] as const);
  if (!cuts.length || !t.flac) return null;
  const base = t.mp3.replace(/\.mp3$/, ".tight");
  const expr = cuts.map(([a, b]) => `between(t,${a.toFixed(3)},${b.toFixed(3)})`).join("+");
  ff("-i", t.flac, "-af", `aselect='not(${expr})',asetpts=N/SR/TB`, "-ar", String(RATE), "-ac", "1", "-c:a", "flac", `${base}.flac`);
  ff("-i", `${base}.flac`, "-ar", String(RATE), "-ac", "1", "-c:a", "libmp3lame", "-b:a", `${KBPS}k`, `${base}.mp3`);
  const q = await qa.check({ file: `${base}.mp3`, text: job.text, lead: job.lead, words: job.words });
  const seconds = T.durationOf(`${base}.mp3`);
  const fall = q.fall ? (q.fall.gate == null && q.fall.low == null ? null : Math.max(q.fall.gate ?? -99, q.fall.low ?? -99)) : null;
  const partial = { ...t, mp3: `${base}.mp3`, flac: `${base}.flac`, qa: q, seconds, lufs: T.measureLufs(`${base}.mp3`), wps: wordCount(job.text) / seconds, fall, judge: undefined, tightened: Math.round(cuts.reduce((n, [a, b]) => n + (b - a) * 1000, 0)) };
  return { ...partial, fails: gates(job, partial) };
}

/** One line per take for the journal: what each measured and why it failed (the pilot tunes the gates from these). */
type Tried = { i: number; odd: number; wps: number; fall?: number | null; tight?: number; judge?: number; fails?: string[] };
const tried = (takes: Take[]): Tried[] => takes.map((t) => ({ i: t.i, odd: t.qa.silence, wps: +t.wps.toFixed(2), ...(t.fall != null ? { fall: t.fall } : {}), ...(t.tightened ? { tight: t.tightened } : {}), ...(t.judge ? { judge: t.judge.score } : {}), ...(t.fails.length ? { fails: t.fails } : {}) }));
async function renderPiece(T: Tts, qa: QaWorker, job: Job): Promise<{ ok: true; take: Take; takes: number; tried: Tried[] } | { ok: false; reason: string; takes: number; tried: Tried[] }> {
  const cap = job.lead ? CAP.lead : job.about ? CAP.about : CAP.plain;
  const takes: Take[] = [];
  const passing = () => takes.filter((t) => !t.fails.length).sort(better(job));
  const satisfied = () => {
    const p = passing()[0];
    if (!p || takes.length < Math.min(TAKES, cap)) return false;
    if (job.lead && (p.fall ?? 0) > AIM_FALL) return false; // a lead-in aims at 1.5 semitones
    if (job.about && p.qa.silence >= AIM_SILENCE) return false; // a talked-about word aims under 150 ms
    return true;
  };
  let judged = 0;
  while (takes.length < cap) {
    if (satisfied()) {
      const best = passing()[0];
      if (!judgeWanted(job, best) || best.judge) break;
      best.judge = await T.judgeAudio(best.mp3, rubric(job));
      judged++;
      if (best.judge.score >= JUDGE_MIN) break;
      best.fails.push(`judge ${best.judge.score}: ${best.judge.notes}`);
      continue;
    }
    const i = takes.length;
    const base = join(RUNS, "takes", job.tpl, `${job.pk}.t${i}`);
    mkdirSync(dirname(base), { recursive: true });
    let t: Take;
    try {
      const wav = await withTimeout(T.tts({ text: job.text, voice: VOICE, model: MODEL }), 60_000, "TTS");
      const fin = finish(T, wav, job, `${base}.flac`, `${base}.mp3`);
      const q = await qa.check({ file: `${base}.mp3`, text: job.text, lead: job.lead, words: job.words });
      const fall = q.fall ? (q.fall.gate == null && q.fall.low == null ? null : Math.max(q.fall.gate ?? -99, q.fall.low ?? -99)) : null;
      const partial = { i, mp3: `${base}.mp3`, flac: `${base}.flac`, qa: q, seconds: fin.seconds, lufs: fin.lufs, target: fin.target, wps: wordCount(job.text) / fin.seconds, fall, blip: job.lead ? T.trailingBlip(`${base}.mp3`) : null };
      t = { ...partial, fails: gates(job, partial) };
    } catch (e) {
      if (/QA worker/.test(String(e))) throw e;
      t = { i, mp3: "", flac: "", qa: { error: String(e), silence: 0, logprob: -9 } as Qa, seconds: 0, lufs: NaN, target: -16, wps: 0, fall: null, blip: null, fails: [`take failed: ${String(e).slice(0, 160)}`] };
    }
    takes.push(t);
  }
  // no take under the fluency aim: shorten the odd pauses of the best take that fails on nothing else
  const fluent = passing()[0];
  if (TIGHTEN > 0 && (!fluent || fluent.qa.silence >= AIM_SILENCE)) {
    const only = (t: Take) => t.fails.every((f) => /pause inside a phrase/.test(f));
    const cand = fluent ?? [...takes].filter(only).sort(better(job))[0];
    const tt = cand && cand.qa.silence >= AIM_SILENCE ? await tighten(T, qa, job, cand) : null;
    if (tt && !tt.fails.length) takes.push(tt);
  }
  // after the cap: the best passing take (a lead-in over its 1.5 aim still ships), judged if it should be and wasn't
  const best = passing()[0];
  if (best && judgeWanted(job, best) && !best.judge && judged < 3) {
    best.judge = await T.judgeAudio(best.mp3, rubric(job));
    if (best.judge.score < JUDGE_MIN) best.fails.push(`judge ${best.judge.score}: ${best.judge.notes}`);
  }
  const winner = passing()[0];
  if (winner) return { ok: true, take: winner, takes: takes.length, tried: tried(takes) };
  const nearest = [...takes].sort(better(job))[0];
  return { ok: false, reason: nearest?.fails.join("; ") ?? "no take", takes: takes.length, tried: tried(takes) };
}

// ---------------------------------------------------------------- main
async function main() {
  const defs = TEMPLATE_LIST.filter((t) => !ONLY || ONLY.includes(t.id));
  if (ONLY) for (const id of ONLY) if (!defs.some((t) => t.id === id)) throw new Error(`--only ${id}: no such template (${TEMPLATE_LIST.map((t) => t.id).join(", ")})`);
  const errors = defs.flatMap((t) => check(t).errors);
  if (errors.length) throw new Error(`the grammar (docs/SPEECH_TEMPLATES.md §1.3):\n  ${errors.join("\n  ")}`);
  const maxUnit = maxUnitOf(UNIT);
  const content = await buildContent();
  const { jobs, perTemplate } = plan(defs, content, maxUnit);
  const manifest = loadManifest();
  const todo = jobs.filter((j) => FORCE || !isFresh(manifest, j));
  const rel = (p: string) => relative(ROOT, p);
  console.log(`voice ${VOICE} · ${MODEL} · unit ${UNIT} · ${defs.length} templates · ${jobs.length} pieces, ${jobs.length - todo.length} recorded, ${todo.length} to render → ${rel(OUT)}`);
  const noNoun = picturesWithoutNoun(content, maxUnit);
  if (defs.some((t) => t.domain === "pictures-np") && noNoun.length) console.log(`R9: ${noNoun.length} pictures have no noun phrase yet, so "This is {picture~a}." skips them (src/content/nouns.ts): ${noNoun.slice(0, 12).join(", ")}${noNoun.length > 12 ? "…" : ""}`);

  if (flag("dry") || flag("check")) {
    const rows = defs.map((t) => {
      const mine = jobs.filter((j) => j.tpl === t.id);
      const missing = mine.filter((j) => !isFresh(manifest, j));
      const failed = missing.filter((j) => manifest.templates[t.id]?.failed?.[j.pk]);
      return { id: t.id, tier: tierOf(t), domain: t.domain, members: perTemplate.get(t.id)?.members ?? 0, pieces: mine.length, recorded: mine.length - missing.length, missing: missing.length, failed: failed.length, text: t.text };
    });
    console.table(rows);
    mkdirSync(RUNS, { recursive: true });
    writeFileSync(join(RUNS, "plan.jsonl"), jobs.map((j) => JSON.stringify({ clip: j.clip, text: j.text, h: j.h, unit: SW_SEQUENCE[j.unit] ?? j.unit, lead: j.lead, cont: j.cont, about: j.about, quoted: j.quoted, fresh: isFresh(manifest, j) })).join("\n") + "\n");
    console.log(`plan: ${rel(join(RUNS, "plan.jsonl"))}`);
    if (flag("check") && todo.length) {
      console.log(`✗ ${todo.length} pieces the content can reach up to ${UNIT} have no recording (first: ${todo.slice(0, 5).map((j) => j.clip).join(", ")})`);
      process.exitCode = 1;
    }
    return;
  }

  if (!todo.length) {
    writeManifest(manifest); // the journal's pieces and the stale entries dropped, even when nothing is left to render
    console.log(`nothing to render · manifest ${rel(MANIFEST)}`);
    return;
  }
  const T: Tts = await import("./tts"); // needs APP_CONFIG_GEMINI_API_KEY (doppler)
  const qa = new QaWorker();
  await qa.ready;
  let stopping = false;
  let done = 0;
  const report: Record<string, { rendered: number; failed: number; takes: number; judged: number; tightened: number; silences: number[] }> = {};
  const flush = () => writeManifest(manifest);
  process.on("SIGINT", () => {
    if (stopping) process.exit(130);
    stopping = true;
    console.log("\nstopping after the pieces in progress (Ctrl-C again to quit now)…");
  });
  const t0 = Date.now();
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, todo.length) }, async () => {
      while (next < todo.length && !stopping) {
        const job = todo[next++];
        const started = Date.now();
        const r = await renderPiece(T, qa, job).catch((e) => ({ ok: false as const, reason: `crashed: ${String(e).slice(0, 200)}`, takes: 0, tried: [] as Tried[] }));
        const rep = (report[job.tpl] ??= { rendered: 0, failed: 0, takes: 0, judged: 0, tightened: 0, silences: [] });
        rep.takes += r.takes;
        const t = (manifest.templates[job.tpl] ??= { text: TEMPLATE_LIST.find((x) => x.id === job.tpl)!.text, entries: {} });
        if (r.ok) {
          mkdirSync(dirname(job.file), { recursive: true });
          copyFileSync(r.take.mp3, `${job.file}.tmp`);
          renameSync(`${job.file}.tmp`, job.file);
          const master = join(MASTERS, job.tpl, `${job.pk}.flac`);
          mkdirSync(dirname(master), { recursive: true });
          copyFileSync(r.take.flac, master);
          const entry: ManifestEntry = { h: job.h, ms: Math.round(r.take.seconds * 1000), on: r.take.qa.on, off: r.take.qa.off };
          t.entries[job.pk] = entry;
          if (t.failed) delete t.failed[job.pk];
          rep.rendered++;
          rep.silences.push(r.take.qa.silence);
          if (r.take.judge) rep.judged++;
          if (r.take.tightened) rep.tightened++;
          journal({ clip: job.clip, tpl: job.tpl, pk: job.pk, h: job.h, text: job.text, ok: true, entry, takes: r.takes, ms: Date.now() - started, heard: r.take.qa.heard, silence: r.take.qa.silence, pauses: r.take.qa.pauses, ...(r.take.tightened ? { tightened: r.take.tightened } : {}), wps: +r.take.wps.toFixed(2), lufs: r.take.lufs, fall: r.take.fall, judge: r.take.judge?.score, tried: r.tried });
        } else {
          (t.failed ??= {})[job.pk] = r.reason.slice(0, 300);
          rep.failed++;
          journal({ clip: job.clip, tpl: job.tpl, pk: job.pk, h: job.h, text: job.text, ok: false, reason: r.reason, takes: r.takes, ms: Date.now() - started, tried: r.tried });
          console.log(`✗ ${job.clip} "${job.text}": ${r.reason.slice(0, 200)}`);
        }
        if (++done % 10 === 0) {
          flush();
          const rate = (Date.now() - t0) / done;
          console.log(`${done}/${todo.length} · about ${Math.round(((todo.length - done) * rate) / CONCURRENCY / 60000)} min left`);
        }
      }
    }),
  );
  flush();
  qa.close();
  const summary = Object.entries(report).map(([id, r]) => {
    const s = [...r.silences].sort((a, b) => a - b);
    return { id, rendered: r.rendered, failed: r.failed, "takes/piece": +(r.takes / Math.max(1, r.rendered + r.failed)).toFixed(1), judged: r.judged, tightened: r.tightened, "odd pause p50 ms": s[Math.floor(s.length / 2)] ?? 0, "odd pause max ms": s.at(-1) ?? 0 };
  });
  console.table(summary);
  mkdirSync(RUNS, { recursive: true });
  writeFileSync(join(RUNS, "report.json"), JSON.stringify({ at: new Date().toISOString(), voice: VOICE, model: MODEL, unit: UNIT, root: rel(OUT), summary, failed: Object.fromEntries(Object.entries(manifest.templates).map(([id, t]) => [id, t.failed ?? {}])) }, null, 1) + "\n");
  const failed = summary.reduce((n, r) => n + r.failed, 0);
  console.log(`${done} pieces in ${Math.round((Date.now() - t0) / 60000)} min · manifest ${rel(MANIFEST)} · report ${rel(join(RUNS, "report.json"))}`);
  if (failed) {
    console.log(`✗ ${failed} pieces failed every take: their templates play the fallback until they are re-rendered (--only <template>)`);
    process.exitCode = 1;
  }
  if (stopping) process.exit(130);
}

await main();
