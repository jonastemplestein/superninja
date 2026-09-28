# The fish-dog inventory

27 September 2026, 09:45. Every reference to the fish-dog (and the dog-fish) in the repo, what each one should become, and who owns the file today. It is for the picture-reading v2 and read-slider work (docs/READ_SLIDER.md, docs/PICTURE_READING.md), and for the requests in docs/fix-requests.md under "## Picture reading v2 and the read slider (27 Sep)". Those requests cite this file's row numbers (S1, P3, D7 and so on).

> Jonas, 27 Sep: "I don't want you to use fish dog. I want you to use other words because I don't want it to come across as stealing from Mentava. … it's confusing when the sensei shows it. … Fish dog, fish dog, fish dog. The whole interaction makes no sense. I think you should use it as a way to introduce the slow and the fast reading … we can also read longer words made from shorter words … It's like rainbow, not bow rain."

**Scope.** Three kinds of reference, marked in the tables:
- **FD**: the fish-dog or dog-fish itself: the ids `fishdog` and `dogfish`, their pictures and word clips, "Fish dog!", "Dog fish!", "What a silly animal!", "the fish-dog game".
- **ORD**: fish and dog read in order as a nonsense sequence (fish… dog, fish–dog / dog–fish rows, W4's cat–dog–fish and fish–dog–cat). This is the same Mentava "read the pictures in order" pattern, and every one of these lines says "fish" and "dog" next to each other, so it goes too.
- **FP**: a false positive (fish and dog as ordinary pictures, or a generic comment). It is listed so nobody hunts for it again. No change.

**How to read the line numbers.** They were taken at 09:45 on 27 Sep, while the big fix lanes were editing. `warmups.ts`, `App.tsx` and `Stickers.tsx` had already moved that morning, so search for the quoted id or function name. "Owner" is the lane in FIX_PLAN_PERF_SCRIPT_SOUNDS.md §2. For a file §2 doesn't list, it names the workflow that last owned the file (docs/QUEUE.md). Under §2, nobody in the big fix edits a file that isn't listed.

---

## 0. Counts

| What | Files | Lines or items |
|---|---|---|
| **Everything in the repo** (text: `fish.{0,40}dog`, `dog.{0,40}fish`, `tv_silly`, `tv_which_so`; history, run output, builds and `.trash` included) | 842 | 4,306 lines |
| **File names** containing fishdog, dogfish, fish_dog, dog_fish, fish-dog or dog-fish (the same, plus binaries) | 965 | 16 in `public/`, 50 in `assets-src/`, 772 in `playtest/runs/`, 79 in `.trash/`, 48 in `dist/` and the two build copies |
| **Live code to change**: `src/` (§3) | 25, all to edit | 111 lines (1 FP), plus the lines found by id rather than by text: one call (`fm_rw_shiny` in Stickers.tsx) and 8 line-tags entries |
| **Tools to change**: `scripts/` (§4) | 6 (4 to edit) | 12 lines |
| **Shipped assets to retire**: `public/` (§5) | 26 (16 by name, 10 by what they say) | plus 21 `durations.json` keys |
| **Save data** (§6) | 1 migration (`store.ts`), plus App.tsx and the 4 cheat files that read or write the id | 3 save fields: `stickers`, `shiny`, `words` |
| **Docs to update** (§7.1) | 15 | 83 lines (4 of them FP or kept) |
| **Docs that stay as history** (§7.2) | 16 (14 in `docs/`, plus CHANGELOG and PROMPTS) | 124 lines |
| **Public outside the app** (§8): the tweet kit and showcase on R2, the game clips, the live site | 4 places | 2 orphaned public tweet files, 3 public showcase clips, 3 local game clips, 26 live assets |
| **Landing page** (`index.html`, `landing/*`) | 0 | 0: no fish, no dog, no picture-reading clip |
| **Adjacent, not fish-dog** (§9): the cat/dog nonsense pair and the ordinary fish and dog pictures | – | a designer's call |

---

## 1. The replacement slots

The new compound words and lines come from the designer (`src/content/compounds.ts`, docs/PICTURE_READING.md). This inventory uses these slot names, so each row can say what it becomes before the words are chosen. Map them to compounds.ts's ids once that file exists.

| Slot | What it is | Replaces | Default if the designer names nothing |
|---|---|---|---|
| **SHOW** | W2's first compound. Sensei reads it with the read slider the slow way (part… part), then the fast way (the whole word). It introduces "longer words made from shorter words" and the tortoise and the rabbit for reading (TEACHER_SCRIPT §9) | fish + dog → fishdog (Sensei's rail, `fm_read_fish_dog`) | rain + bow → rainbow (Jonas's example). W4's rainbow beat then needs another compound |
| **TURN** | the child's first compound on the slider, left to right | the child's fish + dog rail (`fm_l2_turn` / `tv_rail_turn`, `fm_pair_fish_dog`) | the designer's |
| **SHINY** | Reward 2's shiny sticker, the picture on every `picread` map stone, the Confirm's replay picture, and the save migration's target | `fishdog` | TURN's whole word (the one the child made: "saved for its best moment", FIRST_MINUTES §6), else SHOW's |
| **BACKWARDS** | what happens when the slider goes right to left: "That's not the way. Ninjas always read this way." Spoken only, with no picture. If the designer keeps the joke, it is "Not bow… rain!" | the dog-fish (`fm_l2_swap`, `r2_dog_fish`, `pic_dogfish`, the swap beat) | spoken only, no picture |
| **ROWS** | the two-rows demo, if `which` survives v2: SHOW's parts both ways | `WHICH_DEMO` fish–dog / dog–fish, `tv_which_demo`, `tv_which_so` | SHOW's parts, or retire `which` in favour of the slider |
| **THREE** | W4's three in a row | cat–dog–fish / fish–dog–cat and its 7 lines | the designer's |
| **LIST2** | Reward 2's one-clip sticker list, in W2's new sticker order, with its WORD_TIMES | `fm_rw2_list` "Fish, dog, flower, sunflower, star and starfish!" | the designer's (keep 6 stickers + the shiny one, or update FIRST_MINUTES §8's "5 → 11 → 12") |
| **SHINY_LINE** | "Ooh, a shiny sticker! <SHINY>!" | `fm_rw_shiny` "Ooh, a shiny sticker! Fish dog!" | that sentence with SHINY |
| **REPLAY** | the `picread` stone's replay question. The id stays `tv_map_replay_picread`, because the Confirm builds it from the stone kind | "Do you want to play the fish-dog game again?" | "Do you want to play Ninja Reading again?" (games.ts's name for the game, so no word can go stale) |

