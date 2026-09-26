/** Builds the local PW stages from official example sets and 2026 check words.
 * The stages are our staging, not numbered Sounds~Write units. */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { POLYSYLLABIC, SYLLABLE_EXAMPLES, isDecodableAt, type SwUnitId } from "../../src/content/sw";
import { POLICY, align } from "./core";
import type { UnitData } from "./types";

// Split spellings follow spoken syllables and the official examples in sw.ts.
// The extra pool is transcribed from the 2026 progress checks (research/sections/
// polysyllabic.md, table 1.2) and the Lexicon's schwa lists (Part 2, pp. 88-90).
const CHECK_SPLITS = `au|thor wa|ter hair|cut some|where stair|case air|line
toi|let part|ner oys|ter tar|get bot|tle rot|ten pay|ment hol|i|day
chim|ney li|tre so|lar fa|vour co|llar sa|vvy ski|vvy e|ve|ning
sea|son pi|a|no note|book knee|cap rou|tine o|live sham|poo
to|geth|er co|ffee laugh|ter grate|ful daugh|ter anch|or
sun|rise rain|coat foot|ball sea|side bed|time day|light
book|case play|ground hand|bag farm|yard rain|bow night|time
pic|nic bas|ket nap|kin pen|cil gar|den pump|kin rab|bit
ti|ger pa|per o|pen ba|by fa|ther mo|ther sis|ter bro|ther
ro|bot to|ma|to po|ta|to u|ni|form an|i|mal el|e|phant
but|ter|fly hos|pi|tal im|por|tant yes|ter|day to|mor|row
de|co|rate hes|i|tate con|tain|er heav|i|ly hap|pi|ly
week|end sud|den hon|ey se|cret ra|di|o sys|tem sym|bol
sym|pa|thy ep|i|sode ty|pi|cal mag|a|zine po|wer|ful
im|prove|ment vol|can|ic ab|so|lute|ly in|clud|ing
to|geth|er cha|llenge por|ridge dan|ger|ous di|gi|tal
re|gis|ter ge|ner|al pho|to|graph grand|fa|ther dis|in|fect
bi|o|gra|phy al|pha|bet au|to|mat|ic as|tro|naut au|di|ence
whole|some sto|mach me|chan|ic cha|rac|ter chem|is|try`.trim().split(/\s+/);
const DOMAIN_SPLITS = `pho|to|graph bi|o|gra|phy vol|can|ic
chem|is|try me|chan|ic cha|rac|ter al|pha|bet as|tro|naut
di|gi|tal re|gis|ter au|to|mat|ic im|prove|ment
sym|pa|thy ep|i|sode dis|in|fect dan|ger|ous`.trim().split(/\s+/);

// Schwa indices are for Southern British speech. The Lexicon explicitly
// identifies a/about, o/lemon, ar/beggar, our/favour, re/litre and er/baker;
// weak vowels in its examples and the research examples are marked likewise.
const SCHWA: Record<string, number[]> = {
  lemon: [1], lesson: [1], seven: [1], salad: [1], about: [0],
  address: [0], collect: [0], equipment: [0], carrot: [1],
  hundred: [1], kitchen: [1], author: [1], water: [1],
  toilet: [1], partner: [1], oyster: [1], target: [1],
  bottle: [1], rotten: [1], payment: [1], holiday: [1],
  chimney: [1], litre: [1], solar: [1], favour: [1],
  collar: [1], savvy: [1], skivvy: [1], evening: [0],
  season: [1], piano: [1], olive: [0], together: [0, 2],
  coffee: [1], laughter: [1], grateful: [1], daughter: [1],
  anchor: [1], picnic: [1], basket: [1], napkin: [1],
  pencil: [1], garden: [1], pumpkin: [1], rabbit: [1],
  tiger: [1], paper: [1], open: [1], baby: [1], father: [1],
  mother: [1], sister: [1], brother: [1], robot: [1],
  tomato: [0], potato: [0], uniform: [0], animal: [0, 2],
  elephant: [0, 2], hospital: [0, 2], important: [0, 2],
  yesterday: [1], tomorrow: [0, 2], decorate: [1, 2],
  hesitate: [1], container: [1], heavily: [1, 2], happily: [1, 2],
  sudden: [1], honey: [1], secret: [1], radio: [1],
  system: [1], symbol: [1], sympathy: [1, 2],
  episode: [0, 2], typical: [0, 2], magazine: [1, 2],
  powerful: [1, 2], improvement: [0], volcanic: [0],
  absolutely: [0, 2, 3], including: [0], challenge: [1],
  porridge: [1], dangerous: [1, 2], digital: [0, 2],
  register: [1, 2], general: [1, 2], photograph: [1, 2],
  grandfather: [2], disinfect: [0], biography: [1, 3],
  alphabet: [0, 2], automatic: [0, 2], astronaut: [2],
  audience: [1, 2], wholesome: [1], stomach: [1],
  mechanic: [1], character: [1, 2], chemistry: [1, 2],
  farmer: [1], baker: [1], faster: [1], after: [1],
  picture: [1], enormous: [0, 2], musician: [0, 2],
  different: [1], animals: [0, 2], narrator: [1, 2],
  government: [1], rubbish: [1], mirror: [1],
  chlorophyll: [1], multiplication: [4],
  autobiographical: [3, 6], disastrous: [2],
};

