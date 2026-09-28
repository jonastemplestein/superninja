// Picture reading v2 (docs/PICTURE_READING.md, 27 Sep): the compound-word bank for the read slider
// (src/ui/ReadSlider.tsx). No fish-dog, no dog-fish and no animal + animal (Jonas, 27 Sep: "I don't want it to come
// across as stealing from Mentava"): real compound words whose parts and whole are everyday things for a British
// 3-year-old, and whose backwards order is silly ("rainbow, not bow rain"). The research and the rules for choosing are
// docs/read-slider/research.md §4.
//
// Every word here is a picture on a plate (public/a/i/pic_<id>.webp) and a whole recorded word (public/a/w/<id>.mp3).
// A part is said as the tortoise reaches it (the slow way), the whole on the rabbit's tap (the fast way).
//
// NEW_WORDS are the parts and wholes that no content list had on 27 Sep. Their pictures and word clips were made by the
// read-slider workflow (playtest/read-slider/art/, playtest/read-slider/audio/); the entries are shaped like
// ORAL_WORDS (src/content/phonics.ts), so the follow-up can move them there as they are (docs/fix-requests.md,
// "Picture reading v2 and the read slider"). Until then, NEW_SLOW_TIMES has their slow words' onsets (public/a/x),
// which scripts/gen-slow-words.ts will write into SLOW_TIMES once ORAL_WORDS has them.
import type { PhonemeId } from "./phonics";

/** How well a word is placed: A the first meeting (W2), B the second meeting (W4) and recaps, C the reserve. */
export type Tier = "A" | "B" | "C";

export interface Compound {
  /** the whole word, which is also its picture (pic_<id>) and its word clip (w/<id>) */
  id: string;
  /** left to right: each part's picture (pic_<part>) and word clip (w/<part>) */
  parts: readonly [string, string];
  tier: Tier;
  /** W2's first meeting: `demo` is Sensei's (the slide with her paw, then the backwards gag), the others the child's */
  first?: "demo" | "child";
  /** the reversed form: said by Sensei in her backwards gag ("Bow rain!"). `pic`: a picture of it (only rainbow and
   *  raincoat, and only in Sensei's show: a child's backwards slide never earns a picture). `line`: the gag line (the
   *  A and B tiers, sunflower and pancake; the rest of the reserve has none yet) */
  reverse: { words: readonly [string, string]; pic?: string; line?: string };
  /** "The last little word tells you what it is." (pr_what_<id>): why the backwards order is silly */
  meaning?: string;
  /** the whole word's sounds, for its slow word (public/a/x) and the Sticker Book */
  segs: readonly PhonemeId[];
  /** a living thing: its picture has a face (content/living.ts, ART_STYLE PIC_LIVING) */
  living?: true;
}

