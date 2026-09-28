// Story time: Sensei reads the rich pages (with a karaoke highlight); the child reads the decodable pages
// (sound buttons under every spelling, tap any word for help), makes choices by reading words, and answers a question.
// The player's ninja stands bottom-left on every page (docs/HERO.md) and acts the page out: it creeps in along the path,
// cheers with the pandas, casts a spell on a lock. Every page the child reads, every right choice and the right answer
// gets magic that lands on it (a leap that points a star, a spell orb, a backflip full of stars) and feeds the streak:
// a page counts once the child has had a real go at it, a funny detour ("pig" or "den"?) neither feeds nor breaks it,
// and only the wrong picture at the end is a miss. Stories are the calm level: magic, plus a spin and (on a big streak) a
// kick whose shockwave bursts into stars. A child who stops (unsure what to do) is never left in silence: after a few
// seconds each page gives a clue in pictures, motion and sound, led by the ninja (usePageIdle).
//
// Order matters when an answer counts for the streak: start the strike FIRST, then streak.hit(). The ninja's tier-up
// power move waits for whatever move is running when the hit is counted, so a hit counted first would start the power
// move and have the strike cut it off.
//
// The teacher's voice (docs/TEACHER_SCRIPT.md §3.23, FIX_PLAN §13 TV-D6.1). Story Time is the game `story`
// (content/games.ts); its form comes from the child's ledger (narrate.tsx gameForm: full, recap or short).
// - The title (TitleStep): the frame ("Story time! I'll read some pages to you, and you'll read some pages to me.",
//   the recap's or the short form's line on later plays), "This story is called…" and the title (its words light as
//   they are said), then the Ready hold in the right-hand column, "Tap the green arrow, and let's begin." (holdReady:
//   the ninja faces ▶ and bows on it). The answer records the telling (framed); the story's end records the play.
// - The child's first page (full or recap form, once per save until heard): "This page is yours. Say the sounds, and
//   read each word." · (fast and slow's idea) · "If you get stuck, tap a word, and I'll help." · "When you've read it
//   all, tap the green tick.", the words glowing on the first two and the tick waking on the last. Later pages: "Your
//   turn to read." (the tick live from its first word) after one of Sensei's pages, at most once in 40 s; a page
//   straight after another child page is handed over quietly (the words glow, the tick wakes), so it is never a
//   chant. On the session's first child page, fast and slow's idea follows (the page stays live).
//   A quiet child: at 8 s on the first story's pages "Let's read it together." (once per save: the words light sound
//   by sound as Sensei says them); at 10 s "When you've read it, tap the green tick." while the tick hops.
// - A choice: the question, then on the full and recap forms "Now you choose what happens. Read the two words, and tap
//   one." (at the save's first choice the words wake on it); a known game has the question only.
// - The question: "Now a question about the story.", and only then the pictures, which glow as the question is read.
// - Fast and slow (TEACHER_SCRIPT §9.3): the session's first read-back of a word (a word tapped for help, the chosen
//   word, reading together) is Sensei's pair: "Let's say it the slow way…" the sounds "And now the fast way…" the word.
//   The tortoise and the rabbit sit in the column on the pages with read-backs, and light on every slow and fast way.
// - Praise (SCRIPT_STYLE §8, TEACHER_SCRIPT §5.3): after "I read it!" on a page the child really read, "Well read!",
//   and every second one the praise slot instead (the fast and slow praise once a session, else "Lovely reading!" and a
//   generic line in turn); a page tapped straight through gets the magic and the read-back, no words. Nothing after
//   the right picture: the closing "The end! What a story!" is the praise.
// A word tapped for help can bring a spaced "two letters, one sound" reminder (SCRIPT_FIXES C4, Dec4), its spelling lit
// and the sound's petal popping above it on "one sound" (SOUND_DISPLAY r42). A word's sounds are its letters' voices
// ("tile": no petal, SOUND_DISPLAY §1 B).
//
// A read page with a common word whose spelling hasn't been taught ("the", "is", "I") lights that word and says the
// official "This is 'the'. Just say 'the' here." first, spaced (NARRATIVE_AUDIT F15).
//
// Navigation (docs/NAVIGATION.md §5.D): Home is the nav layer's (top-left); Back, Hear it again and Next stand in the
// right-hand column above Help (the text panel owns the bottom strip). Nothing turns a page by itself: every page Sensei
// reads holds on a green Next that stays dim until the reading is over. Back goes to the previous page (read again; it
// never undoes a miss). A page the child reads, a choice and the question are the child's turns: Hear it again reads the
// page to them (with the special-word teaching, if it was said) or asks the question again.
//
// Bots and transcripts read window.__snState: { scene: "story", game: "story", story, page, kind, busy, next }. `busy`:
// Sensei is still handing the turn over (a tap now is felt, not taken) or the answer is playing out; `next`: what the
// turn wants ("I read it!", the story's own choice word, the right picture's label).
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { LevelProps } from "../App";
import { STORIES, type Page, type Story } from "../content/stories";
import { decode } from "../content/validate";
import { say, sfx, playMusic, preload, urls, hush, isSpeaking, nextClip, onClip, type Say } from "../engine/audio";
import { FAST } from "../engine/fast";
import { WORD_BY_TEXT, type Seg } from "../content/phonics";
import { LINES } from "../content/lines";
import { GAMES, levelWrap, openingLines } from "../content/games";
import { SPECIAL_LINE, specialKey, specialWords, type FrameForm } from "../content/narrative";
import { img, RoundButton, Icon, fx, sleep, SenseiDock, tapProps, useHelp, stageRect, useIdlePrompt, nudgeHelp, isUpright } from "../ui/ui";
import { NinjaSpot, ninja, type Move } from "../ui/Ninja";
import { streak, streakLine } from "../engine/streak";
import { praiseBy, praiseFor, praiseWanted } from "../engine/feedback";
import {
  beginLevel, framed, fsIdea, fsPraise, fsReadback, fsSaid, gameForm, heard, heardBefore, isDue, lettersReminder, onceInSave, played, readyAsk, struggledIn,
  twoSoundsReminder,
} from "./narrate";
import { useNav, nudgeNext, navLog, holdReady, navSpeed } from "../ui/nav";
import "../styles/story.css";

type Pt = { x: number; y: number };
type PageOf<K extends Page["kind"]> = Extract<Page, { kind: K }>;
/** Recorded lines (every new line is guarded: the wording may ship before its audio). */
const HAS = new Set(LINES.map((l) => l.id));
/** A word lit whole (after its sounds), in a lit index. */
const ALL = 100;

// ---------------------------------------------------------------- the state bots read, and the turns
/** Patch window.__snState (StoryScene sets the page; the page in play sets `busy` and `next`). */
function pub(patch: Record<string, unknown>) {
  const w = window as any;
  if (w.__snState?.scene === "story") Object.assign(w.__snState, patch);
}
/** Per turn of this play (a page the child reads, a choice, the question): did it reach the second clue (the 16 s
 *  point), Help's second press or a second miss? Two of the first three make the play `struggled` (TEACHER_SCRIPT
 *  §2.2), which brings the recap back, with its Ready hold, next time. */
let turns: boolean[] = [];

// ---------------------------------------------------------------- the ninja
/** The ninja's answers in a story: magic (a leaping star, a spell, a backflip of stars), a spin at the glow, and on a
 *  big streak a kick whose shockwave bursts into stars. Per streak tier; never the same move twice running. */
const MOVES: Move[][] = [
  ["jump", "cast"],
  ["jump", "cast", "flip", "spin"],
  ["flip", "cast", "jump", "spin", "kick"],
  ["flip", "cast", "jump", "spin", "kick"],
];
let lastMove: Move | null = null;
function answer(target: Element | Pt, move?: Move, opts: { react?: boolean } = {}): Promise<void> {
  const pool = MOVES[streak.tier].filter((m) => m !== lastMove);
  const m = move ?? pool[(Math.random() * pool.length) | 0];
  lastMove = m;
  // (the child often answers while the ninja is still wondering: the new move takes its "?" cloud away)
  return ninja.strike(target, { move: m, react: opts.react });
}
/** The ninja's squash on something its magic hit (for strikes aimed at a point rather than the element). */
function boing(el: Element) {
  el.animate(
    [
      { scale: "1" },
      { scale: "1.14 0.87", offset: 0.2 },
      { scale: "0.94 1.07", offset: 0.48 },
      { scale: "1.02 0.98", offset: 0.72 },
      { scale: "1" },
    ] as Keyframe[],
    { duration: 440, easing: "ease-out" },
  );
}
const centre = (el: Element | null): Pt => {
  const r = stageRect(el);
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};
/** The middle of the words themselves (the panel is wider than a short sentence), a little above their centre line. */
function wordsCentre(box: Element | null): Pt {
  const rs = [...(box?.querySelectorAll(".st-word") ?? [])].map((e) => stageRect(e)).filter((r) => r.w > 0);
  if (!rs.length) return centre(box);
  const x0 = Math.min(...rs.map((r) => r.x)), x1 = Math.max(...rs.map((r) => r.x + r.w));
  const y0 = Math.min(...rs.map((r) => r.y)), y1 = Math.max(...rs.map((r) => r.y + r.h));
  return { x: (x0 + x1) / 2, y: y0 + (y1 - y0) * 0.42 };
}
/** Story time begins: the ninja somersaults down into the picture from the top left and lands in the ninja zone
 *  (a squash, a puff of dust, a ring), so the child sees their hero arrive for the story. */
