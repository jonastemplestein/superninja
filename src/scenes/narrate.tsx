// The narrative audit's runtime for the level scenes (docs/NARRATIVE_AUDIT.md). The rules and the lines are data in
// src/content/narrative.ts; this file keeps the per-save ledger of which explanations a child has heard IN FULL (so a
// level restart doesn't repeat a long introduction, and spaced reminders come back on schedule), and draws the two
// pictures that go with explanations: a gem filling up (the first time the child's answers fill one) and a gold arrow
// sweeping left to right (the left-to-right reminder).
//
// The ledger lives in the child's save (`narr`, per profile, wiped with the save). It is a stopgap until the core's
// director and ledger (docs/ARCHITECTURE.md §6) take over dosage; the keys are the notions the audit names. From 26
// Sep 2026 every telling also records its session (SCRIPT_FIXES A1), and the teacher's voice keeps one entry per game
// type, `game:<id>` (docs/TEACHER_SCRIPT.md §2.2: gameForm, framed, played).
import { useEffect, useState, useSyncExternalStore } from "react";
import { store, levelGains, ENERGY_FULL, type Save } from "../engine/store";
import { LEVELS, type Level } from "../content/worlds";
import { GRAPHEMES, gpcKey, teachEntry, type PhonemeId, type Seg } from "../content/phonics";
import { STRETCHED } from "../content/stretch";
import { LINES } from "../content/lines";
import { canBe, sameSpelling } from "../content/teach";
import {
  SESSIONS, afterWord, due, dueInSessions, frameForm, letterCount, lettersForm, lettersLine, lettersKey, openingForm, otherSound, recapHold,
  splitsSpelling, told, twoSoundsKey, type AfterWord, type FrameForm, type GameExposure, type LettersSaid, type Spacing,
} from "../content/narrative";
import { GAMES, GAMES_MIGRATED, framedEntry, gameKey, gamesOfLevel, migrateGames, playedEntry, previewOf, readyLine, type GameId, type LineSlots } from "../content/games";
import { say, sfx, type Say, type SoundAt } from "../engine/audio";
import { correction, praiseFor, praiseWanted, resetPraise, type CorrectionAt, type PraiseOpts } from "../engine/feedback";
import { gemByKey, energyOf } from "../engine/gems";
import { GemIcon } from "../ui/Gem";
import { petalColour } from "../ui/petal";
import { FAST } from "../engine/fast";
import { fx, fxDom, stageRect } from "../ui/ui";
import { holdNext, type Anchor } from "../ui/nav";

const HAS = new Set(LINES.map((l) => l.id));

// ---------------------------------------------------------------- the ledger
type Ledger = Record<string, GameExposure>;
type WithLedger = Save & { narr?: Ledger };
const ledger = (): Ledger => (store.get() as WithLedger).narr ?? {};
/** Has the child heard this explanation in full at least once? */
export const heardBefore = (key: string) => (ledger()[key]?.n ?? 0) > 0;
/** How many times (a count of events, e.g. Gem Trials run out of hearts, uses the same ledger). */
export const timesHeard = (key: string) => ledger()[key]?.n ?? 0;
/** The current session (store.sessions: +1 at each title tap). */
export const sessionNow = (): number => store.get().sessions ?? 0;
/** A once-per-save moment (TEACHER_SCRIPT §2.2: `ready:first`, `ready:paw`, `sym:<name>`, `map:next:<game>`, the
 *  reward leads) that hasn't happened yet. Record it with heard(key) once it has been said in full. */
export const onceInSave = (key: string): boolean => !heardBefore(key);

/** The level being played: its place in LEVELS (a review or Gem Trial counts as the level it follows), and how many
 *  reminders of each kind it has had. */
