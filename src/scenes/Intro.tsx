// The finale: every petal is home and the World Flower blooms again. Plays the finale video when available, over
// the painted bloom scene. (The opening story is IntroFilm.tsx.)
import { useEffect, useState } from "react";
import { say, sfx, playMusic, hush, onCaption } from "../engine/audio";
import { useSave } from "../engine/store";
import { img, RoundButton, Icon, fx, sleep, useHelp, useBaronOnScreen } from "../ui/ui";
import "../styles/shell.css";
import { PetalDrift } from "../App";
import { NinjaSpot, ninja } from "../ui/Ninja";

export function Intro({ onDone }: { onDone: () => void; finale?: boolean }) {
  const [slide, setSlide] = useState(0);
  const [video, setVideo] = useState<string | null>(null);
  const [pointNext, setPointNext] = useState(false);
  useHelp(() => setPointNext(true));
  useBaronOnScreen();

  useEffect(() => {
    let live = true;
    playMusic("finale");
    (async () => {
      const src = "/a/v/finale.mp4";
      const ok = await fetch(src, { method: "HEAD" }).then((r) => r.ok && (r.headers.get("content-type") ?? "").includes("video")).catch(() => false);
      if (ok && live) setVideo(src);
      await sleep(400);
      fx.rain("petals", 90);
      sfx.fanfare();
      // the child's ninja: the biggest celebration of all as the World Flower blooms
      const party = (async () => {
        await sleep(700);
        if (live) await ninja.act("power");
        if (live) await ninja.celebrate();
      })();
      await say({ line: "finale" });
      await party;
      if (!live) return;
      setSlide(1);
      await say({ line: "baron_final" }); // the ninja takes a stance while Baron Muddle speaks
      fx.rain("confetti", 90);
      if (live) void ninja.act("cheer");
      await sleep(1200);
      if (live) onDone();
    })();
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="scene" style={{ background: "#1d1230" }}>
      <img className="bg-img" src={img("story_s6_bloom")} alt="" style={{ filter: "none", animation: "kenburns 20s ease-out forwards" }} />
      {video && <video src={video} autoPlay muted playsInline className="fade-in" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      <style>{`@keyframes kenburns{from{transform:scale(1.02)}to{transform:scale(1.12) translate(-2%,-1%)}}`}</style>
      {!video && <PetalDrift n={10} />}
      {/* Baron stands mid-stage: the ninja is bottom-left, Sensei's Help button and his bubble bottom-right */}
      {slide >= 1 && <img className="sprite pop-in" src={img("baron_defeated")} alt="" style={{ left: 450, bottom: 20, width: 330 }} />}
      <NinjaSpot size={270} x={34} />
      <div style={{ position: "absolute", right: 24, top: 24 }}>
        <RoundButton sm label="Next" className={pointNext ? "pulse" : ""} onClick={() => hush()}><Icon.next /></RoundButton>
      </div>
      <FinaleCaption />
    </div>
  );
}

/** Captions for the finale. Sensei's lines use his usual bubble above the Help button; Baron Muddle's sit beside
 *  Baron, purple, with the tail pointing at him, so it's clear who is talking. */
function FinaleCaption() {
  const [cap, setCap] = useState<{ text: string; who: string } | null>(null);
  const captions = useSave((s) => s.settings.captions);
  useEffect(() => onCaption(setCap), []);
  if (!cap || !captions) return null;
  const baron = cap.who === "baron";
  return <div className={`bubble ${baron ? "baron finale-baron" : ""}`} key={cap.text}>{cap.text}</div>;
}
