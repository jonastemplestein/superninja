// Accent audit, step 2: a Gemini listening judge. Three votes a clip, each with the accent options and the American
// features in a fresh random order, at temperature 1, the clips in random order. No vote is told which voice it hears
// or what accent it is meant to be.
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/voice-picker/audit-judge.ts [--votes 3]
// In:  playtest/runs/voice-picker/audit/renders.json (the test script) + GAME_CLIPS (20 real game clips)
// Out: playtest/runs/voice-picker/audit/judge.json
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generate, pool, textOf } from "../gemini";
import { GAME_CLIPS } from "./audit-game-clips";

const ROOT = join(import.meta.dir, "../..");
const OUT = join(ROOT, "playtest/runs/voice-picker/audit/judge.json");
const args = process.argv.slice(2);
const VOTES = Number(args.includes("--votes") ? args[args.indexOf("--votes") + 1] : 3);
const MODEL = "gemini-3.8-flash";

const ACCENTS = ["Southern British English (RP or modern standard)", "another British accent", "American", "Australian", "another accent"];
const FEATURES = [
  "a rhotic r: an r sounded after a vowel, as in car, bird, four or water",
  "a flapped t: a quick d-like t between vowels, as in water or butter",
  "the TRAP vowel (as in cat) in bath, grass, dance, fast, after or can't",
  "'tomayto' (the FACE vowel in tomato)",
];
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function prompt(text: string, accents: string[], features: string[]) {
  return `Listen carefully to this speech clip. The words are: "${text}"

Which accent is this: ${accents.slice(0, -1).join(", ")} or ${accents.at(-1)}?
Rate 1-10 how convincingly Southern British it is (10 = unmistakably Southern British, like a CBeebies presenter; 1 = clearly not British).
List any American features you actually hear, naming the word where you hear it. Features to listen for:
${features.map((f) => `- ${f}`).join("\n")}
List only features you hear in this clip; an empty list is fine.

Reply ONLY with JSON: {"accent": "<one of: ${accents.join(" | ")}>", "southern_british": <1-10>, "american_features": [{"feature": "<short name>", "word": "<word>"}], "british_features": ["<short evidence, e.g. non-rhotic car>"], "notes": "<one sentence>"}`;
}

interface Clip { key: string; file: string; text: string; group: string; cast?: string; line?: string; take?: number; kind: string }
const renders: any[] = JSON.parse(readFileSync(join(ROOT, "playtest/runs/voice-picker/audit/renders.json"), "utf8"));
const clips: Clip[] = [
  ...renders.map((r) => ({ key: `${r.cast}/${r.line}.t${r.take}`, file: r.wav, text: r.text, group: "test-script", cast: r.cast, line: r.line, take: r.take, kind: r.kind })),
  ...GAME_CLIPS.map((g) => ({ key: `game/${g.id}`, file: g.file, text: g.text, group: "game", cast: g.who, kind: "game" })),
];

const prev: Record<string, any> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const jobs = shuffle(clips.flatMap((c) => Array.from({ length: VOTES }, (_, v) => ({ c, v })))).filter(({ c, v }) => !prev[c.key]?.votes?.[v]);
console.log(`${jobs.length} votes to cast`);
const res: Record<string, any> = prev;
let n = 0;
await pool(jobs, 10, async ({ c, v }) => {
  const accents = shuffle(ACCENTS);
  const features = shuffle(FEATURES);
  const file = join(ROOT, c.file);
  const mime = file.endsWith(".mp3") ? "audio/mp3" : "audio/wav";
  let vote: any;
  for (let attempt = 0; attempt < 3; attempt++) {
    const json = await generate(MODEL, {
      contents: [{ parts: [{ inlineData: { mimeType: mime, data: readFileSync(file).toString("base64") } }, { text: prompt(c.text, accents, features) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 1 },
    });
    try { vote = JSON.parse(textOf(json)); break; } catch { vote = { error: textOf(json).slice(0, 200) }; }
  }
  res[c.key] ??= { ...c, votes: [] };
  res[c.key].votes[v] = { ...vote, order: { accents, features: features.map((f) => f.split(":")[0].slice(0, 20)) } };
  if (++n % 20 === 0) { writeFileSync(OUT, JSON.stringify(res, null, 1)); process.stdout.write(`${n} `); }
});
writeFileSync(OUT, JSON.stringify(res, null, 1));
console.log("\nwrote", OUT);
