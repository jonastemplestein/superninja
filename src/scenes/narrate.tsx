// The narrative audit's runtime for the level scenes (docs/NARRATIVE_AUDIT.md). The rules and the lines are data in
// src/content/narrative.ts; this file keeps the per-save ledger of which explanations a child has heard IN FULL (so a
// level restart doesn't repeat a long introduction, and spaced reminders come back on schedule), and draws the two
// pictures that go with explanations: a gem filling up (the first time the child's answers fill one) and a gold arrow
// sweeping left to right ("Ninjas read this way!").
//
// The ledger lives in the child's save (`narr`, per profile, wiped with the save). It is a stopgap until the core's
// director and ledger (docs/ARCHITECTURE.md §6) take over dosage; the keys are the notions the audit names.
import { useEffect, useState, useSyncExternalStore } from "react";
import { store, levelGains, ENERGY_FULL, type Save } from "../engine/store";
import { LEVELS, type Level } from "../content/worlds";
import { PHONEMES, gpcKey, type Seg } from "../content/phonics";
import { STRETCHED } from "../content/stretch";
import { canBe, sameSpelling } from "../content/teach";
import { due, told, lettersLine, lettersKey, otherSound, twoSoundsKey, type Exposure, type Spacing } from "../content/narrative";
import { say, sfx, type Say } from "../engine/audio";
import { correction, isListenLead } from "../engine/feedback";
import { gemByKey, energyOf } from "../engine/gems";
import { GemIcon } from "../ui/Gem";
import { FAST } from "../engine/fast";
import { fx, fxDom, stageRect } from "../ui/ui";
import { holdNext, type Anchor } from "../ui/nav";

// ---------------------------------------------------------------- the ledger
type Ledger = Record<string, Exposure>;
type WithLedger = Save & { narr?: Ledger };
const ledger = (): Ledger => (store.get() as WithLedger).narr ?? {};
/** Has the child heard this explanation in full at least once? */
export const heardBefore = (key: string) => (ledger()[key]?.n ?? 0) > 0;
/** How many times (a count of events, e.g. Gem Trials run out of hearts, uses the same ledger). */
export const timesHeard = (key: string) => ledger()[key]?.n ?? 0;

/** The level being played: its place in LEVELS (a review or Gem Trial counts as the level it follows), and how many
 *  reminders of each kind it has had. */
const cur = { index: 0, family: new Map<string, number>() };
/** Call at the start of every level (during the scene's first render, before its children ask anything). */
export function beginLevel(l: Level) {
  const i = LEVELS.findIndex((x) => x.id === l.id);
  const up = l.upTo ? LEVELS.findIndex((x) => x.id === l.upTo) : -1;
  cur.index = i >= 0 ? i : up >= 0 ? up : LEVELS.length;
  cur.family.clear();
}

/** A kind of reminder, capped per level so a level full of two-letter spellings doesn't turn into a lecture. */
export type Family = { name: string; cap: number };
export const LETTERS: Family = { name: "letters", cap: 2 };

/** Is this explanation due now? */
export function isDue(key: string, spacing: Spacing, family?: Family): boolean {
  if (family && (cur.family.get(family.name) ?? 0) >= family.cap) return false;
  return due(ledger()[key], cur.index, spacing);
}
/** Record that an explanation has been heard in full (call it once its say() has resolved true). */
export function heard(key: string, family?: Family) {
  if (family) cur.family.set(family.name, (cur.family.get(family.name) ?? 0) + 1);
  store.set((s) => {
    const l = ((s as WithLedger).narr ??= {});
    l[key] = told(l[key], cur.index);
  });
}
/** Say an explanation if it is due, and record it only if it was heard in full. Resolves true if it was said. */
export async function explain(key: string, spacing: Spacing, items: Say[], family?: Family): Promise<boolean> {
  if (!isDue(key, spacing, family)) return false;
  const ok = await say(items);
  if (ok) heard(key, family);
  return ok;
}

// ---------------------------------------------------------------- what to say
/** "It's two letters, but it's one sound." (teach.ts wording); < x >: "This spelling is two sounds together!" /k/ /s/. */
export function lettersSay(seg: Pick<Seg, "g" | "p">): Say[] {
  const id = lettersLine(seg);
  if (!id) return [];
  return seg.g === "x" ? [{ line: id }, { gap: 250 }, { sound: "k" }, { gap: 220 }, { sound: "s" }] : [{ line: id }];
}
/** A two-letter (or three-letter, or < x >) reminder for one of a word's spellings, if one is due: the slot to light
 *  and what to say. Call `done()` once it has been heard. */
