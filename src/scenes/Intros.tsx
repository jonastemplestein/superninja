// The World Flower's first visit, and the trips that bring the child back to it (World Flower 2.0, docs/FEEDBACK.md
// Round 12; engine/gems.ts FlowerVisit says when). What Sensei says is TEACHER_SCRIPT §3.14 and §3.25, from
// content/teach.ts (foundScript, worldScript):
// - FlowerIntro: the first visit, three held steps about the child's own first petal (SCRIPT_FIXES C8): the flower
//   with its petals blown away; the child's first petal comes home and lifts out ("This is the petal for… /s/"), and
//   waits for the child's tap; the petal opens to show its gem sockets.
// - GemFound: a level has just taught new spellings. A new sound's petal shines through the mist, each gem's dark
//   crystal cracks open, and Sensei shows and counts the spellings (a spelling taught this session isn't taught again:
//   SCRIPT_FIXES C3). A sound already met as a petal (the first visit's) isn't "a new sound" (no mist). A
//   spelling that spells another sound too gets that sound's petal beside the big one (SD r55). The save's first trip
//   ends with "Your World Flower is waiting for more sounds."
// - WorldVisit: the start of a new land. The flower so far (every sound the child knows lights up in turn), one sound
//   re-explained (its petal lifts out of the flower, and waits for the child's tap), and the petals still hiding here.
// Each is a show of held steps (docs/NAVIGATION.md, src/ui/nav.tsx usePresentation): a step is spoken with its own
// picture and motion, then holds on the green Next arrow; Back plays the step before again from its start, Hear it
// again plays this step again. Nothing moves on by itself. Every pure sound here is a "petal" sound (SOUND_DISPLAY §1),
// and its petal is on screen before it plays. Motion is transform and opacity only (one-shot Web Animations and CSS
// transitions); the only endless animations are the petal's breathing while it waits for a tap, and the trip's rays.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { say, sfx, onClip, clipId, type Say } from "../engine/audio";
import { fx, stageRect, W } from "../ui/ui";
import { usePresentation, type Step } from "../ui/nav";
import { SoundBadge, SoundPair, badgeHeight } from "../ui/SoundBadge";
import { hasPetal } from "../ui/petal";
import { NinjaSpot, ninja } from "../ui/Ninja";
import { PETALS, GEMS, chartOf, type Gem } from "../content/flower";
import { LEVELS } from "../content/worlds";
import { teachEntry, type PhonemeId } from "../content/phonics";
import { foundScript, worldScript, type Beat, type Explanation } from "../content/teach";
import { LINES } from "../content/lines";
import { store, type Save } from "../engine/store";
import { gemState, knownNow, isMet, isWayToSpell, otherSoundsOf, petalOfGem, worldNewSounds, gemByKey, gemKeyOfTeach } from "../engine/gems";
import { heard, heardBefore, onceInSave, taughtThisSession } from "./narrate";
import { WorldFlower, FLOWER_RINGS, BigPetal, ExampleWords, Jewel, petalLight, slotsOf } from "./Tree";

// ---------------------------------------------------------------- shared pieces
/** Timers for one step's picture: `later(ms, fn)` runs fn after ms (game time) and resolves then; `onLine(id, s, fn)`
 *  runs fn `s` game seconds into the next play of clip `id` (a picture on its word); `clear()` drops them all (a step
 *  starting again, or another one). */
function useLater() {
  const timers = useRef<number[]>([]);
  const offs = useRef<(() => void)[]>([]);
  const clear = () => {
    timers.current.splice(0).forEach(clearTimeout);
    offs.current.splice(0).forEach((f) => f());
  };
  useEffect(() => clear, []);
  const later = (ms: number, fn: () => void) =>
    new Promise<void>((resolve) =>
      timers.current.push(
        window.setTimeout(() => {
          fn();
          resolve();
        }, ms),
      ),
    );
  const onLine = (id: string, s: number, fn: () => void) => {
    const off = onClip((cid) => {
      if (cid !== id) return;
      off();
      timers.current.push(window.setTimeout(fn, s * 1000));
    });
    offs.current.push(off);
  };
  return { later, onLine, clear };
}

/** A show's step as it changes: its key, and whether it has finished and holds on Next (`ready`). The World Flower
 *  (Tree.tsx), which owns window.__snState while a show is up, can publish `busy` from it (busy while a step plays). */
type OnStep = (step: string, ready: boolean) => void;
function useStepReport(pres: { key: string; ready: boolean }, onStep?: OnStep) {
  useEffect(() => onStep?.(pres.key, pres.ready), [pres.key, pres.ready]);
}

/** The pure sounds a beat says, in order, each once. */
const soundsIn = (says: Say[]): PhonemeId[] => [...new Set(says.filter((s): s is { sound: PhonemeId } => "sound" in s).map((s) => s.sound))];

/**
 * A petal join-in (TEACHER_SCRIPT §2.1: "Tap it, and hear its sound.", "Tap the petal, and say it with me."): the petal
 * breathes and waits for the child's tap, which says its sound. At 8 s of quiet after the ask the petal swells and says
 * its sound itself; at 12 s the show goes on (TEACHER_SCRIPT §3.5 C's idle rule). The waiting petal's box is marked
 * data-join="petal" for the bots.
 */
