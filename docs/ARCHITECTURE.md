# Super Ninja game core: architecture

Status: the definitive design, 26 September 2026, revised the same day after review. It answers Jonas's Round 13 request (docs/FEEDBACK.md) and synthesises three competing designs: A (pure functional core), B (learning science) and C (pragmatic migration). §1 says what came from each, and what the review changed.

- **The first five minutes are docs/FIRST_MINUTES.md's.** That spec landed after this design's first draft and is being built now. The core does not re-author it: it reads the same lesson data (`src/content/warmups.ts`), adopts its protocol rules, school-year question and sticker rule, and its first vertical slice is those warm-ups, built with that spec's owner (§6.1, §14).
- **Types:** `src/core/types.ts`. They compile under the repo's tsconfig and under `--strict`, and reuse the ids in `src/content/sw.ts` and `src/content/phonics.ts`. The file says which stage needs which section; stage 1 splits it into one file per module.
- **Module contracts and test lists:** `docs/architecture/*.md`, one file per module. Codex builds the core stage by stage from those files. Each file lists the functions, their exact rules and the tests that must pass, and says which stage builds what.

| Module | Spec |
|---|---|
| Event log | [events.md](architecture/events.md) |
| Content adapters: curriculum, line tags, cues, notions, durations, the warm-ups | [content.md](architecture/content.md) |
| Learner model (what the child can do) | [learner.md](architecture/learner.md) |
| Ledger (what the child has been told and shown) | [ledger.md](architecture/ledger.md) |
| Planner (what to practise, spaced repetition) | [planner.md](architecture/planner.md) |
| Director (narrative sense, dosage, challenge) | [director.md](architecture/director.md) |
| Activities (state machines and the teaching protocol) | [activities.md](architecture/activities.md) |
| Engine, ports and adapters | [engine.md](architecture/engine.md) |
| Headless runner, players, text adventure | [headless.md](architecture/headless.md) |
| Transcripts and audits | [transcripts-and-audits.md](architecture/transcripts-and-audits.md) |

---

## 0. The shape on one page

```
                     content (read-only data): sw.ts · phonics.ts · units/*.ts · warmups.ts · stories.ts · lines.ts · pic-names.ts
                                                       │  adapters: curriculum · line book + line tags · cues · notions · warm-ups · durations
┌──────────────────────────────── src/core: pure TypeScript. No React, DOM, audio, storage, clock or Math.random ─────────────────────────┐
│                                                                                                                                         │
│   input ──► ENGINE step(state, input) ──► outputs (say, cue, timer, hush, persist)                                                      │
│               │                                                                                                                         │
│               ├─ DIRECTOR ── next beat: frame, what it requires, what it introduces, reminders owed, challenge report, guards          │
│               │     └─ asks ─► PLANNER ── pacing · due (spaced repetition) · session outline · block of items · adapt                   │
│               │                   └─ reads ─► LEARNER (what they can do)   LEDGER (what they've been told)                               │
│               ├─ ACTIVITY MACHINE (pick · rail · build · read · swap · sort · story · run · choose · screen), via the teaching protocol  │
│               └─ events ─► one append-only LOG per child ─► folds: learner · ledger · director memory · rewards                          │
│                                                               └─► transcript renderer ─► audits ─► playtest/INBOX.md                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
  browser adapters: React renders the view and runs cues (Ninja.tsx, fx, FIRST_MINUTES's cards) · engine/audio.ts plays utterances and acks them · IndexedDB log
  headless:         virtual clock + real clip durations · players: scripted, perfect, random, simulated child, Jonas in a terminal (later: a Jev probe, LLMs)
```

What Jonas asked for, and where it lands:

| Jonas asked | Where |
|---|---|
| "Feed it an event: an observation about the student, or something they've been exposed to" | the log: `exp.*` events (what was said, shown, cued and modelled, as heard) and `obs.*` events (what the child did). §3 |
| "3 seconds of staring, two hints, wrong answer on this word, this sound, this spelling… structured data" | `obs.attempt` (`Attempt` in types.ts): timing (shown, latency from the question that asked it, idle), every hint, the target word, sound, spelling and GPC, where the answer was, the response, the error type. §3.2 |
| "The mental model of understanding is updated from that, and that can be unit tested" | two pure reducers over the same events: the **learner** (what the child can do) and the **ledger** (what the child has been told and shown). §4 |
| "Producing or requesting exercises is a separate, separately tested function… time-bound… spaced repetition" | the **planner**: pure functions of (learner, ledger, content, now). Tests move `now`, they don't mock it. §5 |
| "Every interaction makes narrative sense… never confronted with something that doesn't make sense… evaluate challenge level" | the **director**: what each beat requires and introduces, dosage per notion, frames, one set of invariants used as runtime guards and as audits, and a challenge report on every beat. §6 |
| "Playable almost as a text adventure… Jev should be able to play it" | the engine is pure, so the same core runs headless with a virtual clock. Players: scripted, simulated children and Jonas at a terminal; later, Jev as a clarity probe beside a simulated child. §8 |
| "A transcript of everything we said, repetitions, exposition, help text, and everything the user did" | rendered from the log alone, at three levels of detail, including every glow, spotlight and sticker. §9 |
| "Read them all: not explaining? mentioned once but should be three times?" | the explanation coverage table per notion and eight rules, running on **today's game** in stage 1; the rest of the rules, an LLM reader and Jonas's own reading follow. §10 |

Principles:

1. **One log per child; everything else is a fold.** Learner model, ledger, rewards, story state, transcripts and audits are all derived from the append-only log. Change a reducer and re-fold, and every past session benefits. **Nothing a fold reads is ever pruned**: old exposures are compacted, not deleted.
2. **One pure step function.** `step(state, input, env) → { state, outputs, events }`. Time arrives on inputs. Randomness comes from seeds logged on `session.start`. A log plus its seeds is a bug report (exact replay from raw inputs comes later).
3. **Machines, not async effects.** Today's scenes run imperative async sequences inside React effects. In the core, every activity is a state machine that returns a script of ops and says what it waits for. There are no `await`s in the core.
4. **Everything said or shown is tagged.** Every utterance, screen and cue carries `Tag`s (a `Key` and a role: explain, demonstrate, model, remind, mention, show, ask, use) and `Need`s (what it presupposes). That turns Jonas's questions into queries.
5. **Semantic effects.** The core says "Sensei says this, which explains `idea:words-are-made-of-sounds`" and "right answer on `pic:sun`, first try". React decides which ninja move to play. There are no pixels in the core.
6. **Sounds~Write first.** `sw.ts` is the curriculum: units, lessons, lags, Teaching Through Errors, the 75–80% rule. `rollUp()` and `canMoveOn()` are reused unchanged. Game-only oral work never counts towards a unit (sw.ts Decision 3).
7. **Answer Jonas first, then build.** Stage 1 tags today's lines, shadow-logs today's game and prints the coverage table within days. The engine's first vertical slice is the FIRST_MINUTES warm-ups as a text adventure. Scenes move over one at a time, behind a flag, proven by transcript parity.

---

## 1. How the three designs were weighed

| | A: pure core | B: learning science | C: pragmatic |
|---|---|---|---|
| Strongest ideas | determinism; tags with roles; needs and providers resolved before a beat; interruptibility per script step, not per script; transcripts built from what was heard; the spike that found the idle-glow bug | BKT with guess = 1/choices, mechanic-aware slip and credit assignment; exposure never counts as evidence; detectors (with the jev-tutor archetypes as fixtures); dosage as numbers; one invariant used as both guard and audit; pacing with keep-pace and remediation | the engine owns timing, hints, streak and eager answers, so machines never measure time; the teaching protocol written once; chapters and episodes that map 1:1 to today's `worlds.ts` levels; beat limits by age; recap after days away; shadow logging through `src/engine`, not the scenes; per-machine flags proven by transcript parity |
| Weakest points | pure half-life regression grades a lucky tap from two pictures as "easy"; providers as functions (`make()`), not data; frames as decorators and a full screen machine up front are heavy | the largest surface before anything ships; Jev asked at every decision, and asked to play phonics it can't hear | no credit assignment in BKT; notion state inside the learner model mixes knowledge with exposure; two id styles |

The synthesis:

- **From A:** the Key vocabulary and tag roles; `Need`; the prerequisite resolver; interruptible utterances (the prompt only); `exp.said` written on the adapter's ack; the idle ladder as hints on the attempt; stars from independent answers only; the audit list; the ratchet from LLM findings to data.
- **From B:** the learner model's maths (BKT with 1/choices guessing, mechanic-aware slip, help-weighted evidence, credit assignment, half-life memory with no gain from massed practice); detectors; priors from the school-year question; `Dosage` numbers; `game.decision` events; invariants shared by guard and audit; pacing (advance, keep pace, remediate, jump ahead).
- **From C:** machines as `{ state, ops, then }` with an engine that runs scripts, fills attempt timing and runs the streak; `ProtocolParts`; skins; chapters, episodes and beat templates with `legacyLevel`; frames with pitch, short pitch and payoff; beat limits by age; recap; the migration order and the parity rule.
- **New in the synthesis:** the **ledger** as its own reducer, separate from the learner; a `praise` op, so the engine can swap praise for a tier-up line.

