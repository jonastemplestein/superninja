# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/D3/verify1/continuous-watcher-from-w1-8.json (watcher-from-w1-8, one continuous page)

56 Sensei lines, 88 sounds and words, 51 utterances in 11 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_swap_read_first | 2 | First, let's read this word. Tap each sound, and say it with me. |
| tv_swap_change_to | 2 | I'll change it to... |
| tv_swap_in | 2 | And in goes... |
| tv_swap_now_change | 2 | Now let's change it to... |
| tv_swap_both | 2 | Listen to them both... |
| st_what_change | 2 | What do we need to change? |
| st_middle_changes | 2 | Yes, the middle sound changes! |
| tv_swap_pick | 2 | Now tap the new one. |
| tv_which_changes | 2 | Which sound changes? |
| st_first_changes | 2 | Yes, the first sound changes! |
| fm_rw_more | 2 | More stickers for your Sticker Book! |
| tv_guess_q | 2 | Listen for the word... |
| tv_run_which | 2 | Tap the lantern with my word. |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_swap_oh_dear | 1 | Oh dear. Baron Muddle has been muddling up words. |
| tv_fs_rabbit_read | 1 | Now tap the rabbit, and read the word fast. |
| tv_swap_frame | 1 | In Sound Swap, we change just one sound, to make a new word. |
| tv_ready_to_watch | 1 | I'll show you first. Are you ready to watch? Tap the green arrow. |
| tv_swap_kick | 1 | The first sound changes. Can you tap it, and kick it out? |
| tv_swap_ready | 1 | Now you swap one. Do you want to have a go? |
| tv_show_again | 1 | Of course. Watch my paw again. |
| tv_ready_now | 1 | Are you ready to have a go now? |
| streak_3 | 1 | Ninja power! |
| tv_fs_two_ways | 1 | There's a slow way to say a word, and a fast way. |
| st_last_changes | 1 | Yes, the last sound changes! |
| yay_4 | 1 | Well done. |
| swap_which | 1 | Which sound needs to change? |
| tv_swap_done | 1 | You fixed all of Baron's muddled words! |
| audit_gem_first | 1 | Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. |
| tv_jump_offer | 1 | Wow, you got everything right! Grown-ups, if this is too easy, you can jump ahead. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (0)

| Line | Repeats | Text | Example |
|---|---|---|---|

### Spliced utterances: 9 of 51 (18%); chains of 5+ clips: 11

Commonest spliced shapes:

- ×2 /X/ + ‹tv_swap_in›
- ×1 ‹tv_swap_change_to› + W + W + W + ‹tv_swap_kick›
- ×1 ‹tv_show_again› + ‹tv_swap_change_to› + W + W + W
- ×1 W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_run_lanterns› + ‹tv_guess_q› + /X/ + /X/ + /X/
- ×1 ‹tv_fs_say_slow› + /X/ + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×1 ‹tv_guess_q› + /X/ + /X/ + ‹tv_run_which›

Longest chains:

- level w1-8 @87.2s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-8 @106.0s (7 clips): /s/ /a/ /t/ "sat" There's a slow way to say a word, and a fast way. "mat" Which sound changes?
- level w1-8 @44.8s (6 clips): /s/ /s/ /a/ /t/ "sat" Now you swap one. Do you want to have a go?
- level w1-8 @66.3s (6 clips): /s/ /s/ /a/ /t/ "sat" Are you ready to have a go now?
- level w1-8 @136.1s (6 clips): /a/ /t/ "at" Well done. "it" Which sound needs to change?
- level w1-9 @210.0s (6 clips): Let's say it the slow way... /s/ /a/ /t/ And now, fast... "sat"
- level w1-8 @31.1s (5 clips): I'll change it to... "sat" "mat" (slowly) "sat" (slowly) The first sound changes. Can you tap it, and kick it out?
- level w1-8 @52.8s (5 clips): Of course. Watch my paw again. I'll change it to... "sat" "mat" (slowly) "sat" (slowly)

### Praise: 3 lines (0.7 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 4

- level w1-8 @81.7s: "What do we need to change?" cut after 0.6 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @97.8s: "What do we need to change?" cut after 1.4 of 1.8 s by Ninja power!
- level w1-8 @113.5s: "Which sound changes?" cut after 1.0 of 1.9 s by Yes, the first sound changes!
- level w1-8 @130.9s: "Which sound changes?" cut after 1.0 of 1.9 s by Yes, the last sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |

## playtest/fix/D3/verify1/continuous-perfect-from-w1-8.json (perfect-from-w1-8, one continuous page)

