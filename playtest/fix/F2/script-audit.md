# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/F2/perfect-cp/continuous-perfect.json (perfect, one continuous page)

531 Sensei lines, 460 sounds and words, 417 utterances in 63 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_q | 24 | Which one starts with... |
| say_sounds_read | 17 | Say the sounds, and read the word. |
| how_we_spell | 15 | This is how we spell... |
| ido | 13 | Watch me first! |
| wedo | 13 | Let's do it together! |
| youdo | 13 | Now it's your turn! |
| map_hint | 12 | Tap the glowing stone to start your next adventure. |
| first_sound_q | 12 | What's the first sound? |
| last_sound_q | 12 | What's the last sound? |
| yay_7 | 11 | You did it! |
| world_1 | 11 | Welcome to Bamboo Village! |
| yay_4 | 8 | Well done. |
| yay_8 | 7 | Wow, great listening! |
| yay_2 | 7 | Super! |
| fm_show_me | 6 | Let me show you! |
| fm_rw_more | 6 | More stickers for your Sticker Book! |
| find_q | 6 | Find this sound... |
| tv_yay_lovely | 6 | Lovely! |
| hunt_q | 6 | Which one has this sound in it? |
| swap_make | 6 | Change it to make... |
| what_changed | 6 | What changed? Listen here. |
| tv_here_sound | 5 | Here's the sound... |
| build_ido_1 | 5 | I say the word... |
| build_ido_2 | 5 | I say it slowly... |
| build_ido_3 | 5 | Now I find each sound, one at a time. |
| tv_yay_thats_it | 5 | That's it! |
| next_sound_q | 5 | What's the next sound? |
| yay_1 | 4 | Brilliant! |
| read_intro | 4 | Who read it right? Listen to Kai and Suki! |
| read_tap_sounds | 4 | Tap each sound, and say it. |

### Echoes: the same utterance shape back to back (1)

- dojo welcome @92.2s ×2: And when you tap the speaker, I'll say it again! ‖ And when you tap the speaker, I'll say it again!

### Near repeats: the same line again within 15 s (41)

| Line | Repeats | Text | Example |
|---|---|---|---|
| first_q | 20 | Which one starts with... | level w1-2 @483.9s and @497.0s |
| how_we_spell | 5 | This is how we spell... | level w1-2 @515.0s and @528.6s |
| swap_make | 4 | Change it to make... | level w1-8 @1287.1s and @1301.2s |
| what_changed | 4 | What changed? Listen here. | level w1-8 @1292.8s and @1305.9s |
| find_q | 3 | Find this sound... | level w1-2 @555.5s and @560.0s |
| fm_speaker | 1 | And when you tap the speaker, I'll say it again! | dojo welcome @92.2s and @96.3s |
| fm_pair_fish_dog | 1 | Fish dog! | level (first minutes) @213.1s and @224.9s |
| fm_which_pic | 1 | Which picture is it? | level w1-wu3 @337.1s and @346.6s |
| say_sounds_read | 1 | Say the sounds, and read the word. | level w1-4 @852.3s and @867.1s |
| swap_pick | 1 | Now pick the new sound. | level w1-8 @1323.5s and @1338.3s |

### Spliced utterances: 87 of 417 (21%); chains of 5+ clips: 46

Commonest spliced shapes:

- ×5 W + ‹build_ido_2›
- ×4 ‹find_q› + /X/
- ×4 ‹ido› + ‹build_ido_1›
- ×3 ‹first_q› + /X/
- ×2 ‹fs_apple› + /X/
- ×2 ‹read_who› + ‹kai_says› + W + ‹suki_says› + W
- ×1 ‹fm_show_me_2› + ‹fm_fast_sun› + ‹fm_slow› + W + ‹fm_same_word› + ‹fm_hear_sounds_short› + ‹fm_tap_tortoise›
- ×1 ‹fm_first_listen› + W + W + ‹fm_notice_sun_sock› + /X/ + ‹t_everyone_say› + /X/
- ×1 ‹fm_name_sausage› + ‹fm_name_moon› + ‹fm_show_me› + ‹fm_tap_all_start› + /X/ + W + ‹fm_you_try_2›
- ×1 ‹fm_found_both› + /X/ + ‹fm_l1_done› + ‹fm_rw_look›
- ×1 ‹fm_rw_shiny› + ‹fm_rw2_s› + /X/
- ×1 ‹fm_rw2_petal› + ‹audit_petal_means› + /X/
- ×1 W + ‹fm_slow› + W + ‹fm_tap_tortoise›
- ×1 ‹fm_name_van› + ‹fm_name_bag› + ‹fm_show_me_2› + ‹fm_slow_listen› + W + ‹fm_which_pic›
- ×1 W + W + ‹fm_you_try› + ‹fm_slow_another› + W + ‹fm_which_pic›

Longest chains:

- level w1-7 @1127.7s (11 clips): Pin has this sound in the middle... /i/ This is how we spell... /i/ Let's do it together! This is a tap. This is a tin. Which one has this sound in it? /i/ "tin" (slowly) "tap" (slowly)
- level w1-7 @1143.4s (11 clips): Tin has this sound in the middle... /i/ This is how we spell... /i/ Now it's your turn! This is a mat. This is a lid. Which one has this sound in it? /i/ "lid" (slowly) "mat" (slowly)
- level w1-11 @1758.7s (11 clips): Mop has this sound in the middle... /o/ This is how we spell... /o/ Let's do it together! This is a top. This is a tap. Which one has this sound in it? /o/ "top" (slowly) "tap" (slowly)
- level w1-11 @1776.2s (11 clips): Top has this sound in the middle... /o/ This is how we spell... /o/ Now it's your turn! This is a cat. This is a cot. Which one has this sound in it? /o/ "cot" (slowly) "cat" (slowly)
- level w1-2 @471.4s (9 clips): Map starts with... /m/ We hear the sound. Now look: this is how we spell it. /m/ Let's do it together! This is a mat. This is a bed. Which one starts with... /m/
- level w1-2 @486.9s (9 clips): Mat starts with... /m/ This is how we spell... /m/ Now it's your turn! This is a cup. This is a man. Which one starts with... /m/
- level w1-2 @512.4s (9 clips): Sun starts with... /s/ This is how we spell... /s/ Let's do it together! This is a web. This is some sand. Which one starts with... /s/
- level w1-2 @526.0s (9 clips): Sand starts with... /s/ This is how we spell... /s/ Now it's your turn! This is a sock. This is a bus. Which one starts with... /s/

