// First-time, step-by-step introductions for the Sound Flower and the Word Book.
// Each step is one short spoken line with its own little animation. Tapping skips to the next step.
import { useEffect, useRef, useState } from "react";
import { say, sfx, hush } from "../engine/audio";
import { img, tapProps, fx, RoundButton, Icon } from "../ui/ui";
import { GemIcon } from "../ui/Gem";
import { teardrop } from "./Tree";

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

export function FlowerIntro({ onDone }: { onDone: () => void }) {
  const { step, next } = useSteps(["flower_i1", ["flower_i2", { gap: 200 }, { sound: "a" }], "flower_i3", "flower_i4", "flower_i5", "flower_i6"], onDone);
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
      {/* the broken flower: a golden centre with empty petal outlines */}
      <svg viewBox="-300 -300 600 600" className={`intro-flower ${step >= 1 ? "shrink" : ""}`}>
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 30}) translate(0 -150) rotate(180)`}>
            <path d={teardrop(80, 150)} fill={step >= 5 && i === 0 ? petalColour : "rgba(255,255,255,.35)"} stroke={step >= 5 && i === 0 ? "#2b1d14" : "rgba(255,255,255,.7)"} strokeWidth={4} strokeDasharray={step >= 5 && i === 0 ? undefined : "8 8"} className={step >= 5 && i === 0 ? "petal-land" : ""} />
          </g>
        ))}
        <circle r="70" fill="#ffc53d" stroke="#2b1d14" strokeWidth="6" />
      </svg>
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

export function BookIntro({ onDone }: { onDone: () => void }) {
  const { step, next } = useSteps(["book_i1", "book_i2", "book_i3"], onDone);
  useEffect(() => {
    if (step === 1) setTimeout(() => (sfx.pop(), fx.burst(640, 360, "stars", 16)), 700);
  }, [step]);
  return (
    <div className="intro-overlay" data-modal {...tapProps(next)}>
      <div className="intro-book pop-in">
        <svg viewBox="0 0 64 64" width="220" height="220"><path fill="#fff4dc" stroke="#2b1d14" strokeWidth={3} strokeLinejoin="round" d="M6 14c9-3 17-3 26 2v38c-9-5-17-5-26-2zM58 14c-9-3-17-3-26 2v38c9-5 17-5 26-2z" /></svg>
        {step >= 1 && (
          <div className="intro-sticker">
            <img src={img("pic_cat")} alt="" />
            <span>cat</span>
          </div>
        )}
      </div>
      <div style={{ position: "absolute", right: 24, top: 24 }}>
        <RoundButton sm label="Next" onClick={next}><Icon.next /></RoundButton>
      </div>
    </div>
  );
}
