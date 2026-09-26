# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/transcripts/2026-09-26-script-editor/journey-perfect.json (perfect, one page per level)

1763 Sensei lines, 3020 sounds and words, 2175 utterances in 76 levels.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| streak_6 | 61 | Wow! Super ninja streak! |
| yay_7 | 61 | You did it! |
| fm_rw_more | 54 | More stickers for your Sticker Book! |
| t_two_letters | 53 | It's two letters, but it's one sound. |
| swap_make | 49 | Change it to make... |
| audit_streak_first | 44 | Three right answers in a row! Your ninja is getting stronger. |
| streak_10 | 44 | Amazing! You're a ninja master! |
| audit_gem_first | 44 | Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. |
| yay_1 | 43 | Brilliant! |
| audit_gem_more | 41 | Look, this gem has filled a little more. |
| listen | 41 | Listen... |
| dojo_tap_say | 40 | Tap it, and say it with me! |
| yay_10 | 39 | Ace! |
| yay_4 | 39 | Well done! |
| dojo_find | 39 | Can you find... |
| yay_5 | 36 | Amazing! |
| swap_pick | 36 | Now pick the new sound. |
| yay_9 | 36 | Smashing! |
| yay_3 | 35 | Fantastic! |
| audit_spell_it | 35 | And this is how we spell it. |
| yay_2 | 31 | Super! |
| swap_which | 30 | Which sound needs to change? |
| fm_l2_way | 20 | Ninjas read this way! |
| what_changed | 19 | What changed? Listen here. |
| streak_3 | 18 | Ninja power! |
| say_sounds_read | 17 | Say the sounds... and read the word! |
| first_q | 16 | Which one starts with... |
| dojo_done | 16 | Well done! You practised so hard! |
| story_your_turn | 15 | Your turn to read! Tap a word if you need help. |
| well_read | 15 | Well read! |

### Echoes: the same utterance shape back to back (1)

- training @4.3s ×2: And when you tap the speaker, I'll say it again! ‖ And when you tap the speaker, I'll say it again!

### Near repeats: the same line again within 15 s (233)

| Line | Repeats | Text | Example |
|---|---|---|---|
| swap_make | 30 | Change it to make... | w1-8 @162.5s and @176.5s |
| dojo_find | 27 | Can you find... | w2-1 @69.5s and @75.0s |
| swap_pick | 22 | Now pick the new sound. | w1-8 @157.2s and @171.5s |
| listen | 19 | Listen... | w2-1 @30.4s and @39.7s |
| swap_which | 19 | Which sound needs to change? | w2-5 @27.1s and @40.6s |
| audit_spell_it | 17 | And this is how we spell it. | w2-1 @33.6s and @42.7s |
| dojo_tap_say | 16 | Tap it, and say it with me! | w2-1 @36.0s and @45.1s |
| first_q | 14 | Which one starts with... | w1-2 @270.5s and @283.7s |
| what_changed | 14 | What changed? Listen here. | w1-8 @153.2s and @167.2s |
| place_tap | 7 | Which one is... | placement @3.6s and @9.5s |
| yay_1 | 7 | Brilliant! | placement @2.5s and @11.2s |
| t_two_letters | 7 | It's two letters, but it's one sound. | w5-1 @33.5s and @46.7s |
| how_we_spell | 6 | This is how we spell... | w1-2 @276.4s and @287.8s |
| story_your_turn | 5 | Your turn to read! Tap a word if you need help. | w1-14 @16.0s and @28.3s |
| well_read | 5 | Well read! | w1-14 @17.3s and @29.5s |
| place_gap | 3 | Which spelling of | placement @37.7s and @39.5s |
| find_q | 2 | Find this sound... | w1-2 @343.0s and @344.5s |
| hunt_q | 2 | Which one has this sound in it? | w1-7 @251.1s and @261.1s |
| yay_4 | 2 | Well done! | w2-4 @49.2s and @59.6s |
| fm_speaker | 1 | And when you tap the speaker, I'll say it again! | training @4.3s and @5.3s |
| fm_pair_fish_dog | 1 | Fish dog! | w1-wu2 @10.1s and @19.5s |
| fm_found_all | 1 | You found them all! | w1-wu3 @50.2s and @63.5s |
| yay_9 | 1 | Smashing! | w2-1 @67.1s and @77.1s |
| yay_5 | 1 | Amazing! | w2-4 @57.1s and @71.9s |
| audit_special_the | 1 | This is 'the'. Just say 'the' here. | w3-11 @31.7s and @46.6s |

### Spliced utterances: 201 of 2175 (9%); chains of 5+ clips: 276

Commonest spliced shapes:

