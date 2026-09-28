# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/D1/verify2/transcripts/continuous-perfect-from-w5-1.json (perfect-from-w5-1, one continuous page)

275 Sensei lines, 561 sounds and words, 393 utterances in 52 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_your_word | 7 | Your word is... |
| tv_next_word | 7 | Here's your next word... |
| tv_here_sound | 7 | Here's the sound... |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| t_another_way | 5 | This is another way to spell the sound... |
| yay_4 | 4 | Well done. |
| yay_1 | 4 | Brilliant! |
| r2_gems_more | 4 | Look, these gems have filled a little more. |
| tv_swap_now_change | 4 | Now let's change it to... |
| tv_swap_both | 4 | Listen to them both... |
| st_what_change | 4 | What do we need to change? |
| tv_swap_pick | 4 | Now tap the new one. |
| t_two_letters | 3 | It's two letters, but it's one sound. |
| tv_tap_letter_say | 3 | Now you tap it, and say the sound. |
| tv_said_well | 3 | Good, you said that sound really well. |
| tv_petal_say_short | 3 | Tap its petal, and say it. |
| st_two_letters_too | 3 | This one's two letters too, but it's just one sound. |
| tv_tap_it_say_short | 3 | Now you tap it, and say it. |
| tv_thats_write | 3 | That's how we write... |
| we_need | 3 | We need... |
| tv_find_write | 3 | Find how we write... |
| tv_yay_lovely | 3 | Lovely! |
| first_sound_q | 3 | What's the first sound? |
| next_sound_q | 3 | What's the next sound? |
| last_sound_q | 3 | What's the last sound? |
| tv_to_reward | 3 | Let's see what you won back from Baron Muddle. |
| tv_battle_again | 3 | Another monster! Let's zap it with words. |
| battle_win | 3 | Hooray! The monster ran away! |
| audit_gem_more | 3 | Look, this gem has filled a little more. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (6)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @107.4s and @110.9s |
| tv_thats_write | 1 | That's how we write... | level w5-1 @112.6s and @121.8s |
| we_need | 1 | We need... | level w5-1 @115.3s and @124.4s |
| t_ways_2 | 1 | Now you know two ways to spell... | world flower @1170.9s and @1182.6s |

### Spliced utterances: 72 of 393 (18%); chains of 5+ clips: 47

Commonest spliced shapes:

- ×3 ‹tv_battle_again› + ‹tv_your_word› + W
- ×3 ‹tv_next_word› + W
- ×3 ‹tv_next_sound_known› + /X/
- ×3 ‹tv_here_sound› + /X/
- ×2 ‹tv_won_four› + /X/ + /X/ + /X/ + /X/
- ×2 ‹tv_find_write› + /X/ + /X/
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×1 ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/
- ×1 ‹tv_learn_another› + /X/
- ×1 ‹tv_and_how_we_write› + /X/
- ×1 ‹tv_learn_last› + /X/
- ×1 ‹t_same_spelling_sometimes› + /X/ + ‹st_th_moth_sometimes› + /X/ + ‹tg_th_dh_in›

Longest chains:

- level w5-4 @762.4s (10 clips): /s/ /o/ /k/ "sock" Now let's change it to... "lock" Listen to them both... "sock" (slowly) "lock" (slowly) What do we need to change?
- level w5-8 @1310.2s (10 clips): /w/ /i/ /ch/ "witch" Now let's change it to... "ditch" Listen to them both... "witch" (slowly) "ditch" (slowly) What do we need to change?
- level w5-4 @737.6s (9 clips): /ng/ "song" If you'd like to see me do one first, tap my paw. Now let's change it to... "sock" Listen to them both... "song" (slowly) "sock" (slowly) What do we need to change?
- level w5-4 @809.4s (8 clips): /f/ /o/ /ks/ "fox" This spelling is two sounds together! /k/ /s/ You fixed all of Baron's muddled words!
- level w5-8 @1289.9s (8 clips): "wing" If you'd like to see me do one first, tap my paw. Now let's change it to... "witch" Listen to them both... "wing" (slowly) "witch" (slowly) What do we need to change?
- level w5-3 @580.3s (7 clips): Ninja power! /s/ /o/ /k/ "sock" Here's your next word... "check"
- level w5-6 @1053.0s (7 clips): /d/ /i/ /ch/ "ditch" You built that whole word by yourself! Here's your next word... "match"
- level w5-6 @1101.4s (7 clips): /z/ /k/ /w/ /i/ /z/ "quiz" You built words with their sounds, and you read them.

