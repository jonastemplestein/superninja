// The cheat menu's save edits (docs/CHEATS.md). Two layers:
// - pure edits: a Save in, a new Save out (never the one passed in), unit-tested in actions.test.ts. They use the game's
//   own rules (gemState, knownNow, frameForm, migrateGames' shape) so what they write is what the game would have written.
// - commit(): writes a whole save through the store (one store.set, then store.flush, so the page can't later flush an
//   older copy over it) and makes sure there is a player profile to write it to. Navigation is in jumps.ts.
import { store, profilesApi, ENERGY_FULL, type Save, type Skill, type SchoolYear, type Band } from "../engine/store";
import { LEVELS, WORLDS, MILESTONES, AFTER_WARMUPS, knownSpellings, maxUnitOf, startLevelAfter, type Level } from "../content/worlds";
import { GEMS, PETALS, neededGems, type Gem, type Petal } from "../content/flower";
import { WORDS, UNITS, type PhonemeId } from "../content/phonics";
import { WARMUPS } from "../content/warmups";
import { emptyFoundations } from "../core/learner/foundations";
import { GAME_IDS, GAMES_MIGRATED, gameKey, gamesOfLevel, migrateGames, type GameId } from "../content/games";
import { frameForm, lettersKey, lettersLine, twoSoundsKey, TWO_SOUNDS, type FrameForm, type GameExposure } from "../content/narrative";
import { gemState, knownNow, petalComplete, isMet, gemKeyOfTeach, type GemState } from "../engine/gems";

export const DAY = 86_400_000;
/** The narrative ledger (src/scenes/narrate.tsx keeps it in the save as `narr`). */
export type Ledger = Record<string, GameExposure>;
/** A save with the fields the Save type doesn't list: the ledger, the World Flower trip still due, the captions flag. */
export type CheatSave = Save & { narr?: Ledger; tripDue?: unknown; captionsV2?: boolean };

const clone = <T>(x: T): T => structuredClone(x);

/** A brand-new save: store.ts's fresh() (not exported), plus captionsV2 so a reload keeps the captions setting. The
 *  test checks it still has every key fresh() has. */
export function blankSave(): CheatSave {
  return {
    v: 1, foundations: emptyFoundations(), hero: null, seenIntro: false, stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [],
    settings: { relaxed: false, music: 0.32, captions: false, unlockAll: false }, minutes: 0, sessions: 0,
    stickers: [], shiny: [], adjustLog: [], captionsV2: true,
  };
}

// ---------------------------------------------------------------- small helpers
/** One gem per key (<x> sits in two petals). */
export const IN_PLAY: Gem[] = GEMS.filter((g, i) => g.inPlay && GEMS.findIndex((x) => x.key === g.key) === i);
/** The spelling that makes a gem "met" (gemState: the /w/ of < qu > is met with < q >). */
export const spellingOf = (g: Pick<Gem, "g" | "p">) => (g.g === "u" && g.p === "w" ? "q" : g.g);
const addTo = (xs: string[], x: string) => void (xs.includes(x) || xs.push(x));
const dropFrom = (xs: string[], x: string) => xs.filter((y) => y !== x);
const skill = (n: number, ok: number, last: number, streak: number): Skill => ({ n, ok, last, streak });
/** The telling `k` times over (retired for every spacing schedule when k = 3). */
const retired = (at: number, session: number, k = 3): GameExposure => ({ n: k, at: Array(k).fill(at), s: Array.from({ length: k }, (_, i) => Math.max(0, session - k + i)) });
const ledgerOf = (s: CheatSave): Ledger => (s.narr ??= {});
/** The ledger's migration marker: without it, narrate.tsx folds every game with stars back to its short form. */
const markMigrated = (s: CheatSave) => void (ledgerOf(s)[GAMES_MIGRATED] ??= { n: 1, at: [], s: [s.sessions ?? 0] });

