import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PIC_NAMES } from "../../src/content/pic-names";
import { WORDS } from "../../src/content/phonics";
import {
  BRIDGING_UNIT, EXTENDED_CODE_UNITS, FRESHFORD_SPECIAL_WORDS, INITIAL_CODE_UNITS, SW_SEQUENCE, contentQuota,
  gpcsOfUnit, isDecodableAt, newGpcsIn, renderSegs, structureOf, swapBetween, unitIndex,
  type SwSeg, type SwUnitId,
} from "../../src/content/sw";
import { ACCENT_SENSITIVE, BRAND_DENY, CHILD_ALLOW, EARLY_WORD_DENY, EC_PICTURE_PROMPTS, EXTRA_WORDS, NEW_PICTURE_PROMPTS, NON_PICTUREABLE, OFFICIAL_EC_WORDS, PROPER_NAME_DENY, REPLACEMENT_PROMPTS, SLANG_DENY, UNSUITABLE_DENY, US_DENY } from "./lists";
import { EXISTING, POLICY, align, firstDecodable, formatSegs } from "./core";
import { ensureGemini, ensureJev, geminiScore, jevScore } from "./judgements";
import type { UnitData, UnitSentence, UnitWord } from "./types";

const OUT = join(import.meta.dir, "../../src/content/units");
const phaseA = SW_SEQUENCE.filter(u => u.startsWith("IC") || u === "BR");

/** Sentences are selected only when every ordinary word is decodable at the required lag. */
const SENTENCE_BANK = [
  "Sam sat.", "Tim sat.", "Sam sat on a mat.", "A man sat on a mat.", "Pip sat on a mat.",
  "A man sat.", "A map is on a mat.", "A pin is in a tin.", "A pan is on a mat.",
  "The cat sat on a mat.", "A big pig sat.", "The cat is in a cot.", "I pat the cat.",
  "A dog sat on a mat.", "The dog is in a den.", "A hen sat on a bed.", "I fed the hen.",
  "A cat had a nap.", "The dog had a nap.", "Dad sat on the bed.", "The vet met a dog.",
  "A red rug is on the bed.", "Mum had a hug.", "A bug sat on a log.", "The pup sat on a rug.",
  "A rat ran to the hut.", "A lid is on the pot.", "A kid had a bun.", "The dog ran in the sun.",
  "The jug is on the mat.", "A wig is on a peg.", "The dog can wag.", "Mum met the vet.",
  "A fox sat on a hill.", "A bell fell in the well.", "The doll sat on a rug.", "A fox ran off.",
  "The ant is on a log.", "A lamp is on the desk.", "The pup had a rest.", "A duck is in the pond.",
  "The frog sat on a rock.", "A frog can hop.", "The crab sat on a rock.", "A drum is in the shed.",
  "The chick is in the nest.", "A fish can swim.", "The ship is in the mist.", "The king had a red cap.",
  "The frog slept on a rug.", "A plump hen sat on a log.", "Mum swept the dust.",
  "The wind bent the flag.", "Dad had a crisp.", "The stump is in the sun.",
  "The pup hid in the tent.", "The frog swam in the pond.", "The fox ran up the hill.",
  "A crab hid in the sand.", "A plum is in the pot.", "The drum is on the rug.",
  "The rain fell on the train.", "A snail sat on the gate.", "The cake is on the plate.",
  "The bee sat in the tree.", "The queen had a green hat.", "I can see the sheep.",
  "The goat is in the snow.", "A boat can float.", "The crow sat on a pole.",
  "The girl had a red skirt.", "A bird sat on a fern.", "The worm is in the dirt.",
  "The cow is by the house.", "A mouse ran out of the house.", "The clown had a brown hat.",
  "The blue moon is bright.", "The spoon is in the soup.", "The broom is by the door.",
  "The child had a big kite.", "The pie is on the table.", "I can see a bright light.",
  "The cook put a pot on the hob.", "The bull stood by the bush.", "The wood is in the shed.",
  "A little bird sat on the fence.", "The horse stood by the gate.", "The pencil fell off the table.",
  "The fork is on the table.", "The tall horse ate an apple.", "A hawk sat on the fence.",
  "The bear sat on the chair.", "A pear is on the stair.", "The girl has long hair.",
  "The cube is in the tube.", "The stew is in a bowl.", "The boy had a new toy.",
  "The coin fell in the soil.", "The boy found a toy car.", "The car is by the farm.",
  "The star is over the barn.", "The jar is on the cart.", "The tart is on a plate.",
];

