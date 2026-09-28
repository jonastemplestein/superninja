# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/baseline/transcripts/continuous-learner-from-w5-1.json (learner-from-w5-1, one continuous page)

382 Sensei lines, 629 sounds and words, 469 utterances in 56 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| tv_listen_here | 20 | Let's listen again. What can you hear here? |
| audit_listen_next | 18 | Let's listen again. What sound comes next? |
| listen | 14 | Listen... |
| yay_1 | 14 | Brilliant! |
| tv_yay_lovely | 13 | Lovely! |
| t_two_letters | 12 | It's two letters, but it's one sound. |
| dojo_tap_say | 11 | Tap it, and say it with me! |
| dojo_find | 11 | Can you find... |
| tv_yay_thats_it | 11 | That's it! |
| yay_8 | 11 | Wow, great listening! |
| yay_7 | 11 | You did it! |
| audit_spell_it | 10 | And this is how we spell it. |
| tut_speaker | 10 | Tap the speaker to hear the sound again. |
| world_5 | 10 | Welcome to Shadow Castle. Don't worry, I'm right beside you. |
| swap_make | 10 | Change it to make... |
| swap_which | 10 | Which sound needs to change? |
| yay_4 | 9 | Well done. |
| yay_2 | 9 | Super! |
| tv_here_sound | 9 | Here's the sound... |
| same_sound_new | 8 | Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling. |
| streak_3 | 5 | Ninja power! |
| streak_lost | 5 | Keep going, ninja. |
| t_in | 5 | ...in... |
| swap_pick | 5 | Now pick the new sound. |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| thats | 4 | That's... |
| same_sound_diff | 4 | Same sound, different spellings! |
| fm_rw_more | 4 | More stickers for your Sticker Book! |
| dojo_build | 3 | Now let's make words! First, listen to the word. Then tap its sounds, one at a time. |
| dojo_done | 3 | Well done! You practised so hard! |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (56)

| Line | Repeats | Text | Example |
|---|---|---|---|
| dojo_find | 8 | Can you find... | level w5-1 @71.8s and @76.9s |
| swap_make | 8 | Change it to make... | level w5-4 @694.4s and @704.8s |
| swap_which | 8 | Which sound needs to change? | level w5-4 @696.3s and @706.7s |
| tut_speaker | 7 | Tap the speaker to hear the sound again. | level w5-1 @74.3s and @78.9s |
| dojo_tap_say | 4 | Tap it, and say it with me! | level w5-1 @23.0s and @35.7s |
| listen | 4 | Listen... | level w5-1 @27.0s and @39.4s |
| audit_spell_it | 4 | And this is how we spell it. | level w5-1 @30.1s and @43.2s |
| t_two_letters | 3 | It's two letters, but it's one sound. | level w5-1 @19.8s and @32.5s |
| t_in | 3 | ...in... | world flower @268.0s and @270.9s |
| swap_pick | 3 | Now pick the new sound. | level w5-4 @723.5s and @735.0s |
| same_sound_diff | 1 | Same sound, different spellings! | level w5-6 @1061.4s and @1075.7s |
| yay_4 | 1 | Well done. | level w5-6 @1110.4s and @1123.7s |
| story_your_turn | 1 | Your turn to read. | level w5-10 @1710.2s and @1717.6s |
| well_read | 1 | Well read! | level w5-10 @1710.2s and @1718.3s |

### Spliced utterances: 49 of 469 (10%); chains of 5+ clips: 55

Commonest spliced shapes:

- ×7 ‹listen› + /X/ + /X/
- ×4 ‹swap_make› + W + ‹swap_which›
- ×3 W + ‹yay_2› + ‹swap_make› + W + ‹swap_which›
- ×2 ‹yay_4› + ‹listen› + /X/ + /X/
- ×2 ‹yay_8› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×2 ‹this_is› + W + ‹swap_make›
- ×1 ‹yay_1› + ‹listen› + /X/ + /X/
- ×1 /X/ + ‹t_same_spelling_sometimes›
- ×1 /X/ + ‹st_th_moth_sometimes›
- ×1 /X/ + ‹tg_th_dh_in›
- ×1 ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×1 ‹tv_yay_thats_it› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×1 ‹streak_3› + ‹dojo_find› + /X/ + ‹tut_speaker›
- ×1 ‹streak_lost› + ‹thats› + /X/ + ‹listen› + /X/ + /X/
- ×1 ‹tv_yay_lovely› + ‹dojo_find› + /X/

Longest chains:

- level w5-1 @182.6s (9 clips): /d/ /r/ /e/ /s/ "dress" It's two letters, but it's one sound. /s/ Super! "thin"
- level w6-br1 @1981.9s (9 clips): You know this sound! Now let's look at the different ways we spell it. Sorting time! These words have the same sound, but it's spelt in different ways. This sound can be spelt in three ways. /k/ /k/ /k/ It's two letters, but it's one sound. Tap the chest with the s
- world flower @264.5s (8 clips): The same spelling can sometimes be... /dh/ ...in... "then" ...and sometimes... /th/ ...in... "thin"
- level w5-3 @586.3s (8 clips): /s/ /t/ /r/ /o/ /ng/ "strong" That's it! "am"
- level w5-6 @1159.2s (8 clips): /k/ /w/ /i/ /s/ /k/ "whisk" Super! "clock"
- level w5-1 @135.9s (7 clips): /n/ /dh/ /e/ /n/ "then" Lovely! "lunch"
- level w5-1 @159.4s (7 clips): /l/ /u/ /n/ /ch/ "lunch" That's it! "dress"
- level w5-2 @328.3s (7 clips): "thump" /p/ /th/ /u/ /m/ /p/ "thump"

### Praise: 79 lines (2.3 a minute); stacked (2+ within 5 s): 7

- level w5-1 @209.6s: "Wow, great listening!" → "Well done! You practised so hard!"
- reward @215.8s: "You did it!" → "You won back some sounds!"
- reward @609.1s: "You did it!" → "You won back some sounds!"
- level w5-6 @1119.0s: "Brilliant!" → "Well done."
- level w5-6 @1226.9s: "Brilliant!" → "Well done! You practised so hard!"
- reward @1231.8s: "You did it!" → "You won back some sounds!"
- level w6-br1 @2052.7s: "Sorted! What a clever ninja." → "You did it!"

### Silences of 10 s or more inside a level or piece: 1

- level w5-4 @746.4s: 119.6 s silent (2 taps) after "Now pick the new sound.", before "/k/ /i/ /ng/ "king""

### Cut-off clips: 40

- level w5-1 @25.0s: "/sh/" cut after 0.1 of 0.7 s by /sh/
- level w5-1 @74.3s: "Tap the speaker to hear the sound again." cut after 0.9 of 2.2 s by /sh/
- level w5-1 @78.9s: "Tap the speaker to hear the sound again." cut after 1.4 of 2.2 s by /ch/
- level w5-1 @84.7s: "Tap the speaker to hear the sound again." cut after 1.0 of 2.2 s by Keep going, ninja.
- level w5-1 @89.0s: "/th/" cut after 0.2 of 0.5 s by /th/
- level w5-1 @91.0s: "Can you find..." cut after 0.4 of 1.1 s by /dh/
- level w5-1 @93.0s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 2.8 of 6.2 s by /d/
- level w5-1 @104.8s: "Let's listen again. What can you hear here?" cut after 2.0 of 2.7 s by /sh/
- level w5-1 @174.3s: ""dress" (slowly)" cut after 0.3 of 1.8 s by /r/
- level w5-3 @491.9s: "Tap the speaker to hear the sound again." cut after 0.6 of 2.2 s by Keep going, ninja.
- level w5-3 @500.0s: "Tap the speaker to hear the sound again." cut after 0.7 of 2.2 s by /ng/
- level w5-3 @505.4s: "Tap the speaker to hear the sound again." cut after 0.6 of 2.2 s by /w/
- level w5-3 @508.0s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 3.1 of 6.2 s by Let's listen again. What can you hear here?
- level w5-3 @532.3s: ""cash"" cut after 0.3 of 0.6 s by /k/
- level w5-3 @568.7s: ""strong"" cut after 0.3 of 0.7 s by /s/
- level w5-3 @601.2s: ""am" (slowly)" cut after 0.1 of 0.9 s by /m/
- level w5-4 @699.7s: "Yes, the first sound changes! Now pick the new sound." cut after 1.1 of 4.2 s by /f/
- level w5-4 @710.8s: "Yes, the last sound changes! Now pick the new sound." cut after 1.5 of 3.9 s by /f/
- level w5-4 @723.5s: "Now pick the new sound." cut after 0.6 of 1.6 s by /w/
- level w5-4 @735.0s: "Now pick the new sound." cut after 0.7 of 1.6 s by /w/
- level w5-6 @1103.4s: "Tap the speaker to hear the sound again." cut after 0.9 of 2.2 s by /k/
- level w5-6 @1108.7s: "Tap the speaker to hear the sound again." cut after 0.8 of 2.2 s by /w/
- level w5-6 @1114.2s: "Tap the speaker to hear the sound again." cut after 0.4 of 2.2 s by Keep going, ninja.
- level w5-6 @1117.7s: "Listen..." cut after 0.5 of 0.8 s by /v/
- level w5-6 @1122.1s: "Tap the speaker to hear the sound again." cut after 1.3 of 2.2 s by /ch/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 12 | level w5-1 ×4, world flower ×2, level w5-3 ×3, level w5-6 ×2, level w6-br1 |
| audit_spell_it "And this is how we spell it." | 10 | level w5-1 ×3, level w5-3 ×3, level w5-6 ×4 |
| tut_speaker "Tap the speaker to hear the sound again." | 10 | level w5-1 ×3, level w5-3 ×3, level w5-6 ×4 |
| same_sound_new "Ooh! You already know this sound. Here's another w" | 8 | level w5-3, reward ×2, world flower ×4, level w5-6 |
| same_sound_diff "Same sound, different spellings!" | 4 | level w5-3, level w5-6 ×3 |
| dojo_hello "This is the dojo. A dojo is where ninjas practise!" | 2 | stone 1: w5-1, map |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| audit_hear_see "We hear the sound. Now look: this is how we spell " | 1 | level w5-1 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w5-1 |
| audit_dojo_back "Back to the dojo! Let's learn some new sounds." | 1 | map |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |
| t_way_we_spell "This is the way we spell..." | 1 | world flower |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |
| audit_sort_first "Sorting time! These words have the same sound, but" | 1 | level w6-br1 |
| audit_sort_three "This sound can be spelt in three ways." | 1 | level w6-br1 |

## playtest/fix/baseline/transcripts/continuous-learner-from-w6-br1.json (learner-from-w6-br1, one continuous page)

319 Sensei lines, 583 sounds and words, 420 utterances in 60 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| t_two_letters | 24 | It's two letters, but it's one sound. |
| yay_7 | 13 | You did it! |
| world_6 | 13 | Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere! |
| tv_listen_here | 13 | Let's listen again. What can you hear here? |
| tv_yay_thats_it | 11 | That's it! |
| audit_listen_next | 11 | Let's listen again. What sound comes next? |
| listen | 10 | Listen... |
| yay_8 | 9 | Wow, great listening! |
| fm_rw_more | 8 | More stickers for your Sticker Book! |
| dojo_tap_say | 8 | Tap it, and say it with me! |
| same_sound_new | 8 | Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling. |
| tv_yay_lovely | 8 | Lovely! |
| dojo_find | 8 | Can you find... |
| tut_speaker | 8 | Tap the speaker to hear the sound again. |
| tv_here_sound | 8 | Here's the sound... |
| audit_spell_it | 7 | And this is how we spell it. |
| yay_4 | 7 | Well done. |
| yay_2 | 7 | Super! |
| help_sort | 6 | Tap the chest with the same spelling as the word. |
| streak_3 | 6 | Ninja power! |
| sort_done | 6 | Sorted! What a clever ninja. |
| streak_lost | 6 | Keep going, ninja. |
| streak_6 | 5 | Wow! Super ninja streak! |
| audit_sort_again | 5 | Sorting time! Same sound, different spellings. |
| audit_sort_pair | 5 | This sound can be spelt in two ways. |
| tv_streak_10 | 5 | Ten in a row! Look how your ninja is glowing! |
| t_three_letters | 4 | It's three letters, but it's just one sound. |
| dojo_build | 4 | Now let's make words! First, listen to the word. Then tap its sounds, one at a time. |
| dojo_done | 4 | Well done! You practised so hard! |
| petals_got | 4 | You won back some sounds! |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (21)

| Line | Repeats | Text | Example |
|---|---|---|---|
| dojo_find | 4 | Can you find... | level w6-1 @239.3s and @244.9s |
| tut_speaker | 4 | Tap the speaker to hear the sound again. | level w6-1 @241.6s and @247.2s |
| t_two_letters | 3 | It's two letters, but it's one sound. | level w6-2 @425.7s and @430.0s |
| listen | 3 | Listen... | level w6-3 @510.4s and @524.5s |
| audit_spell_it | 3 | And this is how we spell it. | level w6-3 @514.5s and @528.6s |
| story_your_turn | 2 | Your turn to read. | level w6-10 @1736.3s and @1750.2s |
| well_read | 2 | Well read! | level w6-10 @1736.7s and @1750.5s |

### Spliced utterances: 20 of 420 (5%); chains of 5+ clips: 41

Commonest spliced shapes:

- ×5 ‹listen› + /X/ + /X/
- ×3 ‹yay_8› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×1 ‹tv_yay_thats_it› + ‹listen› + /X/ + /X/
- ×1 ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×1 ‹t_ways_2› + /X/
- ×1 ‹tv_yay_lovely› + ‹listen› + /X/
- ×1 ‹tv_yay_thats_it› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×1 ‹battle_spell› + W
- ×1 ‹tv_yay_lovely› + ‹dojo_find› + /X/ + ‹tut_speaker› + ‹thats›
- ×1 /X/ + ‹listen› + /X/
- ×1 ‹yay_1› + ‹listen› + /X/ + /X/
- ×1 ‹tv_yay_thats_it› + ‹dojo_find› + /X/ + ‹tut_speaker› + ‹streak_lost›
- ×1 ‹thats› + /X/ + ‹listen› + /X/
- ×1 ‹yay_2› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/

Longest chains:

- level w6-9 @1546.6s (11 clips): Listen to the sounds. What word do they make? /s/ /p/ /r/ /ae/ /s/ /p/ /r/ /ae/ "spray" Wow, great listening!
- level w6-3 @638.3s (9 clips): /f/ /o/ /ks/ "fox" This spelling is two sounds together! /k/ /s/ Well done. Well done! You practised so hard!
- level w6-1 @265.0s (8 clips): /sh/ /o/ /p/ "shop" It's two letters, but it's one sound. /sh/ Wow, great listening! "tail"
- level w6-ec11 @1328.9s (8 clips): /b/ /r/ /ie/ /t/ "bright" Well done. "tail" /t/
- level w6-ec11 @1341.5s (8 clips): Ninja power! /t/ /ae/ /l/ "tail" That's it! "leaf" /l/
- level w6-br2 @114.7s (7 clips): This sound can be spelt in two ways. /ch/ It's two letters, but it's one sound. /ch/ It's three letters, but it's just one sound. Tap the chest with the same spelling as the word. "patch"
- level w6-1 @287.5s (7 clips): /l/ /t/ /ae/ /l/ "tail" That's it! "say"
- level w6-1 @341.5s (7 clips): /s/ /n/ /ae/ /l/ "snail" Well done. Well done! You practised so hard!

### Praise: 70 lines (2.4 a minute); stacked (2+ within 5 s): 7

- level w6-br2 @180.7s: "Sorted! What a clever ninja." → "You did it!"
- level w6-1 @346.3s: "Well done." → "Well done! You practised so hard!"
- reward @351.5s: "You did it!" → "You won back some sounds!"
- level w6-3 @645.9s: "Well done." → "Well done! You practised so hard!"
- reward @651.1s: "You did it!" → "You won back some sounds!"
- reward @1079.1s: "You did it!" → "You won back some sounds!"
- level w6-ec11 @1379.3s: "Super!" → "Well done! You practised so hard!" → "You did it!"

### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 35