function useJoin() {
  const [on, setOn] = useState<PhonemeId | null>(null);
  const cur = useRef<{ p: PhonemeId; done: (tapped: boolean) => void; timers: number[] } | null>(null);
  const end = () => {
    const c = cur.current;
    if (!c) return null;
    c.timers.forEach(clearTimeout);
    cur.current = null;
    setOn(null);
    return c;
  };
  useEffect(() => () => void end()?.done(false), []);
  return {
    on,
    /** Wait for the tap (live from now). `idle()` starts the 8 s / 12 s ladder once Sensei has asked. `done` resolves
     *  true once the tapped sound has been said, false if the show went on without a tap or the step was left. */
    wait(p: PhonemeId): { done: Promise<boolean>; idle: () => void } {
      end()?.done(false);
      let resolve!: (v: boolean) => void;
      const done = new Promise<boolean>((r) => (resolve = r));
      const c = { p, done: resolve, timers: [] as number[] };
      cur.current = c;
      setOn(p);
      const idle = () => {
        if (cur.current !== c) return;
        c.timers.push(window.setTimeout(() => cur.current === c && void say({ sound: p, show: "petal" }), 8000));
        c.timers.push(window.setTimeout(() => cur.current === c && (end(), resolve(false)), 12000));
      };
      return { done, idle };
    },
    /** The child tapped the waiting petal: it says its sound, then the wait resolves. */
    tap() {
      const c = end();
      if (c) void say({ sound: c.p, show: "petal" }).then(() => c.done(true));
    },
    /** Stop waiting (a step starting again, or another one). */
    stop() {
      end()?.done(false);
    },
  };
}

/** The sky behind a trip: deep twilight with a warm glow where the petal stands, and a few still stars. Opaque, so the
 *  flower or chart underneath never shows through the picture (a busy background under the words). */
const SKY: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: [
    "radial-gradient(2px 2px at 9% 16%, rgba(255,244,220,.8), transparent)",
    "radial-gradient(2px 2px at 23% 8%, rgba(255,244,220,.55), transparent)",
    "radial-gradient(3px 3px at 88% 12%, rgba(255,244,220,.7), transparent)",
    "radial-gradient(2px 2px at 72% 6%, rgba(255,244,220,.5), transparent)",
    "radial-gradient(2px 2px at 95% 38%, rgba(255,244,220,.45), transparent)",
    "radial-gradient(2px 2px at 4% 44%, rgba(255,244,220,.45), transparent)",
    "radial-gradient(ellipse 46% 52% at var(--gx, 50%) var(--gy, 44%), rgba(255, 214, 150, .26), transparent 72%)",
    "radial-gradient(ellipse 90% 60% at 50% 115%, #4a2a66 0%, transparent 70%)",
    "linear-gradient(180deg, #170d2e 0%, #251542 50%, #34204f 100%)",
  ].join(","),
};
const sky = (x: number, y: number): CSSProperties => ({ ...SKY, "--gx": `${(x / W) * 100}%`, "--gy": `${(y / 720) * 100}%` } as CSSProperties);

/** The rays behind a petal (tree-visit.css .trip-rays: a slow turn on the compositor), centred on (x, y). */
const Rays = ({ x, y, colour }: { x: number; y: number; colour: string }) => <div className="trip-rays" style={{ left: x - 500, top: y - 500, "--petal": colour } as CSSProperties} />;

/** A one-shot Web Animation on an element (transform and opacity only). */
function play(el: Element | null | undefined, frames: Keyframe[], o: KeyframeAnimationOptions) {
  const h = el as HTMLElement | null | undefined;
  if (h && typeof h.animate === "function") h.animate(frames, o);
}
/** A petal of a World Flower lights up for a moment: a soft glow and twinkles over it, drawn on the particle canvas, so
 *  the flower (a big SVG) isn't drawn again for each petal in turn. */
function shine(flower: Element | null | undefined, p: PhonemeId, big = false) {
  const el = flower?.querySelector(`path[data-p="${p}"]`);
  if (!el) return;
  const r = stageRect(el);
  if (!r.w) return;
  const x = r.x + r.w / 2, y = r.y + r.h / 2, c = chartOf(p).colour;
  fx.glow(x, y, ["#fff6c8", c], big ? 3 : 2, big ? 70 : 52, 0.4, 30);
  fx.twinkle(x, y, ["#fff4dc", "#ffe38a", c], big ? 7 : 4, 4, 22);
}
/** Twinkles round an element (a socket, a gem), in stage px. */
function twinkleAt(el: Element | null | undefined, colours: string[], n = 6) {
  if (!el) return;
  const r = stageRect(el);
  if (r.w) fx.twinkle(r.x + r.w / 2, r.y + r.h / 2, colours, n, 5, 24);
}

// ---------------------------------------------------------------- the first visit
/** The child's first petal (SCRIPT_FIXES C8): the first spelling they won back, as its sound; /s/ (Reward 2's) if none. */
function firstPetal(s: Save): PhonemeId {
  for (const g of s.petals ?? []) {
    const p = teachEntry(g).p;
    if (p && hasPetal(p) && PETALS.some((pt) => pt.p === p)) return p;
  }
  return "s";
}
/** Reward 2 (after W2) lifts the /s/ petal out of the flower with the introduction animation (FIX_PLAN B4.1): that
 *  child has met it. Anyone else meets their first petal here with the introduction (SOUND_DISPLAY r50). */
const metAtReward2 = (s: Save, p: PhonemeId) => p === "s" && (s.stars?.["w1-wu2"] ?? 0) > 0;
/** The first visit's petal, once its sound has been said ("This is the petal for… /s/"): the narrative ledger's key. */
const PETAL_MET = "flower:petal:";
/** The child has met this sound as a petal before any spelling of it (Reward 2's /s/, or the first visit's petal), so
 *  the trip that follows brings its first gem ("You found a new gem!… /s/"), not a new sound. */
const petalMet = (s: Save, p: PhonemeId) => metAtReward2(s, p) || heardBefore(PETAL_MET + p);

