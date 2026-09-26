// The dojo welcome (docs/FIRST_MINUTES.md §2, "Training without its picture rounds"): about 12 seconds before the
// first lesson. 1. tap the big gong (the child's ninja kicks it: BONG!)  2. "Stuck? Tap me, down here in the corner.
// Try it now!" (Sensei's Help button, bottom-right)  3. the speaker: "And when you tap the speaker, I'll say it
// again!" (docs/ARCHITECTURE.md §15.3: the Hear it again button is explained in the welcome). Picture games are the
// lessons' job now, so the welcome only shows the controls.
// Navigation (docs/NAVIGATION.md §5.A): each step is a turn that waits for the child (nothing taps for them). Hear it
// again is the nav row's speaker, where it is in every lesson: on the gong and Help steps it says the step again, and on
// the speaker step it *is* the answer (it pulses, with the pointing hand). ◀ Back goes to the step before, played again.
// Home goes to the title (Start resumes the welcome). After the speaker tap the first lesson starts (the tap was the
// answer).
// The child's ninja stands bottom-left the whole time (docs/HERO.md).
import { useEffect, useRef, useState } from "react";
import { say, sfx, playMusic, isSpeaking, onCaption, hush } from "../engine/audio";
import { store } from "../engine/store";
import { streak } from "../engine/streak";
import { LINES } from "../content/lines";
import { img, fx, tapProps, useHelp, nudgeHelp, Icon, TapHint, stageXY, SenseiDock, sleep } from "../ui/ui";
import { NinjaSpot, ninja } from "../ui/Ninja";
import { useNav } from "../ui/nav";
import "../styles/shell.css";

type Step = "gong" | "help" | "speaker" | "done";
const STEPS: Step[] = ["gong", "help", "speaker"];
const LINE: Record<Exclude<Step, "done">, string> = { gong: "tut_1", help: "fm_help_short", speaker: "fm_speaker" };
/** The Help step's arrow, in stage coordinates: from just right of the ninja's head, over the nav row (Back and Hear it
 *  again sit on the floor below it), down into Sensei's Help button (bottom-right, centre ~1204,644). */
const TUT_ARROW = "M340 440 C520 555 860 520 1092 593";
const TUT_HEAD = "M1136 607 L1098.7 552.2 L1074.1 630.4 Z";
const hasLine = (id: string) => LINES.some((l) => l.id === id);

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