**What the review changed** (each is specified in the module files):
- **FIRST_MINUTES.md is the spec for the first minutes.** Chapter 0 and the warm-ups W1–W6 are built from its `WARMUPS` data through an adapter. Its rules are `SupportPolicy` fields (no phase lines, the 8 s/16 s idle ladder, the 2 s we-do glow, no requeue in the warm-ups). Its school-year answers (`none | unsure | R | Y1 | Y2 | unset`) replace the invented stages. Its sticker rule is the core's. `pick` gains "tap all", and a new `rail` machine plays the reading rails. w1-1 is retired, and so is this design's w1-1 example.
- **A beat `requires` some keys and `introduces` others.** What it explains itself is judged at its first real use (an utterance, screen or cue that needs it, or an attempt that uses it), never at `beat.start`. Otherwise every explanation the director inserts would look late.
- **The ledger keeps separate facts, not one ranked level.** Only a completed explanation (or, for a mechanic, a demonstration) explains; attempts, models and questions never do. `taughtCode` is code with a completed teach moment.
- **Dosage that a competent child can pass.** Independent use is credited at most once per beat, only for the needs of the question answered. Retirement needs the full explanations and uses in `minSessions` sessions. `under-dosed` is judged when the dosage window closes.
- **One Help ladder:** the question again (with a strategy line first where there is one), then a glow, then the paw.
- **Learned is not retrievable:** recall is measured from the last scored retrieval only; `pL` never decays; forgetting costs at most half. Talk never teaches reading, forced taps are not evidence, and a KC never got right is due as keep-up.
- **Challenge bands** use you-do items only, by purpose (teach 0.6–0.8, review 0.8–0.92); `check` fails only on hard limits.
- **Everything shown is logged:** cues are `exp.cue` events, screens and affordances carry needs, and the flower, Sticker Book and map are a `screen` machine whose speech is dosed like a beat's.
- **The age band is derived** from the school year and the date; nobody is asked their age.
- **Smaller, in a new order.** Stage 1 answers Jonas's questions about today's game; exact replay, snapshots, adjust and split, quests, Jev and LLM players, cohorts and recovery metrics wait.

---

## 2. What today's code and transcripts show

These are the starting facts the design must fix. They were checked against the code on 26 September.

1. **Glow-assisted answers count as first tries.** In `Early.tsx` `usePickGame`, the 8-second idle glow and the Help glow (`useHelp`, press 2) never touch `misses`, so `firstTry.current++` counts the answer as independent, for stars and for the streak. The engine fixes this by logging every hint on the attempt, and stars count only `independent` outcomes (help level ≤ 1).
2. **Explanations exist but are never played.** `words_made` ("Words are made of sounds. Listen!"), `t_if_you_say_sounds` and `t_listen_for_word` are in `lines.ts`, but nothing in `src/` plays them. Meanwhile `listen_sounds` ("Now I'll say it in sounds…") is said on every segmented item in w1-1 (at least 6 times), and `listen_slow` on every stretched one, with no explanation that words are made of sounds or can be said fast or slowly. This is Round 13's finding, and stage 1's coverage table shows it as `used-before-explained`.
3. **The first game is too long.** In the learner run, w1-1 lasts about 6 minutes, with 14 items and about 170 lines from Sensei (`playtest/transcripts/2026-09-26-07-18/journey-learner.md`). FIRST_MINUTES replaces it with W1 (85 s target, 100 s cap) and W2.
4. **Transcripts are rebuilt from mp3 URLs and DOM taps.** The result is noisy: the bot's taps during "Watch me first!" read as the child's, "This is a…" arrives apart from its word, and cut-off speech looks complete. In the core, transcripts come from the log: whole utterances with text and tags, and taps classified as answers, taps during naming or too early.
5. **`say()` has no queue.** A new call cancels the previous sequence at its next clip. The audio adapter keeps its own queue, and interrupting is an explicit `hush`. While a core beat runs, the adapter owns `say()` alone.
6. **Scenes are async sequences inside React effects,** with `alive` refs, sleeps, races against `isSpeaking()` (`hearNinjaLine`) and `window.__snState` for bots. None of that logic can run without React, audio and real time.
7. **Word choice, tile banks and review are impure singletons** (`chooseWords`, `tileBank` with its floor of 2 distractors, `makeReview` with `Math.random`, `teach.ts` rotation counts in `localStorage` read when the module loads).
8. **Pick games record nothing.** `usePickGame` (every oral, first-sound, Find, placement and training game) never calls `store.ts`, so today's pick attempts are invisible to any log until one sink call is added (§14, stage 1).
9. **The first minutes are being rebuilt right now** (FIRST_MINUTES.md): new opt-in, W1 and W2, cards, stickers. Its owner edits `Early.tsx`'s `usePickGame`, `store.ts`, `gems.ts`, `worlds.ts`, `audio.ts`, `App.tsx` and `lines.ts`, which the core's migration also touches.

---

## 3. Events

Full schema, rules and tests: [events.md](architecture/events.md). Types: `GameEvent` in types.ts.

### 3.1 Families

| Family | Kinds | Records |
|---|---|---|
| session | `session.start`, `session.end`, `session.pause`, `session.resume` | build, content and parameter versions, **seed**, device, player (`child` or `headless:<persona>`), gap since the last session, the derived **age band** |
| profile | `profile.change` | created, hero, **school year** and **band** (FIRST_MINUTES §4), an exact age from a grown-up, placed, settings, legacy import |
| navigation | `nav.screen` | where the child went, and who sent them |
| beats and items | `beat.start`, `beat.end`, `item.start`, `item.end` | the director's `ChallengeReport`, what the beat **requires** and **introduces**, why it was built that way; the full item spec with the **options as presented**, scaffold, phase and predicted success; the outcome |
| **exposure** | `exp.said`, `exp.shown`, `exp.cue`, `exp.modelled` | what the child heard (only once the adapter reports it, with `completed` and `heardMs`), what was on screen (with its needs), every presentation cue (glows, spotlights, stickers, gem energy), what Sensei demonstrated (I do). Each carries tags. |
| **observation** | `obs.attempt`, `obs.help`, `obs.replay`, `obs.idle`, `obs.ignored`, `obs.choice` | what the child did: answers with timing and support, Help and replay presses, idle-ladder steps, taps that weren't answers (during naming, too early, during I do, strays), choices (hero, school year, story branch) |
| decisions | `game.decision`, `game.reward`, `game.progress` | why the planner or director chose something; stars (shown or silent), streak tiers, gems, petals, stickers (picture, word, shiny); units started or passed |
| system | `sys.error`, `sys.checkpoint` | errors; snapshots with each reducer's version hash (stage 8) |
| replay (deferred) | `input` | every raw input the core received |

Rules that matter:

- **Log what was heard, not what was queued.** `exp.said` is written when the audio adapter acks the utterance. An utterance cut off by an eager tap, a route change or the phone turning is logged with `completed: false` and never counts as an explanation. One that never started is never logged.
- **Machines never measure time.** They emit an `AttemptDraft`. The engine fills in timing, support and `uses` from its record of the question being waited on: which utterance asked it, when the item became answerable, idle time, every hint, Help and replay presses, and dithering taps.
- **`choices` on every attempt.** A right pick from two pictures says far less than one from four tiles, and a tap with one option left says nothing: it is logged and never scored.
- **One function decides what an attempt is evidence for.** `curriculum.evidenceFor(item, step, mechanic)` gives the knowledge components with roles (target, component, context). The planner, the machines, the learner and the audits all use it.
- **Decisions are events.** Pacing moves the frontier by writing `game.progress unit-passed`. The learner only folds it. The transcript can therefore say why.
- **Retention never breaks a fold.** Everything a fold reads is kept for ever. After 10 sessions, exposures are compacted (their text and parts go; their lines, tags and needs stay), and only raw inputs and cosmetic cues are dropped. A year of daily 12-minute play is roughly 25 MB, and folding it from scratch takes a few hundred milliseconds, after the first frame.
- **Shadow events are marked.** Stage 1 reconstructs events from today's scenes with `origin: "shadow"`. They stay in dev and on the treadmill, never in a child's IndexedDB, and the learner never folds shadow attempts.
- **Privacy.** The log stays on the device. A grown-up can export it (the grown-ups area). An exported log runs through the same transcript renderer and audits as a bot run.

### 3.2 Jonas's example as data

"After three seconds of staring at something and getting two hints, they got the wrong answer on this particular question about this word, this sound, this spelling."

The setting is single-word dictation of *mat* (Quizzing) in a review block, with the tiles m a t i s (recorded in `item.start.options`). The child is on slot 1 (/a/), with < m > already on line 0, so four tiles remain. They press Help twice: Sensei asks again, then the answer glows. They stare for 3 s and tap < i >.

```json
{ "v": 1, "seq": 1843, "t": 1790000000000, "sid": "p7:s3", "beat": "p7:s3:b2", "item": "p7:s3:b2:i4",
  "kind": "obs.attempt", "activity": "dictation-word", "itemKind": "dictation", "mechanic": "tile-to-line", "phase": "you-do",
  "step": 1, "attemptNo": 1,
  "target": { "unit": "IC1", "word": "mat", "slot": 1, "sound": "a", "spelling": "a", "gpc": "a>a", "structure": "CVC",
              "position": "middle", "answerPosition": 1 },
  "response": { "aff": "tile:3:i", "value": "i", "spelling": "i", "sound": "i", "screenPosition": 3 },
  "correct": false, "confusedWith": { "gpc": "i>i", "sound": "i" }, "errors": ["wrong-sound-heard"],
  "choices": 4,
  "timing": { "shownMs": 7400, "askedBy": "o77", "latencyMs": 3000, "idleMs": 3000, "early": false, "tapsBefore": 0 },
  "support": { "hints": [ { "kind": "repeat-prompt", "at": 1789999995200, "by": "help-button" },
                          { "kind": "glow", "at": 1789999997000, "by": "help-button" } ],
               "level": 2, "helpPresses": 2, "replays": 0, "timed": false },
  "evidence": [ { "kc": "gpc:a>a:spell", "role": "target", "position": 1 },
                { "kc": "skill:segmenting:CVC", "role": "component" },
                { "kc": "mech:tile-to-line", "role": "component" } ],
  "uses": ["mech:tile-to-line"] }
```

Help press 1 asked the question again (`o77`, so latency runs from its end); press 2 made the answer glow (help level 2). §4.1 works through what the learner does with it; activities test 7 and engine test 4 drive these exact inputs through the protocol.

---

## 4. The student model: learner and ledger

Jonas's "mental model of understanding" is two pure reducers over the same events. They are kept apart because they answer different questions and are tested differently.

