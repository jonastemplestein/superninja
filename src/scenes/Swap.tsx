// Sound Swap: Baron Muddle has muddled the words. Change ONE sound to make the next word (hat → hot → hop …).
// Tap the sound that must change: the ninja kicks it out of the word, the picture goes wobbly, and the new spellings
// pop up. Choose the new one: a spell carries it in under the word and it shoots up into the gap, the picture turns into
// the new word, and a star bonks Baron. At the end he runs away. Trains phoneme manipulation. Layout: docs/HERO.md
// (ninja bottom-left, Sensei bottom-right; the word, its picture and the choices sit in the middle, Baron top-right).
// Streak: first-try taps (the sound to change, then the new spelling) are hits; the new spelling counts once the fixed
// word has been blended, so a tier-up's shout comes after the child hears their word. A tier-up or a lost streak makes
// the ninja say a line; the scene stays quiet until it has (see streakLineSaid).
// Nothing ever covers the new letter or the new picture: their sparkles burst out from BEHIND them (Halo).
// Explanations (docs/NARRATIVE_AUDIT.md, ./narrate.tsx): the right sound picked, Sensei names its place ("Yes, the
// first sound changes!"), spaced per save; a fixed word can bring a spaced "two letters, one sound" reminder about its
// new spelling, with that spelling lit; the first fixed word of a save shows its gem filling up.
// Navigation (docs/NAVIGATION.md §5.D): Home is the nav layer's (top-left). "Hear the target word" beside the card is
// the screen's Hear it again: once the question has been asked it says it again (on the first word with what the game
// is, "Baron Muddle has mixed up these words!..." and "This is... mat"); once the old sound is out, "Now pick the new
// sound." (or the place line, "Yes, the first sound changes!") and the word to make.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { LevelProps } from "../App";
import type { Word } from "../content/phonics";
import { knownSpellings, worldOf, type Level } from "../content/worlds";
import { LINES } from "../content/lines";
import { say, sayBlend, sfx, playMusic, preload, urls, hush, onCaption, isSpeaking, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import { swapChain, shuffle } from "../engine/learner";
import { WORD_BY_TEXT, GRAPHEMES } from "../content/phonics";
import { recordRead, recordSpell } from "../engine/store";
import { streak, tierLineId, type StreakEvent } from "../engine/streak";
import { SenseiDock, Tile, img, Progress, fx, stageRect, sleep, useHelp, useBaronOnScreen } from "../ui/ui";
import { WordCardAgain } from "./Dojo";
import { NinjaSpot, ninja, type Move } from "../ui/Ninja";
import { pickPraise, correction } from "../engine/feedback";
import { positionName, SWAP_POSITION_LINE } from "../content/narrative";
import { NarrOverlay, beginLevel, explainGemEnergy, heard, isDue, lettersReminder, twoSoundsReminder } from "./narrate";
import { useLessonClock } from "../engine/lessonClock";
import { useNav, ReplayButton, TopBar } from "../ui/nav";
import "../styles/swap.css";

function fixedChain(ws: string[]) {
  const w = ws.map((t) => WORD_BY_TEXT[t]);
  // only single-sound swaps (same number of sounds); a length change starts a new mini-chain
  return w
    .slice(1)
    .map((to, i) => ({ from: w[i], to, pos: to.segs.findIndex((s, k) => s.g !== w[i].segs[k]?.g) }))
    .filter((c) => c.from.segs.length === c.to.segs.length && c.pos >= 0);
}
/** A random chain: the best of 16 by how many of its words have a picture (the picture turning into the new word is the
 *  scene's payoff; a word without one is a speaker card) and how many are the level's own words (so the pull towards
 *  pictured words never drifts it back to easier units). A full-length chain always wins first. Takes ~2-15 ms, once. */
function pictureChain(level: Level) {
  const score = (c: ReturnType<typeof swapChain>) =>
    c.length && c.length * 100 + [c[0].from, ...c.map((x) => x.to)].reduce((n, w) => n + (w.pic ? 1 : 0) + (level.units.includes(w.unit) ? 1 : 0), 0);
  let best = swapChain(level, 5), top = score(best);
  for (let k = 1; k < 16; k++) {
    const c = swapChain(level, 5), sc = score(c);
    if (sc > top) (best = c), (top = sc);
  }
  return best;
}

// The ninja's moves. Knocking the old spelling out is a kick or a strike (the first one of a level is the signature
// spin kick); bonking Baron after a word is fixed arcs high over the word (shuriken, spells, stars), so it never
// looks like the word is being hit again. Both grow with the streak tier.
const KNOCK: Move[][] = [
  ["spin", "kick", "punch"],
  ["spin", "kick", "punch", "jump"],
  ["kick", "spin", "flip"],
  ["flip", "kick", "spin"],
];
const BONK: Move[][] = [["throw", "cast"], ["throw", "jump", "cast"], ["cast", "throw", "jump"], ["cast", "flip", "throw"]];
function pickMove(pool: Move[], last: { current: Move | null }) {
  const opts = pool.filter((m) => m !== last.current);
  const m = opts[(Math.random() * opts.length) | 0] ?? pool[0];
  last.current = m;
  return m;
}
/** How long the new spelling takes to shoot up from under the word into its gap (see swap-rise in swap.css). */
const RISE_MS = 190;
/** ...and until it has settled (the squash and stretch of swap-rise is done), when the word is blended: the child sees
 *  the new letter, still and uncovered, as its sound is said. The card turning and the sparkles fill this beat. */
const SETTLE_MS = RISE_MS + 260;
/** A little four-pointed star (viewBox -50 -50 100 100), like the fx twinkles. */
const STAR4 = "M0-48 L11-11 L48 0 L11 11 L0 48 L-11 11 L-48 0 L-11-11Z";
const HALO_COLS = ["#fff4dc", "#ffe38a", "#ffc53d", "#ff9ec0"];
/** A burst of stars and a shockwave from BEHIND something (the new letter, the new picture): it sits under it in the
 *  stacking order, so the stars only show around its edges and never cover what the child needs to see. `rx`/`up`/`down`
 *  are how far the stars fly (px from the centre, sideways / up / down); `ring` is the shockwave's starting shape (half
 *  width, half height, corner radius: the thing's own outline, so it starts hidden behind it); `delay` is when (ms). */
function Halo({ n = 12, rx, up, down, ring, delay = 0, className = "" }: { n?: number; rx: number; up: number; down: number; ring: [number, number, number]; delay?: number; className?: string }) {
  const stars = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const a = ((i + Math.random() * 0.6) / n) * Math.PI * 2;
        const k = 0.78 + Math.random() * 0.34;
        const sy = Math.sin(a);
        return { x: Math.cos(a) * rx * k, y: sy * (sy < 0 ? up : down) * k, s: 26 + Math.random() * 20, d: delay + Math.random() * 110, c: HALO_COLS[i % HALO_COLS.length], r: Math.round(Math.random() * 90) };
      }),
    [],
  );
  return (
    <div className={`swap-halo ${className}`} style={{ "--rw": `${ring[0]}px`, "--rh": `${ring[1]}px`, "--rr": `${ring[2]}px`, "--d": `${delay}ms` } as CSSProperties} aria-hidden="true">
      {stars.map((st, i) => (
        <svg key={i} viewBox="-50 -50 100 100" style={{ "--x": `${st.x.toFixed(0)}px`, "--y": `${st.y.toFixed(0)}px`, "--s": `${st.s.toFixed(0)}px`, "--d": `${st.d.toFixed(0)}ms`, "--r": `${st.r}deg` } as CSSProperties}>
          <path d={STAR4} fill={st.c} stroke="#2b1d14" strokeWidth="12" strokeLinejoin="round" paintOrder="stroke" />
        </svg>
      ))}
    </div>
  );
}
/** Word tile size: longer words get smaller tiles, so the word fits between the ninja and the help corner, and its
 *  sound buttons stay above even a three-line caption bubble (y 435). */
