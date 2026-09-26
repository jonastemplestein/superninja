// "Show Sensei": finds where a child should start, using the questions the school asks (Sounds~Write parent decks):
//  • "Which spelling makes this sound?"        sound → spelling, with confusable letters (b/d/p …)
//  • "Which one says ___?"                     blending, with minimal-pair words (cat / cot / cap), so the
//                                              first letter never gives it away
//  • "Can you spell ___?"                      segmenting: build the word from its sounds
//  • "Which spelling of /ae/ is in 'rain'?"    pick the right alternative spelling for the gap: r _ n
//  • "Tap every word with this sound"          same sound, different spellings
// Stages get harder; enough rounds right moves up, the first miss stops. The child starts just past what they showed.
// The child's ninja stands bottom-left (docs/HERO.md). Every right round gets a move aimed at the answer (kick, jab,
// shuriken, spell, and more once it glows, never the same move twice running) and counts towards the streak, so a child
// who knows a lot sees the ninja light up, power up at 3, 6 and 10 in a row, and fly. Moving up a stage gets a cheer.
// The first miss ends placement: the ninja has a little think, then a big celebration of how far they got (the glow
// stays on for it, and there is no "Keep going!", because this is where Sensei says they're done).
import { useEffect, useRef, useState } from "react";
import { WORDS, UNITS, GRAPHEMES, type Word, type PhonemeId } from "../content/phonics";
import { say, sfx, playMusic, preload, urls } from "../engine/audio";
import { shuffle, pick } from "../engine/learner";
import { img, fx, sleep, tapProps, SenseiDock, useHelp, Tile } from "../ui/ui";
import { NinjaSpot, ninja } from "../ui/Ninja";
import { streak } from "../engine/streak";
import { powerBeat } from "./Training";
import "../styles/shell.css";
import { GEMS } from "../content/flower";
import { placeAtUnit } from "../engine/gems";

type Round =
  | { kind: "sound"; p: PhonemeId; answer: string; options: string[] }
  | { kind: "blend"; answer: Word; options: Word[] }
  | { kind: "spell"; answer: Word; bank: string[] }
  | { kind: "gap"; answer: Word; slot: number; options: string[] }
  | { kind: "findall"; p: PhonemeId; options: Word[]; targets: string[] };

interface Stage { unit: number; rounds: number; make: () => Round }

const upTo = (u: number) => new Set(UNITS.filter((x) => x.id <= u).flatMap((x) => x.spellings));
const wordsUpTo = (u: number, f: (w: Word) => boolean = () => true) => WORDS.filter((w) => w.unit <= u && f(w));

/** words that differ from w by exactly one sound (preferably not the first sound) */
function minimalPairs(w: Word, pool: Word[]): Word[] {
  const diffAt = (a: Word, b: Word) => {
    if (a.segs.length !== b.segs.length || a.text === b.text) return -1;
    let d = -1;
    for (let i = 0; i < a.segs.length; i++)
      if (a.segs[i].p !== b.segs[i].p) {
        if (d >= 0) return -1;
        d = i;
      }
    return d;
  };
  const pairs = pool.filter((x) => diffAt(w, x) >= 0);
  const notFirst = pairs.filter((x) => diffAt(w, x) > 0);
  return shuffle(notFirst.length >= 2 ? notFirst : pairs);
}

