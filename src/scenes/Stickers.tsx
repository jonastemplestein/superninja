// The Sticker Book rewards (docs/FIRST_MINUTES.md §6, §8). Stickers first; stars stay in the background.
//   · Reward 1 (the first time, ~21 s): the lesson's cards rise into a fan and flip into glossy die-cut stickers; the
//     Sticker Book swoops in, pops its clasp and opens; each sticker lands on its own word in "Sun, sock, cat, sausage
//     and moon!"; "Every picture you play with becomes a sticker!". That show leads straight into the child's turn, "Tap a
//     sticker!", which waits for the tap (Show me again plays the show again); then the book tucks into the ninja's pack
//     and the last step holds on the green Next ("Ready for the next game? Tap the big arrow!").
//   · Reward 2 (the first time, ~26–30 s), two held steps: the book open, six new stickers flying in as a rising run, a
//     shiny holographic fish-dog, the /s/ stickers hopping ("They all start with... /s/"); then the book flies off and
//     the first petal shines through the mist on a little World Flower ("This petal is for the sound... /s/"). Next
//     goes to the map.
//   · Every later reward (4–6 s), one held step: the new stickers fly into the Sticker Book icon in the corner, "+N".
// Nothing moves on by itself (docs/NAVIGATION.md): every step holds on Next; Hear it again plays the step again (the
// level's closing line first, rule 7); Back plays the step before. "Play again" (↻, a warm-up replayed from the map)
// sits where Back goes, in the nav row, once the last step has finished.
// A picture sticker has the same plate colour as its card, a cream die-cut edge and a gloss sweep, and no spelling.
// It gains a gold edge and its written word once the child has read or spelt the word (a word sticker).
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { say, sfx, playMusic, preload, urls, sayBlend } from "../engine/audio";
import { FAST } from "../engine/fast";
import { store, recordMet } from "../engine/store";
import { WORD_BY_TEXT, type PhonemeId } from "../content/phonics";
import { WORD_TIMES, canStretch, hasLine } from "../content/warmups";
import { img, fx, sleep, tapProps, useHelp, RoundButton, Icon, TapHint, SenseiDock, stageXY, isUpright } from "../ui/ui";
import { usePresentation, useNav, navAgain, nudgeNext, NAV_SLOTS, slotStyle, type Step } from "../ui/nav";
import { isSpeaking, type Say } from "../engine/audio";
import { NinjaSpot, ninja } from "../ui/Ninja";
import { plateColour } from "./Early";
import { WorldFlower } from "./Tree";
import "../styles/stickers.css";

// ---------------------------------------------------------------- one sticker
export type StickerKind = "picture" | "word" | "shiny";
/** What a sticker is now: shiny, a word sticker (read or spelt), or a picture sticker. */
export function stickerKind(w: string, s = store.get()): StickerKind {
  if (s.shiny?.includes(w)) return "shiny";
  return (s.words[w]?.ok ?? 0) > 0 ? "word" : "picture";
}
/** A die-cut sticker: the picture on its plate colour with a cream edge and a gloss sweep; a word sticker has a gold
 *  edge and its written word; a shiny one has a holographic rainbow sweep. */
export function Sticker({ w, kind, size = 110, onTap, className = "", style, label, disabled }: { w: string; kind: StickerKind; size?: number; onTap?: (el: HTMLElement) => void; className?: string; style?: CSSProperties; label?: string; disabled?: boolean }) {
  const pic = !!WORD_BY_TEXT[w]?.pic || !WORD_BY_TEXT[w];
  const inner = (
    <>
      {/* a word with no picture still gets a coloured plate (never plain white) and a speaker: tap it and hear it */}
      <span className="st-plate" style={{ background: pic ? plateColour(w) : wordPlate(w) }}>
        {pic ? <img src={img(`pic_${w}`)} alt="" draggable={false} /> : <span className="st-text" style={{ fontSize: Math.round(size * (w.length > 4 ? 0.24 : 0.3)) }}>{w}</span>}
        {!pic && <span className="st-hear" aria-hidden="true"><Icon.speaker /></span>}
        <span className="st-gloss" aria-hidden="true" />
        {kind === "shiny" && <span className="st-holo" aria-hidden="true" />}
      </span>
      {/* (data-w: its shimmer is a brighter copy of it, stickers.css .stk-word::after) */}
      {kind === "word" && pic && <span className="stk-word" data-w={w}>{w}</span>}
    </>
  );
  const cls = `sticker ${kind} ${className}`;
  const st = { width: size, height: size, ...style };
  if (!onTap) return <span className={cls} style={st} data-sticker={w}>{inner}</span>;
  return (
    <button aria-label={label ?? `sticker ${w}`} className={cls} style={st} data-sticker={w} disabled={disabled} {...tapProps<HTMLButtonElement>((el) => onTap(el))}>
      {inner}
    </button>
  );
}
/** A word sticker with no picture: a plate colour of its own (the card plates, chosen by the word). */
const WORD_PLATES = ["#bfe6ff", "#cdeeb4", "#ffc9b8", "#e3d4ff", "#ffe9a6", "#bdeee6", "#ffd9b0", "#ffd0e0"];
export function wordPlate(w: string) {
  let h = 0;
  for (const ch of w) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return WORD_PLATES[Math.abs(h) % WORD_PLATES.length];
}
/** A sticker says itself: a picture sticker fast then slow ("sun… sssuuunnn"); a word sticker says the sounds and
 *  reads the word. */