- level w6-br1 @82.9s: ""cub"" cut after 0.3 of 0.7 s by /k/
- level w6-br2 @150.3s: ""rich"" cut after 0.2 of 0.6 s by /r/
- level w6-1 @241.6s: "Tap the speaker to hear the sound again." cut after 1.0 of 2.2 s by /ae/
- level w6-1 @247.2s: "Tap the speaker to hear the sound again." cut after 1.0 of 2.2 s by /ae/
- level w6-1 @250.3s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 2.8 of 6.2 s by Keep going, ninja.
- level w6-1 @254.8s: "Let's listen again. What can you hear here?" cut after 1.9 of 2.7 s by /sh/
- level w6-1 @280.0s: ""tail"" cut after 0.3 of 0.6 s by /t/
- level w6-1 @315.9s: ""stay"" cut after 0.3 of 0.6 s by /t/
- level w6-2 @463.9s: ""day"" cut after 0.2 of 0.6 s by /d/
- level w6-3 @522.5s: "/ee/" cut after 0.2 of 0.7 s by /ee/
- level w6-3 @548.5s: "Tap the speaker to hear the sound again." cut after 0.6 of 2.2 s by /ee/
- level w6-3 @554.1s: "Tap the speaker to hear the sound again." cut after 0.3 of 2.2 s by /ee/
- level w6-3 @556.3s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 3.2 of 6.2 s by Keep going, ninja.
- level w6-3 @561.2s: "Let's listen again. What sound comes next?" cut after 1.9 of 3.1 s by /t/
- level w6-3 @599.0s: ""seat"" cut after 0.3 of 0.6 s by /ee/
- level w6-3 @636.0s: "Let's listen to the word again, slowly." cut after 1.8 of 3.2 s by /ks/
- level w6-6 @966.9s: "/oe/" cut after 0.3 of 0.6 s by /oe/
- level w6-6 @971.4s: "Tap the speaker to hear the sound again." cut after 0.3 of 2.2 s by That's...
- level w6-6 @980.0s: "Tap the speaker to hear the sound again." cut after 0.4 of 2.2 s by /oe/
- level w6-6 @982.0s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 2.9 of 6.2 s by /t/
- level w6-6 @991.4s: ""toast"" cut after 0.3 of 0.9 s by /oe/
- level w6-6 @1028.0s: ""snow"" cut after 0.2 of 0.8 s by /s/
- level w6-6 @1063.5s: ""rain"" cut after 0.3 of 0.7 s by /r/
- level w6-ec11 @1250.9s: "/ie/" cut after 0.2 of 0.6 s by /ie/
- level w6-ec11 @1276.3s: "Tap the speaker to hear the sound again." cut after 0.6 of 2.2 s by Keep going, ninja.

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 24 | level w6-br1, level w6-br2, level w6-1 ×3, world flower ×7, level w6-2 ×2, level w6-3 ×2, level w6-4 ×2, level w6-6 ×2, level w6-8 ×2, level w6-ec11, level w6-7 |
| same_sound_new "Ooh! You already know this sound. Here's another w" | 8 | level w6-1, world flower ×4, level w6-3, level w6-6, level w6-ec11 |
| tut_speaker "Tap the speaker to hear the sound again." | 8 | level w6-1 ×2, level w6-3 ×2, level w6-6 ×2, level w6-ec11 ×2 |
| audit_spell_it "And this is how we spell it." | 7 | level w6-1, level w6-3 ×2, level w6-6 ×2, level w6-ec11 ×2 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | stone 2: w6-br2, stone 4: w6-2, stone 6: w6-4, stone 9: w6-8, stone 11: w6-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| t_three_letters "It's three letters, but it's just one sound." | 4 | level w6-br2, level w6-ec11, world flower, level w6-7 |
| audit_gem_more "Look, this gem has filled a little more." | 3 | reward ×3 |
| dojo_hello "This is the dojo. A dojo is where ninjas practise!" | 2 | stone 3: w6-1, map |
| audit_dojo_back "Back to the dojo! Let's learn some new sounds." | 2 | map ×2 |
| audit_sort_first "Sorting time! These words have the same sound, but" | 1 | level w6-br1 |
| audit_sort_three "This sound can be spelt in three ways." | 1 | level w6-br1 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w6-br1 |
| audit_hear_see "We hear the sound. Now look: this is how we spell " | 1 | level w6-1 |
| t_one_spelling_two_sounds "This spelling is two sounds together!" | 1 | level w6-3 |
| t_everyone_say "Say that sound with me!" | 1 | world flower |
| fm_l2_way "Ninjas read this way!" | 1 | level w6-9 |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |

## playtest/fix/baseline/transcripts/continuous-learner.json (learner, one continuous page)

502 Sensei lines, 471 sounds and words, 429 utterances in 59 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_q | 17 | Which one starts with... |
| say_sounds_read | 14 | Say the sounds, and read the word. |
| map_hint | 13 | Tap the glowing stone to start your next adventure. |
| world_1 | 12 | Welcome to Bamboo Village! |
| first_sound_q | 11 | What's the first sound? |
| last_sound_q | 11 | What's the last sound? |
| yay_7 | 9 | You did it! |
| how_we_spell | 9 | This is how we spell... |
| yay_2 | 9 | Super! |
| fm_show_me | 8 | Let me show you! |
| fm_which_pic | 8 | Which picture is it? |
| ido | 8 | Watch me first! |
| wedo | 8 | Let's do it together! |
| youdo | 8 | Now it's your turn! |
| listen_again | 7 | Listen again. |
| fm_rw_more | 6 | More stickers for your Sticker Book! |
| yay_8 | 6 | Wow, great listening! |
| swap_make | 6 | Change it to make... |
| what_changed | 6 | What changed? Listen here. |
| yay_4 | 5 | Well done. |
| read_tap_sounds | 5 | Tap each sound, and say it. |
| read_who | 5 | Who read it right? |
| kai_says | 5 | Kai says... |
| suki_says | 5 | Suki says... |
| next_sound_q | 5 | What's the next sound? |
| fm_you_try | 4 | Now you try! |
| streak_6 | 4 | Wow! Super ninja streak! |
| find_q | 4 | Find this sound... |
| streak_lost | 4 | Keep going, ninja. |
| fm_l1_hello | 3 | Ninja ears on! Let's listen to some words. |

### Echoes: the same utterance shape back to back (1)

- dojo welcome @116.4s ×2: And when you tap the speaker, I'll say it again! ‖ And when you tap the speaker, I'll say it again!

### Near repeats: the same line again within 15 s (37)

| Line | Repeats | Text | Example |
|---|---|---|---|
| first_q | 13 | Which one starts with... | level w1-2 @779.6s and @792.7s |
| fm_which_pic | 5 | Which picture is it? | level w1-wu3 @390.3s and @399.8s |
| what_changed | 4 | What changed? Listen here. | level w1-8 @1777.0s and @1789.9s |
| how_we_spell | 3 | This is how we spell... | level w1-2 @810.1s and @821.6s |
| swap_make | 3 | Change it to make... | level w1-8 @1772.3s and @1785.1s |
| find_q | 2 | Find this sound... | level w1-2 @853.4s and @861.9s |
| fm_speaker | 1 | And when you tap the speaker, I'll say it again! | dojo welcome @116.4s and @122.1s |
| fm_tap_sock | 1 | Tap the sock! | level (first minutes) @136.6s and @142.3s |
| fm_which_cat_dog | 1 | Listen. Cat... dog. Which one did I read? | level (first minutes) @272.6s and @281.4s |
| say_sounds_read | 1 | Say the sounds, and read the word. | level w1-7 @1609.4s and @1623.6s |
| first_sound_q | 1 | What's the first sound? | level w1-7 @1616.7s and @1629.8s |
| suki_says | 1 | Suki says... | level w1-7 @1682.9s and @1697.6s |
| swap_pick | 1 | Now pick the new sound. | level w1-8 @1793.4s and @1808.1s |

### Spliced utterances: 66 of 429 (15%); chains of 5+ clips: 48

Commonest spliced shapes:

- ×4 ‹find_q› + /X/
- ×3 ‹read_who› + ‹suki_says› + W + ‹kai_says› + W
- ×3 ‹swap_make› + W + W
- ×2 ‹fs_tap› + /X/
- ×2 W + ‹build_ido_2› + W
- ×2 ‹read_who› + ‹kai_says› + W + ‹suki_says› + W
- ×2 ‹ido› + ‹build_ido_1›
- ×1 W + ‹fm_show_me_2› + ‹fm_fast_sun› + ‹fm_slow› + W + ‹fm_same_word› + ‹fm_hear_sounds_short› + ‹fm_tap_tortoise›
- ×1 ‹fm_first_listen› + W + W + ‹fm_notice_sun_sock› + /X/ + ‹t_everyone_say› + /X/
- ×1 ‹fm_name_sausage› + ‹fm_name_moon› + ‹fm_show_me› + ‹fm_tap_all_start› + /X/ + W + ‹fm_you_try_2›
- ×1 ‹fm_found_both› + /X/ + ‹fm_l1_done›
- ×1 ‹fm_rw_shiny› + ‹fm_rw2_s› + /X/
- ×1 ‹fm_rw2_petal› + ‹audit_petal_means› + /X/
- ×1 W + ‹fm_slow› + W + ‹fm_tap_tortoise›
- ×1 ‹fm_name_van› + ‹fm_name_bag› + ‹fm_show_me_2› + ‹fm_slow_listen› + W + ‹fm_which_pic›

Longest chains:

- level w1-7 @1502.4s (11 clips): Pin has this sound in the middle... /i/ This is how we spell... /i/ Let's do it together! This is a tin. This is a tap. Which one has this sound in it? /i/ "tin" (slowly) "tap" (slowly)
- level w1-2 @767.1s (9 clips): Man starts with... /m/ We hear the sound. Now look: this is how we spell it. /m/ Let's do it together! This is a mug. This is some jam. Which one starts with... /m/
- level w1-3 @1018.6s (9 clips): Top starts with... /t/ This is how we spell... /t/ Now it's your turn! This is some jam. This is a tap. Which one starts with... /t/
- level (first minutes) @125.3s (8 clips): Ninja ears on! Let's listen to some words. This is the sun. This is a sock. This is a cat. Let me show you! Tap the sun! Now you try! Tap the sock!
- level (first minutes) @144.7s (8 clips): "sock" Watch me first! I can say a word fast. Sun! Or I can say it slowly... "sun" (slowly) Fast or slow, it's the same word. Sun! Slowly, I hear its sounds. Words are made of sounds! Now you tap the tortoise, and say it slowly with me.
- level w1-2 @807.7s (8 clips): Sit starts with... /s/ This is how we spell... /s/ Let's do it together! This is a sock. Which one starts with... /s/
- level w1-2 @819.3s (8 clips): Sock starts with... /s/ This is how we spell... /s/ Wow! Super ninja streak! Now it's your turn! This is a web. This is some sand.
- level w1-3 @986.2s (8 clips): Ant starts with... /a/ This is how we spell... /a/ Now it's your turn! This is a web. Which one starts with... /a/

### Praise: 55 lines (1.7 a minute); stacked (2+ within 5 s): 5

- level (first minutes) @205.1s: "You found them both! They both start with..." → "You can hear the sounds in words. Brilliant listening!"
- reward @869.2s: "You did it!" → "You won back some sounds!"
- reward @1064.4s: "You did it!" → "You won back some sounds!"
- reward @1708.6s: "You did it!" → "You won back a sound!"
- level w1-8 @1837.0s: "Super!" → "You fixed them all!"

### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 10

- map @751.9s: "Tap the glowing stone to start your next adventure." cut after 2.0 of 3.3 s by Every word starts with a sound. Let's listen for t
- map @959.7s: "Tap the glowing stone to start your next adventure." cut after 2.0 of 3.3 s by Every word starts with a sound. Let's listen for t
- map @1107.3s: "Tap the glowing stone to start your next adventure." cut after 2.1 of 3.3 s by This is our dojo. Here we listen to sounds, make w
- map @1479.9s: "Tap the glowing stone to start your next adventure." cut after 2.0 of 3.3 s by Now let's listen for a sound in the middle of a wo
- level w1-8 @1764.5s: "Yes, the first sound changes! Now pick the new sound." cut after 1.1 of 4.2 s by /s/
- level w1-8 @1780.5s: "Yes, the middle sound changes! Now pick the new sound." cut after 0.7 of 4.3 s by /s/
- level w1-8 @1793.4s: "Now pick the new sound." cut after 1.1 of 1.6 s by /s/
- level w1-8 @1808.1s: "Now pick the new sound." cut after 1.0 of 1.6 s by /m/
- level w1-8 @1822.3s: "Yes, the last sound changes! Now pick the new sound." cut after 1.1 of 3.9 s by /a/
- level w1-8 @1834.5s: "Now pick the new sound." cut after 1.0 of 1.6 s by /i/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| how_we_spell "This is how we spell..." | 9 | level w1-2 ×3, level w1-3 ×4, level w1-7 ×2 |
| fm_l2_way "Ninjas read this way!" | 3 | level (first minutes), level w1-wu4, level w1-4 |
| fm_speaker "And when you tap the speaker, I'll say it again!" | 2 | dojo welcome ×2 |
| audit_last_place "The last sound is at the end of the word. Listen t" | 2 | level w1-4, level w1-5 |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| fm_hear_sounds_short "Slowly, I hear its sounds. Words are made of sound" | 1 | level (first minutes) |
| t_everyone_say "Say that sound with me!" | 1 | level (first minutes) |
| fm_rw_every "Every picture you play with becomes a sticker!" | 1 | sticker book |
| audit_petal_means "This petal is for the sound..." | 1 | sticker book |
| audit_made_of_sounds "Remember? Words are made of sounds!" | 1 | level w1-wu5 |
| audit_hear_see "We hear the sound. Now look: this is how we spell " | 1 | level w1-2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_dojo_first "This is our dojo. Here we listen to sounds, make w" | 1 | map |
| audit_left_right "We start here, and go this way." | 1 | level w1-4 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w1-4 |
| audit_gem_more "Look, this gem has filled a little more." | 1 | reward |
| audit_middle_place "The middle sound comes after the first sound, and " | 1 | level w1-7 |

## playtest/fix/baseline/transcripts/continuous-perfect-from-w5-1.json (perfect-from-w5-1, one continuous page)

329 Sensei lines, 572 sounds and words, 453 utterances in 56 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| yay_8 | 18 | Wow, great listening! |
| yay_4 | 12 | Well done. |
| listen | 11 | Listen... |
| t_two_letters | 11 | It's two letters, but it's one sound. |
| dojo_tap_say | 11 | Tap it, and say it with me! |
| dojo_find | 11 | Can you find... |
| tv_yay_lovely | 11 | Lovely! |
| yay_7 | 11 | You did it! |
| fm_rw_more | 11 | More stickers for your Sticker Book! |
| tv_yay_thats_it | 11 | That's it! |
| audit_spell_it | 10 | And this is how we spell it. |
| yay_2 | 10 | Super! |
| world_5 | 10 | Welcome to Shadow Castle. Don't worry, I'm right beside you. |
| swap_make | 10 | Change it to make... |
| swap_which | 10 | Which sound needs to change? |
| tv_here_sound | 9 | Here's the sound... |
| yay_1 | 8 | Brilliant! |
| same_sound_new | 8 | Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling. |
| t_in | 5 | ...in... |
| swap_pick | 5 | Now pick the new sound. |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| same_sound_diff | 4 | Same sound, different spellings! |
| dojo_build | 3 | Now let's make words! First, listen to the word. Then tap its sounds, one at a time. |
| dojo_done | 3 | Well done! You practised so hard! |
| petals_got | 3 | You won back some sounds! |
| battle_start | 3 | Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it! |
| battle_spell | 3 | Spell... |
| battle_win | 3 | Hooray! The monster ran away! |
| r2_gems_more | 3 | Look, these gems have filled a little more. |
| gem_ready | 3 | A gem is glowing! It's ready for a gem battle. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (54)

| Line | Repeats | Text | Example |
|---|---|---|---|
| dojo_find | 8 | Can you find... | level w5-1 @72.2s and @76.3s |
| swap_make | 8 | Change it to make... | level w5-4 @543.1s and @554.1s |
| swap_which | 8 | Which sound needs to change? | level w5-4 @545.0s and @556.0s |
| dojo_tap_say | 4 | Tap it, and say it with me! | level w5-1 @23.1s and @36.2s |
| listen | 4 | Listen... | level w5-1 @27.5s and @39.9s |
| audit_spell_it | 4 | And this is how we spell it. | level w5-1 @30.6s and @43.7s |
| t_two_letters | 3 | It's two letters, but it's one sound. | level w5-1 @20.0s and @33.0s |
| t_in | 3 | ...in... | world flower @217.4s and @220.6s |
| swap_pick | 3 | Now pick the new sound. | level w5-4 @569.6s and @580.3s |
| tv_here_sound | 2 | Here's the sound... | world flower @507.4s and @522.2s |
| yay_1 | 1 | Brilliant! | level w5-1 @75.1s and @85.1s |
| yay_4 | 1 | Well done. | level w5-3 @388.8s and @395.2s |
| same_sound_diff | 1 | Same sound, different spellings! | level w5-6 @803.0s and @816.8s |
| yay_8 | 1 | Wow, great listening! | level w5-6 @847.6s and @854.8s |
| same_sound_new | 1 | Ooh! You already know this sound. Here's another way to spel | world flower @960.7s and @975.5s |
| story_your_turn | 1 | Your turn to read. | level w5-10 @1278.7s and @1286.1s |
| well_read | 1 | Well read! | level w5-10 @1278.7s and @1286.9s |

