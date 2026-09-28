/// <reference types="node" />
// The speech-template resolver (src/engine/speech.ts; docs/SPEECH_TEMPLATES.md §2.5, §5): a template when it is
// recorded and audio.ts can play it, else its fallback, whole.
// Run: bun test ./src/engine/speech.test.ts
import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import type { Say } from "./audio";
import {
  CLIP_EDGE_MS, JOIN_MS, captionFor, clipsFor, fallbackSay, loadManifest, lower, onTemplateMiss, recordedPiece, resolveSpeech, setTemplatePlayback, speak,
  speakParts, transcriptFor, useManifest, type TemplateManifest,
} from "./speech";
import { TEMPLATES, renderJobs, type TemplateId, type Values } from "../content/templates";

const gap = (join: "breath" | "sentence"): Say => ({ gap: Math.max(0, JOIN_MS[join] - CLIP_EDGE_MS) });
/** A manifest listing every piece of these template members. */
function manifestFor(list: [TemplateId, Values][], o: { text?: string } = {}): TemplateManifest {
  const m: TemplateManifest = { v: 1, voice: "Erinome", model: "gemini-3.8-flash-tts", rate: 24000, kbps: 48, updated: "2026-09-27T00:00:00Z", templates: {} };
  for (const [id, v] of list) {
    const t = (m.templates[id] ??= { text: o.text ?? TEMPLATES[id].text, entries: {} });
    for (const j of renderJobs(TEMPLATES[id], v)) t.entries[`${j.piece}-${j.key}`] = { h: "0badf00d", ms: 900, on: 30, off: 820 };
  }
  return m;
}
afterEach(() => {
  useManifest(null);
  setTemplatePlayback(false);
});

test("today (audio.ts can't play templates yet): the fallback, today's composition, with joins as gaps", () => {
  useManifest(manifestFor([["w_say_slowly", { word: "mat" }]]));
  assert.deepEqual(speak("w_say_slowly", { word: "mat" }), [{ line: "tv_fs_say_slow" }, gap("breath"), { stretch: "mat" }]);
  assert.deepEqual(speak("s_say_the_sound", { sound: "a" }), [{ line: "t_say" }, gap("breath"), { sound: "a", show: "petal" }]);
  assert.equal(resolveSpeech("w_say_slowly", { word: "mat" }).via, "fallback");
});

test("recorded and playable: Jonas's two examples as templates", () => {
  setTemplatePlayback(true);
  useManifest(manifestFor([["w_say_slowly", { word: "mat" }], ["s_say_the_sound", { sound: "a" }]]));
  const slow = speak("w_say_slowly", { word: "mat" }) as unknown as Record<string, unknown>[];
  assert.equal(slow.length, 1);
  assert.deepEqual({ ...slow[0], fallback: undefined }, { tpl: "w_say_slowly", piece: 0, key: "mat", text: "Say mat slowly.", url: "/a/t/w_say_slowly/0-mat.mp3", hide: ["mat"], fallback: undefined });
  // the fallback rides along, with native joins, for audio.ts to swap in whole if the clip fails to load
  assert.deepEqual(slow[0].fallback, [{ line: "tv_fs_say_slow" }, { join: "breath" }, { stretch: "mat" }]);
  const sound = speak("s_say_the_sound", { sound: "a" }) as unknown as Record<string, unknown>[];
  assert.deepEqual(sound.slice(1), [{ join: "breath" }, { sound: "a", show: "petal" }]);
  assert.equal(sound[0].text, "Say the sound...");
  assert.equal(resolveSpeech("s_say_the_sound", { sound: "zh" }).via, "template", "one lead-in for every sound");
});

test("a template with any piece missing plays its fallback whole, never half of each", () => {
  setTemplatePlayback(true);
  const m = manifestFor([["ws_way_we_spell", { sound: "ae", word: "rain", spelling: "ai>ae" }]]);
  delete m.templates.ws_way_we_spell.entries["1-rain"];
  useManifest(m);
  const misses: string[][] = [];
  const off = onTemplateMiss((_t, missing) => misses.push(missing));
  const r = resolveSpeech("ws_way_we_spell", { sound: "ae", word: "rain", spelling: "ai>ae" });
  off();
  assert.equal(r.via, "fallback");
  assert.deepEqual(r.missing, ["/a/t/ws_way_we_spell/1-rain.mp3"]);
  assert.deepEqual(misses, [["/a/t/ws_way_we_spell/1-rain.mp3"]]);
  // native joins now: audio.ts plays them
  assert.deepEqual(r.say, [{ line: "tv_here_sound" }, { join: "breath" }, { sound: "ae", show: "petal" }, { join: "sentence" }, { line: "tg_ai_ae_way" }]);
});

test("a template whose words changed since it was rendered is not recorded", () => {
  setTemplatePlayback(true);
  useManifest(manifestFor([["w_your_word", { word: "sat" }]], { text: "Your word is... {word}" }));
  assert.equal(recordedPiece("w_your_word", 0, "sat"), undefined);
  assert.equal(resolveSpeech("w_your_word", { word: "sat" }).via, "fallback");
});

