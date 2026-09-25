// "Who's playing?" — pick a player, or make a new one (typed on the real phone keyboard).
// Every player's progress is stored separately on this device.
import { useEffect, useRef, useState } from "react";
import { profilesApi, useSave } from "../engine/store";
import { sfx, playMusic } from "../engine/audio";
import { img, heroImg, tapProps, RoundButton, Icon, useHelp } from "../ui/ui";
import { say } from "../engine/audio";

const NAME_COLOURS = ["#ffc53d", "#8fd16a", "#6cc6f0", "#ff9ec0", "#b99cff", "#ffa46b"];

export function Profiles({ onPlay, onNew }: { onPlay: () => void; onNew: () => void }) {
  useSave((s) => s); // re-render on changes
  const list = profilesApi.list();
  const [naming, setNaming] = useState(list.length === 0);
  useHelp(() => say({ line: naming ? "help_name" : "help_players" }), [naming]);
  useEffect(() => {
    playMusic("title");
  }, []);
  if (naming) return <NewPlayer onDone={onNew} onBack={list.length ? () => setNaming(false) : undefined} />;
  return (
    <div className="scene">
      <img className="bg-img" src={img("title_bg")} alt="" style={{ filter: "blur(4px) brightness(.55)" }} />
      <div className="display" style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", fontSize: 64 }}>Who's playing?</div>
      <div className="row" style={{ position: "absolute", left: 150, right: 60, top: 140, bottom: 60, gap: 30, alignContent: "center", overflow: "hidden" }}>
        {list.slice(0, 5).map((p, i) => (
          <button
            key={p.id}
            aria-label={`player ${p.name}`}
            className="panel pop-in"
            {...tapProps(() => {
              sfx.great();
              profilesApi.select(p.id);
              onPlay();
            })}
            style={{ width: 210, height: 290, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: 14, animationDelay: `${i * 0.06}s`, background: p.hero === "suki" ? "linear-gradient(180deg,#d7fbf3,#8fe0cc)" : "linear-gradient(180deg,#dfe0ff,#9ea3f0)" }}
          >
            {p.hero ? (
              <img src={heroImg(p.hero, "idle")} alt="" style={{ height: 190, objectFit: "contain" }} />
            ) : (
              // no ninja chosen yet: a big first letter in the child's own colour, so siblings' cards differ
              <div style={{ height: 190, display: "grid", placeItems: "center" }}>
                <span style={{ width: 150, height: 150, borderRadius: "50%", display: "grid", placeItems: "center", background: NAME_COLOURS[[...p.name].reduce((a, c) => a + c.charCodeAt(0), 0) % NAME_COLOURS.length], border: "6px solid var(--ink)", boxShadow: "0 6px 0 var(--ink)", font: "700 96px/1 var(--font-letters)", color: "var(--ink)" }}>{[...p.name][0]}</span>
              </div>
            )}
            <span style={{ fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: p.name.length > 9 ? 26 : 34, marginTop: 6, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
          </button>
        ))}
        <button aria-label="New player" className="panel pop-in" {...tapProps(() => { sfx.pop(); setNaming(true); })} style={{ width: 210, height: 290, display: "grid", placeItems: "center", background: "rgba(255,244,220,.85)", borderStyle: "dashed" }}>
          <span style={{ fontSize: 120, fontFamily: "var(--font-display)", color: "#3fbf6a", lineHeight: 1 }}>+</span>
        </button>
      </div>
    </div>
  );
}

function NewPlayer({ onDone, onBack }: { onDone: () => void; onBack?: () => void }) {
  const [name, setName] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const t = setTimeout(() => input.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);
  const emptyTaps = useRef(0);
  const go = (n = name) => {
    input.current?.blur();
    sfx.great();
    profilesApi.create(n);
    onDone();
  };
  // a child who can't type yet isn't stuck: the first empty tap asks for a grown-up, the second plays as "Ninja 2"
  const tryGo = () => {
    if (name.trim()) return go();
    emptyTaps.current++;
    if (emptyTaps.current === 1) {
      sfx.pop();
      say({ line: "help_name" });
      input.current?.focus();
    } else go(`Ninja ${profilesApi.list().length + 1}`);
  };
  return (
    <div className="scene">
      <img className="bg-img" src={img("dojo_bg")} alt="" style={{ filter: "brightness(.6)" }} />
      <div className="panel pop-in" style={{ position: "absolute", left: 190, right: 100, top: 40, padding: "28px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div className="display" style={{ fontSize: 54, color: "#ff7aa2" }}>What's your name?</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            tryGo();
          }}
          style={{ display: "flex", gap: 18, alignItems: "center" }}
        >
          <input
            ref={input}
            className="name-input"
            value={name}
            maxLength={16}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            aria-label="Your name"
            onChange={(e) => setName(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <RoundButton label="Go" className={`go ${name.trim() ? "pulse" : ""}`} onClick={tryGo} style={{ width: 110, height: 110, opacity: name.trim() ? 1 : 0.6 }}>
            <Icon.check />
          </RoundButton>
        </form>
        <div style={{ fontSize: 22, color: "var(--ink-soft)", fontWeight: 700 }}>A grown-up can help type it.</div>
      </div>
      {onBack && (
        <div className="topbar">
          <RoundButton sm label="back" onClick={onBack}><Icon.back /></RoundButton>
        </div>
      )}
    </div>
  );
}
