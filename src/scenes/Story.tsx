// Story time: Sensei reads the rich pages (with a karaoke highlight); the child reads the decodable pages
// (sound buttons under every spelling, tap any word for help), makes choices by reading words, and answers a question.
import { useEffect, useRef, useState } from "react";
import type { LevelProps } from "../App";
import { STORIES, type Page } from "../content/stories";
import { decode } from "../content/validate";
import { say, sayBlend, sfx, playMusic, preload, urls, hush, load } from "../engine/audio";
import { WORD_BY_TEXT } from "../content/phonics";
import { img, RoundButton, Icon, fx, heroImg, useHero, sleep, SenseiDock, tapProps, useHelp } from "../ui/ui";
import { pickPraise } from "./Dojo";

export function StoryScene({ level, onDone, onQuit }: LevelProps) {
  const story = STORIES.find((s) => s.id === level.story)!;
  const hero = useHero();
  const [pageId, setPageId] = useState<string | null>(null);
  const page = story.pages.find((p) => p.id === pageId);
  const misses = useRef(0);
  const [turn, setTurn] = useState(0);
  const visited = useRef(new Set<string>());

  useEffect(() => {
    playMusic("story");
    preload(story.pages.map((p) => urls.story(story.id, p.id)));
    story.pages.forEach((p) => {
      const i = new Image();
      i.src = img(`story_${story.id}_${p.scene}`);
    });
    (async () => {
      await say([{ line: "story_start" }, { gap: 250 }, { story: story.id, page: "title", caption: story.title }]);
      setPageId(story.pages[0].id);
    })();
    return () => hush();
  }, []);

  const goNext = (p: Page) => {
    sfx.page();
    const i = story.pages.indexOf(p);
    const nextId = "next" in p && p.next ? p.next : story.pages[i + 1]?.id;
    // skip branch-only pages when advancing linearly
    let n = nextId ? story.pages.find((x) => x.id === nextId) : undefined;
    if (!("next" in p && p.next)) while (n && /[a-z]$/.test(n.id) && n.id !== "q") n = story.pages[story.pages.indexOf(n) + 1];
    if (n) {
      setPageId(n.id);
      setTurn((t) => t + 1);
    } else finish();
  };
  const finish = async () => {
    fx.rain("petals", 60);
    await say({ line: "story_end" });
    onDone(misses.current === 0 ? 3 : misses.current <= 2 ? 2 : 1);
  };

  return (
    <div className="scene">
      {page && (
        <img key={page.scene + turn} className="bg-img fade-in" src={img(`story_${story.id}_${page.scene}`)} alt="" style={{ filter: "none", animation: "kenburns 14s ease-out forwards, fadein .6s" }} />
      )}
      {!page && <img className="bg-img" src={img(`story_${story.id}_${story.pages[0].scene}`)} alt="" style={{ filter: "blur(4px) brightness(.8)" }} />}
      <style>{`@keyframes kenburns{from{transform:scale(1.02)}to{transform:scale(1.1) translate(-1%,-1%)}}`}</style>
      {!page && (
        <div className="center pop-in">
          <div className="panel" style={{ padding: "20px 60px", background: "linear-gradient(180deg,#fffaf0,#f6e3bb)" }}>
            <div className="display" style={{ fontSize: 72, color: "var(--blossom)" }}>{story.title}</div>
          </div>
        </div>
      )}
      {page && "hero" in page && page.hero && (
        <img key={`h${turn}`} className="sprite pop-in" src={heroImg(hero, page.hero)} alt="" style={{ left: 30, bottom: 190, width: 230, zIndex: 3 }} />
      )}
      <div className="topbar">
        <RoundButton sm label="map" onClick={onQuit}><Icon.home /></RoundButton>
      </div>
      {page?.kind === "narr" && <NarrPage key={page.id + turn} story={story.id} page={page} onNext={() => goNext(page)} />}
      {page?.kind === "read" && <ReadPage key={page.id + turn} story={story.id} page={page} maxUnit={story.maxUnit} onNext={() => goNext(page)} />}
      {page?.kind === "choice" && <ChoicePage key={page.id + turn} story={story.id} page={page} visited={visited.current} onPick={(next) => { sfx.page(); visited.current.add(next); setPageId(next); setTurn((t) => t + 1); }} onMiss={() => misses.current++} />}
      {page?.kind === "question" && <QuestionPage key={page.id + turn} story={story.id} page={page} onDone={finish} onMiss={() => misses.current++} />}
      <SenseiDock hidden />
    </div>
  );
}

const textPanel: React.CSSProperties = {
  position: "absolute", left: 158, right: 40, bottom: 24, minHeight: 150, padding: "18px 230px 18px 34px",
  background: "linear-gradient(180deg,#fffaf0,#f6e3bb)", display: "flex", alignItems: "center", zIndex: 5,
};

