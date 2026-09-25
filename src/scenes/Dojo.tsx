// Dojo: learn new sounds (spelling → sound), find the sound, then build words (segmenting + spelling).
// Slow, calm, no timers. Follows: say the word → say the sounds → build it → read it back.
import { useEffect, useRef, useState } from "react";
import type { LevelProps } from "../App";
import { GRAPHEMES, teachEntry, type Word, type Seg } from "../content/phonics";
import { knownSpellings } from "../content/worlds";
import { say, sayBlend, sfx, playMusic, preload, urls } from "../engine/audio";
import { chooseWords, tileBank, shuffle } from "../engine/learner";
import { recordSpell, recordWordSpelt, store } from "../engine/store";
import { SenseiDock, Tile, img, RoundButton, Icon, Progress, fx, stageXY, sleep, heroImg, useHero, useIdlePrompt, TapHint, tapProps, useHelp, WordCard } from "../ui/ui";

type Phase = { k: "learn"; i: number } | { k: "find"; i: number } | { k: "build"; i: number } | { k: "done" };

export function Dojo({ level, onDone, onQuit }: LevelProps) {
  const teach = (level.teach ?? []).map(teachEntry);
  const hero = useHero();
  const words = useRef<Word[]>(chooseWords(level, 5, "spell", { maxLen: level.units.some((u) => u >= 10) ? 5 : 4 })).current;
  const [phase, setPhase] = useState<Phase>(teach.length ? { k: "learn", i: 0 } : { k: "build", i: 0 });
  const mistakes = useRef(0);
  const total = teach.length * 2 + words.length;
  const doneCount = phase.k === "learn" ? phase.i : phase.k === "find" ? teach.length + phase.i : phase.k === "build" ? teach.length * 2 + phase.i : total;

  useEffect(() => {
    playMusic("dojo");
    preload([...teach.map((t) => urls.sound(t.p)), ...words.map((w) => urls.word(w.text))]);
  }, []);

  const next = () => {
    setPhase((p) => {
      if (p.k === "learn") return p.i + 1 < teach.length ? { k: "learn", i: p.i + 1 } : { k: "find", i: 0 };
      if (p.k === "find") return p.i + 1 < teach.length ? { k: "find", i: p.i + 1 } : { k: "build", i: 0 };
      if (p.k === "build") return p.i + 1 < words.length ? { k: "build", i: p.i + 1 } : { k: "done" };
      return p;
    });
  };

  useEffect(() => {
    if (phase.k === "done") {
      (async () => {
        await say({ line: "dojo_done" });
        const m = mistakes.current;
        onDone(m <= 1 ? 3 : m <= 4 ? 2 : 1);
      })();
    }
  }, [phase.k]);

  return (
    <div className="scene">
      <img className="bg-img" src={img("dojo_bg")} alt="" />
      <div className="vignette" />
      <div className="topbar">
        <RoundButton sm label="map" onClick={onQuit}><Icon.home /></RoundButton>
        <div className="spacer" />
        <Progress value={doneCount / total} />
        <div className="spacer" />
        <div style={{ width: 68 }} />
      </div>
      <img className="sprite breathe" src={heroImg(hero, "idle")} alt="" style={{ right: 20, bottom: 10, width: 190, zIndex: 2 }} />
      {phase.k === "learn" && (
        <Learn
          key={`l${phase.i}`}
          t={teach[phase.i]}
          first={phase.i === 0}
          onNext={next}
          alsoSpelt={[...knownSpellings(level)].some((k) => k !== teach[phase.i].g && GRAPHEMES[k] === teach[phase.i].p && !teach.slice(phase.i).some((x) => x.g === k))}
        />
      )}
      {phase.k === "find" && <Find key={`f${phase.i}`} t={teach[phase.i]} pool={[...knownSpellings(level)]} onNext={next} onMiss={() => mistakes.current++} />}
      {phase.k === "build" && (
        <Build key={`b${phase.i}`} word={words[phase.i]} bank={tileBank(words[phase.i], level, 2)} first={phase.i === 0} longer={!teach.length} onNext={next} onMiss={() => mistakes.current++} />
      )}
      <SenseiDock />
    </div>
  );
}