- ×13 ‹swap_make› + W
- ×12 ‹battle_spell› + W
- ×11 ‹swap_make› + W + ‹swap_which›
- ×8 ‹listen› + /X/ + /X/
- ×7 /X/ + ‹yay_10› + ‹dojo_find›
- ×6 ‹audit_dojo_back› + ‹listen› + /X/ + /X/
- ×6 ‹dojo_hello› + ‹listen› + /X/ + /X/
- ×6 ‹this_is› + W
- ×5 /X/ + ‹yay_1› + ‹dojo_find›
- ×4 /X/ + ‹yay_1› + ‹listen› + /X/ + /X/
- ×4 /X/ + ‹yay_4› + ‹dojo_find›
- ×4 /X/ + ‹yay_3› + ‹dojo_find›
- ×3 ‹how_we_spell› + /X/
- ×3 /X/ + ‹how_we_spell› + /X/
- ×3 /X/ + ‹how_we_spell›

Longest chains:

- w5-6 @84.1s (13 clips): Wow! Super ninja streak! Ninjas read this way! /th/ /i/ /k/ "thick" This can be... /dh/ ...but in this word, it's... /th/ Amazing! Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. "chop"
- w4-3 @12.4s (12 clips): /s/ Three right answers in a row! Your ninja is getting stronger. Ninjas read this way! /d/ /r/ /e/ /s/ "dress" It's two letters, but it's one sound. Super! Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. "flat"
- w1-wu5 @76.6s (11 clips): This is your Sticker Book! "mop" "cap" "bug" "fan" "man" "jug" "bun" "bus" Every picture you play with becomes a sticker! Tap a sticker!
- w4-1 @12.4s (11 clips): /k/ Three right answers in a row! Your ninja is getting stronger. Ninjas read this way! /s/ /i/ /l/ /k/ "silk" Smashing! Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. "beg"
- w5-3 @88.1s (11 clips): /ng/ /th/ /i/ /ng/ "thing" This can be... /dh/ ...but in this word, it's... /th/ Smashing! "ship"
- w2-4 @63.6s (10 clips): /n/ Wow! Super ninja streak! Ninjas read this way! /m/ /a/ /n/ "man" Amazing! Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. "fog"
- w3-1 @157.3s (10 clips): /g/ /p/ /e/ /g/ "peg" Ace! Well done! You practised so hard! You did it! You won back some sounds! More stickers for your Sticker Book!
- w3-4 @68.3s (10 clips): /g/ Wow! Super ninja streak! Ninjas read this way! /w/ /i/ /g/ "wig" Fantastic! Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. "jab"

### Praise: 582 lines (3.3 a minute); stacked (2+ within 5 s): 79

- placement @2.5s: "Brilliant!" → "Three right answers in a row! Your ninja is getting stronger."
- placement @11.2s: "Brilliant!" → "Wow! Super ninja streak!" → "Brilliant!"
- placement @24.3s: "Brilliant!" → "Brilliant!" → "Amazing! You're a ninja master!" → "Brilliant!"
- placement @41.7s: "Brilliant!" → "Brilliant!"
- w1-wu1 @63.2s: "You found them both! They both start with..." → "You can hear the sounds in words. Brilliant listening!"
- w1-wu3 @63.5s: "You found them all!" → "You can hear the sounds in words. Brilliant listening!"
- w1-2 @340.1s: "Wow! Super ninja streak!" → "Ace!" → "Well done!" → "You did it!" → "You won back some sounds!"
- w1-4 @338.2s: "Ace!" → "You did it!"
- w1-6 @73.7s: "Amazing! You're a ninja master!" → "Hooray! The monster ran away!" → "You did it!"
- w1-7 @345.0s: "Fantastic!" → "You did it!" → "You won back a sound!"
- w1-8 @233.3s: "Ace!" → "You fixed them all!" → "You did it!"
- w1-10 @211.6s: "Wow! Super ninja streak!" → "Super!" → "Smashing!"
- w1-10 @295.2s: "Ace!" → "You did it!" → "You won back some sounds!"
- w1-11 @242.8s: "Amazing!" → "You did it!" → "You won back a sound!"
- w1-12 @152.7s: "Ninja power!" → "Ace!"
- w1-12 @312.6s: "Ace!" → "You fixed them all!" → "You did it!"
- w1-13 @56.0s: "Amazing! You're a ninja master!" → "Hooray! The monster ran away!" → "You did it!"
- w1-14 @57.7s: "Amazing!" → "You did it!"
- w2-1 @67.1s: "Smashing!" → "Brilliant!" → "Three right answers in a row! Your ninja is getting stronger." → "Ace!" → "Smashing!" → "Wow! Super ninja streak!"
- w2-1 @127.1s: "Well done!" → "Well done! You practised so hard!" → "You did it!" → "You won back some sounds!"
- w2-2 @75.7s: "Amazing! You're a ninja master!" → "Hooray! The monster ran away!" → "You did it!"
- w2-4 @47.2s: "Ace!" → "Well done!" → "Three right answers in a row! Your ninja is getting stronger." → "Amazing!" → "Well done!" → "Wow! Super ninja streak!"
- w2-4 @112.5s: "Ace!" → "Well done! You practised so hard!" → "You did it!" → "You won back some sounds!"
- w2-5 @70.4s: "Amazing! You're a ninja master!" → "You fixed them all!" → "You did it!"
- w2-6 @58.8s: "Amazing! You're a ninja master!" → "Hooray! The monster ran away!" → "You did it!"

