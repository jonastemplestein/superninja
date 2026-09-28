/// <reference types="node" />
// The speech-template registry and model (src/content/templates.ts; docs/SPEECH_TEMPLATES.md §1, §2, §5).
// Run: bun test ./src/content/templates.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  TEMPLATES, TEMPLATE_IDS, TEMPLATE_LIST, check, members, nounPhrase, parse, pieceText, positions, renderJobs, speechPieces, templateParts, textOf, tierOf,
  lineRecorded, picturesWithoutNoun, type FallbackCtx, type TemplateContent, type TemplateDef, type Values,
} from "./templates";
import { decodeForTranscript, decodeTemplateClip, describeTemplateClip, isTemplateClip } from "./templates-decode";
import { WORD_BY_TEXT } from "./phonics";

const T = TEMPLATES;
const fake = (text: string, slots: TemplateDef["slots"]) => ({ id: "s_x", text, slots });
const ctx = (o: Partial<FallbackCtx> = {}): FallbackCtx => ({ slow: true, has: lineRecorded, segs: (w) => WORD_BY_TEXT[w]?.segs, ...o });
/** A plausible member of each template, for round trips. */
const SAMPLE: { [K in keyof typeof TEMPLATES]: Values } = {
  w_position_q: { pos: "first", word: "mat" }, w_next_q: { pos: "next" }, w_your_word: { word: "sat" }, w_your_next_word: { word: "pin" },
  w_listen_again: { word: "mat" }, ww_change: { word: "mat", word2: "sat" }, s_which_starts: { sound: "m" }, w_name_pic: { picture: "jam" },
  s_which_write: { sound: "s" }, s_say_read: { word: "mat" }, s_how_write: { sound: "t" }, s_here_sound: { sound: "a" },
  ws_way_we_spell: { sound: "ae", word: "rain", spelling: "ai>ae" }, ws_starts_with: { picture: "mop", sound: "m" }, w_say_slowly: { word: "mat" },
  s_say_the_sound: { sound: "a" },
};
const PUBLIC = fileURLToPath(new URL("../../public/", import.meta.url));

test("the registry: the inventory's top 12 rows and Jonas's two examples, each passing the grammar", () => {
  assert.equal(TEMPLATE_LIST.length, 16);
  const rows = new Set(TEMPLATE_LIST.flatMap((t) => t.inventory));
  for (let r = 1; r <= 12; r++) assert.ok(rows.has(r), `inventory row ${r} has a template`);
  for (const id of ["w_say_slowly", "s_say_the_sound"]) assert.ok(id in T, `Jonas's example ${id}`);
  assert.deepEqual(TEMPLATE_LIST.flatMap((t) => check(t).errors), []);
  assert.deepEqual(TEMPLATE_LIST.flatMap((t) => check(t).warnings), []);
  for (const t of TEMPLATE_LIST) assert.equal(t.id, TEMPLATE_IDS.find((id) => id === t.id));
});

test("the shapes Jonas and the experiments ruled out are errors", () => {
  const bad: [string, TemplateDef["slots"], RegExp][] = [
    ["Say this sound: {sound}", { sound: "sound" }, /colon/], // Jonas: "say this sound: a"
    ["Say this word slowly... {word~bare}", { word: "word" }, /the word|R5/], // Jonas: "say this word slowly: mat"
    ["Change the sound {a} to {b}.", { a: "sound", b: "sound" }, /R3/], // "Change /s/ to /m/." won 4% of votes
    ["{t} stays the same.", { t: "sound" }, /R4/],
    ["Is it {sound}?", { sound: "sound" }, /R7/],
    ["Your word is {word~bare}.", { word: "word" }, /R5/],
    ["Say {sound}.", { sound: "sound" }, /under 2 words/],
    ["This is the way we spell {g}.", { g: "spelling" }, /key slot/],
    ["This is {word~a}.", { word: "word" }, /R9/],
  ];
  for (const [text, slots, why] of bad) assert.match(check(fake(text, slots)).errors.join(" | "), why, text);
  for (const [text, slots] of [
    ["Say {word} slowly.", { word: "word" }],
    ["Say the sound {sound}.", { sound: "sound" }],
    ["Change the sound {a}, to the sound {b}.", { a: "sound", b: "sound" }], // two lead-ins: 96% of votes
    ["Does this word have the sound {a}, or the sound {b}?", { a: "sound", b: "sound" }], // an alternative question
  ] as [string, TemplateDef["slots"]][]) assert.deepEqual(check(fake(text, slots)).errors, [], text);
  assert.match(check({ id: "x", text: "Hi.", slots: {} }).errors.join(), /prefix/);
});

