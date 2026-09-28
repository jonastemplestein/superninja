# The progress model: petals and gems

**Status:** the model behind the World Flower's petals and gems, 27 September 2026. Code: [`src/content/progress.ts`](../../src/content/progress.ts) (pure functions, no React, no store). Tests and snapshots: [`src/content/progress.test.ts`](../../src/content/progress.test.ts) (`bun test ./src/content/progress.test.ts`). No existing game file has changed.

**What Jonas asked (27 Sep):** "Each petal on the flower starts missing, then comes back as a faint outline when you have encountered the sound and then you need to 'fill it up' to complete it. So there are three high level states for the petal kinda or maybe it's more like a gradient or sth and it should be possible to look visually at the flower easily to see progress. And in each spelling gem in a sound we also need to have a measure of progress towards mastery. In fact some spellings can even make multiple sounds. Like ea. That should also be something that is explicitly discussed and has a game."

This is the answer to the first three sentences, and the data for the fourth: which spellings represent more than one sound, for whom, and whether Sensei has explained it yet.

---

## 1. At a glance

```
 PETAL (a sound)      missing ──► outline ──► filling ─────────────► complete (for your stage)   ··· complete.full (the whole chart column)
                      not met     met, empty  fill 0 → 1 as its gems   every spelling taught so far
                                              charge and are won       is won: a star
                                  (dust: the part of the fill that has been forgotten, fill − fresh)

 GEM (a spelling      unseen ─► met ─► practising ─► ready ─► won ─────────► mastered
  of that sound)      0         0.05   0.05 → 0.6    0.6      0.8 → 1.0      1.0          value (towards mastery)
                                       by its energy          by consolidation: right ≥ 80%, ≥ 10 answers, ≥ 3 words, ≥ 2 days
                                  (fading: won, but not used for a while; value falls, never below half)
```

- **A petal has three states you can see** (missing, outline, complete) **and a gradient between the last two** (filling, with `fill` 0..1). The gradient is the progress bar Jonas asked for: the flower shows at a glance how full every sound is.
- **A gem has a stage and a value.** The stage is the milestone (the mark on the chart); the value is the gradient towards mastery (a ring or a glow).
- **Time never takes away what a child has earned.** No petal state, no fill and no gem stage ever falls because time passed. What was learnt and not used for a while becomes *dusty*: `fresh` (petal) and `value` (gem) fall, at most by half, and practice polishes it back.
- **"Complete" has three meanings**, and the model returns all three (§2.3). The one the child sees is *complete for your stage*: every spelling of the sound the game has taught them is won. The chart still shows the ones still to come.

---

## 2. Petals

### 2.1 States

| state | when | from the save |
|---|---|---|
| **missing** | the child hasn't met the sound | no spelling of it taught (§4) and none won |
| **outline** | met, nothing filled yet | a spelling taught, but every taught spelling is still at *met* (no energy) |
| **filling** | some of it filled | `0 < fill < 1` |
| **complete** | complete for the child's stage | every spelling taught so far is won (`fill` = 1) |

Plus, per petal: **`soon`** (missing, but a lesson in the child's current land teaches one of its spellings: the World Flower's "hiding in this land" shimmer, as `worldNewSounds` does today), **`reachable`** (the game can teach at least one of its spellings; /zh/ and /schwa/ can't yet), **`fading`** (dusty, §2.4) and **`ready`** (how many of its gems are ready for a Gem Trial: the map's gold dot).

In today's game *outline* is short-lived: the lesson that teaches a spelling also practises it, and every right answer charges its gem, so by the time the new-spellings trip shows the petal it usually has a little fill. It is still the right state for the moment the petal appears, and for a petal whose gems have drained (a wrong tap takes energy away).

### 2.2 What fills a petal

**`fill`** is the weighted mean, over the spellings **taught to this child**, of how far each gem has come towards being won:

```
fill = Σ weight × toComplete(achieved) / Σ weight          toComplete(v) = clamp((v − 0.05) / (0.8 − 0.05), 0, 1)
```

so a gem just met adds nothing, a half-charged gem about a third (0.37), a gem ready for its trial three quarters (0.73), and a won gem all of its weight.

