// The warm-ups (docs/FIRST_MINUTES.md §5, §7, §9, §10): game-only lessons before Initial Code Unit 1, as data. The
// scenes (src/scenes/Warmup.tsx) only play these beats, so the architecture work (src/core) can read the same scripts.
//
// Every warm-up game type opens with "Let me show you!": Sensei and the ninja do one item (the paw taps, the ninja
// moves) and the child only watches. Then "Now you try!" and the child does it (the Amendment). Keep demos to ~5 s.
// Two phases only: the full I do / we do / you do comes back from IC Unit 1. Nothing moves on by itself
// (docs/NAVIGATION.md): a demo leads straight into the child's turn, which waits (Show me again plays the demo again), and
// where a beat ending on Sensei's show meets a beat opening with another show, the lesson holds on Next.
//
// Lines are Sensei's whole recorded sentences (src/content/lines.ts, "First minutes"); only pure sounds, stretched
// words and held first sounds are spliced in, after a lead-in that ends on "..." (§12).
import type { Say } from "../engine/audio";
import type { PhonemeId, Seg } from "./phonics";
import { WORD_BY_TEXT, ORAL_WORDS, PHONEMES } from "./phonics";
import { LINES } from "./lines";
import { STRETCHED } from "./stretch";

// ---------------------------------------------------------------- beats
/** A demonstration: the paw taps `target` while Sensei says `prompt` (the child watches). */
export interface Demo { target: string; prompt?: string }
/** A stacked "which did I read?" pair: two rails, the first read aloud unless `answer` says otherwise. */
export interface Which { rails: [string[], string[]]; answer: 0 | 1; line: string; after?: string }

export type Beat = { optional?: true; secs: number } & (
  /** cards drop in (one row); the hello line; the lesson beads appear */
  | { kind: "hello"; line: string; cards: string[] }
  /** Sensei names each card while it is spotlit (fm_name_<w>): "Every picture is named aloud when it appears" */
  | { kind: "name"; cards: string[] }
  /** "Tap the sock!" (a demo first: "Let me show you! Tap the sun!") */
  | { kind: "tap"; target: string; options: string[]; prompt: string; demo?: Demo; glowAfterMs?: number }
  /** fast and slow: Sensei shows it (full: the explanation; recap: just the two buttons), or the child taps one button */
  | { kind: "fastslow"; word: string; by: "sensei"; show: "full" | "recap" }
  | { kind: "fastslow"; word: string; by: "child"; speed: "slow" | "fast" }
  /** "Listen to my slow word... [x cat] Which picture is it?" → "caaat… cat!" */
  | { kind: "slowpick"; target: string; options: string[]; again?: true; glowAfterMs?: number; demo?: Demo }
  /** "Listen to the very first sound." [o sun] [o sock] "Did you notice?…" [/s/] "Say that sound with me!" [/s/] */
  | { kind: "notice"; p: PhonemeId; words: [string, string]; line: string }
  /** tap all the pictures that start with /s/ (or have /a/ in them); `demo`: the paw finds this one first */
  | { kind: "tapall"; how: "start" | "in"; p: PhonemeId; cards: string[]; targets: string[]; quick?: true; spell?: true; demo?: string }
  /** the reading rail: Sensei reads the pictures left to right (a light under each), or the child taps them in order */
  | { kind: "rail"; cards: string[]; by: "sensei" | "child"; line: string; after?: string; merge?: string; demo?: true; intro?: string }
  /** the ninja leapfrogs the cards and they swap places (Sensei) */
  | { kind: "swap"; cards: string[]; line: string; merge?: string; after?: string }
  /** "Which one did I read?": two stacked rails; the child taps a whole rail */
  | { kind: "which"; pick: Which; demo?: Which }
  /** two little words make one big word: Sensei (the paw taps the tortoise, then the rabbit) or the child (the rabbit) */
  | { kind: "compound"; parts: [string, string]; word: string; by: "sensei" | "child"; lines: string[]; after?: string; via?: "star" }
  /** Sensei says the sounds; the child listens for the word (W5). `options` grow from 2 to 3 (§10). */
  | { kind: "sounds"; items: { target: string; options: string[] }[]; demo: { target: string; options: string[] } }
  /** sound dots under a picture, tapped left to right like sound buttons (W6) */
  | { kind: "dots"; words: string[]; demo: string }
  /** every bead lit; the closing line; the ninja celebrates */
  | { kind: "done"; line: string }
);
export type BeatKind = Beat["kind"];

