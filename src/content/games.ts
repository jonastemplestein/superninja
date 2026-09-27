// The game registry (docs/TEACHER_SCRIPT.md §4.1, docs/teacher-voice/mechanics.md §5.1, FIX_PLAN §13.1): one entry per
// game type, with the line ids its introduction uses in each form (full, recap, short), its narrated demo, its Ready
// hold, the paw's canonical demo, where ▶ sits, its map preview, its specific praise and its closing lines. Data and
// small pure functions only: the per-save state (`game:<id>` in the narrative ledger) and the runtime helpers are in
// src/scenes/narrate.tsx (gameForm, framed, played, readyAsk), the forms' rule is narrative.ts's frameForm().
//
// Line ids are TEACHER_SCRIPT §7.1's. A family is written with its slot (`tv_pocket_ready_<n>`, `tv_pocket_more_<p>`):
// fill it with fillLine(). Scenes guard every id with HAS / L() (the audio may land after the code).
import { WARMUPS, type Beat as WarmupBeat } from "./warmups";
import type { Level } from "./worlds";
import { NUMBER_WORDS, frameForm, recapHold, told, type FrameForm, type GameExposure } from "./narrative";

export type GameId =
  | "tap" | "fastslow" | "notice" | "tapall" | "tapall:in" | "rail" | "which" | "compound" | "slowpick"
  | "sounds" | "dots" | "firstsound" | "find" | "soundhunt" | "build" | "readcheck" | "learn" | "battle" | "boss" | "trial"
  | "review" | "swap" | "sort" | "run" | "story";

export interface GameDef {
  id: GameId;
  /** the `mech:` notion (a MechanicId key, core/types.ts) the core's director takes this game's dosage over as */
  mech: string;
  /** the name Sensei says inside a sentence (TEACHER_SCRIPT §2.6); null: never said aloud ("which", "readcheck") */
  name: string | null;
  /** the first meeting: the frame's lines, the demo's first line (null: no demo), the Ready question (null: no hold) */
  full: {
    frame: string[];
    show: string | null;
    /** null for exactly the three games TEACHER_SCRIPT gives no Ready: `notice` (a show the child drives, §3.5 C),
     *  `find` (its first item is a we do, §3.13 B) and `readcheck` (guided, §3.16 B). FIX_PLAN §13.1's sketch says
     *  `string`; a sentinel id would be worse. Scenes ask readyLine(), which returns null for these */
    ready: string | null;
    /** every first-person line of the narrated demo, in order (slots between them are the scene's) */
    demo: string[];
    /** the Ready names the task and the board already holds the answer: a right-answer tap counts as ready and as the
     *  first answer (TEACHER_SCRIPT §2.3, T4; holdReady's `handover`) */
    handover?: boolean;
    /** a Ready before the demo (Sound Swap's "Are you ready to watch?", §3.20) */
    readyBefore?: string;
  };
  /** a later day: the one-line recap (statements, never "Remember…?") and whether the demo plays. It gets a Ready hold
   *  only after 21 days away or a struggle (recapHold), unless `holds.recap` says it always does. `demo`: the recap's
   *  own demo lines where they differ from the full form's (the rabbit and the tortoise: the slow word only, §3.9 A);
   *  otherwise a recap that shows plays `full.demo` (demoLines()) */
  recap: { line: string[]; show: boolean; demo?: string[] };
  /** the game is known: the line(s) that name it, in order */
  short: string[];
  /** a demo the short form always plays, where TEACHER_SCRIPT §4.1 says the short form is "as recap" (the rabbit and
   *  the tortoise). Otherwise a short form has no demo until the child taps the paw */
  shortDemo?: string[];
  /** other short openings, by what the level is doing ("new": two new sounds, "known": a review, "dojo", …) */
  shortAlt?: Readonly<Record<string, readonly string[]>>;
  /** the paw's canonical demo can play on a short form (it uses its own pictures, never the turn's answers) */
  demoOwnPictures: boolean;
  /** where ▶ (and the paw) sit during a hold: the nav row, or the right-hand column where the letters or chests fill
   *  the row */
  readyAt: "row" | "column";
  /** a hold on the recap or short form whatever recapHold says: the starting gun of a run, a boss, a gem battle, a
   *  Monster Battle's recap, the dojo's lesson (its line; the line may carry the game's name too) */
  holds?: { recap?: string; short?: string };
  /** `tv_map_next_<game>`, said on the map before the child's first stone of this game (TEACHER_SCRIPT §5.8) */
  mapPreview?: string;
  /** specific praise for a right answer in this game (TEACHER_SCRIPT §5.3), said at most every second right answer */
  praise: string[];
  /** the closing line(s) of a level this game leads (TEACHER_SCRIPT §5.6): said once, at the level's end, after its
   *  last game, never at this game's own end when another game follows (First Sounds' `tv_first_done` comes after its
   *  Ninja Eyes). Read it through levelWrap(), which also knows the review dojo's close. A warm-up's close is its
   *  `done` beat (warmups.ts), so the warm-up games (tap, fastslow, notice, tapall, rail, which, compound, slowpick,
   *  sounds, dots) have none; a game that never leads a level (find, readcheck) has none */
  wrap?: string[];
}

