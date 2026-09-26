// Ninja Training: teaches the controls and checks the child can use them before the adventure starts.
// 1. tap a big target (the ninja kicks the gong: BONG!)  2. tap Sensei (the Help button, bottom-right)
// 3. tap a picture for a word (get it right → your ninja does a kick)  4. use the replay speaker
// 5. do one on their own (help is still there if needed)
// The child's ninja stands bottom-left the whole time (docs/HERO.md). Every right answer makes it strike the thing
// they got right, and first-try answers build the streak, so by the end of training it is glowing.
import { useEffect, useRef, useState } from "react";
import { say, sfx, playMusic, isSpeaking, onCaption } from "../engine/audio";
import { shuffle } from "../engine/learner";
import { store } from "../engine/store";
import { streak } from "../engine/streak";
import { LINES } from "../content/lines";
import { img, fx, tapProps, useHelp, nudgeHelp, RoundButton, Icon, TapHint, stageXY, SenseiDock, sleep } from "../ui/ui";
import { NinjaSpot, ninja } from "../ui/Ninja";
import "../styles/shell.css";

type Step = "gong" | "help" | "tile" | "speaker" | "test" | "done";
const STEPS: Step[] = ["gong", "help", "tile", "speaker", "test", "done"];
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
  const [heard, setHeard] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);
  const [helpLvl, setHelpLvl] = useState(0);
  const [gongHit, setGongHit] = useState(0); // bumps on each ring, to restart the swing
  const gongDone = useRef(false);
  const [gongTapped, setGongTapped] = useState(false);
  const gongImg = useRef<HTMLImageElement>(null);
  const missed = useRef(false); // a wrong tap on this question: the eventual right answer is not a streak hit
  const taps = useRef(0); // bumps on every picture tap, so a re-ask after a miss never talks over a newer tap
  const stepNow = useRef(step);
  stepNow.current = step;
  const helpTapped = useRef(false); // eager double-taps on Sensei must not run the Help step twice

  // pictures, not letters: training teaches the controls, not phonics (docs/PEDAGOGY.md)
  const [task] = useState<Record<string, { target: string; tiles: string[] }>>(() => ({
    tile: { target: "sun", tiles: ["sun", "dog", "cup"] },
    speaker: { target: "mat", tiles: ["bus", "mat", "hen"] },
    test: { target: "fan", tiles: shuffle(["fan", "pig", "cup", "hat"]) },
  }));
  const cur = task[step];
  const ask = (w: string): any[] => [{ line: "listen_tap" }, { gap: 350 }, { word: w }];

  useEffect(() => {
    streak.reset();
    playMusic("dojo");
    say({ line: "tut_1" });
  }, []);

  // the Help button means different things during training
  useHelp(
    (n) => {
      if (step === "help") {
        if (helpTapped.current) return;
        helpTapped.current = true;
        return advance("tile");
      }
      if (step === "gong") return say({ line: "tut_1" });
      if (cur) {
        taps.current++; // Sensei is asking now: a pending re-ask after a miss stays quiet
        setHelpLvl(n);
        say(n >= 2 ? [{ line: "help_look" }, { word: cur.target }] : ask(cur.target));
      }
    },
    [step],
  );

  const advance = async (next: Step) => {
    setWrong(null);
    setRight(null);
    setHelpLvl(0);
    missed.current = false;
    nudgeHelp(false);
    if (step === "help") {
      sfx.great();
      void ninja.act("cheer");
      await say({ line: "tut_help_ok" });
    }
    setStep(next);
    if (next === "help") {
      nudgeHelp(true);
      // "stuck?": the ninja scratches its head, and the big arrow points at Sensei in the corner
      void ninja.act("think");
      await say({ line: "tut_help" });
    } else if (next === "tile") await say(ask("sun"));
    else if (next === "speaker") await say({ line: "tut_speaker" });
    else if (next === "test") await say([{ line: "youdo" }, { gap: 300 }, ...ask("fan")]);
    else if (next === "done") {
      sfx.fanfare();
      fx.rain("confetti", 80);
      store.set((s) => void (s.seenTraining = true));
      await Promise.all([say({ line: "tut_done" }), ninja.celebrate()]);
      onDone();
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
    await say({ line: "tut_good" });
    advance("help");
  };

  const tapTile = async (g: string, el: HTMLElement) => {
    if (!cur || right) return;
    const tap = ++taps.current;
    if (step === "speaker" && !heard) return say({ line: "tut_speaker" });
    if (g === cur.target) {
      setRight(g);
      sfx.good();
      // the first right answer is always a kick, so the pattern is easy to see; after that, the moves vary.
      // Start the strike BEFORE counting the hit: a hit that crosses a streak tier queues the ninja's power-up
      // behind whatever move is playing, so it must already be this strike (docs/HERO.md).
      void (step === "tile" ? ninja.act("kick", el) : ninja.strike(el));
      const ev = !missed.current ? streak.hit() : null;
      const praise: any[] = [{ word: g }, { gap: 150 }, { line: "yay_1" }];
      if (step === "tile" && hasLine("tut_kick")) praise.push({ gap: 250 }, { line: "tut_kick" });
      await say(praise);
      // three in a row: the ninja powers up and starts glowing. Let that (and "Ninja power!") land before moving on.
      if (ev?.tierUp) await powerBeat(`streak_${[0, 3, 6, 10][ev.tier]}`);
      advance(step === "tile" ? "speaker" : step === "speaker" ? "test" : "done");
    } else {
      setWrong(g);
      sfx.wrong();
      missed.current = true;
      const ev = streak.miss(); // the ninja has a little think by itself
      nudgeHelp(true);
      const thisStep = step;
      await say([{ line: "this_is_a" }, { word: g }, { gap: 200 }, { line: "tut_stuck" }], { reveal: true });
      setWrong(null);
      // A child who can't read needs to hear what to find again. After a lost streak of 3 or more the ninja says
      // "Keep going, ninja!" at the next quiet moment: let that be said first, then ask the question again.
      const t0 = performance.now();
      if (ev.prevN >= 3) while (!isSpeaking() && performance.now() - t0 < 900) await sleep(60);
      while (isSpeaking() && performance.now() - t0 < 4000) await sleep(80);
      await sleep(500);
      if (taps.current === tap && stepNow.current === thisStep && !isSpeaking()) say(ask(cur.target));
    }
  };

  (window as any).__snState =
    step === "gong" ? { scene: "tut-gong" } : step === "help" ? { scene: "tut-help" } : cur ? { scene: step === "speaker" && !heard ? "tut-speaker" : "find", next: cur.target } : {};

  const many = (cur?.tiles.length ?? 0) > 3;
  const card = many ? 172 : 200;
  return (
    <div className="scene">
      <img className="bg-img" src={img("dojo_bg")} alt="" />
      <div className="vignette" />
      <NinjaSpot />
      {/* progress: five little stars */}
      <div className="row" style={{ position: "absolute", left: 0, right: 0, top: 24, gap: 8 }}>
        {STEPS.slice(0, 5).map((s, i) => (
          <span key={s} style={{ width: 44, height: 44 }}>
            <Icon.star on={STEPS.indexOf(step) > i} />
          </span>
        ))}
      </div>

      {step === "gong" && (
        // the gong ends above y 452, like the tile rows, so Sensei's caption bubble (y 468+) never covers it or the hand
        <button aria-label="gong" className="pop-in" {...tapProps(tapGong)} style={{ position: "absolute", left: 565, top: 92, width: 310, height: 356 }}>
          <img ref={gongImg} key={gongHit} src={img("item_gong")} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} className={gongHit ? "tut-gong-swing" : "breathe"} />
          {!gongTapped && <TapHint show style={{ right: 6, bottom: 0 }} />}
        </button>
      )}

      {step === "help" && (
        <>
          {/* the thinking ninja → a big arrow swooping along the floor, under Sensei's caption bubble, into Sensei's
              Help button in the bottom-right corner, with rings pulsing round him */}
          <svg className="tut-arrow" viewBox="0 0 840 320" width="840" height="320" style={{ left: 300, top: 380 }} aria-hidden="true">
            <path d={TUT_ARROW} pathLength={1000} fill="none" stroke="#2b1d14" strokeWidth="34" strokeLinecap="round" />
            <path d={TUT_ARROW} pathLength={1000} fill="none" stroke="#ffc53d" strokeWidth="20" strokeLinecap="round" />
            <path d="M836 262 L782 222 L786 304 Z" fill="#ffc53d" stroke="#2b1d14" strokeWidth="8" strokeLinejoin="round" />
          </svg>
          <div className="tut-help-ring" aria-hidden="true" />
          <div className="tut-help-ring late" aria-hidden="true" />
        </>
      )}

      {cur && (
        <>
          {step === "speaker" && (
            <div style={{ position: "absolute", left: 720, top: 96, translate: "-50% 0" }}>
              <RoundButton
                label="Hear it again"
                className={heard ? "" : "pulse"}
                style={{ width: 130, height: 130 }}
                onClick={async () => {
                  await say(ask(cur.target));
                  if (!heard) setHeard(true);
                }}
              >
                <Icon.speaker />
              </RoundButton>
              {!heard && <TapHint show style={{ right: -80, bottom: -50 }} />}
            </div>
          )}
          <div
            className="row"
            style={{ position: "absolute", left: 340, right: 180, top: step === "speaker" ? 250 : 228, gap: many ? 22 : 40, flexWrap: "nowrap", opacity: step === "speaker" && !heard ? 0.35 : 1, transition: "opacity .3s" }}
          >
            {cur.tiles.map((g, i) => (
              <div key={step + g} className="drop-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <button aria-label={g} className={`pic-card ${wrong === g ? "wrong" : right === g ? "right" : helpLvl >= 2 && g === cur.target ? "glow" : ""}`} style={{ width: card, height: card }} {...tapProps<HTMLButtonElement>((el) => tapTile(g, el))}>
                  <img src={img(`pic_${g}`)} alt="" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      {/* captions for grown-ups, in Sensei's bubble above the Help button (the tile rows end above y 452) */}
      <SenseiDock />
    </div>
  );
}
