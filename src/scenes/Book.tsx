// The Sticker Book (docs/FIRST_MINUTES.md §6): every picture the child has played with, and every word read or spelt,
// as stickers in the order they were collected, six to a page. A picture sticker says its word fast, then slow (the
// pure sounds with gaps: "sun… s · u · n"), with the rabbit hopping on the fast word and the tortoise stepping on each
// slow sound beside the speaker; a word sticker (a gold edge and its spelling) says its sounds, each spelling lighting
// as it plays (a spelling's voice: no petal, SOUND_DISPLAY r65), and reads the word; a shiny one sparkles. After the last
// sticker, three dashed "mystery" outlines show the next pictures on the child's path. No walls of silhouettes, and
// the counter is a big number with a sticker icon. (In code it stays `Book`; the child hears "Sticker Book".)
// Home is the nav layer's (top-left, to the map); Hear it again (top-right) says what Sensei said on arriving.
import { useEffect, useMemo, useRef, useState } from "react";
import { WORD_BY_TEXT } from "../content/phonics";
import { LEVELS, levelWords } from "../content/worlds";
import { WARMUPS } from "../content/warmups";
import { say, sfx, playMusic } from "../engine/audio";
import { useSave, store, type Save } from "../engine/store";
import { frontier } from "../engine/gems";
import { img, RoundButton, Icon, useHelp, fx, stageXY, tapProps } from "../ui/ui";
import { useNav } from "../ui/nav";
import { Sticker, stickerKind, sayStickerWord } from "./Stickers";
import "../styles/stickers.css";

const PER_PAGE = 6;

/** The next pictures on the child's path that aren't stickers yet (for the mystery outlines). */
export function nextStickers(s: Save, n = 3): string[] {
  const have = new Set(s.stickers ?? []);
  const out: string[] = [];
  const from = Math.max(0, LEVELS.indexOf(frontier(s)));
  for (const l of LEVELS.slice(from)) {
    const ws = l.warmup ? WARMUPS[l.warmup]?.stickers ?? [] : (l.words ?? levelWords(l).map((w) => w.text)).filter((w) => WORD_BY_TEXT[w]?.pic);
    for (const w of ws) if (!have.has(w) && !out.includes(w)) out.push(w);
    if (out.length >= n) break;
  }
  return out.slice(0, n);
}

