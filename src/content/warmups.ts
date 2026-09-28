// The warm-ups (docs/FIRST_MINUTES.md §5, §7, §9, §10): game-only lessons before Initial Code Unit 1, as data. The
// scenes (src/scenes/Warmup.tsx) only play these beats, so the architecture work (src/core) can read the same scripts.
//
// Since 27 Sep every beat is one game of the teacher's voice (docs/TEACHER_SCRIPT.md §3.5–§3.12, the registry in
// src/content/games.ts): the game is framed (who does what), Sensei does one in the first person while the paw moves,
// a Ready hold asks the child whether they want a go (▶ = ready, the paw = show me again), and the child's turn is the
// demo in the child's words. Which of that plays is the game's form for this child (full, recap, short or none:
// narrate.tsx gameForm), so the beats hold only what is on the board; the lines are the registry's. Nothing moves on by
// itself (docs/NAVIGATION.md): a demo leads into the Ready hold, which waits for the child.
//
// Lines are Sensei's whole recorded sentences (src/content/lines.ts); only pure sounds, words, slow words (the word's
// sounds with little gaps, public/a/x) and held first sounds are spliced in, after a lead-in that ends on "..." (§12).
import type { Say } from "../engine/audio";
import type { GameId } from "./games";
import type { PhonemeId, Seg } from "./phonics";
import { WORD_BY_TEXT, ORAL_WORDS, PHONEMES } from "./phonics";
import { LINES } from "./lines";
import { STRETCHED, HELD_ONSET } from "./stretch";

// ---------------------------------------------------------------- beats
export type Beat = { optional?: true; secs: number } & (
  /** Ninja Ears (`tap`, TEACHER_SCRIPT §3.5 A): the cards drop in; the paw finds `demo` ("My word is sun… There it
   *  is!"), then the child finds `target` ("Your word is sock. Can you find the sock?") */
  | { kind: "tap"; cards: string[]; demo: string; target: string }
  /** the rabbit and the tortoise (`fastslow`, §3.5 B, §3.9 A): Sensei's show on `word`, then the child taps the tortoise
   *  (the slow way) and the rabbit (the fast way). The rabbit is compulsory (T9): its tap splits the talk */
  | { kind: "fastslow"; word: string }
  /** Slow Words (`slowpick`, §3.9 B): Sensei's slow word (the paw finds `demo`), then the child's (`target`) */
  | { kind: "slowpick"; demo: string; target: string; options: string[] }
  /** ninja ears, the first sound (`notice`, §3.5 C): the child taps each card to hear how it starts, then meets the
   *  sound's petal and taps it */
  | { kind: "notice"; p: PhonemeId; words: [string, string] }
  /** Pocket Hunt (`tapall`, `tapall:in`: §3.5 D, §3.9 C–D): find the pictures that start with /p/ (or have it in the
   *  middle); the paw finds `demo` first on the full and recap forms. `spell`: Reception writes the spelling (§4.8) */
  | { kind: "tapall"; how: "start" | "in"; p: PhonemeId; cards: string[]; targets: string[]; demo: string; spell?: true }
  /** Ninja Reading (`rail`, §3.7 A, §3.10): Sensei reads the pictures (a light under each; `line`), then the child taps
   *  them the ninja way; `merge`: they bump into one picture (Sensei's with her line, the child's with `after`) */
  | { kind: "rail"; cards: string[]; line: string; merge?: string; after?: string; silly?: true }
  /** the pictures swap places (a show, §3.7 B), then a held step: "When you're ready for the next game…" */
  | { kind: "swap"; cards: string[]; line: string; merge?: string }
  /** two rows (`which`, §3.7 C): the canonical fish–dog demo (WHICH_DEMO), then "Which row did I read?" on `rows`.
   *  Since 27 Sep (fix round 1) it is first met in W4: W2 no longer plays it (TEACHER_SCRIPT §10.1 retires it) */
  | { kind: "which"; rows: [string[], string[]]; answer: 0 | 1 }
  /** Word Squish (`compound`, §3.7 D): the canonical sunflower demo (SQUISH_DEMO), then the child squishes `parts` with
   *  the rabbit (`q`: "Star… fish. Tap the rabbit, and say them fast."; `after`: "Starfish!"). The full form holds on
   *  "Tap the green arrow, and let's begin." after its frame (a held step, not a Ready), so the child's ▶ splits the
   *  frame from the demo */
  | { kind: "compound"; parts: [string, string]; word: string; q: string; after: string; via?: "star" }
  /** Guess My Word (`sounds`, §3.11): Sensei says the sounds, the child listens for the word. `options` grow 2 → 3 */
  | { kind: "sounds"; demo: { target: string; options: string[] }; items: { target: string; options: string[] }[] }
  /** Sound Dots (`dots`, §3.12): sound dots under a picture, tapped left to right like sound buttons */
  | { kind: "dots"; demo: string; words: string[] }
  /** every bead lit; the closing lines (§5.6); the ninja celebrates */
  | { kind: "done"; lines: string[] }
);
export type BeatKind = Beat["kind"];

