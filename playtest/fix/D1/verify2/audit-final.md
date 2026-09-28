# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/D1/verify2/final/continuous-perfect-from-w5-1.json (perfect-from-w5-1, one continuous page)

274 Sensei lines, 562 sounds and words, 387 utterances in 52 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_your_word | 7 | Your word is... |
| tv_next_word | 7 | Here's your next word... |
| tv_here_sound | 7 | Here's the sound... |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| next_sound_q | 5 | What's the next sound? |
| t_another_way | 5 | This is another way to spell the sound... |
| yay_4 | 5 | Well done. |
| t_two_letters | 4 | It's two letters, but it's one sound. |
| audit_gem_more | 4 | Look, this gem has filled a little more. |
| tv_swap_now_change | 4 | Now let's change it to... |
| tv_swap_both | 4 | Listen to them both... |
| st_what_change | 4 | What do we need to change? |
| tv_swap_pick | 4 | Now tap the new one. |
| r2_gems_more | 4 | Look, these gems have filled a little more. |
| tv_tap_letter_say | 3 | Now you tap it, and say the sound. |
| tv_said_well | 3 | Good, you said that sound really well. |
| tv_petal_say_short | 3 | Tap its petal, and say it. |
| tv_tap_it_say_short | 3 | Now you tap it, and say it. |
| tv_find_write | 3 | Find how we write... |
| first_sound_q | 3 | What's the first sound? |
| last_sound_q | 3 | What's the last sound? |
| tv_to_reward | 3 | Let's see what you won back from Baron Muddle. |
| tv_battle_again | 3 | Another monster! Let's zap it with words. |
| tv_yay_thats_it | 3 | That's it! |
| battle_win | 3 | Hooray! The monster ran away! |
| tv_next_sound_known | 3 | Our next sound is one you know... |
| tv_and_another_way | 3 | And here's another way to spell it... |
| t_ways_2 | 3 | Now you know two ways to spell... |
| tv_petal_say | 2 | Tap the petal, and say it with me. |

### Echoes: the same utterance shape back to back (1)

- level w5-3 @502.6s ×2: /s/ What's the next sound? ‖ /t/ What's the next sound?

### Near repeats: the same line again within 15 s (8)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @102.6s and @104.9s |
| next_sound_q | 2 | What's the next sound? | level w5-3 @503.6s and @505.2s |
| tv_guess_q | 1 | Listen for the word... | level w5-5 @742.6s and @754.1s |
| tv_run_which | 1 | Tap the lantern with my word. | level w5-5 @746.1s and @758.0s |
| t_ways_2 | 1 | Now you know two ways to spell... | world flower @1034.5s and @1046.4s |

### Spliced utterances: 70 of 387 (18%); chains of 5+ clips: 47

Commonest spliced shapes:

- ×3 ‹tv_battle_again› + ‹tv_your_word› + W
- ×3 ‹tv_next_sound_known› + /X/
- ×3 ‹tv_here_sound› + /X/
- ×2 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×2 ‹tv_which_write› + /X/
- ×2 W + ‹tv_show_offer_short› + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 ‹tv_next_word› + W
- ×1 ‹tv_learn_first_short› + /X/
- ×1 ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/
- ×1 ‹tv_learn_another› + /X/
- ×1 ‹tv_and_how_we_write› + /X/
- ×1 ‹tv_learn_last› + /X/
- ×1 /X/ + ‹t_same_spelling_sometimes› + /X/ + ‹st_th_moth_sometimes› + /X/ + ‹tg_th_dh_in›

Longest chains:

- level w5-4 @666.7s (10 clips): /ch/ /i/ /k/ "chick" Now let's change it to... "chin" Listen to them both... "chick" (slowly) "chin" (slowly) What do we need to change?
- level w5-8 @1173.0s (10 clips): /l/ /o/ /k/ "lock" Now let's change it to... "log" Listen to them both... "lock" (slowly) "log" (slowly) What do we need to change?
- level w5-3 @513.1s (8 clips): /s/ /t/ /r/ /o/ /ng/ "strong" Here's your next word... "long"
- level w5-4 @648.2s (8 clips): "thick" If you'd like to see me do one first, tap my paw. Now let's change it to... "chick" Listen to them both... "thick" (slowly) "chick" (slowly) What do we need to change?
- level w5-8 @1155.0s (8 clips): "rock" If you'd like to see me do one first, tap my paw. Now let's change it to... "lock" Listen to them both... "rock" (slowly) "lock" (slowly) What do we need to change?
- level w5-1 @134.1s (7 clips): /t/ Ninja power! Let's say the sounds, the slow way... /ch/ /a/ /t/ Now tap the rabbit, and read the word fast.
- reward @225.7s (7 clips): Let's see what you won back from Baron Muddle. You won back four sounds... /sh/ /ch/ /th/ /dh/ More stickers for your Sticker Book!
- level w5-6 @923.6s (7 clips): /h/ /u/ /ch/ "hutch" You built that whole word by yourself! Here's your next word... "quiz"

### Praise: 16 lines (0.6 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 26