### Praise: 19 lines (0.7 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 17

- level w5-1 @21.3s: "Tap the petal, and say it with me." cut after 1.8 of 2.5 s by /sh/
- level w5-1 @31.6s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /sh/
- level w5-1 @34.6s: "Tap it once more, and say it again." cut after 0.1 of 2.5 s by /sh/
- level w5-1 @41.7s: "Tap its petal, and say it." cut after 1.7 of 2.4 s by /ch/
- level w5-1 @51.5s: "Now you tap it, and say it." cut after 1.5 of 2.1 s by /ch/
- level w5-1 @110.9s: "Which of these is the way we write..." cut after 1.7 of 2.7 s by That's how we write...
- level w5-1 @121.8s: "Find how we write..." cut after 0.0 of 1.5 s by That's how we write...
- level w5-3 @512.6s: "Tap its petal, and say it." cut after 1.7 of 2.4 s by /k/
- level w5-3 @556.1s: "Which of these is the way we write..." cut after 0.2 of 2.7 s by That's how we write...
- level w5-3 @560.6s: "Which of these is the way we write..." cut after 1.9 of 2.7 s by /ng/
- level w5-4 @772.6s: "What do we need to change?" cut after 1.0 of 1.8 s by Yes, the first sound changes!
- level w5-6 @984.4s: "Now you tap it, and say it." cut after 1.5 of 2.1 s by /w/
- level w5-6 @1029.7s: "Which of these is the way we write..." cut after 2.1 of 2.7 s by /k/
- level w5-6 @1034.6s: "/w/" cut after 0.3 of 0.7 s by /w/
- level w5-8 @1303.0s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the last sound changes!
- level w5-8 @1320.6s: "What do we need to change?" cut after 1.0 of 1.8 s by Yes, the first sound changes!
- level w5-10 @1531.4s: "story:s5_q" cut after 0.4 of 1.2 s by "rock"

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_another_way "This is another way to spell the sound..." | 5 | level w5-3, world flower ×2, level w5-6 ×2 |
| r2_gems_more "Look, these gems have filled a little more." | 4 | reward ×4 |
| t_two_letters "It's two letters, but it's one sound." | 3 | level w5-1, level w5-3, level w5-5 |
| audit_gem_more "Look, this gem has filled a little more." | 3 | reward ×3 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_one_spelling_two_sounds "This spelling is two sounds together!" | 1 | level w5-4 |
| wf_spelling_of "This is a spelling of the sound..." | 1 | world flower |
| same_sound_diff "Same sound, different spellings!" | 1 | world flower |

## playtest/fix/D1/verify2/transcripts/continuous-splitter-from-w5-1.json (splitter-from-w5-1, one continuous page)

275 Sensei lines, 461 sounds and words, 328 utterances in 38 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| t_two_letters | 9 | It's two letters, but it's one sound. |
| tv_your_word | 7 | Your word is... |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| tv_next_word | 6 | Here's your next word... |
| streak_lost | 6 | Keep going, ninja. |
| thats | 6 | That's... |
| we_need | 6 | We need... |
| tv_here_sound | 6 | Here's the sound... |
| tv_swap_now_change | 6 | Now let's change it to... |
| streak_3 | 5 | Ninja power! |
| first_sound_q | 5 | What's the first sound? |
| next_sound_q | 5 | What's the next sound? |
| last_sound_q | 5 | What's the last sound? |
| audit_gem_more | 5 | Look, this gem has filled a little more. |
| t_another_way | 5 | This is another way to spell the sound... |
| tv_swap_both | 5 | Listen to them both... |
| tv_swap_pick | 5 | Now tap the new one. |
| st_what_change | 4 | What do we need to change? |
| tv_map_hint | 3 | The glowing stone is your next game. Tap it when you're ready. |
| tv_tap_letter_say | 3 | Now you tap it, and say the sound. |
| tv_said_well | 3 | Good, you said that sound really well. |
| tv_petal_say_short | 3 | Tap its petal, and say it. |
| st_two_letters_too | 3 | This one's two letters too, but it's just one sound. |
| tv_tap_it_say_short | 3 | Now you tap it, and say it. |
| tv_find_write | 3 | Find how we write... |
| tv_to_reward | 3 | Let's see what you won back from Baron Muddle. |
| tv_next_sound_known | 3 | Our next sound is one you know... |
| tv_and_another_way | 3 | And here's another way to spell it... |
| yay_8 | 3 | Wow, great listening! |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (6)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @117.8s and @122.3s |
| next_sound_q | 1 | What's the next sound? | level w5-3 @667.1s and @670.8s |
| tv_guess_q | 1 | Listen for the word... | level w5-5 @992.1s and @1005.7s |
| t_ways_2 | 1 | Now you know two ways to spell... | world flower @1362.8s and @1374.4s |

