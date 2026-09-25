// Sorting dojo (Extended Code): same sound, different spellings. A word floats down on a scroll — Sensei says it —
// tap the basket for the spelling it uses. Words fall faster as you go (timed, but never fails).
import { useEffect, useRef, useState } from "react";
import type { LevelProps } from "../App";
import { WORDS, type Word } from "../content/phonics";
import { worldOf, knownSpellings } from "../content/worlds";
import { say, sfx, playMusic, preload, urls, hush, sayBlend } from "../engine/audio";
import { shuffle } from "../engine/learner";
import { recordRead, useSave } from "../engine/store";
import { img, RoundButton, Icon, Progress, fx, stageXY, Tile, tapProps, useHelp } from "../ui/ui";
import { CaptionTop } from "./Battle";
import { pickPraise } from "./Dojo";

const ROUNDS = 8;

export function Sort({ level, onDone, onQuit }: LevelProps) {
  const world = worldOf(level);
  const relaxed = useSave((s) => s.settings.relaxed);
  const { sound, spellings } = level.sort!;
  const known = knownSpellings(level);
  const words = useRef<Word[]>(
    shuffle(
      spellings.flatMap((g) =>
        shuffle(WORDS.filter((w) => w.unit <= Math.max(...level.units) && w.segs.some((s) => s.g === g && s.p === sound) && w.segs.filter((s) => s.p === sound).length === 1 && w.segs.every((s) => known.has(s.g)))).slice(0, Math.ceil(ROUNDS / spellings.length)),
      ),
    ).slice(0, ROUNDS),
  ).current;
  const [i, setI] = useState(-1);
  const [fall, setFall] = useState(0);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const [baskets, setBaskets] = useState<Record<string, string[]>>(Object.fromEntries(spellings.map((g) => [g, []])));
  const misses = useRef(0);
  const basketRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const w = words[i];
  const spellingOf = (w: Word) => w.segs.find((s) => s.p === sound && spellings.includes(s.g))!.g;

  useEffect(() => {
    playMusic("dojo");
    preload(words.map((w) => urls.word(w.text)));
    (async () => {
      await say([{ line: "sort_start" }, { gap: 200 }, { sound }, { gap: 300 }, { line: "same_sound_diff" }]);
      setI(0);
    })();
    return () => hush();
  }, []);

  // new word: say it, start falling
  useEffect(() => {
    if (i < 0 || i >= words.length) return;
    setFall(0);
    setResult(null);
    say({ word: words[i].text });
    if (relaxed) return;
    const dur = 9000 - i * 500;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const f = Math.min(1, (t - t0) / dur);
      setFall(f);
      if (f < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [i]);

  const choose = async (g: string) => {
    if (!w || result) return;
    const right = spellingOf(w) === g;
    recordRead(w, right);
    if (right) {
      setResult("right");
      sfx.good();
      const xy = stageXY(basketRefs.current[g]);
      fx.burst(xy.x, xy.y - 40, "petals", 16);
      setBaskets((b) => ({ ...b, [g]: [...b[g], w.text] }));
      await sayBlend(w.segs, w.text);
      if (Math.random() < 0.4) await say({ line: pickPraise() });
    } else {
      misses.current++;
      setResult("wrong");
      sfx.wrong();
      await say([{ line: "listen" }, { word: w.text }, { gap: 200 }]);
      await sayBlend(w.segs, w.text);
      setResult(null);
      return;
    }
    if (i + 1 >= words.length) {
      fx.rain("confetti", 60);
      await say({ line: "sort_done" });
      onDone(misses.current <= 1 ? 3 : misses.current <= 3 ? 2 : 1);
    } else setI(i + 1);
  };

  const [helpLvl, setHelpLvl] = useState(0);
  useEffect(() => setHelpLvl(0), [i]);
  useHelp(
    (n) => {
      if (!w) return;
      setHelpLvl(n);
      say(n === 1 ? [{ word: w.text }, { gap: 200 }, { line: "help_sort" }] : [{ line: "help_look" }, { word: w.text }]);
    },
    [i],
  );
  const top = 110 + fall * 220;
  (window as any).__snState = { scene: "sort", next: w ? spellingOf(w) : null };
  return (
    <div className="scene">
      <img className="bg-img" src={img(`bg_${world.key}`)} alt="" />
      <div className="vignette" />
      <div className="topbar">
        <RoundButton sm label="map" onClick={onQuit}><Icon.home /></RoundButton>
        <div className="spacer" />
        <Progress value={Math.max(0, i) / words.length} />
        <div className="spacer" />
        <RoundButton sm label="Hear the word" onClick={() => w && say({ word: w.text })}><Icon.speaker /></RoundButton>
      </div>
      {w && (
        <div key={w.text} className="drop-in" style={{ position: "absolute", left: "50%", translate: "-50% 0", top, transition: "top .1s linear" }}>
          <div className="panel" style={{ padding: "10px 44px", display: "flex", alignItems: "center", gap: 20, background: result === "wrong" ? "#ffe0cc" : result === "right" ? "#dfffe6" : undefined, animation: result === "wrong" ? "shake .4s" : undefined }}>
            {w.pic && <img src={img(`pic_${w.text}`)} alt="" style={{ width: 90, height: 90, objectFit: "contain" }} />}
            <span style={{ fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: 80 }}>
              {w.segs.map((s, k) => (
                // where to look is a hint (after a miss or a help press), not given away up front
                <span key={k} style={{ color: (misses.current > 0 || helpLvl >= 1) && s.p === sound && spellings.includes(s.g) ? "var(--blossom-deep)" : undefined }}>{s.g}</span>
              ))}
            </span>
          </div>
        </div>
      )}
      <div className="row" style={{ position: "absolute", left: 0, right: 0, bottom: 30, gap: 60 }}>
        {spellings.map((g) => (
          <div key={g} ref={(el) => void (basketRefs.current[g] = el)} style={{ position: "relative", width: spellings.length > 2 ? 260 : 300, height: 230 }}>
            <button {...tapProps(() => choose(g))} aria-label={`basket ${g}`} style={{ position: "absolute", inset: 0 }}>
              <img src={img("item_chest")} alt="" style={{ position: "absolute", left: 20, bottom: 0, width: 260 }} />
              <div style={{ position: "absolute", left: "50%", top: -10, translate: "-50% 0" }}>
                <Tile g={g} size="lg" state={helpLvl >= 2 && w && spellingOf(w) === g ? "hint" : ""} />
              </div>
            </button>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: -24, textAlign: "center", fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: 22, color: "var(--paper)", textShadow: "0 2px 0 var(--ink)" }}>
              {baskets[g].join("  ")}
            </div>
          </div>
        ))}
      </div>
      <CaptionTop />
    </div>
  );
}
