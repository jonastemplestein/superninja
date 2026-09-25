// Grown-ups area: settings, progress per spelling (reading vs spelling), and how the game teaches.
import { useState } from "react";
import { GRAPHEMES, PHONEMES, SPELLING_ORDER, UNITS } from "../content/phonics";
import { LEVELS, WORLDS } from "../content/worlds";
import { setMusicVolume, sfx, say } from "../engine/audio";
import { mastery, store, useSave, profilesApi } from "../engine/store";
import { RoundButton, Icon } from "../ui/ui";
import { JumpAhead } from "./JumpAhead";

export function Grownups({ onBack }: { onBack: () => void }) {
  const s = useSave((s) => s);
  const [confirm, setConfirm] = useState(false);
  const [jump, setJump] = useState(false);
  const set = (fn: (x: typeof s.settings) => void) => store.set((st) => fn(st.settings));
  const played = Object.keys(s.stars).length;

  return (
    <div className="scene scrollable" data-grownups style={{ background: "linear-gradient(180deg,#fff4dc,#f6e3bb)", overflowY: "auto", fontFamily: "var(--font-ui)" }}>
      <div className="topbar" style={{ position: "sticky", top: 16 }}>
        <RoundButton sm label="back" onClick={onBack}><Icon.back /></RoundButton>
        <div className="display" style={{ fontSize: 48 }}>Grown-ups</div>
      </div>
      {/* the stage is scaled to ~half size on a phone: grown-up text needs to be much bigger than game text.
          Left padding keeps the copy clear of Sensei's help button (bottom-left). */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, padding: "20px 40px 160px 40px", zoom: 1.5, marginLeft: 60 }}>
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
            onClick={() => { store.set((x) => { x.seenPlacement = false; }); location.search = "?scene=placement"; }}
            style={{ marginTop: 6, marginRight: 10, padding: "10px 18px", borderRadius: 14, border: "3px solid var(--ink)", background: "#fff", fontWeight: 700, fontSize: 18 }}
          >
            Redo Sensei's starting-level game
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

        <section className="panel" style={{ padding: 24, fontSize: 18, lineHeight: 1.45 }}>
          <h2 style={{ margin: "0 0 10px" }}>How Super Ninja teaches</h2>
          <p style={{ margin: "0 0 8px" }}>
            Super Ninja uses <b>linear, synthetic phonics</b> in British English. It starts from <b>sounds</b>. Letters are spellings of sounds, and one sound can use one, two, three or four letters. Every sound is said <b>pure</b> (“mmm”, not “muh”).
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
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
          <p style={{ margin: "0 0 10px", color: "var(--ink-soft)", fontSize: 17 }}>Every sound in the game, said pure. Tap to listen.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.values(PHONEMES).map((ph) => (
              <button key={ph.id} onClick={() => say({ sound: ph.id })} style={{ padding: "6px 12px", borderRadius: 12, border: "3px solid var(--ink)", background: "#fff", fontSize: 18 }}>
                <b style={{ fontFamily: "var(--font-letters)", fontSize: 24 }}>{ph.label}</b> <span style={{ color: "var(--ink-soft)" }}>as in {ph.example}</span>
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