// Published Initial Code polysyllabic sets in the Year 1 planning examples.
// Each row becomes available after its prerequisite code and structure.
const POLY_BANK: { split: string; from: number; schwa?: number[] }[] = [
  ...["sun|set", "zig|zag", "sun|lit", "wig|wam", "cob|web", "nut|meg", "bed|bug", "hot|dog", "kid|nap", "pig|pen", "dog|leg", "ad|mit", "up|set", "co|mic", "ca|bin"].map(split => ({ split, from: 4 })),
  ...["in|vent", "ob|ject", "up|lift", "den|tist", "sus|pect", "him|self", "con|test", "back|hand", "egg|shell", "ac|ting", "bed|rock", "jack|pot", "pad|lock", "back|pack", "cat|fish", "dis|cuss"].map(split => ({ split, from: 6 })),
  ...["dan|druff", "back|drop", "chop|stick", "dish|cloth", "lip|stick", "lip|gloss", "wing|span", "back|rest", "sand|pit", "com|plex", "tri|plet", "flag|ship", "pin|prick", "splen|did", "grand|stand", "be|ne|fit", "ha|bi|tat", "fan|tas|tic", "com|pli|ment"].map(split => ({ split, from: 8 })),
  { split: "le|mon", from: 10, schwa: [1] }, { split: "le|sson", from: 10, schwa: [1] },
  { split: "se|ven", from: 10, schwa: [1] }, { split: "sa|lad", from: 10, schwa: [1] },
  ...["rain|drop", "play|pen", "fish|bowl", "snow|flake", "sun|burn", "black|bird", "hair|cut", "stair|case"].map(split => ({ split, from: 12 })),
];

function buildPoly(unit: SwUnitId): UnitData["poly"] {
  if (!unit.startsWith("EC") || +unit.slice(2) < 4) return [];
  const n = +unit.slice(2);
  const available = POLY_BANK.filter(x => x.from <= n && x.split.split("|").every(part => {
    const segs = align(part, unit);
    return segs && isDecodableAt(segs, unit, { ...POLICY, checkStructure: false });
  }));
  const start = ((n - 4) * 10) % Math.max(available.length, 1);
  const recurringSchwas = n >= 10 ? available.filter(x => x.schwa).slice((n - 10) % 2, (n - 10) % 2 + 2) : [];
  const rotation = [...available.slice(start), ...available.slice(0, start)].filter(x => !recurringSchwas.includes(x));
  return [...recurringSchwas, ...rotation].slice(0, contentQuota(unit).polysyllabic)
    .map(x => ({ text: x.split.replaceAll("|", ""), syllables: x.split, ...(x.schwa ? { schwa: x.schwa } : {}) }));
}

const intro = new Map<string, number>();
INITIAL_CODE_UNITS.forEach((u, i) => u.specialWords.forEach(s => { if (!intro.has(s)) intro.set(s, i); }));
FRESHFORD_SPECIAL_WORDS.year1and2.forEach(s => { if (!intro.has(s.toLowerCase())) intro.set(s.toLowerCase(), unitIndex("EC1")); });
const specialSet = new Set([...FRESHFORD_SPECIAL_WORDS.reception, ...FRESHFORD_SPECIAL_WORDS.year1and2].map(s => s.toLowerCase()));
function sentenceFor(text: string, maxUnit: SwUnitId): UnitSentence | null {
  const special: string[] = [];
  for (const raw of text.match(/[A-Za-z]+/g) ?? []) {
    if (["Sam", "Tim", "Pip"].includes(raw)) continue;
    const word = raw.toLowerCase();
    const segs = align(word, maxUnit);
    if (segs && isDecodableAt(segs, maxUnit, POLICY)) continue;
    if (!specialSet.has(word) || (intro.get(word) ?? Infinity) > unitIndex(maxUnit)) return null;
    special.push(word);
  }
  return { text, maxUnit, ...(special.length ? { special: [...new Set(special)] } : {}) };
}

