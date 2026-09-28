// The narrative audit's explanations in the level scenes (docs/NARRATIVE_AUDIT.md, playtest/narrative/audit.json):
// which line explains what, when it is due again, and which words and slots it points at. Typed data and small pure
// functions only; the scenes' runtime (the per-save ledger, the pictures that go with the words) is src/scenes/narrate.tsx.
//
// Spacing follows the audit's schedule: a notion is explained where it is first needed, again the next level it comes
// up, then a couple of levels later, and then only at teaching moments (a new spelling's Learn) and on errors. A
// spelling's own teaching moment always explains it. Sounds~Write wording throughout (teach.ts, teacher-language.md):
// spellings spell sounds; "It's two letters, but it's one sound."; "This is 'the', just say 'the' here."
//
// From 26 Sep 2026 (docs/SCRIPT_FIXES.md Part A): the read-back reminders are spaced in SESSIONS, not levels (a child
// plays four or five levels in a sitting), with first/next forms for anything said per item (lettersForm, stemFor,
// fadeForm, afterWord), rationed praise, and the map's and the reward's lines. From 27 Sep (docs/TEACHER_SCRIPT.md
// §2.2): each game type's introduction takes a full, recap, short or no form (frameForm); the registry is games.ts.
import { PHONEMES, type PhonemeId, type Seg, type Word } from "./phonics";

// ---------------------------------------------------------------- spacing
/** Where a notion has been explained: level indices in LEVELS order (one per telling) and, from 26 Sep 2026, the
 *  sessions it fell in (SCRIPT_FIXES A1; an old exposure has no `s`). */
export interface Exposure { n: number; at: number[]; s?: number[] }
/**
 * Spacing schedules: entry k is the smallest number of levels between telling k and telling k+1 (0 = the same level
 * is fine, e.g. the next story page). Past the end the notion is retired (teach moments and errors still explain it).
 */
export const SPACING = {
  /** Sounds~Write concepts (two letters, one sound; one spelling, two sounds): where first needed, the next level it
   *  comes up, then two levels on */
  concept: [0, 1, 2],
  /** terms and mechanics (the dojo, the speaker button): twice, in different levels */
  twice: [0, 1],
  /** once per save (the gem energy, the first gem battle, Baron Muddle's motive, a position's name per level) */
  once: [0],
  /** a special word: its first page, the next page with it, then a later story */
  special: [0, 0, 1],
  /** the short welcome back to the dojo, after the two full ones */
  short: [0, 1, 1],
} as const satisfies Record<string, readonly number[]>;
export type Spacing = keyof typeof SPACING;

/** Is the next telling of a notion due at level index `at`? */
export function due(e: Exposure | undefined, at: number, spacing: Spacing): boolean {
  const gaps = SPACING[spacing];
  const n = e?.n ?? 0;
  if (n >= gaps.length) return false;
  if (n === 0 || !e?.at.length) return true;
  return at - e.at[e.at.length - 1] >= gaps[n];
}
/** The exposure after one more telling at level index `at`, in session `session` (SCRIPT_FIXES A1). Any other fields
 *  of the exposure (a game's `lastAt`, say) are kept. */
export const told = <E extends Exposure>(e: E | undefined, at: number, session?: number): E =>
  ({
    ...e,
    n: (e?.n ?? 0) + 1,
    at: [...(e?.at ?? []), at],
    s: [...(e?.s ?? []), ...(session === undefined ? [] : [session])],
  }) as E;

/** Session schedules (SCRIPT_STYLE §4): entry k is the least number of sessions between telling k and telling k+1. */
export const SESSIONS = {
  /** a spelling's "two letters, one sound", and concept 4's "This can be…": its teach moment, then the first word
   *  with it in each of the next two sessions; after that, only on an error */
  reminder: [0, 1, 1],
} as const satisfies Record<string, readonly number[]>;
/** Is the next telling due in `session`, spaced in sessions? An old exposure with no sessions is due (so an old save
 *  gets one telling, then the new spacing). Past the end of `gaps` the notion is retired. */
export function dueInSessions(e: Exposure | undefined, session: number, gaps: readonly number[]): boolean {
  const n = e?.n ?? 0;
  if (n >= gaps.length) return false;
  const last = e?.s?.at(-1);
  return n === 0 || last === undefined || session - last >= gaps[n];
}

// ---------------------------------------------------------------- two letters, one sound
/** How many letters a spelling has, said the teach.ts way (its lettersLine): "It's two letters, but it's one sound."
 *  < x > is one spelling for two sounds. Null for a one-letter spelling. */
export function lettersLine(seg: Pick<Seg, "g" | "p">): string | null {
  if (seg.g === "x") return "t_one_spelling_two_sounds";
  const n = seg.g.replace(/-/g, "").length;
  return n === 2 ? "t_two_letters" : n === 3 ? "t_three_letters" : n === 4 ? "t_four_letters" : null;
}
/** The ledger key for a spelling's "two letters, one sound". */
export const lettersKey = (g: string) => `letters:${g}`;
/** The spellings of a word worth a "two letters, one sound" (or < x >) reminder, with their slot, first come first. */
export const multiLetter = (segs: readonly Seg[]): { i: number; seg: Seg }[] =>
  segs.map((seg, i) => ({ i, seg })).filter(({ seg }) => lettersLine(seg) !== null);
