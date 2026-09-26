// Dojo: learn new sounds (spelling → sound), find the sound, then build words (segmenting + spelling).
// Slow, calm, no timers. Follows: say the word → say the sounds → build it → read it back.
//
// The player's ninja (docs/HERO.md) stands bottom-left for the whole level and answers every right answer with a move:
// a spell summons each new spelling, a strike lands on the spelling the child found, and every letter tile of a word
// hops up out of the bank, gets kicked, punched, starred or spelled, and flies into its slot. First-try answers build
// the streak (the ninja glows and powers up by itself). Speech always leads; the moves run alongside it.
// Order matters: start the move, THEN count the hit, so a tier-up's power-up waits for the move instead of being
// cancelled by it.
// Two things the Dojo times itself (docs/HERO.md), both so that speech lands right:
// - a wrong answer says "Keep going, ninja!" FIRST (streak.miss({ line: false })), before Sensei's correction, so the
//   last thing a child hears before trying again is the target sound or word (see wrongAnswer);
// - every first-try letter counts at once (its flame lights), but a tier-up earned in the middle of a word is held
//   (streak.hit({ defer: true })) so the next letter's sound can't cut "Super ninja streak!" off: the ninja powers up
//   and says the top tier's line with ninja.streakLine() just before the word is read back (see Build).
// Layout (stage 1280×720): the play area is centred on x 722, between the ninja zone (x 0-330) and Sensei's Help
// corner (x 1116+); rows of tiles stay inside x 340-1100.
// Explanations (docs/NARRATIVE_AUDIT.md; spacing in src/content/narrative.ts, the ledger in ./narrate.tsx): a new
// spelling's reveal can't be cut off by a tap (the tap waits for it), and says "It's two letters, but it's one sound."
// (or, for < x >, two sounds together; for a spelling with a second sound, "The same spelling can sometimes be...");
// adjacent consonants are pointed out before the first word of units 8-10; Help never says a word's sounds one by
// one to a child who is spelling it; a word read back can bring a spaced "two letters, one sound" reminder.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import type { LevelProps } from "../App";
import { GRAPHEMES, teachEntry, type Word, type Seg } from "../content/phonics";
import { knownSpellings } from "../content/worlds";
import { say, sayBlend, sfx, playMusic, preload, urls, isSpeaking, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import { chooseWords, tileBank, shuffle } from "../engine/learner";
import { recordSpell, recordWordSpelt, store } from "../engine/store";
import { pickPraise } from "../engine/feedback";
import { streak, tierOf, streakLine, type StreakEvent, type Tier } from "../engine/streak";
import { NinjaSpot, ninja, type Move } from "../ui/Ninja";
import { Tile, img, RoundButton, Icon, Progress, fx, fxDom, stageRect, sleep, useIdlePrompt, TapHint, tapProps, useHelp, WordCard, SenseiDock } from "../ui/ui";
import type { Level } from "../content/worlds";
import type { PhonemeId } from "../content/phonics";
import { STRETCHED } from "../content/stretch";
import { adjacentSlots, adjacentUnit, clusterFirst, gemSeg, lettersKey, lettersLine, otherSound, twoSoundsKey } from "../content/narrative";
import { NarrOverlay, SlotPointer, beginLevel, correctionFor, explain, explainGemEnergy, heard, isDue, lettersReminder, lettersSay, readThisWay, sameSpellingSay, spellingHelp, twoSoundsReminder } from "./narrate";
import { useLessonClock } from "../engine/lessonClock";
import "../styles/dojo.css";

/** `done.last`: the word that stays up for the finish (a cut lesson can end before the last word) */
type Phase = { k: "learn"; i: number } | { k: "find"; i: number } | { k: "build"; i: number } | { k: "done"; last: number };

/** Centre of the play area (between the ninja and the Help corner), in stage px. */
const MID = 722;

export function Dojo({ level, onDone, onQuit }: LevelProps) {
  useState(() => beginLevel(level)); // (during the first render, before Learn and Build ask what's due)
  const teach = (level.teach ?? []).map(teachEntry);
  // (units 8-10: a word with sounds next to each other first, for the unit's explanation: clusterFirst)
  const words = useRef<Word[]>(clusterFirst(chooseWords(level, 5, "spell", { maxLen: level.units.some((u) => u >= 10) ? 5 : 4 }), level.units)).current;
  const [phase, setPhase] = useState<Phase>(teach.length ? { k: "learn", i: 0 } : { k: "build", i: 0 });
  const mistakes = useRef(0);
  // a cut lesson (§9) ends after the word being built when its time is up; the teaching (Learn, Find) always plays
  const timeUp = useLessonClock(level);
  const total = teach.length * 2 + words.length;
  /** Is teach entry i a new spelling of a sound the child already knows how to spell? */
  const alsoSpelt = (i: number) => [...knownSpellings(level)].some((k) => k !== teach[i].g && GRAPHEMES[k] === teach[i].p && !teach.slice(i).some((x) => x.g === k));
  const doneCount = phase.k === "learn" ? phase.i : phase.k === "find" ? teach.length + phase.i : phase.k === "build" ? teach.length * 2 + phase.i : total;
  // a new level starts a new streak; the ninja mounts after the reset, so it never arrives wearing old flames
  const [fresh, setFresh] = useState(false);
  useLayoutEffect(() => {
    streak.reset();
    setFresh(true);
  }, []);
  const alive = useAlive();

  useEffect(() => {
    playMusic("dojo");
    preload([...teach.map((t) => urls.sound(t.p)), ...words.map((w) => urls.word(w.text))]);
  }, []);

  const next = () => {
    setPhase((p) => {
      if (p.k === "learn") return p.i + 1 < teach.length ? { k: "learn", i: p.i + 1 } : { k: "find", i: 0 };
      if (p.k === "find") return p.i + 1 < teach.length ? { k: "find", i: p.i + 1 } : { k: "build", i: 0 };
      if (p.k === "build") return p.i + 1 < words.length && !timeUp() ? { k: "build", i: p.i + 1 } : { k: "done", last: p.i };
      return p;
    });
  };

  useEffect(() => {
    if (phase.k === "done") {
      (async () => {
        // the ninja's big finish plays while Sensei says well done, and confetti fills the dojo
        fx.rain("confetti", 70);
        await Promise.all([say({ line: "dojo_done" }), ninja.celebrate()]);
        const m = mistakes.current;
        if (alive.current) onDone(m <= 1 ? 3 : m <= 4 ? 2 : 1);
      })();
    }
  }, [phase.k]);

  return (
    <div className={`scene dojo ${phase.k === "done" ? "dj-over" : ""}`}>
      <img className="bg-img" src={img("dojo_bg")} alt="" />
      <div className="vignette" />
      <div className="topbar">
        <RoundButton sm label="map" onClick={onQuit}><Icon.home /></RoundButton>
        <div className="spacer" />
        <Progress value={doneCount / total} />
        <div className="spacer" />
        <div style={{ width: 68 }} />
      </div>
      {fresh && <NinjaSpot />}
      {phase.k === "learn" && (
        <Learn
          key={`l${phase.i}`}
          t={teach[phase.i]}
          first={phase.i === 0}
          onNext={next}
          alsoSpelt={alsoSpelt(phase.i) ? (teach.slice(0, phase.i).some((_, j) => alsoSpelt(j)) ? "again" : "first") : undefined}
          world={level.world}
          secondSound={((o) => (o && teach.slice(0, phase.i).some((x) => x.g === teach[phase.i].g && x.p === o) ? o : null))(otherSound(teach[phase.i]))}
        />
      )}
      {phase.k === "find" && <Find key={`f${phase.i}`} t={teach[phase.i]} pool={[...knownSpellings(level)]} onNext={next} onMiss={() => mistakes.current++} />}
      {/* the last word stays up for the finish: the ninja's stars land on it while the confetti falls */}
      {(phase.k === "build" || (phase.k === "done" && words.length > 0)) &&
        ((i) => <Build key={`b${i}`} word={words[i]} bank={tileBank(words[i], level, 2)} first={i === 0} longer={!teach.length && !!adjacentUnit(level.units)} level={level} onNext={next} onMiss={() => mistakes.current++} />)(
          phase.k === "build" ? phase.i : phase.last,
        )}
      {/* letters flying into their slots (see deliver); part of the scene, so they go with it if the child leaves */}
      <div className="dj-flies" aria-hidden="true" />
      <NarrOverlay />
      <SenseiDock />
    </div>
  );
}

/** Is this component still on screen? (Async sequences stop when the child leaves.) */
function useAlive() {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => void (alive.current = false);
  }, []);
  return alive;
}