test("fallbacks: the first recorded candidate line; no joins left at either end; FS1's plain word", () => {
  assert.deepEqual(speak("w_your_word", { word: "sat" }), [{ line: "tv_your_word" }, gap("breath"), { word: "sat" }]);
  assert.deepEqual(speak("w_listen_again", { word: "mat" }), [{ line: "tv_slow_again" }, gap("breath"), { stretch: "mat" }]);
  assert.deepEqual(speak("w_listen_again", { word: "mat" }, { slow: false }), [{ line: "tv_listen_here" }, gap("sentence"), { word: "mat" }]);
  assert.deepEqual(speak("w_position_q", { pos: "last", word: "mat" }), [{ line: "last_sound_q" }, gap("sentence"), { word: "mat" }]);
  assert.deepEqual(speak("w_name_pic", { picture: "jam" }), [{ line: "fm_name_jam" }]);
  assert.deepEqual(speak("w_name_pic", { picture: "swim" }), [{ word: "swim" }]);
  assert.deepEqual(speak("ws_starts_with", { picture: "mop", sound: "m" }), [{ line: "fs_mop" }, gap("breath"), { sound: "m", show: "petal" }]);
  const read = speak("s_say_read", { word: "mat" });
  assert.deepEqual(read.map((s) => Object.keys(s)[0]), ["line", "gap", "sounds", "gap", "word"]);
  assert.deepEqual((read[2] as { sounds: { p: string }[] }).sounds.map((s) => s.p), ["m", "a", "t"]);
  // a read-back without its sounds drops them, and the joins round them
  assert.deepEqual(speak("s_say_read", { word: "zzqx" }), [{ line: "tv_lets_say_read" }, gap("sentence"), { word: "zzqx" }]);
  // lowered joins are the join less the silence the clips carry
  assert.deepEqual(lower([{ line: "x" }, { join: "sentence" }, { word: "y" }]), [{ line: "x" }, { gap: JOIN_MS.sentence - CLIP_EDGE_MS }, { word: "y" }]);
});

test("a sound's job and anchor come from the caller", () => {
  const at = () => null;
  assert.deepEqual(speak("s_here_sound", { sound: "m" }, { show: "hidden" }).at(-1), { sound: "m", show: "hidden" });
  assert.deepEqual(speak("s_here_sound", { sound: "m" }, { at }).at(-1), { sound: "m", show: "petal", at });
  setTemplatePlayback(true);
  useManifest(manifestFor([["s_here_sound", {}]]));
  assert.deepEqual(speakParts("s_here_sound", { sound: "m" }, { show: "tile" }).at(-1), { sound: "m", show: "tile" });
});

test("clipsFor lists what speak() will load, for warm() and preload()", () => {
  assert.deepEqual(clipsFor("w_say_slowly", { word: "mat" }), ["/a/l/tv_fs_say_slow.mp3", "/a/x/mat.mp3"]);
  setTemplatePlayback(true);
  useManifest(manifestFor([["w_say_slowly", { word: "mat" }], ["s_say_the_sound", {}]]));
  assert.deepEqual(clipsFor("w_say_slowly", { word: "mat" }), ["/a/t/w_say_slowly/0-mat.mp3"]);
  assert.deepEqual(clipsFor("s_say_the_sound", { sound: "a" }), ["/a/t/s_say_the_sound/0-_.mp3", "/a/p/a.mp3"]);
});

test("captions and transcripts come from the template's text", () => {
  assert.equal(captionFor("w_your_word", { word: "sat" }), "Your word is 🔊.");
  assert.equal(captionFor("w_your_word", { word: "sat" }, { reveal: true }), "Your word is sat.");
  assert.equal(captionFor("s_say_the_sound", { sound: "k" }, { reveal: true }), "Say the sound /c/.");
  assert.equal(transcriptFor("s_say_the_sound", { sound: "k" }), "Say the sound /k/.");
  assert.equal(transcriptFor("ww_change", { word: "mat", word2: "sat" }), "Mat to sat. What do we need to change?");
});

test("loadManifest: JSON only (Cloudflare's single-page fallback is a 200 text/html)", async () => {
  const res = (body: string, type: string, status = 200) => async () => new Response(body, { status, headers: { "content-type": type } });
  assert.equal(await loadManifest("/a/t/manifest.json", res("<!doctype html>", "text/html")), false);
  assert.equal(await loadManifest("/a/t/manifest.json", res("", "application/json", 404)), false);
  assert.equal(await loadManifest("/a/t/manifest.json", async () => Promise.reject(new Error("offline"))), false);
  const m = manifestFor([["w_say_slowly", { word: "mat" }]]);
  assert.equal(await loadManifest("/a/t/manifest.json", res(JSON.stringify(m), "application/json")), true);
  assert.equal(recordedPiece("w_say_slowly", 0, "mat")?.off, 820);
  assert.equal(await loadManifest("/a/t/manifest.json", res(JSON.stringify({ v: 2 }), "application/json")), false);
});

test("the values are typed per template", () => {
  // @ts-expect-error a template's slot is required
  assert.ok(fallbackSay("w_say_slowly", {}).length);
  // @ts-expect-error a sound slot takes a phoneme id
  assert.ok(speak("s_here_sound", { sound: "qq" }).length);
  assert.ok(speak("ws_way_we_spell", { sound: "m", word: "mat", spelling: "m>m" }).length);
});
