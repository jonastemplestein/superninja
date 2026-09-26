// The opt-in (docs/FIRST_MINUTES.md §4): a brand-new child tells Sensei whether they go to big school, and which
// class, and hears that their grown-ups can change it later. It happens in the dojo, right after "Now, choose your
// ninja!", with the ninja bottom-left, Sensei's Help bottom-right and the grown-ups' gear top-right (press and hold to
// open).
//   A: "Do you go to big school yet?"  TEDDY (not yet) · SCHOOL (yes, with the child's own ninja at the gate)
//   B: "Which class are you in?"       three class doors (Reception ★, Year One 1, Year Two 2) · "Not sure?" cloud
// Navigation (docs/NAVIGATION.md §5.A; nothing moves on by itself): taps count from the moment the cards land, even
// during the question (they cut Sensei off), and say the card's own label. A tap SELECTS the card: a gold ring draws
// round it and stays; tapping another moves it. The big green Next arrow (dim until something is selected) confirms.
// Hear it again says the question and each card's label with its spotlight; screen B has ◀ Back to A. Silence: after
// 8 s Sensei asks again (the cards bob), once more at 20 s, then waits; the game never chooses for the child.
// Confirming: the chosen card shrinks into a badge that flies to the grown-ups' gear, which glows and wiggles while
// Sensei says what she has set up, then "Your grown-ups can change this later, in the grown-ups' settings." That
// holds on Next (Hear it again says it again) before the first lesson. Home goes to the title (nothing is saved yet).
// Mode "newyear" (the first launch on or after 1 September): "It's a new school year! Which class are you in now?"
// then screen B; "Not sure?" keeps last year's class.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { say, sfx, playMusic, hush, preload, urls, type Say } from "../engine/audio";
import type { SchoolYear } from "../engine/store";
import { img, heroImg, fx, sleep, tapProps, useHelp, useHero, SenseiDock, Icon, stageRect } from "../ui/ui";
import { NinjaSpot, ninja } from "../ui/Ninja";
import { useNav, holdNext, nudgeNext } from "../ui/nav";
import "../styles/optin.css";
import "../styles/nav-A.css";

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
const GEAR = { x: 1206, y: 58 };

export interface OptInResult {
  year: SchoolYear;
  /** Always false now: the game never chooses for a silent child (docs/NAVIGATION.md rule 5). App's applyOptIn can
   *  stop reading it (and the fm_opt_default_* lines leave the opt-in). */
  silent?: boolean;
  /** "newyear": the class changed (a moving-up sticker) or stayed */
  movedUp?: boolean;
}

