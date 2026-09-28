# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/runs/fix/D2/t-w1-6b/continuous-learner-from-w1-6.json (learner-from-w1-6, one continuous page)

22 Sensei lines, 31 sounds and words, 26 utterances in 7 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_fs_stuck_slow | 2 | Let's say it the slow way first... |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_battle_oh_no | 1 | Oh no! One of Baron Muddle's monsters is in the way! |
| tv_battle_frame | 1 | We zap it with words, just like Word Building. |
| tv_battle_card | 1 | I'll zap the first one. Tap my word card, and hear the word. |
| tv_first_is | 1 | The first sound is... |
| tv_bar_down | 1 | Zap! Look, its bar went down. |
| tv_you_find_last | 1 | Can you find the last one? |
| tv_battle_ready | 1 | That's how we spell a word. Now you spell one. Are you ready to zap it? |
| tv_your_word | 1 | Your word is... |
| first_sound_q | 1 | What's the first sound? |
| tv_fs_say_sounds_slow | 1 | Let's say the sounds, the slow way... |
| tv_fs_rabbit_read | 1 | Now tap the rabbit, and read the word fast. |
| tv_fs_two_ways | 1 | There's a slow way to say a word, and a fast way. |
| tv_next_word | 1 | Here's your next word... |
| tv_listen_here | 1 | Let's listen again. What can you hear here? |
| tv_praise_kept_going | 1 | That was a tricky one, and you kept going. |
| battle_win | 1 | Hooray! The monster ran away! |
| tv_battle_why | 1 | Every monster you beat helps us win back the sounds. |
| audit_gem_first | 1 | Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. |
| tv_map_next_soundhunt | 1 | Next is a new game, called Sound Hunt. Tap the glowing stone to play. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (0)

| Line | Repeats | Text | Example |
|---|---|---|---|

### Spliced utterances: 6 of 26 (23%); chains of 5+ clips: 1

Commonest spliced shapes:

- ×1 W + ‹tv_first_is› + /X/
- ×1 ‹tv_your_word› + W
- ×1 ‹tv_fs_stuck_slow› + W + /X/
- ×1 /X/ + ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×1 ‹tv_fs_two_ways› + ‹tv_next_word› + W
- ×1 ‹tv_fs_stuck_slow› + W

Longest chains:

- level w1-6 @48.2s (5 clips): /m/ Let's say the sounds, the slow way... /a/ /m/ Now tap the rabbit, and read the word fast.

### Praise: 1 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 3

- level w1-6 @14.8s: "I'll zap the first one. Tap my word card, and hear the word." cut after 3.2 of 4.0 s by "at"
- level w1-6 @30.3s: "That's how we spell a word. Now you spell one. Are you ready to zap it" cut after 3.2 of 5.1 s by Your word is...
- level w1-6 @53.4s: "Now tap the rabbit, and read the word fast." cut after 0.6 of 3.5 s by "am"

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |

## playtest/runs/fix/D2/t-w1-6b/continuous-perfect-from-w1-6.json (perfect-from-w1-6, one continuous page)

23 Sensei lines, 28 sounds and words, 24 utterances in 7 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_battle_oh_no | 1 | Oh no! One of Baron Muddle's monsters is in the way! |
| tv_battle_frame | 1 | We zap it with words, just like Word Building. |
| tv_battle_card | 1 | I'll zap the first one. Tap my word card, and hear the word. |
| tv_first_is | 1 | The first sound is... |
| tv_bar_down | 1 | Zap! Look, its bar went down. |
| tv_you_find_last | 1 | Can you find the last one? |
| tv_battle_ready | 1 | That's how we spell a word. Now you spell one. Are you ready to zap it? |
| tv_your_word | 1 | Your word is... |
| first_sound_q | 1 | What's the first sound? |
| tv_fs_say_sounds_slow | 1 | Let's say the sounds, the slow way... |
| tv_fs_rabbit_read | 1 | Now tap the rabbit, and read the word fast. |
| tv_fs_two_ways | 1 | There's a slow way to say a word, and a fast way. |
| tv_next_word | 1 | Here's your next word... |
| streak_3 | 1 | Ninja power! |
| tv_fs_say_slow | 1 | Let's say it the slow way... |
| tv_fs_now_fast | 1 | And now, fast... |
| battle_win | 1 | Hooray! The monster ran away! |
| tv_battle_why | 1 | Every monster you beat helps us win back the sounds. |
| fm_rw_more | 1 | More stickers for your Sticker Book! |
| audit_gem_first | 1 | Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. |
| tv_jump_offer | 1 | Wow, you got everything right! Grown-ups, if this is too easy, you can jump ahead. |
| tv_map_next_soundhunt | 1 | Next is a new game, called Sound Hunt. Tap the glowing stone to play. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (0)