### Spliced utterances: 44 of 453 (10%); chains of 5+ clips: 39

Commonest spliced shapes:

- ×5 ‹listen› + /X/ + /X/
- ×2 ‹dojo_find› + /X/ + /X/
- ×2 /X/ + ‹t_in› + W + ‹t_and_sometimes› + /X/ + ‹t_in› + W
- ×2 ‹yay_4› + ‹dojo_find› + /X/ + /X/
- ×2 ‹tv_yay_thats_it› + ‹dojo_find› + /X/
- ×2 ‹swap_make› + W + ‹swap_which›
- ×2 ‹swap_make› + W
- ×2 ‹yay_8› + ‹listen› + /X/ + /X/
- ×1 ‹listen› + /X/
- ×1 /X/ + /X/ + ‹yay_1› + ‹listen›
- ×1 /X/ + ‹yay_2› + ‹listen› + /X/ + /X/
- ×1 /X/ + ‹t_same_spelling_sometimes›
- ×1 /X/ + ‹st_th_moth_sometimes›
- ×1 /X/ + ‹tg_th_dh_in›
- ×1 ‹yay_1› + ‹dojo_find› + /X/ + /X/

Longest chains:

- level w5-1 @119.0s (8 clips): Ten in a row! Look how your ninja is glowing! /t/ /r/ /a/ /p/ "trap" Wow, great listening! "much"
- level w5-3 @406.6s (8 clips): /sh/ /e/ /l/ "shell" It's two letters, but it's one sound. /l/ Well done. "that"
- level w5-1 @94.2s (7 clips): Wow! Super ninja streak! /sh/ /u/ /t/ "shut" Well done. Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up.
- world flower @216.9s (7 clips): /dh/ ...in... "this" ...and sometimes... /th/ ...in... "moth"
- level w5-3 @433.9s (7 clips): /f/ /e/ /l/ /t/ "felt" Well done. "hang"
- level w5-3 @458.5s (7 clips): /b/ /e/ /n/ /ch/ "bench" That's it! Well done! You practised so hard!
- world flower @953.9s (7 clips): /u/ ...in... "shut" ...and sometimes... /w/ ...in... "queen"
- level w5-1 @134.1s (6 clips): /m/ /u/ /ch/ "much" Super! "ship"

### Praise: 78 lines (3.0 a minute); stacked (2+ within 5 s): 7

- level w5-1 @70.4s: "Wow, great listening!" → "Brilliant!" → "Ninja power!" → "Well done." → "Brilliant!"
- level w5-1 @159.1s: "Wow, great listening!" → "Well done! You practised so hard!" → "You did it!"
- level w5-3 @395.2s: "Well done." → "Wow, great listening!"
- reward @466.9s: "You did it!" → "You won back some sounds!"
- level w5-4 @595.0s: "Brilliant!" → "You fixed them all!"
- reward @910.4s: "You did it!" → "You won back some sounds!"
- level w5-8 @1138.8s: "Wow, great listening!" → "You fixed them all!"

### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 23

- level w5-1 @25.1s: "/sh/" cut after 0.1 of 0.7 s by /sh/
- level w5-1 @84.0s: "Can you find..." cut after 0.5 of 1.1 s by /dh/
- level w5-1 @86.7s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 2.0 of 6.2 s by /sh/
- level w5-3 @371.2s: "/ng/" cut after 0.0 of 0.5 s by /ng/
- level w5-3 @398.0s: "/w/" cut after 0.3 of 0.7 s by /w/
- level w5-3 @400.8s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 1.3 of 6.2 s by /sh/
- level w5-3 @406.1s: "/l/" cut after 0.5 of 0.8 s by /sh/
- level w5-4 @548.6s: "Yes, the last sound changes! Now pick the new sound." cut after 1.1 of 3.9 s by /m/
- level w5-4 @559.5s: "Yes, the first sound changes! Now pick the new sound." cut after 0.7 of 4.2 s by /sh/
- level w5-4 @569.6s: "Now pick the new sound." cut after 1.0 of 1.6 s by /sh/
- level w5-4 @580.3s: "Now pick the new sound." cut after 1.1 of 1.6 s by /s/
- level w5-4 @590.7s: "Now pick the new sound." cut after 1.0 of 1.6 s by /s/
- level w5-6 @807.6s: "/w/" cut after 0.3 of 0.7 s by /w/
- level w5-6 @856.4s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 1.9 of 6.2 s by /k/
- level w5-8 @1094.0s: "Yes, the last sound changes! Now pick the new sound." cut after 1.3 of 3.9 s by /m/
- level w5-8 @1104.8s: "Yes, the first sound changes! Now pick the new sound." cut after 1.0 of 4.2 s by /sh/
- level w5-8 @1115.6s: "Yes, the middle sound changes! Now pick the new sound." cut after 1.1 of 4.3 s by /sh/
- level w5-8 @1126.6s: "Now pick the new sound." cut after 1.0 of 1.6 s by /ch/
- level w5-8 @1135.9s: "Now pick the new sound." cut after 0.7 of 1.6 s by /ch/
- level w5-10 @1257.8s: "Your turn to read." cut after 0.3 of 1.3 s by Well read!
- level w5-10 @1278.7s: "Your turn to read." cut after 0.0 of 1.3 s by Well read!
- level w5-10 @1286.1s: "Your turn to read." cut after 0.8 of 1.3 s by Well read!
- level w5-10 @1302.5s: "Let's think about the story..." cut after 0.6 of 2.8 s by Well done.

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 11 | level w5-1 ×3, world flower ×2, level w5-3 ×4, level w5-6, level w6-br1 |
| audit_spell_it "And this is how we spell it." | 10 | level w5-1 ×3, level w5-3 ×3, level w5-6 ×4 |
| same_sound_new "Ooh! You already know this sound. Here's another w" | 8 | level w5-3, reward ×2, world flower ×4, level w5-6 |
| same_sound_diff "Same sound, different spellings!" | 4 | level w5-3, level w5-6 ×3 |
| r2_gems_more "Look, these gems have filled a little more." | 3 | reward ×3 |
| dojo_hello "This is the dojo. A dojo is where ninjas practise!" | 2 | stone 1: w5-1, map |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| audit_hear_see "We hear the sound. Now look: this is how we spell " | 1 | level w5-1 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w5-1 |
| fm_l2_way "Ninjas read this way!" | 1 | level w5-5 |
| audit_dojo_back "Back to the dojo! Let's learn some new sounds." | 1 | stone 6: w5-6 |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |
| t_way_we_spell "This is the way we spell..." | 1 | world flower |
| audit_sort_first "Sorting time! These words have the same sound, but" | 1 | level w6-br1 |
| audit_sort_three "This sound can be spelt in three ways." | 1 | level w6-br1 |

## playtest/fix/baseline/transcripts/continuous-perfect-from-w6-br1.json (perfect-from-w6-br1, one continuous page)

272 Sensei lines, 563 sounds and words, 404 utterances in 60 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| t_two_letters | 24 | It's two letters, but it's one sound. |
| yay_7 | 13 | You did it! |
| world_6 | 13 | Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere! |
| tv_yay_lovely | 13 | Lovely! |
| fm_rw_more | 12 | More stickers for your Sticker Book! |
| yay_1 | 11 | Brilliant! |
| listen | 8 | Listen... |
| dojo_tap_say | 8 | Tap it, and say it with me! |
| yay_4 | 8 | Well done. |
| same_sound_new | 8 | Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling. |
| dojo_find | 8 | Can you find... |
| tv_here_sound | 8 | Here's the sound... |
| audit_spell_it | 7 | And this is how we spell it. |
| help_sort | 6 | Tap the chest with the same spelling as the word. |
| sort_done | 6 | Sorted! What a clever ninja. |
| yay_8 | 6 | Wow, great listening! |
| audit_sort_again | 5 | Sorting time! Same sound, different spellings. |
| audit_sort_pair | 5 | This sound can be spelt in two ways. |
| tv_yay_thats_it | 5 | That's it! |
| t_three_letters | 4 | It's three letters, but it's just one sound. |
| dojo_build | 4 | Now let's make words! First, listen to the word. Then tap its sounds, one at a time. |
| dojo_done | 4 | Well done! You practised so hard! |
| petals_got | 4 | You won back some sounds! |
| wf_found_sound | 4 | You found a new sound! Look, here is its petal, shining through the mist. |
| t_ways_2 | 4 | Now you know two ways to spell... |
| yay_2 | 4 | Super! |
| story_your_turn | 4 | Your turn to read. |
| well_read | 4 | Well read! |
| audit_gem_more | 3 | Look, this gem has filled a little more. |
| gem_ready | 3 | A gem is glowing! It's ready for a gem battle. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (18)

| Line | Repeats | Text | Example |
|---|---|---|---|
| dojo_find | 4 | Can you find... | level w6-1 @227.0s and @230.4s |
| t_two_letters | 3 | It's two letters, but it's one sound. | level w6-2 @354.4s and @358.7s |
| listen | 2 | Listen... | level w6-3 @433.6s and @447.6s |
| audit_spell_it | 2 | And this is how we spell it. | level w6-3 @437.7s and @451.7s |
| story_your_turn | 2 | Your turn to read. | level w6-10 @1452.6s and @1466.5s |
| well_read | 2 | Well read! | level w6-10 @1453.1s and @1466.8s |
| yay_1 | 1 | Brilliant! | level w6-1 @225.9s and @233.2s |
| tv_yay_thats_it | 1 | That's it! | level w6-1 @229.6s and @241.9s |
| tv_yay_lovely | 1 | Lovely! | level w6-6 @815.1s and @822.3s |

### Spliced utterances: 18 of 404 (4%); chains of 5+ clips: 34

Commonest spliced shapes:

- ×5 ‹listen› + /X/ + /X/
- ×2 ‹yay_4› + ‹listen› + /X/ + /X/
- ×2 ‹yay_1› + ‹dojo_find› + /X/ + /X/
- ×1 ‹dojo_hello› + ‹listen› + /X/ + /X/
- ×1 ‹tv_yay_thats_it› + ‹dojo_find› + /X/ + /X/
- ×1 ‹yay_8› + ‹dojo_find› + /X/
- ×1 ‹yay_2› + ‹dojo_find› + /X/ + /X/
- ×1 ‹t_ways_2› + /X/
- ×1 ‹battle_spell› + W
- ×1 ‹dojo_find› + /X/
- ×1 ‹dojo_find› + /X/ + /X/
- ×1 ‹tv_yay_lovely› + ‹dojo_find› + /X/ + /X/

Longest chains:

- level w6-br1 @5.9s (9 clips): You know this sound! Now let's look at the different ways we spell it. Sorting time! These words have the same sound, but it's spelt in different ways. This sound can be spelt in three ways. /k/ /k/ /k/ It's two letters, but it's one sound. Tap the chest with the same
- level w6-br2 @105.7s (8 clips): Sorting time! Same sound, different spellings. This sound can be spelt in two ways. /ch/ It's two letters, but it's one sound. /ch/ It's three letters, but it's just one sound. Tap the chest with the same spelling as the word. "chest"
- level w6-2 @350.6s (7 clips): This sound can be spelt in two ways. /ae/ It's two letters, but it's one sound. /ae/ It's two letters, but it's one sound. Tap the chest with the same spelling as the word. "spray"
- level w6-3 @485.3s (7 clips): /d/ /r/ /ee/ /m/ "dream" Super! "say"
- level w6-3 @530.1s (7 clips): /b/ /e/ /n/ /ch/ "bench" Well done. Well done! You practised so hard!
- level w6-4 @602.3s (7 clips): This sound can be spelt in two ways. /ee/ It's two letters, but it's one sound. /ee/ It's two letters, but it's one sound. Tap the chest with the same spelling as the word. "green"
- level w6-6 @841.8s (7 clips): /d/ /u/ /s/ /k/ "dusk" Brilliant! "beach"
- level w6-ec11 @1098.3s (7 clips): /s/ /l/ /ee/ /p/ "sleep" Super! "tree"

### Praise: 64 lines (2.6 a minute); stacked (2+ within 5 s): 8

- level w6-1 @283.0s: "Well done." → "Well done! You practised so hard!" → "You did it!"
- level w6-3 @468.2s: "Wow, great listening!" → "Super!"
- level w6-3 @533.7s: "Well done." → "Well done! You practised so hard!"
- reward @538.9s: "You did it!" → "You won back some sounds!"
- level w6-6 @875.0s: "Brilliant!" → "Well done! You practised so hard!"
- reward @880.0s: "You did it!" → "You won back some sounds!"
- level w6-ec11 @1122.3s: "Brilliant!" → "Well done! You practised so hard!"
- reward @1127.3s: "You did it!" → "You won back some sounds!"

### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 18

- level w6-br2 @129.5s: ""munch"" cut after 0.4 of 1.1 s by /m/
- level w6-1 @234.5s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 1.7 of 6.2 s by /s/
- level w6-1 @268.9s: "/l/" cut after 0.5 of 0.8 s by /t/
- level w6-2 @390.1s: ""snail"" cut after 0.2 of 0.9 s by /s/
- level w6-3 @445.7s: "/ee/" cut after 0.1 of 0.7 s by /ee/
- level w6-3 @474.4s: "/ee/" cut after 0.2 of 0.7 s by /ee/
- level w6-3 @476.6s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 1.8 of 6.2 s by /d/
- level w6-4 @657.7s: ""queen"" cut after 0.2 of 0.7 s by /k/
- level w6-6 @823.5s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 1.9 of 6.2 s by /g/
- level w6-8 @991.9s: ""slow"" cut after 0.2 of 0.6 s by /s/
- level w6-ec11 @1039.6s: "/ie/" cut after 0.2 of 0.6 s by /ie/
- level w6-ec11 @1064.4s: "/ie/" cut after 0.1 of 0.6 s by /ie/
- level w6-ec11 @1070.5s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 1.8 of 6.2 s by /p/
- level w6-7 @1228.6s: ""fight"" cut after 0.2 of 0.5 s by /f/
- level w6-10 @1435.3s: "Your turn to read." cut after 0.6 of 1.3 s by Well read!
- level w6-10 @1452.6s: "Your turn to read." cut after 0.5 of 1.3 s by Well read!
- level w6-10 @1466.5s: "Your turn to read." cut after 0.3 of 1.3 s by Well read!
- level w6-10 @1494.0s: "Let's think about the story..." cut after 0.6 of 2.8 s by Brilliant!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 24 | level w6-br1, level w6-br2, level w6-1 ×2, world flower ×7, level w6-2 ×2, level w6-3 ×2, level w6-4 ×2, level w6-5, level w6-6 ×2, level w6-8 ×2, level w6-ec11, level w6-7 |
| same_sound_new "Ooh! You already know this sound. Here's another w" | 8 | level w6-1, world flower ×4, level w6-3, level w6-6, level w6-ec11 |
| audit_spell_it "And this is how we spell it." | 7 | level w6-1, level w6-3 ×2, level w6-6 ×2, level w6-ec11 ×2 |
| audit_sort_again "Sorting time! Same sound, different spellings." | 5 | level w6-br2, stone 4: w6-2, stone 6: w6-4, stone 9: w6-8, stone 11: w6-7 |
| audit_sort_pair "This sound can be spelt in two ways." | 5 | level w6-br2, level w6-2, level w6-4, level w6-8, level w6-7 |
| t_three_letters "It's three letters, but it's just one sound." | 4 | level w6-br2, level w6-ec11, world flower, level w6-7 |
| audit_gem_more "Look, this gem has filled a little more." | 3 | reward ×3 |
| dojo_hello "This is the dojo. A dojo is where ninjas practise!" | 2 | level w6-1, map |
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| audit_dojo_back "Back to the dojo! Let's learn some new sounds." | 2 | map ×2 |
| audit_sort_first "Sorting time! These words have the same sound, but" | 1 | level w6-br1 |
| audit_sort_three "This sound can be spelt in three ways." | 1 | level w6-br1 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w6-br1 |
| audit_hear_see "We hear the sound. Now look: this is how we spell " | 1 | level w6-1 |
| t_everyone_say "Say that sound with me!" | 1 | world flower |
| fm_l2_way "Ninjas read this way!" | 1 | level w6-9 |

## playtest/fix/baseline/transcripts/continuous-perfect.json (perfect, one continuous page)