// ---------------------------------------------------------------- presets
export type PresetId = "new" | "warmups" | "mid-reception" | "end-reception" | "mid-year-1" | "end-year-1" | "end-year-2";
export interface Preset {
  id: PresetId;
  label: string;
  note: string;
  /** levels finished: every level before this index in LEVELS (0 for a new child, LEVELS.length for everything) */
  done: number;
  year: SchoolYear;
  band: Band;
  sessions: number;
  /** every gem the game can teach is won (the whole World Flower is home) */
  allWon?: boolean;
}
const idx = (id: string) => LEVELS.findIndex((l) => l.id === id);
const milestone = (id: string) => MILESTONES.find((m) => m.id === id);
/**
 * The presets. The school ones take their labels and units from MILESTONES (content/worlds.ts); a milestone's start
 * level is startLevelAfter(unit), as Jump ahead uses. Today's content stops at unit 12, so MILESTONES' "End of Year 1" and
 * "End of Year 2" (both unit 12) would land on the same stone (w6-1): here they are spread over the Sky Temple instead
 * (Year 1: every level but the last boss; Year 2: the whole game, every gem won), with "Middle of Year 1" between.
 */
export const PRESETS: Preset[] = [
  { id: "new", label: "New child", note: "A brand-new save: the title, the film, choose, the opt-in", done: 0, year: "unset", band: "W", sessions: 0 },
  { id: "warmups", label: "Warm-ups done", note: "Preschool: the six listening warm-ups, no letters yet", done: idx(AFTER_WARMUPS), year: "none", band: "W", sessions: 4 },
  {
    id: "mid-reception", label: milestone("mid-reception")?.label ?? "Middle of Reception", note: milestone("mid-reception")?.note ?? "",
    done: LEVELS.indexOf(startLevelAfter(milestone("mid-reception")?.unit ?? 7)), year: "R", band: "R", sessions: 18,
  },
  {
    id: "end-reception", label: milestone("end-reception")?.label ?? "End of Reception", note: milestone("end-reception")?.note ?? "",
    done: LEVELS.indexOf(startLevelAfter(milestone("end-reception")?.unit ?? 11)), year: "R", band: "R", sessions: 36,
  },
  { id: "mid-year-1", label: "Middle of Year 1", note: "The Sky Temple: /ae/ and /ee/ sorted, /oe/ and /ie/ to come", done: idx("w6-5"), year: "Y1", band: "Y1", sessions: 44 },
  { id: "end-year-1", label: milestone("end-year-1")?.label ?? "End of Year 1", note: "Every level but the last boss", done: LEVELS.length - 1, year: "Y1", band: "Y1", sessions: 55 },
  { id: "end-year-2", label: milestone("end-year-2")?.label ?? "End of Year 2", note: "The whole game: every level, every gem, the World Flower complete", done: LEVELS.length, year: "Y2", band: "Y2", sessions: 70, allWon: true },
];
export const presetById = (id: PresetId) => PRESETS.find((p) => p.id === id)!;
/** Where a preset leaves the child: the first level not finished (the last level once everything is). */
export const presetFrontier = (p: Preset): Level => LEVELS[Math.min(p.done, LEVELS.length - 1)];

/** The once-per-save explanations a child has had by `done` levels (narrate.tsx keys): retired in a preset. */
function onceHeard(done: Level[]): string[] {
  const keys = ["ready:first", "ready:paw", "baron-motive", "hear-again", "reward:to-reward"];
  const lands = [...new Set(done.filter((l) => !l.warmup).map((l) => l.world))];
  const any = (f: (l: Level) => boolean) => done.some(f);
  if (any((l) => !!l.teach?.length)) keys.push("gem-energy", "made-of-sounds", "hear-see:w1", "dojo:welcome", "dojo:first", "left-right:build");
  for (const w of lands) keys.push(`gem-more:w${w}`, ...(w <= 2 ? [`left-right:w${w}`] : []), `hear-see:w${w}`);
  if (any((l) => l.kind === "swap")) keys.push("place:middle", "place:last");
  if (any((l) => l.kind === "sort")) keys.push("sort:first");
  if (any((l) => l.kind === "story")) keys.push("story:choice");
  return keys;
}

