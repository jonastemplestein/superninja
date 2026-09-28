/// <reference types="node" />
// Progress on the World Flower (src/content/progress.ts). Run: bun test ./src/content/progress.test.ts
//
// The saves are played, not typed: a small seeded simulator plays the real levels with the real words and records
// answers the way engine/store.ts does (recordRead, recordSpell, recordWordSpelt, gem energy), wins Gem Trials when a gem
// is full, and spreads the sessions over weeks. The snapshots below are what the World Flower would show each child.
// They follow the content: when levels or words change, check the new values make sense and re-record them with
// SNAP_PRINT=1 bun test ./src/content/progress.test.ts (it prints the SNAP entries instead of comparing).
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Save, Skill } from "../engine/store";
import { LEVELS, levelWords, startLevelAfter, type Level } from "./worlds";
import { UNITS, WORD_BY_TEXT, WORDS, teachEntry, type PhonemeId, type Word } from "./phonics";
import { GEMS, PETALS } from "./flower";
import { twoSoundsKey } from "./narrative";
import {
  DAY, ENERGY_FULL, LADDER, flowerOverview, frontierOf, gemProgress, knownOf, multiSoundSpellings, petalProgress, soundsOfSpelling,
  stageAtUnit, stageOf, trialPool, type FlowerOverview, type GemStage,
} from "./progress";

// ------------------------------------------------------------------------------------------------ a child who plays
const NOW = Date.UTC(2026, 8, 27, 16); // Sunday 27 September 2026, 5 pm in London
const HOUR = 3_600_000;
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
/** Fisher–Yates with the seeded generator (a random comparator in sort() depends on the engine's sort). */
const shuffled = <T,>(xs: readonly T[], r: () => number): T[] => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const blank = (): Save => ({
  v: 1, hero: "kai", seenIntro: true, stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [],
  settings: { relaxed: false, music: 0.32, captions: false, unlockAll: false }, minutes: 0, sessions: 0, stickers: [], shiny: [], adjustLog: [],
});
const k = (sg: { g: string; p: string }) => `${sg.g}>${sg.p}`;
// engine/store.ts, with the time passed in
const bump = (m: Record<string, Skill>, key: string, ok: boolean, t: number) => {
  const s = (m[key] ??= { n: 0, ok: 0, last: 0, streak: 0 });
  s.n++;
  if (ok) {
    s.ok++;
    s.streak++;
  } else s.streak = 0;
  s.last = t;
};
const charge = (s: Save, key: string, d: number) => {
  if (!s.gems.includes(key)) s.energy[key] = Math.max(0, Math.min(ENERGY_FULL, (s.energy[key] ?? 0) + d));
};
const wordRec = (s: Save, w: Word, ok: boolean, t: number) => {
  const r = (s.words[w.text] ??= { n: 0, ok: 0, last: 0 });
  r.n++;
  if (ok) r.ok++;
  r.last = t;
};
function readWord(s: Save, w: Word, ok: boolean, t: number) {
  for (const sg of w.segs) {
    bump(s.read, k(sg), ok, t);
    charge(s, k(sg), ok ? 0.5 : -0.25);
  }
  wordRec(s, w, ok, t);
}
/** Battle and Dojo: a wrong tile records a miss; after a miss, the word's right taps are recorded as not right first time. */
function spellWord(s: Save, w: Word, pRight: number, r: () => number, t: number) {
  let misses = 0;
  for (const sg of w.segs) {
    if (r() > pRight) {
      misses++;
      bump(s.spell, k(sg), false, t);
      charge(s, k(sg), -0.5);
    }
    bump(s.spell, k(sg), misses === 0, t);
    charge(s, k(sg), misses === 0 ? 1 : -0.5);
  }
  wordRec(s, w, misses === 0, t);
}

