// Hidden dev scene: /play/?scene=ninja-demo. Every ninja move, every streak tier, a miss and the end-of-level
// celebration on buttons, against a tile, a slot, a picture card, a chest and a monster. docs/HERO.md.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { img, Tile, tapProps, useHelp } from "../ui/ui";
import { NinjaSpot, ninja, MOVES, type Move } from "../ui/Ninja";
import { streak, useStreak } from "../engine/streak";
import { say } from "../engine/audio";

type T = "tile" | "slot" | "card" | "chest" | "monster";
const btn: CSSProperties = {
  font: "700 19px/1 var(--font-ui)", padding: "10px 12px", borderRadius: 14, border: "3px solid #2b1d14", background: "#fff4dc",
  boxShadow: "0 4px 0 #2b1d14", minWidth: 64, minHeight: 44, color: "#2b1d14",
};

export function NinjaDemo() {
  const [target, setTarget] = useState<T>("monster");
  const [slow, setSlow] = useState(1);
  const { n, tier } = useStreak();
  const refs = useRef<Partial<Record<T, HTMLElement | null>>>({});
  useHelp(() => say({ line: "help_start" }));
  useEffect(() => {
    streak.reset();
    return () => ninja.setSlowmo(1);
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
    </div>
  );
}