// ---------------------------------------------------------------- the ninja's part
/** Moves never repeat the last two; `pool` is already filtered by the streak tier. */
function chooser() {
  const recent: string[] = [];
  return <M extends string>(pool: M[]): M => {
    const fresh = pool.filter((m) => !recent.includes(m));
    const m = fresh[(Math.random() * fresh.length) | 0] ?? pool[0];
    recent.push(m);
    if (recent.length > 2) recent.shift();
    return m;
  };
}
const choose = chooser();

/** A wrong answer. The ninja always tilts its head ("hmm?"), never a hurt look; its flames puff out, the aura fades
 *  and (from a streak of 3 or more) a soft fizzle plays, by themselves. "Keep going, ninja!" comes back for the caller
 *  to say FIRST, ahead of the correction (left to the ninja, it would come after it, and the child would try again with
 *  the encouragement in their ears instead of the target). `line: false` when the correction starts "Yes, ...". */
function wrongAnswer(line = true): Say[] {
  const e = streak.miss({ line: false });
  if (e.prevN === 0) void ninja.act("think"); // (from a streak, the ninja thinks by itself)
  const lost = line ? streakLine(e) : null;
  return lost ? [{ line: lost }, { gap: 250 }] : [];
}

/** Where a strike on a spelling lands: just above its top edge. The spelling sits above the effects layer
 *  (.dj-front), so the impact star bursts out from behind it like a crown, and its letters stay readable while their
 *  sound is said. */
function crown(el: Element): Pt {
  const r = stageRect(el);
  return { x: r.x + r.w / 2, y: r.y - 14 };
}
/** The spelling that was hit squashes and bounces back. No white flash: its letters must stay readable. */
function wobble(el: Element) {
  try {
    el.animate([{ scale: "1" }, { scale: "1.1 0.9", offset: 0.2 }, { scale: "0.96 1.05", offset: 0.5 }, { scale: "1.02 0.98", offset: 0.75 }, { scale: "1" }] as Keyframe[], {
      duration: 420,
      easing: "ease-out",
    }).playbackRate = FAST;
  } catch {}
}
/** "Find the sound" strikes. No star shot from mid-leap or flip volley: they fly level along the row, past the wrong
 *  spellings, and look as if they hit them. When the answer isn't the first in the row, only the moves whose effect
 *  arcs in from above (the spell, the shuriken) or rises steeply (the kick wave); anything that still crosses a
 *  wrong spelling passes behind it (.dj-front). */
function findMove(tier: Tier, first: boolean): Move {
  if (!first) return choose<Move>(["cast", "throw", "kick"]);
  return choose<Move>(tier === 0 ? ["kick", "punch", "cast", "throw"] : ["kick", "punch", "cast", "throw", "spin"]);
}

