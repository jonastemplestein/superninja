// The finale: every petal is home and the World Flower blooms again. Plays the finale video when available, over
// the painted bloom scene. (The opening story is IntroFilm.tsx.)
// Two held steps (docs/NAVIGATION.md): (1) the bloom, "You did it, Super Ninja!…", the ninja's power-up and its biggest
// celebration; (2) Baron Muddle appears and says sorry, confetti and the cheer. Each holds on the green Next; Back plays
// the first again, Hear it again plays this one again; Next on the second goes to the map. Home goes to the map.
import { useEffect, useState } from "react";
import { say, sfx, playMusic, onCaption } from "../engine/audio";
import { useSave } from "../engine/store";
import { img, fx, sleep, useBaronOnScreen } from "../ui/ui";
import { usePresentation, type Step } from "../ui/nav";
import "../styles/shell.css";
import { PetalDrift } from "../App";
import { NinjaSpot, ninja } from "../ui/Ninja";

export function Intro({ onDone }: { onDone: () => void; finale?: boolean }) {
  const [video, setVideo] = useState<string | null>(null);
  useBaronOnScreen();

  useEffect(() => {
    let live = true;
    playMusic("finale");
    const src = "/a/v/finale.mp4";
    void fetch(src, { method: "HEAD" })
      .then((r) => r.ok && (r.headers.get("content-type") ?? "").includes("video"))
      .catch(() => false)
      .then((ok) => ok && live && setVideo(src));
    return () => void (live = false);
  }, []);

  const steps: Step[] = [
    {
      key: "bloom",
      run: async (live) => {
        await sleep(400);
        if (!live()) return;
        // every sound is home: the rainbow petals of the film come back (Dec6: the teardrop means all the sounds here)
        fx.rain("rainbow", 90);
        sfx.fanfare();
        // the child's ninja: the biggest celebration of all as the World Flower blooms
        const party = (async () => {
          await sleep(700);
          if (live()) await ninja.act("power");
          if (live()) await ninja.celebrate();
        })();
        await Promise.all([say({ line: "finale" }), party]);
      },
    },
    {
      key: "baron",
      run: async (live) => {
        await say({ line: "baron_final" }); // the ninja takes a stance while Baron Muddle speaks
        if (!live()) return;
        fx.rain("confetti", 90);
        await ninja.act("cheer");
      },
    },
  ];
  const { i } = usePresentation(steps, { id: "finale", onDone, state: (k, ready) => ({ scene: "finale", game: null, slide: k, busy: !ready }) });

  return (
    <div className="scene" style={{ background: "#1d1230" }}>
      <img className="bg-img" src={img("story_s6_bloom")} alt="" style={{ filter: "none", animation: "kenburns 20s ease-out forwards" }} />
      {video && <video src={video} autoPlay muted playsInline className="fade-in" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      <style>{`@keyframes kenburns{from{transform:scale(1.02)}to{transform:scale(1.12) translate(-2%,-1%)}}`}</style>
      {!video && <PetalDrift n={10} />}
      {/* Baron stands mid-stage, above the nav row: the ninja is bottom-left, Sensei's Help button and his bubble
          bottom-right */}
      {i >= 1 && <img className="sprite pop-in" src={img("baron_defeated")} alt="" style={{ left: 470, bottom: 160, width: 290 }} />}
      <NinjaSpot size={270} x={34} />
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