export interface Warmup {
  key: string;
  title: string;
  kind: "ears" | "picread";
  /** the time governor: a target and a hard cap (seconds, a real child) */
  targetS: number;
  capS: number;
  beats: Beat[];
  /** Reception versions (§9): the same lesson with spellings shown, or a changed beat */
  school?: Partial<Record<"R", Beat[]>>;
  /** a Reception version's own budget, when its extra beat can't fit the lesson's (docs/DECISIONS.md) */
  schoolBudget?: Partial<Record<"R", { targetS: number; capS: number }>>;
  /** the pictures this lesson turns into stickers (Reward), the one-clip list the reward says, and the shiny one */
  stickers: string[];
  list?: string;
  shiny?: string;
}

const ROW3 = ["sun", "sock", "cat"];

export const WARMUPS: Record<string, Warmup> = {
  // ---------------------------------------------------------------- W1 Ninja Ears (§5)
  W1: {
    key: "W1", title: "Ninja Ears", kind: "ears", targetS: 85, capS: 100,
    stickers: ["sun", "sock", "cat", "sausage", "moon"], list: "fm_rw1_list",
    // (beat secs: what a quick child takes, measured on the first-minutes bot; the governor plans with them. A beat
    // that ends on a show before a beat that opens with one (the notice here, W2's swap) holds on Next: its secs count
    // the hold's first 1.5 s, the most a lesson clock counts of it: docs/NAVIGATION.md §3.7)
    beats: [
      { kind: "hello", secs: 3, line: "fm_l1_hello", cards: ROW3 },
      { kind: "name", secs: 4.5, cards: ROW3 },
      // Ninja Ears: "Let me show you! Tap the sun!" (the paw taps it), then "Now you try! Tap the sock!"
      { kind: "tap", secs: 7, target: "sock", options: ROW3, prompt: "fm_tap_sock", demo: { target: "sun", prompt: "fm_tap_sun" } },
      // fast and slow: Sensei shows it (the paw taps the rabbit, then the tortoise), then the child's turn
      { kind: "fastslow", secs: 15.5, word: "sun", by: "sensei", show: "full" },
      { kind: "fastslow", secs: 8.5, word: "sun", by: "child", speed: "slow" },
      { kind: "fastslow", secs: 4.5, word: "sun", by: "child", speed: "fast", optional: true },
      // (no slow-word pick here: with the Amendment's demos it never fitted, and the governor dropped it for every
      // child; the first one is W3's, with its own demo: docs/DECISIONS.md)
      { kind: "notice", secs: 15, p: "s", words: ["sun", "sock"], line: "fm_notice_sun_sock" },
      // tap all that start with /s/: the paw finds the sun first, then the child finds the other two
      { kind: "tapall", secs: 22.5, how: "start", p: "s", cards: ["sun", "sausage", "moon", "sock", "cat"], targets: ["sun", "sock", "sausage"], demo: "sun" },
      { kind: "done", secs: 3.5, line: "fm_l1_done" },
    ],
    school: {
      // Reception (autumn): the tortoise turn is optional, and each /s/ find shows how we spell /s/ (§9)
      R: [
        { kind: "hello", secs: 3, line: "fm_l1_hello", cards: ROW3 },
        { kind: "name", secs: 4.5, cards: ROW3 },
        { kind: "tap", secs: 7, target: "sock", options: ROW3, prompt: "fm_tap_sock", demo: { target: "sun", prompt: "fm_tap_sun" } },
        { kind: "fastslow", secs: 15.5, word: "sun", by: "sensei", show: "full" },
        { kind: "fastslow", secs: 8.5, word: "sun", by: "child", speed: "slow", optional: true },
        { kind: "slowpick", secs: 10.5, target: "cat", options: ROW3, glowAfterMs: 2000 },
        { kind: "notice", secs: 15, p: "s", words: ["sun", "sock"], line: "fm_notice_sun_sock" },
        { kind: "tapall", secs: 25, how: "start", p: "s", cards: ["sun", "sausage", "moon", "sock", "cat"], targets: ["sun", "sock", "sausage"], demo: "sun", spell: true },
        { kind: "done", secs: 4, line: "fm_l1_done" },
      ],
    },
  },

  // ---------------------------------------------------------------- W2 Ninjas Read This Way (§7)
  W2: {
    // (target 65 s, was 60: the merged pictures now hold clean for 1.5 s after their word, about 5 s in all, and the
    // which-did-I-read demo, this game's "Let me show you!", must still fit for a quick child; docs/DECISIONS.md)
    key: "W2", title: "Ninjas Read This Way", kind: "picread", targetS: 65, capS: 75,
    // Reception's "/a/ in it", with < a > written on cat's middle line, adds about 20 s to the lesson
    schoolBudget: { R: { targetS: 77, capS: 88 } },
    stickers: ["fish", "dog", "flower", "sunflower", "star", "starfish"], list: "fm_rw2_list", shiny: "fishdog",
    beats: [
      // "Let me show you!": Sensei reads the pictures (the light passes under each; the ninja runs along), then the
      // child taps them the ninja way. (A merge holds the new picture clean for 1.5 s after its word, "Fish dog!",
      // "Sunflower!": the beats' secs count it)
      { kind: "rail", secs: 12, cards: ["fish", "dog"], by: "sensei", line: "fm_read_fish_dog", after: "fm_pair_fish_dog", merge: "fishdog", demo: true, intro: "fm_l2_way" },
      { kind: "rail", secs: 10.5, cards: ["fish", "dog"], by: "child", line: "fm_l2_turn", after: "fm_pair_fish_dog", merge: "fishdog" },
      // (◇: a slower child keeps the time for their own turns; the which-did-I-read demo still shows both orders)
      { kind: "swap", secs: 11, cards: ["dog", "fish"], line: "fm_l2_swap", merge: "dogfish", after: "r2_dog_fish", optional: true },
      // "Which did I read?": Sensei shows it on fish/dog (dropped when the lesson is behind: skipDemo), then the
      // child's turn on cat/dog
      {
        kind: "which", secs: 13.5,
        demo: { rails: [["fish", "dog"], ["dog", "fish"]], answer: 0, line: "fm_read_fish_dog" },
        pick: { rails: [["cat", "dog"], ["dog", "cat"]], answer: 0, line: "fm_which_cat_dog", after: "fm_pair_cat_dog" },
      },
      { kind: "compound", secs: 11.5, parts: ["sun", "flower"], word: "sunflower", by: "sensei", lines: ["fm_l2_big_word", "fm_sunflower"] },
      { kind: "compound", secs: 12.5, parts: ["star", "fish"], word: "starfish", by: "child", lines: ["fm_starfish_q"], after: "fm_starfish", via: "star" },
      { kind: "tapall", secs: 10, optional: true, quick: true, how: "start", p: "s", cards: ["sunflower", "sock", "fish", "dog"], targets: ["sunflower", "sock"] },
      { kind: "done", secs: 3.5, line: "fm_l2_done" },
    ],
    school: {
      // Reception: beat 8 becomes "/a/ in it", and the < a > is written on cat's middle line (§9)
      R: [
        { kind: "rail", secs: 12, cards: ["fish", "dog"], by: "sensei", line: "fm_read_fish_dog", after: "fm_pair_fish_dog", merge: "fishdog", demo: true, intro: "fm_l2_way" },
        { kind: "rail", secs: 10.5, cards: ["fish", "dog"], by: "child", line: "fm_l2_turn", after: "fm_pair_fish_dog", merge: "fishdog" },
        // (optional here: "/a/ in it" needs the time, and the which demo already shows both orders)
        { kind: "swap", secs: 11, cards: ["dog", "fish"], line: "fm_l2_swap", merge: "dogfish", after: "r2_dog_fish", optional: true },
        {
          kind: "which", secs: 13.5,
          demo: { rails: [["fish", "dog"], ["dog", "fish"]], answer: 0, line: "fm_read_fish_dog" },
          pick: { rails: [["cat", "dog"], ["dog", "cat"]], answer: 0, line: "fm_which_cat_dog", after: "fm_pair_cat_dog" },
        },
        { kind: "compound", secs: 11.5, parts: ["sun", "flower"], word: "sunflower", by: "sensei", lines: ["fm_l2_big_word", "fm_sunflower"] },
        { kind: "compound", secs: 12.5, parts: ["star", "fish"], word: "starfish", by: "child", lines: ["fm_starfish_q"], after: "fm_starfish", via: "star" },
        { kind: "tapall", secs: 22.5, how: "in", p: "a", cards: ["cat", "bag", "jam", "sun", "dog"], targets: ["cat", "bag", "jam"], demo: "cat", spell: true },
        { kind: "done", secs: 3.5, line: "fm_l2_done" },
      ],
    },
  },

  // ---------------------------------------------------------------- W3 (ears): fast/slow on mug, /a/ in it, /m/ first
  W3: {
    key: "W3", title: "Ninja Ears: in and first", kind: "ears", targetS: 85, capS: 100,
    stickers: ["mug", "bag", "jam", "van", "map"],
    beats: [
      { kind: "hello", secs: 3, line: "fm_l1_hello", cards: ["mug"] },
      { kind: "name", secs: 2, cards: ["mug"] },
      { kind: "fastslow", secs: 9, word: "mug", by: "sensei", show: "recap" },
      { kind: "fastslow", secs: 7, word: "mug", by: "child", speed: "slow" },
      { kind: "fastslow", secs: 4, word: "mug", by: "child", speed: "fast", optional: true },
      // the first slow-word pick a child meets: "Let me show you!" (mug), then "Now you try!" (van)
      { kind: "slowpick", secs: 15, target: "van", options: ["mug", "van", "bag"], demo: { target: "mug" } },
      { kind: "tapall", secs: 30, how: "in", p: "a", cards: ["cat", "bag", "jam", "van", "sun", "dog"], targets: ["cat", "bag", "jam", "van"], demo: "cat" },
      { kind: "tapall", secs: 22, how: "start", p: "m", cards: ["mug", "moon", "map", "sun", "cat"], targets: ["mug", "moon", "map"] },
      { kind: "done", secs: 4, line: "fm_l1_done" },
    ],
  },

  // ---------------------------------------------------------------- W4 (picread): three in a row, which, a picture word
  W4: {
    key: "W4", title: "Ninjas Read This Way: three in a row", kind: "picread", targetS: 70, capS: 85,
    stickers: ["rainbow", "snowman"],
    beats: [
      { kind: "rail", secs: 9, cards: ["cat", "dog", "fish"], by: "sensei", line: "fm_read_cat_dog_fish", demo: true, intro: "fm_l2_way" },
      { kind: "rail", secs: 9, cards: ["cat", "dog", "fish"], by: "child", line: "fm_l2_turn", after: "fm_triple_cat_dog_fish" },
      { kind: "swap", secs: 7, cards: ["fish", "dog", "cat"], line: "fm_l4_swap" },
      { kind: "which", secs: 9, pick: { rails: [["fish", "dog", "cat"], ["cat", "dog", "fish"]], answer: 0, line: "fm_which_three", after: "fm_triple_fish_dog_cat" } },
      // two more picture words, made by the child (§10): rain + bow, snow + man
      { kind: "compound", secs: 11, parts: ["rain", "bow"], word: "rainbow", by: "child", lines: ["fm_rainbow_q"], after: "fm_rainbow" },
      { kind: "compound", secs: 11, parts: ["snow", "man"], word: "snowman", by: "child", lines: ["fm_snowman_q"], after: "fm_snowman" },
      { kind: "done", secs: 3, line: "fm_l2_done" },
    ],
  },

  // ---------------------------------------------------------------- W5 (ears): I'll say the sounds, you listen for the word
  W5: {
    key: "W5", title: "Ninja Ears: sounds to words", kind: "ears", targetS: 85, capS: 100,
    stickers: ["mop", "cap", "bug", "fan", "man", "jug", "bun", "bus"],
    beats: [
      { kind: "hello", secs: 3, line: "fm_l1_hello", cards: [] },
      {
        kind: "sounds", secs: 70,
        demo: { target: "sun", options: ["sun", "dog"] },
        items: [
          { target: "map", options: ["map", "mop", "man"] },
          { target: "cat", options: ["cat", "cap", "bag"] },
          { target: "bug", options: ["bug", "bag", "bun"] },
          { target: "fan", options: ["fan", "van", "man"] },
          { target: "jug", options: ["jug", "mug", "bug"] },
          { target: "bus", options: ["bus", "bun", "sun"] },
        ],
      },
      { kind: "done", secs: 4, line: "fm_l5_done" },
    ],
  },

  // ---------------------------------------------------------------- W6 (picread): sound dots, tapped this way
  W6: {
    key: "W6", title: "Ninjas Read This Way: sound dots", kind: "picread", targetS: 70, capS: 85,
    stickers: [],
    beats: [
      { kind: "dots", secs: 60, demo: "sun", words: ["cat", "dog", "mug"] },
      { kind: "done", secs: 4, line: "fm_l6_done" },
    ],
  },
};