| Line | Repeats | Text | Example |
|---|---|---|---|

### Spliced utterances: 5 of 24 (21%); chains of 5+ clips: 1

Commonest spliced shapes:

- ×1 W + ‹tv_first_is› + /X/
- ×1 ‹tv_your_word› + W + ‹first_sound_q›
- ×1 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×1 ‹tv_fs_two_ways› + ‹tv_next_word› + W + /X/
- ×1 ‹tv_fs_say_slow› + /X/ + /X/ + /X/ + ‹tv_fs_now_fast› + W

Longest chains:

- level w1-6 @66.7s (6 clips): Let's say it the slow way... /s/ /a/ /t/ And now, fast... "sat"

### Praise: 2 lines (1.2 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 5

- level w1-6 @13.4s: "I'll zap the first one. Tap my word card, and hear the word." cut after 1.7 of 4.0 s by "at"
- level w1-6 @21.1s: "Can you find the last one?" cut after 1.2 of 1.8 s by /t/
- level w1-6 @25.4s: "That's how we spell a word. Now you spell one. Are you ready to zap it" cut after 2.7 of 5.1 s by Your word is...
- level w1-6 @41.7s: "Now tap the rabbit, and read the word fast." cut after 0.3 of 3.5 s by "am"
- reward @87.1s: "Look, a gem! Each gem holds a way to spell a sound. When you get words" cut after 6.5 of 7.4 s by Wow, you got everything right! Grown-ups, if this 

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |

## playtest/runs/fix/D2/t-w1-13b/continuous-learner-from-w1-13.json (learner-from-w1-13, one continuous page)

72 Sensei lines, 121 sounds and words, 104 utterances in 16 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_fs_stuck_slow | 6 | Let's say it the slow way first... |
| tv_listen_here | 4 | Let's listen again. What can you hear here? |
| tv_your_word | 2 | Your word is... |
| tv_fs_say_sounds_slow | 2 | Let's say the sounds, the slow way... |
| tv_fs_rabbit_read | 2 | Now tap the rabbit, and read the word fast. |
| tv_next_word | 2 | Here's your next word... |
| streak_3 | 2 | Ninja power! |
| streak_lost | 2 | Keep going, ninja. |
| tv_praise_kept_going | 2 | That was a tricky one, and you kept going. |
| audit_listen_next | 2 | Let's listen again. What sound comes next? |
| story_your_turn | 2 | Your turn to read. |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_map_hint | 1 | The glowing stone is your next game. Tap it when you're ready. |
| tv_battle_again | 1 | Another monster! Let's zap it with words. |
| tv_fs_two_ways | 1 | There's a slow way to say a word, and a fast way. |
| battle_win | 1 | Hooray! The monster ran away! |
| tv_battle_why | 1 | Every monster you beat helps us win back the sounds. |
| fm_rw_more | 1 | More stickers for your Sticker Book! |
| audit_gem_first | 1 | Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. |
| tv_map_next_story | 1 | Next is Story Time. Tap the glowing stone to open the book. |
| tv_story_frame | 1 | Story time! I'll read some pages to you, and you'll read some pages to me. |
| tv_story_title | 1 | This story is called... |
| tv_story_begin | 1 | Tap the green arrow, and let's begin. |
| tv_story_yours | 1 | This page is yours. Say the sounds, and read each word. |
| tv_fs_gaps | 1 | The slow way has little gaps between the sounds. |
| tv_story_help | 1 | If you get stuck, tap a word, and I'll help. |
| tv_story_tick | 1 | When you've read it all, tap the green tick. |
| well_read | 1 | Well read! |
| tv_story_choice | 1 | Now you choose what happens. Read the two words, and tap one. |
| tv_fs_say_slow | 1 | Let's say it the slow way... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (0)

