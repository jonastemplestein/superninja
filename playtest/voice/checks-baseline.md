# The teacher's-voice checks: today's baseline

**27 September 2026, the fix plan's checks lane (F4), teacher's-voice foundation.** This is what the new checks measure on today's build, against the targets in [FIX_PLAN_PERF_SCRIPT_SOUNDS.md](../../docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md) §11.2 (the SCRIPT_FIXES rows and the teacher's voice rows) and §11.3. Every new `--check` fails on today's build, and it fails on the things Jonas complained about, by name.

Today's build is a frozen copy of the tree at 01:26 BST (`bunx vite build`, served by `vite preview` on 127.0.0.1:4603). The perf workflow's `audio.ts` sound-job fields (§3.1) were already in it, and F2's teacher-voice lines were in `lines.ts` as text, unrecorded. No scene uses them yet.

## In short

| Jonas said | The check that catches it | Today | Target |
|---|---|---|---|
| "It just says, A, two letters, one sound, A, two letters, one sound" | `letters-lines` (C6-P), `letters-60s`, `letters-echo`, `letters-twice` | **35** letters lines in the Sky Temple run; the same one twice within 60 s **22** times; **3** echoes ("/ae/ It's two letters… /ae/ It's two letters…" in one breath) | ≤ 12; 0; 0 |
| "weird shouted, listen … in the first dojo level where it just starts with this" | `first-dojo-opening`, `bare-listen` | w2-1 opens: ‹dojo_hello› "This is the dojo… Let's practise some sounds." · ‹listen› "Listen..." /b/ /b/. **4** bare "Listen…" in w2-1: after `dojo_hello`, then after "Super!", "Ace!", "Amazing!" | opens with `tv_learn_frame_<n>`, `tv_learn_how` and the Ready hold; 0 |
| "this extremely abbreviated way of talking" | `bare-command`, `shouted-instruction`, `turn-median` | **39** bare commands said in the first session to w2-1 ("Watch me first!" ×13, "Find this sound…" ×6, "Listen…" ×4, "Now you try!", "Spell…"); **57** instructions ending in "!"; the median line is 4 words | 0; 0; a median turn of 8–25 words |
| "Teachers explain what they're doing … I will show you this, and you will do that. Do you want to give it a go now?" | `unframed-turn`, `demo-command`, `rhetorical-question` | **21 of 21** games met before w2-1 have no frame, no narrated demo, no Ready hold and no hand-over; **14** instructions said to the child during Sensei's own demo ("Let me show you! · Tap the sun!"); **45** questions nobody can answer | 0 missing; 0; 0 |
| Round 13: "too long and boring" | `talk-before-action` | **29.9 s** of talk before the child can act in w1-4 (the listener measured 31.4 s); **8** first-meeting runs over 12 s | ≤ 12 s at age 3 (12.5 s for TEACHER_SCRIPT §6's five named runs) |

And the sound display (§11.3): `sound-display --check` fails today on exactly the places §5.4 names (the reward's "You won back some sounds!", Find's "That's… /g/", < x >, < th > and the w5-6 reminder), and `sweep --petals` finds the apple beside /a/ in w1-3 and the pig beside /p/ in w1-10.

The existing sweep and bot are unchanged by default: `sweep.ts --par 3` on six cases finished 6/6 with 0 findings in 90 s both before and after (per case within a second).

## How to run the checks

```sh
bunx vite build --outDir playtest/runs/voice/.build-checks --emptyOutDir
bunx vite preview --outDir playtest/runs/voice/.build-checks --port 4603 --strictPort --host 127.0.0.1
# the transcripts: a fresh child to w2-1, the Shadow Castle and the Sky Temple, and the splitter
bun scripts/treadmill/continuous.ts --base http://127.0.0.1:4603 --persona perfect,learner --levels 19 --out <dir>
bun scripts/treadmill/continuous.ts --base http://127.0.0.1:4603 --persona perfect,learner --from w5-1 --levels 12 --out <dir>
bun scripts/treadmill/continuous.ts --base http://127.0.0.1:4603 --persona perfect,learner --from w6-br1 --levels 13 --out <dir>
bun scripts/treadmill/continuous.ts --base http://127.0.0.1:4603 --persona splitter --from w5-1 --levels 8 --out <dir>
bun scripts/treadmill/script-audit.ts <dir>/continuous-*.json --check --findings <run>/script.json --metrics <run>/metrics.json --out <run>/script-audit.md
bun scripts/treadmill/sound-display.ts --base http://127.0.0.1:4603 --only w2-1,w3-6,w5-1,w5-6 --check --findings <run>/sound.json --out <run>/sound
bun scripts/treadmill/sweep.ts --base http://127.0.0.1:4603 --petals --only w1-3,w1-10,w2-1,w3-6 --run <run>
```

Each `--check` prints a table, exits 1 when a target fails and writes treadmill findings (`script:<metric>`, `sound:<metric>`), which `inbox.ts` now reads (`script.json`, `sound.json`, `soak.json` beside `sweep.json`). A metric is **n/a** when a transcript can't show it (no w2-1 in a Shadow Castle run, no splitter taps, no Ready holds yet): n/a never fails.

## The script checks on today's build

C-P and C-L: a brand-new child ("not at school yet", so age 3 and 12 s), from the title to w2-1 (19 stones). C5 and C6: a child who has done everything before w5-1 or w6-br1 (continuous.ts starts them as Reception, so 15 s). C5-S: the splitter from w5-1. Bold is a fail. Full detail: [checks/script-check-today.md](checks/script-check-today.md); findings: [checks/script-findings-today.json](checks/script-findings-today.json); transcripts: `playtest/runs/voice/baseline/transcripts/` (git-ignored).

| Metric | Target | C-P | C-L | C5-P | C5-L | C6-P | C6-L | C5-S |
|---|---|---|---|---|---|---|---|---|
| `letters-lines` | ≤ 12 (C6-P only; info here) | n/a | n/a | n/a | n/a | **35** | n/a | n/a |
| `letters-60s` | 0 | 0 | 0 | **11** | **9** | **22** | **18** | **8** |
| `letters-twice` | 0 | 0 sounds | n/a | **4 sounds** | n/a | **7 sounds** | n/a | n/a |
| `letters-echo` | 0 | 0 | 0 | 0 | 0 | **3** | **2** | 0 |
| `same-sound-after-reveal` | 0 | 0 | 0 | **2** | **2** | **4** | **4** | **2** |
| `world-welcomes` | ≤ 1 per land | **world_1 ×14, world_2 ×4** | **world_1 ×17, world_2 ×2** | **world_5 ×10, world_6 ×2** | **world_5 ×10, world_6 ×2** | **world_6 ×13** | **world_6 ×13** | **world_5 ×8** |
| `did-it-after-praise` | 0 | **15** | **13** | **10** | **10** | **12** | **12** | **7** |
| `jump-offers` | ≤ 0 (day one) | **15** | **1** | **12** | 0 | 1 | 1 | **4** |
| `speaker-tip` | ≤ 2, 0 cut | 0 (0 cut) | **4 (4 cut)** | 0 (0 cut) | **10 (10 cut)** | 0 (0 cut) | **8 (8 cut)** | **10 (10 cut)** |
| `map-hint-cut` | 0 | **15 of 19** | **17 of 20** | **1 of 2** | **1 of 2** | **1 of 2** | **1 of 2** | **1 of 2** |
| `over-map` | 0 | **7** | **9** | **5** | **4** | **6** | **7** | **4** |
| `how-we-spell` | once per spelling per level | **16 (7 repeats)** | **16 (7 repeats)** | n/a | n/a | n/a | n/a | n/a |
| `swap-place-heard` | all | **1 of 6** | **1 of 6** | **0 of 4** | **0 of 6** | n/a | n/a | **0 of 6** |
| `praise-rate` | ≤ 1.5 | **2.48** | **2.45** | **3.80** | **3.41** | **3.34** | **3.26** | **3.96** |
| `praise-stacks` | 0 | **19** | **22** | **20** | **20** | **17** | **20** | **18** |
| `line-60s` | 0 | **14 lines** | **18 lines** | **15 lines** | **13 lines** | **4 lines** | **3 lines** | **12 lines** |
| `cut-explanations` | 0 | **20** | **26** | **5** | **17** | **1** | **9** | **17** |
| `split-correction` | 100% | n/a | n/a | n/a | n/a | n/a | n/a | **0 of 4 (0%)** |
| `master-early` | 0 | n/a | 0 of 4 | 0 of 1 | 0 of 2 | 0 of 1 | 0 of 5 | 0 of 1 |
| `unframed-turn` | 0 missing | **21 of 21 games** | **22 of 22 games** | **1 of 1 games** | **1 of 1 games** | **1 of 1 games** | **1 of 1 games** | n/a |
| `over-framed` | 0 | **14** | **17** | **4** | **4** | **1** | **1** | **3** |
| `bare-command` | 0 | **39 said (12 lines)** | **53 said (13 lines)** | **14 said (2 lines)** | **22 said (2 lines)** | **9 said (2 lines)** | **12 said (2 lines)** | **13 said (2 lines)** |
| `bare-listen` | 0 | **4 (4 in w2-1); 1 after quiet or before the level's first tap** | **4 (4 in w2-1); 1 after quiet or before the level's first tap** | **11; 3 after quiet or before the level's first tap** | **12; 4 after quiet or before the level's first tap** | **8; 4 after quiet or before the level's first tap** | **8; 4 after quiet or before the level's first tap** | **11; 3 after quiet or before the level's first tap** |
| `talk-before-action` | ≤ 12 s (named runs 12.5 s) | **max 29.9 s (build w1-4); 8 over** | **max 29.9 s (build w1-4); 11 over** | max 14.4 s (sort w6-br1); 0 over | max 14.5 s (sort w6-br1); 0 over | **max 17.5 s (sort w6-br1); 1 over** | **max 17.6 s (sort w6-br1); 1 over** | n/a |
| `turn-median` | 8–25 words | 9 words (median line 4 words; 167 turns) | 10 words (median line 4 words; 210 turns) | **7 words (median line 4 words; 134 turns)** | **7 words (median line 5 words; 155 turns)** | **7 words (median line 6 words; 106 turns)** | **7 words (median line 7 words; 121 turns)** | 8 words (median line 4 words; 105 turns) |
| `rhetorical-question` | 0 | **45 said (6 lines)** | **33 said (6 lines)** | **14 said (2 lines)** | **2 said (1 lines)** | **2 said (2 lines)** | **2 said (2 lines)** | **6 said (2 lines)** |
| `shouted-instruction` | 0 | **57 said (29 lines)** | **58 said (30 lines)** | **19 said (6 lines)** | **19 said (6 lines)** | **13 said (6 lines)** | **13 said (6 lines)** | **17 said (5 lines)** |
| `demo-command` | 0 | **14** | **15** | 0 | 0 | 0 | 0 | 0 |
| `first-dojo-opening` | yes | **no** | **no** | n/a | n/a | n/a | n/a | n/a |
| `ready-auto-advance` | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| `watcher-replay` | all | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| `handover-once` | 0 re-asked | n/a | n/a | n/a | n/a | n/a | n/a | n/a |

Notes on today's numbers:
- **The first meetings, game by game** (`unframed-turn`): every game fails every part. W1's Ninja Ears opens "Ninja ears on! Let's listen to some words." then names the pictures; the rabbit and the tortoise open "Watch me first!"; Pocket Hunt opens on picture names; Word Building opens "This word has two sounds!" · "Watch me first!". In C5 and C6 the one new game is Sorting (w6-br1): its frame line is there (`audit_bridging_first`, which F2's registry counts as the frame), but it has no narrated demo and no Ready.
- **The runs of talk** (`talk-before-action`) over 12 s in C-P: Word Building 29.9 s, Sound Hunt 26.3 s, First Sounds 23.4 s and 20.5 s, the rabbit and the tortoise 15.5 s, Word Squish 15.3 s. They start at the first line after a tap the game registered (a tile tapped while the scene is busy doesn't count: the bot taps tiles during a demo) and end where the line that cues the child's next tap starts.
- **The splitter** split four times (< s > for < sh > three times, < h > for < ch >) and every time heard "Listen again… What do you hear here?" or "Let's listen again. What sound comes next?", never "That's /s/. We need /sh/. It's two letters, but it's one sound." (`split-correction` 0 of 4). It only splits where the bank offers a single letter inside the spelling (`tileBank` offers < s > for < sh >, never < t > or < h > for < th >).
- **`turn-median` passes for the fresh child** (9 and 10 words). With the bot's ignored taps left out, a first session's turns are long, not short: the talk is abbreviated line by line (the median line is 4 words), not turn by turn. It fails in the Shadow Castle and the Sky Temple (7 words).
- **`over-map`** is now measured in the page: a level's line that starts while the map, or App's fade from it, is still on screen (7 in C-P). The route flips to the level on the stone tap, so the plan's "while `__snRoute` is still the map" would never fire; Dec5 (the level waits for the fade) is what fixes it.
- **Not failing today:** `master-early` is a proxy (below) and doesn't fire on these runs; `speaker-tip` passes for the perfect child, who answers before the tip is cut (the learner fails it: 10 of 10 cut in C5-L); `turn-median` passes for the fresh child (above).

## The same checks on the transcripts of 26 September

The script editor's runs (`playtest/transcripts/2026-09-26-script-editor/`) and the teacher-voice listener's run to w2-1 (`playtest/runs/teacher-voice/run-a/events.json`). They were recorded before continuous.ts recorded games, turns, holds and busy taps: games come from the scene (warm-up beats only where the listener logged them), and every tap counts, so their runs of talk can only come out shorter than the child heard them. Detail: [checks/script-check-0926.md](checks/script-check-0926.md).

| Metric | Target | C-P | C-L | C5-P | C5-L | C6-P | C6-L | C-L (listener, to w2-1) |
|---|---|---|---|---|---|---|---|---|
| `letters-lines` | ≤ 12 (C6-P only; info here) | n/a | n/a | n/a | n/a | **34** | n/a | n/a |
| `letters-60s` | 0 | 0 | 0 | **14** | **8** | **20** | **19** | 0 |
| `letters-twice` | 0 | 0 sounds | n/a | **7 sounds** | n/a | **7 sounds** | n/a | n/a |
| `letters-echo` | 0 | 0 | 0 | 0 | 0 | **2** | **1** | 0 |
| `same-sound-after-reveal` | 0 | 0 | 0 | **2** | **2** | **4** | **4** | 0 |
| `world-welcomes` | ≤ 1 per land | **world_1 ×11** | **world_1 ×12** | **world_5 ×10, world_6 ×2** | **world_5 ×10, world_6 ×2** | **world_6 ×13** | **world_6 ×13** | **world_1 ×17, world_2 ×2** |
| `did-it-after-praise` | 0 | **10** | **8** | **10** | **10** | **12** | **12** | **14** |
| `jump-offers` | ≤ 0 (day one) | **8** | **1** | **12** | 0 | 1 | 1 | **1** |
| `speaker-tip` | ≤ 2, 0 cut | 0 (0 cut) | 0 (0 cut) | 0 (0 cut) | **10 (10 cut)** | 0 (0 cut) | **8 (8 cut)** | **4 (4 cut)** |
| `map-hint-cut` | 0 | **9 of 12** | **10 of 13** | **1 of 2** | **1 of 2** | **1 of 2** | **1 of 2** | **17 of 20** |
| `over-map` | 0 | **4** | **5** | **6** | **5** | **7** | **6** | **3** |
| `how-we-spell` | once per spelling per level | **16 (7 repeats)** | **10 (4 repeats)** | n/a | n/a | n/a | n/a | **16 (7 repeats)** |
| `swap-place-heard` | all | **0 of 3** | **0 of 3** | **0 of 4** | **0 of 4** | n/a | n/a | **0 of 6** |
| `praise-rate` | ≤ 1.5 | **2.11** | **1.93** | **3.76** | **3.48** | **3.32** | **3.21** | **2.69** |
| `praise-stacks` | 0 | **11** | **10** | **20** | **24** | **17** | **20** | **23** |
| `line-60s` | 0 | **6 lines** | **7 lines** | **13 lines** | **14 lines** | **5 lines** | **4 lines** | **19 lines** |
| `cut-explanations` | 0 | **12** | **13** | **5** | **15** | **1** | **9** | **27** |
| `split-correction` | 100% | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| `master-early` | 0 | n/a | 0 of 2 | **1 of 1** | 0 of 3 | 0 of 1 | **1 of 4** | 0 of 4 |
| `unframed-turn` | 0 missing | **7 of 7 games** | **7 of 7 games** | **1 of 1 games** | **1 of 1 games** | **1 of 1 games** | **1 of 1 games** | **21 of 21 games** |
| `over-framed` | 0 | **9** | **11** | **4** | **4** | **1** | **1** | **17** |
| `bare-command` | 0 | **32 said (10 lines)** | **31 said (10 lines)** | **14 said (2 lines)** | **21 said (2 lines)** | **9 said (2 lines)** | **16 said (2 lines)** | **57 said (13 lines)** |
| `bare-listen` | 0 | 0; 0 after quiet or before the level's first tap | 0; 0 after quiet or before the level's first tap | **11; 3 after quiet or before the level's first tap** | **15; 7 after quiet or before the level's first tap** | **8; 4 after quiet or before the level's first tap** | **13; 9 after quiet or before the level's first tap** | **4 (4 in w2-1); 1 after quiet or before the level's first tap** |
| `talk-before-action` | ≤ 12 s (named runs 12.5 s) | **max 14.5 s (build w1-4); 1 over** | **max 17.9 s (build w1-4); 2 over** | max 14.4 s (sort w6-br1); 0 over | max 14.5 s (sort w6-br1); 0 over | **max 17.6 s (sort w6-br1); 1 over** | **max 17.6 s (sort w6-br1); 1 over** | **max 23.4 s (soundhunt w1-7); 8 over** |
| `turn-median` | 8–25 words | **5 words (median line 4 words; 230 turns)** | **7 words (median line 4 words; 180 turns)** | **6 words (median line 4 words; 155 turns)** | **7 words (median line 5 words; 173 turns)** | **7 words (median line 7 words; 106 turns)** | **7 words (median line 7 words; 116 turns)** | **6 words (median line 4 words; 293 turns)** |
| `rhetorical-question` | 0 | **27 said (7 lines)** | **16 said (7 lines)** | **14 said (2 lines)** | **2 said (1 lines)** | **2 said (2 lines)** | **2 said (2 lines)** | **35 said (8 lines)** |
| `shouted-instruction` | 0 | **66 said (28 lines)** | **62 said (30 lines)** | **22 said (7 lines)** | **23 said (8 lines)** | **20 said (8 lines)** | **19 said (8 lines)** | **92 said (36 lines)** |
| `demo-command` | 0 | **5** | **5** | 0 | 0 | 0 | 0 | **6** |
| `first-dojo-opening` | yes | n/a | n/a | n/a | n/a | n/a | n/a | **no** |
| `ready-auto-advance` | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| `watcher-replay` | all | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| `handover-once` | 0 re-asked | n/a | n/a | n/a | n/a | n/a | n/a | n/a |

A journey (transcript.ts, one fresh page per level) of w1-wu1 and w2-1 from today's build gives the same w2-1 verdicts: [checks/script-check-journey-w2-1.md](checks/script-check-journey-w2-1.md).

## The sound display check

`sound-display.ts --check`, w2-1, w3-6, w5-1 and w5-6, both personas, 844×390: [checks/sound-check-today.md](checks/sound-check-today.md).

| Metric | Target | Today |
|---|---|---|
| `petal-visible`: "petal" clips with their petal visible as they start (50 ms grace) | 100 % | n/a: no scene gives a sound the "petal" job yet |
| `petal-for-hidden`: "hidden" clips with their petal visible | 0 % | n/a: no "hidden" sounds yet |
| `unclassified`: sounds with no job (§3.1) | 0 | **360 of 484** (blends are already "tile") |
| `talk-without-petal`: "You won back…" and two-letter lines with no petal, and no "petal" sound right after | 0 | **11 of 29** |
| `petal-picture-size` (report only) | ≥ 38 CSS px | smallest 30 px: the nav-row petal, 49 CSS px wide (F3.6 makes it 104 stage px) |

Of the unclassified sounds, 66 would show no petal once `DEFAULT_SHOW` is "petal" (plan I.1). The check names each place, and the five §5.4 names are all there: **r58** the reward's "You won back some sounds!" (w2-1, w3-6, w5-1, w5-6), **r23** Find's wrong tile ("That's… /g/", w2-1; /o/ and /ks/, w3-6), **r19** < x > (w3-6: /k/ plays with no /k/ petal), **r20** < th > (w5-1: /th/ after "The same spelling can sometimes be…"), **r28** the w5-6 read-back's "It's two letters, but it's one sound." Most of the rest are tile voices in Build (they need the "tile" job, D1.11).

## The sweep's petal invariants (`--petals`)

[checks/sweep.md](checks/sweep.md). On w1-3, w1-10, w2-1 and w3-6, all minor until integration: **petal-giveaway** 2 (the apple card beside /a/ in w1-3, the pig beside /p/ in w1-10: SOUND_DISPLAY A12, C1.6), **petal-too-small** 9 (the nav row's 30 px pictures), **sound-unclassified** 47, and 0 of **sound-without-petal** and **petal-for-hidden**, because no sound has the "petal" or "hidden" job yet. They start counting as the scene lanes give sounds their jobs.

## The bots

- **The default child** is unchanged: 6/6 and 0 findings before and after on w1-wu1, w1-2, w1-4, w1-6, w1-8 and w2-1.
- **The watcher** and **the hand-over tap** need Ready holds, which F3 hasn't built yet (`holdReady` isn't in `nav.tsx`). Tested on a synthetic page: at a Ready (`__snNav.pres.id` "ready:…") the watcher taps the paw once, then ▶; the default child answers the 1st, 4th, 7th… hand-over Ready with the right answer and the others with ▶; a plain Ready and every ordinary held step still get ▶. `script-audit --check` has `watcher-replay` (the paw's replay ends on "Are you ready to have a go now?" and a hold that waits) and `handover-once` (a Ready answered on the board isn't asked again) ready for when they exist.
- **The splitter** is a learner's pace with no random mistakes: on the first try of a slot whose spelling has two or more letters (build, battle, the swap's pick), it taps a single-letter tile that is part of it, then waits 6 game seconds for the correction. 4 splits in 8 stones from w5-1 (the plan asks for at least 3 in 6).

## What each teacher's-voice metric measures

| Metric | A failure is |
|---|---|
| `unframed-turn` | a game met for the first time (a fresh child: every game; a `--from` child: games TEACHER_SCRIPT §2.6 first meets at or after the start) that lacks, in order: a frame line, a narrated demo (for the games with one), a Ready hold (a `ready:` hold in the transcript, not just the line) and a hand-over. The lines come from TEACHER_SCRIPT §4.1, joined at run time by F2's `src/content/games.ts` |
| `over-framed` | a full-form frame line (or one of today's openers) said again in the same session, or a full frame to a `--from` child for a game it already knows |
| `bare-command` | a Sensei line under 4 words that is an instruction: an order verb first ("Tap…", "Listen…", "Spell…", "Watch…"), or a bare label ("Your turn!", "Now you try!", "Last one!"). Praise and streak lines are exempt |
| `bare-listen` | the one-word "Listen…" anywhere but inside a correction, an idle re-ask or Help (mechanics §7.4) |
| `talk-before-action` | a first meeting's run of Sensei's talk over the age band's limit (12 s at 3, 15 s at 4, 18 s at 5; the five runs TEACHER_SCRIPT §6 names: 12.5 s) |
| `turn-median` | the median words Sensei says between two taps the game registered, in the levels, outside 8–25 |
| `rhetorical-question` | a "?" the child can't answer: mid-line with no way to answer after it ("Did you notice? Sun and sock…"), or at the end of a line Sensei talks straight past |
| `shouted-instruction` | an instruction ending in "!" ("off we go!", "Let's…!" and celebrations are exempt) |
| `demo-command` | an instruction or a question addressed to the child during Sensei's demo (from a show label or a teacher-voice demo line to the child's next tap, the "your turn" or the Ready); join-ins ("Tap it, and hear the word.", "Can you find the last one?") are exempt |
| `first-dojo-opening` | w2-1's first line isn't `tv_learn_frame_<n>`, or `tv_learn_how` and the Ready hold don't come before the first sound |
| `fast-line` | a recorded `tv_` sentence line faster than 3.3 words a second. n/a today: 385 `tv_` lines are in `lines.ts`, none recorded |

**No false alarms on the target script:** every one of the 385 `tv_` lines in `lines.ts` and TEACHER_SCRIPT §7.2's 22 new texts passes `bare-command`, `shouted-instruction` and the mid-line `rhetorical-question` rule. The one hit, "Keep going, ninja." (`streak_lost`), is a streak line and exempt in the real check.

## Limits

- **Games from older transcripts** come from the scene: the 26 September runs can't split a warm-up into its beats, so W1–W6 aren't in their `unframed-turn`.
- **`letters-twice`** keys a letters line by the sound said beside it, so two two-letter spellings of one sound taught far apart in one session would count as one spelling told twice.
- **`master-early`** ("You're a ninja master!" before 7 whole answers) counts finished words and questions as answers until the streak publishes its own (a request below).
- **`over-map`** in older transcripts uses the moment the harness saw the level (it polls, so a little late); new transcripts record it in the page.