const cur = { index: 0, family: new Map<string, number>() };
/** The spellings whose teach moment fell in a session (g → session): a reminder is for another day (SCRIPT_FIXES C4). */
const taughtIn = new Map<string, number>();
/** Call at the start of every level (during the scene's first render, before its children ask anything). */
export function beginLevel(l: Level) {
  const i = LEVELS.findIndex((x) => x.id === l.id);
  const up = l.upTo ? LEVELS.findIndex((x) => x.id === l.upTo) : -1;
  cur.index = i >= 0 ? i : up >= 0 ? up : LEVELS.length;
  cur.family.clear();
  for (const t of l.teach ?? []) taughtIn.set(teachEntry(t).g, sessionNow());
  resetPraise();
}

/** A kind of reminder, capped per level so a level full of two-letter spellings doesn't turn into a lecture: one
 *  read-back reminder a level (SCRIPT_FIXES C4), and two a session across every spelling (READBACK_PER_SESSION). */
export type Family = { name: string; cap: number };
export const LETTERS: Family = { name: "letters", cap: 1 };
export const READBACK_PER_SESSION = 2;
const perSession = { session: -1, n: 0 };
const sessionCount = () => (perSession.session === sessionNow() ? perSession.n : 0);
const bumpSession = () => {
  const s = sessionNow();
  if (perSession.session !== s) {
    perSession.session = s;
    perSession.n = 0;
  }
  perSession.n++;
};

/** Is this explanation due now? */
export function isDue(key: string, spacing: Spacing, family?: Family): boolean {
  if (family && (cur.family.get(family.name) ?? 0) >= family.cap) return false;
  return due(ledger()[key], cur.index, spacing);
}
/** Record that an explanation has been heard in full (call it once its say() has resolved true), with its session. */
export function heard(key: string, family?: Family) {
  if (family) cur.family.set(family.name, (cur.family.get(family.name) ?? 0) + 1);
  const session = sessionNow();
  store.set((s) => {
    const l = ((s as WithLedger).narr ??= {});
    l[key] = told(l[key], cur.index, session);
  });
}
/** Say an explanation if it is due, and record it only if it was heard in full. Resolves true if it was said. */
export async function explain(key: string, spacing: Spacing, items: Say[], family?: Family): Promise<boolean> {
  if (!isDue(key, spacing, family)) return false;
  const ok = await say(items);
  if (ok) heard(key, family);
  return ok;
}

// ---------------------------------------------------------------- what to say
/** "It's two letters, but it's one sound." (teach.ts wording); < x >: "This spelling is two sounds together!" /k/ /s/,
 *  both petals at `at`. */
export function lettersSay(seg: Pick<Seg, "g" | "p">, at?: SoundAt): Say[] {
  const id = lettersLine(seg);
  if (!id) return [];
  const pop = (p: PhonemeId): Say => ({ sound: p, show: "petal", ...(at ? { at } : {}) });
  return seg.g === "x" ? [{ line: id }, { gap: 250 }, pop("k"), { gap: 220 }, pop("s")] : [{ line: id }];
}

/** The letters lines said lately, in game time (SCRIPT_FIXES A2's `recent`): the Learn, the sort, the reminders and
 *  the two-letter corrections all push here, so the next one knows what was just said. */
const recentLetters: LettersSaid[] = [];
/** Game time: the time the child hears (the fast-forward factor included). */
const gameNow = () => performance.now() * FAST;
const noteLetters = (form: LettersSaid["form"], n: number) => {
  recentLetters.push({ at: gameNow(), form, n });
  if (recentLetters.length > 12) recentLetters.splice(0, recentLetters.length - 12);
};
/** Was this spelling taught in this session (its teach moment, or a level that teaches it)? `key` is a spelling, or
 *  its `letters:` or `two-sounds:` key. (A session is one run of the game from its title tap, so the memory needn't
 *  outlive the page.) */
export function taughtThisSession(key: string): boolean {
  return taughtIn.get(key.replace(/^(letters|two-sounds):/, "")) === sessionNow();
}
/**
 * A spelling's letters line at its teach moment (SCRIPT_FIXES A2, C2): in full; "This one's two letters too, but it's
 * just one sound." for the second two-letter spelling within two minutes; nothing when two such lines fell in the last
 * minute (the letters are on screen). Marks the spelling as taught this session, and notes the line in the recent
 * list. Record the telling with heard(lettersKey(g)) once the say() has resolved true (only when this returned
 * something).
 */
