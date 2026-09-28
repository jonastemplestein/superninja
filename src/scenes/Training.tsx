// The dojo welcome: three ninja tricks (docs/TEACHER_SCRIPT.md §3.4, FIX_PLAN TV-A.1; it supersedes SCRIPT_FIXES C19 and
// the plan's A.1). A teacher on a class's first morning: brisk and playful on the tricks, slow and inviting on each
// "Can you…?".
//   hello   "Welcome to my dojo. A dojo is a school for ninjas." · "I'll teach you three ninja tricks. Each one wins a
//           star." (three grey stars pop in at the top, one after another)
//   gong    "Trick one is the gong. Tap it, and your ninja will kick it." (the gong drops in, glowing, with the pointing
//           hand) · the kick: BONG, the first star lights · "Bong! That's your first star."
//   help    "Here's trick two. If you're ever stuck, tap me, down here in the corner." (the ninja scratches its head; the
//           big arrow sweeps to Sensei) · "Can you tap me now?" · the Help tap: the second star · "That's it! I'm always
//           here to help."
//   speaker "Here's trick three, the speaker. First, listen to my little ninja rhyme." (the speaker pops into the nav row,
//           glowing) · "Tip, tap, tiptoe, quiet as a mouse." (the ninja tiptoes) · "Tap the speaker, and I'll say it
//           again." (the pointing hand) · the tap: the rhyme again, the third star
//   done    "Three tricks, three stars. Now you're ready for your first game." (the stars shine, the ninja powers up; it
//           is the speaker trick's praise too) · the held ▶: "It's a listening game, called Ninja Ears. Tap the green
//           arrow when you're ready." (▶ pops in; the ninja turns to it in its ready stance, and bows on the tap), then
//           the first lesson. (A held step, not a game's Ready: Ninja Ears has its own after its frame and demo.)
// TS §3.4's "That's it! The speaker always says it again." (`tv_train_speaker_ok`) is not said (fix round 2, 27 Sep): it
// and "Three tricks, three stars…" were two wraps back to back after the child's last trick; the replay itself shows
// what the speaker does, and `tv_train_hear_again` explains it (line tags: `mech:replay-button`). The speaker tap to the
// next line went from 6.4 s to 3.7 s (first-minutes, playtest/runs/fix/A-r2).
// Its length is the script's: TS §3.4's lines are about 40 s of Sensei for a quick child, so the welcome takes about
// 47 s (55 s for the learner bot), not FIRST_MINUTES §14's 12 s (which was the gong and Help alone, before the speaker
// and the stars). What isn't speech is kept to breaths: 0.25–0.4 s between lines and tricks (TRICK_BREATH).
// Nothing taps for the child (docs/NAVIGATION.md rule 5). When left alone: the gong glows at 8 s and Sensei asks again at
// 16 s and 40 s; Help's question again at 16 s and 40 s; the speaker's line at 8 s and 20 s (quiet game time: nothing
// counts while Sensei talks). Help says the step's line (on the Help step, the Help tap is the answer). Hear it again
// is the nav row's speaker from the first trick on (every instruction can be heard again: docs/NAVIGATION.md), saying
// the trick's line; at trick three it pops in again, glowing, and becomes the answer. ◀ Back goes to the trick before,
// played again. Home goes to the title (Start resumes the welcome). The child's ninja stands bottom-left the whole time
// (docs/HERO.md).
import { useEffect, useRef, useState } from "react";
import { say, sfx, playMusic, isSpeaking, onCaption, onSpeaking, nextClip, hush, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import { store } from "../engine/store";
import { streak } from "../engine/streak";
import { frontier } from "../engine/gems";
import { LINES } from "../content/lines";
import { LEVELS } from "../content/worlds";
import { img, fx, tapProps, useHelp, nudgeHelp, Icon, TapHint, stageXY, SenseiDock, sleep, isUpright, onUpright } from "../ui/ui";
import { NinjaSpot, ninja } from "../ui/Ninja";
import { useNav, holdNext } from "../ui/nav";
import { levelGames, gameForm } from "./narrate";
import "../styles/shell.css";
import "../styles/nav-A.css";

type Step = "hello" | "gong" | "help" | "speaker" | "done";
const TRICKS: Step[] = ["gong", "help", "speaker"];
/** The breath between a trick's "That's it!" and the next trick (TS §3.4 says "1 s later"; half of that keeps the
 *  welcome brisk, and keeps the run from the Help tap to "Tap the speaker…" inside SCRIPT_STYLE §T.3's 12 s). */
const TRICK_BREATH = 400;
/** The Help step's arrow, in stage coordinates: from just right of the ninja's head, over the nav row (Back and Hear it
 *  again sit on the floor below it), down into Sensei's Help button (bottom-right, centre ~1204,644). */
const TUT_ARROW = "M340 440 C520 555 860 520 1092 593";
const TUT_HEAD = "M1136 607 L1098.7 552.2 L1074.1 630.4 Z";
const HAS = new Set(LINES.map((l) => l.id));
const hasLine = (id: string) => HAS.has(id);
/** A line, or its older stand-in while the new one has no text (every caller guards: SCRIPT_FIXES Part B). */
const L = (id: string, alt?: string): Say[] => (HAS.has(id) ? [{ line: id }] : alt && HAS.has(alt) ? [{ line: alt }] : []);

/** After an answer that crossed into a new streak tier: give the ninja's power-up its moment. The ninja says
 *  "Ninja power!" (streak_3) at the first quiet moment, so hold the next question until that line has been said
 *  (or, if there is no such line, until the power-up has had time to play). Never more than ~3 s.
 *  Placement uses it too. */
export async function powerBeat(line: string) {
  if (!hasLine(line)) return sleep(700);
  let started = false;
  let done = () => {};
  const finished = new Promise<void>((r) => (done = r));
  const off = onCaption((c) => {
    if (c) started = true;
    else if (started) done();
  });
  const t0 = performance.now();
  await Promise.race([
    finished,
    (async () => {
      // the line starts after ~300 ms of quiet; if nothing has started by 900 ms it isn't coming
      while (performance.now() - t0 < 900 && !started) await sleep(60);
      if (!started) return;
      await sleep(2600);
    })(),
  ]);
  off();
  while (isSpeaking() && performance.now() - t0 < 3200) await sleep(60);
}

/**
 * A turn's idle ladder in quiet game time (TEACHER_SCRIPT §5.5: nothing counts while anyone speaks or while the phone is
 * upright, and any tap starts it again): `fire(k)` once each step's time (game ms) of quiet has passed. The opt-in uses
 * it too. One timeout sleeps until the next step; nothing polls.
 */
export function quietLadder(steps: readonly number[], fire: (k: number) => void): { stop(): void; reset(): void } {
  let idle = 0; // quiet game ms so far
  let from = 0; // performance.now() when this quiet stretch began (0: paused)
  let k = 0;
  let t = 0;
  let alive = true;
  const sync = () => {
    if (!alive) return;
    if (from) idle += (performance.now() - from) * FAST;
    from = 0;
    clearTimeout(t);
    while (alive && k < steps.length && idle >= steps[k] - 5) fire(k++); // (a step's own line pauses the count)
    if (alive && k < steps.length && !isUpright() && !isSpeaking()) {
      from = performance.now();
      t = window.setTimeout(sync, steps[k] - idle); // (setTimeout runs in game time)
    }
  };
  const reset = () => {
    if (!alive) return;
    idle = 0;
    from = 0;
    k = 0;
    sync();
  };
  const offSpeaking = onSpeaking(sync);
  const offUpright = onUpright(sync);
  window.addEventListener("pointerdown", reset, true);
  sync();
  return {
    reset,
    stop() {
      alive = false;
      clearTimeout(t);
      offSpeaking();
      offUpright();
      window.removeEventListener("pointerdown", reset, true);
    },
  };
}

/** The rhyme's tiptoe: the child's ninja takes four little sneaking steps on the spot while "Tip, tap, tiptoe, quiet as a
 *  mouse." is said (a Web Animation of the ninja's box: transform only, over the clip's own length). */
function tiptoe(ms: number) {
  const el = document.querySelector(".ninja-spot");
  if (!el || typeof el.animate !== "function" || ms <= 0) return;
  const frames: Keyframe[] = [];
  for (let i = 0; i <= 8; i++) {
    const up = i % 2 === 1;
    const side = i % 4 === 1 ? -5 : i % 4 === 3 ? 5 : 0;
    frames.push({ offset: i / 8, translate: `${side}px ${up ? -13 : 0}px`, rotate: `${up ? (side < 0 ? -3 : 3) : 0}deg`, easing: up ? "ease-in" : "ease-out" });
  }
  el.animate(frames, { duration: ms * 0.92 });
}

/** The first lesson after the welcome: the first session's (App's nextInSession), else the child's next stone. */
function nextLesson() {
  const f = store.get().firstSession;
  const id = f ? f.lessons[Math.min(1, f.step)] : null;
  return (id ? LEVELS.find((l) => l.id === id) : null) ?? frontier();
}

export function Training({ onDone, onHome }: { onDone: () => void; onHome?: () => void }) {
  const [step, setStepState] = useState<Step>("hello");
  const stepRef = useRef<Step>("hello");
  const setStep = (s: Step) => {
    stepRef.current = s;
    setStepState(s);
  };
  const [entry, setEntry] = useState(0); // bumps each time a trick is (re)entered: restarts its idle ladder
  const [shown, setShown] = useState(0); // stars on show (they pop in on "three ninja tricks")
  const [won, setWon] = useState(0); // stars lit
  const [shine, setShine] = useState(0); // bumps: every star shines
  const [gongIn, setGongIn] = useState(false);
  const [gongLoud, setGongLoud] = useState(false); // 8 s with no tap: the gong glows brighter and wobbles
  const [gongHit, setGongHit] = useState(0); // bumps on each ring, to restart the swing
  const [gongTapped, setGongTapped] = useState(false);
  const gongDone = useRef(false);
  const gongImg = useRef<HTMLImageElement>(null);
  const [helpOn, setHelpOn] = useState(false); // the arrow and the rings round Sensei
  const [helpAsked, setHelpAsked] = useState(false); // "Can you tap me now?" has started
  const helpTapped = useRef(false); // eager double-taps on Sensei must not run the Help step twice
  const [speakerIn, setSpeakerIn] = useState(false); // the speaker is in the nav row (trick three)
  const [speakerLive, setSpeakerLive] = useState(false); // the rhyme has been said: a tap on the speaker is the answer
  const speakerLiveRef = useRef(false);
  speakerLiveRef.current = speakerLive;
  const speakerTapped = useRef(false);
  const [heard, setHeard] = useState(false); // the speaker has been tapped: trick three is done
  const alive = useRef(true);
  const tok = useRef(0); // bumps on every step change (Back included): a step's script stops once the child has left it
  const stars = useRef<(HTMLSpanElement | null)[]>([]);
  const live = (my: number) => alive.current && my === tok.current;

  useEffect(() => {
    alive.current = true;
    streak.reset();
    playMusic("dojo");
    void go("hello");
    return () => {
      alive.current = false;
      tok.current++;
      nudgeHelp(false);
      document.documentElement.removeAttribute("data-tut-speaker");
    };
  }, []);
  // the speaker pops into the nav row, glowing (nav-A.css: the nav layer's own speaker, where it is in every lesson)
  useEffect(() => {
    const on = speakerIn && !speakerTapped.current && step === "speaker";
    if (on) document.documentElement.setAttribute("data-tut-speaker", "");
    else document.documentElement.removeAttribute("data-tut-speaker");
  }, [speakerIn, step, speakerLive]);

  // Home (none given: App's Home rule, the title); Hear it again: the trick's line (none during the hello), and on the
  // speaker step the answer (with the pointing hand once the rhyme has been said); ◀ Back to the trick before
  useNav({
    home: onHome,
    again:
      step === "gong"
        ? () => say(L("tv_train_gong", "tut_1"))
        : step === "help"
          ? () => say([...L("tv_train_help", "fm_help_short"), { gap: 250 }, ...L("tv_train_try_help")])
          : step === "speaker"
            ? () => void tapSpeaker()
            : step === "done"
              ? () => say(L("tv_train_done"))
              : null,
    againHint: step === "speaker" && speakerLive,
    // (not once the trick is done: its star is lit and the next one is on its way)
    back: step === "help" && helpOn ? () => enter("gong") : step === "speaker" && !heard ? () => enter("help") : null,
  });

  // Sensei's Help button: on the Help step it is the answer; elsewhere it says the step's line again
  useHelp(
    () => {
      const s = stepRef.current;
      if (s === "help") return void helpAnswer();
      if (s === "gong" && !gongDone.current) return void say(L("tv_train_gong", "tut_1"));
      if (s === "speaker" && speakerLiveRef.current && !speakerTapped.current) return void say(L("tv_train_hear_again", "fm_speaker"));
    },
    [step],
  );

  /** Light star i: it pops, and stars burst from it. */
  const lightStar = (i: number) => {
    setWon((w) => Math.max(w, i + 1));
    const el = stars.current[i];
    if (!el) return;
    const xy = stageXY(el);
    fx.burst(xy.x, xy.y, "stars", 14, 0.8);
    fx.ring(xy.x, xy.y, { color: "#ffe38a", r0: 20, r1: 90, width: 8 });
    sfx.twinkle?.();
  };

  /** Start a step's script (forward, or again after ◀ Back). */
  const go = async (s: Step) => {
    const my = ++tok.current;
    setStep(s);
    setEntry((k) => k + 1);
    if (s === "hello") {
      // the three grey stars pop in, one after another, on "three ninja tricks" (about 0.8 s into the line)
      void nextClip("tv_train_tricks", 12000).then((c) => {
        if (!c || !live(my)) return;
        [0, 1, 2].forEach((i) => setTimeout(() => live(my) && (setShown((n) => Math.max(n, i + 1)), sfx.pop()), 750 + i * 380));
      });
      await say([...L("tv_train_hello", "tut_1"), { gap: 250 }, ...L("tv_train_tricks")]);
      if (!live(my)) return;
      setShown(3);
      await sleep(350);
      if (live(my)) void go("gong");
      return;
    }
    if (s === "gong") {
      setGongIn(true);
      await say(L("tv_train_gong", "tut_1"));
      return;
    }
    if (s === "help") {
      // "stuck?": the ninja scratches its head, the big arrow points at Sensei in the corner, and Sensei's button pulses
      setHelpOn(true);
      setHelpAsked(false);
      nudgeHelp(true);
      void ninja.act("think");
      // (Sensei's button is the answer from the first word; the bots, like a listening child, wait for "Can you tap me now?")
      void nextClip("tv_train_try_help", 15000).then(() => live(my) && setHelpAsked(true));
      await say([...L("tv_train_help", "fm_help_short"), { gap: 250 }, ...L("tv_train_try_help")]);
      if (live(my)) setHelpAsked(true);
      return;
    }
    if (s === "speaker") {
      setSpeakerIn(true);
      // the ninja tiptoes to the rhyme; the pointing hand comes onto the speaker with "Tap the speaker…"
      void nextClip("tv_rhyme", 15000).then((c) => c && live(my) && tiptoe(c.end - c.start));
      void nextClip("tv_train_hear_again", 22000).then((c) => c && live(my) && setSpeakerLive(true));
      await say([...L("tv_train_speaker", "fm_speaker"), { gap: 300 }, ...L("tv_rhyme"), { gap: 300 }, ...L("tv_train_hear_again")]);
      if (live(my)) setSpeakerLive(true);
      return;
    }
    // done: "Three tricks, three stars." (every star shines, and the ninja powers up); then the readiness hold that names
    // the first game
    setShine((k) => k + 1);
    stars.current.forEach((el) => {
      if (!el) return;
      const xy = stageXY(el);
      fx.twinkle(xy.x, xy.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 8, 5);
    });
    void ninja.act("power");
    await say(L("tv_train_done"));
    if (!live(my)) return;
    const first = nextLesson();
    const ninjaEars = !!first && levelGames(first)[0] === "tap" && gameForm("tap") === "full" && hasLine("tv_first_game");
    const ask = ninjaEars ? L("tv_first_game") : L("nav_ready");
    // the held ▶ into the first lesson (a held step, not the game's own Ready, which comes after its frame and demo): the
    // ninja turns to ▶ in its ready stance, and bows on the tap
    const posed = ninja.mounted;
    if (posed) setTimeout(() => live(my) && ninja.mounted && ninja.pose("ready", { face: "next" }), 60);
    const held = holdNext("first-game", () => say([...L("tv_train_done"), { gap: 250 }, ...ask]));
    void say(ask);
    const a = await held;
    if (!a || !live(my)) return;
    hush();
    store.set((st) => void (st.seenTraining = true));
    if (posed && ninja.mounted) {
      void ninja.act("bow", undefined, { react: false });
      await sleep(650); // the bow
      if (ninja.mounted) ninja.pose(null);
    }
    if (live(my)) onDone();
  };

  /** ◀ Back: the trick before, from its start (the gong hangs there again, the Help nudge comes back). */
  const enter = (s: Step) => {
    hush();
    nudgeHelp(false);
    setHelpOn(false);
    setSpeakerIn(false);
    setSpeakerLive(false);
    setHeard(false);
    speakerTapped.current = false;
    helpTapped.current = false;
    if (s === "gong") {
      gongDone.current = false;
      setGongTapped(false);
      setGongHit(0);
      setGongLoud(false);
    }
    setWon(TRICKS.indexOf(s));
    void go(s);
  };

  // 1. the child taps the gong, and their ninja kicks it: BONG! The first star lights.
  const tapGong = async (el: HTMLElement) => {
    if (gongDone.current || stepRef.current !== "gong") return;
    gongDone.current = true;
    const my = ++tok.current;
    hush();
    setGongTapped(true);
    setGongLoud(false);
    const kick = ninja.act("kick", gongImg.current ?? el);
    streak.hit({ part: true }); // a flame for the kick (after it has started), but not an answer (Dec2)
    await kick;
    if (!live(my)) return;
    sfx.gong();
    setGongHit((k) => k + 1);
    const xy = stageXY(el);
    fx.burst(xy.x, xy.y, "stars", 24);
    await sleep(250);
    if (!live(my)) return;
    lightStar(0);
    await say(L("tv_train_gong_ok"));
    if (!live(my)) return;
    await sleep(TRICK_BREATH); // (the star has had its moment during "Bong! That's your first star.")
    if (live(my)) void go("help");
  };

  // 2. the child taps Sensei in the corner (live from "If you're ever stuck, tap me"): the second star
  const helpAnswer = async () => {
    if (helpTapped.current || stepRef.current !== "help") return;
    helpTapped.current = true;
    const my = ++tok.current;
    hush();
    nudgeHelp(false);
    setHelpOn(false);
    sfx.great();
    void ninja.act("cheer");
    lightStar(1);
    await say(L("fm_help_ok"));
    if (!live(my)) return;
    await sleep(TRICK_BREATH);
    if (live(my)) void go("speaker");
  };

  // 3. the speaker says the rhyme again (the child hears exactly what "again" means): the third star, and off we go
  const tapSpeaker = async () => {
    if (stepRef.current !== "speaker" || !speakerLiveRef.current || speakerTapped.current) return;
    speakerTapped.current = true;
    const my = ++tok.current;
    hush();
    sfx.good();
    setSpeakerLive(false);
    setHeard(true);
    void nextClip("tv_rhyme", 6000).then((c) => c && live(my) && tiptoe(c.end - c.start));
    await say(L("tv_rhyme"));
    if (!live(my)) return;
    // the third star lights and leaps (0.7 s) as "Three tricks, three stars." starts: that line is its praise, and every
    // star shines on it (the replay itself showed what the speaker does, so `tv_train_speaker_ok` isn't said: one wrap,
    // not two back to back)
    lightStar(2);
    void go("done");
  };

  // a child who doesn't do what the trick asks (quiet game time; nothing taps for them): the gong glows at 8 s and
  // Sensei says the trick again at 16 s and 40 s; Help's question at 16 s and 40 s; the speaker's line at 8 s and 20 s
  useEffect(() => {
    if (step === "gong") {
      const lad = quietLadder([8000, 16000, 40000], (k) => {
        if (gongDone.current || stepRef.current !== "gong") return;
        if (k === 0) setGongLoud(true);
        else void say(L("tv_train_gong", "tut_1"));
      });
      return () => lad.stop();
    }
    if (step === "help") {
      const lad = quietLadder([16000, 40000], () => {
        if (helpTapped.current || stepRef.current !== "help") return;
        void say(L("tv_train_try_help", "fm_help_short"));
      });
      return () => lad.stop();
    }
    if (step === "speaker" && speakerLive) {
      const lad = quietLadder([8000, 20000], () => {
        if (speakerTapped.current || stepRef.current !== "speaker") return;
        void say(L("tv_train_hear_again", "fm_speaker"));
      });
      return () => lad.stop();
    }
  }, [step, entry, speakerLive]);

  // (`game: null` throughout: the welcome's tricks are not games of the registry, content/games.ts)
  const st =
    step === "gong"
      ? gongTapped || !gongIn
        ? { scene: "tut-gong-ok", busy: true }
        : { scene: "tut-gong", next: "gong" }
      : step === "help"
        ? helpOn
          ? helpAsked
            ? { scene: "tut-help", next: "Help" }
            : { scene: "tut-help-intro", busy: true }
          : { scene: "tut-help-ok", busy: true }
        : step === "speaker"
          ? speakerLive && !speakerTapped.current
            ? { scene: "tut-speaker" } // (the answer is Hear it again itself: a replay control, so no `next` turn)
            : { scene: "tut-speaker-wait", busy: true }
          : step === "done"
            ? { scene: "tut-done", busy: true }
            : { scene: "tut-hello", busy: true };
  (window as any).__snState = { ...st, game: null };

  return (
    <div className="scene tut">
      <img className="bg-img" src={img("dojo_bg")} alt="" />
      <div className="vignette" />
      <NinjaSpot />
      {/* the three tricks' stars: they pop in on "three ninja tricks", and each lights as its trick is done */}
      <div className={`tut-stars ${shine ? "shine" : ""}`} aria-hidden="true">
        {TRICKS.map((s, i) => (
          <span key={s} ref={(el) => void (stars.current[i] = el)} className={`tut-star ${shown > i ? "in" : ""} ${won > i ? "on" : ""}`}>
            <i>
              <Icon.star on={won > i} />
            </i>
          </span>
        ))}
      </div>

      {step === "gong" && gongIn && (
        // the gong ends above y 452, so Sensei's caption bubble (y 468+) never covers it or the hand
        <button aria-label="gong" className={`tut-gong ${gongLoud ? "loud" : ""}`} {...tapProps(tapGong)}>
          <span className="tut-gong-glow" aria-hidden="true" />
          <img ref={gongImg} key={gongHit} src={img("item_gong")} alt="" className={gongHit ? "tut-gong-swing" : gongLoud ? "tut-gong-wobble" : "breathe"} />
          {!gongTapped && <TapHint show style={{ right: 6, bottom: 0 }} />}
        </button>
      )}

      {step === "help" && helpOn && (
        <>
          {/* the thinking ninja → a big arrow swooping over the nav row into Sensei's Help button, with rings round him
              (the wrapper sways on the compositor, with the shadow drawn once: docs/PERF.md fix 4) */}
          <div className="tut-arrow-wrap" aria-hidden="true">
            <svg className="tut-arrow" viewBox="0 0 1280 720" width="1280" height="720" style={{ left: 0, top: 0 }}>
              <path d={TUT_ARROW} pathLength={1000} fill="none" stroke="#2b1d14" strokeWidth="34" strokeLinecap="round" />
              <path d={TUT_ARROW} pathLength={1000} fill="none" stroke="#ffc53d" strokeWidth="20" strokeLinecap="round" />
              <path d={TUT_HEAD} fill="#ffc53d" stroke="#2b1d14" strokeWidth="8" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="tut-help-ring" aria-hidden="true" />
          <div className="tut-help-ring late" aria-hidden="true" />
        </>
      )}
      <SenseiDock />
    </div>
  );
}
