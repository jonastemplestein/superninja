import { emptyFoundations, observeFoundation, type Foundations, type FoundationObservation } from "../core/learner/foundations";
// Persistent game state (localStorage) + a tiny reactive store.
import { useSyncExternalStore } from "react";
import { gpcKey, WORDS, type Seg, type Word } from "../content/phonics";

export interface Skill { n: number; ok: number; last: number; streak: number }
/** The child's school year, from the opt-in (docs/FIRST_MINUTES.md §4). "unset": a save from before the opt-in. */
export type SchoolYear = "none" | "unsure" | "R" | "Y1" | "Y2" | "unset";
/** Where the game started the child: the warm-ups, or a school start point (the check can drop it one band). */
export type Band = "W" | "R" | "Y1" | "Y2";
/** The first session's chain: lesson 1 → Reward 1 → lesson 2 → Reward 2 → the map (App.tsx). */
export interface FirstSession { lessons: [string, string]; step: number }
export interface Save {
  /** Separate direct assessments from guided/unassessed speaking practice. */
  foundations?: Foundations;
  v: 1;
  hero: "kai" | "suki" | null;
  seenIntro: boolean;
  seenTimer?: boolean;
  /** gem energy per spelling→sound key ("ai>ae"); a gem is full at ENERGY_FULL */
  energy: Record<string, number>;
  /** gems won in Gem Trials (spelling→sound keys) */
  gems: string[];
  /** petals placed in the World Flower (phoneme ids) */
  placed: string[];
  /** starting point chosen by Sensei's placement game (level id); earlier levels are open */
  placedAt?: string;
  seenPlacement?: boolean;
  seenFlower?: boolean;
  seenTraining?: boolean;
  seenBook?: boolean;
  /** stars per level id (1-3) */
  stars: Record<string, number>;
  /** GPC mastery: key "g>p" → reading / spelling skill */
  read: Record<string, Skill>;
  spell: Record<string, Skill>;
  /** word attempts (for review selection); `met`: when the child first met it as a picture (a picture sticker) */
  words: Record<string, { n: number; ok: number; last: number; met?: number }>;
  petals: string[]; // spellings rescued (shown on the World Flower)
  settings: { relaxed: boolean; music: number; captions: boolean; unlockAll: boolean };
  minutes: number;
  sessions: number;
  // ---- first minutes (docs/FIRST_MINUTES.md)
  /** from the opt-in, or the grown-ups' settings; `schoolYearAt` is when it was set (for the September moving-up) */
  schoolYear?: SchoolYear;
  schoolYearAt?: number;
  band?: Band;
  /** the Sticker Book, in the order the stickers were collected (word ids: "sun", "fishdog") */
  stickers: string[];
  /** shiny (holographic) stickers: the fish-dog, the moving-up sticker */
  shiny: string[];
  /** set while the first session's lessons are chained (null once it has reached the map) */
  firstSession?: FirstSession | null;
  /** automatic moves, for the grown-ups ("Started at Year One; moved to Reception after the first check") */
  adjustLog: { at: number; text: string }[];
  /** per warm-up stone: first-try answers out of the child's own ("you do") answers, for pace (§10) */
  warmups?: Record<string, { first: number; total: number; repeated?: boolean }>;
  /** World Flower trips already had (src/engine/gems.ts) */
  flowerSeen?: string[];
  /** the first streak has been explained ("Three right answers in a row! ...", src/engine/streak.ts) */
  seenStreak?: boolean;
}

// ---------- player profiles: each child has their own save, all kept on this device (localStorage)
export interface Profile { id: string; name: string; hero: "kai" | "suki" | null; created: number; last: number }
const PROFILES = "superninja.profiles.v1";
const LEGACY = "superninja.save.v1";
const saveKey = (id: string) => `superninja.save.${id}`;
const fresh = (): Save => ({
  v: 1, foundations: emptyFoundations(), hero: null, seenIntro: false, stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [],
  settings: { relaxed: false, music: 0.32, captions: false, unlockAll: false }, minutes: 0, sessions: 0,
  stickers: [], shiny: [], adjustLog: [],
});
/** The grown-ups' adjust log keeps its newest entries only (store.set clones the whole save on every call). */
export const ADJUST_LOG_MAX = 200;
/** Saves from before the first-minutes work (no `stickers`): the school year is "unset", every word already read or
 *  spelt becomes a sticker (in teaching order), and a child with progress skips the new warm-up stones (they start
 *  at w1-2, the first level after them; the warm-ups stay open on the map). */
