## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### J-P: playtest/runs/voice/journey/journey-perfect.json

perfect, a brand-new child, opt-in none; recorded before continuous.ts published games, turns and holds, so games come from the scene.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes | (continuous runs) | n/a | n/a |
| `did-it-after-praise` "You did it!" after praise | (continuous runs) | n/a | n/a |
| `jump-offers` jump offers | (continuous runs) | n/a | n/a |
| `speaker-tip` "Tap the speaker…" | (continuous runs) | n/a | n/a |
| `map-hint-cut` map hint cut | (continuous runs) | n/a | n/a |
| `over-map` level lines over the map | (continuous runs) | n/a | n/a |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 6.08 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 10 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 6 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 1 of 1 | **FAIL** |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 3 of 3 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 0 | n/a |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 11 said (7 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 4 (4 in w2-1); 1 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 8.8 s (learn w2-1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 7 words (median line 4 words; 24 turns) | **FAIL** |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 13 said (10 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 2 | **FAIL** |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | no | **FAIL** |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **praise-rate**: 21 praise lines in 3.5 min
- **praise-stacks**: w1-wu1 @1:04.2: "You found them both! They both start with..." → "You can hear the sounds in words. Brilliant listening!"; w2-1 @3:53.3: "Well done." → "Smashing!"; w2-1 @3:55.9: "Smashing!" → "Super!"; w2-1 @3:58.4: "Super!" → "Smashing!"; w2-1 @3:59.7: "Smashing!" → "Well done."
- **line-60s**: ‹listen› "Listen..." from w2-1 @3:17.1; ‹audit_spell_it› "And this is how we spell it." from w2-1 @3:20.3; ‹dojo_tap_say› "Tap it, and say it with me!" from w2-1 @3:22.7; ‹yay_9› "Smashing!" from w2-1 @3:34.0; ‹yay_4› "Well done." from w2-1 @3:53.3; ‹dojo_find› "Can you find..." from w2-1 @3:54.6
- **master-early**: w2-1 @4:36.8
- **unframed-turn**: learn (w2-1 3:11.8): no frame line (tv_learn_frame_*/tv_learn_how/tv_dj_room/tv_learn_frame_ways), no Ready hold, no hand-over. Opens: "This is the dojo. A dojo is where ninjas practise!" · "Listen..."; find (w2-1 3:55.5): no frame line (tv_ne_frame), no hand-over. Opens: "Well done." · "Can you find..."; build (w2-1 4:03.1): no frame line (tv_build_frame/tv_build_lines), no narrated demo, no Ready hold, no hand-over. Opens: "Can you find..." · "Well done."
- **bare-command**: ‹listen› "Listen..." ×5; ‹fm_tap_sun› "Tap the sun!" ×1; ‹fm_you_try› "Now you try!" ×1; ‹fm_tap_sock› "Tap the sock!" ×1; ‹fm_show_me_2› "Watch me first!" ×1; ‹fm_you_try_2› "Your turn!" ×1
- **bare-listen**: w2-1 @3:17.1 after dojo_hello: "Listen…" /b/ /b/; w2-1 @3:26.3 after yay_1: "Listen…" /k/ /k/; w2-1 @3:34.9 after yay_9: "Listen…" /g/ /g/; w2-1 @3:44.1 after yay_5: "Listen…" /h/ /h/
- **turn-median**: turns under 8 words: 13 of 24
- **shouted-instruction**: ‹dojo_tap_say› "Tap it, and say it with me!" ×4; ‹fm_tap_sun› "Tap the sun!" ×1; ‹fm_you_try› "Now you try!" ×1; ‹fm_tap_sock› "Tap the sock!" ×1; ‹fm_show_me_2› "Watch me first!" ×1; ‹t_everyone_say› "Say that sound with me!" ×1
- **demo-command**: w1-wu1 @0:09.8 ‹fm_tap_sun› "Tap the sun!" during ‹fm_show_me› "Let me show you!"; w1-wu1 @0:53.3 ‹fm_tap_all_start› "Tap all the pictures that start with..." during ‹fm_show_me› "Let me show you!"
- **first-dojo-opening**: w2-1 opens: ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some sounds." · ‹listen› "Listen..." · /b/ · /b/ · ‹audit_spell_it› "And this is how we spell it."

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 | n/a | n/a |

- 385 tv_ lines in lines.ts, none recorded yet (no durations)


11 metrics failed: praise-rate, praise-stacks, line-60s, master-early, unframed-turn, bare-command, bare-listen, turn-median, shouted-instruction, demo-command, first-dojo-opening
