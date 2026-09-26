// First-time, step-by-step introductions for the World Flower, and the trips that bring the child
// back to the World Flower (World Flower 2.0, docs/FEEDBACK.md Round 12; engine/gems.ts FlowerVisit says when):
// - GemFound: a level has just taught new spellings. Each gem's dark crystal cracks open in its petal (a new sound's
//   petal first shines through the mist), and Sensei explains the spelling in teacher language, counting the ways to
//   spell the sound and pointing out a spelling that spells another sound too.
// - WorldVisit: the start of a new land. The flower so far (every sound the child knows lights up in turn), one sound
//   re-explained with fresh examples, and the petals still hiding in this land's mist.
// Each is a show of held steps (docs/NAVIGATION.md, src/ui/nav.tsx usePresentation): a step is spoken with its own
// picture and motion, then holds on the green Next arrow; Back plays the step before again from its start, Hear it
// again plays this step again (its picture as it was when the step began). Nothing moves on by itself, and a stray tap
// on the picture does nothing. What Sensei says is in content/teach.ts (foundScript, worldScript).
import { useEffect, useMemo, useRef, useState } from "react";
import { say, sfx, type Say } from "../engine/audio";
import { fx, stageRect } from "../ui/ui";
import { usePresentation, type Step } from "../ui/nav";
import { SoundBadge } from "../ui/SoundBadge";
import { GemIcon } from "../ui/Gem";
import { NinjaSpot, ninja } from "../ui/Ninja";
import { PETALS, GEMS, chartOf, type Gem } from "../content/flower";
import { foundScript, worldScript, type Beat, type Explanation } from "../content/teach";
import { store } from "../engine/store";
import { gemState, knownNow, isMet, isWayToSpell, otherSoundsOf, petalOfGem, worldNewSounds, gemByKey } from "../engine/gems";
import type { PhonemeId } from "../content/phonics";
import { WorldFlower, FLOWER_RINGS, BigPetal, ExampleWords, Jewel, petalLight, slotsOf } from "./Tree";

/** Timers for one step's animation: `later(ms, fn)` runs fn after ms (game time) and resolves then; `clear()` drops
 *  them all (a step starting again, or another one). */
function useLater() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (ms: number, fn: () => void) =>
    new Promise<void>((resolve) =>
      timers.current.push(
        setTimeout(() => {
          fn();
          resolve();
        }, ms),
      ),
    );
  const clear = () => timers.current.splice(0).forEach(clearTimeout);
  return { later, clear };
}
/** The pure sound a beat says, if any (the sound picture sits beside Hear it again while it is said, §4). */
const soundOf = (says: Say[]): PhonemeId | undefined => says.find((s): s is { sound: PhonemeId } => "sound" in s)?.sound;

/** "Inside each petal are shiny gems. Each gem is a way to spell the sound." (spell, not write: NARRATIVE_AUDIT) */
const I3 = "wf_i3";

/**
 * The World Flower's first visit, six held steps: the flower with its petals gone; the petal for the sound /a/ (its
 * sound picture, tap to hear it); gems inside it (the picture moves to the petal's corner, like the school chart); a gem
 * filling with ninja power; a full gem glowing; the petal flying home.
 */
