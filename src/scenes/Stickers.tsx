// The Sticker Book rewards (docs/FIRST_MINUTES.md §6, §8; the script is docs/TEACHER_SCRIPT.md §3.6, §3.8, §5.7).
// Stickers first; stars stay in the background.
//   · Reward 1 (the first time): the lesson's cards rise into a fan and flip into glossy die-cut stickers ("Look! Your
//     pictures are turning into stickers!", the book swooping in under its last words); the Sticker Book waits closed
//     for the child to open it ("This is your Sticker Book! Tap it to open it.", the hand on its clasp); the stickers
//     fall onto the pages one after another, a sparkle each; the page glows and the "5" thunks in ("Every picture you
//     play with becomes a sticker."). Then the child's turn, "Tap a sticker, and it will say its word." (Show me again
//     plays the show again: the turn stays the child's); the sticker says "sun… s · u · n" while the rabbit and the
//     tortoise peek in, "Fast, then slow, like the rabbit and the tortoise!"; then the last step holds on the green Next,
//     the book tucking into the ninja's pack as Sensei says what's next ("Next, we're going to read some pictures, the
//     ninja way. Tap the green arrow when you're ready.").
//   · Reward 2 (the first time): the child's hands every 12 s at most (verify fix round 2, Round 13's "too long and
//     boring": it was 32 s of talk with nothing to tap). A warm-up's Reward 2 opens on the closed Sticker Book, the
//     hand on its clasp (the lesson has just said "Let's put your new pictures in your Sticker Book.", and Reward 1
//     taught the tap): the child opens it. Then two held steps (TEACHER_SCRIPT §3.8's ▶ after the /s/, NAVIGATION §5.B):
//     (1) the new stickers fall in, a shiny holographic sticker lands on a drumroll, the /s/ stickers hop ("They
//     all start with… /s/"), ▶; (2) the book flies to the map and the first petal shines through the mist on a real
//     World Flower and lifts out of it as a big petal (misty), "Tap your petal, and hear its sound.": it blooms on the
//     child's tap, and then "This is the World Flower. Your sounds make it shine." says what the sound just did, ▶.
//     Next goes to the map, which introduces itself (App.tsx WorldMap, intro "stickerbook").
//   · The first session's two rewards don't say their lists (fm_rw1_list, fm_rw2_list) or "Ooh, a shiny sticker!": the
//     lessons have just named every picture, and with the teacher's voice (the book to open, the sticker turn, "Fast,
//     then slow…", the petal turn) the lists no longer fit the rewards' 26 s and 30 s caps (FIRST_MINUTES §14; B4,
//     27 Sep). A reward with no list line (the school path) still names each sticker as it lands.
//   · Every later reward (4–6 s), one held step: the new stickers fly into the Sticker Book icon in the corner, "+N";
//     "More stickers for your Sticker Book!" on a session's first two rewards only (SCRIPT_FIXES C7.3).
// Nothing moves on by itself (docs/NAVIGATION.md): every step holds on Next; Hear it again plays the step again (a
// reward's first step with the level's closing line first, rule 7); Back plays the step before.
// "Play again" (↻, a warm-up replayed from the map)
// sits where Back goes, in the nav row, once the last step has finished.
// A picture sticker has the same plate colour as its card, a cream die-cut edge and a gloss sweep, and no spelling.
// It gains a gold edge and its written word once the child has read or spelt the word (a word sticker), whose
// spellings light one by one as a sticker says its sounds (a spelling's voice: "tile", SOUND_DISPLAY r65).
// Every animation here is transform or opacity (docs/PERF.md); the idle ladders wait on timers and speech events, never
// on a poll or a frame loop.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { say, sfx, playMusic, preload, urls, hush, onClip, onSpeaking, isSpeaking, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import { store, recordMet } from "../engine/store";
import { WORD_BY_TEXT, type PhonemeId } from "../content/phonics";
import { LEVELS } from "../content/worlds";
import { WORD_TIMES, canStretch, hasLine } from "../content/warmups";
import { wordAt } from "../content/word-times";
import { img, fx, sleep, tapProps, useHelp, RoundButton, Icon, TapHint, SenseiDock, stageXY, isUpright, onUpright } from "../ui/ui";
import { usePresentation, useNav, navSpeed, nudgeNext, NAV_SLOTS, slotStyle, type Step } from "../ui/nav";
import { SoundBadge } from "../ui/SoundBadge";
import { NinjaSpot, ninja } from "../ui/Ninja";
import { heard, onceInSave, sessionNow } from "./narrate";
import { plateColour } from "./Early";
import { WorldFlower } from "./Tree";
import "../styles/stickers.css";

/** A teacher-voice line if it is in the script, else the line it replaces (every caller guards: TEACHER_SCRIPT §7). */
const L = (id: string, old: string) => (hasLine(id) ? id : old);

// ---------------------------------------------------------------- one sticker
export type StickerKind = "picture" | "word" | "shiny";
/** What a sticker is now: shiny, a word sticker (read or spelt), or a picture sticker. */
export function stickerKind(w: string, s = store.get()): StickerKind {
  if (s.shiny?.includes(w)) return "shiny";
  return (s.words[w]?.ok ?? 0) > 0 ? "word" : "picture";
}
/** The written word, one span per spelling (< sh > is one span), so its letters can light as their sounds are said. */
function Spelt({ w }: { w: string }) {
  const segs = WORD_BY_TEXT[w]?.segs;
  if (!segs || segs.map((s) => s.g).join("") !== w) return <>{w}</>;
  return (
    <>
      {segs.map((s, i) => (
        <span key={i} className="stk-seg">
          {s.g}
        </span>
      ))}
    </>
  );
}
/** A die-cut sticker: the picture on its plate colour with a cream edge and a gloss sweep; a word sticker has a gold
 *  edge and its written word; a shiny one has a holographic rainbow sweep. */