/**
 * The save of a child at a preset: `base` gives the settings and the hero (a new child keeps only the settings).
 * Played through (the default): stars on every level before the frontier (warm-ups 1, the rest 3), the spellings they
 * taught as petals, their words read (gold stickers) and the warm-ups' picture stickers, gems of the earlier units won and
 * the latest unit's charging (its first gem glowing), each game told twice (its short form), the World Flower trips had,
 * and the once-per-save explanations heard. `placed`: as the opt-in's placement leaves a child (placeAtUnit): no stars,
 * `placedAt` the frontier, petals up to its unit with their gems half-charged, nothing heard.
 */
export function presetSave(id: PresetId, base: Save, now = Date.now(), o: { placed?: boolean } = {}): CheatSave {
  const p = presetById(id);
  const s = blankSave();
  s.settings = { ...base.settings };
  if (p.id === "new") return s;
  const done = LEVELS.slice(0, p.done);
  const last = done[done.length - 1];
  const front = presetFrontier(p);
  const session = p.sessions;
  const yesterday = now - DAY;
  Object.assign(s, {
    hero: base.hero ?? "kai", seenIntro: true, seenTraining: true, seenPlacement: true, seenBook: true, seenStreak: p.done > 8,
    seenTimer: front.world > 3 || p.done === LEVELS.length, sessions: session, minutes: session * 9, schoolYear: p.year, schoolYearAt: now,
    band: p.band, firstSession: null, tripDue: null,
  } satisfies Partial<CheatSave>);
  s.adjustLog = [{ at: now, text: `Cheat menu: preset "${p.label}"${o.placed ? " (placed)" : ""}` }];
  markMigrated(s);

  if (o.placed) {
    // placeAtUnit(unit), for the unit the frontier's land starts after
    const unit = last ? Math.max(0, ...done.filter((l) => !l.warmup).map(maxUnitOf)) : 0;
    s.placedAt = front.id;
    for (const u of UNITS.filter((u) => u.id <= unit)) for (const g of u.spellings) addTo(s.petals, g);
    for (const gem of IN_PLAY) if (gem.unit <= unit) s.energy[gem.key] = ENERGY_FULL / 2;
    return s;
  }

  // levels: stars, warm-up scores
  for (const l of done) {
    s.stars[l.id] = l.warmup ? 1 : 3;
    if (l.warmup) (s.warmups ??= {})[l.id] = { first: 9, total: 10 };
  }
  // the spellings met (as knownNow would have them), and the highest unit played
  const known = last ? knownSpellings(last) : new Set<string>();
  if (p.allWon) for (const g of IN_PLAY) known.add(spellingOf(g));
  s.petals = [...known];
  const top = Math.max(0, ...done.filter((l) => !l.warmup).map(maxUnitOf));
  // gems: earlier units won, the latest unit charging (its first gem full, so the World Flower has a battle waiting)
  let glowing = false;
  for (const g of IN_PLAY) {
    if (!known.has(spellingOf(g)) || (!p.allWon && g.unit > top)) continue;
    const won = p.allWon || g.unit < top;
    if (won) s.gems.push(g.key);
    s.energy[g.key] = won || !glowing ? ENERGY_FULL : ENERGY_FULL * 0.6;
    if (!won) glowing = true;
    s.read[g.key] = won ? skill(8, 7, yesterday, 4) : skill(4, 3, yesterday, 1);
    s.spell[g.key] = won ? skill(8, 7, yesterday, 4) : skill(4, 3, yesterday, 1);
  }
  // words read: every word of the units played that uses only spellings met (gold word stickers)
  for (const w of WORDS) {
    if (w.unit > top || !w.segs.every((sg) => known.has(sg.g))) continue;
    s.words[w.text] = { n: 2, ok: 2, last: yesterday, met: yesterday };
  }
  // the Sticker Book: the warm-ups' picture stickers first, then the words in teaching order
  for (const l of done) if (l.warmup) for (const w of WARMUPS[l.warmup]?.stickers ?? []) addTo(s.stickers, w);
  for (const w of Object.keys(s.words)) addTo(s.stickers, w);
  if (done.some((l) => l.warmup === "W2")) s.shiny.push("fishdog");
  // World Flower trips had: each taught spelling's, and each land entered (from the second)
  s.flowerSeen = [];
  for (const l of done) for (const t of l.teach ?? []) addTo(s.flowerSeen, `spelling:${gemKeyOfTeach(t)}`);
  for (const w of WORLDS) if (w.id > 1 && w.id <= front.world && done.some((l) => l.world === w.id - 1)) addTo(s.flowerSeen, `world:${w.id}`);
  s.seenFlower = s.flowerSeen.length > 0;
  // the ledger: each game played told twice (short form next time), last played yesterday; the explanations heard
  const narr = ledgerOf(s);
  const at = Math.max(0, p.done - 1);
  for (const id of new Set(done.flatMap((l) => gamesOfLevel(l, { school: true })))) narr[gameKey(id)] = gameEntry("short", session, now, at)!;
  for (const k of onceHeard(done)) narr[k] = retired(at, session);
  for (const g of known) {
    if (lettersLine({ g, p: "a" as PhonemeId })) narr[lettersKey(g)] = retired(at, session);
    if (TWO_SOUNDS[g]) narr[twoSoundsKey(g)] = retired(at, session);
  }
  return s;
}