function migrate(parsed: any, s: Save): Save {
  if (Array.isArray(parsed.stickers)) return s;
  s.schoolYear = parsed.schoolYear ?? "unset";
  s.stickers = WORDS.filter((w) => (s.words[w.text]?.ok ?? 0) > 0).map((w) => w.text);
  s.shiny = [];
  s.adjustLog = [];
  if (!s.placedAt && Object.entries(s.stars).some(([id, n]) => n > 0 && !id.startsWith("w1-wu"))) s.placedAt = "w1-2";
  return s;
}
const lsGet = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const lsSet = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

function readProfiles(): { list: Profile[]; current: string | null } {
  let data: { list: Profile[]; current: string | null } = { list: [], current: null };
  try {
    const raw = lsGet(PROFILES);
    if (raw) data = JSON.parse(raw);
  } catch {}
  // a single save from older versions (or written by test tools) becomes a profile of its own
  const legacy = lsGet(LEGACY);
  if (legacy) {
    const id = "p" + Date.now().toString(36);
    let hero: Profile["hero"] = null;
    try {
      hero = JSON.parse(legacy).hero ?? null;
    } catch {}
    lsSet(saveKey(id), legacy);
    try {
      localStorage.removeItem(LEGACY);
    } catch {}
    data = { list: [...data.list, { id, name: "Ninja", hero, created: Date.now(), last: Date.now() }], current: id };
    lsSet(PROFILES, JSON.stringify(data));
  }
  return data;
}
let profiles = readProfiles();
const writeProfiles = () => lsSet(PROFILES, JSON.stringify(profiles));

function loadSave(id: string | null): Save {
  if (!id) return fresh();
  try {
    const raw = lsGet(saveKey(id));
    if (raw) {
      const parsed = JSON.parse(raw);
      const s = { ...fresh(), ...parsed, settings: { ...fresh().settings, ...(parsed.settings ?? {}) } };
      if (!s.captionsV2) {
        s.settings.captions = false;
        (s as any).captionsV2 = true;
      }
      if (Array.isArray(s.adjustLog) && s.adjustLog.length > ADJUST_LOG_MAX) s.adjustLog = s.adjustLog.slice(-ADJUST_LOG_MAX);
      return migrate(parsed, s);
    }
  } catch {}
  return fresh();
}

let state: Save = loadSave(profiles.current);
const listeners = new Set<() => void>();
let saveTimer: number | undefined;
const notify = () => listeners.forEach((l) => l());
function persist() {
  const id = profiles.current;
  if (!id) return;
  lsSet(saveKey(id), JSON.stringify(state));
  const p = profiles.list.find((x) => x.id === id);
  if (p) {
    p.hero = state.hero;
    p.last = Date.now();
    writeProfiles();
  }
}

/** write any pending save now (before reloads, and when the page is hidden or closed) */
function flush() {
  if (saveTimer === undefined) return;
  clearTimeout(saveTimer);
  saveTimer = undefined;
  persist();
}
addEventListener("pagehide", flush);
document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());

export const store = {
  get: () => state,
  flush,
  set(fn: (s: Save) => void) {
    const next = structuredClone(state);
    fn(next);
    state = next;
    notify();
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      saveTimer = undefined;
      persist();
    }, 200);
  },
  /** wipe the current player's progress */
  reset() {
    state = fresh();
    persist();
    notify();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => void listeners.delete(l);
  },
};

