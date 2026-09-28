# The learner model: what the child can do

Module: `src/core/learner/`. Types: `LearnerState`, `KcState`, `LearnerConfig`, `LearnerApi`, `Grade`, `KcStatus` in `src/core/types.ts`. Overview: [ARCHITECTURE.md §4.1](../ARCHITECTURE.md#41-learner). Built in stage 2 (v1: §2, §3, §4, the guessing detector and §6); the other detectors follow once real attempts exist.

A pure reducer over the log, plus pure queries. `apply(s, e)` never mutates `s`, and returns `s` itself for events it ignores. What the child has been *told* is the ledger's job ([ledger.md](ledger.md)), not this module's.

Three rules keep the model honest:
- **Exposure is not evidence.** Hearing a word, a sound or an explanation moves counters. Only answers move beliefs, apart from one small learning step per KC per session from a full explanation or demonstration.
- **Learned is not retrievable.** `pL` (learned) never decays. Forgetting is `recall`, measured only from the last scored retrieval.
- **A tap the child can't get wrong is not evidence.** Forced taps are logged and ignored.

## 1. What it folds

| Event | Effect |
|---|---|
| `session.start` | `child.ageBand` = the event's `ageBand`; `totals.sessions++`; add the local day to `totals.days` if new; `affect` session counters reset; every `confusions` value × `confusionDecayPerSession` (0.8) |
| `profile.change school-year` / `band` | `child`; priors (§6) |
| `profile.change placed` | priors up to the unit (§6); `frontier` = the unit |
| `profile.change legacy-import` | priors from the Save counters (§6) |
| `exp.said` (completed) | per tag, by the mapping below: `exposures++`, `firstExposed ??= t`; `explain` → `explained++`. **Never evidence.** A learning step only as below. |
| `exp.modelled` | per `demonstrate` tag's KCs: `modelled++`; a learning step as below |
| `obs.attempt` | ignored when `origin: "shadow"`. Otherwise: the update in §2 (child phases only); `words`; `latency` (§3); detectors (§5); `evidence` += `toEvidence(a)` (capped at `evidenceCap` = 30 per GPC and direction); `sw = rollUp(evidence)` for the touched units; `totals.attempts++` |
| `obs.ignored` | `affect.strayTapsThisSession++`; a tap during I do or while busy also counts as a failed you-do opportunity for `mech:${mechanic}` with weight 0.3 (the child doesn't know when to act yet) |
| `item.end` | `totals.items++` |
| `game.progress unit-started` / `unit-passed` | `units[u]`; `frontier` |
| everything else | unchanged (returns `s`) |

**Which tags reach which KCs:**

| Tag | KCs | Learning step |
|---|---|---|
| `explain` on `gpc:X` (a teach moment, or the first-sound reveal that shows the spelling with its sound) | `gpc:X:read`, `gpc:X:spell` | `pT.explained`, at most once per KC per session |
| `explain` on `sound:p` (intro-petal) | `sound:p:hear` | `pT.explained`, at most once per KC per session |
| `explain` on `idea:`, `concept:` keys with a KC (`concept:3`) | that KC | `pT.explained`, at most once per KC per session |
| `demonstrate` (exp.modelled) | the item's target KCs and `mech:M` | `pT.modelled`, at most once per KC per session (shared with explained) |
| `mention`, `show`, `ask`, `model`, `remind` on any key | counters only: `word:W` → `words[W].heard`; `sound:p` → `sound:p:hear.exposures`; a shown `gpc:X` → both directions' `exposures` | none |

Spoken words never reach `word:W:read`, and a spoken sound or mention never reaches `gpc:X:read` or `:spell`. Only a shown spelling with its sound, or a teach moment, touches a GPC's counters. `exposureStepSession` enforces the once-per-session cap.

## 2. The update for one attempt

**Skipped** (logged, never scored: no BKT update, no Sounds~Write evidence, no grade, no memory change):
- `choices ≤ 1`: a forced tap (the last tile of a bank with no distractors; a guided tap on the one pulsing button);
- `origin: "shadow"`.

For each `EvidenceRef` in `a.evidence`, with the KC's family parameters `bkt[family]`:

```
p     = pL(kc)                                                 // learned; forgetting is kept apart (§4)
g     = choices > 0 ? max(guessFloor, 1 / choices) : guessFloor   // free response (no options): guessFloor
s     = slip + (family ≠ mech ? mechanicSlip × (1 − pKnown(mech KC of the attempt, t)) : 0)
post  = correct ? p(1−s) / (p(1−s) + (1−p)g)                    // standard BKT posterior
                : p·s / (p·s + (1−p)(1−g))
w     = weight(a)                                              // table below; 0 means no update
share = credit(a, ref)                                         // below
p'    = p + w × share × (post − p)
p''   = p' + (1 − p') × pT[opportunity]                         // you-do, we-do, or corrected when wrong
KcState.pL = p'';  tUpdated = t
```

**Weights** (`LearnerConfig.weight`):

| Situation | w |
|---|---|
| phase i-do (should not occur: I do produces no attempts) | 0 |
| phase we-do | 0.2 |
| you do, `attemptNo` 1, correct, help level 0 | 1.0 |
| you do, correct, help level 1 / 2 / 3 | 0.6 / 0.25 / 0 |
| wrong, any help level (getting it wrong *with* help is strong evidence) | 1.0 |
| `attemptNo` ≥ 2: correct / wrong | 0.3 / 0.6 |
| a bank slot with 2 tiles left (elimination helps) | × `eliminationFactor` 0.5 |
| correct and (`early`, or latency < `rapidMs` 800 ms) with ≥ 2 choices | × 0.5 |
| the guessing detector is on (`affect.guessing` ≥ 0.5) | × 0.3 |
| timeout (`response.none = "timeout"`) | treated as wrong, w 0.6 |

**Credit (`share`):**
- Correct: target refs get 1.0 and components get `componentCreditOnCorrect` (0.3).
- Wrong, with a known error position (spelling slots; reading contrast positions; `target.slot` set): the target ref gets `targetShareWhenLocated` (0.8). The remaining 0.2 is split across component refs in proportion to (1 − pKnown).
- Wrong, with no known position: every ref's share is proportional to (1 − pKnown), normalised to sum to 1, with the target's weight doubled.
- `context` refs are never updated.

**Learning step (`pT`):** you-do 0.10; we-do 0.06; a wrong answer followed by the protocol's correction 0.08 (the "corrected" opportunity; the protocol always corrects, so every wrong child attempt uses it). Exposure steps are in §1.

**Memory** (only for target refs of **scored retrievals**: phase you-do, `attemptNo` 1, `choices` ≥ 2, `grade(a)` not null). Component refs, we do and exposures never touch it.

```
g = grade(a)                                     // §3
if g ≥ 2 and tLastSuccess is undefined:          // the first unaided success starts the clock
    halfLifeH = source was "assumed" ? assumedHalfLifeH : initialHalfLifeH (24)
elif tLastRetrieval defined and (t − tLastRetrieval) / 1h < minGapH (4):   // massed: no change to the half-life
    pass
elif tLastSuccess defined:
    r = recall(kc, t)                            // before this answer
    if g ≥ 1: halfLifeH = clamp(h × factor[g] × (1 + lowRecallBonus × (1 − r)), minHalfLifeH, maxHalfLifeH)
    else:     halfLifeH = max(minHalfLifeH, h × factor[0]); if status was "secure": lapses++
tLastRetrieval = t;  lastGrade = g;  if g ≥ 2: tLastSuccess = t
```

`factor = { 0: 0.5, 1: 1.2, 2: 1.8, 3: 2.5 }`, `lowRecallBonus = 1.0`, `minHalfLifeH = 1`, `maxHalfLifeH = 4320` (180 days), `assumedHalfLifeH = 720` (30 days).

**Counters:**
- `opportunities++` for scored retrievals.
- `independent++` when correct at help level ≤ 1 on the first try.
- `recent` is the last 10 grades.
- `sessions` counts distinct `sid`s with scored evidence.
- `fluencyMs` is an EWMA (α = 0.3) of latency on independent successes.

**Confusions:** on a wrong spell or read attempt with `confusedWith.gpc`, `confusions["${dir}:${targetSpelling}>${gotSpelling}"] += 1`. For example, "spell:a>i".

## 3. Grades and latency

```
grade(a) = null  if phase ≠ you-do, or choices ≤ 1
         = 0     if wrong or timeout
         = 1     if attemptNo > 1, or help level ≥ 2
         = 2     if help level = 1, or early with choices ≤ 2, or latency > median + slowMads × MAD (this child, this mechanic)
         = 3     otherwise
```

- `slowMads` is 2.
- The median and MAD come from `latency[mechanic]`, updated on every child you-do attempt, correct or not (the last 20 latencies, excluding early answers).
- Until n ≥ 5, a population default is used: median 3,000 ms, MAD 1,000 ms.

**Jonas's example.** "3 s staring" is judged against *this* child: 3 s is slow for a child whose median is 1.2 s, and fast for one whose median is 4 s.

## 4. Queries

- **`recall(s, kc, now)`** = 2^(−(now − tLastRetrieval) / halfLifeH) once the KC has had an unaided success (`tLastSuccess` set), else `null`.
- **`pKnown(s, kc, now)`** = `pL` while recall is null (never retrieved unaided, and every assumed prior until evidence arrives: school-taught code doesn't decay below its prior); otherwise `pL × (rFloor + (1 − rFloor) × recall)`, with `rFloor` 0.5. An unknown KC returns its family's `pL0`, or its prior (§6).
  - Worked numbers: pL 0.8, h 24 h, 72 h since the last retrieval → recall 2^−3 = 0.125 → pKnown = 0.8 × (0.5 + 0.5 × 0.125) = **0.45**. The same KC with h 90 h → recall 2^(−0.8) = 0.574 → pKnown = 0.8 × 0.787 = **0.63**. A Reception prior of 0.6 after a week away: still **0.6**.
- **`predict(s, refs, choices, now)`**:
  - P_know = Π_targets pKnown × Π_components pKnown^0.5;
  - P = c + (1 − c) × P_know × (1 − slip), with c = 1/choices (or the guess floor).
  - The planner handles phases and adds difficulty offsets ([planner.md §7](planner.md#7-predict)).
- **`status(s, kc, now)`**, first match wins:

  | Status | When |
  |---|---|
  | `unseen` | no exposures and no attempts |
  | `exposed` | exposures but no you-do attempt |
  | `fading` | was secure, and recall now < `desiredRetention` |
  | `secure` | Sounds~Write windowed proficiency ≥ 0.8, pKnown ≥ `secure.pKnown` (0.8), and sessions ≥ `secure.minSessions` (2) |
  | `move-on` | windowed ≥ 0.75 |
  | `learning` | otherwise |

- **`toEvidence(a, t)`** returns [] for game-only activities (`SW_ACTIVITIES[a].gameOnly`, and every `GameOnlyActivity`), for forced taps (`choices ≤ 1`) and for shadow attempts. Otherwise it returns one `Evidence` per target GPC ref:
  - `{ t, activity, skill, direction }` from `SW_ACTIVITIES`;
  - `gpc` and `gpcs` from the item;
  - `word`, `structure` and `unit` = `curriculum.firstTaught(gpc)` (or the item's unit for the structure units IC8–10);
  - `correct`;
  - `firstTry: attemptNo === 1 && correct`;
  - `helped: level ≥ 2`;
  - `errors`, `phase` and `ms: latencyMs`.
- **`canMoveOn(s, unit)`** is sw.ts `canMoveOn(s.sw, unit)`, unchanged.
- **`facet(s, unit, facet)`** reads `s.sw.unit[unit][facet].status`.
- **`energy(s, gpc, now)`** = (the share of the last 8 `gpc:X:spell` grades that are ≥ 2) × min(1, opportunities / 8). A gem is ready when `sw.gpc[X].spell` is at least move-on and 3 dictation-safe trial words exist (the planner checks the words). This replaces `Save.energy` and `charge()`.

## 5. Detectors (behaviour, not knowledge)

These are pure functions over `affect.recent`: the last `window` = 10 child you-do attempts with ≥ 2 choices. They are recomputed on each attempt. **v1 ships the guessing detector**; the others follow once real logs exist to check them against.

| Detector | Value | Effect elsewhere |
|---|---|---|
| guessing (v1) | 1 if ≥ 50% of the window is rapid (< 800 ms) or early **and** accuracy ≤ mean chance (1/choices) + 0.15; else decays × 0.7 per attempt | evidence × 0.3; the planner drops to 2 choices and brings the I do back; the protocol turns off eager answers |
| position bias | `{ position, share }` if ≥ 80% of taps over ≥ 8 attempts land on one screen position (`response.screenPosition`), while the answers were at that position (`target.answerPosition`) ≤ 60% of the time | the same remodel; the planner places answers away from that position |
| fatigue | 1 if active time ≥ the age's session budget; 0.7 if the median latency of the last 5 ≥ 1.15 × the first 5 of the session and accuracy has dropped ≥ 0.25; else 0 | the director offers a rest after the next success |
| frustration | 1 if ≥ 3 errors in the last 5, or ≥ 3 Help presses in the last 3 items | the planner eases off (an easy win, a known mechanic) |
| boredom | 1 if ≥ 95% independent across the window **and** median latency < 0.6 × this child's baseline | fewer scaffolds, one more choice; jump ahead considered |

`errorsInRow` and `firstTriesInRow` are kept too.

## 6. Priors

- **School year and band** (FIRST_MINUTES §4). The expected unit comes from the band and the date, half a term behind the official pace: Reception IC1–7 in the autumn, IC8–11 in the spring, BR in the summer; Year One EC1–26; Year Two EC27–49.
  - KCs of units ≥ 2 before the expected unit get pL `priors.wellBefore` (0.6), `source: "assumed"`. Units up to the expected unit get `priors.upToExpected` (0.4).
  - Band `none` (not yet, not sure, silent) sets nothing: the child is on the warm-ups.
  - The check (FIRST_MINUTES §10) that drops a band emits `profile.change band`; priors above the new expected unit go back to `pL0` unless observed.
- **Placed:** every GPC KC up to the unit gets pL = max(current, `priors.placed` 0.6), assumed.
- **Legacy import:** for each `read` or `spell` counter in today's `Save`, pL = clamp((ok + 1) / (n + 2), 0.2, 0.8), assumed. The Save's stars, gems, petals, stickers and `placedAt` go to the reward state, not here.
- An assumed KC becomes `observed` on its first child attempt, and from then on is updated normally. Assumed priors never create Sounds~Write evidence and never decay (§4).

## 7. Default parameters (`config/defaults.ts`)

| Family | pL0 | slip | guessFloor | pT you-do / we-do / corrected / explained / modelled |
|---|---|---|---|---|
| gpc-read, gpc-spell | 0.10 | 0.10 | 0.05 | 0.10 / 0.06 / 0.08 / 0.02 / 0.03 |
| skill | 0.20 | 0.10 | 0.05 | 0.08 / 0.05 / 0.06 / 0.02 / 0.03 |
| pa, sound | 0.30 | 0.10 | 0.10 | 0.12 / 0.08 / 0.08 / 0.03 / 0.04 |
| word | 0.15 | 0.10 | 0.05 | 0.10 / 0.06 / 0.08 / – / 0.03 |
| special | 0.10 | 0.10 | 0.05 | 0.15 / 0.10 / 0.10 / 0.05 / 0.05 |
| concept | 0.10 | 0.10 | 0.10 | 0.08 / 0.05 / 0.06 / 0.04 / 0.04 |
| mech | 0.30 | 0.05 | 0.10 | 0.30 / 0.20 / 0.20 / 0.05 / 0.25 |

`pT.exposure` is 0 for every family: mentions never teach.

The other constants are as in §§2–5: `mechanicSlip` 0.2; `eliminationFactor` 0.5; `rapidMs` 800; `rapidFactor` 0.5; `guessingFactor` 0.3; `targetShareWhenLocated` 0.8; `componentCreditOnCorrect` 0.3; memory: initial half-life 24 h, assumed half-life 720 h, factors 0.5/1.2/1.8/2.5, `lowRecallBonus` 1.0, `minGapH` 4, `rFloor` 0.5, `desiredRetention` 0.8; `slowMads` 2; `secure` 0.8 over 2 sessions; `evidenceCap` 30; `confusionDecayPerSession` 0.8. `mastery` is sw.ts `MASTERY_CONFIG`. These are hand-set starting points. Later they are fitted by EM on exported real logs, per family, with guess ≤ 0.5 and slip ≤ 0.2 so BKT stays identifiable (`scripts/sim/fit.ts`, after stage 8).

## 8. Tests (`src/core/learner/*.test.ts`)

1. **Jonas's example.** The attempt in ARCHITECTURE.md §3.2, with pL(`gpc:a>a:spell`) = 0.55 and pKnown(`mech:tile-to-line`) = 0.9 before it:
   - pL afterwards = 0.30 ± 0.01;
   - `confusions["spell:a>i"]` rises by 1;
   - `toEvidence` gives `{ correct: false, firstTry: false, helped: true, phase: "you-do" }`;
   - grade 0;
   - `skill:segmenting:CVC` and `mech:tile-to-line` share 0.2 of the blame, in proportion to (1 − pKnown).
2. **The same attempt, correct** at help level 2 (Help pressed twice: the prompt again, then the glow): the change in pL is ≤ 0.25 × the change for the unaided case; grade 1; `evidence.helped` true; `independent` unchanged.
3. **Choices matter.** From p 0.55, one correct unaided answer gives a posterior of about 0.69 (2 choices), 0.77 (3), 0.81 (4) and above 0.9 (free response), strictly increasing.
4. **Forced taps are not evidence.** A correct tap with `choices` 1 leaves pL, `evidence`, `sw`, `opportunities`, `recent` and the half-life unchanged. A correct tap on a bank slot with 2 tiles left moves pL half as much as one with 3.
5. **Exposures are never evidence.** Any number of `exp.said` explanations leave `evidence`, `sw`, `opportunities` and `recent` unchanged. Three explanations of `gpc:ai>ae` in one session raise pL by exactly one `pT.explained` step.
6. **Talk never teaches reading.** 100 naming utterances ("This is a pan.") leave pKnown(`word:pan:read`) at its prior, and only `words.pan.heard` changes.
7. We do and I do: a we-do attempt moves pL by at most 0.2 × the unaided change; I do produces no attempt; phase is never scored in `sw`.
8. **Mechanic-aware slip:** the same wrong answer lowers the GPC less when pKnown(mech) is 0.3 than when it is 0.95.
9. **Rapid correct answers** with 2 choices move pL half as much as the same answer at 2 s.
10. **The recall clock.** recall is null before the first unaided success. After it, recall is 0.5 at one half-life from the last scored retrieval. Exposures, we-do answers and component references (the other GPCs of a word being read) don't reset it. pL never decays; pKnown falls to no less than 0.5 × pL.
11. **Worked forgetting:** the §4 numbers exactly (0.45, 0.63, and an assumed 0.6 unchanged after 7 days).
12. **Memory: massed practice.** Ten correct answers within 10 minutes leave `halfLifeH` unchanged after the first; four correct answers on four days give a half-life more than 3× larger.
13. **Memory: spacing.** A success at recall 0.5 grows the half-life more than a success at recall 0.9, and a failure halves it.
14. **Grades are relative to the child.** The same 3 s answer grades 2 for a child whose median is 1.2 s (MAD 0.5) and 3 for one whose median is 4 s.
15. **The Sounds~Write bridge.** After 10 independent you-do first tries per facet of IC1, `canMoveOn(IC1).ok` is true. Game-only activities never add evidence. In the Extended Code, spelling goes on the watch list and never blocks.
16. **Shadow attempts** (`origin: "shadow"`) change nothing.
17. **The guessing detector, with the ten `jev-tutor.ts` archetypes** as seeded fixtures (secure, guesser, left_bias, o_confusion, fatigue, struggling, too_easy, improving, frustrated, new_p): guesser is flagged within 10 attempts; secure and too_easy are not; o_confusion appears as a confusion entry, not as guessing. (The other detectors get the same fixtures when they land: left_bias, using `answerPosition`; fatigue.)
18. **Priors:** Reception declared in March: the expected unit is IC5 (FIRST_MINUTES §4's start), so IC1–IC3 KCs are assumed at 0.6 and IC4–IC5 at 0.4. Three real wrong answers on `gpc:m>m:read` turn it `observed` with pKnown < 0.4.
19. **Purity:** `apply` never mutates (deep-freeze the input); unknown events return the same object; `fold(all) == fold(tail, fold(head))` for every split point.
20. **Energy:** 8 grades ≥ 2 give 1.0; only helped grades give < 0.3.


## Foundation skills (27 September 2026)

`foundations` is shared by `LearnerState` and the per-child browser `Save`. The pure reducer and queries live in `src/core/learner/foundations.ts`; `Attempt.foundations` carries explicit observations through replay. `recordFoundation` is the current React adapter. Older saves begin with unknown skills; legacy aggregate word/GPC counters are not converted into invented direct assessments.

- Directionality: `start-left`, `track-order`, `return-sweep` (next line). Each is independent.
- Joining: slow and fast, each with separate recognition and spoken-production records.
- Letters: visual recognition plus a map of specific sounds. Each pair separately records letter→spoken sound and spoken sound→letter. Case and digraphs remain distinct. `alphabetKnowledge()` returns all 26 lower-case letters, including unseen ones. `hasSecureSoundBothWays` requires at least one *same* sound to be secure in both directions.

Every record retains practice, correct/incorrect assessments, independent attempts, a bounded recent accuracy window, and successful sessions. Secure means at least five recent independent attempts, at least 80% correct, across two successful sessions. This foundation status is a conservative observational summary, separate from the existing BKT/forgetting estimate; it does not itself unlock Sounds~Write units.

The browser records sound→letter choices in Ninja Eyes and Dojo, ordering evidence in the rail activities, joining recognition in listening activities, and unassessed speaking practice in guided fast/slow and letter turns. Glows, pointing, retries, forced taps and automated answers cannot establish independent mastery. Visual-only letter recognition, return-sweep and actual spoken production remain unknown until explicitly assessed; there is no speech recogniser or adult scoring UI in these scenes. `adult-observed`/`speech-assessed` observations can update production, while a playback tap cannot.

Encouragement now defaults to each eligible correct answer (warm-ups: first, then every other answer), still yielding to streak/closing feedback. Existing recorded prompts invite the child to say sounds/words on the first and every third relevant interaction, with 1.2 seconds left for their voice. Word-building read-back explicitly asks them to say the whole word.
