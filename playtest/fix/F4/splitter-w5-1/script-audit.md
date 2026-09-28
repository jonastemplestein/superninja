# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/F4/splitter-w5-1/continuous-splitter-from-w5-1.json (splitter-from-w5-1, one continuous page)

276 Sensei lines, 363 sounds and words, 269 utterances in 31 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| t_two_letters | 15 | It's two letters, but it's one sound. |
| listen | 12 | Listen... |
| tv_yay_lovely | 12 | Lovely! |
| dojo_tap_say | 11 | Tap it, and say it with me! |
| dojo_find | 11 | Can you find... |
| audit_spell_it | 10 | And this is how we spell it. |
| yay_2 | 9 | Super! |
| tv_here_sound | 9 | Here's the sound... |
| same_sound_new | 8 | Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling. |
| yay_8 | 7 | Wow, great listening! |
| tv_yay_thats_it | 7 | That's it! |
| tut_speaker | 7 | Tap the speaker to hear the sound again. |
| yay_1 | 7 | Brilliant! |
| map_hint | 6 | Tap the glowing stone to start your next adventure. |
| streak_6 | 6 | Wow! Super ninja streak! |
| tv_streak_10 | 6 | Ten in a row! Look how your ninja is glowing! |
| thats | 6 | That's... |
| yay_7 | 6 | You did it! |
| fm_rw_more | 6 | More stickers for your Sticker Book! |
| world_5 | 6 | Welcome to Shadow Castle. Don't worry, I'm right beside you. |
| streak_lost | 5 | Keep going, ninja. |
| we_need | 5 | We need... |
| t_in | 5 | ...in... |
| swap_make | 5 | Change it to make... |
| swap_which | 5 | Which sound needs to change? |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| streak_3 | 4 | Ninja power! |
| same_sound_diff | 4 | Same sound, different spellings! |
| dojo_build | 3 | Now let's make words! First, listen to the word. Then tap its sounds, one at a time. |
| which_sound | 3 | Which sound comes next? |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (40)

| Line | Repeats | Text | Example |
|---|---|---|---|
| dojo_find | 8 | Can you find... | level w5-1 @74.3s and @79.6s |
| dojo_tap_say | 5 | Tap it, and say it with me! | level w5-1 @24.0s and @38.5s |
| t_two_letters | 4 | It's two letters, but it's one sound. | level w5-1 @20.8s and @35.3s |
| tut_speaker | 4 | Tap the speaker to hear the sound again. | level w5-1 @76.8s and @81.6s |
| listen | 3 | Listen... | level w5-1 @29.6s and @41.9s |
| audit_spell_it | 3 | And this is how we spell it. | level w5-1 @32.9s and @45.7s |
| t_in | 3 | ...in... | world flower @278.2s and @281.5s |
| swap_make | 3 | Change it to make... | level w5-4 @722.7s and @733.4s |
| swap_which | 3 | Which sound needs to change? | level w5-4 @724.6s and @735.2s |
| same_sound_diff | 2 | Same sound, different spellings! | level w5-6 @985.8s and @1000.4s |
| tv_yay_lovely | 1 | Lovely! | level w5-1 @78.5s and @91.1s |
| swap_pick | 1 | Now pick the new sound. | level w5-4 @767.4s and @778.5s |

### Spliced utterances: 47 of 269 (17%); chains of 5+ clips: 44

Commonest spliced shapes:

- ×6 ‹listen› + /X/ + /X/
- ×3 ‹tv_yay_lovely› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×3 ‹thats› + /X/ + ‹we_need› + /X/ + ‹t_two_letters›
- ×2 ‹tv_yay_thats_it› + ‹dojo_find› + /X/
- ×2 ‹streak_lost› + ‹thats› + /X/ + ‹we_need› + /X/ + ‹t_two_letters›
- ×2 /X/ + ‹t_in› + W + ‹t_and_sometimes› + /X/ + ‹t_in› + W
- ×2 ‹yay_2› + ‹listen› + /X/ + /X/
- ×2 ‹swap_make› + W + ‹swap_which›
- ×1 ‹tv_yay_lovely› + ‹listen› + /X/ + /X/
- ×1 ‹tv_yay_thats_it› + ‹listen› + /X/ + /X/
- ×1 /X/ + ‹t_same_spelling_sometimes›
- ×1 /X/ + ‹st_th_moth_sometimes›
- ×1 /X/ + ‹tg_th_dh_in› + ‹dojo_tap_say›
- ×1 /X/ + ‹yay_8› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×1 ‹streak_3› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/

Longest chains:

- level w5-1 @132.0s (10 clips): /l/ Ten in a row! Look how your ninja is glowing! /sh/ /e/ /l/ "shell" It's two letters, but it's one sound. /l/ That's it! "ship"
- level w5-6 @1118.1s (9 clips): /z/ Wow! Super ninja streak! /k/ /w/ /i/ /z/ "quiz" Lovely! "cloth"
- level w5-1 @191.9s (8 clips): Wow! Super ninja streak! /ch/ /e/ /s/ /t/ "chest" Super! "wish"
- level w5-6 @1070.7s (8 clips): /k/ /w/ /i/ /l/ /t/ "quilt" Well done. "that"
- level w5-6 @1142.1s (8 clips): Ten in a row! Look how your ninja is glowing! /k/ /l/ /o/ /th/ "cloth" Brilliant! "ring"
- level w5-1 @103.6s (7 clips): Wow! Super ninja streak! /k/ /a/ /t/ "cat" Brilliant! Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up.
- level w5-1 @170.6s (7 clips): /p/ /sh/ /i/ /p/ "ship" Wow, great listening! "chest"
- world flower @277.7s (7 clips): /dh/ ...in... "this" ...and sometimes... /th/ ...in... "moth"

### Praise: 51 lines (2.4 a minute); stacked (2+ within 5 s): 7

- level w5-1 @103.6s: "Wow! Super ninja streak!" → "Brilliant!"
- level w5-1 @215.9s: "Well done! You practised so hard!" → "You did it!" → "You won back some sounds!"
- level w5-2 @430.2s: "Wow! Super ninja streak!" → "Hooray! The monster ran away!" → "You did it!"
- level w5-3 @567.0s: "Ninja power!" → "Super!"
- level w5-3 @628.3s: "Well done! You practised so hard!" → "You did it!"
- level w5-4 @782.9s: "Brilliant!" → "You fixed them all!"
- level w5-6 @1165.7s: "Super!" → "Well done! You practised so hard!" → "You did it!"

### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 20

- map @5.0s: "Tap the glowing stone to start your next adventure." cut after 0.8 of 3.3 s by This is the dojo. A dojo is where ninjas practise!
- level w5-1 @53.6s: "/th/" cut after 0.2 of 0.5 s by /th/
- level w5-1 @76.8s: "Tap the speaker to hear the sound again." cut after 0.8 of 2.2 s by /sh/
- level w5-1 @81.6s: "Tap the speaker to hear the sound again." cut after 1.2 of 2.2 s by /ch/
- level w5-1 @87.1s: "Tap the speaker to hear the sound again." cut after 1.1 of 2.2 s by /th/
- level w5-1 @89.7s: "Can you find..." cut after 0.7 of 1.1 s by /dh/
- level w5-1 @92.3s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 3.1 of 6.2 s by /k/
- map @448.2s: "Tap the glowing stone to start your next adventure." cut after 1.7 of 3.3 s by This is the dojo. A dojo is where ninjas practise!
- level w5-3 @510.2s: "Tap the speaker to hear the sound again." cut after 0.8 of 2.2 s by /k/
- level w5-3 @514.5s: "Tap the speaker to hear the sound again." cut after 1.1 of 2.2 s by /ng/
- level w5-3 @520.2s: "Tap the speaker to hear the sound again." cut after 0.9 of 2.2 s by /w/
- level w5-3 @525.6s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 3.2 of 6.2 s by Keep going, ninja.
- level w5-3 @539.7s: ""thin"" cut after 0.2 of 0.6 s by /th/
- level w5-4 @728.4s: "Yes, the first sound changes! Now pick the new sound." cut after 0.6 of 4.2 s by /m/
- level w5-4 @740.1s: "Yes, the last sound changes! Now pick the new sound." cut after 1.5 of 3.9 s by /m/
- level w5-4 @757.8s: "Yes, the middle sound changes! Now pick the new sound." cut after 0.8 of 4.3 s by /m/
- level w5-4 @767.4s: "Now pick the new sound." cut after 0.7 of 1.6 s by /sh/
- level w5-6 @1008.3s: "/v/" cut after 0.1 of 0.7 s by /v/
- level w5-6 @1050.3s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 3.5 of 6.2 s by /k/
- level w5-6 @1089.2s: "Which sound comes next?" cut after 1.0 of 1.7 s by /dh/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 15 | level w5-1 ×5, world flower ×2, level w5-2 ×2, level w5-3 ×4, level w5-6 ×2 |
| audit_spell_it "And this is how we spell it." | 10 | level w5-1 ×3, level w5-3 ×3, level w5-6 ×4 |
| same_sound_new "Ooh! You already know this sound. Here's another w" | 8 | level w5-3, reward ×2, world flower ×4, level w5-6 |
| tut_speaker "Tap the speaker to hear the sound again." | 7 | level w5-1 ×3, level w5-3 ×3, level w5-6 |
| same_sound_diff "Same sound, different spellings!" | 4 | level w5-3, level w5-6 ×3 |
| dojo_hello "This is the dojo. A dojo is where ninjas practise!" | 2 | map ×2 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| audit_hear_see "We hear the sound. Now look: this is how we spell " | 1 | level w5-1 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w5-1 |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |
| audit_dojo_back "Back to the dojo! Let's learn some new sounds." | 1 | stone 6: w5-6 |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |
| t_way_we_spell "This is the way we spell..." | 1 | world flower |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C5-S: playtest/fix/F4/splitter-w5-1/continuous-splitter-from-w5-1.json