function candidateTexts(unit: SwUnitId): string[] {
  if (unit === "BR") return [...new Set([...BRIDGING_UNIT.sounds.flatMap(s => Object.values(s.words).flat()), ...WORDS.map(w => w.text), ...Object.values(EXTRA_WORDS).flat()])];
  return [...new Set([...WORDS.map(w => w.text), ...(EXTRA_WORDS[unit] ?? []), ...(OFFICIAL_EC_WORDS[unit] ?? []), ...(EXTENDED_CODE_UNITS.find(u => u.id === unit)?.examples ?? [])])];
}

function novelty(unit: SwUnitId, segs: SwSeg[]) {
  if (unit === "BR") return true;
  const ec = EXTENDED_CODE_UNITS.find(x => x.id === unit);
  if (ec) {
    const keys = new Set(gpcsOfUnit(unit, POLICY));
    return segs.some(s => keys.has(`${s.g}>${s.p}`) && (ec.kind === "spelling" || s.p === ec.sound));
  }
  const number = +unit.slice(2);
  if (number <= 7 || number === 11) {
    const newer = new Set(newGpcsIn(unit, POLICY));
    return segs.some(s => newer.has(`${s.g}>${s.p}`));
  }
  const form = structureOf(segs.map(s => s.p));
  return number === 8 ? ["VCC", "CVCC"].includes(form) : number === 9 ? form === "CCVC" : ["CCVCC", "CVCCC", "CCCVC"].includes(form);
}

function promptFor(word: string): { pic?: string; fresh: boolean } {
  if (NON_PICTUREABLE.has(word)) return { fresh: false };
  const replacement = REPLACEMENT_PROMPTS[word];
  if (replacement) return { pic: replacement, fresh: true };
  const old = EXISTING.get(word);
  if (old?.pic && !PIC_NAMES[word]) return { pic: old.pic, fresh: false };
  if (NEW_PICTURE_PROMPTS[word]) return { pic: NEW_PICTURE_PROMPTS[word], fresh: true };
  if (EC_PICTURE_PROMPTS[word]) return { pic: EC_PICTURE_PROMPTS[word], fresh: true };
  return { fresh: false };
}

function sortTags(unit: SwUnitId, segs: SwSeg[]): string[] {
  const tags: string[] = [];
  const ec = EXTENDED_CODE_UNITS.find(x => x.id === unit);
  if (ec) {
    for (const key of gpcsOfUnit(unit, POLICY)) {
      const [g, p] = key.split(">");
      if (ec.kind === "sound" && p !== ec.sound) continue;
      if (unit === "EC18" && (["al", "el", "il", "ol"].includes(g) || (g === "le" && ["double", "little", "table", "title", "bubble", "apple"].includes(renderSegs(segs))))) continue;
      if (segs.filter(s => s.p === p).length === 1 && segs.filter(s => s.g === g && s.p === p).length === 1) tags.push(`sort:${g}`);
    }
  }
  if (unit === "BR") {
    for (const target of BRIDGING_UNIT.sounds) for (const spelling of target.spellings)
      if (segs.filter(s => s.p === target.p).length === 1 && segs.filter(s => s.g === spelling && s.p === target.p).length === 1) tags.push(`sort:${spelling}`);
  }
  if (unit === "IC11") {
    for (const key of newGpcsIn(unit, POLICY)) {
      const [g, p] = key.split(">");
      if (segs.filter(s => s.p === p).length === 1 && segs.filter(s => s.g === g && s.p === p).length === 1) tags.push(`sort:${g}`);
    }
  }
  return [...new Set(tags)];
}