// ---------------------------------------------------------------- the 44 sounds and their gems
export type SoundState = "none" | "met" | "secure" | "n/a";
export const SOUND_CYCLE: Record<Exclude<SoundState, "n/a">, Exclude<SoundState, "n/a">> = { none: "met", met: "secure", secure: "none" };
/** A sound as the World Flower shows it: secure (the petal is home: every gem it can have won), met (a gem shows its
 *  letters), none (still in the mist); n/a when this version of the game teaches none of its spellings. */
export function soundState(pt: Petal, s: Save, known: Set<string> = knownNow(s)): SoundState {
  if (!neededGems(pt).length) return "n/a";
  if (petalComplete(pt, s)) return "secure";
  return pt.gems.some((g) => isMet(gemState(g, s, known))) ? "met" : "none";
}
/**
 * Set a sound's petal: none (its spellings out of the petals, its gems unwon and empty, their skills gone), met (its
 * spellings in, its gems half-charged) or secure (every gem won). A sound the child's progress has already taught
 * (the frontier is past it) stays met at least: the game derives that from the levels, not from the save's petals.
 */
export function withSound(save: Save, p: PhonemeId, to: "none" | "met" | "secure", now = Date.now()): CheatSave {
  const s = clone(save) as CheatSave;
  const pt = PETALS.find((x) => x.p === p);
  for (const g of pt ? neededGems(pt) : []) setGem(s, g, to === "none" ? "hidden" : to === "met" ? "charging" : "won", now);
  return s;
}

export type GemTarget = "hidden" | "charging" | "ready" | "won";
export const GEM_CYCLE: Record<GemTarget, GemTarget> = { hidden: "charging", charging: "ready", ready: "won", won: "hidden" };
/** The cycle's next state from the gem's state as the game sees it (future gems don't cycle). */
export const nextGemTarget = (st: GemState): GemTarget | null => (st === "future" ? null : GEM_CYCLE[st]);
function setGem(s: CheatSave, g: Gem, to: GemTarget, now: number) {
  const sp = spellingOf(g);
  if (to === "hidden") {
    s.petals = dropFrom(s.petals, sp);
    s.gems = dropFrom(s.gems, g.key);
    delete s.energy[g.key];
    delete s.read[g.key];
    delete s.spell[g.key];
    return;
  }
  addTo(s.petals, sp);
  if (to === "won") addTo(s.gems, g.key);
  else s.gems = dropFrom(s.gems, g.key);
  s.energy[g.key] = to === "charging" ? ENERGY_FULL / 2 : ENERGY_FULL;
  const sk = to === "won" ? skill(8, 8, now, 6) : to === "ready" ? skill(6, 5, now, 3) : skill(3, 2, now, 1);
  s.read[g.key] = sk;
  s.spell[g.key] = { ...sk };
}
/** Set one spelling's gem: not found (hidden), charging (half full), glowing (full, its Gem Trial waiting) or won. A
 *  glowing gem with fewer than three trial words the child can spell still shows as charging (gemState). */