- level w5-1 @20.1s: "Tap the petal, and say it with me." cut after 1.8 of 2.5 s by /sh/
- level w5-1 @30.5s: "Now you tap it, and say the sound." cut after 1.6 of 2.5 s by /sh/
- level w5-1 @33.4s: "Tap it once more, and say it again." cut after 0.0 of 2.5 s by /sh/
- level w5-1 @40.5s: "Tap its petal, and say it." cut after 1.6 of 2.4 s by /ch/
- level w5-1 @50.2s: "Now you tap it, and say it." cut after 1.6 of 2.1 s by /ch/
- level w5-1 @102.6s: "Which of these is the way we write..." cut after 1.5 of 2.7 s by /sh/
- level w5-1 @104.9s: "Which of these is the way we write..." cut after 2.3 of 2.7 s by /ch/
- level w5-1 @111.3s: "/th/" cut after 0.1 of 0.7 s by /th/
- level w5-3 @429.0s: "It's a new sound. Tap its petal, and say it with me." cut after 1.9 of 4.0 s by /ng/
- level w5-3 @439.0s: "Now you tap it, and say the sound." cut after 1.5 of 2.5 s by /ng/
- level w5-3 @449.1s: "Tap its petal, and say it." cut after 1.8 of 2.4 s by /k/
- level w5-3 @459.5s: "Now you tap it, and say it." cut after 1.5 of 2.1 s by /k/
- level w5-3 @486.0s: "Which of these is the way we write..." cut after 1.8 of 2.7 s by /k/
- level w5-3 @492.9s: "/w/" cut after 0.4 of 0.7 s by /w/
- level w5-4 @660.2s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the first sound changes!
- level w5-4 @676.1s: "What do we need to change?" cut after 1.5 of 1.8 s by Yes, the last sound changes!
- level w5-6 @834.1s: "Tap the petal, and say it with me." cut after 1.3 of 2.5 s by /k/
- level w5-6 @840.4s: "Now you tap it, and say the sound." cut after 1.5 of 2.5 s by /k/
- level w5-6 @851.0s: "Tap its petal, and say it." cut after 1.5 of 2.4 s by /w/
- level w5-6 @901.6s: "Which of these is the way we write..." cut after 1.4 of 2.7 s by /k/
- level w5-6 @903.1s: "Which of these is the way we write..." cut after 1.9 of 2.7 s by /w/
- level w5-6 @907.4s: "/v/" cut after 0.2 of 0.9 s by /v/
- level w5-6 @910.7s: "Now find how we write..." cut after 1.5 of 2.1 s by /ch/
- level w5-6 @961.0s: "/n/" cut after 0.5 of 0.9 s by /th/
- level w5-8 @1167.0s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the first sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_another_way "This is another way to spell the sound..." | 5 | level w5-3, world flower ×2, level w5-6 ×2 |
| t_two_letters "It's two letters, but it's one sound." | 4 | level w5-1, level w5-3, level w5-6, level w5-11 |
| audit_gem_more "Look, this gem has filled a little more." | 4 | reward ×4 |
| r2_gems_more "Look, these gems have filled a little more." | 4 | reward ×4 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |
| wf_spelling_of "This is a spelling of the sound..." | 1 | world flower |
| same_sound_diff "Same sound, different spellings!" | 1 | world flower |

## playtest/fix/D1/verify2/final/continuous-learner-from-w5-1.json (learner-from-w5-1, one continuous page)

400 Sensei lines, 635 sounds and words, 465 utterances in 52 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| next_sound_q | 20 | What's the next sound? |
| tv_listen_here | 16 | Let's listen again. What can you hear here? |
| first_sound_q | 15 | What's the first sound? |
| last_sound_q | 15 | What's the last sound? |
| audit_spelling_help_plain | 14 | Listen to the word again. What sound do you hear here? |
| say_sounds_read | 14 | Say the sounds, and read the word. |
| tv_your_word | 13 | Your word is... |
| audit_listen_next | 11 | Let's listen again. What sound comes next? |
| tv_praise_kept_going | 10 | That was a tricky one, and you kept going. |
| tv_next_word | 10 | Here's your next word... |
| tv_here_sound | 7 | Here's the sound... |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| tv_swap_pick | 6 | Now tap the new one. |
| we_need | 5 | We need... |
| t_another_way | 5 | This is another way to spell the sound... |
| tv_swap_now_change | 5 | Now let's change it to... |
| tv_swap_both | 5 | Listen to them both... |
| st_what_change | 5 | What do we need to change? |
| t_two_letters | 4 | It's two letters, but it's one sound. |
| tv_thats_write | 4 | That's how we write... |
| st_first_changes | 4 | Yes, the first sound changes! |
| streak_3 | 4 | Ninja power! |
| tv_tap_letter_say | 3 | Now you tap it, and say the sound. |
| tv_said_well | 3 | Good, you said that sound really well. |
| tv_petal_say_short | 3 | Tap its petal, and say it. |
| tv_tap_it_say_short | 3 | Now you tap it, and say it. |
| tv_find_write | 3 | Find how we write... |
| yay_8 | 3 | Wow, great listening! |
| tv_to_reward | 3 | Let's see what you won back from Baron Muddle. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (13)

| Line | Repeats | Text | Example |
|---|---|---|---|
| next_sound_q | 5 | What's the next sound? | level w5-1 @188.0s and @191.1s |
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @111.4s and @119.9s |
| tv_thats_write | 1 | That's how we write... | level w5-1 @114.1s and @120.0s |
| we_need | 1 | We need... | level w5-1 @117.1s and @122.3s |
| tv_which_changes | 1 | Which sound changes? | level w5-4 @895.1s and @907.6s |
| tv_run_which | 1 | Tap the lantern with my word. | level w5-5 @968.5s and @983.3s |
| t_ways_2 | 1 | Now you know two ways to spell... | world flower @1372.6s and @1387.4s |

### Spliced utterances: 85 of 465 (18%); chains of 5+ clips: 56

Commonest spliced shapes:

- ×3 ‹tv_battle_again› + ‹tv_your_word› + W
- ×3 ‹tv_next_word› + W
- ×3 ‹tv_next_sound_known› + /X/
- ×3 ‹tv_here_sound› + /X/
- ×3 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 ‹tv_thats_write› + /X/
- ×2 ‹we_need› + /X/
- ×2 ‹tv_next_build_plain› + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_yay_lovely› + ‹tv_next_word› + W + ‹first_sound_q›
- ×2 W + ‹tv_show_offer_short› + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say›
- ×1 ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×1 ‹tv_learn_another› + /X/

Longest chains:

- level w5-3 @651.2s (11 clips): Say the sounds, and read the word. /s/ /t/ /r/ /o/ /ng/ "strong" That was a tricky one, and you kept going. Here's your next word... "chick" What's the first sound?
- level w5-4 @861.6s (11 clips): /r/ /i/ /ng/ "ring" Ninja power! Now let's change it to... "rip" Listen to them both... "ring" (slowly) "rip" (slowly) What do we need to change?
- level w5-1 @205.0s (10 clips): Say the sounds, and read the word. /m/ /u/ /n/ /ch/ "munch" You said it slowly, and found every sound. Your word is... "shop" What's the first sound?
- level w5-4 @915.3s (10 clips): /sh/ /o/ /p/ "shop" Ninja power! Now let's change it to... "hop" "shop" (slowly) "hop" (slowly) What do we need to change?
- level w5-1 @262.8s (9 clips): Say the sounds, and read the word. /dh/ /e/ /m/ "them" That was a tricky one, and you kept going. Your word is... "chat" What's the first sound?
- level w5-3 @678.7s (9 clips): /k/ Say the sounds, and read the word. /ch/ /i/ /k/ "chick" Your word is... "lock" What's the first sound?
- level w5-3 @700.7s (9 clips): Say the sounds, and read the word. /l/ /o/ /k/ "lock" Lovely! Here's your next word... "sing" What's the first sound?
- level w5-6 @1187.9s (9 clips): Say the sounds, and read the word. /f/ /e/ /ch/ "fetch" Lovely! Here's your next word... "rug" What's the first sound?