/** The script for a warm-up stone, in the child's band's version. */
export function warmupScript(key: string, band?: string): Warmup & { version: "W" | "R" } {
  const w = WARMUPS[key];
  const r = band === "R" ? w.school?.R : undefined;
  return r ? { ...w, ...(w.schoolBudget?.R ?? {}), beats: r, version: "R" } : { ...w, version: "W" };
}

// ---------------------------------------------------------------- the time governor (§3 rule 10)
/** The target clock at the start of beat `i`: the planned seconds of every beat before it that every child plays. */
export const clockAt = (beats: Beat[], i: number) => beats.slice(0, i).filter((b) => !b.optional).reduce((t, b) => t + b.secs, 0);
/** An optional beat (◇) is skipped when the lesson is more than 5 s behind its target clock as the beat starts, or when
 *  playing it would carry the lesson past its target (what is left for every child, plus this beat). The beat secs are
 *  what a quick child takes, so a lesson projected past its target will run long for a real child. */
export function skipOptional(beats: Beat[], i: number, elapsedS: number, targetS = Infinity): boolean {
  const b = beats[i];
  if (!b.optional) return false;
  const rest = beats.slice(i + 1).filter((x) => !x.optional).reduce((t, x) => t + x.secs, 0);
  return elapsedS > clockAt(beats, i) + 5 || elapsedS + b.secs + rest > targetS;
}
/** A demo the lesson can do without is dropped when the lesson is behind: the which-did-I-read demo (it re-reads a
 *  pair the child has just heard read both ways), when what is left for every child, from this beat on, would carry
 *  the lesson more than 5 s past its target. */
