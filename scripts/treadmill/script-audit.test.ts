// The script audit's line classifier against the teacher's voice itself: every line docs/TEACHER_SCRIPT.md says (the 339
// new lines of §7.1 with their generated families, the 24 re-recorded lines of §7.2, the fast and slow lines of §9.4,
// and every existing line its tables keep as it is) must pass `bare-command` and `shouted-instruction` (TEACHER_SCRIPT
// §8.2 T7: no line under four words is an instruction; "!" only for celebrations). A hit here is the classifier's mistake, not the script's (27 Sep: every
// "Look, …" line read as an order). Run with `bun test ./scripts/treadmill`.
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { LINES } from "../../src/content/lines";
import { checkRun, FS_IDEAS, fsNavEvents, isBareCommand, isInstructionSentence, isShoutedInstruction, readBacks, type CEv, type Run } from "./script-audit";

const TS = readFileSync(new URL("../../docs/TEACHER_SCRIPT.md", import.meta.url), "utf8");
const TEXT = new Map(LINES.map((l) => [l.id, l.text]));
const section = (from: string, to: string) => TS.slice(TS.indexOf(from), TS.indexOf(to));
/** A generated family (`tv_your_word_<w>`): every member lines.ts has. */
const family = (id: string) => (id.includes("<") ? LINES.filter((l) => l.id.startsWith(id.slice(0, id.indexOf("<")))).map((l) => l.id) : [id]);

/** Every line the script says, as [id, text, where]: lines.ts's text (what was recorded), and the script's own text for
 *  §7.1 and §7.2 (what should have been). */
function scriptLines(): [string, string, string][] {
  const out: [string, string, string][] = [];
  const add = (id: string, where: string, text?: string) => {
    for (const m of family(id)) {
      if (TEXT.has(m)) out.push([m, TEXT.get(m)!, `${where}, lines.ts`]);
      if (text && m === id) out.push([m, text, `${where}, the script`]);
    }
  };
  // §7.1: | n | § | `id` | text |
  for (const m of section("### 7.1", "### 7.2").matchAll(/^\| \d+ \| [^|]+ \| `([^`]+)` \| (.+?) \|$/gm)) add(m[1], "§7.1", m[2]);
  // §7.2: | id · id | today | new text |
  for (const m of section("### 7.2", "### 7.3").matchAll(/^\| ([a-z][^|]*?) \| [^|]* \| (.+?) \|$/gm)) for (const id of m[1].split(" · ")) add(id.trim(), "§7.2", m[2]);
  // §9.4: the fast and slow lines (lines.ts's text: the table's text carries the slots, "… /s/ /a/ /t/")
  for (const m of section("### 9.4", "### 9.5").matchAll(/^\| `?([a-z][a-z0-9_]*)`?[ (|]/gm)) add(m[1], "§9.4");
  // §2–§5: the first column of every table whose header starts "| line id" (the kept lines, as they are)
  let inTable = false;
  for (const row of section("## 2. The rules", "## 6. Timings").split("\n")) {
    if (!row.startsWith("|")) {
      inTable = false;
      continue;
    }
    if (/^\| line id \|/.test(row)) {
      inTable = true;
      continue;
    }
    if (!inTable || /^\|[-| ]+\|$/.test(row)) continue;
    const first = row.split("|")[1].replace(/\(replaces[^)]*\)/g, " ").replace(/\([^)]*\)/g, " ").replace(/\[[^\]]*\]/g, " ").replace(/\/[^/\s]+\//g, " ").replace(/[↳↻*`]/g, " ");
    for (const tok of first.split(/[·,\s]+/).filter((t) => /^[a-z][a-z0-9_]*(<[a-z]+>)?[a-z0-9_]*$/.test(t))) add(tok, "a §2–§5 table");
  }
  return out;
}