### Praise: 54 lines (1.7 a minute); stacked (2+ within 5 s): 8

- level (first minutes) @173.9s: "You found them both! They both start with..." → "You can hear the sounds in words. Brilliant listening!"
- level w1-wu3 @389.1s: "You found them all!" → "You can hear the sounds in words. Brilliant listening!"
- reward @567.3s: "You did it!" → "You won back some sounds!"
- reward @739.6s: "You did it!" → "You won back some sounds!"
- level w1-7 @1237.9s: "Well done." → "You did it!" → "You won back a sound!"
- level w1-8 @1368.3s: "Super!" → "You fixed them all!" → "You did it!"
- reward @1698.4s: "You did it!" → "You won back some sounds!"
- level w1-11 @1876.3s: "Well done." → "You did it!"

### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 9

- intro film @57.5s: "I am Sensei Maple. I will train you. Now, choose your ninja!" cut after 0.6 of 5.4 s by Great choice!
- map @644.2s: "Tap the glowing stone to start your next adventure." cut after 2.1 of 3.3 s by Every word starts with a sound. Let's listen for t
- level w1-8 @1296.9s: "Yes, the first sound changes! Now pick the new sound." cut after 0.2 of 4.2 s by /s/
- level w1-8 @1309.4s: "Yes, the middle sound changes! Now pick the new sound." cut after 0.7 of 4.3 s by /s/
- level w1-8 @1323.5s: "Now pick the new sound." cut after 0.3 of 1.6 s by /s/
- level w1-8 @1338.3s: "Now pick the new sound." cut after 1.1 of 1.6 s by /m/
- level w1-8 @1353.4s: "Yes, the last sound changes! Now pick the new sound." cut after 1.3 of 3.9 s by /a/
- level w1-8 @1365.4s: "Now pick the new sound." cut after 1.3 of 1.6 s by /i/
- map @1736.5s: "Tap the glowing stone to start your next adventure." cut after 2.2 of 3.3 s by Now let's listen for a sound in the middle of a wo

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| how_we_spell "This is how we spell..." | 15 | level w1-2 ×3, level w1-3 ×4, level w1-7 ×2, level w1-10 ×4, level w1-11 ×2 |
| fm_speaker "And when you tap the speaker, I'll say it again!" | 2 | dojo welcome ×2 |
| fm_l2_way "Ninjas read this way!" | 2 | level (first minutes), level w1-4 |
| audit_last_place "The last sound is at the end of the word. Listen t" | 2 | level w1-4, level w1-5 |
| audit_middle_place "The middle sound comes after the first sound, and " | 2 | level w1-7, level w1-11 |
| fm_hear_sounds_short "Slowly, I hear its sounds. Words are made of sound" | 1 | level (first minutes) |
| t_everyone_say "Say that sound with me!" | 1 | level (first minutes) |
| fm_rw_every "Every picture you play with becomes a sticker!" | 1 | sticker book |
| audit_petal_means "This petal is for the sound..." | 1 | sticker book |
| audit_hear_see "We hear the sound. Now look: this is how we spell " | 1 | level w1-2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_dojo_first "This is our dojo. Here we listen to sounds, make w" | 1 | stone 5: w1-4 |
| audit_left_right "We start here, and go this way." | 1 | level w1-4 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w1-4 |
| audit_gem_more "Look, this gem has filled a little more." | 1 | reward |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |

## playtest/fix/F2/perfect-w6-br1/continuous-perfect-from-w6-br1.json (perfect-from-w6-br1, one continuous page)

284 Sensei lines, 561 sounds and words, 407 utterances in 60 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| t_two_letters | 24 | It's two letters, but it's one sound. |
| yay_7 | 13 | You did it! |
| world_6 | 13 | Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere! |
| fm_rw_more | 12 | More stickers for your Sticker Book! |
| yay_1 | 11 | Brilliant! |
| yay_2 | 9 | Super! |
| listen | 8 | Listen... |
| dojo_tap_say | 8 | Tap it, and say it with me! |
| same_sound_new | 8 | Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling. |
| dojo_find | 8 | Can you find... |
| tv_yay_thats_it | 8 | That's it! |
| tv_here_sound | 8 | Here's the sound... |
| help_read | 8 | Read each word, then tap the green tick. |
| audit_spell_it | 7 | And this is how we spell it. |
| yay_4 | 7 | Well done. |
| help_sort | 6 | Tap the chest with the same spelling as the word. |
| sort_done | 6 | Sorted! What a clever ninja. |
| tv_yay_lovely | 6 | Lovely! |
| yay_8 | 6 | Wow, great listening! |
| audit_sort_again | 5 | Sorting time! Same sound, different spellings. |
| audit_sort_pair | 5 | This sound can be spelt in two ways. |
| t_three_letters | 4 | It's three letters, but it's just one sound. |
| dojo_build | 4 | Now let's make words! First, listen to the word. Then tap its sounds, one at a time. |
| dojo_done | 4 | Well done! You practised so hard! |
| petals_got | 4 | You won back some sounds! |
| wf_found_sound | 4 | You found a new sound! Look, here is its petal, shining through the mist. |
| t_ways_2 | 4 | Now you know two ways to spell... |
| story_your_turn | 4 | Your turn to read. |
| well_read | 4 | Well read! |
| r2_gems_more | 3 | Look, these gems have filled a little more. |

### Echoes: the same utterance shape back to back (1)

- level w6-10 @1494.9s ×8: Read each word, then tap the green tick. ‖ Read each word, then tap the green tick. ‖ Read each word, then tap the green tick. ‖ Read each word, then tap the green tick. ‖ Read each word, then tap the green tick. ‖ Read each word, then tap the green tick. ‖ Re

### Near repeats: the same line again within 15 s (21)

| Line | Repeats | Text | Example |
|---|---|---|---|
| help_read | 7 | Read each word, then tap the green tick. | level w6-10 @1494.9s and @1507.5s |
| dojo_find | 4 | Can you find... | level w6-1 @218.5s and @221.9s |
| t_two_letters | 3 | It's two letters, but it's one sound. | level w6-2 @353.6s and @357.9s |
| listen | 2 | Listen... | level w6-6 @767.5s and @781.8s |
| audit_spell_it | 2 | And this is how we spell it. | level w6-6 @771.4s and @785.7s |
| tv_yay_thats_it | 1 | That's it! | level w6-6 @801.5s and @809.4s |
| yay_1 | 1 | Brilliant! | level w6-6 @805.8s and @820.1s |
| well_read | 1 | Well read! | level w6-10 @1590.9s and @1597.5s |

