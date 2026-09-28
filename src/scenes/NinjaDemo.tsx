// Hidden dev scene: /play/?scene=ninja-demo. Every ninja move, every streak tier, a miss and the end-of-level
// celebration on buttons, against a tile, a slot, a picture card, a chest and a monster. docs/HERO.md.
// For stills (frame checks): ?tier=0..3 opens at that tier with its aura already on (no power-up, no line), and
// ?strike=1 (or a move name: ?strike=cast) strikes the monster once, 1.5 s in; window.__demoHit is the
// performance.now() when that strike lands.
// ?ready=1: a readiness hold's look (docs/TEACHER_SCRIPT.md §2.3): ▶ pops in at the nav row's Next slot and the ninja turns
// to face it in its ready stance; tap ▶ and the ninja bows (then ▶ comes back 2.5 s later). ?ready=bow also taps it by
// itself 2.5 s in (window.__demoBow is the performance.now() when the bow starts), for stills of the bow.
// ?caption=1: Sensei's caption bubble with a sound in it, drawn as its petal (needs the grown-ups' captions setting on).
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { img, Tile, tapProps, useHelp, fx, Icon, SenseiDock } from "../ui/ui";
import { NinjaSpot, ninja, MOVES, type Move } from "../ui/Ninja";
import { GemIcon } from "../ui/Gem";
import { streak, useStreak, TIER_AT, type Tier } from "../engine/streak";
import { say } from "../engine/audio";

type T = "tile" | "slot" | "card" | "chest" | "monster";
const btn: CSSProperties = {
  font: "700 19px/1 var(--font-ui)", padding: "10px 12px", borderRadius: 14, border: "3px solid #2b1d14", background: "#fff4dc",
  boxShadow: "0 4px 0 #2b1d14", minWidth: 64, minHeight: 44, color: "#2b1d14",
};

const q = new URLSearchParams(typeof location !== "undefined" ? location.search : "");
const QT = Number(q.get("tier"));
/** ?tier=N: the streak to open at (the tier's first streak length) */
const OPEN_AT = q.has("tier") && QT >= 0 && QT <= 3 ? TIER_AT[QT as Tier] : null;
const STRIKE = q.get("strike");
const LOOK = q.has("look");
const STRIKE_MOVE: Move | null = !STRIKE ? null : (MOVES as string[]).includes(STRIKE) ? (STRIKE as Move) : "kick";
const READY = q.get("ready");
const CAPTION = q.has("caption");

/** ?ready: a stand-in ▶ at the nav row's Next slot (nav.tsx NAV_SLOTS.row.next), the ninja facing it, and the bow. */
function ReadyDemo() {
  const [up, setUp] = useState(false);
  const bowNow = () => {
    setUp(false);
    (window as any).__demoBow = performance.now();
    void ninja.act("bow");
    ninja.pose(null);
    window.setTimeout(() => {
      setUp(true);
      ninja.pose("ready", { face: "next" });
    }, 2500);
  };
  useEffect(() => {
    const t = [window.setTimeout(() => (setUp(true), requestAnimationFrame(() => ninja.pose("ready", { face: "next" }))), 900)];
    if (READY === "bow") t.push(window.setTimeout(bowNow, 2500));
    return () => (t.forEach(clearTimeout), ninja.pose(null));
  }, []);
  if (!up) return null;
  return (
    <button
      aria-label="Next"
      data-nav="next"
      className="btn-round go pulse pop-in"
      style={{ position: "absolute", left: 1030 - 66, top: 628 - 66, width: 132, height: 132, zIndex: 20 }}
      {...tapProps(bowNow)}
    >
      <Icon.next />
    </button>
  );
}

/** ?caption: a line with sounds in it, again and again, for the caption bubble's petals. */
function CaptionDemo() {
  useEffect(() => {
    let alive = true;
    const go = async () => {
      while (alive) {
        await say([{ line: "t_two_letters" }, { sound: "sh", show: "petal" }, { gap: 400 }, { line: "thats" }, { sound: "s", show: "hidden" }, { line: "we_need" }, { sound: "ks", show: "petal" }]);
        await new Promise((r) => setTimeout(r, 1200));
      }
    };
    void go();
    return () => void (alive = false);
  }, []);
  return <SenseiDock />;
}

/** ?look=1: the looping effects that live in styles.css and Gem.tsx, side by side, for before/after stills (a ready gem,
 *  charging gems, the reward's focused gem, hinted tiles, Baron's card). */
function LookSheet() {
  const c = "#e8312f";
  // Sensei talks for about nine seconds, so the Help button's waves can be caught
  useEffect(() => void say([{ line: "flower_i1" }, { line: "flower_i1" }]), []);
  return (
    <div data-look style={{ position: "absolute", inset: 0, zIndex: 30, background: "rgba(29,18,48,.55)" }}>
      <div style={{ position: "absolute", left: 40, top: 40, display: "flex", gap: 28, alignItems: "center" }}>
        <GemIcon g="ai" colour={c} state="future" size={120} />
        <GemIcon g="ai" colour={c} state="hidden" size={120} />
        <GemIcon g="ai" colour={c} state="charging" energy={0.35} size={120} />
        <GemIcon g="ai" colour="#2ec4b6" state="charging" energy={0.8} size={120} />
        <GemIcon g="ai" colour={c} state="ready" size={120} />
        <GemIcon g="ai" colour="#4a7dff" state="won" size={120} />
        <div className="reward-gems focusing" style={{ position: "relative", display: "flex", gap: 20, left: 0, top: 0, transform: "none" }}>
          <div className="rw-gem-focus">
            <GemIcon g="sh" colour="#8a3be0" state="charging" energy={0.6} size={120} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, top: 260, display: "flex", gap: 40, alignItems: "center" }}>
        <Tile g="a" state="hint" />
        <Tile g="sh" state="hint" size="lg" />
        <Tile g="m" state="hint" size="sm" />
      </div>
      <div style={{ position: "absolute", left: 560, top: 250, width: 700, height: 440 }}>
        <div className="villain-card" style={{ right: 40, top: 20 }}>
          <div className="villain-clip">
            <img src={img("baron_mouth_base")} alt="" />
          </div>
          <div className="villain-name">Baron Muddle</div>
        </div>
      </div>
    </div>
  );
}

