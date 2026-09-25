// Early-learning mini-games (docs/PEDAGOGY.md). Every item runs "I do → We do → You do":
//   ido   – Sensei demonstrates; the child watches (a paw taps the answer)
//   wedo  – the answer glows (hint), the child taps it
//   youdo – no hint; help after an error or 8 s of silence
// Errors: 1st → back to listening; 2nd → choices shrink, the answer glows, "It's this one!"; the item is re-queued
// so the round always ends with a success. Stars count only first-try "youdo" items.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { LevelProps } from "../App";
import { WORD_BY_TEXT, WORDS, ORAL_WORDS, GRAPHEMES, PHONEMES, type Word, type PhonemeId } from "../content/phonics";
import { knownSpellings, worldOf, type Level } from "../content/worlds";
import { picSaysFirst } from "../content/pic-names";
import { LINES } from "../content/lines";
import { say, sfx, playMusic, preload, urls, hush, type Say } from "../engine/audio";
import { shuffle } from "../engine/learner";
import { recordSpell, recordRead, recordWordSpelt } from "../engine/store";
import { img, heroImg, useHero, Tile, RoundButton, Icon, fx, stageXY, sleep, tapProps, useHelp, TapHint, WordCard, SenseiDock } from "../ui/ui";
import { pickPraise } from "./Dojo";

export type Mode = "ido" | "wedo" | "youdo";
const x = (w: string): Say => ({ stretch: w });

// ---------------------------------------------------------------- shared bits
/** A named picture card. */
function PicCard({ w, onTap, state, size = 270, wait }: { w: string; onTap?: (el: HTMLElement) => void; state?: "glow" | "right" | "wrong" | "dim" | ""; size?: number; wait?: boolean }) {
  return (
    <button
      aria-label={w}
      className={`pic-card ${state ?? ""} ${wait ? "wait" : ""}`}
      style={{ width: size, height: size }}
      {...tapProps<HTMLButtonElement>((el) => onTap?.(el))}
    >
      <img src={img(`pic_${w}`)} alt="" />
    </button>
  );
}

/** Lines under a picture: one per sound; `show` = which positions have their spelling revealed. */
function SoundLines({ word, show, lit }: { word: Word | null; show: number[]; lit?: number }) {
  if (!word) return null;
  return (
    <div className="sound-lines">
      {word.segs.map((s, i) => (
        <div key={i} className={`sound-line ${lit === i ? "lit" : ""}`}>
          {show.includes(i) && <span aria-hidden style={{ display: "contents" }}><Tile g={s.g} className="reveal drop-in" style={{ pointerEvents: "none" }} /></span>}
        </div>
      ))}
    </div>
  );
}

/** Phases report how far through they are; the bar then moves item by item inside the phase's range. */
const SubProgress = createContext<(f: number) => void>(() => {});
const useReportProgress = (f: number) => {
  const report = useContext(SubProgress);
  useEffect(() => report(f), [f]);
};

function Frame({ level, children, progress: fixed, range }: { level: Level; children: ReactNode; progress?: number; range?: [number, number] }) {
  const world = worldOf(level);
  const hero = useHero();
  const [sub, setSub] = useState(0);
  useEffect(() => setSub(0), [range?.[0]]);
  const progress = range ? range[0] + (range[1] - range[0]) * Math.min(1, sub) : fixed ?? 0;
  return (
    <div className="scene">
      <img className="bg-img" src={img(level.kind === "listen" ? `bg_${world.key}` : "dojo_bg")} alt="" />
      <div className="vignette" />
      <img className="sprite breathe" src={heroImg(hero, "idle")} alt="" style={{ right: 16, bottom: 6, width: 170, zIndex: 1 }} />
      <div className="row" style={{ position: "absolute", left: 0, right: 0, top: 18, gap: 6, pointerEvents: "none" }}>
        <div style={{ width: 360, height: 20, borderRadius: 12, border: "4px solid var(--ink)", background: "rgba(43,29,20,.3)", overflow: "hidden" }}>
          <div style={{ width: `${progress * 100}%`, height: "100%", background: "linear-gradient(180deg,#ffe38a,#ffc53d)", transition: "width .4s" }} />
        </div>
      </div>
      <SubProgress.Provider value={setSub}>{children}</SubProgress.Provider>
      <SenseiDock />
    </div>
  );
}

const soundOf = (g: string) => GRAPHEMES[g] as PhonemeId;
const HAS_AN = LINES.some((l) => l.id === "this_is_an");
const picWords = (f: (w: Word) => boolean) => WORDS.filter((w) => w.pic && f(w)).map((w) => w.text);
const firstIs = (w: string, p: PhonemeId) => (WORD_BY_TEXT[w]?.segs[0].p ?? ORAL_WORDS[w]?.first) === p;
const hasMiddle = (w: string, p: PhonemeId) => WORD_BY_TEXT[w]?.segs.some((s, i) => i > 0 && s.p === p);