### Spliced utterances: 22 of 407 (5%); chains of 5+ clips: 38

Commonest spliced shapes:

- ×6 ‹listen› + /X/ + /X/
- ×2 ‹dojo_find› + /X/ + /X/
- ×2 ‹yay_1› + ‹listen› + /X/ + /X/
- ×2 ‹yay_2› + ‹dojo_find› + /X/ + /X/
- ×1 ‹tv_yay_thats_it› + ‹dojo_find› + /X/ + /X/
- ×1 /X/ + /X/ + /X/ + W + ‹t_this_can_be› + /X/ + ‹t_but_in_this_word› + /X/ + ‹yay_2› + W
- ×1 ‹yay_4› + ‹dojo_find› + /X/ + /X/
- ×1 ‹tv_here_sound› + /X/ + ‹tg_ee_ee_way› + ‹t_two_letters› + ‹tg_ee_ee_see›
- ×1 /X/ + ‹tg_ea_ee_way› + ‹t_two_letters› + ‹tg_ea_ee_see› + ‹t_ways_2›
- ×1 ‹battle_spell› + W
- ×1 ‹tv_yay_thats_it› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×1 ‹yay_1› + ‹dojo_find› + /X/ + /X/
- ×1 ‹tv_here_sound› + /X/ + ‹tg_oa_oe_way› + ‹t_two_letters› + ‹tg_oa_oe_see›
- ×1 ‹story_question› + ‹yay_2›

Longest chains:

- level w6-1 @242.7s (10 clips): /dh/ /a/ /t/ "that" This can be... /th/ ...but in this word, it's... /dh/ Super! "nail"
- level w6-br2 @103.5s (7 clips): This sound can be spelt in two ways. /ch/ It's two letters, but it's one sound. /ch/ It's three letters, but it's just one sound. Tap the chest with the same spelling as the word. "munch"
- level w6-2 @349.8s (7 clips): This sound can be spelt in two ways. /ae/ It's two letters, but it's one sound. /ae/ It's two letters, but it's one sound. Tap the chest with the same spelling as the word. "day"
- level w6-3 @514.9s (7 clips): /l/ /o/ /k/ "lock" Wow, great listening! "seat" /s/
- level w6-4 @596.5s (7 clips): This sound can be spelt in two ways. /ee/ It's two letters, but it's one sound. /ee/ It's two letters, but it's one sound. Tap the chest with the same spelling as the word. "dream"
- level w6-6 @841.6s (7 clips): /s/ /p/ /i/ /t/ "spit" Wow, great listening! "crow"
- level w6-ec11 @1075.4s (7 clips): /s/ /n/ /ae/ /l/ "snail" Well done. "pie"
- level w6-7 @1189.0s (7 clips): This sound can be spelt in two ways. /ie/ It's three letters, but it's just one sound. /ie/ It's two letters, but it's one sound. Tap the chest with the same spelling as the word. "night"

### Praise: 68 lines (2.5 a minute); stacked (2+ within 5 s): 13

- reward @287.0s: "You did it!" → "You won back some sounds!"
- level w6-3 @470.5s: "Well done." → "Super!"
- level w6-3 @528.6s: "Well done." → "Well done! You practised so hard!"
- reward @533.8s: "You did it!" → "You won back some sounds!"
- level w6-4 @663.5s: "Sorted! What a clever ninja." → "You did it!"
- level w6-5 @746.3s: "Hooray! The monster ran away!" → "You did it!"
- level w6-6 @866.7s: "Well done." → "Well done! You practised so hard!"
- reward @871.9s: "You did it!" → "You won back some sounds!"
- level w6-ec11 @1056.9s: "Wow, great listening!" → "Super!"
- level w6-ec11 @1117.7s: "Super!" → "Well done! You practised so hard!"
- reward @1122.3s: "You did it!" → "You won back some sounds!"
- level w6-7 @1241.6s: "Sorted! What a clever ninja." → "You did it!"
- level w6-10 @1619.0s: "Super!" → "You did it!"

### Silences of 10 s or more inside a level or piece: 8

- level w6-10 @1484.7s: 10.2 s silent (0 taps) after "Tap any word and I'll help you read it.", before "Read each word, then tap the green tick."
- level w6-10 @1497.3s: 10.2 s silent (0 taps) after "Read each word, then tap the green tick.", before "Read each word, then tap the green tick."
- level w6-10 @1509.9s: 10.4 s silent (0 taps) after "Read each word, then tap the green tick.", before "Read each word, then tap the green tick."
- level w6-10 @1522.7s: 10.4 s silent (0 taps) after "Read each word, then tap the green tick.", before "Read each word, then tap the green tick."
- level w6-10 @1535.5s: 10.4 s silent (0 taps) after "Read each word, then tap the green tick.", before "Read each word, then tap the green tick."
- level w6-10 @1548.3s: 10.4 s silent (0 taps) after "Read each word, then tap the green tick.", before "Read each word, then tap the green tick."
- level w6-10 @1561.1s: 10.4 s silent (0 taps) after "Read each word, then tap the green tick.", before "Read each word, then tap the green tick."
- level w6-10 @1573.9s: 10.4 s silent (0 taps) after "Read each word, then tap the green tick.", before "Read each word, then tap the green tick."

### Cut-off clips: 19

