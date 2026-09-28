# Playtest plan: Year 1 and Year 2

**27 September 2026.** How the treadmill (docs/TREADMILL.md) tests the middle and end game: the Year 1 and Year 2 bot personas (where they start, and how accurate they are by what they know), the transcript audits for the later levels, the critic prompts that judge the challenge for a six- or seven-year-old, and the metrics. It follows [../MIDGAME_ENDGAME.md](../MIDGAME_ENDGAME.md) (revision 2, "the spec") and turns on slice by slice with [BUILD_PLAN.md](BUILD_PLAN.md) §11. **[R3: Jonas, Baron final only]** Amended the same evening: the Baron is fought only in the final battle (spec §R.3), and the interim swap ([../fix-requests.md](../fix-requests.md)) makes today's `w6-11` the Sky Magpie; two new audits and a metric check both (§4, §5).

**Rules for the agents who build or run this** (as in BUILD_PLAN): never `rm` (move to `.trash/`), no `cd … &&` chains, never ask Jonas or wait (decide and log), edit only the treadmill's files (the F4 lane, then M9), British English. Runs write to `playtest/runs/<date>/…` (git-ignored) and feed `playtest/INBOX.md` through `inbox.ts`.

---

## 0. The short version

- **Eight new personas** (§2): four Year 1 (September, January, struggling, keen), two Year 2 (September, retaking the check), and two for the weekly list, plus a demo persona for clips and Year 1–2 versions of the Codex playtesters (a Sounds~Write Year 1–2 teacher, a confident seven-year-old, a Year 1 parent).
- **A learner model for bots** (§3): each persona answers first try with a probability that depends on how long ago its spelling was taught (reading settles in about a unit, spelling in about 5–7, as Sounds~Write expects), picks a same-sound rival when it misses a spelling, slips on schwa, and guesses fast when unsure if it is that kind of child.
- **Days, not just levels** (§3.4): a simulated-days runner plays a fortnight or a term of daily sessions in one save, with the core's clock, so pacing, the bridge, doors, lairs and the weekly list can be tested at all.
- **26 transcript audits** (§5) check the Sounds~Write rules the judges found broken in revision 1 (the lags, Lesson 6 before Lesson 7, try-safe misreadings, valid alien readings) and the six-year-old's rules (a pure win, the imp's cause, talk before action). **[R3: Jonas, Baron final only]** Two of them are new: the Baron never fights before the final battle, and the final battle's words are always hard.
- **Three critic prompts** (§6) judge the challenge for age: a six-year-old's eye, a Sounds~Write Year 1–2 teacher, and a challenge calibrator that reads the numbers.
- **The metrics** (§4): first-try accuracy in a 70–85% band, spelling-choice accuracy by lag, words of three or more syllables practised a week, schwa slips, guessing taps, Sensei's seconds per minute, days per land and days between boss-shaped moments.

---

## 1. What exists, and what's new

| Exists (TREADMILL.md) | New for Years 1–2 |
|---|---|
| `bot.ts` (the perfect child, and the `watcher`, `splitter` and learner personas via `window.__botPersona`) | the learner model (§3), read by `bot.ts` from `window.__botPersona` and a persona file |
| `continuous.ts`, `transcript.ts` (one page; text-adventure transcripts) | `days.ts`: simulated days in one save (§3.4) |
| `sweep.ts` (layout, taps, stuck states at 844 × 390), `soak.ts` (perf budgets), `critic.ts` (Gemini filmstrip critic), `script-audit.ts` (the fast/slow and script rules), `personas.ts` (Codex playtesters: Maya, Oscar, Ms Patel, the parent) | the sweep at 667 × 375 and 740 × 360 and at 90 stage px (98 for 360-dp items); the long-word geometry harness; `midgame-audit.ts` (§5); the critic prompts (§6); Year 1–2 Codex personas (§2.3) |

---

## 2. The personas

### 2.1 Bot personas (fast, deterministic, every run)

Each bot persona is a placement, a pace and a code profile (§3). "Start" is where the opt-in and the spec's §1.5 table put them.