### Spliced utterances: 75 of 328 (23%); chains of 5+ clips: 49

Commonest spliced shapes:

- ×5 ‹streak_lost› + ‹thats› + /X/ + ‹we_need› + /X/ + ‹t_two_letters›
- ×3 ‹tv_next_sound_known› + /X/
- ×3 ‹tv_here_sound› + /X/
- ×2 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say›
- ×2 ‹tv_which_write› + /X/ + /X/
- ×2 ‹tv_which_write› + /X/
- ×2 ‹tv_your_word› + W
- ×2 ‹tv_next_word› + W
- ×2 ‹tv_next_build_plain› + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_learn_first_short› + /X/
- ×1 ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×1 ‹tv_learn_another› + /X/
- ×1 ‹tv_and_how_we_write› + /X/

Longest chains:

- level w5-1 @195.1s (11 clips): /l/ Say the sounds, and read the word. /sh/ /e/ /l/ "shell" It's two letters, but it's one sound. /l/ Your word is... "rush" What's the first sound?
- level w5-1 @260.8s (10 clips): Say the sounds, and read the word. /d/ /i/ /sh/ "dish" You said it slowly, and found every sound. Your word is... "shed" What's the first sound? /sh/
- level w5-4 @885.7s (10 clips): /w/ /i/ /ng/ "wing" Now let's change it to... "wig" Listen to them both... "wing" (slowly) "wig" (slowly) What do we need to change?
- level w5-8 @1563.5s (10 clips): /r/ /o/ /k/ "rock" Now let's change it to... "rod" Listen to them both... "rock" (slowly) "rod" (slowly) What do we need to change?
- level w5-8 @1613.9s (10 clips): /sh/ /e/ /d/ "shed" Now let's change it to... "shell" Listen to them both... "shed" (slowly) "shell" (slowly) Which sound changes?
- level w5-3 @678.9s (8 clips): /s/ /t/ /u/ /k/ "stuck" You built that whole word by yourself! Here's your next word... "rock"
- level w5-8 @1543.9s (8 clips): "sock" If you'd like to see me do one first, tap my paw. Now let's change it to... "rock" Listen to them both... "sock" (slowly) "rock" (slowly) What do we need to change?
- level w5-1 @223.5s (7 clips): Ninja power! Let's say it the slow way... "rush" (slowly) And now, fast... "rush" Here's your next word... "dish"

### Praise: 14 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 8

- level w5-1 @37.7s: "Tap it once more, and say it again." cut after 0.4 of 2.5 s by /sh/
- level w5-1 @132.8s: "Now find how we write..." cut after 0.2 of 2.1 s by /dh/
- level w5-1 @272.1s: "What's the first sound?" cut after 1.3 of 1.6 s by /sh/
- level w5-3 @575.6s: "It's a new sound. Tap its petal, and say it with me." cut after 2.7 of 4.0 s by /ng/
- level w5-3 @656.4s: "Find how we write..." cut after 0.7 of 1.5 s by /w/
- level w5-6 @1187.1s: "/w/" cut after 0.4 of 0.7 s by /w/
- level w5-8 @1572.8s: "What do we need to change?" cut after 0.8 of 1.8 s by Yes, the last sound changes!
- level w5-8 @1624.8s: "Which sound changes?" cut after 1.0 of 1.9 s by Yes, the last sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 9 | level w5-1 ×3, level w5-2, level w5-3, level w5-6, level w5-7 ×2, level w5-8 |
| audit_gem_more "Look, this gem has filled a little more." | 5 | reward ×5 |
| t_another_way "This is another way to spell the sound..." | 5 | level w5-3, world flower ×2, level w5-6 ×2 |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |
| wf_spelling_of "This is a spelling of the sound..." | 1 | world flower |

