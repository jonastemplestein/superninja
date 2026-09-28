# Judge: can it be built well on a phone?

**27 September 2026. One judge, one lens.** Can [MIDGAME_ENDGAME.md](../MIDGAME_ENDGAME.md) be built well on a phone held landscape (844 × 390) with this codebase (`src/scenes`, `src/content`), within the budgets in [PERF.md](../PERF.md), with the art and audio pipeline, and with the templated-speech plan in [SPEECH_TEMPLATES.md](../SPEECH_TEMPLATES.md)? And what is the smallest first slice that proves it?

Read: the design, the three research reports in this folder, PERF.md, SPEECH_TEMPLATES.md, and the code it touches (`worlds.ts`, `phonics.ts`, `learner.ts` `tileBank()`, `Battle.tsx` layout and `rowFit()`, `Dojo.tsx`, `ReadSlider.tsx`, `ui.tsx` `Stage`, `nav.tsx` `NAV_SLOTS`, `flower.ts`, `store.ts`, `templates.ts`, `src/core`, the unit files and `public/a/`). Measured on production and by read-only scripts. The evidence is in `playtest/runs/midgame/judge-feasible/` (git-ignored): `scale.ts`/`scale.txt`, `fit.ts`/`fit.txt` and `sentences.ts`/`sentences.txt`. No game code was changed.

---

## 0. The verdict

1. **Yes, it can be built, and the core of it fits this codebase well.** The carriage row, rival spellings, the gold bracket and the tortoise-and-rabbit reading all reuse parts that exist: `Tile`, the slot row, `rowFit()`, `ReadSlider`, the pure sounds (including /sh/, /zh/ and schwa), `gen-slow-words.ts` and `fly()`. The Syllable Train (§3.1) is the best-specified thing in the design.
2. **But as written it is about the size of the whole game again.** Today's scenes are about 25,000 lines. The design adds about 14 new game scenes or modes, a boss-phase framework with 17 signature moves, three overworld maps and an Atlas, catch-up, rungs, belts, cards and the weekly list. That is roughly 20,000–25,000 more lines, about 650 new pictures and about 6,000 new TTS clips. Money and render time are not the constraint (under $10 and under 5 hours of rendering). The constraints are review time, Jonas's ear and code that other workflows are editing at the same time.
3. **Three foundations are missing, and the build order doesn't list them.**
   - The scenes still read only `phonics.ts`: 411 words in legacy units 1–12.
   - `src/core` has no planner (types and config only).
   - World numbers are positional.

   Everything from §1.5 on (assumed knowledge, catch-up doors, gems coming home, rungs, belts, the weekly list) needs the first two.
4. **The phone arithmetic is off.** The design uses a stage scale of 0.54. On production it is **0.492 at 844 × 390, 0.471 at 667 × 375 and 0.45 at 740 × 360**, so 44 CSS px needs 90–98 stage px, not 81. Rival banks with long spellings, the "full bank" at R4, a boss with a train, the 1.3× read-back and 9-word sentences all overflow or shrink below tap size (§2).
5. **The smallest slice that proves it is small** (§6): one Syllable Train stone of ten two-syllable words whose syllables are already recorded words, plus one rival tile in the Sky Temple's battles. It needs one new scene, about 60 lines in `learner.ts`/`Battle.tsx`, about 30 new clips and no new pictures. It proves long words on a phone, spelling choice, the perf budgets and templated speech together, and it gives the site two honest clips.

---

## 1. Scores

Scored through this lens only: can it be built well on the phone, in this code, within budget, with the pipeline, and how clearly does it tell a builder what to build.

### MIDGAME_ENDGAME.md