/** How many letters a spelling has ("a-e" counts as two). */
export const letterCount = (g: string) => g.replace(/-/g, "").length;

/** How a spelling's letters are said at its teach moment (SCRIPT_STYLE §4.2 and §11.2): in full; as "This one's two
 *  letters too…" when the two-letter sentence was said in full under two minutes ago (the second spelling in a row);
 *  and not at all when two two-letter lines already fell in the last minute (the letters are on screen to see).
 *  `recent`: the letters lines said so far (game-time ms, and how many letters), oldest first. A three- or four-letter
 *  spelling is always said in full: it is different news, and it never makes the next one "two letters too". */
export type LettersForm = "full" | "too" | "none";
export interface LettersSaid { at: number; form: LettersForm; n: number }
export function lettersForm(seg: Pick<Seg, "g" | "p">, recent: readonly LettersSaid[], now: number): LettersForm {
  const n = letterCount(seg.g);
  if (n !== 2 || seg.g === "x") return "full";
  const twos = recent.filter((r) => r.n === 2);
  if (twos.filter((r) => r.form !== "none" && now - r.at < 60_000).length >= 2) return "none";
  const full = twos.filter((r) => r.form === "full").at(-1);
  return full && now - full.at < 120_000 ? "too" : "full";
}

/** A wrong tile that splits a two-letter (or longer) spelling: one of its letters, or a shorter part of it
 *  (< s > or < h > for < sh >, < a > for < ai >, < ch > for < tch >). SCRIPT_STYLE §10. */
export function splitsSpelling(tile: string, need: Pick<Seg, "g">): boolean {
  const g = need.g.replace(/-/g, "");
  return g.length >= 2 && need.g !== "x" && tile.length < g.length && g.includes(tile);
}

// ---------------------------------------------------------------- one spelling, two sounds
/** Spellings that spell two different sounds in the current worlds (Sounds~Write concept 4). */
export const TWO_SOUNDS: Record<string, readonly [PhonemeId, PhonemeId]> = { th: ["th", "dh"] };
/** The other sound this spelling can be, if it has one ("th" as /th/ → /dh/). */
export function otherSound(seg: Pick<Seg, "g" | "p">): PhonemeId | null {
  const pair = TWO_SOUNDS[seg.g];
  if (!pair || !pair.includes(seg.p)) return null;
  return pair[0] === seg.p ? pair[1] : pair[0];
}
export const twoSoundsKey = (g: string) => `two-sounds:${g}`;

// ---------------------------------------------------------------- adjacent consonants
/** The slots of consonant sounds that sit next to another consonant sound ("frog" → 0, 1; "stamp" → 0, 1, 3, 4). */
export function adjacentSlots(segs: readonly Seg[]): number[] {
  const cons = segs.map((s) => !PHONEMES[s.p]?.vowel);
  return segs.map((_, i) => i).filter((i) => cons[i] && (cons[i - 1] || cons[i + 1]));
}
/** Units 8-10 are about adjacent consonants (Sounds~Write Initial Code: at the end, at the start, three or four). */
export const ADJACENT_UNITS = [8, 9, 10];
/** The unit whose adjacent-consonant structure a level practises, if any (its highest of 8-10). */
export const adjacentUnit = (units: readonly number[]): number | null => {
  const u = units.filter((x) => ADJACENT_UNITS.includes(x));
  return u.length ? Math.max(...u) : null;
};
/** Adjacent-consonant units (8-10): a word with sounds next to each other goes first, so the unit's explanation (at
 *  the first such word: Dojo.tsx) comes at the start of the lesson rather than whenever the draw puts one (F12). The
 *  rest keep their order. */
export function clusterFirst<T extends { segs: readonly Seg[] }>(words: T[], units: readonly number[]): T[] {
  if (!adjacentUnit(units)) return words;
  const i = words.findIndex((w) => adjacentSlots(w.segs).length > 1);
  return i <= 0 ? words : [words[i], ...words.slice(0, i), ...words.slice(i + 1)];
}

// ---------------------------------------------------------------- first, middle and last
export type Position = "first" | "middle" | "last";
/** The name of a sound's place in a word, where a young child can use it: first, last, and middle only in a
 *  three-sound word (in "frog" the /r/ is not "the middle sound"). */
export function positionName(pos: number, len: number): Position | null {
  if (pos === 0) return "first";
  if (pos === len - 1) return "last";
  return len === 3 && pos === 1 ? "middle" : null;
}
/** Sound Swap: the right sound was picked. The line names its place, then asks for the new sound. */
export const SWAP_POSITION_LINE: Record<Position, string> = { first: "audit_swap_first", middle: "audit_swap_middle", last: "audit_swap_last" };