### Praise: 16 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 14

- level w5-1 @35.3s: "Tap it once more, and say it again." cut after 0.1 of 2.5 s by /sh/
- level w5-1 @114.0s: "/sh/" cut after 0.1 of 0.8 s by That's how we write...
- level w5-1 @119.9s: "Which of these is the way we write..." cut after 0.1 of 2.7 s by That's how we write...
- level w5-1 @131.5s: "Now find how we write..." cut after 0.5 of 2.1 s by /o/
- level w5-3 @539.9s: "It's a new sound. Tap its petal, and say it with me." cut after 3.1 of 4.0 s by /ng/
- level w5-4 @853.2s: "What do we need to change?" cut after 1.4 of 1.8 s by Yes, the first sound changes!
- level w5-4 @873.6s: "What do we need to change?" cut after 0.7 of 1.8 s by Yes, the last sound changes!
- level w5-4 @895.1s: "Which sound changes?" cut after 0.6 of 1.9 s by Yes, the first sound changes!
- level w5-4 @907.6s: "Which sound changes?" cut after 0.5 of 1.9 s by Yes, the middle sound changes!
- level w5-4 @925.6s: "What do we need to change?" cut after 1.3 of 1.8 s by Yes, the first sound changes!
- level w5-6 @1150.7s: "/w/" cut after 0.4 of 0.7 s by Keep going, ninja.
- level w5-8 @1566.1s: "What do we need to change?" cut after 1.1 of 1.8 s by Yes, the last sound changes!
- level w5-8 @1584.4s: "What do we need to change?" cut after 1.1 of 1.8 s by Ninja power!
- level w5-8 @1633.0s: "Which sound changes?" cut after 1.1 of 1.9 s by Yes, the last sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_another_way "This is another way to spell the sound..." | 5 | level w5-3, world flower ×2, level w5-6 ×2 |
| t_two_letters "It's two letters, but it's one sound." | 4 | level w5-1, level w5-3, level w5-6, level w5-7 |
| audit_gem_more "Look, this gem has filled a little more." | 3 | reward ×3 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |
| wf_spelling_of "This is a spelling of the sound..." | 1 | world flower |
| same_sound_diff "Same sound, different spellings!" | 1 | world flower |

## playtest/fix/D1/verify2/final/continuous-perfect-from-w6-br1.json (perfect-from-w6-br1, one continuous page)

268 Sensei lines, 555 sounds and words, 338 utterances in 59 pieces.

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
| st_two_letters_too | 4 | This one's two letters too, but it's just one sound. |
| audit_gem_more | 4 | Look, this gem has filled a little more. |
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
| last_sound_q | 4 | What's the last sound? |
| tv_yay_lovely | 4 | Lovely! |
| tv_build_done | 4 | You built words with their sounds, and you read them. |
| tv_won_one | 4 | You won back a sound... |
| tv_to_flower_first | 4 | Now let's go and see where your sounds live. Tap the green arrow. |

### Echoes: the same utterance shape back to back (1)

- level w6-ec11 @1191.2s ×2: What's the next sound? /r/ ‖ What's the next sound? /ie/

### Near repeats: the same line again within 15 s (7)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w6-1 @284.3s and @286.3s |
| tv_watch_write | 2 | Now watch my ninja write it. | level w6-3 @550.2s and @564.5s |
| next_sound_q | 1 | What's the next sound? | level w6-ec11 @1191.2s and @1193.3s |

### Spliced utterances: 52 of 338 (15%); chains of 5+ clips: 57

Commonest spliced shapes:

- ×4 ‹tv_here_it_comes› + /X/
- ×3 /X/ + ‹tv_watch_write› + ‹tv_and_another_way› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/
- ×3 ‹tv_which_write› + /X/
- ×3 ‹tv_to_reward› + ‹tv_won_one› + /X/
- ×3 ‹t_ways_2› + /X/ + ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 ‹t_ways_2› + /X/
- ×2 ‹audit_sort_pair› + ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×1 ‹tv_here_sound› + /X/ + ‹audit_bridging_first› + ‹tv_sort_frame› + ‹tv_sort_open›
- ×1 ‹t_two_letters› + /X/ + ‹tv_sort_ido› + W + ‹tv_sort_see› + ‹tv_sort_so› + ‹tv_ready_yours›
- ×1 ‹audit_sort_again› + ‹tv_here_sound› + /X/ + ‹audit_sort_pair› + ‹tg_ch_ch_way› + ‹st_two_letters_too› + /X/ + ‹tv_spelt_like_this_match›
- ×1 ‹audit_sort_pair› + ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say›
- ×1 ‹tv_ne_again› + ‹tv_petal_hint› + ‹tv_which_write› + /X/
- ×1 ‹yay_2› + ‹tv_next_build_plain› + ‹tv_your_word› + W + ‹first_sound_q› + /X/
- ×1 ‹tv_fs_say_sounds_slow› + /X/ + /X/
- ×1 ‹tv_fs_two_ways› + ‹tv_next_word› + W

Longest chains:

- level w6-br2 @137.1s (8 clips): Sorting time! Same sound, different spellings. Here's the sound... /ch/ This sound can be spelt in two ways. This is the way we spell it in chick. This one's two letters too, but it's just one sound. /ch/ In match, it's spelt like this.
- level w6-ec11 @1137.1s (8 clips): /ie/ You can hear it in... "light" "night" ...and... "high" It's a new sound. Tap its petal, and say it with me. /ie/
- level w6-br1 @40.3s (7 clips): It's two letters, but it's one sound. /k/ I'll sort the first one. My word is... "lock" I can see this spelling at the end. So it goes in this chest. Now you do one. Are you ready?
- level w6-1 @261.8s (7 clips): /ae/ Now watch my ninja write it. And here's another way to spell it... /ae/ This one's two letters too, but it's just one sound. Now you tap it, and say it. /ae/
- level w6-1 @326.3s (7 clips): Say the sounds, and read the word. /p/ /ae/ /n/ /t/ "paint" You said it slowly, and found every sound.
- level w6-3 @547.7s (7 clips): This sound can be spelt in two ways. Now watch my ninja write it. This is how we write... /ee/ It's two letters, but it's one sound. Now you tap it, and say the sound. /ee/
- level w6-3 @563.9s (7 clips): /ee/ Now watch my ninja write it. And here's another way to spell it... /ee/ This one's two letters too, but it's just one sound. Now you tap it, and say it. /ee/
- level w6-3 @586.6s (7 clips): /ee/ That's it! Next, we're going to build some words. Your word is... "eat" What's the first sound? /ee/

### Praise: 7 lines (0.3 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 25

- level w6-br1 @89.4s: ""cap"" cut after 0.2 of 0.5 s by /k/
- level w6-1 @240.3s: "It's a new sound. Tap its petal, and say it with me." cut after 2.6 of 4.0 s by /ae/
- level w6-1 @258.2s: "Tap it once more, and say it again." cut after 0.1 of 2.5 s by /ae/
- level w6-1 @284.3s: "Which of these is the way we write..." cut after 1.6 of 2.7 s by /ae/
- level w6-1 @286.3s: "Which of these is the way we write..." cut after 1.9 of 2.7 s by /ae/
- level w6-1 @297.5s: "What's the last sound?" cut after 1.2 of 1.5 s by /ae/
- level w6-2 @472.9s: ""tail"" cut after 0.3 of 0.6 s by /t/
- level w6-2 @482.7s: ""nail"" cut after 0.3 of 0.6 s by /n/
- level w6-3 @545.2s: "It's a new sound. Tap its petal, and say it with me." cut after 1.7 of 4.0 s by /ee/
- level w6-3 @557.6s: "Now you tap it, and say the sound." cut after 1.5 of 2.5 s by /ee/
- level w6-3 @572.9s: "Now you tap it, and say it." cut after 1.8 of 2.1 s by /ee/
- level w6-3 @582.6s: "Which of these is the way we write..." cut after 1.9 of 2.7 s by /ee/
- level w6-3 @585.1s: "Which of these is the way we write..." cut after 1.5 of 2.7 s by /ee/
- level w6-3 @595.2s: "What's the last sound?" cut after 1.2 of 1.5 s by /t/
- level w6-6 @884.3s: "It's a new sound. Tap its petal, and say it with me." cut after 1.9 of 4.0 s by /oe/
- level w6-6 @896.8s: "Now you tap it, and say the sound." cut after 1.3 of 2.5 s by /oe/
- level w6-6 @921.2s: "Which of these is the way we write..." cut after 1.6 of 2.7 s by /oe/
- level w6-6 @923.3s: "Which of these is the way we write..." cut after 1.5 of 2.7 s by /oe/
- level w6-6 @935.3s: "What's the last sound?" cut after 1.2 of 1.5 s by /t/
- level w6-8 @1072.8s: ""soap"" cut after 0.5 of 0.8 s by /s/
- level w6-ec11 @1142.7s: "It's a new sound. Tap its petal, and say it with me." cut after 1.7 of 4.0 s by /ie/
- level w6-ec11 @1155.4s: "Now you tap it, and say the sound." cut after 1.9 of 2.5 s by /ie/
- level w6-ec11 @1178.0s: "Which of these is the way we write..." cut after 1.8 of 2.7 s by /ie/
- level w6-ec11 @1180.4s: "Which of these is the way we write..." cut after 2.0 of 2.7 s by /ie/
- level w6-ec11 @1195.7s: "What's the last sound?" cut after 1.0 of 1.5 s by /t/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_sort_pair "This sound can be spelt in two ways." | 9 | level w6-br2, level w6-1, level w6-2, level w6-3, level w6-4, level w6-6, level w6-8, level w6-ec11, level w6-7 |
| t_two_letters "It's two letters, but it's one sound." | 5 | level w6-br1, level w6-1, level w6-3, level w6-6, level w6-9 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| audit_gem_more "Look, this gem has filled a little more." | 4 | reward ×4 |
| r2_gems_more "Look, these gems have filled a little more." | 4 | reward ×4 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w6-ec11 |

## playtest/fix/D1/verify2/final/continuous-learner-from-w6-br1.json (learner-from-w6-br1, one continuous page)

386 Sensei lines, 616 sounds and words, 415 utterances in 59 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| next_sound_q | 22 | What's the next sound? |
| first_sound_q | 19 | What's the first sound? |
| last_sound_q | 19 | What's the last sound? |
| say_sounds_read | 18 | Say the sounds, and read the word. |
| tv_your_word | 13 | Your word is... |
| tv_here_sound | 10 | Here's the sound... |
| tv_listen_here | 10 | Let's listen again. What can you hear here? |
| audit_sort_pair | 9 | This sound can be spelt in two ways. |
| tv_next_word | 9 | Here's your next word... |
| tv_watch_write | 8 | Now watch my ninja write it. |
| tv_and_another_way | 8 | And here's another way to spell it... |
| t_ways_2 | 8 | Now you know two ways to spell... |
| tv_which_write | 8 | Which of these is the way we write... |
| streak_lost | 8 | Keep going, ninja. |
| audit_spelling_help_plain | 8 | Listen to the word again. What sound do you hear here? |
| audit_listen_next | 7 | Let's listen again. What sound comes next? |
| help_sort | 6 | Tap the chest with the same spelling as the word. |
| streak_3 | 6 | Ninja power! |
| tv_praise_sorted | 6 | That's the right chest. |
| tv_sort_done | 6 | Same sound, different spellings. You sorted them all. |
| tv_praise_kept_going | 6 | That was a tricky one, and you kept going. |
| t_two_letters | 5 | It's two letters, but it's one sound. |
| audit_sort_again | 5 | Sorting time! Same sound, different spellings. |
| streak_6 | 4 | Wow! Super ninja streak! |
| audit_gem_more | 4 | Look, this gem has filled a little more. |
| tv_learn_how | 4 | I'll say each sound, and show you how we write it. Then you say it with me. |
| tv_here_it_comes | 4 | Here it comes... |
| tv_new_petal_say | 4 | It's a new sound. Tap its petal, and say it with me. |
| tv_how_we_write | 4 | This is how we write... |
| tv_tap_letter_say | 4 | Now you tap it, and say the sound. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (10)