export function sayStickerWord(w: string, kind: StickerKind) {
  const word = WORD_BY_TEXT[w];
  if (kind === "word" && word) return sayBlend(word.segs, word.text);
  return say(canStretch(w) ? [{ word: w }, { gap: 350 }, { stretch: w }] : { word: w });
}

// ---------------------------------------------------------------- the reward
export interface StickerRewardProps {
  /** the lesson's stickers, in order */
  words: string[];
  /** "intro": Reward 1 the first time; "open": Reward 2 the first time; "short": every later reward */
  mode: "intro" | "open" | "short";
  /** the one-clip list for the landings (fm_rw1_list / fm_rw2_list), with WORD_TIMES */
  list?: string;
  /** Reward 2: the shiny sticker (the fish-dog) and its line */
  shiny?: string;
  /** Reward 2: "Sun, sock, sausage and sunflower. They all start with... /s/" */
  sound?: { p: PhonemeId; words: string[]; line: string };
  /** Reward 2, the first time: the petal for this sound shines through the mist */
  petal?: PhonemeId;
  /** where Next goes: "arrow" the next lesson (first session), "map" the map (the book flies there), "next" the usual */
  then: "arrow" | "map" | "next";
  /** the level's closing line: the reward's Hear it again says it first (docs/NAVIGATION.md rule 7) */
  closing?: string;
  onNext: () => void;
  onReplay?: () => void;
}

/** fm_rw2_petal "You found your very first sound! Look, its petal is shining through the mist.": the petal blooms as
 *  "its petal is shining" starts (seconds into the clip; silencedetect, 26 Sep). */
const PETAL_SHINES_AT = 3.4;
/** Book geometry (stage px): two pages of 3 × 2 stickers. */
const BOOK = { x: 392, y: 104, w: 676, h: 404 };
const SLOT = 96;
const slotXY = (i: number) => {
  const page = Math.floor(i / 6) % 2, j = i % 6, c = j % 3, r = Math.floor(j / 3);
  const pw = (BOOK.w - 24) / 2;
  return { x: BOOK.x + 12 + page * pw + pw / 2 + (c - 1) * 106, y: BOOK.y + BOOK.h / 2 + (r === 0 ? -86 : 86) };
};

/** A show's held steps (usePresentation), mounted once the show starts holding; `back` adds a Back to the first step
 *  (Reward 1's last step: the book's show again). Draws Play again (in Back's slot) once the last step has finished. */
function Held({ id, steps, onDone, back, onReplay }: { id: string; steps: Step[]; onDone: () => void; back?: () => void; onReplay?: () => void }) {
  const { i, ready } = usePresentation(steps, { id, onDone, noBack: !!onReplay, state: false });
  useNav({ back: back && !onReplay ? back : undefined });
  return onReplay && ready && i === steps.length - 1 ? (
    <RoundButton label="Play again" className="pop-in" onClick={onReplay} style={slotStyle(NAV_SLOTS.row.back)}>
      <Icon.again />
    </RoundButton>
  ) : null;
}

