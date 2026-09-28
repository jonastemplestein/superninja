// The opt-in (docs/FIRST_MINUTES.md §4; the teacher's voice: docs/TEACHER_SCRIPT.md §3.3, FIX_PLAN TV-A.2): a
// brand-new child tells Sensei whether they go to big school, and which class, and hears that their grown-ups can change
// it later. It happens in the dojo, right after Choose, with the ninja bottom-left, Sensei's Help bottom-right and the
// grown-ups' gear top-right (press and hold to open). A friendly question, not a quiz: the reason first, then each
// "If…" line lands slowly on its spotlit card.
//   A: "First, let's find the right games for you." · "Do you go to big school yet?" (both cards bob once) · "If you
//      don't go yet, tap the teddy." (the teddy spotlit on "teddy") · "If you do, tap the school." (the school on
//      "school"). A tap: "Not yet. That's fine." / "You go to big school.", with a gold ring round the card.
//   B: "Which class are you in? Tap your class." · the doors' labels, each spotlit · "Not sure? Tap the cloud."
// Navigation (docs/NAVIGATION.md §5.A; nothing moves on by itself): taps count from the moment the cards land, even
// during the question (they cut Sensei off). A tap SELECTS the card: the gold ring draws round it and stays; tapping
// another moves it. The big green Next arrow (dim until something is selected) confirms. Hear it again says the
// question and each card's label with its spotlight; screen B has ◀ Back to A. Silence (quiet game time, with nothing
// selected): 8 s, the "If…" lines again with the cards bobbing (B: "Tap your class, or the cloud."); 20 s, "Ask a
// grown-up to help you choose." with the gear glowing; then Sensei waits: the game never chooses for the child (so
// TEACHER_SCRIPT's 40 s default isn't brought back: NAVIGATION rule 5).
// Confirming: the chosen card shrinks into a badge that flies to the grown-ups' gear, which glows and wiggles while
// Sensei says what she has set up ("Then we'll start with some listening games, just for you."), then "Grown-ups, you
// can change this later in the settings." That holds on Next: "Now come with me to the dojo. Tap the green arrow."
// (Hear it again says it all again) before the dojo welcome. Home goes to the title (nothing is saved yet).
// Mode "newyear" (the first launch on or after 1 September): "It's a new school year! Which class are you in now?"
// then screen B; "Not sure?" keeps last year's class.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { say, sfx, playMusic, hush, preload, urls, onClip, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import type { SchoolYear } from "../engine/store";
import { LINES } from "../content/lines";
import { wordAt } from "../content/word-times";
import { img, heroImg, fx, sleep, tapProps, useHelp, useHero, SenseiDock, Icon, stageRect } from "../ui/ui";
import { NinjaSpot, ninja } from "../ui/Ninja";
import { useNav, holdNext, nudgeNext } from "../ui/nav";
import { quietLadder } from "./Training";
import "../styles/optin.css";
import "../styles/nav-A.css";

type Choice = "notyet" | "school" | "R" | "Y1" | "Y2" | "unsure";
interface Card { id: Choice; label: string; echo: string; sayLabel: string }
const HAS = new Set(LINES.map((l) => l.id));
/** A line, or the older one it replaces until it has text (every caller guards: SCRIPT_FIXES Part B). */
const pick = (id: string, old: string) => (HAS.has(id) ? id : old);
const A: Card[] = [
  { id: "notyet", label: "teddy", echo: pick("tv_opt_echo_notyet", "fm_opt_echo_notyet"), sayLabel: pick("tv_opt_notyet", "fm_opt_notyet") },
  { id: "school", label: "school", echo: pick("tv_opt_echo_school", "fm_opt_echo_school"), sayLabel: pick("tv_opt_yes", "fm_opt_yes") },
];
const B: Card[] = [
  { id: "R", label: "Reception", echo: "fm_opt_rec", sayLabel: "fm_opt_rec" },
  { id: "Y1", label: "Year One", echo: "fm_opt_y1", sayLabel: "fm_opt_y1" },
  { id: "Y2", label: "Year Two", echo: "fm_opt_y2", sayLabel: "fm_opt_y2" },
  { id: "unsure", label: "Not sure", echo: "fm_opt_unsure", sayLabel: "fm_opt_unsure" },
];
const CONFIRM: Record<Exclude<Choice, "school">, string> = { notyet: pick("tv_opt_ok_notyet", "fm_opt_ok_notyet"), unsure: "fm_opt_ok_unsure", R: "fm_opt_ok_rec", Y1: "fm_opt_ok_y1", Y2: "fm_opt_ok_y2" };
const GROWNUPS = pick("tv_opt_grownups", "fm_opt_grownups");
/** The cards each clip spotlights (TEACHER_SCRIPT §3.3): an "If…" line on the word that names its card (content/
 *  word-times.ts), a door's label from its start. */