/** Where things stand in the first visit (stage px): the flower (centred, then small at the top left), and the petal. */
const FL = { left: 360, top: 22, size: 560 };
const FL_SIDE = "translate(-338px, -64px) scale(0.6)";
const HERO = { x: 780, y: 292, w: 260 };
const BIG = { w: 300, h: 427 };

/**
 * The World Flower's first visit (TEACHER_SCRIPT §3.14, SCRIPT_FIXES C8), three held steps about the child's own first
 * petal (not /a/):
 * 1. "This is the World Flower. Baron Muddle blew all its petals away." The flower in the mist; on "blew" the last
 *    petals scatter (the film's rainbow petals, the story's lost sounds).
 * 2. "Every petal is one sound. This is the petal for… /s/" The flower steps aside, and the child's petal comes home
 *    to it and lifts out, big (the introduction animation if the child hasn't met it at Reward 2). "Tap it, and hear
 *    its sound." It breathes until the child taps it.
 * 3. "Inside each petal are shiny gems. Each gem is a way to spell the sound." The ninja casts, the petal opens, and
 *    its gem sockets twinkle one by one (the trip that follows cracks them open).
 * The gem filling, the full gem and the petal flying home (flower_i4, flower_i5, flower_i6) are said when they happen.
 */
export function FlowerIntro({ onDone, onStep }: { onDone: () => void; onStep?: OnStep }) {
  const save = useMemo(() => store.get(), []);
  const known = useMemo(() => knownNow(save), []);
  const p0 = useMemo(() => firstPetal(save), []);
  const bloomIntro = useMemo(() => !metAtReward2(save, p0), []);
  // the child's petal as it comes home: at least half its colour (from the heart outwards) with its picture, so it shines
  // out of the mist; more if its gems are further on (WorldFlower's looks: a full petal means a whole column won)
  const homeLight = useMemo(() => Math.max(0.5, Math.min(0.95, petalLight(p0, save, knownNow(save)))), []);
  const colour = chartOf(p0).colour;
  const pt = useMemo(() => PETALS.find((x) => x.p === p0)!, []);
  // the petal's gem places, all still dark crystals: the trip after this cracks them open
  const sockets = useMemo(() => slotsOf(pt, save, known).map((s) => ({ ...s, st: "hidden" as const, energy: 0 })), []);
  const [view, setView] = useState<0 | 1 | 2>(0); // the flower alone; the petal; the petal opened
  const [home, setHome] = useState(false); // the child's petal is in the flower
  const [landing, setLanding] = useState(false);
  const [hero, setHero] = useState<{ from: Element | null; n: number } | null>(null);
  const heroRef = useRef(hero);
  heroRef.current = hero;
  const [explaining, setExplaining] = useState(false);
  const [lit, setLit] = useState<string[]>([]);
  const [opened, setOpened] = useState(0);
  const flowerRef = useRef<HTMLDivElement>(null);
  const heroBox = useRef<HTMLDivElement>(null);
  const bigBox = useRef<HTMLDivElement>(null);
  const { later, onLine, clear } = useLater();
  const join = useJoin();
  const heroN = useRef(0);
  const petalEl = () => flowerRef.current?.querySelector(`path[data-p="${p0}"]`) ?? null;
  useEffect(() => () => ninja.pose(null), []);

  const steps: Step[] = [
    {
      key: "flower_i1",
      enter: () => {
        clear();
        join.stop();
        setView(0);
        setHome(false);
        setLanding(false);
        setHero(null);
        setLit([]);
        // the ninja looks up at the flower
        ninja.pose("think");
      },
      run: async () => {
        // "…blew all its petals away": a gust, the flower shivers, and the last petals scatter
        onLine("flower_i1", 2.45, () => {
          sfx.whoosh();
          play(flowerRef.current?.firstElementChild, [{ transform: "rotate(0deg)" }, { transform: "rotate(-3.5deg)", offset: 0.3 }, { transform: "rotate(2deg)", offset: 0.65 }, { transform: "rotate(0deg)" }], { duration: 900, easing: "ease-in-out" });
          fx.burst(FL.left + FL.size / 2, FL.top + FL.size / 2 - 10, "rainbow", 9, 1.15);
        });
        await say({ line: "flower_i1" });
      },
    },
    {
      key: "tv_flower_petal",
      enter: () => {
        clear();
        join.stop();
        ninja.pose(null);
        setView(1);
        setHero(null);
        setLit([]);
        setExplaining(true);
        // the child's petal comes home to the flower as it steps aside (again on a replay)
        setHome(false);
        setLanding(false);
        void later(60, () => (setHome(true), setLanding(true)));
        void later(950, () => {
          sfx.petal();
          twinkleAt(petalEl(), ["#fff4dc", "#ffe38a", colour], 10);
        });
      },
      run: async (live) => {
        // "This is the petal for…": it lifts out of the flower, big (misty first if the child hasn't met it yet)
        const lift = () => {
          if (heroRef.current || !live()) return;
          setHero({ from: bloomIntro ? null : petalEl(), n: ++heroN.current });
          if (!bloomIntro) sfx.twinkle();
        };
        onLine("tv_flower_petal", 2.2, lift);
        void later(4200, lift); // (if the line never plays)
        const said = await say([{ line: "tv_flower_petal" }, { gap: 250 }, { sound: p0, show: "petal" }]);
        // the child has met this sound now: the trip after this brings its first gem, not a new sound (GemFound)
        if (said) heard(PETAL_MET + p0);
        if (!live()) return;
        lift();
        setExplaining(false);
        // "Tap it, and hear its sound.": live from its first word
        const w = join.wait(p0);
        void say({ line: "tv_flower_tap" }).then((ok) => ok && live() && w.idle());
        await w.done;
      },
    },
    {
      key: "wf_i3",
      enter: () => {
        clear();
        join.stop();
        setView(1);
        setHome(true);
        setLanding(false);
        setLit([]);
        setExplaining(false);
        // (the petal as it was at the end of the step before: no introduction, no flight)
        setHero({ from: null, n: ++heroN.current });
      },
      run: async (live) => {
        // the ninja casts at the petal, and it opens to show its gems' places
        const open = (async () => {
          await ninja.act("cast", heroBox.current ?? { x: HERO.x, y: HERO.y }, { react: false });
          if (!live()) return;
          setView(2);
          setOpened((n) => n + 1);
          sfx.magic();
        })();
        // "…shiny gems": each place twinkles in turn; "Each gem is a way to spell the sound.": each lights up
        const slotEls = () => [...(bigBox.current?.querySelectorAll("[data-slot]") ?? [])];
        onLine("wf_i3", 1.9, () =>
          slotEls().forEach((el, i) =>
            void later(i * 140, () => {
              twinkleAt(el, ["#fff4dc", "#ffe38a", colour], 5);
              if (i % 2 === 0) sfx.tink();
            }),
          ),
        );
        onLine("wf_i3", 3.75, () => sockets.forEach((s, i) => void later(i * 170, () => setLit((l) => [...l, s.gem.key]))));
        await Promise.all([say({ line: "wf_i3" }), open]);
      },
    },
  ];
  useStepReport(usePresentation(steps, { id: "flower-intro", onDone, state: false }), onStep);

  const joined = join.on === p0;
  return (
    <div className="intro-overlay trip">
      <div style={sky(view ? HERO.x : 640, view ? HERO.y : 300)} />
      {view > 0 && <Rays x={HERO.x} y={HERO.y} colour={colour} />}
      {/* the lost World Flower, its petals in the mist (WorldFlower `misty`); then the child's petal home, lit, as the
          flower steps aside */}
      <div ref={flowerRef} style={{ position: "absolute", left: FL.left, top: FL.top, width: FL.size, height: FL.size, zIndex: 2, transform: view ? FL_SIDE : "none", transition: "transform 0.9s cubic-bezier(.3,1.15,.4,1)" }}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 60%" }}>
          <WorldFlower light={(p) => (home && p === p0 ? homeLight : 0)} misty landing={landing ? p0 : null} />
        </div>
      </div>
      {/* the child's petal, big: tap it to hear its sound (Sensei waits for the tap after "Tap it, and hear its sound.") */}
      {view === 1 && hero && (
        <div ref={heroBox} key={hero.n} data-join={joined ? "petal" : undefined} style={{ position: "absolute", left: HERO.x - HERO.w / 2, top: HERO.y - badgeHeight(HERO.w) / 2, zIndex: 4 }}>
          <SoundBadge p={p0} tier="hero" size={HERO.w} intro={bloomIntro && hero.n === 1} from={hero.from} busy={explaining} wait={joined} onTap={joined ? () => join.tap() : undefined} />
        </div>
      )}
      {/* the petal opened: its gems' places, dark until the child finds each spelling */}
      {view === 2 && (
        <div ref={bigBox} className="pop-in" style={{ position: "absolute", left: HERO.x - BIG.w / 2, top: HERO.y - BIG.h / 2 + 8, zIndex: 4 }}>
          <BigPetal p={p0} w={BIG.w} h={BIG.h} light={petalLight(p0, save, known)} slots={sockets} lit={lit} bloom={opened} />
        </div>
      )}
      <NinjaSpot />
    </div>
  );
}