export function StickerReward(p: StickerRewardProps) {
  const [phase, setPhase] = useState<"fan" | "book" | "closing" | "done">(p.mode === "intro" ? "fan" : p.mode === "open" ? "book" : "done");
  // stickers already in the book (Reward 2 opens on the page with the first lesson's stickers)
  const [prior] = useState(() => (p.mode === "open" ? (store.get().stickers ?? []).filter((w) => !p.words.includes(w) && w !== p.shiny).slice(-6) : []));
  const [landed, setLanded] = useState<string[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [count, setCount] = useState(p.mode === "open" ? prior.length : 0);
  const [bookState, setBookState] = useState<"away" | "in" | "open" | "shut" | "gone">(p.mode === "open" ? "open" : "away");
  const [wiggle, setWiggle] = useState<string | null>(null);
  const [hard, setHard] = useState(false);
  const [tapTime, setTapTime] = useState(false);
  const [hop, setHop] = useState<string | null>(null);
  const [shinyIn, setShinyIn] = useState(false);
  const [flower, setFlower] = useState<"" | "up" | "lit" | "away">("");
  const [flash, setFlash] = useState(false);
  const [raysAt, setRaysAt] = useState<{ x: number; y: number } | null>(null);
  const [plus, setPlus] = useState<number | null>(null);
  // the "+N" flight has ended: the flown stickers (invisible now) go, and their shimmer and holo sweep with them
  const [flown, setFlown] = useState(false);
  // Reward 1: "show" (the book's show), "turn" (Tap a sticker!), "end" (held on Next). Reward 2 and later: "end".
  const [stage, setStage] = useState<"show" | "turn" | "end">(p.mode === "intro" ? "show" : "end");
  const [replaying, setReplaying] = useState(false); // Show me again is playing the book's show (the turn waits)
  const [take, setTake] = useState(0); // a new run of Reward 1's show (Back from its last step, Show me again)
  const tapped = useRef<(() => void) | null>(null);
  const alive = useRef(true);
  const leaving = useRef(false);
  const stickerEl = useRef<HTMLElement | null>(null);
  const ok = () => alive.current;
  useEffect(() => {
    alive.current = true;
    playMusic(null);
    preload([...p.words.map(urls.word), ...(p.list ? [urls.line(p.list)] : [])]);
    // the stickers are the child's now (the Sticker Book keeps them in the order they were collected)
    for (const w of p.words) recordMet(w);
    if (p.shiny) recordMet(p.shiny, true);
    if (p.mode !== "short") store.set((s) => void (s.seenBook = true));
    return () => void (alive.current = false);
  }, []);

  const sayAt = async (line: string, times: number[], each: (i: number) => void, live: () => boolean) => {
    const t = performance.now();
    const said = say({ line });
    for (let i = 0; i < times.length && live(); i++) {
      await sleep(Math.max(0, times[i] * 1000 - (performance.now() - t) * FAST));
      if (live()) each(i);
    }
    await said;
  };
  const land = (w: string, i: number) => {
    setLanded((l) => (l.includes(w) ? l : [...l, w]));
    setCount((c) => c + 1);
    sfx.place();
    const at = slotXY(prior.length + i);
    fx.twinkle(at.x, at.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 8, 4);
    void ninja.act(i % 2 ? "jump" : "cheer");
  };
  /** The stickers land on their words in the lesson's list line (or one word at a time). */
  const landAll = async (live: () => boolean, gap: number) => {
    const times = (p.list && WORD_TIMES[p.list]) || p.words.map((_, i) => i * gap);
    if (p.list && hasLine(p.list)) await sayAt(p.list, times.slice(0, p.words.length), (i) => land(p.words[i], i), live);
    else
      for (const [i, w] of p.words.entries()) {
        if (!live()) return;
        land(w, i);
        await say({ word: w });
      }
  };

  // ---------------------------------------------------------------- Reward 1: the book's show, then the child's turn
  const endLine = p.then === "arrow" ? "fm_rw_next" : "help_next";
  useEffect(() => {
    if (p.mode !== "intro" || stage !== "show") return;
    let live = true;
    const on = () => live && alive.current;
    (async () => {
      // the picture as it starts (a replay starts from the cards again)
      setPhase("fan");
      setFlipped(false);
      setBookState("away");
      setLanded([]);
      setCount(0);
      setWiggle(null);
      setHard(false);
      setTapTime(false);
      sfx.gong();
      fx.rain("petals", 50);
      // 0–2 s: the cards rise into a fan and flip into stickers
      void ninja.act("cheer");
      const look = say({ line: "fm_rw_look" });
      await sleep(900);
      if (!on()) return;
      setFlipped(true);
      sfx.twinkle();
      await look;
      if (!on()) return;
      // 2–4.5 s: the Sticker Book swoops in on petals, thumps, pops its clasp and opens
      setBookState("in");
      sfx.whoosh();
      await sleep(650);
      if (!on()) return;
      sfx.bounce();
      const book = say({ line: "fm_rw_book" });
      await sleep(450);
      if (!on()) return;
      setBookState("open");
      setPhase("book");
      sfx.pop();
      void ninja.act("power");
      await book;
      // 4.5–9 s: each sticker flies in and presses onto the page on its own word
      if (!on()) return;
      await landAll(on, 0.8);
      // 9–12 s: the page glows and the counter thunks into the corner
      await sleep(200);
      if (!on()) return;
      sfx.coin();
      await say({ line: "fm_rw_every" });
      if (!on()) return;
      // the child's turn: "Tap a sticker!" (the first wiggles and a hand points; it waits for the tap)
      setReplaying(false);
      setStage("turn");
    })();
    return () => void (live = false);
  }, [stage, take]);
  useEffect(() => {
    if (p.mode !== "intro" || stage !== "turn") return;
    let live = true;
    setWiggle(p.words[0]);
    setTapTime(true);
    void say({ line: "fm_rw_tap" });
    // idle (docs/NAVIGATION.md §3.2, a turn): 8 s the sticker wiggles harder and Sensei asks again; 16 s the ninja
    // points at it and she asks once more; then quiet. Never answered for the child.
    let idle = 0;
    const reset = () => void (idle = 0);
    const tick = setInterval(() => {
      if (isUpright() || isSpeaking()) return;
      idle += 250;
      if (idle === 8000) {
        setHard(true);
        void say({ line: "fm_rw_tap" });
      }
      if (idle === 16000) {
        if (stickerEl.current) void ninja.act("jump", stickerEl.current, { react: false });
        void say({ line: "fm_rw_tap" });
      }
    }, 250);
    window.addEventListener("pointerdown", reset, true);
    (async () => {
      await new Promise<void>((r) => (tapped.current = r));
      tapped.current = null;
      if (!live) return;
      await sleep(300);
      if (live && alive.current) setStage("end");
    })();
    return () => {
      live = false;
      tapped.current = null;
      clearInterval(tick);
      window.removeEventListener("pointerdown", reset, true);
    };
  }, [stage, take]);
  /** Show me again (the turn): the book's show once more, then "Tap a sticker!" again. It never answers the turn. */
  const showAgain = () => {
    setReplaying(true);
    setTake((t) => t + 1);
    setStage("show");
  };
  useNav({
    again: p.mode === "intro" && stage === "turn" ? () => say([{ line: "fm_rw_every" }, { gap: 300 }, { line: "fm_rw_tap" }]) : p.mode === "intro" && stage === "show" ? null : undefined,
    show: p.mode === "intro" && stage === "turn" ? showAgain : null,
  });
  // Help: in the turn, the question (then with its explanation); on a held step, the step again, then the arrow
  useHelp((n) => {
    if (stage === "turn") return void say(n === 1 ? { line: "fm_rw_tap" } : [{ line: "fm_rw_every" }, { gap: 300 }, { line: "fm_rw_tap" }]);
    if (stage === "end") return n === 1 ? navAgain() : nudgeNext();
  }, [stage]);

  // ---------------------------------------------------------------- the held steps
  // each step's enter() puts its picture back as it was when the step began, so Back and Hear it again replay it
  const firstRun = useRef<Record<string, boolean>>({});
  const replayed = (key: string) => {
    const again = !!firstRun.current[key];
    firstRun.current[key] = true;
    return again;
  };
  const withClosing = (again: boolean, rest: Say[]): Say[] => (again && p.closing ? [{ line: p.closing }, { gap: 300 }, ...rest] : rest);
  const steps: Step[] = [];
  if (p.mode === "short") {
    steps.push({
      key: "plus",
      enter: () => (setPlus(null), setFlown(false)),
      run: async (live) => {
        const again = replayed("plus");
        // later rewards: the new stickers fly into the book icon in the corner, "+N"
        sfx.fanfare();
        void ninja.act("cheer");
        await sleep(300);
        if (!live()) return;
        if (p.words.length) {
          setPlus(p.words.length);
          await say(withClosing(again, [{ line: "fm_rw_more" }]));
        } else await say(withClosing(again, [{ line: "yay_7" }]));
        await sleep(600);
      },
    });
  }
  if (p.mode === "intro") {
    steps.push({
      key: "end",
      run: async (live) => {
        const again = replayed("end");
        if (!again) {
          // the book closes and tucks into the ninja's pack
          setTapTime(false);
          setWiggle(null);
          setBookState("shut");
          await sleep(450);
          if (!live()) return;
          setBookState("gone");
          sfx.place();
          setPhase("closing");
          void ninja.act("cheer");
          await sleep(350);
          if (!live()) return;
        }
        // "Ready for the next game? Tap the big arrow!": the arrow is green as Sensei says so (the step is the book
        // tucking away; its line is the prompt)
        void say(withClosing(again, [{ line: endLine }]));
      },
    });
  }
  if (p.mode === "open") {
    // ---- Reward 2, step 1: the book is open; six new stickers fly in as a rising run; the shiny one; the /s/ hop
    steps.push({
      key: "stickers",
      sound: p.sound?.p,
      enter: () => {
        setPhase("book");
        setBookState("open");
        setLanded([]);
        setCount(prior.length);
        setShinyIn(false);
        setHop(null);
        setFlower("");
        setRaysAt(null);
        setFlash(false);
      },
      run: async (live) => {
        const again = replayed("stickers");
        if (again && p.closing) await say({ line: p.closing });
        if (!live()) return;
        void ninja.act("power");
        await sleep(600);
        if (!live()) return;
        await landAll(live, 0.7);
        if (p.shiny && live()) {
          // a drumroll, then the shiny fish-dog lands in the centre
          await sleep(300);
          sfx.charge();
          await sleep(500);
          if (!live()) return;
          setShinyIn(true);
          setCount((c) => c + 1);
          sfx.great();
          const at = slotXY(Math.min(11, prior.length + p.words.length));
          fx.burst(at.x, at.y, "stars", 28);
          void ninja.act("cheer");
          await say({ line: "fm_rw_shiny" });
        }
        if (p.sound && live()) {
          // the /s/ stickers hop in turn, each first dot glowing gold
          const hopTimes = WORD_TIMES[p.sound.line] ?? p.sound.words.map((_, i) => i * 0.9);
          await sayAt(
            p.sound.line,
            hopTimes.slice(0, p.sound.words.length),
            (i) => {
              setHop(p.sound!.words[i]);
              const el = document.querySelector(`.st-book [data-sticker="${p.sound!.words[i]}"]`);
              if (el) {
                const at = stageXY(el);
                fx.ring(at.x, at.y, { color: "#ffc53d", r0: 10, r1: 90, width: 8 });
              }
            },
            live,
          );
          await sleep(300);
          if (!live()) return;
          await say({ sound: p.sound.p });
          setHop(null);
        }
      },
    });
    if (p.petal) {
      const petal = p.petal;
      // ---- step 2: the book flies off, and the first petal shines through the mist on a real World Flower (320 px):
      // the bamboo dims, every petal in its own colours, softened, lost in the mist; on "its petal is shining" the /s/
      // petal pops out of the mist to twice its size (rays, twinkles and a chime) and settles, bigger and glowing, and
      // the ninja powers up facing it; "This petal is for the sound… /s/", and it flashes on its sound. It holds.
      steps.push({
        key: "petal",
        sound: petal,
        enter: () => {
          setHop(null);
          setFlower("");
          setRaysAt(null);
          setFlash(false);
        },
        run: async (live) => {
          if (bookState !== "gone") {
            setBookState("shut");
            await sleep(450);
            if (!live()) return;
            setBookState("gone");
            sfx.whoosh();
            await sleep(250);
            if (!live()) return;
          }
          setFlower("up");
          await sleep(200);
          if (!live()) return;
          const t = performance.now();
          const said = say({ line: "fm_rw2_petal" });
          await sleep(Math.max(0, PETAL_SHINES_AT * 1000 - (performance.now() - t) * FAST));
          if (!live()) return;
          setFlower("lit");
          sfx.petal();
          store.set((s) => void (s.petals.includes(petal) || s.petals.push(petal)));
          sfx.great();
          const el = document.querySelector(`.st-flower [data-p="${petal}"]`);
          const at = el ? stageXY(el) : { x: 730, y: 300 };
          setRaysAt(at);
          fx.ring(at.x, at.y, { color: "#fff4dc", r0: 20, r1: 220, width: 14, life: 26 });
          fx.ring(at.x, at.y, { color: "#ffe38a", r0: 40, r1: 330, width: 10, life: 34 });
          fx.twinkle(at.x, at.y, ["#fff4dc", "#ffe38a", "#ff9ec0"], 18, 8, 30);
          fx.glow(at.x, at.y, ["#fff6c8", "#ffe38a", "#ffc53d"], 12, 70, 1.8);
          fx.lines(at.x, at.y, 12, "#fff4dc", 80);
          void ninja.act("power");
          // twinkles keep rising round it as it settles
          for (let i = 1; i <= 3; i++) setTimeout(() => live() && fx.twinkle(at.x + (Math.random() - 0.5) * 120, at.y + (Math.random() - 0.5) * 120, ["#fff4dc", "#ffe38a"], 6, 4, 24), i * 450);
          await said;
          // what a petal is, while it glows: one petal, one sound (NARRATIVE_AUDIT F03; the film and the flower's own
          // introduction may both have been skipped). It flashes on its sound.
          if (!live()) return;
          await say([{ gap: 150 }, { line: "audit_petal_means" }, { gap: 300 }]);
          if (!live()) return;
          setFlash(true);
          await say({ sound: petal });
          setFlash(false);
        },
      });
    }
  }
  /** Next on the last step: off to the next lesson or the map (the book, or the petal, flies there first). */
  const finish = async () => {
    if (leaving.current) return;
    leaving.current = true;
    if (flower === "lit") {
      setFlower("away");
      sfx.whoosh();
      await sleep(750);
    } else if (p.then === "map" && bookState === "open") {
      setBookState("shut");
      await sleep(450);
      setBookState("gone");
      sfx.whoosh();
      await sleep(600);
    }
    if (ok()) p.onNext();
  };
  /** Back from Reward 1's last step: the book's show again, then the turn. */
  const backToShow = () => {
    firstRun.current = {};
    setTake((t) => t + 1);
    setStage("show");
  };

  const onSticker = (w: string, el: HTMLElement) => {
    if (!tapTime || replaying) return;
    sfx.pop();
    const at = stageXY(el);
    fx.burst(at.x, at.y, "stars", 10);
    el.animate([{ rotate: "0deg", scale: "1" }, { rotate: "360deg", scale: "1.3" }, { rotate: "360deg", scale: "1" }], { duration: 600 }).playbackRate = FAST;
    setWiggle(null);
    setHard(false);
    setTapTime(false);
    void ninja.act("cheer");
    void sayStickerWord(w, stickerKind(w)).then(() => tapped.current?.());
  };

  const pages = [...prior, ...p.words];
  const turn = stage === "turn" || (stage === "show" && replaying);
  // bots read this (scripts/treadmill/bot.ts): the sticker to tap during the turn (it stays the question while Show me
  // again replays the show: busy), and the held steps' Next is the nav layer's
  (window as any).__snState = { scene: "stickers", mode: p.mode, next: turn ? `sticker ${p.words[0]}` : null, busy: turn && (!tapTime || replaying), done: stage === "end" };
  const book = bookState === "open" || bookState === "shut";
  return (
    <div className={`scene st-reward ${phase}`}>
      <img className="bg-img" src={img("bg_bamboo")} alt="" style={{ filter: "blur(3px) brightness(.8)" }} />
      <div className="vignette" />
      <NinjaSpot size={270} x={34} />
      {/* the cards rise into a fan and flip into stickers */}
      {p.mode === "intro" && phase === "fan" && (
        <div className="st-fan" key={`fan${take}`}>
          {p.words.map((w, i) => {
            const n = p.words.length, a = (i - (n - 1) / 2) * 12;
            return (
              <div key={w} className={`st-fan-card ${flipped ? "flip" : ""}`} style={{ "--a": `${a}deg`, "--i": i, left: 730 + (i - (n - 1) / 2) * 120 - 70 } as CSSProperties}>
                <span className="st-fan-front" style={{ background: plateColour(w) }}><img src={img(`pic_${w}`)} alt="" /></span>
                <span className="st-fan-back"><Sticker w={w} kind="picture" size={132} /></span>
              </div>
            );
          })}
        </div>
      )}
      {/* the Sticker Book: it swoops in and opens, then shuts and goes */}
      {bookState === "in" && <img className="st-book-closed in" src={img("item_sticker_book")} alt="" />}
      {bookState === "gone" && <img className={`st-book-closed ${p.then === "map" || p.mode === "open" ? "to-map" : "to-pack"}`} src={img("item_sticker_book")} alt="" />}
      {book && (
        <div className={`st-book ${bookState}`} key={`book${take}`} style={{ left: BOOK.x, top: BOOK.y, width: BOOK.w, height: BOOK.h }}>
          <div className="st-pages">
            <div className="st-page" />
            <div className="st-page" />
          </div>
          {Array.from({ length: 12 }, (_, i) => {
            const at = slotXY(i);
            const w = pages[i];
            const isPrior = i < prior.length;
            const isLanded = w && (isPrior || landed.includes(w));
            return (
              <div key={i} className={`st-slot ${isLanded ? "full" : ""}`} style={{ left: at.x - BOOK.x - SLOT / 2, top: at.y - BOOK.y - SLOT / 2 }}>
                {isLanded && (
                  <span ref={(el) => void (wiggle === w && (stickerEl.current = el))} style={{ display: "contents" }}>
                    <Sticker
                      w={w}
                      kind={stickerKind(w)}
                      size={SLOT}
                      className={`${isPrior ? "" : "land"} ${wiggle === w ? "wiggle" : ""} ${wiggle === w && hard ? "hard" : ""} ${hop === w ? "hop" : ""}`}
                      onTap={(el) => onSticker(w, el)}
                      disabled={!tapTime || replaying}
                    />
                  </span>
                )}
                {wiggle === w && tapTime && <TapHint show style={{ right: -40, bottom: -50 }} />}
              </div>
            );
          })}
          {/* the shiny one lands in the book's last free slot, a little bigger than the rest */}
          {p.shiny && shinyIn && (() => {
            const at = slotXY(Math.min(11, prior.length + p.words.length));
            return <Sticker w={p.shiny} kind="shiny" size={SLOT + 18} className="st-shiny land" style={{ left: at.x - BOOK.x - (SLOT + 18) / 2, top: at.y - BOOK.y - (SLOT + 18) / 2 }} />;
          })()}
          {count > 0 && (
            <div className="st-count" key={count}>
              <span className="st-count-n">{count}</span>
              <span className="st-count-icon"><Icon.sticker /></span>
            </div>
          )}
        </div>
      )}
      {/* the first petal shines through the mist, on a real World Flower (320 px), clear of the book */}
      {/* the bamboo dims behind the flower, so its petals and the one shining through stand out */}
      {flower && p.petal && <div className={`st-dim ${flower}`} aria-hidden="true" />}
      {flower && p.petal && raysAt && flower !== "away" && <div className="st-petal-rays" aria-hidden="true" style={{ left: raysAt.x, top: raysAt.y }} />}
      {flower && p.petal && (
        <div className={`st-flower ${flower}`} aria-hidden="true">
          <span className="st-flower-glow" />
          <WorldFlower light={(q) => (q === p.petal && flower !== "up" ? 1 : 0)} misty bloom={flower !== "up" ? p.petal : null} flash={flash ? p.petal : null} stem={false} label="The World Flower" />
          <span className="st-mist" />
        </div>
      )}
      {/* later rewards: +N into the Sticker Book icon */}
      {plus != null && (
        <div
          className="st-mini"
          key={`mini${plus}`}
          onAnimationEnd={(e) => {
            // the last sticker to fly in (it leaves last) has faded out
            if (e.animationName === "st-mini" && (e.target as HTMLElement).dataset.sticker === p.words.slice(0, 5).at(-1)) setFlown(true);
          }}
        >
          {!flown && p.words.slice(0, 5).map((w, i) => <Sticker key={w} w={w} kind={stickerKind(w)} size={96} className="st-mini-fly" style={{ "--i": i } as CSSProperties} />)}
          <div className="st-mini-book"><img src={img("item_sticker_book")} alt="" /><span className="st-plus">+{plus}</span></div>
        </div>
      )}
      {stage === "end" && steps.length > 0 && <Held key={`held${take}`} id={`stickers-${p.mode}`} steps={steps} onDone={() => void finish()} back={p.mode === "intro" ? backToShow : undefined} onReplay={p.then !== "arrow" ? p.onReplay : undefined} />}
      <SenseiDock />
    </div>
  );
}
