# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/runs/fix/D3/r7/cont-w1-8/continuous-perfect-from-w1-8.json (perfect-from-w1-8, one continuous page)

225 Sensei lines, 246 sounds and words, 162 utterances in 25 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_swap_now_change | 7 | Now let's change it to... |
| tv_swap_both | 6 | Listen to them both... |
| st_what_change | 6 | What do we need to change? |
| st_middle_changes | 6 | Yes, the middle sound changes! |
| tv_which_changes | 6 | Which sound changes? |
| st_first_changes | 6 | Yes, the first sound changes! |
| first_sound_q | 5 | What's the first sound? |
| tv_swap_pick | 4 | Now tap the new one. |
| st_last_changes | 4 | Yes, the last sound changes! |
| last_sound_q | 4 | What's the last sound? |
| tv_swap_read_first | 3 | First, let's read this word. Tap each sound, and say it with me. |
| tv_fs_say_slow | 3 | Let's say it the slow way... |
| tv_fs_now_fast | 3 | And now, fast... |
| tv_petal_say | 3 | Tap the petal, and say it with me. |
| tv_let_me_listen | 3 | Hmm, let me listen. |
| tv_together | 3 | Let's do this one together. |
| first_q | 3 | Which one starts with... |
| tv_tap_it_say | 3 | Now you tap it, and say the sound. |
| tv_by_yourself | 3 | Now you do one all by yourself. |
| tv_your_word | 3 | Your word is... |
| tv_here_sound | 3 | Here's the sound... |
| tv_praise_swap | 3 | You changed just one sound. |
| swap_which | 3 | Which sound needs to change? |
| tv_fs_rabbit_read | 2 | Now tap the rabbit, and read the word fast. |
| tv_yay_thats_it | 2 | That's it! |
| tv_swap_done | 2 | You fixed all of Baron's muddled words! |
| fm_rw_more | 2 | More stickers for your Sticker Book! |
| tv_guess_q | 2 | Listen for the word... |
| tv_run_which | 2 | Tap the lantern with my word. |
| tv_map_hint | 2 | The glowing stone is your next game. Tap it when you're ready. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (7)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_changes | 2 | Which sound changes? | level w1-12 @726.8s and @736.9s |
| tv_guess_q | 1 | Listen for the word... | level w1-9 @180.5s and @195.0s |
| tv_which_write | 1 | Which of these is the way we write... | level w1-10 @380.6s and @387.3s |
| swap_which | 1 | Which sound needs to change? | level w1-12 @746.6s and @756.7s |
| tv_swap_now_change | 1 | Now let's change it to... | level w1-12 @766.9s and @779.0s |
| st_what_change | 1 | What do we need to change? | level w1-12 @791.6s and @802.8s |

### Spliced utterances: 49 of 162 (30%); chains of 5+ clips: 37

Commonest spliced shapes:

- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_swap_change_to› + W + W + W + ‹tv_swap_kick›
- ×1 /X/ + ‹tv_swap_in›
- ×1 ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 /X/ + /X/ + W + ‹tv_yay_thats_it› + ‹tv_swap_now_change› + W
- ×1 ‹tv_run_lanterns› + ‹tv_guess_q› + /X/ + /X/
- ×1 ‹tv_fs_say_slow› + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×1 ‹tv_guess_q› + /X/ + /X/ + /X/
- ×1 ‹tv_first_again_new› + ‹tv_first_sound› + /X/ + ‹tv_petal_say› + /X/
- ×1 ‹tv_ido_pair_nut_hat› + ‹tv_let_me_listen› + W + ‹fs_nut› + /X/ + ‹tv_so_i_tap›
- ×1 ‹tv_together› + ‹fm_name_fan› + ‹fm_name_nest› + ‹first_q› + /X/
- ×1 ‹fs_nest› + /X/ + ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹tv_tap_it_say› + /X/
- ×1 ‹tv_by_yourself› + ‹fm_name_fox› + ‹fm_name_net› + ‹first_q› + /X/
- ×1 ‹fs_net› + /X/
- ×1 ‹tv_next_sound› + /X/ + ‹tv_petal_say› + /X/

Longest chains:

