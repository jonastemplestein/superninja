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
// Explanations (docs/NARRATIVE_AUDIT.md, ./narrate.tsx): until the child has made a story choice, a choice page says
// "Read the two words. Tap the one you choose." and its words wait for it (F14); later ones say it short. A read
// page with a common word whose spelling hasn't been taught ("the", "is", "I") lights that word and says the official
// "This is 'the'. Just say 'the' here." first, spaced (F15). A word tapped for help can bring a spaced "two letters,
// one sound" reminder.
//
// Navigation (docs/NAVIGATION.md §5.D): Home is the nav layer's (top-left); Back, Hear it again and Next stand in the
// right-hand column above Help (the text panel owns the bottom strip). Nothing turns a page by itself: the title and
// every page Sensei reads hold on a green Next that stays dim until the reading is over. Back goes to the previous page
// (read again; it never undoes a miss). A page the child reads, a choice and the question are the child's turns: Hear
// it again reads the page to them (with the special-word teaching, if it was said) or asks the question again.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { LevelProps } from "../App";
import { STORIES, type Page, type Story } from "../content/stories";
import { decode } from "../content/validate";
import { say, sayBlend, sfx, playMusic, preload, urls, hush, load, isSpeaking } from "../engine/audio";
import { FAST } from "../engine/fast";
import { WORD_BY_TEXT, type Seg } from "../content/phonics";
import { img, RoundButton, Icon, fx, sleep, SenseiDock, tapProps, useHelp, stageRect, useIdlePrompt, nudgeHelp, isUpright } from "../ui/ui";
import { NinjaSpot, ninja, type Move } from "../ui/Ninja";
import { streak, streakLine, type StreakEvent } from "../engine/streak";
import { pickPraise } from "../engine/feedback";
import { SPECIAL_LINE, specialKey, specialWords } from "../content/narrative";
import { beginLevel, heard, heardBefore, isDue, lettersReminder, twoSoundsReminder } from "./narrate";
import { useNav, usePresentation, nudgeNext, navLog } from "../ui/nav";
import "../styles/story.css";

