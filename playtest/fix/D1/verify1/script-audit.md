# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/D1/verify1/transcripts/continuous-perfect-from-w5-1.json (perfect-from-w5-1, one continuous page)

296 Sensei lines, 573 sounds and words, 397 utterances in 52 pieces.

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
| yay_4 | 4 | Well done. |
| tv_swap_now_change | 4 | Now let's change it to... |
| tv_swap_both | 4 | Listen to them both... |
| st_what_change | 4 | What do we need to change? |
| st_first_changes | 4 | Yes, the first sound changes! |
| tv_swap_pick | 4 | Now tap the new one. |
| st_last_changes | 4 | Yes, the last sound changes! |
| tv_which_changes | 4 | Which sound changes? |
| tv_map_hint | 3 | The glowing stone is your next game. Tap it when you're ready. |
| tv_petal_say | 3 | Tap the petal, and say it with me. |
| tv_how_we_write | 3 | This is how we write... |
| t_two_letters | 3 | It's two letters, but it's one sound. |
| tv_tap_letter_say | 3 | Now you tap it, and say the sound. |
| tv_said_well | 3 | Good, you said that sound really well. |
| tv_tap_it_say_short | 3 | Now you tap it, and say it. |
| tv_ne_new_sounds | 3 | Now let's play Ninja Eyes, with your new sounds. |
| tv_find_write | 3 | Find how we write... |
| yay_8 | 3 | Wow, great listening! |
| tv_build_dojo | 3 | Now let's build some words with your new sounds. |
| first_sound_q | 3 | What's the first sound? |
| last_sound_q | 3 | What's the last sound? |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (16)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @113.0s and @115.4s |
| t_in | 2 | ...in... | world flower @308.6s and @311.9s |
| tv_which_changes | 2 | Which sound changes? | level w5-4 @755.5s and @764.6s |
| tv_thats_write | 1 | That's how we write... | level w5-1 @115.5s and @123.1s |
| we_need | 1 | We need... | level w5-1 @117.8s and @125.8s |
| tv_swap_now_change | 1 | Now let's change it to... | level w5-4 @721.1s and @735.9s |
| tv_swap_both | 1 | Listen to them both... | level w5-4 @723.8s and @738.6s |
| tv_guess_q | 1 | Listen for the word... | level w5-5 @820.6s and @834.8s |
| tv_run_which | 1 | Tap the lantern with my word. | level w5-5 @825.4s and @839.4s |
| next_sound_q | 1 | What's the next sound? | level w5-6 @1002.0s and @1003.5s |
| wf_found_gem | 1 | You found a new gem! It's a spelling of the sound... | world flower @1121.7s and @1135.8s |
| t_ways_2 | 1 | Now you know two ways to spell... | world flower @1132.3s and @1145.8s |

### Spliced utterances: 74 of 397 (19%); chains of 5+ clips: 51

Commonest spliced shapes:

- ×4 ‹tv_next_word› + W
- ×3 ‹tv_battle_again› + ‹tv_your_word› + W
- ×2 ‹tv_thats_write› + /X/
- ×2 /X/ + ‹t_in› + W + ‹t_and_sometimes› + /X/ + ‹t_in› + W
- ×2 ‹tv_fs_say_slow› + /X/ + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×2 ‹tv_learn_frame_ways› + ‹tv_here_sound› + /X/
- ×2 /X/ + ‹tv_next_sound_known› + /X/
- ×2 ‹tv_which_write› + /X/
- ×2 ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q› + /X/
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/
- ×1 /X/ + ‹tv_learn_another› + /X/

Longest chains:

- level w5-4 @733.4s (10 clips): /ch/ /i/ /k/ "chick" Now let's change it to... "chin" Listen to them both... "chick" (slowly) "chin" (slowly) What do we need to change?
- level w5-8 @1268.0s (10 clips): /w/ /i/ /ng/ "wing" Now let's change it to... "witch" Listen to them both... "wing" (slowly) "witch" (slowly) What do we need to change?
- level w5-8 @1248.1s (9 clips): /ng/ "king" If you'd like to see me do one first, tap my paw. Now let's change it to... "wing" Listen to them both... "king" (slowly) "wing" (slowly) What do we need to change?
- level w5-4 @715.9s (8 clips): "kick" If you'd like to see me do one first, tap my paw. Now let's change it to... "chick" Listen to them both... "kick" (slowly) "chick" (slowly) What do we need to change?
- level w5-6 @1008.0s (8 clips): /s/ /k/ /e/ /ch/ "sketch" You built that whole word by yourself! Here's your next word... "match"
- level w5-1 @85.0s (7 clips): And this is how we write... /dh/ The same spelling can sometimes be... /th/ ...in moth, and sometimes... /dh/ ...in this.
- reward @245.4s (7 clips): Let's see what you won back from Baron Muddle. You won back four sounds... /sh/ /ch/ /th/ /dh/ More stickers for your Sticker Book!
- world flower @307.6s (7 clips): /dh/ ...in... "this" ...and sometimes... /th/ ...in... "moth"

