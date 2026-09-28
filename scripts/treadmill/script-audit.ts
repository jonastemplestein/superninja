// The script editor's counts: reads transcripts (journey-<persona>.json from transcript.ts, continuous-<persona>.json
// from continuous.ts) and counts the composition problems docs/SCRIPT_STYLE.md names: lines said most often, the
// same utterance echoed back to back ("/ae/ It's two letters, but it's one sound. /ae/ It's two letters, but it's one
// sound."), spliced chains, stacked praise, silences, cut-off clips and explanation dosage per level.
// Usage: bun scripts/treadmill/script-audit.ts <transcript.json>... [--out report.md]
//        [--check [--findings findings.json] [--metrics metrics.json]]
// --check: the acceptance targets of docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.2 (the SCRIPT_FIXES rows and the teacher's
// voice rows, TV-F4.1), computed per transcript; prints a table (and appends it to --out), writes treadmill findings
// (sig `script:<metric>`) and the raw values, and exits 1 when any target fails. See `checkRun()` below. Since verify
// round 2 it also measures the talk after a level (`talk-reward`: a level's close into its reward, the reward, the trips,
// the map), the longest run of talk anywhere (`talk-longest`), and a question asked item after item in rotated variants
// with no miss (`ask-cycle`); `fs-talk` measures a run into the reward whole.
// Reads continuous.ts JSON ({ evs, meta?, navlog? }), transcript.ts journeys ([{ name, events }]) and the teacher-voice
// listener's events.json (the same shape as continuous.ts).
import { readFileSync, writeFileSync } from "node:fs";
import { LINES } from "../../src/content/lines";
import { WORD_BY_TEXT } from "../../src/content/phonics";
import { LEVELS } from "../../src/content/worlds";
import { FS_IDEA_ONLY } from "../../src/content/narrative";
import { lineTags } from "../../src/core/content/line-tags";
import { normText, wordCount } from "../lib/words";
import { durations } from "./durations";
import type { Finding } from "./types";
import { helpGuard } from "../lib/help";
if (import.meta.main) helpGuard(import.meta.url); // --help prints the usage above and exits

const args = process.argv.slice(2);
const VALUE_FLAGS = new Set(["--out", "--findings", "--metrics"]);
const flag = (k: string) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : null;
};
const OUT = flag("--out");
const CHECK = args.includes("--check");
const FINDINGS = flag("--findings");
const METRICS = flag("--metrics");
const FILES = args.filter((a, i) => !a.startsWith("--") && !VALUE_FLAGS.has(args[i - 1]));
/** Clip lengths: durations.json, with the slow words and any clip newer than it measured from the file (durations.ts). */
const DUR: Record<string, number> = durations();
const TEXT = new Map(LINES.map((l) => [l.id, l.text]));

/** `lit`: which fast/slow badges were lit as the clip started (continuous.ts samples the page: the nav layer's tortoise
 *  and rabbit, or a warm-up's own); `which`/`how`: a nav log `speed` or `rabbit` entry (TEACHER_SCRIPT §9.6). */
type Ev = { t: number; kind: string; text: string; id?: string; url?: string; dur?: number; cut?: boolean; who?: string; lit?: string[]; which?: string };
type Seg = { name: string; events: Ev[] };

/** Praise and celebration lines (the child hears these as "well done"). */
const PRAISE = new Set(["yay_1", "yay_2", "yay_3", "yay_4", "yay_5", "yay_6", "yay_7", "yay_8", "yay_9", "yay_10", "well_read", "well_spelt", "streak_3", "streak_6", "streak_10", "audit_streak_first", "battle_win", "battle_boss_win", "dojo_done", "sort_done", "swap_done", "fm_l1_done", "fm_l2_done", "fm_l5_done", "fm_found_all", "fm_found_both", "tut_good", "run_end", "fm_super_listener", "trial_win", "fm_help_ok", "chose", "petal_got", "petals_got"]);
/** Explanations whose dosage matters (Sounds~Write concepts, terms, ideas). */
const EXPLAIN = ["t_two_letters", "t_three_letters", "t_four_letters", "two_letters_one_sound", "t_one_spelling_two_sounds", "same_sound_diff", "same_sound_new", "audit_hear_see", "audit_spell_it", "how_we_spell", "t_way_we_spell", "wf_spelling_of", "t_spelling_of", "t_another_way", "audit_gem_first", "audit_gem_more", "r2_gems_more", "fm_hear_sounds", "fm_hear_sounds_short", "audit_made_of_sounds", "audit_middle_place", "audit_last_place", "fm_l2_way", "audit_left_right", "dojo_hello", "audit_dojo_first", "audit_dojo_back", "tut_speaker", "fm_speaker", "audit_sort_first", "audit_sort_again", "audit_sort_pair", "audit_sort_three", "t_often_end_short", "audit_neighbours", "audit_neighbours_plain", "flower_intro", "wf_i3", "audit_petal_means", "t_everyone_say", "fm_rw_every"];

function idOf(e: Ev): string | null {
  if (e.id) return e.id;
  const u = e.url ?? "";
  let m;
  if ((m = u.match(/\/a\/l\/([^/]+)\.mp3/))) return m[1];
  if ((m = u.match(/\/a\/p\/([^/]+)\.mp3/))) return `sound:${m[1]}`;
  if ((m = u.match(/\/a\/w\/([^/]+)\.mp3/))) return `word:${m[1]}`;
  if ((m = u.match(/\/a\/x\/([^/]+)\.mp3/))) return `stretch:${m[1]}`;
  if ((m = u.match(/\/a\/o\/([^/]+)\.mp3/))) return `onset:${m[1]}`;
  if ((m = u.match(/\/a\/s\/([^/]+)\.mp3/))) return `story:${m[1]}`;
  if (e.kind === "sound") return `sound:${e.text.replace(/\//g, "")}`;
  if (e.kind === "word") return `word:${e.text}`;
  if (e.kind === "stretch") return `stretch:${e.text}`;
  return null;
}
function durOf(id: string): number {
  const [k, v] = id.includes(":") ? id.split(":") : ["l", id];
  const key = k === "l" ? `l/${v}` : k === "sound" ? `p/${v}` : k === "word" ? `w/${v}` : k === "stretch" ? `x/${v}` : k === "onset" ? `o/${v}` : `s/${v}`;
  return (DUR[key] ?? 900) / 1000;
}
const SPEECH = new Set(["say", "sound", "word", "stretch", "onset", "story"]);
const label = (id: string) => (id.startsWith("sound:") ? `/${id.slice(6)}/` : id.startsWith("word:") ? `"${id.slice(5)}"` : id.startsWith("stretch:") ? `"${id.slice(8)}" (slowly)` : id.startsWith("onset:") ? `"${id.slice(6)}" (held)` : TEXT.get(id) ?? id);
/** the shape of an utterance: sounds and words become placeholders, so "/ae/ It's two letters…" and "/ee/ It's two letters…" match */
const shape = (ids: string[]) => ids.map((i) => (i.startsWith("sound:") ? "/X/" : i.startsWith("word:") || i.startsWith("stretch:") || i.startsWith("onset:") ? "W" : i)).join(" + ");
const isFragment = (id: string) => { const t = TEXT.get(id) ?? ""; return t.endsWith("...") || t.startsWith("...") || /^[a-z]/.test(t); };

function load(file: string): { persona: string; segs: Seg[]; continuous: boolean } {
  const raw = JSON.parse(readFileSync(file, "utf8"));
  const persona = file.replace(/.*\/(journey|continuous)-/, "").replace(/\.json$/, "");
  if (Array.isArray(raw)) return { persona, continuous: false, segs: raw.map((r: any) => ({ name: r.name, events: r.events })) };
  // continuous: one stream; segments start at each piece marker
  const segs: Seg[] = [];
  let cur: Seg = { name: "start", events: [] };
  for (const e of raw.evs as Ev[]) {
    if (e.kind === "piece") {
      if (cur.events.length) segs.push(cur);
      cur = { name: e.text, events: [] };
      continue;
    }
    cur.events.push(e);
  }
  if (cur.events.length) segs.push(cur);
  return { persona, continuous: true, segs };
}

type Utt = { t: number; end: number; ids: string[]; seg: string };
function utterances(segs: Seg[]): Utt[] {
  const out: Utt[] = [];
  for (const s of segs) {
    let u: Utt | null = null;
    for (const e of s.events) {
      // a tap ends the utterance (what follows is a response to it)
      if (e.kind === "tap" && u) {
        out.push(u);
        u = null;
        continue;
      }
      if (!SPEECH.has(e.kind)) continue;
      const id = idOf(e);
      if (!id) continue;
      const d = e.dur ? e.dur / 1000 : durOf(id);
      // one utterance while clips follow each other within 0.6 s of the last one's end (a composed say())
      if (u && e.t - u.end < 0.6) {
        u.ids.push(id);
        u.end = Math.max(u.end, e.t + d);
      } else {
        if (u) out.push(u);
        u = { t: e.t, end: e.t + d, ids: [id], seg: s.name };
      }
    }
    if (u) out.push(u);
  }
  return out;
}

function report(file: string): string {
  const { persona, segs, continuous } = load(file);
  const lines: string[] = [`## ${file.replace(/.*playtest\//, "playtest/")} (${persona}${continuous ? ", one continuous page" : ", one page per level"})`, ""];
  const speech = segs.flatMap((s) => s.events.filter((e) => SPEECH.has(e.kind)).map((e) => ({ ...e, seg: s.name, lid: idOf(e)! })));
  const says = speech.filter((e) => e.kind === "say");
  const utts = utterances(segs);
  lines.push(`${says.length} Sensei lines, ${speech.length - says.length} sounds and words, ${utts.length} utterances in ${segs.length} ${continuous ? "pieces" : "levels"}.`, "");

  // 1. most-said lines
  const count = new Map<string, number>();
  for (const e of says) count.set(e.lid, (count.get(e.lid) ?? 0) + 1);
  const top = [...count].sort((a, b) => b[1] - a[1]).slice(0, 30);
  lines.push("### Most-said lines", "", "| Line | Times | Text |", "|---|---|---|", ...top.map(([id, n]) => `| ${id} | ${n} | ${label(id)} |`), "");

  // 2. echoes: the same utterance shape twice or more in a row within 25 s
  const echoes: { seg: string; t: number; n: number; text: string }[] = [];
  for (let i = 0; i < utts.length; ) {
    let j = i + 1;
    const sh = shape(utts[i].ids);
    while (j < utts.length && utts[j].seg === utts[i].seg && shape(utts[j].ids) === sh && utts[j].t - utts[j - 1].t < 25 && utts[i].ids.some((x) => !x.includes(":"))) j++;
    if (j - i >= 2) echoes.push({ seg: utts[i].seg, t: utts[i].t, n: j - i, text: utts.slice(i, j).map((u) => u.ids.map(label).join(" ")).join(" ‖ ") });
    i = j;
  }
  lines.push(`### Echoes: the same utterance shape back to back (${echoes.length})`, "", ...echoes.slice(0, 40).map((e) => `- ${e.seg} @${e.t.toFixed(1)}s ×${e.n}: ${e.text.slice(0, 260)}`), "");

  // 2b. near repeats: the same line again within 15 s in the same level or piece (per line: how often, and an example)
  const near = new Map<string, { n: number; ex: string }>();
  for (let i = 0; i < says.length; i++) {
    const e = says[i];
    const prev = says.slice(Math.max(0, i - 12), i).reverse().find((x) => x.lid === e.lid && x.seg === e.seg && e.t - x.t < 15);
    if (!prev) continue;
    const r = near.get(e.lid) ?? { n: 0, ex: `${e.seg} @${prev.t.toFixed(1)}s and @${e.t.toFixed(1)}s` };
    r.n++;
    near.set(e.lid, r);
  }
  lines.push(`### Near repeats: the same line again within 15 s (${[...near.values()].reduce((a, b) => a + b.n, 0)})`, "", "| Line | Repeats | Text | Example |", "|---|---|---|---|", ...[...near].sort((a, b) => b[1].n - a[1].n).slice(0, 25).map(([id, r]) => `| ${id} | ${r.n} | ${label(id).slice(0, 60)} | ${r.ex} |`), "");

  // 3. splices: an utterance joined from a fragment line and sound/word clips; long chains
  const spliced = utts.filter((u) => u.ids.length > 1 && u.ids.some((x) => !x.includes(":") && isFragment(x)));
  const long = utts.filter((u) => u.ids.length >= 5);
  const shapes = new Map<string, number>();
  for (const u of spliced) shapes.set(shape(u.ids), (shapes.get(shape(u.ids)) ?? 0) + 1);
  lines.push(`### Spliced utterances: ${spliced.length} of ${utts.length} (${Math.round((100 * spliced.length) / Math.max(1, utts.length))}%); chains of 5+ clips: ${long.length}`, "", "Commonest spliced shapes:", "", ...[...shapes].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([s, n]) => `- ×${n} ${s.split(" + ").map((x) => (x === "/X/" || x === "W" ? x : `‹${x}›`)).join(" + ")}`), "", "Longest chains:", "", ...long.sort((a, b) => b.ids.length - a.ids.length).slice(0, 8).map((u) => `- ${u.seg} @${u.t.toFixed(1)}s (${u.ids.length} clips): ${u.ids.map(label).join(" ")}`.slice(0, 300)), "");

  // 4. stacked praise: two or more praise lines within 5 s
  const praise = says.filter((e) => PRAISE.has(e.lid));
  const stacks: string[] = [];
  for (let i = 0; i < praise.length; ) {
    let j = i + 1;
    while (j < praise.length && praise[j].seg === praise[i].seg && praise[j].t - praise[j - 1].t < 5) j++;
    if (j - i >= 2) stacks.push(`- ${praise[i].seg} @${praise[i].t.toFixed(1)}s: ${praise.slice(i, j).map((p) => `"${p.text}"`).join(" → ")}`);
    i = j;
  }
  const mins = Math.max(1, segs.reduce((s, sg) => { const ts = sg.events.map((e) => e.t); return s + (ts.length ? Math.max(...ts) - Math.min(...ts) : 0); }, 0) / 60);
  lines.push(`### Praise: ${praise.length} lines (${(praise.length / mins).toFixed(1)} a minute); stacked (2+ within 5 s): ${stacks.length}`, "", ...stacks.slice(0, 25), "");

  // 5. silences: 10 s or more with no speech, and what surrounded them
  const gaps: string[] = [];
  for (let i = 0; i + 1 < utts.length; i++) {
    const a = utts[i], b = utts[i + 1];
    if (a.seg !== b.seg) continue;
    const g = b.t - a.end;
    if (g >= 10) {
      const seg = segs.find((s) => s.name === a.seg)!;
      const taps = seg.events.filter((e) => e.kind === "tap" && e.t > a.end && e.t < b.t).length;
      gaps.push(`- ${a.seg} @${a.end.toFixed(1)}s: ${g.toFixed(1)} s silent (${taps} taps) after "${a.ids.map(label).join(" ").slice(0, 80)}", before "${b.ids.map(label).join(" ").slice(0, 60)}"`);
    }
  }
  lines.push(`### Silences of 10 s or more inside a level or piece: ${gaps.length}`, "", ...gaps.slice(0, 25), "");

  // 6. cut-off clips: the next clip started before this one could have ended
  const cuts: string[] = [];
  for (let i = 0; i + 1 < speech.length; i++) {
    const e = speech[i], n = speech[i + 1];
    const d = e.dur ? e.dur / 1000 : durOf(e.lid);
    if (e.seg === n.seg && n.t < e.t + d - 0.25) cuts.push(`- ${e.seg} @${e.t.toFixed(1)}s: "${label(e.lid).slice(0, 70)}" cut after ${(n.t - e.t).toFixed(1)} of ${d.toFixed(1)} s by ${label(n.lid).slice(0, 50)}`);
  }
  lines.push(`### Cut-off clips: ${cuts.length}`, "", ...cuts.slice(0, 25), "");

  // 7. explanation dosage per level or piece
  const dose = new Map<string, Map<string, number>>();
  for (const e of says) {
    if (!EXPLAIN.includes(e.lid)) continue;
    const m = dose.get(e.lid) ?? new Map<string, number>();
    m.set(e.seg, (m.get(e.seg) ?? 0) + 1);
    dose.set(e.lid, m);
  }
  lines.push("### Explanations: where and how often", "", "| Line | Total | Where (times) |", "|---|---|---|", ...[...dose].sort((a, b) => [...b[1].values()].reduce((x, y) => x + y) - [...a[1].values()].reduce((x, y) => x + y)).map(([id, m]) => `| ${id} "${label(id).slice(0, 50)}" | ${[...m.values()].reduce((x, y) => x + y)} | ${[...m].map(([s, n]) => `${s}${n > 1 ? ` ×${n}` : ""}`).join(", ")} |`), "");
  return lines.join("\n");
}

// ================================================================ --check: the §11.2 targets
// Everything below reads a transcript into one list of events with, for each, the level and the game (docs/
// TEACHER_SCRIPT.md §2.6's game ids) it belongs to, then computes one metric per §11.2 row. A metric is "n/a" when the
// transcript can't show it (no w2-1 in it, no splitter taps, no recorded teacher-voice lines): n/a never fails.