**"Taught to this child" is the child's stage.** A child's stage is what the game has taught them: the lessons played, plus everything before a placement (Show Sensei, or the school-year start, which places a Reception child in the spring at unit 4 and a Year 1 child at the Sky Temple). So the school year already shapes the stage through placement, and the fill never counts a spelling the child can do nothing about yet. A mid-Year 1 child's /ae/ is *ai* and *ay*; *a-e*, *ea*, *ei*, *ey* and *eigh* are on the chart, pencil grey, and don't count until they are taught. (A Reception child who has never reached the Sky Temple has no /ae/ at all: the petal is missing.)

**Weights** (`TIER_WEIGHT`), by where Sounds~Write first teaches the pairing (`firstTaught` in `sw.ts`; the chart's split spellings *a-e*, *i-e*, *o-e*, *u-e* are placed by the split coding, Freshford's):

| tier | units | weight | why |
|---|---|---|---|
| basic | Initial Code 1–11 and the Bridging Unit | 3 | the basic code: in the most words |
| first | Extended Code 1–26 (Year 1: first spellings and single-visit sounds) | 2 | Sounds~Write teaches the commonest spellings of a sound first |
| more | Extended Code 27–49 (Year 2: more spellings) | 1 | rarer (*eigh*, *ough*, *ey*) |
| beyond | never in a code unit (the polysyllabic strand: *ti*, *ssi*, schwa) | 1 | |

< x > weighs 1 in both /k/ and /s/: it is one spelling for the two sounds together (the chart puts it in both petals, and `petalComplete` needs it in both).