describe("script-audit's classifier on TEACHER_SCRIPT", () => {
  const all = scriptLines();

  test("reads the whole script", () => {
    const ids = new Set(all.map(([id]) => id));
    expect(ids.size).toBeGreaterThan(500);
    for (const id of ["tv_ready_first", "tv_ears_on", "tv_readers_meet", "tv_bar_down", "audit_gem_first", "streak_lost", "nav_ready", "tv_your_word_sock", "tv_fs_two_ways", "tv_fs_rabbit_read", "tv_fs_praise_every_4"]) expect(ids.has(id)).toBe(true);
  });

  test("0 false bare-command hits", () => {
    const hits = all.filter(([id, text]) => isBareCommand(text, id)).map(([id, text, where]) => `${id} "${text}" (${where})`);
    expect(hits).toEqual([]);
  });

  test("0 false shouted-instruction hits", () => {
    const hits = all.filter(([id, text]) => isShoutedInstruction(text, id)).map(([id, text, where]) => `${id} "${text}" (${where})`);
    expect(hits).toEqual([]);
  });
});

describe("isInstructionSentence", () => {
  test('"Look," leads; it is not the order', () => {
    for (const s of ["Look, a gem!", "Look, your ninja is ready.", "Look, it's Kai and Suki.", "Look, its bar went down.", "Look, your ninja has its ninja ears on."]) expect(isInstructionSentence(s)).toBe(false);
    for (const s of ["Look, tap the sun!", "Look at the sun.", "Look..."]) expect(isInstructionSentence(s)).toBe(true);
  });
  test("labels and bare verbs are orders", () => {
    for (const s of ["Ninja ears on!", "Your turn!", "Now you try!", "Tap the sun!", "Listen...", "Listen!", "Watch.", "Spell...", "Now tap the rabbit, and say it fast."]) expect(isInstructionSentence(s)).toBe(true);
  });
  test("exclamations, invitations and encouragement are not", () => {
    for (const s of ["Zap!", "Look!", "Bong!", "Let me show you...", "Let's do it together.", "Look how your ninja is glowing!", "Keep going, ninja.", "Take your time, ninja."]) expect(isInstructionSentence(s)).toBe(false);
  });
});

describe("the checks still bite", () => {
  test("bare-command and shouted-instruction on the lines Jonas heard", () => {
    for (const t of ["Listen...", "Your turn!", "Watch.", "Spell...", "Tap the sun!"]) expect(isBareCommand(t)).toBe(true);
    for (const t of ["Tap the sun!", "Now you try!", "Ninja ears on!", "Watch me first!", "Say that sound with me!"]) expect(isShoutedInstruction(t)).toBe(true);
    expect(isBareCommand("Zap! Look, its bar went down.")).toBe(false);
    expect(isShoutedInstruction("Zap! Look, its bar went down.")).toBe(false);
    expect(isShoutedInstruction("Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up.")).toBe(false);
    // praise is exempt, by id
    expect(isShoutedInstruction("Keep it up!", "yay_1")).toBe(false);
  });
  test("lines.ts still has lines that fail (the retired barks)", () => {
    const bare = LINES.filter((l) => isBareCommand(l.text, l.id));
    const shout = LINES.filter((l) => isShoutedInstruction(l.text, l.id));
    expect(bare.length).toBeGreaterThan(5);
    expect(shout.length).toBeGreaterThan(5);
  });
});

// ---------------------------------------------------------------- the fast and slow checks (FIX_PLAN §13.5, FS-F4.1)
// Small hand-made transcripts: TEACHER_SCRIPT §9.3's moves as the scenes will play them pass, and today's read-backs,
// the answer said early, a repeated idea line and a stray rabbit fail.
type E = [t: number, kind: string, id: string, extra?: Record<string, unknown>];
/** A continuous run (one session) from [t, kind, id] rows: `say` rows take a line id, `sound`/`word`/`stretch` rows a
 *  sound or word, `tap` rows a label; `extra` sets level, game, nav, dur, which, how... (level w1-4, game build by default). */
