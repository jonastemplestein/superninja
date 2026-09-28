// bun test playtest/speech-templates/design
// The reference template model: every catalogue template obeys the grammar, speaks the right clips, and every clip's
// text is recoverable. Reads the game's LINES and WORDS; edits nothing.
import { describe, expect, test } from "bun:test";
import { LINES } from "../../../src/content/lines";
import { WORDS } from "../../../src/content/phonics";
import { CATALOGUE, BY_ID } from "./catalogue";
import { check, parse, positions, speak, textOf, clipsOf, renderJobs, clipIdOf, urlOf, type Content, type TemplateDef } from "./template";

const HAS = new Set(LINES.map((l) => l.id));
const SEGS = new Map(WORDS.map((w) => [w.text, w.segs]));
const content: Content = { segs: (w) => SEGS.get(w), hasLine: (id) => HAS.has(id), article: (w) => (["sun", "moon"].includes(w) ? "the" : undefined) };
const T = (id: string) => BY_ID.get(id)!;
const fake = (text: string, slots: TemplateDef["slots"]): TemplateDef => ({ id: "x", text, slots, purpose: "instruction", tier: "sound", domain: "fixed", lane: "-" });

describe("the grammar", () => {
  test("every catalogue template passes", () => {
    const errors = CATALOGUE.flatMap((t) => check(t).errors);
    expect(errors).toEqual([]);
  });
  test("ids are unique and file-safe", () => {
    expect(new Set(CATALOGUE.map((t) => t.id)).size).toBe(CATALOGUE.length);
    for (const t of CATALOGUE) expect(t.id).toMatch(/^[a-z][a-z0-9_]*$/);
  });
  test("the shapes Jonas and the experiments ruled out are errors", () => {
    const bad: [string, TemplateDef["slots"], RegExp][] = [
      ["Say this sound: {sound}", { sound: "sound" }, /colon/],
      ["Say this word slowly... {word~bare}", { word: "word" }, /the word|stand alone/],
      ["Change {a} to {b}.", { a: "sound", b: "sound" }, /R3/], // "Change /s/ to /m/." won 4% of votes
      ["{t} stays the same.", { t: "sound" }, /R4/],
      ["Is it {sound}?", { sound: "sound" }, /R7/],
      ["Your word is {word~bare}.", { word: "word" }, /R5/],
      ["Say {sound}.", { sound: "sound" }, /under 2 words/],
      ["This is the way we spell {g}.", { g: "spelling" }, /key slot/],
    ];
    for (const [text, slots, why] of bad) expect(check(fake(text, slots)).errors.join(" | ")).toMatch(why);
  });
  test("the shapes that won are clean", () => {
    for (const [text, slots] of [
      ["Say {word} slowly.", { word: "word" }],
      ["Say the sound {sound}.", { sound: "sound" }],
      ["Change the sound {a}, to the sound {b}.", { a: "sound", b: "sound" }], // two lead-ins: 96% of votes
      ["Does this word have the sound {a}, or the sound {b}?", { a: "sound", b: "sound" }],
    ] as [string, TemplateDef["slots"]][]) expect(check(fake(text, slots)).errors).toEqual([]);
  });
});