interface Plan {
  /** the level the child is up to: every level before it is played */
  upTo: string;
  /** days from the first session to the last (the last is yesterday) */
  days: number;
  sessions: number;
  seed: number;
  /** chance to read a word right, and to spell a sound right */
  read: number;
  spell: number;
  /** placed by the school-year start at this unit (placeAtUnit): levels before `upTo` are skipped, not played */
  placedAt?: number;
  /** the chance a full gem's Gem Trial is taken (and won) at the end of a session */
  battles?: number;
}
function play(plan: Plan): Save {
  const s = blank();
  const r = rng(plan.seed);
  const end = LEVELS.findIndex((l) => l.id === plan.upTo);
  let first = 0;
  if (plan.placedAt) {
    // engine/gems.ts placeAtUnit
    const start = startLevelAfter(plan.placedAt);
    s.placedAt = start.id;
    for (const u of UNITS.filter((u) => u.id <= plan.placedAt!)) for (const g of u.spellings) if (!s.petals.includes(g)) s.petals.push(g);
    for (const gem of GEMS) if (gem.inPlay && gem.unit <= plan.placedAt) s.energy[gem.key] = Math.max(s.energy[gem.key] ?? 0, ENERGY_FULL / 2);
    first = LEVELS.indexOf(start);
  }
  const levels = LEVELS.slice(first, end);
  const t0 = NOW - DAY - plan.days * DAY;
  const gap = plan.sessions > 1 ? (plan.days * DAY) / (plan.sessions - 1) : 0;
  s.flowerSeen = [];
  let li = 0;
  for (let n = 0; n < plan.sessions; n++) {
    let t = t0 + n * gap;
    s.sessions++;
    s.minutes += 15;
    // this session's levels: the rest spread evenly over the sessions left
    const take = Math.ceil((levels.length - li) / (plan.sessions - n));
    for (const l of levels.slice(li, li + take)) {
      t = playLevel(s, l, plan, r, t);
      s.stars[l.id] = l.warmup ? 1 : r() < 0.7 ? 3 : 2;
      // the new-spellings trip after the lesson (engine/gems.ts flowerVisitAfter, gemKeyOfTeach)
      for (const te of l.teach ?? []) {
        const sg = teachEntry(te);
        const key = sg.g === "x" ? "x>ks" : `${sg.g}>${sg.p}`;
        if (!s.flowerSeen.includes(`spelling:${key}`)) s.flowerSeen.push(`spelling:${key}`);
      }
    }
    li += take;
    // review, most sessions: Sensei's Challenge, earlier words with the weakest gems first (worlds.ts makeReview)
    if (li > 0 && r() < 0.7) {
      const known = knownOf(s);
      const weak = (w: Word) => Math.min(...w.segs.map((sg) => (s.gems.includes(k(sg)) ? ENERGY_FULL + 1 : s.energy[k(sg)] ?? 0)));
      const top = Math.max(...levels.slice(0, li).map((l) => Math.max(...l.units)));
      const pool = WORDS.filter((w) => w.unit <= top && w.segs.every((sg) => known.has(sg.g))).sort((a, b) => weak(a) - weak(b) || a.text.localeCompare(b.text)).slice(0, 12);
      for (let i = 0; i < 4 && pool.length; i++) spellWord(s, pool[Math.floor(r() * pool.length)], plan.spell + 0.03, r, (t += 40_000));
    }
    // Gem Trials: a full gem's battle, usually taken and won
    const known = knownOf(s);
    for (const gem of GEMS) {
      if (!gem.inPlay || s.gems.includes(gem.key) || (s.energy[gem.key] ?? 0) < ENERGY_FULL || trialPool(gem.key, known).length < 3) continue;
      if (r() < (plan.battles ?? 0.8)) {
        for (const w of trialPool(gem.key, known).slice(0, 5)) spellWord(s, w, plan.spell + 0.05, r, (t += 30_000));
        if (!s.gems.includes(gem.key)) s.gems.push(gem.key);
      }
    }
  }
  return s;
}
function playLevel(s: Save, l: Level, plan: Plan, r: () => number, t: number): number {
  if (l.warmup) return t + 90_000;
  const fixed = (l.words ?? []).map((w) => WORD_BY_TEXT[w]).filter(Boolean);
  const pool = shuffled(fixed.length ? fixed : levelWords(l), r);
  // a lesson that teaches spellings builds words with them first (engine/learner.ts chooseWords weights the new ones)
  const teach = new Set((l.teach ?? []).map((x) => teachEntry(x)).map((sg) => (sg.g === "x" ? "x>ks" : `${sg.g}>${sg.p}`)));
  const first = [...teach].flatMap((key) => pool.filter((w) => w.segs.some((sg) => k(sg) === key || (key === "x>ks" && sg.g === "x"))).slice(0, 2));
  const words = [...new Set([...first, ...pool])].slice(0, 8);
  for (const w of words) {
    const fresh = w.segs.some((sg) => teach.has(k(sg)));
    readWord(s, w, r() < plan.read - (fresh ? 0.08 : 0), (t += 25_000));
    if (l.kind !== "run" && l.kind !== "story" && l.kind !== "sort") spellWord(s, w, fresh ? plan.spell - 0.08 : plan.spell, r, (t += 35_000));
  }
  return t + 60_000;
}

