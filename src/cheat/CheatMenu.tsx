// The cheat menu (docs/CHEATS.md): a full-screen overlay for grown-ups testing the game. Its own React root on <body>,
// mounted on open and unmounted on close (nothing of it runs while it is closed); gesture.ts loads this chunk on the
// first open. Five tabs: Jump (every level and screen), Mastery (presets, the 44 sounds, the gems, words, stickers),
// Time and voice (sessions, days away, each game's introduction form, the dosage ledger), Play (speed, settings, the
// streak, the hero, a live __snState overlay) and Save (export, import, players, reset). While it is open the game
// underneath waits (holdGame).
//
// No element here carries an aria-label: App's first check (useFirstCheck) reads the nearest aria-label of any tap as
// the child's answer, so a tap in the menu must never have one.
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import "../styles/cheat.css";
import { store, useSave, profilesApi, type Save } from "../engine/store";
import { LEVELS, WORLDS, worldOf, levelById, type LevelKind } from "../content/worlds";
import { PETALS, neededGems } from "../content/flower";
import { PHONEMES, UNITS, WORDS, type PhonemeId } from "../content/phonics";
import { gemState, knownNow, frontier, energyOf } from "../engine/gems";
import { streak, useStreak } from "../engine/streak";
import { setMusicVolume, pauseSpeech } from "../engine/audio";
import { pauseLessonClock, resumeLessonClock } from "../engine/lessonClock";
import { isUpright, onUpright } from "../ui/ui";
import { FAST } from "../engine/fast";
import { SoundBadge } from "../ui/SoundBadge";
import { petalColour } from "../ui/petal";
import * as A from "./actions";
import { catalogue, levelJump, gameJump, runJump, reloadHere, inAppOnly, GAME_ROWS, type Jump } from "./jumps";
import { HOST_ID, OVERLAY_ID, OVERLAY_KEY, ZONE as CORNER } from "./gesture";

// ---------------------------------------------------------------- mounting
let host: HTMLDivElement | null = null;
let root: Root | null = null;
/** Open (true), close (false) or toggle. */
export function toggle(open?: boolean) {
  const want = open ?? !root;
  if (want && !root) mount();
  else if (!want && root) unmount();
}
function mount() {
  host = document.createElement("div");
  host.id = HOST_ID;
  host.className = "ch-host";
  // the menu opens on the fifth tap's pointerdown: that touch's own click lands on the menu a moment later, right on its
  // Close button (top-right). A click in the corner in the first 600 ms is swallowed (registered before React's own
  // listeners); taps anywhere else work at once
  const t0 = performance.now();
  host.addEventListener(
    "click",
    (e) => void (performance.now() - t0 < 600 && e.clientX >= innerWidth - CORNER && e.clientY <= CORNER && (e.stopImmediatePropagation(), e.preventDefault())),
    { capture: true },
  );
  // main.tsx's kid-proofing stops text selection and long-press menus on the whole page: the menu's text fields need both
  const field = (t: EventTarget | null) => t instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(t.tagName);
  for (const ev of ["selectstart", "contextmenu"]) host.addEventListener(ev, (e) => void (field(e.target) && e.stopPropagation()));
  // keys pressed in the menu never reach the game (a Dojo taps a tile for every letter typed); Escape closes it
  host.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Escape") toggle(false);
  });
  document.body.appendChild(host);
  root = createRoot(host);
  root.render(<CheatMenu onClose={() => toggle(false)} />);
  holdGame(true);
}
function unmount() {
  const r = root;
  root = null;
  r?.unmount();
  host?.remove();
  host = null;
  holdGame(false);
}

// ---------------------------------------------------------------- the game underneath waits
let offUpright = () => {};
/**
 * While the menu is open the game underneath waits, as it does under the turn-your-phone picture: the line Sensei is
 * saying stops (it is said again from its start on close) and the next ones wait, sound effects are hushed, and lesson
 * clocks stop (audio.ts pauseSpeech, lessonClock.ts). A scene's own timers and animations run on (a battle's charge, the
 * idle hints): they wait only for an upright phone or a confirm (docs/CHEATS.md). The AudioContext isn't suspended:
 * audio.ts resumes it on every tap, the menu's included. The music plays on (the Play tab turns it off).
 */
function holdGame(on: boolean) {
  if (on) {
    pauseSpeech(true);
    pauseLessonClock();
    // the turn-your-phone picture opens the speech gate as the phone turns back: shut it again straight after, as a
    // confirm does (its cleanup runs in a React effect, a frame or so later)
    offUpright = onUpright(() => {
      if (!isUpright()) for (const ms of [0, 60, 250]) setTimeout(() => root && pauseSpeech(true), ms);
    });
  } else {
    offUpright();
    offUpright = () => {};
    resumeLessonClock();
    // (while the phone is upright its picture holds the gate, and opens it when the phone turns back)
    if (!isUpright()) pauseSpeech(false);
  }
}

