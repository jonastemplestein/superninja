# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/D1/verify1/final2/continuous-perfect-from-w5-1.json (perfect-from-w5-1, one continuous page)

294 Sensei lines, 582 sounds and words, 390 utterances in 52 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_your_word | 7 | Your word is... |
| tv_next_word | 7 | Here's your next word... |
| tv_here_sound | 7 | Here's the sound... |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| wf_found_gem | 6 | You found a new gem! It's a spelling of the sound... |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| next_sound_q | 4 | What's the next sound? |
| t_in | 4 | ...in... |
| tv_swap_now_change | 4 | Now let's change it to... |
| tv_swap_both | 4 | Listen to them both... |
| st_what_change | 4 | What do we need to change? |
| st_first_changes | 4 | Yes, the first sound changes! |
| tv_swap_pick | 4 | Now tap the new one. |
| tv_which_changes | 4 | Which sound changes? |
| tv_petal_say | 3 | Tap the petal, and say it with me. |
| tv_how_we_write | 3 | This is how we write... |
| t_two_letters | 3 | It's two letters, but it's one sound. |
| tv_tap_letter_say | 3 | Now you tap it, and say the sound. |
| tv_said_well | 3 | Good, you said that sound really well. |
| st_two_letters_too | 3 | This one's two letters too, but it's just one sound. |
| tv_tap_it_say_short | 3 | Now you tap it, and say it. |
| tv_ne_new_sounds | 3 | Now let's play Ninja Eyes, with your new sounds. |
| tv_find_write | 3 | Find how we write... |
| tv_build_dojo | 3 | Now let's build some words with your new sounds. |
| first_sound_q | 3 | What's the first sound? |
| last_sound_q | 3 | What's the last sound? |
| tv_fs_say_slow | 3 | Let's say it the slow way... |
| tv_fs_now_fast | 3 | And now, fast... |
| tv_fs_slow_tortoise | 3 | First the slow way, like the tortoise... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (12)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @99.3s and @101.6s |
| t_in | 2 | ...in... | world flower @276.1s and @279.1s |
| tv_which_changes | 2 | Which sound changes? | level w5-4 @676.0s and @684.6s |
| next_sound_q | 1 | What's the next sound? | level w5-1 @118.0s and @119.7s |
| tv_guess_q | 1 | Listen for the word... | level w5-5 @730.3s and @744.6s |
| tv_run_which | 1 | Tap the lantern with my word. | level w5-5 @735.0s and @749.9s |
| wf_found_gem | 1 | You found a new gem! It's a spelling of the sound... | world flower @1033.1s and @1047.9s |
| t_ways_2 | 1 | Now you know two ways to spell... | world flower @1043.0s and @1057.8s |

### Spliced utterances: 70 of 390 (18%); chains of 5+ clips: 58

Commonest spliced shapes:

- ×4 ‹tv_next_word› + W
- ×3 ‹tv_which_write› + /X/
- ×3 ‹tv_battle_again› + ‹tv_your_word› + W
- ×2 ‹tv_now_find› + /X/
- ×2 /X/ + ‹t_in› + W + ‹t_and_sometimes› + /X/ + ‹t_in› + W
- ×2 ‹tv_fs_say_slow› + /X/ + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×2 ‹tv_learn_frame_ways› + ‹tv_here_sound› + /X/
- ×2 /X/ + ‹tv_next_sound_known› + /X/
- ×2 /X/ + /X/ + /X/ + W + ‹tv_praise_built› + ‹tv_next_word› + W
- ×2 W + ‹tv_show_offer_short› + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_learn_short_four› + ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/

Longest chains:

- level w5-4 @655.1s (10 clips): /ch/ /i/ /k/ "chick" Now let's change it to... "chip" Listen to them both... "chick" (slowly) "chip" (slowly) What do we need to change?
- level w5-8 @1185.8s (10 clips): /s/ /o/ /k/ "sock" Now let's change it to... "song" Listen to them both... "sock" (slowly) "song" (slowly) What do we need to change?
- level w5-4 @636.9s (8 clips): "pick" If you'd like to see me do one first, tap my paw. Now let's change it to... "chick" Listen to them both... "pick" (slowly) "chick" (slowly) What do we need to change?
- level w5-6 @943.8s (8 clips): /ch/ /s/ /k/ /e/ /ch/ "sketch" That's it! "itch"
- level w5-8 @1167.6s (8 clips): "lock" If you'd like to see me do one first, tap my paw. Now let's change it to... "sock" Listen to them both... "lock" (slowly) "sock" (slowly) What do we need to change?
- level w5-1 @73.4s (7 clips): And this is how we write... /dh/ The same spelling can sometimes be... /th/ ...in moth, and sometimes... /dh/ ...in this.
- level w5-1 @124.0s (7 clips): Wow! Super ninja streak! Let's say the sounds, the slow way... /th/ /u/ /m/ /p/ Now tap the rabbit, and read the word fast.
- reward @210.9s (7 clips): Let's see what you won back from Baron Muddle. You won back four sounds... /sh/ /ch/ /th/ /dh/ More stickers for your Sticker Book!