function Learn({ t, first, onNext, alsoSpelt }: { t: Seg; first: boolean; onNext: () => void; alsoSpelt?: boolean }) {
  const { g, p } = t;
  const [taps, setTaps] = useState(0);
  const [shown, setShown] = useState(false);
  const [hint, setHint] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => setHint(true), 6500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    (async () => {
      // sound first: hear it (twice), then see how we write it
      const intro: any[] = [];
      if (first) intro.push({ line: "dojo_hello" }, { gap: 250 });
      intro.push({ line: "listen" }, { gap: 150 }, { sound: p }, { gap: 500 }, { sound: p }, { gap: 400 });
      await say(intro);
      setShown(true);
      sfx.pop();
      const seq: any[] = [{ line: "dojo_this_sound" }, { gap: 150 }, { sound: p }, { gap: 300 }];
      if (alsoSpelt) seq.push({ line: "same_sound_new" }, { gap: 200 });
      else if (g.length === 2) seq.push({ line: "two_letters_one_sound" }, { gap: 200 });
      if (g.length === 3) seq.push({ line: "three_letters_one_sound" }, { gap: 200 });
      seq.push({ line: "dojo_tap_say" });
      await say(seq);
    })();
  }, []);
  useIdlePrompt(taps < 2, 8000, () => say([{ line: "dojo_tap_say" }]));
  useHelp((n) => say(shown ? [{ sound: p }, { gap: 150 }, { line: "dojo_tap_say" }] : [{ line: "listen" }, { sound: p }]).then(() => n > 1 && setHint(true)));
  const tap = async () => {
    if (!shown) return;
    const n = taps + 1;
    setTaps(n);
    const xy = stageXY(ref.current);
    fx.burst(xy.x, xy.y, "petals", 10);
    await say({ sound: p });
    if (n >= 2) {
      sfx.good();
      await say({ line: pickPraise() });
      onNext();
    }
  };
  (window as any).__snState = { scene: "learn", next: shown ? g : null };
  return (
    <div className="center pop-in" style={{ top: "46%" }} ref={ref}>
      {shown ? (
        <Tile g={g} size="xl" onTap={tap} className={`pop-in ${taps < 2 ? "hint" : "right"}`} />
      ) : (
        <button className="btn-round pulse" aria-label="Hear the sound" {...tapProps(() => say({ sound: p }))} style={{ width: 230, height: 230 }}>
          <Icon.ear />
        </button>
      )}
      <TapHint show={hint && taps === 0} style={{ right: -60, bottom: 20 }} />
      <div className="row" style={{ marginTop: 28 }}>
        {[0, 1].map((i) => (
          <img key={i} src={img("item_petal")} alt="" style={{ width: 54, opacity: i < taps ? 1 : 0.25, transition: "opacity .2s", filter: i < taps ? "none" : "grayscale(1)" }} />
        ))}
      </div>
    </div>
  );
}

