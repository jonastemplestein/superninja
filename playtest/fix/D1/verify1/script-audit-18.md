# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/D1/verify1/transcripts-18/continuous-perfect.json (perfect, one continuous page)

697 Sensei lines, 699 sounds and words, 554 utterances in 90 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 16 | What's the first sound? |
| last_sound_q | 14 | What's the last sound? |
| tv_here_sound | 11 | Here's the sound... |
| tv_your_word | 10 | Your word is... |
| tv_petal_say | 9 | Tap the petal, and say it with me. |
| first_q | 9 | Which one starts with... |
| tv_watch_write | 9 | Now watch my ninja write it. |
| tv_next_word | 9 | Here's your next word... |
| tv_let_me_listen | 8 | Hmm, let me listen. |
| tv_tap_it_say | 8 | Now you tap it, and say the sound. |
| tv_which_write | 8 | Which of these is the way we write... |
| tv_how_we_write | 7 | This is how we write... |
| tv_by_yourself | 7 | Now you do one all by yourself. |
| tv_so_i_tap | 6 | So I'll tap it. |
| tv_fs_say_slow | 6 | Let's say it the slow way... |
| tv_fs_now_fast | 6 | And now, fast... |
| next_sound_q | 6 | What's the next sound? |
| gem_ready | 6 | A gem is glowing! It's ready for a gem battle. |
| tv_swap_now_change | 6 | Now let's change it to... |
| st_what_change | 6 | What do we need to change? |
| st_middle_changes | 6 | Yes, the middle sound changes! |
| tv_which_changes | 6 | Which sound changes? |
| st_first_q2 | 5 | Which picture starts with... |
| tv_and_how_we_write | 5 | And this is how we write... |
| tv_together | 5 | Let's do this one together. |
| tv_our_word | 5 | Here's our word... |
| tv_by_yourself_build | 5 | Now you build one all by yourself. |
| st_first_changes | 5 | Yes, the first sound changes! |
| fm_tap_rabbit | 4 | Now tap the rabbit, and say it fast. |
| tv_petal_say_short | 4 | Tap its petal, and say it. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (21)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w1-2 @790.9s and @797.2s |
| first_sound_q | 4 | What's the first sound? | level w1-7 @1432.4s and @1445.6s |
| last_sound_q | 2 | What's the last sound? | level w1-7 @1452.5s and @1463.5s |
| tv_which_changes | 2 | Which sound changes? | level w1-12 @2171.5s and @2181.4s |
| tv_watch_write | 2 | Now watch my ninja write it. | level w2-1 @2701.4s and @2715.5s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @111.8s and @119.8s |
| fs_ant | 1 | Ant starts with... | level w1-3 @901.4s and @911.4s |
| next_sound_q | 1 | What's the next sound? | level w1-11 @2045.1s and @2059.0s |
| swap_which | 1 | Which sound needs to change? | level w1-12 @2190.8s and @2201.0s |
| tv_swap_now_change | 1 | Now let's change it to... | level w1-12 @2210.2s and @2220.7s |
| st_what_change | 1 | What do we need to change? | level w1-12 @2231.8s and @2240.3s |
| tv_here_sound | 1 | Here's the sound... | world flower @2883.8s and @2892.7s |

### Spliced utterances: 145 of 554 (26%); chains of 5+ clips: 88

Commonest spliced shapes:

- ×4 ‹tv_your_word› + W
- ×3 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×3 ‹tv_next_word› + W
- ×2 ‹fs_sit› + /X/
- ×2 ‹tv_next_sound› + /X/ + ‹tv_petal_say› + /X/
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 /X/ + ‹tv_praise_write› + ‹tv_which_write› + /X/
- ×2 ‹suki_says› + W + ‹kai_says› + W + ‹read_who›
- ×2 ‹tv_fs_slow_tortoise› + /X/ + /X/ + /X/ + ‹tv_fs_fast_rabbit› + W
- ×2 /X/ + ‹tv_our_word› + W + ‹first_sound_q›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 ‹tv_fs_say_slow› + /X/ + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×2 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹tv_tap_letter_say› + /X/
- ×2 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹tv_tap_it_say_short› + /X/
- ×1 W + ‹tv_ts_meet› + ‹tv_ts_fast› + W + ‹tv_ts_slow› + W + ‹tv_ready_paw›