530 Sensei lines, 460 sounds and words, 428 utterances in 62 pieces.

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
| tv_yay_thats_it | 10 | That's it! |
| tv_yay_lovely | 9 | Lovely! |
| yay_4 | 7 | Well done. |
| fm_show_me | 6 | Let me show you! |
| fm_rw_more | 6 | More stickers for your Sticker Book! |
| find_q | 6 | Find this sound... |
| hunt_q | 6 | Which one has this sound in it? |
| swap_make | 6 | Change it to make... |
| what_changed | 6 | What changed? Listen here. |
| tv_here_sound | 5 | Here's the sound... |
| build_ido_1 | 5 | I say the word... |
| build_ido_2 | 5 | I say it slowly... |
| build_ido_3 | 5 | Now I find each sound, one at a time. |
| next_sound_q | 5 | What's the next sound? |
| yay_2 | 5 | Super! |
| fm_name_cat | 4 | This is a cat. |
| read_intro | 4 | Who read it right? Listen to Kai and Suki! |
| read_tap_sounds | 4 | Tap each sound, and say it. |
| read_who | 4 | Who read it right? |

### Echoes: the same utterance shape back to back (1)

- dojo welcome @96.9s ×2: And when you tap the speaker, I'll say it again! ‖ And when you tap the speaker, I'll say it again!

### Near repeats: the same line again within 15 s (42)

| Line | Repeats | Text | Example |
|---|---|---|---|
| first_q | 20 | Which one starts with... | level w1-2 @488.9s and @501.1s |
| how_we_spell | 5 | This is how we spell... | level w1-2 @517.9s and @529.5s |
| swap_make | 4 | Change it to make... | level w1-8 @1266.2s and @1280.4s |
| what_changed | 4 | What changed? Listen here. | level w1-8 @1271.8s and @1285.1s |
| find_q | 3 | Find this sound... | level w1-2 @557.0s and @560.7s |
| fm_speaker | 1 | And when you tap the speaker, I'll say it again! | dojo welcome @96.9s and @101.1s |
| fm_pair_fish_dog | 1 | Fish dog! | level (first minutes) @223.6s and @236.2s |
| fm_which_pic | 1 | Which picture is it? | level w1-wu3 @341.8s and @351.3s |
| fs_tin | 1 | Tin starts with... | level w1-3 @711.2s and @721.2s |
| say_sounds_read | 1 | Say the sounds, and read the word. | level w1-7 @1165.7s and @1180.3s |
| swap_pick | 1 | Now pick the new sound. | level w1-8 @1302.3s and @1317.0s |

### Spliced utterances: 82 of 428 (19%); chains of 5+ clips: 47

Commonest spliced shapes:

- ×3 ‹first_q› + /X/
- ×3 ‹swap_make› + W
- ×2 ‹fs_apple› + /X/
- ×2 ‹fs_tin› + /X/
- ×2 W + ‹build_ido_2›
- ×2 ‹read_who› + ‹suki_says› + W + ‹kai_says› + W
- ×2 ‹read_who› + ‹kai_says› + W + ‹suki_says› + W
- ×2 ‹build_ido_1› + W + ‹build_ido_2›
- ×1 ‹fm_show_me_2› + ‹fm_fast_sun› + ‹fm_slow› + W + ‹fm_same_word› + ‹fm_hear_sounds_short› + ‹fm_tap_tortoise›
- ×1 ‹fm_first_listen› + W + W + ‹fm_notice_sun_sock› + /X/ + ‹t_everyone_say› + /X/
- ×1 ‹fm_name_sausage› + ‹fm_name_moon› + ‹fm_show_me› + ‹fm_tap_all_start› + /X/ + W + ‹fm_you_try_2›
- ×1 ‹fm_found_both› + /X/ + ‹fm_l1_done› + ‹fm_rw_look›
- ×1 ‹fm_rw_shiny› + ‹fm_rw2_s› + /X/
- ×1 ‹fm_rw2_petal› + ‹audit_petal_means› + /X/
- ×1 W + ‹fm_slow› + W + ‹fm_tap_tortoise›

Longest chains:

- level w1-7 @1116.5s (11 clips): Pin has this sound in the middle... /i/ This is how we spell... /i/ Let's do it together! This is a tin. This is a tap. Which one has this sound in it? /i/ "tin" (slowly) "tap" (slowly)
- level w1-7 @1131.9s (11 clips): Tin has this sound in the middle... /i/ This is how we spell... /i/ Now it's your turn! This is a lid. This is a mat. Which one has this sound in it? /i/ "lid" (slowly) "mat" (slowly)
- level w1-11 @1850.4s (11 clips): Mop has this sound in the middle... /o/ This is how we spell... /o/ Let's do it together! This is a top. This is a tap. Which one has this sound in it? /o/ "top" (slowly) "tap" (slowly)
- level w1-11 @1867.0s (11 clips): Top has this sound in the middle... /o/ This is how we spell... /o/ Now it's your turn! This is a cot. This is a cat. Which one has this sound in it? /o/ "cot" (slowly) "cat" (slowly)
- level w1-2 @476.6s (9 clips): Milk starts with... /m/ We hear the sound. Now look: this is how we spell it. /m/ Let's do it together! This is a bus. This is a mop. Which one starts with... /m/
- level w1-2 @491.9s (9 clips): Mop starts with... /m/ This is how we spell... /m/ Now it's your turn! This is a map. This is a dog. Which one starts with... /m/
- level w1-2 @527.2s (9 clips): Sock starts with... /s/ This is how we spell... /s/ Now it's your turn! This is a cat. Look, she can sit. Which one starts with... /s/
- level w1-3 @657.1s (9 clips): Apple starts with... /a/ This is how we spell... /a/ Let's do it together! This is an ant. This is a pig. Which one starts with... /a/

### Praise: 46 lines (1.4 a minute); stacked (2+ within 5 s): 7

- level (first minutes) @182.8s: "You found them both! They both start with..." → "You can hear the sounds in words. Brilliant listening!"
- level w1-wu3 @393.4s: "You found them all!" → "You can hear the sounds in words. Brilliant listening!"
- reward @566.9s: "You did it!" → "You won back some sounds!"
- level w1-3 @725.9s: "Brilliant!" → "Well done." → "You did it!"
- level w1-7 @1220.7s: "Well done." → "You did it!"
- reward @1792.1s: "You did it!" → "You won back some sounds!"
- reward @1966.3s: "You did it!" → "You won back a sound!"

### Silences of 10 s or more inside a level or piece: 1

- level w1-8 @1318.6s: 119.7 s silent (2 taps) after "Now pick the new sound.", before "/m/ /a/ /t/ "mat""

### Cut-off clips: 10

- intro film @59.4s: "I am Sensei Maple. I will train you. Now, choose your ninja!" cut after 0.6 of 5.4 s by Great choice!
- map @642.3s: "Tap the glowing stone to start your next adventure." cut after 2.1 of 3.3 s by Every word starts with a sound. Let's listen for t
- map @1256.3s: "Tap the glowing stone to start your next adventure." cut after 2.1 of 3.3 s by Baron Muddle has mixed up these words! Can you fix
- level w1-8 @1275.3s: "Yes, the first sound changes! Now pick the new sound." cut after 1.0 of 4.2 s by /s/
- level w1-8 @1288.8s: "Yes, the middle sound changes! Now pick the new sound." cut after 0.9 of 4.3 s by /s/
- level w1-8 @1302.3s: "Now pick the new sound." cut after 1.2 of 1.6 s by /s/
- level w1-8 @1452.4s: "Yes, the last sound changes! Now pick the new sound." cut after 1.1 of 3.9 s by /a/
- level w1-8 @1464.0s: "Now pick the new sound." cut after 0.9 of 1.6 s by /i/
- map @1628.6s: "Tap the glowing stone to start your next adventure." cut after 2.0 of 3.3 s by Every word starts with a sound. Let's listen for t
- map @1828.7s: "Tap the glowing stone to start your next adventure." cut after 2.0 of 3.3 s by Now let's listen for a sound in the middle of a wo

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

## playtest/fix/baseline/transcripts/continuous-splitter-from-w5-1.json (splitter-from-w5-1, one continuous page)

313 Sensei lines, 417 sounds and words, 314 utterances in 39 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| t_two_letters | 15 | It's two letters, but it's one sound. |
| listen | 13 | Listen... |
| dojo_tap_say | 11 | Tap it, and say it with me! |
| tv_yay_thats_it | 11 | That's it! |
| yay_8 | 11 | Wow, great listening! |
| yay_1 | 11 | Brilliant! |
| dojo_find | 11 | Can you find... |
| audit_spell_it | 10 | And this is how we spell it. |
| tut_speaker | 10 | Tap the speaker to hear the sound again. |
| swap_make | 10 | Change it to make... |
| swap_which | 10 | Which sound needs to change? |
| tv_here_sound | 9 | Here's the sound... |
| yay_7 | 8 | You did it! |
| fm_rw_more | 8 | More stickers for your Sticker Book! |
| world_5 | 8 | Welcome to Shadow Castle. Don't worry, I'm right beside you. |
| yay_2 | 8 | Super! |
| same_sound_new | 8 | Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling. |
| yay_4 | 7 | Well done. |
| streak_3 | 7 | Ninja power! |
| streak_6 | 7 | Wow! Super ninja streak! |
| streak_lost | 6 | Keep going, ninja. |
| swap_pick | 6 | Now pick the new sound. |
| audit_gem_more | 5 | Look, this gem has filled a little more. |
| t_in | 5 | ...in... |
| tv_yay_lovely | 5 | Lovely! |
| t_same_spelling_sometimes | 4 | The same spelling can sometimes be... |
| tv_streak_10 | 4 | Ten in a row! Look how your ninja is glowing! |
| thats | 4 | That's... |
| we_need | 4 | We need... |
| same_sound_diff | 4 | Same sound, different spellings! |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (49)

| Line | Repeats | Text | Example |
|---|---|---|---|
| dojo_find | 8 | Can you find... | level w5-1 @72.1s and @76.4s |
| tut_speaker | 7 | Tap the speaker to hear the sound again. | level w5-1 @74.6s and @78.4s |
| swap_make | 6 | Change it to make... | level w5-4 @684.2s and @694.1s |
| swap_which | 6 | Which sound needs to change? | level w5-4 @686.1s and @696.0s |
| dojo_tap_say | 4 | Tap it, and say it with me! | level w5-1 @23.0s and @35.4s |
| audit_spell_it | 4 | And this is how we spell it. | level w5-1 @29.8s and @43.1s |
| t_two_letters | 3 | It's two letters, but it's one sound. | level w5-1 @19.8s and @32.2s |
| listen | 3 | Listen... | level w5-1 @26.7s and @39.4s |
| t_in | 3 | ...in... | world flower @261.2s and @264.5s |
| swap_pick | 3 | Now pick the new sound. | level w5-4 @731.7s and @742.1s |
| same_sound_diff | 1 | Same sound, different spellings! | level w5-6 @962.7s and @976.3s |
| yay_8 | 1 | Wow, great listening! | level w5-6 @1000.5s and @1014.9s |

### Spliced utterances: 50 of 314 (16%); chains of 5+ clips: 46

Commonest spliced shapes:

- ×7 ‹listen› + /X/ + /X/
- ×6 ‹swap_make› + W + ‹swap_which›
- ×3 ‹streak_lost› + ‹thats› + /X/ + ‹we_need› + /X/ + ‹t_two_letters›
- ×2 ‹tv_yay_thats_it› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×2 /X/ + ‹t_in› + W + ‹t_and_sometimes› + /X/ + ‹t_in› + W
- ×2 ‹yay_4› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×2 W + ‹yay_2› + ‹swap_make› + W + ‹swap_which›
- ×1 /X/ + ‹tv_yay_thats_it› + ‹listen› + /X/ + /X/
- ×1 ‹yay_4› + ‹listen› + /X/ + /X/
- ×1 /X/ + ‹t_same_spelling_sometimes›
- ×1 /X/ + ‹st_th_moth_sometimes›
- ×1 /X/ + ‹tg_th_dh_in›
- ×1 /X/ + /X/ + ‹yay_1› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×1 ‹streak_3› + ‹dojo_find› + /X/ + ‹tut_speaker› + /X/
- ×1 ‹dojo_find› + /X/ + ‹yay_1› + ‹dojo_build› + /X/

Longest chains:

- level w5-3 @585.5s (9 clips): Wow! Super ninja streak! /k/ /r/ /a/ /b/ "crab" Brilliant! Well done! You practised so hard! You did it!
- level w5-1 @101.5s (8 clips): Wow! Super ninja streak! /b/ /e/ /n/ /ch/ "bench" That's it! Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up.
- level w5-1 @162.5s (8 clips): /l/ /u/ /n/ /ch/ "lunch" That's it! "chat" /ch/
- level w5-3 @500.2s (8 clips): Ten in a row! Look how your ninja is glowing! /th/ /u/ /m/ /p/ "thump" Brilliant! "swing"
- level w5-6 @1074.5s (8 clips): /h/ /i/ /s/ "hiss" It's two letters, but it's one sound. /s/ Super! "much"
- level w5-1 @70.0s (7 clips): /dh/ /dh/ Brilliant! Can you find... /sh/ Tap the speaker to hear the sound again. /sh/
- level w5-1 @130.6s (7 clips): Ten in a row! Look how your ninja is glowing! /w/ /e/ /t/ "wet" Well done. "lunch"
- level w5-1 @175.3s (7 clips): Ninja power! /ch/ /a/ /t/ "chat" Well done. "fish"

### Praise: 70 lines (3.0 a minute); stacked (2+ within 5 s): 11

- level w5-1 @80.8s: "Ninja power!" → "Wow, great listening!" → "Brilliant!"
- level w5-1 @175.3s: "Ninja power!" → "Well done."
- level w5-1 @197.1s: "Brilliant!" → "Well done! You practised so hard!"
- reward @202.6s: "You did it!" → "You won back some sounds!"
- level w5-3 @566.2s: "Ninja power!" → "Wow, great listening!"
- level w5-3 @591.3s: "Brilliant!" → "Well done! You practised so hard!" → "You did it!"
- level w5-4 @741.0s: "Ninja power!" → "Brilliant!" → "You fixed them all!"
- level w5-6 @1000.5s: "Wow, great listening!" → "Well done."
- level w5-6 @1096.7s: "Wow, great listening!" → "Well done! You practised so hard!"
- reward @1102.2s: "You did it!" → "You won back some sounds!"
- level w5-8 @1381.6s: "Wow! Super ninja streak!" → "You fixed them all!"

### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 29

- map @4.3s: "Tap the glowing stone to start your next adventure." cut after 0.7 of 3.3 s by This is the dojo. A dojo is where ninjas practise!
- level w5-1 @25.0s: "/sh/" cut after 0.2 of 0.7 s by /sh/
- level w5-1 @74.6s: "Tap the speaker to hear the sound again." cut after 0.1 of 2.2 s by /sh/
- level w5-1 @78.4s: "Tap the speaker to hear the sound again." cut after 1.5 of 2.2 s by /ch/
- level w5-1 @84.2s: "Tap the speaker to hear the sound again." cut after 0.5 of 2.2 s by /th/
- level w5-1 @87.1s: "Can you find..." cut after 0.6 of 1.1 s by /dh/
- level w5-1 @89.6s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 0.1 of 6.2 s by /b/
- level w5-1 @161.9s: "Which sound comes next?" cut after 0.1 of 1.7 s by /ch/
- level w5-3 @452.1s: "/ng/" cut after 0.0 of 0.5 s by /ng/
- level w5-3 @468.5s: "/w/" cut after 0.2 of 0.7 s by /w/
- level w5-3 @472.5s: "Tap the speaker to hear the sound again." cut after 0.8 of 2.2 s by /k/
- level w5-3 @477.0s: "Tap the speaker to hear the sound again." cut after 0.9 of 2.2 s by /ng/
- level w5-3 @482.4s: "Tap the speaker to hear the sound again." cut after 0.3 of 2.2 s by /w/
- level w5-3 @486.3s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 2.8 of 6.2 s by /th/
- level w5-4 @689.6s: "Yes, the last sound changes! Now pick the new sound." cut after 1.1 of 3.9 s by /f/
- level w5-4 @702.7s: "Yes, the first sound changes! Now pick the new sound." cut after 1.4 of 4.2 s by /w/
- level w5-4 @731.7s: "Now pick the new sound." cut after 0.8 of 1.6 s by /k/
- level w5-4 @742.1s: "Now pick the new sound." cut after 1.3 of 1.6 s by /k/
- level w5-6 @967.4s: "/w/" cut after 0.3 of 0.7 s by /w/
- level w5-6 @1004.1s: "Tap the speaker to hear the sound again." cut after 0.8 of 2.2 s by /k/
- level w5-6 @1009.0s: "Tap the speaker to hear the sound again." cut after 0.4 of 2.2 s by /w/
- level w5-6 @1013.6s: "Tap the speaker to hear the sound again." cut after 0.4 of 2.2 s by /v/
- level w5-6 @1018.5s: "Tap the speaker to hear the sound again." cut after 1.3 of 2.2 s by /ch/
- level w5-6 @1020.9s: "Now let's make words! First, listen to the word. Then tap its sounds, " cut after 2.8 of 6.2 s by /dh/
- level w5-6 @1030.3s: "/s/" cut after 0.5 of 0.8 s by /dh/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| t_two_letters "It's two letters, but it's one sound." | 15 | level w5-1 ×4, world flower ×2, level w5-2 ×2, level w5-3 ×4, level w5-5, level w5-6 ×2 |
| audit_spell_it "And this is how we spell it." | 10 | level w5-1 ×3, level w5-3 ×3, level w5-6 ×4 |
| tut_speaker "Tap the speaker to hear the sound again." | 10 | level w5-1 ×3, level w5-3 ×3, level w5-6 ×4 |
| same_sound_new "Ooh! You already know this sound. Here's another w" | 8 | level w5-3, reward ×2, world flower ×4, level w5-6 |
| audit_gem_more "Look, this gem has filled a little more." | 5 | reward ×5 |
| same_sound_diff "Same sound, different spellings!" | 4 | level w5-3, level w5-6 ×3 |
| dojo_hello "This is the dojo. A dojo is where ninjas practise!" | 2 | map ×2 |
| audit_hear_see "We hear the sound. Now look: this is how we spell " | 1 | level w5-1 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w5-1 |
| fm_l2_way "Ninjas read this way!" | 1 | level w5-5 |
| audit_dojo_back "Back to the dojo! Let's learn some new sounds." | 1 | map |
| t_three_letters "It's three letters, but it's just one sound." | 1 | level w5-6 |
| t_way_we_spell "This is the way we spell..." | 1 | world flower |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |

## playtest/fix/baseline/transcripts/continuous-watcher.json (watcher, one continuous page)

716 Sensei lines, 787 sounds and words, 671 utterances in 89 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_q | 24 | Which one starts with... |
| yay_1 | 20 | Brilliant! |
| map_hint | 19 | Tap the glowing stone to start your next adventure. |
| swap_make | 19 | Change it to make... |
| what_changed | 19 | What changed? Listen here. |
| yay_7 | 17 | You did it! |
| say_sounds_read | 17 | Say the sounds, and read the word. |
| how_we_spell | 15 | This is how we spell... |
| world_1 | 14 | Welcome to Bamboo Village! |
| yay_4 | 14 | Well done. |
| yay_8 | 14 | Wow, great listening! |
| ido | 13 | Watch me first! |
| wedo | 13 | Let's do it together! |
| youdo | 13 | Now it's your turn! |
| tv_yay_thats_it | 13 | That's it! |
| swap_pick | 13 | Now pick the new sound. |
| tv_yay_lovely | 12 | Lovely! |
| first_sound_q | 12 | What's the first sound? |
| last_sound_q | 12 | What's the last sound? |
| fm_rw_more | 11 | More stickers for your Sticker Book! |
| tv_here_sound | 8 | Here's the sound... |
| yay_2 | 7 | Super! |
| fm_show_me | 6 | Let me show you! |
| find_q | 6 | Find this sound... |
| gem_ready | 6 | A gem is glowing! It's ready for a gem battle. |
| hunt_q | 6 | Which one has this sound in it? |
| run_blend | 6 | Listen to the sounds. What word do they make? |
| build_ido_1 | 5 | I say the word... |
| build_ido_2 | 5 | I say it slowly... |
| build_ido_3 | 5 | Now I find each sound, one at a time. |

### Echoes: the same utterance shape back to back (1)

- dojo welcome @94.0s ×2: And when you tap the speaker, I'll say it again! ‖ And when you tap the speaker, I'll say it again!

### Near repeats: the same line again within 15 s (95)

| Line | Repeats | Text | Example |
|---|---|---|---|
| first_q | 20 | Which one starts with... | level w1-2 @491.0s and @503.3s |
| what_changed | 17 | What changed? Listen here. | level w1-8 @1276.5s and @1289.3s |
| swap_make | 16 | Change it to make... | level w1-8 @1270.9s and @1284.7s |
| swap_pick | 10 | Now pick the new sound. | level w1-8 @1306.3s and @1320.7s |
| how_we_spell | 5 | This is how we spell... | level w1-2 @521.3s and @534.8s |
| find_q | 3 | Find this sound... | level w1-2 @562.0s and @565.9s |
| listen | 3 | Listen... | level w2-1 @2370.5s and @2381.0s |
| audit_spell_it | 3 | And this is how we spell it. | level w2-1 @2374.0s and @2384.0s |
| dojo_tap_say | 3 | Tap it, and say it with me! | level w2-1 @2376.4s and @2386.4s |
| dojo_find | 3 | Can you find... | level w2-1 @2410.1s and @2413.4s |
| story_your_turn | 2 | Your turn to read. | level w1-14 @2157.6s and @2169.9s |
| well_read | 2 | Well read! | level w1-14 @2158.3s and @2170.6s |
| fm_speaker | 1 | And when you tap the speaker, I'll say it again! | dojo welcome @94.0s and @98.3s |
| fm_pair_fish_dog | 1 | Fish dog! | level (first minutes) @222.3s and @232.7s |
| fm_which_pic | 1 | Which picture is it? | level w1-wu3 @345.1s and @354.6s |
| say_sounds_read | 1 | Say the sounds, and read the word. | level w1-4 @850.4s and @865.2s |
| yay_1 | 1 | Brilliant! | level w2-1 @2399.3s and @2412.3s |
| tut_speaker | 1 | Tap the speaker to hear the sound again. | level w2-1 @2415.4s and @2422.2s |
| yay_4 | 1 | Well done. | level w2-1 @2416.0s and @2422.9s |
| tv_here_sound | 1 | Here's the sound... | world flower @2520.0s and @2526.5s |

### Spliced utterances: 108 of 671 (16%); chains of 5+ clips: 65

Commonest spliced shapes:

- ×5 ‹swap_make› + W + W
- ×4 ‹read_who› + ‹suki_says› + W + ‹kai_says› + W
- ×3 ‹first_q› + /X/
- ×2 ‹find_q› + /X/ + ‹yay_4›
- ×2 ‹fs_apple› + /X/
- ×2 ‹find_q› + /X/ + ‹yay_1›
- ×2 ‹ido› + ‹build_ido_1›
- ×2 W + ‹build_ido_2›
- ×2 ‹build_ido_1› + W + ‹build_ido_2›
- ×2 W + ‹swap_make› + W
- ×2 W + ‹yay_2› + ‹swap_make› + W
- ×2 ‹swap_make› + W
- ×2 ‹listen› + /X/ + /X/
- ×1 ‹fm_show_me_2› + ‹fm_fast_sun› + ‹fm_slow› + W + ‹fm_same_word› + ‹fm_hear_sounds_short› + ‹fm_tap_tortoise›
- ×1 W + ‹fm_notice_sun_sock› + /X/ + ‹t_everyone_say› + /X/

Longest chains:

- level w1-7 @1121.5s (11 clips): Pin has this sound in the middle... /i/ This is how we spell... /i/ Let's do it together! This is a tap. This is a tin. Which one has this sound in it? /i/ "tin" (slowly) "tap" (slowly)
- level w1-7 @1136.9s (11 clips): Tin has this sound in the middle... /i/ This is how we spell... /i/ Now it's your turn! This is a lid. This is a mat. Which one has this sound in it? /i/ "lid" (slowly) "mat" (slowly)
- level w1-11 @1734.2s (11 clips): Mop has this sound in the middle... /o/ This is how we spell... /o/ Let's do it together! This is a top. This is a tap. Which one has this sound in it? /o/ "top" (slowly) "tap" (slowly)
- level w1-11 @1750.6s (11 clips): Top has this sound in the middle... /o/ This is how we spell... /o/ Now it's your turn! This is a cot. This is a cat. Which one has this sound in it? /o/ "cot" (slowly) "cat" (slowly)
- level w1-2 @478.5s (9 clips): Map starts with... /m/ We hear the sound. Now look: this is how we spell it. /m/ Let's do it together! This is a man. This is a hat. Which one starts with... /m/
- level w1-2 @493.7s (9 clips): Man starts with... /m/ This is how we spell... /m/ Now it's your turn! This is a mop. This is a bus. Which one starts with... /m/
- level w1-2 @518.8s (9 clips): Sun starts with... /s/ This is how we spell... /s/ Let's do it together! Look, she can sit. This is a zip. Which one starts with... /s/
- level w1-2 @532.5s (9 clips): Sit starts with... /s/ This is how we spell... /s/ Now it's your turn! This is a fox. This is some sand. Which one starts with... /s/

### Praise: 99 lines (2.2 a minute); stacked (2+ within 5 s): 13

- level (first minutes) @180.4s: "You found them both! They both start with..." → "You can hear the sounds in words. Brilliant listening!"
- level w1-wu3 @396.7s: "You found them all!" → "You can hear the sounds in words. Brilliant listening!"
- reward @572.9s: "You did it!" → "You won back some sounds!"
- level w1-3 @732.4s: "Brilliant!" → "Super!"
- reward @739.2s: "You did it!" → "You won back some sounds!"
- reward @1228.8s: "You did it!" → "You won back a sound!"
- level w1-10 @1603.8s: "Well done." → "Brilliant!"
- reward @1675.1s: "You did it!" → "You won back some sounds!"
- reward @1850.5s: "You did it!" → "You won back a sound!"
- level w1-13 @2122.3s: "Hooray! The monster ran away!" → "You did it!"
- level w2-1 @2412.3s: "Brilliant!" → "Well done."
- level w2-1 @2477.8s: "Wow, great listening!" → "Well done! You practised so hard!"
- reward @2483.5s: "You did it!" → "You won back some sounds!"

### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 36

- map @463.8s: "Tap the glowing stone to start your next adventure." cut after 2.1 of 3.3 s by Every word starts with a sound. Let's listen for t
- map @647.7s: "Tap the glowing stone to start your next adventure." cut after 2.1 of 3.3 s by Every word starts with a sound. Let's listen for t
- map @903.9s: "Tap the glowing stone to start your next adventure." cut after 2.0 of 3.3 s by This word has three sounds!
- map @1098.9s: "Tap the glowing stone to start your next adventure." cut after 2.1 of 3.3 s by Now let's listen for a sound in the middle of a wo
- map @1261.0s: "Tap the glowing stone to start your next adventure." cut after 2.1 of 3.3 s by Baron Muddle has mixed up these words! Can you fix
- level w1-8 @1279.9s: "Yes, the first sound changes! Now pick the new sound." cut after 1.1 of 4.2 s by /s/
- level w1-8 @1293.0s: "Yes, the middle sound changes! Now pick the new sound." cut after 0.9 of 4.3 s by /s/
- level w1-8 @1306.3s: "Now pick the new sound." cut after 0.7 of 1.6 s by /s/
- level w1-8 @1320.7s: "Now pick the new sound." cut after 0.9 of 1.6 s by /m/
- level w1-8 @1334.7s: "Yes, the last sound changes! Now pick the new sound." cut after 1.0 of 3.9 s by /a/
- level w1-8 @1346.4s: "Now pick the new sound." cut after 0.9 of 1.6 s by /i/
- map @1510.7s: "Tap the glowing stone to start your next adventure." cut after 2.1 of 3.3 s by Every word starts with a sound. Let's listen for t
- map @1712.5s: "Tap the glowing stone to start your next adventure." cut after 2.0 of 3.3 s by Now let's listen for a sound in the middle of a wo
- map @1878.8s: "Tap the glowing stone to start your next adventure." cut after 2.0 of 3.3 s by Baron Muddle has mixed up these words! Can you fix
- level w1-12 @1897.0s: "Yes, the middle sound changes! Now pick the new sound." cut after 1.2 of 4.3 s by /s/
- level w1-12 @1910.5s: "Yes, the first sound changes! Now pick the new sound." cut after 1.0 of 4.2 s by /p/
- level w1-12 @1923.5s: "Yes, the last sound changes! Now pick the new sound." cut after 0.6 of 3.9 s by /p/
- level w1-12 @1936.5s: "Now pick the new sound." cut after 0.9 of 1.6 s by /t/
- level w1-12 @1949.5s: "Now pick the new sound." cut after 1.1 of 1.6 s by /t/
- level w1-12 @1963.0s: "Now pick the new sound." cut after 1.0 of 1.6 s by /p/
- level w1-12 @1976.7s: "Now pick the new sound." cut after 0.7 of 1.6 s by /p/
- level w1-12 @1989.0s: "Now pick the new sound." cut after 1.2 of 1.6 s by /m/
- level w1-12 @2003.2s: "Now pick the new sound." cut after 0.7 of 1.6 s by /m/
- level w1-12 @2017.4s: "Now pick the new sound." cut after 1.0 of 1.6 s by /m/
- level w1-12 @2029.8s: "Now pick the new sound." cut after 0.7 of 1.6 s by /m/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| how_we_spell "This is how we spell..." | 15 | level w1-2 ×3, level w1-3 ×4, level w1-7 ×2, level w1-10 ×4, level w1-11 ×2 |
| audit_spell_it "And this is how we spell it." | 4 | level w2-1 ×4 |
| audit_gem_more "Look, this gem has filled a little more." | 3 | reward ×3 |
| fm_speaker "And when you tap the speaker, I'll say it again!" | 2 | dojo welcome ×2 |
| fm_l2_way "Ninjas read this way!" | 2 | level (first minutes), level w1-4 |
| audit_left_right "We start here, and go this way." | 2 | level w1-4, level w2-1 |
| audit_last_place "The last sound is at the end of the word. Listen t" | 2 | level w1-4, level w1-5 |
| audit_middle_place "The middle sound comes after the first sound, and " | 2 | level w1-7, level w1-11 |
| tut_speaker "Tap the speaker to hear the sound again." | 2 | level w2-1 ×2 |
| fm_hear_sounds_short "Slowly, I hear its sounds. Words are made of sound" | 1 | level (first minutes) |
| t_everyone_say "Say that sound with me!" | 1 | level (first minutes) |
| fm_rw_every "Every picture you play with becomes a sticker!" | 1 | sticker book |
| audit_petal_means "This petal is for the sound..." | 1 | sticker book |
| audit_hear_see "We hear the sound. Now look: this is how we spell " | 1 | level w1-2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_dojo_first "This is our dojo. Here we listen to sounds, make w" | 1 | stone 5: w1-4 |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w1-4 |
| r2_gems_more "Look, these gems have filled a little more." | 1 | reward |
| dojo_hello "This is the dojo. A dojo is where ninjas practise!" | 1 | stone 17: w2-1 |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C5-L: playtest/fix/baseline/transcripts/continuous-learner-from-w5-1.json

