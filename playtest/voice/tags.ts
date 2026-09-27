// Reviewed line tags for the teacher-voice lines (TS §7.1), SCRIPT_FIXES Part B, the tg_<g>_<p>_way family, the
// re-recorded lines (TS §7.2) and the four lines the sidecar was missing. Rules first, then a reviewed table of the lines
// that teach something (the Jev drafts in line-tags.draft.ts were the starting point; many of their "explain" tags were
// wrong, e.g. "Baron Muddle took the sounds away." as explaining the first sound, so only these reviewed ones ship).
// Rewrites src/core/content/line-tags.ts in place: an existing entry is replaced on its own line (new hash, reviewed
// tags), a new one is appended before the closing brace.
//   bun playtest/voice/tags.ts
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { join } from "node:path";
import { LINES } from "../../src/content/lines";
import { lineHash } from "../../src/core/content/linebook";
import type { Key, LineMeta, Need, Tag, UttPurpose } from "../../src/core/types";

const ROOT = join(import.meta.dir, "../..");
const FILE = join(ROOT, "src/core/content/line-tags.ts");
const ids = readFileSync(join(import.meta.dir, "ids-all.txt"), "utf8").split(/\s+/).filter(Boolean);
const text = Object.fromEntries(LINES.map((l) => [l.id, l.text]));
const src = readFileSync(FILE, "utf8");
const existing: Record<string, LineMeta> = {};
for (const m of src.matchAll(/^  "([a-z0-9_]+)": (\{.*\}),$/gm)) existing[m[1]] = JSON.parse(m[2]);

const T = (key: Key, as: Tag["as"]): Tag => ({ key, as });
const N = (key: Key): Need => ({ key, level: "explained" });