### Praise: 16 lines (0.6 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 33

- level w5-1 @18.7s: "Tap the petal, and say it with me." cut after 2.0 of 2.5 s by /sh/
- level w5-1 @29.0s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /sh/
- level w5-1 @32.0s: "Tap it once more, and say it again." cut after 0.0 of 2.5 s by /sh/
- level w5-1 @38.5s: "Tap its petal, and say it." cut after 1.9 of 2.4 s by /ch/
- level w5-1 @48.5s: "Now you tap it, and say it." cut after 1.5 of 2.1 s by /ch/
- level w5-1 @99.3s: "Which of these is the way we write..." cut after 1.6 of 2.7 s by /sh/
- level w5-1 @101.6s: "Which of these is the way we write..." cut after 1.9 of 2.7 s by /ch/
- level w5-1 @107.3s: "/th/" cut after 0.2 of 0.7 s by /th/
- level w5-1 @108.3s: "Now find how we write..." cut after 0.5 of 2.1 s by /dh/
- level w5-1 @121.9s: "What's the last sound?" cut after 1.2 of 1.5 s by /p/
- level w5-3 @424.4s: "Tap the petal, and say it with me." cut after 1.6 of 2.5 s by /k/
- level w5-3 @434.0s: "Now you tap it, and say the sound." cut after 1.6 of 2.5 s by /k/
- level w5-3 @447.0s: "It's a new sound. Tap its petal, and say it with me." cut after 1.9 of 4.0 s by /ng/
- level w5-3 @457.5s: "Now you tap it, and say it." cut after 1.5 of 2.1 s by /ng/
- level w5-3 @481.7s: "Which of these is the way we write..." cut after 1.7 of 2.7 s by /k/
- level w5-3 @483.5s: "Which of these is the way we write..." cut after 1.9 of 2.7 s by /ng/
- level w5-3 @489.2s: "/w/" cut after 0.1 of 0.7 s by /w/
- level w5-4 @648.5s: "What do we need to change?" cut after 1.3 of 1.8 s by Yes, the first sound changes!
- level w5-4 @664.0s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the last sound changes!
- level w5-4 @676.0s: "Which sound changes?" cut after 0.9 of 1.9 s by Yes, the first sound changes!
- level w5-4 @684.6s: "Which sound changes?" cut after 1.4 of 1.9 s by Yes, the middle sound changes!
- level w5-6 @825.5s: "Tap the petal, and say it with me." cut after 1.4 of 2.5 s by /k/
- level w5-6 @831.9s: "Now you tap it, and say the sound." cut after 1.9 of 2.5 s by /k/
- level w5-6 @842.3s: "Tap its petal, and say it." cut after 1.6 of 2.4 s by /w/
- level w5-6 @849.7s: "Now you tap it, and say it." cut after 1.8 of 2.1 s by /w/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 3 | level w5-1, level w5-3, level w5-5 |
| r2_gems_more "Look, these gems have filled a little more." | 3 | reward ×3 |
| t_another_way "This is another way to spell the sound..." | 3 | level w5-3, level w5-6 ×2 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |

## playtest/fix/D1/verify1/final2/continuous-learner-from-w5-1.json (learner-from-w5-1, one continuous page)

417 Sensei lines, 649 sounds and words, 466 utterances in 52 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| next_sound_q | 22 | What's the next sound? |
| tv_listen_here | 17 | Let's listen again. What can you hear here? |
| first_sound_q | 15 | What's the first sound? |
| last_sound_q | 15 | What's the last sound? |
| audit_spelling_help_plain | 15 | Listen to the word again. What sound do you hear here? |
| say_sounds_read | 14 | Say the sounds, and read the word. |
| tv_your_word | 13 | Your word is... |
| audit_listen_next | 11 | Let's listen again. What sound comes next? |
| tv_next_word | 10 | Here's your next word... |
| tv_praise_kept_going | 8 | That was a tricky one, and you kept going. |
| tv_here_sound | 7 | Here's the sound... |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| wf_found_gem | 6 | You found a new gem! It's a spelling of the sound... |
| tv_swap_now_change | 5 | Now let's change it to... |
| tv_swap_both | 5 | Listen to them both... |
| tv_swap_pick | 5 | Now tap the new one. |
| t_two_letters | 4 | It's two letters, but it's one sound. |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| tv_thats_write | 4 | That's how we write... |
| we_need | 4 | We need... |
| streak_3 | 4 | Ninja power! |
| streak_lost | 4 | Keep going, ninja. |
| t_in | 4 | ...in... |
| st_what_change | 4 | What do we need to change? |
| st_middle_changes | 4 | Yes, the middle sound changes! |
| st_first_changes | 4 | Yes, the first sound changes! |
| tv_which_changes | 4 | Which sound changes? |
| swap_which | 4 | Which sound needs to change? |
| tv_petal_say | 3 | Tap the petal, and say it with me. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (17)