**Rule for the designer (and a check, §10).** Fish and dog stay as ordinary pictures, but no slider, rail or row ever puts them next to each other, and no line says "fish dog" or "dog fish".

---

## 2. What a child sees and hears today, most visible first

1. **The map.** Every `picread` stone (W2, W4 and W6) shows `pic_fishdog` (App.tsx `KIND_ICON`, S6), so every new child sees it from the first map on.
2. **W2**: Sensei's rail "Fish… dog. Fish dog!", the merge into the fish-dog, the child's rail and its "Fish dog! · What a silly animal!", the swap into the dog-fish, and the two-rows demo on fish–dog / dog–fish (S1, S2).
3. **Reward 2**: the list "Fish, dog, …", then the shiny fish-dog and "Ooh, a shiny sticker! Fish dog!" (S1, S7).
4. **The Sticker Book**: the shiny fish-dog, for every child who has had Reward 2 (§6).
5. **W4**: "Cat… dog… fish. Cat-dog-fish!", "Fish dog cat!" and "Which row has the fish first?" (S1).
6. **The map's replay question** (map redesign, not yet wired in): "Do you want to play the fish-dog game again?" (S9, P26).
7. **Grown-ups**: the cheat menu's "Shiny fish-dog" toggle and its Reward 2 jump note (S20–S23).

---

## 3. `src/`: live code (25 files)

