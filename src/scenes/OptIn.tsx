// The opt-in (docs/FIRST_MINUTES.md §4): a brand-new child tells Sensei whether they go to big school, and which
// class, within about 30 seconds, and hears that their grown-ups can change it later. It happens in the dojo, right
// after "Now, choose your ninja!", with the ninja bottom-left, Sensei's Help bottom-right and the grown-ups' gear
// top-right (press and hold to open).
//   A: "Do you go to big school yet?"  TEDDY (not yet) · SCHOOL (yes, with the child's own ninja at the gate)
//   B: "Which class are you in?"       three class doors (Reception ★, Year One 1, Year Two 2) · "Not sure?" cloud
// Taps count from the moment the cards land, even during the question (they cut Sensei off), and say the card's own
// label. A gold ring fills round the tapped card over 1.5 s: the last tap wins once it is full. Silence: after 8 s
// Sensei asks again (the cards bob); after 20 s the game picks (A: listening games; B: Reception) and says so.
// Confirming: the chosen card shrinks into a badge that flies to the grown-ups' gear, which glows and wiggles while
// Sensei says what she has set up, then "Your grown-ups can change this later, in the grown-ups' settings."
// Mode "newyear" (the first launch on or after 1 September): "It's a new school year! Which class are you in now?"
// then screen B; "Not sure?" keeps last year's class.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { say, sfx, playMusic, hush, preload, urls, type Say } from "../engine/audio";
import type { SchoolYear } from "../engine/store";
import { img, heroImg, fx, sleep, tapProps, useHelp, useHero, SenseiDock, Icon, stageRect } from "../ui/ui";
import { NinjaSpot, ninja } from "../ui/Ninja";
import "../styles/optin.css";

type Choice = "notyet" | "school" | "R" | "Y1" | "Y2" | "unsure";
interface Card { id: Choice; label: string; echo: string; sayLabel: string }
const A: Card[] = [
  { id: "notyet", label: "teddy", echo: "fm_opt_echo_notyet", sayLabel: "fm_opt_notyet" },
  { id: "school", label: "school", echo: "fm_opt_echo_school", sayLabel: "fm_opt_yes" },
];
const B: Card[] = [
  { id: "R", label: "Reception", echo: "fm_opt_rec", sayLabel: "fm_opt_rec" },
  { id: "Y1", label: "Year One", echo: "fm_opt_y1", sayLabel: "fm_opt_y1" },
  { id: "Y2", label: "Year Two", echo: "fm_opt_y2", sayLabel: "fm_opt_y2" },
  { id: "unsure", label: "Not sure", echo: "fm_opt_unsure", sayLabel: "fm_opt_unsure" },
];
const CONFIRM: Record<Exclude<Choice, "school">, string> = { notyet: "fm_opt_ok_notyet", unsure: "fm_opt_ok_unsure", R: "fm_opt_ok_rec", Y1: "fm_opt_ok_y1", Y2: "fm_opt_ok_y2" };
const YEAR: Record<Exclude<Choice, "school">, SchoolYear> = { notyet: "none", unsure: "unsure", R: "R", Y1: "Y1", Y2: "Y2" };
const SETTLE_MS = 1500;
const GEAR = { x: 1206, y: 58 };

export interface OptInResult {
  year: SchoolYear;
  /** the game chose after 20 s of silence */
  silent: boolean;
  /** "newyear": the class changed (a moving-up sticker) or stayed */
  movedUp?: boolean;
}