- level w6-br2 @148.4s: ""chest"" cut after 0.3 of 0.8 s by /ch/
- level w6-1 @223.5s: "/ae/" cut after 0.1 of 0.5 s by /ae/
- level w6-1 @225.5s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 1.3 of 6.2 s by /r/
- level w6-3 @473.3s: "/ee/" cut after 0.4 of 0.7 s by /ee/
- level w6-3 @476.9s: "/ee/" cut after 0.1 of 0.7 s by /ee/
- level w6-3 @478.7s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 1.6 of 6.2 s by /s/
- level w6-3 @519.5s: ""seat"" cut after 0.1 of 0.6 s by /s/
- level w6-4 @647.0s: ""tree"" cut after 0.2 of 0.6 s by /t/
- level w6-6 @800.6s: "/oe/" cut after 0.3 of 0.6 s by /oe/
- level w6-6 @804.8s: "Tap the speaker to hear the sound again." cut after 0.2 of 2.2 s by /oe/
- level w6-6 @808.5s: "/oe/" cut after 0.1 of 0.6 s by /oe/
- level w6-6 @810.3s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 1.7 of 6.2 s by /r/
- level w6-8 @990.4s: ""crow"" cut after 0.4 of 0.7 s by /k/
- level w6-ec11 @1065.8s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 2.2 of 6.2 s by /s/
- level w6-7 @1236.7s: ""bright"" cut after 0.3 of 0.7 s by /b/
- level w6-10 @1439.4s: "Your turn to read." cut after 0.4 of 1.3 s by Well read!
- level w6-10 @1456.8s: "Your turn to read." cut after 0.8 of 1.3 s by Well read!
- level w6-10 @1597.1s: "Your turn to read." cut after 0.4 of 1.3 s by Well read!
- level w6-10 @1618.2s: "Let's think about the story..." cut after 0.8 of 2.8 s by Super!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 24 | level w6-br1, level w6-br2, level w6-1 ×2, world flower ×7, level w6-2 ×2, level w6-3 ×2, level w6-4 ×2, level w6-6 ×2, level w6-8 ×2, level w6-ec11, level w6-7, level w6-9 |
| same_sound_new "Ooh! You already know this sound. Here's another w" | 8 | level w6-1, world flower ×4, level w6-3, level w6-6, level w6-ec11 |
| audit_spell_it "And this is how we spell it." | 7 | level w6-1, level w6-3 ×2, level w6-6 ×2, level w6-ec11 ×2 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | stone 2: w6-br2, stone 4: w6-2, stone 6: w6-4, stone 9: w6-8, stone 11: w6-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| t_three_letters "It's three letters, but it's just one sound." | 4 | level w6-br2, level w6-ec11, world flower, level w6-7 |
| r2_gems_more "Look, these gems have filled a little more." | 3 | reward ×3 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| dojo_hello "This is the dojo. A dojo is where ninjas practise!" | 2 | map ×2 |
| audit_dojo_back "Back to the dojo! Let's learn some new sounds." | 2 | stone 8: w6-6, map |
| audit_sort_first "Sorting time! These words have the same sound, but" | 1 | level w6-br1 |
| audit_sort_three "This sound can be spelt in three ways." | 1 | level w6-br1 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w6-br1 |
| audit_hear_see "We hear the sound. Now look: this is how we spell " | 1 | level w6-1 |
| tut_speaker "Tap the speaker to hear the sound again." | 1 | level w6-6 |
| t_everyone_say "Say that sound with me!" | 1 | world flower |
| fm_l2_way "Ninjas read this way!" | 1 | level w6-9 |

## playtest/fix/F2/splitter-w5-1/continuous-splitter-from-w5-1.json (splitter-from-w5-1, one continuous page)

254 Sensei lines, 330 sounds and words, 246 utterances in 31 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| listen | 12 | Listen... |
| t_two_letters | 12 | It's two letters, but it's one sound. |
| dojo_tap_say | 11 | Tap it, and say it with me! |
| dojo_find | 11 | Can you find... |
| audit_spell_it | 10 | And this is how we spell it. |
| tut_speaker | 10 | Tap the speaker to hear the sound again. |
| tv_yay_thats_it | 9 | That's it! |
| yay_4 | 9 | Well done. |
| tv_here_sound | 9 | Here's the sound... |
| yay_8 | 8 | Wow, great listening! |
| yay_2 | 8 | Super! |
| same_sound_new | 8 | Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling. |
| yay_1 | 7 | Brilliant! |
| yay_7 | 6 | You did it! |
| fm_rw_more | 6 | More stickers for your Sticker Book! |
| world_5 | 6 | Welcome to Shadow Castle. Don't worry, I'm right beside you. |
| tv_yay_lovely | 5 | Lovely! |
| t_in | 5 | ...in... |
| swap_make | 5 | Change it to make... |
| swap_which | 5 | Which sound needs to change? |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| same_sound_diff | 4 | Same sound, different spellings! |
| streak_3 | 3 | Ninja power! |
| dojo_build | 3 | Now let's make words! First, listen to the word. Then tap its sounds, one at a time. |
| streak_6 | 3 | Wow! Super ninja streak! |
| tv_streak_10 | 3 | Ten in a row! Look how your ninja is glowing! |
| dojo_done | 3 | Well done! You practised so hard! |
| petals_got | 3 | You won back some sounds! |
| swap_pick | 3 | Now pick the new sound. |
| map_hint | 2 | Tap the glowing stone to start your next adventure. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (42)

| Line | Repeats | Text | Example |
|---|---|---|---|
| dojo_find | 8 | Can you find... | level w5-1 @71.6s and @76.1s |
| tut_speaker | 7 | Tap the speaker to hear the sound again. | level w5-1 @74.0s and @78.0s |
| dojo_tap_say | 4 | Tap it, and say it with me! | level w5-1 @22.9s and @36.1s |
| listen | 4 | Listen... | level w5-1 @27.4s and @39.7s |
| audit_spell_it | 4 | And this is how we spell it. | level w5-1 @30.5s and @43.5s |
| t_two_letters | 3 | It's two letters, but it's one sound. | level w5-1 @19.7s and @32.9s |
| t_in | 3 | ...in... | world flower @259.4s and @262.6s |
| swap_make | 3 | Change it to make... | level w5-4 @630.8s and @643.0s |
| swap_which | 3 | Which sound needs to change? | level w5-4 @633.0s and @644.9s |
| tv_yay_lovely | 1 | Lovely! | level w5-3 @452.8s and @466.1s |
| swap_pick | 1 | Now pick the new sound. | level w5-4 @660.1s and @671.3s |
| same_sound_diff | 1 | Same sound, different spellings! | level w5-6 @899.0s and @913.0s |

### Spliced utterances: 40 of 246 (16%); chains of 5+ clips: 34

Commonest spliced shapes:

- ×4 ‹listen› + /X/ + /X/
- ×2 ‹tv_yay_thats_it› + ‹listen› + /X/ + /X/
- ×2 ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×1 ‹yay_8› + ‹listen› + /X/ + /X/
- ×1 ‹yay_1› + ‹listen› + /X/ + /X/
- ×1 /X/ + ‹t_same_spelling_sometimes›
- ×1 /X/ + ‹st_th_moth_sometimes›
- ×1 /X/ + ‹tg_th_dh_in›
- ×1 /X/ + ‹yay_4› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×1 ‹tv_yay_thats_it› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×1 ‹streak_3› + ‹dojo_find›
- ×1 ‹yay_1› + ‹dojo_find› + /X/ + ‹yay_4›
- ×1 ‹thats› + /X/ + ‹we_need› + /X/ + ‹t_two_letters›
- ×1 /X/ + ‹t_in› + W + ‹t_and_sometimes› + /X/ + ‹t_in› + W
- ×1 /X/ + ‹st_th_moth_sometimes› + /X/ + ‹tg_th_dh_in›

