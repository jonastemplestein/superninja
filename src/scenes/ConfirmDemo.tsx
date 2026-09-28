// Hidden dev scene: the confirm (src/ui/Confirm.tsx, docs/CONFIRM.md §3) where it is used: on the map and in a level.
// It mounts standalone today (playtest/confirm/: its own page and vite build, with the Stage, Help, the nav layer and a
// ConfirmLayer); App can route it as ?scene=confirm-demo later (docs/fix-requests.md).
// - ?cf=map (default): a few of Bamboo Village's stones. The glowing stone starts at once (no question); a finished
//   stone or the finished story asks `replay` (YES is the stone's picture, the green ▶ is "keep playing"; the answers
//   are drawn away from the stone).
//   &look=map: the map redesign's own lines instead (MAP_DESIGN §7): each stone asks its own kind's question
//   (tv_map_replay_<kind>: the fish-dog game, First Sounds, Sound Swap, the story), then tv_map_replay_how.
// - ?cf=level | boss | trial | first: a turn with three pictures. Home before the first answer leaves at once; after it,
//   Sensei asks (`leave`, `leave-boss`, `leave-trial`; `first`: a first-session lesson, whose Home goes to the title).
//   Under that question Home points at the house (it never answers).
// - &open=<id>: opens that question 600 ms after the first tap, for the screenshots (playtest/confirm/shoot.ts).
// window.__cfDemo.results lists every answer: { id, yes, how }.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { img, sleep, tapProps } from "../ui/ui";
import { say, sfx, unlockAudio } from "../engine/audio";
import { useHome, useNav, told, replayTold } from "../ui/nav";
import { NinjaSpot } from "../ui/Ninja";
import { confirmWith, QUESTIONS, type ConfirmOpts, type ConfirmResult } from "../ui/Confirm";
import { LINES } from "../content/lines";

const HAS = new Set(LINES.map((l) => l.id));
type Mode = "map" | "level" | "boss" | "trial" | "first";
const results: (ConfirmResult & { id: string; t: number })[] = [];
(window as any).__cfDemo = { results };

/** The map's own question for a stone of this kind (MAP_DESIGN §7): its kind's line, else the generic one. */
function mapReplay(kind: string, o: Partial<ConfirmOpts> = {}): ConfirmOpts {
  const line = HAS.has(`tv_map_replay_${kind}`) ? `tv_map_replay_${kind}` : "tv_confirm_play_again";
  return QUESTIONS.replay({
    ask: { line },
    how: [{ line: "tv_map_replay_how" }],
    ...o,
    yes: { say: [{ line: "tv_map_replay_yes" }], ...o.yes },
    no: { say: [{ line: "tv_map_replay_next" }], ...o.no },
  });
}
/** The questions of docs/CONFIRM.md §3.3, as the call sites will ask them (the bubble's picture is the level's own). */
export const DEMO_QUESTIONS: Record<string, (o?: Partial<ConfirmOpts>) => ConfirmOpts> = {
  replay: (o) => QUESTIONS.replay({ pic: img("pic_fishdog"), ...o }),
  "replay-map": (o) => mapReplay("picread", { pic: img("pic_fishdog"), ...o }),
  leave: (o) => QUESTIONS.leave({ pic: img("pic_mat"), ...o }),
  "leave-first": (o) => QUESTIONS.leaveFirst({ pic: img("pic_mat"), ...o }),
  "leave-boss": (o) => QUESTIONS.leaveBoss({ pic: img("mon_boss_panda"), ...o }),
  "leave-trial": (o) => QUESTIONS.leaveTrial({ pic: img("mon_gem_guardian"), ...o }),
};

async function ask(o: ConfirmOpts, note: (s: string) => void): Promise<ConfirmResult> {
  const r = await confirmWith(o);
  results.push({ id: o.id, ...r, t: Math.round(performance.now()) });
  note(`${o.id}: ${r.yes ? "YES" : "no"} (${r.how})`);
  return r;
}

