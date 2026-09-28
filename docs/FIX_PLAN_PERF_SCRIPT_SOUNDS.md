# Fix plan: performance, what Sensei says, and sound petals

26 September 2026. This plan is for the workflow that runs **after the navigation workflow has finished**. It combines three diagnoses of Jonas's feedback from 26 September into one set of changes, grouped by **file ownership**, so that parallel agents never edit the same file.

> "there are huge performance issues … after I play for a while, my phone melts, basically, and nothing really works anymore" · "if you just look at the transcript of everything that is said to me, it's really pretty bad. It just says, A, two letters, one sound, A, two letters, one sound" · "when showing the student a sound as opposed to a spelling, you always have to show it in the petal shape in all games with the image at the top of the petal or next to it"

| Source | What it gives this plan | Cited here as |
|---|---|---|
| [PERF.md](PERF.md) | root causes 1–9 and "Minor", the soak invariant (§5), a preview of fixes 1–6 | PERF 1 … PERF 9, PERF minor |
| [SCRIPT_STYLE.md](SCRIPT_STYLE.md) | the eight rules, dosage (§4), the target transcripts (§11), the targets (§12) | SS §n |
| [SCRIPT_FIXES.md](SCRIPT_FIXES.md) | helpers A1–A9, the new lines (Part B), fixes C1–C21, the core (Part E), acceptance (Part F) | SF A2, SF C4 … |
| [SOUND_DISPLAY.md](SOUND_DISPLAY.md) | the three sound jobs (§1), 65 rows (§3), the petal spec (§4), cases A1–A15 (§5), the build order (§6) | SD r28, SD §4.5, SD A12 |
| [TEACHER_SCRIPT.md](TEACHER_SCRIPT.md) (added 27 Sep) | the teacher's voice: every game's frame, narrated demo, readiness tap and hand-over; the forms and the `game:<id>` state; 339 new lines. The lane work is §13 | TS §3.5, TS §2.3 |

Read the source for the *why*. This plan says **who changes what**, the **contracts** between lanes, and **how we know it worked**: soak budgets, transcript expectations and frames for every group.

**The findings, briefly.**
- **Performance.** It isn't a particle leak; particles and effect nodes clear every time. The phone never rests: two rAF loops run for ever, and the ninja's aura animates hidden and non-compositable things. Memory also only goes up: decoded speech is never evicted, the title music is decoded for nothing, and every music change leaks an `<audio>` element and two audio nodes. Two screens are heavy: the runner's canvas and the World Flower.
- **Script.** One composed shape is said per chest, per spelling and per trip: "It's two letters, but it's one sound." is said 34 times in 25 minutes. Spacing is counted in levels rather than sessions. Explanations come out of context, lines get cut off, praise is stacked, and a two-letter *error* never gets the two-letter explanation.
- **Teacher's voice** (added 27 Sep, after Jonas's playtest with his 3- and 4-year-old). No game says what it is or who does what, demos are the child's own commands, nothing asks whether the child is ready, and "Listen…" is a bare one-word opener (the first Dojo level starts on it, with an unexplained ear). §13 adds the teacher's introduction to every game, lane by lane.
- **Petals.** Most questions already show the sound's petal. It is missing in rewards, corrections, Help, the "two letters, one sound" reminders and two-sound explanations. Some petal pictures give the answer away, and the pictures are too small on a phone.

---

## 0. How to run it

### 0.1 Phases

| Phase | Who | What | Size |
|---|---|---|---|
| **P0** | one agent | Pre-flight: confirm the navigation workflow is done, build a frozen baseline, start the baseline runs in the background (§0.3) | 20 min, plus background runs |
| **P1** | four agents, in parallel: **F1 Perf**, **F2 Voice**, **F3 Petals**, **F4 Checks** | The foundation: shared engine, content and UI changes, plus the checks (§4, §5) | F1 L, F2 L, F3 M, F4 M |
| **Gate 1** | the P0 agent | `npx tsc -b` clean, `bun test src/core src/content src/engine` green, `bun scripts/treadmill/run.ts --quick` shows no new blockers, and every foundation acceptance item in §5 passes | 15 min |
| **P2** | up to 13 agents, in parallel: **A**; **B1–B4**; **C1–C2**; **D1–D6** | The scenes (§6–§9) | A S, B L, C M, D L |
| **P3** | one agent | Integration: flip the defaults, make the invariants block, wire the treadmill, run the full acceptance, log the decisions (§10) | 2–3 h, mostly runs |

A lane may split its work further, but only if its sub-agents own separate files from the lane's list.

### 0.2 House rules (copy into every brief)

- **Edit only the files your lane owns** (§2). If you need a change in someone else's file, don't make it. Work around it inside your own files, and put the request in your final message; integration collects these requests.
- Never use `rm` (move files to `.trash/`). No `cd … &&` chains. **Never ask Jonas and never wait.** Decide, and put the decision in your final message; integration writes all decisions to `docs/DECISIONS.md`, and nobody else edits that file.
- British English everywhere. Use the Sounds~Write wording (SS §2). Don't commit.
- **Line numbers in the source docs have drifted.** They date from 21:10–21:45 on 26 September, and the navigation workflow kept editing after that. Search for the quoted code or the function name instead.
- Keep your own files clean: `npx tsc -b 2>&1 | grep -E '<your files>'` (other lanes may be mid-edit), `bunx oxlint <your files>`, and `bun test src/core src/content src/engine`.
- **Test on a frozen build, never on the shared dev server**, which reloads the page whenever anyone saves. Use `bun scripts/treadmill/frozen.ts --port <yours>` (F4 writes it in P1). Until it exists, use `bunx vite build --outDir playtest/runs/fix-plan/.build-<lane> --emptyOutDir` and then `bunx vite preview --outDir playtest/runs/fix-plan/.build-<lane> --port <yours> --strictPort`. Rebuild after your edits. If another lane's half-finished edit breaks the build, wait a minute and retry.
- Ports: P0 4280 · F1–F4 4201–4204 · A 4211 · B1–B4 4221–4224 · C1–C2 4231–4232 · D1–D6 4241–4246 · P3 4290. The soak picks its own port (`--port`); pass yours + 100.
- Every pure sound you touch gets a **job**: `show: "petal" | "tile" | "hidden"` (§3.1, SD §1).
- Put what reviewers read (summaries, transcripts, the named stills) under `playtest/fix-plan/<lane>/`. Put bulky output (soak samples, full probe runs with every frame, builds) under `playtest/runs/fix-plan/<lane>/`, which git ignores. Keep the `--out` paths below the same, but swap in `playtest/runs/fix-plan/` for anything over about 20 MB.
- Final message: the IDs you did (and any you skipped, with the reason), decisions, requests for other lanes, and each acceptance result with the path to its evidence.

### 0.3 Pre-flight (P0)

1. **Confirm the navigation workflow has finished.** No agent is editing `src/`, every item in NAVIGATION.md §5 is marked done, and `npx tsc -b` is clean. If NAVIGATION's "Left" items (captions as parts, `PLAY`/`PLAY_CX`) are still open, note it for F1 and F3.
2. **Build the baseline** at port 4280, then start these runs in the background and release P1 straight away (they play the frozen build, so P1's edits can't touch them):
   - `bun scripts/treadmill/soak.ts --mobile --cpu 4 --fast 2 --levels 12 --out playtest/fix-plan/baseline/soak-phone` (about 25 min)
   - `bun scripts/treadmill/soak.ts --fast 2 --levels 20 --out playtest/fix-plan/baseline/soak-desktop`
   - `bun scripts/treadmill/continuous.ts --base http://127.0.0.1:4280 --persona perfect,learner --levels 12 --out playtest/fix-plan/baseline/transcripts`, and again with `--from w5-1 --levels 12` and with `--from w6-br1 --levels 13`
   - `bun scripts/treadmill/script-audit.ts playtest/fix-plan/baseline/transcripts/continuous-*.json --out playtest/fix-plan/baseline/transcripts/script-audit.md`
   - `bun scripts/treadmill/sound-display.ts --base http://127.0.0.1:4280 --out playtest/runs/fix-plan/baseline/sound` (every frame; git-ignored)
3. These baselines are the "before" numbers for every acceptance comparison. The numbers in the three source docs come from earlier snapshots. Where a baseline differs from a doc by more than 20%, write down both.

---

## 1. Decisions this plan makes

Integration logs each of these in `docs/DECISIONS.md`. They are numbered Dec1–Dec10, because D1–D6 are the lanes of group D.

| # | Decision | Why | Reversible by |
|---|---|---|---|
| **Dec1** | **Oral blending shows no petals while the sounds play** (W5, Ninja Run blend mode, the retired Listening Ears). Neutral dots light up one per sound (`SoundDots`). After the right answer, the dots may bloom into petals under the chosen picture. This is SD's open question, decided here as SD A1 recommends. | Several petal pictures are answer cards (/d/ dog, /p/ pig, /a/ apple). The child has to blend by ear. | One constant: `ORAL_BLEND_PETALS = false` in `SoundBadge.tsx` |
| **Dec2** | **The streak's spoken tier-up needs real answers.** Flames still light per letter, as HERO.md designed. But a tier line (streak_6's line, and "You're a ninja master!") is only said once the streak holds at least 4 or 7 **whole answers** (words or items), and at least one of them in the current level. Letter taps pass `part: true`, and errorless "say it with me" taps count for flames only. | SS §8: "You're a ninja master!" after about three words, some of them errorless taps. | `LINE_AFTER` in `streak.ts` |
| **Dec3** | **Sound jobs are explicit.** `{ sound }` gets `show?: "petal" \| "tile" \| "hidden"` and `at?` (an anchor). Until integration, a lone sound with no `show` stays **unclassified**: no automatic pop, and a minor sweep finding. Integration then makes `"petal"` the default (I.1). | If "petal" were the default from day one, every tile's voice in an unmigrated scene would pop a petal while P2 runs. | `DEFAULT_SHOW` in `audio.ts` |
| **Dec4** | **A read-back reminder ends on the sound**: "It's two letters, but it's one sound. /sh/", with the petal popping above the lit tile on "one sound". This settles a difference between SF D3, which has no sound after the line, and SD A15, which plays the sound. | Sounds~Write ends on the sound ("…It's /sh/"), and SS rule 8 ends on the target. The sound also gives the petal something to arrive with. | `lettersReminder` in `narrate.tsx` |
| **Dec5** | **A level speaks only once it is on screen**, and `LevelHost` does the waiting: it mounts the level after App's fade has finished and the map's line has ended (at most 1.5 s). No scene waits by itself (SF C18, its simpler option). | One change in one file (B1) instead of eight scene changes. | `LevelHost` in `App.tsx` |
| **Dec6** | **A teardrop always means a sound** (SD A11). Ninja Run counts stars (`item_star`), not petals. The Dojo's tally becomes two mini petals of the sound being learnt. Confetti and the title drift become round blossom petals, drawn on the canvas and in CSS, so no new art is needed. The rainbow `item_petal` stays only for "all the sounds" (the film, the flower's heart). | "Every petal is one sound" is the metaphor the World Flower rests on. | per call site |
| **Dec7** | **< x > is always a pair**, /k/ + /s/ with a "+". A `SoundBadge` for `ks` or `kw` renders that pair, never a blank petal. `kw` is not retired in content now; SoundBadge just never draws it alone. | SD A9 | `SoundBadge` |
| **Dec8** | **The reward counts sounds, not spellings** (SD A10). "You won back a sound!" for < ai > + < ay >. The save field keeps its name until the next migration. | Otherwise the reward teaches the opposite of the lesson. | `App.tsx` `Reward` |
| **Dec9** | **The jump offer counts as made when it is shown.** `shouldOfferJump` records `jump-offer` with the session when it returns true. It is never offered in the first two sessions, and at most once every two sessions after that (SF A8). | The offer is a button on screen even when its line is cut off. | `gems.ts` |
| **Dec10** | **`soak-fixes.ts` and `--patched` are retired at integration.** Once F1 has landed, a plain soak must match PERF §4's "after" column. | The patches no longer apply once F1 lands. | – |

---

## 2. File ownership

**Nobody edits a file outside their lane.** The P0/P3 agent owns `docs/DECISIONS.md`, `docs/PERF.md`, `docs/SCRIPT_FIXES.md`, `docs/SOUND_DISPLAY.md` and `docs/TREADMILL.md`, and only touches them in P3. Any file not listed here is untouched.

| Lane | Owns | Main topics |
|---|---|---|
| **F1 Perf** | `src/ui/ui.tsx`, `src/ui/Ninja.tsx`, `src/ui/Gem.tsx`, `src/scenes/NinjaDemo.tsx`, `src/styles.css`, `src/engine/audio.ts`, `src/engine/lipsync.ts`, `src/engine/store.ts` | PERF 1–7 and minor; the sound-job contract in audio.ts (§3.1); `fx.trail`; `.glow-pulse`; blossom confetti; caption petals (P3) |
| **F2 Voice** | `src/content/narrative.ts`, `src/content/narrative.test.ts`, `src/scenes/narrate.tsx`, `src/engine/feedback.ts`, `src/engine/streak.ts`, `src/engine/gems.ts`, `src/content/teach.ts`, `src/content/lines.ts` (a new block only), `scripts/gen-teach-lines.ts`, `src/content/teach-lines.gen.ts`, `public/a/l/*` (new clips), `public/a/durations.json`, line tags, `src/core/**` (SF Part E), new tests in `src/engine/*.test.ts` | SF A1–A9, Part B, C3 (teach.ts half), C4, C5, C20; the helper half of C7, C8, C15, C16; Dec2, Dec4, Dec9 |
| **F3 Petals** | `src/ui/SoundBadge.tsx`, `src/ui/petal.ts`, `src/ui/nav.tsx`, `src/styles/nav.css`, `src/scenes/NavDemo.tsx`, `src/content/validate.ts`, `src/content/flower.ts` (read-mostly) | SD §4, §6.1–6.5 and 6.8; the petal pops; `SoundDots`; nav slot sizes; hiding the nav row's duplicate petal; the `__snNavLog` cap |
| **F4 Checks** | `scripts/treadmill/{frozen.ts (new), sweep.ts, soak.ts, soak.vite.config.ts, continuous.ts, script-audit.ts, sound-display.ts, sound-shots.ts, bot.ts, run.ts, inbox.ts, types.ts}` | The new invariants and `--check` modes, the splitter persona, the treadmill wiring |
| **A** | `src/scenes/{Training, OptIn, Placement, Profiles, Setup, Grownups, JumpAhead}.tsx`, `src/styles/{optin, nav-A}.css` | SF C19; SD r46–49, A12 in placement; sound jobs |
| **B1 Shell** | `src/App.tsx`, `src/styles/{shell, nav-B}.css` | SF C6, C7, C18 (Dec5), the App half of C8; SD r58, r60, r61; PERF 5 (title music) |
| **B2 Flower** | `src/scenes/Tree.tsx`, `src/styles/{tree-teach, tree-visit}.css` | SD r51–57; PERF 9; the Tree half of SF C8 |
| **B3 Shows** | `src/scenes/{Intros, IntroFilm, Intro}.tsx` | SF C3 (GemFound), C8 (FlowerIntro); SD r50, r54–56 |
| **B4 Stickers** | `src/scenes/{Stickers, Book}.tsx`, `src/styles/stickers.css` | SD r6, r7, r65; stickers.css animations |
| **C1 Early** | `src/scenes/Early.tsx`, `src/styles/{early, nav-C}.css` | SF C9, C13, C14, C15 (Early); SD r9–17, A12 in the first-sound decks; the `flyTo` trail; the reader animations |
| **C2 Warm-ups** | `src/scenes/Warmup.tsx`, `src/content/warmups.ts`, `src/styles/warmup.css` | SF C17; SD r1–5 (Dec1 dots, W6 mini petals, the introduction animation) |
| **D1 Dojo** | `src/scenes/Dojo.tsx`, `src/styles/{dojo, nav-D}.css` | SF C2, C10, C12, C15, the C4 and C5 callers; SD r18–28, the A11 tally; Dec2 hits |
| **D2 Battle** | `src/scenes/Battle.tsx`, `src/styles/battle.css` | the SF C4, C5 and C15 callers; SD r29–33; PERF minor (charge bar), `bt-orbit`, the trails; Dec2 hits |
| **D3 Swap** | `src/scenes/Swap.tsx`, `src/styles/swap.css` | SF C11, the C4 and C15 callers; SD r34–37; the swap swirl |
| **D4 Sort** | `src/scenes/Sort.tsx`, `src/styles/sort.css` | SF C1; SD r43–45; PERF minor (the falling word) |
| **D5 Run** | `src/scenes/Run.tsx`, `src/styles/run.css` | SF C16, the C4 and C15 callers; SD r38–41, A11; PERF 8 |
| **D6 Story** | `src/scenes/Story.tsx`, `src/styles/story.css`, `src/content/stories.ts` | the SF C4 and C15 callers; SD r42; sound jobs |

