# First-minutes assets

The audio and art for docs/FIRST_MINUTES.md, made on 26 September 2026. No game code was touched: no scenes, App, ui or styles.

## What is ready

- **Lines:** all 89 lines from Appendix A are recorded, and each one's words were checked blind.
- **Word clips:** the eight new picture-only words are recorded.
- **Pictures:** 18 word pictures (8 new, 10 redrawn) and 9 non-word pictures. They are cut out and published as webp files in `public/a/i/`.
- **Picture names:** `src/content/pic-names.ts` has been regenerated from a new blind audit of all 168 pictures.

**Still to do** (these belong to the implementation):
- held-first-sound clips (`public/a/o/`);
- word timings (`*.words.json`);
- the 14% re-pad and `pic-plates.gen.ts`;
- splitting PIC_STYLE into PIC_OBJECT and PIC_LIVING;
- `segs` on ORAL_WORDS;
- −18 LUFS loudness.

See "For the implementation agents" below.

---

## Files

### Content (`src/content/`)

- **`lines.ts`:** one new block, `// ---- First minutes (docs/FIRST_MINUTES.md)`, placed between Grown-ups and Baron Muddle. It holds the 89 `fm_*` lines, all Sensei's, with the ids and text exactly as in Appendix A. No other line was changed.
- **`phonics.ts`, picture prompts** (only the text after `|`). Ten were rewritten: dog, fish, pig, man, fox, frog, duck, hat, mat and sit.
  - Five of them had face wording added on top of the Appendix B prompt, because the manifest's `PIC_STYLE` still says "NO face": fox, man, duck, frog and sit. See the art notes.
- **`phonics.ts`, `ORAL_WORDS`:** gains sausage (s), moon (m), flower (f), sunflower (s), star (s), starfish (s), fishdog (f) and dogfish (d), each with a `pic` and a `first` sound. None has `segs` yet.
- **`pic-names.ts`:** regenerated from `playtest/runs/pics-fm`.

### Scripts

- **`scripts/gen-first-minutes-art.ts`** (new) makes the non-word art. It uses `makeImage` and the house `STYLE`, plus local copies of §11's PIC_OBJECT and PIC_LIVING.
  - It merges its 9 jobs into `assets-src/art-jobs.json` so that `post-art.py` can cut them out.
  - `scripts/export-art-jobs.ts` rewrites that file from the manifest and drops the 9 jobs again. To put them back without Doppler, run `bun scripts/gen-first-minutes-art.ts --export`.

### Audio

- **`public/a/l/fm_*.mp3`:** 89 clips, voice Sulafat, finished by the house `finishAudio`.
- **`public/a/w/`:** sausage, moon, flower, sunflower, star, starfish, fishdog and dogfish.
- **`assets-src/audio-report.json`:** has an entry for each clip.

### Art

Each picture has a raw file in `assets-src/art/<id>.png`, a cut-out in `assets-src/cut/<id>.png` and the published `public/a/i/<id>.webp`.

| id | webp size | Notes |
|---|---|---|
| pic_dog, pic_fish, pic_pig, pic_man, pic_fox, pic_frog, pic_duck, pic_hat, pic_mat, pic_sit | 384 wide | Redraws. Every animal and person now has a face and faces the viewer (the pig is side-on and smiling round at the viewer). |
| pic_sausage, pic_moon, pic_flower, pic_sunflower, pic_star, pic_starfish, pic_fishdog, pic_dogfish | 384 wide | New. |
| opt_teddy | 512×629 | |
| opt_school | 512×525 | Red brick, blue door, bell tower. Green railings in front stand in for the gate. |
| class_door | 500×895 | Drawn at 3:4. Sunny yellow, slightly ajar, round window. No light is visibly spilling out. |
| hero_kai_school, hero_suki_school | 640×858, 640×837 | Red jumper and blue book bag over the ninja outfit. On-model with hero_*_idle. |
| item_think_cloud | 320×251 | No face, so the UI's "?" sits on a plain cloud. rembg kept only one of the two trailing puffs. |
| ui_rabbit, ui_tortoise | 256×258, 256×169 | Both face right. |
| item_sticker_book | 512×528 | Red leather, gold shuriken clasp, three-quarter view. |

### Checks and tools

