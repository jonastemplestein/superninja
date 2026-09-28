# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/D1/verify2/transcripts/continuous-watcher.json (watcher, one continuous page)

715 Sensei lines, 738 sounds and words, 592 utterances in 94 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 15 | What's the first sound? |
| last_sound_q | 13 | What's the last sound? |
| tv_show_again | 12 | Of course. Watch my paw again. |
| tv_ready_now | 12 | Are you ready to have a go now? |
| tv_let_me_listen | 10 | Hmm, let me listen. |
| tv_your_word | 10 | Your word is... |
| tv_here_sound | 9 | Here's the sound... |
| first_q | 9 | Which one starts with... |
| tv_petal_say | 8 | Tap the petal, and say it with me. |
| tv_tap_it_say | 8 | Now you tap it, and say the sound. |
| tv_which_write | 8 | Which of these is the way we write... |
| tv_next_word | 8 | Here's your next word... |
| tv_so_i_tap | 7 | So I'll tap it. |
| tv_watch_write | 7 | Now watch my ninja write it. |
| tv_by_yourself | 7 | Now you do one all by yourself. |
| tv_how_we_write | 6 | This is how we write... |
| tv_fs_say_slow | 6 | Let's say it the slow way... |
| tv_fs_now_fast | 6 | And now, fast... |
| next_sound_q | 6 | What's the next sound? |
| tv_pocket_ido | 5 | I'll find one first. |
| st_first_q2 | 5 | Which picture starts with... |
| tv_and_how_we_write | 5 | And this is how we write... |
| tv_together | 5 | Let's do this one together. |
| tv_our_word | 5 | Here's our word... |
| tv_by_yourself_build | 5 | Now you build one all by yourself. |
| tv_swap_now_change | 5 | Now let's change it to... |
| fm_tap_rabbit | 4 | Now tap the rabbit, and say it fast. |
| fs_sun | 4 | Sun starts with... |
| tv_so_pocket | 4 | So into the pocket it goes! |
| tv_petal_say_short | 4 | Tap its petal, and say it. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (26)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w1-2 @892.7s and @899.6s |
| first_sound_q | 3 | What's the first sound? | level w1-7 @1575.6s and @1588.9s |
| last_sound_q | 3 | What's the last sound? | level w1-7 @1579.5s and @1594.0s |
| tv_pocket_ido | 2 | I'll find one first. | level (first minutes) @261.2s and @274.5s |
| tv_so_pocket | 2 | So into the pocket it goes! | level (first minutes) @265.2s and @278.5s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @118.6s and @127.3s |
| fs_sun | 1 | Sun starts with... | level (first minutes) @262.6s and @275.8s |
| tv_rail_ido | 1 | I'll read them first. Then you read them. | level (first minutes) @341.5s and @356.1s |
| fm_read_fish_dog | 1 | Fish... dog. Fish dog! | level (first minutes) @344.1s and @358.6s |
| tv_slow_demo | 1 | Here's my slow word... | level w1-wu3 @513.4s and @525.9s |
| tv_i_hear_mug | 1 | I can hear mug! | level w1-wu3 @516.9s and @529.2s |
| tv_hear_middle | 1 | I can hear it in the middle. | level w1-wu3 @576.0s and @589.7s |
| fs_ant | 1 | Ant starts with... | level w1-3 @997.7s and @1009.7s |
| next_sound_q | 1 | What's the next sound? | level w1-11 @2192.4s and @2205.9s |
| tv_petal_say_short | 1 | Tap its petal, and say it. | level w2-1 @2762.9s and @2776.4s |
| tv_and_how_we_write | 1 | And this is how we write... | level w2-1 @2767.0s and @2779.8s |
| tv_tap_it_say_short | 1 | Now you tap it, and say it. | level w2-1 @2769.4s and @2782.2s |

### Spliced utterances: 157 of 592 (27%); chains of 5+ clips: 89

Commonest spliced shapes:

- ×5 ‹tv_your_word› + W
- ×4 ‹tv_next_word› + W
- ×3 ‹tv_which_write› + /X/
- ×3 ‹tv_our_word› + W + ‹first_sound_q›
- ×2 ‹fs_sun› + /X/
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 ‹suki_says› + W + ‹kai_says› + W + ‹read_who›
- ×2 /X/ + ‹tv_swap_in›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 ‹tv_fs_say_slow› + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×2 ‹tv_battle_again› + ‹tv_your_word› + W
- ×1 W + ‹tv_ts_meet› + ‹tv_ts_fast› + W + ‹tv_ts_slow›
- ×1 ‹tv_show_again› + ‹tv_ts_fast› + W + ‹tv_ts_slow› + W + ‹tv_ready_now›
- ×1 ‹fm_notice_sun_sock› + /X/
- ×1 ‹tv_pocket_frame› + ‹tv_pocket_ido› + ‹fs_sun› + /X/ + ‹tv_so_pocket› + ‹tv_pocket_ready_two›

