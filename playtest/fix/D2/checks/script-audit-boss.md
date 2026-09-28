# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/runs/fix/D2/t-w1-15b/continuous-learner-from-w1-15.json (learner-from-w1-15, one continuous page)

37 Sensei lines, 62 sounds and words, 49 utterances in 8 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_fs_stuck_slow | 3 | Let's say it the slow way first... |
| tv_listen_here | 2 | Let's listen again. What can you hear here? |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| baron_w1 | 1 | So... a little ninja wants to stop me? My sumo panda will squash you! |
| tv_boss_calm | 1 | Don't worry, ninja. You know what to do. |
| tv_boss_frame | 1 | A boss takes lots of words to beat. |
| tv_boss_ready | 1 | Are you ready to beat the boss? Tap the green arrow. |
| tv_your_word | 1 | Your word is... |
| tv_fs_say_sounds_slow | 1 | Let's say the sounds, the slow way... |
| tv_fs_rabbit_read | 1 | Now tap the rabbit, and read the word fast. |
| tv_fs_two_ways | 1 | There's a slow way to say a word, and a fast way. |
| tv_next_word | 1 | Here's your next word... |
| tv_praise_kept_going | 1 | That was a tricky one, and you kept going. |
| audit_listen_next | 1 | Let's listen again. What sound comes next? |
| baron_grr | 1 | Grrrr... You dare to fight ME? |
| tv_fs_say_slow | 1 | Let's say it the slow way... |
| tv_fs_now_fast | 1 | And now, fast... |
| streak_3 | 1 | Ninja power! |
| streak_lost | 1 | Keep going, ninja. |
| tv_fs_praise_every | 1 | You said it slowly, and found every sound. |
| baron_lose | 1 | Nooo! My muddle! This is not over, ninja... I will be back! |
| battle_boss_win | 1 | You beat the boss! What a ninja! |
| world_done | 1 | You found every sound in this land! Let's go to the next one! |
| fm_rw_more | 1 | More stickers for your Sticker Book! |
| audit_gem_first | 1 | Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. |
| tv_to_flower_first | 1 | Now let's go and see where your sounds live. Tap the green arrow. |
| t_visit | 1 | Let's visit the World Flower! |
| wf_petals_you_know | 1 | Every shining petal is a sound that you know! |
| tv_flower_recap | 1 | Here's a sound you learnt... |
| tp_o_hear | 1 | You can hear it in pot, top and mop. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (0)

| Line | Repeats | Text | Example |
|---|---|---|---|

### Spliced utterances: 7 of 49 (14%); chains of 5+ clips: 3

Commonest spliced shapes:

- ×1 ‹baron_w1› + ‹tv_boss_calm› + ‹tv_boss_frame› + ‹tv_boss_ready› + ‹tv_your_word›
- ×1 ‹tv_fs_stuck_slow› + W + /X/
- ×1 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×1 ‹tv_fs_two_ways› + ‹tv_next_word› + W
- ×1 ‹tv_fs_stuck_slow› + W
- ×1 ‹tv_fs_say_slow› + /X/ + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×1 ‹streak_lost› + ‹tv_fs_stuck_slow› + W + /X/

Longest chains:

- level w1-15 @122.1s (6 clips): Let's say it the slow way... /t/ /o/ /p/ And now, fast... "top"
- level w1-15 @6.6s (5 clips): So... a little ninja wants to stop me? My sumo panda will squash you! Don't worry, ninja. You know what to do. A boss takes lots of words to beat. Are you ready to beat the boss? Tap the green arrow. Your word is...
- level w1-15 @37.9s (5 clips): Let's say the sounds, the slow way... /t/ /a/ /n/ Now tap the rabbit, and read the word fast.

### Praise: 2 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 3

- level w1-15 @18.1s: "Are you ready to beat the boss? Tap the green arrow." cut after 2.8 of 3.4 s by Your word is...
- level w1-15 @42.8s: "Now tap the rabbit, and read the word fast." cut after 0.4 of 3.5 s by "tan"
- reward @188.6s: "Look, a gem! Each gem holds a way to spell a sound. When you get words" cut after 6.7 of 7.4 s by Now let's go and see where your sounds live. Tap t

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |

## playtest/runs/fix/D2/t-w1-15b/continuous-perfect-from-w1-15.json (perfect-from-w1-15, one continuous page)

