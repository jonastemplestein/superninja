// Re-record Sensei's word library (public/a/w), the story pages (public/a/s) and the held first sounds (public/a/o) in
// Erinome (Jonas, 27 Sep 2026: "the erinome voice is clearly the winner - use that"), every take gated before it
// replaces the clip there. The takes are made as scripts/gen-audio.ts (words, stories), scripts/content/gen-unit-assets.ts
// (the unit words) and scripts/gen-stretch.ts --onset (the onsets) make them; this adds the gates those don't have and
// covers every file in public/a/w (gen-audio's word list is 470 of the 1,238; the unit words and a few older ones are
// the rest).
//
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/rerecord-erinome.ts words stories onsets
//   … bun scripts/rerecord-erinome.ts unit-check       hoe, year and laughter in Erinome, to a scratch folder only
//   --only a,b     just these ids (a word's file id "cat", a story clip "s1_1" or "s1_title", an onset "sun")
//   --only-file f  the same, ids from a file (whitespace or commas)
//   --limit N      the first N jobs          --force   redo clips already re-recorded since the switch
//   --takes N      at most N takes a clip (default 6)                          --dry      list the jobs
//   --tts N        TTS requests at once (default 4: the shared key's rate limit)
//   --better       with --force: replace an Erinome take only with one that passes every gate
//   --workers N    measuring workers (Whisper, pitch, F3) at once (default 3)
//
// Gates, every take (a clip is replaced only by a take that passes them all, or, after every take, by the best one,
// which is then listed as stubborn in the report):
//   words    the judge (gen-audio's rubric) ≥ 8; Gemini's blind word (gen-audio's blindWord: no target given) is the
//            word or a homophone; a blind faster-whisper small.en transcript is the word or a homophone; median F0
//            140–290 Hz (gen-audio's pitch gate); −16 LUFS ±0.5 (finishAudio's filters, measured and corrected: like every
//            word clip, the pure sounds and the slow words, not the −19 of a short line). A word that only Whisper hears
//            differently is accepted after 3 takes. A word-final r said alone ("car.", "after.") passes the accent judge
//            at 50 % when its F3 stays level (ratio ≥ 0.9): the judge is unsure there (docs/TREADMILL.md); marked.
//   stories  the judge ≥ 8; Whisper's transcript matches the text (word error rate ≤ 10 %); ≤ 3.3 words a second
//            (widening the take's own pauses if it is word-perfect but quick, as gen-audio does); −16 LUFS, −19 under
//            1.2 s (gen-audio's finishLine); a page ending "..." ends cleanly (tts.ts trailingBlip).
//   onsets   gen-stretch's judge ≥ 8 and Whisper hears the word ("Sssun." is "sun").
//   accent   scripts/accent-judge.ts, calibrated once a run, on every take with a BATH word, an r after a vowel or a
//            t between vowels (a word said alone: all of them; a story page: the trap words Jonas's brief lists, and
//            the BATH words): 6 votes a word, then 15 more if it is British on 5 of 6; a take is British at 80 % on
//            every word over 21 votes (docs/TREADMILL.md). For an r-word said alone the report also gives the F3
//            ratio (scripts/voice-picker/audit-measure.py's rhoticity measure), as evidence for Jonas's ear.
//
// Each clip is written atomically (copied beside the target as a dotfile, then renamed over it), and the old Sulafat
// clip is kept at .trash/sulafat-2026-09-27/<its path> (a superseded Erinome take at .trash/erinome-retakes-2026-09-27/).
// public/a/durations.json gets the new lengths (w/*, s/*). Report: playtest/phonemes/erinome-wso/<kind>.json.
import { copyFileSync, existsSync, linkSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { execFileSync, spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { tts, judgeAudio, trailingBlip, measureLufs, durationOf, SPEECH_LUFS } from "./tts";
import { generate, textOf } from "./gemini";
import { vote, calibrate, findWords, tally, calibrationLine, type Words, type ClipVerdict, type Feature } from "./accent-judge";
import { wordCount } from "./lib/words";
import { WORDS, SPECIAL_WORDS, ORAL_WORDS, WORD_BY_TEXT } from "../src/content/phonics";
import { STORIES } from "../src/content/stories";
import { ONSET_WORDS } from "../src/content/stretch";
import { POLYSYLLABIC, SW_SEQUENCE, type SwUnitId } from "../src/content/sw";
import { loadUnit } from "./content/validate-units";

const ROOT = resolve(import.meta.dir, "..");
/** Sensei's voice: gen-audio.ts VOICES.sensei (not imported: gen-audio runs on import). */
export const SENSEI = "Erinome";
const EPOCH = Number(readFileSync(join(ROOT, "playtest/.erinome-switch-epoch"), "utf8").trim());
const TRASH = join(ROOT, ".trash/sulafat-2026-09-27");
const RETAKES = join(ROOT, ".trash/erinome-retakes-2026-09-27");
const REPORTS = join(ROOT, "playtest/phonemes/erinome-wso");
const WORK = mkdtempSync(join(tmpdir(), "sn-erinome-"));

const args = process.argv.slice(2);
const argOf = (k: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
const VALUED = new Set(["--only", "--only-file", "--limit", "--takes", "--tts", "--workers"]);
const kinds = args.filter((a, i) => !a.startsWith("--") && !VALUED.has(args[i - 1]));
const onlyIds = [...(argOf("--only")?.split(",") ?? []), ...(argOf("--only-file") ? readFileSync(argOf("--only-file")!, "utf8").split(/[\s,]+/) : [])].filter(Boolean);
const only = onlyIds.length ? new Set(onlyIds) : null;
const LIMIT = Number(argOf("--limit") ?? 0);
const FORCE = args.includes("--force");
/** --better: a retake pass over stubborn clips (with --force): a word's new take replaces an Erinome take already
 *  there only if it passes every gate; a clip still in the old voice gets the best take as usual. */
const BETTER = args.includes("--better");
const DRY = args.includes("--dry");
const TAKES = Number(argOf("--takes") ?? 6);

// ---- limits ----

function limiter(n: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  return async <T>(fn: () => Promise<T>): Promise<T> => {
    if (active < n) active++;
    else await new Promise<void>((r) => queue.push(r));
    try {
      return await fn();
    } finally {
      const next = queue.shift();
      if (next) next();
      else active--;
    }
  };
}
const ttsLimit = limiter(Number(argOf("--tts") ?? 4));
const flashLimit = limiter(6);
const accentLimit = limiter(3);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
function within<T>(p: Promise<T>, ms: number, what: string): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`${what}: no answer in ${ms / 1000} s`)), ms))]);
}

/** A take: TTS under the shared limit, with longer waits than generate()'s own retries when the key is busy (429s). */
async function speak(text: string): Promise<Buffer> {
  for (let i = 0; ; i++) {
    try {
      return await ttsLimit(() => within(tts({ text, voice: SENSEI, lang: "en-GB" }), 150_000, "tts"));
    } catch (e) {
      if (i >= 3) throw e;
      console.log(`  tts: ${String(e).slice(0, 100)}; waiting ${20 * (i + 1)} s`);
      await sleep(20_000 * (i + 1));
    }
  }
}
const judge = (file: string, rubric: string) =>
  flashLimit(() => within(judgeAudio(file, rubric), 120_000, "judge")).catch((e) => ({ score: 0, heard: `? ${String(e).slice(0, 80)}`, notes: "" }));