/** One event of a transcript, normalised: `lid` the clip id (line id, sound:s, word:sun...), `level` the level on screen,
 *  `game` the game being played (continuous.ts records it; older transcripts get it from the scene), `nav` the nav
 *  control a tap was on. New continuous.ts kinds: route, game, turn (a question opened), hold (a held step or a Ready,
 *  with `id`, `end` and `how`), sfx, split (the splitter's deliberate split), paw. */
export type CEv = Ev & { lid?: string; level: string | null; game: string | null; nav?: string | null; show?: string; route?: string; end?: number; how?: string; seg: string; dom?: any; next?: string; tapped?: string };
export interface Run {
  file: string;
  label: string;
  persona: string;
  from: string | null;
  optin: string;
  /** a brand-new child (every game is met for the first time) */
  fresh: boolean;
  /** one page for the whole run (continuous.ts), or one page and a fresh save per level (transcript.ts) */
  continuous: boolean;
  evs: CEv[];
  /** did the recorder publish game ids, turns and holds (continuous.ts from 27 Sep)? */
  rich: boolean;
  /** the tier lines the streak granted (streak.ts's __snStreak.lines, game seconds), when the recorder had them */
  streakLines?: { t: number; id: string; tier: number; n: number; answers: number; levelAnswers: number }[];
}

const LEVEL_KIND = new Map(LEVELS.map((l) => [l.id, l.kind]));
const LEVEL_INDEX = new Map(LEVELS.map((l, i) => [l.id, i]));
/** What a line said, as the transcript recorded it (the build's words; lines.ts may have moved on since), else lines.ts. */
const TEXT_OF = (e: { lid?: string; text?: string; kind?: string }) => (e.kind === "say" && e.text && !e.text.startsWith("[line ") ? e.text : undefined) ?? (e.lid && !e.lid.includes(":") ? TEXT.get(e.lid) : undefined) ?? e.text ?? "";
const norm = normText;
/** Words in a line: the shared count (scripts/lib/words.ts), the one scripts/gen-audio.ts gates a take's pace with, so
 *  `fast-line` here and the recording's own check agree on every line. Re-exported for older importers. */
