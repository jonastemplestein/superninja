// @treadmill-stage — word-list auditor for src/content/phonics.ts (+ ORAL_WORDS) against how worlds.ts and the
// early games use each word. One Jev request per word, 6 typed questions → Finding[], plus a deterministic
// same-sounds check (Jev can't be trusted with pronunciation: see docs/JEV.md).
//   doppler run -p os -c dev -- bun scripts/treadmill/jev-words.ts [runDir] [--only cat,dog]
// Writes playtest/jev/words.json (findings + every score) and, given a runDir, <runDir>/jev-words.json ({ findings }).
// Jev is text-only: it judges the picture PROMPT, not the image. Against blind vision naming of the real pictures
// (pic-audit.ts) its picture questions reach only AUC ≈ 0.7, so they are a cheap pre-generation screen for new
// prompts, emitted as "minor" at high-precision thresholds, and skipped for words the vision audit has covered.
// British sexual slang is a blind spot for the unsafe question, hence the small denylist below.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as phonics from "../../src/content/phonics";
import { ORAL_WORDS, PHONEMES, WORDS, type PhonemeId, type Word } from "../../src/content/phonics";
/** phonics.ts may exclude same-sound words from spelling (dictationSafe); those are already handled. */
const guarded = (w: Word) => (phonics as any).dictationSafe?.(w) === false;
import { LEVELS } from "../../src/content/worlds";
import type { Finding, Severity } from "./types";
import { ask, noul, pool, r2, score, usage, writeOut, type JevAnswer } from "./jev-lib";

// ---------------------------------------------------------------- how each word is used (mirrors src/scenes/Early.tsx)
const LISTEN = ["pan", "pin", "map", "mop", "top", "tap", "cat", "cot", "sun", "dog", "mat", "bus", "fan", "cup", "man", "hat", "mug", "pig"];
const FOILS = ["dog", "bus", "cup", "hat", "hen", "jam", "bed", "fox", "web", "zip", "van", "cat", "pig", "fan"];
const HUNT: Record<string, [string, string][]> = {
  i: [["fin", "fan"], ["pin", "pan"], ["tin", "tap"], ["lid", "mat"], ["pig", "cat"], ["wig", "hat"], ["bin", "bag"]],
  o: [["mop", "map"], ["top", "tap"], ["pot", "pan"], ["cot", "cat"], ["hot", "hat"], ["dog", "bag"], ["fox", "van"]],
};
const firstSoundTargets = (p: PhonemeId) => [
  ...WORDS.filter((w) => w.pic && w.segs[0].p === p && w.segs.length <= 4 && !["sh", "ch"].includes(w.segs[0].g) && !(w.segs[1] && !PHONEMES[w.segs[1].p].vowel)).map((w) => w.text),
  ...Object.keys(ORAL_WORDS).filter((w) => ORAL_WORDS[w].first === p),
];

function uses(): Record<string, string[]> {
  const u: Record<string, Set<string>> = {};
  const add = (w: string, s: string) => (u[w] ??= new Set()).add(s);
  LISTEN.forEach((w) => add(w, "listening game (warm-ups): pick the picture you hear"));
  FOILS.forEach((w) => add(w, "first-sound game foil picture"));
  for (const [g, pairs] of Object.entries(HUNT)) pairs.flat().forEach((w) => add(w, `sound-hunt picture (/${g}/ in the middle?)`));
  for (const l of LEVELS) {
    if (l.kind === "firstsound") for (const t of l.teach ?? []) for (const w of firstSoundTargets(t as PhonemeId)) add(w, `first-sound game ${l.id}: "which one starts with /${t}/?" picture`);
    for (const w of l.words ?? []) add(w, `built/read in ${l.id}`);
    for (const pr of l.read ?? []) pr.forEach((w) => add(w, `"who read it right?" in ${l.id}`));
    for (const w of l.chain ?? []) add(w, `sound-swap chain in ${l.id}`);
  }
  return Object.fromEntries(Object.entries(u).map(([k, v]) => [k, [...v]]));
}
const ORAL_USE = (u: string[]) => u.some((x) => /listening|first-sound|sound-hunt/.test(x));
const FIRST_USE = (u: string[]) => u.some((x) => /first-sound game w/.test(x));

// ---------------------------------------------------------------- state + questions
export interface Item { text: string; unit: number | "oral"; pic?: string; uses: string[] }

/** Age of a typical child meeting this word: oral picture games are for 3–4s; later units for older children. */
const ageOf = (it: Item) => (ORAL_USE(it.uses) || it.unit === "oral" || it.unit <= 4 ? "3-to-4-year-old" : it.unit <= 7 ? "4-to-5-year-old" : it.unit <= 10 ? "5-year-old" : "5-to-6-year-old");

export function wordState(it: Item) {
  return {
    game: "Super Ninja, a Sounds~Write phonics game for British children aged 3 to 8. Words are spoken in a Southern British voice. Pictures are painted single objects on white, no text.",
    word: it.text,
    child: `a typical British ${ageOf(it)}`,
    ...(it.unit === "oral" ? { note: "Listening-only word: heard and pictured, never written." } : { unit: `teaching unit ${it.unit} of 12` }),
    ...(it.pic ? { picture_prompt: it.pic } : { picture_prompt: "(none: the word is only read and spelt)" }),
    used_in: it.uses.length ? it.uses : ["random reading and spelling practice in its unit (battles, runs, swaps)"],
  };
}

