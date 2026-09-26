import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EXTENDED_CODE_UNITS, POLYSYLLABIC, SW_SEQUENCE, gpcsOfUnit, type SwUnitId } from "../../src/content/sw";
import { jevScore } from "./judgements";
import { loadUnit, validateUnits } from "./validate-units";
import { POLICY } from "./core";

const ROOT = join(import.meta.dir, "../..");
const readJson = <T>(file: string, fallback: T): T => existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback;
const phaseC = Array.from({ length: 23 }, (_, i) => `EC${i + 27}` as SwUnitId);
const pw = POLYSYLLABIC.map(p => p.id);
const units = [...SW_SEQUENCE, ...pw];
const reports = await validateUnits(units);
const byId = new Map(reports.map(r => [r.unit, r]));
const all = new Map<SwUnitId, Awaited<ReturnType<typeof loadUnit>>>();
for (const u of units) all.set(u, await loadUnit(u));
const fails = reports.flatMap(r => r.rules.filter(rule => !rule.pass).map(rule => `${r.unit} ${rule.rule}: ${rule.reasons.join("; ")}`));
const audit = readJson<{ word: string; take: number; ok: boolean; name?: string }[]>(join(ROOT, "playtest/content/unit-picture-audit.json"), []);
const dropped = readJson<{ word: string; reason: string; attempts: number }[]>(join(ROOT, "playtest/content/picture-dropped.json"), []);
const attemptWords = new Set(audit.map(x => x.word));
const accepted = new Set(audit.filter(x => x.ok).map(x => x.word));
const uniqueWords = new Set<string>();
const uniquePics = new Set<string>();
for (const d of all.values()) {
  for (const w of d.words) { uniqueWords.add(w.text); if (w.tags.includes("picture")) uniquePics.add(w.text); }
  for (const p of d.poly) uniqueWords.add(p.text);
}
const missingAudio = [...uniqueWords].filter(w => !existsSync(join(ROOT, `public/a/w/${w}.mp3`)));
const missingPictures = [...uniquePics].filter(w => !existsSync(join(ROOT, `public/a/i/pic_${w}.webp`)));
const fmt = (n: number, q: number) => `${n}/${q}`;
const table = (ids: SwUnitId[]) => ids.map(u => {
  const r = byId.get(u)!;
  const c = r.counts, q = r.quota;
  return `| ${u} | ${fmt(c.words, q.words)} | ${fmt(c.pictures, q.pictures)} | ${fmt(c.chains, q.swapChains)} | ${fmt(c.sentences, q.sentences)} | ${fmt(c.poly, q.polysyllabic)} |`;
}).join("\n");
const earlierPictureGaps = SW_SEQUENCE.filter(u => !phaseC.includes(u) && byId.get(u)!.counts.pictures < byId.get(u)!.quota.pictures)
  .map(u => `${u} ${byId.get(u)!.counts.pictures}/${byId.get(u)!.quota.pictures}`).join(", ");