export { wordCount };
/** Sentences, split after . ! ? (a "..." is a pause or a lead-in's tail, not the end of a sentence). */
export function sentences(text: string): string[] {
  const t = norm(text);
  const out: string[] = [];
  let cur = "";
  for (let i = 0; i < t.length; i++) {
    cur += t[i];
    if (!/[.!?]/.test(t[i])) continue;
    if (t[i] === "." && (t[i + 1] === "." || t[i - 1] === ".")) continue;
    if (i + 1 >= t.length || /\s/.test(t[i + 1])) (out.push(cur.trim()), (cur = ""));
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
/** Verbs that open an order to the child ("Tap the sun!", "Listen...", "Spell...", "Watch me first!"). */
const VERBS = new Set(["tap", "touch", "press", "listen", "watch", "look", "find", "spell", "build", "say", "try", "change", "pick", "read", "make", "catch", "jump", "choose", "come", "go", "put", "show", "hear", "drag", "swipe", "help", "start", "fix", "zap", "kick", "sort", "count", "get", "give", "keep", "take", "wait", "point", "check", "squish", "use", "open", "move", "match", "remember", "think", "write", "blend", "stop", "hold", "follow", "hop", "collect", "grab", "push", "slide"]);
/** Words that lead into a sentence without being its verb ("Now tap…", "So I'll…", "Look, a gem!"). "Look" leads only
 *  with its comma ("Look, a gem!", "Look, it's Kai and Suki."); "Look at the sun." is an order. (Until 27 Sep the comma
 *  sat inside the word list, before a `\b` that can never match after a comma, so every "Look, …" line read as an order:
 *  audit_gem_first, tv_ears_on, tv_readers_meet, tv_bar_down and tv_ready_first.) */
const LEAD = /^(?:(?:now|so|okay|ok|and|then|first|next|right|quick|quickly|come on|go on|hmm|oh|ooh|wow|yes|little ninja|super ninja|ninja)\b[,!]?|look,)\s*/i;
/** The bare labels: an order with no verb of its own ("Your turn!", "Last one!", "Ninja ears on!"). */
const LABEL = /^(your turn|last one|one more|ninja ears on|all together|everyone)\b/;
/** Encouragement, not a task: "Keep going, ninja." (streak_lost, said before a correction), "Take your time, ninja." */
const ENCOURAGE = /^(keep going|keep trying|keep it up|take your time)\b/;
/** Is this sentence an instruction to the child? An imperative verb first (after "Now", "So", "Then", "Look,"...), or one
 *  of the bare labels ("Your turn!", "Now you try!", "Last one!", "Ninja ears on!"). A one-word exclamation is an
 *  instruction only for listen and watch ("Zap!", "Look!", "Bong!" are not); a one-word lead-in is ("Spell...",
 *  "Listen..."). "Let's…", "Let me…", "Look how…!", "Look, a gem!" and "Keep going." are not. */
export function isInstructionSentence(sentence: string): boolean {
  let s = norm(sentence).replace(/^[^A-Za-z]+/, "");
  const one = wordCount(s) === 1;
  const raw = s.toLowerCase();
  if (/^(now )?you (try|do one|have a go)\b|^now you (tap|find|read|build|spell|say|make|swap|choose|pick|catch|kick)\b/.test(raw)) return true;
  if (LABEL.test(raw)) return true;
  for (let k = 0; k < 3; k++) {
    const m = s.match(LEAD);
    if (!m || !m[0]) break;
    s = s.slice(m[0].length);
  }
  const low = s.toLowerCase();
  if (LABEL.test(low)) return true;
  if (ENCOURAGE.test(low)) return false;
  const w = low.match(/^[a-z']+/)?.[0] ?? "";
  if (one && /!$/.test(low)) return w === "listen" || w === "watch";
  if (/^look (how|what)\b/.test(low)) return false;
  return VERBS.has(w);
}
const PRAISE_RE = /^(tv_praise_|tv_fs_praise_|tv_yay_|yay_|streak_)/;
const isPraise = (id: string) => PRAISE.has(id) || PRAISE_RE.test(id) || ["tv_said_well", "tv_run_jump_ok", "well_read", "well_spelt", "audit_streak_first", "tv_streak_10"].includes(id);
/** `bare-command` for one line: under 4 words, an instruction, and neither a question nor praise (TEACHER_SCRIPT T7: "No
 *  line under four words is an instruction"). `id` is the clip's line id (praise lines are exempt). */
export function isBareCommand(text: string, id = ""): boolean {
  const t = norm(text);
  return wordCount(t) < 4 && !t.endsWith("?") && !isPraise(id) && sentences(t).some(isInstructionSentence);
}
/** `shouted-instruction` for one line: an instruction sentence that ends in "!" (T7: "!" only for celebrations; the
 *  starting gun's "off we go!" and "Let's…!" are not instructions). Praise lines are exempt. */
export function isShoutedInstruction(text: string, id = ""): boolean {
  return !isPraise(id) && sentences(text).some((s) => s.endsWith("!") && !/off we go/i.test(s) && isInstructionSentence(s));
}
/** Lines that close a level or a game (a closing line is the level's praise, SCRIPT_STYLE §8). */
const CLOSING = /^(tv_w\d_end|tv_w\d_done|fm_l\d_done|tv_first_done|tv_hunt_done|tv_build_done|tv_learn_done|tv_dojo_review_done|tv_swap_done|tv_sort_done|tv_review_done|dojo_done|swap_done|sort_done|battle_win|battle_boss_win|run_end|story_end|trial_win)$/;
const MAP_LINE = /^(world_\d+|map_hint|tv_map_hint|tv_map_next_.*|welcome_back|tv_welcome_back|fm_rw2_map|tv_map_flower|tv_map_intro|fm_super_listener|map_locked|fm_practise_again|tv_practise_again)$/;
/** Pattern lists: an entry ending in "*" is a prefix (a generated family: tv_your_word_<w>). */
const inList = (id: string | undefined, pats: readonly string[]) => !!id && pats.some((p) => (p.endsWith("*") ? id.startsWith(p.slice(0, -1)) : id === p));

/** The teacher's voice, game by game (TEACHER_SCRIPT §3 and §4.1): the lines that are the full form's frame, its narrated
 *  demo and its hand-over; whether it has a Ready hold; where the preschool path first meets it (§2.6); and the age-3 limit
 *  for its runs of talk (§6: the five named runs may reach 12.5 s). Mirrors src/content/games.ts (F2) until that lands;
 *  GAMES' own frame lines are added at run time when it exists. */
type Need = { frame: string[]; demo?: string[]; ready: boolean; handover?: string[]; met: string; limit3?: number; recap?: string[]; short?: string[] };
const TV_GAMES: Record<string, Need> = {
  tap: { frame: ["tv_ears_frame"], demo: ["tv_ears_demo"], ready: true, handover: ["tv_your_word_*"], met: "w1-wu1" },
  fastslow: { frame: ["tv_ts_meet"], demo: ["tv_ts_fast", "tv_ts_slow"], ready: true, handover: ["fm_tap_tortoise"], met: "w1-wu1", limit3: 12.5, recap: ["tv_ts_again"], short: ["tv_ts_again"] },
  notice: { frame: ["tv_notice_frame"], ready: false, handover: ["tv_tap_hear_*"], met: "w1-wu1" },
  tapall: { frame: ["tv_pocket_frame"], demo: ["tv_pocket_ido"], ready: true, handover: ["tv_pocket_ready_*"], met: "w1-wu1", limit3: 12.5, recap: ["tv_pocket_recap"], short: ["tv_pocket_more_*"] },
  "tapall:in": { frame: ["tv_pocket_middle"], demo: ["tv_pocket_ido", "tv_hear_middle"], ready: true, handover: ["tv_pocket_ready_*"], met: "w1-wu3", short: ["tv_pocket_middle_more_*"] },
  rail: { frame: ["tv_rail_frame"], demo: ["tv_rail_ido"], ready: true, handover: ["tv_rail_ready", "tv_rail_turn"], met: "w1-wu2", recap: ["tv_rail_again"], short: ["tv_rail_again"] },
  which: { frame: ["tv_which_frame"], demo: ["tv_which_demo", "tv_which_so"], ready: true, handover: ["tv_which_q_*"], met: "w1-wu2", recap: ["tv_which_again"], short: ["tv_which_again"] },
  compound: { frame: ["tv_squish_frame"], demo: ["tv_squish_slow", "tv_squish_fast"], ready: true, handover: ["tv_squish_ready", "fm_starfish_q"], met: "w1-wu2", recap: ["tv_squish_again"], short: ["tv_squish_again"] },
  slowpick: { frame: ["tv_slow_frame"], demo: ["tv_slow_demo", "tv_i_hear_*"], ready: true, handover: ["tv_slow_yours"], met: "w1-wu3", recap: ["tv_slow_recap"], short: ["tv_slow_short"] },
  sounds: { frame: ["tv_guess_frame"], demo: ["tv_my_sounds", "tv_guess_so_*"], ready: true, handover: ["tv_guess_q"], met: "w1-wu5", recap: ["tv_guess_recap"], short: ["tv_guess_short"] },
  dots: { frame: ["tv_dots_frame"], demo: ["tv_dots_ido", "tv_dots_word_ido"], ready: true, handover: ["tv_dots_ready"], met: "w1-wu6", limit3: 12.5, recap: ["tv_dots_recap"], short: ["tv_dots_short"] },
  firstsound: { frame: ["tv_first_frame"], demo: ["tv_ido_pair_*", "tv_let_me_listen", "tv_so_i_tap"], ready: true, handover: ["tv_ready_together", "tv_together", "first_q"], met: "w1-2", recap: ["tv_first_recap"], short: ["tv_first_again_new", "tv_first_again_known"] },
  find: { frame: ["tv_ne_frame"], ready: false, handover: ["tv_which_write"], met: "w1-2", recap: ["tv_ne_recap"], short: ["tv_ne_again", "tv_ne_new_sounds"] },
  build: { frame: ["tv_build_frame"], demo: ["tv_word_card", "tv_i_say_slowly", "tv_first_is"], ready: true, handover: ["tv_build_ready", "tv_our_word"], met: "w1-4", recap: ["tv_build_recap"], short: ["tv_build_again_short", "tv_build_again_3", "tv_build_dojo", "tv_next_build", "tv_next_build_plain"] },
  readcheck: { frame: ["tv_readers_meet", "tv_rc_how"], ready: false, handover: ["tv_you_read_first"], met: "w1-4", recap: ["tv_readers_back"], short: ["tv_readers_back"] },
  battle: { frame: ["tv_battle_oh_no", "tv_battle_frame"], demo: ["tv_battle_card", "tv_first_is"], ready: true, handover: ["tv_battle_ready", "tv_your_word"], met: "w1-6", recap: ["tv_battle_recap"], short: ["tv_battle_again"] },
  soundhunt: { frame: ["tv_hunt_frame"], demo: ["tv_ido_pair_*", "tv_let_me_listen", "mid_*"], ready: true, handover: ["tv_ready_together", "tv_hunt_q"], met: "w1-7", limit3: 12.5, recap: ["tv_hunt_recap"], short: ["tv_hunt_again"] },
  swap: { frame: ["tv_swap_oh_dear", "tv_swap_frame"], demo: ["tv_swap_change_to", "tv_swap_in"], ready: true, handover: ["tv_swap_ready", "tv_swap_now_change"], met: "w1-8", recap: ["tv_swap_again"], short: ["tv_swap_again"] },
  run: { frame: ["tv_run_frame"], ready: true, handover: ["tv_run_ready", "tv_run_lanterns"], met: "w1-9", recap: ["tv_run_again"], short: ["tv_run_again"] },
  story: { frame: ["tv_story_frame"], ready: true, handover: ["tv_story_begin", "tv_story_yours"], met: "w1-14", recap: ["tv_story_recap"], short: ["tv_story_short"] },
  boss: { frame: ["tv_boss_calm", "tv_boss_frame"], ready: true, handover: ["tv_boss_ready", "tv_your_word"], met: "w1-15", limit3: 12.5, recap: ["tv_boss_again"], short: ["tv_boss_again"] },
  learn: { frame: ["tv_learn_frame_*", "tv_learn_how", "tv_dj_room", "tv_learn_frame_ways"], ready: true, handover: ["tv_learn_first"], met: "w2-1", recap: ["tv_learn_recap_*"], short: ["tv_learn_short_*"] },
  sort: { frame: ["tv_sort_frame"], demo: ["tv_sort_ido", "tv_sort_see", "tv_sort_so"], ready: true, handover: ["tv_ready_yours", "help_sort"], met: "w6-br1", recap: ["tv_sort_recap"], short: ["audit_sort_again"] },
  trial: { frame: ["tv_trial_frame", "tv_trial_bar"], ready: true, handover: ["tv_trial_ready", "tv_your_word"], met: "trial", recap: ["tv_trial_short"], short: ["tv_trial_short"] },
  review: { frame: ["tv_review_frame", "tv_review_how"], ready: true, handover: ["tv_battle_go"], met: "review", short: ["tv_review_short"] },
};
/** Today's openers (before the teacher's voice): not frames by TEACHER_SCRIPT's standard (they don't say who does what),
 *  but a full opener all the same, so said again in a session they are over-framing. */
const LEGACY_OPENERS = ["fm_l1_hello", "fm_l2_way", "fm_tap_all_start", "fm_tap_all_in", "fm_l2_big_word", "fm_sounds_intro", "fm_dots_intro", "fm_first_listen", "first_intro", "hunt_intro", "audit_dojo_first", "dojo_hello", "read_intro", "battle_start", "battle_boss", "swap_start", "run_start", "story_start", "audit_sort_first", "audit_trial_first", "audit_made_of_sounds"];
/** The frame lines TEACHER_SCRIPT marks "full" (or once per save) only: said again in a session, or to a child who knows
 *  the game, they are over-framing (a later play uses the recap or short line). Lines the script says on every play
 *  (tv_swap_read_first, tv_story_title) or on recaps (tv_ts_meet, tv_learn_how, tv_rc_how) are not in it. */
const FULL_FRAMES = ["tv_ears_frame", "tv_ears_on", "tv_notice_frame", "tv_pocket_frame", "tv_pocket_middle", "tv_rail_frame", "tv_which_frame", "tv_squish_frame", "tv_slow_frame", "tv_guess_frame", "tv_dots_frame", "tv_first_frame", "tv_ne_frame", "tv_build_frame", "tv_build_lines", "tv_readers_meet", "tv_battle_oh_no", "tv_battle_frame", "tv_hunt_frame", "tv_swap_oh_dear", "tv_swap_frame", "tv_run_frame", "tv_run_lanterns_how", "tv_story_frame", "tv_boss_calm", "tv_boss_frame", "tv_learn_frame_*", "tv_sort_frame", "tv_sort_open", "tv_trial_frame", "tv_trial_bar", "tv_review_frame", "tv_review_how"];
/** The Ready lines (TEACHER_SCRIPT §2.3 and each game's hand-over Ready): a demo window ends at one. */
const READY_LINES = ["tv_ready_*", "tv_pocket_ready_*", "tv_rail_ready", "tv_squish_ready", "tv_dots_ready", "tv_swap_ready", "tv_battle_ready", "tv_boss_ready", "tv_learn_ready", "tv_run_ready", "tv_trial_ready", "tv_build_ready", "tv_battle_go", "tv_story_begin"];
/** Demo starters: the show labels of today, and the teacher-voice demos (TEACHER_SCRIPT §2.1 "Demo"). */
const DEMO_START = ["fm_show_me", "fm_show_me_2", "ido", "tv_ears_demo", "tv_pocket_ido", "tv_rail_ido", "tv_which_demo", "tv_squish_slow", "tv_slow_demo", "tv_my_sounds", "tv_dots_ido", "tv_ido_pair_*", "tv_i_say_slowly", "tv_battle_card", "tv_swap_change_to", "tv_sort_ido", "tv_ts_fast"];
const TRY_LABELS = ["fm_you_try", "fm_you_try_2", "wedo", "youdo"];
/** Join-ins: the child's own tap inside a long demo (TEACHER_SCRIPT §6), so addressed to the child on purpose. */
const JOIN_INS = ["tv_word_card", "tv_you_find_last", "tv_petal_say", "tv_petal_say_short", "tv_new_petal_say", "tv_petal_first", "tv_battle_card", "tv_swap_kick", "tv_tap_hear_*", "tv_now_tap_hear_*", "tv_rw2_tap_petal", "tv_flower_tap", "tv_swap_read_first", "tv_you_read_first", "tv_run_jump"];
/** A correction or an idle re-ask: the one place a bare "Listen…" may still go (mechanics §7.4). */
const CORRECTION_RE = /^(thats|we_need|that_says|listen_again|listen_here|nearly|not_quite|its|its_this_one|fm_its_this|same_sound_spelling|stays_same|audit_listen_next|fm_diff_.*|fm_not_in_.*|help_.*|tv_fix_.*|tv_listen_here|tv_thats_write|tv_find_again_.*|tv_slow_again|tv_guess_again|tv_which_fix_.*|tv_run_fix|tv_lets_check|tv_ts_wrong_.*|tv_listen_sound_again|tv_dojo_idle_say|tv_dojo_help_sound)$/;
const LISTEN_IDS = new Set(LINES.filter((l) => /^listen\W*$/i.test(norm(l.text))).map((l) => l.id));
const LETTERS_IDS = new Set(["t_two_letters", "t_three_letters", "t_four_letters", "st_two_letters_too", "two_letters_one_sound"]);
const REVEAL_IDS = new Set(["how_we_spell", "audit_hear_see", "audit_spell_it", "tv_how_we_write", "tv_and_how_we_write"]);
const PLACE_IDS = new Set(["audit_swap_first", "audit_swap_middle", "audit_swap_last", "st_first_changes", "st_middle_changes", "st_last_changes"]);
/** Sounds~Write routines that may repeat (SCRIPT_STYLE §5.1), and per-item carriers whose words change every time. */
// (tv_guess_q and fm_which_pic: Guess My Word's and W5's question each turn, always said (C2's request); tv_swap_both:
// "Listen to them both…", one of SCRIPT_STYLE §5.1's own routine lead-ins before a slow pair)
/** Games whose Move 1 comes before their Ready hold (TEACHER_SCRIPT §9.3: Sound Swap reads its start word first). */
const FS_MOVE1_BEFORE_READY = new Set(["swap"]);
const ROUTINE = /^(say_sounds_read|tv_lets_say_read|first_sound_q|next_sound_q|last_sound_q|kai_says|suki_says|fm_name_.*|fs_.*|mid_.*|tp_.*|tg_.*|nav_ready|tv_guess_q|fm_which_pic|tv_swap_both)$/;
/** Taps that leave or skip (they end nothing a child is doing). */
const NOT_ACTION = new Set(["Home", "Back", "Skip film", "(somewhere)"]);

const isSpeech = (e: CEv) => SPEECH.has(e.kind);
const isSay = (e: CEv) => e.kind === "say" || e.kind === "story";
const isTap = (e: CEv) => e.kind === "tap" || e.kind === "nav";
/** A tap the game registered (TEACHER_SCRIPT §6: "a tap the game registers"): not Home or Back, and not a tile tapped
 *  while the scene was busy (continuous.ts records `busy` at each tap from 27 Sep: the bot taps tiles during a demo, and
 *  the game ignores them). Older transcripts don't record it, so every tap counts there: their runs of talk can only
 *  come out shorter than the child heard them, never longer. */
const isAction = (e: CEv) => isTap(e) && !NOT_ACTION.has(e.text) && !["home", "back"].includes(e.nav ?? "") && !(e as any).ignored;
/** A tap on the rabbit: the nav layer's live rabbit (Move 1: aria-label "The rabbit", `[data-fs="rabbit"]`) or a
 *  warm-up's own ("rabbit"). A registered child action even while the scene is busy with its read-back (TEACHER_SCRIPT
 *  §9.2: it splits the talk). */
const RABBIT_LABEL = /^(the )?rabbit$/i;
const isRabbitTap = (e: CEv) => isTap(e) && (e.nav === "rabbit" || RABBIT_LABEL.test(e.text));
function markIgnoredTaps(evs: CEv[]) {
  // (a stone tap on the map while Sensei talks is logged busy, but the level it opens starts: it registered. Verify round
  // 2: w2-1's stone, so the map's welcome and the level's frame read as one 19.4 s run)
  const opened = (t: CEv) => { const m = t.text.match(/^level (\S+)$/); return !!m && evs.some((r) => r.kind === "route" && r.text === `level:${m[1]}` && r.t >= t.t && r.t - t.t < 5); };
  for (const t of evs) if (isTap(t) && !t.nav && !NAV_LABEL.has(t.text) && !isRabbitTap(t) && (t as any).busy === true && !opened(t)) (t as any).ignored = true;
}
const NAV_LABEL = new Set(["Next", "Back", "Home", "Help", "Hear it again", "Show me again", "Skip film"]);
const endOf = (e: CEv) => e.t + (e.dur ? e.dur / 1000 : durOf(e.lid ?? "x"));

const WARMUP_GAMES = new Set(["tap", "fastslow", "notice", "tapall", "rail", "which", "compound", "slowpick", "sounds", "dots"]);
/** The game a warm-up beat or a scene plays (TEACHER_SCRIPT §2.6), for transcripts that didn't record it. */
export function gameOfScene(scene: string | null | undefined, level: string | null, beat?: string | null): string | null {
  const kind = level ? LEVEL_KIND.get(level) : undefined;
  switch (scene) {
    case "warmup":
      // (the warm-ups' hello, name, swap show and done beats are not games: they belong to the game around them)
      return beat && WARMUP_GAMES.has(beat) ? beat : beat ? null : "warmup";
    case "pick":
      return kind === "soundhunt" ? "soundhunt" : "firstsound";
    case "build":
      return "build";
    case "read":
      return "readcheck";
    case "learn":
      return "learn";
    case "find":
      return "find";
    case "battle":
      return level === "review" ? "review" : kind === "boss" ? "boss" : "battle";
    case "swap":
      return kind === "picread" ? null : "swap";
    case "sort":
    case "run":
    case "story":
      return scene;
    default:
      return null;
  }
}

/** The nav log's fast/slow entries as transcript events (TEACHER_SCRIPT §9.6, FIX_PLAN §13.5 FS-F3.1, src/ui/nav.tsx):
 *  `speed` (the tortoise or the rabbit lit, `which` slow | fast, or null: out; `shown` false when the nav badges weren't
 *  drawn, as in a warm-up with its own) and `rabbit` (Move 1's join-in: `how` tap | timeout, or slow: the tortoise
 *  tapped while the rabbit waits). A rabbit tap the recorder's tap log missed becomes a tap too, so it splits the talk
 *  as the child's action. `nav`: entries on the game clock; `evs`: the other events. */
export function fsNavEvents(nav: any[], evs: { t: number; kind: string; text?: string; nav?: string | null }[]): Ev[] {
  const out: Ev[] = [];
  for (const e of nav) {
    if (typeof e?.t !== "number") continue;
    if (e.kind === "speed") out.push({ t: e.t, kind: "speed", text: String(e.which ?? ""), which: e.which ?? undefined, ...(e.shown === false ? { shown: false } : {}), ...(e.via ? { via: e.via } : {}) } as Ev);
    if (e.kind === "rabbit") {
      out.push({ t: e.t, kind: "rabbit", text: String(e.how ?? ""), ...(e.how ? { how: e.how } : {}) } as Ev);
      const tapped = evs.some((x) => x.kind === "tap" && Math.abs(x.t - e.t) < 0.8 && (x.nav === "rabbit" || RABBIT_LABEL.test(x.text ?? "")));
      if (e.how === "tap" && !tapped) out.push({ t: e.t, kind: "tap", text: "The rabbit", nav: "rabbit" } as Ev);
    }
  }
  return out;
}

// ---------------------------------------------------------------- fast and slow (TEACHER_SCRIPT §9, FIX_PLAN §13.5)
/** The read-back's slow lead-ins (Move 1 and Move 5) and its fast leads (Move 1's rabbit prompts, Move 5's fast half). */
export const FS_SLOW_LEADS = ["tv_fs_say_sounds_slow", "tv_fs_say_slow", "tv_fs_slow_tortoise"];
export const FS_FAST_LEADS = ["tv_fs_rabbit_read", "fm_tap_rabbit", "tv_fs_now_fast", "tv_fs_fast_rabbit"];
/** Move 1's rabbit prompts: the nav layer's rabbit (a game with letters) or the scene's own (a listening warm-up). */
export const FS_MOVE1 = ["tv_fs_rabbit_read", "fm_tap_rabbit"];
const FS_STUCK_RE = /^tv_fs_stuck_/;
const FS_PRAISE_RE = /^tv_fs_praise_/;
/** The idea lines (Move 2): every `tv_fs_` line in lines.ts that isn't a lead-in, the run's line, a stuck or a praise
 *  line (19 on 27 Sep: TEACHER_SCRIPT §9.5's three banks), so lines added to the block are counted without an edit here. */
export const FS_IDEAS = LINES.map((l) => l.id).filter((id) => id.startsWith("tv_fs_") && !FS_SLOW_LEADS.includes(id) && !FS_FAST_LEADS.includes(id) && id !== "tv_fs_run" && !FS_STUCK_RE.test(id) && !FS_PRAISE_RE.test(id));
/** Lines that count as an idea line where they play (§9.5): W5's and W6's Sounds~Write line, and W1's first telling. */
const FS_IDEA_ALSO = ["t_if_you_say_sounds", "tv_same_word"];
const isFsIdea = (id?: string) => !!id && (FS_IDEAS.includes(id) || FS_IDEA_ALSO.includes(id));
/** Every game with a fast/slow moment (TEACHER_SCRIPT §9.3; Word Squish, Training and Show Sensei have none). */
export const FS_GAMES = new Set(["fastslow", "slowpick", "tapall:in", "sounds", "dots", "firstsound", "build", "readcheck", "soundhunt", "battle", "boss", "review", "trial", "swap", "run", "story"]);
/** The games whose moment is a read-back (Move 1, or the no-tap pair in Kai and Suki, Ninja Run and Story Time). First
 *  Sounds, Pocket Hunt's middle and the gem battle say the idea only. */
const FS_READBACK = new Set(["fastslow", "slowpick", "sounds", "dots", "build", "readcheck", "soundhunt", "battle", "boss", "review", "swap", "run", "story"]);
/** Where Move 1's slow half is the child's own taps or the scene's slow word before the idea (§9.3): no slow lead-in line. */
const FS_NO_SLOW_LEAD = new Set(["fastslow", "slowpick", "dots", "swap"]);
/** Lines that tell a game's session moment besides the idea and the rabbit prompts (§9.3): Ninja Run's lantern lines,
 *  and the no-tap pair's fast half where there is no rabbit (Kai and Suki, Ninja Run, Story Time). */
const FS_MOMENT_ALSO: Record<string, string[]> = { run: ["tv_fs_run", "tv_run_lanterns", "tv_fs_now_fast", "tv_fs_fast_rabbit"], readcheck: ["tv_fs_now_fast", "tv_fs_fast_rabbit"], story: ["tv_fs_now_fast", "tv_fs_fast_rabbit"] };
/** The games where the word is the answer (§9.7 rule 3, FS2): never said fast before the child answers. */
const FS_LEAK_GAMES = new Set(["slowpick", "sounds", "run", "readcheck"]);
const READER_RE = /^(kai|suki)_says$/;
const LEVEL_WORLD = new Map(LEVELS.map((l) => [l.id, l.world]));

/** One read-back: the slow slot (the sounds, or the slow word), then the fast word, with no other sound, word or answer
 *  between them (the rabbit's tap and Sensei's lines may be). `lead`: the line just before the slot. */
export type ReadBack = { game: string; level: string | null; t: number; slot: CEv[]; word: CEv; lead?: CEv; between: CEv[] };
/** A word's sounds (the phoneme ids its sound clips use), when phonics.ts knows it. */
const soundsOf = (w: string) => WORD_BY_TEXT[w]?.segs.map((s) => s.p);
/** The paw's replays of a demo: a Ready hold answered with Show me again ("show"), from the tap to the level's next Ready
 *  hold (at most 40 s when there is none). */
export function paws(evs: CEv[]): { from: number; to: number; level: string | null }[] {
  const isReady = (e: CEv) => e.kind === "hold" && /^ready:/.test(e.text);
  return evs
    .filter((e) => isReady(e) && e.how === "show")
    .map((h) => {
      const from = h.end ?? h.t;
      const next = evs.find((e) => isReady(e) && e.t > from + 0.1 && e.level === h.level);
      return { from, to: next && next.t - from < 60 ? next.t : from + 40, level: h.level };
    });
}

/** A tap that did nothing the child could hear: no clip starts within 0.6 s of it (a learner's second tap on a dot
 *  already said, a tap on the board while the rabbit waits). It is not an answer between a read-back's halves. */
const deadTap = (evs: CEv[], j: number) => {
  const t = evs[j].t;
  for (let k = j + 1; k < evs.length && evs[k].t - t <= 0.6; k++) if (isSpeech(evs[k])) return false;
  return true;
};

/** Every read-back in a run, in a game with a fast/slow moment (TEACHER_SCRIPT §9.2). A word led by "Kai says…" or
 *  "Suki says…" is Kai and Suki's question, not a read-back; sounds that aren't the word's (the child's taps on another
 *  word) aren't its slow slot. */
export function readBacks(run: Run): ReadBack[] {
  const evs = run.evs;
  const out: ReadBack[] = [];
  for (let i = 0; i < evs.length; i++) {
    const w = evs[i];
    if (w.kind !== "word" || !w.game || !FS_GAMES.has(w.game) || !w.lid?.startsWith("word:")) continue;
    const word = w.lid.slice(5);
    const before = evs.slice(Math.max(0, i - 12), i).reverse();
    const prevSay = before.find(isSay);
    if (prevSay && READER_RE.test(prevSay.lid ?? "") && w.t - prevSay.t < 3) continue;
    // back from the word to the slot: Sensei's lines and the rabbit may come between, nothing else said or answered
    const between: CEv[] = [];
    let j = i - 1, ok = true;
    for (; j >= 0; j--) {
      const e = evs[j];
      if (w.t - e.t > 25 || e.level !== w.level || ["word", "onset", "story"].includes(e.kind)) {
        ok = false;
        break;
      }
      if (e.kind === "sound" || e.kind === "stretch") break;
      if (isRabbitTap(e) || e.kind === "rabbit" || e.kind === "speed" || isSay(e)) between.unshift(e);
      else if (isAction(e) && !e.nav) {
        // (a tap logged in the same instant as the sound before it is the tile that said it: the child reading the word
        // sound by sound, as Sound Swap's start word and Sound Dots do; D3 and C2's requests, integration 27 Sep)
        const prev = evs[j - 1];
        if (prev && prev.kind === "sound" && e.t - prev.t < 0.3) continue;
        // (a tap that said nothing is no answer: the learner's tap on a dot while W6's rabbit waited, which hid the
        // first word's read-back, so a later word's was judged as the first: verify round 1, w1-wu6 @12:58.3)
        if (deadTap(evs, j)) continue;
        ok = false;
        break;
      }
    }
    if (!ok || j < 0) continue;
    const slot: CEv[] = [];
    if (evs[j].kind === "stretch") {
      if (evs[j].lid !== `stretch:${word}`) continue;
      slot.push(evs[j]);
    } else {
      // the sounds, one after another (the child's own taps may sit between them: Sound Swap, Sound Dots; a sound the
      // child's tap says may come up to 8 s after the one before, as a learner's second try takes longer)
      let last = evs[j].t, tapped = false;
      for (let k = j; k >= 0; k--) {
        const e = evs[k];
        if (e.kind === "sound") {
          if (last - e.t > (tapped ? 8 : 4)) break;
          slot.unshift(e);
          last = e.t;
          tapped = false;
        } else if (isTap(e) || ["sfx", "speed", "turn", "hold", "game", "scene"].includes(e.kind)) tapped ||= isTap(e);
        else break;
      }
      // the word's own sounds, at the end of the run (the child's last tile, just before, says a sound too)
      const want = soundsOf(word)?.join("");
      const k = want ? [...slot.keys()].map((i) => slot.length - i).find((n) => slot.slice(-n).map((e) => e.lid!.slice(6)).join("") === want) : slot.length >= 2 ? slot.length : undefined;
      if (!k) continue;
      slot.splice(0, slot.length - k);
    }
    // the lead: the line said just before the slot, with no other clip between them
    const s0 = evs.indexOf(slot[0]);
    const prevClip = evs.slice(Math.max(0, s0 - 12), s0).reverse().find(isSpeech);
    const lead = prevClip && isSay(prevClip) && slot[0].t - prevClip.t < 10 && slot[0].t - endOf(prevClip) < 2.5 ? prevClip : undefined;
    out.push({ game: w.game, level: w.level, t: slot[0].t, slot, word: w, lead, between });
  }
  return out;
}

/** Read one transcript file for the checks. */
export function loadRun(file: string): Run {
  const raw = JSON.parse(readFileSync(file, "utf8"));
  const base = file.split("/").pop()!;
  const meta = (!Array.isArray(raw) && raw.meta) || {};
  const persona: string = meta.persona ?? (base.match(/(?:journey|continuous)-([a-z]+)/)?.[1] ?? (/run-a/.test(file) ? "learner" : "?"));
  const from: string | null = meta.from ?? base.match(/-from-(w[\w-]+?)\.json$/)?.[1] ?? null;
  const optin: string = meta.optin ?? "none";
  const continuous = !Array.isArray(raw);
  const evs: CEv[] = [];
  if (!continuous) {
    // transcript.ts: one fresh page per level, each with its own clock: laid end to end, 100 s apart
    let offset = 0;
    for (const c of raw as { name: string; events: Ev[] }[]) {
      const level = LEVEL_KIND.has(c.name) ? c.name : null;
      let scene: string | null = null, end = 0;
      for (const e of c.events as any[]) {
        if (e.kind === "scene") scene = e.text;
        const lid = SPEECH.has(e.kind) ? idOf(e) ?? undefined : undefined;
        evs.push({ ...e, t: e.t + offset, lid, seg: c.name, level, game: gameOfScene(scene, level) });
        end = Math.max(end, e.t);
      }
      offset += end + 100;
    }
  } else {
    // continuous.ts (and the listener's events.json): one stream; the level from routes (new) or pieces (older runs)
    let level: string | null = null, scene: string | null = null, beat: string | null = null, game: string | null = null, seg = "start";
    let firstMinutes = 0;
    const rich = raw.evs.some((e: any) => e.kind === "game" || e.kind === "route");
    const PRI0: Record<string, number> = { piece: 0, route: 1, scene: 2, game: 3 };
    // the fast/slow badges and the rabbit (nav log `speed` and `rabbit`): continuous.ts puts them in evs; older
    // recordings kept only the nav log
    const fsNav = !raw.evs.some((e: any) => e.kind === "speed" || e.kind === "rabbit") && Array.isArray(raw.navlog) ? fsNavEvents(raw.navlog, raw.evs) : [];
    const ordered = ([...raw.evs, ...fsNav] as any[]).map((e, i) => ({ e, i })).sort((a, b) => a.e.t - b.e.t || (PRI0[a.e.kind] ?? 4) - (PRI0[b.e.kind] ?? 4) || a.i - b.i).map((x) => x.e);
    for (const e of ordered) {
      if (e.kind === "piece") {
        seg = e.text;
        const m = e.text.match(/^level (w[\w-]+|review|trial)/);
        if (!rich) {
          if (m) level = m[1];
          else if (/^level \(first minutes\)/.test(e.text)) level = ++firstMinutes === 1 ? "w1-wu1" : firstMinutes === 2 ? "w1-wu2" : level;
          else if (!/^stone /.test(e.text)) level = null;
        }
      }
      if (e.kind === "route") {
        const m = String(e.text).match(/^level:(.+)$/);
        level = m ? m[1] : String(e.text).startsWith("trial") ? "trial" : null;
      }
      if (e.kind === "scene") scene = e.text;
      if (e.dom) (scene = e.dom.scene ?? scene), (beat = e.dom.beat ?? beat);
      if (e.kind === "game") game = e.text || null;
      const g = rich ? game : gameOfScene(scene, level, beat);
      const lid = SPEECH.has(e.kind) ? e.id ?? idOf(e) ?? undefined : undefined;
      // a clip knows the route it started on (continuous.ts reads it in the page as the clip starts): exact where the
      // harness's own route events lag
      const own = typeof e.route === "string" ? (e.route.startsWith("level:") ? e.route.slice(6) : e.route.startsWith("trial") ? "trial" : null) : undefined;
      evs.push({ ...e, lid, seg, level: own !== undefined ? own : level, game: own !== undefined && own !== level ? null : g });
    }
  }
  const PRI: Record<string, number> = { piece: 0, route: 1, scene: 2, game: 3 };
  evs.sort((a, b) => a.t - b.t || (PRI[a.kind] ?? 4) - (PRI[b.kind] ?? 4));
  markIgnoredTaps(evs);
  const who = persona === "perfect" ? "P" : persona === "learner" ? "L" : persona === "splitter" ? "S" : persona === "watcher" ? "W" : persona;
  const label = continuous ? `C${from === "w5-1" ? "5" : from === "w6-br1" ? "6" : from ? `(${from})` : ""}-${who}${/run-a/.test(file) ? " (listener, to w2-1)" : ""}` : `J-${who}`;
  return { file, label, persona, from, optin, fresh: continuous ? !from : true, continuous, evs, rich: evs.some((e) => e.kind === "game" || e.kind === "turn"), ...(continuous && Array.isArray(raw.streakLines) ? { streakLines: raw.streakLines } : {}) };
}

/** A game's plays: runs of events with the same (level, game). `from` is where its talk may begin: the end of the play
 *  before it in the same level (the frame is often said before the scene publishes the game). */
type Play = { game: string; level: string | null; seg: string; from: number; start: number; end: number; first: boolean };
function playsOf(run: Run): Play[] {
  const out: Play[] = [];
  let cur: Play | null = null, levelStart = 0, lastLevel: string | null | undefined, lastEnd = 0;
  const seen = new Set<string>();
  for (const e of run.evs) {
    if (e.level !== lastLevel) (lastLevel = e.level), (levelStart = e.t), (lastEnd = e.t);
    if (!e.game) continue;
    if (!cur || cur.game !== e.game || cur.level !== e.level) {
      if (cur) (out.push(cur), (lastEnd = cur.level === e.level ? cur.end : levelStart));
      const key: string = run.continuous ? e.game : `${e.seg}|${e.game}`;
      // (2.5 s early: the harness notices a new scene a moment after its first line)
      cur = { game: e.game, level: e.level, seg: e.seg, from: Math.max(levelStart, lastEnd) - 2.5, start: e.t, end: e.t, first: !seen.has(key) };
      seen.add(key);
    }
    cur.end = e.t;
  }
  if (cur) out.push(cur);
  return out;
}
/** Is this game met for the first time in this run (a fresh child: every game; a `--from` child: games first met at or
 *  after where they start, TEACHER_SCRIPT §2.6)? */
function firstMeeting(run: Run, game: string): boolean {
  if (run.fresh || !run.from) return true;
  const met = TV_GAMES[game]?.met;
  if (!met) return false;
  return (LEVEL_INDEX.get(met) ?? Infinity) >= (LEVEL_INDEX.get(run.from) ?? 0);
}
/** The age band's limit for a run of talk (ARCHITECTURE §6.4): 12 s at age 3 (not at school yet), 15 s at 4 (Reception,
 *  and every `--from` child: continuous.ts starts them as Reception), 18 s at 5 and over. */
const ageLimit = (run: Run) => (run.from ? 15 : run.optin === "none" || run.optin === "unsure" ? 12 : run.optin === "R" ? 15 : 18);
/** The Ready holds a run recorded (continuous.ts: `hold` events whose id starts with "ready:", or nav log "ready"). */
const readyHolds = (run: Run) => run.evs.filter((e) => e.kind === "hold" && /^ready:/.test(e.text));

/** Where a clip was said: its own route as it started (continuous.ts: "level:w1-6", "reward:w1-6", "tree", "map",
 *  "choose", "optin", "training", "intro"), else its level ("level:<id>"), else the transcript's piece. */
export const placeOf = (e: CEv): string => (typeof e.route === "string" && e.route ? e.route : e.level ? `level:${e.level}` : e.seg);
/** The places after a level where Sensei talks before the child can act: the reward (the Sticker Book's steps are on its
 *  route), a World Flower trip and the map. */
const AFTER_LEVEL = /^(reward|tree|map|stickers|book)\b/;
/** A film (the intro and the finale): the child watches it, with a held arrow between its pages (TEACHER_SCRIPT §3.1). */
const FILM = /^(intro|finale|film)\b/;
/** One run of talk (TEACHER_SCRIPT §6): from a tap the game registers to where the line that cues the next one starts (the
 *  last line said before the next registered tap, or before a question or a held step opens after it), wherever it is
 *  said. `clips` are the clips from the first one after the tap to the cue; `places` their routes, in order, each once. */
export type TalkRun = { len: number; after: CEv; from: CEv; cue: CEv; clips: CEv[]; places: string[] };
/** Every run of talk in a transcript: in a level, from a level into its reward, in the reward, on a World Flower trip, on
 *  the map, in the welcome. Not after a tap on the paw (the demo the child asked to see again, as talk-before-action).
 *  A journey's pages (transcript.ts) are separate, so a run there never spans two. */
export function talkRuns(run: Run): TalkRun[] {
  const evs = run.evs;
  const actions = evs.filter(isAction);
  const speech = evs.filter(isSpeech);
  const opens = evs.filter((e) => e.kind === "turn" || e.kind === "hold");
  const out: TalkRun[] = [];
  for (let i = 0; i + 1 < actions.length; i++) {
    const a = actions[i], b = actions[i + 1];
    if (a.nav === "show") continue;
    const gap = speech.filter((e) => e.t > a.t && e.t < b.t);
    if (!gap.length) continue;
    const open = opens.find((o) => o.t > a.t + 0.1 && o.t < b.t);
    const cue = gap.filter((e) => isSay(e) && e.t <= (open ? open.t + 0.3 : b.t)).at(-1);
    if (!cue) continue;
    const clips = gap.filter((e) => e.t <= cue.t && (run.continuous || e.seg === cue.seg));
    if (!clips.length) continue;
    out.push({ len: cue.t - clips[0].t, after: a, from: clips[0], cue, clips, places: [...new Set(clips.map(placeOf))] });
  }
  return out;
}
/** A run's places for a report: "level:w1-6 → reward:w1-6". */
const placesOf = (r: TalkRun) => r.places.join(" → ");

/** Line ids whose question is the item itself, said on every item by design (TEACHER_SCRIPT: "every time"), not a stem
 *  that fades: Kai and Suki's "Who read it right?" (§3.18, later items), W2's rows ("Here I go. Cat… dog. Which row did I
 *  read?", the words are in it), and the corrections and idle re-asks (they come after a miss or a silence). */
const PER_ITEM_Q = /^(read_who|tv_which_q_.*|tv_which_fix_.*|tv_find_again_.*|tv_idle_look_.*|tv_sort_fix|tv_show_offer.*|tv_offer_show.*)$/;
/** The same question in its rotated variants: a line's family is the idea it asks (line-tags.ts, `as: "ask"`), so "What do
 *  we need to change?", "Which sound changes?" and "Which sound needs to change?" are one; a line with no ask tag is its
 *  own family. Only whole questions (the line ends in "?"): a lead-in stem that carries the item ("Which one starts
 *  with…" /m/) rotates by design (SCRIPT_FIXES A5). */
const ASK_FAMILY = new Map<string, string>(
  LINES.filter((l) => /\?\s*$/.test(norm(l.text)) && !PER_ITEM_Q.test(l.id) && !inList(l.id, READY_LINES))
    .filter((l) => (lineTags as Record<string, { who?: string }>)[l.id]?.who !== "baron")
    .map((l) => {
      const asks = ((lineTags as Record<string, { tags?: { key: string; as: string }[] }>)[l.id]?.tags ?? []).filter((t) => t.as === "ask").map((t) => t.key).sort();
      return [l.id, asks[0] ?? `line:${l.id}`];
    }),
);

export type Metric = { id: string; row: string; value: string; target: string; pass: boolean | null; detail: string[]; major?: boolean };
const pct = (a: number, b: number) => (b ? `${Math.round((100 * a) / b)}%` : "–");
const fmtT = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;
const quote = (e: CEv) => `‹${e.lid}› "${TEXT_OF(e).slice(0, 70)}"`;
const where = (e: CEv) => `${e.level ?? e.seg} @${fmtT(e.t)}`;
/** (a journey's times are laid end to end: `where` shows the run's clock, not the level's) */

/** Every metric for one transcript. */
export function checkRun(run: Run, games: Record<string, Need> = TV_GAMES): Metric[] {
  const evs = run.evs;
  const ALL_FRAMES = [...new Set(Object.values(games).flatMap((g) => g.frame))];
  const says = evs.filter((e) => isSay(e) && e.lid);
  const speech = evs.filter(isSpeech);
  const taps = evs.filter(isTap);
  const actions = evs.filter(isAction);
  const opens = evs.filter((e) => e.kind === "turn" || e.kind === "hold");
  const inLevel = (e: CEv) => !!e.level;
  const M: Metric[] = [];
  const add = (m: Metric) => M.push(m);
  const na = (id: string, row: string, target: string, why: string, major = false) => add({ id, row, value: "n/a", target, pass: null, detail: [why], major });
  // the cut-off flag: continuous.ts records it; for a journey, the next speech clip started before this one could end
  const cut = (e: CEv) => (e.cut !== undefined ? !!e.cut : (() => { const i = speech.indexOf(e); const n = speech[i + 1]; return !!n && n.seg === e.seg && n.t < endOf(e) - 0.25; })());
  const baron = (e: CEv) => e.who === "baron";
  /** the book's own text in Story Time (a story: clip): the characters' words, not Sensei's instructions or questions */
  const book = (e: CEv) => !!e.lid?.startsWith("story:");

  // ---------------- the SCRIPT_FIXES rows (§11.2, top half)
  {
    const letters = says.filter((e) => LETTERS_IDS.has(e.lid!));
    const c6p = run.from === "w6-br1" && run.persona === "perfect";
    add({ id: "letters-lines", row: "letters lines in C6-P (25 min) ≤ 12", value: String(letters.length), target: c6p ? "≤ 12" : "≤ 12 (C6-P only; info here)", pass: c6p ? letters.length <= 12 : null, detail: letters.slice(0, 6).map((e) => `${where(e)} ${quote(e)}`), major: true });
    // the same letters sentence twice within 60 s
    const near = letters.filter((e, i) => letters.slice(0, i).some((p) => p.lid === e.lid && e.t - p.t < 60));
    add({ id: "letters-60s", row: "the same letters sentence never twice in 60 s", value: String(near.length), target: "0", pass: near.length === 0, detail: near.slice(0, 6).map((e) => `${where(e)} ${quote(e)} again within 60 s`), major: true });
    // no spelling's full line twice in a session: keyed by the sound said in the same utterance (a sound with two
    // two-letter spellings taught far apart can trip this; the learner's corrections are allowed to repeat it)
    const full = letters.filter((e) => e.lid !== "st_two_letters_too");
    const soundNear = (e: CEv) => speech.filter((s) => s.kind === "sound" && Math.abs(s.t - e.t) < 4).sort((a, b) => Math.abs(a.t - e.t) - Math.abs(b.t - e.t))[0]?.lid ?? "?";
    const bySound = new Map<string, CEv[]>();
    for (const e of full) bySound.set(soundNear(e), [...(bySound.get(soundNear(e)) ?? []), e]);
    const twice = [...bySound].filter(([, xs]) => xs.length > 1);
    add({ id: "letters-twice", row: "no spelling's full letters line twice in a session", value: `${twice.length} sounds`, target: run.persona === "perfect" ? "0" : "0 (perfect runs only; info here)", pass: run.persona === "perfect" && run.continuous ? twice.length === 0 : null, detail: twice.slice(0, 6).map(([p, xs]) => `${p.replace("sound:", "/")}/: ${xs.length}× (${xs.map((x) => `${x.level ?? x.seg} ${fmtT(x.t)}`).join(", ")})`), major: true });
  }
  {
    // echoes of a letters line: "/ae/ It's two letters… /ae/ It's two letters…"
    const utts = utterances(segsOf(run));
    const echo: string[] = [];
    for (const u of utts) {
      const sh = u.ids.map((i) => (i.startsWith("sound:") ? "/X/" : i));
      const rep = sh.some((_, i) => [1, 2, 3].some((k) => i + 2 * k <= sh.length && sh.slice(i, i + k).some((x) => LETTERS_IDS.has(x)) && sh.slice(i, i + k).join() === sh.slice(i + k, i + 2 * k).join()));
      if (rep) echo.push(`${u.seg} @${fmtT(u.t)} (one breath): ${u.ids.map(label).join(" ")}`.slice(0, 220));
    }
    for (let i = 1; i < utts.length; i++) {
      const a = utts[i - 1], b = utts[i];
      if (a.seg === b.seg && b.t - a.t < 25 && shape(a.ids) === shape(b.ids) && a.ids.some((x) => LETTERS_IDS.has(x))) echo.push(`${a.seg} @${fmtT(a.t)}: ${a.ids.map(label).join(" ")} ‖ ${b.ids.map(label).join(" ")}`.slice(0, 220));
    }
    add({ id: "letters-echo", row: '"/X/ two letters · /X/ two letters" echoes', value: String(echo.length), target: "0", pass: echo.length === 0, detail: echo.slice(0, 5), major: true });
  }
  {
    const late = says.filter((e) => e.lid === "same_sound_new" && says.some((r) => REVEAL_IDS.has(r.lid!) && r.t < e.t && e.t - r.t < 10));
    add({ id: "same-sound-after-reveal", row: "`same_sound_new` after the reveal", value: String(late.length), target: "0", pass: late.length === 0, detail: late.slice(0, 5).map((e) => `${where(e)} ${quote(e)}`) });
  }
  if (run.continuous) {
    const w = says.filter((e) => /^world_\d+$/.test(e.lid!));
    const per = new Map<string, number>();
    for (const e of w) per.set(e.lid!, (per.get(e.lid!) ?? 0) + 1);
    const over = [...per].filter(([, n]) => n > 1);
    add({ id: "world-welcomes", row: "world welcomes: 1 per land", value: [...per].map(([k, n]) => `${k} ×${n}`).join(", ") || "0", target: "≤ 1 per land", pass: over.length === 0, detail: over.map(([k, n]) => `${k} "${TEXT.get(k)}" said ${n} times`) });
    const did = says.filter((e) => e.lid === "yay_7" && says.some((p) => p !== e && p.lid !== "yay_7" && (isPraise(p.lid!) || CLOSING.test(p.lid!)) && p.t <= e.t && e.t - p.t < 5));
    add({ id: "did-it-after-praise", row: '"You did it!" straight after another praise line', value: String(did.length), target: "0", pass: did.length === 0, detail: did.slice(0, 5).map((e) => where(e)) });
    const jumps = says.filter((e) => e.lid === "jump_offer" || e.lid === "tv_jump_offer");
    const jt = run.fresh ? 0 : 1;
    add({ id: "jump-offers", row: "jump offers: 0 on day one, ≤ 1 a session", value: String(jumps.length), target: `≤ ${jt}${run.fresh ? " (day one)" : " (one session)"}`, pass: jumps.length <= jt, detail: jumps.slice(0, 5).map((e) => where(e)) });
    const tips = says.filter((e) => e.lid === "tut_speaker");
    add({ id: "speaker-tip", row: '"Tap the speaker…": ≤ 2 a save, 0 cut', value: `${tips.length} (${tips.filter(cut).length} cut)`, target: "≤ 2, 0 cut", pass: tips.length <= 2 && !tips.some(cut), detail: tips.filter(cut).slice(0, 5).map((e) => `${where(e)} cut`) });
    const hint = says.filter((e) => e.lid === "map_hint" || e.lid === "tv_map_hint");
    add({ id: "map-hint-cut", row: "map hint cut by the next level", value: `${hint.filter(cut).length} of ${hint.length}`, target: "0", pass: !hint.some(cut), detail: hint.filter(cut).slice(0, 5).map((e) => `${where(e)} ${quote(e)} cut`) });
    // a level's line that starts over the map: after the stone tap, while the map or App's fade from it is still on
    // screen (the route flips to the level at the tap; Dec5 makes the level wait for the fade). continuous.ts records
    // `mapOn` per clip; older transcripts: before the harness saw the level's piece begin (it polls, so a little late)
    const overMap: CEv[] = [];
    for (const tap of taps.filter((e) => /^level /.test(e.text))) {
      const until = evs.find((e) => e.t > tap.t && e.kind === "piece" && /^level /.test(e.text))?.t ?? tap.t + 8;
      overMap.push(...says.filter((e) => e.t > tap.t && e.t < tap.t + 8 && !MAP_LINE.test(e.lid!) && ((e as any).mapOn !== undefined ? (e as any).mapOn === true : e.t < until)));
    }
    add({ id: "over-map", row: "level lines started over the map", value: String(overMap.length), target: "0", pass: overMap.length === 0, detail: overMap.slice(0, 5).map((e) => `${where(e)} ${quote(e)}`) });
  } else for (const [id, row] of [["world-welcomes", "world welcomes"], ["did-it-after-praise", '"You did it!" after praise'], ["jump-offers", "jump offers"], ["speaker-tip", '"Tap the speaker…"'], ["map-hint-cut", "map hint cut"], ["over-map", "level lines over the map"]]) na(id, row, "(continuous runs)", "a journey reloads every level: only a continuous run shows this");
  {
    // "This is how we spell/write…" in the first-sound and sound-hunt levels: once per spelling per level
    const rev = says.filter((e) => REVEAL_IDS.has(e.lid!) && e.level && ["firstsound", "soundhunt"].includes(LEVEL_KIND.get(e.level) ?? ""));
    const key = (e: CEv) => `${e.level}|${speech.find((s) => s.kind === "sound" && s.t >= e.t && s.t - e.t < 4)?.lid ?? "?"}`;
    const per = new Map<string, number>();
    for (const e of rev) per.set(key(e), (per.get(key(e)) ?? 0) + 1);
    const over = [...per].filter(([, n]) => n > 1);
    add({ id: "how-we-spell", row: '"This is how we spell…" once per spelling per level (C-P ≤ 5)', value: `${rev.length} (${over.length} repeats)`, target: "once per spelling per level", pass: rev.length ? over.length === 0 : null, detail: over.slice(0, 6).map(([k, n]) => `${k.replace("|sound:", " /")}/: ${n}×`) });
  }
  {
    const place = says.filter((e) => PLACE_IDS.has(e.lid!));
    add({ id: "swap-place-heard", row: "swap place lines heard to the end", value: place.length ? `${place.filter((e) => !cut(e)).length} of ${place.length}` : "0 said", target: "all", pass: place.length ? !place.some(cut) : null, detail: place.filter(cut).slice(0, 5).map((e) => `${where(e)} ${quote(e)} cut`) });
  }
  {
    // praise: a minute of play, and stacks
    const praise = says.filter((e) => isPraise(e.lid!));
    const t0 = evs[0]?.t ?? 0, t1 = evs.at(-1)?.t ?? 0;
    const mins = run.continuous ? Math.max(1, (t1 - t0) / 60) : Math.max(1, [...new Set(evs.map((e) => e.seg))].reduce((s, sg) => { const ts = evs.filter((e) => e.seg === sg).map((e) => e.t); return s + (Math.max(...ts) - Math.min(...ts)); }, 0) / 60);
    const rate = praise.length / mins;
    add({ id: "praise-rate", row: "praise lines a minute", value: rate.toFixed(2), target: "≤ 1.5", pass: rate <= 1.5, detail: [`${praise.length} praise lines in ${mins.toFixed(1)} min`] });
    const stackable = says.filter((e) => isPraise(e.lid!) || CLOSING.test(e.lid!) || PRAISE.has(e.lid!));
    const stacks: string[] = [];
    for (let i = 1; i < stackable.length; i++) {
      const a = stackable[i - 1], b = stackable[i];
      if (a.seg === b.seg && b.t - a.t < 5 && !(stacks.length && stacks.at(-1)!.includes(`@${fmtT(a.t)}`))) stacks.push(`${where(a)}: "${TEXT_OF(a)}" → "${TEXT_OF(b)}"`);
    }
    add({ id: "praise-stacks", row: "praise stacks within 5 s", value: String(stacks.length), target: "0", pass: stacks.length === 0, detail: stacks.slice(0, 5) });
  }
  {
    // any line more than twice in 60 s (bar the SCRIPT_STYLE §5.1 routines and per-item carriers)
    const over = new Map<string, CEv>();
    for (let i = 0; i < says.length; i++) {
      const e = says[i];
      if (ROUTINE.test(e.lid!) || over.has(e.lid!) || baron(e)) continue;
      const n = says.filter((x) => x.lid === e.lid && x.t >= e.t && x.t - e.t <= 60 && (!run.continuous ? x.seg === e.seg : true)).length;
      if (n > 2) over.set(e.lid!, e);
    }
    add({ id: "line-60s", row: "any line more than twice in 60 s (bar the §5.1 routines)", value: `${over.size} lines`, target: "0", pass: over.size === 0, detail: [...over.values()].slice(0, 6).map((e) => `${quote(e)} from ${where(e)}`) });
  }
  {
    // ask-cycle: one whole question, in any of its rotated variants (ASK_FAMILY), asked item after item in a game with no
    // miss between. line-60s can't see it: w1-12's twelve swaps rotate "What do we need to change?", "Which sound
    // changes?" and "Which sound needs to change?" two at a time, each line at most twice in 60 s (verify round 2).
    // SCRIPT_STYLE §5: a stem at most three times running, and a whole question fades after two first-try answers in a
    // row (SCRIPT_FIXES A6; TEACHER_SCRIPT §3.20: Sound Swap's question drops from the third step), back after a miss.
    // An item is the child's answer: asks with no registered tap between them (an idle re-ask) count once. A miss (a
    // wrong sound, a correction line, a lost streak, a split) starts the count again, as does a new level or game.
    const MAX = 3;
    type Streak = { fam: string; level: string | null; game: string | null; n: number; ids: string[]; t0: number; t1: number };
    const streaks = new Map<string, Streak>();
    const worst = new Map<string, Streak>();
    let lastAction = -Infinity;
    const close = (k: string) => {
      const s = streaks.get(k);
      if (s && s.n > MAX && s.n > (worst.get(`${s.level}|${s.fam}`)?.n ?? 0)) worst.set(`${s.level}|${s.fam}`, { ...s });
      streaks.delete(k);
    };
    for (const e of evs) {
      if (isAction(e)) lastAction = e.t;
      const miss = (e.kind === "sfx" && e.text === "wrong") || e.kind === "split" || (isSay(e) && (CORRECTION_RE.test(e.lid ?? "") || e.lid === "streak_lost"));
      if (miss) for (const k of [...streaks.keys()]) if (k.startsWith(`${e.level}|`)) close(k);
      if (!isSay(e) || !e.lid || !e.level || baron(e)) continue;
      const fam = ASK_FAMILY.get(e.lid);
      if (!fam) continue;
      const k = `${e.level}|${e.game ?? ""}|${fam}`;
      const s = streaks.get(k);
      if (!s) streaks.set(k, { fam, level: e.level, game: e.game, n: 1, ids: [e.lid], t0: e.t, t1: e.t });
      else if (lastAction > s.t1) (s.n++, s.ids.push(e.lid), (s.t1 = e.t));
    }
    for (const k of [...streaks.keys()]) close(k);
    const found = [...worst.values()].sort((a, b) => b.n - a.n);
    const count = (ids: string[]) => [...ids.reduce((m, id) => m.set(id, (m.get(id) ?? 0) + 1), new Map<string, number>())].map(([id, n]) => `‹${id}› "${TEXT.get(id) ?? id}" ×${n}`).join(", ");
    add({ id: "ask-cycle", row: "one question, in any of its rotated variants, on more than 3 items running with no miss", value: found.length ? `${found.length} (max ${found[0].n} running, ${found[0].level} ${found[0].game ?? ""})` : "0", target: "0", pass: found.length === 0, detail: found.slice(0, 6).map((s) => `${s.level} ${s.game ?? ""} @${fmtT(s.t0)}–${fmtT(s.t1)}: ${s.fam.replace(/^line:/, "")} asked on ${s.n} items running, no miss (${count(s.ids)})`) });
  }
  {
    // cut-off explanations (not prompts): the explanation lines SCRIPT_STYLE §4 doses, the swap's place line, the map hint,
    // the speaker tip and every teacher-voice frame
    const expl = says.filter((e) => cut(e) && (EXPLAIN.includes(e.lid!) || PLACE_IDS.has(e.lid!) || ["tut_speaker", "map_hint", "tv_map_hint", "st_know_this_sound"].includes(e.lid!) || inList(e.lid, ALL_FRAMES) || LETTERS_IDS.has(e.lid!)));
    add({ id: "cut-explanations", row: "cut-off explanations (not prompts)", value: String(expl.length), target: "0", pass: expl.length === 0, detail: expl.slice(0, 6).map((e) => `${where(e)} ${quote(e)}`) });
  }
  {
    // the splitter: every deliberate split gets "That's /s/. We need /sh/. It's two letters, but it's one sound." before
    // the child's next tap, heard to the end, with no "Listen again…" first
    const splits = evs.filter((e) => e.kind === "split");
    if (!splits.length) na("split-correction", "split-spelling errors with the two-letter correction (splitter)", "100%", "no splitter taps in this transcript (continuous.ts --persona splitter)", true);
    else {
      const ok = splits.filter((s) => {
        const next = actions.find((a) => a.t > s.t + 0.2)?.t ?? s.t + 10;
        const after = says.filter((e) => e.t > s.t && e.t < Math.min(next, s.t + 10));
        const li = after.findIndex((e) => LETTERS_IDS.has(e.lid!));
        const lis = after.findIndex((e) => e.lid === "listen_again" || e.lid === "listen_here" || e.lid === "tv_listen_here" || LISTEN_IDS.has(e.lid!));
        return li >= 0 && !cut(after[li]) && (lis < 0 || lis > li);
      });
      add({ id: "split-correction", row: "split-spelling errors with the two-letter correction (splitter)", value: `${ok.length} of ${splits.length} (${pct(ok.length, splits.length)})`, target: "100%", pass: ok.length === splits.length, detail: splits.filter((s) => !ok.includes(s)).slice(0, 5).map((s) => `${where(s)} tapped < ${s.tapped} > for < ${s.next} >: then ${says.filter((e) => e.t > s.t && e.t < s.t + 6).slice(0, 4).map((e) => `"${TEXT_OF(e)}"${cut(e) ? " ✂" : ""}`).join(" · ") || "(nothing)"}`), major: true });
    }
  }
  {
    // The tier-3 line ("You're a ninja master!", streak_10; since 27 Sep "Ten in a row!…", tv_streak_10) before 7 whole
    // answers in the streak, one of them in this level (Dec2). Exact when the recorder has the streak's own grants
    // (continuous.ts reads streak.ts's __snStreak.lines): a tier-3 line said with no grant beside it was said around
    // streak.ts's rule (a scene saying the line itself), and a grant on fewer answers breaks the rule. Otherwise a proxy:
    // whole answers = picture/row answers and finished words (a word's read-back) since the last wrong answer.
    const master = says.filter((e) => e.lid === "streak_10" || e.lid === "tv_streak_10");
    const grants = run.streakLines;
    // (the grant comes as the tier is crossed; the line may wait for the word's finisher: the latest grant of that line in
    // the 15 s before it)
    const grantOf = (m: CEv) => grants?.filter((x) => x.id === m.lid && x.t <= m.t + 0.5 && m.t - x.t < 15).at(-1);
    const bad = grants
      ? master.filter((m) => {
          const g = grantOf(m);
          return !g || g.answers < 7 || g.levelAnswers < 1;
        })
      : master.filter((m) => {
          const lastWrong = evs.filter((e) => e.kind === "sfx" && e.text === "wrong" && e.t < m.t).at(-1)?.t ?? -1;
          const answers = evs.filter((e) => e.t > lastWrong && e.t < m.t && ((e.kind === "word" && evs.some((s) => s.kind === "sound" && s.t < e.t && e.t - s.t < 3)) || (e.kind === "turn")));
          const here = answers.filter((e) => e.level === m.level);
          return answers.length < 7 || here.length < 1;
        });
    const why = (m: CEv) => {
      const g = grantOf(m);
      return grants ? (g ? `on ${g.answers} whole answers (${g.levelAnswers} in this level)` : "with no grant from the streak (said around streak.ts's rule)") : "";
    };
    add({ id: "master-early", row: `the tier-3 streak line before 7 whole answers${grants ? "" : " (proxy)"}`, value: `${bad.length} of ${master.length}`, target: "0", pass: master.length ? bad.length === 0 : null, detail: bad.slice(0, 4).map((e) => `${where(e)} ${quote(e)} ${why(e)}`.trim()) });
  }

  // ---------------- the teacher's voice rows (§11.2 TV, TV-F4.1)
  const plays = playsOf(run);
  {
    // unframed-turn: every game's first meeting has a frame line, a narrated demo (where the game has one), a Ready hold
    // (`ready:` in the nav log) and a hand-over, in that order
    const firsts = plays.filter((p) => p.first && firstMeeting(run, p.game) && p.game !== "warmup");
    const res: string[] = [];
    let bad = 0;
    for (const p of firsts) {
      const need = games[p.game];
      const win = evs.filter((e) => e.t >= p.from && e.t <= p.end + 0.01);
      const at = (pats: string[] | undefined) => (pats ? win.find((e) => isSay(e) && inList(e.lid, pats))?.t : undefined);
      const f = need ? at(need.frame) : win.find((e) => isSay(e) && inList(e.lid, ALL_FRAMES))?.t;
      const d = need?.demo ? at(need.demo) ?? win.find((e) => e.kind === "paw")?.t : undefined;
      // the Ready hold that hands over: the first one after the demo (Sound Swap asks "Are you ready to watch?" before its
      // demo too, TS T14), timed from the start of its Ready line, since the hold is logged as that line ends (the boss,
      // the gem battle and the review hand over with the Ready line itself: D2 and D3's requests, integration 27 Sep)
      const holds = win.filter((e) => e.kind === "hold" && /^ready:/.test(e.text));
      const hold = (d !== undefined ? holds.find((e) => e.t >= d - 1) : undefined) ?? holds[0];
      const readyLine = hold ? win.filter((e) => isSay(e) && inList(e.lid, READY_LINES) && e.t <= hold.t && hold.t - e.t < 10).at(-1) : undefined;
      const r = hold ? readyLine?.t ?? hold.t : undefined;
      const h = need?.handover ? at(need.handover) : undefined;
      const miss: string[] = [];
      if (f === undefined) miss.push(`no frame line${need ? ` (${need.frame.join("/")})` : ""}`);
      if (need?.demo && d === undefined) miss.push("no narrated demo");
      if ((need?.ready ?? true) && r === undefined) miss.push(win.some((e) => isSay(e) && inList(e.lid, READY_LINES)) ? "a Ready line but no ready: hold" : "no Ready hold");
      if (need?.handover && h === undefined) miss.push("no hand-over");
      const order = [f, d, r, h].filter((x): x is number => x !== undefined);
      if (!miss.length && order.some((x, i) => i && x < order[i - 1] - 1.5)) miss.push(`out of order (frame ${f?.toFixed(1)}, demo ${d?.toFixed(1)}, ready ${r?.toFixed(1)}, hand-over ${h?.toFixed(1)})`);
      if (miss.length) {
        bad++;
        const opener = win.filter(isSay).slice(0, 2).map((e) => `"${TEXT_OF(e).slice(0, 50)}"`).join(" · ");
        res.push(`${p.game} (${p.level ?? "?"} ${fmtT(p.start)}): ${miss.join(", ")}. Opens: ${opener || "(no line)"}`);
      }
    }
    if (!firsts.length) na("unframed-turn", "every game's first meeting: frame, demo, Ready hold, hand-over, in order", "0 missing", run.fresh ? "no game plays recognised" : "no game is met for the first time in this run", true);
    else add({ id: "unframed-turn", row: "every game's first meeting: frame, demo, Ready hold, hand-over, in order", value: `${bad} of ${firsts.length} games`, target: "0 missing", pass: bad === 0, detail: res.slice(0, 12), major: true });
  }
  {
    // over-framed: a full frame (or today's full opener) said again in the same session; a --from child's known games
    const frameSays = says.filter((e) => inList(e.lid, FULL_FRAMES) || LEGACY_OPENERS.includes(e.lid!));
    const again: string[] = [];
    const seen = new Map<string, CEv>();
    for (const e of frameSays) {
      const prev = seen.get(e.lid!);
      if (prev && run.continuous) again.push(`${quote(e)} at ${where(e)}, again after ${where(prev)}`);
      seen.set(e.lid!, e);
      if (!run.fresh && run.from && inList(e.lid, FULL_FRAMES) && e.game && !firstMeeting(run, e.game)) again.push(`${quote(e)} at ${where(e)}: ${e.game} is known before ${run.from}`);
    }
    add({ id: "over-framed", row: "a replay that plays a full frame again", value: String(again.length), target: "0", pass: run.continuous ? again.length === 0 : null, detail: again.slice(0, 8) });
  }
  {
    // bare-command: a Sensei line under 4 words that is an instruction
    const bare = says.filter((e) => !baron(e) && !book(e) && isBareCommand(TEXT_OF(e), e.lid));
    const ids = new Map<string, number>();
    for (const e of bare) ids.set(e.lid!, (ids.get(e.lid!) ?? 0) + 1);
    add({ id: "bare-command", row: "bare-command lines (under 4 words, an instruction)", value: `${bare.length} said (${ids.size} lines)`, target: "0", pass: bare.length === 0, detail: [...ids].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, n]) => `‹${id}› "${TEXT_OF(bare.find((e) => e.lid === id)!)}" ×${n}`), major: true });
  }
  {
    // bare-listen: the one-word "Listen…" clip anywhere but where mechanics §7.4 still allows it: inside a correction (a
    // wrong answer or a correction line in the 5 s before), an idle re-ask (the child quiet for 7 s, and Sensei for 3 s)
    // and Help. That is every "Listen…" that opens a game, a beat, a level or a turn; "opening" counts the ones with 1.5 s
    // of quiet before them or that come before the child's first tap in the level (w2-1's four).
    const flagged: { e: CEv; opens: boolean }[] = [];
    const firstTapIn = new Map<string, number>();
    for (const a of actions) if (a.level && !firstTapIn.has(a.level)) firstTapIn.set(a.level, a.t);
    for (const e of says.filter((x) => LISTEN_IDS.has(x.lid!))) {
      const prev = speech.filter((s) => s.t < e.t - 0.01).at(-1);
      const quietBefore = !prev || prev.seg !== e.seg || e.t - endOf(prev) >= 1.5;
      const corr = says.some((s) => s.t < e.t && e.t - s.t < 5 && (CORRECTION_RE.test(s.lid!) || s.lid === "streak_lost")) || evs.some((s) => s.kind === "sfx" && s.text === "wrong" && s.t <= e.t + 0.3 && e.t - s.t < 5);
      const help = taps.some((t) => (t.text === "Help" || t.nav === "help") && t.t < e.t && e.t - t.t < 5);
      const lastAct = actions.filter((a) => a.t < e.t).at(-1)?.t ?? -Infinity;
      const asked = says.some((s) => s.t > lastAct && s.t < e.t && /\?$|\.\.\.$/.test(norm(TEXT_OF(s))));
      const idle = e.t - lastAct >= 7 && (!prev || e.t - endOf(prev) >= 3) && asked;
      if (corr || help || idle) continue;
      flagged.push({ e, opens: quietBefore || (!!e.level && e.t < (firstTapIn.get(e.level) ?? Infinity)) });
    }
    const w21 = flagged.filter((f) => f.e.level === "w2-1");
    add({ id: "bare-listen", row: 'a one-word "Listen…" opening a game, a beat, a level or a turn', value: `${flagged.length}${w21.length ? ` (${w21.length} in w2-1)` : ""}; ${flagged.filter((f) => f.opens).length} after quiet or before the level's first tap`, target: "0", pass: flagged.length === 0, detail: [...w21, ...flagged.filter((f) => f.e.level !== "w2-1")].slice(0, 8).map(({ e }) => `${where(e)} after ${says.filter((s) => s.t < e.t).at(-1)?.lid ?? "(nothing)"}: "Listen…" ${speech.filter((s) => s.t > e.t && s.t - e.t < 2).map((s) => s.text).slice(0, 2).join(" ")}`), major: true });
  }
  {
    // talk-before-action: from a tap the game registers, how long Sensei talks before the line that cues the next one
    // starts (TEACHER_SCRIPT §6: "say it with me" is not a break; the child can act from the cue line's first word). Per
    // first meeting; the limit is the age band's, 12.5 s for the five runs TEACHER_SCRIPT §6 names.
    const limit = ageLimit(run);
    const firsts = plays.filter((p) => p.first && firstMeeting(run, p.game) && p.game !== "warmup");
    const runs: { game: string; level: string | null; len: number; from: CEv; cue: CEv; lim: number }[] = [];
    for (let i = 0; i + 1 < actions.length; i++) {
      const a = actions[i], b = actions[i + 1];
      // (after a tap on the paw, the talk is the demo the child asked to see again, not talk before they could act)
      if (a.nav === "show") continue;
      const inGap = speech.filter((e) => e.t > a.t && e.t < b.t);
      if (!inGap.length) continue;
      const open = opens.find((o) => o.t > a.t + 0.1 && o.t < b.t);
      const cueBy = open ? open.t + 0.3 : b.t;
      const cue = inGap.filter((e) => isSay(e) && e.t <= cueBy).at(-1);
      if (!cue || !cue.level) continue;
      // (only the cue's own level's talk: not the reward or the map before it, nor another page of a journey)
      const mine = inGap.filter((e) => e.level === cue.level && e.seg === cue.seg && e.t <= cue.t);
      if (!mine.length) continue;
      const cands = firsts.filter((p) => cue.t >= p.from && cue.t <= p.end + 0.5);
      const play = cands.find((p) => p.game === cue.game) ?? cands.at(-1);
      if (!play) continue;
      const lim = limit === 12 ? games[play.game]?.limit3 ?? 12 : limit;
      runs.push({ game: play.game, level: play.level, len: cue.t - mine[0].t, from: mine[0], cue, lim });
    }
    const over = runs.filter((r) => r.len > r.lim + 0.05).sort((x, y) => y.len - x.len);
    const worst = runs.slice().sort((x, y) => y.len - x.len)[0];
    if (!runs.length) na("talk-before-action", "talk before a child action, first meetings", `≤ ${limit} s`, "no first-meeting runs recognised", true);
    else add({ id: "talk-before-action", row: "talk before a child action, first meetings", value: `max ${worst.len.toFixed(1)} s (${worst.game} ${worst.level ?? ""}); ${over.length} over`, target: `≤ ${limit} s (named runs ${limit === 12 ? "12.5" : limit} s)`, pass: over.length === 0, detail: over.slice(0, 8).map((r) => `${r.game} (${r.level}) ${r.len.toFixed(1)} s from ${quote(r.from)} to ${quote(r.cue)}`), major: true });
  }
  {
    // talk-reward and talk-longest (verify round 2): talk-before-action counts a level's own talk only, so a run that ends
    // in the reward (the level's close, then the reward's lines: w1-6's battle_win · tv_battle_why · flower_i5), the reward's
    // own steps (Reward 2: 29.7 s from "Starfish!" to "Tap your petal…") and the map were never measured. TEACHER_SCRIPT
    // §0.1: no stretch of talk runs more than about 12 s before the child can do something the game registers, wherever
    // it is. The limit is the age band's, as talk-before-action's. Films and Story Time's book text are watched, not
    // talked at, so their runs don't count; nor the demo the child asked to see again.
    const limit = ageLimit(run);
    const all = talkRuns(run).filter((r) => !r.places.some((p) => FILM.test(p)) && !r.clips.some((e) => e.kind === "story" || e.lid?.startsWith("story:")));
    const show = (r: TalkRun) => `${placesOf(r)} ${r.len.toFixed(1)} s from ${quote(r.from)} to ${quote(r.cue)} (@${fmtT(r.from.t)})`;
    const after = all.filter((r) => r.places.some((p) => AFTER_LEVEL.test(p)));
    const overA = after.filter((r) => r.len > limit + 0.05).sort((x, y) => y.len - x.len);
    const worstA = after.slice().sort((x, y) => y.len - x.len)[0];
    if (!after.length) na("talk-reward", "talk before a child action in the rewards, World Flower trips and on the map (a level's closing talk into them included)", `≤ ${limit} s`, run.continuous ? "no talk after a level in this transcript" : "a journey has no rewards or map between its levels", true);
    else add({ id: "talk-reward", row: "talk before a child action in the rewards, World Flower trips and on the map (a level's closing talk into them included)", value: `max ${worstA.len.toFixed(1)} s (${placesOf(worstA)}); ${overA.length} over`, target: `≤ ${limit} s`, pass: overA.length === 0, detail: overA.slice(0, 8).map(show), major: true });
    const overL = all.filter((r) => r.len > limit + 0.05).sort((x, y) => y.len - x.len);
    const worstL = all.slice().sort((x, y) => y.len - x.len)[0];
    const kinds = [...overL.reduce((m, r) => { const k = r.places.map((p) => p.split(":")[0]).filter((v, i, a) => a.indexOf(v) === i).join("→"); return m.set(k, (m.get(k) ?? 0) + 1); }, new Map<string, number>())].map(([k, n]) => `${k} ${n}`).join(", ");
    if (!all.length) na("talk-longest", "the longest run of talk before a child action anywhere in the session (levels, rewards, trips, the map, the welcome)", `≤ ${limit} s`, "no runs of talk", true);
    else add({ id: "talk-longest", row: "the longest run of talk before a child action anywhere in the session (levels, rewards, trips, the map, the welcome)", value: `max ${worstL.len.toFixed(1)} s (${placesOf(worstL)}); ${overL.length} over${kinds ? ` (${kinds})` : ""}`, target: `≤ ${limit} s`, pass: overL.length === 0, detail: overL.slice(0, 10).map(show), major: true });
  }
  {
    // turn-median: the words Sensei says between two child actions, in the levels
    const turns: number[] = [];
    for (let i = 0; i + 1 < actions.length; i++) {
      const a = actions[i], b = actions[i + 1];
      const w = says.filter((e) => e.t > a.t && e.t < b.t && !baron(e) && inLevel(e)).reduce((s, e) => s + wordCount(TEXT_OF(e)), 0);
      if (w) turns.push(w);
    }
    const sorted = turns.sort((x, y) => x - y);
    const med = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
    const lineMed = (() => { const ws = says.filter((e) => inLevel(e) && !baron(e)).map((e) => wordCount(TEXT_OF(e))).sort((x, y) => x - y); return ws.length ? ws[Math.floor(ws.length / 2)] : 0; })();
    if (!turns.length) na("turn-median", "the median Sensei turn (all talk between two child actions)", "8–25 words", "no turns in levels");
    else add({ id: "turn-median", row: "the median Sensei turn (all talk between two child actions)", value: `${med} words (median line ${lineMed} words; ${turns.length} turns)`, target: "8–25 words", pass: med >= 8 && med <= 25, detail: [`turns under 8 words: ${turns.filter((w) => w < 8).length} of ${turns.length}`], major: true });
  }
  {
    // rhetorical questions: a "?" the child can't answer: mid-line ("Did you notice? Sun and sock…") with no way to answer
    // after it, or at the end of a line that Sensei talks straight past (no tap, no turn or hold opening, within 2.5 s)
    const answerRoute = /\b(tap|choose|pick|find|touch|press)\b/i;
    const rq: CEv[] = [];
    for (const e of says.filter((x) => !baron(x) && !book(x) && norm(TEXT_OF(x)).includes("?"))) {
      const t = norm(TEXT_OF(e));
      const q = t.lastIndexOf("?");
      if (q < t.length - 1) {
        if (!answerRoute.test(t.slice(q + 1))) rq.push(e);
        continue;
      }
      const end = endOf(e);
      const next = says.find((x) => x.t > e.t + 0.05 && x.seg === e.seg);
      if (!next || next.t - end > 2.5) continue;
      if (evs.some((x) => (isTap(x) || x.kind === "turn" || x.kind === "hold") && x.t >= e.t && x.t <= next.t + 0.2)) continue;
      if (answerRoute.test(TEXT_OF(next))) continue;
      rq.push(e);
    }
    const ids = new Map<string, number>();
    for (const e of rq) ids.set(e.lid!, (ids.get(e.lid!) ?? 0) + 1);
    add({ id: "rhetorical-question", row: "rhetorical questions (a ? with no hold or turn that can answer it)", value: `${rq.length} said (${ids.size} lines)`, target: "0", pass: rq.length === 0, detail: [...ids].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, n]) => `‹${id}› "${TEXT_OF(rq.find((e) => e.lid === id)!)}" ×${n}`) });
  }
  {
    // shouted instructions: an instruction that ends in "!" (the starting gun's "off we go!" and "Let's…!" are not)
    const shout = says.filter((e) => !baron(e) && !book(e) && isShoutedInstruction(TEXT_OF(e), e.lid));
    const ids = new Map<string, number>();
    for (const e of shout) ids.set(e.lid!, (ids.get(e.lid!) ?? 0) + 1);
    add({ id: "shouted-instruction", row: 'instructions that end in "!"', value: `${shout.length} said (${ids.size} lines)`, target: "0", pass: shout.length === 0, detail: [...ids].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, n]) => `‹${id}› "${TEXT_OF(shout.find((e) => e.lid === id)!)}" ×${n}`), major: true });
  }
  {
    // demo-command: during Sensei's own demo (from a show label or a teacher-voice demo line, or while the paw moves, to
    // the child's next tap, the "your turn" label or the Ready), a line addressed to the child: an instruction or a question
    const flagged: { e: CEv; start: CEv }[] = [];
    for (const s of says.filter((x) => inList(x.lid, DEMO_START))) {
      const endTap = actions.find((a) => a.t > s.t + 0.1 && !a.nav)?.t ?? Infinity;
      const stop = says.find((x) => x.t > s.t && (inList(x.lid, TRY_LABELS) || inList(x.lid, READY_LINES) || /^(your turn|now you|now it's your turn)\b/i.test(norm(TEXT_OF(x)))))?.t ?? Infinity;
      const hold = evs.find((x) => x.kind === "hold" && x.t > s.t)?.t ?? Infinity;
      const until = Math.min(endTap, stop, hold, s.t + 12);
      for (const e of says.filter((x) => x.t > s.t && x.t < until && x.seg === s.seg && !inList(x.lid, DEMO_START) && !inList(x.lid, JOIN_INS) && !isPraise(x.lid!) && !baron(x))) {
        const t = norm(TEXT_OF(e));
        const ask = t.endsWith("?") || /^(which|what|where|who|can you|find)\b.*\.\.\.$/i.test(t);
        if ((ask || sentences(t).some(isInstructionSentence)) && !flagged.some((f) => f.e === e)) flagged.push({ e, start: s });
      }
    }
    add({ id: "demo-command", row: "a line addressed to the child during Sensei's own demo", value: String(flagged.length), target: "0", pass: flagged.length === 0, detail: flagged.slice(0, 8).map(({ e, start }) => `${where(e)} ${quote(e)} during ${quote(start)}`), major: true });
  }
  {
    // the first Dojo level (w2-1): tv_learn_frame_<n> first, then tv_learn_how and the tv_learn_ready hold, before any sound
    const w = evs.filter((e) => e.level === "w2-1");
    if (!w.length || !w.some(isSpeech)) na("first-dojo-opening", "w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound", "yes", "no w2-1 in this transcript", true);
    else {
      const first = w.find(isSay);
      const sound = w.find((e) => e.kind === "sound");
      const how = w.find((e) => e.lid === "tv_learn_how");
      const ready = w.find((e) => e.kind === "hold" && /^ready:/.test(e.text));
      const ok = !!first && /^tv_learn_frame_/.test(first.lid ?? "") && !!how && !!ready && (!sound || (how.t < sound.t && ready.t < sound.t));
      const opening = w.filter(isSpeech).slice(0, 5).map((e) => (e.kind === "say" ? `‹${e.lid}› "${TEXT_OF(e)}"` : e.text)).join(" · ");
      add({ id: "first-dojo-opening", row: "w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound", value: ok ? "yes" : "no", target: "yes", pass: ok, detail: [`w2-1 opens: ${opening}`], major: true });
    }
  }
  {
    // a Ready hold that ended without the child (the nav's auto-advance, for the transcript's own holds)
    const holds = readyHolds(run);
    if (!holds.length) na("ready-auto-advance", "a Ready hold that ends without the child", "0", "no Ready holds recorded");
    else {
      const bad = holds.filter((h) => !h.how || h.how === "none");
      add({ id: "ready-auto-advance", row: "a Ready hold that ends without the child", value: `${bad.length} of ${holds.length}`, target: "0", pass: bad.length === 0, detail: bad.slice(0, 5).map((h) => `${where(h)} ${h.text}`) });
    }
  }
  {
    // the bots (FIX_PLAN §13.3): the watcher's paw at a Ready replays the demo, then "Are you ready to have a go now?"
    // (tv_ready_now) and a hold that waits for the child; a hand-over Ready answered on the board counts as the first
    // answer, so the hand-over's question isn't asked again straight after
    const holds = readyHolds(run);
    const pawed = holds.filter((h) => h.how === "show");
    if (!pawed.length) na("watcher-replay", "the paw at a Ready: the demo, tv_ready_now, and a hold that waits", "all", "no paw taps at a Ready hold (continuous.ts --persona watcher, once Ready holds exist)");
    else {
      const bad = pawed.filter((h) => {
        const after = h.end ?? h.t;
        const now = says.find((e) => e.t > after && e.t < after + 25 && e.lid === "tv_ready_now");
        const again = holds.find((x) => x !== h && x.t > after && x.t < after + 30);
        return !now || !again || !again.how || again.how === "none";
      });
      add({ id: "watcher-replay", row: "the paw at a Ready: the demo, tv_ready_now, and a hold that waits", value: `${pawed.length - bad.length} of ${pawed.length}`, target: "all", pass: bad.length === 0, detail: bad.slice(0, 5).map((h) => `${where(h)} ${h.text}`) });
    }
    const answered = holds.filter((h) => /^(answer|board)/.test(h.how ?? ""));
    if (!answered.length) na("handover-once", "a hand-over Ready answered on the board isn't asked again", "0 re-asked", "no Ready answered on the board");
    else {
      const bad = answered.filter((h) => {
        const g = h.game ?? evs.filter((e) => e.game && e.t <= h.t).at(-1)?.game ?? "";
        const q = (games[g]?.handover ?? []).filter((x) => !inList(x, READY_LINES));
        return q.length > 0 && says.some((e) => e.t > (h.end ?? h.t) && e.t < (h.end ?? h.t) + 6 && inList(e.lid, q));
      });
      add({ id: "handover-once", row: "a hand-over Ready answered on the board isn't asked again", value: `${bad.length} of ${answered.length} re-asked`, target: "0", pass: bad.length === 0, detail: bad.slice(0, 5).map((h) => `${where(h)} ${h.text} (${h.how})`) });
    }
  }
  M.push(...fastSlowMetrics(run, plays, cut));
  return M;
}

/** The fast and slow rows (FIX_PLAN §13.5, TEACHER_SCRIPT §9, FS-F4.1). A session is one page: a continuous run is one
 *  session, a journey's every level is its own. A land is the level's world; a gem battle borrows the level before it. */
export function fastSlowMetrics(run: Run, plays: Play[], cut: (e: CEv) => boolean): Metric[] {
  const evs = run.evs;
  const M: Metric[] = [];
  const says = evs.filter((e) => isSay(e) && e.lid);
  const actions = evs.filter(isAction);
  const sessionOf = (seg: string) => (run.continuous ? "" : seg);
  const inSession = (s: string) => (run.continuous ? "" : ` (the ${s} page)`);
  let land = 1;
  const landOf = new Map<Play, number>();
  for (const p of plays) landOf.set(p, (land = (p.level && LEVEL_WORLD.get(p.level)) || land));
  const fsPlays = plays.filter((p) => FS_GAMES.has(p.game));
  const sessions = [...new Set(fsPlays.map((p) => sessionOf(p.seg)))];
  /** Is this event part of these plays of one game (its own game id, or no game id inside one of them)? */
  const ofPlays = (e: CEv, ps: Play[]) => ps.some((p) => sessionOf(p.seg) === sessionOf(e.seg) && (e.game ? e.game === p.game : e.t >= p.start - 1 && e.t <= p.end + 4 && e.level === p.level));
  const at = (p: Play) => `${p.game} (${p.level ?? "?"} ${fmtT(p.start)}, land ${landOf.get(p)})`;
  // The paw's replays (TEACHER_SCRIPT §2.3: Show me again at a Ready hold replays the demo, then "Are you ready to have a
  // go now?"): from the tap to the level's next Ready hold. A read-back or a slow word in one is Sensei's demo again, not
  // the child's first read-back, so no fast/slow row counts it (verify round 1: the watcher's w1-4 @21:03.9, w1-6
  // @25:01.9 and w1-8 were judged as the session's first read-backs; the replay draws no nav badges: `shown: false`).
  const replays = paws(evs);
  const inReplay = (t: number) => replays.some((r) => t >= r.from - 0.2 && t <= r.to + 0.5);
  const everyRead = readBacks(run);
  const all = everyRead.filter((r) => !inReplay(r.t));
  const replayed = everyRead.length - all.length;
  const sessionReads = (s: string) => all.filter((r) => sessionOf(r.word.seg) === s);

  // ---- fs-per-session: every game with a fast/slow moment tells it once a session (lands 1–2); from land 3, the
  // session's first game with a read-back
  {
    const need: { s: string; game: string; ps: Play[] }[] = [];
    for (const s of sessions) {
      const inS = fsPlays.filter((p) => sessionOf(p.seg) === s);
      const early = inS.filter((p) => landOf.get(p)! <= 2);
      for (const g of [...new Set(early.map((p) => p.game))]) need.push({ s, game: g, ps: early.filter((p) => p.game === g) });
      const first = inS.find((p) => landOf.get(p)! >= 3 && FS_READBACK.has(p.game));
      if (first) need.push({ s, game: first.game, ps: inS.filter((p) => p.game === first.game && landOf.get(p)! >= 3) });
    }
    const tells = (g: string, id: string) => isFsIdea(id) || FS_MOVE1.includes(id) || (FS_MOMENT_ALSO[g] ?? []).includes(id);
    const missing = need.filter((n) => !says.some((e) => ofPlays(e, n.ps) && tells(n.game, e.lid!)));
    if (!need.length) M.push({ id: "fs-per-session", row: "fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1)", value: "n/a", target: "0 missing", pass: null, detail: ["no game with a fast/slow moment in this transcript"], major: true });
    else
      M.push({
        id: "fs-per-session",
        row: "fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1)",
        value: `${missing.length} of ${need.length} games`,
        target: "0 missing",
        pass: missing.length === 0,
        detail: missing.slice(0, 10).map((n) => `${at(n.ps[0])}${inSession(n.s)}: no idea line, rabbit prompt or ${n.game === "run" ? "tv_fs_run" : "slow-then-fast pair"}. It said: ${says.filter((e) => ofPlays(e, n.ps) && !ROUTINE.test(e.lid!)).slice(0, 4).map((e) => `‹${e.lid}›`).join(" ") || "(nothing)"}`),
        major: true,
      });
  }

  // ---- fs-repeat: an idea line or a fast/slow praise line twice in a session (a line cut off the first time may come
  // again: only what is heard counts). S~W's `t_if_you_say_sounds` is exempt: W5's close says it every time (§3.11)
  {
    const seen = new Map<string, CEv>();
    const rep: string[] = [];
    for (const e of says) {
      if (!(FS_IDEAS.includes(e.lid!) || FS_PRAISE_RE.test(e.lid!) || e.lid === "tv_same_word")) continue;
      const k = `${sessionOf(e.seg)}|${e.lid}`;
      const p = seen.get(k);
      if (p && !cut(p)) rep.push(`${quote(e)} at ${where(e)}, again after ${where(p)}`);
      seen.set(k, e);
    }
    M.push({ id: "fs-repeat", row: "an idea line (or a fast/slow praise line) said twice in a session", value: String(rep.length), target: "0", pass: rep.length === 0, detail: rep.slice(0, 8) });
  }

  // ---- fs-idea-caps: idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session
  {
    const ideas = says.filter((e) => isFsIdea(e.lid) && !cut(e));
    const perLevel = new Map<string, CEv[]>(), perSession = new Map<string, CEv[]>();
    for (const e of ideas) {
      if (e.level) perLevel.set(`${e.seg}|${e.level}`, [...(perLevel.get(`${e.seg}|${e.level}`) ?? []), e]);
      // (First Sounds' and Sound Hunt's one idea line is outside the session cap: narrative.ts FS_IDEA_ONLY)
      if (!(e.game && FS_IDEA_ONLY.has(e.game))) perSession.set(sessionOf(e.seg), [...(perSession.get(sessionOf(e.seg)) ?? []), e]);
    }
    const overL = [...perLevel].filter(([, xs]) => xs.length > 2);
    const overS = [...perSession].filter(([, xs]) => xs.length > 4);
    // from land 3: the games that had Move 1 or an idea line, per session
    const late = new Map<string, Set<string>>();
    for (const e of says) {
      if (!(isFsIdea(e.lid) || FS_MOVE1.includes(e.lid!)) || !e.game || !FS_GAMES.has(e.game)) continue;
      const p = fsPlays.find((q) => q.game === e.game && q.level === e.level && e.t >= q.start - 1 && e.t <= q.end + 4);
      if (!p || landOf.get(p)! < 3) continue;
      late.set(sessionOf(e.seg), (late.get(sessionOf(e.seg)) ?? new Set()).add(e.game));
    }
    const overLate = [...late].filter(([, gs]) => gs.size > 1);
    const maxL = Math.max(0, ...[...perLevel.values()].map((x) => x.length)), maxS = Math.max(0, ...[...perSession.values()].map((x) => x.length));
    M.push({
      id: "fs-idea-caps",
      row: "idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session",
      value: `${maxL} a level, ${maxS} a session (most)${overLate.length ? `; ${overLate.map(([, gs]) => gs.size).join(", ")} games in land 3+` : ""}`,
      target: "≤ 2 / ≤ 4; 1 game from land 3",
      pass: !overL.length && !overS.length && !overLate.length,
      detail: [
        ...overL.map(([k, xs]) => `${k.split("|")[1]}: ${xs.length} idea lines (${xs.map((e) => `‹${e.lid}›`).join(" ")})`),
        ...overS.map(([k, xs]) => `${run.continuous ? "the session" : k}: ${xs.length} idea lines (${xs.map((e) => `‹${e.lid}›`).join(" ")})`),
        ...overLate.map(([k, gs]) => `${run.continuous ? "the session" : k}, land 3+: Move 1 or an idea line in ${[...gs].join(", ")}`),
      ].slice(0, 8),
    });
  }

  // ---- fs-readback: the first read-back of each game type in a session (after its Ready on a full form) is slow, then
  // fast: a slow lead-in, the sounds or the slow word, then the word led by a fast lead. From land 3, only the session's
  // first game with a read-back. The gem battle has none (FS6); where the slow half is the child's own taps or the
  // scene's slow word (§9.3: W3, Slow Words, W6, Sound Swap) no slow lead-in line is needed
  {
    const judged: { r: ReadBack; ok: boolean; why: string[] }[] = [];
    const unseen: string[] = [];
    const judge = (r: ReadBack) => {
      const why: string[] = [];
      if (!FS_NO_SLOW_LEAD.has(r.game) && !(r.lead && FS_SLOW_LEADS.includes(r.lead.lid!))) why.push(`no slow lead-in (it was ${r.lead ? quote(r.lead) : "nothing"})`);
      const fast = r.between.filter((e) => isSay(e) && FS_FAST_LEADS.includes(e.lid!));
      if (!fast.length) why.push(`no fast lead before [${r.word.lid!.slice(5)}]${r.between.some(isSay) ? ` (between: ${r.between.filter(isSay).map((e) => `‹${e.lid}›`).join(" ")})` : ""}`);
      return { r, ok: !why.length, why };
    };
    for (const s of sessions) {
      const inS = fsPlays.filter((p) => sessionOf(p.seg) === s && FS_READBACK.has(p.game));
      const reads = sessionReads(s);
      const firstRead = (g: string, ps: Play[]) => {
        const p0 = ps[0];
        const ready = evs.find((e) => e.kind === "hold" && /^ready:/.test(e.text) && e.game === g && e.level === p0.level && e.t >= p0.from && e.t <= p0.end + 0.5);
        // (Sound Swap's Move 1 is on the start word, before its Ready, by design: TEACHER_SCRIPT §9.3; D3's request)
        const after = ready && !FS_MOVE1_BEFORE_READY.has(g) ? ready.end ?? ready.t : -Infinity;
        return reads.find((r) => r.game === g && ofPlays(r.word, ps) && r.t >= after);
      };
      const early = inS.filter((p) => landOf.get(p)! <= 2);
      const games: [string, Play[]][] = [...new Set(early.map((p) => p.game))].map((g) => [g, early.filter((p) => p.game === g)]);
      // land 3+: the first game in the session that has a read-back
      const lateGames = [...new Set(inS.filter((p) => landOf.get(p)! >= 3).map((p) => p.game))].map((g) => [g, inS.filter((p) => p.game === g && landOf.get(p)! >= 3)] as [string, Play[]]);
      const lateFirst = lateGames.map(([g, ps]) => firstRead(g, ps)).filter((r): r is ReadBack => !!r).sort((a, b) => a.t - b.t)[0];
      for (const [g, ps] of games) {
        const r = firstRead(g, ps);
        if (!r) {
          unseen.push(`${at(ps[0])}: no read-back heard${inSession(s)}`);
          continue;
        }
        judged.push(judge(r));
      }
      if (lateFirst) judged.push(judge(lateFirst));
    }
    const bad = judged.filter((j) => !j.ok);
    const show = (r: ReadBack) => [r.lead ? `‹${r.lead.lid}›` : "", r.slot.map((e) => (e.kind === "stretch" ? `[${e.lid!.slice(8)}, slowly]` : `/${e.lid!.slice(6)}/`)).join(" "), ...r.between.map((e) => (isSay(e) ? `‹${e.lid}›` : e.kind === "rabbit" ? `(rabbit: ${e.text})` : isTap(e) ? "(tap)" : "")).filter(Boolean), `[${r.word.lid!.slice(5)}]`].filter(Boolean).join(" · ");
    if (!judged.length) M.push({ id: "fs-readback", row: "the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead", value: "n/a", target: "100%", pass: null, detail: unseen.length ? unseen.slice(0, 6) : ["no read-back in a game with a fast/slow moment"], major: true });
    else
      M.push({
        id: "fs-readback",
        row: "the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead",
        value: `${judged.length - bad.length} of ${judged.length} (${pct(judged.length - bad.length, judged.length)})`,
        target: "100%",
        pass: bad.length === 0,
        detail: [...bad.slice(0, 8).map((j) => `${j.r.game} (${j.r.level ?? "?"} @${fmtT(j.r.t)}): ${j.why.join("; ")}. Heard: ${show(j.r)}`), ...unseen.slice(0, 3).map((u) => `(not judged) ${u}`), ...(replayed ? [`(not judged) ${replayed} read-back${replayed === 1 ? "" : "s"} in the paw's replays of a demo`] : [])],
        major: true,
      });
  }

  // ---- fs-badges: the tortoise lit on every slow slot (a slow word, a read-back's sounds) and the rabbit on the fast
  // word after it, in the games with a fast/slow moment: a nav log `speed` entry around it, or the page's own lighting
  // as the clip started (continuous.ts's `lit`: the nav layer's badges, or a warm-up's own tortoise and rabbit)
  {
    // (a `speed` entry with the nav badges not drawn lit nothing the child could see: a warm-up's own count by `lit`)
    const speed = evs.filter((e) => e.kind === "speed" && (e as any).shown !== false);
    // lit: a `speed` entry for it from 1.5 s before to 0.8 s after the start, or it was the last one lit (within 6 s: a
    // lead-in may light it before its own line), or the page had it lit as a clip of the slot started
    const litBy = (which: string, t: number, clips: CEv[]) => {
      const last = speed.filter((s) => s.t <= t + 0.8).at(-1);
      return speed.some((s) => s.text === which && s.t >= t - 1.5 && s.t <= t + 0.8) || (!!last && last.text === which && t - last.t < 6) || clips.some((c) => c.lit?.includes(which));
    };
    const slow: { t: number; clips: CEv[]; game: string; level: string | null; label: string }[] = [];
    const fast: { t: number; clips: CEv[]; game: string; level: string | null; label: string }[] = [];
    const inSlot = new Set<CEv>();
    for (const r of all) {
      slow.push({ t: r.slot[0].t, clips: r.slot, game: r.game, level: r.level, label: r.slot[0].kind === "stretch" ? `[${r.word.lid!.slice(5)}, slowly]` : `the sounds of ${r.word.lid!.slice(5)}` });
      r.slot.forEach((c) => inSlot.add(c));
      fast.push({ t: r.word.t, clips: [r.word], game: r.game, level: r.level, label: `[${r.word.lid!.slice(5)}]` });
    }
    for (const e of evs) if (e.kind === "stretch" && e.game && FS_GAMES.has(e.game) && !inSlot.has(e) && !inReplay(e.t)) slow.push({ t: e.t, clips: [e], game: e.game, level: e.level, label: `[${e.lid!.slice(8)}, slowly]` });
    const dark = (xs: typeof slow, which: string) => xs.filter((x) => !litBy(which, x.t, x.clips));
    const ds = dark(slow, "slow"), df = dark(fast, "fast");
    const n = slow.length + fast.length;
    if (!n) M.push({ id: "fs-badges", row: "the tortoise lit on every slow slot, the rabbit on the fast word after it", value: "n/a", target: "100%", pass: null, detail: ["no slow slot in a game with a fast/slow moment"] });
    else
      M.push({
        id: "fs-badges",
        row: "the tortoise lit on every slow slot, the rabbit on the fast word after it",
        value: `tortoise ${slow.length - ds.length} of ${slow.length}, rabbit ${fast.length - df.length} of ${fast.length}${speed.length || evs.some((e) => e.lit) ? "" : " (no `speed` entries or lit badges recorded)"}${replays.length ? `; the paw's ${replays.length} replay${replays.length === 1 ? "" : "s"} not judged` : ""}`,
        target: "100%",
        pass: !ds.length && !df.length,
        detail: [...ds.slice(0, 5).map((x) => `${x.game} (${x.level ?? "?"} @${fmtT(x.t)}): the tortoise not lit on ${x.label}`), ...df.slice(0, 5).map((x) => `${x.game} (${x.level ?? "?"} @${fmtT(x.t)}): the rabbit not lit on ${x.label}`)],
      });
  }

  // ---- fs-answer-leak: in Slow Words, Guess My Word, Ninja Run and Kai and Suki, the word the child must find said
  // before the child's first answer to it (a fast word, `tv_idle_look_<w>`, or the rabbit), FS2 and §9.7 rule 3
  {
    const played = evs.some((e) => e.game && FS_LEAK_GAMES.has(e.game));
    const leaks: string[] = [];
    for (const e of says) if (e.game && FS_LEAK_GAMES.has(e.game) && /^tv_idle_look_/.test(e.lid!)) leaks.push(`${e.game} ${where(e)}: ${quote(e)} names the answer`);
    const board = actions.filter((a) => !a.nav && !isRabbitTap(a));
    let judged: string | null = null;
    for (let i = 0; i < board.length; i++) {
      const a = board[i];
      if (!a.game || !FS_LEAK_GAMES.has(a.game)) continue;
      const from = Math.max(board[i - 1]?.t ?? -Infinity, a.t - 90);
      const turn = evs.filter((e) => e.kind === "turn" && e.game === a.game && e.t > from && e.t <= a.t + 0.3).at(-1);
      const lantern = a.text.match(/^lantern "(.+)"$/)?.[1];
      // (not a new question: a second try, a tap outside a turn, or Kai and Suki's sound taps before the readers)
      if (!turn && !lantern) continue;
      const win = evs.filter((e) => e.t > from && e.t < a.t - 0.05 && e.seg === a.seg && (!e.game || e.game === a.game));
      if (a.game === "readcheck") {
        // the readers' own words are the question; Sensei's word, a fast lead or the rabbit before the answer give it away
        for (const e of win) {
          const led = win.filter((x) => isSay(x) && x.t <= e.t).at(-1);
          if ((e.kind === "word" && !(led && READER_RE.test(led.lid ?? "") && e.t - led.t < 3)) || (isSay(e) && FS_FAST_LEADS.includes(e.lid!)) || e.kind === "rabbit")
            leaks.push(`readcheck ${where(e)}: ${e.kind === "word" ? `[${e.lid!.slice(5)}]` : e.kind === "rabbit" ? "the rabbit" : quote(e)} before the child chose a reader`);
        }
        continue;
      }
      const answer = lantern ?? turn!.text;
      // (a second try at the same question: the child has answered it once; a correction may say the word now)
      const prev = board[i - 1];
      if (judged === answer && prev && prev.game === a.game && prev.text !== answer) continue;
      judged = answer;
      for (const e of win) if (e.kind === "word" && e.lid === `word:${answer}`) leaks.push(`${a.game} ${where(e)}: [${answer}] said before the child's answer (${where(a)})`);
    }
    if (!played) M.push({ id: "fs-answer-leak", row: "the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki)", value: "n/a", target: "0", pass: null, detail: ["none of those games in this transcript"], major: true });
    else M.push({ id: "fs-answer-leak", row: "the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki)", value: String(leaks.length), target: "0", pass: leaks.length === 0, detail: leaks.slice(0, 8), major: true });
  }

  // ---- fs-rabbit: Move 1's rabbit is the child's own action (a nav log `rabbit` entry, or a tap on a warm-up's own
  // rabbit), and it is live only then: a rabbit tap with no rabbit prompt before it was a tap at another time
  {
    const prompts = says.filter((e) => FS_MOVE1.includes(e.lid!));
    const rabbitEvs = evs.filter((e) => (e.kind === "rabbit" && (e.text === "tap" || e.text === "timeout")) || isRabbitTap(e));
    const answered = prompts.filter((p) => {
      const nextWord = evs.find((e) => e.t > p.t && e.kind === "word");
      const until = Math.min(nextWord ? nextWord.t + 0.3 : Infinity, p.t + 25);
      return rabbitEvs.some((r) => r.t > p.t && r.t <= until);
    });
    const tapsOut = evs.filter((e) => e.kind === "rabbit" && e.text === "tap").filter((r) => !prompts.some((p) => r.t > p.t && r.t - p.t < 25));
    const timeouts = evs.filter((e) => e.kind === "rabbit" && e.text === "timeout").length;
    if (!prompts.length) M.push({ id: "fs-rabbit", row: "Move 1's rabbit: a child action after every rabbit prompt, and live only then", value: "n/a", target: "all; 0 outside", pass: null, detail: ["no rabbit prompt (tv_fs_rabbit_read, fm_tap_rabbit) in this transcript"] });
    else
      M.push({
        id: "fs-rabbit",
        row: "Move 1's rabbit: a child action after every rabbit prompt, and live only then",
        value: `${answered.length} of ${prompts.length} prompts answered (${timeouts} timed out); ${tapsOut.length} rabbit taps outside a prompt`,
        target: "all; 0 outside",
        pass: answered.length === prompts.length && tapsOut.length === 0,
        detail: [...prompts.filter((p) => !answered.includes(p)).slice(0, 5).map((p) => `${where(p)} ${quote(p)}: no rabbit tap or timeout logged before the word`), ...tapsOut.slice(0, 3).map((r) => `${where(r)}: a rabbit tap with no prompt before it`)],
      });
  }

  // ---- fs-talk: talk before a child action in the runs that have a fast/slow line (≤ 12 s, TS §9.7 rule 4); the
  // rabbit's tap splits the talk
  {
    const opens = evs.filter((e) => e.kind === "turn" || e.kind === "hold");
    const speech = evs.filter(isSpeech);
    const runs: { len: number; from: CEv; cue: CEv; fs: CEv }[] = [];
    for (let i = 0; i + 1 < actions.length; i++) {
      const a = actions[i], b = actions[i + 1];
      if (a.nav === "show") continue; // (the demo the child asked to see again: as talk-before-action)
      const gap = speech.filter((e) => e.t > a.t && e.t < b.t);
      const fs = gap.find((e) => isSay(e) && ((e.lid ?? "").startsWith("tv_fs_") || FS_MOVE1.includes(e.lid ?? "")));
      if (!fs) continue;
      const open = opens.find((o) => o.t > a.t + 0.1 && o.t < b.t);
      const cue = gap.filter((e) => isSay(e) && e.t <= (open ? open.t + 0.3 : b.t)).at(-1);
      if (!cue) continue;
      // (a level's own talk when the cue is in the level: talk before it on the map isn't the level's; C1, D1 and B1's
      // finding, integration 27 Sep. When the cue is after the level (the reward, a trip, the map), the level's closing
      // talk and the reward's are one run the child sits through, and it is measured whole: w1-6's "…the tortoise" ·
      // battle_win · tv_battle_why · flower_i5 ran 17.9 s unseen until verify round 2)
      const mine = cue.level ? gap.filter((e) => e.seg === cue.seg && e.level === cue.level && e.t <= cue.t) : gap.filter((e) => e.t <= cue.t && (run.continuous || e.seg === cue.seg));
      if (mine.length && mine.includes(fs)) runs.push({ len: cue.t - mine[0].t, from: mine[0], cue, fs });
    }
    const over = runs.filter((r) => r.len > 12.05).sort((x, y) => y.len - x.len);
    const worst = runs.slice().sort((x, y) => y.len - x.len)[0];
    const into =(r: { cue: CEv }) => (r.cue.level ? "" : ` into ${placeOf(r.cue)}`);
    if (!runs.length) M.push({ id: "fs-talk", row: "talk before a child action, in runs with a fast/slow line (into the reward included)", value: "n/a", target: "≤ 12 s", pass: null, detail: ["no fast/slow line said"] });
    else M.push({ id: "fs-talk", row: "talk before a child action, in runs with a fast/slow line (into the reward included)", value: `max ${worst.len.toFixed(1)} s (${worst.fs.game ?? "?"} ${worst.fs.level ?? ""}${into(worst)}); ${over.length} over`, target: "≤ 12 s", pass: over.length === 0, detail: over.slice(0, 6).map((r) => `${r.fs.game ?? "?"} (${r.fs.level ?? "?"}${into(r)}) ${r.len.toFixed(1)} s from ${quote(r.from)} to ${quote(r.cue)}, with ${quote(r.fs)}`) });
  }
  return M;
}

/** fast-line: teacher-voice sentence lines recorded faster than 3.3 words a second (TEACHER_SCRIPT §7.4), from the
 *  durations of the recorded clips. Independent of any transcript. */
export function fastLines(): Metric {
  const tv = LINES.filter((l) => l.id.startsWith("tv_") && DUR[`l/${l.id}`] && wordCount(l.text) >= 4);
  if (!tv.length) return { id: "fast-line", row: "new sentence lines faster than 3.3 words a second", value: "n/a", target: "0", pass: null, detail: [`${LINES.filter((l) => l.id.startsWith("tv_")).length} tv_ lines in lines.ts, none recorded yet (no durations)`] };
  const fast = tv.map((l) => ({ l, wps: wordCount(l.text) / (DUR[`l/${l.id}`] / 1000) })).filter((x) => x.wps > 3.3).sort((a, b) => b.wps - a.wps);
  return { id: "fast-line", row: "new sentence lines faster than 3.3 words a second", value: `${fast.length} of ${tv.length}`, target: "0 (or re-taken)", pass: fast.length === 0, detail: fast.slice(0, 8).map((x) => `‹${x.l.id}› ${x.wps.toFixed(1)} w/s "${x.l.text.slice(0, 60)}"`) };
}

/** Segments for the utterance helpers above, from a normalised run. */
function segsOf(run: Run): Seg[] {
  const out: Seg[] = [];
  for (const e of run.evs) {
    const s = out.at(-1);
    if (!s || s.name !== e.seg) out.push({ name: e.seg, events: [e] });
    else s.events.push(e);
  }
  return out;
}

function checkMarkdown(results: { run: Run; metrics: Metric[] }[], fast: Metric): string {
  const v = (m: Metric) => (m.pass === null ? "n/a" : m.pass ? "pass" : "**FAIL**");
  const out = ["## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)", ""];
  for (const { run, metrics } of results) {
    out.push(`### ${run.label}: ${run.file}`, "", `${run.persona}${run.from ? `, from ${run.from}` : ", a brand-new child"}, opt-in ${run.optin}${run.rich ? "" : "; recorded before continuous.ts published games, turns and holds, so games come from the scene"}.`, "", "| Metric | Target | Value | Verdict |", "|---|---|---|---|");
    for (const m of metrics) out.push(`| \`${m.id}\` ${m.row} | ${m.target} | ${m.value} | ${v(m)} |`);
    const bad = metrics.filter((m) => m.pass === false);
    if (bad.length) out.push("", ...bad.flatMap((m) => [`- **${m.id}**: ${m.detail.slice(0, 6).join("; ")}`]));
    out.push("");
  }
  out.push(`### Recordings`, "", `| \`${fast.id}\` ${fast.row} | ${fast.target} | ${fast.value} | ${v(fast)} |`, "", ...fast.detail.map((d) => `- ${d}`), "");
  return out.join("\n");
}

async function main() {
  const md = [`# Script audit`, "", `Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.`, "", ...FILES.map(report)].join("\n");
  if (!CHECK) {
    if (OUT) writeFileSync(OUT, md);
    else console.log(md);
    return;
  }
  // src/content/games.ts (F2) once it lands: its frame lines join the table's
  const games: Record<string, Need> = { ...TV_GAMES };
  try {
    const G: Record<string, any> = (await import("../../src/content/games" as string)).GAMES ?? {};
    const slot = (id: string) => id.replace(/_<[^>]+>$/, "_*");
    for (const [id, g] of Object.entries(G)) {
      if (!games[id] || !Array.isArray(g?.full?.frame)) continue;
      const demo = [...(games[id].demo ?? []), ...((g.full.demo ?? []) as string[]).map(slot)];
      games[id] = { ...games[id], frame: [...new Set([...games[id].frame, ...(g.full.frame as string[]).map(slot)])], ...(demo.length ? { demo: [...new Set(demo)] } : {}) };
    }
  } catch {}
  const results = FILES.map((f) => ({ run: loadRun(f), metrics: [] as Metric[] })).map((r) => ({ ...r, metrics: checkRun(r.run, games) }));
  const fast = fastLines();
  const table = checkMarkdown(results, fast);
  if (OUT) writeFileSync(OUT, md + "\n\n" + table);
  console.log(table);
  // one finding per failing metric, across the runs
  const fails = new Map<string, { m: Metric; runs: string[] }>();
  for (const { run, metrics } of results) for (const m of [...metrics, ...(results[0]?.run === run ? [fast] : [])]) if (m.pass === false) fails.set(m.id, { m, runs: [...(fails.get(m.id)?.runs ?? []), `${run.label} ${m.value}`] });
  const findings: Finding[] = [...fails].map(([id, { m, runs }]) => ({ sig: `script:${id}`, source: "script", severity: m.major ? "major" : "minor", case: "script", title: `script:${id}: ${m.row}`, detail: `Target ${m.target}. ${runs.join("; ")}. ${m.detail.slice(0, 3).join("; ")}`, evidence: FILES }));
  if (FINDINGS) writeFileSync(FINDINGS, JSON.stringify(findings, null, 1));
  if (METRICS) writeFileSync(METRICS, JSON.stringify({ fast, runs: results.map(({ run, metrics }) => ({ file: run.file, label: run.label, persona: run.persona, from: run.from, metrics })) }, null, 1));
  const n = findings.length;
  console.log(n ? `\n${n} metric${n > 1 ? "s" : ""} failed: ${[...fails.keys()].join(", ")}` : "\nall targets met");
  process.exitCode = n ? 1 : 0;
}
if (import.meta.main) await main();