export function withGem(save: Save, key: string, to: GemTarget, now = Date.now()): CheatSave {
  const s = clone(save) as CheatSave;
  const g = IN_PLAY.find((x) => x.key === key);
  if (g) setGem(s, g, to, now);
  return s;
}
/** Every gem the game can teach won, every spelling met, skills high: the whole World Flower home. */
export function allMastered(save: Save, now = Date.now()): CheatSave {
  const s = clone(save) as CheatSave;
  for (const g of IN_PLAY) setGem(s, g, "won", now);
  for (const u of UNITS) for (const g of u.spellings) addTo(s.petals, g);
  return s;
}
/** The mastery model back to nothing: no petals, gems, gem energy or reading and spelling skills (stars, words and
 *  stickers stay; the frontier still counts its levels' spellings as met). */
export function resetMastery(save: Save): CheatSave {
  const s = clone(save) as CheatSave;
  Object.assign(s, { petals: [], gems: [], energy: {}, read: {}, spell: {}, foundations: emptyFoundations() });
  return s;
}

// ---------------------------------------------------------------- words and stickers
export const wordsOfUnit = (unit: number) => WORDS.filter((w) => w.unit === unit);
/** Mark words found (read right twice: gold word stickers in the Sticker Book) or not found (their records and stickers
 *  gone). */
export function withWords(save: Save, words: readonly string[], found: boolean, now = Date.now()): CheatSave {
  const s = clone(save) as CheatSave;
  for (const w of words) {
    if (found) {
      const r = (s.words[w] ??= { n: 0, ok: 0, last: 0 });
      Object.assign(r, { n: Math.max(r.n, 2), ok: Math.max(r.ok, 2), last: now, met: r.met ?? now });
      addTo((s.stickers ??= []), w);
    } else {
      delete s.words[w];
      s.stickers = (s.stickers ?? []).filter((x) => x !== w);
    }
  }
  return s;
}
/** Every picture the warm-ups give as a sticker. */
export const WARMUP_STICKERS: string[] = [...new Set(Object.values(WARMUPS).flatMap((w) => w.stickers))];
export function withStickers(save: Save, words: readonly string[] | null): CheatSave {
  const s = clone(save) as CheatSave;
  if (words === null) s.stickers = [];
  else for (const w of words) addTo((s.stickers ??= []), w);
  return s;
}
export function withShiny(save: Save, w: string, on: boolean): CheatSave {
  const s = clone(save) as CheatSave;
  s.shiny = on ? [...new Set([...(s.shiny ?? []), w])] : (s.shiny ?? []).filter((x) => x !== w);
  if (on) addTo((s.stickers ??= []), w);
  return s;
}

// ---------------------------------------------------------------- the teacher's voice (the game ledger)
/** The forms a cheat can give a game's introduction. `recap-21`: 22 days since it was played (the recap with its Ready
 *  hold); `recap-struggled`: the child struggled last time (the same); `none`: played already this session (mid-level
 *  only: a level opens on at least the short form). */
export type GameForm = "full" | "recap" | "recap-21" | "recap-struggled" | "short" | "none";
export const GAME_FORMS: GameForm[] = ["full", "recap", "recap-21", "recap-struggled", "short", "none"];
/** The ledger entry that makes frameForm() give `form` in session `session` at `now` (null: no entry, the full form). */
export function gameEntry(form: GameForm, session: number, now: number, at = 0): GameExposure | null {
  switch (form) {
    case "full":
      return null;
    case "recap": // one telling, in an earlier session
      return { n: 1, at: [at], s: [session - 1], lastAt: now - DAY, lastSession: session - 1, struggled: false };
    case "recap-21":
      return { n: 2, at: [at, at], s: [session - 2, session - 1], lastAt: now - 22 * DAY, lastSession: session - 1, struggled: false };
    case "recap-struggled":
      return { n: 2, at: [at, at], s: [session - 2, session - 1], lastAt: now - DAY, lastSession: session - 1, struggled: true };
    case "short":
      return { n: 2, at: [at, at], s: [session - 2, session - 1], lastAt: now - DAY, lastSession: session - 1, struggled: false };
    case "none":
      return { n: 2, at: [at, at], s: [session - 2, session - 1], lastAt: now, lastSession: session, struggled: false };
  }
}
/** Give games (all of them: `ids` omitted) this introduction form. The migration marker is set too, so the game's
 *  old-save migration can't fold a game with stars back to its short form. */