### Silences of 10 s or more inside a level or piece: 3

- w4-8 @46.5s: 15.9 s silent (0 taps) after "Story time! I'll read, and you read too. story:s4_title", before "Tap the arrow when you're ready!"
- w4-8 @63.3s: 24.1 s silent (0 taps) after "Tap the arrow when you're ready!", before "Tap the arrow when you're ready!"
- w4-8 @88.3s: 69.7 s silent (0 taps) after "Tap the arrow when you're ready!", before "story:s4_1"

### Cut-off clips: 195

- training @0.0s: "Ninja training! First, tap the big gong!" cut after 0.9 of 2.9 s by Stuck? Tap me, down here in the corner. Try it now
- training @0.9s: "Stuck? Tap me, down here in the corner. Try it now!" cut after 0.8 of 3.9 s by That's it! I'm always here to help.
- training @4.3s: "And when you tap the speaker, I'll say it again!" cut after 1.0 of 2.6 s by And when you tap the speaker, I'll say it again!
- placement @0.0s: "Let's see what you know! Just have a go." cut after 1.1 of 2.1 s by Which is the spelling of this sound?
- placement @1.1s: "Which is the spelling of this sound?" cut after 1.4 of 2.5 s by Brilliant!
- placement @13.6s: ""bag"" cut after 0.1 of 0.5 s by Which one is...
- placement @19.5s: "Can you spell..." cut after 0.3 of 1.0 s by /h/
- placement @28.2s: ""jet"" cut after 0.2 of 0.6 s by Brilliant!
- placement @36.4s: ""clip"" cut after 0.1 of 0.6 s by Brilliant!
- placement @37.7s: "Which spelling of" cut after 0.4 of 1.0 s by "ring"
- placement @42.9s: "Which spelling of" cut after 0.1 of 1.0 s by "snail"
- placement @44.1s: "Which spelling of" cut after 0.1 of 1.0 s by "grow"
- placement @46.4s: "Tap every picture that has this sound." cut after 0.3 of 2.8 s by "tree"
- w1-wu1 @28.4s: "Your turn! Tap the tortoise, and say it slowly with me." cut after 1.0 of 3.8 s by "sun" (slowly)
- w1-wu1 @32.1s: "Now tap the rabbit, and say it fast!" cut after 0.9 of 2.1 s by "sun"
- w1-wu1 @83.9s: "Tap a sticker!" cut after 0.2 of 1.0 s by "sun"
- w1-wu1 @84.9s: ""sun" (slowly)" cut after 0.4 of 2.4 s by "sun"
- w1-wu1 @86.2s: ""sun" (slowly)" cut after 0.2 of 2.4 s by Tap the green arrow to carry on!
- w1-wu2 @29.5s: "Listen. Cat... dog. Which one did I read?" cut after 1.6 of 4.4 s by Cat dog!
- w1-wu2 @75.5s: "Tap a sticker!" cut after 0.0 of 1.0 s by "fish"
- w1-wu3 @10.0s: "Your turn! Tap the tortoise, and say it slowly with me." cut after 1.1 of 3.8 s by "mug" (slowly)
- w1-wu3 @27.1s: "Here's another slow word..." cut after 1.1 of 2.8 s by "van" (slowly)
- w1-wu3 @57.1s: "Tap all the pictures that start with..." cut after 0.6 of 2.5 s by "mug" (held)
- w1-wu3 @82.3s: "Tap a sticker!" cut after 0.5 of 1.0 s by "mug"
- w1-wu3 @83.8s: ""mug" (slowly)" cut after 0.3 of 1.1 s by "mug"

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 53 | w3-6 ×4, w3-7, w3-9, w3-12, w4-3, w5-1 ×3, w5-2 ×2, w5-3 ×4, w5-4 ×2, w5-5, w5-6 ×2, w5-7, w5-8, w5-9 ×2, w5-11, w6-br1, w6-br2, w6-1 ×2, w6-2 ×2, w6-3 ×3, w6-4 ×2, w6-5 ×2, w6-6 ×4, w6-8 ×2, w6-ec11 ×3, w6-9 ×2, w6-11 ×2 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 44 | w1-7, w1-9, w1-10, w1-13, w2-1, w2-2, w2-3, w2-4, w2-5, w2-6, w3-1, w3-3, w3-4, w3-5, w3-6, w3-7, w3-8, w3-9, w3-10, w3-12, w4-1, w4-3, w4-4, w4-5, w4-9, w5-1, w5-2, w5-3, w5-4, w5-5, w5-6, w5-7, w5-8, w5-9, w5-11, w6-br1, w6-br2, w6-1, w6-2, w6-3, w6-4, w6-5, w6-8, w6-11 |
| audit_gem_more "Look, this gem has filled a little more." | 41 | w1-5, w1-7, w1-9, w1-10, w1-11, w1-13, w2-1, w2-2, w2-3, w2-4, w2-5, w2-6, w3-2, w3-3, w3-4, w3-5, w3-7, w3-8, w3-10, w4-3, w4-4, w4-5, w5-1, w5-2, w5-3, w5-4, w5-5, w5-6, w5-7, w5-8, w5-9, w6-br1, w6-1, w6-2, w6-3, w6-4, w6-5, w6-8, w6-ec11, w6-9, w6-11 |
| audit_spell_it "And this is how we spell it." | 35 | w2-1 ×4, w2-4 ×4, w3-1 ×4, w3-4 ×3, w3-6 ×5, w5-1 ×4, w5-3 ×2, w5-6 ×3, w6-1, w6-3, w6-6 ×2, w6-ec11 ×2 |
| fm_l2_way "Ninjas read this way!" | 20 | w1-wu2, w1-wu4, w2-1, w2-3, w2-4, w3-1, w3-4, w3-5, w3-6, w3-7, w3-10, w4-1, w4-3, w5-1, w5-3, w5-5, w5-6, w6-1, w6-3, w6-9 |
| how_we_spell "This is how we spell..." | 12 | w1-2 ×4, w1-7 ×2, w1-10 ×4, w1-11 ×2 |
| same_sound_new "Ooh! You already know this sound. Here's another w" | 8 | w3-1, w3-6, w5-3, w5-6, w6-1, w6-3, w6-6, w6-ec11 |
| same_sound_diff "Same sound, different spellings!" | 7 | w3-6 ×3, w5-3, w5-6 ×3 |
| r2_gems_more "Look, these gems have filled a little more." | 6 | w1-6, w1-8, w3-1, w4-1, w4-7, w6-7 |
| audit_dojo_back "Back to the dojo! Let's learn some new sounds." | 6 | w2-1, w3-1, w3-4, w5-1, w6-6, w6-ec11 |
| dojo_hello "This is the dojo. A dojo is where ninjas practise!" | 6 | w2-4, w3-6, w5-3, w5-6, w6-1, w6-3 |
| t_three_letters "It's three letters, but it's just one sound." | 6 | w5-6, w5-7, w5-8, w6-br2, w6-1, w6-ec11 |
| fm_rw_every "Every picture you play with becomes a sticker!" | 5 | w1-wu1, w1-wu2, w1-wu3, w1-wu4, w1-wu5 |
| audit_hear_see "We hear the sound. Now look: this is how we spell " | 5 | w3-6, w5-3, w5-6, w6-1, w6-3 |
| audit_sort_first "Sorting time! These words have the same sound, but" | 5 | w6-br1, w6-br2, w6-2, w6-4, w6-8 |
| t_one_spelling_two_sounds "This spelling is two sounds together!" | 4 | w3-6, w3-7, w3-10, w4-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 4 | w6-br2, w6-2, w6-4, w6-8 |
| fm_speaker "And when you tap the speaker, I'll say it again!" | 2 | training ×2 |
| audit_neighbours "These sounds sit next to each other. Listen for ea" | 2 | w4-1, w4-3 |
| fm_hear_sounds_short "Slowly, I hear its sounds. Words are made of sound" | 1 | w1-wu1 |
| t_everyone_say "Say that sound with me!" | 1 | w1-wu1 |
| audit_made_of_sounds "Remember? Words are made of sounds!" | 1 | w1-wu5 |
| audit_last_place "The last sound is at the end of the word. Listen t" | 1 | w1-10 |
| audit_sort_three "This sound can be spelt in three ways." | 1 | w6-br1 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 1 | w6-7 |

