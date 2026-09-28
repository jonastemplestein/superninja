# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/D1/verify1/final/continuous-splitter-from-w5-1.json (splitter-from-w5-1, one continuous page)

287 Sensei lines, 458 sounds and words, 315 utterances in 38 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| t_two_letters | 7 | It's two letters, but it's one sound. |
| streak_3 | 7 | Ninja power! |
| tv_your_word | 7 | Your word is... |
| tv_here_sound | 7 | Here's the sound... |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| tv_next_word | 6 | Here's your next word... |
| streak_lost | 6 | Keep going, ninja. |
| we_need | 6 | We need... |
| wf_found_gem | 6 | You found a new gem! It's a spelling of the sound... |
| first_sound_q | 5 | What's the first sound? |
| next_sound_q | 5 | What's the next sound? |
| last_sound_q | 5 | What's the last sound? |
| thats | 5 | That's... |
| tv_swap_now_change | 5 | Now let's change it to... |
| tv_swap_both | 5 | Listen to them both... |
| st_last_changes | 5 | Yes, the last sound changes! |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| t_in | 4 | ...in... |
| st_what_change | 4 | What do we need to change? |
| tv_swap_pick | 4 | Now tap the new one. |
| tv_which_changes | 4 | Which sound changes? |
| tv_petal_say | 3 | Tap the petal, and say it with me. |
| tv_how_we_write | 3 | This is how we write... |
| tv_tap_letter_say | 3 | Now you tap it, and say the sound. |
| tv_said_well | 3 | Good, you said that sound really well. |
| tv_tap_it_say_short | 3 | Now you tap it, and say it. |
| tv_ne_new_sounds | 3 | Now let's play Ninja Eyes, with your new sounds. |
| tv_find_write | 3 | Find how we write... |
| tv_build_dojo | 3 | Now let's build some words with your new sounds. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (9)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @110.9s and @114.7s |
| t_in | 2 | ...in... | world flower @333.1s and @336.3s |
| tv_which_changes | 2 | Which sound changes? | level w5-4 @857.0s and @869.1s |
| tv_guess_q | 1 | Listen for the word... | level w5-5 @924.0s and @938.4s |
| tv_swap_both | 1 | Listen to them both... | level w5-8 @1534.4s and @1549.0s |

### Spliced utterances: 76 of 315 (24%); chains of 5+ clips: 51

Commonest spliced shapes:

- ×3 ‹tv_which_write› + /X/ + /X/
- ×3 ‹streak_lost› + ‹thats› + /X/ + ‹we_need› + /X/ + ‹t_two_letters›
- ×2 ‹tv_find_write› + /X/
- ×2 ‹tv_battle_again› + ‹tv_your_word› + W
- ×2 ‹tv_next_word› + W
- ×2 ‹thats› + /X/ + ‹we_need› + /X/ + ‹t_two_letters›
- ×2 ‹tv_learn_frame_ways› + ‹tv_here_sound› + /X/
- ×2 /X/ + ‹tv_next_sound_known› + /X/
- ×2 W + ‹tv_show_offer_short› + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_learn_short_four› + ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/
- ×1 /X/ + ‹tv_learn_another› + /X/

Longest chains:

- level w5-4 @832.9s (10 clips): /l/ /o/ /ng/ "long" Now let's change it to... "song" Listen to them both... "long" (slowly) "song" (slowly) What do we need to change?
- level w5-8 @1528.8s (10 clips): /l/ /o/ /k/ "lock" Now let's change it to... "sock" Listen to them both... "lock" (slowly) "sock" (slowly) What do we need to change?
- level w5-1 @180.4s (9 clips): Say the sounds, and read the word. /k/ /a/ /sh/ "cash" You said it slowly, and found every sound. Your word is... "with" What's the first sound?
- level w5-3 @690.5s (8 clips): Say the sounds, and read the word. /w/ /e/ /n/ "when" Your word is... "sock" What's the first sound?
- level w5-4 @812.1s (8 clips): "lock" If you'd like to see me do one first, tap my paw. Now let's change it to... "long" Listen to them both... "lock" (slowly) "long" (slowly) What do we need to change?
- level w5-6 @1146.9s (8 clips): /t/ Ninja power! /h/ /u/ /t/ "hut" Here's your next word... "patch"
- world flower @1296.8s (8 clips): The same spelling can sometimes be... /u/ ...in... "hut" ...and sometimes... /w/ ...in... "queen"
- level w5-8 @1497.5s (8 clips): "long" If you'd like to see me do one first, tap my paw. Now let's change it to... "lock" Listen to them both... "long" (slowly) "lock" (slowly) What do we need to change?

### Praise: 16 lines (0.6 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 10

- level w5-1 @35.9s: "Tap it once more, and say it again." cut after 0.0 of 2.5 s by /sh/
- level w5-1 @113.6s: "/sh/" cut after 0.3 of 0.8 s by /sh/
- level w5-1 @123.9s: "Now find how we write..." cut after 0.6 of 2.1 s by /dh/
- level w5-1 @202.8s: "/dh/" cut after 0.5 of 0.9 s by Ninja power!
- level w5-3 @563.8s: "It's a new sound. Tap its petal, and say it with me." cut after 2.8 of 4.0 s by /ng/
- level w5-4 @844.5s: "What do we need to change?" cut after 1.1 of 1.8 s by Yes, the first sound changes!
- level w5-6 @1107.5s: "Which of these is the way we write..." cut after 0.0 of 2.7 s by /k/
- level w5-6 @1118.0s: "Now find how we write..." cut after 0.6 of 2.1 s by Keep going, ninja.
- level w5-6 @1183.5s: "/v/" cut after 0.5 of 0.9 s by /h/
- level w5-8 @1510.2s: "What do we need to change?" cut after 0.9 of 1.8 s by Yes, the last sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 7 | level w5-1 ×2, level w5-2 ×3, level w5-3, level w5-6 |
| audit_gem_more "Look, this gem has filled a little more." | 3 | reward ×3 |
| t_another_way "This is another way to spell the sound..." | 3 | level w5-3, level w5-6 ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C5-S: playtest/fix/D1/verify1/final/continuous-splitter-from-w5-1.json

splitter, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 10 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 1 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 2 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 9 of 9 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.31 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 1 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | 5 of 6 (83%) | **FAIL** |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 2 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 9 words (median line 5 words; 103 turns) | pass |
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
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 1 of 1 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 53 of 53, rabbit 43 of 43 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.3 s (build w5-1); 0 over | pass |

- **letters-60s**: w5-2 @8:14.2 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **praise-stacks**: w5-3 @11:49.8: "Ninja power!" → "You built words with their sounds, and you read them."
- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @5:01.8; ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from reward @20:49.6
- **split-correction**: w5-8 @25:18.5 tapped < c > for < ck >: then "Yes, that's a spelling of that sound too! But in this word, we spell it like this..."
- **over-framed**: ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-6 @16:57.1, again after w5-3 @8:46.1; ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-6 @16:57.1: learn is known before w5-1

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

