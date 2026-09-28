# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/D1/transcripts-final/splitter/continuous-splitter-from-w5-1.json (splitter-from-w5-1, one continuous page)

161 Sensei lines, 212 sounds and words, 176 utterances in 17 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_your_word | 7 | Your word is... |
| next_sound_q | 5 | What's the next sound? |
| tv_next_word | 5 | Here's your next word... |
| tv_watch_write | 4 | Now watch my ninja write it. |
| t_two_letters | 4 | It's two letters, but it's one sound. |
| tv_which_write | 4 | Which of these is the way we write... |
| streak_3 | 4 | Ninja power! |
| first_sound_q | 4 | What's the first sound? |
| last_sound_q | 4 | What's the last sound? |
| tv_here_sound | 4 | Here's the sound... |
| tv_how_we_write | 3 | This is how we write... |
| t_same_spelling_sometimes | 3 | The same spelling can sometimes be... |
| we_need | 3 | We need... |
| say_sounds_read | 3 | Say the sounds, and read the word. |
| world_5 | 3 | Welcome to Shadow Castle. Don't worry, I'm right beside you. |
| tv_learn_first_short | 2 | Here's the first new sound... |
| tv_petal_say | 2 | Tap the petal, and say it with me. |
| tv_tap_letter_say | 2 | Now you tap it, and say the sound. |
| tv_said_well | 2 | Good, you said that sound really well. |
| tv_learn_next | 2 | Here's the next new sound... |
| tv_petal_say_short | 2 | Tap its petal, and say it. |
| tv_and_how_we_write | 2 | And this is how we write... |
| st_two_letters_too | 2 | This one's two letters too, but it's just one sound. |
| tv_tap_it_say_short | 2 | Now you tap it, and say it. |
| tv_learn_last | 2 | Here's the last new sound... |
| st_th_moth_sometimes | 2 | ...in moth, and sometimes... |
| tg_th_dh_in | 2 | ...in this. |
| tv_ne_new_sounds | 2 | Now let's play Ninja Eyes, with your new sounds. |
| tv_find_write | 2 | Find how we write... |
| tv_build_dojo | 2 | Now let's build some words with your new sounds. |

### Echoes: the same utterance shape back to back (1)

- level w5-1 @153.0s ×2: /s/ What's the next sound? ‖ /n/ What's the next sound?

### Near repeats: the same line again within 15 s (4)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 2 | Which of these is the way we write... | level w5-1 @125.4s and @129.1s |
| next_sound_q | 1 | What's the next sound? | level w5-1 @154.1s and @158.5s |
| t_in | 1 | ...in... | world flower @368.9s and @372.1s |

### Spliced utterances: 47 of 176 (27%); chains of 5+ clips: 22

Commonest spliced shapes:

- ×2 /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×2 /X/ + ‹tv_learn_last› + /X/
- ×2 ‹tv_next_word› + W
- ×1 ‹tv_learn_first_short› + /X/
- ×1 ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say›
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×1 ‹tv_once_more› + /X/ + ‹tv_learn_another› + /X/
- ×1 ‹tv_how_we_write› + /X/
- ×1 ‹tv_and_how_we_write› + /X/ + ‹t_same_spelling_sometimes› + /X/ + ‹st_th_moth_sometimes› + /X/ + ‹tg_th_dh_in›
- ×1 ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + /X/
- ×1 /X/ + ‹tv_which_write› + /X/
- ×1 ‹streak_3› + ‹tv_find_write›
- ×1 ‹tv_thats_write› + /X/ + ‹we_need› + /X/ + /X/
- ×1 ‹tv_now_find› + /X/ + ‹yay_4›
- ×1 ‹tv_your_word› + W + ‹first_sound_q›

Longest chains:

- level w5-1 @262.2s (10 clips): Say the sounds, and read the word. /k/ /a/ /sh/ "cash" You said it slowly, and found every sound. Your word is... "shop" What's the first sound? /sh/
- level w5-1 @204.2s (8 clips): Say the sounds, and read the word. /m/ /u/ /n/ /ch/ "munch" Your word is... "rush"
- world flower @366.2s (8 clips): The same spelling can sometimes be... /dh/ ...in... "this" ...and sometimes... /th/ ...in... "moth"
- level w5-3 @672.9s (8 clips): Say the sounds, and read the word. /sh/ /o/ /k/ "shock" Your word is... "with" What's the first sound?
- level w5-1 @96.7s (7 clips): And this is how we write... /dh/ The same spelling can sometimes be... /th/ ...in moth, and sometimes... /dh/ ...in this.
- level w5-1 @165.6s (7 clips): /p/ Ninja power! Let's say the sounds, the slow way... /s/ /n/ /a/ /p/
- level w5-3 @643.9s (7 clips): /dh/ /e/ /m/ "them" You built that whole word by yourself! Here's your next word... "shock"
- level w5-3 @691.9s (7 clips): Ninja power! /w/ /i/ /dh/ "with" Here's your next word... "text"

### Praise: 6 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 14

- level w5-1 @38.8s: "It's two letters, but it's one sound." cut after 2.6 of 2.9 s by Now you tap it, and say the sound.
- level w5-1 @63.8s: "This one's two letters too, but it's just one sound." cut after 3.1 of 3.5 s by Now you tap it, and say it.
- level w5-1 @70.9s: "Tap it once more, and say it again." cut after 0.4 of 2.5 s by /ch/
- level w5-1 @99.8s: "The same spelling can sometimes be..." cut after 2.2 of 2.9 s by /th/
- level w5-1 @128.1s: "/sh/" cut after 0.3 of 0.7 s by /sh/
- level w5-1 @135.4s: "Find how we write..." cut after 0.3 of 1.7 s by That's how we write...
- level w5-1 @140.4s: "Now find how we write..." cut after 0.6 of 2.1 s by /dh/
- level w5-1 @173.6s: "Now tap the rabbit, and read the word fast." cut after 0.4 of 3.5 s by "snap"
- level w5-1 @273.8s: "What's the first sound?" cut after 0.4 of 1.6 s by /sh/
- reward @311.7s: "Look, a gem! Each gem holds a way to spell a sound. When you get words" cut after 6.7 of 7.4 s by Now let's go and see where your sounds live. Tap t
- world flower @366.2s: "The same spelling can sometimes be..." cut after 2.2 of 2.9 s by /dh/
- world flower @384.0s: "The same spelling can sometimes be..." cut after 2.3 of 2.9 s by /th/
- level w5-3 @556.4s: "It's two letters, but it's one sound." cut after 2.6 of 2.9 s by Now you tap it, and say the sound.
- level w5-3 @578.6s: "This one's two letters too, but it's just one sound." cut after 3.0 of 3.5 s by Now you tap it, and say it.

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 4 | level w5-1 ×2, level w5-3 ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| audit_gem_more "Look, this gem has filled a little more." | 1 | reward |
| t_another_way "This is another way to spell the sound..." | 1 | level w5-3 |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |

## playtest/fix/D1/transcripts-final/w2-1/continuous-learner-from-w2-1.json (learner-from-w2-1, one continuous page)