export function lettersFor(seg: Pick<Seg, "g" | "p">, o: { at?: SoundAt } = {}): Say[] {
  taughtIn.set(seg.g, sessionNow());
  if (!lettersLine(seg)) return [];
  let form = lettersForm(seg, recentLetters, gameNow());
  if (form === "too" && !HAS.has("st_two_letters_too")) form = "none";
  noteLetters(form, letterCount(seg.g));
  return form === "full" ? lettersSay(seg, o.at) : form === "too" ? [{ line: "st_two_letters_too" }] : [];
}

/** The per-level and per-session caps on read-back reminders. */
const reminderRoom = () => (cur.family.get(LETTERS.name) ?? 0) < LETTERS.cap && sessionCount() < READBACK_PER_SESSION;
/** A read-back reminder: the slot to light, its sound, what to say, and done() to call once it was heard in full. */
export interface Reminder { i: number; p: PhonemeId; say: Say[]; done: () => void }
/**
 * A two-letter (or three-letter, or < x >) reminder for one of a word's spellings, if one is due (SCRIPT_FIXES C4,
 * Dec4): spaced in sessions (its teach moment, then the first word with it in each of the next two sessions), never
 * for a spelling taught this session, one a level and two a session. It ends on the sound, a petal that pops above
 * the lit tile (`at(i)`): "It's two letters, but it's one sound. /sh/". Not marked heard until done() is called; a
 * reminder that doesn't fit this word (afterWordSay) simply comes with the next one.
 */
export function lettersReminder(segs: readonly Seg[], at?: (i: number) => SoundAt): Reminder | null {
  if (!reminderRoom()) return null;
  for (const [i, seg] of segs.entries()) {
    if (!lettersLine(seg)) continue;
    const key = lettersKey(seg.g);
    if (taughtThisSession(key) || !dueInSessions(ledger()[key], sessionNow(), SESSIONS.reminder)) continue;
    const a = at?.(i);
    const end: Say[] = seg.g === "x" ? [] : [{ gap: 250 }, { sound: seg.p, show: "petal", ...(a ? { at: a } : {}) }];
    return { i, p: seg.p, say: [...lettersSay(seg, a), ...end], done: () => (heard(key, LETTERS), bumpSession(), noteLetters("full", letterCount(seg.g))) };
  }
  return null;
}
/** "This can be /th/, but in this word, it's /dh/." for a word with a two-sound spelling, when due: the same schedule
 *  and caps as lettersReminder; both sounds are petals (a contrast pair) at `at(i)`. */
export function twoSoundsReminder(segs: readonly Seg[], at?: (i: number) => SoundAt): Reminder | null {
  if (!reminderRoom()) return null;
  for (const [i, seg] of segs.entries()) {
    const other = otherSound(seg);
    if (!other) continue;
    const key = twoSoundsKey(seg.g);
    if (taughtThisSession(key) || !dueInSessions(ledger()[key], sessionNow(), SESSIONS.reminder)) continue;
    return { i, p: seg.p, say: canBe(other, seg.p, at?.(i)), done: () => (heard(key, LETTERS), bumpSession()) };
  }
  return null;
}
/** Concept 4 at the teaching moment: "The same spelling can sometimes be… /th/ …in moth, and sometimes… /dh/ …in this."
 *  (SCRIPT_FIXES C20; both sounds petals at `at`). */
export const sameSpellingSay = (g: string, first: Seg["p"], then: Seg["p"], at?: SoundAt): Say[] => sameSpelling(g, first, then, { at }).say;

