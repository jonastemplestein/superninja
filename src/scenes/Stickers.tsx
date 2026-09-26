// The Sticker Book rewards (docs/FIRST_MINUTES.md §6, §8). Stickers first; stars stay in the background.
//   · Reward 1 (the first time, ~21 s): the lesson's cards rise into a fan and flip into glossy die-cut stickers; the
//     Sticker Book swoops in, pops its clasp and opens; each sticker lands on its own word in "Sun, sock, cat, sausage
//     and moon!"; a big counter thunks into the corner; "Tap a sticker!"; the book tucks into the ninja's pack and a big
//     green arrow bounces ("Ready for the next game? Tap the big arrow!").
//   · Reward 2 (the first time, ~26–30 s): the book pops open at once; six new stickers fly in as a rising run; a
//     shiny holographic fish-dog; the /s/ stickers hop ("They all start with... /s/"); the first petal shines through
//     the mist on a little World Flower; then the book flies off to the map.
//   · Every later reward (4–6 s): the new stickers fly into the Sticker Book icon in the corner, "+N".
// A picture sticker has the same plate colour as its card, a cream die-cut edge and a gloss sweep, and no spelling.
// It gains a gold edge and its written word once the child has read or spelt the word (a word sticker).
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { say, sfx, playMusic, preload, urls, sayBlend } from "../engine/audio";
import { FAST } from "../engine/fast";
import { store, recordMet } from "../engine/store";
import { WORD_BY_TEXT, type PhonemeId } from "../content/phonics";
import { WORD_TIMES, canStretch, hasLine } from "../content/warmups";
import { img, fx, sleep, tapProps, useHelp, RoundButton, Icon, TapHint, SenseiDock, stageXY } from "../ui/ui";
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
      {kind === "word" && pic && <span className="stk-word">{w}</span>}
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
  /** "arrow": a big green arrow to the next lesson (first session); "map": off to the map; "next": the usual Next */
  then: "arrow" | "map" | "next";
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