export function OptIn({ onDone, onGrownups, mode = "new", lastYear }: { onDone: (r: OptInResult) => void; onGrownups: () => void; mode?: "new" | "newyear"; lastYear?: SchoolYear }) {
  const hero = useHero();
  const [screen, setScreen] = useState<"A" | "B">(mode === "newyear" ? "B" : "A");
  const [landed, setLanded] = useState(false);
  const [spot, setSpot] = useState<Choice | null>(null);
  const [settling, setSettling] = useState<{ id: Choice; n: number } | null>(null);
  const [bob, setBob] = useState(false);
  const [chosen, setChosen] = useState<Choice | null>(null);
  const [gear, setGear] = useState(false);
  const [asked, setAsked] = useState(false); // the question and its labels have been said (for bots)
  const live = useRef(true);
  const locked = useRef(false);
  const settleTimer = useRef<number | undefined>(undefined);
  const settleRef = useRef<Choice | null>(null);
  const idle = useRef<number[]>([]);
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const cards = screen === "A" ? A : B;

  const question = (s: "A" | "B", again = false): Say[] =>
    s === "A"
      ? again ? [{ line: "fm_opt_q1_again" }] : [{ line: "fm_opt_q1" }]
      : again ? [{ line: "fm_opt_q2_again" }] : [{ line: mode === "newyear" && !again ? "fm_newyear_q" : "fm_opt_q2" }];

  /** The question, then each card's label while that card is spotlit. A tap stops it (hush). */
  const ask = async (s: "A" | "B") => {
    clearIdle();
    await sleep(400);
    setLanded(true);
    const ok = await say(question(s));
    if (!ok || locked.current || !live.current) return;
    for (const c of s === "A" ? A : B) {
      if (settleRef.current || locked.current || !live.current || screenRef.current !== s) return;
      setSpot(c.id);
      await sleep(150);
      const done = await say({ line: c.sayLabel });
      await sleep(250);
      setSpot(null);
      if (!done) return;
    }
    startIdle(s);
  };
  const clearIdle = () => {
    idle.current.forEach(clearTimeout);
    idle.current = [];
  };
  /** Silence: 8 s → ask again, the cards bob; 20 s → the game picks, and says so. */
  const startIdle = (s: "A" | "B") => {
    clearIdle();
    setAsked(true);
    idle.current.push(
      window.setTimeout(() => {
        if (locked.current || settleRef.current) return;
        setBob(true);
        void say(question(s, true));
      }, 8000),
      window.setTimeout(() => {
        if (locked.current || settleTimer.current) return;
        void confirm(s === "A" ? "notyet" : mode === "newyear" ? "unsure" : "R", true);
      }, 20000),
    );
  };

  useEffect(() => {
    live.current = true;
    playMusic("dojo");
    preload([...A, ...B].flatMap((c) => [urls.line(c.echo), urls.line(c.sayLabel)]).concat(Object.values(CONFIRM).map(urls.line), [urls.line("fm_opt_grownups")]));
    void ask(screen);
    return () => {
      live.current = false;
      clearIdle();
      clearTimeout(settleTimer.current);
      hush();
    };
  }, []);
  useHelp(() => {
    if (locked.current) return;
    void (async () => {
      await say(question(screenRef.current));
      for (const c of screenRef.current === "A" ? A : B) {
        setSpot(c.id);
        await sleep(150);
        const ok = await say({ line: c.sayLabel });
        setSpot(null);
        if (!ok) return;
      }
    })();
  }, [screen]);

  /** A tap: say the card's label, and fill the gold ring round it; the last tap wins once the ring is full. */
  const tap = (c: Card) => {
    if (locked.current || !landed) return;
    clearIdle();
    setBob(false);
    setSpot(null);
    sfx.pop();
    hush();
    void say({ line: c.echo });
    void ninja.pose("ready");
    settleRef.current = c.id;
    setSettling((s) => ({ id: c.id, n: (s?.n ?? 0) + 1 }));
    clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      settleTimer.current = undefined;
      if (c.id === "school") return toClasses();
      void confirm(c.id);
    }, SETTLE_MS);
  };

  const toClasses = async () => {
    setAsked(false);
    settleRef.current = null;
    setSettling(null);
    setLanded(false);
    void ninja.act("jump");
    await sleep(300);
    setScreen("B");
    // doors swing in
    await ask("B");
  };

  const confirm = async (id: Exclude<Choice, "school">, silent = false) => {
    if (locked.current) return;
    locked.current = true;
    clearIdle();
    setSettling(null);
    hush();
    const year = mode === "newyear" && id === "unsure" ? lastYear ?? "unsure" : YEAR[id];
    const movedUp = mode === "newyear" && id !== "unsure" && year !== lastYear;
    setChosen(id);
    // the chosen card shrinks into a badge that flies to the grown-ups' gear
    const el = document.querySelector(`.oi [data-choice="${id}"]`);
    void ninja.act(screenRef.current === "B" && id !== "unsure" ? "flip" : "cheer");
    // the badge flies to the gear as Sensei starts to say what she has set up
    const flown = (el ? flyBadge(el) : Promise.resolve()).then(() => {
      setGear(true);
      sfx.great();
      fx.twinkle(GEAR.x, GEAR.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 14, 6);
    });
    await sleep(350);
    const lines: Say[] =
      mode === "newyear"
        ? movedUp ? [{ line: "fm_newyear_up" }, { gap: 300 }, { line: "fm_opt_grownups" }] : [{ line: "fm_opt_grownups" }]
        : silent
          ? [{ line: id === "notyet" ? "fm_opt_default_home" : "fm_opt_default_rec" }, { gap: 300 }, { line: "fm_opt_grownups" }]
          : [{ line: CONFIRM[id] }, { gap: 300 }, { line: "fm_opt_grownups" }];
    await say(lines);
    await flown;
    await sleep(200);
    setGear(false);
    if (live.current) onDone({ year, silent, movedUp });
  };

  (window as any).__snState = {
    scene: "optin", screen, choices: cards.map((c) => c.label), next: !landed || locked.current ? null : cards[0].label, asked, settling: settling?.id ?? null, chosen,
  };

  return (
    <div className={`scene oi ${screen === "B" ? "oi-b" : "oi-a"}`}>
      <img className="bg-img" src={img("dojo_bg")} alt="" />
      <div className="vignette" />
      <NinjaSpot />
      {/* the grown-ups' gear (press and hold); the chosen badge flies here */}
      <GearHold on={gear} onHold={onGrownups} />
      {screen === "A" && (
        <div className="oi-row">
          {A.map((c, i) => (
            <button
              key={c.id}
              aria-label={c.label}
              data-choice={c.id}
              className={`oi-card ${c.id} ${spot === c.id ? "spot" : ""} ${spot && spot !== c.id ? "aside" : ""} ${bob ? "bob" : ""} ${chosen === c.id ? "chosen" : ""} ${chosen && chosen !== c.id ? "gone" : ""}`}
              style={{ animationDelay: `${i * 0.12}s` } as CSSProperties}
              {...tapProps(() => tap(c))}
            >
              <span className="oi-plate">
                <img src={img(c.id === "notyet" ? "opt_teddy" : "opt_school")} alt="" draggable={false} />
                {c.id === "school" && <img className="oi-gate-ninja" src={heroImg(hero, "idle")} alt="" draggable={false} />}
              </span>
              {settling?.id === c.id && <SettleRing key={settling.n} />}
            </button>
          ))}
        </div>
      )}
      {screen === "B" && (
        <>
          <div className="oi-doors">
            {B.slice(0, 3).map((c, i) => (
              <button
                key={c.id}
                aria-label={c.label}
                data-choice={c.id}
                className={`oi-door d${i} ${spot === c.id ? "spot" : ""} ${spot && spot !== c.id ? "aside" : ""} ${bob ? "bob" : ""} ${chosen === c.id ? "chosen" : ""} ${chosen && chosen !== c.id ? "gone" : ""}`}
                style={{ animationDelay: `${i * 0.12}s` } as CSSProperties}
                {...tapProps(() => tap(c))}
              >
                <span className="oi-badge">{i === 0 ? "★" : i}</span>
                <img className="oi-door-img" src={img("class_door")} alt="" draggable={false} />
                {/* the bigger you are, the higher the class: the child's ninja in a school jumper at 80%, 90%, 100% */}
                <img className="oi-door-ninja" src={img(`hero_${hero}_school`)} alt="" draggable={false} style={{ height: `${[80, 90, 100][i] * 2.1}px` }} />
                {settling?.id === c.id && <SettleRing key={settling.n} />}
              </button>
            ))}
          </div>
          <button
            aria-label="Not sure"
            data-choice="unsure"
            className={`oi-cloud ${spot === "unsure" ? "spot" : ""} ${bob ? "bob" : ""} ${chosen === "unsure" ? "chosen" : ""} ${chosen && chosen !== "unsure" ? "gone" : ""}`}
            {...tapProps(() => tap(B[3]))}
          >
            <img src={img("item_think_cloud")} alt="" draggable={false} />
            <span className="oi-q">?</span>
            {settling?.id === "unsure" && <SettleRing key={settling.n} round />}
          </button>
        </>
      )}
      <SenseiDock />
    </div>
  );
}

