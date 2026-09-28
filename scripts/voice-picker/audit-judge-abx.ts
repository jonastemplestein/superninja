// Accent audit, step 2c: an ABX listening judge. Clip A and clip B are known voices, one British, one American (in a
// random order each vote), saying the same line; clip X is the voice under test. The judge says whose accent X shares,
// comparing pronunciation only. Anchored this way the judge has something to compare against, instead of a label it
// fills in from the words (see audit-judge.ts / audit-judge-blind.ts calibration in playtest/voice-picker/audit.md).
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/voice-picker/audit-judge-abx.ts [--model gemini-3.8-flash] [--votes 3] [--game]
// --game: X is each of the 20 real game clips, against anchors reading the same words (audit-render-anchors.ts).
// Out: playtest/runs/voice-picker/audit/judge-abx.<model>.json
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generate, pool, textOf } from "../gemini";
import { GAME_CLIPS } from "./audit-game-clips";

const ROOT = join(import.meta.dir, "../..");
const args = process.argv.slice(2);
const argOf = (k: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
const MODEL = argOf("--model") ?? "gemini-3.8-flash";
const VOTES = Number(argOf("--votes") ?? 3);
const GAME = args.includes("--game");
const OUT = join(ROOT, `playtest/runs/voice-picker/audit/judge-abx${GAME ? "-game" : ""}.${MODEL}.json`);
const renders: any[] = JSON.parse(readFileSync(join(ROOT, "playtest/runs/voice-picker/audit/renders.json"), "utf8"));
const wav = (cast: string, line: string, take = 1): string | undefined => {
  if (cast === "game") return GAME_CLIPS.find((g) => g.id === line)?.file;
  if (GAME) return `playtest/runs/voice-picker/audit/anchors/${cast}/${line.replace("/", "_")}.wav`;
  return renders.find((r) => r.cast === cast && r.line === line && r.take === take)?.wav;
};

/** Anchor pairs by role: [British, American]. `truth` is known for the controls. */
const PAIRS: Record<string, { uk: string; us: string; tests: { cast: string; takes: number[]; truth?: "uk" | "us" }[] }[]> = {
  sensei: [
    { uk: "eleven-alice", us: "openai-coral", tests: [
      { cast: "sulafat", takes: [1, 2, 3] }, { cast: "sulafat-en-us", takes: [1, 2] },
      { cast: "mac-daniel", takes: [1], truth: "uk" }, { cast: "mac-samantha", takes: [1], truth: "us" }] },
    { uk: "mac-daniel", us: "mac-samantha", tests: [
      { cast: "sulafat", takes: [1, 2, 3] }, { cast: "eleven-alice", takes: [1], truth: "uk" }, { cast: "openai-coral", takes: [1], truth: "us" }] },
  ],
  narrator: [
    { uk: "eleven-alice", us: "openai-coral", tests: [
      { cast: "sulafat", takes: [1, 2, 3] }, { cast: "george", takes: [1] }, { cast: "mac-daniel", takes: [1], truth: "uk" }, { cast: "mac-samantha", takes: [1], truth: "us" }] },
  ],
  baron: [
    { uk: "eleven-george-baron", us: "openai-ash", tests: [{ cast: "algenib", takes: [1, 2, 3] }, { cast: "mac-daniel", takes: [1], truth: "uk" }] },
  ],
};

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const audio = (f: string) => ({ inlineData: { mimeType: f.endsWith(".mp3") ? "audio/mp3" : "audio/wav", data: readFileSync(join(ROOT, f)).toString("base64") } });
const QUESTION = `Clips A and B are two different speakers with two different accents, saying the same sentence. Clip X is a third speaker saying it too.
Ignore the voice itself (pitch, gender, age, timbre, speed, emotion, recording quality). Compare ONLY pronunciation: the vowels (for example in fast, bath, grass, dance, can't, half, past, mat), whether an r is sounded after a vowel (car, four, first, word, world), and how a t between vowels sounds (water, butter).
Whose accent does X share: A's or B's?
Reply ONLY with JSON: {"closer": "A" | "B", "p_A": <0-100, how likely X's accent is A's>, "reason": "<one sentence naming the words that decided it>"}`;

interface Job { key: string; role: string; line: string; cast: string; take: number; uk: string; us: string; truth?: string; v: number }
const jobs: Job[] = [];
if (GAME)
  for (const g of GAME_CLIPS) {
    const [uk, us] = g.who.startsWith("baron") ? ["eleven-george-baron", "openai-ash"] : ["eleven-alice", "openai-coral"];
    for (let v = 0; v < VOTES; v++) jobs.push({ key: `${uk}~${us}|game/${g.id}`, role: g.who, line: g.id, cast: "game", take: 1, uk, us, v });
  }
else for (const [role, pairs] of Object.entries(PAIRS))
  for (const pr of pairs)
    for (const line of renders.filter((r) => r.role === role && r.cast === pr.uk && r.take === 1).map((r) => r.line))
      for (const t of pr.tests)
        for (const take of t.takes) {
          if (!wav(t.cast, line, take) || !wav(pr.us, line)) continue;
          for (let v = 0; v < VOTES; v++) jobs.push({ key: `${pr.uk}~${pr.us}|${t.cast}/${line}.t${take}`, role, line, cast: t.cast, take, uk: pr.uk, us: pr.us, truth: t.truth, v });
        }

const res: Record<string, any> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const todo = shuffle(jobs).filter((j) => !res[j.key]?.votes?.[j.v]);
console.log(`${MODEL}: ${todo.length} votes`);
let n = 0;
await pool(todo, MODEL.includes("pro") ? 6 : 10, async (j) => {
  const ukIsA = Math.random() < 0.5;
  const [a, b] = ukIsA ? [wav(j.uk, j.line)!, wav(j.us, j.line)!] : [wav(j.us, j.line)!, wav(j.uk, j.line)!];
  let vote: any;
  for (let attempt = 0; attempt < 3; attempt++) {
    const json = await generate(MODEL, {
      contents: [{ parts: [{ text: "Clip A:" }, audio(a), { text: "Clip B:" }, audio(b), { text: "Clip X:" }, audio(wav(j.cast, j.line, j.take)!), { text: QUESTION }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 1 },
    });
    try { vote = JSON.parse(textOf(json)); break; } catch { vote = { error: textOf(json).slice(0, 200) }; }
  }
  // p_uk: the judge's probability that X has the British anchor's accent
  const pA = typeof vote.p_A === "number" ? vote.p_A : vote.closer === "A" ? 100 : 0;
  const p_uk = ukIsA ? pA : 100 - pA;
  res[j.key] ??= { role: j.role, line: j.line, cast: j.cast, take: j.take, uk: j.uk, us: j.us, truth: j.truth ?? null, votes: [] };
  res[j.key].votes[j.v] = { ...vote, ukIsA, p_uk, pick: (vote.closer === "A") === ukIsA ? "uk" : "us" };
  if (++n % 20 === 0) { writeFileSync(OUT, JSON.stringify(res, null, 1)); process.stdout.write(`${n} `); }
});
writeFileSync(OUT, JSON.stringify(res, null, 1));
console.log("\nwrote", OUT);