const tileSize = (n: number) => (n <= 3 ? 132 : n === 4 ? 120 : 104);
// the picture card (stage px); the word, the card and the choices share one centre line (x 640, see swap.css)
const CARD = { left: 515, top: 84, width: 250, height: 172 };
/** Baron's muddle magic over the picture: an Archimedean spiral (viewBox 0 0 200 200). */
const SPIRAL = (() => {
  let d = "";
  for (let t = 0; t <= Math.PI * 6; t += 0.18) {
    const r = 3 + t * 4.9;
    d += `${d ? " L" : "M"}${(100 + r * Math.cos(t)).toFixed(1)} ${(100 + r * Math.sin(t)).toFixed(1)}`;
  }
  return d;
})();
/** The muddle's swirl. It spins on its HTML wrapper, which the compositor turns (an animation on the SVG itself would be
 *  repainted on the main thread every frame). */
function Swirl({ className = "" }: { className?: string }) {
  return (
    <i className={`swap-spin ${className}`}>
      <svg viewBox="0 0 200 200">
        <path d={SPIRAL} fill="none" stroke="#2b1d14" strokeWidth="15" strokeLinecap="round" opacity="0.45" />
        <path d={SPIRAL} fill="none" stroke="#b48cff" strokeWidth="9" strokeLinecap="round" />
        <path d={SPIRAL} fill="none" stroke="#efe0ff" strokeWidth="3" strokeLinecap="round" strokeDasharray="10 16" />
      </svg>
    </i>
  );
}
const VOWELS = ["a", "e", "i", "o", "u", "ai", "ay", "ee", "ea", "igh", "ie", "oa", "ow"];

