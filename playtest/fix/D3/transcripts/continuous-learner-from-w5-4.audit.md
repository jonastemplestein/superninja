# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/runs/fix/D3/r7/cont-w5-4/continuous-learner-from-w5-4.json (learner-from-w5-4, one continuous page)

187 Sensei lines, 263 sounds and words, 182 utterances in 24 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| next_sound_q | 8 | What's the next sound? |
| tv_swap_now_change | 6 | Now let's change it to... |
| tv_swap_both | 6 | Listen to them both... |
| st_what_change | 6 | What do we need to change? |
| tv_swap_pick | 6 | Now tap the new one. |
| first_sound_q | 5 | What's the first sound? |
| last_sound_q | 5 | What's the last sound? |
| tv_fs_stuck_slow | 5 | Let's say it the slow way first... |
| say_sounds_read | 5 | Say the sounds, and read the word. |
| st_last_changes | 4 | Yes, the last sound changes! |
| st_first_changes | 4 | Yes, the first sound changes! |
| tv_which_changes | 4 | Which sound changes? |
| tv_your_word | 4 | Your word is... |
| wf_found_gem | 4 | You found a new gem! It's a spelling of the sound... |
| t_two_letters | 3 | It's two letters, but it's one sound. |
| streak_3 | 3 | Ninja power! |
| tv_praise_kept_going | 3 | That was a tricky one, and you kept going. |
| tv_next_word | 3 | Here's your next word... |
| tv_listen_here | 3 | Let's listen again. What can you hear here? |
| tv_swap_again | 2 | It's Sound Swap again. We change one sound to make a new word. |
| tv_swap_read_first | 2 | First, let's read this word. Tap each sound, and say it with me. |
| tv_show_offer_short | 2 | If you'd like to see me do one first, tap my paw. |
| thats | 2 | That's... |
| stays_same | 2 | That sound stays the same. |
| st_middle_changes | 2 | Yes, the middle sound changes! |
| tv_swap_done | 2 | You fixed all of Baron's muddled words! |
| fm_rw_more | 2 | More stickers for your Sticker Book! |
| tv_guess_q | 2 | Listen for the word... |
| tv_run_which | 2 | Tap the lantern with my word. |
| audit_gem_more | 2 | Look, this gem has filled a little more. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (6)

| Line | Repeats | Text | Example |
|---|---|---|---|
| next_sound_q | 3 | What's the next sound? | level w5-6 @418.8s and @422.2s |
| tv_which_write | 1 | Which of these is the way we write... | level w5-6 @355.5s and @363.9s |
| t_in | 1 | ...in... | world flower @590.9s and @594.2s |
| tv_which_changes | 1 | Which sound changes? | level w5-8 @846.3s and @858.9s |

### Spliced utterances: 41 of 182 (23%); chains of 5+ clips: 26

Commonest spliced shapes:

- ×2 ‹tv_fs_stuck_slow› + W + /X/
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_next_word› + W + ‹first_sound_q›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_show_offer_short› + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 /X/ + /X/ + /X/ + W + ‹t_two_letters› + /X/ + ‹tv_swap_now_change› + W + ‹tv_swap_both›
- ×1 /X/ + /X/ + /X/ + W + ‹yay_4› + ‹tv_swap_now_change› + W
- ×1 ‹thats› + /X/ + ‹stays_same› + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_fs_run› + ‹tv_guess_q› + /X/ + /X/ + /X/
- ×1 ‹tv_guess_q› + /X/ + /X/ + /X/
- ×1 ‹tv_learn_short_four› + ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹tv_tap_letter_say›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_another_way› + /X/ + ‹tv_tap_it_say_short›
- ×1 /X/ + ‹tv_learn_another› + /X/
- ×1 ‹t_another_way› + /X/ + ‹t_two_letters›

Longest chains:

- level w5-6 @488.3s (11 clips): /z/ Say the sounds, and read the word. /k/ /w/ /i/ /z/ "quiz" That was a tricky one, and you kept going. Your word is... "chimp" What's the first sound?
- level w5-6 @434.5s (10 clips): Say the sounds, and read the word. /s/ /k/ /i/ /d/ "skid" You said it slowly, and found every sound. Your word is... "pick" What's the first sound?
- level w5-8 @818.9s (10 clips): /l/ /o/ /k/ "lock" Now let's change it to... "sock" Listen to them both... "lock" (slowly) "sock" (slowly) What do we need to change?
- level w5-8 @880.0s (10 clips): /s/ /i/ /ng/ "sing" Now let's change it to... "wing" Listen to them both... "sing" (slowly) "wing" (slowly) What do we need to change?
- level w5-4 @41.3s (9 clips): /k/ /i/ /ng/ "king" It's two letters, but it's one sound. /ng/ Now let's change it to... "wing" Listen to them both...
- level w5-6 @406.5s (8 clips): Say the sounds, and read the word. /p/ /a/ /ch/ "patch" Here's your next word... "skid" What's the first sound?
- level w5-6 @460.2s (8 clips): Say the sounds, and read the word. /p/ /i/ /k/ "pick" Here's your next word... "quiz" What's the first sound?
- world flower @588.4s (8 clips): The same spelling can sometimes be... /u/ ...in... "run" ...and sometimes... /w/ ...in... "quiz"

### Praise: 8 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 9

- level w5-4 @22.2s: "Now tap the rabbit, and read the word fast." cut after 0.2 of 3.5 s by "kick"
- level w5-4 @34.4s: "What do we need to change?" cut after 1.1 of 1.8 s by Yes, the last sound changes!
- level w5-4 @55.3s: "What do we need to change?" cut after 0.8 of 1.8 s by Ninja power!
- level w5-4 @107.6s: "What do we need to change?" cut after 1.0 of 1.8 s by Yes, the middle sound changes!
- reward @124.7s: "Look, a gem! Each gem holds a way to spell a sound. When you get words" cut after 6.6 of 7.4 s by Wow, you got everything right! Grown-ups, if this 
- level w5-6 @276.2s: "Tap it once more, and say it again." cut after 0.8 of 2.5 s by /k/
- level w5-6 @488.3s: "/z/" cut after 0.4 of 0.7 s by Say the sounds, and read the word.
- world flower @588.4s: "The same spelling can sometimes be..." cut after 2.2 of 2.9 s by /u/
- level w5-8 @829.3s: "What do we need to change?" cut after 1.4 of 1.8 s by Yes, the first sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 3 | level w5-4, level w5-5, level w5-6 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| t_another_way "This is another way to spell the sound..." | 2 | level w5-6 ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C(w5-4)-L: playtest/runs/fix/D3/r7/cont-w5-4/continuous-learner-from-w5-4.json

learner, from w5-4, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 4 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 10 of 10 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.10 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 1 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 9 words (median line 5 words; 75 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 1 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 1 a level, 1 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 0 of 1 (0%) | **FAIL** |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 40 of 40, rabbit 26 of 26 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 12.0 s (battle w5-7); 0 over | pass |

- **line-60s**: ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from reward @9:09.6
- **cut-explanations**: reward @2:04.7 ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words"
- **fs-readback**: swap (w5-4 @0:41.3): no fast lead before [king]. Heard: ‹tv_swap_pick› · /k/ /i/ /ng/ · [king]

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 1 of 494 | **FAIL** |

- ‹tv_confirm_replay› 3.4 w/s "Do you want to go back and play this game again?"