// ---------------------------------------------------------------- the pick-game engine
export interface PickItem {
  mode: Mode;
  options: string[]; // ids
  answer: string;
  prompt: Say[];
  /** said when a picture first appears (naming) */
  name?: boolean;
  onRight?: () => Promise<void>;
  listenAgain: Say[];
}

function usePickGame(items: PickItem[], opts: { onFinish: (firstTry: number, youdo: number) => void; kind: "pic" | "tile" }) {
  const [queue, setQueue] = useState<PickItem[]>(items);
  const [i, setI] = useState(0);
  const [state, setState] = useState<Record<string, "glow" | "right" | "wrong" | "dim" | "">>({});
  const [paw, setPaw] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const misses = useRef(0);
  const firstTry = useRef(0);
  const youdo = useRef(0);
  const named = useRef(new Set<string>());
  const promptLive = useRef(false);
  const answeredEarly = useRef(false);
  const [waitTap, setWaitTap] = useState<string | null>(null);
  const item = queue[i];
  useReportProgress(i / queue.length);

  const present = async (it: PickItem) => {
    setBusy(true);
    setState({});
    setPaw(null);
    misses.current = 0;
    const seq: Say[] = [];
    if (it.mode === "ido" && (i === 0 || queue[i - 1].mode !== "ido")) seq.push({ line: "ido" }, { gap: 250 });
    if (it.mode === "wedo" && queue[i - 1]?.mode === "ido") seq.push({ line: "wedo" }, { gap: 250 });
    if (it.mode === "youdo" && queue[i - 1] && queue[i - 1].mode !== "youdo") seq.push({ line: "youdo" }, { gap: 250 });
    // name pictures the first times they appear
    if (opts.kind === "pic")
      for (const o of it.options)
        if (!named.current.has(o)) {
          named.current.add(o);
          // "This is an apple", not "a apple" (falls back to "This is..." until the line exists)
          const article = /^[aeiou]/.test(o) ? (HAS_AN ? "this_is_an" : "this_is") : "this_is_a";
          seq.push({ line: article }, { gap: 80 }, { word: o }, { gap: 350 });
        }
    if (seq.length) await say(seq);
    // while the question itself is playing, an eager answer counts: it interrupts Sensei (see choose)
    promptLive.current = it.mode !== "ido";
    answeredEarly.current = false;
    await say(it.prompt);
    promptLive.current = false;
    if (answeredEarly.current) return;
    if (it.mode === "wedo") setState({ [it.answer]: "glow" });
    if (it.mode === "ido") {
      setPaw(it.answer);
      await sleep(1100);
      await choose(it.answer, true);
      return;
    }
    setBusy(false);
  };

  useEffect(() => {
    if (item) present(item);
  }, [i]);

  const choose = async (id: string, auto = false) => {
    if (!item) return;
    if (busy && !auto) {
      if (!promptLive.current) {
        // too early (pictures still being named): show we noticed, and to wait
        setWaitTap(id);
        setTimeout(() => setWaitTap(null), 450);
        return;
      }
      promptLive.current = false;
      answeredEarly.current = true;
      hush();
    }
    if (id === item.answer) {
      setBusy(true);
      setPaw(null);
      setState({ [id]: "right" });
      sfx.good();
      if (item.mode === "youdo") {
        youdo.current++;
        if (misses.current === 0) firstTry.current++;
      }
      if (item.onRight) await item.onRight();
      else if (!auto) await say({ line: pickPraise() });
      await sleep(300);
      if (i + 1 < queue.length) setI(i + 1);
      else opts.onFinish(firstTry.current, youdo.current);
      return;
    }
    // wrong
    misses.current++;
    sfx.wrong();
    setBusy(true);
    setState((s) => ({ ...s, [id]: "wrong" }));
    if (misses.current === 1) {
      await say(item.listenAgain);
      setState((s) => ({ ...s, [id]: "" }));
    } else {
      // show the answer, dim the rest, and bring this item back later as "youdo"
      const dims = Object.fromEntries(item.options.filter((o) => o !== item.answer).map((o) => [o, "dim" as const]));
      setState({ ...dims, [item.answer]: "glow" });
      await say({ line: "its_this_one" });
      if (!queue.slice(i + 1).some((q) => q.answer === item.answer && q.prompt === item.prompt)) setQueue((q) => [...q, { ...item, mode: "youdo" }]);
    }
    setBusy(false);
  };

  // idle help in youdo: glow after 8 s
  useEffect(() => {
    if (busy || !item || item.mode !== "youdo") return;
    const t = setTimeout(() => setState((s) => ({ ...s, [item.answer]: "glow" })), 8000);
    return () => clearTimeout(t);
  }, [busy, i]);

  useHelp(
    (n) => {
      if (!item) return;
      if (n >= 2) setState((s) => ({ ...s, [item.answer]: "glow" }));
      say(item.prompt);
    },
    [i],
  );

  return { item, i, total: queue.length, state, paw, choose, waitTap };
}