function Find({ t, pool, onNext, onMiss }: { t: Seg; pool: string[]; onNext: () => void; onMiss: () => void }) {
  const { g, p } = t;
  const choices = useRef(shuffle([g, ...shuffle(pool.filter((x) => x !== g && GRAPHEMES[x] !== p && !(g === "u" && x === "w"))).slice(0, 3)])).current;
  const [state, setState] = useState<Record<string, "wrong" | "right">>({});
  const prompt = () => say([{ line: "dojo_find" }, { gap: 450 }, { sound: p }]);
  useEffect(() => void prompt(), []);
  const [helpLvl, setHelpLvl] = useState(0);
  useHelp((n) => {
    setHelpLvl(n);
    say(n >= 2 ? [{ line: "help_look" }, { gap: 100 }, { sound: p }] : [{ line: "dojo_find" }, { gap: 450 }, { sound: p }, { gap: 200 }, { line: "help_listen" }]);
  });
  useIdlePrompt(true, 9000, prompt);
  const tap = async (c: string, el: HTMLElement) => {
    if (state[g]) return;
    if (c === g) {
      setState((s) => ({ ...s, [c]: "right" }));
      sfx.good();
      const xy = stageXY(el);
      fx.burst(xy.x, xy.y, "stars", 16);
      await say([{ sound: p }, { gap: 150 }, { line: pickPraise() }]);
      onNext();
    } else {
      onMiss();
      setState((s) => ({ ...s, [c]: "wrong" }));
      sfx.wrong();
      await say([{ line: "thats" }, { sound: GRAPHEMES[c] }, { gap: 200 }, { line: "listen" }, { sound: p }], { reveal: true });
      setState((s) => {
        const n = { ...s };
        delete n[c];
        return n;
      });
    }
  };
  (window as any).__snState = { scene: "find", next: g };
  return (
    <>
      <div className="center" style={{ top: "44%" }}>
        <div className="row" style={{ gap: 30, flexWrap: "nowrap" }}>
          {choices.map((c, i) => (
            <div key={c} className="drop-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <Tile g={c} size="lg" state={state[c] ?? (helpLvl >= 2 && c === g ? "hint" : "")} onTap={(el) => tap(c, el)} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: "50%", bottom: 60, translate: "-50% 0" }}>
        <RoundButton label="Hear it again" onClick={prompt}><Icon.speaker /></RoundButton>
      </div>
    </>
  );
}

/** Word building: hear the word, build it sound by sound in slots, then read it back with sound buttons lit. */
export function Build({ word, bank: bankIn, first, onNext, onMiss, longer }: { word: Word; bank: string[]; first: boolean; onNext: () => void; onMiss: () => void; longer?: boolean }) {
  const bank = useRef(bankIn).current;
  const [filled, setFilled] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [lit, setLit] = useState(-1);
  const [done, setDone] = useState(false);
  const misses = useRef(0);
  const slotMisses = useRef(0); // misses on the current slot: 1st → listen again, 2nd → show
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prompt = async (intro = false) => {
    const seq: any[] = [];
    if (intro && first) seq.push({ line: longer ? "dojo_longer" : "dojo_build" }, { gap: 200 });
    if (intro && first) seq.push({ line: "dojo_build_word" }, { gap: 500 });
    seq.push({ word: word.text });
    await say(seq);
  };
  useEffect(() => void prompt(true), []);
  useIdlePrompt(!done, 9000, () => say([{ line: "which_sound" }, { gap: 100 }, { word: word.text }]));
  const [helpLvl, setHelpLvl] = useState(0);
  useEffect(() => setHelpLvl(0), [filled.length]);
  useHelp(
    (n) => {
      setHelpLvl(n);
      if (n === 1) say([{ word: word.text }, { gap: 350 }, { line: "help_tiles" }]);
      else if (n === 2) say([{ line: "say_sounds" }, { sounds: word.segs, gap: 300 }, { word: word.text }]);
      else say([{ line: "help_look" }, { gap: 100 }, { sound: word.segs[filled.length]?.p ?? word.segs[0].p }], { reveal: true });
    },
    [filled.length],
  );

  const tap = async (g: string) => {
    if (done) return;
    const i = filled.length;
    const need = word.segs[i];
    if (g === need.g) {
      slotMisses.current = 0;
      recordSpell(need, misses.current === 0);
      const f = [...filled, g];
      setFilled(f);
      sfx.place();
      const xy = stageXY(slotRefs.current[i]);
      fx.burst(xy.x, xy.y, "sparks", 10);
      say({ sound: need.p });
      if (f.length === word.segs.length) {
        setDone(true);
        recordWordSpelt(word, misses.current === 0);
        await sleep(500);
        await sayBlend(word.segs, word.text, setLit);
        setLit(-1);
        sfx.great();
        fx.burst(640, 300, "petals", 24);
        await say({ line: pickPraise() });
        onNext();
      }
    } else {
      misses.current++;
      onMiss();
      recordSpell(need, false);
      setWrong(g);
      sfx.wrong();
      slotMisses.current++;
      await say(correction(g, need, word.text, slotMisses.current), { reveal: slotMisses.current > 1 });
      setWrong(null);
    }
  };

  const used = [...filled];
  (window as any).__snState = { scene: "build", next: word.segs[filled.length]?.g, word: word.text };
  return (
    <>
      <WordCard word={word} className="pop-in" onHear={() => prompt()} style={{ left: 490, top: 92, width: 300, height: 230 }} />
      {word.pic && (
        <div style={{ position: "absolute", left: 810, top: 160 }}>
          <RoundButton sm label="Hear the word" onClick={() => prompt()}><Icon.speaker /></RoundButton>
        </div>
      )}
      <div className="slots" style={{ position: "absolute", left: 0, right: 0, top: 360 }}>
        {word.segs.map((_, i) => (
          <div key={i} ref={(el) => void (slotRefs.current[i] = el)} className={`slot ${i < filled.length ? "filled" : i === filled.length && !done ? "active" : ""}`}>
            {i < filled.length && <Tile g={filled[i]} className={`pop-in ${done ? "right" : ""}`} withButtons={done} lit={lit === i} />}
          </div>
        ))}
      </div>
      <div className="row" style={{ position: "absolute", left: 200, right: 200, bottom: 34, gap: 16 }}>
        {bank.map((g) => {
          const idx = used.indexOf(g);
          if (idx >= 0) used.splice(idx, 1);
          const isUsed = idx >= 0 && !word.segs.slice(filled.length).some((s) => s.g === g);
          return <Tile key={g} g={g} state={wrong === g ? "wrong" : isUsed ? "used" : (misses.current >= 2 || helpLvl >= 3) && g === word.segs[filled.length]?.g ? "hint" : ""} onTap={() => tap(g)} />;
        })}
      </div>
    </>
  );
}

/** Correction, the Sounds~Write way (docs/PEDAGOGY.md): never do the segmenting for the child.
 *  1st miss → back to listening: hear the word again, stretched (the active slot is already pulsing).
 *  2nd miss → show: "That's /s/. We need /m/." (callers also glow the right tile).
 *  Same sound but another spelling → say so; that's about spelling, not listening. */
export function correction(g: string, need: Seg, word: string, attempt: number): any[] {
  if (GRAPHEMES[g] === need.p) return [{ line: "same_sound_spelling" }, { gap: 100 }, { sound: need.p }];
  if (attempt <= 1) return [{ line: "listen_here" }, { gap: 150 }, { stretch: word }];
  return [{ line: "thats" }, { sound: GRAPHEMES[g] }, { gap: 200 }, { line: "we_need" }, { sound: need.p }];
}

const praise = ["yay_1", "yay_2", "yay_3", "yay_4", "yay_5", "yay_6", "yay_9", "yay_10"];
export function pickPraise() {
  return praise[Math.floor(Math.random() * praise.length)];
}
export { store };
