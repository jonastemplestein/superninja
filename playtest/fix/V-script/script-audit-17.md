# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/V-script/transcripts-17/continuous-perfect.json (perfect, one continuous page)

706 Sensei lines, 673 sounds and words, 564 utterances in 86 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 16 | What's the first sound? |
| last_sound_q | 14 | What's the last sound? |
| tv_here_sound | 11 | Here's the sound... |
| tv_your_word | 11 | Your word is... |
| first_q | 9 | Which one starts with... |
| tv_next_word | 9 | Here's your next word... |
| tv_petal_say | 8 | Tap the petal, and say it with me. |
| tv_let_me_listen | 8 | Hmm, let me listen. |
| tv_tap_it_say | 8 | Now you tap it, and say the sound. |
| tv_by_yourself | 8 | Now you do one all by yourself. |
| tv_which_write | 8 | Which of these is the way we write... |
| tv_watch_write | 7 | Now watch my ninja write it. |
| tv_how_we_write | 7 | This is how we write... |
| gem_ready | 7 | A gem is glowing! It's ready for a gem battle. |
| tv_so_i_tap | 6 | So I'll tap it. |
| st_first_q2 | 6 | Which picture starts with... |
| tv_to_flower | 6 | Let's take your new sounds to the World Flower. Tap the green arrow. |
| tv_fs_say_slow | 6 | Let's say it the slow way... |
| tv_fs_now_fast | 6 | And now, fast... |
| next_sound_q | 6 | What's the next sound? |
| tv_swap_now_change | 6 | Now let's change it to... |
| st_what_change | 6 | What do we need to change? |
| st_middle_changes | 6 | Yes, the middle sound changes! |
| tv_which_changes | 6 | Which sound changes? |
| tv_and_how_we_write | 5 | And this is how we write... |
| tv_together | 5 | Let's do this one together. |
| yay_4 | 5 | Well done. |
| tv_our_word | 5 | Here's our word... |
| tv_by_yourself_build | 5 | Now you build one all by yourself. |
| st_first_changes | 5 | Yes, the first sound changes! |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (22)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w1-2 @814.5s and @819.8s |
| first_sound_q | 4 | What's the first sound? | level w1-7 @1463.5s and @1477.2s |
| last_sound_q | 4 | What's the last sound? | level w1-7 @1482.7s and @1493.0s |
| tv_which_changes | 2 | Which sound changes? | level w1-12 @2202.6s and @2212.5s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @134.6s and @142.6s |
| fs_ant | 1 | Ant starts with... | level w1-3 @927.8s and @937.9s |
| next_sound_q | 1 | What's the next sound? | level w1-11 @2076.2s and @2090.6s |
| swap_which | 1 | Which sound needs to change? | level w1-12 @2222.2s and @2232.1s |
| tv_swap_now_change | 1 | Now let's change it to... | level w1-12 @2240.4s and @2250.0s |
| st_what_change | 1 | What do we need to change? | level w1-12 @2261.4s and @2269.4s |
| tv_watch_write | 1 | Now watch my ninja write it. | level w2-1 @2709.7s and @2724.1s |
| tv_here_sound | 1 | Here's the sound... | world flower @2887.2s and @2893.3s |

### Spliced utterances: 152 of 564 (27%); chains of 5+ clips: 95

Commonest spliced shapes:

- ×4 ‹tv_your_word› + W
- ×3 ‹tv_next_word› + W
- ×2 ‹fs_sand› + /X/
- ×2 ‹st_first_q2› + /X/
- ×2 ‹tv_which_write› + /X/
- ×2 ‹fs_tin› + /X/
- ×2 ‹tv_mix_up› + ‹first_q› + /X/
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 /X/ + ‹tv_praise_write› + ‹tv_which_write› + /X/
- ×2 ‹tv_our_word› + W + ‹first_sound_q›
- ×2 ‹suki_says› + W + ‹kai_says› + W + ‹read_who›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 ‹tv_fs_say_slow› + /X/ + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×1 ‹tv_ts_meet› + ‹tv_ts_fast› + W + ‹tv_ts_slow› + W + ‹tv_ready_paw›
- ×1 ‹fm_notice_sun_sock› + /X/ + ‹tv_petal_first›

Longest chains:

- level w1-8 @1626.3s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-12 @2181.8s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "pit" Listen to them both... "sit" (slowly) "pit" (slowly) What do we need to change?
- level w1-5 @1242.0s (9 clips): Let's say it the slow way... /s/ /a/ /t/ And now, fast... "sat" Here's your next word... "mat" What's the first sound?
- level w1-10 @1859.7s (9 clips): /p/ I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it.
- level w1-7 @1484.6s (8 clips): /t/ /s/ /i/ /t/ "sit" Here's your next word... "it" What's the first sound?
- level w1-12 @2163.1s (8 clips): "sat" If you'd like to see me do one first, tap my paw. Now let's change it to... "sit" Listen to them both... "sat" (slowly) "sit" (slowly) What do we need to change?
- level w1-2 @688.0s (7 clips): I'll go first. Here's a map and a hat. Hmm, let me listen. "map" (held) Map starts with... /m/ So I'll tap it. Let's do the next one together. Are you ready?
- level w1-2 @710.6s (7 clips): Milk starts with... /m/ Now watch my ninja write it. This is how we write... /m/ Now you tap it, and say the sound. /m/

### Praise: 22 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 49

- intro film @9.0s: "When you're ready to see what happens next, tap the green arrow." cut after 1.4 of 3.8 s by Every petal was a sound. With sounds, we could tal
- choose @64.8s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.4 of 3.6 s by Great choice!
- opt-in @97.4s: "Now come with me to the dojo. Tap the green arrow." cut after 2.0 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- level (first minutes) @191.7s: "Do you want to have a go now? Tap the green arrow. Or tap my paw to se" cut after 5.7 of 6.1 s by Now you tap the tortoise, and say it slowly with m
- level (first minutes) @339.4s: "Tap each picture, starting on this side." cut after 2.4 of 2.7 s by "fish"
- level (first minutes) @356.1s: "When you're ready for the next game, tap the green arrow." cut after 2.4 of 3.3 s by Here are two rows of pictures. I'll read one, and 
- level w1-2 @685.2s: "Tap the petal, and say it with me." cut after 1.6 of 2.5 s by /m/
- level w1-2 @718.0s: "Now you tap it, and say the sound." cut after 1.5 of 2.5 s by /m/
- level w1-2 @740.1s: "Tap its petal, and say it." cut after 1.7 of 2.4 s by /s/
- level w1-2 @770.6s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /s/
- level w1-3 @918.7s: "Tap its petal, and say it." cut after 1.5 of 2.4 s by /a/
- level w1-3 @944.1s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /a/
- level w1-3 @961.3s: "Tap the petal, and say it with me." cut after 1.4 of 2.5 s by /t/
- level w1-3 @986.3s: "Now you tap it, and say the sound." cut after 1.9 of 2.5 s by /t/
- level w1-4 @1080.6s: "This card is my word. Tap it, and hear the word." cut after 1.8 of 3.6 s by "am"
- level w1-4 @1162.7s: "First, you read it. Tap each sound, and say it with me." cut after 0.4 of 4.3 s by /a/
- level w1-6 @1308.0s: "I'll zap the first one. Tap my word card, and hear the word." cut after 2.0 of 4.0 s by "at"
- level w1-7 @1408.5s: "Tap the petal, and say it with me." cut after 1.9 of 2.5 s by /i/
- level w1-7 @1438.2s: "Now you tap it, and say the sound." cut after 1.6 of 2.5 s by /i/
- level w1-8 @1620.0s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1636.9s: "What do we need to change?" cut after 1.0 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1649.2s: "Which sound changes?" cut after 1.4 of 1.9 s by Yes, the first sound changes!
- level w1-8 @1665.5s: "Which sound changes?" cut after 1.5 of 1.9 s by Yes, the last sound changes!
- level w1-8 @1674.6s: "Which sound needs to change?" cut after 1.4 of 1.8 s by Yes, the first sound changes!
- level w1-10 @1807.5s: "Tap the petal, and say it with me." cut after 1.4 of 2.5 s by /n/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| audit_left_right "We start here, and go this way." | 1 | level w2-1 |

## playtest/fix/V-script/transcripts-17/continuous-learner.json (learner, one continuous page)

