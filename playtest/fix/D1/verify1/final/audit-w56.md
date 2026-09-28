# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/D1/verify1/final/continuous-perfect-from-w5-1.json (perfect-from-w5-1, one continuous page)

292 Sensei lines, 577 sounds and words, 397 utterances in 52 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_your_word | 7 | Your word is... |
| tv_next_word | 7 | Here's your next word... |
| tv_here_sound | 7 | Here's the sound... |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| wf_found_gem | 6 | You found a new gem! It's a spelling of the sound... |
| tv_swap_now_change | 5 | Now let's change it to... |
| st_first_changes | 5 | Yes, the first sound changes! |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| t_in | 4 | ...in... |
| yay_4 | 4 | Well done. |
| r2_gems_more | 4 | Look, these gems have filled a little more. |
| tv_swap_both | 4 | Listen to them both... |
| st_what_change | 4 | What do we need to change? |
| tv_swap_pick | 4 | Now tap the new one. |
| tv_which_changes | 4 | Which sound changes? |
| tv_petal_say | 3 | Tap the petal, and say it with me. |
| tv_how_we_write | 3 | This is how we write... |
| t_two_letters | 3 | It's two letters, but it's one sound. |
| tv_tap_letter_say | 3 | Now you tap it, and say the sound. |
| tv_said_well | 3 | Good, you said that sound really well. |
| tv_tap_it_say_short | 3 | Now you tap it, and say it. |
| tv_ne_new_sounds | 3 | Now let's play Ninja Eyes, with your new sounds. |
| tv_find_write | 3 | Find how we write... |
| tv_build_dojo | 3 | Now let's build some words with your new sounds. |
| first_sound_q | 3 | What's the first sound? |
| next_sound_q | 3 | What's the next sound? |
| last_sound_q | 3 | What's the last sound? |
| tv_fs_say_slow | 3 | Let's say it the slow way... |
| tv_fs_now_fast | 3 | And now, fast... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (12)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @98.8s and @101.3s |
| t_in | 2 | ...in... | world flower @274.6s and @277.6s |
| tv_which_changes | 2 | Which sound changes? | level w5-4 @687.1s and @696.4s |
| tv_here_sound | 1 | Here's the sound... | world flower @265.1s and @280.0s |
| tv_guess_q | 1 | Listen for the word... | level w5-5 @743.4s and @756.6s |
| tv_run_which | 1 | Tap the lantern with my word. | level w5-5 @747.6s and @760.6s |
| wf_found_gem | 1 | You found a new gem! It's a spelling of the sound... | world flower @1041.7s and @1055.8s |
| t_ways_2 | 1 | Now you know two ways to spell... | world flower @1051.2s and @1065.7s |

### Spliced utterances: 71 of 397 (18%); chains of 5+ clips: 54

Commonest spliced shapes:

- ×4 ‹tv_next_word› + W
- ×2 ‹tv_battle_again› + ‹tv_your_word› + W
- ×2 ‹tv_fs_say_slow› + /X/ + /X/ + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×2 ‹tv_fs_slow_tortoise› + /X/ + /X/ + /X/ + ‹tv_fs_fast_rabbit› + W
- ×2 ‹tv_learn_frame_ways› + ‹tv_here_sound› + /X/
- ×2 /X/ + ‹tv_next_sound_known› + /X/
- ×2 ‹tv_which_write› + /X/
- ×2 ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q› + /X/
- ×2 /X/ + /X/ + /X/ + W + ‹tv_praise_built› + ‹tv_next_word› + W
- ×2 W + ‹tv_show_offer_short› + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_learn_short_four› + ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×1 /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/

Longest chains:

- level w5-4 @662.8s (10 clips): /th/ /i/ /k/ "thick" Now let's change it to... "thin" Listen to them both... "thick" (slowly) "thin" (slowly) What do we need to change?
- level w5-8 @1219.5s (10 clips): /sh/ /i/ /p/ "ship" Now let's change it to... "shop" Listen to them both... "ship" (slowly) "shop" (slowly) What do we need to change?
- level w5-4 @644.6s (8 clips): "chick" If you'd like to see me do one first, tap my paw. Now let's change it to... "thick" Listen to them both... "chick" (slowly) "thick" (slowly) What do we need to change?
- world flower @1032.7s (8 clips): The same spelling can sometimes be... /u/ ...in... "hutch" ...and sometimes... /w/ ...in... "queen"
- level w5-8 @1197.0s (8 clips): "whip" If you'd like to see me do one first, tap my paw. Now let's change it to... "ship" Listen to them both... "whip" (slowly) "ship" (slowly) What do we need to change?
- level w5-1 @72.6s (7 clips): And this is how we write... /dh/ The same spelling can sometimes be... /th/ ...in moth, and sometimes... /dh/ ...in this.
- level w5-1 @120.8s (7 clips): /dh/ Wow! Super ninja streak! Let's say the sounds, the slow way... /w/ /i/ /dh/ Now tap the rabbit, and read the word fast.
- reward @209.2s (7 clips): Let's see what you won back from Baron Muddle. You won back four sounds... /sh/ /ch/ /th/ /dh/ More stickers for your Sticker Book!

### Praise: 16 lines (0.6 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 24

- level w5-1 @19.4s: "Tap the petal, and say it with me." cut after 1.8 of 2.5 s by /sh/
- level w5-1 @29.6s: "Now you tap it, and say the sound." cut after 1.4 of 2.5 s by /sh/
- level w5-1 @38.7s: "Tap its petal, and say it." cut after 1.5 of 2.4 s by /ch/
- level w5-1 @48.3s: "Now you tap it, and say it." cut after 1.4 of 2.1 s by /ch/
- level w5-1 @98.8s: "Which of these is the way we write..." cut after 1.7 of 2.7 s by /sh/
- level w5-1 @101.3s: "Which of these is the way we write..." cut after 1.9 of 2.7 s by /ch/
- level w5-1 @107.1s: "/th/" cut after 0.0 of 0.7 s by /th/
- level w5-1 @107.8s: "Now find how we write..." cut after 0.6 of 2.1 s by /dh/
- level w5-1 @117.8s: "What's the next sound?" cut after 1.0 of 1.3 s by /i/
- level w5-3 @425.5s: "Tap the petal, and say it with me." cut after 2.1 of 2.5 s by /k/
- level w5-3 @435.6s: "Now you tap it, and say the sound." cut after 1.4 of 2.5 s by /k/
- level w5-3 @448.5s: "It's a new sound. Tap its petal, and say it with me." cut after 1.4 of 4.0 s by /ng/
- level w5-3 @484.0s: "Which of these is the way we write..." cut after 1.9 of 2.7 s by /k/
- level w5-3 @486.0s: "Which of these is the way we write..." cut after 1.9 of 2.7 s by /ng/
- level w5-4 @656.7s: "What do we need to change?" cut after 0.9 of 1.8 s by Yes, the first sound changes!
- level w5-4 @673.5s: "What do we need to change?" cut after 1.3 of 1.8 s by Yes, the last sound changes!
- level w5-6 @838.1s: "Tap the petal, and say it with me." cut after 1.6 of 2.5 s by /k/
- level w5-6 @844.7s: "Now you tap it, and say the sound." cut after 1.8 of 2.5 s by /k/
- level w5-6 @855.1s: "Tap its petal, and say it." cut after 1.8 of 2.4 s by /w/
- level w5-6 @862.6s: "Now you tap it, and say it." cut after 1.8 of 2.1 s by /w/
- level w5-6 @906.1s: "Which of these is the way we write..." cut after 1.6 of 2.7 s by /k/
- level w5-6 @907.9s: "Which of these is the way we write..." cut after 1.9 of 2.7 s by /w/
- level w5-6 @913.6s: "/v/" cut after 0.2 of 0.9 s by /v/
- level w5-10 @1470.9s: "Your turn to read." cut after 0.2 of 1.2 s by story:s5_2

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 4 | reward ×4 |
| t_two_letters "It's two letters, but it's one sound." | 3 | level w5-1, level w5-3, level w5-6 |
| t_another_way "This is another way to spell the sound..." | 3 | level w5-3, level w5-6 ×2 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |

## playtest/fix/D1/verify1/final/continuous-learner-from-w5-1.json (learner-from-w5-1, one continuous page)

