// The opening film: eight Gemini Omni shots about the World Flower (see docs/INTRO_STORYBOARD.md), each with its
// narration line (film_1 … film_8 in src/content/lines.ts).
// The shots come in two chapters, each a held step (docs/NAVIGATION.md): the World Flower and Baron Muddle (shots 1–4,
// ending on his laugh), then the petals blown away and the call for a Super Ninja (shots 5–8). A chapter's shots play
// back to back, each clip from the start with its line (a shot hands over to the next once its line has finished and
// its clip has only its last, still third of a second left; a breath between lines); the chapter's last frame holds, and
// the big green Next arrow (dim until the chapter has finished) takes the child on. Nothing moves on by itself. (Eight holds, one per shot, made the film
// about 54 s for a child who taps Next at once, against FIRST_MINUTES' 45 s: two story-shaped chapters are about 45 s.)
// Back plays the chapter before from its start; Hear it again plays this chapter again, clips and lines in sync; Home
// goes to the title. Per-shot line delays come from public/a/v/intro_timing.json (written by
// scripts/intro-v2-encode.sh), so the narration lands on each shot's key action. "Skip film" stays for grown-ups setting
// up a second child: press and hold.
// The first held step explains the green arrow, once per save (TEACHER_SCRIPT §3.1, §2.5: "When you're ready to see
// what happens next, tap the green arrow."): ▶ pops in as the chapter's last clip ends, and 1 s after its last line
// (Baron's "Mwa-ha-ha-ha!") Sensei names it, the pointing hand on it.
// `?shot=N` (1–8) starts at shot N, in its chapter (the grown-ups' cheat menu, docs/CHEATS.md).
import { useEffect, useRef, useState } from "react";
import { say, playMusic, hush } from "../engine/audio";
import { useBaronOnScreen, sleep, TapHint } from "../ui/ui";
import { usePresentation, NAV_SLOTS, type Step } from "../ui/nav";
import { FAST } from "../engine/fast";
import { heard, onceInSave } from "./narrate";

const SHOTS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ video: `/a/v/intro_${n}.mp4`, line: `film_${n}` }));
type Timing = { shot: number; lineDelayMs: number; minMs: number }[];
let timing: Timing | null = null;
const timingReady = fetch("/a/v/intro_timing.json")
  .then((r) => r.json())
  .then((t: Timing) => void (timing = t))
  .catch(() => {});
/** A shot whose video stalls goes on after this long (game ms); a chapter never moves on by itself. */
const STALL_MS = 16_000;
/** The film's chapters (shot indexes), each a held step: the World Flower and Baron Muddle, then the lost petals and the
 *  call for a Super Ninja. Four shots each: about 25 s and 17 s. */
const CHAPTERS = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
];
const chapterOf = (k: number) => CHAPTERS.findIndex((c) => c.includes(k));
/** A shot whose line has finished is over this long (s) before its clip ends: every clip ends on a still, settled pose. */
const TAIL = 0.35;
/** The least gap (game ms) between one shot's line and the next one's. */
const BREATH_MS = 350;
/** Resolves once clip `v` has at most TAIL s left (checked on a timer, not every frame), or at once if it has ended or
 *  isn't playing (it couldn't start: low power mode). Game time: timers and clips both run at ?fast=N. */
const nearEnd = (v: HTMLVideoElement | null, live: () => boolean) =>
  new Promise<void>((resolve) => {
    const check = () => {
      if (!live() || !v || v.ended || v.paused || !(v.duration > 0)) return resolve();
      const left = v.duration - v.currentTime - TAIL;
      if (left <= 0.02) resolve();
      else window.setTimeout(check, left * 1000);
    };
    check();
  });
/** The green arrow's one explanation in a save (TEACHER_SCRIPT §2.5, `sym:<name>` in the narrative ledger). */
const ARROW_KEY = "sym:arrow";
/** `?shot=N` (1–8): the shot to start at (index), else the first. */
const startShot = () => {
  const n = Number(new URLSearchParams(location.search).get("shot"));
  return Number.isInteger(n) && n >= 1 && n <= SHOTS.length ? n - 1 : 0;
};
/** The pointing hand's fingertip on ▶ (as NextArrow's own idle hand sits), above the nav row (84), under Home (88). */
const HAND = { left: NAV_SLOTS.row.next.x - 53, top: NAV_SLOTS.row.next.y - 20, zIndex: 86 };