Longest chains:

- level w1-10 @1832.8s (12 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it. Let's do this one together. This is a pin. Which picture starts with... /p/
- level w1-10 @1783.4s (11 clips): I'll go first. Here's a nut and a hat. Hmm, let me listen. "nut" Nut starts with... /n/ So I'll tap it. Let's do this one together. This is a cup. This is a net. Which one starts with... /n/
- level w1-3 @894.6s (10 clips): I'll go first. Here's a cat and an ant. Hmm, let me listen. "ant" Ant starts with... /a/ So I'll tap it. Let's do this one together. This is a van. Which one starts with... /a/
- level w1-3 @925.6s (10 clips): I'll go first. Here's some jam and a tent. Hmm, let me listen. "tent" Tent starts with... /t/ So I'll tap it. Let's do this one together. This is a top. Which one starts with... /t/
- level w1-8 @1601.6s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-11 @1982.3s (10 clips): I'll go first. Here's a map and a mop. Hmm, let me listen. "mop" (slowly) Mop has this sound in the middle... /o/ Let's do this one together. This is a top. This is a tap. Which one has this sound in the middle... /o/
- level w1-12 @2150.3s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "pit" Listen to them both... "sit" (slowly) "pit" (slowly) What do we need to change?
- level w1-5 @1208.8s (9 clips): /t/ Let's say it the slow way... /s/ /a/ /t/ And now, fast... "sat" Here's your next word... "mat"

### Praise: 21 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 1

- level w1-wu6 @569.5s: 13.7 s silent (2 taps) after "/n/ Then I say the word... "sun" Now you tap the dots, and say the sounds with m", before "/k/"

### Cut-off clips: 52

- intro film @26.8s: "When you're ready to see what happens next, tap the green arrow." cut after 1.1 of 3.8 s by Oh no! The petals blew away, all over the island!
- choose @50.7s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.9 of 3.6 s by Great choice!
- opt-in @81.7s: "Now come with me to the dojo. Tap the green arrow." cut after 1.6 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @91.7s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 1.7 of 4.5 s by Bong! That's your first star.
- dojo welcome @130.8s: "It's a listening game, called Ninja Ears. Tap the green arrow when you" cut after 3.4 of 4.8 s by I'll say a word. Then you find its picture.
- level (first minutes) @165.2s: "Do you want to have a go now? Tap the green arrow. Or tap my paw to se" cut after 4.9 of 6.1 s by Now you tap the tortoise, and say it slowly with m
- level (first minutes) @301.3s: "Tap each picture, starting on this side." cut after 2.0 of 2.7 s by "fish"
- level w1-wu3 @422.1s: "Now tap the rabbit, and say it fast." cut after 1.6 of 2.4 s by "mug"
- level w1-2 @694.6s: "Now you tap it, and say the sound." cut after 1.6 of 2.5 s by /m/
- level w1-2 @717.6s: "Tap its petal, and say it." cut after 1.8 of 2.4 s by /s/
- level w1-2 @749.1s: "Now you tap it, and say the sound." cut after 2.2 of 2.5 s by /s/
- level w1-2 @781.6s: "/s/" cut after 0.4 of 0.7 s by Sit starts with...
- level w1-3 @891.7s: "Tap its petal, and say it." cut after 2.1 of 2.4 s by /a/
- level w1-3 @917.6s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /a/
- level w1-3 @922.8s: "Tap the petal, and say it with me." cut after 2.0 of 2.5 s by /t/
- level w1-3 @946.2s: "Now you tap it, and say the sound." cut after 1.6 of 2.5 s by /t/
- level w1-4 @1043.3s: "This card is my word. Tap it, and hear the word." cut after 1.5 of 3.6 s by "am"
- level w1-4 @1124.5s: "First, you read it. Tap each sound, and say it with me." cut after 0.5 of 4.3 s by /a/
- level w1-6 @1277.8s: "I'll zap the first one. Tap my word card, and hear the word." cut after 2.8 of 4.0 s by "at"
- level w1-7 @1375.7s: "Tap the petal, and say it with me." cut after 1.8 of 2.5 s by /i/
- level w1-7 @1405.6s: "Now you tap it, and say the sound." cut after 1.8 of 2.5 s by /i/
- level w1-8 @1595.5s: "What do we need to change?" cut after 1.0 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1612.3s: "What do we need to change?" cut after 0.8 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1623.9s: "Which sound changes?" cut after 1.6 of 1.9 s by Yes, the first sound changes!
- level w1-8 @1640.0s: "Which sound changes?" cut after 1.6 of 1.9 s by Yes, the last sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| audit_gem_more "Look, this gem has filled a little more." | 1 | reward |

## playtest/fix/D1/verify1/transcripts-18/continuous-learner.json (learner, one continuous page)

876 Sensei lines, 881 sounds and words, 744 utterances in 90 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 27 | What's the first sound? |
| last_sound_q | 25 | What's the last sound? |
| tv_listen_here | 17 | Let's listen again. What can you hear here? |
| say_sounds_read | 16 | Say the sounds, and read the word. |
| audit_listen_next | 16 | Let's listen again. What sound comes next? |
| next_sound_q | 14 | What's the next sound? |
| tv_your_word | 12 | Your word is... |
| tv_here_sound | 11 | Here's the sound... |
| tv_next_word | 11 | Here's your next word... |
| kai_says | 10 | Kai says... |
| suki_says | 10 | Suki says... |
| tv_swap_now_change | 10 | Now let's change it to... |
| tv_swap_both | 10 | Listen to them both... |
| tv_swap_pick | 10 | Now tap the new one. |
| tv_petal_say | 9 | Tap the petal, and say it with me. |
| first_q | 9 | Which one starts with... |
| tv_watch_write | 9 | Now watch my ninja write it. |
| st_what_change | 9 | What do we need to change? |
| tv_let_me_listen | 8 | Hmm, let me listen. |
| tv_which_write | 8 | Which of these is the way we write... |
| streak_3 | 8 | Ninja power! |
| tv_which_changes | 8 | Which sound changes? |
| tv_how_we_write | 7 | This is how we write... |
| tv_by_yourself | 7 | Now you do one all by yourself. |
| tv_tap_it_say | 7 | Now you tap it, and say the sound. |
| streak_lost | 7 | Keep going, ninja. |
| tv_praise_kept_going | 7 | That was a tricky one, and you kept going. |
| st_first_changes | 7 | Yes, the first sound changes! |
| tv_so_i_tap | 6 | So I'll tap it. |
| tv_yay_lovely | 6 | Lovely! |

### Echoes: the same utterance shape back to back (1)

- level w1-wu6 @731.9s ×2: /m/ It's this one! ‖ /u/ It's this one!

### Near repeats: the same line again within 15 s (14)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w1-2 @910.1s and @915.5s |
| first_sound_q | 3 | What's the first sound? | level w1-4 @1288.3s and @1302.0s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @124.6s and @133.9s |
| tv_rail_turn | 1 | Tap each picture, starting on this side. | level (first minutes) @352.4s and @367.2s |
| fm_its_this | 1 | It's this one! | level w1-wu6 @732.4s and @735.0s |
| fs_ant | 1 | Ant starts with... | level w1-3 @1033.4s and @1043.1s |
| read_tap_sounds | 1 | Tap each sound, and say it. | level w1-4 @1349.8s and @1364.6s |
| tv_which_changes | 1 | Which sound changes? | level w1-8 @2023.4s and @2033.8s |
| tv_here_sound | 1 | Here's the sound... | world flower @3800.7s and @3808.3s |

### Spliced utterances: 165 of 744 (22%); chains of 5+ clips: 88

Commonest spliced shapes:

- ×4 ‹tv_next_word› + W
- ×3 ‹suki_says› + W + ‹kai_says› + W + ‹read_who›
- ×3 ‹kai_says› + W + ‹suki_says› + W + ‹read_who›
- ×3 ‹tv_fs_say_slow› + /X/ + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×2 ‹fs_sit› + /X/
- ×2 ‹tv_next_sound› + /X/ + ‹tv_petal_say›
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×2 /X/ + /X/ + ‹tv_fs_now_fast›
- ×2 ‹suki_says› + W + ‹kai_says› + W + ‹tv_rc_q›
- ×2 ‹tv_your_word› + W
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 ‹tv_battle_again› + ‹tv_your_word› + W
- ×2 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹tv_tap_it_say_short›
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_next_word› + W + ‹first_sound_q›

Longest chains:

- level w1-10 @2283.4s (13 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it. Let's do this one together. This is a pen. This is a dog. Which picture starts with... /p/
- level w1-10 @2224.1s (11 clips): I'll go first. Here's a nut and a hat. Hmm, let me listen. "nut" Nut starts with... /n/ So I'll tap it. Let's do this one together. This is a net. This is a van. Which one starts with... /n/
- level w1-3 @1026.6s (10 clips): I'll go first. Here's a cat and an ant. Hmm, let me listen. "ant" Ant starts with... /a/ So I'll tap it. Let's do this one together. This is a web. Which one starts with... /a/
- level w1-5 @1461.2s (10 clips): /t/ Say the sounds, and read the word. /s/ /a/ /t/ "sat" That was a tricky one, and you kept going. Here's your next word... "mat" What's the first sound?
- level w1-8 @2000.3s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-11 @2478.6s (10 clips): I'll go first. Here's a map and a mop. Hmm, let me listen. "mop" (slowly) Mop has this sound in the middle... /o/ Let's do this one together. This is a top. This is a tap. Which one has this sound in the middle... /o/
- level w1-12 @2851.8s (10 clips): /t/ /a/ /n/ "tan" Now let's change it to... "pan" Listen to them both... "tan" (slowly) "pan" (slowly) What do we need to change?
- level w1-12 @2936.0s (10 clips): /m/ /a/ /n/ "man" Ninja power! Now let's change it to... "map" "man" (slowly) "map" (slowly) What do we need to change?

### Praise: 27 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 2

- level w1-wu3 @534.9s: 11.8 s silent (1 taps) after "Here's your slow word... "van" (slowly) Which picture is it?", before ""van" (slowly)"
- level w1-wu3 @591.5s: 10.7 s silent (1 taps) after "Now you find the other three. Are you ready?", before "This is some jam."

### Cut-off clips: 29

- intro film @26.9s: "When you're ready to see what happens next, tap the green arrow." cut after 2.4 of 3.8 s by Oh no! The petals blew away, all over the island!
- choose @53.5s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.8 of 3.6 s by Great choice!
- opt-in @88.7s: "Now come with me to the dojo. Tap the green arrow." cut after 3.1 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @100.1s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 3.2 of 4.5 s by Bong! That's your first star.
- level (first minutes) @367.2s: "Tap each picture, starting on this side." cut after 1.2 of 2.7 s by "dog"
- level w1-wu3 @493.5s: "Now you tap the tortoise, and say it slowly with me." cut after 0.0 of 3.3 s by "mug" (slowly)
- level w1-wu3 @555.3s: "Now tap the rabbit, and say it fast." cut after 1.0 of 2.4 s by "van"
- level w1-2 @918.2s: "/s/" cut after 0.3 of 0.7 s by That's how we write...
- level w1-4 @1192.7s: "This card is my word. Tap it, and hear the word." cut after 2.7 of 3.6 s by "am"
- level w1-4 @1325.2s: "First, you read it. Tap each sound, and say it with me." cut after 1.0 of 4.3 s by /a/
- level w1-4 @1349.8s: "Tap each sound, and say it." cut after 0.6 of 2.0 s by /a/
- level w1-4 @1364.6s: "Tap each sound, and say it." cut after 0.6 of 2.0 s by /a/
- level w1-5 @1562.5s: "Tap each sound, and say it." cut after 0.4 of 2.0 s by /s/
- level w1-5 @1583.7s: "Tap each sound, and say it." cut after 0.3 of 2.0 s by /m/
- level w1-6 @1637.8s: "I'll zap the first one. Tap my word card, and hear the word." cut after 2.8 of 4.0 s by "at"
- level w1-8 @1993.6s: "What do we need to change?" cut after 1.5 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @2011.0s: "What do we need to change?" cut after 1.1 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @2033.8s: "Which sound changes?" cut after 0.9 of 1.9 s by Yes, the first sound changes!
- level w1-8 @2052.4s: "Which sound needs to change?" cut after 1.0 of 1.8 s by Yes, the last sound changes!
- level w1-8 @2068.7s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the first sound changes!
- level w1-10 @2329.6s: "/n/" cut after 0.6 of 0.9 s by Net starts with...
- level w1-10 @2348.4s: "/n/" cut after 0.6 of 0.9 s by /n/
- level w1-11 @2655.9s: "Tap each sound, and say it." cut after 0.4 of 2.0 s by /p/
- level w1-11 @2671.3s: "Tap each sound, and say it." cut after 0.7 of 2.0 s by /m/
- level w1-12 @2845.6s: "What do we need to change?" cut after 0.9 of 1.8 s by Yes, the middle sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_more "Look, this gem has filled a little more." | 3 | reward ×3 |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C-P: playtest/fix/D1/verify1/transcripts-18/continuous-perfect.json

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
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.89 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 20 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 12.5 s (run w1-9); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 5 words; 217 turns) | pass |
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
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 10 of 10 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 101 of 101, rabbit 77 of 77 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 8 of 8 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 12.5 s (run w1-9); 1 over | **FAIL** |

- **line-60s**: ‹tv_watch_write› "Now watch my ninja write it." from w2-1 @44:43.4; ‹tv_here_sound› "Here's the sound..." from world flower @47:44.8
- **talk-before-action**: run (w1-9) 12.5 s from ‹tv_fs_say_slow› "Let's say it the slow way..." to ‹tv_run_which› "Tap the lantern with my word."
- **fs-talk**: run (w1-9) 12.5 s from ‹tv_fs_say_slow› "Let's say it the slow way..." to ‹tv_run_which› "Tap the lantern with my word.", with ‹tv_fs_say_slow› "Let's say it the slow way..."

### C-L: playtest/fix/D1/verify1/transcripts-18/continuous-learner.json

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
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 8 (0 repeats) | pass |
| `swap-place-heard` swap place lines heard to the end | all | 17 of 17 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.07 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 3 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 20 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 12.5 s (run w1-9); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 13 words (median line 5 words; 295 turns) | pass |
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
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 10 of 10 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 135 of 135, rabbit 92 of 92 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 8 of 8 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 12.5 s (run w1-9); 1 over | **FAIL** |

- **line-60s**: ‹tv_watch_write› "Now watch my ninja write it." from w2-1 @58:59.7; ‹tv_here_sound› "Here's the sound..." from world flower @63:00.7
- **talk-before-action**: run (w1-9) 12.5 s from ‹tv_fs_say_slow› "Let's say it the slow way..." to ‹tv_run_which› "Tap the lantern with my word."
- **fs-talk**: run (w1-9) 12.5 s from ‹tv_fs_say_slow› "Let's say it the slow way..." to ‹tv_run_which› "Tap the lantern with my word.", with ‹tv_fs_say_slow› "Let's say it the slow way..."

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