90 Sensei lines, 88 sounds and words, 88 utterances in 8 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 4 | What's the first sound? |
| next_sound_q | 4 | What's the next sound? |
| last_sound_q | 4 | What's the last sound? |
| tv_your_word | 3 | Your word is... |
| say_sounds_read | 3 | Say the sounds, and read the word. |
| tv_here_sound | 3 | Here's the sound... |
| tv_watch_write | 2 | Now watch my ninja write it. |
| tv_how_we_write | 2 | This is how we write... |
| tv_and_how_we_write | 2 | And this is how we write... |
| tv_which_write | 2 | Which of these is the way we write... |
| tv_thats_write | 2 | That's how we write... |
| we_need | 2 | We need... |
| tv_praise_kept_going | 2 | That was a tricky one, and you kept going. |
| tv_fs_stuck_slow | 2 | Let's say it the slow way first... |
| tv_next_word | 2 | Here's your next word... |
| tv_listen_here | 2 | Let's listen again. What can you hear here? |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_learn_frame_four | 1 | Today in the dojo, I'm going to teach you four new sounds. |
| tv_learn_how | 1 | I'll say each sound, and show you how we write it. Then you say it with me. |
| tv_learn_ready | 1 | Are you ready for the first one? Tap the green arrow. |
| tv_learn_first | 1 | Here's the first new sound. Get your ninja ears ready. |
| tv_here_it_comes | 1 | Here it comes... |
| tp_b_hear | 1 | You can hear it in bat, bag and bin. |
| tv_petal_say | 1 | Tap the petal, and say it with me. |
| tv_tap_letter_say | 1 | Now you tap it, and say the sound. |
| tv_once_more | 1 | Tap it once more, and say it again. |
| tv_said_well | 1 | Good, you said that sound really well. |
| tv_learn_next | 1 | Here's the next new sound... |
| tv_petal_say_short | 1 | Tap its petal, and say it. |
| tv_tap_it_say_short | 1 | Now you tap it, and say it. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (2)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 1 | Which of these is the way we write... | level w2-1 @113.7s and @123.3s |
| tv_here_sound | 1 | Here's the sound... | world flower @363.5s and @371.5s |

### Spliced utterances: 24 of 88 (27%); chains of 5+ clips: 8

Commonest spliced shapes:

- ×1 ‹tv_learn_first› + ‹tv_here_it_comes› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹tv_tap_letter_say›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹tv_tap_it_say_short›
- ×1 /X/ + ‹tv_learn_another› + /X/
- ×1 ‹tv_how_we_write› + /X/
- ×1 /X/ + ‹tv_learn_last› + /X/
- ×1 ‹tv_and_how_we_write› + /X/
- ×1 ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + /X/
- ×1 ‹tv_thats_write› + /X/ + ‹we_need› + /X/
- ×1 ‹tv_which_write› + /X/
- ×1 /X/ + ‹tv_yay_lovely› + ‹tv_find_write› + /X/
- ×1 ‹tv_now_find› + /X/
- ×1 /X/ + ‹we_need› + /X/
- ×1 ‹tv_your_word› + W

Longest chains:

- level w2-1 @263.7s (9 clips): Say the sounds, and read the word. /k/ /a/ /p/ "cap" That was a tricky one, and you kept going. Your word is... "gas" What's the first sound?
- level w2-1 @237.4s (6 clips): Let's say it the slow way... "pig" (slowly) And now, fast... "pig" Here's your next word... "cap"
- level w2-1 @292.2s (6 clips): Say the sounds, and read the word. /g/ /a/ /s/ "gas" You learnt four new sounds today, and you built words with them.
- reward @303.6s (6 clips): Let's see what you won back from Baron Muddle. You won back four sounds... /b/ /k/ /g/ /h/
- level w2-1 @49.1s (5 clips): Tap it once more, and say it again. /b/ Good, you said that sound really well. Here's the next new sound... /k/
- level w2-1 @174.0s (5 clips): We start here, and go this way. Let's say the sounds, the slow way... /g/ /a/ /p/
- level w2-1 @212.1s (5 clips): Say the sounds, and read the word. /s/ /i/ /p/ "sip"
- level w2-1 @219.2s (5 clips): You said it slowly, and found every sound. Your word is... "pig" What's the first sound? /p/

### Praise: 1 lines (0.2 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 4

- level w2-1 @23.5s: "Are you ready for the first one? Tap the green arrow." cut after 2.8 of 3.4 s by Here's the first new sound. Get your ninja ears re
- level w2-1 @49.1s: "Tap it once more, and say it again." cut after 0.3 of 2.5 s by /b/
- level w2-1 @181.5s: "Now tap the rabbit, and read the word fast." cut after 0.3 of 3.5 s by "gap"
- level w2-1 @224.7s: "What's the first sound?" cut after 0.9 of 1.6 s by /p/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_left_right "We start here, and go this way." | 1 | level w2-1 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |

## playtest/fix/D1/transcripts-final/w2-1/continuous-perfect-from-w2-1.json (perfect-from-w2-1, one continuous page)

72 Sensei lines, 75 sounds and words, 66 utterances in 8 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_your_word | 3 | Your word is... |
| tv_here_sound | 3 | Here's the sound... |
| tv_watch_write | 2 | Now watch my ninja write it. |
| tv_how_we_write | 2 | This is how we write... |
| tv_and_how_we_write | 2 | And this is how we write... |
| tv_which_write | 2 | Which of these is the way we write... |
| tv_next_word | 2 | Here's your next word... |
| say_sounds_read | 2 | Say the sounds, and read the word. |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_map_next_learn | 1 | Next is the dojo. You'll learn some new sounds there. Tap the glowing stone to go. |
| tv_learn_frame_four | 1 | Today in the dojo, I'm going to teach you four new sounds. |
| tv_learn_how | 1 | I'll say each sound, and show you how we write it. Then you say it with me. |
| tv_learn_ready | 1 | Are you ready for the first one? Tap the green arrow. |
| tv_learn_first | 1 | Here's the first new sound. Get your ninja ears ready. |
| tv_here_it_comes | 1 | Here it comes... |
| tp_b_hear | 1 | You can hear it in bat, bag and bin. |
| tv_petal_say | 1 | Tap the petal, and say it with me. |
| tv_tap_letter_say | 1 | Now you tap it, and say the sound. |
| tv_once_more | 1 | Tap it once more, and say it again. |
| tv_said_well | 1 | Good, you said that sound really well. |
| tv_learn_next | 1 | Here's the next new sound... |
| tv_petal_say_short | 1 | Tap its petal, and say it. |
| tv_tap_it_say_short | 1 | Now you tap it, and say it. |
| tv_learn_another | 1 | Here's another new sound... |
| tv_learn_last | 1 | Here's the last new sound... |
| tv_learn_all_four | 1 | Four new sounds! You said every one. |
| tv_ne_new_sounds | 1 | Now let's play Ninja Eyes, with your new sounds. |
| tv_petal_hint | 1 | Tap the petal if you want to hear the sound again. |
| streak_3 | 1 | Ninja power! |
| tv_find_write | 1 | Find how we write... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (2)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 1 | Which of these is the way we write... | level w2-1 @106.0s and @108.2s |
| tv_here_sound | 1 | Here's the sound... | world flower @301.3s and @308.4s |

### Spliced utterances: 23 of 66 (35%); chains of 5+ clips: 10

Commonest spliced shapes:

- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_your_word› + W
- ×1 ‹tv_learn_first› + ‹tv_here_it_comes› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹tv_tap_letter_say› + /X/
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹tv_tap_it_say_short› + /X/
- ×1 /X/ + ‹tv_learn_another› + /X/
- ×1 ‹tv_how_we_write› + /X/
- ×1 /X/ + ‹tv_learn_last› + /X/
- ×1 ‹tv_and_how_we_write› + /X/
- ×1 ‹tv_learn_all_four› + ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + /X/
- ×1 ‹tv_which_write› + /X/
- ×1 ‹tv_find_write› + /X/
- ×1 ‹tv_now_find› + /X/ + /X/
- ×1 ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q› + /X/
- ×1 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + /X/ + ‹tv_fs_rabbit_read› + W