817 Sensei lines, 775 sounds and words, 669 utterances in 86 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 23 | What's the first sound? |
| last_sound_q | 21 | What's the last sound? |
| tv_fs_stuck_slow | 12 | Let's say it the slow way first... |
| next_sound_q | 12 | What's the next sound? |
| tv_here_sound | 11 | Here's the sound... |
| tv_your_word | 11 | Your word is... |
| say_sounds_read | 11 | Say the sounds, and read the word. |
| tv_next_word | 10 | Here's your next word... |
| first_q | 9 | Which one starts with... |
| tv_swap_now_change | 9 | Now let's change it to... |
| tv_swap_both | 9 | Listen to them both... |
| st_what_change | 9 | What do we need to change? |
| tv_swap_pick | 9 | Now tap the new one. |
| tv_petal_say | 8 | Tap the petal, and say it with me. |
| tv_let_me_listen | 8 | Hmm, let me listen. |
| tv_tap_it_say | 8 | Now you tap it, and say the sound. |
| tv_by_yourself | 8 | Now you do one all by yourself. |
| tv_which_write | 8 | Which of these is the way we write... |
| tv_which_changes | 8 | Which sound changes? |
| tv_watch_write | 7 | Now watch my ninja write it. |
| tv_how_we_write | 7 | This is how we write... |
| tv_listen_here | 7 | Let's listen again. What can you hear here? |
| tv_so_i_tap | 6 | So I'll tap it. |
| st_first_q2 | 6 | Which picture starts with... |
| tv_to_flower | 6 | Let's take your new sounds to the World Flower. Tap the green arrow. |
| kai_says | 6 | Kai says... |
| suki_says | 6 | Suki says... |
| st_middle_changes | 6 | Yes, the middle sound changes! |
| st_first_changes | 6 | Yes, the first sound changes! |
| tv_and_how_we_write | 5 | And this is how we write... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (15)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w1-2 @944.1s and @949.4s |
| first_sound_q | 3 | What's the first sound? | level w1-7 @1686.7s and @1700.6s |
| tv_which_changes | 3 | Which sound changes? | level w1-8 @1894.3s and @1904.7s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @153.2s and @162.6s |
| fs_ant | 1 | Ant starts with... | level w1-3 @1072.1s and @1082.3s |
| last_sound_q | 1 | What's the last sound? | level w1-10 @2231.7s and @2246.5s |
| swap_which | 1 | Which sound needs to change? | level w1-12 @2672.0s and @2682.1s |
| tv_here_sound | 1 | Here's the sound... | world flower @3594.4s and @3601.9s |

### Spliced utterances: 178 of 669 (27%); chains of 5+ clips: 88

Commonest spliced shapes:

- ×4 ‹tv_fs_stuck_slow› + W + /X/
- ×3 ‹tv_next_word› + W
- ×3 /X/ + /X/ + /X/ + W + ‹tv_praise_swap› + W + ‹tv_which_changes› + ‹thats›
- ×2 ‹st_first_q2› + /X/
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 /X/ + ‹tv_praise_write› + ‹tv_which_write› + /X/
- ×2 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×2 /X/ + /X/ + ‹tv_fs_now_fast›
- ×2 ‹suki_says› + W + ‹kai_says› + W + ‹read_who›
- ×2 ‹streak_lost› + ‹tv_fs_stuck_slow› + W + /X/
- ×2 /X/ + ‹tv_our_word›
- ×2 ‹kai_says› + W + ‹suki_says› + W + ‹read_who›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 /X/ + ‹stays_same› + ‹tv_both_again› + W + W + ‹tv_which_changes›
- ×1 ‹tv_ts_meet› + ‹tv_ts_fast› + W + ‹tv_ts_slow› + W + ‹tv_ready_paw›

Longest chains:

- level w1-12 @2706.6s (11 clips): /p/ /a/ /n/ "pan" Ninja power! Now let's change it to... "pat" Listen to them both... "pan" (slowly) "pat" (slowly) What do we need to change?
- level w1-8 @1871.2s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-12 @2687.9s (10 clips): /t/ /a/ /n/ "tan" Now let's change it to... "pan" Listen to them both... "tan" (slowly) "pan" (slowly) What do we need to change?
- level w1-12 @2759.9s (10 clips): /m/ /a/ /n/ "man" Ninja power! Now let's change it to... "map" "man" (slowly) "map" (slowly) What do we need to change?
- level w1-8 @1931.3s (9 clips): /a/ /t/ "at" Ninja power! Now let's change it to... "it" "at" (slowly) "it" (slowly) What do we need to change?
- level w2-1 @3455.3s (9 clips): We start here, and go this way. Say the sounds, and read the word. /h/ /a/ /t/ "hat" Here's your next word... "bib" What's the first sound?
- level w2-1 @3477.7s (9 clips): Say the sounds, and read the word. /b/ /i/ /b/ "bib" Well done. Your word is... "cat" What's the first sound?
- level w2-1 @3520.5s (9 clips): Say the sounds, and read the word. /s/ /i/ /t/ "sit" That was a tricky one, and you kept going. Your word is... "hop" What's the first sound?

### Praise: 25 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 22