// ---------------------------------------------------------------- per-viewer preferences (localStorage, may be absent)
const PREF = "sn.cheat.";
function prefGet(k: string, d: string): string {
  try {
    return localStorage.getItem(PREF + k) ?? d;
  } catch {
    return d;
  }
}
function prefSet(k: string, v: string) {
  try {
    localStorage.setItem(PREF + k, v);
  } catch {}
}
function usePref(k: string, d: string): [string, (v: string) => void] {
  const [v, setV] = useState(() => prefGet(k, d));
  return [v, (x) => (prefSet(k, x), setV(x))];
}

// ---------------------------------------------------------------- the __snState overlay
let overlayTick = 0;
/** A small live readout of window.__snRoute, __snState, __snNav and the streak, top centre, never taking taps. It polls
 *  twice a second while it is on (and only then); on stays on across reloads (gesture.ts). */
export function showOverlay(on: boolean) {
  try {
    localStorage.setItem(OVERLAY_KEY, on ? "1" : "0");
  } catch {}
  clearInterval(overlayTick);
  document.getElementById(OVERLAY_ID)?.remove();
  if (!on) return;
  const el = document.createElement("pre");
  el.id = OVERLAY_ID;
  document.body.appendChild(el);
  const w = window as unknown as { __snRoute?: string; __snState?: unknown; __snNav?: { next?: string; pres?: { id?: string; step?: number } } };
  const tick = () => {
    let st = "";
    try {
      st = JSON.stringify(w.__snState ?? null);
    } catch {
      st = "(unreadable)";
    }
    const nav = w.__snNav;
    el.textContent = `${w.__snRoute ?? "?"} · streak ${streak.n} · next ${nav?.next ?? "-"}${nav?.pres?.id ? ` · ${nav.pres.id}#${nav.pres.step ?? 0}` : ""}\n${st.length > 420 ? st.slice(0, 420) + "…" : st}`;
  };
  tick();
  overlayTick = window.setInterval(tick, 500);
}
const overlayOn = () => !!document.getElementById(OVERLAY_ID);

// ---------------------------------------------------------------- bits
type Note = (msg: string) => void;
/** Go somewhere (a string: why the jump can't be made from this save; null: it can't). */
type Go = (j: Jump | string | null, label?: string) => void;
function Btn({ children, note, onClick, on, className = "", disabled, tag }: { children: ReactNode; note?: ReactNode; onClick: () => void; on?: boolean; className?: string; disabled?: boolean; tag?: ReactNode }) {
  return (
    <button type="button" className={`ch-btn ${on ? "on" : ""} ${className}`} onClick={onClick} disabled={disabled}>
      {tag ? <span className="ch-tag">{tag}</span> : null}
      {children}
      {note ? <small>{note}</small> : null}
    </button>
  );
}
function Toggle({ label, on, onChange }: { label: ReactNode; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className={`ch-toggle ${on ? "on" : ""}`} onClick={() => onChange(!on)}>
      <span>{label}</span>
      <b>{on ? "On" : "Off"}</b>
    </button>
  );
}
function Sec({ title, children, aside }: { title: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="ch-sec">
      <h3>
        {title}
        {aside ? <span className="ch-aside">{aside}</span> : null}
      </h3>
      {children}
    </section>
  );
}
const days = (d: number) => (d < 1 / 24 ? "just now" : d < 1 ? `${Math.round(d * 24)} h ago` : `${Math.round(d)} d ago`);
const edit = (f: (s: Save) => Save) => A.edit(f);

// ---------------------------------------------------------------- the menu
const TABS = [
  { id: "jump", label: "Jump" },
  { id: "mastery", label: "Mastery" },
  { id: "time", label: "Time and voice" },
  { id: "play", label: "Play" },
  { id: "save", label: "Save" },
] as const;

