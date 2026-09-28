// The title (docs/TITLE_DESIGN.md): the painted torii framing the World Flower, Play as the flower's heart under the
// gate's PLAY board, the cast either side, Baron in his storm, and a quiet grown-ups' corner (who's playing, settings).
// Reference implementation for src/scenes/Title.tsx. Styles: docs/title-design/final/impl/title.css → src/styles/shell.css.
// Mock-up it was built from: docs/title-design/final/index.html. Stage px throughout (the 1280x720 stage).
//
// Contract kept for the bots and the treadmill: `.scene.title`; `button[aria-label="Start"]` starts on pointerdown;
// `window.__snState = { scene: "title", … }`; `?scene=title`. Nothing moves on by itself. The title is home: no Home.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type RefObject } from "react";
import { img, heroImg, useHelp, fx, TapHint } from "../ui/ui";
import { say, sfx, playMusic, unlockAudio, audioCtx, preload, urls, isSpeaking } from "../engine/audio";
import { store, useSave, profilesApi, type Profile } from "../engine/store";

/** The players' colours (as Profiles.tsx's NAME_COLOURS; export them from one place). */
const NAME_COLOURS = ["#ffc53d", "#8fd16a", "#6cc6f0", "#ff9ec0", "#b99cff", "#ffa46b"];
export const nameColour = (name: string) => NAME_COLOURS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % NAME_COLOURS.length];

/** The key art's box in stage px (public/a/i/title_key*.webp) and the flower's heart, where Play sits. */
const ART = { x0: -300.5, x1: 1579.8, y0: -46, y1: 841 };
const HEART = { x: 640, y: 482 };
/** A scene tap starts the game only if it is a short tap (a thumb gripping the phone's edge never starts it). */
const SHORT_TAP_MS = 450, SHORT_TAP_PX = 12;
/** Leave for the next screen this long after the tap: the heart flares, the heroes leap in, the light fills the screen. */
const EXIT_MS = 1050;

type From = "play" | "scene";