export function withGameForm(save: Save, form: GameForm, ids: readonly GameId[] = GAME_IDS, now = Date.now()): CheatSave {
  const s = clone(save) as CheatSave;
  markMigrated(s);
  const l = ledgerOf(s);
  for (const id of ids) {
    const e = gameEntry(form, s.sessions ?? 0, now);
    if (e) l[gameKey(id)] = e;
    else delete l[gameKey(id)];
  }
  return s;
}
/** The "struggled" flag of a game (it brings back the recap with its Ready hold). */
export function withStruggled(save: Save, id: GameId, on: boolean): CheatSave {
  const s = clone(save) as CheatSave;
  markMigrated(s);
  const l = ledgerOf(s);
  l[gameKey(id)] = { ...(l[gameKey(id)] ?? { n: 0, at: [] }), struggled: on };
  return s;
}
/** The form a game's introduction takes now (the ledger as the game reads it; an unmigrated save is treated as the
 *  game would once it migrates). */
export function formNow(s: Save, id: GameId, now = Date.now()): FrameForm {
  return frameForm(gameLedger(s)[gameKey(id)], s.sessions ?? 0, now);
}
/** The ledger's game entries as narrate.tsx reads them (an old save's games with stars folded to their short form). */
export function gameLedger(s: Save): Ledger {
  const l = (s as CheatSave).narr ?? {};
  return l[GAMES_MIGRATED] ? l : { ...l, ...migrateGames(l, s.stars ?? {}, LEVELS) };
}

// ---------------------------------------------------------------- the dosage ledger
export type LedgerReset = "letters" | "jump-offer" | "once" | "games" | "all";
/** Forget part of the ledger: the read-back reminders (letters:*, two-sounds:*), the jump-ahead offer, the other
 *  explanations (everything but the games, the reminders and the offer), the games (all back to their full form), or
 *  all of it (the migration marker stays, so every game plays its full form). */
export function withLedgerReset(save: Save, what: LedgerReset): CheatSave {
  const s = clone(save) as CheatSave;
  const l = ledgerOf(s);
  const isGame = (k: string) => k.startsWith("game:") || k === GAMES_MIGRATED;
  const isLetters = (k: string) => k.startsWith("letters:") || k.startsWith("two-sounds:");
  for (const k of Object.keys(l)) {
    const drop =
      what === "all" ? k !== GAMES_MIGRATED
      : what === "letters" ? isLetters(k)
      : what === "jump-offer" ? k === "jump-offer"
      : what === "games" ? k.startsWith("game:")
      : !isGame(k) && !isLetters(k) && k !== "jump-offer";
    if (drop) delete l[k];
  }
  markMigrated(s);
  return s;
}
export function withoutLedgerKey(save: Save, key: string): CheatSave {
  const s = clone(save) as CheatSave;
  delete ledgerOf(s)[key];
  return s;
}