/** A spelling correction (engine/feedback.ts, whose "listen again" leads rotate so a second listening correction is
 *  said in other words). A tile that splits a two-letter spelling gets "That's… /s/ We need… /sh/ It's two letters, but
 *  it's one sound." on any miss (SCRIPT_FIXES C5): reveal and glow the right tile for it on the first miss (see
 *  revealsNow). Every sound is a petal: `at.wrong` above the tapped tile, `at.slot` above the slot being filled. The
 *  split explanation counts in the recent letters lines, never against the reminders' schedule. `_word` identifies
 *  the word being spelt (kept for the callers; the rotation needs no memory of it). */
export function correctionFor(g: string, need: Seg, text: string, attempt: number, _word?: unknown, at: CorrectionAt = {}): Say[] {
  const c = correction(g, need, text, attempt, at);
  if (isSplit(g, need)) noteLetters("full", letterCount(need.g));
  return c;
}
/** A split spelling (the same-sound correction wins over it: < s > for < ss > is "a spelling of that sound too"). */
const isSplit = (g: string, need: Seg) => splitsSpelling(g, need) && GRAPHEMES[g] !== need.p;
/** Does this miss reveal (and glow) the right tile at once? The second miss always; a split spelling on the first. */
export const revealsNow = (g: string, need: Seg, attempt: number): boolean => attempt > 1 || isSplit(g, need);
/** Help for a child who is spelling a word: the whole word again (stretched where we have it), and a question about
 *  the slot they're on. Never the word's sounds one by one: that would do the segmenting for them. */
export const spellingHelp = (word: string): Say[] => [{ line: STRETCHED.has(word) ? "audit_spelling_help" : "audit_spelling_help_plain" }, { gap: 150 }, { stretch: word }];

/**
 * After a word's read-back (SCRIPT_FIXES A7, C4.4): says at most one of the reminder, the gem's first-fill explanation
 * and praise, and nothing when a streak tier-up or "Ninjas read this way!" already spoke for the word. What doesn't fit
 * is deferred (a reminder isn't marked heard, the gem waits for the next word). Counts the right answer for the praise
 * rhythm either way. Resolves with what it said.
 */
export async function afterWordSay(o: { tierUp: boolean; leftRight: boolean; reminder: Reminder | null; gemFirst: (() => Promise<void>) | null; closingNext?: boolean; game?: GameId; praise?: Omit<PraiseOpts, "replaced" | "closingNext"> }): Promise<AfterWord | null> {
  const p: PraiseOpts = { ...o.praise, game: o.game ?? o.praise?.game, closingNext: o.closingNext };
  const pick = afterWord({ tierUp: o.tierUp, leftRight: o.leftRight, reminder: !!o.reminder, gemFirst: !!o.gemFirst, praise: praiseWanted(p) }).say;
  if (pick === "praise") {
    const line = praiseFor(p);
    if (line) await say({ line });
    return line ? "praise" : null;
  }
  // something else speaks for this answer (or nothing does): it still counts for the praise rhythm
  praiseFor({ ...p, replaced: pick !== null || o.tierUp || o.leftRight });
  if (pick === "reminder" && o.reminder) {
    if (await say(o.reminder.say)) o.reminder.done();
    return "reminder";
  }
  if (pick === "gem-first" && o.gemFirst) {
    await o.gemFirst();
    return "gem-first";
  }
  return null;
}

// ---------------------------------------------------------------- the teacher's voice: one entry per game type
/** Old saves retire the games they have stars in (TEACHER_SCRIPT §2.2; games.ts migrateGames). Reading applies the
 *  migration without writing (a scene may ask during its render); the first telling or play writes it, once per save,
 *  inside the same update (`migrate`). */