export function ConfirmDemo({ onHome }: { onHome?: () => void }) {
  const q = new URLSearchParams(location.search);
  const mode = (q.get("cf") as Mode | null) ?? "map";
  const [log, setLog] = useState<string[]>([]);
  const note = (s: string) => setLog((l) => [...l.slice(-3), s]);
  const opened = useRef(false);
  // the first tap unlocks audio (and, with &open=, opens that question)
  useEffect(() => {
    const first = () => {
      void unlockAudio();
      const id = q.get("open");
      if (id && !opened.current && DEMO_QUESTIONS[id]) {
        opened.current = true;
        void sleep(600).then(() => ask(DEMO_QUESTIONS[id](), note));
      }
    };
    window.addEventListener("pointerdown", first, { once: true, capture: true });
    return () => window.removeEventListener("pointerdown", first, { capture: true });
  }, []);
  return (
    <div className="scene" style={{ background: "#2a5a3a" }}>
      {mode === "map" ? <DemoMap look={q.get("look")} note={note} onHome={onHome} /> : <DemoLevel mode={mode} note={note} />}
      <div className="cf-demo-log" style={LOG}>
        {log.map((s, i) => (
          <div key={i}>{s}</div>
        ))}
      </div>
    </div>
  );
}
const LOG: CSSProperties = { position: "absolute", left: 150, top: 18, font: "700 22px/1.25 var(--font-ui)", color: "#fff", textShadow: "0 2px 0 #2b1d14", pointerEvents: "none", zIndex: 30 };