Longest chains:

- level w2-1 @162.6s (7 clips): Say the sounds, and read the word. /b/ /i/ /b/ "bib" Your word is... "hob"
- level w2-1 @180.0s (7 clips): Let's say it the slow way... "hob" (slowly) And now, fast... "hob" You said it slowly, and found every sound. Here's your next word... "pot"
- level w2-1 @204.6s (7 clips): Say the sounds, and read the word. /p/ /o/ /t/ "pot" Your word is... "bag"
- reward @237.4s (7 clips): Let's see what you won back from Baron Muddle. You won back four sounds... /b/ /k/ /g/ /h/ More stickers for your Sticker Book!
- level w2-1 @138.1s (6 clips): Let's say the sounds, the slow way... /k/ /o/ /t/ Now tap the rabbit, and read the word fast. "cot"
- level w2-1 @43.8s (5 clips): Now watch my ninja write it. This is how we write... /b/ Now you tap it, and say the sound. /b/
- level w2-1 @50.5s (5 clips): Tap it once more, and say it again. /b/ Good, you said that sound really well. Here's the next new sound... /k/
- level w2-1 @59.6s (5 clips): Now watch my ninja write it. And this is how we write... /k/ Now you tap it, and say it. /k/

### Praise: 2 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 7

- level w2-1 @27.4s: "Are you ready for the first one? Tap the green arrow." cut after 1.7 of 3.4 s by Here's the first new sound. Get your ninja ears re
- level w2-1 @47.8s: "Now you tap it, and say the sound." cut after 1.9 of 2.5 s by /b/
- level w2-1 @50.5s: "Tap it once more, and say it again." cut after 0.4 of 2.5 s by /b/
- level w2-1 @64.2s: "Now you tap it, and say it." cut after 1.7 of 2.3 s by /k/
- level w2-1 @106.0s: "Which of these is the way we write..." cut after 1.9 of 2.7 s by /b/
- level w2-1 @108.2s: "Which of these is the way we write..." cut after 2.0 of 2.7 s by /k/
- level w2-1 @142.5s: "Now tap the rabbit, and read the word fast." cut after 0.8 of 3.5 s by "cot"

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_left_right "We start here, and go this way." | 1 | level w2-1 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |

## playtest/fix/D1/transcripts-final/w3-6/continuous-learner-from-w3-6.json (learner-from-w3-6, one continuous page)

98 Sensei lines, 113 sounds and words, 114 utterances in 8 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 5 | What's the first sound? |
| next_sound_q | 5 | What's the next sound? |
| last_sound_q | 5 | What's the last sound? |
| say_sounds_read | 4 | Say the sounds, and read the word. |
| t_ways_2 | 4 | Now you know two ways to spell... |
| wf_found_gem | 4 | You found a new gem! It's a spelling of the sound... |
| tv_your_word | 3 | Your word is... |
| tv_fs_stuck_slow | 3 | Let's say it the slow way first... |
| tv_watch_write | 2 | Now watch my ninja write it. |
| tv_learn_next | 2 | Here's the next new sound... |
| tv_learn_another | 2 | Here's another new sound... |
| st_know_this_sound | 2 | Ooh, you already know this sound! |
| t_another_way | 2 | This is another way to spell the sound... |
| tv_and_another_way | 2 | And here's another way to spell it... |
| tv_which_write | 2 | Which of these is the way we write... |
| tv_find_write | 2 | Find how we write... |
| tv_now_find | 2 | Now find how we write... |
| tv_next_word | 2 | Here's your next word... |
| tv_listen_here | 2 | Let's listen again. What can you hear here? |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_learn_first_short | 1 | Here's the first new sound... |
| tv_petal_say | 1 | Tap the petal, and say it with me. |
| tv_how_we_write | 1 | This is how we write... |
| tv_x_two_sounds | 1 | This spelling is two sounds together. |
| tv_tap_letter_say | 1 | Now you tap it, and say the sound. |
| tv_once_more | 1 | Tap it once more, and say it again. |
| tv_said_well | 1 | Good, you said that sound really well. |
| tv_petal_say_short | 1 | Tap its petal, and say it. |
| tv_and_how_we_write | 1 | And this is how we write... |
| tv_tap_it_say_short | 1 | Now you tap it, and say it. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (1)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 1 | Which of these is the way we write... | level w3-6 @150.0s and @150.6s |

### Spliced utterances: 31 of 114 (27%); chains of 5+ clips: 7

Commonest spliced shapes:

- ×2 ‹tv_and_another_way› + /X/
- ×2 ‹tv_find_write› + /X/ + /X/
- ×2 ‹tv_now_find› + /X/
- ×2 ‹tv_fs_stuck_slow› + W
- ×2 ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_your_word› + W + ‹first_sound_q›
- ×1 ‹tv_learn_first_short› + /X/
- ×1 ‹tv_how_we_write› + /X/ + ‹tv_x_two_sounds› + /X/ + /X/
- ×1 ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹tv_tap_it_say_short›
- ×1 /X/ + ‹tv_learn_another› + /X/
- ×1 ‹t_another_way› + /X/ + ‹t_two_letters›
- ×1 /X/ + ‹tv_learn_next› + /X/
- ×1 ‹tv_learn_another› + /X/
- ×1 ‹t_another_way› + /X/
- ×1 ‹tv_learn_last› + /X/

Longest chains:

- level w3-6 @278.1s (9 clips): Say the sounds, and read the word. /t/ /e/ /l/ "tell" You said it slowly, and found every sound. Here's your next word... "fizz" What's the first sound?
- reward @344.8s (9 clips): Let's see what you won back from Baron Muddle. You won back some sounds! /ks/ /y/ /f/ /l/ /s/ /z/ Now let's go and see where your sounds live. Tap the green arrow.
- level w3-6 @250.9s (8 clips): Say the sounds, and read the word. /m/ /i/ /s/ "miss" Your word is... "tell" What's the first sound?
- level w3-6 @309.0s (8 clips): Say the sounds, and read the word. /f/ /i/ /z/ "fizz" Your word is... "hat" What's the first sound?
- level w3-6 @333.5s (6 clips): Say the sounds, and read the word. /h/ /a/ /t/ "hat" You built words with their sounds, and you read them.
- level w3-6 @22.7s (5 clips): This is how we write... /ks/ This spelling is two sounds together. /k/ /s/
- level w3-6 @216.6s (5 clips): Let's say the sounds, the slow way... /y/ /a/ /p/ Now tap the rabbit, and read the word fast.

### Praise: 2 lines (0.2 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 2

- level w3-6 @34.8s: "Tap it once more, and say it again." cut after 0.8 of 2.5 s by /ks/
- level w3-6 @150.0s: "Which of these is the way we write..." cut after 0.2 of 2.7 s by /ks/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_another_way "This is another way to spell the sound..." | 2 | level w3-6 ×2 |
| t_two_letters "It's two letters, but it's one sound." | 1 | level w3-6 |
| same_sound_new "Ooh! You already know this sound. Here's another w" | 1 | reward |
| wf_spelling_of "This is a spelling of the sound..." | 1 | world flower |

## playtest/fix/D1/transcripts-final/w3-6/continuous-perfect-from-w3-6.json (perfect-from-w3-6, one continuous page)