export const profilesApi = {
  list: () => profiles.list.slice().sort((a, b) => b.last - a.last),
  current: () => profiles.list.find((p) => p.id === profiles.current) ?? null,
  create(name: string): Profile {
    const p: Profile = { id: "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: name.trim().slice(0, 16) || "Ninja", hero: null, created: Date.now(), last: Date.now() };
    profiles.list.push(p);
    profiles.current = p.id;
    writeProfiles();
    state = fresh();
    persist();
    notify();
    return p;
  },
  select(id: string) {
    clearTimeout(saveTimer);
    persist();
    profiles.current = id;
    writeProfiles();
    state = loadSave(id);
    const p = profiles.list.find((x) => x.id === id);
    if (p) p.last = Date.now();
    writeProfiles();
    notify();
  },
  remove(id: string) {
    profiles.list = profiles.list.filter((p) => p.id !== id);
    try {
      localStorage.removeItem(saveKey(id));
    } catch {}
    if (profiles.current === id) {
      profiles.current = null;
      state = fresh();
    }
    writeProfiles();
    notify();
  },
};

export function useSave<T>(sel: (s: Save) => T): T {
  return useSyncExternalStore(store.subscribe, () => sel(store.get()));
}

// ---------- gem energy
export const ENERGY_FULL = 8;
/** energy gained during the current level, for the reward screen */
export const levelGains: Record<string, number> = {};
/** words collected into the Sticker Book for the first time during the current level */
export const levelNewWords: string[] = [];
export function resetLevelGains() {
  levelNewWords.length = 0;
  for (const k of Object.keys(levelGains)) delete levelGains[k];
}
function charge(s: Save, key: string, delta: number) {
  if (s.gems.includes(key)) return;
  const v = Math.max(0, Math.min(ENERGY_FULL, (s.energy[key] ?? 0) + delta));
  if (delta > 0) levelGains[key] = (levelGains[key] ?? 0) + (v - (s.energy[key] ?? 0));
  s.energy[key] = v;
}

// ---------- learning records
function bump(map: Record<string, Skill>, key: string, ok: boolean) {
  const s = (map[key] ??= { n: 0, ok: 0, last: 0, streak: 0 });
  s.n++;
  if (ok) {
    s.ok++;
    s.streak++;
  } else s.streak = 0;
  s.last = Date.now();
}

// ---------- attempts: the first answers at a school start point are the check (docs/FIRST_MINUTES.md §10)
type AttemptFn = (ok: boolean) => void;
const attemptSubs = new Set<AttemptFn>();
/** Hear every recorded answer (a spelt sound, a word read or spelt). Returns an unsubscribe function. */
export function onAttempt(fn: AttemptFn) {
  attemptSubs.add(fn);
  return () => void attemptSubs.delete(fn);
}
const attempted = (ok: boolean) => attemptSubs.forEach((f) => f(ok));
/** A child's own answer in a game that records nothing else (the warm-ups' picture games). */
export const noteAttempt = (ok: boolean) => attempted(ok);

// ---------- stickers (the Sticker Book: docs/FIRST_MINUTES.md §6)
/** A word joins the Sticker Book (once), at the end: stickers are kept in the order they were collected. */
function addSticker(s: Save, w: string) {
  s.stickers ??= [];
  if (!s.stickers.includes(w)) s.stickers.push(w);
}
/** A picture the child met in a lesson (named, then played with): it becomes a picture sticker. Returns true if new. */
export function recordMet(w: string, shiny = false): boolean {
  let fresh = false;
  store.set((s) => {
    const rec = (s.words[w] ??= { n: 0, ok: 0, last: 0 });
    rec.met ??= Date.now();
    fresh = !s.stickers?.includes(w);
    addSticker(s, w);
    if (shiny && !(s.shiny ??= []).includes(w)) s.shiny.push(w);
  });
  return fresh;
}
/** A line for the grown-ups' log of automatic moves. */
export function logAdjust(text: string) {
  store.set((s) => {
    const log = (s.adjustLog ??= []);
    log.push({ at: Date.now(), text });
    if (log.length > ADJUST_LOG_MAX) log.splice(0, log.length - ADJUST_LOG_MAX);
  });
}

/** Record a spelling attempt of one sound slot. */
export function recordSpell(seg: Seg, ok: boolean) {
  store.set((s) => {
    bump(s.spell, gpcKey(seg), ok);
    charge(s, gpcKey(seg), ok ? 1 : -0.5);
  });
  attempted(ok);
}
/** Record reading a whole word (credits/blames each GPC). */
export function recordRead(word: Word, ok: boolean) {
  store.set((s) => {
    for (const seg of word.segs) {
      bump(s.read, gpcKey(seg), ok);
      charge(s, gpcKey(seg), ok ? 0.5 : -0.25);
    }
    const w = (s.words[word.text] ??= { n: 0, ok: 0, last: 0 });
    w.n++;
    if (ok && w.ok === 0 && !levelNewWords.includes(word.text)) levelNewWords.push(word.text);
    if (ok) w.ok++;
    if (ok) addSticker(s, word.text); // a word read becomes a (gold) word sticker
    w.last = Date.now();
  });
  attempted(ok);
}
export function recordWordSpelt(word: Word, ok: boolean) {
  store.set((s) => {
    const w = (s.words[word.text] ??= { n: 0, ok: 0, last: 0 });
    w.n++;
    if (ok && w.ok === 0 && !levelNewWords.includes(word.text)) levelNewWords.push(word.text);
    if (ok) w.ok++;
    if (ok) addSticker(s, word.text);
    w.last = Date.now();
  });
}

/** Mastery estimate 0..1 with a Beta(1,1) prior and a little forgetting. */
export function mastery(sk: Skill | undefined): number {
  if (!sk) return 0;
  const p = (sk.ok + 1) / (sk.n + 2);
  const days = (Date.now() - sk.last) / 864e5;
  const decay = Math.exp(-days / (7 + sk.streak * 4));
  return p * (0.6 + 0.4 * decay) * Math.min(1, sk.n / 4 + 0.25);
}

/** Shared pure model; each child's profile persists independently with the rest of the save. */
export function recordFoundation(observation: FoundationObservation) {
  store.set(s => { s.foundations = observeFoundation(s.foundations, observation, Date.now(), String(s.sessions)); });
}