// the children
const NEW = blank();
/** Reception, half-way through the autumn term's code: units 1–7 played (Bamboo Village to the Misty Mountains). */
const MID_RECEPTION = play({ upTo: startLevelAfter(7).id, days: 63, sessions: 18, seed: 1, read: 0.9, spell: 0.85 });
/** The end of Reception: Initial Code units 1–11 and the Bridging Unit's sorts, over the school year. */
const END_RECEPTION = play({ upTo: startLevelAfter(11).id, days: 240, sessions: 44, seed: 2, read: 0.9, spell: 0.83, battles: 0.4 });
/** Year 1, into the Sky Temple: /ae/ and /ee/ taught (ai ay ee ea), /oe/ and /ie/ still to come. */
const MID_YEAR_1 = play({ upTo: "w6-5", days: 330, sessions: 70, seed: 3, read: 0.92, spell: 0.86, battles: 0.6 });
/** A Year 1 child the school-year question placed at the Sky Temple (Initial Code assumed, half-charged), two weeks in. */
const PLACED_YEAR_1 = play({ upTo: "w6-5", days: 14, sessions: 5, seed: 4, read: 0.9, spell: 0.85, placedAt: 11 });
/** Everything the game has, played to the end. */
const EVERYTHING = play({ upTo: LEVELS[LEVELS.length - 1].id, days: 420, sessions: 110, seed: 5, read: 0.94, spell: 0.9 });
const AWAY = NOW + 30 * DAY;

// ------------------------------------------------------------------------------------------------ snapshots
/** Compare with the recorded snapshot (SNAP, at the end of this file); SNAP_PRINT=1 prints what to record instead. */
const snap = (name: keyof typeof SNAP, actual: unknown) => {
  if (process.env.SNAP_PRINT) console.log(`  ${name}: ${JSON.stringify(actual)},`);
  else assert.deepEqual(actual, SNAP[name], name);
};
/** The flower in one line per state: petals by state (with their fill), for a readable snapshot. */
const brief = (o: FlowerOverview) => {
  const by = (st: string) => o.petals.filter((x) => x.state === st);
  const f = (x: { fill: number }) => Math.round(x.fill * 100) / 100;
  return {
    missing: by("missing").length,
    soon: o.petals.filter((x) => x.soon).map((x) => x.p).join(" "),
    outline: by("outline").map((x) => x.p).join(" "),
    filling: by("filling").map((x) => `${x.p} ${f(x)}`).join(", "),
    complete: by("complete").map((x) => x.p).join(" "),
    full: o.petals.filter((x) => x.complete.full).map((x) => x.p).join(" "),
    fading: o.petals.filter((x) => x.fading).map((x) => x.p).join(" "),
    fill: o.fill,
    whole: o.whole,
  };
};
const gemLine = (s: Save, keys: string[], now = NOW) =>
  keys.map((key) => {
    const g = gemProgress(s, key, { now });
    return `${key} ${g.stage} ${g.value.toFixed(2)}${g.fading ? " fading" : ""}`;
  });