const SPOTS: Record<string, [Choice, string | null][]> = {
  tv_opt_notyet: [["notyet", "teddy"]],
  tv_opt_yes: [["school", "school"]],
  tv_opt_again: [["notyet", "teddy"], ["school", "school"]],
  fm_opt_notyet: [["notyet", null]],
  fm_opt_yes: [["school", null]],
  fm_opt_rec: [["R", null]],
  fm_opt_y1: [["Y1", null]],
  fm_opt_y2: [["Y2", null]],
  fm_opt_unsure: [["unsure", null]],
};
/** A spotlight comes on this long before its word, so it has landed as the word is said (game ms). */
const SPOT_LEAD = 180;
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
  const [bobOnce, setBobOnce] = useState(0); // bumps: both cards bob once (on "Do you go to big school yet?")
  const [chosen, setChosen] = useState<Choice | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [gear, setGear] = useState(0); // > 0: the gear glows; bumps restart its wiggle
  const [kept, setKept] = useState<Exclude<Choice, "school"> | null>(null); // the chosen card, small, while the confirm holds
  const [asked, setAsked] = useState(false); // the question and its labels have been said (for bots)
  const live = useRef(true);
  const locked = useRef(false);
  const selRef = useRef<Choice | null>(null);
  const idle = useRef<{ stop(): void } | null>(null);
  const talk = useRef(0); // the question's spoken run: a newer one (Hear it again, Help, Back, a tap) stops an older one
  const confirmSaid = useRef<Promise<boolean> | null>(null);
  const confirmLines = useRef<Say[]>([]);
  const confirmToDojo = useRef(false); // the latest run of the confirm lines ends on "Now come with me to the dojo…"
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const cards = screen === "A" ? A : B;
  /** The hold's line (mode "new": on to the dojo welcome). */
  const toDojo: Say[] = mode === "new" && HAS.has("tv_opt_to_dojo") ? [{ line: "tv_opt_to_dojo" }] : [];

  /** The question and each card's label: the "If…" lines on screen A, the doors' labels on B (the spotlights follow the
   *  clips: see the onClip effect below). `first`: the reason first ("First, let's find the right games for you."). */
  const question = (s: "A" | "B", first = false): Say[] =>
    s === "A"
      ? [...(first && HAS.has("tv_opt_why") ? [{ line: "tv_opt_why" }, { gap: 300 }] : []), { line: "fm_opt_q1" }, { gap: 350 }, { line: A[0].sayLabel }, { gap: 350 }, { line: A[1].sayLabel }]
      : [{ line: mode === "newyear" ? "fm_newyear_q" : "fm_opt_q2" }, { gap: 350 }, ...B.flatMap((c): Say[] => [{ line: c.sayLabel }, { gap: 300 }])];
  /** 8 s of quiet with nothing selected: the "If…" lines again (B: "Tap your class, or the cloud."). */
  const again8 = (s: "A" | "B"): Say[] => (s === "A" ? [{ line: pick("tv_opt_again", "fm_opt_q1_again") }] : [{ line: "fm_opt_q2_again" }]);

  /** The question, then each card's label with its spotlight. A tap, or a newer run, stops it. */
  const sayQuestion = async (s: "A" | "B", first = false) => {
    const my = ++talk.current;
    const ok = await say(question(s, first));
    return ok && my === talk.current && !locked.current && live.current && screenRef.current === s;
  };
  /** A screen's cards land (they work from now), then Sensei asks. */
  const ask = async (s: "A" | "B") => {
    clearIdle();
    await sleep(400);
    if (!live.current || screenRef.current !== s) return;
    setLanded(true);
    const done = await sayQuestion(s, s === "A");
    if (done && !selRef.current) startIdle(s);
    if (screenRef.current === s) setAsked(true);
  };
  /** Hear it again (and Help's first press): the question and the labels again (not the reason). */
  const askAgain = async () => {
    if (locked.current) return;
    clearIdle();
    const s = screenRef.current;
    if ((await sayQuestion(s)) && !selRef.current) startIdle(s);
  };
  const clearIdle = () => {
    idle.current?.stop();
    idle.current = null;
  };
  /** Silence, with nothing selected (quiet game time): 8 s → the "If…" lines again, the cards bob; 20 s → "Ask a
   *  grown-up to help you choose.", the gear glows; then Sensei waits. */
  const startIdle = (s: "A" | "B") => {
    clearIdle();
    idle.current = quietLadder([8000, 20000], (k) => {
      if (locked.current || selRef.current || screenRef.current !== s || !live.current) return;
      if (k === 0) {
        // (off for two frames, then on: the bob starts again)
        setBob(0);
        requestAnimationFrame(() => requestAnimationFrame(() => setBob((b) => b + 1)));
        talk.current++;
        void say(again8(s));
      } else {
        setGear((g) => g + 1);
        talk.current++;
        void say([{ line: pick("tv_opt_ask", "fm_opt_q1_again") }]);
      }
    });
  };

  // the spotlights follow the speech (TEACHER_SCRIPT §3.3): a card is lit on the word that names it, or for its label's
  // clip, and goes off as the clip ends; "Do you go to big school yet?" bobs both cards once
  useEffect(
    () =>
      onClip((id, start, end) => {
        if (!live.current || locked.current) return;
        if (id === "fm_opt_q1") return void setBobOnce((k) => k + 1);
        const spots = SPOTS[id];
        if (!spots) return;
        const my = talk.current;
        const len = (end - start) * FAST; // game ms (setTimeout runs in game time)
        spots.forEach(([c, word], i) => {
          const at = word ? wordAt(id, word) : 0;
          const on = at === undefined ? 0 : Math.max(0, at * 1000 - SPOT_LEAD);
          const off = i + 1 < spots.length ? (wordAt(id, spots[i + 1][1] ?? "") ?? len / 1000) * 1000 - SPOT_LEAD : len + 350;
          setTimeout(() => my === talk.current && !selRef.current && setSpot(c), on);
          setTimeout(() => my === talk.current && setSpot((x) => (x === c ? null : x)), Math.max(on + 300, off));
        });
      }),
    [],
  );

  useEffect(() => {
    live.current = true;
    playMusic("dojo");
    preload([...A, ...B].flatMap((c) => [urls.line(c.echo), urls.line(c.sayLabel)]).concat(Object.values(CONFIRM).map(urls.line), [urls.line(GROWNUPS), urls.line("tv_opt_why"), urls.line("tv_opt_to_dojo")]));
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

  /** A tap: say the card's echo ("Not yet. That's fine."), and select it (a gold ring round it; another tap moves it). */
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

  /** What Sensei has set up, that the grown-ups can change it, and the way on (Hear it again says it again; the gear
   *  wiggles). */
  const sayConfirm = () => {
    setGear((k) => k + 1);
    const p = say([...confirmLines.current, ...(toDojo.length ? [{ gap: 350 }, ...toDojo] : [])]);
    confirmSaid.current = p;
    confirmToDojo.current = toDojo.length > 0;
    return p;
  };

  const confirm = async (id: Exclude<Choice, "school">) => {
    if (locked.current) return;
    locked.current = true;
    setConfirming(true);
    clearIdle();
    talk.current++;
    setSelected(null);
    setSpot(null);
    hush();
    const year = mode === "newyear" && id === "unsure" ? lastYear ?? "unsure" : YEAR[id];
    const movedUp = mode === "newyear" && id !== "unsure" && year !== lastYear;
    confirmLines.current =
      mode === "newyear"
        ? movedUp ? [{ line: "fm_newyear_up" }, { gap: 300 }, { line: GROWNUPS }] : [{ line: GROWNUPS }]
        : [{ line: CONFIRM[id] }, { gap: 300 }, { line: GROWNUPS }];
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
    // (a Hear it again meanwhile starts the lines over, "…to the dojo" included: wait for the latest run)
    let said = false;
    for (let p = confirmSaid.current; ; p = confirmSaid.current!) {
      said = await p;
      if (p === confirmSaid.current || !live.current) break;
    }
    await flown;
    if (!live.current) return;
    // the step holds on Next ("Now come with me to the dojo. Tap the green arrow.", unless a Hear it again has just said
    // it): then the dojo welcome
    const held = holdNext("optin-confirm", sayConfirm);
    if (toDojo.length && !(said && confirmToDojo.current)) void say(toDojo);
    if ((await held) && live.current) onDone({ year, silent: false, movedUp });
  };

  (window as any).__snState = {
    scene: "optin", game: null, screen, choices: cards.map((c) => c.label), next: !landed || locked.current ? null : cards[0].label, asked, selected: selected?.id ?? null, chosen,
  };

  const cls = (id: Choice) =>
    `${spot === id ? "spot" : ""} ${spot && spot !== id ? "aside" : ""} ${bob ? "bob" : bobOnce && !chosen ? `bob1 b${bobOnce % 2}` : ""} ${selected?.id === id ? "sel" : ""} ${chosen === id ? "chosen" : ""} ${chosen && chosen !== id ? "gone" : ""}`;
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