52 Sensei lines, 79 sounds and words, 48 utterances in 11 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_swap_read_first | 2 | First, let's read this word. Tap each sound, and say it with me. |
| tv_swap_now_change | 2 | Now let's change it to... |
| tv_swap_both | 2 | Listen to them both... |
| st_what_change | 2 | What do we need to change? |
| st_middle_changes | 2 | Yes, the middle sound changes! |
| tv_swap_pick | 2 | Now tap the new one. |
| tv_which_changes | 2 | Which sound changes? |
| st_first_changes | 2 | Yes, the first sound changes! |
| fm_rw_more | 2 | More stickers for your Sticker Book! |
| tv_guess_q | 2 | Listen for the word... |
| tv_run_which | 2 | Tap the lantern with my word. |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_swap_oh_dear | 1 | Oh dear. Baron Muddle has been muddling up words. |
| tv_fs_rabbit_read | 1 | Now tap the rabbit, and read the word fast. |
| tv_swap_frame | 1 | In Sound Swap, we change just one sound, to make a new word. |
| tv_ready_to_watch | 1 | I'll show you first. Are you ready to watch? Tap the green arrow. |
| tv_swap_change_to | 1 | I'll change it to... |
| tv_swap_kick | 1 | The first sound changes. Can you tap it, and kick it out? |
| tv_swap_in | 1 | And in goes... |
| tv_swap_ready | 1 | Now you swap one. Do you want to have a go? |
| streak_3 | 1 | Ninja power! |
| tv_fs_two_ways | 1 | There's a slow way to say a word, and a fast way. |
| st_last_changes | 1 | Yes, the last sound changes! |
| yay_1 | 1 | Brilliant! |
| swap_which | 1 | Which sound needs to change? |
| tv_swap_done | 1 | You fixed all of Baron's muddled words! |
| audit_gem_first | 1 | Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. |
| tv_jump_offer | 1 | Wow, you got everything right! Grown-ups, if this is too easy, you can jump ahead. |
| tv_map_next_run | 1 | Next is a new game, called Ninja Run. Tap the glowing stone to play. |
| tv_run_frame | 1 | This game is called Ninja Run. Your ninja runs all by itself. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (0)

| Line | Repeats | Text | Example |
|---|---|---|---|

### Spliced utterances: 7 of 48 (15%); chains of 5+ clips: 8

Commonest spliced shapes:

- ×1 ‹tv_swap_change_to› + W + W + W + ‹tv_swap_kick›
- ×1 /X/ + ‹tv_swap_in›
- ×1 ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_run_lanterns› + ‹tv_guess_q› + /X/ + /X/ + /X/ + ‹tv_run_which›
- ×1 ‹tv_fs_say_slow› + /X/ + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×1 ‹tv_guess_q› + /X/ + /X/

Longest chains:

- level w1-8 @65.6s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-8 @84.4s (7 clips): /s/ /a/ /t/ "sat" There's a slow way to say a word, and a fast way. "mat" Which sound changes?
- level w1-8 @44.8s (6 clips): /s/ /s/ /a/ /t/ "sat" Now you swap one. Do you want to have a go?
- level w1-8 @52.8s (6 clips): Now let's change it to... "sit" Listen to them both... "sat" (slowly) "sit" (slowly) What do we need to change?
- level w1-8 @114.6s (6 clips): /a/ /t/ "at" Brilliant! "it" Which sound needs to change?
- level w1-9 @175.7s (6 clips): Here come the lanterns. I'll say the sounds of a word. Listen for the word... /m/ /a/ /t/ Tap the lantern with my word.
- level w1-9 @188.0s (6 clips): Let's say it the slow way... /m/ /a/ /t/ And now, fast... "mat"
- level w1-8 @31.1s (5 clips): I'll change it to... "sat" "mat" (slowly) "sat" (slowly) The first sound changes. Can you tap it, and kick it out?

### Praise: 3 lines (0.7 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 5

- level w1-8 @60.2s: "What do we need to change?" cut after 0.4 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @76.2s: "What do we need to change?" cut after 1.4 of 1.8 s by Ninja power!
- level w1-8 @91.9s: "Which sound changes?" cut after 1.0 of 1.9 s by Yes, the first sound changes!
- level w1-8 @109.3s: "Which sound changes?" cut after 1.1 of 1.9 s by Yes, the last sound changes!
- level w1-8 @118.1s: "Which sound needs to change?" cut after 1.5 of 1.8 s by Yes, the first sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C(w1-8)-W: playtest/fix/D3/verify1/continuous-watcher-from-w1-8.json

watcher, from w1-8, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 1 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 5 of 5 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.09 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 2 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.7 s (run w1-9); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 13 words (median line 6 words; 24 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 4 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | 1 of 1 | pass |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 2 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 1 a level, 1 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 2 of 2 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 23 of 23, rabbit 15 of 15 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.7 s (run w1-9); 0 over | pass |

### C(w1-8)-P: playtest/fix/D3/verify1/continuous-perfect-from-w1-8.json

perfect, from w1-8, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 1 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 5 of 5 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.18 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 2 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.5 s (run w1-9); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 12 words (median line 6 words; 23 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 3 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 2 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 1 a level, 1 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 2 of 2 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 20 of 20, rabbit 14 of 14 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.5 s (run w1-9); 0 over | pass |

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

