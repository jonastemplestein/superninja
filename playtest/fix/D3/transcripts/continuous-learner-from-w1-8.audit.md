# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/runs/fix/D3/r7/cont-w1-8/continuous-learner-from-w1-8.json (learner-from-w1-8, one continuous page)

257 Sensei lines, 261 sounds and words, 180 utterances in 25 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_swap_both | 12 | Listen to them both... |
| tv_swap_now_change | 10 | Now let's change it to... |
| tv_swap_pick | 10 | Now tap the new one. |
| st_what_change | 9 | What do we need to change? |
| tv_which_changes | 8 | Which sound changes? |
| st_first_changes | 7 | Yes, the first sound changes! |
| st_middle_changes | 6 | Yes, the middle sound changes! |
| st_last_changes | 5 | Yes, the last sound changes! |
| streak_3 | 4 | Ninja power! |
| thats | 4 | That's... |
| stays_same | 4 | That sound stays the same. |
| swap_which | 4 | Which sound needs to change? |
| first_sound_q | 4 | What's the first sound? |
| tv_swap_read_first | 3 | First, let's read this word. Tap each sound, and say it with me. |
| tv_both_again | 3 | Listen to them both again... |
| tv_fs_say_slow | 3 | Let's say it the slow way... |
| tv_fs_now_fast | 3 | And now, fast... |
| audit_gem_more | 3 | Look, this gem has filled a little more. |
| tv_petal_say | 3 | Tap the petal, and say it with me. |
| tv_let_me_listen | 3 | Hmm, let me listen. |
| tv_together | 3 | Let's do this one together. |
| first_q | 3 | Which one starts with... |
| tv_tap_it_say | 3 | Now you tap it, and say the sound. |
| tv_by_yourself | 3 | Now you do one all by yourself. |
| last_sound_q | 3 | What's the last sound? |
| tv_here_sound | 3 | Here's the sound... |
| tv_praise_swap | 3 | You changed just one sound. |
| tv_fs_rabbit_read | 2 | Now tap the rabbit, and read the word fast. |
| tv_swap_done | 2 | You fixed all of Baron's muddled words! |
| fm_rw_more | 2 | More stickers for your Sticker Book! |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (5)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 1 | Which of these is the way we write... | level w1-10 @430.9s and @439.4s |
| swap_which | 1 | Which sound needs to change? | level w1-12 @818.2s and @828.8s |
| tv_both_again | 1 | Listen to them both again... | level w1-12 @878.4s and @890.6s |
| tv_which_changes | 1 | Which sound changes? | level w1-12 @885.1s and @895.3s |
| st_what_change | 1 | What do we need to change? | level w1-12 @935.4s and @946.0s |

### Spliced utterances: 54 of 180 (30%); chains of 5+ clips: 40

Commonest spliced shapes:

- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_swap_change_to› + W + W + W + ‹tv_swap_kick›
- ×1 /X/ + ‹tv_swap_in›
- ×1 ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹streak_lost› + ‹thats› + /X/ + ‹stays_same› + ‹tv_both_again› + W + W + ‹swap_which›
- ×1 /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_run_lanterns› + ‹tv_guess_q› + /X/ + /X/
- ×1 ‹tv_fs_say_slow› + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×1 ‹tv_guess_q› + /X/ + /X/ + /X/
- ×1 ‹tv_first_again_new› + ‹tv_first_sound› + /X/ + ‹tv_petal_say›
- ×1 ‹tv_ido_pair_nut_hat› + ‹tv_let_me_listen› + W + ‹fs_nut› + /X/ + ‹tv_so_i_tap›
- ×1 ‹fm_name_web› + ‹first_q› + /X/
- ×1 ‹fs_nest› + /X/ + ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹tv_tap_it_say› + /X/
- ×1 ‹fm_name_net› + ‹first_q› + /X/
- ×1 ‹fs_net› + /X/ + ‹tv_fs_gaps›

Longest chains:

- level w1-12 @922.3s (11 clips): /m/ /a/ /n/ "man" Ninja power! Now let's change it to... "map" Listen to them both... "man" (slowly) "map" (slowly) What do we need to change?
- level w1-8 @67.5s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-12 @835.5s (10 clips): /t/ /a/ /n/ "tan" Now let's change it to... "pan" Listen to them both... "tan" (slowly) "pan" (slowly) What do we need to change?
- level w1-12 @855.2s (10 clips): /p/ /a/ /n/ "pan" Ninja power! Now let's change it to... "pat" "pan" (slowly) "pat" (slowly) What do we need to change?
- level w1-12 @902.5s (10 clips): /m/ /a/ /t/ "mat" Now let's change it to... "man" Listen to them both... "mat" (slowly) "man" (slowly) Which sound needs to change?
- level w1-8 @133.4s (9 clips): /a/ /t/ "at" Now let's change it to... "it" Listen to them both... "at" (slowly) "it" (slowly) What do we need to change?
- level w1-8 @117.6s (8 clips): Keep going, ninja. That's... /a/ That sound stays the same. Listen to them both again... "am" (slowly) "at" (slowly) Which sound needs to change?
- level w1-10 @365.9s (8 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it.

### Praise: 8 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 17

- level w1-8 @24.1s: "Now tap the rabbit, and read the word fast." cut after 0.4 of 3.5 s by "mat"
- level w1-8 @29.8s: "I'll show you first. Are you ready to watch? Tap the green arrow." cut after 2.9 of 4.1 s by I'll change it to...
- level w1-8 @60.7s: "What do we need to change?" cut after 0.9 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @78.2s: "What do we need to change?" cut after 0.9 of 1.8 s by Ninja power!
- level w1-8 @126.3s: "Which sound needs to change?" cut after 1.4 of 2.1 s by Yes, the last sound changes!
- reward @166.2s: "Look, a gem! Each gem holds a way to spell a sound. When you get words" cut after 6.6 of 7.4 s by Wow, you got everything right! Grown-ups, if this 
- level w1-10 @365.1s: "Tap the petal, and say it with me." cut after 0.1 of 2.5 s by /p/
- level w1-10 @426.1s: "Pin starts with..." cut after 1.4 of 1.7 s by /p/
- level w1-10 @461.6s: "Now tap the rabbit, and read the word fast." cut after 2.9 of 3.5 s by "an"
- level w1-11 @557.8s: "It's Sound Hunt again, with a new sound." cut after 3.1 of 3.4 s by Here's the sound...
- level w1-12 @760.1s: "What do we need to change?" cut after 0.8 of 1.8 s by Yes, the middle sound changes!
- level w1-12 @828.8s: "Which sound needs to change?" cut after 1.0 of 2.1 s by Yes, the middle sound changes!
- level w1-12 @846.1s: "What do we need to change?" cut after 0.4 of 1.8 s by Yes, the first sound changes!
- level w1-12 @895.3s: "Which sound changes?" cut after 1.2 of 1.9 s by Yes, the first sound changes!
- level w1-12 @913.6s: "Which sound needs to change?" cut after 1.3 of 2.1 s by Yes, the last sound changes!
- level w1-12 @935.4s: "What do we need to change?" cut after 1.0 of 1.8 s by Yes, the last sound changes!
- level w1-12 @984.4s: "Which sound changes?" cut after 0.6 of 1.9 s by Yes, the middle sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_more "Look, this gem has filled a little more." | 3 | reward ×3 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C(w1-8)-L: playtest/runs/fix/D3/r7/cont-w1-8/continuous-learner-from-w1-8.json

learner, from w1-8, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_1 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 3 (0 repeats) | pass |
| `swap-place-heard` swap place lines heard to the end | all | 18 of 18 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.01 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 2 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.5 s (run w1-9); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 13 words (median line 5 words; 83 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 3 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 6 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 3 of 4 (75%) | **FAIL** |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 62 of 62, rabbit 31 of 31 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 2 of 2 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 12.3 s (soundhunt w1-11); 1 over | **FAIL** |

- **cut-explanations**: reward @2:46.2 ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words"
- **unframed-turn**: swap (w1-8 0:07.4): out of order (frame 8.4, demo 32.7, ready 30.0, hand-over 49.9). Opens: "Oh dear. Baron Muddle has been muddling up words." · "First, let's read this word. Tap each sound, and s"
- **fs-readback**: swap (w1-8 @0:47.0): no fast lead before [sat]. Heard: /s/ /a/ /t/ · [sat]; (not judged) soundhunt (w1-11 9:18.3, land 1): no read-back heard
- **fs-talk**: soundhunt (w1-11) 12.3 s from ‹tv_fs_made› "Every word is made of little sounds, one by one." to ‹tv_hunt_q› "Which one has this sound in the middle...", with ‹tv_fs_made› "Every word is made of little sounds, one by one."

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 1 of 494 | **FAIL** |

- ‹tv_confirm_replay› 3.4 w/s "Do you want to go back and play this game again?"