| Line | Repeats | Text | Example |
|---|---|---|---|
| next_sound_q | 5 | What's the next sound? | level w6-1 @333.3s and @336.7s |
| tv_which_write | 4 | Which of these is the way we write... | level w6-1 @305.3s and @309.0s |
| last_sound_q | 1 | What's the last sound? | level w6-ec11 @1546.2s and @1560.2s |

### Spliced utterances: 66 of 415 (16%); chains of 5+ clips: 63

Commonest spliced shapes:

- ×4 ‹tv_here_it_comes› + /X/
- ×4 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_next_word› + W + ‹first_sound_q›
- ×2 ‹we_need› + /X/
- ×2 /X/ + ‹tv_watch_write› + ‹tv_and_another_way› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×2 ‹t_ways_2› + /X/ + ‹tv_ne_again› + ‹tv_which_write› + /X/ + /X/
- ×2 ‹tv_thats_write› + /X/
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_next_word› + W + ‹first_sound_q› + /X/
- ×2 ‹tv_to_reward› + ‹tv_won_one› + /X/
- ×2 ‹tv_which_write› + /X/ + /X/
- ×1 ‹tv_here_sound› + /X/ + ‹audit_bridging_first› + ‹tv_sort_frame› + ‹tv_sort_open›
- ×1 ‹tv_spelt_like_this_duck› + ‹t_two_letters› + /X/ + ‹tv_sort_ido› + W + ‹tv_sort_see› + ‹tv_sort_so› + ‹tv_ready_yours›
- ×1 ‹audit_sort_again› + ‹tv_here_sound› + /X/ + ‹audit_sort_pair› + ‹tg_ch_ch_way› + ‹t_two_letters› + /X/ + ‹tv_spelt_like_this_match›
- ×1 ‹audit_sort_pair› + ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_letter_say›
- ×1 /X/ + ‹tv_watch_write› + ‹tv_and_another_way› + /X/
- ×1 ‹t_ways_2› + /X/

Longest chains:

- level w6-ec11 @1622.1s (11 clips): Say the sounds, and read the word. /k/ /w/ /ee/ /n/ "queen" Lovely! Your word is... "nut" What's the first sound? /n/
- level w6-3 @746.6s (10 clips): Say the sounds, and read the word. /d/ /r/ /ee/ /m/ "dream" Wow, great listening! Your word is... "feet" What's the first sound?
- level w6-6 @1235.4s (10 clips): Say the sounds, and read the word. /t/ /oe/ /s/ /t/ "toast" That was a tricky one, and you kept going. Your word is... "boat" What's the first sound?
- level w6-1 @439.0s (9 clips): Say the sounds, and read the word. /p/ /l/ /ae/ "play" That was a tricky one, and you kept going. Your word is... "tail" What's the first sound?
- level w6-3 @773.3s (9 clips): Say the sounds, and read the word. /f/ /ee/ /t/ "feet" Here's your next word... "tree" What's the first sound? /t/
- level w6-6 @1262.3s (9 clips): Say the sounds, and read the word. /b/ /oe/ /t/ "boat" Here's your next word... "slow" What's the first sound? /s/
- level w6-6 @1283.2s (9 clips): Say the sounds, and read the word. /s/ /l/ /oe/ "slow" That's it! Your word is... "tray" What's the first sound?
- level w6-br1 @41.4s (8 clips): In duck, it's spelt like this. It's two letters, but it's one sound. /k/ I'll sort the first one. My word is... "rock" I can see this spelling at the end. So it goes in this chest. Now you do one. Are you ready?

### Praise: 17 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 19

- level w6-br2 @208.2s: ""chest"" cut after 0.5 of 0.8 s by /ch/
- level w6-br2 @226.3s: ""hutch"" cut after 0.4 of 0.8 s by /h/
- level w6-1 @262.9s: "It's a new sound. Tap its petal, and say it with me." cut after 3.5 of 4.0 s by /ae/
- level w6-1 @281.1s: "Tap it once more, and say it again." cut after 0.5 of 2.5 s by /ae/
- level w6-2 @570.7s: ""train"" cut after 0.2 of 0.6 s by /t/
- level w6-3 @638.9s: "It's a new sound. Tap its petal, and say it with me." cut after 3.1 of 4.0 s by /ee/
- level w6-3 @683.7s: "Which of these is the way we write..." cut after 0.1 of 2.7 s by Keep going, ninja.
- level w6-3 @781.5s: "What's the first sound?" cut after 0.6 of 1.6 s by /t/
- level w6-4 @931.7s: ""dream"" cut after 0.2 of 0.8 s by /d/
- level w6-4 @956.3s: ""seat"" cut after 0.2 of 0.6 s by /s/
- level w6-6 @1131.9s: "It's a new sound. Tap its petal, and say it with me." cut after 3.4 of 4.0 s by /oe/
- level w6-6 @1177.2s: "/oe/" cut after 0.1 of 0.5 s by Keep going, ninja.
- level w6-6 @1186.5s: "/oe/" cut after 0.2 of 0.5 s by /oe/
- level w6-6 @1269.8s: "What's the first sound?" cut after 0.1 of 1.6 s by /s/
- level w6-8 @1410.9s: ""soap"" cut after 0.2 of 0.8 s by /s/
- level w6-8 @1434.1s: ""goat"" cut after 0.3 of 0.6 s by /g/
- level w6-ec11 @1482.0s: "It's a new sound. Tap its petal, and say it with me." cut after 2.8 of 4.0 s by /ie/
- level w6-ec11 @1529.7s: "/ie/" cut after 0.3 of 0.7 s by /ie/
- level w6-ec11 @1632.6s: "What's the first sound?" cut after 0.5 of 1.6 s by /n/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_sort_pair "This sound can be spelt in two ways." | 9 | level w6-br2, level w6-1, level w6-2, level w6-3, level w6-4, level w6-6, level w6-8, level w6-ec11, level w6-7 |
| t_two_letters "It's two letters, but it's one sound." | 5 | level w6-br1, level w6-br2, level w6-3, level w6-6, level w6-9 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| audit_gem_more "Look, this gem has filled a little more." | 4 | reward ×4 |
| t_three_letters "It's three letters, but it's just one sound." | 2 | level w6-ec11 ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |

## playtest/fix/D1/verify2/final/continuous-splitter-from-w5-1.json (splitter-from-w5-1, one continuous page)

258 Sensei lines, 449 sounds and words, 327 utterances in 38 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| t_two_letters | 7 | It's two letters, but it's one sound. |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_your_word | 6 | Your word is... |
| tv_next_word | 6 | Here's your next word... |
| tv_here_sound | 6 | Here's the sound... |
| tv_which_write | 5 | Which of these is the way we write... |
| streak_3 | 5 | Ninja power! |
| we_need | 5 | We need... |
| next_sound_q | 5 | What's the next sound? |
| t_another_way | 5 | This is another way to spell the sound... |
| streak_lost | 4 | Keep going, ninja. |
| first_sound_q | 4 | What's the first sound? |
| last_sound_q | 4 | What's the last sound? |
| thats | 4 | That's... |
| tv_yay_thats_it | 4 | That's it! |
| audit_gem_more | 4 | Look, this gem has filled a little more. |
| yay_8 | 4 | Wow, great listening! |
| tv_swap_now_change | 4 | Now let's change it to... |
| tv_swap_both | 4 | Listen to them both... |
| st_what_change | 4 | What do we need to change? |
| tv_swap_pick | 4 | Now tap the new one. |
| tv_map_hint | 3 | The glowing stone is your next game. Tap it when you're ready. |
| tv_tap_letter_say | 3 | Now you tap it, and say the sound. |
| tv_said_well | 3 | Good, you said that sound really well. |
| tv_petal_say_short | 3 | Tap its petal, and say it. |
| tv_tap_it_say_short | 3 | Now you tap it, and say it. |
| tv_find_write | 3 | Find how we write... |
| say_sounds_read | 3 | Say the sounds, and read the word. |
| tv_to_reward | 3 | Let's see what you won back from Baron Muddle. |
| tv_next_sound_known | 3 | Our next sound is one you know... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (4)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 2 | Which of these is the way we write... | level w5-3 @585.0s and @588.1s |
| next_sound_q | 1 | What's the next sound? | level w5-6 @1101.3s and @1105.4s |
| t_ways_2 | 1 | Now you know two ways to spell... | world flower @1260.9s and @1274.8s |

### Spliced utterances: 65 of 327 (20%); chains of 5+ clips: 44

Commonest spliced shapes:

- ×3 ‹thats› + /X/ + ‹we_need› + /X/ + ‹t_two_letters›
- ×3 ‹tv_next_sound_known› + /X/
- ×3 ‹tv_here_sound› + /X/
- ×2 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×2 ‹tv_find_write› + /X/
- ×2 ‹tv_battle_again› + ‹tv_your_word› + W
- ×2 ‹tv_next_word› + W
- ×2 ‹tv_next_build_plain› + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 W + ‹tv_show_offer_short› + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_learn_first_short› + /X/
- ×1 ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×1 ‹tv_learn_another› + /X/
- ×1 ‹tv_and_how_we_write› + /X/

Longest chains:

- level w5-4 @796.0s (10 clips): /p/ /i/ /n/ "pin" Now let's change it to... "chin" Listen to them both... "pin" (slowly) "chin" (slowly) What do we need to change?
- level w5-8 @1437.5s (10 clips): /sh/ /i/ /p/ "ship" Now let's change it to... "shop" Listen to them both... "ship" (slowly) "shop" (slowly) What do we need to change?
- level w5-1 @215.1s (8 clips): /s/ Ninja power! Let's say it the slow way... "this" (slowly) And now, fast... "this" Here's your next word... "much"
- level w5-4 @777.2s (8 clips): "pick" If you'd like to see me do one first, tap my paw. Now let's change it to... "pin" Listen to them both... "pick" (slowly) "pin" (slowly) What do we need to change?
- level w5-8 @1418.6s (8 clips): "whip" If you'd like to see me do one first, tap my paw. Now let's change it to... "ship" Listen to them both... "whip" (slowly) "ship" (slowly) What do we need to change?
- reward @280.2s (7 clips): Let's see what you won back from Baron Muddle. You won back four sounds... /sh/ /ch/ /th/ /dh/ More stickers for your Sticker Book!
- level w5-3 @613.3s (7 clips): /w/ /i/ /p/ "whip" You built that whole word by yourself! Here's your next word... "ring"
- level w5-3 @682.8s (7 clips): /s/ /t/ /r/ /o/ /ng/ "strong" You built words with their sounds, and you read them.

### Praise: 13 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 5

- level w5-1 @35.3s: "Tap it once more, and say it again." cut after 0.1 of 2.5 s by /sh/
- level w5-3 @521.4s: "It's a new sound. Tap its petal, and say it with me." cut after 3.3 of 4.0 s by /ng/
- level w5-4 @789.4s: "What do we need to change?" cut after 1.1 of 1.8 s by Yes, the last sound changes!
- level w5-4 @806.6s: "What do we need to change?" cut after 0.9 of 1.8 s by Yes, the first sound changes!
- level w5-8 @1431.3s: "What do we need to change?" cut after 1.1 of 1.8 s by Yes, the first sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 7 | level w5-1 ×3, level w5-2, level w5-3, level w5-6, level w5-7 |
| t_another_way "This is another way to spell the sound..." | 5 | level w5-3, world flower ×2, level w5-6 ×2 |
| audit_gem_more "Look, this gem has filled a little more." | 4 | reward ×4 |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |
| wf_spelling_of "This is a spelling of the sound..." | 1 | world flower |

## playtest/fix/D1/verify2/final/continuous-watcher.json (watcher, one continuous page)

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