function PickBoard({ game, kind, reveal }: { game: ReturnType<typeof usePickGame>; kind: "pic" | "tile"; reveal?: ReactNode }) {
  const { item, state, paw, choose } = game;
  if (!item) return null;
  return (
    <>
      <div key={game.i} className="row pick-row" style={{ position: "absolute", left: 150, right: 190, top: kind === "pic" ? 150 : 190, gap: 60 }}>
        {item.options.map((o) => (
          <div key={o} style={{ position: "relative" }} className="drop-in">
            {kind === "pic" ? (
              <PicCard w={o} state={state[o] ?? ""} wait={game.waitTap === o} onTap={() => choose(o)} />
            ) : (
              <Tile g={o} size={item.options.length <= 3 ? "xl" : "lg"} state={state[o] === "glow" ? "hint" : state[o] === "right" ? "right" : state[o] === "wrong" ? "wrong" : ""} onTap={() => choose(o)} className={state[o] === "dim" ? "dimmed" : ""} />
            )}
            {paw === o && <TapHint show style={{ right: -50, bottom: -50 }} />}
          </div>
        ))}
      </div>
      {reveal}
      <div style={{ position: "absolute", left: "50%", bottom: 26, translate: "-50% 0" }}>
        <RoundButton label="Hear it again" onClick={() => say(item.prompt)}><Icon.speaker /></RoundButton>
      </div>
    </>
  );
}

const stars = (first: number, youdo: number) => (youdo === 0 ? 3 : first / youdo >= 0.9 ? 3 : first / youdo >= 0.7 ? 2 : 1);

// ---------------------------------------------------------------- M1: Listening Ears (no letters)
export function ListenLevel({ level, onDone, onQuit }: LevelProps) {
  const items = useRef<PickItem[]>(
    (() => {
      const mk = (mode: Mode, answer: string, other: string, how: "word" | "slow" | "sounds"): PickItem => {
        const w = WORD_BY_TEXT[answer];
        const prompt: Say[] = how === "word" ? [{ line: "listen_tap" }, { gap: 350 }, { word: answer }] : how === "slow" ? [{ line: "listen_slow" }, { gap: 350 }, x(answer)] : [{ line: "listen_sounds" }, { gap: 350 }, { sounds: w.segs, gap: 420 }];
        return {
          mode, answer, options: shuffle([answer, other]), prompt, listenAgain: [{ line: "listen_again" }, { gap: 200 }, ...prompt.slice(2)],
          onRight: async () => {
            await say([{ line: "i_can_hear" }, { gap: 100 }, { word: answer }]);
            if (mode !== "ido") await say({ line: pickPraise() });
          },
        };
      };
      return [
        mk("ido", "pan", "pin", "word"), mk("wedo", "map", "mop", "word"), mk("youdo", "top", "tap", "word"), mk("youdo", "cat", "cot", "word"),
        mk("ido", "sun", "dog", "slow"), mk("wedo", "mat", "bus", "slow"), mk("youdo", "fan", "pig", "slow"), mk("youdo", "man", "hat", "slow"),
        mk("ido", "map", "sun", "sounds"), mk("wedo", "sun", "fan", "sounds"), mk("youdo", "fan", "mug", "sounds"), mk("youdo", "mug", "map", "sounds"),
        mk("youdo", "pan", "sun", "sounds"), mk("youdo", "pig", "mug", "sounds"),
      ];
    })(),
  ).current;
  const [started, setStarted] = useState(false);
  useEffect(() => {
    playMusic("dojo");
    preload(items.flatMap((it) => [urls.word(it.answer), `/a/x/${it.answer}.mp3`]));
    (async () => {
      await say({ line: "listen_intro" });
      setStarted(true);
    })();
    return () => hush();
  }, []);
  return started ? <ListenRun items={items} level={level} onDone={onDone} onQuit={onQuit} /> : <Frame level={level} progress={0}>{null}</Frame>;
}
function ListenRun({ items, level, onDone, onQuit }: { items: PickItem[] } & LevelProps) {
  const game = usePickGame(items, { kind: "pic", onFinish: (f, y) => onDone(stars(f, y)) });
  (window as any).__snState = { scene: "pick", next: game.item?.answer };
  return (
    <Frame level={level} progress={game.i / game.total}>
      <div className="topbar"><RoundButton sm label="map" onClick={onQuit}><Icon.home /></RoundButton></div>
      <PickBoard game={game} kind="pic" />
    </Frame>
  );
}