export function skipDemo(beats: Beat[], i: number, elapsedS: number, targetS = Infinity): boolean {
  const b = beats[i];
  if (b.kind !== "which" || !b.demo) return false;
  const rest = beats.slice(i).filter((x) => !x.optional).reduce((t, x) => t + x.secs, 0);
  return elapsedS + rest > targetS + 5;
}
/** Past the hard cap: the child still gets their turn, then the paw finishes the current beat and the lesson closes. */
export const overCap = (w: Pick<Warmup, "capS">, elapsedS: number) => elapsedS >= w.capS;
/** Beads: one per child activity, and the sticker as the last bead (§3 rule 9). */
export const CHILD_KINDS: BeatKind[] = ["tap", "slowpick", "tapall", "rail", "which", "compound", "sounds", "dots"];
export const beadsOf = (beats: Beat[]) =>
  beats.map((b, i) => ({ i, b })).filter(({ b }) => CHILD_KINDS.includes(b.kind) && (b.kind !== "rail" || b.by === "child") && (b.kind !== "compound" || b.by === "child") || (b.kind === "fastslow" && b.by === "child"));

// ---------------------------------------------------------------- "Let me show you!" / "Now you try!"
/** The phase lines, alternating with their variants so two demos in a lesson don't sound the same. */
export const showLine = (n: number) => (n % 2 === 0 ? "fm_show_me" : "fm_show_me_2");
export const tryLine = (n: number) => (n % 2 === 0 ? "fm_you_try" : "fm_you_try_2");