81 Sensei lines, 100 sounds and words, 94 utterances in 8 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| t_ways_2 | 4 | Now you know two ways to spell... |
| wf_found_gem | 4 | You found a new gem! It's a spelling of the sound... |
| tv_your_word | 3 | Your word is... |
| tv_watch_write | 2 | Now watch my ninja write it. |
| tv_learn_next | 2 | Here's the next new sound... |
| tv_learn_another | 2 | Here's another new sound... |
| st_know_this_sound | 2 | Ooh, you already know this sound! |
| t_another_way | 2 | This is another way to spell the sound... |
| tv_and_another_way | 2 | And here's another way to spell it... |
| tv_which_write | 2 | Which of these is the way we write... |
| tv_next_word | 2 | Here's your next word... |
| say_sounds_read | 2 | Say the sounds, and read the word. |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_learn_first_short | 1 | Here's the first new sound... |
| tv_petal_say | 1 | Tap the petal, and say it with me. |
| tv_how_we_write | 1 | This is how we write... |
| tv_x_two_sounds | 1 | This spelling is two sounds together. |
| tv_tap_letter_say | 1 | Now you tap it, and say the sound. |
| tv_once_more | 1 | Tap it once more, and say it again. |
| tv_said_well | 1 | Good, you said that sound really well. |
| tv_petal_say_short | 1 | Tap its petal, and say it. |
| tv_and_how_we_write | 1 | And this is how we write... |
| tv_tap_it_say_short | 1 | Now you tap it, and say it. |
| t_two_letters | 1 | It's two letters, but it's one sound. |
| tv_learn_last | 1 | Here's the last new sound... |
| tv_ne_new_sounds | 1 | Now let's play Ninja Eyes, with your new sounds. |
| tv_petal_hint | 1 | Tap the petal if you want to hear the sound again. |
| streak_3 | 1 | Ninja power! |
| tv_find_write | 1 | Find how we write... |
| tv_now_find | 1 | Now find how we write... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (2)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 1 | Which of these is the way we write... | level w3-6 @130.5s and @133.4s |
| wf_found_gem | 1 | You found a new gem! It's a spelling of the sound... | world flower @367.6s and @381.5s |

### Spliced utterances: 28 of 94 (30%); chains of 5+ clips: 8

Commonest spliced shapes:

- ×2 /X/ + ‹tv_learn_another› + /X/
- ×2 ‹tv_and_another_way› + /X/
- ×1 ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹tv_x_two_sounds› + /X/ + /X/ + ‹tv_tap_letter_say› + /X/
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹tv_tap_it_say_short› + /X/
- ×1 ‹t_another_way› + /X/ + ‹t_two_letters›
- ×1 /X/ + ‹tv_learn_next› + /X/
- ×1 ‹t_another_way› + /X/
- ×1 ‹tv_learn_last› + /X/
- ×1 ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + /X/
- ×1 ‹tv_which_write› + /X/
- ×1 ‹streak_3› + ‹tv_find_write› + /X/ + /X/
- ×1 ‹tv_now_find› + /X/
- ×1 ‹tv_your_word› + W

Longest chains:

- level w3-6 @18.4s (8 clips): Now watch my ninja write it. This is how we write... /ks/ This spelling is two sounds together. /k/ /s/ Now you tap it, and say the sound. /ks/
- level w3-6 @243.1s (8 clips): Say the sounds, and read the word. /d/ /i/ /p/ "dip" Brilliant! Your word is... "hill"
- reward @276.4s (8 clips): Let's see what you won back from Baron Muddle. You won back some sounds! /ks/ /y/ /f/ /l/ /s/ /z/
- level w3-6 @226.3s (7 clips): /l/ Let's say it the slow way... "bell" (slowly) And now, fast... "bell" Here's your next word... "dip"
- level w3-6 @176.2s (6 clips): Let's say the sounds, the slow way... /y/ /a/ /p/ Now tap the rabbit, and read the word fast. "yap"
- level w3-6 @30.6s (5 clips): Tap it once more, and say it again. /ks/ Good, you said that sound really well. Here's the next new sound... /y/
- level w3-6 @40.8s (5 clips): Now watch my ninja write it. And this is how we write... /y/ Now you tap it, and say it. /y/
- level w3-6 @203.9s (5 clips): Say the sounds, and read the word. /k/ /u/ /f/ "cuff"

### Praise: 4 lines (0.6 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 8

- level w3-6 @16.5s: "Tap the petal, and say it with me." cut after 0.9 of 2.5 s by /ks/
- level w3-6 @30.6s: "Tap it once more, and say it again." cut after 0.7 of 2.5 s by /ks/
- level w3-6 @45.5s: "Now you tap it, and say it." cut after 1.5 of 2.3 s by /y/
- level w3-6 @133.4s: "Which of these is the way we write..." cut after 2.4 of 2.7 s by /y/
- level w3-6 @139.9s: "/f/" cut after 0.3 of 0.7 s by /f/
- level w3-6 @141.0s: "Now find how we write..." cut after 1.7 of 2.1 s by /l/
- level w3-6 @181.0s: "Now tap the rabbit, and read the word fast." cut after 3.0 of 3.5 s by "yap"
- reward @293.4s: "Look, a gem! Each gem holds a way to spell a sound. When you get words" cut after 6.9 of 7.4 s by Wow, you got everything right! Grown-ups, if this 

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_another_way "This is another way to spell the sound..." | 2 | level w3-6 ×2 |
| t_two_letters "It's two letters, but it's one sound." | 1 | level w3-6 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| same_sound_new "Ooh! You already know this sound. Here's another w" | 1 | world flower |
| wf_spelling_of "This is a spelling of the sound..." | 1 | world flower |

## playtest/fix/D1/transcripts-final/w5-1/continuous-learner-from-w5-1.json (learner-from-w5-1, one continuous page)

97 Sensei lines, 94 sounds and words, 80 utterances in 8 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 5 | What's the first sound? |
| next_sound_q | 5 | What's the next sound? |
| last_sound_q | 5 | What's the last sound? |
| say_sounds_read | 4 | Say the sounds, and read the word. |
| t_same_spelling_sometimes | 3 | The same spelling can sometimes be... |
| tv_your_word | 3 | Your word is... |
| tv_fs_stuck_slow | 3 | Let's say it the slow way first... |
| tv_here_sound | 3 | Here's the sound... |
| tv_watch_write | 2 | Now watch my ninja write it. |
| tv_how_we_write | 2 | This is how we write... |
| tv_and_how_we_write | 2 | And this is how we write... |
| st_th_moth_sometimes | 2 | ...in moth, and sometimes... |
| tg_th_dh_in | 2 | ...in this. |
| tv_which_write | 2 | Which of these is the way we write... |
| streak_lost | 2 | Keep going, ninja. |
| tv_next_word | 2 | Here's your next word... |
| t_in | 2 | ...in... |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_learn_short_four | 1 | Back to the dojo. Today there are four new sounds. |
| tv_learn_first_short | 1 | Here's the first new sound... |
| tp_sh_hear | 1 | You can hear it in shop, shed and shell. |
| tv_petal_say | 1 | Tap the petal, and say it with me. |
| t_two_letters | 1 | It's two letters, but it's one sound. |
| tv_tap_letter_say | 1 | Now you tap it, and say the sound. |
| tv_once_more | 1 | Tap it once more, and say it again. |
| tv_said_well | 1 | Good, you said that sound really well. |
| tv_learn_next | 1 | Here's the next new sound... |
| tv_petal_say_short | 1 | Tap its petal, and say it. |
| st_two_letters_too | 1 | This one's two letters too, but it's just one sound. |
| tv_tap_it_say_short | 1 | Now you tap it, and say it. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (2)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 1 | Which of these is the way we write... | level w5-1 @119.8s and @127.7s |
| t_in | 1 | ...in... | world flower @359.7s and @362.9s |

