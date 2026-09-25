// The Sound Flower: 44 petals, one per sound of English (Southern British). Inside each petal is one gem per
// spelling of that sound, following the published Sounds~Write progression (Initial + Extended Code).
// A gem is "in play" once the game has words that use that spelling; the rest are shown as future gems.
import { PHONEMES, UNITS, WORDS, type PhonemeId } from "./phonics";

export interface Gem {
  key: string; // "ai>ae": spelling>sound, exactly as words are segmented, so practice charges it
  g: string; // spelling shown on the gem ("a-e" for split spellings)
  p: PhonemeId;
  unit: number; // game unit where it is first taught (99 = not in this version yet)
  inPlay: boolean;
}
export interface Petal {
  p: PhonemeId;
  gems: Gem[];
  vowel: boolean;
}

// Sound → all its spellings, in the order of the school's laminated "Extended Code alternative spellings"
// sheet (Freshford Yr1/Yr2 parents' presentation, p23). `page` 1 and 2 mirror the sheet's two A4 pages;
// page 3 holds the sounds the sheet doesn't show (single-spelling Initial Code sounds).
// colour = the sheet's petal outline colour; icon = the petal's little picture (a word with a telling spelling).
export interface ChartPetal { p: PhonemeId; spellings: string[]; page: 1 | 2 | 3; colour: string; icon: string; iconWord: string }
export const CHART_PETALS: ChartPetal[] = [
  // sheet page 1 (left): the vowel sounds, plus /s/ /l/ /f/
  { p: "ae", spellings: ["ai", "ay", "a-e", "ea", "ei", "ey", "eigh"], page: 1, colour: "#e8312f", icon: "a steam train", iconWord: "train" },
  { p: "ee", spellings: ["ee", "ea", "e", "y", "ey", "ie", "i"], page: 1, colour: "#f5821f", icon: "a leafy green tree", iconWord: "tree" },
  { p: "oy", spellings: ["oi", "oy"], page: 1, colour: "#f59ac0", icon: "a wooden toy robot", iconWord: "toy" },
  { p: "ie", spellings: ["ie", "igh", "i", "i-e", "y"], page: 1, colour: "#f3c74a", icon: "a flying kite", iconWord: "kite" },
  { p: "oe", spellings: ["oa", "ow", "o-e", "o", "oe", "ou", "ough"], page: 1, colour: "#f7a23b", icon: "a little sailing boat", iconWord: "boat" },
  { p: "uu", spellings: ["oo", "u", "oul"], page: 1, colour: "#f1e45c", icon: "an open storybook", iconWord: "book" },
  { p: "er", spellings: ["er", "ir", "ur", "or", "ar", "ear", "our"], page: 1, colour: "#2fa65a", icon: "a small bird", iconWord: "bird" },
  { p: "ar", spellings: ["ar", "a", "al", "au"], page: 1, colour: "#9ae29a", icon: "a small blue car", iconWord: "car" },
  { p: "ou", spellings: ["ow", "ou"], page: 1, colour: "#c42fd1", icon: "a little grey mouse", iconWord: "mouse" },
  { p: "oo", spellings: ["oo", "ew", "u-e", "o", "ue", "ough", "u", "ui", "ou"], page: 1, colour: "#8a3be0", icon: "a crescent moon", iconWord: "moon" },
  { p: "ue", spellings: ["u", "ew", "u-e", "ue"], page: 1, colour: "#c77de8", icon: "a folded newspaper", iconWord: "news" },
  { p: "or", spellings: ["or", "aw", "ar", "al", "au", "a", "oar", "augh", "ough", "ore", "our"], page: 1, colour: "#2b1d14", icon: "a corn on the cob", iconWord: "corn" },
  { p: "air", spellings: ["air", "are", "ear", "ere", "eir"], page: 1, colour: "#6ec9f2", icon: "a wooden chair", iconWord: "chair" },
  { p: "s", spellings: ["s", "ss", "st", "c", "ce", "se", "sc", "x"], page: 1, colour: "#ee2e63", icon: "a red circle", iconWord: "circle" },
  { p: "l", spellings: ["l", "ll", "le", "al", "el", "il", "ol"], page: 1, colour: "#6b1d73", icon: "a stone castle", iconWord: "castle" },
  { p: "f", spellings: ["f", "ff", "ph", "gh"], page: 1, colour: "#1e5f2e", icon: "a leaping blue dolphin", iconWord: "dolphin" },
  // sheet page 2 (right): short vowels and consonants
  { p: "e", spellings: ["e", "ea", "ai"], page: 2, colour: "#23208f", icon: "a loaf of bread", iconWord: "bread" },
  { p: "u", spellings: ["u", "ou", "o"], page: 2, colour: "#d9482b", icon: "a red heart", iconWord: "love" },
  { p: "o", spellings: ["o", "a"], page: 2, colour: "#e0356f", icon: "a stripy wasp", iconWord: "wasp" },
  { p: "d", spellings: ["d", "dd", "ed"], page: 2, colour: "#e8312f", icon: "a friendly dog", iconWord: "dog" },
  { p: "i", spellings: ["i", "ui", "e", "y"], page: 2, colour: "#f7a23b", icon: "a red building block", iconWord: "build" },
  { p: "n", spellings: ["n", "nn", "ne", "gn", "kn"], page: 2, colour: "#ece22a", icon: "a knight in armour", iconWord: "knight" },
  { p: "v", spellings: ["v", "ve", "vv"], page: 2, colour: "#1f8a33", icon: "a white dove", iconWord: "dove" },
  { p: "j", spellings: ["j", "g", "ge", "dge"], page: 2, colour: "#4fe34f", icon: "a friendly giraffe", iconWord: "giraffe" },
  { p: "g", spellings: ["g", "gg", "gh", "gu"], page: 2, colour: "#3a37b8", icon: "a friendly little ghost", iconWord: "ghost" },
  { p: "m", spellings: ["m", "mm", "mb", "mn"], page: 2, colour: "#7cc3f0", icon: "a thumbs-up hand", iconWord: "thumb" },
  { p: "h", spellings: ["h", "wh"], page: 2, colour: "#8c1fa8", icon: "a speech bubble with a question mark", iconWord: "who" },
  { p: "k", spellings: ["c", "k", "ck", "ch", "cc", "q", "x"], page: 2, colour: "#c77de8", icon: "a ship's anchor", iconWord: "anchor" },
  { p: "r", spellings: ["r", "rr", "rh", "wr"], page: 2, colour: "#f0226b", icon: "a friendly grey rhino", iconWord: "rhino" },
  { p: "t", spellings: ["t", "tt", "bt", "te"], page: 2, colour: "#c4671f", icon: "a stripy tiger", iconWord: "tiger" },
  { p: "z", spellings: ["z", "zz", "ze", "s", "se", "ss"], page: 2, colour: "#c9ec5a", icon: "a stripy zebra", iconWord: "zebra" },
  { p: "eer", spellings: ["ear", "eer", "ere"], page: 2, colour: "#1f9a9c", icon: "a cartoon ear", iconWord: "ear" },
  // not on the sheet: sounds with one main spelling
  { p: "a", spellings: ["a"], page: 3, colour: "#ff6b5b", icon: "a shiny red apple", iconWord: "apple" },
  { p: "p", spellings: ["p", "pp"], page: 3, colour: "#ff8fb8", icon: "a pink pig", iconWord: "pig" },
  { p: "b", spellings: ["b", "bb"], page: 3, colour: "#4a7dff", icon: "a bouncy ball", iconWord: "ball" },
  { p: "w", spellings: ["w", "wh", "u"], page: 3, colour: "#2ec4b6", icon: "a smiling whale", iconWord: "whale" },
  { p: "y", spellings: ["y"], page: 3, colour: "#ffc53d", icon: "a yo-yo", iconWord: "yo-yo" },
  { p: "sh", spellings: ["sh", "ch", "ti", "ci", "ssi", "s"], page: 3, colour: "#5ec8f2", icon: "a sailing ship", iconWord: "ship" },
  { p: "ch", spellings: ["ch", "tch"], page: 3, colour: "#f59b2b", icon: "a fluffy yellow chick", iconWord: "chick" },
  { p: "th", spellings: ["th"], page: 3, colour: "#9b6cf0", icon: "the number three as three stars", iconWord: "three" },
  { p: "dh", spellings: ["th"], page: 3, colour: "#6d4fd8", icon: "a single colourful feather", iconWord: "feather" },
  { p: "ng", spellings: ["ng", "n"], page: 3, colour: "#e56bd1", icon: "a gold ring", iconWord: "ring" },
  { p: "zh", spellings: ["s", "si", "ge"], page: 3, colour: "#c98a00", icon: "a treasure chest", iconWord: "treasure" },
  { p: "schwa", spellings: ["a", "e", "o", "u", "er", "our"], page: 3, colour: "#a08a74", icon: "a banana", iconWord: "banana" },
];
const SPELLINGS: [PhonemeId, string[]][] = CHART_PETALS.map((c) => [c.p, c.spellings]);
export const chartOf = (p: PhonemeId) => CHART_PETALS.find((c) => c.p === p)!;