## playtest/fix/D1/verify2/transcripts/continuous-perfect-from-w6-br1.json (perfect-from-w6-br1, one continuous page)

264 Sensei lines, 578 sounds and words, 366 utterances in 59 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_here_sound | 10 | Here's the sound... |
| audit_sort_pair | 9 | This sound can be spelt in two ways. |
| tv_watch_write | 8 | Now watch my ninja write it. |
| tv_and_another_way | 8 | And here's another way to spell it... |
| t_ways_2 | 8 | Now you know two ways to spell... |
| tv_which_write | 8 | Which of these is the way we write... |
| help_sort | 6 | Tap the chest with the same spelling as the word. |
| tv_praise_sorted | 6 | That's the right chest. |
| tv_sort_done | 6 | Same sound, different spellings. You sorted them all. |
| t_two_letters | 5 | It's two letters, but it's one sound. |
| audit_sort_again | 5 | Sorting time! Same sound, different spellings. |
| tv_your_word | 5 | Your word is... |
| tv_next_word | 5 | Here's your next word... |
| r2_gems_more | 5 | Look, these gems have filled a little more. |
| st_two_letters_too | 4 | This one's two letters too, but it's just one sound. |
| tv_learn_how | 4 | I'll say each sound, and show you how we write it. Then you say it with me. |
| tv_here_it_comes | 4 | Here it comes... |
| tv_new_petal_say | 4 | It's a new sound. Tap its petal, and say it with me. |
| tv_how_we_write | 4 | This is how we write... |
| tv_tap_letter_say | 4 | Now you tap it, and say the sound. |
| tv_said_well | 4 | Good, you said that sound really well. |
| tv_tap_it_say_short | 4 | Now you tap it, and say it. |
| tv_ne_again | 4 | Now let's play Ninja Eyes. |
| tv_next_build_plain | 4 | Next, we're going to build some words. |
| first_sound_q | 4 | What's the first sound? |
| next_sound_q | 4 | What's the next sound? |
| last_sound_q | 4 | What's the last sound? |
| tv_build_done | 4 | You built words with their sounds, and you read them. |
| tv_won_one | 4 | You won back a sound... |
| tv_to_flower_first | 4 | Now let's go and see where your sounds live. Tap the green arrow. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (5)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w6-1 @312.1s and @315.7s |
| next_sound_q | 1 | What's the next sound? | level w6-1 @333.2s and @340.3s |

### Spliced utterances: 49 of 366 (13%); chains of 5+ clips: 63

Commonest spliced shapes:

- ×4 ‹tv_here_it_comes› + /X/
- ×4 ‹tv_which_write› + /X/
- ×3 ‹audit_sort_pair› + /X/ + ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×3 /X/ + ‹tv_watch_write› + ‹tv_and_another_way› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×3 ‹t_ways_2› + /X/ + ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 ‹tv_to_reward› + ‹tv_won_one› + /X/
- ×2 /X/ + /X/ + /X/ + W + ‹tv_next_word› + W
- ×2 ‹tv_won_one› + /X/
- ×1 ‹tv_here_sound› + /X/ + ‹audit_bridging_first› + ‹tv_sort_frame› + ‹tv_sort_open›
- ×1 ‹t_two_letters› + /X/ + ‹tv_sort_ido› + W + ‹tv_sort_see› + ‹tv_sort_so› + ‹tv_ready_yours›
- ×1 ‹audit_sort_again› + ‹tv_here_sound› + /X/ + ‹audit_sort_pair› + ‹tg_ch_ch_way› + ‹st_two_letters_too› + /X/ + ‹tv_spelt_like_this_match›
- ×1 ‹t_ways_2› + /X/ + ‹tv_ne_again› + ‹tv_petal_hint› + ‹tv_which_write› + /X/ + /X/
- ×1 ‹yay_2› + ‹tv_next_build_plain› + ‹tv_your_word› + W + ‹first_sound_q›
- ×1 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + /X/ + /X/
- ×1 ‹tv_fs_two_ways› + ‹tv_next_word› + W

Longest chains:

- level w6-br2 @149.1s (8 clips): Sorting time! Same sound, different spellings. Here's the sound... /ch/ This sound can be spelt in two ways. This is the way we spell it in chick. This one's two letters too, but it's just one sound. /ch/ In match, it's spelt like this.
- level w6-1 @270.6s (8 clips): This sound can be spelt in two ways. /ae/ Now watch my ninja write it. This is how we write... /ae/ It's two letters, but it's one sound. Now you tap it, and say the sound. /ae/
- level w6-3 @623.5s (8 clips): This sound can be spelt in two ways. /ee/ Now watch my ninja write it. This is how we write... /ee/ It's two letters, but it's one sound. Now you tap it, and say the sound. /ee/
- level w6-6 @1025.8s (8 clips): This sound can be spelt in two ways. /oe/ Now watch my ninja write it. This is how we write... /oe/ It's two letters, but it's one sound. Now you tap it, and say the sound. /oe/
- level w6-ec11 @1281.8s (8 clips): /ie/ You can hear it in... "light" "night" ...and... "high" It's a new sound. Tap its petal, and say it with me. /ie/
- level w6-ec11 @1289.9s (8 clips): This sound can be spelt in two ways. /ie/ Now watch my ninja write it. This is how we write... /ie/ It's three letters, but it's just one sound. Now you tap it, and say the sound. /ie/
- level w6-br1 @42.0s (7 clips): It's two letters, but it's one sound. /k/ I'll sort the first one. My word is... "lock" I can see this spelling at the end. So it goes in this chest. Now you do one. Are you ready?
- level w6-1 @303.2s (7 clips): Now you know two ways to spell... /ae/ Now let's play Ninja Eyes. Tap the petal if you want to hear the sound again. Which of these is the way we write... /ae/ /ae/

### Praise: 8 lines (0.3 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 19

- level w6-1 @268.1s: "It's a new sound. Tap its petal, and say it with me." cut after 1.9 of 4.0 s by /ae/
- level w6-1 @270.6s: "This sound can be spelt in two ways." cut after 1.1 of 2.5 s by /ae/
- level w6-1 @284.3s: "Tap it once more, and say it again." cut after 0.6 of 2.5 s by /ae/
- level w6-1 @340.3s: "What's the next sound?" cut after 0.9 of 1.3 s by /ae/
- level w6-2 @580.9s: ""train"" cut after 0.3 of 0.6 s by /t/
- level w6-3 @623.5s: "This sound can be spelt in two ways." cut after 0.1 of 2.5 s by /ee/
- level w6-3 @631.6s: "Now you tap it, and say the sound." cut after 0.6 of 2.5 s by /ee/
- level w6-3 @664.3s: "Which of these is the way we write..." cut after 2.2 of 2.7 s by /ee/
- level w6-6 @1025.8s: "This sound can be spelt in two ways." cut after 0.6 of 2.5 s by /oe/
- level w6-6 @1061.5s: "Which of these is the way we write..." cut after 0.3 of 2.7 s by /oe/
- level w6-6 @1062.3s: "Which of these is the way we write..." cut after 2.0 of 2.7 s by /oe/
- level w6-ec11 @1287.5s: "It's a new sound. Tap its petal, and say it with me." cut after 1.5 of 4.0 s by /ie/
- level w6-ec11 @1289.9s: "This sound can be spelt in two ways." cut after 0.8 of 2.5 s by /ie/
- level w6-ec11 @1299.1s: "Now you tap it, and say the sound." cut after 2.1 of 2.5 s by /ie/
- level w6-ec11 @1311.9s: "Now you tap it, and say it." cut after 1.8 of 2.1 s by /ie/
- level w6-ec11 @1322.3s: "Which of these is the way we write..." cut after 1.9 of 2.7 s by /ie/
- level w6-ec11 @1324.9s: "Which of these is the way we write..." cut after 1.7 of 2.7 s by /ie/
- level w6-7 @1488.7s: ""lie"" cut after 0.4 of 0.7 s by /l/
- level w6-10 @1660.0s: "story:s6_5" cut after 0.8 of 2.6 s by /g/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_sort_pair "This sound can be spelt in two ways." | 9 | level w6-br2, level w6-1, level w6-2, level w6-3, level w6-4, level w6-6, level w6-8, level w6-ec11, level w6-7 |
| t_two_letters "It's two letters, but it's one sound." | 5 | level w6-br1, level w6-1, level w6-3 ×2, level w6-6 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| r2_gems_more "Look, these gems have filled a little more." | 5 | reward ×5 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w6-ec11 |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C5-P: playtest/fix/D1/verify2/transcripts/continuous-perfect-from-w5-1.json