### Praise: 19 lines (0.7 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 24

- level w5-1 @42.0s: "Tap it once more, and say it again." cut after 0.0 of 2.5 s by /sh/
- level w5-1 @48.6s: "Tap its petal, and say it." cut after 1.4 of 2.4 s by /ch/
- level w5-1 @58.2s: "Now you tap it, and say it." cut after 1.5 of 2.1 s by /ch/
- level w5-1 @113.0s: "Which of these is the way we write..." cut after 1.7 of 2.7 s by /sh/
- level w5-1 @115.4s: "Which of these is the way we write..." cut after 0.1 of 2.7 s by That's how we write...
- level w5-1 @123.0s: "Find how we write..." cut after 0.1 of 1.5 s by That's how we write...
- level w5-3 @479.8s: "Now you tap it, and say the sound." cut after 0.6 of 2.5 s by /k/
- level w5-3 @495.8s: "It's a new sound. Tap its petal, and say it with me." cut after 1.4 of 4.0 s by /ng/
- level w5-3 @555.9s: "What's the first sound?" cut after 0.0 of 1.6 s by /w/
- level w5-3 @562.1s: "What's the last sound?" cut after 1.2 of 1.5 s by /n/
- level w5-4 @727.6s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the first sound changes!
- level w5-4 @742.9s: "What do we need to change?" cut after 1.5 of 1.8 s by Yes, the last sound changes!
- level w5-4 @755.5s: "Which sound changes?" cut after 1.2 of 1.9 s by Yes, the first sound changes!
- level w5-6 @914.5s: "Tap the petal, and say it with me." cut after 1.5 of 2.5 s by /k/
- level w5-6 @921.0s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /k/
- level w5-6 @931.4s: "Tap its petal, and say it." cut after 1.3 of 2.4 s by /w/
- level w5-6 @938.4s: "Now you tap it, and say it." cut after 1.5 of 2.1 s by /w/
- level w5-6 @983.6s: "Which of these is the way we write..." cut after 1.6 of 2.7 s by /k/
- level w5-6 @985.4s: "Which of these is the way we write..." cut after 1.8 of 2.7 s by /w/
- level w5-6 @991.0s: "/v/" cut after 0.2 of 0.9 s by /v/
- level w5-6 @992.0s: "Now find how we write..." cut after 1.8 of 2.1 s by /ch/
- level w5-8 @1262.1s: "What do we need to change?" cut after 0.9 of 1.8 s by Yes, the first sound changes!
- level w5-8 @1279.9s: "What do we need to change?" cut after 1.0 of 1.8 s by Yes, the last sound changes!
- level w5-8 @1292.0s: "Which sound changes?" cut after 1.5 of 1.9 s by Yes, the first sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 3 | level w5-1, level w5-3, level w5-6 |
| t_another_way "This is another way to spell the sound..." | 3 | level w5-3, level w5-6 ×2 |
| r2_gems_more "Look, these gems have filled a little more." | 3 | reward ×3 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |

## playtest/fix/D1/verify1/transcripts/continuous-learner-from-w5-1.json (learner-from-w5-1, one continuous page)

412 Sensei lines, 630 sounds and words, 462 utterances in 52 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_listen_here | 24 | Let's listen again. What can you hear here? |
| next_sound_q | 21 | What's the next sound? |
| first_sound_q | 15 | What's the first sound? |
| last_sound_q | 15 | What's the last sound? |
| audit_listen_next | 15 | Let's listen again. What sound comes next? |
| say_sounds_read | 14 | Say the sounds, and read the word. |
| tv_your_word | 13 | Your word is... |
| tv_next_word | 10 | Here's your next word... |
| tv_praise_kept_going | 8 | That was a tricky one, and you kept going. |
| tv_here_sound | 7 | Here's the sound... |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| streak_lost | 6 | Keep going, ninja. |
| wf_found_gem | 6 | You found a new gem! It's a spelling of the sound... |
| tv_swap_now_change | 6 | Now let's change it to... |
| tv_swap_both | 6 | Listen to them both... |
| tv_swap_pick | 6 | Now tap the new one. |
| streak_3 | 5 | Ninja power! |
| st_first_changes | 5 | Yes, the first sound changes! |
| t_two_letters | 4 | It's two letters, but it's one sound. |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| we_need | 4 | We need... |
| t_in | 4 | ...in... |
| audit_gem_more | 4 | Look, this gem has filled a little more. |
| st_what_change | 4 | What do we need to change? |
| tv_which_changes | 4 | Which sound changes? |
| swap_which | 4 | Which sound needs to change? |
| st_last_changes | 4 | Yes, the last sound changes! |
| tv_map_hint | 3 | The glowing stone is your next game. Tap it when you're ready. |
| tv_petal_say | 3 | Tap the petal, and say it with me. |

