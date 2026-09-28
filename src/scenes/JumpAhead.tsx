// "Too easy? Jump ahead!" — offered after three perfect levels in a row (and from the grown-ups area).
// Milestones come from MILESTONES in content/worlds.ts, so the menu grows automatically with new content.
// Navigation (docs/NAVIGATION.md §5.A): a dialog (role="dialog", data-modal, and a modal nav entry, so the screen's own
// Next and Hear it again are hidden while it is open). Its own Hear it again sits beside "No thanks" (the panel covers
// the nav row); Home stays on top and leaves the screen.
// A jump is a grown-up's decision (docs/CONFIRM.md §1): picking a milestone opens a second step that names, in words,
// where the child will land ("Blossom Hills, stone 1"), with its own button; the jump is logged in the grown-ups'
// "Automatic moves", and the grown-ups page offers "Move back to where they were" until the child plays on.
import { useEffect, useRef, useState } from "react";
import { MILESTONES, LEVELS, startLevelAfter, worldOf, type Level } from "../content/worlds";
import { frontier, placeAtUnit } from "../engine/gems";
import { say, sfx } from "../engine/audio";
import { store, logAdjust, type Save } from "../engine/store";
import { tapProps, RoundButton, Icon, fx, useHelp } from "../ui/ui";
import { useNav, ReplayButton } from "../ui/nav";

const stone = (l: Level) => `${worldOf(l).name}, stone ${worldOf(l).levels.indexOf(l) + 1}`;
const starCount = (s: Save) => Object.values(s.stars).filter((n) => n > 0).length;

/** What a jump changed, so a grown-up can undo it: kept in the save (the `jumpUndo` field) until the child plays on. */
interface JumpUndo {
  at: number;
  label: string;
  /** stars earned when the jump was made: once the child has earned more, the undo is no longer offered */
  stars: number;
  placedAt?: string;
  petals: string[];
  energy: Record<string, number>;
}
/** The jump that can still be undone (none once the child has earned a star since it). */
export function jumpUndoOf(s: Save = store.get()): JumpUndo | null {
  const u = (s as Save & { jumpUndo?: JumpUndo }).jumpUndo;
  return u && starCount(s) === u.stars ? u : null;
}
/** "Move back to where they were": the starting point, spellings and gem energy from before the jump. */
export function undoJump() {
  const u = jumpUndoOf();
  if (!u) return;
  const was = frontier();
  store.set((s) => {
    s.placedAt = u.placedAt;
    s.petals = [...u.petals];
    s.energy = { ...u.energy };
    delete (s as Save & { jumpUndo?: JumpUndo }).jumpUndo;
  });
  logAdjust(`Moved back to where they were before the jump to ${u.label}: from ${stone(was)} to ${stone(frontier())} (a grown-up)`);
}