/** Did this answer power the streak up, with a line for the ninja to say ("Ninja power!")? */
const tierLine = (e: StreakEvent | null) => !!streakLine(e);
/** Say `lead` (the sound), then praise; on a tier-up the ninja's own line is the praise (it says it at the first quiet
 *  moment, and the next item waits until it has). */
async function praiseAfter(e: StreakEvent | null, lead: Say[]) {
  if (tierLine(e)) {
    await say(lead);
    await ninja.linesDone();
  } else await say([...lead, { gap: 150 }, { line: pickPraise() }]);
}

/** How a letter gets into its slot. "carry" is the spell that lifts it; every other move hits the tile, which hops up
 *  out of the bank to meet it and then flies home. */
type Deliver = Move | "carry";
const DELIVER: Record<Tier, Deliver[]> = {
  0: ["kick", "punch", "carry", "throw"],
  1: ["kick", "punch", "carry", "throw", "spin", "jump"],
  2: ["kick", "spin", "carry", "flip", "throw", "jump"],
  3: ["flip", "spin", "carry", "kick", "throw", "jump"],
};
/** The moves that land within about 0.6 s wherever the letter is (on a streak they still upgrade by themselves: a
 *  flying kick, a double jab, a fan of shuriken). */
const QUICK: Deliver[] = ["kick", "punch", "carry", "throw"];
/** Where the ninja's hand is (stage x), and how far away a letter counts as far. */
const HAND_X = 300;
const FAR = 450;
/** Pick the move for a letter. The showy ones (spin, flip, jump) launch late, so their effect takes up to 1.2 s to
 *  reach a letter far across the bank, and the child would be waiting on an empty slot. They are kept for letters near
 *  the ninja while nothing else is in the air; a far letter, a quick child's next letter and a word's last letter (it
 *  holds up the read-back) get a quick one. */
function deliveryFor(el: Element, last: boolean, busy: boolean): Deliver {
  const r = stageRect(el);
  const far = r.x + r.w / 2 - HAND_X > FAR;
  return choose<Deliver>(last || busy || far ? QUICK : DELIVER[streak.tier]);
}

const COLS: Record<Tier, string[]> = {
  0: ["#fff4dc", "#ffe38a", "#ffc53d"],
  1: ["#ffe38a", "#ffc53d", "#ff9a3d", "#fff4dc"],
  2: ["#ff7aa2", "#5ec8f2", "#b48cff", "#ffe38a"],
  3: ["#ff5a5a", "#ffb03d", "#ffe94a", "#5fd35f", "#4ab8ff", "#b48cff"],
};

type Pt = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };
const centre = (r: Box): Pt => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
const bez = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({ x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y });
const frame = () => new Promise<number>((r) => requestAnimationFrame(r));
/** Run `f(t)` for t 0→1 over `ms` (sped up with the bots' fast-forward). Stops early once `alive` goes false. */
async function tween(ms: number, f: (t: number) => void, alive?: { readonly current: boolean }) {
  const t0 = performance.now();
  for (;;) {
    if (alive && !alive.current) return;
    const t = Math.min(1, ((performance.now() - t0) * FAST) / ms);
    f(t);
    if (t >= 1) return;
    await frame();
  }
}

/** The layer letters fly in (.dj-flies, in the scene): above the effects and above the letters already in their slots,
 *  so a letter on its way is never hidden and the ninja's impact bursts out behind it, like the crown on a found
 *  spelling. Being part of the scene, whatever is in the air goes with it when the child leaves. */
const flyLayer = (): HTMLElement | null => document.querySelector<HTMLElement>(".dojo .dj-flies") ?? fxDom();

/** The copy made by the ninja's carry spell is only a picture: keep it away from screen readers and the bots, and move
 *  it into the fly layer with the other letters in the air. (It is made synchronously by ninja.carry().) */
function adoptCarry() {
  const to = flyLayer();
  fxDom()?.querySelectorAll(".fx-carry:not([aria-hidden])").forEach((c) => {
    c.setAttribute("aria-hidden", "true");
    c.classList.add("dj-fly");
    c.querySelectorAll("[aria-label]").forEach((e) => e.removeAttribute("aria-label"));
    if (to && c.parentElement !== to) to.appendChild(c);
  });
}

/** A glowing picture of a tile in the fly layer (stage coordinates). */
function tileCopy(el: HTMLElement, r: Box): HTMLDivElement {
  const box = document.createElement("div");
  box.className = "fx-carry dj-fly";
  box.setAttribute("aria-hidden", "true");
  box.style.width = `${r.w}px`;
  box.style.height = `${r.h}px`;
  const c = el.cloneNode(true) as HTMLElement;
  c.removeAttribute("aria-label");
  c.classList.remove("pressed", "hint", "wrong", "used", "pop-in", "drop-in");
  c.style.cssText += ";position:absolute;inset:0;margin:0;width:100%;height:100%;transform:none;translate:none;scale:none;animation:none;min-width:0";
  box.appendChild(c);
  flyLayer()?.appendChild(box);
  return box;
}

/** A letter lands in its slot. The letters in the slots sit above the effects, so these sparkles fall behind them
 *  and never change a letter's shape (a sparkle on l reads as i). */
function landing(p: Pt, tier: Tier) {
  sfx.place();
  fx.ring(p.x, p.y, { color: COLS[tier][0], r0: 30, r1: 100 + tier * 14, width: 10, life: 18 });
  fx.twinkle(p.x, p.y, COLS[tier], 8 + tier * 2, 6);
  fx.burst(p.x, p.y + 30, "sparks", 8);
}

type Alive = { readonly current: boolean };
/** The ninja delivers the tapped bank tile into its slot. Resolves when it has landed (about 0.6-0.9 s from the tap).
 *  If the child leaves meanwhile (`alive` goes false), the copy is dropped and nothing lands. */
