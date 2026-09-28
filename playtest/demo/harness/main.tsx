// Sensei's demo harness (docs/DEMO_CHOREOGRAPHY.md §7): one full W1-style "I do", "Find the sausage", with the real
// art, the real lines and Sensei's paw (src/ui/SenseiDemo.tsx), in the game's shell (the Stage, the ninja, Help, the nav
// layer, the effects), outside the shared dev server:
//   the cards drop in; the two the demo doesn't use are named (mechanics §5.4: the rule names the sausage) · the rule
//   as a hypothetical ("Let's pretend I say, ‘Find the sausage.’ Then you tap on the sausage.") · "Let me show you."
//   (her paw comes out of her portrait) · "I'm going to tap on the sausage… now…" (the paw sets off on "now") · "Look!"
//   · the press, then the sausage goes green and says its word · a calm beat · the Ready hold (▶, or the paw: Show me
//   again replays the demo at the same pace) · "Your word is sock. Can you find the sock?" · the child's tap, and only
//   now the ninja strikes.
// The cards are live from the moment they land (TEACHER_SCRIPT §0.1): a tap during the names or the demo lights the card
// at once (a bounce and its ring) and its word comes at Sensei's next pause (SenseiDemo's demoTap); a tap during the
// Ready hold answers it, and the card says its word before the hand-over.
// The ninja only watches during Sensei's demo (ninja.pose("listen", { face }) until Ninja.tsx has a watch pose).
// The page waits for a first tap (the audio unlock) on its start card. __snState { scene: "demo-harness", next } for the
// recorder; window.__snDemoLog (SenseiDemo's steps) and window.__demoLog (the harness's own moments).
// Build: bunx vite build --config playtest/demo/harness/vite.config.ts; serve: bun playtest/demo/harness/serve.ts --port 49xx
import "../../../src/engine/fast"; // first: ?fast=N
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import "../../../src/styles.css";
import "../../../src/styles/early.css";
import { Stage, FxLayer, HelpButton, SenseiDock, img, sleep, tapProps } from "../../../src/ui/ui";
import { NavLayer, holdReady, readyTap } from "../../../src/ui/nav";
import { NinjaSpot, ninja } from "../../../src/ui/Ninja";
import { SenseiDemoLayer, senseiDemo, cancelDemo, demoRunning, demoTap, demoPause, demoTalk, type SenseiDemoOpts } from "../../../src/ui/SenseiDemo";
import { FAST } from "../../../src/engine/fast";
import { say, unlockAudio, sfx, nextClip, type Say } from "../../../src/engine/audio";
import { store } from "../../../src/engine/store";
import { streak } from "../../../src/engine/streak";
import { PIC_PLATES, PLATE_COLOURS } from "../../../src/content/pic-plates.gen";

declare global {
  const __APP_VERSION__: string;
}
// captions on, so a silent video still shows what Sensei says
store.set((s) => void (s.settings.captions = true));

const log: unknown[] = ((window as any).__demoLog = []);
const note = (e: Record<string, unknown>) => log.push({ t: Math.round(performance.now()), ...e });
const L = (line: string): Say => ({ line });

type CardState = "" | "spot" | "right" | "wrong" | "dim";
const WORDS = ["sun", "sausage", "sock"] as const;
type W = (typeof WORDS)[number];
/** A row of three 210 px plates (20 px gutters) in the play area, as the warm-ups lay them out (Warmup.tsx row()). */
const SIZE = 210, GUT = 20, EL = SIZE + 2 * GUT, CX = (1280 - 160 + 340) / 2, CY = 300;
const XS = WORDS.map((_, i) => CX - (WORDS.length * EL) / 2 + EL / 2 + i * EL);

/** The picture card (Early.tsx PicCard's markup and CSS: a painted plate, a halo, the picture, the tick). */
function Card({ w, state, onTap, i }: { w: W; state: CardState; onTap: (el: HTMLElement) => void; i: number }) {
  const p = PIC_PLATES[w] ?? { plate: "sky" as const, grounded: true };
  const style = { position: "absolute", left: XS[i] - EL / 2, top: CY - EL / 2, width: EL, height: EL, padding: GUT, "--plate": PLATE_COLOURS[p.plate], "--ps": `${SIZE}px`, animation: `popin 0.45s cubic-bezier(0.3, 1.6, 0.6, 1) ${i * 0.12}s both` } as CSSProperties;
  return (
    <button aria-label={w} data-pic={w} className={`pcard ${state}`} style={style} {...tapProps<HTMLButtonElement>((el) => onTap(el))}>
      <span className="pcard-plate">
        <span className="pcard-halo" aria-hidden="true" />
        {p.grounded && <span className="pcard-shadow" aria-hidden="true" />}
        <img src={img(`pic_${w}`)} alt="" draggable={false} />
        <span className="pcard-sweep" aria-hidden="true" />
        {state === "right" && <span className="pcard-tick" aria-hidden="true" />}
      </span>
    </button>
  );
}