| Line | Repeats | Text | Example |
|---|---|---|---|
| next_sound_q | 7 | What's the next sound? | level w5-1 @202.6s and @206.2s |
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @110.8s and @119.4s |
| t_in | 2 | ...in... | world flower @344.2s and @347.5s |
| tv_which_changes | 2 | Which sound changes? | level w5-4 @892.1s and @902.0s |
| tv_thats_write | 1 | That's how we write... | level w5-3 @614.1s and @625.8s |
| we_need | 1 | We need... | level w5-3 @616.5s and @628.5s |
| swap_which | 1 | Which sound needs to change? | level w5-8 @1629.9s and @1640.3s |

### Spliced utterances: 84 of 466 (18%); chains of 5+ clips: 53

Commonest spliced shapes:

- ×4 ‹tv_next_word› + W
- ×3 ‹tv_battle_again› + ‹tv_your_word› + W
- ×2 /X/ + ‹t_in› + W + ‹t_and_sometimes› + /X/ + ‹t_in› + W
- ×2 ‹tv_learn_frame_ways› + ‹tv_here_sound› + /X/
- ×2 /X/ + ‹tv_next_sound_known› + /X/
- ×2 ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 W + ‹tv_show_offer_short› + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_your_word› + W + ‹first_sound_q›
- ×1 ‹tv_learn_short_four› + ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×1 /X/ + ‹tv_learn_another› + /X/
- ×1 ‹tv_how_we_write› + /X/
- ×1 /X/ + ‹tv_learn_last› + /X/

Longest chains:

- level w5-1 @244.3s (11 clips): Say the sounds, and read the word. /k/ /l/ /o/ /th/ "cloth" That was a tricky one, and you kept going. Your word is... "them" What's the first sound? /dh/
- level w5-4 @869.4s (11 clips): /sh/ /o/ /p/ "shop" Ninja power! Now let's change it to... "chop" Listen to them both... "shop" (slowly) "chop" (slowly) What do we need to change?
- level w5-6 @1252.3s (11 clips): Say the sounds, and read the word. /k/ /w/ /i/ /l/ /t/ "quilt" That was a tricky one, and you kept going. Here's your next word... "with" What's the first sound?
- level w5-4 @921.1s (10 clips): /ch/ /i/ /k/ "chick" Ninja power! Now let's change it to... "pick" "chick" (slowly) "pick" (slowly) Which sound needs to change?
- level w5-6 @1200.5s (10 clips): Say the sounds, and read the word. /k/ /w/ /i/ /k/ "quick" Brilliant! Here's your next word... "give" What's the first sound?
- level w5-1 @184.1s (9 clips): Say the sounds, and read the word. /ch/ /a/ /t/ "chat" You said it slowly, and found every sound. Your word is... "bench" What's the first sound?
- level w5-1 @217.6s (9 clips): Say the sounds, and read the word. /b/ /e/ /n/ /ch/ "bench" Here's your next word... "cloth" What's the first sound?
- level w5-3 @651.8s (9 clips): Say the sounds, and read the word. /w/ /i/ /ng/ "wing" That was a tricky one, and you kept going. Here's your next word... "neck" What's the first sound?

### Praise: 15 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 16