| Line | Repeats | Text | Example |
|---|---|---|---|

### Spliced utterances: 13 of 104 (13%); chains of 5+ clips: 5

Commonest spliced shapes:

- ×3 ‹tv_fs_stuck_slow› + W
- ×2 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×2 ‹streak_lost› + ‹tv_fs_stuck_slow› + W
- ×1 ‹tv_battle_again› + ‹tv_your_word› + W
- ×1 ‹tv_fs_two_ways› + ‹tv_next_word› + W + /X/
- ×1 ‹tv_story_title› + ‹story:s1_title› + ‹tv_story_begin›
- ×1 ‹tv_fs_say_slow› + /X/ + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×1 ‹tv_fs_next› + ‹tv_next_word› + W
- ×1 ‹tv_fs_stuck_slow› + W + /X/

Longest chains:

- level w1-14 @247.5s (6 clips): Let's say it the slow way... /p/ /i/ /t/ And now, fast... "pit"
- level w1-13 @56.3s (5 clips): Let's say the sounds, the slow way... /n/ /a/ /p/ Now tap the rabbit, and read the word fast.
- level w1-13 @84.1s (5 clips): /n/ /p/ /a/ /n/ "pan"
- level w1-13 @118.8s (5 clips): /t/ /p/ /a/ /t/ "pat"
- level w1-15 @386.0s (5 clips): Let's say the sounds, the slow way... /t/ /o/ /p/ Now tap the rabbit, and read the word fast.

### Praise: 5 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 3

- level w1-14 @312.4s: "story:s1_q" cut after 1.2 of 2.1 s by "pot"
- level w1-15 @385.1s: "Let's listen again. What can you hear here?" cut after 0.5 of 2.7 s by /p/
- level w1-15 @390.3s: "Now tap the rabbit, and read the word fast." cut after 1.3 of 3.5 s by "top"

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w1-13 |

## playtest/runs/fix/D2/t-w1-13b/continuous-perfect-from-w1-13.json (perfect-from-w1-13, one continuous page)

66 Sensei lines, 100 sounds and words, 90 utterances in 16 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_fs_stuck_slow | 3 | Let's say it the slow way first... |
| tv_fs_say_slow | 3 | Let's say it the slow way... |
| tv_fs_now_fast | 3 | And now, fast... |
| tv_your_word | 2 | Your word is... |
| tv_fs_say_sounds_slow | 2 | Let's say the sounds, the slow way... |
| tv_fs_rabbit_read | 2 | Now tap the rabbit, and read the word fast. |
| tv_next_word | 2 | Here's your next word... |
| tv_listen_here | 2 | Let's listen again. What can you hear here? |
| fm_rw_more | 2 | More stickers for your Sticker Book! |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_map_hint | 1 | The glowing stone is your next game. Tap it when you're ready. |
| tv_battle_again | 1 | Another monster! Let's zap it with words. |
| tv_fs_two_ways | 1 | There's a slow way to say a word, and a fast way. |
| streak_3 | 1 | Ninja power! |
| battle_win | 1 | Hooray! The monster ran away! |
| tv_battle_why | 1 | Every monster you beat helps us win back the sounds. |
| audit_gem_first | 1 | Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. |
| tv_jump_offer | 1 | Wow, you got everything right! Grown-ups, if this is too easy, you can jump ahead. |
| tv_map_next_story | 1 | Next is Story Time. Tap the glowing stone to open the book. |
| tv_story_frame | 1 | Story time! I'll read some pages to you, and you'll read some pages to me. |
| tv_story_title | 1 | This story is called... |
| tv_story_begin | 1 | Tap the green arrow, and let's begin. |
| tv_story_yours | 1 | This page is yours. Say the sounds, and read each word. |
| tv_fs_gaps | 1 | The slow way has little gaps between the sounds. |
| tv_story_help | 1 | If you get stuck, tap a word, and I'll help. |
| tv_story_tick | 1 | When you've read it all, tap the green tick. |
| story_your_turn | 1 | Your turn to read. |
| tv_story_choice | 1 | Now you choose what happens. Read the two words, and tap one. |
| well_read | 1 | Well read! |
| tv_story_q | 1 | Now a question about the story. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (0)

