// Grown-ups area: settings, progress per spelling (reading vs spelling), and how the game teaches.
// Navigation (docs/NAVIGATION.md §5.A): Home (top-left, the nav layer's) goes back to the screen the gear was held on
// (`onBack`, App's Home rule); the "Grown-ups" heading sits in the top bar right of it.
import { useRef, useState } from "react";
import { GRAPHEMES, PHONEMES, SPELLING_ORDER, UNITS, type PhonemeId } from "../content/phonics";
import { LEVELS, WORLDS, startFor, worldOf, termOf } from "../content/worlds";
import { setMusicVolume, sfx, say } from "../engine/audio";
import { mastery, store, useSave, profilesApi, logAdjust, type SchoolYear } from "../engine/store";
import { frontier, placeAtUnit } from "../engine/gems";
import { useHome, TopBar } from "../ui/nav";
import { SoundBadge } from "../ui/SoundBadge";
import { JumpAhead } from "./JumpAhead";

export function Grownups({ onBack }: { onBack: () => void }) {
  const s = useSave((s) => s);
  useHome(onBack);
  const [confirm, setConfirm] = useState(false);
  const [jump, setJump] = useState(false);
  const set = (fn: (x: typeof s.settings) => void) => store.set((st) => fn(st.settings));
  const played = Object.keys(s.stars).length;

  return (
    <div className="scene scrollable" data-grownups style={{ background: "linear-gradient(180deg,#fff4dc,#f6e3bb)", overflowY: "auto", fontFamily: "var(--font-ui)" }}>
      {/* (sticky, it sits in the flow at x 0, so .topbar's left: 18 doesn't apply: the margin puts the heading where every
          top bar's is, x 142, clear of Home's 18–118) */}
      <TopBar style={{ position: "sticky", top: 16, minHeight: 92, marginLeft: 18, marginRight: 18 }}>
        <div className="display" style={{ fontSize: 48 }}>Grown-ups</div>
      </TopBar>
      {/* the stage is scaled to ~half size on a phone: grown-up text needs to be much bigger than game text.
          Right padding keeps the copy clear of Sensei's Help button (bottom-right: ×1.5 zoom puts the edge at x 1106). */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, padding: "20px 116px 160px 40px", zoom: 1.5 }}>
        <section className="panel" style={{ padding: 24 }}>
          <h2 style={{ margin: "0 0 10px" }}>Settings</h2>
          <Toggle label="Relaxed mode (no timers anywhere; timers normally start in the Misty Mountains)" on={s.settings.relaxed} onChange={(v) => set((x) => void (x.relaxed = v))} />
          <Toggle label="Show speech captions" on={s.settings.captions} onChange={(v) => set((x) => void (x.captions = v))} />
          <Toggle label="Unlock every level (to match what's taught at school)" on={s.settings.unlockAll} onChange={(v) => set((x) => void (x.unlockAll = v))} />
          <label style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, marginTop: 12 }}>
            Music
            <input type="range" min={0} max={0.6} step={0.02} value={s.settings.music} style={{ flex: 1, accentColor: "#e2412f" }}
              onChange={(e) => { const v = +e.target.value; set((x) => void (x.music = v)); setMusicVolume(v); }} />
          </label>
          <p style={{ fontSize: 18, color: "var(--ink-soft)" }}>
            Levels finished: <b>{played}</b> of {LEVELS.length}. Spellings rescued: <b>{s.petals.length}</b> of {SPELLING_ORDER.length}.
          </p>
          <button
            onClick={() => { location.search = "?scene=placement"; }}
            style={{ marginTop: 6, marginRight: 10, padding: "10px 18px", borderRadius: 14, border: "3px solid var(--ink)", background: "#fff", fontWeight: 700, fontSize: 18 }}
          >
            Check the starting point
          </button>
          <button
            onClick={() => setJump(true)}
            style={{ marginTop: 6, marginRight: 10, padding: "10px 18px", borderRadius: 14, border: "3px solid var(--ink)", background: "#fff", fontWeight: 700, fontSize: 18 }}
          >
            Jump ahead (Reception / Year 1 / Year 2)
          </button>
          <button
            onClick={() => { if (confirm) { const p = profilesApi.current(); if (p) profilesApi.remove(p.id); else store.reset(); setConfirm(false); sfx.wrong(); location.href = "/play/?scene=profiles"; } else setConfirm(true); }}
            style={{ marginTop: 6, padding: "10px 18px", borderRadius: 14, border: "3px solid var(--ink)", background: confirm ? "#e2412f" : "#fff", color: confirm ? "#fff" : "var(--ink)", fontWeight: 700, fontSize: 18 }}
          >
            {confirm ? `Tap again to delete ${profilesApi.current()?.name ?? "this player"} and all their progress` : `Delete player ${profilesApi.current()?.name ?? ""}`}
          </button>
        </section>

        <SchoolYearPanel />

        <section className="panel" style={{ padding: 24, fontSize: 18, lineHeight: 1.45 }}>
          <h2 style={{ margin: "0 0 10px" }}>How Super Ninja teaches</h2>
          <p style={{ margin: "0 0 8px" }}>
            Super Ninja uses <b>linear, synthetic phonics</b> in British English. It starts from <b>sounds</b>. Letters are spellings of sounds, and one sound can use one, two, three or four letters. Every sound is said <b>pure</b> (“mmm”, not “muh”).
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><b>Warm-ups</b> (for children not at school yet): listening games and picture reading, with no letters. Sensei always shows one first, then your child has a go.</li>
            <li><b>Sticker Book</b> (the words your child has met): every picture played with becomes a sticker; a sticker turns gold with its written word once your child reads or spells it.</li>
            <li><b>Dojo</b>: new spellings, then <i>word building</i> (say the word, say the sounds, spell it).</li>
            <li><b>Battles</b>: dictation. Spelling a word casts the spell.</li>
            <li><b>Ninja Run</b>: blending. Hear the sounds, then catch the word.</li>
            <li><b>Sound Swap</b>: change one sound to make a new word.</li>
            <li><b>Stories</b>: decodable pages for your child to read, plus richer pages read aloud.</li>
            <li><b>Sorting</b>: the same sound, spelt different ways.</li>
          </ul>
          <p style={{ margin: "8px 0 0" }}>
            Mistakes get a specific prompt (“That's /p/… we need /t/”) instead of a plain “wrong”. There are no letter mascots, songs or actions. Short sessions are best, and the game suggests reading a real book together afterwards.
          </p>
        </section>

        <section className="panel" style={{ padding: 24, gridColumn: "1 / -1" }}>
          <h2 style={{ margin: "0 0 4px" }}>Spelling ↔ sound progress</h2>
          <p style={{ margin: "0 0 14px", color: "var(--ink-soft)", fontSize: 17 }}>Blue: reading (seeing the spelling, saying the sound). Pink: spelling (hearing the sound, choosing the spelling).</p>
          {UNITS.map((u) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
              <div style={{ width: 160, fontWeight: 700, fontSize: 16 }}>Unit {u.id}<br /><span style={{ fontWeight: 500, color: "var(--ink-soft)" }}>{u.focus}</span></div>
              {u.spellings.map((g) => {
                const key = `${g}>${GRAPHEMES[g]}`;
                const r = mastery(s.read[key]);
                const sp = mastery(s.spell[key]);
                return (
                  <div key={g} title={`/${PHONEMES[GRAPHEMES[g]].label}/ as in ${PHONEMES[GRAPHEMES[g]].example}`} style={{ textAlign: "center", width: 64 }}>
                    <div style={{ fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: 28 }}>{g}</div>
                    <Bar v={r} c="#5ec8f2" />
                    <Bar v={sp} c="#ff7aa2" />
                  </div>
                );
              })}
              {!u.spellings.length && <span style={{ color: "var(--ink-soft)" }}>No new spellings; longer words with adjacent consonants.</span>}
            </div>
          ))}
          <h2 style={{ margin: "18px 0 4px" }}>Sound check</h2>
          <p style={{ margin: "0 0 10px", color: "var(--ink-soft)", fontSize: 17 }}>
            Every sound in the game, said pure. Tap to listen. Your child sees each sound as its petal from the school chart (its colour and picture), never as letters.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.values(PHONEMES).map((ph) => (
              <button key={ph.id} onClick={() => say({ sound: ph.id })} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px 4px 6px", borderRadius: 12, border: "3px solid var(--ink)", background: "#fff", fontSize: 18 }}>
                <SoundBadge p={ph.id as PhonemeId} size={30} still />
                <span><b style={{ fontFamily: "var(--font-letters)", fontSize: 24 }}>{ph.label}</b> <span style={{ color: "var(--ink-soft)" }}>as in {ph.example}</span></span>
              </button>
            ))}
          </div>
          <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>Super Ninja v{__APP_VERSION__} · Worlds: {WORLDS.map((w) => w.name).join(" → ")}</p>
        </section>
      </div>
      {jump && <JumpAhead onClose={() => setJump(false)} onJumped={() => { setJump(false); store.flush(); location.href = "/play/?scene=map"; }} />}
    </div>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 20, margin: "8px 0", cursor: "pointer" }}>
      <button
        onClick={() => onChange(!on)}
        style={{ width: 64, height: 36, borderRadius: 20, border: "3px solid var(--ink)", background: on ? "#3fbf6a" : "#d8cfc0", position: "relative", flex: "none" }}
      >
        <span style={{ position: "absolute", top: 3, left: on ? 31 : 3, width: 24, height: 24, borderRadius: "50%", background: "#fff", border: "2px solid var(--ink)", transition: "left .15s" }} />
      </button>
      {label}
    </label>
  );
}

