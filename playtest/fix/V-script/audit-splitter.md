# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/V-script/transcripts/continuous-splitter-from-w5-1.json (splitter-from-w5-1, one continuous page)

304 Sensei lines, 461 sounds and words, 325 utterances in 38 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_your_word | 11 | Your word is... |
| t_two_letters | 8 | It's two letters, but it's one sound. |
| tv_next_word | 8 | Here's your next word... |
| next_sound_q | 7 | What's the next sound? |
| streak_lost | 7 | Keep going, ninja. |
| we_need | 7 | We need... |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| first_sound_q | 6 | What's the first sound? |
| last_sound_q | 6 | What's the last sound? |
| thats | 6 | That's... |
| wf_found_gem | 6 | You found a new gem! It's a spelling of the sound... |
| tv_swap_both | 6 | Listen to them both... |
| streak_3 | 5 | Ninja power! |
| tv_swap_now_change | 5 | Now let's change it to... |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| say_sounds_read | 4 | Say the sounds, and read the word. |
| tv_here_sound | 4 | Here's the sound... |
| t_in | 4 | ...in... |
| st_know_this_sound | 4 | Ooh, you already know this sound! |
| st_what_change | 4 | What do we need to change? |
| tv_swap_pick | 4 | Now tap the new one. |
| st_first_changes | 4 | Yes, the first sound changes! |
| tv_which_changes | 4 | Which sound changes? |
| tv_learn_first_short | 3 | Here's the first new sound... |
| tv_petal_say | 3 | Tap the petal, and say it with me. |
| tv_how_we_write | 3 | This is how we write... |
| tv_tap_letter_say | 3 | Now you tap it, and say the sound. |
| tv_said_well | 3 | Good, you said that sound really well. |
| tv_learn_next | 3 | Here's the next new sound... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (10)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @109.2s and @112.8s |
| t_in | 2 | ...in... | world flower @333.3s and @336.7s |
| tv_which_changes | 2 | Which sound changes? | level w5-4 @842.7s and @855.3s |
| next_sound_q | 2 | What's the next sound? | level w5-6 @1231.1s and @1234.4s |
| tv_swap_both | 1 | Listen to them both... | level w5-4 @838.1s and @851.0s |

### Spliced utterances: 80 of 325 (25%); chains of 5+ clips: 55

Commonest spliced shapes:

- ×3 /X/ + ‹tv_learn_last› + /X/
- ×3 ‹tv_which_write› + /X/ + /X/
- ×3 ‹thats› + /X/ + ‹we_need› + /X/ + ‹t_two_letters›
- ×3 ‹streak_lost› + ‹thats› + /X/ + ‹we_need› + /X/ + ‹t_two_letters›
- ×2 ‹tv_learn_short_four› + ‹tv_learn_first_short› + /X/
- ×2 /X/ + ‹tv_learn_another› + /X/
- ×2 ‹tv_find_write› + /X/
- ×2 ‹tv_battle_again› + ‹tv_your_word› + W
- ×2 ‹tv_next_word› + W
- ×2 /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_both› + W + W + ‹tv_which_changes›
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/

Longest chains:

- level w5-4 @807.4s (10 clips): /ch/ /i/ /p/ "chip" Now let's change it to... "ship" Listen to them both... "chip" (slowly) "ship" (slowly) What do we need to change?
- level w5-8 @1519.0s (10 clips): /ch/ /i/ /k/ "chick" Now let's change it to... "chip" Listen to them both... "chick" (slowly) "chip" (slowly) What do we need to change?
- level w5-6 @1217.4s (9 clips): Say the sounds, and read the word. /ch/ /i/ /n/ "chin" Brilliant! Your word is... "squid" What's the first sound?
- level w5-1 @174.0s (8 clips): Say the sounds, and read the word. /m/ /e/ /l/ /t/ "melt" Your word is... "cloth"
- level w5-1 @229.7s (8 clips): Say the sounds, and read the word. /k/ /a/ /sh/ "cash" Your word is... "thud" What's the first sound?
- level w5-3 @654.0s (8 clips): Say the sounds, and read the word. /w/ /e/ /n/ "when" Here's your next word... "an" What's the first sound?
- level w5-4 @834.7s (8 clips): /sh/ /i/ /p/ "ship" Listen to them both... "ship" (slowly) "shop" (slowly) Which sound changes?
- level w5-4 @847.8s (8 clips): /sh/ /o/ /p/ "shop" Listen to them both... "shop" (slowly) "pop" (slowly) Which sound changes?

### Praise: 14 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 9

- level w5-1 @34.1s: "Tap it once more, and say it again." cut after 0.0 of 2.5 s by /sh/
- level w5-1 @111.9s: "/sh/" cut after 0.2 of 0.8 s by /sh/
- level w5-1 @122.0s: "Now find how we write..." cut after 0.5 of 2.1 s by /dh/
- level w5-3 @653.5s: "/n/" cut after 0.5 of 0.9 s by Say the sounds, and read the word.
- level w5-4 @801.0s: "What do we need to change?" cut after 0.9 of 1.8 s by Yes, the last sound changes!
- level w5-4 @842.7s: "Which sound changes?" cut after 1.0 of 1.9 s by Yes, the middle sound changes!
- level w5-4 @855.3s: "Which sound changes?" cut after 1.5 of 1.9 s by Ninja power!
- level w5-6 @1216.9s: "/n/" cut after 0.5 of 0.9 s by Say the sounds, and read the word.
- level w5-8 @1528.0s: "What do we need to change?" cut after 0.9 of 1.8 s by Yes, the last sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 8 | level w5-1 ×2, level w5-2, level w5-3, level w5-4, level w5-6 ×2, level w5-7 |
| audit_gem_more "Look, this gem has filled a little more." | 3 | reward ×3 |
| t_another_way "This is another way to spell the sound..." | 3 | level w5-3, level w5-6 ×2 |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C5-S: playtest/fix/V-script/transcripts/continuous-splitter-from-w5-1.json

splitter, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 12 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 1 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 2 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 9 of 9 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.24 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | 6 of 6 (100%) | pass |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 5 words; 111 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 55 of 55, rabbit 43 of 43 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 10.5 s (build w5-1); 0 over | pass |

- **letters-60s**: w5-3 @9:08.3 ‹st_two_letters_too› "This one's two letters too, but it's just one sound." again within 60 s
- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @5:02.3; ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from reward @21:12.5

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