// ---------------------------------------------------------------- trips to the World Flower
/** Where the petal stands in a trip (stage coordinates; the words go on the right, clear of Sensei's corner). */
const TP = { left: 400, top: 96, w: 330, h: 470 };
const TP_MID = { x: TP.left + TP.w / 2, y: TP.top + TP.h / 2 };
/** The other sound's petal in a same-spelling beat: on the big petal's left shoulder (SOUND_DISPLAY r55). */
const BESIDE = { left: TP.left - 74, top: TP.top + 30 };
const add = <T,>(list: T[], x: T) => (list.includes(x) ? list : [...list, x]);
/** "Your World Flower is waiting for more sounds. Let's go and find them!" ends the save's first trip (TS §3.14). */
const BYE_KEY = "flower:bye";
/** The land a spelling is first taught in (the trips leave out "We see this spelling in…" before land 2: TS T21). */
const landOfGem = (key: string) => LEVELS.find((l) => (l.teach ?? []).some((t) => gemKeyOfTeach(t) === key))?.world ?? 99;

/** A line's words (for a tail's "…" start). */
const LINE_TEXT = new Map(LINES.map((l) => [l.id, l.text]));
const spoken = (says: Say[]) => says.filter((s) => !("gap" in s));
/** A beat that ends suspended on a sound ("You found a new gem! It's a spelling of the sound… /s/"). */
const endsOnSound = (says: Say[]) => {
  const last = spoken(says).at(-1);
  return !!last && "sound" in last;
};
/** A beat that finishes the sentence before it ("…like in sit, sun and bus."). */
const isTail = (says: Say[]) => {
  const first = spoken(says)[0];
  return !!first && "line" in first && /^\s*(\.\.\.|…)/.test(LINE_TEXT.get(first.line) ?? "");
};
/** The trip's beats as held steps: a beat that ends on a sound and the "…like in…" tail after it are one sentence, so
 *  one step (never a ▶ between the sound and its tail: the V-script2 finding). */
const stepGroups = (beats: Beat[]): Beat[][] =>
  beats.reduce<Beat[][]>((gs, b) => {
    const last = gs.at(-1);
    if (last && endsOnSound(last[last.length - 1].say) && isTail(b.say)) last.push(b);
    else gs.push([b]);
    return gs;
  }, []);
