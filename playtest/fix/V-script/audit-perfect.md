# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/V-script/transcripts/continuous-perfect.json (perfect, one continuous page)

565 Sensei lines, 426 sounds and words, 395 utterances in 64 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 15 | What's the first sound? |
| last_sound_q | 13 | What's the last sound? |
| first_q | 9 | Which one starts with... |
| tv_here_sound | 8 | Here's the sound... |
| tv_let_me_listen | 8 | Hmm, let me listen. |
| tv_tap_it_say | 8 | Now you tap it, and say the sound. |
| tv_by_yourself | 8 | Now you do one all by yourself. |
| tv_so_i_tap | 6 | So I'll tap it. |
| st_first_q2 | 6 | Which picture starts with... |
| tv_which_write | 6 | Which of these is the way we write... |
| tv_your_word | 6 | Your word is... |
| tv_watch_write | 5 | Now watch my ninja write it. |
| tv_how_we_write | 5 | This is how we write... |
| tv_together | 5 | Let's do this one together. |
| tv_petal_say | 5 | Tap the petal, and say it with me. |
| tv_our_word | 5 | Here's our word... |
| tv_by_yourself_build | 5 | Now you build one all by yourself. |
| tv_next_word | 5 | Here's your next word... |
| next_sound_q | 5 | What's the next sound? |
| fm_tap_rabbit | 4 | Now tap the rabbit, and say it fast. |
| fm_name_bus | 4 | This is a bus. |
| yay_2 | 4 | Super! |
| fs_ant | 4 | Ant starts with... |
| tv_to_flower | 4 | Let's take your new sounds to the World Flower. Tap the green arrow. |
| kai_says | 4 | Kai says... |
| suki_says | 4 | Suki says... |
| tv_fs_say_slow | 4 | Let's say it the slow way... |
| tv_fs_now_fast | 4 | And now, fast... |
| tv_hunt_q | 4 | Which one has this sound in the middle... |
| fm_name_cat | 3 | This is a cat. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (14)

| Line | Repeats | Text | Example |
|---|---|---|---|
| first_sound_q | 5 | What's the first sound? | level w1-7 @1465.7s and @1479.3s |
| tv_which_write | 3 | Which of these is the way we write... | level w1-2 @808.4s and @813.4s |
| last_sound_q | 3 | What's the last sound? | level w1-7 @1484.0s and @1493.9s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @124.1s and @132.1s |
| fs_ant | 1 | Ant starts with... | level w1-3 @925.5s and @936.8s |
| next_sound_q | 1 | What's the next sound? | level w1-11 @2084.9s and @2099.6s |

### Spliced utterances: 119 of 395 (30%); chains of 5+ clips: 64

Commonest spliced shapes:

- ×2 ‹st_first_q2› + /X/
- ×2 ‹tv_which_write› + /X/
- ×2 ‹tv_next_sound› + /X/ + ‹tv_petal_say› + /X/
- ×2 ‹fs_top› + /X/
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×2 /X/ + ‹tv_our_word›
- ×2 ‹suki_says› + W + ‹kai_says› + W + ‹read_who›
- ×1 W + ‹tv_ts_meet› + ‹tv_ts_fast› + W + ‹tv_ts_slow› + W + ‹tv_ready_paw›
- ×1 ‹fm_notice_sun_sock› + /X/ + ‹tv_petal_first›
- ×1 ‹tv_pocket_frame› + ‹tv_pocket_ido› + ‹fs_sun› + /X/ + ‹tv_so_pocket› + ‹tv_pocket_ready_two›
- ×1 W + ‹fm_found_both› + /X/
- ×1 ‹fm_rw_shiny› + ‹fm_rw2_s› + /X/
- ×1 ‹tv_ts_again› + ‹fm_name_mug› + ‹tv_ts_slow_one› + W + ‹fm_tap_tortoise›
- ×1 ‹tv_slow_frame› + ‹tv_slow_demo› + W + ‹tv_i_hear_mug› + ‹tv_ready_go›

Longest chains:

- level w1-8 @1630.2s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-5 @1245.8s (9 clips): /t/ Let's say it the slow way... /s/ /a/ /t/ And now, fast... "sat" Here's your next word... "mat"
- level w1-10 @1865.8s (8 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it.
- level (first minutes) @167.0s (7 clips): "sock" Here are my friends, the rabbit and the tortoise. The rabbit says words fast... "sun" The tortoise says them slowly... "sun" (slowly) Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again.
- level w1-2 @685.5s (7 clips): I'll go first. Here's a map and a hat. Hmm, let me listen. "map" (held) Map starts with... /m/ So I'll tap it. Let's do the next one together. Are you ready?
- level w1-2 @706.8s (7 clips): Mug starts with... /m/ Now watch my ninja write it. This is how we write... /m/ Now you tap it, and say the sound. /m/
- level w1-2 @738.7s (7 clips): I'll go first. Here's a bed and a sock. Hmm, let me listen. "sock" (held) Sock starts with... /s/ So I'll tap it. Let's do the next one together. Are you ready?
- level w1-3 @936.8s (7 clips): Ant starts with... /a/ Now watch my ninja write it. This is how we write... /a/ Now you tap it, and say the sound. /a/

### Praise: 17 lines (0.5 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 35

- intro film @8.3s: "When you're ready to see what happens next, tap the green arrow." cut after 1.9 of 3.8 s by Every petal was a sound. With sounds, we could tal
- choose @62.6s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.8 of 3.6 s by Great choice!
- opt-in @93.3s: "Now come with me to the dojo. Tap the green arrow." cut after 1.5 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @103.1s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 1.7 of 4.5 s by Bong! That's your first star.
- dojo welcome @142.9s: "It's a listening game, called Ninja Ears. Tap the green arrow when you" cut after 3.6 of 4.8 s by I'll say a word. Then you find its picture.
- level (first minutes) @177.3s: "Do you want to have a go now? Tap the green arrow. Or tap my paw to se" cut after 4.7 of 6.1 s by Now you tap the tortoise, and say it slowly with m
- level (first minutes) @320.0s: "Tap each picture, starting on this side." cut after 1.9 of 2.7 s by "fish"
- level (first minutes) @335.9s: "When you're ready for the next game, tap the green arrow." cut after 2.5 of 3.3 s by Here are two rows of pictures. I'll read one, and 
- level w1-wu6 @632.8s: "Now tap the rabbit, and say it fast." cut after 1.9 of 2.4 s by "cat"
- level w1-2 @682.6s: "Tap its petal, and say it." cut after 1.6 of 2.4 s by /m/
- level w1-2 @713.9s: "Now you tap it, and say the sound." cut after 1.5 of 2.5 s by /m/
- level w1-2 @735.7s: "Tap its petal, and say it." cut after 1.7 of 2.4 s by /s/
- level w1-2 @759.3s: "/s/" cut after 0.4 of 0.7 s by Sun starts with...
- level w1-2 @765.2s: "Now you tap it, and say the sound." cut after 2.0 of 2.5 s by /s/
- level w1-3 @943.0s: "Now you tap it, and say the sound." cut after 2.1 of 2.5 s by /a/
- level w1-3 @960.8s: "Tap the petal, and say it with me." cut after 1.9 of 2.5 s by /t/
- level w1-3 @985.4s: "Now you tap it, and say the sound." cut after 1.6 of 2.5 s by /t/
- level w1-4 @1082.3s: "This card is my word. Tap it, and hear the word." cut after 2.0 of 3.6 s by "am"
- level w1-4 @1166.2s: "First, you read it. Tap each sound, and say it with me." cut after 0.5 of 4.3 s by /a/
- level w1-6 @1314.7s: "I'll zap the first one. Tap my word card, and hear the word." cut after 1.9 of 4.0 s by "at"
- level w1-6 @1328.3s: "That's how we spell a word. Now you spell one. Are you ready to zap it" cut after 4.7 of 5.1 s by Your word is...
- level w1-7 @1409.6s: "Tap the petal, and say it with me." cut after 1.6 of 2.5 s by /i/
- level w1-7 @1439.8s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /i/
- level w1-8 @1640.9s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1653.5s: "Which sound changes?" cut after 1.5 of 1.9 s by Yes, the first sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C-P: playtest/fix/V-script/transcripts/continuous-perfect.json

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
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.83 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 18 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 12.3 s (compound w1-wu2); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 17 words (median line 5 words; 149 turns) | pass |
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
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 6 of 6 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 61 of 61, rabbit 40 of 40 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 7 of 7 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.5 s (run w1-9); 0 over | pass |

- **talk-before-action**: compound (w1-wu2) 12.3 s from ‹tv_squish_frame› "Here's a new game, called Word Squish." to ‹tv_squish_ready› "Two little words make one big word. Now you make one. Are you ready?"

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