// ---------------------------------------------------------------- rotating whole-sentence leads
/** "Listen again" corrections, rotated so a learner who misses often doesn't hear one sentence over and over. The
 *  stretched set promises a slow word, so it is only for words with a stretched recording. TEACHER_SCRIPT §5.4:
 *  `tv_listen_here` "Let's listen again. What can you hear here?" replaces `listen_here` and `listen_again` (a line
 *  that isn't recorded yet falls back through LISTEN_FALLBACK). The plain set (a spelling game's first miss, with the
 *  plain word: FS1) has a third sentence since every first miss now goes back to listening (verify round 1: the
 *  stuck recap moved to the second miss), "Listen to the word again. What sound do you hear here?"; a miss on the
 *  word's first sound skips "What sound comes next?" (feedback.ts listenLead). */
export const LISTEN_AGAIN = {
  stretched: ["tv_listen_here", "audit_listen_slowly", "audit_listen_next"],
  plain: ["tv_listen_here", "audit_listen_next", "audit_spelling_help_plain"],
} as const;
/** What a new lead falls back to until its audio exists. */
export const LISTEN_FALLBACK: Readonly<Record<string, string>> = { tv_listen_here: "listen_here" };
/** Ninja Run's cue before a word's sounds, rotated (SCRIPT_FIXES C16: `t_listen_for_word` is gone, it told the child
 *  to say the sounds while Sensei said them). */
export const RUN_BLEND_CUES = ["run_blend", "audit_sounds_again"] as const;
/** Ninja Run's cue for its `i`-th blend group (0 = the first): TEACHER_SCRIPT §3.21's "Listen for the word…"
 *  (`tv_guess_q`) for groups 1–3 when it is recorded, else the rotated SCRIPT_FIXES C16 cues; from the fourth group, no
 *  cue (the sounds alone, as the lantern comes). */
export function runBlendCue(i: number, has: (id: string) => boolean, last?: string | null): string | null {
  if (i >= 3) return null;
  if (has("tv_guess_q")) return "tv_guess_q";
  return rotate(RUN_BLEND_CUES as readonly string[], last);
}
/** The next item of a rotation after `last` (the first one when `last` isn't in it). */
export function rotate<T>(list: readonly T[], last: T | null | undefined): T {
  const i = last == null ? -1 : list.indexOf(last);
  return list[(i + 1) % list.length];
}

// ---------------------------------------------------------------- praise, stems and fading (SCRIPT_FIXES A4–A6)
/** Everyday praise after a right answer (SCRIPT_STYLE §8): never when the answer's own line is the praise (a streak
 *  tier-up, a gem's first fill, a reminder), never straight before a closing line, otherwise every `every`-th right
 *  answer (2; the warm-ups keep their 3). */
export function praiseDue(o: { rightSincePraise: number; replaced?: boolean; closingNext?: boolean; every?: number }): boolean {
  if (o.replaced || o.closingNext) return false;
  return o.rightSincePraise + 1 >= (o.every ?? 2);
}

/** Recorded stems for questions asked item after item (SCRIPT_STYLE §5): the first two items use the first stem, then
 *  they rotate, so no stem is said more than three times running. `write` is Ninja Eyes' set wherever it is played,
 *  w1-2 and the Dojo alike (TEACHER_SCRIPT §3.13 B, §3.26 B). The old Dojo set (`dojo_find` "Can you find…",
 *  `st_find_q2` "Where's…", `st_find_q3` "Now find…") is gone: `dojo_find` is retired (§3.26) and the others are
 *  clipped orders (§2.4, script-audit's `bare-command`). */
export const STEMS = {
  first: ["first_q", "st_first_q2", "st_first_q3"],
  write: ["tv_which_write", "tv_find_write", "tv_now_find"],
} as const;
/** The stem for item `n` (0 = the first). `has`: only stems whose audio exists. */
export function stemFor(stems: readonly string[], n: number, has: (id: string) => boolean): string {
  const ok = stems.filter(has);
  if (ok.length < 2 || n < 2) return ok[0] ?? stems[0];
  return ok[(n - 1) % ok.length];
}

/** SCRIPT_STYLE §5: the full instruction until the child has got `after` items of this kind right first time in a row;
 *  then only the stimulus; any miss resets the run (the caller passes 0). The faded form is the stimulus alone or a
 *  whole sentence, never a clipped order (TEACHER_SCRIPT §2.4). */
export const fadeForm = (firstTriesInARow: number, after = 2): "full" | "short" => (firstTriesInARow >= after ? "short" : "full");

// ---------------------------------------------------------------- after a word (SCRIPT_FIXES A7)
export type AfterWord = "reminder" | "gem-first" | "praise";
/** After a word's read-back (SCRIPT_STYLE §9): at most one of a reminder, the gem's first-fill explanation and
 *  everyday praise, in that order of priority; nothing when the streak tier-up or "Ninjas read this way!" already
 *  spoke for this word. What doesn't fit is deferred to the next word (not marked heard). */
