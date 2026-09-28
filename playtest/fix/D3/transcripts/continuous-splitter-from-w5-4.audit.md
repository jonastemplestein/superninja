# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/runs/fix/D3/r7/cont-w5-4/continuous-splitter-from-w5-4.json (splitter-from-w5-4, one continuous page)

155 Sensei lines, 248 sounds and words, 171 utterances in 24 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_swap_now_change | 6 | Now let's change it to... |
| tv_swap_both | 4 | Listen to them both... |
| st_what_change | 4 | What do we need to change? |
| st_first_changes | 4 | Yes, the first sound changes! |
| tv_swap_pick | 4 | Now tap the new one. |
| tv_which_changes | 4 | Which sound changes? |
| tv_your_word | 4 | Your word is... |
| wf_found_gem | 4 | You found a new gem! It's a spelling of the sound... |
| t_two_letters | 3 | It's two letters, but it's one sound. |
| st_last_changes | 3 | Yes, the last sound changes! |
| tv_map_hint | 3 | The glowing stone is your next game. Tap it when you're ready. |
| say_sounds_read | 3 | Say the sounds, and read the word. |
| tv_next_word | 3 | Here's your next word... |
| tv_swap_again | 2 | It's Sound Swap again. We change one sound to make a new word. |
| tv_swap_read_first | 2 | First, let's read this word. Tap each sound, and say it with me. |
| tv_show_offer_short | 2 | If you'd like to see me do one first, tap my paw. |
| st_middle_changes | 2 | Yes, the middle sound changes! |
| tv_swap_done | 2 | You fixed all of Baron's muddled words! |
| fm_rw_more | 2 | More stickers for your Sticker Book! |
| tv_guess_q | 2 | Listen for the word... |
| tv_run_which | 2 | Tap the lantern with my word. |
| audit_gem_more | 2 | Look, this gem has filled a little more. |
| st_know_this_sound | 2 | Ooh, you already know this sound! |
| tv_watch_write | 2 | Now watch my ninja write it. |
| t_another_way | 2 | This is another way to spell the sound... |
| tv_and_another_way | 2 | And here's another way to spell it... |
| tv_which_write | 2 | Which of these is the way we write... |
| tv_yay_lovely | 2 | Lovely! |
| tv_fs_say_slow | 2 | Let's say it the slow way... |
| tv_fs_now_fast | 2 | And now, fast... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (4)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_changes | 2 | Which sound changes? | level w5-4 @72.1s and @83.8s |
| tv_which_write | 1 | Which of these is the way we write... | level w5-6 @348.2s and @351.2s |
| t_in | 1 | ...in... | world flower @558.7s and @562.0s |

### Spliced utterances: 37 of 171 (22%); chains of 5+ clips: 25

Commonest spliced shapes:

- ×1 ‹tv_show_offer_short› + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 /X/ + /X/ + /X/ + W + ‹t_two_letters› + /X/ + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 /X/ + /X/ + /X/ + W + ‹yay_2› + ‹tv_swap_now_change› + W
- ×1 ‹tv_fs_run› + ‹tv_guess_q› + /X/ + /X/ + /X/
- ×1 /X/ + /X/ + /X/ + W + ‹t_this_can_be› + /X/ + ‹t_but_in_this_word›
- ×1 ‹tv_guess_q› + /X/ + /X/ + /X/
- ×1 ‹tv_learn_short_four› + ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹tv_tap_letter_say›
- ×1 ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_another_way› + /X/ + ‹tv_tap_it_say_short›
- ×1 ‹tv_learn_another› + /X/
- ×1 ‹t_another_way› + /X/ + ‹t_two_letters›
- ×1 /X/ + ‹tv_learn_last› + /X/
- ×1 ‹tv_and_another_way› + /X/ + ‹t_three_letters›
- ×1 ‹tv_learn_all_four› + ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + /X/ + /X/

Longest chains:

- level w5-4 @42.3s (12 clips): /sh/ /i/ /p/ "ship" It's two letters, but it's one sound. /sh/ Now let's change it to... "shop" Listen to them both... "ship" (slowly) "shop" (slowly) What do we need to change?
- level w5-6 @459.5s (9 clips): Say the sounds, and read the word. /s/ /k/ /i/ /d/ "skid" Lovely! Your word is... "quick"
- level w5-8 @778.1s (9 clips): /ng/ "king" If you'd like to see me do one first, tap my paw. Now let's change it to... "wing" Listen to them both... "king" (slowly) "wing" (slowly) What do we need to change?
- level w5-6 @399.2s (8 clips): Say the sounds, and read the word. /m/ /a/ /ch/ "match" You said it slowly, and found every sound. Your word is... "squid"
- world flower @556.2s (8 clips): The same spelling can sometimes be... /u/ ...in... "duck" ...and sometimes... /w/ ...in... "squid"
- level w5-4 @24.2s (7 clips): If you'd like to see me do one first, tap my paw. Now let's change it to... "ship" Listen to them both... "chip" (slowly) "ship" (slowly) What do we need to change?
- level w5-4 @64.8s (7 clips): /sh/ /o/ /p/ "shop" There's a slow way to say a word, and a fast way. "hop" Which sound changes?
- level w5-4 @90.6s (7 clips): /h/ /o/ /t/ "hot" Super! Now let's change it to... "hat"

### Praise: 5 lines (0.3 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 10

- level w5-4 @22.3s: "Now tap the rabbit, and read the word fast." cut after 0.9 of 3.5 s by "chip"
- level w5-4 @35.6s: "What do we need to change?" cut after 1.5 of 1.8 s by Yes, the first sound changes!
- reward @113.2s: "Look, a gem! Each gem holds a way to spell a sound. When you get words" cut after 6.6 of 7.4 s by Wow, you got everything right! Grown-ups, if this 
- level w5-6 @269.8s: "Tap it once more, and say it again." cut after 1.1 of 2.5 s by /k/
- level w5-6 @356.9s: "Find how we write..." cut after 0.4 of 1.7 s by /v/
- level w5-6 @489.9s: "Now the fast way, like the rabbit..." cut after 2.6 of 2.9 s by "quick"
- world flower @556.2s: "The same spelling can sometimes be..." cut after 2.2 of 2.9 s by /u/
- level w5-7 @737.3s: "Now the fast way, like the rabbit..." cut after 2.6 of 2.9 s by "snack"
- level w5-8 @791.9s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the first sound changes!
- level w5-8 @811.6s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the last sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 3 | level w5-4, level w5-6, level w5-7 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| t_another_way "This is another way to spell the sound..." | 2 | level w5-6 ×2 |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C(w5-4)-S: playtest/runs/fix/D3/r7/cont-w5-4/continuous-splitter-from-w5-4.json

splitter, from w5-4, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 4 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 1 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 3 | **FAIL** |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 9 of 9 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.02 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 1 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 2 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | 1 of 1 (100%) | pass |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 6 words; 58 turns) | pass |
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
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 0 of 1 (0%) | **FAIL** |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 35 of 35, rabbit 27 of 27 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 14.0 s (build w5-6); 1 over | **FAIL** |

- **map-hint-cut**: map @2:14.5 ‹tv_map_hint› "The glowing stone is your next game. Tap it when you're ready." cut
- **line-60s**: ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from reward @8:38.8
- **cut-explanations**: reward @1:53.2 ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words"; map @2:14.5 ‹tv_map_hint› "The glowing stone is your next game. Tap it when you're ready."
- **fs-readback**: swap (w5-4 @0:42.3): no fast lead before [ship]. Heard: ‹tv_swap_pick› · /sh/ /i/ /p/ · [ship]
- **fs-talk**: build (w5-6) 14.0 s from ‹tv_to_reward› "Let's see what you won back from Baron Muddle." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 1 of 494 | **FAIL** |

- ‹tv_confirm_replay› 3.4 w/s "Do you want to go back and play this game again?"
