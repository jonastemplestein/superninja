// Opening cutscene (and finale). Uses a Veo cutscene video when available, with painted slides as the fallback.
import { useEffect, useRef, useState } from "react";
import { say, sfx, playMusic, hush } from "../engine/audio";
import { img, RoundButton, Icon, fx, sleep, SenseiDock, useHelp, useBaronOnScreen } from "../ui/ui";
import { PetalDrift } from "../App";

export function Intro({ onDone, finale }: { onDone: () => void; finale?: boolean }) {
  const [slide, setSlide] = useState(0);
  const [video, setVideo] = useState<string | null>(null);
  const skip = useRef(false);
  const [pointNext, setPointNext] = useState(false);
  useHelp(() => setPointNext(true));
  useBaronOnScreen();

  useEffect(() => {
    let live = true;
    playMusic(finale ? "finale" : "title");
    (async () => {
      const src = finale ? "/a/v/finale.mp4" : "/a/v/intro.mp4";
      const ok = await fetch(src, { method: "HEAD" }).then((r) => r.ok && (r.headers.get("content-type") ?? "").includes("video")).catch(() => false);
      if (ok && live) setVideo(src);
      if (finale) {
        setSlide(0);
        await sleep(400);
        fx.rain("petals", 90);
        sfx.fanfare();
        await say({ line: "finale" });
        if (!live) return;
        setSlide(1);
        await say({ line: "baron_final" });
        fx.rain("confetti", 90);
        await sleep(1200);
        if (live) onDone();
        return;
      }
      setSlide(0);
      await say({ line: "intro_1" });
      if (!live || skip.current) return;
      setSlide(1);
      sfx.whoosh();
      await sleep(300);
      await say({ line: "intro_2" });
      if (!live || skip.current) return;
      setSlide(2);
      sfx.whoosh();
      for (let i = 0; i < 4; i++) setTimeout(() => fx.burst(700 + i * 80, 260, "petals", 18, 1.6), i * 180);
      await say({ line: "intro_3" });
      if (live && !skip.current) onDone();
    })();
    return () => {
      live = false;
    };
  }, []);

  const showVideo = video && (finale || slide >= 1);
  return (
    <div className="scene" style={{ background: "#1d1230" }}>
      {finale ? (
        <img className="bg-img" src={img("story_s6_bloom")} alt="" style={{ filter: "none", animation: "kenburns 20s ease-out forwards" }} />
      ) : (
        <img className="bg-img" src={img("title_bg")} alt="" style={{ filter: "none", animation: "kenburns 30s ease-out forwards" }} />
      )}
      {showVideo && (
        <video src={video!} autoPlay muted playsInline className="fade-in" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      <style>{`@keyframes kenburns{from{transform:scale(1.02)}to{transform:scale(1.12) translate(-2%,-1%)}}@keyframes baronin{from{transform:translate(500px,0) rotate(10deg)}to{transform:translate(0,0)}}`}</style>
      {!showVideo && <PetalDrift n={slide >= 2 ? 30 : 10} />}
      {!finale && !video && slide >= 1 && (
        <img className="sprite" src={img(slide >= 2 ? "baron_angry" : "baron_idle")} alt="" style={{ right: 60, bottom: 20, width: 420, animation: "baronin .8s cubic-bezier(.3,1.4,.6,1)" }} />
      )}
      {finale && slide >= 1 && <img className="sprite pop-in" src={img("baron_defeated")} alt="" style={{ right: 80, bottom: 20, width: 360 }} />}
      <div style={{ position: "absolute", right: 24, top: 24 }}>
        <RoundButton sm label="Next" className={pointNext ? "pulse" : ""} onClick={() => hush()}><Icon.next /></RoundButton>
      </div>
      <SenseiDock />
    </div>
  );
}
