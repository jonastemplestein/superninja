// Feedback every game shares, the Sounds~Write way (docs/PEDAGOGY.md, docs/TEACHER_SCRIPT.md §5.3–§5.4): the correction
// for a wrong spelling, and praise. Never letter names; never "No", "Wrong" or a buzzer.
import { GRAPHEMES, WORD_BY_TEXT, type PhonemeId, type Seg } from "../content/phonics";
import { LISTEN_AGAIN, LISTEN_FALLBACK, lettersLine, praiseDue, rotate, splitsSpelling } from "../content/narrative";
import { GAMES, type GameId } from "../content/games";
import { LINES } from "../content/lines";
import { STRETCHED } from "../content/stretch";
import type { Say, SoundAt } from "./audio";
import { speak } from "./speech";

const HAS = new Set(LINES.map((l) => l.id));
const has = (id: string) => HAS.has(id);

/** The "listen again" lead of a correction, rotated with whole-sentence alternatives, so a learner who misses often
 *  doesn't hear one sentence over and over (NARRATIVE_AUDIT: listen_here was heard 207 times in the learner journey).
 *  Every game shares it. The plain set goes with the plain word (a spelling slip, FS1: the child segments it); `slow`
 *  adds "Let's listen to the word again, slowly." to the rotation, for a lead followed by the slow word, which since
 *  27 Sep is the word's sounds with little gaps (only for a word that has one). A lead whose audio isn't recorded yet
 *  (`tv_listen_here`) plays its older line. */
let lastListen: string | null = null;
/** "Let's listen again. What sound comes next?" asks about a later sound: never for the word's first sound. */
const NEXT_LEAD = "audit_listen_next";
export function listenLead(word: string, o: { slow?: boolean; first?: boolean } = {}): string {
  const all: readonly string[] = o.slow && STRETCHED.has(word) ? LISTEN_AGAIN.stretched : LISTEN_AGAIN.plain;
  const list = o.first ? all.filter((id) => id !== NEXT_LEAD) : all;
  lastListen = rotate(list, lastListen);
  return has(lastListen) ? lastListen : LISTEN_FALLBACK[lastListen] ?? lastListen;
}
/** Could the child be on the word's first sound (its first spelling is the one needed)? Then a lead mustn't ask for
 *  "the next sound" (verify round 1: "What's the first sound?" · a miss · "…What sound comes next?"). */
const mayBeFirst = (word: string, need: Pick<Seg, "g" | "p">) => {
  const s0 = WORD_BY_TEXT[word]?.segs[0];
  return !s0 || (s0.g === need.g && s0.p === need.p);
};
/** Is this line one of the rotating "listen again" leads (or a fallback for one)? */
export const isListenLead = (id: string) => ([...LISTEN_AGAIN.stretched, ...LISTEN_AGAIN.plain] as readonly string[]).includes(id) || Object.values(LISTEN_FALLBACK).includes(id);

/** Where a correction's petals pop (FIX_PLAN §3.3): the wrong tile, and the slot the child is filling. `pos`: which of
 *  the word's sounds the child is on (slotPosition), so the first miss asks about that one. */
export interface CorrectionAt { wrong?: SoundAt; slot?: SoundAt; pos?: SlotPosition | null }

/** A sound's place in the word, as the build questions name it ("What's the first / next / last sound?"). */
export type SlotPosition = "first" | "next" | "last";
/** Which of the word's sounds the child is spelling: slot `i` when the caller knows it, else the one slot that needs
 *  this spelling (null when the word has it twice, "dad", or isn't known). */
export function slotPosition(word: string, need: Pick<Seg, "g" | "p">, i?: number): SlotPosition | null {
  const segs = WORD_BY_TEXT[word]?.segs;
  if (!segs?.length) return null;
  let at = i ?? -1;
  if (i === undefined) {
    const all = segs.flatMap((s, j) => (s.g === need.g && s.p === need.p ? [j] : []));
    if (all.length !== 1) return null;
    at = all[0];
  }
  if (at < 0 || at >= segs.length) return null;
  return at === 0 ? "first" : at === segs.length - 1 ? "last" : "next";
}
/** The first miss when the child's place in the word is known (pre-ship fix, 28 Sep: "What's the last sound?" · a miss
 *  · "Let's listen again. What sound comes next?"): "Let's listen to the word again." · "What's the last sound in mat?"
 *  (the w_position_q template; until its clip, "What's the last sound?" · mat). The same question the child was asked,
 *  with the PLAIN word (FS1: the child segments it). Until `tv_listen_word_again` is recorded, the rotating lead that
 *  never names a place ("Let's listen again. What can you hear here?" · mat): the bare question straight after the
 *  same question sounded like a stuck record in the transcript. */