**Teacher's voice (§13) adds three files to the lanes:** `src/content/games.ts` (new, F2), `src/ui/poses.ts` (F1) and `scripts/gen-audio.ts` (F2, the short-clip loudness rule only). Every other TV change is inside a file its lane already owns.

Shared CSS: `shell.css` is imported by A's scenes too, but only B1 edits it; A puts its styles in `nav-A.css`. `nav-D.css` belongs to D1; D4 and D5 put their styles in `sort.css` and `run.css`. `styles.css` belongs to F1 alone: F1 fixes every endless animation defined there, whichever scene uses it.

---

## 3. Contracts: what the foundation exports

P2 codes against these names. F-lanes may add to them, but may not rename them. P2 starts only after Gate 1, so everything here exists by then.

### 3.1 The sound's job (F1, `src/engine/audio.ts`); **F1 does this first**, before its perf work, so that F3 can build on it

```ts
export type SoundShow = "petal" | "tile" | "hidden";
/** where a popped petal should stand: an element, or a getter evaluated as the clip is cued */
export type SoundAt = Element | null | (() => Element | null);
export type Say =
  | { line: string } | { word: string } | { stretch: string } | { onset: string }
  | { sound: PhonemeId; show?: SoundShow; at?: SoundAt }            // was { sound }
  | { story: string; page: string; caption?: string } | { gap: number }
  | { sounds: Seg[]; gap?: number; onSeg?: (i: number) => void; show?: "tile" | "hidden" }; // default "tile"
export interface ClipInfo { show?: SoundShow; at?: SoundAt }
/** existing; the second argument is new (sound clips only) */
export function onClip(fn: (id: string, info?: ClipInfo) => void): () => void;
/** Called just before a sound clip marked "petal" plays. A listener that needs a moment (a pop rising) returns the ms
 *  to wait (≤ 250); the sequence waits for the largest. F3's SoundPops uses it. */
export function onSoundCue(fn: (p: PhonemeId, info: ClipInfo) => number | void): () => void;
/** Dec3: the job of a lone { sound } with no `show`; undefined until integration sets it to "petal" */
export let DEFAULT_SHOW: SoundShow | undefined;
```

`window.__audioLog` entries for sounds gain `show` (the resolved job, or `"unclassified"`) and `cued` (the ms waited). `sayBlend` marks its sounds `"tile"`. `{ sounds }` passes `show` through to every sound in the blend.

### 3.2 Effects (F1, `src/ui/ui.tsx`, `src/styles.css`)

- `fx.trail(colour: string, o?: { every?: number; size?: number; life?: number }): (p: Pt) => void` gives a flight's `onFrame` that emits one glow every `every` stage px travelled (default 22), whatever the frame rate. This replaces `onFrame: (p) => fx.glow(...)` (PERF 7).
- `MAX_PARTICLES = 350`: the oldest particles go first.
- `.glow-pulse` (CSS) is a static glow on `::after` whose **opacity** pulses. Set `--glow` (colour), `--glow-r` (spread) and `--glow-t` (period). Use it instead of any `box-shadow` or `filter` keyframes. It needs `position: relative` (or absolute) on its host, and a free `::after`.
- Rule for everyone: **an endless animation goes on an HTML element and animates `transform`/`translate`/`scale`/`rotate`/`opacity` only.** Never animate an SVG element, `z-index`, `box-shadow`, `filter`, `background-position`, `left`/`top` or `width`/`height` for ever. For an SVG, wrap it in a `<span>`/`<i>` and animate the wrapper.

### 3.3 Voice (F2)

`src/content/narrative.ts` gets exactly SF A1–A9: `Exposure.s`, `told(e, at, session)`, `SESSIONS`, `dueInSessions`, `LettersForm`, `lettersForm`, `splitsSpelling`, `praiseDue`, `STEMS`, `stemFor`, `fadeForm`, `AfterWord`, `afterWord`, `arrivalLines`, `rewardLead`, `jumpOfferDue`, `freshWords`. `RUN_BLEND_CUES` also loses `t_listen_for_word` (SF C16).

`src/scenes/narrate.tsx`:
```ts
export const sessionNow: () => number;                                     // store.get().sessions
export function taughtThisSession(key: string): boolean;                    // told in this session's teach moment
/** SF A2 at a teach moment: full → lettersSay(seg) · too → st_two_letters_too · none → []; recorded in recentLetters */
export function lettersFor(seg: Pick<Seg, "g" | "p">, o?: { at?: SoundAt }): Say[];
/** SF C4 + Dec4: spaced in sessions, skips spellings taught this session, 1 a level, 2 a session. `say` ends with
 *  { sound: p, show: "petal", at } so the petal pops on "one sound". Not marked heard until done() is called. */
export function lettersReminder(segs: readonly Seg[], at?: (i: number) => SoundAt): { i: number; p: PhonemeId; say: Say[]; done: () => void } | null;
export function twoSoundsReminder(segs: readonly Seg[], at?: (i: number) => SoundAt): { i: number; p: PhonemeId; say: Say[]; done: () => void } | null; // both sounds "petal" (a contrast pair)
/** SF C5 + SD r23/r27: the split-spelling case first; every sound marked "petal" with its anchor */
export function correctionFor(g: string, need: Seg, text: string, attempt: number, word: unknown, at?: { wrong?: SoundAt; slot?: SoundAt }): Say[];
export function sameSpellingSay(g: string, first: PhonemeId, then: PhonemeId, at?: SoundAt): Say[]; // SF C20 for < th >; sounds "petal"
/** SF A7 as a helper the scenes call after a word's read-back: says at most one thing, returns what it said */
export async function afterWordSay(o: { tierUp: boolean; leftRight: boolean; reminder: ReturnType<typeof lettersReminder>; gemFirst: (() => Promise<void>) | null; closingNext?: boolean }): Promise<AfterWord | null>;
export async function readThisWay(el, world): Promise<boolean>;             // unchanged signature; false for world > 2
```

`src/engine/feedback.ts`: `correction(g, need, word, attempt)` gains the split case (SF C5). `praiseFor(o: { replaced?: boolean; closingNext?: boolean; every?: number }): string | null` is new, and `resetPraise()` is called by `beginLevel`.

`src/engine/streak.ts` (Dec2): `HitOpts.part?: boolean` counts for flames and n but not as an answer. `streak.answer()` completes one whole answer; call it after a word's part hits, whether or not a tier was crossed. `streak.answers` is a getter. A plain `hit()` without `part` still counts as one answer, so legacy scenes keep working. `tierLineId(tier)` returns null (a silent power-up) until `answers >= LINE_AFTER[tier]`, with `LINE_AFTER = [0, 0, 4, 7]`, and until at least one answer has come in this level.

`src/engine/gems.ts`: `shouldOfferJump(s)` also requires `jumpOfferDue(...)`, and records the offer when it returns true (Dec9).

`src/content/teach.ts`: `introGem(…, { facts?: boolean })`, `foundScript(items, { justTaught?: ReadonlySet<string>, used?: Set<string> })`, and `sameSpelling` in five clips for < th >. Sounds in the trip scripts are marked `"petal"`.

New lines (SF Part B, all 20) live in one block at the end of `LINES`: `// --- Script style (docs/SCRIPT_STYLE.md, 26 Sep). Owned by the script fixes; edit only this block.` They are recorded and have durations and tags by Gate 1.

### 3.4 Petals (F3, `src/ui/SoundBadge.tsx`, `src/ui/nav.tsx`, `src/ui/petal.ts`)

```tsx
<SoundBadge p tier?="hero" | "turn" | "header" | "pop" | "mini" size? intro? unknown? pulse? still? onTap? />
//   default widths: hero 220, turn 104, header 104, pop 104, mini 72 (stage px); picture 70% in the round top;
//   the speaker glyph only from 160 px; `unknown`: grey-lilac mist with "?"; `intro`: the introduction animation
//   (SD §4.6), keyed to the next `sound:<p>` clip; p "ks"/"kw" render a SoundPair (Dec7)
<SoundPair a b mode="contrast" | "together" tier? />              // SD §4.5; each half appears and swells on its own clip
<SoundDots n lit />                                               // Dec1: neutral dots, one per sound, `lit` = index lit
popSound(p: PhonemeId, at: SoundAt, o?: { with?: PhonemeId; mode?: "contrast" | "together" }): Promise<void>
useSoundAnchor(ref: RefObject<Element>)                           // the scene's default spot for a pop
iconWordOf(p: PhonemeId): string | null                           // the petal picture's word (petal.ts), for SD A12
```

