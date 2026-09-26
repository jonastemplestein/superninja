# The event log

Module: `src/core/log/`. Types: `GameEvent`, `EventDraft`, `Attempt`, `Retention`, `ReducerId`, `CoreSnapshot` in `src/core/types.ts`. Overview: [ARCHITECTURE.md §3](../ARCHITECTURE.md#3-events).

One append-only log per child. Everything the child heard, saw and did, and every decision the game took, is an event. The learner model, the ledger, the director's memory, the rewards, the transcript and the audits are all folds over it.

## 1. Envelope

Every event has `v: 1`, `seq`, `t`, `sid`, and optionally `beat`, `item` and `origin`.

- `seq` is gapless and strictly increasing per profile. Appends are idempotent by `seq`: appending a seq that already exists with the same content is a no-op, and different content throws.
- `t` is the time of the input that caused it. The core never reads a clock.
- `sid` is `${profile}:s${n}`. Beat ids are `${sid}:b${n}`; item ids are `${beat}:i${n}` (n counts requeued items too).
- `origin: "shadow"` marks events the stage 1 bridge reconstructs from today's scenes. They exist in dev and on the treadmill only, are never written to a child's IndexedDB, and the learner never folds shadow attempts.
- Machines and the director produce `EventDraft`s. The engine stamps them: it adds `v`, `seq`, `t`, `sid`, and `beat`/`item` when they are absent.

## 2. Kinds, and when each is emitted

| Kind | Emitted by | When | Retention |
|---|---|---|---|
| `session.start` | engine | `life boot`, or the first input after a session ended; carries the derived `ageBand` | durable |
| `session.end` | engine | quit; rest accepted; the age's budget reached after a success; 5 minutes hidden; profile switch; run limit (headless) | durable |
| `session.pause` / `session.resume` | engine | hidden or visible; rotated away or back; grown-ups area | durable |
| `profile.change` | engine | created; hero chosen; school year (opt-in, silence, September moving up, grown-up); band (opt-in, the check, grown-up); age (grown-up); placed (placement, jump ahead, "Start from here", school year); settings; legacy import (first boot on Save v2) | durable |
| `nav.screen` | engine | every screen change, with `by` | durable |
| `beat.start` | engine | before a beat's intro, with the director's `ChallengeReport`, `requires`, `introduces` and `why` | durable |
| `beat.end` | engine | after the outro, with `BeatStats` and the `ActivityResult` | durable |
| `item.start` | engine | when the protocol starts an item: the full `CoreItemSpec`, the presented `options` with positions (a dictation's bank lives here), scaffold, phase, choices, predicted success, why, probe | durable |
| `item.end` | engine | when the protocol finishes an item, with its outcome | durable |
| `exp.said` | engine | on the audio adapter's **ack** of a `say` output, never when it is sent | compact |
| `exp.shown` | engine | when an item becomes answerable, and on every screen change, with the screen's `needs` | compact |
| `exp.cue` | engine | every cue output, with the cue's tags and needs | durable for `hint`, `gem-energy`, `sticker` and `petal`; recent for the rest |
| `exp.modelled` | protocol | when Sensei finishes an I do demonstration | durable |
| `obs.attempt` | engine, from a machine's `attempt` op | every answer (see §3) | durable |
| `obs.help` | engine | every Help press, with the hint it gave | durable |
| `obs.replay` | engine | every "Hear it again" press | durable |
| `obs.idle` | engine | every idle-ladder step that fires, with its hints | durable |
| `obs.ignored` | engine | a tap that was not taken as an answer: during naming, too early, during I do, busy, not a target, paused | durable |
| `obs.choice` | engine | hero, school year, story branch, map stone, flower petal, book sticker, speed button, rest offer | durable |
| `game.decision` | planner, director, protocol, detectors, pacing | whenever one of them makes a non-trivial choice (requeue, ease off, insert an explanation, skip an optional template, drop a band, offer jump ahead) | durable |
| `game.reward` | engine | stars (shown or silent), streak tier, gem energy, gem, petal, sticker (with tier), celebration | durable |
| `game.progress` | engine, from pacing and the director | unit started or passed (with `by` and the watch list), story finished, land entered, onboarding step | durable |
| `input` | engine (deferred) | every input the core receives, first | recent |
| `sys.error` | engine | a caught error | durable |
| `sys.checkpoint` | engine (stage 8) | a snapshot was written, with each reducer's version hash | durable |

**The retention rule: nothing a fold reads is ever pruned.** "Compact" events are kept for ever; after `recentSessions` sessions (default 10) an exposure keeps only `UtteranceCore` (who, purpose, tags, needs, lines, estMs, moment) and loses its parts and text, which only transcripts use (and which can be rebuilt from the line ids). "Recent" events (raw inputs and cosmetic cues) are kept for the last `recentSessions` sessions: no fold reads them.

**Size.** Play produces about 30 events a minute. With compaction, a year of daily 12-minute play is roughly 25 MB in IndexedDB, and folding it from scratch takes a few hundred milliseconds, done after the first frame.

## 3. Attempts: the rules

- **Granularity** follows sw.ts `Evidence`:
  - spelling items: one attempt per slot, with `step` = the slot;
  - reading items: one per word, with `target.gpc` = the spelling at the contrast or error position;
  - pick games: one per tap (tap all: one per find or wrong tap);
  - rails judged on order: one per tap;
  - Sound Swap: two per chain step (`step` = 2k for which sound changes, 2k+1 for which spelling);
  - story pages: one per page read, and one per question.
- **`attemptNo`** counts tries at this step. 1 is the first try.
- **I do produces no attempts.** Sensei's demonstration is an `exp.modelled`. Taps during it are `obs.ignored` with `why: "i-do"`. A warm-up item the idle paw finished produces no attempt either.
- **`choices`** is the live options when the answer was given. `choices ≤ 1` is a forced tap (the last tile of a bank with no distractors, a guided tap on the one pulsing button): it is logged but never scored.
- **Timing** (filled by the engine):
  - `shownMs` runs from when the step became answerable.
  - `askedBy` is the utterance that asked the question: the prompt, or a correction, hint or idle re-ask that asked it again.
  - `latencyMs` runs from the end of `askedBy`. It is negative for an answer given during an interruptible prompt, measured from the adapter's `during.heardMs` when present.
  - `idleMs` is time with nothing said, shown or tapped since the last activity. This is Jonas's "staring".
  - `early` is true when the answer interrupted the prompt.
  - `tapsBefore` counts ignored taps since the step became answerable.
- **Support** (filled by the engine): every hint on this step before the answer, in order, including idle ones and those given by the phase (the we-do glow); `level` = the maximum help level of those hints (see `HelpLevel`); Help and replay presses; whether it was timed.
- **`target.answerPosition`** (from the machine): where the right answer was, left to right, for the position-bias detector.
- **`uses`** (filled by the engine): the non-content needs of `askedBy`, plus `mech:${mechanic}`. The ledger credits first use and independent use from these, and only these.
- **`probe`**: a placement or jump-ahead item. Evidence for the learner only; no ledger change, reward or streak.
- **Outcome of an item** (on `item.end`), from its attempts:
  - `independent`: the first attempt on every scored step was correct and at help level ≤ 1;
  - `helped`: every step correct at the first try, but at least one at help level ≥ 2;
  - `corrected`: at least one error before success;
  - `modelled`: I do, the protocol gave the answer away, or the warm-up paw finished it;
  - `abandoned`.
- **Evidence** comes from `curriculum.evidenceFor(spec, step, mechanic)` ([content.md §2](content.md#2-evidencefor-which-kcs-an-attempt-bears-on)).
- **Errors** are classified by the machine ([activities.md §4](activities.md#4-error-classification)).

## 4. Exposures: the rules

- An `exp.said` carries the whole `Utterance`: parts, text, tags, needs and purpose (compacted later, §2).
  - `completed: false` means it was cut off. `heardMs` is how much was heard.
  - An utterance that never started (hushed while still queued) is never logged. The adapter acks it with `completed: false, ms: 0`, and the engine drops acks with `ms === 0` for utterances that never started.
- An `exp.shown` carries a `ScreenSummary` with `show` tags for every visible spelling, word and picture, and the screen's `needs` (a gem ring, a timer bar, hearts).
- An `exp.cue` carries the cue, and the tags and needs from the cue table in `core/content/cues.ts` (a `gem-energy` cue shows `obj:gem` and needs `idea:gems-fill-with-practice`; a `sticker` cue needs `obj:sticker-book`).
- An `exp.modelled` carries `demonstrate` tags: the mechanic, the item's GPCs and words.

## 5. Log mechanics

- **`log/events.ts`:** constructors per kind, `stamp(draft, s)`, `retention(kind, event)` and `compact(event)`.
- **`log/fold.ts`:** `fold(events, reducers, from?)` applies events in `seq` order. Reducers are pure `(state, event) → state`. Until stage 8 the core folds the whole log at boot. It is cheap (§2).
- **`log/snapshot.ts`** (stage 8): a snapshot is `{ atSeq, t, reducers, learner, ledger, director, meta, profileState }`.
  - It is written every 200 events and at every session end.
  - `reducers` holds **each reducer's own version hash** (`learner`, `ledger`, `director`, `meta`). On boot, a mismatch re-folds only that reducer, from the durable and compact events, after the first frame; the others load from the snapshot. A better learner model therefore applies retroactively without touching the ledger.
- **`log/upcast.ts`:** lifts events with an older `v` to the current shape. The first schema change adds it, with a fixture.
- **Compaction** (the storage adapter): after `recentSessions`, compact `exp.said` and `exp.shown`, and drop `input` and recent cues. Attempts are never dropped from the export, because they are the data for fitting parameters later.
- **Storage** (browser): an IndexedDB object store per profile, keyed by `seq`, plus a snapshot store from stage 8. A small snapshot also goes in localStorage (iOS can evict IndexedDB). Shadow events are never stored here.
- **Export:** `StoragePort.export(profile, sessions)` returns events as JSON: the grown-ups "Download play log".

## 6. Examples

Jonas's example is in [ARCHITECTURE.md §3.2](../ARCHITECTURE.md#32-jonass-example-as-data). An explanation, heard in full:

```json
{ "v": 1, "seq": 2210, "t": 1790400000000, "sid": "p7:s9", "beat": "p7:s9:b1", "kind": "exp.said", "out": "o88",
  "completed": true, "heardMs": 4100,
  "utt": { "who": "sensei", "purpose": "explanation", "moment": "gem:ai>ae", "variant": 0,
           "parts": [ { "line": "t_way_we_spell" }, { "gap": 100 }, { "sound": "ae" }, { "line": "tg_ai_ae_in" }, { "gap": 350 }, { "line": "t_two_letters" } ],
           "lines": ["t_way_we_spell", "tg_ai_ae_in", "t_two_letters"],
           "text": "This is the way we spell /ae/ ...in rain. It's two letters, but it's one sound.",
           "tags": [ { "key": "gpc:ai>ae", "as": "explain" }, { "key": "sound:ae", "as": "mention" }, { "key": "word:rain", "as": "mention" },
                     { "key": "idea:two-letters-one-sound", "as": "explain" } ],
           "needs": [ { "key": "term:sound", "level": "explained" }, { "key": "idea:sounds-have-spellings", "level": "explained" } ],
           "estMs": 4100, "interruptible": false } }
```

The same event after compaction keeps `utt: { who, purpose, moment, lines, tags, needs, estMs, compacted: true }`.

A tap while Sensei is still naming the pictures, in a warm-up:

```json
{ "v": 1, "seq": 412, "t": 1790000005100, "sid": "p7:s1", "beat": "p7:s1:b2", "item": "p7:s1:b2:i1", "kind": "obs.ignored",
  "aff": "pic:sock", "why": "naming", "whileSpeaking": true, "screenPosition": 1 }
```

## 7. Tests (`src/core/log/*.test.ts`)

1. `stamp` fills `v`, `seq` (gapless), `t`, `sid`, and `beat`/`item` from the engine's context when absent, and keeps them when present.
2. Appending a duplicate seq with identical content is a no-op; with different content it throws.
3. `fold` over events shuffled and re-sorted by `seq` equals `fold` in order.
4. **Fold consistency** (property, over recorded and random logs): for every split point k, `fold(all) == fold(events[k..], fold(events[..k]))`.
5. **Pruning never changes a fold.** Compact the exposures and drop the recent events of a 30-session log, then bump the ledger's version hash and re-fold: the ledger (and the learner) deep-equal the fold of the unpruned log.
6. **Per-reducer re-folds** (stage 8): a snapshot whose `learner` hash differs re-folds only the learner; the ledger is loaded as saved.
7. `retention` marks exactly `input` and the cosmetic cues as recent, and `exp.said` and `exp.shown` as compact.
8. Jonas's example in ARCHITECTURE.md §3.2 parses as an `AttemptEvent` (a JSON fixture typed against `GameEvent` in the test).
9. `item.start` for a dictation carries its whole bank in `options`, with positions.
10. Shadow events never reach the storage adapter's IndexedDB writes.
11. Export then re-import gives the same folds.
12. Deferred: replay, where feeding the core the start snapshot plus the `input` events reproduces every other event; and the upcaster fixture, with the first schema change.