const gameLedger = (): Ledger => {
  const l = ledger();
  return l[GAMES_MIGRATED] ? l : { ...l, ...migrateGames(l, store.get().stars ?? {}, LEVELS) };
};
function migrate(s: Save, l: Ledger) {
  if (l[GAMES_MIGRATED]) return;
  Object.assign(l, migrateGames(l, s.stars ?? {}, LEVELS));
  l[GAMES_MIGRATED] = { n: 1, at: [], s: [s.sessions ?? 0] };
}
/** A game type's ledger entry. */
export const gameExposure = (id: GameId): GameExposure | undefined => gameLedger()[gameKey(id)];
/**
 * The form a game's introduction takes now (TEACHER_SCRIPT §2.2): full, recap, short or none. `opening`: the game
 * opens the level, which never opens on "none" (it says at least the short line).
 */
export function gameForm(id: GameId, o: { opening?: boolean } = {}): FrameForm {
  const f = frameForm(gameExposure(id), sessionNow(), Date.now());
  return o.opening ? openingForm(f) : f;
}
/** Does this game's recap get the Ready hold (21 days away, or a struggle last time)? */
export const gameRecapHold = (id: GameId): boolean => recapHold(gameExposure(id), Date.now());
/**
 * The Ready question for a game on this form (TEACHER_SCRIPT §2.3), or null when this form has no hold: the game's
 * own, the save's first two Readies (`tv_ready_first`, then `tv_ready_paw`, which introduces the paw) where the game's
 * own is the generic one, a recap's `tv_ready_go` after 21 days or a struggle, a starting gun. Pass the result's line
 * to holdReady(); pass the whole result to framed() when the child answers.
 */
export function readyAsk(id: GameId, form: FrameForm, slots?: LineSlots): { line: string; once?: "ready:first" | "ready:paw" } | null {
  return readyLine(GAMES[id], form, { recapHeld: gameRecapHold(id), readyFirstDone: !onceInSave("ready:first"), readyPawDone: !onceInSave("ready:paw"), slots });
}
/**
 * A telling of a game has been completed (TEACHER_SCRIPT §2.2): call it when the child answers the full form's Ready
 * hold (▶, a board tap, or a right answer during a hand-over Ready), or, on a recap with no hold, at the child's first
 * answer. At most one telling a session counts (the second must fall in a later session, ARCHITECTURE §6.2), so a
 * second call in the same session only notes the play. `ready`: the readyAsk() that was answered, so the save's first
 * Readies are recorded. It also notes the game as played this session.
 */
export function framed(id: GameId, ready?: { once?: "ready:first" | "ready:paw" } | null) {
  if (ready?.once && onceInSave(ready.once)) heard(ready.once);
  const session = sessionNow(), now = Date.now();
  store.set((s) => {
    const l = ((s as WithLedger).narr ??= {});
    migrate(s, l);
    const k = gameKey(id);
    l[k] = framedEntry(l[k], cur.index, session, now);
  });
}
/** The end of a game's beat or phase (TEACHER_SCRIPT §2.2): when it was last played, and whether the child struggled
 *  (the second-miss help or the 16 s idle point on two of its first three turns: see struggledIn). A struggle brings
 *  back the recap, with its Ready hold, next time. */
export function played(id: GameId, o: { struggled?: boolean } = {}) {
  const session = sessionNow(), now = Date.now();
  store.set((s) => {
    const l = ((s as WithLedger).narr ??= {});
    migrate(s, l);
    const k = gameKey(id);
    l[k] = playedEntry(l[k], session, now, !!o.struggled);
  });
}
/** "Struggled" (TEACHER_SCRIPT §2.2): the second-miss help or the 16 s idle point reached on two of the game's first
 *  three turns. `turns`: per turn, whether it reached either. */
export const struggledIn = (turns: readonly boolean[]): boolean => turns.slice(0, 3).filter(Boolean).length >= 2;
/** The map preview for a stone (TEACHER_SCRIPT §5.8): `tv_map_next_<game>` for a game this child has never played,
 *  once per save per game (recorded under `key` with heard(key) when said in full); null otherwise, or until the
 *  line is recorded. */
