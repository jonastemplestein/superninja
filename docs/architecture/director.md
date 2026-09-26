# The director: narrative sense, dosage and challenge

Module: `src/core/director/`. Types: `DirectorApi`, `DirectorState`, `DirectorContext`, `Chapter`, `Episode`, `BeatTemplate`, `TemplateCommon`, `ScriptStep`, `Frame`, `Beat`, `ChallengeReport`, `ChallengeBands`, `BeatLimits`, `Invariant`, `DirectorNote` in `src/core/types.ts`. Overview: [ARCHITECTURE.md §6](../ARCHITECTURE.md#6-the-director-narrative-sense-dosage-and-challenge).

The director decides what the child experiences next, and guarantees that it makes sense to *this* child:
- every interaction has a story reason;
- nothing is used before it has been explained;
- explanations are repeated as their dosage says, and not more;
- the challenge suits the child's age and knowledge.

It is pure: `next(d, ctx)` returns the next beats and notes, and `apply(d, e)` folds events into its memory (cursor, history, story state, session).

**Built in stages.** Stage 3 has a minimal director: a cursor over authored beats (the warm-ups), the time governor, and the FIRST_MINUTES check. Stage 7 adds everything else in this file: notions and dosage, `resolve`, `reinforce`, frames, the challenge report, recap, invariants as guards, and `check`. `adjust` and splitting (§6), quests and Baron's cadence (§9) are deferred until real logs show they are needed; until then a beat outside its limits is reported, and an author fixes it.

## 1. Content model

**Chapters** live in `core/director/chapters/*.ts`, one per land, ported from `worlds.ts`.

### Chapter 0 and the warm-ups come from docs/FIRST_MINUTES.md

FIRST_MINUTES.md is the spec for the first five minutes, and its owner is implementing it now. The core does not re-author it. Its lesson scripts are data (`src/content/warmups.ts`, `WARMUPS`, FIRST_MINUTES §15), and the core reads that same data through an adapter, `core/content/warmups.ts`: `warmupEpisode(id, WARMUPS[id], band) → Episode`. When the scripts change, the core's beats change with them.

**Chapter 0 (`first-minutes`)**, for a child who is not at school yet:
1. film: `film_1`–`film_8`, which establish `char:baron`, `fact:petals-scattered`, `obj:world-flower`, `char:sensei` and `place:island`;
2. `choose` hero;
3. the opt-in (FIRST_MINUTES §4): `choose` screen A, "Do you go to big school yet?" (`fm_opt_q1`, teddy or school), and screen B, "Which class are you in?", only after "school". Last tap wins after 1.5 s of quiet (`ChoiceSpec.settleMs`); silence picks "none" after 20 s on A and Reception on B (`ChoiceSpec.silence`). It emits `profile.change school-year` and `band`;
4. the dojo welcome: a `scripted` gong, then a `pick` of the Help button (`fm_help_short`, "Stuck? Tap me… Try it now!", then `fm_help_ok`), which explains `mech:help-button`;
5. episode W1, Ninja Ears (`warmupEpisode("W1")`);
6. Reward 1: the Sticker Book arrives (`fm_rw_*`), which explains `obj:sticker-book` and `idea:stickers-for-pictures`;
7. episode W2, Ninjas Read This Way;
8. Reward 2: the shiny fish-dog sticker, the first petal through the mist (`obj:petal`), then the map.

**School paths** (band R, Y1, Y2) follow FIRST_MINUTES §9: a 90 s cut of the start dojo (`Episode.budget`), the Sticker Book reward, a 60 s cut of the next level, and a reward. **The check** (§10 of that file) is a director obligation: after the first three you-do items at a school start, if 0 or 1 was right on the first try, the director emits `profile.change band` one step down, says `fm_warm_up`, and starts the new band's first lesson.

**The warm-up world** (W1–W6, `w1-wu1` … `w1-wu6`) stands at the front of Bamboo Village. w1-1 is retired. After W6 comes w1-2.

**The adapter**, per `WARMUPS` beat kind:

| WARMUPS beat | Template | Machine and item | Notes |
|---|---|---|---|
| `say` | `scripted` | – | tags from the lines' meta |
| `name` | the next activity's naming (`namePictures`, with `name-card` cues), or a `scripted` beat of `fm_name_<w>` lines with `name-card` cues | – | each name is one whole recording |
| `tap` | `activity` | `pick`, `TutorialItem`, phase we do | `glowAfterMs` → `wedoGlowMs`; explains `mech:tap-picture` through `fm_tap_<w>`'s explain tag |
| `fastslow` | `scripted` (Sensei shows: `fast-slow` and `sound-dots` cues; `fm_fast_sun`, `fm_slow` + the stretched word, `fm_same_word`, `fm_hear_sounds`), then, with `child`, an `activity` | `rail`, `RailItem` judged `none`: the tortoise, then the rabbit (optional) | the scripted part introduces `idea:fast-and-slow-saying` and `idea:words-are-made-of-sounds` |
| `slowpick` | `activity` | `pick`, `OralItem` (`oral-blending`, stretched); the first item is we do with its glow | a right answer plays the stretched word, 350 ms, then the word |
| `notice` | `scripted` (held first sounds, gold dots, `fm_notice_*`, a `sayWithMe` pause) | – | introduces `idea:first-sound` |
| `tapall` | `activity` | `pick`, `TapAllItem` | two misses → the targets left glow with `fm_look_this` |
| `rail` | `activity` | `rail`, `RailItem`: `by: "sensei"` is an I do; `by: "child"` is judged on order | a wrong order → `fm_l2_start` |
| `which` | `activity` | `pick`, `ChoiceItem` whose options are two rails | |
| `compound` | Sensei: `scripted` with a `merge` cue. Child: `activity` | `rail`, one guided rabbit tap (judged `none`) | |
| `optional` (◇), `secs` | `TemplateCommon.optional`, `.secs` | | the time governor (below) |
| `targetS`, `capS` | `Episode.budget` | | |
| `school.R` | the band R variant of the episode | | Reception's Lesson 1 and 2 |

Every warm-up activity uses `support: "warm-up"` ([activities.md §2](activities.md#2-the-teaching-protocol)): no phase lines, the first we-do answer glows after 2 s, the idle ladder of FIRST_MINUTES rule 5, errorless mistakes, no requeue, praise at most every third right answer. Warm-up rewards are `stars: "silent"` and `celebrate: "stickers"`.

**The time governor** (FIRST_MINUTES rule 10). The episode's target clock is the sum of the earlier templates' `secs`. At the start of an `optional` template, if the episode is more than 5 s behind, the template is skipped (a `game.decision`). At `budget.capMs`, the current template is finished by the paw (`fm_last_one`, "Here's the last one!") and the episode closes.

### Episodes, level kinds and frames

**Episodes are today's levels,** one map stone each, with `legacyLevel` set, so the map, stars and deep links keep working during the migration. Until a chapter moves to the director (stage 7), `worlds.ts` stays the one source of level order; the core never keeps a second copy.

| Level kind | Beats (activity → machine, skin) |
|---|---|
| `ears`, `picread` (W1–W6) | from `WARMUPS`, as above |
| `listen` | retired with w1-1; `ListenLevel` survives only for W5's segmented blending (`oral-blending` → `pick`) |
| `firstsound` | `oral-first-sound` → `pick` (the reveal teaches the spelling); `symbol-search` → `pick`; with `words`, `word-building` → `build` |
| `soundhunt` | `oral-middle-sound` → `pick`; `word-building` → `build`; `who-read-it-right` → `read` |
| `dojo` | `word-building` or `word-building-digraph` → `build` (dojo); `who-read-it-right` → `read`. No isolated Learn phase: new spellings come through teach moments in words |
| `battle` | `dictation-word` → `build` (battle), with words at least one unit behind (two for recall) |
| `boss` | a `gate` for the land's units, then `word-reading` → `read` and `dictation-word` → `build` (boss): the land's Progress Check |
| `run` | `timed-review` → `run`, one unit behind |
| `swap` | `sound-swap` / `nonsense-sound-swap` → `swap`, one unit behind |
| `sort` | `sound-sort` → `sort`, Bridging and Extended Code only (SOUNDS_WRITE_MODEL §4). The world 3 sorts move to the Rainbow Bridge land |
| `story` | `reading-in-text` → `story`, one unit behind |
| gem trial | `dictation-word` → `build` (trial) |
| flower, book, map | `screen` templates → the `screen` machine ([activities.md §3](activities.md#3-the-machines)) |

**Frames** belong to a chapter.
- A frame is the story reason for an activity: a pitch (said in full the first 2 times, then the short pitch), a payoff and needs. Examples:

  | Frame | Pitch | Needs | Payoff |
  |---|---|---|---|
  | `warm-up` | the lesson's own opening line (`fm_l1_hello`, `fm_l2_way`) | – | the sticker bead |
  | `monster-in-the-way` | `battle_start` | `char:baron`, `term:monster` | `battle_win` |
  | `baron-muddled-signs` | `swap_start` | `char:baron`, `fact:petals-scattered` | `swap_done` |

- **The full pitch** is said while `ledger.lines[firstLineOfPitch].n < 2`. After that, the short pitch. A frame's keys are reinforced by its pitch and short pitch, not by reminders: success at spelling says nothing about whether the child knows what a monster is.

**Notions** (the registry is in [content.md §5](content.md#5-the-notion-registry-notionsts)) carry the dosage that drives reinforcement.

## 2. Dosage defaults

In `config/defaults.ts`. A notion can override any field.

| Kind | beforeUse | full | spacing (before the 2nd, 3rd) | minSessions | reminders | retireAfter | refreshAfterDays | maxPerSession |
|---|---|---|---|---|---|---|---|---|
| `idea` | 1 | 3 | 2 beats, 1 session | 2 | short | 8 | 14 | 2 |
| `concept` | 1 | 3 | 1 session, 1 session | 3 | short | 10 | 14 | 2 |
| `term` | 1 | 2 | 1 session | 2 | short | 5 | 14 | 2 |
| `mech` | 1 | 2 | 1 session | 2 | none | 3 | 21 | 1 |
| `obj` | 1 | 2 | 2 beats | 1 | short | 3 | 30 | 2 |
| `char`, `place` | 1 | 1 | – | 1 | none | – | 3 | 1 |
| `fact` | 1 | 1 | – | 1 | none | – | 2 | 1 |
| `gpc` (built in) | 1 | 3 | 1 beat, 1 session | 2 | short (rotated teach phrasings; "This is /k/. Say /k/ here." on errors) | 12 | 10 | 2 |
| `word` (built in: naming) | 1 per beat when pictured | 1 | – | 1 | none | – | – | – |

- For `word` keys, `beforeUse` means a picture must be named aloud in the beat before it is asked about. The protocol does this with `namePictures`.
- **Retirement** needs all of: the `full` explanations given, `retireAfter` independent uses (at most one per beat, and only when the key was a need of the question the child answered), and uses in at least `minSessions` sessions ([ledger.md §3](ledger.md#3-queries)). So the spaced second and third explanations always come, and never count as "after retirement".

## 3. Limits by age (`DirectorConfig.limits`)

The age band is derived at every `session.start` from the school year and the date (`ageBandFor`: not yet, not sure or unset → 3; Reception → 4; Year One → 5; Year Two → 6; one more for every 1 September since it was declared), or from an exact age a grown-up entered. Nobody asks the child's age.

| Age | talkBeforeAction | maxSpeechRun | itemsPerBeat | beatMs | sessionMs | newNotionsPerBeat | remindersPerBeat | rewardEvery | maxTalkShare | instructionSteps |
|---|---|---|---|---|---|---|---|---|---|---|
| 3 | 12 s | 8 s | 6 | 150 s | 10 min | 1 | 1 | 45 s | 0.45 | 1 |
| 4 | 15 s | 8 s | 8 | 240 s | 12 min | 1 | 2 | 60 s | 0.45 | 2 |
| 5 | 18 s | 12 s | 10 | 300 s | 15 min | 2 | 2 | 75 s | 0.5 | 2 |
| 6 | 20 s | 12 s | 12 | 360 s | 20 min | 2 | 2 | 90 s | 0.5 | 2 |
| 7+ | 25 s | 15 s | 14 | 420 s | 25 min | 3 | 2 | 120 s | 0.55 | 3 |

- **`maxSpeechRun`** is the longest stretch of speech with nothing to act on **and nothing new on screen**. A visual cue (a spotlight, the card stretching, the sound dots popping) splits a run. So FIRST_MINUTES's 14 s fast/slow show, where every line lands its own movement, is four runs of 3–5 s, while 14 s of Sensei talking over a still screen is one run and breaks the age-3 limit.
- An authored `scripted` show-and-tell counts as one new notion per key it introduces.
- **Challenge bands** (`DirectorConfig.bands`), over the you-do items only:

  | Purpose | too-hard | stretch | flow | too-easy |
  |---|---|---|---|---|
  | teach (scaffolded new code) | < 0.5 | 0.5–0.6 | 0.6–0.8 | > 0.8 with no new notions |
  | review | < 0.7 | 0.7–0.8 | 0.8–0.92 | > 0.92 with no new notions |

- **Other settings:** `recapAfterDays` 2; `maxSameMechanicRun` 3. Deferred: `baronEveryBeats` [3, 5]; `maxAdjustments` 2.

## 4. `next(d, ctx)`: step by step

```
next(d, ctx):
  1  obligations    onboarding steps not in d.onboarding.done (Chapter 0), the FIRST_MINUTES check on a school start,
                    then story beats unlocked by progress
  2  rest / end     if session time ≥ limits.sessionMs, or affect.fatigue ≥ 0.7, and the last beat ended on a success,
                    and no rest was offered in the last 5 minutes → a `choose` beat offering rest ("dojo_nap")
  3  recap          the session's first beat, when ≥ recapAfterDays since the last session → a recap beat: "Last time…"
                    plus the full providers of every char/place/fact whose refresh is due and that the next beat needs
  4  warm-up        the session's first activity, when the outline's due list is non-empty → a `planned` warm-up beat
  5  the next beat  the cursor's template (skipping an optional one when the time governor says so), or the outline's
                    next planned part; the chapter's gate at its end
  6  instantiate    activity: BlockRequest from the template (pinned, fixed or planned) → planner.block → ActivitySpec
                    needs = machine.needs(spec)          (every line any path can say: activities.md §1)
                          ∪ frame.needs ∪ the needs of the intro and scripted steps
                          ∪ content needs (every GPC shown explained; special words taught; pictures named)
  7  split needs    requires   = char:, place:, fact: keys, and the roots of dependency chains this beat can't explain
                    introduces = idea:, term:, concept:, obj:, mech:, gpc: keys this beat will explain itself
  8  resolve        prerequisites first (topological order over dependsOn):
                      requires unmet        → insert the story, film or recap beat that establishes it BEFORE this beat,
                                              or use a frame without that need
                      idea:, term:, concept:, obj: → the full provider's utterances in beat.intro, or an exposition beat
                                                before it if the intro would exceed maxSpeechRun
                      mech:                  → force release.ido ≥ 1 (and wedo ≥ 1): the demonstration explains it
                      gpc:                   → its teach moment (intro-gem, or the first-sound reveal) before first use
                      notBefore not reached  → defer the beat (a content ordering bug; CI catches it)
                      no provider            → unresolved: defer the beat and log sys.error (CI fails)
  9  reinforce      owed(needs) from the ledger: full-by-spacing first, then short reminders; at most newNotionsPerBeat
                    full explanations and remindersPerBeat reminders, the most overdue first; reminders go just
                    before the first prompt that relies on the key ("Remember, words are made of sounds!")
 10  frame          pitch in full the first 2 times, then the short pitch; payoff into the outro
 11  challenge      challenge(beat) → the report (§5). Deferred: adjust and split. Until then an out-of-limit or
                    too-hard beat is recorded as a DirectorNote "violated" and runs as authored
 12  record         why[] and DirectorNotes for every insertion, deferral and violation; requires and introduces →
                    beat.start
```

**`resolve(needs, ctx)`** is also exposed on its own. It returns the providers to insert, in order, and the needs it couldn't resolve.
- Cycles are content bugs: they throw in tests and are reported by `check`.
- The cheapest provider that meets the need wins. The short form is enough when the entry is `assumed` or merely stale.

**`reinforce(keys, ctx)`** returns `UtteranceSpec`s for the owed items after the caps.

**Why `requires` and `introduces` are split.** The explanations the director inserts play inside the beat, after `beat.start`. So a beat's own teaching must be judged where it is first relied on, not at `beat.start`. The ledger records first use at the first utterance, screen or cue that needs a key, or the first attempt that uses it ([ledger.md §2](ledger.md#2-the-reducer)), and the `used-before-explained` audit judges the same moments. Only `requires` is checked at `beat.start`.

## 5. `challenge(beat, ctx)`

Pure: the talk figures come from `beat.intro` (and the scripted steps) plus the machine's `estimate(spec, ctx)`, which each machine computes from its naming and prompt utterances. Nothing is played through the engine. The full dry run (four scripted players through the real engine) is a CI check in `scripts/sim/check.ts` (§8).

| Field | Computed as |
|---|---|
| `purpose` | `teach` if the block teaches new code or a new mechanic; `review` for review, warm-up and trial blocks; `none` without you-do items |
| `predicted` | the mean `predicted` of the **you-do** items (null when there are none) |
| `newNotions` | keys whose first full explanation this beat carries |
| `newKcs` | target KCs with status unseen or exposed |
| `reviewKcs` | target KCs on the due list |
| `choices`, `release`, `items`, `timed` | from the scaffold |
| `talkBeforeActionMs` | the intro's `estMs` + `estimate.talkBeforeActionMs` |
| `maxSpeechRunMs` | max(the longest intro run, `estimate.maxSpeechRunMs`) |
| `talkShare` | talk / (talk + expected response time: steps × this child's median latency) |
| `estMs` | intro + `estimate.estMs` + (1 − P) × the mean correction length |
| `sameMechanicRun` | from `d.history` |

The band, from `DirectorConfig.bands[purpose]` (§3), and only when `predicted` is not null. Separately, **too-hard** also when newNotions exceed the limit or `talkBeforeActionMs` exceeds it (those are hard limits).

## 6. `adjust(beat, report, ctx)`: deferred

Specified here so the shape is agreed, built only when real logs show beats outside their bands.

**Too hard**, in order, stopping at the first that applies:
1. More new notions than the limit → split: an exposition beat before (the extra explanation, then a small action such as "tap the petal"), or defer an optional notion.
2. Too much talk before the first action → move explanations after the I do (show, don't tell), or split into an exposition beat.
3. Predicted below the band → one fewer choice (minimum 2), one more we do, a more supportive presentation (stretched), then replan the block with the target lowered by 0.1.

**Too easy:** skip the I do if the mechanic is independent; one more choice (up to the maximum); a shorter block (n − 2). **Never probes**: code the child hasn't been taught is never shown because a beat looked easy. Probes belong to placement and the jump-ahead check only ([planner.md §5](planner.md#5-blockreq-ctx-the-items-for-one-block)).

**Always:** more items than `itemsPerBeat`, or `estMs` over `beatMs`, reduces n. If the template pins more words than the limit, the episode is split into consecutive beats.

## 7. Invariants (guards)

One predicate per rule, used by the director before a beat and by the audits after a run. The ids are shared with [transcripts-and-audits.md](transcripts-and-audits.md).

| Rule | Guard before the beat | Fix |
|---|---|---|
| `used-before-explained` | every `requires` key is met at `beat.start`; and, replaying the ledger through the beat's intro and scripted steps, every need of every line in `machine.voice(spec)` is met by the time the activity starts | insert providers |
| `mechanic-without-demo` | a `mech:*` key not explained → release.ido ≥ 1 | force the I do |
| `narrative-order` | the frame's needs are met | insert a story beat, or change frame |
| `untaught-code-shown` | every spelling in the items is in `taughtCode` (probe items exempt) | replan |
| `concept-too-early` | `notBefore` ≤ frontier | defer |
| `lag-violation` | review items respect the lags | replan |
| `distractors-in-lesson-1` | Lesson 1/5 banks have 0 distractors | replan |
| `listening-load` | talk before the first action and the longest speech run are within limits | report (adjust deferred) |
| `beat-too-long` | items and `estMs` are within limits | report (adjust deferred) |
| `choice-jump` | choices ≤ the last block of this mechanic + 1 | clamp |
| `under-dosed` | owed full explanations are attached (within the caps) | reinforce |
| `unframed` | every activity beat has a frame pitch | use the chapter's default frame |
| `session-too-long` | a rest is offered by `sessionMs` | a rest beat |

`out-of-band` is not a guard: the predicted band is reported on `beat.start`, and the audit compares it with what happened.

## 8. `check`: two CI contract checks

**`director.check(chapter, ctx)`** (static, in core, every commit). For each age band, it builds the chapter's authored beats in order against a **minimal child** (blank learner and ledger), or against a persona's start state, with synthetic events standing in for a perfect run. For each beat:
1. `requires` is met;
2. replaying the ledger through the intro and scripted steps, every need of every line in `machine.voice(spec)` (all paths: prompt, naming, both corrections, the Help ladder, the idle steps, praise, skin lines) is met;
3. the hard limits hold: talk before the first action, items, new notions.

It fails on any unresolved need, cycle, untagged line (from stage 7), `notBefore` violation or hard-limit breach. **It never fails on a predicted band**: a blank child always predicts low on new code. It reports every `inserted` note, which shows where authored content relies on runtime insertion. That list is the author's to-do list.

**`scripts/sim/check.ts`** (dynamic, every commit for Chapter 0 and the current chapter; nightly for all). It plays each chapter through the real engine with four scripted players (perfect; one error per item; two errors per item; silent for 30 s on every question) for each age band, and runs the deterministic audits on the logs. That is where the lines a struggling 3-year-old hears (corrections, Help, idle re-asks, `fm_its_this`, place of error, `help_tiles`, `battle_oops`, `timer_intro_*`) are proven, not just listed.

## 9. Story continuity (`StoryState`)

`apply` folds the story state from the log:
- the land from `land-entered`;
- the location from beats;
- last visits;
- quest steps from frame payoffs, and Baron's appearances (deferred).

The payoff of an episode's last frame feeds the next session's recap ("Last time, you helped the pandas find their pot…"). The recap needs new lines, recorded as whole sentences. Deferred: Baron cuts in every 3–5 beats, when the frame allows it and `char:baron` is established.

## 10. Tests (`src/core/director/*.test.ts`)

1. **The warm-up adapter.** `warmupEpisode("W1", WARMUPS.W1, "none")` gives templates whose line ids, in order, equal the lines in FIRST_MINUTES §5's table for a perfect child; optional beats carry `optional`; `budget` is 85 s / 100 s; every activity uses `support: "warm-up"`. Changing a line in the WARMUPS fixture changes the templates (no hand port).
2. **Dosage over sessions.** A simulated perfect child plays the Bamboo Village warm-ups over 3 sessions: `idea:words-are-made-of-sounds` gets exactly 3 full explanations across ≥ 2 sessions, then short reminders, and none once retired. The run has **zero** `under-dosed` and `over-repeated` findings.
3. **Requires and introduces.** A beat whose intro carries the inserted `words_made` explanation, followed by a segmented prompt, has `introduces: ["idea:words-are-made-of-sounds"]`, empty `requires`, and its log gives zero `used-before-explained` findings.
4. **Frames and needs:** a child placed at IC3 (Blossom Hills) hears who Baron is (the film shots, or a recap providing `char:baron`) before the first `monster-in-the-way` pitch; `char:baron` is in that beat's `requires`, and the recap beat comes before `beat.start`.
5. **Mechanics:** the first build beat has release.ido ≥ 1; after two sessions of independent building, the I do is gone.
6. **Interrupted explanations:** if the `words_made` explanation was cut off, the next beat that relies on the idea gets the full form again.
7. **Recap:** a child back after 3 days gets a recap beat before any beat that requires `char:baron`; after 1 day, no recap.
8. **Challenge:** a teach block of new code for a blank child reports its band from you-do items only (I-do items excluded, we-do items at ≥ 0.9); `check` does not fail on it. A beat with 3 new notions for a 3-year-old is reported as `violated` (`listening-load`/new notions) and fails `check`.
9. **Limits:** no authored Chapter 0 or Bamboo beat for age 3 exceeds 6 items or 12 s of talk before the first action (a `check` failure, fixed in the content).
10. **Rest:** at 10 minutes (age 3), after a success, a rest `choose` beat is offered once; declining it continues play, and it is not offered again for 5 minutes.
11. **`check`:** passes for Chapter 0 and Bamboo Village for every age band. A planted Help line with an unmet need and no provider makes it fail with `no-provider`, even though a perfect run never presses Help. A planted cycle fails with `cycle`.
12. **The time governor:** with the episode 6 s behind its target clock, an optional template is skipped with a `game.decision`; at the cap, the paw finishes the current template with `fm_last_one`.
13. **The FIRST_MINUTES check:** a Year Two start with 1 of 3 right emits `profile.change band` to Y1 and `fm_warm_up`; with 2 of 3, nothing.
14. **Invariants as audits:** each guard in §7, run as an audit over a fixture log that breaks it, gives exactly one finding.
15. **Determinism:** the same state and context give deep-equal beats and notes.
16. **Sorts:** no sort beat appears before BR, whatever the template order (`concept-too-early` defers it, and `check` reports it).