export function lettersReminder(segs: readonly Seg[]): { i: number; say: Say[]; done: () => void } | null {
  for (const [i, seg] of segs.entries()) {
    if (!lettersLine(seg)) continue;
    const key = lettersKey(seg.g);
    if (!isDue(key, "concept", LETTERS)) continue;
    return { i, say: lettersSay(seg), done: () => heard(key, LETTERS) };
  }
  return null;
}
/** "This can be /th/, but in this word, it's /dh/." for a word with a two-sound spelling, when due. */
export function twoSoundsReminder(segs: readonly Seg[]): { i: number; say: Say[]; done: () => void } | null {
  for (const [i, seg] of segs.entries()) {
    const other = otherSound(seg);
    if (!other) continue;
    const key = twoSoundsKey(seg.g);
    if (!isDue(key, "concept", LETTERS)) continue;
    return { i, say: canBe(other, seg.p), done: () => heard(key, LETTERS) };
  }
  return null;
}
/** Concept 4 at the teaching moment: "The same spelling can sometimes be /th/ (thin) ...and sometimes /dh/ (this)." */
export const sameSpellingSay = (g: string, first: Seg["p"], then: Seg["p"]): Say[] => sameSpelling(g, first, then).say;

/** A spelling correction (engine/feedback.ts, whose "listen again" leads rotate) where a second listening correction
 *  in the same word is just "Listen..." and the word: the child already knows the drill. `word` identifies the word
 *  being spelt (any object that is the same for the whole word and new for the next one). */
let listenedIn: unknown = null;
export function correctionFor(g: string, need: Seg, text: string, attempt: number, word: unknown): Say[] {
  const c = correction(g, need, text, attempt);
  const lead = c[0];
  if (!lead || !("line" in lead) || !isListenLead(lead.line)) return c;
  if (listenedIn === word) return [{ line: "listen" }, { gap: 120 }, ...c.slice(2)];
  listenedIn = word;
  return c;
}
/** Help for a child who is spelling a word: the whole word again (stretched where we have it), and a question about
 *  the slot they're on. Never the word's sounds one by one: that would do the segmenting for them. */
export const spellingHelp = (word: string): Say[] => [{ line: STRETCHED.has(word) ? "audit_spelling_help" : "audit_spelling_help_plain" }, { gap: 150 }, { stretch: word }];

// ---------------------------------------------------------------- pictures: a gem filling up
type GemShow = { id: number; g: string; colour: string; from: number; to: number; x: number; y: number };
let gemShow: GemShow | null = null;
const subs = new Set<() => void>();
const setGem = (g: GemShow | null) => {
  gemShow = g;
  subs.forEach((f) => f());
};
let gemN = 0;
/**
 * The first time the child's right answers fill a gem (once per save, NARRATIVE_AUDIT F04): the gem for one of the
 * word's spellings pops up from where they answered, its ring fills, and Sensei says what it is. It is a held step
 * (docs/NAVIGATION.md §5.0): the gem stays up and the level waits on the green Next arrow; Hear it again pops the gem
 * again, fills it and says the line again; the gem's sound picture sits beside it. `at` is where it appears (stage px).
 * Resolves after Next, or once the screen is left (at once if it isn't due or there's no gem to show).
 * A timed scene must stop its clock while this runs (the Ninja Run's world stops; Gem Trials never explain gems).
 * `navAt: "column"`: Hear it again and Next in the right-hand column, for a screen whose targets fill the nav row.
 */
export async function explainGemEnergy(seg: Seg | undefined, at: { x: number; y: number }, alive: () => boolean = () => true, o: { navAt?: Anchor } = {}): Promise<void> {
  if (!seg || !isDue("gem-energy", "once")) return;
  const key = gpcKey(seg);
  const gem = gemByKey(key);
  if (!gem || store.get().gems.includes(key)) return;
  const to = energyOf(key);
  const from = Math.max(0, to - (levelGains[key] ?? 0) / ENERGY_FULL);
  const show = () => {
    setGem({ id: ++gemN, g: gem.g, colour: PHONEMES[gem.p]?.colour ?? "#ffc53d", from, to: Math.max(to, from + 0.1), x: at.x, y: at.y });
    sfx.sparkle();
    fx.twinkle(at.x, at.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 10, 7, 24);
  };
  let inFull = false;
  const tell = async () => {
    const ok = await say({ line: "audit_gem_first" });
    if (ok && !inFull) (inFull = true), heard("gem-energy");
  };
  show();
  await tell();
  // hold on the gem until the child taps Next (nothing moves on by itself); Hear it again shows and says it again
  if (alive()) await holdNext("gem-energy", () => (show(), tell()), { sound: gem.p, at: o.navAt });
  setGem(null);
}

