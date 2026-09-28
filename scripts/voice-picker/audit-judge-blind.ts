// Accent audit, step 2b: a BLIND listening judge. The first judge (audit-judge.ts) was given the words and a list of
// Southern British features, and called a known-American control voice "Southern British" 15 times in 18: it heard
// what the text led it to expect. This one gets the audio only: it transcribes first, then spreads 100 points of
// confidence over the accents (in a fresh random order each vote, temperature 1). Calibrate on the controls first.
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/voice-picker/audit-judge-blind.ts --model gemini-3.8-flash [--kinds control-british,control-american] [--votes 3]
// Out: playtest/runs/voice-picker/audit/judge-blind.<model>.json
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generate, pool, textOf } from "../gemini";
import { GAME_CLIPS } from "./audit-game-clips";

const ROOT = join(import.meta.dir, "../..");
const args = process.argv.slice(2);
const argOf = (k: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
const MODEL = argOf("--model") ?? "gemini-3.8-flash";
const VOTES = Number(argOf("--votes") ?? 3);
const KINDS = argOf("--kinds")?.split(",");
const OUT = join(ROOT, `playtest/runs/voice-picker/audit/judge-blind.${MODEL}.json`);

const ACCENTS = ["Southern British English", "Northern English", "Scottish", "Irish", "General American", "Canadian", "Australian", "New Zealand", "South African"];
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const prompt = (accents: string[]) => `You are a dialectologist. Listen to the speaker's pronunciation only (ignore word choice).
1. Transcribe what is said.
2. For up to five words that are revealing (for example words with an r after a vowel, a t between vowels, or an "a" vowel), give a narrow IPA transcription of exactly how THIS speaker says them.
3. Spread 100 points of confidence over these accents: ${accents.join(", ")}.
Reply ONLY with JSON: {"transcript": "...", "ipa": {"<word>": "<ipa>"}, "confidence": {${accents.map((a) => `"${a}": <0-100>`).join(", ")}}, "reason": "<one sentence>"}`;

interface Clip { key: string; file: string; kind: string; cast?: string; line?: string; take?: number }
const renders: any[] = JSON.parse(readFileSync(join(ROOT, "playtest/runs/voice-picker/audit/renders.json"), "utf8"));
let clips: Clip[] = [
  ...renders.map((r) => ({ key: `${r.cast}/${r.line}.t${r.take}`, file: r.wav, kind: r.kind, cast: r.cast, line: r.line, take: r.take })),
  ...GAME_CLIPS.map((g) => ({ key: `game/${g.id}`, file: g.file, kind: "game", cast: g.who })),
];
if (KINDS) clips = clips.filter((c) => KINDS.includes(c.kind));

const res: Record<string, any> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const jobs = shuffle(clips.flatMap((c) => Array.from({ length: VOTES }, (_, v) => ({ c, v })))).filter(({ c, v }) => !res[c.key]?.votes?.[v]);
console.log(`${MODEL}: ${jobs.length} votes`);
let n = 0;
await pool(jobs, MODEL.includes("pro") ? 6 : 10, async ({ c, v }) => {
  const accents = shuffle(ACCENTS);
  const file = join(ROOT, c.file);
  let vote: any;
  for (let attempt = 0; attempt < 3; attempt++) {
    const json = await generate(MODEL, {
      contents: [{ parts: [{ inlineData: { mimeType: file.endsWith(".mp3") ? "audio/mp3" : "audio/wav", data: readFileSync(file).toString("base64") } }, { text: prompt(accents) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 1 },
    });
    try { vote = JSON.parse(textOf(json)); break; } catch { vote = { error: textOf(json).slice(0, 200) }; }
  }
  res[c.key] ??= { ...c, votes: [] };
  res[c.key].votes[v] = { ...vote, order: accents };
  if (++n % 20 === 0) { writeFileSync(OUT, JSON.stringify(res, null, 1)); process.stdout.write(`${n} `); }
});
writeFileSync(OUT, JSON.stringify(res, null, 1));
console.log("\nwrote", OUT);