export function positionCorrection(word: string, pos: SlotPosition): Say[] {
  if (!has("tv_listen_word_again")) return [{ line: listenLead(word, { first: true }) }, { gap: 150 }, { word }];
  return [{ line: "tv_listen_word_again" }, { gap: 250 }, ...speak("w_position_q", { pos, word })];
}
const petal = (p: PhonemeId, at?: SoundAt): Say => ({ sound: p, show: "petal", ...(at ? { at } : {}) });

/** Correction for a wrong spelling: never do the segmenting for the child (TEACHER_SCRIPT §5.4).
 *  - The same sound, another spelling → say so; that's about spelling, not listening.
 *  - A tile that splits a two-letter spelling (< s > for < sh >) → the Sounds~Write correction is about the spelling:
 *    "That's… /s/ We need… /sh/ It's two letters, but it's one sound." (SCRIPT_FIXES C5), on any miss. Callers reveal
 *    and glow the right tile for it on the first miss.
 *  - 1st miss → back to listening: "Let's listen again. What can you hear here?" and the PLAIN word. Since 27 Sep the
 *    slow word is the word's sounds with little gaps, which would do the segmenting (FS1, docs/DECISIONS.md). With
 *    `at.pos` (the child's place in the word), the question names it: positionCorrection.
 *  - 2nd miss → show: "That's… /s/ We need… /m/ It's this one. Say the sound as you put it on the line." (callers also
 *    glow the right tile).
 *  Every sound is a petal: the wrong one pops above the tapped tile, the needed one above the slot. */
export function correction(g: string, need: Seg, word: string, attempt: number, at: CorrectionAt = {}): Say[] {
  if (GRAPHEMES[g] === need.p) return [{ line: "same_sound_spelling" }, { gap: 100 }, petal(need.p, at.slot)];
  if (splitsSpelling(g, need)) {
    const letters = lettersLine(need);
    return [{ line: "thats" }, petal(GRAPHEMES[g] ?? need.p, at.wrong), { gap: 200 }, { line: "we_need" }, petal(need.p, at.slot), ...(letters ? [{ gap: 250 }, { line: letters }] : [])];
  }
  if (attempt <= 1) {
    if (at.pos) return positionCorrection(word, at.pos);
    return [{ line: listenLead(word, { first: mayBeFirst(word, need) }) }, { gap: 150 }, { word }];
  }
  return [{ line: "thats" }, petal(GRAPHEMES[g], at.wrong), { gap: 200 }, { line: "we_need" }, petal(need.p, at.slot), { gap: 300 }, { line: "its_this_one" }];
}

/** What a picture game knows about a wrong tap (TEACHER_SCRIPT §5.4). */
export interface Miss {
  game: GameId;
  /** the tapped card's word (or tile's spelling, lantern's word) */
  tapped: string;
  /** the answer's word */
  target: string;
  /** 1 = the first miss on this item */
  attempt: number;
  /** the sound the game is about (First Sounds, Pocket Hunt, Sound Hunt, Ninja Eyes) */
  p?: PhonemeId;
  /** the target word's sounds (Guess My Word, Ninja Run: said as neutral dots, Dec1) */
  segs?: Seg[];
  /** two rows: the rows' words, joined ("cat_dog", "fish_dog_cat") */
  pair?: string;
  /** where the petal pops (the nav row's petal when unset); Ninja Eyes: the tapped tile */
  at?: SoundAt;
}
/**
 * A picture game's gentle correction (TEACHER_SCRIPT §5.4): the tapped card says its own word (`echo`: its word, held
 * first sound or stretched word, for a scene whose card doesn't speak by itself); then Sensei rephrases, ends on the
 * answer and hands the turn back (`say`). The first miss goes back to listening; the second is "Let's do it together.
 * It's this one. Now you tap it." (the scene glows the answer and the paw points). Never "No" or "Wrong". A line that
 * isn't recorded yet is left out (the older "It's this one!" stands in for the second miss).
 */