const G = (d: Omit<GameDef, "full"> & { full: Partial<GameDef["full"]> & { frame: string[] } }): GameDef => ({
  ...d,
  full: { show: null, ready: null, demo: [], ...d.full },
});

/** The registry, filled from TEACHER_SCRIPT §4.1 (the per-game tables are §3 and §4). */
export const GAMES: Record<GameId, GameDef> = {
  tap: G({
    id: "tap", mech: "mech:tap-picture", name: "Ninja Ears",
    full: { frame: ["tv_ears_frame"], show: "tv_ears_demo", demo: ["tv_ears_demo"], ready: "tv_ready_go" },
    // W1 only on the preschool path: a replay of W1 hears the frame again (a statement), never "Remember…?". No wrap:
    // `tv_w1_end` is W1's close, after Pocket Hunt (TS §3.5 D), so it is the warm-up's `done` beat
    recap: { line: ["tv_ears_frame"], show: true }, short: ["tv_ears_frame"],
    demoOwnPictures: false, readyAt: "row", praise: ["tv_praise_found"],
  }),
  fastslow: G({
    id: "fastslow", mech: "mech:tap-picture", name: "the rabbit and the tortoise",
    full: { frame: ["tv_ts_meet"], show: "tv_ts_fast", demo: ["tv_ts_fast", "tv_ts_slow"], ready: "tv_ready_go" },
    // TS §4.1 and §3.9 A: the recap is `tv_ts_again` + the new picture's name + the tortoise's slow word only (the
    // paw taps the tortoise; the rabbit's fast word is the child's), and the short form is "as recap"
    recap: { line: ["tv_ts_again", "fm_name_<w>"], show: true, demo: ["tv_ts_slow_one"] },
    short: ["tv_ts_again", "fm_name_<w>"], shortDemo: ["tv_ts_slow_one"],
    demoOwnPictures: true, readyAt: "row", praise: ["tv_praise_slowly"],
  }),
  notice: G({
    id: "notice", mech: "mech:tap-picture", name: null,
    // a show the child drives (the cards and the petal are its taps): no demo, no Ready
    full: { frame: ["tv_notice_frame", "tv_ears_on"] },
    recap: { line: ["tv_notice_frame"], show: false }, short: ["tv_notice_frame"],
    demoOwnPictures: false, readyAt: "row", praise: [],
  }),
  tapall: G({
    id: "tapall", mech: "mech:tap-picture", name: "Pocket Hunt",
    full: { frame: ["tv_pocket_frame"], show: "tv_pocket_ido", demo: ["tv_pocket_ido", "tv_so_pocket"], ready: "tv_pocket_ready_<n>", handover: true },
    recap: { line: ["tv_pocket_recap"], show: true }, short: ["tv_pocket_more_<p>"],
    demoOwnPictures: false, readyAt: "row", praise: ["tv_praise_start"],
  }),
  "tapall:in": G({
    id: "tapall:in", mech: "mech:tap-picture", name: "Pocket Hunt",
    full: { frame: ["tv_pocket_middle"], show: "tv_pocket_ido", demo: ["tv_pocket_ido", "tv_hear_middle", "tv_so_pocket"], ready: "tv_pocket_ready_<n>", handover: true },
    recap: { line: ["tv_pocket_middle"], show: true }, short: ["tv_pocket_middle_more_<p>"],
    demoOwnPictures: false, readyAt: "row", praise: ["tv_praise_middle"],
  }),
  rail: G({
    id: "rail", mech: "mech:left-to-right", name: "Ninja Reading",
    full: { frame: ["tv_rail_frame"], show: "tv_rail_ido", demo: ["tv_rail_ido"], ready: "tv_rail_ready", handover: true },
    recap: { line: ["tv_rail_again"], show: true }, short: ["tv_rail_again"],
    demoOwnPictures: true, readyAt: "row", praise: ["tv_praise_order"],
  }),
  which: G({
    id: "which", mech: "mech:tap-picture", name: null,
    full: { frame: ["tv_which_frame"], show: "tv_which_demo", demo: ["tv_which_demo", "tv_which_so"], ready: "tv_ready_go" },
    recap: { line: ["tv_which_again"], show: true }, short: ["tv_which_again"],
    demoOwnPictures: true, readyAt: "row", praise: ["tv_praise_row", "tv_praise_order"],
  }),
  compound: G({
    id: "compound", mech: "mech:tap-picture", name: "Word Squish",
    full: { frame: ["tv_squish_frame"], show: "tv_squish_slow", demo: ["tv_squish_slow", "tv_squish_fast"], ready: "tv_squish_ready" },
    recap: { line: ["tv_squish_again"], show: true }, short: ["tv_squish_again"],
    demoOwnPictures: true, readyAt: "row", praise: ["tv_praise_squish"],
  }),
  slowpick: G({
    id: "slowpick", mech: "mech:tap-picture", name: "Slow Words",
    full: { frame: ["tv_slow_frame"], show: "tv_slow_demo", demo: ["tv_slow_demo", "tv_i_hear_<w>"], ready: "tv_ready_go" },
    recap: { line: ["tv_slow_recap"], show: true }, short: ["tv_slow_short"],
    demoOwnPictures: true, readyAt: "row", praise: ["tv_praise_found"],
  }),
  sounds: G({
    id: "sounds", mech: "mech:tap-picture", name: "Guess My Word",
    full: { frame: ["tv_guess_frame"], show: "tv_my_sounds", demo: ["tv_my_sounds", "tv_guess_so_<w>"], ready: "tv_ready_go" },
    recap: { line: ["tv_guess_recap"], show: true }, short: ["tv_guess_short"],
    // W5's close (`tv_w5_done` · `t_if_you_say_sounds`) is the warm-up's `done` beat (TS §5.6)
    demoOwnPictures: true, readyAt: "row", mapPreview: "tv_map_next_sounds", praise: ["tv_praise_heard_word", "tv_praise_found"],
  }),
  dots: G({
    id: "dots", mech: "mech:left-to-right", name: "Sound Dots",
    full: { frame: ["tv_dots_frame"], show: "tv_dots_ido", demo: ["tv_dots_ido", "tv_dots_word_ido"], ready: "tv_dots_ready" },
    recap: { line: ["tv_dots_recap"], show: true }, short: ["tv_dots_short"],
    // W6's close (`fm_l6_done`) is the warm-up's `done` beat (TS §5.6)
    demoOwnPictures: true, readyAt: "row", mapPreview: "tv_map_next_dots", praise: ["tv_praise_order"],
  }),
  firstsound: G({
    id: "firstsound", mech: "mech:tap-picture", name: "First Sounds",
    full: { frame: ["tv_first_frame"], show: "tv_ido_pair_<pair>", demo: ["tv_ido_pair_<pair>", "tv_let_me_listen", "tv_so_i_tap"], ready: "tv_ready_together" },
    // a recap plays each new sound's I do anyway (it teaches a new spelling), with no Ready unless 21 days or a struggle
    recap: { line: ["tv_first_recap"], show: true }, short: ["tv_first_again_new"],
    shortAlt: { new: ["tv_first_again_new"], known: ["tv_first_again_known"] },
    // the close of First Sounds and its Ninja Eyes (TS §5.6), said once after the Ninja Eyes phase
    demoOwnPictures: false, readyAt: "row", mapPreview: "tv_map_next_firstsound", praise: ["tv_praise_start"], wrap: ["tv_first_done"],
  }),
  find: G({
    id: "find", mech: "mech:tap-tile", name: "Ninja Eyes",
    // no demo and no Ready: the first item is a we do (its answer glows)
    full: { frame: ["tv_ne_frame"] },
    recap: { line: ["tv_ne_recap"], show: false }, short: ["tv_ne_again"],
    shortAlt: { new: ["tv_ne_new_sounds"], plain: ["tv_ne_again"] },
    // no wrap: Ninja Eyes never leads a level (w1-2's close is First Sounds', the dojo's is New Sounds')
    demoOwnPictures: false, readyAt: "row", praise: ["tv_praise_write"],
  }),
  soundhunt: G({
    id: "soundhunt", mech: "mech:tap-picture", name: "Sound Hunt",
    full: { frame: ["tv_hunt_frame"], show: "tv_ido_pair_<pair>", demo: ["tv_ido_pair_<pair>", "tv_let_me_listen"], ready: "tv_ready_together" },
    recap: { line: ["tv_hunt_recap"], show: true }, short: ["tv_hunt_again"],
    demoOwnPictures: false, readyAt: "row", mapPreview: "tv_map_next_soundhunt", praise: ["tv_praise_middle"], wrap: ["tv_hunt_done"],
  }),
  build: G({
    id: "build", mech: "mech:tile-to-line", name: "Word Building",
    full: {
      frame: ["tv_build_frame", "tv_build_lines"], show: "tv_word_card",
      demo: ["tv_word_card", "tv_i_say_slowly", "st_hear_two", "tv_first_is", "tv_you_find_last", "tv_lets_say_read"], ready: "tv_build_ready",
    },
    recap: { line: ["tv_build_recap"], show: true }, short: ["tv_build_again_short"],
    shortAlt: { three: ["tv_build_again_3"], dojo: ["tv_build_dojo"], next: ["tv_next_build"], nextPlain: ["tv_next_build_plain"], practise: ["tv_practise_gem"] },
    demoOwnPictures: true, readyAt: "row", mapPreview: "tv_map_next_build", praise: ["tv_praise_built"], wrap: ["tv_build_done"],
  }),
  readcheck: G({
    id: "readcheck", mech: "mech:tap-reader", name: null,
    // guided: the child's sound taps come first, one at a time; no demo, no Ready
    full: { frame: ["tv_readers_meet", "tv_rc_how"] },
    recap: { line: ["tv_readers_back", "tv_rc_how"], show: false }, short: ["tv_readers_back"],
    demoOwnPictures: false, readyAt: "row", praise: ["tv_praise_judge"],
  }),
  learn: G({
    id: "learn", mech: "mech:tap-tile", name: "New Sounds",
    // the Learn is its own show and turn: frame, then the Ready before the first sound (§3.26)
    full: { frame: ["tv_learn_frame_<n>", "tv_learn_how"], ready: "tv_learn_ready" },
    recap: { line: ["tv_learn_recap_<n>", "tv_learn_how"], show: false }, short: ["tv_learn_short_<n>", "tv_learn_first_short"],
    // a school path's first lesson (§4.6): the room first; a Year One lesson of new ways to write known sounds
    shortAlt: { room: ["tv_dj_room"], ways: ["tv_learn_frame_ways", "tv_learn_how"] },
    holds: { recap: "tv_learn_ready" },
    demoOwnPictures: false, readyAt: "row", mapPreview: "tv_map_next_learn", praise: ["tv_said_well"], wrap: ["tv_learn_done"],
  }),
  battle: G({
    id: "battle", mech: "mech:tile-to-line", name: "a Monster Battle",
    full: {
      frame: ["tv_battle_oh_no", "tv_battle_frame"], show: "tv_battle_card",
      demo: ["tv_battle_card", "tv_first_is", "tv_bar_down", "tv_you_find_last"], ready: "tv_battle_ready",
    },
    // the recap's starting gun; the short form has no hold (its letters wake as tv_battle_again ends)
    recap: { line: ["tv_battle_recap"], show: false }, short: ["tv_battle_again"], holds: { recap: "tv_battle_go" },
    demoOwnPictures: true, readyAt: "column", mapPreview: "tv_map_next_battle", praise: [], wrap: ["battle_win"],
  }),
  boss: G({
    id: "boss", mech: "mech:tile-to-line", name: "a boss",
    full: { frame: ["tv_boss_calm", "tv_boss_frame"], ready: "tv_boss_ready" },
    recap: { line: ["tv_boss_again"], show: false }, short: ["tv_boss_again"], holds: { recap: "tv_boss_ready", short: "tv_boss_ready" },
    demoOwnPictures: false, readyAt: "column", mapPreview: "tv_map_next_boss", praise: [], wrap: ["battle_boss_win"],
  }),
  trial: G({
    id: "trial", mech: "mech:timer-bar", name: "a gem battle",
    full: { frame: ["tv_trial_frame", "tv_trial_bar"], ready: "tv_trial_ready" },
    // tv_trial_short names the game and asks for ▶ in one line
    recap: { line: [], show: false }, short: [], holds: { recap: "tv_trial_short", short: "tv_trial_short" },
    demoOwnPictures: false, readyAt: "column", praise: [], wrap: ["trial_win"],
  }),
  review: G({
    id: "review", mech: "mech:tile-to-line", name: "Sensei's Challenge",
    full: { frame: ["tv_review_frame", "tv_review_how"], ready: "tv_battle_go" },
    recap: { line: [], show: false }, short: [], holds: { recap: "tv_review_short", short: "tv_review_short" },
    demoOwnPictures: false, readyAt: "column", praise: [], wrap: ["tv_review_done"],
  }),
  swap: G({
    id: "swap", mech: "mech:swap-two-taps", name: "Sound Swap",
    full: {
      frame: ["tv_swap_oh_dear", "tv_swap_read_first", "tv_swap_frame"], readyBefore: "tv_ready_to_watch", show: "tv_swap_change_to",
      demo: ["tv_swap_change_to", "tv_swap_kick", "tv_swap_in"], ready: "tv_swap_ready",
    },
    recap: { line: ["tv_swap_again", "tv_swap_read_first"], show: true }, short: ["tv_swap_again", "tv_swap_read_first", "tv_show_offer_short"],
    demoOwnPictures: true, readyAt: "row", mapPreview: "tv_map_next_swap", praise: ["tv_praise_swap"], wrap: ["tv_swap_done"],
  }),
  sort: G({
    id: "sort", mech: "mech:basket-sort", name: "Sorting",
    full: {
      frame: ["audit_bridging_first", "tv_sort_frame", "tv_sort_open"], show: "tv_sort_ido",
      demo: ["tv_sort_ido", "tv_sort_see", "tv_sort_so"], ready: "tv_ready_yours",
    },
    recap: { line: ["tv_sort_recap"], show: true }, short: ["audit_sort_again"],
    demoOwnPictures: true, readyAt: "column", mapPreview: "tv_map_next_sort", praise: ["tv_praise_sorted"], wrap: ["tv_sort_done"],
  }),
  run: G({
    id: "run", mech: "mech:run-catch", name: "Ninja Run",
    // no demo (a moving world): a practice jump, then the starting gun on every run
    full: { frame: ["tv_run_frame", "tv_run_jump", "tv_run_jump_ok", "tv_run_lanterns_how"], ready: "tv_run_ready" },
    // tv_run_again names the game and is the starting gun in one line (the hold's question); a recap then has the
    // practice jump (tv_run_jump), which the scene says after the gun
    recap: { line: [], show: false }, short: [], holds: { recap: "tv_run_again", short: "tv_run_again" },
    demoOwnPictures: false, readyAt: "row", mapPreview: "tv_map_next_run", praise: ["tv_praise_heard_word"], wrap: ["run_end"],
  }),
  story: G({
    id: "story", mech: "mech:page-turn", name: "Story Time",
    // the title page's ▶ is the Ready on every play (tv_story_title and the title clip come before it)
    full: { frame: ["tv_story_frame", "tv_story_title"], ready: "tv_story_begin" },
    recap: { line: ["tv_story_recap", "tv_story_title"], show: false }, short: ["tv_story_short", "tv_story_title"],
    holds: { recap: "tv_story_begin", short: "tv_story_begin" },
    demoOwnPictures: false, readyAt: "column", mapPreview: "tv_map_next_story", praise: ["tv_praise_read"], wrap: ["story_end"],
  }),
};
export const GAME_IDS = Object.keys(GAMES) as GameId[];
/** The ledger key of a game type's exposure. */
export const gameKey = (id: GameId) => `game:${id}`;