splitter, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 16 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 7 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 5 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 2 | **FAIL** |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×6 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 5 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 7 (6 cut) | **FAIL** |
| `map-hint-cut` map hint cut by the next level | 0 | 5 of 6 | **FAIL** |
| `over-map` level lines started over the map | 0 | 4 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 of 3 | **FAIL** |
| `praise-rate` praise lines a minute | ≤ 1.5 | 3.81 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 15 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 13 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 14 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | 5 of 5 (100%) | pass |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 1 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 13 said (2 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 11; 3 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 9 words (median line 4 words; 88 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 2 said (2 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 16 said (4 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **letters-60s**: w5-1 @0:35.3 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-1 @0:48.4 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-1 @2:33.4 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-2 @6:24.2 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @8:01.9 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @8:20.5 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **same-sound-after-reveal**: w5-3 @7:40.9 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w5-6 @16:07.0 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"
- **world-welcomes**: world_5 "Welcome to Shadow Castle. Don't worry, I'm right beside you." said 6 times
- **did-it-after-praise**: level w5-1 @3:40.8; level w5-2 @7:16.0; level w5-3 @10:32.2; reward @13:06.7; level w5-6 @19:30.3
- **speaker-tip**: w5-1 @1:16.8 cut; w5-1 @1:21.6 cut; w5-1 @1:27.1 cut; w5-3 @8:30.2 cut; w5-3 @8:34.5 cut
- **map-hint-cut**: map @0:05.0 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @5:10.1 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @7:28.2 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @11:54.0 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @15:57.6 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: w5-1 @0:05.8 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; w5-3 @7:29.9 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; w5-4 @11:54.7 ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so"; w5-6 @15:58.1 ‹audit_dojo_back› "Back to the dojo! Let's learn some new sounds."
- **swap-place-heard**: w5-4 @12:08.4 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w5-4 @12:20.1 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut; w5-4 @12:37.8 ‹audit_swap_middle› "Yes, the middle sound changes! Now pick the new sound." cut
- **praise-rate**: 81 praise lines in 21.2 min
- **praise-stacks**: w5-1 @1:28.9: "That's it!" → "Lovely!"; w5-1 @1:43.6: "Wow! Super ninja streak!" → "Brilliant!"; w5-1 @2:24.4: "That's it!" → "Keep going, ninja."; w5-1 @3:34.7: "Lovely!" → "Well done! You practised so hard!"; w5-1 @3:35.9: "Well done! You practised so hard!" → "You did it!"
- **line-60s**: ‹listen› "Listen..." from w5-1 @0:11.5; ‹t_two_letters› "It's two letters, but it's one sound." from w5-1 @0:20.8; ‹dojo_tap_say› "Tap it, and say it with me!" from w5-1 @0:24.0; ‹audit_spell_it› "And this is how we spell it." from w5-1 @0:32.9; ‹tv_yay_lovely› "Lovely!" from w5-1 @0:40.8; ‹dojo_find› "Can you find..." from w5-1 @1:14.3
- **cut-explanations**: map @0:05.0 ‹map_hint› "Tap the glowing stone to start your next adventure."; w5-1 @1:16.8 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-1 @1:21.6 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-1 @1:27.1 ‹tut_speaker› "Tap the speaker to hear the sound again."; map @5:10.1 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @7:28.2 ‹map_hint› "Tap the glowing stone to start your next adventure."
- **over-framed**: ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some" at w5-3 @7:29.9, again after w5-1 @0:05.8
- **bare-command**: ‹listen› "Listen..." ×12; ‹battle_spell› "Spell..." ×1
- **bare-listen**: w5-1 @0:11.5 after dojo_hello: "Listen…" /sh/; w5-1 @0:29.6 after yay_8: "Listen…" /ch/ /ch/; w5-1 @0:41.9 after tv_yay_lovely: "Listen…" /th/; w5-1 @0:55.4 after tv_yay_thats_it: "Listen…" /dh/ /dh/; w5-3 @7:35.5 after dojo_hello: "Listen…" /k/ /k/; w5-3 @7:55.3 after tv_yay_lovely: "Listen…" /ng/ /ng/
- **rhetorical-question**: ‹jump_offer› "Wow! You got everything right. Is this too easy? You can jump ahead!" ×1; ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time." ×1
- **shouted-instruction**: ‹dojo_tap_say› "Tap it, and say it with me!" ×11; ‹audit_sounds_again› "Listen to the sounds, and catch the word they make!" ×3; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!" ×1; ‹run_start› "Ninja Run! Tap to jump, and catch the right word!" ×1

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 370 | pass |