### C5-P: playtest/fix/D1/verify2/final/continuous-perfect-from-w5-1.json

perfect, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 7 | n/a |
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
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.22 | pass |
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
| `talk-reward` talk before a child action in the rewards, World Flower trips and on the map (a level's closing talk into them included) | ≤ 15 s | max 38.1 s (level:w5-1 → reward:w5-1); 5 over | **FAIL** |
| `talk-longest` the longest run of talk before a child action anywhere in the session (levels, rewards, trips, the map, the welcome) | ≤ 15 s | max 38.1 s (level:w5-1 → reward:w5-1); 5 over (level→reward 5) | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 9 words (median line 6 words; 105 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line (into the reward included) | ≤ 12 s | max 38.1 s (build w5-1 into reward:w5-1); 1 over | **FAIL** |

- **talk-reward**: level:w5-1 → reward:w5-1 38.1 s from ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@3:32.0); level:w5-11 → reward:w5-11 19.9 s from ‹sound:th› "/th/" to ‹r2_gems_more› "Look, these gems have filled a little more." (@25:51.0); level:w5-3 → reward:w5-3 19.9 s from ‹sound:r› "/r/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@9:27.7); level:w5-6 → reward:w5-6 17.2 s from ‹sound:w› "/w/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@16:11.3); level:w5-2 → reward:w5-2 15.7 s from ‹sound:sh› "/sh/" to ‹audit_gem_more› "Look, this gem has filled a little more." (@6:29.0)
- **talk-longest**: level:w5-1 → reward:w5-1 38.1 s from ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@3:32.0); level:w5-11 → reward:w5-11 19.9 s from ‹sound:th› "/th/" to ‹r2_gems_more› "Look, these gems have filled a little more." (@25:51.0); level:w5-3 → reward:w5-3 19.9 s from ‹sound:r› "/r/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@9:27.7); level:w5-6 → reward:w5-6 17.2 s from ‹sound:w› "/w/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@16:11.3); level:w5-2 → reward:w5-2 15.7 s from ‹sound:sh› "/sh/" to ‹audit_gem_more› "Look, this gem has filled a little more." (@6:29.0)
- **fs-talk**: build (w5-1 into reward:w5-1) 38.1 s from ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."

### C5-L: playtest/fix/D1/verify2/final/continuous-learner-from-w5-1.json

learner, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 7 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×1, world_6 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 8 of 8 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.14 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `ask-cycle` one question, in any of its rotated variants, on more than 3 items running with no miss | 0 | 0 | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `talk-reward` talk before a child action in the rewards, World Flower trips and on the map (a level's closing talk into them included) | ≤ 15 s | max 26.8 s (level:w5-1 → reward:w5-1); 5 over | **FAIL** |
| `talk-longest` the longest run of talk before a child action anywhere in the session (levels, rewards, trips, the map, the welcome) | ≤ 15 s | max 26.8 s (level:w5-1 → reward:w5-1); 5 over (level→reward 5) | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 9 words (median line 6 words; 175 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 73 of 73, rabbit 57 of 57 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line (into the reward included) | ≤ 12 s | max 12.8 s (build w5-1); 1 over | **FAIL** |

- **talk-reward**: level:w5-1 → reward:w5-1 26.8 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@4:50.1); level:w5-6 → reward:w5-6 19.9 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@21:37.7); level:w5-3 → reward:w5-3 18.0 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@12:28.3); level:w5-11 → reward:w5-11 18.0 s from ‹sound:s› "/s/" to ‹audit_gem_more› "Look, this gem has filled a little more." (@34:51.3); level:w5-2 → reward:w5-2 15.6 s from ‹sound:d› "/d/" to ‹audit_gem_more› "Look, this gem has filled a little more." (@8:18.4)
- **talk-longest**: level:w5-1 → reward:w5-1 26.8 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@4:50.1); level:w5-6 → reward:w5-6 19.9 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@21:37.7); level:w5-3 → reward:w5-3 18.0 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@12:28.3); level:w5-11 → reward:w5-11 18.0 s from ‹sound:s› "/s/" to ‹audit_gem_more› "Look, this gem has filled a little more." (@34:51.3); level:w5-2 → reward:w5-2 15.6 s from ‹sound:d› "/d/" to ‹audit_gem_more› "Look, this gem has filled a little more." (@8:18.4)
- **fs-talk**: build (w5-1) 12.8 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹first_sound_q› "What's the first sound?", with ‹tv_fs_praise_every› "You said it slowly, and found every sound."

### C6-P: playtest/fix/D1/verify2/final/continuous-perfect-from-w6-br1.json

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
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.12 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `ask-cycle` one question, in any of its rotated variants, on more than 3 items running with no miss | 0 | 0 | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.3 s (sort w6-br1); 0 over | pass |
| `talk-reward` talk before a child action in the rewards, World Flower trips and on the map (a level's closing talk into them included) | ≤ 15 s | max 24.1 s (level:w6-1 → reward:w6-1); 4 over | **FAIL** |
| `talk-longest` the longest run of talk before a child action anywhere in the session (levels, rewards, trips, the map, the welcome) | ≤ 15 s | max 24.1 s (level:w6-1 → reward:w6-1); 9 over (level→reward 3, level 5, map→level 1) | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 7 words; 93 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line (into the reward included) | ≤ 12 s | max 24.1 s (build w6-1 into reward:w6-1); 1 over | **FAIL** |

- **talk-reward**: level:w6-1 → reward:w6-1 24.1 s from ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@6:15.0); level:w6-br1 → reward:w6-br1 19.4 s from ‹sound:s› "/s/" to ‹tv_jump_offer› "Wow, you got everything right! Grown-ups, if this is too easy, you can" (@1:44.2); level:w6-6 → reward:w6-6 17.6 s from ‹sound:g› "/g/" to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@16:24.0); map → level:w6-br1 16.7 s from ‹tv_map_next_sort› "Next is a new game, called Sorting. Tap the glowing stone to play." to ‹tv_sort_open› "This sound can be spelt in three ways. Tap each chest to open it." (@0:06.0)
- **talk-longest**: level:w6-1 → reward:w6-1 24.1 s from ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@6:15.0); level:w6-br1 → reward:w6-br1 19.4 s from ‹sound:s› "/s/" to ‹tv_jump_offer› "Wow, you got everything right! Grown-ups, if this is too easy, you can" (@1:44.2); level:w6-br2 18.5 s from ‹audit_sort_again› "Sorting time! Same sound, different spellings." to ‹help_sort› "Tap the chest with the same spelling as the word." (@2:17.1); level:w6-6 → reward:w6-6 17.6 s from ‹sound:g› "/g/" to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@16:24.0); map → level:w6-br1 16.7 s from ‹tv_map_next_sort› "Next is a new game, called Sorting. Tap the glowing stone to play." to ‹tv_sort_open› "This sound can be spelt in three ways. Tap each chest to open it." (@0:06.0); level:w6-7 15.7 s from ‹audit_sort_again› "Sorting time! Same sound, different spellings." to ‹help_sort› "Tap the chest with the same spelling as the word." (@21:37.1)
- **fs-talk**: build (w6-1 into reward:w6-1) 24.1 s from ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."