- level w5-1 @34.6s: "Tap it once more, and say it again." cut after 0.0 of 2.5 s by /sh/
- level w5-1 @113.5s: "/sh/" cut after 0.4 of 0.8 s by That's how we write...
- level w5-1 @127.6s: "Now find how we write..." cut after 0.6 of 2.1 s by /dh/
- level w5-1 @151.4s: "/dh/" cut after 0.5 of 0.9 s by Let's say the sounds, the slow way...
- level w5-1 @256.4s: "What's the first sound?" cut after 0.6 of 1.6 s by /dh/
- level w5-3 @574.9s: "It's a new sound. Tap its petal, and say it with me." cut after 3.2 of 4.0 s by /ng/
- level w5-3 @614.1s: "Which of these is the way we write..." cut after 0.0 of 2.7 s by That's how we write...
- level w5-4 @861.4s: "What do we need to change?" cut after 1.1 of 1.8 s by Yes, the middle sound changes!
- level w5-4 @881.2s: "What do we need to change?" cut after 1.3 of 1.8 s by Yes, the first sound changes!
- level w5-4 @902.0s: "Which sound changes?" cut after 0.8 of 1.9 s by Yes, the middle sound changes!
- level w5-4 @913.0s: "Which sound needs to change?" cut after 1.1 of 1.8 s by Yes, the last sound changes!
- level w5-4 @930.4s: "Which sound needs to change?" cut after 1.0 of 1.8 s by Yes, the first sound changes!
- level w5-6 @1152.9s: "/w/" cut after 0.4 of 0.7 s by Keep going, ninja.
- level w5-8 @1575.5s: "What do we need to change?" cut after 1.1 of 1.8 s by Yes, the middle sound changes!
- level w5-8 @1592.1s: "What do we need to change?" cut after 0.7 of 1.8 s by Ninja power!
- level w5-8 @1640.3s: "Which sound needs to change?" cut after 0.5 of 1.8 s by Yes, the last sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 4 | level w5-1, level w5-3, level w5-6, level w5-7 |
| t_another_way "This is another way to spell the sound..." | 3 | level w5-3, level w5-6 ×2 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |

## playtest/fix/D1/verify1/final2/continuous-perfect-from-w6-br1.json (perfect-from-w6-br1, one continuous page)

280 Sensei lines, 587 sounds and words, 353 utterances in 59 pieces.

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
| tv_build_dojo | 4 | Now let's build some words with your new sounds. |
| first_sound_q | 4 | What's the first sound? |
| next_sound_q | 4 | What's the next sound? |
| last_sound_q | 4 | What's the last sound? |
| tv_build_done | 4 | You built words with their sounds, and you read them. |
| tv_won_one | 4 | You won back a sound... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (6)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w6-1 @274.9s and @276.8s |
| tv_guess_q | 1 | Listen for the word... | level w6-9 @1431.0s and @1445.7s |
| tv_run_which | 1 | Tap the lantern with my word. | level w6-9 @1436.0s and @1449.5s |

### Spliced utterances: 57 of 353 (16%); chains of 5+ clips: 59

Commonest spliced shapes:

- ×4 ‹tv_learn_short_two› + ‹tv_learn_first_short› + /X/
- ×3 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×3 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/
- ×3 ‹tv_to_reward› + ‹tv_won_one› + /X/
- ×3 /X/ + ‹tv_said_well› + ‹tv_next_sound_known› + /X/
- ×3 ‹tv_learn_all_two› + ‹tv_ne_new_sounds› + ‹tv_which_write› + /X/
- ×2 ‹tv_which_write› + /X/
- ×2 ‹yay_1› + ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q› + /X/
- ×1 ‹tv_here_sound› + /X/ + ‹audit_bridging_first› + ‹tv_sort_frame› + ‹tv_sort_open›
- ×1 ‹t_two_letters› + /X/ + ‹tv_sort_ido› + W + ‹tv_sort_see› + ‹tv_sort_so› + ‹tv_ready_yours›
- ×1 ‹audit_sort_again› + ‹tv_here_sound› + /X/ + ‹audit_sort_pair› + ‹tg_ch_ch_way› + ‹st_two_letters_too› + /X/ + ‹tv_spelt_like_this_match›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_next_sound_known› + /X/
- ×1 ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write›
- ×1 /X/ + ‹tv_which_write› + /X/
- ×1 ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q› + /X/

Longest chains:

- level w6-br2 @139.1s (8 clips): Sorting time! Same sound, different spellings. Here's the sound... /ch/ This sound can be spelt in two ways. This is the way we spell it in chick. This one's two letters too, but it's just one sound. /ch/ In match, it's spelt like this.
- level w6-ec11 @1183.1s (8 clips): /ie/ You can hear it in... "light" "night" ...and... "high" Tap the petal, and say it with me. /ie/
- level w6-ec11 @1288.2s (8 clips): /sh/ /ee/ /p/ "sheep" It's two letters, but it's one sound. /sh/ You built words with their sounds, and you read them. You won back a sound...
- level w6-br1 @39.4s (7 clips): It's two letters, but it's one sound. /k/ I'll sort the first one. My word is... "check" I can see this spelling at the end. So it goes in this chest. Now you do one. Are you ready?
- level w6-1 @318.3s (7 clips): Say the sounds, and read the word. /t/ /r/ /ae/ /n/ "train" You said it slowly, and found every sound.
- level w6-3 @602.3s (7 clips): Ninja power! /s/ /ee/ /t/ "seat" Here's your next word... "feet"
- level w6-5 @850.0s (7 clips): Let's say it the slow way... /b/ /e/ /n/ /d/ And now, fast... "bend"
- level w6-5 @883.2s (7 clips): First the slow way, like the tortoise... /p/ /ae/ /n/ /t/ Now the fast way, like the rabbit... "paint"