describe("speak()", () => {
  test("Say mat slowly: one whole take", () => {
    expect(speak(T("w_say_slowly"), { word: "mat" }, content)).toEqual([
      { tpl: "w_say_slowly", piece: 0, key: "mat", text: "Say mat slowly.", hide: ["mat"], fallback: [{ line: "tv_fs_say_slow" }, { join: "breath" }, { stretch: "mat" }] },
    ]);
  });
  test("Say the sound /a/: a lead-in, a breath, the pure sound", () => {
    const s = speak(T("s_say_the_sound"), { sound: "a" }, content);
    expect(s.slice(0, 1)).toMatchObject([{ tpl: "s_say_the_sound", piece: 0, key: "_", text: "Say the sound..." }]);
    expect(s.slice(1)).toEqual([{ join: "breath" }, { sound: "a", show: "petal" }]);
  });
  test("the official formula keeps the sound where Sounds~Write puts it", () => {
    const t = T("ws_way_we_spell");
    const s = speak(t, { sound: "m", word: "mat", spelling: "m_m" }, content);
    expect(s[0]).toEqual({ line: "t_way_we_spell" });
    expect(s.slice(1, 4)).toEqual([{ join: "breath" }, { sound: "m", show: "petal" }, { join: "breath" }]);
    expect(s[4]).toEqual({ line: "tg_m_m_in" }); // adopted: "...in mat." is recorded already
    const fresh = speak(t, { sound: "m", word: "map", spelling: "m_m" }, { ...content, hasLine: (id) => id === "t_way_we_spell" });
    expect(fresh[4]).toMatchObject({ tpl: "ws_way_we_spell", piece: 1, key: "map", text: "...in map." });
    expect(textOf(t, { sound: "m", word: "mat", spelling: "m_m" }, content)).toBe("This is the way we spell /m/ in mat.");
  });
  test("adopted families resolve to their recorded line", () => {
    expect(speak(T("w_name_pic"), { picture: "sock" }, content)).toEqual([{ line: "fm_name_sock" }]);
    expect(speak(T("ws_starts_with"), { picture: "mop", sound: "m" }, content).slice(0, 2)).toEqual([{ line: "fs_mop" }, { join: "breath" }]);
  });
  test("a picture's article comes from the content", () => {
    expect(renderJobs(T("w_name_pic"), { picture: "moon" }, { ...content, hasLine: () => false })[0].text).toBe("This is the moon.");
    expect(renderJobs(T("w_name_pic"), { picture: "ant" }, { ...content, hasLine: () => false })[0].text).toBe("This is an ant.");
  });
  test("a dictation word is hidden in the caption until revealed", () => {
    expect(textOf(T("w_your_word"), { word: "sat" }, content, "caption")).toBe("Your word is 🔊.");
    expect(textOf(T("w_your_word"), { word: "sat" }, content, "caption", true)).toBe("Your word is sat.");
  });
  test("two sounds, two lead-ins", () => {
    const s = speak(T("ss_can_be"), { sound: "a", sound2: "ae" }, content);
    expect(s.filter((x) => "sound" in x).map((x) => ("sound" in x ? x.sound : ""))).toEqual(["a", "ae"]);
    expect(textOf(T("ss_can_be"), { sound: "a", sound2: "ae" }, content)).toBe("This can be /a/, but in this word, it's /ae/. Say it here.");
  });
  test("every rendered clip's text is recoverable from its id's template and values", () => {
    for (const t of CATALOGUE) {
      const v = sample(t);
      for (const s of speak(t, v, content)) {
        if (!("tpl" in s)) continue;
        const job = renderJobs(t, v, { ...content, hasLine: () => false }).find((j) => j.clip === clipIdOf(s.tpl, s.piece, s.key));
        expect(job?.text).toBe(s.text);
        expect(job?.url).toBe(urlOf(s.tpl, s.piece, s.key));
      }
      expect(clipsOf(t, v, content).every((u) => u.startsWith("/a/"))).toBe(true);
    }
  });
});

test("slot positions: Say {word} slowly is medial; a sound after a lead-in ends its sentence", () => {
  expect(positions(T("w_say_slowly"))).toEqual({ word: "M" });
  expect(positions(T("w_your_word"))).toEqual({ word: "F" });
  expect(positions(T("ws_starts_with"))).toEqual({ picture: "I", sound: "end" });
  expect(positions(T("ws_way_we_spell"))).toEqual({ sound: "phrase", word: "F" });
  expect(positions(T("w_listen_again"))).toEqual({ word: "M", "word~slow": "alone" });
});

describe("fallbacks", () => {
  const LARGE = new Set(["words", "build-items", "sort-words", "swap-starts", "swap-steps", "read-words"]);
  test("every template over a large domain has a fallback, and no fallback joins a word inside a sentence", () => {
    for (const t of CATALOGUE.filter((t) => LARGE.has(t.domain) && t.tier === "whole")) expect(t.fallback, t.id).toBeDefined();
    for (const t of CATALOGUE) {
      const fb = t.fallback?.(sample(t)) ?? [];
      fb.forEach((s, i) => {
        if ("word" in s) expect(fb[i - 1], `${t.id}: a word after a sentence join only`).toEqual({ join: "sentence" });
      });
    }
  });
});

/** A plausible member for each template, for the round-trip tests. */
function sample(t: TemplateDef): Record<string, string | number> {
  const v: Record<string, string | number> = {};
  for (const [k, type] of Object.entries(t.slots)) {
    v[k] = type === "sound" ? (k.endsWith("2") ? "ae" : "a") : type === "pos" ? "first" : type === "name" ? "kai" : type === "n" ? 3 : type === "count" ? 2 : type === "title" ? "The Big Red Hen" : type === "spelling" ? "a_a" : type === "key" ? "a" : type === "list" ? "rain, tail and nail" : k.endsWith("2") ? "sat" : "mat";
  }
  return v;
}