416 Sensei lines, 647 sounds and words, 467 utterances in 52 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_listen_here | 23 | Let's listen again. What can you hear here? |
| next_sound_q | 20 | What's the next sound? |
| audit_listen_next | 19 | Let's listen again. What sound comes next? |
| first_sound_q | 15 | What's the first sound? |
| last_sound_q | 15 | What's the last sound? |
| say_sounds_read | 14 | Say the sounds, and read the word. |
| tv_your_word | 13 | Your word is... |
| tv_next_word | 10 | Here's your next word... |
| tv_here_sound | 7 | Here's the sound... |
| tv_praise_kept_going | 7 | That was a tricky one, and you kept going. |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| streak_3 | 6 | Ninja power! |
| wf_found_gem | 6 | You found a new gem! It's a spelling of the sound... |
| tv_swap_now_change | 6 | Now let's change it to... |
| tv_swap_both | 6 | Listen to them both... |
| tv_swap_pick | 6 | Now tap the new one. |
| audit_gem_more | 5 | Look, this gem has filled a little more. |
| t_two_letters | 4 | It's two letters, but it's one sound. |
| tv_tap_it_say_short | 4 | Now you tap it, and say it. |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| tv_thats_write | 4 | That's how we write... |
| we_need | 4 | We need... |
| t_in | 4 | ...in... |
| st_what_change | 4 | What do we need to change? |
| st_last_changes | 4 | Yes, the last sound changes! |
| st_first_changes | 4 | Yes, the first sound changes! |
| tv_which_changes | 4 | Which sound changes? |
| tv_petal_say | 3 | Tap the petal, and say it with me. |
| tv_how_we_write | 3 | This is how we write... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (13)

| Line | Repeats | Text | Example |
|---|---|---|---|
| next_sound_q | 5 | What's the next sound? | level w5-1 @145.9s and @149.0s |
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @111.3s and @120.0s |
| t_in | 2 | ...in... | world flower @340.8s and @344.1s |
| tv_which_changes | 1 | Which sound changes? | level w5-4 @870.6s and @880.4s |
| tv_guess_q | 1 | Listen for the word... | level w5-5 @954.5s and @964.7s |
| tv_run_which | 1 | Tap the lantern with my word. | level w5-5 @958.0s and @968.9s |

### Spliced utterances: 84 of 467 (18%); chains of 5+ clips: 52

Commonest spliced shapes:

- ×3 ‹tv_battle_again› + ‹tv_your_word› + W
- ×3 ‹tv_next_word› + W
- ×2 /X/ + ‹we_need› + /X/
- ×2 ‹tv_learn_frame_ways› + ‹tv_here_sound› + /X/
- ×2 /X/ + ‹tv_next_sound_known› + /X/
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + /X/ + W + ‹tv_next_word› + W + ‹first_sound_q›
- ×1 ‹tv_learn_short_four› + ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/
- ×1 /X/ + ‹tv_learn_another› + /X/
- ×1 ‹tv_how_we_write› + /X/
- ×1 /X/ + ‹tv_learn_last› + /X/
- ×1 ‹tv_and_how_we_write› + /X/ + ‹t_same_spelling_sometimes› + /X/ + ‹st_th_moth_sometimes› + /X/ + ‹tg_th_dh_in›

Longest chains:

- level w5-4 @848.8s (11 clips): /m/ /o/ /p/ "mop" Ninja power! Now let's change it to... "chop" Listen to them both... "mop" (slowly) "chop" (slowly) What do we need to change?
- level w5-1 @240.4s (10 clips): Say the sounds, and read the word. /sh/ /e/ /l/ "shell" It's two letters, but it's one sound. /l/ Your word is... "rush" What's the first sound?
- level w5-3 @634.7s (10 clips): Say the sounds, and read the word. /s/ /t/ /u/ /k/ "stuck" That was a tricky one, and you kept going. Here's your next word... "pick" What's the first sound?
- level w5-4 @899.7s (10 clips): /sh/ /i/ /p/ "ship" Ninja power! Now let's change it to... "shop" "ship" (slowly) "shop" (slowly) Which sound needs to change?
- level w5-6 @1238.0s (10 clips): Say the sounds, and read the word. /s/ /k/ /e/ /ch/ "sketch" Wow, great listening! Your word is... "quit" What's the first sound?
- level w5-1 @192.1s (9 clips): Say the sounds, and read the word. /ch/ /o/ /p/ "chop" You said it slowly, and found every sound. Your word is... "that" What's the first sound?
- level w5-1 @217.5s (9 clips): /t/ Say the sounds, and read the word. /dh/ /a/ /t/ "that" Here's your next word... "shell" What's the first sound?
- level w5-3 @683.2s (9 clips): Say the sounds, and read the word. /s/ /i/ /ng/ "sing" Brilliant! Here's your next word... "thick" What's the first sound?