/** The gap between a suspended sound and its tail, as teach.ts's own "…sound /ae/ …like in…" (introGem) has it. */
const TAIL_GAP = 300;

/** What a GemFound step shows: the petal (and gem) it is about, and the state of the petals, gems and word cards. */
type FoundVis = { cur: string | null; clear: string[]; shown: string[]; lit: string[]; words: Explanation["show"]; bye: boolean };

/** The other sound of a same-spelling beat: its petal pops in beside the big petal as the beat starts, swells as it is
 *  said, and dims with a shake when the big petal's own sound is said (a contrast pair, SOUND_DISPLAY §4.5, r55). */
function BesidePetal({ p, own }: { p: PhonemeId; own: PhonemeId }) {
  const [dim, setDim] = useState(false);
  useEffect(() => onClip((id) => void (id === `sound:${own}` && setDim(true))), [own]);
  return (
    <div className="pop-in" style={{ position: "absolute", left: BESIDE.left, top: BESIDE.top, zIndex: 5 }}>
      <SoundBadge p={p} tier="pop" dim={dim} />
    </div>
  );
}

/**
 * Spellings met for the first time in a level: their gems appear in their petals. For each gem: a new sound's petal
 * shines through the mist ("You found some new sounds!…", "Here's the sound… /m/ · This is the way we spell it in
 * mat."), or the gem's petal appears (another way to spell a sound the child knows: "You found a new gem! It's a
 * spelling of the sound… /ae/", then an example); the dark crystal cracks open and the gem appears; its words come up on
 * cards; the ways the child knows light up as Sensei counts them; and a spelling that also spells another sound the
 * child knows gets "The same spelling can sometimes be…", with that sound's petal beside the big one. What is said is
 * teach.ts foundScript's. A spelling taught this session isn't taught again (no letters line: SCRIPT_FIXES C3). A sound
 * the child has already met as a petal (the first visit's /s/, Reward 2's) isn't new: its first gem comes first, in the
 * petal the first visit has just opened. Each beat is a held step, except that a beat ending on a sound and a "…like in
 * sit, sun and bus." tail after it are one step (one sentence: no ▶ before its end); the save's first trip ends with
 * "Let's go and find them!" over the flower.
 */