export function IntroFilm({ onDone }: { onDone: () => void }) {
  const [heardFilm] = useState(() => new Set<string>());
  const [first] = useState(startShot);
  // `?shot=N`: the first play of its chapter starts at shot N (a replay plays the whole chapter)
  const from = useRef<number | null>(first);
  // the shot on screen (the dots along the top)
  const [shot, setShot] = useState(first);
  // the breath after the line before (in a chapter)
  const breath = useRef<Promise<unknown>>(Promise.resolve());
  const videoRef = useRef<HTMLVideoElement>(null);
  // the green arrow: explained at the first held step the child sees (once per save)
  const arrowDue = useRef(onceInSave(ARROW_KEY));
  const [hand, setHand] = useState(false);
  useBaronOnScreen();

  useEffect(() => {
    playMusic("title");
    // (bots at ?fast=N: a new clip keeps the fast rate, instead of starting at 1× until engine/fast.ts next sets it)
    if (videoRef.current) videoRef.current.defaultPlaybackRate = FAST;
    // warm up the next shots
    const links = SHOTS.map((s) => {
      const l = document.createElement("link");
      l.rel = "preload";
      l.as = "video";
      l.href = s.video;
      document.head.appendChild(l);
      return l;
    });
    return () => links.forEach((l) => l.remove());
  }, []);

  /** Play shot k from its start: the clip, and its line on the clip's own clock (so lip-synced shots, Baron's lines, stay
   *  in sync even when the video starts late), at least BREATH_MS after the line before. Resolves once the line has
   *  finished and the clip has at most its still last TAIL s left (it plays on to its last frame, which holds), or the
   *  line alone if the video can't play (low power mode). `onLine` runs as the line ends. */
  const playShot = async (k: number, live: () => boolean, onLine?: () => void) => {
    const shot = SHOTS[k];
    const v = videoRef.current;
    setShot(k);
    let playing: Promise<boolean> = Promise.resolve(false);
    if (v) {
      if (!v.getAttribute("src")?.endsWith(shot.video)) v.setAttribute("src", shot.video);
      try {
        v.currentTime = 0;
      } catch {}
      v.animate?.([{ opacity: 0.25 }, { opacity: 1 }], { duration: 450, easing: "ease-out" });
      playing = v.play().then(
        () => true,
        () => false,
      );
    }
    const ended = new Promise<void>((resolve) => {
      if (!v) return resolve();
      const on = () => {
        v.removeEventListener("ended", on);
        resolve();
      };
      v.addEventListener("ended", on);
      void playing.then((ok) => !ok && on());
    });
    await Promise.race([timingReady, sleep(300)]);
    const delay = (timing?.find((t) => t.shot === k + 1)?.lineDelayMs ?? 400) / 1000;
    if (v && (await Promise.race([playing, sleep(1500).then(() => false)]))) {
      await new Promise<void>((r) => {
        const tick = () => (!live() || v.currentTime >= delay || v.ended ? r() : requestAnimationFrame(tick));
        tick();
      });
    } else await sleep(delay * 1000);
    await breath.current;
    if (!live()) return;
    const said = await say({ line: shot.line });
    // Baron Muddle's motive (film_3 "Words... how I HATE them!", film_4 "Every sound on this island is MINE!"), heard in
    // full: the first battle then needn't explain him again (NARRATIVE_AUDIT F18; a skipped film doesn't count)
    if (said) heardFilm.add(shot.line);
    if (said && heardFilm.has("film_3") && heardFilm.has("film_4")) heard("baron-motive");
    if (!live()) return;
    breath.current = sleep(BREATH_MS);
    onLine?.();
    await Promise.race([nearEnd(v, live), ended, sleep(STALL_MS)]);
  };
  /** "When you're ready to see what happens next, tap the green arrow." as ▶ pops in, the hand on it. */
  const explainArrow = async (live: () => boolean) => {
    arrowDue.current = false;
    setHand(true);
    const said = await say({ line: "tv_film_arrow" });
    // (cut off by a tap on ▶: the child has found it; the ledger still waits for a whole telling in a later film)
    if (said) heard(ARROW_KEY);
    if (live()) await sleep(900);
    if (live()) setHand(false);
  };
  const steps: Step[] = CHAPTERS.map((shots, c) => ({
    key: `film_${shots[0] + 1}-${shots[shots.length - 1] + 1}`,
    enter: () => {
      setHand(false);
      breath.current = Promise.resolve();
    },
    run: async (live) => {
      const start = from.current !== null && chapterOf(from.current) === c ? from.current : shots[0];
      from.current = null;
      // the chapter's shots, back to back: each starts once the one before has finished (its line, and its clip but for
      // the still last TAIL s)
      let arrowAt: Promise<unknown> = Promise.resolve();
      for (const k of shots.filter((k) => k >= start)) {
        await playShot(k, live, () => (arrowAt = sleep(1000)));
        if (!live()) return;
      }
      // the chapter has finished (its last clip plays on to its last frame, which holds) and ▶ pops in; 1 s after the
      // chapter's last line Sensei names it, the hand on it (not awaited, so ▶ is live; a child who has already tapped it
      // has found it)
      if (arrowDue.current)
        void arrowAt.then(() => {
          if (live() && arrowDue.current) void explainArrow(live);
        });
    },
  }));
  usePresentation(steps, {
    id: "film",
    onDone,
    start: Math.max(0, chapterOf(first)),
    guardMs: STALL_MS * 4 + 20_000,
    state: (i, ready) => ({ scene: "film", game: null, chapter: i, shot, canNext: ready, busy: !ready }),
  });

  return (
    <div className="scene film" style={{ background: "#1d1230" }}>
      {/* During the film, Sensei's help button steps back: no talking face, glow or waves over the picture (she is in the
          film itself, and a second talking Sensei on top of it read as an overlay), just a small, faded, still button. */}
      <style>{`.help-btn{scale:.7;transform-origin:100% 100%;opacity:.6;transition:opacity .2s}.help-btn:active,.help-btn:hover{opacity:1}.help-btn,.help-btn.talking{animation:none;box-shadow:0 5px 0 var(--ink)}.help-btn .help-waves{display:none}.help-btn .help-face{content:url(/a/i/sensei_face_idle.webp)}`}</style>
      {/* one video element for the whole film: each shot sets its clip and plays it from 0; an ended clip holds its last frame */}
      <video ref={videoRef} muted playsInline preload="auto" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* grown-ups setting up a second child have seen it: press and hold to skip the whole film (a stray tap from a
          3-year-old must not lose the story) */}
      <SkipFilm onSkip={() => (hush(), onDone())} />
      <TapHint show={hand} style={HAND} />
      {/* where we are in the film: a dot per shot, along the top (the nav row owns the bottom) */}
      <div className="film-dots" aria-hidden="true">
        {SHOTS.map((_, i) => (
          <span key={i} className={i < shot ? "seen" : i === shot ? "now" : ""} />
        ))}
      </div>
    </div>
  );
}