/** The lines that teach, remind or clearly refer to a notion (reviewed by hand against TS). */
const TAGS: Record<string, Tag[]> = {
  tv_choose_hello: [T("char:sensei", "explain")],
  tv_choose_why: [T("char:baron", "mention"), T("fact:petals-scattered", "remind")],
  tv_train_hello: [T("term:dojo", "explain")],
  tv_dj_room: [T("term:dojo", "explain")],
  tv_train_help: [T("mech:help-button", "explain")],
  tv_train_try_help: [T("mech:help-button", "mention")],
  tv_train_speaker: [T("mech:replay-button", "mention")],
  tv_train_hear_again: [T("mech:replay-button", "explain")],
  tv_train_speaker_ok: [T("mech:replay-button", "remind")],
  tv_ears_frame: [T("mech:tap-picture", "explain")],
  tv_ts_meet: [T("idea:fast-and-slow-saying", "mention")],
  tv_ts_fast: [T("idea:fast-and-slow-saying", "mention")],
  tv_ts_slow: [T("idea:fast-and-slow-saying", "mention")],
  tv_ts_slow_one: [T("idea:fast-and-slow-saying", "mention")],
  tv_ts_again: [T("idea:fast-and-slow-saying", "mention")],
  tv_same_word: [T("idea:fast-and-slow-saying", "explain"), T("idea:words-are-made-of-sounds", "explain")],
  tv_ts_wrong_rabbit: [T("idea:fast-and-slow-saying", "remind")],
  tv_ts_wrong_tortoise: [T("idea:fast-and-slow-saying", "remind")],
  tv_praise_slowly: [T("idea:fast-and-slow-saying", "mention")],
  tv_rw_fast_slow: [T("idea:fast-and-slow-saying", "mention")],
  tv_notice_frame: [T("idea:first-sound", "mention")],
  tv_tap_hear_sun: [T("idea:first-sound", "mention")],
  tv_now_tap_hear_sock: [T("idea:first-sound", "mention")],
  tv_petal_first: [T("obj:petal", "explain")],
  tv_pocket_frame: [T("idea:first-sound", "mention")],
  tv_pocket_recap: [T("idea:first-sound", "mention")],
  tv_fix_start: [T("idea:first-sound", "remind")],
  tv_praise_start: [T("idea:first-sound", "mention")],
  tv_first_frame: [T("idea:first-sound", "mention")],
  tv_first_recap: [T("idea:first-sound", "mention")],
  tv_which_starts_it: [T("idea:first-sound", "ask")],
  tv_pocket_middle: [T("idea:middle-sound", "mention")],
  tv_hear_middle: [T("idea:middle-sound", "mention")],
  tv_fix_middle: [T("idea:middle-sound", "remind")],
  tv_hunt_frame: [T("idea:middle-sound", "mention")],
  tv_hunt_recap: [T("idea:middle-sound", "mention")],
  tv_hunt_q: [T("idea:middle-sound", "ask")],
  tv_not_in_middle: [T("idea:middle-sound", "mention")],
  tv_praise_middle: [T("idea:middle-sound", "mention")],
  tv_next_middle: [T("idea:middle-sound", "explain")],
  tv_last_first: [T("idea:last-sound", "explain")],
  tv_rail_frame: [T("idea:left-to-right", "explain")],
  tv_rail_turn: [T("idea:left-to-right", "remind")],
  tv_rail_start: [T("idea:left-to-right", "remind")],
  tv_dots_ido: [T("idea:left-to-right", "remind")],
  tv_praise_order: [T("idea:left-to-right", "mention")],
  tv_guess_frame: [T("idea:words-are-made-of-sounds", "mention")],
  tv_guess_recap: [T("idea:words-are-made-of-sounds", "mention")],
  tv_dots_frame: [T("idea:words-are-made-of-sounds", "remind")],
  tv_dots_recap: [T("idea:words-are-made-of-sounds", "remind")],
  st_hear_two: [T("idea:words-are-made-of-sounds", "mention")],
  st_hear_three: [T("idea:words-are-made-of-sounds", "mention")],
  tv_build_lines: [T("idea:one-line-per-sound", "explain")],
  tv_build_again_3: [T("idea:one-line-per-sound", "remind")],
  tv_i_say_slowly: [T("idea:fast-and-slow-saying", "mention")],
  tv_first_is: [T("idea:first-sound", "mention")],
  tv_lets_say_read: [T("idea:say-the-sounds-read-the-word", "explain")],
  tv_story_yours: [T("idea:say-the-sounds-read-the-word", "remind")],
  tv_you_read_first: [T("mech:tap-sound-buttons", "explain")],
  tv_swap_read_first: [T("mech:tap-sound-buttons", "explain")],
  tv_watch_write: [T("idea:sounds-have-spellings", "mention")],
  tv_how_we_write: [T("idea:sounds-have-spellings", "explain")],
  tv_and_how_we_write: [T("idea:sounds-have-spellings", "remind")],
  tv_learn_how: [T("idea:sounds-have-spellings", "mention")],
  tv_ne_frame: [T("idea:sounds-have-spellings", "mention")],
  tv_ne_recap: [T("idea:sounds-have-spellings", "mention")],
  tv_which_write: [T("idea:sounds-have-spellings", "ask")],
  tv_which_way_write_it: [T("idea:sounds-have-spellings", "ask")],
  tv_praise_write: [T("idea:sounds-have-spellings", "mention")],
  tv_battle_ready: [T("term:spelling", "explain")],
  tv_battle_why: [T("char:baron", "mention")],
  tv_battle_oh_no: [T("char:baron", "mention")],
  tv_battle_recap: [T("char:baron", "mention")],
  tv_swap_oh_dear: [T("char:baron", "mention")],
  tv_to_reward: [T("char:baron", "mention")],
  tv_swap_frame: [T("idea:change-one-sound", "explain")],
  tv_swap_again: [T("idea:change-one-sound", "remind")],
  tv_swap_kick: [T("idea:change-one-sound", "mention")],
  tv_praise_swap: [T("idea:change-one-sound", "mention")],
  tv_which_changes: [T("idea:change-one-sound", "ask")],
  st_what_change: [T("idea:change-one-sound", "ask")],
  st_first_changes: [T("idea:change-one-sound", "mention"), T("idea:first-sound", "mention")],
  st_middle_changes: [T("idea:change-one-sound", "mention"), T("idea:middle-sound", "mention")],
  st_last_changes: [T("idea:change-one-sound", "mention"), T("idea:last-sound", "mention")],
  tv_rw_book: [T("obj:sticker-book", "explain")],
  tv_rw_every: [T("idea:stickers-for-pictures", "explain")],
  tv_rw_tap: [T("obj:sticker-book", "mention")],
  tv_rw_link_book: [T("obj:sticker-book", "mention")],
  tv_rw2_flower: [T("obj:world-flower", "explain")],
  tv_map_flower: [T("obj:world-flower", "mention")],
  tv_to_flower: [T("obj:world-flower", "mention")],
  tv_flower_bye: [T("obj:world-flower", "mention")],
  tv_rw2_tap_petal: [T("obj:petal", "mention")],
  tv_flower_petal: [T("obj:petal", "explain")],
  tv_flower_tap: [T("obj:petal", "mention")],
  tv_petal_say: [T("obj:petal", "mention")],
  tv_petal_say_short: [T("obj:petal", "mention")],
  tv_new_petal_say: [T("obj:petal", "mention")],
  tv_petal_hint: [T("obj:petal", "mention")],
  st_found_new_sounds: [T("obj:petal", "mention")],
  tv_trial_frame: [T("obj:gem", "mention")],
  tv_practise_gem: [T("obj:gem", "mention")],
  tv_sort_open: [T("idea:same-sound-different-spellings", "explain")],
  tv_sort_done: [T("idea:same-sound-different-spellings", "remind")],
  tv_learn_frame_ways: [T("idea:same-sound-different-spellings", "mention")],
  tv_and_another_way: [T("idea:same-sound-different-spellings", "remind")],
  st_know_this_sound: [T("idea:same-sound-different-spellings", "explain")],
  st_two_letters_too: [T("idea:two-letters-one-sound", "remind")],
  tv_sort_see: [T("term:spelling", "mention")],
  tv_praise_sorted: [T("term:spelling", "mention")],
  // the four the sidecar was missing
  fm_hear_sounds_short: [T("idea:fast-and-slow-saying", "mention"), T("idea:words-are-made-of-sounds", "remind")],
  r2_gems_more: [T("obj:gem", "mention"), T("idea:gems-fill-with-practice", "remind")],
};
/** What a line presupposes (only where it plainly can't be followed without it). */
const NEEDS: Record<string, Need[]> = {
  tv_petal_say: [N("obj:petal")], tv_petal_say_short: [N("obj:petal")], tv_new_petal_say: [N("obj:petal")],
  tv_rw2_tap_petal: [N("obj:petal")], tv_flower_tap: [N("obj:petal")], tv_petal_hint: [N("obj:petal")],
  tv_rail_start: [N("idea:left-to-right")], tv_dots_ido: [N("idea:left-to-right")],
  tv_swap_again: [N("idea:change-one-sound")], st_two_letters_too: [N("idea:two-letters-one-sound")],
  tv_sort_done: [N("idea:same-sound-different-spellings")], tv_and_how_we_write: [N("idea:sounds-have-spellings")],
  tv_which_write: [N("idea:sounds-have-spellings")], tv_which_way_write_it: [N("idea:sounds-have-spellings")],
  tv_train_speaker_ok: [N("mech:replay-button")], tv_fix_start: [N("idea:first-sound")], tv_fix_middle: [N("idea:middle-sound")],
};