### Praise: 19 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 16

- level w5-1 @35.9s: "Tap it once more, and say it again." cut after 0.2 of 2.5 s by /sh/
- level w5-1 @113.9s: "/sh/" cut after 0.4 of 0.8 s by That's how we write...
- level w5-1 @127.9s: "Now find how we write..." cut after 0.5 of 2.1 s by /dh/
- level w5-1 @266.4s: "/sh/" cut after 0.5 of 0.8 s by Say the sounds, and read the word.
- level w5-3 @551.0s: "It's a new sound. Tap its petal, and say it with me." cut after 3.2 of 4.0 s by /ng/
- level w5-4 @840.9s: "What do we need to change?" cut after 0.9 of 1.8 s by Yes, the last sound changes!
- level w5-4 @860.2s: "What do we need to change?" cut after 0.7 of 1.8 s by Yes, the first sound changes!
- level w5-4 @880.4s: "Which sound changes?" cut after 1.3 of 1.9 s by Yes, the middle sound changes!
- level w5-4 @891.9s: "Which sound needs to change?" cut after 0.4 of 1.8 s by Yes, the first sound changes!
- level w5-4 @910.8s: "Which sound needs to change?" cut after 0.8 of 1.8 s by Yes, the middle sound changes!
- level w5-6 @1119.6s: "Tap its petal, and say it." cut after 0.4 of 2.4 s by /ch/
- level w5-6 @1132.2s: "Now you tap it, and say it." cut after 0.8 of 2.1 s by /ch/
- level w5-6 @1162.4s: "Now find how we write..." cut after 0.7 of 2.1 s by That's how we write...
- level w5-6 @1309.1s: "Let's listen again. What can you hear here?" cut after 2.3 of 2.7 s by /w/
- level w5-8 @1693.3s: "What do we need to change?" cut after 1.4 of 1.8 s by Ninja power!
- level w5-8 @1742.9s: "Which sound needs to change?" cut after 0.8 of 1.8 s by Yes, the last sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_more "Look, this gem has filled a little more." | 5 | reward ×5 |
| t_two_letters "It's two letters, but it's one sound." | 4 | level w5-1 ×2, level w5-3, level w5-6 |
| t_another_way "This is another way to spell the sound..." | 3 | level w5-3, level w5-6 ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |

## playtest/fix/D1/verify1/final/continuous-perfect-from-w6-br1.json (perfect-from-w6-br1, one continuous page)

281 Sensei lines, 579 sounds and words, 355 utterances in 59 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_here_sound | 10 | Here's the sound... |
| tv_watch_write | 8 | Now watch my ninja write it. |
| tv_which_write | 8 | Which of these is the way we write... |
| t_two_letters | 6 | It's two letters, but it's one sound. |
| help_sort | 6 | Tap the chest with the same spelling as the word. |
| tv_praise_sorted | 6 | That's the right chest. |
| tv_sort_done | 6 | Same sound, different spellings. You sorted them all. |
| audit_sort_again | 5 | Sorting time! Same sound, different spellings. |
| audit_sort_pair | 5 | This sound can be spelt in two ways. |
| tv_your_word | 5 | Your word is... |
| tv_next_word | 5 | Here's your next word... |
| audit_gem_more | 4 | Look, this gem has filled a little more. |
| st_two_letters_too | 4 | This one's two letters too, but it's just one sound. |
| tv_learn_short_two | 4 | Back to the dojo. Today there are two new sounds. |
| tv_learn_first_short | 4 | Here's the first new sound... |
| tv_petal_say | 4 | Tap the petal, and say it with me. |
| tv_how_we_write | 4 | This is how we write... |
| tv_tap_letter_say | 4 | Now you tap it, and say the sound. |
| tv_said_well | 4 | Good, you said that sound really well. |
| tv_next_sound_known | 4 | Our next sound is one you know... |
| tv_petal_say_short | 4 | Tap its petal, and say it. |
| t_another_way | 4 | This is another way to spell the sound... |
| tv_tap_it_say_short | 4 | Now you tap it, and say it. |
| tv_learn_all_two | 4 | Two new sounds! You said every one. |
| tv_ne_new_sounds | 4 | Now let's play Ninja Eyes, with your new sounds. |
| tv_yay_lovely | 4 | Lovely! |
| tv_build_dojo | 4 | Now let's build some words with your new sounds. |
| first_sound_q | 4 | What's the first sound? |
| last_sound_q | 4 | What's the last sound? |
| tv_build_done | 4 | You built words with their sounds, and you read them. |