/** gated: options need a 1.5 s press-and-hold, so a child can't skip the teaching alone (the grown-ups area is already gated) */
export function JumpAhead({ onClose, onJumped, gated = false }: { onClose: () => void; onJumped: () => void; gated?: boolean }) {
  const [holding, setHolding] = useState<{ id: string; p: number } | null>(null);
  const [asking, setAsking] = useState<(typeof MILESTONES)[number] | null>(null); // the second step: "Move them to …?"
  const raf = useRef(0);
  const askedAt = useRef(0); // (the second step's buttons wait 600 ms, so a double tap on a milestone can't answer it)
  const ask = (m: (typeof MILESTONES)[number]) => {
    askedAt.current = performance.now();
    setAsking(m);
  };
  const settled = () => performance.now() - askedAt.current > 600;
  const jump = (m: (typeof MILESTONES)[number]) => {
    const s = store.get();
    const was = frontier(s);
    const undo: JumpUndo = { at: Date.now(), label: m.label, stars: starCount(s), placedAt: s.placedAt, petals: [...s.petals], energy: { ...s.energy } };
    sfx.whoosh();
    fx.rain("confetti", 60);
    placeAtUnit(m.unit);
    store.set((x) => void ((x as Save & { jumpUndo?: JumpUndo }).jumpUndo = undo));
    logAdjust(`Jumped ahead to ${m.label}: from ${stone(was)} to ${stone(frontier())} (a grown-up)`);
    say({ line: "jump_done" });
    onJumped();
  };
  const startHold = (m: (typeof MILESTONES)[number]) => {
    const t0 = performance.now();
    const tick = () => {
      const p = (performance.now() - t0) / 1500;
      if (p >= 1) {
        setHolding(null);
        ask(m);
      } else {
        setHolding({ id: m.id, p });
        raf.current = requestAnimationFrame(tick);
      }
    };
    raf.current = requestAnimationFrame(tick);
  };
  const stopHold = () => {
    cancelAnimationFrame(raf.current);
    setHolding(null);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const here = LEVELS.indexOf(frontier());
  const options = MILESTONES.filter((m) => LEVELS.indexOf(startLevelAfter(m.unit)) > here);
  useEffect(() => {
    say({ line: "jump_pick" });
  }, []);
  useHelp(() => say({ line: "jump_pick" }));
  const again = () => say({ line: "jump_pick" });
  useNav({ modal: true, again, againAt: "own" });
  const btn = { padding: "14px 22px", borderRadius: 18, border: "5px solid var(--ink)", boxShadow: "0 5px 0 var(--ink)", fontWeight: 800, fontSize: 24 } as const;
  return (
    <div role="dialog" aria-label="Jump ahead" data-modal style={{ position: "absolute", inset: 0, zIndex: 60, background: "rgba(29,18,48,.7)", display: "grid", placeItems: "center" }} {...tapProps(onClose)}>
      <div className="panel pop-in" onPointerDown={(e) => e.stopPropagation()} style={{ width: 860, padding: "26px 34px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="display" style={{ fontSize: 50, color: "#ff7aa2", textAlign: "center" }}>Jump ahead?</div>
        {asking ? (
          // the second step: where the child will land, in words, with its own button
          <>
            <div style={{ textAlign: "center", fontSize: 26, fontWeight: 700, lineHeight: 1.35 }}>
              Move your child to <b>{stone(startLevelAfter(asking.unit))}</b> ({asking.label})?
            </div>
            <div style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: "var(--ink-soft)" }}>
              They're at {stone(frontier())} now. Earlier levels stay open, and you can move them back from the grown-ups page until they play on.
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
              <button aria-label="Cancel" {...tapProps(() => settled() && setAsking(null))} style={{ ...btn, background: "#fff" }}>
                Cancel
              </button>
              <button aria-label={`Jump to ${asking.label}`} {...tapProps(() => settled() && jump(asking))} style={{ ...btn, background: "#dff5c8" }}>
                Yes, jump to {stone(startLevelAfter(asking.unit))}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", fontSize: 22, fontWeight: 700, color: "var(--ink-soft)", marginTop: -8 }}>Grown-ups: pick where your child is at school{gated ? " (press and hold)" : ""}. Earlier levels stay open.</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(options.length, 2)}, 1fr)`, gap: 16 }}>
              {options.map((m, i) => (
                <button
                  key={m.id}
                  aria-label={m.label}
                  className="pop-in"
                  {...(gated ? { onPointerDown: () => startHold(m), onPointerUp: stopHold, onPointerLeave: stopHold } : tapProps(() => ask(m)))}
                  style={{ position: "relative", overflow: "hidden", padding: "16px 20px", borderRadius: 22, border: "5px solid var(--ink)", boxShadow: "0 6px 0 var(--ink)", background: ["#dff5c8", "#fff1b8", "#ffd9e6", "#d8ecff"][i % 4], textAlign: "left", animationDelay: `${i * 0.06}s` }}
                >
                  {holding?.id === m.id && <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${holding.p * 100}%`, background: "rgba(63,191,106,.35)" }} />}
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 32 }}>{m.label}</div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: "var(--ink-soft)" }}>{m.note}</div>
                </button>
              ))}
            </div>
          </>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
          <RoundButton sm label="No thanks" onClick={onClose}><Icon.back /></RoundButton>
          <ReplayButton onReplay={again} size={100} />
        </div>
      </div>
    </div>
  );
}