const GATE: Record<string, SwUnitId> = {
  PW1: "EC4", PW2: "EC6", PW3: "EC8", PW4: "EC20", PW5: "EC36",
  PW6: "EC49", PW7: "EC49", PW8: "EC49", PW9: "EC49",
};
const stagePools = POLYSYLLABIC.map(p => p.examples.map(s => s.toLowerCase()));
const officialSplits = new Map(SYLLABLE_EXAMPLES.map(x => [x.word.toLowerCase(), x.split.toLowerCase()]));
const unique = (rows: string[]) => [...new Map(rows.map(s => [s.replaceAll("|", ""), officialSplits.get(s.replaceAll("|", "")) ?? s])).values()];

function poolFor(n: number): string[] {
  if (n === 1) return stagePools[0];
  if (n === 2) return [...stagePools[1], ...stagePools[0]];
  if (n === 3) return [...stagePools[2], ...stagePools[1], ...stagePools[0]];
  if (n === 4) return [...stagePools[3], ...CHECK_SPLITS, ...stagePools[2]];
  if (n === 5) return [...stagePools[4], ...CHECK_SPLITS, ...stagePools[3]];
  if (n === 6) return [...stagePools[5], ...CHECK_SPLITS, ...stagePools[4]];
  if (n === 8 || n === 9) {
    const longer = [...CHECK_SPLITS].sort((a, b) => b.split("|").length - a.split("|").length);
    return n === 9
      ? [...stagePools[8], ...DOMAIN_SPLITS, ...longer, ...stagePools[4], ...stagePools[5]]
      : [...stagePools[4], ...longer, ...stagePools[5]];
  }
  return [...stagePools[n - 1], ...CHECK_SPLITS, ...stagePools[5], ...stagePools[4], ...stagePools[3]];
}

for (const p of POLYSYLLABIC) {
  const n = p.stage;
  const gate = GATE[p.id];
  const minSyllables = n === 5 || n === 8 ? 3 : 2;
  const maxSyllables = p.syllables[1];
  const poly: UnitData["poly"] = [];
  for (const raw of unique(poolFor(n))) {
    const split = raw.toLowerCase();
    const word = split.replaceAll("|", "");
    const parts = split.split("|");
    if (parts.length < minSyllables || parts.length > maxSyllables || !/^[a-z]+$/.test(word)) continue;
    if (["batman", "september", "august", "atlantic", "bruce", "david"].includes(word)) continue;
    if (!parts.every(part => {
      const segs = align(part, gate);
      return segs && isDecodableAt(segs, gate, { ...POLICY, checkStructure: false });
    })) continue;
    const schwa = SCHWA[word] ?? (parts.some(x => /^(a|e|i|o|u)$/.test(x)) ? [parts.findIndex(x => /^(a|e|i|o|u)$/.test(x))] : undefined);
    poly.push({ text: word, syllables: split, ...(schwa ? { schwa } : {}) });
    if (poly.length >= 30) break;
  }
  const data: UnitData = { words: [], sentences: [], chains: [], poly };
  const body = ["words", "sentences", "chains", "poly"].map(k => `export const ${k} = ${JSON.stringify(data[k as keyof UnitData], null, 2)} as const;`).join("\n\n");
  writeFileSync(join(import.meta.dir, `../../src/content/units/${p.id}.ts`), `// Generated by scripts/content/build-poly.ts. PW stages are local staging.\n${body}\n`);
  console.log(`${p.id}: ${poly.length}/30 polysyllabic words (${gate} code)`);
}