export function Title({ onStart, onNewPlayer, onGrownups }: {
  /** Play: straight on as the current player (App: afterLaunch()), or the name screen / Who's playing? without one */
  onStart: () => void;
  /** the shelf's "New ninja": the name screen */
  onNewPlayer: () => void;
  /** the gear, held 2 s: the grown-ups page, returning to the title */
  onGrownups: () => void;
}) {
  const cur = useSave(() => profilesApi.current()); // re-renders when the player changes
  const players = profilesApi.list();
  const root = useRef<HTMLDivElement>(null);
  const keyRef = useRef<HTMLImageElement>(null);
  const bobRef = useRef<HTMLSpanElement>(null);
  const boardRef = useRef<HTMLSpanElement>(null);
  const going = useRef(false);
  const down = useRef<{ x: number; y: number; t: number; id: number } | null>(null);
  const [inn, setIn] = useState(false); // the arrival plays once the painting has decoded (at most 1.2 s)
  const [left, setLeft] = useState(false); // .going
  const [pressing, setPressing] = useState(false);
  const [shelf, setShelf] = useState<string[] | null>(null); // the shelf's order while it is open
  const [hop, setHop] = useState<string | null>(null);
  const [paw, setPaw] = useState(false);
  const [sleep, setSleep] = useState(false);
  const [wake, setWake] = useState(0);
  const cover = useBleed(root);

  (window as any).__snState = { scene: "title", player: cur?.name ?? null, players: players.length, shelf: !!shelf };

  // ---------- arrival, sound and the music
  useEffect(() => {
    const im = keyRef.current;
    let done = false;
    const go = () => void (done || ((done = true), setIn(true)));
    im?.decode().then(go, go);
    const t = setTimeout(go, 1200);
    preload([urls.line("tap_start"), urls.line("help_start")]);
    // the title music streams through <audio> (never decoded: PERF.md fix 5). If sound is already on (Home from the map,
    // or after Get ready), it plays now and replaces the land's music; otherwise the first tap starts it
    if (audioCtx().state === "running") playMusic("title");
    // warm the HTTP cache for the music once the painting is up (never while it loads); the body is thrown away
    const warm = setTimeout(() => void fetch(urls.music("title"), { priority: "low" } as RequestInit).then((r) => r.body?.pipeTo(new WritableStream())).catch(() => {}), 2500);
    return () => (clearTimeout(t), clearTimeout(warm));
  }, []);

  const nudge = () => {
    for (const [el, cls] of [[bobRef.current, "nudge"], [boardRef.current, "clack"]] as const) {
      if (!el) continue;
      el.classList.remove(cls);
      void el.offsetWidth; // restart the one-shot
      el.classList.add(cls);
    }
  };
  const wakeUp = () => {
    setPaw(false);
    setSleep(false);
    setWake((w) => w + 1);
  };

  // ---------- idle: the heart beats hard at 8 s and every 14 s after; Sensei says "Tap to start!" (twice at most, only
  // once sound is on); the paw at 16 s; the scenery sleeps at 30 s. Timers only, never rAF. Any tap starts it again.
  useEffect(() => {
    if (left) return;
    const ts: number[] = [];
    let n = 0;
    const tick = () => {
      nudge();
      if (n++ < 2 && audioCtx().state === "running" && !isSpeaking()) void say({ line: "tap_start" });
      ts.push(window.setTimeout(tick, 14000));
    };
    ts.push(window.setTimeout(tick, 8000));
    ts.push(window.setTimeout(() => setPaw(true), 16000));
    ts.push(window.setTimeout(() => setSleep(true), 30000));
    return () => ts.forEach(clearTimeout);
  }, [wake, left]);

  // ---------- Help (Sensei's coin, bottom-right): the title's line, then the heart beats and the paw points at it
  useHelp(() => {
    void unlockAudio();
    if (shelf) return void say({ line: "help_players" });
    void say({ line: "help_start" });
    setTimeout(nudge, 900);
    setPaw(true);
    setTimeout(() => setPaw(false), 3200);
  }, [!!shelf]);

  // ---------- Start: one tap, once
  const start = (from: From) => {
    if (going.current || shelf) return;
    going.current = true;
    setLeft(true);
    (window as any).__titleStart = from;
    void unlockAudio();
    sfx.gong();
    setTimeout(() => sfx.whoosh(), 80);
    setTimeout(() => sfx.petal(), 260);
    fx.burst(HEART.x, HEART.y + 4, "blossoms", 36, 1.6); // round blossoms, never teardrops (Dec6)
    fx.twinkle(HEART.x, HEART.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 14, 9);
    playMusic("title");
    store.set((s) => void (s.sessions += 1));
    setTimeout(onStart, EXIT_MS);
  };

  // the scene: the first touch unlocks sound and starts the title music; a short tap anywhere that isn't a control starts
  const onDownCapture = () => {
    wakeUp();
    if (audioCtx().state !== "running") void unlockAudio().then(() => playMusic("title"));
  };
  const onDown = (e: RPointerEvent) => void (down.current = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId });
  const onUp = (e: RPointerEvent) => {
    const d = down.current;
    down.current = null;
    setPressing(false);
    if (!d || d.id !== e.pointerId) return;
    if (performance.now() - d.t <= SHORT_TAP_MS && Math.hypot(e.clientX - d.x, e.clientY - d.y) <= SHORT_TAP_PX) start("scene");
  };
  const stop = (e: RPointerEvent) => e.stopPropagation(); // controls keep their taps from the scene

  const own = cur?.hero ?? null;
  return (
    <div
      ref={root}
      className={`scene title ${inn ? "in" : ""} ${left ? "going" : ""} ${sleep ? "sleep" : ""}`}
      onPointerDownCapture={onDownCapture}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={() => (down.current = null)}
    >
      <img
        ref={keyRef}
        className="t-key"
        src={img("title_key")}
        srcSet={`${img("title_key_1600")} 2x, ${img("title_key")} 3x`}
        alt=""
        draggable={false}
        style={cover > 1.001 ? { transform: `scale(${cover.toFixed(4)})` } : undefined}
      />
      <div className="t-abs t-glow" />
      <div className="t-abs t-motes" aria-hidden="true">
        {MOTES.map((m, i) => <i key={i} className="t-mote" style={m} />)}
      </div>
      {SPARKS.map((s, i) => <i key={i} className="t-spark" style={s} />)}
      <div className="t-abs t-storm" aria-hidden="true">
        <div className="t-storm-bob">
          <img src={img("title_baron")} alt="" draggable={false} />
          <div className="t-storm-flash" />
        </div>
      </div>
      <div className="t-abs t-logo">
        <div className="logo">
          <span className="l1">Super</span>
          <span className="l2">Ninja</span>
        </div>
      </div>

      <Cast own={own} name={cur?.name ?? null} id={cur?.id ?? null} />

      <button
        className={`t-play ${pressing ? "pressing" : ""}`}
        aria-label="Start"
        onPointerDown={(e) => {
          if (e.button > 0) return;
          e.stopPropagation();
          e.preventDefault();
          setPressing(true);
          start("play");
        }}
        onClick={(e) => e.detail === 0 && start("play")} // the keyboard (Enter, Space)
      >
        <span className="t-board" ref={boardRef}>
          <span>Play</span>
        </span>
        <span className="t-bob" ref={bobRef}>
          <span className="t-heart">
            <span className="t-halo" />
            <span className="t-ripple" />
            <span className="t-ripple r2" />
            <span className="t-knob">
              <span className="t-rim" />
              <span className="t-disc">
                <span className="t-glint" />
              </span>
              <svg className="t-tri" viewBox="0 0 100 100" aria-hidden="true">
                <path d="M26 14 L86 50 L26 86 Z" fill="#fffbea" stroke="#2b1d14" strokeWidth="9" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="t-catch" />
            <span className="t-ringout" />
            <span className="t-flash" />
          </span>
        </span>
        <TapHint show={paw} style={{ left: 236, top: 280 }} />
      </button>
      <div className="t-abs t-comet" aria-hidden="true">
        <i className="t-cglow" />
        <i className="t-cstar" />
      </div>

      {players.length > 0 && (
        <div className="t-gu" onPointerDown={stop}>
          <button className="t-chip" aria-label={`Who's playing? ${cur?.name ?? ""}`} onPointerDown={() => setShelf(players.map((p) => p.id))}>
            <span className="t-stack">
              {faceOrder(players, cur).slice(0, 3).map((p, i) => <Face key={p.id} p={p} style={{ zIndex: 3 - i }} />)}
            </span>
            {players.length > 3 && <span className="t-more">+{players.length - 3}</span>}
            <svg className="t-swap" viewBox="0 0 40 40" aria-hidden="true">
              <path d="M8 14h20l-5-5M32 26H12l5 5" fill="none" stroke="#5a4636" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {cur && <TitleGear onHold={onGrownups} />}
        </div>
      )}

      {shelf && (
        <div
          className="t-shelf"
          onPointerDown={(e) => {
            e.stopPropagation();
            const card = (e.target as HTMLElement).closest<HTMLElement>(".t-card");
            if (!card) return setShelf(null); // a stray tap only closes the shelf
            const id = card.dataset.id!;
            if (id === "+") return onNewPlayer();
            setHop(id);
            setTimeout(() => {
              setHop(null);
              setShelf(null);
              if (id !== cur?.id) profilesApi.select(id); // select as the shelf closes, never under the finger
              nudge(); // own face or a sibling: Play beats; the shelf never starts the game
            }, 480);
          }}
        >
          <div className="t-panel">
            <h3>Who's playing?</h3>
            <div className="t-row">
              {shelf.map((id) => profilesApi.list().find((p) => p.id === id)).filter((p): p is Profile => !!p).map((p) => (
                <button key={p.id} className={`t-card ${p.id === cur?.id ? "cur" : ""} ${hop === p.id ? "hopping" : ""}`} data-id={p.id} aria-label={`player ${p.name}`}>
                  <Face p={p} />
                  <span className="t-nm">{p.name}</span>
                </button>
              ))}
              <button className="t-card add" data-id="+" aria-label="New player">
                <span className="t-face">+</span>
                <span className="t-nm">New ninja</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="t-abs t-shock" />
      <div className="t-abs t-iris" />
    </div>
  );
}

/** The heroes: the child's own ninja in front on the left, named; the other across the gate, facing it. On first launch
 *  (or a child with no ninja yet) Kai cheers on the left and Suki leaps on the right. Keyed by the player, so a switch
 *  from the shelf lands the new ninja with a bump. */
function Cast({ own, name, id }: { own: "kai" | "suki" | null; name: string | null; id: string | null }) {
  if (!own)
    return (
      <>
        <Hero who="kai" pose="cheer" x={176} w={256} gx={330} delay={0.3} />
        <Hero who="suki" pose="jump" x={852} w={240} gx={-300} spin="8deg" cls="flip leap second" delay={0.42} />
      </>
    );
  const other = own === "kai" ? "suki" : "kai";
  return (
    <>
      <Hero key={id ?? "me"} who={own} pose="ready" x={112} w={322} gx={350} cls="me" sign={name ?? undefined} delay={0.3} />
      <Hero who={other} pose="cheer" x={858} w={232} gx={-300} spin="8deg" cls="flip second" delay={0.42} />
    </>
  );
}
/** One hero on the meadow: `gx` is how far it leaps sideways into the heart on Start; `delay` staggers its landing. */
function Hero({ who, pose, x, w, gx, spin, cls = "", sign, delay }: { who: string; pose: string; x: number; w: number; gx: number; spin?: string; cls?: string; sign?: string; delay: number }) {
  return (
    <div className={`t-hero ${cls}`} style={{ left: x, width: w, "--gx": `${gx}px`, "--spin": spin ?? "-8deg", "--in": `${delay}s` } as CSSProperties}>
      <div className="t-land">
        <div className="t-shadow" />
        <div className="t-hbob">
          <img src={heroImg(who, pose)} alt="" draggable={false} />
        </div>
        {sign && <div className="t-sign">{sign}</div>}
      </div>
    </div>
  );
}

/** A player's face: their ninja's head (192 px crops), or a big initial, in their own colour ring. */
function Face({ p, style }: { p: Profile; style?: CSSProperties }) {
  const pc = nameColour(p.name);
  return p.hero ? (
    <span className="t-face" style={{ "--pc": pc, backgroundImage: `url(${img(`face_${p.hero}`)})`, ...style } as CSSProperties} />
  ) : (
    <span className="t-face" style={{ "--pc": pc, ...style } as CSSProperties}>
      {[...p.name][0]}
    </span>
  );
}
const faceOrder = (list: Profile[], cur: Profile | null) => (cur ? [cur, ...list.filter((p) => p.id !== cur.id)] : list);

/** The grown-ups' gear: press and hold 2 s (a CSS transition fills the ring: no rAF). A short press shows the hint. */
function TitleGear({ onHold }: { onHold: () => void }) {
  const [holding, setHolding] = useState(false);
  const [hint, setHint] = useState(false);
  const t = useRef(0);
  const at = useRef(0);
  const end = () => {
    clearTimeout(t.current);
    setHolding(false);
    if (at.current && performance.now() - at.current < 1900) {
      setHint(true);
      setTimeout(() => setHint(false), 2600);
    }
    at.current = 0;
  };
  return (
    <>
      <button
        className={`t-gear ${holding ? "holding" : ""}`}
        aria-label="Grown-ups (hold)"
        onPointerDown={() => {
          at.current = performance.now();
          setHolding(true);
          void say({ line: "grownups" });
          t.current = window.setTimeout(() => {
            at.current = 0;
            setHolding(false);
            onHold();
          }, 2000);
        }}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
      >
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#5a4636" stroke="#2b1d14" strokeWidth="2.5" strokeLinejoin="round" d="M20.6 4h6.8l1.1 5.2a15 15 0 0 1 3.9 2.3l5-1.7 3.4 5.9-4 3.5a15 15 0 0 1 0 4.5l4 3.5-3.4 5.9-5-1.7a15 15 0 0 1-3.9 2.3L27.4 44h-6.8l-1.1-5.2a15 15 0 0 1-3.9-2.3l-5 1.7-3.4-5.9 4-3.5a15 15 0 0 1 0-4.5l-4-3.5 3.4-5.9 5 1.7a15 15 0 0 1 3.9-2.3z" />
          <circle cx="24" cy="24" r="6.5" fill="#fffdf3" stroke="#2b1d14" strokeWidth="2.5" />
        </svg>
        <svg className="t-prog" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" />
        </svg>
      </button>
      <span className={`t-hint ${hint ? "on" : ""}`}>Grown-ups: press and hold</span>
    </>
  );
}

/** While the title is mounted the stage lets the art bleed to the screen's edges (.stage.bleed). Returns the art's cover
 *  scale: 1 on every phone; above 1 only where the screen, in stage px, is taller or wider than the art (tablets, desktop
 *  windows), scaled about the flower's heart so Play stays on it. */
function useBleed(root: RefObject<HTMLDivElement | null>) {
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    const st = root.current?.closest<HTMLElement>(".stage");
    if (!st) return;
    st.classList.add("bleed");
    const fit = () => {
      const r = st.getBoundingClientRect();
      const s = r.width / 1280;
      if (!s) return;
      const wx0 = -r.left / s, wy0 = -r.top / s, wx1 = (innerWidth - r.left) / s, wy1 = (innerHeight - r.top) / s;
      setK(Math.max(1, (HEART.x - wx0) / (HEART.x - ART.x0), (wx1 - HEART.x) / (ART.x1 - HEART.x), (HEART.y - wy0) / (HEART.y - ART.y0), (wy1 - HEART.y) / (ART.y1 - HEART.y)));
    };
    // (after Stage's own fit: React runs the parent's layout effect after this one, and Stage's resize listener first)
    const later = () => queueMicrotask(fit);
    later();
    addEventListener("resize", later);
    addEventListener("orientationchange", later);
    return () => {
      st.classList.remove("bleed");
      removeEventListener("resize", later);
      removeEventListener("orientationchange", later);
    };
  }, [root]);
  return k;
}

const MOTES: CSSProperties[] = [
  { left: 24, animationDelay: "-0.3s" },
  { left: 78, animationDelay: "-2.4s", width: 12, height: 12 },
  { left: 136, animationDelay: "-3.6s" },
  { left: 190, animationDelay: "-1.3s", width: 12, height: 12 },
  { left: 238, animationDelay: "-3s" },
  { left: 270, animationDelay: "-0.9s", width: 10, height: 10 },
];
const SPARKS: CSSProperties[] = [
  { left: 372, top: 318, animationDelay: "-0.4s" },
  { left: 912, top: 300, animationDelay: "-1.5s" },
  { left: 350, top: 600, animationDelay: "-2.4s", width: 26, height: 26 },
  { left: 930, top: 620, animationDelay: "-0.9s", width: 26, height: 26 },
];
