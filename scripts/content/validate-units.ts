import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { PHONEMES, WORDS } from "../../src/content/phonics";
import { PIC_NAMES } from "../../src/content/pic-names";
import {
  BRIDGING_UNIT, FRESHFORD_SPECIAL_WORDS, INITIAL_CODE_UNITS, SW_SEQUENCE, SYLLABLE_EXAMPLES,
  VALIDATOR_RULES, contentQuota, isDecodableAt, knownGpcsAt, newGpcsIn, renderSegs,
  structureOf, swapBetween, unitIndex, type SwSeg, type SwUnitId, type ValidatorRuleId,
} from "../../src/content/sw";
import { ACCENT_SENSITIVE, BRAND_DENY, CHILD_ALLOW, EARLY_WORD_DENY, NON_PICTUREABLE, PROPER_NAME_DENY, SLANG_DENY, TAUGHT_NAMES, UNSUITABLE_DENY, US_DENY } from "./lists";
import { ALL_GPCS, EXISTING, POLICY, align, firstDecodable, parseSegs } from "./core";
import { ensureJev, geminiScore, jevScore, seedExistingJev } from "./judgements";
import type { UnitData, UnitWord } from "./types";

export interface RuleResult { rule: ValidatorRuleId; pass: boolean; reasons: string[] }
export interface UnitReport { unit: SwUnitId; rules: RuleResult[]; counts: { words: number; pictures: number; chains: number; sentences: number; poly: number }; quota: ReturnType<typeof contentQuota> }
const ids = Object.keys(VALIDATOR_RULES) as ValidatorRuleId[];
const specialIntro = new Map<string, number>();
INITIAL_CODE_UNITS.forEach((u, i) => u.specialWords.forEach(w => { if (!specialIntro.has(w)) specialIntro.set(w, i); }));
FRESHFORD_SPECIAL_WORDS.year1and2.forEach(w => { if (!specialIntro.has(w)) specialIntro.set(w.toLowerCase(), unitIndex("EC1")); });
const allSpecial = new Set<string>([...FRESHFORD_SPECIAL_WORDS.reception, ...FRESHFORD_SPECIAL_WORDS.year1and2].map(s => s.toLowerCase()));
const IPA = (s: SwSeg[]) => s.map(x => PHONEMES[x.p]?.ipa ?? x.p).join(" ");
const picBad = (pic: string) => /\b(?:with|showing|containing|bearing)\s+(?:any\s+)?(?:text|words?|letters?|numbers?|a logo|a label|writing)\b/i.test(pic) || /["“”]/.test(pic);
const pronounceDoubt = (w: string, segs: SwSeg[]) => ACCENT_SENSITIVE.has(w) || /nk/.test(w) || (w === "with" && segs.some(s => s.p === "dh"));

export async function loadUnit(unit: SwUnitId): Promise<UnitData> {
  const f = join(import.meta.dir, `../../src/content/units/${unit}.ts`);
  if (!existsSync(f)) throw new Error(`Missing ${f}`);
  const mod = await import(pathToFileURL(f).href);
  return { words: mod.words ?? [], sentences: mod.sentences ?? [], chains: mod.chains ?? [], nonsense: mod.nonsense ?? [], poly: mod.poly ?? [] };
}

export async function validateUnit(unit: SwUnitId, data: UnitData, allData: Map<SwUnitId, UnitData>): Promise<UnitReport> {
  seedExistingJev();
  const findings = new Map<ValidatorRuleId, string[]>(ids.map(id => [id, []]));
  const fail = (r: ValidatorRuleId, reason: string) => findings.get(r)!.push(reason);
  const known = knownGpcsAt(unit, POLICY);
  const newCode = new Set(newGpcsIn(unit, POLICY));
  const ic = INITIAL_CODE_UNITS.find(u => u.id === unit);
  const wordByText = new Map<string, UnitWord>();
  const wordSegs = new Map<string, SwSeg[]>();
  for (const w of data.words) {
    if (wordByText.has(w.text)) fail("segmentation", `${w.text}: duplicate word`);
    wordByText.set(w.text, w);
    let segs: SwSeg[];
    try { segs = parseSegs(w.segs); } catch (e) { fail("segmentation", `${w.text}: ${e}`); continue; }
    wordSegs.set(w.text, segs);
    if (renderSegs(segs) !== w.text.toLowerCase()) fail("segmentation", `${w.text}: ${w.segs} renders ${renderSegs(segs)}`);
    if (segs.some(s => s.g.includes("-") && !s.gap)) fail("segmentation", `${w.text}: split spelling needs gap`);
    const untaught: string[] = [];
    for (const s of segs) {
      if (!ALL_GPCS.has(`${s.g}>${s.p}`)) fail("gpc-known", `${w.text}: unknown ${s.g}>${s.p}`);
      if (!known.has(`${s.g}>${s.p}`)) {
        untaught.push(`${s.g}>${s.p}`);
        if (!w.tags.includes("special")) fail("decodable", `${w.text}: untaught ${s.g}>${s.p}`);
      }
    }
    if (!isDecodableAt(segs, unit, POLICY) && !w.tags.includes("special")) fail("decodable", `${w.text}: not decodable at ${unit}`);
    const form = structureOf(segs.map(s => s.p));
    if (ic && !ic.structures.includes(form as never)) fail("structure", `${w.text}: ${form} outside ${unit} structures`);
    if (unit === "BR" && !INITIAL_CODE_UNITS[10].structures.includes(form as never)) fail("structure", `${w.text}: ${form} outside IC11 review structures`);
    if (unit.startsWith("EC") && (form.match(/V/g)?.length ?? 0) !== 1) fail("structure", `${w.text}: Extended Code word list requires one vowel/syllable`);
    if (!ic && unit !== "BR" && form.match(/C+/g)?.some(run => run.length > 3)) fail("structure", `${w.text}: >3 adjacent consonants`);
    if (!CHILD_ALLOW.has(w.text) || US_DENY.has(w.text)) fail("british-spelling", `${w.text}: not in curated British children's lexicon or US form`);
    const original = EXISTING.get(w.text);
    if (original && original.segs.map(s => `${s.g}>${s.p}`).join("|") !== segs.map(s => `${s.g}>${s.p}`).join("|")) {
      // An explicit model-backed correction can supersede a stale phonics.ts segmentation.
      if (!geminiScore(w.text, segs)?.ok) fail("british-pronunciation", `${w.text}: differs from existing segmentation (${IPA(original.segs)} vs ${IPA(segs)})`);
    }
    if (ACCENT_SENSITIVE.has(w.text) && !w.tags.includes("accent-reviewed")) fail("british-pronunciation", `${w.text}: accent-sensitive; add reviewed tag or exclude`);
    if (pronounceDoubt(w.text, segs)) {
      const result = geminiScore(w.text, segs);
      if (!result?.ok) fail("british-pronunciation", `${w.text}: ${result?.reason ?? "missing Gemini pronunciation check"}`);
    }
    const score = jevScore(w.text);
    if (!score) { fail("age-appropriate", `${w.text}: missing cached Jev judgement`); fail("no-slang", `${w.text}: missing cached Jev judgement`); fail("british-spelling", `${w.text}: missing cached Jev judgement`); }
    else {
      if (score.american >= 0.3) fail("british-spelling", `${w.text}: Jev American=${score.american.toFixed(2)}`);
      if (score.known >= 0.6) fail("age-appropriate", `${w.text}: Jev unfamiliar=${score.known.toFixed(2)}`);
      if (score.unsafe >= 0.45) fail("no-slang", `${w.text}: Jev unsuitable=${score.unsafe.toFixed(2)}`);
    }
    if (SLANG_DENY.has(w.text) || UNSUITABLE_DENY.has(w.text) || BRAND_DENY.has(w.text) || PROPER_NAME_DENY.has(w.text) || EARLY_WORD_DENY.has(w.text)) fail("no-slang", `${w.text}: curated deny list`);
    if (/^[A-Z]/.test(w.text) && !(TAUGHT_NAMES.has(w.text) && w.tags.includes("capital"))) fail("no-slang", `${w.text}: unapproved proper noun`);
    if (w.tags.includes("special")) {
      if (!allSpecial.has(w.text.toLowerCase())) fail("special-words", `${w.text}: not on school list`);
      const marked = w.tags.filter(t => t.startsWith("untaught:")).map(t => t.slice(9));
      if (marked.sort().join("|") !== untaught.sort().join("|") || !marked.length) fail("special-words", `${w.text}: untaught markers must name exactly ${untaught.join(", ") || "the untaught GPCs"}`);
    }
    for (const tag of w.tags.filter(t => t.startsWith("sort:"))) {
      const spelling = tag.slice(5);
      const target = unit === "BR" ? BRIDGING_UNIT.sounds.find(s => s.spellings.includes(spelling))?.p : segs.find(s => s.g === spelling)?.p;
      if (!target || segs.filter(s => s.p === target).length !== 1 || segs.filter(s => s.g === spelling && s.p === target).length !== 1) fail("sort-single-occurrence", `${w.text}: ${tag} requires one /${target ?? "?"}/ and one <${spelling}>`);
    }
    if (w.tags.includes("picture")) {
      if (NON_PICTUREABLE.has(w.text)) fail("picture", `${w.text}: not reliably identifiable in a still picture`);
      if (!w.pic || picBad(w.pic) || w.pic.length < 3) fail("picture", `${w.text}: missing or ambiguous/no-text prompt`);
      if (PIC_NAMES[w.text] && !w.tags.includes("new-prompt")) fail("picture", `${w.text}: existing image named ${PIC_NAMES[w.text][0]}; supply replacement prompt`);
    }
    if (w.pic && !w.tags.includes("picture")) fail("picture", `${w.text}: prompt present without picture tag`);
    const first = firstDecodable(segs);
    if (first !== w.unit && !w.tags.includes("review")) fail("unit-tag", `${w.text}: first decodable ${first ?? "never"}, tagged ${w.unit}`);
    if (w.unit !== unit) fail("unit-tag", `${w.text}: belongs to ${w.unit}, file ${unit}`);
    if (unit === "BR" && !w.tags.includes("review")) fail("unit-tag", `${w.text}: BR revisits known GPCs; mark review`);
    if (unit.startsWith("IC") && +unit.slice(2) <= 7 && !segs.some(s => newCode.has(`${s.g}>${s.p}`)) && !w.tags.includes("review")) fail("unit-tag", `${w.text}: no new ${unit} GPC`);
  }

  const allWords = [...WORDS.map(w => ({ text: w.text, segs: w.segs })), ...[...allData.values()].flatMap(d => d.words.map(w => { try { return { text: w.text, segs: parseSegs(w.segs) }; } catch { return null; } }).filter((x): x is { text: string; segs: SwSeg[] } => !!x))];
  const sounds = new Map<string, Set<string>>();
  for (const x of allWords) { const k = x.segs.map(s => s.p).join("-"); (sounds.get(k) ?? sounds.set(k, new Set()).get(k)!).add(x.text); }
  for (const w of data.words) {
    const segs = wordSegs.get(w.text);
    if (!segs) continue;
    const matches = sounds.get(segs.map(s => s.p).join("-")) ?? new Set<string>();
    if (matches.size > 1 && w.tags.includes("dictation-safe") && !w.tags.includes("picture") && !data.sentences.some(s => new RegExp(`\\b${w.text}\\b`, "i").test(s.text))) fail("homophone", `${w.text}: shares sounds with ${[...matches].filter(x => x !== w.text).join(", ")} but has no picture or sentence`);
  }

  const pseudo = new Set(data.nonsense ?? []);
  const chainWord = (text: string) => wordSegs.get(text) ?? align(text, unit);
  for (const [ci, chain] of data.chains.entries()) {
    if (chain.length < 2) fail("swap-one-change", `chain ${ci + 1}: needs at least two words`);
    let hasInsertDelete = false;
    for (let i = 0; i < chain.length; i++) {
      const w = chain[i];
      const s = chainWord(w);
      if (!s || !isDecodableAt(s, unit, POLICY)) { fail("swap-one-change", `chain ${ci + 1}: ${w} not decodable`); continue; }
      if (pseudo.has(w)) {
        if (unitIndex(unit) < unitIndex("IC8")) fail("swap-one-change", `chain ${ci + 1}: nonsense before IC8`);
        if (!/^[a-z]+$/.test(w) || (structureOf(s.map(x => x.p)).match(/V/g)?.length ?? 0) !== 1) fail("swap-one-change", `chain ${ci + 1}: ${w} not a pronounceable one-syllable pseudo-word`);
      } else {
        const scores = jevScore(w);
        if (!CHILD_ALLOW.has(w) || US_DENY.has(w) || SLANG_DENY.has(w) || UNSUITABLE_DENY.has(w) || BRAND_DENY.has(w) || PROPER_NAME_DENY.has(w) || EARLY_WORD_DENY.has(w) || ACCENT_SENSITIVE.has(w) || !scores || scores.known >= 0.6 || scores.unsafe >= 0.45 || scores.american >= 0.3) fail("swap-one-change", `chain ${ci + 1}: ${w} is not a validated age-appropriate British word`);
      }
      if (i) {
        const prev = chainWord(chain[i - 1]);
        const op = prev && swapBetween(prev, s);
        if (!op) fail("swap-one-change", `chain ${ci + 1}: ${chain[i - 1]} → ${w} is not one change`);
        else {
          if (op.op !== "substitute") hasInsertDelete = true;
          if (unitIndex(unit) < unitIndex("IC8") && op.op !== "substitute") fail("swap-one-change", `chain ${ci + 1}: ${op.op} before IC8`);
        }
      }
    }
    if (["IC8", "IC9", "IC10"].includes(unit) && !hasInsertDelete) fail("swap-one-change", `chain ${ci + 1}: expected an insert or delete`);
  }
  for (const w of pseudo) if (!data.chains.some(c => c.includes(w))) fail("swap-one-change", `${w}: flagged nonsense but not used in a chain`);

  const lag = unitIndex(unit) - 2;
  for (const [i, sentence] of data.sentences.entries()) {
    if (unitIndex(sentence.maxUnit) > lag) fail("decodable", `sentence ${i + 1}: maxUnit ${sentence.maxUnit} is less than two units behind ${unit}`);
    const marked = new Set((sentence.special ?? []).map(s => s.toLowerCase()));
    for (const raw of sentence.text.match(/[A-Za-z]+/g) ?? []) {
      const token = raw.toLowerCase();
      if (TAUGHT_NAMES.has(raw)) continue;
      const segs = align(token, sentence.maxUnit);
      if (segs && isDecodableAt(segs, sentence.maxUnit, POLICY)) { if (marked.has(token)) fail("special-words", `sentence ${i + 1}: ${token} is decodable but flagged special`); continue; }
      const intro = specialIntro.get(token);
      if (intro == null || intro > unitIndex(sentence.maxUnit) || !marked.has(token)) fail("special-words", `sentence ${i + 1}: ${raw} is untaught at ${sentence.maxUnit} and not correctly flagged special`);
    }
    for (const s of marked) if (!new RegExp(`\\b${s}\\b`, "i").test(sentence.text)) fail("special-words", `sentence ${i + 1}: marked ${s} absent`);
  }

  for (const p of data.poly) {
    if (p.syllables.replaceAll("|", "") !== p.text.toLowerCase()) fail("polysyllabic-syllables", `${p.text}: syllables do not render text`);
    const parts = p.syllables.split("|");
    if (parts.length < 2) fail("polysyllabic-syllables", `${p.text}: needs at least two syllables`);
    for (const part of parts) {
      const segs = align(part, unit);
      if (!segs || !isDecodableAt(segs, unit, { ...POLICY, checkStructure: false })) fail("polysyllabic-syllables", `${p.text}: ${part} not decodable`);
    }
    const example = SYLLABLE_EXAMPLES.find(x => x.word.toLowerCase() === p.text.toLowerCase());
    if (example && example.split.toLowerCase() !== p.syllables.toLowerCase()) fail("polysyllabic-syllables", `${p.text}: use ${example.split}`);
    if (p.schwa?.some(n => n < 0 || n >= parts.length)) fail("polysyllabic-syllables", `${p.text}: schwa index out of range`);
    if (parts.some(x => /^(?:a|e|i|o|u)$/.test(x)) && !p.schwa?.length) fail("polysyllabic-syllables", `${p.text}: possible schwa syllable not flagged`);
  }

  return { unit, rules: ids.map(rule => ({ rule, pass: !findings.get(rule)!.length, reasons: findings.get(rule)! })), counts: { words: data.words.length, pictures: data.words.filter(w => w.tags.includes("picture")).length, chains: data.chains.length, sentences: data.sentences.length, poly: data.poly.length }, quota: contentQuota(unit) };
}

export async function validateUnits(units: SwUnitId[]): Promise<UnitReport[]> {
  const all = new Map<SwUnitId, UnitData>();
  for (const u of units) all.set(u, await loadUnit(u));
  const words = [...all.entries()].flatMap(([unit, d]) => d.words.map(w => ({ text: w.text, unit, pic: w.pic })));
  await ensureJev(words);
  return Promise.all(units.map(u => validateUnit(u, all.get(u)!, all)));
}

if (import.meta.main) {
  const units = (process.argv.slice(2).length ? process.argv.slice(2) : SW_SEQUENCE.filter(u => u.startsWith("IC") || u === "BR")) as SwUnitId[];
  for (const u of units) if (!SW_SEQUENCE.includes(u)) throw new Error(`Unknown unit ${u}`);
  const reports = await validateUnits(units);
  for (const r of reports) {
    console.log(`${r.unit}: ${r.counts.words}/${r.quota.words} words, ${r.counts.pictures}/${r.quota.pictures} pictures, ${r.counts.chains}/${r.quota.swapChains} chains, ${r.counts.sentences}/${r.quota.sentences} sentences`);
    for (const rule of r.rules) console.log(`  ${rule.pass ? "PASS" : "FAIL"} ${rule.rule}${rule.reasons.length ? `: ${rule.reasons.join("; ")}` : ""}`);
  }
  if (reports.some(r => r.rules.some(x => !x.pass))) process.exitCode = 1;
}