// ---------------------------------------------------------------- line families
/** The slots of a line family: `<n>` a count (a number word), `<p>` a sound, `<w>` a word, `<pair>` / `<three>` words
 *  joined with "_", `<game>` a game id, `<reader>` kai or suki. */
export interface LineSlots { n?: number; p?: string; w?: string; pair?: string; three?: string; game?: string; reader?: string }
/** A family's line id for these slots ("tv_pocket_ready_<n>", { n: 2 } → "tv_pocket_ready_two"). A slot left empty
 *  leaves the id unfilled (the scene's HAS guard then skips it). */
export function fillLine(id: string, s: LineSlots = {}): string {
  return id.replace(/<(n|p|w|pair|three|game|reader)>/g, (m, k: keyof LineSlots) => {
    const v = s[k];
    if (v === undefined) return m;
    return k === "n" ? NUMBER_WORDS[v as number] ?? String(v) : String(v).replace(/:/g, "_");
  });
}

// ---------------------------------------------------------------- what each form says
/** The opening lines of a game on this form (the recap's or short's statement; the full form's frame), filled. A
 *  `variant` picks a short opening from `shortAlt`. `none` says nothing (the question only). */
export function openingLines(def: GameDef, form: FrameForm, slots: LineSlots = {}, variant?: string): string[] {
  const lines = form === "full" ? def.full.frame : form === "recap" ? def.recap.line : form === "short" ? (variant && def.shortAlt?.[variant]) || def.short : [];
  return lines.map((l) => fillLine(l, slots));
}
/** Does this form play the demo? The full form always (never skipped by the time governor), a recap when the registry
 *  says so; a short form only when it is "as recap" (`shortDemo`), otherwise only when the child taps the paw. */