function CheatMenu({ onClose }: { onClose: () => void }) {
  const s = useSave((x) => x);
  const [tab, setTab] = usePref("tab", "jump");
  const [reload, setReload] = usePref("reload", "0");
  const [toast, setToast] = useState<string | null>(null);
  const toastT = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    box.current?.focus({ preventScroll: true });
    return () => clearTimeout(toastT.current);
  }, []);
  const note: Note = (msg) => {
    setToast(msg);
    clearTimeout(toastT.current);
    toastT.current = window.setTimeout(() => setToast(null), Math.max(2600, 55 * msg.length) * FAST); // (time to read it)
  };
  const go: Go = (j, label) => {
    if (typeof j === "string") return note(`${label ?? "That"}: ${j}`);
    if (!j) return note(`${label ?? "That"}: not possible from this save`);
    onClose();
    runJump(j, { reload: reload === "1" });
  };
  return (
    <div className="ch" role="dialog" aria-modal="true" aria-labelledby="ch-title" tabIndex={-1} ref={box}>
      <header className="ch-bar">
        <h2 id="ch-title" className="ch-title">Cheats</h2>
        <nav className="ch-tabs scrollable">
          {TABS.map((t) => (
            <button type="button" key={t.id} className={`ch-tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <button type="button" className="ch-close" onClick={onClose}>
          Close ✕
        </button>
      </header>
      <main className="ch-body scrollable" key={tab}>
        <Status s={s} />
        {tab === "jump" && <JumpTab s={s} go={go} reload={reload === "1"} setReload={(v) => setReload(v ? "1" : "0")} />}
        {tab === "mastery" && <MasteryTab s={s} note={note} go={go} />}
        {tab === "time" && <TimeTab s={s} note={note} />}
        {tab === "play" && <PlayTab s={s} note={note} />}
        {tab === "save" && <SaveTab s={s} note={note} />}
      </main>
      {toast && <div className="ch-toast">{toast}</div>}
    </div>
  );
}

function Status({ s }: { s: Save }) {
  const f = frontier(s);
  const p = profilesApi.current();
  const d = A.daysSinceLastPlay(s);
  const route = (window as unknown as { __snRoute?: string }).__snRoute ?? "?";
  return (
    <p className="ch-status">
      Player <b>{p?.name ?? "(none)"}</b> · next stone <b>{f.id}</b> ({worldOf(f).name}) · screen <b>{route}</b> · session <b>{s.sessions}</b>
      {d !== null ? <> · last play <b>{days(d)}</b></> : null}
      {FAST > 1 ? <> · speed <b>{FAST}×</b></> : null}
    </p>
  );
}

// ---------------------------------------------------------------- Jump
const KINDS: LevelKind[] = [...new Set(LEVELS.map((l) => l.kind))];
const shortId = (id: string, world: number) => id.replace(`w${world}-`, "");

function JumpTab({ s, go, reload, setReload }: { s: Save; go: Go; reload: boolean; setReload: (v: boolean) => void }) {
  const f = frontier(s);
  const [kind, setKind] = usePref("kind", "all");
  const [band, setBand] = usePref("band", "W");
  const [gem, setGem] = usePref("gem", "ai>ae");
  const [lv, setLv] = usePref("level", "");
  const [form, setForm] = usePref("form", "full");
  // (default: the last level finished that isn't a warm-up, whose reward is the ordinary one)
  const level = levelById(lv) ? lv : (LEVELS.slice(0, LEVELS.indexOf(f)).reverse().find((l) => !l.warmup)?.id ?? "w1-4");
  const groups = useMemo(() => catalogue({ gem, level }), [gem, level, s]);
  // with reload on: the jumps that go in-app all the same (their screen needs more than a deep link carries)
  const inApp = useMemo(() => {
    if (!reload) return new Set<string>();
    const ids = groups.flatMap((g) => g.items.filter((it) => {
      const j = it.jump();
      return !!j && typeof j === "object" && inAppOnly(j);
    }).map((it) => it.id));
    return new Set(ids);
  }, [groups, reload]);
  const gemOptions = useMemo(() => A.IN_PLAY.map((g) => ({ key: g.key, label: `${g.g} → /${PHONEMES[g.p]?.label ?? g.p}/ (${gemState(g, s)})` })), [s]);
  return (
    <>
      <Sec title="How to go">
        <div className="ch-row">
          <Toggle
            label={
              <>
                Reload the page on jump
                <small>
                  Clears the in-memory state. Some jumps always stay in-app (marked <span className="ch-tag inline">in-app</span>): the World Flower's
                  trips, the rich rewards, a map's other lands and intros, the moving-up opt-in.
                </small>
              </>
            }
            on={reload}
            onChange={setReload}
          />
        </div>
        <div className="ch-row ch-selects">
          <label>
            Gem for the World Flower jumps
            <select value={gem} onChange={(e) => setGem(e.target.value)}>
              {gemOptions.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </label>
          <label>
            Level for the rewards
            <select value={level} onChange={(e) => setLv(e.target.value)}>
              {LEVELS.map((l) => (
                <option key={l.id} value={l.id}>{l.id} · {l.kind}</option>
              ))}
            </select>
          </label>
        </div>
      </Sec>

      <Sec title="Levels" aside={<>next stone {f.id}</>}>
        <div className="ch-row ch-chips scrollable">
          {["all", ...KINDS].map((k) => (
            <button type="button" key={k} className={`ch-chip ${kind === k ? "on" : ""}`} onClick={() => setKind(k)}>
              {k}
            </button>
          ))}
        </div>
        <div className="ch-row">
          <span className="ch-lab">Warm-ups play the</span>
          <button type="button" className={`ch-chip ${band !== "R" ? "on" : ""}`} onClick={() => setBand("W")}>preschool version</button>
          <button type="button" className={`ch-chip ${band === "R" ? "on" : ""}`} onClick={() => setBand("R")}>Reception version</button>
        </div>
        {WORLDS.map((w) => {
          const ls = w.levels.filter((l) => kind === "all" || l.kind === kind);
          if (!ls.length) return null;
          return (
            <div key={w.id} className="ch-world">
              <div className="ch-world-name" style={{ background: w.colour }}>{w.id} · {w.name}</div>
              <div className="ch-levels">
                {ls.map((l) => (
                  <button type="button" key={l.id} className={`ch-lv ${l.id === f.id ? "next" : ""}`} onClick={() => go(levelJump(l.id, { band: band === "R" ? "R" : "W" }))}>
                    <b>{shortId(l.id, w.id)}</b>
                    <small>{l.kind}{l.teach?.length ? ` ${l.teach.map((t) => t.split("=")[0]).join(" ")}` : ""}</small>
                    <i>{"★".repeat(s.stars[l.id] ?? 0)}</i>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </Sec>

      {groups.map((g) => (
        <Sec key={g.title} title={g.title}>
          <div className="ch-grid">
            {g.items.map((it) => (
              <Btn key={it.id} note={it.note} tag={inApp.has(it.id) ? "in-app" : undefined} onClick={() => go(it.jump(), it.label)}>
                {it.label}
              </Btn>
            ))}
          </div>
        </Sec>
      ))}

      <Sec title="Teacher voice: a game's introduction, then its first level" aside="the ledger is edited, then the jump">
        <div className="ch-row ch-chips">
          {A.GAME_FORMS.filter((x) => x !== "none").map((x) => (
            <button type="button" key={x} className={`ch-chip ${form === x ? "on" : ""}`} onClick={() => setForm(x)}>
              {FORM_LABEL[x]}
            </button>
          ))}
        </div>
        <div className="ch-grid">
          {GAME_ROWS.map((r) => (
            <Btn key={r.id} note={<>now {A.formNow(s, r.id)} · plays in {r.where}</>} onClick={() => go(gameJump(r.id, form as A.GameForm, gem), r.name)}>
              {r.name}
              {r.name !== r.id ? <span className="ch-dim"> ({r.id})</span> : null}
            </Btn>
          ))}
        </div>
      </Sec>
    </>
  );
}
const FORM_LABEL: Record<A.GameForm, string> = {
  full: "Full (first time)",
  recap: "Recap",
  "recap-21": "Recap, 22 days away",
  "recap-struggled": "Recap, struggled",
  short: "Short",
  none: "None (played this session)",
};

// ---------------------------------------------------------------- Mastery
const STATE_LABEL: Record<A.SoundState, string> = { none: "not met", met: "met", secure: "secure", "n/a": "not in the game" };
const GEM_LABEL: Record<string, string> = { hidden: "not found", charging: "charging", ready: "glowing", won: "won", future: "future" };

function MasteryTab({ s, note, go }: { s: Save; note: Note; go: Go }) {
  const [placed, setPlaced] = usePref("placed", "0");
  const known = useMemo(() => knownNow(s), [s]);
  const f = frontier(s);
  const applyPreset = (p: A.Preset) => {
    A.commit(A.presetSave(p.id, s, Date.now(), { placed: placed === "1" }));
    // (the map's default land is the next stone's: a plain ?scene=map carries it across a reload)
    go(p.id === "new" ? { route: { name: "title" } } : { route: { name: "map" } });
  };
  const cycleSound = (p: PhonemeId, st: A.SoundState) => {
    if (st === "n/a") return note(`/${PHONEMES[p].label}/: no spelling of it is in the game yet`);
    const to = A.SOUND_CYCLE[st];
    edit((x) => A.withSound(x, p, to));
    const now = A.soundState(PETALS.find((x) => x.p === p)!, store.get());
    if (now !== to) note(`/${PHONEMES[p].label}/ stays ${STATE_LABEL[now]}: the next stone (${f.id}) has taught it`);
  };
  const cycleGem = (key: string) => {
    const g = A.IN_PLAY.find((x) => x.key === key)!;
    const to = A.nextGemTarget(gemState(g, s));
    if (!to) return;
    edit((x) => A.withGem(x, key, to));
    const now = gemState(g, store.get());
    if (now !== to) note(`${g.g}: ${GEM_LABEL[now]}${to === "ready" ? " (a glowing gem needs three words the child can spell)" : to === "hidden" ? ` (the next stone, ${f.id}, has taught it)` : ""}`);
  };
  const seenGem = new Set<string>();
  return (
    <>
      <Sec title="Presets" aside={<Toggle label="As placed by the opt-in (no stars)" on={placed === "1"} onChange={(v) => setPlaced(v ? "1" : "0")} />}>
        <div className="ch-grid">
          {A.PRESETS.map((p) => (
            <Btn key={p.id} note={<>{p.note}{p.id !== "new" ? <> · next stone {A.presetFrontier(p).id}{p.done >= LEVELS.length ? " (all done)" : ""}</> : null}</>} onClick={() => applyPreset(p)}>
              {p.label}
            </Btn>
          ))}
        </div>
      </Sec>

      <Sec title="The 44 sounds" aside="tap: not met → met → secure">
        <div className="ch-sounds">
          {PETALS.map((pt) => {
            const st = A.soundState(pt, s, known);
            return (
              <button type="button" key={pt.p} className={`ch-snd ${st.replace("/", "")}`} onClick={() => cycleSound(pt.p, st)}>
                <SoundBadge p={pt.p} size={44} still unknown={st === "none" || st === "n/a"} />
                <b>/{PHONEMES[pt.p].label}/</b>
                <i>{PHONEMES[pt.p].example}</i>
                <small>{STATE_LABEL[st]}</small>
              </button>
            );
          })}
        </div>
      </Sec>

      <Sec title="Gems, per spelling" aside="tap: not found → charging → glowing → won">
        <div className="ch-gemrows">
          {PETALS.filter((pt) => neededGems(pt).length).map((pt) => (
            <div key={pt.p} className="ch-gemrow">
              <span className="ch-gemsound" style={{ background: petalColour(pt.p) }}>
                /{PHONEMES[pt.p].label}/<small>{PHONEMES[pt.p].example}</small>
              </span>
              {neededGems(pt).map((g) => {
                if (seenGem.has(g.key)) return null;
                seenGem.add(g.key);
                const st = gemState(g, s, known);
                const e = energyOf(g.key, s);
                return (
                  <button type="button" key={g.key} className={`ch-gem ${st}`} style={{ "--e": `${Math.round(e * 100)}%`, "--c": petalColour(g.p) } as CSSProperties} onClick={() => cycleGem(g.key)}>
                    <b>{g.g}</b>
                    <small>{GEM_LABEL[st]}</small>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="ch-row">
          <Btn onClick={() => (edit((x) => A.allMastered(x)), note("Every gem won: the World Flower is complete"))}>All mastered</Btn>
          <Btn note="petals, gems, energy, skills; stars and words stay" onClick={() => (edit(A.resetMastery), note("The mastery model is back to nothing"))}>Reset mastery</Btn>
        </div>
      </Sec>

      <Sec title="Words found" aside={<>{Object.values(s.words).filter((w) => w.ok > 0).length} of {WORDS.length} read</>}>
        <div className="ch-units">
          {UNITS.filter((u) => A.wordsOfUnit(u.id).length).map((u) => {
            const ws = A.wordsOfUnit(u.id).map((w) => w.text);
            const n = ws.filter((w) => (s.words[w]?.ok ?? 0) > 0).length;
            return (
              <div key={u.id} className="ch-unit">
                <span>
                  <b>Unit {u.id}</b> {u.spellings.join(" ")} <span className="ch-dim">{n}/{ws.length}</span>
                </span>
                <button type="button" className="ch-chip" onClick={() => (edit((x) => A.withWords(x, ws, true)), note(`Unit ${u.id}: every word found`))}>all</button>
                <button type="button" className="ch-chip" onClick={() => (edit((x) => A.withWords(x, ws, false)), note(`Unit ${u.id}: no words found`))}>none</button>
              </div>
            );
          })}
        </div>
        <div className="ch-row">
          <Btn onClick={() => (edit((x) => A.withWords(x, WORDS.map((w) => w.text), true)), note("Every word found"))}>Find every word</Btn>
          <Btn onClick={() => (edit((x) => A.withWords(x, Object.keys(x.words), false)), note("No words found"))}>Forget every word</Btn>
        </div>
      </Sec>

      <Sec title="Stickers" aside={<>{s.stickers?.length ?? 0} in the book · shiny: {(s.shiny ?? []).join(", ") || "none"}</>}>
        <div className="ch-row">
          <Btn onClick={() => (edit((x) => A.withStickers(x, A.WARMUP_STICKERS)), note("The warm-ups' picture stickers are in the book"))}>Add the warm-up pictures</Btn>
          <Btn onClick={() => (edit((x) => A.withStickers(x, Object.keys(x.words))), note("Every word met is a sticker"))}>Add every word met</Btn>
          <Btn onClick={() => (edit((x) => A.withStickers(x, null)), note("The Sticker Book is empty"))}>Empty the book</Btn>
          <Toggle label="Shiny fish-dog" on={!!s.shiny?.includes("fishdog")} onChange={(v) => edit((x) => A.withShiny(x, "fishdog", v))} />
          <Toggle label="Shiny moving-up star" on={!!s.shiny?.includes("star")} onChange={(v) => edit((x) => A.withShiny(x, "star", v))} />
        </div>
      </Sec>
    </>
  );
}

// ---------------------------------------------------------------- Time and voice
const SEEN_LABEL: Record<A.SeenFlag, string> = {
  seenIntro: "Film seen (Start skips it)",
  seenTraining: "Training done",
  seenPlacement: "Placement done",
  seenFlower: "World Flower introduced",
  seenBook: "Sticker Book introduced",
  seenTimer: "Timer explained",
  seenStreak: "First streak explained",
};
function TimeTab({ s, note }: { s: Save; note: Note }) {
  const narr = A.gameLedger(s);
  const keys = Object.keys((s as A.CheatSave).narr ?? {}).sort();
  const d = A.daysSinceLastPlay(s);
  const setForm = (id: (typeof GAME_ROWS)[number]["id"], form: A.GameForm) => (edit((x) => A.withGameForm(x, form, [id])), note(`${GAMES_NAME(id)}: ${FORM_LABEL[form]}`));
  return (
    <>
      <Sec title="Sessions" aside={<>now {s.sessions} (a session is a tap on the title's Start)</>}>
        <div className="ch-row">
          <button type="button" className="ch-chip" onClick={() => edit((x) => A.withSessions(x, x.sessions - 1))}>−1</button>
          <button type="button" className="ch-chip" onClick={() => edit((x) => A.withSessions(x, x.sessions + 1))}>+1</button>
          {[0, 1, 2, 3, 5, 10, 30].map((n) => (
            <button type="button" key={n} className={`ch-chip ${s.sessions === n ? "on" : ""}`} onClick={() => edit((x) => A.withSessions(x, n))}>{n}</button>
          ))}
        </div>
      </Sec>
      <Sec title="Days since the last play" aside={d === null ? "nothing played yet" : `now ${days(d)}`}>
        <div className="ch-row">
          {[0, 1, 7, 20, 22, 30, 60].map((n) => (
            <button type="button" key={n} className="ch-chip" disabled={d === null} onClick={() => (edit((x) => A.withDaysAway(x, n)), note(n >= 22 ? `${n} days away: every game told before plays its recap, with the Ready hold` : `${n} days away`))}>
              {n === 0 ? "today" : n === 22 ? "22 (recaps)" : `${n} d`}
            </button>
          ))}
        </div>
      </Sec>

      <Sec title="Game introductions" aside="set the form each game's introduction takes next">
        <div className="ch-row">
          <Btn onClick={() => (edit((x) => A.withGameForm(x, "full")), note("Every game: its full, first-time introduction"))}>All first time</Btn>
          <Btn onClick={() => (edit((x) => A.withGameForm(x, "recap")), note("Every game: the recap"))}>All recap</Btn>
          <Btn onClick={() => (edit((x) => A.withGameForm(x, "short")), note("Every game: told twice, the short form"))}>All short (known)</Btn>
        </div>
        <div className="ch-games">
          {GAME_ROWS.map((r) => {
            const e = narr[`game:${r.id}`];
            return (
              <div key={r.id} className="ch-game">
                <div>
                  <b>{r.name}</b>
                  {r.name !== r.id ? <span className="ch-dim"> {r.id}</span> : null}
                  <small>
                    now <b>{A.formNow(s, r.id)}</b> · told {e?.n ?? 0}× · {e?.lastAt ? `played ${days((Date.now() - e.lastAt) / A.DAY)}` : "never played"}
                  </small>
                </div>
                <div className="ch-row">
                  <Toggle label="struggled" on={!!e?.struggled} onChange={(v) => edit((x) => A.withStruggled(x, r.id, v))} />
                  {(["full", "recap", "recap-21", "short"] as const).map((form) => (
                    <button type="button" key={form} className="ch-chip" onClick={() => setForm(r.id, form)}>
                      {form === "recap-21" ? "22 d" : form}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Sec>

      <Sec title="Dosage ledger" aside={<>{keys.length} entries</>}>
        <div className="ch-row">
          <Btn note="letters:*, two-sounds:*" onClick={() => (edit((x) => A.withLedgerReset(x, "letters")), note("The two-letter reminders start again"))}>Reset the letters reminders</Btn>
          <Btn note="jump-offer" onClick={() => (edit((x) => A.withLedgerReset(x, "jump-offer")), note("The jump-ahead offer can come again"))}>Reset the jump offer</Btn>
          <Btn note="gem energy, Baron's motive, first Readies…" onClick={() => (edit((x) => A.withLedgerReset(x, "once")), note("The once-only explanations are due again"))}>Reset the other explanations</Btn>
          <Btn note="games back to first time too" onClick={() => (edit((x) => A.withLedgerReset(x, "all")), note("The ledger is empty"))}>Clear the whole ledger</Btn>
        </div>
        <details className="ch-details">
          <summary>Every entry</summary>
          <div className="ch-ledger">
            {keys.map((k) => {
              const e = (s as A.CheatSave).narr![k];
              return (
                <div key={k} className="ch-entry">
                  <code>{k}</code>
                  <span className="ch-dim">
                    n {e.n}{e.s?.length ? ` · sessions ${e.s.join(",")}` : ""}{e.struggled ? " · struggled" : ""}
                  </span>
                  <button type="button" className="ch-chip" onClick={() => edit((x) => A.withoutLedgerKey(x, k))}>×</button>
                </div>
              );
            })}
          </div>
        </details>
      </Sec>

      <Sec title="Once-only screens">
        <div className="ch-row">
          {A.SEEN_FLAGS.map((k) => (
            <Toggle key={k} label={SEEN_LABEL[k]} on={!!s[k]} onChange={(v) => edit((x) => A.withSeen(x, k, v))} />
          ))}
          <Btn note={`${s.flowerSeen?.length ?? 0} had${(s as A.CheatSave).tripDue ? ", one due" : ""}`} onClick={() => (edit(A.withoutTrips), note("Every World Flower trip plays again"))}>
            Forget the World Flower trips
          </Btn>
        </div>
      </Sec>
    </>
  );
}
const GAMES_NAME = (id: string) => GAME_ROWS.find((r) => r.id === id)?.name ?? id;

// ---------------------------------------------------------------- Play
function PlayTab({ s, note }: { s: Save; note: Note }) {
  const { n } = useStreak();
  const [overlay, setOverlay] = useState(overlayOn);
  const set = (fn: (x: Save["settings"]) => void) => store.set((x) => fn(x.settings));
  return (
    <>
      <Sec title="Speed" aside={<>now {FAST}× (reloads this screen)</>}>
        <div className="ch-row">
          {[1, 2, 3, 4, 8].map((k) => (
            <button type="button" key={k} className={`ch-chip ${FAST === k ? "on" : ""}`} onClick={() => reloadHere(k)}>
              {k}×
            </button>
          ))}
          <Btn onClick={() => reloadHere()}>Reload this screen</Btn>
        </div>
      </Sec>
      <Sec title="Settings">
        <div className="ch-row">
          <Toggle label="Captions" on={s.settings.captions} onChange={(v) => store.set((x) => void ((x.settings.captions = v), ((x as A.CheatSave).captionsV2 = true)))} />
          <Toggle
            label="Music"
            on={s.settings.music > 0}
            onChange={(v) => {
              const vol = v ? 0.32 : 0;
              set((x) => void (x.music = vol));
              setMusicVolume(vol);
            }}
          />
          <Toggle label="Relaxed (no timers)" on={s.settings.relaxed} onChange={(v) => set((x) => void (x.relaxed = v))} />
          <Toggle label="Unlock every level" on={s.settings.unlockAll} onChange={(v) => set((x) => void (x.unlockAll = v))} />
        </div>
      </Sec>
      <Sec title="Streak" aside={<>now {n} in a row</>}>
        <div className="ch-row">
          {[0, 3, 6, 10].map((k) => (
            <button type="button" key={k} className={`ch-chip ${n === k ? "on" : ""}`} onClick={() => (streak.set(k), note(`Streak ${k}`))}>
              {k === 0 ? "0 (none)" : k === 3 ? "3 (glow)" : k === 6 ? "6 (super)" : "10 (master)"}
            </button>
          ))}
        </div>
      </Sec>
      <Sec title="Hero">
        <div className="ch-row">
          {(["kai", "suki"] as const).map((h) => (
            <button type="button" key={h} className={`ch-chip ${s.hero === h ? "on" : ""}`} onClick={() => store.set((x) => void (x.hero = h))}>
              {h === "kai" ? "Kai" : "Suki"}
            </button>
          ))}
        </div>
      </Sec>
      <Sec title="Live state">
        <div className="ch-row">
          <Toggle label="Show __snState (top centre; stays on across reloads)" on={overlay} onChange={(v) => (showOverlay(v), setOverlay(v))} />
        </div>
      </Sec>
    </>
  );
}

// ---------------------------------------------------------------- Save
function SaveTab({ s, note }: { s: Save; note: Note }) {
  const me = profilesApi.current();
  const players = profilesApi.list();
  const json = useMemo(() => A.exportJson(s), [s]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [ask, setAsk] = useState<null | "import" | "reset" | "wipe">(null);
  const parsed = useMemo(() => (text.trim() ? A.parseSave(text) : null), [text]);
  const reloadTo = (q: string) => {
    store.flush();
    location.assign(location.pathname + q);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      note("The save is on the clipboard");
    } catch {
      note("The clipboard is blocked here: use Download, or copy it from the box");
    }
  };
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    a.download = `superninja-${(me?.name ?? "save").replace(/\W+/g, "-")}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };
  const paste = async () => {
    try {
      setText(await navigator.clipboard.readText());
    } catch {
      note("The clipboard is blocked here: paste into the box instead");
    }
  };
  const doImport = () => {
    if (!parsed?.ok) return;
    A.commit(parsed.save);
    reloadTo("?scene=map");
  };
  const wipe = () => {
    for (const p of profilesApi.list()) profilesApi.remove(p.id); // the current player goes too: nothing is saved after this
    try {
      for (const k of Object.keys(localStorage)) if (k.startsWith("superninja")) localStorage.removeItem(k);
      sessionStorage.removeItem("sn.setup");
    } catch {}
    reloadTo("");
  };
  const confirm = (what: string, yes: () => void) => (
    <div className="ch-confirm">
      <span>{what}</span>
      <button type="button" className="ch-btn danger" onClick={yes}>Yes</button>
      <button type="button" className="ch-btn" onClick={() => setAsk(null)}>Cancel</button>
    </div>
  );
  return (
    <>
      <Sec title="Export" aside={<>{me?.name ?? "no player"} · {(json.length / 1024).toFixed(1)} KB</>}>
        <div className="ch-row">
          <Btn onClick={copy}>Copy to the clipboard</Btn>
          <Btn onClick={download}>Download .json</Btn>
        </div>
        <details className="ch-details">
          <summary>Show the JSON</summary>
          <textarea className="ch-text" readOnly value={json} rows={8} />
        </details>
      </Sec>
      <Sec title="Import" aside="a whole save, or a partial one laid over a blank save">
        <textarea className="ch-text" value={text} placeholder="Paste a save here" rows={5} onChange={(e) => setText(e.target.value)} />
        <div className="ch-row">
          <Btn onClick={paste}>Paste from the clipboard</Btn>
          <Btn disabled={!parsed?.ok} onClick={() => setAsk("import")}>Import into {me?.name ?? "a new player"}</Btn>
          {parsed && !parsed.ok ? <span className="ch-err">{parsed.error}</span> : null}
        </div>
        {ask === "import" && confirm(`Replace ${me?.name ?? "this player"}'s save with the pasted one, then reload on the map?`, doImport)}
      </Sec>
      <Sec title="Players" aside={<>{players.length} on this device</>}>
        <div className="ch-grid">
          {players.map((p) => (
            <Btn
              key={p.id}
              on={p.id === me?.id}
              note={<>{p.hero ?? "no hero"} · played {days((Date.now() - p.last) / A.DAY)}</>}
              onClick={() => {
                if (p.id === me?.id) return note(`${p.name} is playing already`);
                profilesApi.select(p.id);
                reloadTo("?scene=title");
              }}
            >
              {p.name}
            </Btn>
          ))}
        </div>
        <div className="ch-row">
          <input className="ch-input" value={name} maxLength={16} placeholder="New player's name" onChange={(e) => setName(e.target.value)} />
          <Btn
            disabled={!name.trim()}
            onClick={() => {
              profilesApi.create(name);
              reloadTo("?scene=title");
            }}
          >
            Create and switch
          </Btn>
        </div>
      </Sec>
      <Sec title="Reset">
        <div className="ch-row">
          <Btn className="danger" onClick={() => setAsk("reset")}>Reset {me?.name ?? "this player"}'s progress</Btn>
          <Btn className="danger" onClick={() => setAsk("wipe")}>Delete everything on this device</Btn>
        </div>
        {ask === "reset" && confirm(`Wipe ${me?.name ?? "this player"}'s progress (the player stays)?`, () => (store.reset(), reloadTo("?scene=title")))}
        {ask === "wipe" && confirm("Delete every player and every save on this device?", wipe)}
      </Sec>
    </>
  );
}
