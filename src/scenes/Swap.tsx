// Sound Swap: Baron Muddle has muddled the words. Change ONE sound to make the next word (hat → hot → hop …).
// Tap the tile that must change, then choose the new spelling. Trains phoneme manipulation.
import { useEffect, useRef, useState } from "react";
import type { LevelProps } from "../App";
import type { Word } from "../content/phonics";
import { knownSpellings, worldOf } from "../content/worlds";
import { say, sayBlend, sfx, playMusic, preload, urls, hush } from "../engine/audio";
import { swapChain, shuffle } from "../engine/learner";
import { WORD_BY_TEXT, GRAPHEMES } from "../content/phonics";

function fixedChain(ws: string[]) {
  const w = ws.map((t) => WORD_BY_TEXT[t]);
  // only single-sound swaps (same number of sounds); a length change starts a new mini-chain
  return w
    .slice(1)
    .map((to, i) => ({ from: w[i], to, pos: to.segs.findIndex((s, k) => s.g !== w[i].segs[k]?.g) }))
    .filter((c) => c.from.segs.length === c.to.segs.length && c.pos >= 0);
}
import { recordRead, recordSpell } from "../engine/store";
import { SenseiDock, Tile, img, RoundButton, Icon, Progress, fx, stageXY, sleep, useHelp, useBaronOnScreen, WordCard } from "../ui/ui";
import { pickPraise, correction } from "./Dojo";