// (only the lines below exist in LINES; lines.ts's block "Picture reading v2 and the read slider (27 Sep)")
export const COMPOUNDS: readonly Compound[] = [
  // ---- A: the first meeting (W2). Rainbow is Jonas's own example and Sensei's demo; snowman and cupcake the child's
  { id: "rainbow", parts: ["rain", "bow"], tier: "A", first: "demo", reverse: { words: ["bow", "rain"], pic: "bowrain", line: "pr_back_rainbow" }, meaning: "pr_what_rainbow", segs: ["r", "ae", "n", "b", "oe"] },
  { id: "snowman", parts: ["snow", "man"], tier: "A", first: "child", reverse: { words: ["man", "snow"], line: "pr_back_snowman" }, meaning: "pr_what_snowman", segs: ["s", "n", "oe", "m", "a", "n"], living: true },
  { id: "cupcake", parts: ["cup", "cake"], tier: "A", first: "child", reverse: { words: ["cake", "cup"], line: "pr_back_cupcake" }, meaning: "pr_what_cupcake", segs: ["k", "u", "p", "k", "ae", "k"] },
  // ---- B: the second meeting (W4) and recaps
  { id: "raincoat", parts: ["rain", "coat"], tier: "B", reverse: { words: ["coat", "rain"], pic: "coatrain", line: "pr_back_raincoat" }, meaning: "pr_what_raincoat", segs: ["r", "ae", "n", "k", "oe", "t"] },
  { id: "football", parts: ["foot", "ball"], tier: "B", reverse: { words: ["ball", "foot"], line: "pr_back_football" }, meaning: "pr_what_football", segs: ["f", "uu", "t", "b", "or", "l"] },
  { id: "treehouse", parts: ["tree", "house"], tier: "B", reverse: { words: ["house", "tree"], line: "pr_back_treehouse" }, meaning: "pr_what_treehouse", segs: ["t", "r", "ee", "h", "ou", "s"] },
  { id: "cowboy", parts: ["cow", "boy"], tier: "B", reverse: { words: ["boy", "cow"], line: "pr_back_cowboy" }, meaning: "pr_what_cowboy", segs: ["k", "ou", "b", "oy"], living: true },
  // ---- C: the reserve (the practice dojo, Sensei's Challenge, a repeated lesson). Sunflower stands in for cupcake if
  // cupcake's picture ever fails the picture audit (every asset exists)
  { id: "sunflower", parts: ["sun", "flower"], tier: "C", reverse: { words: ["flower", "sun"], line: "pr_back_sunflower" }, meaning: "pr_what_sunflower", segs: ["s", "u", "n", "f", "l", "ou", "schwa"] },
  { id: "pancake", parts: ["pan", "cake"], tier: "C", reverse: { words: ["cake", "pan"], line: "pr_back_pancake" }, meaning: "pr_what_pancake", segs: ["p", "a", "n", "k", "ae", "k"] },
  { id: "starfish", parts: ["star", "fish"], tier: "C", reverse: { words: ["fish", "star"] }, segs: ["s", "t", "ar", "f", "i", "sh"], living: true },
  { id: "butterfly", parts: ["butter", "fly"], tier: "C", reverse: { words: ["fly", "butter"] }, segs: ["b", "u", "t", "schwa", "f", "l", "ie"], living: true },
  { id: "ladybird", parts: ["lady", "bird"], tier: "C", reverse: { words: ["bird", "lady"] }, segs: ["l", "ae", "d", "ee", "b", "er", "d"], living: true },
  { id: "jellyfish", parts: ["jelly", "fish"], tier: "C", reverse: { words: ["fish", "jelly"] }, segs: ["j", "e", "l", "ee", "f", "i", "sh"], living: true },
  { id: "toothbrush", parts: ["tooth", "brush"], tier: "C", reverse: { words: ["brush", "tooth"] }, segs: ["t", "oo", "th", "b", "r", "u", "sh"] },
  { id: "hedgehog", parts: ["hedge", "hog"], tier: "C", reverse: { words: ["hog", "hedge"] }, segs: ["h", "e", "j", "h", "o", "g"], living: true },
  { id: "seahorse", parts: ["sea", "horse"], tier: "C", reverse: { words: ["horse", "sea"] }, segs: ["s", "ee", "h", "or", "s"], living: true },
];

export const COMPOUND_BY_ID: Readonly<Record<string, Compound>> = Object.fromEntries(COMPOUNDS.map((c) => [c.id, c]));

/** W2's first meeting: Sensei's demo word, then the child's two (docs/PICTURE_READING.md §3). */
export const FIRST_MEETING = {
  demo: COMPOUND_BY_ID.rainbow,
  child: [COMPOUND_BY_ID.snowman, COMPOUND_BY_ID.cupcake] as const,
  /** the bridge to sounds (◇ at W2, not optional in Reception): Sensei's paw slides under the mop's three sound dots */
  sounds: "mop",
};
/** W4 (the second meeting, usually the next session): the canonical demo on rainbow (no gag), then raincoat (with the
 *  session's one pictured gag, "Coat rain!") and football; ◇ treehouse. */
