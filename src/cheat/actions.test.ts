/// <reference types="node" />
// The cheat menu's save edits (src/cheat/actions.ts, docs/CHEATS.md): the presets give the save they promise (petals,
// gems, words, stickers, trips, the ledger), and each control's edit reads back through the game's own rules.
// Run: bun test src/cheat/actions.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Save } from "../engine/store";

// store.ts expects a browser: a minimal one
const mem = new Map<string, string>();
const g = globalThis as Record<string, unknown>;
g.localStorage ??= { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
g.document ??= { addEventListener() {}, visibilityState: "visible" };
g.window ??= globalThis;
g.addEventListener ??= () => {};

const A = await import("./actions");
const { store, profilesApi, ENERGY_FULL } = await import("../engine/store");
const { LEVELS, MILESTONES } = await import("../content/worlds");
const { PETALS, gemByKey } = await import("../content/flower");
const { WORDS } = await import("../content/phonics");
const { frontier, gemState, knownNow, flowerComplete, readyGems } = await import("../engine/gems");
const { recapHold, dueInSessions, SESSIONS, frameForm } = await import("../content/narrative");
const { GAME_IDS, gameKey } = await import("../content/games");

const NOW = Date.UTC(2026, 8, 27, 9);
const petal = (p: string) => PETALS.find((x) => x.p === p)!;
const gem = (k: string) => gemByKey(k)!;
const played = (s: { stars: Record<string, number> }) => LEVELS.filter((l) => (s.stars[l.id] ?? 0) > 0).map((l) => l.id);

test("blankSave has every field of the store's own fresh save", () => {
  store.reset();
  const fresh = store.get();
  const blank = A.blankSave();
  for (const k of Object.keys(fresh)) assert.ok(k in blank, `blankSave lacks ${k}`);
  assert.deepEqual(blank.settings, fresh.settings);
});

test("presets: the school ones take their labels from MILESTONES, and each leaves the child where it says", () => {
  for (const m of MILESTONES) assert.equal(A.presetById(m.id as never).label, m.label, m.id);
  const at = (id: Parameters<typeof A.presetSave>[0]) => frontier(A.presetSave(id, A.blankSave(), NOW)).id;
  assert.equal(at("warmups"), "w1-2");
  assert.equal(at("mid-reception"), "w4-1"); // startLevelAfter(7): the first level past unit 7
  assert.equal(at("end-reception"), "w6-1"); // startLevelAfter(11)
  assert.equal(at("mid-year-1"), "w6-5");
  assert.equal(at("end-year-1"), LEVELS[LEVELS.length - 1].id);
  const all = A.presetSave("end-year-2", A.blankSave(), NOW);
  assert.equal(played(all).length, LEVELS.length, "every level finished");
});

test("preset: a new child is a blank save (keeping the device's settings)", () => {
  const base = { ...A.blankSave(), hero: "suki" as const, settings: { relaxed: true, music: 0, captions: true, unlockAll: true }, stars: { "w1-2": 3 } };
  const s = A.presetSave("new", base, NOW);
  assert.equal(s.hero, null);
  assert.deepEqual(s.stars, {});
  assert.deepEqual(s.settings, base.settings);
  assert.equal(s.seenIntro, false);
});

test("preset: warm-ups done: six stones, their picture stickers and the shiny fish-dog, no letters", () => {
  const s = A.presetSave("warmups", A.blankSave(), NOW);
  assert.deepEqual(played(s), ["w1-wu1", "w1-wu2", "w1-wu3", "w1-wu4", "w1-wu5", "w1-wu6"]);
  assert.deepEqual(s.petals, []);
  assert.deepEqual(s.gems, []);
  assert.ok(s.stickers.includes("sun") && s.stickers.includes("fishdog") === false && s.stickers.includes("starfish"));
  assert.deepEqual(s.shiny, ["fishdog"]);
  assert.equal(s.schoolYear, "none");
  assert.equal(s.seenFlower, false, "no spelling taught yet: the World Flower's first visit is still to come");
});

test("preset: middle of Reception: petals, gems, words, stickers, trips and the ledger", () => {
  const s = A.presetSave("mid-reception", { ...A.blankSave(), hero: "suki" }, NOW);
  assert.equal(s.hero, "suki", "keeps the hero");
  assert.equal(s.schoolYear, "R");
  assert.equal(s.firstSession, null);
  // petals: every spelling of units 1-7, nothing from unit 8 on
  for (const g of ["m", "s", "a", "t", "i", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "j", "w", "z", "x", "y", "ff", "ll", "ss", "zz"]) assert.ok(s.petals.includes(g), g);
  assert.ok(!s.petals.includes("sh"));
  // gems: units 1-6 won, unit 7's charging, with one glowing (its Gem Trial waiting)
  assert.ok(s.gems.includes("m>m") && s.gems.includes("j>j"));
  assert.ok(!s.gems.includes("ff>f") && !s.gems.includes("zz>z"));
  assert.equal(gemState(gem("ff>f"), s) === "charging" || gemState(gem("ff>f"), s) === "ready", true);
  assert.equal(gemState(gem("sh>sh"), s), "hidden");
  assert.ok(readyGems(s).length >= 1, "a gem is glowing");
  assert.equal(A.soundState(petal("m"), s), "secure");
  assert.equal(A.soundState(petal("sh"), s), "none");
  // words: every word of units 1-7 read twice (gold stickers), none later
  const expect = WORDS.filter((w) => w.unit <= 7 && w.segs.every((sg) => s.petals.includes(sg.g))).map((w) => w.text);
  assert.deepEqual(Object.keys(s.words).sort(), expect.sort());
  assert.ok(expect.length > 50);
  assert.ok(!Object.values(s.words).some((w) => w.ok < 2));
  for (const w of expect) assert.ok(s.stickers.includes(w), `sticker ${w}`);
  assert.ok(s.stickers.indexOf("sun") < s.stickers.indexOf(expect[0]), "the warm-ups' stickers come first");
  // World Flower trips: each taught spelling's, and lands 2-4 entered
  for (const k of ["spelling:m>m", "spelling:zz>z", "world:2", "world:3", "world:4"]) assert.ok(s.flowerSeen?.includes(k), k);
  assert.ok(!s.flowerSeen?.includes("world:5"));
  assert.equal(s.seenFlower, true);
  // the ledger: games played are on their short form; games not met yet (sorting) on their full form
  assert.equal(A.formNow(s, "battle", NOW), "short");
  assert.equal(A.formNow(s, "learn", NOW), "short");
  assert.equal(A.formNow(s, "tap", NOW), "short", "the warm-ups' games too");
  assert.equal(A.formNow(s, "sort", NOW), "full");
  assert.equal(A.formNow(s, "trial", NOW), "full");
  // the explanations heard: the two-letter reminders are retired, the gem energy explained
  assert.equal(dueInSessions(s.narr?.["letters:ff"], s.sessions, SESSIONS.reminder), false);
  assert.equal((s.narr?.["gem-energy"]?.n ?? 0) > 0, true);
  assert.equal(s.narr?.["letters:sh"], undefined);
});

test("preset, placed: as the opt-in's placement leaves a child (no stars, petals half-charged)", () => {
  const s = A.presetSave("mid-reception", A.blankSave(), NOW, { placed: true });
  assert.deepEqual(played(s), []);
  assert.equal(s.placedAt, "w4-1");
  assert.equal(frontier(s).id, "w4-1");
  assert.deepEqual(s.gems, []);
  assert.equal(s.energy["m>m"], ENERGY_FULL / 2);
  assert.equal(s.energy["sh>sh"], undefined);
  assert.equal(A.formNow(s, "battle", NOW), "full", "no game told yet");
  assert.deepEqual(s.words, {});
});

test("preset: end of Year 2 is the whole game, the World Flower complete", () => {
  const s = A.presetSave("end-year-2", A.blankSave(), NOW);
  assert.equal(flowerComplete(s), true);
  assert.ok(A.IN_PLAY.every((g) => s.gems.includes(g.key)));
  assert.equal(A.soundState(petal("ae"), s), "secure");
  assert.equal(A.soundState(petal("air"), s), "n/a", "a sound the game can't teach yet");
  assert.equal(A.formNow(s, "sort", NOW), "short");
  assert.equal(s.schoolYear, "Y2");
});

test("a sound cycles none → met → secure → none on a fresh save", () => {
  let s: Save = A.blankSave();
  const ae = petal("ae");
  assert.equal(A.soundState(ae, s), "none");
  s = A.withSound(s, "ae", "met", NOW);
  assert.equal(A.soundState(ae, s), "met");
  assert.ok(s.petals.includes("ai") && s.petals.includes("ay"));
  s = A.withSound(s, "ae", "secure", NOW);
  assert.equal(A.soundState(ae, s), "secure");
  assert.ok(s.gems.includes("ai>ae"));
  s = A.withSound(s, "ae", "none", NOW);
  assert.equal(A.soundState(ae, s), "none");
  assert.equal(s.read["ai>ae"], undefined);
});

test("a sound the frontier has taught stays met when set to none (the game derives it from the levels)", () => {
  const s = A.withSound(A.presetSave("mid-reception", A.blankSave(), NOW), "m", "none", NOW);
  assert.ok(!s.gems.includes("m>m") && !s.petals.includes("m"));
  assert.equal(A.soundState(petal("m"), s), "met");
});

test("a gem cycles not found → charging → glowing → won", () => {
  let s: Save = A.presetSave("end-reception", A.blankSave(), NOW);
  const k = "oa>oe"; // (the frontier, w6-1, already shows its own ai and ay)
  assert.equal(gemState(gem(k), s), "hidden");
  for (const want of ["charging", "ready", "won", "hidden"] as const) {
    const next = A.nextGemTarget(gemState(gem(k), s))!;
    s = A.withGem(s, k, next, NOW);
    assert.equal(gemState(gem(k), s), want);
  }
  // <qu>'s /w/ is met with < q >
  s = A.withGem(A.blankSave(), "u>w", "charging", NOW);
  assert.ok(s.petals.includes("q"));
  assert.equal(gemState(gem("u>w"), s, knownNow(s)), "charging");
});

test("all mastered, and reset", () => {
  const s = A.allMastered(A.blankSave(), NOW);
  assert.equal(flowerComplete(s), true);
  const r = A.resetMastery(s);
  assert.deepEqual([r.petals, r.gems, r.energy, r.read, r.spell], [[], [], {}, {}, {}]);
});

test("words and stickers", () => {
  const unit1 = A.wordsOfUnit(1).map((w) => w.text);
  let s = A.withWords(A.blankSave(), unit1, true, NOW);
  assert.ok(unit1.every((w) => s.words[w].ok >= 2 && s.stickers.includes(w)));
  s = A.withWords(s, ["mat"], false, NOW);
  assert.ok(!("mat" in s.words) && !s.stickers.includes("mat"));
  s = A.withShiny(s, "fishdog", true);
  assert.ok(s.shiny.includes("fishdog") && s.stickers.includes("fishdog"));
  s = A.withStickers(s, null);
  assert.deepEqual(s.stickers, []);
  s = A.withStickers(s, A.WARMUP_STICKERS);
  assert.ok(s.stickers.includes("sun") && s.stickers.includes("bus"));
});

test("each teacher-voice form reads back as that form (and the recaps' holds)", () => {
  const base = { ...A.presetSave("mid-reception", A.blankSave(), NOW), sessions: 12 };
  for (const form of A.GAME_FORMS) {
    const s = A.withGameForm(base, form, ["battle"], NOW);
    const want = form.startsWith("recap") ? "recap" : form;
    assert.equal(A.formNow(s, "battle", NOW), want, form);
    assert.equal(recapHold(s.narr?.[gameKey("battle")], NOW), form === "recap-21" || form === "recap-struggled", `${form} hold`);
  }
  // every game at once, on an old save with stars and no migration marker: the marker stops the fold to "short"
  const old = { ...A.blankSave(), stars: { "w1-6": 3, "w2-1": 3 }, sessions: 5 };
  assert.equal(A.formNow(old, "battle", NOW), "short", "an old save's games fold to short");
  const fresh = A.withGameForm(old, "full", undefined, NOW);
  for (const id of GAME_IDS) assert.equal(A.formNow(fresh, id, NOW), "full", id);
  const s = A.withStruggled(A.withGameForm(old, "short", undefined, NOW), "swap", true);
  assert.equal(A.formNow(s, "swap", NOW), "recap");
});

test("the dosage ledger resets", () => {
  const s = A.presetSave("end-reception", A.blankSave(), NOW) as ReturnType<typeof A.blankSave>;
  s.narr!["jump-offer"] = { n: 1, at: [3], s: [9] };
  const keys = (x: typeof s) => Object.keys(x.narr ?? {});
  const letters = A.withLedgerReset(s, "letters");
  assert.ok(!keys(letters).some((k) => k.startsWith("letters:") || k.startsWith("two-sounds:")));
  assert.ok(keys(letters).includes("game:battle") && keys(letters).includes("jump-offer") && keys(letters).includes("gem-energy"));
  assert.ok(!keys(A.withLedgerReset(s, "jump-offer")).includes("jump-offer"));
  const once = A.withLedgerReset(s, "once");
  assert.ok(!keys(once).includes("gem-energy") && keys(once).includes("letters:sh") && keys(once).includes("game:battle"));
  const games = A.withLedgerReset(s, "games");
  assert.equal(A.formNow(games, "battle", NOW), "full");
  const all = A.withLedgerReset(s, "all");
  assert.deepEqual(keys(all), ["games:v1"]);
  assert.equal(A.formNow(all, "battle", NOW), "full");
  assert.ok(!keys(A.withoutLedgerKey(s, "gem-energy")).includes("gem-energy"));
});

test("time: sessions, and days since the last play (22 days brings back the recaps with their hold)", () => {
  const s = A.presetSave("mid-reception", A.blankSave(), NOW);
  assert.ok(Math.abs(A.daysSinceLastPlay(s, NOW)! - 1) < 1e-9);
  const away = A.withDaysAway(s, 22, NOW);
  assert.ok(Math.abs(A.daysSinceLastPlay(away, NOW)! - 22) < 1e-9);
  assert.equal(A.formNow(away, "battle", NOW), "recap");
  assert.equal(recapHold(away.narr?.[gameKey("battle")], NOW), true);
  assert.equal(frameForm(away.narr?.[gameKey("battle")], away.sessions, NOW), "recap");
  assert.equal(A.withSessions(s, -3).sessions, 0);
  assert.equal(A.daysSinceLastPlay(A.blankSave(), NOW), null);
});

test("import: a whole save, a partial one (bot style), and the errors", () => {
  const whole = A.presetSave("warmups", A.blankSave(), NOW);
  const r1 = A.parseSave(A.exportJson(whole));
  assert.ok(r1.ok && JSON.stringify(r1.save.stars) === JSON.stringify(whole.stars));
  const r2 = A.parseSave(JSON.stringify({ hero: "kai", stars: { "w1-2": 3 }, settings: { music: 0 } }));
  assert.ok(r2.ok && r2.save.settings.captions === false && r2.save.settings.music === 0 && Array.isArray(r2.save.stickers));
  const r3 = A.parseSave(JSON.stringify({ save: { hero: "suki" } }));
  assert.ok(r3.ok && r3.save.hero === "suki");
  assert.equal(A.parseSave("{nope").ok, false);
  assert.equal(A.parseSave("[1,2]").ok, false);
  assert.equal(A.parseSave(JSON.stringify({ v: 2 })).ok, false);
  assert.equal(A.parseSave(JSON.stringify({ petals: "a" })).ok, false);
});

test("commit: writes the whole save to disk at once, over any pending write", () => {
  store.reset();
  store.set((s) => void (s.sessions = 99)); // a pending (debounced) write of the old state
  A.commit(A.presetSave("mid-reception", store.get(), NOW));
  const id = profilesApi.current()!.id;
  const disk = JSON.parse(localStorage.getItem(`superninja.save.${id}`)!); // (another test file may have made the stub)
  assert.equal(disk.sessions, 18);
  assert.equal(disk.stars["w3-12"], 3);
  assert.equal(frontier(store.get()).id, "w4-1");
  A.edit((s) => A.withSessions(s, 7));
  assert.equal(JSON.parse(localStorage.getItem(`superninja.save.${id}`)!).sessions, 7);
});