### Echoes: the same utterance shape back to back (1)

- level w5-1 @161.9s ×2: /m/ What's the next sound? ‖ /u/ What's the next sound?

### Near repeats: the same line again within 15 s (14)

| Line | Repeats | Text | Example |
|---|---|---|---|
| next_sound_q | 6 | What's the next sound? | level w5-1 @162.8s and @167.6s |
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @122.4s and @131.2s |
| t_in | 2 | ...in... | world flower @381.1s and @384.4s |
| tv_which_changes | 2 | Which sound changes? | level w5-4 @950.5s and @959.7s |
| swap_which | 1 | Which sound needs to change? | level w5-8 @1693.6s and @1707.2s |

### Spliced utterances: 88 of 462 (19%); chains of 5+ clips: 49

Commonest spliced shapes:

- ×4 ‹tv_next_word› + W
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_praise_kept_going› + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 /X/ + ‹tv_next_sound_known› + /X/
- ×2 ‹tv_thats_write› + /X/
- ×2 ‹we_need› + /X/
- ×2 ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_your_word› + W + ‹first_sound_q›
- ×2 ‹tv_battle_again› + ‹tv_your_word› + W
- ×1 ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×1 /X/ + ‹tv_learn_another› + /X/
- ×1 ‹tv_how_we_write› + /X/
- ×1 /X/ + ‹tv_learn_last› + /X/

Longest chains:

- level w5-4 @928.9s (11 clips): /ch/ /e/ /k/ "check" Ninja power! Now let's change it to... "chick" Listen to them both... "check" (slowly) "chick" (slowly) What do we need to change?
- level w5-3 @747.8s (10 clips): Say the sounds, and read the word. /k/ /l/ /o/ /k/ "clock" That was a tricky one, and you kept going. Here's your next word... "strong" What's the first sound?
- level w5-3 @784.5s (10 clips): Say the sounds, and read the word. /s/ /t/ /r/ /o/ /ng/ "strong" Your word is... "wing" What's the first sound?
- level w5-4 @979.3s (10 clips): /k/ /i/ /ng/ "king" Ninja power! Now let's change it to... "wing" "king" (slowly) "wing" (slowly) Which sound needs to change?
- level w5-6 @1306.0s (10 clips): Say the sounds, and read the word. /k/ /u/ /f/ "cuff" It's two letters, but it's one sound. /f/ Here's your next word... "witch" What's the first sound?
- level w5-8 @1645.6s (10 clips): /w/ /i/ /ng/ "wing" Now let's change it to... "king" Listen to them both... "wing" (slowly) "king" (slowly) What do we need to change?
- level w5-8 @1698.3s (10 clips): /ch/ /i/ /k/ "chick" Now let's change it to... "chip" Listen to them both... "chick" (slowly) "chip" (slowly) Which sound needs to change?
- level w5-1 @219.0s (9 clips): Say the sounds, and read the word. /dh/ /e/ /m/ "them" You said it slowly, and found every sound. Your word is... "thin" What's the first sound?

### Praise: 14 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 15

- level w5-1 @43.2s: "Tap it once more, and say it again." cut after 0.0 of 2.5 s by /sh/
- level w5-1 @125.1s: "/sh/" cut after 0.5 of 0.8 s by That's how we write...
- level w5-1 @141.0s: "Now find how we write..." cut after 0.5 of 2.1 s by /dh/
- level w5-1 @246.4s: "/n/" cut after 0.5 of 0.9 s by Say the sounds, and read the word.
- level w5-3 @589.4s: "Tap the petal, and say it with me." cut after 0.4 of 2.5 s by /k/
- level w5-3 @662.3s: "/ng/" cut after 0.4 of 0.7 s by Keep going, ninja.
- level w5-4 @920.8s: "What do we need to change?" cut after 1.1 of 1.8 s by Yes, the first sound changes!
- level w5-4 @939.7s: "What do we need to change?" cut after 0.6 of 1.8 s by Yes, the middle sound changes!
- level w5-4 @959.7s: "Which sound changes?" cut after 1.1 of 1.9 s by Yes, the first sound changes!
- level w5-4 @971.3s: "Which sound needs to change?" cut after 1.1 of 1.8 s by Yes, the last sound changes!
- level w5-4 @990.8s: "Which sound needs to change?" cut after 0.7 of 1.8 s by Yes, the first sound changes!
- level w5-6 @1305.5s: "/f/" cut after 0.5 of 0.9 s by Say the sounds, and read the word.
- level w5-8 @1657.3s: "What do we need to change?" cut after 0.9 of 1.8 s by Yes, the first sound changes!
- level w5-8 @1693.6s: "Which sound needs to change?" cut after 0.6 of 1.8 s by Yes, the first sound changes!
- level w5-8 @1707.2s: "Which sound needs to change?" cut after 0.8 of 1.8 s by Yes, the last sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 4 | level w5-1, level w5-2, level w5-6 ×2 |
| audit_gem_more "Look, this gem has filled a little more." | 4 | reward ×4 |
| t_another_way "This is another way to spell the sound..." | 3 | level w5-3, level w5-6 ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |

## playtest/fix/D1/verify1/transcripts/continuous-perfect-from-w6-br1.json (perfect-from-w6-br1, one continuous page)

287 Sensei lines, 569 sounds and words, 359 utterances in 59 pieces.

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
| next_sound_q | 5 | What's the next sound? |
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
| tv_build_dojo | 4 | Now let's build some words with your new sounds. |
| first_sound_q | 4 | What's the first sound? |
| last_sound_q | 4 | What's the last sound? |
| tv_build_done | 4 | You built words with their sounds, and you read them. |

### Echoes: the same utterance shape back to back (1)

- level w6-3 @671.4s ×2: What's the next sound? /w/ ‖ What's the next sound? /ee/

### Near repeats: the same line again within 15 s (6)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w6-1 @298.1s and @299.0s |
| next_sound_q | 2 | What's the next sound? | level w6-1 @315.5s and @318.7s |

### Spliced utterances: 59 of 359 (16%); chains of 5+ clips: 59

Commonest spliced shapes:

- ×3 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/
- ×3 /X/ + ‹tv_said_well› + ‹tv_next_sound_known› + /X/
- ×2 ‹tv_learn_first_short› + /X/
- ×2 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×2 ‹tv_to_reward› + ‹tv_won_one› + /X/
- ×2 ‹tv_learn_all_two› + ‹tv_ne_new_sounds› + ‹tv_which_write› + /X/
- ×2 ‹tv_which_write› + /X/
- ×2 ‹tv_learn_short_two› + ‹tv_learn_first_short› + /X/
- ×2 ‹tv_won_one› + /X/
- ×1 ‹tv_here_sound› + /X/ + ‹audit_bridging_first› + ‹tv_sort_frame› + ‹tv_sort_open›
- ×1 ‹t_two_letters› + /X/ + ‹tv_sort_ido› + W + ‹tv_sort_see› + ‹tv_sort_so› + ‹tv_ready_yours›
- ×1 ‹tv_here_sound› + /X/ + ‹audit_sort_pair› + ‹tg_ch_ch_way› + ‹st_two_letters_too› + /X/ + ‹tv_spelt_like_this_match›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_next_sound_known› + /X/
- ×1 ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + /X/
- ×1 ‹tv_which_write› + /X/ + /X/

Longest chains:

- level w6-ec11 @1246.0s (8 clips): /ie/ You can hear it in... "light" "night" ...and... "high" Tap the petal, and say it with me. /ie/
- level w6-br1 @44.8s (7 clips): It's two letters, but it's one sound. /k/ I'll sort the first one. My word is... "neck" I can see this spelling at the end. So it goes in this chest. Now you do one. Are you ready?
- level w6-br2 @150.5s (7 clips): Here's the sound... /ch/ This sound can be spelt in two ways. This is the way we spell it in chick. This one's two letters too, but it's just one sound. /ch/ In match, it's spelt like this.
- level w6-3 @678.0s (7 clips): /k/ /w/ /ee/ /n/ "queen" Here's your next word... "bee"
- level w6-br1 @89.7s (6 clips): /s/ /k/ /r/ /u/ /b/ "scrub"
- level w6-br1 @115.9s (6 clips): /k/ /r/ /i/ /s/ /p/ "crisp"
- level w6-1 @252.0s (6 clips): Now watch my ninja write it. This is how we write... /ae/ It's two letters, but it's one sound. Now you tap it, and say the sound. /ae/
- level w6-1 @272.9s (6 clips): Now watch my ninja write it. This is another way to spell the sound... /ae/ This one's two letters too, but it's just one sound. Now you tap it, and say it. /ae/

### Praise: 10 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 25