/** Mount once in each level scene: draws the narrative's pictures (never takes taps). */
export function NarrOverlay() {
  const g = useSyncExternalStore(
    (f) => (subs.add(f), () => void subs.delete(f)),
    () => gemShow,
  );
  const [full, setFull] = useState(false);
  useEffect(() => {
    setFull(false);
    if (!g) return;
    const t = setTimeout(() => setFull(true), 380);
    return () => clearTimeout(t);
  }, [g?.id]);
  if (!g) return null;
  const S = 150;
  return (
    <div key={g.id} className="pop-in" aria-hidden="true" style={{ position: "absolute", left: g.x - S / 2, top: g.y - S / 2, width: S, height: S, pointerEvents: "none", zIndex: 60, filter: "drop-shadow(0 6px 10px rgba(43,29,20,.35))" }}>
      <GemIcon g={g.g} colour={g.colour} state="charging" energy={full ? g.to : g.from} size={S} />
    </div>
  );
}

// ---------------------------------------------------------------- pictures: an arrow at a slot
/** A gold arrow just under a slot, pointing up at it (put it inside the slot, which is position: relative): the
 *  sounds that sit together, or the slot Help is asking about. Never tappable. */
export function SlotPointer() {
  return (
    <i
      aria-hidden="true"
      style={{
        position: "absolute", left: "50%", bottom: -58, translate: "-50% 0", width: 0, height: 0, pointerEvents: "none", zIndex: 3,
        borderLeft: "26px solid transparent", borderRight: "26px solid transparent", borderBottom: "38px solid var(--gold)",
        filter: "drop-shadow(0 -3px 0 var(--ink)) drop-shadow(0 3px 0 var(--ink))", animation: "bob 1s ease-in-out infinite",
      }}
    />
  );
}

// ---------------------------------------------------------------- pictures: "Ninjas read this way!"
const ARROW = `<svg viewBox="0 0 64 44" width="64" height="44"><path d="M6 22 H44 M34 8 L54 22 L34 36" fill="none" stroke="#2b1d14" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 22 H44 M34 8 L54 22 L34 36" fill="none" stroke="#ffc53d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
/** A gold arrow glides under `el` from its left edge to its right, trailing sparkles. Resolves on arrival. */
export function sweepUnder(el: Element | null | undefined, ms = 1300): Promise<void> {
  const layer = fxDom();
  const r = stageRect(el ?? null);
  if (!layer || !r.w) return Promise.resolve();
  const d = document.createElement("div");
  d.setAttribute("aria-hidden", "true");
  d.style.cssText = "position:absolute;left:0;top:0;width:64px;height:44px;pointer-events:none;z-index:40";
  d.innerHTML = ARROW;
  layer.appendChild(d);
  const y = r.y + r.h + 26;
  const x0 = r.x - 20, x1 = r.x + r.w - 44;
  const t0 = performance.now();
  return new Promise((resolve) => {
    const frame = (now: number) => {
      const t = Math.min(1, ((now - t0) * FAST) / ms);
      const e = t * t * (3 - 2 * t);
      const x = x0 + (x1 - x0) * e;
      d.style.transform = `translate(${x}px, ${y - 22}px)`;
      d.style.opacity = `${Math.min(1, t * 6, (1 - t) * 8 + 0.2)}`;
      if (Math.random() < 0.5) fx.twinkle(x + 10, y, ["#fff4dc", "#ffe38a"], 1, 2, 16);
      if (t < 1 && d.isConnected) requestAnimationFrame(frame);
      else {
        d.remove();
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}
/** "Ninjas read this way!" with the arrow sweeping under `el`, when the left-to-right reminder is due (once per
 *  world: NARRATIVE_AUDIT F10, the first reading in each land). Resolves true if it was said. */
export async function readThisWay(el: Element | null | undefined, world: number): Promise<boolean> {
  const key = `left-right:w${world}`;
  if (!isDue(key, "once")) return false;
  const [ok] = await Promise.all([say({ line: "fm_l2_way" }), sweepUnder(el)]);
  if (ok) heard(key);
  return ok;
}