export function Swap({ level, onDone, onQuit }: LevelProps) {
  const world = worldOf(level);
  const chain = useRef(level.chain ? fixedChain(level.chain) : swapChain(level, 5)).current;
  const early = !!level.chain;
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongPos, setWrongPos] = useState<number | null>(null);
  const [wrongG, setWrongG] = useState<string | null>(null);
  const [shown, setShown] = useState<Word>(chain[0]?.from);
  const [morph, setMorph] = useState(false);
  const [lit, setLit] = useState(-1);
  const [busy, setBusy] = useState(true);
  const misses = useRef(0);
  const stepMisses = useRef(0);
  const s = chain[step];
  useBaronOnScreen();

  const options = useRef<Record<number, string[]>>({});
  if (s && !options.current[step]) {
    const known = [...knownSpellings(level)];
    const need = s.to.segs[s.pos].g;
    const old = s.from.segs[s.pos].g;
    const vowelSlot = !!s.to.segs[s.pos] && ["a", "e", "i", "o", "u", "ai", "ay", "ee", "ea", "igh", "ie", "oa", "ow"].includes(need);
    const same = known.filter((g) => g !== need && g !== old && (["a", "e", "i", "o", "u", "ai", "ay", "ee", "ea", "igh", "ie", "oa", "ow"].includes(g) === vowelSlot));
    options.current[step] = shuffle([need, ...shuffle(same).slice(0, early ? 1 : 3)]);
  }

  useEffect(() => {
    playMusic(world.music);
    preload(chain.flatMap((c) => [urls.word(c.from.text), urls.word(c.to.text)]));
    (async () => {
      await say([{ line: "swap_start" }, { gap: 200 }, { line: "this_is" }, { word: chain[0].from.text }]);
      await ask(0);
    })();
    return () => hush();
  }, []);

  const ask = async (i: number) => {
    setBusy(true);
    const c = chain[i];
    if (i > 0) {
      setShown(c.from);
      if (c.from !== chain[i - 1].to) await say([{ line: "this_is" }, { gap: 100 }, { word: c.from.text }]);
    }
    await say(
      early
        ? [{ line: "swap_make" }, { gap: 100 }, { word: c.to.text }, { gap: 300 }, { stretch: c.from.text }, { gap: 350 }, { stretch: c.to.text }, { gap: 250 }, { line: "what_changed" }]
        : [{ line: "swap_make" }, { gap: 100 }, { word: c.to.text }, { gap: 200 }, { line: "swap_which" }],
    );
    setBusy(false);
  };

  const tapPos = async (i: number) => {
    if (busy || !s) return;
    if (picked !== null) {
      setPicked(i === picked ? null : i);
      return;
    }
    if (i === s.pos) {
      sfx.pop();
      setPicked(i);
      await say({ line: "swap_pick" });
    } else {
      misses.current++;
      stepMisses.current++;
      setWrongPos(i);
      sfx.wrong();
      setBusy(true);
      // "That's /h/ — /h/ stays the same. Listen: hat... hot."
      await say([{ line: "thats" }, { sound: s.from.segs[i].p }, { gap: 100 }, { line: "stays_same" }, { gap: 250 }, { line: "listen" }, { word: s.from.text }, { gap: 250 }, { word: s.to.text }], { reveal: true });
      setWrongPos(null);
      setBusy(false);
    }
  };

  const tapNew = async (g: string, el: HTMLElement) => {
    if (busy || picked === null || !s) return;
    const need = s.to.segs[s.pos];
    if (g === need.g) {
      recordSpell(need, stepMisses.current === 0);
      recordRead(s.to, stepMisses.current === 0);
      setBusy(true);
      sfx.whoosh();
      const xy = stageXY(el);
      fx.burst(xy.x, xy.y, "sparks", 12);
      setMorph(true);
      await sleep(260);
      setShown(s.to);
      setPicked(null);
      setMorph(false);
      fx.burst(640, 250, "petals", 20);
      await sayBlend(s.to.segs, s.to.text, setLit);
      setLit(-1);
      sfx.good();
      await say({ line: pickPraise() });
      stepMisses.current = 0;
      if (step + 1 >= chain.length) {
        fx.rain("confetti", 60);
        await say({ line: "swap_done" });
        onDone(misses.current <= 1 ? 3 : misses.current <= 4 ? 2 : 1);
        return;
      }
      setStep(step + 1);
      await ask(step + 1);
    } else {
      misses.current++;
      stepMisses.current++;
      setWrongG(g);
      sfx.wrong();
      setBusy(true);
      await say(
        stepMisses.current <= 1 && GRAPHEMES[g] !== need.p
          ? [{ line: "listen" }, { stretch: s.from.text }, { gap: 300 }, { stretch: s.to.text }] // listen for what changed
          : correction(g, need, s.to.text, 2),
        { reveal: stepMisses.current > 1 },
      );
      setWrongG(null);
      setBusy(false);
    }
  };

  const [helpLvl, setHelpLvl] = useState(0);
  useEffect(() => setHelpLvl(0), [step, picked]);
  useHelp(
    (n) => {
      if (!s || busy) return;
      setHelpLvl(n);
      if (picked === null) say(n === 1 ? [{ line: "swap_make" }, { gap: 100 }, { word: s.to.text }, { gap: 250 }, { line: "help_swap_pos" }] : [{ line: "listen" }, { word: s.from.text }, { gap: 300 }, { word: s.to.text }, { gap: 200 }, { line: "help_look" }], { reveal: n > 1 });
      else say(n === 1 ? [{ line: "help_swap_new" }, { gap: 100 }, { word: s.to.text }] : [{ line: "help_look" }, { sound: s.to.segs[s.pos].p }], { reveal: n > 1 });
    },
    [step, picked, busy],
  );
  (window as any).__snState = { scene: "swap", busy, picked, pos: s?.pos, next: s?.to.segs[s.pos].g };
  if (!s || !shown) return null;
  return (
    <div className="scene">
      <img className="bg-img" src={img(`bg_${world.key}`)} alt="" />
      <div className="vignette" />
      <div className="topbar">
        <RoundButton sm label="map" onClick={onQuit}><Icon.home /></RoundButton>
        <div className="spacer" />
        <Progress value={step / chain.length} />
        <div className="spacer" />
        <div style={{ width: 68 }} />
      </div>
      <img className="sprite float" src={img("baron_idle")} alt="" style={{ right: 20, top: 90, width: 190, transform: "scaleX(-1)" }} />
      {/* picture of the current word, with a muddle swirl when changing */}
      <WordCard word={shown} onHear={() => !busy && ask(step)} style={{ left: 505, top: 88, width: 270, height: 210, transition: "transform .25s", transform: morph ? "scale(.6) rotate(20deg)" : undefined }} />
      {shown.pic && (
        <div style={{ position: "absolute", left: 800, top: 150 }}>
          <RoundButton sm label="Hear the target word" onClick={() => !busy && ask(step)}><Icon.speaker /></RoundButton>
        </div>
      )}
      {/* current word tiles */}
      <div className="slots" style={{ position: "absolute", left: 0, right: 0, top: 340, gap: 18 }}>
        {shown.segs.map((seg, i) => (
          <div key={`${shown.text}-${i}`} style={{ position: "relative", transform: picked === i ? "translateY(-26px) rotate(-4deg)" : undefined, transition: "transform .2s" }}>
            <Tile
              g={seg.g}
              size="lg"
              withButtons
              lit={lit === i}
              state={wrongPos === i ? "wrong" : picked === i ? "hint" : (stepMisses.current >= 2 || helpLvl >= 2) && picked === null && i === s.pos ? "hint" : ""}
              onTap={() => tapPos(i)}
            />
          </div>
        ))}
      </div>
      {/* new spelling choices */}
      {picked !== null && (
        <div className="row pop-in" style={{ position: "absolute", left: 200, right: 200, bottom: 40, gap: 18 }}>
          {options.current[step].map((g) => (
            <Tile key={g} g={g} state={wrongG === g ? "wrong" : helpLvl >= 2 && g === s.to.segs[s.pos].g ? "hint" : ""} onTap={(el) => tapNew(g, el)} />
          ))}
        </div>
      )}
      <SenseiDock />
    </div>
  );
}