### Echoes: the same utterance shape back to back (1)

- level w6-3 @600.2s ×2: What's the next sound? /w/ ‖ What's the next sound? /ee/

### Near repeats: the same line again within 15 s (6)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w6-1 @285.4s and @287.3s |
| next_sound_q | 1 | What's the next sound? | level w6-3 @600.2s and @602.9s |
| tv_guess_q | 1 | Listen for the word... | level w6-9 @1537.9s and @1552.2s |

### Spliced utterances: 57 of 355 (16%); chains of 5+ clips: 59

Commonest spliced shapes:

- ×4 ‹tv_learn_short_two› + ‹tv_learn_first_short› + /X/
- ×3 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×3 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/
- ×3 ‹tv_to_reward› + ‹tv_won_one› + /X/
- ×3 ‹tv_learn_all_two› + ‹tv_ne_new_sounds› + ‹tv_which_write› + /X/
- ×2 ‹tv_which_write› + /X/
- ×2 ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q› + /X/
- ×2 /X/ + ‹tv_said_well› + ‹tv_next_sound_known› + /X/
- ×1 ‹tv_here_sound› + /X/ + ‹audit_bridging_first› + ‹tv_sort_frame› + ‹tv_sort_open›
- ×1 ‹t_two_letters› + /X/ + ‹tv_sort_ido› + W + ‹tv_sort_see› + ‹tv_sort_so› + ‹tv_ready_yours›
- ×1 ‹audit_sort_again› + ‹tv_here_sound› + /X/ + ‹audit_sort_pair› + ‹tg_ch_ch_way› + ‹st_two_letters_too› + /X/ + ‹tv_spelt_like_this_match›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_next_sound_known› + /X/
- ×1 ‹tv_learn_all_two› + ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + /X/
- ×1 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×1 ‹tv_fs_two_ways› + ‹tv_next_word› + W

Longest chains:

- level w6-br2 @142.5s (8 clips): Sorting time! Same sound, different spellings. Here's the sound... /ch/ This sound can be spelt in two ways. This is the way we spell it in chick. This one's two letters too, but it's just one sound. /ch/ In match, it's spelt like this.
- level w6-9 @1563.5s (8 clips): /dh/ /e/ /n/ "then" This can be... /th/ ...but in this word, it's... /dh/
- level w6-br1 @41.0s (7 clips): It's two letters, but it's one sound. /k/ I'll sort the first one. My word is... "black" I can see this spelling at the end. So it goes in this chest. Now you do one. Are you ready?
- level w6-1 @323.4s (7 clips): Say the sounds, and read the word. /s/ /p/ /r/ /ae/ "spray" You said it slowly, and found every sound.
- level w6-3 @607.0s (7 clips): /k/ /w/ /ee/ /n/ "queen" Here's your next word... "beach"
- level w6-3 @657.4s (7 clips): /sh/ /ee/ /p/ "sheep" It's two letters, but it's one sound. /sh/ You built words with their sounds, and you read them.
- level w6-ec11 @1212.9s (7 clips): /ie/ You can hear it in... "light" "night" ...and... "high" Tap the petal, and say it with me.
- level w6-ec11 @1390.8s (7 clips): /g/ /oe/ /t/ "goat" You built words with their sounds, and you read them. You won back a sound... /ie/