const has = (re: RegExp, id: string) => re.test(id);
function purposeOf(id: string, t: string): UttPurpose {
  if (/^tg_/.test(id) || /^tv_spelt_like_this_/.test(id)) return "explanation";
  if (has(/^tv_(praise_|yay_)|^tv_(said_well|run_jump_ok|streak_10|silly)$/, id)) return id === "tv_silly" ? "banter" : "praise";
  if (has(/^(tv_(w\d_end|w\d_done|\w+_done)|tv_learn_all_)/, id)) return "praise";
  if (has(/^(tv_to_reward|tv_won_|tv_rw_book|tv_rw_every|tv_rw_tap|tv_train_gong_ok|st_found_new_sounds|r2_gems_more)/, id)) return "reward";
  if (has(/^(tv_choose_hello|tv_choose_why|tv_battle_oh_no|tv_swap_oh_dear|tv_boss_calm|tv_rw2_flower|tv_map_intro|tv_map_flower|tv_welcome_back|tv_battle_why|tv_story_title|tv_rhyme)$/, id)) return "exposition";
  if (has(/^(tv_next_game|tv_next_build|tv_next_build_plain|tv_w1_end|tv_rw_link_book|tv_rw_next|tv_to_flower|tv_to_flower_first|tv_flower_bye|tv_opt_to_dojo|tv_opt_ok_notyet|tv_train_done|tv_first_game|tv_map_next_\w+|tv_practise_again|tv_rest|tv_ne_again|tv_ne_new_sounds|tv_build_dojo|tv_build_again_short|tv_slow_short|tv_guess_short|tv_story_short|tv_learn_short_\w+|tv_learn_recap_\w+|tv_first_again_\w+|tv_hunt_again|tv_rail_again|tv_which_again|tv_squish_again|tv_ts_again|tv_readers_back|tv_battle_again|tv_boss_again|tv_run_again|tv_review_short|tv_trial_short)$/, id)) return "transition";
  if (has(/^(tv_opt_grownups|tv_jump_offer)$/, id)) return "meta";
  if (has(/^(tv_(fix_\w+|ts_wrong_\w+|not_in_middle|run_fix|sort_fix|which_fix_\w+|listen_here|thats_write|lets_check|right_\w+|slow_again|guess_again|find_again_\w+)|st_\w+_changes|fm_notice_sun_sock)$/, id)) return id.startsWith("st_") ? "model" : "correction";
  if (has(/^tv_(idle_\w+|petal_hint|show_offer\w*|offer_show\w*|take_time|look_glow|listen_sound_again|which_starts_it|which_way_write_it|both_again|which_changes|dojo_idle_say|dojo_help_sound|ready_help|story_tick_idle|opt_again|opt_ask|story_together|story_help)$/, id)) return "hint";
  if (has(/^(tv_(ears_demo|which_demo|which_so|squish_slow|squish_fast|i_hear_\w+|guess_so_\w+|so_i_tap|let_me_listen|ido_pair_\w+|first_is|sort_ido|sort_see|sort_so|pocket_ido|so_pocket|hear_middle|hear_in_\w+|slow_demo|my_sounds|dots_word_ido|dots_ido|swap_change_to|swap_in|rail_ido|i_say_slowly|ts_fast|ts_slow|ts_slow_one|yes_\w+|battle_card)|r2_dog_fish)$/, id)) return "model";
  if (/\?\s*$/.test(t) || /^tv_(ready_\w+|your_word\w*|our_word|next_word|tap_hear_\w+|now_tap_hear_\w+|rc_q|which_q_\w+|hunt_q|which_write|find_write|now_find|you_find_last|swap_kick|swap_pick|run_which|guess_q|slow_yours|tap_it_say\w*|tap_letter_say|once_more|petal_say\w*|new_petal_say|rw2_tap_petal|flower_tap|train_gong|train_hear_again|train_try_help|story_begin|story_tick|story_choice|by_yourself\w*|together|swap_now_change|swap_both|now_say_word|find_words_in|place_findall_round|pocket_more_\w+|pocket_middle_more_\w+|word_card|rail_yours|now_your_turn|turn_again|opt_notyet|opt_yes|first_sound|next_sound\w*|here_sound|here_it_comes|learn_first\w*|learn_next|learn_another|learn_last|another_sound|flower_recap|flower_petal|tap_letter_say)$|^st_(first_q\d|find_q\d)$/.test(id)) return "prompt";
  if (/[a-z]_(frame|how|recap|lines|open)$|^tv_(learn_frame_\w+|dj_room|train_\w+|ears_on|same_word|petal_first|rail_frame|build_lines|swap_frame|sort_frame|trial_\w+|review_\w+|place_\w+|story_frame|story_yours|story_q|readers_meet|rc_how|bar_down|how_we_write|and_how_we_write|and_another_way|watch_write|lets_say_read|last_first|next_middle|x_two_sounds|choose_\w+|film_arrow|opt_why|opt_echo_\w+|mix_up|rw2_\w+|map_hint|word_hunt_frame|run_\w+|boss_\w+|battle_\w+|squish_\w+|which_frame|ne_frame|learn_ready|dots_ready|build_ready|swap_ready|squish_ready|rail_ready|pocket_ready_\w+|ready_\w+|ts_meet|notice_frame|pocket_frame|slow_frame|guess_frame|dots_frame|first_frame|hunt_frame|build_frame|pocket_middle|guess_together|practise_gem|now_readers|rw_fast_slow|silly)$/.test(id))
    return /explain|same_word|petal_first|rail_frame|build_lines|how_we_write|lets_say_read|last_first|next_middle|x_two_sounds|ears_on|dj_room|train_hello|rw2_flower|bar_down|trial_heart|trial_bar/.test(id) ? "explanation" : "instruction";
  return "instruction";
}
/** instructions the child must hold at once: "Tap the petal, and say it with me." is two; "Tap it, and your ninja will kick
 *  it." and "Tap the green arrow, and let's begin." are one */