| # | File · lines | Kind | What it is today | What it becomes | Owner |
|---|---|---|---|---|---|
| S1 | `src/content/warmups.ts` · 38, 41, 56, 116, 118, 120, 129–130, 157–159, 300 (123 is FP) | FD, ORD | `rail`'s `silly?: true` (the fish-dog-only flag); the `which` doc and `WHICH_DEMO = { rows: [["fish","dog"],["dog","fish"]] }`; W2's `stickers: ["fish","dog",…]`, `list: "fm_rw2_list"`, `shiny: "fishdog"`; W2's rail (`cards: ["fish","dog"]`, `fm_read_fish_dog`, `merge: "fishdog"`, `fm_pair_fish_dog`, `silly`) and swap (`["dog","fish"]`, `fm_l2_swap`, `merge: "dogfish"`), in both the W and R versions; W4's rail, swap and which on cat–dog–fish / fish–dog–cat; `warmupPictures()` adds `WHICH_DEMO` | W2's rail becomes the read-slider beat on SHOW (Sensei: slow, then fast) and TURN (the child), per PICTURE_READING.md. `silly` goes. The swap goes (BACKWARDS is the slider's right-to-left answer). `WHICH_DEMO` becomes ROWS, or goes with `which`. `stickers`, `list` and `shiny` become W2's new pictures, LIST2 and SHINY. W4's three beats become THREE. W2's `which` turn on cat/dog (line 121) is §9's. The Pocket Hunt ◇ grid (sunflower, sock, fish, dog; line 123) is FP and may keep fish and dog | **C2** |
| S2 | `src/scenes/Warmup.tsx` · 454, 895, 909, 911, 983, 1445–1446, 1596, 1598, 1610 (unchanged since 07:41) | FD | `childRight()`: `LIVING.has(w) \|\| w === "fishdog" \|\| w === "dogfish" \|\| w === "starfish"`; the `rail` handler: the fish-dog splits back, "Fish… dog. Fish dog!" `readAlong`, the merge; `swap` / `swapShow()` ("the fish-dog … the dog-fish"); `merge()`'s doc ("fish + dog → the fish-dog", "Fish dog!") and `const living = LIVING.has(into) \|\| ["fishdog","dogfish","starfish"].includes(into)` | `childRight` and `merge`: just `LIVING.has(…)` (living.ts already lists starfish and snowman). The `rail` handler becomes the ReadSlider flow: no per-card strike, and no ninja running back to the start between cards (Jonas: "it's like a back and forth"). `swapShow` retires. `merge()` stays for real compounds, with its doc example changed to "rain + bow → the rainbow". The `which` handler plays ROWS, or goes | **C2** |
| S3 | `src/styles/warmup.css` · 152 | FD | comment: "A merged picture (the fish-dog) bounces with joy" | "A picture word (the sunflower) bounces with joy" | **C2** |
| S4 | `src/scenes/Early.tsx` · 242 | FD | comment: "a picture that is the joke (the fish-dog)" | "a picture word (the starfish)" | **C1** |
| S5 | `src/engine/store.ts` · 48, 50, and `migrate()` | FD | `Save.stickers` doc: word ids "sun", "fishdog"; `Save.shiny` doc: "the fish-dog, the moving-up sticker" | the docs name SHINY. `migrate()` gains the fish-dog step in §6 | **F1** |
| S6 | `src/App.tsx` · 737, 1545 | FD | `KIND_ICON.picread: "pic_fishdog"` (the map stone); `StickerRoute`: `firstW2 = level.warmup === "W2" && !s.shiny?.includes("fishdog")` | `picread: "pic_<SHINY>"`. `firstW2` reads `WARMUPS.W2.shiny` rather than a literal, so it stays right with the migration (§6) | **B1** |
| S7 | `src/scenes/Stickers.tsx` · 12, 191, 622, 633 | FD | header: "a shiny holographic fish-dog"; the `shiny` prop's doc: "(the fish-dog)"; "the shiny fish-dog lands in the centre"; `say({ line: "fm_rw_shiny" })` | the comments name "the shiny sticker". The call says SHINY_LINE. Better still, it takes the line from the warm-up (`WARMUPS.W2.shinyLine`, a new field beside `shiny`), so the next change needs no scene edit | **B4** |
| S8 | `src/engine/feedback.ts` · 64 | ORD | comment: `pair` example `"cat_dog", "fish_dog_cat"` | THREE's id | **F2** |
| S9 | `src/content/lines.ts` · 368, 370, 372, 386, 387, 419–423, 551, 553, 688, 690, 691, 730, 731, 1098 (18 lines) | FD, ORD | `fm_read_fish_dog`, `fm_pair_fish_dog`, `fm_l2_swap`, `fm_rw2_list`, `fm_rw_shiny`, W4's `fm_read_cat_dog_fish`, `fm_triple_cat_dog_fish`, `fm_l4_swap`, `fm_which_three`, `fm_triple_fish_dog_cat`, the r2 block comment and `r2_dog_fish`, `tv_silly`, `tv_which_demo`, `tv_which_so`, `tv_which_q_fish_dog_cat`, `tv_which_fix_fish_dog_cat`, `tv_map_replay_picread` | Each one gets a `RETIRED_LINES` entry, "retired: picture reading v2 (27 Sep)". The clips stay until nothing calls them (the RETIRED_LINES rule), then P1–P26 move. The new lines are appended by the read-slider block at the very end of `LINES`, with new ids. `tv_map_replay_picread` keeps its id (the Confirm builds it from the kind), so its text changes to REPLAY and it is re-recorded. `tv_which_demo` and `tv_which_so` do the same if `which` survives (games.ts keeps its ids) | **F2** (a new block only; `RETIRED_LINES` is the teacher-voice lines lane's) |
| S10 | `src/content/games.ts` · 123 (and the `rail` entry, 115–118) | ORD | `which`: `demo: ["tv_which_demo", "tv_which_so"]`; `rail` ("Ninja Reading", `mech:left-to-right`) with `tv_rail_ido` / `tv_rail_ready` / `tv_rail_turn` | `rail` points at the slider game's frame, demo and hand-over lines. `which` follows ROWS, or its entry goes | **F2** |
| S11 | `src/core/types.ts` · 315, 1704 | FD | the `merge` cue: "fish + dog → fish-dog; sun + flower → sunflower"; `merge` field doc "(fish + dog → fish-dog)" | "rain + bow → rainbow; sun + flower → sunflower" | **F2** (`src/core/**`) |
| S12 | `src/core/content/line-tags.ts` · 312, 314, 316, 329, 330, 355–359, 802, 804, 805, 838, 839, 1175, 1232 (10 of them match the search; the rest are the same ids by name) | FD, ORD | reviewed tags (with a hash of the text) for all 17 ids in S9 | the retired ids' tags go when their lines go. The new lines get tagged, and the hashes of `tv_map_replay_picread` (and `tv_which_demo` / `tv_which_so`, if they are re-recorded) are refreshed after their text changes | **F2** |
| S13 | `src/core/content/line-tags.draft.ts` · 1444–1445, 1476–1477, 1567–1568, 2752–2753, 10422–10423, 11569–11570, 11611–11612, 11625–11626 | FD, ORD | draft tags for 8 of the same ids | the same as S12 | **F2** |
| S14 | `src/content/phonics.ts` · 258, 265, 266 | FD | `ORAL_WORDS.fishdog` and `.dogfish` (picture prompts, first sounds, segs), and the comment "the fish-dog gag" | Both entries are removed, after the migration (§6) has shipped or with it. The new parts and wholes that aren't words yet are defined in compounds.ts (new) and merged into the oral bank there | – (not in §2: the follow-up, docs/QUEUE.md 0b) |
| S15 | `src/content/living.ts` · 8 (6 is FP: "dog duck elf fish") | FD | `LIVING_WORDS`: "fishdog dogfish starfish snowman" | drop fishdog and dogfish, and add any living new compound (a snowman-like character) | – (follow-up) |
| S16 | `src/content/word-times.ts` · 8, 9, 10, 15, 16, 17, 53, 55, 57 | FD, ORD | the word onsets for `fm_rw2_list`, `fm_read_fish_dog`, `fm_l2_swap`, W4's three clips, `tv_which_demo`, `tv_which_fix_fish_dog_cat`, `tv_which_q_fish_dog_cat` | These drop with their lines. LIST2's onsets go in, from its `words.json`: the sticker landings need them | – (follow-up) |
| S17 | `src/content/pic-names.ts` · 16, 20 | FD | generated from the blind picture audit: `dogfish` → "doggy", `fishdog` → "doggy" | Rerun `scripts/treadmill/pic-audit.ts` and then `pics-to-content.ts` once the new pictures exist. The two entries drop out | – (generated) |
| S18 | `src/content/pic-plates.gen.ts` · 72, 86 | FD | generated plates for `dogfish` and `fishdog` | rerun `scripts/gen-pic-plates.py` after S14, P1 and P2 | – (generated) |
| S19 | `src/content/slow-times.gen.ts` · 214, 279 | FD | generated slow-word onsets (f·i·sh·d·o·g) | rerun `scripts/gen-slow-words.ts` once ORAL_WORDS has lost them and P15–P16 have moved | – (generated; the fast-and-slow workflow) |
| S20 | `src/cheat/actions.ts` · 166 | FD | the "warm-ups done" preset: `s.shiny.push("fishdog")` | `WARMUPS.W2.shiny` | – (the cheat-menu workflow; its fix round is running) |
| S21 | `src/cheat/jumps.ts` · 251, 260, 407 | FD | `firstReward()`'s doc "the shiny fish-dog"; `s.shiny.filter((w) => w !== "fishdog")`; the Reward 2 jump's note "the shiny fish-dog, the first petal" | `WARMUPS.W2.shiny`; the note becomes "the shiny sticker, the first petal" | – (cheat-menu) |
| S22 | `src/cheat/CheatMenu.tsx` · 505 | FD | `<Toggle label="Shiny fish-dog" … "fishdog">` | label "Shiny sticker (W2)", id `WARMUPS.W2.shiny` | – (cheat-menu) |
| S23 | `src/cheat/actions.test.ts` · 60, 65, 66, 181, 182 | FD | the preset test and the `withShiny` test use "fishdog" | `WARMUPS.W2.shiny` | – (cheat-menu) |
| S24 | `src/scenes/ConfirmDemo.tsx` · 8, 40, 41, 90 | FD | comment "the fish-dog game"; `img("pic_fishdog")` for `replay` and `replay-map`; the demo map's picread stone icon | `pic_<SHINY>`; comment "Ninja Reading" | – (map-and-confirm, done; the follow-up wires it) |
| S25 | `src/ui/confirm.test.ts` · 231 | FD | `const stone = "/a/i/pic_fishdog.webp"` (any picture would do) | `/a/i/pic_<SHINY>.webp` | – (map-and-confirm) |