| Persona | Who | Opt-in and date | Start | Pace | Assumed | What it tests |
|---|---|---|---|---|---|---|
| **y1-sept** | Maya, 5, Year 1, a typical learner | Year One, 8 September | Sky Temple, first stone | in step with school | Initial Code and Bridging | the main Year 1 path; the first long words; the Sky Magpie; the weekly bridge planks |
| **y1-jan** | Oscar, 6, Year 1 in January, with gaps | Year One, 12 January | Cloud Town, first stone | in step with school | EC1–5, with two gaps: < ow > read as /oe/ in *cow*, and < ea > never read as /ae/ | ghost petals coming home; a catch-up door to the Sky Temple; the door caps |
| **y1-struggling** | Sam, 6, Year 1, behind | Year One, 8 September; 1 of 3 at the first check | drops a band: the Island's Reception start | in step with school | Reception units, after the drop | the band drop; the imp's grabs and lairs; silver stripes; guessing on the fan; the help ladder |
| **y1-keen** | Ava, 6, Year 1, ahead | "not sure", then a grown-up sets Year One | Sky Temple | **own pace**, 20 minutes every day | Initial Code and Bridging | the bridge gate (Year 1 must not finish in 5–7 weeks); the new-stones cap; the Jump ahead offer; boredom signals; **[R3: Jonas, Baron final only]** playing past the last built land: the Magpie again, never the finale, never a Baron fight |
| **y2-sept** | Leo, 6, Year 2 | Year Two, 8 September | Echo Island, first stone | in step with school | all of Year 1 | Year 2's code, homophones, three-syllable words at syllable level, Sensei's Year 2 lines |
| **y2-retake** | Noah, 7, Year 2, retaking the check | Year Two, 8 September; 2 of 3 at the first check | Echo Island, with Year 1 gaps | in step with school | Year 1, with weak vowel spellings (/oy/, /ar/, /ue/) | catch-up into the Sky Isles; Alien Words as review; the pace of doors in Year 2 |
| **list-y1** | Maya's family, a Year 1 weekly list | y1-sept, plus a list link each Monday | – | – | – | seven days of scrolls; the practice test the day before; the headband; Ninja Vanish; "not in the game yet" |
| **list-y2** | Leo's family, a Year 2 list with three special words | y2-sept, plus a list link | – | – | – | two new special words a day at most; spreading three over two days; homophone dictation |
| **demo** | a child for clips | any preset | any | – | – | a child's pace (2–3 s thinking), exactly one mistake per clip so the correction shows, no help unless the clip is about it |

The existing **perfect**, **learner**, **splitter** and **watcher** personas keep running; **learner** gets the code profile of y1-sept from Slice 0 on.

### 2.2 Weekly lists for the list personas

The list personas use lists built like Freshford's (a sound with its spellings, then one to three special words), generated from the unit files so they are real: for example, week 3 of Year 1: `?list=rain,play,cake,great,snail,today&special=said,they&test=fri`; a Year 2 week: `?list=eight,they,grey,vein,weigh,obey&special=people,busy,because&test=thu`. One list in ten includes a word the game doesn't have (*Wednesday*, *Freshford*), to test "not in the game yet".

### 2.3 Codex personas (slow, judged, weekly or before a release)

These extend `personas.ts` (Codex gpt-6-sol, headless browsers; see TREADMILL.md). Each files structured findings.