perfect, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 6 | n/a |
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
| `swap-place-heard` swap place lines heard to the end | all | 4 of 4 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.20 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `ask-cycle` one question, in any of its rotated variants, on more than 3 items running with no miss | 0 | 0 | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `talk-reward` talk before a child action in the rewards, World Flower trips and on the map (a level's closing talk into them included) | ≤ 15 s | max 34.4 s (level:w5-1 → reward:w5-1); 5 over | **FAIL** |
| `talk-longest` the longest run of talk before a child action anywhere in the session (levels, rewards, trips, the map, the welcome) | ≤ 15 s | max 34.4 s (level:w5-1 → reward:w5-1); 6 over (level→reward 5, level 1) | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 9 words (median line 6 words; 106 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 65 of 65, rabbit 57 of 57 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line (into the reward included) | ≤ 12 s | max 34.4 s (build w5-1 into reward:w5-1); 1 over | **FAIL** |

- **talk-reward**: level:w5-1 → reward:w5-1 34.4 s from ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@3:54.3); level:w5-6 → reward:w5-6 22.3 s from ‹sound:z› "/z/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@18:21.4); level:w5-3 → reward:w5-3 21.0 s from ‹sound:s› "/s/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@10:44.5); level:w5-4 → reward:w5-4 18.5 s from ‹sound:f› "/f/" to ‹tv_jump_offer› "Wow, you got everything right! Grown-ups, if this is too easy, you can" (@13:29.4); level:w5-2 → reward:w5-2 16.7 s from ‹sound:k› "/k/" to ‹audit_gem_more› "Look, this gem has filled a little more." (@7:19.2)
- **talk-longest**: level:w5-1 → reward:w5-1 34.4 s from ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@3:54.3); level:w5-6 → reward:w5-6 22.3 s from ‹sound:z› "/z/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@18:21.4); level:w5-3 → reward:w5-3 21.0 s from ‹sound:s› "/s/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@10:44.5); level:w5-4 → reward:w5-4 18.5 s from ‹sound:f› "/f/" to ‹tv_jump_offer› "Wow, you got everything right! Grown-ups, if this is too easy, you can" (@13:29.4); level:w5-2 → reward:w5-2 16.7 s from ‹sound:k› "/k/" to ‹audit_gem_more› "Look, this gem has filled a little more." (@7:19.2); level:w5-11 15.2 s from ‹baron_w5› "Welcome to my castle, little ninja! In here, some sounds are spelt wit" to ‹tv_boss_ready› "Are you ready to beat the boss? Tap the green arrow." (@25:43.1)
- **fs-talk**: build (w5-1 into reward:w5-1) 34.4 s from ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."

### C5-S: playtest/fix/D1/verify2/transcripts/continuous-splitter-from-w5-1.json

splitter, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 13 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 1 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 2 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 3 | **FAIL** |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 6 of 6 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.24 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `ask-cycle` one question, in any of its rotated variants, on more than 3 items running with no miss | 0 | 0 | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | 6 of 6 (100%) | pass |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `talk-reward` talk before a child action in the rewards, World Flower trips and on the map (a level's closing talk into them included) | ≤ 15 s | max 35.3 s (level:w5-1 → reward:w5-1); 4 over | **FAIL** |
| `talk-longest` the longest run of talk before a child action anywhere in the session (levels, rewards, trips, the map, the welcome) | ≤ 15 s | max 35.3 s (level:w5-1 → reward:w5-1); 4 over (level→reward 4) | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 5 words; 97 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 53 of 53, rabbit 43 of 43 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line (into the reward included) | ≤ 12 s | max 35.3 s (build w5-1 into reward:w5-1); 1 over | **FAIL** |

- **letters-60s**: w5-1 @3:22.1 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **map-hint-cut**: map @0:06.3 ‹tv_map_hint› "The glowing stone is your next game. Tap it when you're ready." cut
- **cut-explanations**: map @0:06.3 ‹tv_map_hint› "The glowing stone is your next game. Tap it when you're ready."
- **talk-reward**: level:w5-1 → reward:w5-1 35.3 s from ‹streak_3› "Ninja power!" to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@4:41.8); level:w5-3 → reward:w5-3 20.8 s from ‹sound:k› "/k/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@12:39.7); level:w5-6 → reward:w5-6 20.4 s from ‹sound:d› "/d/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@21:25.5); level:w5-2 → reward:w5-2 16.5 s from ‹sound:w› "/w/" to ‹audit_gem_more› "Look, this gem has filled a little more." (@8:52.4)
- **talk-longest**: level:w5-1 → reward:w5-1 35.3 s from ‹streak_3› "Ninja power!" to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@4:41.8); level:w5-3 → reward:w5-3 20.8 s from ‹sound:k› "/k/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@12:39.7); level:w5-6 → reward:w5-6 20.4 s from ‹sound:d› "/d/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@21:25.5); level:w5-2 → reward:w5-2 16.5 s from ‹sound:w› "/w/" to ‹audit_gem_more› "Look, this gem has filled a little more." (@8:52.4)
- **fs-talk**: build (w5-1 into reward:w5-1) 35.3 s from ‹streak_3› "Ninja power!" to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."