- **`playtest/runs/fm-lint/`:**
  - `jev-lines.json` is the full linter run;
  - `jev-lines-fm-context.json` re-lints the fm lines with their real on-screen context;
  - `blind-audio.json` holds the blind transcriptions and durations;
  - `tools/` holds the check scripts: `islands.py` (speech islands and a trailing-hiss check), `fall.py` (the pitch fall at a lead-in's end), `fm-lint-context.ts` and `fm-blind.ts`.
- **`playtest/runs/pics-fm/`:** `pics.json` and `pics-all.json`, the blind picture audit of all 168 pictures.
- **`playtest/jev/lines.json`:** rewritten by the linter, as usual.

### Trash (`.trash/`)

- **`first-minutes-art/original/`:** the ten old pictures (raw, cut and webp).
- **`first-minutes-art/take1/` and `take2/`:** rejected takes.
- **`first-minutes-audio/take1–5/`:** rejected takes of `fm_rw2_s`. Take 5 was kept; the `.rejected` copy in `take5/` is a duplicate of it.
- **`first-minutes-audio/falling/`:** the first takes of the three lead-ins that were re-recorded.

---

## Audio checks

**The judge** (the gen-audio rubric) gave all 97 clips 10/10.

**Blind transcription:** 95 of the 97 clips matched their script word for word on the final pass. Neither miss is a real problem:
- `fm_opt_grownups` was heard as "grown-up settings". Spoken aloud, "grown-ups' settings" sounds the same.
- `fm_l1_hello` was once heard as "Ninja is on". Five more tries at temperature 0.8 all heard "Ninja ears on".
- The transcriber sometimes adds an "s" after "…start with" (`fm_rw2_s`, `fm_notice_sun_sock`). The speech-island check shows no sound there, so this is the model guessing from context.

**Stray /s/ in `fm_rw2_s`:**
- The TTS added a hissed /s/ after "They all start with..." in 4 of 5 takes: a separate island of 0.5 s, 96% hiss.
- Take 5 is clean and is the one installed.
- The judge scored the bad takes 10/10, so the lead-in check needs a trailing-island test (`tools/islands.py`).

**Suspended endings** (§12 rule 2: a lead-in's pitch falls no more than 2 semitones over its last 300 ms). Three clips fell too much and were re-recorded in the same voice, then checked with the judge, the blind transcription and the hiss test:

| Clip | Before | After |
|---|---|---|
| fm_slow | −7.7 st | +0.6 st |
| fm_slow_another | −2.9 st | +3.7 st |
| fm_notice_sun_sock | −9.3 st | +8.7 st |

All eleven fm lead-ins now pass: fm_slow_listen, fm_tap_all_start, fm_found_both, fm_look_this, fm_quick_tap_all, fm_rw2_s, fm_tap_all_in and fm_tap_all_words_in were already fine. The reused `t_everyone_say` falls 4.3 st, but it is a complete sentence, so rule 2 allows it.

**Sounds~Write lint:**
- The full linter found no rule breaks in the fm lines.
- It gave two minor "unclear" flags, for `fm_l2_turn` and `fm_starfish_q`. It only reads `// --- ` headers, so it filed the `// ----` block under **Grown-ups** ("Settings area for adults").
- Re-linted with each line's real screen context (`tools/fm-lint-context.ts`), the fm lines get **0 findings**. No wording was changed.
- The rest of the linter's 30 findings are about older lines, such as the letter-name false positives on "bee".

**Durations** (seconds; full list in `blind-audio.json`). These can overrun the timings in the spec:

| Where | Clips | Total | Budget |
|---|---|---|---|
| L1 beat 4 | fast_sun 2.0, slow 1.7, [x sun], same_word 3.3, hear_sounds 7.2 | about 15.7 s with the stretched word | 14 s |
| L2 beat 6 | big_word 2.9, name_flower 1.2, sunflower 5.7 | about 9.8 s | 8 s |
| L2 beat 4 | l2_swap | 6.0 s | 5 s |
| Reward 2 | rw2_list | 6.9 s | a 5 s window |
| Reward 2 | rw2_s | 5.9 s + [/s/] | a 5 s window |
| Reward 2 | rw2_petal | 5.7 s | a 5 s window |
| Opt-in, Year Two | ok_y2 4.9 + grownups 3.3 | 8.2 s | a tight window |

- Expect Reward 2 to take about 30 s, not 26.
- The opt-in question and its two labels come to 6.2 s.

---

## Picture checks

The blind audit (`playtest/runs/pics-fm`) is a 4-year-old persona, run on a cream background.

**Named correctly** (the intended word first):

| Picture | Top name | Other names |
|---|---|---|
| fish | 75% | goldfish 15% |
| sausage | 85% | |
| moon | 92% | banana 3% |
| flower | 90% | |
| sunflower | 60% | flower 35% |
| star | 90% | |
| starfish | 65% | star 30% |
| pig | 70% | |
| man | 60% | boy 30% |
| fox | 85% | |
| frog | 80% | |
| duck | 65% | |
| hat | 65% | bobble hat 25% |
| mat | 45% | rug 45% (a tie) |

**Still not named as the word:**

| Picture | What the persona said | Verdict |
|---|---|---|
| dog | doggy 55%, puppy 30%, dog 15% | `pics-to-content` counts "doggy" as the word, so dog stays usable. Fine for naming, since Sensei says "This is a dog." |
| fishdog | doggy 45%, fish 35% | Expected: it is the hybrid gag. Now in PIC_NAMES with first sound ✗. |
| dogfish | doggy 45%, fishy 35% | Expected. Now in PIC_NAMES with first sound ✓ (/d/). |
| sit | sitting 50%, girl 35% | Counts as the word ("sitting"). Keep it out of picture-only games anyway, as §11 says. |
| mat | the rug tie above | Use it only beside its written word, as planned. |

**Unchanged pictures** also moved in PIC_NAMES, because the new pictures changed which pictures were batched together:

| Change | Pictures | Effect |
|---|---|---|
| Newly listed | bug (beetle), desk (table), jump (boy), rain (cloud) | desk, jump and rain now fail `picSaysFirst`; bug (beetle) keeps /b/, so it still passes |
| Listed with a new name | hill (sweet), hop (baby), jet (plane) | |
| No longer listed | queen, squid, stamp | they now pass `picSaysFirst` |

The same persona scores are behind all of these. Rerun the audit if a noisy entry matters.

**How the takes went** (at most three per picture):
- **Take 1:**
  - fox, man and duck had no face;
  - sit came out as a red robot;
  - frog had hollow eyes;
  - star was an olive-mustard colour;
  - the cloud had a smiley face.
- **Take 2:**
  - fox, man, duck, frog and the cloud were right;
  - sit was an empty chair;
  - star was drawn on a grey card.
- **Take 3:** sit and star were right.

---

## For the implementation agents

1. **Faces rely on the prompt text.** `scripts/art-manifest.ts` still adds `PIC_STYLE` ("NO face and NO eyes (unless…)") to every word picture.
   - Fox, man, duck and sit only got faces once their `phonics.ts` prompts said "a friendly face: two eyes and a smile".
   - When you split PIC_OBJECT and PIC_LIVING (§11), keep that wording or regenerate and check.
   - `gen-first-minutes-art.ts` holds copies of both styles; import them from the manifest once they exist there.
2. **The cards are not padded yet.** `post-art.py` still trims to 6 px, so every new webp is a tight crop. The 14% margin and `pic-plates.gen.ts` (§11 "Never clipped") are still to do.
   - Swatches to check by eye: moon and star are meant for the night plate.
   - The white duck, white rabbit, white cloud and pale moon need a plate that isn't cream.
3. **The new ORAL_WORDS reach today's first-sound games.** `Early.tsx` `targets()` adds every oral word whose `first` matches and which passes `picSaysFirst`.
   - moon now joins the /m/ deck in w1-2.
   - sausage, sunflower, star and starfish join the /s/ deck.
   - star and starfish start with the cluster /st/, which the filter for written words excludes. Filter them, or accept it.
   - fishdog is blocked by PIC_NAMES.
   - dogfish would pass for /d/, but no level teaches /d/ as a first sound today.
4. **`segs` for sound dots** (§15) aren't in `ORAL_WORDS`, since that type change is yours. Suggested values:

   | Word | segs |
   |---|---|
   | sausage | s·o·s·i·j |
   | moon | m·oo·n |
   | flower | f·l·ou·schwa |
   | sunflower | s·u·n·f·l·ou·schwa |
   | star | s·t·ar |
   | starfish | s·t·ar·f·i·sh |
   | fishdog | f·i·sh·d·o·g |
   | dogfish | d·o·g·f·i·sh |

5. **Held-first-sound clips** (`public/a/o/`: sssun, sssock, sssausage, sssunflower, mmmoon and fffish) are not made. `gen-stretch.ts` needs its onset mode.
   - The stretched words (`x/`) for sun, sock, cat, dog, bag, jam, van, mug and map all exist.
   - The pure sounds /s/, /a/, /m/ and /ae/ exist.
   - The reused lines (`t_everyone_say`, `how_we_spell`, `t_they_all_have`, `listen_again`, `tut_1`, `map_hint`, `intro_8` and `chose`) exist.
6. **Word timings** (`.words.json`) are not made.
   - `whisper-cli` (`/opt/homebrew/bin/whisper-cli`) is installed, and there is a `ggml-large-v3-turbo.bin` in `~/Library/Application Support/superwhisper/`.
   - On list clips with pauses, its word starts are wrong by about 0.5 s, even with `-dtw`. On `fm_rw1_list` it puts "sock" at 0.48 s against 1.00 s actual, and "sausage" at 2.48 s against 2.98 s.
   - Speech islands (20 ms frames above −40 dB, joined over gaps under 120 ms) come out as exactly one per word there: sun 0.02, sock 1.00, cat 2.04, sausage 2.98, and 3.86, moon 4.30.
   - So snap Whisper's words to the islands' starts.
7. **Loudness:** `finishAudio` normalises to −16 LUFS, while §12 says −18 ±1. Change it globally, or every older clip will stand out next to the new ones.
8. **Lead-in check:** add the trailing-hiss test to gen-audio. The TTS likes to finish "start with..." with its own /s/, and the judge doesn't notice.
9. **Linter context:** the `// ----` header (as asked) puts the fm block under Grown-ups for `jev-lint-lines.ts`. Either add a `// --- First minutes` header or add a "First minutes" entry to its CONTEXT.
10. **`fm_opt_grownups`** says "grown-ups' settings". The Grown-ups screen should use the same words.