`<SoundPops/>` is mounted by `NavLayer`. On a `"petal"` cue for `p`: if a visible `[data-p="p"]` petal (a SoundBadge, a BigPetal or a chart petal) is already on screen, it waits 0 ms and lets that petal swell. Otherwise it pops a `pop`-tier petal above `at` (or the scene's anchor, or left of Sensei at 1080, 470) and asks for 150 ms. A second `"petal"` cue for a different sound in the same `say()`, within 3 s, turns the pair into a contrast: the first petal dims and shakes. `{ sound: "ks" }` pops the /k/ + /s/ pair. A pop leaves 700 ms after its clip ends (SD §4.4).

The nav row: `row.sound` and `top-right.sound` are 104 wide, `side.sound` 96 (SD §4.2). The nav row hides its own petal while a hero, BigPetal or pop of the **same** sound is visible (SD A7).

---

## 4. Foundation lanes: the changes

IDs are what each lane reports against. **P1** means Jonas's complaint directly, **P2** is heard or seen every few minutes, **P3** is smaller. Do P1 and P2; do P3 if there is time, and say which were skipped.

### 4.1 F1 Perf (`ui.tsx`, `Ninja.tsx`, `Gem.tsx`, `NinjaDemo.tsx`, `styles.css`, `audio.ts`, `lipsync.ts`, `store.ts`)

| ID | P | Source | Change (search anchor) |
|---|---|---|---|
| F1.0 | P1 | §3.1 | The sound-job contract in `audio.ts`, done first: `SoundShow`, `SoundAt`, `ClipInfo`, `onClip`'s info, `onSoundCue` (awaited in `sayNow` before a "petal" sound, max 250 ms), `DEFAULT_SHOW`, and the `__audioLog` fields. Tell F3 when it's in. |
| F1.1 | P1 | PERF 1 | `FxLayer` sleeps when there are no particles and wakes on the first new one. `MAX_PARTICLES = 350`. Every `particles.push(` in `fx.*` goes through `add()`. Anchor: `raf = requestAnimationFrame(loop)`. |
| F1.2 | P1 | PERF 2 | `lipsync.ts` `tick` runs only while speech plays: it sleeps after about 30 quiet frames with the mouth shut, and `wakeLipsync()` is called from `playBuffer` when `bus === speechBus`. Anchor: `requestAnimationFrame(tick);` at the top of `tick`. |
| F1.3 | P1 | PERF 3 | The aura only animates at the tiers that show it: `nj-swirl` (rays), `nj-rise` (sparks) and `nj-orbit` are `paused` below their tier. `z-index` comes out of `@keyframes nj-orbit`; if the dots must pass behind the ninja, use two orbit containers (PERF 3). Better still, render sparks and orbit only at their tiers, with a CSS fade-in on mount. |
| F1.4 | P1 | PERF 4 | Flames: `Flame` wraps its `<svg>` in `<i className="nj-flick">`, and `nj-flicker` and `nj-pend` animate the wrapper. The drop-shadow filter stays on the static svg. Flames are positioned with `transform`, not `transition: left, top` (PERF minor). |
| F1.5 | P1 | PERF 5 | The decoded-audio LRU (40 MB budget) in `load()`. A buffer that is playing survives through its source node. The App half (the title music) is B1.1. |
| F1.6 | P1 | PERF 6 | `playMusic` uses two decks, made once and reused. No new `Audio` or `createMediaElementSource` per change. |
| F1.7 | P2 | PERF 7 | `flash()`: no `mix-blend-mode` (normal blending at the same alpha), or drawn on the particle canvas. Drop `.fx-dom > * { will-change }` and set it in `fly()` only. `owned`: delete an effect node when it removes itself. Every `onFrame: (p) => fx.glow(...)` in `Ninja.tsx` becomes `fx.trail(...)` (§3.2). |
| F1.8 | P2 | PERF 4 list | Endless animations defined in `styles.css` that the compositor can't run, rebuilt on HTML wrappers or with `.glow-pulse`: `.help-waves path` (`wave`; three HTML arcs, opacity and scale), `.gem-liquid` (`gem-slosh`; in `Gem.tsx`, move the liquid's wave to an HTML layer translated with `transform`), `hintglow` (`.tile.hint`), `gemready`, `gemwon`, `rw-gem-pulse`, `vpulse`. Check the others the soak reports from `styles.css`. |
| F1.9 | P2 | PERF minor | `store.ts`: cap `adjustLog` at 200 entries (keep the newest). |
| F1.10 | P3 | Dec6 | Confetti: the `fx` "petals" burst draws round blossom petals (an ellipse with a notch, in pinks) instead of `item_petal`. |
| F1.11 | P3 | SD r62 | Captions (grown-ups' setting): if NAVIGATION hasn't done "captions as parts", `SenseiDock` draws a sound as a 34 px still petal (`SoundBadge still`), and `audio.ts` builds its captions from parts. |
| F1.12 | P2 | – | `NinjaDemo.tsx`: add `?tier=` and `?strike=1` query options so F4's stills can freeze each tier (§5.1 frames). |

### 4.2 F2 Voice (`narrative.ts` + test, `narrate.tsx`, `feedback.ts`, `streak.ts`, `gems.ts`, `teach.ts`, the `lines.ts` block, generated teach lines, `src/core`)

| ID | P | Source | Change |
|---|---|---|---|
| F2.1 | P1 | SF A1–A9 | The helpers, exactly as written in SF, with every test SF lists in `narrative.test.ts`. |
| F2.2 | P1 | SF Part B | The 20 new lines in their own block at the end of `LINES`. Record them with `bun scripts/gen-audio.ts` (the usual route and voice), then run `bun scripts/gen-durations.ts` and `bun scripts/sim/tag-lines.ts --missing`, and lint the new lines with `jev-lint-lines.ts`. Every caller guards with `HAS`/`L()`, so the code never depends on the audio. |
| F2.3 | P1 | SF C4, Dec4 | `narrate.tsx`: `heard` records the session. `lettersReminder` and `twoSoundsReminder` use `dueInSessions(…, SESSIONS.reminder)`, skip a spelling taught this session, cap one a level and two a session, take anchors, and end on the petal sound (Dec4). `LETTERS.cap = 1`. |
| F2.4 | P1 | SF A2, C2 | `recentLetters` (a module list of `{ at, form, n }` in game time) and `lettersFor(seg)` (§3.3). The Dojo's Learn (D1.1) and Sort (D4.1) call it; `correctionFor` also records into it. |
| F2.5 | P1 | SF C5 | `feedback.ts` `correction()`: the split-spelling case goes before the attempt branches: `thats` /wrong/ · `we_need` /need/ · `lettersSay(need)`. It counts in `recentLetters` only, never against the session schedule. `correctionFor` passes the anchors (§3.3) and marks both sounds `"petal"`. |
| F2.6 | P1 | SF C3 | `teach.ts`: `introGem({ facts })`; `foundScript({ justTaught, used })`, which leads a just-taught known sound's gem with `wf_found_gem` + sound + `tg_<k>_like` (no `same_sound_new`, no second "This is the way we spell…"); two or more new sounds lead with `st_found_new_sounds` and `st_another_new_sound`; `freshWords` across the trip. In `gen-teach-lines.ts`, `gem:t>t` gets a first example other than "mat" (for example "tap"); regenerate `teach-lines.gen.ts` and record any new clip. |
| F2.7 | P2 | SF C20 | `sameSpelling()` for < th > in five clips: `t_same_spelling_sometimes`, /th/, `st_th_moth_sometimes`, /dh/, `tg_th_dh_in`. Both sounds `"petal"`. `canBe()` stays as it is, with its sounds marked `"petal"`. |
| F2.8 | P2 | SF A4, C15 | `praiseFor()` and `resetPraise()` in `feedback.ts`. `pickPraise()` stays for the few places that must praise. |
| F2.9 | P2 | SF A7, C4.4 | `afterWordSay()` in `narrate.tsx` (§3.3): at most one of the reminder, the gem's first fill and praise after a word; nothing when a tier-up or "Ninjas read this way!" spoke. What doesn't fit is deferred, not marked heard. |
| F2.10 | P2 | SF C12.3 | `readThisWay()` returns false for `world > 2`. |
| F2.11 | P2 | Dec2 | `streak.ts`: `part`, `answer()`, `answers`, and `LINE_AFTER` gating in `tierLineId` (§3.3). Tests in `src/engine/streak.test.ts`. |
| F2.12 | P2 | Dec9, SF C7.2 | `gems.ts` `shouldOfferJump`: `jumpOfferDue` gating, and record the offer. |
| F2.13 | P2 | SD A6 | `narrate.tsx` `explainGemEnergy`: the gem's colour comes from `petalColour` (not `PHONEMES[].colour`). |
| F2.14 | P3 | SF Part E | `src/core`: the `idea:two-letters-one-sound` dosage, `Dosage.reminders: "error"`, `Attempt.errors` gains `split-spelling`, the line tags for the new lines, and the `echo` audit rule. `bun test src/core` stays green. |

### 4.3 F3 Petals (`SoundBadge.tsx`, `petal.ts`, `nav.tsx`, `nav.css`, `NavDemo.tsx`, `validate.ts`, `flower.ts`)

| ID | P | Source | Change |
|---|---|---|---|
| F3.1 | P1 | SD §4.2, §6.1 | `SoundBadge`: `tier` defaults, picture at 70% centred in the round top, the speaker only from 160 px, `unknown` mist with "?", no blank petal ever (an unknown `p` shows mist). |
| F3.2 | P1 | SD §4.6 | The introduction animation (`intro`): the mist first, then on the `sound:<p>` clip start the mist wipes up, the colour fills from the point, the picture pops (0.4 → 1.12 → 1) and `fx.ring` fires in the chart colour with six twinkles. Then a slow breathing pulse until the first tap. With reduced motion, a 300 ms cross-fade. Transform and opacity only. |
| F3.3 | P1 | SD §4.5, Dec7 | `SoundPair` (contrast and together); `ks` and `kw` render as a pair. |
| F3.4 | P1 | SD §4.4, §6.3, §6.5 | `SoundPops` in `NavLayer`: the cue listener (§3.4), `popSound`, `useSoundAnchor`, and the fallback spot. A pop never covers its letters: it stands 12 px above the anchor's top edge, with a small tail pointing at it. |
| F3.5 | P1 | Dec1 | `SoundDots` (neutral dots, lit in turn) and `ORAL_BLEND_PETALS = false`. |
| F3.6 | P2 | SD §4.2 | `nav.tsx` slots: `row.sound` 104, `top-right.sound` 104, `side.sound` 96. Check they stay clear of the caption bubble (bottom edge 562) and of Next (x ≥ 964). |
| F3.7 | P2 | SD A7 | The nav row hides its petal while a hero, BigPetal or pop of the same sound is visible. |
| F3.8 | P2 | SD A12 | `iconWordOf(p)` in `petal.ts`, from `CHART_PETALS`. `validate.ts` gets a report-only check that lists first-sound decks and placement rounds whose options include the target petal's icon word. It is not a build failure: C1 and A remove those words at runtime. |
| F3.9 | P2 | PERF minor | `__snNavLog`: keep the last 500 entries. |
| F3.10 | P2 | – | `NavDemo.tsx` `?badges=1`: one row per tier, a pair of each mode, `ks`, mist, and a pop demo with a button that pops above a tile. F4's frame checks use it. |

### 4.4 F4 Checks (`scripts/treadmill/*`)

| ID | Change |
|---|---|
| F4.1 | `frozen.ts --port N [--out dir]`: builds the current tree (`vite build`) into `playtest/runs/fix-plan/.build-<port>`, serves it with `vite preview` (no HMR), and prints the URL once it answers. |
| F4.2 | `sweep.ts` new invariants, on every case: **sound-without-petal** (major: when a `"petal"` clip starts, no petal of that sound (`[data-p]`) is visible, checked at the clip's start with 50 ms of grace; `ks` needs both /k/ and /s/), **sound-unclassified** (minor: a lone sound with no job, using the `__audioLog` `show` field), **petal-for-hidden** (major: a `"hidden"` sound's petal is visible while it plays), **petal-giveaway** (major: a visible answer card's word is the `iconWordOf` of a visible petal), **petal-too-small** (minor: the picture of a visible non-mini `.sound-badge` is < 38 CSS px at 844×390), **anim-main-thread** (minor: more than 2 endless non-compositable animations, named), **anim-hidden** (minor: more than 2 endless animations on hidden elements, named) and **raf-at-rest** (minor: more than 5 rAF requests/s after 2 s with no speech, taps or scene change). Reuse `soak.ts`'s in-page counters. |
| F4.3 | `soak.ts`: add to the invariant (PERF §5 plus): ninja demo idle at streak 0 ≤ 6 % and at streak 10 ≤ 14 % main thread (phone ×4); the stress peak ≤ 350 particles; a **title** phase (decoded audio ≤ 2 MB after 5 s on the title); World Flower screens (`snScene` tree) with median main thread ≤ 30 % and longest task ≤ 120 ms (phone ×4); `navLog` ≤ 500; `adjustLog` ≤ 200 (module probe). Name the offending animations in every animation failure. |
| F4.4 | `continuous.ts`: `--persona splitter` (a learner who, on the first try of any slot whose `next` spelling has two or more letters, taps a single-letter tile contained in it when one is offered; `bot.ts` reads `window.__botPersona`). Record for each clip its `show` and whether it started **over the map** (a level line while `__snRoute` is still the map). |
| F4.5 | `script-audit.ts --check [--findings file]`: the targets in §11.2, computed per run file. Exit 1 on a failure, and write treadmill findings (`sig: script:<metric>`). |
| F4.6 | `sound-display.ts --check [--findings file]`: judge by the `show` field: every `"petal"` clip has its petal (100 %), no `"hidden"` clip shows one (0 %), and no clip is unclassified. Also measure the picture size of each visible badge. |
| F4.7 | `sound-shots.ts --freeze <ms>`: pause every animation at a given `currentTime` before the shot, so before and after stills can be compared. |
| F4.8 | `run.ts`: `--soak` (the PERF §5 command), `--script` (the three continuous runs plus `script-audit --check`) and `--sounds` (`sound-display --check`) stages. `inbox.ts` accepts `soak`, `script` and `sound` in its file pattern. |

---

## 5. Foundation: acceptance

Run everything on your own frozen build. Evidence goes in `playtest/fix-plan/<lane>/` (bulky runs in `playtest/runs/fix-plan/<lane>/`).

### 5.1 F1 Perf

**Soak.** Run `bun scripts/treadmill/soak.ts --mobile --cpu 4 --fast 2 --levels 12 --idle 60 --stress 150 --check --port 4301 --out playtest/fix-plan/F1/soak-phone`, then the same on desktop with `--levels 14` into `soak-desktop`. The rows below must pass. Rows owned by P2 (the runner's fps, and animations defined in scene CSS) may still fail; list them.

| Metric | Budget | Before (PERF) |
|---|---|---|
| main thread on the still map (phone ×4) | ≤ 5 % | 10–12 % |
| rAF requests/s on the still map | ≤ 5 | 120 |
| the ninja standing still, streak 0 / streak 10 (phone ×4) | ≤ 6 % / ≤ 14 % | 15–17 % / 23 % |
| Web Audio nodes after each level | ≤ baseline + 8, flat | +4.2 a level |
| `<audio>` elements alive | ≤ baseline + 2 | +2.1 a level |
| live decoded audio after each level | ≤ 64 MB; levels off at about 40 MB | 96 MB after 20 levels |
| particles, stress peak / 10 s after | ≤ 350 / 0 | 461 / 0 |
| endless non-compositable animations, from `styles.css` | none of `nj-orbit`, `nj-flicker`, `nj-pend`, `wave`, `gem-slosh`, `hintglow`, `gemready`, `gemwon`, `rw-gem-pulse`, `vpulse` | 29 |
| endless animations on hidden elements, from the ninja | none of `nj-rise`, `nj-swirl`, `nj-orbit` | 27 |
| every PERF §5 "after each level" row | pass | – |

**Transcript.** F1 changes no lines. On C-P from 4201, the sequence of line ids matches the P0 baseline except for known randomness (praise picks). Also check that Sensei's mouth still moves: `__snVisemes` (an F1 counter of viseme changes) is above 0 during speech and rAF is 0/s at rest.

**Frames** (`sound-shots.ts --freeze`), into `playtest/fix-plan/F1/frames/`:
- `?scene=ninja-demo&tier=0..3`, at the same frozen time before and after: the same look. Tier 3's orbit dots still pass behind the ninja, and the flames still flicker (take two shots 230 ms apart).
- `?scene=ninja-demo&tier=2&strike=1` at 80 ms: the impact flash, without `mix-blend-mode`, looks about the same as before.
- A confetti burst: round blossoms, no teardrops.
- The Help button while Sensei talks: the waves animate (three shots).

### 5.2 F2 Voice

**Unit.** `bun test src/content/narrative.test.ts src/engine` passes every SF A1–A9 test and these new ones:
- `correction` with < s > for /sh/ gives `thats, /s/, we_need, /sh/, t_two_letters`, and < t > for /sh/ keeps the listening branch;
- `praiseFor`: every second right answer, never when `replaced`, never with `closingNext`;
- streak: 10 part hits and 1 answer → no tier-3 line; 7 answers → the line; a carried streak → no line before this level's first answer;
- `shouldOfferJump`: false in sessions 1–2, true in 3, false in 4 after an offer in 3.

**Transcript** (these only need F2, because the callers already exist). Run `continuous.ts --base http://127.0.0.1:4202` into `playtest/fix-plan/F2/`:
- `--persona splitter --from w5-1 --levels 6`: on the first split in a Dojo build, you hear "That's… /s/ We need… /sh/ It's two letters, but it's one sound." with no "Listen again…" before it. It also appears at least once in a battle.
- `--persona perfect --from w6-br1 --levels 13`: the read-back reminders (`t_two_letters` right after a word's blend) number ≤ 2, and none of them is for a spelling taught earlier in this session. Jump offers: ≤ 1 a session (Dec9, SF A8: this child is past session 2; restated by integration, 27 Sep, from "0", which contradicted Dec9 and §11.2).
- `--persona perfect --levels 12` (C-P, day one): jump offers 0.
- The new lines: every Part B id has an mp3, a duration and tags, and `jev-lint-lines` is clean on them.

**Frames.** None of F2's own. Its petal marks show up in F3's and P2's frames.

### 5.3 F3 Petals

**Frames**, `?scene=nav-demo&badges=1` at 844×390 (`sound-shots.ts`), into `playtest/fix-plan/F3/frames/`:
- In every tier, the rendered picture measured by `getBoundingClientRect()` is ≥ 38 CSS px for hero, turn, header and pop, and ≥ 27 for mini. The speaker glyph shows only on hero.
- `ks` is /k/ + /s/ with a "+". An unknown sound is mist with "?". No blank petal.
- The introduction animation at 0, 150, 300, 500 and 1600 ms after its sound clip starts: mist, the wipe, the picture popping, the ring, the breathing.
- A pop above a tile: its tail points at the tile, it doesn't cover the letters, and it is gone 700 ms after the clip ends.
- A contrast pair: the first petal dimmed. A "together" pair: both bright.
- `/play/?level=w1-2`: the nav row's petal is 104 wide (picture ≥ 38 CSS px) and clear of the bubble and Next.

**Sweep.** `bun scripts/treadmill/sweep.ts --base http://127.0.0.1:4203` gives **petal-too-small = 0** on the turn and header petals. `validate.ts`'s report lists w1-3's apple and w1-10's pig (they are expected until C1 fixes them).

**Soak.** A `?scene=nav-demo&badges=1` page left alone for 10 s: `raf-at-rest` passes, and no endless non-compositable animation is running (the breathing pulse is transform only).

### 5.4 F4 Checks

**The checks must bite.** Run each against the **P0 baseline build** (4280) and show that it fails on the known problems:
- `sound-display --check` fails on "You won back…" (SD r58), Find's "That's /d/" (r23), < x > (r19), /th/ in w5-1 (r20) and the w5-6 reminder (r28);
- `script-audit --check` on the baseline transcripts fails on letters lines (C6-P about 38), world welcomes (11–13), jump offers, praise a minute, and cut-offs;
- `soak --check --analyse playtest/fix-plan/baseline/soak-phone` fails on exactly PERF §5's "today" rows;
- sweep: sound-unclassified fires broadly, petal-giveaway fires on w1-3 if the deck offers the apple, and anim-main-thread names `nj-orbit` and `nj-flicker`.

Then run them against a build with F1–F3 in: the foundation rows pass (§5.1–5.3).

**Transcript.** `continuous.ts --persona splitter` actually splits: at least three first-try single-letter taps on two-letter slots in `--from w5-1 --levels 6`.

---

## 6. Group A: Training, OptIn, Placement, Profiles, Setup, Grownups, JumpAhead

| ID | P | Source | File | Change |
|---|---|---|---|---|
| A.1 | P3 | SF C19 | `Training.tsx` (the speaker step: `play("speaker")`, `tapSpeaker`) | Give the speaker something to repeat: `fm_name_sun` · `fm_speaker`; on the tap, `fm_name_sun` again, then `st_speaker_ok`. `fm_speaker` is said once before the tap. The 8 s nudge from NAVIGATION stays. |
| A.2 | P2 | SD A12, r48 | `Placement.tsx` `findAllRound` | Leave out the target petal's `iconWordOf(p)` (train /ae/, tree /ee/, boat /oe/) from the options. Check the `sound` and `gap` rounds too. |
| A.3 | P2 | SD §1, Dec3 | `Placement.tsx` | Give every sound a job. The spell round's tile voices are `"tile"`. The round's sound is already `"petal"` (the nav row). A learner's correction sound, if any, is `"petal"` with its anchor. |
| A.4 | P3 | PERF §3.2 rule | `optin.css`, `nav-A.css`, A's scenes | Fix any endless animation the sweep's `anim-main-thread` or `anim-hidden` names on A's screens (`optin`, `training`, `placement`, `profiles`, `setup`, `grownups`, `jump`). |
| A.5 | – | – | `OptIn`, `Profiles`, `Setup`, `Grownups`, `JumpAhead` | No planned change beyond A.4. Grown-ups' sound check (SD r63) is already right. |

**Acceptance (A)**
- **Soak/sweep.** `sweep.ts --only training,optin*,placement,profiles,setup,grownups*,jump*`: anim-main-thread, anim-hidden and raf-at-rest are 0 on every A case (the title's own loops belong to B1).
- **Transcript.** On C-P (first minutes), the dojo welcome reads exactly: "This is the sun. · And when you tap the speaker, I'll say it again! · *(tap)* This is the sun. · That's it! I'll always say it again." The same instruction is never said twice in a row.
- **Frames.** `sound-display.ts --only placement --check`: the find-all round shows the /ee/ petal and never a tree card. Spell-round tile voices show no petal pop. Also a still of the find-all round (`playtest/fix-plan/A/frames/placement-findall.png`) with the petal visible and no card matching its picture.

---

## 7. Group B: IntroFilm, Intros, Tree, Book, Stickers, App, Intro

### B1 Shell (`App.tsx`, `shell.css`, `nav-B.css`)

| ID | P | Source | Change (search anchor) |
|---|---|---|---|
| B1.1 | P1 | PERF 5 | `preload([urls.line("tap_start"), urls.music("title")])` → `preload([urls.line("tap_start")])`. Music streams through `<audio>` and is never decoded. |
| B1.2 | P1 | SF C6 | `WorldMap`'s arrival: `arrivalLines({ world, welcomed, lead, hintsSaid: timesHeard("map-hint") })`. `welcomedWorld` is a module-level variable, reset when `store.sessions` changes and set when `world_N` is said to its end. `heard("map-hint")` is recorded only when the hint is said to its end. After that, `map_hint` is the map's 8 s idle nudge. |
| B1.3 | P1 | SF C7, Dec8 | `Reward`: `rewardLead({ closingSaid: !!closing, boss, newPetals: <distinct sounds won>, lastInWorld, finale })`. "More stickers for your Sticker Book!" only on a session's first two rewards. The jump offer comes from `shouldOfferJump` (F2 records it). Hear it again still says the closing line first. |
| B1.4 | P1 | SD r58, Dec8 | `Reward`: the petals of the sounds won (the distinct `soundOf` of `level.teach`) rise into the panel, `mini` or `turn` size, with a short introduction. Each says its sound after the line: "You won back a sound! /m/". It's singular or plural by sounds. |
| B1.5 | P2 | Dec5, SF C18 | `LevelHost` mounts the level after App's fade has finished and the arrival line has ended (`isSpeaking()` false, at most 1.5 s). No level line may start over the map. |
| B1.6 | P2 | SF C8.2 | `rewardGemFocus`: the first time a gem is ready in this save (key `gem-battle`), say `flower_i5` instead of `gem_ready`. |
| B1.7 | P3 | Dec6, SD r60 | `PetalDrift`: round blossom petals (CSS: a pink ellipse with a notch), not `item_petal`. They drift with `transform` only. |
| B1.8 | P3 | SD r61 | Optional: the next stone that teaches a new sound shows that sound's petal in mist. |
| B1.9 | P2 | PERF §3.2 rule | Fix what the sweep's animation invariants name on the title, choose, map and reward screens (`shell.css`, `nav-B.css`, inline styles in `App.tsx`). |

### B2 Flower (`Tree.tsx`, `tree-teach.css`, `tree-visit.css`)

| ID | P | Source | Change |
|---|---|---|---|
| B2.1 | P1 | PERF 9 | `wffocus` (inline `animation: "wffocus 1s …"` with `box-shadow` keyframes) becomes `.glow-pulse`. `gvbreathe` (`filter`) becomes an opacity pulse on an overlay. Check `bpfocus`, `gvspin`'s drop-shadow and anything else the soak names on `snScene` tree. |
| B2.2 | P1 | PERF 9 | The scrolling chart's off-screen petals get `content-visibility: auto` (with `contain-intrinsic-size`). Profile the entry render with the React profiler and cut the longest task to ≤ 120 ms on phone ×4 (render the flower first and the scroll a frame later, memoise `ScrollPetal`). |
| B2.3 | P2 | SD r54, r57 | `BigPetal`: the picture moves from the point to the **top-right shoulder**, at 30 % of the petal's width, overlapping the outline by about 15 % (as `ScrollPetal` already does). The BigPetal is tappable and says its sound. It carries `data-p` so F3 hides the nav row's duplicate. |
| B2.4 | P2 | SD r52, r57 | `PetalDetail` and `GemVictory`: sounds marked `"petal"`. The victory's "This is the way we spell /ae/…" swells the BigPetal. |
| B2.5 | P2 | SF C8.2 | The first `gem_ready` in the free view (`setOpenLead("gem_ready")`) becomes `flower_i5` once per save (key `gem-battle`, shared with B1.6 through `isDue`/`heard`). |
| B2.6 | P2 | SD §1 | Give every sound in the flower's views, trips and victory a job. |

### B3 Shows (`Intros.tsx`, `IntroFilm.tsx`, `Intro.tsx`)

| ID | P | Source | Change |
|---|---|---|---|
| B3.1 | P1 | SF C8 | `FlowerIntro`: the petal is the child's first petal, `store.get().petals.map(soundOf)[0] ?? "s"`, not `"a"`. It is used in the line, the SoundBadge (hero, 260), the GemIcon and the landing. Keep steps 1–3; drop `flower_i4`, `flower_i5` and `flower_i6` (they are said when they happen). |
| B3.2 | P2 | SD r50 | `FlowerIntro`: the SoundBadge gets `intro` (the introduction animation), unless the child's first petal has already been introduced (Reward 2). |
| B3.3 | P1 | SF C3.5 | `GemFound`: pass `justTaught` (the level's `teach` keys, when the trip follows that level: `flowerVisitAfter` → `{ kind: "spelling" }`) and a shared `used` set into `foundScript`. |
| B3.4 | P2 | SD r55 | `GemFound`'s "same spelling, two sounds" beat: the other sound's petal pops beside the BigPetal as it is said, then dims (a contrast pair). |
| B3.5 | P2 | SD r56 | `WorldVisit`'s recap head: `turn` size (104), and a SoundPair for a two-sounds recap. |
| B3.6 | – | SD r64 | `IntroFilm`, `Intro`: no change (rainbow petals are the story's lost sounds). |

### B4 Stickers (`Stickers.tsx`, `Book.tsx`, `stickers.css`)

| ID | P | Source | Change |
|---|---|---|---|
| B4.1 | P1 | SD r7 | Reward 2, step `petal`: the /s/ petal **lifts out of the flower** as a hero SoundBadge (220) with the introduction animation on "/s/". The nav row's duplicate goes (F3.7 does this once the hero carries `data-p`). |
| B4.2 | P2 | SD r65 | Stickers and Book: a sticker saying its word, and sound buttons, are `"tile"`. |
| B4.3 | P2 | PERF §3.2 rule | `stickers.css`: `st-holo` (animates `background-position`) becomes a gradient layer moved with `transform`; `st-shimmer` (`filter`) becomes an opacity overlay. Check `st-mist` and `st-rays-turn`. |

### Acceptance (B)

**Soak.**
- On the title: live decoded audio ≤ 2 MB after 5 s (F4.3's title phase; before: 61 MB, measured without Playwright).
- The World Flower after a level (phone ×4, `soak.ts --mobile --cpu 4 --fast 2 --from w1-2 --levels 4`): median main thread ≤ 30 % on `snScene` tree (before: 63 %), longest task ≤ 120 ms (before: 257 ms), and median fps ≥ 50.
- The sweep's anim-main-thread, anim-hidden and raf-at-rest are 0 on title, choose, map, reward, reward2, flower-intro, tree-free, tree-petal, tree-found, tree-world, tree-victory, intro and finale.

**Transcript.** Use `continuous.ts` from 4221–4224 once all four B lanes are in (or on each lane's own build for its own lines):

| Where | Must be | Before |
|---|---|---|
| C-P, map arrivals | `world_1` once in the session. `map_hint` on the save's first two arrivals only, never cut. No level line starts over the map. | 11 welcomes; hint cut 9 of 12; 10 of 12 levels spoke over the map |
| C6-P, map arrivals | `world_6` once | 13 |
| C-P, the first World Flower visit (after w1-2) | `flower_i1` · `flower_i2` /s/ · `wf_i3`, and none of `flower_i4/5/6`; `flower_i1` start to `wf_i3` end ≤ 16 s | 6 facts in 31 s, about /a/ |
| C-P, the trip after w1-3 | `st_found_new_sounds` … `st_another_new_sound`, and "…in mat." never twice in one trip | "…in mat." twice |
| C6-P, the trip after w6-1 | no `t_two_letters` and no `same_sound_new`; it contains `wf_found_gem` /ae/ and `tg_ay_ae_like` | both said again |
| every reward | `yay_7` never within 5 s of a closing or praise line. "More stickers…" ≤ 2 a session. After w6-1 (< ai >, < ay >): "You won back a sound!" followed by /ae/ | `yay_7` after praise 11 of 11 |
| C-P and C5-P | `jump_offer` 0 on day one, ≤ 1 a session | 8 and 12 |
| the first gem ready | `flower_i5` once in the save, then `gem_ready` | never said at the right time |

**Frames.** `sound-display.ts --only reward2,w1-2,w2-1,w6-1,flower-intro,tree-found,tree-found-th,tree-world,tree-victory,trial --check`, both personas, into `playtest/fix-plan/B/sound`: 100 % of `"petal"` clips have their petal, including "You won back a sound!" (before: 0 of 14). Named stills in `playtest/fix-plan/B/frames/`:
- `reward-w2-1-petals.png`: the won sounds' petals in the reward panel.
- `reward2-hero.png`: the /s/ hero petal lifted out of the flower, mid-introduction (use `--freeze`).
- `trip-bigpetal-shoulder.png`: the BigPetal's picture on the top-right shoulder. Its bounding box centre is in the top 35 % of the petal's box and right of the petal's centre.
- `flower-intro-first-petal.png`: a fresh child sees /s/, not /a/.
- `trip-th-pair.png`: /th/ beside /dh/ on "sometimes /th/…".
- `title-blossoms.png`: no teardrops drifting on the title.

---

## 8. Group C: Early and the warm-ups

### C1 Early (`Early.tsx`, `early.css`, `nav-C.css`)

| ID | P | Source | Change (search anchor) |
|---|---|---|---|
| C1.1 | P1 | SF C9.1–2 | `FirstSoundLevel`'s `mk()`: `if (!introduced.current.has(g) \|\| mode !== "youdo")` → `if (!introduced.current.has(g))`. In `SoundHuntLevel`, only `k === 0` says "This is how we spell…". Later reveals are silent: the spell still writes the letters. |
| C1.2 | P2 | SF C9.3 | Prompts use `stemFor(STEMS.first, n, HAS_LINE)`. `listenAgain` keeps `first_q`. |
| C1.3 | P2 | SF C13 | `BuildSequence`: drop `two_sounds`/`three_sounds` from the start. In `BuildOne`'s I do, after `build_ido_2` + the stretched word, say `st_hear_two`/`st_hear_three`, then `build_ido_3`. |
| C1.4 | P3 | SF C14 | `ReadCheck`/`ReadOne`: `read_intro` only on the save's first reading check. `read_who` comes after both readers have read. |
| C1.5 | P2 | SF C15 | Praise at the `pickPraise()` sites in `usePickGame`, `BuildOne` and `ReadOne` goes through `praiseFor()`. |
| C1.6 | P1 | SD r9, A12 | The first-sound decks never offer the target petal's `iconWordOf(p)` as a card (w1-3's apple for /a/, w1-10's pig for /p/). Filter when choosing targets and distractors. |
| C1.7 | P2 | SD r16 | `ReadOne`, a wrong reader chosen ("If it was sit, this would be /i/. Is it? No! It's /a/."): a contrast SoundPair above the lit tile. /i/ appears as it is said and dims on "No!"; /a/ stays until the next turn. Both sounds `"petal"` with the tile as anchor. |
| C1.8 | P2 | SD §1 | Give every sound a job. Tile voices (`BuildOne` flights, the read-back, the sound buttons) are `"tile"`. `slotQ` ("What's the first sound?") is `"hidden"` until answered. The first-sound and hunt turns are `"petal"` (the nav row). `BuildOne`'s Help ("Look! I'll show you…") and its corrections pass anchors to `correctionFor`, or use `"petal"` with `at`. |
| C1.9 | P2 | Dec2 | `BuildOne`: per-tile hits pass `part: true`, and `streak.answer()` is called once at the word's end when it was built right first time. |
| C1.10 | P2 | PERF 7 | `flyTo`'s `onFrame: … fx.glow(...)` becomes `fx.trail(...)`. |
| C1.11 | P2 | PERF §3.2 rule | `early.css`: `.reader-book` (`early-book` on an SVG) goes onto a wrapper `<span>`. `.reader-waves path` (`wave` on SVG paths) becomes HTML arcs or one wrapper with opacity. Check `early-light` and `pcard-bob`. |

### C2 Warm-ups (`Warmup.tsx`, `warmups.ts`, `warmup.css`)

| ID | P | Source | Change |
|---|---|---|---|
| C2.1 | P1 | SD r4, Dec1 | W5 ("sounds to words", `sounds`): no petals while the sounds play. `<SoundDots n lit>` under the cards, lighting per sound (`{ sounds, show: "hidden" }` with `onSeg`). After the right answer, the dots may bloom into mini petals under the chosen picture. |
| C2.2 | P2 | SD r5, A4 | W6 (`dots`, `Dots`): once a dot has sounded it becomes that sound's **mini petal**, for that word only. |
| C2.3 | P2 | SD r1 | W1's notice: the first /s/ petal gets the introduction animation (`intro`). For a child who starts at W1, it is their very first petal. |
| C2.4 | P2 | SF C17.2 | W5: `[listen, gap 250, ...sayWord(target), gap 300, fm_which_pic]`, so naming a picture never runs straight into another word's sounds. |
| C2.5 | P3 | SF C17.1, 3–5 | W3's recap says `fm_fast_${word}` when it exists (`fm_fast_mug` is new, from F2). `pawClose`: "Here's the last one!" only for tap-all beats, `fm_its_this` for a single answer. W2's demo (`warmups.ts`) drops `after: "fm_pair_fish_dog"` on the Sensei rail. W3 gets its own closing, or skips the praise half on the second use. |
| C2.6 | P2 | SD §1 | Give every sound a job: the notice and tap-all are `"petal"` (the nav row). The W5 blend is `"hidden"`. The W6 dot taps are `"tile"` until tapped, then the mini petal shows. |
| C2.7 | P3 | PERF §3.2 rule | `warmup.css`: fix what the sweep names (`wu-pulse` with a static glow is fine). |

### Acceptance (C)

**Soak/sweep.**
- `soak.ts --mobile --cpu 4 --fast 2 --from w1-2 --levels 6`: no C-owned name in anim-main-thread or anim-hidden (`early-book`, `wave` from `.reader-waves`).
- During W1–W6 and the reading check, the particle peak is ≤ 120 in any 10 s sample with no streak strike. The `flyTo` trail is rate-limited.
- Sweep cases w1-wu1…wu6, w1-2, w1-4, w1-7, w1-10: anim and raf invariants 0.

**Transcript** (C-P, and C-L for the warm-ups):

| Where | Must be | Before |
|---|---|---|
| C-P, first-sound and sound-hunt levels | "This is how we spell…" or "We hear the sound. Now look…" once per spelling per level: total ≤ 5 | 15 |
| C-P, first-sound prompts | never the same stem more than three times running; `st_first_q2`/`q3` both heard | "Which one starts with…" 8× in 75 s |
| C-P w1-4/w1-5 | no `two_sounds`/`three_sounds` before the first word. `st_hear_two` or `st_hear_three` comes after the slow word | said over the map |
| C-P reading check | `kai_says` word, `suki_says` word, then `read_who`. `read_intro` once a save | asked before and after |
| C-L W5 | "This is a mop. · Listen… /m/ /a/ /p/. Which picture is it?" | naming ran into the sounds |
| C-P W3 recap | "I can say a word fast. Mug! · Or I can say it slowly…" | "mug" · "Or I can say it slowly…" |
| C-P W2 demo | "Fish dog!" never twice in a row | twice |
| C-P, from W1 to w1-11, excluding the warm-ups' every-third rule | praise ≤ 1.5 a minute, and no two praise lines within 5 s | 2.0–4.0 a minute |

**Frames.** `sound-display.ts --only w1-wu1,w1-wu2,w1-wu3,w1-wu5,w1-wu6,w1-2,w1-4,w1-7 --check`, both personas: 100 % petals for `"petal"` clips, and 0 % for `"hidden"` clips (W5's sounds, `slotQ`). Named stills in `playtest/fix-plan/C/frames/`:
- `w5-dots.png`: during W5's /s/ /u/ /n/, three dots with the second lit and no petal.
- `w6-mini-petals.png`: after two dot taps, two mini petals and one plain dot.
- `w1-notice-intro.png`: the /s/ petal mid-introduction (`--freeze`).
- `w1-3-no-apple.png`: an /a/ turn with no apple card (the sweep's petal-giveaway is 0 on w1-3 and w1-10 over three runs).
- `readcheck-pair.png`: the /i/ and /a/ contrast pair above the lit tile, /i/ dimmed.
- `reader-book.png`: the reader still bobs (two shots 200 ms apart).

---

## 9. Group D: Dojo, Battle, Swap, Sort, Run, Story

Each D lane calls the F2 helpers at its reminder, correction and praise sites. What differs is below.

### D1 Dojo (`Dojo.tsx`, `dojo.css`, `nav-D.css`)

| ID | P | Source | Change (search anchor) |
|---|---|---|---|
| D1.1 | P1 | SF C2 | `Learn` gets `index`/`count`. `letters` = `lettersFor(t, { at: tile })` (F2). A new spelling of a known sound: `st_know_this_sound` in the intro, **before** the spell, and after the spell `t_another_way` + sound (no `same_sound_new`/`same_sound_diff` in `about`). `index > 0` → `fm_you_try_2` in place of `dojo_tap_say` (the idle prompt and Help keep it). The last of three or more starts with `st_last_one`. |
| D1.2 | P1 | SD r18, r19, r20 | `Learn`: the petal is hero (220, picture 70 %), and the first /b/ of a new sound gets `intro` (not for "you already know this sound", r21). < x > shows the /k/ + /s/ pair (Dec7). < th > = /dh/ after /th/: the /th/ petal appears beside the feather as /th/ is said, and dims on /dh/ (`sameSpellingSay` marks both `"petal"`). |
| D1.3 | P3 | SD A11, Dec6 | The two "say it with me" tally marks (`item_petal`) become two mini petals of the sound being learnt, lighting in turn. |
| D1.4 | P2 | SF C10 | `Find`: the speaker tip goes **before** the first question (`explain("hear-again", "twice", [tut_speaker, gap 300])` at `index === 0`, the speaker pulsing, the choices arriving after it). If it is cut off, it is not tried again in this level. `stemFor(STEMS.find, index, HAS)`. |
| D1.5 | P2 | SD r23 | `Find`, a wrong tile: `correctionFor`-style anchors, so /d/ pops above the tapped tile and the nav row's /b/ swells on "/b/". |
| D1.6 | P2 | SF C12 | `Build`: the first word's introduction locks taps (`introLock.current = true` for `intro && first`). After the read-back, `afterWordSay()` (F2) replaces the reminder / gem / praise chain at `twoSoundsReminder(word.segs) ?? lettersReminder(word.segs)`. |
| D1.7 | P1 | SF C5, SD r26, r27 | `Build`'s correction: pass `{ wrong: tappedTile, slot: activeSlot }` to `correctionFor`. On a split (`splitsSpelling`), reveal and glow the right tile on the **first** miss (`{ reveal: true }`). Help 3 ("Look! I'll show you /m/") pops /m/ above the active slot. |
| D1.8 | P1 | SD r28, Dec4 | The reminder after a word: pass `at: (i) => tileEl(i)`, so the petal pops above the lit tile on "one sound" and the sound follows. |
| D1.9 | P2 | Dec2 | `Learn`'s "say it with me" hits (`n >= 2 && first ? streak.hit()`) pass `part: true`. `Build`'s per-tile `streak.hit({ defer: true })` becomes `{ defer: true, part: true }`, plus `streak.answer()` when the word finishes with no miss. `Find` stays a plain hit. |
| D1.10 | P2 | SF C15 | Praise via `praiseFor()` (`praiseAfter` and the other `pickPraise` sites). "Well done!" is never said right before `dojo_done`. |
| D1.11 | P2 | SD §1 | Every sound gets a job: `Learn`'s sounds are `"petal"`, `Find`'s question is `"petal"`, `Build`'s tile voices and blends are `"tile"`, `Build`'s "Which sound?" is `"hidden"`. |

### D2 Battle (`Battle.tsx`, `battle.css`)

| ID | P | Source | Change |
|---|---|---|---|
| D2.1 | P1 | SF C4, C5; SD r30–32 | Corrections pass anchors to `correctionFor`, and a split reveals on the first miss. Help 3 (`Look! I'll show you`) pops above the slot. The reminder after a word uses `afterWordSay` with tile anchors. |
| D2.2 | P2 | SD r33 | The Gem Trial's gem uses `petalColour` (not the `PHONEMES` category colour). |
| D2.3 | P2 | Dec2 | `countHits`: `streak.hit({ count: k, part: true })`, then `streak.answer()` for a word finished first time. A tier-3 line needs 7 answers. |
| D2.4 | P2 | PERF minor | The Gem Trial's charge bar: no `setCharge` every frame. Drive it with a ref and `style.transform: scaleX()`, or with a CSS animation of the right duration. |
| D2.5 | P2 | PERF 3 | `bt-orbit`: take `z-index` out of the keyframes and **unmount** `.bt-dizzy` when its 1.5 s life ends. |
| D2.6 | P2 | PERF 7 | `glide()`/`dot()` trails use `fx.trail`. |
| D2.7 | P3 | PERF §3.2 rule | `bt-hot` (`filter`) becomes an opacity overlay. Check `bt-rage`, `bt-vein` and `bt-fist`. |
| D2.8 | P2 | SF C15 | Praise via `praiseFor()`. |

### D3 Swap (`Swap.tsx`, `swap.css`)

| ID | P | Source | Change |
|---|---|---|---|
| D3.1 | P1 | SF C11.1–2 | `ask()`, early swaps: `[swap_make, to-word, gap 300, listen, stretch(from), gap 350, stretch(to), gap 250, st_what_change]`. From the third step, after two first-try steps (`fadeForm`), just `[swap_make, to-word]`. The stretched pair comes back after a miss. |
| D3.2 | P1 | SF C11.3 | `sayPick()`: `await say({ line: st_<place>_changes }, { protect: true })`, and the new-sound tiles become tappable as it ends; then `swap_pick`. Keep `audit_swap_*` as the fallback while `st_*` aren't recorded. |
| D3.3 | P2 | SD r34, r36 | "That's /h/. That sound stays the same." pops /h/ above the tapped letter. Help 3 ("Look! I'll show you /o/") pops above the gap. The wrong-spelling correction goes through `correctionFor` with anchors. |
| D3.4 | P2 | SD r35, A8 | "Pick the new sound" over the spelling tiles: no petal (`"hidden"` for any sound said there). |
| D3.5 | P2 | SF C4, C15 | The reminder uses `afterWordSay` with an anchor (r37). Praise via `praiseFor()`. |
| D3.6 | P3 | PERF §3.2 rule | `.swap-swirl svg` (`swap-swirl-spin` + drop-shadow) animates a wrapper. |

### D4 Sort (`Sort.tsx`, `sort.css`)

| ID | P | Source | Change |
|---|---|---|---|
| D4.1 | P1 | SF C1 | The intro script (`chests: spellings.map(...)`): say the sound once in the lead, with the petal. Each chest, as it hops, gets **one** sentence with one example word: the first is `t_way_we_spell` /p/ + "…in *word*." (`tg_<g>_<p>_in` or `t_in` + word), the middle ones `st_like_this_in` + word, the last `st_and_like_this_in` + word. No two chests share a word (`freshWords`). The letters line only on the one chest whose spelling is **due** (`dueInSessions`), at most one chest a sort, recorded with the session. |
| D4.2 | P1 | SD r44 | For the introduction, a **hero petal (220)** stands above the chests and swells on its sound. Then it shrinks into the top bar. |
| D4.3 | P2 | SD r43 | The top-bar petal is `header` (104, picture 70 %). |
| D4.4 | P2 | PERF minor | The falling word moves with `translate`, not `style.top`, every frame. |
| D4.5 | P3 | PERF §3.2 rule | `.so-spark svg` (`so-crackle` on an SVG) animates a wrapper. Check `so-rainbow`. |
| D4.6 | P2 | SD §1 | The word blends are `"tile"`. The intro's sound is `"petal"`. |

### D5 Run (`Run.tsx`, `run.css`)

| ID | P | Source | Change |
|---|---|---|---|
| D5.1 | P1 | PERF 8.1 | Take the scrolling background tile and the ground out of the canvas: two `<div>`s with the baked tiles as backgrounds, moved with `transform: translateX()`. The canvas keeps the sprites, lanterns and plates only (`frame` → `draw`). |
| D5.2 | P2 | PERF 8.2–8.3 | Bake the remaining per-frame `shadowBlur` glows once (as `tinted()` does). Clear the module texture cache `tex` on unmount. |
| D5.3 | P1 | SD r38, Dec1 | Blend mode ("Listen to the sounds. What word do they make?"): no petals. `SoundDots` in the banner light per sound (`"hidden"`). |
| D5.4 | P2 | SD r41, Dec6 | The top-bar counter and the track pickups use stars (`item_star`), not `item_petal`. Rename "petals" in the run's copy and state. |
| D5.5 | P2 | SF C16 | The cue rotates `run_blend` and `audit_sounds_again` for the first three words. From the fourth there's no cue (the sounds alone, as the lantern comes). `t_listen_for_word` is gone (F2 removes it from `RUN_BLEND_CUES`). |
| D5.6 | P2 | SF C4, C15; SD r40 | The reminder uses `afterWordSay` with the word's tile anchors. Praise via `praiseFor()` where it isn't the streak line. |

### D6 Story (`Story.tsx`, `story.css`, `stories.ts`)

| ID | P | Source | Change |
|---|---|---|---|
| D6.1 | P2 | SF C4; SD r42 | The reminder (`twoSoundsReminder(segs) ?? lettersReminder(segs)`) uses `afterWordSay` with the spelling's anchor, so the petal pops above it. |
| D6.2 | P2 | SF C15 | Praise via `praiseFor()`. |
| D6.3 | P2 | SD §1 | Tapped words and choice words are `"tile"`. |

### Acceptance (D)

**Soak.**

| Where (phone ×4) | Budget | Before |
|---|---|---|
| the runner, `soak.ts --mobile --cpu 4 --fast 1 --from w1-9 --levels 1` | median fps ≥ 50; canvas raster ≤ 8 ms a frame (`__runPerf` with `flush`); `mem_canvas` within 2 MB of before the level, back on the map | 29–36 fps; 13.5 ms; +12 MB kept |
| a Gem Trial (`?trial=ai>ae`), the soak's sample during the charge | median main thread ≤ 25 %; no React commit per animation frame (a dev counter, or `recalcPerSec` ≤ 5 outside CSS animations) | re-renders 60 times a second |
| a sort (`--from w6-br1 --levels 2`) | `layoutPerSec` ≤ 2 while the word falls | a layout every frame |
| D's CSS | none of `bt-orbit`, `bt-hot`, `swap-swirl-spin`, `so-crackle` in anim-main-thread or anim-hidden | `bt-orbit` 3 hidden |

**Transcript.** Run `continuous.ts` on D's builds (after all six lanes are in, for the counts):

| Run | Must be | Before |
|---|---|---|
| C6-P, w6-2 sort intro | "Sorting time! Same sound, different spellings. · This sound can be spelt in two ways. · This is the way we spell… /ae/ …in rain. · …and like this, in tray. · Tap the chest…" and **no** `t_two_letters` | "/ae/ It's two letters… /ae/ It's two letters…" |
| C6-P, w6-br1 sort intro | exactly one letters line, on < ck >, and only if not already told this session | – |
| C6-P, whole run | letters lines (`t_two_letters`, `t_three_letters`, `t_four_letters`, `st_two_letters_too`) ≤ 12; no spelling's full line twice; the same sentence never twice within 60 s; "/X/ two letters · /X/ two letters" echoes 0 | 34 + 4; 5 echoes |
| C5-P, w5-1 Learn | `t_two_letters` then `st_two_letters_too`, then nothing for the third; `fm_you_try_2` for items 2+; `st_last_one` before the last | 3 identical |
| C6-P, w6-1 Learn | `st_know_this_sound` **before** the spell, `t_another_way` after; `same_sound_new` 0 | after the reveal, 8× |
| C5-L, Find | `tut_speaker` ≤ 2 a save, 0 cut off, always before the question; stems rotate | 10, 8 cut |
| C-P, w1-8 swap | `st_what_change` after both stretched words; `st_*_changes` heard to the end 3 of 3; `swap_pick` after it; from step 3, after two first tries, no stretched pair | 0 of 3 heard |
| C-P, w1-9 run | no `t_listen_for_word`; cues on words 1–3 only | – |
| splitter, `--from w5-1 --levels 8` | every first split in Dojo and Battle: "That's /s/. We need /sh/. It's two letters, but it's one sound." with the right tile glowing on the first miss | never |
| C5-P and C6-P | after each word, at most one of reminder, gem first-fill and praise; never "Ninjas read this way!" in lands 3–6 | up to five things |
| all D levels | praise ≤ 1.5 a minute; no two praise lines within 5 s; "You're a ninja master!" never before 7 whole answers in the streak (Dec2) | 2.0–4.0 a minute; "master" after about 3 words |

**Frames.** `sound-display.ts --only w1-4,w1-8,w1-9,w2-1,w3-6,w5-1,w5-6,w6-br1,w6-1,w6-2,trial --check`, both personas plus a splitter run: 100 % of `"petal"` clips have their petal, 0 % for `"hidden"`, none unclassified. Named stills in `playtest/fix-plan/D/frames/`:
- `w3-6-x-pair.png`: /k/ + /s/ with "+", no blank petal (before: `frames/w3-6-perfect-005-sound-k-NONE.png`).
- `w5-1-th-pair.png`: the /th/ petal visible while /th/ plays, beside the /dh/ feather (before: `frames/w5-1-perfect-023-sound-th-NONE.png`).
- `w5-6-reminder-pop.png`: the petal above the lit two-letter tile on "one sound" (before: `frames/w5-6-perfect-056-talk-t_two_letters-NONE.png`).
- `dojo-learn-hero-intro.png`: the 220 hero petal mid-introduction, and the tally as two mini petals.
- `find-wrong-pop.png`: /d/ above the tapped tile, /b/ in the nav row.
- `build-second-miss.png`: /s/ above the wrong tile (dimmed), /m/ above the slot.
- `battle-help3.png`, `swap-thats-h.png`: pops at their anchors.
- `swap-pick-no-petal.png`: spelling tiles, no petal.
- `sort-intro-hero.png`: the 220 petal above the chests, with the < ai > chest hopping; `sort-play-header.png`: the 104 header petal.
- `run-blend-dots.png`: dots in the banner, no petal; `run-counter-stars.png`: the counter is stars.
- `trial-gem-colour.png`: the trial gem in its chart colour.
- `run-before-after.png`: stills at the same `--freeze` time, before and after D5.1, look the same.

---

## 10. Integration (P3)

| ID | Change |
|---|---|
| I.1 | `DEFAULT_SHOW = "petal"` in `audio.ts`. Every lone `{ sound }` left is now a petal sound. The sweep's sound-unclassified must already be 0 before this flip. |
| I.2 | Make sweep's **sound-without-petal**, **petal-for-hidden** and **petal-giveaway** blockers in the first-session cases (and majors elsewhere). Anim, raf and petal-too-small stay minor. |
| I.3 | Retire `soak-fixes.ts` (move it to `.trash/`) and the `--patched` flag (Dec10). |
| I.4 | Collect every lane's "requests for other files" and apply them. Each is small. If one isn't, it becomes a finding in `playtest/INBOX.md`. |
| I.5 | Write Dec1–Dec10 and every lane's decisions to `docs/DECISIONS.md`. Mark PERF.md fixes, SCRIPT_FIXES C1–C21 and the SOUND_DISPLAY rows as done or not done, with a link to this plan. Add the new stages to TREADMILL.md. |
| I.6 | Run the full acceptance (§11) from a frozen build on 4290. Anything that fails goes back to its lane's owner as a finding; don't fix another lane's file silently. |

---

## 11. Acceptance summary (the whole plan)

All runs use a frozen build of the integrated tree. Put the results in `playtest/fix-plan/final/`, with a `summary.md` that has a before column from the P0 baselines.

### 11.1 Soak budgets

Run `bun scripts/treadmill/soak.ts --mobile --cpu 4 --fast 2 --levels 12 --idle 60 --stress 150 --check` and `bun scripts/treadmill/soak.ts --fast 2 --levels 20 --check`. **Both must exit 0.**

| When | Metric | Budget | Before | Owner |
|---|---|---|---|---|
| after each level (GC'd, on the map) | DOM nodes / JS heap / listeners / map animations / intervals | base + 600 / + 8 MB / + 40 / + 5 / + 1 | ok | all |
| | particles / fx nodes | ≤ 5 / 0 | ok | F1 |
| | rAF requests/s on the still map | ≤ 5 | 120 | F1 |
| | live decoded audio | ≤ 64 MB | 96 MB | F1, B1 |
| | Web Audio nodes / `<audio>` alive | base + 8 / base + 2 | +4.2 / +2.1 a level | F1 |
| | `__snNavLog` / `adjustLog` | ≤ 500 / ≤ 200 | unbounded | F3 / F1 |
| on the title, 5 s | live decoded audio | ≤ 2 MB | 61 MB | B1 |
| while playing (every sample) | endless non-compositable animations | ≤ 2 | 29 | F1, B, C, D |
| | endless animations on hidden elements | ≤ 2 | 27 | F1, D2 |
| phone ×4 | every screen's median fps | ≥ 50 | the runner 30–36 | D5 |
| | the still map, main thread | ≤ 5 % | 10–12 % | F1 |
| | the ninja idle at streak 0 / 10 | ≤ 6 % / ≤ 14 % | 15–17 % / 23 % | F1 |
| | the World Flower: median main / longest task | ≤ 30 % / ≤ 120 ms | 63 % / 257 ms | B2 |
| stress (150 strikes at streak 10) | particle peak / 10 s after | ≤ 350 / 0 | 461 / 0 | F1 |

Footprint and RSS are reported but not judged (PERF §2.2: under Playwright they include DevTools' copies).

### 11.2 Transcript targets

Run `continuous.ts --persona perfect,learner` three ways (from the start with 12 stones, `--from w5-1` with 12, `--from w6-br1` with 13), plus `--persona splitter --from w5-1 --levels 8`. Then `bun scripts/treadmill/script-audit.ts … --check` **must exit 0**.

| Measure | Target | Before (SF Part F) |
|---|---|---|
| letters lines in C6-P (25 min) | ≤ 12; no spelling's full line twice in a session; the same sentence never twice in 60 s | 34 + 4 |
| "/X/ two letters · /X/ two letters" echoes | 0 | 5 sorts |
| `same_sound_new` after the reveal (C5-P, C6-P) | 0 | 8, 8 |
| world welcomes (C-P, C5-P, C6-P) | 1 per land | 11, 10, 13 |
| "You did it!" straight after another praise line (C-P) | 0 | 11 of 11 |
| jump offers | 0 on day one; ≤ 1 a session | 8 (C-P), 12 (C5-P) |
| "This is how we spell…" (C-P) | ≤ 5 | 15 |
| "Tap the speaker…" (C5-L) | ≤ 2 a save, 0 cut | 10, 8 cut |
| swap place lines heard to the end (C-P) | 3 of 3 | 0 of 3 |
| map hint cut by the next level (C-P) | 0 | 9 of 12 |
| level lines started over the map | 0 | 10 of 12 (C-P) |
| praise lines a minute (all runs) | ≤ 1.5; stacks within 5 s: 0 | 2.0–4.0 |
| any line more than twice in 60 s (bar the SS §5.1 routines) | 0 | "Which one starts with…" 8× in 75 s |
| cut-off explanations (not prompts) | 0 | swap 6 of 6, speaker tip 8 of 10, map hint most visits |
| split-spelling errors with the two-letter correction (splitter) | 100 % | 0 % |
| "You're a ninja master!" before 7 whole answers | 0 | after about 3 words |
| **TV:** every game type's first play (fresh profile, C-P and C-L to w2-1, plus `--from w6-br1` for Sorting): a frame line, a narrated demo (a paw event with first-person lines), a readiness hold (`ready:` in `__snNavLog`), and a hand-over, **in that order**, before the first question (`unframed-turn`) | 0 missing | no game has any |
| **TV:** bare-command lines: a Sensei line under 4 words that is an instruction ("Watch.", "Your turn.", "Listen…", "Spell…", "Tap the sun!") (`bare-command`) | 0 | 410 of 847 lines are four words or fewer and not praise |
| **TV:** a one-word `listen` clip that opens a game, a beat, a level or a turn (`bare-listen`) | 0 | 41 lines begin with "Listen"; 4 in w2-1's first 35 s |
| **TV:** the median Sensei turn (all talk between two child actions) | 8–25 words | median line 4 words |
| **TV:** talk before a child action (a tap the game registers; "say it with me" doesn't count), any first meeting (`talk-before-action`) | ≤ 12 s at age 3 (≤ 12.5 s for the five runs TEACHER_SCRIPT §6 names), ≤ 15 s at 4 | up to 31 s (w1-4), 29 s (w1-7), 23 s (w1-2) |
| **TV:** a replay that plays a full frame again: a second play of a game in the same session, or a later day's play once two tellings are done (`over-framed`) | 0; later-day plays use the recap line, known games the short line | – |
| **TV:** the first Dojo level (w2-1) opens with an explanation: its first clip is `tv_learn_frame_<n>`, then `tv_learn_how` and the `tv_learn_ready` hold, before any sound | yes, both personas | "This is the dojo… Let's practise some sounds. Listen…" |
| **TV:** rhetorical questions: a "?" line with no hold or turn after it that can answer it (`rhetorical-question`) | 0 | "Did you notice?", "Do you remember this one?", "Shall we have a little break?" |
| **TV:** instructions that end in "!" (`shouted-instruction`) | 0 | 177 of 440 lines end in "!" |
| **TV:** a line addressed to the child during Sensei's own demo, while the paw moves (`demo-command`) | 0 | "Tap the sun!" as the demo |
| **TV:** a readiness hold that ends without the child (`auto-advance`) | 0 | – |
| **TV:** new sentence lines faster than 3.3 words a second (`fast-line`, from `durations.json`) | 0, or re-taken | 1 of 5 samples (TEACHER_SCRIPT §7.4) |

**The teacher's voice reference.** TEACHER_SCRIPT §0.2's three before/after moments (W1's first game, w1-4's Word Building, w2-1's opening) must read as written in C-P, apart from the child's own timing.

**The reference transcripts.** SF Part D (D1 the Sky Temple session, D2 Bamboo Village day one, D3 a two-letter error), with one change: per Dec4, every read-back reminder ends on its sound ("…It's two letters, but it's one sound. /sh/"). Read C-P and C6-P against D2 and D1 line by line. Log any other difference as intended (with the reason) or as a bug.

### 11.3 Frames

- Run `bun scripts/treadmill/sound-display.ts --check` on all cases, both personas, plus a splitter run. **It must exit 0**: every `"petal"` clip has its petal visible at its start (100 %), no `"hidden"` clip shows one (0 %), and no clip is unclassified (0).
- Run the sweep (`bun scripts/treadmill/run.ts` plus `sweep.ts --nav`): no new blockers or majors against the P0 baseline. sound-without-petal, petal-for-hidden and petal-giveaway are 0, and petal-too-small is 0 for turn and header petals.
- Copy every named still from §5, §6, §7, §8 and §9 into `playtest/fix-plan/final/frames/`, then build one contact sheet (`contact.html`) with each still beside its "before" frame from the P0 baseline.

---

## 12. Where the three diagnoses met, and what this plan does

| Moment | PERF / SCRIPT_FIXES / SOUND_DISPLAY say | This plan |
|---|---|---|
| The sort's introduction | SF C1: one sentence per chest, letters only when due. SD r44: a hero petal above the chests. | Both, in D4.1–4.2 (one lane, one file). |
| The read-back reminder | SF C4: sessions, cap 1 a level, `afterWord`. SD r28 and A15: the petal pops on "one sound", then the sound. SF D3: no sound after the line. | Dec4: the reminder ends on the sound with its petal (F2.3), and the scenes pass anchors. |
| The first World Flower visit | SF C8: the child's own petal, three facts. SD r50: the introduction animation. NAVIGATION: `usePresentation`. | B3.1–3.2, on top of the navigation workflow's presentation. |
| The trips | SF C3: show and count, don't re-teach. SD r54–55: the picture on the shoulder, a pair for two sounds, no duplicate nav petal. | teach.ts (F2.6) + GemFound (B3.3–3.4) + BigPetal (B2.3) + F3.7. |
| The Dojo's Learn | SF C2: a series with short forms. SD r18–21: hero, introduction, < x > pair, < th > pair, tally petals. | D1.1–1.3, using F2's `lettersFor` and `sameSpellingSay`. |
| Corrections | SF C5: the split-spelling case. SD r23, r26–27: pops at the wrong tile and the slot. | F2.5 builds the words and marks the sounds; F3.4 draws the pops; the scenes pass anchors. |
| The reward | SF C7: `rewardLead`, the jump offer once. SD r58, A10: petals, counted by sound. | B1.3–1.4 (App), with F2.12 for the jump. |
| Warm-ups with no petals | SS §1 and SF C21 say the warm-ups have no SoundBadge. SD (later) finds the navigation workflow has added the nav-row petal. | Done already, apart from W5 (Dec1 dots), W6 (mini petals) and the introduction animation (C2.1–2.3). |
| Ninja streaks | Jonas suspected particles. PERF: they clear; the standing cost is the issue. SS §8: the streak's praise is inflated. | F1.1–1.4 for the heat, and Dec2 for the praise. Flames stay per letter. |
| The runner | PERF 8: canvas raster. SD r38, r41: blend dots, stars not petals. SF C16: cues. | One lane, D5. |

---

## 13. Teacher's voice (TV)

**Added 27 September 2026**, after Jonas playtested the preschool levels with his 3- and 4-year-old: *"this extremely abbreviated way of talking, it doesn't help at all … teachers … say, so first, I'm going to show you how to do it. Are you ready? … I will show you this, and you will do that. Do you want to give it a go now? … Or this like weird shouted, listen … in the first dojo level where it just starts with this, and this ear appears. Teachers explain what they're doing."*

The script is [TEACHER_SCRIPT.md](TEACHER_SCRIPT.md) ("TS"): every game's frame, narrated demo, readiness tap, hand-over, praise and wrap-up, and the replay forms. The mechanics are [teacher-voice/mechanics.md](teacher-voice/mechanics.md), with the changes in TS §8.2. The house style is [SCRIPT_STYLE.md](SCRIPT_STYLE.md) §T. The work goes to the **existing lanes, by the file ownership of §2**, in the existing phases: the F lanes in P1 (the lines, the state, the readiness control, the checks), the scene lanes in P2, and integration in P3. §0.2's house rules apply unchanged. IDs are `TV-<lane>.<n>`.

### 13.1 Contracts (in place by Gate 1)

**F2, `src/content/games.ts` (new, data only):** the registry of TS §4.1.

```ts
export type GameId = "tap" | "fastslow" | "notice" | "tapall" | "tapall:in" | "rail" | "which" | "compound" | "slowpick"
  | "sounds" | "dots" | "firstsound" | "find" | "soundhunt" | "build" | "readcheck" | "learn" | "battle" | "boss" | "trial"
  | "review" | "swap" | "sort" | "run" | "story";
export interface GameDef {
  id: GameId; mech: string; name: string | null;           // null: never said aloud ("which", "readcheck")
  full: { frame: string[]; show: string | null; ready: string | null };     // line ids (TS §3); ready null: no Ready hold (as games.ts has it)
  recap: { line: string[]; show: boolean };                                   // a hold only after 21 days or a struggle
  short: string[];
  demoOwnPictures: boolean;                                                   // the paw's canonical demo can play on a short form
  readyAt: "row" | "column";
  mapPreview?: string;                                                        // tv_map_next_<game>
}
export const GAMES: Record<GameId, GameDef>;
```

**F2, `src/content/narrative.ts` and `src/scenes/narrate.tsx`:** mechanics §5.2's `FrameForm`, `GameExposure`, `frameForm()`, `GAME_TELLINGS = 2` and `GAME_REFRESH_MS`, with TS §2.2's change: `frameForm()` returns `"recap"` in both cases, and a new `recapHold(e, now): boolean` says whether the recap gets the Ready hold (true only after 21 days or `struggled`). In `narrate.tsx`: `gameForm(id)`, `framed(id)` (on the Ready answer, or on a recap's first answer), `played(id, { struggled })`, `onceInSave(key)` for `ready:first`, `ready:paw`, `sym:<name>` and `map:next:<game>`, and the migration of old saves (TS §2.2).

**F3, `src/ui/nav.tsx`:** mechanics §4.6's `holdReady()` and `readyTap()`, with TS §2.3's hand-over rule:

```ts
export type ReadyAnswer = "next" | "board" | "answer" | false;   // "answer": a right answer tapped during a hand-over Ready
export function holdReady(key: string, o: {
  ask: Say[]; again: () => unknown; show?: (live: () => boolean) => Promise<unknown>;
  after?: Say[];                  // tv_ready_now
  offer?: Say[];                  // tv_offer_show, at 24 s, once
  spot?: { next: number; show?: number };   // seconds into `ask` to spotlight ▶ (and the paw)
  handover?: boolean;             // the Ready line names the task: a right-answer tap resolves "answer"
  sound?: PhonemeId; at?: Anchor;
}): Promise<ReadyAnswer>;
/** A tap on the board during a hold. `right` is the scene's judgement of the tap as an answer. */
export function readyTap(o?: { right?: boolean }): ReadyAnswer | false;
```

**F1, `src/ui/Ninja.tsx`, `src/ui/poses.ts`:** `ninja.act("bow")` (falling back to `ready` plus a hop and a "hup" until the art lands) and `ninja.pose("ready", { face: "next" })`.

### 13.2 The work, by lane

| ID | P | TS | File (lane) | Change |
|---|---|---|---|---|
| TV-F2.1 | P1 | §7 | `src/content/lines.ts` (F2: a new block only) | A block `// --- Teacher voice (docs/TEACHER_SCRIPT.md, 27 Sep).` with the **339 new ids** of TS §7.1 (the 25 families generated one whole recording per member, as `fm_name_<w>` is). Lead-ins end on ASCII "...". Record with `bun scripts/gen-audio.ts lines` (Sulafat, en-GB, **plain text only**), then `gen-durations.ts`, `sim/tag-lines.ts --missing` and `jev-lint-lines.ts`. Re-record the **24** ids of TS §7.2 (`--force`, those ids only). Word timings (Whisper) for every line that spotlights something: `tv_ready_first`, `tv_ready_paw`, `tv_choose_q`, `tv_opt_notyet`, `tv_opt_yes`, `tv_ts_meet`, `tv_ears_demo`, `tv_pocket_frame`, `tv_ido_pair_<pair>`, `tv_learn_frame_<n>`. Every caller guards with `HAS`/`L()`, so the wording can ship before its audio |
| TV-F2.2 | P1 | §4.1 | `src/content/games.ts` (F2, new) | The registry (§13.1), filled from TS §4.1 |
| TV-F2.3 | P1 | §2.2 | `narrative.ts`, `narrative.test.ts` (F2) | `frameForm`, `recapHold`, the constants. Tests: nothing → full; told in session 1, played again in 1 → none; first play in 2 → recap, no hold; told in 1 and 2 → short in 3, none later in 3; 22 days → recap with a hold; `struggled` → recap with a hold |
| TV-F2.4 | P1 | §2.2 | `src/scenes/narrate.tsx` (F2) | `gameForm`, `framed`, `played`, `onceInSave`, the migration (stars → `n: 2`; `dojo:welcome`/`dojo:back` → `game:learn`; `dojo:first` → `game:build`) |
| TV-F2.5 | P2 | §3.14, §4.3 | `scripts/gen-teach-lines.ts`, `teach-lines.gen.ts`, `src/content/teach.ts` (F2) | The new family `tg_<g>_<p>_way` ("This is the way we spell it in mat."); `foundScript` says `tv_here_sound` + the sound + `tg_<g>_<p>_way` in place of `t_way_we_spell` + sound + `tg_<g>_<p>_in`; the trips leave out `tg_<g>_<p>_see` before world 2 (T21); `tp_<p>_hear` filters its examples to words spelt with the taught spelling (the pedagogy judge's < c > finding) |
| TV-F2.6 | P2 | §5.3, §5.4 | `src/engine/feedback.ts` (F2) | The corrections' wording (`tv_fix_together`, `tv_listen_here`, `its_this_one` ↻, `tv_not_in_middle`, `tv_fix_start`, `tv_fix_middle`); `praiseFor` picks the game's specific line first (TS §5.3's table, keyed by game id), and `yay_3`, `yay_5`, `yay_6`, `yay_9`, `yay_10` leave the everyday rotation |
| TV-F2.7 | P2 | §5.3 | `src/engine/streak.ts` (F2) | `tv_streak_10` in place of `streak_10` |
| TV-F2.8 | P2 | §7.4 | `scripts/gen-audio.ts` (F2, added by §13) | Clips under 1.2 s are levelled 3 LU under the sentences (−19 LUFS: mechanics §7.4); a warning for a sentence line faster than 3.3 words a second (`tv_learn_how` measured 3.8: take it again, or split it into `tv_learn_how` + "Then you say it with me.") |
| TV-F3.1 | P1 | §2.3 | `src/ui/nav.tsx`, `src/styles/nav.css` (F3) | `holdReady()` and `readyTap()` (§13.1): one modal nav entry built on `holdNext`; ▶ and the paw live from the first word of `ask`; the idle ladder (8 s ▶ glows with the hand, 16 s `nav_ready` ↻, 24 s `tv_offer_show` once, 40 s `nav_ready`, then quiet); Help's first press `tv_ready_help`; Hear it again = the frame and the question; ▶ dim while the paw's replay plays, then `tv_ready_now`; `navLog({ kind: "ready", id, how })`; `__snNav.pres.id` starts with `ready:` |
| TV-F3.2 | P1 | §2.3 | `nav.tsx` (F3) | `ShowAgainButton` gets `pulse`; `NAV_SLOTS.column.show` at (1204, 196); the warm-white spotlight on ▶ and the paw on their words (`spot`) |
| TV-F3.3 | P2 | §3.5 C, §3.26 | `src/ui/SoundBadge.tsx` (F3) | A petal as a join-in: `onTap` is live while Sensei waits for it (and nods, with a tink, during an explanation); a `mist` row mode for the Dojo's waiting petals, each floating down on cue; the Learn's two mini petals under the letter (Dec6) |
| TV-F3.4 | P2 | – | `src/scenes/NavDemo.tsx` (F3) | `?ready=1`: a hold with ▶, the paw, the ninja's stance and the spotlights, for F4's stills |
| TV-F1.1 | P2 | §2.3 | `src/ui/Ninja.tsx`, `src/ui/poses.ts` (F1; `poses.ts` added by §13) | The `bow` move and `pose("ready", { face: "next" })`. Art: `hero_<kai\|suki>_bow` (mechanics §8), until then the fallback |
| TV-F1.2 | P3 | §2.5 | `src/ui/ui.tsx` (F1) | Delete `Icon.ear` once nothing uses it |
| TV-F4.1 | P1 | §6, §2.4 | `scripts/treadmill/script-audit.ts` (F4) | New `--check` metrics, the TV rows of §11.2: `unframed-turn`, `over-framed`, `bare-command` (a line under 4 words that is an instruction), `bare-listen`, `talk-before-action` (age bands; "say it with me" is not a break), `turn-median`, `rhetorical-question`, `shouted-instruction`, `demo-command`, `first-dojo-opening`, `fast-line` |
| TV-F4.2 | P1 | §2.3 | `transcript.ts`, `continuous.ts`, `first-minutes.ts` (F4) | Holds written as `[ready: <id>: TAP Next after 1.4 s]` (or `TAP Show me again`, `TAP board: sock`, `TAP answer: sock`); paw events recorded; a "Ready" column beside "Holds on Next" |
| TV-F4.3 | P2 | §2.3 | `bot.ts` (F4) | A `watcher` persona that taps the paw once at every Ready hold; the default bot answers one hand-over Ready in three with a right-answer tap (it tests T4) |
| TV-A.1 | P1 | §3.4 | `src/scenes/Training.tsx` (A) | The three tricks: a star per trick, the rhyme on the speaker, the held ▶ into W1 (`tv_first_game`). **Supersedes A.1** (the speaker's "This is the sun.") |
| TV-A.2 | P1 | §3.3 | `src/scenes/OptIn.tsx` (A) | The reason first, the "If…" lines spotlighting their cards on word timings, the echoes, the 8 s and 20 s idle lines, and the `tv_opt_to_dojo` hold. Screen B's ↻ lines |
| TV-A.3 | P3 | §4.9 | `src/scenes/Placement.tsx` (A) | Show Sensei's lines |
| TV-B1.1 | P1 | §3.2 | `src/App.tsx` (B1) | Choose: `tv_choose_hello`, `tv_choose_q` (Kai and Suki spotlit on their names; live from the first word), `chose` ↻, `tv_choose_why`, `tv_choose_ninja` and ▶ |
| TV-B1.2 | P1 | §5.8 | `App.tsx` (B1) | The map: `tv_map_hint` (first two arrivals, then the 8 s nudge), `tv_map_next_<game>` once per save per game (after the arrival line, from `GAMES[…].mapPreview`), `tv_welcome_back` |
| TV-B1.3 | P2 | §5.7 | `App.tsx` (B1) | The reward: `tv_to_reward` (the save's first three with a new sound), `tv_won_one` / `tv_won_<n>` (Dec8), `audit_gem_first` **moved here** from w1-4's we do, `tv_to_flower_first` / `tv_to_flower`, `tv_rest`, `tv_jump_offer`; `tv_practise_again` said as the repeated level opens (`LevelHost`) |
| TV-B3.1 | P1 | §3.1 | `src/scenes/IntroFilm.tsx` (B3) | `tv_film_arrow` at the first held step, once per save |
| TV-B3.2 | P2 | §3.14, §3.25 | `src/scenes/Intros.tsx` (B3) | The first visit: `flower_i1` ↻, `tv_flower_petal` and the child's petal tap, `wf_i3`, the found sounds with `tv_here_sound` / `tv_another_sound` and `tg_<g>_<p>_way`, `tv_flower_bye`. The land's end: `tv_flower_recap`, `tp_<p>_hear`, the petal tap |
| TV-B4.1 | P1 | §3.6, §3.8 | `src/scenes/Stickers.tsx`, `Book.tsx` (B4) | Reward 1: the book waits closed for a tap (`tv_rw_book`), `tv_rw_every`, `tv_rw_tap`, the first sticker's `tv_rw_fast_slow`, `tv_rw_next`. Reward 2: `tv_rw2_flower`, the petal tap (`tv_rw2_tap_petal`), `tv_map_intro`, `tv_map_flower` |
| TV-C1.1 | P1 | §3.13, §3.19 | `src/scenes/Early.tsx` (C1) | `usePickGame.present()`: the frame (`tv_first_frame`, `tv_hunt_frame`); each new sound's petal as a join-in (`tv_first_sound`/`tv_next_sound` + `tv_petal_say`); the narrated I do (`tv_ido_pair_<pair>` with the pairs fixed per level, `tv_let_me_listen`, the held or stretched word, `fs_<w>`/`mid_<w>`, `tv_so_i_tap`); `holdReady` (`tv_ready_together`) on the full form only; the we do and you do (`tv_together`, `tv_by_yourself`). The `ido`/`wedo`/`youdo` pushes go |
| TV-C1.2 | P1 | §3.13 | `Early.tsx` (C1) | The first letter is written at the child's we do: `tv_watch_write`, `tv_how_we_write`, `tv_tap_it_say` and a letter tap, once per spelling per level (SF C9 stays) |
| TV-C1.3 | P1 | §3.16 A, §3.17 | `Early.tsx` (C1) | `BuildSequence`: `tv_build_frame`, `tv_build_lines`, the word card as a tap (`tv_word_card`), "I start, you finish" (the last tile live during the demo, `tv_you_find_last`), `tv_lets_say_read`, `holdReady` (`tv_build_ready`); the short and recap forms; no gem held step in the we do |
| TV-C1.4 | P2 | §3.16 B | `Early.tsx` (C1) | `ReadCheck`: `tv_readers_meet`, `tv_rc_how`, the sound buttons live on `tv_you_read_first`, the readers before the question, `tv_rc_q`, `tv_yes_<reader>`, `tv_lets_check` |
| TV-C1.5 | P2 | §3.13 B | `Early.tsx` (C1) | The find phase: `tv_ne_frame` / `tv_ne_again`, the rotating stems (`tv_which_write`, `tv_find_write`, `tv_now_find`), `tv_thats_write`; the transitions `tv_next_build` / `tv_next_build_plain` |
| TV-C1.6 | P2 | §3.15, §3.19 | `Early.tsx` (C1) | Decks: no apple for /a/ (SD A12; the I do uses the ant); flag zip, top, pin, tin and lid to Jonas's art list |
| TV-C2.1 | P1 | §3.5 | `Warmup.tsx`, `warmups.ts` (C2) | W1: `tv_ears_frame`; the demo `tv_ears_demo` with the paw on its word timings; `holdReady` with `tv_ready_first`; `tv_your_word_<w>`; the rabbit and the tortoise with `tv_ready_paw`, and the rabbit **compulsory** (the governor never drops it in W1 or W3); the notice with **tappable cards** and the petal tap, and no `W1:7` hold; Pocket Hunt's frame, I do and hand-over Ready (`handover: true`); `tv_w1_end` |
| TV-C2.2 | P1 | §3.7 | `Warmup.tsx`, `warmups.ts` (C2) | W2: the rail's frame, reading and Ready; `tv_next_game` on the swap's hold; two rows (the demo is never skipped at a first meeting); Word Squish; `tv_rw_link_book` |
| TV-C2.3 | P2 | §3.9–§3.12 | `Warmup.tsx`, `warmups.ts` (C2) | W3–W6: the recap forms, Slow Words, the middle-sound Pocket Hunt with its petal join-in, Guess My Word (`tv_guess_together` after the first right answer), Sound Dots (`t_if_you_say_sounds` after the first word) |
| TV-C2.4 | P2 | §6 | `warmups.ts` (C2) | Re-measure `secs`, the targets and the caps with the bot (mechanics §5.4) |
| TV-D1.1 | P1 | §3.26 A | `src/scenes/Dojo.tsx` (D1) | **The "Listen!" and ear opening.** Before the first `Learn` mounts: the misty petals in a row (nothing pulsing), `tv_learn_frame_<n>`, `tv_learn_how`, and `holdReady` with `tv_learn_ready`. The recap and short forms from `GAMES.learn`. **No `listen` clip opens the level, a sound or a beat** |
| TV-D1.2 | P1 | §3.26 A | `Dojo.tsx` (D1) | Each `Learn`: the petal floats down and blooms on its sound (`tv_learn_first` + `tv_here_it_comes` for the first; `tv_learn_next`, `tv_learn_another`, `tv_learn_last` after); `tp_<p>_hear` on the lesson's first sound only; the petal tap (`tv_petal_say` / `tv_petal_say_short`); `tv_watch_write`; `tv_how_we_write` / `tv_and_how_we_write`; the letter taps (`tv_tap_letter_say` / `tv_tap_it_say_short`, `tv_once_more` once per save); `tv_said_well`; `tv_learn_all_<n>`. The petal never pulses before it has bloomed |
| TV-D1.3 | P2 | §3.26 B–C, §4.6 | `Dojo.tsx` (D1) | Find: `tv_ne_new_sounds`, `tv_petal_hint` before the question. Build: `tv_build_dojo`, the recap demo on a later day (and the full I do for a school path's first Build), `tv_your_word`, `tv_learn_done`. A school path's first lesson: `tv_dj_room`, `tv_learn_frame_ways`, the known-sound order |
| TV-D2.1 | P2 | §3.18 | `src/scenes/Battle.tsx` (D2) | The first battle: the letters dim until ▶ (column); the demo with the card tap and the child finding the last sound; `tv_bar_down` on the first zap; `tv_battle_ready`; `tv_your_word`; `tv_battle_why` at the first win. Recap: `tv_battle_recap` + `tv_battle_go`. Short: `tv_battle_again`, the letters waking as it ends |
| TV-D2.2 | P2 | §3.24, §4.2, §4.4 | `Battle.tsx` (D2) | The boss (`tv_boss_calm`, `tv_boss_frame`, `tv_boss_ready`; `tv_boss_again`), the gem battle (the bar starts on ▶; hearts explained at the first lost heart), Sensei's Challenge |
| TV-D3.1 | P2 | §3.20 | `src/scenes/Swap.tsx` (D3) | Nothing tappable during `tv_swap_oh_dear`; the start word's tiles as sound buttons (`tv_swap_read_first`); `tv_swap_frame`; `holdReady` with `tv_ready_to_watch`; the demo with the child's kick (`tv_swap_kick`) and `tv_swap_in`; `tv_swap_ready`; the turn's `tv_swap_now_change`, `tv_swap_both`, `st_what_change`, the protected `st_*_changes`, `tv_swap_pick`. Short and recap forms |
| TV-D4.1 | P3 | §4.3 | `src/scenes/Sort.tsx` (D4) | The first sort: the chests open on the child's taps (`tv_spelt_like_this_<w>`), the demo (`tv_sort_ido`, `tv_sort_see`, `tv_sort_so`), `holdReady` in the column, `tv_sort_done` |
| TV-D5.1 | P2 | §3.21, §4.5 | `src/scenes/Run.tsx` (D5) | The world waits for ▶ on every run; the practice jump (`tv_run_jump`, `tv_run_jump_ok`); `tv_run_lanterns` at the first lanterns; `tv_guess_q` + the sounds for groups 1–3; `tv_run_which`; `tv_run_fix`; `tv_run_again`; `tv_run_read_first` |
| TV-D6.1 | P2 | §3.23 | `src/scenes/Story.tsx` (D6) | The title page's frame and ▶; the first child page's `tv_story_yours`, `tv_story_help`, `tv_story_tick`, and `tv_story_together` at 8 s idle (the words lighting sound by sound); `tv_story_choice`; `tv_story_q`, with the pictures shown only after it |
| TV-I.1 | P3 | §8.2 | `docs/DECISIONS.md` (P3) | Log T1–T23 |
| TV-I.2 | P3 | §8.2 | docs (P3) | Amend mechanics.md (§3.2 the recap hold, §4.2 the hand-over tap, §6.4 the battle's short form), ARCHITECTURE §6.2's `mech:` row, FIRST_MINUTES (§3 rule 3 and the Amendment's show/try labels superseded; §14's cap to 5:30), NAVIGATION (rule 3: on full forms a show leads into a Ready hold), SCRIPT_FIXES (C2's "Your turn!", C11's `swap_make`, C19's speaker, C1/C3's `tg_<g>_<p>_in` tails, Part B's three dropped lines) |

### 13.3 Acceptance (TV)

- **Unit** (F2): the `frameForm`/`recapHold` tests above, and the migration.
- **Transcript** (P3, and each lane on its own build for its own games): the §11.2 TV rows. On C-P, W1's first game, w1-4's Word Building and w2-1's opening read as TS §0.2, and the first-meeting runs are within TS §6's table.
- **Frames** (`sound-shots.ts --freeze`, into `playtest/fix-plan/TV/frames/`):
  - `w1-ready-first.png`: ▶ spotlit, the ninja in its ready stance facing it, the paw not yet shown;
  - `w1-ready-paw.png`: ▶ and the paw, the paw spotlit on "paw";
  - `w1-notice-petal-tap.png`: the /s/ petal blooming, waiting for the child's tap;
  - `w2-1-frame.png`: four misty petals in a row, **nothing pulsing, no ear**;
  - `w2-1-first-bloom.png`: the /b/ petal mid-introduction on "Here it comes…";
  - `w1-6-letters-dim.png`: the letter row dim during the frame, ▶ in the column;
  - `w1-8-kick.png`: the first tile glowing on "Can you tap it, and kick it out?".
- **The bots:** the `watcher` persona's paw replays end on `tv_ready_now` and a hold that waits; a hand-over Ready answered with a right tap counts once (no second "Can you find…").

### 13.4 The lines to record

The full list with its text is TS §7.1 (**339 ids**: 314 single lines and 25 generated families, about 59 recordings), generated from the script by `playtest/runs/teacher-voice/extract-lines.py`, which F2 can run to produce the `LINES` block. The **24 re-records** are TS §7.2. **Not to record:** `st_speaker_ok`, `st_like_this_in` and `st_and_like_this_in` from SF Part B (TS §7.3). The six samples in `docs/teacher-voice/samples/` were finished like the library (−16 LUFS) and passed their judge; F2 may keep them as takes, except `tv_learn_how` (too fast).

Record in this order:

- **TV-P1: the first session (film to Reward 2), the w2-1 lesson, and the recurring moves (about 143 ids, with the shared lines w2-1 uses).** `tv_ready_first`, `tv_ready_paw`, `tv_show_again`, `tv_ready_now`, `tv_ready_go`, `tv_ready_together`, `tv_ready_yours`, `tv_ready_to_watch`, `tv_turn_again`, `tv_offer_show`, `tv_ready_help`, `tv_film_arrow`, `tv_choose_hello`, `tv_choose_q`, `tv_choose_why`, `tv_choose_ninja`, `tv_opt_why`, `tv_opt_notyet`, `tv_opt_yes`, `tv_opt_echo_notyet`, `tv_opt_echo_school`, `tv_opt_again`, `tv_opt_ask`, `tv_opt_ok_notyet`, `tv_opt_grownups`, `tv_opt_to_dojo`, `tv_train_hello`, `tv_train_tricks`, `tv_train_gong`, `tv_train_gong_ok`, `tv_train_help`, `tv_train_try_help`, `tv_train_speaker`, `tv_rhyme`, `tv_train_hear_again`, `tv_train_speaker_ok`, `tv_train_done`, `tv_first_game`, `tv_ears_frame`, `tv_ears_demo`, `tv_your_word_<w>`, `tv_find_again_<w>`, `tv_idle_look_<w>`, `tv_show_offer`, `tv_idle_point`, `tv_fix_together`, `tv_ts_meet`, `tv_ts_fast`, `tv_ts_slow`, `tv_same_word`, `tv_ts_wrong_rabbit`, `tv_ts_wrong_tortoise`, `tv_notice_frame`, `tv_ears_on`, `tv_tap_hear_<w>`, `tv_now_tap_hear_<w>`, `tv_petal_first`, `tv_pocket_frame`, `tv_pocket_ido`, `tv_so_pocket`, `tv_pocket_ready_<n>`, `tv_fix_start`, `tv_petal_hint`, `tv_w1_end`, `tv_rw_book`, `tv_rw_every`, `tv_rw_tap`, `tv_rw_fast_slow`, `tv_rw_next`, `tv_rail_frame`, `tv_rail_ido`, `tv_rail_ready`, `tv_rail_turn`, `tv_silly`, `tv_rail_start`, `tv_next_game`, `tv_which_frame`, `tv_which_demo`, `tv_which_so`, `tv_which_q_<pair>`, `tv_which_fix_<pair>`, `tv_squish_frame`, `tv_squish_slow`, `tv_squish_fast`, `tv_squish_ready`, `tv_praise_squish`, `tv_pocket_more_<p>`, `tv_rw_link_book`, `tv_rw2_flower`, `tv_rw2_tap_petal`, `tv_map_intro`, `tv_map_flower`, `tv_map_hint`, `tv_learn_frame_<n>`, `tv_learn_how`, `tv_learn_ready`, `tv_learn_first`, `tv_here_it_comes`, `tv_petal_say`, `tv_watch_write`, `tv_how_we_write`, `tv_tap_letter_say`, `tv_once_more`, `tv_said_well`, `tv_learn_next`, `tv_petal_say_short`, `tv_and_how_we_write`, `tv_tap_it_say_short`, `tv_learn_another`, `tv_learn_last`, `tv_learn_all_<n>`, `tv_dojo_idle_say`, `tv_dojo_help_sound`, `tv_ne_new_sounds`, `tv_which_write`, `tv_find_write`, `tv_now_find`, `tv_thats_write`, `tv_build_dojo`, `tv_your_word`, `tv_learn_done`, `tv_offer_show_miss`, the praise bank (`tv_praise_*`, `tv_yay_lovely`, `tv_yay_thats_it`, `tv_streak_10`), and the idle and correction lines (`tv_listen_here`, `tv_listen_sound_again`, `tv_which_starts_it`, `tv_which_way_write_it`, `tv_both_again`, `tv_which_changes`, `tv_take_time`).
- **TV-P2: the rest of Bamboo Village's first meetings, w1-2 to w1-15, and the rewards and map (the rest).** TS §3.9 to §3.25 and §5.6–§5.9: W3–W6, First Sounds and Ninja Eyes, the World Flower's first visit, Word Building, Kai and Suki, the first battle, Sound Hunt, Sound Swap, Ninja Run, the second meetings, Story Time, the boss, the land's end, the reward leads, the map previews (`tv_map_next_<game>`, 12), `tv_welcome_back`, `tv_rest`, `tv_jump_offer`.
- **TV-P3: recap and short forms, and the games a preschool child doesn't meet before w2-1 (54 ids).** TS §4: every `*_recap` and `*_short` line, `tv_now_your_turn`, the gem battle, Sorting, Sensei's Challenge, Ninja Run's reading groups, a school path's first Dojo, the word hunt, Show Sensei and the practice dojo.

### 13.5 Fast and slow

**Added 27 September 2026.** Jonas: *"you gotta read the 'slow way to say a word' with actual little gaps between the sounds. It is too smooth now. And you need to explain more often that there are slow and fast ways to read words etc."* The script is [TEACHER_SCRIPT.md](TEACHER_SCRIPT.md) §9: five moves (the rabbit read-back, the idea, the stuck recap, the praise and Sensei's pair), placed game by game, with 24 recorded `tv_fs_*` lines and the tortoise and the rabbit on screen every time. The exact requests per lane are in [fix-requests.md](fix-requests.md), "Fast and slow (27 Sep)". IDs are `FS-<lane>.<n>`, in the existing lanes and phases, under §0.2's house rules.

**Done already:**
- the 24 lines, in a block at the end of `LINES`, recorded and checked (TS §9.8: word for word, no letter names, ≤ 3.3 words a second, −16 LUFS, suspended tails);
- their tags, in `src/core/content/line-tags.ts`;
- their lengths, in `durations.json`.

| ID | P | TS | File (lane) | Change |
|---|---|---|---|---|
| FS-F2.1 | P1 | §9.5 | `src/scenes/narrate.tsx` (F2) | `fsReadback`, `fsIdea`, `fsStuck`, `fsPraise`, `fsPair` and `fsSaid`: the per-session record in memory, the rotation and the caps (2 idea lines a level, 4 a session, never one twice in a session; once per game type per session in lands 1–2, the session's first game only from land 3). Also `afterWordSay({ fs })`, so a fast/slow line can take the praise slot |
| FS-F2.2 | P1 | §9.7 rule 6 | `src/content/instructions.ts` (its owner) | `tv_fs_praise_` and `tv_fs_stuck_` are feedback; the idea lines and lead-ins are asides (never Hear it again's instruction) |
| FS-F3.1 | P1 | §9.6 | `src/ui/nav.tsx`, `nav.css` (F3) | `FastSlowBadges` beside the speaker (in the column, under it); `NavSpec.speed`; `navSpeed()`; the tortoise lit on any `stretch:` clip; `rabbitTap()`, the Move 1 join-in (≥ 100 px while live, the spotlight on "rabbit", 8 s hop, 12 s timeout); `navLog` kinds `speed` and `rabbit` |
| FS-F4.1 | P1 | §9.5 | `script-audit.ts`, `sound-display.ts` (F4) | The checks below |
| FS-X.1 | P1 | §9.1 | `public/a/x`, the slow-word generator (the slow-word audio lane) | The slow way as pure sounds with short gaps, per-sound timings, and today's stretched clips kept beside them (FS1) |
| FS-C1.1 | P2 | §9.3 | `Early.tsx` (C1) | Word Building's Move 1 (in place of the first `say_sounds_read`), Move 5, the stuck recap and the praise; Kai and Suki's pair (no rabbit tap); First Sounds and Sound Hunt's idea in the praise slot and First Sounds' stuck recap; the badges |
| FS-C2.1 | P2 | §9.3 | `Warmup.tsx`, `warmups.ts` (C2) | W3's recap idea (in place of `tv_praise_slowly` when both are due); Slow Words and W5's Move 1 with the scene's rabbit (W5's in place of `tv_guess_together`); W6's rabbit in place of `tv_now_say_word`; Pocket Hunt's idea at the first find; the stuck recaps; **no `tv_idle_look_<w>` in Slow Words or Guess My Word**; `secs` re-measured |
| FS-D1.1 | P2 | §9.3 | `Dojo.tsx` (D1) | The dojo's Build, as Word Building |
| FS-D2.1 | P2 | §9.3 | `Battle.tsx` (D2) | Move 1 with the rabbit as the finishing zap; Move 5; the stuck recap; gem battles with the badges, the stuck recap and the idea only |
| FS-D3.1 | P2 | §9.3 | `Swap.tsx` (D3) | The start word's rabbit tap; the idea in the praise slot; no Move 5 |
| FS-D5.1 | P2 | §9.3 | `Run.tsx` (D5) | `tv_fs_run` at the first lantern group; the first catch's pair; the stuck recap taking turns with `tv_run_fix` |
| FS-D6.1 | P2 | §9.3 | `Story.tsx` (D6) | The idea on the session's first child page; the first help tap's pair |
| FS-I.1 | P3 | §9.7 | `docs/DECISIONS.md` (P3) | Log FS1–FS6. FS1 (gaps segment the word in the building games' prompts, where Sounds~Write stretches without gaps) is for Jonas to see |

**Acceptance: add these rows to §11.2** (C-P and C-L from the start with 12 stones, and `--from w5-1`; `script-audit --check` must exit 0):

| Measure | Target | Before |
|---|---|---|
| **FS:** fast and slow explained in every game that says a word slowly or asks the child to blend or segment, at least once per session per game type (lands 1–2; the session's first such game from land 3): an idea line, or Move 1's rabbit read-back (`fs-per-session`) | 0 missing | W1 only (once per save), plus W5's `t_if_you_say_sounds` |
| **FS:** an idea line said twice in a session (`fs-repeat`) | 0 | – |
| **FS:** idea lines a level / a session | ≤ 2 / ≤ 4 | – |
| **FS:** the first read-back of each game type in a session uses slow, then fast: a slow lead-in (`tv_fs_say_sounds_slow`, `tv_fs_say_slow`, `tv_fs_slow_tortoise`), then the sounds or the slow word, then the fast word, led by `tv_fs_rabbit_read`, `fm_tap_rabbit`, `tv_fs_now_fast` or `tv_fs_fast_rabbit` (`fs-readback`) | 100 % | – |
| **FS:** Move 1's rabbit tap is a child action (`navLog` kind `rabbit`), and the rabbit is live only then | yes | – |
| **FS:** the tortoise lit during every slow slot, and the rabbit during the fast word after it (`navLog` kind `speed`, or the scene's own cards in the warm-ups) (`fs-badges`) | 100 % | – |
| **FS:** the word said before the child's answer in Slow Words, Guess My Word, Ninja Run or Kai and Suki (`tv_idle_look_<w>` there, or a fast word before the tap) (`fs-answer-leak`) | 0 | `tv_idle_look_<w>` at 8 s idle (TS §5.5) |
| **FS:** talk before a child action, in runs with a fast/slow line | ≤ 12 s (TS §9.3 estimates ≤ 11.2 s) | – |
| **FS:** the slow way has audible gaps: every `[w, slowly]` clip is its pure sounds with a silence between each pair, and no sound trails into a vowel (Jonas listens to a sample of 10) | 100 %; Jonas's ear | stretched, no gaps ("too smooth") |
| **FS:** the new lines are word for word (faster-whisper), have no letter names, and are ≤ 3.3 words a second at −16 LUFS | 24 of 24 | 24 of 24 (TS §9.8) |

**Frames** (`sound-shots.ts --freeze`, into `playtest/fix-plan/TV/frames/`):
- `fs-rabbit-live.png`: Word Building's first read-back, the rabbit big, pulsing and spotlit beside the speaker;
- `fs-tortoise-step.png`: the tortoise lit mid-step during a slow word, with the tile of the sound being said lit;
- `fs-w5-rabbit.png`: W5, the scene's own rabbit pulsing after the sounds.