export const playsDemo = (def: GameDef, form: FrameForm): boolean =>
  form === "full" ? !!def.full.show : form === "recap" ? def.recap.show : form === "short" ? !!def.shortDemo?.length : false;
/** The narrated demo's first-person lines on this form, filled (empty when the form plays no demo): the full form's,
 *  a recap's own where it has one (else the full form's), a short form's `shortDemo`. The paw's replay on a short form
 *  is the scene's canonical demo, not this. */
export function demoLines(def: GameDef, form: FrameForm, slots: LineSlots = {}): string[] {
  if (!playsDemo(def, form)) return [];
  const lines = form === "full" ? def.full.demo : form === "recap" ? def.recap.demo ?? def.full.demo : def.shortDemo ?? [];
  return lines.map((l) => fillLine(l, slots));
}
/**
 * The Ready question for this game on this form (TEACHER_SCRIPT §2.3), filled, or null when this form has no hold.
 * - full: the game's own Ready. Where that is the generic "Do you want to have a go now?", the save's first Ready asks
 *   `tv_ready_first` and its second `tv_ready_paw` (which introduces the paw): `once` names the ledger key to record
 *   with the hold's answer.
 * - recap: the registry's always-hold line (a starting gun), else `tv_ready_go` only when recapHold is true.
 * - short / none: only a starting gun.
 */
