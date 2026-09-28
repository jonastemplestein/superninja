# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## continuous-learner-from-w6-br1.json (continuous-learner-from-w6-br1, one continuous page)

409 Sensei lines, 629 sounds and words, 477 utterances in 59 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| next_sound_q | 27 | What's the next sound? |
| first_sound_q | 20 | What's the first sound? |
| last_sound_q | 20 | What's the last sound? |
| say_sounds_read | 19 | Say the sounds, and read the word. |
| tv_your_word | 13 | Your word is... |
| tv_fs_stuck_slow | 13 | Let's say it the slow way first... |
| tv_here_sound | 10 | Here's the sound... |
| tv_listen_here | 10 | Let's listen again. What can you hear here? |
| tv_next_word | 9 | Here's your next word... |
| t_two_letters | 8 | It's two letters, but it's one sound. |
| tv_watch_write | 8 | Now watch my ninja write it. |
| tv_which_write | 8 | Which of these is the way we write... |
| help_sort | 6 | Tap the chest with the same spelling as the word. |
| streak_3 | 6 | Ninja power! |
| tv_praise_sorted | 6 | That's the right chest. |
| tv_praise_kept_going | 6 | That was a tricky one, and you kept going. |
| tv_sort_done | 6 | Same sound, different spellings. You sorted them all. |
| streak_lost | 5 | Keep going, ninja. |
| audit_gem_more | 5 | Look, this gem has filled a little more. |
| audit_sort_again | 5 | Sorting time! Same sound, different spellings. |
| audit_sort_pair | 5 | This sound can be spelt in two ways. |
| streak_6 | 5 | Wow! Super ninja streak! |
| tv_learn_short_two | 4 | Back to the dojo. Today there are two new sounds. |
| tv_learn_first_short | 4 | Here's the first new sound... |
| tv_petal_say | 4 | Tap the petal, and say it with me. |
| tv_how_we_write | 4 | This is how we write... |
| tv_tap_letter_say | 4 | Now you tap it, and say the sound. |
| tv_said_well | 4 | Good, you said that sound really well. |
| tv_learn_next | 4 | Here's the next new sound... |
| st_know_this_sound | 4 | Ooh, you already know this sound! |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (12)

| Line | Repeats | Text | Example |
|---|---|---|---|
| next_sound_q | 8 | What's the next sound? | level w6-1 @576.8s and @580.5s |
| tv_which_write | 4 | Which of these is the way we write... | level w6-1 @380.8s and @385.7s |

### Spliced utterances: 70 of 477 (15%); chains of 5+ clips: 49

Commonest spliced shapes:

- ×5 ‹say_sounds_read› + /X/ + /X/ + /X/ + /X/ + W + ‹tv_next_word› + W + ‹first_sound_q›
- ×4 ‹tv_learn_short_two› + ‹tv_learn_first_short› + /X/
- ×4 ‹tv_learn_next› + /X/
- ×2 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹t_two_letters› + ‹tv_tap_it_say_short›
- ×2 ‹tv_yay_thats_it› + ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 ‹tv_fs_stuck_slow› + W
- ×2 ‹tv_to_reward› + ‹tv_won_one› + /X/
- ×2 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×2 ‹tv_which_write› + /X/ + /X/
- ×1 ‹tv_here_sound› + /X/ + ‹audit_bridging_first› + ‹tv_sort_frame› + ‹tv_sort_open›
- ×1 ‹t_two_letters› + /X/ + ‹tv_sort_ido› + W + ‹tv_sort_see› + ‹tv_sort_so› + ‹tv_ready_yours›
- ×1 ‹audit_sort_again› + ‹tv_here_sound› + /X/ + ‹audit_sort_pair› + ‹tg_ch_ch_way› + ‹t_two_letters› + /X/ + ‹tv_spelt_like_this_match›
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_letter_say›
- ×1 ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + /X/
- ×1 /X/ + ‹tv_which_write› + /X/

Longest chains:

- level w6-1 @556.5s (10 clips): /t/ Say the sounds, and read the word. /l/ /e/ /t/ "let" You said it slowly, and found every sound. Your word is... "snail" What's the first sound?
- level w6-1 @618.2s (10 clips): Say the sounds, and read the word. /p/ /ae/ /n/ /t/ "paint" That was a tricky one, and you kept going. Your word is... "nail" What's the first sound?
- level w6-3 @942.7s (10 clips): /ae/ Say the sounds, and read the word. /t/ /r/ /ae/ "tray" That was a tricky one, and you kept going. Your word is... "dream" What's the first sound?
- level w6-3 @1004.6s (10 clips): Say the sounds, and read the word. /k/ /w/ /ee/ /n/ "queen" Well done. Your word is... "feet" What's the first sound?
- level w6-ec11 @1783.4s (10 clips): /ch/ Say the sounds, and read the word. /b/ /ee/ /ch/ "beach" That was a tricky one, and you kept going. Here's your next word... "tie" What's the first sound?
- level w6-ec11 @1832.9s (10 clips): Say the sounds, and read the word. /t/ /oe/ /s/ /t/ "toast" Brilliant! Here's your next word... "then" What's the first sound?
- level w6-1 @590.4s (9 clips): Say the sounds, and read the word. /s/ /n/ /ae/ /l/ "snail" Here's your next word... "paint" What's the first sound?
- level w6-3 @921.6s (9 clips): Say the sounds, and read the word. /p/ /r/ /o/ /p/ "prop" Here's your next word... "tray" What's the first sound?