function eligible(word: string, unit: SwUnitId, segs: SwSeg[]) {
  if (!CHILD_ALLOW.has(word) || US_DENY.has(word) || SLANG_DENY.has(word) || UNSUITABLE_DENY.has(word) || BRAND_DENY.has(word) || PROPER_NAME_DENY.has(word) || EARLY_WORD_DENY.has(word)) return false;
  if (ACCENT_SENSITIVE.has(word)) return false;
  if (!isDecodableAt(segs, unit, POLICY)) return false;
  if (unit !== "BR" && !unit.startsWith("EC") && firstDecodable(segs) !== unit) return false;
  if (unit.startsWith("EC") && unitIndex(firstDecodable(segs) ?? unit) > unitIndex(unit)) return false;
  if (!novelty(unit, segs) || (unit === "BR" && !sortTags(unit, segs).length)) return false;
  if (unit === "BR" && !INITIAL_CODE_UNITS[10].structures.includes(structureOf(segs.map(s => s.p)) as never)) return false;
  if (unit.startsWith("EC")) {
    const form = structureOf(segs.map(s => s.p));
    if ((form.match(/V/g)?.length ?? 0) !== 1 || form.match(/C+/g)?.some(run => run.length > 3)) return false;
  }
  const scores = jevScore(word);
  return !!scores && scores.known < 0.6 && scores.unsafe < 0.45 && scores.american < 0.3;
}

function makeWord(word: string, unit: SwUnitId, segs: SwSeg[]): UnitWord {
  const picture = promptFor(word);
  const tags = [unit === "BR" || firstDecodable(segs) !== unit ? "review" : "new"];
  if (picture.pic) tags.push("picture");
  if (picture.fresh) tags.push("new-prompt");
  const ambiguous = new Set(["which", "blue", "blew", "wood", "would", "bear", "bare", "pear", "pair", "stair", "stare", "there", "their", "where", "wear", "been", "fir", "son", "poor", "tale", "sale", "be"]);
  if (ambiguous.has(word) && !picture.pic) tags.push("reading-only");
  else if (!picture.pic) tags.push("dictation-safe");
  tags.push(...sortTags(unit, segs));
  return { text: word, segs: formatSegs(segs), unit, ...(picture.pic ? { pic: picture.pic } : {}), tags };
}