function Bar({ v, c }: { v: number; c: string }) {
  return (
    <div style={{ height: 9, borderRadius: 5, background: "rgba(43,29,20,.12)", margin: "3px 4px", overflow: "hidden" }}>
      <div style={{ width: `${v * 100}%`, height: "100%", background: c }} />
    </div>
  );
}

// ---------------------------------------------------------------- school year (docs/FIRST_MINUTES.md §4)
const YEARS: { id: SchoolYear; label: string }[] = [
  { id: "none", label: "Not at school yet" },
  { id: "R", label: "Reception" },
  { id: "Y1", label: "Year One" },
  { id: "Y2", label: "Year Two" },
  { id: "unset", label: "Not set" },
];
const labelOf = (y?: SchoolYear) => YEARS.find((x) => x.id === y)?.label ?? (y === "unsure" ? "Not sure" : "Not set");
const when = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const stone = (id: string) => {
  const l = LEVELS.find((x) => x.id === id);
  if (!l) return id;
  const w = worldOf(l);
  return `${w.name}, stone ${w.levels.indexOf(l) + 1}${l.warmup ? " (a warm-up)" : ""}`;
};

/** The School year row: changing it only records the year. "Start from here" (press and hold) moves the child to the
 *  start point for that year and term; the furthest point stays whichever is later. */