async function deliver(el: HTMLElement, slot: HTMLElement, move: Deliver, alive: Alive): Promise<void> {
  const tier = streak.tier;
  const r0 = stageRect(el), r1 = stageRect(slot);
  if (!r0.w || !r1.w) return;
  const a = centre(r0), b = centre(r1);
  if (move === "carry") {
    const p = ninja.carry(el, slot, { react: false });
    adoptCarry();
    await p;
    if (alive.current) fx.burst(b.x, b.y + 30, "sparks", 8);
    return;
  }
  const box = tileCopy(el, r0);
  let pos = a, rot = 0, sx = 1, sy = 1, k = 1;
  const put = () => (box.style.transform = `translate(${pos.x - r0.w / 2}px, ${pos.y - r0.h / 2}px) rotate(${rot}deg) scale(${sx * k}, ${sy * k})`);
  put();
  // 1. the tile hops up out of the bank (straight away, so the tap feels instant) and hangs there until the hit lands
  const up = { x: a.x + (b.x - a.x) * 0.08, y: a.y - 86 };
  let hit = false;
  void Promise.race([ninja.act(move, up, { react: false }), sleep(1100)]).then(() => (hit = true));
  await tween(170, (t) => {
    const e = 1 - Math.pow(1 - t, 3);
    pos = { x: a.x + (up.x - a.x) * e, y: a.y + (up.y - a.y) * e };
    sx = 1 - 0.1 * Math.sin(Math.PI * t);
    sy = 1 + 0.14 * Math.sin(Math.PI * t);
    put();
  }, alive);
  const h0 = performance.now();
  while (!hit && alive.current) {
    await frame();
    const s = ((performance.now() - h0) * FAST) / 1000;
    pos = { x: up.x, y: up.y - Math.sin(s * 8) * 5 };
    rot = Math.sin(s * 11) * 4;
    put();
  }
  if (!alive.current) return void box.remove();
  // 2. the hit sends it home: an arc into the slot, leaning into the flight and settling upright as it lands.
  //    Letters never tumble: upside down, b is q and p is d.
  const dir = b.x >= up.x ? 1 : -1;
  const lean = (move === "kick" || move === "spin" ? 26 : move === "punch" ? 14 : 20) * dir;
  const end = Math.min(1.35, Math.max(0.7, r1.h / r0.h));
  const ctrl = { x: (up.x + b.x) / 2, y: Math.min(up.y, b.y) - 70 };
  const r = rot;
  const ms = Math.max(230, Math.min(330, Math.hypot(b.x - up.x, b.y - up.y) / 1.7));
  await tween(ms, (t) => {
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    pos = bez(up, ctrl, b, e);
    rot = r * (1 - e) + lean * Math.sin(Math.PI * e);
    k = 1 + (end - 1) * e;
    const s = Math.sin(Math.PI * Math.min(1, t * 1.4));
    sx = 1 + 0.12 * s;
    sy = 1 - 0.08 * s;
    put();
    if (t < 0.92) fx.glow(pos.x, pos.y, COLS[tier], 1, 36, 0.6, 14);
  }, alive);
  box.remove();
  if (alive.current) landing(b, tier);
}