const shortfalls = phaseC.flatMap(u => {
  const r = byId.get(u)!;
  const ec = EXTENDED_CODE_UNITS.find(x => x.id === u)!;
  const tags = new Map<string, number>();
  for (const w of all.get(u)!.words) for (const tag of w.tags.filter(t => t.startsWith("sort:"))) tags.set(tag.slice(5), (tags.get(tag.slice(5)) ?? 0) + 1);
  const target = r.quota.perSpelling ?? r.quota.perSound ?? 0;
  const baskets = gpcsOfUnit(u, POLICY).filter(k => ec.kind === "spelling" || k.endsWith(`>${ec.sound}`)).map(k => k.split(">")[0]);
  const gaps = [...new Set(baskets)].filter(g => (tags.get(g) ?? 0) < target).map(g => `${g} ${(tags.get(g) ?? 0)}/${target}`);
  return gaps.length ? [`- ${u}: ${gaps.join(", ")}`] : [];
}).join("\n");
const review = phaseC.flatMap(u => all.get(u)!.words.filter(w => {
  const s = jevScore(w.text);
  return s && (s.known >= 0.5 || s.unsafe >= 0.3);
}).map(w => {
  const s = jevScore(w.text)!;
  return `- ${u} **${w.text}**: unfamiliar ${s.known.toFixed(2)}, unsuitable ${s.unsafe.toFixed(2)}.`;
})).join("\n");
const failures = fails.length ? fails.map(x => `- ${x}`).join("\n") : "None; all 70 unit files pass every applicable rule.";
const oldReplacementFailures = "nap hen dot fog fin tub pup cub jet hill twig stamp ship quilt".split(" ");
const oldReplacementAccepted = oldReplacementFailures.filter(w => accepted.has(w));
const lines = [
  "# Sounds~Write phase C: Year 2 content, PW stages and assets",
  "",
  "Generated against the current `sw.ts` with the September 2024 consonant-plus-e policy. The [official Lexicon](../../assets-src/sw-sources/downloads/sw-lexicon-of-english-spellings.pdf), especially Part 2 and its schwa appendix, governs sound/spelling choices; the public Year 2 word lists and 2026 checks supply examples. The First Steps reader texts were reviewed for child-facing vocabulary and sentence style. Portal word lists remain unavailable.",
  "",
  "## Validation and quotas",
  "",
  `Validation: ${reports.length} files × 15 rules = ${reports.length * 15} checks; ${fails.length} failed rule groups.`,
  ...(fails.length ? ["", failures] : []),
  "",
  "### EC27–EC49",
  "",
  "| Unit | Words | Pictures | Chains | Sentences | Poly |",
  "|---|---:|---:|---:|---:|---:|",
  table(phaseC),
  "",
  "### PW1–PW9",
  "",
  "| Stage | Poly words / word quota | Pictures | Chains | Sentences | Poly quota |",
  "|---|---:|---:|---:|---:|---:|",
  table(pw),
  "",
  "PW stages are local staging described in `sw.ts`; Sounds~Write does not number them. Their polysyllabic entries count toward the generic `words` quota. The unit schema has no picture or sentence fields for `poly`, so PW picture and sentence targets remain unfilled; no one-syllable filler words were inserted. PW1 uses 15 published beginner examples after excluding the proper name Batman; the 30-word target is a shortfall. PW2–PW9 contain 30 each. EC poly is 10/10 in every unit from EC4 onward. EC31's poly set carries final `<y>` = /ee/ words such as `ha|ppy`; EC34–35 include the current-unit exceptions `li|tre`, `so|lar`, `fa|vour`, `sa|vvy` and `ski|vvy`. Schwa flags use the Lexicon's examples where given and Southern British pronunciation for the other review words; teachers should adapt them to pupils' accents.",
  "",
  `Earlier units with picture counts below the current quota after this audit: ${earlierPictureGaps || "none"}. Their word, chain, sentence and poly counts remain as detailed in the [phase A](units-A-report.md) and [phase B](units-B-report.md) reports, except for homophone tags and the EC8 sentence noted below.`,
  "",
  "Year 2 one-syllable word and picture quotas are sometimes sparse. The main constraints are genuinely rare spellings, words that are polysyllabic, unavailable grapheme pairs in `sw.ts`, and the children's age/usage screen. EC41 has only **laugh, tough, rough**: the Lexicon confirms final `<gh>` = /f/, while its `<gh>` = /g/ examples are unsuitable, unfamiliar or polysyllabic for this word list. `cough` and `trough` need `<ou>` = /o/, absent from the current model; they were not forced into a wrong segmentation. EC49 follows the scope-and-sequence `/eer/` unit while the Lexicon analyses it as /ee/ plus schwa; all its words need accent-aware teacher review.",
  "",
  "Spelling baskets below their per-spelling or per-sound target:",
  "",
  shortfalls || "- None.",
  "",
  "## Reconciliation repairs",
  "",
  "- `huge` is in EC37 as `h.u=ue.ge=j`; EC21 does not teach `<ge>` = /j/. It is absent from EC21. The Lexicon places `<ge>` = /j/ at the end of *huge*.",
  "- EC8's lagged sentence now says ‘A little bird sat on a log.’ The former *fence* required later `<ce>` = /s/. EC4 contained no *fence* sentence in this checkout.",
  "- New Year 2 homophones exposed earlier unpictured dictation words. Those words now carry `reading-only` instead of `dictation-safe`; no content rule was weakened.",
  "- Lowercased personal names in the historical lists (including Kate, Bruce and Jill) were excluded. *Year* was omitted from EC49 because the Lexicon documents accent-dependent analyses, and *laughter* was removed from poly review after its generated speech repeatedly failed independent listening checks.",
  "",
  "## Pictures and audio",
  "",
  `- Phase C picture attempts: ${attemptWords.size} unique words; ${accepted.size} blind-name passes (${attemptWords.size ? (100 * accepted.size / attemptWords.size).toFixed(1) : "0.0"}%). Of the 14 failed phase-A replacements, ${oldReplacementAccepted.length} passed on this run${oldReplacementAccepted.length ? ` (${oldReplacementAccepted.join(", ")})` : ""}. Accepted replacements moved the previous file into \`.trash/\` before installation.`,
  `- Picture tags dropped after failed or ambiguous audits: ${dropped.length}${dropped.length ? ` (${dropped.map(x => x.word).join(", ")})` : ""}. These words remain for reading; an ambiguous image is not presented as a naming card.`,
  `- Unique picture-tagged words with cards: ${uniquePics.size - missingPictures.length}/${uniquePics.size}. Missing tagged cards: ${missingPictures.length}${missingPictures.length ? ` (${missingPictures.join(", ")})` : ""}.`,
  `- Unique unit and poly words with audio: ${uniqueWords.size - missingAudio.length}/${uniqueWords.size}. Missing clips: ${missingAudio.length}${missingAudio.length ? ` (${missingAudio.join(", ")})` : ""}. Newly installed clips passed the pipeline's pronunciation, blind transcription and pitch checks; failed takes were not installed.`,
  "",
  "The picture acceptance screen asks for the word a four-year-old would name. Its exact-word criterion rejects reasonable synonyms such as *bath* for *tub*; those cards were removed from picture use after five takes rather than counted as passes. The detailed takes are in `playtest/content/unit-picture-audit.json`.",
  "",
  "## Words for human review",
  "",
  review || "- No Year 2 word exceeded the near-threshold screen.",
  "- EC49: **cheer, fear, near, ear** and related `/eer/` items vary by accent and the Lexicon's two-sound analysis.",
  "- EC34–35 and PW stages: check schwa indices in **litre, favour, solar, savvy, skivvy, about, lemon, salad** against the class's speech. The Lexicon notes schwa is accent dependent.",
  "",
  "Story quotas are design targets, but `UnitData` has no story field; no stories were fabricated in these files.",
  "",
];
writeFileSync(join(ROOT, "playtest/content/units-C-report.md"), lines.join("\n"));
console.log(`Report: ${fails.length} failed groups; ${missingAudio.length} missing audio; ${missingPictures.length} missing picture cards; ${dropped.length} picture tags dropped`);