function Harness() {
  const [started, setStarted] = useState(false);
  const [shown, setShown] = useState(false);
  const [states, setStates] = useState<Record<W, CardState>>({ sun: "", sausage: "", sock: "" });
  /** a card the child tapped before the turn: its ring, without dimming the others (the paw may be on its way) */
  const [tapped, setTapped] = useState<W | null>(null);
  const turn = useRef<((w: W, el: HTMLElement) => void) | null>(null);
  const boardTap = useRef<W | null>(null);
  const cardEl = (w: W) => document.querySelector(`.demo-row [data-pic="${w}"]`);
  const setState = (w: W, s: CardState) => setStates((o) => ({ ...o, [w]: s }));
  const publish = (st: Record<string, unknown>) => ((window as any).__snState = { scene: "demo-harness", ...st });
  /** the tap, answered at once: a little bounce (transform only) */
  const bounce = (el: HTMLElement) => {
    const a = el.animate([{ transform: "scale(1)" }, { transform: "scale(0.93)", offset: 0.35 }, { transform: "scale(1.04)", offset: 0.7 }, { transform: "scale(1)" }], { duration: 340, easing: "ease-out" });
    a.playbackRate = FAST;
  };
  const ringT = useRef(0);
  /** the tapped card's ring: for `ms`, or until `unring(w)` (null) */
  const ring = (w: W, ms: number | null) => {
    window.clearTimeout(ringT.current);
    setTapped(w);
    if (ms != null) ringT.current = window.setTimeout(() => setTapped((t) => (t === w ? null : t)), ms / FAST);
  };
  const unring = (w: W) => setTapped((t) => (t === w ? null : t));

  /** Spotlight `w` (the warm-white "being named" ring) on word `word` of line `id`, for 1.4 s. */
  const spotOnWord = (id: string, word: string, w: W) =>
    void Promise.all([nextClip(id, 8000), fetch(`/a/l/${id}.words.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null)]).then(async ([c, j]) => {
      const at = (j?.words as { w: string; at: number }[] | undefined)?.find((x) => x.w.toLowerCase() === word)?.at;
      if (!c || at == null) return;
      await sleep(Math.max(0, c.start + at * 1000 - performance.now()));
      setState(w, "spot");
      await sleep(1400);
      setStates((o) => ({ ...o, [w]: o[w] === "spot" ? "" : o[w] }));
    });

  /** Sensei's demo: tap the sausage. The same options replay it (Show me again), at the same pace. */
  const demo = (o: Partial<SenseiDemoOpts> = {}) =>
    senseiDemo({
      id: "tap:sausage",
      rule: [L("tv_demo_rule_find_sausage")],
      announce: [L("tv_demo_now_tap_sausage")],
      target: () => cardEl("sausage"),
      // (no success chime: that is the child's reward sound, and it masked the word; the paw's tap is the press's sound)
      press: () => {
        note({ step: "effect: the sausage goes green" });
        setStates({ sun: "", sausage: "right", sock: "" });
      },
      sound: { word: "sausage" },
      // after the calm beat: the result is cleared for the turn (so a tapped card's waiting word isn't said over a
      // greyed-out board)
      clear: () => setStates({ sun: "", sausage: "", sock: "" }),
      // the ninja watches: its attentive pose (the listen sprite: a hand to its ear, eyes up, smiling), turned to
      // Sensei's corner, then to the target; back to rest after
      onWatch: (t, phase) => {
        note({ step: `ninja watches (${phase})` });
        if (phase === "done") ninja.pose(null);
        else ninja.pose("listen", { face: t ?? "next" });
      },
      ...o,
    });

  async function play() {
    streak.reset();
    publish({ busy: true });
    await sleep(500);
    setShown(true);
    note({ step: "cards" });
    // the cards are live from here (onTap): a tap waits for Sensei's next pause for its word, and never cuts her off
    await demoTalk(async () => {
      await sleep(900);
      // the two cards the demo doesn't use are named, each spotlit on its own clip (mechanics §5.4: the rule names the
      // sausage, spotlit on its word)
      for (const w of ["sun", "sock"] as const) {
        setState(w, "spot");
        await say([L(`fm_name_${w}`)]);
        setState(w, "");
        await sleep(200);
        await demoPause();
      }
      await sleep(350);
      // (a)–(f): the rule, "Let me show you.", the announcement, the paw, "Look!", the press, the effect, the beat
      spotOnWord("tv_demo_rule_find_sausage", "sausage", "sausage");
      note({ step: "demo" });
      await demo();
      note({ step: "demo done" });
      await demoPause();
    });
    // the Ready hold (mechanics §3.1: the board stays up and live, the demo's result is cleared): ▶ is "I'm ready", the
    // paw replays the demo (it says "Of course. Watch my paw again." itself), a card answers it ("board")
    setStates({ sun: "", sausage: "", sock: "" });
    publish({ busy: true, ready: true });
    boardTap.current = null;
    const how = await holdReady("demo-sausage", {
      ask: [L("tv_ready_first")],
      again: () => say([L("tv_demo_rule_find_sausage")]),
      showSay: null,
      show: async (live) => {
        setStates({ sun: "", sausage: "", sock: "" });
        await sleep(300);
        note({ step: "replay" });
        await demo({ replay: true, alive: live });
        note({ step: "replay done" });
      },
    });
    note({ step: "ready", how });
    setStates({ sun: "", sausage: "", sock: "" });
    // a card that answered the Ready says its word first (Warmup's echoBoard)
    const b = boardTap.current as W | null;
    if (how === "board" && b) {
      setState(b, "spot");
      await say([{ word: b }]);
      setState(b, "");
    }
    await sleep(400);
    // the hand-over, and the child's turn: only now does the ninja strike
    await say([L("tv_your_word_sock")]);
    publish({ next: "sock", busy: false });
    const tapped = await new Promise<{ w: W; el: HTMLElement }>((resolve) => (turn.current = (w, el) => resolve({ w, el })));
    turn.current = null;
    publish({ busy: true });
    note({ step: "child taps", w: tapped.w });
    setStates({ sun: "", sausage: "", sock: "right" });
    sfx.good();
    void ninja.strike(tapped.el, { soft: true });
    streak.hit();
    await sleep(250);
    await say([{ word: "sock" }]);
    await sleep(1500);
    note({ step: "end" });
    (window as any).__demoDone = true;
  }

  const onTap = (w: W, el: HTMLElement) => {
    // the Ready hold: the card answers it (a replay of the demo stops at once), and says its word before the hand-over
    if (readyTap({ label: w })) {
      if (demoRunning()) cancelDemo();
      boardTap.current = w;
      note({ step: `board tap: ${w}` });
      return;
    }
    if (turn.current && w === "sock") return turn.current(w, el);
    if (turn.current) {
      setState(w, "wrong");
      void say([{ word: w }, { gap: 250 }, L("tv_find_again_sock")]).then(() => setState(w, ""));
      return;
    }
    // before the turn (the names, the demo): answered at once, its word at Sensei's next pause; the demo carries on
    sfx.tap();
    bounce(el);
    ring(w, 700);
    const when = demoTap([{ word: w }], { onSay: () => ring(w, null), onDone: () => unring(w) });
    note({ step: `early tap: ${w} (${when})` });
  };

  useEffect(() => {
    if (started) void play();
  }, [started]);

  return (
    <div className="scene early">
      <img className="bg-img" src={img("bg_bamboo")} alt="" />
      <div className="vignette" />
      <NinjaSpot />
      {shown && (
        <div className={`demo-row pick-row ${Object.values(states).includes("spot") ? "has-spot" : ""}`} style={{ position: "absolute", inset: 0 }}>
          {WORDS.map((w, i) => (
            <Card key={w} w={w} i={i} state={states[w] || (tapped === w ? "spot" : "")} onTap={(el) => onTap(w, el)} />
          ))}
        </div>
      )}
      {!started && (
        <button
          data-start
          aria-label="Start"
          onPointerDown={() => void unlockAudio().then(() => setStarted(true))}
          style={{ position: "absolute", left: 540, top: 250, width: 200, height: 200, borderRadius: 40, border: "6px solid var(--ink)", background: "#fff4dc", fontSize: 64, boxShadow: "0 8px 0 var(--ink)" }}
        >
          ▶
        </button>
      )}
      <SenseiDock />
    </div>
  );
}

function Shell() {
  return (
    <Stage worldColour="#6cc04a">
      <Harness />
      <SenseiDemoLayer />
      <HelpButton />
      <NavLayer home={() => location.reload()} scene="demo-harness" />
      <FxLayer />
    </Stage>
  );
}
createRoot(document.getElementById("root")!).render(<Shell />);
