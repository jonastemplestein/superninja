# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/V-script/transcripts/continuous-perfect.json (perfect, one continuous page)

565 Sensei lines, 426 sounds and words, 395 utterances in 64 pieces.

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
| tv_so_i_tap | 6 | So I'll tap it. |
| st_first_q2 | 6 | Which picture starts with... |
| tv_which_write | 6 | Which of these is the way we write... |
| tv_your_word | 6 | Your word is... |
| tv_watch_write | 5 | Now watch my ninja write it. |
| tv_how_we_write | 5 | This is how we write... |
| tv_together | 5 | Let's do this one together. |
| tv_petal_say | 5 | Tap the petal, and say it with me. |
| tv_our_word | 5 | Here's our word... |
| tv_by_yourself_build | 5 | Now you build one all by yourself. |
| tv_next_word | 5 | Here's your next word... |
| next_sound_q | 5 | What's the next sound? |
| fm_tap_rabbit | 4 | Now tap the rabbit, and say it fast. |
| fm_name_bus | 4 | This is a bus. |
| yay_2 | 4 | Super! |
| fs_ant | 4 | Ant starts with... |
| tv_to_flower | 4 | Let's take your new sounds to the World Flower. Tap the green arrow. |
| kai_says | 4 | Kai says... |
| suki_says | 4 | Suki says... |
| tv_fs_say_slow | 4 | Let's say it the slow way... |
| tv_fs_now_fast | 4 | And now, fast... |
| tv_hunt_q | 4 | Which one has this sound in the middle... |
| fm_name_cat | 3 | This is a cat. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (14)

| Line | Repeats | Text | Example |
|---|---|---|---|
| first_sound_q | 5 | What's the first sound? | level w1-7 @1465.7s and @1479.3s |
| tv_which_write | 3 | Which of these is the way we write... | level w1-2 @808.4s and @813.4s |
| last_sound_q | 3 | What's the last sound? | level w1-7 @1484.0s and @1493.9s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @124.1s and @132.1s |
| fs_ant | 1 | Ant starts with... | level w1-3 @925.5s and @936.8s |
| next_sound_q | 1 | What's the next sound? | level w1-11 @2084.9s and @2099.6s |

### Spliced utterances: 119 of 395 (30%); chains of 5+ clips: 64

Commonest spliced shapes:

- ×2 ‹st_first_q2› + /X/
- ×2 ‹tv_which_write› + /X/
- ×2 ‹tv_next_sound› + /X/ + ‹tv_petal_say› + /X/
- ×2 ‹fs_top› + /X/
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×2 /X/ + ‹tv_our_word›
- ×2 ‹suki_says› + W + ‹kai_says› + W + ‹read_who›
- ×1 W + ‹tv_ts_meet› + ‹tv_ts_fast› + W + ‹tv_ts_slow› + W + ‹tv_ready_paw›
- ×1 ‹fm_notice_sun_sock› + /X/ + ‹tv_petal_first›
- ×1 ‹tv_pocket_frame› + ‹tv_pocket_ido› + ‹fs_sun› + /X/ + ‹tv_so_pocket› + ‹tv_pocket_ready_two›
- ×1 W + ‹fm_found_both› + /X/
- ×1 ‹fm_rw_shiny› + ‹fm_rw2_s› + /X/
- ×1 ‹tv_ts_again› + ‹fm_name_mug› + ‹tv_ts_slow_one› + W + ‹fm_tap_tortoise›
- ×1 ‹tv_slow_frame› + ‹tv_slow_demo› + W + ‹tv_i_hear_mug› + ‹tv_ready_go›

Longest chains:

- level w1-8 @1630.2s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-5 @1245.8s (9 clips): /t/ Let's say it the slow way... /s/ /a/ /t/ And now, fast... "sat" Here's your next word... "mat"
- level w1-10 @1865.8s (8 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it.
- level (first minutes) @167.0s (7 clips): "sock" Here are my friends, the rabbit and the tortoise. The rabbit says words fast... "sun" The tortoise says them slowly... "sun" (slowly) Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again.
- level w1-2 @685.5s (7 clips): I'll go first. Here's a map and a hat. Hmm, let me listen. "map" (held) Map starts with... /m/ So I'll tap it. Let's do the next one together. Are you ready?
- level w1-2 @706.8s (7 clips): Mug starts with... /m/ Now watch my ninja write it. This is how we write... /m/ Now you tap it, and say the sound. /m/
- level w1-2 @738.7s (7 clips): I'll go first. Here's a bed and a sock. Hmm, let me listen. "sock" (held) Sock starts with... /s/ So I'll tap it. Let's do the next one together. Are you ready?
- level w1-3 @936.8s (7 clips): Ant starts with... /a/ Now watch my ninja write it. This is how we write... /a/ Now you tap it, and say the sound. /a/

### Praise: 17 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 35

- intro film @8.3s: "When you're ready to see what happens next, tap the green arrow." cut after 1.9 of 3.8 s by Every petal was a sound. With sounds, we could tal
- choose @62.6s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.8 of 3.6 s by Great choice!
- opt-in @93.3s: "Now come with me to the dojo. Tap the green arrow." cut after 1.5 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @103.1s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 1.7 of 4.5 s by Bong! That's your first star.
- dojo welcome @142.9s: "It's a listening game, called Ninja Ears. Tap the green arrow when you" cut after 3.6 of 4.8 s by I'll say a word. Then you find its picture.
- level (first minutes) @177.3s: "Do you want to have a go now? Tap the green arrow. Or tap my paw to se" cut after 4.7 of 6.1 s by Now you tap the tortoise, and say it slowly with m
- level (first minutes) @320.0s: "Tap each picture, starting on this side." cut after 1.9 of 2.7 s by "fish"
- level (first minutes) @335.9s: "When you're ready for the next game, tap the green arrow." cut after 2.5 of 3.3 s by Here are two rows of pictures. I'll read one, and 
- level w1-wu6 @632.8s: "Now tap the rabbit, and say it fast." cut after 1.9 of 2.4 s by "cat"
- level w1-2 @682.6s: "Tap its petal, and say it." cut after 1.6 of 2.4 s by /m/
- level w1-2 @713.9s: "Now you tap it, and say the sound." cut after 1.5 of 2.5 s by /m/
- level w1-2 @735.7s: "Tap its petal, and say it." cut after 1.7 of 2.4 s by /s/
- level w1-2 @759.3s: "/s/" cut after 0.4 of 0.7 s by Sun starts with...
- level w1-2 @765.2s: "Now you tap it, and say the sound." cut after 2.0 of 2.5 s by /s/
- level w1-3 @943.0s: "Now you tap it, and say the sound." cut after 2.1 of 2.5 s by /a/
- level w1-3 @960.8s: "Tap the petal, and say it with me." cut after 1.9 of 2.5 s by /t/
- level w1-3 @985.4s: "Now you tap it, and say the sound." cut after 1.6 of 2.5 s by /t/
- level w1-4 @1082.3s: "This card is my word. Tap it, and hear the word." cut after 2.0 of 3.6 s by "am"
- level w1-4 @1166.2s: "First, you read it. Tap each sound, and say it with me." cut after 0.5 of 4.3 s by /a/
- level w1-6 @1314.7s: "I'll zap the first one. Tap my word card, and hear the word." cut after 1.9 of 4.0 s by "at"
- level w1-6 @1328.3s: "That's how we spell a word. Now you spell one. Are you ready to zap it" cut after 4.7 of 5.1 s by Your word is...
- level w1-7 @1409.6s: "Tap the petal, and say it with me." cut after 1.6 of 2.5 s by /i/
- level w1-7 @1439.8s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /i/
- level w1-8 @1640.9s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1653.5s: "Which sound changes?" cut after 1.5 of 1.9 s by Yes, the first sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |

## playtest/fix/V-script/transcripts/continuous-learner.json (learner, one continuous page)

616 Sensei lines, 483 sounds and words, 473 utterances in 64 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 18 | What's the first sound? |
| last_sound_q | 16 | What's the last sound? |
| first_q | 9 | Which one starts with... |
| tv_here_sound | 8 | Here's the sound... |
| tv_let_me_listen | 8 | Hmm, let me listen. |
| tv_tap_it_say | 8 | Now you tap it, and say the sound. |
| tv_by_yourself | 8 | Now you do one all by yourself. |
| next_sound_q | 7 | What's the next sound? |
| tv_petal_say | 6 | Tap the petal, and say it with me. |
| tv_so_i_tap | 6 | So I'll tap it. |
| st_first_q2 | 6 | Which picture starts with... |
| tv_fs_stuck_slow | 6 | Let's say it the slow way first... |
| tv_which_write | 6 | Which of these is the way we write... |
| tv_your_word | 6 | Your word is... |
| say_sounds_read | 6 | Say the sounds, and read the word. |
| tv_next_word | 6 | Here's your next word... |
| kai_says | 6 | Kai says... |
| suki_says | 6 | Suki says... |
| tv_watch_write | 5 | Now watch my ninja write it. |
| tv_how_we_write | 5 | This is how we write... |
| streak_lost | 5 | Keep going, ninja. |
| tv_together | 5 | Let's do this one together. |
| tv_our_word | 5 | Here's our word... |
| tv_by_yourself_build | 5 | Now you build one all by yourself. |
| fm_name_cat | 4 | This is a cat. |
| fm_tap_rabbit | 4 | Now tap the rabbit, and say it fast. |
| fm_name_bus | 4 | This is a bus. |
| fs_ant | 4 | Ant starts with... |
| tv_to_flower | 4 | Let's take your new sounds to the World Flower. Tap the green arrow. |
| streak_3 | 4 | Ninja power! |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (7)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 3 | Which of these is the way we write... | level w1-2 @939.8s and @945.7s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @144.6s and @153.7s |
| fs_ant | 1 | Ant starts with... | level w1-3 @1073.6s and @1083.4s |
| tv_which_changes | 1 | Which sound changes? | level w1-8 @1899.1s and @1909.4s |
| first_sound_q | 1 | What's the first sound? | level w1-11 @2443.4s and @2456.9s |

### Spliced utterances: 134 of 473 (28%); chains of 5+ clips: 59

Commonest spliced shapes:

- ×3 ‹suki_says› + W + ‹kai_says› + W + ‹read_who›
- ×2 ‹st_first_q2› + /X/
- ×2 ‹tv_next_sound› + /X/ + ‹tv_petal_say›
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×2 /X/ + /X/ + ‹tv_fs_now_fast›
- ×2 /X/ + ‹tv_our_word›
- ×2 /X/ + /X/ + W + ‹yay_8› + ‹tv_by_yourself_build› + ‹tv_your_word›
- ×1 W + ‹tv_ts_meet› + ‹tv_ts_fast› + W + ‹tv_ts_slow› + W + ‹tv_ready_paw›
- ×1 ‹fm_notice_sun_sock› + /X/ + ‹tv_petal_first›
- ×1 ‹tv_pocket_frame› + ‹tv_pocket_ido› + ‹fs_sun› + /X/ + ‹tv_so_pocket› + ‹tv_pocket_ready_two›
- ×1 W + ‹fm_found_both› + /X/
- ×1 ‹fm_rw_shiny› + ‹fm_rw2_s› + /X/
- ×1 ‹tv_ts_again› + ‹fm_name_mug› + ‹tv_ts_slow_one› + W + ‹fm_tap_tortoise›
- ×1 ‹tv_slow_frame› + ‹tv_slow_demo› + W + ‹tv_i_hear_mug› + ‹tv_ready_go›

Longest chains:

- level w1-8 @1876.5s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-5 @1430.5s (9 clips): Let's say it the slow way... /s/ /a/ /t/ And now, fast... "sat" Here's your next word... "mat" What's the first sound?
- level w1-8 @1936.4s (9 clips): /a/ /t/ "at" Ninja power! Now let's change it to... "it" "at" (slowly) "it" (slowly) What do we need to change?
- level w1-10 @2156.3s (9 clips): /p/ I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it.
- level w1-4 @1317.1s (8 clips): Say the sounds, and read the word. /a/ /m/ "am" Ninja power! Here's your next word... "at" What's the first sound?
- level w1-7 @1713.6s (8 clips): /s/ /i/ /t/ "sit" Wow! Super ninja streak! Here's your next word... "it" What's the first sound?
- level w1-8 @1893.3s (8 clips): /s/ /a/ /t/ "sat" You changed just one sound. "mat" Which sound changes? That's...
- level (first minutes) @194.3s (7 clips): "sock" Here are my friends, the rabbit and the tortoise. The rabbit says words fast... "sun" The tortoise says them slowly... "sun" (slowly) Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again.

### Praise: 18 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 14

- intro film @8.3s: "When you're ready to see what happens next, tap the green arrow." cut after 3.3 of 3.8 s by Every petal was a sound. With sounds, we could tal
- choose @73.8s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.8 of 3.6 s by Great choice!
- opt-in @108.7s: "Now come with me to the dojo. Tap the green arrow." cut after 3.0 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @120.0s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 3.0 of 4.5 s by Bong! That's your first star.
- level w1-4 @1344.8s: "First, you read it. Tap each sound, and say it with me." cut after 0.6 of 4.3 s by /a/
- level w1-6 @1505.6s: "I'll zap the first one. Tap my word card, and hear the word." cut after 3.2 of 4.0 s by "at"
- level w1-8 @1887.1s: "What do we need to change?" cut after 0.7 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1909.4s: "Which sound changes?" cut after 0.9 of 1.9 s by Yes, the first sound changes!
- level w1-8 @1928.1s: "Which sound needs to change?" cut after 0.9 of 1.8 s by Yes, the last sound changes!
- level w1-8 @1944.6s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the first sound changes!
- level w1-10 @2203.0s: "/n/" cut after 0.6 of 0.9 s by Net starts with...
- level w1-10 @2221.6s: "/n/" cut after 0.4 of 0.9 s by /n/
- level w1-11 @2517.3s: "Tap each sound, and say it." cut after 0.6 of 2.0 s by /p/
- level w1-11 @2534.4s: "Tap each sound, and say it." cut after 0.5 of 2.0 s by /m/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |

## playtest/fix/V-script/transcripts/continuous-perfect-from-w5-1.json (perfect-from-w5-1, one continuous page)

323 Sensei lines, 616 sounds and words, 408 utterances in 55 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_your_word | 13 | Your word is... |
| tv_next_word | 10 | Here's your next word... |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| wf_found_gem | 6 | You found a new gem! It's a spelling of the sound... |
| t_two_letters | 5 | It's two letters, but it's one sound. |
| tv_here_sound | 5 | Here's the sound... |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| t_in | 4 | ...in... |
| audit_gem_more | 4 | Look, this gem has filled a little more. |
| st_know_this_sound | 4 | Ooh, you already know this sound! |
| tv_swap_now_change | 4 | Now let's change it to... |
| tv_swap_both | 4 | Listen to them both... |
| st_what_change | 4 | What do we need to change? |
| tv_swap_pick | 4 | Now tap the new one. |
| st_first_changes | 4 | Yes, the first sound changes! |
| tv_which_changes | 4 | Which sound changes? |
| st_last_changes | 4 | Yes, the last sound changes! |
| tv_learn_first_short | 3 | Here's the first new sound... |
| tv_petal_say | 3 | Tap the petal, and say it with me. |
| tv_how_we_write | 3 | This is how we write... |
| tv_tap_letter_say | 3 | Now you tap it, and say the sound. |
| tv_said_well | 3 | Good, you said that sound really well. |
| tv_learn_next | 3 | Here's the next new sound... |
| tv_petal_say_short | 3 | Tap its petal, and say it. |
| tv_tap_it_say_short | 3 | Now you tap it, and say it. |
| tv_learn_last | 3 | Here's the last new sound... |
| tv_ne_new_sounds | 3 | Now let's play Ninja Eyes, with your new sounds. |
| tv_find_write | 3 | Find how we write... |
| tv_build_dojo | 3 | Now let's build some words with your new sounds. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (9)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @98.1s and @100.4s |
| t_in | 2 | ...in... | world flower @273.9s and @277.3s |
| tv_which_changes | 2 | Which sound changes? | level w5-4 @667.9s and @678.5s |
| tv_run_which | 1 | Tap the lantern with my word. | level w5-5 @736.0s and @750.9s |
| t_ways_2 | 1 | Now you know two ways to spell... | world flower @1078.7s and @1093.1s |

### Spliced utterances: 83 of 408 (20%); chains of 5+ clips: 60

Commonest spliced shapes:

- ×4 ‹tv_next_word› + W
- ×3 /X/ + ‹tv_learn_last› + /X/
- ×3 ‹tv_battle_again› + ‹tv_your_word› + W
- ×3 /X/ + /X/ + /X/ + W + ‹tv_your_word› + W
- ×2 ‹tv_learn_short_four› + ‹tv_learn_first_short› + /X/
- ×2 /X/ + ‹tv_learn_another› + /X/
- ×2 ‹tv_which_write› + /X/
- ×2 ‹tv_now_find› + /X/
- ×2 /X/ + ‹t_in› + W + ‹t_and_sometimes› + /X/ + ‹t_in› + W
- ×2 ‹tv_fs_say_slow› + /X/ + /X/ + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×2 /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×2 W + ‹tv_show_offer_short› + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/

Longest chains:

- level w5-4 @646.9s (10 clips): /ch/ /i/ /k/ "chick" Now let's change it to... "kick" Listen to them both... "chick" (slowly) "kick" (slowly) What do we need to change?
- level w5-8 @1220.0s (10 clips): /s/ /o/ /k/ "sock" Now let's change it to... "song" Listen to them both... "sock" (slowly) "song" (slowly) What do we need to change?
- level w5-1 @159.5s (9 clips): /s/ Let's say it the slow way... "kiss" (slowly) And now, fast... "kiss" It's two letters, but it's one sound. /s/ Here's your next word... "shop"
- level w5-6 @989.9s (9 clips): /s/ /k/ /w/ /i/ /d/ "squid" Super! Your word is... "rock"
- level w5-1 @178.8s (8 clips): Say the sounds, and read the word. /sh/ /o/ /p/ "shop" You said it slowly, and found every sound. Your word is... "much"
- level w5-4 @628.5s (8 clips): "check" If you'd like to see me do one first, tap my paw. Now let's change it to... "chick" Listen to them both... "check" (slowly) "chick" (slowly) What do we need to change?
- level w5-8 @1201.3s (8 clips): "lock" If you'd like to see me do one first, tap my paw. Now let's change it to... "sock" Listen to them both... "lock" (slowly) "sock" (slowly) What do we need to change?
- level w5-1 @39.8s (7 clips): /ch/ Now watch my ninja write it. And this is how we write... /ch/ This one's two letters too, but it's just one sound. Now you tap it, and say it. /ch/

### Praise: 17 lines (0.6 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 28

- level w5-1 @18.3s: "Tap the petal, and say it with me." cut after 1.8 of 2.5 s by /sh/
- level w5-1 @28.4s: "Now you tap it, and say the sound." cut after 1.8 of 2.5 s by /sh/
- level w5-1 @31.4s: "Tap it once more, and say it again." cut after 0.1 of 2.5 s by /sh/
- level w5-1 @37.9s: "Tap its petal, and say it." cut after 1.9 of 2.4 s by /ch/
- level w5-1 @47.8s: "Now you tap it, and say it." cut after 1.4 of 2.1 s by /ch/
- level w5-1 @98.1s: "Which of these is the way we write..." cut after 1.5 of 2.7 s by /sh/
- level w5-1 @100.4s: "Which of these is the way we write..." cut after 1.8 of 2.7 s by /ch/
- level w5-1 @106.8s: "Now find how we write..." cut after 0.5 of 2.1 s by /dh/
- level w5-1 @113.6s: "What's the first sound?" cut after 1.3 of 1.6 s by /ch/
- level w5-3 @421.8s: "Tap the petal, and say it with me." cut after 1.6 of 2.5 s by /k/
- level w5-3 @431.5s: "Now you tap it, and say the sound." cut after 1.5 of 2.5 s by /k/
- level w5-3 @441.1s: "Tap its petal, and say it." cut after 1.5 of 2.4 s by /ng/
- level w5-3 @451.2s: "Now you tap it, and say it." cut after 1.6 of 2.1 s by /ng/
- level w5-3 @480.5s: "Which of these is the way we write..." cut after 1.7 of 2.7 s by /k/
- level w5-3 @482.3s: "Which of these is the way we write..." cut after 1.9 of 2.7 s by /ng/
- level w5-3 @496.3s: "What's the next sound?" cut after 1.0 of 1.3 s by /i/
- level w5-4 @640.2s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the middle sound changes!
- level w5-4 @655.9s: "What do we need to change?" cut after 1.5 of 1.8 s by Yes, the first sound changes!
- level w5-4 @678.5s: "Which sound changes?" cut after 1.0 of 1.9 s by Yes, the first sound changes!
- level w5-6 @842.5s: "Now you tap it, and say the sound." cut after 2.2 of 2.5 s by /k/
- level w5-6 @856.0s: "Tap its petal, and say it." cut after 1.6 of 2.4 s by /w/
- level w5-6 @863.4s: "Now you tap it, and say it." cut after 1.6 of 2.1 s by /w/
- level w5-6 @910.8s: "Which of these is the way we write..." cut after 2.4 of 2.7 s by /k/
- level w5-6 @913.3s: "Which of these is the way we write..." cut after 2.0 of 2.7 s by /w/
- level w5-6 @917.5s: "Find how we write..." cut after 0.4 of 1.5 s by Keep going, ninja.

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 5 | level w5-1 ×2, level w5-3, level w5-6, level w5-9 |
| audit_gem_more "Look, this gem has filled a little more." | 4 | reward ×4 |
| t_another_way "This is another way to spell the sound..." | 3 | level w5-3, level w5-6 ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |

## playtest/fix/V-script/transcripts/continuous-learner-from-w5-1.json (learner-from-w5-1, one continuous page)

424 Sensei lines, 705 sounds and words, 481 utterances in 55 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_fs_stuck_slow | 22 | Let's say it the slow way first... |
| next_sound_q | 19 | What's the next sound? |
| first_sound_q | 14 | What's the first sound? |
| last_sound_q | 14 | What's the last sound? |
| tv_your_word | 13 | Your word is... |
| tv_listen_here | 13 | Let's listen again. What can you hear here? |
| say_sounds_read | 13 | Say the sounds, and read the word. |
| tv_next_word | 10 | Here's your next word... |
| audit_listen_next | 8 | Let's listen again. What sound comes next? |
| tv_praise_kept_going | 7 | That was a tricky one, and you kept going. |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| wf_found_gem | 6 | You found a new gem! It's a spelling of the sound... |
| tv_swap_now_change | 6 | Now let's change it to... |
| tv_swap_both | 6 | Listen to them both... |
| st_what_change | 6 | What do we need to change? |
| tv_swap_pick | 6 | Now tap the new one. |
| streak_3 | 5 | Ninja power! |
| streak_lost | 5 | Keep going, ninja. |
| tv_here_sound | 5 | Here's the sound... |
| st_first_changes | 5 | Yes, the first sound changes! |
| t_two_letters | 4 | It's two letters, but it's one sound. |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| we_need | 4 | We need... |
| t_in | 4 | ...in... |
| st_know_this_sound | 4 | Ooh, you already know this sound! |
| st_last_changes | 4 | Yes, the last sound changes! |
| tv_which_changes | 4 | Which sound changes? |
| tv_learn_first_short | 3 | Here's the first new sound... |
| tv_petal_say | 3 | Tap the petal, and say it with me. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (13)

| Line | Repeats | Text | Example |
|---|---|---|---|
| next_sound_q | 6 | What's the next sound? | level w5-1 @171.8s and @175.1s |
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @108.9s and @117.1s |
| t_in | 2 | ...in... | world flower @341.6s and @344.9s |
| tv_which_changes | 2 | Which sound changes? | level w5-4 @900.2s and @911.2s |

### Spliced utterances: 105 of 481 (22%); chains of 5+ clips: 66

Commonest spliced shapes:

- ×10 ‹tv_fs_stuck_slow› + W + /X/
- ×4 ‹tv_next_word› + W
- ×3 /X/ + ‹tv_learn_last› + /X/
- ×3 ‹tv_battle_again› + ‹tv_your_word› + W
- ×3 ‹tv_fs_stuck_slow› + W
- ×3 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 ‹tv_learn_short_four› + ‹tv_learn_first_short› + /X/
- ×2 /X/ + ‹tv_learn_another› + /X/
- ×2 ‹tv_which_write› + /X/ + /X/
- ×2 ‹tv_find_write› + /X/
- ×2 ‹tv_now_find› + /X/
- ×2 ‹streak_lost› + ‹tv_fs_stuck_slow› + W + /X/
- ×2 ‹tv_to_reward› + ‹tv_won_four› + /X/ + /X/ + /X/ + /X/
- ×2 /X/ + ‹t_in› + W + ‹t_and_sometimes› + /X/ + ‹t_in› + W
- ×2 ‹tv_thats_write› + /X/

Longest chains:

- level w5-3 @701.5s (11 clips): /ng/ Say the sounds, and read the word. /s/ /w/ /i/ /ng/ "swing" Well done. Here's your next word... "lid" What's the first sound?
- level w5-4 @874.5s (11 clips): /s/ /o/ /k/ "sock" Ninja power! Now let's change it to... "song" Listen to them both... "sock" (slowly) "song" (slowly) What do we need to change?
- level w5-1 @185.2s (10 clips): Say the sounds, and read the word. /ch/ /i/ /m/ /p/ "chimp" You said it slowly, and found every sound. Your word is... "soft" What's the first sound?
- level w5-4 @932.6s (10 clips): /l/ /o/ /k/ "lock" Ninja power! Now let's change it to... "rock" "lock" (slowly) "rock" (slowly) What do we need to change?
- level w5-6 @1231.0s (10 clips): Say the sounds, and read the word. /m/ /u/ /n/ /ch/ "munch" Wow, great listening! Here's your next word... "give" What's the first sound?
- level w5-8 @1611.1s (10 clips): /m/ /a/ /ch/ "match" Now let's change it to... "man" Listen to them both... "match" (slowly) "man" (slowly) What do we need to change?
- level w5-8 @1669.1s (10 clips): /f/ /i/ /n/ "fin" Now let's change it to... "fish" Listen to them both... "fin" (slowly) "fish" (slowly) What do we need to change?
- level w5-1 @215.4s (9 clips): Say the sounds, and read the word. /s/ /o/ /f/ /t/ "soft" Here's your next word... "shed" What's the first sound?

### Praise: 15 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 12

- level w5-1 @34.2s: "Tap it once more, and say it again." cut after 0.1 of 2.5 s by /sh/
- level w5-1 @111.5s: "/sh/" cut after 0.1 of 0.8 s by That's how we write...
- level w5-1 @125.6s: "Now find how we write..." cut after 0.6 of 2.1 s by /dh/
- level w5-4 @866.5s: "What do we need to change?" cut after 1.1 of 1.8 s by Yes, the first sound changes!
- level w5-4 @886.7s: "What do we need to change?" cut after 1.1 of 1.8 s by Yes, the last sound changes!
- level w5-4 @911.2s: "Which sound changes?" cut after 1.1 of 1.9 s by Yes, the first sound changes!
- level w5-4 @924.4s: "Which sound needs to change?" cut after 0.7 of 1.8 s by Yes, the last sound changes!
- level w5-4 @942.9s: "What do we need to change?" cut after 1.3 of 1.8 s by Yes, the first sound changes!
- level w5-8 @1621.9s: "What do we need to change?" cut after 1.5 of 1.8 s by Yes, the last sound changes!
- level w5-8 @1664.8s: "Which sound needs to change?" cut after 0.4 of 1.8 s by Yes, the middle sound changes!
- level w5-8 @1681.1s: "What do we need to change?" cut after 1.3 of 1.8 s by Yes, the last sound changes!
- level w6-br1 @2311.3s: ""desk"" cut after 0.5 of 0.8 s by /d/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 4 | level w5-1, level w5-2, level w5-3, level w5-6 |
| audit_gem_more "Look, this gem has filled a little more." | 3 | reward ×3 |
| t_another_way "This is another way to spell the sound..." | 3 | level w5-3, level w5-6 ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |

## playtest/fix/V-script/transcripts/continuous-perfect-from-w6-br1.json (perfect-from-w6-br1, one continuous page)

299 Sensei lines, 585 sounds and words, 351 utterances in 59 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_your_word | 13 | Your word is... |
| tv_here_sound | 10 | Here's the sound... |
| tv_next_word | 9 | Here's your next word... |
| tv_watch_write | 8 | Now watch my ninja write it. |
| tv_which_write | 8 | Which of these is the way we write... |
| t_two_letters | 6 | It's two letters, but it's one sound. |
| help_sort | 6 | Tap the chest with the same spelling as the word. |
| tv_praise_sorted | 6 | That's the right chest. |
| tv_sort_done | 6 | Same sound, different spellings. You sorted them all. |
| next_sound_q | 6 | What's the next sound? |
| audit_sort_again | 5 | Sorting time! Same sound, different spellings. |
| audit_sort_pair | 5 | This sound can be spelt in two ways. |
| gem_ready | 5 | A gem is glowing! It's ready for a gem battle. |
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

### Echoes: the same utterance shape back to back (2)

- level w6-3 @600.9s ×2: What's the next sound? /r/ ‖ What's the next sound? /ee/
- level w6-ec11 @1389.2s ×2: What's the next sound? /e/ ‖ What's the next sound? /s/

### Near repeats: the same line again within 15 s (8)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w6-1 @277.0s and @279.1s |
| next_sound_q | 2 | What's the next sound? | level w6-3 @600.9s and @603.1s |
| tv_guess_q | 1 | Listen for the word... | level w6-9 @1594.3s and @1607.6s |
| tv_run_which | 1 | Tap the lantern with my word. | level w6-9 @1598.3s and @1611.4s |

### Spliced utterances: 68 of 351 (19%); chains of 5+ clips: 62

Commonest spliced shapes:

- ×3 ‹tv_learn_short_two› + ‹tv_learn_first_short› + /X/
- ×3 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×3 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/
- ×3 /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×2 ‹tv_which_write› + /X/
- ×2 ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q› + /X/
- ×2 ‹tv_to_reward› + ‹tv_won_one› + /X/
- ×2 ‹tv_ne_new_sounds› + ‹tv_which_write› + /X/
- ×2 /X/ + /X/ + /X/ + W + ‹tv_next_word› + W
- ×1 ‹tv_here_sound› + /X/ + ‹audit_bridging_first› + ‹tv_sort_frame› + ‹tv_sort_open›
- ×1 ‹t_two_letters› + /X/ + ‹tv_sort_ido› + W + ‹tv_sort_see› + ‹tv_sort_so› + ‹tv_ready_yours›
- ×1 ‹audit_sort_again› + ‹tv_here_sound› + /X/ + ‹audit_sort_pair› + ‹tg_ch_ch_way› + ‹st_two_letters_too› + /X/ + ‹tv_spelt_like_this_match›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + /X/
- ×1 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + /X/ + ‹tv_fs_rabbit_read›

Longest chains:

- level w6-6 @1116.6s (10 clips): /n/ /t/ /r/ /ae/ /n/ "train" You built that whole word by yourself! Your word is... "neck" /n/
- level w6-1 @319.7s (9 clips): Say the sounds, and read the word. /p/ /ae/ /n/ /t/ "paint" You said it slowly, and found every sound. Your word is... "say"
- level w6-1 @353.2s (9 clips): Say the sounds, and read the word. /s/ /n/ /u/ /g/ "snug" That's it! Your word is... "tray"
- level w6-br2 @133.6s (8 clips): Sorting time! Same sound, different spellings. Here's the sound... /ch/ This sound can be spelt in two ways. This is the way we spell it in chick. This one's two letters too, but it's just one sound. /ch/ In match, it's spelt like this.
- level w6-3 @630.5s (8 clips): /b/ /o/ /s/ "boss" It's two letters, but it's one sound. /s/ Here's your next word... "feet"
- level w6-ec11 @1316.8s (8 clips): /ie/ You can hear it in... "light" "night" ...and... "high" Tap the petal, and say it with me. /ie/
- level w6-ec11 @1395.7s (8 clips): Ninja power! /t/ /e/ /s/ /t/ "test" Here's your next word... "leaf"
- level w6-br1 @34.4s (7 clips): It's two letters, but it's one sound. /k/ I'll sort the first one. My word is... "pick" I can see this spelling at the end. So it goes in this chest. Now you do one. Are you ready?

### Praise: 11 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 1

- level w6-6 @1016.6s: 83.9 s silent (0 taps) after "Take your time, ninja.", before "/g/"

### Cut-off clips: 28

- level w6-br2 @170.5s: ""chest"" cut after 0.2 of 0.8 s by /ch/
- level w6-br2 @198.6s: ""lunch"" cut after 0.1 of 0.7 s by /l/
- level w6-1 @228.6s: "Tap the petal, and say it with me." cut after 1.9 of 2.5 s by /ae/
- level w6-1 @238.1s: "Now you tap it, and say the sound." cut after 1.8 of 2.5 s by /ae/
- level w6-1 @240.8s: "Tap it once more, and say it again." cut after 0.4 of 2.5 s by /ae/
- level w6-1 @250.9s: "Tap its petal, and say it." cut after 1.7 of 2.4 s by /ae/
- level w6-1 @261.6s: "Now you tap it, and say it." cut after 1.8 of 2.1 s by /ae/
- level w6-1 @277.0s: "Which of these is the way we write..." cut after 1.7 of 2.7 s by /ae/
- level w6-1 @279.1s: "Which of these is the way we write..." cut after 1.5 of 2.7 s by /ae/
- level w6-1 @290.9s: "What's the next sound?" cut after 0.8 of 1.3 s by /ae/
- level w6-3 @542.6s: "Tap the petal, and say it with me." cut after 1.5 of 2.5 s by /ee/
- level w6-3 @552.1s: "Now you tap it, and say the sound." cut after 1.6 of 2.5 s by /ee/
- level w6-3 @565.3s: "Tap its petal, and say it." cut after 1.4 of 2.4 s by /ee/
- level w6-3 @576.1s: "Now you tap it, and say it." cut after 1.4 of 2.1 s by /ee/
- level w6-3 @587.7s: "Which of these is the way we write..." cut after 1.5 of 2.7 s by /ee/
- level w6-3 @589.8s: "Which of these is the way we write..." cut after 1.6 of 2.7 s by /ee/
- level w6-3 @605.4s: "What's the last sound?" cut after 1.1 of 1.5 s by /m/
- level w6-6 @924.4s: "Tap the petal, and say it with me." cut after 2.2 of 2.5 s by /oe/
- level w6-6 @934.4s: "Now you tap it, and say the sound." cut after 2.1 of 2.5 s by /oe/
- level w6-6 @947.7s: "Tap its petal, and say it." cut after 1.6 of 2.4 s by /oe/
- level w6-6 @974.3s: "Which of these is the way we write..." cut after 2.2 of 2.7 s by /oe/
- level w6-ec11 @1322.4s: "Tap the petal, and say it with me." cut after 1.9 of 2.5 s by /ie/
- level w6-ec11 @1332.6s: "Now you tap it, and say the sound." cut after 1.5 of 2.5 s by /ie/
- level w6-ec11 @1345.9s: "Tap its petal, and say it." cut after 1.6 of 2.4 s by /ie/
- level w6-ec11 @1368.9s: "Which of these is the way we write..." cut after 1.6 of 2.7 s by /ie/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 6 | level w6-br1, level w6-1, level w6-3 ×2, level w6-6, level w6-ec11 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| t_another_way "This is another way to spell the sound..." | 4 | level w6-1, level w6-3, level w6-6, level w6-ec11 |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w6-br1 |
| audit_gem_more "Look, this gem has filled a little more." | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w6-ec11 |

## playtest/fix/V-script/transcripts/continuous-learner-from-w6-br1.json (learner-from-w6-br1, one continuous page)

390 Sensei lines, 616 sounds and words, 418 utterances in 59 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 17 | What's the first sound? |
| next_sound_q | 17 | What's the next sound? |
| last_sound_q | 17 | What's the last sound? |
| say_sounds_read | 17 | Say the sounds, and read the word. |
| tv_fs_stuck_slow | 14 | Let's say it the slow way first... |
| tv_your_word | 13 | Your word is... |
| tv_here_sound | 10 | Here's the sound... |
| tv_next_word | 9 | Here's your next word... |
| tv_watch_write | 8 | Now watch my ninja write it. |
| tv_which_write | 8 | Which of these is the way we write... |
| tv_listen_here | 8 | Let's listen again. What can you hear here? |
| streak_lost | 7 | Keep going, ninja. |
| t_two_letters | 6 | It's two letters, but it's one sound. |
| help_sort | 6 | Tap the chest with the same spelling as the word. |
| streak_3 | 6 | Ninja power! |
| tv_praise_sorted | 6 | That's the right chest. |
| tv_sort_done | 6 | Same sound, different spellings. You sorted them all. |
| audit_gem_more | 5 | Look, this gem has filled a little more. |
| audit_sort_again | 5 | Sorting time! Same sound, different spellings. |
| audit_sort_pair | 5 | This sound can be spelt in two ways. |
| tv_praise_kept_going | 5 | That was a tricky one, and you kept going. |
| streak_6 | 4 | Wow! Super ninja streak! |
| tv_learn_short_two | 4 | Back to the dojo. Today there are two new sounds. |
| tv_learn_first_short | 4 | Here's the first new sound... |
| tv_petal_say | 4 | Tap the petal, and say it with me. |
| tv_how_we_write | 4 | This is how we write... |
| st_two_letters_too | 4 | This one's two letters too, but it's just one sound. |
| tv_tap_letter_say | 4 | Now you tap it, and say the sound. |
| tv_said_well | 4 | Good, you said that sound really well. |
| tv_learn_next | 4 | Here's the next new sound... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (8)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w6-1 @308.2s and @311.5s |
| next_sound_q | 4 | What's the next sound? | level w6-1 @330.7s and @334.1s |

### Spliced utterances: 76 of 418 (18%); chains of 5+ clips: 65

Commonest spliced shapes:

- ×5 ‹tv_fs_stuck_slow› + W + /X/
- ×4 ‹tv_learn_short_two› + ‹tv_learn_first_short› + /X/
- ×3 ‹tv_which_write› + /X/ + /X/
- ×2 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹t_two_letters› + ‹tv_tap_it_say_short›
- ×2 ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 ‹tv_fs_stuck_slow› + W
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_praise_kept_going› + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 ‹tv_to_reward› + ‹tv_won_one› + /X/
- ×2 /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×2 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×2 ‹tv_learn_all_two› + ‹tv_ne_new_sounds› + ‹tv_which_write› + /X/ + /X/
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_next_word› + W + ‹first_sound_q›
- ×1 ‹tv_here_sound› + /X/ + ‹audit_bridging_first› + ‹tv_sort_frame› + ‹tv_sort_open›
- ×1 ‹t_two_letters› + /X/ + ‹tv_sort_ido› + W + ‹tv_sort_see› + ‹tv_sort_so› + ‹tv_ready_yours›
- ×1 ‹audit_sort_again› + ‹tv_here_sound› + /X/ + ‹audit_sort_pair› + ‹tg_ch_ch_way› + ‹t_two_letters› + /X/ + ‹tv_spelt_like_this_match›

Longest chains:

- level w6-ec11 @1819.2s (11 clips): Say the sounds, and read the word. /f/ /o/ /ks/ "fox" This spelling is two sounds together! /k/ /s/ Here's your next word... "play" What's the first sound?
- level w6-3 @855.3s (10 clips): Say the sounds, and read the word. /f/ /l/ /i/ /p/ "flip" That was a tricky one, and you kept going. Your word is... "leaf" What's the first sound?
- level w6-3 @911.8s (10 clips): Say the sounds, and read the word. /d/ /r/ /ee/ /m/ "dream" Well done. Your word is... "sea" What's the first sound?
- level w6-6 @1389.6s (10 clips): Say the sounds, and read the word. /k/ /oe/ /t/ "coat" That's it! Here's your next word... "tray" What's the first sound? /t/
- level w6-1 @394.7s (9 clips): Say the sounds, and read the word. /s/ /p/ /r/ /ae/ "spray" Here's your next word... "stay" What's the first sound?
- level w6-1 @417.0s (9 clips): Say the sounds, and read the word. /s/ /t/ /ae/ "stay" That was a tricky one, and you kept going. Your word is... "hit" What's the first sound?
- level w6-6 @1332.8s (9 clips): Say the sounds, and read the word. /r/ /oe/ /d/ "road" That was a tricky one, and you kept going. Here's your next word... "skid" What's the first sound?
- level w6-6 @1366.6s (9 clips): Say the sounds, and read the word. /s/ /k/ /i/ /d/ "skid" Your word is... "coat" What's the first sound?

### Praise: 16 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 2

- level w6-3 @727.6s: 84.7 s silent (0 taps) after "Take your time, ninja.", before "Keep going, ninja."
- level w6-ec11 @1721.9s: 85.0 s silent (1 taps) after "Take your time, ninja.", before "/f/ What's the next sound?"

### Cut-off clips: 9

- level w6-br1 @71.8s: ""thick"" cut after 0.4 of 0.7 s by /th/
- level w6-1 @269.8s: "Tap it once more, and say it again." cut after 0.4 of 2.5 s by /ae/
- level w6-1 @344.3s: "/n/" cut after 0.5 of 0.9 s by Let's say the sounds, the slow way...
- level w6-1 @361.3s: "What's the first sound?" cut after 0.0 of 1.6 s by /s/
- level w6-2 @559.1s: ""snail"" cut after 0.3 of 0.9 s by /s/
- level w6-6 @1397.9s: "What's the first sound?" cut after 0.6 of 1.6 s by /t/
- level w6-ec11 @1616.0s: "Tap the petal, and say it with me." cut after 0.1 of 2.5 s by /ie/
- level w6-ec11 @1668.2s: "/ie/" cut after 0.3 of 0.7 s by /ie/
- level w6-7 @1999.0s: ""night"" cut after 0.3 of 0.6 s by /n/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 6 | level w6-br1, level w6-br2, level w6-1, level w6-3, level w6-5, level w6-ec11 |
| audit_gem_more "Look, this gem has filled a little more." | 5 | reward ×5 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| t_another_way "This is another way to spell the sound..." | 4 | level w6-1, level w6-3, level w6-6, level w6-ec11 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w6-br1 |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w6-ec11 |
| t_one_spelling_two_sounds "This spelling is two sounds together!" | 1 | level w6-ec11 |

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

## playtest/fix/V-script/transcripts/continuous-watcher.json (watcher, one continuous page)

784 Sensei lines, 774 sounds and words, 621 utterances in 94 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 15 | What's the first sound? |
| tv_show_again | 13 | Of course. Watch my paw again. |
| tv_ready_now | 13 | Are you ready to have a go now? |
| last_sound_q | 13 | What's the last sound? |
| tv_your_word | 12 | Your word is... |
| tv_here_sound | 11 | Here's the sound... |
| tv_let_me_listen | 10 | Hmm, let me listen. |
| first_q | 9 | Which one starts with... |
| tv_next_word | 9 | Here's your next word... |
| tv_tap_it_say | 8 | Now you tap it, and say the sound. |
| tv_by_yourself | 8 | Now you do one all by yourself. |
| tv_which_write | 8 | Which of these is the way we write... |
| tv_so_i_tap | 7 | So I'll tap it. |
| tv_watch_write | 7 | Now watch my ninja write it. |
| tv_how_we_write | 7 | This is how we write... |
| yay_4 | 7 | Well done. |
| tv_petal_say | 7 | Tap the petal, and say it with me. |
| st_first_q2 | 6 | Which picture starts with... |
| tv_to_flower | 6 | Let's take your new sounds to the World Flower. Tap the green arrow. |
| tv_fs_say_slow | 6 | Let's say it the slow way... |
| tv_fs_now_fast | 6 | And now, fast... |
| next_sound_q | 6 | What's the next sound? |
| tv_swap_now_change | 6 | Now let's change it to... |
| st_what_change | 6 | What do we need to change? |
| st_middle_changes | 6 | Yes, the middle sound changes! |
| tv_which_changes | 6 | Which sound changes? |
| tv_pocket_ido | 5 | I'll find one first. |
| tv_and_how_we_write | 5 | And this is how we write... |
| tv_together | 5 | Let's do this one together. |
| tv_our_word | 5 | Here's our word... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (36)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w1-2 @947.2s and @953.8s |
| first_sound_q | 4 | What's the first sound? | level w1-7 @1662.1s and @1675.9s |
| tv_pocket_ido | 2 | I'll find one first. | level (first minutes) @252.8s and @265.9s |
| tv_so_pocket | 2 | So into the pocket it goes! | level (first minutes) @256.8s and @269.9s |
| last_sound_q | 2 | What's the last sound? | level w1-10 @2160.2s and @2174.5s |
| tv_which_changes | 2 | Which sound changes? | level w1-12 @2423.4s and @2433.3s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @124.5s and @132.5s |
| tv_ts_fast | 1 | The rabbit says words fast... | level (first minutes) @171.2s and @185.0s |
| tv_ts_slow | 1 | The tortoise says them slowly... | level (first minutes) @173.7s and @187.5s |
| fs_sun | 1 | Sun starts with... | level (first minutes) @254.1s and @267.2s |
| tv_rail_ido | 1 | I'll read them first. Then you read them. | level (first minutes) @337.0s and @350.0s |
| fm_read_fish_dog | 1 | Fish... dog. Fish dog! | level (first minutes) @339.6s and @352.4s |
| tv_which_demo | 1 | I'll go first. Fish... dog. | level (first minutes) @382.6s and @396.4s |
| tv_which_so | 1 | Fish came first. So I tap this row. | level (first minutes) @386.0s and @399.7s |
| tv_slow_demo | 1 | Here's my slow word... | level w1-wu3 @555.9s and @568.4s |
| tv_i_hear_mug | 1 | I can hear mug! | level w1-wu3 @559.2s and @571.8s |
| tv_hear_middle | 1 | I can hear it in the middle. | level w1-wu3 @617.2s and @631.0s |
| fs_ant | 1 | Ant starts with... | level w1-3 @1063.0s and @1074.5s |
| next_sound_q | 1 | What's the next sound? | level w1-11 @2297.7s and @2310.0s |
| swap_which | 1 | Which sound needs to change? | level w1-12 @2443.0s and @2452.1s |
| tv_swap_now_change | 1 | Now let's change it to... | level w1-12 @2460.6s and @2470.6s |
| st_what_change | 1 | What do we need to change? | level w1-12 @2481.2s and @2489.9s |
| tv_watch_write | 1 | Now watch my ninja write it. | level w2-1 @2917.6s and @2932.1s |
| tv_here_sound | 1 | Here's the sound... | world flower @3096.9s and @3103.1s |
| tv_guess_q | 1 | Listen for the word... | level w2-3 @3191.8s and @3203.6s |

### Spliced utterances: 170 of 621 (27%); chains of 5+ clips: 104

Commonest spliced shapes:

- ×5 ‹tv_your_word› + W
- ×3 ‹tv_next_word› + W
- ×2 ‹fs_sun› + /X/
- ×2 ‹tv_next_sound› + /X/ + ‹tv_petal_say› + /X/
- ×2 ‹tv_mix_up› + ‹first_q› + /X/
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 /X/ + ‹tv_praise_write› + ‹tv_which_write› + /X/
- ×2 ‹tv_our_word› + W + ‹first_sound_q›
- ×2 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×2 ‹tv_our_word› + W
- ×2 W + ‹tv_first_is› + /X/
- ×2 ‹tv_fs_slow_tortoise› + /X/ + /X/ + /X/ + ‹tv_fs_fast_rabbit› + W
- ×2 ‹kai_says› + W + ‹suki_says› + W + ‹read_who›
- ×2 /X/ + ‹tv_swap_in›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›

Longest chains:

- level w1-8 @1849.5s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-12 @2401.6s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "pit" Listen to them both... "sit" (slowly) "pit" (slowly) What do we need to change?
- level w1-5 @1409.5s (9 clips): Let's say it the slow way... /s/ /a/ /t/ And now, fast... "sat" Here's your next word... "mat" What's the first sound?
- level (first minutes) @167.4s (8 clips): "sock" Here are my friends, the rabbit and the tortoise. The rabbit says words fast... "sun" The tortoise says them slowly... "sun" (slowly) Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again. Of course. Watch my paw again.
- level w1-10 @2083.1s (8 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it.
- level w1-12 @2382.6s (8 clips): "sat" If you'd like to see me do one first, tap my paw. Now let's change it to... "sit" Listen to them both... "sat" (slowly) "sit" (slowly) What do we need to change?
- level w1-2 @801.9s (7 clips): I'll go first. Here's a map and a hat. Hmm, let me listen. "map" (held) Map starts with... /m/ So I'll tap it. Let's do the next one together. Are you ready?
- level w1-2 @819.6s (7 clips): I'll go first. Here's a map and a hat. Hmm, let me listen. "map" (held) Map starts with... /m/ So I'll tap it. Are you ready to have a go now?

### Praise: 26 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 53

- intro film @8.3s: "When you're ready to see what happens next, tap the green arrow." cut after 1.9 of 3.8 s by Every petal was a sound. With sounds, we could tal
- choose @63.0s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.8 of 3.6 s by Great choice!
- opt-in @93.7s: "Now come with me to the dojo. Tap the green arrow." cut after 1.5 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @103.5s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 1.7 of 4.5 s by Bong! That's your first star.
- dojo welcome @143.4s: "It's a listening game, called Ninja Ears. Tap the green arrow when you" cut after 3.6 of 4.8 s by I'll say a word. Then you find its picture.
- level (first minutes) @177.7s: "Do you want to have a go now? Tap the green arrow. Or tap my paw to se" cut after 4.6 of 6.1 s by Of course. Watch my paw again.
- level (first minutes) @360.2s: "Tap each picture, starting on this side." cut after 2.0 of 2.7 s by "fish"
- level (first minutes) @376.2s: "When you're ready for the next game, tap the green arrow." cut after 2.4 of 3.3 s by Here are two rows of pictures. I'll read one, and 
- level w1-wu6 @747.8s: "Now tap the rabbit, and say it fast." cut after 1.8 of 2.4 s by "cat"
- level w1-2 @798.8s: "Tap its petal, and say it." cut after 1.9 of 2.4 s by /m/
- level w1-2 @849.4s: "Now you tap it, and say the sound." cut after 1.5 of 2.5 s by /m/
- level w1-2 @870.9s: "Tap its petal, and say it." cut after 1.5 of 2.4 s by /s/
- level w1-2 @900.7s: "Now you tap it, and say the sound." cut after 2.0 of 2.5 s by /s/
- level w1-3 @1053.5s: "Tap its petal, and say it." cut after 1.6 of 2.4 s by /a/
- level w1-3 @1080.7s: "Now you tap it, and say the sound." cut after 2.1 of 2.5 s by /a/
- level w1-3 @1098.4s: "Tap the petal, and say it with me." cut after 1.8 of 2.5 s by /t/
- level w1-4 @1221.6s: "This card is my word. Tap it, and hear the word." cut after 1.5 of 3.6 s by "am"
- level w1-4 @1330.3s: "First, you read it. Tap each sound, and say it with me." cut after 0.0 of 4.3 s by /a/
- level w1-6 @1475.1s: "I'll zap the first one. Tap my word card, and hear the word." cut after 2.3 of 4.0 s by "at"
- level w1-6 @1489.1s: "That's how we spell a word. Now you spell one. Are you ready to zap it" cut after 4.4 of 5.1 s by Of course. Watch my paw again.
- level w1-7 @1588.1s: "Tap the petal, and say it with me." cut after 1.8 of 2.5 s by /i/
- level w1-7 @1636.1s: "Now you tap it, and say the sound." cut after 2.2 of 2.5 s by /i/
- level w1-8 @1843.1s: "What do we need to change?" cut after 1.3 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1860.1s: "What do we need to change?" cut after 1.3 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1889.6s: "Which sound changes?" cut after 1.2 of 1.9 s by Yes, the last sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 3 | reward ×3 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| audit_left_right "We start here, and go this way." | 1 | level w2-1 |
| audit_gem_more "Look, this gem has filled a little more." | 1 | reward |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C-P: playtest/fix/V-script/transcripts/continuous-perfect.json

perfect, a brand-new child, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 0 (day one) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 3 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 8 (0 repeats) | pass |
| `swap-place-heard` swap place lines heard to the end | all | 5 of 5 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.83 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 18 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 12.3 s (compound w1-wu2); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 17 words (median line 5 words; 149 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 17 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 11 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 6 of 6 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 61 of 61, rabbit 40 of 40 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 7 of 7 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.5 s (run w1-9); 0 over | pass |

- **talk-before-action**: compound (w1-wu2) 12.3 s from ‹tv_squish_frame› "Here's a new game, called Word Squish." to ‹tv_squish_ready› "Two little words make one big word. Now you make one. Are you ready?"

### C-L: playtest/fix/V-script/transcripts/continuous-learner.json

learner, a brand-new child, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 0 (day one) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 3 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 8 (0 repeats) | pass |
| `swap-place-heard` swap place lines heard to the end | all | 5 of 5 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.95 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 18 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 13.3 s (compound w1-wu2); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 5 words; 176 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 17 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 11 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 5 of 5 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 70 of 70, rabbit 43 of 43 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 7 of 7 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.8 s (run w1-9); 0 over | pass |

- **talk-before-action**: compound (w1-wu2) 13.3 s from ‹fm_pair_cat_dog› "Cat dog!" to ‹tv_squish_ready› "Two little words make one big word. Now you make one. Are you ready?"

### C5-P: playtest/fix/V-script/transcripts/continuous-perfect-from-w5-1.json

perfect, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 8 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_6 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 10 of 10 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.11 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 1 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 3 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.3 s (sort w6-br1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 6 words; 120 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 4 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 1 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 1 a level, 1 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 1 of 1 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 65 of 65, rabbit 57 of 57 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 10.6 s (build w5-1); 0 over | pass |

- **praise-stacks**: w5-6 @15:16.2: "Well done." → "Keep going, ninja."
- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @4:06.6; ‹tv_your_word› "Your word is..." from w5-3 @8:11.5; ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from reward @17:07.0

### C5-L: playtest/fix/V-script/transcripts/continuous-learner-from-w5-1.json

learner, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 7 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 1 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_6 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 10 of 10 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.08 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.3 s (sort w6-br1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 6 words; 180 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 4 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 1 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 1 a level, 1 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 1 of 1 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 75 of 75, rabbit 57 of 57 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.7 s (build w5-1); 0 over | pass |

- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @5:10.5; ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from reward @22:36.5

### C6-P: playtest/fix/V-script/transcripts/continuous-perfect-from-w6-br1.json

perfect, from w6-br1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 | 11 | pass |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 1 sounds | **FAIL** |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_6 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.05 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 1 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.3 s (sort w6-br1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 7 words; 104 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 38.0 s (find w6-6); 2 over | **FAIL** |

- **letters-twice**: /ie/: 2× (w6-ec11 22:09.8, w6-ec11 22:33.9)
- **line-60s**: ‹tv_your_word› "Your word is..." from w6-3 @9:56.7
- **fs-talk**: find (w6-6) 38.0 s from ‹yay_1› "Brilliant!" to ‹tv_take_time› "Take your time, ninja.", with ‹tv_fs_stuck_slow› "Let's say it the slow way first..."; battle (w6-5) 13.4 s from ‹sound:ae› "/ae/" to ‹tv_battle_why› "Every monster you beat helps us win back the sounds.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."

### C6-L: playtest/fix/V-script/transcripts/continuous-learner-from-w6-br1.json

learner, from w6-br1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 11 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 1 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 2 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_6 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.23 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 3 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.4 s (sort w6-br1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 6 words; 147 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 37.7 s (find w6-ec11); 1 over | **FAIL** |

- **letters-60s**: w6-6 @21:26.6 ‹st_two_letters_too› "This one's two letters too, but it's just one sound." again within 60 s
- **fs-talk**: find (w6-ec11) 37.7 s from ‹sound:ie› "/ie/" to ‹tv_take_time› "Take your time, ninja.", with ‹tv_fs_stuck_slow› "Let's say it the slow way first..."

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

### C-W: playtest/fix/V-script/transcripts/continuous-watcher.json

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
| `swap-place-heard` swap place lines heard to the end | all | 15 of 15 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.94 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 21 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 13.3 s (compound w1-wu2); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 5 words; 237 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | yes | pass |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 34 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | 12 of 13 | **FAIL** |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 13 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 7 of 9 (78%) | **FAIL** |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 108 of 116, rabbit 82 of 85 | **FAIL** |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 8 of 8 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 10.8 s (run w1-9); 0 over | pass |

- **line-60s**: ‹tv_your_word› "Your word is..." from w2-1 @49:49.7; ‹tv_here_sound› "Here's the sound..." from world flower @51:19.8
- **talk-before-action**: compound (w1-wu2) 13.3 s from ‹fm_pair_cat_dog› "Cat dog!" to ‹tv_squish_ready› "Two little words make one big word. Now you make one. Are you ready?"
- **watcher-replay**: w1-8 @29:57.8 ready:swap
- **fs-readback**: build (w1-4 @21:03.9): no slow lead-in (it was ‹tv_lets_say_read› "Now let's say the sounds... and read the word."); no fast lead before [am]. Heard: ‹tv_lets_say_read› · /a/ /m/ · [am]; battle (w1-6 @25:01.9): no slow lead-in (it was nothing); no fast lead before [at]. Heard: /a/ /t/ · [at]; (not judged) slowpick (w1-wu3 9:10.1, land 1): no read-back heard; (not judged) soundhunt (w1-7 26:22.4, land 1): no read-back heard
- **fs-badges**: build (w1-4 @21:03.9): the tortoise not lit on the sounds of am; battle (w1-6 @25:01.9): the tortoise not lit on the sounds of at; swap (w1-8 @30:28.3): the tortoise not lit on the sounds of sat; build (w1-4 @20:52.3): the tortoise not lit on [am, slowly]; build (w1-4 @20:54.8): the tortoise not lit on [am, slowly]; build (w1-4 @21:05.5): the rabbit not lit on [am]

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