export const WORD_QUESTIONS = {
  known: noul(
    "Would most children like the one described in 'child' understand this word if an adult said it to them in an everyday sentence?",
    "most such children would understand it",
    "most such children would not understand it",
  ),
  unsafe: noul(
    "Is this word unsuitable to show or say to a young child in a British children's game: rude or sexual (including British slang meanings), toilet humour, violent, frightening, drug-related, or likely to make British parents snigger? Everyday words whose main meaning is innocent and that children use are fine.",
    "unsuitable, or has a well-known rude, violent or drug meaning in Britain",
    "fine for a young child",
  ),
  american: noul(
    "Is this word, or its picture prompt, American rather than British (a US-only word, a US object, or a word a British child would call something else)?",
    "American word or object; a British child would use a different word",
    "normal British English",
  ),
  name_agree: score(
    "The child is shown a picture drawn from picture_prompt and asked 'What's this?'. How likely are they to say exactly the target word (not a synonym, a related word, or what the thing is doing)? If there is no picture, answer 'almost always'.",
    ["almost never says the word", "sometimes says the word", "usually says the word", "almost always says the word"],
  ),
  alt_first: noul(
    "Picture naming risk for a first-sound game ('which one starts with /s/?'). Is there a likely OTHER name the child would give this picture that starts with a DIFFERENT first sound from the target word (for example 'kitten' drawn as a cat → 'cat')? If there is no picture, answer false.",
    "a likely other name starts with a different sound",
    "no likely other name, or it starts with the same sound",
  ),
};
type Key = keyof typeof WORD_QUESTIONS;

/** 0..1, high = bad */
function bad(k: Key, a: JevAnswer) {
  if (a.type === "noul") return k === "known" ? 1 - a.noul : a.noul;
  if (a.type === "score") {
    const v = a.score / (Object.keys(a.legend).length - 1);
    return k === "known" || k === "name_agree" ? 1 - v : v;
  }
  return 0;
}

/**
 * Thresholds and severities from jev-calibrate.ts (numbers in docs/JEV.md). Text-only judgements are "minor" at most;
 * only a clearly unsuitable word is "major".
 *  known      60 hand-labelled words: AUC 0.99; at 0.6 precision 1.0, recall 0.88. Spearman 0.73 with published AoA
 *             (Kuperman 2012, n = 400; log word frequency: 0.59); flags 0 of 124 words learnt by age 4½.
 *  name_agree vs blind vision naming of 160 real pictures: AUC 0.71 (prompt length alone: 0.79); at 0.7 precision 0.93, recall 0.19.
 *  alt_first  vs vision (top name starts with another sound): AUC 0.76; at 0.7 precision 1.0, recall 0.13.
 *  So the picture questions only screen NEW prompts before art is generated; the vision audit is the real check.
 *  unsafe     24 labelled words: AUC 0.97, clean words ≤ 0.34; misses British sexual slang (knob 0.10, shag 0.30).
 *  american   24 labelled words: AUC 1.0, US words ≥ 0.31 (one at 0.33), British ≤ 0.24.
 */
const RULES: { k: Key; at: number; title: string; sev: (it: Item, v: number) => Severity; needPic?: boolean; only?: (it: Item) => boolean }[] = [
  { k: "unsafe", at: 0.45, title: "unsuitable word for a young child", sev: (_, v) => (v >= 0.6 ? "major" : "minor") },
  { k: "known", at: 0.6, title: "most children at this stage won't know this word", sev: (it) => (ORAL_USE(it.uses) || it.pic ? "minor" : "polish") },
  { k: "name_agree", at: 0.7, needPic: true, title: "prompt screen: children may call this picture something else", sev: (it) => (ORAL_USE(it.uses) ? "minor" : "polish") },
  { k: "alt_first", at: 0.7, needPic: true, only: (it) => FIRST_USE(it.uses), title: "prompt screen: a likely other name starts with a different sound", sev: () => "minor" },
  { k: "american", at: 0.3, title: "American word or picture", sev: () => "minor" },
];

/** Words whose real picture was named blind by the vision audit (pic-audit.ts): its verdict beats a text guess. */
function visionCovered(runDir: string | null): Set<string> {
  const dirs = [runDir, ...readdirSync("playtest/runs").map((d) => `playtest/runs/${d}`)].filter(Boolean) as string[];
  for (const d of dirs)
    for (const f of ["pics-all.json", "pics.json"]) {
      const p = `${d}/${f}`;
      if (!existsSync(p)) continue;
      try {
        const j = JSON.parse(readFileSync(p, "utf8"));
        const rows: any[] = Array.isArray(j) ? j : j.results ?? j.findings ?? [];
        const ws = new Set(rows.map((r) => r.word ?? r.sig?.match(/^pics?:([a-z]+)/)?.[1]).filter(Boolean) as string[]);
        if (ws.size > 20) return ws;
      } catch {}
    }
  return new Set();
}