## playtest/transcripts/2026-09-26-script-editor/journey-learner.json (learner, one page per level)

2161 Sensei lines, 3383 sounds and words, 2586 utterances in 76 levels.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| listen | 94 | Listen... |
| listen_here | 83 | Listen again... What do you hear here? |
| yay_7 | 62 | You did it! |
| audit_listen_next | 57 | Hmm, listen again. What sound comes next? |
| yay_1 | 52 | Brilliant! |
| audit_gem_more | 52 | Look, this gem has filled a little more. |
| t_two_letters | 52 | It's two letters, but it's one sound. |
| yay_2 | 51 | Super! |
| audit_gem_first | 51 | Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. |
| swap_make | 49 | Change it to make... |
| yay_10 | 48 | Ace! |
| audit_streak_first | 47 | Three right answers in a row! Your ninja is getting stronger. |
| yay_9 | 46 | Smashing! |
| fm_rw_more | 42 | More stickers for your Sticker Book! |
| yay_4 | 40 | Well done! |
| dojo_tap_say | 38 | Tap it, and say it with me! |
| dojo_find | 38 | Can you find... |
| yay_5 | 37 | Amazing! |
| yay_3 | 36 | Fantastic! |
| audit_spell_it | 34 | And this is how we spell it. |
| say_sounds_read | 30 | Say the sounds... and read the word! |
| swap_which | 30 | Which sound needs to change? |
| streak_6 | 29 | Wow! Super ninja streak! |
| streak_lost | 28 | Keep going, ninja! |
| swap_pick | 28 | Now pick the new sound. |
| first_q | 27 | Which one starts with... |
| first_sound_q | 25 | What's the first sound? |
| last_sound_q | 25 | What's the last sound? |
| fm_l2_way | 23 | Ninjas read this way! |
| audit_listen_slowly | 20 | Let's listen to the word again, slowly. |