test("a new child: every petal missing, nothing to fill", () => {
  const o = flowerOverview(NEW, { now: NOW });
  assert.deepEqual(brief(o), { missing: 44, soon: "s o i n m t a p", outline: "", filling: "", complete: "", full: "", fading: "", fill: 0, whole: 0 });
  assert.equal(o.stage.taught.size, 0);
  assert.equal(o.stage.unit, null);
  assert.ok(o.petals.every((x) => x.fill === 0 && x.fresh === 0));
  assert.deepEqual(gemProgress(NEW, "m>m", { now: NOW }).stage, "unseen");
});

test("snapshot: mid-Reception (units 1–7)", () => {
  const o = flowerOverview(MID_RECEPTION, { now: NOW });
  snap("midReception", brief(o));
  snap("midReceptionGems", gemLine(MID_RECEPTION, ["m>m", "x>ks", "zz>z", "sh>sh"]));
});

test("snapshot: the end of Reception (Initial Code and the Bridging sorts)", () => {
  const o = flowerOverview(END_RECEPTION, { now: NOW });
  snap("endReception", brief(o));
  snap("endReceptionGems", gemLine(END_RECEPTION, ["m>m", "ck>k", "th>dh", "u>w", "ai>ae"]));
});

test("snapshot: mid-Year 1 (the Sky Temple: ai ay ee ea)", () => {
  const o = flowerOverview(MID_YEAR_1, { now: NOW });
  snap("midYear1", brief(o));
  snap("midYear1Gems", gemLine(MID_YEAR_1, ["m>m", "th>th", "ai>ae", "ea>ee", "oa>oe"]));
  assert.equal(o.stage.unit, "EC2");
});

test("snapshot: the same Year 1 child after 30 days away: nothing taken away, but dusty", () => {
  const before = flowerOverview(MID_YEAR_1, { now: NOW });
  const after = flowerOverview(MID_YEAR_1, { now: AWAY });
  snap("away", brief(after));
  snap("awayGems", gemLine(MID_YEAR_1, ["m>m", "th>th", "ai>ae", "ea>ee", "oa>oe"], AWAY));
  // time never changes a petal's state or fill, or a gem's stage; it only lowers `fresh` and `value`
  for (const [i, a] of after.petals.entries()) {
    const b = before.petals[i];
    assert.equal(a.state, b.state, a.p);
    assert.equal(a.fill, b.fill, a.p);
    assert.ok(a.fresh <= b.fresh + 1e-9 && a.fresh <= a.fill + 1e-9, a.p);
  }
  for (const gem of GEMS) {
    const [a, b] = [gemProgress(MID_YEAR_1, gem.key, { now: AWAY }), gemProgress(MID_YEAR_1, gem.key, { now: NOW })];
    assert.equal(a.stage, b.stage, gem.key);
    assert.ok(a.value <= b.value + 1e-9 && a.value >= b.parts.achieved * 0.5 - 1e-9, gem.key);
  }
  assert.ok(after.counts.fading > before.counts.fading, "more petals dusty after a month away");
});

test("snapshot: a placed Year 1 child (the Initial Code assumed)", () => {
  const o = flowerOverview(PLACED_YEAR_1, { now: NOW });
  snap("placed", brief(o));
  const m = gemProgress(PLACED_YEAR_1, "m>m", { now: NOW });
  assert.equal(m.parts.assumed, false, "m has been used since placement");
  const zz = gemProgress(PLACED_YEAR_1, "zz>z", { now: NOW });
  assert.deepEqual([zz.stage, zz.parts.assumed, zz.parts.energy], ["practising", true, 0.5]);
});