### C6-L: playtest/fix/D1/verify2/final/continuous-learner-from-w6-br1.json

learner, from w6-br1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 10 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 1 sounds | n/a |
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
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.41 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `ask-cycle` one question, in any of its rotated variants, on more than 3 items running with no miss | 0 | 0 | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 2 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 13.5 s (sort w6-br1); 0 over | pass |
| `talk-reward` talk before a child action in the rewards, World Flower trips and on the map (a level's closing talk into them included) | ≤ 15 s | max 19.4 s (level:w6-6 → reward:w6-6); 5 over | **FAIL** |
| `talk-longest` the longest run of talk before a child action anywhere in the session (levels, rewards, trips, the map, the welcome) | ≤ 15 s | max 19.4 s (level:w6-6 → reward:w6-6); 8 over (level→reward 4, level 3, map→level 1) | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 6 words; 156 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line (into the reward included) | ≤ 12 s | max 14.2 s (build w6-1); 1 over | **FAIL** |

- **talk-reward**: level:w6-6 → reward:w6-6 19.4 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@21:47.3); level:w6-br1 → reward:w6-br1 18.5 s from ‹sound:ch› "/ch/" to ‹tv_jump_offer› "Wow, you got everything right! Grown-ups, if this is too easy, you can" (@2:03.0); level:w6-3 → reward:w6-3 17.5 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@13:39.4); map → level:w6-br1 16.8 s from ‹tv_map_next_sort› "Next is a new game, called Sorting. Tap the glowing stone to play." to ‹tv_sort_open› "This sound can be spelt in three ways. Tap each chest to open it." (@0:06.0); level:w6-1 → reward:w6-1 15.9 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@7:45.0)
- **talk-longest**: level:w6-6 → reward:w6-6 19.4 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@21:47.3); level:w6-br1 → reward:w6-br1 18.5 s from ‹sound:ch› "/ch/" to ‹tv_jump_offer› "Wow, you got everything right! Grown-ups, if this is too easy, you can" (@2:03.0); level:w6-br2 17.9 s from ‹audit_sort_again› "Sorting time! Same sound, different spellings." to ‹help_sort› "Tap the chest with the same spelling as the word." (@2:36.0); level:w6-3 → reward:w6-3 17.5 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@13:39.4); map → level:w6-br1 16.8 s from ‹tv_map_next_sort› "Next is a new game, called Sorting. Tap the glowing stone to play." to ‹tv_sort_open› "This sound can be spelt in three ways. Tap each chest to open it." (@0:06.0); level:w6-1 → reward:w6-1 15.9 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@7:45.0)
- **fs-talk**: build (w6-1) 14.2 s from ‹sound:t› "/t/" to ‹first_sound_q› "What's the first sound?", with ‹tv_fs_praise_every› "You said it slowly, and found every sound."

### C5-S: playtest/fix/D1/verify2/final/continuous-splitter-from-w5-1.json

splitter, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 10 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
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
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.32 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `ask-cycle` one question, in any of its rotated variants, on more than 3 items running with no miss | 0 | 0 | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | 4 of 4 (100%) | pass |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `talk-reward` talk before a child action in the rewards, World Flower trips and on the map (a level's closing talk into them included) | ≤ 15 s | max 29.5 s (level:w5-1 → reward:w5-1); 4 over | **FAIL** |
| `talk-longest` the longest run of talk before a child action anywhere in the session (levels, rewards, trips, the map, the welcome) | ≤ 15 s | max 29.5 s (level:w5-1 → reward:w5-1); 4 over (level→reward 4) | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 6 words; 98 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 51 of 51, rabbit 43 of 43 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line (into the reward included) | ≤ 12 s | max 12.7 s (build w5-1); 1 over | **FAIL** |

- **map-hint-cut**: map @0:05.2 ‹tv_map_hint› "The glowing stone is your next game. Tap it when you're ready." cut
- **cut-explanations**: map @0:05.2 ‹tv_map_hint› "The glowing stone is your next game. Tap it when you're ready."
- **talk-reward**: level:w5-1 → reward:w5-1 29.5 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@4:29.4); level:w5-3 → reward:w5-3 22.3 s from ‹sound:s› "/s/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@11:22.8); level:w5-6 → reward:w5-6 16.9 s from ‹sound:k› "/k/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@19:48.0); level:w5-2 → reward:w5-2 16.3 s from ‹sound:d› "/d/" to ‹audit_gem_more› "Look, this gem has filled a little more." (@7:59.4)
- **talk-longest**: level:w5-1 → reward:w5-1 29.5 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow." (@4:29.4); level:w5-3 → reward:w5-3 22.3 s from ‹sound:s› "/s/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@11:22.8); level:w5-6 → reward:w5-6 16.9 s from ‹sound:k› "/k/" to ‹tv_to_flower› "Let's take your new sounds to the World Flower. Tap the green arrow." (@19:48.0); level:w5-2 → reward:w5-2 16.3 s from ‹sound:d› "/d/" to ‹audit_gem_more› "Look, this gem has filled a little more." (@7:59.4)
- **fs-talk**: build (w5-1) 12.7 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹first_sound_q› "What's the first sound?", with ‹tv_fs_praise_every› "You said it slowly, and found every sound."

### C-W: playtest/fix/D1/verify2/final/continuous-watcher.json

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