// ---------------------------------------------------------------- M2 First Sound + M4 Symbol Search (+ optional build)
export function FirstSoundLevel(props: LevelProps) {
  const { level } = props;
  const [phase, setPhase] = useState<"first" | "find" | "build" | "read">("first");
  const first = useRef(0);
  const youdo = useRef(0);
  const teach = (level.teach ?? []).map((g) => g.split("=")[0]);
  const sounds = teach.map(soundOf);
  const [revealWord, setRevealWord] = useState<Word | null>(null);
  const [revealShow, setRevealShow] = useState<number[]>([]);
  const introduced = useRef(new Set<string>());
  const foils = ["dog", "bus", "cup", "hat", "hen", "jam", "bed", "fox", "web", "zip", "van", "cat", "pig", "fan"];
  const items = useRef<PickItem[]>(
    (() => {
      const out: PickItem[] = [];
      // only pictures a child names with the right first sound (blind picture audit → content/pic-names.ts)
      const targets = (p: PhonemeId) => shuffle([...picWords((w) => w.segs[0].p === p && w.segs.length <= 4 && !["sh", "ch"].includes(w.segs[0].g) && !(w.segs[1] && !PHONEMES[w.segs[1].p].vowel)), ...Object.keys(ORAL_WORDS).filter((w) => ORAL_WORDS[w].first === p)].filter(picSaysFirst));
      const mk = (mode: Mode, p: PhonemeId, answer: string, other: string): PickItem => ({
        mode, answer, options: shuffle([answer, other]),
        prompt: [{ line: "first_q" }, { gap: 300 }, { sound: p }],
        listenAgain: [{ line: "listen_again" }, { gap: 150 }, WORD_BY_TEXT[answer] ? x(answer) : { word: answer }, { gap: 250 }, { line: "first_q" }, { gap: 200 }, { sound: p }],
        onRight: async () => {
          const g = teach[sounds.indexOf(p)];
          // picture-only words (apple, astronaut…) have no spelling data: show just the first sound's spelling
          const w = WORD_BY_TEXT[answer] ?? ({ text: answer, segs: [{ g, p }] } as unknown as Word);
          setRevealWord(w);
          setRevealShow([]);
          await say([{ word: answer }, { gap: 100 }, { line: "starts_with" }, { gap: 100 }, { sound: p }]);
          setRevealShow([0]);
          if (!introduced.current.has(g) || mode !== "youdo") {
            introduced.current.add(g);
            await say([{ line: "how_we_spell" }, { gap: 150 }, { sound: p }]);
          }
          await sleep(500);
          setRevealWord(null);
        },
      });
      for (const p of sounds) {
        const t = targets(p);
        const f = shuffle(foils.filter((w) => picSaysFirst(w) && !firstIs(w, p) && !sounds.includes(WORD_BY_TEXT[w].segs[0].p)));
        out.push(mk("ido", p, t[0], f[0]), mk("wedo", p, t[1 % t.length], f[1]), mk("youdo", p, t[2 % t.length], f[2]), mk("youdo", p, t[3 % t.length], f[3]));
      }
      if (sounds.length > 1) {
        // head to head
        const [a, b] = sounds;
        const ta = targets(a), tb = targets(b);
        for (let k = 0; k < 4; k++) {
          const p = k % 2 ? b : a;
          out.push(mk("youdo", p, (p === a ? ta : tb)[(k + 4) % (p === a ? ta : tb).length], (p === a ? tb : ta)[k % (p === a ? tb : ta).length]));
        }
      }
      return out;
    })(),
  ).current;
  const known = [...knownSpellings(level)].filter((g) => g.length === 1);
  const findItems = useRef<PickItem[]>(
    (() => {
      const out: PickItem[] = [];
      const pool = [...new Set([...teach, ...shuffle(known.filter((g) => !teach.includes(g)))])];
      for (let k = 0; k < 4; k++) {
        const g = teach[k % teach.length];
        const n = teach.length > 1 ? 2 : 2;
        const opts = shuffle([g, ...shuffle(pool.filter((o) => o !== g)).slice(0, n - 1 + (k > 1 && pool.length > 2 ? 1 : 0))]);
        out.push({ mode: "youdo", answer: g, options: opts, prompt: [{ line: "find_q" }, { gap: 300 }, { sound: soundOf(g) }], listenAgain: [{ line: "listen_again" }, { gap: 150 }, { sound: soundOf(g) }] });
      }
      return out;
    })(),
  ).current;

  useEffect(() => {
    playMusic("dojo");
    say({ line: "first_intro" });
    return () => hush();
  }, []);

  const tally = (f: number, y: number) => {
    first.current += f;
    youdo.current += y;
  };
  const finishAll = () => props.onDone(stars(first.current, youdo.current));

  return (
    <Frame level={level} range={phase === "first" ? [0, 0.5] : phase === "find" ? [0.5, 0.75] : [0.75, 1]}>
      <div className="topbar"><RoundButton sm label="map" onClick={props.onQuit}><Icon.home /></RoundButton></div>
      {phase === "first" && (
        <DelayedPick items={items} kind="pic" delay={3200} onFinish={(f, y) => { tally(f, y); setPhase("find"); }} reveal={<div style={{ position: "absolute", left: 0, right: 0, top: 448 }}><SoundLines word={revealWord} show={revealShow} /></div>} />
      )}
      {phase === "find" && <DelayedPick items={findItems} kind="tile" delay={0} onFinish={(f, y) => { tally(f, y); level.words?.length ? setPhase("build") : finishAll(); }} />}
      {phase === "build" && <BuildSequence level={level} words={level.words!} onFinish={(f, y) => { tally(f, y); finishAll(); }} />}
    </Frame>
  );
}