- level w1-8 @65.6s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-12 @705.5s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "pit" Listen to them both... "sit" (slowly) "pit" (slowly) What do we need to change?
- level w1-10 @320.2s (8 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it.
- level w1-11 @511.9s (8 clips): Let's do this one together. This is a tap. This is a top. Listen to them both... "tap" "top" Which one has this sound in the middle... /o/
- level w1-11 @537.1s (8 clips): Now you do one all by yourself. This is a cot. This is a cat. Listen to them both... "cot" "cat" Which one has this sound in the middle... /o/
- level w1-12 @686.5s (8 clips): "sat" If you'd like to see me do one first, tap my paw. Now let's change it to... "sit" Listen to them both... "sat" (slowly) "sit" (slowly) What do we need to change?
- level w1-8 @83.6s (7 clips): /s/ /a/ /t/ "sat" There's a slow way to say a word, and a fast way. "mat" Which sound changes?
- level w1-10 @290.2s (7 clips): Nest starts with... /n/ Now watch my ninja write it. This is how we write... /n/ Now you tap it, and say the sound. /n/

### Praise: 6 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 19

- level w1-8 @25.0s: "Now tap the rabbit, and read the word fast." cut after 0.4 of 3.5 s by "mat"
- level w1-8 @30.8s: "I'll show you first. Are you ready to watch? Tap the green arrow." cut after 1.4 of 4.1 s by I'll change it to...
- level w1-8 @50.2s: "Now you swap one. Do you want to have a go?" cut after 1.7 of 3.4 s by Now let's change it to...
- level w1-8 @59.4s: "What do we need to change?" cut after 0.9 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @76.3s: "What do we need to change?" cut after 0.9 of 1.8 s by Ninja power!
- level w1-8 @110.6s: "Which sound changes?" cut after 1.4 of 1.9 s by Yes, the last sound changes!
- reward @136.8s: "Look, a gem! Each gem holds a way to spell a sound. When you get words" cut after 6.7 of 7.4 s by Wow, you got everything right! Grown-ups, if this 
- level w1-10 @297.3s: "Now you tap it, and say the sound." cut after 2.2 of 2.5 s by /n/
- level w1-10 @317.5s: "Tap the petal, and say it with me." cut after 2.0 of 2.5 s by /p/
- level w1-10 @342.9s: "Now you tap it, and say the sound." cut after 1.9 of 2.5 s by /p/
- level w1-10 @355.3s: "Pin starts with..." cut after 1.4 of 1.7 s by /p/
- level w1-10 @409.9s: "Now tap the rabbit, and read the word fast." cut after 2.6 of 3.5 s by "an"
- level w1-11 @500.2s: "Tap the petal, and say it with me." cut after 1.5 of 2.5 s by /o/
- level w1-11 @530.3s: "Now you tap it, and say the sound." cut after 1.8 of 2.5 s by /o/
- level w1-12 @699.0s: "What do we need to change?" cut after 1.3 of 1.8 s by Yes, the middle sound changes!
- level w1-12 @715.7s: "What do we need to change?" cut after 0.6 of 1.8 s by Yes, the first sound changes!
- level w1-12 @736.9s: "Which sound changes?" cut after 0.9 of 1.9 s by Yes, the first sound changes!
- level w1-12 @746.6s: "Which sound needs to change?" cut after 1.7 of 2.1 s by Yes, the middle sound changes!
- level w1-12 @821.5s: "Which sound changes?" cut after 1.5 of 1.9 s by Yes, the first sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C(w1-8)-P: playtest/runs/fix/D3/r7/cont-w1-8/continuous-perfect-from-w1-8.json

perfect, from w1-8, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_1 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 3 (0 repeats) | pass |
| `swap-place-heard` swap place lines heard to the end | all | 16 of 16 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.12 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 2 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.6 s (run w1-9); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 5 words; 78 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 45 of 45, rabbit 32 of 32 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 2 of 2 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 12.5 s (readcheck w1-11); 2 over | **FAIL** |

- **cut-explanations**: reward @2:16.8 ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words"
- **unframed-turn**: swap (w1-8 0:08.3): out of order (frame 9.3, demo 32.2, ready 30.9, hand-over 50.2). Opens: "Oh dear. Baron Muddle has been muddling up words." · "First, let's read this word. Tap each sound, and s"
- **fs-readback**: swap (w1-8 @0:47.2): no fast lead before [sat]. Heard: /s/ /a/ /t/ · [sat]; (not judged) soundhunt (w1-11 8:15.7, land 1): no read-back heard
- **fs-talk**: readcheck (w1-11) 12.5 s from ‹tv_to_reward› "Let's see what you won back from Baron Muddle." to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow.", with ‹tv_fs_say_slow› "Let's say it the slow way..."; soundhunt (w1-11) 12.3 s from ‹tv_fs_made› "Every word is made of little sounds, one by one." to ‹tv_hunt_q› "Which one has this sound in the middle...", with ‹tv_fs_made› "Every word is made of little sounds, one by one."

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 1 of 494 | **FAIL** |

- ‹tv_confirm_replay› 3.4 w/s "Do you want to go back and play this game again?"
