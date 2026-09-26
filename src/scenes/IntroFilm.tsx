// The opening film: eight Gemini Omni shots about the World Flower (see docs/INTRO_STORYBOARD.md), each with its
// narration line (film_1 … film_8 in src/content/lines.ts).
// Each shot is a held step (docs/NAVIGATION.md): its clip plays from the start with its line, the last frame holds, and
// the big green Next arrow (dim until both have finished) takes the child to the next shot. Nothing moves on by itself.
// Back plays the shot before from its start; Hear it again plays this shot again, clip and line in sync; Home goes to
// the title. Per-shot line delays come from public/a/v/intro_timing.json (written by scripts/intro-v2-encode.sh), so the
// narration lands on each shot's key action. "Skip film" stays for grown-ups setting up a second child: press and hold.
import { useEffect, useRef, useState } from "react";
import { say, playMusic, hush } from "../engine/audio";
import { useBaronOnScreen, sleep } from "../ui/ui";
import { usePresentation, type Step } from "../ui/nav";
import { heard } from "./narrate";

const SHOTS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ video: `/a/v/intro_${n}.mp4`, line: `film_${n}` }));
type Timing = { shot: number; lineDelayMs: number; minMs: number }[];
let timing: Timing | null = null;
const timingReady = fetch("/a/v/intro_timing.json")
  .then((r) => r.json())
  .then((t: Timing) => void (timing = t))
  .catch(() => {});
/** A shot whose video stalls gets its Next anyway after this long (game ms); it never moves on by itself. */
const STALL_MS = 16_000;

export function IntroFilm({ onDone }: { onDone: () => void }) {
  const [heardFilm] = useState(() => new Set<string>());
  const videoRef = useRef<HTMLVideoElement>(null);
  useBaronOnScreen();

  useEffect(() => {
    playMusic("title");
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
   *  in sync even when the video starts late). Resolves once both have finished (the last frame holds), or the line
   *  alone if the video can't play (low power mode). */
  const playShot = async (k: number, live: () => boolean) => {
    const shot = SHOTS[k];
    const v = videoRef.current;
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
    if (!live()) return;
    const said = await say({ line: shot.line });
    // Baron Muddle's motive (film_3 "Words... how I HATE them!", film_4 "Every sound on this island is MINE!"), heard in
    // full: the first battle then needn't explain him again (NARRATIVE_AUDIT F18; a skipped film doesn't count)
    if (said) heardFilm.add(shot.line);
    if (said && heardFilm.has("film_3") && heardFilm.has("film_4")) heard("baron-motive");
    if (!live()) return;
    await Promise.race([ended, sleep(STALL_MS)]);
  };
  const steps: Step[] = SHOTS.map((s, k) => ({ key: s.line, run: (live) => playShot(k, live) }));
  const { i: shot } = usePresentation(steps, { id: "film", onDone, guardMs: STALL_MS + 20_000, state: (i, ready) => ({ scene: "film", shot: i, canNext: ready }) });

  return (
    <div className="scene film" style={{ background: "#1d1230" }}>
      {/* During the film, Sensei's help button steps back: no talking face, glow or waves over the picture (she is in the
          film itself, and a second talking Sensei on top of it read as an overlay), just a small, faded, still button. */}
      <style>{`.help-btn{scale:.7;transform-origin:100% 100%;opacity:.6;transition:opacity .2s}.help-btn:active,.help-btn:hover{opacity:1}.help-btn,.help-btn.talking{animation:none;box-shadow:0 5px 0 var(--ink)}.help-btn .help-waves{display:none}.help-btn .help-face{content:url(/a/i/sensei_face_idle.webp)}`}</style>
      {/* one video element for the whole film: each step sets its clip and plays it from 0; an ended clip holds its last frame */}
      <video ref={videoRef} muted playsInline preload="auto" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* grown-ups setting up a second child have seen it: press and hold to skip the whole film (a stray tap from a
          3-year-old must not lose the story) */}
      <SkipFilm onSkip={() => (hush(), onDone())} />
      {/* where we are in the film: a dot per shot, along the top (the nav row owns the bottom) */}
      <div className="film-dots" aria-hidden="true">
        {SHOTS.map((_, i) => (
          <span key={i} className={i < shot ? "seen" : i === shot ? "now" : ""} />
        ))}
      </div>
    </div>
  );
}

/** "Skip film", for grown-ups: press and hold for a second (the ring fills); a short tap only shows how. */
function SkipFilm({ onSkip }: { onSkip: () => void }) {
  const HOLD_MS = 1000;
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