| § | Section | Score | Why |
|---|---|---:|---|
| 0 | The short version | 7 | Clear, honest answers to Jonas, and "we say so plainly" about -cian and -sion. It never says how big the whole thing is. |
| 1.1–1.4 | Maps, lands, targets, games per map | 6 | Lands are data (`WORLDS`), and the games-per-map table is a good scoping tool. But it has 13 new lands of 10–16 stones and 26 backgrounds, and inserting the Garden and the Rainbow Bridge renumbers every world (must-fix 1). |
| 1.5–1.8 | School entry, catch-up, placement, navigation | 4 | Good ideas, but this is the heaviest part. It depends on a ledger and planner that don't exist yet (`catchUp`, the assumed priors, `collected` events). It adds four new paintings and four journeys, the flower "shimmer" breaks PERF fix 9, and doors and lairs would reflow the path (must-fix 12). |
| 1.9 | The weekly word list | 6 | The link, the grown-ups' confirmation, the scroll and the §1.9.8 hooks are small and self-contained. "Coming by tomorrow" is a nightly ops system with teaching risk (must-fix 10). |
| 2 | Bosses | 5 | Boss = progress check, and the imp's lair gives a stake without a losing screen. Both are right and cheap. The design is expensive, though: 17 bespoke signature moves, 11 new speaking bosses with three poses each, and a 1.5× sprite standing where the train goes (must-fixes 4, 14, 15). The final battle breaks the audio warm budget (must-fix 11). |
| 3.0 | Shared parts: carriage row, slider, rungs | 6 | The carriage row is the right abstraction. Its numbers use 0.54, the read-back at 1.3× overflows, R4 is unbounded, and the rungs need the ledger (must-fixes 2, 3, 5). |
| 3.1 | Syllable Train | 8 | The best section. It has a layout with widths, the reuse of tiles and `rowFit()`, Sounds~Write's corrections as lines, a bot contract and a sweep at 844 × 390 and 667 × 375. The weak point is the audio plan for syllables (must-fix 8). |
| 3.2 | Gem Choice | 7 | A small `tileBank()` change with a big effect, and the correction line is already recorded. Two gaps: the rival count must come from `rowFit()`, and "That's the gem we need in {word}" is about 1,300 clips nobody counted (must-fixes 3, 7). |
| 3.3 | Special endings | 7 | Three tiles under a gold bracket works with today's `Tile`. Explicit `ti=sh` segs already parse, and the pure sounds exist. The Library content is later work, and the design says so. |
| 3.4 | Sound Detective, placed | 6 | Fine as placement. Sound Detective isn't built yet (only its gate in `Tree.tsx`), and eight bosses lean on it (the Magpie, Thunderbird, Hoot Owl, Scarecrow, Captain Parrot, Giant, Ghost Captain and the final battle). |
| 3.5 | Dictation Scroll | 6 | It reuses the carriage row. Every one of the 442 sentences in the unit files fits (the longest is 944 of 980 px), but the design's "6–9 words" for Year 2 doesn't, and a 30-sound sentence is 30 taps (must-fix 6). |
| 3.6 | Muddled Notes | 5 | The guard against misspellings sticking is sensible, but its research is cited from memory. It needs rungs R4–R5 to choose words, and the final battle's four-sentence letter at 64 px doesn't fit the 300 px note. Show one sentence at a time. |
| 3.7 | Sound Twins | 7 | A small scene with a layout that fits. It needs about 40 pair pictures. |
| 3.8 | Four smaller games | 5 | Seek the Sound and Speed Read are cheap. Alien Words "generated from the child's own code" can't be pre-rendered, and nonsense-word TTS has no gate (must-fix 9). Word Detective needs Sound Detective first. |
| 4 | Content, audio, art | 5 | The counts are honest and sourced (`quota-gap.txt`). But the audio table isn't reconciled with SPEECH_TEMPLATES, recording 600 isolated syllables is the riskiest audio in the design, and review time isn't counted (§4 below). |
| 5 | Retention | 6 | Belts and certificates are cheap and good. The Word Scroll needs a node budget (the World Flower is already at 29.7 % of the phone's main thread against a 30 % budget), and the calendar's cosmetics are more art. |
| 6 | What changes; the build order | 4 | The direction is right, and the rule that a claim ships with its slice is excellent. But Slice 1 bundles nine deliverables, and the build order has no slice for the content model, the planner or world keys (must-fixes 1, 16). |
| 7 | Decisions, open questions | 7 | Well logged and reversible. M13 (rungs) and M5–M7 (assumed knowledge, catch-up) should say they need the ledger. |
| | **Overall** | **6** | A buildable design whose best half should ship first, behind a small proof. |

### The research reports (usefulness to a builder)

| Report | Score | Why |
|---|---:|---|
| [audit.md](audit.md) | 9 | It was measured on production, and its code references were re-checked. The long-word simulation (`longword-sim.txt`) shows that *magician*, *division* and *station* already fit today's row (7 sounds) and only *multiplication* breaks it. Its P0 list is the right first build. |
| [sw-y1y2.md](sw-y1y2.md) | 8 | The lags, splits, schwa and special-ending coding are exactly what the data changes need, with source keys and brief quotes. |
| [prior-art.md](prior-art.md) | 7 | It is a strong source of mechanics (carriages, the ladder, belts), but says little about cost or the phone. Idea 4, a single "tion" tile, was rightly overruled. |

---

## 2. What was measured

| Check | Result | Evidence |
|---|---|---|
| The stage scale on production (`ui.tsx` `Stage`: touch insets 10 top and 26 bottom, so height is the binding side) | **0.4917** at 844 × 390, **0.4708** at 667 × 375, **0.45** at 740 × 360. 44 CSS px needs **90 / 94 / 98** stage px. The design says 0.54 and 81 | `scale.txt` |
| Rival banks through the game's own `rowFit()` (748 px between x 340 and 1100) | *rain* with < ay a > rivals: 104 px tiles, fits. *night* and *station*'s ending carriage: 104. *eight*: 96. *though*: 90. ***caught* with two /or/ rivals: 84 px = 41 CSS px**. **The Scarecrow's 7 /or/ gems as tiles: 84 px**. ***caught* at R4, "every /or/ spelling known" by the end of Year 2: 16 tiles, 1,660 px, overflows** | `fit.txt` |
| A boss sprite against the carriage rows | A 1.5× boss is 506 × 429 stage px at x 787–1293, y 145–574 (`monH = 286 × 1.5`, `monCx = 1040`, `MON_FEET = 574`). Row A (x 150–1130, y 96–196) and Row B (y 230–410) run through it | `Battle.tsx` |
| The read-back at 1.3× against `ReadSlider` | The play area is x 340–1110 and the rail x 400–985 at y 460. *multiplication*'s train (about 850 px) at 1.3× is 1,105 px. *fantastic* (about 590) fits at 1.3× | `ReadSlider.tsx` `RAIL`, `geoFor` |
| Dictation sentences in the unit files against Row A's 980 px | Reception 72, Year 1 192, Year 2 178. **None over**; the longest is 944 px ("The cook put a pot on the hob.", 8 words). A 9-word, 30-sound sentence would be about 1,340 px | `sentences.txt` |
| Syllables that are already recorded words | sun, set, up, cob, web, bed, bug, hot, dog, kid, nap, pig, pen, leg, sand, pit, desk and top all have `/a/w/` and `/a/x/` clips. zig, zag, lit, wam, meg, sect, tist, egg and stick don't | `public/a/w`, `public/a/x` |
| Long words with talking-voice audio | *sunset, zigzag, cobweb, fantastic, holiday, multiply, multiplication* exist; *magician* and *station* don't | `public/a/w` |
| Pure sounds for the special endings | /sh/, /zh/ and schwa exist in `/a/p/` (46 of 46) | `public/a/p` |
| What reads what | The scenes import `phonics.ts` only (411 words). `src/core/content/unit-data.ts` imports to EC26. `src/core` has no planner. Only `Early.tsx` and `store.ts` import the core (foundations) | `grep` |
| Bosses today | Only the Baron speaks (`public/a/l/baron_*`) and has poses. The island bosses are one sprite each (`mon_boss_*.webp`) | `public/a/` |

---

## 3. Must-fixes

In order of how badly each would hurt the build.

1. **Add Slice 0, the content model, before anything from §1.5 on.**
   - `Level.units: number[]`, `knownSpellings()`, `levelWords()`, `startFor()`, `MILESTONES`, `makeReview()` and `flower.ts`'s `Gem.unit` all use the legacy units 1–12 in `phonics.ts`.
   - Give levels `sw: SwUnitId[]` and give the scenes one word source over `units/*.ts` (IC, BR, EC1–49, PW1–9). Explicit `g=p` segs already parse, so `GRAPHEMES` can grow to the 174 pairs step by step.
   - Give worlds **stable keys**. `world_${w.id}` lines (`App.tsx:803`, `narrative.ts:236`), `WORLDS[l.world - 1]` and `L(world, n)` ids are all positional, so inserting the Garden and the Rainbow Bridge renumbers every land. Keep level ids append-only and order lands with an explicit list.
   - Say which shared files this touches (`worlds.ts`, `learner.ts`, `phonics.ts`, `flower.ts`, `gems.ts`, `progress.ts`, `App.tsx`), because other workflows are editing them.

2. **Use the real scale.** It is 0.49 at 844 × 390 and 0.45 on the smallest phone we allow. Write "nothing a child taps is under 90 stage px (98 on a 360-dp phone)". NAVIGATION.md already uses 100 for round controls. Recheck every size in §1.9.5, §3.0 and §3.2–§3.7 against it.

3. **Bound the bank by `rowFit()`, not by rung.**
   - Rivals are added in confusion order while `rowFit()` stays at 90 px or more, up to 7 tiles.
   - A spelling of four letters (< augh ough eigh >) costs about 1.5 tiles.
   - R4 is "no colour rims, and the child's own confusions on the bank", not "every spelling the child knows for those sounds" (16 tiles for *caught*).
   - Fan mode stays at 96 px discs, at most 7, which fits (x 340–1090).

4. **Give the boss a place to stand during train, dictation and note phases.**
   - It steps back to a perch at about 0.55× at the top right, beside the HP bar (x ≥ 1000, y ≤ 250), and the train's width limit drops to about 840 px.
   - Add the monster's box to the §3.1 sweep. Otherwise the Magpie's *sun·set*, every Sky and Muddle boss's big attack, and the final battle's letter draw over the monster.

5. **Read-back scale = min(1.3, 770 ÷ train width).** Put the train over `RAIL` (y 460), inside the slider's play area: *multiplication* at 0.9, *fantastic* at 1.3.
   - `RAIL` is a constant today. Ninja Vanish (slider at y 300–340) and Muddled Notes need it as a parameter, which is a small change to `geoFor()`.
   - For the first stone, a syllable can be a `"words"`-mode item (the item *sun* plays `/a/w/sun.mp3`), with a text plate in place of a picture. Then the slider needs no new mode.

6. **Cap dictation at 8 words and about 22 sounds**, or build only the one to three target words and pre-fill the rest as whole-word tiles. The first keeps every existing sentence. The second cuts a 30-tap item to about 10, which matters more for a 6-year-old than the pixels.

7. **Write the new speech as templates, and count it.** §3's word-slot lines use the old "lead-in… [word]" shape, which SPEECH_TEMPLATES SPT1 replaces with one take per value.
   - `tv_syl_your_word` becomes `w_your_word`, with long words added to its domain.
   - `tv_syl_hear_<n>` becomes a new `w_syl_hear`, "When I say {word}, I can hear {n} syllables."
   - `tv_gc_right_gem` and `tv_note_healed` become `ws_gem_we_need`, "That's the gem we need in {word}."
   - The dictation sentence is sequence tier.
   - "The first syllable is… sun" stays legal as a **demonstration**: add a `~syl<i>` clip mod beside `~slow`.
   - Add `long-words` and `syllables` domains to `members()`.
   - The count: about 2,800 whole-take clips on top of SPT's 19,505. That is long words × 3 templates ≈ 1,100, the gem line over about 1,300 Extended Code words, about 60 homophone sentences and about 300 others. At SPT's realistic rates that is about 2.5 hours and about $3. The risk is SPT's open risk 1, the fluency of templates that talk *about* a word, not cost.

8. **Record the spelling voice one take per long word, not 600 isolated syllables.**
   - The problem: an isolated "ti" or "pli" is the pure-sound problem again. TTS reads letter names or real words ("tie", "ply"), and Whisper can't check a nonsense syllable.
   - The method: one take per word with deliberate pauses ("mul… ti… ply"), cut at the silences into `SYLL_TIMES` (as `SLOW_TIMES`). Context gives the right full vowels.
   - The gate: pause count = syllable count, plus the judge, plus Jonas's ear on 20 words. That is about 380 takes.
   - PW1–PW2 compounds, whose syllables are real words, use the recorded words: no new clips for the first stone.

9. **Alien Words need a closed list.** "Generated from the child's own code" can't be pre-rendered, and Gemini normalises nonsense words (*vap* becomes *vape*).
   - Use about 120 alien words per stage, by unit.
   - Their slow words are spliced from the pure sounds (free and exact).
   - The blended word needs its own gate, like pure sounds, and Jonas's ear.

10. **The weekly list v1 plays only the words the game has.**
    - Unknown words show as "not in the game yet", and the word alone is logged.
    - A nightly job that segments, renders, validates and deploys is an ops system. An aligner that segments *because* wrongly teaches a wrong sound. And Workers static assets need a deploy per addition (or R2).
    - Instead, ship unknown words in reviewed batches (LLM segmentation, the validator, a human glance) with a normal deploy. Everything else in §1.9 stands.

11. **Warm audio per boss phase.** SPT §7.4 caps a level's warm list at 60 clips and 600 KB. A 12–16-item boss (read, spell, signature, long word, sentence) is about 70–90 clips. The phase save points are the natural warm boundaries. Decoded, that is still well under the 40 MB store.

12. **Put the PERF rules into the visuals.**
    - Ghost petals on the World Flower are **static**. The flower's SVG never animates (fix 9), and the flower is at 29.7 % of the main thread against a 30 % budget.
    - The door's swirl is a `rotate` on an HTML layer, paused off-screen.
    - Doors and lairs are **spur slots**, never new path nodes. `nodePos(i, n)` reflows the whole path when `n` changes.
    - Overworld paintings are 1376 × 768 like the land backgrounds (4.2 MB decoded). The Atlas is at most 2752 × 1536 (16.9 MB decoded), one at a time, and unmounted after.
    - Journeys are transforms or video.
    - The Word Scroll shows at most 24 cards a page, as static images, with no endless animations.

13. **Keep the save small and off the hot path.** The save is localStorage JSON, `structuredClone`d on every `store.set` (`store.ts:175`) and shared by every profile under about 5 MB.
    - Rungs and per-KC summaries go in the save, bounded (about 150 KB a child).
    - Raw evidence events are capped or go to IndexedDB, and are never cloned per tap.

14. **Budget boss art and voices honestly.**
    - v1: one sprite per boss (as the island bosses have), with poses by transform and tint, and lines as captions with a growl, or in the Baron's recorded voice.
    - A cast voice and pose sheet per boss comes when that boss's land ships.
    - Boss lines stay fixed, with no word slots: the template generator has only Sensei's voice (SPT open risk 14).
    - The Magpie's misreading (*great* as "greet") is Kai and Suki's existing read check, held up on the Magpie's sign.

15. **Make signature moves a kit of five phase types, not 17 games.**
    - **Snatch**: one slot's gem is missing (Gem Grab, Hide and Seek, Parrot talk, Gobble).
    - **Rival**: rivals on the bank (Rumble, Juggle, Crow swarm, Roar, Toll, Freeze, Shield split, Mirror trick).
    - **Misread**: Kai and Suki, or Sound Detective (the wrong readings, Now you see it).
    - **Big attack**: the Syllable Train inside a boss.
    - **Last word**: the Dictation Scroll.
    - Each boss is then data: its move names, words, art and lines. Squash is the existing build with a squash animation.

16. **Split Slice 1.** It currently holds a new scene, slider changes, `tileBank()`, Battle's correction branch, Dojo fan mode, a five-phase boss, the end-loop fix and the hooks. That is two or three slices, and it isn't the smallest proof. Use §6 below.

---

## 4. The assets, in numbers

Everything new that the design asks for, from its §4 and §2, with what it misses added. "Exists" is today's `public/a/`.

| Kind | Exists | New | How | Time and cost | Who gates it |
|---|---:|---:|---|---|---|
| Word pictures | 302 `pic_` | 278 (99 Y1, 179 Y2) | `gen-art.ts`, 8 in parallel, then `post-art.py` | about 1 h for all images | the pic audit bot, and a human glance (about 20 s a picture) |
| Long-word pictures | 4 | about 100 | the same | (above) | the same |
| Story pictures | 6 stories | about 120 (24 stories × 4–6) | the story art pipeline | (above) | the same |
| Bosses and monsters | 19 `mon_` | 11 bosses (33 with poses) and about 24 monsters | refs from the Baron's sheet | (above) | Jonas |
| Backgrounds, maps, props | 6 `bg_` | 13 land, 13 run, 3 overworld and the Atlas, about 15 props | the same | (above) | Jonas |
| **All pictures** | **502** | **about 650** | | **about 1–2 h, a few dollars** | **about 4 h of human review** |
| Unit words (talking voice) | 1,255 `/a/w/` | 520 | `gen-audio.ts` with the accent gate | | Jonas samples |
| Long words (talking voice) | about 180 | about 200 | the same | | the same |
| Slow words | 1,015 `/a/x/` | about 900 (units and long words) | `gen-slow-words.ts`: spliced from `/a/p/`, **no TTS** | minutes, free | `--measure` |
| Spelling voice | – | about 380 takes (must-fix 8), not 600 syllables | one take per word, cut at the pauses | | **Jonas's ear: a new kind of clip** |
| Sentences, story pages, try-clips | – | 190, about 150, about 110 | the line, story and MULTI_SOUND pipelines | | judge, then spot checks |
| Sensei's fixed lines | 1,404 `/a/l/` | about 250 | teacher-voice pipeline, TEACHER_SCRIPT §2 | | judge |
| New template clips (must-fix 7) | – | about 2,800 | `gen-templates.ts`, with the fluency gate | about 2.5 h, about $3 | SPT's gates; Jonas at the pilot |
| Boss voices | the Baron | about 110 lines, 11 voices | a cast voice each (or later, must-fix 14) | | **Jonas: casting** |
| Alien words | – | about 240 (a closed list) | a new gate, like pure sounds | | **Jonas's ear** |
| **All new TTS clips** | | **about 5,500–6,000** | | **3–5 h rendering, under $10 (doubling after 31 Dec)** | |
| Hosting | about 4,200 files | +6,000 files, about 50 MB at 24 kHz / 48 kbps | Workers static assets | SPT's whole programme (about 27k) + 6k = about 33k of 100k | the deploy gate at 80k |

**Per level on the phone:**
- A Syllable Train stone of four long words warms about 40 clips (3 templates and the word, slow and spelling-voice clips per word, plus the fixed lines). That is within 60, about 10 MB decoded if every clip plays.
- A Year 2 boss needs per-phase warming (must-fix 11).
- The 40 MB decoded store and the 64 MB ceiling in PERF are unchanged.

---

## 5. The best ideas (keep these exactly)

1. **The carriage row** (§3.0.1). No row ever holds more than one syllable's tiles, so *multiplication* stops being a layout problem. One component serves syllables and sentences.
2. **Rival spellings in `tileBank()`** (§3.2; audit §11.1 A). About 30 lines unlock the whole difficulty of the Extended Code. The correction line (`same_sound_spelling`) is already recorded and wired in the Dojo.
3. **The tortoise speaks in the spelling voice and the rabbit in the talking voice** (§3.0.2). Sounds~Write's pair, on a gesture children already know.
4. **Three tiles under a gold bracket** (§3.3). It keeps one sound per tile, and it builds with today's `Tile`, slots and pure sounds: `s.t.a=ae.ti=sh.o=schwa.n` parses with today's `parseWord()` (the unit files' `|` syllable marks need splitting first).
5. **Games belong to maps** (§1.4). It is also a build plan: each map says which scenes it needs, so maps ship one at a time.
6. **Catch-up is the glowing stone** (§1.6). One hook, a glowing slot with a `kind`, serves the door, the lair and the weekly scroll (§1.9.8).
7. **The §1.9.8 hooks.** A concrete, small list to build early.
8. **A claim ships with the slice that makes it true** (§6.5).
9. **The bot contract and a sweep over every word in the pool** at phone sizes (§3.1). Extend it to 740 × 360 and to the boss's box.
10. **The petal imp's lair** (§2.3, §2.6). A stake without a losing screen, built from `fly()`, a stone and a short battle.

---

## 6. The smallest first slice that proves it

### Slice A: the *sunset* stone and one rival tile

**What it proves:**
- a Year 1 child builds two-syllable words the Sounds~Write way (Lessons 11–12) on an 844 × 390 phone, within the PERF budgets, with templated speech;
- the Sky Temple's battles finally ask "which spelling?".

It needs none of the missing foundations.

| Part | What | Size |
|---|---|---|
| Content | a small table of 10 words with per-syllable segs: *sun·set, up·set, cob·web, bed·bug, hot·dog, kid·nap, pig·pen, dog·leg, sand·pit, desk·top*. Every syllable is a word already recorded in `/a/w/` and `/a/x/` | about 30 lines |
| Scene | `Train.tsx` (a new `LevelKind` "train"), sound level only: the carriage row, with the active carriage built on today's slots, `Tile` and `rowFit()` (moved out of `Battle.tsx` into `ui.tsx`). The ninja's slice, then the build. `ReadSlider` in `"words"` mode, with the syllables as items and text plates, then the rabbit's whole word; the gap closes. The `__snState` contract | about 1,000–1,300 lines, the size of the Dojo |
| Stone | one stone, `w6-syl1` (an explicit id), after the /oe/ dojo `w6-6`, as Sounds~Write's "second week of Unit 4". A `games.ts` entry with its full, recap and short forms | small |
| Rivals | `tileBank()`: from `w6-br1` on, one rival per word from the `confusable` table (*ai* → *ay*, *ee* → *ea*, *oa* → *ow*…), only while `rowFit()` stays at 90 px or more. `Battle.tsx` gets the Dojo's `same_sound_spelling` branch | about 60 lines |
| Speech | about 12 fixed Sensei lines (`tv_syl_frame`, `tv_syl_first_is`/`_next_is` as lead-ins, `_build_say`, `_read_each`, `_read_word`, `_no_gap`, `_recap`, `_short`…). Two templates over the 10 words: `w_your_word` and the new `w_syl_hear`. Syllables are the existing word clips, played as demonstrations. Slow words for the 10 are spliced (free) | about 32 clips, under $0.10 |
| Pictures | none needed (the engine shows its sparkle). Four optional (*sunset, cobweb, hotdog, sandpit*) | 0–4 |

**Acceptance** (all automatic, plus one listen):
- The sweep has 0 findings at 844 × 390, 667 × 375 and 740 × 360 on the live stone. A geometry harness over all 180 PW words and the 30 "shun" words (synthetic segs where the files have none) shows *multiplication* fits as carriages. No tile, slot or carriage leaves the stage.
- Every tile in the stone's banks and in the Sky Temple's battles with rivals is at least 90 stage px.
- The phone soak (`soak.ts --mobile --cpu 4 --fast 2`, with `w6-syl1` in its levels) passes all 29 budgets, and the stone's median fps is at least 50.
- The stone's warm list is at most 60 clips.
- The transcript has 0 template fallbacks, and it reads as Lessons 11–12: the syllable said, the sounds built, each syllable read, then the word.
- Jonas hears the first two words.

**What it lets the site show** (§6.5's rule):
- *sunset* built carriage by carriage, as a 20 s clip;
- *rain* with < ay > on the bank and "Yes, that's a spelling of that sound too!", as a 15 s clip.

Both are true the day they ship.

**Optional A+: the "shun" preview, reachable only by the cheat menu and never marketed.**
- Words: *station, motion, lotion, potion* at sound level, with the gold bracket over `ti=sh · o=schwa · n`.
- Audio: the pure sounds exist and the slow words are spliced. Four talking-voice words and four spelling-voice takes by must-fix 8's method.
- Why: it proves the bracket at 0.49 scale and gives the first real test of the spelling-voice method, for about 8 clips.

### Then, in this order

1. **Slice B: the Magpie's fight, with the Baron's art** (§2.5.2, cut to four phases).
   - Phases: Read (Kai and Suki exist), Spell with rivals (Slice A), Gem Grab (a Snatch: one slot's gem is missing) and the big attack *sun·set* (the `Train` inside the boss, with the monster perched as in must-fix 4).
   - Also: the segmented bar, the gems coming home by first try within the level (no ledger yet), the petal imp's grab, and the end-loop fix (audit §11.1 E).
   - The sentence phase waits for the Dictation Scroll.
2. **Slice C: the content model** (must-fix 1).
   - `Level.sw` and one word source over `units/*.ts`, `GRAPHEMES` step by step, and stable world keys.
   - The scenes write evidence through the ledger, with rungs in the save (must-fix 13).
   - It can run beside B: they touch different files, except `learner.ts`.
3. **Slice D: the Sky Temple as EC1–5.**
   - Its new stones, Sound Detective < ea > (MULTI_SOUND.md), Gem Choice fan mode, and the second and third Syllable Train stones (PW2).
   - The spelling voice for real, by must-fix 8's method.
4. **Slice E: the weekly list v1** (§1.9 with must-fix 10) and the hooks (§1.9.8). It is self-contained and it is the most useful habit for school children.
5. **Then the planner and the maps:**
   - ghost petals, catch-up doors and guardian challenges, once `catchUp()` has a ledger to read;
   - the Sky Isles map and Atlas;
   - then one land at a time, each with its boss (from the five-move kit), its story, its clip and its sweep.
   - The Muddle Isles and the Library last.

---

## 7. Decisions made without asking

| # | Decision | Why |
|---|---|---|
| JF1 | Scored MIDGAME_ENDGAME.md by section (§0–§7, with §1 and §3 split where the build cost differs), and the three research reports separately | the brief says "each section"; the reports are inputs, not buildable designs |
| JF2 | Measured the stage scale on production with a read-only Playwright script rather than trusting the docs' 0.54 | the tap-size claims depend on it |
| JF3 | Treated the design's §6.4 Slice 1 as too large, and proposed Slice A in its place | the brief asks for the smallest slice that proves it |
| JF4 | Recommended one spelling-voice take per word over isolated syllables | SPEECH_TEMPLATES SPT1's evidence (whole takes win), and SPT's own figures for short clips (`gen-audio.ts` needs 4.7 takes on average for a lead-in, up to 31) |
