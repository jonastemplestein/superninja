## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C-P: playtest/transcripts/2026-09-26-script-editor/continuous-perfect.json

perfect, a brand-new child, opt-in none; recorded before continuous.ts published games, turns and holds, so games come from the scene.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_1 ×11 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 10 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 0 (day one) | 8 | **FAIL** |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 9 of 12 | **FAIL** |
| `over-map` level lines started over the map | 0 | 4 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 16 (7 repeats) | **FAIL** |
| `swap-place-heard` swap place lines heard to the end | all | 0 of 3 | **FAIL** |
| `praise-rate` praise lines a minute | ≤ 1.5 | 2.11 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 11 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 6 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 12 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 7 of 7 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 9 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 32 said (10 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 14.5 s (build w1-4); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 5 words (median line 4 words; 230 turns) | **FAIL** |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 27 said (7 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 66 said (28 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 5 | **FAIL** |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **world-welcomes**: world_1 "Welcome to Bamboo Village!" said 11 times
- **did-it-after-praise**: sticker book @7:34.8; reward @9:17.7; reward @11:47.9; reward @14:17.5; reward @16:39.1
- **jump-offers**: reward @14:25.5; reward @16:47.7; reward @17:50.7; reward @20:08.5; reward @22:11.7
- **map-hint-cut**: map @7:40.0 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @10:27.8 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @12:20.2 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @14:33.4 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @16:55.8 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: stone 1: w1-wu3 @5:14.6 ‹fm_l1_hello› "Ninja ears on! Let's listen to some words."; stone 3: w1-2 @7:42.1 ‹first_intro› "Every word starts with a sound. Let's listen for the very first sound!"; stone 5: w1-4 @12:22.3 ‹audit_dojo_first› "This is our dojo. Here we listen to sounds, make words, and read them."; stone 8: w1-7 @18:00.6 ‹hunt_intro› "Now let's listen for a sound in the middle of a word!"
- **how-we-spell**: w1-2 /s/: 2×; w1-3 /a/: 2×; w1-3 /t/: 2×; w1-7 /i/: 2×; w1-10 /n/: 2×; w1-10 /p/: 2×
- **swap-place-heard**: w1-8 @20:53.3 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w1-8 @21:06.6 ‹audit_swap_middle› "Yes, the middle sound changes! Now pick the new sound." cut; w1-8 @21:48.1 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut
- **praise-rate**: 65 praise lines in 30.8 min
- **praise-stacks**: w1-wu1 @2:55.8: "You found them both! They both start with..." → "You can hear the sounds in words. Brilliant listening!"; w1-wu3 @6:32.4: "You found them all!" → "You can hear the sounds in words. Brilliant listening!"; w1-2 @9:11.4: "Super!" → "Ace!"; reward @9:17.7: "You did it!" → "You won back some sounds!"; w1-3 @11:41.2: "Smashing!" → "Fantastic!"
- **line-60s**: ‹first_q› "Which one starts with..." from w1-2 @7:51.7; ‹how_we_spell› "This is how we spell..." from w1-2 @8:11.9; ‹hunt_q› "Which one has this sound in it?" from w1-7 @18:13.9; ‹swap_make› "Change it to make..." from w1-8 @20:44.0; ‹what_changed› "What changed? Listen here." from w1-8 @20:49.7; ‹swap_pick› "Now pick the new sound." from w1-8 @21:19.1
- **cut-explanations**: map @7:40.0 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @10:27.8 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @12:20.2 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @14:33.4 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @16:55.8 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @17:58.5 ‹map_hint› "Tap the glowing stone to start your next adventure."
- **unframed-turn**: firstsound (w1-2 7:47.2): no frame line (tv_first_frame), no narrated demo, no Ready hold. Opens: "Every word starts with a sound. Let's listen for t" · "Watch me first!"; build (w1-4 12:30.9): no frame line (tv_build_frame/tv_build_lines), no narrated demo, no Ready hold, no hand-over. Opens: "This is our dojo. Here we listen to sounds, make w" · "This word has two sounds!"; readcheck (w1-4 14:00.2): no frame line (tv_readers_meet/tv_rc_how), no hand-over. Opens: "Tap each sound, and say it." · "Who read it right?"; battle (w1-6 16:58.5): no frame line (tv_battle_oh_no/tv_battle_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Uh oh! One of Baron Muddle's monsters is in the wa" · "Spell..."; soundhunt (w1-7 18:09.2): no frame line (tv_hunt_frame), no Ready hold, no hand-over. Opens: "Now let's listen for a sound in the middle of a wo" · "The middle sound comes after the first sound, and "; swap (w1-8 20:36.8): no frame line (tv_swap_oh_dear/tv_swap_frame/tv_swap_read_first), no narrated demo, no Ready hold, no hand-over. Opens: "Baron Muddle has mixed up these words! Can you fix" · "This is..."
- **over-framed**: ‹fm_l1_hello› "Ninja ears on! Let's listen to some words." at stone 1: w1-wu3 @5:14.6, again after w1-wu1 @1:40.0; ‹fm_tap_all_start› "Tap all the pictures that start with..." at w1-wu3 @6:18.2, again after w1-wu1 @2:43.1; ‹first_intro› "Every word starts with a sound. Let's listen for the very first sound!" at stone 4: w1-3 @10:29.9, again after stone 3: w1-2 @7:42.1; ‹fm_l2_way› "Ninjas read this way!" at w1-4 @12:37.5, again after w1-wu2 @3:28.0; ‹read_intro› "Who read it right? Listen to Kai and Suki!" at w1-5 @16:17.2, again after w1-4 @13:56.9; ‹read_intro› "Who read it right? Listen to Kai and Suki!" at w1-7 @19:37.3, again after w1-5 @16:17.2
- **bare-command**: ‹ido› "Watch me first!" ×13; ‹find_q› "Find this sound..." ×6; ‹fm_you_try› "Now you try!" ×3; ‹fm_show_me_2› "Watch me first!" ×3; ‹fm_you_try_2› "Your turn!" ×2; ‹fm_tap_sun› "Tap the sun!" ×1
- **talk-before-action**: build (w1-4) 14.5 s from ‹say_sounds_read› "Say the sounds... and read the word!" to ‹youdo› "Now it's your turn!"
- **turn-median**: turns under 8 words: 147 of 230
- **rhetorical-question**: ‹jump_offer› "Wow! You got everything right. Is this too easy? You can jump ahead!" ×8; ‹what_changed› "What changed? Listen here." ×6; ‹read_intro› "Who read it right? Listen to Kai and Suki!" ×4; ‹read_who› "Who read it right?" ×4; ‹hunt_q› "Which one has this sound in it?" ×3; ‹fm_notice_sun_sock› "Did you notice? Sun and sock start with the same sound..." ×1
- **shouted-instruction**: ‹say_sounds_read› "Say the sounds... and read the word!" ×17; ‹ido› "Watch me first!" ×13; ‹read_intro› "Who read it right? Listen to Kai and Suki!" ×4; ‹fm_you_try› "Now you try!" ×3; ‹fm_show_me_2› "Watch me first!" ×3; ‹fm_tap_tortoise› "Your turn! Tap the tortoise, and say it slowly with me." ×2
- **demo-command**: w1-wu1 @1:48.7 ‹fm_tap_sun› "Tap the sun!" during ‹fm_show_me› "Let me show you!"; w1-wu1 @2:43.1 ‹fm_tap_all_start› "Tap all the pictures that start with..." during ‹fm_show_me› "Let me show you!"; w1-wu3 @5:36.9 ‹fm_slow_listen› "Listen to my slow word..." during ‹fm_show_me_2› "Watch me first!"; w1-wu3 @5:41.2 ‹fm_which_pic› "Which picture is it?" during ‹fm_show_me_2› "Watch me first!"; w1-wu3 @5:59.6 ‹fm_tap_all_in› "Tap all the pictures with this sound in them..." during ‹fm_show_me› "Let me show you!"

### C-L: playtest/transcripts/2026-09-26-script-editor/continuous-learner.json

learner, a brand-new child, opt-in none; recorded before continuous.ts published games, turns and holds, so games come from the scene.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_1 ×12 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 8 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 0 (day one) | 1 | **FAIL** |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 10 of 13 | **FAIL** |
| `over-map` level lines started over the map | 0 | 5 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 10 (4 repeats) | **FAIL** |
| `swap-place-heard` swap place lines heard to the end | all | 0 of 3 | **FAIL** |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.93 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 10 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 7 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 13 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 2 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 7 of 7 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 11 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 31 said (10 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 17.9 s (build w1-4); 2 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 7 words (median line 4 words; 180 turns) | **FAIL** |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 16 said (7 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 62 said (30 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 5 | **FAIL** |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **world-welcomes**: world_1 "Welcome to Bamboo Village!" said 12 times
- **did-it-after-praise**: sticker book @13:44.5; reward @15:37.5; w1-3 @18:46.8; reward @21:28.7; reward @23:56.8
- **jump-offers**: reward @32:26.9
- **map-hint-cut**: map @7:52.6 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @10:39.0 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @12:33.7 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @13:51.0 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @17:05.3 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: stone 1: w1-wu3 @6:01.9 ‹fm_l1_hello› "Ninja ears on! Let's listen to some words."; stone 3: w1-wu5 @10:41.4 ‹fm_l1_hello› "Ninja ears on! Let's listen to some words."; stone 5: w1-2 @13:53.1 ‹first_intro› "Every word starts with a sound. Let's listen for the very first sound!"; stone 7: w1-4 @19:28.8 ‹audit_dojo_first› "This is our dojo. Here we listen to sounds, make words, and read them."; stone 10: w1-7 @25:36.2 ‹hunt_intro› "Now let's listen for a sound in the middle of a word!"
- **how-we-spell**: w1-2 /s/: 2×; w1-3 /a/: 2×; w1-3 /t/: 2×; w1-7 /i/: 2×
- **swap-place-heard**: w1-8 @28:34.7 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w1-8 @28:50.5 ‹audit_swap_middle› "Yes, the middle sound changes! Now pick the new sound." cut; w1-8 @29:31.3 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut
- **praise-rate**: 63 praise lines in 32.6 min
- **praise-stacks**: w1-wu1 @3:32.8: "You found them both! They both start with..." → "You can hear the sounds in words. Brilliant listening!"; w1-2 @15:26.2: "Keep going, ninja!" → "Ace!"; w1-2 @15:29.7: "Ace!" → "Smashing!"; reward @15:37.5: "You did it!" → "You won back some sounds!"; w1-3 @18:38.5: "Amazing!" → "Ace!"
- **line-60s**: ‹fm_which_pic› "Which picture is it?" from w1-wu5 @11:02.7; ‹first_q› "Which one starts with..." from w1-2 @14:03.0; ‹how_we_spell› "This is how we spell..." from w1-2 @14:21.5; ‹hunt_q› "Which one has this sound in it?" from w1-7 @25:49.5; ‹swap_make› "Change it to make..." from w1-8 @28:25.3; ‹what_changed› "What changed? Listen here." from w1-8 @28:30.9
- **cut-explanations**: map @7:52.6 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @10:39.0 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @12:33.7 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @13:51.0 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @17:05.3 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @19:26.7 ‹map_hint› "Tap the glowing stone to start your next adventure."
- **unframed-turn**: firstsound (w1-2 13:58.0): no frame line (tv_first_frame), no narrated demo, no Ready hold. Opens: "Every word starts with a sound. Let's listen for t" · "Watch me first!"; build (w1-4 19:37.5): no frame line (tv_build_frame/tv_build_lines), no narrated demo, no Ready hold, no hand-over. Opens: "This is our dojo. Here we listen to sounds, make w" · "This word has two sounds!"; readcheck (w1-4 21:10.8): no frame line (tv_readers_meet/tv_rc_how), no hand-over. Opens: "Tap each sound, and say it." · "Who read it right?"; battle (w1-6 24:13.1): no frame line (tv_battle_oh_no/tv_battle_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Uh oh! One of Baron Muddle's monsters is in the wa" · "Spell..."; soundhunt (w1-7 25:44.8): no frame line (tv_hunt_frame), no Ready hold, no hand-over. Opens: "Now let's listen for a sound in the middle of a wo" · "The middle sound comes after the first sound, and "; swap (w1-8 28:18.1): no frame line (tv_swap_oh_dear/tv_swap_frame/tv_swap_read_first), no narrated demo, no Ready hold, no hand-over. Opens: "Baron Muddle has mixed up these words! Can you fix" · "This is..."
- **over-framed**: ‹fm_tap_all_start› "Tap all the pictures that start with..." at w1-wu1 @3:26.6, again after w1-wu1 @3:08.0; ‹fm_l1_hello› "Ninja ears on! Let's listen to some words." at stone 1: w1-wu3 @6:01.9, again after w1-wu1 @2:01.8; ‹fm_tap_all_in› "Tap all the pictures with this sound in them..." at w1-wu3 @7:10.7, again after w1-wu3 @6:54.3; ‹fm_tap_all_start› "Tap all the pictures that start with..." at w1-wu3 @7:24.8, again after w1-wu1 @3:26.6; ‹fm_l2_way› "Ninjas read this way!" at w1-wu4 @7:55.4, again after w1-wu2 @4:07.3; ‹fm_l2_way› "Ninjas read this way!" at w1-wu4 @9:22.0, again after w1-wu4 @7:55.4
- **bare-command**: ‹ido› "Watch me first!" ×8; ‹listen_again› "Listen again." ×7; ‹find_q› "Find this sound..." ×4; ‹fm_you_try› "Now you try!" ×3; ‹fm_tap_sock› "Tap the sock!" ×2; ‹fm_show_me_2› "Watch me first!" ×2
- **talk-before-action**: build (w1-4) 17.9 s from ‹sound:m› "/m/" to ‹first_sound_q› "What's the first sound?"; build (w1-4) 12.1 s from ‹sound:a› "/a/" to ‹first_sound_q› "What's the first sound?"
- **turn-median**: turns under 8 words: 91 of 180
- **rhetorical-question**: ‹what_changed› "What changed? Listen here." ×6; ‹read_intro› "Who read it right? Listen to Kai and Suki!" ×3; ‹read_who› "Who read it right?" ×3; ‹fm_notice_sun_sock› "Did you notice? Sun and sock start with the same sound..." ×1; ‹audit_made_of_sounds› "Remember? Words are made of sounds!" ×1; ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time." ×1
- **shouted-instruction**: ‹say_sounds_read› "Say the sounds... and read the word!" ×11; ‹ido› "Watch me first!" ×8; ‹fm_you_try› "Now you try!" ×3; ‹fm_tap_tortoise› "Your turn! Tap the tortoise, and say it slowly with me." ×3; ‹fm_l2_turn› "Your turn! Tap them the ninja way." ×3; ‹read_intro› "Who read it right? Listen to Kai and Suki!" ×3
- **demo-command**: w1-wu1 @2:10.4 ‹fm_tap_sun› "Tap the sun!" during ‹fm_show_me› "Let me show you!"; w1-wu1 @3:08.0 ‹fm_tap_all_start› "Tap all the pictures that start with..." during ‹fm_show_me› "Let me show you!"; w1-wu3 @6:30.2 ‹fm_slow_listen› "Listen to my slow word..." during ‹fm_show_me_2› "Watch me first!"; w1-wu3 @6:34.4 ‹fm_which_pic› "Which picture is it?" during ‹fm_show_me_2› "Watch me first!"; w1-wu3 @6:54.3 ‹fm_tap_all_in› "Tap all the pictures with this sound in them..." during ‹fm_show_me› "Let me show you!"

### C5-P: playtest/transcripts/2026-09-26-script-editor/continuous-perfect-from-w5-1.json

perfect, from w5-1, opt-in none; recorded before continuous.ts published games, turns and holds, so games come from the scene.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 25 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 14 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 7 sounds | **FAIL** |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 2 | **FAIL** |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×10, world_6 ×2 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 10 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 12 | **FAIL** |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 2 | **FAIL** |
| `over-map` level lines started over the map | 0 | 6 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 of 4 | **FAIL** |
| `praise-rate` praise lines a minute | ≤ 1.5 | 3.76 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 20 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 13 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 5 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 1 of 1 | **FAIL** |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 1 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 4 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 14 said (2 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 11; 3 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 14.4 s (sort w6-br1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 6 words (median line 4 words; 155 turns) | **FAIL** |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 14 said (2 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 22 said (7 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **letters-60s**: w5-1 @0:32.5 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-1 @0:46.4 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-2 @4:03.8 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-2 @4:44.9 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @5:39.2 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @5:52.2 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **letters-twice**: /sh/: 2× (w5-1 0:19.8, world flower 3:11.3); /ch/: 6× (w5-1 0:32.5, w5-2 4:03.8, w5-6 13:52.3, w5-8 18:34.9, w5-9 20:44.6, w5-11 23:57.3); /p/: 2× (w5-2 4:44.9, w5-5 10:34.8); /ng/: 3× (w5-3 5:52.2, w5-4 9:02.8, w5-7 17:38.7); /l/: 2× (w5-3 7:34.0, w5-6 14:33.0); /k/: 3× (world flower 8:08.7, w5-5 12:02.5, w5-9 20:27.6)
- **same-sound-after-reveal**: w5-3 @5:32.4 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w5-6 @13:02.6 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"
- **world-welcomes**: world_5 "Welcome to Shadow Castle. Don't worry, I'm right beside you." said 10 times; world_6 "Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!" said 2 times
- **did-it-after-praise**: reward @2:45.5; reward @5:02.5; reward @7:41.9; reward @9:53.4; reward @15:14.2
- **jump-offers**: reward @2:54.1; reward @5:11.4; reward @7:50.8; reward @10:02.2; reward @12:43.6
- **map-hint-cut**: map @0:04.2 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: stone 1: w5-1 @0:04.9 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; stone 4: w5-4 @8:45.4 ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so"; stone 6: w5-6 @12:53.7 ‹audit_dojo_back› "Back to the dojo! Let's learn some new sounds."; stone 8: w5-8 @18:17.6 ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so"; stone 9: w5-9 @19:44.0 ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t"
- **swap-place-heard**: w5-4 @8:58.5 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut; w5-4 @9:12.3 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w5-8 @18:30.9 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w5-8 @18:43.1 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut
- **praise-rate**: 102 praise lines in 27.1 min
- **praise-stacks**: w5-1 @1:12.4: "Well done!" → "Super!"; w5-1 @1:16.0: "Super!" → "Ninja power!"; w5-1 @1:19.5: "Ninja power!" → "Brilliant!"; w5-1 @1:22.9: "Brilliant!" → "Smashing!"; w5-1 @2:40.9: "Super!" → "Well done! You practised so hard!"
- **line-60s**: ‹listen› "Listen..." from w5-1 @0:10.6; ‹t_two_letters› "It's two letters, but it's one sound." from w5-1 @0:19.8; ‹dojo_tap_say› "Tap it, and say it with me!" from w5-1 @0:23.0; ‹audit_spell_it› "And this is how we spell it." from w5-1 @0:30.1; ‹dojo_find› "Can you find..." from w5-1 @1:13.6; ‹t_way_we_spell› "This is the way we spell..." from world flower @3:07.7
- **cut-explanations**: map @0:04.2 ‹map_hint› "Tap the glowing stone to start your next adventure."; w5-4 @8:58.5 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound."; w5-4 @9:12.3 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound."; w5-8 @18:30.9 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound."; w5-8 @18:43.1 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound."
- **master-early**: w5-1 @1:59.7
- **unframed-turn**: sort (w6-br1 25:38.6): no narrated demo, no Ready hold. Opens: "You know this sound! Now let's look at the differe" · "Sorting time! These words have the same sound, but"
- **over-framed**: ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some" at stone 3: w5-3 @5:21.3, again after stone 1: w5-1 @0:04.9; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t" at w5-7 @16:37.7, again after w5-2 @3:44.2; ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so" at stone 8: w5-8 @18:17.6, again after stone 4: w5-4 @8:45.4; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t" at stone 9: w5-9 @19:44.0, again after w5-7 @16:37.7
- **bare-command**: ‹listen› "Listen..." ×11; ‹battle_spell› "Spell..." ×3
- **bare-listen**: w5-1 @0:10.6 after dojo_hello: "Listen…" /sh/; w5-1 @0:27.0 after yay_4: "Listen…" /ch/ /ch/; w5-1 @0:40.0 after yay_10: "Listen…" /th/ /th/; w5-1 @0:54.4 after yay_1: "Listen…" /dh/ /dh/; w5-3 @5:26.9 after dojo_hello: "Listen…" /k/ /k/; w5-3 @5:45.8 after yay_2: "Listen…" /ng/ /ng/
- **turn-median**: turns under 8 words: 104 of 155
- **rhetorical-question**: ‹jump_offer› "Wow! You got everything right. Is this too easy? You can jump ahead!" ×12; ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time." ×2
- **shouted-instruction**: ‹dojo_tap_say› "Tap it, and say it with me!" ×11; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!" ×3; ‹story_your_turn› "Your turn to read! Tap a word if you need help." ×3; ‹audit_sounds_again› "Listen to the sounds, and catch the word they make!" ×2; ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up." ×1; ‹run_start› "Ninja Run! Tap to jump, and catch the right word!" ×1

### C5-L: playtest/transcripts/2026-09-26-script-editor/continuous-learner-from-w5-1.json

learner, from w5-1, opt-in none; recorded before continuous.ts published games, turns and holds, so games come from the scene.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 23 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 8 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 4 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 2 | **FAIL** |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×10, world_6 ×2 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 10 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 10 (10 cut) | **FAIL** |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 2 | **FAIL** |
| `over-map` level lines started over the map | 0 | 5 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 of 4 | **FAIL** |
| `praise-rate` praise lines a minute | ≤ 1.5 | 3.48 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 24 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 14 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 15 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 3 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 1 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 4 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 21 said (2 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 15; 7 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 14.5 s (sort w6-br1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 7 words (median line 5 words; 173 turns) | **FAIL** |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 2 said (1 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 23 said (8 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **letters-60s**: w5-1 @0:32.2 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-1 @0:45.6 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @7:10.0 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @7:26.7 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @8:09.3 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @8:30.3 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **same-sound-after-reveal**: w5-3 @6:49.8 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w5-6 @14:48.1 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"
- **world-welcomes**: world_5 "Welcome to Shadow Castle. Don't worry, I'm right beside you." said 10 times; world_6 "Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!" said 2 times
- **did-it-after-praise**: reward @3:31.8; reward @6:31.0; reward @9:34.4; reward @11:54.1; reward @18:11.5
- **speaker-tip**: w5-1 @1:14.4 cut; w5-1 @1:19.1 cut; w5-1 @1:24.7 cut; w5-3 @7:36.3 cut; w5-3 @7:41.1 cut
- **map-hint-cut**: map @0:04.2 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: stone 1: w5-1 @0:04.9 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; stone 4: w5-4 @10:37.9 ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so"; stone 8: w5-8 @21:35.9 ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so"; stone 9: w5-9 @23:06.4 ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t"; stone 10: w5-10 @25:13.6 ‹story_start› "Story time! I'll read, and you read too."
- **swap-place-heard**: w5-4 @10:50.9 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w5-4 @11:07.4 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut; w5-8 @21:48.8 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w5-8 @22:02.7 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut
- **praise-rate**: 112 praise lines in 32.2 min
- **praise-stacks**: w5-1 @1:11.1: "Ace!" → "Brilliant!"; w5-1 @1:21.3: "Ninja power!" → "Keep going, ninja!"; w5-1 @1:25.5: "Keep going, ninja!" → "Smashing!"; w5-1 @1:29.7: "Smashing!" → "Fantastic!"; w5-1 @2:25.2: "Super!" → "Keep going, ninja!"
- **line-60s**: ‹listen› "Listen..." from w5-1 @0:10.5; ‹t_two_letters› "It's two letters, but it's one sound." from w5-1 @0:19.8; ‹dojo_tap_say› "Tap it, and say it with me!" from w5-1 @0:23.0; ‹audit_spell_it› "And this is how we spell it." from w5-1 @0:29.8; ‹dojo_find› "Can you find..." from w5-1 @1:11.9; ‹tut_speaker› "Tap the speaker to hear the sound again." from w5-1 @1:14.4
- **cut-explanations**: map @0:04.2 ‹map_hint› "Tap the glowing stone to start your next adventure."; w5-1 @1:14.4 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-1 @1:19.1 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-1 @1:24.7 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-3 @7:36.3 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-3 @7:41.1 ‹tut_speaker› "Tap the speaker to hear the sound again."
- **unframed-turn**: sort (w6-br1 30:39.7): no narrated demo, no Ready hold. Opens: "You know this sound! Now let's look at the differe" · "Sorting time! These words have the same sound, but"
- **over-framed**: ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some" at stone 3: w5-3 @6:38.7, again after stone 1: w5-1 @0:04.9; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t" at w5-7 @19:39.3, again after w5-2 @4:33.1; ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so" at stone 8: w5-8 @21:35.9, again after stone 4: w5-4 @10:37.9; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t" at stone 9: w5-9 @23:06.4, again after w5-7 @19:39.3
- **bare-command**: ‹listen› "Listen..." ×18; ‹battle_spell› "Spell..." ×3
- **bare-listen**: w5-1 @0:10.5 after dojo_hello: "Listen…" /sh/; w5-1 @0:26.7 after yay_10: "Listen…" /ch/ /ch/; w5-1 @0:39.2 after yay_1: "Listen…" /th/ /th/; w5-1 @0:53.3 after yay_2: "Listen…" /dh/ /dh/; w5-1 @3:18.6 after listen_here: "Listen…" bench; w5-3 @6:44.3 after dojo_hello: "Listen…" /k/ /k/
- **turn-median**: turns under 8 words: 110 of 173
- **rhetorical-question**: ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time." ×2
- **shouted-instruction**: ‹dojo_tap_say› "Tap it, and say it with me!" ×11; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!" ×3; ‹story_your_turn› "Your turn to read! Tap a word if you need help." ×3; ‹audit_sounds_again› "Listen to the sounds, and catch the word they make!" ×2; ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up." ×1; ‹run_start› "Ninja Run! Tap to jump, and catch the right word!" ×1

### C6-P: playtest/transcripts/2026-09-26-script-editor/continuous-perfect-from-w6-br1.json

perfect, from w6-br1, opt-in none; recorded before continuous.ts published games, turns and holds, so games come from the scene.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 | 34 | **FAIL** |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 20 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 7 sounds | **FAIL** |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 2 | **FAIL** |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 4 | **FAIL** |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_6 ×13 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 12 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 2 | **FAIL** |
| `over-map` level lines started over the map | 0 | 7 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 3.32 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 17 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 5 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 1 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 1 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 9 said (2 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 8; 4 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 17.6 s (sort w6-br1); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 7 words (median line 7 words; 106 turns) | **FAIL** |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 2 said (2 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 20 said (8 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **letters-lines**: w6-br1 @0:19.9 ‹t_two_letters› "It's two letters, but it's one sound."; w6-br2 @1:48.7 ‹t_two_letters› "It's two letters, but it's one sound."; w6-br2 @1:52.6 ‹t_three_letters› "It's three letters, but it's just one sound."; w6-1 @3:09.8 ‹t_two_letters› "It's two letters, but it's one sound."; w6-1 @3:30.2 ‹t_two_letters› "It's two letters, but it's one sound."; world flower @5:11.4 ‹t_two_letters› "It's two letters, but it's one sound."
- **letters-60s**: w6-1 @3:30.2 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; world flower @5:31.3 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-2 @5:57.7 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-2 @6:02.0 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-3 @7:47.2 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-3 @8:29.3 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **letters-twice**: /ch/: 3× (w6-br2 1:48.7, w6-br2 1:52.6, w6-5 11:59.8); /ae/: 6× (w6-1 3:09.8, world flower 5:11.4, world flower 5:31.3, w6-2 5:57.7, w6-2 6:02.0, w6-6 14:05.8); ?/: 4× (w6-1 3:30.2, w6-3 7:47.2, w6-6 13:23.4, w6-ec11 17:33.4); /ee/: 5× (w6-3 7:25.7, world flower 9:20.3, world flower 9:40.9, w6-4 10:07.4, w6-4 10:11.8); /n/: 2× (w6-5 11:46.0, w6-9 22:58.8); /oe/: 6× (w6-6 13:01.9, world flower 14:58.4, world flower 15:19.0, w6-8 15:46.3, w6-8 15:50.7, w6-9 21:23.3)
- **letters-echo**: level w6-4 @9:59.7 (one breath): Sorting time! Same sound, different spellings. This sound can be spelt in two ways. /ee/ It's two letters, but it's one sound. /ee/ It's two letters, but it's one sound. Tap the chest wit; level w6-8 @15:42.4 (one breath): This sound can be spelt in two ways. /oe/ It's two letters, but it's one sound. /oe/ It's two letters, but it's one sound. Tap the chest with the same spelling as the word. "grow"
- **same-sound-after-reveal**: w6-1 @3:23.4 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-3 @7:40.4 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-6 @13:16.6 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-ec11 @17:26.6 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"
- **world-welcomes**: world_6 "Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!" said 13 times
- **did-it-after-praise**: reward @1:22.3; reward @2:44.9; reward @4:50.4; reward @6:58.6; reward @8:58.4
- **map-hint-cut**: map @0:04.2 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: stone 3: w6-1 @2:55.5 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; stone 4: w6-2 @5:50.2 ‹audit_sort_again› "Sorting time! Same sound, different spellings."; stone 5: w6-3 @7:13.1 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; stone 8: w6-6 @12:51.7 ‹audit_dojo_back› "Back to the dojo! Let's learn some new sounds."; stone 9: w6-8 @15:38.6 ‹audit_sort_again› "Sorting time! Same sound, different spellings."
- **praise-rate**: 83 praise lines in 25.0 min
- **praise-stacks**: w6-1 @3:36.9: "Ace!" → "Smashing!"; w6-1 @3:40.2: "Smashing!" → "Super!"; w6-1 @4:45.3: "Well done!" → "Well done! You practised so hard!"; reward @4:50.4: "You did it!" → "You won back some sounds!"; w6-3 @7:53.8: "Ace!" → "Amazing!"
- **line-60s**: ‹t_two_letters› "It's two letters, but it's one sound." from world flower @5:11.4; ‹yay_9› "Smashing!" from w6-3 @7:32.5; ‹yay_2› "Super!" from w6-6 @13:29.9; ‹story_your_turn› "Your turn to read! Tap a word if you need help." from w6-10 @23:50.8; ‹well_read› "Well read!" from w6-10 @23:51.5
- **cut-explanations**: map @0:04.2 ‹map_hint› "Tap the glowing stone to start your next adventure."
- **unframed-turn**: sort (w6-br1 0:05.5): no narrated demo, no Ready hold. Opens: "Tap the glowing stone to start your next adventure" · "You know this sound! Now let's look at the differe"
- **over-framed**: ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some" at stone 5: w6-3 @7:13.1, again after stone 3: w6-1 @2:55.5
- **bare-command**: ‹listen› "Listen..." ×8; ‹battle_spell› "Spell..." ×1
- **bare-listen**: w6-1 @3:01.1 after dojo_hello: "Listen…" /ae/ /ae/; w6-1 @3:16.9 after yay_9: "Listen…" /ae/; w6-3 @7:18.7 after dojo_hello: "Listen…" /ee/; w6-3 @7:33.4 after yay_9: "Listen…" /ee/; w6-6 @12:55.1 after audit_dojo_back: "Listen…" /oe/; w6-6 @13:09.8 after yay_3: "Listen…" /oe/
- **talk-before-action**: sort (w6-br1) 17.6 s from ‹audit_bridging_first› "You know this sound! Now let's look at the different ways we spell it." to ‹help_sort› "Tap the chest with the same spelling as the word."
- **turn-median**: turns under 8 words: 64 of 106
- **rhetorical-question**: ‹jump_offer› "Wow! You got everything right. Is this too easy? You can jump ahead!" ×1; ‹story:s6_3› "Why are you so grumpy, Baron? asked Super Ninja. The Baron sniffed. Nobody ever reads ME a story..." ×1
- **shouted-instruction**: ‹dojo_tap_say› "Tap it, and say it with me!" ×8; ‹story_your_turn› "Your turn to read! Tap a word if you need help." ×4; ‹run_read› "Read the word, and catch the matching picture!" ×3; ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up." ×1; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!" ×1; ‹t_everyone_say› "Say that sound with me!" ×1

### C6-L: playtest/transcripts/2026-09-26-script-editor/continuous-learner-from-w6-br1.json

learner, from w6-br1, opt-in none; recorded before continuous.ts published games, turns and holds, so games come from the scene.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 34 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 19 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 7 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 1 | **FAIL** |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 4 | **FAIL** |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_6 ×13 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 12 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 8 (8 cut) | **FAIL** |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 2 | **FAIL** |
| `over-map` level lines started over the map | 0 | 6 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 3.21 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 20 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 4 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 9 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 1 of 4 | **FAIL** |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 1 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 1 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 16 said (2 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 13; 9 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 17.6 s (sort w6-br1); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 7 words (median line 7 words; 116 turns) | **FAIL** |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 2 said (2 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 19 said (8 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **letters-60s**: w6-1 @3:50.5 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; world flower @6:21.4 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-2 @6:51.9 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-2 @6:56.2 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-3 @8:46.5 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; world flower @10:58.0 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **letters-echo**: level w6-2 @6:44.4 (one breath): Sorting time! Same sound, different spellings. This sound can be spelt in two ways. /ae/ It's two letters, but it's one sound. /ae/ It's two letters, but it's one sound. Tap the chest wit
- **same-sound-after-reveal**: w6-1 @3:43.7 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-3 @8:39.6 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-6 @16:03.6 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-ec11 @21:12.5 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"
- **world-welcomes**: world_6 "Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!" said 13 times
- **did-it-after-praise**: reward @1:30.7; reward @3:04.7; reward @5:41.7; reward @8:00.0; reward @10:38.8
- **speaker-tip**: w6-1 @4:00.7 cut; w6-1 @4:08.5 cut; w6-3 @8:56.1 cut; w6-3 @9:03.5 cut; w6-6 @16:20.9 cut
- **map-hint-cut**: map @0:04.2 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: stone 3: w6-1 @3:16.3 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; stone 5: w6-3 @8:12.0 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; stone 6: w6-4 @11:44.4 ‹audit_sort_again› "Sorting time! Same sound, different spellings."; stone 8: w6-6 @15:38.4 ‹audit_dojo_back› "Back to the dojo! Let's learn some new sounds."; stone 9: w6-8 @19:24.8 ‹audit_sort_again› "Sorting time! Same sound, different spellings."
- **praise-rate**: 97 praise lines in 30.2 min
- **praise-stacks**: w6-1 @3:57.3: "Brilliant!" → "Keep going, ninja!"; w6-1 @4:01.3: "Keep going, ninja!" → "Super!"; w6-1 @4:05.5: "Super!" → "Fantastic!"; w6-1 @5:37.0: "Ace!" → "Well done! You practised so hard!"; reward @5:41.7: "You did it!" → "You won back some sounds!"
- **line-60s**: ‹listen› "Listen..." from w6-1 @3:21.9; ‹t_two_letters› "It's two letters, but it's one sound." from world flower @5:59.4; ‹story_your_turn› "Your turn to read! Tap a word if you need help." from w6-10 @28:59.1; ‹well_read› "Well read!" from w6-10 @28:59.7
- **cut-explanations**: map @0:04.2 ‹map_hint› "Tap the glowing stone to start your next adventure."; w6-1 @4:00.7 ‹tut_speaker› "Tap the speaker to hear the sound again."; w6-1 @4:08.5 ‹tut_speaker› "Tap the speaker to hear the sound again."; w6-3 @8:56.1 ‹tut_speaker› "Tap the speaker to hear the sound again."; w6-3 @9:03.5 ‹tut_speaker› "Tap the speaker to hear the sound again."; w6-6 @16:20.9 ‹tut_speaker› "Tap the speaker to hear the sound again."
- **master-early**: w6-3 @8:57.7
- **unframed-turn**: sort (w6-br1 0:05.5): no narrated demo, no Ready hold. Opens: "Tap the glowing stone to start your next adventure" · "You know this sound! Now let's look at the differe"
- **over-framed**: ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some" at stone 5: w6-3 @8:12.0, again after stone 3: w6-1 @3:16.3
- **bare-command**: ‹listen› "Listen..." ×15; ‹battle_spell› "Spell..." ×1
- **bare-listen**: w6-1 @3:21.9 after dojo_hello: "Listen…" /ae/ /ae/; w6-1 @3:37.1 after yay_2: "Listen…" /ae/; w6-3 @8:17.6 after dojo_hello: "Listen…" /ee/; w6-3 @8:32.7 after yay_1: "Listen…" /ee/; w6-3 @9:22.7 after audit_listen_slowly: "Listen…" stop; w6-5 @14:44.7 after audit_listen_next: "Listen…" queen
- **talk-before-action**: sort (w6-br1) 17.6 s from ‹audit_bridging_first› "You know this sound! Now let's look at the different ways we spell it." to ‹help_sort› "Tap the chest with the same spelling as the word."
- **turn-median**: turns under 8 words: 69 of 116
- **rhetorical-question**: ‹jump_offer› "Wow! You got everything right. Is this too easy? You can jump ahead!" ×1; ‹story:s6_3› "Why are you so grumpy, Baron? asked Super Ninja. The Baron sniffed. Nobody ever reads ME a story..." ×1
- **shouted-instruction**: ‹dojo_tap_say› "Tap it, and say it with me!" ×8; ‹story_your_turn› "Your turn to read! Tap a word if you need help." ×4; ‹run_read› "Read the word, and catch the matching picture!" ×2; ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up." ×1; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!" ×1; ‹t_everyone_say› "Say that sound with me!" ×1

### C-L (listener, to w2-1): playtest/runs/teacher-voice/run-a/events.json

learner, a brand-new child, opt-in none; recorded before continuous.ts published games, turns and holds, so games come from the scene.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_1 ×17, world_2 ×2 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 14 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 0 (day one) | 1 | **FAIL** |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 4 (4 cut) | **FAIL** |
| `map-hint-cut` map hint cut by the next level | 0 | 17 of 20 | **FAIL** |
| `over-map` level lines started over the map | 0 | 3 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 16 (7 repeats) | **FAIL** |
| `swap-place-heard` swap place lines heard to the end | all | 0 of 6 | **FAIL** |
| `praise-rate` praise lines a minute | ≤ 1.5 | 2.69 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 23 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 19 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 27 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 4 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 21 of 21 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 17 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 57 said (13 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 4 (4 in w2-1); 1 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 23.4 s (soundhunt w1-7); 8 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 6 words (median line 4 words; 293 turns) | **FAIL** |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 35 said (8 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 92 said (36 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 6 | **FAIL** |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | no | **FAIL** |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **world-welcomes**: world_1 "Welcome to Bamboo Village!" said 17 times; world_2 "Welcome to Blossom Hills!" said 2 times
- **did-it-after-praise**: sticker book @13:16.0; reward @15:31.0; reward @18:48.2; reward @21:29.9; reward @23:53.3
- **jump-offers**: reward @31:35.7
- **speaker-tip**: w2-1 @50:36.2 cut; w2-1 @50:40.5 cut; w2-1 @50:48.1 cut; w2-1 @50:52.3 cut
- **map-hint-cut**: map @7:36.1 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @10:20.9 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @12:13.1 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @13:22.2 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @16:55.7 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: stone 7: w1-4 @19:29.1 ‹audit_dojo_first› "This is our dojo. Here we listen to sounds, make words, and read them."; stone 11: w1-8 @28:20.4 ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so"; stone 17: w1-14 @45:18.7 ‹story_start› "Story time! I'll read, and you read too."
- **how-we-spell**: w1-2 /s/: 2×; w1-3 /a/: 2×; w1-3 /t/: 2×; w1-7 /i/: 2×; w1-10 /n/: 2×; w1-10 /p/: 2×
- **swap-place-heard**: w1-8 @28:37.2 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w1-8 @28:52.5 ‹audit_swap_middle› "Yes, the middle sound changes! Now pick the new sound." cut; w1-8 @29:33.0 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut; w1-12 @40:38.5 ‹audit_swap_middle› "Yes, the middle sound changes! Now pick the new sound." cut; w1-12 @40:52.3 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut
- **praise-rate**: 143 praise lines in 53.1 min
- **praise-stacks**: w1-wu1 @3:23.4: "You found them both! They both start with..." → "You can hear the sounds in words. Brilliant listening!"; w1-2 @15:18.9: "Brilliant!" → "Ace!"; w1-2 @15:23.1: "Ace!" → "Fantastic!"; reward @15:31.0: "You did it!" → "You won back some sounds!"; w1-3 @18:35.8: "Well done!" → "Super!"
- **line-60s**: ‹fm_which_pic› "Which picture is it?" from w1-wu5 @10:44.1; ‹first_q› "Which one starts with..." from w1-2 @13:33.5; ‹how_we_spell› "This is how we spell..." from w1-2 @13:54.8; ‹find_q› "Find this sound..." from w1-2 @15:08.7; ‹hunt_q› "Which one has this sound in it?" from w1-7 @25:51.1; ‹swap_make› "Change it to make..." from w1-8 @28:28.1
- **cut-explanations**: map @7:36.1 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @10:20.9 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @12:13.1 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @13:22.2 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @16:55.7 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @19:27.2 ‹map_hint› "Tap the glowing stone to start your next adventure."
- **unframed-turn**: tap (w1-wu1 2:02.6): no frame line (tv_ears_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Ninja ears on! Let's listen to some words." · "This is the sun."; fastslow (w1-wu1 2:14.6): no frame line (tv_ts_meet), no narrated demo, no Ready hold. Opens: "Watch me first!" · "I can say a word fast. Sun!"; notice (w1-wu1 2:38.1): no frame line (tv_notice_frame/tv_ears_on), no hand-over. Opens: "Listen to the very first sound." · "Did you notice? Sun and sock start with the same s"; tapall (w1-wu1 2:54.5): no frame line (tv_pocket_frame), no narrated demo, no Ready hold, no hand-over. Opens: "This is a sausage." · "This is the moon."; rail (w1-wu2 3:55.0): no frame line (tv_rail_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Ninjas read this way!" · "This is a fish."; which (w1-wu2 4:25.9): no frame line (tv_which_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Fish dog!" · "Listen. Cat... dog. Which one did I read?"
- **over-framed**: ‹fm_tap_all_start› "Tap all the pictures that start with..." at w1-wu1 @3:17.5, again after w1-wu1 @2:59.3; ‹fm_l1_hello› "Ninja ears on! Let's listen to some words." at w1-wu3 @5:46.5, again after w1-wu1 @1:54.0; ‹fm_tap_all_in› "Tap all the pictures with this sound in them..." at w1-wu3 @6:54.2, again after w1-wu3 @6:38.0; ‹fm_tap_all_start› "Tap all the pictures that start with..." at w1-wu3 @7:08.3, again after w1-wu1 @3:17.5; ‹fm_l2_way› "Ninjas read this way!" at w1-wu4 @7:38.6, again after w1-wu2 @3:55.0; ‹fm_l2_way› "Ninjas read this way!" at w1-wu4 @9:03.9, again after w1-wu4 @7:38.6
- **bare-command**: ‹ido› "Watch me first!" ×13; ‹find_q› "Find this sound..." ×12; ‹listen_again› "Listen again." ×11; ‹listen› "Listen..." ×6; ‹fm_you_try› "Now you try!" ×3; ‹fm_tap_sock› "Tap the sock!" ×2
- **bare-listen**: w2-1 @49:57.7 after dojo_hello: "Listen…" /b/ /b/; w2-1 @50:06.8 after yay_4: "Listen…" /k/ /k/; w2-1 @50:16.2 after yay_5: "Listen…" /g/ /g/; w2-1 @50:24.9 after yay_9: "Listen…" /h/ /h/
- **talk-before-action**: soundhunt (w1-7) 23.4 s from ‹audit_middle_place› "The middle sound comes after the first sound, and before the last soun" to ‹fm_name_tap› "This is a tap."; sounds (w1-wu5) 21.2 s from ‹fm_l1_hello› "Ninja ears on! Let's listen to some words." to ‹fm_which_pic› "Which picture is it?"; slowpick (w1-wu3) 18.2 s from ‹fm_name_van› "This is a van." to ‹fm_which_pic› "Which picture is it?"; firstsound (w1-2) 16.1 s from ‹first_q› "Which one starts with..." to ‹first_q› "Which one starts with..."; fastslow (w1-wu1) 16.0 s from ‹word:sock› "sock" to ‹fm_tap_tortoise› "Your turn! Tap the tortoise, and say it slowly with me."; firstsound (w1-2) 15.5 s from ‹fm_name_sock› "This is a sock." to ‹first_q› "Which one starts with..."
- **turn-median**: turns under 8 words: 173 of 293
- **rhetorical-question**: ‹what_changed› "What changed? Listen here." ×19; ‹read_who› "Who read it right?" ×6; ‹read_intro› "Who read it right? Listen to Kai and Suki!" ×4; ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time." ×2; ‹fm_notice_sun_sock› "Did you notice? Sun and sock start with the same sound..." ×1; ‹audit_made_of_sounds› "Remember? Words are made of sounds!" ×1
- **shouted-instruction**: ‹say_sounds_read› "Say the sounds... and read the word!" ×21; ‹ido› "Watch me first!" ×13; ‹fm_l2_start› "Start here, on this side!" ×4; ‹read_intro› "Who read it right? Listen to Kai and Suki!" ×4; ‹dojo_tap_say› "Tap it, and say it with me!" ×4; ‹fm_you_try› "Now you try!" ×3
- **demo-command**: w1-wu1 @2:02.6 ‹fm_tap_sun› "Tap the sun!" during ‹fm_show_me› "Let me show you!"; w1-wu1 @2:59.3 ‹fm_tap_all_start› "Tap all the pictures that start with..." during ‹fm_show_me› "Let me show you!"; w1-wu3 @6:14.0 ‹fm_slow_listen› "Listen to my slow word..." during ‹fm_show_me_2› "Watch me first!"; w1-wu3 @6:18.3 ‹fm_which_pic› "Which picture is it?" during ‹fm_show_me_2› "Watch me first!"; w1-wu3 @6:38.0 ‹fm_tap_all_in› "Tap all the pictures with this sound in them..." during ‹fm_show_me› "Let me show you!"; w1-7 @25:51.1 ‹hunt_q› "Which one has this sound in it?" during ‹ido› "Watch me first!"
- **first-dojo-opening**: w2-1 opens: ‹listen› "Listen..." · /b/ · /b/ · ‹audit_spell_it› "And this is how we spell it." · /b/

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 | n/a | n/a |

- 385 tv_ lines in lines.ts, none recorded yet (no durations)


28 metrics failed: world-welcomes, did-it-after-praise, jump-offers, map-hint-cut, over-map, how-we-spell, swap-place-heard, praise-rate, praise-stacks, line-60s, cut-explanations, unframed-turn, over-framed, bare-command, talk-before-action, turn-median, rhetorical-question, shouted-instruction, demo-command, letters-60s, letters-twice, same-sound-after-reveal, master-early, bare-listen, speaker-tip, letters-lines, letters-echo, first-dojo-opening
