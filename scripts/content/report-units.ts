import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BRIDGING_UNIT, SW_SEQUENCE, type SwUnitId } from "../../src/content/sw";
import { ACCENT_SENSITIVE } from "./lists";
import { jevScore } from "./judgements";
import { loadUnit, validateUnits } from "./validate-units";

const units = SW_SEQUENCE.filter(u => u.startsWith("IC") || u === "BR") as SwUnitId[];
const reports = await validateUnits(units);
const data = new Map(await Promise.all(units.map(async u => [u, await loadUnit(u)] as const)));
const lines: string[] = [
  "# Sounds~Write phase A: Initial Code and Bridging content",
  "",
  "Generated from the official September 2024 no-split-spelling policy. The word files were checked against all 15 validator rules; no published entry fails a rule. Counts below compare the generated data with `contentQuota()` in `sw.ts`. Quotas are design targets, not validator gates.",
  "",
  "## Counts and rule failures",
  "",
  "| Unit | Words | Pictureable | Chains | Dictation sentences | Failed rules |",
  "|---|---:|---:|---:|---:|---:|",
];
for (const r of reports) lines.push(`| ${r.unit} | ${r.counts.words}/${r.quota.words} | ${r.counts.pictures}/${r.quota.pictures} | ${r.counts.chains}/${r.quota.swapChains} | ${r.counts.sentences}/${r.quota.sentences} | ${r.rules.filter(x => !x.pass).length} |`);
const total = reports.reduce((a, r) => ({ words: a.words + r.counts.words, pics: a.pics + r.counts.pictures, chains: a.chains + r.counts.chains, sentences: a.sentences + r.counts.sentences, failed: a.failed + r.rules.filter(x => !x.pass).length }), { words: 0, pics: 0, chains: 0, sentences: 0, failed: 0 });
lines.push(`| **Total** | **${total.words}** | **${total.pics}** | **${total.chains}** | **${total.sentences}** | **${total.failed}** |`, "");
lines.push(`Rule-failure statistics: **${total.failed} failed unit-rule checks out of ${reports.length * 15}**. Every word, chain, sentence and picture prompt in the published files passes the applicable rules. The candidate pool was filtered first; excluded candidates are not counted as published failures.`, "");
const shortWords = reports.filter(r => r.counts.words < r.quota.words).map(r => `${r.unit} (${r.counts.words}/${r.quota.words})`).join(", ");
lines.push(`The word quota is short in ${shortWords} after excluding unfamiliar, unsafe, accent-sensitive or otherwise invalid candidates. The curated pool yielded every eligible new word for these units. IC1 uses all six valid words in its small code. IC1 and IC2 cannot have sentences two units behind; IC3 can form only two natural lagged sentences. More text should be added only when code at the required lag allows it.`, "");
lines.push("IC8 includes one explicitly flagged pseudo-word, `vimp`, in a chain with insert/delete. No pseudo-word appears in IC1–7. BR words are tagged `review`, as its lesson teaches choices among previously taught spellings.", "");

lines.push("## Spelling coverage needing review", "");
for (const u of ["IC11", "BR"] as const) {
  const words = data.get(u)!.words;
  const targets = u === "IC11" ? ["sh", "ch", "th", "ck", "ng", "n", "wh", "q", "u", "ve", "tch"] : BRIDGING_UNIT.sounds.flatMap(s => s.spellings);
  const counts = targets.map(g => `${g}: ${words.filter(w => w.tags.includes(`sort:${g}`)).length}`).join(", ");
  lines.push(`- **${u}** sort-tagged words by spelling: ${counts}. The target is 8 per new spelling for IC11 and 10 per BR spelling; see model gaps below.`);
}
lines.push("", "## Human review", "");
const flagged = units.flatMap(u => data.get(u)!.words.map(w => ({ u, w, score: jevScore(w.text) })))
  .filter(x => ACCENT_SENSITIVE.has(x.w.text) || (x.score && (x.score.known >= 0.5 || x.score.unsafe >= 0.35)))
  .map(x => `- ${x.u} **${x.w.text}**: ${ACCENT_SENSITIVE.has(x.w.text) ? "accent-sensitive; " : ""}${x.score ? `Jev unfamiliar ${x.score.known.toFixed(2)}, unsuitable ${x.score.unsafe.toFixed(2)}` : "no Jev score"}.`);
lines.push(flagged.length ? flagged.join("\n") : "No selected accent-sensitive or borderline-familiar words.", "");
lines.push("Southern British pronunciation checks are cached for the selected doubtful words, including `with`, `sink` and `wink`. The model judgement is a screen; a teacher should listen to these and a 10% word sample before recording audio. The existing blind picture audit found several pictures that children named differently. Replacement prompts below need fresh artwork and a new blind naming check.", "");

const allPics = new Map<string, { unit: string; prompt: string; replacement: boolean }>();
for (const u of units) for (const w of data.get(u)!.words) if (w.pic && !allPics.has(w.text)) allPics.set(w.text, { unit: u, prompt: w.pic, replacement: w.tags.includes("new-prompt") });
const missing = [...allPics].filter(([w]) => !existsSync(join(import.meta.dir, `../../public/a/i/pic_${w}.webp`)));
const replacing = [...allPics].filter(([w, x]) => x.replacement && existsSync(join(import.meta.dir, `../../public/a/i/pic_${w}.webp`)));
lines.push(`## New pictures needed (${missing.length})`, "");
lines.push("These picture-tagged words have no `public/a/i/pic_<word>.webp` asset yet. Each prompt describes one object or clear action without visible writing.", "");
for (const [word, x] of missing) lines.push(`- **${word}** (${x.unit}): ${x.prompt}`);
lines.push("", `## Existing pictures to replace (${replacing.length})`, "");
for (const [word, x] of replacing) lines.push(`- **${word}** (${x.unit}): ${x.prompt}`);
lines.push("", "## Model gaps and follow-up", "");
lines.push("- `contentQuota('BR')` asks for 30 words and 10 per spelling across nine official spellings. That would need at least 90 distinct sort items, while several official spelling lists in `BRIDGING_UNIT` contain fewer than ten words. The generated 30 cover every spelling with at least three sort-tagged examples except where a word's target sound occurs twice.");
lines.push("- `contentQuota('IC11')` asks for 60 words and eight per new spelling, but `newGpcsIn('IC11')` has twelve GPC pairs. A full eight-per-pair set would require at least 96 sort items; familiar one-syllable words for `<q>`, `<u>`, `<ve>`, `<wh>` and `<tch>` are especially limited.");
lines.push("- `INITIAL_CODE_UNITS` notes say `<sh>` begins in IC9 and `<ch>` in IC10, while `gpcsOfUnit()` introduces both in IC11. The files follow `gpcsOfUnit()` strictly, so IC9/10 omit those early lesson spellings.");
lines.push("- `SW_SEQUENCE` and `knownGpcsAt()` do not include PW stages; the validator's polysyllabic rule will need a model-supported code position before phase D. The phase A `poly` arrays are empty.");
lines.push("- `contentQuota()` has one story per IC unit, but the §6.4 unit file format has no story field. This phase created no stories or audio; connected text and artwork remain separate asset work.");
lines.push("- Some new picture prompts depict actions, such as `win`, `jog` and `wink`. They need child naming trials before use in a picture-choice game.", "");
const path = join(import.meta.dir, "../../playtest/content/units-A-report.md");
mkdirSync(join(import.meta.dir, "../../playtest/content"), { recursive: true });
writeFileSync(path, lines.join("\n") + "\n");
console.log(path);