export function pictureCorrection(m: Miss): { echo: Say[]; say: Say[] } {
  const L = (id: string): Say[] => (has(id) ? [{ line: id }] : []);
  const pop = (): Say[] => (m.p ? [petal(m.p, m.at)] : []);
  const hidden = (): Say[] => (m.segs?.length ? [{ sounds: m.segs, show: "hidden" }] : []);
  const word: Say[] = [{ word: m.tapped }];
  if (m.attempt >= 2 && ["tap", "slowpick", "sounds", "firstsound", "tapall", "tapall:in", "soundhunt"].includes(m.game)) {
    const echo = m.game === "firstsound" || m.game === "tapall" ? [{ onset: m.tapped } as Say] : m.game === "tapall:in" || m.game === "soundhunt" ? [{ stretch: m.tapped } as Say] : word;
    return { echo, say: has("tv_fix_together") ? L("tv_fix_together") : L("fm_its_this") };
  }
  switch (m.game) {
    case "tap":
      return { echo: word, say: L(`tv_find_again_${m.target}`) };
    case "slowpick":
      return { echo: word, say: [...L("tv_slow_again"), { gap: 120 }, { stretch: m.target }] };
    case "sounds":
      return { echo: word, say: [...L("tv_guess_again"), { gap: 150 }, ...hidden()] };
    case "firstsound":
    case "tapall":
      return { echo: [{ onset: m.tapped }], say: [...L(`fm_diff_${m.tapped}`), { gap: 250 }, ...L("tv_fix_start"), { gap: 100 }, ...pop()] };
    case "tapall:in":
      return { echo: [{ stretch: m.tapped }], say: [...L(`fm_not_in_${m.tapped}`), { gap: 250 }, ...L("tv_fix_middle"), { gap: 100 }, ...pop()] };
    case "soundhunt":
      return { echo: [{ stretch: m.tapped }], say: [...L("tv_not_in_middle"), { gap: 250 }, ...L("tv_fix_middle"), { gap: 100 }, ...pop()] };
    case "find":
      // the tapped tile's sound pops above it (`at`); the one we need swells in the nav row
      return { echo: [], say: [...L("tv_thats_write"), { gap: 80 }, petal(GRAPHEMES[m.tapped] ?? (m.p as PhonemeId), m.at), { gap: 250 }, ...L("we_need"), ...(m.p ? [petal(m.p)] : [])] };
    case "run":
      return { echo: [], say: [...L("tv_run_fix"), { gap: 120 }, ...hidden()] };
    case "rail":
    case "dots":
      return { echo: [], say: L("tv_rail_start") };
    case "which":
      return { echo: [], say: m.pair ? L(`tv_which_fix_${m.pair}`) : [] };
    case "sort":
      return { echo: [], say: L("tv_sort_fix") };
    default:
      return { echo: word, say: [] };
  }
}

// ---------------------------------------------------------------- praise
/** Everyday praise (TEACHER_SCRIPT §5.3): calm, generic words. "Fantastic!", "Amazing!", "Smashing!" and "Ace!" are
 *  kept for rewards (REWARD_PRAISE); yay_6 "Ninja power!" is the streak's own tier-up line (streak_3). */
export const PRAISE_EVERYDAY = ["yay_1", "yay_2", "yay_4", "yay_8", "tv_yay_lovely", "tv_yay_thats_it"] as const;
/** Big praise, one at a time, for rewards only. */
export const REWARD_PRAISE = ["yay_3", "yay_5", "yay_9", "yay_10"] as const;
/** Praise after a miss on the same item, and after help (any game). */
export const PRAISE_KEPT_GOING = "tv_praise_kept_going";
export const PRAISE_HELPED = "tv_praise_helped";
/** A specific line is said at most this many times in one level (so a long level doesn't hear it five times; in a
 *  level of ten answers, specific and generic lines still take turns). */
export const SPECIFIC_PER_LEVEL = 3;

let lastPraise = "";
const randomOf = (pool: readonly string[], rand: () => number) => pool[Math.floor(rand() * pool.length)];
/** A random everyday praise line, never the same twice in a row (across every game). For the few places that must
 *  praise; after a right answer, use praiseFor(). */
export function pickPraise(): string {
  const pool = PRAISE_EVERYDAY.filter((p) => has(p) && p !== lastPraise);
  return (lastPraise = randomOf(pool.length ? pool : ["yay_1"], Math.random));
}
/** A random reward praise line, never the same twice in a row. */
export function pickRewardPraise(): string {
  const pool = REWARD_PRAISE.filter((p) => has(p) && p !== lastPraise);
  return (lastPraise = randomOf(pool.length ? pool : ["yay_1"], Math.random));
}