- level w6-br1 @109.5s: ""skid"" cut after 0.4 of 0.7 s by /s/
- level w6-1 @250.0s: "Tap the petal, and say it with me." cut after 1.5 of 2.5 s by /ae/
- level w6-1 @262.9s: "Tap it once more, and say it again." cut after 0.6 of 2.5 s by /ae/
- level w6-1 @270.7s: "Tap its petal, and say it." cut after 1.9 of 2.4 s by /ae/
- level w6-1 @298.1s: "Which of these is the way we write..." cut after 0.5 of 2.7 s by /ae/
- level w6-1 @392.1s: "/n/" cut after 0.5 of 0.9 s by Say the sounds, and read the word.
- level w6-3 @656.1s: "Which of these is the way we write..." cut after 2.3 of 2.7 s by /ee/
- level w6-3 @659.0s: "Which of these is the way we write..." cut after 1.5 of 2.7 s by /ee/
- level w6-3 @676.0s: "What's the last sound?" cut after 1.1 of 1.5 s by /n/
- level w6-4 @832.6s: ""beach"" cut after 0.3 of 0.7 s by /b/
- level w6-6 @980.5s: "Tap the petal, and say it with me." cut after 1.4 of 2.5 s by /oe/
- level w6-6 @989.7s: "Now you tap it, and say the sound." cut after 1.9 of 2.5 s by /oe/
- level w6-6 @1000.1s: "Tap its petal, and say it." cut after 1.4 of 2.4 s by /oe/
- level w6-6 @1010.6s: "Now you tap it, and say it." cut after 1.6 of 2.1 s by /oe/
- level w6-6 @1022.2s: "Which of these is the way we write..." cut after 1.6 of 2.7 s by /oe/
- level w6-6 @1024.3s: "Which of these is the way we write..." cut after 1.5 of 2.7 s by /oe/
- level w6-8 @1211.0s: ""coat"" cut after 0.3 of 0.6 s by /k/
- level w6-ec11 @1251.6s: "Tap the petal, and say it with me." cut after 1.6 of 2.5 s by /ie/
- level w6-ec11 @1261.5s: "Now you tap it, and say the sound." cut after 1.4 of 2.5 s by /ie/
- level w6-ec11 @1271.9s: "Tap its petal, and say it." cut after 2.1 of 2.4 s by /ie/
- level w6-ec11 @1295.3s: "Which of these is the way we write..." cut after 0.2 of 2.7 s by Keep going, ninja.
- level w6-ec11 @1302.0s: "Which of these is the way we write..." cut after 2.0 of 2.7 s by /ie/
- level w6-7 @1474.2s: ""high"" cut after 0.2 of 0.5 s by /h/
- level w6-10 @1638.5s: "story:s6_5" cut after 1.7 of 2.6 s by /g/
- level w6-10 @1671.5s: "story:s6_q" cut after 1.3 of 1.8 s by The end! What a story!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 6 | level w6-br1, level w6-1, level w6-3, level w6-6, level w6-ec11, level w6-9 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | stone 2: w6-br2, stone 4: w6-2, level w6-4, level w6-8, level w6-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| audit_gem_more "Look, this gem has filled a little more." | 4 | reward ×4 |
| t_another_way "This is another way to spell the sound..." | 4 | level w6-1, level w6-3, level w6-6, level w6-ec11 |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| t_three_letters "It's three letters, but it's just one sound." | 2 | level w6-5, level w6-ec11 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w6-br1 |

## playtest/fix/D1/verify1/transcripts/continuous-learner-from-w6-br1.json (learner-from-w6-br1, one continuous page)

391 Sensei lines, 611 sounds and words, 429 utterances in 59 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 19 | What's the first sound? |
| last_sound_q | 19 | What's the last sound? |
| say_sounds_read | 18 | Say the sounds, and read the word. |
| next_sound_q | 17 | What's the next sound? |
| tv_your_word | 13 | Your word is... |
| tv_listen_here | 13 | Let's listen again. What can you hear here? |
| tv_here_sound | 10 | Here's the sound... |
| tv_next_word | 9 | Here's your next word... |
| t_two_letters | 8 | It's two letters, but it's one sound. |
| tv_watch_write | 8 | Now watch my ninja write it. |
| tv_which_write | 8 | Which of these is the way we write... |
| audit_listen_next | 8 | Let's listen again. What sound comes next? |
| streak_lost | 7 | Keep going, ninja. |
| help_sort | 6 | Tap the chest with the same spelling as the word. |
| tv_praise_sorted | 6 | That's the right chest. |
| tv_sort_done | 6 | Same sound, different spellings. You sorted them all. |
| we_need | 6 | We need... |
| streak_3 | 5 | Ninja power! |
| audit_sort_again | 5 | Sorting time! Same sound, different spellings. |
| audit_sort_pair | 5 | This sound can be spelt in two ways. |
| tv_praise_kept_going | 5 | That was a tricky one, and you kept going. |
| streak_6 | 4 | Wow! Super ninja streak! |
| audit_gem_more | 4 | Look, this gem has filled a little more. |
| tv_learn_short_two | 4 | Back to the dojo. Today there are two new sounds. |
| tv_learn_first_short | 4 | Here's the first new sound... |
| tv_petal_say | 4 | Tap the petal, and say it with me. |
| tv_how_we_write | 4 | This is how we write... |
| tv_tap_letter_say | 4 | Now you tap it, and say the sound. |
| tv_said_well | 4 | Good, you said that sound really well. |
| tv_next_sound_known | 4 | Our next sound is one you know... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (10)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w6-1 @315.9s and @325.7s |
| next_sound_q | 4 | What's the next sound? | level w6-1 @402.6s and @405.9s |
| last_sound_q | 1 | What's the last sound? | level w6-3 @757.5s and @771.9s |
| tv_guess_q | 1 | Listen for the word... | level w6-9 @1857.8s and @1871.9s |