function DelayedPick({ items, kind, delay, onFinish, reveal }: { items: PickItem[]; kind: "pic" | "tile"; delay: number; onFinish: (f: number, y: number) => void; reveal?: ReactNode }) {
  const [go, setGo] = useState(delay === 0);
  useEffect(() => {
    if (delay) {
      const t = setTimeout(() => setGo(true), delay);
      return () => clearTimeout(t);
    }
  }, []);
  return go ? <PickInner items={items} kind={kind} onFinish={onFinish} reveal={reveal} /> : null;
}
function PickInner({ items, kind, onFinish, reveal }: { items: PickItem[]; kind: "pic" | "tile"; onFinish: (f: number, y: number) => void; reveal?: ReactNode }) {
  const game = usePickGame(items, { kind, onFinish });
  (window as any).__snState = { scene: "pick", next: game.item?.answer };
  return <PickBoard game={game} kind={kind} reveal={reveal} />;
}

// ---------------------------------------------------------------- M3 Sound Hunt (middle sound) → build → read
export function SoundHuntLevel(props: LevelProps) {
  const { level } = props;
  const g = (level.teach ?? ["i"])[0];
  const p = soundOf(g);
  const [phase, setPhase] = useState<"hunt" | "build" | "read">("hunt");
  const [revealWord, setRevealWord] = useState<Word | null>(null);
  const [revealShow, setRevealShow] = useState<number[]>([]);
  const first = useRef(0);
  const youdo = useRef(0);
  const PAIRS: Record<string, [string, string][]> = {
    // every picture here passed the blind picture audit (children name it as the word): no fin→"shark", wig→"hair", hot→"soup"
    i: [["pin", "pan"], ["tin", "tap"], ["zip", "jam"], ["lid", "mat"], ["pig", "cat"], ["bib", "bat"], ["bin", "bag"]],
    o: [["mop", "map"], ["top", "tap"], ["pot", "pan"], ["cot", "cat"], ["rod", "jam"], ["dog", "bag"], ["fox", "fan"]],
  };
  const pairs = PAIRS[g] ?? PAIRS.i;
  const items = useRef<PickItem[]>(
    pairs.map(([ans, other], k): PickItem => ({
      mode: k === 0 ? "ido" : k < 3 ? "wedo" : "youdo",
      answer: ans, options: shuffle([ans, other]),
      prompt: [{ line: "hunt_q" }, { gap: 250 }, { sound: p }, { gap: 350 }, x(ans), { gap: 350 }, x(other)],
      listenAgain: [{ line: "listen_again" }, { gap: 150 }, x(ans), { gap: 300 }, x(other)],
      onRight: async () => {
        const w = WORD_BY_TEXT[ans];
        setRevealWord(w);
        setRevealShow([]);
        await say([{ word: ans }, { gap: 100 }, { line: "has_in_middle" }, { gap: 100 }, { sound: p }]);
        setRevealShow([w.segs.findIndex((s, i) => i > 0 && s.p === p)]);
        if (k < 3) await say([{ line: "how_we_spell" }, { gap: 150 }, { sound: p }]);
        await sleep(500);
        setRevealWord(null);
      },
    })),
  ).current;
  useEffect(() => {
    playMusic("dojo");
    say({ line: "hunt_intro" });
    return () => hush();
  }, []);
  void hasMiddle;
  const tally = (f: number, y: number) => ((first.current += f), (youdo.current += y));
  const finishAll = () => props.onDone(stars(first.current, youdo.current));
  return (
    <Frame level={level} range={phase === "hunt" ? [0, 0.4] : phase === "build" ? [0.4, 0.8] : [0.8, 1]}>
      <div className="topbar"><RoundButton sm label="map" onClick={props.onQuit}><Icon.home /></RoundButton></div>
      {phase === "hunt" && (
        <DelayedPick items={items} kind="pic" delay={3000} onFinish={(f, y) => { tally(f, y); setPhase(level.words?.length ? "build" : "read"); }} reveal={<div style={{ position: "absolute", left: 0, right: 0, top: 448 }}><SoundLines word={revealWord} show={revealShow} /></div>} />
      )}
      {phase === "build" && <BuildSequence level={level} words={level.words!} onFinish={(f, y) => { tally(f, y); level.read?.length ? setPhase("read") : finishAll(); }} />}
      {phase === "read" && level.read && <ReadCheck pairs={level.read} onFinish={(f, y) => { tally(f, y); finishAll(); }} />}
    </Frame>
  );
}