### Spliced utterances: 25 of 80 (31%); chains of 5+ clips: 13

Commonest spliced shapes:

- ×1 ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say›
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×1 /X/ + ‹tv_learn_another› + /X/
- ×1 ‹tv_how_we_write› + /X/
- ×1 ‹tv_learn_last› + /X/
- ×1 ‹tv_and_how_we_write› + /X/ + ‹t_same_spelling_sometimes› + /X/ + ‹st_th_moth_sometimes› + /X/ + ‹tg_th_dh_in›
- ×1 ‹tv_learn_all_four› + ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + /X/
- ×1 ‹tv_thats_write› + /X/ + ‹we_need› + /X/ + /X/
- ×1 ‹tv_which_write› + /X/
- ×1 ‹tv_find_write› + /X/ + /X/
- ×1 ‹tv_now_find› + /X/ + ‹streak_3›
- ×1 ‹tv_your_word› + W + ‹first_sound_q›
- ×1 ‹streak_lost› + ‹tv_fs_stuck_slow› + W

Longest chains:

- level w5-1 @254.3s (10 clips): /n/ Say the sounds, and read the word. /ch/ /i/ /n/ "chin" That was a tricky one, and you kept going. Your word is... "dug" What's the first sound?
- level w5-1 @203.5s (9 clips): Say the sounds, and read the word. /f/ /i/ /sh/ "fish" You said it slowly, and found every sound. Your word is... "much" What's the first sound?
- level w5-1 @231.9s (9 clips): Say the sounds, and read the word. /m/ /u/ /ch/ "much" Here's your next word... "chin" What's the first sound? /ch/
- world flower @357.0s (8 clips): The same spelling can sometimes be... /dh/ ...in... "this" ...and sometimes... /th/ ...in... "moth"
- level w5-1 @92.2s (7 clips): And this is how we write... /dh/ The same spelling can sometimes be... /th/ ...in moth, and sometimes... /dh/ ...in this.
- level w5-1 @168.4s (6 clips): Let's say the sounds, the slow way... /ch/ /i/ /p/ Now tap the rabbit, and read the word fast. "chip"
- level w5-1 @281.6s (6 clips): /g/ Say the sounds, and read the word. /d/ /u/ /g/ "dug"
- reward @293.1s (6 clips): Let's see what you won back from Baron Muddle. You won back four sounds... /sh/ /ch/ /th/ /dh/

### Praise: 1 lines (0.2 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 11

- level w5-1 @21.2s: "You can hear it in shop, shed and shell." cut after 3.2 of 3.8 s by Tap the petal, and say it with me.
- level w5-1 @34.4s: "It's two letters, but it's one sound." cut after 2.6 of 2.9 s by Now you tap it, and say the sound.
- level w5-1 @41.8s: "Tap it once more, and say it again." cut after 0.1 of 2.5 s by /sh/
- level w5-1 @57.7s: "This one's two letters too, but it's just one sound." cut after 3.1 of 3.5 s by Now you tap it, and say it.
- level w5-1 @95.3s: "The same spelling can sometimes be..." cut after 2.2 of 2.9 s by /th/
- level w5-1 @122.5s: "/sh/" cut after 0.3 of 0.7 s by That's how we write...
- level w5-1 @137.7s: "Now find how we write..." cut after 0.4 of 2.1 s by /dh/
- level w5-1 @172.9s: "Now tap the rabbit, and read the word fast." cut after 1.1 of 3.5 s by "chip"
- level w5-1 @239.2s: "What's the first sound?" cut after 0.9 of 1.6 s by /ch/
- world flower @357.0s: "The same spelling can sometimes be..." cut after 2.2 of 2.9 s by /dh/
- world flower @375.4s: "The same spelling can sometimes be..." cut after 2.2 of 2.9 s by /th/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 1 | level w5-1 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |

## playtest/fix/D1/transcripts-final/w5-1/continuous-perfect-from-w5-1.json (perfect-from-w5-1, one continuous page)

80 Sensei lines, 86 sounds and words, 65 utterances in 8 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| t_same_spelling_sometimes | 3 | The same spelling can sometimes be... |
| tv_your_word | 3 | Your word is... |
| tv_here_sound | 3 | Here's the sound... |
| tv_map_hint | 2 | The glowing stone is your next game. Tap it when you're ready. |
| tv_watch_write | 2 | Now watch my ninja write it. |
| tv_how_we_write | 2 | This is how we write... |
| tv_and_how_we_write | 2 | And this is how we write... |
| st_th_moth_sometimes | 2 | ...in moth, and sometimes... |
| tg_th_dh_in | 2 | ...in this. |
| tv_which_write | 2 | Which of these is the way we write... |
| next_sound_q | 2 | What's the next sound? |
| tv_next_word | 2 | Here's your next word... |
| say_sounds_read | 2 | Say the sounds, and read the word. |
| t_in | 2 | ...in... |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_learn_short_four | 1 | Back to the dojo. Today there are four new sounds. |
| tv_learn_first_short | 1 | Here's the first new sound... |
| tp_sh_hear | 1 | You can hear it in shop, shed and shell. |
| tv_petal_say | 1 | Tap the petal, and say it with me. |
| t_two_letters | 1 | It's two letters, but it's one sound. |
| tv_tap_letter_say | 1 | Now you tap it, and say the sound. |
| tv_once_more | 1 | Tap it once more, and say it again. |
| tv_said_well | 1 | Good, you said that sound really well. |
| tv_learn_next | 1 | Here's the next new sound... |
| tv_petal_say_short | 1 | Tap its petal, and say it. |
| st_two_letters_too | 1 | This one's two letters too, but it's just one sound. |
| tv_tap_it_say_short | 1 | Now you tap it, and say it. |
| tv_learn_another | 1 | Here's another new sound... |
| tv_learn_last | 1 | Here's the last new sound... |
| tv_learn_all_four | 1 | Four new sounds! You said every one. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (3)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 1 | Which of these is the way we write... | level w5-1 @111.7s and @115.3s |
| next_sound_q | 1 | What's the next sound? | level w5-1 @134.4s and @136.8s |
| t_in | 1 | ...in... | world flower @318.5s and @321.7s |

### Spliced utterances: 24 of 65 (37%); chains of 5+ clips: 12

Commonest spliced shapes:

- ×1 ‹tv_learn_short_four› + ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×1 ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹tv_and_how_we_write› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/
- ×1 /X/ + ‹tv_learn_another› + /X/
- ×1 ‹tv_how_we_write› + /X/
- ×1 /X/ + ‹tv_learn_last› + /X/
- ×1 ‹tv_and_how_we_write› + /X/ + ‹t_same_spelling_sometimes› + /X/ + ‹st_th_moth_sometimes› + /X/ + ‹tg_th_dh_in›
- ×1 ‹tv_learn_all_four› + ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + /X/ + /X/
- ×1 ‹tv_which_write› + /X/
- ×1 ‹tv_find_write› + /X/ + /X/
- ×1 ‹tv_now_find› + /X/ + ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q› + /X/
- ×1 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + /X/ + /X/ + ‹tv_fs_rabbit_read› + W
- ×1 ‹tv_fs_two_ways› + ‹tv_next_word› + W
- ×1 ‹say_sounds_read› + /X/ + /X/ + /X/ + /X/ + W + ‹tv_your_word› + W

