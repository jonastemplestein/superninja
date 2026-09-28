// Hidden dev scene: /play/?scene=nav-demo. The shared navigation pieces (src/ui/nav.tsx, docs/NAVIGATION.md) on one
// screen: a three-step show on usePresentation (Back, Hear it again, Next: nothing moves on by itself, and the idle nudge
// at 8 s and 16 s), then a turn that asks with told() and shows the sound picture, then a holdNext.
// - ?badges=1: the petals (src/ui/SoundBadge.tsx, docs/SOUND_DISPLAY.md §4) for the frame checks: one of each tier, a
//   pair of each mode, /ks/, the mist, the dots and rows, and buttons that pop a petal above a tile. `&demo=intro`: one
//   hero meeting its sound (`&p=b`); `&demo=pop`: a two-letter reminder popping /sh/ above its tile; `&demo=contrast`:
//   "That's /s/… We need /sh/" over two tiles; `&demo=pair`: two sounds over one tile; `&demo=learn`: the Dojo lesson's
//   misty row, each petal floating down and blooming, with its two mini petals. Each plays 1.2 s after the page is
//   tapped, and again on the button (`learn`: once). `?badges=wall`: every sound's petal with its chart word (the art review).
// - ?ready=1: a Ready hold (holdReady) after a narrated demo, with ▶, the paw, the ninja's stance and the spotlights
//   (TV-F3.4); `&first=1` asks the save's first Ready (no paw); `&col=1` puts ▶, the speaker and the paw in the right-hand
//   column (a screen whose own targets fill the nav row). After ▶ comes a turn, then it starts again.
// - ?fs=1: the tortoise and the rabbit (FS-F3.1, TEACHER_SCRIPT §9.6) on a read-back of "cat": Move 1 (the tiles' sounds
//   with the tortoise stepping, `tv_fs_rabbit_read` and rabbitTap(), the word with the rabbit's hop), then Move 5 (the
//   gapped slow word, the tortoise stepping on each sound's onset, then the word). `&at=row` (default: the nav row's
//   speaker with the paw and the petal beside it), `column` (Back, the speaker and a dim ▶ in the right-hand column),
//   `own` (a scene's own speaker beside a word card at the top, as in a battle) or `top` (the top-right corner). Plays
//   on the first tap, and again on the ↻ button; `&auto=1` answers the rabbit by itself after 2 s.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon, RoundButton, Tile, sleep, stageRect, firstTap } from "../ui/ui";
import { say, sfx, nextClip, type Say } from "../engine/audio";
import { NinjaSpot, ninja } from "../ui/Ninja";
import { usePresentation, useHome, useNav, told, clearTold, holdNext, holdReady, readyTap, navLog, dropHolds, navSpeed, rabbitTap, ReplayButton, PawIcon, NAV_SLOTS, slotStyle, type Step } from "../ui/nav";
import { SoundBadge, SoundPair, SoundDots, SoundRow, popSound, soundWidth, TIER_WIDTH, type SoundTier } from "../ui/SoundBadge";
import { PicCard } from "./Early";
import { CHART_PETALS } from "../content/flower";
import { SLOW_TIMES } from "../content/stretch";
import { WORD_BY_TEXT } from "../content/phonics";
import { wordAt as lineWordAt } from "../content/word-times";
import type { PhonemeId } from "../content/phonics";

