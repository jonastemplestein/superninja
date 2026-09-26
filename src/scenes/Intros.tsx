// First-time, step-by-step introductions for the World Flower, and the trips that bring the child
// back to the World Flower (World Flower 2.0, docs/FEEDBACK.md Round 12; engine/gems.ts FlowerVisit says when):
// - GemFound: a level has just taught new spellings. Each gem's dark crystal cracks open in its petal (a new sound's
//   petal first shines through the mist), and Sensei explains the spelling in teacher language, counting the ways to
//   spell the sound and pointing out a spelling that spells another sound too.
// - WorldVisit: the start of a new land. The flower so far (every sound the child knows lights up in turn), one sound
//   re-explained with fresh examples, and the petals still hiding in this land's mist.
// Each step is spoken, with its own picture and motion; tapping skips to the next step. What Sensei says is in
// content/teach.ts (foundScript, worldScript).
import { useEffect, useMemo, useRef, useState } from "react";
import { say, sfx, hush } from "../engine/audio";
import { img, tapProps, fx, RoundButton, Icon, stageRect, useHelp } from "../ui/ui";
import { GemIcon } from "../ui/Gem";
import { NinjaSpot, ninja } from "../ui/Ninja";
import { PETALS, GEMS, chartOf, type Gem } from "../content/flower";
import { foundScript, worldScript, type Beat, type Explanation } from "../content/teach";
import { store } from "../engine/store";
import { gemState, knownNow, isMet, isWayToSpell, otherSoundsOf, petalOfGem, worldNewSounds, gemByKey } from "../engine/gems";
import type { PhonemeId } from "../content/phonics";
import { teardrop, WorldFlower, FLOWER_RINGS, BigPetal, ExampleWords, Jewel, petalLight, slotsOf } from "./Tree";

function useSteps(lines: (string | [string, ...any[]])[], onDone: () => void) {
  const [step, setStep] = useState(0);
  const token = useRef(0);
  useEffect(() => {
    const my = ++token.current;
    (async () => {
      const l = lines[step];
      const seq = Array.isArray(l) ? [{ line: l[0] }, ...l.slice(1)] : [{ line: l }];
      await say(seq as any);
      if (my !== token.current) return;
      await new Promise((r) => setTimeout(r, 500));
      if (my !== token.current) return;
      if (step + 1 < lines.length) setStep(step + 1);
      else onDone();
    })();
  }, [step]);
  const next = () => {
    token.current++;
    hush();
    if (step + 1 < lines.length) setStep(step + 1);
    else onDone();
  };
  return { step, next };
}

/** "Inside each petal are shiny gems. Each gem is a way to spell the sound." (spell, not write: NARRATIVE_AUDIT) */
const I3 = "wf_i3";