export function GemFound({ gems, onDone, onBeat, onStep }: { gems: string[]; onDone: () => void; onBeat?: (cue: string) => void; onStep?: OnStep }) {
  const save = useMemo(() => store.get(), []);
  const known = useMemo(() => knownNow(save), []);
  const items = useMemo(() => {
    const count: Record<string, number> = {};
    // ways known before this level (spellings of the sound met earlier)
    const wayBefore = (pt: NonNullable<ReturnType<typeof petalOfGem>>) => pt.gems.filter((g) => !gems.includes(g.key) && isWayToSpell(g) && isMet(gemState(g, save, known))).length;
    // the first gem of a sound the child has met as a petal (the first visit's /s/, lifted out of the flower a moment
    // ago; or Reward 2's) isn't a new sound: it comes first, in the petal the child has just seen open (no mist), and the
    // level's new sounds follow ("You found a new sound!… /m/")
    const firstGem = (key: string) => {
      const pt = petalOfGem(key);
      return !!pt && wayBefore(pt) === 0 && petalMet(save, pt.p);
    };
    return [...gems.filter(firstGem), ...gems.filter((k) => !firstGem(k))].flatMap((key) => {
      const gem = gemByKey(key), pt = petalOfGem(key);
      if (!gem || !pt) return [];
      // plus this level's so far
      const before = wayBefore(pt);
      const k = (count[pt.p] = (count[pt.p] ?? 0) + 1);
      const met = before === 0 && petalMet(save, pt.p);
      return [{ key, gem, pt, newSound: before === 0 && k === 1 && !met, met, knownWays: before + k, others: otherSoundsOf(key, save) }];
    });
  }, []);
  const beats = useMemo(() => {
    // SCRIPT_FIXES C3: the trip shows and counts. A spelling whose teach moment the child heard this session (the level
    // that sent them here taught it) gets no letters line and no second "This is the way we spell…"; example words are
    // never said twice in one trip; before land 2 there is no "We see this spelling in…". A met petal's first gem is
    // counted as taught too (no letters line; never "You already know this sound. Here's another way to spell it!": it
    // is the first way).
    const justTaught = new Set(items.filter((x) => x.met || taughtThisSession(x.gem.g)).map((x) => x.key));
    const world = Math.min(...items.map((x) => landOfGem(x.key)));
    return foundScript(items, { met: new Set(Object.keys(save.words ?? {})), justTaught, used: new Set<string>(), world });
  }, []);
  const groups = useMemo(() => stepGroups(beats), []);
  const bye = useMemo(() => onceInSave(BYE_KEY), []);
  // the picture: kept in a ref too, so a step starting (and its replay) reads what is on screen now
  const [vis, setVisState] = useState<FoundVis>({ cur: items[0]?.key ?? null, clear: [], shown: [], lit: [], words: [], bye: false });
  const visRef = useRef(vis);
  const setVis = (f: (v: FoundVis) => FoundVis) => {
    visRef.current = f(visRef.current);
    setVisState(visRef.current);
  };
  const [cracking, setCrackingState] = useState<string | null>(null);
  const crackingRef = useRef<string | null>(null);
  const setCracking = (k: string | null) => {
    crackingRef.current = k;
    setCrackingState(k);
  };
  const [beside, setBeside] = useState<{ p: PhonemeId; own: PhonemeId; n: number } | null>(null);
  const byeFlower = useRef<HTMLDivElement>(null);
  // each beat's picture as it first began: Back and Hear it again put it back before the beat plays again
  const snaps = useRef<FoundVis[]>([]);
  const petalRef = useRef<HTMLDivElement>(null);
  const { later, onLine, clear } = useLater();
  const slotEl = (key: string) => petalRef.current?.querySelector(`[data-slot="${CSS.escape(key)}"]`) ?? undefined;

  /** The ninja casts a spell at the dark crystal, and it cracks open as the spell lands. Resolves once the gem is out. */
  const crack = (key: string, delay: number) => {
    void later(Math.max(0, delay - 550), () => void ninja.act("cast", slotEl(key), { react: false }));
    return later(delay, () => {
      setCracking(key);
      sfx.sparkle();
      const el = slotEl(key);
      if (el) {
        const r = stageRect(el);
        void later(380, () => {
          fx.burst(r.x + r.w / 2, r.y + r.h / 2, "sparks", 24, 1.1);
          fx.twinkle(r.x + r.w / 2, r.y + r.h / 2, ["#fff4dc", "#ffe38a"], 10, 6, 28);
          fx.ring(r.x + r.w / 2, r.y + r.h / 2, { color: "#ffe38a", r0: 20, r1: 160, width: 10 });
        });
      }
    }).then(() =>
      later(900, () => {
        setVis((v) => ({ ...v, shown: add(v.shown, key) }));
        setCracking(null);
      }),
    );
  };
  /** A new sound's petal shines through the mist. */
  const unmist = (p: PhonemeId, delay: number) =>
    later(delay, () => {
      setVis((v) => ({ ...v, clear: add(v.clear, p) }));
      sfx.petal();
      fx.twinkle(TP_MID.x, TP_MID.y, ["#fff4dc", "#ffe38a", chartOf(p).colour], 18, 9, 30);
    });

  /** Starts a beat's picture and motion; resolves when its motion has finished. */
  const start = (b: Beat): Promise<unknown> => {
    const it = items.find((x) => x.key === b.gem);
    if (it && it.key !== visRef.current.cur) {
      setVis((v) => ({ ...v, cur: it.key, lit: [], words: [] }));
      sfx.page();
    }
    const key = it?.key ?? visRef.current.cur;
    if (!key || !it) return Promise.resolve();
    const waits: Promise<unknown>[] = [];
    const misty = it.newSound && !visRef.current.clear.includes(it.pt.p);
    if (b.cue === "found") {
      setVis((v) => ({ ...v, words: [] }));
      if (misty) {
        // the petal shines through the mist, then its gem appears
        waits.push(unmist(it.pt.p, 300));
        waits.push(crack(key, 1400));
      } else waits.push(crack(key, 500));
    }
    if (b.cue === "explain" || b.cue === "same-spelling") {
      setVis((v) => ({ ...v, words: b.show ?? [] }));
      if (!visRef.current.shown.includes(key) && crackingRef.current !== key) {
        // a gem with no "found" beat of its own (the second new sound: "And here's another new sound… /s/"): its petal
        // comes out of the mist as the sound is introduced, and the gem cracks open before "This is the way we spell…"
        if (misty) waits.push(unmist(it.pt.p, 450));
        waits.push(crack(key, misty ? 1300 : 100));
      }
    }
    if (b.cue === "ways") {
      const metKeys = it.pt.gems.filter((g) => isWayToSpell(g) && (isMet(gemState(g, save, known)) || gems.includes(g.key))).map((g) => g.key);
      setVis((v) => ({ ...v, lit: [] }));
      metKeys.forEach((k, n) => waits.push(later(300 + n * 420, () => (setVis((v) => ({ ...v, lit: add(v.lit, k) })), sfx.tink()))));
    }
    return Promise.all(waits);
  };

  // the big petal's sound in each beat (as start() moves it: a beat about another gem turns to that gem's petal)
  let curKey = items[0]?.key;
  const steps: Step[] = groups.map((g, k) => {
    const [b, ...tails] = g;
    for (const x of g) if (x.gem && items.some((it) => it.key === x.gem)) curKey = x.gem;
    const own = items.find((x) => x.key === curKey)?.pt.p;
    // a same-spelling beat says two sounds: this petal's, and the other one, whose petal stands beside it
    const same = g.find((x) => x.cue === "same-spelling");
    const two = same ? soundsIn(same.say) : [];
    const other = two.length === 2 ? two.find((p) => p !== own) ?? null : null;
    // the step's words: its beat, then (after the sound it ends on) its tail's
    const says: Say[] = g.flatMap((x, n) => (n ? [{ gap: TAIL_GAP }, ...x.say] : x.say));
    return {
      key: `${b.cue}${k}`,
      // the big petal is its sound's petal, and the other sound of a pair stands beside it (SOUND_DISPLAY r54–55): the
      // nav row shows only a sound that neither shows, so no duplicate petal flashes up as a step starts
      sound: soundsIn(says).find((p) => p !== own && p !== other),
      enter: () => {
        clear();
        setCracking(null);
        if (snaps.current[k]) setVis(() => snaps.current[k]);
        else snaps.current[k] = visRef.current;
        setBeside(other && own ? { p: other, own, n: k } : null);
        onBeat?.(b.cue);
      },
      run: async (live) => {
        const said = say(says);
        const pics: Promise<unknown>[] = [start(b)];
        // a tail's picture (its word cards) starts on its first clip, as "…like in" is said
        const begun = new Set<Beat>();
        const begin = (t: Beat) => {
          if (begun.has(t) || !live()) return;
          begun.add(t);
          onBeat?.(t.cue);
          pics.push(start(t));
        };
        for (const t of tails) {
          const first = spoken(t.say)[0];
          const id = first ? clipId(first) : null;
          if (id) onLine(id, 0, () => begin(t));
        }
        await said;
        // a tail whose clip didn't play (a missing clip): its picture comes up once the words are over
        tails.forEach(begin);
        await Promise.all(pics);
      },
    };
  });
  if (bye) {
    // the save's first trip: back out to the whole flower, its new petals shining in turn
    const found = [...new Set(items.map((x) => x.pt.p))];
    steps.push({
      key: "bye",
      enter: () => {
        clear();
        setBeside(null);
        setVis((v) => ({ ...v, bye: true, words: [] }));
        onBeat?.("bye");
      },
      run: async (live) => {
        found.forEach((p, n) => void later(600 + n * 520, () => (shine(byeFlower.current, p, true), sfx.twinkle())));
        onLine("tv_flower_bye", 3.1, () => void ninja.act("cheer"));
        const ok = await say({ line: "tv_flower_bye" });
        if (ok && live()) heard(BYE_KEY);
      },
    });
  }
  useStepReport(usePresentation(steps, { id: "gem-found", onDone, state: false }), onStep);

  const item = items.find((x) => x.key === vis.cur) ?? items[0];
  if (!item) return null;
  const colour = chartOf(item.pt.p).colour;
  if (vis.bye) {
    // the flower as it is now (a found sound's petal is back, at least as an outline with its picture)
    const lightNow = (p: PhonemeId) => (items.some((x) => x.pt.p === p) ? Math.max(0.05, petalLight(p, save, known)) : petalLight(p, save, known));
    return (
      <div className="intro-overlay trip">
        <div style={sky(640, 290)} />
        <Rays x={640} y={290} colour="#ffc53d" />
        <div ref={byeFlower} className="pop-in" style={{ position: "absolute", left: 385, top: 30, width: 510, height: 510 }}>
          <WorldFlower light={lightNow} />
        </div>
        <NinjaSpot />
      </div>
    );
  }
  // the petal as it looks now: this trip's gems stay dark until they crack open, and are shown found once they have
  const slots = slotsOf(item.pt, save, known).map((s) =>
    gems.includes(s.gem.key) ? (vis.shown.includes(s.gem.key) || cracking === s.gem.key ? { ...s, st: isMet(s.st) ? s.st : ("charging" as const) } : { ...s, st: "hidden" as const }) : s,
  );
  return (
    <div className="intro-overlay trip">
      <div style={sky(TP_MID.x, TP_MID.y - 40)} />
      <Rays x={TP_MID.x} y={TP_MID.y} colour={colour} />
      <div ref={petalRef} key={item.pt.p} className="trip-petal pop-in" style={{ left: TP.left, top: TP.top, zIndex: 3 }}>
        <BigPetal p={item.pt.p} w={TP.w} h={TP.h} light={petalLight(item.pt.p, save, known)} slots={slots} reveal={cracking} lit={vis.lit} mist={item.newSound && !vis.clear.includes(item.pt.p)} focus={vis.shown.includes(item.key) ? item.key : null} />
      </div>
      {beside && <BesidePetal key={beside.n} p={beside.p} own={beside.own} />}
      <div className="trip-words" style={{ zIndex: 3 }}>
        <ExampleWords key={vis.words.map((w) => w.word.text).join()} show={vis.words} colour={colour} vertical />
      </div>
      <NinjaSpot />
    </div>
  );
}