Longest chains:

- level w5-1 @174.6s (8 clips): Say the sounds, and read the word. /h/ /a/ /n/ /d/ "hand" Your word is... "shut"
- level w5-1 @84.5s (7 clips): And this is how we write... /dh/ The same spelling can sometimes be... /th/ ...in moth, and sometimes... /dh/ ...in this.
- level w5-1 @124.5s (7 clips): Now find how we write... /dh/ Now let's build some words with your new sounds. Your word is... "chimp" What's the first sound? /ch/
- level w5-1 @147.7s (7 clips): Let's say the sounds, the slow way... /ch/ /i/ /m/ /p/ Now tap the rabbit, and read the word fast. "chimp"
- level w5-1 @216.7s (7 clips): Say the sounds, and read the word. /k/ /a/ /sh/ "cash" Your word is... "rush"
- world flower @318.0s (7 clips): /dh/ ...in... "this" ...and sometimes... /th/ ...in... "moth"
- level w5-1 @31.4s (6 clips): Now watch my ninja write it. This is how we write... /sh/ It's two letters, but it's one sound. Now you tap it, and say the sound. /sh/
- level w5-1 @51.8s (6 clips): Now watch my ninja write it. And this is how we write... /ch/ This one's two letters too, but it's just one sound. Now you tap it, and say it. /ch/

### Praise: 2 lines (0.3 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 11

- level w5-1 @23.7s: "You can hear it in shop, shed and shell." cut after 3.2 of 3.8 s by Tap the petal, and say it with me.
- level w5-1 @36.2s: "It's two letters, but it's one sound." cut after 2.6 of 2.9 s by Now you tap it, and say the sound.
- level w5-1 @38.8s: "Now you tap it, and say the sound." cut after 1.4 of 2.5 s by /sh/
- level w5-1 @41.4s: "Tap it once more, and say it again." cut after 0.6 of 2.5 s by /sh/
- level w5-1 @56.9s: "This one's two letters too, but it's just one sound." cut after 3.1 of 3.5 s by Now you tap it, and say it.
- level w5-1 @87.5s: "The same spelling can sometimes be..." cut after 2.2 of 2.9 s by /th/
- level w5-1 @114.4s: "/sh/" cut after 0.2 of 0.7 s by /sh/
- level w5-1 @124.5s: "Now find how we write..." cut after 0.6 of 2.1 s by /dh/
- level w5-1 @153.3s: "Now tap the rabbit, and read the word fast." cut after 1.1 of 3.5 s by "chimp"
- world flower @315.7s: "The same spelling can sometimes be..." cut after 2.3 of 2.9 s by /dh/
- world flower @331.2s: "The same spelling can sometimes be..." cut after 2.2 of 2.9 s by /th/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 1 | level w5-1 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |

## playtest/fix/D1/transcripts-final/w6-1/continuous-learner-from-w6-1.json (learner-from-w6-1, one continuous page)

74 Sensei lines, 69 sounds and words, 63 utterances in 8 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 4 | What's the first sound? |
| last_sound_q | 4 | What's the last sound? |
| say_sounds_read | 4 | Say the sounds, and read the word. |
| next_sound_q | 4 | What's the next sound? |
| tv_your_word | 3 | Your word is... |
| tv_fs_stuck_slow | 3 | Let's say it the slow way first... |
| tv_watch_write | 2 | Now watch my ninja write it. |
| tv_which_write | 2 | Which of these is the way we write... |
| tv_praise_kept_going | 2 | That was a tricky one, and you kept going. |
| tv_next_word | 2 | Here's your next word... |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_learn_short_two | 1 | Back to the dojo. Today there are two new sounds. |
| tv_learn_first_short | 1 | Here's the first new sound... |
| tp_ae_hear | 1 | You can hear it in rain, tail and nail. |
| tv_petal_say | 1 | Tap the petal, and say it with me. |
| tv_how_we_write | 1 | This is how we write... |
| t_two_letters | 1 | It's two letters, but it's one sound. |
| tv_tap_letter_say | 1 | Now you tap it, and say the sound. |
| tv_once_more | 1 | Tap it once more, and say it again. |
| tv_said_well | 1 | Good, you said that sound really well. |
| tv_learn_next | 1 | Here's the next new sound... |
| st_know_this_sound | 1 | Ooh, you already know this sound! |
| tv_petal_say_short | 1 | Tap its petal, and say it. |
| t_another_way | 1 | This is another way to spell the sound... |
| st_two_letters_too | 1 | This one's two letters too, but it's just one sound. |
| tv_tap_it_say_short | 1 | Now you tap it, and say it. |
| tv_learn_all_two | 1 | Two new sounds! You said every one. |
| tv_ne_new_sounds | 1 | Now let's play Ninja Eyes, with your new sounds. |
| tv_petal_hint | 1 | Tap the petal if you want to hear the sound again. |
| tv_thats_write | 1 | That's how we write... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (2)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 1 | Which of these is the way we write... | level w6-1 @79.9s and @83.9s |
| next_sound_q | 1 | What's the next sound? | level w6-1 @194.9s and @200.1s |

### Spliced utterances: 18 of 63 (29%); chains of 5+ clips: 9

Commonest spliced shapes:

- ×1 ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say›
- ×1 /X/ + ‹tv_once_more› + /X/ + ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short›
- ×1 ‹tv_learn_all_two› + ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + /X/
- ×1 /X/ + ‹tv_which_write› + /X/ + ‹tv_thats_write›
- ×1 /X/ + ‹we_need› + /X/
- ×1 ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q›
- ×1 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read› + W
- ×1 ‹tv_fs_two_ways› + ‹tv_next_word› + W
- ×1 ‹tv_fs_stuck_slow› + W
- ×1 ‹say_sounds_read› + /X/ + /X/ + /X/ + /X/ + W + ‹tv_fs_praise_every› + ‹tv_your_word› + W + ‹first_sound_q›
- ×1 /X/ + ‹say_sounds_read› + /X/ + /X/ + /X/ + W + ‹tv_next_word› + W + ‹first_sound_q›
- ×1 /X/ + ‹say_sounds_read› + /X/ + /X/ + /X/ + /X/ + W + ‹tv_praise_kept_going› + ‹tv_your_word› + W + ‹first_sound_q›
- ×1 ‹tv_won_one› + /X/ + ‹fm_rw_more›

Longest chains:

- level w6-1 @215.8s (11 clips): /k/ Say the sounds, and read the word. /m/ /i/ /l/ /k/ "milk" That was a tricky one, and you kept going. Your word is... "tail" What's the first sound?
- level w6-1 @150.6s (10 clips): Say the sounds, and read the word. /p/ /ae/ /n/ /t/ "paint" You said it slowly, and found every sound. Your word is... "nail" What's the first sound?
- level w6-1 @181.8s (9 clips): /l/ Say the sounds, and read the word. /n/ /ae/ /l/ "nail" Here's your next word... "milk" What's the first sound?
- level w6-1 @38.2s (6 clips): /ae/ Tap it once more, and say it again. /ae/ Good, you said that sound really well. Here's the next new sound... /ae/
- level w6-1 @27.1s (5 clips): Now watch my ninja write it. This is how we write... /ae/ It's two letters, but it's one sound. Now you tap it, and say the sound.
- level w6-1 @54.2s (5 clips): Now watch my ninja write it. This is another way to spell the sound... /ae/ This one's two letters too, but it's just one sound. Now you tap it, and say it.
- level w6-1 @69.4s (5 clips): Two new sounds! You said every one. Now let's play Ninja Eyes, with your new sounds. Tap the petal if you want to hear the sound again. Which of these is the way we write... /ae/
- level w6-1 @111.3s (5 clips): Let's say the sounds, the slow way... /s/ /ae/ Now tap the rabbit, and read the word fast. "say"

