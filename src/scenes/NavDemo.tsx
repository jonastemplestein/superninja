// Hidden dev scene: /play/?scene=nav-demo. The shared navigation pieces (src/ui/nav.tsx, docs/NAVIGATION.md) on one
// screen: a three-step show on usePresentation (Back, Hear it again, Next: nothing moves on by itself, and the idle nudge
// at 8 s and 16 s), then a turn that asks with told() and shows the sound picture, then a holdNext. ?badges=1 shows every
// sound's SoundBadge (the chart pictures, for the art review).
import { useEffect, useState } from "react";
import { Icon, RoundButton, sleep } from "../ui/ui";
import { say, sfx } from "../engine/audio";
import { NinjaSpot, ninja } from "../ui/Ninja";
import { usePresentation, useHome, useNav, told, clearTold, holdNext, dropHolds, NAV_SLOTS, slotStyle, type Step } from "../ui/nav";
import { SoundBadge } from "../ui/SoundBadge";
import { PicCard } from "./Early";
import { CHART_PETALS } from "../content/flower";

export function NavDemo({ onHome }: { onHome: () => void }) {
  const badges = new URLSearchParams(location.search).has("badges");
  useHome(onHome);
  const [phase, setPhase] = useState<"show" | "turn">("show");
  const [round, setRound] = useState(0);
  const again = () => {
    dropHolds();
    setRound((r) => r + 1);
    setPhase("show");
  };
  return (
    <div className="scene" style={{ background: "linear-gradient(180deg,#fff4dc,#f6e3bb)" }}>
      {badges ? (
        <BadgeWall />
      ) : (
        <>
          <NinjaSpot />
          {phase === "show" ? <Show key={`s${round}`} onDone={() => setPhase("turn")} /> : <Turn key={`t${round}`} onAgain={again} />}
        </>
      )}
    </div>
  );
}

const CX = 725; // the play area's centre (x 340–1110)
function Show({ onDone }: { onDone: () => void }) {
  const [pic, setPic] = useState<"flower" | "petal" | "words">("flower");
  const steps: Step[] = [
    { key: "hello", enter: () => setPic("flower"), run: () => say({ line: "film_1" }) },
    { key: "petal", enter: () => setPic("petal"), sound: "s", run: () => say([{ line: "flower_i2" }, { gap: 150 }, { sound: "s" }]) },
    {
      key: "words",
      enter: () => setPic("words"),
      sound: "s",
      run: async (live) => {
        await sleep(300);
        if (live()) await say([{ line: "fm_rw2_s" }, { gap: 150 }, { sound: "s" }]);
      },
    },
  ];
  usePresentation(steps, { id: "nav-demo", onDone });
  return (
    <>
      {pic === "flower" && (
        <div className="pop-in" style={{ position: "absolute", left: CX - 160, top: 150, width: 320, height: 320 }}>
          <Icon.tree />
        </div>
      )}
      {pic === "petal" && <SoundBadge p="s" size={230} style={{ position: "absolute", left: CX - 115, top: 110 }} className="pop-in" />}
      {pic === "words" && (
        <div style={{ position: "absolute", left: 360, top: 170, width: 730, display: "flex", justifyContent: "space-between" }}>
          {["sun", "sock", "sausage", "sunflower"].map((w) => (
            <PicCard key={w} w={w} size={140} gutter={16} still className="pop-in" />
          ))}
        </div>
      )}
    </>
  );
}

function Turn({ onAgain }: { onAgain: () => void }) {
  const [state, setState] = useState<"ask" | "right" | "done">("ask");
  useNav({ again: "told", sound: "s" });
  useEffect(() => {
    clearTold();
    void told({ line: "fm_tap_sun" }, { fresh: true });
  }, []);
  const tap = async (w: string, el: HTMLElement) => {
    if (state !== "ask") return;
    if (w !== "sun") {
      sfx.wrong();
      void say([{ line: "fm_its_this" }]);
      return;
    }
    setState("right");
    sfx.good();
    void ninja.strike(el, { soft: true });
    await say({ line: "yay_1" });
    setState("done");
    // the end: held until Next (a new round), with the closing line to hear again
    if (await holdNext("nav-demo:end", () => say({ line: "yay_7" }))) onAgain();
  };
  (window as any).__snState = { scene: "pick", next: state === "ask" ? "sun" : null, busy: state !== "ask" };
  return (
    <>
      <div className="pick-row" style={{ position: "absolute", left: 380, top: 150, width: 690, display: "flex", justifyContent: "space-between" }}>
        {["dog", "sun"].map((w) => (
          <PicCard key={w} w={w} size={220} gutter={20} state={state !== "ask" && w === "sun" ? "right" : undefined} onTap={(el) => void tap(w, el)} />
        ))}
      </div>
      {state === "done" && (
        <RoundButton label="Play again" onClick={onAgain} style={slotStyle(NAV_SLOTS.row.back)} className="pop-in">
          <Icon.again />
        </RoundButton>
      )}
    </>
  );
}

/** Every sound's badge, in chart order, with its chart word underneath for grown-ups. */
function BadgeWall() {
  return (
    <div className="scrollable" style={{ position: "absolute", left: 130, right: 150, top: 16, bottom: 16, overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "10px 14px", justifyContent: "center", alignContent: "flex-start" }}>
      {CHART_PETALS.map((c) => (
        <div key={c.p} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 96 }}>
          <SoundBadge p={c.p} size={84} />
          <span data-grownups style={{ font: "700 15px/1.1 var(--font-ui)", color: "var(--ink-soft)", marginTop: 4 }}>
            /{c.p}/ {c.iconWord}
          </span>
        </div>
      ))}
    </div>
  );
}