- choose @78.1s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 1.0 of 3.6 s by Great choice!
- dojo welcome @125.8s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 4.2 of 4.5 s by Bong! That's your first star.
- level w1-4 @1341.9s: "First, you read it. Tap each sound, and say it with me." cut after 0.1 of 4.3 s by /a/
- level w1-6 @1504.7s: "I'll zap the first one. Tap my word card, and hear the word." cut after 3.2 of 4.0 s by "at"
- level w1-8 @1865.2s: "What do we need to change?" cut after 1.1 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1881.9s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1904.7s: "Which sound changes?" cut after 0.9 of 1.9 s by Yes, the first sound changes!
- level w1-8 @1923.1s: "Which sound needs to change?" cut after 1.2 of 1.8 s by Yes, the last sound changes!
- level w1-8 @1939.6s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the first sound changes!
- level w1-10 @2113.5s: "/n/" cut after 0.6 of 0.9 s by Nest starts with...
- level w1-11 @2508.7s: "Tap each sound, and say it." cut after 0.4 of 2.0 s by /p/
- level w1-11 @2525.5s: "Tap each sound, and say it." cut after 0.3 of 2.0 s by /m/
- level w1-12 @2614.8s: "What do we need to change?" cut after 1.0 of 1.8 s by Yes, the middle sound changes!
- level w1-12 @2634.0s: "What do we need to change?" cut after 1.4 of 1.8 s by Yes, the first sound changes!
- level w1-12 @2682.1s: "Which sound needs to change?" cut after 0.7 of 1.8 s by Yes, the middle sound changes!
- level w1-12 @2718.4s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the last sound changes!
- level w1-12 @2740.0s: "Which sound changes?" cut after 0.6 of 1.9 s by Yes, the first sound changes!
- level w1-12 @2752.3s: "Which sound needs to change?" cut after 0.7 of 1.8 s by Yes, the last sound changes!
- level w1-12 @2815.5s: "Which sound changes?" cut after 0.4 of 1.9 s by Yes, the middle sound changes!
- level w1-14 @2991.2s: "Your turn to read." cut after 0.8 of 1.2 s by story:s1_4
- level w1-14 @2996.9s: "Now you choose what happens. Read the two words, and tap one." cut after 3.2 of 4.3 s by Let's say it the slow way...
- level w2-1 @3354.7s: "Tap it once more, and say it again." cut after 0.6 of 2.5 s by /b/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| audit_left_right "We start here, and go this way." | 1 | level w2-1 |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C-P: playtest/fix/V-script/transcripts-17/continuous-perfect.json

perfect, a brand-new child, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_2 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 0 (day one) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 8 (0 repeats) | pass |
| `swap-place-heard` swap place lines heard to the end | all | 15 of 15 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.93 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 1 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 21 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 12.4 s (compound w1-wu2); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 5 words; 211 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | yes | pass |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 20 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 13 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 8 of 8 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 96 of 96, rabbit 71 of 71 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 8 of 8 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.7 s (run w1-9); 0 over | pass |

- **praise-stacks**: w2-1 @46:11.0: "That's it!" → "You know how we write that sound."
- **line-60s**: ‹tv_your_word› "Your word is..." from w2-1 @46:21.0; ‹tv_here_sound› "Here's the sound..." from world flower @47:49.9
- **talk-before-action**: compound (w1-wu2) 12.4 s from ‹tv_squish_frame› "Here's a new game, called Word Squish." to ‹tv_squish_ready› "Two little words make one big word. Now you make one. Are you ready?"

### C-L: playtest/fix/V-script/transcripts-17/continuous-learner.json

learner, a brand-new child, opt-in none.

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
| `swap-place-heard` swap place lines heard to the end | all | 16 of 16 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.00 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 1 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 2 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 21 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 13.3 s (compound w1-wu2); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 14 words (median line 5 words; 263 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | yes | pass |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 20 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 13 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 7 of 8 (88%) | **FAIL** |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 121 of 121, rabbit 76 of 76 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 8 of 8 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.8 s (run w1-9); 0 over | pass |

- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @59:34.4
- **talk-before-action**: compound (w1-wu2) 13.3 s from ‹fm_pair_cat_dog› "Cat dog!" to ‹tv_squish_ready› "Two little words make one big word. Now you make one. Are you ready?"
- **fs-readback**: dots (w1-wu6 @12:58.3): no fast lead before [mug]. Heard: /m/ /u/ /g/ · [mug]; (not judged) fastslow (w1-wu1 3:28.3, land 1): no read-back heard; (not judged) slowpick (w1-wu3 9:38.5, land 1): no read-back heard; (not judged) soundhunt (w1-7 26:56.6, land 1): no read-back heard

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