| Line | Repeats | Text | Example |
|---|---|---|---|

### Spliced utterances: 14 of 90 (16%); chains of 5+ clips: 5

Commonest spliced shapes:

- ×3 ‹tv_fs_say_slow› + /X/ + /X/ + /X/ + ‹tv_fs_now_fast› + W
- ×2 ‹tv_fs_stuck_slow› + /X/
- ×1 ‹tv_battle_again› + ‹tv_your_word› + W
- ×1 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×1 ‹tv_fs_two_ways› + ‹tv_next_word› + W
- ×1 ‹tv_story_frame› + ‹tv_story_title› + ‹story:s1_title› + ‹tv_story_begin›
- ×1 ‹baron_w1› + ‹tv_boss_calm› + ‹tv_boss_frame› + ‹tv_your_word›
- ×1 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×1 ‹tv_fs_next› + ‹tv_next_word› + W
- ×1 ‹tv_fs_slow_tortoise› + /X/ + /X/ + /X/ + ‹tv_fs_fast_rabbit› + W
- ×1 ‹tv_flower_recap› + /X/ + ‹tp_o_hear›

Longest chains:

- level w1-13 @76.3s (6 clips): Let's say it the slow way... /m/ /a/ /p/ And now, fast... "map"
- level w1-14 @199.9s (6 clips): Let's say it the slow way... /m/ /a/ /t/ And now, fast... "mat"
- level w1-15 @335.0s (6 clips): First the slow way, like the tortoise... /p/ /i/ /t/ Now the fast way, like the rabbit... "pit"
- level w1-15 @386.3s (6 clips): Let's say it the slow way... /t/ /i/ /p/ And now, fast... "tip"
- level w1-15 @276.3s (5 clips): Let's say the sounds, the slow way... /p/ /o/ /t/ Now tap the rabbit, and read the word fast.

### Praise: 4 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 8

- level w1-13 @35.7s: "Let's say it the slow way first..." cut after 1.9 of 2.3 s by /n/
- level w1-13 @42.8s: "Now tap the rabbit, and read the word fast." cut after 1.4 of 3.5 s by "an"
- level w1-13 @63.1s: "Let's listen again. What can you hear here?" cut after 0.5 of 2.7 s by /n/
- reward @115.6s: "Look, a gem! Each gem holds a way to spell a sound. When you get words" cut after 6.6 of 7.4 s by Wow, you got everything right! Grown-ups, if this 
- level w1-14 @196.4s: "Now you choose what happens. Read the two words, and tap one." cut after 3.5 of 3.8 s by Let's say it the slow way...
- level w1-15 @280.6s: "Now tap the rabbit, and read the word fast." cut after 0.9 of 3.5 s by "pot"
- level w1-15 @333.6s: "Let's listen again. What can you hear here?" cut after 1.0 of 2.7 s by /t/
- level w1-15 @413.1s: "Let's say it the slow way first..." cut after 1.5 of 2.3 s by /a/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |

## playtest/runs/fix/D2/t-splitb/continuous-splitter-from-w5-1.json (splitter-from-w5-1, one continuous page)