/** A gold ring that fills round the tapped card over 1.5 s. */
function SettleRing({ round }: { round?: boolean }) {
  return (
    <svg className="oi-ring" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {round ? <ellipse cx="50" cy="50" rx="47" ry="47" pathLength={100} /> : <rect x="3" y="3" width="94" height="94" rx="10" ry="10" pathLength={100} />}
    </svg>
  );
}

/** The grown-ups' gear: press and hold for 2 s. It glows and wiggles when the opt-in's badge lands on it. */
export function GearHold({ onHold, on }: { onHold: () => void; on?: boolean }) {
  const [p, setP] = useState(0);
  const t = useRef<number | undefined>(undefined);
  const start = () => {
    const t0 = performance.now();
    const tick = () => {
      const v = (performance.now() - t0) / 2000;
      setP(v);
      if (v >= 1) {
        cancelAnimationFrame(t.current!);
        setP(0);
        onHold();
      } else t.current = requestAnimationFrame(tick);
    };
    t.current = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(t.current!);
    setP(0);
  };
  return (
    <div className={`oi-gear ${on ? "on" : ""}`} data-grownups>
      <button className="btn-round sm" aria-label="Grown-ups (hold)" onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} style={{ background: `conic-gradient(var(--good) ${p * 360}deg, #d8cfc0 0)` }}>
        <Icon.gear />
      </button>
    </div>
  );
}