| | Learner ([learner.md](architecture/learner.md)) | Ledger ([ledger.md](architecture/ledger.md)) |
|---|---|---|
| Question | What can this child do, how sure are we, and when will they forget it? | What has this child been told, shown and asked to do, how often, and when? |
| Keyed by | `KcId`, a knowledge component: `gpc:a>a:spell`, `skill:blending:CCVC`, `pa:first-sound`, `mech:tile-to-line`… | `Key`: `idea:words-are-made-of-sounds`, `term:spelling`, `mech:tile-to-line`, `char:baron`, `gpc:ai>ae`, `word:pan`… |
| Fed by | scored attempts (evidence); exposures move counters, plus at most one small learning step per KC per session from a full explanation or demonstration; priors | completed exposures by tag role; the first real use of each key; credited independent use |
| Used by | the planner (what to practise and when), pacing, rewards, the grown-ups report | the director (what must be explained first, what is owed), the planner (only code actually taught may be shown), the audits |

### 4.1 Learner

- **Knowledge components (KCs).**
  - Code per direction: `gpc:X:read` and `gpc:X:spell`. In the Extended Code, spelling accuracy lags reading by 5–7 units.
  - Skill by word structure: `skill:blending:CCVC`. IC8–10 are about adjacent consonants.
  - Manipulation by operation.
  - Oral phonological awareness: `pa:*` and `sound:p:hear`. These are game-only.
  - Word-specific spelling, special words and concepts.
  - **Mechanics**, so that a 3-year-old's mis-tap on an unfamiliar mechanic is not blamed on /a/.
- **Update.** The rules are exact in learner.md.
  - **BKT with guess = max(floor, 1/choices).** Slip rises while the mechanic is unknown.
  - **Forced taps are skipped.** `choices ≤ 1` (the last tile of a bank with no distractors) never moves anything; a bank slot with 2 tiles left counts half.
  - **The weight depends on phase and help.** We do counts 0.2. A correct answer after help counts 0.6, 0.25 or 0 by help level. A wrong answer counts 1.0, whatever the help.
  - **Credit assignment by role.** On a located error, the target takes 0.8 of the blame.
  - **Learning.** After the update comes a learning step per opportunity; a correction counts as a learning opportunity.
  - **Talk never teaches reading.** Naming a picture never touches `word:pan:read`; a spoken sound never touches a GPC. Only a teach moment or a shown spelling with its sound does, with at most one small step per KC per session.
- **Memory.** Learned (`pL`) and retrievable (`recall`) are kept apart.
  - recall = 2^(−Δ / h), with Δ measured from the **last scored retrieval** only. Exposures, we do and component references never reset it.
  - pKnown = pL × (0.5 + 0.5 × recall) once the KC has been retrieved unaided; before that, and for school-taught priors, pKnown = pL. A week away never wipes out what a child learned.
  - Only spaced (≥ 4 h apart) retrievals change the half-life, graded 0–3 against this child's own median response time. Massed practice builds nothing, and a success when recall was low grows the half-life most.
- **The Sounds~Write view.** Every scored attempt also becomes `Evidence`. `rollUp()` and `canMoveOn()` from sw.ts run unchanged: 75–80% over the last 10 independent you-do first tries, with the official lags. Moving on needs both views and evidence from two sessions (§5).
- **Detectors** (behaviour, not knowledge): guessing first; then position bias (from `answerPosition`), fatigue, frustration and boredom. Pure functions over the last 10 attempts. The ten `jev-tutor.ts` archetypes are the test fixtures.
- **Priors.**
  - The school year and band set assumed KCs half a term behind the Sounds~Write pace (FIRST_MINUTES §4). "Not yet" and "not sure" set nothing.
  - Placement, "Start from here" and jump-ahead set the frontier.
  - Today's `Save` counters become assumed priors (stage 8).

**Jonas's example in numbers.** Before the attempt, pL(`gpc:a>a:spell`) = 0.55 and the tiles mechanic is known (0.9), so g = 1/4 and s = 0.1 + 0.2 × 0.1 = 0.12.