Longest chains:

- level w1-10 @1976.5s (13 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it. Let's do this one together. This is a peg. This is a fox. Which picture starts with... /p/
- level w1-10 @1926.6s (11 clips): I'll go first. Here's a nut and a hat. Hmm, let me listen. "nut" Nut starts with... /n/ So I'll tap it. Let's do this one together. This is a cup. This is a net. Which one starts with... /n/
- level w1-3 @990.8s (10 clips): I'll go first. Here's a cat and an ant. Hmm, let me listen. "ant" Ant starts with... /a/ So I'll tap it. Let's do this one together. This is a hat. Which one starts with... /a/
- level w1-8 @1753.4s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-11 @2129.8s (10 clips): I'll go first. Here's a map and a mop. Hmm, let me listen. "mop" (slowly) Mop has this sound in the middle... /o/ Let's do this one together. This is a tap. This is a top. Which one has this sound in the middle... /o/
- level w1-12 @2294.7s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "pit" Listen to them both... "sit" (slowly) "pit" (slowly) What do we need to change?
- level w1-3 @1026.9s (8 clips): I'll go first. Here's some jam and a tent. Hmm, let me listen. "tent" Tent starts with... /t/ So I'll tap it. Let's do this one together. This is a tin.
- level w1-4 @1246.6s (8 clips): /t/ /a/ /t/ "at" Look, it's Kai and Suki. They're learning to read, like you. They'll both read this word. Only one of them reads it right. First, you read it. Tap each sound, and say it with me. /a/

### Praise: 22 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 43

- intro film @28.3s: "When you're ready to see what happens next, tap the green arrow." cut after 0.7 of 3.8 s by Oh no! The petals blew away, all over the island!
- choose @51.6s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 1.4 of 3.6 s by Great choice!
- opt-in @86.8s: "Now come with me to the dojo. Tap the green arrow." cut after 1.8 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @97.0s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 2.3 of 4.5 s by Bong! That's your first star.
- level (first minutes) @177.1s: "Do you want to have a go now? Tap the green arrow. Or tap my paw to se" cut after 5.3 of 6.1 s by Of course. Watch my paw again.
- level (first minutes) @381.4s: "Tap the green arrow, and let's begin." cut after 2.0 of 2.5 s by I tap the tortoise, and say them slowly. Sun... fl
- level w1-2 @815.0s: "Tap its petal, and say it." cut after 1.6 of 2.4 s by /s/
- level w1-2 @846.7s: "Now you tap it, and say the sound." cut after 1.9 of 2.5 s by /s/
- level w1-3 @988.4s: "Tap its petal, and say it." cut after 1.5 of 2.4 s by /a/
- level w1-3 @1051.5s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /t/
- level w1-4 @1147.9s: "This card is my word. Tap it, and hear the word." cut after 1.9 of 3.6 s by "am"
- level w1-4 @1257.3s: "First, you read it. Tap each sound, and say it with me." cut after 0.4 of 4.3 s by /a/
- level w1-6 @1404.0s: "I'll zap the first one. Tap my word card, and hear the word." cut after 1.9 of 4.0 s by "at"
- level w1-6 @1412.6s: "Can you find the last one?" cut after 1.5 of 1.8 s by /t/
- level w1-6 @1417.8s: "That's how we spell a word. Now you spell one. Are you ready to zap it" cut after 4.5 of 5.1 s by Of course. Watch my paw again.
- level w1-7 @1504.0s: "Tap the petal, and say it with me." cut after 1.6 of 2.5 s by /i/
- level w1-7 @1552.4s: "Now you tap it, and say the sound." cut after 1.8 of 2.5 s by /i/
- level w1-8 @1746.5s: "What do we need to change?" cut after 1.5 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1764.1s: "What do we need to change?" cut after 0.5 of 1.8 s by Yes, the middle sound changes!
- level w1-10 @1945.7s: "/n/" cut after 0.5 of 0.9 s by Net starts with...
- level w1-10 @1953.9s: "Now you tap it, and say the sound." cut after 2.0 of 2.5 s by /n/
- level w1-10 @1965.3s: "/n/" cut after 0.5 of 0.9 s by Nest starts with...
- level w1-10 @1974.3s: "Tap the petal, and say it with me." cut after 1.5 of 2.5 s by /p/
- level w1-10 @1999.0s: "Now you tap it, and say the sound." cut after 1.5 of 2.5 s by /p/
- level w1-10 @2019.5s: "/n/" cut after 0.4 of 0.9 s by Net starts with...

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 3 | reward ×3 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| audit_left_right "We start here, and go this way." | 1 | level w2-3 |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C-W: playtest/fix/D1/verify2/transcripts/continuous-watcher.json

watcher, a brand-new child, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_2 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 0 (day one) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 3 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 8 (0 repeats) | pass |
| `swap-place-heard` swap place lines heard to the end | all | 5 of 5 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.84 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `ask-cycle` one question, in any of its rotated variants, on more than 3 items running with no miss | 0 | 0 | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 20 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 12.2 s (slowpick w1-wu3); 1 over | **FAIL** |
| `talk-reward` talk before a child action in the rewards, World Flower trips and on the map (a level's closing talk into them included) | ≤ 12 s | max 22.0 s (level:w1-7 → reward:w1-7); 10 over | **FAIL** |
| `talk-longest` the longest run of talk before a child action anywhere in the session (levels, rewards, trips, the map, the welcome) | ≤ 12 s | max 22.0 s (level:w1-7 → reward:w1-7); 20 over (level→reward 10, level 9, training 1) | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 6 words; 220 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | yes | pass |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 32 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | 12 of 12 | pass |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 1 of 13 games | **FAIL** |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 10 of 10 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 100 of 100, rabbit 78 of 78; the paw's 12 replays not judged | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 8 of 8 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line (into the reward included) | ≤ 12 s | max 22.0 s (readcheck w1-7 into reward:w1-7); 2 over | **FAIL** |

- **talk-before-action**: slowpick (w1-wu3) 12.2 s from ‹word:mug› "mug" to ‹tv_ready_go› "Do you want to have a go now?"
- **talk-reward**: level:w1-7 → reward:w1-7 22.0 s from ‹tv_yes_kai› "Yes! Kai read it right." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@26:53.6); level:w2-1 → reward:w2-1 16.5 s from ‹sound:k› "/k/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@47:57.3); level:w1-4 → reward:w1-4 15.7 s from ‹tv_yes_suki› "Yes! Suki read it right." to ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words" (@21:11.2); level:w1-wu1 → reward:w1-wu1 14.7 s from ‹onset:sausage› "sausage" to ‹tv_rw_book› "This is your Sticker Book! Tap it to open it." (@4:52.5); level:w1-2 → reward:w1-2 14.5 s from ‹sound:s› "/s/" to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@15:03.9); level:w1-11 → reward:w1-11 13.1 s from ‹tv_yes_kai› "Yes! Kai read it right." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@37:07.0)
- **talk-longest**: level:w1-7 → reward:w1-7 22.0 s from ‹tv_yes_kai› "Yes! Kai read it right." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@26:53.6); level:w1-3 17.0 s from ‹tv_ido_pair_jam_tent› "I'll go first. Here's some jam and a tent." to ‹first_q› "Which one starts with..." (@17:06.9); level:w1-10 16.6 s from ‹tv_ido_pair_nut_hat› "I'll go first. Here's a nut and a hat." to ‹first_q› "Which one starts with..." (@32:06.6); level:w2-1 → reward:w2-1 16.5 s from ‹sound:k› "/k/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@47:57.3); level:w1-10 15.8 s from ‹tv_pocket_ido› "I'll find one first." to ‹st_first_q2› "Which picture starts with..." (@32:56.5); level:w1-4 → reward:w1-4 15.7 s from ‹tv_yes_suki› "Yes! Suki read it right." to ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words" (@21:11.2)
- **fs-per-session**: soundhunt (w1-7 24:58.0, land 1): no idea line, rabbit prompt or slow-then-fast pair. It said: ‹tv_hunt_frame› ‹tv_here_sound› ‹tv_petal_say› ‹tv_ido_pair_pan_pin›
- **fs-talk**: readcheck (w1-7 into reward:w1-7) 22.0 s from ‹tv_yes_kai› "Yes! Kai read it right." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."; readcheck (w1-4 into reward:w1-4) 15.7 s from ‹tv_yes_suki› "Yes! Suki read it right." to ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words", with ‹tv_fs_say_slow› "Let's say it the slow way..."

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