function selectWords(unit: SwUnitId, options: { text: string; segs: SwSeg[] }[]): UnitWord[] {
  const quota = contentQuota(unit);
  const valid = options.filter(x => eligible(x.text, unit, x.segs));
  const rank = (x: { text: string; segs: SwSeg[] }) => {
    const pic = !!promptFor(x.text).pic;
    const old = !!EXISTING.get(x.text);
    const score = jevScore(x.text)!;
    return (pic ? 100 : 0) + (old ? 20 : 0) - score.known * 30 - x.text.length * 0.3;
  };
  valid.sort((a, b) => rank(b) - rank(a) || a.text.localeCompare(b.text));
  const limit = Math.min(unit === "IC11" || unit === "BR" ? 90 : quota.words, valid.length);
  if (unit === "BR") {
    const chosen: typeof valid = [];
    const remaining = [...valid];
    for (const sound of BRIDGING_UNIT.sounds) for (const spelling of sound.spellings) {
      const matches = remaining.filter(x => sortTags(unit, x.segs).includes(`sort:${spelling}`)).slice(0, 10);
      for (const x of matches) { chosen.push(x); remaining.splice(remaining.indexOf(x), 1); }
    }
    return [...chosen, ...remaining].slice(0, limit).map(x => makeWord(x.text, unit, x.segs));
  }
  if (unit === "IC11") {
    const chosen: typeof valid = [];
    const remaining = [...valid];
    for (const x of remaining.filter(x => ["sink", "wink"].includes(x.text))) {
      chosen.push(x); remaining.splice(remaining.indexOf(x), 1);
    }
    for (const spelling of [...new Set(newGpcsIn(unit, POLICY).map(k => k.split(">")[0]))]) {
      const count = chosen.filter(x => sortTags(unit, x.segs).includes(`sort:${spelling}`)).length;
      for (const x of remaining.filter(x => sortTags(unit, x.segs).includes(`sort:${spelling}`)).slice(0, Math.max(0, 8 - count))) {
        chosen.push(x); remaining.splice(remaining.indexOf(x), 1);
      }
    }
    return [...chosen, ...remaining].slice(0, limit).map(x => makeWord(x.text, unit, x.segs));
  }
  const ec = EXTENDED_CODE_UNITS.find(x => x.id === unit);
  if (ec) {
    const chosen: typeof valid = [];
    const remaining = [...valid];
    const targets = gpcsOfUnit(unit, POLICY).map(key => {
      const [g, p] = key.split(">");
      return { g, p, matches: (x: typeof valid[number]) => !(unit === "EC18" && g === "le" && ["double", "little", "table", "title", "bubble", "apple"].includes(x.text)) &&
        x.segs.filter(s => s.g === g && s.p === p).length === 1 &&
        (ec.kind === "spelling" || x.segs.filter(s => s.p === p).length === 1) };
    }).filter(t => (ec.kind === "spelling" || t.p === ec.sound) && !(unit === "EC18" && ["al", "el", "il", "ol"].includes(t.g)));
    targets.sort((a, b) => valid.filter(a.matches).length - valid.filter(b.matches).length);
    for (const target of targets) {
      const count = chosen.filter(target.matches).length;
      for (const x of remaining.filter(target.matches).slice(0, Math.max(0, 8 - count))) {
        chosen.push(x); remaining.splice(remaining.indexOf(x), 1);
      }
    }
    return [...chosen, ...remaining].slice(0, limit).map(x => makeWord(x.text, unit, x.segs));
  }
  return valid.slice(0, limit).map(x => makeWord(x.text, unit, x.segs));
}

function buildChains(unit: SwUnitId, words: UnitWord[], previous: UnitWord[]): string[][] {
  const quota = contentQuota(unit);
  if (!quota.swapChains) return [];
  const candidates = [...new Map([...words, ...previous].map(w => [w.text, w])).values()]
    .filter(w => !SLANG_DENY.has(w.text) && !UNSUITABLE_DENY.has(w.text) && !EARLY_WORD_DENY.has(w.text));
  const nodes = candidates.map(w => ({ text: w.text, segs: align(w.text, unit) })).filter((x): x is { text: string; segs: SwSeg[] } => !!x.segs && isDecodableAt(x.segs, unit, POLICY));
  const edges = new Map<string, { text: string; op: string }[]>();
  for (const a of nodes) for (const b of nodes) if (a.text !== b.text) {
    const op = swapBetween(a.segs, b.segs);
    if (op && (unitIndex(unit) >= unitIndex("IC8") || op.op === "substitute")) (edges.get(a.text) ?? edges.set(a.text, []).get(a.text)!).push({ text: b.text, op: op.op });
  }
  const current = new Set(words.map(w => w.text));
  const chosen: string[][] = [];
  const length = quota.swapChainLength;
  function find(seed: string): string[] | null {
    const dfs = (path: string[], used: Set<string>, changed: boolean): string[] | null => {
      if (path.length === length) return (unitIndex(unit) < unitIndex("IC8") || changed) ? path : null;
      const last = path.at(-1)!;
      const next = (edges.get(last) ?? []).filter(e => !used.has(e.text) || (unit === "IC1" && path.length >= 3 && e.text !== last));
      next.sort((a, b) => Number(!changed && b.op !== "substitute") - Number(!changed && a.op !== "substitute") || Number(current.has(b.text)) - Number(current.has(a.text)) || a.text.localeCompare(b.text));
      for (const e of next) {
        const result = dfs([...path, e.text], new Set([...used, e.text]), changed || e.op !== "substitute");
        if (result) return result;
      }
      return null;
    };
    return dfs([seed], new Set([seed]), false);
  }
  for (const seed of words.map(w => w.text)) {
    if (chosen.length >= quota.swapChains) break;
    const chain = find(seed);
    if (chain && !chosen.some(c => c.join() === chain.join())) chosen.push(chain);
  }
  return chosen;
}

