// Blind Gemini judge for the Erinome pure-sound shortlist (27 Sep). A weak signal next to the acoustic measures
// (scripts/phonemes/erinome-measure.py), but the only one that "listens" for letter names, an added vowel and
// processing artefacts the way a person would.
//
// Each clip is sent as 44.1 kHz mono wav with 400 ms of silence in front (Gemini misreads a clip that starts at once;
// each vote adds 10 ms more so no two votes send the same bytes) and 300 ms after. Blind: the judge is not told which
// sound it is meant to be, nor how it was made. Three votes per clip at temperature 1, gemini-3.1-pro-preview.
//
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/phonemes/erinome-judge.ts <list.json> [--votes 3] [--conc 4]
// <list.json> is [{ key, id, file }] (file relative to the repo). Results are cached in
// playtest/runs/pure-sounds-erinome/judge.json by key (a rerun only judges what is missing).
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { generate, pool, textOf } from "../gemini";

const REPO = resolve(import.meta.dir, "../..");
const OUT = join(REPO, "playtest/runs/pure-sounds-erinome/judge.json");
const MODEL = process.env.JUDGE_MODEL ?? "gemini-3.1-pro-preview";
const args = process.argv.slice(2);
const opt = (k: string, d: number) => { const i = args.indexOf(k); return i >= 0 ? Number(args.splice(i, 2)[1]) : d; };
const VOTES = opt("--votes", 3);
const CONC = opt("--conc", 4);
const items: { key: string; id: string; file: string }[] = JSON.parse(readFileSync(args[0], "utf8"));

const TMP = mkdtempSync(join(tmpdir(), "erinome-judge-"));
let n = 0;
function pad(file: string, ms: number): string {
  const out = join(TMP, `${n++}.wav`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-t", String(ms / 1000), "-i", "anullsrc=r=44100:cl=mono",
    "-i", file, "-f", "lavfi", "-t", "0.3", "-i", "anullsrc=r=44100:cl=mono",
    "-filter_complex", "[1:a]aresample=44100,aformat=channel_layouts=mono[b];[0:a][b][2:a]concat=n=3:v=0:a=1", "-ar", "44100", "-ac", "1", out]);
  return out;
}

const PROMPT = `This clip is meant to be one isolated speech sound for a British (Southern English) phonics game for young children, said on its own by a woman, after a moment of silence. You are not told which sound it is.
1. Which sound is it? Give the IPA of exactly what you hear, everything in it.
2. Is it a clean, natural British phonics "pure sound": the sound alone, with no vowel ("uh") after a consonant, and not an alphabet letter NAME (such as "bee", "dee", "kay", "aitch", "ess", "ar", "oh", "you")?
3. Any artefacts? Buzzing, quacking, metallic, robotic, phasey, warbling, clicks, a cut-off start or end?
A held hiss, hum or breath is expected for some sounds and is not an artefact in itself. Listen closely.
Reply ONLY with JSON: {"ipa": "<IPA>", "letter_name": <true|false>, "vowel_after": <true|false>, "artefacts": [<zero or more of "buzzing","quacking","metallic","robotic","phasey","warbling","clicks","cut-off","other">], "severity": <0 = none, 10 = severe>, "naturalness": <0-10, 10 = indistinguishable from a real teacher>, "clean_pure_sound": <true|false>, "note": "<a few words>"}`;

const res: Record<string, any> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const todo = items.filter((it) => !(res[it.key]?.votes?.filter((v: any) => v && !v.error).length >= VOTES));
const jobs = todo.flatMap((it) => Array.from({ length: VOTES }, (_, v) => ({ it, v })));
console.log(`${todo.length} clips, ${jobs.length} votes`);
const votes: Record<string, any[]> = {};
let done = 0;
const save = () => { writeFileSync(OUT + ".tmp", JSON.stringify(res, null, 1) + "\n"); renameSync(OUT + ".tmp", OUT); };
await pool(jobs, CONC, async ({ it, v }) => {
  const wav = pad(join(REPO, it.file), 400 + 10 * v);
  let out: any;
  try {
    const r = await generate(MODEL, {
      contents: [{ parts: [{ inlineData: { mimeType: "audio/wav", data: readFileSync(wav).toString("base64") } }, { text: PROMPT }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 1 },
    });
    out = JSON.parse(textOf(r));
    if (Array.isArray(out)) out = out[0] ?? { error: "empty array" }; // the model now and then wraps its answer in [...]
  } catch (e) {
    out = { error: String(e).slice(0, 200) };
  }
  (votes[it.key] ??= [])[v] = out;
  const vs = votes[it.key].filter(Boolean);
  if (vs.length === VOTES) {
    const ok = vs.filter((x) => !x.error);
    const mean = (k: string) => ok.length ? +(ok.reduce((s, x) => s + (Number(x[k]) || 0), 0) / ok.length).toFixed(2) : null;
    res[it.key] = { id: it.id, file: it.file, model: MODEL, votes: vs, ipa: ok.map((x) => x.ipa),
      letter_name: ok.filter((x) => x.letter_name === true).length, vowel_after: ok.filter((x) => x.vowel_after === true).length,
      clean: ok.filter((x) => x.clean_pure_sound === true).length, severity: mean("severity"), naturalness: mean("naturalness"),
      artefacts: ok.flatMap((x) => x.artefacts ?? []), n: ok.length };
    save();
  }
  if (++done % 25 === 0) console.log(`${done}/${jobs.length}`);
});
save();
console.log("wrote", OUT);