export function readyLine(def: GameDef, form: FrameForm, o: { recapHeld?: boolean; readyFirstDone?: boolean; readyPawDone?: boolean; slots?: LineSlots } = {}): { line: string; once?: "ready:first" | "ready:paw" } | null {
  const fill = (l: string) => fillLine(l, o.slots);
  if (form === "full") {
    const r = def.full.ready;
    if (!r) return null;
    if (r === "tv_ready_go" && !o.readyFirstDone) return { line: "tv_ready_first", once: "ready:first" };
    if (r === "tv_ready_go" && !o.readyPawDone) return { line: "tv_ready_paw", once: "ready:paw" };
    return { line: fill(r) };
  }
  if (form === "recap") {
    if (def.holds?.recap) return { line: fill(def.holds.recap) };
    return o.recapHeld ? { line: "tv_ready_go" } : null;
  }
  return def.holds?.short ? { line: fill(def.holds.short) } : null;
}

// ---------------------------------------------------------------- which games a level plays
const WARMUP_GAME: Partial<Record<WarmupBeat["kind"], GameId>> = { tap: "tap", fastslow: "fastslow", slowpick: "slowpick", notice: "notice", rail: "rail", which: "which", compound: "compound", sounds: "sounds", dots: "dots" };
const warmupGame = (b: WarmupBeat): GameId | null => (b.kind === "tapall" ? (b.how === "in" ? "tapall:in" : "tapall") : WARMUP_GAME[b.kind] ?? null);
/** The game types a level plays, in play order (no repeats). `school`: include a warm-up's Reception version's games
 *  too (both versions, when unsure which the child had). */