function SchoolYearPanel() {
  const s = useSave((x) => x);
  const year = s.schoolYear ?? "unset";
  const start = startFor(year);
  const here = frontier(s);
  const startIdx = LEVELS.findIndex((l) => l.id === start.lessons[0]);
  const gap = start.unit > 0 && startIdx > LEVELS.indexOf(here);
  const term = termOf(new Date());
  return (
    <section className="panel" style={{ padding: 24, fontSize: 18, lineHeight: 1.45 }}>
      <h2 style={{ margin: "0 0 6px" }}>School year</h2>
      <p style={{ margin: "0 0 10px", color: "var(--ink-soft)" }}>
        Your child chose this when they started{s.schoolYearAt ? ` (${when(s.schoolYearAt)})` : ""}. Changing it only records the year; it doesn't move their progress.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {YEARS.map((y) => (
          <button
            key={y.id}
            onClick={() => store.set((x) => { x.schoolYear = y.id; x.schoolYearAt = Date.now(); })}
            style={{ padding: "8px 14px", borderRadius: 14, border: "3px solid var(--ink)", background: year === y.id ? "#ffc53d" : "#fff", fontWeight: 700, fontSize: 17 }}
          >
            {y.label}
          </button>
        ))}
      </div>
      <p style={{ margin: "12px 0 6px" }}>
        Playing now: <b>{stone(here.id)}</b>.{" "}
        {start.unit > 0 ? <>The start for {labelOf(year)} in the {term} term is <b>{stone(start.lessons[0])}</b> (half a term behind the school's pace).</> : year === "none" || year === "unsure" ? <>Children not at school yet start with the warm-ups.</> : null}
      </p>
      {gap && <p style={{ margin: "0 0 8px", color: "#b3470f" }}>Your child is playing behind their class's starting point. "Start from here" moves them up; earlier levels stay open.</p>}
      {start.unit > 0 && (
        <HoldButton
          label={`Start from here (${labelOf(year)})`}
          disabled={!gap}
          onHold={() => {
            placeAtUnit(start.unit);
            store.set((x) => void (x.band = start.band));
            logAdjust(`Started from ${start.label}: ${stone(start.lessons[0])} (a grown-up)`);
          }}
        />
      )}
      {!!s.adjustLog?.length && (
        <>
          <h3 style={{ margin: "14px 0 4px", fontSize: 19 }}>Automatic moves</h3>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {s.adjustLog.slice(-6).map((e, i) => <li key={i}>{e.text} ({when(e.at)})</li>)}
          </ul>
        </>
      )}
    </section>
  );
}

/** Press and hold for 2 s (so a child can't do it by accident). */
function HoldButton({ label, onHold, disabled }: { label: string; onHold: () => void; disabled?: boolean }) {
  const [p, setP] = useState(0);
  const t = useRef<number | undefined>(undefined);
  const start = () => {
    if (disabled) return;
    const t0 = performance.now();
    const tick = () => {
      const v = (performance.now() - t0) / 2000;
      setP(v);
      if (v >= 1) {
        setP(0);
        sfx.good();
        onHold();
      } else t.current = requestAnimationFrame(tick);
    };
    t.current = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(t.current!);
    setP(0);
  };
  return (
    <button
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      disabled={disabled}
      style={{ marginTop: 6, padding: "10px 18px", borderRadius: 14, border: "3px solid var(--ink)", fontWeight: 700, fontSize: 18, opacity: disabled ? 0.5 : 1, background: `linear-gradient(90deg, #9fe0b1 ${p * 100}%, #fff ${p * 100}%)` }}
    >
      {label} · press and hold
    </button>
  );
}