function NarrPage({ story, page, onNext }: { story: string; page: Extract<Page, { kind: "narr" }>; onNext: () => void }) {
  const words = page.text.split(" ");
  const [hi, setHi] = useState(-1);
  const [done, setDone] = useState(false);
  const went = useRef(false);
  useHelp((n) => say(n === 1 ? { line: "help_story" } : { story, page: page.id }));
  const next = () => {
    if (went.current) return;
    went.current = true;
    onNext();
  };
  useEffect(() => {
    let raf = 0;
    (async () => {
      const buf = await load(urls.story(story, page.id));
      const dur = buf?.duration ?? words.length * 0.35;
      const lens = words.map((w) => w.length + 2);
      const total = lens.reduce((a, b) => a + b, 0);
      const t0 = performance.now();
      const tick = () => {
        const el = (performance.now() - t0) / 1000 / dur;
        let acc = 0,
          k = 0;
        for (; k < lens.length; k++) {
          acc += lens[k] / total;
          if (acc > el) break;
        }
        setHi(k);
        if (el < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      await say({ story, page: page.id });
      cancelAnimationFrame(raf);
      setHi(-1);
      setDone(true);
    })();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="panel" style={{ ...textPanel, background: page.who === "baron" ? "linear-gradient(180deg,#f6ecff,#dcc8f5)" : textPanel.background }}>
      <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 30, lineHeight: 1.35 }}>
        {words.map((w, i) => (
          <span key={i} style={{ color: i === hi ? "var(--blossom-deep)" : undefined, transition: "color .1s" }}>{w} </span>
        ))}
      </div>
      <div style={{ position: "absolute", right: 20, top: "50%", translate: "0 -50%" }}>
        <RoundButton label="Next page" className={`go ${done ? "pulse" : ""}`} onClick={next}><Icon.next /></RoundButton>
      </div>
      <div style={{ position: "absolute", right: 126, top: "50%", translate: "0 -50%" }}>
        <RoundButton sm label="Read it again" onClick={() => say({ story, page: page.id })}><Icon.speaker /></RoundButton>
      </div>
    </div>
  );
}

/** A word the child reads, with sound buttons (dot = 1 letter, bar = 2+ letters). Tap for help. */
export function ReadWord({ text, maxUnit, big, onHelp }: { text: string; maxUnit: number; big?: boolean; onHelp?: () => void }) {
  const clean = text.replace(/[^A-Za-z']/g, "");
  const segs = decode(clean, maxUnit);
  const [lit, setLit] = useState(-1);
  const help = async () => {
    onHelp?.();
    sfx.tap();
    if (segs) await sayBlend(segs, clean.toLowerCase(), setLit);
    else await say({ word: clean.toLowerCase() === "i" ? "I" : clean.toLowerCase() });
    setLit(-1);
  };
  const lead = text.match(/^[^A-Za-z']*/)?.[0] ?? "";
  const trail = text.match(/[^A-Za-z']*$/)?.[0] ?? "";
  let pos = 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-start", marginRight: big ? 30 : 22, marginBottom: 30 }}>
      {lead}
      <button className="word-btn" {...tapProps(help)} style={{ display: "inline-flex", fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: big ? 86 : 60, lineHeight: 1.1, borderRadius: 14, padding: "8px 6px", margin: "-8px 0" }}>
        {segs
          ? segs.map((s, i) => {
              const chunk = clean.slice(pos, pos + s.g.length);
              pos += s.g.length;
              return (
                <span key={i} style={{ position: "relative", color: lit === i ? "var(--blossom-deep)" : undefined }}>
                  {chunk}
                  <span className={`sb ${s.g === "x" ? "two" : s.g.length > 1 ? "bar" : "dot"} ${lit === i ? "lit" : ""}`} style={{ bottom: -12 }} />
                </span>
              );
            })
          : <span style={{ color: "var(--indigo)" }}>{clean}</span>}
      </button>
      <span style={{ fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: big ? 86 : 56, lineHeight: 1.1 }}>{trail}</span>
    </span>
  );
}

function ReadPage({ story, page, maxUnit, onNext }: { story: string; page: Extract<Page, { kind: "read" }>; maxUnit: number; onNext: () => void }) {
  const [phase, setPhase] = useState<"read" | "done">("read");
  const helped = useRef(0);
  useHelp((n) => {
    if (n === 1) say({ line: "help_read" });
    else {
      helped.current++;
      say({ story, page: page.id });
    }
  });
  useEffect(() => {
    say({ line: "story_your_turn" });
  }, []);
  const readIt = async () => {
    if (phase === "done") return;
    // the child says they've read it: celebrate, then model fluent reading
    sfx.good();
    setPhase("done");
    fx.burst(640, 560, "stars", 20);
    await say([{ line: "well_read" }, { gap: 200 }, { story, page: page.id }]);
    await sleep(200);
    onNext();
  };
  return (
    <div className="panel" style={{ ...textPanel, minHeight: 190, paddingTop: 30, justifyContent: "flex-start" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start" }}>
        {page.text.split(" ").map((w, i) => (
          <ReadWord key={i} text={w} maxUnit={maxUnit} onHelp={() => helped.current++} />
        ))}
      </div>
      <div style={{ position: "absolute", right: 20, top: "50%", translate: "0 -50%", display: "flex", flexDirection: "column", gap: 10 }}>
        <RoundButton label="I read it!" className={`go ${phase === "read" ? "pulse" : ""}`} onClick={readIt}><Icon.check /></RoundButton>
      </div>
      <div style={{ position: "absolute", right: 126, top: "50%", translate: "0 -50%" }}>
        <RoundButton sm label="Read it to me" onClick={() => { helped.current++; say({ story, page: page.id }); }}><Icon.speaker /></RoundButton>
      </div>
    </div>
  );
}

function ChoicePage({ story, page, onPick, onMiss, visited }: { story: string; page: Extract<Page, { kind: "choice" }>; onPick: (next: string) => void; onMiss: () => void; visited: Set<string> }) {
  useHelp(() => say([{ story, page: page.id, caption: page.text }, { gap: 200 }, { line: "story_choose" }]));
  useEffect(() => {
    say([{ story, page: page.id, caption: page.text }, { gap: 200 }, { line: "story_choose" }]);
  }, []);
  void onMiss;
  return (
    <>
      <div className="panel" style={{ ...textPanel, minHeight: 110, fontSize: 30, fontWeight: 600, padding: "18px 34px", display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ flex: 1 }}>{page.text}</span>
        <RoundButton sm label="Hear the question" onClick={() => say({ story, page: page.id, caption: page.text })}><Icon.speaker /></RoundButton>
      </div>
      <div className="row" style={{ position: "absolute", left: 0, right: 0, top: 200, gap: 80, zIndex: 6 }}>
        {page.options.map((o, i) => (
          <button
            key={o.word}
            className="tile lg drop-in"
            style={{ animationDelay: `${i * 0.15}s`, padding: "0 40px", fontSize: 96, opacity: visited.has(o.next) ? 0.35 : 1, filter: visited.has(o.next) ? "grayscale(1)" : undefined }}
            {...tapProps(async () => {
              const w = WORD_BY_TEXT[o.word];
              if (w) await sayBlend(w.segs, w.text);
              onPick(o.next);
            })}
          >
            {o.word}
          </button>
        ))}
      </div>
    </>
  );
}

function QuestionPage({ story, page, onDone, onMiss }: { story: string; page: Extract<Page, { kind: "question" }>; onDone: () => void; onMiss: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  const [right, setRight] = useState(false);
  useHelp((n) => say(n === 1 ? { story, page: page.id, caption: page.text } : { line: "help_question" }));
  useEffect(() => {
    say([{ line: "story_question" }, { gap: 150 }, { story, page: page.id, caption: page.text }]);
  }, []);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "rgba(29,18,48,.45)" }} />
      <div className="panel pop-in" style={{ position: "absolute", left: "50%", translate: "-50% 0", top: 90, padding: "10px 24px 10px 40px", fontSize: 40, fontWeight: 800, zIndex: 6, display: "flex", alignItems: "center", gap: 20, whiteSpace: "nowrap" }}>
        {page.text}
        {/* pre-readers can't read the question: always let them hear it again */}
        <RoundButton sm label="Hear the question" onClick={() => say({ story, page: page.id, caption: page.text })}><Icon.speaker /></RoundButton>
      </div>
      <div className="row" style={{ position: "absolute", left: 0, right: 0, top: 250, gap: 50, zIndex: 6 }}>
        {page.options.map((o, i) => (
          <button
            key={o.img}
            className="card drop-in"
            style={{ position: "relative", width: 250, height: 250, animationDelay: `${i * 0.12}s`, background: wrong === o.img ? "#ffe0cc" : right && o.correct ? "#dfffe6" : undefined, animation: wrong === o.img ? "shake .4s" : undefined }}
            {...tapProps(async () => {
              if (right) return;
              if (o.correct) {
                setRight(true);
                sfx.great();
                fx.burst(640, 380, "stars", 30);
                await say({ line: pickPraise() });
                onDone();
              } else {
                onMiss();
                setWrong(o.img);
                sfx.wrong();
                await say({ line: "not_quite" });
                setWrong(null);
              }
            })}
          >
            <img src={img(o.img)} alt={o.label} />
          </button>
        ))}
      </div>
    </>
  );
}