test("parse: pieces, joins and clip positions", () => {
  assert.deepEqual(parse(T.w_say_slowly), [{ kind: "speech", n: 0, text: "Say {word} slowly.", slots: ["word"], lead: false, cont: false }]);
  assert.deepEqual(parse(T.s_say_the_sound), [
    { kind: "speech", n: 0, text: "Say the sound", slots: [], lead: true, cont: false },
    { kind: "join", join: "breath" },
    { kind: "clip", slot: "sound", clip: "sound", at: "end", after: "." },
  ]);
  const way = parse(T.ws_way_we_spell);
  assert.deepEqual(way.map((p) => p.kind), ["speech", "join", "clip", "join", "speech"]);
  assert.deepEqual(speechPieces(T.ws_way_we_spell).map((p) => [p.n, p.lead, p.cont]), [[0, true, false], [1, false, true]]);
  assert.deepEqual(parse(T.s_say_read).filter((p) => p.kind !== "speech").map((p) => (p.kind === "join" ? p.join : `${p.clip}@${p.at}`)), ["sentence", "sounds@alone", "sentence", "bare@alone"]);
  assert.deepEqual(TEMPLATE_LIST.map((t) => `${t.id}:${tierOf(t)}`).filter((s) => !s.endsWith(":whole")).sort(), [
    "s_here_sound:sound", "s_how_write:sound", "s_say_read:sequence", "s_say_the_sound:sound", "s_which_starts:sound", "s_which_write:sound", "ws_starts_with:sound", "ws_way_we_spell:sound",
  ]);
});

test("slot positions: 'Say {word} slowly.' talks about its word in the middle; a sound after a lead-in ends its sentence", () => {
  assert.deepEqual(positions(T.w_say_slowly), { word: "M" });
  assert.deepEqual(positions(T.w_your_word), { word: "F" });
  assert.deepEqual(positions(T.ws_starts_with), { picture: "I", sound: "end" });
  assert.deepEqual(positions(T.ws_way_we_spell), { sound: "phrase", word: "F" });
  assert.deepEqual(positions(T.w_listen_again), { word: "M", "word~slow": "alone" });
  assert.deepEqual(positions(T.ww_change), { word: "I", word2: "F" });
});

test("Jonas's examples: 'Say mat slowly.' is one take; 'Say the sound…' is a lead-in, a breath, and the pure sound", () => {
  assert.deepEqual(templateParts(T.w_say_slowly, { word: "mat" }), [{ tpl: "w_say_slowly", piece: 0, key: "mat", text: "Say mat slowly.", hide: ["mat"] }]);
  assert.deepEqual(templateParts(T.w_say_slowly, { word: "mat" }, { reveal: true }), [{ tpl: "w_say_slowly", piece: 0, key: "mat", text: "Say mat slowly." }]);
  assert.deepEqual(templateParts(T.s_say_the_sound, { sound: "a" }), [
    { tpl: "s_say_the_sound", piece: 0, key: "_", text: "Say the sound..." },
    { join: "breath" },
    { sound: "a", show: "petal" },
  ]);
  assert.equal(textOf(T.s_say_the_sound, { sound: "a" }), "Say the sound /a/.");
  assert.equal(textOf(T.w_say_slowly, { word: "mat" }), "Say mat slowly.");
});