/** The ninja says the streak lines itself ("Ninja power!" on a tier-up, "Keep going, ninja!" when a streak of 3 or more
 *  is lost; src/ui/Ninja.tsx), at the first quiet moment (280 ms) within a few seconds of the hit or miss. Any say() of
 *  ours in that window would cut it off. So, straight after such a hit or miss, the scene goes quiet and waits for the
 *  line to be said (or to clearly not be coming), and only then speaks again. Call it at the moment of the hit or miss:
 *  it has to be listening before the line starts. Resolves true if the line was said. */
function streakLineSaid(e: StreakEvent | null): Promise<boolean> {
  if (!e) return Promise.resolve(false);
  const id = e.tierUp ? tierLineId(e.tier) : e.type === "miss" && e.prevN >= 3 ? "streak_lost" : null;
  const text = id && ninja.mounted ? LINES.find((l) => l.id === id)?.text : undefined;
  if (!text) return Promise.resolve(false);
  hush(); // the child has acted, so whatever was being said is moot, and the line needs a quiet moment
  const key = text.replace(/\.\.\.$/, "").slice(0, 10);
  const within = e.type === "miss" ? 5000 : 4000; // how long the ninja keeps waiting for quiet
  return new Promise((resolve) => {
    const t0 = performance.now();
    let started = false, quietSince = -1, done = false;
    const finish = () => {
      if (done) return;
      done = true;
      off();
      clearInterval(iv);
      resolve(started);
    };
    const off = onCaption((c) => {
      const mine = !!c && c.text.startsWith(key);
      if (!started && mine) started = true;
      else if (started && !mine) finish(); // said (or cut off by something else)
    });
    const iv = window.setInterval(() => {
      const t = (performance.now() - t0) * FAST; // game ms
      if (started) return void (t > within + 6000 && finish());
      // quiet for far longer than the ninja's 280 ms, or past its window: the line isn't coming
      if (isSpeaking()) quietSince = -1;
      else if (quietSince < 0) quietSince = t;
      else if (t - quietSince > 1000) finish();
      if (t > within + 400) finish();
    }, 50);
  });
}
/** Resolves once the ninja has stopped moving (a tier-up's power-up follows straight on from the kick that earned it),
 *  or after `max` ms. */
function ninjaSettled(max = 2400): Promise<void> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    let still = 0;
    const iv = window.setInterval(() => {
      still = ninja.busy ? 0 : still + 1;
      if (still >= 2 || (performance.now() - t0) * FAST > max) {
        clearInterval(iv);
        resolve();
      }
    }, 50);
  });
}