export const SECOND_MEETING = { demo: COMPOUND_BY_ID.rainbow, child: [COMPOUND_BY_ID.raincoat, COMPOUND_BY_ID.football] as const, extra: COMPOUND_BY_ID.treehouse, gag: COMPOUND_BY_ID.raincoat };
/** Reward 2's shiny sticker (it was the fish-dog): the rainbow, Sensei's demo word and the reward's own rainbow sweep.
 *  A save's "fishdog" sticker becomes this one (docs/PICTURE_READING.md §7, store.ts migrate()). */
export const SHINY = "rainbow";
/** The one-for-one rename for old saves (docs/PICTURE_READING.md §7): the fish-dog becomes the shiny rainbow; the
 *  dog-fish (never in a normal save) is dropped. */
export const RENAMED_STICKERS: Readonly<Record<string, string | null>> = { fishdog: SHINY, dogfish: null };
/** W2's stickers, in the order Reward 2's list says them (`pr_rw2_list`), and its shiny one. */
export const W2_STICKERS = ["rain", "bow", "snow", "man", "snowman", "cup", "cake", "cupcake"] as const;

/** The words no content list had on 27 Sep (pictures and word clips made by the read-slider workflow). Shaped like
 *  ORAL_WORDS: `pic` is the picture prompt (with ART_STYLE's PIC_OBJECT or PIC_LIVING after it), `first` the first sound,
 *  `segs` every sound. `gag`: a reversed compound's picture, only ever shown in Sensei's own show (no word clip, no
 *  sticker, never a card the child reads). */
export const NEW_WORDS: Readonly<Record<string, { pic: string; first: PhonemeId; segs: readonly PhonemeId[]; living?: true; gag?: true }>> = {
  cupcake: { pic: "one cupcake in a pleated pink paper case, with a tall swirl of pink icing and one shiny red cherry on top", first: "k", segs: ["k", "u", "p", "k", "ae", "k"] },
  raincoat: { pic: "one bright yellow hooded raincoat with big toggles, whole and on its own, hood up, nobody wearing it", first: "r", segs: ["r", "ae", "n", "k", "oe", "t"] },
  ball: { pic: "one plain shiny red rubber ball, perfectly round, with a white highlight; not a football, no pattern", first: "b", segs: ["b", "or", "l"] },
  football: { pic: "one classic black-and-white football (a soccer ball) with black pentagons and white hexagons", first: "f", segs: ["f", "uu", "t", "b", "or", "l"] },
  treehouse: { pic: "one little wooden treehouse with a red roof, a round window and a door, built up in the branches of one big green leafy tree, with a rope ladder hanging down", first: "t", segs: ["t", "r", "ee", "h", "ou", "s"] },
  cowboy: { pic: "one smiling boy dressed as a cowboy, in a brown cowboy hat, a red neckerchief, a brown waistcoat, jeans and cowboy boots, holding a coiled rope lasso, standing and facing the viewer; no gun and no holster", first: "k", segs: ["k", "ou", "b", "oy"], living: true },
  pancake: { pic: "a stack of three round golden pancakes on a white plate, with a little pat of butter on top", first: "p", segs: ["p", "a", "n", "k", "ae", "k"] },
  butter: { pic: "one yellow block of butter on a small white butter dish, with one curl of butter beside it", first: "b", segs: ["b", "u", "t", "schwa"] },
  fly: { pic: "one friendly cartoon housefly with big round red eyes, a smile, two see-through wings and six little legs, facing the viewer", first: "f", segs: ["f", "l", "ie"], living: true },
  butterfly: { pic: "one colourful butterfly with big orange and blue wings open wide, a friendly face with two big eyes and a smile, facing the viewer", first: "b", segs: ["b", "u", "t", "schwa", "f", "l", "ie"], living: true },
  lady: { pic: "one smiling grown-up lady in a pretty flowery dress, with long brown hair, standing and waving, facing the viewer", first: "l", segs: ["l", "ae", "d", "ee"], living: true },
  ladybird: { pic: "one round red ladybird with black spots and a black head, a friendly face with two big eyes and a smile, facing the viewer", first: "l", segs: ["l", "ae", "d", "ee", "b", "er", "d"], living: true },
  jelly: { pic: "one wobbly bright red jelly (the British pudding) in a castle shape from a mould, on a white plate", first: "j", segs: ["j", "e", "l", "ee"] },
  jellyfish: { pic: "one friendly pink jellyfish with a round see-through bell and wavy tentacles, a face with two big eyes and a smile", first: "j", segs: ["j", "e", "l", "ee", "f", "i", "sh"], living: true },
  tooth: { pic: "one big clean shiny white tooth (a back tooth with two roots), on its own", first: "t", segs: ["t", "oo", "th"] },
  brush: { pic: "one hairbrush with a round wooden handle and a paddle of soft bristles", first: "b", segs: ["b", "r", "u", "sh"] },
  toothbrush: { pic: "one toothbrush with a bright blue handle and white bristles, with a little blob of white and blue toothpaste on top", first: "t", segs: ["t", "oo", "th", "b", "r", "u", "sh"] },
  hedgehog: { pic: "one friendly brown hedgehog with a round body covered in spines, a pointy nose, two big eyes and a smile, standing on four little feet and facing the viewer", first: "h", segs: ["h", "e", "j", "h", "o", "g"], living: true },
  seahorse: { pic: "one friendly orange seahorse, side-on with its curly tail, a snout, one big eye and a smile", first: "s", segs: ["s", "ee", "h", "or", "s"], living: true },
  // the gag pictures (Sensei's backwards slide only)
  bowrain: { pic: "one small fluffy grey rain cloud with about twelve little red ribbon bows falling from it like raindrops, each bow with two loops and two short tails (the same bow as the reference picture); no rainbow, no raindrops, no face", first: "b", segs: ["b", "oe", "r", "ae", "n"], gag: true },
  coatrain: { pic: "one small fluffy grey rain cloud with six little blue hooded coats falling from it like raindrops (the same coat as the reference picture); no raindrops, no face", first: "k", segs: ["k", "oe", "t", "r", "ae", "n"], gag: true },
};

