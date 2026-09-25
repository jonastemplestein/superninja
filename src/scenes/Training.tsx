// Ninja Training: teaches the controls and checks the child can use them before the adventure starts.
// 1. tap a big target  2. tap Sensei (the Help button)  3. tap a letter tile for a sound
// 4. use the replay speaker  5. do one on their own (help is still there if needed)
import { useEffect, useState } from "react";
import { say, sfx, playMusic } from "../engine/audio";
import { shuffle } from "../engine/learner";
import { store } from "../engine/store";
import { img, fx, tapProps, useHelp, nudgeHelp, RoundButton, Icon, TapHint, heroImg, useHero, stageXY } from "../ui/ui";

type Step = "gong" | "help" | "tile" | "speaker" | "test" | "done";

export function Training({ onDone }: { onDone: () => void }) {
  const hero = useHero();
  const [step, setStep] = useState<Step>("gong");
  const [heard, setHeard] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);
  const [helpLvl, setHelpLvl] = useState(0);

  // pictures, not letters: training teaches the controls, not phonics (docs/PEDAGOGY.md)
  const task: Record<string, { target: string; tiles: string[] }> = {
    tile: { target: "sun", tiles: ["sun", "dog", "cup"] },
    speaker: { target: "mat", tiles: ["bus", "mat", "hen"] },
    test: { target: "fan", tiles: shuffle(["fan", "pig", "cup", "hat"]) },
  };
  const cur = task[step];
  const ask = (w: string): any[] => [{ line: "listen_tap" }, { gap: 350 }, { word: w }];

  useEffect(() => {
    playMusic("dojo");
    say({ line: "tut_1" });
  }, []);

  // the Help button means different things during training
  useHelp(
    (n) => {
      if (step === "help") return advance("tile");
      if (step === "gong") return say({ line: "tut_1" });
      if (cur) {
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
    nudgeHelp(false);
    if (step === "help") {
      sfx.great();
      await say({ line: "tut_help_ok" });
    }
    setStep(next);
    if (next === "help") {
      nudgeHelp(true);
      await say({ line: "tut_help" });
    } else if (next === "tile") await say(ask("sun"));
    else if (next === "speaker") await say({ line: "tut_speaker" });
    else if (next === "test") await say([{ line: "youdo" }, { gap: 300 }, ...ask("fan")]);
    else if (next === "done") {
      sfx.fanfare();
      fx.rain("confetti", 80);
      store.set((s) => void (s.seenTraining = true));
      await say({ line: "tut_done" });
      onDone();
    }
  };

  const tapTile = async (g: string, el: HTMLElement) => {
    if (!cur || right) return;
    if (step === "speaker" && !heard) return say({ line: "tut_speaker" });
    if (g === cur.target) {
      setRight(g);
      sfx.good();
      const xy = stageXY(el);
      fx.burst(xy.x, xy.y, "stars", 16);
      await say([{ word: g }, { gap: 150 }, { line: "yay_1" }]);
      advance(step === "tile" ? "speaker" : step === "speaker" ? "test" : "done");
    } else {
      setWrong(g);
      sfx.wrong();
      nudgeHelp(true);
      await say([{ line: "this_is_a" }, { word: g }, { gap: 200 }, { line: "tut_stuck" }], { reveal: true });
      setWrong(null);
    }
  };

  (window as any).__snState =
    step === "gong" ? { scene: "tut-gong" } : step === "help" ? { scene: "tut-help" } : cur ? { scene: step === "speaker" && !heard ? "tut-speaker" : "find", next: cur.target } : {};

  return (
    <div className="scene">
      <img className="bg-img" src={img("dojo_bg")} alt="" />
      <div className="vignette" />
      <img className="sprite breathe" src={heroImg(hero, step === "done" ? "cheer" : "idle")} alt="" style={{ right: 30, bottom: 10, width: 200 }} />
      {/* progress: five little stars */}
      <div className="row" style={{ position: "absolute", left: 0, right: 0, top: 24, gap: 8 }}>
        {(["gong", "help", "tile", "speaker", "test"] as Step[]).map((s, i) => (
          <span key={s} style={{ width: 44, height: 44 }}>
            <Icon.star on={["gong", "help", "tile", "speaker", "test", "done"].indexOf(step) > i} />
          </span>
        ))}
      </div>

      {step === "gong" && (
        <button
          aria-label="gong"
          className="pop-in"
          {...tapProps(async (el) => {
            sfx.gong();
            const xy = stageXY(el);
            fx.burst(xy.x, xy.y, "stars", 24);
            await say({ line: "tut_good" });
            advance("help");
          })}
          style={{ position: "absolute", left: 470, top: 150, width: 340, height: 380 }}
        >
          <img src={img("item_gong")} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} className="breathe" />
          <TapHint show style={{ right: 10, bottom: 0 }} />
        </button>
      )}

      {step === "help" && (
        <>
          {/* a big arrow pointing at Sensei in the corner */}
          <svg viewBox="0 0 200 120" width="260" style={{ position: "absolute", left: 150, bottom: 110, animation: "taphint 1.2s ease-in-out infinite" }}>
            <path d="M190 20 C120 20 70 50 40 95" fill="none" stroke="#2b1d14" strokeWidth="16" strokeLinecap="round" />
            <path d="M190 20 C120 20 70 50 40 95" fill="none" stroke="#ffc53d" strokeWidth="9" strokeLinecap="round" />
            <path d="M18 108 L30 70 L62 96 Z" fill="#ffc53d" stroke="#2b1d14" strokeWidth="6" strokeLinejoin="round" />
          </svg>
        </>
      )}

      {cur && (
        <>
          {step === "speaker" && (
            <div style={{ position: "absolute", left: "50%", top: 110, translate: "-50% 0" }}>
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
          <div className="row" style={{ position: "absolute", left: 0, right: 0, top: step === "speaker" ? 330 : 250, gap: 40, opacity: step === "speaker" && !heard ? 0.35 : 1, transition: "opacity .3s" }}>
            {cur.tiles.map((g, i) => (
              <div key={step + g} className="drop-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <button aria-label={g} className={`pic-card ${wrong === g ? "wrong" : right === g ? "right" : helpLvl >= 2 && g === cur.target ? "glow" : ""}`} style={{ width: 200, height: 200 }} {...tapProps<HTMLButtonElement>((el) => tapTile(g, el))}>
                  <img src={img(`pic_${g}`)} alt="" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