learner, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 13 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 5 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 4 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 2 | **FAIL** |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×10, world_6 ×2 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 10 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 10 (10 cut) | **FAIL** |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 2 | **FAIL** |
| `over-map` level lines started over the map | 0 | 6 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 of 5 | **FAIL** |
| `praise-rate` praise lines a minute | ≤ 1.5 | 3.19 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 20 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 17 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 17 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 1 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 4 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 17 said (2 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 11; 3 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 17.6 s (sort w6-br1); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 7 words (median line 5 words; 153 turns) | **FAIL** |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 2 said (1 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 19 said (5 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **letters-60s**: w5-1 @0:32.5 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-1 @0:45.9 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; world flower @3:59.1 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @7:45.1 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @8:01.8 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **same-sound-after-reveal**: w5-3 @7:23.5 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w5-6 @17:23.1 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"
- **world-welcomes**: world_5 "Welcome to Shadow Castle. Don't worry, I'm right beside you." said 10 times; world_6 "Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!" said 2 times
- **did-it-after-praise**: reward @3:35.8; reward @7:04.8; reward @10:09.1; reward @14:34.8; reward @20:31.8
- **speaker-tip**: w5-1 @1:14.3 cut; w5-1 @1:18.9 cut; w5-1 @1:24.7 cut; w5-3 @8:11.9 cut; w5-3 @8:20.0 cut
- **map-hint-cut**: map @0:04.4 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: w5-1 @0:05.0 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; w5-2 @5:01.7 ‹audit_baron_first› "Baron Muddle hid the sounds. Let's win them back from his monsters."; w5-4 @11:26.6 ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so"; w5-6 @17:14.2 ‹audit_dojo_back› "Back to the dojo! Let's learn some new sounds."; w5-7 @22:14.0 ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t"
- **swap-place-heard**: w5-4 @11:39.7 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w5-4 @11:50.8 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut; w5-8 @24:21.8 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut; w5-8 @24:35.5 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w5-8 @25:11.9 ‹audit_swap_middle› "Yes, the middle sound changes! Now pick the new sound." cut
- **praise-rate**: 110 praise lines in 34.5 min
- **praise-stacks**: w5-1 @1:21.3: "Ninja power!" → "Keep going, ninja."; w5-1 @1:25.7: "Keep going, ninja." → "Lovely!"; w5-1 @1:29.9: "Lovely!" → "Super!"; w5-1 @3:29.6: "Wow, great listening!" → "Well done! You practised so hard!"; reward @3:35.8: "You did it!" → "You won back some sounds!"
- **line-60s**: ‹listen› "Listen..." from w5-1 @0:10.6; ‹t_two_letters› "It's two letters, but it's one sound." from w5-1 @0:19.8; ‹dojo_tap_say› "Tap it, and say it with me!" from w5-1 @0:23.0; ‹audit_spell_it› "And this is how we spell it." from w5-1 @0:30.1; ‹dojo_find› "Can you find..." from w5-1 @1:11.8; ‹tut_speaker› "Tap the speaker to hear the sound again." from w5-1 @1:14.3
- **cut-explanations**: map @0:04.4 ‹map_hint› "Tap the glowing stone to start your next adventure."; w5-1 @1:14.3 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-1 @1:18.9 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-1 @1:24.7 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-3 @8:11.9 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-3 @8:20.0 ‹tut_speaker› "Tap the speaker to hear the sound again."
- **unframed-turn**: sort (w6-br1 33:01.8): no narrated demo, no Ready hold. Opens: "You know this sound! Now let's look at the differe" · "Sorting time! These words have the same sound, but"
- **over-framed**: ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some" at w5-3 @7:12.5, again after w5-1 @0:05.0; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t" at w5-7 @22:14.0, again after w5-2 @5:06.1; ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so" at w5-8 @24:08.6, again after w5-4 @11:26.6; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t" at w5-9 @25:35.9, again after w5-7 @22:14.0
- **bare-command**: ‹listen› "Listen..." ×14; ‹battle_spell› "Spell..." ×3
- **bare-listen**: w5-1 @0:10.6 after dojo_hello: "Listen…" /sh/; w5-1 @0:27.0 after yay_1: "Listen…" /ch/ /ch/; w5-1 @0:39.4 after yay_4: "Listen…" /th/ /th/; w5-1 @0:54.1 after yay_1: "Listen…" /dh/ /dh/; w5-3 @7:18.1 after dojo_hello: "Listen…" /k/ /k/; w5-3 @7:38.7 after streak_3: "Listen…" /ng/ /ng/
- **talk-before-action**: sort (w6-br1) 17.6 s from ‹audit_bridging_first› "You know this sound! Now let's look at the different ways we spell it." to ‹help_sort› "Tap the chest with the same spelling as the word."
- **turn-median**: turns under 8 words: 78 of 153
- **rhetorical-question**: ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time." ×2
- **shouted-instruction**: ‹dojo_tap_say› "Tap it, and say it with me!" ×11; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!" ×3; ‹audit_sounds_again› "Listen to the sounds, and catch the word they make!" ×3; ‹run_start› "Ninja Run! Tap to jump, and catch the right word!" ×1; ‹battle_boss› "A big boss monster! Listen carefully, and spell your best!" ×1

### C6-L: playtest/fix/baseline/transcripts/continuous-learner-from-w6-br1.json

learner, from w6-br1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 28 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 15 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 6 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 2 | **FAIL** |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 4 | **FAIL** |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_6 ×13 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 12 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 8 (8 cut) | **FAIL** |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 2 | **FAIL** |
| `over-map` level lines started over the map | 0 | 10 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 3.35 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 20 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 5 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 9 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 1 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 1 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 11 said (2 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 8; 4 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 17.6 s (sort w6-br1); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 7 words (median line 7 words; 116 turns) | **FAIL** |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 2 said (2 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 13 said (5 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **letters-60s**: w6-1 @3:51.1 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-1 @4:28.2 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; world flower @6:35.3 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-2 @7:05.7 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-2 @7:10.0 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-3 @8:58.4 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **letters-echo**: level w6-4 @11:58.5 (one breath): Sorting time! Same sound, different spellings. This sound can be spelt in two ways. /ee/ It's two letters, but it's one sound. /ee/ It's two letters, but it's one sound. Tap the chest wi; level w6-8 @19:10.2 (one breath): This sound can be spelt in two ways. /oe/ It's two letters, but it's one sound. /oe/ It's two letters, but it's one sound. Tap the chest with the same spelling as the word. "grow"
- **same-sound-after-reveal**: w6-1 @3:44.2 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-3 @8:51.5 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-6 @15:54.9 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-ec11 @20:59.7 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"
- **world-welcomes**: world_6 "Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!" said 13 times
- **did-it-after-praise**: reward @1:29.9; level w6-br2 @3:03.3; reward @5:51.5; reward @8:13.3; reward @10:51.1
- **speaker-tip**: w6-1 @4:01.6 cut; w6-1 @4:07.2 cut; w6-3 @9:08.5 cut; w6-3 @9:14.1 cut; w6-6 @16:11.4 cut
- **map-hint-cut**: map @0:04.4 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: w6-br1 @0:05.7 ‹audit_bridging_first› "You know this sound! Now let's look at the different ways we spell it."; w6-br2 @1:50.9 ‹audit_sort_again› "Sorting time! Same sound, different spellings."; w6-1 @3:15.0 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; w6-2 @6:58.2 ‹audit_sort_again› "Sorting time! Same sound, different spellings."; w6-4 @11:58.5 ‹audit_sort_again› "Sorting time! Same sound, different spellings."
- **praise-rate**: 100 praise lines in 29.9 min
- **praise-stacks**: w6-br2 @3:00.7: "Sorted! What a clever ninja." → "You did it!"; w6-1 @4:08.8: "Well done." → "Keep going, ninja."; w6-1 @5:46.3: "Well done." → "Well done! You practised so hard!"; reward @5:51.5: "You did it!" → "You won back some sounds!"; w6-2 @8:07.2: "Ten in a row! Look how your ninja is glowing!" → "Sorted! What a clever ninja."
- **line-60s**: ‹t_two_letters› "It's two letters, but it's one sound." from w6-1 @3:29.7; ‹yay_8› "Wow, great listening!" from w6-3 @9:10.0; ‹listen› "Listen..." from w6-6 @15:33.6; ‹story_your_turn› "Your turn to read." from w6-10 @28:37.6; ‹well_read› "Well read!" from w6-10 @28:38.1
- **cut-explanations**: map @0:04.4 ‹map_hint› "Tap the glowing stone to start your next adventure."; w6-1 @4:01.6 ‹tut_speaker› "Tap the speaker to hear the sound again."; w6-1 @4:07.2 ‹tut_speaker› "Tap the speaker to hear the sound again."; w6-3 @9:08.5 ‹tut_speaker› "Tap the speaker to hear the sound again."; w6-3 @9:14.1 ‹tut_speaker› "Tap the speaker to hear the sound again."; w6-6 @16:11.4 ‹tut_speaker› "Tap the speaker to hear the sound again."
- **unframed-turn**: sort (w6-br1 0:05.6): no narrated demo, no Ready hold. Opens: "Tap the glowing stone to start your next adventure" · "You know this sound! Now let's look at the differe"
- **over-framed**: ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some" at w6-3 @8:24.7, again after w6-1 @3:15.0
- **bare-command**: ‹listen› "Listen..." ×10; ‹battle_spell› "Spell..." ×1
- **bare-listen**: w6-1 @3:20.6 after dojo_hello: "Listen…" /ae/; w6-1 @3:37.6 after tv_yay_thats_it: "Listen…" /ae/ /ae/; w6-3 @8:30.4 after dojo_hello: "Listen…" /ee/; w6-3 @8:44.5 after tv_yay_lovely: "Listen…" /ee/; w6-6 @15:33.6 after audit_dojo_back: "Listen…" /oe/; w6-6 @15:48.1 after tv_yay_thats_it: "Listen…" /oe/
- **talk-before-action**: sort (w6-br1) 17.6 s from ‹audit_bridging_first› "You know this sound! Now let's look at the different ways we spell it." to ‹help_sort› "Tap the chest with the same spelling as the word."
- **turn-median**: turns under 8 words: 60 of 116
- **rhetorical-question**: ‹jump_offer› "Wow! You got everything right. Is this too easy? You can jump ahead!" ×1; ‹story:s6_3› "Why are you so grumpy, Baron? asked Super Ninja. The Baron sniffed. Nobody ever reads ME a story..." ×1
- **shouted-instruction**: ‹dojo_tap_say› "Tap it, and say it with me!" ×8; ‹audit_sounds_again› "Listen to the sounds, and catch the word they make!" ×2; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!" ×1; ‹t_everyone_say› "Say that sound with me!" ×1; ‹run_start› "Ninja Run! Tap to jump, and catch the right word!" ×1

### C-L: playtest/fix/baseline/transcripts/continuous-learner.json

learner, a brand-new child, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_1 ×12 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 8 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 0 (day one) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 10 of 13 | **FAIL** |
| `over-map` level lines started over the map | 0 | 6 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 10 (4 repeats) | **FAIL** |
| `swap-place-heard` swap place lines heard to the end | all | 0 of 3 | **FAIL** |
| `praise-rate` praise lines a minute | ≤ 1.5 | 2.01 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 7 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 9 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 13 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 19 of 19 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 9 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 35 said (11 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 29.5 s (build w1-4); 10 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 11 words (median line 4 words; 116 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 16 said (5 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 46 said (25 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 11 | **FAIL** |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **world-welcomes**: world_1 "Welcome to Bamboo Village!" said 12 times
- **did-it-after-praise**: sticker book @12:25.4; reward @14:29.2; reward @17:44.4; reward @20:31.0; reward @22:56.9
- **map-hint-cut**: map @7:52.0 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @9:20.5 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @11:14.9 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @12:31.9 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @15:59.7 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: w1-wu3 @6:03.0 ‹fm_l1_hello› "Ninja ears on! Let's listen to some words."; w1-wu4 @7:54.8 ‹fm_l2_way› "Ninjas read this way!"; w1-wu5 @9:22.8 ‹fm_l1_hello› "Ninja ears on! Let's listen to some words."; w1-5 @20:45.8 ‹three_sounds› "This word has three sounds!"; w1-6 @23:12.9 ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t"
- **how-we-spell**: w1-2 /s/: 2×; w1-3 /a/: 2×; w1-3 /t/: 2×; w1-7 /i/: 2×
- **swap-place-heard**: w1-8 @29:24.5 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w1-8 @29:40.5 ‹audit_swap_middle› "Yes, the middle sound changes! Now pick the new sound." cut; w1-8 @30:22.3 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut
- **praise-rate**: 67 praise lines in 33.3 min
- **praise-stacks**: w1-wu1 @3:25.1: "You found them both! They both start with..." → "You can hear the sounds in words. Brilliant listening!"; w1-2 @14:16.4: "Keep going, ninja." → "Wow, great listening!"; reward @14:29.2: "You did it!" → "You won back some sounds!"; w1-3 @17:35.9: "That's it!" → "Wow, great listening!"; reward @17:44.4: "You did it!" → "You won back some sounds!"
- **line-60s**: ‹fm_which_pic› "Which picture is it?" from w1-wu5 @9:44.1; ‹first_q› "Which one starts with..." from w1-2 @12:43.5; ‹how_we_spell› "This is how we spell..." from w1-2 @13:05.4; ‹hunt_q› "Which one has this sound in it?" from w1-7 @24:55.2; ‹read_tap_sounds› "Tap each sound, and say it." from w1-7 @27:33.0; ‹read_who› "Who read it right?" from w1-7 @27:38.0
- **cut-explanations**: map @7:52.0 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @9:20.5 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @11:14.9 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @12:31.9 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @15:59.7 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @18:27.3 ‹map_hint› "Tap the glowing stone to start your next adventure."
- **unframed-turn**: tap (w1-wu1 2:13.3): no frame line (tv_ears_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Ninja ears on! Let's listen to some words." · "This is the sun."; fastslow (w1-wu1 2:25.7): no frame line (tv_ts_meet), no narrated demo, no Ready hold. Opens: "Watch me first!" · "I can say a word fast. Sun!"; notice (w1-wu1 2:50.7): no frame line (tv_notice_frame/tv_ears_on), no hand-over. Opens: "Listen to the very first sound." · "Sun and sock start with the same sound..."; tapall (w1-wu1 3:07.4): no frame line (tv_pocket_frame), no narrated demo, no Ready hold, no hand-over. Opens: "This is a sausage." · "This is the moon."; rail (w1-wu2 3:58.0): no frame line (tv_rail_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Ninjas read this way!" · "This is a fish."; which (w1-wu2 4:26.8): no frame line (tv_which_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Fish dog!" · "Watch me first!"
- **over-framed**: ‹fm_l1_hello› "Ninja ears on! Let's listen to some words." at w1-wu3 @6:03.0, again after w1-wu1 @2:05.3; ‹fm_tap_all_in› "Tap all the pictures with this sound in them..." at w1-wu3 @7:13.5, again after w1-wu3 @6:53.2; ‹fm_tap_all_start› "Tap all the pictures that start with..." at w1-wu3 @7:23.7, again after w1-wu1 @3:12.1; ‹fm_l2_way› "Ninjas read this way!" at w1-wu4 @7:54.8, again after w1-wu2 @3:58.4; ‹fm_l1_hello› "Ninja ears on! Let's listen to some words." at w1-wu5 @9:22.8, again after w1-wu3 @6:03.0; ‹first_intro› "Every word starts with a sound. Let's listen for the very first sound!" at w1-3 @16:01.7, again after w1-2 @12:33.9
- **bare-command**: ‹ido› "Watch me first!" ×8; ‹listen_again› "Listen again." ×7; ‹fm_you_try› "Now you try!" ×4; ‹find_q› "Find this sound..." ×4; ‹fm_show_me_2› "Watch me first!" ×3; ‹fm_tap_sock› "Tap the sock!" ×2
- **talk-before-action**: build (w1-4) 29.5 s from ‹two_sounds› "This word has two sounds!" to ‹first_sound_q› "What's the first sound?"; soundhunt (w1-7) 26.3 s from ‹audit_middle_place› "The middle sound comes after the first sound, and before the last soun" to ‹hunt_q› "Which one has this sound in it?"; firstsound (w1-2) 20.9 s from ‹ido› "Watch me first!" to ‹first_q› "Which one starts with..."; firstsound (w1-2) 20.5 s from ‹fs_mop› "Mop starts with..." to ‹first_q› "Which one starts with..."; fastslow (w1-wu1) 16.7 s from ‹word:sock› "sock" to ‹fm_tap_tortoise› "Now you tap the tortoise, and say it slowly with me."; compound (w1-wu2) 15.2 s from ‹fm_pair_cat_dog› "Cat dog!" to ‹fm_starfish_q› "Star... fish. Tap the rabbit, and say them fast."
- **rhetorical-question**: ‹what_changed› "What changed? Listen here." ×6; ‹read_who› "Who read it right?" ×5; ‹read_intro› "Who read it right? Listen to Kai and Suki!" ×3; ‹audit_made_of_sounds› "Remember? Words are made of sounds!" ×1; ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time." ×1
- **shouted-instruction**: ‹ido› "Watch me first!" ×8; ‹fm_you_try› "Now you try!" ×4; ‹fm_l1_hello› "Ninja ears on! Let's listen to some words." ×3; ‹fm_show_me_2› "Watch me first!" ×3; ‹read_intro› "Who read it right? Listen to Kai and Suki!" ×3; ‹audit_sounds_again› "Listen to the sounds, and catch the word they make!" ×3
- **demo-command**: w1-wu1 @2:14.2 ‹fm_tap_sun› "Tap the sun!" during ‹fm_show_me› "Let me show you!"; w1-wu1 @3:12.1 ‹fm_tap_all_start› "Tap all the pictures that start with..." during ‹fm_show_me› "Let me show you!"; w1-wu3 @6:26.0 ‹fm_slow_listen› "Listen to my slow word..." during ‹fm_show_me_2› "Watch me first!"; w1-wu3 @6:30.3 ‹fm_which_pic› "Which picture is it?" during ‹fm_show_me_2› "Watch me first!"; w1-wu3 @6:53.2 ‹fm_tap_all_in› "Tap all the pictures with this sound in them..." during ‹fm_show_me› "Let me show you!"; w1-2 @12:43.5 ‹first_q› "Which one starts with..." during ‹ido› "Watch me first!"

### C5-P: playtest/fix/baseline/transcripts/continuous-perfect-from-w5-1.json

perfect, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 12 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 5 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 2 sounds | **FAIL** |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 2 | **FAIL** |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×10, world_6 ×2 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 10 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 2 | **FAIL** |
| `over-map` level lines started over the map | 0 | 11 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 of 5 | **FAIL** |
| `praise-rate` praise lines a minute | ≤ 1.5 | 3.86 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 20 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 18 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 6 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 1 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 4 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 14 said (2 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 11; 3 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 17.6 s (sort w6-br1); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 7 words (median line 4 words; 137 turns) | **FAIL** |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 3 said (2 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 18 said (5 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **letters-60s**: w5-1 @0:33.0 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-1 @0:46.4 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @6:06.0 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @6:22.1 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @6:50.7 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **letters-twice**: /ch/: 2× (w5-1 0:33.0, w5-6 13:56.0); ?/: 3× (world flower 3:12.2, w5-3 5:52.2, world flower 8:10.9)
- **same-sound-after-reveal**: w5-3 @5:45.3 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w5-6 @13:04.8 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"
- **world-welcomes**: world_5 "Welcome to Shadow Castle. Don't worry, I'm right beside you." said 10 times; world_6 "Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!" said 2 times
- **did-it-after-praise**: reward @2:44.9; reward @5:24.3; reward @7:46.9; reward @9:58.8; reward @15:10.4
- **map-hint-cut**: map @0:04.4 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: w5-1 @0:05.1 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; w5-2 @4:06.0 ‹audit_baron_first› "Baron Muddle hid the sounds. Let's win them back from his monsters."; w5-3 @5:34.3 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; w5-4 @8:55.4 ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so"; w5-6 @12:55.9 ‹audit_dojo_back› "Back to the dojo! Let's learn some new sounds."
- **swap-place-heard**: w5-4 @9:08.6 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut; w5-4 @9:19.5 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w5-8 @18:14.0 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut; w5-8 @18:24.8 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w5-8 @18:35.6 ‹audit_swap_middle› "Yes, the middle sound changes! Now pick the new sound." cut
- **praise-rate**: 101 praise lines in 26.2 min
- **praise-stacks**: w5-1 @1:10.4: "Wow, great listening!" → "Brilliant!"; w5-1 @1:15.1: "Brilliant!" → "Ninja power!"; w5-1 @1:19.1: "Ninja power!" → "Well done."; w5-1 @1:22.6: "Well done." → "Brilliant!"; w5-1 @2:39.1: "Wow, great listening!" → "Well done! You practised so hard!"
- **line-60s**: ‹listen› "Listen..." from w5-1 @0:10.7; ‹t_two_letters› "It's two letters, but it's one sound." from w5-1 @0:20.0; ‹dojo_tap_say› "Tap it, and say it with me!" from w5-1 @0:23.1; ‹audit_spell_it› "And this is how we spell it." from w5-1 @0:30.6; ‹yay_1› "Brilliant!" from w5-1 @0:38.8; ‹dojo_find› "Can you find..." from w5-1 @1:12.2
- **cut-explanations**: map @0:04.4 ‹map_hint› "Tap the glowing stone to start your next adventure."; w5-4 @9:08.6 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound."; w5-4 @9:19.5 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound."; w5-8 @18:14.0 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound."; w5-8 @18:24.8 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound."; w5-8 @18:35.6 ‹audit_swap_middle› "Yes, the middle sound changes! Now pick the new sound."
- **unframed-turn**: sort (w6-br1 24:43.4): no narrated demo, no Ready hold. Opens: "You know this sound! Now let's look at the differe" · "Sorting time! These words have the same sound, but"
- **over-framed**: ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some" at w5-3 @5:34.3, again after w5-1 @0:05.1; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t" at w5-7 @16:36.2, again after w5-2 @4:10.4; ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so" at w5-8 @18:01.2, again after w5-4 @8:55.4; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t" at w5-9 @19:18.1, again after w5-7 @16:36.2
- **bare-command**: ‹listen› "Listen..." ×11; ‹battle_spell› "Spell..." ×3
- **bare-listen**: w5-1 @0:10.7 after dojo_hello: "Listen…" /sh/; w5-1 @0:27.5 after yay_8: "Listen…" /ch/ /ch/; w5-1 @0:39.9 after yay_1: "Listen…" /th/; w5-1 @0:53.9 after yay_2: "Listen…" /dh/ /dh/; w5-3 @5:39.9 after dojo_hello: "Listen…" /k/ /k/; w5-3 @5:59.6 after yay_4: "Listen…" /ng/ /ng/
- **talk-before-action**: sort (w6-br1) 17.6 s from ‹audit_bridging_first› "You know this sound! Now let's look at the different ways we spell it." to ‹help_sort› "Tap the chest with the same spelling as the word."
- **turn-median**: turns under 8 words: 86 of 137
- **rhetorical-question**: ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time." ×2; ‹jump_offer› "Wow! You got everything right. Is this too easy? You can jump ahead!" ×1
- **shouted-instruction**: ‹dojo_tap_say› "Tap it, and say it with me!" ×11; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!" ×3; ‹audit_sounds_again› "Listen to the sounds, and catch the word they make!" ×2; ‹run_start› "Ninja Run! Tap to jump, and catch the right word!" ×1; ‹battle_boss› "A big boss monster! Listen carefully, and spell your best!" ×1

### C6-P: playtest/fix/baseline/transcripts/continuous-perfect-from-w6-br1.json

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
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 2 | **FAIL** |
| `over-map` level lines started over the map | 0 | 9 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 3.31 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 17 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 6 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 1 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 1 of 1 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 1 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 9 said (2 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 8; 4 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s (named runs 15 s) | max 17.6 s (sort w6-br1); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 7 words (median line 6 words; 108 turns) | **FAIL** |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 2 said (2 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 13 said (5 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **letters-lines**: w6-br1 @0:20.2 ‹t_two_letters› "It's two letters, but it's one sound."; w6-br2 @1:53.0 ‹t_two_letters› "It's two letters, but it's one sound."; w6-br2 @1:56.9 ‹t_three_letters› "It's three letters, but it's just one sound."; w6-1 @3:17.5 ‹t_two_letters› "It's two letters, but it's one sound."; w6-1 @3:39.3 ‹t_two_letters› "It's two letters, but it's one sound."; world flower @5:06.9 ‹t_two_letters› "It's two letters, but it's one sound."
- **letters-60s**: w6-1 @3:39.3 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; world flower @5:28.2 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-2 @5:54.4 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-2 @5:58.7 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w6-3 @7:41.5 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; world flower @9:39.8 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **letters-twice**: /ch/: 2× (w6-br2 1:53.0, w6-br2 1:56.9); /ae/: 3× (w6-1 3:17.5, w6-2 5:54.4, w6-2 5:58.7); ?/: 12× (w6-1 3:39.3, world flower 5:06.9, world flower 5:28.2, w6-3 7:41.5, world flower 9:17.5, world flower 9:39.8, w6-6 13:28.9, world flower 15:02.0, world flower 15:24.2, w6-ec11 17:35.0, world flower 19:09.5, world flower 19:33.7); /ee/: 3× (w6-3 7:20.6, w6-4 10:06.3, w6-4 10:10.7); /oe/: 3× (w6-6 13:07.1, w6-8 15:50.7, w6-8 15:55.1); /ie/: 3× (w6-ec11 17:14.9, w6-7 20:00.5, w6-7 20:04.4)
- **letters-echo**: level w6-2 @5:50.6 (one breath): This sound can be spelt in two ways. /ae/ It's two letters, but it's one sound. /ae/ It's two letters, but it's one sound. Tap the chest with the same spelling as the word. "spray"; level w6-4 @10:02.3 (one breath): This sound can be spelt in two ways. /ee/ It's two letters, but it's one sound. /ee/ It's two letters, but it's one sound. Tap the chest with the same spelling as the word. "green"
- **same-sound-after-reveal**: w6-1 @3:32.4 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-3 @7:34.6 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-6 @13:22.1 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w6-ec11 @17:28.2 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"
- **world-welcomes**: world_6 "Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!" said 13 times
- **did-it-after-praise**: reward @1:26.0; reward @2:51.1; level w6-1 @4:48.4; reward @6:53.6; reward @8:58.9
- **map-hint-cut**: map @0:04.5 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: w6-2 @5:46.8 ‹audit_sort_again› "Sorting time! Same sound, different spellings."; w6-3 @7:08.0 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; w6-4 @9:58.5 ‹audit_sort_again› "Sorting time! Same sound, different spellings."; w6-5 @11:21.2 ‹audit_baron_first› "Baron Muddle hid the sounds. Let's win them back from his monsters."; w6-6 @12:56.9 ‹audit_dojo_back› "Back to the dojo! Let's learn some new sounds."
- **praise-rate**: 83 praise lines in 25.1 min
- **praise-stacks**: w6-1 @3:45.9: "Brilliant!" → "That's it!"; w6-1 @3:49.6: "That's it!" → "Brilliant!"; w6-1 @4:43.0: "Well done." → "Well done! You practised so hard!"; w6-1 @4:44.5: "Well done! You practised so hard!" → "You did it!"; w6-3 @7:48.2: "Wow, great listening!" → "Super!"
- **line-60s**: ‹tv_yay_thats_it› "That's it!" from w6-1 @3:49.6; ‹t_two_letters› "It's two letters, but it's one sound." from world flower @5:06.9; ‹tv_yay_lovely› "Lovely!" from w6-6 @13:35.1; ‹yay_1› "Brilliant!" from w6-6 @13:38.5; ‹story_your_turn› "Your turn to read." from w6-10 @23:55.3; ‹well_read› "Well read!" from w6-10 @23:55.9
- **cut-explanations**: map @0:04.5 ‹map_hint› "Tap the glowing stone to start your next adventure."
- **unframed-turn**: sort (w6-br1 0:05.8): no narrated demo, no Ready hold. Opens: "Tap the glowing stone to start your next adventure" · "You know this sound! Now let's look at the differe"
- **over-framed**: ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some" at w6-3 @7:08.0, again after w6-1 @3:03.0
- **bare-command**: ‹listen› "Listen..." ×8; ‹battle_spell› "Spell..." ×1
- **bare-listen**: w6-1 @3:08.6 after dojo_hello: "Listen…" /ae/; w6-1 @3:25.6 after yay_4: "Listen…" /ae/; w6-3 @7:13.6 after dojo_hello: "Listen…" /ee/; w6-3 @7:27.6 after tv_yay_lovely: "Listen…" /ee/; w6-6 @13:00.3 after audit_dojo_back: "Listen…" /oe/; w6-6 @13:15.3 after yay_4: "Listen…" /oe/
- **talk-before-action**: sort (w6-br1) 17.6 s from ‹audit_bridging_first› "You know this sound! Now let's look at the different ways we spell it." to ‹help_sort› "Tap the chest with the same spelling as the word."
- **turn-median**: turns under 8 words: 66 of 108
- **rhetorical-question**: ‹jump_offer› "Wow! You got everything right. Is this too easy? You can jump ahead!" ×1; ‹story:s6_3› "Why are you so grumpy, Baron? asked Super Ninja. The Baron sniffed. Nobody ever reads ME a story..." ×1
- **shouted-instruction**: ‹dojo_tap_say› "Tap it, and say it with me!" ×8; ‹audit_sounds_again› "Listen to the sounds, and catch the word they make!" ×2; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!" ×1; ‹t_everyone_say› "Say that sound with me!" ×1; ‹run_start› "Ninja Run! Tap to jump, and catch the right word!" ×1

### C-P: playtest/fix/baseline/transcripts/continuous-perfect.json

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
| `over-map` level lines started over the map | 0 | 7 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 16 (7 repeats) | **FAIL** |
| `swap-place-heard` swap place lines heard to the end | all | 0 of 3 | **FAIL** |
| `praise-rate` praise lines a minute | ≤ 1.5 | 1.96 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 11 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 5 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 12 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 18 of 18 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 9 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 31 said (9 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 29.3 s (build w1-4); 9 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 11 words (median line 4 words; 100 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 15 said (4 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 47 said (24 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 14 | **FAIL** |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **world-welcomes**: world_1 "Welcome to Bamboo Village!" said 11 times
- **did-it-after-praise**: sticker book @7:35.5; reward @9:26.9; reward @12:13.4; reward @14:46.9; reward @17:02.0
- **map-hint-cut**: map @7:40.7 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @10:42.3 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @12:49.4 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @14:58.5 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @17:14.1 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: w1-wu3 @5:15.7 ‹fm_l1_hello› "Ninja ears on! Let's listen to some words."; w1-2 @7:42.8 ‹first_intro› "Every word starts with a sound. Let's listen for the very first sound!"; w1-3 @10:44.4 ‹first_intro› "Every word starts with a sound. Let's listen for the very first sound!"; w1-4 @12:51.5 ‹audit_dojo_first› "This is our dojo. Here we listen to sounds, make words, and read them."; w1-5 @15:00.6 ‹three_sounds› "This word has three sounds!"
- **how-we-spell**: w1-2 /s/: 2×; w1-3 /a/: 2×; w1-3 /t/: 2×; w1-7 /i/: 2×; w1-10 /n/: 2×; w1-10 /p/: 2×
- **swap-place-heard**: w1-8 @21:15.3 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w1-8 @21:28.8 ‹audit_swap_middle› "Yes, the middle sound changes! Now pick the new sound." cut; w1-8 @24:12.4 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut
- **praise-rate**: 65 praise lines in 33.2 min
- **praise-stacks**: w1-wu1 @3:02.8: "You found them both! They both start with..." → "You can hear the sounds in words. Brilliant listening!"; w1-wu3 @6:33.4: "You found them all!" → "You can hear the sounds in words. Brilliant listening!"; w1-2 @9:19.2: "Lovely!" → "That's it!"; reward @9:26.9: "You did it!" → "You won back some sounds!"; w1-3 @12:05.9: "Brilliant!" → "Well done."
- **line-60s**: ‹first_q› "Which one starts with..." from w1-2 @7:52.9; ‹how_we_spell› "This is how we spell..." from w1-2 @8:14.4; ‹hunt_q› "Which one has this sound in it?" from w1-7 @18:29.3; ‹swap_make› "Change it to make..." from w1-8 @21:06.2; ‹what_changed› "What changed? Listen here." from w1-8 @21:11.8
- **cut-explanations**: map @7:40.7 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @10:42.3 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @12:49.4 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @14:58.5 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @17:14.1 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @18:13.8 ‹map_hint› "Tap the glowing stone to start your next adventure."
- **unframed-turn**: tap (w1-wu1 1:53.0): no frame line (tv_ears_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Ninja ears on! Let's listen to some words." · "This is the sun."; fastslow (w1-wu1 2:00.1): no frame line (tv_ts_meet), no narrated demo, no Ready hold. Opens: "Watch me first!" · "I can say a word fast. Sun!"; notice (w1-wu1 2:29.6): no frame line (tv_notice_frame/tv_ears_on), no hand-over. Opens: "Listen to the very first sound." · "Sun and sock start with the same sound..."; tapall (w1-wu1 2:43.3): no frame line (tv_pocket_frame), no narrated demo, no Ready hold, no hand-over. Opens: "This is a sausage." · "This is the moon."; rail (w1-wu2 3:32.6): no frame line (tv_rail_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Ready for the next game? Tap the big arrow!" · "Ninjas read this way!"; which (w1-wu2 3:59.7): no frame line (tv_which_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Fish dog!" · "Watch me first!"
- **over-framed**: ‹fm_l1_hello› "Ninja ears on! Let's listen to some words." at w1-wu3 @5:15.7, again after w1-wu1 @1:44.4; ‹fm_tap_all_start› "Tap all the pictures that start with..." at w1-wu3 @6:19.3, again after w1-wu1 @2:48.2; ‹first_intro› "Every word starts with a sound. Let's listen for the very first sound!" at w1-3 @10:44.4, again after w1-2 @7:42.8; ‹fm_l2_way› "Ninjas read this way!" at w1-4 @13:06.8, again after w1-wu2 @3:33.5; ‹read_intro› "Who read it right? Listen to Kai and Suki!" at w1-5 @16:41.0, again after w1-4 @14:26.9; ‹read_intro› "Who read it right? Listen to Kai and Suki!" at w1-7 @20:02.5, again after w1-5 @16:41.0
- **bare-command**: ‹ido› "Watch me first!" ×13; ‹find_q› "Find this sound..." ×6; ‹fm_you_try› "Now you try!" ×3; ‹fm_show_me_2› "Watch me first!" ×3; ‹fm_you_try_2› "Your turn!" ×2; ‹fm_tap_sun› "Tap the sun!" ×1
- **talk-before-action**: build (w1-4) 29.3 s from ‹two_sounds› "This word has two sounds!" to ‹first_sound_q› "What's the first sound?"; soundhunt (w1-7) 26.3 s from ‹audit_middle_place› "The middle sound comes after the first sound, and before the last soun" to ‹hunt_q› "Which one has this sound in it?"; firstsound (w1-2) 21.4 s from ‹ido› "Watch me first!" to ‹first_q› "Which one starts with..."; firstsound (w1-2) 20.0 s from ‹fs_map› "Map starts with..." to ‹first_q› "Which one starts with..."; fastslow (w1-wu1) 15.6 s from ‹fm_show_me_2› "Watch me first!" to ‹fm_tap_tortoise› "Now you tap the tortoise, and say it slowly with me."; compound (w1-wu2) 15.5 s from ‹fm_pair_cat_dog› "Cat dog!" to ‹fm_starfish_q› "Star... fish. Tap the rabbit, and say them fast."
- **rhetorical-question**: ‹what_changed› "What changed? Listen here." ×6; ‹read_intro› "Who read it right? Listen to Kai and Suki!" ×4; ‹read_who› "Who read it right?" ×4; ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time." ×1
- **shouted-instruction**: ‹ido› "Watch me first!" ×13; ‹read_intro› "Who read it right? Listen to Kai and Suki!" ×4; ‹fm_you_try› "Now you try!" ×3; ‹fm_show_me_2› "Watch me first!" ×3; ‹audit_sounds_again› "Listen to the sounds, and catch the word they make!" ×3; ‹fm_l1_hello› "Ninja ears on! Let's listen to some words." ×2
- **demo-command**: w1-wu1 @1:53.7 ‹fm_tap_sun› "Tap the sun!" during ‹fm_show_me› "Let me show you!"; w1-wu1 @2:48.2 ‹fm_tap_all_start› "Tap all the pictures that start with..." during ‹fm_show_me› "Let me show you!"; w1-wu3 @5:37.6 ‹fm_slow_listen› "Listen to my slow word..." during ‹fm_show_me_2› "Watch me first!"; w1-wu3 @5:41.8 ‹fm_which_pic› "Which picture is it?" during ‹fm_show_me_2› "Watch me first!"; w1-wu3 @6:00.3 ‹fm_tap_all_in› "Tap all the pictures with this sound in them..." during ‹fm_show_me› "Let me show you!"; w1-2 @7:52.9 ‹first_q› "Which one starts with..." during ‹ido› "Watch me first!"

### C5-S: playtest/fix/baseline/transcripts/continuous-splitter-from-w5-1.json

splitter, from w5-1, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 16 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 5 | **FAIL** |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 3 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 2 | **FAIL** |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_5 ×8 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 7 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 1 (one session) | 1 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 10 (10 cut) | **FAIL** |
| `map-hint-cut` map hint cut by the next level | 0 | 1 of 2 | **FAIL** |
| `over-map` level lines started over the map | 0 | 5 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 0 (0 repeats) | n/a |
| `swap-place-heard` swap place lines heard to the end | all | 1 of 4 | **FAIL** |
| `praise-rate` praise lines a minute | ≤ 1.5 | 4.12 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 18 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 14 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 14 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | 4 of 6 (67%) | **FAIL** |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | n/a | n/a |
| `over-framed` a replay that plays a full frame again | 0 | 3 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 15 said (2 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 11; 3 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 15 s | n/a | n/a |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 4 words; 106 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 3 said (2 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 16 said (4 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **letters-60s**: w5-1 @0:32.2 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-1 @0:45.8 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @7:13.4 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @7:26.9 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s; w5-3 @7:43.4 ‹t_two_letters› "It's two letters, but it's one sound." again within 60 s
- **same-sound-after-reveal**: w5-3 @7:06.5 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"; w5-6 @15:44.6 ‹same_sound_new› "Ooh! You already know this sound. Here's another way to spell it! Same"
- **world-welcomes**: world_5 "Welcome to Shadow Castle. Don't worry, I'm right beside you." said 8 times
- **did-it-after-praise**: reward @3:22.6; reward @6:43.9; reward @9:56.3; reward @12:29.2; reward @18:22.2
- **speaker-tip**: w5-1 @1:14.6 cut; w5-1 @1:18.4 cut; w5-1 @1:24.2 cut; w5-3 @7:52.5 cut; w5-3 @7:57.0 cut
- **map-hint-cut**: map @0:04.3 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: w5-1 @0:05.0 ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some"; w5-2 @4:55.4 ‹audit_baron_first› "Baron Muddle hid the sounds. Let's win them back from his monsters."; w5-4 @11:16.4 ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so"; w5-7 @20:09.1 ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t"; w5-8 @21:50.8 ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so"
- **swap-place-heard**: w5-4 @11:29.6 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut; w5-4 @11:42.7 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w5-8 @22:04.5 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut
- **praise-rate**: 96 praise lines in 23.3 min
- **praise-stacks**: w5-1 @1:10.8: "Brilliant!" → "That's it!"; w5-1 @1:20.8: "Ninja power!" → "Wow, great listening!"; w5-1 @1:25.4: "Wow, great listening!" → "Brilliant!"; w5-1 @2:55.3: "Ninja power!" → "Well done."; w5-1 @3:17.1: "Brilliant!" → "Well done! You practised so hard!"
- **line-60s**: ‹listen› "Listen..." from w5-1 @0:10.6; ‹t_two_letters› "It's two letters, but it's one sound." from w5-1 @0:19.8; ‹dojo_tap_say› "Tap it, and say it with me!" from w5-1 @0:23.0; ‹audit_spell_it› "And this is how we spell it." from w5-1 @0:29.8; ‹dojo_find› "Can you find..." from w5-1 @1:12.1; ‹tut_speaker› "Tap the speaker to hear the sound again." from w5-1 @1:14.6
- **cut-explanations**: map @0:04.3 ‹map_hint› "Tap the glowing stone to start your next adventure."; w5-1 @1:14.6 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-1 @1:18.4 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-1 @1:24.2 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-3 @7:52.5 ‹tut_speaker› "Tap the speaker to hear the sound again."; w5-3 @7:57.0 ‹tut_speaker› "Tap the speaker to hear the sound again."
- **split-correction**: w5-4 @11:52.9 tapped < n > for < ng >: then "Now pick the new sound." · "Keep going, ninja." · "Listen..."; w5-8 @22:14.4 tapped < h > for < tch >: then "Yes, the last sound changes! Now pick the new sound." · "Keep going, ninja." · "Listen..."
- **over-framed**: ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some" at w5-3 @6:55.5, again after w5-1 @0:05.0; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t" at w5-7 @20:09.1, again after w5-2 @4:59.8; ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one so" at w5-8 @21:50.8, again after w5-4 @11:16.4
- **bare-command**: ‹listen› "Listen..." ×13; ‹battle_spell› "Spell..." ×2
- **bare-listen**: w5-1 @0:10.6 after dojo_hello: "Listen…" /sh/; w5-1 @0:26.7 after tv_yay_thats_it: "Listen…" /ch/ /ch/; w5-1 @0:39.4 after yay_4: "Listen…" /th/ /th/; w5-1 @0:54.4 after yay_8: "Listen…" /dh/ /dh/; w5-3 @7:01.1 after dojo_hello: "Listen…" /k/ /k/; w5-3 @7:20.5 after streak_3: "Listen…" /ng/ /ng/
- **rhetorical-question**: ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time." ×2; ‹jump_offer› "Wow! You got everything right. Is this too easy? You can jump ahead!" ×1
- **shouted-instruction**: ‹dojo_tap_say› "Tap it, and say it with me!" ×11; ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!" ×2; ‹audit_sounds_again› "Listen to the sounds, and catch the word they make!" ×2; ‹run_start› "Ninja Run! Tap to jump, and catch the right word!" ×1

### C-W: playtest/fix/baseline/transcripts/continuous-watcher.json

watcher, a brand-new child, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_1 ×14, world_2 ×4 | **FAIL** |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 15 | **FAIL** |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 0 (day one) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 2 (2 cut) | **FAIL** |
| `map-hint-cut` map hint cut by the next level | 0 | 12 of 19 | **FAIL** |
| `over-map` level lines started over the map | 0 | 9 | **FAIL** |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 16 (7 repeats) | **FAIL** |
| `swap-place-heard` swap place lines heard to the end | all | 0 of 6 | **FAIL** |
| `praise-rate` praise lines a minute | ≤ 1.5 | 2.70 | **FAIL** |
| `praise-stacks` praise stacks within 5 s | 0 | 20 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 15 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 20 | **FAIL** |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` "You're a ninja master!" before 7 whole answers (proxy) | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 21 of 21 games | **FAIL** |
| `over-framed` a replay that plays a full frame again | 0 | 13 | **FAIL** |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 39 said (12 lines) | **FAIL** |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 4 (4 in w2-1); 1 after quiet or before the level's first tap | **FAIL** |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 29.4 s (build w1-4); 8 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 10 words (median line 4 words; 168 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 29 said (4 lines) | **FAIL** |
| `shouted-instruction` instructions that end in "!" | 0 | 59 said (28 lines) | **FAIL** |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 14 | **FAIL** |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | no | **FAIL** |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | n/a | n/a |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 re-asked | n/a | n/a |

- **world-welcomes**: world_1 "Welcome to Bamboo Village!" said 14 times; world_2 "Welcome to Blossom Hills!" said 4 times
- **did-it-after-praise**: sticker book @7:38.7; reward @9:32.9; reward @12:19.2; reward @14:52.2; reward @17:07.7
- **speaker-tip**: w2-1 @40:15.4 cut; w2-1 @40:22.2 cut
- **map-hint-cut**: map @7:43.8 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @10:47.7 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @12:54.7 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @15:03.9 ‹map_hint› "Tap the glowing stone to start your next adventure." cut; map @17:19.9 ‹map_hint› "Tap the glowing stone to start your next adventure." cut
- **over-map**: w1-wu3 @5:19.0 ‹fm_l1_hello› "Ninja ears on! Let's listen to some words."; w1-2 @7:45.9 ‹first_intro› "Every word starts with a sound. Let's listen for the very first sound!"; w1-3 @10:49.8 ‹first_intro› "Every word starts with a sound. Let's listen for the very first sound!"; w1-4 @12:56.8 ‹audit_dojo_first› "This is our dojo. Here we listen to sounds, make words, and read them."; w1-6 @17:22.6 ‹battle_start› "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words t"
- **how-we-spell**: w1-2 /s/: 2×; w1-3 /a/: 2×; w1-3 /t/: 2×; w1-7 /i/: 2×; w1-10 /n/: 2×; w1-10 /p/: 2×
- **swap-place-heard**: w1-8 @21:19.9 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut; w1-8 @21:33.0 ‹audit_swap_middle› "Yes, the middle sound changes! Now pick the new sound." cut; w1-8 @22:14.7 ‹audit_swap_last› "Yes, the last sound changes! Now pick the new sound." cut; w1-12 @31:37.0 ‹audit_swap_middle› "Yes, the middle sound changes! Now pick the new sound." cut; w1-12 @31:50.5 ‹audit_swap_first› "Yes, the first sound changes! Now pick the new sound." cut
- **praise-rate**: 124 praise lines in 46.0 min
- **praise-stacks**: w1-wu1 @3:00.4: "You found them both! They both start with..." → "You can hear the sounds in words. Brilliant listening!"; w1-wu3 @6:36.7: "You found them all!" → "You can hear the sounds in words. Brilliant listening!"; w1-2 @9:24.3: "Well done." → "Lovely!"; reward @9:32.9: "You did it!" → "You won back some sounds!"; w1-3 @12:12.4: "Brilliant!" → "Super!"
- **line-60s**: ‹first_q› "Which one starts with..." from w1-2 @7:54.9; ‹how_we_spell› "This is how we spell..." from w1-2 @8:16.1; ‹hunt_q› "Which one has this sound in it?" from w1-7 @18:34.4; ‹swap_make› "Change it to make..." from w1-8 @21:10.9; ‹what_changed› "What changed? Listen here." from w1-8 @21:16.5; ‹swap_pick› "Now pick the new sound." from w1-8 @21:46.3
- **cut-explanations**: map @7:43.8 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @10:47.7 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @12:54.7 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @15:03.9 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @17:19.9 ‹map_hint› "Tap the glowing stone to start your next adventure."; map @18:18.9 ‹map_hint› "Tap the glowing stone to start your next adventure."
- **unframed-turn**: tap (w1-wu1 1:49.7): no frame line (tv_ears_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Ninja ears on! Let's listen to some words." · "This is the sun."; fastslow (w1-wu1 1:56.7): no frame line (tv_ts_meet), no narrated demo, no Ready hold. Opens: "Watch me first!" · "I can say a word fast. Sun!"; notice (w1-wu1 2:26.8): no frame line (tv_notice_frame/tv_ears_on), no hand-over. Opens: "Listen to the very first sound." · "Sun and sock start with the same sound..."; tapall (w1-wu1 2:41.8): no frame line (tv_pocket_frame), no narrated demo, no Ready hold, no hand-over. Opens: "This is a sausage." · "This is the moon."; rail (w1-wu2 3:30.3): no frame line (tv_rail_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Ready for the next game? Tap the big arrow!" · "Ninjas read this way!"; which (w1-wu2 3:56.1): no frame line (tv_which_frame), no narrated demo, no Ready hold, no hand-over. Opens: "Fish dog!" · "Watch me first!"
- **over-framed**: ‹fm_l1_hello› "Ninja ears on! Let's listen to some words." at w1-wu3 @5:19.0, again after w1-wu1 @1:41.6; ‹fm_tap_all_start› "Tap all the pictures that start with..." at w1-wu3 @6:22.6, again after w1-wu1 @2:46.8; ‹first_intro› "Every word starts with a sound. Let's listen for the very first sound!" at w1-3 @10:49.8, again after w1-2 @7:45.9; ‹fm_l2_way› "Ninjas read this way!" at w1-4 @13:12.1, again after w1-wu2 @3:30.7; ‹read_intro› "Who read it right? Listen to Kai and Suki!" at w1-5 @16:45.9, again after w1-4 @14:31.6; ‹read_intro› "Who read it right? Listen to Kai and Suki!" at w1-7 @20:07.5, again after w1-5 @16:45.9
- **bare-command**: ‹ido› "Watch me first!" ×13; ‹find_q› "Find this sound..." ×6; ‹listen› "Listen..." ×4; ‹fm_you_try› "Now you try!" ×3; ‹fm_show_me_2› "Watch me first!" ×3; ‹battle_spell› "Spell..." ×3
- **bare-listen**: w2-1 @39:30.5 after dojo_hello: "Listen…" /b/ /b/; w2-1 @39:41.0 after tv_yay_lovely: "Listen…" /k/ /k/; w2-1 @39:51.2 after yay_8: "Listen…" /g/ /g/; w2-1 @40:00.5 after yay_1: "Listen…" /h/ /h/
- **talk-before-action**: build (w1-4) 29.4 s from ‹two_sounds› "This word has two sounds!" to ‹first_sound_q› "What's the first sound?"; soundhunt (w1-7) 26.3 s from ‹audit_middle_place› "The middle sound comes after the first sound, and before the last soun" to ‹hunt_q› "Which one has this sound in it?"; firstsound (w1-2) 23.2 s from ‹fs_mop› "Mop starts with..." to ‹first_q› "Which one starts with..."; firstsound (w1-2) 20.4 s from ‹ido› "Watch me first!" to ‹first_q› "Which one starts with..."; fastslow (w1-wu1) 15.7 s from ‹fm_show_me_2› "Watch me first!" to ‹fm_tap_tortoise› "Now you tap the tortoise, and say it slowly with me."; compound (w1-wu2) 15.6 s from ‹fm_pair_cat_dog› "Cat dog!" to ‹fm_starfish_q› "Star... fish. Tap the rabbit, and say them fast."
- **rhetorical-question**: ‹what_changed› "What changed? Listen here." ×19; ‹read_intro› "Who read it right? Listen to Kai and Suki!" ×4; ‹read_who› "Who read it right?" ×4; ‹swap_start› "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time." ×2
- **shouted-instruction**: ‹ido› "Watch me first!" ×13; ‹audit_sounds_again› "Listen to the sounds, and catch the word they make!" ×5; ‹read_intro› "Who read it right? Listen to Kai and Suki!" ×4; ‹dojo_tap_say› "Tap it, and say it with me!" ×4; ‹fm_you_try› "Now you try!" ×3; ‹fm_show_me_2› "Watch me first!" ×3
- **demo-command**: w1-wu1 @1:50.7 ‹fm_tap_sun› "Tap the sun!" during ‹fm_show_me› "Let me show you!"; w1-wu1 @2:46.8 ‹fm_tap_all_start› "Tap all the pictures that start with..." during ‹fm_show_me› "Let me show you!"; w1-wu3 @5:40.8 ‹fm_slow_listen› "Listen to my slow word..." during ‹fm_show_me_2› "Watch me first!"; w1-wu3 @5:45.1 ‹fm_which_pic› "Which picture is it?" during ‹fm_show_me_2› "Watch me first!"; w1-wu3 @6:03.5 ‹fm_tap_all_in› "Tap all the pictures with this sound in them..." during ‹fm_show_me› "Let me show you!"; w1-2 @7:54.9 ‹first_q› "Which one starts with..." during ‹ido› "Watch me first!"
- **first-dojo-opening**: w2-1 opens: ‹dojo_hello› "This is the dojo. A dojo is where ninjas practise! Let's practise some sounds." · ‹listen› "Listen..." · /b/ · /b/ · ‹audit_spell_it› "And this is how we spell it."

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 370 | pass |