export function gamesOfLevel(l: Pick<Level, "id" | "kind" | "warmup" | "teach" | "words" | "read" | "trialGem">, o: { school?: boolean } = {}): GameId[] {
  const out: GameId[] = [];
  const add = (...ids: (GameId | null | false | undefined)[]) => ids.forEach((id) => id && !out.includes(id) && out.push(id));
  if (l.warmup) {
    const w = WARMUPS[l.warmup];
    for (const b of [...(w?.beats ?? []), ...(o.school ? w?.school?.R ?? [] : [])]) add(warmupGame(b));
    return out;
  }
  switch (l.kind) {
    case "firstsound": add("firstsound", "find", !!l.words?.length && "build", !!l.read?.length && "readcheck"); break;
    case "soundhunt": add("soundhunt", !!l.words?.length && "build", !!l.read?.length && "readcheck"); break;
    case "dojo":
      if (l.teach?.length) add("learn", "find", "build");
      else add("build", !!l.read?.length && "readcheck");
      break;
    case "battle": add(l.id === "review" ? "review" : l.trialGem ? "trial" : "battle"); break;
    case "boss": add("boss"); break;
    case "swap": add("swap"); break;
    case "run": add("run"); break;
    case "story": add("story"); break;
    case "sort": add("sort"); break;
  }
  return out;
}
/**
 * A level's closing line(s) (TEACHER_SCRIPT §5.6), said once at its end, after its last game: the wrap of the game that
 * leads it (w1-2 and w1-10: First Sounds' `tv_first_done`, after the Ninja Eyes; w1-7: `tv_hunt_done`, after the build
 * and the reading check; w2-1: `tv_learn_done`), except a dojo with no new sounds after land 1, which closes on
 * `tv_dojo_review_done` (w1-4 and w1-5 are "an early Word Building level": `tv_build_done`). Empty for a warm-up (its
 * `done` beat closes it) and for a level with no lead game. `tv_battle_why` (once per save) is the battle scene's.
 */