const stepsOf = (_id: string, t: string, purpose: UttPurpose): number | undefined => {
  if (!["instruction", "prompt", "hint", "correction"].includes(purpose)) return undefined;
  return /\b(tap|read)\b[^.?!]*,\s*and (say|hear|listen|tap|catch|kick)\b/i.test(t) ? 2 : 1;
};
/** reviewed purposes where the rules above guess wrong */
const PURPOSE: Record<string, UttPurpose> = {
  tv_learn_ready: "prompt", tv_battle_go: "prompt", tv_trial_ready: "prompt", tv_boss_ready: "prompt", tv_run_ready: "prompt",
  tv_run_again: "prompt", tv_review_short: "prompt", tv_trial_short: "prompt", tv_show_again: "hint", tv_battle_card: "prompt",
  st_hear_two: "model", st_hear_three: "model", st_know_this_sound: "explanation", st_two_letters_too: "reminder",
  st_last_one: "transition", st_th_moth_sometimes: "explanation", st_another_new_sound: "prompt", tv_rest: "meta",
  tv_place_done: "transition", tv_opt_echo_notyet: "model", tv_opt_echo_school: "model", tv_choose_ninja: "exposition",
  tv_readers_meet: "exposition", tv_train_done: "transition", tv_w1_end: "transition",
};

