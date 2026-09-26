// @treadmill-stage — pedagogy linter for every spoken line: src/content/lines.ts plus story narration (stories.ts).
// One Jev request per line (11 typed questions answered in parallel) → Finding[].
//   doppler run -p os -c dev -- bun scripts/treadmill/jev-lint-lines.ts [runDir] [--only id,id]
// Writes playtest/jev/lines.json (findings + every score) and, given a runDir, <runDir>/jev-lines.json ({ findings }).
// Full run: ~250 requests, ~5 s wall clock at 24 in flight, ~$0.02. Thresholds come from jev-calibrate.ts.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LINES } from "../../src/content/lines";
import { STORIES } from "../../src/content/stories";
import type { Finding, Severity } from "./types";
import { ROOT, ask, noul, pool, r2, score, choice, usage, writeOut, type Answers, type JevQuestion } from "./jev-lib";

export interface SpokenLine { id: string; text: string; who: "sensei" | "baron"; section: string; usedIn: string[] }

const GAME =
  "Super Ninja is a Sounds~Write (linguistic phonics) game for British children aged 3 to 8. Most players are 3 to 5 and cannot read yet, so every instruction is spoken aloud and heard once. " +
  "Sensei Maple is a warm female red-panda teacher who speaks in Southern British English. Baron Muddle is the comic villain who stole the sounds; he should feel like playful pantomime menace, never truly frightening.";

const SPEAKER = { sensei: "Sensei Maple (the kind teacher)", baron: "Baron Muddle (the comic villain)" };

/** What the child can see and do where each group of lines is spoken (keyed by lines.ts section prefix). */
const CONTEXT: [prefix: string, context: string][] = [
  ["Title", "Title screen and opening story film. Nothing to do except watch."],
  ["Map", "The world map. The next level is a big, gold, bouncing stone with a pointing hand."],
  ["Praise", "Said straight after a correct answer."],
  ["Correction", "Said straight after a wrong answer, before a sound or word clip."],
  ["Dojo", "Word-building lessons: sound tiles and empty lines are on screen and Sensei demonstrates first."],
  ["Battle", "Spelling battles for children who have already built these words in the dojo: they hear a word and tap sound tiles to spell it."],
  ["Run", "Ninja Run, a moving reading game for children who can already blend simple words: word lanterns float past."],
  ["Swap", "Sound Swap for children who can already build words: a word is on screen as tiles and one sound must be changed."],
  ["Sort", "Sorting, from world 3 (children aged 5+ who read simple words): words on cards, treasure chests labelled with spellings."],
  ["Story", "Story levels at the end of each world. The child is learning to read and sounds out the short on-screen sentences; Sensei reads the narration aloud."],
  ["Rewards", "End-of-level rewards and session end."],
  ["World Flower", "The World Flower screen: a big flower whose petals are sounds and whose gems are spellings."],
  ["Word Book", "A sticker book of words the child has read or spelt."],
  ["Early learning", "Beginner activities for 3-to-4-year-olds: two or three big pictures on screen, Sensei demonstrates first ('watch me, together, your turn')."],
  ["Jump ahead", "Offer to skip ahead after a perfect level."],
  ["Placement", "A short 'show Sensei what you know' quiz for new players."],
  ["Help button", "Spoken when the child taps Sensei's help button in the corner of any screen."],
  ["Ninja Training", "First-run tutorial: a gong, Sensei's help button and a speaker button are on screen."],
  ["Grown-ups", "Settings area for adults."],
  ["Baron Muddle", "The villain appears in a cut-in before battles and bosses."],
];
const contextOf = (section: string) => CONTEXT.find(([p]) => section.startsWith(p) || section.includes(`Story "`) && p === "Story")?.[1];

