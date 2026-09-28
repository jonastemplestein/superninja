// Speech-template experiment, step 4: the blind naturalness judge. For every item (a template and its slot values),
// every pair of methods is played to Gemini audio understanding as "Clip 1" / "Clip 2" (no names, no paths), three
// votes per pair: a random order, then the reverse, then random again. It also says, per clip, whether it hears a
// splice. Run: doppler run -p os-legacy-2026-04 -c dev -- bun playtest/speech-templates/experiments/tools/judge.ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generate, hash, pool, textOf } from "../../../../scripts/gemini";

const ROOT = join(import.meta.dir, "../../../..");
const RUNS = join(ROOT, "playtest/runs/speech-templates");
const OUT = join(RUNS, process.env.OUT ?? "judge.json");
// tuning runs: EXTRA = more items (JSON list), PAIRS = only these method pairs ("D:Dx,D:Dv1"), SKIP = methods left out
const PAIRS = (process.env.PAIRS ?? "").split(",").filter(Boolean).map((p) => p.split(":").sort().join(":"));
const SKIP = new Set((process.env.SKIP ?? "").split(",").filter(Boolean));
const MODEL = process.env.JUDGE_MODEL ?? "gemini-3.8-flash";

type Item = { method: string; template: string; id: string; label: string; mp3: string };
const items: Item[] = JSON.parse(readFileSync(join(RUNS, "build.json"), "utf8")).items;
if (existsSync(join(RUNS, "e_items.json"))) items.push(...JSON.parse(readFileSync(join(RUNS, "e_items.json"), "utf8")));
if (process.env.EXTRA) items.push(...JSON.parse(readFileSync(process.env.EXTRA, "utf8")));

const byItem = new Map<string, Item[]>();
for (const it of items) if (!SKIP.has(it.method)) byItem.set(it.id, [...(byItem.get(it.id) ?? []), it]);

type Vote = { key: string; id: string; template: string; a: string; b: string; first: string; winner: string; spliced: Record<string, boolean>; reason: string; vote: number };
const votes: Record<string, Vote> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const save = () => writeFileSync(OUT, JSON.stringify(votes, null, 1));

const PROMPT = `You will hear two audio clips, Clip 1 and then Clip 2. Each is a version of the same short instruction, spoken by a British teacher to a 4-year-old in a phonics game (the wording may differ slightly between them). Some versions were assembled by splicing separate recordings together; others are single takes. Some contain an isolated phonics sound (a short "a", "sss", "mmm", "sh" and so on) on purpose: that is correct, so judge only how naturally it is joined into the sentence, not the sound itself.

Which clip sounds more like ONE natural, continuous recording of one warm teacher? Listen for: audible joins (clicks, sudden jumps in pitch, loudness, voice quality, speed or room sound), unnatural rhythm or pauses, and a sentence melody that does or doesn't make sense for the words.

Reply ONLY with JSON: {"better": 1 or 2, "clip1_spliced": true or false, "clip2_spliced": true or false, "reason": "<one short sentence>"}`;

const b64 = (p: string) => readFileSync(join(ROOT, p)).toString("base64");
const jobs: { key: string; it: Item[]; x: Item; y: Item; vote: number }[] = [];
for (const [id, its] of byItem) {
  const ms = its.sort((p, q) => p.method.localeCompare(q.method));
  for (let i = 0; i < ms.length; i++)
    for (let j = i + 1; j < ms.length; j++)
      for (let v = 0; v < 3; v++) if (!PAIRS.length || PAIRS.includes([ms[i].method, ms[j].method].sort().join(":"))) jobs.push({ key: `${id}|${ms[i].method}|${ms[j].method}|${v}`, it: ms, x: ms[i], y: ms[j], vote: v });
}
const todo = jobs.filter((j) => !votes[j.key]);
console.log(jobs.length, "votes,", todo.length, "to do");
let n = 0;
await pool(todo, 10, async (j) => {
  // vote 0 random, vote 1 the reverse of vote 0, vote 2 random
  const coin = parseInt(hash(`${j.x.id}|${j.x.method}|${j.y.method}`).slice(0, 2), 16) % 2 === 0;
  const xFirst = j.vote === 0 ? coin : j.vote === 1 ? !coin : Math.random() < 0.5;
  const [c1, c2] = xFirst ? [j.x, j.y] : [j.y, j.x];
  const json = await generate(MODEL, {
    contents: [{ parts: [
      { text: "Clip 1:" }, { inlineData: { mimeType: "audio/mp3", data: b64(c1.mp3) } },
      { text: "Clip 2:" }, { inlineData: { mimeType: "audio/mp3", data: b64(c2.mp3) } },
      { text: PROMPT },
    ] }],
    generationConfig: { responseMimeType: "application/json", temperature: 1.0 },
  });
  let r: any;
  try { r = JSON.parse(textOf(json)); } catch { r = { better: 0, reason: "unparseable " + textOf(json).slice(0, 100) }; }
  const winner = r.better === 1 ? c1.method : r.better === 2 ? c2.method : "";
  votes[j.key] = { key: j.key, id: j.x.id, template: j.x.template, a: j.x.method, b: j.y.method, first: c1.method, winner,
    spliced: { [c1.method]: !!r.clip1_spliced, [c2.method]: !!r.clip2_spliced }, reason: String(r.reason ?? ""), vote: j.vote };
  if (++n % 25 === 0) { save(); console.log(n, "/", todo.length); }
});
save();
console.log("done");