// ---------------------------------------------------------------- Dojo: M5 build (gradual release) → M6 read
export function EarlyDojo(props: LevelProps) {
  const { level } = props;
  const [phase, setPhase] = useState<"build" | "read">("build");
  const first = useRef(0);
  const youdo = useRef(0);
  useEffect(() => {
    playMusic("dojo");
    return () => hush();
  }, []);
  const tally = (f: number, y: number) => ((first.current += f), (youdo.current += y));
  return (
    <Frame level={level} range={phase === "build" ? [0, 0.7] : [0.7, 1]}>
      <div className="topbar"><RoundButton sm label="map" onClick={props.onQuit}><Icon.home /></RoundButton></div>
      {phase === "build" && <BuildSequence level={level} words={level.words!} intro onFinish={(f, y) => { tally(f, y); level.read?.length ? setPhase("read") : props.onDone(stars(first.current, youdo.current)); }} />}
      {phase === "read" && level.read && <ReadCheck pairs={level.read} onFinish={(f, y) => { tally(f, y); props.onDone(stars(first.current, youdo.current)); }} />}
    </Frame>
  );
}

interface BuildItem { word: Word; mode: Mode; extra: number }
/** Word building with gradual release: I do the first word, we do the next two, then you do. */
export function BuildSequence({ level, words, onFinish, intro }: { level: Level; words: string[]; onFinish: (f: number, y: number) => void; intro?: boolean }) {
  const seq = useRef<BuildItem[]>(
    (() => {
      const ws = words.map((w) => WORD_BY_TEXT[w]).filter(Boolean);
      const out: BuildItem[] = [{ word: ws[0], mode: "ido", extra: 0 }, { word: ws[0], mode: "wedo", extra: 0 }];
      if (ws[1]) out.push({ word: ws[1], mode: "wedo", extra: 0 });
      const you = [...ws, ...ws.slice().reverse()].slice(0, Math.max(4, ws.length));
      you.forEach((w, k) => out.push({ word: w, mode: "youdo", extra: k < 2 ? 0 : 1 }));
      return out;
    })(),
  ).current;
  const [k, setK] = useState(-1);
  const first = useRef(0);
  const youdo = useRef(0);
  useReportProgress(Math.max(0, k) / seq.length);
  useEffect(() => {
    (async () => {
      if (intro) await say({ line: seq[0].word.segs.length === 2 ? "two_sounds" : "three_sounds" });
      setK(0);
    })();
  }, []);
  if (k < 0) return null;
  const it = seq[k];
  return (
    <BuildOne
      key={k}
      level={level}
      item={it}
      announce={k === 0 ? "ido" : seq[k - 1].mode !== it.mode ? it.mode : null}
      onDone={(firstTry) => {
        if (it.mode === "youdo") {
          youdo.current++;
          if (firstTry) first.current++;
        }
        if (k + 1 < seq.length) setK(k + 1);
        else onFinish(first.current, youdo.current);
      }}
    />
  );
}