/** The slow words (public/a/x/<w>.mp3) made for NEW_WORDS on 27 Sep by playtest/read-slider/audio/slow.ts, with
 *  scripts/gen-slow-words.ts's own compose() and finish(): each sound's onset in seconds, as SLOW_TIMES. */
export const NEW_SLOW_TIMES: Readonly<Record<string, readonly number[]>> = {
  cupcake: [0.03, 0.381, 0.737, 1.076, 1.427, 2.152],
  raincoat: [0.03, 0.73, 1.455, 2.155, 2.506, 3.287],
  ball: [0.03, 0.454, 1.189],
  football: [0.03, 0.73, 1.202, 1.531, 1.955, 2.69],
  treehouse: [0.03, 0.359, 1.059, 1.948, 2.467, 3.174],
  cowboy: [0.03, 0.381, 1.088, 1.512],
  pancake: [0.03, 0.369, 0.849, 1.549, 1.9, 2.625],
  butter: [0.03, 0.454, 0.81, 1.139],
  butterfly: [0.03, 0.454, 0.81, 1.139, 1.794, 2.494, 3.194],
  lady: [0.03, 0.73, 1.455, 2.013],
  ladybird: [0.03, 0.73, 1.455, 2.013, 2.902, 3.326, 4.266],
  jelly: [0.03, 0.364, 0.804, 1.504],
  jellyfish: [0.03, 0.364, 0.804, 1.504, 2.393, 3.093, 3.505],
  tooth: [0.03, 0.359, 1.043],
  brush: [0.03, 0.454, 1.154, 1.51],
  toothbrush: [0.03, 0.359, 1.043, 1.735, 2.159, 2.859, 3.215],
  hedgehog: [0.03, 0.549, 0.989, 1.323, 1.842, 2.222],
  seahorse: [0.03, 0.73, 1.619, 2.138, 2.873],
};
