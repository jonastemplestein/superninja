// The Word Book: a scrapbook of every word the child has read or spelt correctly, as picture stickers.
// Stickers still to find show as silhouettes. Tap a sticker to hear the word sounded out.
import { useEffect, useMemo, useState } from "react";
import { WORDS, type Word } from "../content/phonics";
import { LEVELS, WORLDS } from "../content/worlds";
import { say, sayBlend, sfx, playMusic } from "../engine/audio";
import { useSave, store } from "../engine/store";
import { BookIntro } from "./Intros";
import { img, RoundButton, Icon, useHelp, tapProps, fx, stageXY } from "../ui/ui";

const PER_PAGE = 6;

const worldOfUnit = (u: number) => WORLDS[(LEVELS.find((l) => l.units.includes(u))?.world ?? 1) - 1];

export function Book({ onBack }: { onBack: () => void }) {
  const words = useSave((s) => s.words);
  const got = (w: Word) => (words[w.text]?.ok ?? 0) > 0;
  const ordered = useMemo(() => [...WORDS].sort((a, b) => a.unit - b.unit || Number(!!b.pic) - Number(!!a.pic)), []);
  const spreads = useMemo(() => {
    const out: Word[][] = [];
    for (let i = 0; i < ordered.length; i += PER_PAGE * 2) out.push(ordered.slice(i, i + PER_PAGE * 2));
    return out;
  }, [ordered]);
  const total = ordered.filter(got).length;
  // open at the last spread that has a sticker
  const [spread, setSpread] = useState(() => Math.max(0, spreads.findLastIndex((sp) => sp.some(got))));
  const [flip, setFlip] = useState<0 | 1 | -1>(0);
  const [intro, setIntro] = useState(() => !store.get().seenBook);

  useEffect(() => {
    playMusic("story");

  }, []);
  useHelp(() => say({ line: "help_book" }));

  const turn = (d: 1 | -1) => {
    const n = spread + d;
    if (n < 0 || n >= spreads.length) return;
    sfx.page();
    setFlip(d);
    setTimeout(() => {
      setSpread(n);
      setFlip(0);
    }, 260);
  };

  const page = spreads[spread] ?? [];
  const left = page.slice(0, PER_PAGE);
  const right = page.slice(PER_PAGE);
  const land = worldOfUnit(page[0]?.unit ?? 1);

  const Sticker = ({ w, i }: { w: Word; i: number }) => {
    const have = got(w);
    const rot = ((w.text.charCodeAt(0) * 7 + i * 13) % 11) - 5;
    return (
      <div
        role="button"
        aria-label={`sticker ${w.text}`}
        {...tapProps((el) => {
          if (have) {
            sfx.pop();
            const xy = stageXY(el);
            fx.burst(xy.x, xy.y, "stars", 8);
            sayBlend(w.segs, w.text);
          } else say({ line: "book_missing" });
        })}
        style={{ position: "relative", width: 150, height: 170, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `rotate(${rot}deg)`, cursor: "pointer" }}
      >
        {have && <span className="tape" />}
        <div
          style={{
            width: 132, height: 132, borderRadius: 18, display: "grid", placeItems: "center",
            background: have ? "#fff" : "transparent", border: have ? "4px solid #2b1d14" : "4px dashed rgba(43,29,20,.3)",
            boxShadow: have ? "0 6px 0 rgba(43,29,20,.25)" : undefined,
          }}
        >
          {w.pic ? (
            <img src={img(`pic_${w.text}`)} alt="" style={{ width: 112, height: 112, objectFit: "contain", filter: have ? "none" : "brightness(0) opacity(.12)" }} />
          ) : (
            <span style={{ fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: w.text.length > 5 ? 34 : 44, color: have ? "var(--ink)" : "rgba(43,29,20,.15)" }}>{have ? w.text : "?"}</span>
          )}
        </div>
        {w.pic && (
          <span style={{ marginTop: 4, fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: 26, color: have ? "var(--ink)" : "transparent", lineHeight: 1 }}>{w.text}</span>
        )}
      </div>
    );
  };

  return (
    <div className="scene" style={{ background: "radial-gradient(ellipse at 50% 40%, #6b3f2a, #2b1a12)" }}>
      {/* the book */}
      <div style={{ position: "absolute", left: 150, right: 110, top: 74, bottom: 30, borderRadius: 26, background: "#7a2e2a", border: "6px solid #2b1d14", boxShadow: "0 14px 0 #2b1d14, 0 30px 60px rgba(0,0,0,.5)" }}>
        <div
          style={{
            position: "absolute", inset: 14, borderRadius: 16, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden",
            background: "linear-gradient(90deg, #f7ead0 0%, #fff6e2 46%, #d9c49c 50%, #fff6e2 54%, #f7ead0 100%)",
            transition: "transform .26s ease-in, opacity .26s", transform: flip ? `perspective(1400px) rotateY(${flip * -8}deg) scale(.97)` : undefined, opacity: flip ? 0.4 : 1,
          }}
        >
          {[left, right].map((ws, side) => (
            <div key={side} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", alignContent: "center", justifyItems: "center", gap: 2, padding: "12px 10px" }}>
              {ws.map((w, i) => (
                <Sticker key={w.text} w={w} i={i + side * PER_PAGE} />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* land ribbon + counter */}
      <div style={{ position: "absolute", top: 22, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16, alignItems: "center" }}>
        <div className="panel" style={{ padding: "4px 30px", background: land.colour }}>
          <span className="display" style={{ fontSize: 40 }}>{land.name}</span>
        </div>
        <div className="panel" style={{ padding: "4px 20px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 34 }}>{total}</span>
          <span style={{ fontWeight: 800, fontSize: 18 }}>/ {WORDS.length} words</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 40, top: "42%", translate: "0 -50%" }}>
        <RoundButton label="previous page" onClick={() => turn(-1)} style={{ visibility: spread > 0 ? "visible" : "hidden" }}><Icon.back /></RoundButton>
      </div>
      <div style={{ position: "absolute", right: 12, top: "50%", translate: "0 -50%" }}>
        <RoundButton label="next page" onClick={() => turn(1)} style={{ visibility: spread < spreads.length - 1 ? "visible" : "hidden" }}><Icon.next /></RoundButton>
      </div>
      <div className="topbar">
        <RoundButton sm label="back" onClick={onBack}><Icon.home /></RoundButton>
      </div>
      {intro && <BookIntro onDone={() => { store.set((s) => void (s.seenBook = true)); setIntro(false); }} />}
    </div>
  );
}