---

## 4. `scripts/`: tools and generators (6 files)

| # | File · lines | Kind | What it is | What it becomes | Owner |
|---|---|---|---|---|---|
| T1 | `scripts/treadmill/sweep.ts` · 79, 127 | FD | the `picread` brief for the AI judge ("fish dog → a fish-dog"); the `book-stickers` shot's save (`stickers: [… "fishdog" …], shiny: ["fishdog"]`) | a brief describing the slider (left to right, slow then fast, right to left refused); the save uses SHINY | **F4** |
| T2 | `scripts/treadmill/script-audit.ts` · 325 | ORD | the `which` game's expected lines: `tv_which_demo`, `tv_which_so` | follows S10 | **F4** |
| T3 | `scripts/gen-pic-plates.py` · 24–26, 28 | FD | the comment and `PLATE_OVERRIDE` `dog: "lilac"` (to keep fish and dog apart on the rail); `FLOATING` includes `fishdog` | drop `fishdog`, and add any floating new picture. Re-pick the overrides for the new slider neighbours, so no two parts share a plate | – (the art pipeline) |
| T4 | `scripts/art-manifest.ts` · 133, 135 (129 is FP) | FD | the `PLATE` comment "(fish and dog on the reading rail…)" and `dog: "lilac"` | the same change as T3 (the manifest mirrors it) | – (the art pipeline) |
| T5 | `scripts/treadmill/pic-audit.ts` · 5 | FP | "a faceless dog or fish is a major finding" | no change | – |
| T6 | `scripts/content/cache/jev.json` · 9921, 9928 | FD | the Jev critic's cache entries for fishdog and dogfish | no edit: a cache. The stale keys are never read again | – |

---

## 5. `public/`: shipped assets (26 files)

These are all live at superninja.templestein.com today (`/a/i/pic_fishdog.webp` and `/a/l/fm_rw_shiny.mp3` both answered 200 at 09:45). **Retire them by moving them to `.trash/` (never `rm`)**, in the release where nothing references them any more. That is after S1–S25 and the migration (§6); before then, an unmigrated save's Sticker Book would show a broken picture. `vite build` then drops them from `dist/`. `public/a/l/*` and `durations.json` are **F2**'s; the pictures and word clips belong to the follow-up.