const unitOfSpelling = (g: string) => UNITS.find((u) => u.spellings.includes(g))?.id ?? 99;

// spelling→sound pairs the game's words actually use (so they can be practised and charged)
const used = new Set<string>();
for (const w of WORDS) for (const s of w.segs) used.add(`${s.g}>${s.p}`);

const keyFor = (g: string, p: PhonemeId) => (g === "x" ? "x>ks" : `${g}>${p}`);

export const PETALS: Petal[] = SPELLINGS.map(([p, gs]) => ({
  p,
  vowel: !!PHONEMES[p].vowel,
  gems: gs.map((g) => {
    const key = keyFor(g, p);
    const inPlay = used.has(key);
    const unit = !inPlay ? 99 : g === "u" && p === "w" ? unitOfSpelling("q") : unitOfSpelling(g);
    return { key, g, p, unit, inPlay };
  }),
}));

export const GEMS: Gem[] = PETALS.flatMap((pt) => pt.gems);
export const gemByKey = (k: string) => GEMS.find((g) => g.key === k);
export const petalsOfGem = (k: string) => PETALS.filter((pt) => pt.gems.some((g) => g.key === k));

/** Gems a petal needs before it can join the flower (the ones this version of the game can teach). */
export const neededGems = (pt: Petal) => pt.gems.filter((g) => g.inPlay);