### Spliced utterances: 72 of 429 (17%); chains of 5+ clips: 62

Commonest spliced shapes:

- ×4 ‹tv_learn_short_two› + ‹tv_learn_first_short› + /X/
- ×3 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_next_word› + W + ‹first_sound_q›
- ×2 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹tv_tap_it_say_short›
- ×2 ‹streak_lost› + ‹tv_thats_write› + /X/
- ×2 ‹we_need› + /X/
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + /X/ + W + ‹tv_next_word› + W + ‹first_sound_q›
- ×2 /X/ + ‹tv_said_well› + ‹tv_next_sound_known› + /X/
- ×2 ‹tv_which_write› + /X/ + /X/
- ×2 ‹tv_won_one› + /X/
- ×2 ‹tv_learn_all_two› + ‹tv_ne_new_sounds› + ‹tv_which_write› + /X/ + /X/
- ×2 ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q›
- ×1 ‹tv_here_sound› + /X/ + ‹audit_bridging_first› + ‹tv_sort_frame› + ‹tv_sort_open›
- ×1 ‹t_two_letters› + /X/ + ‹tv_sort_ido› + W + ‹tv_sort_see› + ‹tv_sort_so› + ‹tv_ready_yours›
- ×1 ‹audit_sort_again› + ‹tv_here_sound› + /X/ + ‹audit_sort_pair› + ‹tg_ch_ch_way› + ‹t_two_letters› + /X/ + ‹tv_spelt_like_this_match›
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_letter_say›

Longest chains:

- level w6-6 @1325.0s (10 clips): /t/ Say the sounds, and read the word. /k/ /oe/ /t/ "coat" Well done. Your word is... "soap" What's the first sound?
- level w6-ec11 @1669.7s (10 clips): Say the sounds, and read the word. /b/ /r/ /ie/ /t/ "bright" That was a tricky one, and you kept going. Your word is... "lie" What's the first sound?
- level w6-1 @388.1s (9 clips): Say the sounds, and read the word. /p/ /l/ /ae/ "play" You said it slowly, and found every sound. Your word is... "spray" What's the first sound?
- level w6-1 @420.3s (9 clips): Say the sounds, and read the word. /s/ /p/ /r/ /ae/ "spray" Here's your next word... "train" What's the first sound?
- level w6-3 @808.1s (9 clips): Say the sounds, and read the word. /d/ /r/ /ee/ /m/ "dream" Here's your next word... "bee" What's the first sound?
- level w6-6 @1278.4s (9 clips): Say the sounds, and read the word. /g/ /r/ /oe/ "grow" That was a tricky one, and you kept going. Your word is... "blow" What's the first sound?
- level w6-ec11 @1611.0s (9 clips): Say the sounds, and read the word. /f/ /ie/ /t/ "fight" Here's your next word... "tie" What's the first sound? /t/
- level w6-br2 @164.8s (8 clips): Sorting time! Same sound, different spellings. Here's the sound... /ch/ This sound can be spelt in two ways. This is the way we spell it in chick. It's two letters, but it's one sound. /ch/ In match, it's spelt like this.

### Praise: 15 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 13

- level w6-br1 @111.0s: ""kiss"" cut after 0.2 of 0.6 s by /k/
- level w6-br2 @204.5s: ""chat"" cut after 0.2 of 0.7 s by /ch/
- level w6-1 @281.1s: "Tap it once more, and say it again." cut after 0.7 of 2.5 s by /ae/
- level w6-2 @610.7s: ""snail"" cut after 0.3 of 0.9 s by /s/
- level w6-3 @737.9s: "/ee/" cut after 0.2 of 0.6 s by /ee/
- level w6-4 @962.3s: ""queen"" cut after 0.2 of 0.7 s by /k/
- level w6-4 @990.8s: ""seat"" cut after 0.2 of 0.6 s by /s/
- level w6-8 @1446.9s: ""toast"" cut after 0.3 of 0.9 s by /t/
- level w6-8 @1452.5s: ""road"" cut after 0.4 of 0.7 s by /r/
- level w6-8 @1472.3s: ""blow"" cut after 0.3 of 0.6 s by /b/
- level w6-ec11 @1580.0s: "Which of these is the way we write..." cut after 0.0 of 2.7 s by Keep going, ninja.
- level w6-ec11 @1619.3s: "What's the first sound?" cut after 0.3 of 1.6 s by /t/
- level w6-7 @1817.5s: ""bright"" cut after 0.4 of 0.9 s by /b/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 8 | level w6-br1, level w6-br2, level w6-1, level w6-3, level w6-5 ×2, level w6-ec11, level w6-9 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | level w6-br2, stone 4: w6-2, level w6-4, level w6-8, level w6-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| audit_gem_more "Look, this gem has filled a little more." | 4 | reward ×4 |
| t_another_way "This is another way to spell the sound..." | 4 | level w6-1, level w6-3, level w6-6, level w6-ec11 |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| t_three_letters "It's three letters, but it's just one sound." | 2 | level w6-ec11 ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w6-br1 |