// ---------------------------------------------------------------- clips
const HAS = new Set(LINES.map((l) => l.id));
export const hasLine = (id: string) => HAS.has(id);
/** "This is a sock." (a whole recorded sentence, or nothing: never "This is a" + [sock]) */
export const nameLine = (w: string): string | null => (HAS.has(`fm_name_${w}`) ? `fm_name_${w}` : null);
/** "Moon starts with a different sound." / "Sun doesn't have that sound in it." */
export const diffLine = (w: string, how: "start" | "in"): string | null => {
  const id = how === "start" ? `fm_diff_${w}` : `fm_not_in_${w}`;
  return HAS.has(id) ? id : null;
};
/** The word stretched ("sssuuunnn"), or the plain word if there is no stretched clip. */
export const stretch = (w: string): Say => ({ stretch: w });
export const plain = (w: string): Say => ({ word: w });
/** The held first sound ("sssun", public/a/o/): audio.ts falls back to the stretched word, then the plain word (§12). */
export const onset = (w: string): Say => ({ onset: w });
/** Does this word have a stretched recording? (only those are said slowly) */
export const canStretch = (w: string) => STRETCHED.has(w);
/** The sound-by-sound segments of a picture word, for the sound dots (decodable words, and oral words with `segs`). */
export const segsOf = (w: string): Seg[] => WORD_BY_TEXT[w]?.segs ?? ORAL_WORDS[w]?.segs?.map((p) => ({ g: PHONEMES[p].label, p })) ?? [];