function mk(rows: E[], o: { level?: string; game?: string; from?: string } = {}): Run {
  const evs: CEv[] = rows.map(([t, kind, id, extra]) => {
    const lid = kind === "say" ? id : kind === "sound" ? `sound:${id}` : kind === "word" ? `word:${id}` : kind === "stretch" ? `stretch:${id}` : undefined;
    return { t, kind, text: id, ...(lid ? { lid, id: kind === "say" ? id : undefined } : {}), dur: kind === "say" ? 1500 : kind === "sound" ? 500 : kind === "word" ? 600 : kind === "stretch" ? 1600 : undefined, seg: "s", level: o.level ?? "w1-4", game: o.game ?? "build", ...(extra ?? {}) } as CEv;
  });
  return { file: "test.json", label: "T", persona: "perfect", from: o.from ?? null, optin: "none", fresh: !o.from, continuous: true, evs, rich: true };
}
const metric = (run: Run, id: string) => checkRun(run).find((m) => m.id === id)!;

/** Word Building's Move 1 (TS §9.3): tv_fs_say_sounds_slow · the tiles' sounds · tv_fs_rabbit_read · the tap · [am] ·
 *  the idea; the nav layer logs the tortoise, the rabbit's tap and the rabbit. */
const MOVE1: E[] = [
  [0, "hold", "ready:build", { end: 1, how: "next" }],
  [1, "tap", "Next", { nav: "next" }],
  [2, "turn", "a"],
  [3, "tap", "a"],
  [3.2, "sound", "a"],
  [4, "tap", "m"],
  [4.2, "sound", "m"],
  [5, "say", "tv_fs_say_sounds_slow"],
  [7.4, "speed", "slow"],
  [7.5, "sound", "a"],
  [8.1, "sound", "m"],
  [9, "say", "tv_fs_rabbit_read"],
  [12, "rabbit", "tap"],
  [12, "tap", "rabbit", { nav: "rabbit" }],
  [12.2, "speed", "fast"],
  [12.3, "word", "am"],
  [13.3, "say", "tv_fs_spell"],
  [15, "turn", "a"],
  [16, "tap", "a"],
];