164 Sensei lines, 212 sounds and words, 168 utterances in 17 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_your_word | 7 | Your word is... |
| next_sound_q | 6 | What's the next sound? |
| t_two_letters | 5 | It's two letters, but it's one sound. |
| tv_next_word | 5 | Here's your next word... |
| tv_watch_write | 4 | Now watch my ninja write it. |
| tv_which_write | 4 | Which of these is the way we write... |
| we_need | 4 | We need... |
| first_sound_q | 4 | What's the first sound? |
| last_sound_q | 4 | What's the last sound? |
| tv_here_sound | 4 | Here's the sound... |
| tv_map_hint | 3 | The glowing stone is your next game. Tap it when you're ready. |
| tv_how_we_write | 3 | This is how we write... |
| st_two_letters_too | 3 | This one's two letters too, but it's just one sound. |
| t_same_spelling_sometimes | 3 | The same spelling can sometimes be... |
| thats | 3 | That's... |
| tv_learn_first_short | 2 | Here's the first new sound... |
| tv_petal_say | 2 | Tap the petal, and say it with me. |
| tv_tap_letter_say | 2 | Now you tap it, and say the sound. |
| tv_said_well | 2 | Good, you said that sound really well. |
| tv_learn_next | 2 | Here's the next new sound... |
| tv_petal_say_short | 2 | Tap its petal, and say it. |
| tv_and_how_we_write | 2 | And this is how we write... |
| tv_tap_it_say_short | 2 | Now you tap it, and say it. |
| tv_learn_last | 2 | Here's the last new sound... |
| st_th_moth_sometimes | 2 | ...in moth, and sometimes... |
| tg_th_dh_in | 2 | ...in this. |
| tv_ne_new_sounds | 2 | Now let's play Ninja Eyes, with your new sounds. |
| streak_3 | 2 | Ninja power! |
| tv_find_write | 2 | Find how we write... |
| tv_build_dojo | 2 | Now let's build some words with your new sounds. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (5)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 2 | Which of these is the way we write... | level w5-1 @118.4s and @122.9s |
| next_sound_q | 2 | What's the next sound? | level w5-1 @144.8s and @150.1s |
| t_in | 1 | ...in... | world flower @364.1s and @367.0s |

### Spliced utterances: 47 of 168 (28%); chains of 5+ clips: 24

Commonest spliced shapes:

- ×2 ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×2 /X/ + ‹tv_learn_last› + /X/
- ×2 ‹streak_lost› + ‹thats› + /X/ + ‹we_need› + /X/ + ‹t_two_letters›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_next_word› + W
- ×1 ‹tv_learn_short_four› + ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say›
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×1 /X/ + ‹tv_learn_another› + /X/
- ×1 ‹tv_how_we_write› + /X/
- ×1 ‹tv_and_how_we_write› + /X/ + ‹t_same_spelling_sometimes› + /X/ + ‹st_th_moth_sometimes› + /X/ + ‹tg_th_dh_in›
- ×1 ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + /X/
- ×1 /X/ + ‹tv_which_write› + /X/
- ×1 ‹streak_3› + ‹tv_find_write›
- ×1 ‹tv_thats_write› + /X/ + ‹we_need› + /X/
- ×1 /X/ + ‹tv_now_find› + /X/

Longest chains:

- level w5-1 @204.7s (11 clips): /l/ Say the sounds, and read the word. /sh/ /e/ /l/ "shell" It's two letters, but it's one sound. /l/ Your word is... "chimp" What's the first sound?
- level w5-1 @257.9s (8 clips): Say the sounds, and read the word. /dh/ /e/ /n/ "then" You said it slowly, and found every sound. Your word is... "must"
- world flower @361.4s (8 clips): The same spelling can sometimes be... /dh/ ...in... "then" ...and sometimes... /th/ ...in... "moth"
- level w5-3 @674.7s (8 clips): /p/ /w/ /i/ /p/ "whip" You built that whole word by yourself! Your word is... "shut"
- level w5-1 @91.2s (7 clips): And this is how we write... /dh/ The same spelling can sometimes be... /th/ ...in moth, and sometimes... /dh/ ...in this.
- level w5-1 @168.4s (7 clips): Let's say the sounds, the slow way... /b/ /e/ /n/ /ch/ Now tap the rabbit, and read the word fast. "bench"
- reward @298.6s (7 clips): Let's see what you won back from Baron Muddle. You won back four sounds... /sh/ /ch/ /th/ /dh/ More stickers for your Sticker Book!
- level w5-3 @709.1s (7 clips): /n/ /i/ /p/ "nip" That's it! Your word is... "moth"

### Praise: 5 lines (0.4 a minute); stacked (2+ within 5 s): 1

- level w5-2 @527.4s: "Ninja power!" → "Hooray! The monster ran away!"

### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 13

- level w5-1 @31.9s: "It's two letters, but it's one sound." cut after 2.6 of 2.9 s by Now you tap it, and say the sound.
- level w5-1 @39.2s: "Tap it once more, and say it again." cut after 0.9 of 2.5 s by /sh/
- level w5-1 @55.7s: "This one's two letters too, but it's just one sound." cut after 3.1 of 3.5 s by Now you tap it, and say it.
- level w5-1 @94.3s: "The same spelling can sometimes be..." cut after 2.2 of 2.9 s by /th/
- level w5-1 @122.9s: "Which of these is the way we write..." cut after 0.6 of 2.7 s by /ch/
- level w5-1 @125.8s: "Find how we write..." cut after 0.1 of 1.7 s by That's how we write...
- level w5-1 @131.3s: "Now find how we write..." cut after 0.8 of 2.1 s by /dh/
- level w5-1 @174.3s: "Now tap the rabbit, and read the word fast." cut after 1.1 of 3.5 s by "bench"
- reward @310.1s: "Look, a gem! Each gem holds a way to spell a sound. When you get words" cut after 6.7 of 7.4 s by Now let's go and see where your sounds live. Tap t
- world flower @361.4s: "The same spelling can sometimes be..." cut after 2.2 of 2.9 s by /dh/
- world flower @379.7s: "The same spelling can sometimes be..." cut after 2.3 of 2.9 s by /th/
- level w5-3 @570.4s: "This one's two letters too, but it's just one sound." cut after 3.1 of 3.5 s by Now you tap it, and say the sound.
- level w5-3 @595.0s: "This one's two letters too, but it's just one sound." cut after 3.1 of 3.5 s by Now you tap it, and say it.

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 5 | level w5-1 ×4, level w5-2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| audit_gem_more "Look, this gem has filled a little more." | 1 | reward |
| t_another_way "This is another way to spell the sound..." | 1 | level w5-3 |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C(w1-6)-L: playtest/runs/fix/D2/t-w1-6b/continuous-learner-from-w1-6.json