### Praise: 12 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 39

- level w6-br1 @78.1s: ""silk"" cut after 0.3 of 1.0 s by /s/
- level w6-br1 @90.2s: ""cab"" cut after 0.3 of 0.7 s by /k/
- level w6-1 @230.2s: "Tap the petal, and say it with me." cut after 1.6 of 2.5 s by /ae/
- level w6-1 @239.4s: "Now you tap it, and say the sound." cut after 1.4 of 2.5 s by /ae/
- level w6-1 @241.7s: "Tap it once more, and say it again." cut after 0.3 of 2.5 s by /ae/
- level w6-1 @248.9s: "Tap its petal, and say it." cut after 1.4 of 2.4 s by /ae/
- level w6-1 @259.3s: "Now you tap it, and say it." cut after 1.8 of 2.1 s by /ae/
- level w6-1 @274.9s: "Which of these is the way we write..." cut after 1.6 of 2.7 s by /ae/
- level w6-1 @276.8s: "Which of these is the way we write..." cut after 1.7 of 2.7 s by /ae/
- level w6-1 @288.7s: "What's the next sound?" cut after 0.9 of 1.3 s by /ae/
- level w6-3 @535.0s: "Tap the petal, and say it with me." cut after 1.7 of 2.5 s by /ee/
- level w6-3 @544.7s: "Now you tap it, and say the sound." cut after 1.5 of 2.5 s by /ee/
- level w6-3 @554.9s: "Tap its petal, and say it." cut after 2.0 of 2.4 s by /ee/
- level w6-3 @578.2s: "Which of these is the way we write..." cut after 1.9 of 2.7 s by /ee/
- level w6-3 @580.7s: "Which of these is the way we write..." cut after 0.1 of 2.7 s by Keep going, ninja.
- level w6-3 @598.7s: "What's the next sound?" cut after 0.9 of 1.3 s by /ee/
- level w6-3 @600.5s: "What's the last sound?" cut after 1.1 of 1.5 s by /t/
- level w6-4 @748.8s: ""sea"" cut after 0.3 of 0.6 s by /s/
- level w6-4 @753.2s: ""seat"" cut after 0.3 of 0.6 s by /s/
- level w6-4 @766.3s: ""feet"" cut after 0.4 of 0.7 s by /f/
- level w6-6 @921.6s: "Tap the petal, and say it with me." cut after 1.6 of 2.5 s by /oe/
- level w6-6 @931.0s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /oe/
- level w6-6 @941.2s: "Tap its petal, and say it." cut after 1.7 of 2.4 s by /oe/
- level w6-6 @952.1s: "Now you tap it, and say it." cut after 1.4 of 2.1 s by /oe/
- level w6-6 @963.5s: "Which of these is the way we write..." cut after 1.4 of 2.7 s by /oe/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 6 | level w6-br1, level w6-1, level w6-3, level w6-6, level w6-ec11 ×2 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| t_another_way "This is another way to spell the sound..." | 4 | level w6-1, level w6-3, level w6-6, level w6-ec11 |
| r2_gems_more "Look, these gems have filled a little more." | 4 | reward ×4 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w6-br1 |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w6-ec11 |

## playtest/fix/D1/verify1/final2/continuous-learner-from-w6-br1.json (learner-from-w6-br1, one continuous page)