### Echoes: the same utterance shape back to back (2)

- training @4.5s ×2: And when you tap the speaker, I'll say it again! ‖ And when you tap the speaker, I'll say it again!
- w1-wu1 @28.4s ×2: "sun" (slowly) Now tap the rabbit, and say it fast! ‖ "sun" (slowly) Now tap the rabbit, and say it fast!

### Near repeats: the same line again within 15 s (219)

| Line | Repeats | Text | Example |
|---|---|---|---|
| dojo_find | 27 | Can you find... | w2-1 @44.9s and @47.1s |
| listen | 26 | Listen... | w2-1 @5.7s and @15.1s |
| first_q | 21 | Which one starts with... | w1-2 @26.1s and @37.1s |
| dojo_tap_say | 17 | Tap it, and say it with me! | w2-1 @11.4s and @20.6s |
| swap_make | 16 | Change it to make... | w1-12 @65.6s and @79.3s |
| audit_spell_it | 16 | And this is how we spell it. | w2-1 @8.9s and @18.2s |
| swap_which | 10 | Which sound needs to change? | w2-5 @28.4s and @42.5s |
| swap_pick | 9 | Now pick the new sound. | w1-12 @75.0s and @88.0s |
| well_read | 8 | Well read! | w1-14 @17.3s and @29.5s |
| what_changed | 7 | What changed? Listen here. | w1-12 @70.7s and @83.9s |
| find_q | 6 | Find this sound... | w1-2 @97.2s and @99.8s |
| story_your_turn | 6 | Your turn to read! Tap a word if you need help. | w1-14 @16.0s and @28.2s |
| how_we_spell | 5 | This is how we spell... | w1-2 @55.5s and @67.6s |
| hunt_q | 5 | Which one has this sound in it? | w1-7 @30.0s and @40.1s |
| thats | 5 | That's... | w2-4 @49.5s and @56.8s |
| t_two_letters | 5 | It's two letters, but it's one sound. | w5-1 @14.9s and @28.4s |
| place_tap | 3 | Which one is... | placement @4.5s and @11.5s |
| read_tap_sounds | 3 | Tap each sound, and say it. | w1-4 @153.0s and @167.2s |
| suki_says | 3 | Suki says... | w1-4 @161.4s and @175.7s |
| tut_speaker | 3 | Tap the speaker to hear the sound again. | w2-1 @49.0s and @57.0s |
| stays_same | 3 | That sound stays the same. | w2-5 @71.9s and @77.6s |
| kai_says | 2 | Kai says... | w1-4 @159.3s and @173.4s |
| fm_speaker | 1 | And when you tap the speaker, I'll say it again! | training @4.5s and @5.4s |
| yay_1 | 1 | Brilliant! | placement @3.3s and @15.3s |
| fm_tap_rabbit | 1 | Now tap the rabbit, and say it fast! | w1-wu1 @31.2s and @34.5s |

### Spliced utterances: 278 of 2586 (11%); chains of 5+ clips: 280

Commonest spliced shapes:

- ×42 ‹listen› + W
- ×10 ‹dojo_find› + /X/ + ‹tut_speaker›
- ×10 ‹thats› + /X/ + ‹listen› + /X/
- ×8 ‹dojo_hello› + ‹listen› + /X/ + /X/
- ×8 ‹listen› + /X/ + /X/
- ×7 ‹battle_spell› + W
- ×6 ‹read_who› + ‹kai_says› + W + ‹suki_says› + W
- ×6 ‹swap_make› + W
- ×6 /X/ + ‹yay_9› + ‹dojo_find›
- ×5 W + ‹swap_make› + W
- ×5 /X/ + ‹yay_3› + ‹dojo_find›
- ×5 ‹swap_make› + W + ‹swap_which›
- ×5 /X/ + ‹yay_10› + ‹dojo_find›
- ×4 /X/ + ‹yay_2› + ‹listen› + /X/ + /X/
- ×4 /X/ + ‹yay_1› + ‹dojo_find›

Longest chains:

- w1-wu5 @83.8s (11 clips): This is your Sticker Book! "mop" "cap" "bug" "fan" "man" "jug" "bun" "bus" Every picture you play with becomes a sticker! Tap a sticker!
- w4-6 @21.0s (11 clips): /b/ Ninjas read this way! /s/ /k/ /r/ /u/ /b/ "scrub" Super! Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. "text"
- w4-6 @44.4s (11 clips): /t/ /t/ /e/ /ks/ /t/ "text" This spelling is two sounds together! /k/ /s/ Ace! "crisp"
- w3-1 @77.4s (10 clips): /t/ Three right answers in a row! Your ninja is getting stronger. Ninjas read this way! /k/ /i/ /t/ "kit" Ace! Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. "mum"
- w5-1 @95.3s (10 clips): /t/ Ninjas read this way! /r/ /u/ /s/ /t/ "rust" Amazing! Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. "dish"
- w5-5 @22.4s (10 clips): /th/ /u/ /d/ "thud" This can be... /dh/ ...but in this word, it's... /th/ Ace! Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up.
- w5-6 @93.8s (10 clips): Wow! Super ninja streak! Ninjas read this way! /sh/ /e/ /d/ "shed" It's two letters, but it's one sound. Super! Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. "neck"
- w5-6 @156.8s (10 clips): /ch/ /h/ /u/ /ch/ "hutch" Ace! Well done! You practised so hard! You did it! You won back some sounds! More stickers for your Sticker Book!

### Praise: 564 lines (3.2 a minute); stacked (2+ within 5 s): 77

- placement @3.3s: "Brilliant!" → "Three right answers in a row! Your ninja is getting stronger."
- w1-wu1 @70.8s: "You found them both! They both start with..." → "You can hear the sounds in words. Brilliant listening!"
- w1-wu3 @67.3s: "You found them all!" → "You can hear the sounds in words. Brilliant listening!"
- w1-wu5 @75.9s: "Super!" → "You heard the words in the sounds. Super listening!"
- w1-2 @94.3s: "Wow! Super ninja streak!" → "Super!" → "Ace!" → "You did it!" → "You won back some sounds!"
- w1-3 @91.5s: "Brilliant!" → "Well done!" → "Super!" → "Ninja power!" → "You did it!" → "You won back some sounds!"
- w1-5 @126.7s: "Smashing!" → "You did it!"
- w1-6 @63.1s: "Three right answers in a row! Your ninja is getting stronger." → "Hooray! The monster ran away!" → "You did it!"
- w1-7 @273.7s: "Ninja power!" → "You did it!" → "You won back a sound!"
- w1-8 @120.3s: "Super!" → "You fixed them all!" → "You did it!"
- w1-10 @106.7s: "Well done!" → "Ace!"
- w1-10 @354.1s: "Smashing!" → "You did it!" → "You won back some sounds!"
- w1-11 @265.3s: "Ninja power!" → "You did it!" → "You won back a sound!"
- w1-12 @209.2s: "Brilliant!" → "You fixed them all!" → "You did it!"
- w1-13 @77.4s: "Hooray! The monster ran away!" → "You did it!"
- w1-14 @57.8s: "Amazing!" → "You did it!"
- w2-1 @43.7s: "Brilliant!" → "Smashing!"
- w2-1 @58.3s: "Fantastic!" → "Super!"
- w2-1 @126.1s: "Amazing!" → "Well done! You practised so hard!" → "You did it!" → "You won back some sounds!"
- w2-2 @74.5s: "Hooray! The monster ran away!" → "You did it!"
- w2-4 @53.4s: "Smashing!" → "Amazing!"
- w2-4 @61.2s: "Well done!" → "Smashing!"
- w2-4 @133.1s: "Super!" → "Well done! You practised so hard!" → "You did it!" → "You won back some sounds!"
- w2-5 @91.2s: "Ace!" → "You fixed them all!" → "You did it!"
- w2-6 @72.9s: "Ninja power!" → "Hooray! The monster ran away!" → "You did it!"