function entrance(el: Element | null, alive: () => boolean) {
  if (!el) return;
  const DELAY = 300, LAND = 0.66, MS = 1000;
  const a = el.animate(
    [
      { translate: "-150px -640px", rotate: "-330deg", scale: "1", easing: "cubic-bezier(.35,.1,.7,.5)" },
      { translate: "-45px -330px", rotate: "-150deg", offset: 0.34, easing: "cubic-bezier(.4,.3,.8,.9)" },
      { translate: "-8px -60px", rotate: "-15deg", offset: 0.58, easing: "ease-in" },
      { translate: "0 0", rotate: "0deg", scale: "1.16 0.8", offset: LAND, easing: "cubic-bezier(.3,1.7,.6,1)" },
      { translate: "0 -14px", rotate: "0deg", scale: "0.95 1.07", offset: 0.8, easing: "ease-in" },
      { translate: "0 0", rotate: "0deg", scale: "1" },
    ] as Keyframe[],
    { duration: MS, fill: "backwards", delay: DELAY },
  );
  ninja.pose("flip");
  // sounds, pose swaps and the landing burst follow the animation's own clock: on a busy first frame (the page
  // pictures decoding) it starts later than the code that created it
  const ts: number[] = [];
  a.ready.then(() => {
    ts.push(
      window.setTimeout(() => (sfx.whoosh(), sfx.spin()), DELAY),
      window.setTimeout(() => ninja.pose("jump"), DELAY + MS * 0.5),
      window.setTimeout(() => {
        if (!alive()) return;
        ninja.pose(null);
        sfx.land();
        fx.puff(165, 708, 16);
        fx.ring(165, 700, { color: "#fff4dc", r0: 20, r1: 210, width: 13, life: 22 });
        fx.twinkle(165, 470, ["#fff4dc", "#ffe38a", "#ffc53d"], 12, 8, 26);
      }, DELAY + MS * LAND),
    );
  }, () => {});
  a.finished.catch(() => ts.forEach(clearTimeout));
}
/** A tier-up's line ("Ninja power!") is spoken by Ninja.tsx at the next quiet moment, with its power-up. A story
 *  barely pauses (Sensei reads straight on), so at a tier-up the page leaves a breath for it and carries on once it
 *  has been said. `tier`: streakLine() of the hit, taken once (null: no line). */
async function breath(tier: string | null, alive: () => boolean) {
  if (!tier || !alive()) return;
  await ninja.linesDone();
}
/** A child who has stopped: after `ms` with no tap (and once the page's own speech is over), `clue(n)` gives clue n
 *  (1, 2, ...). Quiet while the phone is upright. The second clue also wiggles the Help button. */
function usePageIdle(active: boolean, ms: number, clue: (n: number) => void) {
  const n = useRef(0);
  useIdlePrompt(active, ms, () => {
    if (isUpright() || isSpeaking()) return;
    n.current++;
    if (n.current === 2) nudgeHelp();
    clue(n.current);
  });
}
/** A quick hop that says "me! tap me!" (the Next arrow, the tick, a choice). */
function bounce(el: Element | null | undefined, delay = 0) {
  el?.animate(
    [
      { translate: "0 0", scale: "1" },
      { translate: "0 -22px", scale: "1.1 0.94", offset: 0.3, easing: "ease-in" },
      { translate: "0 0", scale: "1.08 0.92", offset: 0.55, easing: "ease-out" },
      { translate: "0 -8px", scale: "1", offset: 0.75 },
      { translate: "0 0", scale: "1" },
    ] as Keyframe[],
    { duration: 700, delay, easing: "ease-in-out" },
  );
}
/** "Not yet": a little shake of the head (the tick tapped before its line, a word before the question). */
function wiggle(el: Element | null | undefined) {
  el?.animate([{ rotate: "0deg" }, { rotate: "-9deg", offset: 0.25 }, { rotate: "7deg", offset: 0.55 }, { rotate: "-3deg", offset: 0.8 }, { rotate: "0deg" }] as Keyframe[], { duration: 380, easing: "ease-in-out" });
}
/** Each word glows once, left to right, as the page is handed over ("This page is yours…", "Your turn to read."): a warm
 *  light behind it and a little lift. Transform and opacity only. */
function glowWords(box: Element | null, step = 150) {
  box?.querySelectorAll<HTMLElement>(".st-word").forEach((w, i) => {
    w.animate([{ translate: "0 0" }, { translate: "0 -10px", offset: 0.3 }, { translate: "0 0" }] as Keyframe[], { duration: 600, delay: i * step, easing: "ease-in-out" });
    w.querySelector(".st-glow")?.animate([{ opacity: 0, scale: "0.8" }, { opacity: 1, scale: "1.06", offset: 0.3 }, { opacity: 0.8, scale: "1", offset: 0.6 }, { opacity: 0, scale: "1" }] as Keyframe[], { duration: 1100, delay: i * step, easing: "ease-out" });
  });
}
/** The kick page's kick, as a leap: the whole ninja jumps up while the kick plays, so its foot passes above the text
 *  panel (never over the word "Kick!" the child is about to read), and tucks behind the panel if a heel dips low.
 *  Timed to the kick (560 ms, foot out at 175-255 ms): down again by 390 ms, when the kick's landing dust puffs. */
function flyingKick() {
  const el = document.querySelector<HTMLElement>(".st-ninja");
  if (!el) return;
  const z0 = el.style.zIndex;
  el.style.zIndex = "4"; // .st-panel is 5
  el.animate(
    [
      { translate: "0 0", easing: "cubic-bezier(.2,.8,.4,1)" },
      { translate: "10px -170px", offset: 0.28, easing: "linear" },
      { translate: "12px -176px", offset: 0.46, easing: "cubic-bezier(.6,0,.9,.6)" },
      { translate: "0 0" },
    ] as Keyframe[],
    { duration: 540 },
  ).finished.then(
    () => void (el.style.zIndex = z0),
    () => void (el.style.zIndex = z0),
  );
}
/** Run fn once the ninja has finished what it's doing (a strike, a power-up), waiting at most `max` ms. */
async function whenFree(fn: () => void, alive: () => boolean, max = 1500) {
  for (let t = 0; t < max && ninja.busy; t += 100) await sleep(100);
  if (alive()) fn();
}

/** Does this branch of a choice lead back to the choice (a funny detour: "try the other place!")? */
function isDetour(story: Story, choiceId: string, nextId: string) {
  const seen = new Set<string>();
  let id: string | undefined = nextId;
  while (id && !seen.has(id)) {
    if (id === choiceId) return true;
    seen.add(id);
    const p = story.pages.find((x) => x.id === id);
    id = p && "next" in p ? p.next : undefined;
  }
  return false;
}

// ---------------------------------------------------------------- reading aloud
/** Word-by-word highlight while a clip plays from `start` to `end` (performance.now() ms, as onClip gives them: exact at
 *  any ?fast=), each word weighted by its length; `set(-1)` (or `set(ALL)` first, with `all`) as it ends. Timers only,
 *  nothing per frame. Returns stop. */
function karaokeAt(words: string[], start: number, end: number, set: (i: number) => void, o: { all?: boolean } = {}): () => void {
  const lens = words.map((w) => w.length + 2);
  const total = lens.reduce((a, b) => a + b, 0);
  const now = performance.now();
  const ts: number[] = [];
  let acc = 0;
  words.forEach((_, i) => {
    const at = start + (acc / total) * (end - start);
    acc += lens[i];
    ts.push(window.setTimeout(() => set(i), Math.max(0, at - now)));
  });
  if (o.all) {
    ts.push(window.setTimeout(() => set(ALL), Math.max(0, end - now)));
    ts.push(window.setTimeout(() => set(-1), Math.max(0, end - now) + 700));
  } else ts.push(window.setTimeout(() => set(-1), Math.max(0, end - now)));
  return () => ts.forEach(clearTimeout);
}
/** Sensei reads a page, its words lighting in turn on the clip's own clock; then `after` (e.g. "Your turn to read.").
 *  Resolves as say() does. */
async function readAlong(story: string, page: string, words: string[], set: (i: number) => void, after: Say[] = []): Promise<boolean> {
  let over = false;
  let stop = () => {};
  void nextClip(`story:${story}_${page}`, 8000).then((t) => {
    if (t && !over) stop = karaokeAt(words, t.start, t.end, set);
  });
  const ok = await say([{ story, page }, ...after]);
  over = true;
  stop();
  set(-1);
  return ok;
}
/**
 * A word read back sound by sound, then fast (a word tapped for help, the chosen word, reading together): its letters
 * light one per sound (`onSeg`; -1 as the sounds end) while the tortoise walks, and the rabbit hops on the word
 * (TEACHER_SCRIPT §9.6). The session's first read-back in Story Time is Sensei's pair, with no rabbit tap: "Let's say it
 * the slow way…" the sounds "And now the fast way…" the word (§9.3; fsReadback's "rabbit" for a game with no tap).
 * Later ones are the sounds and the word, as §3.23 has them. The sounds are the letters' voices ("tile": no petal).
 */