395 Sensei lines, 623 sounds and words, 419 utterances in 59 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| next_sound_q | 24 | What's the next sound? |
| first_sound_q | 19 | What's the first sound? |
| last_sound_q | 19 | What's the last sound? |
| say_sounds_read | 18 | Say the sounds, and read the word. |
| tv_your_word | 13 | Your word is... |
| tv_listen_here | 11 | Let's listen again. What can you hear here? |
| tv_here_sound | 10 | Here's the sound... |
| tv_next_word | 9 | Here's your next word... |
| audit_spelling_help_plain | 9 | Listen to the word again. What sound do you hear here? |
| tv_watch_write | 8 | Now watch my ninja write it. |
| tv_which_write | 8 | Which of these is the way we write... |
| t_two_letters | 6 | It's two letters, but it's one sound. |
| help_sort | 6 | Tap the chest with the same spelling as the word. |
| tv_praise_sorted | 6 | That's the right chest. |
| tv_sort_done | 6 | Same sound, different spellings. You sorted them all. |
| tv_praise_kept_going | 6 | That was a tricky one, and you kept going. |
| audit_listen_next | 6 | Let's listen again. What sound comes next? |
| streak_3 | 5 | Ninja power! |
| streak_6 | 5 | Wow! Super ninja streak! |
| audit_sort_again | 5 | Sorting time! Same sound, different spellings. |
| audit_sort_pair | 5 | This sound can be spelt in two ways. |
| streak_lost | 5 | Keep going, ninja. |
| tv_learn_short_two | 4 | Back to the dojo. Today there are two new sounds. |
| tv_learn_first_short | 4 | Here's the first new sound... |
| tv_petal_say | 4 | Tap the petal, and say it with me. |
| tv_how_we_write | 4 | This is how we write... |
| st_two_letters_too | 4 | This one's two letters too, but it's just one sound. |
| tv_tap_letter_say | 4 | Now you tap it, and say the sound. |
| tv_said_well | 4 | Good, you said that sound really well. |
| tv_next_sound_known | 4 | Our next sound is one you know... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (11)

| Line | Repeats | Text | Example |
|---|---|---|---|
| next_sound_q | 7 | What's the next sound? | level w6-1 @327.1s and @330.9s |
| tv_which_write | 4 | Which of these is the way we write... | level w6-1 @301.4s and @304.9s |

### Spliced utterances: 69 of 419 (16%); chains of 5+ clips: 62

Commonest spliced shapes:

- ×4 ‹tv_learn_short_two› + ‹tv_learn_first_short› + /X/
- ×4 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_praise_kept_going› + ‹tv_your_word› + W + ‹first_sound_q›
- ×3 ‹tv_thats_write› + /X/
- ×3 ‹say_sounds_read› + /X/ + /X/ + /X/ + /X/ + W + ‹tv_next_word› + W + ‹first_sound_q›
- ×2 ‹we_need› + /X/
- ×2 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×2 /X/ + ‹tv_said_well› + ‹tv_next_sound_known› + /X/
- ×2 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×2 ‹tv_to_reward› + ‹tv_won_one› + /X/ + ‹t_visit› + ‹nav_ready›
- ×2 ‹tv_which_write› + /X/ + /X/
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_next_word› + W + ‹first_sound_q›
- ×1 ‹tv_here_sound› + /X/ + ‹audit_bridging_first› + ‹tv_sort_frame› + ‹tv_sort_open›
- ×1 ‹t_two_letters› + /X/ + ‹tv_sort_ido› + W + ‹tv_sort_see› + ‹tv_sort_so› + ‹tv_ready_yours›
- ×1 ‹audit_sort_again› + ‹tv_here_sound› + /X/ + ‹audit_sort_pair› + ‹tg_ch_ch_way› + ‹t_two_letters› + /X/ + ‹tv_spelt_like_this_match›
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_letter_say› + /X/

Longest chains:

- level w6-3 @707.9s (10 clips): Say the sounds, and read the word. /sh/ /ee/ /p/ "sheep" It's two letters, but it's one sound. /sh/ Here's your next word... "feet" What's the first sound?
- level w6-3 @797.8s (10 clips): Say the sounds, and read the word. /k/ /w/ /ee/ /n/ "queen" Brilliant! Your word is... "leaf" What's the first sound?
- level w6-1 @408.9s (9 clips): Say the sounds, and read the word. /t/ /ae/ /l/ "tail" That was a tricky one, and you kept going. Your word is... "train" What's the first sound?
- level w6-3 @736.1s (9 clips): Say the sounds, and read the word. /f/ /ee/ /t/ "feet" That was a tricky one, and you kept going. Your word is... "dream" What's the first sound?
- level w6-3 @766.5s (9 clips): Say the sounds, and read the word. /d/ /r/ /ee/ /m/ "dream" Here's your next word... "queen" What's the first sound?
- level w6-6 @1230.4s (9 clips): Say the sounds, and read the word. /s/ /n/ /oe/ "snow" That was a tricky one, and you kept going. Your word is... "soap" What's the first sound?
- level w6-6 @1280.2s (9 clips): Say the sounds, and read the word. /b/ /l/ /oe/ "blow" That's it! Your word is... "crow" What's the first sound?
- level w6-ec11 @1562.6s (9 clips): Say the sounds, and read the word. /t/ /r/ /ae/ /n/ "train" Here's your next word... "grow" What's the first sound?

### Praise: 17 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 10