export function levelWrap(l: Pick<Level, "id" | "world" | "kind" | "warmup" | "teach" | "words" | "read" | "trialGem">): string[] {
  if (l.warmup) return [];
  if (l.kind === "dojo" && !l.teach?.length && l.world > 1) return ["tv_dojo_review_done"];
  const lead = gamesOfLevel(l)[0];
  return lead ? [...(GAMES[lead].wrap ?? [])] : [];
}
/** The map preview for a stone (TEACHER_SCRIPT §5.8): the first game of the level that has a preview and that this
 *  child has never played. */
export function previewOf(l: Parameters<typeof gamesOfLevel>[0], isNew: (id: GameId) => boolean): { game: GameId; line: string } | null {
  for (const id of gamesOfLevel(l)) {
    const line = GAMES[id].mapPreview;
    if (line && isNew(id)) return { game: id, line };
  }
  return null;
}

// ---------------------------------------------------------------- old saves
/** The ledger shape the migration reads and writes (narrate.tsx's per-save `narr`). */
export type GameLedger = Record<string, GameExposure>;
/** The key that marks a save's ledger as migrated. */
export const GAMES_MIGRATED = "games:v1";
/**
 * Old saves (TEACHER_SCRIPT §2.2): each game type with stars on any level that plays it is retired to its short form
 * (`{ n: 2, s: [0, 0], lastSession: -1 }`), so a returning child isn't walked through every game again. The old dojo
 * keys fold in: `dojo:first` (Word Building's first telling) into `game:build`; `dojo:welcome` and `dojo:back` into
 * `game:learn`, but only for a child with stars on a dojo that taught new sounds (w1-4 also records `dojo:welcome`, and
 * that child has never met New Sounds, whose full frame is Jonas's first-Dojo fix). A folded telling's session is -1,
 * so a game with one telling plays its recap on the next play. Returns the entries to write (empty when there is
 * nothing to change); the caller also sets GAMES_MIGRATED.
 */