export function afterWord(o: { tierUp: boolean; leftRight: boolean; reminder: boolean; gemFirst: boolean; praise: boolean }): { say: AfterWord | null; defer: AfterWord[] } {
  const want: AfterWord[] = [...(o.reminder ? ["reminder" as const] : []), ...(o.gemFirst ? ["gem-first" as const] : []), ...(o.praise ? ["praise" as const] : [])];
  const room = o.tierUp || o.leftRight ? 0 : 1;
  const say = room ? want[0] ?? null : null;
  return { say, defer: want.filter((w) => w !== say && w !== "praise") };
}

// ---------------------------------------------------------------- the map, the reward, the jump offer (SCRIPT_FIXES A8)
/** What the map says on arrival (SCRIPT_STYLE §4.2, TEACHER_SCRIPT §5.8): a lead that was asked for (welcome back,
 *  practise again), or the land's welcome when the land has changed since the last welcome this session; then either
 *  the one-line preview of a game this child has never played (`tv_map_next_<game>`, which says to tap the glowing
 *  stone), or the glowing-stone hint on a save's first two map visits (after that it is the map's idle nudge).
 *  `has`: which lines are recorded (without it, or until `tv_map_hint` is recorded, the hint is `map_hint`). */
export function arrivalLines(o: { world: number; welcomed: number | null; lead: string | null; hintsSaid: number; preview?: string | null; has?: (id: string) => boolean }): string[] {
  const has = o.has ?? (() => false);
  const out: string[] = [];
  if (o.lead) out.push(o.lead);
  else if (o.welcomed !== o.world) out.push(`world_${o.world}`);
  if (o.preview) out.push(o.preview);
  else if (o.hintsSaid < 2) out.push(has("tv_map_hint") ? "tv_map_hint" : "map_hint");
  return out;
}
/** Number words for the counted line families (`tv_won_<n>`, `tv_pocket_ready_<n>`, `tv_learn_frame_<n>`, …). */
export const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"] as const;
/** The reward's opening lines (SCRIPT_STYLE §8, TEACHER_SCRIPT §5.7): the level's own closing line was its praise, so
 *  "You did it!" only when the level had none; then the news. `newPetals` counts sounds, not spellings (Dec8).
 *  `toReward`: the save's first three rewards that bring a new sound lead with "Let's see what you won back from Baron
 *  Muddle." The won-back line is `tv_won_one` or `tv_won_<n>` (two to four) when `has` says it is recorded, else
 *  `petal_got` / `petals_got`; the caller says each sound after it. */
export function rewardLead(o: { closingSaid: boolean; boss: boolean; newPetals: number; lastInWorld: boolean; finale: boolean; toReward?: boolean; has?: (id: string) => boolean }): string[] {
  const has = o.has ?? (() => false);
  const out: string[] = [];
  if (o.boss) out.push("battle_boss_win");
  else if (!o.closingSaid) out.push("yay_7");
  if (o.newPetals) {
    if (o.toReward && has("tv_to_reward")) out.push("tv_to_reward");
    const tv = o.newPetals === 1 ? "tv_won_one" : o.newPetals <= 4 ? `tv_won_${NUMBER_WORDS[o.newPetals]}` : null;
    out.push(tv && has(tv) ? tv : o.newPetals > 1 ? "petals_got" : "petal_got");
  }
  if (o.lastInWorld && !o.finale) out.push("world_done");
  return out;
}
/** The jump-ahead offer (SCRIPT_STYLE §4.2, Dec9): never in a child's first two sessions; then at most once a session,
 *  with two sessions' rest after each offer. */
export function jumpOfferDue(e: Exposure | undefined, session: number): boolean {
  if (session < 3) return false;
  const last = e?.s?.at(-1);
  return last === undefined || session - last >= 2;
}

/** Example words for a spelling that aren't already used on this screen (SCRIPT_STYLE §6: never one word for two
 *  spellings in one breath). */
export const freshWords = <W extends { text: string }>(words: readonly W[], used: ReadonlySet<string>, n = words.length): W[] =>
  words.filter((w) => !used.has(w.text)).slice(0, n);

// ---------------------------------------------------------------- the teacher's voice: full, recap, short, none
// TEACHER_SCRIPT §2.2 and teacher-voice/mechanics.md §5.2: each game type has one ledger entry, `game:<id>`. A telling
// (the full form's Ready answered, or a recap's first answer) is counted with its session; `played()` notes when the
// game was last played and whether the child struggled.
export type FrameForm = "full" | "recap" | "short" | "none";
/** A game type's exposure: its tellings with their sessions (A1), plus when it was last played (wall-clock ms), in
 *  which session, and whether the child struggled then. */
export interface GameExposure extends Exposure { lastAt?: number; lastSession?: number; struggled?: boolean }
const DAY = 86_400_000;
/** ARCHITECTURE §6.2 `mech:`: two tellings, the second in a later session */
export const GAME_TELLINGS = 2;
/** `mech:` refresh: a game not played for three weeks is told again (a recap, with its Ready hold) */
export const GAME_REFRESH_MS = 21 * DAY;
/**
 * Which form a game's introduction takes now:
 * - `full`: never told (frame, demo, Ready, hand-over);
 * - `recap`: the child struggled last time, or hasn't played it for 21 days, or it is the first play in a later
 *   session while it has had fewer than two tellings;
 * - `short`: the first play in a session once it has had its two tellings;
 * - `none`: a later play in the same session (inside a level: a level never opens on `none`, see narrate.tsx).
 */