Longest chains:

- level w5-1 @129.3s (10 clips): /l/ Ten in a row! Look how your ninja is glowing! /t/ /e/ /l/ "tell" It's two letters, but it's one sound. /l/ That's it! "chin"
- level w5-6 @1028.8s (9 clips): /f/ /p/ /u/ /f/ "puff" It's two letters, but it's one sound. /f/ Super! Well done! You practised so hard!
- level w5-1 @102.2s (8 clips): Wow! Super ninja streak! /b/ /e/ /n/ /ch/ "bench" Super! Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up.
- world flower @1100.3s (8 clips): /u/ ...in... "jug" ...and sometimes... /w/ ...in... "queen" Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling.
- level w5-1 @179.7s (7 clips): /r/ /u/ /sh/ "rush" Lovely! "shop" /sh/
- level w5-1 @191.8s (7 clips): Ninja power! /sh/ /o/ /p/ "shop" That's it! Well done! You practised so hard!
- world flower @258.8s (7 clips): /dh/ ...in... "this" ...and sometimes... /th/ ...in... "moth"
- level w5-3 @519.2s (7 clips): /d/ /th/ /u/ /d/ "thud" Lovely! "duck"

### Praise: 53 lines (2.8 a minute); stacked (2+ within 5 s): 9

- level w5-1 @84.9s: "Brilliant!" → "Well done."
- level w5-1 @191.8s: "Ninja power!" → "Well done! You practised so hard!"
- reward @200.6s: "You did it!" → "You won back some sounds!"
- level w5-3 @537.0s: "Well done." → "Well done! You practised so hard!"
- reward @542.2s: "You did it!" → "You won back some sounds!"
- level w5-4 @693.1s: "Super!" → "You fixed them all!" → "You did it!"
- level w5-6 @956.5s: "Super!" → "Well done."
- level w5-6 @1036.6s: "Super!" → "Well done! You practised so hard!"
- reward @1041.3s: "You did it!" → "You won back some sounds!"

### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 25

- map @4.2s: "Tap the glowing stone to start your next adventure." cut after 0.7 of 3.3 s by This is the dojo. A dojo is where ninjas practise!
- level w5-1 @24.9s: "/sh/" cut after 0.2 of 0.7 s by /sh/
- level w5-1 @51.4s: "/th/" cut after 0.2 of 0.5 s by /th/
- level w5-1 @74.0s: "Tap the speaker to hear the sound again." cut after 0.4 of 2.2 s by /sh/
- level w5-1 @78.0s: "Tap the speaker to hear the sound again." cut after 0.9 of 2.2 s by /ch/
- level w5-1 @83.2s: "Tap the speaker to hear the sound again." cut after 1.0 of 2.2 s by /th/
- level w5-1 @86.0s: "Can you find..." cut after 0.1 of 1.1 s by /dh/
- level w5-1 @88.1s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 3.2 of 6.2 s by /b/
- level w5-1 @129.3s: "/l/" cut after 0.5 of 0.8 s by Ten in a row! Look how your ninja is glowing!
- level w5-3 @434.8s: "/ng/" cut after 0.2 of 0.5 s by /ng/
- level w5-3 @455.9s: "Tap the speaker to hear the sound again." cut after 0.7 of 2.2 s by /k/
- level w5-3 @460.1s: "Tap the speaker to hear the sound again." cut after 0.6 of 2.2 s by /ng/
- level w5-3 @464.9s: "Tap the speaker to hear the sound again." cut after 0.3 of 2.2 s by /w/
- level w5-3 @467.2s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 3.4 of 6.2 s by /k/
- level w5-4 @637.6s: "Yes, the last sound changes! Now pick the new sound." cut after 0.9 of 3.9 s by /l/
- level w5-4 @648.5s: "Yes, the first sound changes! Now pick the new sound." cut after 1.1 of 4.2 s by /s/
- level w5-4 @660.1s: "Now pick the new sound." cut after 0.5 of 1.6 s by /s/
- level w5-4 @671.3s: "Now pick the new sound." cut after 0.9 of 1.6 s by Keep going, ninja.
- level w5-4 @689.3s: "Now pick the new sound." cut after 0.9 of 1.6 s by /sh/
- level w5-6 @942.0s: "Tap the speaker to hear the sound again." cut after 0.9 of 2.2 s by /k/
- level w5-6 @949.9s: "Tap the speaker to hear the sound again." cut after 0.4 of 2.2 s by /w/
- level w5-6 @954.7s: "Tap the speaker to hear the sound again." cut after 0.9 of 2.2 s by /v/
- level w5-6 @959.2s: "Tap the speaker to hear the sound again." cut after 1.2 of 2.2 s by /ch/
- level w5-6 @962.1s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 3.1 of 6.2 s by /sh/
- level w5-6 @1021.6s: ""puff"" cut after 0.1 of 0.6 s by /p/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 12 | level w5-1 ×5, world flower ×2, level w5-3 ×3, level w5-6 ×2 |
| audit_spell_it "And this is how we spell it." | 10 | level w5-1 ×3, level w5-3 ×3, level w5-6 ×4 |
| tut_speaker "Tap the speaker to hear the sound again." | 10 | level w5-1 ×3, level w5-3 ×3, level w5-6 ×4 |
| same_sound_new "Ooh! You already know this sound. Here's another w" | 8 | level w5-3, reward ×2, world flower ×4, level w5-6 |
| same_sound_diff "Same sound, different spellings!" | 4 | level w5-3, level w5-6 ×3 |
| dojo_hello "This is the dojo. A dojo is where ninjas practise!" | 2 | map ×2 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| fm_l2_way "Ninjas read this way!" | 2 | level w5-5 ×2 |
| audit_hear_see "We hear the sound. Now look: this is how we spell " | 1 | level w5-1 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w5-1 |
| audit_dojo_back "Back to the dojo! Let's learn some new sounds." | 1 | stone 6: w5-6 |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |
| t_way_we_spell "This is the way we spell..." | 1 | world flower |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C-P: playtest/fix/F2/perfect-cp/continuous-perfect.json

