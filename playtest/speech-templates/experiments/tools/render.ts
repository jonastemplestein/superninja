// Speech-template experiment, step 1: every Gemini TTS take the methods need (Sulafat, en-GB, plain text).
// Run: doppler run -p os-legacy-2026-04 -c dev -- bun playtest/speech-templates/experiments/tools/render.ts
// Raw 24 kHz takes go to playtest/runs/speech-templates/tts/, with tts.json (text, wall time and judge score per take;
// the best take per id is picked the way gen-audio.ts picks a line: the audio judge's score, prod rubric).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tts, judgeAudio } from "../../../../scripts/tts";
import { pool } from "../../../../scripts/gemini";

const ROOT = join(import.meta.dir, "../../../..");
const OUT = join(ROOT, "playtest/runs/speech-templates/tts");
mkdirSync(OUT, { recursive: true });
const MANIFEST = join(OUT, "tts.json");

const WORDS = ["mat", "sun", "ship", "rain", "frog", "sock"];
const T6 = WORDS.map((w, i) => [w, WORDS[(i + 1) % WORDS.length]]);
const T4 = [["a", "ie"], ["s", "m"], ["m", "d"], ["sh", "s"], ["d", "m"], ["ie", "a"]];
const NAMES = ["Kai", "Suki"];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

type Job = { id: string; text: string; takes: number; group: string };
const jobs: Job[] = [];
const add = (group: string, id: string, text: string, takes = 2) => jobs.push({ id, text, takes, group });

// A: whole sentence per combination (also D's same-template donors)
for (const w of WORDS) add("A", `T1_${w}`, `Say ${w} slowly.`);
for (const w of WORDS) add("A", `T2_${w}`, `Can you find the ${w}?`);
for (const [a, b] of T6) add("A", `T6_${a}_${b}`, `Tap ${a}, then tap ${b}.`);
for (const n of NAMES) add("A", `T5_${n.toLowerCase()}`, `${n} read it right!`);
// A for the sound templates: the words around a pause, one take per combination; the pure clip goes in the pause
const SND = ["a", "s", "m", "sh", "d", "ie"];
for (const s of SND) add("A", `T3A_${s}`, "Say the sound...");
for (const [a, b] of T4) add("A", `T4A_${a}_${b}`, "Change... to...");

// Masters for C, C2, D, D2, E: the carrier with a filler in the slot (a word not in the test set), best of 3
add("M", "M_T1", "Say pig slowly.", 3);
add("M", "M_T2", "Can you find the pig?", 3);
add("M", "M_T3", "Say the sound ah.", 3);
add("M", "M_T4", "Change ah to ee.", 3);
add("M", "M_T5", "Tom read it right!", 3);
add("M", "M_T6", "Tap pig, then tap cup.", 3);

// B: today's lead-in style, the variable at the end after "..."
add("B", "B_T1", "Say this word slowly...");
add("B", "B_T2", "Can you find...");
add("B", "B_T3", "Say this sound...");
add("B", "B_T4a", "Change this sound...");
add("B", "B_T4b", "To this sound...");
add("B", "B_T5", "The one who read it right is...");
add("B", "B_T6a", "Tap...");
add("B", "B_T6b", "Then tap...");
// citation names (the words already exist in public/a/w)
for (const n of NAMES) add("W", `W_${n.toLowerCase()}`, `${n}.`);

// D2: two generic slot-class donors per word, reused by every template (the scalable variant)
for (const w of WORDS) add("D2", `D2m_${w}`, `I think ${w} is next.`);
for (const w of WORDS) add("D2", `D2f_${w}`, `The last word is ${w}.`);

// D3: cross-template donors that share the slot's neighbouring word with the target template ("the {w}", "say {w}",
// "tap {w}"), to test whether a shared left context is what makes D work
for (const w of WORDS) add("D3", `D3say_${w}`, `Say ${w} now.`);
for (const w of WORDS) add("D3", `D3the_${w}`, `Look at the ${w}.`);
for (const w of WORDS) add("D3", `D3tap_${w}`, `Tap ${w} now.`);
for (const w of WORDS) add("D3", `D3ntap_${w}`, `Now tap ${w}.`);

type Take = { file: string; ms: number; score: number; heard: string; notes: string };
const manifest: Record<string, { text: string; group: string; takes: Take[]; best?: number }> = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : {};
const save = () => writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));

const rubric = (text: string) =>
  `The clip should be a British-accented voice reading exactly this script, expressively, with nothing added or missed: "${text}". Score 10 if it matches the script exactly with a natural British accent. Score low if words are missing/added, if it reads stage directions or instructions aloud, or if the accent is not British. It is spoken by a warm, calm Reception teacher to a 3-to-5-year-old: score 6 or less if it sounds rushed, shouted or barked.`;

const units = jobs.flatMap((j) => Array.from({ length: j.takes }, (_, k) => ({ j, k })));
await pool(units, 6, async ({ j, k }) => {
  const m = (manifest[j.id] ??= { text: j.text, group: j.group, takes: [] });
  const file = join(OUT, `${j.id}_t${k}.wav`);
  if (m.takes[k] && existsSync(file)) return;
  const t0 = performance.now();
  const wav = await tts({ text: j.text });
  const ms = Math.round(performance.now() - t0);
  writeFileSync(file, wav);
  const r = await judgeAudio(file, rubric(j.text));
  m.takes[k] = { file: file.slice(ROOT.length + 1), ms, score: r.score, heard: r.heard, notes: r.notes };
  save();
  console.log(j.id, k, ms + "ms", r.score, r.heard);
});
for (const m of Object.values(manifest)) {
  let best = 0;
  m.takes.forEach((t, i) => { if (t && t.score > (m.takes[best]?.score ?? -1)) best = i; });
  m.best = best;
}
save();
console.log("done", Object.keys(manifest).length, "ids");
