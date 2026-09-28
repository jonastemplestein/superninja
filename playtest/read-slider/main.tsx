// The read slider's harness (docs/READ_SLIDER.md §10): the real ReadSlider with the real art and audio, in the game's
// shell (the Stage, the ninja, Help, the nav layer, the effects), outside the shared dev server. Three cases:
//   ?case=compound  picture reading v2's first meeting (docs/PICTURE_READING.md §3): the frame (the rail's cue on
//                   "this"), Sensei's slow demo on rain + bow (her paw out of her portrait on "Watch"), the child's
//                   rabbit, her backwards gag (bow… rain, it's raining bows!; her paw rides the rail left to right on
//                   "We"), the Ready, then the child's own slides on snow + man and cup + cake (praise only after the
//                   child's own rabbit tap)
//   ?case=sounds    "say the sounds with me" (Jonas): Sensei's paw on sun's three dots, then the child slides under mop
//   ?case=wrong     the child's turn on snowman: a backwards swipe, the tortoise pulled back, then the right way
// ?debug=1 outlines the touch band. The page waits for a first tap (the audio unlock) on its start card.
// Build: bunx vite build --config playtest/read-slider/vite.config.ts; serve: bun playtest/read-slider/serve.ts --port 49xx
import "../../src/engine/fast"; // first: ?fast=N
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import "../../src/styles.css";
import { Stage, FxLayer, HelpButton, SenseiDock, img, sleep } from "../../src/ui/ui";
import { NavLayer, holdNext } from "../../src/ui/nav";
import { NinjaSpot } from "../../src/ui/Ninja";
import { ReadSlider, readSlider, type ReadSliderProps, type SlideResult, type SliderItem } from "../../src/ui/ReadSlider";
import { COMPOUND_BY_ID, FIRST_MEETING } from "../../src/content/compounds";
import { say, unlockAudio, nextClip, type Say } from "../../src/engine/audio";
import { store } from "../../src/engine/store";
import { ORAL_WORDS, WORD_BY_TEXT, type PhonemeId } from "../../src/content/phonics";

declare global {
  const __APP_VERSION__: string;
}
const q = new URLSearchParams(location.search);
const CASE = (q.get("case") ?? "compound") as "compound" | "sounds" | "wrong";
// captions on, so a silent video still shows what Sensei says
store.set((s) => void (s.settings.captions = true));

type Slot = Omit<ReadSliderProps, "onDone" | "onWrongWay"> & { slotKey: string };
const log: unknown[] = ((window as any).__rsLog = []);
const note = (e: Record<string, unknown>) => log.push({ t: Math.round(performance.now()), ...e });

const words = (c: { parts: readonly [string, string] }): SliderItem[] => c.parts.map((w) => ({ kind: "word", w }));
function sounds(word: string): SliderItem[] {
  const ps: PhonemeId[] = WORD_BY_TEXT[word]?.segs.map((s) => s.p) ?? [...(ORAL_WORDS[word]?.segs ?? [])];
  return ps.map((p, i) => ({ kind: "sound", p, word, i }));
}
const L = (id: string): Say => ({ line: id });