async function readBack(segs: Seg[], word: string, onSeg: (k: number) => void): Promise<boolean> {
  const pair = HAS.has("tv_fs_say_slow") && HAS.has("tv_fs_now_fast") && fsReadback("story") === "rabbit";
  navSpeed("slow");
  const sounds: Say = {
    sounds: segs,
    gap: pair ? 300 : 260,
    show: "tile",
    onSeg: (k) => {
      onSeg(k);
      if (k < 0 && pair) navSpeed("fast"); // the rabbit lights on "And now the fast way…", and hops on the word
    },
  };
  if (!pair) return say([sounds, { gap: 150 }, { word }]);
  const ok = await say([{ line: "tv_fs_say_slow" }, { gap: 250 }, sounds, { gap: 150 }, { line: "tv_fs_now_fast" }, { gap: 150 }, { word }]);
  if (ok) {
    fsSaid("tv_fs_say_slow", "story");
    fsSaid("tv_fs_now_fast", "story");
  }
  return ok;
}

// ---------------------------------------------------------------- the story
export function StoryScene({ level, onDone }: LevelProps) {
  useState(() => beginLevel(level)); // (during the first render)
  const story = STORIES.find((s) => s.id === level.story)!;
  /** How Story Time is introduced on this play (TEACHER_SCRIPT §2.2): full the first time, a recap on a later day,
   *  the short line once known. It opens the level, so never "none". */
  const [form] = useState<FrameForm>(() => gameForm("story", { opening: true }));
  const [pageId, setPageId] = useState<string | null>(null);
  const page = story.pages.find((p) => p.id === pageId);
  const misses = useRef(0);
  const [turn, setTurn] = useState(0);
  const visited = useRef(new Set<string>());
  /** The pages before this one, for Back (the newest last). */
  const history = useRef<string[]>([]);
  /** Pages the child has already read (and been counted for): read again after Back, they don't count twice. */
  const readDone = useRef(new Set<string>());
  /** A page's number, for the nav log (null: the title). */
  const idx = (id: string | null) => (id ? story.pages.findIndex((p) => p.id === id) : null);
  /** Go to a page (forward: the page we are on goes onto the Back history). `via`: what moved it, for the nav log
   *  (window.__snNavLog: "next" on a page Sensei reads, "read" after I read it!, "pick" at a choice). */
  const show = (id: string, via: string) => {
    navLog({ kind: "step", id: "story", from: idx(pageId), to: idx(id), via });
    if (pageId) history.current.push(pageId);
    setPageId(id);
    setTurn((t) => t + 1);
  };
  /** Back: the previous page, read again from its start. */
  const back = history.current.length
    ? () => {
        const prev = history.current.pop();
        if (!prev) return;
        navLog({ kind: "step", id: "story", from: idx(pageId), to: idx(prev), via: "back" });
        sfx.page();
        setPageId(prev);
        setTurn((t) => t + 1);
      }
    : null;
  const alive = useRef(true);
  const finishing = useRef(false);
  const heroPose = page && "hero" in page ? page.hero : undefined;
  {
    // the page for bots and transcripts; `busy` and `next` belong to the page in play (a new page starts busy)
    const w = window as any;
    const base = { scene: "story", game: "story", story: story.id, page: pageId ?? "title", kind: page?.kind ?? "title", turn };
    if (w.__snState?.scene !== "story" || w.__snState.story !== base.story || w.__snState.page !== base.page || w.__snState.turn !== turn) w.__snState = { ...base, busy: true, next: null };
  }

  useEffect(() => {
    alive.current = true;
    turns = [];
    ideaTried = false;
    streak.reset();
    lastMove = null;
    entrance(document.querySelector(".st-ninja"), () => alive.current);
    playMusic("story");
    preload(story.pages.map((p) => urls.story(story.id, p.id)));
    story.pages.forEach((p) => {
      const i = new Image();
      i.src = img(`story_${story.id}_${p.scene}`);
    });
    // dev only: /play/?level=w2-7&page=6 opens straight at a page (layout checks, review frames)
    const dev = import.meta.env.DEV ? new URLSearchParams(location.search).get("page") : null;
    if (dev && story.pages.some((p) => p.id === dev)) setPageId(dev);
    // (otherwise the title holds on its Ready: TitleStep)
    return () => {
      alive.current = false;
      hush();
    };
  }, []);

  // captions (grown-ups' setting) sit just above the page's text panel, whatever its height (story.css: --cap-b)
  const sceneRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = sceneRef.current;
    const panel = root?.querySelector<HTMLElement>(".st-panel");
    if (!root) return;
    if (!panel) return void root.style.removeProperty("--cap-b");
    const set = () => root.style.setProperty("--cap-b", `${720 - panel.offsetTop + 16}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(panel);
    return () => ro.disconnect();
  }, [pageId, turn]);

  // the ninja acts each page out (the page art is drawn without the hero)
  const wasRunning = useRef(false);
  useEffect(() => {
    if (!page) return;
    const live = () => alive.current;
    const running = heroPose === "run";
    ninja.pose(running ? "run" : null);
    if (running && !wasRunning.current) {
      // creep in from the left, along the path
      const el = document.querySelector(".st-ninja");
      el?.animate(
        [
          { translate: "-380px 0", opacity: 0.3 },
          { translate: "-150px -22px", opacity: 1, offset: 0.4 },
          { translate: "-60px 0", offset: 0.65 },
          { translate: "0 -10px", offset: 0.85 },
          { translate: "0 0" },
        ] as Keyframe[],
        { duration: 820, easing: "cubic-bezier(.3,.7,.4,1)" },
      );
      sfx.swish();
      const t = setTimeout(() => fx.puff(150, 704, 10), 620);
      wasRunning.current = true;
      return () => clearTimeout(t);
    }
    wasRunning.current = running;
    const t = setTimeout(() => {
      if (heroPose === "cheer") void whenFree(() => void ninja.act("cheer"), live);
      // "Tap, tap, tap. The lock went click!": a gentle spell on the lock
      else if (heroPose === "cast") void whenFree(() => void ninja.act("cast", { x: 760, y: 330 }), live);
      // "Kick! Thud! It is still shut.": a flying kick at the chest just bounces off (boing, the chest wobbles), and
      // the ninja has a puzzled think. Never the hurt pose: that is only for a monster's attack, and this was the
      // child's own choice. The kick is a leap (flyingKick), so the foot passes high over the words, never over them.
      else if (heroPose === "hurt")
        void whenFree(
          () =>
            void (flyingKick(), ninja.act("kick", { x: 690, y: 330 }, { react: false })).then(() => {
              if (!live()) return;
              sfx.bounce();
              document.querySelector(".st-bg")?.animate(
                [{ translate: "0 0" }, { translate: "-9px 2px" }, { translate: "7px -1px" }, { translate: "-4px 0" }, { translate: "2px 0" }, { translate: "0 0" }] as Keyframe[],
                { duration: 420, easing: "ease-out" },
              );
              setTimeout(() => live() && void ninja.act("think"), 380);
            }),
          live,
        );
    }, 420);
    return () => clearTimeout(t);
  }, [pageId, turn]);

  const goNext = (p: Page, via: string) => {
    sfx.page();
    const i = story.pages.indexOf(p);
    const nextId = "next" in p && p.next ? p.next : story.pages[i + 1]?.id;
    // skip branch-only pages when advancing linearly
    let n = nextId ? story.pages.find((x) => x.id === nextId) : undefined;
    if (!("next" in p && p.next)) while (n && /[a-z]$/.test(n.id) && n.id !== "q") n = story.pages[story.pages.indexOf(n) + 1];
    if (n) show(n.id, via);
    else finish(via);
  };
  const finish = async (via: string) => {
    // the child may have gone back to the map meanwhile: then nothing plays over it
    if (finishing.current || !alive.current) return;
    finishing.current = true;
    navLog({ kind: "step", id: "story", from: idx(pageId), to: null, via });
    // the game's play is over (TEACHER_SCRIPT §2.2): when, and whether the child struggled on its first turns
    played("story", { struggled: struggledIn(turns) });
    pub({ busy: true, next: null });
    fx.rain("blossoms", 60);
    // the level's close, said once (games.ts levelWrap: Story Time's wrap is "The end! What a story!")
    const wrap = levelWrap(level).filter((id) => HAS.has(id));
    const closing = wrap.length ? wrap : ["story_end"];
    const end = say(closing.flatMap((line, k): Say[] => (k ? [{ gap: 250 }, { line }] : [{ line }])));
    // let a power-up that's still going land first, then the big finale
    const party = whenFree(() => {}, () => alive.current, 1000).then(() => (alive.current ? ninja.celebrate() : undefined));
    await Promise.all([end, party]);
    if (alive.current) onDone(misses.current === 0 ? 3 : misses.current <= 2 ? 2 : 1, { closing: closing.at(-1) });
  };
  const pos = (p: Page) => ({ i: story.pages.indexOf(p), of: story.pages.length });

  return (
    <div ref={sceneRef} className={`scene st-scene k-${page?.kind ?? "title"}`}>
      {page && <img key={page.scene + turn} className="bg-img st-bg" src={img(`story_${story.id}_${page.scene}`)} alt="" />}
      {!page && <img className="bg-img st-title-bg" src={img(`story_${story.id}_${story.pages[0].scene}`)} alt="" />}
      {!page && <TitleCard story={story} />}
      {!page && !pageId && <TitleStep story={story} form={form} onNext={() => (sfx.page(), show(story.pages[0].id, "next"))} />}
      {page?.kind === "narr" && <NarrPage key={page.id + turn} story={story.id} page={page} pos={pos(page)} onBack={back} onNext={() => goNext(page, "next")} />}
      {page?.kind === "read" && (
        <ReadPage
          key={page.id + turn}
          story={story.id}
          page={page}
          maxUnit={story.maxUnit}
          form={form}
          after={story.pages.find((p) => p.id === history.current.at(-1))?.kind ?? null}
          counted={readDone.current.has(page.id)}
          onBack={back}
          onNext={() => {
            readDone.current.add(page.id);
            goNext(page, "read");
          }}
        />
      )}
      {page?.kind === "choice" && (
        <ChoicePage
          key={page.id + turn}
          story={story}
          page={page}
          form={form}
          visited={visited.current}
          onBack={back}
          onPick={(next) => {
            sfx.page();
            visited.current.add(next);
            show(next, "pick");
          }}
        />
      )}
      {page?.kind === "question" && <QuestionPage key={page.id + turn} story={story.id} page={page} onBack={back} onDone={() => finish("answer")} onMiss={() => misses.current++} />}
      <NinjaSpot className={`st-ninja ${heroPose === "run" ? "st-run" : ""}`} />
      {/* captions (a grown-ups' setting, off by default) for Sensei's own lines; the story text is in the panel.
          story.css moves it left of the button column above Help and above the text panel, its tail pointing at Sensei */}
      <SenseiDock />
    </div>
  );
}

// ---------------------------------------------------------------- the title: the frame, then the Ready hold
/** The book opens with the story's title. It glows as Sensei frames the game, and its words light as she reads the
 *  title (on the title clip's own clock). */
function TitleCard({ story }: { story: Story }) {
  const words = story.title.split(" ");
  const [hi, setHi] = useState(-1);
  const glow = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let stop = () => {};
    const off = onClip((id, start, end) => {
      if (id === "tv_story_frame" || id === "tv_story_recap" || id === "tv_story_short" || id === "story_start")
        glow.current?.animate([{ opacity: 0, scale: "0.9" }, { opacity: 1, scale: "1.04", offset: 0.3 }, { opacity: 0.45, scale: "1", offset: 0.65 }, { opacity: 0, scale: "0.98" }] as Keyframe[], { duration: 2400, easing: "ease-in-out" });
      if (id === `story:${story.id}_title`) {
        stop();
        stop = karaokeAt(words, start, end, setHi, { all: true });
      }
    });
    return () => (off(), stop());
  }, []);
  return (
    <div className="st-title">
      <div className="st-book">
        <span ref={glow} className="st-title-glow" aria-hidden="true" />
        <div className="panel">
          <div className="display">
            {words.map((w, i) => (
              <span key={i} className={hi === i || hi === ALL ? "on" : undefined}>
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** What the title says on this form (TEACHER_SCRIPT §3.23, §4.1): the frame (full), "Story time! I'll read some pages,
 *  and you'll read some too." (recap) or "Story time!" (short), then "This story is called…" and the title. */
function titleSay(story: Story, form: FrameForm): Say[] {
  const title: Say = { story: story.id, page: "title", caption: story.title };
  const lines = openingLines(GAMES.story, form).filter((id) => HAS.has(id));
  if (!lines.length) return [{ line: "story_start" }, { gap: 250 }, title];
  const out: Say[] = [];
  lines.forEach((id, k) => {
    if (k) out.push({ gap: 300 });
    out.push({ line: id });
  });
  out.push({ gap: 200 }, title);
  return out;
}
/** The title page: the frame and the title (▶ dim meanwhile; Hear it again says it again), then the Ready hold in the
 *  right-hand column ("Tap the green arrow, and let's begin."): ▶ from its first word, the ninja facing it in its
 *  ready stance, a bow on the answer. The answer is Story Time's telling (framed). */
function TitleStep({ story, form, onNext }: { story: Story; form: FrameForm; onNext: () => void }) {
  const intro = useMemo(() => titleSay(story, form), []);
  const ask = useMemo(() => {
    const a = readyAsk("story", form);
    return a && HAS.has(a.line) ? a : null;
  }, []);
  const tok = useRef(0);
  const [ready, setReady] = useState(false); // (no Ready line recorded: the title holds on Next, as it used to)
  const play = async () => {
    const my = ++tok.current;
    setReady(false);
    pub({ busy: true, next: null });
    await say(intro);
    if (my !== tok.current) return;
    pub({ busy: false });
    if (!ask) return void setReady(true);
    const how = await holdReady("story", { ask: [{ line: ask.line }], again: () => say([...intro, { gap: 300 }, { line: ask.line }]), at: "column" });
    if (how === false || my !== tok.current) return;
    framed("story", ask);
    onNext();
  };
  useEffect(() => {
    void play();
    return () => void tok.current++;
  }, []);
  const go = () => {
    if (!ready) return;
    tok.current++;
    framed("story");
    onNext();
  };
  // (a held one-step show only when the title holds on its own Next; with a Ready line the step is the hold's own,
  // "ready:story", so the title never seems to move on by itself)
  useNav({ back: null, again: () => void play(), againAt: "column", next: { ready, go }, pres: ask ? null : { id: "story-title", step: 0, of: 1 } });
  useHelp((n) => (n === 1 ? void play() : nudgeNext()));
  return null;
}

// ---------------------------------------------------------------- Sensei reads
/** A page Sensei reads, word by word (the karaoke highlight). It holds on Next, dim until the reading is over; Hear it
 *  again reads it again; Back goes to the previous page. The idle nudge is the nav layer's (the arrow glows at 8 s, and at
 *  16 s the ninja points a star at it while Sensei says "Tap the green arrow when you're ready."). */
function NarrPage({ story, page, pos, onNext, onBack }: { story: string; page: PageOf<"narr">; pos: { i: number; of: number }; onNext: () => void; onBack: (() => void) | null }) {
  const words = page.text.split(" ");
  const [hi, setHi] = useState(-1);
  const [done, setDone] = useState(false);
  const went = useRef(false);
  const tok = useRef(0);
  const read = async () => {
    const my = ++tok.current;
    await readAlong(story, page.id, words, (i) => my === tok.current && setHi(i));
    if (my !== tok.current) return;
    setHi(-1);
    setDone(true);
  };
  // Help: the page again; once it has been read, the second press points at Next
  useHelp((n) => (!done || n === 1 ? void read() : nudgeNext()), [done]);
  useEffect(() => {
    void read();
    return () => void tok.current++;
  }, []);
  useEffect(() => pub({ busy: !done, next: null }), [done]);
  const next = () => {
    if (went.current) return;
    went.current = true;
    tok.current++;
    onNext();
  };
  useNav({ back: onBack, again: () => read(), againAt: "column", next: { ready: done, go: next }, pres: { id: "story", step: pos.i, of: pos.of } });
  return (
    <div className={`panel st-panel ${page.who === "baron" ? "baron" : ""}`}>
      <div className={`st-narr ${page.text.length > 150 ? "long" : ""}`}>
        {words.map((w, i) => (
          <span key={i} className={i === hi ? "on" : undefined}>{w} </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the child reads
/** How a read page's words fall into lines: the letter size, and the word indices where a new line starts. */
type Lines = { size: number; breaks: number[] };
const SENT_END = /[.!?]["'”’)]*$/;
const bare = (w: string) => w.toLowerCase().replace(/[^a-z']/g, "");
/** Never end a line on these (an article, a preposition, "and", a subject pronoun... want the word after them). */
const GLUE = new Set(["the", "a", "an", "his", "her", "my", "your", "its", "our", "their", "big", "much", "so", "very", "not", "to", "of", "in", "on", "at", "and", "or", "but", "he", "she", "it", "i", "we", "they", "you"]);
/** A phrase starts here ("in the fog", "on the log", "and ..."): a fine place to break. */
const PHRASE = new Set(["in", "on", "at", "to", "into", "up", "of", "with", "and", "but", "or", "from", "for", "by", "under", "over", "off", "then"]);
/** The verb after a subject ("Peg the hen / is in the fog"): a good place too. */
const VERB = new Set(["is", "was", "are", "can", "must", "will", "went", "sits", "eats", "pops", "got", "has", "had"]);
/** Sizes to try, biggest first (the letters stay big: 46 stage px is still ~25 px on a phone). */
const SIZES = [60, 58, 56, 54, 52, 50, 48, 46];
/** The space between words grows with the letters (34 px at 60): wide, even gaps help beginning readers. */
const gapOf = (size: number) => Math.round(size * 0.57);
/**
 * Beginning readers need line breaks at sentence or phrase boundaries, never a lone word left over. One line if it fits
 * at a good size; otherwise whole sentences per line; a sentence too long for a line breaks at its most natural phrase
 * boundary ("Peg the hen / is in the fog."). `unit[i]` is word i's width per px of letter size.
 */
function layoutLines(words: string[], unit: number[], avail: number): Lines {
  const n = words.length;
  const ends = words.map((w) => SENT_END.test(w));
  const cost = (k: number) => {
    // a break before word k
    const prev = words[k - 1], cur = bare(words[k]);
    if (ends[k - 1]) return 0;
    if (prev.endsWith(",")) return 1.5;
    if (GLUE.has(bare(prev))) return 30;
    if (PHRASE.has(cur)) return 2;
    if (VERB.has(cur)) return 2.5;
    return 7;
  };
  const sets: number[][] = [[]];
  for (let a = 1; a < n; a++) {
    sets.push([a]);
    for (let b = a + 1; b < n; b++) sets.push([a, b]);
  }
  let best: { c: number; l: Lines } | null = null;
  for (const breaks of sets) {
    const starts = [0, ...breaks], stops = [...breaks, n];
    let c = [0, 0, 2, 8][starts.length] + breaks.reduce((s, k) => s + cost(k), 0);
    let ok = true;
    const widths: number[] = [];
    for (let j = 0; j < starts.length && ok; j++) {
      const a = starts[j], b = stops[j];
      // a lone word only if it is a whole sentence ("Kick!", "Yes!")
      if (b - a === 1 && !((a === 0 || ends[a - 1]) && ends[a])) ok = false;
      // a line that mixes the tail or head of a split sentence with another sentence ("slow. Go, snail, go!")
      const inner = ends.slice(a, b - 1).some(Boolean);
      if (inner && ((a > 0 && !ends[a - 1]) || !ends[b - 1])) c += 8;
      let u = 0;
      for (let i = a; i < b; i++) u += unit[i];
      widths.push(u);
    }
    if (!ok) continue;
    const gaps = starts.map((a, j) => stops[j] - a - 1);
    if (widths.length > 1) c += 1.2 * (1 - Math.min(...widths) / Math.max(...widths));
    let size = SIZES.find((s) => widths.every((u, j) => u * s + gaps[j] * gapOf(s) <= avail - 2));
    if (size === undefined) {
      // nothing fits: least bad at the smallest size
      size = SIZES[SIZES.length - 1];
      c += 100;
    }
    c += (60 - size) * 0.45;
    if (!best || c < best.c - 1e-9) best = { c, l: { size, breaks } };
  }
  return best?.l ?? { size: SIZES[SIZES.length - 1], breaks: [] };
}

/** Narrowest tap box round a word, in stage px (84 ≈ 41 px on an 844×390 phone held sideways, where the stage is
 *  scaled ×0.49). Neighbouring short words' boxes overlap a little (at most ~17% of a box: the word gap is 34 px). */
const MIN_HIT = 84;
/** The word the child hears for a word on the page ("I" is said as the word "I"). */
const spoken = (clean: string) => (clean.toLowerCase() === "i" ? "I" : clean.toLowerCase());
/**
 * A word the child reads, with sound buttons (dot = 1 letter, bar = 2+ letters). Tap for help: Sensei reads it back
 * sound by sound, its letters lighting, then fast (readBack), and (spaced) what one of its spellings is, with that
 * spelling lit and its sound's petal popping above it on "one sound". `tg`: the page lights it from outside (reading
 * together): a sound's index, or ALL for the whole word.
 */
export function ReadWord({ text, maxUnit, big, onHelp, on, i = 0, size, tg }: { text: string; maxUnit: number; big?: boolean; onHelp?: () => void; on?: boolean; i?: number; size?: number; tg?: number }) {
  const clean = text.replace(/[^A-Za-z']/g, "");
  const segs = decode(clean, maxUnit);
  const [own, setLit] = useState(-1);
  const lit = tg ?? own;
  const btn = useRef<HTMLButtonElement>(null);
  const segEls = useRef<(HTMLSpanElement | null)[]>([]);
  // short words ("a", "I", "is") get a wider tap box, but the same place in the line: the padding grows and an equal
  // negative margin cancels it, so word gaps stay even (even spacing helps beginning readers)
  useLayoutEffect(() => {
    const fit = () => {
      const b = btn.current;
      if (!b) return;
      b.style.removeProperty("--pad");
      const pad = Math.max(12, (MIN_HIT - (b.offsetWidth - 24)) / 2);
      if (pad > 12) b.style.setProperty("--pad", `${pad.toFixed(1)}px`);
    };
    fit();
    void document.fonts?.ready.then(fit);
  }, [text, size, big]);
  const help = async () => {
    onHelp?.();
    sfx.tap();
    if (segs) {
      if (await readBack(segs, clean.toLowerCase(), (k) => setLit(k < 0 ? ALL : k))) {
        // a spelling's reminder (spaced by sessions, one a level): "It's two letters, but it's one sound." with the
        // spelling lit, then its sound, whose petal pops above it (Dec4, SOUND_DISPLAY r28/r42). A help tap is not an
        // answer, so there is no praise slot to share it with: afterWordSay (which counts an answer) isn't used here
        const at = (k: number) => () => segEls.current[k] ?? null;
        const remind = twoSoundsReminder(segs, at) ?? lettersReminder(segs, at);
        if (remind) {
          setLit(remind.i);
          if (await say([{ gap: 200 }, ...remind.say])) {
            remind.done();
            // the spelling stays lit while its petal is still up (it leaves ~0.7 s after the sound): two letters,
            // one petal above them
            await sleep(650);
          }
        }
      }
    } else await say({ word: spoken(clean) });
    setLit(-1);
  };
  const lead = text.match(/^[^A-Za-z']*/)?.[0] ?? "";
  const trail = text.match(/[^A-Za-z']*$/)?.[0] ?? "";
  const fs = size ?? (big ? 86 : 60);
  const whole = on || lit === ALL;
  let pos = 0;
  return (
    <span className="st-word" style={{ "--i": i, marginRight: big ? 30 : undefined } as CSSProperties}>
      <span className="st-glow" aria-hidden="true" />
      {lead}
      <button ref={btn} className={`word-btn ${whole ? "on" : ""}`} {...tapProps(help)} style={{ fontSize: fs }}>
        {segs
          ? segs.map((s, k) => {
              const chunk = clean.slice(pos, pos + s.g.length);
              pos += s.g.length;
              return (
                <span key={k} ref={(el) => void (segEls.current[k] = el)} style={{ position: "relative", color: lit === k ? "var(--blossom-deep)" : undefined }}>
                  {chunk}
                  <span className={`sb ${s.g === "x" ? "two" : s.g.length > 1 ? "bar" : "dot"} ${lit === k || lit === ALL ? "lit" : ""}`} style={{ bottom: -12 }} />
                </span>
              );
            })
          : <span style={{ color: whole ? undefined : "var(--indigo)" }}>{clean}</span>}
      </button>
      <span style={{ fontSize: fs * (big ? 1 : 0.94) }}>{trail}</span>
    </span>
  );
}

/** When "Your turn to read." was last said (game ms): it hands a page over after one of Sensei's, at most once in 40 s,
 *  so it is never said three times in a minute (SCRIPT_STYLE §5); otherwise the page is handed over by the words
 *  glowing and the tick waking. */
let turnLineAt = -Infinity;
/** Fast and slow's idea is tried once a story (TEACHER_SCRIPT §9.3: the session's first child page). A child who taps
 *  the tick through it is reading: it comes again in the next game with a fast/slow moment (only what is heard counts),
 *  never page after page. */
let ideaTried = false;
const gameNow = () => performance.now() * FAST;

function ReadPage({ story, page, maxUnit, counted, form, after, onNext, onBack }: { story: string; page: PageOf<"read">; maxUnit: number; counted: boolean; form: FrameForm; after: Page["kind"] | null; onNext: () => void; onBack: (() => void) | null }) {
  const [phase, setPhase] = useState<"read" | "done">("read");
  const doneRef = useRef(false);
  const [hi, setHi] = useState(-1);
  const [lit, setLit] = useState(false);
  /** The tick takes "I read it!" from the line that cues it (tv_story_tick, "Your turn to read."); before that a tap
   *  only shakes it: the child hears how the page works first. A word tapped for help wakes it too. */
  const [live, setLive] = useState(false);
  const liveRef = useRef(false);
  const goLive = () => {
    if (liveRef.current) return;
    liveRef.current = true;
    setLive(true);
  };
  /** Reading together: the word being read (its sound, or ALL once the word is said). */
  const [tg, setTg] = useState<{ i: number; k: number } | null>(null);
  const readToMe = useRef(false);
  const alive = useRef(true);
  const wordsRef = useRef<HTMLDivElement>(null);
  const tickRef = useRef<HTMLSpanElement>(null);
  // did the child really have a go? (they tapped a word for help, or listened to "Your turn!" and then spent a moment
  // on the words). Tapping the tick straight away still gets "Well read!" and the magic, but doesn't feed the streak.
  const triedWord = useRef(false);
  const turnDoneAt = useRef<number | null>(null);
  const words = page.text.split(" ");
  // the lines break where a reader would pause (layoutLines): measured from the words themselves, before the first
  // paint (all on one line at 60 px, which is never shown), and again once the letters' font has loaded
  const [lines, setLines] = useState<Lines | null>(null);
  const size = lines?.size ?? 60;
  useLayoutEffect(() => {
    const fit = () => {
      const box = wordsRef.current;
      const els = box ? [...box.querySelectorAll<HTMLElement>(".st-word")] : [];
      if (!box || els.length !== words.length || !box.clientWidth) return;
      const at = Number(box.dataset.size) || 60;
      const l = layoutLines(words, els.map((e) => e.offsetWidth / at), box.clientWidth);
      setLines((o) => (o && o.size === l.size && o.breaks.join() === l.breaks.join() ? o : l));
    };
    fit();
    void document.fonts?.ready.then(() => alive.current && fit());
  }, []);
  const rows = useMemo(() => {
    const starts = [0, ...(lines?.breaks ?? [])];
    return starts.map((a, j) => words.map((w, i) => ({ w, i })).slice(a, starts[j + 1] ?? words.length));
  }, [lines]);
  /** The child's first page (once per save, until heard): the whole hand-over (TEACHER_SCRIPT §3.23). */
  const [yours] = useState(() => form !== "short" && onceInSave("story:yours") && ["tv_story_yours", "tv_story_help", "tv_story_tick"].every((id) => HAS.has(id)));
  /** A later page: "Your turn to read." after one of Sensei's pages (not straight after another child page, and not
   *  twice within 40 s); otherwise a quiet hand-over. */
  const [turnLine] = useState(() => !yours && after !== "read" && gameNow() - turnLineAt >= 40_000);
  /** "Let's read it together." at 8 s: on the first story's pages, once per save. */
  const [togetherDue] = useState(() => form === "full" && onceInSave("story:together") && HAS.has("tv_story_together"));
  const helps = useRef(0);
  const clues = useRef(0);
  useHelp((n) => {
    helps.current = n;
    if (n === 1) say({ line: "help_read" });
    else void readToThem();
  });
  const [turnSaid, setTurnSaid] = useState(false);
  // a common word with a spelling the child hasn't been taught (the first one due on this page): it lights up, and
  // Sensei says "This is 'the'. Just say 'the' here." before the child's turn; the tick waits for it
  const [special] = useState(() => specialWords(page.text).find(({ word }) => isDue(specialKey(word), "special")) ?? null);
  const [teachIdx, setTeachIdx] = useState(-1);
  const teaching = useRef(!!special);
  const taught = useRef(false); // the special-word teaching was said on this page (Hear it again says it too)
  // each word glows once as the page is handed over, and again on "If you get stuck, tap a word…"
  useEffect(() => onClip((id) => void ((id === "tv_story_yours" || id === "story_your_turn" || id === "tv_story_help") && glowWords(wordsRef.current))), []);
  useEffect(() => pub({ busy: !live || phase === "done", next: live && phase === "read" ? "I read it!" : null }), [live, phase]);
  useEffect(() => {
    alive.current = true;
    (async () => {
      let ok = true;
      if (special) {
        setTeachIdx(special.index);
        taught.current = true;
        ok = await say({ line: SPECIAL_LINE[special.word] });
        if (!alive.current) return;
        setTeachIdx(-1);
        if (ok) heard(specialKey(special.word));
        await sleep(200);
        if (!alive.current) return;
      }
      teaching.current = false;
      // fast and slow's idea (TEACHER_SCRIPT §9.3: the session's first child page, straight after the hand-over; the
      // reading bank; once per game type a session, so later pages get null)
      const idea = (tight: boolean) => {
        if (ideaTried) return null;
        const id = fsIdea("story", "read", { tight });
        if (!id || !HAS.has(id)) return null;
        ideaTried = true;
        return id;
      };
      // the line that hands the page over: the tick wakes as it starts (from its first word), and after it at the latest
      const cue = async (items: Say[], id: string) => {
        void nextClip(id, 5000).then(() => alive.current && goLive());
        const said = await say(items);
        if (alive.current) goLive();
        return said;
      };
      if (yours) {
        // the first page: what this page is, (the idea), where help is, then the tick. A tap on a word or the speaker
        // cuts it short: the page goes live at once (the rest comes on the next page, until it has been heard)
        if (ok) ok = await say({ line: "tv_story_yours" });
        if (ok && alive.current) {
          // (a tight line: this run is about 11 s before the tick, TEACHER_SCRIPT §6)
          const id = idea(true);
          if (id && (ok = await say([{ gap: 250 }, { line: id }]))) fsSaid(id, "story");
        }
        if (ok && alive.current && (ok = await say([{ gap: 250 }, { line: "tv_story_help" }]))) heard("story:yours");
        if (!alive.current) return;
        if (ok && !doneRef.current) await cue([{ gap: 250 }, { line: "tv_story_tick" }], "tv_story_tick");
        goLive();
        turnDoneAt.current = performance.now();
      } else if (turnLine) {
        turnLineAt = gameNow();
        ok = await cue([{ line: "story_your_turn" }], "story_your_turn");
        turnDoneAt.current = performance.now();
        // (the page stays live: the tick cuts it)
        if (ok && alive.current && !doneRef.current && !readToMe.current) {
          const id = idea(false);
          if (id && (await say([{ gap: 300 }, { line: id }]))) fsSaid(id, "story");
        }
      } else {
        // a quiet hand-over: the words glow, and the tick wakes
        goLive();
        glowWords(wordsRef.current);
        turnDoneAt.current = performance.now();
        if (ok && alive.current && !doneRef.current) {
          const id = idea(false);
          if (id && (await say([{ gap: 600 }, { line: id }]))) fsSaid(id, "story");
        }
      }
      if (alive.current) setTurnSaid(true);
    })();
    return () => void (alive.current = false);
  }, []);
  // stuck on the words (TEACHER_SCRIPT §3.23): the first story's pages read it together at 8 s (once per save);
  // then, in turn, "When you've read it, tap the green tick." while the tick hops, and the ninja's spell shimmering over
  // the words with "If you get stuck, tap a word, and I'll help."; quiet after four clues
  const tickIdle = () => {
    void say({ line: HAS.has("tv_story_tick_idle") ? "tv_story_tick_idle" : "help_read" });
    bounce(tickRef.current);
  };
  const wordHint = () => {
    void ninja.act("cast", wordsCentre(wordsRef.current), { react: false }).then(() => {
      if (!alive.current) return;
      wordsRef.current?.querySelectorAll(".st-word").forEach((w, i) => bounce(w, i * 90));
    });
    void say({ line: HAS.has("tv_story_help") ? "tv_story_help" : "story_tap_help" });
  };
  const ladder = togetherDue ? [() => void together(), tickIdle, wordHint, tickIdle] : [tickIdle, wordHint, tickIdle, wordHint];
  usePageIdle(phase === "read" && turnSaid, togetherDue ? 8000 : 10000, (n) => {
    clues.current = n;
    ladder[n - 1]?.();
  });
  const readTheWords = () => {
    if (readToMe.current) return false; // read to them, not by them
    if (triedWord.current) return true;
    const t = turnDoneAt.current;
    return t !== null && (performance.now() - t) * FAST >= 450 * words.length; // ~0.45 s a word after "Your turn!"
  };
  // Hear it again ("Read it to me", in the column): the special-word teaching if it was said here, the page read to
  // them word by word, and "Your turn to read." (on the child's first page, "When you've read it all, tap the green
  // tick."). A page read to them doesn't feed the streak
  const readTok = useRef(0);
  const readToThem = async () => {
    if (doneRef.current || teaching.current) return;
    readToMe.current = true;
    goLive();
    setTg(null);
    const my = ++readTok.current;
    const live = () => alive.current && my === readTok.current;
    if (special && taught.current) {
      setTeachIdx(special.index);
      const ok = await say({ line: SPECIAL_LINE[special.word] });
      if (!live()) return;
      setTeachIdx(-1);
      if (!ok) return;
      await sleep(200);
      if (!live()) return;
    }
    // (the turn's own instruction closes it: TEACHER_SCRIPT §3.23, Hear it again replays the turn's bundle, never the
    // fast/slow aside)
    const tail = yours ? "tv_story_tick" : "story_your_turn";
    await readAlong(story, page.id, words, (i) => live() && setHi(i), [{ gap: 300 }, { line: tail }]);
  };
  // "Let's read it together." (once per save): each word's letters light sound by sound as Sensei says them, then the
  // word (the session's first read-back is Sensei's slow-then-fast pair). The tick stays live: it stops the reading.
  // It is help, so a page read together doesn't feed the streak
  const together = async () => {
    if (doneRef.current) return;
    readToMe.current = true;
    goLive();
    const my = ++readTok.current;
    const live = () => alive.current && my === readTok.current && !doneRef.current;
    let ok = await say({ line: "tv_story_together" });
    for (let i = 0; ok && live() && i < words.length; i++) {
      const clean = words[i].replace(/[^A-Za-z']/g, "");
      if (!clean) continue;
      const segs = decode(clean, maxUnit);
      setTg({ i, k: -1 });
      if (segs) ok = await readBack(segs, clean.toLowerCase(), (k) => live() && setTg({ i, k: k < 0 ? ALL : k }));
      else {
        setTg({ i, k: ALL });
        ok = await say({ word: spoken(clean) });
      }
      if (ok && live()) await sleep(220);
    }
    if (alive.current && my === readTok.current) setTg(null);
    if (ok && live()) heard("story:together");
  };
  useNav({ back: onBack, again: readToThem, againAt: "column", next: null, speed: {} });
  const readIt = async () => {
    if (doneRef.current) return;
    if (!liveRef.current) {
      // before the line that cues it: felt, not taken (and the special word hops, if it is being taught)
      wiggle(tickRef.current);
      if (teaching.current) bounce(wordsRef.current?.querySelectorAll(".st-word")[special?.index ?? 0]);
      return;
    }
    // the child says they've read it: the ninja's magic lands on the words, then Sensei reads it back fluently
    doneRef.current = true;
    readTok.current++;
    setHi(-1);
    setTeachIdx(-1);
    setTg(null);
    sfx.good();
    setPhase("done");
    turns.push(clues.current >= 2 || helps.current >= 2);
    const strike = answer(wordsCentre(wordsRef.current)); // the strike first, then the streak (see the top)
    // (a page read again after Back doesn't count twice)
    const real = readTheWords() && !counted;
    const hit = real ? streak.hit() : null;
    const tier = streakLine(hit);
    void strike.then(() => alive.current && setLit(true));
    await tickReply(real, tier);
    await breath(tier, () => alive.current);
    if (!alive.current) return;
    await sleep(160);
    if (!alive.current) return;
    await readAlong(story, page.id, words, (i) => alive.current && setHi(i));
    if (!alive.current) return;
    setHi(-1);
    await sleep(200);
    if (alive.current) onNext();
  };
  return (
    <>
      <div className="panel st-panel read">
        <div ref={wordsRef} className={`st-words ${lit ? "lit" : ""} ${lines ? "" : "flow"}`} data-size={size} style={{ "--gap": `${gapOf(size)}px` } as CSSProperties}>
          {rows.map((row, j) => (
            <div key={j} className="st-line">
              {row.map(({ w, i }) => (
                <ReadWord
                  key={i}
                  i={i}
                  text={w}
                  size={size}
                  maxUnit={maxUnit}
                  on={i === hi || i === teachIdx}
                  tg={tg?.i === i ? tg.k : undefined}
                  onHelp={() => {
                    triedWord.current = true;
                    readTok.current++; // (a word tapped stops reading together)
                    setTg(null);
                    goLive();
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* the green tick where Next stands on the pages Sensei reads (Back and Hear it again are the nav layer's, above it) */}
      <div className="st-side">
        {/* (the wrapper beats and ripples on the compositor: story.css) */}
        <span ref={tickRef} className={`st-go-wrap ${phase === "done" ? "" : live ? "ready" : "wait"}`}>
          <RoundButton label="I read it!" className={`go st-go ${phase === "read" ? "ready" : "done"}`} onClick={readIt}><Icon.check /></RoundButton>
        </span>
      </div>
    </>
  );
}
/**
 * The reply to "I read it!" (TEACHER_SCRIPT §3.23, §5.3): one line at most, never stacked. A tier-up's own line ("Ninja
 * power!") speaks for it. A page the child really read (they spent a moment on the words, or tapped one for help) gets
 * "Well read!", and every second one the praise slot instead: fast and slow's praise once a session (Move 4, the
 * letters kind), else "Lovely reading!" and a generic line in turn. A page tapped straight through gets no words: the
 * ninja's magic, and Sensei reading it back, are the reply (praise is for the work, SCRIPT_STYLE §8).
 */
async function tickReply(real: boolean, tier: string | null): Promise<void> {
  const o = { game: "story" as const, every: 2 };
  if (!real) return;
  if (tier) return void praiseFor({ ...o, replaced: true });
  if (praiseWanted(o)) {
    const fs = fsPraise("story", "letters");
    if (fs && HAS.has(fs)) {
      praiseBy(fs);
      if (await say({ line: fs })) fsSaid(fs, "story");
      return;
    }
    const line = praiseFor(o);
    if (line) return void (await say({ line }));
  } else praiseFor(o);
  await say({ line: "well_read" });
}

// ---------------------------------------------------------------- choose what happens
/** How far the chosen word or picture steps up (story.css: .tile.right/.picked, .card.right). */
const LIFT = 24;
/** A choice word in its tile, with sound buttons under each spelling; each spelling lights up as its sound is said,
 *  then the whole word as it is blended (lit = ALL). */
function SegWord({ word, segs, lit }: { word: string; segs: Seg[] | null; lit: number }) {
  if (!segs || segs.map((s) => s.g).join("") !== word) return <>{word}</>;
  return (
    <span className="st-seg">
      {segs.map((s, k) => (
        <span key={k} className={lit === k || lit === ALL ? "on" : undefined}>
          {s.g}
          <span className={`sb ${s.g === "x" ? "two" : s.g.length > 1 ? "bar" : "dot"} ${lit === k || lit === ALL ? "lit" : ""}`} />
        </span>
      ))}
    </span>
  );
}

function ChoicePage({ story, page, form, onPick, onBack, visited }: { story: Story; page: PageOf<"choice">; form: FrameForm; onPick: (next: string) => void; onBack: (() => void) | null; visited: Set<string> }) {
  const picked = useRef(false);
  const alive = useRef(true);
  const live = () => alive.current;
  // the word the child chose (it steps up; the other one sinks away and fades out, so the ninja's stars can't seem to land on it)
  const [chosen, setChosen] = useState<{ word: string; right: boolean } | null>(null);
  const [lit, setLit] = useState(-1);
  const firstTry = !page.options.some((o) => visited.has(o.next));
  const segsOf = (word: string) => WORD_BY_TEXT[word]?.segs ?? decode(word, story.maxUnit);
  /** The story's own way on (not a detour), for bots: `next`. */
  const onward = page.options.find((o) => !isDetour(story, page.id, o.next))?.word ?? page.options[0].word;
  // The question, then how to answer it (TEACHER_SCRIPT §3.23): "Now you choose what happens. Read the two words, and
  // tap one." on the full form (at the save's first story choice the words wake as it starts: F14) and on the recap
  // form (a later day); a known game (the short form), or the way back from a detour, is the question only
  const [how] = useState(() => (firstTry && form !== "short" ? (HAS.has("tv_story_choice") ? "tv_story_choice" : !heardBefore("story:choice") ? "audit_story_choice" : null) : null));
  const [waiting, setWaiting] = useState(() => !!how && !heardBefore("story:choice"));
  const waitRef = useRef(waiting);
  const open = () => {
    if (!waitRef.current) return;
    waitRef.current = false;
    setWaiting(false);
  };
  useEffect(() => onClip((id) => void (id === how && open())), []);
  const ask = () => say([{ story: story.id, page: page.id, caption: page.text }, ...(how ? [{ gap: 200 }, { line: how }] : [])]);
  useHelp(() => void ask());
  // Hear it again (the column): the question and how to answer it. The tortoise and the rabbit sit in the column: the
  // chosen word is read back
  useNav({ back: onBack, again: () => (picked.current ? undefined : ask()), againAt: "column", next: null, speed: {} });
  useEffect(() => pub({ busy: waiting || !!chosen, next: waiting || chosen ? null : onward }), [waiting, chosen]);
  const [asked, setAsked] = useState(false);
  const choicesRef = useRef<HTMLDivElement>(null);
  const idles = useRef(0);
  useEffect(() => {
    alive.current = true;
    // the ninja wonders too, once the question's been asked
    void ask().then((ok) => {
      open();
      if (!alive.current) return;
      setAsked(true);
      if (ok && !picked.current) void ninja.act("think");
    });
    return () => void (alive.current = false);
  }, []);
  // stuck: the ninja wonders again, each word hops in turn with a tink, and the question is asked again
  usePageIdle(asked && !chosen, 7000, (n) => {
    idles.current = n;
    void ninja.act("think");
    [...(choicesRef.current?.querySelectorAll(".tile") ?? [])].forEach((el, j) => {
      bounce(el, 300 + j * 380);
      window.setTimeout(() => alive.current && !picked.current && sfx.tink(), 300 + j * 380);
    });
    window.setTimeout(() => alive.current && !picked.current && void ask(), 1200);
  });
  const pick = async (o: PageOf<"choice">["options"][number], el: HTMLElement) => {
    if (picked.current) return;
    if (waitRef.current) return void (bounce(el), sfx.tink()); // felt; the words wait for "Now you choose what happens."
    picked.current = true;
    if (!heardBefore("story:choice")) heard("story:choice");
    turns.push(idles.current >= 2);
    hush(); // the child has chosen: the question stops (the word is sounded out next)
    // a detour ("pig" or "den"? The child can't know): a funny look somewhere else, which neither feeds nor breaks the
    // streak. The ninja leaps and points a star at it, eager to go and look.
    const detour = isDetour(story, page.id, o.next);
    setChosen({ word: o.word, right: !detour });
    // the chosen word steps up (story.css: LIFT) and the other one sinks away and fades, out of the magic's path; the
    // magic lands on the top of the chosen word, so it flies high over where the other one was
    const r = stageRect(el);
    const at = { x: r.x + r.w / 2, y: r.y - LIFT + r.h * 0.26 };
    let tier: string | null = null;
    if (detour) void ninja.act("jump", at, { react: false }).then(() => live() && boing(el));
    else {
      const strike = answer(at, "flip", { react: false }); // the strike first, then the streak (see the top)
      if (firstTry) tier = streakLine(streak.hit());
      void strike.then(() => live() && boing(el));
    }
    // a tier-up's "Ninja power!" goes first: the sounded-out word takes longer than the line's 4 s window
    await breath(tier, live);
    if (!live()) return;
    // the chosen word, read back: its letters light sound by sound, then the word
    const w = WORD_BY_TEXT[o.word];
    const segs = w?.segs ?? segsOf(o.word);
    if (segs) await readBack(segs, w?.text ?? o.word, (k) => live() && setLit(k < 0 ? ALL : k));
    if (!live()) return;
    setLit(-1);
    onPick(o.next);
  };
  return (
    <>
      <div className="panel st-panel">
        <span className="st-ask">{page.text}</span>
      </div>
      <div ref={choicesRef} className={`st-choices ${waiting ? "wait" : ""}`}>
        {page.options.map((o, i) => (
          <button
            key={o.word}
            aria-label={o.word}
            className={`tile ${chosen ? "" : "lg"} drop-in ${visited.has(o.next) ? "visited" : ""} ${chosen?.word === o.word ? (chosen.right ? "right" : "picked") : chosen ? "not" : ""}`}
            style={{ animationDelay: `${i * 0.15}s` }}
            {...tapProps<HTMLButtonElement>((el) => void pick(o, el))}
          >
            <SegWord word={o.word} segs={segsOf(o.word)} lit={chosen?.word === o.word ? lit : -1} />
          </button>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- the question at the end
function QuestionPage({ story, page, onDone, onMiss, onBack }: { story: string; page: PageOf<"question">; onDone: () => void; onMiss: () => void; onBack: (() => void) | null }) {
  const [wrong, setWrong] = useState<string | null>(null);
  const [missed, setMissed] = useState<string[]>([]); // wrong pictures already tried: they stay faded
  const [right, setRight] = useState(false);
  /** The pictures come after "Now a question about the story." (so the question is never cut off by an early tap),
   *  and glow as it is read. */
  const [cardsIn, setCardsIn] = useState(() => !HAS.has("tv_story_q"));
  const [asking, setAsking] = useState(false);
  /** The right picture glows (Help's second press, or a second miss). */
  const [hint, setHint] = useState(false);
  const tried = useRef(false);
  const done = useRef(false);
  const alive = useRef(true);
  const missTok = useRef(0);
  const misses = useRef(0);
  const helps = useRef(0);
  const idles = useRef(0);
  const cardsRef = useRef<HTMLDivElement>(null);
  const live = () => alive.current;
  const correct = page.options.find((o) => o.correct);
  // the right picture isn't always first: shuffle where each one stands (the DOM keeps the content's order)
  const order = useMemo(() => {
    const o = page.options.map((_, i) => i);
    for (let i = o.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [o[i], o[j]] = [o[j], o[i]];
    }
    return o;
  }, []);
  const hear = async () => {
    setCardsIn(true);
    setAsking(true);
    const ok = await say({ story, page: page.id, caption: page.text });
    if (alive.current) setAsking(false);
    return ok;
  };
  const rightCard = () => cardsRef.current?.querySelector<HTMLElement>(".card.answer");
  // Help: the question again; then the right picture glows ("Look for the glow."); then "Here it is. Tap it when you're
  // ready." as it hops (TEACHER_SCRIPT §5.5)
  useHelp((n) => {
    helps.current = n;
    if (n === 1) return void hear();
    setCardsIn(true);
    setHint(true);
    const line = n === 2 ? "tv_look_glow" : "tv_idle_point";
    void say({ line: HAS.has(line) ? line : "help_question" });
    if (n >= 3) bounce(rightCard());
  });
  // Hear it again (pre-readers can't read the question: they can always hear it again) and Back, in the column
  useNav({ back: onBack, again: () => (done.current ? undefined : hear()), againAt: "column", next: null });
  const [asked, setAsked] = useState(false);
  useEffect(() => pub({ busy: !cardsIn || right, next: cardsIn && !right ? correct?.label ?? null : null }), [cardsIn, right]);
  useEffect(() => {
    alive.current = true;
    (async () => {
      const lead = HAS.has("tv_story_q") ? await say({ line: "tv_story_q" }) : true;
      if (!alive.current) return;
      setCardsIn(true);
      // (cut short by Help or Hear it again: they have asked the question themselves)
      if (!lead) return void setAsked(true);
      await sleep(150);
      if (!alive.current || done.current) return;
      const ok = await hear();
      if (!alive.current) return;
      setAsked(true);
      if (ok && !tried.current && !done.current) void ninja.act("think");
    })();
    return () => void (alive.current = false);
  }, []);
  /** "Have another go", in pictures: the pictures not tried yet wiggle in turn, left to right, each with a tink. */
  const nudge = () => {
    const els = [...(cardsRef.current?.querySelectorAll<HTMLElement>(".card:not(.tried)") ?? [])].sort((a, b) => stageRect(a).x - stageRect(b).x);
    els.forEach((el, j) => {
      window.setTimeout(() => live() && !done.current && sfx.tink(), j * 220);
      el.animate(
        [
          { scale: "1", rotate: "0deg" },
          { scale: "1.12", rotate: "-5deg", offset: 0.25 },
          { scale: "1.12", rotate: "5deg", offset: 0.55 },
          { scale: "1", rotate: "0deg" },
        ] as Keyframe[],
        { duration: 640, delay: j * 220, easing: "ease-in-out" },
      );
    });
  };
  // stuck: the pictures not tried yet wiggle in turn, and the question is asked again
  usePageIdle(asked && !right, 7000, (n) => {
    idles.current = n;
    nudge();
    window.setTimeout(() => alive.current && !done.current && void hear(), 900);
  });
  const tap = async (o: PageOf<"question">["options"][number], el: HTMLElement) => {
    if (done.current) return;
    if (!o.correct && missed.includes(o.img)) {
      // tried already: no second "not quite" (and no lost star), just a pointer to the pictures not tried yet
      sfx.tink();
      nudge();
      return;
    }
    if (o.correct) {
      done.current = true;
      setRight(true);
      setHint(false);
      sfx.great();
      turns.push(misses.current >= 2 || helps.current >= 2 || idles.current >= 2);
      // the right picture steps up and the others sink away and fade (story.css), out of the magic's path; the magic
      // lands on the top of the picture, so it flies high over where the others were
      const r = stageRect(el);
      const strike = answer({ x: r.x + r.w / 2, y: r.y - LIFT + r.h * 0.2 }, undefined, { react: false }); // the strike first, then the streak (see the top)
      // (the closing line follows at once: a tier-up here powers up silently, its line would be stacked on it)
      if (!tried.current) streak.hit({ line: false });
      void strike.then(() => live() && boing(el));
      // the answer said back (the model is the feedback); no praise line: the closing "The end! What a story!" follows,
      // and it is the level's praise (SCRIPT_STYLE §8). The rhythm still counts the answer
      praiseFor({ game: "story", closingNext: true, keptGoing: tried.current });
      if (/^[a-z]+$/.test(o.label)) await say({ word: o.label });
      if (live()) onDone();
    } else {
      tried.current = true;
      misses.current++;
      onMiss();
      const my = ++missTok.current;
      // one gentle reply: the picture says its own word, then "Ooh, not quite. Have another go." (a streak that was
      // going: "Keep going, ninja." with the ninja's fizzle, no buzzer). The ninja has a think (by itself when a streak
      // was going; here when there wasn't one). A second miss: the right picture glows, "Let's do it together. It's
      // this one. Now you tap it." (TEACHER_SCRIPT §5.4)
      const e = streak.miss({ line: false });
      if (e.prevN === 0) void ninja.act("think");
      setWrong(o.img);
      setMissed((m) => (m.includes(o.img) ? m : [...m, o.img]));
      const lost = streakLine(e);
      const second = misses.current >= 2 && HAS.has("tv_fix_together");
      if (second) setHint(true);
      const own: Say[] = /^[a-z]+$/.test(o.label) ? [{ word: o.label }, { gap: 250 }] : [];
      if (!lost) sfx.wrong();
      await say([...own, { line: second ? "tv_fix_together" : lost ?? "not_quite" }]);
      if (lost) await sleep(250);
      if (!live() || my !== missTok.current) return;
      setWrong((w) => (w === o.img ? null : w));
      if (done.current) return;
      if (second) bounce(rightCard());
      else nudge();
      if (lost && !second) void hear();
    }
  };
  return (
    <>
      <div className="st-dim" />
      <div className="panel st-question pop-in">{page.text}</div>
      <div ref={cardsRef} className={`st-cards ${right ? "solved" : ""} ${asking ? "asking" : ""}`}>
        {cardsIn &&
          page.options.map((o, i) => (
            <button
              key={o.img}
              aria-label={o.label}
              className={`card drop-in ${o.correct ? "answer" : ""} ${wrong === o.img ? "wrong" : ""} ${missed.includes(o.img) ? "tried" : ""} ${right && o.correct ? "right" : ""} ${hint && o.correct && !right ? "hint" : ""}`}
              style={{ order: order[i], animationDelay: `${order[i] * 0.12}s, 0s`, "--k": order[i] } as CSSProperties}
              {...tapProps<HTMLButtonElement>((el) => void tap(o, el))}
            >
              <img src={img(o.img)} alt={o.label} />
            </button>
          ))}
      </div>
    </>
  );
}