export function mapPreview(l: Level): { game: GameId; line: string; key: string } | null {
  const pv = previewOf(l, (id) => !heardBefore(`map:next:${id}`) && (gameExposure(id)?.n ?? 0) === 0 && !gameExposure(id)?.lastAt);
  return pv && HAS.has(pv.line) ? { ...pv, key: `map:next:${pv.game}` } : null;
}
/** The games a level plays, in order (games.ts). */
export const levelGames = (l: Level): GameId[] => gamesOfLevel(l);
/** The first time a gem is ready in this save, "When a gem is full, it glows. Then you can win it in a gem battle!"
 *  (flower_i5, key `gem-battle`), else "A gem is glowing!…" (SCRIPT_FIXES C8.2). Record heard(key) when said. */
export const gemReadyLead = (): { line: string; key: string | null } =>
  onceInSave("gem-battle") && HAS.has("flower_i5") ? { line: "flower_i5", key: "gem-battle" } : { line: "gem_ready", key: null };
/** "Let's see what you won back from Baron Muddle." leads the save's first three rewards that bring a new sound
 *  (TEACHER_SCRIPT §5.7; record heard(TO_REWARD) when said). */
export const TO_REWARD = "reward:to-reward";
export const toRewardDue = (): boolean => timesHeard(TO_REWARD) < 3;

// ---------------------------------------------------------------- pictures: a gem filling up
type GemShow = { id: number; g: string; colour: string; from: number; to: number; x: number; y: number };
let gemShow: GemShow | null = null;
const subs = new Set<() => void>();
const setGem = (g: GemShow | null) => {
  gemShow = g;
  subs.forEach((f) => f());
};
let gemN = 0;
/**
 * The first time the child's right answers fill a gem (once per save, NARRATIVE_AUDIT F04): the gem for one of the
 * word's spellings pops up from where they answered, its ring fills, and Sensei says what it is. It is a held step
 * (docs/NAVIGATION.md §5.0): the gem stays up and the level waits on the green Next arrow; Hear it again pops the gem
 * again, fills it and says the line again; the gem's sound picture sits beside it. `at` is where it appears (stage px).
 * Resolves after Next, or once the screen is left (at once if it isn't due or there's no gem to show).
 * A timed scene must stop its clock while this runs (the Ninja Run's world stops; Gem Trials never explain gems).
 * `navAt: "column"`: Hear it again and Next in the right-hand column, for a screen whose targets fill the nav row.
 */
export async function explainGemEnergy(seg: Seg | undefined, at: { x: number; y: number }, alive: () => boolean = () => true, o: { navAt?: Anchor } = {}): Promise<void> {
  if (!seg || !isDue("gem-energy", "once")) return;
  const key = gpcKey(seg);
  const gem = gemByKey(key);
  if (!gem || store.get().gems.includes(key)) return;
  const to = energyOf(key);
  const from = Math.max(0, to - (levelGains[key] ?? 0) / ENERGY_FULL);
  const show = () => {
    setGem({ id: ++gemN, g: gem.g, colour: petalColour(gem.p) ?? "#ffc53d", from, to: Math.max(to, from + 0.1), x: at.x, y: at.y });
    sfx.sparkle();
    fx.twinkle(at.x, at.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 10, 7, 24);
  };
  let inFull = false;
  const tell = async () => {
    const ok = await say({ line: "audit_gem_first" });
    if (ok && !inFull) {
      inFull = true;
      heard("gem-energy");
    }
  };
  show();
  await tell();
  // hold on the gem until the child taps Next (nothing moves on by itself); Hear it again shows and says it again
  if (alive()) await holdNext("gem-energy", () => (show(), tell()), { sound: gem.p, at: o.navAt });
  setGem(null);
}