### Praise: 18 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 2

- level w6-br1 @169.3s: 10.9 s silent (0 taps) after "/k/ /r/ /i/ /s/ /p/ "crisp"", before "Same sound, different spellings. You sorted them all."
- level w6-1 @430.6s: 84.6 s silent (0 taps) after "Take your time, ninja.", before "Keep going, ninja."

### Cut-off clips: 14

- level w6-br1 @61.6s: "So it goes in this chest." cut after 1.9 of 2.2 s by Now you do one. Are you ready?
- level w6-1 @338.7s: "Tap it once more, and say it again." cut after 0.6 of 2.5 s by /ae/
- level w6-1 @535.4s: "Now tap the rabbit, and read the word fast." cut after 0.2 of 3.4 s by "rain"
- level w6-3 @891.5s: "Which of these is the way we write..." cut after 0.5 of 2.7 s by /ee/
- level w6-3 @895.3s: "/ee/" cut after 0.2 of 0.6 s by /ee/
- level w6-3 @897.1s: "Now let's build some words with your new sounds." cut after 2.9 of 3.2 s by Your word is...
- level w6-3 @1004.0s: "/n/" cut after 0.6 of 0.9 s by Say the sounds, and read the word.
- level w6-5 @1237.3s: "Slowly does it! Every sound is in its place." cut after 4.2 of 4.7 s by "in"
- level w6-6 @1327.6s: "You can hear it in boat, goat and coat." cut after 3.5 of 3.8 s by Tap the petal, and say it with me.
- level w6-6 @1384.7s: "/oe/" cut after 0.2 of 0.5 s by That's how we write...
- level w6-8 @1654.9s: ""blow"" cut after 0.3 of 0.6 s by /b/
- level w6-ec11 @1707.0s: "It's three letters, but it's just one sound." cut after 2.4 of 2.9 s by Now you tap it, and say the sound.
- level w6-ec11 @1753.5s: "/ie/" cut after 0.4 of 0.7 s by /ie/
- level w6-ec11 @1762.8s: "Now let's build some words with your new sounds." cut after 2.9 of 3.2 s by Your word is...

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 8 | level w6-br1, level w6-br2, level w6-1, level w6-3 ×2, level w6-6, level w6-ec11, level w6-9 |
| audit_gem_more "Look, this gem has filled a little more." | 5 | reward ×5 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| t_another_way "This is another way to spell the sound..." | 4 | level w6-1, level w6-3, level w6-6, level w6-ec11 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w6-br1 |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w6-ec11 |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C6-L: continuous-learner-from-w6-br1.json

learner, from w6-br1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 12 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 2 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_6 ×2 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.26 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 3 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 1 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 14.2 s (sort w6-br1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 6 words; 160 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 1 said (1 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 3 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 1 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 1 a level, 1 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 1 of 1 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 32 of 32, rabbit 32 of 32 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 38.2 s (find w6-1); 2 over | **FAIL** |

- **world-welcomes**: world_6 "Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!" said 2 times
- **cut-explanations**: w6-ec11 @28:27.0 ‹t_three_letters› "It's three letters, but it's just one sound."
- **unframed-turn**: sort (w6-br1 0:12.4): out of order (frame 14.5, demo 55.5, ready 66.9, hand-over 63.5). Opens: "Welcome back, ninja! I'm so happy to see you." · "Here's the sound..."
- **rhetorical-question**: ‹story:s6_3› "Why are you so grumpy, Baron? asked Super Ninja. The Baron sniffed. Nobody ever reads ME a story..." ×1
- **fs-talk**: find (w6-1) 38.2 s from ‹tv_yay_thats_it› "That's it!" to ‹tv_take_time› "Take your time, ninja.", with ‹tv_fs_stuck_slow› "Let's say it the slow way first..."; build (w6-1) 12.3 s from ‹sound:t› "/t/" to ‹first_sound_q› "What's the first sound?", with ‹tv_fs_praise_every› "You said it slowly, and found every sound."

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