// ---- the measuring worker (Whisper, pitch, F3) ----

class ClipWorker {
  private proc: ChildProcessWithoutNullStreams;
  pending = new Map<number, (v: any) => void>();
  private next = 1;
  private dead = "";
  ready: Promise<{ baseline_f3: number | null }>;
  constructor(baseline: string[]) {
    this.proc = spawn("uv", ["run", "-q", "--with", "numpy", "--with", "praat-parselmouth", "--with", "faster-whisper", "python", join(ROOT, "scripts/lib/clip-worker.py"), "--model", "small.en", "--baseline", baseline.join(",")], { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] });
    let buf = "";
    let onReady: (v: any) => void = () => {};
    this.ready = new Promise((r) => (onReady = r));
    this.proc.stderr.on("data", (d) => {
      const s = String(d);
      if (/error|Traceback/i.test(s)) process.stderr.write(`[worker] ${s}`);
    });
    this.proc.on("exit", (code) => {
      this.dead = `worker exited (${code})`;
      onReady({ baseline_f3: null });
      for (const res of this.pending.values()) res({ error: this.dead });
      this.pending.clear();
    });
    this.proc.stdout.on("data", (d) => {
      buf += d;
      for (let i = buf.indexOf("\n"); i >= 0; i = buf.indexOf("\n")) {
        const line = buf.slice(0, i);
        buf = buf.slice(i + 1);
        if (!line.trim()) continue;
        const j = JSON.parse(line);
        if (j.ready) onReady(j);
        else {
          this.pending.get(j.id)?.(j);
          this.pending.delete(j.id);
        }
      }
    });
  }
  async ask(req: { file: string; whisper?: boolean; pitch?: boolean; f3?: boolean }): Promise<{ text?: string; hz?: number; f3_ratio?: number | null; error?: string }> {
    await this.ready;
    if (this.dead) return { error: this.dead };
    const id = this.next++;
    return new Promise((res) => {
      this.pending.set(id, res);
      this.proc.stdin.write(JSON.stringify({ ...req, id }) + "\n");
    });
  }
  close() {
    this.proc.stdin.end();
  }
}

/** Several measuring workers, each request to the least busy (27 Sep: with the machine's load near 80, one small.en
 *  worker took ~15 s a clip and held the whole run to ~4 takes a minute). */
class ClipPool {
  private ws: ClipWorker[];
  ready: Promise<{ baseline_f3: number | null }>;
  constructor(baseline: string[], n: number) {
    this.ws = Array.from({ length: Math.max(1, n) }, () => new ClipWorker(baseline));
    this.ready = Promise.all(this.ws.map((w) => w.ready)).then((r) => r[0]);
  }
  ask(req: Parameters<ClipWorker["ask"]>[0]) {
    return this.ws.reduce((a, b) => (b.pending.size < a.pending.size ? b : a)).ask(req);
  }
  close() {
    for (const w of this.ws) w.close();
  }
}

// ---- words ----

/** gen-audio.ts SAY: isolated words TTS would otherwise read as letter names or clip. */
const SAY: Record<string, string> = { fin: "Fin!", sniff: "Sniff!", hum: "Hum!", huff: "Huff!", a: "uh.", I: "I.", the: "the.", to: "to.", of: "of.", said: "said.", was: "was." };
/** Erinome says "uh." as a long, breathy "uhh" or "ugh" (judge 1–3 on 5 of 6 takes, 27 Sep); "ə." and "a" come out as a
 *  short [ə] (judge 10 on 4 of 4). */
const TEXTS: Record<string, string[]> = {
  a: ["ə.", "a", "ə.", "uh.", "a", "ə."],
  // 27 Sep, first pass: "Huff!" (SAY) came out as "huh"/"hmph" at 300+ Hz on 6 takes; "due." as the American "do"
  // (the blind listener 3 of 4); "cot" at 330 Hz and heard as "caught" 4 of 6
  huff: ["Huff.", "huff.", "Huff...", "huff", "Huff.", "HUFF."],
  due: ["Dew.", "Due.", "Dew.", "Dyoo.", "Dew!", "due."],
  cot: ["Cot.", "Kot.", "cot.", "Kott.", "Cot.", "cot"],
  // 28 Sep, second pass: "Sniff!" (SAY) came out as a sniffing noise (the kept take has no voiced frame at all); "yawn"
  // as an acted yawn on all 6 takes (the judge 0, heard "ugh"/"phew"): said as words, "yawn" respelt as a British
  // speaker says it. "burp" and "word" kept an American r over 6 takes (F3 ratio 0.5–0.76, the judge 0–2 of 6
  // British): the NURSE vowel written out.
  // the plain word, "snɪf." and "Snif." came out as a sniff too (28 Sep: 12 of 12, "PFFT!", "HUH!"); "Sniph." is said
  sniff: ["Sniph.", "sniph.", "Sniph.", "Sniph!", "sniph", "Sniph."],
  yawn: ["Yorn.", "Yorn!", "yorn.", "Yorn...", "Yawn?", "YORN."],
  burp: ["Bɜːp.", "Buurp.", "Bɜːp!", "Beurp.", "Bɜp.", "Buhrp."],
  word: ["Wɜːd.", "Wuhd.", "Wɜːd!", "Weurd.", "Wɜd.", "Werd."],
};
const RUBRIC: Record<string, string> = {
  a: `The clip must be ONE English word, the article "a" as a British teacher says it on its own to a 5-year-old reading "a" in a book: the weak form, a short, neutral "uh" /ə/ (as in "a cat"), not the letter name "ay", not a long hesitation "uhhh" and not a grunt "ugh". Score 10 if it is exactly that short "uh". Score low for the letter name "ay", extra words, a drawn-out or breathy sound, or repeats.`,
  sniff: `The clip must be ONE English word, "sniff" (/snɪf/), SPOKEN clearly once in a Southern British accent, as a teacher would say it to a 5-year-old: the voiced "n" and the short "i" must be heard. Score 0 if it is a sniffing noise, a snort, a breath or a laugh instead of the spoken word. Score 10 if it is exactly the spoken word "sniff". Score low for a different word, a letter name, extra words or repeats.`,
  yawn: `The clip must be ONE English word, "yawn" (British /jɔːn/, rhymes with "lawn"), SPOKEN clearly once in a Southern British accent, as a teacher would say it to a 5-year-old. Score 0 if it is an acted yawn, a sigh, "ugh", "phew" or any noise instead of the spoken word. Score 10 if it is exactly the spoken word "yawn". Score low for a different word, extra words, an American r or repeats.`,
};
/** gen-unit-assets.ts sayText's respellings, one a take ("I laugh." left out: one word only). */
const PHONETIC: Record<string, string[]> = {
  hay: ["Hey.", "Hey!", "hey", "Hay.", "Hey...", "HAY!"],
  hoe: ["Ho.", "Ho!", "ho", "Hoe.", "Ho...", "HO!"],
  know: ["No.", "No!", "no", "Know.", "No...", "NO!"],
  shone: ["Shon.", "Shonn.", "shon", "Shon!", "shone", "SHON!"],
  year: ["Year.", "Year.", "Year!", "Year.", "year", "Year."],
  laughter: ["Lafter.", "Laafter.", "laafter", "Lafter!", "LAHFTUH", "Lafter"],
  // 27 Sep, first pass: an American r in "burp" on all 6 takes (F3 ratio 0.54–0.62; the judge 0–1 of 6 British), and
  // "faster" and "laugh" not British enough (the judge 67–71 % and 33–57 %): respelt as a British speaker says them
  burp: ["Buhp.", "Berp.", "Burp.", "Buhp!", "Bəp.", "Berp!"],
  faster: ["Fahster.", "Farster.", "Fahster!", "Faaster.", "Farster!", "Fahstuh."],
  laugh: ["Larf.", "Lahf.", "Larf!", "Laaf.", "Lahf!", "Laarf."],
  // Erinome says "been" as the weak form "bin" (27 Sep: 5 of 6 takes); "Been!" and "Bean." come out /biːn/
  been: ["Been!", "Bean.", "Been!", "Bean!", "bean", "Been!"],
};
/** Homophones a blind listener may write for a word (gen-audio's and gen-unit-assets' lists, and the non-rhotic
 *  British ones: "four" and "for" are the same word said alone). */
