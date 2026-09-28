// Speech-template pilot (SPT11), step 3: the blind A/B. For the 40 A/B samples in plan.json, the Gemini audio judge
// hears "today" and "new" (assemble.py) as Clip 1 and Clip 2 and says which sounds more like a real teacher speaking
// naturally. 3 votes a pair: new first, today first, then a coin toss (temperature 1, so the votes are independent).
//
//   doppler run -p os-legacy-2026-04 -c dev -- bun playtest/speech-templates/pilot/judge.ts
//   → playtest/speech-templates/pilot/judge.json (resumable: votes already cast are kept)
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { generate, pool, textOf } from "../../../scripts/gemini";

const HERE = import.meta.dir;
const MODEL = process.env.JUDGE_MODEL ?? "gemini-3.8-flash";
const OUT = join(HERE, "judge.json");
type Row = { id: string; tpl: string; ab: boolean; files: { today: string; new: string } };
const rows: Row[] = JSON.parse(readFileSync(join(HERE, "joins.json"), "utf8")).filter((r: Row) => r.ab);
const plan = JSON.parse(readFileSync(join(HERE, "plan.json"), "utf8"));
const textOf2 = new Map<string, { today: string; new: string }>(plan.samples.map((s: any) => [s.id, s.text]));
const res: Record<string, any> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const save = () => writeFileSync(OUT, JSON.stringify(res, null, 1) + "\n");
const b64 = (p: string) => readFileSync(join(HERE, p)).toString("base64");

const PROMPT = `You will hear two audio clips, Clip 1 and then Clip 2. Each is a version of the same instruction or question, spoken by the teacher in a British phonics game for 4-year-olds; the wording may differ between them. Some versions contain an isolated phonics sound (a short "a", "sss", "mmm" and so on) or a word said slowly, sound by sound: that is on purpose and correct, so judge only how naturally it sits in what the teacher says, not the sound itself.

Which clip sounds more like a real teacher speaking naturally to a child? Weigh:
- the wording: is it what a teacher would actually say?
- the rhythm and melody: one person talking, or pieces joined together (odd pauses, a word dropped in on its own, jumps in pitch, loudness, speed or voice quality, clicks)?

Reply ONLY with JSON: {"better": 1 or 2, "clip1_spliced": true or false, "clip2_spliced": true or false, "reason": "<one short sentence>"}`;

/** the pair's audio: a vote cast on other audio (a re-rendered piece) is stale and is cast again */
const hashOf = (r: Row) => createHash("sha1").update(readFileSync(join(HERE, r.files.today))).update(readFileSync(join(HERE, r.files.new))).digest("hex").slice(0, 10);
const H = new Map(rows.map((r) => [r.id, hashOf(r)]));
const jobs = rows.flatMap((r) => [0, 1, 2].map((v) => ({ key: `${r.id}|${v}`, r, v })));
for (const j of jobs) if (res[j.key] && res[j.key].h && res[j.key].h !== H.get(j.r.id)) delete res[j.key];
for (const j of jobs) if (res[j.key] && !res[j.key].h) res[j.key].h = H.get(j.r.id); // votes cast before hashing: on today's files
const todo = jobs.filter((j) => !res[j.key]);
console.log(`${jobs.length} votes (${rows.length} pairs × 3), ${todo.length} to cast · ${MODEL}`);
await pool(todo, 6, async ({ key, r, v }) => {
  const newFirst = v === 0 ? true : v === 1 ? false : Math.random() < 0.5;
  const [c1, c2] = newFirst ? ["new", "today"] : ["today", "new"];
  try {
    const json = await generate(MODEL, {
      contents: [{ parts: [
        { text: "Clip 1:" }, { inlineData: { mimeType: "audio/mp3", data: b64(r.files[c1 as "new"]) } },
        { text: "Clip 2:" }, { inlineData: { mimeType: "audio/mp3", data: b64(r.files[c2 as "new"]) } },
        { text: PROMPT },
      ] }],
      generationConfig: { responseMimeType: "application/json", temperature: 1 },
    });
    const j = JSON.parse(textOf(json));
    res[key] = { id: r.id, h: H.get(r.id), tpl: r.tpl, v, first: c1, winner: j.better === 1 ? c1 : c2, spliced: { [c1]: j.clip1_spliced, [c2]: j.clip2_spliced }, reason: j.reason };
    save();
  } catch (e) {
    console.log("fail", key, String(e).slice(0, 160));
  }
});

// ---------------------------------------------------------------- report
const votes = Object.values(res).filter((x: any) => H.has(x.id) && x.h === H.get(x.id));
const SOUND = /^(s_|ws_)/;
const CONTROLS = new Set(["w_next_q", "w_name_pic"]);
const summary = (xs: any[]) => ({ votes: xs.length, new: xs.filter((x) => x.winner === "new").length, rate: xs.length ? +(xs.filter((x) => x.winner === "new").length / xs.length).toFixed(3) : 0, new_spliced: xs.filter((x) => x.spliced.new).length, today_spliced: xs.filter((x) => x.spliced.today).length });
const byPair = new Map<string, any[]>();
for (const x of votes) byPair.set(x.id, [...(byPair.get(x.id) ?? []), x]);
const pairs = [...byPair.entries()].map(([id, xs]) => ({ id, tpl: xs[0].tpl, new: xs.filter((x) => x.winner === "new").length, of: xs.length, reasons: xs.map((x) => `${x.winner}: ${x.reason}`) }));
const byTpl: Record<string, any> = {};
for (const x of votes) (byTpl[x.tpl] ??= []).push(x);
const report = {
  model: MODEL,
  overall: summary(votes),
  // w_next_q and w_name_pic say the same words both sides, each a single take: controls for the judge's order bias
  no_controls: summary(votes.filter((x) => !CONTROLS.has(x.tpl))),
  controls: summary(votes.filter((x) => CONTROLS.has(x.tpl))),
  word_templates: summary(votes.filter((x) => !SOUND.test(x.tpl) && !CONTROLS.has(x.tpl))),
  sound_templates: summary(votes.filter((x) => SOUND.test(x.tpl))),
  pairs_won: pairs.filter((p) => p.new * 2 > p.of).length, pairs: pairs.length,
  by_template: Object.fromEntries(Object.entries(byTpl).map(([t, xs]) => [t, summary(xs)])),
  losses: pairs.filter((p) => p.new * 2 < p.of).map((p) => ({ ...p, text: textOf2.get(p.id), files: rows.find((r) => r.id === p.id)!.files })),
};
writeFileSync(join(HERE, "judge-report.json"), JSON.stringify(report, null, 1) + "\n");
console.log(JSON.stringify({ ...report, losses: report.losses.map((l) => `${l.id} ${l.new}/${l.of}`) }, null, 1));