export function OptIn({ onDone, onGrownups, onHome, mode = "new", lastYear }: { onDone: (r: OptInResult) => void; onGrownups: () => void; onHome?: () => void; mode?: "new" | "newyear"; lastYear?: SchoolYear }) {
  const hero = useHero();
  const [screen, setScreen] = useState<"A" | "B">(mode === "newyear" ? "B" : "A");
  const [landed, setLanded] = useState(false);
  const [spot, setSpot] = useState<Choice | null>(null);
  const [selected, setSelected] = useState<{ id: Choice; n: number } | null>(null);
  const [bob, setBob] = useState(0);
  const [chosen, setChosen] = useState<Choice | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [gear, setGear] = useState(0); // > 0: the gear glows; bumps restart its wiggle
  const [kept, setKept] = useState<Exclude<Choice, "school"> | null>(null); // the chosen card, small, while the confirm holds
  const [asked, setAsked] = useState(false); // the question and its labels have been said (for bots)
  const live = useRef(true);
  const locked = useRef(false);
  const selRef = useRef<Choice | null>(null);
  const idle = useRef<number[]>([]);
  const talk = useRef(0); // the question's spoken run: a newer one (Hear it again, Help, Back) stops an older one
  const confirmSaid = useRef<Promise<boolean> | null>(null);
  const confirmLines = useRef<Say[]>([]);
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const cards = screen === "A" ? A : B;

  const question = (s: "A" | "B", again = false): Say[] =>
    s === "A"
      ? again ? [{ line: "fm_opt_q1_again" }] : [{ line: "fm_opt_q1" }]
      : again ? [{ line: "fm_opt_q2_again" }] : [{ line: mode === "newyear" ? "fm_newyear_q" : "fm_opt_q2" }];

  /** The question, then each card's label while that card is spotlit. A tap, or a newer run, stops it. */
  const sayQuestion = async (s: "A" | "B") => {
    const my = ++talk.current;
    const ok = await say(question(s));
    if (!ok || my !== talk.current || locked.current || !live.current) return false;
    for (const c of s === "A" ? A : B) {
      if (my !== talk.current || locked.current || !live.current || screenRef.current !== s) return false;
      setSpot(c.id);
      await sleep(150);
      const done = await say({ line: c.sayLabel });
      await sleep(250);
      if (my === talk.current) setSpot(null);
      if (!done) return false;
    }
    return my === talk.current;
  };
  /** A screen's cards land, then Sensei asks. */
  const ask = async (s: "A" | "B") => {
    clearIdle();
    await sleep(400);
    if (!live.current || screenRef.current !== s) return;
    setLanded(true);
    if ((await sayQuestion(s)) && !selRef.current) startIdle(s);
    if (screenRef.current === s) setAsked(true);
  };
  /** Hear it again (and Help's first press): the question and the labels again. */
  const askAgain = async () => {
    if (locked.current) return;
    clearIdle();
    const s = screenRef.current;
    if ((await sayQuestion(s)) && !selRef.current) startIdle(s);
  };
  const clearIdle = () => {
    idle.current.forEach(clearTimeout);
    idle.current = [];
  };
  /** Silence, with nothing selected: 8 s → ask again, the cards bob; 20 s → once more; then Sensei waits. */
  const startIdle = (s: "A" | "B") => {
    clearIdle();
    const nudge = () => {
      if (locked.current || selRef.current || screenRef.current !== s) return;
      // (off for two frames, then on: the bob starts again)
      setBob(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setBob((k) => k + 1)));
      void say(question(s, true));
    };
    idle.current.push(window.setTimeout(nudge, 8000), window.setTimeout(nudge, 20000));
  };

  useEffect(() => {
    live.current = true;
    playMusic("dojo");
    preload([...A, ...B].flatMap((c) => [urls.line(c.echo), urls.line(c.sayLabel)]).concat(Object.values(CONFIRM).map(urls.line), [urls.line("fm_opt_grownups")]));
    void ask(screen);
    return () => {
      live.current = false;
      clearIdle();
      hush();
    };
  }, []);

  useNav({
    home: onHome, // (none given: App's Home rule, the title; nothing is saved until the confirm)
    back: mode === "new" && screen === "B" && !confirming ? () => void toA() : null,
    again: confirming ? () => sayConfirm() : () => askAgain(),
    next: { ready: !!selected && landed && !confirming, go: () => goOn() },
  });
  useHelp(
    (n) => {
      if (locked.current) return;
      if (n > 1 && selRef.current) return nudgeNext();
      void askAgain();
    },
    [screen],
  );

  /** A tap: say the card's label, and select it (a gold ring round it; another tap moves it). */
  const tap = (c: Card) => {
    if (locked.current || !landed) return;
    clearIdle();
    talk.current++;
    setBob(0);
    setSpot(null);
    sfx.pop();
    hush();
    void say({ line: c.echo });
    void ninja.pose("ready");
    selRef.current = c.id;
    setSelected((s) => ({ id: c.id, n: (s?.n ?? 0) + 1 }));
  };

  /** Next: school → the classes; any other card → confirm it. */
  const goOn = () => {
    const id = selRef.current;
    if (!id || locked.current) return;
    if (id === "school") return void toClasses();
    void confirm(id);
  };

  const toScreen = async (s: "A" | "B") => {
    clearIdle();
    talk.current++;
    hush();
    setAsked(false);
    selRef.current = null;
    setSelected(null);
    setSpot(null);
    setBob(0);
    setLanded(false);
    void ninja.pose(null);
    if (s === "B") {
      void ninja.act("jump");
      await sleep(300);
    }
    if (!live.current) return;
    setScreen(s);
    screenRef.current = s;
    // doors swing in (or the two cards land again)
    await ask(s);
  };
  const toClasses = () => toScreen("B");
  const toA = () => toScreen("A");

  /** What Sensei has set up, and that the grown-ups can change it (Hear it again says it again; the gear wiggles). */
  const sayConfirm = () => {
    setGear((k) => k + 1);
    const p = say(confirmLines.current);
    confirmSaid.current = p;
    return p;
  };

  const confirm = async (id: Exclude<Choice, "school">) => {
    if (locked.current) return;
    locked.current = true;
    setConfirming(true);
    clearIdle();
    talk.current++;
    setSelected(null);
    hush();
    const year = mode === "newyear" && id === "unsure" ? lastYear ?? "unsure" : YEAR[id];
    const movedUp = mode === "newyear" && id !== "unsure" && year !== lastYear;
    confirmLines.current =
      mode === "newyear"
        ? movedUp ? [{ line: "fm_newyear_up" }, { gap: 300 }, { line: "fm_opt_grownups" }] : [{ line: "fm_opt_grownups" }]
        : [{ line: CONFIRM[id] }, { gap: 300 }, { line: "fm_opt_grownups" }];
    setChosen(id);
    // the chosen card shrinks into a badge that flies to the grown-ups' gear
    const el = document.querySelector(`.oi [data-choice="${id}"]`);
    void ninja.act(screenRef.current === "B" && id !== "unsure" ? "flip" : "cheer");
    // the badge flies to the gear as Sensei starts to say what she has set up
    const flown = (el ? flyBadge(el) : Promise.resolve()).then(() => {
      if (live.current) setKept(id);
      setGear((k) => k + 1);
      sfx.great();
      fx.twinkle(GEAR.x, GEAR.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 14, 6);
    });
    await sleep(350);
    if (!live.current) return;
    confirmSaid.current ??= say(confirmLines.current);
    // (a Hear it again meanwhile starts the lines over: wait for the latest run)
    for (let p = confirmSaid.current; ; p = confirmSaid.current!) {
      await p;
      if (p === confirmSaid.current || !live.current) break;
    }
    await flown;
    if (!live.current) return;
    // the step holds: Next goes on to the first lesson
    if ((await holdNext("optin-confirm", sayConfirm)) && live.current) onDone({ year, silent: false, movedUp });
  };

  (window as any).__snState = {
    scene: "optin", screen, choices: cards.map((c) => c.label), next: !landed || locked.current ? null : cards[0].label, asked, selected: selected?.id ?? null, chosen,
  };

  const cls = (id: Choice) =>
    `${spot === id ? "spot" : ""} ${spot && spot !== id ? "aside" : ""} ${bob ? "bob" : ""} ${selected?.id === id ? "sel" : ""} ${chosen === id ? "chosen" : ""} ${chosen && chosen !== id ? "gone" : ""}`;
  return (
    <div className={`scene oi ${screen === "B" ? "oi-b" : "oi-a"}`}>
      <img className="bg-img" src={img("dojo_bg")} alt="" />
      <div className="vignette" />
      <NinjaSpot />
      {/* the grown-ups' gear (press and hold); the chosen badge flies here */}
      <GearHold key={gear} on={gear > 0} onHold={onGrownups} />
      {screen === "A" && (
        <div className="oi-row">
          {A.map((c, i) => (
            <button
              key={c.id}
              aria-label={c.label}
              data-choice={c.id}
              className={`oi-card ${c.id} ${cls(c.id)}`}
              style={{ animationDelay: `${i * 0.12}s` } as CSSProperties}
              {...tapProps(() => tap(c))}
            >
              <span className="oi-plate">
                <img src={img(c.id === "notyet" ? "opt_teddy" : "opt_school")} alt="" draggable={false} />
                {c.id === "school" && <img className="oi-gate-ninja" src={heroImg(hero, "idle")} alt="" draggable={false} />}
              </span>
              {selected?.id === c.id && <SelectRing key={selected.n} />}
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
                className={`oi-door d${i} ${cls(c.id)}`}
                style={{ animationDelay: `${i * 0.12}s` } as CSSProperties}
                {...tapProps(() => tap(c))}
              >
                <span className="oi-badge">{i === 0 ? "★" : i}</span>
                <img className="oi-door-img" src={img("class_door")} alt="" draggable={false} />
                {/* the bigger you are, the higher the class: the child's ninja in a school jumper at 80%, 90%, 100% */}
                <img className="oi-door-ninja" src={img(`hero_${hero}_school`)} alt="" draggable={false} style={{ height: `${[80, 90, 100][i] * 2.1}px` }} />
                {selected?.id === c.id && <SelectRing key={selected.n} />}
              </button>
            ))}
          </div>
          <button aria-label="Not sure" data-choice="unsure" className={`oi-cloud ${cls("unsure")}`} {...tapProps(() => tap(B[3]))}>
            <img src={img("item_think_cloud")} alt="" draggable={false} />
            <span className="oi-q">?</span>
            {selected?.id === "unsure" && <SelectRing key={selected.n} round />}
          </button>
        </>
      )}
      {kept && <KeptCard id={kept} hero={hero} />}
      <SenseiDock />
    </div>
  );
}

