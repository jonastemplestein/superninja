# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/B1-verify1/transcripts-17/continuous-perfect.json (perfect, one continuous page)

657 Sensei lines, 599 sounds and words, 499 utterances in 81 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 15 | What's the first sound? |
| last_sound_q | 13 | What's the last sound? |
| first_q | 9 | Which one starts with... |
| tv_here_sound | 8 | Here's the sound... |
| tv_let_me_listen | 8 | Hmm, let me listen. |
| tv_tap_it_say | 8 | Now you tap it, and say the sound. |
| tv_by_yourself | 8 | Now you do one all by yourself. |
| tv_your_word | 8 | Your word is... |
| tv_next_word | 7 | Here's your next word... |
| tv_so_i_tap | 6 | So I'll tap it. |
| st_first_q2 | 6 | Which picture starts with... |
| tv_which_write | 6 | Which of these is the way we write... |
| tv_petal_say | 6 | Tap the petal, and say it with me. |
| tv_fs_say_slow | 6 | Let's say it the slow way... |
| tv_fs_now_fast | 6 | And now, fast... |
| gem_ready | 6 | A gem is glowing! It's ready for a gem battle. |
| tv_swap_now_change | 6 | Now let's change it to... |
| st_what_change | 6 | What do we need to change? |
| st_middle_changes | 6 | Yes, the middle sound changes! |
| tv_which_changes | 6 | Which sound changes? |
| tv_watch_write | 5 | Now watch my ninja write it. |
| tv_how_we_write | 5 | This is how we write... |
| tv_together | 5 | Let's do this one together. |
| tv_our_word | 5 | Here's our word... |
| tv_by_yourself_build | 5 | Now you build one all by yourself. |
| next_sound_q | 5 | What's the next sound? |
| st_first_changes | 5 | Yes, the first sound changes! |
| fm_tap_rabbit | 4 | Now tap the rabbit, and say it fast. |
| fm_name_bus | 4 | This is a bus. |
| fs_ant | 4 | Ant starts with... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (21)

| Line | Repeats | Text | Example |
|---|---|---|---|
| last_sound_q | 5 | What's the last sound? | level w1-7 @1440.0s and @1454.7s |
| first_sound_q | 4 | What's the first sound? | level w1-7 @1437.6s and @1450.1s |
| tv_which_write | 3 | Which of these is the way we write... | level w1-2 @800.6s and @806.3s |
| tv_which_changes | 2 | Which sound changes? | level w1-12 @2175.8s and @2185.7s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @123.4s and @131.4s |
| fs_ant | 1 | Ant starts with... | level w1-3 @912.1s and @922.3s |
| tv_guess_q | 1 | Listen for the word... | level w1-9 @1697.3s and @1712.2s |
| next_sound_q | 1 | What's the next sound? | level w1-11 @2050.4s and @2063.3s |
| swap_which | 1 | Which sound needs to change? | level w1-12 @2195.3s and @2204.8s |
| tv_swap_now_change | 1 | Now let's change it to... | level w1-12 @2213.8s and @2224.3s |
| st_what_change | 1 | What do we need to change? | level w1-12 @2235.3s and @2243.4s |

### Spliced utterances: 134 of 499 (27%); chains of 5+ clips: 93

Commonest spliced shapes:

- ×5 ‹tv_your_word› + W
- ×3 ‹kai_says› + W + ‹suki_says› + W + ‹read_who›
- ×3 ‹tv_fs_slow_tortoise› + /X/ + /X/ + /X/ + ‹tv_fs_fast_rabbit› + W
- ×2 ‹st_first_q2› + /X/
- ×2 ‹tv_next_sound› + /X/ + ‹tv_petal_say› + /X/
- ×2 ‹tv_mix_up› + ‹first_q› + /X/
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 /X/ + ‹tv_praise_write› + ‹tv_which_write› + /X/
- ×2 ‹tv_yes_kai› + ‹tv_fs_say_slow›
- ×2 ‹tv_our_word› + W
- ×2 ‹tv_next_word› + W
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 W + ‹tv_ts_meet› + ‹tv_ts_fast› + W + ‹tv_ts_slow› + W + ‹tv_ready_paw› + ‹fm_tap_tortoise›
- ×1 W + ‹fm_notice_sun_sock› + /X/ + ‹tv_petal_first›
- ×1 ‹tv_pocket_frame› + ‹tv_pocket_ido› + ‹fs_sun› + /X/ + ‹tv_so_pocket› + ‹tv_pocket_ready_two›

Longest chains:

- level w1-8 @1599.7s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-12 @2153.7s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "pit" Listen to them both... "sit" (slowly) "pit" (slowly) What do we need to change?
- level (first minutes) @166.1s (8 clips): "sock" Here are my friends, the rabbit and the tortoise. The rabbit says words fast... "sun" The tortoise says them slowly... "sun" (slowly) Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again. Now you tap the tortoise, and say 
- level w1-5 @1223.7s (8 clips): Let's say it the slow way... /s/ /a/ /t/ And now, fast... "sat" Here's your next word... "mat"
- level w1-10 @1833.7s (8 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it.
- level w1-12 @2134.9s (8 clips): "sat" If you'd like to see me do one first, tap my paw. Now let's change it to... "sit" Listen to them both... "sat" (slowly) "sit" (slowly) What do we need to change?
- level w1-wu3 @557.4s (7 clips): "van" (slowly) You found them all! They all have the sound... /a/ One more Pocket Hunt. Find the pictures that start with... /m/ It's a new sound. Tap its petal, and say it with me.
- level w1-2 @680.9s (7 clips): I'll go first. Here's a map and a hat. Hmm, let me listen. "map" (held) Map starts with... /m/ So I'll tap it. Let's do the next one together. Are you ready?

### Praise: 21 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 38

- intro film @7.9s: "When you're ready to see what happens next, tap the green arrow." cut after 1.5 of 3.8 s by Every petal was a sound. With sounds, we could tal
- choose @62.1s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.8 of 3.6 s by Great choice!
- opt-in @92.8s: "Now come with me to the dojo. Tap the green arrow." cut after 1.4 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @102.5s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 1.7 of 4.5 s by Bong! That's your first star.
- dojo welcome @142.2s: "It's a listening game, called Ninja Ears. Tap the green arrow when you" cut after 3.6 of 4.8 s by I'll say a word. Then you find its picture.
- level (first minutes) @176.4s: "Do you want to have a go now? Tap the green arrow. Or tap my paw to se" cut after 4.5 of 6.1 s by Now you tap the tortoise, and say it slowly with m
- level (first minutes) @318.8s: "Tap each picture, starting on this side." cut after 1.9 of 2.7 s by "fish"
- level (first minutes) @334.7s: "When you're ready for the next game, tap the green arrow." cut after 2.3 of 3.3 s by Here are two rows of pictures. I'll read one, and 
- level w1-wu6 @629.8s: "Now tap the rabbit, and say it fast." cut after 1.8 of 2.4 s by "cat"
- level w1-2 @678.0s: "Tap its petal, and say it." cut after 1.8 of 2.4 s by /m/
- level w1-2 @708.9s: "Now you tap it, and say the sound." cut after 1.8 of 2.5 s by /m/
- level w1-2 @731.3s: "Tap its petal, and say it." cut after 1.9 of 2.4 s by /s/
- level w1-2 @759.9s: "Now you tap it, and say the sound." cut after 1.8 of 2.5 s by /s/
- level w1-3 @902.7s: "Tap its petal, and say it." cut after 1.9 of 2.4 s by /a/
- level w1-3 @928.5s: "Now you tap it, and say the sound." cut after 1.6 of 2.5 s by /a/
- level w1-3 @945.6s: "Tap the petal, and say it with me." cut after 1.3 of 2.5 s by /t/
- level w1-3 @970.1s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /t/
- level w1-4 @1063.7s: "This card is my word. Tap it, and hear the word." cut after 1.6 of 3.6 s by "am"
- level w1-4 @1143.4s: "First, you read it. Tap each sound, and say it with me." cut after 0.7 of 4.3 s by /a/
- level w1-6 @1287.2s: "I'll zap the first one. Tap my word card, and hear the word." cut after 2.0 of 4.0 s by "at"
- level w1-7 @1382.9s: "Tap the petal, and say it with me." cut after 1.7 of 2.5 s by /i/
- level w1-7 @1412.6s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /i/
- level w1-8 @1593.5s: "What do we need to change?" cut after 0.8 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1610.4s: "What do we need to change?" cut after 1.0 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1622.6s: "Which sound changes?" cut after 1.3 of 1.9 s by Yes, the first sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |

## playtest/fix/B1-verify1/transcripts/continuous-perfect-from-w6-br1.json (perfect-from-w6-br1, one continuous page)

286 Sensei lines, 561 sounds and words, 324 utterances in 55 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_your_word | 13 | Your word is... |
| tv_here_sound | 10 | Here's the sound... |
| tv_next_word | 9 | Here's your next word... |
| tv_watch_write | 8 | Now watch my ninja write it. |
| tv_which_write | 8 | Which of these is the way we write... |
| t_two_letters | 7 | It's two letters, but it's one sound. |
| help_sort | 6 | Tap the chest with the same spelling as the word. |
| tv_praise_sorted | 6 | That's the right chest. |
| tv_sort_done | 6 | Same sound, different spellings. You sorted them all. |
| next_sound_q | 6 | What's the next sound? |
| audit_gem_more | 5 | Look, this gem has filled a little more. |
| audit_sort_again | 5 | Sorting time! Same sound, different spellings. |
| audit_sort_pair | 5 | This sound can be spelt in two ways. |
| st_two_letters_too | 4 | This one's two letters too, but it's just one sound. |
| tv_learn_short_two | 4 | Back to the dojo. Today there are two new sounds. |
| tv_learn_first_short | 4 | Here's the first new sound... |
| tv_petal_say | 4 | Tap the petal, and say it with me. |
| tv_how_we_write | 4 | This is how we write... |
| tv_tap_letter_say | 4 | Now you tap it, and say the sound. |
| tv_said_well | 4 | Good, you said that sound really well. |
| tv_learn_next | 4 | Here's the next new sound... |
| st_know_this_sound | 4 | Ooh, you already know this sound! |
| tv_petal_say_short | 4 | Tap its petal, and say it. |
| t_another_way | 4 | This is another way to spell the sound... |
| tv_tap_it_say_short | 4 | Now you tap it, and say it. |
| tv_learn_all_two | 4 | Two new sounds! You said every one. |
| tv_ne_new_sounds | 4 | Now let's play Ninja Eyes, with your new sounds. |
| tv_build_dojo | 4 | Now let's build some words with your new sounds. |
| first_sound_q | 4 | What's the first sound? |
| last_sound_q | 4 | What's the last sound? |

### Echoes: the same utterance shape back to back (3)

- level w6-1 @290.9s ×2: What's the next sound? /p/ ‖ What's the next sound? /r/
- level w6-6 @969.1s ×2: What's the next sound? /r/ ‖ What's the next sound? /ee/
- level w6-ec11 @1238.3s ×2: What's the next sound? /a/ ‖ What's the next sound? /m/

### Near repeats: the same line again within 15 s (7)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w6-1 @277.7s and @279.4s |
| next_sound_q | 3 | What's the next sound? | level w6-1 @290.9s and @292.3s |

### Spliced utterances: 65 of 324 (20%); chains of 5+ clips: 60

Commonest spliced shapes:

- ×4 ‹tv_learn_short_two› + ‹tv_learn_first_short› + /X/
- ×3 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×3 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/
- ×3 ‹tv_to_reward› + ‹tv_won_one› + /X/
- ×3 /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×3 ‹tv_learn_all_two› + ‹tv_ne_new_sounds› + ‹tv_which_write› + /X/
- ×3 ‹tv_which_write› + /X/
- ×2 ‹yay_1› + ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q› + /X/
- ×2 /X/ + /X/ + W + ‹tv_next_word› + W
- ×2 /X/ + /X/ + /X/ + /X/ + W + ‹tv_next_word› + W
- ×1 ‹tv_here_sound› + /X/ + ‹audit_bridging_first› + ‹tv_sort_frame› + ‹tv_sort_open›
- ×1 ‹t_two_letters› + /X/ + ‹tv_sort_ido› + W + ‹tv_sort_see› + ‹tv_sort_so› + ‹tv_ready_yours›
- ×1 ‹audit_sort_again› + ‹tv_here_sound› + /X/ + ‹audit_sort_pair› + ‹tg_ch_ch_way› + ‹st_two_letters_too› + /X/ + ‹tv_spelt_like_this_match›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_learn_all_two› + ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write›

Longest chains:

- level w6-1 @321.2s (9 clips): Say the sounds, and read the word. /w/ /e/ /s/ /t/ "west" You said it slowly, and found every sound. Your word is... "stay"
- level w6-1 @357.3s (9 clips): Say the sounds, and read the word. /s/ /n/ /ae/ /l/ "snail" Brilliant! Your word is... "tail"
- level w6-br2 @139.5s (8 clips): Sorting time! Same sound, different spellings. Here's the sound... /ch/ This sound can be spelt in two ways. This is the way we spell it in chick. This one's two letters too, but it's just one sound. /ch/ In match, it's spelt like this.
- level w6-3 @617.9s (8 clips): /sh/ /ee/ /p/ "sheep" It's two letters, but it's one sound. /sh/ Your word is... "drip"
- level w6-3 @635.1s (8 clips): /d/ /r/ /i/ /p/ "drip" You built that whole word by yourself! Here's your next word... "feet"
- level w6-6 @1016.2s (8 clips): /j/ /u/ /m/ /p/ "jump" Lovely! Your word is... "boat"
- level w6-ec11 @1173.2s (8 clips): /ie/ You can hear it in... "light" "night" ...and... "high" Tap the petal, and say it with me. /ie/
- level w6-br1 @38.5s (7 clips): It's two letters, but it's one sound. /k/ I'll sort the first one. My word is... "shock" I can see this spelling at the end. So it goes in this chest. Now you do one. Are you ready?

### Praise: 10 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 30

- level w6-br2 @191.6s: ""witch"" cut after 0.3 of 0.6 s by /w/
- level w6-1 @229.8s: "Tap the petal, and say it with me." cut after 1.7 of 2.5 s by /ae/
- level w6-1 @239.1s: "Now you tap it, and say the sound." cut after 1.8 of 2.5 s by /ae/
- level w6-1 @241.7s: "Tap it once more, and say it again." cut after 0.4 of 2.5 s by /ae/
- level w6-1 @251.8s: "Tap its petal, and say it." cut after 1.6 of 2.4 s by /ae/
- level w6-1 @262.4s: "Now you tap it, and say it." cut after 1.7 of 2.1 s by /ae/
- level w6-1 @277.7s: "Which of these is the way we write..." cut after 1.4 of 2.7 s by /ae/
- level w6-1 @279.4s: "Which of these is the way we write..." cut after 1.6 of 2.7 s by /ae/
- level w6-1 @290.9s: "What's the next sound?" cut after 0.9 of 1.3 s by /p/
- level w6-3 @546.7s: "Tap the petal, and say it with me." cut after 1.7 of 2.5 s by /ee/
- level w6-3 @556.4s: "Now you tap it, and say the sound." cut after 1.4 of 2.5 s by /ee/
- level w6-3 @569.4s: "Tap its petal, and say it." cut after 1.5 of 2.4 s by /ee/
- level w6-3 @592.2s: "Which of these is the way we write..." cut after 1.8 of 2.7 s by /ee/
- level w6-3 @594.6s: "Which of these is the way we write..." cut after 1.4 of 2.7 s by /ee/
- level w6-6 @911.6s: "Tap the petal, and say it with me." cut after 1.8 of 2.5 s by /oe/
- level w6-6 @921.2s: "Now you tap it, and say the sound." cut after 1.6 of 2.5 s by /oe/
- level w6-6 @934.1s: "Tap its petal, and say it." cut after 1.8 of 2.4 s by /oe/
- level w6-6 @945.1s: "Now you tap it, and say it." cut after 1.5 of 2.1 s by /oe/
- level w6-6 @956.5s: "Which of these is the way we write..." cut after 1.3 of 2.7 s by /oe/
- level w6-6 @958.4s: "Which of these is the way we write..." cut after 1.4 of 2.7 s by /oe/
- level w6-6 @973.5s: "What's the last sound?" cut after 1.0 of 1.5 s by /n/
- level w6-8 @1136.4s: ""slow"" cut after 0.1 of 0.6 s by /s/
- level w6-ec11 @1178.8s: "Tap the petal, and say it with me." cut after 1.8 of 2.5 s by /ie/
- level w6-ec11 @1188.9s: "Now you tap it, and say the sound." cut after 1.8 of 2.5 s by /ie/
- level w6-ec11 @1202.4s: "Tap its petal, and say it." cut after 1.4 of 2.4 s by /ie/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 7 | level w6-br1, level w6-1, level w6-3 ×2, level w6-6, level w6-ec11, level w6-9 |
| audit_gem_more "Look, this gem has filled a little more." | 5 | reward ×5 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| t_another_way "This is another way to spell the sound..." | 4 | level w6-1, level w6-3, level w6-6, level w6-ec11 |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w6-br1 |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w6-ec11 |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C-P: playtest/fix/B1-verify1/transcripts-17/continuous-perfect.json

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
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 3 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 8 (0 repeats) | pass |
| `swap-place-heard` swap place lines heard to the end | all | 15 of 15 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.92 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 20 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 13.3 s (compound w1-wu2); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 5 words; 195 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 19 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 13 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 10 of 10 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 91 of 91, rabbit 69 of 69 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 8 of 8 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.3 s (run w1-9); 0 over | pass |

- **talk-before-action**: compound (w1-wu2) 13.3 s from ‹fm_pair_cat_dog› "Cat dog!" to ‹tv_squish_ready› "Two little words make one big word. Now you make one. Are you ready?"

### C6-P: playtest/fix/B1-verify1/transcripts/continuous-perfect-from-w6-br1.json

perfect, from w6-br1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 | 12 | pass |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 1 sounds | **FAIL** |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.15 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 1 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.5 s (sort w6-br1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 7 words; 95 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 2 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 1 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 1 a level, 1 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 1 of 1 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 31 of 31, rabbit 31 of 31 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 10.1 s (build w6-1); 0 over | pass |

- **letters-twice**: /ie/: 2× (w6-ec11 19:46.1, w6-ec11 20:10.2)
- **line-60s**: ‹tv_your_word› "Your word is..." from w6-3 @10:01.1

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