export function Swap({ level, onDone }: LevelProps) {
  useState(() => beginLevel(level)); // (during the first render)
  const world = worldOf(level);
  const [chain] = useState(() => (level.chain ? fixedChain(level.chain) : pictureChain(level)));
  const timeUp = useLessonClock(level);
  const early = !!level.chain;
  const [step, setStep] = useState(0);
  /** the sound the child picked to change (only ever the right one) */
  const [picked, setPicked] = useState<number | null>(null);
  /** ...and the ninja has kicked it out: a gap waits for the new spelling, and the choices are up */
  const [knocked, setKnocked] = useState(false);
  /** the old spelling, spinning away */
  const [flyG, setFlyG] = useState<string | null>(null);
  /** the new spelling on its way into the gap (its choice tile hides) */
  const [carried, setCarried] = useState<string | null>(null);
  /** the tile that just landed (squash and glow) */
  const [landed, setLanded] = useState(-1);
  const [wrongPos, setWrongPos] = useState<number | null>(null);
  const [wrongG, setWrongG] = useState<string | null>(null);
  const [shown, setShown] = useState<Word>(chain[0]?.from);
  const [lit, setLit] = useState(-1);
  const [busy, setBusy] = useState(true);
  const [baron, setBaron] = useState<"idle" | "bonk" | "flee">("idle");
  const misses = useRef(0);
  const stepMisses = useRef(0);
  const posMisses = useRef(0);
  const gMisses = useRef(0);
  const gapW = useRef(150);
  const gapRef = useRef<HTMLDivElement>(null);
  /** where the new spelling shoots up from (px below the gap) and its size there (the choice tile's, relative) */
  const riseFrom = useRef({ dy: 206, scale: 0.91 });
  const baronRef = useRef<HTMLDivElement>(null);
  const baronT = useRef(0);
  const lastKnock = useRef<Move | null>(null);
  const lastBonk = useRef<Move | null>(null);
  /** After the knock that earned a tier, the choices are up while the ninja powers up ("power": a tap is kept, see
   *  pending) and then shouts about it ("line": a tap casts the spell straight away, and the word is blended once the
   *  shout is over, see lineWait). */
  const lock = useRef<"power" | "line" | "miss" | null>(null);
  /** the right choice tapped during the power-up: it is kept (and glows) and cast as soon as the power-up is done (a
   *  wrong one gets its gentle miss once the power-up and its shout are over: "miss") */
  const pending = useRef<{ g: string; el: HTMLElement } | null>(null);
  /** the tier-up shout that a spell cast during it must let finish before the blend */
  const lineWait = useRef<Promise<unknown> | null>(null);
  const [queued, setQueued] = useState<string | null>(null);
  const alive = useRef(true);
  const s = chain[step];
  useBaronOnScreen();

  const options = useRef<Record<number, string[]>>({});
  if (s && !options.current[step]) {
    const known = [...knownSpellings(level)];
    const need = s.to.segs[s.pos].g;
    const old = s.from.segs[s.pos].g;
    const vowelSlot = VOWELS.includes(need);
    const same = known.filter((g) => g !== need && g !== old && VOWELS.includes(g) === vowelSlot);
    const want = early ? 1 : 3;
    const others = shuffle(same).slice(0, want);
    // never a one-tile "choice": short of other spellings (unit 1 has only a and i), the old one is the distractor, which
    // is the listening contrast itself (sat → sit: a or i?)
    if (others.length < want && old !== need) others.push(old);
    options.current[step] = shuffle([need, ...others]);
  }

  // what Hear it again says: this step's question (on the first step with the game's introduction), and once the old
  // sound is out, the line that asked for the new one
  const told = useRef<{ ask: Say[]; pick: Say[] }>({ ask: [], pick: [] });
  /** Say something the child needs for this step, and keep it for Hear it again (`fresh`: a new step). */
  const tell = (items: Say[], fresh = false) => {
    told.current.ask = fresh || !told.current.ask.length ? [...items] : [...told.current.ask, { gap: 300 }, ...items];
    return say(items);
  };
  useEffect(() => {
    alive.current = true;
    streak.reset();
    playMusic(world.music);
    preload(chain.flatMap((c) => [urls.word(c.from.text), urls.word(c.to.text)]));
    new Image().src = img("baron_defeated");
    (async () => {
      await tell([{ line: "swap_start" }, { gap: 200 }, { line: "this_is" }, { word: chain[0].from.text }], true);
      await ask(0);
    })();
    return () => {
      alive.current = false;
      clearTimeout(baronT.current);
      hush();
    };
  }, []);

  const ask = async (i: number) => {
    setBusy(true);
    setLanded(-1);
    const c = chain[i];
    told.current.pick = [];
    if (i > 0) {
      setShown(c.from);
      told.current.ask = [];
      if (c.from !== chain[i - 1].to) await tell([{ line: "this_is" }, { gap: 100 }, { word: c.from.text }], true);
    }
    await tell(
      early
        ? [{ line: "swap_make" }, { gap: 100 }, { word: c.to.text }, { gap: 300 }, { stretch: c.from.text }, { gap: 350 }, { stretch: c.to.text }, { gap: 250 }, { line: "what_changed" }]
        : [{ line: "swap_make" }, { gap: 100 }, { word: c.to.text }, { gap: 200 }, { line: "swap_which" }],
    );
    if (alive.current) setBusy(false);
  };
  /** Hear it again (the speaker and the hear-card): this step's question as it was asked (the first step's with the
   *  introduction); once the old sound is out, the line that asked for the new one and the word to make. Once the
   *  question has been asked, and not while the ninja is kicking the old sound out or fixing the word. */
  const hear = () => {
    if (busy || !s || (picked !== null && !knocked)) return;
    if (knocked) return say([...told.current.pick, ...(told.current.pick.length ? [{ gap: 250 }] : []), { line: "swap_make" }, { gap: 100 }, { word: s.to.text }]);
    return say(told.current.ask);
  };
  useNav({ again: hear, againAt: "own" });

  /** A star (or a spell) bonks Baron Muddle: he sulks. The last one sends him packing. It arcs high over the picture and
   *  the word (the curve's control point is up above the stage, left of the card), so it never looks as if the ninja
   *  were hitting the word it has just fixed. */
  const bonkBaron = (final: boolean) => {
    const el = baronRef.current;
    if (!el) return Promise.resolve();
    const move: Move = final ? (streak.tier >= 2 ? "flip" : "jump") : pickMove(BONK[streak.tier], lastBonk);
    const b = stageRect(el);
    const via = { x: 450, y: (4 * 30 - 500 - (b.y + b.h / 2)) / 2 };
    return ninja.act(move, el, { via }).then(() => {
      if (!alive.current) return;
      clearTimeout(baronT.current);
      const r = stageRect(el);
      if (final) {
        setBaron("flee");
        sfx.whoosh();
        fx.puff(r.x + r.w / 2, r.y + r.h * 0.85, 12);
      } else {
        setBaron("bonk");
        fx.twinkle(r.x + r.w * 0.45, r.y + r.h * 0.2, ["#fff4dc", "#ffe38a", "#b48cff"], 6, 4, 22);
        baronT.current = window.setTimeout(() => alive.current && setBaron("idle"), 1400);
      }
    });
  };

  /** "Now pick the new sound." Where the child can use the name of the sound's place, Sensei says it first ("Yes, the
   *  last sound changes! Now pick the new sound."): each place in up to three levels (first, middle, last are
   *  explained in the warm-ups and early lessons; this is their practice in use). */
  const sayPick = async () => {
    const name = s ? positionName(s.pos, s.from.segs.length) : null;
    const key = name ? `position:${name}` : null;
    if (!name || !key || !isDue(key, "concept")) {
      told.current.pick = [{ line: "swap_pick" }];
      return void say({ line: "swap_pick" });
    }
    heard(key); // (counted as soon as it starts: a quick child taps the new sound over it, and has used the idea)
    told.current.pick = [{ line: SWAP_POSITION_LINE[name] }];
    void say({ line: SWAP_POSITION_LINE[name] });
  };

  const tapPos = async (i: number, el: HTMLElement) => {
    if (busy || !s || picked !== null) return;
    if (i === s.pos) {
      sfx.pop();
      setPicked(i);
      const size = tileSize(s.from.segs.length);
      gapW.current = Math.max(size, Math.round(stageRect(el).w));
      const first = posMisses.current === 0;
      // strike first, then count it: a tier-up's power-up then waits for this kick to land
      const move: Move = step === 0 && first ? "spin" : pickMove(KNOCK[streak.tier], lastKnock);
      lastKnock.current = move;
      const impact = ninja.act(move, el, { react: false });
      const e = first ? streak.hit() : null;
      const tierUp = !!e?.tierUp;
      const lineSaid = streakLineSaid(e);
      await Promise.race([impact, sleep(1500)]);
      if (!alive.current) return;
      // the old spelling spins away, the picture goes wobbly, and the new spellings pop up
      setFlyG(s.from.segs[i].g);
      setKnocked(true);
      sfx.whoosh();
      // "Now pick the new sound." as the choices land, so the words come with the tiles they are about
      if (!tierUp) window.setTimeout(() => alive.current && lock.current === null && void sayPick(), 350);
      if (tierUp) {
        // this kick powered the ninja up: the choices spring in while the power-up plays and the ninja shouts about it.
        // A spell now would cut the power-up short, so a choice tapped meanwhile is kept (it glows: "got it") and cast
        // the moment the power-up is done. Once it is, a tap casts at once; either way the blend waits for the shout to
        // end, and there is no "Now pick the new sound."
        lock.current = "power";
        lineWait.current = lineSaid;
        setBusy(true);
        await ninjaSettled();
        if (!alive.current || (lock.current as string) === "miss") return; // a wrong choice meanwhile has taken over
        const p = pending.current;
        pending.current = null;
        if (p) {
          lock.current = null;
          return void chooseNew(p.g, p.el);
        }
        lock.current = "line";
        await lineSaid;
        if (!alive.current || lock.current !== "line") return; // a tap during the shout has cast the spell (or missed)
        lock.current = null;
        lineWait.current = null;
        setBusy(false);
        void sayPick();
      }
    } else {
      misses.current++;
      stepMisses.current++;
      posMisses.current++;
      const lineSaid = streakLineSaid(streak.miss());
      setWrongPos(i);
      sfx.wrong();
      setBusy(true);
      await lineSaid; // "Keep going, ninja!" when a streak of 3 or more is lost
      if (!alive.current) return;
      // "That's /h/ — /h/ stays the same. Listen: hat... hot."
      await say([{ line: "thats" }, { sound: s.from.segs[i].p }, { gap: 100 }, { line: "stays_same" }, { gap: 250 }, { line: "listen" }, { word: s.from.text }, { gap: 250 }, { word: s.to.text }], { reveal: true });
      if (!alive.current) return;
      setWrongPos(null);
      setBusy(false);
    }
  };

  const tapNew = (g: string, el: HTMLElement) => {
    if (!knocked || carried || !s) return;
    if (lock.current === "miss") return;
    const right = g === s.to.segs[s.pos].g;
    if ((lock.current === "power" || lock.current === "line") && !right) {
      // a wrong choice while the ninja powers up or shouts about it: never the "got it" glow; it turns pink at once,
      // and its gentle miss follows when the shout is over (so "Ninja power!" isn't cut off mid-word)
      lock.current = "miss";
      pending.current = null;
      setQueued(null);
      setWrongG(g);
      sfx.wrong();
      void ninja.linesDone().then(() => {
        if (!alive.current) return;
        lineWait.current = null;
        void chooseNew(g, el, true);
      });
      return;
    }
    if (lock.current === "power") {
      // the ninja is still powering up: keep the (right) choice and show it was heard
      pending.current = { g, el };
      setQueued(g);
      sfx.twinkle();
      return;
    }
    if (lock.current === "line") {
      // powered up and still shouting about it: cast now (the blend waits for the shout)
      lock.current = null;
      return void chooseNew(g, el);
    }
    if (busy) return;
    void chooseNew(g, el);
  };
  /** The child has chosen a new spelling (straight from a tap, or kept from a tap during a power-up). `shown`: a wrong
   *  choice already marked (see tapNew). */
  const chooseNew = async (g: string, el: HTMLElement, shown = false) => {
    if (!s) return;
    setQueued(null);
    const need = s.to.segs[s.pos];
    if (g === need.g) {
      recordSpell(need, stepMisses.current === 0);
      recordRead(s.to, stepMisses.current === 0);
      setBusy(true);
      const first = gMisses.current === 0;
      // a spell carries the new spelling up into the gap. A quick child can tap while the choices are still springing
      // in: settle them first, so the spell carries a full-size copy
      el.closest(".swap-choice")?.getAnimations().forEach((a) => a.finish());
      // The spell carries it across UNDER the word, to just below the gap, and it shoots up into place from there, so
      // the glowing copy never passes over (and hides) the sounds the child is reading. The spell's arrival sparkle stays
      // down there: the tile leaves it at full speed (swap-rise), long before it blooms.
      const gr = gapRef.current ? stageRect(gapRef.current) : { x: 574, y: 270, w: 132, h: 132 };
      const gapC = { x: gr.x + gr.w / 2, y: gr.y + gr.h / 2 };
      const below = { x: gapC.x, y: gr.y + gr.h + 140 };
      riseFrom.current = { dy: below.y - gapC.y, scale: stageRect(el).w / tileSize(s.to.segs.length) || 1 };
      const arrive = ninja.carry(el, below, { react: false });
      setCarried(g);
      await Promise.race([arrive, sleep(1600)]);
      if (!alive.current) return;
      // it lands: the new spelling shoots up into the gap (stars and a shockwave burst out from behind it, see Halo), the
      // word is whole again, and the picture turns over into the new word (stars from behind the card)
      setShown(s.to);
      setLanded(s.pos);
      setPicked(null);
      setKnocked(false);
      setFlyG(null);
      setCarried(null);
      window.setTimeout(() => alive.current && sfx.pop(), RISE_MS);
      sfx.petal();
      // the blend waits for the new letter to be still: the child sees it, uncovered, as its sound is said (and for a
      // tier-up shout that is still going, so it isn't cut off)
      await Promise.all([sleep(SETTLE_MS), lineWait.current]);
      lineWait.current = null;
      if (!alive.current) return;
      await sayBlend(s.to.segs, s.to.text, setLit);
      if (!alive.current) return;
      // a spaced reminder about the new spelling (or another of the word's), with it lit: "It's two letters, but
      // it's one sound." (narrate.tsx says when one is due)
      const seg = s.to.segs[s.pos];
      const own = twoSoundsReminder([seg]) ?? lettersReminder([seg]);
      const remind = own ? { ...own, i: s.pos } : (twoSoundsReminder(s.to.segs) ?? lettersReminder(s.to.segs));
      if (remind) {
        setLit(remind.i);
        if (await say([{ gap: 200 }, ...remind.say])) remind.done();
        if (!alive.current) return;
      }
      setLit(-1);
      sfx.good();
      // the word is fixed, and heard: now it counts. A tier-up's power-up and shout ("Super ninja streak!") are the praise,
      // and the star for Baron flies as soon as the power-up is done, while the ninja is still shouting.
      const e = first ? streak.hit() : null;
      const lineSaid = e?.tierUp ? streakLineSaid(e) : Promise.resolve(false);
      if (e?.tierUp) {
        await ninjaSettled(1800);
        if (!alive.current) return;
      }
      const last = step + 1 >= chain.length || timeUp(); // (a cut lesson ends after this word when its time is up)
      // the last word: a big move sends Baron packing, then the ninja celebrates
      const bonk = bonkBaron(last);
      const cheered = await lineSaid;
      if (!alive.current) return;
      if (last) {
        if (!cheered) await say({ line: pickPraise() });
        await Promise.race([bonk, sleep(1200)]);
        if (!alive.current) return;
        fx.rain("confetti", 60);
        await Promise.all([say({ line: "swap_done" }), ninja.celebrate()]);
        if (!alive.current) return;
        onDone(misses.current <= 1 ? 3 : misses.current <= 4 ? 2 : 1, { closing: "swap_done" });
        return;
      }
      await (cheered ? Promise.race([bonk, sleep(900)]) : say({ line: pickPraise() }));
      if (!alive.current) return;
      // the first time right answers fill a gem (once per save): it pops up beside the picture, and fills
      if (step === 0) await explainGemEnergy(s.to.segs[s.pos], { x: CARD.left + CARD.width + 110, y: CARD.top + 96 }, () => alive.current);
      if (!alive.current) return;
      stepMisses.current = 0;
      posMisses.current = 0;
      gMisses.current = 0;
      setStep(step + 1);
      await ask(step + 1);
    } else {
      misses.current++;
      stepMisses.current++;
      gMisses.current++;
      const lineSaid = streakLineSaid(streak.miss());
      setWrongG(g);
      if (!shown) sfx.wrong();
      setBusy(true);
      await lineSaid; // "Keep going, ninja!" when a streak of 3 or more is lost
      if (!alive.current) return;
      // listen for what changed (stretched clips exist for the early chains' words only)
      const hearIt = (w: string) => (early ? { stretch: w } : { word: w });
      await say(
        stepMisses.current <= 1 && GRAPHEMES[g] !== need.p
          ? [{ line: "listen" }, hearIt(s.from.text), { gap: 300 }, hearIt(s.to.text)]
          : correction(g, need, s.to.text, 2),
        { reveal: stepMisses.current > 1 },
      );
      if (!alive.current) return;
      if (lock.current === "miss") lock.current = null;
      setWrongG(null);
      setBusy(false);
    }
  };

  const [helpLvl, setHelpLvl] = useState(0);
  useEffect(() => setHelpLvl(0), [step, knocked]);
  useHelp(
    (n) => {
      if (!s || busy || (picked !== null && !knocked)) return;
      setHelpLvl(n);
      if (!knocked) say(n === 1 ? [{ line: "swap_make" }, { gap: 100 }, { word: s.to.text }, { gap: 250 }, { line: "help_swap_pos" }] : [{ line: "listen" }, { word: s.from.text }, { gap: 300 }, { word: s.to.text }, { gap: 200 }, { line: "help_look" }], { reveal: n > 1 });
      else say(n === 1 ? [{ line: "help_swap_new" }, { gap: 100 }, { word: s.to.text }] : [{ line: "help_look" }, { sound: s.to.segs[s.pos].p }], { reveal: n > 1 });
    },
    [step, knocked, busy, picked],
  );
  // the bot (scripts/treadmill/bot.ts) taps `.slots .tile` number `pos`, then `.row .tile` labelled `next`
  (window as any).__snState = { scene: "swap", busy: busy || (picked !== null && !knocked) || !!carried, picked: knocked ? picked : null, pos: s?.pos, next: s?.to.segs[s.pos].g, step, streak: streak.n };
  if (!s || !shown) return null;
  const size = tileSize(shown.segs.length);
  const hintPos = (posMisses.current >= 2 || helpLvl >= 2) && picked === null;
  return (
    <div className="scene swap-scene">
      <img className="bg-img" src={img(`bg_${world.key}`)} alt="" />
      <div className="vignette" />
      <TopBar>
        <div className="spacer" />
        <Progress value={step / chain.length} />
        <div className="spacer" />
        <div style={{ width: 68 }} />
      </TopBar>
      {/* Baron Muddle, top-right (clear of the help corner): sulks when a word is fixed, runs away at the end */}
      <div ref={baronRef} className={`swap-baron ${baron}`} aria-hidden="true">
        <div className="swap-baron-in">
          <img src={img(baron === "idle" ? "baron_idle" : "baron_defeated")} alt="" draggable={false} />
        </div>
      </div>
      {/* picture of the current word: it goes wobbly while a sound is missing */}
      {/* ...and when it turns into the new word, stars burst out from behind it */}
      {landed >= 0 && (
        <div key={`halo-${shown.text}`} className="swap-card-halo" style={CARD}>
          <Halo n={14} rx={200} up={124} down={150} ring={[CARD.width / 2, CARD.height / 2, 30]} delay={80} />
        </div>
      )}
      {/* Hear it again: the speaker card itself for a word with no picture (docs/NAVIGATION.md §3.1 "own") */}
      <WordCardAgain key={shown.text} word={shown} className={`swap-card ${knocked ? "muddled" : ""}`} style={CARD} />
      {knocked && (
        <div className="swap-swirl" style={CARD} aria-hidden="true">
          <Swirl />
          <Swirl className="b" />
        </div>
      )}
      {/* Hear it again beside a picture card (docs/NAVIGATION.md §3.1 "own": the word and its choices fill the bottom) */}
      {shown.pic && <ReplayButton onReplay={hear} size={100} label="Hear the target word" className="swap-hear" style={{ position: "absolute" }} />}
      {/* the word: tap the sound that changes */}
      <div className={`slots swap-word ${landed >= 0 ? "rising" : ""}`} style={{ gap: size < 132 ? 14 : 18 }}>
        {shown.segs.map((seg, i) => {
          const gap = knocked && picked === i;
          return (
            <div key={`${shown.text}-${i}`} className={`swap-cell ${picked === i && !knocked ? "target" : ""}`}>
              {gap ? (
                <>
                  <div ref={gapRef} className="slot active swap-gap" style={{ width: gapW.current, height: size }} />
                  {flyG && (
                    <div className="swap-flyout" aria-hidden="true">
                      <Tile g={flyG} size="lg" withButtons style={{ "--size": `${size}px` } as CSSProperties} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {landed === i && <Halo n={14} rx={size + 50} up={size * 0.5} down={size + 16} ring={[gapW.current / 2, size / 2, 26]} delay={Math.round(RISE_MS * 0.8)} className="word" />}
                  <Tile
                    g={seg.g}
                    size="lg"
                    withButtons
                    lit={lit === i}
                    className={landed === i ? "swap-rise" : ""}
                    style={{ "--size": `${size}px`, ...(landed === i ? { "--rise": `${Math.round(riseFrom.current.dy)}px`, "--from": riseFrom.current.scale.toFixed(3) } : {}) } as CSSProperties}
                    state={wrongPos === i ? "wrong" : picked === i ? "right" : hintPos && i === s.pos ? "hint" : ""}
                    onTap={(el) => tapPos(i, el)}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
      {/* the new spellings to choose from */}
      {knocked && (
        <div className="row swap-choices">
          {options.current[step].map((g, k) => (
            <span key={g} className="swap-choice" style={{ "--i": k } as CSSProperties}>
              <Tile
                g={g}
                className={carried === g ? "carried" : queued === g ? "queued" : ""}
                state={wrongG === g ? "wrong" : (gMisses.current >= 2 || helpLvl >= 2) && g === s.to.segs[s.pos].g ? "hint" : ""}
                onTap={(el) => tapNew(g, el)}
              />
            </span>
          ))}
        </div>
      )}
      <NinjaSpot />
      <NarrOverlay />
      <SenseiDock />
    </div>
  );
}