/** The chosen card, small, beside Sensei's caption while she says what she has set up (so the held confirm isn't an
 *  empty dojo): its picture on a plate with a gold ring, and the gear it went to in its corner. Not a button. */
function KeptCard({ id, hero }: { id: Exclude<Choice, "school">; hero: string }) {
  const door = id === "R" || id === "Y1" || id === "Y2";
  const k = door ? ["R", "Y1", "Y2"].indexOf(id) : 0;
  return (
    <div className={`oi-kept pop-in ${door ? "door" : id}`} aria-hidden="true">
      <span className="oi-kept-in">
      <span className="oi-kept-plate">
        {id === "notyet" && <img src={img("opt_teddy")} alt="" draggable={false} />}
        {door && (
          <>
            <img className={`oi-kept-door d${k}`} src={img("class_door")} alt="" draggable={false} />
            <img className="oi-kept-ninja" src={img(`hero_${hero}_school`)} alt="" draggable={false} style={{ height: `${[80, 90, 100][k] * 1.5}px` }} />
          </>
        )}
        {id === "unsure" && (
          <>
            <img src={img("item_think_cloud")} alt="" draggable={false} />
            <span className="oi-q">?</span>
          </>
        )}
      </span>
      {door && <span className={`oi-badge ${k === 0 ? "star" : ""}`}>{k === 0 ? "★" : k}</span>}
      <span className="oi-kept-gear"><Icon.gear /></span>
      </span>
    </div>
  );
}

/** The gold ring round the selected card: it draws on quickly and stays (nav-A.css). */
function SelectRing({ round }: { round?: boolean }) {
  return (
    <svg className="oi-ring sel" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
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
  c.classList.remove("spot", "bob", "chosen", "aside", "sel");
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