export function items(): Item[] {
  const u = uses();
  return [
    ...WORDS.map((w) => ({ text: w.text, unit: w.unit, pic: w.pic, uses: u[w.text] ?? [] })),
    ...Object.entries(ORAL_WORDS).map(([text, o]) => ({ text, unit: "oral" as const, pic: o.pic, uses: u[text] ?? [] })),
  ];
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const runDir = args[0] && !args[0].startsWith("--") ? args[0] : null;
  const only = args.includes("--only") ? new Set(args[args.indexOf("--only") + 1].split(",")) : null;
  const all = items().filter((it) => !only || only.has(it.text));
  const t0 = performance.now();
  const rows = await pool(all, 24, async (it) => {
    const a = await ask(wordState(it), WORD_QUESTIONS);
    const v = Object.fromEntries((Object.keys(WORD_QUESTIONS) as Key[]).map((k) => [k, r2(bad(k, a[k]))])) as Record<Key, number>;
    return { it, v };
  });
  const findings: Finding[] = [];
  const covered = visionCovered(runDir);
  // Deterministic: words with a rude British meaning that Jev scored low in calibration, plus close relatives.
  const DENY = new Set(["knob", "shag", "bum", "willy", "snog", "slag", "tit", "fag", "prat", "git", "bonk", "hump", "nob", "cock", "dick", "piss", "crap", "twat"]);
  for (const it of all.filter((it) => DENY.has(it.text)))
    findings.push({ sig: `jev:word:${it.text}:denylist`, source: "invariant", severity: "minor", case: `word:${it.text}`, title: `${it.text}: has a rude British slang meaning`, detail: `"${it.text}" (unit ${it.unit}) is on the slang denylist in jev-words.ts. Fine in a phonics scheme, but parents may snigger; consider swapping it.`, evidence: ["src/content/phonics.ts"] });
  for (const { it, v } of rows)
    for (const r of RULES) {
      if (v[r.k] < r.at || (r.needPic && (!it.pic || covered.has(it.text))) || (r.only && !r.only(it))) continue;
      findings.push({
        sig: `jev:word:${it.text}:${r.k}`,
        source: "jev",
        severity: r.sev(it, v[r.k]),
        case: `word:${it.text}`,
        title: `${it.text}: ${r.title}`,
        detail: `"${it.text}" (unit ${it.unit}${it.pic ? `, picture: ${it.pic}` : ""}) — jev ${r.k}=${v[r.k]}${it.uses.length ? `; used in: ${it.uses.join("; ")}` : ""}`,
        evidence: ["src/content/phonics.ts"],
      });
    }
  // Deterministic: words in the list with identical sound sequences can't be told apart in audio-only spelling
  // (battles show a picture only when the word has one).
  const bySounds: Record<string, Word[]> = {};
  for (const w of WORDS) (bySounds[w.segs.map((x) => x.p).join("-")] ??= []).push(w);
  for (const ws of Object.values(bySounds).filter((ws) => ws.length > 1))
    for (const w of ws.filter((w) => !w.pic && !guarded(w)))
      findings.push({
        sig: `jev:word:${w.text}:same-sounds`,
        source: "invariant",
        severity: "major",
        case: `word:${w.text}`,
        title: `${w.text}: sounds identical to ${ws.filter((x) => x !== w).map((x) => x.text).join(", ")} and has no picture`,
        detail: `"${w.text}" (unit ${w.unit}) and ${ws.filter((x) => x !== w).map((x) => `"${x.text}" (unit ${x.unit})`).join(", ")} have the same sounds /${w.segs.map((x) => PHONEMES[x.p].label).join("/ /")}/. In an audio-only spelling battle the child cannot know which spelling is wanted. Give it a picture/sentence, or keep it out of spelling.`,
        evidence: ["src/content/phonics.ts", "src/scenes/Battle.tsx"],
      });
  const rank: Record<Severity, number> = { blocker: 0, major: 1, minor: 2, polish: 3 };
  findings.sort((a, b) => rank[a.severity] - rank[b.severity] || a.sig.localeCompare(b.sig));
  const u = usage(performance.now() - t0);
  const f = writeOut("words.json", { generated: new Date().toISOString(), usage: u, visionCovered: covered.size, findings, rows: rows.map(({ it, v }) => ({ word: it.text, unit: it.unit, pic: it.pic ?? null, oral: ORAL_USE(it.uses), ...v })) });
  if (runDir) writeFileSync(join(runDir, "jev-words.json"), JSON.stringify({ findings }, null, 1) + "\n");
  const byKey: Record<string, number> = {};
  for (const x of findings) byKey[x.sig.split(":").at(-1)!] = (byKey[x.sig.split(":").at(-1)!] ?? 0) + 1;
  console.log(`${all.length} words, ${findings.length} findings ${JSON.stringify(byKey)}\n${JSON.stringify(u)}`);
  for (const x of findings.filter((x) => x.severity !== "polish")) console.log(`${x.severity.padEnd(6)} ${x.title} — ${x.detail.slice(0, 170)}`);
  console.log(`→ ${f}`);
}