// ---------------------------------------------------------------- time
export function withSessions(save: Save, n: number): CheatSave {
  const s = clone(save) as CheatSave;
  s.sessions = Math.max(0, Math.round(n));
  return s;
}
/** Every "when" in a save: the games' last plays, the words' last tries and first meetings, the skills' last tries. */
function stamps(s: CheatSave, f: (t: number) => number) {
  for (const e of Object.values(s.narr ?? {})) if (typeof e.lastAt === "number") e.lastAt = f(e.lastAt);
  for (const w of Object.values(s.words ?? {})) {
    if (w.last) w.last = f(w.last);
    if (w.met) w.met = f(w.met);
  }
  for (const m of [s.read, s.spell]) for (const k of Object.values(m ?? {})) if (k.last) k.last = f(k.last);
}
/** The newest "when" in the save (null for a save with none). */
export function lastPlayed(save: Save): number | null {
  let t = -Infinity;
  stamps(clone(save) as CheatSave, (x) => ((t = Math.max(t, x)), x));
  return Number.isFinite(t) && t > 1e12 ? t : null;
}
export function daysSinceLastPlay(save: Save, now = Date.now()): number | null {
  const t = lastPlayed(save);
  return t === null ? null : (now - t) / DAY;
}
/** Move every "when" back (or on) together, so the newest is `days` ago: 22 days brings back every game's recap with
 *  its Ready hold (GAME_REFRESH_MS), and the reading and spelling skills decay as they would. */
export function withDaysAway(save: Save, days: number, now = Date.now()): CheatSave {
  const s = clone(save) as CheatSave;
  const t = lastPlayed(s);
  if (t === null) return s;
  const shift = now - days * DAY - t;
  stamps(s, (x) => (x > 1e12 ? x + shift : x));
  return s;
}

// ---------------------------------------------------------------- once-only screens
export const SEEN_FLAGS = ["seenIntro", "seenTraining", "seenPlacement", "seenFlower", "seenBook", "seenTimer", "seenStreak"] as const;
export type SeenFlag = (typeof SEEN_FLAGS)[number];
export function withSeen(save: Save, flag: SeenFlag, on: boolean): CheatSave {
  const s = clone(save) as CheatSave;
  s[flag] = on;
  return s;
}
/** Forget the World Flower trips had (each plays again when its level is next finished) and any trip still due. */
export function withoutTrips(save: Save): CheatSave {
  const s = clone(save) as CheatSave;
  s.flowerSeen = [];
  s.tripDue = null;
  return s;
}

// ---------------------------------------------------------------- import and export
export const exportJson = (s: Save) => JSON.stringify(s, null, 2);
/** Read a pasted save: a whole save, `{ save: … }`, or a partial one (scripts/treadmill/bot.ts save()), laid over a
 *  blank save as store.ts's loadSave does. */
export function parseSave(text: string): { ok: true; save: CheatSave } | { ok: false; error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: `Not JSON: ${(e as Error).message}` };
  }
  const obj = raw && typeof raw === "object" && "save" in raw && typeof (raw as { save: unknown }).save === "object" ? (raw as { save: unknown }).save : raw;
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return { ok: false, error: "Not a save: expected a JSON object" };
  const o = obj as Partial<CheatSave>;
  if (o.v !== undefined && o.v !== 1) return { ok: false, error: `Unknown save version ${String(o.v)}` };
  for (const k of ["stars", "words", "read", "spell", "energy"] as const) if (o[k] !== undefined && (typeof o[k] !== "object" || Array.isArray(o[k]))) return { ok: false, error: `"${k}" should be an object` };
  for (const k of ["petals", "gems", "stickers"] as const) if (o[k] !== undefined && !Array.isArray(o[k])) return { ok: false, error: `"${k}" should be a list` };
  const b = blankSave();
  return { ok: true, save: { ...b, ...o, v: 1, settings: { ...b.settings, ...o.settings }, captionsV2: true } };
}

// ---------------------------------------------------------------- writing it
/**
 * Write a whole save through the store: one store.set (every screen's useSave sees it), then store.flush(), which writes
 * it to localStorage at once and cancels the pending write, so nothing older can be flushed over it on pagehide. With
 * no player selected (a fresh device) a player is made first, or the save would never be written.
 */
export function commit(next: Save) {
  if (!profilesApi.current()) profilesApi.create("Ninja");
  const copy = clone(next);
  store.set((s) => {
    for (const k of Object.keys(s)) delete (s as unknown as Record<string, unknown>)[k];
    Object.assign(s, copy);
  });
  store.flush();
}
/** Apply a pure edit to the current save and commit it. */
export const edit = (f: (s: Save) => Save) => commit(f(store.get()));
