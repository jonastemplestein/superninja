// Critic pass on docs/SPEECH_TEMPLATES.md, step 3: the judge on
//  a) single clips: the phrasing takes of "Say {word} slowly." (render.ts), with the experiment's A takes of T1 and T2
//     as references; one vote each, temperature 0, the production judge model;
//  b) the design's sound shape (assemble.py) at 250 ms against 150 ms, 400 ms, and the experiment's C and D
//     (placeholder-cut carriers), three order-balanced votes per pair with the experiment's own blind prompt.
// Run: doppler run -p os-legacy-2026-04 -c dev -- bun playtest/speech-templates/critic/judge.ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generate, pool, textOf } from "../../../scripts/gemini";

const ROOT = join(import.meta.dir, "../../..");
const OUT = join(ROOT, "playtest/runs/speech-templates/critic");
const MODEL = process.env.JUDGE_MODEL ?? "gemini-3.8-flash";
const b64 = (p: string) => readFileSync(p.startsWith("/") ? p : join(ROOT, p)).toString("base64");
const res: Record<string, any> = existsSync(join(OUT, "judge.json")) ? JSON.parse(readFileSync(join(OUT, "judge.json"), "utf8")) : {};
const save = () => writeFileSync(join(OUT, "judge.json"), JSON.stringify(res, null, 1));

// ---- a) single clips
const SINGLE = (text: string, w: string) => `This clip is one sentence from a British phonics game for 4-year-olds, spoken by the teacher character. The script is: "${text}". "${w}" is the target word the child must hear clearly.

Judge it as a listener would, and reply ONLY with JSON:
{"natural": <0-10: how much it sounds like one warm teacher naturally saying this sentence, 10 = completely natural>,
 "odd_pause": true or false (an unnatural pause or break before or after "${w}", beyond what a teacher would do),
 "word_clear": true or false ("${w}" said clearly and completely, its last sound fully audible, British),
 "pace": "too slow" | "good" | "too fast",
 "reason": "<one short sentence>"}`;
const man: { w: string; p: string; k: number; text: string; mp3: string }[] = JSON.parse(readFileSync(join(OUT, "phrasing/manifest.json"), "utf8"));
const singles = [
  ...man.map((m) => ({ key: `S|${m.p}_${m.w}_t${m.k}`, set: m.p, w: m.w, text: m.text, mp3: m.mp3 })),
  ...["frog", "mat", "rain", "ship", "sock", "sun"].flatMap((w) => [
    { key: `S|A_T1_${w}`, set: "A_T1", w, text: `Say ${w} slowly.`, mp3: `playtest/speech-templates/experiments/A/T1_${w}.mp3` },
    { key: `S|A_T2_${w}`, set: "A_T2", w, text: `Can you find the ${w}?`, mp3: `playtest/speech-templates/experiments/A/T2_${w}.mp3` },
  ]),
];

// ---- b) sound pairs (the experiment's prompt, verbatim)
const PAIR = `You will hear two audio clips, Clip 1 and then Clip 2. Each is a version of the same short instruction, spoken by a British teacher to a 4-year-old in a phonics game (the wording may differ slightly between them). Some versions were assembled by splicing separate recordings together; others are single takes. Some contain an isolated phonics sound (a short "a", "sss", "mmm", "sh" and so on) on purpose: that is correct, so judge only how naturally it is joined into the sentence, not the sound itself.

Which clip sounds more like ONE natural, continuous recording of one warm teacher? Listen for: audible joins (clicks, sudden jumps in pitch, loudness, voice quality, speed or room sound), unnatural rhythm or pauses, and a sentence melody that does or doesn't make sense for the words.

Reply ONLY with JSON: {"better": 1 or 2, "clip1_spliced": true or false, "clip2_spliced": true or false, "reason": "<one short sentence>"}`;
const breath: { id: string; gap: number; mp3: string }[] = JSON.parse(readFileSync(join(OUT, "breath/manifest.json"), "utf8"));
const clip = (id: string, m: string) => (m.startsWith("g") ? breath.find((b) => b.id === id && `g${b.gap}` === m)!.mp3 : `playtest/speech-templates/experiments/${m}/${id}.mp3`);
const pairs = [...new Set(breath.map((b) => b.id))].flatMap((id) =>
  [["g250", "g150"], ["g250", "g400"], ["g250", "C"], ["g250", "D"]].flatMap(([x, y]) => [0, 1, 2].map((v) => ({ key: `P|${id}|${x}|${y}|${v}`, id, x, y, v }))));

type Job = { key: string; run: () => Promise<any> };
const jobs: Job[] = [
  ...singles.map((s) => ({ key: s.key, run: async () => {
    const json = await generate(MODEL, { contents: [{ parts: [{ inlineData: { mimeType: "audio/mp3", data: b64(s.mp3) } }, { text: SINGLE(s.text, s.w) }] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } });
    return { ...s, ...JSON.parse(textOf(json)) };
  } })),
  ...pairs.map((p) => ({ key: p.key, run: async () => {
    const xFirst = p.v === 1 ? false : p.v === 0 ? true : Math.random() < 0.5;
    const [c1, c2] = xFirst ? [p.x, p.y] : [p.y, p.x];
    const json = await generate(MODEL, { contents: [{ parts: [{ text: "Clip 1:" }, { inlineData: { mimeType: "audio/mp3", data: b64(clip(p.id, c1)) } }, { text: "Clip 2:" }, { inlineData: { mimeType: "audio/mp3", data: b64(clip(p.id, c2)) } }, { text: PAIR }] }], generationConfig: { responseMimeType: "application/json", temperature: 1 } });
    const r = JSON.parse(textOf(json));
    return { ...p, first: c1, winner: r.better === 1 ? c1 : c2, spliced: { [c1]: r.clip1_spliced, [c2]: r.clip2_spliced }, reason: r.reason };
  } })),
];
const todo = jobs.filter((j) => !res[j.key]);
console.log(jobs.length, "judge calls,", todo.length, "to do");
await pool(todo, 8, async (j) => {
  try { res[j.key] = await j.run(); } catch (e) { console.log("fail", j.key, String(e).slice(0, 120)); }
  save();
});

// ---- report
const S = Object.values(res).filter((r: any) => r.key.startsWith("S|"));
console.log("\nset     n  natural (mean)  odd pause  word clear  pace good");
for (const set of ["A_T1", "P0", "P1", "P2", "P3", "A_T2"]) {
  const rs = S.filter((r: any) => r.set === set);
  if (!rs.length) continue;
  const mean = rs.reduce((n: number, r: any) => n + r.natural, 0) / rs.length;
  console.log(`${set.padEnd(6)} ${String(rs.length).padStart(2)}  ${mean.toFixed(1).padStart(6)}        ${rs.filter((r: any) => r.odd_pause).length}/${rs.length}       ${rs.filter((r: any) => r.word_clear).length}/${rs.length}       ${rs.filter((r: any) => r.pace === "good").length}/${rs.length}`);
}
const P = Object.values(res).filter((r: any) => r.key.startsWith("P|"));
console.log("\n250 ms design shape vs   votes won by 250   250 called spliced   other called spliced");
for (const y of ["g150", "g400", "C", "D"]) {
  const rs = P.filter((r: any) => r.y === y);
  if (!rs.length) continue;
  console.log(`${y.padEnd(24)} ${rs.filter((r: any) => r.winner === "g250").length}/${rs.length}              ${rs.filter((r: any) => r.spliced.g250).length}/${rs.length}               ${rs.filter((r: any) => r.spliced[y]).length}/${rs.length}`);
}