test("the official formula keeps the sound where Sounds~Write puts it, and the word inside the continuation", () => {
  const v = SAMPLE.ws_way_we_spell;
  assert.deepEqual(templateParts(T.ws_way_we_spell, v), [
    { tpl: "ws_way_we_spell", piece: 0, key: "_", text: "This is the way we spell..." },
    { join: "breath" },
    { sound: "ae", show: "petal" },
    { join: "breath" },
    { tpl: "ws_way_we_spell", piece: 1, key: "rain", text: "...in rain." },
  ]);
  assert.equal(textOf(T.ws_way_we_spell, v), "This is the way we spell /ae/ in rain.");
});

test("R10: a function word or homograph is quoted, so TTS says its strong form", () => {
  assert.equal(renderJobs(T.w_say_slowly, { word: "at" })[0].text, "Say 'at' slowly.");
  assert.deepEqual(renderJobs(T.w_say_slowly, { word: "at" })[0].quoted, ["at"]);
  assert.equal(renderJobs(T.ww_change, { word: "at", word2: "it" })[0].text, "'At' to 'it'. What do we need to change?");
  assert.equal(renderJobs(T.w_say_slowly, { word: "mat" })[0].quoted.length, 0);
});

test("R9: a picture's noun phrase comes from its recorded 'This is …' sentence, and a picture without one is never said as a noun", () => {
  assert.equal(nounPhrase("sun"), "the sun");
  assert.equal(nounPhrase("jam"), "some jam");
  assert.equal(nounPhrase("snow"), "snow");
  assert.equal(nounPhrase("sock"), "a sock");
  assert.equal(renderJobs(T.w_name_pic, { picture: "jam" })[0].text, "This is some jam.");
  assert.equal(renderJobs(T.w_name_pic, { picture: "moon" })[0].text, "This is the moon.");
  const c = content();
  const pics = members(T.w_name_pic, c).map((m) => m.values.picture);
  assert.ok(pics.includes("sock") && !pics.includes("swim"), "swim has no noun phrase: never 'This is a swim.'");
  assert.deepEqual(picturesWithoutNoun(c), ["swim"]);
});

test("a dictation word is hidden in the caption until revealed; sounds show as petals only when revealed", () => {
  assert.equal(textOf(T.w_your_word, { word: "sat" }, "caption"), "Your word is 🔊.");
  assert.equal(textOf(T.w_your_word, { word: "sat" }, "caption", { reveal: true }), "Your word is sat.");
  assert.equal(textOf(T.w_listen_again, { word: "mat" }), 'Let\'s listen to mat again. "mat" (slowly)');
  assert.equal(textOf(T.w_listen_again, { word: "mat" }, "transcript", { slow: false }), 'Let\'s listen to mat again. "mat"');
});

test("FS1: `slow: false` plays the plain word where the template has the slow way", () => {
  assert.deepEqual(templateParts(T.w_listen_again, { word: "mat" }, { slow: false }).slice(1), [{ join: "sentence" }, { word: "mat" }]);
  assert.deepEqual(templateParts(T.w_listen_again, { word: "mat" }).slice(1), [{ join: "sentence" }, { stretch: "mat" }]);
});

test("every recorded piece's text is recoverable from its clip id and URL", () => {
  for (const t of TEMPLATE_LIST) {
    const v = SAMPLE[t.id as keyof typeof SAMPLE];
    for (const j of renderJobs(t, v)) {
      assert.equal(j.url, `/a/t/${t.id}/${j.piece}-${j.key}.mp3`);
      assert.equal(j.clip, `t:${t.id}/${j.piece}-${j.key}`);
      assert.ok(isTemplateClip(j.url) && isTemplateClip(j.clip));
      const d = decodeTemplateClip(j.clip);
      assert.equal(d?.text, j.text, j.clip);
      assert.equal(decodeTemplateClip(j.url)?.text, j.text);
      assert.deepEqual(decodeForTranscript(j.url), { kind: "say", who: "sensei", text: j.text, tpl: t.id });
    }
  }
  assert.equal(decodeTemplateClip("/a/l/tv_here_sound.mp3"), null);
  assert.equal(decodeForTranscript("/a/w/mat.mp3"), null);
  assert.equal(describeTemplateClip("t:w_gone/0-mat"), "[t:w_gone/0-mat]");
  assert.equal(decodeTemplateClip("t:w_say_slowly/3-mat"), null, "no such piece");
  assert.equal(decodeTemplateClip("/a/t/ws_way_we_spell/1-rain.mp3")?.text, "...in rain.");
});