### Praise: 0 lines (0.0 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 6

- level w6-1 @19.3s: "You can hear it in rain, tail and nail." cut after 3.3 of 3.9 s by Tap the petal, and say it with me.
- level w6-1 @39.2s: "Tap it once more, and say it again." cut after 0.4 of 2.5 s by /ae/
- level w6-1 @59.9s: "This one's two letters too, but it's just one sound." cut after 3.1 of 3.5 s by Now you tap it, and say it.
- level w6-1 @116.1s: "Now tap the rabbit, and read the word fast." cut after 0.5 of 3.5 s by "say"
- level w6-1 @244.3s: "/l/" cut after 0.5 of 0.8 s by Say the sounds, and read the word.
- reward @265.7s: "Look, a gem! Each gem holds a way to spell a sound. When you get words" cut after 6.7 of 7.4 s by Now let's go and see where your sounds live. Tap t

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 1 | level w6-1 |
| t_another_way "This is another way to spell the sound..." | 1 | level w6-1 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |

## playtest/fix/D1/transcripts-final/w6-1/continuous-perfect-from-w6-1.json (perfect-from-w6-1, one continuous page)

62 Sensei lines, 59 sounds and words, 50 utterances in 8 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_your_word | 3 | Your word is... |
| tv_watch_write | 2 | Now watch my ninja write it. |
| tv_which_write | 2 | Which of these is the way we write... |
| tv_next_word | 2 | Here's your next word... |
| say_sounds_read | 2 | Say the sounds, and read the word. |
| tv_welcome_back | 1 | Welcome back, ninja! I'm so happy to see you. |
| tv_learn_short_two | 1 | Back to the dojo. Today there are two new sounds. |
| tv_learn_first_short | 1 | Here's the first new sound... |
| tp_ae_hear | 1 | You can hear it in rain, tail and nail. |
| tv_petal_say | 1 | Tap the petal, and say it with me. |
| tv_how_we_write | 1 | This is how we write... |
| t_two_letters | 1 | It's two letters, but it's one sound. |
| tv_tap_letter_say | 1 | Now you tap it, and say the sound. |
| tv_once_more | 1 | Tap it once more, and say it again. |
| tv_said_well | 1 | Good, you said that sound really well. |
| tv_learn_next | 1 | Here's the next new sound... |
| st_know_this_sound | 1 | Ooh, you already know this sound! |
| tv_petal_say_short | 1 | Tap its petal, and say it. |
| t_another_way | 1 | This is another way to spell the sound... |
| st_two_letters_too | 1 | This one's two letters too, but it's just one sound. |
| tv_tap_it_say_short | 1 | Now you tap it, and say it. |
| tv_learn_all_two | 1 | Two new sounds! You said every one. |
| tv_ne_new_sounds | 1 | Now let's play Ninja Eyes, with your new sounds. |
| tv_petal_hint | 1 | Tap the petal if you want to hear the sound again. |
| tv_thats_write | 1 | That's how we write... |
| we_need | 1 | We need... |
| tv_yay_lovely | 1 | Lovely! |
| tv_build_dojo | 1 | Now let's build some words with your new sounds. |
| first_sound_q | 1 | What's the first sound? |
| next_sound_q | 1 | What's the next sound? |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (1)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 1 | Which of these is the way we write... | level w6-1 @73.5s and @78.4s |

### Spliced utterances: 18 of 50 (36%); chains of 5+ clips: 7

Commonest spliced shapes:

- ×1 ‹tv_learn_first_short› + /X/
- ×1 ‹tv_watch_write› + ‹tv_how_we_write› + /X/ + ‹t_two_letters› + ‹tv_tap_letter_say› + /X/
- ×1 ‹tv_said_well› + ‹tv_learn_next› + /X/
- ×1 ‹tv_watch_write› + ‹t_another_way› + /X/ + ‹st_two_letters_too› + ‹tv_tap_it_say_short› + /X/
- ×1 ‹tv_learn_all_two› + ‹tv_ne_new_sounds› + ‹tv_petal_hint› + ‹tv_which_write› + ‹tv_thats_write›
- ×1 /X/ + ‹we_need›
- ×1 /X/ + /X/ + ‹tv_which_write› + /X/
- ×1 ‹tv_build_dojo› + ‹tv_your_word› + W + ‹first_sound_q›
- ×1 /X/ + ‹streak_3› + ‹tv_fs_say_sounds_slow› + /X/ + /X/ + /X/ + ‹tv_fs_rabbit_read› + W
- ×1 ‹tv_fs_two_ways› + ‹tv_next_word› + W
- ×1 ‹say_sounds_read› + /X/ + /X/ + W + ‹tv_your_word› + W
- ×1 /X/ + ‹tv_fs_say_slow› + W + ‹tv_fs_now_fast› + W + ‹tv_next_word› + W
- ×1 ‹say_sounds_read› + /X/ + /X/ + /X/ + /X/ + W + ‹tv_fs_praise_every› + ‹tv_your_word› + W
- ×1 ‹tv_fs_slow_tortoise› + W + ‹tv_fs_fast_rabbit› + W
- ×1 ‹tv_to_reward› + ‹tv_won_one› + /X/ + ‹fm_rw_more›

Longest chains:

- level w6-1 @164.2s (9 clips): Say the sounds, and read the word. /s/ /p/ /r/ /ae/ "spray" You said it slowly, and found every sound. Your word is... "stamp"
- level w6-1 @96.1s (8 clips): /n/ Ninja power! Let's say the sounds, the slow way... /r/ /ae/ /n/ Now tap the rabbit, and read the word fast. "rain"
- level w6-1 @139.8s (7 clips): /t/ Let's say it the slow way... "paint" (slowly) And now, fast... "paint" Here's your next word... "spray"
- level w6-1 @24.8s (6 clips): Now watch my ninja write it. This is how we write... /ae/ It's two letters, but it's one sound. Now you tap it, and say the sound. /ae/
- level w6-1 @49.4s (6 clips): Now watch my ninja write it. This is another way to spell the sound... /ae/ This one's two letters too, but it's just one sound. Now you tap it, and say it. /ae/
- level w6-1 @119.0s (6 clips): Say the sounds, and read the word. /s/ /ae/ "say" Your word is... "paint"
- level w6-1 @63.0s (5 clips): Two new sounds! You said every one. Now let's play Ninja Eyes, with your new sounds. Tap the petal if you want to hear the sound again. Which of these is the way we write... That's how we write...

### Praise: 1 lines (0.2 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 9