1. The posterior after a wrong answer is 0.16. The error is located (slot 1), so the target takes 0.8 of the shift: pL falls to 0.24.
2. The correction that follows applies the "corrected" learning step (0.08), which lifts it to **0.30**.
3. The two hints don't soften a wrong answer: getting it wrong *with* help is strong evidence. They are kept on the attempt, and the 3 s of staring feeds the hesitation part of the fatigue detector.
4. `confusions["spell:a>i"]` rises by 1. The grade is 0, so the recall clock restarts, the KC is due at once as `lapsed`, and if this was a spaced retrieval the half-life halves.
5. The Sounds~Write evidence scores 0 in the IC1 spelling window.
6. What follows: the planner adds a *sat*/*sit* "who read it right?" contrast to today's review, and makes < i > the distractor the next time < a > is spelled.

Had the child been *right* after those two hints, the help level would be 2. The outcome is then `helped`, not `independent`: it moves pL only a quarter as much, doesn't count for stars or the streak, and gives Sounds~Write `helped: true`.

### 4.2 Ledger

- **Facts, not levels.** Per key: completed explanations, demonstrations (I do only), reminders, mentions, interruptions, attempts that touched it, credited independent uses, and whether it was assumed (taught at school).
  - An "explained" need is met by at least one completed explanation, or a demonstration for a mechanic, or an assumed entry.
  - "It's this one!" and "Tap the… pan" are mentions. **Attempts never explain anything**, so a probe or a wrong answer on new code never makes it count as taught.
  - An interrupted explanation counts as a mention.
- **First real use.** A key is used when an utterance, screen or cue that needs it plays, or an attempt uses it. `beat.start` is not a use.
- **Credited use.** An independent correct you-do answer credits the keys its question relied on (the asking utterance's needs and the mechanic), at most once per beat. Frame words ("monster") are never credited by phonics success.
- **Dosage state** per key, for the director and the audits:
  - full explanations and the sessions they fell in;
  - reminders;
  - beats and sessions since the last one;
  - explanations this session (the nagging cap);
  - first use, and the sessions in which it was used;
  - credited uses and the sessions they fell in (retirement needs both).
- **`taughtCode`**: the GPCs with a completed teach moment or first-sound reveal, or assumed. This replaces "the unit's nominal code" for every decodability check, which matters for children who jumped ahead.
- **Rotation.** Line and teach-moment rotation counts replace `localStorage["superninja.teach.v1"]`.

---

## 5. The planner: what to practise, and when

Full contract and tests: [planner.md](architecture/planner.md). Every function is pure, deterministic for a given seed, and time-bound through `ctx.now`. Stage 4 builds the hard constraints behind today's functions; ranking waits until real attempts exist.

| Function | Answers |
|---|---|
| `pacing(ctx)` | which unit, whether to move on, whether to keep pace or remediate, whether to offer jump ahead, how many new keys this session may introduce, whether this is a pre-code (warm-up) session |
| `due(ctx)` | spaced repetition: every KC the child has attempted that is lapsed, never yet got right alone (keep-up), or below 0.8 recall; ranked by urgency and filtered by the Sounds~Write lags. Extended Code spelling inside its 5–7 unit lag is watched but never counts as backlog |
| `outline(ctx, budget, seed)` | a session shaped like sw.ts `SESSION`, shortened for home play: warm-up (the 1–2 most urgent due items, made easy with 2 choices), current unit (Lessons 1/5 + 4 in the Initial Code; 6/7/9 and 10 in the Extended Code), review (Lessons 2, 3, Quizzing, Speed Read), connected text (reading one unit behind, dictation two behind); or the FIRST_MINUTES warm-ups for band `none` |
| `scaffoldFor(mechanic, activity, ctx)` | choices (2 on a mechanic's first appearance, then 3, at most 4 in the Initial Code), distractors (0 in Lessons 1 and 5), presentation, and the I do / we do release from the ledger |
| `block(req, ctx)` | the items for one activity block, from generators per item kind: hard constraints, then scoring, then composition so the **you-do** items' mean predicted success is in the band for the purpose (teach 0.6–0.8, review 0.8–0.92) |
| `adapt(block, done, ctx)` | at item boundaries only, on the items not yet started: ease off after two misses, step up on boredom (requeueing a failed item, and ending on a success, are the protocol's job) |
| `predict(spec, choices, phase, ctx)` | P(first-try success) by phase: none for I do, the glow-assisted rate for we do, the model for you do |

**Hard constraints** (never violated; property tests check every unit and 1,000 seeds):
- Written items use only `taughtCode` ∩ the code at `maxUnit`. The one exception is probe items, which exist only in placement and the jump-ahead check, are marked, and count only as evidence.
- Lags: Symbol Search and Sound Swap review at least one unit back; reading in text one back; dictation two back.
- Lesson 1/5 banks are the word's own spellings, with no distractors.
- IC1: continuant-first words before stop-first, and two-sound words before three-sound words.
- Homophones are dictated only with a picture or sentence.
- Pictures pass `pic-names.ts` and FIRST_MINUTES's 3-year-old rule.
- Nonsense words only from IC8.
- No sorts before the Bridging Unit (concept 3).
- Pinned (authored) words keep their order.

**Spaced repetition, worked example.** A GPC's first independent success sets a 24 h half-life, so it falls due (recall < 0.8) about 8 h after its last scored retrieval. A child who plays once a day gets it the next day. An easy success when recall is 0.5 multiplies the half-life by 2.5 × 1.5, to 90 h, so it is due again about 29 h later. For a child who plays daily and answers easily, the review intervals come out at about 1, 2, 5 and 12 days. A wrong answer halves the half-life and makes the KC due at once. Three days away (planner test 7): a GPC with a 24 h half-life has recall 0.125 and pKnown 0.45, and comes first in the warm-up at 2 choices, predicted 0.70. Tests pin exact values from the formula, moving `now` rather than mocking time.

---

## 6. The director: narrative sense, dosage and challenge

Full contract and tests: [director.md](architecture/director.md). Stage 3 has a minimal director (a cursor over the warm-ups, the time governor, the FIRST_MINUTES check); stage 7 adds the rest.

### 6.1 Content model

- **Chapter** = a land: its units, arc, entry beats, episodes and frames.
  - **Chapter 0** is the first minutes, exactly as FIRST_MINUTES.md specifies: film, hero, the opt-in ("Do you go to big school yet?", then "Which class are you in?", with a "Not sure?" cloud and silence defaults), the dojo welcome (the Help button), Lesson 1 (W1, Ninja Ears), the Sticker Book reward, Lesson 2 (W2, Ninjas Read This Way), and the shiny sticker, first petal and map. School paths get a 90 s cut of their start dojo and **the check**, which drops a band after 0 or 1 of the first three right.
  - **The warm-up world** W1–W6 stands at the front of Bamboo Village; w1-1 is retired.
  - **Data, not a port.** FIRST_MINUTES's lesson scripts are `src/content/warmups.ts` (`WARMUPS`). An adapter, `core/content/warmups.ts`, turns them into episodes and beat templates, so the scenes its owner is building and the core play the same script. The mapping of each WARMUPS beat kind is in director.md §1.
- **Episode** = one map stone, which is exactly today's `Level`, with `legacyLevel: "w1-2"` or `"w1-wu1"`. It holds a few beat templates and ends in a reward. Warm-up episodes carry FIRST_MINUTES's time budget: optional (◇) templates are skipped when more than 5 s behind, and at the cap the paw finishes the last item.
- **Beat templates** are what authors write:
  - `film` and `story`;
  - `exposition` (explain these notions);
  - `scripted` (an authored show-and-tell with cues: the fast/slow card, "notice the first sound", Sensei reading the rail);
  - `activity`: machine, mechanic, frame, pinned, fixed or planned items, skin, support policy, budget by age;
  - `planned`: warm-up, Sensei's Challenge, connected text;
  - `choose`: hero, the opt-in;
  - `reward` (stars shown or silent, stickers, petal);
  - `gate`: the Sounds~Write move-on check, which loops to a practise-again beat;
  - `screen`: the World Flower, the Sticker Book, the map.
- **Frame** = the story reason for an activity. It has a pitch, a short pitch for later times, a payoff and needs. Example: "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!" needs `char:baron`, so a child placed straight into Blossom Hills hears who Baron is before the first monster.
- **Notions** (`core/content/notions.ts`) are every non-content key a child must understand, each with dependencies, providers (lines, a teach.ts moment, an I do demo, a scripted show, story pages or film shots) and a `Dosage`. Chapter 0's providers are FIRST_MINUTES's own lines: `fm_fast_sun`/`fm_slow`/`fm_same_word` for fast and slow, `fm_hear_sounds` for "words are made of sounds" (with `words_made` as its short form), `fm_help_short` for the Help button, `fm_rw_book`/`fm_rw_every` for the Sticker Book. The narrative audit (`docs/NARRATIVE_AUDIT.md`) seeds the rest.

### 6.2 Dosage: "mention it three times"

The defaults per kind are in director.md; a notion can override them.

| Kind | Before first use | Full explanations | Spacing | Sessions | Then | Retire after | Refresh | Per session |
|---|---|---|---|---|---|---|---|---|
| `idea:` (words are made of sounds, fast and slow) | 1 | 3 | 2 beats, then the next session | ≥ 2 | short reminder at each use | 8 credited uses in ≥ 2 sessions | 14 days | 2 |
| `concept:` (Sounds~Write 1–4) | 1 | 3 | next session, next session | ≥ 3 | short reminder ("Same sound, different spellings!") | 10 | 14 days | 2 |
| `term:` (sound, spelling, dojo, gem) | 1 | 2 | next session | ≥ 2 | short reminder | 5 | 14 days | 2 |
| `mech:` (how to play) | 1 (the I do demo, or an instruction with the answer glowing) | 2 | next session (demo again) | ≥ 2 | none (Help covers it) | 3 | 21 days | 1 |
| `obj:` (World Flower, petal, gem, Sticker Book) | 1 | 2 | 2 beats | 1 | short reminder | 3 | 30 days | 2 |
| `char:`, `place:` | 1 | 1 | – | 1 | none | – | 3 days (recap) | 1 |
| `fact:` (story facts) | 1 | 1 | – | 1 | none | – | 2 days (recap) | 1 |
| `gpc:` (a new spelling) | 1 (teach moment) | 3 | next beat, next session | ≥ 2 | rotated `teach.ts` phrasings; "This is /k/. Say /k/ here." on errors | 12 | 10 days | 2 |

A notion retires only when all of its full explanations have been given **and** it has its credited uses **and** those uses span its minimum sessions. A quick child who uses an idea 8 times in session 1 still gets the spaced second and third explanations; none of them counts as "after retirement".

### 6.3 How the director chooses (`next`)

1. **Obligations first:** onboarding steps not yet done, the FIRST_MINUTES check on a school start, and story beats unlocked by progress.
2. **Rest or end:** after the age's session budget, or when fatigue fires, offer a rest ("Ninjas need rest too"), always after a success. It is never forced.
3. **Recap** at a session's first beat after ≥ 2 days away: re-establish the facts and characters due a refresh.
4. **Warm-up** if reviews are due.
5. **Otherwise** the cursor's template (skipping an optional one when the time governor says so), a planned part of the outline, or the chapter's gate.
6. **Instantiate** the beat. The planner fills the items, and the director collects its needs: the needs of every line **any path** of the machine can say (prompt, both corrections, the Help ladder, the idle steps, praise, the skin's lines), the frame's needs, the intro's, and content needs (every GPC shown explained; special words taught; pictures named).
7. **Split** them: `requires` (characters, places, facts, and dependency roots the beat can't explain) must be met before the beat starts; `introduces` (ideas, terms, concepts, objects, mechanics and GPCs) the beat explains itself.
8. **Resolve** in dependency order:
   - unmet `requires` → insert its story, film or recap beat **before** this one, or choose a frame that doesn't need it;
   - an idea, term, concept or object → its provider's full form in the beat's intro, or a separate exposition beat if the talk would run over the limit;
   - a mechanic → force an I do at the start (the demonstration is the explanation);
   - a GPC → its teach moment first;
   - no provider → a content bug: CI fails; at runtime, defer the beat and log it.
9. **Reinforce:** attach owed reminders (short forms) and spaced full explanations, capped per beat.
10. **Challenge:** compute the report (§6.4). Adjusting and splitting are deferred; until then an out-of-limit beat is reported and runs as authored, and `check` makes the author fix it.
11. **Record** every insertion in `why` and as a `DirectorNote`, both shown in the annotated transcript.

Why the split matters: the explanations the director inserts play inside the beat, after `beat.start`. Judging `introduces` at `beat.start` would report every one of them as late. The ledger and the `used-before-explained` audit both judge a key at its first real use, so the guard and the audit agree.

### 6.4 Guarantees and challenge

**Invariants** are predicates, each used twice: as a guard before a beat runs (the director inserts or defers) and as an audit over a finished log (to catch anything that slipped through). The list shares its ids with the audit rules (§10.2). Two CI checks use them:
- `director.check(chapter)` (static): every chapter's beats against a blank child for each age band; every need of every line any path can say, and the hard limits (talk, items, new notions). It never fails on a predicted band.
- `scripts/sim/check.ts` (dynamic): every chapter through the real engine with four scripted players (perfect, one error per item, two errors per item, silent for 30 s), and the deterministic audits on the logs. This is where the lines a struggling 3-year-old actually hears are proven.

**Challenge report** on every `beat.start`, from the intro and the machine's pure `estimate` (no engine run), with the observed values filled in on `beat.end`:
- the purpose (teach or review), and the you-do items' mean predicted first-try success and its band;
- new notions, and new and review KCs;
- choices, and the I do / we do / you do mix;
- items, and talk before the first action;
- the longest speech run with nothing to act on and nothing new on screen, and talk share;
- estimated length, whether it is timed, and how many beats of the same mechanic ran in a row.

The bands, over the **you-do items only** (I do is excluded; we do is glow-assisted and never makes a beat look hard):

| Purpose | too-hard | stretch | flow | too-easy |
|---|---|---|---|---|
| teach (scaffolded new code) | < 0.5 | 0.5–0.6 | 0.6–0.8 | > 0.8 with no new notions |
| review | < 0.7 | 0.7–0.8 | 0.8–0.92 | > 0.92 with no new notions |

A beat is also too hard when it has more new notions, or more talk before the first action, than the age allows. Those are hard limits.

**Limits by age** (`BeatLimits`; Round 13: "the first game was far too long for a 3-year-old"). Nobody is asked their age: the band is derived at each session from the school year and the date (not yet, not sure or unset → 3; Reception → 4; Year One → 5; Year Two → 6; one more each 1 September), or from an exact age a grown-up enters.

| Age | Talk before first action | Longest speech run | Items per beat | Beat | Session | New notions per beat | Reward every | Talk share |
|---|---|---|---|---|---|---|---|---|
| 3 | 12 s | 8 s | 6 | 150 s | 10 min | 1 | 45 s | ≤ 0.45 |
| 4 | 15 s | 8 s | 8 | 240 s | 12 min | 1 | 60 s | ≤ 0.45 |
| 5 | 18 s | 12 s | 10 | 300 s | 15 min | 2 | 75 s | ≤ 0.5 |
| 6 | 20 s | 12 s | 12 | 360 s | 20 min | 2 | 90 s | ≤ 0.5 |
| 7+ | 25 s | 15 s | 14 | 420 s | 25 min | 3 | 120 s | ≤ 0.55 |

A visual cue splits a speech run: FIRST_MINUTES's 14 s fast/slow show, where every line lands its own movement, is four short runs; 14 s of talk over a still screen is one run, and breaks the age-3 limit.

### 6.5 Worked example: W1, Ninja Ears, through the core

FIRST_MINUTES §5 is the script. The core adds the guarantees.

1. **The script becomes templates.** `warmupEpisode("W1")` reads `WARMUPS.W1`: a scripted hello; naming of sun, sock and cat with `name-card` cues; a `pick` of the sock (a tutorial item, we do, glowing after 2 s); the scripted fast/slow show; a `rail` of the tortoise then the rabbit (the rabbit optional); the slow-word `pick` (cat as we do, sock optional); the scripted notice beat with a say-it-with-me pause; the tap-all `pick` with two pockets; the closing line. Budget: 85 s target, 100 s cap. Every activity uses the warm-up support policy.
2. **What each beat introduces.** The first tap introduces `mech:tap-picture` (`fm_tap_sock` is tagged as explaining it, and the answer glows). The fast/slow show introduces `idea:fast-and-slow-saying` (`fm_fast_sun`, `fm_slow`, `fm_same_word`) and then `idea:words-are-made-of-sounds` (`fm_hear_sounds`), in that order, because the registry says the second depends on the first. The notice beat introduces `idea:first-sound`. None of these is in `requires`, so nothing is judged at `beat.start`.
3. **First real use.** `fm_slow_listen` ("Listen to my slow word…") needs `idea:fast-and-slow-saying`; `fm_tap_all_start` needs `idea:first-sound`. By then the ledger has a completed explanation of each, so `used-before-explained` stays silent. If the phone turns during `fm_hear_sounds`, that explanation is logged as interrupted; the next beat that relies on the idea gets the full form again, and the audit would catch a path that didn't.
4. **Dosage.** W1 carries each idea's first full explanation. The second comes at least two beats later where a beat relies on it again (W3's fast/slow recap on *mug*), the third in the next session. After that, short reminders (`words_made`), until the idea has 8 credited uses across at least 2 sessions.
5. **The protocol, per FIRST_MINUTES §3.** No "Watch me / together / your turn" lines. A tap during naming echoes the card's name. At 8 s of silence the answer glows and Sensei asks again; at 16 s the paw taps it and play moves on (a we do, not a miss). A wrong card wobbles and says its own word. Nothing is requeued. Praise at most every third right answer. Stars are saved silently, and the five cards met become picture stickers.
6. **Checked for a 3-year-old.** `director.check` finds every line any path can say has its needs met (including `fm_look_this` after two misses in the tap-all grid and `fm_its_this`); talk before the first tap is about 10 s (hello, three names, "Tap the sock!") against a 12 s limit; the longest speech run is about 5 s. `scripts/sim/check.ts` then plays W1 with the four scripted players and finds no audit findings.

---

## 7. Activities as state machines, and the engine

Machines and the protocol: [activities.md](architecture/activities.md). The engine: [engine.md](architecture/engine.md).

**A machine** is `voice / needs / estimate / init / resume / act / timer / replan / view / oracle`. Every call returns `{ state, ops, then }`, where `then` is `resume(tag)`, `await(answers, acceptEarly, idle ladder, askedBy)` or `done(result)`.
- **`voice(spec)`** lists every line any path can say; `needs(spec)` is their needs. A test drives every path and fails on any unlisted line, so the director checks the struggling child's lines, not just the happy path.
- **`estimate(spec)`** gives the talk figures without running anything.
- **The ops** are `say`, `cue`, `sfx`, `wait`, `flag`, `attempt`, `praise`, `event`, `timer`, `cancel-timer` and `hush`. A `barrier` op waits for the adapter's ack.
- **Every call is total.** A nonsensical input returns the state unchanged.
- **The view** is a pure projection with stable affordance ids. React puts them on elements (`data-aff`), and bots and text players choose by id.

**The teaching protocol** (`activities/protocol.ts`) implements PEDAGOGY.md, Sounds~Write and FIRST_MINUTES §3 once. Each machine supplies `ProtocolParts`: prompt, listen-again or place-of-error, model, demonstrate, on-right, check, target, help and strategy. Two `SupportPolicy`s set the rules:

| | Default | Warm-up (FIRST_MINUTES §3) |
|---|---|---|
| Phase lines ("Watch me first!"…) | yes | no: Sensei's explanation is the I do, the first tap the we do |
| We-do glow | at once, then after 2 s | after 2 s |
| Idle | 8 s: glow + ask again; 16 s: the paw points | 8 s: glow + ask again; 16 s: the paw taps it and play moves on |
| A tap during naming | wiggle | echo the card's name |
| A wrong card | wobble | wobble and say its own word ("mmmoon… Moon starts with a different sound.") |
| Second miss | reduce to 2, glow, `its_this_one` (build) or `fm_its_this` (pictures); requeue once | the same, with no requeue |
| Praise | after right answers | at most every third |
| Help | the question again (with a strategy line first where there is one), then a glow, then the paw | the same |

- **Pictures are named** once per beat, each with a `name-card` cue, using the whole `fm_name_<w>` recordings where they exist.
- **I do:** Sensei's demonstration is logged as `exp.modelled`. Taps during it are `obs.ignored("i-do")`.
- **First miss:** back to listening: the word stretched with the paw on the slot, or place of error when reading. It never segments a word the child is spelling.
- **Ending on a success** is the protocol's rule: a requeued item ends the round, and if it fails again one item the child already got right is added. Replay says the prompt again.
- **Build items:** after the last slot, "Say the sounds… and read the word" with the sound buttons lighting in turn.

**Engine rules** (tested once, in one place):
- **Eager answers.** A tap on an answer while an *interruptible* utterance plays (the prompt, never the naming of pictures or an explanation) hushes Sensei and counts, with `early: true` and a negative latency. A tap on a card during naming is `obs.ignored("naming")` (an echo in the warm-ups). Any other tap while Sensei talks is a wiggle (`too-early` cue) and `obs.ignored`.
- **Timing, support and uses** are filled into every attempt from the engine's awaiting record. Latency is measured from the end of the last utterance that asked the question: the prompt, a correction, a Help re-ask or the idle re-ask (`askedBy`).
- **Streak.** It grows only on `independent` answers with at least 2 choices and resets on a miss (with "Keep going, ninja!" before the correction if the streak was 3 or more). It carries from Lesson 1 into Lesson 2. The `praise` op becomes the tier-up cue and the ninja's line when a tier is crossed, so "Ninja power!" never talks over Sensei.
- **Stars** count only `independent` you-do items: ≥ 90% gives 3, ≥ 70% gives 2, otherwise 1. In the warm-ups they are saved silently.
- **Stickers** (FIRST_MINUTES §6): a picture sticker for every picture met in a lesson, upgraded to a gold word sticker when the child first reads or spells the word, and at most one authored shiny sticker per lesson.
- **Cues are logged** as `exp.cue`, so the transcript shows every glow, spotlight and sticker, and `dead-air` and `unlit-naming` are exact.
- **Pauses.** Hidden or rotated away hushes speech and re-queues the utterance that was cut off (today's `pauseSpeech`). After 5 minutes hidden, the session ends.

**Machines and what they replace:**

| Machine | Covers | Replaces |
|---|---|---|
| `pick` | a first guided tap, oral games, slow words, first sound, sound hunt, **tap all** (several right answers, with pockets), "which did I read?", Symbol Search, placement rounds | `usePickGame` (Early.tsx), Dojo Find, Placement rounds, Training |
| `rail` | taps in order: the reading rail (left to right), the tortoise then the rabbit, the rabbit that makes a compound word; Sensei's rail read as an I do | FIRST_MINUTES's `ReadingRail`, `SpeedButtons`, `CompoundMerge` orchestration |
| `build` | word building (Lessons 1 and 5), dictation of words (battle, boss and trial skins), polysyllabic spelling | Early `BuildOne`, Dojo `Build`, Battle |
| `read` | who read it right, word reading, read-write-check | Early `ReadOne` |
| `swap` | Sound Swap, including insert, delete and nonsense chains | Swap.tsx |
| `sort` | sound sort and spelling sort (Bridging and Extended Code only) | Sort.tsx |
| `story` | reading in text, story choices and questions | Story.tsx |
| `run` | Speed Read as a stream of encounters with deadlines; the physics stays in Run.tsx | Run.tsx |
| `choose` | hero, the opt-in (last tap wins after 1.5 s; silence defaults), rest offer (no right or wrong answer) | Choose in App.tsx, FIRST_MINUTES's `OptIn` |
| `screen` | the World Flower, the Sticker Book, the map: child-driven, but every moment they say is dosed through the director | Tree.tsx's and Intros.tsx's speech orchestration (the drawing stays) |

**Skins** (`plain`, `dojo`, `battle`, `boss`, `trial`, `run`, `swap-fix`) carry hit points, lanterns and timers. Pedagogy never lives in a skin, and every line a skin can say is in its machine's `voice`.

---

## 8. The headless runner and the text adventure

Full contract: [headless.md](architecture/headless.md). Built in stage 3.

**The loop.** `scripts/sim/run.ts` drives the real core on a virtual timeline.
- A `TextPresenter` acks every `say` after its real clip duration (`public/a/durations.json`, generated from the mp3 files) and every barrier cue after its configured time.
- Timers fire in virtual time.
- A player decides an action and a delay. If a timer fires first (the 8 s idle glow), that decision is dropped and the player is asked again, now seeing the hint.
- Sessions follow a `DayPlan`, so spaced repetition is exercised over weeks.
- A 10-minute session runs in well under a second.

**Players:**

| Player | Decides with | For |
|---|---|---|
| scripted | a list of affordance ids and waits | golden transcripts; regression tests; `scripts/sim/check.ts` |
| perfect | the machine's oracle (headless only) | smoke runs; browser parity |
| random (Maya the monkey) | uniform taps at 4 a second | softlocks, stray handling, inflated stars |
| simulated child | hidden truth per KC that learns from explanations, demos and practice and forgets; slip; mechanic comprehension; response times; eagerness; Help seeking; attention span | pacing and challenge tests; does the learner model recover the truth? |
| human | a terminal: `bun scripts/sim/play.ts --age 4 --seed 7 [--audio]` | Jonas plays the text adventure |
| **Jev clarity probe** (later) | a simulated child plays; at instruction moments Jev reads the child-level transcript of what was heard and answers "wait or act now?", "would a child press Help or guess?", "is it clear?" and "was a word used that the transcript never explained?" | clarity of instructions, judged on what the child actually heard |
| LLM persona (later) | the player view plus a persona brief, with think-aloud notes | exploratory play |

**Why Jev is a probe, not a player.** docs/JEV.md measured Jev as a stable, calibrated judge of text against explicit rules, with no ears and weak pronunciation knowledge. It would ace the phonics, and it can only judge notions it is shown. So it never answers the items, and it is never given the ledger's claims about what was explained (those come from the same tags it is meant to check). It gets the transcript. Words missing from the notion registry altogether are found by the LLM reader, which proposes new notions (§10.3).

**What a player sees** (the terminal, the probe's and the LLM's state, and SCREEN lines in transcripts all use one renderer):

```
── Bamboo Village · Ninja Ears (W1) · slow words ───────────────── challenge: teach · stretch · p≈0.51
SENSEI  Fast or slow, it's the same word. "sun"!
SENSEI  When I say a word slowly, I can hear the sounds that make up the word. Words are made of sounds!
GAME    (the three sound dots pulse in turn)
SENSEI  Listen to my slow word... "caaat" (slowly) Which picture is it?
On screen:  [1] picture: sun    [2] picture: sock    [3] picture: cat
Do:         1  2  3   ·  h help  ·  r hear it again  ·  w wait  ·  q home
>
```

---

## 9. Transcripts

Full rules: [transcripts-and-audits.md](architecture/transcripts-and-audits.md). `renderTranscript(events, env, { detail })` reads the log only. It never sniffs audio URLs or DOM taps.

| Detail | Shows |
|---|---|
| **child** | what was said (whole utterances with words and sounds written out; cut-off lines marked), what was on screen, every glow, spotlight and sticker, and what the child did and when (answers, taps during naming, too-early taps, Help, replay, silence) |
| **annotated** | the child level, plus: beat headers with frame, why and the challenge report; what the beat requires and introduces; phases; tags; which keys were heard for the first time and each explanation's running count ("×2/3"); hints and outcome on each answer; model changes; planner and director decisions |
| **debug** | every event |

```
## Bamboo Village · Ninja Ears (W1) · fast and slow (scripted) · frame: warm-up · why: campaign
   introduces: idea:fast-and-slow-saying, idea:words-are-made-of-sounds
 0:21.0  SENSEI  I can say a word fast. "sun"!                              mention · idea:fast-and-slow-saying
 0:22.4  GAME    (sun hops; the rabbit flashes)
 0:23.0  SENSEI  Or I can say it slowly... "sssuuunnn" (slowly)
 0:23.9  GAME    (sun stretches; three sound dots pop onto the ribbon)
 0:26.3  SENSEI  Fast or slow, it's the same word. "sun"!                   explanation · idea:fast-and-slow-saying ×1/3 · first
 0:29.0  SENSEI  When I say a word slowly, I can hear the sounds that make  explanation · idea:words-are-made-of-sounds ×1/3 · first
                 up the word. Words are made of sounds!
 0:33.6  GAME    (the dots pulse in turn)
   …
## Bamboo Village · Ninja Ears (W1) · slow words · frame: warm-up
   challenge: teach · stretch · p≈0.51 (you do) · 3 choices · 3.4 s of talk before the first tap
 0:48.0  SENSEI  Listen to my slow word... "caaat" (slowly) Which picture    prompt · we do · first use: idea:fast-and-slow-saying ✓
                 is it?
 0:53.4  GAME    (cat glows)                                                 hint: glow (we do, 2 s after the question)
 0:54.2  CHILD   taps cat after 2.8 s                                        ✓ we do
 0:54.3  SENSEI  "caaat"… "cat"!
         MODEL   pa:oral-blend 0.30 → 0.39 (we do)
 0:57.1  SENSEI  Here's another slow word... "sssooock" (slowly) Which       prompt · you do
                 picture is it?
 1:02.6  CHILD   taps sun after 1.6 s                                        ✗ wanted sock
 1:02.7  GAME    (sun wobbles and says "sssuuunnn")                          echo
 1:04.0  SENSEI  Listen again. "sssooock" (slowly)                           correction
         MODEL   pa:oral-blend 0.39 → 0.29 (the miss, then the correction's learning step)
 1:06.1  CHILD   taps sock                                                   ✓ corrected
```

Alongside every transcript there are two reports:
- **Explanation coverage**, one row per notion: first explained, full explanations and in how many sessions, reminders, interrupted explanations, first used, uses, credited uses and their sessions, longest gap, and a verdict against its dosage (`open` until its dosage window closes). This is Jonas's question in one table.
- **Line usage**, one row per line: count, maximum per minute, sessions, and the share heard to the end.

---

## 10. The transcript audit loop

This is the loop Jonas asked for: generate transcripts of everything, read them all, find what isn't explained, what is said too rarely or too often, what is out of order and what is too hard, fix it, and prove the fix.

### 10.1 How transcripts are generated

| Source | How | From |
|---|---|---|
| **Today's game in the browser** | the shadow log (`say()`, `record*()` and one `usePickGame` sink emit `origin: "shadow"` events, in dev and on the treadmill only); `scripts/treadmill/transcript.ts` reads `window.__core.log()` | stage 1, nightly |
| **Headless personas** | `scripts/sim/sweep.ts`: personas × the journey so far × 3 seeds × 10 sessions over 2 weeks of virtual days; `scripts/sim/check.ts`'s four scripted players per chapter | stage 3: every commit (a small set), nightly (full) |
| **Real children** | "Download play log" in the grown-ups area → `bun scripts/sim/audit.ts --log <file>` | whenever Jonas exports |
| **Golden transcripts** | scripted players per beat (perfect, one error, struggling, idle), child level, as Markdown snapshots | stage 3, every commit; a PR diff shows exactly what a child will now hear differently |
| **The Jev probe** | the same sweep, with the probe beside the simulated child for 2 personas | later, nightly |

Every run writes `playtest/transcripts/<run>/journey-<persona>.{md,json}` (child and annotated), `coverage.md`, `lines.md` and `audit.json`. The findings go to `playtest/INBOX.md` through `scripts/treadmill/inbox.ts`, de-duplicated by signature like every other source.

### 10.2 What the auditors check

Deterministic rules read the log together with the ledger replayed alongside it, so "was this explained at that moment?" is exact. Definitions, thresholds and severities are in transcripts-and-audits.md. **Stage 1 runs the eight in bold** over today's game; the rest switch on as the engine and director produce what they read.

| Jonas's question | Rules |
|---|---|
| **Is there something we're not explaining?** | **`used-before-explained`** (a need unmet at its first real use: an utterance, screen or cue that needs it, or an attempt that uses it; or a `requires` key unmet at `beat.start`), `interrupted-explanation`, `mechanic-without-demo`, `picture-not-named`, `narrative-order`, **`untaught-code-shown`**, `unframed` |
| **Is there something we mention once but should mention three times?** | **`under-dosed`** (fewer full explanations than the dosage, or all in one session, when the dosage window closes), `stale-no-refresh`; the coverage table |
| **…or too often?** | **`over-repeated`** (a `vary` line more than twice in 5 minutes, any line more than 3 times a minute, an explanation after retirement, more than the per-session cap), `same-praise-twice` |
| **Is the order right?** | `lag-violation`, `concept-too-early`, `moved-on-too-soon`, `distractors-in-lesson-1` |
| **Is it the right challenge?** | `out-of-band`, `failure-run`, `choice-jump`, **`listening-load`**, `talk-share`, `dead-air`, **`beat-too-long`**, `session-too-long`, `reward-drought`, **`stars-inflated`** |
| **Is it Sounds~Write?** | **`sw-language`**, `segmenting-for-speller`, `answer-given-early` |
| **Is it produced well?** | `missing-audio`, `untagged-line` (a missing or stale tag: a finding, not a failed build, until stage 7), `spliced-speech`, `unlit-naming` |
| **Judgement (nightly, never gating)** | `llm-review` (an LLM reads 2-minute windows of the annotated transcript and the coverage table, asks Jonas's three questions, must cite times and keys, and proposes new notions; claims are checked against the ledger before filing); later `jev-clarity` |

### 10.3 The ratchet and the reading loop

- **The ratchet.** When a human or LLM reader finds something the tags missed ("what's a lantern?"), the fix is data: add `term:lantern` to the line's needs and give the notion a provider. The LLM reader proposes such entries itself. From then on `used-before-explained` catches it deterministically, for every persona, every run and every real child.
- **Tags stay honest.** Each line's meta stores a hash of its text and speaker; a rewritten line shows up as a stale tag until someone re-tags it (`tag-lines.ts --missing --stale`).
- **CI gates** on the deterministic rules at blocker and major severity, for the scripted personas and the golden transcripts, plus `director.check` and `scripts/sim/check.ts` for every chapter and age band.
- **Nightly** runs the full persona sweep, the shadow-log treadmill run and the LLM reader on a sample, and writes the inbox.
- **Weekly, Jonas reads** (the "read them all" part). He reads the annotated transcript of the first two sessions of a fresh 3-year-old and a typical 4-year-old, plus the coverage table, and adds anything he notices as a finding with `--note`. Each note becomes either data (the ratchet) or a new rule.

---

## 11. UI and audio as adapters

Details in [engine.md](architecture/engine.md).

- **React.** One `GameCore` per profile in a provider.
  - `useCore(selector)` subscribes through `useSyncExternalStore`.
  - Scenes render `view.activity` for their machine.
  - `aff(id)` spreads `data-aff` and `tapProps`.
  - `useCues(handler)` maps cues onto today's choreography: `right` → `rightAnswer`/`gift`, `reveal-spelling` → `castSpelling`, `name-card` → the warm-white spotlight, `fast-slow`/`sound-dots`/`pocket`/`rail-light`/`merge` → FIRST_MINUTES's components, `tier-up` → the ninja's power-up. A barrier cue is acked when the handler's promise resolves.
  - The visuals, `Ninja.tsx`, fx and CSS stay. The async flow goes.
- **Embedded mode (stages 5–6).** An old scene calls `await core.runBeat(template)`: the core runs that one beat or activity (no director, no routing), the scene renders its view, and the result goes to the scene's existing reward flow and `store.ts`, which the map still reads until Save v2. Level order stays in `worlds.ts` until its chapter moves to the director.
- **Audio.** `AudioPort` over `engine/audio.ts`.
  - Each `UttPart` maps onto a `Say` (including FIRST_MINUTES's `{ onset }` item), and `light: true` onto `onSeg`.
  - The adapter keeps a queue (`say()` has none); `hush` clears it. **While a core beat runs, it owns `say()` alone**: a call from old scene code is refused with a dev warning and a `sys.error`.
  - It acks with `completed` from `say()`'s boolean and `heardMs` from the clock, adjusted for `FAST`.
  - `missingAudio` when a clip fails to load.
  - A tap during speech carries `during`, so eager answers are exact.
  - Captions come from `utt.text` and `reveal`.
  - `pauseSpeech` becomes `rotated-away` and `rotated-back` inputs. Lipsync and ducking don't change.
- **Clock.** `setTimeout`, scaled by `FAST` (`?fast=N` still works).
- **Storage.** An IndexedDB log per profile from stage 5 (real events only; shadow events never). Snapshots every 200 events and at session end from stage 8, with a small copy in localStorage as a fallback, because iOS can evict IndexedDB. The first boot on Save v2 writes a `legacy-import` of today's `Save`.
- **Bots.** `window.__core = { view, dispatch, log, oracle }`, where `oracle` exists in dev only. From stage 5, `bot.ts` prefers `__core.view().debug.answers` when `__core` exists and falls back to `window.__snState`, so ported scenes keep their bots; `__snState` goes at stage 8. The browser sweep keeps catching layout and visual bugs; logic bugs move to the headless sweep.

---

## 12. Testing

| Layer | What | Where | Runs |
|---|---|---|---|
| Unit | log, learner, ledger, planner, director, protocol, machines, engine, renderer, each audit rule | `src/core/**/*.test.ts` | every commit (`bun test`, under 10 s) |
| Property | reducers never mutate and fold associatively (`fold(all) == fold(tail, fold(head))`); pruning never changes a fold; machines are total under 10,000 random inputs; `voice` lists every line any path says; planner hard constraints over every unit × 1,000 seeds | same | every commit |
| Static content | tag coverage (reported; gated from stage 7); every need has a provider; no cycles; `director.check` for every chapter × age band; the warm-ups adapter against a WARMUPS fixture; `VALIDATOR_RULES` | `src/core/content/*.test.ts`, `src/core/director/check.test.ts` | every commit |
| Golden transcripts | child-level Markdown per beat for 4 scripted players | `src/core/__golden__/` | every commit |
| Audits | fixture logs with planted defects give exactly the expected findings; **clean twins give none** (including the director-inserted explanation followed by its first use); today's browser transcripts as regression fixtures | `src/core/transcript/audits/*.test.ts` | every commit |
| Dynamic check | every chapter × age band × four scripted players through the real engine, audited | `scripts/sim/check.ts` | every commit (Chapter 0 and the current chapter); nightly (all) |
| Simulation | personas × multi-day schedules, with thresholds below | `scripts/sim/*.sim.test.ts` | 30 s in CI; the full sweep nightly |
| Browser | the existing sweep and monkey, driven by `data-aff`; transcript parity per ported machine; FIRST_MINUTES's treadmill acceptance | `scripts/treadmill` | as now |
| Later | model recovery (AUC, Brier) against the simulated truth; cohorts; replay determinism | `scripts/sim/recovery.test.ts`, `cohort.ts` | nightly, once built |

**Simulation thresholds.** These are starting smoke alarms, to be calibrated against real logs. Each persona answers the opt-in; the game derives its age band like a real child's.

| Persona | Must hold |
|---|---|
| tapper-3 (Maya, 3¾, first time) | W1 within 100 s and W2 within 75 s (FIRST_MINUTES's caps); talk before the first tap ≤ 12 s; taps during naming never become attempts; rest offered by 10 minutes; zero `used-before-explained` |
| typical-4 | median independent rate per review beat 0.8–0.92, and per teach beat 0.6–0.8; under 5% of seeds with any beat below 0.5; IC1 passed by mastery in sessions 4–10; every idea explained 3 times over ≥ 2 sessions before it retires; **zero** `under-dosed` and `over-repeated` findings |
| struggling-4 | never moved on below 0.6; remediation by session 6; never 3 failed items in a row without a scaffold change; keep-up KCs stay in review |
| year1-6 (confident, answers Year One) | at most one I do per mechanic after placement; at most 20% of beats too easy; jump ahead offered within 2 sessions; a normal spelling lag never freezes new code |
| bluffer-3 (answers Year Two) | the FIRST_MINUTES check drops the band within the first three you-do items |
| forgetful-5 | due reviews keep taught KCs at ≥ 0.6 true recall |
| guesser-4 | the guessing detector fires within 10 items; choices drop to 2 and the demo comes back |

---

## 13. File layout

```
src/core/
  types.ts                  re-exports src/core/types/<module>.ts (split in stage 1)
  index.ts                  createCore(env, ports) → GameCore; boot
  config/defaults.ts        LearnerConfig, PlannerConfig, DirectorConfig (limits by age, bands by purpose),
                            SupportPolicy (default, warm-up), dosage defaults, cue times
  kernel/                   rng.ts · ids.ts · time.ts (pure date maths: local day, days between) · age.ts (ageBandFor)
  content/                  curriculum.ts · evidence.ts (evidenceFor) · linebook.ts · line-tags.ts · cues.ts · notions.ts
                            teach.ts (pure port) · warmups.ts (the WARMUPS adapter) · durations.ts
  log/                      events.ts (constructors, retention, compaction) · fold.ts · snapshot.ts (stage 8) · upcast.ts
  learner/                  model.ts (apply, fold) · bkt.ts · memory.ts · grade.ts · evidence.ts (→ sw.ts) · detectors.ts
                            priors.ts · queries.ts
  ledger/                   ledger.ts (apply) · readiness.ts · owed.ts
  planner/                  pacing.ts · due.ts · outline.ts · scaffold.ts · block.ts · adapt.ts · predict.ts
                            generators/{oral,tapall,build,symbol,swap,read,dictation,text,sort,choice,poly}.ts
  director/                 director.ts (next, apply) · resolve.ts · reinforce.ts · frames.ts · challenge.ts · governor.ts
                            invariants.ts · check.ts · adjust.ts (deferred)
                            chapters/{first-minutes,bamboo,blossom,mountain,river,castle,bridge,sky}.ts
  activities/               protocol.ts · support.ts · pick.ts · rail.ts · build.ts · read.ts · swap.ts · sort.ts · story.ts
                            run.ts · choose.ts · screen.ts · skins.ts · errors.ts
  engine/                   step.ts (CoreStep) · script.ts · awaiting.ts · streak.ts · rewards.ts · beats.ts · embed.ts
                            screens.ts · meta.ts
  text/                     screen.ts (PlayerView → text)
  transcript/               render.ts · markdown.ts · coverage.ts · audits/<rule>.ts · findings.ts (→ treadmill Finding)
  __golden__/  __fixtures__/
src/adapters/
  react/                    CoreProvider.tsx · useCore.ts · useActivity.ts · useCues.ts
  audio.ts                  AudioPort over engine/audio.ts (queue, acks, sole owner of say() during core beats)
  storage.ts                StoragePort over IndexedDB; legacy Save import (stage 8)
  clock.ts                  ClockPort over setTimeout (FAST-aware)
  bridge.ts                 stage 1: the shadow log of today's game (dev and treadmill only)
scripts/sim/
  run.ts  play.ts  sweep.ts  check.ts  audit.ts  tag-lines.ts  presenter.ts (TextPresenter)  timeline.ts  personas.ts
  policies/{scripted,perfect,random,child,human}.ts        later: policies/{jev,llm}.ts, cohort.ts, recovery.test.ts
scripts/gen-durations.ts    public/a/durations.json
```

**Dependency rule.** `content ← core ← adapters ← ui/scenes`, and `scripts/sim → core`.
- `src/core` never imports `src/engine`, `src/ui`, `src/scenes`, `src/App.tsx`, React or `scripts/`. The perfect policy lives in `scripts/sim` and the core never needs it.
- It imports only the pure content modules: `sw.ts`, `phonics.ts`, `units/*`, `warmups.ts`, `lines.ts`, `stories.ts`, `pic-names.ts`, `flower.ts` and `teach-lines.gen.ts`.
- `teach.ts` is not imported, because it reads `localStorage` when the module loads; its moments are ported to `core/content/teach.ts`. Nor are `worlds.ts`'s impure helpers (`makeReview`, `setTrialLevel`).
- A boundary test greps the imports, and `Date.now`, `Math.random`, `window`, `document`, `localStorage` and `setTimeout` under `src/core`.

---

## 14. Migration: staged, and shippable after every stage

Rules of the road:
- **Stay out of other agents' files.** Other agents are editing `src/scenes/*`, `src/App.tsx`, `src/ui/*`, `src/content/lines.ts` and the film right now, and the FIRST_MINUTES owner is changing `Early.tsx`, `store.ts`, `gems.ts`, `worlds.ts`, `audio.ts` and `lines.ts`. Every core change to a shared file is one small hook, agreed with its owner, landed after theirs (the table below).
- **Every stage ships on its own** and is useful on its own.
- **Codex builds each stage** from the module specs, with their test lists as acceptance criteria, and builds only the types that stage needs.

| Stage | What changes, in which files | Ships | Done when |
|---|---|---|---|
| **0. Design** (this) | `docs/ARCHITECTURE.md`, `docs/architecture/*.md`, `src/core/types.ts` | nothing visible | reviewed |
| **1. Answer Jonas about today's game** | New: `src/core/types/*` (split), `src/core/kernel/*`, `src/core/content/{linebook,line-tags,cues,notions,durations}.ts`, `src/core/ledger/*`, `src/core/log/{events,fold}.ts`, `src/core/transcript/*` with the eight stage 1 rules, `src/adapters/bridge.ts`, `scripts/gen-durations.ts`, `scripts/sim/{tag-lines,audit}.ts`, `src/core/boundary.test.ts`. Edit (one hook each, agreed with the owners): `src/engine/audio.ts` (a speech sink shaped like FIRST_MINUTES's `onClip` hook), `src/engine/store.ts` (an attempt sink on `record*`), `src/scenes/Early.tsx` (one sink call in `usePickGame`, with the owner adding its quiet mode), `scripts/treadmill/{transcript,inbox,types,run}.ts` | the coverage table and findings for **today's** game, nightly: what is never explained, said once, said too often, too long, spliced | the w1-1 shadow fixture shows `used-before-explained` for both ideas; every stage 1 rule has a planted-defect test and a clean twin; the tag coverage report exists (missing and stale lines listed, not failing) |
| **2. Learner v1** | New: `src/core/learner/*`, `src/core/content/{curriculum,evidence}.ts` | nothing visible | learner.md tests pass: Jonas's example, forced taps, talk never teaching reading, the recall clock, the guessing detector on the jev-tutor archetypes |
| **3. The warm-ups as a text adventure** | New: `src/core/engine/*` (no snapshots), `src/core/activities/{protocol,support,pick,rail,choose}.ts`, `src/core/content/warmups.ts` (reads `src/content/warmups.ts` once its owner lands it), a minimal director (cursor, time governor, the check) with `chapters/first-minutes.ts`, `scripts/sim/{run,play,presenter,timeline,check,personas}.ts`, policies scripted, perfect, random, child and human; golden transcripts. No browser change. Coordinated with the FIRST_MINUTES owner: the same WARMUPS data, and their treadmill timings compared with the headless ones | Jonas plays the first minutes (opt-in, W1, W2, rewards) at a terminal; headless transcripts of them for three personas | activities.md and engine.md tests; `bun scripts/sim/play.ts` works; the W1/W2 line sequence matches FIRST_MINUTES §5 and §7 for a perfect child; `scripts/sim/check.ts` finds nothing in Chapter 0 |
| **4. Planner, hard constraints** | New: `src/core/planner/*`. Edit (after the FIRST_MINUTES owner's changes land there): `src/engine/learner.ts` (`chooseWords`, `tileBank` and `swapChain` keep their signatures and filter through the planner's hard constraints, keeping today's choice among what passes), `src/engine/gems.ts` (`trialWords`) | no distractors in Lessons 1 and 5; review with the official lags; insert and delete swaps | planner.md tests; the treadmill shows no regressions |
| **5. The warm-ups in the browser, embedded** | New: `src/adapters/{react/*,audio,clock,storage}.ts`, `src/core/engine/embed.ts`. Edit, **with the Early.tsx owner, after W1 and W2 ship**: `EarsLevel` and `PicReadLevel` call `core.runBeat()` and render `view.activity` with their existing components; `scripts/treadmill/bot.ts` prefers `__core` answers. Behind `?core=warmups` | the same warm-ups, now logged for real (IndexedDB), with the stars bug impossible by construction; default on after a week on the treadmill | **parity**: for a fixed seed and scripted player, browser and headless transcripts have the same utterance line ids in the same order, and match the pre-core implementation's audio log |
| **6. The other machines, embedded** | One per change, same parity rule, each coordinated with that scene's owner: the remaining `pick` games (`ListenLevel` for W5, first sound, sound hunt, Dojo Find, Placement rounds), `build`, `read`, `swap`, `sort`, `story`, `run`, `screen` (flower, Sticker Book, map). `usePickGame` is deleted only when its last user has moved and its owner agrees | each ports that scene's orchestration; its JSX and CSS remain; the planner's ranking and `due` switch on once real attempts exist | parity per machine; the old code is gone |
| **7. The director drives, one chapter at a time** | Full `src/core/director/*`: notions and dosage, `resolve`, `reinforce`, frames, the challenge report, recap, invariants as guards, `check` in CI. `?core=director&chapter=first-minutes` first, then Bamboo Village, then each land, each a separate change to `src/App.tsx` routing, coordinated with its owner. The tag gate turns on (`untagged-line` becomes major) on a date agreed with the `lines.ts` owners | every interaction is framed and explained; limits by age; reminders and spaced explanations | per chapter: a fresh profile plays 5 sessions through the director; `director.check` and `scripts/sim/check.ts` are green for that chapter and every age band |
| **8. Save v2 and clean-up** | The log becomes the save; snapshots with per-reducer hashes; `legacy-import` on first boot; gem energy, stars, petals and stickers derived. Edit `src/engine/store.ts` (profiles and settings only) and `src/engine/gems.ts`. Delete `engine/learner.ts`, `window.__snState` and the old bot branches. Grown-ups page: export play log, per-unit report with lags and watch list | one source of truth | migration tests pass on `playtest/fixtures`; the old paths are gone |

**Later**, each when real logs show the need: exact replay (`input` events and replay tests), `adjust` and splitting, quests and Baron's cadence, the other detectors' tuning, the Jev clarity probe, LLM personas, cohorts and model-recovery metrics, fitted parameters. Planner-led sessions (§5 outline) drive review, current unit and connected text beyond the authored Bamboo Village beats as the Extended Code content lands (SOUNDS_WRITE_MODEL.md §6).

**Shared files, and who goes first.**

| File | FIRST_MINUTES changes | Core changes | Order |
|---|---|---|---|
| `src/scenes/Early.tsx` (`usePickGame`) | quiet mode, echoes, 8 s/16 s idle, no requeue, `targets[]`, new `EarsLevel`/`PicReadLevel` | stage 1: one sink call; stage 5: the warm-up levels call `runBeat`; stage 6: `usePickGame` retired with the owner's agreement | FIRST_MINUTES first; the core's hook in the same change as their quiet mode if they agree |
| `src/engine/store.ts` | `schoolYear`, `band`, `stickers`, `recordMet` | stage 1: an attempt sink; stage 8: profiles and settings only | FIRST_MINUTES first |
| `src/engine/audio.ts` | `{ onset }`, word timings, `onClip` | stage 1: a speech sink on the same hook pattern; stage 5: the adapter's queue ownership | FIRST_MINUTES first |
| `src/engine/gems.ts`, `src/content/worlds.ts` | warm-up levels, `frontier()`, `placeAtUnit()`, `startFor()` | stage 4: `trialWords` through the planner; worlds.ts stays the level order until stage 7 | FIRST_MINUTES first |
| `src/content/lines.ts` | about 90 `fm_*` lines | none: tags live in the sidecar, drafted by `tag-lines.ts --missing` in the same change as the new lines | either |
| `src/App.tsx` | the opt-in route and first-session chaining | stage 7 only, one chapter per change | FIRST_MINUTES first |
| `scripts/treadmill/bot.ts` | `optin`, `ears`, `picread` | stage 5: prefer `__core` answers | FIRST_MINUTES first |

---

## 15. Decisions (Jonas, 26 September 2026)

1. **Rewards:** stickers first. Stickers and gem energy are the visible rewards everywhere; stars (independent answers only) stay in the background as a signal for grown-ups.
2. **I do / we do / you do everywhere, including the warm-ups** (Jonas, later on 26 Sep: "have the same let me show you, now you try mechanism in the warm ups"). Every new game type starts with "Let me show you" (Sensei and the ninja demonstrate one item), then "Now you try"; the full "Let's do it together" step comes back from IC Unit 1 onwards.
3. **"Hear it again" button:** explain it (in the dojo welcome and the first times it matters), and track it as a notion with dosage.
4. **Logs:** they stay on the device. Exported logs from Jonas's children may be used, by hand, to calibrate the learner model and the personas; never uploaded automatically.
5. **Line tags:** an agent reviews Jev's draft tags, with PEDAGOGY.md and the teacher-language research open. Jonas isn't needed.
6. **Pace:** mastery. Start half a term behind the child's class and move on at 75–80%; the school's pace is shown to grown-ups as a reference only.
7. **Authored against planned:** as proposed. The film, warm-ups, stories, bosses and Bamboo Village's pinned words stay authored, and everything between is planned.
8. **Constants:** start with the educated guesses and tune them from real (exported) logs and persona runs.

## 15a. Original open questions (kept for reference)

1. **Stars from independent answers only.** A child who waits for the glow will get fewer stars than today. FIRST_MINUTES already hides stars in the warm-ups and rewards with stickers. Should later lessons also lean on stickers and gem energy, with stars in the background?
2. **Phase announcements.** FIRST_MINUTES drops "Watch me first / together / your turn" in the warm-ups. Keep them from IC1 on (the default here), or drop them everywhere?
3. **The "Hear it again" button** is never explained in the new first minutes (`tut_speaker` is retired). The first coverage report will flag it. Add a line to the dojo welcome?
4. **Logs stay on the device,** with an export button for bug reports. Can exported logs from your children be used, by hand, to calibrate the model and personas?
5. **Line tags.** About 400 lines, including the new `fm_*` ones, get tagged once (Jev drafts, then someone reviews). Should that be you, or an agent with PEDAGOGY.md and the teacher-language research open?
6. **Pace for children who also go to school.** Follow mastery (the default, starting half a term behind the school-year pace) or keep the school's pace as well (a setting)?
7. **Authored against planned.** The proposal: the film, the warm-ups, stories, bosses and Bamboo Village's pinned words stay authored, and everything between them is planned. How much of `worlds.ts`'s hand-made order should survive past Bamboo Village?
8. **Starting constants** (learner parameters, dosage, limits by age, the 8 s/16 s idle ladder, the recall floor of 0.5, rest after 10 minutes at age 3) are educated guesses, to be tuned from real logs.