/** The Sticker Book. Home (the nav layer's) goes back to the map: App's Home rule, or `onBack` if given. */
export function Book({ onBack }: { onBack?: () => void }) {
  const stickers = useSave((s) => s.stickers ?? []);
  const save = useSave((s) => s);
  const mystery = useMemo(() => nextStickers(save), [stickers.length]);
  // pages: the stickers in collection order, then the mystery outlines on the page after the last sticker
  const items = useMemo(() => [...stickers.map((w) => ({ w, mystery: false })), ...mystery.map((w) => ({ w, mystery: true }))], [stickers, mystery]);
  const spreads = useMemo(() => {
    const out: (typeof items)[] = [];
    for (let i = 0; i < Math.max(1, items.length); i += PER_PAGE * 2) out.push(items.slice(i, i + PER_PAGE * 2));
    return out;
  }, [items]);
  // open at the spread with the newest sticker
  const [spread, setSpread] = useState(() => Math.max(0, Math.floor(Math.max(0, stickers.length - 1) / (PER_PAGE * 2))));
  const [flip, setFlip] = useState<0 | 1 | -1>(0);
  const flipT = useRef(0);
  useEffect(() => () => clearTimeout(flipT.current), []);

  // what Sensei said on arriving ("This is your Sticker Book!" the first time), else how the book works
  const [firstLook] = useState(() => !store.get().seenBook);
  useEffect(() => {
    playMusic("story");
    if (firstLook) {
      store.set((s) => void (s.seenBook = true));
      void say({ line: "fm_rw_book" });
    }
  }, []);
  useHelp(() => say({ line: "help_book" }));
  // (the tortoise and the rabbit: every picture sticker says its word fast, then slow. They sit above the book, right of
  // the counter and left of the speaker, clear of the pages)
  useNav({ again: () => say(firstLook ? [{ line: "fm_rw_book" }, { gap: 300 }, { line: "help_book" }] : { line: "help_book" }), againAt: "top-right", speed: { at: { x: 1010, y: 44 } }, ...(onBack ? { home: onBack } : {}) });

  const turn = (d: 1 | -1) => {
    const n = spread + d;
    if (n < 0 || n >= spreads.length) return;
    sfx.page();
    setFlip(d);
    clearTimeout(flipT.current);
    flipT.current = window.setTimeout(() => {
      setSpread(n);
      setFlip(0);
    }, 260);
  };

  const page = spreads[spread] ?? [];
  const sides = [page.slice(0, PER_PAGE), page.slice(PER_PAGE)];
  const tapSticker = (w: string, el: HTMLElement) => {
    sfx.pop();
    const xy = stageXY(el);
    fx.burst(xy.x, xy.y, "stars", 8);
    void sayStickerWord(w, stickerKind(w), el, { fs: true });
  };

  // (bots and the sweep: the Sticker Book is a place to browse, not a game, TEACHER_SCRIPT §2.6)
  (window as any).__snState = { scene: "book", game: null, stickers: stickers.length, next: null, busy: false };
  return (
    <div className="scene book-scene" style={{ background: "radial-gradient(ellipse at 50% 40%, #6b3f2a, #2b1a12)" }}>
      {/* the book */}
      <div className="sb-book" style={{ position: "absolute", left: 150, right: 130, top: 84, bottom: 34, borderRadius: 26, background: "#7a2e2a", border: "6px solid #2b1d14", boxShadow: "0 14px 0 #2b1d14, 0 30px 60px rgba(0,0,0,.5)" }}>
        <div
          style={{
            position: "absolute", inset: 14, borderRadius: 16, display: "grid", gridTemplateColumns: "1fr 1fr",
            background: "linear-gradient(90deg, #f7ead0 0%, #fff6e2 46%, #d9c49c 50%, #fff6e2 54%, #f7ead0 100%)",
            transition: "transform .26s ease-in, opacity .26s", transform: flip ? `perspective(1400px) rotateY(${flip * -8}deg) scale(.97)` : undefined, opacity: flip ? 0.4 : 1,
          }}
        >
          {sides.map((ws, side) => (
            <div key={side} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", alignContent: "center", justifyItems: "center", rowGap: 44, padding: "22px 12px" }}>
              {ws.map(({ w, mystery: m }, i) =>
                m ? (
                  <button key={`m-${w}`} aria-label="mystery sticker" className="sb-mystery" {...tapProps(() => void say({ line: "book_missing" }))}>
                    <span>?</span>
                  </button>
                ) : (
                  <Sticker key={w} w={w} kind={stickerKind(w, save)} size={126} onTap={(el) => tapSticker(w, el)} style={{ rotate: `${((w.charCodeAt(0) * 7 + i * 13) % 9) - 4}deg` }} />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      {/* the counter: a big number and a sticker */}
      <div style={{ position: "absolute", top: 14, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16, alignItems: "center", pointerEvents: "none" }}>
        <div className="panel" style={{ padding: "2px 22px", display: "flex", alignItems: "center", gap: 10, background: "radial-gradient(circle at 40% 30%, #fff6c8, #ffc53d 75%)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 52, lineHeight: 1 }}>{stickers.length}</span>
          <img src={img("item_sticker_book")} alt="" style={{ width: 54, height: 54, objectFit: "contain" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 40, top: "46%", translate: "0 -50%" }}>
        <RoundButton label="previous page" onClick={() => turn(-1)} style={{ visibility: spread > 0 ? "visible" : "hidden" }}><Icon.back /></RoundButton>
      </div>
      <div style={{ position: "absolute", right: 14, top: "40%", translate: "0 -50%" }}>
        <RoundButton label="next page" onClick={() => turn(1)} style={{ visibility: spread < spreads.length - 1 ? "visible" : "hidden" }}><Icon.next /></RoundButton>
      </div>
    </div>
  );
}