export function migrateGames(ledger: Readonly<GameLedger>, stars: Readonly<Record<string, number>>, levels: readonly Level[]): GameLedger {
  if (ledger[GAMES_MIGRATED]) return {};
  const out: GameLedger = {};
  const starred = levels.filter((l) => (stars[l.id] ?? 0) > 0);
  const played = new Set(starred.flatMap((l) => gamesOfLevel(l, { school: true })));
  for (const id of played) if ((ledger[gameKey(id)]?.n ?? 0) < 2) out[gameKey(id)] = { ...ledger[gameKey(id)], n: 2, at: ledger[gameKey(id)]?.at ?? [], s: [0, 0], lastSession: -1 };
  const fold = (id: GameId, keys: string[]) => {
    const k = gameKey(id);
    let e: GameExposure | undefined = out[k] ?? ledger[k];
    for (const old of keys) for (let i = 0; i < (ledger[old]?.n ?? 0) && (e?.n ?? 0) < 2; i++) e = { ...told(e, -1, -1), lastSession: -1 };
    if (e && e !== (out[k] ?? ledger[k])) out[k] = e;
  };
  fold("build", ["dojo:first"]);
  if (starred.some((l) => l.kind === "dojo" && !!l.teach?.length)) fold("learn", ["dojo:welcome", "dojo:back"]);
  return out;
}

/** A game's entry after a completed telling (narrate.tsx framed()): one telling a session at most (the second must fall
 *  in a later session, ARCHITECTURE §6.2); either way the game counts as played now. */
export function framedEntry(e: GameExposure | undefined, at: number, session: number, now: number): GameExposure {
  return { ...(e?.s?.at(-1) === session ? e : told(e, at, session)), lastAt: now, lastSession: session };
}
/** A game's entry at the end of its beat (narrate.tsx played()): when, in which session, and whether the child
 *  struggled (which brings back the recap, with its Ready hold). */
export function playedEntry(e: GameExposure | undefined, session: number, now: number, struggled: boolean): GameExposure {
  return { ...(e ?? { n: 0, at: [] }), lastAt: now, lastSession: session, struggled };
}

/** frameForm and recapHold for a game's ledger entry (re-exported for the scenes' convenience). */
export { frameForm, recapHold };