Within a stage the weights rarely matter (a stage's spellings of a sound are mostly one tier); they matter for `whole`.

**`whole`** is the same mean over **every spelling on the chart**, taught or not: how far through the whole programme the sound is. /ae/ with *ai* and *ay* won is 4 of 11 (0.36): *a-e* and *ea* (2 each) and *ei*, *ey*, *eigh* (1 each) are still to come.

**`polish`** (0..1) is how far past complete towards mastered: 1 when every taught gem is mastered. It is the renderer's "shine".

### 2.3 Complete, three ways

| field | means | who it's for |
|---|---|---|
| `complete.stage` (= `state === "complete"`) | every spelling taught so far is won | **the child**: the petal is full, for now, with its star |
| `complete.game` | every spelling this version of the game can teach is won | today's `petalComplete` (engine/gems.ts): the petal flies home. The test checks they agree on every save |
| `complete.full` | every spelling on the chart is won | the whole programme: the chart column is finished. Only possible today where the game has all of a sound's chart spellings: /a/, /y/, /w/, /ch/, /th/, /dh/ |

**Why the child sees `stage`:** it is the only one a child can always reach by playing: a child's /ae/ petal can be full for now with *ai* and *ay*, while the chart still shows *a-e*, *ea*, *ei*, *ey* and *eigh* to come. `full` is the long goal (it goes on the chart as the whole column in ink, and could earn a crown), and `game` converges on `full` as the game gains the Extended Code; until the celebrations are moved to `stage`, `game` keeps today's "petal comes home" moment exactly as it is.

**A complete petal can open again.** When a lesson teaches a new spelling of a sound whose petal was complete (*ck* for /k/ after *c*, *k* and *x* were won), the new gem joins the petal's stage and the fill drops to its new share (/k/: from 1 to 7/10). This is the Sounds~Write shape (a sound returns with more spellings), not a loss. The renderer should show it as *a new empty gem appearing in the petal* ("Your /k/ petal has room for a new gem!"), with the star kept until the new gem is shown, not as the petal draining.

### 2.4 Dust: `fresh`

`fresh` is the fill after forgetting, with each gem's share scaled by how much of it is remembered (`0.5 + 0.5 × recall`, §3.4):

```
fresh = Σ weight × toComplete(achieved) × (0.5 + 0.5 × recall) / Σ weight          fresh ≤ fill, fresh ≥ fill / 2
```

The band between `fresh` and `fill` is dusty. A petal is **`fading`** when at least a tenth of its fill is dust (`fill − fresh ≥ 0.1`), which is what its won gems at the fading line (recall 0.8) would give. So one rarely used gem (< x >) dusts its own line on the chart, not the whole petal on the flower.

---

## 3. Gems

### 3.1 Stages

| stage | rule (first match) | engine/gems.ts `gemState` |
|---|---|---|
| **won** / **mastered** | its Gem Trial is won (`save.gems`); mastered when all four MASTERY criteria hold (§3.3) | won |
| **unseen** | not taught to the child (§4), or not in play (the game has no words for it: "far away") | hidden, future (and, for the lesson that is next, charging: §4) |
| **ready** | energy full and at least three trial words the child can spell | ready |
| **practising** | some energy, or some answers | charging |
| **met** | taught, no energy, no answers | charging |

The test checks this mapping against `gemState` for every gem on every test save.

### 3.2 Value

The value climbs a ladder (`LADDER`) whose rungs are the milestones the child can see:

| stage | value (before forgetting) | from |
|---|---|---|
| unseen | 0 | |
| met | 0.05 | taught |
| practising, ready | 0.05 + 0.55 × energy | the gem's own charge (0..8, `ENERGY_FULL`), which the game already fills with right answers (+1 a spelt sound, +½ a word read) and drains with wrong ones (−½, −¼) |
| won | 0.8 + 0.2 × consolidation | the trial is the jump from 0.6 to 0.8; the rest is consolidation |
| mastered | 1 | |

**Why energy, not a new score, drives practising:** the child already sees it fill (the gem's energy ring, the practice dojo, "Your gem filled up"), so the petal fills when the gem does. **Why the trial is worth a jump:** it is the game's one test of a spelling under pressure, and the moment the child celebrates.

The value the API returns is **after forgetting**: `value = achieved × (0.5 + 0.5 × recall)` (recall is 1 before any use, so a gem that has never been used doesn't decay). `parts.achieved` is the value before forgetting; it never falls with time.

### 3.3 Mastered

A won gem is **mastered** when all four hold (`MASTERY`):

| criterion | threshold | why |
|---|---|---|
| accuracy | right ≥ 80% (smoothed: (right + 1) / (answers + 2)) | Sounds~Write's 75–80% proficiency; the core's `secure.pKnown` 0.8 |
| answers | ≥ 10 (a spelt sound 1, a word read ½, as energy counts them) | not one lucky battle |
| words | right in ≥ 3 different words (fewer if the game has fewer: *ve* has two) | a spelling known in one word isn't known |
| days | used on ≥ 2 different days (uses within 12 hours are one) | the core's `secure.minSessions` 2: massed practice isn't learning |

`consolidation` is the mean of the four, each capped at 1, so a won gem's value shows how close it is. The game records a spelt sound as right only when the word has had no miss so far (Battle and Dojo), so "accuracy" here is close to *right first time*.

### 3.4 Forgetting

```
recall   = 2^(−days since last use / half-life)
half-life = 7 days while practising, 14 once won, × 2 for each further day of use (up to × 8)
fading   = won and recall < 0.8
```

- **Half-lives:** a gem used on one day and then left is shaky within a week or two; a gem used on four or more days holds for months (won: 112 days). This is the spacing effect the core models with its half-life growth.
- **The floor:** forgetting costs at most half of what was achieved (the core's `rFloor` 0.5): something learnt and forgotten comes back faster than it was learnt.
- **Only won gems get dusty** (the core's "fading" is likewise a status of what was secure). A gem still charging loses value with time too, but it is being worked on anyway; dust there would be noise.
- **The save's limits:** it keeps only the last time per pairing and per word, so "days" is a lower bound, and it has no time for a trial won. Both make the estimate cautious (dust a little early), never generous.

Examples (the mid-Year 1 child of §6, a month away): *m* (used on 23 days, half-life 112) falls from 0.96 to 0.89 and is only just dusty; *ai* (mastered, used on 3 days, half-life 56) from 0.89 to 0.77; *th* as /th/ (last used in Shadow Castle) from 0.82 to 0.72.

### 3.5 `parts`

Every number the value comes from, for the card and for debugging: `inPlay`, `taught`, `energy` (0..1), `trial`, `attempts`, `accuracy`, `streak`, `words`, `wordsNeeded`, `days`, `lastAt`, `daysSince`, `halfLife`, `recall`, `assumed` (charged by placement, not by play), `consolidation`, `achieved`. Each gem also has `sw` (the Sounds~Write unit that first teaches it) and `tier`.

---

## 4. When has a child met a spelling?

A spelling>sound pair is **taught** when any of these holds:

1. its Gem Trial is won; or it has been **used** (energy, answers) or its new-spellings trip has played (`flowerSeen` has `spelling:<key>`);
2. or a lesson the child has played, or been placed past, teaches that **pair** (`teach` entries, the units before the frontier's, the placement's `petals`), and it isn't the frontier lesson's own.

Two differences from `gemState`, both deliberate:

- **One lesson later.** `knownNow` counts the spellings of the level the child is *about* to play, so `gemState` shows them as charging before the lesson. The model waits for the lesson (or for the child to use them): the petal appears when the new-spellings trip says it does. A test pins this: the only gems `gemState` calls charging and the model calls unseen are the next lesson's.
- **By pair, not by spelling.** `gemState` meets every pair of a known spelling. Today that changes nothing (*th* teaches both its sounds in one lesson; *u* as /w/ is met with *q*). When the Extended Code comes in, it matters: a lesson on *ea* as /ee/ must not mark *ea* as /e/ (*head*) as met.

---

## 5. The learner model in `src/core`

It isn't wired into the game yet: nothing outside `src/core` imports it (checked 27 Sep). So the model is derived from what the save records, and it is built so the core can take over in two functions:

| here (`progress.ts`) | the core replaces it with |
|---|---|
| `evidenceOf`: accuracy and answers | `pKnown(gpc:<key>:read / :spell)` (BKT with guess = 1/choices, credit assignment, help-weighted evidence) |
| `evidenceOf`: words, days | its evidence window and `sessions` per KC |
| `recallOf`: half-life, recall | `recall()` (half-life from the last scored retrieval, grown by spaced success) |
| the mastery test | `status() === "secure"` |
| `fading` | `status() === "fading"` |

Stages map onto the core's `KcStatus`: unseen ↔ unseen, met ↔ exposed, practising ↔ learning, ready ↔ move-on (roughly), mastered ↔ secure, fading ↔ fading; *won* stays a game event (the trial), which the core doesn't model. The petal formulas, the ladder's rungs and the API don't change.

---

## 6. Snapshots

The test saves are **played, not typed**: a seeded simulator plays the real levels with the real words, records answers the way `engine/store.ts` does (a miss, then the rest of the word counted as not right first time; energy up and down), takes Gem Trials when gems are full, and spreads the sessions over weeks. Evaluated on Sunday 27 September 2026, 5 pm.

| child | missing | outline | filling (fill) | complete | full | dusty | mean fill / whole |
|---|---|---|---|---|---|---|---|
| **new** | 44 (soon: s o i n m t a p) | | | | | | 0 / 0 |
| **mid-Reception** (units 1–7, 18 sessions over 9 weeks) | 21 | | s .60, l .66, f .75, v .55, k .64, z .48 | e u o d i n j g m h r t a p b w y | a y | v | 0.90 / 0.27 |
| **end of Reception** (Initial Code and the Bridging sorts, 44 sessions) | 16 (soon: ae ee ie oe) | | s .83, l .82, f .86, v .60, k .97, z .78, w .87, y .69, ch .81, dh .73, ng .71 | e u o d i n j g m h r t a p b sh th | a th | f v g | 0.92 / 0.37 |
| **mid-Year 1** (the Sky Temple: ai ay ee ea; 70 sessions) | 14 (soon: ie oe) | | ee .84, v .61, z .75, w .88 | ae s l f e u o d i n j g m h k r t a p b y sh ch th dh ng | a y ch th dh | ae s f v j h w y ch th dh ng | 0.97 / 0.42 |
| **the same child, 30 days away** | 14 | | *the same* | *the same* | *the same* | 22 petals | *the same* |
| **placed Year 1** (the Initial Code assumed half-charged, two weeks of Sky Temple) | 14 | | 24 petals, .16–.76 | d i n r t p | | sh | 0.57 / 0.23 |
| **everything** (every level but the last boss) | 12 (the sounds the game can't teach) | | v .87 | the other 31 | a w y ch th dh | 22 | 1.00 / 0.44 |

Gems (value after forgetting):

| child | gems |
|---|---|
| mid-Reception | m>m won 0.99 · x>ks practising 0.20 · zz>z practising 0.42 · sh>sh unseen |
| end of Reception | m>m won 0.99 · ck>k won 0.98 · th>dh ready 0.58 · u>w won 0.99 · ai>ae unseen (its lesson is next) |
| mid-Year 1 | m>m won 0.96 · th>th won 0.82 dusty · ai>ae mastered 0.89 dusty · ea>ee mastered 0.94 · oa>oe unseen |
| 30 days away | m>m won 0.89 dusty · th>th won 0.72 · ai>ae mastered 0.77 · ea>ee mastered 0.80 (all dusty) · oa>oe unseen |

What they show:

- **The mid-Reception flower is mostly full:** the single-letter sounds are won; the petals still filling are the ones unit 7 gave a second spelling (*ss*, *ll*, *ff*, *zz*, *x*) and /v/ (only a handful of words).
- **/v/ never completes**, even for the child who has played everything: *ve* has only two words the game can test (*have*, *give*), so its Gem Trial never opens (§10).
- **A month away changes no state and no fill** (the test checks every petal and gem): it turns 22 petals dusty and lowers every value, least for the most-used spellings.
- **The placed child's petals sit around a third full** (half-charged by placement, `parts.assumed`), and fill as they play.

---

## 7. One spelling, several sounds

Sounds~Write's fourth concept: "many spellings can represent more than one sound", taught formally from EC3 (Spelling < ea >) with Lesson 10, *One Spelling, Different Sounds*, and the spelling units EC3, 5, 9, 13, 15, 17, 22, 26, 31, 39 and 41.

**`soundsOfSpelling(g)`**: every petal whose chart column has *g*, in the order Sounds~Write teaches them (then the chart's order), each with its key, unit, tier, whether the game has it, and an example word (a game word when there is one, else `CHART_EXAMPLES`, taken from the Sounds~Write unit word lists in `src/content/units`):

```
ea → /ae/ EC1 steak · /ee/ EC2 sea (in the game) · /e/ EC7 head
a  → /a/ IC1 mat · /or/ EC19 water · /ar/ EC24 father · /o/ EC25 watch · /schwa/ banana
y  → /y/ IC7 yak · /ee/ EC2 happy · /ie/ EC11 sky · /i/ EC30 gym
x  → /s/ and /k/, one gem (x>ks) marked `together`: one spelling for two sounds at once, not two sounds to choose from
```

**`multiSoundSpellings(stage)`**: the spellings that represent two or more sounds at a stage, in the order they became so. Pass a save for the child's own stage (and `discussed`: whether the narrative ledger has `two-sounds:<g>`, the key `content/narrative.ts` already uses for *th*), or `stageAtUnit(unit)` for a point in the programme:

| by the end of | spellings with more than one sound |
|---|---|
| IC11 | n (/n/ /ng/), th (/th/ /dh/), u (/u/, the /w/ of *qu*) |
| EC3 | + e (/e/ /ee/), ea (/ae/ /ee/), y (/y/ /ee/) |
| EC9 | + o, ai, ow; ea gains /e/ |
| EC26 (end of Year 1) | 23 |
| EC49 (end of Year 2) | 35: n th u e ea y o ai ow i oo ou c s se a al or ew u-e ue ar au ey ie ear ough ui g gh our wh ch ss ere |

**In today's game** a child meets two: *th* and *u* (the game has no word with *n* as /ng/). Both come in Shadow Castle. The chart shows the other sounds on each line (`PetalSpelling.otherSounds`: on the /ee/ petal, *ea* also represents /ae/ and /e/), so the card can show "*ea* is in these petals too" and the game Jonas asked for can start from `multiSoundSpellings(save)` where `discussed` is false.

Two chart quirks to know: the /ae/ petal has *a-e* (Freshford's split spelling) but not *a* (the official EC1 *a* in *apron*, *baby*), so *a* shows no /ae/; and *x* is never a "several sounds" spelling.

---

## 8. Drawing it (suggestions for the chart and the flower)

The scroll design decides the look; this is what the numbers are for.

| field | a way to draw it |
|---|---|
| `state: missing` | nothing on the flower; on the chart, the petal's place only. With `soon`, the land's hint shimmer |
| `state: outline` | a faint outline in the petal's colour, the picture in full colour: "you've met this sound" |
| `fill` | the petal's colour rising from the point. Fill by **area**, not height: a teardrop is narrow at the point, so a level at half the height holds far less than half the petal; find the level whose area below it is `fill` (sum the chart's half-width table, v1 `chartDrop().half`) |
| `fresh` < `fill` | the band between them dusty (desaturated, a few specks); a practice or review that uses its gems wipes it |
| `state: complete` | the whole petal in colour, and its star |
| `polish` | a gold rim that closes as the gems are mastered |
| `complete.full` | the whole chart column in ink; could earn a crown |
| gem `stage` | unseen: pencil grey letters · met: ink · practising: ink and an energy ring (`parts.energy`) · ready: the gold gem · won: the jewel · mastered: the jewel with a glint |
| gem `value` | the ring or the jewel's glow, if a gem needs more than its mark |
| gem `fading` | dust on the jewel |
| `otherSounds` | a small mark on a line whose spelling represents other sounds too (*ea*), which the card explains |

---

## 9. API

```ts
import { gemProgress, petalProgress, flowerOverview, soundsOfSpelling, multiSoundSpellings, stageOf, stageAtUnit } from "../content/progress";

gemProgress(save, "ai>ae", { now? })   → GemProgress   { key, g, p, stage, value, fading, sw, tier, parts }
petalProgress(save, "ae", { now? })    → PetalProgress { p, state, fill, fresh, polish, whole, fading, complete: { stage, game, full },
                                                         reachable, soon, ready, counts, spellings: PetalSpelling[] }
                                         PetalSpelling = GemProgress & { expected, weight, otherSounds, example }
flowerOverview(save, { now? })         → { stage, petals: PetalSummary[44] (chart order), counts, fill, whole }
soundsOfSpelling("ea")                 → SoundOfSpelling[] { p, key, sw, tier, inPlay, example, together? }
multiSoundSpellings(save | stage, { now? }) → MultiSound[] { g, sounds, later, discussed, ledgerKey }
stageOf(save)                          → Stage { taught: Set<key>, unit: SwUnitId | null, frontier }
stageAtUnit("EC3")                     → Stage (every chart pairing taught by the end of that unit)
```

Also exported: the constants (`LADDER`, `MASTERY`, `MEMORY`, `TIER_WEIGHT`, `ENERGY_FULL`, `GEM_STAGES`, `PETAL_STATES`) and small helpers (`swUnitOf`, `tierOf`, `exampleOf`, `frontierOf`, `knownOf`, `trialPool`). Everything takes `now` so a replay or a test is exact. `flowerOverview` takes about 1.3 ms on a laptop (all 44 petals and their 182 gems); memoise it on the save.

---

## 10. Found on the way (for the other lanes)

1. **The /v/ petal can never come home.** *ve* has two testable words (*have*, *give*), and a Gem Trial needs three, so the gem never becomes ready. Unit 11 needs a third *ve* word: *twelve* or *solve* (both official Bridging Unit words, decodable at unit 11).
2. **`gemState` shows a lesson's spellings one lesson early** (`knownNow` includes the frontier level's `teach`), before the new-spellings trip "finds" them. The model doesn't (§4). Worth fixing in `gems.ts` when the chart moves onto this model.
3. **A right tap after a miss counts as wrong and drains the gem** (Battle and Dojo record `wordMisses === 0`, and `charge` takes −½). It makes accuracy mean "right first time in the word", which is fine, but a child who fixes one letter loses energy on every letter after it.
4. **The save can't show spacing:** it keeps only the last time per pairing and per word, and no time for a trial won. A `gemsAt: Record<key, ms>` and a per-pairing list of days would make mastery and forgetting exact. The core's event log solves this properly.
5. **`save.petals` is only written by placement and the cheats**, never in play; the model relies on stars and trips instead.

---

## 11. Decisions (logged here; each is the model's default and easy to change)

1. **The child's stage is what the game has taught them** (lessons played and placement), not the school calendar. The school year already reaches the stage through placement, and a stage the child can't act on would leave petals unfillable. `stageAtUnit` gives the programme's view for grown-ups and the multi-sound game.
2. **"Complete" for the child is complete for their stage**; `game` and `full` are returned too (§2.3). A complete petal can open again when a new spelling is taught, shown as a new gem, not a loss.
3. **A gem must be won to count as complete**, because the Gem Trial is the game's gate and the child's clear goal; mastery (four criteria, including two days) is the polish beyond.
4. **Time never takes away a state or a fill; it adds dust**, and forgetting costs at most half (the core's floor). Only won gems get dusty.
5. **A petal appears when the lesson has taught it**, one lesson later than `gemState` (§4), and pairs are taught by pair, not by spelling.
6. **Weights follow Sounds~Write's order** (3 basic, 2 Year 1, 1 Year 2 and beyond): Sounds~Write teaches the commonest spellings first; < x > weighs 1.
7. **Hearing a sound in a warm-up does not make its petal appear**: the warm-ups have no letters and the save doesn't record which sounds they played. The petal appears with its first spelling; `soon` marks the sounds hiding in the child's land.
8. **Examples for pairs the game has no words for** come from the Sounds~Write unit word lists (`src/content/units`), with well-known words where those have none; they are a small table in `progress.ts`, not an import of the unit files (which would put 0.5 MB of word lists into the World Flower's bundle).