function Harness() {
  const [slot, setSlot] = useState<Slot | null>(null);
  const [started, setStarted] = useState(false);
  const done = useRef<((r: SlideResult) => void) | null>(null);
  const until = () => new Promise<SlideResult>((r) => (done.current = r));
  /** Put a slider up and wait for it to mount. */
  const show = async (s: Slot) => {
    setSlot(s);
    for (let k = 0; k < 40 && !(readSlider.mounted && readSlider.state()?.id === s.id); k++) await sleep(25);
    await sleep(350);
  };
  /** Say a line, and do `at` as its word `word` starts (public/a/l/<id>.words.json; else at `frac` of the clip). */
  const sayAt = async (items: Say[], lineId: string, word: string, frac: number, at: () => void) => {
    const times = fetch(`/a/l/${lineId}.words.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    const c = nextClip(lineId, 6000);
    const said = say(items);
    void Promise.all([c, times]).then(([x, t]) => {
      if (!x) return;
      const w = (t?.words as { w: string; at: number }[] | undefined)?.find((k) => k.w.toLowerCase() === word.toLowerCase());
      setTimeout(at, w ? w.at * 1000 : (x.end - x.start) * frac);
    });
    return said;
  };

  /** Say a line and start Sensei's paw on its word `word` (it comes out of her portrait as she says it, and presses
   *  once she has finished): resolves when the paw's slide is over. */
  const sayDemo = async (lineId: string, word: string, frac: number, o: Parameters<typeof readSlider.demo>[0] = {}) => {
    let demo: Promise<boolean> | null = null;
    await sayAt([L(lineId)], lineId, word, frac, () => void (demo ??= readSlider.demo(o)));
    return demo ?? readSlider.demo(o);
  };

  async function compound() {
    const demo = FIRST_MEETING.demo;
    note({ step: "frame" });
    await show({ slotKey: "demo", id: demo.id, items: words(demo), mode: "words", whole: demo.id, demo: true, fast: "rabbit", rabbitAsk: "rs_now_fast" });
    // "Ninjas always read this way.": on "this" the start dot and the arrow pulse and a light runs the rail left to
    // right (the scene adds the ninja's dash: docs/fix-requests.md)
    await sayAt([L("pr_frame")], "pr_frame", "this", 0.7, () => readSlider.cue());
    const doneDemo = until();
    // "Two little words can make one long word. I'll read this one slowly first. Watch my paw...": her paw comes out
    // on "Watch", lands on the tortoise, and slides it once she has finished
    await sayDemo("pr_demo", "Watch", 0.85);
    const r = await doneDemo; // the child taps the rabbit: [rainbow]
    note({ step: "demo-fast", how: r.how });
    await sleep(700);
    await sayDemo("pr_demo_back", "watch", 0.1, { backwards: true, gag: demo.reverse.pic });
    await sayAt([L("pr_back_rainbow")], "pr_back_rainbow", "We", 0.66, () => void readSlider.home({ whole: true }));
    await sleep(300);
    // the Ready: ▶ (the paw would replay the demo)
    void say([L("tv_squish_ready")]);
    await holdNext("rs-ready", () => say([L("tv_squish_ready")]));
    for (const [k, c] of FIRST_MEETING.child.entries()) {
      const d = until();
      await show({ slotKey: c.id, id: c.id, items: words(c), mode: "words", whole: c.id, fast: "rabbit", rabbitAsk: k === 0 ? "rs_now_fast" : null, coachSpeed: true });
      await say([L(k === 0 ? "rs_how" : "pr_another")]);
      const res = await d;
      note({ step: c.id, ...res });
      // specific praise only for the child's own fast word (not when Sensei had to say it: the judge, 27 Sep)
      if (k === 0 && res.how === "tap") await say([L("rs_praise_1")]);
      await sleep(600);
    }
    await say([L("fm_l2_done")]);
    note({ step: "end" });
  }

  async function soundsCase() {
    const d0 = until();
    await show({ slotKey: "sun", id: "sun", items: sounds("sun"), mode: "sounds", whole: "sun", demo: true, fast: "rabbit", rabbitAsk: "rs_now_fast" });
    await sayDemo("pr_sounds_too", "show", 0.8); // "Words are made of sounds, too. Let me show you..."
    note({ step: "sun", ...(await d0) });
    await sleep(700);
    const d1 = until();
    await show({ slotKey: "mop", id: "mop", items: sounds("mop"), mode: "sounds", whole: "mop", fast: "rabbit", rabbitAsk: "fm_tap_rabbit" });
    await say([L("rs_sounds_with_me")]);
    const res1 = await d1;
    note({ step: "mop", ...res1 });
    if (res1.how === "tap") await say([L("tv_fs_praise_found_4")]);
    note({ step: "end" });
  }

  async function wrongCase() {
    const c = COMPOUND_BY_ID.snowman;
    const d = until();
    await show({ slotKey: "snowman", id: c.id, items: words(c), mode: "words", whole: c.id, fast: "rabbit", rabbitAsk: "rs_now_fast" });
    await say([L("rs_how")]);
    const res = await d;
    note({ step: "snowman", ...res });
    if (res.how === "tap") await say([L("rs_praise_2")]);
    note({ step: "end" });
  }

  useEffect(() => {
    if (!started) return;
    (window as any).__rsCase = CASE;
    void (CASE === "compound" ? compound() : CASE === "sounds" ? soundsCase() : wrongCase()).then(() => ((window as any).__rsDone = true));
  }, [started]);

  return (
    <div className={`scene ${q.get("debug") ? "rs-debug" : ""}`}>
      <img className="bg-img" src={img("bg_bamboo")} alt="" />
      <div className="vignette" />
      <NinjaSpot />
      {slot && (
        <ReadSlider
          key={slot.slotKey}
          {...slot}
          onDone={(r) => done.current?.(r)}
          onWrongWay={(n) => note({ step: "wrong", n })}
          onPart={(i) => note({ step: "part", i })}
        />
      )}
      {!started && (
        <button
          data-start
          aria-label="Start"
          onPointerDown={() => void unlockAudio().then(() => setStarted(true))}
          style={{ position: "absolute", left: 540, top: 250, width: 200, height: 200, borderRadius: 40, border: "6px solid var(--ink)", background: "#fff4dc", fontSize: 64, boxShadow: "0 8px 0 var(--ink)" }}
        >
          ▶
        </button>
      )}
      <SenseiDock />
    </div>
  );
}

function Shell() {
  return (
    <Stage worldColour="#6cc04a">
      <Harness />
      <HelpButton />
      <NavLayer home={() => location.reload()} scene="read-slider" />
      <FxLayer />
    </Stage>
  );
}
createRoot(document.getElementById("root")!).render(<Shell />);
