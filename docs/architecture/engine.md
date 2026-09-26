# The engine, ports and adapters

Modules: `src/core/engine/`, `src/core/index.ts`, `src/adapters/`. Types: `CoreStep`, `CoreBoot`, `CoreState`, `CoreEnv`, `CoreConfig`, `CoreInput`, `Output`, `Awaiting`, `PendingScript`, `RunningBeat`, `MetaState`, `CoreView`, `GameCore` and the ports (`AudioPort`, `PresenterPort`, `ClockPort`, `StoragePort`) in `src/core/types.ts`. Overview: [ARCHITECTURE.md §7](../ARCHITECTURE.md#7-activities-as-state-machines-and-the-engine) and [§11](../ARCHITECTURE.md#11-ui-and-audio-as-adapters).

The engine is the whole core in one pure function:

```ts
step(s: CoreState, input: CoreInput, env: CoreEnv): { state: CoreState; outputs: Output[]; events: GameEvent[] }
```

It owns everything that must be implemented once:
- the script runner and its acks;
- eager answers, too-early taps and taps during naming;
- attempt timing, support and `uses`;
- the idle ladder, Help and replay;
- the streak and praise;
- stars and stickers;
- the beat lifecycle, including FIRST_MINUTES's time governor;
- screens and navigation;
- embedded mode for the migration;
- folding every event it emits into the learner, ledger, director and reward state.

`createCore(env, ports)` in `index.ts` wraps it in a stateful `GameCore` for the adapters. Built in stage 3 (headless), then in the browser from stage 5.

## 1. Input handling

| Input | Handling |
|---|---|
| `life boot` | fold the log (from scratch until stage 8; from the snapshot after, re-folding only a reducer whose version hash changed, lazily after the first frame); `session.start` (with the seed, `gapH` and `ageBand` from `ageBandFor`); `director.next` → the first beat or screen |
| `act tap` | §3 |
| `act stray` | `obs.ignored("not-a-target")`; a `too-early` cue if Sensei is talking |
| `act text` | the profile name (setup) |
| `ack out` | a `say`: `exp.said` (completed, heardMs = `ms`, missingAudio), and the caption clears. An ack with `ms === 0` for an utterance that never started is dropped. If `out === script.waitingFor`, the script advances (§2) |
| `timer id` | `idle:n` → the idle ladder (§4); `script:wait` → the script advances; `beat:*` → beat timers and the time governor; anything else → `machine.timer` |
| `life hidden` | `session.pause`; `hush`; cancel timers, keeping the remaining time; mark the playing utterance for re-queueing |
| `life visible` | if hidden for ≥ 5 minutes: `session.end hidden`, then a new `session.start`, and the director resumes (recap rules apply). Otherwise `session.resume`: re-send the cut utterance, then restore the timers |
| `life rotated-away` / `rotated-back` | like hidden and visible, without ending the session (today's `pauseSpeech`: the cut clip is said again) |
| `life quit` | `beat.end quit`, `session.end quit` |
| `grown-up` | `profile.change`; a placement, "Start from here" or jump re-plans (the director's queue is rebuilt) |
| `embed` | §9 embedded mode |

Deferred: every input first becoming an `input` event, for exact replay. Until then a bug report is the log, the session seed and the scripted player's inputs.

## 2. The script runner

`PendingScript = { ops, at, waitingFor?, then }`. Running a script executes ops from `at` until one blocks:

| Op | Does | Blocks? |
|---|---|---|
| `say` | emit a `say` output (a new `OutId`); `speaking[out] = { utt, sentT: t }`; set the caption | only when `barrier` |
| `cue` | emit a `cue` output with `ack = barrier`, and an `exp.cue` event with the cue's tags and needs (from the cue table in core/content) | only when `barrier` |
| `sfx` | emit `sfx` | no |
| `wait` | a `script:wait` timer for `ms` | yes |
| `flag` | `beat.flags[key] = value` | no |
| `attempt` | complete the draft (§5), emit `obs.attempt`, fold it, update the streak | no |
| `praise` | emit a praise line, the tier-up ops, or nothing (§6) | only when `barrier` |
| `event` | stamp and emit the draft | no |
| `timer` / `cancel-timer` | set or clear a named timer (an output) | no |
| `hush` | emit `hush`; every `speaking` utterance will ack as not completed | no |

When a blocking op's ack (or timer) arrives, `at++` and the runner continues. At the end it follows `then`:
- `resume` → `machine.resume` → a new script;
- `await` → set `awaiting` (§5) and schedule the idle ladder;
- `done` → the activity ends and the beat moves to its outro;
- `beat: …` → the beat lifecycle (§7).

**Speech order.** `say` outputs are queued by the audio adapter in order. Two non-barrier `say`s play one after the other, never over each other. Interrupting is always an explicit `hush`.

## 3. Eager answers, taps during naming and too-early taps

On `act tap aff`:
1. If `s.paused` → `obs.ignored("paused")`.
2. If `aff` is `help`, `replay`, `home` or `next`, handle it (§4, §7).
3. If `awaiting` is set and `aff ∈ awaiting.answers` → an answer: `machine.act(s, aff)`.
4. If a script is running, its current op is a `say` whose `utt.interruptible` is true, `then` is `await` with `acceptEarly`, and `aff ∈ then.await.answers`:
   - emit `hush`;
   - set `awaiting` from `then.await`, with `early` = true;
   - `latencyMs` = −(the utterance's estMs − `during.heardMs`), or estimated from `sentT` when `during` is absent;
   - drop the rest of the script (by the protocol's rule, the interruptible utterance is the last op before the await);
   - then as 3.
5. If Sensei is naming the cards (a `naming` utterance is playing) and `aff` is a card → `obs.ignored("naming")`, and with `support.earlyTap: "echo"` an `echo` cue (the card is spotlit and says its name after the naming clip); with `"wiggle"` a `too-early` cue.
6. Otherwise → `obs.ignored`:
   - `"i-do"` during a demonstration;
   - `"too-early"` while Sensei talks, with a `too-early` cue (the wiggle);
   - `"busy"` during animations;
   - `"not-a-target"` for disabled affordances.

   `whileSpeaking` and `screenPosition` are set. Taps don't change the machine.

## 4. Idle ladder, Help and replay

- **Idle ladder.** When `awaiting` is set in you do, the engine schedules `idle:0` at `awaiting.idle[0].afterMs` from the end of the asking utterance. When a step fires:
  - add its hints to `awaiting.hints`: `glow` → `idle-glow`; `reask` → `repeat-prompt` (the re-ask becomes the new `askedBy`); `paw` → `paw`;
  - emit `obs.idle` with the hints given;
  - run `machine.timer(s, "idle:n")`;
  - schedule the next step.

  The default and warm-up ladders are both: 8 s, glow + ask again; 16 s, the paw (it points by default; in the warm-ups it taps the answer and the item ends `modelled`, with no attempt). Any child tap (answer or not) resets the ladder from that point.
- **Help.** `presses++`; `machine.act(s, "help")`; the machine's ops carry the hint. The engine records the hints in `awaiting.hints` (press 1: `strategy` if a strategy line was said, then `repeat-prompt`; press 2: `glow`; press 3 and after: `paw`) and emits `obs.help`. Outside an activity (the map, the flower), Help plays the screen's `help_*` line.
- **Replay.** `replays++`; `machine.act(s, "replay")`; hint `replay`; `obs.replay`.

## 5. Awaiting, and completing attempts

`Awaiting` records `since`, `itemShownT` (the first await of the step), `askedBy` and `askedEndT` (the last asking utterance and the end of it, from its ack), `askedNeeds` (that utterance's non-content needs), `lastActivityT`, `hints`, `helpPresses`, `replays`, `tapsBefore` and `idleStep`.

When an `attempt` op runs, the engine fills in:

```
timing.shownMs    = t − itemShownT
timing.askedBy    = awaiting.askedBy
timing.latencyMs  = early ? −(remaining ms of the prompt) : t − askedEndT
timing.idleMs     = t − max(lastActivityT, askedEndT)          // nothing said, shown or tapped
timing.early      = early
timing.tapsBefore = awaiting.tapsBefore
support.hints     = awaiting.hints (this step, in order)
support.level     = max help level of those hints (replay 0; repeat-prompt, listen-again, place-of-error, strategy 1;
                    glow, idle-glow, point-slot, reduced-choices 2; told, paw 3)
support.helpPresses, support.replays, support.timed (from the draft), support.limitMs
uses              = awaiting.askedNeeds ∪ { mech:${mechanic} }
```

The machine's draft sets `target.answerPosition` (it knows where it put the answer) and `choices`.

After a wrong attempt, the step's hints carry over: the correction adds `listen-again`, `place-of-error` or `reduced-choices`. After a correct one, they reset for the next step.

## 6. Streak, praise, stars and stickers

- **Streak** (`meta.streak`):
  - `n++` on an **independent** correct child attempt (you do or we do; attemptNo 1; level ≤ 1; not a probe; `choices` ≥ 2);
  - `n = 0` on a wrong one (not a probe);
  - tiers at 3, 6 and 10 (today's `streak.ts`). The streak carries across chained lessons (FIRST_MINUTES rule 8: from Lesson 1 into Lesson 2).
- **`praise` op:**
  - if the last attempt crossed a tier → a `tier-up` cue (ack) + the ninja's `streak_3`, `streak_6` or `streak_10` line (barrier) + `game.reward streak-tier`;
  - otherwise, if at least `support.praiseEvery` right answers have passed since the last praise line → a praise line from the `vary` pool: never `yay_6` (that is the streak's line), never the same line twice running, rotated from `ledger.lines`. Build uses `well_spelt` and read uses `well_read` one time in three;
  - otherwise nothing: the ninja's move is the praise.

  This replaces `hearNinjaLine`'s caption race and `tierBeat`.
- **Lost streak:** on a wrong attempt with n ≥ 3 before it, the engine inserts a `streak-lost` cue + `streak_lost` ("Keep going, ninja!") before the machine's correction ops.
- **Stars** come from the machine's `ActivityResult` (independent you-do items only). The engine emits `game.reward stars` with `shown` from the reward template (`silent` in the warm-ups), and `meta.stars[episode]` keeps the best.
- **Stickers** (FIRST_MINUTES §6), at the beat's outro:
  - a **picture** sticker for every picture the child met in the lesson: named aloud with its `name-card` cue and on the board while the child played (FIRST_MINUTES's `recordMet`; its Reward 1 gives all five cards of Lesson 1, tapped or not), plus pictures shown in a reward such as the fish-dog;
  - an upgrade to **word** (gold edge, spelling shown) on the first correct read or spell of that word;
  - at most one **shiny** sticker per lesson, only where the reward template names it (`shiny: "fishdog"`);
  - `game.reward sticker` with the tier, and a `sticker` cue. `meta.stickers` keeps collection order.
- **Probes** give no stars, stickers or streak.

## 7. The beat lifecycle

1. The director gives a `Beat`; `beat.start` (challenge, `requires`, `introduces`, why). `requires` is checked here; `introduces` is judged at first use inside the beat.
2. **Intro:** the beat's `intro` utterances as `say` ops (barriers), then `beat: intro-done`. A `scripted` beat runs its steps (say, cue, wait, say-with-me).
3. **Activity:** `machine.init(spec)` → the script. At every `item.end`, `planner.adapt` → `machine.replan`.
4. **Outro:** the payoff utterances, the rewards (stars; gem energy cues from the learner's `energy`; stickers; `game.progress` for units passed), then `beat: outro-done`.
5. `beat.end` (stats, result) → `director.next`.
6. **Non-activity beats** (film, story narration, exposition, recap, reward, choose) use `body` utterances or their machine the same way. `screen` beats run the `screen` machine until the child leaves.
7. **The time governor** (episodes with a `budget`): the engine keeps the episode clock; a `beat:cap` timer at `capMs` makes the machine finish the current item by the paw with `fm_last_one`, then the episode closes. Skipping optional templates is the director's (director.md §1).
8. **Stats** (`RunningBeat.stats`), accumulated as the beat runs:
   - `talkMs` from `exp.said` heard ms;
   - `talkBeforeActionMs` = the time from `beat.start` to the first await of a child phase;
   - `maxSpeechRunMs`;
   - `deadAirMs`: awaiting time with no speech, cue or idle step for more than 10 s (cues are logged, so this is exact);
   - `longestNoPraiseMs`, `helps`, `idleHints` and `strayTaps`.

**Screens.** `screen` follows the director (beat, reward, rest, finale) and the child's navigation (map stones, home, flower, book, grown-ups hold), with a `nav.screen` event for each change, and an `exp.shown` with the screen's `needs`. The map comes from the director's queue: the first queued episode is the glowing stone.

## 8. Folding and persistence

- **Every event the engine emits is folded at once** into `learner`, `ledger`, `director` and `meta` by their pure `apply`. The state is therefore always the fold of the log (a property test).
- **After each step with events,** the engine emits one `persist` output with them. From stage 8, every 200 events and at `session.end`, the output also carries a `CoreSnapshot` with each reducer's own version hash.
- **Retention** is the storage adapter's job: after `recentSessions` it compacts exposures (drops parts and text) and prunes `input` events and cosmetic cues. It never drops anything a fold reads, so re-folding a pruned log gives the same state ([events.md §2](events.md#2-kinds-and-when-each-is-emitted)).

## 9. Embedded mode (stages 5–6)

During the migration, old scenes keep routing, rewards and the Save, and ask the core to run one beat or activity at a time:

```ts
const result = await core.runBeat(template);   // dispatches { in: "embed", what }, resolves on the embed-done output
```

- The core runs that one beat or activity with the director set aside (`director: null`): no insertions, no routing. Its events are real (`origin` unset) and are appended to the child's log from stage 5.
- The old scene renders `view().activity` with its existing components (for the warm-ups, the FIRST_MINUTES owner's `FastSlowStage`, `TapAllGrid`, `ReadingRail` and friends) and maps cues with `useCues`.
- When the `embed-done` output arrives, the scene feeds `result` (stars, items) to its existing reward flow and to `store.ts`, which the map still reads until Save v2 (stage 8).
- **The audio adapter owns `say()` alone** while an embedded beat runs. A `say()` from old scene code in that time is refused, with a dev warning and a `sys.error`, so the core's queue is never cancelled by a stray call.

## 10. Ports and adapters (`src/adapters/`)

**Audio (`audio.ts`, over `src/engine/audio.ts`).**
- It keeps a FIFO queue of utterances, playing each with `say(parts, { keep: true, reveal })` in turn.
- **Mapping:** `UttPart` → `Say`, one to one, including FIRST_MINUTES's `{ onset: w }` item when it lands. `sounds.light` → `onSeg` calls `presenter.cue({ cue: "light-seg", index })` locally; it is not an input. Spotlights and sticker landings use FIRST_MINUTES's `onClip` and word-timing hooks.
- **The ack** reports:
  - `completed` = `say()`'s boolean;
  - `ms` = elapsed playing time × `FAST`;
  - `missingAudio` when a clip's buffer failed to load (a small hook in `audio.ts`: `load` failures reported to a listener).
- **`hush()`** hushes and acks every queued utterance that never started with `completed: false, ms: 0`.
- **The tap hook** adds `during: { out, heardMs }` to taps while an utterance plays.
- **Captions** show `utt.text` (with `reveal`). The turn-your-phone pause becomes `rotated-away` and `rotated-back` inputs.
- Lipsync, ducking and music are unchanged.

**React (`react/`).**
- **`CoreProvider`** owns one `GameCore` per profile.
- **`useCore(selector)`** uses `useSyncExternalStore`.
- **`useActivity(machine)`** returns `{ view, act, aff }`. `aff(id)` spreads `data-aff`, `aria-label` and `tapProps` (a pointerdown dispatches `act`).
- **`useCues(handler)`**: the scene maps cues to its existing choreography and returns a promise; barrier cues are acked when it resolves.

  | Cue | Today's code |
  |---|---|
  | `right` | `rightAnswer`, `gift` (for living things) |
  | `reveal-spelling` | `castSpelling` |
  | `hint` | the gold bobbing ring |
  | `paw` | `TapHint` |
  | `name-card`, `echo` | the warm-white spotlight (FIRST_MINUTES §11) |
  | `fast-slow`, `sound-dots`, `pocket`, `rail-light`, `merge`, `beads` | FIRST_MINUTES's `FastSlowStage`, `SoundDots`, `TapAllGrid`, `ReadingRail`, `CompoundMerge`, `LessonBeads` |
  | `place-tile` | `launch` |
  | `tier-up`, `streak-lost` | the ninja's power-up and "think" |
  | `monster`, `baron` | the monster reactions, the villain cut-in |
  | `sticker`, `petal`, `celebrate` | the Sticker Book fly-in, the petal through the mist, fx |

- `App.tsx` routes by `view.screen` one chapter at a time (stage 7, coordinated with its owner).

**Clock (`clock.ts`):** `setTimeout` and `clearTimeout` scaled by `FAST`; `now()` = `Date.now()`. This is the only place the browser reads the clock for the core.

**Storage (`storage.ts`):**
- IndexedDB, with one object store for events (keyed by profile and seq) and, from stage 8, one for snapshots. A small snapshot also goes in localStorage.
- `profiles()` is a projection of `profile.change created` events.
- From stage 8, on the first boot on the core, the current `Save` (from `store.ts`) becomes `profile.change legacy-import`.
- `export(profile, sessions)` is the grown-ups "Download play log".
- Shadow events (`origin: "shadow"`) are never written here.

**Bots.** `window.__core = { view, dispatch, log, oracle }`, where `oracle` exists only when `config.debugAnswers` (dev and `?bot`). From stage 5, `bot.ts` prefers `__core.view().debug.answers` when `__core` exists and falls back to `__snState` otherwise, so a scene ported to the core keeps its bots. The generic `bot.ts step()`: read the answers, and dispatch pointerdown on `[data-aff="…"]`. `window.__snState` goes at stage 8.

**Stage 1 bridge (`bridge.ts`).** Before any scene runs on the core, it shadow-logs today's game, **in dev and on the treadmill only** (`?shadow`, and every treadmill run). Every event it makes has `origin: "shadow"`, lives in memory and `window.__core.log()`, and is never written to a child's IndexedDB. The learner ignores shadow attempts.
- **Speech:** `audio.ts say()` calls one optional sink with `(items, { reveal }, result, heardMs)`. It is shaped like FIRST_MINUTES's `onClip` hook and lands with or after that change, agreed with its owner. The bridge builds an `Utterance` with `LineBook.utter` (tags and needs from the line meta) and emits `exp.said`.
- **Attempts:** `store.ts` `recordSpell`, `recordRead` and `recordWordSpelt` call one optional sink. The bridge emits minimal `obs.attempt`s (no timing or hints; `choices` 0 marks them unscored), enough for tagged transcripts and the ledger.
- **Pick games** (every oral, first-sound, Find, placement and training game) record nothing today. One agreed sink call in `usePickGame`, with the Early.tsx owner (who is adding its quiet mode and echoes for FIRST_MINUTES), reports each answer with its hints. Until it lands, `stars-inflated` and per-level `beat-too-long` report "not measured" on the shadow log instead of passing.
- **Levels** stand in for beats: the bridge infers the level from the URL and `__sn` and emits a shadow `beat.start` per level.

## 11. Tests (`src/core/engine/*.test.ts`)

1. **Script runner:** barrier ops wait for their ack or timer; non-barrier ops don't; `hush` makes every speaking utterance ack as not completed; `then` is followed exactly once.
2. **`exp.said` comes from acks:** an utterance acked `completed: false` after 900 ms gives `exp.said { completed: false, heardMs: 900 }`; one hushed before starting (ack `ms` 0) gives no event.
3. **Eager answer:** a tap on the answer during the interruptible prompt → `hush`, then an attempt with `early` true and negative latency, and the idle ladder is not scheduled. A tap on a card during naming → `obs.ignored("naming")`, with an `echo` cue under warm-up support and a `too-early` cue under default support, and no attempt.
4. **Timing** (Jonas's example, driven): the item is shown at t0; the prompt ends at t0+1.2 s; Help at t0+2.6 s (the question again, which ends at t0+4.4 s) and at t0+4.4 s (the glow); a tap on < i > at t0+7.4 s → `shownMs` 7,400, `latencyMs` 3,000, `idleMs` 3,000, level 2, hints [repeat-prompt, glow], `askedBy` = the re-ask, `uses` ⊇ `mech:tile-to-line`.
5. **Idle ladder:** with no input, `obs.idle` at 8 s (hints idle-glow and repeat-prompt) and 16 s (paw) after the asking utterance ends; a tap resets it. Under warm-up support, the 16 s step ends the item `modelled` with no attempt.
6. **Streak and praise:** three independent answers → the third `praise` op becomes a `tier-up` cue + `streak_3` and no ordinary praise; an idle-glow answer doesn't count; a wrong answer after a streak of 4 inserts `streak_lost` before the correction; with `praiseEvery` 3, two right answers give no praise line.
7. **Praise variety:** 50 praise ops never repeat a line twice running, and never use `yay_6`.
8. **Stickers:** W1 played by a perfect child gives picture stickers for sun, sock, cat, sausage and moon in collection order; a later correct spelling of *cat* upgrades it to `word`; a probe item gives none.
9. **Cues are logged:** every cue output has a matching `exp.cue`; a gem-energy cue before `obj:gem` is explained gives a `used-before-explained` finding in the audit test.
10. **Pause and rotate:** `rotated-away` mid-utterance → hush, and on `rotated-back` the same utterance is sent again; timers resume with their remaining time.
11. **Hidden for 5 minutes or more** → `session.end hidden`, then a new `session.start` on visible.
12. **The beat lifecycle:** `beat.start` (with `requires` and `introduces`) → intro `exp.said` → the activity → `beat.end` with stats, whose `talkBeforeActionMs` equals the time to the first child await.
13. **The time governor:** at `capMs`, the current item is finished by the paw with `fm_last_one` and the episode closes.
14. **Embedded mode:** `runBeat(W1's tap-all template)` resolves with the activity result; no director call happens; a `say()` from outside the adapter during it is refused with a `sys.error`.
15. **Folding:** after any run, `state.learner == learner.fold(log)` and `state.ledger == ledger.fold(log)`.
16. **The boundary test** (`src/core/boundary.test.ts`): no file under `src/core` imports react, `src/engine`, `src/ui`, `src/scenes`, `src/App` or `scripts/`, and none uses `Date.now`, `Math.random`, `window`, `document`, `localStorage`, `setTimeout` or `fetch`.
17. **Adapters** (stage 5, Playwright): browser/headless parity for W1 with the scripted policy and a fixed seed (the same `exp.said` line-id sequence), and the same line ids as the FIRST_MINUTES implementation's audio log for the same taps.