test("snapshot: everything the game has, won", () => {
  const o = flowerOverview(EVERYTHING, { now: NOW });
  snap("everything", brief(o));
});

// ------------------------------------------------------------------------------------------------ the rules
test("agrees with the game: ENERGY_FULL, the frontier, knownNow and gemState (engine/gems.ts)", async () => {
  const mem = new Map<string, string>();
  const g = globalThis as Record<string, unknown>;
  g.localStorage ??= { getItem: (key: string) => mem.get(key) ?? null, setItem: (key: string, v: string) => void mem.set(key, v), removeItem: (key: string) => void mem.delete(key) };
  g.document ??= { addEventListener() {}, visibilityState: "visible" };
  g.window ??= globalThis;
  g.addEventListener ??= () => {};
  const store = await import("../engine/store");
  const gems = await import("../engine/gems");
  assert.equal(ENERGY_FULL, store.ENERGY_FULL);
  // gemState → the stages it may be: charging is met or practising, or (the frontier's own lesson, not had yet) unseen
  const allowed: Record<string, GemStage[]> = { future: ["unseen"], hidden: ["unseen"], charging: ["met", "practising", "unseen"], ready: ["ready"], won: ["won", "mastered"] };
  for (const [name, s] of Object.entries({ NEW, MID_RECEPTION, END_RECEPTION, MID_YEAR_1, PLACED_YEAR_1, EVERYTHING })) {
    assert.equal(frontierOf(s).id, gems.frontier(s).id, name);
    assert.deepEqual([...knownOf(s)].sort(), [...gems.knownNow(s)].sort(), name);
    const known = gems.knownNow(s);
    const next = new Set((frontierOf(s).teach ?? []).map((t) => t.split("=")[0]));
    for (const gem of GEMS) {
      const st = gems.gemState(gem, s, known);
      const mine = gemProgress(s, gem.key, { now: NOW }).stage;
      assert.ok(allowed[st].includes(mine), `${name} ${gem.key}: gemState ${st}, progress ${mine}`);
      if (st === "charging" && mine === "unseen") assert.ok(next.has(gem.g === "u" && gem.p === "w" ? "q" : gem.g), `${name} ${gem.key} is unseen only while its lesson is next`);
    }
    for (const pt of PETALS) assert.equal(petalProgress(s, pt.p, { now: NOW }).complete.game, gems.petalComplete(pt, s), `${name} /${pt.p}/`);
  }
});