test("members: words by unit, the item's first ask, swap steps, pictures with their first sound, canonical spellings", () => {
  const c = content();
  assert.deepEqual(members(T.w_say_slowly, c, 0).map((m) => m.values.word), ["mat", "sat"]);
  assert.equal(members(T.w_say_slowly, c).length, 4);
  assert.deepEqual(members(T.w_position_q, c, 0).map((m) => m.values), [{ pos: "first", word: "mat" }, { pos: "first", word: "sat" }]);
  assert.deepEqual(members(T.w_next_q, c).map((m) => m.values.pos), ["first", "next", "last"]);
  assert.deepEqual(members(T.ww_change, c).map((m) => `${m.values.word}>${m.values.word2}`), ["mat>sat", "sat>sit", "sit>sat"]);
  assert.deepEqual(members(T.ws_starts_with, c).map((m) => m.values), [{ picture: "sock", sound: "s" }, { picture: "sun", sound: "s" }, { picture: "swim", sound: "s" }]);
  assert.deepEqual(members(T.ws_way_we_spell, c, 11).map((m) => m.values), [{ spelling: "m>m", sound: "m", word: "mat" }]);
  assert.deepEqual(members(T.s_say_the_sound, c).map((m) => m.values), [{}], "a fixed lead-in: one recording for every sound");
  // one member per set of recordings: "What's the first sound in mat?" isn't listed twice
  assert.equal(members(T.w_position_q, { ...c, words: [...c.words, { text: "mat", unit: 5 }] }).length, 4);
});

test("every template has a fallback made only of recorded lines and library clips, never a template piece", () => {
  for (const t of TEMPLATE_LIST) {
    for (const slow of [true, false]) {
      const fb = t.fallback(SAMPLE[t.id as keyof typeof SAMPLE], ctx({ slow }));
      assert.ok(fb.length, t.id);
      for (const p of fb) {
        assert.ok(!("tpl" in p), t.id);
        if ("lines" in p) {
          const id = p.lines.find(lineRecorded);
          assert.ok(id, `${t.id}: one of ${p.lines.join(", ")} is recorded`);
          assert.ok(existsSync(`${PUBLIC}a/l/${id}.mp3`), `${t.id}: /a/l/${id}.mp3 exists`);
        }
        if (!slow) assert.ok(!("stretch" in p) || t.id === "w_say_slowly", `${t.id}: FS1, no slow word`);
      }
    }
  }
});

test("pieceText capitalises a value that starts a sentence", () => {
  const p = speechPieces(T.ws_starts_with)[0];
  assert.equal(pieceText(T.ws_starts_with, p, { picture: "mop" }), "Mop starts with...");
});

/** A small content set: IC1 (unit 0) and IC2 (unit 1), a chain, three pictures, one spelling. */
function content(): TemplateContent {
  const w = (text: string, unit: number, segs?: string) => ({ text, unit, ...(segs ? { segs: segs.split(".").map((p) => ({ g: p, p })) } : {}) });
  return {
    words: [w("mat", 0), w("sat", 0), w("sit", 1), w("pin", 1)],
    pictures: [w("sock", 3, "s.o.k"), w("sun", 5, "s.u.n"), w("swim", 9, "s.w.i.m")],
    chains: [{ unit: 0, words: ["mat", "sat", "sat", "sit", "sat"] }],
    spellings: [{ unit: 0, key: "m>m", p: "m", example: "mat" }, { unit: 12, key: "ai>ae", p: "ae", example: "rain" }],
  };
}