export function StickerReward(p: StickerRewardProps) {
  const [phase, setPhase] = useState<"fan" | "book" | "closing" | "done">(p.mode === "intro" ? "fan" : p.mode === "open" ? "book" : "done");
  // stickers already in the book (Reward 2 opens on the page with the first lesson's stickers)
  const [prior] = useState(() => (p.mode === "open" ? (store.get().stickers ?? []).filter((w) => !p.words.includes(w) && w !== p.shiny).slice(-6) : []));
  const [landed, setLanded] = useState<string[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [count, setCount] = useState(p.mode === "open" ? prior.length : 0);
  const [bookState, setBookState] = useState<"away" | "in" | "open" | "shut" | "gone">(p.mode === "open" ? "open" : "away");
  const [wiggle, setWiggle] = useState<string | null>(null);
  const [tapTime, setTapTime] = useState(false);
  const [hop, setHop] = useState<string | null>(null);
  const [shinyIn, setShinyIn] = useState(false);
  const [flower, setFlower] = useState<"" | "up" | "lit" | "away">("");
  const [flash, setFlash] = useState(false);
  const [raysAt, setRaysAt] = useState<{ x: number; y: number } | null>(null);
  const [arrow, setArrow] = useState(false);
  const [hard, setHard] = useState(false);
  const [plus, setPlus] = useState<number | null>(null);
  const tapped = useRef<(() => void) | null>(null);
  const alive = useRef(true);
  useHelp(() => say({ line: p.then === "arrow" ? "fm_rw_next" : "help_next" }));

  useEffect(() => {
    alive.current = true;
    playMusic(null);
    preload([...p.words.map(urls.word), ...(p.list ? [urls.line(p.list)] : [])]);
    // the stickers are the child's now (the Sticker Book keeps them in the order they were collected)
    for (const w of p.words) recordMet(w);
    if (p.shiny) recordMet(p.shiny, true);
    if (p.mode !== "short") store.set((s) => void (s.seenBook = true));
    const ok = () => alive.current;
    const sayAt = async (line: string, times: number[], each: (i: number) => void) => {
      const t = performance.now();
      const said = say({ line });
      for (let i = 0; i < times.length && ok(); i++) {
        await sleep(Math.max(0, times[i] * 1000 - (performance.now() - t) * FAST));
        each(i);
      }
      await said;
    };
    const land = (w: string, i: number) => {
      setLanded((l) => [...l, w]);
      setCount((c) => c + 1);
      sfx.place();
      const at = slotXY(prior.length + i);
      fx.twinkle(at.x, at.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 8, 4);
      void ninja.act(i % 2 ? "jump" : "cheer");
    };
    (async () => {
      if (p.mode === "short") {
        // later rewards: the new stickers fly into the book icon in the corner, "+N"
        sfx.fanfare();
        void ninja.act("cheer");
        await sleep(300);
        if (p.words.length) {
          setPlus(p.words.length);
          await say({ line: "fm_rw_more" });
        } else await say({ line: "yay_7" });
        await sleep(600);
        if (ok()) setArrow(true);
        return;
      }
      sfx.gong();
      fx.rain("petals", 50);
      if (p.mode === "intro") {
        // 0–2 s: the cards rise into a fan and flip into stickers
        void ninja.act("cheer");
        const look = say({ line: "fm_rw_look" });
        await sleep(900);
        setFlipped(true);
        sfx.twinkle();
        await look;
        // 2–4.5 s: the Sticker Book swoops in on petals, thumps, pops its clasp and opens
        setBookState("in");
        sfx.whoosh();
        await sleep(650);
        sfx.bounce();
        const book = say({ line: "fm_rw_book" });
        await sleep(450);
        setBookState("open");
        setPhase("book");
        sfx.pop();
        void ninja.act("power");
        await book;
        // 4.5–9 s: each sticker flies in and presses onto the page on its own word
        const times = (p.list && WORD_TIMES[p.list]) || p.words.map((_, i) => i * 0.8);
        if (p.list && hasLine(p.list)) await sayAt(p.list, times.slice(0, p.words.length), (i) => land(p.words[i], i));
        else for (const [i, w] of p.words.entries()) (land(w, i), await say({ word: w }));
        // 9–12 s: the page glows and the counter thunks into the corner
        await sleep(200);
        sfx.coin();
        await say({ line: "fm_rw_every" });
        // 12–17 s: "Tap a sticker!" (the first wiggles and a hand points; no tap → move on after 4 s)
        if (!ok()) return;
        setWiggle(p.words[0]);
        setTapTime(true);
        await say({ line: "fm_rw_tap" });
        await Promise.race([new Promise<void>((r) => (tapped.current = r)), sleep(4000)]);
        tapped.current = null;
        await sleep(300);
        setTapTime(false);
        setWiggle(null);
        // 17–21 s: the book closes and tucks into the ninja's pack; the big green arrow
        setBookState("shut");
        await sleep(450);
        setBookState("gone");
        sfx.place();
        setPhase("closing");
        void ninja.act("cheer");
        await sleep(350);
        if (!ok()) return;
        setArrow(true);
        await say({ line: p.then === "arrow" ? "fm_rw_next" : "help_next" });
        return;
      }
      // ---- Reward 2: the book is open at once; six new stickers fly in as a rising run
      void ninja.act("power");
      await sleep(600);
      const times = (p.list && WORD_TIMES[p.list]) || p.words.map((_, i) => i * 0.7);
      if (p.list && hasLine(p.list)) await sayAt(p.list, times.slice(0, p.words.length), (i) => land(p.words[i], i));
      else for (const [i, w] of p.words.entries()) (land(w, i), await say({ word: w }));
      if (p.shiny && ok()) {
        // a drumroll, then the shiny fish-dog lands in the centre
        await sleep(300);
        sfx.charge();
        await sleep(500);
        setShinyIn(true);
        setCount((c) => c + 1);
        sfx.great();
        const at = slotXY(Math.min(11, prior.length + p.words.length));
        fx.burst(at.x, at.y, "stars", 28);
        void ninja.act("cheer");
        await say({ line: "fm_rw_shiny" });
      }
      if (p.sound && ok()) {
        // the /s/ stickers hop in turn, each first dot glowing gold
        const hopTimes = WORD_TIMES[p.sound.line] ?? p.sound.words.map((_, i) => i * 0.9);
        const hopSeq = sayAt(p.sound.line, hopTimes.slice(0, p.sound.words.length), (i) => {
          setHop(p.sound!.words[i]);
          const el = document.querySelector(`.st-book [data-sticker="${p.sound!.words[i]}"]`);
          if (el) {
            const at = stageXY(el);
            fx.ring(at.x, at.y, { color: "#ffc53d", r0: 10, r1: 90, width: 8 });
          }
        });
        await hopSeq;
        await sleep(300);
        await say({ sound: p.sound.p });
        setHop(null);
      }
      // the book shuts and flies off to the map
      setBookState("shut");
      await sleep(450);
      setBookState("gone");
      sfx.whoosh();
      await sleep(p.petal ? 250 : 500);
      if (p.petal && ok()) {
        // the first petal (first time only), on a stage of its own now the book has gone: the bamboo dims, and a real
        // World Flower rises in the play area with every petal in its own colours, softened, lost in the mist; on "its
        // petal is shining" the /s/ petal pops out of the mist to twice its size (rays, twinkles and a chime) and
        // settles, bigger and glowing, and the ninja powers up facing it. It shines on through the next line and its
        // sound, then holds before it flies to the map.
        setFlower("up");
        await sleep(200);
        const t = performance.now();
        const said = say({ line: "fm_rw2_petal" });
        await sleep(Math.max(0, PETAL_SHINES_AT * 1000 - (performance.now() - t) * FAST));
        if (ok()) {
          setFlower("lit");
          sfx.petal();
          store.set((s) => void (s.petals.includes(p.petal!) || s.petals.push(p.petal!)));
          sfx.great();
          const el = document.querySelector(`.st-flower [data-p="${p.petal}"]`);
          const at = el ? stageXY(el) : { x: 730, y: 300 };
          setRaysAt(at);
          fx.ring(at.x, at.y, { color: "#fff4dc", r0: 20, r1: 220, width: 14, life: 26 });
          fx.ring(at.x, at.y, { color: "#ffe38a", r0: 40, r1: 330, width: 10, life: 34 });
          fx.twinkle(at.x, at.y, ["#fff4dc", "#ffe38a", "#ff9ec0"], 18, 8, 30);
          fx.glow(at.x, at.y, ["#fff6c8", "#ffe38a", "#ffc53d"], 12, 70, 1.8);
          fx.lines(at.x, at.y, 12, "#fff4dc", 80);
          void ninja.act("power");
          // twinkles keep rising round it as it settles
          for (let i = 1; i <= 3; i++) setTimeout(() => ok() && fx.twinkle(at.x + (Math.random() - 0.5) * 120, at.y + (Math.random() - 0.5) * 120, ["#fff4dc", "#ffe38a"], 6, 4, 24), i * 450);
        }
        await said;
        // what a petal is, while it glows: one petal, one sound (NARRATIVE_AUDIT F03; the film and the flower's own
        // introduction may both have been skipped). It flashes on its sound.
        if (ok()) {
          await say([{ gap: 150 }, { line: "audit_petal_means" }, { gap: 300 }]);
          setFlash(true);
          await say({ sound: p.petal });
          setFlash(false);
        }
        // it holds, glowing, before the flower flies off into the map's World Flower button (it has shone for 3 s
        // since "its petal is shining", through "This petal is for the sound…" and its sound)
        await sleep(900);
        if (ok()) {
          setFlower("away");
          sfx.whoosh();
          await sleep(750);
        }
      }
      if (!ok()) return;
      if (p.then === "map") p.onNext();
      else setArrow(true);
    })();
    return () => void (alive.current = false);
  }, []);
  // the arrow bounces harder after 10 s, and Sensei asks once more
  useEffect(() => {
    if (!arrow) return;
    const t = setTimeout(() => {
      setHard(true);
      void say({ line: p.then === "arrow" ? "fm_rw_next" : "help_next" });
    }, 10000);
    return () => clearTimeout(t);
  }, [arrow]);

  const onSticker = (w: string, el: HTMLElement) => {
    if (!tapTime) return;
    sfx.pop();
    const at = stageXY(el);
    fx.burst(at.x, at.y, "stars", 10);
    el.animate([{ rotate: "0deg", scale: "1" }, { rotate: "360deg", scale: "1.3" }, { rotate: "360deg", scale: "1" }], { duration: 600 }).playbackRate = FAST;
    setWiggle(null);
    void ninja.act("cheer");
    void sayStickerWord(w, stickerKind(w)).then(() => tapped.current?.());
  };

  const pages = [...prior, ...p.words];
  // (bots tap the arrow only in the first session's chain; after a replay from the map, the level is over and the
  // treadmill looks for "Play again", as on every other reward)
  (window as any).__snState = { scene: "stickers", mode: p.mode, next: arrow ? (p.then === "next" ? null : "Next") : tapTime ? `sticker ${p.words[0]}` : null, done: arrow };
  const book = bookState === "open" || bookState === "shut";
  return (
    <div className={`scene st-reward ${phase}`}>
      <img className="bg-img" src={img("bg_bamboo")} alt="" style={{ filter: "blur(3px) brightness(.8)" }} />
      <div className="vignette" />
      <NinjaSpot size={270} x={34} />
      {/* the cards rise into a fan and flip into stickers */}
      {p.mode === "intro" && phase === "fan" && (
        <div className="st-fan">
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
        <div className={`st-book ${bookState}`} style={{ left: BOOK.x, top: BOOK.y, width: BOOK.w, height: BOOK.h }}>
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
                  <Sticker
                    w={w}
                    kind={stickerKind(w)}
                    size={SLOT}
                    className={`${isPrior ? "" : "land"} ${wiggle === w ? "wiggle" : ""} ${hop === w ? "hop" : ""}`}
                    onTap={(el) => onSticker(w, el)}
                    disabled={!tapTime}
                  />
                )}
                {wiggle === w && <TapHint show style={{ right: -40, bottom: -50 }} />}
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
        <div className="st-mini">
          {p.words.slice(0, 5).map((w, i) => <Sticker key={w} w={w} kind={stickerKind(w)} size={96} className="st-mini-fly" style={{ "--i": i } as CSSProperties} />)}
          <div className="st-mini-book"><img src={img("item_sticker_book")} alt="" /><span className="st-plus">+{plus}</span></div>
        </div>
      )}
      {arrow && (
        <div className="st-next">
          {p.onReplay && p.then !== "arrow" && (
            <RoundButton label="Play again" onClick={p.onReplay}><svg viewBox="0 0 64 64"><path fill="none" stroke="#2b1d14" strokeWidth={7} strokeLinecap="round" d="M48 34a16 16 0 1 1-6-13M44 10v12H32" /></svg></RoundButton>
          )}
          <div style={{ position: "relative" }} className={hard ? "st-bounce-hard" : "st-bounce"}>
            <RoundButton label="Next" className="go" onClick={p.onNext} style={{ width: 150, height: 150 }}><Icon.next /></RoundButton>
            <TapHint show style={{ right: -80, bottom: -30 }} />
          </div>
        </div>
      )}
      <SenseiDock />
    </div>
  );
}
