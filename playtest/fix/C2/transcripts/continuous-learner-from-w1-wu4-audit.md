# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/runs/fix/C2/cont-w4/continuous-learner-from-w1-wu4.json (learner-from-w1-wu4, one continuous page)

64 Sensei lines, 41 sounds and words, 39 utterances in 11 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_guess_q | 6 | Listen for the word... |
| fm_which_pic | 2 | Which picture is it? |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_map_hint | 1 | The glowing stone is your next game. Tap it when you're ready. |
| tv_rail_again | 1 | It's Ninja Reading again. This time, there are three pictures. |
| fm_name_cat | 1 | This is a cat. |
| fm_name_dog | 1 | This is a dog. |
| fm_name_fish | 1 | This is a fish. |
| tv_rail_yours | 1 | Now you read them. |
| tv_rail_turn | 1 | Tap each picture, starting on this side. |
| fm_triple_cat_dog_fish | 1 | Cat dog fish! |
| fm_l4_swap | 1 | Now they're the other way round. Fish... dog... cat. Fish dog cat! |
| tv_next_game | 1 | When you're ready for the next game, tap the green arrow. |
| tv_which_again | 1 | Here are two rows again. I'll read one, and you tap it. |
| tv_which_q_fish_dog_cat | 1 | Here I go. Fish... dog... cat. Which row did I read? |
| fm_triple_fish_dog_cat | 1 | Fish dog cat! |
| tv_squish_again | 1 | It's Word Squish again. Two little words make one big word. |
| fm_name_rain | 1 | This is rain. |
| fm_name_bow | 1 | This is a bow. |
| fm_rainbow_q | 1 | Rain... bow. Tap the rabbit, and say them fast. |
| fm_rainbow | 1 | Rainbow! |
| tv_praise_squish | 1 | You squished them into one big word! |
| fm_name_snow | 1 | This is snow. |
| fm_name_man | 1 | This is a man. |
| fm_snowman_q | 1 | Snow... man. Tap the rabbit, and say them fast. |
| fm_snowman | 1 | Snowman! |
| tv_w4_done | 1 | You read three pictures in a row, the ninja way. |
| fm_rw_look | 1 | Look! Your pictures are turning into stickers! |
| tv_rw_book | 1 | This is your Sticker Book! Tap it to open it. |
| tv_rw_every | 1 | Every picture you play with becomes a sticker. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (2)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_guess_q | 2 | Listen for the word... | level w1-wu5 @180.8s and @193.5s |

### Spliced utterances: 8 of 39 (21%); chains of 5+ clips: 10

Commonest spliced shapes:

- ×1 ‹tv_guess_frame› + ‹tv_my_sounds› + /X/ + /X/ + /X/ + ‹tv_guess_so_sun› + ‹tv_ready_first›
- ×1 ‹fm_name_map› + ‹fm_name_mop› + ‹tv_guess_q› + /X/ + /X/ + /X/
- ×1 W + ‹tv_fs_say_sounds_slow› + /X/ + /X/ + /X/
- ×1 ‹fm_name_cap› + ‹fm_name_bag› + ‹tv_guess_q› + /X/ + /X/ + /X/
- ×1 ‹fm_name_bug› + ‹fm_name_bun› + ‹tv_guess_q› + /X/ + /X/ + /X/
- ×1 ‹fm_name_van› + ‹fm_name_fan› + ‹tv_guess_q› + /X/ + /X/ + /X/
- ×1 ‹fm_name_jug› + ‹fm_name_mug› + ‹tv_guess_q› + /X/ + /X/ + /X/
- ×1 ‹fm_name_sun› + ‹fm_name_bus› + ‹fm_last_one› + ‹tv_guess_q› + /X/ + /X/ + /X/

Longest chains:

- level w1-wu5 @134.6s (7 clips): I'll say the sounds, and you listen for the word. My sounds are... /s/ /u/ /n/ I can hear sun. So I tap the sun. Look, your ninja is ready. Are you ready too? Tap the green arrow.
- level w1-wu5 @232.3s (7 clips): This is the sun. This is a bus. Here's the last one. Listen for the word... /b/ /u/ /s/
- level w1-wu4 @11.9s (6 clips): This is a cat. This is a dog. This is a fish. Now you read them. Tap each picture, starting on this side. "cat"
- level w1-wu5 @149.7s (6 clips): This is a map. This is a mop. Listen for the word... /m/ /a/ /p/
- level w1-wu5 @177.8s (6 clips): This is a cap. This is a bag. Listen for the word... /k/ /a/ /t/
- level w1-wu5 @190.4s (6 clips): This is a bug. This is a bun. Listen for the word... /b/ /u/ /g/
- level w1-wu5 @201.7s (6 clips): This is a van. This is a fan. Listen for the word... /f/ /a/ /n/
- level w1-wu5 @218.1s (6 clips): This is a jug. This is a mug. Listen for the word... /j/ /u/ /g/

### Praise: 0 lines (0.0 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 1

- level w1-wu5 @146.2s: "Look, your ninja is ready. Are you ready too? Tap the green arrow." cut after 3.5 of 4.2 s by This is a map.

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C(w1-wu4)-L: playtest/runs/fix/C2/cont-w4/continuous-learner-from-w1-wu4.json

learner, from w1-wu4, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 1 | **FAIL** |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.47 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 1 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.6 s (sounds w1-wu5); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 20 words (median line 4 words; 15 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 1 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 1 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 1 a level, 1 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | n/a | n/a |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | n/a | n/a |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 5.4 s (sounds w1-wu5); 0 over | pass |

- **map-hint-cut**: stone 1: w1-wu4 @0:05.3 ‹tv_map_hint› "The glowing stone is your next game. Tap it when you're ready." cut
- **line-60s**: ‹tv_guess_q› "Listen for the word..." from w1-wu5 @2:33.0
- **cut-explanations**: stone 1: w1-wu4 @0:05.3 ‹tv_map_hint› "The glowing stone is your next game. Tap it when you're ready."

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