describe("the fast and slow checks", () => {
  test("Word Building's Move 1 passes every fast/slow row", () => {
    const run = mk(MOVE1);
    for (const id of ["fs-per-session", "fs-readback", "fs-badges", "fs-rabbit", "fs-repeat", "fs-idea-caps", "fs-talk"]) expect([id, metric(run, id).pass]).toEqual([id, true]);
    expect(metric(run, "fs-readback").value).toBe("1 of 1 (100%)");
    const r = readBacks(run);
    expect(r.length).toBe(1);
    expect(r[0].slot.map((e) => e.lid)).toEqual(["sound:a", "sound:m"]); // not the child's own tile sounds before it
  });

  test("today's read-back fails: say_sounds_read, the sounds, the word, no tortoise or rabbit", () => {
    const run = mk([[0, "hold", "ready:build", { end: 1, how: "next" }], [3, "tap", "a"], [3.2, "sound", "a"], [4, "tap", "m"], [4.2, "sound", "m"], [5, "say", "say_sounds_read"], [7.5, "sound", "a"], [8.1, "sound", "m"], [8.8, "word", "am"], [9.5, "say", "yay_1"]]);
    const rb = metric(run, "fs-readback");
    expect(rb.pass).toBe(false);
    expect(rb.detail[0]).toContain("no slow lead-in");
    expect(rb.detail[0]).toContain("no fast lead");
    expect(metric(run, "fs-per-session").pass).toBe(false);
    expect(metric(run, "fs-badges").pass).toBe(false);
  });

  test("a demo's read-back before the Ready isn't judged; the first one after it is", () => {
    const run = mk([[0, "say", "say_sounds_read"], [1.5, "sound", "a"], [2.1, "sound", "m"], [2.8, "word", "am"], [4, "hold", "ready:build", { end: 5, how: "next" }], ...MOVE1.slice(3).map(([t, k, id, x]) => [t + 5, k, id, x] as E)]);
    expect(metric(run, "fs-readback").pass).toBe(true);
  });

  test("the paw's replay of a demo isn't the child's first read-back, and its slots aren't judged for badges", () => {
    // the watcher at w1-4 (verify round 1): Show me again at the Ready replays the demo's read-back (no leads, the nav
    // badges not drawn), then the Ready again, then the child's Move 1
    const replay: E[] = [
      [0, "hold", "ready:build", { end: 2, how: "show" }],
      [2, "tap", "Show me again", { nav: "show" }],
      [3, "stretch", "am"],
      [5, "say", "tv_lets_say_read"],
      [7, "sound", "a"],
      [7.6, "sound", "m"],
      [8.3, "word", "am"],
      [10, "say", "tv_ready_now"],
    ];
    const run = mk([...replay, ...MOVE1.map(([t, k, id, x]) => [t + 11, k, id, x] as E)]);
    expect(metric(run, "fs-readback").pass).toBe(true);
    expect(metric(run, "fs-readback").value).toBe("1 of 1 (100%)");
    expect(metric(run, "fs-badges").pass).toBe(true);
    expect(metric(run, "fs-badges").value).toContain("the paw's 1 replay not judged");
    // (without the paw, the same read-back after the Ready is the child's, and fails)
    const noPaw = mk([[0, "hold", "ready:build", { end: 2, how: "next" }], ...replay.slice(2)]);
    expect(metric(noPaw, "fs-readback").pass).toBe(false);
  });

  test("a tap that said nothing is no answer between a read-back's halves (W6's cat, a learner)", () => {
    // verify round 1, w1-wu6: the learner tapped a dot while the rabbit waited; cat's Move 1 is the first read-back, so
    // mug (no rabbit, by design) isn't judged
    const dots: E[] = [
      [0, "hold", "ready:W6:dots", { end: 1, how: "next" }],
      [2, "tap", "dot 0"], [2.1, "sound", "k"], [5.5, "tap", "dot 1"], [5.5, "sound", "a"], [9.3, "tap", "dot 2"], [9.4, "sound", "t"],
      [10.5, "say", "fm_tap_rabbit"], [13.3, "tap", "dot 2"], [16.9, "rabbit", "tap"], [16.9, "tap", "rabbit", { nav: "rabbit" }], [17.3, "word", "cat"],
      [18, "say", "t_if_you_say_sounds"],
      [47.8, "tap", "dot 0"], [47.9, "sound", "m"], [48.5, "tap", "dot 1"], [48.6, "sound", "u"], [52, "tap", "dot 2"], [52.1, "sound", "g"], [54.4, "word", "mug"],
    ];
    const run = mk(dots, { level: "w1-wu6", game: "dots" });
    expect(readBacks(run).map((r) => r.word.lid)).toEqual(["word:cat", "word:mug"]);
    expect(metric(run, "fs-readback").pass).toBe(true);
    // a tap that says something (another dot's sound) still breaks it
    const said = mk([...dots.slice(0, 9), [13.35, "sound", "k"], ...dots.slice(9)], { level: "w1-wu6", game: "dots" });
    expect(readBacks(said).map((r) => r.word.lid)).toEqual(["word:mug"]);
  });

  test("Kai and Suki: the readers' words are the question, not a read-back or a leak", () => {
    const rc: E[] = [[0, "tap", "sound 0"], [0, "sound", "a"], [1, "tap", "sound 1"], [1, "sound", "m"], [2, "say", "read_who"], [3.5, "say", "suki_says"], [4.6, "word", "at"], [5.5, "say", "kai_says"], [6.6, "word", "am"], [7.5, "turn", "kai"], [8, "tap", "reader kai"], [8.5, "say", "tv_yes_kai"], [10, "say", "tv_fs_say_slow"], [12.4, "sound", "a"], [13, "sound", "m"], [13.8, "say", "tv_fs_now_fast"], [15.4, "word", "am"]];
    const run = mk(rc, { game: "readcheck" });
    expect(readBacks(run).map((r) => r.word.lid)).toEqual(["word:am"]);
    expect(readBacks(run)[0].t).toBe(12.4);
    expect(metric(run, "fs-answer-leak").pass).toBe(true);
    expect(metric(run, "fs-readback").pass).toBe(true);
    expect(metric(run, "fs-per-session").pass).toBe(true);
    // Sensei reading the word before the child picks a reader gives it away
    const leak = mk([...rc.slice(0, 7), [7, "say", "tv_fs_now_fast"], [7.3, "word", "am"], ...rc.slice(7)], { game: "readcheck" });
    expect(metric(leak, "fs-answer-leak").pass).toBe(false);
  });

  test("the answer said before the child's answer: Slow Words' fast word and tv_idle_look_<w>", () => {
    const ok: E[] = [[0, "say", "fm_slow_another"], [1.6, "stretch", "van"], [3, "turn", "van"], [5, "tap", "van"], [5.2, "word", "van"]];
    expect(metric(mk(ok, { level: "w1-wu3", game: "slowpick" }), "fs-answer-leak").pass).toBe(true);
    const early = mk([[0, "say", "fm_slow_another"], [1.6, "stretch", "van"], [3, "turn", "van"], [3.5, "word", "van"], [5, "tap", "van"]], { level: "w1-wu3", game: "slowpick" });
    expect(metric(early, "fs-answer-leak").pass).toBe(false);
    const idle = mk([[0, "stretch", "sock"], [2, "turn", "sock"], [10, "say", "tv_idle_look_sock"], [12, "tap", "sock"]], { level: "w1-wu3", game: "slowpick" });
    expect(metric(idle, "fs-answer-leak").detail[0]).toContain("tv_idle_look_sock");
    // Ninja Run: the lantern the bot flew at names the answer
    const run = mk([[0, "say", "tv_guess_q"], [1.5, "sound", "s"], [2, "sound", "i"], [2.5, "sound", "t"], [3, "word", "sit"], [4, "tap", 'lantern "sit"']], { level: "w1-9", game: "run" });
    expect(metric(run, "fs-answer-leak").pass).toBe(false);
  });

  test("an idea line twice in a session, and too many in a level", () => {
    const twice = mk([...MOVE1, [30, "say", "tv_fs_spell", { level: "w1-5" }]]);
    expect(metric(twice, "fs-repeat").pass).toBe(false);
    // (only what is heard counts: cut off the first time, it may come again)
    const cutFirst = mk([...MOVE1.map(([t, k, id, x]) => (id === "tv_fs_spell" ? [t, k, id, { ...x, cut: true }] : [t, k, id, x]) as E), [30, "say", "tv_fs_spell", { level: "w1-5" }]]);
    expect(metric(cutFirst, "fs-repeat").pass).toBe(true);
    const three = mk([...MOVE1, [20, "say", "tv_fs_two_ways"], [25, "say", "tv_fs_made"]]);
    expect(metric(three, "fs-idea-caps").pass).toBe(false);
  });

  test("from land 3, Moves 1 and 2 in the session's first game only", () => {
    const shift = (rows: E[], dt: number, x: Record<string, unknown>) => rows.map(([t, k, id, e]) => [t + dt, k, id, { ...e, ...x }] as E);
    const first = shift(MOVE1, 0, { level: "w5-1", game: "build" });
    const run = mk([...first, [40, "say", "tv_battle_frame", { level: "w5-2", game: "battle" }], [42, "say", "say_sounds_read", { level: "w5-2", game: "battle" }], [44, "sound", "a", { level: "w5-2", game: "battle" }], [44.6, "sound", "m", { level: "w5-2", game: "battle" }], [45.3, "word", "am", { level: "w5-2", game: "battle" }]], { from: "w5-1" });
    expect(metric(run, "fs-per-session").value).toBe("0 of 1 games");
    expect(metric(run, "fs-readback").value).toBe("1 of 1 (100%)");
    expect(metric(run, "fs-idea-caps").pass).toBe(true);
    const again = mk([...first, ...shift(MOVE1, 40, { level: "w5-2", game: "battle" })], { from: "w5-1" });
    expect(metric(again, "fs-idea-caps").pass).toBe(false);
  });

  test("the rabbit: every prompt answered, and never live at another time", () => {
    const noTap = mk(MOVE1.filter(([, k]) => k !== "rabbit" && k !== "tap"));
    expect(metric(noTap, "fs-rabbit").pass).toBe(false);
    const timeout = mk(MOVE1.map(([t, k, id, x]) => (k === "rabbit" ? [t, k, "timeout", x] : [t, k, id, x]) as E).filter(([, k, id]) => id !== "rabbit"));
    expect(metric(timeout, "fs-rabbit").pass).toBe(true);
    const stray = mk([...MOVE1, [40, "rabbit", "tap"], [40, "tap", "rabbit", { nav: "rabbit" }]]);
    expect(metric(stray, "fs-rabbit").pass).toBe(false);
  });

  test("the nav log's fast/slow entries become events, and a rabbit tap the tap log missed becomes a tap", () => {
    const out = fsNavEvents([{ t: 5, kind: "speed", which: "slow" }, { t: 9, kind: "rabbit", how: "tap" }, { t: 9.5, kind: "tap", nav: "next" }], []);
    expect(out.map((e) => `${e.kind}:${e.text}`)).toEqual(["speed:slow", "rabbit:tap", "tap:The rabbit"]);
    expect(fsNavEvents([{ t: 9, kind: "rabbit", how: "tap" }], [{ t: 9.2, kind: "tap", text: "rabbit", nav: "rabbit" }]).length).toBe(1);
  });

  test("the idea lines are lines.ts's tv_fs_ block less the lead-ins, the run, stuck and praise lines", () => {
    expect(FS_IDEAS.length).toBe(19);
    for (const id of ["tv_fs_two_ways", "tv_fs_hiding", "tv_fs_count"]) expect(FS_IDEAS).toContain(id);
    for (const id of ["tv_fs_rabbit_read", "tv_fs_say_slow", "tv_fs_run", "tv_fs_stuck_push", "tv_fs_praise_found_2"]) expect(FS_IDEAS).not.toContain(id);
  });
});