test("a gem climbs the ladder: unseen < met < practising < ready < won < mastered", () => {
  const s = blank();
  for (const l of LEVELS.slice(0, LEVELS.findIndex((l) => l.id === "w3-1"))) s.stars[l.id] = 3; // units 1–4 taught
  const at = (f: (x: Save) => void) => {
    const x = structuredClone(s);
    f(x);
    return gemProgress(x, "s>s", { now: NOW });
  };
  const used = (x: Save, n: number, ok: number) => (x.spell["s>s"] = { n, ok, last: NOW - HOUR, streak: ok });
  const three = WORDS.filter((w) => w.unit <= 2 && w.segs.some((sg) => k(sg) === "s>s")).slice(0, 3).map((w) => w.text);
  const unseen = gemProgress(blank(), "s>s", { now: NOW });
  const met = at(() => {});
  const half = at((x) => ((x.energy["s>s"] = 4), used(x, 4, 4)));
  const ready = at((x) => ((x.energy["s>s"] = 8), used(x, 8, 8)));
  const won = at((x) => ((x.energy["s>s"] = 8), x.gems.push("s>s"), used(x, 8, 7)));
  const mastered = at((x) => {
    x.energy["s>s"] = 8;
    x.gems.push("s>s");
    used(x, 12, 11);
    for (const [i, w] of three.entries()) x.words[w] = { n: 2, ok: 2, last: NOW - (i + 1) * 2 * DAY };
  });
  const ladder = [unseen, met, half, ready, won, mastered];
  assert.deepEqual(ladder.map((g) => g.stage), ["unseen", "met", "practising", "ready", "won", "mastered"]);
  for (let i = 1; i < ladder.length; i++) assert.ok(ladder[i].value > ladder[i - 1].value, `${ladder[i - 1].stage} ${ladder[i - 1].value} < ${ladder[i].stage} ${ladder[i].value}`);
  assert.deepEqual([met.value, ready.parts.achieved, mastered.parts.achieved], [LADDER.met, LADDER.ready, LADDER.mastered]);
  assert.ok(won.parts.achieved >= LADDER.won && won.parts.achieved < LADDER.mastered);
  assert.deepEqual([won.parts.days, mastered.parts.words, mastered.parts.days], [1, 3, 4]);
  // forgetting: two months later the stage stays and the gem is dusty; the value falls, but never below half
  const x = structuredClone(s);
  x.energy["s>s"] = 8;
  x.gems.push("s>s");
  used(x, 8, 7);
  const later = gemProgress(x, "s>s", { now: NOW + 60 * DAY });
  assert.deepEqual([later.stage, later.fading], ["won", true]);
  assert.ok(later.value < won.value && later.value >= later.parts.achieved / 2, String(later.value));
  // a gem still charging loses value too, but is never dusty
  const y = structuredClone(s);
  y.energy["s>s"] = 4;
  used(y, 4, 4);
  const stale = gemProgress(y, "s>s", { now: NOW + 60 * DAY });
  assert.deepEqual([stale.stage, stale.fading], ["practising", false]);
  assert.ok(stale.value < half.value);
});

test("a petal: missing → outline → filling → complete for the stage, and complete again once a new spelling is won", () => {
  const upTo = (id: string) => {
    const s = blank();
    for (const l of LEVELS.slice(0, LEVELS.findIndex((x) => x.id === id))) s.stars[l.id] = 3;
    return s;
  };
  // before the Misty Mountains' first lesson, /k/ has c (unit 3); after w3-1, k too; after w5-3, ck too
  const s = upTo("w3-1");
  assert.equal(petalProgress(blank(), "k", { now: NOW }).state, "missing");
  assert.equal(petalProgress(s, "k", { now: NOW }).state, "outline");
  s.energy["c>k"] = 4;
  const half = petalProgress(s, "k", { now: NOW });
  assert.equal(half.state, "filling");
  assert.ok(half.fill > 0.3 && half.fill < 0.4, String(half.fill)); // (0.05 + 0.55 × 0.5 − 0.05) / 0.75
  s.gems.push("c>k");
  const done = petalProgress(s, "k", { now: NOW });
  assert.deepEqual([done.state, done.fill, done.complete], ["complete", 1, { stage: true, game: false, full: false }]);
  // the next lessons teach k (unit 5), x (7), ck and q (11): the petal has room again, and the chart shows what is left
  const later = upTo("w5-4");
  later.gems.push("c>k", "k>k", "x>ks");
  const more = petalProgress(later, "k", { now: NOW });
  assert.equal(more.state, "filling");
  assert.deepEqual(more.spellings.filter((x) => x.expected).map((x) => `${x.g} ${x.stage}`), ["c won", "k won", "ck met", "x won"]);
  assert.deepEqual(more.spellings.filter((x) => !x.expected).map((x) => x.g), ["ch", "cc", "q", "x"].filter((g) => g !== "x"));
  assert.equal(more.fill, Math.round(((3 + 3 + 1) / (3 + 3 + 3 + 1)) * 1000) / 1000);
});