**By name (16):**

| # | File | Kind | What it becomes |
|---|---|---|---|
| P1 | `public/a/i/pic_fishdog.webp` | FD | retired; SHINY's picture takes its place on the map and the shiny sticker |
| P2 | `public/a/i/pic_dogfish.webp` | FD | retired; BACKWARDS has no picture |
| P3 | `public/a/l/fm_read_fish_dog.mp3` | FD | retired → SHOW's slow-then-fast line |
| P4 | `public/a/l/fm_pair_fish_dog.mp3` | FD | retired → TURN's "<TURN>!" |
| P5 | `public/a/l/r2_dog_fish.mp3` | FD | retired |
| P6–P8 | `public/a/l/fm_read_cat_dog_fish.mp3`, `fm_triple_cat_dog_fish.mp3`, `fm_triple_fish_dog_cat.mp3` | ORD | retired → THREE's lines |
| P9–P12 | `public/a/l/tv_which_q_fish_dog_cat.mp3` and `.words.json`, `tv_which_fix_fish_dog_cat.mp3` and `.words.json` | ORD | retired → THREE's lines, or retired with `which` |
| P13–P14 | `public/a/w/fishdog.mp3`, `public/a/w/dogfish.mp3` | FD | retired (the sticker's tap word and the merge's word) |
| P15–P16 | `public/a/x/fishdog.mp3`, `public/a/x/dogfish.mp3` | FD | retired (slow words; S19 regenerates without them) |

**By what they say (10):**

| # | File | Says | What it becomes |
|---|---|---|---|
| P17 | `public/a/l/fm_l2_swap.mp3` | "…Dog… fish. Dog fish!" | retired (BACKWARDS is new speech) |
| P18 | `public/a/l/fm_rw2_list.mp3` | "Fish, dog, flower, sunflower, star and starfish!" | retired → LIST2 |
| P19 | `public/a/l/fm_rw_shiny.mp3` | "Ooh, a shiny sticker! Fish dog!" | retired → SHINY_LINE |
| P20 | `public/a/l/fm_l4_swap.mp3` | "…Fish… dog… cat. Fish dog cat!" | retired → THREE |
| P21 | `public/a/l/fm_which_three.mp3` | "Listen. Fish… dog… cat. …" (already in RETIRED_LINES) | retired |
| P22–P23 | `public/a/l/tv_which_demo.mp3` and `.words.json` | "I'll go first. Fish… dog." | re-recorded with ROWS (same id), or retired with `which` |
| P24 | `public/a/l/tv_which_so.mp3` | "Fish came first. So I tap this row." | the same as P22 |
| P25 | `public/a/l/tv_silly.mp3` | "What a silly animal!" (only ever said of the fish-dog) | retired |
| P26 | `public/a/l/tv_map_replay_picread.mp3` | "Do you want to play the fish-dog game again?" | re-recorded as REPLAY (same id) |

**`public/a/durations.json`**: 21 keys: the 14 that match by name or id (lines 215, 220, 221, 257, 258, 374, 1084, 1188, 1191, 1192, 1636, 1718, 2803, 2868), plus the keys for P17–P22 and P26. They go when gen-audio next writes the file, or are removed with the clips (F2).

---

## 6. Save data: what a "fishdog" in a save becomes

**What a save can hold today** (localStorage, one save per profile):
- `stickers` contains `"fishdog"`, for every child who has had Reward 2's first ("open") show. `Stickers.tsx` calls `recordMet(p.shiny, true)`.
- `shiny` contains `"fishdog"` (the same call), sometimes beside `"star"`, the moving-up sticker.
- `words.fishdog = { n: 0, ok: 0, last: 0, met: <timestamp> }` (`recordMet`).
- `"dogfish"`: never, in normal play. It is in no `stickers` list and is never shiny. Only a hand-made or tool-made save could hold it.
- Cheat presets and jumps write `"fishdog"` too (S20–S23), and so do the probe and sweep saves (T1, `playtest/fix/B4/probe.ts`).

**Decision: rename it to SHINY, don't drop it.** A child who had the old Reward 2 keeps a shiny sticker in the same place in their book, and keeps the same count. The book never loses one they saw, and 3-year-olds notice a missing sticker. They also aren't shown Reward 2's big first-time show again when they replay W2: `firstW2` in App.tsx (S6) looks for the shiny sticker. Dropping the sticker would replay the show, and leaving it unmigrated would show a broken picture once P1 moves.

**The change** (F1, `src/engine/store.ts`). It is a step of its own that runs on **every** load, **before** `migrate()`'s early return (`if (Array.isArray(parsed.stickers)) return s;`), and running it twice changes nothing:

