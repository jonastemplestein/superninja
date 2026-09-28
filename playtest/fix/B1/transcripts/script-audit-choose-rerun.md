# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/runs/fix/B1/cont-choose/continuous-perfect.json (perfect, one continuous page)

106 Sensei lines, 19 sounds and words, 65 utterances in 12 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_rhyme | 2 | Tip, tap, tiptoe, quiet as a mouse. |
| film_1 | 1 | Long ago, on the Island of Sounds, there grew a magic World Flower. |
| tv_film_arrow | 1 | When you're ready to see what happens next, tap the green arrow. |
| film_2 | 1 | Every petal was a sound. With sounds, we could talk, and read, and sing! |
| film_3 | 1 | Words, words, WORDS! How I HATE them! |
| film_4 | 1 | I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha! |
| film_5 | 1 | Oh no! The petals blew away, all over the island! |
| film_6 | 1 | The World Flower has gone dark. Now nobody can read! |
| film_7 | 1 | We need a hero. We need... a Super Ninja! |
| film_8 | 1 | Win back every petal, one sound at a time! |
| tv_choose_hello | 1 | Hello! I'm Sensei Maple, and I'm going to be your teacher. |
| tv_choose_q | 1 | First, choose your ninja. Will it be Kai, or Suki? |
| chose | 1 | Great choice! |
| tv_choose_why | 1 | Baron Muddle took the sounds away. We'll win them back by playing games together. |
| tv_choose_ninja | 1 | Your ninja will play every game with you. |
| tv_opt_why | 1 | First, let's find the right games for you. |
| fm_opt_q1 | 1 | Do you go to big school yet? |
| tv_opt_notyet | 1 | If you don't go yet, tap the teddy. |
| tv_opt_yes | 1 | If you do, tap the school. |
| tv_opt_echo_notyet | 1 | Not yet. That's fine. |
| tv_opt_ok_notyet | 1 | Then we'll start with some listening games, just for you. |
| tv_opt_grownups | 1 | Grown-ups, you can change this later in the settings. |
| tv_opt_to_dojo | 1 | Now come with me to the dojo. Tap the green arrow. |
| tv_train_hello | 1 | Welcome to my dojo. A dojo is a school for ninjas. |
| tv_train_tricks | 1 | I'll teach you three ninja tricks. Each one wins a star. |
| tv_train_gong | 1 | Trick one is the gong. Tap it, and your ninja will kick it. |
| tv_train_gong_ok | 1 | Bong! That's your first star. |
| tv_train_help | 1 | Here's trick two. If you're ever stuck, tap me, down here in the corner. |
| tv_train_try_help | 1 | Can you tap me now? |
| fm_help_ok | 1 | That's it! I'm always here to help. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (1)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @130.1s and @138.1s |

### Spliced utterances: 5 of 65 (8%); chains of 5+ clips: 2

Commonest spliced shapes:

- ×1 W + ‹tv_ts_meet› + ‹tv_ts_fast› + W + ‹tv_ts_slow› + W + ‹tv_ready_paw› + ‹fm_tap_tortoise›
- ×1 W + ‹fm_notice_sun_sock›
- ×1 ‹tv_pocket_frame› + ‹tv_pocket_ido› + ‹fs_sun› + /X/ + ‹tv_so_pocket› + ‹tv_pocket_ready_two›
- ×1 W + ‹fm_found_both› + /X/
- ×1 ‹fm_rw_shiny› + ‹fm_rw2_s›

Longest chains:

- level (first minutes) @170.1s (8 clips): "sock" Here are my friends, the rabbit and the tortoise. The rabbit says words fast... "sun" The tortoise says them slowly... "sun" (slowly) Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again. Now you tap the tortoise, and say 
- level (first minutes) @235.8s (6 clips): In Pocket Hunt, we find pictures that start with this sound. I'll find one first. Sun starts with... /s/ So into the pocket it goes! Now you find the other two. Are you ready?

### Praise: 4 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 14

- intro film @9.5s: "When you're ready to see what happens next, tap the green arrow." cut after 1.4 of 3.7 s by Every petal was a sound. With sounds, we could tal
- choose @66.8s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.1 of 4.0 s by Great choice!
- opt-in @97.5s: "Now come with me to the dojo. Tap the green arrow." cut after 1.9 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @107.5s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 1.8 of 4.5 s by Bong! That's your first star.
- dojo welcome @149.0s: "It's a listening game, called Ninja Ears. Tap the green arrow when you" cut after 3.5 of 4.7 s by I'll say a word. Then you find its picture.
- level (first minutes) @163.4s: "Look, your ninja is ready. Are you ready too? Tap the green arrow." cut after 1.3 of 4.2 s by Your word is sock. Can you find the sock?
- level (first minutes) @181.1s: "Do you want to have a go now? Tap the green arrow. Or tap my paw to se" cut after 1.7 of 6.2 s by Now you tap the tortoise, and say it slowly with m
- level (first minutes) @246.0s: "Now you find the other two. Are you ready?" cut after 1.7 of 3.1 s by "sock" (held)
- level (first minutes) @313.7s: "Now you read them. Do you want to have a go?" cut after 1.4 of 3.4 s by Tap each picture, starting on this side.
- level (first minutes) @315.1s: "Tap each picture, starting on this side." cut after 2.0 of 2.7 s by "fish"
- level (first minutes) @333.1s: "When you're ready for the next game, tap the green arrow." cut after 2.4 of 3.4 s by Here are two rows of pictures. I'll read one, and 
- level (first minutes) @345.5s: "Do you want to have a go now?" cut after 1.8 of 2.4 s by Here I go. Cat... dog. Which row did I read?
- level (first minutes) @367.7s: "Two little words make one big word. Now you make one. Are you ready?" cut after 1.8 of 5.0 s by This is a star.
- sticker book @402.1s: "Ooh, a shiny sticker! Fish dog!" cut after 2.9 of 3.3 s by Sun, sock, sausage and sunflower. They all start w

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C-P: playtest/runs/fix/B1/cont-choose/continuous-perfect.json

perfect, a brand-new child, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 0 (day one) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 1 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.68 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 7 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 12.3 s (compound w1-wu2); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 26 words (median line 9 words; 17 turns) | **FAIL** |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 6 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 1 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 1 a level, 1 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | n/a | n/a |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 2 of 2, rabbit 0 of 0 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 6.0 s (fastslow w1-wu1); 0 over | pass |

- **talk-before-action**: compound (w1-wu2) 12.3 s from ‹tv_squish_frame› "Here's a new game, called Word Squish." to ‹tv_squish_ready› "Two little words make one big word. Now you make one. Are you ready?"
- **turn-median**: turns under 8 words: 1 of 17

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 1 of 494 | **FAIL** |

- ‹tv_fs_run› 3.4 w/s "I'll say it the slow way, and you catch the whole word."
