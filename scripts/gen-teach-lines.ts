// Whole-sentence example clips for the teacher language (src/content/teach.ts). Splicing single word clips with
// "…and…" sounded choppy, so each sound and each spelling gets its example words recorded as ONE natural sentence,
// e.g. "You can hear it in rain, tray and tail." Pure sounds are still spliced in, because TTS can't say them inside
// a sentence. Writes src/content/teach-lines.gen.ts (the lines and the example words the screen should show);
// then `bun scripts/gen-audio.ts lines` records and checks them like every other line.
// Usage: bun scripts/gen-teach-lines.ts   (re-run when words or gems change; then record the new or changed clips)
import { writeFileSync } from "node:fs";
import { PETALS } from "../src/content/flower";
import { WORDS, type Word } from "../src/content/phonics";
import { TEACH_EXAMPLES as PREV } from "../src/content/teach-lines.gen";

const store: Record<string, string> = {};
(globalThis as any).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => (store[k] = v) };
const { soundExamples, examplesFor } = await import("../src/content/teach");

const listText = (ws: string[]) => (ws.length > 1 ? `${ws.slice(0, -1).join(", ")} and ${ws[ws.length - 1]}` : ws[0] ?? "");
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const safe = (k: string) => k.replace(">", "_").replace(/-/g, "");

/** Example words are pinned once generated: their clips are recorded, and the screens show the same words. A re-run keeps
 *  a key's words while every one of them still fits (so a change elsewhere in the word list doesn't silently change what
 *  Sensei says); a new key gets fresh ones. To re-pick a key, delete its entry from teach-lines.gen.ts first. */
const BY_TEXT = new Map(WORDS.map((w) => [w.text, w]));
const pinned = (key: string, fits: (w: Word) => boolean): string[] | null => {
  const prev = PREV[key];
  return prev?.length && prev.every((t) => { const w = BY_TEXT.get(t); return !!w && fits(w); }) ? prev : null;
};

/** A key's pinned words that still fit, in their order, topped up to `n` from `fresh` (best first): words with a
 *  picture first (the screen shows each example as a card), and a word without one only to make two. */
const refill = (key: string, fits: (w: Word) => boolean, fresh: string[], n = 3): string[] => {
  const keep = (PREV[key] ?? []).filter((t) => { const w = BY_TEXT.get(t); return !!w && fits(w); });
  const rest = fresh.filter((t) => !keep.includes(t));
  const pictured = [...keep, ...rest.filter((t) => !!BY_TEXT.get(t)?.pic)].slice(0, n);
  return pictured.length >= 2 ? pictured : [...pictured, ...rest.filter((t) => !pictured.includes(t))].slice(0, 2);
};

/** A spelling's first example, where the best-ranked word would repeat another spelling's in the same breath: the trip
 *  after w1-3 says /a/ and /t/ one after the other, and both would be "mat" (docs/SCRIPT_FIXES.md C3.4). */
const FIRST: Record<string, string> = { "t>t": "tap" };

const lines: { id: string; text: string }[] = [];
const examples: Record<string, string[]> = {};
for (const pt of PETALS) {
  if (!pt.gems.some((g) => g.inPlay)) continue; // sounds not in the game yet stay a secret
  // a sound's examples are spelt with its first-taught spelling (TV-F2.5, the pedagogy judge's < c > finding: tp_k_hear
  // "cat, king and duck" came straight before "This is how we write…" /k/ showing < c >), so the one recording also
  // serves the Dojo lesson that teaches the sound with that spelling. Other spellings get their own gem lines.
  // The pinned words that still fit are kept, in their order, and only the others are replaced.
  const taught = pt.gems.filter((g) => g.inPlay).sort((a, b) => a.unit - b.unit)[0].g;
  const own = soundExamples(pt.p, { n: 6, g: taught }).map((w) => w.text);
  const ex = own.length >= 2
    ? refill(`petal:${pt.p}`, (w) => w.segs.some((sg) => sg.p === pt.p && sg.g === taught), own)
    : pinned(`petal:${pt.p}`, (w) => w.segs.some((sg) => sg.p === pt.p)) ?? soundExamples(pt.p, { n: 3 }).map((w) => w.text);
  if (ex.length) {
    examples[`petal:${pt.p}`] = ex;
    lines.push({ id: `tp_${pt.p}_hear`, text: `You can hear it in ${listText(ex)}.` });
    lines.push({ id: `tp_${pt.p}_list`, text: `${cap(listText(ex))}.` });
  }
  for (const gem of pt.gems.filter((g) => g.inPlay)) {
    let ws = pinned(`gem:${gem.key}`, (w) => w.segs.some((sg) => sg.g === gem.g && sg.p === gem.p)) ?? examplesFor(gem.g, gem.p, { n: 3 }).map((w) => w.text);
    const first = FIRST[gem.key];
    if (first) ws = [first, ...ws.filter((w) => w !== first)].slice(0, 3);
    if (!ws.length) continue;
    const k = safe(gem.key);
    examples[`gem:${gem.key}`] = ws;
    // the Sounds~Write formula with the sound ending its sentence: "Here's the sound…" /m/ · "This is the way we spell it
    // in mat." (docs/TEACHER_SCRIPT.md §3.14, T11). `_in` ("…in mat.", spliced after the sound) retires with it.
    lines.push({ id: `tg_${k}_way`, text: `This is the way we spell it in ${ws[0]}.` });
    lines.push({ id: `tg_${k}_in`, text: `...in ${ws[0]}.` });
    if (ws.length > 1) lines.push({ id: `tg_${k}_see`, text: `We see this spelling in ${listText(ws.slice(1))}.` });
    lines.push({ id: `tg_${k}_like`, text: `...like in ${listText(ws)}.` });
  }
}
writeFileSync(
  "src/content/teach-lines.gen.ts",
  `// GENERATED by scripts/gen-teach-lines.ts: example sentences for teach.ts, one clip each. Don't edit by hand.
export const TEACH_LINES: { id: string; text: string }[] = ${JSON.stringify(lines, null, 1)};
/** The example words each clip says, so the screen shows the same words ("petal:ae", "gem:ai>ae"). */
export const TEACH_EXAMPLES: Record<string, string[]> = ${JSON.stringify(examples, null, 1)};
`,
);
console.log(`${lines.length} example lines for ${Object.keys(examples).length} sounds and spellings → src/content/teach-lines.gen.ts`);
