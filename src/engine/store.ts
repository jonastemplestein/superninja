// Persistent game state (localStorage) + a tiny reactive store.
import { useSyncExternalStore } from "react";
import { gpcKey, type Seg, type Word } from "../content/phonics";

export interface Skill { n: number; ok: number; last: number; streak: number }
export interface Save {
  v: 1;
  hero: "kai" | "suki" | null;
  seenIntro: boolean;
  seenTimer?: boolean;
  /** gem energy per spelling→sound key ("ai>ae"); a gem is full at ENERGY_FULL */
  energy: Record<string, number>;
  /** gems won in Gem Trials (spelling→sound keys) */
  gems: string[];
  /** petals placed in the Sound Flower (phoneme ids) */
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
  /** word attempts (for review selection) */
  words: Record<string, { n: number; ok: number; last: number }>;
  petals: string[]; // spellings rescued (shown on Blossom Tree)
  settings: { relaxed: boolean; music: number; captions: boolean; unlockAll: boolean };
  minutes: number;
  sessions: number;
}

// ---------- player profiles: each child has their own save, all kept on this device (localStorage)
export interface Profile { id: string; name: string; hero: "kai" | "suki" | null; created: number; last: number }
const PROFILES = "superninja.profiles.v1";
const LEGACY = "superninja.save.v1";
const saveKey = (id: string) => `superninja.save.${id}`;
const fresh = (): Save => ({
  v: 1, hero: null, seenIntro: false, stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [],
  settings: { relaxed: false, music: 0.32, captions: false, unlockAll: false }, minutes: 0, sessions: 0,
});
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
      return s;
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
/** words collected into the Word Book for the first time during the current level */
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

/** Record a spelling attempt of one sound slot. */
export function recordSpell(seg: Seg, ok: boolean) {
  store.set((s) => {
    bump(s.spell, gpcKey(seg), ok);
    charge(s, gpcKey(seg), ok ? 1 : -0.5);
  });
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
    w.last = Date.now();
  });
}
export function recordWordSpelt(word: Word, ok: boolean) {
  store.set((s) => {
    const w = (s.words[word.text] ??= { n: 0, ok: 0, last: 0 });
    w.n++;
    if (ok && w.ok === 0 && !levelNewWords.includes(word.text)) levelNewWords.push(word.text);
    if (ok) w.ok++;
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