/** What praiseFor() needs to know about a right answer. */
export interface PraiseOpts {
  /** a tier line, a reminder or a first-fill explanation spoke for this answer */
  replaced?: boolean;
  /** the level's closing line follows (it is the level's praise) */
  closingNext?: boolean;
  /** praise every `every`-th right answer (1 by default) */
  every?: number;
  /** the game, for its specific praise (TEACHER_SCRIPT §5.3) */
  game?: GameId;
  /** right after a miss on the same item */
  keptGoing?: boolean;
  /** right after help (the glow or the paw) */
  helped?: boolean;
}
/** The praise rhythm's state: right answers since the last praise, the last line, whether it was specific, and how
 *  often each specific line was said this level. */
export interface PraiseState { right: number; last: string | null; lastSpecific: boolean; used: Readonly<Record<string, number>> }
export const freshPraise = (): PraiseState => ({ right: 0, last: null, lastSpecific: false, used: {} });
/**
 * One right answer (pure; praiseFor() keeps the state). A praise line comes after each right answer by default, never
 * when something else spoke for the answer and never straight before the closing line (SCRIPT_FIXES A4). When one is
 * due: "That was a tricky one, and you kept going." after a miss, "Now you've got it." after help; otherwise the
 * game's specific line and a generic one take turns, so generic words are at most half the praise; never the same
 * line twice in a row, a specific line at most SPECIFIC_PER_LEVEL times a level.
 */
export function praiseStep(s: PraiseState, o: PraiseOpts, env: { has: (id: string) => boolean; rand: () => number }): { line: string | null; state: PraiseState } {
  if (!praiseDue({ rightSincePraise: s.right, replaced: o.replaced, closingNext: o.closingNext, every: o.every ?? 1 })) return { line: null, state: { ...s, right: s.right + 1 } };
  const said = (line: string, specific: boolean): { line: string; state: PraiseState } => ({
    line,
    state: { right: 0, last: line, lastSpecific: specific, used: specific ? { ...s.used, [line]: (s.used[line] ?? 0) + 1 } : s.used },
  });
  const special = o.keptGoing ? PRAISE_KEPT_GOING : o.helped ? PRAISE_HELPED : null;
  if (special && env.has(special) && special !== s.last) return said(special, true);
  const specific = (o.game ? GAMES[o.game].praise : []).filter((id) => env.has(id) && id !== s.last && (s.used[id] ?? 0) < SPECIFIC_PER_LEVEL);
  if (specific.length && !s.lastSpecific) {
    // the least used first, in the registry's order
    const least = Math.min(...specific.map((id) => s.used[id] ?? 0));
    return said(specific.find((id) => (s.used[id] ?? 0) === least)!, true);
  }
  const generic = PRAISE_EVERYDAY.filter((id) => env.has(id) && id !== s.last);
  return said(randomOf(generic.length ? generic : ["yay_1"], env.rand), false);
}
let praise = freshPraise();
/** After a right answer: the praise line to say, or null (SCRIPT_FIXES A4, TEACHER_SCRIPT §5.3). Call it once per right
 *  answer, whether or not anything is said, so the rhythm counts every answer. */
export function praiseFor(o: PraiseOpts = {}): string | null {
  const r = praiseStep(praise, { ...o, every: o.every ?? 1 }, { has, rand: Math.random });
  praise = r.state;
  if (r.line) lastPraise = r.line;
  return r.line;
}
/** Another line was this answer's praise (a fast/slow line in the praise slot, narrate.tsx afterWordSay): the rhythm
 *  starts again from it, as if praiseFor() had said it (it counts the answer), and the next praise is a generic one. */
export function praiseBy(line: string) {
  praise = { ...praise, right: 0, last: line, lastSpecific: true };
  lastPraise = line;
}
/** Would praiseFor() praise this answer? (It doesn't count the answer.) */
export const praiseWanted = (o: PraiseOpts = {}): boolean => praiseDue({ rightSincePraise: praise.right, replaced: o.replaced, closingNext: o.closingNext, every: o.every ?? 1 });
/** A new level: the rhythm starts again (narrate.tsx's beginLevel calls it). */
export function resetPraise() {
  praise = freshPraise();
}