perfect, a brand-new child, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_1 ×11 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 10 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 0 (day one) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 9 of 12 | **FAIL** |
| `over-map` level lines started over the map | 0 | 8 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 16 (7 repeats) | **FAIL** |
| `swap-place-heard` swap place lines heard to the end | all | 0 of 3 | **FAIL** |
| `praise-rate` praise lines a minute | ≤ 1.5 | 2.04 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 14 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 6 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 12 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 18 of 18 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 9 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 32 said (10 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 29.6 s (build w1-4); 8 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 4 words; 96 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 15 said (4 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 47 said (24 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 14 | **FAIL** |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **world-welcomes**: world_1 "Welcome to Bamboo Village!" said 11 times
- **did-it-after-praise**: sticker book @7:31.2; reward @9:27.3; reward @12:19.6; reward @14:53.7; level w1-5 @17:09.5
- **map-hint-cut**: map @7:36.3 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @10:44.2 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @12:56.5 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @15:06.0 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @17:21.7 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: w1-wu3 @5:10.8 ‹fm_l1_hello› "Ninja ears on! Let's listen to some words."; w1-2 @7:38.4 ‹first_intro› "Every word starts with a sound. Let's listen for the very first sound!"; w1-4 @12:58.9 ‹audit_dojo_first› "This is our dojo. Here we listen to sounds, make words, and read them."; w1-5 @15:08.2 ‹three_sounds› "This word has three sounds!"; w1-6 @17:24.5 ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t"
- **how-we-spell**: w1-2 /s/: 2×; w1-3 /a/: 2×; w1-3 /t/: 2×; w1-7 /i/: 2×; w1-10 /n/: 2×; w1-10 /p/: 2×
- **swap-place-heard**: w1-8 @21:36.9 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w1-8 @21:49.4 ‹audit_swap_middle› "Yes, the middle sound changes! Now pick the new sound." cut; w1-8 @22:33.4 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut
- **praise-rate**: 65 praise lines in 31.8 min
- **praise-stacks**: w1-wu1 @2:53.9: "You found them both! They both start with..." → "You can hear the sounds in words. Brilliant listening!"; w1-wu3 @6:29.1: "You found them all!" → "You can hear the sounds in words. Brilliant listening!"; w1-2 @9:18.5: "Lovely!" → "Wow, great listening!"; reward @9:27.3: "You did it!" → "You won back some sounds!"; w1-3 @12:11.8: "Lovely!" → "Brilliant!"
- **line-60s**: ‹first_q› "Which one starts with..." from w1-2 @7:47.8; ‹how_we_spell› "This is how we spell..." from w1-2 @8:09.7; ‹hunt_q› "Which one has this sound in it?" from w1-7 @18:40.4; ‹swap_make› "Change it to make..." from w1-8 @21:27.1; ‹what_changed› "What changed? Listen here." from w1-8 @21:32.8; ‹swap_pick› "Now pick the new sound." from w1-8 @22:03.5
- **cut-explanations**: map @7:36.3 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @10:44.2 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @12:56.5 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @15:06.0 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @17:21.7 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @18:24.3 ‹map_hint› "Tap the glowing stone to start your next adventure."
- **unframed-turn**: tap (w1-wu1 1:47.6): no frame line (tv_ears_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Ninja ears on! Let's listen to some words." · "This is the sun."; fastslow (w1-wu1 1:54.2): no frame line (tv_ts_meet), no narrated demo, no Ready hold. Opens: "Watch me first!" · "I can say a word fast. Sun!"; notice (w1-wu1 2:22.6): no frame line (tv_notice_frame/tv_ears_on), no hand-over. Opens: "Listen to the very first sound." · "Sun and sock start with the same sound..."; tapall (w1-wu1 2:36.7): no frame line (tv_pocket_frame), no narrated demo, no Ready hold, no hand-over. Opens: "This is a sausage." · "This is the moon."; rail (w1-wu2 3:23.3): no frame line (tv_rail_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Ready for the next game? Tap the big arrow!" · "Ninjas read this way!"; which (w1-wu2 3:48.1): no frame line (tv_which_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Fish dog!" · "Watch me first!"
- **over-framed**: ‹fm_l1_hello› "Ninja ears on! Let's listen to some words." at w1-wu3 @5:10.8, again after w1-wu1 @1:39.6; ‹fm_tap_all_start› "Tap all the pictures that start with..." at w1-wu3 @6:14.8, again after w1-wu1 @2:41.3; ‹first_intro› "Every word starts with a sound. Let's listen for the very first sound!" at w1-3 @10:46.3, again after w1-2 @7:38.4; ‹fm_l2_way› "Ninjas read this way!" at w1-4 @13:14.3, again after w1-wu2 @3:23.5; ‹read_intro› "Who read it right? Listen to Kai and Suki!" at w1-5 @16:48.2, again after w1-4 @14:33.0; ‹read_intro› "Who read it right? Listen to Kai and Suki!" at w1-7 @20:18.7, again after w1-5 @16:48.2
- **bare-command**: ‹ido› "Watch me first!" ×13; ‹find_q› "Find this sound..." ×6; ‹fm_you_try› "Now you try!" ×3; ‹fm_show_me_2› "Watch me first!" ×3; ‹fm_you_try_2› "Your turn!" ×2; ‹fm_tap_sun› "Tap the sun!" ×1
- **talk-before-action**: build (w1-4) 29.6 s from ‹two_sounds› "This word has two sounds!" to ‹first_sound_q› "What's the first sound?"; soundhunt (w1-7) 26.5 s from ‹audit_middle_place› "The middle sound comes after the first sound, and before the last soun" to ‹hunt_q› "Which one has this sound in it?"; firstsound (w1-2) 22.6 s from ‹fs_man› "Man starts with..." to ‹first_q› "Which one starts with..."; firstsound (w1-2) 20.8 s from ‹ido› "Watch me first!" to ‹first_q› "Which one starts with..."; fastslow (w1-wu1) 15.5 s from ‹fm_show_me_2› "Watch me first!" to ‹fm_tap_tortoise› "Now you tap the tortoise, and say it slowly with me."; compound (w1-wu2) 15.2 s from ‹fm_pair_cat_dog› "Cat dog!" to ‹fm_starfish_q› "Star... fish. Tap the rabbit, and say them fast."
- **rhetorical-question**: ‹what_changed› "What changed? Listen here." ×6; ‹read_intro› "Who read it right? Listen to Kai and Suki!" ×4; ‹read_who› "Who read it right?" ×4; ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time." ×1
- **shouted-instruction**: ‹ido› "Watch me first!" ×13; ‹read_intro› "Who read it right? Listen to Kai and Suki!" ×4; ‹fm_you_try› "Now you try!" ×3; ‹fm_show_me_2› "Watch me first!" ×3; ‹audit_sounds_again› "Listen to the sounds, and catch the word they make!" ×3; ‹fm_l1_hello› "Ninja ears on! Let's listen to some words." ×2
- **demo-command**: w1-wu1 @1:48.3 ‹fm_tap_sun› "Tap the sun!" during ‹fm_show_me› "Let me show you!"; w1-wu1 @2:41.3 ‹fm_tap_all_start› "Tap all the pictures that start with..." during ‹fm_show_me› "Let me show you!"; w1-wu3 @5:32.8 ‹fm_slow_listen› "Listen to my slow word..." during ‹fm_show_me_2› "Watch me first!"; w1-wu3 @5:37.1 ‹fm_which_pic› "Which picture is it?" during ‹fm_show_me_2› "Watch me first!"; w1-wu3 @5:55.6 ‹fm_tap_all_in› "Tap all the pictures with this sound in them..." during ‹fm_show_me› "Let me show you!"; w1-2 @7:47.8 ‹first_q› "Which one starts with..." during ‹ido› "Watch me first!"

### C6-P: playtest/fix/F2/perfect-w6-br1/continuous-perfect-from-w6-br1.json

perfect, from w6-br1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 | 28 | **FAIL** |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 14 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 6 sounds | **FAIL** |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 2 | **FAIL** |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 4 | **FAIL** |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_6 ×13 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 12 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 1 (1 cut) | **FAIL** |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 2 | **FAIL** |
| `over-map` level lines started over the map | 0 | 10 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 3.05 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 20 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 6 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 2 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 1 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 1 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 9 said (2 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 8; 4 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 17.7 s (sort w6-br1); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 7 words (median line 6 words; 110 turns) | **FAIL** |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 2 said (2 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 13 said (5 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **letters-lines**: w6-br1 @0:19.9 ‹t_two_letters› "It's two letters, but it's one sound."; w6-br2 @1:47.0 ‹t_two_letters› "It's two letters, but it's one sound."; w6-br2 @1:50.9 ‹t_three_letters› "It's three letters, but it's just one sound."; w6-1 @3:11.1 ‹t_two_letters› "It's two letters, but it's one sound."; w6-1 @3:31.7 ‹t_two_letters› "It's two letters, but it's one sound."; world flower @5:05.8 ‹t_two_letters› "It's two letters, but it's one sound."
- **letters-60s**: w6-1 @3:31.7 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; world flower @5:27.2 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-2 @5:53.6 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-2 @5:57.9 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-3 @7:43.9 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; world flower @9:34.7 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **letters-twice**: /ch/: 2× (w6-br2 1:47.0, w6-br2 1:50.9); /ae/: 3× (w6-1 3:11.1, w6-2 5:53.6, w6-2 5:57.9); ?/: 12× (w6-1 3:31.7, world flower 5:05.8, world flower 5:27.2, w6-3 7:43.9, world flower 9:12.4, world flower 9:34.7, w6-6 13:15.4, world flower 14:54.9, world flower 15:17.2, w6-ec11 17:30.1, world flower 19:01.2, world flower 19:25.7); /ee/: 3× (w6-3 7:21.8, w6-4 10:00.5, w6-4 10:04.9); /oe/: 3× (w6-6 12:54.2, w6-8 15:43.9, w6-8 15:48.3); /ie/: 3× (w6-ec11 17:09.1, w6-7 19:52.9, w6-7 19:56.8)
- **letters-echo**: level w6-2 @5:49.8 (one breath): This sound can be spelt in two ways. /ae/ It's two letters, but it's one sound. /ae/ It's two letters, but it's one sound. Tap the chest with the same spelling as the word. "day"; level w6-4 @9:56.5 (one breath): This sound can be spelt in two ways. /ee/ It's two letters, but it's one sound. /ee/ It's two letters, but it's one sound. Tap the chest with the same spelling as the word. "dream"
- **same-sound-after-reveal**: w6-1 @3:24.8 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-3 @7:37.0 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-6 @13:08.5 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-ec11 @17:23.3 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"
- **world-welcomes**: world_6 "Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!" said 13 times
- **did-it-after-praise**: reward @1:21.0; reward @2:46.6; reward @4:47.0; reward @6:54.5; reward @8:53.8
- **speaker-tip**: w6-6 @13:24.8 cut
- **map-hint-cut**: map @0:04.3 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: w6-br1 @0:05.6 ‹audit_bridging_first› "You know this sound! Now let's look at the different ways we spell it."; w6-br2 @1:39.7 ‹audit_sort_again› "Sorting time! Same sound, different spellings."; w6-1 @2:56.6 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; w6-2 @5:46.0 ‹audit_sort_again› "Sorting time! Same sound, different spellings."; w6-4 @9:52.8 ‹audit_sort_again› "Sorting time! Same sound, different spellings."
- **praise-rate**: 83 praise lines in 27.2 min
- **praise-stacks**: w6-1 @3:37.8: "Super!" → "That's it!"; w6-1 @3:41.1: "That's it!" → "Brilliant!"; w6-1 @4:42.2: "That's it!" → "Well done! You practised so hard!"; reward @4:47.0: "You did it!" → "You won back some sounds!"; w6-3 @7:50.5: "Well done." → "Super!"
- **line-60s**: ‹t_two_letters› "It's two letters, but it's one sound." from world flower @5:05.8; ‹yay_1› "Brilliant!" from w6-3 @7:28.9; ‹yay_4› "Well done." from w6-3 @7:50.5; ‹yay_2› "Super!" from w6-ec11 @17:41.3; ‹story_your_turn› "Your turn to read." from w6-10 @23:59.4; ‹help_read› "Read each word, then tap the green tick." from w6-10 @24:54.9
- **cut-explanations**: map @0:04.3 ‹map_hint› "Tap the glowing stone to start your next adventure."; w6-6 @13:24.8 ‹tut_speaker› "Tap the speaker to hear the sound again."
- **unframed-turn**: sort (w6-br1 0:05.5): no narrated demo, no Ready hold. Opens: "Tap the glowing stone to start your next adventure" · "You know this sound! Now let's look at the differe"
- **over-framed**: ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some" at w6-3 @7:09.2, again after w6-1 @2:56.6
- **bare-command**: ‹listen› "Listen..." ×8; ‹battle_spell› "Spell..." ×1
- **bare-listen**: w6-1 @3:02.2 after dojo_hello: "Listen…" /ae/; w6-1 @3:18.3 after yay_1: "Listen…" /ae/ /ae/; w6-3 @7:14.9 after dojo_hello: "Listen…" /ee/; w6-3 @7:30.0 after yay_1: "Listen…" /ee/; w6-6 @12:47.5 after audit_dojo_back: "Listen…" /oe/; w6-6 @13:01.8 after tv_yay_lovely: "Listen…" /oe/
- **talk-before-action**: sort (w6-br1) 17.7 s from ‹audit_bridging_first› "You know this sound! Now let's look at the different ways we spell it." to ‹help_sort› "Tap the chest with the same spelling as the word."
- **turn-median**: turns under 8 words: 65 of 110
- **rhetorical-question**: ‹jump_offer› "Wow! You got everything right. Is this too easy? You can jump ahead!" ×1; ‹story:s6_3› "Why are you so grumpy, Baron? asked Super Ninja. The Baron sniffed. Nobody ever reads ME a story..." ×1
- **shouted-instruction**: ‹dojo_tap_say› "Tap it, and say it with me!" ×8; ‹audit_sounds_again› "Listen to the sounds, and catch the word they make!" ×2; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!" ×1; ‹t_everyone_say› "Say that sound with me!" ×1; ‹run_start› "Ninja Run! Tap to jump, and catch the right word!" ×1

### C5-S: playtest/fix/F2/splitter-w5-1/continuous-splitter-from-w5-1.json

splitter, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 13 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 6 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 3 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 2 | **FAIL** |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×6 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 5 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 10 (10 cut) | **FAIL** |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 2 | **FAIL** |
| `over-map` level lines started over the map | 0 | 5 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 of 2 | **FAIL** |
| `praise-rate` praise lines a minute | ≤ 1.5 | 3.77 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 16 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 14 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 13 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | 1 of 2 (50%) | **FAIL** |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 2 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 13 said (2 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 11; 3 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 4 words; 85 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 2 said (2 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 15 said (4 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **letters-60s**: w5-1 @0:32.9 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-1 @0:46.2 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-1 @2:50.5 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; world flower @3:50.3 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @7:09.6 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @7:25.9 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **same-sound-after-reveal**: w5-3 @6:48.1 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w5-6 @14:41.1 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"
- **world-welcomes**: world_5 "Welcome to Shadow Castle. Don't worry, I'm right beside you." said 6 times
- **did-it-after-praise**: reward @3:20.6; reward @6:25.3; reward @9:02.2; level w5-4 @11:36.6; reward @17:21.3
- **speaker-tip**: w5-1 @1:14.0 cut; w5-1 @1:18.0 cut; w5-1 @1:23.2 cut; w5-3 @7:35.9 cut; w5-3 @7:40.1 cut
- **map-hint-cut**: map @0:04.2 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: w5-1 @0:04.9 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; w5-2 @4:52.8 ‹audit_baron_first› "Baron Muddle hid the sounds. Let's win them back from his monsters."; w5-3 @6:37.0 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; w5-4 @10:22.9 ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so"; w5-6 @14:32.2 ‹audit_dojo_back› "Back to the dojo! Let's learn some new sounds."
- **swap-place-heard**: w5-4 @10:37.6 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut; w5-4 @10:48.5 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut
- **praise-rate**: 72 praise lines in 19.1 min
- **praise-stacks**: w5-1 @1:10.3: "Well done." → "That's it!"; w5-1 @1:15.2: "That's it!" → "Ninja power!"; w5-1 @1:24.9: "Brilliant!" → "Well done."; w5-1 @3:11.8: "Ninja power!" → "That's it!"; w5-1 @3:15.9: "That's it!" → "Well done! You practised so hard!"
- **line-60s**: ‹listen› "Listen..." from w5-1 @0:10.5; ‹t_two_letters› "It's two letters, but it's one sound." from w5-1 @0:19.7; ‹dojo_tap_say› "Tap it, and say it with me!" from w5-1 @0:22.9; ‹audit_spell_it› "And this is how we spell it." from w5-1 @0:30.5; ‹dojo_find› "Can you find..." from w5-1 @1:11.6; ‹tut_speaker› "Tap the speaker to hear the sound again." from w5-1 @1:14.0
- **cut-explanations**: map @0:04.2 ‹map_hint› "Tap the glowing stone to start your next adventure."; w5-1 @1:14.0 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-1 @1:18.0 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-1 @1:23.2 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-3 @7:35.9 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-3 @7:40.1 ‹tut_speaker› "Tap the speaker to hear the sound again."
- **split-correction**: w5-4 @11:11.9 tapped < h > for < sh >: then "Keep going, ninja." · "Listen..."
- **over-framed**: ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some" at w5-3 @6:37.0, again after w5-1 @0:04.9; ‹fm_l2_way› "Ninjas read this way!" at w5-5 @13:50.6, again after w5-5 @12:26.5
- **bare-command**: ‹listen› "Listen..." ×12; ‹battle_spell› "Spell..." ×1
- **bare-listen**: w5-1 @0:10.5 after dojo_hello: "Listen…" /sh/; w5-1 @0:27.4 after yay_8: "Listen…" /ch/ /ch/; w5-1 @0:39.7 after yay_1: "Listen…" /th/; w5-1 @0:53.0 after tv_yay_thats_it: "Listen…" /dh/ /dh/; w5-3 @6:42.6 after dojo_hello: "Listen…" /k/ /k/; w5-3 @7:03.2 after yay_8: "Listen…" /ng/ /ng/
- **rhetorical-question**: ‹jump_offer› "Wow! You got everything right. Is this too easy? You can jump ahead!" ×1; ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time." ×1
- **shouted-instruction**: ‹dojo_tap_say› "Tap it, and say it with me!" ×11; ‹audit_sounds_again› "Listen to the sounds, and catch the word they make!" ×2; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!" ×1; ‹run_start› "Ninja Run! Tap to jump, and catch the right word!" ×1

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 370 | pass |

