# Activities: state machines and the teaching protocol

Module: `src/core/activities/`. Types: `ActivityMachine`, `MachineStep`, `Op`, `AwaitSpec`, `ProtocolParts`, `SupportPolicy`, `IdleStep`, `ActivitySpec`, `ActivityView`, `Affordance`, `Skin`, `ActivityResult`, `TalkEstimate`, `CoreItemSpec` (and `TutorialItem`, `ChoiceItem`, `StoryQuestionItem`, `TapAllItem`, `RailItem`) in `src/core/types.ts`. Overview: [ARCHITECTURE.md §7](../ARCHITECTURE.md#7-activities-as-state-machines-and-the-engine).

Stage 3 builds the protocol, `pick`, `rail` and `choose`, enough to play the FIRST_MINUTES warm-ups headless. The other machines come one per change from stage 6.

## 1. The machine contract

- **`voice(spec)`** lists every line any path can say for this spec, by path: naming, the prompt, listen-again or place of error, the model, each Help press, each idle step, praise, and the skin's lines (`help_tiles`, `battle_oops`, `timer_intro_*`, `its_this_one`…). A test drives every path and fails on any line said that isn't listed.
- **`needs(spec)`** is the union of the `LineMeta` needs of every line in `voice(spec)`, plus `mech:${mechanic}`. The director checks all of them before the beat, not just the happy path.
- **`estimate(spec, ctx)`** is pure: talk before the first action, the longest speech run and the whole length for a perfect child, from the naming and prompt utterances' `estMs`. The challenge report uses it; nothing runs the engine to find out.
- **`init(spec, ctx)`** returns the first `MachineStep`: `{ state, ops, then }`.
- **The engine runs `ops` in order** ([engine.md §2](engine.md#2-the-script-runner)). When they are finished, it follows `then`:
  - `{ resume: tag }` calls `machine.resume(state, tag)`;
  - `{ await: spec }` waits for the child;
  - `{ done: result }` ends the activity.
- **`act(s, aff)`** is called with an answer the engine accepted, or with `"help"` or `"replay"`.
- **`timer(s, id)`** is called with the machine's own timers and the engine's idle-ladder timers (`idle:0`, `idle:1`, …).
- **`replan(s, remaining)`** swaps the unstarted items (after `planner.adapt`).
- **`view(s)`** is a pure projection. Affordance ids are stable and content-derived: `pic:<word>`, `tile:<index>:<spelling>`, `slot:<i>`, `reader:kai`, `sound-btn:<i>`, `basket:<spelling>`, `lantern:<i>`, `option:<value>`, `rail:<i>`, `speed:slow`, `speed:fast`, `page:next`, `petal:<p>`, `sticker:<word>`, `stone:<episode>`, plus the fixed `help`, `replay`, `home` and `next`.
- **`oracle(s)`** gives the answer ids, the evidence and the choices, for simulated children and bots only.
- **Every method is total.** An input that makes no sense returns the state unchanged, with no ops and the same `then`.
- **Machines never measure time or count hints.** They emit `attempt` ops with an `AttemptDraft`, and the engine completes it (timing, support, `askedBy`, `uses`).
- **Machines are pure:** no `Date`, no `Math.random` (they use `ctx.rng`), no mutation of their input.

## 2. The teaching protocol

`protocol.ts` exports `protocolMachine<I>(id, parts: ProtocolParts<I>): ActivityMachine<ProtocolState<I>>`. Every mechanic except `run`, `story`, `choose` and `screen` is built with it. It implements docs/PEDAGOGY.md and Sounds~Write once, and docs/FIRST_MINUTES.md §3 for the warm-ups, through two `SupportPolicy`s:

| Field | `default` | `warm-up` (FIRST_MINUTES §3) |
|---|---|---|
| `phaseLines` | true: "Watch me first!", "Let's do it together!", "Now it's your turn!" | **false** (rule 3: Sensei's explanation is the I do; the first tap is the we do; the next is the you do) |
| `wedoGlowMs` | [0, 2000]: at once on the first we-do item, after 2 s on the second | **[2000]**: the one we-do item glows after 2 s |
| `idle` | 8 s: glow + ask again; 16 s: the paw points (the child still taps) | 8 s: glow + ask again; 16 s: **the paw taps it and play moves on** (rule 5) |
| `echoWrong` | false | **true**: the wrong card wobbles and plays its own word, held or stretched, then `fm_diff_<w>` |
| `help` | [repeat-prompt, glow, model] | the same (rule 7) |
| `earlyTap` | wiggle | **echo** (rule 4: a tap during naming says the card's name again, spotlit) |
| `eagerAnswers` | true | true (a tap during the question counts) |
| `requeueMissed` | true | **false** (rule 6: nothing is re-queued) |
| `namePictures` | true | true, with the whole `fm_name_<w>` recordings |
| `praiseEvery` | 1 | **3** (rule 8) |

Which one applies is the activity template's `support` field. Every other lesson could adopt a warm-up rule later by changing a default here, which is one line and one golden-transcript diff.

**Per item, in order:**

1. **Phase line** when `support.phaseLines` and the phase changes from the previous item:
   - `ido` "Watch me first!" (first I do item);
   - `wedo` "Let's do it together!" (first we-do item after an I do);
   - `youdo` "Now it's your turn!" (first you-do item after a scaffolded one).
2. **Naming.** `item.start` first (with the presented options). Then, for each of `parts.pictures(item)` not yet named in this beat (when `support.namePictures`):
   - say `fm_name_<w>` when that whole recording exists, otherwise `this_is_a` or `this_is_an` + word (a splice, which the `spliced-speech` audit lists), not interruptible, barrier, with a `name-card` cue on that picture at the same time;
   - tags: `word:W` mention.

   A tap on a card during naming is `obs.ignored("naming")`: with `earlyTap: "echo"` the card is spotlit and says its name again (an `echo` cue); with `"wiggle"` it wiggles. `exp.shown` follows when the item becomes answerable.
3. **I do.** Run `parts.demonstrate(item)` (the paw taps, Sensei says the sounds, and the `onRight` teaching follows), then emit `exp.modelled`. No answers are accepted. The engine logs taps as `obs.ignored("i-do")`. Then `item.end` (`modelled`).
4. **Prompt.** `parts.prompt(item, step, phase)`. The last prompt utterance is `interruptible` when `support.eagerAnswers` is on and the phase isn't I do. Then `then: await`, with `acceptEarly` equal to that and `askedBy` = that utterance.
5. **We do.** The k-th we-do item of the run: a `hint` cue (glow) on the answer after `wedoGlowMs[k]` (at once when 0; none past the list), through a machine timer, recorded as a hint `glow` by `phase`. After a "say it with me" line there is always a `sayItWithMeMs` (1.5 s) wait.
6. **You do.** `await.idle = support.idle`:

   | Time | Idle step | Hints |
   |---|---|---|
   | 8 s | the answer glows and the question is asked again | `idle-glow` (level 2) + `repeat-prompt` (level 1) |
   | 16 s, default | the paw points at the answer; the child still taps | `paw` (level 3) |
   | 16 s, warm-up | the paw taps the answer and play moves on | none: no attempt is logged; the item ends `modelled` and counts as a we do, not a miss |

   The engine logs each step as `obs.idle` and adds its hints to the awaiting record; the machine's `timer("idle:n")` returns the ops.
7. **Right answer.** In order:
   - `attempt` op (correct);
   - `cue right` on the target (barrier, capped at 1.1 s by the adapter: "tap, move, impact, then the word");
   - `parts.onRight(item, step)`: the reveal, "I can hear map", the spelling cast onto its line, the slow word then the word (warm-ups);
   - `praise` op, which the engine turns into a praise line (at most every `praiseEvery` right answers), the tier-up, or nothing;
   - the next step, or `item.end`.
8. **First miss.** In order:
   - `attempt` op (wrong, with errors and `confusedWith`);
   - `cue wrong` (a 400 ms wobble, never red);
   - with `echoWrong`: the wrong card's own word, held or stretched, then `fm_diff_<w>` ("Moon starts with a different sound.");
   - if the engine's streak was ≥ 3, the engine inserts "Keep going, ninja!" (`streak_lost`) here, before the correction, so the last thing heard before trying again is the target;
   - `parts.listenAgain(item, step, response)` ("Listen again." plus the prompt; not interruptible except for its last utterance, which re-asks);
   - `await` again, with `askedBy` = that utterance.
9. **Second miss.** In order:
   - `attempt` op;
   - `parts.model(item, step)`: dim every choice except the answer and one other (hint `reduced-choices`), glow the answer, then the model line as hint `told`: `its_this_one` ("It's this one! Say it as you put it here.") for building only; `fm_its_this` ("It's this one!") for picture games;
   - `await` the child's own tap on the answer (errorless: the child still does it).

   The outcome is `corrected`. If `support.requeueMissed`, the item is appended once to the queue as you do, at least 2 items later, with a `game.decision` by `protocol`.
10. **After the last step of a build item:**
    - `say_sounds_read` "Say the sounds… and read the word!";
    - the sounds, with `light: true` (the adapter lights each slot);
    - a 1.5 s pause;
    - the word;
    - a `word-done` cue.
11. **Done:** when the queue is empty → `then: { done: result }`.
    - **Ending on a success is the protocol's rule**, not the planner's: when an item was requeued, the round ends on the requeued copy, and if that copy isn't independent, one easier item the child already got right is added (a `game.decision`). The warm-ups don't requeue, and their fixed scripts end on Sensei's closing line.
    - Stars count only independent you-do items: independent / you-do ≥ 0.9 → 3; ≥ 0.7 → 2; otherwise 1. If there were no you-do items → 3. The warm-ups save stars silently.
    - `quit` when the child went home.

**Help** (`act(s, "help")`), one ladder for the whole game (FIRST_MINUTES rule 7):

| Press | Does | Hints | Level |
|---|---|---|---|
| 1 | the mechanic's strategy line first, if it has one (`parts.strategy`, e.g. `help_tiles`), then the question again | `strategy` (if said), `repeat-prompt` | 1 |
| 2 | the answer glows | `glow` | 2 |
| 3 | the paw shows it | `paw` | 3 |

Further presses repeat press 3. The engine logs `obs.help` with the hint given. Replay (`act(s, "replay")`, the speaker) says the prompt again: hint `replay` (level 0); `obs.replay`.

**Rules the protocol enforces, each with a test:**
- **Never segment for the speller.** While a build item has empty slots, no utterance from the protocol or the machine (prompt, listen-again, help, model) contains a `sounds` part, or a sequence of `sound` parts, making up the target word. It stretches and points instead.
- **The answer is never given before the second try** in you do (no `told`, `paw` or `givesAnswer` line), except by Help press 3 and the idle ladder's paw at 16 s. The paw makes the item `helped` (default) or `modelled` (warm-up), never independent.
- **Pictures are named before they are asked about**, once per beat.
- **An interruptible utterance is always the last op before an `await`.**
- **The round ends on an independent success whenever an item was requeued.**

## 3. The machines

| Machine | Items | Steps | Prompt (line ids) | First miss | Model | onRight | Replaces |
|---|---|---|---|---|---|---|---|
| `pick` | `OralItem`, `SymbolSearchItem`, `TutorialItem`, `ChoiceItem`, `TapAllItem`, placement rounds | 1 (tap-all: one per find) | warm-ups: the WARMUPS line (`fm_tap_<w>`, `fm_slow_listen` + stretch + `fm_which_pic`, `fm_tap_all_start` + sound). Oral: `listen_tap` + word / stretch / sounds; on the first item of a new presentation only, `listen_slow` or `listen_sounds` (a transition line, after its idea is explained). First sound: `first_q` + sound. Middle: `hunt_q` + sound. Symbol Search: `find_q` + sound (+ `like_in` + context word) | `listen_again` + the word stretched (+ the question's sound); warm-ups: the echo and `fm_diff_<w>` first | reduce to 2, glow, `fm_its_this` | oral: `i_can_hear` + word. First sound: word + `starts_with` + sound, then the reveal: `how_we_spell` + sound with `reveal-spelling` (tag `gpc:X` explain the first time, via the teach moment) | `usePickGame` (Early.tsx), Dojo Find, Placement rounds, Training |
| `rail` | `RailItem` | one per tap | the WARMUPS line (`fm_l2_turn`, `fm_tap_tortoise`, `fm_starfish_q`) | judged `order`: `fm_l2_start` and the arrow pulses from the left; judged `none`: none (only the pulsing thing is enabled) | the paw taps the next card | a `rail-light` cue and the card's word; after the last tap, `merge` and the pair line (`fm_pair_fish_dog`) | FIRST_MINUTES's `ReadingRail`, `SpeedButtons`, `CompoundMerge` |
| `build` | `WordBuildingItem`, `DictationItem` (word), `PolyItem` (spell) | one per slot | word building: the word stretched with `sweep-lines` (first slot only), then `first_sound_q` / `next_sound_q` / `last_sound_q` + stretch. Dictation (battle, boss, trial): `battle_spell` + word once, then slots with no re-prompt | `listen_here` + stretch, with the `point-slot` hint on the slot | reduce to 2, glow, `its_this_one` | `place-tile` cue + the slot's sound | Early `BuildOne`, Dojo `Build`, Battle |
| `read` | `WordReadingItem` (who read it right / pictures), `read-write-check` | taps on the sound buttons (exposures, not attempts), then 1 decision | `read_intro` (first time), `read_tap_sounds`; after all buttons are tapped, `read_who`, `kai_says` + reading A, `suki_says` + reading B | place of error: highlight the spelling, `if_it_was` + the foil + `this_would_be` + the foil's sound, then "Say the sounds…" with lights; re-await | `sayHere(p)` ("This is /a/. Say it here!"), re-sound, glow the right reader | sounds with lights + word | Early `ReadOne` |
| `swap` | `SoundSwapItem` | 2 per chain step | `swap_make` + the new word, then `swap_which` (step 2k); `swap_pick` (step 2k+1) | `what_changed` + both words stretched | glow the slot or spelling, `its_this_one` | the new word read with lights; Baron bonk cue | Swap.tsx |
| `sort` | `SoundSortItem`, `SpellingSortItem` | 1 | the word said. Sound sort: `help_sort`-style instruction, first time. Spelling sort: `whichSound(a, b)` | the word stretched, and the spelling lit | glow the basket, `its_this_one` | the word read with its spelling lit; `fly` into the basket | Sort.tsx |
| `story` | `ReadingInTextItem` pages, `StoryQuestionItem` | per page | narration pages: story parts (not interruptible). Read pages: `story_your_turn`, then the child reads (word taps are `obs.help`, with the word said as hint `told` for that word). Choice pages: `story_choose` → `obs.choice`. Question pages: `story_question` → one attempt (reading-in-text, picture check) | the question again | glow | `story_end` at the end | Story.tsx |
| `run` | `WordReadingItem` in timed review | 1 per lantern wave | blend: `run_blend` + sounds. Read: the word on the banner + `run_read` | – (a timed encounter: a wrong lantern is an attempt, and the next wave comes) | – | the word, with lights, rising from the lantern | Run.tsx (the physics stays there) |
| `choose` | `ChoiceSpec` | 1 | the question, then each option's label while it is spotlit | – | – | the option's `say` | Choose (App.tsx), the opt-in (FIRST_MINUTES §4), rest offers |
| `screen` | a screen (World Flower, Sticker Book, map) | child-driven | none: the child explores | – | – | per tap: that thing's moment (teach.ts `introPetal`, `introGem`, `sameSound`; a sticker says itself fast then slow; the Intros.tsx first-visit lines) | Tree.tsx's and Intros.tsx's speech orchestration (the drawing stays) |

Notes on individual machines:
- **`pick`: presentation lines.** `listen_slow` and `listen_sounds` stop being said on every item. The explanation comes from the director once (and at spaced repeats), and the machine says the transition line only when the presentation changes.
- **`pick`: tap all.** `await.answers` is every card; the targets not yet found are right, the others wrong. Each find is a correct attempt, with the held first sound and a `pocket` cue. Each wrong tap is a wrong attempt (with the echo). After two misses, the targets left glow with `fm_look_this` + the sound (hint `glow`, level 2). Done when every target is found: `fm_found_both` or `fm_found_all` + the sound. With `spell`, Reception's version writes the sound's spelling on the card's first line after each find (`how_we_spell`).
- **`rail`.** Only the next card (or button) in order is enabled when judged `none`, so those taps have `choices` 1: they are logged and never scored. Judged `order`, every card is enabled, and each tap is an attempt on `pa:left-to-right` with `choices` = cards left. `by: "sensei"` is an I do: the paw taps along with `rail-light` cues, then `exp.modelled`.
- **`build`: tiles.** The bank shows `bank` (Lesson 1/5: the word's own spellings, jumbled) or `bank + distractors`. A tile already placed becomes `used`. `choices` on each slot's attempt is the tiles left in the bank, so the last slot of a no-distractor word is `choices` 1 (a forced tap: never evidence) and the one before is 2 (down-weighted for elimination; [learner.md §2](learner.md#2-the-update-for-one-attempt)). `item.start.options` records the whole bank.
- **`read`: sound buttons.** Tapping them is an exposure (`sound:p` mention, and the adapter plays the sound). Tapping a reader before every button has been tapped is `obs.ignored("busy")` with a hint to tap the sounds; that is the mechanic being taught.
- **`run`.** Each wave is an encounter. `view.incoming` gives each lantern's `dueT` (from the skin's speed), and the UI animates it towards the ninja. A tap on a lantern before its deadline timer is an answer. If every lantern passes, the attempt is `{ none: "timeout" }` with `timed: true`. There is no fail state: the run continues.
- **`choose`.** Every tap echoes its label; with `settleMs`, the last tap wins once the settling ring fills. Silence picks `silence.value` and says `silence.say`. The choice logs `obs.choice` and the matching `profile.change` (hero; school year and band), then `done`. There is no right or wrong answer.
- **`screen`.** The screens the child drives (the World Flower, the Sticker Book, the map) are machines too, so everything they say goes through the same tags, dosage and log as a beat. Before each moment, the machine calls `ctx.explainFirst(needs)`, the director's `resolve` and `reinforce` as utterances: a gem ring shown before `obj:gem` is explained gets its explanation first, and the second visit in a session doesn't repeat what the dosage says is enough. Its screens carry `needs` (the gem ring needs `obj:gem`; energy needs `idea:gems-fill-with-practice`), which `used-before-explained` checks.

## 4. Error classification

`errors.ts`: a pure function per machine of (item, step, response) → `ErrorType[]` and `confusedWith`. It uses sw.ts `ErrorType` names, so corrections can use `TEACHING_THROUGH_ERRORS`.

| Machine | Condition | ErrorType |
|---|---|---|
| build | the chosen spelling is a taught spelling of the *same* sound | `valid-alternative-spelling` |
| build | the chosen spelling is a taught spelling of a *different* sound | `wrong-sound-heard` |
| build | the chosen spelling is not in `taughtCode` (should not happen: the bank constraint) | `untaught-spelling-in-writing` |
| read | the chosen reading differs at position k by substitution | `misread-sound` |
| read | the chosen reading has an extra sound | `added-sound` |
| read | the chosen reading lacks a sound | `omitted-sound` |
| read (EC) | the spelling was read with its other taught sound | `alternative-sound` |
| swap step 2k | the wrong position | `swap-wrong-position` |
| swap step 2k+1 | the wrong spelling | `wrong-sound-heard` |
| sort (sound) | the wrong basket | `wrong-spelling` |
| sort (spelling, Lesson 10) | the other sound | `alternative-sound` |
| pick oral, rail | – (game-only; no Teaching Through Errors type) | – |

`confusedWith` is the chosen spelling's GPC or sound, and feeds `learner.confusions`.

## 5. Skins

Pedagogy never lives in a skin. A skin changes presentation, timers and hit points, through small hooks the protocol calls after each attempt (`skins.ts`). Every line a skin can say is in its machine's `voice`.

| Skin | Effect |
|---|---|
| `plain`, `dojo` | none |
| `battle` | each correct slot: `monster hit` cue, hp − 1; a finished word: the finisher. Timer, when set: `battle_charge` and a monster jump on timeout (an attempt `timeout`). Out of hero hearts (trial only): `battle_oops`, then support switches to we do for the rest of the block (logged as a `game.decision`) |
| `boss` | like battle, with more hp, and it is the land's Progress Check |
| `trial` | a timer bar per word (`timer_intro_1`–`3` the first time, needing `mech:timer-bar`; the bar is on screen with that need too); win → `trial_win` + `gem` reward; fail → `trial_fail` |
| `run` | lanterns and speed; deadlines per wave |
| `swap-fix` | Baron's reactions (`baron` cues) as words are fixed |

## 6. The pick machine in full

| State | Input | Next state | Ops | Events |
|---|---|---|---|---|
| intro | init | naming, or prompting if all its pictures are named | the phase line, if `phaseLines` and the phase changed | – |
| naming | resume `named` | prompting | per unnamed picture: `name-card` + `fm_name_<w>` (or "This is a…" + word) | `item.start`, `exp.said` and `exp.cue` on each |
| naming | a tap on a card | naming | warm-up: `echo`; default: the engine wiggles it | `obs.ignored("naming")` |
| prompting (I do) | resume `prompted` | right | `parts.demonstrate`: paw cue, `wait` 1.1 s | `exp.modelled` |
| prompting | resume `prompted` | awaiting | we do: the glow at `wedoGlowMs[k]` (a timer, or at once) | `exp.shown` |
| prompting | engine: an eager tap on the answer during the interruptible prompt | right | (the engine hushes) | `obs.attempt` early |
| prompting | a tap on a non-answer | prompting | – (the engine wiggles it) | `obs.ignored` |
| awaiting | act(answer) | right, or awaiting (tap all, targets left) | `attempt`, `cue right`, `onRight`, `praise`; tap all: `pocket` | `obs.attempt` |
| awaiting | act(other), first miss | awaiting | `attempt`, `cue wrong`, the echo (warm-up), `listenAgain` | `obs.attempt` (errors) |
| awaiting | act(other), second miss | awaiting-model | `attempt`, `model` (tap all: the targets left glow) | `obs.attempt`; the requeue `game.decision` when `requeueMissed` |
| awaiting-model | act(answer) | right | `cue right`, `onRight` (no praise, no streak) | `obs.attempt` (attemptNo 3, `told`) |
| awaiting | timer `idle:n` | awaiting, or right (warm-up paw taps it) | glow + ask again / the paw | `obs.idle` |
| awaiting | act(help) | awaiting | the Help step for this press | `obs.help` |
| awaiting | act(replay) | awaiting | the prompt again | `obs.replay` |
| right | resume `praised` | the next item's intro, or done | – | `item.end`; on done: the result |

## 7. Tests (`src/core/activities/*.test.ts`)

Table-driven: given a spec and an input sequence, check the op kinds, the line ids in the utterances, the attempt drafts, the view, and `then`. A `drive(machine, spec, inputs)` helper stands in for the engine, acking every barrier at once.

1. **Perfect run, default support,** of a pick block (1 I do, 2 we do, 3 you do): the phase lines appear exactly at the phase changes; every picture is named once, before it is asked about; the I do produces `exp.modelled` and no attempt.
2. **Perfect run, warm-up support,** of FIRST_MINUTES W1's first tap and slow words: no `ido`/`wedo`/`youdo` lines; the we-do answer glows 2 s after the prompt ends, not at once; a tap during naming echoes the card's name.
3. **One error, then right:** listen-again (with the echo and `fm_diff_<w>` under warm-up support), then an independent retry that is `corrected` (not independent), and the item is not requeued.
4. **Two errors, default:** reduce to 2, `fm_its_this` (pick) or `its_this_one` (build), the child taps the answer, and the item is requeued once as you do at least 2 items later. The last item of the block is then an independent success (with a perfect child after the error). **Warm-up:** the same, with no requeue.
5. **Slow child, default:** no answer for 30 s gives exactly two idle steps: at 8 s (hints `idle-glow` and `repeat-prompt`) and at 16 s (`paw`). The answer after the glow is `helped` at level 2; after the paw, `helped` at level 3. **Warm-up:** at 16 s the paw taps it, no attempt is logged, and the item ends `modelled`.
6. **Help pressed 3 times:** hints `repeat-prompt`, `glow` and `paw`, with levels 1, 2 and 3. For a build item (a mechanic with a strategy line), press 1 gives `strategy` (`help_tiles`) then `repeat-prompt`, both level 1.
7. **Jonas's example, driven** (ARCHITECTURE.md §3.2): dictation of *mat*, slot 1, bank m a t i s with < m > placed. The prompt, Help (the question again), Help (the glow), then < i > after 3 s → an attempt with hints [repeat-prompt, glow], level 2, `choices` 4, `answerPosition` and `askedBy` set. The same inputs ending on < a > → outcome `helped`, evidence `helped: true`.
8. **Voice is complete** (per machine, both policies): driving every path (perfect, one error, two errors, silent 30 s, Help ×3, replay, an eager tap, a tap during naming, each skin hook) says only lines listed in `voice(spec)`, and `needs(spec)` contains the needs of every one of them.
9. **Eager tap during the prompt:** accepted as correct, with `early` true and a negative latency (engine test). A tap during naming → `obs.ignored("naming")` and no attempt.
10. **Never segment for the speller** (property, over every build item generated for IC1–IC11): no utterance before the last slot is filled contains the target's sounds in order.
11. **Answer not given early** (property): in you do, no `told`, `paw` or `givesAnswer` utterance before attemptNo 2, except Help press 3 and the idle paw.
12. **Totality** (property, 10,000 random inputs per machine): no throw; unknown affordances leave the state unchanged; `done` happens exactly once.
13. **Stars** count only independent you-do items: 6 of 6 independent → 3 stars; the same run with one answer after the idle glow → 5/6 → 2 stars (today's `usePickGame` would give 3).
14. **Forced tiles:** in a Lesson 1 build of *mat* with no distractors, the slot-2 attempt has `choices` 1 and the slot-1 attempt `choices` 2.
15. **Tap all:** sock and sausage among four: each find is a correct attempt with a `pocket` cue; moon is a wrong attempt with the echo and `fm_diff_moon`; after a second miss the targets left glow with `fm_look_this`; done after both finds with `fm_found_both`.
16. **Rail:** judged `order`, tapping dog before fish → a wrong attempt on `pa:left-to-right` and `fm_l2_start`; `by: "sensei"` → `exp.modelled` and no attempts; judged `none` → attempts with `choices` 1.
17. **`estimate`:** for every machine and fixture spec, `talkBeforeActionMs` is within 10% of what the engine measures for a perfect child (a `scripts/sim` test).
18. **`screen`:** opening the flower on a petal whose `introPetal` the ledger says is owed gives the full form first; a second visit in the same session gives at most `maxPerSession`; a gem ring on screen before `obj:gem` is explained is reported by `used-before-explained`.
19. **Error classification:** one test per row of the table in §4.
20. **`build` onRight:** after the last slot, `say_sounds_read`, then the sounds with `light`, a pause, then the word, in that order.
21. **`read`:** tapping a reader before every sound button → `obs.ignored("busy")` and the tap-the-sounds hint; a wrong reader at position 1 → the place-of-error script names the foil and its sound.
22. **`swap`:** insert and delete chains (from `swapBetween`) produce two attempts per step; a wrong position → `swap-wrong-position`.
23. **`run`:** a wave whose lanterns all pass gives an attempt `{ none: "timeout" }` with `timed: true`, and the run continues.
24. **`choose`:** the opt-in emits `obs.choice` and `profile.change school-year` and `band`; with taps on teddy then school within 1.5 s, school wins; 20 s of silence on screen A chooses "none" and says `fm_opt_default_home`.
25. **Views:** a snapshot of `view()` at each state of test 1 (affordance ids, marks, `accepting`, `progress`).
26. **Oracle:** for every state that awaits, `oracle().answers` contains exactly the answers `check` accepts.
