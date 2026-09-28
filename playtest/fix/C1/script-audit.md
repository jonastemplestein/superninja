# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/C1/transcripts/continuous-perfect.json (perfect, one continuous page)

562 Sensei lines, 426 sounds and words, 384 utterances in 64 pieces.

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
| fs_ant | 4 | Ant starts with... |
| tv_to_flower | 4 | Let's take your new sounds to the World Flower. Tap the green arrow. |
| suki_says | 4 | Suki says... |
| kai_says | 4 | Kai says... |
| tv_fs_say_slow | 4 | Let's say it the slow way... |
| tv_fs_now_fast | 4 | And now, fast... |
| tv_hunt_q | 4 | Which one has this sound in the middle... |
| fm_name_cat | 3 | This is a cat. |
| tv_pocket_ido | 3 | I'll find one first. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (15)

| Line | Repeats | Text | Example |
|---|---|---|---|
| first_sound_q | 5 | What's the first sound? | level w1-7 @1382.2s and @1394.8s |
| last_sound_q | 4 | What's the last sound? | level w1-7 @1400.0s and @1412.0s |
| tv_which_write | 3 | Which of these is the way we write... | level w1-2 @766.2s and @773.0s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @123.8s and @131.8s |
| fs_ant | 1 | Ant starts with... | level w1-3 @879.3s and @889.4s |
| next_sound_q | 1 | What's the next sound? | level w1-11 @1976.5s and @1989.8s |

### Spliced utterances: 121 of 384 (32%); chains of 5+ clips: 69

Commonest spliced shapes:

- ×5 ‹tv_your_word› + W
- ×3 ‹kai_says› + W + ‹suki_says› + W + ‹read_who›
- ×2 ‹fs_sand› + /X/
- ×2 ‹st_first_q2› + /X/
- ×2 /X/ + ‹tv_praise_write› + ‹tv_which_write› + /X/
- ×2 ‹fs_tin› + /X/
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 ‹tv_first_is› + /X/
- ×2 ‹tv_our_word› + W
- ×1 W + ‹tv_ts_meet› + ‹tv_ts_fast› + W + ‹tv_ts_slow› + W + ‹tv_ready_paw› + ‹fm_tap_tortoise›
- ×1 ‹fm_notice_sun_sock› + /X/ + ‹tv_petal_first›
- ×1 ‹tv_pocket_frame› + ‹tv_pocket_ido› + ‹fs_sun› + /X/ + ‹tv_so_pocket› + ‹tv_pocket_ready_two›
- ×1 W + ‹fm_found_both› + /X/
- ×1 ‹fm_rw_shiny› + ‹fm_rw2_s› + /X/
- ×1 ‹tv_ts_again› + ‹fm_name_mug› + ‹tv_ts_slow_one› + W + ‹fm_tap_tortoise›

Longest chains:

- level w1-8 @1532.6s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level (first minutes) @163.4s (8 clips): "sock" Here are my friends, the rabbit and the tortoise. The rabbit says words fast... "sun" The tortoise says them slowly... "sun" (slowly) Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again. Now you tap the tortoise, and say 
- level w1-4 @1093.8s (8 clips): /t/ /a/ /t/ "at" Look, it's Kai and Suki. They're learning to read, like you. They'll both read this word. Only one of them reads it right. First, you read it. Tap each sound, and say it with me. /a/
- level w1-5 @1182.2s (8 clips): Let's say it the slow way... /s/ /a/ /t/ And now, fast... "sat" Here's your next word... "mat"
- level w1-7 @1402.6s (8 clips): /t/ /s/ /i/ /t/ "sit" Well done. Here's your next word... "it"
- level w1-10 @1763.0s (8 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it.
- level w1-2 @655.6s (7 clips): I'll go first. Here's a map and a hat. Hmm, let me listen. "map" (held) Map starts with... /m/ So I'll tap it. Let's do the next one together. Are you ready?
- level w1-2 @704.2s (7 clips): I'll go first. Here's a bed and a sock. Hmm, let me listen. "sock" (held) Sock starts with... /s/ So I'll tap it. Let's do the next one together. Are you ready?

### Praise: 15 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 51

- intro film @7.9s: "When you're ready to see what happens next, tap the green arrow." cut after 1.5 of 3.8 s by Every petal was a sound. With sounds, we could tal
- choose @62.3s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.8 of 3.6 s by Great choice!
- opt-in @93.1s: "Now come with me to the dojo. Tap the green arrow." cut after 1.4 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @102.9s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 1.6 of 4.5 s by Bong! That's your first star.
- dojo welcome @142.6s: "It's a listening game, called Ninja Ears. Tap the green arrow when you" cut after 3.6 of 4.8 s by I'll say a word. Then you find its picture.
- level (first minutes) @156.7s: "Look, your ninja is ready. Are you ready too? Tap the green arrow." cut after 1.4 of 4.2 s by Your word is sock. Can you find the sock?
- level (first minutes) @173.8s: "Do you want to have a go now? Tap the green arrow. Or tap my paw to se" cut after 1.5 of 6.1 s by Now you tap the tortoise, and say it slowly with m
- level (first minutes) @238.5s: "Now you find the other two. Are you ready?" cut after 1.6 of 3.1 s by "sock" (held)
- level (first minutes) @305.7s: "Now you read them. Do you want to have a go?" cut after 1.7 of 3.4 s by Tap each picture, starting on this side.
- level (first minutes) @307.4s: "Tap each picture, starting on this side." cut after 1.9 of 2.7 s by "fish"
- level (first minutes) @323.3s: "When you're ready for the next game, tap the green arrow." cut after 2.3 of 3.3 s by Here are two rows of pictures. I'll read one, and 
- level (first minutes) @335.6s: "Do you want to have a go now?" cut after 1.5 of 2.4 s by Here I go. Cat... dog. Which row did I read?
- level (first minutes) @357.3s: "Two little words make one big word. Now you make one. Are you ready?" cut after 2.0 of 4.5 s by This is a star.
- level w1-wu3 @471.7s: "Do you want to have a go now?" cut after 1.8 of 2.4 s by This is a van.
- level w1-wu3 @516.4s: "Now you find the other three. Are you ready?" cut after 1.7 of 2.8 s by This is some jam.
- level w1-wu6 @595.8s: "Now you tap the dots, and say the sounds with me. Are you ready?" cut after 3.7 of 4.3 s by /k/
- level w1-wu6 @604.4s: "Now tap the rabbit, and say it fast." cut after 1.8 of 2.4 s by "cat"
- level w1-2 @652.7s: "Tap its petal, and say it." cut after 1.8 of 2.4 s by /m/
- level w1-2 @665.6s: "Let's do the next one together. Are you ready?" cut after 2.4 of 2.8 s by This is some milk.
- level w1-2 @680.5s: "Now you tap it, and say the sound." cut after 1.9 of 2.5 s by /m/
- level w1-2 @701.1s: "Tap its petal, and say it." cut after 1.8 of 2.4 s by /s/
- level w1-2 @714.7s: "Let's do the next one together. Are you ready?" cut after 2.4 of 2.8 s by This is the sun.
- level w1-2 @728.4s: "Now you tap it, and say the sound." cut after 1.8 of 2.5 s by /s/
- level w1-3 @869.9s: "Tap its petal, and say it." cut after 1.9 of 2.4 s by /a/
- level w1-3 @895.7s: "Now you tap it, and say the sound." cut after 1.6 of 2.5 s by /a/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |

## playtest/fix/C1/transcripts/continuous-learner.json (learner, one continuous page)

681 Sensei lines, 572 sounds and words, 540 utterances in 64 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 23 | What's the first sound? |
| last_sound_q | 21 | What's the last sound? |
| say_sounds_read | 13 | Say the sounds, and read the word. |
| suki_says | 12 | Suki says... |
| kai_says | 12 | Kai says... |
| tv_fs_stuck_slow | 11 | Let's say it the slow way first... |
| first_q | 9 | Which one starts with... |
| next_sound_q | 9 | What's the next sound? |
| tv_here_sound | 8 | Here's the sound... |
| tv_let_me_listen | 8 | Hmm, let me listen. |
| tv_tap_it_say | 8 | Now you tap it, and say the sound. |
| tv_by_yourself | 8 | Now you do one all by yourself. |
| read_tap_sounds | 8 | Tap each sound, and say it. |
| read_who | 7 | Who read it right? |
| tv_petal_say | 6 | Tap the petal, and say it with me. |
| tv_so_i_tap | 6 | So I'll tap it. |
| st_first_q2 | 6 | Which picture starts with... |
| tv_which_write | 6 | Which of these is the way we write... |
| tv_your_word | 6 | Your word is... |
| streak_lost | 6 | Keep going, ninja. |
| tv_yes_suki | 6 | Yes! Suki read it right. |
| tv_yes_kai | 6 | Yes! Kai read it right. |
| streak_3 | 6 | Ninja power! |
| tv_watch_write | 5 | Now watch my ninja write it. |
| tv_how_we_write | 5 | This is how we write... |
| tv_together | 5 | Let's do this one together. |
| tv_our_word | 5 | Here's our word... |
| tv_by_yourself_build | 5 | Now you build one all by yourself. |
| tv_praise_kept_going | 5 | That was a tricky one, and you kept going. |
| tv_next_word | 5 | Here's your next word... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (18)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 3 | Which of these is the way we write... | level w1-2 @872.5s and @879.2s |
| first_sound_q | 3 | What's the first sound? | level w1-4 @1242.0s and @1254.9s |
| read_tap_sounds | 3 | Tap each sound, and say it. | level w1-4 @1314.9s and @1328.0s |
| suki_says | 3 | Suki says... | level w1-4 @1316.3s and @1329.8s |
| kai_says | 2 | Kai says... | level w1-4 @1318.2s and @1331.7s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @142.4s and @151.9s |
| fs_ant | 1 | Ant starts with... | level w1-3 @998.1s and @1008.1s |
| last_sound_q | 1 | What's the last sound? | level w1-4 @1261.4s and @1275.1s |
| tv_yes_kai | 1 | Yes! Kai read it right. | level w1-7 @1859.1s and @1872.1s |

### Spliced utterances: 135 of 540 (25%); chains of 5+ clips: 71

Commonest spliced shapes:

- ×4 ‹suki_says› + W + ‹kai_says› + W + ‹read_who›
- ×3 ‹suki_says› + W + ‹kai_says› + W + ‹tv_rc_q›
- ×3 ‹kai_says› + W + ‹suki_says› + W + ‹read_who›
- ×2 /X/ + ‹tv_praise_write› + ‹tv_which_write› + /X/
- ×2 ‹tv_next_sound› + /X/ + ‹tv_petal_say›
- ×2 ‹fs_tin› + /X/
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_praise_kept_going› + ‹tv_next_word›
- ×1 ‹tv_ts_meet› + ‹tv_ts_fast› + W + ‹tv_ts_slow› + W + ‹tv_ready_paw› + ‹fm_tap_tortoise›
- ×1 ‹fm_notice_sun_sock› + /X/ + ‹tv_petal_first›
- ×1 ‹tv_pocket_frame› + ‹tv_pocket_ido› + ‹fs_sun› + /X/ + ‹tv_so_pocket› + ‹tv_pocket_ready_two›
- ×1 W + ‹fm_found_both› + /X/
- ×1 ‹fm_rw_shiny› + ‹fm_rw2_s› + /X/
- ×1 ‹tv_ts_again› + ‹fm_name_mug› + ‹tv_ts_slow_one› + W + ‹fm_tap_tortoise›
- ×1 ‹tv_slow_frame› + ‹tv_slow_demo› + W + ‹tv_i_hear_mug› + ‹tv_ready_go›

Longest chains:

- level w1-4 @1229.6s (10 clips): "am" /m/ Say the sounds, and read the word. /a/ /m/ "am" That was a tricky one, and you kept going. Here's your next word... "at" What's the first sound?
- level w1-8 @1998.3s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-7 @1783.3s (9 clips): Say the sounds, and read the word. /s/ /i/ /t/ "sit" That was a tricky one, and you kept going. Here's your next word... "it" What's the first sound?
- level w1-5 @1398.2s (8 clips): /t/ Say the sounds, and read the word. /m/ /a/ /t/ "mat" Now you build one all by yourself. Your word is...
- level w1-10 @2260.4s (8 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it.
- level (first minutes) @189.0s (7 clips): Here are my friends, the rabbit and the tortoise. The rabbit says words fast... "sun" The tortoise says them slowly... "sun" (slowly) Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again. Now you tap the tortoise, and say it slow
- level w1-2 @742.1s (7 clips): I'll go first. Here's a map and a hat. Hmm, let me listen. "map" (held) Map starts with... /m/ So I'll tap it. Let's do the next one together. Are you ready?
- level w1-2 @797.7s (7 clips): I'll go first. Here's a bed and a sock. Hmm, let me listen. "sock" (held) Sock starts with... /s/ So I'll tap it. Let's do the next one together. Are you ready?

### Praise: 21 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 29

- intro film @7.9s: "When you're ready to see what happens next, tap the green arrow." cut after 2.9 of 3.8 s by Every petal was a sound. With sounds, we could tal
- choose @71.8s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.8 of 3.6 s by Great choice!
- opt-in @106.7s: "Now come with me to the dojo. Tap the green arrow." cut after 2.8 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @117.9s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 3.0 of 4.5 s by Bong! That's your first star.
- level (first minutes) @178.4s: "Look, your ninja is ready. Are you ready too? Tap the green arrow." cut after 2.8 of 4.2 s by Your word is sock. Can you find the sock?
- level (first minutes) @198.2s: "Do you want to have a go now? Tap the green arrow. Or tap my paw to se" cut after 2.9 of 6.1 s by Now you tap the tortoise, and say it slowly with m
- level (first minutes) @356.1s: "Now you read them. Do you want to have a go?" cut after 3.0 of 3.4 s by Tap each picture, starting on this side.
- level (first minutes) @412.5s: "Two little words make one big word. Now you make one. Are you ready?" cut after 3.4 of 4.5 s by This is a star.
- level w1-2 @855.7s: "/s/" cut after 0.2 of 0.7 s by "map"
- level w1-2 @881.9s: "/s/" cut after 0.4 of 0.7 s by /s/
- level w1-4 @1173.0s: "This card is my word. Tap it, and hear the word." cut after 2.7 of 3.6 s by "am"
- level w1-4 @1214.5s: "Now tap the rabbit, and read the word fast." cut after 0.4 of 3.4 s by "at"
- level w1-4 @1291.9s: "First, you read it. Tap each sound, and say it with me." cut after 0.5 of 4.3 s by /a/
- level w1-4 @1314.9s: "Tap each sound, and say it." cut after 0.0 of 2.0 s by /a/
- level w1-4 @1328.0s: "Tap each sound, and say it." cut after 0.1 of 2.0 s by /a/
- level w1-5 @1517.5s: "Tap each sound, and say it." cut after 0.6 of 2.0 s by /s/
- level w1-5 @1534.8s: "Tap each sound, and say it." cut after 0.6 of 2.0 s by /m/
- level w1-6 @1601.9s: "That's how we spell a word. Now you spell one. Are you ready to zap it" cut after 3.0 of 5.1 s by Your word is...
- level w1-6 @1625.3s: "Now tap the rabbit, and read the word fast." cut after 0.7 of 3.4 s by "am"
- level w1-7 @1864.8s: "Tap each sound, and say it." cut after 0.2 of 2.0 s by /i/
- level w1-7 @1878.5s: "Tap each sound, and say it." cut after 0.2 of 2.0 s by /s/
- level w1-8 @1954.5s: "Now tap the rabbit, and read the word fast." cut after 0.2 of 3.4 s by "mat"
- level w1-8 @1960.1s: "I'll show you first. Are you ready to watch? Tap the green arrow." cut after 2.9 of 4.4 s by I'll change it to...
- level w1-8 @1980.1s: "Now you swap one. Do you want to have a go?" cut after 2.9 of 3.4 s by Now let's change it to...
- level w1-8 @2008.9s: "What do we need to change?" cut after 1.0 of 1.8 s by Yes, the middle sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| audit_gem_more "Look, this gem has filled a little more." | 1 | reward |

## playtest/fix/C1/transcripts/continuous-perfect-from-w1-10.json (perfect-from-w1-10, one continuous page)

135 Sensei lines, 90 sounds and words, 80 utterances in 13 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 5 | What's the first sound? |
| last_sound_q | 4 | What's the last sound? |
| tv_petal_say | 3 | Tap the petal, and say it with me. |
| tv_let_me_listen | 3 | Hmm, let me listen. |
| tv_together | 3 | Let's do this one together. |
| first_q | 3 | Which one starts with... |
| tv_tap_it_say | 3 | Now you tap it, and say the sound. |
| tv_by_yourself | 3 | Now you do one all by yourself. |
| tv_here_sound | 3 | Here's the sound... |
| tv_so_i_tap | 2 | So I'll tap it. |
| fs_nest | 2 | Nest starts with... |
| tv_watch_write | 2 | Now watch my ninja write it. |
| tv_how_we_write | 2 | This is how we write... |
| fm_name_bus | 2 | This is a bus. |
| st_first_q2 | 2 | Which picture starts with... |
| tv_which_write | 2 | Which of these is the way we write... |
| tv_our_word | 2 | Here's our word... |
| tv_by_yourself_build | 2 | Now you build one all by yourself. |
| tv_your_word | 2 | Your word is... |
| say_sounds_read | 2 | Say the sounds, and read the word. |
| tv_to_reward | 2 | Let's see what you won back from Baron Muddle. |
| fm_rw_more | 2 | More stickers for your Sticker Book! |
| tv_map_hint | 2 | The glowing stone is your next game. Tap it when you're ready. |
| tv_hunt_q | 2 | Which one has this sound in the middle... |
| tv_fs_say_slow | 2 | Let's say it the slow way... |
| tv_fs_now_fast | 2 | And now, fast... |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_first_again_new | 1 | It's First Sounds again, with two new sounds. |
| tv_first_sound | 1 | Our first sound is... |
| tv_ido_pair_nut_hat | 1 | I'll go first. Here's a nut and a hat. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (1)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 1 | Which of these is the way we write... | level w1-10 @127.2s and @133.9s |

### Spliced utterances: 37 of 80 (46%); chains of 5+ clips: 21

Commonest spliced shapes:

- ×2 ‹tv_your_word› + W
- ×1 ‹tv_first_again_new› + ‹tv_first_sound› + /X/ + ‹tv_petal_say› + /X/
- ×1 ‹tv_ido_pair_nut_hat› + ‹tv_let_me_listen› + W + ‹fs_nut› + /X/ + ‹tv_so_i_tap›
- ×1 ‹tv_together› + ‹fm_name_nest› + ‹fm_name_dog› + ‹first_q› + /X/
- ×1 ‹fs_nest› + /X/ + ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹tv_tap_it_say› + /X/
- ×1 ‹tv_by_yourself› + ‹fm_name_bus› + ‹fm_name_net› + ‹first_q› + /X/
- ×1 ‹fs_net› + /X/
- ×1 ‹tv_next_sound› + /X/ + ‹tv_petal_say› + /X/
- ×1 ‹tv_pocket_ido› + ‹fm_name_bus› + ‹fm_name_pan› + ‹tv_let_me_listen› + W + ‹fs_pan› + /X/ + ‹tv_so_i_tap›
- ×1 ‹tv_together› + ‹fm_name_pot› + ‹fm_name_van› + ‹st_first_q2› + /X/
- ×1 ‹fs_pot› + /X/ + ‹tv_and_how_we_write› + /X/ + ‹tv_tap_it_say› + /X/
- ×1 ‹tv_by_yourself› + ‹fm_name_pen› + ‹fm_name_fan› + ‹st_first_q3› + /X/
- ×1 ‹fs_pen› + /X/
- ×1 ‹tv_mix_up› + ‹fm_name_pond› + ‹first_q› + /X/
- ×1 ‹fs_nest› + /X/ + ‹yay_1›

Longest chains:

- level w1-10 @66.6s (8 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it.
- level w1-10 @35.5s (7 clips): Nest starts with... /n/ Now watch my ninja write it. This is how we write... /n/ Now you tap it, and say the sound. /n/
- level w1-10 @149.0s (7 clips): "an" /n/ Let's say the sounds, the slow way... /a/ /n/ Now tap the rabbit, and read the word fast. "an"
- level w1-11 @269.7s (7 clips): Top has this sound in the middle... /o/ Now watch my ninja write it. This is how we write... /o/ Now you tap it, and say the sound. /o/
- level w1-11 @306.8s (7 clips): /n/ Let's say it the slow way... /o/ /n/ And now, fast... "on" Now you build one all by yourself.
- level w1-11 @329.8s (7 clips): Say the sounds, and read the word. /p/ /o/ /t/ "pot" Wow, great listening! Here's your next word...
- level w1-11 @346.7s (7 clips): /p/ /t/ /o/ /p/ "top" Kai and Suki are back. You read it first, then they read it. /t/
- level w1-10 @15.0s (6 clips): I'll go first. Here's a nut and a hat. Hmm, let me listen. "nut" Nut starts with... /n/ So I'll tap it.

### Praise: 4 lines (0.6 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 10

- level w1-10 @11.9s: "Tap the petal, and say it with me." cut after 1.6 of 2.5 s by /n/
- level w1-10 @43.2s: "Now you tap it, and say the sound." cut after 1.4 of 2.5 s by /n/
- level w1-10 @57.4s: "/n/" cut after 0.6 of 0.9 s by Net starts with...
- level w1-10 @64.0s: "Tap the petal, and say it with me." cut after 1.8 of 2.5 s by /p/
- level w1-10 @89.8s: "Now you tap it, and say the sound." cut after 1.5 of 2.5 s by /p/
- level w1-10 @112.4s: "/n/" cut after 0.4 of 0.9 s by Nest starts with...
- level w1-10 @129.9s: "/n/" cut after 0.4 of 0.9 s by /n/
- level w1-10 @155.0s: "Now tap the rabbit, and read the word fast." cut after 0.1 of 3.4 s by "an"
- level w1-11 @249.9s: "Tap the petal, and say it with me." cut after 1.5 of 2.5 s by /o/
- level w1-11 @277.0s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /o/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| audit_gem_more "Look, this gem has filled a little more." | 1 | reward |

## playtest/fix/C1/transcripts/continuous-learner-from-w1-10.json (learner-from-w1-10, one continuous page)

169 Sensei lines, 136 sounds and words, 123 utterances in 13 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 8 | What's the first sound? |
| last_sound_q | 7 | What's the last sound? |
| say_sounds_read | 4 | Say the sounds, and read the word. |
| tv_petal_say | 3 | Tap the petal, and say it with me. |
| tv_let_me_listen | 3 | Hmm, let me listen. |
| tv_together | 3 | Let's do this one together. |
| first_q | 3 | Which one starts with... |
| tv_tap_it_say | 3 | Now you tap it, and say the sound. |
| tv_by_yourself | 3 | Now you do one all by yourself. |
| streak_3 | 3 | Ninja power! |
| tv_fs_stuck_slow | 3 | Let's say it the slow way first... |
| tv_here_sound | 3 | Here's the sound... |
| next_sound_q | 3 | What's the next sound? |
| kai_says | 3 | Kai says... |
| suki_says | 3 | Suki says... |
| tv_so_i_tap | 2 | So I'll tap it. |
| tv_watch_write | 2 | Now watch my ninja write it. |
| tv_how_we_write | 2 | This is how we write... |
| fs_nest | 2 | Nest starts with... |
| st_first_q2 | 2 | Which picture starts with... |
| tv_which_write | 2 | Which of these is the way we write... |
| tv_our_word | 2 | Here's our word... |
| tv_by_yourself_build | 2 | Now you build one all by yourself. |
| tv_your_word | 2 | Your word is... |
| streak_lost | 2 | Keep going, ninja. |
| tv_praise_kept_going | 2 | That was a tricky one, and you kept going. |
| tv_next_word | 2 | Here's your next word... |
| tv_fs_say_slow | 2 | Let's say it the slow way... |
| tv_fs_now_fast | 2 | And now, fast... |
| tv_to_reward | 2 | Let's see what you won back from Baron Muddle. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (4)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 1 | Which of these is the way we write... | level w1-10 @138.1s and @145.3s |
| first_sound_q | 1 | What's the first sound? | level w1-11 @392.9s and @406.1s |
| read_tap_sounds | 1 | Tap each sound, and say it. | level w1-11 @469.2s and @482.7s |
| kai_says | 1 | Kai says... | level w1-11 @473.6s and @485.2s |

### Spliced utterances: 41 of 123 (33%); chains of 5+ clips: 25

Commonest spliced shapes:

- ×1 ‹tv_first_again_new› + ‹tv_first_sound› + /X/ + ‹tv_petal_say› + /X/
- ×1 ‹tv_ido_pair_nut_hat› + ‹tv_let_me_listen› + W + ‹fs_nut› + /X/ + ‹tv_so_i_tap›
- ×1 ‹tv_together› + ‹fm_name_fox› + ‹fm_name_net› + ‹first_q› + /X/
- ×1 ‹fs_net› + /X/ + ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹tv_tap_it_say›
- ×1 ‹tv_by_yourself› + ‹fm_name_jam› + ‹fm_name_nest› + ‹first_q› + /X/
- ×1 ‹fs_nest› + /X/
- ×1 ‹tv_next_sound› + /X/ + ‹tv_petal_say› + /X/
- ×1 ‹tv_pocket_ido› + ‹fm_name_bus› + ‹fm_name_pan› + ‹tv_let_me_listen› + W + ‹fs_pan› + /X/ + ‹tv_so_i_tap›
- ×1 ‹tv_together› + ‹fm_name_cup› + ‹fm_name_peg› + ‹st_first_q2› + /X/
- ×1 ‹fs_peg› + /X/ + ‹tv_and_how_we_write› + /X/ + ‹tv_tap_it_say› + /X/
- ×1 ‹fm_name_pot› + ‹fm_name_fan› + ‹st_first_q3› + /X/
- ×1 ‹fs_pot› + /X/
- ×1 ‹tv_mix_up› + ‹first_q› + /X/
- ×1 ‹fs_nest› + /X/ + ‹yay_1›
- ×1 ‹fm_name_pen› + ‹st_first_q2›

Longest chains:

- level w1-11 @356.9s (9 clips): "on" /n/ Say the sounds, and read the word. /o/ /n/ "on" That was a tricky one, and you kept going. Now you build one all by yourself. Your word is...
- level w1-11 @401.2s (9 clips): /p/ /t/ /o/ /p/ "top" Ninja power! "mop" What's the first sound? Let's listen again. What sound comes next?
- level w1-10 @74.3s (8 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it.
- level w1-11 @314.1s (7 clips): Top has this sound in the middle... /o/ Now watch my ninja write it. This is how we write... /o/ Now you tap it, and say the sound. /o/
- level w1-11 @384.6s (7 clips): /t/ Say the sounds, and read the word. /p/ /o/ /t/ "pot" Here's your next word...
- level w1-10 @16.4s (6 clips): I'll go first. Here's a nut and a hat. Hmm, let me listen. "nut" Nut starts with... /n/ So I'll tap it.
- level w1-10 @36.4s (6 clips): Net starts with... /n/ Now watch my ninja write it. This is how we write... /n/ Now you tap it, and say the sound.
- level w1-10 @92.9s (6 clips): Peg starts with... /p/ And this is how we write... /p/ Now you tap it, and say the sound. /p/

### Praise: 5 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 3

- level w1-10 @166.5s: "Now tap the rabbit, and read the word fast." cut after 0.0 of 3.4 s by "an"
- level w1-11 @469.2s: "Tap each sound, and say it." cut after 0.4 of 2.0 s by /p/
- level w1-11 @482.7s: "Tap each sound, and say it." cut after 0.4 of 2.0 s by /m/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| audit_gem_more "Look, this gem has filled a little more." | 1 | reward |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C-P: playtest/fix/C1/transcripts/continuous-perfect.json

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
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.91 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 18 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 13.3 s (compound w1-wu2); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 17 words (median line 5 words; 149 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 17 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 2 of 11 games | **FAIL** |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 5 of 6 (83%) | **FAIL** |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 58 of 58, rabbit 37 of 37 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 7 of 7 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 12.0 s (run w1-9); 0 over | pass |

- **unframed-turn**: swap (w1-8 24:43.2): out of order (frame 1483.0, demo 1500.6, ready 1499.3, hand-over 1517.7). Opens: "Oh dear. Baron Muddle has been muddling up words." · "First, let's read this word. Tap each sound, and s"
- **talk-before-action**: compound (w1-wu2) 13.3 s from ‹fm_pair_cat_dog› "Cat dog!" to ‹tv_squish_ready› "Two little words make one big word. Now you make one. Are you ready?"
- **fs-per-session**: firstsound (w1-2 10:45.1, land 1): no idea line, rabbit prompt or slow-then-fast pair. It said: ‹tv_first_frame› ‹tv_first_sound› ‹tv_petal_say_short› ‹tv_ido_pair_map_hat›; soundhunt (w1-7 22:06.0, land 1): no idea line, rabbit prompt or slow-then-fast pair. It said: ‹tv_hunt_frame› ‹tv_here_sound› ‹tv_petal_say› ‹tv_ido_pair_pan_pin›
- **fs-readback**: swap (w1-8 @25:14.9): no fast lead before [sat]. Heard: /s/ /a/ /t/ · [sat]; (not judged) fastslow (w1-wu1 2:44.2, land 1): no read-back heard; (not judged) slowpick (w1-wu3 7:41.0, land 1): no read-back heard; (not judged) soundhunt (w1-7 22:06.0, land 1): no read-back heard

### C-L: playtest/fix/C1/transcripts/continuous-learner.json

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
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.19 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 18 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 12.3 s (compound w1-wu2); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 5 words; 195 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 17 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 2 of 11 games | **FAIL** |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 4 of 5 (80%) | **FAIL** |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 75 of 75, rabbit 52 of 52 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 7 of 7 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.5 s (run w1-9); 0 over | pass |

- **unframed-turn**: swap (w1-8 32:24.1): out of order (frame 1943.9, demo 1963.0, ready 1960.3, hand-over 1980.1). Opens: "Oh dear. Baron Muddle has been muddling up words." · "First, let's read this word. Tap each sound, and s"
- **talk-before-action**: compound (w1-wu2) 12.3 s from ‹tv_squish_frame› "Here's a new game, called Word Squish." to ‹tv_squish_ready› "Two little words make one big word. Now you make one. Are you ready?"
- **fs-per-session**: firstsound (w1-2 12:10.3, land 1): no idea line, rabbit prompt or slow-then-fast pair. It said: ‹tv_first_frame› ‹tv_first_sound› ‹tv_petal_say› ‹tv_ido_pair_map_hat›; soundhunt (w1-7 28:11.0, land 1): no idea line, rabbit prompt or slow-then-fast pair. It said: ‹tv_hunt_frame› ‹tv_here_sound› ‹tv_petal_say› ‹tv_ido_pair_pan_pin›
- **fs-readback**: swap (w1-8 @32:57.3): no fast lead before [sat]. Heard: /s/ /a/ /t/ · [sat]; (not judged) fastslow (w1-wu1 3:08.6, land 1): no read-back heard; (not judged) slowpick (w1-wu3 8:45.5, land 1): no read-back heard; (not judged) dots (w1-wu6 10:39.1, land 1): no read-back heard

### C(w1-10)-P: playtest/fix/C1/transcripts/continuous-perfect-from-w1-10.json

perfect, from w1-10, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 3 (0 repeats) | pass |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.73 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 23 words (median line 4 words; 26 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 4 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 3 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 2 of 2 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 7 of 7, rabbit 6 of 6 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.5 s (readcheck w1-11); 0 over | pass |

### C(w1-10)-L: playtest/fix/C1/transcripts/continuous-learner-from-w1-10.json

learner, from w1-10, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 3 (0 repeats) | pass |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.20 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 19 words (median line 4 words; 40 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 4 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 2 of 2 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 12 of 12, rabbit 11 of 11 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 0 of 1 prompts answered (0 timed out); 1 rabbit taps outside a prompt | **FAIL** |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 16.4 s (build w1-10); 1 over | **FAIL** |

- **fs-rabbit**: w1-10 @2:46.5 ‹tv_fs_rabbit_read› "Now tap the rabbit, and read the word fast.": no rabbit tap or timeout logged before the word; w1-10 @2:46.5: a rabbit tap with no prompt before it
- **fs-talk**: build (w1-10) 16.4 s from ‹tv_to_reward› "Let's see what you won back from Baron Muddle." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow.", with ‹tv_fs_say_slow› "Let's say it the slow way..."

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