const out: Record<string, LineMeta> = {};
for (const id of ids) {
  const t = text[id];
  if (t === undefined) throw new Error(`not in LINES: ${id}`);
  const keep = existing[id];
  const rerecordedOrChanged = !!keep && !id.startsWith("tv_") && !TAGS[id];
  if (rerecordedOrChanged) {
    // a re-recorded line (TS §7.2) or a regenerated tg_t_t_* line: the reviewed tags stand, the hash is the new text's
    out[id] = { ...keep, hash: lineHash(t, keep.who) };
    continue;
  }
  const purpose = id === "nav_ready" ? "hint" : PURPOSE[id] ?? purposeOf(id, t);
  // a tg_<g>_<p>_way line says what its tg_<g>_<p>_in tail said, in a whole sentence: the same tags
  const tags = TAGS[id] ?? (id.endsWith("_way") && existing[id.replace(/_way$/, "_in")] ? existing[id.replace(/_way$/, "_in")].tags : []);
  const steps = stepsOf(id, t, purpose);
  out[id] = {
    id, hash: lineHash(t, "sensei"), who: "sensei", purpose, tags, needs: NEEDS[id] ?? [],
    repetition: purpose === "praise" && !/_done$|_end$|^tv_learn_all_/.test(id) ? "vary" : "routine",
    ...(steps ? { steps } : {}),
    ...(/^tv_(idle_point|fix_together|right_\w+)$/.test(id) ? { givesAnswer: true } : {}),
  };
}
let body = src;
const line = (m: LineMeta) => `  ${JSON.stringify(m.id)}: ${JSON.stringify(m)},`;
const appended: string[] = [];
for (const [id, m] of Object.entries(out)) {
  const re = new RegExp(`^  "${id}": \\{.*\\},$`, "m");
  if (re.test(body)) body = body.replace(re, line(m));
  else appended.push(line(m));
}
body = body.replace(/\n\};\s*$/, `\n  // --- Teacher voice (docs/TEACHER_SCRIPT.md, 27 Sep), SCRIPT_FIXES Part B and the tg_<g>_<p>_way family: reviewed\n  // by the lines lane (playtest/voice/tags.ts).\n${appended.join("\n")}\n};\n`);
if (process.argv.includes("--dry")) {
  for (const m of Object.values(out)) console.log(m.id.padEnd(28), m.purpose.padEnd(11), (m.steps ?? "").toString().padEnd(2), m.repetition.padEnd(8), m.tags.map((t) => `${t.key}/${t.as}`).join(" "), "|", text[m.id]);
} else {
  const tmp = FILE + ".tmp";
  writeFileSync(tmp, body);
  renameSync(tmp, FILE);
}
const count: Record<string, number> = {};
for (const m of Object.values(out)) count[m.purpose] = (count[m.purpose] ?? 0) + 1;
console.log(`tagged ${Object.keys(out).length} (${appended.length} appended)`, count);
