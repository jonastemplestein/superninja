// "Too easy? Jump ahead!" — offered after three perfect levels in a row (and from the grown-ups area).
// Milestones come from MILESTONES in content/worlds.ts, so the menu grows automatically with new content.
// Navigation (docs/NAVIGATION.md §5.A): a dialog (role="dialog", data-modal, and a modal nav entry, so the screen's own
// Next and Hear it again are hidden while it is open). Its own Hear it again sits beside "No thanks" (the panel covers
// the nav row); Home stays on top and leaves the screen.
import { useEffect, useRef, useState } from "react";
import { MILESTONES, LEVELS, startLevelAfter } from "../content/worlds";
import { frontier, placeAtUnit } from "../engine/gems";
import { say, sfx } from "../engine/audio";
import { tapProps, RoundButton, Icon, fx, useHelp } from "../ui/ui";
import { useNav, ReplayButton } from "../ui/nav";

/** gated: options need a 1.5 s press-and-hold, so a child can't skip the teaching alone (the grown-ups area is already gated) */
export function JumpAhead({ onClose, onJumped, gated = false }: { onClose: () => void; onJumped: () => void; gated?: boolean }) {
  const [holding, setHolding] = useState<{ id: string; p: number } | null>(null);
  const raf = useRef(0);
  const jump = (unit: number) => {
    sfx.whoosh();
    fx.rain("confetti", 60);
    placeAtUnit(unit);
    say({ line: "jump_done" });
    onJumped();
  };
  const startHold = (id: string, unit: number) => {
    const t0 = performance.now();
    const tick = () => {
      const p = (performance.now() - t0) / 1500;
      if (p >= 1) {
        setHolding(null);
        jump(unit);
      } else {
        setHolding({ id, p });
        raf.current = requestAnimationFrame(tick);
      }
    };
    raf.current = requestAnimationFrame(tick);
  };
  const stopHold = () => {
    cancelAnimationFrame(raf.current);
    setHolding(null);
  };
  const here = LEVELS.indexOf(frontier());
  const options = MILESTONES.filter((m) => LEVELS.indexOf(startLevelAfter(m.unit)) > here);
  useEffect(() => {
    say({ line: "jump_pick" });
  }, []);
  useHelp(() => say({ line: "jump_pick" }));
  const again = () => say({ line: "jump_pick" });
  useNav({ modal: true, again, againAt: "own" });
  return (
    <div role="dialog" aria-label="Jump ahead" data-modal style={{ position: "absolute", inset: 0, zIndex: 60, background: "rgba(29,18,48,.7)", display: "grid", placeItems: "center" }} {...tapProps(onClose)}>
      <div className="panel pop-in" onPointerDown={(e) => e.stopPropagation()} style={{ width: 860, padding: "26px 34px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="display" style={{ fontSize: 50, color: "#ff7aa2", textAlign: "center" }}>Jump ahead?</div>
        <div style={{ textAlign: "center", fontSize: 22, fontWeight: 700, color: "var(--ink-soft)", marginTop: -8 }}>Grown-ups: pick where your child is at school{gated ? " (press and hold)" : ""}. Earlier levels stay open.</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(options.length, 2)}, 1fr)`, gap: 16 }}>
          {options.map((m, i) => (
            <button
              key={m.id}
              aria-label={m.label}
              className="pop-in"
              {...(gated ? { onPointerDown: () => startHold(m.id, m.unit), onPointerUp: stopHold, onPointerLeave: stopHold } : tapProps(() => jump(m.unit)))}
              style={{ position: "relative", overflow: "hidden", padding: "16px 20px", borderRadius: 22, border: "5px solid var(--ink)", boxShadow: "0 6px 0 var(--ink)", background: ["#dff5c8", "#fff1b8", "#ffd9e6", "#d8ecff"][i % 4], textAlign: "left", animationDelay: `${i * 0.06}s` }}
            >
              {holding?.id === m.id && <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${holding.p * 100}%`, background: "rgba(63,191,106,.35)" }} />}
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32 }}>{m.label}</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: "var(--ink-soft)" }}>{m.note}</div>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
          <RoundButton sm label="No thanks" onClick={onClose}><Icon.back /></RoundButton>
          <ReplayButton onReplay={again} size={100} />
        </div>
      </div>
    </div>
  );
}