function soundRound(u: number): Round {
  const known = [...upTo(u)].filter((g) => g.length === 1);
  const confusable: Record<string, string[]> = { b: ["d", "p"], d: ["b", "p"], p: ["b", "d"], m: ["n", "w"], n: ["m", "u"], i: ["e", "a"], e: ["i", "a"], a: ["o", "u"], o: ["a", "u"], u: ["o", "n"], s: ["z", "c"], t: ["f", "d"] };
  const g = pick(known.filter((x) => confusable[x]));
  const opts = [...new Set([g, ...(confusable[g] ?? []).filter((x) => known.includes(x)), ...shuffle(known)])].slice(0, 4);
  return { kind: "sound", p: GRAPHEMES[g], answer: g, options: shuffle(opts) };
}
function blendRound(u: number, minUnit = 1): Round {
  const pool = wordsUpTo(u);
  for (let tries = 0; tries < 60; tries++) {
    const w = pick(pool.filter((x) => x.unit >= minUnit));
    const pairs = minimalPairs(w, pool).slice(0, 2);
    if (pairs.length === 2) return { kind: "blend", answer: w, options: shuffle([w, ...pairs]) };
  }
  const w = pick(pool);
  return { kind: "blend", answer: w, options: shuffle([w, ...shuffle(pool.filter((x) => x !== w && x.segs.length === w.segs.length)).slice(0, 2)]) };
}
function spellRound(u: number): Round {
  const known = [...upTo(u)];
  const w = pick(wordsUpTo(u, (x) => x.unit >= u - 1 && x.segs.length === 3 && !!x.pic));
  const need = w.segs.map((s) => s.g);
  return { kind: "spell", answer: w, bank: shuffle([...new Set([...need, ...shuffle(known.filter((g) => !need.includes(g) && g.length === 1)).slice(0, 3)])]) };
}
/** "Which spelling of /x/ is in <word>?" — the word's multi-letter spelling is the gap */
function gapRound(spellings: string[], extra: string[]): Round {
  const w = pick(WORDS.filter((x) => x.segs.some((s) => spellings.includes(s.g))));
  const slot = w.segs.findIndex((s) => spellings.includes(s.g));
  const same = GEMS.filter((g) => g.p === w.segs[slot].p && g.inPlay && g.g !== w.segs[slot].g).map((g) => g.g);
  return { kind: "gap", answer: w, slot, options: shuffle([...new Set([w.segs[slot].g, ...same, ...shuffle(extra)])].slice(0, 4)) };
}
function findAllRound(p: PhonemeId): Round {
  const withSound = shuffle(WORDS.filter((w) => w.pic && w.segs.some((s) => s.p === p)));
  // prefer targets that use DIFFERENT spellings of the sound
  const bySpelling = new Map<string, Word>();
  for (const w of withSound) {
    const g = w.segs.find((s) => s.p === p)!.g;
    if (!bySpelling.has(g)) bySpelling.set(g, w);
  }
  const targets = [...bySpelling.values(), ...withSound].filter((w, i, a) => a.indexOf(w) === i).slice(0, 3);
  const others = shuffle(WORDS.filter((w) => w.pic && w.unit >= 11 && !w.segs.some((s) => s.p === p))).slice(0, 3);
  return { kind: "findall", p, options: shuffle([...targets, ...others]), targets: targets.map((w) => w.text) };
}

const STAGES: Stage[] = [
  { unit: 1, rounds: 2, make: () => soundRound(2) },
  { unit: 2, rounds: 2, make: () => blendRound(2) },
  { unit: 4, rounds: 2, make: () => blendRound(4, 3) },
  { unit: 5, rounds: 1, make: () => spellRound(5) },
  { unit: 7, rounds: 2, make: () => blendRound(7, 6) },
  { unit: 10, rounds: 2, make: () => blendRound(10, 9) },
  { unit: 11, rounds: 2, make: () => gapRound(["sh", "ch", "th", "ck", "ng"], ["sh", "ch", "th", "s", "c"]) },
  { unit: 12, rounds: 2, make: () => gapRound(["ai", "ay", "ee", "ea", "igh", "ie", "oa", "ow"], ["ai", "ay", "ee", "ea", "oa", "igh"]) },
  { unit: 12, rounds: 1, make: () => findAllRound(pick(["ae", "ee", "oe"] as PhonemeId[])) },
];

/** Letter size for the three words of a blend round, so they fit on one row of the play area (x 340-1100). */
const blendFont = (opts: Word[]) => {
  const n = Math.max(...opts.map((w) => w.text.length));
  return n <= 3 ? 80 : n === 4 ? 68 : n === 5 ? 58 : 50;
};