### Silences of 10 s or more inside a level or piece: 1

- w4-2 @195.0s: 10.3 s silent (0 taps) after "Read the word, and catch the matching picture!", before "/p/ /o/ /n/ /d/ "pond" Super!"

### Cut-off clips: 174

- training @0.0s: "Ninja training! First, tap the big gong!" cut after 0.9 of 2.9 s by Stuck? Tap me, down here in the corner. Try it now
- training @0.9s: "Stuck? Tap me, down here in the corner. Try it now!" cut after 0.9 of 3.9 s by That's it! I'm always here to help.
- training @4.5s: "And when you tap the speaker, I'll say it again!" cut after 0.9 of 2.6 s by And when you tap the speaker, I'll say it again!
- placement @0.0s: "Let's see what you know! Just have a go." cut after 1.7 of 2.1 s by Which is the spelling of this sound?
- placement @1.7s: "Which is the spelling of this sound?" cut after 1.6 of 2.5 s by Brilliant!
- placement @17.6s: ""cap"" cut after 0.3 of 0.6 s by Which one is...
- w1-wu1 @27.5s: "Your turn! Tap the tortoise, and say it slowly with me." cut after 0.9 of 3.8 s by "sun" (slowly)
- w1-wu1 @31.2s: "Now tap the rabbit, and say it fast!" cut after 0.9 of 2.1 s by "sun" (slowly)
- w1-wu1 @91.6s: "Tap a sticker!" cut after 0.2 of 1.0 s by "sun"
- w1-wu2 @29.4s: "Listen. Cat... dog. Which one did I read?" cut after 1.7 of 4.4 s by Cat dog!
- w1-wu3 @10.0s: "Your turn! Tap the tortoise, and say it slowly with me." cut after 0.0 of 3.8 s by "mug" (slowly)
- w1-wu3 @26.0s: "Here's another slow word..." cut after 1.0 of 2.8 s by "van" (slowly)
- w1-wu3 @59.7s: "Tap all the pictures that start with..." cut after 0.6 of 2.5 s by "moon" (held)
- w1-wu3 @86.2s: "Tap a sticker!" cut after 0.5 of 1.0 s by "mug"
- w1-wu4 @30.5s: "Listen. Fish... dog... cat. Which one did I read?" cut after 1.2 of 4.5 s by Fish dog cat!
- w1-2 @78.7s: "Which one starts with..." cut after 0.9 of 1.2 s by Sand starts with...
- w1-2 @91.4s: "/s/" cut after 0.3 of 0.8 s by Sand starts with...
- w1-2 @98.7s: "/m/" cut after 0.1 of 0.7 s by Super!
- w1-2 @99.8s: "Find this sound..." cut after 0.2 of 1.2 s by Ace!
- w1-3 @54.6s: "Which one starts with..." cut after 0.6 of 1.2 s by Tin starts with...
- w1-3 @72.3s: "Which one starts with..." cut after 0.9 of 1.2 s by Keep going, ninja!
- w1-3 @86.9s: "Find this sound..." cut after 0.9 of 1.2 s by Listen again.
- w1-3 @99.8s: "Find this sound..." cut after 0.2 of 1.2 s by Ninja power!
- w1-7 @30.0s: "Which one has this sound in it?" cut after 0.9 of 2.0 s by Tin has this sound in the middle...
- w1-7 @40.1s: "Which one has this sound in it?" cut after 0.2 of 2.0 s by Listen again.

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| audit_gem_more "Look, this gem has filled a little more." | 52 | w1-4, w1-5, w1-6, w1-7, w1-8, w1-9, w1-10, w1-11, w1-13, w2-1, w2-2, w2-3, w2-4, w2-5, w2-6, w3-1, w3-2, w3-3, w3-4, w3-5, w3-6, w3-7, w3-8, w3-9, w3-10, w4-1, w4-2, w4-3, w4-4, w4-5, w4-6, w4-7, w5-1, w5-2, w5-3, w5-4, w5-5, w5-6, w5-7, w5-8, w5-9, w6-br1, w6-br2, w6-1, w6-4, w6-5, w6-6, w6-8, w6-ec11, w6-7, w6-9, w6-11 |
| t_two_letters "It's two letters, but it's one sound." | 52 | w3-6 ×4, w3-7, w3-8, w3-9, w3-12, w4-1, w4-3 ×2, w5-1 ×3, w5-2 ×2, w5-3 ×3, w5-4 ×2, w5-5, w5-6 ×3, w5-7, w5-8 ×2, w5-9 ×2, w5-11 ×2, w6-br1, w6-br2, w6-1 ×2, w6-2 ×2, w6-4 ×2, w6-5 ×2, w6-6 ×4, w6-ec11 ×3, w6-7, w6-9, w6-11 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 51 | w1-4, w1-5, w1-6, w1-7, w1-8, w1-9, w1-10, w1-11, w1-12, w1-13, w1-15, w2-1, w2-2, w2-3, w2-4, w2-5, w2-6, w2-8, w3-1, w3-2, w3-3, w3-4, w3-5, w3-7, w3-8, w3-10, w4-3, w4-4, w4-5, w4-6, w4-7, w4-9, w5-1, w5-2, w5-3, w5-4, w5-5, w5-6, w5-7, w5-8, w5-9, w5-11, w6-br1, w6-br2, w6-1, w6-2, w6-4, w6-ec11, w6-7, w6-9, w6-11 |
| audit_spell_it "And this is how we spell it." | 34 | w2-1 ×4, w2-4 ×4, w3-1 ×4, w3-4 ×3, w3-6 ×6, w5-1 ×3, w5-3 ×2, w5-6 ×3, w6-1, w6-6 ×2, w6-ec11 ×2 |
| fm_l2_way "Ninjas read this way!" | 23 | w1-wu2, w1-wu4, w1-4, w1-5, w1-7, w1-10, w1-11, w2-1, w2-3, w2-4, w3-1, w3-4, w3-5, w3-10, w4-3, w4-6, w5-1, w5-3, w5-5, w5-6, w6-1, w6-ec11, w6-9 |
| how_we_spell "This is how we spell..." | 13 | w1-2 ×3, w1-3 ×3, w1-7 ×2, w1-10 ×3, w1-11 ×2 |
| tut_speaker "Tap the speaker to hear the sound again." | 10 | w2-1 ×2, w3-4, w3-6 ×2, w5-1, w5-3 ×2, w5-6, w6-ec11 |
| dojo_hello "This is the dojo. A dojo is where ninjas practise!" | 8 | w2-1, w2-4, w3-1, w3-4, w5-1, w5-3, w5-6, w6-1 |
| audit_hear_see "We hear the sound. Now look: this is how we spell " | 7 | w1-2, w1-3, w1-10, w5-1, w5-3, w5-6, w6-1 |
| same_sound_new "Ooh! You already know this sound. Here's another w" | 7 | w3-1, w3-6, w5-3, w5-6, w6-1, w6-6, w6-ec11 |
| same_sound_diff "Same sound, different spellings!" | 7 | w3-6 ×3, w5-3, w5-6 ×3 |
| t_three_letters "It's three letters, but it's just one sound." | 6 | w5-6, w6-br2, w6-ec11, w6-7, w6-9, w6-11 |
| fm_rw_every "Every picture you play with becomes a sticker!" | 5 | w1-wu1, w1-wu2, w1-wu3, w1-wu4, w1-wu5 |
| audit_left_right "We start here, and go this way." | 5 | w1-4, w1-5, w1-7, w1-10, w1-11 |
| audit_last_place "The last sound is at the end of the word. Listen t" | 5 | w1-4, w1-5, w1-7, w1-10, w1-11 |
| audit_sort_first "Sorting time! These words have the same sound, but" | 5 | w6-br1, w6-br2, w6-2, w6-4, w6-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 4 | w6-br2, w6-2, w6-4, w6-7 |
| t_one_spelling_two_sounds "This spelling is two sounds together!" | 3 | w3-6, w3-7, w4-6 |
| audit_dojo_back "Back to the dojo! Let's learn some new sounds." | 3 | w6-3, w6-6, w6-ec11 |
| fm_speaker "And when you tap the speaker, I'll say it again!" | 2 | training ×2 |
| audit_dojo_first "This is our dojo. Here we listen to sounds, make w" | 2 | w1-4, w1-5 |
| audit_middle_place "The middle sound comes after the first sound, and " | 2 | w1-7, w1-11 |
| audit_neighbours "These sounds sit next to each other. Listen for ea" | 2 | w4-3, w4-6 |
| fm_hear_sounds_short "Slowly, I hear its sounds. Words are made of sound" | 1 | w1-wu1 |
| t_everyone_say "Say that sound with me!" | 1 | w1-wu1 |
| audit_made_of_sounds "Remember? Words are made of sounds!" | 1 | w1-wu5 |
| r2_gems_more "Look, these gems have filled a little more." | 1 | w1-12 |
| audit_sort_three "This sound can be spelt in three ways." | 1 | w6-br1 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 1 | w6-8 |