/** Mount once in each level scene: draws the narrative's pictures (never takes taps). */
export function NarrOverlay() {
  const g = useSyncExternalStore(
    (f) => (subs.add(f), () => void subs.delete(f)),
    () => gemShow,
  );
  const [full, setFull] = useState(false);
  useEffect(() => {
    setFull(false);
    if (!g) return;
    const t = setTimeout(() => setFull(true), 380);
    return () => clearTimeout(t);
  }, [g?.id]);
  if (!g) return null;
  const S = 150;
  return (
    <div key={g.id} className="pop-in" aria-hidden="true" style={{ position: "absolute", left: g.x - S / 2, top: g.y - S / 2, width: S, height: S, pointerEvents: "none", zIndex: 60, filter: "drop-shadow(0 6px 10px rgba(43,29,20,.35))" }}>
      <GemIcon g={g.g} colour={g.colour} state="charging" energy={full ? g.to : g.from} size={S} />
    </div>
  );
}

// ---------------------------------------------------------------- pictures: an arrow at a slot
/** A gold arrow just under a slot, pointing up at it (put it inside the slot, which is position: relative): the
 *  sounds that sit together, or the slot Help is asking about. Never tappable. */
export function SlotPointer() {
  return (
    <i
      aria-hidden="true"
      style={{
        position: "absolute", left: "50%", bottom: -58, translate: "-50% 0", width: 0, height: 0, pointerEvents: "none", zIndex: 3,
        borderLeft: "26px solid transparent", borderRight: "26px solid transparent", borderBottom: "38px solid var(--gold)",
        filter: "drop-shadow(0 -3px 0 var(--ink)) drop-shadow(0 3px 0 var(--ink))", animation: "bob 1s ease-in-out infinite",
      }}
    />
  );
}

// ---------------------------------------------------------------- pictures: "Ninjas read this way!"
const ARROW = `<svg viewBox="0 0 64 44" width="64" height="44"><path d="M6 22 H44 M34 8 L54 22 L34 36" fill="none" stroke="#2b1d14" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 22 H44 M34 8 L54 22 L34 36" fill="none" stroke="#ffc53d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
/** A gold arrow glides under `el` from its left edge to its right, trailing sparkles. Resolves on arrival. */
export function sweepUnder(el: Element | null | undefined, ms = 1300): Promise<void> {
  const layer = fxDom();
  const r = stageRect(el ?? null);
  if (!layer || !r.w) return Promise.resolve();
  const d = document.createElement("div");
  d.setAttribute("aria-hidden", "true");
  d.style.cssText = "position:absolute;left:0;top:0;width:64px;height:44px;pointer-events:none;z-index:40";
  d.innerHTML = ARROW;
  layer.appendChild(d);
  const y = r.y + r.h + 26;
  const x0 = r.x - 20, x1 = r.x + r.w - 44;
  const t0 = performance.now();
  return new Promise((resolve) => {
    const frame = (now: number) => {
      const t = Math.min(1, ((now - t0) * FAST) / ms);
      const e = t * t * (3 - 2 * t);
      const x = x0 + (x1 - x0) * e;
      d.style.transform = `translate(${x}px, ${y - 22}px)`;
      d.style.opacity = `${Math.min(1, t * 6, (1 - t) * 8 + 0.2)}`;
      if (Math.random() < 0.5) fx.twinkle(x + 10, y, ["#fff4dc", "#ffe38a"], 1, 2, 16);
      if (t < 1 && d.isConnected) requestAnimationFrame(frame);
      else {
        d.remove();
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}
/** The left-to-right reminder with the arrow sweeping under `el`, when it is due: once per land, in lands 1 and 2 only
 *  (NARRATIVE_AUDIT F10, SCRIPT_FIXES C12.3: from land 3 the child reads fluently). Said as a whole sentence, "We start
 *  here, and go this way." (audit_left_right), not the slogan "Ninjas read this way!" (TEACHER_SCRIPT §2.4). Resolves
 *  true if it was said. */
export async function readThisWay(el: Element | null | undefined, world: number): Promise<boolean> {
  if (world > 2) return false;
  const key = `left-right:w${world}`;
  if (!isDue(key, "once")) return false;
  const [ok] = await Promise.all([say({ line: HAS.has("audit_left_right") ? "audit_left_right" : "fm_l2_way" }), sweepUnder(el)]);
  if (ok) heard(key);
  return ok;
}
