# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/runs/fix/C2-v1/transcripts/continuous-perfect.json (perfect, one continuous page)

547 Sensei lines, 420 sounds and words, 381 utterances in 64 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 14 | What's the first sound? |
| last_sound_q | 12 | What's the last sound? |
| first_q | 9 | Which one starts with... |
| tv_here_sound | 8 | Here's the sound... |
| tv_let_me_listen | 8 | Hmm, let me listen. |
| tv_tap_it_say | 8 | Now you tap it, and say the sound. |
| tv_by_yourself | 7 | Now you do one all by yourself. |
| tv_so_i_tap | 6 | So I'll tap it. |
| tv_which_write | 6 | Which of these is the way we write... |
| tv_your_word | 6 | Your word is... |
| tv_watch_write | 5 | Now watch my ninja write it. |
| tv_how_we_write | 5 | This is how we write... |
| st_first_q2 | 5 | Which picture starts with... |
| tv_together | 5 | Let's do this one together. |
| tv_petal_say | 5 | Tap the petal, and say it with me. |
| tv_our_word | 5 | Here's our word... |
| tv_by_yourself_build | 5 | Now you build one all by yourself. |
| next_sound_q | 5 | What's the next sound? |
| fm_tap_rabbit | 4 | Now tap the rabbit, and say it fast. |
| tv_next_word | 4 | Here's your next word... |
| kai_says | 4 | Kai says... |
| suki_says | 4 | Suki says... |
| tv_fs_say_slow | 4 | Let's say it the slow way... |
| tv_fs_now_fast | 4 | And now, fast... |
| tv_hunt_q | 4 | Which one has this sound in the middle... |
| fm_name_cat | 3 | This is a cat. |
| tv_pocket_ido | 3 | I'll find one first. |
| tv_map_hint | 3 | The glowing stone is your next game. Tap it when you're ready. |
| tv_first_sound | 3 | Our first sound is... |
| tv_petal_say_short | 3 | Tap its petal, and say it. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (7)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 3 | Which of these is the way we write... | level w1-2 @748.9s and @754.4s |
| first_sound_q | 2 | What's the first sound? | level w1-11 @2030.0s and @2044.4s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @114.6s and @122.5s |
| fs_ant | 1 | Ant starts with... | level w1-3 @852.4s and @862.1s |

### Spliced utterances: 114 of 381 (30%); chains of 5+ clips: 61

Commonest spliced shapes:

- ×2 ‹fs_sit› + /X/
- ×2 ‹tv_next_sound› + /X/ + ‹tv_petal_say› + /X/
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×2 ‹tv_our_word› + W
- ×2 ‹tv_your_word› + W
- ×2 ‹kai_says› + W + ‹suki_says› + W + ‹read_who›
- ×2 ‹tv_won_one› + /X/
- ×1 ‹tv_ts_meet› + ‹tv_ts_fast› + W + ‹tv_ts_slow› + W + ‹tv_ready_paw›
- ×1 W + ‹fm_notice_sun_sock› + /X/ + ‹tv_petal_first›
- ×1 ‹tv_pocket_frame› + ‹tv_pocket_ido› + ‹fs_sun› + /X/ + ‹tv_so_pocket› + ‹tv_pocket_ready_two›
- ×1 W + ‹fm_found_both› + /X/
- ×1 ‹fm_rw2_s› + /X/ + ‹fm_rw2_petal› + ‹tv_rw2_flower› + ‹tv_rw2_tap_petal›
- ×1 ‹tv_ts_again› + ‹fm_name_mug› + ‹tv_ts_slow_one› + W + ‹fm_tap_tortoise›
- ×1 ‹tv_slow_frame› + ‹tv_slow_demo› + W + ‹tv_i_hear_mug› + ‹tv_ready_go›

Longest chains:

- level w1-10 @1834.6s (13 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it. Let's do this one together. This is a dog. This is a peg. Which picture starts with... /p/
- level w1-3 @876.2s (11 clips): I'll go first. Here's some jam and a tent. Hmm, let me listen. "tent" Tent starts with... /t/ So I'll tap it. Let's do this one together. This is a cup. This is a top. Which one starts with... /t/
- level w1-10 @1785.1s (11 clips): I'll go first. Here's a nut and a hat. Hmm, let me listen. "nut" Nut starts with... /n/ So I'll tap it. Let's do this one together. This is a cup. This is a nest. Which one starts with... /n/
- level w1-3 @845.6s (10 clips): I'll go first. Here's a cat and an ant. Hmm, let me listen. "ant" Ant starts with... /a/ So I'll tap it. Let's do this one together. This is a pig. Which one starts with... /a/
- level w1-8 @1595.6s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-11 @1982.2s (10 clips): I'll go first. Here's a map and a mop. Hmm, let me listen. "mop" (slowly) Mop has this sound in the middle... /o/ Let's do this one together. This is a tap. This is a top. Which one has this sound in the middle... /o/
- level w1-4 @1048.5s (9 clips): /m/ Say the sounds, and read the word. /a/ /m/ "am" You built that whole word by yourself! Here's your next word... "at" What's the first sound?
- level w1-5 @1155.0s (9 clips): /t/ Let's say it the slow way... /s/ /a/ /t/ And now, fast... "sat" Here's your next word... "mat"

### Praise: 12 lines (0.3 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 31

- intro film @28.5s: "When you're ready to see what happens next, tap the green arrow." cut after 2.3 of 3.8 s by Oh no! The petals blew away, all over the island!
- choose @54.1s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.9 of 3.6 s by Great choice!
- opt-in @85.1s: "Now come with me to the dojo. Tap the green arrow." cut after 1.5 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @94.9s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 1.7 of 4.5 s by Bong! That's your first star.
- dojo welcome @133.3s: "It's a listening game, called Ninja Ears. Tap the green arrow when you" cut after 3.8 of 4.8 s by I'll say a word. Then you find its picture.
- level (first minutes) @168.7s: "Do you want to have a go now? Tap the green arrow. Or tap my paw to se" cut after 4.9 of 6.1 s by Now you tap the tortoise, and say it slowly with m
- level (first minutes) @306.8s: "Tap each picture, starting on this side." cut after 2.0 of 2.7 s by "fish"
- level w1-wu6 @576.3s: "Now tap the rabbit, and say it fast." cut after 2.1 of 2.4 s by "cat"
- level w1-2 @625.0s: "Tap its petal, and say it." cut after 1.5 of 2.4 s by /m/
- level w1-2 @656.6s: "Now you tap it, and say the sound." cut after 1.6 of 2.5 s by /m/
- level w1-2 @679.8s: "Tap its petal, and say it." cut after 1.5 of 2.4 s by /s/
- level w1-2 @703.6s: "/s/" cut after 0.3 of 0.7 s by Sand starts with...
- level w1-2 @709.4s: "Now you tap it, and say the sound." cut after 2.1 of 2.5 s by /s/
- level w1-3 @842.9s: "Tap its petal, and say it." cut after 1.9 of 2.4 s by /a/
- level w1-3 @868.3s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /a/
- level w1-3 @873.5s: "Tap the petal, and say it with me." cut after 1.9 of 2.5 s by /t/
- level w1-3 @898.4s: "Now you tap it, and say the sound." cut after 1.5 of 2.5 s by /t/
- level w1-4 @993.9s: "This card is my word. Tap it, and hear the word." cut after 2.0 of 3.6 s by "am"
- level w1-4 @1005.1s: "Can you find the last one?" cut after 1.5 of 1.8 s by /m/
- level w1-4 @1075.8s: "First, you read it. Tap each sound, and say it with me." cut after 0.3 of 4.3 s by /a/
- level w1-6 @1223.7s: "I'll zap the first one. Tap my word card, and hear the word." cut after 3.0 of 4.0 s by "at"
- level w1-8 @1588.7s: "What do we need to change?" cut after 1.3 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1606.2s: "What do we need to change?" cut after 0.9 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1645.2s: "Which sound needs to change?" cut after 1.4 of 1.8 s by Yes, the first sound changes!
- level w1-10 @1781.7s: "Tap the petal, and say it with me." cut after 1.9 of 2.5 s by /n/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |

## playtest/runs/fix/C2-v1/transcripts/continuous-learner.json (learner, one continuous page)

572 Sensei lines, 485 sounds and words, 452 utterances in 62 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 16 | What's the first sound? |
| last_sound_q | 14 | What's the last sound? |
| say_sounds_read | 9 | Say the sounds, and read the word. |
| suki_says | 9 | Suki says... |
| kai_says | 9 | Kai says... |
| tv_guess_q | 8 | Listen for the word... |
| tv_listen_here | 8 | Let's listen again. What can you hear here? |
| audit_listen_next | 7 | Let's listen again. What sound comes next? |
| first_q | 6 | Which one starts with... |
| read_tap_sounds | 6 | Tap each sound, and say it. |
| next_sound_q | 6 | What's the next sound? |
| fm_tap_rabbit | 5 | Now tap the rabbit, and say it fast. |
| tv_here_sound | 5 | Here's the sound... |
| tv_let_me_listen | 5 | Hmm, let me listen. |
| tv_tap_it_say | 5 | Now you tap it, and say the sound. |
| tv_yes_suki | 5 | Yes! Suki read it right. |
| read_who | 5 | Who read it right? |
| tv_so_i_tap | 4 | So I'll tap it. |
| tv_by_yourself | 4 | Now you do one all by yourself. |
| tv_which_write | 4 | Which of these is the way we write... |
| streak_lost | 4 | Keep going, ninja. |
| tv_your_word | 4 | Your word is... |
| tv_next_word | 4 | Here's your next word... |
| tv_fs_say_slow | 4 | Let's say it the slow way... |
| tv_fs_now_fast | 4 | And now, fast... |
| tv_rc_q | 4 | Who read it right? Tap Kai, or tap Suki. |
| tv_yes_kai | 4 | Yes! Kai read it right. |
| fs_sun | 3 | Sun starts with... |
| tv_map_hint | 3 | The glowing stone is your next game. Tap it when you're ready. |
| tv_ready_go | 3 | Do you want to have a go now? |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (12)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_guess_q | 3 | Listen for the word... | level w1-wu5 @779.1s and @792.2s |
| tv_which_write | 2 | Which of these is the way we write... | level w1-2 @1093.9s and @1099.2s |
| read_tap_sounds | 2 | Tap each sound, and say it. | level w1-4 @1590.3s and @1604.2s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @126.6s and @135.9s |
| fs_ant | 1 | Ant starts with... | level w1-3 @1220.8s and @1231.1s |
| first_sound_q | 1 | What's the first sound? | level w1-4 @1507.7s and @1520.9s |
| kai_says | 1 | Kai says... | level w1-5 @1814.3s and @1829.1s |
| tv_yes_kai | 1 | Yes! Kai read it right. | level w1-7 @2180.3s and @2194.0s |

### Spliced utterances: 105 of 452 (23%); chains of 5+ clips: 58

Commonest spliced shapes:

- ×3 ‹kai_says› + W + ‹suki_says› + W + ‹read_who›
- ×3 ‹kai_says› + W + ‹suki_says› + W + ‹tv_rc_q›
- ×2 ‹first_q› + /X/
- ×2 ‹fs_sun› + /X/
- ×2 ‹tv_thats_write› + /X/ + ‹we_need› + /X/
- ×2 ‹tv_first_is› + /X/
- ×2 ‹tv_our_word› + W + ‹first_sound_q›
- ×2 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×2 /X/ + /X/ + ‹tv_fs_now_fast›
- ×1 W + ‹tv_ts_meet› + ‹tv_ts_fast› + W + ‹tv_ts_slow› + W + ‹tv_ready_paw›
- ×1 ‹fm_notice_sun_sock› + /X/ + ‹tv_petal_first›
- ×1 ‹tv_pocket_frame› + ‹tv_pocket_ido› + ‹fs_sun› + /X/ + ‹tv_so_pocket› + ‹tv_pocket_ready_two›
- ×1 W + ‹fm_found_both› + /X/
- ×1 ‹fm_rw2_s› + /X/
- ×1 ‹tv_ts_again› + ‹fm_name_mug› + ‹tv_ts_slow_one› + W + ‹fm_tap_tortoise›

Longest chains:

- level w1-3 @1252.9s (11 clips): I'll go first. Here's some jam and a tent. Hmm, let me listen. "tent" Tent starts with... /t/ So I'll tap it. Let's do this one together. This is a top. This is a bed. Which one starts with... /t/
- level w1-3 @1214.0s (10 clips): I'll go first. Here's a cat and an ant. Hmm, let me listen. "ant" Ant starts with... /a/ So I'll tap it. Let's do this one together. This is a van. Which one starts with... /a/
- level w1-5 @1708.1s (10 clips): /t/ Say the sounds, and read the word. /s/ /a/ /t/ "sat" That was a tricky one, and you kept going. Here's your next word... "mat" What's the first sound?
- level w1-8 @2342.1s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-7 @2100.1s (9 clips): Say the sounds, and read the word. /s/ /i/ /t/ "sit" That was a tricky one, and you kept going. Here's your next word... "it" What's the first sound?
- level (first minutes) @177.4s (7 clips): "sock" Here are my friends, the rabbit and the tortoise. The rabbit says words fast... "sun" The tortoise says them slowly... "sun" (slowly) Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again.
- level w1-wu5 @730.4s (7 clips): I'll say the sounds, and you listen for the word. My sounds are... /s/ /u/ /n/ I can hear sun. So I tap the sun. Do you want to have a go now?
- level w1-2 @957.1s (7 clips): I'll go first. Here's a map and a hat. Hmm, let me listen. "map" (held) Map starts with... /m/ So I'll tap it. Let's do the next one together. Are you ready?

### Praise: 17 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 2

- world flower @1376.7s: 13.7 s silent (0 taps) after "And here's another new sound... /t/ This is the way we spell it in tap.", before "Next is a new game, called Word Building. Tap the glowing st"
- level w1-4 @1442.0s: 11.5 s silent (1 taps) after "Now let's build one together. Are you ready?", before "Here's our word... "at" What's the first sound?"

### Cut-off clips: 16

- intro film @28.6s: "When you're ready to see what happens next, tap the green arrow." cut after 3.4 of 3.8 s by Oh no! The petals blew away, all over the island!
- choose @56.3s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.8 of 3.6 s by Great choice!
- opt-in @91.4s: "Now come with me to the dojo. Tap the green arrow." cut after 2.9 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @102.7s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 3.1 of 4.5 s by Bong! That's your first star.
- level w1-2 @1101.8s: "/s/" cut after 0.4 of 0.7 s by That's how we write...
- level w1-3 @1251.0s: "Tap the petal, and say it with me." cut after 1.0 of 2.5 s by /t/
- level w1-3 @1276.6s: "Now you tap it, and say the sound." cut after 0.4 of 2.5 s by /t/
- level w1-4 @1562.4s: "First, you read it. Tap each sound, and say it with me." cut after 1.2 of 4.3 s by /a/
- level w1-4 @1590.3s: "Tap each sound, and say it." cut after 0.6 of 2.0 s by /a/
- level w1-4 @1604.2s: "Tap each sound, and say it." cut after 1.3 of 2.0 s by /a/
- level w1-5 @1809.0s: "Tap each sound, and say it." cut after 0.4 of 2.0 s by /s/
- level w1-5 @1826.7s: "Tap each sound, and say it." cut after 0.3 of 2.0 s by /m/
- level w1-7 @2186.0s: "Tap each sound, and say it." cut after 0.8 of 2.0 s by /i/
- level w1-7 @2200.4s: "Tap each sound, and say it." cut after 0.8 of 2.0 s by /s/
- level w1-8 @2352.7s: "What do we need to change?" cut after 1.4 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @2410.1s: "What do we need to change?" cut after 0.6 of 1.8 s by Yes, the first sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| audit_gem_more "Look, this gem has filled a little more." | 1 | reward |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C-P: playtest/runs/fix/C2-v1/transcripts/continuous-perfect.json

perfect, a brand-new child, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 | 0 sounds | pass |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 0 (day one) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 3 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 8 (0 repeats) | pass |
| `swap-place-heard` swap place lines heard to the end | all | 5 of 5 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.79 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 17 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 15.0 s (soundhunt w1-7); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 17 words (median line 5 words; 150 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 17 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 11 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 8 of 8 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 62 of 62, rabbit 42 of 42 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 7 of 7 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 15.0 s (soundhunt w1-7); 1 over | **FAIL** |

- **talk-before-action**: soundhunt (w1-7) 15.0 s from ‹stretch:tin› "tin" to ‹tv_hunt_q› "Which one has this sound in the middle..."
- **fs-talk**: soundhunt (w1-7) 15.0 s from ‹stretch:tin› "tin" to ‹tv_hunt_q› "Which one has this sound in the middle...", with ‹tv_fs_next› "Saying it slowly tells us which sound comes next."

### C-L: playtest/runs/fix/C2-v1/transcripts/continuous-learner.json

learner, a brand-new child, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | 0 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 0 (day one) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 3 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 5 (0 repeats) | pass |
| `swap-place-heard` swap place lines heard to the end | all | 5 of 5 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.87 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 19 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 11.6 s (sounds w1-wu5); 0 over | pass |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 5 words; 173 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 19 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 12 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 9 of 9 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 72 of 72, rabbit 51 of 51 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 8 of 8 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.5 s (run w1-9); 0 over | pass |

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