/** Where the flower stands in a land's trip, and where it steps aside to while one sound is re-explained. */
const WV = { left: 380, top: 40, size: 540 };
const WV_SIDE = "translate(-100px, 20px) scale(0.815)";

/**
 * The start of a new land (TEACHER_SCRIPT §3.25): "Let's visit the World Flower!" · "Every shining petal is a sound
 * that you know!" (each petal the child knows lights up in turn round the flower) · one sound re-explained (rotating
 * between "Here's a sound you learnt… /o/ · You can hear it in pot, top and mop.", "same sound, different spellings"
 * and "the same spelling can sometimes be…", always with fresh examples): its petal lifts out of the flower and heads
 * the panel, a pair for two sounds · "Tap the petal, and say it with me." (the petal waits for the child's tap) · "New
 * sounds are hiding in this land. Let's go and find them!" (the petals of this land's new sounds shimmer through the
 * mist). Each beat is a held step.
 */
export function WorldVisit({ world, onDone, onBeat, onStep }: { world: number; onDone: () => void; onBeat?: (cue: string) => void; onStep?: OnStep }) {
  const save = useMemo(() => store.get(), []);
  const known = useMemo(() => knownNow(save), []);
  const light = (p: PhonemeId) => petalLight(p, save, known);
  const ctx = useMemo(() => {
    const metOf = (g: Gem) => isMet(gemState(g, save, known));
    const multi = PETALS.map((pt) => ({ p: pt.p, gems: pt.gems.filter((g) => isWayToSpell(g) && metOf(g)) })).filter((m) => m.gems.length >= 2);
    // "Here's a sound you learnt…": a sound from the land just finished
    const recent = worldNewSounds(world - 1).filter((p) => PETALS.find((pt) => pt.p === p)?.gems.some(metOf)).reverse();
    const twoSounds: { g: string; a: PhonemeId; b: PhonemeId }[] = [];
    for (const g of GEMS) {
      if (g.key === "x>ks" || !metOf(g)) continue;
      const other = GEMS.find((o) => o.g === g.g && o.p !== g.p && o.key !== "x>ks" && metOf(o));
      if (other && !twoSounds.some((t) => t.g === g.g)) twoSounds.push({ g: g.g, a: other.p, b: g.p });
    }
    const hidden = worldNewSounds(world).filter((p) => !PETALS.find((pt) => pt.p === p)?.gems.some(metOf));
    const shining = FLOWER_RINGS.flat().map((c) => c.p).filter((p) => petalLight(p, save, known) > 0);
    return { multi, recent, twoSounds, hidden, shining, met: new Set(Object.keys(save.words ?? {})) };
  }, []);
  const beats = useMemo(() => worldScript({ multi: ctx.multi, recent: ctx.recent, twoSounds: ctx.twoSounds, met: ctx.met, hidden: ctx.hidden.length, petalTap: true }), []);
  const [cue, setCue] = useState("");
  /** The recap's head: its sound (or two), its words, and where its petal lifts out from. */
  type Head = { p: PhonemeId; pair: [PhonemeId, PhonemeId] | null; words: Explanation["show"]; from: Element | null; n: number };
  const [head, setHead] = useState<Head | null>(null);
  const recapHead = useRef<Head | null>(null);
  const flowerRef = useRef<HTMLDivElement>(null);
  const { later, clear } = useLater();
  const join = useJoin();

  /** Starts a beat's picture and motion; resolves when its motion has finished. */
  const start = (b: Beat): Promise<unknown> => {
    if (b.cue === "visit") {
      sfx.petal();
      void later(200, () => fx.twinkle(650, 300, ["#fff4dc", "#ffe38a"], 16, 8, 30));
      void ninja.act("cheer");
    }
    if (b.cue === "petals") {
      // every sound the child knows lights up in turn, round the flower
      const list = ctx.shining;
      const step = Math.max(110, Math.min(260, 2600 / Math.max(1, list.length)));
      list.forEach((p, n) => void later(250 + n * step, () => (shine(flowerRef.current, p), n % 3 === 0 && sfx.twinkle())));
      return later(400 + list.length * step, () => {});
    }
    if (b.cue === "recap" && b.p) {
      // the sound's petal lifts out of the flower and heads the panel; two sounds are a pair (SOUND_DISPLAY r56)
      const two = soundsIn(b.say);
      const pair: Head["pair"] = two.length === 2 ? [two[0], two[1]] : null;
      const from = pair ? null : flowerRef.current?.querySelector(`path[data-p="${b.p}"]`) ?? null;
      const h: Head = { p: b.p, pair, words: b.show ?? [], from, n: (recapHead.current?.n ?? 0) + 1 };
      recapHead.current = h;
      setHead(h);
      sfx.petal();
    }
    if (b.cue === "hidden") {
      sfx.sparkle();
      void ninja.act("jump", { x: 650, y: 300 }, { react: false });
    }
    return Promise.resolve();
  };
  const steps: Step[] = beats.map((b, k) => ({
    key: `${b.cue}${k}`,
    enter: () => {
      // each beat starts from a clean picture (so Back and Hear it again replay it from its start); the petal tap keeps
      // the recap's picture, and waits on its petal
      clear();
      join.stop();
      setCue(b.cue);
      setHead(b.cue === "petal-tap" && recapHead.current ? { ...recapHead.current, from: null } : null);
      onBeat?.(b.cue);
    },
    run: async (live) => {
      if (b.cue === "petal-tap" && b.p) {
        // "Tap the petal, and say it with me.": live from its first word
        const w = join.wait(b.p);
        void say(b.say).then((ok) => ok && live() && w.idle());
        await w.done;
        return;
      }
      await Promise.all([say(b.say), start(b)]);
    },
  }));
  useStepReport(usePresentation(steps, { id: "world-visit", onDone, state: false }), onStep);

  const side = !!head && (cue === "recap" || cue === "petal-tap");
  const focusP = side ? head.p : null;
  const colour = focusP ? chartOf(focusP).colour : "#ffc53d";
  const joined = !!focusP && join.on === focusP;
  const HEAD_W = 104;
  return (
    <div className="intro-overlay trip">
      <div style={sky(side ? 945 : 650, side ? 220 : 300)} />
      <Rays x={side ? 945 : 650} y={side ? 230 : 310} colour={colour} />
      <div ref={flowerRef} className="pop-in" style={{ position: "absolute", left: WV.left, top: WV.top, width: WV.size, height: WV.size, zIndex: 2 }}>
        <div style={{ position: "absolute", inset: 0, transform: side ? WV_SIDE : "none", transition: "transform 0.8s cubic-bezier(.3,1.2,.4,1)" }}>
          <WorldFlower light={light} hint={cue === "hidden" ? new Set(ctx.hidden) : undefined} stem={false} />
        </div>
      </div>
      <NinjaSpot />
      {side && head && (
        <div className="trip-recap pop-in" style={{ "--petal": colour, zIndex: 4 } as CSSProperties}>
          {/* the sound (its petal: tap to hear it; a pair for two sounds) and the spellings of it the child knows */}
          <div className="trip-recap-head" data-join={joined ? "petal" : undefined}>
            {head.pair ? (
              <SoundPair a={head.pair[0]} b={head.pair[1]} mode="contrast" tier="header" size={HEAD_W} />
            ) : (
              <SoundBadge key={head.n} p={head.p} tier="header" size={HEAD_W} from={head.from} wait={joined} onTap={joined ? () => join.tap() : undefined} />
            )}
            {PETALS.find((pt) => pt.p === head.p)!.gems.filter((g) => isWayToSpell(g) && isMet(gemState(g, save, known))).slice(0, head.pair ? 1 : 4).map((g) => (
              <Jewel key={g.key} g={g.g} colour={colour} state={gemState(g, save, known)} energy={0} size={head.pair ? 78 : 70} className="pop-in" />
            ))}
          </div>
          <ExampleWords key={head.words.map((w) => w.word.text).join()} show={head.words} colour={colour} vertical />
        </div>
      )}
    </div>
  );
}