```ts
/** Picture reading v2 (27 Sep): the fish-dog retires (docs/read-slider/fishdog-inventory.md §6). The id is written
 *  out here, not imported from warmups.ts (store.ts must not import content that imports it); a test checks that it
 *  equals WARMUPS.W2.shiny. */
const RENAMED: Record<string, string | null> = { fishdog: "<SHINY>", dogfish: null };
function renameStickers(s: Save) {
  for (const [from, to] of Object.entries(RENAMED)) {
    const i = (s.stickers ??= []).indexOf(from);
    if (i >= 0) {
      if (to && !s.stickers.includes(to)) s.stickers[i] = to; // same place in the book
      else s.stickers.splice(i, 1); // already has it: no duplicate
    }
    if ((s.shiny ??= []).includes(from)) s.shiny = [...new Set(s.shiny.map((w) => (w === from ? to : w)).filter((w): w is string => !!w))];
    const rec = s.words[from];
    if (rec) {
      if (to) {
        const t = (s.words[to] ??= { n: 0, ok: 0, last: 0 });
        if (rec.met !== undefined) t.met = Math.min(t.met ?? rec.met, rec.met);
      }
      delete s.words[from];
    }
  }
}
```

- **An edge case.** If SHINY is already one of the child's stickers (for example, SHINY is rainbow and the child has played W4), the fish-dog is dropped and that sticker turns shiny. The count goes down by one, which is fine.
- **Tests** (F1, next to store's tests): (1) a save with `stickers: [..W1, ..W2old, "fishdog"]`, `shiny: ["fishdog", "star"]` and `words.fishdog.met = 5` loads with SHINY in the fish-dog's place, `shiny: ["<SHINY>", "star"]`, `words["<SHINY>"].met === 5` and no `fishdog` or `dogfish` anywhere; (2) loading twice gives the same save; (3) `"<SHINY>" === WARMUPS.W2.shiny`; (4) the dogfish is dropped.
- **Ship together, in one release:** this migration, S6's `firstW2`, the cheat constant (S20–S23), and T1's save. Only after that do P1, P2 and P13–P16 move.
- Nothing else in the save names the fish-dog. `warmups` is keyed by stone, the foundations record only `directionality`, and the narrative ledger keys by game and line (`game:which`, which stays harmless if `which` retires).

---

## 7. Docs

### 7.1 To update (15 files)

| # | File · lines | Kind | What it becomes | Owner |
|---|---|---|---|---|
| D1 | `docs/TEACHER_SCRIPT.md` · 22, 171, 173 (§0, §2 examples); 425, 432–437, 440, 446, 453–455 (§3.7 A–C); 478 (FP: the Pocket Hunt grid); 491–492 (§3.8); 573–583 (§3.10 W4); 1094 (§4 recap); 1623, 1625–1626, 1657–1658 (§7.1); 1887 (the generated families); 1972 (§8) | FD, ORD | §3.7 A–C and §3.10 are rewritten from PICTURE_READING.md: the slider, SHOW slow then fast, TURN, BACKWARDS, ROWS or no `which`, THREE. §3.8 gets LIST2 and SHINY_LINE. The §2 style examples lose "Fish dog!" and "Fish came first. So I tap this row." (use "I'll go first. My word is sun… There it is!"). §7.1 retires the ids. §9.3's Word Squish row now says the compound game is where the slow and fast ways of reading are introduced | – (the teacher-voice docs; not a §2 file) |
| D2 | `docs/FIRST_MINUTES.md` · 65, 326, 328, 332, 347–349, 353, 367–368, 420, 640, 731, 733, 735, 748–749, 779–780 (537 is FP) | FD, ORD | §7 (Lesson 2) and §8 (Reward 2) point to PICTURE_READING.md. The sticker rules (§6) name SHINY. The file plan, line list and art list lose the fish-dog rows and gain the new ones | – (orchestrator) |
| D3 | `docs/SCRIPT_STYLE.md` · 24 | ORD | the demo example "Fish came first. So I tap this row." → a sentence from ROWS or from the slider demo | – (orchestrator) |
| D4 | `docs/MAP_DESIGN.md` · 43, 94, 417, 542 | FD | the replay question is REPLAY; the screenshot label "the fish-dog" becomes "Ninja Reading" (re-shoot `map-design/final/shots/new-844x390-confirm.jpg` if the mockup is shown again); the example on line 542 "(Jonas's example, 'the fish-dog game')" stays as a quote but gets "(retired 27 Sep)" | – (map-and-confirm; the follow-up builds it) |
| D5 | `docs/CONFIRM.md` · 325 | FD | "the fish-dog, mat, scroll and story stones" → "the Ninja Reading, mat, scroll and story stones" | – (map-and-confirm) |
| D6 | `docs/CHEATS.md` · 53, 90, 105 | FD | "the shiny fish-dog" → "the shiny sticker (`WARMUPS.W2.shiny`)" | – (cheat-menu) |
| D7 | `docs/NAVIGATION.md` · 61, 62, 429 | FD | the W2 flow row becomes the slider's steps; Reward 2's rows say "the shiny sticker" | – (orchestrator) |
| D8 | `docs/ART_STYLE.md` · 51 (54 is FP) | FD | `PIC_LIVING`'s example "(or a character such as the snowman or the fish-dog)" → "…such as the snowman" | – (orchestrator) |
| D9 | `docs/FEEDBACK.md` · 117–119, 121, 141 (206 is today's ⏳ item, in Jonas's own words: keep it) | FD, ORD | the ✅ "Left-to-right warm-up" entry and the Reward 2 note gain "(replaced 27 Sep by picture reading v2 and the read slider: docs/PICTURE_READING.md)". Line 206 is ticked when v2 ships | – (orchestrator) |
| D10 | `docs/architecture/activities.md` · 120, 213 | FD, ORD | the `rail` row's `fm_pair_fish_dog` and "tapping dog before fish" become the slider's activity and its right-to-left judgement | – (the architecture docs; code in `src/core` is F2's) |
| D11 | `docs/architecture/content.md` · 108 | FD | `idea:left-to-right`'s example `fm_read_fish_dog` → SHOW's line | – |
| D12 | `docs/architecture/director.md` · 31 | FD | "Reward 2: the shiny fish-dog sticker" → "the shiny sticker" | – |
| D13 | `docs/architecture/engine.md` · 141, 143 | FD | "a reward such as the fish-dog", `shiny: "fishdog"` → SHINY | – |
| D14 | `docs/map-design/final/index.html` · 220 | FD | the mockup's `KIND_ICON.picread: "pic_fishdog"` → `pic_<SHINY>`, so the built map copies the right thing | – (map-and-confirm) |
| D15 | `docs/map-design/final/lines.js` · 35 | FD | `tv_map_replay_picread`'s text → REPLAY | – (map-and-confirm) |

### 7.2 History that stays as it is (16 files)

Nobody edits these for the fish-dog. They record what was said, decided or built at the time.

| File · lines | Why it stays |
|---|---|
| `docs/DECISIONS.md` · 46, 56, 99, 106 (137 is FP) | past decisions; the P3 integrator (the only editor) adds a new row: "27 Sep: the fish-dog and dog-fish retire; picture reading uses real compound words on the read slider; saves rename `fishdog` to SHINY" |
| `docs/SCRIPT_FIXES.md` · 446; `docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md` · 463, 484, 836 | the running big fix's plan (C2.5 "drop `after` on W2's demo", the "Fish dog! never twice" acceptance, TV-P1's id list). P3 notes that picture reading v2 supersedes these |
| `docs/map-design/audit.md` · 51; `docs/map-design/final/shots/audio-check.json` · 63, 78 | an audit of the old map, and a QA record of the recorded line |
| `docs/teacher-voice/*` (9 files, 109 lines: `current.md`, `current-transcript.md`, three drafts, three judges, `mechanics.md`) | the drafts and judgements TEACHER_SCRIPT was built from |
| `CHANGELOG.md` · 5, 6 | released notes. The next release's entry says what replaced the fish-dog, without naming Mentava |
| `PROMPTS.md` · 523 | Jonas's verbatim prompt (it names Mentava; the file is public on GitHub by his choice). Today's prompt, which says "stealing from Mentava", is added at the next backup push (QUEUE 10). That is Jonas's call, noted here so nobody is surprised |

---

## 8. Outside the app: landing, tweet kit, clips, showcase, the live site

| # | Where | What is there | What it becomes | Owner |
|---|---|---|---|---|
| X1 | **Landing** (`index.html`, `landing/landing.ts`, `landing/landing.css`) | nothing: no fish, no dog. The clips are battle, run, dojo, swap, story, boss, flower and trial; og and twitter use the trailer | no change | landing-fixes (done) |
| X2 | **Tweet kit, public on R2** (`superninja-share/<r2-prefix.txt>/`) | `fish-dog.mp4` and `fish-dog.jpg` **still answer 200** (checked 09:45), though `index.html` no longer links them. The public `tweet.md` says (line 20) "The fish-dog clip is withdrawn: fish-dog is being replaced in the game **(too close to Mentava)**" | delete the two objects (`npx wrangler r2 object delete superninja-share/<prefix>/fish-dog.mp4 --remote`, and the same for `.jpg`; Jonas's personal Cloudflare account, via Doppler as in `upload-kit.sh`). Reword tweet.md line 20 to "The picture-reading clip is withdrawn while the game changes", without naming Mentava, then re-upload `tweet.md`. The zip holds no fish-dog | – (the tweet workflow, done; the orchestrator, since this acts on Jonas's account) |
| X3 | **Tweet kit, local** (`assets-src/tweet/2026-09-26/`) | `fish-dog.mp4` and `.jpg`; `fish-dog/` (`cut.ts`, `drive.ts`, 24 raw takes); `recipe-tests/fish-dog.*` (9 files); the `fish-dog` recipe in `clip-recipes.ts` (137–146); tweet.md 20 | move `fish-dog.*`, `fish-dog/` and `recipe-tests/fish-dog.*` to `.trash/tweet-2026-09-26-fish-dog/`. Remove the recipe (or mark it `withdrawn: true`) so no kit rebuild picks it up | – (orchestrator) |
| X4 | **Game clips** (`assets-src/clips/2026-09-27/picread/`) | `picread-1..3.mp4` and `.jpg`: W2's fish-dog, and W4's "fish dog cat". `drive.ts` 3, 4, 27 (`slips: [{ beat: "rail", want: "fish", tap: "dog" }]`); `cut.ts` 7. The dojo, ears and firstsound `cut.ts`/`drive.ts` only mention "the fish-dog cut" in comments (FP) | re-shoot after v2 (QUEUE 9), with the slider's right-to-left slip in place of the fish/dog tap slip | – (game-clips-and-enemy-supercut) |
| X5 | **Showcase, public on R2** (`playtest/showcase/index.html` 21, `clips/picread-1..3`; `superninja-share/showcase-2026-09-27-<prefix>/`) | the "Picture reading" section, "left to right: fish… dog → fish-dog", with the three picread clips, **all answering 200** | swap in X4's new clips and caption and re-upload (`upload.sh`); until then, drop the section and delete the three clip objects | – (orchestrator) |
| X6 | **The live app** (superninja.templestein.com) | P1–P26, the map stones, W2, W4 and Reward 2 | gone at the first release after §3–§6 land | release (QUEUE 10) |

---

## 9. Adjacent: not the fish-dog, same pattern (the designer decides)

- **W2's `which` turn on cat/dog** (`warmups.ts` W2 `which` rows `[["cat","dog"],["dog","cat"]]`; lines `fm_which_cat_dog`, `fm_pair_cat_dog` "Cat dog!", `tv_which_q_cat_dog`, `tv_which_fix_cat_dog` and their words.json). It is the same nonsense pair the Mentava pattern uses. If picture reading v2 keeps only real compounds read left to right ("rainbow, not bow rain"), these go too.
- **Fish and dog as ordinary pictures**: `pic_fish`, `pic_dog`, `fm_name_fish`, `fm_name_dog`, `fm_diff_fish`, `fm_diff_dog`, `fm_not_in_dog`, `mid_dog`, W2's Pocket Hunt grid, and W3, W5 and W6's dog. They stay. They are ordinary words; only the §1 rule applies.
- **Real compounds with fish or dog in them** (`starfish`, and word clips such as `catfish`, `hotdog` and `fishbowl`) stay. They are real words, not the fish-dog.
- **Pictures already drawn that could make compounds** (so the designer knows what's free): sun+flower, star+fish, rain+bow and snow+man already have their wholes. Parts with no whole drawn yet include cup+cake, pan+cake, tea+cup, sea+shell, sea+horse, hedge+hog, arm+chair, ear+ring, key+hole, cow+boy and rain+coat (new pictures `public/a/i/pic_<word>.webp` via `scripts/gen-art.ts`).

---

## 10. Order of work, and how we know it's gone

1. **The designer**: compounds.ts and PICTURE_READING.md fill the slots (§1).
2. **The read-slider workflow (new files only)**: the pictures and word clips for the new parts and wholes, the lines block at the end of `LINES` (its ids only via `gen-audio --only`), ReadSlider, the harness, and the fix requests citing this file's rows.
3. **One release, in this order**: the save migration (§6) with S6, S20–S23 and T1; then W2 and W4 on the slider (S1–S3, S10), the map icon and Confirm (S6, S24–S25, D14–D15), Reward 2 (S7, LIST2, SHINY_LINE), `RETIRED_LINES` and the tags (S9, S12–S13), then S14–S19; then P1–P26 move to `.trash/`.
4. **Outside**: X2–X5.
5. **Docs**: D1–D15 and the DECISIONS row.

**Checks**, run after step 3:
- This returns nothing (POSIX classes, so it runs the same on macOS's grep):
  ```sh
  grep -rIn -i -E "fishdog|dogfish|fish[-_ ]dog|dog[-_ ]fish|fish(\.\.\.|…)[[:space:]]*dog|dog(\.\.\.|…)[[:space:]]*fish" src scripts/treadmill public/a/l index.html landing \
    | grep -v -E '^src/content/compounds\.ts:|^src/engine/store\.test\.ts:|^src/engine/store\.ts:[0-9]+:.*(const RENAMED|the fish-dog retires)|^src/content/lines\.ts:[0-9]+:[[:space:]]*// fish-dog: real compound words'
  ```
  The second grep drops the mentions that stay for good, because they are what does the retiring:
  - `src/content/compounds.ts`: the header's "No fish-dog, no dog-fish", the docs of `SHINY` and `RENAMED_STICKERS`, and `RENAMED_STICKERS = { fishdog: SHINY, dogfish: null }` itself;
  - `src/engine/store.ts`: the migration's `const RENAMED = { fishdog: "rainbow", dogfish: null }` and its doc comment ("the fish-dog retires", §6); and the migration's tests (`src/engine/store.test.ts`, or wherever F1 puts them, since their saves hold `"fishdog"` and `"dogfish"`);
  - `src/content/lines.ts`: the read-slider block's opening comment ("No fish-dog: real compound words…", its second line).
  Until P1–P26 have moved, the retired ids' own `LINES` and `RETIRED_LINES` entries also show, and so does the r2 block's comment (lines.ts line 551, which names the dog-fish while `r2_dog_fish` is in `LINES`). Nothing else may. The check was tried on 27 Sep: of today's 105 hits, the filter drops exactly the seven standing ones.
- `ls public/a/i/pic_fishdog.webp public/a/i/pic_dogfish.webp` finds neither.
- The first-session transcript (`scripts/treadmill/continuous.ts --persona perfect`, and learner) contains no "fish dog", "dog fish", "fish-dog" or "silly animal", and W2's transcript shows SHOW said slow, then fast.
- The migration tests in §6 pass, and a save that already had the old Reward 2, replaying W2, gets Reward 2's short form (`mode: "short"`), not the first-time show.
- R2: `curl -sI …/fish-dog.mp4` and the showcase's `picread-*.mp4` return 404, or their replacements.