- level w6-br2 @206.4s: ""chat"" cut after 0.2 of 0.7 s by /ch/
- level w6-1 @268.1s: "Tap it once more, and say it again." cut after 0.6 of 2.5 s by /ae/
- level w6-2 @567.4s: ""stay"" cut after 0.2 of 0.6 s by /s/
- level w6-2 @571.7s: ""spray"" cut after 0.3 of 0.7 s by /s/
- level w6-2 @588.2s: ""tail"" cut after 0.2 of 0.6 s by /t/
- level w6-3 @686.3s: "/ee/" cut after 0.1 of 0.6 s by /ee/
- level w6-6 @1181.4s: "/oe/" cut after 0.1 of 0.5 s by /oe/
- level w6-6 @1184.6s: "/oe/" cut after 0.1 of 0.5 s by /oe/
- level w6-8 @1434.0s: ""road"" cut after 0.2 of 0.7 s by /r/
- level w6-7 @1784.2s: ""bright"" cut after 0.4 of 0.9 s by /b/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 6 | level w6-br1, level w6-br2, level w6-3 ×2, level w6-6, level w6-ec11 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| t_another_way "This is another way to spell the sound..." | 4 | level w6-1, level w6-3, level w6-6, level w6-ec11 |
| audit_gem_more "Look, this gem has filled a little more." | 3 | reward ×3 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w6-br1 |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w6-ec11 |

## playtest/fix/D1/verify1/final2/continuous-splitter-from-w5-1.json (splitter-from-w5-1, one continuous page)

270 Sensei lines, 464 sounds and words, 318 utterances in 38 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| t_two_letters | 8 | It's two letters, but it's one sound. |
| tv_here_sound | 7 | Here's the sound... |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| we_need | 6 | We need... |
| wf_found_gem | 6 | You found a new gem! It's a spelling of the sound... |
| tv_your_word | 5 | Your word is... |
| tv_next_word | 5 | Here's your next word... |
| thats | 5 | That's... |
| tv_swap_now_change | 5 | Now let's change it to... |
| tv_swap_both | 5 | Listen to them both... |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| streak_3 | 4 | Ninja power! |
| streak_lost | 4 | Keep going, ninja. |
| t_in | 4 | ...in... |
| st_what_change | 4 | What do we need to change? |
| st_first_changes | 4 | Yes, the first sound changes! |
| tv_swap_pick | 4 | Now tap the new one. |
| tv_which_changes | 4 | Which sound changes? |
| tv_petal_say | 3 | Tap the petal, and say it with me. |
| tv_how_we_write | 3 | This is how we write... |
| tv_tap_letter_say | 3 | Now you tap it, and say the sound. |
| tv_said_well | 3 | Good, you said that sound really well. |
| tv_tap_it_say_short | 3 | Now you tap it, and say it. |
| tv_ne_new_sounds | 3 | Now let's play Ninja Eyes, with your new sounds. |
| tv_find_write | 3 | Find how we write... |
| tv_build_dojo | 3 | Now let's build some words with your new sounds. |
| first_sound_q | 3 | What's the first sound? |
| next_sound_q | 3 | What's the next sound? |
| last_sound_q | 3 | What's the last sound? |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (12)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @110.2s and @114.0s |
| t_in | 2 | ...in... | world flower @322.4s and @325.7s |
| tv_swap_both | 2 | Listen to them both... | level w5-4 @770.5s and @784.9s |
| tv_which_changes | 2 | Which sound changes? | level w5-4 @801.0s and @811.0s |
| tv_swap_now_change | 1 | Now let's change it to... | level w5-4 @767.9s and @782.4s |
| st_what_change | 1 | What do we need to change? | level w5-4 @774.3s and @788.8s |
| tv_run_which | 1 | Tap the lantern with my word. | level w5-5 @870.2s and @885.1s |

### Spliced utterances: 71 of 318 (22%); chains of 5+ clips: 48

Commonest spliced shapes:

- ×3 ‹tv_which_write› + /X/ + /X/
- ×3 ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q›
- ×3 ‹streak_lost› + ‹thats› + /X/ + ‹we_need› + /X/ + ‹t_two_letters›
- ×2 /X/ + ‹t_in› + W + ‹t_and_sometimes› + /X/ + ‹t_in› + W
- ×2 ‹tv_battle_again› + ‹tv_your_word› + W
- ×2 ‹tv_next_word› + W
- ×2 ‹tv_learn_frame_ways› + ‹tv_here_sound› + /X/
- ×2 /X/ + ‹tv_next_sound_known› + /X/
- ×2 /X/ + /X/ + /X/ + W + ‹tv_next_word› + W
- ×2 W + ‹tv_show_offer_short› + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_learn_short_four› + ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›

Longest chains:

- level w5-4 @779.8s (10 clips): /ch/ /i/ /k/ "chick" Now let's change it to... "chip" Listen to them both... "chick" (slowly) "chip" (slowly) What do we need to change?
- level w5-8 @1445.5s (10 clips): /r/ /i/ /ng/ "ring" Now let's change it to... "king" Listen to them both... "ring" (slowly) "king" (slowly) What do we need to change?
- level w5-4 @762.8s (8 clips): "kick" If you'd like to see me do one first, tap my paw. Now let's change it to... "chick" Listen to them both... "kick" (slowly) "chick" (slowly) What do we need to change?
- level w5-8 @1419.1s (8 clips): "rich" If you'd like to see me do one first, tap my paw. Now let's change it to... "ring" Listen to them both... "rich" (slowly) "ring" (slowly) What do we need to change?
- level w5-8 @1462.0s (8 clips): /k/ /i/ /ng/ "king" Listen to them both... "king" (slowly) "kin" (slowly) Which sound changes?
- level w5-1 @82.6s (7 clips): And this is how we write... /dh/ The same spelling can sometimes be... /th/ ...in moth, and sometimes... /dh/ ...in this.
- reward @250.3s (7 clips): Let's see what you won back from Baron Muddle. You won back four sounds... /sh/ /ch/ /th/ /dh/ More stickers for your Sticker Book!
- world flower @321.5s (7 clips): /dh/ ...in... "with" ...and sometimes... /th/ ...in... "moth"

### Praise: 14 lines (0.6 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 8

- level w5-1 @34.1s: "Tap it once more, and say it again." cut after 0.0 of 2.5 s by /sh/
- level w5-1 @112.8s: "/sh/" cut after 0.5 of 0.8 s by /sh/
- level w5-3 @540.4s: "It's a new sound. Tap its petal, and say it with me." cut after 2.9 of 4.0 s by /ng/
- level w5-4 @774.3s: "What do we need to change?" cut after 0.8 of 1.8 s by Yes, the first sound changes!
- level w5-4 @788.8s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the last sound changes!
- level w5-8 @1431.4s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the last sound changes!
- level w5-8 @1456.2s: "What do we need to change?" cut after 0.8 of 1.8 s by Yes, the first sound changes!
- level w5-8 @1469.6s: "Which sound changes?" cut after 1.5 of 1.9 s by Ninja power!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 8 | level w5-1, level w5-2 ×3, level w5-6, level w5-7 ×2, level w5-8 |
| t_another_way "This is another way to spell the sound..." | 3 | level w5-3, level w5-6 ×2 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C5-P: playtest/fix/D1/verify1/final2/continuous-perfect-from-w5-1.json

perfect, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 7 | n/a |
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
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.19 | pass |
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
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 6 words; 113 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 10.3 s (boss w5-11); 0 over | pass |

- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @4:08.9; ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from reward @16:35.5
- **over-framed**: ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-3 @6:53.3: learn is known before w5-1; ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-6 @13:34.3, again after w5-3 @6:53.3

### C5-L: playtest/fix/D1/verify1/final2/continuous-learner-from-w5-1.json

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
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.13 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 1 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 6 words; 185 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 74 of 74, rabbit 58 of 58 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 10.8 s (build w5-1); 0 over | pass |

- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @5:12.5; ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from reward @22:14.3
- **over-framed**: ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-6 @17:38.0, again after w5-3 @8:58.8

### C6-P: playtest/fix/D1/verify1/final2/continuous-perfect-from-w6-br1.json

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
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.16 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.2 s (sort w6-br1); 0 over | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 13.5 s (battle w6-5); 1 over | **FAIL** |

- **letters-twice**: /ie/: 2× (w6-ec11 19:56.0, w6-ec11 20:17.7)
- **fs-talk**: battle (w6-5) 13.5 s from ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..." to ‹tv_battle_why› "Every monster you beat helps us win back the sounds.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."

### C6-L: playtest/fix/D1/verify1/final2/continuous-learner-from-w6-br1.json

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
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.30 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 2 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.5 s (sort w6-br1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 6 words; 157 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 10.6 s (build w6-1); 0 over | pass |

### C5-S: playtest/fix/D1/verify1/final2/continuous-splitter-from-w5-1.json

splitter, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 11 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 3 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 1 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 9 of 9 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.19 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | 5 of 5 (100%) | pass |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 2 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 9 words (median line 6 words; 98 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 9.3 s (run w5-5); 0 over | pass |

- **letters-60s**: w5-2 @6:31.7 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-7 @23:04.8 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-8 @23:59.9 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @4:51.0; ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from reward @19:49.5
- **over-framed**: ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-3 @8:22.1: learn is known before w5-1; ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-6 @15:57.3, again after w5-3 @8:22.1

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