test("complete for the stage, for the game, and for the whole chart", () => {
  const o = flowerOverview(EVERYTHING, { now: NOW });
  const at = (p: PhonemeId) => o.petals.find((x) => x.p === p)!;
  // /a/ has one spelling on the chart: won is the whole column; /ch/ has ch and tch, both in the game
  assert.deepEqual(at("a").complete, { stage: true, game: true, full: true });
  assert.deepEqual(at("ch").complete, { stage: true, game: true, full: true });
  // /ae/: ai and ay won (2 + 2); a-e and ea (2 each, Year 1) and ei ey eigh (1 each, Year 2) still to come
  assert.deepEqual(at("ae").complete, { stage: true, game: true, full: false });
  assert.equal(at("ae").whole, Math.round((4 / 11) * 1000) / 1000);
  // /zh/ and /schwa/: the game can't teach them yet
  assert.deepEqual([at("zh").state, at("zh").reachable, at("schwa").reachable], ["missing", false, false]);
});

test("one spelling, several sounds", () => {
  const sounds = (g: string) => soundsOfSpelling(g).map((x) => `${x.p} ${x.sw} ${x.example}`);
  assert.deepEqual(sounds("ea"), ["ae EC1 steak", "ee EC2 sea", "e EC7 head"]);
  assert.deepEqual(sounds("th"), ["th IC11 moth", "dh IC11 this"]);
  assert.deepEqual(soundsOfSpelling("x").map((x) => [x.p, x.key, x.together]), [["s", "x>ks", true], ["k", "x>ks", true]]);
  const gs = (m: ReturnType<typeof multiSoundSpellings>) => m.map((x) => `${x.g}: ${x.sounds.map((s) => s.p).join(" ")}`);
  // in the programme: by the end of the Initial Code, < n > (/n/, /ng/), < th >, < u > (/u/, the /w/ of qu)
  assert.deepEqual(gs(multiSoundSpellings(stageAtUnit("IC11"))), ["n: n ng", "th: th dh", "u: u w"]);
  // by EC3 (Spelling < ea >): < ea > is /ae/ and /ee/
  assert.ok(gs(multiSoundSpellings(stageAtUnit("EC3"))).includes("ea: ae ee"));
  assert.ok(gs(multiSoundSpellings(stageAtUnit("EC49"))).includes("ea: ae ee e"));
  // a child: the game has taught < th > both ways and < u > both ways (it has no words with < n > as /ng/ yet)
  const child = multiSoundSpellings(END_RECEPTION, { now: NOW });
  assert.deepEqual(gs(child), ["th: th dh", "u: u w"]);
  assert.deepEqual(child.map((x) => x.discussed), [false, false]);
  const told = structuredClone(END_RECEPTION) as Save & { narr?: Record<string, { n: number; at: number[]; s: number[] }> };
  told.narr = { [twoSoundsKey("th")]: { n: 1, at: [0], s: [3] } };
  assert.deepEqual(multiSoundSpellings(told, { now: NOW }).map((x) => x.discussed), [true, false]);
  assert.deepEqual(multiSoundSpellings(MID_RECEPTION, { now: NOW }), []);
  // the chart shows ea's other sounds on its /ee/ line
  assert.deepEqual(petalProgress(MID_YEAR_1, "ee", { now: NOW }).spellings.find((x) => x.g === "ea")?.otherSounds, ["ae", "e"]);
});

test("stages", () => {
  assert.equal(stageOf(NEW).unit, null);
  assert.equal(stageOf(MID_RECEPTION, { now: NOW }).unit, "IC7");
  assert.equal(stageOf(END_RECEPTION, { now: NOW }).unit, "IC11");
  const ec1 = stageAtUnit("EC1");
  assert.ok(ec1.taught.has("ai>ae") && ec1.taught.has("a-e>ae") && ec1.taught.has("ea>ae") && !ec1.taught.has("ee>ee"));
  // the stage's pairs are the fill's denominator: a mid-Year 1 child's /ae/ is ai and ay, not a-e or eigh
  assert.deepEqual(petalProgress(MID_YEAR_1, "ae", { now: NOW }).spellings.filter((x) => x.expected).map((x) => x.g), ["ai", "ay"]);
});