const HOMOPHONES: Record<string, string[]> = {
  to: ["two", "too", "2"], I: ["eye", "i", "aye"], bee: ["be"], sea: ["see", "c"], be: ["bee"], tea: ["tee", "t"], a: ["uh", "a", "ah"], high: ["hi"],
  knight: ["night"], night: ["knight"], witch: ["which"], which: ["witch"], tail: ["tale"], tale: ["tail"],
  blue: ["blew"], blew: ["blue"], wood: ["would"], would: ["wood"], bear: ["bare"], bare: ["bear"], pear: ["pair", "pare"], pair: ["pear", "pare"],
  stair: ["stare"], stare: ["stair"], there: ["their", "they're"], their: ["there", "they're"], where: ["wear", "ware"], wear: ["where", "ware"],
  see: ["sea", "c"], too: ["to", "two"], by: ["buy", "bye"], sail: ["sale"], sale: ["sail"], kerb: ["curb"], herd: ["heard"], heard: ["herd"],
  fir: ["fur"], fur: ["fir"], threw: ["through"], through: ["threw"], son: ["sun"], sun: ["son"], won: ["one", "1"], one: ["won", "1"], hare: ["hair"], hair: ["hare"],
  few: ["phew"], whey: ["way", "weigh"], weigh: ["way", "whey"], way: ["weigh", "whey"], weight: ["wait"], wait: ["weight"], sleigh: ["slay"], neigh: ["nay"],
  steal: ["steel"], steel: ["steal"], knew: ["new"], new: ["knew"], boar: ["bore"], bore: ["boar"], oar: ["or", "ore", "awe"], sore: ["saw", "soar"], saw: ["sore", "soar"],
  wore: ["war"], war: ["wore"], deer: ["dear"], dear: ["deer"], shore: ["sure"], hay: ["hey"], hoe: ["ho"], know: ["no"], no: ["know"],
  shone: ["shon"], year: ["yeer"], laughter: ["lafter", "lahfter"], four: ["for", "fore", "4"], for: ["four", "fore"], more: ["moor"],
  pour: ["paw", "poor", "pore"], paw: ["pour", "poor", "pore"], poor: ["pour", "paw", "pore"], tore: ["tour"], roar: ["raw"], are: ["ah", "r", "ar"],
  her: ["hur"], earn: ["urn"], fair: ["fare"], tear: ["tier", "tare"], mare: ["mayor"], floor: ["flaw"], fort: ["fought"], sort: ["sought"],
  court: ["caught"], cork: ["caulk"], stork: ["stalk"], horse: ["hoarse"], sure: ["shore"], law: ["lore"], sauce: ["source"], source: ["sauce"],
  jill: ["gill"], chris: ["kris"], kate: ["cate"], pip: [], peg: [], they: [], pie: [], tie: [], seat: [],
  rows: ["rose"], rose: ["rows"], road: ["rode"], rode: ["road"], toe: ["tow"], tow: ["toe"], bean: ["been"], meet: ["meat"], meat: ["meet"],
  week: ["weak"], weak: ["week"], flower: ["flour"], flour: ["flower"], hour: ["our"], our: ["hour"], male: ["mail"], mail: ["male"], plane: ["plain"], plain: ["plane"],
  main: ["mane"], mane: ["main"], rain: ["reign", "rein"], pain: ["pane"], tide: ["tied"], so: ["sew", "sow"], sew: ["so", "sow"], nose: ["knows"], hole: ["whole"], whole: ["hole"],
  right: ["write"], write: ["right"],
  // the strong form, respelt for Erinome; and a British homophone Whisper writes for "aunt" (/ɑːnt/)
  been: ["bean"], aunt: ["aren't"], due: ["dew"], hundred: ["100"],
  // 28 Sep: the same word in most British speech (no /hw/), and "yawn" as its respelling reads
  whine: ["wine"], wine: ["whine"], yawn: ["yorn"],
};
/** Words said alone whose r the accent judge's findWords() leaves out in a sentence (unstressed there), and names. */
const R_ALONE = new Set(["are", "her", "for", "or", "your", "you're", "their", "there", "here", "where", "were", "our", "sir", "per"]);
const NAMES = new Set(["jill", "chris", "steve", "bruce", "kate"]);
const fileId = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "_");
const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const NUM: Record<string, string> = { "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten" };
/** Is what a blind listener wrote the word (or a homophone)? With `held` (an onset), "Sssun." and "Mmmoon" are the
 *  word too. */