export function FlowerIntro({ onDone }: { onDone: () => void }) {
  const { step, next } = useSteps(["flower_i1", ["flower_i2", { gap: 200 }, { sound: "a" }], I3, "flower_i4", "flower_i5", "flower_i6"], onDone);
  const [energy, setEnergy] = useState(0);
  useEffect(() => {
    if (step === 3) {
      setEnergy(0);
      const t = setInterval(() => setEnergy((e) => Math.min(1, e + 0.1)), 180);
      return () => clearInterval(t);
    }
    if (step === 4) {
      sfx.petal();
      fx.burst(640, 330, "sparks", 24);
    }
    if (step === 5) setTimeout(() => (sfx.great(), fx.rain("petals", 40)), 900);
  }, [step]);
  const petalColour = "#ff6b5b";
  return (
    <div className="intro-overlay" data-modal {...tapProps(next)}>
      {/* the World Flower with every petal gone; at the last step the /a/ petal flies home */}
      <div className={`intro-flower ${step >= 1 && step < 5 ? "shrink" : ""}`}>
        <WorldFlower light={(p) => (step >= 5 && p === "a" ? 1 : 0)} landing={step >= 5 ? "a" : null} />
      </div>
      {step >= 1 && step < 5 && (
        <div className={`intro-petal pop-in`}>
          <svg viewBox="-110 -160 220 320" width="260" height="380">
            <path d={teardrop(210, 310)} fill="#fff" stroke={petalColour} strokeWidth={10} />
          </svg>
          <img src={img("petal_a")} alt="" style={{ position: "absolute", right: -10, top: 0, width: 80 }} />
          <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            {step >= 2 && <GemIcon g="a" colour={petalColour} state={step >= 4 ? "ready" : step === 3 ? "charging" : "charging"} energy={step >= 4 ? 1 : energy} size={130} />}
          </div>
        </div>
      )}
      <div style={{ position: "absolute", right: 24, top: 24 }}>
        <RoundButton sm label="Next" onClick={next}><Icon.next /></RoundButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- trips to the World Flower
/**
 * Plays a trip's beats in order: each beat's picture (`onStart`) and speech, a short breath, then the next. A tap
 * (`next`) skips to the next beat. Calls `onDone` after the last.
 */
function useBeats(beats: Beat[], onStart: (b: Beat, i: number) => void, onDone: () => void, onBeat?: (cue: string) => void) {
  const [i, setI] = useState(0);
  const token = useRef(0);
  const finished = useRef(false);
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };
  useEffect(() => {
    const my = ++token.current;
    const b = beats[i];
    if (!b) return void setTimeout(finish, 400);
    onBeat?.(b.cue);
    onStart(b, i);
    (async () => {
      await say(b.say);
      if (my !== token.current) return;
      await new Promise((r) => setTimeout(r, b.cue === "found" ? 250 : 450));
      if (my === token.current) setI(i + 1);
    })();
  }, [i]);
  useEffect(() => () => void (token.current++), []);
  const next = () => {
    token.current++;
    hush();
    setI((n) => Math.min(n + 1, beats.length));
  };
  // Help: say this part again
  useHelp(() => beats[i] && say(beats[i].say), [i]);
  return { i, beat: beats[i] as Beat | undefined, next };
}

/** Where the petal stands in a trip (stage coordinates; the words go on the right, clear of Sensei's corner). */
const TP = { left: 400, top: 96, w: 330, h: 470 };

/**
 * Spellings met for the first time in a level: their gems appear in their petals. For each gem: a new sound's petal
 * shines through the mist ("You found a new sound!"), or the gem's petal appears ("You found a new gem! It goes in the
 * petal for the sound /ae/."); the dark crystal cracks open and the gem appears; Sensei explains the spelling with its
 * words on cards; the ways the child knows light up as she counts them; and a spelling that also spells another sound
 * the child knows gets "The same spelling can sometimes be…".
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
  const [cur, setCur] = useState(items[0]?.key ?? null);
  const [clear, setClear] = useState<string[]>([]); // petals whose mist has cleared
  const [shown, setShown] = useState<string[]>([]); // gems whose crystal has cracked open
  const [cracking, setCracking] = useState<string | null>(null);
  const [lit, setLit] = useState<string[]>([]);
  const [words, setWords] = useState<Explanation["show"]>([]);
  const petalRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
  const item = items.find((x) => x.key === cur) ?? items[0];

  const crack = (key: string, delay: number) => {
    // the ninja casts a spell at the dark crystal, and it cracks open as the spell lands
    later(Math.max(0, delay - 550), () => void ninja.act("cast", petalRef.current?.querySelector(`[data-slot="${CSS.escape(key)}"]`) ?? undefined, { react: false }));
    later(delay, () => {
      setCracking(key);
      sfx.sparkle();
      const el = petalRef.current?.querySelector(`[data-slot="${CSS.escape(key)}"]`);
      if (el) {
        const r = stageRect(el);
        later(380, () => {
          fx.burst(r.x + r.w / 2, r.y + r.h / 2, "sparks", 24, 1.1);
          fx.twinkle(r.x + r.w / 2, r.y + r.h / 2, ["#fff4dc", "#ffe38a"], 10, 6, 28);
          fx.ring(r.x + r.w / 2, r.y + r.h / 2, { color: "#ffe38a", r0: 20, r1: 160, width: 10 });
        });
      }
      later(900, () => {
        setShown((s) => [...s, key]);
        setCracking(null);
      });
    });
  };

  const { next } = useBeats(
    beats,
    (b) => {
      const it = items.find((x) => x.key === b.gem);
      if (it && it.key !== cur) {
        setCur(it.key);
        setLit([]);
        setWords([]);
        sfx.page();
      }
      const key = it?.key ?? cur;
      if (!key || !it) return;
      if (b.cue === "found") {
        setWords([]);
        if (it.newSound) {
          // the petal shines through the mist, then its gem appears
          later(300, () => {
            setClear((c) => [...c, it.pt.p]);
            sfx.petal();
            fx.twinkle(TP.left + TP.w / 2, TP.top + TP.h / 2, ["#fff4dc", "#ffe38a", chartOf(it.pt.p).colour], 18, 9, 30);
          });
          crack(key, 1400);
        } else crack(key, 500);
      }
      if (b.cue === "explain" || b.cue === "same-spelling") {
        setWords(b.show ?? []);
        if (!shown.includes(key) && cracking !== key) {
          setClear((c) => [...c, it.pt.p]);
          crack(key, 100);
        }
      }
      if (b.cue === "ways") {
        const metKeys = it.pt.gems.filter((g) => isWayToSpell(g) && isMet(gemState(g, save, known))).map((g) => g.key);
        setLit([]);
        metKeys.forEach((k, n) => later(300 + n * 420, () => (setLit((l) => [...l, k]), sfx.tink())));
      }
    },
    onDone,
    onBeat,
  );

  if (!item) return null;
  const colour = chartOf(item.pt.p).colour;
  // the petal as it looks now, except gems of this trip that haven't cracked open yet
  const slots = slotsOf(item.pt, save, known).map((s) => (gems.includes(s.gem.key) && !shown.includes(s.gem.key) && cracking !== s.gem.key ? { ...s, st: "hidden" as const } : s));
  return (
    <div className="intro-overlay trip" data-modal {...tapProps(next)}>
      <div className="trip-rays" style={{ "--petal": colour } as React.CSSProperties} />
      <div ref={petalRef} key={item.pt.p} className="trip-petal pop-in" style={{ left: TP.left, top: TP.top }}>
        <BigPetal p={item.pt.p} w={TP.w} h={TP.h} light={petalLight(item.pt.p, save, known)} slots={slots} reveal={cracking} lit={lit} mist={item.newSound && !clear.includes(item.pt.p)} focus={shown.includes(item.key) ? item.key : null} />
      </div>
      <div className="trip-words">
        <ExampleWords key={words.map((w) => w.word.text).join()} show={words} colour={colour} vertical />
      </div>
      <NinjaSpot />
      <div style={{ position: "absolute", right: 24, top: 24 }}>
        <RoundButton sm label="Next" onClick={next}><Icon.next /></RoundButton>
      </div>
    </div>
  );
}

/**
 * The start of a new land: "Let's visit the World Flower!" · "Every shining petal is a sound you know!" (each petal the
 * child knows lights up in turn round the flower) · one sound re-explained (rotating between "same sound, different
 * spellings", "do you remember this one?" and "the same spelling can sometimes be…", with fresh examples) · "New sounds
 * are hiding in this land. Let's go and find them!" (the petals of this land's new sounds shimmer through the mist).
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
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));

  const { next } = useBeats(
    beats,
    (b) => {
      setCue(b.cue);
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setFlash(null);
      if (b.cue === "visit") {
        sfx.petal();
        later(200, () => fx.twinkle(650, 300, ["#fff4dc", "#ffe38a"], 16, 8, 30));
        void ninja.act("cheer");
      }
      if (b.cue === "petals") {
        // every sound the child knows lights up in turn, round the flower
        const list = ctx.shining;
        const step = Math.max(90, Math.min(260, 2600 / Math.max(1, list.length)));
        list.forEach((p, n) =>
          later(250 + n * step, () => {
            setFlash(p);
            if (n % 3 === 0) sfx.twinkle();
          }),
        );
        later(400 + list.length * step, () => setFlash(null));
      }
      if (b.cue === "recap") {
        setFocusP(b.p ?? null);
        setWords(b.show ?? []);
        if (b.p) sfx.petal();
      }
      if (b.cue === "hidden") {
        setFocusP(null);
        setWords([]);
        sfx.sparkle();
        void ninja.act("jump", { x: 650, y: 300 }, { react: false });
      }
    },
    onDone,
    onBeat,
  );

  const side = cue === "recap" && words.length > 0;
  const colour = focusP ? chartOf(focusP).colour : "#ffc53d";
  return (
    <div className="intro-overlay trip" data-modal {...tapProps(next)}>
      <div className="trip-rays" style={{ "--petal": colour } as React.CSSProperties} />
      <div className={`trip-flower pop-in ${side ? "side" : ""}`}>
        <WorldFlower light={light} flash={flash} ready={focusP ? new Set([focusP]) : undefined} hint={cue === "hidden" ? new Set(ctx.hidden) : undefined} stem={false} />
      </div>
      <NinjaSpot />
      {side && focusP && (
        <div className="trip-recap pop-in" style={{ "--petal": colour } as React.CSSProperties}>
          {/* the sound's picture and the spellings of it the child knows */}
          <div className="trip-recap-head">
            <img src={img(`petal_${focusP}`)} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
            {PETALS.find((pt) => pt.p === focusP)!.gems.filter((g) => isWayToSpell(g) && isMet(gemState(g, save, known))).slice(0, 4).map((g) => (
              <Jewel key={g.key} g={g.g} colour={colour} state={gemState(g, save, known)} energy={0} size={78} className="pop-in" />
            ))}
          </div>
          <ExampleWords key={words.map((w) => w.word.text).join()} show={words} colour={colour} vertical />
        </div>
      )}
      <div style={{ position: "absolute", right: 24, top: 24 }}>
        <RoundButton sm label="Next" onClick={next}><Icon.next /></RoundButton>
      </div>
    </div>
  );
}