type Pt = { x: number; y: number };
type PageOf<K extends Page["kind"]> = Extract<Page, { kind: K }>;

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
/** The ninja's squash-and-glow on something its magic hit (for strikes aimed at a point rather than the element). */
function boing(el: Element) {
  el.animate(
    [
      { scale: "1", filter: "brightness(1)" },
      { scale: "1.14 0.87", filter: "brightness(1.5)", offset: 0.2 },
      { scale: "0.94 1.07", filter: "brightness(1.15)", offset: 0.48 },
      { scale: "1.02 0.98", offset: 0.72 },
      { scale: "1", filter: "brightness(1)" },
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
 *  has been said. Only at tier-ups (at most three times a level), and only if the line exists. */
async function breathForStreak(e: StreakEvent | null, alive: () => boolean) {
  if (!streakLine(e) || !alive()) return;
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

/** Word-by-word highlight while a clip of `dur` seconds plays (each word weighted by its length). Returns stop. */
function karaoke(words: string[], dur: number, set: (i: number) => void): () => void {
  const lens = words.map((w) => w.length + 2);
  const total = lens.reduce((a, b) => a + b, 0);
  const t0 = performance.now();
  let raf = 0;
  const tick = () => {
    const el = (performance.now() - t0) / 1000 / dur;
    let acc = 0,
      k = 0;
    for (; k < lens.length; k++) {
      acc += lens[k] / total;
      if (acc > el) break;
    }
    set(k);
    if (el < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

// ---------------------------------------------------------------- the story
export function StoryScene({ level, onDone }: LevelProps) {
  useState(() => beginLevel(level)); // (during the first render)
  const story = STORIES.find((s) => s.id === level.story)!;
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
  (window as any).__snState = { scene: "story", story: story.id, page: pageId ?? "title", kind: page?.kind ?? "title" };

  useEffect(() => {
    alive.current = true;
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
    // (otherwise the title holds on Next: TitleStep)
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
    fx.rain("petals", 60);
    const end = say({ line: "story_end" });
    // let a power-up that's still going land first, then the big finale
    const party = whenFree(() => {}, () => alive.current, 1000).then(() => (alive.current ? ninja.celebrate() : undefined));
    await Promise.all([end, party]);
    if (alive.current) onDone(misses.current === 0 ? 3 : misses.current <= 2 ? 2 : 1, { closing: "story_end" });
  };
  const pos = (p: Page) => ({ i: story.pages.indexOf(p), of: story.pages.length });

  return (
    <div ref={sceneRef} className={`scene st-scene k-${page?.kind ?? "title"}`}>
      {page && <img key={page.scene + turn} className="bg-img st-bg" src={img(`story_${story.id}_${page.scene}`)} alt="" />}
      {!page && <img className="bg-img" src={img(`story_${story.id}_${story.pages[0].scene}`)} alt="" style={{ filter: "blur(4px) brightness(.8)" }} />}
      {!page && (
        <div className="st-title pop-in">
          <div className="panel">
            <div className="display">{story.title}</div>
          </div>
        </div>
      )}
      {!page && !pageId && <TitleStep story={story} onNext={() => (sfx.page(), show(story.pages[0].id, "next"))} />}
      {page?.kind === "narr" && <NarrPage key={page.id + turn} story={story.id} page={page} pos={pos(page)} onBack={back} onNext={() => goNext(page, "next")} />}
      {page?.kind === "read" && (
        <ReadPage
          key={page.id + turn}
          story={story.id}
          page={page}
          maxUnit={story.maxUnit}
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

// ---------------------------------------------------------------- the title: a held step
/** "Story time! I'll read, and you read too." and the title read out; then it holds on Next (the title card is drawn
 *  by StoryScene). Hear it again says it again. */
function TitleStep({ story, onNext }: { story: Story; onNext: () => void }) {
  usePresentation([{ key: "title", run: () => say([{ line: "story_start" }, { gap: 250 }, { story: story.id, page: "title", caption: story.title }]) }], {
    id: "story-title",
    onDone: onNext,
    againAt: "column",
    state: false,
  });
  return null;
}

// ---------------------------------------------------------------- Sensei reads
/** A page Sensei reads, word by word (the karaoke highlight). It holds on Next, dim until the reading is over; Hear it
 *  again reads it again; Back goes to the previous page. The idle nudge is the nav layer's (the arrow glows at 8 s, and at
 *  16 s the ninja points a star at it while Sensei says "Tap the arrow when you're ready!"). */
function NarrPage({ story, page, pos, onNext, onBack }: { story: string; page: PageOf<"narr">; pos: { i: number; of: number }; onNext: () => void; onBack: (() => void) | null }) {
  const words = page.text.split(" ");
  const [hi, setHi] = useState(-1);
  const [done, setDone] = useState(false);
  const went = useRef(false);
  const tok = useRef(0);
  const stopK = useRef(() => {});
  const read = async () => {
    const my = ++tok.current;
    const buf = await load(urls.story(story, page.id));
    if (my !== tok.current) return;
    stopK.current();
    stopK.current = karaoke(words, buf?.duration ?? words.length * 0.35, setHi);
    await say({ story, page: page.id });
    if (my !== tok.current) return;
    stopK.current();
    setHi(-1);
    setDone(true);
  };
  // Help: the page again; once it has been read, the second press points at Next
  useHelp((n) => (!done || n === 1 ? void read() : nudgeNext()), [done]);
  useEffect(() => {
    void read();
    return () => {
      tok.current++;
      stopK.current();
    };
  }, []);
  const next = () => {
    if (went.current) return;
    went.current = true;
    tok.current++;
    stopK.current();
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
    if (/,$/.test(prev)) return 1.5;
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
    if (size === undefined) (size = SIZES[SIZES.length - 1]), (c += 100); // nothing fits: least bad at the smallest size
    c += (60 - size) * 0.45;
    if (!best || c < best.c - 1e-9) best = { c, l: { size, breaks } };
  }
  return best?.l ?? { size: SIZES[SIZES.length - 1], breaks: [] };
}

/** Narrowest tap box round a word, in stage px (84 ≈ 41 px on an 844×390 phone held sideways, where the stage is
 *  scaled ×0.49). Neighbouring short words' boxes overlap a little (at most ~17% of a box: the word gap is 34 px). */
const MIN_HIT = 84;
/** A word the child reads, with sound buttons (dot = 1 letter, bar = 2+ letters). Tap for help. */
export function ReadWord({ text, maxUnit, big, onHelp, on, i = 0, size }: { text: string; maxUnit: number; big?: boolean; onHelp?: () => void; on?: boolean; i?: number; size?: number }) {
  const clean = text.replace(/[^A-Za-z']/g, "");
  const segs = decode(clean, maxUnit);
  const [lit, setLit] = useState(-1);
  const btn = useRef<HTMLButtonElement>(null);
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
      // read to them, then (spaced) what one of its spellings is, with it lit: "It's two letters, but it's one sound."
      if (await sayBlend(segs, clean.toLowerCase(), setLit)) {
        const remind = twoSoundsReminder(segs) ?? lettersReminder(segs);
        if (remind) {
          setLit(remind.i);
          if (await say([{ gap: 200 }, ...remind.say])) remind.done();
        }
      }
    } else await say({ word: clean.toLowerCase() === "i" ? "I" : clean.toLowerCase() });
    setLit(-1);
  };
  const lead = text.match(/^[^A-Za-z']*/)?.[0] ?? "";
  const trail = text.match(/[^A-Za-z']*$/)?.[0] ?? "";
  const fs = size ?? (big ? 86 : 60);
  let pos = 0;
  return (
    <span className="st-word" style={{ "--i": i, marginRight: big ? 30 : undefined } as CSSProperties}>
      {lead}
      <button ref={btn} className={`word-btn ${on ? "on" : ""}`} {...tapProps(help)} style={{ fontSize: fs }}>
        {segs
          ? segs.map((s, k) => {
              const chunk = clean.slice(pos, pos + s.g.length);
              pos += s.g.length;
              return (
                <span key={k} style={{ position: "relative", color: lit === k ? "var(--blossom-deep)" : undefined }}>
                  {chunk}
                  <span className={`sb ${s.g === "x" ? "two" : s.g.length > 1 ? "bar" : "dot"} ${lit === k ? "lit" : ""}`} style={{ bottom: -12 }} />
                </span>
              );
            })
          : <span style={{ color: on ? undefined : "var(--indigo)" }}>{clean}</span>}
      </button>
      <span style={{ fontSize: fs * (big ? 1 : 0.94) }}>{trail}</span>
    </span>
  );
}

function ReadPage({ story, page, maxUnit, counted, onNext, onBack }: { story: string; page: PageOf<"read">; maxUnit: number; counted: boolean; onNext: () => void; onBack: (() => void) | null }) {
  const [phase, setPhase] = useState<"read" | "done">("read");
  const [hi, setHi] = useState(-1);
  const [lit, setLit] = useState(false);
  const readToMe = useRef(false);
  const alive = useRef(true);
  const wordsRef = useRef<HTMLDivElement>(null);
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
  useHelp((n) => {
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
  useEffect(() => {
    alive.current = true;
    (async () => {
      if (special) {
        setTeachIdx(special.index);
        taught.current = true;
        const ok = await say({ line: SPECIAL_LINE[special.word] });
        if (!alive.current) return;
        setTeachIdx(-1);
        if (ok) heard(specialKey(special.word));
        await sleep(200);
        if (!alive.current) return;
      }
      teaching.current = false; // (the tick waits until "Your turn!" has begun)
      await say({ line: "story_your_turn" });
      turnDoneAt.current = performance.now();
      if (alive.current) setTurnSaid(true);
    })();
    return () => void (alive.current = false);
  }, []);
  const sideRef = useRef<HTMLDivElement>(null);
  // stuck on the words: the ninja's spell shimmers over them ("tap a word and I'll help"); then "Read each word, then
  // tap the green tick" while the tick bounces
  usePageIdle(phase === "read" && turnSaid, 8000, (n) => {
    if (n === 1) {
      void ninja.act("cast", wordsCentre(wordsRef.current), { react: false }).then(() => {
        if (!alive.current) return;
        wordsRef.current?.querySelectorAll(".st-word").forEach((w, i) => bounce(w, i * 90));
      });
      void say({ line: "story_tap_help" });
    } else {
      void say({ line: "help_read" });
      bounce(sideRef.current?.querySelector('[aria-label="I read it!"]'));
    }
  });
  const readTheWords = () => {
    if (readToMe.current) return false; // read to them, not by them
    if (triedWord.current) return true;
    const t = turnDoneAt.current;
    return t !== null && (performance.now() - t) * FAST >= 450 * words.length; // ~0.45 s a word after "Your turn!"
  };
  // Hear it again ("Read it to me", in the column): the special-word teaching if it was said here, the page read to
  // them word by word, and "Your turn to read!" (a page read to them doesn't feed the streak)
  const readTok = useRef(0);
  const readToThem = async () => {
    if (phase === "done" || teaching.current) return;
    readToMe.current = true;
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
    const buf = await load(urls.story(story, page.id));
    if (!live()) return;
    const stop = karaoke(words, buf?.duration ?? words.length * 0.4, setHi);
    const ok = await say({ story, page: page.id });
    stop();
    if (!live()) return;
    setHi(-1);
    if (ok) await say([{ gap: 300 }, { line: "story_your_turn" }]);
  };
  useNav({ back: onBack, again: readToThem, againAt: "column", next: null });
  const readIt = async () => {
    if (phase === "done") return;
    if (teaching.current) return void bounce(wordsRef.current?.querySelectorAll(".st-word")[special?.index ?? 0]); // hear the special word first
    // the child says they've read it: the ninja's magic lands on the words, then Sensei reads it back fluently
    readTok.current++;
    setHi(-1);
    setTeachIdx(-1);
    sfx.good();
    setPhase("done");
    const strike = answer(wordsCentre(wordsRef.current)); // the strike first, then the streak (see the top)
    // (a page read again after Back doesn't count twice)
    const hit = readTheWords() && !counted ? streak.hit() : null;
    void strike.then(() => alive.current && setLit(true));
    await say({ line: "well_read" });
    await breathForStreak(hit, () => alive.current);
    if (!alive.current) return;
    await sleep(160);
    const buf = await load(urls.story(story, page.id));
    if (!alive.current) return;
    const stop = karaoke(words, buf?.duration ?? words.length * 0.4, setHi);
    await say({ story, page: page.id });
    stop();
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
                <ReadWord key={i} i={i} text={w} size={size} maxUnit={maxUnit} on={i === hi || i === teachIdx} onHelp={() => void (triedWord.current = true)} />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* the green tick where Next stands on the pages Sensei reads (Back and Hear it again are the nav layer's, above it) */}
      <div ref={sideRef} className="st-side">
        <RoundButton label="I read it!" className={`go st-go ${phase === "read" ? "ready" : "done"}`} onClick={readIt}><Icon.check /></RoundButton>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- choose what happens
const ALL = 100;
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

function ChoicePage({ story, page, onPick, onBack, visited }: { story: Story; page: PageOf<"choice">; onPick: (next: string) => void; onBack: (() => void) | null; visited: Set<string> }) {
  const picked = useRef(false);
  const alive = useRef(true);
  const live = () => alive.current;
  // the word the child chose (it steps up; the other one sinks away and fades out, so the ninja's stars can't seem to land on it)
  const [chosen, setChosen] = useState<{ word: string; right: boolean } | null>(null);
  const [lit, setLit] = useState(-1);
  const firstTry = !page.options.some((o) => visited.has(o.next));
  const segsOf = (word: string) => WORD_BY_TEXT[word]?.segs ?? decode(word, story.maxUnit);
  // The question, then how to answer it (NARRATIVE_AUDIT F14): until the child has made a story choice, "Read the two
  // words. Tap the one you choose.", and the words wait for it (it's the only time it is explained); then the short
  // "Read the words, and tap one!"
  const [firstEver] = useState(() => !heardBefore("story:choice"));
  const waiting = useRef(firstEver);
  const ask = () => say([{ story: story.id, page: page.id, caption: page.text }, { gap: 200 }, { line: firstEver ? "audit_story_choice" : "audit_story_choose_again" }]);
  useHelp(() => void ask());
  // Hear it again (the column): the question and how to answer it
  useNav({ back: onBack, again: () => (picked.current ? undefined : ask()), againAt: "column", next: null });
  const [asked, setAsked] = useState(false);
  const choicesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    alive.current = true;
    // the ninja wonders too, once the question's been asked
    void ask().then((ok) => {
      waiting.current = false;
      if (!alive.current) return;
      setAsked(true);
      if (ok && !picked.current) void ninja.act("think");
    });
    return () => void (alive.current = false);
  }, []);
  // stuck: the ninja wonders again, each word hops in turn with a tink, and the question is asked again
  usePageIdle(asked && !chosen, 7000, () => {
    void ninja.act("think");
    [...(choicesRef.current?.querySelectorAll(".tile") ?? [])].forEach((el, j) => {
      bounce(el, 300 + j * 380);
      window.setTimeout(() => alive.current && !picked.current && sfx.tink(), 300 + j * 380);
    });
    window.setTimeout(() => alive.current && !picked.current && void ask(), 1200);
  });
  const pick = async (o: PageOf<"choice">["options"][number], el: HTMLElement) => {
    if (picked.current) return;
    if (waiting.current) return void (bounce(el), sfx.tink()); // felt; the words wait for "Tap the one you choose."
    picked.current = true;
    if (!heardBefore("story:choice")) heard("story:choice");
    let hit: StreakEvent | null = null;
    hush(); // the child has chosen: the question stops (the word is sounded out next)
    // a detour ("pig" or "den"? The child can't know): a funny look somewhere else, which neither feeds nor breaks the
    // streak. The ninja leaps and points a star at it, eager to go and look.
    const detour = isDetour(story, page.id, o.next);
    setChosen({ word: o.word, right: !detour });
    // the chosen word steps up (story.css: LIFT) and the other one sinks away and fades, out of the magic's path; the
    // magic lands on the top of the chosen word, so it flies high over where the other one was
    const r = stageRect(el);
    const at = { x: r.x + r.w / 2, y: r.y - LIFT + r.h * 0.26 };
    if (detour) void ninja.act("jump", at, { react: false }).then(() => live() && boing(el));
    else {
      const strike = answer(at, "flip", { react: false }); // the strike first, then the streak (see the top)
      if (firstTry) hit = streak.hit();
      void strike.then(() => live() && boing(el));
    }
    // a tier-up's "Ninja power!" goes first: the sounded-out word takes longer than the line's 4 s window
    await breathForStreak(hit, live);
    if (!live()) return;
    const w = WORD_BY_TEXT[o.word];
    if (w) await sayBlend(w.segs, w.text, (k) => live() && setLit(k < 0 ? ALL : k));
    if (!live()) return;
    setLit(-1);
    onPick(o.next);
  };
  return (
    <>
      <div className="panel st-panel">
        <span className="st-ask">{page.text}</span>
      </div>
      <div ref={choicesRef} className="st-choices">
        {page.options.map((o, i) => (
          <button
            key={o.word}
            className={`tile lg drop-in ${visited.has(o.next) ? "visited" : ""} ${chosen?.word === o.word ? (chosen.right ? "right" : "picked") : chosen ? "not" : ""}`}
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
  const tried = useRef(false);
  const done = useRef(false);
  const alive = useRef(true);
  const missTok = useRef(0);
  const cardsRef = useRef<HTMLDivElement>(null);
  const live = () => alive.current;
  // the right picture isn't always first: shuffle where each one stands (the DOM keeps the content's order)
  const order = useMemo(() => {
    const o = page.options.map((_, i) => i);
    for (let i = o.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [o[i], o[j]] = [o[j], o[i]];
    }
    return o;
  }, []);
  const hear = () => say({ story, page: page.id, caption: page.text });
  useHelp((n) => (n === 1 ? hear() : say({ line: "help_question" })));
  // Hear it again (pre-readers can't read the question: they can always hear it again) and Back, in the column
  useNav({ back: onBack, again: () => (done.current ? undefined : hear()), againAt: "column", next: null });
  const [asked, setAsked] = useState(false);
  useEffect(() => {
    alive.current = true;
    void say([{ line: "story_question" }, { gap: 150 }, { story, page: page.id, caption: page.text }]).then((ok) => {
      if (!alive.current) return;
      setAsked(true);
      if (ok && !tried.current && !done.current) void ninja.act("think");
    });
    return () => void (alive.current = false);
  }, []);
  /** "Have another go", in pictures: the pictures not tried yet wiggle in turn, left to right, each with a tink. */
  const nudge = () => {
    const els = [...(cardsRef.current?.querySelectorAll<HTMLElement>(".card:not(.tried)") ?? [])].sort((a, b) => stageRect(a).x - stageRect(b).x);
    els.forEach((el, j) => {
      window.setTimeout(() => live() && !done.current && sfx.tink(), j * 220);
      el.animate(
        [
          { scale: "1", rotate: "0deg", filter: "brightness(1)" },
          { scale: "1.12", rotate: "-5deg", filter: "brightness(1.15)", offset: 0.25 },
          { scale: "1.12", rotate: "5deg", filter: "brightness(1.15)", offset: 0.55 },
          { scale: "1", rotate: "0deg", filter: "brightness(1)" },
        ] as Keyframe[],
        { duration: 640, delay: j * 220, easing: "ease-in-out" },
      );
    });
  };
  // stuck: the pictures not tried yet wiggle in turn, and the question is asked again
  usePageIdle(asked && !right, 7000, () => {
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
      sfx.great();
      // the right picture steps up and the others sink away and fade (story.css), out of the magic's path; the magic
      // lands on the top of the picture, so it flies high over where the others were
      const r = stageRect(el);
      const strike = answer({ x: r.x + r.w / 2, y: r.y - LIFT + r.h * 0.2 }, undefined, { react: false }); // the strike first, then the streak (see the top)
      const hit = tried.current ? null : streak.hit();
      void strike.then(() => live() && boing(el));
      await say({ line: pickPraise() });
      await breathForStreak(hit, live);
      if (live()) onDone();
    } else {
      tried.current = true;
      onMiss();
      const my = ++missTok.current;
      // one gentle reply. The ninja has a think (by itself when a streak was going; here when there wasn't one).
      const e = streak.miss({ line: false });
      if (e.prevN === 0) void ninja.act("think");
      setWrong(o.img);
      setMissed((m) => (m.includes(o.img) ? m : [...m, o.img]));
      const lost = streakLine(e);
      if (lost) {
        // a streak was going: the ninja's fizzle and "Keep going, ninja!" are the reply, no buzzer. Then the question
        // again, while the pictures not tried yet wiggle: have another go.
        await say({ line: lost });
        await sleep(250);
      } else {
        sfx.wrong();
        await say({ line: "not_quite" });
      }
      if (!live() || my !== missTok.current) return;
      setWrong((w) => (w === o.img ? null : w));
      if (done.current) return;
      nudge();
      if (lost) void hear();
    }
  };
  return (
    <>
      <div className="st-dim" />
      <div className="panel st-question pop-in">{page.text}</div>
      <div ref={cardsRef} className={`st-cards ${right ? "solved" : ""}`}>
        {page.options.map((o, i) => (
          <button
            key={o.img}
            aria-label={o.label}
            className={`card drop-in ${wrong === o.img ? "wrong" : ""} ${missed.includes(o.img) ? "tried" : ""} ${right && o.correct ? "right" : ""}`}
            style={{ order: order[i], animationDelay: `${order[i] * 0.12}s, 0s` }}
            {...tapProps<HTMLButtonElement>((el) => void tap(o, el))}
          >
            <img src={img(o.img)} alt={o.label} />
          </button>
        ))}
      </div>
    </>
  );
}