export function frameForm(e: GameExposure | undefined, session: number, now: number): FrameForm {
  if (!e || e.n === 0) return "full";
  if (e.struggled) return "recap";
  if (e.lastAt !== undefined && now - e.lastAt > GAME_REFRESH_MS) return "recap";
  if (e.n < GAME_TELLINGS && (e.s?.at(-1) ?? session) < session) return "recap";
  return e.lastSession === session ? "none" : "short";
}
/** Does a recap get the Ready hold? Only after 21 days away or a struggle (TEACHER_SCRIPT §2.2, T3): an ordinary
 *  recap's telling counts on the child's first answer instead. */
export function recapHold(e: GameExposure | undefined, now: number): boolean {
  if (!e || e.n === 0) return false;
  return !!e.struggled || (e.lastAt !== undefined && now - e.lastAt > GAME_REFRESH_MS);
}
/** A level never opens on `none`: it opens with at least the short line. */
export const openingForm = (f: FrameForm): FrameForm => (f === "none" ? "short" : f);

// ---------------------------------------------------------------- special words (stories)
/** Common words with a spelling the child hasn't been taught, as the official parent guidance handles them: "This
 *  is 'the', just say 'the' here." One recorded sentence per word. (Not "a": a text-to-speech voice reads a lone "a"
 *  as the letter name.) */