export async function buildUnit(unit: SwUnitId, previous: UnitWord[]): Promise<UnitData> {
  const raw = candidateTexts(unit);
  const options = raw.map(text => ({ text, segs: align(text, unit) })).filter((x): x is { text: string; segs: SwSeg[] } => !!x.segs);
  await ensureJev(options.map(x => ({ text: x.text, unit, pic: promptFor(x.text).pic })));
  if (unit.startsWith("EC")) await ensureGemini(options.filter(x => eligible(x.text, unit, x.segs)).map(x => ({ word: x.text, segs: x.segs })));
  const words = selectWords(unit, unit.startsWith("EC") ? options.filter(x => geminiScore(x.text, x.segs)?.ok) : options);
  const doubts = words.map(w => ({ word: w.text, segs: align(w.text, unit)! })).filter(x => /nk/.test(x.word) || (x.word === "with" && x.segs.some(s => s.p === "dh")));
  await ensureGemini(doubts);
  // A rejected pronunciation cannot remain in a published unit.
  const safeWords = words.filter(w => { const x = doubts.find(d => d.word === w.text); return !x || geminiScore(x.word, x.segs)?.ok; });
  const lag = unitIndex(unit) - 2;
  const maxUnit = lag >= 0 ? SW_SEQUENCE[lag] : undefined;
  const sentences = maxUnit ? SENTENCE_BANK.map(s => sentenceFor(s, maxUnit)).filter((x): x is UnitSentence => !!x)
    .map((s, index) => ({ s, index, freshness: Math.max(...(s.text.match(/[A-Za-z]+/g) ?? []).map(raw => {
      if (["Sam", "Tim", "Pip"].includes(raw)) return 0;
      const w = raw.toLowerCase();
      return s.special?.includes(w) ? (intro.get(w) ?? 0) : unitIndex(firstDecodable(align(w, maxUnit)!) ?? "IC1");
    })) }))
    .sort((a, b) => b.freshness - a.freshness || b.index - a.index)
    .slice(0, contentQuota(unit).sentences).map(x => x.s) : [];
  const chains = buildChains(unit, safeWords, previous);
  const nonsense = unit === "IC8" ? ["vimp"] : [];
  if (unit === "IC8" && chains.length) chains[0] = ["vimp", "limp", "lamp", "lap", "cap", "cat", "bat", "bag"];
  return { words: safeWords, sentences, chains, ...(nonsense.length ? { nonsense } : {}), poly: buildPoly(unit) };
}

if (import.meta.main) {
  const requested = (process.argv.slice(2).length ? process.argv.slice(2) : phaseA) as SwUnitId[];
  for (const u of requested) if (!SW_SEQUENCE.includes(u)) throw new Error(`Unknown sequence unit ${u}`);
  mkdirSync(OUT, { recursive: true });
  const prior: UnitWord[] = [];
  const end = Math.max(...requested.map(unitIndex));
  for (const u of SW_SEQUENCE.slice(0, end + 1)) {
    const data = await buildUnit(u, prior);
    prior.push(...data.words);
    if (!requested.includes(u)) continue;
    const header = `// Generated by scripts/content/build-unit.ts. Official Sounds~Write September 2024 policy.\n`;
    const body = ["words", "sentences", "chains", "nonsense", "poly"].map(k => `export const ${k} = ${JSON.stringify(data[k as keyof UnitData] ?? [], null, 2)} as const;`).join("\n\n");
    writeFileSync(join(OUT, `${u}.ts`), header + body + "\n");
    const q = contentQuota(u);
    console.log(`${u}: ${data.words.length}/${q.words} words, ${data.words.filter(w => w.pic).length}/${q.pictures} pictures, ${data.chains.length}/${q.swapChains} chains, ${data.sentences.length}/${q.sentences} sentences`);
  }
}