### Praise: 9 lines (0.3 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 22

- level w6-1 @238.9s: "Tap the petal, and say it with me." cut after 2.2 of 2.5 s by /ae/
- level w6-1 @248.7s: "Now you tap it, and say the sound." cut after 1.9 of 2.5 s by /ae/
- level w6-1 @251.5s: "Tap it once more, and say it again." cut after 0.4 of 2.5 s by /ae/
- level w6-1 @259.0s: "Tap its petal, and say it." cut after 1.7 of 2.4 s by /ae/
- level w6-1 @285.4s: "Which of these is the way we write..." cut after 1.5 of 2.7 s by /ae/
- level w6-1 @287.3s: "Which of these is the way we write..." cut after 1.6 of 2.7 s by /ae/
- level w6-1 @296.1s: "What's the first sound?" cut after 1.3 of 1.6 s by /d/
- level w6-3 @544.1s: "Tap the petal, and say it with me." cut after 1.5 of 2.5 s by /ee/
- level w6-3 @553.6s: "Now you tap it, and say the sound." cut after 2.0 of 2.5 s by /ee/
- level w6-3 @564.4s: "Tap its petal, and say it." cut after 1.6 of 2.4 s by /ee/
- level w6-3 @575.4s: "Now you tap it, and say it." cut after 1.6 of 2.1 s by /ee/
- level w6-3 @587.1s: "Which of these is the way we write..." cut after 1.4 of 2.7 s by /ee/
- level w6-3 @589.1s: "Which of these is the way we write..." cut after 1.5 of 2.7 s by /ee/
- level w6-3 @602.9s: "What's the next sound?" cut after 1.0 of 1.3 s by /ee/
- level w6-6 @933.9s: "Tap the petal, and say it with me." cut after 1.9 of 2.5 s by /oe/
- level w6-6 @943.5s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /oe/
- level w6-6 @953.9s: "Tap its petal, and say it." cut after 2.1 of 2.4 s by /oe/
- level w6-6 @977.6s: "Which of these is the way we write..." cut after 1.4 of 2.7 s by /oe/
- level w6-ec11 @1230.5s: "Now you tap it, and say the sound." cut after 1.2 of 2.5 s by /ie/
- level w6-ec11 @1241.6s: "Tap its petal, and say it." cut after 2.0 of 2.4 s by /ie/
- level w6-ec11 @1380.2s: "Let's listen again. What can you hear here?" cut after 0.8 of 2.7 s by /g/
- level w6-10 @1682.0s: "story:s6_5" cut after 1.8 of 2.6 s by /g/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 6 | level w6-br1, level w6-1, level w6-3 ×2, level w6-6, level w6-ec11 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| audit_gem_more "Look, this gem has filled a little more." | 4 | reward ×4 |
| t_another_way "This is another way to spell the sound..." | 4 | level w6-1, level w6-3, level w6-6, level w6-ec11 |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w6-br1 |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w6-ec11 |

## playtest/fix/D1/verify1/final/continuous-learner-from-w6-br1.json (learner-from-w6-br1, one continuous page)