export const SPECIAL_LINE: Record<string, string> = {
  the: "audit_special_the",
  is: "audit_special_is",
  his: "audit_special_his",
  to: "audit_special_to",
  i: "audit_special_i",
  so: "audit_special_so",
  he: "audit_special_he",
  you: "audit_special_you",
  go: "audit_special_go",
};
export const specialKey = (w: string) => `special:${w}`;
/** The special words on a page that have a line, in reading order: [word, index of the token]. */
export function specialWords(text: string): { word: string; index: number }[] {
  return text
    .split(" ")
    .map((t, index) => ({ word: t.toLowerCase().replace(/[^a-z']/g, ""), index }))
    .filter(({ word }) => word in SPECIAL_LINE);
}

// ---------------------------------------------------------------- sorting
/** "This sound can be spelt in two ways." (three ways for three chests) */
export const sortWaysLine = (n: number): string | null => (n === 2 ? "audit_sort_pair" : n === 3 ? "audit_sort_three" : null);

// ---------------------------------------------------------------- gem energy
/** The gem to show when a word first fills one: the level's new spelling if the word has one, else its first. */
export function gemSeg(word: Pick<Word, "segs">, teach: readonly string[] = []): Seg {
  const taught = new Set(teach.map((t) => t.split("=")[0]));
  return word.segs.find((s) => taught.has(s.g)) ?? word.segs[0];
}

// ---------------------------------------------------------------- fast and slow (TEACHER_SCRIPT §9, 27 Sep)
// Jonas: "you need to explain more often that there are slow and fast ways to read words". Five moves (§9.2): the
// rabbit read-back (1), the idea (2), the stuck recap (3), fast and slow praise (4) and Sensei's pair (5), dosed per
// game type per session (§9.5). The rules are here, pure; narrate.tsx keeps the session's record (createFastSlow with
// the save's ledger) and exports fsReadback, fsIdea, fsStuck, fsPraise, fsPair and fsSaid to the scenes.
export type FsBank = "listen" | "read" | "build";
export type FsReadback = "rabbit" | "sw" | "pair" | "plain";
export type FsStuckKind = "slow" | "again" | "push";
export type FsPraiseKind = "letters" | "listen" | "build";
/** The idea lines (Move 2) in §9.4's order: the eleven of the first recording, then the eight short ones added later on
 *  27 Sep (each under 3.5 s). */
export const FS_IDEAS: readonly string[] = [
  "tv_fs_two_ways", "tv_fs_tortoise", "tv_fs_gaps", "tv_fs_rabbit", "tv_fs_read", "tv_fs_same", "tv_fs_made", "tv_fs_ninja", "tv_fs_mantra",
  "tv_fs_spell", "tv_fs_find", "tv_fs_hiding", "tv_fs_whole", "tv_fs_push", "tv_fs_turn", "tv_fs_ninjas_can", "tv_fs_next", "tv_fs_start_end",
  "tv_fs_count",
];
const fsIds = (...xs: string[]) => xs.map((x) => `tv_fs_${x}`);
/** Each bank in its rotation order (TEACHER_SCRIPT §9.5): long and short lines alternate, so a tight run never skips
 *  far. Listening games: W3, Slow Words, W5, W6 and Ninja Run. Reading games: Kai and Suki and Story Time. Building and
 *  hunting games: Word Building, the Dojo, battles, Sound Swap, First Sounds, Sound Hunt and Pocket Hunt's middle. */
export const FS_BANKS: Readonly<Record<FsBank, readonly string[]>> = {
  listen: fsIds("two_ways", "tortoise", "gaps", "hiding", "rabbit", "whole", "read", "turn", "same", "push", "made", "ninjas_can", "ninja"),
  read: fsIds("two_ways", "tortoise", "gaps", "hiding", "rabbit", "whole", "read", "push", "same", "ninja", "mantra"),
  build: fsIds("two_ways", "tortoise", "gaps", "next", "made", "start_end", "same", "turn", "spell", "count", "find"),
};
/** The four long idea lines (4.4–4.7 s), skipped in a tight run (§9.3's "≤ 3.9 s"). */
export const FS_LONG: ReadonlySet<string> = new Set(["tv_fs_tortoise", "tv_fs_rabbit", "tv_fs_ninja", "tv_fs_mantra"]);
/** Lines that count as a game's idea where they play (§9.5), without moving the rotation: W1's "Fast or slow, it's the
 *  same word…" and S~W's "If you say the sounds, you can hear the word." (W5, W6). */
export const FS_IDEA_ALSO: readonly string[] = ["tv_same_word", "t_if_you_say_sounds"];
/** At most 2 idea lines a level and 4 a session (§9.5). */
export const FS_IDEA_CAP = { level: 2, session: 4 } as const;
/** Games whose only fast/slow telling is the idea line in the praise slot (First Sounds and Sound Hunt, TS §9.3): the
 *  session cap doesn't hold their one line back, and their line doesn't use it up (the level cap, once per game type
 *  and never twice a session still apply). Without this, a first session's warm-ups used the 4 before w1-2, and those
 *  two games never told fast and slow at all, against §9.5's "every game, once a session" (integration, 27 Sep). */
export const FS_IDEA_ONLY: ReadonlySet<string> = new Set(["firstsound", "soundhunt"]);
/** The ledger key of the rotation's pointer (a count of rotated idea lines heard in full). */
export const FS_IDEA_KEY = "fs:idea";
/** The stuck recap (Move 3): building, battles and First Sounds; Slow Words and Ninja Run; Guess My Word. */
export const FS_STUCK: Readonly<Record<FsStuckKind, string>> = { slow: "tv_fs_stuck_slow", again: "tv_fs_stuck_again", push: "tv_fs_stuck_push" };
/** Fast and slow praise (Move 4), by kind of game: with letters (Kai and Suki, Story Time), listening (Slow Words,
 *  Guess My Word, Sound Dots, Ninja Run), building (Word Building, the Dojo, battles). Each line at most once a session. */
export const FS_PRAISE: Readonly<Record<FsPraiseKind, readonly string[]>> = {
  letters: ["tv_fs_praise_both", "tv_fs_praise_both_2", "tv_fs_praise_both_3"],
  listen: ["tv_fs_praise_found", "tv_fs_praise_found_2", "tv_fs_praise_found_3", "tv_fs_praise_found_4"],
  build: ["tv_fs_praise_every", "tv_fs_praise_every_2", "tv_fs_praise_every_3", "tv_fs_praise_every_4"],
};
/** Sensei's pair (Move 5): [the slow half's lead-in, the fast half's], the two pairs taking turns. */
export const FS_PAIRS: readonly (readonly [slow: string, fast: string])[] = [["tv_fs_say_slow", "tv_fs_now_fast"], ["tv_fs_slow_tortoise", "tv_fs_fast_rabbit"]];
/** Move 1's own lines: the slow half's lead-in, and the rabbit prompt (a game with letters; a listening game). */
export const FS_MOVE1: readonly string[] = ["tv_fs_say_sounds_slow", "tv_fs_rabbit_read", "fm_tap_rabbit"];
/** The stuck recap's kind in each game that has one (§9.3). */
export const FS_STUCK_KIND: Readonly<Record<string, FsStuckKind>> = {
  build: "slow", battle: "slow", boss: "slow", review: "slow", trial: "slow", firstsound: "slow", slowpick: "again", run: "again", sounds: "push",
};
/** Spelling games (FS1, docs/DECISIONS.md): a first miss or the 8 s idle gets "Let's listen again…" and the PLAIN
 *  word, so the child segments it; the stuck recap ("Let's say it the slow way first…" and the gapped slow word, then
 *  the tile) comes only from a second miss, when Sensei models it (narrate.tsx correctionFor, fsStuckSay). */
export const FS_SPELLING: ReadonlySet<string> = new Set(["build", "battle", "boss", "review", "trial"]);

/** The n-th read-back (1 = the first) of a game type in a session when it isn't Move 1 (§9.2): S~W's
 *  `say_sounds_read` on the 1st (Move 1 went elsewhere), 2nd and 4th, and after any miss; Sensei's pair on the 3rd and
 *  5th; then the faded form. `inLevel`: the game's read-backs in this level so far, this one included (Move 1 not
 *  counted): the routine is said on the first two of every level (SCRIPT_STYLE §5.1; pre-ship fix, 28 Sep: counted
 *  per session only, a quick child never heard it in w1-10…w2-2), so only the pair keeps its turn there. */
export function fsReadbackAt(n: number, o: { afterMiss?: boolean; inLevel?: number } = {}): Exclude<FsReadback, "rabbit"> {
  if (o.afterMiss || n <= 2 || n === 4) return "sw";
  if (n === 3 || n === 5) return "pair";
  return o.inLevel !== undefined && o.inLevel <= 2 ? "sw" : "plain";
}
/** The next idea line for a bank: the save's pointer (idea lines heard) walks the bank in its order; the first line
 *  from there that hasn't been said this session, isn't long in a tight run, isn't skipped, and is recorded. */
export function fsNextIdea(o: { pointer: number; bank: FsBank; said: ReadonlySet<string>; tight?: boolean; skip?: readonly string[]; has?: (id: string) => boolean }): string | null {
  const bank = FS_BANKS[o.bank];
  for (let k = 0; k < bank.length; k++) {
    const id = bank[(Math.max(0, o.pointer) + k) % bank.length];
    if (o.said.has(id) || (o.tight && FS_LONG.has(id)) || o.skip?.includes(id)) continue;
    if (o.has && !o.has(id)) continue;
    return id;
  }
  return null;
}
/** Which kind of fast and slow praise a line is, if it is one. */
export const fsPraiseKind = (id: string): FsPraiseKind | null =>
  (Object.keys(FS_PRAISE) as FsPraiseKind[]).find((k) => FS_PRAISE[k].includes(id)) ?? null;
/** Is this line a fast/slow idea (rotated, or one that counts as one)? */
export const isFsIdea = (id: string): boolean => FS_IDEAS.includes(id) || FS_IDEA_ALSO.includes(id);

/** What the fast/slow record needs from the game: the session, the land, the level being played (any value that
 *  changes at each level), the save-wide counts (the narrative ledger) and which lines are recorded. */
export interface FsEnv {
  session(): number;
  world(): number;
  level(): number;
  count(key: string): number;
  bump(key: string): void;
  has(id: string): boolean;
}
/**
 * The session's fast and slow record (TEACHER_SCRIPT §9.5), kept in memory: a session is one run of the page, like the
 * read-back reminders' `perSession`. Only what is heard counts (ARCHITECTURE §3): lines are recorded by `said()` once
 * heard in full, so a line cut off by Home comes again. Moves 1, 2 and 4 come at most once per game type per session;
 * from land 3, Moves 1 and 2 only in the session's first game that has one.
 */
export function createFastSlow(env: FsEnv) {
  type Move1 = { level: number; done: boolean };
  const fresh = (session: number) => ({
    session,
    level: env.level(),
    /** fast/slow lines said this session (ideas and praise: never twice a session) */
    said: new Set<string>(),
    ideaGames: new Set<string>(),
    ideas: 0,
    levelIdeas: 0,
    praised: new Set<string>(),
    readbacks: new Map<string, number>(),
    /** read-backs per game in the current level (Move 1 not counted) */
    levelReadbacks: new Map<string, number>(),
    move1: new Map<string, Move1>(),
    /** the first game whose Move 1 was heard this session */
    move1Game: null as string | null,
    stuckLast: new Map<string, "fs" | "own">(),
    stuckItems: new Set<string>(),
    /** games whose next praise slot stays the game's own (an idea or Move 1 has just spoken) */
    quiet: new Set<string>(),
  });
  let s = fresh(-1);
  const state = () => {
    const n = env.session();
    if (s.session !== n) s = fresh(n);
    const lv = env.level();
    if (s.level !== lv) {
      s.level = lv;
      s.levelIdeas = 0;
      s.levelReadbacks.clear();
    }
    return s;
  };
  let pairN = 0;
  const lateLand = () => env.world() >= 3;
  const move1Heard = (st: ReturnType<typeof fresh>, game: string, quiet: boolean) => {
    st.move1.set(game, { level: env.level(), done: true });
    st.move1Game ??= game;
    if (quiet) st.quiet.add(game);
  };

  /** Which read-back this is, and count it (§9.2): "rabbit" (Move 1) for the first of this game type this session;
   *  then "sw" on the 2nd and 4th (and after any miss), "pair" on the 3rd and 5th, "plain" after that, except on the
   *  first two read-backs of each level, which are "sw" (SCRIPT_STYLE §5.1). A Move 1 that
   *  wasn't heard (Home mid-way) comes again in the game's next level; a later read-back in the same level means it
   *  was played. */
  function readback(game: string, o: { afterMiss?: boolean } = {}): FsReadback {
    const st = state();
    const lv = env.level();
    const m = st.move1.get(game);
    if (m && !m.done && m.level === lv) move1Heard(st, game, false);
    const done = st.move1.get(game)?.done;
    const allowed = !done && env.has("tv_fs_say_sounds_slow") && (!lateLand() || st.move1Game === null || st.move1Game === game);
    if (allowed) {
      st.move1.set(game, { level: lv, done: false });
      st.readbacks.set(game, 1);
      return "rabbit";
    }
    const n = (st.readbacks.get(game) ?? 0) + 1;
    st.readbacks.set(game, n);
    const inLevel = (st.levelReadbacks.get(game) ?? 0) + 1;
    st.levelReadbacks.set(game, inLevel);
    const r = fsReadbackAt(n, { ...o, inLevel });
    return r === "pair" && !FS_PAIRS.some(([a, b]) => env.has(a) && env.has(b)) ? "sw" : r;
  }
  /** The game's idea line (Move 2) now, or null: once per game type a session, at most 2 a level and 4 a session,
   *  never one twice in a session; from land 3 only in the session's first game with a fast/slow moment. `tight`
   *  skips the four long lines. Sound Swap never gets "the very same word" (Swap changes the word). */
  function idea(game: string, bank: FsBank, o: { tight?: boolean } = {}): string | null {
    const st = state();
    if (st.ideaGames.has(game) || st.levelIdeas >= FS_IDEA_CAP.level || (st.ideas >= FS_IDEA_CAP.session && !FS_IDEA_ONLY.has(game))) return null;
    if (lateLand() && (st.ideas > 0 || (st.move1Game !== null && st.move1Game !== game))) return null;
    return fsNextIdea({ pointer: env.count(FS_IDEA_KEY), bank, said: st.said, tight: o.tight, skip: game === "swap" ? ["tv_fs_same"] : undefined, has: (id) => env.has(id) });
  }
  /** The stuck recap's line (Move 3) when it is its turn, or null when it is the game's own line's turn: they take
   *  turns per game (the fast/slow line first each session), and the fast/slow line is never said twice on one item
   *  (`item`: the word or question). `always`: its turn whatever (Guess My Word's 8 s idle). */
  function stuck(game: string, kind: FsStuckKind, o: { item?: string; always?: boolean } = {}): string | null {
    const id = FS_STUCK[kind];
    if (!env.has(id)) return null;
    const st = state();
    const ik = o.item !== undefined ? `${game}\u0000${o.item}` : null;
    if (o.always || (st.stuckLast.get(game) !== "fs" && !(ik && st.stuckItems.has(ik)))) {
      st.stuckLast.set(game, "fs");
      if (ik) st.stuckItems.add(ik);
      return id;
    }
    st.stuckLast.set(game, "own");
    return null;
  }
  /** The game's fast and slow praise (Move 4), or null: once per game type a session, each line at most once a
   *  session, rotating by kind across the save; never in the praise slot straight after the game's idea or Move 1
   *  (that slot stays the game's own, and the next one gets it). */
  function praise(game: string, kind: FsPraiseKind): string | null {
    const st = state();
    if (st.praised.has(game)) return null;
    if (st.quiet.delete(game)) return null;
    const list = FS_PRAISE[kind];
    const p = env.count(`fs:praise:${kind}`);
    for (let k = 0; k < list.length; k++) {
      const id = list[(p + k) % list.length];
      if (env.has(id) && !st.said.has(id)) return id;
    }
    return null;
  }
  /** Sensei's pair (Move 5): [slow lead-in, fast lead-in], the two pairs taking turns. */
  function pair(): readonly [slow: string, fast: string] {
    const ok = FS_PAIRS.filter(([a, b]) => env.has(a) && env.has(b));
    return ok.length ? ok[pairN++ % ok.length] : FS_PAIRS[0];
  }
  /** Record a fast/slow line heard in full, in `game`: an idea (counts against the caps; a rotated one moves the
   *  save's pointer), a praise line, or Move 1 (its own lines, or Sensei's pair where fsReadback said "rabbit": Kai and
   *  Suki, Ninja Run and Story Time have no rabbit tap). Recording the same idea or praise line twice counts once. */
  function said(id: string, game: string) {
    const st = state();
    if (isFsIdea(id)) {
      if (st.said.has(id)) return;
      st.said.add(id);
      st.ideaGames.add(game);
      if (!FS_IDEA_ONLY.has(game)) st.ideas++;
      st.levelIdeas++;
      st.quiet.add(game);
      if (FS_IDEAS.includes(id)) env.bump(FS_IDEA_KEY);
      return;
    }
    const kind = fsPraiseKind(id);
    if (kind) {
      if (st.said.has(id)) return;
      st.said.add(id);
      st.praised.add(game);
      env.bump(`fs:praise:${kind}`);
      return;
    }
    const m = st.move1.get(game);
    if (FS_MOVE1.includes(id) || (FS_PAIRS.some((p) => p.includes(id)) && m && !m.done)) {
      if (!m?.done) move1Heard(st, game, true);
    }
    st.said.add(id);
  }
  /** Was this line recorded (said()) this session? (Ninja Run's `tv_fs_run`, once a session.) */
  const heardThisSession = (id: string): boolean => state().said.has(id);
  return { readback, idea, stuck, praise, pair, said, heardThisSession };
}
export type FastSlow = ReturnType<typeof createFastSlow>;