export function NinjaDemo() {
  const [target, setTarget] = useState<T>("monster");
  const [slow, setSlow] = useState(1);
  // the streak starts before the ninja mounts, so a ?tier= opens with its aura on and no power-up
  useState(() => {
    streak.reset();
    if (OPEN_AT != null) streak.set(OPEN_AT);
  });
  const { n, tier } = useStreak();
  const refs = useRef<Partial<Record<T, HTMLElement | null>>>({});
  useHelp(() => say({ line: "help_start" }));
  useEffect(() => {
    let t = 0;
    if (STRIKE_MOVE)
      t = window.setTimeout(() => {
        void ninja.act(STRIKE_MOVE, refs.current.monster ?? null).then(() => ((window as any).__demoHit = performance.now()));
      }, 1500);
    return () => (clearTimeout(t), ninja.setSlowmo(1));
  }, []);
  (window as any).__snState = { scene: "ninja-demo", n, tier };
  const el = () => refs.current[target] ?? null;
  const B = ({ label, on, hot }: { label: string; on: () => void; hot?: boolean }) => (
    <button aria-label={`demo ${label}`} data-demo={label} style={{ ...btn, background: hot ? "#ffc53d" : btn.background }} {...tapProps(on)}>
      {label}
    </button>
  );
  const pick = (t: T) => ({ ref: (e: HTMLElement | null) => void (refs.current[t] = e), onPointerDown: () => setTarget(t), "data-target": t });
  const ring = (t: T): CSSProperties => (target === t ? { outline: "5px dashed #ffc53d", outlineOffset: 8 } : {});
  return (
    <div className="scene">
      <img className="bg-img" src={img("bg_bamboo")} alt="" />
      <div className="vignette" />

      {/* targets */}
      <div {...pick("card")} className="pic-card" style={{ position: "absolute", left: 420, top: 150, width: 170, height: 170, ...ring("card") }}>
        <img src={img("pic_cat")} alt="" />
      </div>
      <div {...pick("chest")} style={{ position: "absolute", left: 640, top: 190, width: 170, height: 150, ...ring("chest") }}>
        <img src={img("item_chest")} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <div {...pick("monster")} style={{ position: "absolute", left: 860, top: 150, width: 260, height: 260, ...ring("monster") }}>
        <img className="sprite breathe" src={img("mon_gloop")} alt="" style={{ position: "relative", width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <div style={{ position: "absolute", left: 470, top: 380, display: "flex", gap: 16, alignItems: "center" }}>
        <div {...pick("tile")} style={ring("tile")}>
          <Tile g="sh" />
        </div>
        <div {...pick("slot")} className="slot active" style={ring("slot")} />
      </div>

      {/* controls */}
      <div style={{ position: "absolute", left: 130, right: 20, top: 16, display: "flex", flexWrap: "wrap", gap: 8, zIndex: 20 }}>
        {MOVES.map((m) => (
          <B key={m} label={m} on={() => void ninja.act(m as Move, el())} />
        ))}
        <B label="strike" hot on={() => void ninja.strike(el())} />
        <B label="hit" hot on={() => (streak.hit(), void ninja.strike(el()))} />
        <B label="miss" on={() => streak.miss()} />
        <B label="reset" on={() => streak.reset()} />
        <B label="3" on={() => streak.set(3)} />
        <B label="6" on={() => streak.set(6)} />
        <B label="10" on={() => streak.set(10)} />
        <B label="celebrate" hot on={() => void ninja.celebrate()} />
        <B label="carry" on={() => void ninja.carry(refs.current.tile!, refs.current.slot!)} />
        <B label="knock" on={() => void ninja.knock(refs.current.tile!)} />
        <B label="kiai" on={() => ninja.say()} />
        {/* decoration falls as blossoms ("petals" is drawn as blossoms since Dec6); "rainbow" is the all-the-sounds teardrop */}
        <B label="petals" on={() => fx.burst(640, 300, "petals", 30, 1.2)} />
        <B label="rainbow" on={() => fx.burst(640, 300, "rainbow", 30, 1.2)} />
        <B
          label={slow > 1 ? `slow ${slow}x` : "slow-mo"}
          on={() => {
            const k = slow === 1 ? 4 : 1;
            setSlow(k);
            ninja.setSlowmo(k);
          }}
        />
      </div>
      <div style={{ position: "absolute", left: 470, top: 520, font: "700 22px var(--font-ui)", color: "#fff4dc", textShadow: "0 2px 0 #2b1d14" }}>
        streak {n} · tier {tier} · target: {target}
      </div>

      <NinjaSpot />
      {LOOK && <LookSheet />}
      {READY && <ReadyDemo />}
      {CAPTION && <CaptionDemo />}
    </div>
  );
}