function sameWord(heard: string, w: string, held = false): boolean {
  const h = norm(heard).split(" ").map((x) => NUM[x] ?? x).join(" ").replace(/\s/g, "");
  const t = w.toLowerCase().replace(/[^a-z]/g, "");
  if (!h) return false;
  const ok = [t, ...(HOMOPHONES[w] ?? HOMOPHONES[w.toLowerCase()] ?? []).map((x) => x.toLowerCase().replace(/[^a-z0-9]/g, ""))];
  const squeeze = (s: string) => s.replace(/(.)\1+/g, "$1");
  return ok.includes(h) || (held && squeeze(h) === squeeze(t));
}
async function blindWord(file: string): Promise<string> {
  const r = await flashLimit(() =>
    within(generate("gemini-3.8-flash", { contents: [{ parts: [
      { inlineData: { mimeType: "audio/mp3", data: readFileSync(file).toString("base64") } },
      { text: `Transcribe this single spoken English word (British accent). Reply JSON only: {"word": "<the word, lowercase>"}` },
    ] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } }), 120_000, "blind"),
  ).catch(() => null);
  try {
    return String(JSON.parse(textOf(r)).word).toLowerCase();
  } catch {
    return "?";
  }
}

interface WordJob { kind: "words" | "unit-check"; id: string; out: string; word: string; texts: string[]; rubric: string; accent: Words | null; rWord: boolean; finalR: boolean }
function wordJob(word: string, out: string, kind: WordJob["kind"] = "words"): WordJob {
  const cap = word[0].toUpperCase() + word.slice(1);
  const texts = TEXTS[word] ?? (SAY[word] ? Array(6).fill(SAY[word]) : PHONETIC[word]) ?? [`${word}.`, `${cap}.`, `${word}!`, word, `${cap}!`, `${word}...`];
  const homs = HOMOPHONES[word]?.filter((h) => /^[a-z]+$/.test(h));
  const accent = findWords(word);
  if (R_ALONE.has(word.toLowerCase()) && !accent.r) accent.r = [word];
  const has = Object.keys(accent).length > 0;
  return {
    kind, id: fileId(word), out, word, texts, accent: has ? accent : null, rWord: !!accent.r, finalR: !!accent.r && /[aeiouy]rr?e?$/i.test(word),
    rubric: RUBRIC[word] ?? `The clip must be ONE English word, "${word}", said clearly and naturally ONCE in a Southern British accent, as a teacher would say it to a 5-year-old.${homs?.length ? ` ${homs.map((h) => `"${h}"`).join(" or ")} would sound the same and is fine.` : ""} Score 10 if it is exactly the word "${word}" (British pronunciation), nothing else. Score low for a different word, a letter name, extra words, American accent, or repeats.`,
  };
}

async function wordJobs(): Promise<WordJob[]> {
  const storyTokens = STORIES.flatMap((st) => st.pages.flatMap((p) => (p.kind === "read" ? p.text.split(/\s+/) : p.kind === "choice" ? p.options.map((o) => o.word) : [])))
    .map((t) => t.replace(/[^A-Za-z']/g, ""))
    .filter(Boolean)
    .map((t) => (t === "I" || (/^[A-Z]/.test(t) && !["It", "The", "A", "He", "Tip", "Run", "Get", "Hop", "Yuk", "Kick", "Tap", "Jam", "Drift", "Frog"].includes(t)) ? t : t.toLowerCase()));
  // gen-audio's words (a word spelt two ways, "it" and "It", is one file: the lower-case one is said)
  const spoken = new Map<string, string>();
  for (const w of [...WORDS.map((w) => w.text), ...SPECIAL_WORDS, ...storyTokens, ...Object.keys(ORAL_WORDS)]) {
    const id = fileId(w);
    if (!spoken.has(id) || w === w.toLowerCase()) spoken.set(id, w);
  }
  for (const unit of [...SW_SEQUENCE, ...POLYSYLLABIC.map((p) => p.id)] as SwUnitId[]) {
    const d = await loadUnit(unit);
    for (const w of [...d.words, ...d.poly]) if (!spoken.has(fileId(w.text))) spoken.set(fileId(w.text), w.text);
  }
  const files = readdirSync(join(ROOT, "public/a/w")).filter((f) => f.endsWith(".mp3")).map((f) => f.slice(0, -4)).sort();
  return files.map((id) => {
    const w = spoken.get(id) ?? (NAMES.has(id) ? id[0].toUpperCase() + id.slice(1) : id);
    return wordJob(w, join(ROOT, `public/a/w/${id}.mp3`));
  });
}

// ---- accent ----

let calibrated: Feature[] = [];
async function calibrateOnce(features: Feature[]) {
  const need = features.filter((f) => !calibrated.includes(f));
  if (!need.length) return;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const cal = await calibrate(need, { conc: 8 });
    for (const f of cal.features) console.log("  calibration", calibrationLine(f));
    const ok = cal.features.filter((f) => f.ok).map((f) => f.feature);
    calibrated.push(...ok);
    if (ok.length === need.length) return;
  }
  console.log(`  ✗ accent calibration failed for ${need.filter((f) => !calibrated.includes(f)).join(", ")}: those markers go unjudged (listed)`);
}
type Accent = { p: number | null; words: { feature: Feature; word: string; uk: number; n: number; p: number }[]; votes: number; lenientR?: boolean; acoustic?: boolean; unjudged?: string[] };
/** Every word British on at least 80 % of its votes. `lenientR`: a word-final r said alone ("car.", "after.") whose F3
 *  stays level (ratio ≥ 0.9, no r colour), where the judge is known to be unsure (docs/TREADMILL.md: "it agreed with the
 *  acoustics except on a word-final r said alone"): its r passes at 50 %, and the take is marked `acoustic`. */
const wordsOk = (ws: Accent["words"], lenientR = false) => ws.every((w) => w.p >= 0.8 || (lenientR && w.feature === "r" && w.p >= 0.5));
/** 6 votes a word; 15 more when every word passes on them. p: the lowest word's share. */
async function accentOf(file: string, text: string, words: Words, lenientR = false): Promise<Accent> {
  const judged = Object.fromEntries(Object.entries(words).filter(([f]) => calibrated.includes(f as Feature))) as Words;
  const unjudged = Object.entries(words).filter(([f]) => !calibrated.includes(f as Feature)).flatMap(([f, ws]) => ws!.map((w) => `${f}:${w}`));
  if (!Object.keys(judged).length) return { p: null, words: [], votes: 0, unjudged };
  const item = { key: file, file, text, words: judged };
  const a: ClipVerdict = (await accentLimit(() => vote([item], { votes: 6, conc: 3 })))[0];
  let votes = 6;
  if (wordsOk(a.words, lenientR)) {
    const b = (await accentLimit(() => vote([item], { votes: 15, start: 6, conc: 3 })))[0];
    a.words.forEach((w, i) => w.votes.push(...b.words[i].votes));
    tally(a);
    votes = 21;
  }
  const ws = a.words.map(({ feature, word, uk, n, p }) => ({ feature, word, uk, n, p: Math.round(p * 100) / 100 }));
  const acoustic = votes >= 21 && lenientR && wordsOk(ws, true) && !wordsOk(ws);
  return { p: a.p, words: ws, votes, ...(lenientR ? { lenientR } : {}), ...(acoustic ? { acoustic } : {}), ...(unjudged.length ? { unjudged } : {}) };
}
const british = (a: Accent | null) => !a || a.p == null || (a.votes >= 21 && wordsOk(a.words, a.lenientR));

// ---- install ----

const installed = new Map<string, number>();
/** Puts a take in place; false (and the clip there kept) when another lane re-recorded it while this run was working on
 *  it (newer than the switch, not this run's). */
function install(tmp: string, out: string): boolean {
  if (!FORCE && !installed.has(out) && existsSync(out) && statSync(out).mtimeMs / 1000 > EPOCH) {
    console.log(`  ${relative(ROOT, out)}: re-recorded in Erinome by another lane meanwhile; kept`);
    return false;
  }
  mkdirSync(dirname(out), { recursive: true });
  const rel = relative(ROOT, out);
  if (existsSync(out)) {
    const sulafat = statSync(out).mtimeMs / 1000 < EPOCH;
    const keep = sulafat ? join(TRASH, rel) : join(RETAKES, rel.replace(/\.mp3$/, `.${Date.now()}.mp3`));
    if (!existsSync(keep)) {
      mkdirSync(dirname(keep), { recursive: true });
      linkSync(out, keep); // the old clip stays in .trash; the rename below replaces the name in one step
    }
  }
  const part = join(dirname(out), `.${basename(out, ".mp3")}.partial`);
  copyFileSync(tmp, part);
  renameSync(part, out);
  installed.set(out, Math.round(durationOf(out) * 1000));
  return true;
}
/** public/a/durations.json: this run's clips' lengths merged into it as it is now, written atomically. */
function saveDurations() {
  const file = join(ROOT, "public/a/durations.json");
  const d: Record<string, number> = JSON.parse(readFileSync(file, "utf8"));
  for (const [out, ms] of installed) {
    const key = relative(join(ROOT, "public/a"), out).replace(/\.mp3$/, "");
    if (/^[lwxps]\//.test(key)) d[key] = ms;
  }
  const tmp = join(dirname(file), ".durations.json.partial");
  writeFileSync(tmp, JSON.stringify(Object.fromEntries(Object.entries(d).sort(([a], [b]) => a.localeCompare(b))), null, 2) + "\n");
  renameSync(tmp, file);
}

// ---- reports ----

const reports: Record<string, Record<string, any>> = {};
function report(kind: string): Record<string, any> {
  if (!reports[kind]) {
    const f = join(REPORTS, `${kind}.json`);
    reports[kind] = existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : {};
  }
  return reports[kind];
}
function saveReports() {
  mkdirSync(REPORTS, { recursive: true });
  for (const [kind, r] of Object.entries(reports)) {
    const f = join(REPORTS, `${kind}.json`);
    writeFileSync(f + ".partial", JSON.stringify(r, null, 1) + "\n");
    renameSync(f + ".partial", f);
  }
}
/** A clip newer than the switch is Erinome already (this script's, or another lane's: the read slider's compound words),
 *  whether or not a report has it (a run cut off by a usage limit installs clips it never reports): skipped unless
 *  --force. */
const doneSinceSwitch = (_kind: string, _id: string, out: string) =>
  !FORCE && existsSync(out) && statSync(out).mtimeMs / 1000 > EPOCH;

// ---- a word ----

type WordTake = { text: string; tmp: string; judge: number; heard: string; blind: string; blindOk: boolean; whisper: string; whisperOk: boolean; hz: number; pitchOk: boolean; f3?: number | null; accent: Accent | null; hard: boolean; pass: boolean };
async function doWord(j: WordJob, worker: ClipPool) {
  const takes: WordTake[] = [];
  for (let k = 0; k < TAKES; k++) {
    const text = j.texts[k % j.texts.length];
    const tmp = join(WORK, `${j.kind}-${j.id}.t${k + 1}.mp3`);
    try {
      finishLine(await speak(text), tmp, undefined, SPEECH_LUFS);
    } catch (e) {
      console.log(`  ${j.id} take ${k + 1}: ${String(e).slice(0, 120)}`);
      continue;
    }
    const [m, r, blind] = await Promise.all([worker.ask({ file: tmp, whisper: true, pitch: true, f3: j.rWord }), judge(tmp, j.rubric), blindWord(tmp)]);
    const hz = m.hz ?? 0;
    const t: WordTake = {
      text, tmp, judge: r.score, heard: r.heard, blind, blindOk: sameWord(blind, j.word), whisper: m.text ?? "?", whisperOk: sameWord(m.text ?? "", j.word),
      hz, pitchOk: hz === 0 || (hz >= 140 && hz <= 290), ...(j.rWord ? { f3: m.f3_ratio ?? null } : {}), accent: null, hard: false, pass: false,
    };
    t.hard = t.judge >= 8 && t.blindOk && t.pitchOk;
    if (t.hard && j.accent) t.accent = await accentOf(tmp, `${j.word}.`, j.accent, j.finalR && (m.f3_ratio ?? 0) >= 0.9);
    t.pass = t.hard && t.whisperOk && british(t.accent);
    takes.push(t);
    if (t.pass) break;
    // only Whisper hears it differently: after 3 takes, a take the judge, the blind listener and the accent pass will do
    if (k >= 2 && takes.some((x) => x.hard && british(x.accent))) break;
  }
  if (!takes.length) {
    report(j.kind)[j.id] = { word: j.word, installed: false, error: "no take" };
    console.log(`✗ ${j.id}: no take`);
    return;
  }
  const rank = (t: WordTake) => Number(t.pass) * 1000 + Number(t.hard) * 400 + Number(british(t.accent)) * 200 + (t.accent?.p ?? 1) * 100 + Number(t.whisperOk) * 50 + Number(t.blindOk) * 30 + t.judge;
  const best = takes.reduce((a, b) => (rank(b) > rank(a) ? b : a));
  const why = [!best.hard && `judge ${best.judge}, blind "${best.blind}"${best.pitchOk ? "" : `, ${best.hz} Hz`}`, !best.whisperOk && `Whisper "${best.whisper}"`, !british(best.accent) && `accent ${best.accent?.words.map((w) => `${w.word} ${w.uk}/${w.n}`).join(", ")}`].filter(Boolean) as string[];
  // a word none of whose takes the judge and the blind listener recognise is not written (the clip there stays)
  const erinomeThere = existsSync(j.out) && statSync(j.out).mtimeMs / 1000 > EPOCH;
  const write = BETTER && erinomeThere ? best.pass : best.hard || (best.blindOk && best.judge >= 7);
  if (BETTER && erinomeThere && !best.pass) {
    const prev = report(j.kind)[j.id];
    if (prev) prev.retried = { takes: takes.length, best: { said: best.text, judge: best.judge, blind: best.blind, whisper: best.whisper, ...(best.accent ? { accent: best.accent.p } : {}) } };
    console.log(`· ${j.id}: no take passed every gate in ${takes.length} more; the Erinome take there stays`);
    return;
  }
  const took = write && !DRY && j.kind === "words" && install(best.tmp, j.out);
  const lufs = lufsOf(write && j.kind === "words" ? j.out : best.tmp);
  report(j.kind)[j.id] = {
    word: j.word, said: best.text, installed: took, takes: takes.length, take: takes.indexOf(best) + 1, pass: best.pass, stubborn: why,
    judge: best.judge, heard: best.heard, blind: best.blind, whisper: best.whisper, hz: best.hz, lufs, ...(best.f3 !== undefined ? { f3: best.f3 } : {}),
    ...(best.accent ? { accent: best.accent } : {}), tries: takes.map((t) => ({ said: t.text, judge: t.judge, blind: t.blind, whisper: t.whisper, hz: t.hz, ...(t.accent ? { accent: t.accent.p, votes: t.accent.votes } : {}), ...(t.f3 !== undefined ? { f3: t.f3 } : {}) })),
    ...(j.kind === "unit-check" ? { file: best.tmp } : {}),
  };
  console.log(`${best.pass ? "✓" : write ? "⚠" : "✗"} ${j.id} (${takes.length} take${takes.length > 1 ? "s" : ""})${why.length ? ": " + why.join("; ") : ""}${best.accent ? ` accent ${best.accent.p} over ${best.accent.votes}` : ""}`);
}

// ---- stories ----

interface StoryJob { id: string; out: string; text: string; rubric: string; accent: Words | null; lead: boolean }
/** What TTS is given for a page, a take (the page's own words; only its pauses differ): the short pages Erinome reads
 *  too quickly with no pause to widen (27 Sep: "Who was lost in the fog?" 3.41, "What did they ride across the river?"
 *  3.88, "I can read to you!" 3.94 words a second over 6 takes each). A storyteller's pause lets the take's own pause be
 *  widened (gen-audio's way) instead of the take being time-stretched. The first take is the page as written. */
const STORY_SAY: Record<string, string[]> = {
  s2_q: ["Who was lost in the fog?", "Who was lost... in the fog?", "Who was lost, in the fog?"],
  s4_q: ["What did they ride across the river?", "What did they ride... across the river?", "What did they ride, across the river?"],
  s6_4: ["I can read to you!", "I can read... to you!", "I can read, to you!"],
};
/** The trap words of Jonas's brief (27 Sep), with their plurals and endings. */
const TRAP_R = /^(words?|first|start(s|ed|ing)?|birds?|her|cars?|stars?|more|four|waters?|better|letters?|petals?)$/i;
const TRAP_FLAP = /^(waters?|better|letters?|petals?)$/i;
function storyAccent(text: string): Words | null {
  const f = findWords(text);
  const ws = [...text.matchAll(/[A-Za-z][A-Za-z'-]*/g)].map((m) => m[0]);
  const out: Words = {};
  if (f.bath?.length) out.bath = f.bath;
  // "her" (left out of findWords as unstressed) unless an r links it to a vowel ("her egg")
  const r = ws.filter((w) => TRAP_R.test(w) && (f.r ?? []).some((x) => x.toLowerCase() === w.toLowerCase()));
  if (/\bher\b(?!\s+[aeiou])/i.test(text)) r.push("her");
  if (r.length) out.r = [...new Set(r)];
  const flap = ws.filter((w) => TRAP_FLAP.test(w));
  if (flap.length) out.flap = [...new Set(flap)];
  return Object.keys(out).length ? out : null;
}
function storyJobs(): StoryJob[] {
  const jobs: StoryJob[] = [];
  const rubric = (text: string) =>
    `The clip should be a warm British storyteller reading exactly: "${text}". Score 10 if every word matches with a natural British accent and expressive storytelling. Score low for missing/added words, if it reads stage directions aloud, or a non-British accent. It is read by a warm, calm Reception teacher to a 3-to-5-year-old: score 6 or less if it sounds rushed, shouted or barked.` +
    (text.trim().endsWith("...") ? ` It ends on "...": score 4 or less if there is any breath, hiss, click or extra sound after the last word.` : "");
  for (const st of STORIES) {
    for (const p of st.pages) {
      if (p.kind === "narr" && p.who === "baron") continue; // the Baron stays Algenib
      jobs.push({ id: `${st.id}_${p.id}`, out: join(ROOT, `public/a/s/${st.id}_${p.id}.mp3`), text: p.text, rubric: rubric(p.text), accent: storyAccent(p.text), lead: p.text.trim().endsWith("...") });
    }
    const title = `${st.title}.`;
    jobs.push({ id: `${st.id}_title`, out: join(ROOT, `public/a/s/${st.id}_title.mp3`), text: title, rubric: `The clip should be a British voice saying the story title: "${st.title}". Score 10 if exact.`, accent: storyAccent(title), lead: false });
  }
  return jobs;
}

/** gen-audio.ts finishLine (trim, 25 ms fades, −16 LUFS or −19 under 1.2 s, −1.5 dBTP limiter, 50 ms pad), with its
 *  widenPauses for a word-perfect take that is too quick. */
const SHORT_CLIP_S = 1.2;
const MAX_WPS = 3.3;
/** gen-audio.ts PSOLA: Praat's "Lengthen (overlap-add)", keeping pitch and voice. */
const PSOLA = `import parselmouth, sys
from parselmouth.praat import call
s = parselmouth.Sound(sys.argv[1])
o = call(s, "Lengthen (overlap-add)", 75, 600, float(sys.argv[3]))
if call(o, "Get absolute extremum", 0, 0, "None") > 0.99: call(o, "Scale peak", 0.99)
o.save(sys.argv[2], "WAV")`;
/** The most a story page is lengthened (gen-audio allows lines ×1.5; a page only a touch quick needs ~×1.05). */
const MAX_LENGTHEN = 1.1;
function finishLine(wav: Buffer, outMp3: string, widen?: { seconds: number; gaps: number }, fixed?: number, lengthen?: number): { lufs: number; target: number; seconds: number; widened: number } {
  const dir = mkdtempSync(join(WORK, "line-"));
  const inp = join(dir, "in.wav");
  writeFileSync(inp, wav);
  const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse";
  const fades = "afade=t=in:d=0.025,areverse,afade=t=in:d=0.025,areverse";
  let trimmed = join(dir, "trim.wav");
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", inp, "-af", `${trim},${fades}`, "-ar", "44100", "-ac", "1", trimmed]);
  let widened = 0;
  if (widen) ({ file: trimmed, added: widened } = widenPauses(trimmed, widen.seconds, widen.gaps, join(dir, "wide.wav")));
  if (lengthen && lengthen > 1) {
    const slow = join(dir, "slow.wav");
    execFileSync("uv", ["run", "-q", "--with", "praat-parselmouth", "python", "-c", PSOLA, trimmed, slow, lengthen.toFixed(3)]);
    trimmed = slow;
  }
  const target = fixed ?? (durationOf(trimmed) + 0.05 < SHORT_CLIP_S ? SPEECH_LUFS - 3 : SPEECH_LUFS);
  const first = lufsOf(trimmed);
  let gain = Number.isFinite(first) && first > -70 ? target - first : 0;
  let lufs = NaN;
  // the limiter can leave a short, peaky clip a whole LU under its target (finishAudio's "after." came out at −17.3):
  // measure the MP3 and make it again with the difference, twice at most
  for (let pass = 0; pass < 3; pass++) {
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", trimmed, "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=${Math.pow(10, -1.5 / 20).toFixed(4)}:level=disabled,apad=pad_dur=0.05`, "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-q:a", "4", outMp3]);
    lufs = lufsOf(outMp3);
    if (!Number.isFinite(lufs) || lufs < -60 || Math.abs(lufs - target) <= 0.5) break;
    gain += target - lufs;
  }
  return { lufs, target, seconds: durationOf(outMp3), widened };
}
/** Integrated loudness (tts.ts measureLufs, as the library's checks measure it), or, for a clip too short for that
 *  (ebur128 needs 400 ms blocks: a 0.3 s "a" measured −70, so gainTo() left it as it came), the clip looped to 1.6 s. */
function lufsOf(file: string): number {
  const direct = measureLufs(file);
  if (Number.isFinite(direct) && direct > -60) return direct;
  const d = durationOf(file);
  const loop = join(WORK, `loop-${basename(file, ".mp3")}-${Math.random().toString(36).slice(2, 8)}.wav`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-stream_loop", String(Math.ceil(1.6 / Math.max(d, 0.05))), "-i", file, "-ac", "1", "-ar", "44100", loop]);
  return measureLufs(loop);
}
const pausesIn = (t: string) => (t.trim().replace(/\.\.\.$/, "").match(/[.?!,;:](?=\s)|\.\.\.(?=\s)/g) ?? []).length;
function widenPauses(wav: string, seconds: number, gaps: number, out: string): { file: string; added: number } {
  const raw = execFileSync("ffmpeg", ["-loglevel", "error", "-i", wav, "-f", "f32le", "-ac", "1", "-ar", "44100", "-"], { maxBuffer: 1 << 28 });
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  const hop = 441;
  const db: number[] = [];
  for (let i = 0; i + hop <= x.length; i += hop) {
    let e = 0;
    for (let k = i; k < i + hop; k++) e += x[k] * x[k];
    db.push(10 * Math.log10(e / hop + 1e-12));
  }
  const peak = Math.max(...db);
  const runs: { a: number; b: number }[] = [];
  for (let i = 0, start = -1; i <= db.length; i++) {
    const quiet = i < db.length && db[i] < peak - 35;
    if (quiet && start < 0) start = i;
    if (!quiet && start >= 0) {
      if (start > 0 && i < db.length && i - start >= 6) runs.push({ a: start, b: i });
      start = -1;
    }
  }
  const chosen = runs.sort((p, q) => q.b - q.a - (p.b - p.a)).slice(0, Math.max(1, gaps)).sort((p, q) => p.a - q.a);
  if (!chosen.length || seconds <= 0) return { file: wav, added: 0 };
  const each = Math.min(0.25, seconds / chosen.length);
  const pad = Math.round(each * 44100);
  const parts: Float32Array[] = [];
  let from = 0;
  for (const r of chosen) {
    const mid = Math.round(((r.a + r.b) / 2) * hop);
    parts.push(x.subarray(from, mid), new Float32Array(pad));
    from = mid;
  }
  parts.push(x.subarray(from));
  const y = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    y.set(p, at);
    at += p.length;
  }
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "f32le", "-ac", "1", "-ar", "44100", "-i", "-", out], { input: Buffer.from(y.buffer) });
  return { file: out, added: Math.round(each * chosen.length * 1000) / 1000 };
}
/** Word error rate of a blind transcript against the text (hyphens and "Shhh"/"Shh" as the same). */
function wer(text: string, heard: string): number {
  const toks = (s: string) => norm(s.replace(/-/g, " ")).split(" ").filter(Boolean).map((w) => NUM[w] ?? w.replace(/^s?h+$/, "shh").replace(/^sh+h*$/, "shh"));
  const a = toks(text), b = toks(heard);
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return a.length ? d[a.length][b.length] / a.length : 0;
}

type StoryTake = { said: string; tmp: string; wav: Buffer; judge: number; heard: string; whisper: string; wer: number; wps: number; seconds: number; lufs: number; target: number; widened: number; blip: number | null; accent: Accent | null; hard: boolean; pass: boolean };
async function doStory(j: StoryJob, worker: ClipPool) {
  const takes: StoryTake[] = [];
  const words = wordCount(j.text);
  for (let k = 0; k < TAKES; k++) {
    const tmp = join(WORK, `s-${j.id}.t${k + 1}.mp3`);
    let wav: Buffer;
    let said = j.text;
    try {
      said = STORY_SAY[j.id]?.[k % STORY_SAY[j.id].length] ?? j.text;
      wav = await speak(said);
    } catch (e) {
      console.log(`  ${j.id} take ${k + 1}: ${String(e).slice(0, 120)}`);
      continue;
    }
    let f = finishLine(wav, tmp);
    const blip = j.lead ? trailingBlip(tmp) : null;
    const [m, r] = await Promise.all([worker.ask({ file: tmp, whisper: true }), judge(tmp, j.rubric)]);
    const t: StoryTake = { said, tmp, wav, judge: blip != null ? Math.min(r.score, 4) : r.score, heard: r.heard, whisper: m.text ?? "?", wer: wer(j.text, m.text ?? ""), wps: words >= 2 ? words / f.seconds : 0, seconds: f.seconds, lufs: f.lufs, target: f.target, widened: 0, blip, accent: null, hard: false, pass: false };
    t.hard = t.judge >= 8 && t.wer <= 0.1 && blip == null;
    // word-perfect but quick: its own pauses a little longer (gen-audio.ts), never a new voice or a stretch
    if (t.hard && t.wps > MAX_WPS && pausesIn(said)) {
      f = finishLine(wav, tmp, { seconds: words / (MAX_WPS - 0.05) - f.seconds, gaps: pausesIn(said) });
      Object.assign(t, { wps: words / f.seconds, seconds: f.seconds, lufs: f.lufs, target: f.target, widened: f.widened });
    }
    if (t.hard && t.wps <= MAX_WPS && j.accent) t.accent = await accentOf(tmp, j.text, j.accent);
    t.pass = t.hard && t.wps <= MAX_WPS && british(t.accent);
    takes.push(t);
    if (t.pass) break;
  }
  if (!takes.length) {
    report("stories")[j.id] = { text: j.text, installed: false, error: "no take" };
    console.log(`✗ ${j.id}: no take`);
    return;
  }
  const rank = (t: StoryTake) => Number(t.pass) * 1000 + Number(t.hard) * 400 + Number(t.wps <= MAX_WPS) * 200 + Number(british(t.accent)) * 100 + (t.accent?.p ?? 1) * 50 + t.judge - t.wer * 20;
  const best = takes.reduce((a, b) => (rank(b) > rank(a) ? b : a));
  // the last resort for a word-perfect, British page still a touch quick after every take (a question with no pause to
  // widen, "Who was lost in the fog?" at 3.41): gen-audio's PSOLA, at most ×1.1, to 3.25 words a second
  let lengthened = 0;
  if (!best.pass && best.hard && british(best.accent) && best.wps > MAX_WPS && best.wps / (MAX_WPS - 0.05) <= MAX_LENGTHEN) {
    lengthened = Math.round((best.wps / (MAX_WPS - 0.05)) * 1000) / 1000;
    const f = finishLine(best.wav, best.tmp, best.widened ? { seconds: best.widened, gaps: pausesIn(best.said) } : undefined, undefined, lengthened);
    Object.assign(best, { wps: words / f.seconds, seconds: f.seconds, lufs: f.lufs, target: f.target });
    best.pass = best.wps <= MAX_WPS;
  }
  const why = [!best.hard && `judge ${best.judge}, WER ${best.wer.toFixed(2)} ("${best.whisper}")${best.blip != null ? `, tail ${best.blip}s` : ""}`, best.wps > MAX_WPS && `${best.wps.toFixed(2)} words/s`, !british(best.accent) && `accent ${best.accent?.words.map((w) => `${w.word} ${w.uk}/${w.n}`).join(", ")}`].filter(Boolean) as string[];
  const write = best.judge >= 7 && best.wer <= 0.2;
  const took = write && !DRY && install(best.tmp, j.out);
  report("stories")[j.id] = {
    text: j.text, ...(best.said !== j.text ? { said: best.said } : {}), installed: took, takes: takes.length, take: takes.indexOf(best) + 1, pass: best.pass, stubborn: why, judge: best.judge, whisper: best.whisper, wer: Math.round(best.wer * 100) / 100,
    wps: Math.round(best.wps * 100) / 100, seconds: Math.round(best.seconds * 100) / 100, lufs: best.lufs, target: best.target, ...(best.widened ? { widened: best.widened } : {}), ...(lengthened ? { lengthened } : {}), ...(best.accent ? { accent: best.accent } : {}),
    tries: takes.map((t) => ({ judge: t.judge, wer: Math.round(t.wer * 100) / 100, wps: Math.round(t.wps * 100) / 100, ...(t.blip != null ? { blip: t.blip } : {}), ...(t.accent ? { accent: t.accent.p, votes: t.accent.votes } : {}) })),
  };
  console.log(`${best.pass ? "✓" : write ? "⚠" : "✗"} ${j.id} (${takes.length} take${takes.length > 1 ? "s" : ""}, ${best.wps.toFixed(2)} w/s${lengthened ? `, lengthened ×${lengthened}` : ""})${why.length ? ": " + why.join("; ") : ""}${best.accent ? ` accent ${best.accent.p} over ${best.accent.votes}` : ""}`);
}

// ---- onsets (gen-stretch.ts --onset) ----

const HOLD = new Set(["m", "n", "s", "f", "v", "z", "l", "r", "sh", "th", "dh", "ng", "a", "e", "i", "o", "u"]);
function onsetText(w: string) {
  const first = WORD_BY_TEXT[w]?.segs[0].g ?? w[0];
  const p = WORD_BY_TEXT[w]?.segs[0].p ?? ORAL_WORDS[w]?.first;
  if (!p || !HOLD.has(p)) throw new Error(`${w}: its first sound can't be held`);
  return first.repeat(4) + w.slice(first.length);
}
async function doOnset(w: string, worker: ClipPool) {
  const text = onsetText(w);
  const out = join(ROOT, `public/a/o/${w}.mp3`);
  const rubric = `The clip must be the single English word "${w}" said by a British teacher with ONLY ITS FIRST SOUND held long (like "${text}": the first sound held for about a second), then the rest of the word said at a normal pace, as ONE continuous word with no gap and no added "uh". Score 10 if it is clearly "${w}" with a long first sound and a normal rest; low if it's a different word, if other sounds are stretched too, if there is a pause, a letter name, or extra words.`;
  const takes: { tmp: string; judge: number; heard: string; whisper: string; ok: boolean; hz: number }[] = [];
  for (let k = 0; k < TAKES; k++) {
    const tmp = join(WORK, `o-${w}.t${k + 1}.mp3`);
    try {
      finishLine(await speak(text), tmp, undefined, SPEECH_LUFS);
    } catch (e) {
      continue;
    }
    const [m, r] = await Promise.all([worker.ask({ file: tmp, whisper: true, pitch: true }), judge(tmp, rubric)]);
    const t = { tmp, judge: r.score, heard: r.heard, whisper: m.text ?? "?", ok: false, hz: m.hz ?? 0 };
    t.ok = t.judge >= 8 && sameWord(t.whisper, w, true);
    takes.push(t);
    if (t.ok) break;
  }
  const best = takes.reduce((a, b) => (Number(b.ok) * 100 + b.judge > Number(a.ok) * 100 + a.judge ? b : a), takes[0]);
  const write = !!best && best.judge >= 7;
  const took = write && !DRY && install(best.tmp, out);
  report("onsets")[w] = { said: text, installed: took, takes: takes.length, pass: !!best?.ok, judge: best?.judge, heard: best?.heard, whisper: best?.whisper, hz: best?.hz, lufs: write ? lufsOf(out) : null };
  console.log(`${best?.ok ? "✓" : write ? "⚠" : "✗"} onset ${w} (${takes.length} takes): judge ${best?.judge}, Whisper "${best?.whisper}"`);
}

// ---- run ----

async function run<T>(items: T[], n: number, fn: (t: T) => Promise<void>) {
  let next = 0, done = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < items.length) {
      const it = items[next++];
      try {
        await fn(it);
      } catch (e) {
        console.log("FAILED", e);
      }
      if (++done % 20 === 0) {
        saveReports();
        if (!DRY) saveDurations();
        console.log(`-- ${done}/${items.length}`);
      }
    }
  }));
}

const baseline = readdirSync(join(ROOT, "playtest/voice-picker/audio/gemini/gemini-erinome-engb")).filter((f) => /^sensei-\d\.mp3$/.test(f)).map((f) => join(ROOT, "playtest/voice-picker/audio/gemini/gemini-erinome-engb", f));
const pick = <T extends { id: string }>(js: T[]) => {
  const a = only ? js.filter((j) => only.has(j.id)) : js;
  return LIMIT ? a.slice(0, LIMIT) : a;
};

const worker = new ClipPool(baseline, Number(argOf("--workers") ?? 3));
// a run stopped from outside (a usage limit, a kill) keeps what it has done: the reports and durations.json are saved
for (const sig of ["SIGTERM", "SIGINT", "SIGHUP"] as const)
  process.on(sig, () => {
    console.log(`\n${sig}: saving the reports and durations.json`);
    try {
      saveReports();
      if (!DRY && installed.size) saveDurations();
    } finally {
      worker.close();
      process.exit(1);
    }
  });
try {
  const ready = await worker.ready;
  console.log(`worker ready (Erinome's usual F3 ${ready.baseline_f3?.toFixed(0)} Hz); scratch ${WORK}`);
  if (kinds.includes("unit-check")) {
    const js = ["hoe", "year", "laughter"].map((w) => {
      const j = wordJob(w, join(WORK, `unit-check-${w}.mp3`), "unit-check");
      return j;
    });
    await calibrateOnce([...new Set(js.flatMap((j) => Object.keys(j.accent ?? {}) as Feature[]))]);
    await run(js, 3, (j) => doWord(j, worker));
  }
  if (kinds.includes("onsets")) {
    const ws = ONSET_WORDS.filter((w) => (!only || only.has(w)) && !doneSinceSwitch("onsets", w, join(ROOT, `public/a/o/${w}.mp3`)));
    console.log(`onsets: ${ws.length}`);
    if (!DRY) await run(ws, 4, (w) => doOnset(w, worker));
  }
  if (kinds.includes("stories")) {
    const js = pick(storyJobs()).filter((j) => !doneSinceSwitch("stories", j.id, j.out));
    console.log(`stories: ${js.length} clips, ${js.filter((j) => j.accent).length} with accent words`);
    if (DRY) for (const j of js) console.log(`  ${j.id}: ${JSON.stringify(j.accent)} ${j.text}`);
    else {
      await calibrateOnce([...new Set(js.flatMap((j) => Object.keys(j.accent ?? {}) as Feature[]))]);
      await run(js, 6, (j) => doStory(j, worker));
    }
  }
  if (kinds.includes("words")) {
    const js = pick(await wordJobs()).filter((j) => !doneSinceSwitch("words", j.id, j.out));
    console.log(`words: ${js.length} clips, ${js.filter((j) => j.accent).length} with accent words`);
    if (DRY) for (const j of js) console.log(`  ${j.id}: ${j.texts[0]} ${j.accent ? JSON.stringify(j.accent) : ""}`);
    else {
      await calibrateOnce([...new Set(js.flatMap((j) => Object.keys(j.accent ?? {}) as Feature[]))]);
      await run(js, 12, (j) => doWord(j, worker));
    }
  }
} finally {
  saveReports();
  if (!DRY && installed.size) saveDurations();
  worker.close();
}
const all = Object.entries(reports).flatMap(([kind, r]) => Object.entries(r).map(([id, v]) => ({ kind, id, ...v })));
const stubborn = all.filter((x: any) => x.installed === false || (x.stubborn?.length ?? 0) > 0);
console.log(`\nwritten this run: ${installed.size}; in the reports: ${all.length}, stubborn ${stubborn.length}`);
for (const s of stubborn as any[]) console.log(`  ${s.kind}/${s.id}: ${s.installed ? "" : "(not written) "}${(s.stubborn ?? [s.error]).join("; ")}`);
process.exit(0);