// ---------------------------------------------------------------- the map
// (the pictures are the map's own: App's KIND_ICON)
const STONES: { x: number; y: number; icon: string; kind: string; state: "done" | "current" | "locked" }[] = [
  { x: 150, y: 560, icon: "pic_fishdog", kind: "picread", state: "done" },
  { x: 295, y: 548, icon: "pic_mat", kind: "firstsound", state: "done" },
  { x: 440, y: 572, icon: "item_scroll", kind: "swap", state: "done" },
  { x: 585, y: 560, icon: "item_lantern", kind: "story", state: "done" },
  { x: 730, y: 548, icon: "sensei_idle", kind: "dojo", state: "current" },
  { x: 875, y: 572, icon: "item_gong", kind: "run", state: "locked" },
  { x: 1020, y: 560, icon: "mon_boss_panda", kind: "boss", state: "locked" },
];
function DemoMap({ look, note, onHome }: { look: string | null; note: (s: string) => void; onHome?: () => void }) {
  useHome(onHome ?? (() => note("home: to the title")));
  useNav({ again: () => say({ line: HAS.has("tv_map_hint") ? "tv_map_hint" : "map_hint" }), againAt: "side" });
  const tapStone = (i: number, el: Element) => {
    const s = STONES[i];
    if (s.state === "locked") return void (sfx.wrong(), say({ line: HAS.has("tv_map_locked") ? "tv_map_locked" : "map_locked" }));
    if (s.state === "current") return void (sfx.pop(), note(`stone ${i + 1}: starts at once (the glowing stone)`));
    sfx.pop();
    // the stone's picture is YES's (so Sensei's bubble shows "?"); the answers are drawn away from the stone
    const o = { pic: img(s.icon), from: el };
    void ask(look === "map" ? mapReplay(s.kind, o) : QUESTIONS.replay(o), note).then((r) => {
      if (r.yes) note(`→ stone ${i + 1} plays again`);
      else if (r.how === "no") note("→ off to the glowing stone's game");
    });
  };
  return (
    <>
      <img className="bg-img" src={img("bg_bamboo")} alt="" />
      <div className="vignette" />
      <svg width={1280} height={720} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <path d={STONES.map((s, i) => `${i ? "L" : "M"}${s.x},${s.y}`).join(" ")} fill="none" stroke="#f6e3bb" strokeWidth={22} strokeLinecap="round" />
      </svg>
      {STONES.map((s, i) => {
        const cur = s.state === "current";
        const size = cur ? 132 : s.state === "locked" ? 84 : 104;
        return (
          <button
            key={i}
            aria-label={`stone ${i + 1}`}
            data-stone={s.state}
            data-kind={s.kind}
            className={cur ? "map-next" : ""}
            {...tapProps((el) => tapStone(i, el))}
            style={{
              position: "absolute", left: s.x - size / 2, top: s.y - size / 2, width: size, height: size, borderRadius: "50%", zIndex: cur ? 7 : 5,
              background: cur ? "radial-gradient(circle at 40% 30%, #fffbe6, #ffc53d 70%, #c98a00)" : s.state === "done" ? "radial-gradient(circle at 40% 30%, #fffaf0, #6cc04a 75%)" : "radial-gradient(circle at 40% 30%, #cfc8d6, #6f6878)",
              border: `${cur ? 7 : 5}px solid var(--ink)`, boxShadow: "0 6px 0 var(--ink)",
            }}
          >
            <img src={img(s.icon)} alt="" style={{ width: "86%", height: "86%", objectFit: "contain", filter: s.state === "locked" ? "grayscale(.85) opacity(.7)" : "none" }} />
          </button>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------- a level
const WORDS = ["sun", "sock", "mat"];
function DemoLevel({ mode, note }: { mode: Exclude<Mode, "map">; note: (s: string) => void }) {
  const [answered, setAnswered] = useState(0);
  const [left, setLeft] = useState(false);
  const answeredRef = useRef(0);
  answeredRef.current = answered;
  const id = mode === "level" ? "leave" : mode === "first" ? "leave-first" : `leave-${mode}`;
  // Home: before the first answer nothing is lost, so it leaves at once; after it, Sensei asks (docs/CONFIRM.md §1.1
  // row 2). While the question is up, Home belongs to it (it points at the house).
  useHome(() => {
    if (answeredRef.current === 0) {
      note("home before the first answer: left at once");
      setLeft(true);
      return;
    }
    // YES: to the map. NO (the ▶, tapped): the turn's question again (40 s of quiet: just carry on)
    void ask(DEMO_QUESTIONS[id](), note).then((r) => (r.yes ? setLeft(true) : r.how === "no" ? void replayTold() : undefined));
  });
  useNav({ again: "told" });
  useEffect(() => {
    if (!left) void told({ line: HAS.has("tv_find_again_sock") ? "tv_find_again_sock" : "listen_again" }, { fresh: true });
  }, [left]);
  if (left)
    return (
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "linear-gradient(180deg,#bfe6a8,#6cc04a)" }}>
        <div className="panel" style={{ padding: "20px 40px", fontSize: 40 }}>
          (the map) <button {...tapProps(() => (setLeft(false), setAnswered(0)))} style={{ fontSize: 30, textDecoration: "underline" }}>play again</button>
        </div>
      </div>
    );
  const bg = mode === "boss" ? "bg_castle" : mode === "trial" ? "bg_sky" : "bg_bamboo";
  return (
    <>
      <img className="bg-img" src={img(bg)} alt="" />
      <div className="vignette" />
      <NinjaSpot />
      {(mode === "boss" || mode === "trial") && <img src={img(mode === "boss" ? "mon_boss_panda" : "mon_gem_guardian")} alt="" style={{ position: "absolute", left: 830, top: 60, width: 250, pointerEvents: "none" }} />}
      <div style={{ position: "absolute", left: 360, top: 330, display: "flex", gap: 34 }}>
        {WORDS.map((w) => (
          <button
            key={w}
            aria-label={w}
            {...tapProps(() => {
              sfx.good();
              setAnswered((n) => n + 1);
              note(`answered ${w}`);
            })}
            style={{ width: 190, height: 190, borderRadius: 28, border: "6px solid var(--ink)", background: "#fffdf6", boxShadow: "0 8px 0 var(--ink)", display: "grid", placeItems: "center" }}
          >
            <img src={img(`pic_${w}`)} alt="" style={{ width: "82%", height: "82%", objectFit: "contain" }} />
          </button>
        ))}
      </div>
      <div style={{ position: "absolute", left: 360, top: 250, font: "700 26px var(--font-ui)", color: "#fff", textShadow: "0 2px 0 #2b1d14" }}>
        {answered ? `answers: ${answered} (Home now asks)` : "no answer yet (Home leaves at once)"}
      </div>
    </>
  );
}
