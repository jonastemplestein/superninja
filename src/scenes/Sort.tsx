// Sorting dojo (Extended Code): same sound, different spellings. A word floats down (Sensei says it) and the child
// taps the chest for the spelling it uses. The word turns green where it is, and the ninja (bottom-left) clenches its
// fists and powers up at once while Sensei sounds the word out: each spelling lights up as it's said and sends a silent
// spark into the ninja's glowing fists. Once the whole word has been said, the ninja lets the power go: a kick, punch,
// shuriken, spin, leap or flip knocks the word spinning into the chest, or a spell lifts it and floats it in. The chest
// gulps it and the word stands up inside with the others. The move's sounds never land on the teaching sounds.
// Words fall faster as you go (timed, but never fails). Layout: src/styles/sort.css and docs/HERO.md.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { LevelProps } from "../App";
import { WORDS, type Word } from "../content/phonics";
import { LINES } from "../content/lines";
import { worldOf, knownSpellings } from "../content/worlds";
import { say, sfx, playMusic, preload, urls, hush, isSpeaking, onCaption, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import { shuffle } from "../engine/learner";
import { recordRead, useSave } from "../engine/store";
import { streak, useStreak, type Tier } from "../engine/streak";
import { img, RoundButton, Icon, Progress, fx, stageRect, Tile, tapProps, useHelp, useIdlePrompt, SenseiDock, isUpright, shakeStage, sleep, useHero } from "../ui/ui";
import { NinjaSpot, ninja, type Move } from "../ui/Ninja";
import "../styles/sort.css";

const ROUNDS = 8;
const TOP0 = 112; // the word's top edge as it appears (just under the top bar)
const FALL = 188; // how far it sinks (its bottom stays above the chests)
const COLS: Record<Tier, string[]> = {
  0: ["#fff4dc", "#ffe38a", "#ffc53d"],
  1: ["#ffe38a", "#ffc53d", "#ff9a3d", "#fff4dc"],
  2: ["#ff7aa2", "#5ec8f2", "#b48cff", "#ffe38a"],
  3: ["#ff5a5a", "#ffb03d", "#ffe94a", "#5fd35f", "#4ab8ff", "#b48cff"],
};
/** The strikes that knock a word in, per streak tier (the ninja's own pools without "cast": a spell is its own way in). */
const POOL: Record<Tier, Move[]> = {
  0: ["kick", "punch", "throw"],
  1: ["kick", "punch", "throw", "spin", "jump"],
  2: ["kick", "spin", "flip", "throw", "jump"],
  3: ["flip", "spin", "kick", "throw"],
};
const SPELL_CHANCE: Record<Tier, number> = { 0: 0.2, 1: 0.25, 2: 0.25, 3: 0.25 };
/** Where the fists are in the "power" (and "ready") sprite, as fractions of the sprite's box. */
const FISTS: Record<string, [number, number][]> = {
  kai: [[0.31, 0.54], [0.91, 0.55]],
  suki: [[0.41, 0.66], [0.91, 0.65]],
};
/** Where a sorted word stands in its chest, by age (0 = the newest): the newest in front, the older ones a row further
 *  back and a step higher each, so every word's letters (and its pink spelling) show above the ones in front. */
function chipAt(rank: number, count: number) {
  const row = Math.ceil(rank / 2); // 0 | 1, 2 | 3, 4
  const first = row === 0 ? 0 : row * 2 - 1;
  const inRow = row === 0 ? 1 : Math.min(2, count - first);
  const side = rank - first;
  const k = Math.min(row, 3);
  return {
    x: inRow === 1 ? 50 : side === 0 ? 26 : 74,
    b: [0, 34, 64, 90][k],
    s: [1, 0.86, 0.76, 0.7][k],
    r: inRow === 1 ? (row % 2 ? 3 : -2) : side === 0 ? -5 : 5,
  };
}
type Pt = { x: number; y: number };
type Mood = "no" | "yum";
const bez = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({ x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y });
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lineText = (id: string) => LINES.find((l) => l.id === id)?.text.replace(/\.\.\.$/, "");
const centre = (el: Element): Pt => {
  const r = stageRect(el);
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};
/** Wait until cond() holds, or ms (game time) have passed. */
async function until(cond: () => boolean, ms: number) {
  const t0 = performance.now();
  while (!cond() && (performance.now() - t0) * FAST < ms) await sleep(40);
}
/** "c... a... t... cat!" (as sayBlend), telling onSeg which spelling is sounding (-1 = the whole word). */
const blend = (w: Word, onSeg: (k: number) => void): Say[] => [{ sounds: w.segs, onSeg, gap: 260 }, { gap: 150 }, { word: w.text }];

/** Send the word element into the chest's opening, shrinking as it goes in, with a sparkle trail.
 *  "knock": off the hit it arcs up and dunks in, spinning a full turn. "spell": it glows, lifts off with a wobble,
 *  then floats over in a high, gentle swoop. Resolves when it's in. */
function flyIn(el: HTMLElement, to: Pt, tier: Tier, style: "knock" | "spell", ms: number): Promise<void> {
  const r = stageRect(el);
  const from = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  const spell = style === "spell";
  const lift = spell ? 56 : 0; // the spell raises it first (the first 28% of the time)
  const start = { x: from.x, y: from.y - lift };
  const c = { x: start.x + (to.x - start.x) * (spell ? 0.45 : 0.55), y: Math.min(start.y, to.y) - (spell ? 170 : 130) - tier * 12 };
  const dir = to.x >= from.x ? 1 : -1;
  const end = Math.min(0.34, 120 / Math.max(1, r.w));
  el.style.animation = "none";
  if (spell) el.style.filter = `drop-shadow(0 0 10px ${COLS[tier][1]}) drop-shadow(0 0 26px ${COLS[tier][0]})`;
  return new Promise((resolve) => {
    const t0 = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    const guard = setTimeout(finish, ms + 400); // setTimeout is FAST-scaled already
    const frame = (now: number) => {
      if (done) return;
      if (!el.isConnected) return finish();
      const t = Math.min(1, ((now - t0) * FAST) / ms);
      let p: Pt, rot: number, s: number;
      if (spell) {
        const L = 0.28;
        if (t < L) {
          const k = easeOut(t / L);
          p = { x: from.x, y: from.y - lift * k };
          rot = Math.sin(k * Math.PI * 2) * 6;
          s = 1 + 0.08 * k;
        } else {
          const k = (t - L) / (1 - L);
          const e = k * k * (3 - 2 * k);
          p = bez(start, c, to, e);
          rot = Math.sin(k * Math.PI * 3) * 9 * (1 - k);
          s = 1.08 - (1.08 - end) * Math.pow(e, 1.4);
        }
        fx.glow(p.x, p.y, COLS[tier], 2, 46 + tier * 6, 1.2, 20);
        if (Math.random() < 0.5) fx.twinkle(p.x, p.y, COLS[tier], 1, 2, 22);
      } else {
        p = bez(from, c, to, t);
        rot = dir * (t < 0.15 ? -14 * (t / 0.15) : -14 + 374 * Math.pow((t - 0.15) / 0.85, 1.3));
        s = 1 - (1 - end) * Math.pow(t, 1.5);
        if (t > 0.04) fx.glow(p.x, p.y, COLS[tier], 1, 38 + tier * 6, 0.6, 16);
        if (tier >= 1 && Math.random() < 0.4) fx.twinkle(p.x, p.y, COLS[tier], 1, 1.5, 20);
      }
      el.style.transform = `translate(${p.x - from.x}px, ${p.y - from.y}px) rotate(${rot}deg) scale(${s})`;
      if (t >= 1) {
        clearTimeout(guard);
        finish();
      } else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

/** A silent spark of power from a letter to the ninja's fist (the target is re-read every frame, so it homes in on
 *  the fist as the ninja breathes). Resolves when it arrives. */
function spark(layer: HTMLElement, a: Pt, to: () => Pt, cols: string[], ms: number, bend: number): Promise<void> {
  const el = document.createElement("div");
  el.className = "so-spark";
  el.innerHTML = `<svg viewBox="0 0 40 40"><path d="M20 2 L24.5 15.5 L38 20 L24.5 24.5 L20 38 L15.5 24.5 L2 20 L15.5 15.5 Z" /></svg>`;
  layer.appendChild(el);
  fx.twinkle(a.x, a.y, cols, 5, 4, 18);
  return new Promise((resolve) => {
    const t0 = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, ((now - t0) * FAST) / ms);
      const b = to();
      const c = { x: (a.x + b.x) / 2 + bend, y: Math.min(a.y, b.y) - 90 };
      const e = t * t * (3 - 2 * t);
      const p = bez(a, c, b, e);
      el.style.translate = `${p.x}px ${p.y}px`;
      el.style.scale = `${1 - 0.35 * t}`;
      if (t > 0.05) fx.glow(p.x, p.y, cols, 2, 30, 0.6, 14);
      if (Math.random() < 0.3) fx.twinkle(p.x, p.y, cols, 1, 1.5, 14);
      if (t >= 1 || !layer.isConnected) {
        el.remove();
        resolve();
      } else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

interface Charge {
  /** a spelling was just said: a spark flies from it to a fist, and the fists glow a little bigger */
  feed(from?: Element): void;
  /** the whole word: every letter sparks at once, the fists blaze and the ninja trembles with power */
  full(from: Element[]): void;
  /** the ninja strikes: the power goes into the move */
  release(): void;
  /** gone at once (leaving the scene) */
  cancel(): void;
}
/** The ninja powers up while Sensei sounds the word out: fists clenched, gritted teeth, a glow gathering in each fist
 *  and a warm light behind. Completely silent, so the sounds of the word are all the child hears. */
function startCharge(layer: HTMLElement | null, power: HTMLElement | null, hero: string, tier: Tier): Charge {
  const cols = COLS[Math.max(1, tier) as Tier];
  const spot = () => layer?.parentElement?.querySelector(".ninja-spot") as HTMLElement | null;
  let level = 0, sent = 0, done = false, gone = false, tremble: Animation | null = null;
  const last: Pt[] = [];
  /** Where fist k is now (null until the ninja is in the fists-clenched pose, e.g. still finishing a "think"). */
  const fist = (k: number): Pt | null => {
    const s = spot();
    const im = s?.querySelector(".nj-img");
    if (s && im && (s.dataset.pose === "power" || s.dataset.pose === "ready")) {
      const r = stageRect(im);
      const f = (FISTS[hero] ?? FISTS.kai)[k];
      last[k] = { x: r.x + r.w * f[0], y: r.y + r.h * f[1] };
    }
    return last[k] ?? null;
  };
  const body = (): Pt => {
    const s = spot();
    if (!s) return { x: 165, y: 500 };
    const r = stageRect(s);
    return { x: r.x + r.w / 2, y: r.y + r.h * 0.55 };
  };
  ninja.pose("power");
  const fists = [0, 1].map(() => {
    const d = document.createElement("div");
    d.className = `so-fist t${tier}`;
    d.innerHTML = "<i></i><i></i><b></b>";
    d.style.scale = "0";
    layer?.appendChild(d);
    return d;
  });
  const grow = () => fists.forEach((d) => (d.style.scale = `${Math.min(1.25, 0.42 + level * 0.1)}`));
  power?.classList.remove("full", "go");
  power?.classList.add("on");
  power?.style.setProperty("--p", "0.25");
  // ignite: a little flare in each fist the moment the chest is tapped
  requestAnimationFrame(() => {
    if (done) return;
    grow();
    fists.forEach((_, k) => {
      const p = fist(k);
      if (p) fx.twinkle(p.x, p.y, cols, 5, 4, 18);
    });
  });
  const track = () => {
    if (gone || !layer?.isConnected) return; // (it keeps following the fists while they flare out on release)
    fists.forEach((d, k) => {
      const p = fist(k);
      d.style.opacity = p ? "1" : "0";
      if (p) d.style.translate = `${p.x}px ${p.y}px`;
    });
    requestAnimationFrame(track);
  };
  track();
  const flash = (k: number) => {
    fists[k]?.querySelector("b")?.animate([{ opacity: 1, scale: "1.5" }, { opacity: 0, scale: "1" }], { duration: 260 / FAST, easing: "ease-out" });
    const im = spot()?.querySelector(".nj-img");
    im?.animate([{ filter: "drop-shadow(0 10px 8px rgba(43,29,20,.28)) brightness(1.45)" }, { filter: "drop-shadow(0 10px 8px rgba(43,29,20,.28)) brightness(1)" }], { duration: 220 / FAST, easing: "ease-out" });
  };
  const send = (el: Element, k: number, bend: number) => {
    if (!layer) return Promise.resolve();
    return spark(layer, centre(el), () => fist(k) ?? body(), cols, 300, bend).then(() => {
      if (done) return;
      level++;
      grow();
      flash(k);
      power?.style.setProperty("--p", `${Math.min(1, 0.25 + level * 0.1)}`);
    });
  };
  return {
    feed(from) {
      if (done || !from) return;
      const k = sent++ % 2;
      void send(from, k, k ? 60 : -60);
    },
    full(from) {
      if (done) return;
      const all = from.map((el, j) => new Promise<void>((r) => setTimeout(() => void send(el, j % 2, (j - from.length / 2) * 30).then(r), j * 40)));
      void Promise.all(all).then(() => {
        if (done) return;
        level = Math.max(level, 8);
        grow();
        power?.classList.add("full");
        power?.style.setProperty("--p", "1");
        const s = spot();
        if (s) {
          const c = body();
          fx.implode(c.x, c.y, cols, 16, 180, 16);
          fx.ring(c.x, c.y, { color: cols[0], r0: 30, r1: 190, width: 10, life: 18 });
          tremble = s.animate([{ translate: "0 0" }, { translate: "2px -1px" }, { translate: "-2px 1px" }, { translate: "1px 1px" }, { translate: "0 0" }], { duration: 130, iterations: Infinity });
        }
      });
    },
    release() {
      if (done) return;
      done = true;
      tremble?.cancel();
      // the glow bursts out of the fists as the move begins (following them), and the power light flares
      fists.forEach((d, k) => {
        const p = last[k];
        if (p) fx.ring(p.x, p.y, { color: cols[0], r0: 16, r1: 90, width: 8, life: 12 });
        d.animate([{ scale: d.style.scale || "1", opacity: 1 }, { scale: "1.35", opacity: 0.9, offset: 0.25 }, { scale: "0.2", opacity: 0 }], { duration: 150 / FAST, easing: "ease-in", fill: "forwards" }).finished.then(
          () => ((gone = true), d.remove()),
          () => ((gone = true), d.remove()),
        );
      });
      power?.classList.remove("full");
      power?.classList.add("go");
      power?.classList.remove("on");
    },
    cancel() {
      done = gone = true;
      tremble?.cancel();
      fists.forEach((d) => d.remove());
      power?.classList.remove("on", "full", "go");
    },
  };
}

/** The chest's face, drawn over its painted eyes (item_chest.webp is 320×312): it blinks now and then, squeezes its
 *  eyes shut ("> <") as it shakes its head, and smiles with its eyes ("^ ^") when it gulps a word. */
function ChestEyes({ mood }: { mood?: Mood }) {
  return (
    <svg className={`so-eyes ${mood ?? ""}`} viewBox="0 0 320 312" aria-hidden="true">
      <ellipse className="lid" cx="175" cy="198" rx="22" ry="21" />
      <ellipse className="lid" cx="242" cy="191" rx="20" ry="22" />
      <path className="shut" d="M157 205 Q175 213 193 205 M226 198 Q242 206 258 198" />
      <path className="yum" d="M157 207 Q175 180 193 207 M225 200 Q242 173 259 200" />
      <path className="nope" d="M160 184 L190 198 L160 212 M257 177 L227 191 L257 205" />
    </svg>
  );
}

export function Sort({ level, onDone, onQuit }: LevelProps) {
  const world = worldOf(level);
  const hero = useHero();
  const relaxed = useSave((s) => s.settings.relaxed);
  const { tier } = useStreak();
  const { sound, spellings } = level.sort!;
  const known = knownSpellings(level);
  const words = useRef<Word[]>(
    shuffle(
      spellings.flatMap((g) =>
        shuffle(WORDS.filter((w) => w.unit <= Math.max(...level.units) && w.segs.some((s) => s.g === g && s.p === sound) && w.segs.filter((s) => s.p === sound).length === 1 && w.segs.every((s) => known.has(s.g)))).slice(0, Math.ceil(ROUNDS / spellings.length)),
      ),
    ).slice(0, ROUNDS),
  ).current;
  const [i, setI] = useState(-1);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const [nope, setNope] = useState<string | null>(null); // the chest that was tapped by mistake (it shakes its head)
  const [gone, setGone] = useState(false); // the word has left for its chest
  const [lit, setLit] = useState<number | null>(null); // the spelling being sounded out (-1: the whole word; null: not blending)
  const [baskets, setBaskets] = useState<Record<string, Word[]>>(Object.fromEntries(spellings.map((g) => [g, []])));
  const [shine, setShine] = useState<Record<string, number>>({});
  const [moods, setMoods] = useState<Record<string, Mood | undefined>>({});
  const [helpLvl, setHelpLvl] = useState(0);
  const alive = useRef(true); // false once the child has left: nothing may carry on after that
  const timers = useRef<number[]>([]);
  const misses = useRef(0);
  const missedThis = useRef(false); // a wrong try on this word: its right answer is no longer a streak hit
  const hintUntil = useRef(-1); // after a miss, the pink "look here" shows on that word and the next one
  const busy = useRef(false);
  const frozen = useRef(false); // stop the fall while Sensei explains, and once the word is sorted
  const said = useRef(false); // the word has been said (it only starts falling then)
  const lineGate = useRef<Promise<void> | null>(null); // a streak line the next word waits for
  const wordGate = useRef<Promise<void> | null>(null); // (the same, for the word on screen)
  const helpQueued = useRef(false); // Help was pressed mid-move: help with the next word once it's said
  const recentMoves = useRef<Move[]>([]);
  const lastWay = useRef<Move | null>(null);
  const charge = useRef<Charge | null>(null);
  const phase = useRef<"charge" | "strike" | null>(null); // (for the bots and review films)
  const moodTimers = useRef<Record<string, number>>({});
  const chestRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const mouthRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const wordRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const chargeRef = useRef<HTMLDivElement>(null);
  const powerRef = useRef<HTMLDivElement>(null);
  const w = words[i];
  const spellingOf = (w: Word) => w.segs.find((s) => s.p === sound && spellings.includes(s.g))!.g;
  /** A one-off timeout that's cleared (and never runs) once the child has left. */
  const later = (fn: () => void, ms: number) => void timers.current.push(window.setTimeout(() => alive.current && fn(), ms));

  useEffect(() => {
    alive.current = true;
    let live = true;
    playMusic("dojo");
    preload([...words.map((w) => urls.word(w.text)), ...new Set(words.flatMap((w) => w.segs.map((s) => urls.sound(s.p))))]);
    streak.reset();
    spellings.forEach((_, k) => later(() => sfx.pop(), 330 + k * 160));
    (async () => {
      await say([{ line: "sort_start" }, { gap: 200 }, { sound }, { gap: 300 }, { line: "same_sound_diff" }]);
      if (live && alive.current) setI(0);
    })();
    return () => {
      live = false;
      alive.current = false;
      timers.current.forEach(clearTimeout);
      Object.values(moodTimers.current).forEach(clearTimeout);
      charge.current?.cancel();
      ninja.pose(null);
      hush();
    };
  }, []);

  // new word: it pops in, Sensei says it (after any streak line the ninja is saying) and it starts falling (the fall
  // pauses while the phone is upright or Sensei is explaining, and stops once it's sorted)
  useEffect(() => {
    if (i < 0 || i >= words.length) return;
    setResult(null);
    setNope(null);
    setGone(false);
    setLit(null);
    missedThis.current = false;
    frozen.current = false;
    said.current = false;
    let live = true;
    const gate = (wordGate.current = lineGate.current);
    lineGate.current = null;
    const sayIt = setTimeout(async () => {
      if (gate) await gate;
      if (!live || !alive.current || busy.current) return;
      said.current = true;
      await say({ word: words[i].text });
      if (!live || !alive.current || busy.current || !helpQueued.current) return;
      helpQueued.current = false;
      help(1);
    }, 320);
    if (relaxed) return () => void ((live = false), clearTimeout(sayIt));
    const dur = 9000 - i * 500;
    let t = 0, last = performance.now(), raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(100, now - last) * FAST;
      last = now;
      if (!frozen.current && said.current && !isUpright()) t += dt;
      const f = Math.min(1, t / dur);
      if (wordRef.current) wordRef.current.style.top = `${TOP0 + f * FALL}px`;
      if (f < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      live = false;
      clearTimeout(sayIt);
      cancelAnimationFrame(raf);
    };
  }, [i]);

  /** A happy little hop (the chest that was just picked, or all of them cheering at the end). */
  const hop = (g: string, h = 16) =>
    chestRefs.current[g]?.animate(
      [
        { translate: "0 0", scale: "1" },
        { translate: `0 -${h}px`, scale: "0.95 1.07", offset: 0.4 },
        { translate: "0 0", scale: "1.05 0.95", offset: 0.75 },
        { translate: "0 0", scale: "1" },
      ] as Keyframe[],
      { duration: 340, easing: "ease-out" },
    );

  /** A chest pulls a face for a moment. */
  const face = (g: string, m: Mood, ms: number) => {
    clearTimeout(moodTimers.current[g]);
    setMoods((s) => ({ ...s, [g]: m }));
    moodTimers.current[g] = window.setTimeout(() => setMoods((s) => ({ ...s, [g]: undefined })), ms);
  };

  const mouthOf = (g: string): Pt => centre(mouthRefs.current[g] ?? document.body);

  /** The chest gulps the word: squash and stretch, a happy squint, light spills out, petals and sparkles, and the
   *  word stands up inside. */
  function land(g: string, word: Word, t: Tier, big: boolean) {
    const chest = chestRefs.current[g];
    const m = mouthOf(g);
    sfx.coin();
    sfx.place();
    chest?.animate(
      [
        { scale: "1", filter: "brightness(1)" },
        { scale: "1.13 0.84", filter: "brightness(1.35)", offset: 0.18 },
        { scale: "0.94 1.1", filter: "brightness(1.1)", offset: 0.45 },
        { scale: "1.03 0.98", offset: 0.72 },
        { scale: "1", filter: "brightness(1)" },
      ] as Keyframe[],
      { duration: 520, easing: "ease-out" },
    );
    face(g, "yum", 900);
    setShine((s) => ({ ...s, [g]: (s[g] ?? 0) + 1 }));
    fx.burst(m.x, m.y - 10, "petals", 10 + t * 4, 0.8);
    fx.twinkle(m.x, m.y - 20, COLS[t], 10 + t * 3, 7 + t);
    fx.ring(m.x, m.y, { color: COLS[t][0], r0: 20, r1: 120 + t * 24, width: 10, life: 20 });
    if (t >= 1) fx.burst(m.x, m.y - 20, "stars", 3 + t * 2, 0.8);
    if (big) {
      sfx.boom();
      shakeStage();
      fx.ring(m.x, m.y, { color: "#fff", r0: 30, r1: 260, width: 14, life: 26 });
      fx.burst(m.x, m.y - 30, "confetti", 30, 1.1);
    }
    setBaskets((b) => ({ ...b, [g]: [...b[g], word] }));
  }

  /** Which move sends this word in: a kick to open, a big flip to close, otherwise a strike from the streak tier's
   *  pool and now and then a spell, never the same as either of the last two. */
  function pickMove(finale: boolean, t: Tier): Move {
    const recent = recentMoves.current;
    let m: Move;
    if (finale) m = recent.includes("flip") ? "kick" : "flip";
    else if (i === 0) m = "kick";
    else if (!recent.includes("cast") && Math.random() < SPELL_CHANCE[t]) m = "cast";
    else {
      const pool = POOL[t].filter((x) => !recent.includes(x));
      m = pool[(Math.random() * pool.length) | 0] ?? POOL[t][0];
    }
    recent.push(m);
    if (recent.length > 2) recent.shift();
    lastWay.current = m;
    return m;
  }

  /** The ninja lets its power go and sends the word into chest g. Resolves once it has landed. */
  async function sendIn(g: string, word: Word, finale: boolean, c: Charge) {
    const box = wordRef.current, panel = panelRef.current;
    const t = streak.tier;
    if (!box || !panel) {
      c.cancel();
      ninja.pose(null);
      return land(g, word, t, finale);
    }
    const move = pickMove(finale, t);
    phase.current = "strike";
    const hit = move === "cast" ? ninja.act("cast", panel, { react: false }) : ninja.strike(panel, { move });
    ninja.pose(null); // (after the move has begun, so the fists-clenched pose goes straight into the move)
    c.release();
    await hit;
    if (!alive.current) return;
    await flyIn(box, mouthOf(g), t, move === "cast" ? "spell" : "knock", move === "cast" ? 520 : finale ? 500 : 400);
    if (!alive.current) return;
    setGone(true);
    land(g, word, t, finale);
  }

  /** Resolves once the ninja has said its streak line ("Ninja power!"), or if it hasn't started within 1.6 s. */
  function lineDone(id: string): Promise<void> {
    const text = lineText(id);
    if (!text) return Promise.resolve();
    let heard = false;
    const off = onCaption((c) => void (c && c.text.includes(text) && (heard = true)));
    const t0 = performance.now();
    return until(() => !alive.current || (heard && !isSpeaking()) || (!heard && (performance.now() - t0) * FAST > 1600), 5000).then(off);
  }

  async function wrongChest(g: string, w: Word) {
    busy.current = true;
    frozen.current = true;
    said.current = true;
    misses.current++;
    missedThis.current = true;
    hintUntil.current = i + 1;
    setResult("wrong");
    setNope(g);
    face(g, "no", 900);
    hush();
    const m = mouthOf(g);
    fx.puff(m.x, m.y + 10, 8);
    const e = streak.miss(); // the ninja has a little think by itself when a streak was going
    if (e.prevN < 3) sfx.wrong(); // (a lost streak of 3+ gets the ninja's soft fizzle instead)
    if (e.prevN === 0 && !ninja.busy) void ninja.act("think");
    if (e.prevN >= 3 && lineText("streak_lost")) {
      // "Keep going, ninja!" comes from the ninja at the first quiet moment: let it through, then carry on
      await until(() => !alive.current || isSpeaking(), 900);
      await until(() => !alive.current || !isSpeaking(), 3000);
      await sleep(150);
    } else await sleep(320);
    if (!alive.current) return;
    await say([{ line: "listen" }, { word: w.text }, { gap: 200 }, ...blend(w, setLit)]);
    if (!alive.current) return;
    setLit(null);
    setNope(null);
    setResult(null);
    frozen.current = false;
    busy.current = false;
  }

  const choose = async (g: string) => {
    if (!w || result || busy.current) return;
    const right = spellingOf(w) === g;
    recordRead(w, right);
    if (!right) return wrongChest(g, w);
    busy.current = true;
    frozen.current = true;
    said.current = true;
    setResult("right"); // the word turns green where it is
    sfx.good();
    hop(g);
    const finale = i + 1 >= words.length;
    const retry = missedThis.current;
    // the ninja powers up while the word is sounded out: each spelling lights up as it's said and sends a spark
    const c = (charge.current = startCharge(chargeRef.current, powerRef.current, hero, streak.tier));
    phase.current = "charge";
    // a streak line still to come or being said ("Wow! Super ninja streak!") finishes first, while the ninja charges
    if (wordGate.current) await wordGate.current;
    if (!alive.current) return;
    const letters = () => [...(panelRef.current?.querySelectorAll(".so-letters > span") ?? [])];
    const onSeg = (k: number) => {
      if (!alive.current) return;
      setLit(k);
      if (k >= 0) c.feed(letters()[k]);
      else c.full(letters());
    };
    // after a miss it was just sounded out: this time the whole word lights up and is said once
    if (retry) {
      onSeg(-1);
      await say([{ gap: 120 }, { word: w.text }]);
    } else await say([{ gap: 120 }, ...blend(w, onSeg)]);
    if (!alive.current) return;
    // then the ninja sends it into the chest (the move's sounds never land on the teaching sounds)
    await sendIn(g, w, finale, c);
    charge.current = phase.current = null;
    if (!alive.current) return;
    let tierUp = false;
    if (!retry) {
      const e = streak.hit(); // the ninja powers up by itself on a new tier and says its line at the next quiet moment
      tierUp = e.tierUp;
      if (tierUp) lineGate.current = lineDone(`streak_${[0, 3, 6, 10][e.tier]}`);
    }
    if (!finale) {
      // the next word pops straight in (it's said once the streak line, if any, is over)
      busy.current = false;
      setI(i + 1);
      return;
    }
    if (tierUp) {
      await lineGate.current;
      await until(() => !alive.current || !ninja.busy, 1600);
      if (!alive.current) return;
    }
    fx.rain("confetti", 60);
    // the chests cheer too: a hop, a happy squint and a sparkle each, left to right, while the ninja celebrates
    spellings.forEach((cg, k) =>
      later(() => {
        hop(cg, 26);
        face(cg, "yum", 1200);
        const m = mouthOf(cg);
        fx.twinkle(m.x, m.y - 20, COLS[1], 10, 7);
        sfx.pop();
      }, 900 + k * 150),
    );
    await Promise.all([say({ line: "sort_done" }), ninja.celebrate()]);
    if (!alive.current) return;
    onDone(misses.current <= 1 ? 3 : misses.current <= 3 ? 2 : 1);
  };

  /** Sensei heard you (Help or the speaker pressed while he's busy): his button nods and the word bounces. */
  const heard = () => {
    document.querySelector(".help-btn")?.animate(
      [
        { rotate: "0deg", translate: "0 0" },
        { rotate: "-10deg", translate: "0 -12px", offset: 0.25 },
        { rotate: "8deg", translate: "0 -4px", offset: 0.55 },
        { rotate: "0deg", translate: "0 0" },
      ],
      { duration: 520, easing: "ease-out" },
    );
    const p = panelRef.current;
    if (!p || gone) return;
    p.animate([{ scale: "1" }, { scale: "1.1", offset: 0.3 }, { scale: "0.97", offset: 0.65 }, { scale: "1" }] as Keyframe[], { duration: 420, easing: "ease-out" });
    const r = stageRect(p);
    fx.ring(r.x + r.w / 2, r.y + r.h / 2, { color: "#ffe38a", r0: r.w * 0.3, r1: r.w * 0.75, width: 12, life: 18 });
    fx.twinkle(r.x + r.w / 2, r.y + r.h / 2, COLS[1], 8, 6, 20);
  };
  /** Help with the word on screen: first the word and what to do, then Sensei shows where to look. */
  const help = (n: number) => {
    if (!w) return;
    setHelpLvl(n);
    say(n === 1 ? [{ word: w.text }, { gap: 200 }, { line: "help_sort" }] : [{ line: "help_look" }, { word: w.text }]);
  };

  // a child who hasn't tapped for a while hears the word again
  useIdlePrompt(!!w && !result, 10000, () => w && say([{ line: "listen" }, { word: w.text }]), [i]);
  useEffect(() => setHelpLvl(0), [i]);
  useHelp(
    (n) => {
      if (!w) return;
      if (busy.current) {
        // Sensei is already sounding it out: he shows he heard, and helps with the next word if this one is done
        heard();
        if (result === "right" && i + 1 < words.length) helpQueued.current = true;
        return;
      }
      help(n);
    },
    [i],
  );
  // where to look is a hint (after a miss, for that word and the next, or a help press), not given away up front;
  // once sorted, it shows why
  const showWhere = i <= hintUntil.current || helpLvl >= 1 || result === "right";
  const target = (s: Word["segs"][number]) => s.p === sound && spellings.includes(s.g);
  (window as any).__snState = { scene: "sort", next: w ? spellingOf(w) : null, busy: !!result, i, last: i === words.length - 1, streak: streak.n, lit, hint: showWhere, get said() { return said.current; }, get phase() { return phase.current; }, get way() { return lastWay.current; } };
  return (
    <div className={`scene so-scene tier-${tier} n${spellings.length}`}>
      <img className="bg-img" src={img(`bg_${world.key}`)} alt="" />
      <div className="vignette" />
      {/* the chests' eyelids (wood, darker under the brow); an SVG with display:none would drop the gradient */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <linearGradient id="so-lid" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#7e3a22" />
            <stop offset="0.35" stopColor="#a15d36" />
            <stop offset="1" stopColor="#b8703d" />
          </linearGradient>
        </defs>
      </svg>
      <div className="topbar">
        <RoundButton sm label="map" onClick={onQuit}><Icon.home /></RoundButton>
        <div className="spacer" />
        <Progress value={Math.max(0, i) / words.length} />
        <div className="spacer" />
        <RoundButton sm label="Hear the word" onClick={() => w && (busy.current ? heard() : say({ word: w.text }))}><Icon.speaker /></RoundButton>
      </div>
      {w && (
        <div key={w.text} ref={wordRef} className={`so-word ${gone ? "gone" : ""}`} style={{ top: TOP0 }}>
          <div className="drop-in">
            <div ref={panelRef} className={`so-panel ${result === "wrong" ? "no" : result === "right" ? "yes" : ""} ${lit !== null ? "blend" : ""}`}>
              {w.pic && <img src={img(`pic_${w.text}`)} alt="" />}
              <span className="so-letters">
                {w.segs.map((s, k) => {
                  const on = lit === k || lit === -1;
                  return (
                    <span key={k} className={`${showWhere && target(s) ? "hl" : ""} ${on ? "lit" : ""} ${lit === k ? "now" : ""}`}>
                      {s.g}
                      <i className={`sb ${s.g === "x" ? "two" : s.g.length > 1 ? "bar" : "dot"} ${on ? "lit" : ""}`} />
                    </span>
                  );
                })}
              </span>
            </div>
          </div>
        </div>
      )}
      <div className={`so-chests n${spellings.length}`}>
        {spellings.map((g, k) => (
          <div key={g} className={`so-chest ${nope === g ? "no" : ""}`} style={{ "--k": k } as CSSProperties}>
            <button ref={(el) => void (chestRefs.current[g] = el)} {...tapProps(() => choose(g))} aria-label={`basket ${g}`}>
              <div key={shine[g] ?? 0} className={`so-shine ${shine[g] ? "on" : ""}`} />
              <img className="so-art" src={img("item_chest")} alt="" draggable={false} />
              <div className="so-loot">
                {baskets[g].map((bw, k) => {
                  const count = baskets[g].length;
                  const rank = count - 1 - k; // 0 = the newest
                  const at = chipAt(rank, count);
                  return (
                    <span key={bw.text} className={`so-chip ${rank === 0 ? "new" : ""}`} style={{ "--x": `${at.x}%`, "--b": `${at.b}px`, "--s": at.s, "--r": `${at.r}deg`, "--z": 9 - rank } as CSSProperties}>
                      {bw.segs.map((s, j) => (
                        <span key={j} className={target(s) ? "hl" : undefined}>{s.g}</span>
                      ))}
                    </span>
                  );
                })}
              </div>
              <img className="so-art front" src={img("item_chest")} alt="" draggable={false} />
              <ChestEyes mood={moods[g]} />
              <div ref={(el) => void (mouthRefs.current[g] = el)} className="so-mouth" />
              <div className="so-label">
                <Tile g={g} state={result === "right" && w && spellingOf(w) === g ? "right" : nope === g ? "wrong" : helpLvl >= 2 && w && spellingOf(w) === g ? "hint" : ""} />
              </div>
            </button>
          </div>
        ))}
      </div>
      <div ref={powerRef} className="so-power" />
      <NinjaSpot />
      <div ref={chargeRef} className="so-charge" />
      <SenseiDock />
    </div>
  );
}
