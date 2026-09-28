# Build plan: the middle and end game

**27 September 2026.** How [../MIDGAME_ENDGAME.md](../MIDGAME_ENDGAME.md) (revision 2, "the spec") becomes working game, slice by slice: what each slice holds, the files and lanes, the content and assets, the acceptance tests, and what the treadmill must check. The feasibility judge's review ([judge-feasible.md](judge-feasible.md)) shaped the order; the playtests are specified in [PLAYTEST_PLAN.md](PLAYTEST_PLAN.md) and the claims each slice unlocks in [MARKETING_PLAN.md](MARKETING_PLAN.md). **[R3: Jonas, Baron final only]** Amended the same evening: the Baron is fought only in the final battle (spec §R.3), so an interim swap goes before every slice here (row 00 below, and [../fix-requests.md](../fix-requests.md), "Baron final only: the interim swap (27 Sep)").

**Rules for every agent and workflow that builds from this plan** (copy them into each brief):
- **Never use `rm`.** Move anything unwanted to `.trash/` with `mv`. No `cd … &&` chains: use absolute paths.
- **Never ask Jonas or wait.** Decide, and log the decision (the slice's decisions go to docs/DECISIONS.md at integration).
- **Edit only your lane's files** (§2). Anything else goes to docs/fix-requests.md as a request.
- **Sounds~Write material stays in `assets-src/sw-sources/`**: quote a line or two at most, never copy it into public files.
- British English everywhere, in code comments, lines and docs. Don't commit unless the workflow's brief says so.

---

## 0. The short version

| Slice | What it holds | What it proves | Depends on | Size |
|---|---|---|---|---|
| **[R3: Jonas, Baron final only]** **00. The interim swap** (first, right after the big fix; docs/QUEUE.md item 00) | `w6-11`'s monster becomes the Sky Magpie with today's boss kit (no phases, no Word Dragon); the Baron's cut-in introduces her; on the first win he escapes in his balloon ("It was a trick!") instead of the finale; the finale gated to the final battle (`FINALE_LEVEL`); "The Last Petal"'s last page sets her up | no Baron fight over simple words, in the game or its videos, from the next release | the big fix's integration | about 150 lines; 2 pictures (**drawn**: `mon_boss_magpie.webp`, `baron_balloon.webp`); 5 clips (docs/tts-retakes.md) |
| **0. The content model** | `Level.sw`, one word source over `units/*.ts`, `GRAPHEMES` grown step by step, stable world keys, the ledger with rungs in a bounded save | the foundations everything from spec §1.5 on needs | the big fix's integration (shared files) | about 1,500 lines, mostly moves and tests |
| **1a. Long words, proved** (the first slice) | the Syllable Dragon at sound level: ten compound words on the Sky Temple's path (`w6-syl1`), and the "shun" preview (*station, motion, lotion, potion*) under the gold bracket, opened from a grown-ups' card | long words built the Sounds~Write way on an 844 × 390 phone, within the PERF budgets, with templated speech; the first test of the spelling-voice takes | nothing but free lanes: it is mostly new files | about 1,500 lines; about 72 clips; 4 pictures |
| **1b. One boss that means it** | the Sky Magpie (`w6-11`) from the boss kit: read, spell with a choice of gems, Gem Grab, a Word Dragon as the big attack, a sentence as the finish; the perch; the imp's grab on help and its lair; lag-correct rival tiles in ordinary battles; the end-loop fix; "It was a trick!"; the weekly list's hooks | Jonas's boss question, answered on screen | 1a; Battle.tsx and App.tsx free | about 1,800 lines; about 40 clips; 3 pictures |
| **2. The Sky Temple as EC1–5** | a whole Year 1 land: Lesson 6 puzzles, Gem Choice with the fan, Sound Detective < ea > and < o >, the check's additions, two more Syllable Dragon stones, a Dictation Scroll, two chapters, the Magpie's skirmish, the bridge, the Word Scroll | a Year 1 land a child can play for weeks | 0, 1a, 1b; the Sound Detective scene (MULTI_SOUND, queued in the follow-up) | about 3,000 lines; about 600 clips; about 30 pictures |
| **3. The weekly word list** | the link and its parser, validation against the content, the grown-ups' confirmation, the daily scroll, Ninja Vanish, the practice test, the week strip, the headband, the list maker | five minutes a day on the school's own list | 0 (words, ledger); 1b's hooks | about 2,500 lines; about 150 clips |
| **4. The maps and catch-up** | `catchUp()`, ghost petals, doors in spur slots, guardian challenges, the Sky Isles' overworld map and the Atlas, the school welcome, the two paces and the bridge gate, the Garden and the Rainbow Bridge, belts | "we assume you know these things", with really obvious catch-up | 0; MAP_DESIGN's map in App.tsx | about 3,500 lines; 3 paintings; about 80 clips |
| **5+. One land at a time** | Cloud Town → Star Dunes (the practice check in Autumn Orchard), then the Muddle Isles, then the Library | the rest of Years 1 and 2, and the endgame | 2, 4 | per land: about 1,000–2,000 lines, 60–100 words, 30–40 pictures, 300–500 clips |

**The first slice** is 1a and 1b together: long words proved end to end (a Year 1 compound on the path, and the Year 2 "shun" family as a labelled preview), then one redesigned boss that uses them. 1a ships on its own the moment it passes; 1b follows. Slice 0 runs beside them, because it touches shared files and 1a mostly adds new ones. **[R3: Jonas, Baron final only]** The interim swap (row 00) goes before all of them: it is small, it touches only `worlds.ts`, `lines.ts`, `stories.ts`, `Battle.tsx`, `battle.css`, `audio.ts` and `App.tsx`, and 1b builds on it.

**What waits.** Nothing from spec §1.5 on (ghost petals, doors, rungs, belts, the weekly list's planner) is built before Slice 0's ledger exists. The Muddle Isles and the Library are designed but not scheduled until the Sky Isles are playable.

---

## 1. When each slice can start

Other workflows are editing `src/` today (docs/QUEUE.md). This plan starts where they finish, and never edits a file inside another workflow's lane.

| Workflow today | Files it holds | What this plan waits for |
|---|---|---|
| **The big fix** (teacher-voice-petals-scroll) | the lanes in FIX_PLAN §2: `Battle.tsx` (D2), `Dojo.tsx` (D1), `App.tsx` (B1), `Grownups.tsx` (A), `ui.tsx` and `store.ts` (F1), `src/core/**` (F2), the treadmill (F4) | its integration step, for everything but new files |
| **The follow-up** ("shell and speech", after the big fix) | the read slider's wiring (`ReadSlider.tsx`), the map redesign in `App.tsx`, the templated-speech migration, the Sound Detective build (MULTI_SOUND) | 1a's slider changes wait for its item 0b; 1b's `App.tsx` changes coordinate with its map redesign (the end-loop fix may land there first: check before building); Slice 2's Sound Detective stones wait for its item 5 |
| **flower-progress-v2** | `progress.ts`, `flower.ts`, the World Flower | Slice 0's `Gem.unit` move and Slice 4's ghost petals |
| **speech-templates** | SPT's pipeline and pilot | 1a uses SPT-shaped ids either way (§4.4) |

**Can start today, in a worktree:** the new files of Slice 1a (`Dragon.tsx`, `CarriageRow.tsx`, `longwords.ts`, the spelling-voice script, the dragon art) and the geometry harness. They touch no file another workflow holds.

---

## 2. Lanes for the midgame build

| Lane | Owns | Slices |
|---|---|---|
| **M1 Dragon** | `src/scenes/Dragon.tsx` (new), `src/ui/CarriageRow.tsx` (new), `src/styles/dragon.css` (new); `rowFit()` moved from `Battle.tsx` to `ui.tsx` (one function, agreed with F1) | 1a, 1b (the embedded big attack), 2 (the Dictation Scroll skin) |
| **M2 Slider** | `src/ui/ReadSlider.tsx`, its tests | 1a (`RAIL` as a parameter, syllable stops, `"words"` items with text plates), 3 (Ninja Vanish's rail) |
| **M3 Content** | `src/content/longwords.ts` (new), `src/content/bosses.ts` (new), `src/content/worlds.ts`, `src/content/games.ts` entries, `src/content/lines.ts` (a new block only), `src/content/units/PW*.ts` segs, `src/content/words.json` (generated) | every slice |
| **M4 Battle** | `src/scenes/Battle.tsx`, `src/styles/battle.css`, `src/engine/learner.ts` (`tileBank()`) | 1b, 2 |
| **M5 Shell** | `src/App.tsx`, `src/main.tsx`, `src/styles/shell.css` | 1b (end loop, trick scene, spur-slot kind, hooks), 3 (the scroll's slot), 4 (maps) |
| **M6 Grown-ups** | `src/scenes/Grownups.tsx` | 1a (the "Year 2 preview" card), 3 (the list's confirmation and card), 4 (pace, catch-up card) |
| **M7 Core** | `src/core/**` | 0 (ledger and rungs), 3 (`pinned` lists, the day's outline), 4 (`catchUp`, `bossCheck`, pacing) |
| **M8 Audio** | `scripts/gen-syllable-takes.ts` (new), SPT's template catalogue entries, `public/a/**` new clips, `public/a/durations.json` | every slice |
| **M9 Checks** | `scripts/treadmill/*` (the F4 files) and new checkers | every slice (PLAYTEST_PLAN) |
| **M10 Art** | `assets-src/midgame/**` prompts and masters, `public/a/i/` new images | 1a (the dragon module), 1b (the Sky Magpie), then per land |

Slice 0 needs a short-lived **M0 Model** lane over `worlds.ts`, `phonics.ts`, `learner.ts`, `flower.ts`, `gems.ts`, `progress.ts` and the lines' world keys in `App.tsx` and `narrative.ts`, opened only when those files are free, and closed when the slice merges.

---

## 3. Slice 0: the content model (in parallel with 1a and 1b)

**Why.** The scenes read only `phonics.ts` (411 words in legacy units 1–12); `src/core` has no planner; world numbers are positional. Everything from spec §1.5 on needs the first two, and inserting the Garden and the Rainbow Bridge breaks the third (judge-feasible must-fix 1).

**What changes.**
1. **`Level.sw: SwUnitId[]`** on every level, beside the legacy `units`, from a mapping table (legacy unit → Sounds~Write units) that a test checks against `sw.ts`.
2. **One word source** (`src/content/words.ts`, new) over `units/*.ts` (IC, BR, EC1–49, PW1–9) and `phonics.ts`. `knownSpellings()`, `levelWords()`, `startFor()`, `MILESTONES`, `makeReview()` and `flower.ts`'s `Gem.unit` read it. The build writes `words.json` from it (text, `segs`, syllables, audio, slow-word and picture flags, first-taught unit, special part), which Slice 3's list validation uses.
3. **`GRAPHEMES` grows step by step.** Explicit `g=p` segs (`ti=sh`, `ea=ae`) already parse, so each slice adds only the pairs its words use: none for 1a; EC1–5 with consonant + e and the check's additions (< ie ou ph >) for Slice 2.
4. **Stable world keys.** `World.key` (`bamboo`, `blossom`, `misty`, `dragon`, `shadow`, `rainbow`, `sky_temple`, …), an explicit `WORLD_ORDER`, lines keyed `world_<key>` (with the old `world_<n>` ids kept as aliases so recorded clips still play), and level ids append-only. A test fails if any shipped level id changes or disappears.
5. **The ledger with rungs.** A per-word summary in the save (`rung`, `lastDay`, `firstTryToday`), bounded to about 150 KB a child; raw evidence events capped (the newest 2,000) or in IndexedDB, never `structuredClone`d per tap (judge-feasible must-fix 13).
6. **The whole curriculum in the core.** `unit-data.ts` imports EC27–49 and PW1–9.

**Acceptance.**
- `bun test` and `bun test src/core` green. A golden test: today's 74 levels produce the same word pools from the new source, or every difference is listed and explained.
- A save migration test: saves from before the slice load, keep every star and sticker, and gain `Level.sw`-aware state without loss.
- The save stays under 150 KB a child with a year of simulated play (`scripts/sim`), and `store.set` never clones the raw events.
- The phone soak (`soak.ts --mobile --cpu 4`) passes all its budgets, unchanged.

**Treadmill.** The full run (`run.ts`) with no new findings; a new **content audit** (`content-audit.ts`): every level's words decodable at its `Level.sw` with the validator's `decodable` rule, and every dictation sentence at two sound units behind.

---

## 4. Slice 1a: long words, proved (the first slice)

### 4.1 What the child gets

- **A new stone on the Sky Temple's path, `w6-syl1`,** straight after the /oe/ dojo (`w6-6`), which is Sounds~Write's "second week of Unit 4". Four words: *sunset* is Sensei's (the I do), then three for the child, drawn from the pool below.
- **The Syllable Dragon at sound level** (spec §3.1): the egg with the word's picture hatches into a sleeping dragon; Sensei says the word and how many syllables; the child taps the sparkle to mark the join; each segment is built tile by tile, saying the sounds; the tortoise reads each segment and stops at the join; the rabbit reads the whole word; the joints close, and the dragon wakes and flies off. On the stone's last word, the child writes it again from memory (the spec's write-it-again step, run on a fixed word until rungs exist in Slice 0).
- **The "shun" preview.** A grown-ups' card, "Year 2 preview: long words with -tion", opens a four-word Syllable Dragon with *station, motion, lotion, potion* at sound level: the last segment's three tiles, < ti > < o > < n >, sit under the gold bracket with "It's three sounds, but one ending". It is also in the cheat menu. It is never on a child's path in this slice, because -tion is Year 2 (Roaring Peaks), and the grown-ups' card says so.

### 4.2 Content

| Item | Count | Detail |
|---|---:|---|
| Compound words | 10 | *sun·set, up·set, cob·web, bed·bug, hot·dog, pig·pen, sand·pit, desk·top, dust·bin, zig·zag*, with per-syllable `segs` in `longwords.ts`. Every syllable but *zig* and *zag* is a recorded word with `/a/w/` and `/a/x/` clips (checked on 27 September) |
| "Shun" words | 4 | `s.t.a=ae\|ti=sh.o=schwa.n`, `m.o=oe\|ti=sh.o=schwa.n`, `l.o=oe\|…`, `p.o=oe\|…`, with `ending: "tion"` |
| Pure sounds | 0 new | /sh/ and schwa exist in `/a/p/` (46 of 46) |
| Slow words | 14 | spliced by `gen-slow-words.ts` from the pure sounds (free) |
| `worlds.ts` | 1 level | the `"dragon"` `LevelKind`, `w6-syl1` with an explicit id |
| `games.ts` | 1 entry | the Syllable Dragon's full, recap and short forms |

### 4.3 Art

| Item | Count | Detail |
|---|---:|---|
| The Word Dragon module | 3 | head, segment, tail, drawn to tile along the carriage row (M10; `gen-art.ts` with the Baron's sheet as the style reference); reused by every long word to the Library |
| The egg | 1 | with a round window for the word's picture |
| Word pictures | 0 required | the egg shows a sparkle without one; *sunset, cobweb, hotdog, sandpit, station, potion* are optional (6) |

### 4.4 Speech and audio

| Kind | Clips | How |
|---|---:|---|
| Fixed Sensei lines | about 16 | `tv_syl_frame`, `tv_syl_mark`, `tv_syl_first_is`, `tv_syl_next_is`, `tv_syl_build_say`, `tv_syl_read_syl`, `tv_syl_read_each`, `tv_syl_read_word`, `tv_syl_no_gap`, `tv_syl_your_mark`, `tv_syl_again`, `tv_syl_recap`, `tv_syl_short`, `tv_lw_last_is`, `tv_lw_three_sounds`, `tv_lw_this_is_sh`; the teacher-voice pipeline, TEACHER_SCRIPT §2, the judge |
| Templates | about 42 | `w_my_word`, `w_your_word` and `w_syl_hear` over the 14 words. If SPT's generator isn't live yet, the same ids are recorded as whole takes with `gen-audio.ts`, so nothing changes when it is |
| Talking-voice words | about 9 | *bedbug, pigpen, sandpit, desktop, dustbin, station, motion, lotion, potion* (*sunset, upset, cobweb, hotdog, zigzag* exist) |
| Spelling-voice takes | 5 | *zigzag* and the four -tion words, one take each with pauses, cut at the silences into `SYLL_TIMES` by `gen-syllable-takes.ts` (new). **The first test of the method** (spec §3.0.2) |
| **In all** | **about 72** | under $0.20 |

### 4.5 Files and lanes

| File | Lane | Change |
|---|---|---|
| `src/scenes/Dragon.tsx` (new) | M1 | the scene: phases `mark`, `build`, `read`, `rabbit`, `again`; the `__snState` contract (spec §3.1) |
| `src/ui/CarriageRow.tsx` (new) | M1 | the three rows, widths, the perch-aware width limit (unused until 1b), the read-back scale min(1.3, 770 ÷ width) |
| `src/ui/ui.tsx` | F1 → M1 | `rowFit()` moved here from `Battle.tsx` (the only edit; agreed with F1) |
| `src/ui/ReadSlider.tsx` | M2 | `RAIL` as a parameter of `geoFor()`; a stop at each join; syllables as `"words"`-mode items with text plates |
| `src/content/longwords.ts` (new), `worlds.ts`, `games.ts`, `lines.ts` | M3 | the words, the level, the game entry, the new lines |
| `src/scenes/Grownups.tsx` | M6 | the "Year 2 preview" card (press-and-hold, as everything grown-up) |
| `src/App.tsx` | M5 | the route for the `"dragon"` kind (a few lines; coordinate with the follow-up's map work) |
| `scripts/gen-syllable-takes.ts` (new) | M8 | the spelling-voice takes, cut into `SYLL_TIMES` |
| `scripts/treadmill/bot.ts`, `sweep.ts`, `geometry-longwords.ts` (new) | M9 | the bot's `step()` for `dragon`, the sweep cases, the geometry harness |

### 4.6 Acceptance (automatic, plus two listens)

1. **Layout.** The sweep has 0 findings on `w6-syl1` and the preview at 844 × 390, 667 × 375 and 740 × 360. A geometry harness over every long word in the unit files (180) and the spec's "shun" family (30, with synthetic segs where the files have none) shows every word fits: *multiplication* at 850 px in the 980 px row, and 778 px beside a perched boss's box.
2. **Tap size.** Every tile, slot, sparkle and ✓ is at least 90 stage px (the sweep's tiny-target check runs at 90 stage px for this scene).
3. **Performance.** The phone soak (`soak.ts --mobile --cpu 4 --fast 2`, with `w6-syl1` in its levels) passes all 29 budgets, and the stone's median fps is at least 50. The dragon moves by transform and opacity only.
4. **Audio.** The stone's warm list is at most 60 clips and 600 KB.
5. **Teaching.** The transcript has 0 template fallbacks, and the transcript audit's `lesson-11-order` rule passes: the word, the syllable count, each syllable said, built and read, then the word read, then "without the gap" (PLAYTEST_PLAN §5).
6. **Spelling voice.** All five takes pass the gate (pause count equals syllable count; the judge). **Jonas hears** the first two words of the stone and the four -tion takes on the R2 listening page.
7. **Bots.** The perfect, learner and Y1 personas play the stone from the map to the reward, and the preview from the grown-ups' card, without a stuck state.

### 4.7 What it lets the site show

A *sunset* dragon built syllable by syllable (a 20-second clip), and *station* with its gold ending, labelled "Year 2 preview" (MARKETING_PLAN §3).

---

## 5. Slice 1b: one boss that means it (the Sky Magpie)

### 5.1 What the child gets

The Sky Temple's boss (`w6-11`, the same id) **[R3: Jonas, Baron final only]** is already the Sky Magpie from the interim swap, fought with today's kit; 1b makes her the progress check (spec §2.5.2): check 3, whose unit U is EC4, so it reads EC1–5 and spells EC1 and older.

| Phase | Kit type | Items | Built from |
|---|---|---|---|
| 1. Read | Read | 3: find the word (*boat, feet, play*) | Kai and Suki's read check, as "find the word" |
| 2. Spell | Spell | 3: *duck* (< c k ck >), *catch* (< ch tch >), each read first; *cake* (< a > < ai > < ay >) | Battle, with the bounded R4 bank |
| 3. Gem Grab | Snatch, Misread | 3 + 1: *r _ n*, *pl _*, *g _ me*; then *break* read as "breek" | Battle with one open slot; Sound Detective if its scene is built, otherwise Kai and Suki (who read it right) on the same word, noted as a stopgap |
| 4. Big attack | Big attack | *sun·set*, the Magpie perched at 0.55× top right | `Dragon.tsx` embedded |
| 5. The last word | Last word | "I can play a game." | the carriage row's scroll skin: panels, the board (*I*), the ninja star, the read-back |

Also in the slice:
- **The boss kit** as data (`bosses.ts`): phases, skins, words, lines, poses by transform and tint; the segmented bar; save points and per-phase audio warming (at most 60 clips and 600 KB each).
- **The entrance at 2×** over the temple roof, then the fight size (1.5×), then the perch.
- **Pure wins.** The Word Dragon staggers the Magpie (one knee, the chest's lock cracks); the sentence's full stop knocks it off its nest; then the chest, and nothing tested after it.
- **The imp's grab on help.** When Sensei helps with a word, the petal imp grabs that gem ("Ooh, shiny! Mine!", a caption and a squeak) and `tv_imp_grab` plays. The gems go to a **lair** in the map's spur slot two stones later: a two-minute Gem Chase on those spellings. The spur slot gets its `kind` (`"stone" | "door" | "scroll" | "lair"`) here.
- **Rival tiles in ordinary battles, lag-correct**: in this slice only for Initial Code and Bridging spellings (< c k ck >, < ch tch >, < f ff >, < l ll >, < s ss >, < z zz >, < w wh >, < v ve >), from `w6-br1` on, bounded by `rowFit()`; the `same_sound_spelling` branch in `Battle.tsx`. The /ae/ /ee/ /oe/ rivals wait for Slice 2, where Gem Choice and `Level.sw` make the lags checkable.
- **The end-loop fix** (audit §11.1 E): the finale plays only the first time the final boss is beaten, and never at the Sky Temple now; after the end the glowing stone never points at a beaten boss; the Baron's lines are keyed to story state. After the Magpie falls, the Baron escapes into the sky and the map says more lands are coming. **[R3: Jonas, Baron final only]** The interim swap has already done the first and last parts: `FINALE_LEVEL` gates the finale, and the Baron's balloon escape (`baron_trick_1`, `baron_escape_sky`, `tv_trick_soon`) plays once per save. 1b adds the glowing stone and the story-state keying (`world_6` stops saying he is "hiding up here somewhere" once he has flown off), and moves the once-per-save flag from the narration ledger's `story:trick` to `trickSeen` without playing it twice.
- **"It was a trick!"** once for saves with the old finale seen (spec §2.2). **[R3: Jonas, Baron final only]** The interim swap plays it on the first Magpie win, or on an old save's first map arrival if it shipped its row 17; 1b makes the map-arrival path certain.
- **The weekly list's hooks** (spec §1.9.8): `?list=` parsed into a pending list and a stub confirmation, `weekList` in the save, the `"weekly"` and `"vanish"` kinds, the `special` flag, the spur slot's `kind`, evidence tagged with `source`.

### 5.2 Content, art and audio

| Kind | Count |
|---|---:|
| Boss words | about 14 (all exist, with audio) |
| The last word | 1 sentence, read smoothly (sequence tier) |
| The Sky Magpie | 1 sprite (poses by transform and tint); **Jonas** approves it. **[R3: Jonas, Baron final only]** Drawn for the interim swap: `public/a/i/mon_boss_magpie.webp` (redrawn 27 Sep: the purple-masked Magpie with her nest of stolen gems; picks, raws and `sheets/contact.jpg` in `assets-src/midgame/magpie/`, the first drawing's in `assets-src/midgame/art/`) |
| The lair | 1 prop; the imp exists (`mon_petal_imp.webp`) |
| Sensei's lines | about 12 (`tv_boss_phases`, `tv_gem_grab`, `tv_imp_grab`, `tv_trick_after`, `tv_dict_star`, `tv_dict_read_back`, `tv_gc_battle_first`, …) |
| Boss captions | about 9 (`mag_*`, `imp_grab`), with 3 growl and squeak effects |
| The Baron's voice | **[R3: Jonas, Baron final only]** none new: `baron_intro_sky_temple`, `baron_trick_1` and `baron_escape_sky` are recorded for the interim swap, and `baron_trick_2` is dropped (spec M40) |
| **Clips in all** | **about 35** (**[R3: Jonas, Baron final only]** the Baron's five came with the interim swap) |

### 5.3 Files and lanes

| File | Lane | Change |
|---|---|---|
| `src/scenes/Battle.tsx`, `battle.css` | M4 | boss phases from the kit, the segmented bar, the perch, the entrance, per-phase warming, save points, the imp's grab, the correction branch, `maxLen` gone for long words |
| `src/engine/learner.ts` | M4 | `tileBank()`: Initial Code and Bridging rivals, confusion order, `rowFit()` bound |
| `src/content/bosses.ts` (new), `worlds.ts`, `lines.ts` | M3 | the Magpie's data; `w6-11`'s phases; the lines |
| `src/scenes/Dragon.tsx`, `CarriageRow.tsx` | M1 | embedding in a boss; the scroll skin for the last word |
| `src/App.tsx`, `src/main.tsx` | M5 | the end-loop fix, the story state (`finaleSeen`, `trickSeen`), the trick scene, the spur slot's `kind`, the lair stone, the `?list=` hook |
| the save (`store.ts`) | F1 → M5 | `weekList`, `lairs`, `story` fields (small) |
| treadmill | M9 | the checks in §5.4 |

### 5.4 Acceptance

1. **The whole fight** plays from the map to the chest with the perfect, learner, Y1 and struggling personas, and resumes at the right phase after a reload mid-fight.
2. **Lags.** The `boss-lag` check passes: every read word's code is at most EC5, every spelt word's at most EC1 (or Initial Code and Bridging), and the long word follows the long-word lag (PLAYTEST_PLAN §5).
3. **A pure win.** The `boss-pure-win` check: the knockout (the full stop) is the last scored item before the chest, and the chest shows no grab.
4. **The imp's cause.** The `imp-cause` check: every grab follows a help event on that word, within the same item.
5. **The perch.** The sweep finds no overlap between the boss's box and the carriage row in phases 4–5, at all three phone sizes.
6. **Audio.** Each phase's warm list is at most 60 clips and 600 KB.
7. **No loop.** A continuous run from `w6-1` past the end never plays the finale and never fights the Magpie again unless the child picks a rematch.
8. **Old saves.** A save with the old finale seen gets the trick scene once, and never again.
9. **Rivals.** In `w6-5` and later battles, rival tiles appear only for Initial Code and Bridging spellings, never below 90 px, and `same_sound_spelling` plays on a rival tap.
10. **Performance.** The phone soak passes with `w6-11` in its levels.
11. **[R3: Jonas, Baron final only]** **The Baron fights once.** A unit test: no level but the final battle (none yet) has `monster: "boss_baron"`, and `FINALE_LEVEL` is that level or null. The `baron-final-only` audit passes (PLAYTEST_PLAN §5).

---

## 6. Slice 2: the Sky Temple as EC1–5

**What the child gets.** The Sky Temple as spec §1.2 describes it: 25 stones over EC1–5, with the check's additions (< ie > *chief*, < ou > *mould*, < ph > *phone*).
- **Lesson 6 puzzles** in `Dojo.tsx` from each word's own tiles, the gem flying to its column, and `tv_gc_sum`; **Gem Choice** (Lesson 7) with the peek and the fan, and the `ws_gem_we_need` template.
- **Sound Detective** stones for < ea > (`w6-sd-ea`) and < o >, from MULTI_SOUND's scene.
- **Two more Syllable Dragon stones** (the Handbook's steps 1–2: *dentist, upset, cobweb*), and the write-it-again step driven by rungs.
- **A Dictation Scroll stone** (sentences of 4–6 words at EC1 and older), two **story chapters** (what the Magpie did; where the nest is), and the **Magpie's skirmish** at the halfway stone.
- **Rival /ae/ /ee/ /oe/ gems** in ordinary battles from EC5 on (four units after EC1), now that `Level.sw` makes the lag checkable.
- **The bridge** at the land's edge, a plank per practice day (its gate goes live with Cloud Town), and the **Word Scroll** with its first Word Dragon cards (24 a page, still images).
- **Sensei's grown-up voice** (spec §3.0.4): concept lines once per land for a school starter.

**Content.** About 12 new unit words for the check's additions, 8 pictures, 20 long words with `segs`, about 12 dictation sentences, 2 chapters with 8–12 pictures, about 20 Sound Detective try-clips, about 150 `ws_gem_we_need` takes over EC1–5 words, about 60 Sensei lines, about 10 spelling-voice takes: **about 600 clips and 30 pictures**.

**Files.** `Dojo.tsx` (D1 → a midgame lane), the Sound Detective scene (its own lane in the follow-up), `Dragon.tsx`, `CarriageRow.tsx`, `worlds.ts`, `learner.ts`, `App.tsx` (the bridge, the Word Scroll entry), `Story.tsx` (chapters with questions), `src/core` (rungs driving the peek and write-again).

**Acceptance.** The Y1 persona plays the land from `w6-1` to the Magpie with the transcript audits passing (Lesson 6 has no choice; Gem Choice fans only after a peek; rivals only at four units back; every misreading try-safe); the sweep and the phone soak pass; Sensei's seconds per minute of play in the land fall below the Island's (PLAYTEST_PLAN §4); Jonas hears a sample of 20 new clips.

---

## 7. Slice 3: the weekly word list

This is the slice Jonas queued "for later" (docs/QUEUE.md): "a deep link system where you can just have query params or something that encode the word list and then get a special sort of challenge levels to master that word list with like five minutes of practice a day." The design is spec §1.9; this is how to build it.

### 7.1 The link format

```
https://superninja.templestein.com/play/?list=rain,play,cake,great,eight,they&special=said,because&test=fri&week=2026-09-28&v=1
```

| Parameter | Required | Meaning | Rules |
|---|---|---|---|
| `list` | yes | the week's words, comma-separated, in the school's order | 1–15 words |
| `special` | no | the words with untaught code (the school's "special words") | 0–3 words; a word in both lists counts as special |
| `test` | no | the school's test day | `mon` … `fri`; default `fri` |
| `week` | no | the Monday of the list's week, `YYYY-MM-DD` | default: this week's Monday on the device; another weekday snaps to its Monday |
| `v` | no | the format version | default `1`; any other value is refused politely ("This link is from a newer Super Ninja. Please update the app.") |

The link is readable on purpose: a teacher can type one, a parent can check it, a school can post one link for a whole class on Seesaw or print it as a QR code. Commas need no escaping in a query string.

### 7.2 Parsing (`src/main.tsx`, then a small module `src/content/weeklist.ts`)

1. Read `URLSearchParams` once at start-up. If `list` is absent, do nothing.
2. **Normalise each word:** Unicode NFC, lower-case, trim, strip surrounding punctuation and quotes, straighten curly apostrophes, collapse inner spaces (a pasted "ice cream" becomes two words only if separated by a comma; otherwise it is refused as one word with a space).
3. **Check each word** against `^[a-z][a-z'-]{0,19}$`. A word that fails is dropped and listed on the confirmation as "couldn't read this word".
4. **De-duplicate** (keeping the first), cap `list` at 15 and `special` at 3 (extra words are listed as "not added: the list is full"), and move any word in both lists to `special`.
5. **Store it as a pending list** in `sessionStorage` (`sn.pendingList`), then **remove the parameters from the address bar** with `history.replaceState`, so a reload doesn't prompt again and the words don't sit in the address bar.
6. The app opens the **grown-ups' confirmation** (press-and-hold, as the gear) before anything else is shown.

`weeklist.ts` is pure (no DOM), with unit tests for every rule above and a fuzz test (random strings, emoji, 10 KB parameters, `%00`, repeated keys) that must never throw.

### 7.3 Validation against the content

The build writes `words.json` (Slice 0) from the unit files, `phonics.ts` and `longwords.ts`: each word's text, `segs`, syllables, audio (`/a/w/<word>.mp3` exists), slow word, picture, the first-taught unit of its hardest spelling, and, for the common exception words, the untaught part and the unit that teaches it (from Sounds~Write's high-frequency chart, sw-y1y2 §6).

For each list word, the confirmation shows one of:

| Status | When | What the grown-up sees |
|---|---|---|
| **ready** | the word has `segs` and audio | its sounds and spellings (c·**a**·ke, eigh·t); a spelling beyond the child's land shows "met at school this week" |
| **ready, no picture** | as above, without a picture | the same; it is used only in games that don't need a picture |
| **special** | a `special` word that is ready | its untaught part in gold, with its sound ("< ai > is /e/ here") |
| **not in the game yet** | no `segs` or no audio | "Not in the game yet: *Wednesday*. We'll practise the other 7 words." |

- **The week's sound** is the sound shared by at least half of the ready words, from their `segs`. If none is, the scroll practises words, not a sound.
- **Split spellings.** For a school that teaches them, the existing `split: "split"` setting shows *cake* as Freshford writes it; the game still reads it with the 2024 coding.
- **Unknown words are logged by word only**: one request per word to the Worker (`POST /api/unknown-word`, body `{ "word": "wednesday" }`), with no child, no list, no profile, no device id and no other words; the Worker keeps a count per word. They arrive in the game in reviewed batches with a normal deploy (spec §1.9.7): LLM segmentation over the 174 official pairs, the content validator, a person's glance, the audio pipeline with its accent gate.

### 7.4 The daily challenge: five minutes a day

The core's `outline(ctx, 300_000)` makes the day's scroll from the list and the day (spec §1.9.4):

| Day | Blocks |
|---|---|
| **Day 1** (the day it is added) | the week's petal (a short Learn), a sort of the list's words into their gem chests (read first), three Gem Choice words with the peek, the first special word in Ninja Vanish |
| **Days 2 to the day before the test** | Gem Choice on 6–8 list words (a peek on day 2, then by rung), one Ninja Vanish (taking turns), a Sound Detective or Syllable Dragon item if a word needs one, yesterday's misses first |
| **The day before the test** | the practice test: every word dictated the Sounds~Write way (the word, a sentence, the word), with the bounded full bank; the special words too; the result card |
| **After the test** | the words join spaced review |

- The scroll is the day's first glowing stone (the spur slot's `"scroll"` kind), until it is done; a grown-up can switch "school words first" off.
- Five minutes is a budget: the scroll ends at the first item boundary after 300 s, on a success. Nothing is timed on screen.
- A finished scroll lights the ninja's headband for the day's battles; a practice test with every word right earns the charm for the next boss (looks only).
- The list's words are pinned in the planner with `source: "school-list"` and tagged `met-at-school` when they are beyond the child's land.

### 7.5 Ninja Vanish: the game for special words

A new scene, `Vanish.tsx` (spec §1.9.5): the scroll with the word and its untaught part in gold; the tortoise reads it, with Sensei giving that part ("This is… /e/" and "Here, you say… /e/"); the rabbit reads the word; the smoke ball; the child builds it from its tiles; reads it back; the scroll unrolls to check. At most two new special words a day; each is played once a day and moves up its rung like any word. The child never hears "special words" or "tricky": Sensei says "This word has a spelling we haven't learned yet. I'll tell you that bit." The slider sits at y 300–340 (`RAIL` as a parameter, from Slice 1a).

### 7.6 The week's progress

- **In the save**, per profile: `weekList: { v: 1, words, special, week, test, added, days: { [isoDate]: { done, items, firstTryRight } }, practiceTest?: { date, results: { [word]: boolean } } }`, plus a history of the last six lists (words and practice-test results only), bounded.
- **For the child**, a week strip along the scroll: seven dots, a stamp for each day's scroll, a gold stamp for the practice test. A missed day leaves an empty dot, never a broken flame. The result card ticks every word, and the words to practise glow.
- **For the grown-up**, a card on the grown-ups page: "School list, week of 28 September: 7 of 8 right in the practice test", and per word "*great*: spelt from memory on 3 days". A new list replaces the old one; the old list's words stay in spaced review.

### 7.7 Privacy: no accounts

- There are no accounts, logins, emails or class codes. The link carries only a list of words.
- The list is saved only in the profile a grown-up chooses, on the device, in the same local save as everything else.
- The only network request the feature makes is the unknown-word log, one word at a time, with nothing that identifies a child, a family, a school or a device.
- The list maker (`/list`) runs entirely in the browser: the words are never sent anywhere, and the QR code is drawn on the page.
- A school can post one link for a whole class; nobody can learn who used it.

### 7.8 The list maker (`/list`)

A small static page on the site: type or paste the week's words (commas, spaces or new lines), tap a word to mark it special, see how the game will read each one (from `words.json`), and copy the link or save the QR code. Words the game doesn't have yet are marked before the link is made.

### 7.9 Files, lanes and content

| File | Lane | Change |
|---|---|---|
| `src/content/weeklist.ts` (new) | M3 | parsing, validation, the week's sound; pure, tested |
| `src/main.tsx` | M5 | the start-up hook (from 1b), now calling `weeklist.ts` |
| `src/scenes/Grownups.tsx` | M6 | the confirmation, the week's card |
| `src/scenes/Vanish.tsx` (new), `src/scenes/Weekly.tsx` (new, the scroll's runner) | M1 or a new M11 List lane | the scroll and Ninja Vanish |
| `src/core/planner` | M7 | `pinned` school-list requests, `outline(ctx, 300_000)` for the day |
| `src/App.tsx` | M5 | the `"scroll"` spur slot, the headband and charm state |
| a small Worker (new) | M5 | `POST /api/unknown-word`: validate the word, increment a count (KV or D1), return 204. The site is static assets only today (`wrangler.jsonc` has no `main`), so this is either a `main` script that runs first for `/api/*` only, or a separate Worker like the voice picker's |
| `public/list/` (new) | M5 | the list maker |

**Content.** The special-word metadata (about 110 common exception words: untaught part, sound, teaching unit), about 60 dictation sentences for common list words, about 30 fixed lines (`tv_wk_*`, `tv_van_*`), and `w_built_right` and `w_your_word` over the playable words: **about 150 new clips**.

### 7.10 Acceptance

1. The parser's unit and fuzz tests pass, and a link with 15 words and 3 special words round-trips through the list maker unchanged.
2. The confirmation shows every word's status correctly for a test set of 40 real Freshford-style lists (built from the unit files, with 10% unknown words).
3. The Y1 and Y2 list personas (PLAYTEST_PLAN §2) play seven simulated days: each day's scroll lasts 4–6 minutes, ends on a success, and the practice test comes the day before the test day.
4. **Privacy check:** a network log of a full week shows no request containing any list word except the unknown-word log, and that request carries the word only.
5. No line the child hears says "special words", "tricky" or "sight words" (the transcript lint).
6. The sweep and the phone soak pass on the scroll, Ninja Vanish and the practice test.

---

## 8. Slice 4: the maps and catch-up

**What it holds.** The planner's `catchUp()`; ghost petals and gems (still outlines, spec §1.5); catch-up doors in spur slots, with the caps; guardian challenges; the Sky Isles' overworld map and the Atlas (1376 × 768 paintings, one Atlas at a time); the school welcome with the Year 1 and Year 2 lines; the two paces (`In step with school`, `Own pace`) and the bridge's gate; the Garden and the Rainbow Bridge moves (with stable world keys, nothing renumbers); belts, stripes in colour or silver thread, and certificates; the grown-ups' catch-up card and pace setting.

**Depends on** Slice 0's ledger, and the map redesign in `App.tsx` (MAP_DESIGN, the follow-up).

**Acceptance.** The school-start personas (Y1 September, Y1 January, Y2 September, and a struggling Y1 who drops a band at the first check) each play a simulated fortnight: ghost petals come home only by the collection rule; doors appear within the caps and never first in a session; the bridge gets one plank per practice day and never loses one; in step with school, no unit opens before its school week; no screen shows two glowing things. The soak and the sweep pass; the Atlas stays within its memory budget.

---

## 9. Slice 5 and after: one land at a time

Each land ships whole, in the spec's order: Cloud Town, Moon Marsh, Circus Island, Autumn Orchard, Star Dunes, then Echo Island to Muddle Castle, then the Library. A land's slice holds:

| Part | From the spec |
|---|---|
| Stones | §1.2's land table and dose rule (19–27 stones) |
| Words, pictures, long words, special words | §4.2's row for the land |
| The boss | §2.4's row, as data in `bosses.ts`, checked by `boss-lag` |
| The skirmish, the chapters, the bridge | §1.7.1, §3.8 |
| Land-specific | Cloud Town: /oy/ met early, endings as syllables. Moon Marsh: Alien Words (the closed list and its audio gate, spec §3.8). Circus Island: the < ch > Sound Detective and the tangential < g c s >, < ar > met early. **Autumn Orchard: the practice check, read aloud to a grown-up** (a grown-ups' scoring screen like Speed Read). Star Dunes: < sc >, the first muddled note, **[R3: Jonas, Baron final only]** the Sand Shark (the Baron's lieutenant, spec §2.4.1; the Baron escapes across the sea and never fights), the alien crew. Echo Island: Sound Twins, Muddled Notes as the parrot. Roaring Peaks: -tion stones and the Roar. Muddle Castle: the final battle and the finale (**[R3: Jonas, Baron final only]** the Baron's only fight, every item Year 2 code or a long word, spec M38; `boss_baron` back in `LEVELS` here and nowhere else; `FINALE_LEVEL` set to its id). The Library: the Word Dragons, the Root Dojo, the Shun Sort, Word Detective |
| Clips for the site | one clip per land, recorded when it ships (MARKETING_PLAN §4) |
| Checks | the sweep, the soak, the land's transcript audits, the personas' land run |

**Per land, roughly:** 60–100 unit words, 30–40 pictures, 20 long words with `segs`, 10 sentences, 2 chapters, 300–500 clips, one boss sprite and 2–3 minion monsters, a background and a run background, and about 30 minutes of Jonas's review.

---

## 10. Content and assets, in totals

| | Slice 1a | Slice 1b | Slice 2 | Slice 3 | Slice 4 | Each later land | Years 1–2 in all |
|---|---:|---:|---:|---:|---:|---:|---:|
| New words with `segs` (long or short) | 14 | 0 | about 32 | 0 | 0 | 80–120 | about 1,100 |
| Pictures | 4 (+6 optional) | 2 | about 30 | 0 | 4 (paintings) | 30–45 | about 700 |
| New clips | about 72 | about 40 | about 600 | about 150 | about 80 | 300–500 | about 5,500–6,000 |
| Spelling-voice takes | 5 | 0 | about 10 | 0 | 0 | about 35 | about 380 |
| Jonas's review | the first two words and four takes | the Sky Magpie sprite | 20 clips | 10 clips | 3 paintings | about 30 minutes | about 4 hours of pictures and a listening pass a land |

Money and render time are not the constraint (under $10 of TTS and a few dollars of images for everything). **Review time and Jonas's ear are**, so each slice asks for the smallest listen that proves it.

---

## 11. What the treadmill must test

The checks are specified in [PLAYTEST_PLAN.md](PLAYTEST_PLAN.md); each slice turns on its own:

| Slice | New checks it turns on |
|---|---|
| 00 | **[R3: Jonas, Baron final only]** `baron-final-only`; the continuous run past the end (no finale, no Baron fight); the sweep's boss case with the balloon at three phone sizes |
| 0 | `content-audit` (decodable at `Level.sw`); the golden word-pool test; save size |
| 1a | the bot's `dragon` step; the long-word geometry harness at three phone sizes; `lesson-11-order`; the spelling-voice gate; the Y1 persona |
| 1b | `boss-lag`, `boss-pure-win`, `imp-cause`, the perch overlap in the sweep; per-phase warm lists; the end-loop run; the struggling persona |
| 2 | `lesson-6-no-choice`, `fan-after-peek`, `rival-lag`, `misread-try-safe`; Sensei's seconds per minute; the Word Scroll's page budget |
| 3 | the list parser's fuzz tests; the list personas' seven days; the privacy log; the "special words" lint |
| 4 | the school-start personas' fortnight; `one-glow`; the bridge and pace checks |
| each land | the land's boss lags, its personas' run, its first-try band (70–85%), days per land, the weekly boss-shaped moment |

---

## 12. Risks

| Risk | Where it bites | What we do |
|---|---|---|
| Other workflows hold the files | every slice | this plan's §1: new files first, shared files only when free; requests through fix-requests.md |
| SPT's template generator isn't live | 1a, 1b | record the same template ids as whole takes with `gen-audio.ts` |
| The spelling-voice takes don't cut cleanly | 1a | the gate fails loudly; the fallback is the syllables as recorded words (compounds) and one retake with longer pauses; the "shun" preview can ship without its spelling voice (the tortoise then says the sounds only) |
| Sound Detective isn't built by 1b | 1b | the Magpie's misreading uses Kai and Suki on *break* (who read it right), and switches to the lens when the scene lands |
| The Word Dragon art doesn't tile | 1a | the module is three images; a plain rounded segment is the fallback until the art passes Jonas |
| The save grows | 0 onwards | the 150 KB cap has a test; raw events go to IndexedDB |
| Review time | every slice | small listens per slice; the pic-audit bot before any human glance |

---

## 13. Decisions made here (for docs/DECISIONS.md at integration)

| # | Decision | Why |
|---|---|---|
| BP1 | The first slice is 1a (long words proved) then 1b (the Sky Magpie), shipping separately; Slice 0 runs beside them | the brief's "long words end to end, and one redesigned boss", split as the feasibility judge asked |
| BP2 | The "shun" preview is a grown-ups' card ("Year 2 preview"), not on the path, until Roaring Peaks ships | -tion is Year 2; a grown-up can choose to show it, as with Jump ahead |
| BP3 | 1a's words are nine compounds whose syllables are recorded words, plus *zigzag* | no new syllable clips except one test take |
| BP4 | 1b's rival tiles are only Initial Code and Bridging spellings; vowel rivals wait for Slice 2 | the four-unit quizzing lag, checkable only with `Level.sw` |
| BP5 | If Sound Detective isn't built by 1b, the Magpie's misreading is Kai and Suki's "who read it right" on the same try-safe word | ship the boss without waiting |
| BP6 | The list's parameters are removed from the address bar once read | no prompt on reload; the words don't linger |
| BP7 | The unknown-word log carries the word only, and the Worker keeps a count per word | privacy with no accounts |
| BP8 | Template ids are SPT-shaped from the start, recorded by `gen-audio.ts` if the generator isn't live | nothing changes when SPT lands |
| BP9 | **[R3: Jonas, Baron final only]** The interim swap ships before Slice 0, 1a and 1b, with today's boss kit | Jonas: the Baron is "the final, final battle with really hard words always"; the footage of him losing to *beg* shouldn't wait for 1b |
| BP10 | **[R3: Jonas, Baron final only]** The Sky Magpie's sprite and the Baron's balloon are drawn now (new files in `public/a/i/`), so the swap needs no art job | the swap's only asset risk, removed; Jonas can still ask for a redraw before 1b |