## playtest/fix/D1/verify1/transcripts/continuous-splitter-from-w5-1.json (splitter-from-w5-1, one continuous page)

300 Sensei lines, 462 sounds and words, 322 utterances in 38 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| t_two_letters | 9 | It's two letters, but it's one sound. |
| tv_your_word | 8 | Your word is... |
| next_sound_q | 8 | What's the next sound? |
| we_need | 8 | We need... |
| streak_lost | 7 | Keep going, ninja. |
| tv_here_sound | 7 | Here's the sound... |
| tv_watch_write | 6 | Now watch my ninja write it. |
| tv_which_write | 6 | Which of these is the way we write... |
| first_sound_q | 6 | What's the first sound? |
| last_sound_q | 6 | What's the last sound? |
| tv_next_word | 6 | Here's your next word... |
| thats | 6 | That's... |
| wf_found_gem | 6 | You found a new gem! It's a spelling of the sound... |
| streak_3 | 5 | Ninja power! |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| say_sounds_read | 4 | Say the sounds, and read the word. |
| t_in | 4 | ...in... |
| tv_swap_now_change | 4 | Now let's change it to... |
| tv_swap_both | 4 | Listen to them both... |
| st_what_change | 4 | What do we need to change? |
| st_last_changes | 4 | Yes, the last sound changes! |
| tv_swap_pick | 4 | Now tap the new one. |
| st_first_changes | 4 | Yes, the first sound changes! |
| tv_which_changes | 4 | Which sound changes? |
| tv_map_hint | 3 | The glowing stone is your next game. Tap it when you're ready. |
| tv_petal_say | 3 | Tap the petal, and say it with me. |
| tv_how_we_write | 3 | This is how we write... |
| tv_tap_letter_say | 3 | Now you tap it, and say the sound. |
| tv_said_well | 3 | Good, you said that sound really well. |
| tv_tap_it_say_short | 3 | Now you tap it, and say it. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (10)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 3 | Which of these is the way we write... | level w5-1 @110.8s and @114.5s |
| next_sound_q | 2 | What's the next sound? | level w5-1 @196.6s and @200.4s |
| t_in | 2 | ...in... | world flower @351.3s and @354.7s |
| tv_which_changes | 2 | Which sound changes? | level w5-4 @888.8s and @898.9s |
| we_need | 1 | We need... | level w5-3 @642.2s and @655.4s |

### Spliced utterances: 80 of 322 (25%); chains of 5+ clips: 56

Commonest spliced shapes:

- ×4 ‹thats› + /X/ + ‹we_need› + /X/ + ‹t_two_letters›
- ×3 ‹wf_found_gem› + /X/
- ×2 ‹tv_which_write› + /X/ + /X/
- ×2 ‹tv_battle_again› + ‹tv_your_word› + W
- ×2 ‹tv_next_word› + W
- ×2 ‹tv_learn_frame_ways› + ‹tv_here_sound› + /X/
- ×2 /X/ + ‹tv_next_sound_known› + /X/
- ×2 W + ‹tv_show_offer_short› + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×1 ‹tv_learn_short_four› + ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×1 /X/ + ‹tv_learn_another› + /X/
- ×1 ‹tv_how_we_write› + /X/

Longest chains:

- level w5-1 @181.3s (10 clips): /sh/ Say the sounds, and read the word. /d/ /i/ /sh/ "dish" You said it slowly, and found every sound. Your word is... "cloth" What's the first sound?
- level w5-4 @867.7s (10 clips): /sh/ /e/ /d/ "shed" Now let's change it to... "red" Listen to them both... "shed" (slowly) "red" (slowly) What do we need to change?
- level w5-8 @1537.6s (10 clips): /s/ /o/ /k/ "sock" Now let's change it to... "song" Listen to them both... "sock" (slowly) "song" (slowly) What do we need to change?
- level w5-1 @238.1s (9 clips): Say the sounds, and read the word. /sh/ /e/ /d/ "shed" That was a tricky one, and you kept going. Your word is... "rush" What's the first sound?
- level w5-3 @670.3s (9 clips): Say the sounds, and read the word. /sh/ /o/ /k/ "shock" That was a tricky one, and you kept going. Here's your next word... "when" What's the first sound?
- level w5-4 @848.4s (8 clips): "shell" If you'd like to see me do one first, tap my paw. Now let's change it to... "shed" Listen to them both... "shell" (slowly) "shed" (slowly) What do we need to change?
- level w5-6 @1181.3s (8 clips): Ninja power! /k/ /w/ /i/ /z/ "quiz" Here's your next word... "quit"
- world flower @1321.7s (8 clips): The same spelling can sometimes be... /u/ ...in... "duck" ...and sometimes... /w/ ...in... "quiz"