/** When each word starts inside a multi-word clip: src/content/word-times.ts (audio.ts wordTimes() reads it too). */
export { WORD_TIMES } from "./word-times";

// ---------------------------------------------------------------- pace across the warm-ups (§10)
export interface Score { first: number; total: number }
/** Under 50% in two warm-ups in a row: the next lesson repeats the last one ("Let's practise that again!"). */
export const needsRepeat = (last2: Score[]) => last2.length === 2 && last2.every((s) => s.total > 0 && s.first / s.total < 0.5);
/** 90% or more across three warm-ups: W4 and W5 are skipped ("You're a super listener!"). */
export const superListener = (last3: Score[]) => {
  const f = last3.reduce((a, s) => a + s.first, 0), t = last3.reduce((a, s) => a + s.total, 0);
  return last3.length === 3 && t > 0 && f / t >= 0.9;
};
/** Within a lesson (W3 on): choices grow 2 → 3 → 4 after two first-try answers in a row, and go back to 2 after a miss. */
export const choicesAfter = (n: number, run: number, missed: boolean) => (missed ? 2 : run >= 2 ? Math.min(4, n + 1) : n);

/** Every picture the warm-ups show (for the picture parade, ?scene=picparade, and the picture audit). */
export function warmupPictures(): string[] {
  const out = new Set<string>();
  const add = (ws: (string | undefined)[]) => ws.forEach((w) => w && out.add(w));
  for (const w of Object.values(WARMUPS))
    for (const b of [...w.beats, ...(w.school?.R ?? [])]) {
      if (b.kind === "hello" || b.kind === "name") add(b.cards);
      else if (b.kind === "tap") add([...b.options, b.demo?.target]);
      else if (b.kind === "slowpick") add(b.options);
      else if (b.kind === "notice") add(b.words);
      else if (b.kind === "tapall") add(b.cards);
      else if (b.kind === "rail" || b.kind === "swap") add([...b.cards, b.merge]);
      else if (b.kind === "which") add([...b.pick.rails.flat(), ...(b.demo?.rails.flat() ?? [])]);
      else if (b.kind === "compound") add([...b.parts, b.word]);
      else if (b.kind === "sounds") add([...b.demo.options, ...b.items.flatMap((i) => i.options)]);
      else if (b.kind === "dots") add([b.demo, ...b.words]);
    }
  return [...out];
}