describe("fs-answer-leak and a second try", () => {
  test("a correction that says the word after a wrong answer isn't a leak", () => {
    const run = mk([[0, "stretch", "bug"], [2, "turn", "bug"], [4, "tap", "bun"], [4.1, "word", "bun"], [6, "say", "tv_fs_stuck_again"], [7, "word", "bug"], [7.5, "turn", "bug"], [9, "tap", "bug"]], { level: "w1-wu5", game: "sounds" });
    expect(metric(run, "fs-answer-leak").pass).toBe(true);
  });
});

// ---------------------------------------------------------------- verify round 2: the talk after a level, and question cycles
describe("talk-reward, talk-longest and fs-talk see the talk after a level", () => {
  /** w1-6's end: the last tile, the read-back, the level's close, then the reward's lines up to its held arrow. */
  const r = (x: Record<string, unknown> = {}) => ({ level: null, game: null, route: "reward:w1-6", ...x });
  const L = { route: "level:w1-6", level: "w1-6", game: "battle" };
  const END: E[] = [
    [0, "tap", "t", L],
    [0.3, "say", "tv_fs_slow_tortoise", L],
    [3, "stretch", "sat", L],
    [5, "say", "tv_fs_fast_rabbit", L],
    [7, "word", "sat", L],
    [8, "say", "battle_win", L],
    [10.5, "say", "tv_battle_why", L],
    [14, "say", "flower_i5", r()],
    [18.5, "say", "tv_to_flower", r()],
    [21, "hold", "reward", r({ end: 23, how: "next" })],
    [22, "tap", "Next", r({ nav: "next" })],
  ];
  test("a level's close into its reward is one run, measured whole", () => {
    const run = mk(END, { level: "w1-6", game: "battle" });
    expect(metric(run, "talk-reward").pass).toBe(false);
    expect(metric(run, "talk-reward").value).toContain("18.2 s (level:w1-6 → reward:w1-6)");
    expect(metric(run, "talk-longest").pass).toBe(false);
    expect(metric(run, "fs-talk").pass).toBe(false);
    expect(metric(run, "fs-talk").detail[0]).toContain("into reward:w1-6");
  });
  test("a tap the reward registers splits it", () => {
    const run = mk([...END.slice(0, 7), [9, "tap", "your petal", r()], ...END.slice(7)], { level: "w1-6", game: "battle" });
    for (const id of ["talk-reward", "talk-longest", "fs-talk"]) expect([id, metric(run, id).pass]).toEqual([id, true]);
  });
  test("a film's pages are watched, not counted", () => {
    const film: E[] = [[0, "tap", "Start"], [1, "say", "film_1", { route: "intro", level: null, game: null }], [7, "say", "film_2", { route: "intro", level: null, game: null }], [14, "say", "film_3", { route: "intro", level: null, game: null }], [20, "tap", "Next", { nav: "next", route: "intro", level: null }]];
    expect(metric(mk(film), "talk-longest").pass).toBe(null);
  });
});