400 Sensei lines, 629 sounds and words, 439 utterances in 59 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| next_sound_q | 22 | What's the next sound? |
| first_sound_q | 20 | What's the first sound? |
| last_sound_q | 20 | What's the last sound? |
| say_sounds_read | 18 | Say the sounds, and read the word. |
| tv_listen_here | 16 | Let's listen again. What can you hear here? |
| tv_your_word | 13 | Your word is... |
| tv_here_sound | 10 | Here's the sound... |
| audit_listen_next | 10 | Let's listen again. What sound comes next? |
| tv_next_word | 9 | Here's your next word... |
| tv_watch_write | 8 | Now watch my ninja write it. |
| tv_which_write | 8 | Which of these is the way we write... |
| streak_lost | 7 | Keep going, ninja. |
| t_two_letters | 6 | It's two letters, but it's one sound. |
| help_sort | 6 | Tap the chest with the same spelling as the word. |
| tv_praise_sorted | 6 | That's the right chest. |
| tv_sort_done | 6 | Same sound, different spellings. You sorted them all. |
| tv_praise_kept_going | 6 | That was a tricky one, and you kept going. |
| streak_3 | 5 | Ninja power! |
| audit_gem_more | 5 | Look, this gem has filled a little more. |
| audit_sort_again | 5 | Sorting time! Same sound, different spellings. |
| audit_sort_pair | 5 | This sound can be spelt in two ways. |
| we_need | 5 | We need... |
| streak_6 | 4 | Wow! Super ninja streak! |
| tv_learn_short_two | 4 | Back to the dojo. Today there are two new sounds. |
| tv_learn_first_short | 4 | Here's the first new sound... |
| tv_petal_say | 4 | Tap the petal, and say it with me. |
| tv_how_we_write | 4 | This is how we write... |
| st_two_letters_too | 4 | This one's two letters too, but it's just one sound. |
| tv_tap_letter_say | 4 | Now you tap it, and say the sound. |
| tv_said_well | 4 | Good, you said that sound really well. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (10)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w6-1 @321.7s and @331.4s |
| next_sound_q | 4 | What's the next sound? | level w6-1 @372.2s and @375.6s |
| tv_listen_here | 2 | Let's listen again. What can you hear here? | level w6-6 @1296.2s and @1308.2s |

### Spliced utterances: 69 of 439 (16%); chains of 5+ clips: 65

Commonest spliced shapes:

- ×4 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_next_word› + W + ‹first_sound_q›
- ×3 ‹tv_learn_short_two› + ‹tv_learn_first_short› + /X/
- ×2 ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 ‹tv_said_well› + ‹tv_next_sound_known› + /X/
- ×2 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_praise_kept_going› + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 ‹tv_to_reward› + ‹tv_won_one› + /X/
- ×2 ‹tv_thats_write› + /X/ + ‹we_need›
- ×1 ‹tv_here_sound› + /X/ + ‹audit_bridging_first› + ‹tv_sort_frame› + ‹tv_sort_open›
- ×1 ‹t_two_letters› + /X/ + ‹tv_sort_ido› + W + ‹tv_sort_see› + ‹tv_sort_so› + ‹tv_ready_yours›
- ×1 ‹audit_sort_again› + ‹tv_here_sound› + /X/ + ‹audit_sort_pair› + ‹tg_ch_ch_way› + ‹t_two_letters› + /X/ + ‹tv_spelt_like_this_match›
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_letter_say› + /X/
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_next_sound_known› + /X/
- ×1 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹tv_tap_it_say_short›
- ×1 ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + /X/ + ‹streak_lost›

Longest chains:

- level w6-1 @386.5s (11 clips): Say the sounds, and read the word. /t/ /r/ /ae/ /n/ "train" You said it slowly, and found every sound. Your word is... "nail" What's the first sound? /n/
- level w6-1 @439.1s (10 clips): Say the sounds, and read the word. /s/ /p/ /r/ /ae/ "spray" That was a tricky one, and you kept going. Your word is... "tray" What's the first sound?
- level w6-3 @810.2s (10 clips): Say the sounds, and read the word. /s/ /l/ /ee/ /p/ "sleep" Wow, great listening! Your word is... "seat" What's the first sound?
- level w6-6 @1398.1s (10 clips): Say the sounds, and read the word. /g/ /r/ /oe/ "grow" That was a tricky one, and you kept going. Your word is... "slow" What's the first sound? /s/
- level w6-3 @753.7s (9 clips): Say the sounds, and read the word. /l/ /ee/ /f/ "leaf" That was a tricky one, and you kept going. Your word is... "beach" What's the first sound?
- level w6-6 @1320.8s (9 clips): Say the sounds, and read the word. /b/ /oe/ /t/ "boat" Well done. Your word is... "toast" What's the first sound?
- level w6-6 @1360.2s (9 clips): Say the sounds, and read the word. /t/ /oe/ /s/ /t/ "toast" Here's your next word... "grow" What's the first sound?
- level w6-ec11 @1713.9s (9 clips): Say the sounds, and read the word. /t/ /r/ /ae/ "tray" That was a tricky one, and you kept going. Your word is... "kid" What's the first sound?

### Praise: 17 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 15

