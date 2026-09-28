// The World Flower: 44 petals, one per sound of English (Southern British). Inside each petal is one gem per
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
// colour = the sheet's petal outline colour; icon = the petal's little picture (a word with a telling spelling): the
// subject the art was drawn from (scripts/art-manifest.ts `petal_<p>`; docs/petal-art.md). The chart's own subjects,
// drawn to read at petal size: /s/ is its red circle drawn in crayon on a sheet of paper (a bare ring read as an empty
// petal, a map pin or an "o"), and /h/'s "Who?" is the chart's pink bubble with a mystery person inside it (a
// bubble holding only a "?", blue or yellow, read as a misty petal not met yet, which also shows a "?": F3, 27 Sep, and
// verify round 2). /j/'s text never says "genie" (Gemini refuses it as the film's).
export interface ChartPetal { p: PhonemeId; spellings: string[]; page: 1 | 2 | 3; colour: string; icon: string; iconWord: string }
export const CHART_PETALS: ChartPetal[] = [
  // sheet page 1 (left): the vowel sounds, plus /s/ /l/ /f/
  { p: "ae", spellings: ["ai", "ay", "a-e", "ea", "ei", "ey", "eigh"], page: 1, colour: "#e8312f", icon: "a steam train", iconWord: "train" },
  { p: "ee", spellings: ["ee", "ea", "e", "y", "ey", "ie", "i"], page: 1, colour: "#f5821f", icon: "a leafy green tree", iconWord: "tree" },
  { p: "oy", spellings: ["oi", "oy"], page: 1, colour: "#f59ac0", icon: "a cheerful little schoolboy with short brown hair, waving, in a white shirt, blue shorts and a small red backpack", iconWord: "boy" },
  { p: "ie", spellings: ["ie", "igh", "i", "i-e", "y"], page: 1, colour: "#f3c74a", icon: "a golden baked pie with a crimped crust in a round purple pie dish", iconWord: "pie" },
  { p: "oe", spellings: ["oa", "ow", "o-e", "o", "oe", "ou", "ough"], page: 1, colour: "#f7a23b", icon: "a little sailing boat", iconWord: "boat" },
  { p: "uu", spellings: ["oo", "u", "oul"], page: 1, colour: "#f1e45c", icon: "an open storybook, its white pages fanned, with a dark blue-green cover", iconWord: "book" },
  { p: "er", spellings: ["er", "ir", "ur", "or", "ar", "ear", "our"], page: 1, colour: "#2fa65a", icon: "a small bird", iconWord: "bird" },
  { p: "ar", spellings: ["ar", "a", "al", "au"], page: 1, colour: "#9ae29a", icon: "a small blue car", iconWord: "car" },
  { p: "ou", spellings: ["ow", "ou"], page: 1, colour: "#c42fd1", icon: "a little grey mouse", iconWord: "mouse" },
  { p: "oo", spellings: ["oo", "ew", "u-e", "o", "ue", "ough", "u", "ui", "ou"], page: 1, colour: "#8a3be0", icon: "a shiny round red balloon with a little knot and a curly string", iconWord: "balloon" },
  { p: "ue", spellings: ["u", "ew", "u-e", "ue"], page: 1, colour: "#c77de8", icon: "a folded grey-and-white newspaper with a black bar across the top, a small photo box and rows of grey squiggle lines for the print", iconWord: "news" },
  { p: "or", spellings: ["or", "aw", "ar", "al", "au", "a", "oar", "augh", "ough", "ore", "our"], page: 1, colour: "#2b1d14", icon: "a corn on the cob", iconWord: "corn" },
  { p: "air", spellings: ["air", "are", "ear", "ere", "eir"], page: 1, colour: "#6ec9f2", icon: "a wooden chair", iconWord: "chair" },
  { p: "s", spellings: ["s", "ss", "st", "c", "ce", "se", "sc", "x"], page: 1, colour: "#ee2e63", icon: "a small square sheet of cream drawing paper with one corner curling up, a big bold red circle drawn on it in thick red crayon, and a short red crayon lying across its bottom corner", iconWord: "circle" },
  { p: "l", spellings: ["l", "ll", "le", "al", "el", "il", "ol"], page: 1, colour: "#6b1d73", icon: "a stone castle", iconWord: "castle" },
  { p: "f", spellings: ["f", "ff", "ph", "gh"], page: 1, colour: "#1e5f2e", icon: "a leaping blue dolphin", iconWord: "dolphin" },
  // sheet page 2 (right): short vowels and consonants
  { p: "e", spellings: ["e", "ea", "ai"], page: 2, colour: "#23208f", icon: "a loaf of bread", iconWord: "bread" },
  { p: "u", spellings: ["u", "ou", "o"], page: 2, colour: "#d9482b", icon: "a red heart", iconWord: "love" },
  { p: "o", spellings: ["o", "a"], page: 2, colour: "#e0356f", icon: "a slim black-and-yellow striped wasp with a pinched waist and narrow clear wings, side view", iconWord: "wasp" },
  { p: "d", spellings: ["d", "dd", "ed"], page: 2, colour: "#e8312f", icon: "a friendly dog", iconWord: "dog" },
  { p: "i", spellings: ["i", "ui", "e", "y"], page: 2, colour: "#f7a23b", icon: "a long red roll-packet of biscuits with a plain blue band, torn open at one end with round golden biscuits peeping out, and one biscuit with a bite out of it in front", iconWord: "biscuit" },
  { p: "n", spellings: ["n", "nn", "ne", "gn", "kn"], page: 2, colour: "#ece22a", icon: "a knight in armour", iconWord: "knight" },
  { p: "v", spellings: ["v", "ve", "vv"], page: 2, colour: "#1f8a33", icon: "a pure white dove flying, side view, both wings raised high and spread wide", iconWord: "dove" },
  { p: "j", spellings: ["j", "g", "ge", "dge"], page: 2, colour: "#4fe34f", icon: "a small shiny golden magic oil lamp, and rising tall out of its spout a big friendly blue magic spirit made of smoke, with a round smiling face, a pink turban with a feather and two arms waving hello", iconWord: "genie" },
  { p: "g", spellings: ["g", "gg", "gh", "gu"], page: 2, colour: "#3a37b8", icon: "a friendly little white ghost with a wavy bottom edge, two big round black eyes and a small round open mouth", iconWord: "ghost" },
  { p: "m", spellings: ["m", "mm", "mb", "mn"], page: 2, colour: "#7cc3f0", icon: "a thumbs-up hand", iconWord: "thumb" },
  { p: "h", spellings: ["h", "wh"], page: 2, colour: "#8c1fa8", icon: "a big round soft pink speech bubble with a thick dark-brown outline and a short pointed tail at the bottom left, and inside it the plain dark navy silhouette of a person's head and shoulders (a mystery visitor, no face) with a small bold red question mark on the silhouette's head", iconWord: "who" },
  { p: "k", spellings: ["c", "k", "ck", "ch", "cc", "q", "x"], page: 2, colour: "#c77de8", icon: "a ship's anchor", iconWord: "anchor" },
  { p: "r", spellings: ["r", "rr", "rh", "wr"], page: 2, colour: "#f0226b", icon: "a friendly grey rhino", iconWord: "rhino" },
  { p: "t", spellings: ["t", "tt", "bt", "te"], page: 2, colour: "#c4671f", icon: "a small tidy pile of three white paper envelopes, slightly fanned, the top one with a plain red stamp", iconWord: "letter" },
  { p: "z", spellings: ["z", "zz", "ze", "s", "se", "ss"], page: 2, colour: "#c9ec5a", icon: "a rounded-square picture of golden-orange sand dunes under a clear turquoise sky with a small yellow sun", iconWord: "desert" },
  { p: "eer", spellings: ["ear", "eer", "ere"], page: 2, colour: "#1f9a9c", icon: "a cartoon ear", iconWord: "ear" },
  // not on the sheet: sounds with one main spelling
  { p: "a", spellings: ["a"], page: 3, colour: "#ff6b5b", icon: "a shiny red apple", iconWord: "apple" },
  { p: "p", spellings: ["p", "pp"], page: 3, colour: "#ff8fb8", icon: "a pink pig", iconWord: "pig" },
  { p: "b", spellings: ["b", "bb"], page: 3, colour: "#4a7dff", icon: "a bouncy beach ball with big curved panels of red, yellow, blue and white", iconWord: "ball" },
  { p: "w", spellings: ["w", "wh", "u"], page: 3, colour: "#2ec4b6", icon: "a smiling whale", iconWord: "whale" },
  { p: "y", spellings: ["y"], page: 3, colour: "#ffc53d", icon: "a yo-yo", iconWord: "yo-yo" },
  { p: "sh", spellings: ["sh", "ch", "ti", "ci", "ssi", "s"], page: 3, colour: "#5ec8f2", icon: "a cream-and-coral scallop seashell, fan-shaped with deep ridges", iconWord: "shell" },
  { p: "ch", spellings: ["ch", "tch"], page: 3, colour: "#f59b2b", icon: "a fluffy round yellow baby chick facing us, with big dark eyes, a small orange beak and orange feet", iconWord: "chick" },
  { p: "th", spellings: ["th"], page: 3, colour: "#9b6cf0", icon: "a child's hand held up showing exactly three fingers, palm facing us", iconWord: "three" },
  { p: "dh", spellings: ["th"], page: 3, colour: "#6d4fd8", icon: "a single colourful feather", iconWord: "feather" },
  { p: "ng", spellings: ["ng", "n"], page: 3, colour: "#e56bd1", icon: "a gold finger ring with one big sparkling diamond on top", iconWord: "ring" },
  { p: "zh", spellings: ["s", "si", "ge"], page: 3, colour: "#c98a00", icon: "an open wooden treasure chest overflowing with gold coins, pearls and jewels", iconWord: "treasure" },
  { p: "schwa", spellings: ["a", "e", "o", "u", "er", "our"], page: 3, colour: "#a08a74", icon: "a banana", iconWord: "banana" },
];
const SPELLINGS: [PhonemeId, string[]][] = CHART_PETALS.map((c) => [c.p, c.spellings]);
export const chartOf = (p: PhonemeId) => CHART_PETALS.find((c) => c.p === p)!;
/** The sound's chart petal, or undefined for a sound with none of its own (/ks/ and /kw/ are two sounds: a pair). */
export const chartPetal = (p: string): ChartPetal | undefined => CHART_PETALS.find((c) => c.p === p);
/** The word the petal's picture shows (SOUND_DISPLAY A12): /a/ "apple", /p/ "pig". A turn that shows this petal must not
 *  offer a card of this word, or the child matches two pictures instead of listening. Null for a sound with no petal. */
export const iconWordOf = (p: string): string | null => chartPetal(p)?.iconWord ?? null;

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