describe("ask-cycle: one question in rotated variants, item after item", () => {
  /** A Sound Swap step: the new word, the question, the child's tap on the sound that changes, the place line, the pick. */
  const PLACE = ["st_first_changes", "st_middle_changes", "st_last_changes"];
  const step = (t: number, stem: string, w: string): E[] => [[t, "word", w], [t + 1, "say", stem], [t + 2, "turn", "t"], [t + 2.5, "tap", "t"], [t + 3, "say", PLACE[Math.round(t / 10) % 3]], [t + 5, "tap", "n"]];
  const STEMS = ["st_what_change", "st_what_change", "tv_which_changes", "tv_which_changes", "swap_which", "swap_which"];
  const o = { level: "w1-12", game: "swap" };
  test("w1-12's rotation (each stem twice) fails, though line-60s passes", () => {
    const run = mk(STEMS.flatMap((s, i) => step(i * 10, s, `w${i}`)), o);
    expect(metric(run, "line-60s").pass).toBe(true);
    expect(metric(run, "ask-cycle").pass).toBe(false);
    expect(metric(run, "ask-cycle").value).toContain("max 6 running");
  });
  test("a miss starts the count again; the question dropped after two first tries passes", () => {
    const missed = mk([...STEMS.slice(0, 3).flatMap((s, i) => step(i * 10, s, `w${i}`)), [29, "sfx", "wrong"], ...STEMS.slice(3).flatMap((s, i) => step(30 + i * 10, s, `v${i}`))], o);
    expect(metric(missed, "ask-cycle").pass).toBe(true);
    const faded = mk([...step(0, "st_what_change", "a"), ...step(10, "st_what_change", "b"), ...[20, 30, 40, 50].flatMap((t) => step(t, "tv_swap_now_change", `c${t}`))], o);
    expect(metric(faded, "ask-cycle").pass).toBe(true);
  });
  test("an idle re-ask is the same item", () => {
    const idle = mk([...step(0, "st_what_change", "a"), ...step(10, "st_what_change", "b"), [20, "word", "c"], [21, "say", "tv_which_changes"], [30, "say", "tv_which_changes"], [31, "tap", "t"], [33, "tap", "n"]], o);
    expect(metric(idle, "ask-cycle").pass).toBe(true);
  });
});