### C6-P: playtest/fix/D1/verify2/transcripts/continuous-perfect-from-w6-br1.json

perfect, from w6-br1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 | 10 | pass |
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
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.02 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `ask-cycle` one question, in any of its rotated variants, on more than 3 items running with no miss | 0 | 0 | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 4 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.3 s (sort w6-br1); 0 over | pass |
| `talk-reward` talk before a child action in the rewards, World Flower trips and on the map (a level's closing talk into them included) | ≤ 15 s | max 19.3 s (level:w6-br1 → reward:w6-br1); 4 over | **FAIL** |
| `talk-longest` the longest run of talk before a child action anywhere in the session (levels, rewards, trips, the map, the welcome) | ≤ 15 s | max 19.3 s (level:w6-br1 → reward:w6-br1); 9 over (level→reward 4, level 5) | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 7 words; 94 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line (into the reward included) | ≤ 12 s | max 19.1 s (build w6-1 into reward:w6-1); 1 over | **FAIL** |

- **cut-explanations**: w6-1 @4:30.6 ‹audit_sort_pair› "This sound can be spelt in two ways."; w6-3 @10:23.5 ‹audit_sort_pair› "This sound can be spelt in two ways."; w6-6 @17:05.8 ‹audit_sort_pair› "This sound can be spelt in two ways."; w6-ec11 @21:29.9 ‹audit_sort_pair› "This sound can be spelt in two ways."
- **talk-reward**: level:w6-br1 → reward:w6-br1 19.3 s from ‹sound:s› "/s/" to ‹tv_jump_offer› "Wow, you got everything right! Grown-ups, if this is too easy, you can" (@1:55.4); level:w6-1 → reward:w6-1 19.1 s from ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@7:24.0); level:w6-3 → reward:w6-3 17.9 s from ‹sound:b› "/b/" to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@12:17.7); level:w6-5 → reward:w6-5 15.9 s from ‹sound:g› "/g/" to ‹r2_gems_more› "Look, these gems have filled a little more." (@16:20.5)
- **talk-longest**: level:w6-br1 → reward:w6-br1 19.3 s from ‹sound:s› "/s/" to ‹tv_jump_offer› "Wow, you got everything right! Grown-ups, if this is too easy, you can" (@1:55.4); level:w6-1 → reward:w6-1 19.1 s from ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@7:24.0); level:w6-br2 18.5 s from ‹audit_sort_again› "Sorting time! Same sound, different spellings." to ‹help_sort› "Tap the chest with the same spelling as the word." (@2:29.1); level:w6-3 → reward:w6-3 17.9 s from ‹sound:b› "/b/" to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@12:17.7); level:w6-5 → reward:w6-5 15.9 s from ‹sound:g› "/g/" to ‹r2_gems_more› "Look, these gems have filled a little more." (@16:20.5); level:w6-7 15.6 s from ‹audit_sort_again› "Sorting time! Same sound, different spellings." to ‹help_sort› "Tap the chest with the same spelling as the word." (@24:04.3)
- **fs-talk**: build (w6-1 into reward:w6-1) 19.1 s from ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