/** The Jev state for one line. Kept small: the rules live in the question instructions. */
export function lineState(l: SpokenLine) {
  const ctx = contextOf(l.section);
  return {
    game: GAME,
    speaker: SPEAKER[l.who],
    where: ctx ? `${l.section}. ${ctx}` : l.section,
    line: l.text,
    ...(/(\.\.\.|[^.!?"])$/.test(l.text.trim()) ? { note: "This is a fragment: the game immediately plays a separate clip after it (a pure sound like /s/, a word, or a picture's name)." } : {}),
  };
}

/** Linter questions. true / high score = problem, except `kind`, which routes the judgement checks. */
export const LINE_QUESTIONS = {
  kind: choice("What is this line's job for the child?", {
    instruction: "tells or asks the child to do, find, tap, choose, read or spell something, or explains how to play",
    feedback: "praise or correction straight after the child answers",
    story: "narration, scene-setting, welcome, or villain speech the child just listens to",
    grownup: "addressed to a grown-up",
  }),
  letters_talk: noul(
    "Sounds~Write rule: letters do not talk. Does the line say that a letter, tile, spelling, petal or gem 'says', 'makes' or 'goes' a sound (for example 'the letter that says /s/', 'which spelling makes this sound', 'a says a')? People or characters saying things ('Kai says...', 'say it with me') is fine.",
    "a letter, tile or spelling is described as saying/making/going a sound",
    "no letter or spelling is said to say or make a sound",
  ),
  letter_names: noul(
    "Sounds~Write rule: no alphabet letter names. Does the line use a letter NAME (ay, bee, see, dee, ess, em, aitch, double-u, zed, 'capital A') or refer to 'the letter A' or 'the ABC'? Sounds written between slashes like /s/ are sounds, not names.",
    "uses a letter name or 'the letter X'",
    "no letter names",
  ),
  letter_word: noul(
    "Sounds~Write rule: when talking to the child about the tiles they tap or the sounds in a word, say 'sounds', 'spellings' or 'sound tiles', not 'letters', because one sound can be spelt with two or three letters. The fixed phrases 'two letters, one sound' and 'three letters, one sound' are allowed. Does the line call tiles, spellings or sounds 'letters' in another way?",
    "talks about letters where it should say sounds or spellings",
    "does not misuse the word letters",
  ),
  sw_other: noul(
    "Does the line break another Sounds~Write rule: attaching a mnemonic, action, song or keyword picture to a letter ('a is for apple'), adding 'uh' to a consonant sound ('muh', 'tuh'), calling one spelling 'the easiest way' to spell a sound, or telling the child the individual sounds of a word they are meant to be spelling themselves?",
    "breaks one of these rules",
    "none of these problems",
  ),
  vocab: score(
    "Vocabulary. Ignore the game's own names and taught terms (Sensei, Baron Muddle, ninja, dojo, petal, gem, World Flower, sound, spelling, tile). How many of the remaining words would a typical 3-to-4-year-old British child NOT understand?",
    ["every word is familiar to a 3-year-old", "one slightly unusual word whose meaning is clear from context", "one word most 3-to-4-year-olds would not know", "several words a 3-to-4-year-old would not know, or abstract/technical language"],
  ),
  load: score(
    "Listening load. The child hears this line once and cannot read it. How many separate ideas or steps must they hold in mind?",
    ["one short idea", "one idea, a little long", "two ideas or steps", "three or more ideas or steps"],
  ),
  unclear: noul(
    "If the line asks the child to do something, could the child described in 'where' (a 3-to-5-year-old at that point in the game, with that screen in front of them) work out exactly what to do after hearing it once? Mark true only if it IS an instruction and it is unclear, vague, needs reading skills the child does not have yet, or refers to something the child cannot identify on screen. The Sounds~Write routines 'say the sounds', 'read the word' and 'find this sound' are taught and count as clear. Praise, story and feedback lines are false.",
    "an instruction this child probably could not act on",
    "clear, or not an instruction",
  ),
  scary: score(
    "How frightening is this line for a sensitive 3-year-old hearing it in a cartoon game?",
    ["not scary at all", "playful pantomime menace, fine for 3-year-olds", "a little scary for a sensitive 3-year-old", "frightening: threats to hurt, eat, trap or get the child, or dark themes"],
  ),
  deflating: noul(
    "Could this line make a young child feel bad, stupid, rushed or like a failure (for example 'wrong', 'you lost', 'too tricky for you', 'you will never', pressure to hurry, sarcasm)? Gentle 'not quite, try again' is fine.",
    "could make a child feel bad, stupid, rushed or like a failure",
    "encouraging or neutral",
  ),
  american: noul(
    "Does the line use American rather than British English (words like mom, candy, cookie, color, math, awesome, trash, sneakers, recess, kindergarten, zee, 'gotten'; American spelling; or US phrasing)? 'practise' as a verb and 'mum' are British.",
    "American wording or spelling",
    "British English",
  ),
} satisfies Record<string, JevQuestion>;
export type LineKey = keyof typeof LINE_QUESTIONS;

type Check = Exclude<LineKey, "kind">;
type Kind = "instruction" | "feedback" | "story" | "grownup";
/**
 * Finding rules on p(true) or normalised score (0..1). Rule checks use 0.6: on the labelled set in
 * jev-calibrate.ts every violation scored ≥ 0.6 and the worst near-miss ("I can see a bee!") 0.57.
 * The judgement checks (vocab, load, unclear) are ranking signals, so they only apply to the kinds of line
 * where they matter, with high cut-offs; story narration is deliberately rich language.
 */
export const THRESHOLDS: Record<Check, { at: number; severity: Severity; title: string; kinds?: Kind[]; major?: number }> = {
  letters_talk: { at: 0.6, severity: "major", title: "letters 'say' or 'make' sounds (Sounds~Write rule 2)" },
  letter_names: { at: 0.6, severity: "major", title: "uses a letter name (rule 1)" },
  letter_word: { at: 0.6, severity: "minor", title: "says 'letters' where it should say sounds or spellings (rule 3)" },
  sw_other: { at: 0.6, severity: "major", title: "breaks another Sounds~Write rule" },
  vocab: { at: 0.75, severity: "polish", title: "vocabulary too hard for a 3–4 year old", kinds: ["instruction", "feedback"] },
  load: { at: 0.9, severity: "minor", title: "too many steps to hold in mind when heard once", kinds: ["instruction"] },
  unclear: { at: 0.7, severity: "minor", title: "unclear instruction for a pre-reader", kinds: ["instruction"] },
  scary: { at: 0.5, severity: "minor", title: "too scary for a sensitive 3 year old", major: 0.75 },
  deflating: { at: 0.6, severity: "minor", title: "could make the child feel bad, rushed or like a failure", major: 0.85 },
  american: { at: 0.6, severity: "minor", title: "American rather than British English" },
};

export function value(a: Answers<typeof LINE_QUESTIONS>[LineKey]): number {
  if (a.type === "noul") return a.noul;
  if (a.type === "score") return a.score / (Object.keys(a.legend).length - 1);
  return a.probabilities[a.choice];
}

// ---------------------------------------------------------------- gather lines

function sections(): Record<string, string> {
  const src = readFileSync(join(ROOT, "src/content/lines.ts"), "utf8");
  const out: Record<string, string> = {};
  let cur = "";
  for (const row of src.split("\n")) {
    const h = row.match(/^\s*\/\/ --- (.+)$/);
    if (h) cur = h[1].trim();
    for (const m of row.matchAll(/[sb]\("([a-z0-9_]+)"/g)) out[m[1]] = cur;
  }
  return out;
}

function usages(ids: string[]): Record<string, string[]> {
  const files: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(tsx?|jsx?)$/.test(e.name) && !p.endsWith("content/lines.ts")) files.push(p);
    }
  };
  walk(join(ROOT, "src"));
  const text = files.map((f) => [f.slice(ROOT.length + 1), readFileSync(f, "utf8")] as const);
  const out: Record<string, string[]> = {};
  for (const id of ids) {
    const prefix = id.replace(/_?\d+$/, "_");
    out[id] = text.filter(([, t]) => t.includes(`"${id}"`) || t.includes(`'${id}'`) || (prefix !== id && t.includes("`" + prefix))).map(([f]) => f);
  }
  return out;
}

export function spokenLines(): SpokenLine[] {
  const sec = sections();
  const use = usages(LINES.map((l) => l.id));
  const lines: SpokenLine[] = LINES.map((l) => ({ id: l.id, text: l.text, who: l.who ?? "sensei", section: sec[l.id] ?? "", usedIn: use[l.id] ?? [] }));
  for (const st of STORIES)
    for (const p of st.pages)
      if (p.kind === "narr" || p.kind === "question" || p.kind === "choice")
        lines.push({ id: `${st.id}/${p.id}`, text: p.text, who: (p.kind === "narr" && p.who) || "sensei", section: `Story "${st.title}" (${p.kind === "narr" ? "Sensei reads aloud" : "question to the child"})`, usedIn: ["src/scenes/Story.tsx"] });
  return lines;
}

// ---------------------------------------------------------------- run

export async function lintLines(lines: SpokenLine[], concurrency = 24) {
  return pool(lines, concurrency, async (l) => {
    const a = await ask(lineState(l), LINE_QUESTIONS);
    const v = Object.fromEntries(Object.entries(a).filter(([k]) => k !== "kind").map(([k, x]) => [k, r2(value(x))])) as Record<Check, number>;
    const kind = (a.kind.type === "choice" ? a.kind.choice : "instruction") as Kind;
    return { line: l, answers: a, v, kind };
  });
}

export function toFindings(rows: Awaited<ReturnType<typeof lintLines>>): Finding[] {
  const out: Finding[] = [];
  for (const { line, v, answers, kind } of rows) {
    for (const k of Object.keys(THRESHOLDS) as Check[]) {
      const t = THRESHOLDS[k];
      if (v[k] < t.at || (t.kinds && !t.kinds.includes(kind))) continue;
      const a = answers[k];
      const conf = a.type === "noul" ? Math.max(a.noul, 1 - a.noul) : a.confidence;
      out.push({
        sig: `jev:line:${line.id}:${k}`,
        source: "jev",
        severity: t.major != null && v[k] >= t.major ? "major" : t.severity,
        case: `line:${line.id}`,
        title: `${line.id}: ${t.title}`,
        detail: `"${line.text}" (${line.who}, ${kind}, ${line.section.split(" (")[0] || "?"}) — jev ${k}=${v[k]} (confidence ${r2(conf)})${line.usedIn.length ? `; used in ${line.usedIn.join(", ")}` : line.id.includes("/") ? "" : "; not referenced by id in src/ (may be built dynamically)"}`,
        evidence: [line.id.includes("/") ? "src/content/stories.ts" : "src/content/lines.ts"],
      });
    }
  }
  const rank: Record<Severity, number> = { blocker: 0, major: 1, minor: 2, polish: 3 };
  return out.sort((a, b) => rank[a.severity] - rank[b.severity] || a.sig.localeCompare(b.sig));
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const only = args.includes("--only") ? new Set(args[args.indexOf("--only") + 1].split(",")) : null;
  const runDir = args[0] && !args[0].startsWith("--") ? args[0] : null;
  const lines = spokenLines().filter((l) => !only || only.has(l.id));
  const t0 = performance.now();
  const rows = await lintLines(lines);
  const findings = toFindings(rows);
  const u = usage(performance.now() - t0);
  const f = writeOut("lines.json", {
    generated: new Date().toISOString(),
    usage: u,
    thresholds: THRESHOLDS,
    findings,
    rows: rows.map(({ line, v, kind }) => ({ id: line.id, who: line.who, kind, text: line.text, ...v })),
  });
  if (runDir) writeFileSync(join(runDir, "jev-lines.json"), JSON.stringify({ findings }, null, 1) + "\n");
  const byKey: Record<string, number> = {};
  for (const x of findings) byKey[x.sig.split(":").at(-1)!] = (byKey[x.sig.split(":").at(-1)!] ?? 0) + 1;
  console.log(`${lines.length} lines, ${findings.length} findings ${JSON.stringify(byKey)}`);
  console.log(JSON.stringify(u));
  for (const x of findings) console.log(`${x.severity.padEnd(6)} ${x.title} — ${x.detail.slice(0, 150)}`);
  console.log(`→ ${f}`);
}