/** The two rows' canonical demo (§3.7 C, §4.1: the paw's demo on a recap or short form uses its own rows). */
export const WHICH_DEMO: { rows: [string[], string[]]; answer: 0 } = { rows: [["fish", "dog"], ["dog", "fish"]], answer: 0 };
/** Word Squish's canonical demo: the sunflower on its own cards (`tv_squish_slow` · `tv_squish_fast`). */
export const SQUISH_DEMO: { parts: [string, string]; word: string } = { parts: ["sun", "flower"], word: "sunflower" };

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

// (beat secs: what a quick child takes on the first meeting, measured with the perfect bot on a frozen build on 27 Sep
// (TV-C2.4: continuous.ts from a new child, one session, the Ready answered on ▶; playtest/fix/C2/beat-times.txt); the
// governor plans with them. A later session's recap or short form is shorter, so a returning child is never behind for
// it. Targets are the quick child's lesson; caps leave 15 s for a slower one.)
export const WARMUPS: Record<string, Warmup> = {
  // ---------------------------------------------------------------- W1 Ninja Ears (TEACHER_SCRIPT §3.5)
  W1: {
    // (target 115 s, cap 130: four framed games with a Ready each, and the child's 11 taps, where the old lesson had 5:
    // mechanics §5.4, TEACHER_SCRIPT §6 "What it costs"; the extra time is the child's own turns. Measured: 114.5 s)
    key: "W1", title: "Ninja Ears", kind: "ears", targetS: 115, capS: 130,
    stickers: ["sun", "sock", "cat", "sausage", "moon"], list: "fm_rw1_list",
    beats: [
      { kind: "tap", secs: 19, cards: ROW3, demo: "sun", target: "sock" },
      { kind: "fastslow", secs: 30, word: "sun" },
      { kind: "notice", secs: 35, p: "s", words: ["sun", "sock"] },
      { kind: "tapall", secs: 26, how: "start", p: "s", cards: ["sun", "sausage", "moon", "sock", "cat"], targets: ["sun", "sock", "sausage"], demo: "sun" },
      { kind: "done", secs: 5, lines: ["tv_w1_end"] },
    ],
    school: {
      // Reception (autumn): Slow Words' full form on the W1 cards, and each /s/ find writes how we write /s/ (§4.8)
      R: [
        { kind: "tap", secs: 19, cards: ROW3, demo: "sun", target: "sock" },
        { kind: "fastslow", secs: 30, word: "sun" },
        { kind: "slowpick", secs: 30, demo: "sun", target: "cat", options: ROW3 },
        { kind: "notice", secs: 35, p: "s", words: ["sun", "sock"] },
        { kind: "tapall", secs: 31, how: "start", p: "s", cards: ["sun", "sausage", "moon", "sock", "cat"], targets: ["sun", "sock", "sausage"], demo: "sun", spell: true },
        { kind: "done", secs: 5, lines: ["tv_w1_end"] },
      ],
    },
    // (Reception measured 146 s for a quick child)
    schoolBudget: { R: { targetS: 150, capS: 165 } },
  },

  // ---------------------------------------------------------------- W2 Ninja Reading (§3.7)
  W2: {
    // (fix round 1, 27 Sep: the first session ran 7:00 to the map for a quick child, and W2 92 s against FIRST_MINUTES
    // §14's 75 s cap. W2 is always the first session's second lesson, so the interim trim is W2's: the two rows (`which`)
    // leave it and are first met in W4, and the target is low enough that the governor always drops the swap ◇ and the
    // quick Pocket Hunt ◇ here. TEACHER_SCRIPT §10.1 retires the swap and the two rows anyway, when picture reading v2
    // is wired in (docs/QUEUE.md 0b). Measured after the trim (first-minutes.ts on a frozen build, playtest/runs/fix/
    // C2-v1): 57 s on the lesson clock for a quick child, 65 s for the learner (were 89 and 91); W2 no longer
    // passes 75 s, and the title to the map is 60–90 s shorter.)
    key: "W2", title: "Ninjas Read This Way", kind: "picread", targetS: 60, capS: 75,
    // Reception's middle-sound Pocket Hunt on /a/, with < a > written on cat's middle line, adds about 46 s (measured
    // after the trim: 107 s for a quick child, was 133 s; first-minutes --optin R, playtest/runs/fix/C2-v1)
    schoolBudget: { R: { targetS: 110, capS: 125 } },
    stickers: ["fish", "dog", "flower", "sunflower", "star", "starfish"], list: "fm_rw2_list", shiny: "fishdog",
    beats: [
      { kind: "rail", secs: 23, cards: ["fish", "dog"], line: "fm_read_fish_dog", merge: "fishdog", after: "fm_pair_fish_dog", silly: true },
      // (◇: dropped on the first session, where the lesson is always past its target here; a replay may play it)
      { kind: "swap", secs: 9, cards: ["dog", "fish"], line: "fm_l2_swap", merge: "dogfish", optional: true },
      { kind: "compound", secs: 29, parts: ["star", "fish"], word: "starfish", q: "fm_starfish_q", after: "fm_starfish", via: "star" },
      { kind: "tapall", secs: 17, optional: true, how: "start", p: "s", cards: ["sunflower", "sock", "fish", "dog"], targets: ["sunflower", "sock"], demo: "sock" },
      { kind: "done", secs: 10, lines: ["fm_l2_done", "tv_rw_link_book"] },
    ],
    school: {
      // Reception: the last beat is the middle-sound Pocket Hunt on /a/, with < a > written on cat's middle line (§4.8)
      R: [
        { kind: "rail", secs: 23, cards: ["fish", "dog"], line: "fm_read_fish_dog", merge: "fishdog", after: "fm_pair_fish_dog", silly: true },
        { kind: "swap", secs: 9, cards: ["dog", "fish"], line: "fm_l2_swap", merge: "dogfish", optional: true },
        { kind: "compound", secs: 29, parts: ["star", "fish"], word: "starfish", q: "fm_starfish_q", after: "fm_starfish", via: "star" },
        { kind: "tapall", secs: 46, how: "in", p: "a", cards: ["cat", "bag", "jam", "sun", "dog"], targets: ["cat", "bag", "jam"], demo: "cat", spell: true },
        { kind: "done", secs: 10, lines: ["fm_l2_done", "tv_rw_link_book"] },
      ],
    },
  },

  // ---------------------------------------------------------------- W3 (ears): fast/slow on mug, Slow Words, /a/ in the middle, /m/ first
  W3: {
    // (target 135 s, cap 150: two first meetings (Slow Words, the middle), two new petals tapped, and Move 1's rabbit;
    // measured 132 s with the paw finishing the /m/ hunt at the old 130 s cap)
    key: "W3", title: "Ninja Ears: in and first", kind: "ears", targetS: 135, capS: 150,
    stickers: ["mug", "bag", "jam", "van", "map"],
    beats: [
      { kind: "fastslow", secs: 23, word: "mug" },
      { kind: "slowpick", secs: 35, demo: "mug", target: "van", options: ["mug", "van", "bag"] },
      { kind: "tapall", secs: 44, how: "in", p: "a", cards: ["cat", "bag", "jam", "van", "sun", "dog"], targets: ["cat", "bag", "jam", "van"], demo: "cat" },
      // (◇: a quick child plays it; a slower one would meet the cap in it, and meets /m/ in First Sounds instead)
      { kind: "tapall", secs: 27, optional: true, how: "start", p: "m", cards: ["mug", "moon", "map", "sun", "cat"], targets: ["mug", "moon", "map"], demo: "mug" },
      { kind: "done", secs: 5, lines: ["tv_w3_done"] },
    ],
  },

  // ---------------------------------------------------------------- W4 (picread): three in a row, which, picture words
  W4: {
    // (target 95, cap 110, was 85/100: the two rows are first met here since fix round 1, with their frame, the fish–dog
    // demo and a Ready, about 9 s more; the learner's W4 took 100 s in playtest/runs/fix/C2-v1/transcripts)
    key: "W4", title: "Ninjas Read This Way: three in a row", kind: "picread", targetS: 95, capS: 110,
    stickers: ["rainbow", "snowman"],
    beats: [
      { kind: "rail", secs: 19, cards: ["cat", "dog", "fish"], line: "fm_read_cat_dog_fish", after: "fm_triple_cat_dog_fish" },
      { kind: "swap", secs: 7, cards: ["fish", "dog", "cat"], line: "fm_l4_swap" },
      // (the two rows' first meeting since fix round 1: its full form, with the fish–dog demo and a Ready)
      { kind: "which", secs: 27, rows: [["fish", "dog", "cat"], ["cat", "dog", "fish"]], answer: 0 },
      // two more picture words, made by the child (§10): rain + bow, snow + man
      { kind: "compound", secs: 21, parts: ["rain", "bow"], word: "rainbow", q: "fm_rainbow_q", after: "fm_rainbow" },
      { kind: "compound", secs: 15, parts: ["snow", "man"], word: "snowman", q: "fm_snowman_q", after: "fm_snowman" },
      { kind: "done", secs: 4, lines: ["tv_w4_done"] },
    ],
  },

  // ---------------------------------------------------------------- W5 (ears): Guess My Word
  W5: {
    // (measured 89 s in the first session's order, 98 s for a child who starts at W5, with every picture new)
    key: "W5", title: "Ninja Ears: sounds to words", kind: "ears", targetS: 95, capS: 115,
    stickers: ["mop", "cap", "bug", "fan", "man", "jug", "bun", "bus"],
    beats: [
      {
        kind: "sounds", secs: 86,
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
      { kind: "done", secs: 7, lines: ["tv_w5_done", "t_if_you_say_sounds"] },
    ],
  },

  // ---------------------------------------------------------------- W6 (picread): Sound Dots
  W6: {
    // (bus, not dog: the /d/ petal's picture is a dog, and it would sit under the dog card: SOUND_DISPLAY A12)
    key: "W6", title: "Ninjas Read This Way: sound dots", kind: "picread", targetS: 50, capS: 80,
    stickers: [],
    beats: [
      { kind: "dots", secs: 45, demo: "sun", words: ["cat", "bus", "mug"] },
      { kind: "done", secs: 4, lines: ["fm_l6_done"] },
    ],
  },
};

/** The script for a warm-up stone, in the child's band's version. */
export function warmupScript(key: string, band?: string): Warmup & { version: "W" | "R" } {
  const w = WARMUPS[key];
  const r = band === "R" ? w.school?.R : undefined;
  return r ? { ...w, ...w.schoolBudget?.R, beats: r, version: "R" } : { ...w, version: "W" };
}

/** The game a beat plays (TEACHER_SCRIPT §2.6's ids, src/content/games.ts): a swap and the close are not games. */
export function gameOf(b: Beat): GameId | null {
  switch (b.kind) {
    case "tapall":
      return b.how === "in" ? "tapall:in" : "tapall";
    case "swap":
    case "done":
      return null;
    default:
      return b.kind;
  }
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
/** A demo the lesson can do without is dropped when the lesson is behind: the two rows' demo on a recap (a first meeting
 *  always has its demo: mechanics §5.4), when what is left for every child, from this beat on, would carry the lesson
 *  more than 5 s past its target. */
export function skipDemo(beats: Beat[], i: number, elapsedS: number, targetS = Infinity): boolean {
  const b = beats[i];
  if (b.kind !== "which") return false;
  const rest = beats.slice(i).filter((x) => !x.optional).reduce((t, x) => t + x.secs, 0);
  return elapsedS + rest > targetS + 5;
}
/** Past the hard cap: the child still gets their turn, then the paw finishes the current beat and the lesson closes. */
export const overCap = (w: Pick<Warmup, "capS">, elapsedS: number) => elapsedS >= w.capS;
/** Beads (§3 rule 9): one per thing the child does, with the sticker as the last bead. The rabbit and the tortoise are
 *  two taps; Guess My Word and Sound Dots one per word. */
export const beadsIn = (b: Beat): number =>
  b.kind === "fastslow" ? 2 : b.kind === "sounds" ? b.items.length : b.kind === "dots" ? b.words.length : b.kind === "swap" || b.kind === "done" ? 0 : 1;
export const beadCount = (beats: Beat[]) => beats.reduce((n, b) => n + beadsIn(b), 0);

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
/** The slow way: the word's pure sounds with little gaps (public/a/x, "s · u · n"; TEACHER_SCRIPT §9.1). */
export const stretch = (w: string): Say => ({ stretch: w });
export const plain = (w: string): Say => ({ word: w });
/** The held first sound ("sssun", public/a/o/). Only for the words that have one: anywhere else audio.ts would fall back
 *  to the slow way, which says the first sound on its own and so gives a first-sound question away (FS1). */
export const onset = (w: string): Say => ({ onset: w });
export const heldOnset = (w: string) => HELD_ONSET.has(w);
/** How a first-sound hunt says a card: its held first sound where there is one, else the plain word (never the slow way). */
export const firstSay = (w: string): Say => (heldOnset(w) ? onset(w) : plain(w));
/** Does this word have a slow way (public/a/x)? (Every word with a segmentation, since 27 Sep.) */
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
      if (b.kind === "tap") add(b.cards);
      else if (b.kind === "fastslow") add([b.word]);
      else if (b.kind === "slowpick") add(b.options);
      else if (b.kind === "notice") add(b.words);
      else if (b.kind === "tapall") add(b.cards);
      else if (b.kind === "rail" || b.kind === "swap") add([...b.cards, b.merge]);
      else if (b.kind === "which") add([...b.rows.flat(), ...WHICH_DEMO.rows.flat()]);
      else if (b.kind === "compound") add([...b.parts, b.word, ...SQUISH_DEMO.parts, SQUISH_DEMO.word]);
      else if (b.kind === "sounds") add([...b.demo.options, ...b.items.flatMap((i) => i.options)]);
      else if (b.kind === "dots") add([b.demo, ...b.words]);
    }
  return [...out];
}
