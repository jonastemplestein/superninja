// The opening film: eight Gemini Omni shots about the World Flower (see docs/INTRO_STORYBOARD.md), each with its
// narration line (film_1 … film_8 in src/content/lines.ts).
// A shot moves on only when both its video and its line have finished (the last frame holds meanwhile).
// Per-shot line delays come from public/a/v/intro_timing.json (written by scripts/intro-v2-encode.sh), so the
// narration lands on each shot's key action.
// The arrow skips to the next shot; the whole film can be skipped from the last shot onwards.
import { useEffect, useRef, useState } from "react";
import { say, playMusic, hush } from "../engine/audio";
import { RoundButton, Icon, useHelp, useBaronOnScreen, tapProps } from "../ui/ui";
import { heard } from "./narrate";

const SHOTS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ video: `/a/v/intro_${n}.mp4`, line: `film_${n}` }));
type Timing = { shot: number; lineDelayMs: number; minMs: number }[];
let timing: Timing | null = null;
const timingReady = fetch("/a/v/intro_timing.json")
  .then((r) => r.json())
  .then((t: Timing) => void (timing = t))
  .catch(() => {});

export function IntroFilm({ onDone }: { onDone: () => void }) {
  const [heardFilm] = useState(() => new Set<string>());
  const [shot, setShot] = useState(0);
  const [pointNext, setPointNext] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const advance = useRef<() => void>(() => {});
  useHelp(() => setPointNext(true));
  useBaronOnScreen();

  useEffect(() => {
    playMusic("title");
    // warm up the next shots
    SHOTS.forEach((s) => {
      const l = document.createElement("link");
      l.rel = "preload";
      l.as = "video";
      l.href = s.video;
      document.head.appendChild(l);
    });
  }, []);

  useEffect(() => {
    let live = true;
    let videoDone = false;
    let lineDone = false;
    const next = () => {
      if (!live) return;
      live = false;
      hush();
      if (shot + 1 >= SHOTS.length) onDone();
      else setShot(shot + 1);
    };
    advance.current = next;
    const check = () => videoDone && lineDone && next();
    const v = videoRef.current;
    const onEnd = () => {
      videoDone = true;
      check();
    };
    v?.addEventListener("ended", onEnd);
    let playing: Promise<boolean> = Promise.resolve(false);
    if (v)
      playing = v.play().then(
        () => true,
        () => {
          videoDone = true; // if video can't play (low power mode), don't block on it
          return false;
        },
      );
    // safety: never hang on a shot
    const guard = setTimeout(next, 16000);
    (async () => {
      await Promise.race([timingReady, new Promise((r) => setTimeout(r, 300))]);
      const delay = (timing?.find((t) => t.shot === shot + 1)?.lineDelayMs ?? 400) / 1000;
      // the line starts on the video's own clock, so lip-synced shots (Baron's lines) stay in sync even when the
      // video starts late; if the video can't play, fall back to a plain timer
      if (v && (await Promise.race([playing, new Promise<boolean>((r) => setTimeout(() => r(false), 1500))]))) {
        await new Promise<void>((r) => {
          const tick = () => (!live || v.currentTime >= delay || v.ended ? r() : requestAnimationFrame(tick));
          tick();
        });
      } else await new Promise((r) => setTimeout(r, delay * 1000));
      if (!live) return;
      const said = await say({ line: SHOTS[shot].line });
      // Baron Muddle's motive (film_3 "Words... how I HATE them!", film_4 "Every sound on this island is MINE!"), heard in
      // full: the first battle then needn't explain him again (NARRATIVE_AUDIT F18; a skipped film doesn't count)
      if (said) heardFilm.add(SHOTS[shot].line);
      if (said && heardFilm.has("film_3") && heardFilm.has("film_4")) heard("baron-motive");
      lineDone = true;
      if (shot === SHOTS.length - 1) await new Promise((r) => setTimeout(r, 600));
      check();
    })();
    return () => {
      live = false;
      clearTimeout(guard);
      v?.removeEventListener("ended", onEnd);
    };
  }, [shot]);

  return (
    <div className="scene" style={{ background: "#1d1230" }}>
      {/* During the film, Sensei's help button steps back: no talking face, glow or waves over the picture (she is in the
          film itself, and a second talking Sensei on top of it read as an overlay), just a small, faded, still button. */}
      <style>{`.help-btn{scale:.7;transform-origin:100% 100%;opacity:.6;transition:opacity .2s}.help-btn:active,.help-btn:hover{opacity:1}.help-btn,.help-btn.talking{animation:none;box-shadow:0 5px 0 var(--ink)}.help-btn .help-waves{display:none}.help-btn .help-face{content:url(/a/i/sensei_face_idle.webp)}`}</style>
      <video key={shot} ref={videoRef} src={SHOTS[shot].video} muted playsInline preload="auto" className="fade-in" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", right: 24, top: 24, display: "flex", gap: 14, alignItems: "center" }}>
        {/* grown-ups setting up a second child have seen it: skip the whole film */}
        <button className="skip-film" aria-label="Skip film" {...tapProps(() => { hush(); onDone(); })}>Skip film</button>
        <RoundButton sm label="Next" className={pointNext ? "pulse" : ""} onClick={() => advance.current()}>
          <Icon.next />
        </RoundButton>
      </div>
      <div className="row" style={{ position: "absolute", left: 0, right: 0, bottom: 18, gap: 8, pointerEvents: "none" }}>
        {SHOTS.map((_, i) => (
          <span key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: i <= shot ? "#ffc53d" : "rgba(255,244,220,.35)", border: "2px solid #2b1d14" }} />
        ))}
      </div>
    </div>
  );
}