export function Sticker({ w, kind, size = 110, onTap, className = "", style, label, disabled }: { w: string; kind: StickerKind; size?: number; onTap?: (el: HTMLElement) => void; className?: string; style?: CSSProperties; label?: string; disabled?: boolean }) {
  const pic = !!WORD_BY_TEXT[w]?.pic || !WORD_BY_TEXT[w];
  const inner = (
    <>
      {/* a word with no picture still gets a coloured plate (never plain white) and a speaker: tap it and hear it */}
      <span className="st-plate" style={{ background: pic ? plateColour(w) : wordPlate(w) }}>
        {pic ? (
          <img src={img(`pic_${w}`)} alt="" draggable={false} />
        ) : (
          <span className="st-text" style={{ fontSize: Math.round(size * (w.length > 4 ? 0.24 : 0.3)) }}>
            <Spelt w={w} />
          </span>
        )}
        {!pic && <span className="st-hear" aria-hidden="true"><Icon.speaker /></span>}
        <span className="st-gloss" aria-hidden="true" />
        {kind === "shiny" && <span className="st-holo" aria-hidden="true" />}
      </span>
      {/* (data-w: its shimmer is a brighter copy of it, stickers.css .stk-word::after) */}
      {kind === "word" && pic && (
        <span className="stk-word" data-w={w}>
          <Spelt w={w} />
        </span>
      )}
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
/**
 * A sticker says itself. A picture sticker: the word fast, then its slow way ("sun… s · u · n", the pure sounds with
 * gaps); with `fs` (the screen shows the tortoise and the rabbit) the rabbit hops on the word and the tortoise steps on
 * each sound. A word sticker (read or spelt): its sounds, each spelling lighting as its sound plays (a spelling's voice,
 * "tile": no petal, SOUND_DISPLAY r65), then the word with every letter lit. `el`: the sticker, for its letters.
 */
export function sayStickerWord(w: string, kind: StickerKind, el?: Element | null, o: { fs?: boolean } = {}) {
  const word = WORD_BY_TEXT[w];
  if (kind === "word" && word) {
    const segs = el ? [...el.querySelectorAll<HTMLElement>(".stk-seg")] : [];
    const light = (i: number | "all" | null) => segs.forEach((s, k) => s.classList.toggle("lit", i === "all" || k === i));
    const off = onClip((id) => id === `word:${word.text}` && light("all"));
    return say([{ sounds: word.segs, gap: 260, show: "tile", onSeg: (i) => light(i) }, { gap: 150 }, { word: word.text }]).finally(() => {
      off();
      light(null);
    });
  }
  if (!canStretch(w)) return say({ word: w });
  if (o.fs) navSpeed("fast");
  return say([{ word: w }, { gap: 350 }, { stretch: w }]);
}

// ---------------------------------------------------------------- "More stickers…", twice a session
// SCRIPT_FIXES C7.3, TEACHER_SCRIPT §5.7: "More stickers for your Sticker Book!" on a session's first two rewards; later
// ones let the stickers fly into the book silently (the "+N" says it). One count for both kinds of reward: App.tsx's
// level reward can use these too.
const moreCount = { session: -1, n: 0 };
export const moreStickersDue = (): boolean => (moreCount.session === sessionNow() ? moreCount.n : 0) < 2;
export function moreStickersSaid() {
  if (moreCount.session !== sessionNow()) {
    moreCount.session = sessionNow();
    moreCount.n = 0;
  }
  moreCount.n++;
}

// ---------------------------------------------------------------- an idle ladder in game time
/**
 * docs/NAVIGATION.md §3.2, a turn: `fire(k)` once `steps[k]` game ms of quiet have gone by (Sensei speaking or the phone
 * held upright don't count; any tap starts it again). It sleeps on a timer and wakes on speech events: no polling, no
 * frame loop. Returns stop().
 */
function idleLadder(steps: readonly number[], fire: (k: number) => void): () => void {
  let idle = 0, from = 0, k = 0, t = 0, alive = true;
  const sync = () => {
    if (!alive) return;
    if (from) idle += (performance.now() - from) * FAST;
    from = 0;
    clearTimeout(t);
    while (k < steps.length && idle >= steps[k] - 5) fire(k++);
    if (k < steps.length && !isUpright() && !isSpeaking()) {
      from = performance.now();
      t = window.setTimeout(sync, steps[k] - idle); // (setTimeout runs in game time)
    }
  };
  const reset = () => {
    idle = 0;
    from = 0;
    k = 0;
    sync();
  };
  const offSpeaking = onSpeaking(sync);
  const offUpright = onUpright(sync);
  window.addEventListener("pointerdown", reset, true);
  sync();
  return () => {
    alive = false;
    clearTimeout(t);
    offSpeaking();
    offUpright();
    window.removeEventListener("pointerdown", reset, true);
  };
}

// ---------------------------------------------------------------- the reward
export interface StickerRewardProps {
  /** the lesson's stickers, in order */
  words: string[];
  /** "intro": Reward 1 the first time; "open": Reward 2 the first time; "short": every later reward */
  mode: "intro" | "open" | "short";
  /** the lesson's one-clip list (fm_rw1_list / fm_rw2_list): a warm-up reward. Its words were all named in the lesson
   *  just played, so the stickers land on a run and the list isn't said (the caps: the header); without one, each
   *  sticker says its word as it lands */
  list?: string;
  /** Reward 2: the shiny sticker (the fish-dog), landing on a drumroll */
  shiny?: string;
  /** Reward 2: "Sun, sock, sausage and sunflower. They all start with... /s/" */
  sound?: { p: PhonemeId; words: string[]; line: string };
  /** Reward 2, the first time: the petal for this sound shines through the mist */
  petal?: PhonemeId;
  /** where Next goes: "arrow" the next lesson (first session), "map" the map (the book flies there), "next" the usual */
  then: "arrow" | "map" | "next";
  /** the level's closing line: the reward's Hear it again says it first (docs/NAVIGATION.md rule 7); a reward after a
   *  closing line never leads with "You did it!" (TEACHER_SCRIPT §5.7) */
  closing?: string;
  onNext: () => void;
  onReplay?: () => void;
}

/** fm_rw2_petal "You found your very first sound! Look, its petal is shining through the mist.": the petal shines as
 *  "its petal is shining" starts (seconds into the clip): the line's word timings once it has them, else the Erinome
 *  take of 27 Sep (its speech islands: "Look," 2.62, "its" 3.14; the Sulafat take's was 3.4). */
const PETAL_SHINES_AT = wordAt("fm_rw2_petal", "its") ?? 3.14;
/** Reward 1's last line: where Next turns green (seconds into the clip), in the pause just before "Tap the green arrow",
 *  once what comes next has been said: the arrow lights, then Sensei names it (these takes' pauses, silencedetect,
 *  27 Sep: tv_rw_next "…the ninja way." ends 3.46, "Tap" 4.09; tv_next_game "…the next game," ends 1.55, "tap" 1.85).
 *  A line without an entry: its "tap" word. */
const GREEN_AT: Record<string, number> = { tv_rw_next: 3.46, tv_next_game: 1.55, fm_rw_next: 0, nav_ready: 0 };
const greenAt = (id: string) => GREEN_AT[id] ?? wordAt(id, "tap") ?? 0;
/** A warm-up reward's stickers land one after another, this far apart (game ms), a sparkle each: Reward 2's on their
 *  own, Reward 1's spread under "Every picture you play with becomes a sticker." (2.5 s). */
const RUN_MS = 280;
const EVERY_RUN_MS = 380;
/** Book geometry (stage px): two pages of 3 × 2 stickers. */
const BOOK = { x: 392, y: 104, w: 676, h: 404 };
const SLOT = 96;
const slotXY = (i: number) => {
  const page = Math.floor(i / 6) % 2, j = i % 6, c = j % 3, r = Math.floor(j / 3);
  const pw = (BOOK.w - 24) / 2;
  return { x: BOOK.x + 12 + page * pw + pw / 2 + (c - 1) * 106, y: BOOK.y + BOOK.h / 2 + (r === 0 ? -86 : 86) };
};
/** Reward 1's closed book, waiting to be opened (stage px; stickers.css .st-book-closed) and the hand on its clasp. */
const CLOSED = { x: 570, y: 212, w: 320 };
const CLASP = { x: CLOSED.x + CLOSED.w * 0.586, y: CLOSED.y + CLOSED.w * (528 / 512) * 0.34 };
/** Reward 2's big petal, lifted out of the flower to its right (a hero SoundBadge, 220 wide: SOUND_DISPLAY r7). It
 *  stays clear of Next (y 562 on) and of the flower (x ≤ 940). */
const HERO = { x: 1070, y: 104, w: 220 };
/** The map's World Flower button (App.tsx WorldMap's right-hand column), where the flower and its petal fly. */
const MAP_FLOWER = { x: 1214, y: 282 };

/** A show's held steps (usePresentation), mounted once the show starts holding; `back` adds a Back to the first step
 *  (Reward 1's last step: the book's show again). Draws Play again (in Back's slot) once the last step has finished.
 *  While a step waits for the child (Reward 2's petal: `turn`), Next is not drawn (one thing to tap: it pops in, green,
 *  once the petal has said its sound), and `again` and `help` take over Hear it again and Help (`help` returns true when
 *  it has answered the press). */
function Held({ id, steps, onDone, back, onReplay, turn, again, help }: { id: string; steps: Step[]; onDone: () => void; back?: () => void; onReplay?: () => void; turn?: boolean; again?: () => unknown; help?: (n: number) => boolean }) {
  const { i, ready, replay } = usePresentation(steps, { id, onDone, noBack: !!onReplay, state: false, help: false });
  useNav({ back: back && !onReplay ? back : undefined, again: turn ? again : undefined, next: turn ? null : undefined });
  const readyRef = useRef(ready);
  readyRef.current = ready;
  const helpRef = useRef(help);
  helpRef.current = help;
  // (after the presentation's own Help, so this one is on top: the step again, then the arrow, as usePresentation does)
  useHelp((n) => {
    if (helpRef.current?.(n)) return;
    if (n === 1 || !readyRef.current) replay();
    else nudgeNext();
  }, [i]);
  return onReplay && ready && i === steps.length - 1 ? (
    <RoundButton label="Play again" className="pop-in" onClick={onReplay} style={slotStyle(NAV_SLOTS.row.back)}>
      <Icon.again />
    </RoundButton>
  ) : null;
}

export function StickerReward(p: StickerRewardProps) {
  // Reward 2 after a warm-up (its lesson's last line: "Let's put your new pictures in your Sticker Book."): the book
  // arrives closed and the child opens it, as in Reward 1 (the school path's Reward 2 opens by itself)
  const [tapOpen] = useState(() => p.mode === "open" && !!p.list && hasLine("tv_rw_book"));
  const [phase, setPhase] = useState<"fan" | "book" | "closing" | "done">(p.mode === "intro" ? "fan" : p.mode === "open" ? "book" : "done");
  // stickers already in the book (Reward 2 opens on the page with the first lesson's stickers), as many as leave the
  // spread's 12 slots room for the new ones and the shiny one
  const [prior] = useState(() => {
    if (p.mode !== "open") return [];
    const room = Math.max(0, Math.min(6, 12 - p.words.length - (p.shiny ? 1 : 0)));
    return room ? (store.get().stickers ?? []).filter((w) => !p.words.includes(w) && w !== p.shiny).slice(-room) : [];
  });
  // Reward 1's last step: what comes next (TEACHER_SCRIPT §3.6's tv_rw_next is about W2, "read some pictures")
  const [endLine] = useState(() => {
    if (p.then !== "arrow") return "nav_ready";
    const next = LEVELS.find((l) => l.id === store.get().firstSession?.lessons[1]);
    return next?.warmup === "W2" ? L("tv_rw_next", "fm_rw_next") : L("tv_next_game", "fm_rw_next");
  });
  // a later reward: "More stickers for your Sticker Book!" (the session's first two), "You did it!" only with no closing
  const [more] = useState(() => p.mode === "short" && p.words.length > 0 && moreStickersDue());
  const [landed, setLanded] = useState<string[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [count, setCount] = useState(p.mode === "open" ? prior.length : 0);
  // Reward 1 shows the counter as "Every picture…" is said (the "5" thunks in); Reward 2 counts up from the start
  const [showCount, setShowCount] = useState(p.mode === "open");
  const [pageGlow, setPageGlow] = useState(0);
  const [bookState, setBookState] = useState<"away" | "in" | "open" | "shut" | "gone">(p.mode === "open" && !tapOpen ? "open" : "away");
  const bookRef = useRef(bookState);
  bookRef.current = bookState;
  // Rewards 1 and 2: the closed book waits for the child's tap ("wait"; "asked" once its line has been said, at once in
  // Reward 2; "hard" at 8 s)
  const [bookWait, setBookWait] = useState<"" | "wait" | "asked" | "hard">("");
  const [wiggle, setWiggle] = useState<string | null>(null);
  const [hard, setHard] = useState(false);
  const [tapTime, setTapTime] = useState(false);
  const [tapAsked, setTapAsked] = useState(false);
  // Reward 1's turn has been asked and not yet answered: it stays the child's through Show me again and the question
  // asked again after it (bots: `next` holds, `busy` while Sensei shows or asks)
  const [turnOpen, setTurnOpen] = useState(false);
  const answered = useRef(false); // the child has tapped a sticker in this turn
  const [fsOn, setFsOn] = useState(false); // the rabbit and the tortoise peek in (the first sticker tap)
  const [hop, setHop] = useState<string | null>(null);
  const [shinyIn, setShinyIn] = useState(false);
  // Reward 2's flower: rising in the mist ("up"), its petal shining through it ("shine"), lit on the sound ("lit")
  const [flower, setFlower] = useState<"" | "up" | "shine" | "lit" | "away">("");
  const [heart, setHeart] = useState(false);
  const [flash, setFlash] = useState(false);
  const [raysAt, setRaysAt] = useState<{ x: number; y: number } | null>(null);
  // Reward 2's big petal: lifted out of the flower (`from`), misty until its sound the first time (`intro`)
  const [hero, setHero] = useState<{ key: number; intro: boolean; from: Element | null } | null>(null);
  const [heroTurn, setHeroTurn] = useState<"" | "busy" | "wait" | "asked">("");
  const [heroAway, setHeroAway] = useState(false);
  const [plus, setPlus] = useState<number | null>(null);
  // the "+N" flight has ended: the flown stickers (invisible now) go, and their shimmer and holo sweep with them
  const [flown, setFlown] = useState(false);
  // Reward 1: "show" (the book's show), "turn" (Tap a sticker), "end" (held on Next). Reward 2: "show" while its closed
  // book waits (a warm-up's), then "end". Later rewards: "end".
  const [stage, setStage] = useState<"show" | "turn" | "end">(p.mode === "intro" || tapOpen ? "show" : "end");
  const [replaying, setReplaying] = useState(false); // Show me again is playing the book's show (the turn waits)
  const [take, setTake] = useState(0); // a new run of Reward 1's show (Back from its last step, Show me again)
  const tapped = useRef<(() => void) | null>(null);
  const openBook = useRef<(() => void) | null>(null);
  const petalTap = useRef<(() => void) | null>(null);
  const petalEnd = useRef<(() => void) | null>(null); // ends Reward 2's petal turn (Back, Hear it again, leaving)
  const bloomed = useRef(false); // the big petal has bloomed once (a replay shows it in colour)
  const heroN = useRef(0);
  const flowerRef = useRef(flower);
  flowerRef.current = flower;
  const alive = useRef(true);
  const leaving = useRef(false);
  const stickerEl = useRef<HTMLElement | null>(null);
  const ok = () => alive.current;
  useEffect(() => {
    alive.current = true;
    playMusic(null);
    // every clip the show says, so each line follows the last without a load between (the rewards are timed)
    const lines =
      p.mode === "intro"
        ? ["fm_rw_look", L("tv_rw_book", "fm_rw_book"), L("tv_rw_every", "fm_rw_every"), L("tv_rw_tap", "fm_rw_tap"), "tv_rw_fast_slow", endLine]
        : p.mode === "open"
          ? [...(tapOpen ? ["tv_rw_book"] : []), ...(p.sound ? [p.sound.line] : []), ...(p.petal ? ["fm_rw2_petal", "tv_rw2_tap_petal", "tv_rw2_flower"] : [])]
          : [];
    preload([
      ...lines.filter(hasLine).map(urls.line),
      ...(p.list ? [p.words[0]] : p.words).map(urls.word),
      ...(p.mode === "intro" && canStretch(p.words[0]) ? [urls.stretch(p.words[0])] : []),
      ...[p.sound?.p, p.petal].filter((x): x is PhonemeId => !!x).map(urls.sound),
    ]);
    // the stickers are the child's now (the Sticker Book keeps them in the order they were collected)
    for (const w of p.words) recordMet(w);
    if (p.shiny) recordMet(p.shiny, true);
    if (p.mode !== "short") store.set((s) => void (s.seenBook = true));
    return () => {
      alive.current = false;
      petalEnd.current?.();
    };
  }, []);
  // Reward 2: the flower's petal lights as its sound plays (the child's tap, or the petal saying it by itself), with the
  // big petal's bloom (SoundBadge's introduction animation keys on the same clip)
  useEffect(() => {
    if (!p.petal) return;
    const petal = p.petal;
    return onClip((id, _s, _e, info) => {
      // (only once the petal shines: the stickers' "…They all start with… /s/" swells the nav row's petal, not this one)
      if (id !== `sound:${petal}` || info?.show === "tile" || info?.show === "hidden" || flowerRef.current !== "shine") return;
      bloomed.current = true;
      setFlower("lit");
      setHeart(true);
      setFlash(true);
      setTimeout(() => alive.current && setFlash(false), 700);
      const el = document.querySelector(`.st-flower [data-p="${petal}"]`);
      const at = el ? stageXY(el) : { x: 730, y: 300 };
      fx.ring(at.x, at.y, { color: "#fff4dc", r0: 20, r1: 200, width: 12, life: 24 });
      fx.twinkle(at.x, at.y, ["#fff4dc", "#ffe38a", "#ff9ec0"], 12, 6, 26);
      void ninja.act("power", undefined, { react: false });
    });
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
  const land = (w: string, i: number, run = false) => {
    setLanded((l) => (l.includes(w) ? l : [...l, w]));
    setCount((c) => c + 1);
    sfx.place();
    if (run) sfx.twinkle(); // (the run: a sparkle on each landing, the tape pressing on)
    const at = slotXY(prior.length + i);
    fx.twinkle(at.x, at.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 8, 4);
    // (the run is quicker than a move: the ninja cheers on the first and jumps on the last)
    if (!run) void ninja.act(i % 2 ? "jump" : "cheer");
    else if (i === 0 || i === p.words.length - 1) void ninja.act(i ? "jump" : "cheer");
  };
  /** The stickers land: a warm-up reward's one after another on a run (the lesson has just named them all), else each
   *  saying its word. Resolves as the last one starts to land. */
  const landAll = async (live: () => boolean, apart = RUN_MS) => {
    for (const [i, w] of p.words.entries()) {
      if (!live()) return;
      if (p.list) {
        if (i) await sleep(apart);
        if (!live()) return;
        land(w, i, true);
      } else {
        land(w, i);
        await say({ word: w });
      }
    }
  };

  // ---------------------------------------------------------------- Reward 1: the book's show, then the child's turn
  useEffect(() => {
    if (p.mode !== "intro" || stage !== "show") return;
    let live = true;
    const on = () => live && alive.current;
    // the first run waits for the child to open the book; a replay (Show me again, Back) opens it by itself
    const first = take === 0;
    (async () => {
      // the picture as it starts (a replay starts from the cards again)
      setPhase("fan");
      setFlipped(false);
      setBookState("away");
      setBookWait("");
      setLanded([]);
      setCount(0);
      setShowCount(false);
      setWiggle(null);
      setHard(false);
      setTapTime(false);
      setTapAsked(false);
      sfx.gong();
      fx.rain("blossoms", 50);
      // the cards rise into a fan and flip into stickers
      void ninja.act("cheer");
      const look = say({ line: "fm_rw_look" });
      await sleep(900);
      if (!on()) return;
      setFlipped(true);
      sfx.twinkle();
      // the Sticker Book swoops in closed (the stickers lift to make room) and bounces, under the end of "…turning into
      // stickers!" (the flips have finished by 1.9 s; the line ends at 2.8)
      await sleep(1100);
      if (!on()) return;
      setBookState("in");
      sfx.whoosh();
      await sleep(650);
      if (!on()) return;
      sfx.bounce();
      await look;
      if (!on()) return;
      if (first && hasLine("tv_rw_book")) {
        // "This is your Sticker Book! Tap it to open it." (the hand on its clasp): it opens on the child's tap
        setBookWait("wait");
        const opened = new Promise<void>((r) => (openBook.current = r));
        void say({ line: "tv_rw_book" }).then(() => on() && setBookWait((b) => (b === "wait" ? "asked" : b)));
        await opened;
        openBook.current = null;
        if (!on()) return;
        setBookWait("");
      } else if (!hasLine("tv_rw_book")) {
        // (before the teacher-voice lines)
        const book = say({ line: "fm_rw_book" });
        await sleep(450);
        if (!on()) return;
        popOpen();
        await book;
      } else {
        // a replay (Show me again, Back): Sensei opens the book herself, with no line (tv_rw_book asks the child to
        // open it, once per save; fm_rw_book is retired on these paths)
        popOpen();
        await sleep(300);
      }
      if (!on()) return;
      await sleep(150); // (the pages open under the first sticker: st-open, 0.5 s)
      if (!on()) return;
      /** the page glows and the counter thunks into the corner */
      const glow = () => {
        setShowCount(true);
        setPageGlow((g) => g + 1);
        sfx.coin();
      };
      const every = { line: L("tv_rw_every", "fm_rw_every") };
      if (p.list) {
        // "Every picture you play with becomes a sticker." as the stickers fall onto the pages one after another (the
        // words are the picture); the page glows as the last one settles
        const said = say(every);
        await landAll(on, EVERY_RUN_MS);
        await sleep(300);
        if (!on()) return;
        glow();
        await said;
      } else {
        // each sticker says its word as it lands; then the glow, and the line
        await landAll(on);
        await sleep(200);
        if (!on()) return;
        glow();
        await say(every);
      }
      if (!on()) return;
      // the child's turn: "Tap a sticker, and it will say its word." (the first wiggles and a hand points; it waits)
      setReplaying(false);
      setStage("turn");
    })();
    return () => {
      live = false;
      openBook.current?.();
      openBook.current = null;
    };
  }, [stage, take]);
  /** The book pops its clasp and opens. */
  const popOpen = () => {
    setBookState("open");
    setPhase("book");
    sfx.pop();
    void ninja.act("power");
  };
  /** The child taps the closed book: it opens (cutting "…Tap it to open it." short if it is still being said). */
  const tapBook = (el: HTMLElement) => {
    if (!openBook.current) return;
    if (isSpeaking()) hush();
    const at = stageXY(el);
    fx.burst(at.x, at.y, "stars", 14);
    fx.ring(at.x, at.y, { color: "#ffe38a", r0: 20, r1: 180, width: 10 });
    popOpen();
    openBook.current();
  };
  // ---------------------------------------------------------------- Reward 2: the child opens the book
  // The lesson has just said "Let's put your new pictures in your Sticker Book.": a gong, the book swoops in closed and
  // bounces, and it is the child's to open at once (the hand on its clasp; no line: Reward 1 taught the tap), so the
  // talk from the lesson's last tap to this one stays under 12 s. Its pages open on the child's tap; the held steps
  // follow (the stickers fall in).
  useEffect(() => {
    if (!tapOpen || stage !== "show") return;
    let live = true;
    const on = () => live && alive.current;
    (async () => {
      // (the book swoops in at once: the lesson's last line has just ended)
      sfx.gong();
      void ninja.act("cheer");
      setBookState("in");
      sfx.whoosh();
      await sleep(650);
      if (!on()) return;
      sfx.bounce();
      const opened = new Promise<void>((r) => (openBook.current = r));
      setBookWait("asked");
      await opened;
      openBook.current = null;
      if (!on()) return;
      setBookWait("");
      fx.rain("blossoms", 40);
      setStage("end"); // (the pages open, st-open 0.5 s, as the step starts: its first sticker falls in 250 ms later)
    })();
    return () => {
      live = false;
      openBook.current?.();
      openBook.current = null;
    };
  }, [stage]);
  // the closed book's idle ladder: 8 s it bounces harder and Sensei asks once more; 16 s the ninja points at it
  useEffect(() => {
    if (!bookWait) return;
    return idleLadder([8000, 16000], (k) => {
      if (k === 0) {
        setBookWait("hard");
        void say({ line: "tv_rw_book" });
      } else {
        const el = document.querySelector(".st-book-closed.wait");
        if (el) void ninja.act("jump", el, { react: false });
      }
    });
  }, [!!bookWait]);

  useEffect(() => {
    if (p.mode !== "intro" || stage !== "turn") return;
    let live = true;
    setWiggle(p.words[0]);
    setTapTime(true);
    setTapAsked(false);
    answered.current = false;
    void say({ line: L("tv_rw_tap", "fm_rw_tap") }).then(() => {
      if (!live || answered.current) return; // (a tap that cut the question short has answered it)
      setTapAsked(true);
      setTurnOpen(true);
    });
    // idle (TEACHER_SCRIPT §3.6): 8 s the sticker wiggles harder and Sensei asks once more; 16 s the ninja points at it;
    // then quiet. Never answered for the child.
    const stop = idleLadder([8000, 16000], (k) => {
      if (k === 0) {
        setHard(true);
        void say({ line: L("tv_rw_tap", "fm_rw_tap") });
      } else if (stickerEl.current) void ninja.act("jump", stickerEl.current, { react: false });
    });
    (async () => {
      await new Promise<void>((r) => (tapped.current = r));
      tapped.current = null;
      if (!live) return;
      stop();
      // the first sticker tap (once a save): "Fast, then slow, like the rabbit and the tortoise!"
      if (onceInSave("rw:fast-slow") && hasLine("tv_rw_fast_slow")) {
        await sleep(150);
        if (!live || !alive.current) return;
        if (await say({ line: "tv_rw_fast_slow" })) heard("rw:fast-slow");
      } else await sleep(300);
      // (the last step follows at once: its book tucks away as Sensei says what's next)
      if (live && alive.current) {
        setFsOn(false);
        setStage("end");
      }
    })();
    return () => {
      live = false;
      stop();
      tapped.current = null;
    };
  }, [stage, take]);
  /** Show me again (the turn): the book's show once more, then "Tap a sticker…" again. It never answers the turn. */
  const showAgain = () => {
    setReplaying(true);
    setTake((t) => t + 1);
    setStage("show");
  };
  const bookAsk = (): Say[] => [{ line: L("tv_rw_book", "fm_rw_book") }];
  const turnAsk = (): Say[] => [{ line: L("tv_rw_every", "fm_rw_every") }, { gap: 300 }, { line: L("tv_rw_tap", "fm_rw_tap") }];
  // Reward 2's closed book: Hear it again says what asked for it, the lesson's closing line first (rule 7)
  const linkAgain = (): Say[] => [...(p.closing ? [{ line: p.closing }, { gap: 300 }] : []), ...(hasLine("tv_rw_link_book") ? [{ line: "tv_rw_link_book" }] : bookAsk())];
  useNav({
    again: p.mode === "intro" && stage === "turn" ? () => say(turnAsk()) : p.mode !== "short" && stage === "show" ? (bookWait ? () => say(p.mode === "open" ? linkAgain() : bookAsk()) : null) : undefined,
    show: p.mode === "intro" && stage === "turn" ? showAgain : null,
    // the rabbit and the tortoise, beside the speaker, from the first sticker tap (the sticker says it fast, then slow)
    speed: fsOn ? {} : null,
  });
  // Help: while the book waits, how to open it (Reward 2's second press: the ninja points at it too); in the turn, the
  // question (then with its explanation). The held steps have their own (Held).
  useHelp((n) => {
    if (bookWait) {
      void say(bookAsk());
      const el = p.mode === "open" && n > 1 ? document.querySelector(".st-book-closed.wait") : null;
      if (el) void ninja.act("jump", el, { react: false });
      return;
    }
    if (stage === "turn") return void say(n === 1 ? { line: L("tv_rw_tap", "fm_rw_tap") } : turnAsk());
  }, [stage, !!bookWait]);

  // ---------------------------------------------------------------- the held steps
  // each step's enter() puts its picture back as it was when the step began, so Back and Hear it again replay it
  const firstRun = useRef<Record<string, boolean>>({});
  const replayed = (key: string) => {
    const again = !!firstRun.current[key];
    firstRun.current[key] = true;
    return again;
  };
  const withClosing = (again: boolean, rest: Say[]): Say[] => (again && p.closing ? [{ line: p.closing }, ...(rest.length ? [{ gap: 300 }] : []), ...rest] : rest);
  const steps: Step[] = [];
  if (p.mode === "short") {
    steps.push({
      key: "plus",
      enter: () => (setPlus(null), setFlown(false)),
      run: async (live) => {
        const again = replayed("plus");
        // later rewards: the new stickers fly into the book icon in the corner, "+N". The level's closing line was its
        // praise, so no "You did it!" after it (TEACHER_SCRIPT §5.7); "More stickers…" on the session's first two only
        sfx.fanfare();
        void ninja.act("cheer");
        await sleep(300);
        if (!live()) return;
        const lead: Say[] = p.closing ? [] : [{ line: "yay_7" }];
        if (p.words.length) {
          setPlus(p.words.length);
          if (more) lead.push(...(lead.length ? [{ gap: 300 }] : []), { line: "fm_rw_more" });
        }
        const said = await say(withClosing(again, lead));
        if (said && more && !again) moreStickersSaid();
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
          // the book closes and tucks into the ninja's pack, as Sensei starts to say what's next
          setTapTime(false);
          setWiggle(null);
          setBookState("shut");
          void sleep(450).then(() => {
            if (!live()) return;
            setBookState("gone");
            sfx.place();
            setPhase("closing");
            void ninja.act("cheer");
          });
        } else setBookState((b) => (b === "shut" ? "gone" : b)); // (a replay before the book had tucked away)
        // "Next, we're going to read some pictures, the ninja way. Tap the green arrow when you're ready.": the arrow
        // turns green in the pause before "Tap the green arrow" (the step ends there), so what comes next is always
        // heard before a tap can cut it, and the arrow lights just before Sensei names it. (A replay keeps Next green.)
        const said = say(withClosing(again, [{ line: endLine }]));
        const at = again ? 0 : greenAt(endLine);
        if (at > 0) await Promise.race([said, sleep(at * 1000)]);
      },
    });
  }
  if (p.mode === "open") {
    const petal = p.petal;
    /** the flower, its big petal and the join-in put away (a step's picture as it begins) */
    const noPetal = () => {
      setFlower("");
      petalEnd.current?.();
      setHero(null);
      setHeroTurn("");
      setHeroAway(false);
      setHeart(false);
      setRaysAt(null);
      setFlash(false);
    };
    // ---- Reward 2, step 1 (TEACHER_SCRIPT §3.8, ending on its ▶): the book is open; the new stickers fall in on a run;
    // the shiny sticker lands on a drumroll; the /s/ stickers hop ("…They all start with… /s/", the nav row's petal
    // swelling on the sound). Held on Next: the child's tap between the stickers and the petal (verify fix round 2: the
    // one merged step was 32 s of talk with nothing to tap).
    steps.push({
      key: "stickers",
      sound: p.sound?.p,
      enter: () => {
        setHop(null);
        noPetal();
        setPhase("book");
        setBookState("open");
        setLanded([]);
        setCount(prior.length);
        setShinyIn(false);
      },
      run: async (live) => {
        const again = replayed("stickers");
        if (again && p.closing) await say({ line: p.closing });
        if (!live()) return;
        if (!again && !tapOpen) {
          // a gong, and the book pops open on a shower of blossoms (the child's own tap opened it: both played then)
          sfx.gong();
          fx.rain("blossoms", 40);
        }
        void ninja.act("power");
        await sleep(250);
        if (!live()) return;
        await landAll(live);
        if (p.shiny && live()) {
          // a drumroll under the last landings, then the shiny sticker lands in its slot, and the ninja laughs
          sfx.charge();
          await sleep(500);
          if (!live()) return;
          setShinyIn(true);
          setCount((c) => c + 1);
          sfx.great();
          const at = slotXY(Math.min(11, prior.length + p.words.length));
          fx.burst(at.x, at.y, "stars", 28);
          void ninja.act("cheer");
          await sleep(700);
          if (!live()) return;
        } else if (p.list) {
          await sleep(400); // (the run's last sticker settles)
          if (!live()) return;
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
          await sleep(200);
          if (!live()) return;
          // the sound the stickers share: the nav row's petal (this step's `sound`) swells on it
          await say({ sound: p.sound.p, show: "petal" });
          setHop(null);
        }
      },
    });
    // ---- step 2, with a petal due: the book flies to the map and the first petal shines through the mist (petalShow),
    // the child's tap blooms it, then Next goes to the map. (No nav-row petal here: the big petal is the sound,
    // SOUND_DISPLAY A7.) Back plays step 1 again; Hear it again, this step (the book already gone).
    if (petal)
      steps.push({
        key: "petal",
        enter: noPetal,
        run: (live) => petalShow(petal, live, bookRef.current === "open"),
      });
  }
  /**
   * Reward 2's petal: the book flies to the map (`fromBook`), and the first petal shines through the mist on a real
   * World Flower (the bamboo dims; every petal in its own colours, softened, in the mist). On "its petal is shining" the
   * /s/ petal glows through the mist (rays, twinkles, a chime) and lifts out of the flower as a big petal, still misty.
   * The child's turn comes straight after, "Tap your petal, and hear its sound.": on the tap it says /s/ and blooms (the
   * introduction animation, SOUND_DISPLAY §4.6), and its petal on the flower lights up. No tap: at 8 s it says /s/ by
   * itself, and at 12 s the step goes on (TEACHER_SCRIPT §3.5 C's join-in). Then "This is the World Flower. Your sounds
   * make it shine." (the flower's heart glows) says what the sound has just done, and Next. (TEACHER_SCRIPT §3.8 had the
   * flower line before the turn: 12.9 s from Next to the turn; after it, 9 s, and the line follows its picture.)
   */
  const petalShow = async (petal: PhonemeId, live: () => boolean, fromBook: boolean) => {
    if (fromBook) {
      // the book shuts and flies off to the map as the flower rises and Sensei starts ("You found your very first
      // sound!" is said over it; the petal shines on "its petal is shining", 3 s in)
      setBookState("shut");
      await sleep(300);
      if (!live()) return;
      void sleep(150).then(() => {
        if (!alive.current) return; // (a replay from here on starts at the petal: the book goes whatever happens)
        setBookState("gone");
        sfx.whoosh();
      });
    }
    setFlower("up");
    await sleep(200);
    if (!live()) return;
    const t = performance.now();
    const said = say({ line: "fm_rw2_petal" });
    await sleep(Math.max(0, PETAL_SHINES_AT * 1000 - (performance.now() - t) * FAST));
    if (!live()) return;
    // "…its petal is shining through the mist": the petal is the child's from now on
    setFlower("shine");
    sfx.petal();
    store.set((s) => void (s.petals.includes(petal) || s.petals.push(petal)));
    const el = document.querySelector(`.st-flower [data-p="${petal}"]`);
    const at = el ? stageXY(el) : { x: 730, y: 300 };
    setRaysAt(at);
    fx.ring(at.x, at.y, { color: "#fff4dc", r0: 20, r1: 220, width: 14, life: 26 });
    fx.ring(at.x, at.y, { color: "#ffe38a", r0: 40, r1: 330, width: 10, life: 34 });
    fx.twinkle(at.x, at.y, ["#fff4dc", "#ffe38a", "#ff9ec0"], 18, 8, 30);
    fx.glow(at.x, at.y, ["#fff6c8", "#ffe38a", "#ffc53d"], 12, 70, 1.8);
    void ninja.act("power");
    await sleep(450);
    if (!live()) return;
    // it lifts out of the flower, big, to the flower's right (still in its mist until its sound, the first time)
    setHeroTurn("busy");
    setHero({ key: ++heroN.current, intro: !bloomed.current, from: document.querySelector(`.st-flower [data-p="${petal}"]`) });
    sfx.whoosh();
    await said;
    if (!live()) return;
    if (!hasLine("tv_rw2_flower") || !hasLine("tv_rw2_tap_petal")) {
      // (before the teacher-voice lines: "This petal is for the sound…" /s/)
      await say([{ gap: 150 }, { line: "audit_petal_means" }, { gap: 300 }, { sound: petal, show: "petal" }]);
      setHeroTurn("");
      return;
    }
    // the child's turn: "Tap your petal, and hear its sound."
    await petalTurn(petal, live);
    if (!live()) return;
    setHeroTurn("");
    // "This is the World Flower. Your sounds make it shine." (the flower's heart glows, as the petal has just lit it)
    setHeart(true);
    await say([{ gap: 200 }, { line: "tv_rw2_flower" }]);
  };
  /** Reward 2's join-in: the big petal breathes with the hand on it until the child taps it (it says its sound and
   *  blooms), or says its sound by itself after 8 s of quiet; the step goes on after the sound, or at 12 s. */
  const petalTurn = (petal: PhonemeId, live: () => boolean) =>
    new Promise<void>((resolve) => {
      petalEnd.current?.();
      let over = false;
      const done = () => {
        if (over) return;
        over = true;
        stop();
        if (petalTap.current === tap) petalTap.current = null;
        if (petalEnd.current === done) petalEnd.current = null;
        resolve();
      };
      setHeroTurn("wait");
      void say([{ gap: 200 }, { line: "tv_rw2_tap_petal" }]).then(() => !over && live() && setHeroTurn((h) => (h === "wait" ? "asked" : h)));
      const stop = idleLadder([8000, 12000], (k) => {
        if (!live()) return done();
        if (k === 0) void say({ sound: petal, show: "petal" });
        else done();
      });
      const tap = () => {
        if (isSpeaking()) hush(); // the child's tap cuts "…hear its sound." short
        stop();
        petalTap.current = null;
        setHeroTurn("");
        void ninja.act("cheer");
        void say({ sound: petal, show: "petal" }).then(() => sleep(250)).then(done);
      };
      petalTap.current = tap;
      petalEnd.current = done;
    });
  /** A tap on the big petal: the join-in's answer while it waits; otherwise it just says its sound. */
  const tapHero = () => {
    if (!p.petal) return;
    if (petalTap.current) return petalTap.current();
    void say({ sound: p.petal, show: "petal" });
  };
  /** Next on the last step: off to the next lesson or the map (the book, or the petal and its flower, fly there first). */
  const finish = async () => {
    if (leaving.current) return;
    leaving.current = true;
    if (flower === "lit" || flower === "shine") {
      setFlower("away");
      setHeroAway(true);
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
    if (isSpeaking()) hush(); // the child's tap cuts "…and it will say its word." short
    answered.current = true;
    setTurnOpen(false);
    sfx.pop();
    const at = stageXY(el);
    fx.burst(at.x, at.y, "stars", 10);
    el.animate([{ rotate: "0deg", scale: "1" }, { rotate: "360deg", scale: "1.3" }, { rotate: "360deg", scale: "1" }], { duration: 600 }).playbackRate = FAST;
    setWiggle(null);
    setHard(false);
    setTapTime(false);
    // the rabbit and the tortoise peek in beside the speaker: the rabbit hops on the word, the tortoise steps on its sounds
    setFsOn(true);
    void ninja.act("cheer");
    void sayStickerWord(w, stickerKind(w), el, { fs: true }).then(() => tapped.current?.());
  };

  const pages = [...prior, ...p.words];
  const turn = stage === "turn" || (stage === "show" && replaying);
  // bots read this (scripts/treadmill/bot.ts): what to tap once Sensei has asked for it (the closed book, the sticker,
  // Reward 2's petal; a real child's tap counts from the moment it is live), and the held steps' Next is the nav
  // layer's. `busy` while the scene is showing something and nothing is the child's to tap yet (Reward 1's show, the
  // sticker saying its word, the petal lifting out). Once asked, Reward 1's turn stays the child's until they tap a
  // sticker: Show me again and the question asked again after it keep `next` (busy meanwhile), so a replay never
  // reads as the turn being answered (docs/NAVIGATION.md §6.2). A reward is not a game (TEACHER_SCRIPT §2.6).
  const bookNext = bookWait === "asked" || bookWait === "hard" ? "Sticker Book" : null;
  const petalNext = heroTurn === "asked" ? "your petal" : null;
  const stickerNext = turn && (turnOpen || (tapAsked && tapTime)) ? `sticker ${p.words[0]}` : null;
  (window as any).__snState = {
    scene: "stickers",
    game: null,
    mode: p.mode,
    next: bookNext ?? petalNext ?? stickerNext,
    busy: bookNext || petalNext ? false : turn ? !tapTime || replaying || !tapAsked : stage === "show" || heroTurn === "busy" || heroTurn === "wait",
    done: stage === "end",
  };
  const book = bookState === "open" || bookState === "shut";
  const heroWaits = heroTurn === "wait" || heroTurn === "asked";
  return (
    <div className={`scene st-reward ${phase}`}>
      <img className="bg-img" src={img("bg_bamboo")} alt="" style={{ filter: "blur(3px) brightness(.8)" }} />
      <div className="vignette" />
      <NinjaSpot size={270} x={34} />
      {/* the cards rise into a fan and flip into stickers (they lift to make room for the book as it arrives) */}
      {p.mode === "intro" && phase === "fan" && (
        <div className={`st-fan ${bookState === "in" ? "up" : ""}`} key={`fan${take}`}>
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
      {/* the Sticker Book: it swoops in closed (Reward 1 waits for the child to open it), then opens; later it shuts and
          goes */}
      {bookState === "in" && (
        <button
          className={`st-book-closed in ${bookWait ? "wait" : ""} ${bookWait === "hard" ? "hard" : ""}`}
          aria-label="Sticker Book"
          disabled={!bookWait}
          style={{ left: CLOSED.x, top: CLOSED.y, width: CLOSED.w }}
          {...tapProps<HTMLButtonElement>((el) => tapBook(el))}
        >
          <img src={img("item_sticker_book")} alt="" draggable={false} />
        </button>
      )}
      {bookState === "in" && bookWait && <TapHint show style={{ left: CLASP.x - 53, top: CLASP.y - 14 }} />}
      {bookState === "gone" && <img className={`st-book-closed ${p.then === "map" || p.mode === "open" ? "to-map" : "to-pack"}`} src={img("item_sticker_book")} alt="" />}
      {book && (
        <div className={`st-book ${bookState}`} key={`book${take}`} style={{ left: BOOK.x, top: BOOK.y, width: BOOK.w, height: BOOK.h }}>
          <div className="st-pages">
            <div className="st-page" />
            <div className="st-page" />
            {pageGlow > 0 && <span className="st-pages-glow" key={pageGlow} aria-hidden="true" />}
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
          {showCount && count > 0 && (
            <div className="st-count" key={count}>
              <span className="st-count-n">{count}</span>
              <span className="st-count-icon"><Icon.sticker /></span>
            </div>
          )}
        </div>
      )}
      {/* the first petal shines through the mist, on a real World Flower (420 px), clear of the book; the bamboo dims
          behind it, so its petals and the one shining through stand out */}
      {flower && p.petal && <div className={`st-dim ${flower}`} aria-hidden="true" />}
      {flower && p.petal && raysAt && flower !== "away" && <div className="st-petal-rays" aria-hidden="true" style={{ left: raysAt.x, top: raysAt.y }} />}
      {flower && p.petal && (
        <div className={`st-flower ${flower} ${heart ? "heart" : ""}`} aria-hidden="true">
          <span className="st-flower-glow" />
          <WorldFlower
            light={(q) => (q === p.petal && (flower === "lit" || flower === "away") ? 1 : 0)}
            misty
            hint={flower === "shine" ? new Set([p.petal]) : undefined}
            bloom={flower === "lit" || flower === "away" ? p.petal : null}
            flash={flash ? p.petal : null}
            stem={false}
            label="The World Flower"
          />
          <span className="st-mist" />
        </div>
      )}
      {/* the first petal, lifted out of the flower: big, tappable, blooming on its sound (SOUND_DISPLAY r7, §4.6) */}
      {hero && p.petal && (
        <div className={`st-hero ${heroAway ? "away" : ""} ${flower === "lit" ? "lit" : ""}`} key={hero.key} style={{ left: HERO.x - HERO.w / 2, top: HERO.y, width: HERO.w, "--away-x": `${MAP_FLOWER.x - HERO.x}px`, "--away-y": `${MAP_FLOWER.y - HERO.y - (HERO.w * 1.375) / 2}px` } as CSSProperties}>
          <span className="st-hero-glow" aria-hidden="true" />
          <SoundBadge p={p.petal} tier="hero" intro={hero.intro} from={hero.from} busy={heroTurn === "busy"} wait={heroWaits} onTap={tapHero} label="your petal" />
          {heroWaits && <TapHint show style={{ left: HERO.w * 0.35, top: HERO.w * 1.07 }} />}
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
      {stage === "end" && steps.length > 0 && (
        <Held
          key={`held${take}`}
          id={`stickers-${p.mode}`}
          steps={steps}
          onDone={() => void finish()}
          back={p.mode === "intro" ? backToShow : undefined}
          onReplay={p.then !== "arrow" ? p.onReplay : undefined}
          // Reward 2's petal waits for the child: no Next yet; Hear it again and Help say what to do, not the whole step
          turn={heroWaits}
          again={() => say({ line: "tv_rw2_tap_petal" })}
          help={(n) => {
            if (!heroWaits) return false;
            void say({ line: "tv_rw2_tap_petal" });
            if (n > 1) tapHint();
            return true;
          }}
        />
      )}
      <SenseiDock />
    </div>
  );
}
/** Help's second press on Reward 2's petal: the big petal swells, so the child sees what to tap. */
function tapHint() {
  const el = document.querySelector(".st-hero .sound-badge .sb-swell");
  (el as HTMLElement | null)?.animate?.([{ transform: "scale(1)" }, { transform: "scale(1.12)", offset: 0.4 }, { transform: "scale(1)" }], { duration: 500, easing: "ease-out" });
}
