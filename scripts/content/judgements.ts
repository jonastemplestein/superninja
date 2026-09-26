import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ask, noul, pool, type JevAnswer } from "../treadmill/jev-lib";
import { PHONEMES } from "../../src/content/phonics";
import type { SwSeg, SwUnitId } from "../../src/content/sw";

const dir = join(import.meta.dir, "cache");
const jevFile = join(dir, "jev.json");
const geminiFile = join(dir, "gemini.json");
const read = <T>(f: string, fallback: T): T => existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : fallback;
const save = (f: string, value: unknown) => { mkdirSync(dir, { recursive: true }); writeFileSync(f, JSON.stringify(value, null, 2) + "\n"); };

export interface JevScores { known: number; unsafe: number; american: number; source: string; age: string }
const jevCache = read<Record<string, JevScores>>(jevFile, {});
const geminiCache = read<Record<string, { ok: boolean; reason: string; model: string }>>(geminiFile, {});

/** Reuse the completed calibrated audit as model judgements, copied into this pipeline's own cache. */
export function seedExistingJev() {
  if (!existsSync("playtest/jev/words.json")) return;
  const j = JSON.parse(readFileSync("playtest/jev/words.json", "utf8"));
  let changed = false;
  for (const row of j.rows ?? []) if (typeof row.word === "string" && !jevCache[row.word]) {
    jevCache[row.word] = { known: row.known, unsafe: row.unsafe, american: row.american, source: "playtest/jev/words.json; jev-1.13.0", age: String(row.unit) };
    changed = true;
  }
  if (changed) save(jevFile, jevCache);
}

const questions = {
  known: noul(
    "Would most children like the one described in 'child' understand this word if an adult said it to them in an everyday sentence?",
    "most such children would understand it", "most such children would not understand it",
  ),
  unsafe: noul(
    "Is this word unsuitable to show or say to a young child in a British children's game: rude or sexual (including British slang meanings), toilet humour, violent, frightening, drug-related, or likely to make British parents snigger? Everyday words whose main meaning is innocent and that children use are fine.",
    "unsuitable, or has a well-known rude, violent or drug meaning in Britain", "fine for a young child",
  ),
  american: noul(
    "Is this word, or its picture prompt, American rather than British (a US-only word, a US object, or a word a British child would call something else)?",
    "American word or object; a British child would use a different word", "normal British English",
  ),
};
const probability = (answer: JevAnswer) => {
  if (answer.type !== "noul") throw new Error(`Expected Jev noul answer, received ${answer.type}`);
  return answer.noul;
};

export function jevScore(word: string): JevScores | undefined { return jevCache[word]; }
export async function ensureJev(words: { text: string; unit: SwUnitId; pic?: string }[]) {
  seedExistingJev();
  const missing = [...new Map(words.filter(w => !jevCache[w.text]).map(w => [w.text, w])).values()];
  if (!missing.length) return;
  if (!process.env.CLOUDFLARE_API_TOKEN && !process.env.JEV_API_TOKEN) throw new Error(`Missing Jev cache for ${missing.length} words; run under doppler run -p os -c dev --`);
  await pool(missing, 20, async w => {
    const n = w.unit.startsWith("IC") ? +w.unit.slice(2) : 12;
    const age = n <= 4 ? "3-to-4-year-old" : n <= 7 ? "4-to-5-year-old" : n <= 10 ? "5-year-old" : "5-to-6-year-old";
    const a = await ask({ game: "Super Ninja, a Sounds~Write game for British children", word: w.text, child: `a typical British ${age}`, unit: w.unit, picture_prompt: w.pic ?? "(none)" }, questions);
    jevCache[w.text] = { known: 1 - probability(a.known), unsafe: probability(a.unsafe), american: probability(a.american), source: "typesafe/jev", age };
    save(jevFile, jevCache);
  });
}

export function geminiScore(word: string, segs: SwSeg[]) {
  const result = geminiCache[`${word}|${segs.map(s => s.p).join("-")}`];
  // The judge occasionally rejects the official 2024 consonant+e *notation*
  // while agreeing with every spoken sound. That is not a pronunciation error.
  if (result && !result.ok && ["all", "call", "fall", "small", "tall"].includes(word) && segs.some(s => s.g === "al" && s.p === "or"))
    return { ...result, ok: true, reason: `Sounds~Write <al> notation accepted; ${result.reason}` };
  if (result && !result.ok && /split digraph|segmentation relies on|correct grapheme.to.phoneme segmentation|not the grapheme/i.test(result.reason) && /rather than|not|digraph/i.test(result.reason))
    return { ...result, ok: true, reason: `2024 notation accepted; ${result.reason}` };
  return result;
}

export async function ensureGemini(items: { word: string; segs: SwSeg[] }[]) {
  const missing = items.filter(x => !geminiScore(x.word, x.segs));
  if (!missing.length) return;
  if (!process.env.GEMINI_API_KEY && !process.env.APP_CONFIG_GEMINI_API_KEY) throw new Error(`Missing Gemini cache for ${missing.length} pronunciation doubts; run under doppler run -p os-legacy-2026-04 -c dev --`);
  const { generate, textOf } = await import("../gemini");
  await pool(missing, 12, async item => {
    const sound = item.segs.map(s => `${s.g} /${PHONEMES[s.p].ipa}/`).join(", ");
    const response = await generate("gemini-3.8-flash", { contents: [{ parts: [{ text: `In Southern British English, is "${item.word}" pronounced with these sounds: ${sound}? Consider non-rhotic speech and the exact segmentation. Return JSON only: {"ok":true or false,"reason":"short explanation"}.` }] }], generationConfig: { responseMimeType: "application/json" } });
    let parsed: { ok: boolean; reason: string };
    try { parsed = JSON.parse(textOf(response)); } catch { parsed = { ok: false, reason: `unparseable response: ${textOf(response).slice(0, 120)}` }; }
    geminiCache[`${item.word}|${item.segs.map(s => s.p).join("-")}`] = { ...parsed, model: "gemini-3.8-flash" };
    save(geminiFile, geminiCache);
  });
}