export function FlowerIntro({ onDone }: { onDone: () => void }) {
  const [energy, setEnergy] = useState(0);
  const [take, setTake] = useState(0);
  const { later, clear } = useLater();
  const lines: Say[][] = [[{ line: "flower_i1" }], [{ line: "flower_i2" }, { gap: 200 }, { sound: "a" }], [{ line: I3 }], [{ line: "flower_i4" }], [{ line: "flower_i5" }], [{ line: "flower_i6" }]];
  const steps: Step[] = lines.map((l, k) => ({
    key: `flower_i${k + 1}`,
    enter: () => {
      clear();
      setTake((t) => t + 1);
      setEnergy(k >= 4 ? 1 : 0);
    },
    run: async () => {
      const anim: Promise<void>[] = [];
      // the gem fills up with ninja power (1.8 s)
      if (k === 3) for (let n = 1; n <= 10; n++) anim.push(later(180 * n, () => setEnergy(n / 10)));
      if (k === 4) {
        sfx.petal();
        fx.burst(640, 330, "sparks", 24);
      }
      if (k === 5) anim.push(later(900, () => (sfx.great(), fx.rain("petals", 40))));
      await Promise.all([say(l), ...anim]);
    },
  }));
  const { i: step } = usePresentation(steps, { id: "flower-intro", onDone, state: false });
  const petal = step >= 1 && step < 5;
  return (
    <div className="intro-overlay">
      {/* the World Flower with every petal gone; at the last step the /a/ petal flies home (again on a replay) */}
      <div className={`intro-flower ${petal ? "shrink" : ""}`}>
        <WorldFlower key={step >= 5 ? `land${take}` : "flower"} light={(p) => (step >= 5 && p === "a" ? 1 : 0)} landing={step >= 5 ? "a" : null} />
      </div>
      {petal && (
        <div className="intro-petal pop-in">
          {/* the sound, shown as its petal (docs/NAVIGATION.md §4): a tap says the pure sound */}
          <SoundBadge p="a" size={260} className={`intro-badge ${step >= 2 ? "corner" : ""}`} />
          {step >= 2 && (
            <div className="intro-gem pop-in">
              <GemIcon g="a" colour={chartOf("a").colour} state={step >= 4 ? "ready" : "charging"} energy={step >= 4 ? 1 : energy} size={130} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- trips to the World Flower
/** Where the petal stands in a trip (stage coordinates; the words go on the right, clear of Sensei's corner). */
const TP = { left: 400, top: 96, w: 330, h: 470 };
const add = <T,>(list: T[], x: T) => (list.includes(x) ? list : [...list, x]);

/** What a GemFound step shows: the petal (and gem) it is about, and the state of the petals, gems and word cards. */
type FoundVis = { cur: string | null; clear: string[]; shown: string[]; lit: string[]; words: Explanation["show"] };

/**
 * Spellings met for the first time in a level: their gems appear in their petals. For each gem: a new sound's petal
 * shines through the mist ("You found a new sound!"), or the gem's petal appears ("You found a new gem! It goes in the
 * petal for the sound /ae/."); the dark crystal cracks open and the gem appears; Sensei explains the spelling with its
 * words on cards; the ways the child knows light up as she counts them; and a spelling that also spells another sound
 * the child knows gets "The same spelling can sometimes be…". Each beat is a held step.
 */
export function GemFound({ gems, onDone, onBeat }: { gems: string[]; onDone: () => void; onBeat?: (cue: string) => void }) {
  const save = useMemo(() => store.get(), []);
  const known = useMemo(() => knownNow(save), []);
  const items = useMemo(() => {
    const count: Record<string, number> = {};
    return gems.flatMap((key) => {
      const gem = gemByKey(key), pt = petalOfGem(key);
      if (!gem || !pt) return [];
      // ways known before this level (spellings of the sound met earlier), plus this level's so far
      const before = pt.gems.filter((g) => !gems.includes(g.key) && isWayToSpell(g) && isMet(gemState(g, save, known))).length;
      const k = (count[pt.p] = (count[pt.p] ?? 0) + 1);
      return [{ key, gem, pt, newSound: before === 0 && k === 1, knownWays: before + k, others: otherSoundsOf(key, save) }];
    });
  }, []);
  const beats = useMemo(() => foundScript(items, { met: new Set(Object.keys(save.words ?? {})) }), []);
  // the picture: kept in a ref too, so a step starting (and its replay) reads what is on screen now
  const [vis, setVisState] = useState<FoundVis>({ cur: items[0]?.key ?? null, clear: [], shown: [], lit: [], words: [] });
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
  // each beat's picture as it first began: Back and Hear it again put it back before the beat plays again
  const snaps = useRef<FoundVis[]>([]);
  const petalRef = useRef<HTMLDivElement>(null);
  const { later, clear } = useLater();
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
    if (b.cue === "found") {
      setVis((v) => ({ ...v, words: [] }));
      if (it.newSound) {
        // the petal shines through the mist, then its gem appears
        waits.push(
          later(300, () => {
            setVis((v) => ({ ...v, clear: add(v.clear, it.pt.p) }));
            sfx.petal();
            fx.twinkle(TP.left + TP.w / 2, TP.top + TP.h / 2, ["#fff4dc", "#ffe38a", chartOf(it.pt.p).colour], 18, 9, 30);
          }),
        );
        waits.push(crack(key, 1400));
      } else waits.push(crack(key, 500));
    }
    if (b.cue === "explain" || b.cue === "same-spelling") {
      setVis((v) => ({ ...v, words: b.show ?? [] }));
      if (!visRef.current.shown.includes(key) && crackingRef.current !== key) {
        setVis((v) => ({ ...v, clear: add(v.clear, it.pt.p) }));
        waits.push(crack(key, 100));
      }
    }
    if (b.cue === "ways") {
      const metKeys = it.pt.gems.filter((g) => isWayToSpell(g) && isMet(gemState(g, save, known))).map((g) => g.key);
      setVis((v) => ({ ...v, lit: [] }));
      metKeys.forEach((k, n) => waits.push(later(300 + n * 420, () => (setVis((v) => ({ ...v, lit: add(v.lit, k) })), sfx.tink()))));
    }
    return Promise.all(waits);
  };

  const steps: Step[] = beats.map((b, k) => ({
    key: `${b.cue}${k}`,
    sound: soundOf(b.say),
    enter: () => {
      clear();
      setCracking(null);
      if (snaps.current[k]) setVis(() => snaps.current[k]);
      else snaps.current[k] = visRef.current;
      onBeat?.(b.cue);
    },
    run: async () => {
      await Promise.all([say(b.say), start(b)]);
    },
  }));
  usePresentation(steps, { id: "gem-found", onDone, state: false });

  const item = items.find((x) => x.key === vis.cur) ?? items[0];
  if (!item) return null;
  const colour = chartOf(item.pt.p).colour;
  // the petal as it looks now, except gems of this trip that haven't cracked open yet
  const slots = slotsOf(item.pt, save, known).map((s) => (gems.includes(s.gem.key) && !vis.shown.includes(s.gem.key) && cracking !== s.gem.key ? { ...s, st: "hidden" as const } : s));
  return (
    <div className="intro-overlay trip">
      <div className="trip-rays" style={{ "--petal": colour } as React.CSSProperties} />
      <div ref={petalRef} key={item.pt.p} className="trip-petal pop-in" style={{ left: TP.left, top: TP.top }}>
        <BigPetal p={item.pt.p} w={TP.w} h={TP.h} light={petalLight(item.pt.p, save, known)} slots={slots} reveal={cracking} lit={vis.lit} mist={item.newSound && !vis.clear.includes(item.pt.p)} focus={vis.shown.includes(item.key) ? item.key : null} />
      </div>
      <div className="trip-words">
        <ExampleWords key={vis.words.map((w) => w.word.text).join()} show={vis.words} colour={colour} vertical />
      </div>
      <NinjaSpot />
    </div>
  );
}

/**
 * The start of a new land: "Let's visit the World Flower!" · "Every shining petal is a sound you know!" (each petal the
 * child knows lights up in turn round the flower) · one sound re-explained (rotating between "same sound, different
 * spellings", "do you remember this one?" and "the same spelling can sometimes be…", with fresh examples; its sound
 * picture heads the panel) · "New sounds are hiding in this land. Let's go and find them!" (the petals of this land's
 * new sounds shimmer through the mist). Each beat is a held step.
 */
export function WorldVisit({ world, onDone, onBeat }: { world: number; onDone: () => void; onBeat?: (cue: string) => void }) {
  const save = useMemo(() => store.get(), []);
  const known = useMemo(() => knownNow(save), []);
  const light = (p: PhonemeId) => petalLight(p, save, known);
  const ctx = useMemo(() => {
    const metOf = (g: Gem) => isMet(gemState(g, save, known));
    const multi = PETALS.map((pt) => ({ p: pt.p, gems: pt.gems.filter((g) => isWayToSpell(g) && metOf(g)) })).filter((m) => m.gems.length >= 2);
    // "Do you remember this one?": a sound from the land just finished
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
  const beats = useMemo(() => worldScript({ multi: ctx.multi, recent: ctx.recent, twoSounds: ctx.twoSounds, met: ctx.met, hidden: ctx.hidden.length }), []);
  const [cue, setCue] = useState("");
  const [flash, setFlash] = useState<PhonemeId | null>(null);
  const [focusP, setFocusP] = useState<PhonemeId | null>(null);
  const [words, setWords] = useState<Explanation["show"]>([]);
  const { later, clear } = useLater();

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
      const step = Math.max(90, Math.min(260, 2600 / Math.max(1, list.length)));
      list.forEach((p, n) => void later(250 + n * step, () => (setFlash(p), n % 3 === 0 && sfx.twinkle())));
      return later(400 + list.length * step, () => setFlash(null));
    }
    if (b.cue === "recap") {
      setFocusP(b.p ?? null);
      setWords(b.show ?? []);
      if (b.p) sfx.petal();
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
      // each beat starts from a clean picture (so Back and Hear it again replay it from its start)
      clear();
      setCue(b.cue);
      setFlash(null);
      setFocusP(null);
      setWords([]);
      onBeat?.(b.cue);
    },
    run: async () => {
      await Promise.all([say(b.say), start(b)]);
    },
  }));
  usePresentation(steps, { id: "world-visit", onDone, state: false });

  const side = cue === "recap" && words.length > 0;
  const colour = focusP ? chartOf(focusP).colour : "#ffc53d";
  return (
    <div className="intro-overlay trip">
      <div className="trip-rays" style={{ "--petal": colour } as React.CSSProperties} />
      <div className={`trip-flower pop-in ${side ? "side" : ""}`}>
        <WorldFlower light={light} flash={flash} ready={focusP ? new Set([focusP]) : undefined} hint={cue === "hidden" ? new Set(ctx.hidden) : undefined} stem={false} />
      </div>
      <NinjaSpot />
      {side && focusP && (
        <div className="trip-recap pop-in" style={{ "--petal": colour } as React.CSSProperties}>
          {/* the sound (its petal picture: tap to hear it) and the spellings of it the child knows */}
          <div className="trip-recap-head">
            <SoundBadge p={focusP} size={88} />
            {PETALS.find((pt) => pt.p === focusP)!.gems.filter((g) => isWayToSpell(g) && isMet(gemState(g, save, known))).slice(0, 4).map((g) => (
              <Jewel key={g.key} g={g.g} colour={colour} state={gemState(g, save, known)} energy={0} size={78} className="pop-in" />
            ))}
          </div>
          <ExampleWords key={words.map((w) => w.word.text).join()} show={words} colour={colour} vertical />
        </div>
      )}
    </div>
  );
}