| Persona | Brief (added to `personas.ts`) |
|---|---|
| **Ms Patel, Year 1–2** | You are a Year 1 and Year 2 teacher trained in Sounds~Write. Read docs/MIDGAME_ENDGAME.md §2.3.1 (the three lags), §3.1–3.3 and docs/midgame/sw-y1y2.md §1.2 and §3. Using the cheat menu's Year 1 and Year 2 presets and `?level=` links, play every new Year 1–2 stone and boss that exists, making deliberate mistakes. Read `window.__audioLog` for what Sensei says. Check: Lesson 6 has no spelling choice; Gem Choice only after the word is read; no boss spells its land's newest code; Lessons 11–14's order and lines; the spelling voice only for a word on its own; schwa corrections; no rules talk, no "tricky", "sight", "magic e" or "silent"; wrong readings never real words or accents; alien readings never marked wrong when valid. Report every deviation with the level, the moment and the clip ids |
| **Oscar, 7** | You are Oscar, 7, a confident Year 2 reader who is bored easily. Play the Sky Isles and the Muddle Isles that exist, from the Year 2 preset. Try to skip, rush, guess and tap fast on the gem fan. Say where you'd get bored, what feels babyish (lines, pictures, rewards), where a boss felt epic or flat, and whether you'd come back tomorrow. **[R3: Jonas, Baron final only]** Say whether the story's villain, Baron Muddle, ever fights you with easy words: he should only introduce his monsters, taunt and escape until the very last battle |
| **A Year 1 parent** | You are the parent of a Year 1 child at a Sounds~Write school. Start at the landing page on a phone. Decide what your child would get today, and what isn't built yet (compare with the page's road). **[R3: Jonas, Baron final only]** Watch the page's videos and the trailer: flag any that shows Baron Muddle, the villain, fighting over simple words. Then make a weekly list link with `/list` from this list: rain, play, cake, great, snail, today; special: said, they. Open it, confirm it for a profile, and check what the game says about each word. Report anything confusing, untrustworthy or overclaimed |

---

## 3. The learner model for bots

### 3.1 First-try accuracy by code knowledge

A persona answers each item first try with a probability that depends on **how many units ago the spelling was taught** (t), counted from the persona's school pace (`PACING` and its date) for school personas, and from the game's own teaching for the others. For each spelling-to-sound pair:

- **Reading:** p_read(t) = r₀ + (r₁ − r₀) · (1 − e^(−t / τ_r)), with τ_r = 1 unit (reading settles about a unit after teaching, the check's reading lag).
- **Spelling:** p_spell(t) = s₀ + (s₁ − s₀) · (1 − e^(−t / τ_s)), with τ_s set so that p_spell reaches about 85% of its range at 5–7 units (Sounds~Write's "5-7 unit 'lag'").
- **A whole word** is the product over its spellings (a word is right only if every sound is), times a familiarity boost for words at rung R3 or above (×1.1, capped at the asymptote).
- **Assumed code** uses t from the school date (a Year 1 child in January has had EC1–5 for 8–20 weeks), with the persona's listed gaps forced to t = 0.

| Persona | r₀ | r₁ | s₀ | s₁ | τ_s (units) | Think time | Help after |
|---|---:|---:|---:|---:|---:|---|---|
| y1-sept | 0.60 | 0.95 | 0.35 | 0.90 | 3 | 2.5 s | two misses |
| y1-jan | 0.60 | 0.95 | 0.35 | 0.90 | 3 | 2.5 s | two misses |
| y1-struggling | 0.40 | 0.85 | 0.20 | 0.75 | 5 | 4 s (or 0.6 s when guessing) | one miss |
| y1-keen | 0.80 | 0.99 | 0.60 | 0.97 | 1.5 | 1.5 s | never |
| y2-sept | 0.70 | 0.97 | 0.45 | 0.93 | 2.5 | 2 s | two misses |
| y2-retake | 0.50 | 0.90 | 0.30 | 0.80 | 4 | 3 s | one miss |

These are starting values, to be calibrated against real exported logs when there are some (docs/DECISIONS.md, open questions); the point is the *shape*: reading before spelling, and spelling settling over units, not days.

### 3.2 What a miss looks like

When a persona misses, it misses the way Year 1–2 children do (sw-y1y2 §8):
- **A spelling miss** picks a **same-sound rival** on the bank or fan with probability 0.7 (weighted by the rival's frequency: < ay > before < eigh >), else a wrong-sound tile. This makes spelling-choice accuracy measurable.
- **A reading miss** gives the other sound of a spelling with several sounds (< ea > as /ee/ in *great*), or a letter name, or says a two-letter spelling as two sounds.
- **Long words:** a schwa slip (*multuply*) with probability 0.2 in Year 1 and 0.1 in Year 2, halved after the child has heard the word in the spelling voice; a dropped syllable in words of four or more syllables with probability 0.05 in Year 1; a split that cuts a spelling in two (*bot|tle*) with probability 0.05 at syllable level.
- **Syllable count** at syllable level: right with probability 0.9 for two syllables, 0.8 for three, 0.65 for four or more (y1); y2 +0.05.
- **Guessing** (y1-struggling, and y2-retake at half the rate): when p is below 0.5, it taps the fan or bank within 0.6 s, and again within 0.6 s after a miss, up to three taps.

### 3.3 Sessions

Each persona plays **15–20 minutes a day** (y1-keen 20, y1-struggling 12), five days a week (y1-keen seven), as the planner schedules them: the weekly scroll first if there is one, then the day's stones and practice. It leaves at the planner's session end.

### 3.4 Simulated days (`days.ts`, new)

`continuous.ts` plays one sitting. Pacing, the bridge, doors, lairs, rung growth and the weekly list only show up over days, so `days.ts` plays **N simulated days in one save**: it advances the core's clock (`src/core/kernel/time.ts`) and the device date between sessions, reloads the page as a returning child would, and plays each day's session with the persona. Output: a day-by-day transcript (`days-<persona>.md`) and a JSON of every metric per day.

```
bun scripts/treadmill/days.ts --persona y1-sept --from 2026-09-08 --days 14
bun scripts/treadmill/days.ts --persona y1-keen --from 2026-09-08 --days 70 --fast 4   # the pacing check
bun scripts/treadmill/days.ts --persona list-y1 --from 2026-09-28 --days 7
```

---

## 4. The metrics

Every run reports these per land and per persona, in `<runDir>/midgame/metrics.json` and a summary table. Targets are for the typical personas (y1-sept, y2-sept) unless a row says otherwise.

| Metric | What it counts | Target | Why |
|---|---|---|---|
| **First-try accuracy** | independent first tries right, over all scored items | **70–85%** per land | below is guessing or too hard; above is boredom (six-year-old judge) |
| **Spelling-choice accuracy** | first-try right on items with at least one same-sound rival on the bank or fan, by sound and by lag bucket (0–1, 2–3, 4–7, 8+ units since taught) | 65–85% overall; rising with the lag bucket | shows whether choice is tested where Sounds~Write expects it (four units back) |
| **Rival share of misses** | spelling misses that were a same-sound rival, not a wrong sound | over 60% from the Sky Isles on | the Extended Code's error is choice, not hearing |
| **Words of 3+ syllables practised** | distinct words of three or more syllables built or read, per week | Year 1: at least 5 a week from Moon Marsh; Year 2: at least 10 a week | Jonas's question, in numbers |
| **Long words by length** | words of 2, 3, 4 and 5+ syllables built, per land | every land has some; 4+ only from Dolphin Bay (Year 2) | the strand follows the checks |
| **Syllable accuracy** | first-try right per segment; split errors; schwa slips per 100 weak syllables | segments ≥ 80%; schwa slips falling within each land | Lessons 11–14 working |
| **Guessing taps** | choice taps within 700 ms of the options appearing, and repeated fast taps after a miss | under 5% of choice items (typical); reported for y1-struggling | guessing is the first failure of games like this (prior-art §7.1) |
| **Help rate and imp grabs** | items where Sensei helped; gems the imp grabbed per boss | typical: 0–2 grabs a boss | stakes without a losing screen |
| **Sensei's seconds per minute of play** | spoken seconds per minute, per land | falls from map to map (Island > Sky > Muddle) | Sensei's voice grows up (spec §3.0.4) |
| **Talk before the first action** | seconds of talk before the child's first action, on full, recap and short forms | full ≤ 12 s; recap and short ≤ 5 s | the six-year-old judge's limit |
| **Days per land** | practice days from a land's first stone to the next land's | own pace: 12–15; in step: the school's weeks | months, not weeks (y1-keen must not finish Year 1 in under 12 weeks of daily play) |
| **Days between boss-shaped moments** | days between a skirmish, boss, lair, rematch or minion raid | at most 7 | a boss-shaped moment about once a week |
| **New stones a day** | new stones opened per day, and new teaching stones | at most 3, and at most 2 teaching | spacing |
| **Weekly list** | minutes per day's scroll; the practice test's accuracy; words improved from day 1 to the test | 4–6 minutes; improvement on most words | five minutes a day that works |
| **Pure wins** | bosses where the knockout was the last scored item before the chest | 100% | a boss victory is a win |
| **[R3: Jonas, Baron final only]** **Baron fights before the end** | fights whose monster is `boss_baron` anywhere but the final battle; finales played after anything but the final battle's first win | 0 and 0 | Jonas: "the final, final battle with really hard words always" |
| **[R3: Jonas, Baron final only]** **Final battle difficulty** | the share of the final battle's scored items with Year 2 code (EC27–49) or 3+ syllables; its first-try accuracy for y2-sept | 100%; 60–80% (the one boss that may sit below the 70–85% band) | the last fight is the hardest |
| **Layout** | the sweep's findings at 844 × 390, 667 × 375 and 740 × 360; taps under 90 stage px (98 on 360-dp items); overlap with a perched boss | 0 | the phone |
| **Performance** | the soak's 29 budgets; fps in the Syllable Dragon; warm lists per level and per boss phase | all pass; median fps ≥ 50; ≤ 60 clips and 600 KB | PERF.md |

---

## 5. Transcript audits for the later levels (`midgame-audit.ts`, new)

Every transcript from `continuous.ts`, `transcript.ts` and `days.ts` goes through these rules. Each is a pass or fail with evidence (the transcript lines and, where it matters, the screenshot), in the treadmill's `Finding` shape.

| Rule | Checks | From |
|---|---|---|
| `lesson-6-no-choice` | a new unit's first dojo (Lesson 6) never offers a rival spelling; the word puzzle uses the word's own tiles | SW10 |
| `fan-after-peek` | the gem fan opens only after the word was shown and read in the same item | SW10 |
| `rival-lag` | every rival on an ordinary battle's bank was taught at least four units before the level's unit (`Level.sw`), unless the word was just peeked | SW2 |
| `boss-lag` | in a boss: Read-phase words use code up to U; Spell, spelling signatures and the Last word use code at least two sound units before U; the big attack's long word is 4–7 units back (or Units 18, 34, 35) | SW2 |
| `boss-signature-gems` | a spelling signature never shows more than three gems | SY3 |
| `boss-pure-win` | the knockout (the full stop) is the last scored item before the chest; the chest shows no grab | SY2 |
| `imp-cause` | every imp grab follows a help event on the same word, in the same item | SY2 |
| `misread-try-safe` | every wrong reading shown is not a real word and not a regional pronunciation (MULTI_SOUND §4.1's lists) | SW8 |
| `misread-per-map` | "who read it right" and Sound Detective are boss moves at most twice per map | SY4 |
| `alien-valid` | no alien item treats a valid sound of a spelling as the wrong reading; alien structures are CVC to CCCVC with only scr, spl, spr, str, shr, thr as three-consonant clusters | SW9 |
| `lesson-11-order` | for each long word at sound level: the word, the syllable count, then per syllable: said, built, read; then the slow read, the rabbit, "without the gap" | Lessons 11–12 |
| `syllable-level-gate` | syllable level only after at least 80% of the last 10 sound-level words; back to sound level after two misses in a word | spec §3.1 |
| `spelling-voice-alone` | the spelling-voice take never plays inside a sentence | SW §3.2 |
| `dictation-form` | a single dictated word is word, sentence, word; a homophone always has its sentence | SW-s3 |
| `concept-once` | on the Sky Isles a concept line ("It's two letters, but it's one sound", "A dojo is…") plays at most once per land for a school starter; on the Muddle Isles only after a mistake | SY7 |
| `talk-before-action` | the talk limits in §4 | SY7 |
| `banned-words` | the child never hears "tricky", "sight word", "special word(s)", "magic e", "silent letter", a spelling that "says" or "makes" a sound, or a letter name | SW-s4, TEACHER_SCRIPT §2 |
| `pure-sound-end` | a pure sound only at the end of a sentence | SW-s9 |
| `special-graduation` | a special word stays in Ninja Vanish until its last untaught part's unit, and graduates with its one line | SW-s6 |
| `tangential-not-dictated` | a tangential or met-early spelling never appears in dictation or as a rival before its formal unit | SW1 |
| `one-glow` | never two glowing things on a map screen (a door, a scroll or a lair is the glowing stone) | spec §1.6 |
| `door-caps` | doors at most one in three stones, never the session's first stone, never two in a row, at most two a day | spec §1.6 |
| `bridge-monotonic` | planks never decrease; at most one per practice day; own pace: the next land opens only with the boss beaten and the bridge built | SY1 |
| `weekly-budget` | the day's scroll lasts 4–6 minutes, ends on a success, and the practice test is on the day before the test day | spec §1.9.4 |
| `baron-final-only` | **[R3: Jonas, Baron final only]** no fight before the final battle has the Baron as its monster (`boss_baron`); before it he speaks only in cut-ins (an introduction, a taunt, an escape); the finale (`finale`, `baron_final`, `baron_sorry_*`) plays only after the final battle's first win; and the Baron's escape (`baron_trick_1`) at most once per save. Until Muddle Castle exists: no `boss_baron` fight at all | Jonas, spec §R.3 |
| `final-battle-hard` | **[R3: Jonas, Baron final only]** every scored item of the final battle, first fight and rematch, uses Year 2 code (EC27–49) or has 3+ syllables, and none is a word an earlier boss used | spec §2.5.3, M38 |

The audits read `Level.sw`, the boss data (`bosses.ts`) and the content (`words.json`), so they need Slice 0; before it, `boss-lag` for the Sky Magpie reads a hand-written table for check 3 (U = EC4). **[R3: Jonas, Baron final only]** `baron-final-only` needs nothing but `worlds.ts` and the transcript, so it runs from the interim swap on, in `run.ts --quick` too.

---

## 6. Critic prompts that judge the challenge for age

`critic.ts` (Gemini, filmstrip contact sheets) gets three new prompts for Year 1–2 levels. Each is given the level's filmstrip, its transcript excerpt (what Sensei said and what the child did), and the level's facts (land, units, check, the words and their syllables). Each returns a score and problems in the existing `Review` shape; the critic re-checks each major claim against the full-resolution frame before reporting it, as today.

### 6.1 A six-year-old's eye

> You are judging a level of a phonics video game for a child aged 6 or 7 (Year 1 or Year 2 in England). You see a filmstrip of the level on a phone and what the teacher character said. Judge only what a six- or seven-year-old would feel.
> Score 1–10 for each: **challenge** (too easy, about right, too hard for this age, at this point in the year), **excitement** (would they want to play it again tomorrow?), **grown-up enough** (is anything babyish: lines, pictures, rewards, explanations they already know?), **clarity** (do they always know what to do without reading?), and, for a boss, **epic** (does it feel like a real boss fight with a clear verb, and is the win a pure win?).
> Flag every moment where: the story's villain fights the child with words far easier than the level's own (**[R3: Jonas, Baron final only]**); the child waits more than 5 seconds for talk on a replay; the child could guess instead of think (a fan of many gems for a word they met this week); a victory feels like a loss (something taken away as the prize appears); a line explains something a Year 1 child already knows ("A dojo is where ninjas practise"); the same joke or move is reused from an earlier boss.
> Say what one change would most improve it for a six-year-old.

### 6.2 A Sounds~Write Year 1–2 teacher

> You are a Year 1 and Year 2 teacher trained in Sounds~Write, reviewing a level of a phonics game that follows the official Sounds~Write order. You are given the level's Sounds~Write units, its progress check, its words and the teacher character's lines.
> Check, and flag with the exact frame and line: whether new spellings are first met by building words from their own tiles (Lesson 6) and only then chosen after the word is read (Lesson 7); whether a boss reads code up to its check's unit and dictates only code at least two sound units before it; whether long words follow Lessons 11–14 (the teacher gives the syllable count at sound level; each syllable is said, built and read; the word is read slowly then fast; "without the gap"); whether the spelling voice is used for weak syllables and only for a word on its own; whether corrections use Sounds~Write's language ("This is a way of spelling /er/, but in this word we need this spelling"; "Let's say it again, precisely in its syllables"); whether any line uses letter names, says a spelling "says" or "makes" a sound, talks about rules, "magic e", "silent letters", "tricky" or "sight words"; whether a pure sound appears only at the end of a sentence; whether a wrong reading shown to the child is a real word or a regional pronunciation.
> Then judge the challenge: is this the right difficulty for a child at this point in Year 1 or Year 2, taught by Sounds~Write at the official pace? Score 1–10 for faithfulness and 1–10 for challenge, and name the single most important fix.

### 6.3 The challenge calibrator

> You are calibrating difficulty. You are given, for one land: its units and check; the persona runs' metrics (first-try accuracy, spelling-choice accuracy by lag, rival share of misses, syllable accuracy, schwa slips, guessing taps, help rate, imp grabs, days in the land); and the expected ranges (first-try 70–85%, choice 65–85% rising with the lag, guessing under 5%).
> Say whether each persona's challenge is too easy, right or too hard, and why, from the numbers. Point to the items or phases that pull a number out of range (a boss phase with 40% first try; a Gem Choice stone where the struggling persona guessed on every word). Propose at most three changes to content or config (rival counts, the lag, the number of teaching stones, the rung thresholds), each with the metric it should move. Never propose adding a timer, a leaderboard or a reward for help.

---

## 7. Runs

| Run | When | What it plays | Time |
|---|---|---|---|
| `run.ts --quick` | every change | one level of each kind, including `dragon` and a boss with phases | 1–2 min |
| `run.ts --midgame` (new flag) | every slice's acceptance, and nightly | the sweep at three phone sizes over every Year 1–2 level; `midgame-audit.ts` over a continuous run of y1-sept and y2-sept; the critic's three prompts over the new levels; the geometry harness | 20–30 min |
| `days.ts` fortnight | nightly once Slice 0 lands | y1-sept, y1-jan, y1-struggling and list-y1 over 14 days | about 40 min at `--fast 4` |
| `days.ts` term | weekly, and before shipping a land | y1-keen over 70 days (the pacing check), y2-sept over 35 | about 2 h |
| `run.ts --personas` | before a release | the Codex personas, including Ms Patel Year 1–2, Oscar 7 and the Year 1 parent | 30–60 min |
| `soak.ts --mobile --cpu 4` | every slice | the soak with the new levels in its list | 25 min |

---

## 8. Real children

Bots can't tell us whether a six-year-old loves it. When a slice ships, the most useful playtest is Jonas's own children at home, with no questions asked of Jonas: the game already exports logs by hand (docs/DECISIONS.md), and the grown-ups' export gives the same metrics as §4. What to look for in a log or a video, in order:
1. The first-try band per land (70–85%).
2. Fast repeated taps on the gem fan (guessing).
3. The seconds of Sensei before the first action on a replay.
4. Whether they come back the next day unprompted, and to what (the scroll, the bridge, an egg to hatch).
5. Whether the boss's knockout is the last thing on screen before the chest.

The first real exported logs also calibrate §3.1's parameters.

---

## 9. Decisions made here (for docs/DECISIONS.md at integration)

| # | Decision | Why |
|---|---|---|
| PT1 | Bot accuracy depends on units since teaching, with reading settling in about a unit and spelling in 5–7 | the shape Sounds~Write describes; it makes the lags testable |
| PT2 | A spelling miss picks a same-sound rival 70% of the time | the Extended Code's commonest error; it makes spelling-choice accuracy measurable |
| PT3 | `days.ts` simulates days in one save with the core's clock | pacing, bridges, doors and the weekly list only show up over days |
| PT4 | First-try accuracy's target band is 70–85% per land | the six-year-old judge's band: below is guessing, above is boredom |
| PT5 | The Codex teacher persona is a Year 1–2 Sounds~Write teacher, separate from the Reception one | the checks differ (lags, long words, spelling choice) |
| PT6 | **[R3: Jonas, Baron final only]** `baron-final-only` runs from the interim swap on, in every run, and fails the release | the one story rule Jonas set by hand; cheap to check |