export function Training({ onDone, onHome }: { onDone: () => void; onHome?: () => void }) {
  const [step, setStep] = useState<Step>("gong");
  const stepRef = useRef<Step>("gong");
  stepRef.current = step;
  const [entry, setEntry] = useState(0); // bumps each time a step is (re)entered: restarts its idle timers
  const [gongHit, setGongHit] = useState(0); // bumps on each ring, to restart the swing
  const gongDone = useRef(false);
  const [gongTapped, setGongTapped] = useState(false);
  const gongImg = useRef<HTMLImageElement>(null);
  const helpTapped = useRef(false); // eager double-taps on Sensei must not run the Help step twice
  const speakerTapped = useRef(false);
  const alive = useRef(true);
  const tok = useRef(0); // bumps on every step change (Back included): a step's script stops once the child has left it

  useEffect(() => {
    alive.current = true;
    streak.reset();
    playMusic("dojo");
    say({ line: "tut_1" });
    return () => void (alive.current = false);
  }, []);

  // Home (none given: App's Home rule, the title); the nav row: Hear it again (the speaker step's answer), and ◀ Back
  // to the step before
  useNav({
    home: onHome,
    again: step === "speaker" || step === "done" ? () => tapSpeaker() : () => say({ line: LINE[step] }),
    againHint: step === "speaker",
    back: step === "help" ? () => enter("gong") : step === "speaker" ? () => enter("help") : null,
  });

  // the Help button means "Stuck? Tap me" here
  useHelp(
    () => {
      if (step === "help") {
        if (helpTapped.current) return;
        helpTapped.current = true;
        return void advance("speaker");
      }
      if (step === "gong") return void say({ line: "tut_1" });
      if (step === "speaker") return void say({ line: "fm_speaker" });
    },
    [step],
  );

  /** What a step does as it starts: its line (and, for Help, the thinking ninja and the nudge on Sensei). */
  const play = async (s: Step, my: number) => {
    setEntry((k) => k + 1);
    if (s === "gong") return void say({ line: "tut_1" });
    if (s === "help") {
      nudgeHelp(true);
      // "stuck?": the ninja scratches its head, and the big arrow points at Sensei in the corner
      void ninja.act("think");
      await say({ line: "fm_help_short" });
    } else if (s === "speaker") {
      await say({ line: "fm_speaker" });
    } else if (s === "done") {
      store.set((st) => void (st.seenTraining = true));
      await sleep(250);
      if (alive.current && my === tok.current) onDone();
    }
  };

  /** ◀ Back: the step before, from its start (the gong hangs there again, the Help nudge comes back). */
  const enter = (s: Step) => {
    const my = ++tok.current;
    hush();
    nudgeHelp(false);
    if (s === "gong") {
      gongDone.current = false;
      setGongTapped(false);
      setGongHit(0);
    }
    if (s === "help") helpTapped.current = false;
    speakerTapped.current = false;
    setStep(s);
    void play(s, my);
  };

  /** On to the next step (the child did what the step asked). */
  const advance = async (next: Step) => {
    const my = ++tok.current;
    nudgeHelp(false);
    if (stepRef.current === "help") {
      sfx.great();
      void ninja.act("cheer");
      await say({ line: "fm_help_ok" });
    }
    if (!alive.current || my !== tok.current) return;
    setStep(next);
    await play(next, my);
  };

  // 1. the child taps the gong, and their ninja kicks it: BONG!
  const tapGong = async (el: HTMLElement) => {
    if (gongDone.current) return;
    gongDone.current = true;
    const my = tok.current;
    setGongTapped(true);
    const kick = ninja.act("kick", gongImg.current ?? el);
    streak.hit(); // after the kick has started, so a tier-up (never on the gong) would wait for it to land
    await kick;
    if (!alive.current || my !== tok.current) return;
    sfx.gong();
    setGongHit((k) => k + 1);
    const xy = stageXY(el);
    fx.burst(xy.x, xy.y, "stars", 24);
    void advance("help");
  };

  // 3. the speaker says it again (the child hears exactly what "again" means), then off we go
  const tapSpeaker = async () => {
    if (stepRef.current !== "speaker" || speakerTapped.current) return;
    speakerTapped.current = true;
    const my = tok.current;
    sfx.good();
    void ninja.act("cheer");
    await say({ line: "fm_speaker" });
    if (alive.current && my === tok.current) void advance("done");
  };
  // a child who doesn't do what the step asks: Sensei asks again at 8 s and once more at 20 s, as in every turn (the
  // gong and the speaker already have the pointing hand; the Help step has the big arrow and the rings). Nothing taps
  // for them. (If Sensei is still talking then, the ask waits for the quiet.)
  useEffect(() => {
    if (step === "done") return;
    const waiting = () => (step === "gong" ? !gongDone.current : step === "help" ? !helpTapped.current : !speakerTapped.current);
    const timers: number[] = [];
    const ask = () => {
      if (!alive.current || !waiting()) return;
      if (isSpeaking()) return void timers.push(window.setTimeout(ask, 500));
      void say({ line: LINE[step] });
    };
    timers.push(window.setTimeout(ask, 8000), window.setTimeout(ask, 20000));
    return () => timers.forEach(clearTimeout);
  }, [step, entry]);

  (window as any).__snState =
    step === "gong" ? { scene: "tut-gong", next: "gong", busy: gongTapped } : step === "help" ? { scene: "tut-help", next: "Help" } : step === "speaker" ? { scene: "tut-speaker" } : {};

  return (
    <div className="scene">
      <img className="bg-img" src={img("dojo_bg")} alt="" />
      <div className="vignette" />
      <NinjaSpot />
      {/* progress: three little stars */}
      <div className="row" style={{ position: "absolute", left: 0, right: 0, top: 24, gap: 8 }}>
        {STEPS.map((s, i) => (
          <span key={s} style={{ width: 44, height: 44 }}>
            <Icon.star on={STEPS.indexOf(step) > i || step === "done"} />
          </span>
        ))}
      </div>

      {step === "gong" && (
        // the gong ends above y 452, so Sensei's caption bubble (y 468+) never covers it or the hand
        <button aria-label="gong" className="pop-in" {...tapProps(tapGong)} style={{ position: "absolute", left: 565, top: 92, width: 310, height: 356 }}>
          <img ref={gongImg} key={gongHit} src={img("item_gong")} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} className={gongHit ? "tut-gong-swing" : "breathe"} />
          {!gongTapped && <TapHint show style={{ right: 6, bottom: 0 }} />}
        </button>
      )}

      {step === "help" && (
        <>
          {/* the thinking ninja → a big arrow swooping over the nav row into Sensei's Help button, with rings round him */}
          <svg className="tut-arrow" viewBox="0 0 1280 720" width="1280" height="720" style={{ left: 0, top: 0 }} aria-hidden="true">
            <path d={TUT_ARROW} pathLength={1000} fill="none" stroke="#2b1d14" strokeWidth="34" strokeLinecap="round" />
            <path d={TUT_ARROW} pathLength={1000} fill="none" stroke="#ffc53d" strokeWidth="20" strokeLinecap="round" />
            <path d={TUT_HEAD} fill="#ffc53d" stroke="#2b1d14" strokeWidth="8" strokeLinejoin="round" />
          </svg>
          <div className="tut-help-ring" aria-hidden="true" />
          <div className="tut-help-ring late" aria-hidden="true" />
        </>
      )}
      <SenseiDock />
    </div>
  );
}