/** "Skip film", for grown-ups: press and hold for two seconds (the bar fills); a short tap only shows how. A second was
 *  a toddler's ordinary press (docs/CONFIRM.md §1). */
function SkipFilm({ onSkip }: { onSkip: () => void }) {
  const HOLD_MS = 2000;
  const [p, setP] = useState(0);
  const [hint, setHint] = useState(false);
  const raf = useRef(0);
  const prog = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(() => setHint(false), 2600);
    return () => clearTimeout(t);
  }, [hint]);
  const pressing = useRef(false);
  const start = () => {
    pressing.current = true;
    const t0 = performance.now();
    const tick = () => {
      prog.current = (performance.now() - t0) / HOLD_MS;
      setP(prog.current);
      if (prog.current >= 1) {
        prog.current = 0;
        pressing.current = false;
        setP(0);
        onSkip();
      } else raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(raf.current);
    if (pressing.current && prog.current < 1) setHint(true); // a tap, or let go too soon: show how
    pressing.current = false;
    prog.current = 0;
    setP(0);
  };
  return (
    <div style={{ position: "absolute", right: 24, top: 24 }} data-grownups>
      <button
        className="skip-film"
        aria-label="Skip film"
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        style={{ backgroundImage: p > 0 ? `linear-gradient(90deg, rgba(88,204,120,.85) ${p * 100}%, transparent 0)` : undefined }}
      >
        Skip film
      </button>
      {hint && <div className="hold-hint pop-in">Grown-ups: press and hold</div>}
    </div>
  );
}