### Praise: 15 lines (0.6 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 9

- level w5-1 @35.5s: "Tap it once more, and say it again." cut after 0.0 of 2.5 s by /sh/
- level w5-1 @113.5s: "/sh/" cut after 0.2 of 0.8 s by /sh/
- level w5-1 @123.9s: "Now find how we write..." cut after 0.6 of 2.1 s by /dh/
- level w5-3 @588.2s: "It's a new sound. Tap its petal, and say it with me." cut after 1.8 of 4.0 s by /ng/
- level w5-3 @637.3s: "Find how we write..." cut after 1.0 of 1.5 s by Keep going, ninja.
- level w5-4 @861.2s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the last sound changes!
- level w5-4 @878.0s: "What do we need to change?" cut after 0.6 of 1.8 s by Yes, the first sound changes!
- level w5-8 @1530.5s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the first sound changes!
- level w5-8 @1548.2s: "What do we need to change?" cut after 1.4 of 1.8 s by Yes, the last sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 9 | level w5-1 ×4, level w5-2 ×2, level w5-3, level w5-6, level w5-7 |
| t_another_way "This is another way to spell the sound..." | 3 | level w5-3, level w5-6 ×2 |
| r2_gems_more "Look, these gems have filled a little more." | 3 | reward ×3 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C5-P: playtest/fix/D1/verify1/transcripts/continuous-perfect-from-w5-1.json

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
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 3 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 8 of 8 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.21 | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 9.8 s (boss w5-11); 0 over | pass |

- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @4:38.9; ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from reward @18:05.1
- **over-framed**: ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-3 @7:37.3: learn is known before w5-1; ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-6 @15:03.3, again after w5-3 @7:37.3

### C5-L: playtest/fix/D1/verify1/transcripts/continuous-learner-from-w5-1.json

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
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 3 | **FAIL** |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 10 of 10 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.14 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 3 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 1 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 5 words; 176 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 75 of 75, rabbit 57 of 57 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.7 s (build w5-1); 0 over | pass |

- **map-hint-cut**: map @0:08.8 ‹tv_map_hint› "The glowing stone is your next game. Tap it when you're ready." cut
- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @5:47.4; ‹tv_listen_here› "Let's listen again. What can you hear here?" from w5-6 @20:51.2; ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from reward @23:18.2
- **cut-explanations**: map @0:08.8 ‹tv_map_hint› "The glowing stone is your next game. Tap it when you're ready."
- **over-framed**: ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-6 @18:47.2, again after w5-3 @9:38.1

### C6-P: playtest/fix/D1/verify1/transcripts/continuous-perfect-from-w6-br1.json

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
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.11 | pass |
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
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 7 words; 101 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 8.3 s (run w6-9); 0 over | pass |

- **letters-twice**: /ie/: 2× (w6-ec11 20:58.7, w6-ec11 21:20.4)

### C6-L: playtest/fix/D1/verify1/transcripts/continuous-learner-from-w6-br1.json

learner, from w6-br1, opt-in none.

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
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 2 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.31 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 1 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 2 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.3 s (sort w6-br1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 6 words; 150 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.3 s (build w6-1); 0 over | pass |

- **letters-60s**: w6-5 @18:38.9 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **line-60s**: ‹tv_listen_here› "Let's listen again. What can you hear here?" from w6-6 @20:44.6

### C5-S: playtest/fix/D1/verify1/transcripts/continuous-splitter-from-w5-1.json

splitter, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 12 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 2 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 1 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 3 | **FAIL** |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 9 of 9 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.27 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 1 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | 6 of 7 (86%) | **FAIL** |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 2 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 5 words; 106 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.9 s (build w5-1); 0 over | pass |

- **letters-60s**: w5-1 @3:45.6 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-1 @4:24.9 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **map-hint-cut**: map @0:05.2 ‹tv_map_hint› "The glowing stone is your next game. Tap it when you're ready." cut
- **praise-stacks**: w5-3 @10:36.2: "Brilliant!" → "Keep going, ninja."
- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @5:18.7; ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from reward @21:26.9
- **cut-explanations**: map @0:05.2 ‹tv_map_hint› "The glowing stone is your next game. Tap it when you're ready."
- **split-correction**: w5-7 @23:18.8 tapped < c > for < ck >: then "Keep going, ninja." · "Yes, that's a spelling of that sound too! But in this word, we spell it like this..."
- **over-framed**: ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-3 @9:06.1: learn is known before w5-1; ‹tv_learn_frame_ways› "Today in the dojo, I'm going to teach you new ways to write a sound yo" at w5-6 @17:28.1, again after w5-3 @9:06.1

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