32 Sensei lines, 56 sounds and words, 47 utterances in 8 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| baron_w1 | 1 | So... a little ninja wants to stop me? My sumo panda will squash you! |
| tv_boss_calm | 1 | Don't worry, ninja. You know what to do. |
| tv_boss_frame | 1 | A boss takes lots of words to beat. |
| tv_boss_ready | 1 | Are you ready to beat the boss? Tap the green arrow. |
| tv_your_word | 1 | Your word is... |
| tv_fs_say_sounds_slow | 1 | Let's say the sounds, the slow way... |
| tv_fs_rabbit_read | 1 | Now tap the rabbit, and read the word fast. |
| streak_3 | 1 | Ninja power! |
| tv_next_word | 1 | Here's your next word... |
| tv_fs_say_slow | 1 | Let's say it the slow way... |
| tv_fs_now_fast | 1 | And now, fast... |
| tv_fs_two_ways | 1 | There's a slow way to say a word, and a fast way. |
| tv_fs_slow_tortoise | 1 | First the slow way, like the tortoise... |
| tv_fs_fast_rabbit | 1 | Now the fast way, like the rabbit... |
| baron_grr | 1 | Grrrr... You dare to fight ME? |
| tv_yay_lovely | 1 | Lovely! |
| baron_lose | 1 | Nooo! My muddle! This is not over, ninja... I will be back! |
| battle_boss_win | 1 | You beat the boss! What a ninja! |
| world_done | 1 | You found every sound in this land! Let's go to the next one! |
| fm_rw_more | 1 | More stickers for your Sticker Book! |
| audit_gem_first | 1 | Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. |
| tv_jump_offer | 1 | Wow, you got everything right! Grown-ups, if this is too easy, you can jump ahead. |
| tv_to_flower_first | 1 | Now let's go and see where your sounds live. Tap the green arrow. |
| t_visit | 1 | Let's visit the World Flower! |
| wf_petals_you_know | 1 | Every shining petal is a sound that you know! |
| tv_flower_recap | 1 | Here's a sound you learnt... |
| tp_o_hear | 1 | You can hear it in pot, top and mop. |
| tv_petal_say | 1 | Tap the petal, and say it with me. |
| wf_world_new | 1 | New sounds are hiding in this land. Let's go and find them! |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (0)

| Line | Repeats | Text | Example |
|---|---|---|---|

### Spliced utterances: 5 of 47 (11%); chains of 5+ clips: 4

Commonest spliced shapes:

- ×1 ‹baron_w1› + ‹tv_boss_calm› + ‹tv_boss_frame› + ‹tv_boss_ready› + ‹tv_your_word›
- ×1 /X/ + ‹tv_fs_say_sounds_slow› + /X/ + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×1 ‹streak_3› + ‹tv_next_word› + W
- ×1 ‹tv_fs_say_slow› + /X/ + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×1 ‹tv_fs_slow_tortoise› + /X/ + /X/ + /X/ + ‹tv_fs_fast_rabbit› + W

Longest chains:

- level w1-15 @27.6s (6 clips): /p/ Let's say the sounds, the slow way... /s/ /i/ /p/ Now tap the rabbit, and read the word fast.
- level w1-15 @56.2s (6 clips): Let's say it the slow way... /t/ /i/ /p/ And now, fast... "tip"
- level w1-15 @84.8s (6 clips): First the slow way, like the tortoise... /p/ /a/ /t/ Now the fast way, like the rabbit... "pat"
- level w1-15 @6.5s (5 clips): So... a little ninja wants to stop me? My sumo panda will squash you! Don't worry, ninja. You know what to do. A boss takes lots of words to beat. Are you ready to beat the boss? Tap the green arrow. Your word is...

### Praise: 2 lines (0.6 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 3

- level w1-15 @18.0s: "Are you ready to beat the boss? Tap the green arrow." cut after 1.5 of 3.4 s by Your word is...
- level w1-15 @33.0s: "Now tap the rabbit, and read the word fast." cut after 0.4 of 3.5 s by "sip"
- reward @140.5s: "Look, a gem! Each gem holds a way to spell a sound. When you get words" cut after 6.6 of 7.4 s by Wow, you got everything right! Grown-ups, if this 

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C(w1-15)-L: playtest/runs/fix/D2/t-w1-15b/continuous-learner-from-w1-15.json

learner, from w1-15, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_2 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 0 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.18 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.5 s (boss w1-15); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 9 words (median line 7 words; 12 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 7 of 7, rabbit 7 of 7 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 7.6 s (boss w1-15); 0 over | pass |

- **cut-explanations**: reward @3:08.6 ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words"

### C(w1-15)-P: playtest/runs/fix/D2/t-w1-15b/continuous-perfect-from-w1-15.json

perfect, from w1-15, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_2 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 0 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.91 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 12.0 s (boss w1-15); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 7 words; 6 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 7 of 7, rabbit 7 of 7 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 12.0 s (boss w1-15); 0 over | pass |

- **cut-explanations**: reward @2:20.5 ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words"

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 1 of 494 | **FAIL** |

- ‹tv_fs_run› 3.4 w/s "I'll say it the slow way, and you catch the whole word."