// ------------------------------------------------------------------------------------------------ the snapshots
const SNAP = {
  midReception: {
    missing: 21,
    soon: "",
    outline: "",
    filling: "s 0.6, l 0.66, f 0.75, v 0.55, k 0.64, z 0.48",
    complete: "e u o d i n j g m h r t a p b w y",
    full: "a y",
    fading: "v",
    fill: 0.899,
    whole: 0.267,
  },
  midReceptionGems: [
    "m>m won 0.99",
    "x>ks practising 0.20",
    "zz>z practising 0.42",
    "sh>sh unseen 0.00",
  ],
  endReception: {
    missing: 16,
    soon: "ae ee ie oe",
    outline: "",
    filling: "s 0.83, l 0.82, f 0.86, v 0.6, k 0.97, z 0.78, w 0.87, y 0.69, ch 0.81, dh 0.73, ng 0.71",
    complete: "e u o d i n j g m h r t a p b sh th",
    full: "a th",
    fading: "f v g",
    fill: 0.916,
    whole: 0.374,
  },
  endReceptionGems: [
    "m>m won 0.99",
    "ck>k won 0.98",
    "th>dh ready 0.58",
    "u>w won 0.99",
    "ai>ae unseen 0.00",
  ],
  midYear1: {
    missing: 14,
    soon: "ie oe",
    outline: "",
    filling: "ee 0.84, v 0.61, z 0.75, w 0.88",
    complete: "ae s l f e u o d i n j g m h k r t a p b y sh ch th dh ng",
    full: "a y ch th dh",
    fading: "ae s f v j h w y ch th dh ng",
    fill: 0.969,
    whole: 0.416,
  },
  midYear1Gems: [
    "m>m won 0.96",
    "th>th won 0.82 fading",
    "ai>ae mastered 0.89 fading",
    "ea>ee mastered 0.94",
    "oa>oe unseen 0.00",
  ],
  away: {
    missing: 14,
    soon: "ie oe",
    outline: "",
    filling: "ee 0.84, v 0.61, z 0.75, w 0.88",
    complete: "ae s l f e u o d i n j g m h k r t a p b y sh ch th dh ng",
    full: "a y ch th dh",
    fading: "ae ee s l f e u o v j m h k z a b w y ch th dh ng",
    fill: 0.969,
    whole: 0.416,
  },
  awayGems: [
    "m>m won 0.89 fading",
    "th>th won 0.72 fading",
    "ai>ae mastered 0.77 fading",
    "ea>ee mastered 0.80 fading",
    "oa>oe unseen 0.00",
  ],
  placed: {
    missing: 14,
    soon: "ie oe",
    outline: "",
    filling: "ae 0.76, ee 0.16, s 0.64, l 0.73, f 0.37, e 0.32, u 0.37, o 0.73, v 0.37, j 0.37, g 0.5, m 0.64, h 0.37, k 0.36, z 0.37, a 0.64, b 0.55, w 0.33, y 0.37, sh 0.46, ch 0.46, th 0.37, dh 0.37, ng 0.37",
    complete: "d i n r t p",
    full: "",
    fading: "sh",
    fill: 0.565,
    whole: 0.231,
  },
  everything: {
    missing: 12,
    soon: "",
    outline: "",
    filling: "v 0.87",
    complete: "ae ee ie oe s l f e u o d i n j g m h k r t z a p b w y sh ch th dh ng",
    full: "a w y ch th dh",
    fading: "ae ee ie oe s l f e u o v j k r z p w y sh ch th dh",
    fill: 0.996,
    whole: 0.444,
  },
};