export function Placement({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"ask" | "play" | "done">("ask");
  const [stage, setStage] = useState(0);
  const [round, setRound] = useState<Round>(() => STAGES[0].make());
  const [picked, setPicked] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const done = useRef(0); // rounds right in this stage
  const passed = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    streak.reset(); // a fresh streak: no flames carried over from training
    playMusic("dojo");
    say({ line: "place_ask" });
  }, []);

  const ask = (r = round) => {
    if (r.kind === "sound") return say([{ line: "place_sound" }, { gap: 450 }, { sound: r.p }]);
    if (r.kind === "blend") {
      preload([urls.word(r.answer.text)]);
      return say([{ line: "place_tap" }, { gap: 450 }, { word: r.answer.text }]);
    }
    if (r.kind === "spell") return say([{ line: "place_spell" }, { gap: 450 }, { word: r.answer.text }]);
    if (r.kind === "gap") return say([{ line: "place_gap" }, { gap: 300 }, { sound: r.answer.segs[r.slot].p }, { gap: 300 }, { line: "place_gap_in" }, { gap: 250 }, { word: r.answer.text }]);
    return say([{ line: "place_findall" }, { gap: 400 }, { sound: r.p }]);
  };
  useHelp(() => (phase === "ask" ? say({ line: "place_ask" }) : ask()), [phase, round]);

  const finish = async (unit: number) => {
    setPhase("done");
    placeAtUnit(unit);
    sfx.fanfare();
    fx.rain("confetti", 70);
    await Promise.all([say({ line: unit > 0 ? "place_done" : "place_new" }), ninja.celebrate()]);
    onDone();
  };

  /** A right round: the ninja strikes the answer (the tile, word or picture they got right, or the word they built),
   *  and it counts towards the streak. The next question waits until the strike has landed and its burst has mostly
   *  cleared (a spell flies for up to ~0.9 s; never more than 1.4 s in all), so no sparkle is left over a tile of the
   *  next question to look like a hint. */
  const right = async (el?: Element | null) => {
    sfx.good();
    const landed = ninja.strike(el?.isConnected ? el : { x: 720, y: 330 });
    // count it AFTER the strike has started: a tier-up queues the ninja's power-up behind the strike (docs/HERO.md)
    const ev = streak.hit();
    done.current++;
    await Promise.all([sleep(700), Promise.race([landed.then(() => sleep(380)), sleep(1400)])]);
    // 3, 6 or 10 in a row: the ninja powers up. Let that and "Ninja power!" land before the next question.
    if (ev.tierUp) await powerBeat(`streak_${[0, 3, 6, 10][ev.tier]}`);
    let st = stage;
    if (done.current >= STAGES[stage].rounds) {
      passed.current = STAGES[stage].unit;
      done.current = 0;
      if (stage + 1 >= STAGES.length) return finish(passed.current);
      st = stage + 1;
      setStage(st);
      // a new, harder stage: a happy cheer as Sensei says so
      void ninja.act("cheer");
      await say({ line: "yay_1" });
    }
    const r = STAGES[st].make();
    setRound(r);
    setPicked([]);
    setWrong(null);
    busy.current = false;
    await ask(r);
  };
  const miss = async (id: string) => {
    setWrong(id);
    sfx.wrong();
    // no streak.miss(): the first miss ends placement, so there is no "Keep going!" here, just a friendly "hmm",
    // then the celebration of how far they got (still glowing, if they earned it)
    void ninja.act("think");
    await sleep(700);
    finish(passed.current);
  };

  const built = useRef<HTMLDivElement>(null); // the spelling slots / the gapped word: what the ninja strikes when it's done
  const choose = async (id: string, el?: HTMLElement) => {
    if (busy.current || phase !== "play") return;
    const r = round;
    if (r.kind === "sound" || r.kind === "gap") {
      busy.current = true;
      const ok = id === (r.kind === "sound" ? r.answer : r.answer.segs[r.slot].g);
      setPicked([id]);
      if (ok) {
        if (r.kind === "gap") {
          // the ninja strikes the word as it's completed, while Sensei says it
          const said = say({ word: r.answer.text });
          await sleep(120);
          void right(built.current ?? el);
          await said;
          return;
        }
        return right(el);
      }
      return miss(id);
    }
    if (r.kind === "blend") {
      busy.current = true;
      setPicked([id]);
      return id === r.answer.text ? right(el) : miss(id);
    }
    if (r.kind === "spell") {
      const need = r.answer.segs[picked.length];
      if (id !== need.g) {
        busy.current = true;
        return miss(id);
      }
      const p = [...picked, id];
      setPicked(p);
      say({ sound: need.p });
      if (p.length === r.answer.segs.length) {
        busy.current = true;
        await sleep(500);
        await say({ word: r.answer.text });
        return right(built.current);
      }
      return;
    }
    if (picked.includes(id)) return;
    if (!r.targets.includes(id)) {
      busy.current = true;
      return miss(id);
    }
    const p = [...picked, id];
    setPicked(p);
    say({ word: id });
    if (r.targets.every((t) => p.includes(t))) {
      busy.current = true;
      await sleep(600);
      return right(el);
    }
  };

  // bot / testing hook
  const nextAnswer =
    round.kind === "sound" ? round.answer : round.kind === "blend" ? round.answer.text : round.kind === "spell" ? round.answer.segs[picked.length]?.g : round.kind === "gap" ? round.answer.segs[round.slot].g : round.targets.find((t) => !picked.includes(t));
  (window as any).__snState = phase === "play" ? { scene: "find", next: nextAnswer } : { scene: "place-ask" };

  const tileState = (id: string, correct: boolean) => (wrong === id ? "wrong" : picked.includes(id) && correct ? "right" : "");

  return (
    <div className="scene">
      <img className="bg-img" src={img("dojo_bg")} alt="" />
      <div className="vignette" />
      <NinjaSpot />
      {phase === "ask" && (
        <div className="row" style={{ position: "absolute", left: 340, right: 180, top: 96, gap: 80 }}>
          <button aria-label="I'm just starting" className="panel pop-in" {...tapProps(() => { sfx.pop(); finish(0); })} style={{ width: 290, height: 290, display: "grid", placeItems: "center", background: "linear-gradient(180deg,#eaffd9,#a8e07a)" }}>
            <svg viewBox="0 0 64 64" width="200" height="200">
              <path d="M32 58V30" stroke="#2b1d14" strokeWidth="5" strokeLinecap="round" />
              <path d="M32 34c-14 0-20-10-20-18 10 0 20 6 20 18zM32 30c0-12 8-20 22-20 0 12-8 20-22 20z" fill="#6cc04a" stroke="#2b1d14" strokeWidth="4" strokeLinejoin="round" />
              <ellipse cx="32" cy="58" rx="16" ry="4" fill="#8b5a3c" stroke="#2b1d14" strokeWidth="3" />
            </svg>
          </button>
          <button aria-label="Show Sensei what I know" className="panel pop-in" {...tapProps(async () => { sfx.great(); setPhase("play"); await say({ line: "place_intro" }); await ask(); })} style={{ width: 290, height: 290, display: "grid", placeItems: "center", background: "linear-gradient(180deg,#fff6c8,#ffc53d)", animationDelay: ".12s" }}>
            <img src={img("item_star")} alt="" style={{ width: 210 }} />
          </button>
        </div>
      )}
      {phase === "play" && (
        <>
          <div className="row" style={{ position: "absolute", left: 340, right: 180, top: 30, gap: 10 }}>
            {STAGES.map((_, i) => (
              <span key={i} style={{ width: 30, height: 30, borderRadius: "50%", border: "4px solid #2b1d14", background: i < stage ? "#ffc53d" : i === stage ? "#fff4dc" : "rgba(43,29,20,.3)" }} />
            ))}
          </div>
          <div key={stage + "-" + (round.kind === "sound" ? round.answer : "answer" in round ? round.answer.text : round.p)} className="row" style={{ position: "absolute", left: 340, right: 180, top: 84, bottom: 236, gap: round.kind === "blend" ? 20 : 28, alignContent: "center", flexWrap: round.kind === "blend" ? "nowrap" : undefined }}>
            {round.kind === "sound" && round.options.map((g) => <Tile key={g} g={g} size="lg" state={tileState(g, g === round.answer) as any} onTap={(el) => choose(g, el)} />)}
            {round.kind === "blend" &&
              round.options.map((w) => (
                // three words always sit on one row: longer words (swim, stamp) get a smaller letter size
                <button key={w.text} aria-label={w.text} className={`tile lg drop-in ${tileState(w.text, w === round.answer)}`} style={{ padding: "0 26px", fontSize: blendFont(round.options) }} {...tapProps<HTMLButtonElement>((el) => choose(w.text, el))}>
                  {w.text}
                </button>
              ))}
            {round.kind === "spell" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
                {round.answer.pic && <img src={img(`pic_${round.answer.text}`)} alt="" style={{ width: 140, height: 140, objectFit: "contain" }} />}
                <div className="slots" ref={built}>
                  {round.answer.segs.map((_, i) => (
                    <div key={i} className={`slot ${i < picked.length ? "filled" : i === picked.length ? "active" : ""}`}>{i < picked.length && <Tile g={picked[i]} className="pop-in" />}</div>
                  ))}
                </div>
                <div className="row" style={{ gap: 14 }}>
                  {round.bank.map((g) => <Tile key={g} g={g} state={wrong === g ? "wrong" : ""} onTap={() => choose(g)} />)}
                </div>
              </div>
            )}
            {round.kind === "gap" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  {round.answer.pic && <img src={img(`pic_${round.answer.text}`)} alt="" style={{ width: 130, height: 130, objectFit: "contain" }} />}
                  <div ref={built} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: 96, color: "var(--paper)", textShadow: "0 5px 0 var(--ink)", WebkitTextStroke: "3px var(--ink)", paintOrder: "stroke fill" } as React.CSSProperties}>
                    {round.answer.segs.map((s, i) =>
                      i === round.slot ? (
                        <span key={i} className={`slot ${picked.length ? "" : "active"}`} style={{ minWidth: 120, height: 110, fontSize: 70 }}>{picked[0] === s.g ? s.g : ""}</span>
                      ) : (
                        <span key={i}>{s.g}</span>
                      ),
                    )}
                  </div>
                </div>
                <div className="row" style={{ gap: 22 }}>
                  {round.options.map((g) => <Tile key={g} g={g} size="lg" state={tileState(g, g === round.answer.segs[round.slot].g) as any} onTap={(el) => choose(g, el)} />)}
                </div>
              </div>
            )}
            {round.kind === "findall" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {round.options.map((w) => (
                  <button key={w.text} aria-label={w.text} className="card drop-in" {...tapProps<HTMLButtonElement>((el) => choose(w.text, el))} style={{ position: "relative", width: 196, height: 164, display: "flex", flexDirection: "column", background: picked.includes(w.text) ? "#dfffe6" : wrong === w.text ? "#ffe0cc" : undefined }}>
                    {w.pic && <img src={img(`pic_${w.text}`)} alt="" style={{ width: 98, height: 98 }} />}
                    <span style={{ fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: 36, lineHeight: 1.1 }}>{w.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ position: "absolute", left: 720, bottom: 26, translate: "-50% 0" }}>
            <button className="btn-round" aria-label="Hear it again" {...tapProps(() => ask())}>
              <svg viewBox="0 0 64 64"><path fill="#fff4dc" stroke="#2b1d14" strokeWidth={7} strokeLinejoin="round" d="M10 25h10l13-11v36L20 39H10z" /><path fill="none" stroke="#2b1d14" strokeWidth={7} strokeLinecap="round" d="M42 22c5 5 5 15 0 20M49 15c9 9 9 25 0 34" /></svg>
            </button>
          </div>
        </>
      )}
      <SenseiDock />
    </div>
  );
}
