// Gemini artefact judge for the pure sounds (27 Sep; Jonas: /h/ "quacking", /s/ and /r/ "super robotic").
// A weak signal: Gemini is unreliable on pure sounds, so scripts/phonemes/artefacts.py's acoustic measures come first.
// Each clip is sent as 44.1 kHz mono wav with 400 ms of silence in front (it misreads a clip that starts at once; each
// vote adds 10 ms more, so no two votes send the same bytes) and 300 ms after. Three votes per clip, temperature 1.
//
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/phonemes/artefact-judge.ts [ids...] [--votes 3]
// Writes playtest/runs/pure-sounds/gemini-artefacts.json. Also judges the controls in playtest/runs/pure-sounds/controls
// (and any playtest/runs/pure-sounds/extra/*.mp3), so the judge's false-alarm rate on clean noise can be read.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { generate, pool, textOf } from "../gemini";
import { PHONEMES } from "../../src/content/phonics";

const REPO = resolve(import.meta.dir, "../..");
const RUN = join(REPO, "playtest/runs/pure-sounds");
const OUT = join(RUN, "gemini-artefacts.json");
const MODEL = process.env.JUDGE_MODEL ?? "gemini-3.1-pro-preview";
const args = process.argv.slice(2);
const vi = args.indexOf("--votes");
const VOTES = vi >= 0 ? Number(args.splice(vi, 2)[1]) : 3;
const IDS = ("a i m s t n o p b k g h d e f v l r u j w z ks y sh ch th dh ng kw " +
  "ae ee ie oe oo ar or er ou oy ue uu air eer zh schwa").split(" ");
const ids = args.length ? args : IDS;

type Item = { key: string; file: string; target: string };
// an argument ending in .mp3 is a file (key: its path under playtest/runs/pure-sounds, target: the id before the first dot)
const items: Item[] = ids.map((id) => id.endsWith(".mp3")
  ? { key: resolve(id).replace(RUN + "/", ""), file: resolve(id), target: describe(id.split("/").pop()!.split(".")[0]) }
  : { key: id, file: join(REPO, "public/a/p", `${id}.mp3`), target: describe(id) });
if (!args.length) {
  for (const dir of ["controls", "extra"]) {
    const d = join(RUN, dir);
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d).filter((f) => f.endsWith(".mp3")).sort()) {
      const id = f.split(".")[0];
      items.push({ key: `${dir}/${f.replace(/\.mp3$/, "")}`, file: join(d, f), target: id === "noise" ? "a steady breathy hiss (a test noise)" : describe(id) });
    }
  }
}

function describe(id: string): string {
  const p = (PHONEMES as any)[id];
  if (id === "schwa") return "the weak vowel /ə/ ('uh' as in the end of 'sofa')";
  return p ? `the phonics pure sound /${p.ipa}/ (as in '${p.example}')` : `the sound /${id}/`;
}

const TMP = mkdtempSync(join(tmpdir(), "artefact-judge-"));
let n = 0;
function pad(file: string, ms: number): string {
  const out = join(TMP, `${n++}.wav`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-t", String(ms / 1000), "-i", "anullsrc=r=44100:cl=mono",
    "-i", file, "-f", "lavfi", "-t", "0.3", "-i", "anullsrc=r=44100:cl=mono",
    "-filter_complex", "[1:a]aresample=44100,aformat=channel_layouts=mono[b];[0:a][b][2:a]concat=n=3:v=0:a=1", "-ar", "44100", "-ac", "1", out]);
  return out;
}

const PROMPT = (target: string) =>
  `This clip is one isolated speech sound for a British phonics game for young children: ${target}, said on its own by a woman, after a moment of silence. A held hiss, hum or breath is expected for some sounds and is not an artefact in itself.
Describe any artefacts: buzzing, quacking, metallic, robotic, phasey, warbling, clicks? Is it a clean, natural human speech sound?
Listen closely to the texture of the sound itself, not to which sound it is.
Reply ONLY with JSON: {"artefacts": [<zero or more of "buzzing","quacking","metallic","robotic","phasey","warbling","clicks","other">], "severity": <0 = none, 10 = severe>, "clean_natural": <true|false>, "naturalness": <0-10, 10 = indistinguishable from a real person>, "description": "<one or two sentences>"}`;

const prev: Record<string, any> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const res: Record<string, any> = { ...prev };
const jobs = items.flatMap((it) => Array.from({ length: VOTES }, (_, v) => ({ it, v })));
const votes: Record<string, any[]> = {};
await pool(jobs, 12, async ({ it, v }) => {
  const wav = pad(it.file, 400 + 10 * v);
  let out: any;
  try {
    const r = await generate(MODEL, {
      contents: [{ parts: [
        { inlineData: { mimeType: "audio/wav", data: readFileSync(wav).toString("base64") } },
        { text: PROMPT(it.target) },
      ] }],
      generationConfig: { responseMimeType: "application/json", temperature: 1 },
    });
    out = JSON.parse(textOf(r));
  } catch (e) {
    out = { error: String(e).slice(0, 200) };
  }
  (votes[it.key] ??= [])[v] = out;
  console.log(it.key.padEnd(24), v, JSON.stringify(out).slice(0, 220));
});
for (const it of items) {
  const vs = (votes[it.key] ?? []).filter((x) => x && !x.error);
  const tally: Record<string, number> = {};
  for (const x of vs) for (const a of x.artefacts ?? []) tally[a] = (tally[a] ?? 0) + 1;
  const mean = (k: string) => vs.length ? +(vs.reduce((s, x) => s + (Number(x[k]) || 0), 0) / vs.length).toFixed(1) : null;
  res[it.key] = { file: it.file.replace(REPO + "/", ""), model: MODEL, votes: votes[it.key], tally,
    severity: mean("severity"), naturalness: mean("naturalness"), clean: vs.filter((x) => x.clean_natural === true).length, n: vs.length };
}
writeFileSync(OUT, JSON.stringify(res, null, 1) + "\n");
console.log("wrote", OUT);