// ---------------------------------------------------------------- learn: hear the sound, see its spelling, tap and say it
function Learn({ t, first, onNext, alsoSpelt, secondSound, world }: { t: Seg; first: boolean; onNext: () => void; alsoSpelt?: "first" | "again"; secondSound?: PhonemeId | null; world: number }) {
  const { g, p } = t;
  const [taps, setTaps] = useState(0);
  // the ninja's spell is on its way to the ear: from now on the ear can't be tapped (a tap, or Help, would cut off the
  // explanation that follows, the key moment of the level) and it charges up until the spell turns it into the letters
  const [casting, setCasting] = useState(false);
  const castingRef = useRef(false);
  const [shown, setShown] = useState(false);
  const [ready, setReady] = useState(false); // Sensei has finished explaining: only now may the idle prompt speak
  const [hint, setHint] = useState(false);
  const ear = useRef<HTMLButtonElement>(null);
  const tapsRef = useRef(0);
  const helped = useRef(false); // Help was pressed during the explanation (and said the gist again itself)
  // The spelling is on screen and Sensei is explaining it (NARRATIVE_AUDIT F06): a tap now would cut off "It's two
  // letters, but it's one sound", the one moment this spelling is taught. The tile nods to show the tap was felt,
  // and the tap counts as soon as the explanation is over.
  const explaining = useRef(false);
  const queued = useRef<HTMLElement | null>(null);
  const alive = useAlive();
  // What this spelling is (said while it is on screen, in the teach.ts wording): "It's two letters, but it's one
  // sound."; < x >: "This spelling is two sounds together!" /k/ /s/; a spelling taught a moment ago with its other
  // sound (th, then th as in "this"): "The same spelling can sometimes be /th/ ... and sometimes /dh/ ..."
  // (NARRATIVE_AUDIT F06, F07, F19). A new spelling of a known sound also says so (in full the first time in a level,
  // then "Same sound, different spellings!").
  const letters = lettersSay(t);
  const about: Say[] = [];
  if (secondSound) about.push(...sameSpellingSay(g, secondSound, p), { gap: 350 });
  else {
    if (alsoSpelt) about.push({ line: alsoSpelt === "first" ? "same_sound_new" : "same_sound_diff" }, { gap: 250 });
    if (letters.length) about.push(...letters, { gap: 300 });
  }
  // the gist, again: the sound, how many letters, "Tap it, and say it with me!"
  const recap: Say[] = [{ sound: p }, { gap: 150 }, ...(letters.length ? [...letters, { gap: 250 }] : []), { line: "dojo_tap_say" }];
  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => setHint(true), 6500);
    return () => clearTimeout(t);
  }, [shown]);
  useEffect(() => {
    (async () => {
      // the dojo, explained the first two times (in different levels); then a short welcome back, then nothing
      const welcome = !first ? null : isDue("dojo:welcome", "twice") ? "dojo:welcome" : isDue("dojo:back", "short") ? "dojo:back" : null;
      // sound first: hear it (twice), then see how we spell it
      const intro: Say[] = [];
      if (welcome) intro.push({ line: welcome === "dojo:welcome" ? "dojo_hello" : "audit_dojo_back" }, { gap: 250 });
      intro.push({ line: "listen" }, { gap: 150 }, { sound: p }, { gap: 500 }, { sound: p }, { gap: 400 });
      const heardIntro = await say(intro); // (false if the child tapped the ear or Help meanwhile: let that finish, then carry on)
      if (heardIntro && welcome) heard(welcome);
      for (let k = 0; k < 50 && isSpeaking(); k++) await sleep(60);
      if (!alive.current) return;
      // the ninja summons the new spelling: a spell flies to the ear, and the letters appear where it bursts
      castingRef.current = true;
      setCasting(true);
      const where = ear.current ?? { x: MID, y: 290 };
      await Promise.race([ninja.act("cast", where, { react: false }), sleep(1500)]);
      if (!alive.current) return;
      explaining.current = true;
      setShown(true);
      sfx.pop();
      // ...and only then "And this is how we spell it", with the letters there to look at. The first long spelling
      // in each land says what that means in full: a sound we hear, a spelling we see (NARRATIVE_AUDIT F11's reprise)
      const hearSee = !!lettersLine(t) && g !== "x" && isDue(`hear-see:w${world}`, "once") ? `hear-see:w${world}` : null;
      const ok = await say([{ line: hearSee ? "audit_hear_see" : "audit_spell_it" }, { gap: 150 }, { sound: p }, { gap: 300 }, ...about, { line: "dojo_tap_say" }]);
      explaining.current = false;
      if (ok && hearSee) heard(hearSee);
      if (ok) {
        // taught: the spaced reminders (narrate.tsx) count from here
        if (secondSound) heard(twoSoundsKey(g));
        else if (lettersLine(t)) heard(lettersKey(g));
      }
      // a tap that waited for the explanation counts now
      const q = queued.current;
      queued.current = null;
      if (q && alive.current) {
        setReady(true);
        return void tapRef.current(q);
      }
      // cut off, and not by the child tapping the spelling or by Help (which says the gist itself): say the gist again
      // in a moment, rather than leaving the child in silence until the idle prompt
      if (!ok && alive.current && !tapsRef.current && !helped.current) {
        for (let k = 0; k < 80 && isSpeaking(); k++) await sleep(60);
        await sleep(1000);
        if (alive.current && !tapsRef.current && !helped.current && !isSpeaking()) await say(recap);
      }
      if (alive.current) setReady(true);
    })();
  }, []);
  useIdlePrompt(ready && taps < 2, 8000, () => say([{ line: "dojo_tap_say" }]));
  useHelp((n) => {
    if (casting && !shown) return; // the spelling is about to appear, with its explanation: let that come
    if (explaining.current) return; // ...and is being explained
    if (shown) helped.current = true;
    say(shown ? recap : [{ line: "listen" }, { sound: p }]).then(() => n > 1 && setHint(true));
  });
  const tap = async (el: HTMLElement) => {
    if (explaining.current) {
      // felt, and kept for when the explanation is over (a nod, a tink; the explanation carries on)
      if (!queued.current) {
        queued.current = el;
        wobble(el);
        sfx.tink();
      }
      return;
    }
    if (!shown || tapsRef.current >= 2) return;
    const n = ++tapsRef.current;
    setTaps(n);
    const at = crown(el);
    fx.burst(at.x, at.y + 60, "petals", 10);
    // each "say it with me" gets a move; it lands on the top edge of the spelling, behind it, and the spelling bounces
    const move = n >= 2 ? ninja.strike(at, { react: false }) : ninja.act(choose<Move>(["jump", "punch", "throw"]), at, { react: false });
    void move.then(() => alive.current && wobble(el));
    // errorless teaching counts gently: only the level's first new spelling adds to the streak, so the glow still
    // means "you're getting them right" (counted after the move starts, see the top of the file)
    const e = n >= 2 && first ? streak.hit() : null;
    await say({ sound: p });
    if (n >= 2) {
      sfx.good();
      if (tierLine(e)) await ninja.linesDone();
      else await say({ line: pickPraise() });
      if (alive.current) onNext();
    }
  };
  const tapRef = useRef(tap);
  tapRef.current = tap;
  (window as any).__snState = { scene: "learn", next: shown ? g : null, streak: streak.n };
  return (
    <div className={`center dj-learn ${shown ? "dj-front" : ""}`} style={{ left: MID, top: "46%" }}>
      {shown ? (
        <span className="dj-reveal">
          <Tile g={g} size="xl" onTap={tap} className={taps < 2 ? "hint" : "right"} withButtons={g.length > 1 || g === "x"} />
        </span>
      ) : (
        <button
          ref={ear}
          className={`btn-round dj-ear ${casting ? "casting" : "pulse"}`}
          aria-label="Hear the sound"
          aria-disabled={casting || undefined}
          {...tapProps(() => void (castingRef.current || say({ sound: p })))}
          style={{ width: 230, height: 230 }}
        >
          <Icon.ear />
        </button>
      )}
      <TapHint show={hint && taps === 0} style={{ right: -60, bottom: 20 }} />
      <div className="row" style={{ marginTop: 28 }}>
        {[0, 1].map((i) => (
          <img key={i} src={img("item_petal")} alt="" className={i < taps ? "dj-petal on" : "dj-petal"} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- find: which of these is the new spelling?
function Find({ t, pool, onNext, onMiss }: { t: Seg; pool: string[]; onNext: () => void; onMiss: () => void }) {
  const { g, p } = t;
  const choices = useRef(shuffle([g, ...shuffle(pool.filter((x) => x !== g && GRAPHEMES[x] !== p && !(g === "u" && x === "w"))).slice(0, 3)])).current;
  const [state, setState] = useState<Record<string, "wrong" | "right">>({});
  const [blown, setBlown] = useState(false);
  const [ready, setReady] = useState(false); // the question has been asked: only now may the idle prompt repeat it
  const firstTry = useRef(true);
  const alive = useAlive();
  const prompt = () => say([{ line: "dojo_find" }, { gap: 450 }, { sound: p }]);
  // the speaker button, explained the first two times it matters (docs/ARCHITECTURE.md §15.3): it pulses meanwhile
  const [speakerTip, setSpeakerTip] = useState(false);
  useEffect(
    () =>
      void prompt().then(async (ok) => {
        if (!alive.current) return;
        if (ok && isDue("hear-again", "twice")) {
          setSpeakerTip(true);
          await explain("hear-again", "twice", [{ gap: 250 }, { line: "tut_speaker" }]);
          if (!alive.current) return;
          setSpeakerTip(false);
        }
        setReady(true);
      }),
    [],
  );
  const [helpLvl, setHelpLvl] = useState(0);
  useHelp((n) => {
    setHelpLvl(n);
    say(n >= 2 ? [{ line: "help_look" }, { gap: 100 }, { sound: p }] : [{ line: "dojo_find" }, { gap: 450 }, { sound: p }, { gap: 200 }, { line: "help_listen" }]);
  });
  const solved = state[g] === "right";
  useIdlePrompt(ready && !solved, 9000, prompt);
  // multi-letter spellings are wider: keep the row inside the play area
  const wide = choices.reduce((s, c) => s + Math.max(150, c.length * 54 + 44), 0) + 30 * (choices.length - 1) > 740;
  const tap = async (c: string, el: HTMLElement) => {
    if (state[g] === "right") return;
    if (c === g) {
      setState((s) => ({ ...s, [c]: "right" }));
      sfx.good();
      // the strike comes down on the top edge of the spelling they found (the row sits above the effects, so the
      // impact blooms behind it and its letters stay readable while its sound is said); the shockwave blows the
      // others back. Then the hit is counted: after the move has started (see the top of the file).
      void ninja.strike(crown(el), { move: findMove(streak.tier, choices[0] === g), react: false }).then(() => {
        if (!alive.current) return;
        wobble(el);
        setBlown(true);
      });
      const e = firstTry.current ? streak.hit() : null;
      await praiseAfter(e, [{ sound: p }]);
      if (alive.current) onNext();
    } else {
      firstTry.current = false;
      onMiss();
      const lead = wrongAnswer(); // "Keep going, ninja!" first (from a streak), so the correction ends on the target
      setState((s) => ({ ...s, [c]: "wrong" }));
      sfx.wrong();
      await say([...lead, { line: "thats" }, { sound: GRAPHEMES[c] }, { gap: 200 }, { line: "listen" }, { sound: p }], { reveal: true });
      setState((s) => {
        const n = { ...s };
        delete n[c];
        return n;
      });
    }
  };
  const at = choices.indexOf(g);
  (window as any).__snState = { scene: "find", next: g, streak: streak.n };
  return (
    <>
      <div className="center dj-front" style={{ left: MID, top: "44%" }}>
        <div className="row" style={{ gap: wide ? 22 : 30, flexWrap: "nowrap" }}>
          {choices.map((c, i) => (
            <div
              key={c}
              className={`drop-in ${solved && c !== g ? "dj-dim" : ""} ${blown && c !== g ? "dj-blown" : ""}`}
              style={{ animationDelay: `${i * 0.08}s`, "--dir": i < at ? -1 : 1 } as CSSProperties}
            >
              <Tile g={c} size="lg" state={state[c] ?? (helpLvl >= 2 && c === g ? "hint" : "")} onTap={(el) => tap(c, el)} style={wide ? ({ "--size": "132px" } as CSSProperties) : undefined} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: MID, bottom: 60, translate: "-50% 0" }}>
        <RoundButton label="Hear it again" className={speakerTip ? "pulse" : ""} onClick={prompt}><Icon.speaker /></RoundButton>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- build: hear the word, build it sound by sound, read it back
/** Where the row of slots sits (below the word card). */
const SLOT_ROW: CSSProperties = { position: "absolute", left: MID, top: 332, translate: "-50% 0" };

/** A letter after a tier-up that is being held for the finished word (see Build): energy gathers into the ninja, a
 *  little more each time, so it reads as charging up for the power-up that comes with the word. Silent: the letter's
 *  sound is what the child should hear. */
function gather(k: number) {
  const s = document.querySelector(".dojo .ninja-spot");
  const r = s ? stageRect(s) : { x: 40, y: 340, w: 250, h: 362 };
  if (!r.w) return;
  const c = { x: r.x + r.w / 2, y: r.y + r.h - r.w * 0.66 };
  const cols = COLS[tierOf(streak.n)];
  fx.implode(c.x, c.y, cols, 12 + k * 5, 150 + k * 20, 22);
  fx.glow(c.x, c.y, cols, 4 + k * 2, 50, 1.5, 24);
}

/** Bank tile size: the row must fit between the ninja and the Help corner (x 340-1100). */
function bankSize(bank: string[]): { size: number; gap: number } {
  for (const [size, gap] of [[104, 16], [96, 14], [88, 12], [80, 10]] as const) {
    const w = bank.reduce((s, g) => s + Math.max(size, g.length * size * 0.36 + 42), 0) + gap * (bank.length - 1);
    if (w <= 730) return { size, gap };
  }
  return { size: 76, gap: 8 };
}

/** Word building: hear the word, build it sound by sound in slots, then read it back with sound buttons lit. */
export function Build({ word, bank: bankIn, first, onNext, onMiss, longer, level }: { word: Word; bank: string[]; first: boolean; onNext: () => void; onMiss: () => void; longer?: boolean; level: Level }) {
  const bank = useRef(bankIn).current;
  const { size, gap } = bankSize(bank);
  const [filled, setFilled] = useState<string[]>([]);
  const filledRef = useRef<string[]>([]);
  const [landed, setLanded] = useState<Set<number>>(() => new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [lit, setLit] = useState(-1);
  const [done, setDone] = useState(false);
  const [hop, setHop] = useState(false);
  const finishing = useRef(false);
  const flights = useRef<Promise<void>[]>([]);
  const inAir = useRef(0); // letters on their way to a slot
  // letters since a tier-up was held for the finished word (see the top of the file): the ninja gathers power
  const gathering = useRef(0);
  const misses = useRef(0);
  const slotMisses = useRef(0); // misses on the current slot: 1st → listen again, 2nd → show
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slotsRef = useRef<HTMLDivElement>(null);
  const wordToken = useRef({}).current; // this word (a second "listen again" in one word is short)
  const alive = useAlive();
  // Adjacent consonants (units 8-10, NARRATIVE_AUDIT F12): at the first word in the level with sounds next to each
  // other (the Dojo puts one first: clusterFirst), once per unit, arrows point at the slots of the sounds that sit
  // next to each other, and Sensei says so (while the word is said slowly, when there is a stretched recording). Taps
  // wait for it: it is the one time the idea is explained.
  const unit = adjacentUnit(level.units);
  const pairs = adjacentSlots(word.segs);
  const [neighbours] = useState(() => (!!unit && pairs.length > 1 && isDue(`adjacent:u${unit}`, "once") ? `adjacent:u${unit}` : null));
  const [pointAt, setPointAt] = useState<number[]>([]);
  const introLock = useRef(!!neighbours);
  const prompt = async (intro = false) => {
    const seq: Say[] = [];
    if (intro && neighbours) {
      const slow = STRETCHED.has(word.text);
      setPointAt(pairs);
      const ok = await say([{ line: slow ? "audit_neighbours" : "audit_neighbours_plain" }, ...(slow ? [{ gap: 300 }, { stretch: word.text }] : []), { gap: 450 }]);
      if (!alive.current) return;
      setPointAt([]);
      if (ok) heard(neighbours);
      introLock.current = false;
      seq.push({ line: "dojo_build_word" }, { gap: 500 });
    } else if (intro && first) seq.push({ line: longer ? "dojo_longer" : "dojo_build" }, { gap: 200 }, { line: "dojo_build_word" }, { gap: 500 });
    seq.push({ word: word.text });
    await say(seq);
  };
  // the idle prompt waits until the word has been said (it used to fire a second after the dictation)
  const [ready, setReady] = useState(false);
  useEffect(() => void prompt(true).then(() => alive.current && setReady(true)), []);
  useIdlePrompt(ready && !done, 9000, () => say([{ line: "which_sound" }, { gap: 100 }, { word: word.text }]));
  const [helpLvl, setHelpLvl] = useState(0);
  useEffect(() => setHelpLvl(0), [filled.length]);
  useHelp(
    (n) => {
      if (introLock.current) return;
      setHelpLvl(n);
      if (n === 1) say([{ word: word.text }, { gap: 350 }, { line: "help_tiles" }]);
      // the whole word again, slowly where we can, and an arrow at the slot they're on: never the word's sounds one by
      // one, which would do the segmenting for a child who is spelling it (NARRATIVE_AUDIT F27)
      else if (n === 2) say(spellingHelp(word.text));
      else say([{ line: "help_look" }, { gap: 100 }, { sound: word.segs[filledRef.current.length]?.p ?? word.segs[0].p }], { reveal: true });
    },
    [filled.length],
  );

  /** The finished word: stars (or a cheer) from the ninja, and the letters hop in a wave when they land. */
  const finisher = () => {
    const tier = streak.tier;
    const m: Move = tier === 0 ? "cheer" : choose<Move>(tier === 1 ? ["jump", "cheer"] : ["flip", "jump"]);
    const row = slotsRef.current;
    const c = row ? centre(stageRect(row)) : { x: MID, y: 382 };
    fx.burst(c.x, c.y, "petals", 24);
    if (m === "cheer" || !row) {
      void ninja.act("cheer");
      setHop(true);
    } else void ninja.act(m, row, { react: false }).then(() => alive.current && setHop(true)); // it bursts behind the word
  };

  const tap = async (g: string, el: HTMLElement) => {
    if (finishing.current) return;
    if (introLock.current) return void wobble(el); // the adjacent-sounds explanation first (it's short)
    const i = filledRef.current.length;
    const need = word.segs[i];
    if (!need) return;
    if (g === need.g) {
      const firstTry = slotMisses.current === 0; // a glowing hint after Help still counts: it was their tap
      slotMisses.current = 0;
      recordSpell(need, misses.current === 0);
      filledRef.current = [...filledRef.current, g];
      setFilled(filledRef.current);
      say({ sound: need.p });
      const last = filledRef.current.length === word.segs.length;
      const slot = slotRefs.current[i];
      const move = deliveryFor(el, last, inAir.current > 0);
      // deliver() starts the ninja's move straight away (before its first await); only then count the hit, so a
      // tier-up's power-up follows the move instead of being cancelled by it
      inAir.current++;
      const flight = (slot ? deliver(el, slot, move, alive) : Promise.resolve()).then(() => {
        inAir.current--;
        // the flying copy has just gone: put the letter in its slot before the next paint, or it blinks out for a
        // frame (a state update from here would otherwise render a frame later)
        if (alive.current) flushSync(() => setLanded((s) => new Set(s).add(i)));
      });
      // the letter counts at once (its flame lights); a tier-up waits for the finished word, because the child's next
      // tap would cut the ninja's "Super ninja streak!" off (every letter's sound interrupts whatever is being said)
      if (firstTry) streak.hit({ defer: true });
      if (ninja.heldTier) {
        const k = ++gathering.current;
        void flight.then(() => alive.current && gather(k)); // meanwhile the ninja visibly gathers power
      }
      flights.current.push(flight);
      if (last) {
        finishing.current = true;
        recordWordSpelt(word, misses.current === 0);
        await Promise.all([...flights.current, sleep(500)]);
        // a tier-up on the word (the highest, if it crossed two): the ninja powers up and says its line before the
        // read-back (which would cut it off)
        if (alive.current && ninja.heldTier) await ninja.streakLine();
        gathering.current = 0;
        if (!alive.current) return;
        setDone(true);
        // the first word read back in each land's first dojo: "Ninjas read this way!", an arrow under the word
        if (first) await readThisWay(slotsRef.current, level.world);
        if (!alive.current) return;
        await sayBlend(word.segs, word.text, setLit);
        if (!alive.current) return;
        // a spaced reminder about one of its spellings, with that spelling lit: "It's two letters, but it's one
        // sound." or "This can be /th/, but in this word, it's /dh/." (narrate.tsx says when one is due)
        const remind = twoSoundsReminder(word.segs) ?? lettersReminder(word.segs);
        if (remind) {
          setLit(remind.i);
          if (await say([{ gap: 250 }, ...remind.say])) remind.done();
          if (!alive.current) return;
        }
        setLit(-1);
        sfx.great();
        finisher();
        await say({ line: pickPraise() });
        // the first time right answers fill a gem (once per save): the gem pops up beside the picture, and fills
        if (alive.current) await explainGemEnergy(gemSeg(word, level.teach), { x: MID - 262, y: 196 }, () => alive.current);
        if (alive.current) onNext();
      }
    } else {
      misses.current++;
      onMiss();
      recordSpell(need, false);
      const same = GRAPHEMES[g] === need.p; // that correction starts "Yes, that's a spelling of that sound too!"
      const lead = wrongAnswer(!same);
      gathering.current = 0;
      setWrong(g);
      sfx.wrong();
      slotMisses.current++;
      // "Keep going, ninja!" (from a streak) first, so the last thing heard is the stretched word or the target sound
      await say([...lead, ...correctionFor(g, need, word.text, slotMisses.current, wordToken)], { reveal: slotMisses.current > 1 });
      setWrong(null);
    }
  };

  const used = [...filled];
  (window as any).__snState = { scene: "build", next: word.segs[filled.length]?.g, word: word.text, streak: streak.n };
  return (
    <>
      <WordCard word={word} className="pop-in" onHear={() => prompt()} style={{ left: MID - 150, top: 90, width: 300, height: 214 }} />
      {word.pic && (
        <div style={{ position: "absolute", left: MID + 172, top: 150 }}>
          <RoundButton sm label="Hear the word" onClick={() => prompt()}><Icon.speaker /></RoundButton>
        </div>
      )}
      {/* the slots in two layers at the same spot. The empty slots sit below the effects, so a letter's glowing copy
          is seen arriving in them; the letters that have landed sit above the effects (.dj-slots), so sparkles and
          impacts fall behind them and never change a letter's shape, and the finishing stars burst behind the word */}
      <div className="slots dj-slotbg" style={SLOT_ROW}>
        {word.segs.map((_, i) => {
          const cls = landed.has(i) ? "filled" : i === filled.length && !done ? "active" : i < filled.length ? "incoming" : "";
          // arrows: at the sounds that sit together (the adjacent-sounds explanation), or at the slot Help asks about
          const point = pointAt.includes(i) || (helpLvl === 2 && i === filled.length && !done);
          return (
            <div key={i} ref={(el) => void (slotRefs.current[i] = el)} className={`slot ${cls}`}>
              {point && <SlotPointer />}
            </div>
          );
        })}
      </div>
      <div className="slots dj-slots" ref={slotsRef} style={SLOT_ROW}>
        {word.segs.map((_, i) => {
          const here = landed.has(i);
          return (
            <div key={i} className={`slot ${here ? "filled" : ""}`}>
              {here && (
                <span className={`dj-seat ${hop ? "dj-hop" : ""}`} style={{ animationDelay: `${i * 0.09}s` }}>
                  <Tile g={filled[i]} className={`dj-land ${done ? "right" : ""}`} withButtons={done} lit={lit === i} />
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className={`row dj-bank ${done ? "dj-cleared" : ""}`} style={{ position: "absolute", left: 340, right: 180, bottom: 30, gap, flexWrap: "nowrap" }}>
        {bank.map((g) => {
          const idx = used.indexOf(g);
          if (idx >= 0) used.splice(idx, 1);
          const isUsed = idx >= 0 && !word.segs.slice(filled.length).some((s) => s.g === g);
          return (
            <Tile
              key={g}
              g={g}
              style={size !== 104 ? ({ "--size": `${size}px` } as CSSProperties) : undefined}
              state={wrong === g ? "wrong" : isUsed ? "used" : (misses.current >= 2 || helpLvl >= 3) && g === word.segs[filled.length]?.g ? "hint" : ""}
              onTap={(el) => tap(g, el)}
            />
          );
        })}
      </div>
    </>
  );
}

export { store };