- level w6-1 @18.0s: "You can hear it in rain, tail and nail." cut after 3.3 of 3.9 s by Tap the petal, and say it with me.
- level w6-1 @32.2s: "Now you tap it, and say the sound." cut after 1.6 of 2.5 s by /ae/
- level w6-1 @34.9s: "Tap it once more, and say it again." cut after 1.0 of 2.5 s by /ae/
- level w6-1 @55.1s: "This one's two letters too, but it's just one sound." cut after 3.1 of 3.5 s by Now you tap it, and say it.
- level w6-1 @73.5s: "Which of these is the way we write..." cut after 0.1 of 2.7 s by That's how we write...
- level w6-1 @78.4s: "Which of these is the way we write..." cut after 1.8 of 2.7 s by /ae/
- level w6-1 @96.1s: "/n/" cut after 0.2 of 0.6 s by Ninja power!
- level w6-1 @103.4s: "Now tap the rabbit, and read the word fast." cut after 1.1 of 3.5 s by "rain"
- reward @220.8s: "Look, a gem! Each gem holds a way to spell a sound. When you get words" cut after 7.1 of 7.4 s by Now let's go and see where your sounds live. Tap t

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 1 | level w6-1 |
| t_another_way "This is another way to spell the sound..." | 1 | level w6-1 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C5-S: playtest/fix/D1/transcripts-final/splitter/continuous-splitter-from-w5-1.json

splitter, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 6 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 1 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×3 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 1 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.02 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 1 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 5 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | 2 of 2 (100%) | pass |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 11 words (median line 6 words; 49 turns) | pass |
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
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 16.6 s (build w5-1); 1 over | **FAIL** |

- **world-welcomes**: world_5 "Welcome to Shadow Castle. Don't worry, I'm right beside you." said 3 times
- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @5:37.6
- **cut-explanations**: w5-1 @0:38.8 ‹t_two_letters› "It's two letters, but it's one sound."; w5-1 @1:03.8 ‹st_two_letters_too› "This one's two letters too, but it's just one sound."; reward @5:11.7 ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words"; w5-3 @9:16.4 ‹t_two_letters› "It's two letters, but it's one sound."; w5-3 @9:38.6 ‹st_two_letters_too› "This one's two letters too, but it's just one sound."
- **fs-talk**: build (w5-1) 16.6 s from ‹tv_won_four› "You won back four sounds..." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."

### C(w2-1)-L: playtest/fix/D1/transcripts-final/w2-1/continuous-learner-from-w2-1.json

learner, from w2-1, opt-in none.

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
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.07 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 1 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 10.9 s (learn w2-1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 6 words; 32 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | yes | pass |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 1 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 1 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 1 a level, 1 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 1 of 1 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 5 of 5, rabbit 5 of 5 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 12.6 s (build w2-1); 1 over | **FAIL** |

- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @5:42.4
- **fs-talk**: build (w2-1) 12.6 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹first_sound_q› "What's the first sound?", with ‹tv_fs_praise_every› "You said it slowly, and found every sound."

### C(w2-1)-P: playtest/fix/D1/transcripts-final/w2-1/continuous-perfect-from-w2-1.json

perfect, from w2-1, opt-in none.

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
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 1 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.74 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 1 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 1 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 10.9 s (learn w2-1); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 7 words; 22 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | yes | pass |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 1 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 1 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 1 a level, 1 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 1 of 1 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 5 of 5, rabbit 5 of 5 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 26.2 s (build w2-1); 1 over | **FAIL** |

- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @4:38.6
- **fs-talk**: build (w2-1) 26.2 s from ‹tv_to_reward› "Let's see what you won back from Baron Muddle." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."

### C(w3-6)-L: playtest/fix/D1/transcripts-final/w3-6/continuous-learner-from-w3-6.json

learner, from w3-6, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 1 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_3 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 1 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.86 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 6 words; 40 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 5 of 5, rabbit 5 of 5 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.7 s (build w3-6); 0 over | pass |

- **line-60s**: ‹t_ways_2› "Now you know two ways to spell..." from world flower @6:19.8; ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from world flower @6:43.0

### C(w3-6)-P: playtest/fix/D1/transcripts-final/w3-6/continuous-perfect-from-w3-6.json

perfect, from w3-6, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 1 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 1 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.00 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 1 | pass |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 11 words (median line 6 words; 26 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 5 of 5, rabbit 5 of 5 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 31.0 s (build w3-6); 1 over | **FAIL** |

- **line-60s**: ‹t_ways_2› "Now you know two ways to spell..." from world flower @5:29.8; ‹wf_found_gem› "You found a new gem! It's a spelling of the sound..." from world flower @5:52.1
- **cut-explanations**: reward @4:53.4 ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words"
- **fs-talk**: build (w3-6) 31.0 s from ‹tv_to_reward› "Let's see what you won back from Baron Muddle." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."

### C5-L: playtest/fix/D1/transcripts-final/w5-1/continuous-learner-from-w5-1.json

learner, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 2 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 1 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.05 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 1 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 2 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 6 words; 32 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 5 of 5, rabbit 5 of 5 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.6 s (build w5-1); 0 over | pass |

- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @5:27.8
- **cut-explanations**: w5-1 @0:34.4 ‹t_two_letters› "It's two letters, but it's one sound."; w5-1 @0:57.7 ‹st_two_letters_too› "This one's two letters too, but it's just one sound."

### C5-P: playtest/fix/D1/transcripts-final/w5-1/continuous-perfect-from-w5-1.json

perfect, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 2 | n/a |
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
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.69 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 1 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 2 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 6 words; 21 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 5 of 5, rabbit 5 of 5 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 28.1 s (build w5-1); 1 over | **FAIL** |

- **line-60s**: ‹tv_here_sound› "Here's the sound..." from world flower @4:53.7
- **cut-explanations**: w5-1 @0:36.2 ‹t_two_letters› "It's two letters, but it's one sound."; w5-1 @0:56.9 ‹st_two_letters_too› "This one's two letters too, but it's just one sound."
- **fs-talk**: build (w5-1) 28.1 s from ‹tv_to_reward› "Let's see what you won back from Baron Muddle." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."

### C(w6-1)-L: playtest/fix/D1/transcripts-final/w6-1/continuous-learner-from-w6-1.json

learner, from w6-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 2 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_6 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 1 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.71 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 3 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 8 words (median line 7 words; 25 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 5 of 5, rabbit 5 of 5 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 13.4 s (build w6-1); 1 over | **FAIL** |

- **cut-explanations**: w6-1 @0:31.7 ‹t_two_letters› "It's two letters, but it's one sound."; w6-1 @0:59.9 ‹st_two_letters_too› "This one's two letters too, but it's just one sound."; reward @4:25.7 ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words"
- **fs-talk**: build (w6-1) 13.4 s from ‹sound:t› "/t/" to ‹first_sound_q› "What's the first sound?", with ‹tv_fs_praise_every› "You said it slowly, and found every sound."

### C(w6-1)-P: playtest/fix/D1/transcripts-final/w6-1/continuous-perfect-from-w6-1.json

perfect, from w6-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 2 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_6 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 1 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.84 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 3 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 18 words (median line 7 words; 16 turns) | pass |
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
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 5 of 5, rabbit 5 of 5 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | n/a | n/a |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 1 of 1 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 16.1 s (build w6-1); 1 over | **FAIL** |

- **cut-explanations**: w6-1 @0:29.5 ‹t_two_letters› "It's two letters, but it's one sound."; w6-1 @0:55.1 ‹st_two_letters_too› "This one's two letters too, but it's just one sound."; reward @3:40.8 ‹audit_gem_first› "Look, a gem! Each gem holds a way to spell a sound. When you get words"
- **fs-talk**: build (w6-1) 16.1 s from ‹tv_to_reward› "Let's see what you won back from Baron Muddle." to ‹tv_to_flower_first› "Now let's go and see where your sounds live. Tap the green arrow.", with ‹tv_fs_slow_tortoise› "First the slow way, like the tortoise..."

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