learner, from w1-6, opt-in none.

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
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 0 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.00 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 6.9 s (battle w1-6); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 15 words (median line 7 words; 11 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 4 of 4, rabbit 4 of 4 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 5.2 s (battle w1-6); 0 over | pass |

### C(w1-6)-P: playtest/runs/fix/D2/t-w1-6b/continuous-perfect-from-w1-6.json

perfect, from w1-6, opt-in none.

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
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 0 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.18 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 6.9 s (battle w1-6); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 6 words; 8 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 4 of 4, rabbit 4 of 4 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 9.8 s (battle w1-6); 0 over | pass |

- **cut-explanations**: reward @1:27.1 ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words"

### C(w1-13)-L: playtest/runs/fix/D2/t-w1-13b/continuous-learner-from-w1-13.json

learner, from w1-13, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_2 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 1 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.04 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 2 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 1 said (1 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 10.7 s (story w1-14); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 9 words (median line 7 words; 34 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 2 said (2 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 2 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 3 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 1 a level, 3 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 3 of 3 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 13 of 13, rabbit 13 of 13 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 2 of 2 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 10.7 s (story w1-14); 0 over | pass |

- **unframed-turn**: boss (w1-15 5:44.0): out of order (frame 344.3, demo undefined, ready 351.7, hand-over 349.6). Opens: "Don't worry, ninja. You know what to do." · "A boss takes lots of words to beat."
- **bare-command**: ‹story:s1_2› "Map! Tap it!" ×1
- **shouted-instruction**: ‹story:s1_2› "Map! Tap it!" ×1; ‹story:s1_7› "The pandas cheered and gobbled up every last dumpling. And look! Inside the pot was a glowing sound petal." ×1

### C(w1-13)-P: playtest/runs/fix/D2/t-w1-13b/continuous-perfect-from-w1-13.json

perfect, from w1-13, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_2 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 1 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.69 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 2 of 2 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 1 said (1 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 11.0 s (story w1-14); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 13 words (median line 7 words; 25 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 2 said (2 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 1 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 3 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 1 a level, 3 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 3 of 3 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 12 of 12, rabbit 12 of 12 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 2 of 2 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.0 s (story w1-14); 0 over | pass |

- **cut-explanations**: reward @1:55.6 ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words"
- **unframed-turn**: story (w1-14 2:19.7): out of order (frame 138.1, demo undefined, ready 149.2, hand-over 146.6). Opens: "Story time! I'll read some pages to you, and you'l" · "This story is called..."; boss (w1-15 4:09.0): no Ready hold. Opens: "So... a little ninja wants to stop me? My sumo pan" · "Don't worry, ninja. You know what to do."
- **bare-command**: ‹story:s1_2› "Map! Tap it!" ×1
- **shouted-instruction**: ‹story:s1_2› "Map! Tap it!" ×1; ‹story:s1_7› "The pandas cheered and gobbled up every last dumpling. And look! Inside the pot was a glowing sound petal." ×1

### C5-S: playtest/runs/fix/D2/t-splitb/continuous-splitter-from-w5-1.json

splitter, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 8 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 3 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 1 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 3 | **FAIL** |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.11 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 1 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 3 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 6 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | 3 of 3 (100%) | pass |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 9 words (median line 6 words; 54 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 1 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 1 a level, 1 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 1 of 1 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 15 of 15, rabbit 15 of 15 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 18.2 s (build w5-1); 1 over | **FAIL** |

- **letters-60s**: w5-1 @3:10.2 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-1 @3:31.9 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @9:55.0 ‹st_two_letters_too› "This one's two letters too, but it's just one sound." again within 60 s
- **map-hint-cut**: map @0:06.6 ‹tv_map_hint› "The glowing stone is your next game. Tap it when you're ready." cut
- **praise-stacks**: w5-2 @8:47.4: "Ninja power!" → "Hooray! The monster ran away!"
- **line-60s**: ‹we_need› "We need..." from w5-1 @2:08.5; ‹t_two_letters› "It's two letters, but it's one sound." from w5-1 @2:41.7; ‹tv_here_sound› "Here's the sound..." from world flower @5:33.5
- **cut-explanations**: map @0:06.6 ‹tv_map_hint› "The glowing stone is your next game. Tap it when you're ready."; w5-1 @0:31.9 ‹t_two_letters› "It's two letters, but it's one sound."; w5-1 @0:55.7 ‹st_two_letters_too› "This one's two letters too, but it's just one sound."; reward @5:10.1 ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words"; w5-3 @9:30.4 ‹st_two_letters_too› "This one's two letters too, but it's just one sound."; w5-3 @9:55.0 ‹st_two_letters_too› "This one's two letters too, but it's just one sound."
- **fs-talk**: build (w5-1) 18.2 s from ‹tv_to_reward› "Let's see what you won back from Baron Muddle." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 1 of 494 | **FAIL** |

- ‹tv_fs_run› 3.4 w/s "I'll say it the slow way, and you catch the whole word."