- level w6-br1 @99.9s: ""crisp"" cut after 0.5 of 0.8 s by /k/
- level w6-1 @289.1s: "Tap it once more, and say it again." cut after 0.4 of 2.5 s by /ae/
- level w6-1 @398.8s: "What's the first sound?" cut after 0.1 of 1.6 s by /n/
- level w6-2 @578.9s: ""train"" cut after 0.2 of 0.6 s by /t/
- level w6-2 @613.3s: ""paint"" cut after 0.4 of 0.7 s by /p/
- level w6-3 @707.1s: "/ee/" cut after 0.2 of 0.6 s by /ee/
- level w6-4 @941.6s: ""queen"" cut after 0.2 of 0.7 s by /k/
- level w6-6 @1177.7s: "Tap the petal, and say it with me." cut after 1.2 of 2.5 s by /oe/
- level w6-6 @1226.8s: "Which of these is the way we write..." cut after 1.8 of 2.7 s by /oe/
- level w6-6 @1296.2s: "Let's listen again. What can you hear here?" cut after 2.2 of 2.7 s by /b/
- level w6-6 @1308.2s: "Let's listen again. What can you hear here?" cut after 0.4 of 2.7 s by /oe/
- level w6-ec11 @1662.0s: "Which of these is the way we write..." cut after 0.5 of 2.7 s by Keep going, ninja.
- level w6-ec11 @1671.6s: "/ie/" cut after 0.1 of 0.7 s by /ie/
- level w6-ec11 @1679.9s: "What's the first sound?" cut after 0.4 of 1.6 s by /p/
- level w6-7 @1894.4s: ""bright"" cut after 0.3 of 0.9 s by /b/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 6 | level w6-br1, level w6-br2, level w6-1, level w6-3, level w6-6, level w6-ec11 |
| audit_gem_more "Look, this gem has filled a little more." | 5 | reward ×5 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| t_another_way "This is another way to spell the sound..." | 4 | level w6-1, level w6-3, level w6-6, level w6-ec11 |
| r2_gems_more "Look, these gems have filled a little more." | 3 | reward ×3 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w6-br1 |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w6-ec11 |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C5-P: playtest/fix/D1/verify1/final/continuous-perfect-from-w5-1.json

perfect, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 6 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×1, world_6 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 9 of 9 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.13 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 2 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 9 words (median line 6 words; 111 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 9.3 s (boss w5-11); 0 over | pass |

- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @4:07.2; ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from reward @16:43.0
- **over-framed**: ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-3 @6:54.3: learn is known before w5-1; ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-6 @13:46.9, again after w5-3 @6:54.3

### C5-L: playtest/fix/D1/verify1/final/continuous-learner-from-w5-1.json

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
| `swap-place-heard` swap place lines heard to the end | all | 10 of 10 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.08 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 2 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 6 words; 174 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 10.6 s (build w5-1); 0 over | pass |

- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @5:09.9; ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from reward @23:22.5
- **over-framed**: ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-3 @8:34.5: learn is known before w5-1; ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-6 @17:23.5, again after w5-3 @8:34.5

### C6-P: playtest/fix/D1/verify1/final/continuous-perfect-from-w6-br1.json

perfect, from w6-br1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 | 11 | pass |
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
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.04 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.3 s (sort w6-br1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 7 words; 98 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 8.4 s (run w6-9); 0 over | pass |

- **letters-twice**: /ie/: 2× (w6-ec11 20:27.6, w6-ec11 20:50.1)

### C6-L: playtest/fix/D1/verify1/final/continuous-learner-from-w6-br1.json

learner, from w6-br1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 11 | n/a |
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
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.32 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 1 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 1 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 3 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.4 s (sort w6-br1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 6 words; 154 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 12.3 s (build w6-1); 1 over | **FAIL** |

- **praise-stacks**: w6-6 @23:40.0: "Ninja power!" → "You built words with their sounds, and you read them."
- **line-60s**: ‹tv_listen_here› "Let's listen again. What can you hear here?" from w6-3 @11:59.2
- **fs-talk**: build (w6-1) 12.3 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹first_sound_q› "What's the first sound?", with ‹tv_fs_praise_every› "You said it slowly, and found every sound."

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