function BuildOne({ level, item, announce, onDone }: { level: Level; item: BuildItem; announce: Mode | null; onDone: (firstTry: boolean) => void }) {
  const { word, mode, extra } = item;
  const known = [...knownSpellings(level)];
  const need = word.segs.map((s) => s.g);
  const [bank] = useState(() => shuffle([...need, ...shuffle(known.filter((g) => !need.includes(g) && g.length === 1)).slice(0, extra)]));
  const [filled, setFilled] = useState<string[]>([]);
  const [lit, setLit] = useState(-1);
  const [glow, setGlow] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [paw, setPaw] = useState<string | null>(null);
  const misses = useRef(0);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slotQ = (i: number) => (i === 0 ? "first_sound_q" : i === word.segs.length - 1 ? "last_sound_q" : "next_sound_q");

  const ask = async (i: number) => {
    setLit(i);
    await say([{ line: slotQ(i) }, { gap: 200 }, x(word.text)]);
    if (mode === "wedo") setGlow(word.segs[i].g);
  };

  const finishWord = async () => {
    setBusy(true);
    setLit(-1);
    await sleep(300);
    await say({ line: "say_sounds_read" });
    for (let i = 0; i < word.segs.length; i++) {
      setLit(i);
      await say({ sound: word.segs[i].p });
      await sleep(250);
    }
    setLit(-1);
    await sleep(900); // time for the child to read it aloud
    await say({ word: word.text });
    sfx.great();
    fx.burst(640, 330, "petals", 18);
    recordWordSpelt(word, misses.current === 0);
    if (mode !== "ido") await say({ line: pickPraise() });
    onDone(misses.current === 0);
  };

  useEffect(() => {
    (async () => {
      const pre: Say[] = [];
      if (announce) pre.push({ line: announce }, { gap: 250 });
      if (mode === "ido") {
        await say([...pre, { line: "build_ido_1" }, { gap: 200 }, { word: word.text }, { gap: 350 }, { line: "build_ido_2" }, { gap: 200 }, x(word.text), { gap: 300 }, { line: "build_ido_3" }]);
        for (let i = 0; i < word.segs.length; i++) {
          setLit(i);
          await say(x(word.text));
          setPaw(word.segs[i].g);
          await sleep(700);
          setPaw(null);
          setFilled((f) => [...f, word.segs[i].g]);
          sfx.place();
          await say({ sound: word.segs[i].p });
          await sleep(300);
        }
        await finishWord();
        return;
      }
      await say([...pre, { word: word.text }]);
      await ask(0);
      setBusy(false);
    })();
  }, []);

  const tap = async (g: string) => {
    if (busy) return;
    const i = filled.length;
    const need = word.segs[i];
    if (g === need.g) {
      recordSpell(need, misses.current === 0);
      setGlow(null);
      const f = [...filled, g];
      setFilled(f);
      sfx.place();
      const xy = stageXY(slotRefs.current[i]);
      fx.burst(xy.x, xy.y, "sparks", 10);
      setBusy(true);
      await say({ sound: need.p });
      if (f.length === word.segs.length) return finishWord();
      await ask(f.length);
      setBusy(false);
    } else {
      misses.current++;
      recordSpell(need, false);
      setWrong(g);
      sfx.wrong();
      setBusy(true);
      // never segment for the child: stretch the word and point at the slot; 2nd miss shows the answer
      if (misses.current % 2 === 1) await say([{ line: "listen_here" }, { gap: 200 }, x(word.text)]);
      else {
        setGlow(need.g);
        await say({ line: "its_this_one" });
      }
      setWrong(null);
      setBusy(false);
    }
  };
  (window as any).__snState = { scene: "build", next: busy ? null : word.segs[filled.length]?.g };
  useHelp(
    (n) => {
      if (n >= 2) setGlow(word.segs[filled.length]?.g ?? null);
      say([{ line: "listen_here" }, { gap: 150 }, x(word.text)]);
    },
    [filled.length],
  );

  return (
    <>
      <WordCard word={word} className="pop-in" onHear={() => say(x(word.text))} style={word.pic ? { left: 520, top: 70, width: 240, height: 190 } : { left: 540, top: 80, width: 200, height: 170 }} />
      <div className="slots" style={{ position: "absolute", left: 0, right: 0, top: 300 }}>
        {word.segs.map((_, i) => (
          <div key={i} ref={(el) => void (slotRefs.current[i] = el)} className={`slot ${i < filled.length ? "filled" : lit === i ? "active" : ""}`} style={{ position: "relative" }}>
            {i < filled.length && <Tile g={filled[i]} className="pop-in" withButtons lit={lit === i} />}
            {lit === i && i >= filled.length && <span className="slot-arrow" />}
          </div>
        ))}
      </div>
      <div className="row" style={{ position: "absolute", left: 200, right: 200, bottom: 30, gap: 18 }}>
        {bank.map((g, j) => {
          const usedCount = filled.filter((f) => f === g).length;
          const needCount = need.filter((n) => n === g).length;
          const gone = usedCount >= Math.max(1, needCount) && needCount > 0;
          return (
            <div key={g + j} style={{ position: "relative" }}>
              <Tile g={g} size="lg" state={gone ? "used" : wrong === g ? "wrong" : glow === g ? "hint" : ""} onTap={() => tap(g)} />
              {paw === g && <TapHint show style={{ right: -50, bottom: -50 }} />}
            </div>
          );
        })}
      </div>
      {word.pic && (
        <div style={{ position: "absolute", left: 800, top: 130 }}>
          <RoundButton sm label="Hear the word" onClick={() => say(x(word.text))}><Icon.speaker /></RoundButton>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------- M6: Who read it right?
export function ReadCheck({ pairs, onFinish }: { pairs: [string, string][]; onFinish: (f: number, y: number) => void }) {
  const [k, setK] = useState(-1);
  const first = useRef(0);
  useReportProgress(Math.max(0, k) / pairs.length);
  useEffect(() => {
    (async () => {
      await say({ line: "read_intro" });
      setK(0);
    })();
  }, []);
  if (k < 0) return null;
  const [right, wrongW] = pairs[k];
  return (
    <ReadOne
      key={k}
      right={WORD_BY_TEXT[right]}
      wrong={WORD_BY_TEXT[wrongW]}
      onDone={(ok) => {
        if (ok) first.current++;
        if (k + 1 < pairs.length) setK(k + 1);
        else onFinish(first.current, pairs.length);
      }}
    />
  );
}
function ReadOne({ right, wrong, onDone }: { right: Word; wrong: Word; onDone: (firstTry: boolean) => void }) {
  const [tapped, setTapped] = useState<number[]>([]);
  const [lit, setLit] = useState(-1);
  const [readers] = useState(() => shuffle([{ who: "kai", word: right }, { who: "suki", word: wrong }]));
  const [heard, setHeard] = useState(false);
  const [state, setState] = useState<Record<string, string>>({});
  const misses = useRef(0);
  const busy = useRef(false);
  useEffect(() => {
    say({ line: "read_tap_sounds" });
  }, []);
  const tapSound = async (i: number) => {
    setLit(i);
    await say({ sound: right.segs[i].p });
    setLit(-1);
    const t = [...new Set([...tapped, i])];
    setTapped(t);
    if (t.length === right.segs.length && !heard) {
      await sleep(600);
      await say({ line: "read_who" });
      for (const r of readers) {
        setTalking(r.who);
        await say([{ line: r.who === "kai" ? "kai_says" : "suki_says" }, { gap: 100 }, { word: r.word.text }]);
        await sleep(250);
      }
      setTalking(null);
      setHeard(true);
    }
  };
  const [talking, setTalking] = useState<string | null>(null);
  const pickReader = async (who: string) => {
    if (!heard || busy.current) return;
    const r = readers.find((x) => x.who === who)!;
    busy.current = true;
    if (r.word === right) {
      setState({ [who]: "right" });
      sfx.good();
      recordRead(right, misses.current === 0);
      await say([{ sounds: right.segs, gap: 250 }, { word: right.text }, { gap: 150 }, { line: pickPraise() }]);
      onDone(misses.current === 0);
      return;
    }
    misses.current++;
    setState({ [who]: "wrong" });
    sfx.wrong();
    // correct at the exact place: "If it was sit, this would be /i/. Is it? No! It's /a/."
    const d = right.segs.findIndex((s, i) => wrong.segs[i]?.p !== s.p);
    setLit(d);
    await say([{ line: "if_it_was" }, { gap: 100 }, { word: wrong.text }, { gap: 150 }, { line: "this_would_be" }, { gap: 100 }, { sound: wrong.segs[d]?.p ?? right.segs[d].p }, { gap: 200 }, { line: "is_it_no" }, { gap: 100 }, { sound: right.segs[d].p }], { reveal: true });
    setLit(-1);
    setState({});
    busy.current = false;
  };
  (window as any).__snState = { scene: "read", next: heard ? readers.find((r) => r.word === right)!.who : null, tapIdx: tapped.length < right.segs.length ? right.segs.findIndex((_, i) => !tapped.includes(i)) : null };
  return (
    <>
      <div className="row" style={{ position: "absolute", left: 0, right: 0, top: 110, gap: 12 }}>
        {right.segs.map((s, i) => (
          <button key={i} aria-label={`sound ${i}`} className={`tile lg ${lit === i ? "hint" : tapped.includes(i) ? "right" : ""}`} {...tapProps(() => tapSound(i))}>
            <span className="g">{s.g}</span>
            <span className={`sb ${s.g.length > 1 ? "bar" : "dot"} ${lit === i ? "lit" : ""}`} />
          </button>
        ))}
      </div>
      {/* the readers wait (soft grey) while the child taps the sounds; whoever is reading lights up */}
      <div className="row" style={{ position: "absolute", left: 150, right: 200, top: 320, gap: 90 }}>
        {readers.map((r) => (
          <button key={r.who} aria-label={`reader ${r.who}`} className={`reader ${state[r.who] ?? ""} ${talking === r.who ? "talking" : !heard && talking !== r.who ? "waiting" : ""}`} {...tapProps(() => pickReader(r.who))}>
            <img src={heroImg(r.who, "idle")} alt="" />
          </button>
        ))}
      </div>
    </>
  );
}
