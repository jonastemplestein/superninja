# The planner: what to practise, and when

Module: `src/core/planner/`. Types: `PlannerApi`, `PlannerContext`, `BlockRequest`, `Block`, `PlannedItem`, `Scaffold`, `PacingDecision`, `DueKc`, `SessionOutline`, `ItemGenerator`, `Why` in `src/core/types.ts`. Overview: [ARCHITECTURE.md §5](../ARCHITECTURE.md#5-the-planner-what-to-practise-and-when).

Every function is pure. It reads the learner and the ledger through `PlannerContext`, and never an event log or a clock: time is `ctx.now`, and randomness is the request's `seed`. The same request and context always give a deep-equal result. The director asks; the planner answers.

**Built in stage 4, hard constraints first.** Behind today's `chooseWords`, `tileBank`, `swapChain` and `trialWords`, the planner first only filters: generators and the hard constraints of §5 (lags, no distractors in Lessons 1 and 5, taught code). Among the candidates that pass, it keeps today's choice (seeded). Scoring (§5 step 3), `due` and `pacing` rank anything only once the learner has real attempts from core-run beats (stage 5 on); until then they run in tests and headless only.

## 1. `pacing(ctx)`: which unit, and how fast

- **`frontier`** is `learner.frontier`, or IC1 for a new child.
- **`preCode`** is true when the band is `none` (not yet, not sure, or silent in the opt-in) and there is no IC1 evidence yet. Such sessions are the warm-ups W1–W6 (FIRST_MINUTES §10; game-only, sw.ts Decision 3). They count for nothing towards IC1. Pre-code pacing is FIRST_MINUTES §10's, exactly:
  - under 50% over the last 10 you-do answers in two lessons → the next lesson repeats the previous warm-up with new pictures;
  - 90% or more across three warm-ups → W4 and W5 are skipped (`fm_super_listener`), then W6 and IC1.
- **Advance by mastery** when all of these hold:
  - `canMoveOn(frontier).ok` (the official lags are built in);
  - every new read GPC of the frontier has pKnown ≥ 0.8;
  - those KCs have evidence from ≥ 2 sessions.
- **Keep pace:** after `keepPaceAfterSessions` (8) sessions in the unit, with overall proficiency ≥ 0.6 → advance anyway (`advanceBy: "keep-pace"`), and put the weak KCs on keep-up review. Sounds~Write keeps the class's pace and supports the children behind; the game does the same for one child.
- **Remediate:** after `remediateAfterSessions` (4) sessions with less than +0.1 improvement in overall proficiency → `remediate` = the unit's KCs with pKnown < 0.5. The outline then reteaches them through a different activity (oral first sound, then building), with fewer choices, more I do, and a check of the mechanic KC.
- **Jump ahead:** `affect.boredom` ≥ 0.7, at least 95% independent over the last 20 frontier attempts, and 4 of 5 right on a probe block from the next three units → `offerJump` = the next `PACING.milestones` unit. A grown-up confirms it, as today. The probe block is the only place, besides placement, where probes appear (§5).
- **New-key budget** (`newKeyBudget`) by age: 3 → 2, 4 → 3, 5+ → 4. One fewer when more than 10 **backlog** KCs are due; 0 when more than 25 are (review first, like Anki's new-card limit). Spelling-lag KCs (§2) are not backlog, so an Extended Code child's normal spelling lag never freezes new teaching.
- **`reviewShare`:** 0.25, or 0.5 when more than 10 backlog KCs are due.
- **`age`** is `ctx.age`, derived at session.start from the school year and the date (`ageBandFor`), never asked.

The engine calls `adapt` on every `item.end` and passes the result to the machine's `replan`. The engine turns `advance` into a `game.progress unit-passed` event (with `watch`) and then `unit-started`, so the transcript can say why.

## 2. `due(ctx)`: spaced repetition

- **Candidates:** every observed KC with at least one scored attempt. Then, first match wins:
  - last grade 0 → due at once, reason `lapsed`, until the next successful retrieval;
  - never retrieved unaided (`tLastSuccess` unset) → due, reason `keep-up` (these are the children who need review most: a KC they have never got right alone must not drop out of review);
  - recall(now) < `desiredRetention` (0.8) → due, reason `spaced` (or `blocking-move-on`, `watch`, `keep-up` as below);
  - otherwise not due.
- **The Extended Code spelling lag.** A `gpc:X:spell` KC whose unit is within `PACING.lags.extendedCodeSpellingAccuracy` (5–7 units) of an EC frontier is expected to lag. It is due with reason `spelling-lag` and `backlog: false`: it is practised in review and shown on the grown-ups' watch list, but it never counts towards the due total or the new-key throttle. Every other due KC has `backlog: true`.
- **Urgency** = (0.8 − recall) × importance, with recall counted as 0 when null.
  - Importance is the GPC's frequency in the corpus of decodable words, normalised to 0.5–1.5, so a i m s t matter most.
  - × 2 for keep-up KCs; × 2 for KCs blocking move-on (the previous unit's reading or manipulation facets below move-on).
- **`reviewUnit`:** the unit that first taught the KC. A due KC is only eligible for a review activity if index(`reviewUnit`) ≤ index(frontier) − lag:
  - Symbol Search and Sound Swap: 1;
  - reading in connected text: 1;
  - dictation: 2.

  A due KC from the current unit is practised in the current-unit part instead.
- **Sorted** by urgency (descending), then by KC id.

## 3. `outline(ctx, budgetMs, seed)`: a session

The shape is sw.ts `SESSION` (review, current unit, connected text), shortened for home play.

| Part | Share | Initial Code | Bridging | Extended Code | Lag |
|---|---|---|---|---|---|
| warm-up | 1–2 items | the 1–2 most urgent due items, **eased**: 2 choices, a known mechanic, you do | same | same | ≥ 1 |
| current unit | ~50% | Lesson 1 `word-building` (Lesson 5 `word-building-digraph` for IC7 and IC11), then Lesson 4 `who-read-it-right` / `word-reading` | Lessons 6, 7, 8 (`word-puzzle`, `read-write-check`, `sound-review`) | sound units: Lessons 6, 7, 9 (`word-puzzle`, `spelling-choice` / `read-write-check`, `seek-the-sound`); spelling units: Lesson 10 (`spelling-sort`, `alternative-reading`); polysyllabic Lessons 11 and 12 from week 2 of EC4 | 0 |
| review | `reviewShare` | Lesson 2 `symbol-search`, Lesson 3 `sound-swap` (nonsense from IC8), Quizzing (`dictation-word`), Speed Read (`timed-review`) | same | Lessons 3, 4, 8, 10; polysyllabic 11–14 | ≥ 1 (dictation ≥ 2) |
| connected text | ~15% | `reading-in-text` one unit behind, or `dictation-sentence` two behind, alternating by session | same | same | read ≥ 1, write ≥ 2 |
| pre-code | all | the warm-ups W1–W6 not yet done (authored, from `src/content/warmups.ts`), paced as in §1 | – | – | – |

- The warm-up part picks by urgency and eases the items; it does not filter on predicted success. After three days away, the most urgent items are exactly the ones a child is least likely to get, so they get the easiest presentation instead of being dropped.
- **Budget by age:** 3 → 8 minutes; 4 → 10; 5 → 12; 6 → 15; 7+ → 20. Items per block: 3 → 6; 4 → 8; 5 → 10; 6 → 12; 7+ → 14.
- **Remediation:** when `pacing.remediate` is set, the current-unit part targets those KCs through a different activity than last time, with `scaffold.choices` − 1 and release `{ ido: 1, wedo: 1 }`.
- **Authored episodes pin the current-unit part.** The director passes `pinned`, and the planner fills only the warm-up and review around it.

## 4. `scaffoldFor(mechanic, activity, ctx)`: presentation difficulty

- **Release**, from the ledger entry for `mech:${mechanic}`:

  | The child and this mechanic | Release | Choices |
  |---|---|---|
  | not yet explained (no demonstration, no explanation, not assumed) | `{ ido: 1, wedo: 2 }` | 2 |
  | explained, but independent uses in fewer than 2 sessions (`correctUseSessions` < 2) | `{ ido: 0, wedo: 1 }` | 3 once pKnown(mech) ≥ 0.8 and the last block was ≥ 0.8 independent; else 2 |
  | otherwise | `{ ido: 0, wedo: 0 }` | up to the maximum |

  - The maximum is 4 in the Initial Code (3 for age 3), and 5 afterwards.
  - Choices never grow by more than 1 per block.
  - Guessing or position bias brings back `{ ido: 1, wedo: 1 }` with 2 choices.
  - The warm-ups don't use this: their phases are in the WARMUPS script (the first tap is the we do, and its answer glows after 2 s).
- **Distractors:** 0 for `word-building` and `word-building-digraph`, always (Lessons 1 and 5). Dictation and battle skins: 1, then 2 once the slot KCs are ≥ 0.8, drawn first from the child's own confusions.
- **Presentation:**
  - oral blending follows the PEDAGOGY.md M1 ladder: whole-word minimal pairs, then stretched (continuant starts), then segmented;
  - building is stretched when the word has a stretched recording, otherwise whole.
- **`lines`:** true for building and dictation.
- **Timers:** only for trials, Speed Read and battles with timers, and never on KCs taught in the current unit.

## 5. `block(req, ctx)`: the items for one block

1. **Candidates.** Pinned requests build items from the pinned words, pairs or chain, in order. Otherwise every generator for the activity's item kind returns all candidates that meet the hard constraints.
2. **Hard constraints** (a candidate that breaks one is never returned):
   - every written spelling is in `ledger.taughtCode` ∩ `curriculum.knownAt(req.maxUnit)` (special words excepted). **Probe requests** (`purpose: "probe"`, only from placement and the jump-ahead check) are the one exception: their items carry `why: probe` and `probe: true`, are exempt from `untaught-code-shown`, and count only as evidence (no ledger change, no reward, no streak);
   - the lags, as in §2;
   - Lessons 1 and 5: the bank is the word's own spellings, jumbled, with 0 distractors;
   - the first build of a new word length in IC1 starts with a continuant, and two-sound words come before three-sound words;
   - dictation: `dictationSafe`, or a picture or sentence is supplied;
   - picture games: `picSafe`, and `picSaysFirst` for first-sound targets; foils don't share the target's first (or middle) sound; FIRST_MINUTES §11's 3-year-old rule for oral and picture-only games (no top, pin, moth…);
   - Sound Swap: every step passes `swapBetween()`, `OFFICIAL_SWAP_CHAINS` come first, and nonsense words only from IC8;
   - no sort before BR (concept 3), and no "two letters, one sound" content before IC7 (the registry's `notBefore`);
   - keys not yet explained in the ledger (new code, new words for dictation) ≤ `req.maxNewKeys`.
3. **Score** each candidate (once real attempts exist; see the stage note):
   ```
   score = need × info + newCode + contrast + variety − recency − λ × (P − mid(targetSuccess))²
     need     = teach: 1 − pKnown(target);  review: urgency of the target (due list)
     info     = P × (1 − P)                                  // most informative near 0.5, moderated by the success term
     newCode  = 0.8 if the item uses a GPC this block teaches
     contrast = 0.5 if its foil or contrast is a confused pair of this child's (confusions ≥ 2)
     variety  = 0.3 if its picture word was seen fewer than 3 times
     recency  = 1.0 if its word was in the last 5 items, 0.5 if in the last 2 blocks
     λ = 4;  P = the you-do prediction
   ```
4. **Compose** greedily in score order, with `rng(seed)` breaking ties:
   - the first you-do item is the block's easiest you-do item;
   - never two you-do items with P < 0.6 in a row;
   - no word more than twice per block, except the deliberate I do → we do → you do on the first word of a new length;
   - no answer position used for more than 60% of items;
   - the mean predicted success **of the you-do items** is within `targetSuccess` for the purpose (teach [0.6, 0.8]; review [0.8, 0.92]) whenever the pool allows. If it doesn't, the block says why in `notes`.
   - Ending on a success is not the planner's rule: the protocol requeues a twice-missed item and the round ends on an independent success ([activities.md §2](activities.md#2-the-teaching-protocol)).
5. **Phases** come from `scaffold.release`, applied to the leading items. The choices per item are the scaffold's; we do uses the same number.
6. **Every item** gets its `id` (`${beat}:i${n}`), `evidence` (from `evidenceFor`), `predicted` (by phase, §7) and `why`.

## 6. `adapt(block, done, ctx)`: at item boundaries only

- **Requeue is not the planner's job.** The protocol requeues a failed item itself. `adapt` never adds a copy, and it sees the requeued item among the remaining ones.
- **Ease off:** after 2 misses in a row (`affect.errorsInRow` ≥ 2) or frustration, the remaining unstarted items are replanned with the success target lowered by 0.1 and one fewer choice (minimum 2).
- **Step up:** when boredom fires, the remaining we-do items become you do and choices rise by 1 (up to the maximum). Never probes: a beat that looks too easy gets fewer scaffolds, never untaught code.
- **Never** changes an item that has started. The machine never changes its own difficulty.
- Every change is logged as a `game.decision` by `planner`.

## 7. `predict`

```
predict(spec, choices, phase, ctx):
  I do   → null                                          (Sensei answers; excluded from every band)
  we do  → max(P_youdo, glowAssisted)                     glowAssisted 0.9: the answer glows
  you do → P_youdo
P_youdo = learner.predict(evidence refs, choices)          // BKT + forgetting, c = 1/choices
logit(P_youdo) += offsets:  stop-consonant start −0.3 · adjacent consonants −0.3 · per sound beyond 3 −0.2 ·
                            no picture (oral or picture games) −0.2 · picture not picSafe −0.4 · timed −0.3
```

The offsets are hand-set now, and fitted from real logs later (they are features of `item.start`, which records the full spec, the options and the prediction).

## 8. Generators (`generators/*.ts`)

There is one generator per item kind: oral, word building, symbol search, sound swap, reading (who read it right, word reading, Speed Read, story pages), dictation (words and sentences), sorts, spelling choice and polysyllabic, plus tap-all for the warm-ups' later repeats. Each returns every candidate that meets the hard constraints. Together they replace `chooseWords`, `tileBank`, `swapChain` and `trialWords`.
- **Who read it right:** the foil differs at one position, chosen at this child's weakest or most confused KC in the word (`curriculum.contrasts`).
- **Symbol Search:** the choices include this child's confusion partners.
- **Dictation:** the `maxUnit` is two back; untaught words go "on the board".
- **Oral:** picture words from any unit that pass the 3-year-old rule, named aloud when shown.

## 9. Tests (`src/core/planner/*.test.ts`)

1. **Hard constraints** (property, over every unit × 1,000 seeds, with random ledgers where `taughtCode` ⊆ `knownAt`):
   - every written spelling is in `taughtCode` ∩ `knownAt(maxUnit)`, except in probe requests, whose items are all marked `probe`;
   - Symbol Search and Sound Swap never use current-unit code;
   - dictation is at least 2 back;
   - Lesson 1/5 banks equal the word's spellings;
   - swap steps pass `swapBetween`;
   - nonsense only from IC8;
   - no homophone is dictated without a picture;
   - picture words pass `pic-names` and the 3-year-old rule;
   - no sort before BR.
2. **The first appearance** of a mechanic has 2 choices and release `{ 1, 2 }`; choices never jump by more than 1 between blocks.
3. **The success band, by purpose, on you-do items:** when the pool allows, a teach block's you-do mean is within [0.6, 0.8] and a review block's within [0.8, 0.92]; I-do items have `predicted` null and we-do items ≥ 0.9; when the pool doesn't allow, `notes` says why.
4. **Block rules:** the first you-do item is the easiest you-do item; no two you-do items below 0.6 in a row; no answer position above 60%. A teach block of new code for a blank child (pL0 0.1, 2 choices) is valid: its you-do items predict about 0.55–0.65 and the block reports `stretch`, not an error.
5. **Determinism:** the same request and context give deep-equal blocks; a different seed can differ only in tie-breaks.
6. **Time travel** (`due`):
   - a GPC first independently retrieved on day 0 is not due at hour 2, is due by hour 8;
   - after an easy success on day 1, it is not due on day 2 but is due by day 3;
   - after a wrong answer, it is due at once with reason `lapsed`, and stays due until a successful retrieval.
7. **Three days away, worked.** Fixture: `gpc:s>s:spell` pL 0.8, h 24 h; `gpc:a>a:spell` pL 0.8, h 90 h; `gpc:m>m:spell` pL 0.9, h 200 h; all last retrieved 72 h ago, importance 1. Recall is 0.125, 0.574 and 0.779; pKnown 0.45, 0.63 and 0.80; urgency 0.675, 0.226 and 0.021. All three are due. The warm-up holds s then a, as Symbol Search at 2 choices, predicted 0.5 + 0.5 × 0.45 × 0.9 = 0.70 and 0.5 + 0.5 × 0.63 × 0.9 = 0.78. m waits for the review part.
8. **Keep-up.** A KC attempted three times, never right unaided, is due with reason `keep-up` and recall null, and appears in review before any `spaced` KC of equal importance.
9. **The spelling lag.** An EC10 child with 30 lagging `:spell` KCs from EC3–EC5 and 5 other due KCs: the spell KCs are due as `spelling-lag` with `backlog: false`, and `newKeyBudget` is the full budget for the age.
10. **Confusion:** after 3 a→i confusions, the next who-read-it-right foil contrasts a and i at that position, and the next dictation bank includes < i >.
11. **Pinned:** the words of `w1-4` (am, at; pairs am/at, at/am, am/at) come back in authored order with phases [i-do, we-do, we-do, you-do, …], and the planner adds only predictions and foils.
12. **Pacing:**
    - advance only with `canMoveOn` ok, pKnown ≥ 0.8 and 2 sessions;
    - keep pace after 8 sessions at ≥ 0.6;
    - remediation after 4 flat sessions;
    - jump ahead offered under the boredom and probe conditions;
    - pre-code for band `none`, whatever the age; not for band `R`;
    - FIRST_MINUTES §10's warm-up repeat and skip rules.
13. **Probes:** `adapt` on a too-easy block never adds items; probe items appear only in placement and jump-ahead requests.
14. **Adapt:**
    - `adapt` never adds an item, and never duplicates the protocol's requeued copy;
    - 2 misses in a row lower the choices of the remaining items by 1 (minimum 2);
    - started items never change.
15. **`outline`** follows `SESSION`: an IC3 child gets Lessons 1 and 4 in the current part, and Symbol Search and Sound Swap only on IC1–IC2 code.
16. **Energy and trials:** a trial is only offered when `energy` = 1 and 3 dictation-safe trial words exist (today's `trialPool` rule).
