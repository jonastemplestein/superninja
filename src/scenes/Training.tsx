// The dojo welcome (docs/FIRST_MINUTES.md §2, "Training without its picture rounds"): about 12 seconds before the
// first lesson. 1. tap the big gong (the child's ninja kicks it: BONG!)  2. "Stuck? Tap me, down here in the corner.
// Try it now!" (Sensei's Help button, bottom-right)  3. the speaker: "And when you tap the speaker, I'll say it
// again!" (docs/ARCHITECTURE.md §15.3: the Hear it again button is explained in the welcome). Picture games are the
// lessons' job now, so the welcome only shows the controls.
// The child's ninja stands bottom-left the whole time (docs/HERO.md).
import { useEffect, useRef, useState } from "react";
import { say, sfx, playMusic, isSpeaking, onCaption } from "../engine/audio";
import { store } from "../engine/store";
import { streak } from "../engine/streak";
import { LINES } from "../content/lines";
import { img, fx, tapProps, useHelp, nudgeHelp, RoundButton, Icon, TapHint, stageXY, SenseiDock, sleep } from "../ui/ui";
import { NinjaSpot, ninja } from "../ui/Ninja";
import "../styles/shell.css";

type Step = "gong" | "help" | "speaker" | "done";
const STEPS: Step[] = ["gong", "help", "speaker"];
/** The Help step's arrow, in its svg's own coordinates (the svg sits at stage 300,380): from just right of the ninja's
 *  head, down along the floor below the caption bubble, ending at Sensei (stage ~1136,642). */
const TUT_ARROW = "M44 70 C150 300 520 300 786 263";
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

export function Training({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>("gong");
  const [gongHit, setGongHit] = useState(0); // bumps on each ring, to restart the swing
  const gongDone = useRef(false);
  const [gongTapped, setGongTapped] = useState(false);
  const gongImg = useRef<HTMLImageElement>(null);
  const helpTapped = useRef(false); // eager double-taps on Sensei must not run the Help step twice
  const speakerTapped = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    streak.reset();
    playMusic("dojo");
    say({ line: "tut_1" });
    return () => void (alive.current = false);
  }, []);

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

  const advance = async (next: Step) => {
    nudgeHelp(false);
    if (step === "help") {
      sfx.great();
      void ninja.act("cheer");
      await say({ line: "fm_help_ok" });
    }
    if (!alive.current) return;
    setStep(next);
    if (next === "help") {
      nudgeHelp(true);
      // "stuck?": the ninja scratches its head, and the big arrow points at Sensei in the corner
      void ninja.act("think");
      await say({ line: "fm_help_short" });
    } else if (next === "speaker") {
      await say({ line: "fm_speaker" });
    } else if (next === "done") {
      store.set((s) => void (s.seenTraining = true));
      await sleep(250);
      if (alive.current) onDone();
    }
  };

  // 1. the child taps the gong, and their ninja kicks it: BONG!
  const tapGong = async (el: HTMLElement) => {
    if (gongDone.current) return;
    gongDone.current = true;
    setGongTapped(true);
    const kick = ninja.act("kick", gongImg.current ?? el);
    streak.hit(); // after the kick has started, so a tier-up (never on the gong) would wait for it to land
    await kick;
    sfx.gong();
    setGongHit((k) => k + 1);
    const xy = stageXY(el);
    fx.burst(xy.x, xy.y, "stars", 24);
    void advance("help");
  };

  // 3. the speaker says it again (the child hears exactly what "again" means), then off we go
  const tapSpeaker = async () => {
    if (step !== "speaker" || speakerTapped.current) return;
    speakerTapped.current = true;
    sfx.good();
    void ninja.act("cheer");
    await say({ line: "fm_speaker" });
    void advance("done");
  };
  // a child who doesn't tap the speaker: the paw taps it after a few seconds (it counts; nobody is stuck here)
  useEffect(() => {
    if (step !== "speaker") return;
    const t = setTimeout(() => void tapSpeaker(), 9000);
    return () => clearTimeout(t);
  }, [step]);

  (window as any).__snState = step === "gong" ? { scene: "tut-gong" } : step === "help" ? { scene: "tut-help" } : step === "speaker" ? { scene: "tut-speaker" } : {};

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
          {/* the thinking ninja → a big arrow swooping along the floor into Sensei's Help button, with rings round him */}
          <svg className="tut-arrow" viewBox="0 0 840 320" width="840" height="320" style={{ left: 300, top: 380 }} aria-hidden="true">
            <path d={TUT_ARROW} pathLength={1000} fill="none" stroke="#2b1d14" strokeWidth="34" strokeLinecap="round" />
            <path d={TUT_ARROW} pathLength={1000} fill="none" stroke="#ffc53d" strokeWidth="20" strokeLinecap="round" />
            <path d="M836 262 L782 222 L786 304 Z" fill="#ffc53d" stroke="#2b1d14" strokeWidth="8" strokeLinejoin="round" />
          </svg>
          <div className="tut-help-ring" aria-hidden="true" />
          <div className="tut-help-ring late" aria-hidden="true" />
        </>
      )}

      {(step === "speaker" || step === "done") && (
        // the speaker, where it always is in a lesson (bottom-centre of the play area)
        <div style={{ position: "absolute", left: 730, bottom: 26, translate: "-50% 0" }}>
          <RoundButton label="Hear it again" className={step === "speaker" ? "pulse" : ""} style={{ width: 130, height: 130 }} onClick={() => void tapSpeaker()}>
            <Icon.speaker />
          </RoundButton>
          {step === "speaker" && <TapHint show style={{ right: -80, bottom: -30 }} />}
        </div>
      )}
      <SenseiDock />
    </div>
  );
}