/** A copy of the chosen card shrinks into a round badge and flies to the gear. */
function flyBadge(el: Element): Promise<void> {
  const layer = document.querySelector(".fx-dom");
  if (!layer) return Promise.resolve();
  const r = stageRect(el);
  const c = el.cloneNode(true) as HTMLElement;
  c.classList.remove("spot", "bob", "chosen", "aside");
  c.classList.add("oi-badge-fly");
  c.querySelector(".oi-ring")?.remove();
  Object.assign(c.style, { position: "absolute", left: "0", top: "0", width: `${r.w}px`, height: `${r.h}px`, margin: "0", animation: "none" });
  layer.appendChild(c);
  const a = c.animate(
    [
      { transform: `translate(${r.x}px, ${r.y}px) scale(1)`, borderRadius: "30px" },
      { transform: `translate(${r.x + r.w * 0.2}px, ${r.y + r.h * 0.2}px) scale(0.6)`, borderRadius: "50%", offset: 0.3 },
      { transform: `translate(${GEAR.x - r.w / 2}px, ${GEAR.y - r.h / 2}px) scale(0.18)`, borderRadius: "50%" },
    ],
    { duration: 900, easing: "cubic-bezier(.4,.1,.3,1)" },
  );
  return a.finished.then(
    () => {
      c.remove();
      sfx.place();
    },
    () => c.remove(),
  );
}