export function NavDemo({ onHome }: { onHome: () => void }) {
  const q = new URLSearchParams(location.search);
  const badges = q.get("badges");
  useHome(onHome);
  // ?sound=ks (&paw=1): straight to the turn, with that sound picture (and the paw) in the nav row: the < x > pair's
  // row layout (nav.tsx PAIR_SLOTS) for the frame checks
  const turnSound = q.get("sound") as PhonemeId | null;
  const [phase, setPhase] = useState<"show" | "turn">(turnSound ? "turn" : "show");
  const [round, setRound] = useState(0);
  const again = () => {
    dropHolds();
    setRound((r) => r + 1);
    setPhase("show");
  };
  return (
    <div className="scene" style={{ background: "linear-gradient(180deg,#fff4dc,#f6e3bb)" }}>
      {badges === "wall" ? (
        <BadgeWall />
      ) : badges ? (
        <Badges demo={q.get("demo")} p={(q.get("p") as PhonemeId | null) ?? "b"} />
      ) : q.has("fs") ? (
        <>
          <NinjaSpot />
          <FastSlowDemo key={round} at={q.get("at") ?? "row"} auto={q.has("auto")} onAgain={() => setRound((r) => r + 1)} />
        </>
      ) : q.has("ready") ? (
        <>
          <NinjaSpot />
          <ReadyDemo key={round} first={q.has("first")} column={q.has("col")} onAgain={() => setRound((r) => r + 1)} />
        </>
      ) : (
        <>
          <NinjaSpot />
          {phase === "show" ? <Show key={`s${round}`} onDone={() => setPhase("turn")} /> : <Turn key={`t${round}`} onAgain={again} sound={turnSound ?? "s"} paw={q.has("paw")} />}
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
    { key: "petal", enter: () => setPic("petal"), sound: "s", run: () => say([{ line: "flower_i2" }, { gap: 150 }, { sound: "s", show: "petal" }]) },
    {
      key: "words",
      enter: () => setPic("words"),
      sound: "s",
      run: async (live) => {
        await sleep(300);
        if (live()) await say([{ line: "fm_rw2_s" }, { gap: 150 }, { sound: "s", show: "petal" }]);
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
      {pic === "petal" && <SoundBadge p="s" tier="hero" style={{ position: "absolute", left: CX - 110, top: 90 }} className="pop-in" />}
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

function Turn({ onAgain, sound = "s", paw }: { onAgain: () => void; sound?: PhonemeId; paw?: boolean }) {
  const [state, setState] = useState<"ask" | "right" | "done">("ask");
  useNav({ again: "told", sound, show: paw ? () => say({ line: "tv_show_again" }) : undefined });
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

// ---------------------------------------------------------------- ?badges=1
const label: CSSProperties = { font: "700 17px/1.1 var(--font-ui)", color: "var(--ink-soft)", marginTop: 8, textAlign: "center", whiteSpace: "nowrap" };
function Cell({ name, children, style }: { name: string; children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", ...style }}>
      {children}
      <span data-grownups style={label}>
        {name}
      </span>
    </div>
  );
}
/** The frame checks' sheet: one petal per tier, the pairs, /ks/, the mist, the dots and rows; and the pop demos. */
function Badges({ demo, p }: { demo: string | null; p: PhonemeId }) {
  (window as any).__snState = { scene: "badges", demo };
  if (demo === "learn") return <LearnDemo />;
  if (demo) return <BadgeDemo demo={demo} p={p} />;
  const tiers: [SoundTier, PhonemeId][] = [
    ["turn", "s"],
    ["header", "ae"],
    ["pop", "d"],
    ["mini", "m"],
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 150, top: 14, display: "flex", alignItems: "flex-end", gap: 34 }}>
        <Cell name="hero 220">
          <SoundBadge p="b" tier="hero" />
        </Cell>
        {tiers.map(([t, s]) => (
          <Cell key={t} name={`${t} ${TIER_WIDTH[t]}`}>
            <SoundBadge p={s} tier={t} passive={t === "pop"} />
          </Cell>
        ))}
        <Cell name="still 34">
          <SoundBadge p="t" size={34} still />
        </Cell>
        <Cell name="mist">
          <SoundBadge p="oy" tier="turn" unknown />
        </Cell>
      </div>
      <div style={{ position: "absolute", left: 150, top: 372, display: "flex", alignItems: "flex-end", gap: 30 }}>
        <Cell name="/ks/ (turn)" style={{ minWidth: soundWidth("ks", undefined, "turn") }}>
          <SoundBadge p="ks" tier="turn" />
        </Cell>
        <Cell name="together">
          <SoundPair a="k" b="s" mode="together" tier="pop" passive />
        </Cell>
        <Cell name="contrast">
          <SoundPair a="i" b="a" mode="contrast" tier="pop" passive dim />
        </Cell>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          <Cell name="dots">
            <SoundDots n={3} lit={1} />
          </Cell>
          <Cell name="mist row">
            <SoundRow ps={["b", "k", "g", "h"]} mist size={56} />
          </Cell>
        </div>
        <Cell name="tally">
          <SoundRow ps={["b", "b"]} lit={1} />
        </Cell>
      </div>
    </>
  );
}

/** One demo, played 1.2 s after the first tap, and again on the button. */
function BadgeDemo({ demo, p }: { demo: string; p: PhonemeId }) {
  const [run, setRun] = useState(0);
  const tiles = useRef<(HTMLElement | null)[]>([]);
  const word = demo === "contrast" ? ["s", "sh"] : demo === "pair" ? ["th", "i", "s"] : ["sh", "i", "p"];
  useEffect(() => {
    let live = true;
    (async () => {
      await firstTap();
      await sleep(1200);
      if (!live) return;
      const t = (i: number) => () => tiles.current[i] ?? null;
      const said: Say[] =
        demo === "intro"
          ? [{ line: "tv_here_it_comes" }, { gap: 300 }, { sound: p, show: "petal" }, { gap: 700 }, { sound: p, show: "petal" }]
          : demo === "pop"
            ? [{ line: "t_two_letters" }, { gap: 150 }, { sound: "sh", show: "petal", at: t(0) }]
            : demo === "contrast"
              ? [{ line: "thats" }, { gap: 100 }, { sound: "s", show: "petal", at: t(0) }, { gap: 300 }, { line: "we_need" }, { gap: 100 }, { sound: "sh", show: "petal", at: t(1) }]
              : [{ sound: "th", show: "petal", at: t(0) }, { gap: 400 }, { sound: "dh", show: "petal", at: t(0) }];
      navLog({ kind: "step", id: `badges:${demo}`, from: null, to: run });
      await say(said);
    })();
    return () => void (live = false);
  }, [run]);
  return (
    <>
      {demo === "intro" ? (
        <SoundBadge key={run} p={p} tier="hero" intro style={{ position: "absolute", left: CX - 110, top: 150 }} />
      ) : (
        <div style={{ position: "absolute", left: CX - word.length * 70, top: 380, display: "flex", gap: 20 }}>
          {word.map((g, i) => (
            <span key={i} ref={(el) => void (tiles.current[i] = el)}>
              <Tile g={g} size="lg" />
            </span>
          ))}
        </div>
      )}
      <RoundButton label="Again" onClick={() => setRun((r) => r + 1)} style={slotStyle(NAV_SLOTS.row.back)}>
        <Icon.again />
      </RoundButton>
      {demo === "pop" && <PopButton at={() => tiles.current[2] ?? null} />}
    </>
  );
}
/** The Dojo lesson's petals (TV-F3.3, TEACHER_SCRIPT §3.26): four misty petals in a row twinkle on "four new sounds";
 *  each floats down to the middle and blooms on its sound; two mini petals under it light on the child's taps. */
const LEARN: PhonemeId[] = ["b", "k", "g", "h"];
function LearnDemo() {
  const slots = useRef<(HTMLElement | null)[]>([]);
  const [k, setK] = useState(-1);
  const [taps, setTaps] = useState(-1); // -1: the mini petals wait until the sound has bloomed
  useEffect(() => {
    let live = true;
    (async () => {
      await firstTap();
      await say({ line: "tv_learn_frame_four" });
      for (let i = 0; i < LEARN.length && live; i++) {
        setTaps(-1);
        setK(i);
        await sleep(900);
        if (!live) return;
        await say([{ line: i ? "tv_learn_next" : "tv_here_it_comes" }, { gap: 250 }, { sound: LEARN[i], show: "petal" }, { gap: 600 }, { sound: LEARN[i], show: "petal" }]);
        setTaps(0);
        for (let t = 1; t <= 2 && live; t++) {
          await sleep(500);
          setTaps(t);
          await say({ sound: LEARN[i], show: "petal" });
        }
        await sleep(600);
      }
    })();
    return () => void (live = false);
  }, []);
  const out = LEARN.map((_, i) => i).filter((i) => i <= k);
  return (
    <>
      <SoundRow ps={LEARN} mist out={out} twinkleOn="tv_learn_frame_four" twinkleAt={lineWordAt("tv_learn_frame_four", "four") ?? 2.6} slotRef={(i, el) => void (slots.current[i] = el)} style={{ position: "absolute", left: CX - 190, top: 26 }} />
      {k >= 0 && (
        <div key={k} style={{ position: "absolute", left: CX - 110, top: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <SoundBadge p={LEARN[k]} tier="hero" intro from={slots.current[k]} />
          <SoundRow ps={[LEARN[k], LEARN[k]]} lit={Math.max(0, taps)} style={{ visibility: taps < 0 ? "hidden" : undefined }} />
        </div>
      )}
    </>
  );
}

/** popSound() directly: /p/ pops above the last tile, then is said. */
function PopButton({ at }: { at: () => Element | null }) {
  return (
    <RoundButton
      label="Pop"
      className="pink"
      style={slotStyle(NAV_SLOTS.row.show)}
      onClick={async () => {
        await popSound("p", at);
        await say({ sound: "p", show: "petal", at });
      }}
    >
      <Icon.paw />
    </RoundButton>
  );
}

/** Every sound's badge, in chart order, with its chart word underneath for grown-ups. */
function BadgeWall() {
  return (
    <div className="scrollable" style={{ position: "absolute", left: 130, right: 150, top: 16, bottom: 16, overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "10px 14px", justifyContent: "center", alignContent: "flex-start" }}>
      {CHART_PETALS.map((c) => (
        <div key={c.p} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 104 }}>
          <SoundBadge p={c.p} tier="turn" still={false} />
          <span data-grownups style={{ font: "700 15px/1.1 var(--font-ui)", color: "var(--ink-soft)", marginTop: 4 }}>
            /{c.p}/ {c.iconWord}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- ?ready=1
const CARDS = ["sun", "sock", "cat"];
/** TV-F3.4: the frame, a narrated demo with the paw, and the Ready hold (▶, the paw, the ninja facing ▶, the
 *  spotlights on "green arrow" and "paw"). Then "Your word is sock." and a turn. */
function ReadyDemo({ first, column, onAgain }: { first: boolean; column: boolean; onAgain: () => void }) {
  const cards = useRef<Record<string, HTMLElement | null>>({});
  const [paw, setPaw] = useState<{ x: number; y: number } | null>(null);
  const [state, setState] = useState<"frame" | "ready" | "turn" | "done">("frame");
  const [lit, setLit] = useState<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  // the paw's demo: it sets off from the nav row's paw slot, and taps the sun on "There"
  const demo = async (live: () => boolean = () => true) => {
    const from = NAV_SLOTS.row.show;
    setPaw({ x: from.x - 55, y: from.y - 55 });
    navLog({ kind: "paw", id: "nav-demo:sun" });
    const said = say({ line: "tv_ears_demo" });
    await sleep(1400);
    if (!live()) return void setPaw(null);
    const r = stageRect(cards.current.sun ?? null);
    setPaw({ x: r.x + r.w / 2 - 40, y: r.y + r.h / 2 - 30 });
    await said;
    if (!live()) return void setPaw(null);
    setLit("sun");
    sfx.good();
    await sleep(700);
    setPaw(null);
    setLit(null);
  };
  useEffect(() => {
    let live = true;
    (async () => {
      await firstTap();
      await say({ line: "tv_ears_frame" });
      if (!live) return;
      await demo(() => live);
      if (!live) return;
      setState("ready");
      const how = await holdReady("nav-demo", {
        ask: [{ line: first ? "tv_ready_first" : "tv_ready_paw" }],
        again: () => say([{ line: "tv_ears_frame" }, { gap: 300 }, { line: "tv_ready_go" }]),
        show: first ? undefined : demo,
        answer: "sock",
        at: column ? "column" : undefined,
      });
      if (!live || how === false) return;
      setState("turn");
      // a card tapped as the answer to Ready says its word first (it is not an answer: the question comes next)
      await say([...(echo.current ? [{ word: echo.current }, { gap: 400 }] : []), { line: "tv_your_word_sock" }]);
    })();
    return () => void (live = false);
  }, []);
  const echo = useRef<string | null>(null);
  const tap = (w: string) => {
    if (readyTap({ label: w, right: w === "sock" })) return void (echo.current = w); // ready: the card says its word, then the turn starts
    if (stateRef.current !== "turn") return;
    if (w !== "sock") return void (sfx.wrong(), say({ word: w }));
    sfx.good();
    setLit("sock");
    setState("done");
    void ninja.strike(cards.current.sock ?? undefined, { soft: true });
    void holdNext("nav-demo:ready-end", () => say({ line: "tv_your_word_sock" })).then((ok) => ok && onAgain());
  };
  (window as any).__snState = { scene: "pick", next: state === "turn" ? "sock" : null, busy: state !== "turn", handover: false };
  return (
    <>
      <div className="pick-row" style={{ position: "absolute", left: 360, top: 120, width: 730, display: "flex", justifyContent: "space-between" }}>
        {CARDS.map((w) => (
          <span key={w} ref={(el) => void (cards.current[w] = el)}>
            <PicCard w={w} size={190} gutter={18} state={lit === w ? "right" : undefined} onTap={() => tap(w)} />
          </span>
        ))}
      </div>
      {paw && (
        <div className="demo-paw" style={{ position: "absolute", left: 0, top: 0, transform: `translate(${paw.x}px, ${paw.y}px)`, transition: "transform 0.9s cubic-bezier(.45,.05,.3,1)", zIndex: 70, pointerEvents: "none" }}>
          {/* Sensei's paw (the Show me again icon): the demo is hers; the cream glove is only the ghost hand */}
          <div style={{ width: 110, height: 116, transform: "rotate(-16deg)" }}>
            <PawIcon bare />
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------- ?fs=1
/** FS-F3.1: the tortoise and the rabbit beside Hear it again, on a read-back of "cat" (Move 1, then Move 5). */
function FastSlowDemo({ at, auto, onAgain }: { at: string; auto: boolean; onAgain: () => void }) {
  const w = "cat";
  const segs = WORD_BY_TEXT[w]?.segs ?? [];
  const [lit, setLit] = useState<number | "all" | null>(null);
  const hear = () => say([{ line: "tv_fs_say_sounds_slow" }, { gap: 250 }, { sounds: segs, gap: 300, onSeg: (i) => setLit(i < 0 ? null : i) }]);
  const own = at === "own";
  useNav({
    again: hear,
    againAt: own ? "own" : at === "column" ? "column" : at === "top" ? "top-right" : undefined,
    show: at === "row" ? () => hear() : undefined,
    sound: at === "row" ? "k" : undefined,
    back: at === "column" ? () => onAgain() : undefined,
    next: at === "column" ? { ready: false, go: () => {} } : undefined,
    speed: {},
  });
  useEffect(() => {
    let live = true;
    (async () => {
      await firstTap();
      await sleep(600);
      if (!live) return;
      navLog({ kind: "step", id: "fs-demo", from: null, to: 0 });
      // Move 1: the tiles' sounds (the tortoise steps on each), the rabbit prompt and the child's tap, the word
      navSpeed("slow");
      await hear();
      if (!live) return;
      navSpeed(null);
      const tap = rabbitTap({ slow: () => say({ sounds: segs, gap: 300, onSeg: (i) => setLit(i < 0 ? null : i) }) });
      if (auto) void sleep(5200).then(() => (document.querySelector('[data-fs="rabbit"][role="button"]') as HTMLElement | null)?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
      void say({ line: "tv_fs_rabbit_read" });
      const how = await tap;
      if (!live) return;
      if (how === "timeout") await say({ line: "tv_fs_now_fast" });
      setLit("all");
      await say({ word: w });
      setLit(null);
      await sleep(1400);
      if (!live) return;
      // Move 5: the gapped slow word (the tortoise steps on each sound's onset, the tiles light with it), then the word
      const c = nextClip(`stretch:${w}`, 6000);
      const said = say([{ line: "tv_fs_say_slow" }, { gap: 150 }, { stretch: w }, { gap: 400 }, { line: "tv_fs_now_fast" }, { gap: 150 }, { word: w }]);
      const clip = await c;
      if (clip && live) (SLOW_TIMES[w] ?? []).forEach((t, i) => void sleep(t * 1000).then(() => live && setLit(i)));
      await said;
      if (live) setLit(null);
      navLog({ kind: "step", id: "fs-demo", from: 0, to: null });
    })();
    return () => void (live = false);
  }, []);
  (window as any).__snState = { scene: "fs-demo", busy: true };
  const card = { x: 560, y: 70, w: 190, h: 190 };
  return (
    <>
      {own && (
        <>
          <div className="card" style={{ position: "absolute", left: card.x, top: card.y, width: card.w, height: card.h }}>
            <img src={`/a/i/pic_${w}.webp`} alt="" />
          </div>
          <ReplayButton size={100} onReplay={hear} style={{ position: "absolute", left: card.x + card.w + 24, top: card.y + 45 }} />
        </>
      )}
      <div style={{ position: "absolute", left: 340, width: 770, top: own ? 300 : 250, display: "flex", justifyContent: "center", gap: 22 }}>
        {segs.map((s, i) => (
          <Tile key={i} g={s.g} size="lg" withButtons lit={lit === "all" || lit === i} className={lit === "all" || lit === i ? "landed" : ""} />
        ))}
      </div>
      <RoundButton label="Again" onClick={onAgain} style={{ position: "absolute", left: 180, top: 16, width: 100, height: 100 }}>
        <Icon.again />
      </RoundButton>
    </>
  );
}
