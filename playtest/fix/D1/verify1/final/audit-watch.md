# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/D1/verify1/final/continuous-watcher.json (watcher, one continuous page)

762 Sensei lines, 769 sounds and words, 593 utterances in 94 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 15 | What's the first sound? |
| last_sound_q | 13 | What's the last sound? |
| tv_show_again | 12 | Of course. Watch my paw again. |
| tv_ready_now | 12 | Are you ready to have a go now? |
| tv_here_sound | 11 | Here's the sound... |
| tv_let_me_listen | 10 | Hmm, let me listen. |
| tv_your_word | 10 | Your word is... |
| tv_petal_say | 9 | Tap the petal, and say it with me. |
| first_q | 9 | Which one starts with... |
| tv_watch_write | 9 | Now watch my ninja write it. |
| tv_tap_it_say | 8 | Now you tap it, and say the sound. |
| tv_which_write | 8 | Which of these is the way we write... |
| tv_next_word | 8 | Here's your next word... |
| tv_so_i_tap | 7 | So I'll tap it. |
| tv_how_we_write | 7 | This is how we write... |
| tv_by_yourself | 7 | Now you do one all by yourself. |
| tv_fs_say_slow | 6 | Let's say it the slow way... |
| tv_fs_now_fast | 6 | And now, fast... |
| next_sound_q | 6 | What's the next sound? |
| gem_ready | 6 | A gem is glowing! It's ready for a gem battle. |
| tv_swap_now_change | 6 | Now let's change it to... |
| st_what_change | 6 | What do we need to change? |
| st_middle_changes | 6 | Yes, the middle sound changes! |
| tv_which_changes | 6 | Which sound changes? |
| tv_pocket_ido | 5 | I'll find one first. |
| st_first_q2 | 5 | Which picture starts with... |
| tv_and_how_we_write | 5 | And this is how we write... |
| tv_together | 5 | Let's do this one together. |
| tv_our_word | 5 | Here's our word... |
| tv_by_yourself_build | 5 | Now you build one all by yourself. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (35)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w1-2 @840.7s and @845.7s |
| first_sound_q | 3 | What's the first sound? | level w1-7 @1586.1s and @1600.3s |
| tv_watch_write | 3 | Now watch my ninja write it. | level w2-1 @2825.3s and @2840.1s |
| tv_pocket_ido | 2 | I'll find one first. | level (first minutes) @244.0s and @257.0s |
| tv_so_pocket | 2 | So into the pocket it goes! | level (first minutes) @248.0s and @261.0s |
| last_sound_q | 2 | What's the last sound? | level w1-10 @2077.5s and @2092.2s |
| tv_which_changes | 2 | Which sound changes? | level w1-12 @2340.2s and @2350.2s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @113.5s and @121.2s |
| tv_ts_fast | 1 | The rabbit says words fast... | level (first minutes) @160.9s and @175.1s |
| tv_ts_slow | 1 | The tortoise says them slowly... | level (first minutes) @163.3s and @177.5s |
| fs_sun | 1 | Sun starts with... | level (first minutes) @245.3s and @258.3s |
| tv_rail_ido | 1 | I'll read them first. Then you read them. | level (first minutes) @320.0s and @333.0s |
| fm_read_fish_dog | 1 | Fish... dog. Fish dog! | level (first minutes) @322.6s and @335.5s |
| tv_slow_demo | 1 | Here's my slow word... | level w1-wu3 @483.5s and @495.5s |
| tv_i_hear_mug | 1 | I can hear mug! | level w1-wu3 @486.8s and @498.9s |
| tv_hear_middle | 1 | I can hear it in the middle. | level w1-wu3 @544.4s and @557.9s |
| fs_ant | 1 | Ant starts with... | level w1-3 @944.7s and @954.8s |
| tv_guess_q | 1 | Listen for the word... | level w1-9 @1869.6s and @1883.7s |
| tv_run_which | 1 | Tap the lantern with my word. | level w1-9 @1872.9s and @1886.7s |
| next_sound_q | 1 | What's the next sound? | level w1-11 @2214.5s and @2228.7s |
| swap_which | 1 | Which sound needs to change? | level w1-12 @2360.0s and @2369.2s |
| tv_swap_now_change | 1 | Now let's change it to... | level w1-12 @2377.5s and @2387.3s |
| st_what_change | 1 | What do we need to change? | level w1-12 @2397.8s and @2406.1s |
| tv_here_sound | 1 | Here's the sound... | world flower @3000.6s and @3006.3s |

### Spliced utterances: 161 of 593 (27%); chains of 5+ clips: 103

Commonest spliced shapes:

- ×4 ‹tv_next_word› + W
- ×3 ‹tv_our_word› + W + ‹first_sound_q›
- ×3 ‹tv_your_word› + W
- ×3 ‹tv_fs_slow_tortoise› + /X/ + /X/ + /X/ + ‹tv_fs_fast_rabbit› + W
- ×2 ‹st_first_q2› + /X/
- ×2 ‹tv_next_sound› + /X/ + ‹tv_petal_say› + /X/
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 /X/ + ‹tv_praise_write› + ‹tv_which_write› + /X/
- ×2 ‹tv_fs_say_sounds_slow› + /X/ + /X/ + ‹tv_fs_rabbit_read›
- ×2 ‹tv_your_word› + W + ‹first_sound_q›
- ×2 ‹kai_says› + W + ‹suki_says› + W + ‹read_who›
- ×2 W + ‹tv_first_is› + /X/
- ×2 ‹tv_won_one› + /X/
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 ‹tv_fs_say_slow› + /X/ + /X/ + ‹tv_fs_now_fast› + W

Longest chains:

- level w1-10 @2003.0s (13 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it. Let's do this one together. This is a pond. This is a cup. Which picture starts with... /p/
- level w1-3 @969.1s (11 clips): I'll go first. Here's some jam and a tent. Hmm, let me listen. "tent" Tent starts with... /t/ So I'll tap it. Let's do this one together. This is a top. This is a van. Which one starts with... /t/
- level w1-10 @1953.8s (11 clips): I'll go first. Here's a nut and a hat. Hmm, let me listen. "nut" Nut starts with... /n/ So I'll tap it. Let's do this one together. This is a nest. This is a fan. Which one starts with... /n/
- level w1-5 @1294.4s (10 clips): Let's say it the slow way... /s/ /a/ /t/ And now, fast... "sat" Here's your next word... "mat" What's the first sound? /m/
- level w1-8 @1770.0s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-11 @2151.6s (10 clips): I'll go first. Here's a map and a mop. Hmm, let me listen. "mop" (slowly) Mop has this sound in the middle... /o/ Let's do this one together. This is a top. This is a tap. Which one has this sound in the middle... /o/
- level w1-12 @2318.5s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "pit" Listen to them both... "sit" (slowly) "pit" (slowly) What do we need to change?
- level (first minutes) @157.0s (8 clips): "sock" Here are my friends, the rabbit and the tortoise. The rabbit says words fast... "sun" The tortoise says them slowly... "sun" (slowly) Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again. Of course. Watch my paw again.

### Praise: 22 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 57

- intro film @29.2s: "When you're ready to see what happens next, tap the green arrow." cut after 0.9 of 3.8 s by Oh no! The petals blew away, all over the island!
- choose @53.0s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.8 of 3.6 s by Great choice!
- opt-in @83.8s: "Now come with me to the dojo. Tap the green arrow." cut after 1.5 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @93.7s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 1.7 of 4.5 s by Bong! That's your first star.
- dojo welcome @132.0s: "It's a listening game, called Ninja Ears. Tap the green arrow when you" cut after 3.7 of 4.8 s by I'll say a word. Then you find its picture.
- level (first minutes) @167.5s: "Do you want to have a go now? Tap the green arrow. Or tap my paw to se" cut after 4.8 of 6.1 s by Of course. Watch my paw again.
- level (first minutes) @343.4s: "Tap each picture, starting on this side." cut after 1.9 of 2.7 s by "fish"
- level w1-wu6 @646.3s: "Now tap the rabbit, and say it fast." cut after 1.9 of 2.4 s by "cat"
- level w1-2 @697.7s: "Tap the petal, and say it with me." cut after 1.9 of 2.5 s by /m/
- level w1-2 @746.7s: "Now you tap it, and say the sound." cut after 1.9 of 2.5 s by /m/
- level w1-2 @769.8s: "Tap its petal, and say it." cut after 1.8 of 2.4 s by /s/
- level w1-2 @800.0s: "Now you tap it, and say the sound." cut after 1.5 of 2.5 s by /s/
- level w1-3 @935.4s: "Tap its petal, and say it." cut after 1.7 of 2.4 s by /a/
- level w1-3 @961.0s: "Now you tap it, and say the sound." cut after 1.8 of 2.5 s by /a/
- level w1-3 @966.4s: "Tap the petal, and say it with me." cut after 1.8 of 2.5 s by /t/
- level w1-3 @991.7s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /t/
- level w1-4 @1089.9s: "This card is my word. Tap it, and hear the word." cut after 1.5 of 3.6 s by "am"
- level w1-4 @1199.4s: "First, you read it. Tap each sound, and say it with me." cut after 0.2 of 4.3 s by /a/
- level w1-7 @1510.1s: "Tap the petal, and say it with me." cut after 1.5 of 2.5 s by /i/
- level w1-7 @1559.1s: "Now you tap it, and say the sound." cut after 2.0 of 2.5 s by /i/
- level w1-8 @1763.7s: "What do we need to change?" cut after 0.9 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1780.7s: "What do we need to change?" cut after 1.0 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1810.0s: "Which sound changes?" cut after 1.6 of 1.9 s by Yes, the last sound changes!
- level w1-8 @1819.6s: "Which sound needs to change?" cut after 1.5 of 1.8 s by Yes, the first sound changes!
- level w1-10 @1951.0s: "Tap the petal, and say it with me." cut after 1.3 of 2.5 s by /n/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| audit_gem_more "Look, this gem has filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | level w1-4 |
| audit_left_right "We start here, and go this way." | 1 | level w2-3 |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C-W: playtest/fix/D1/verify1/final/continuous-watcher.json

watcher, a brand-new child, opt-in none.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `letters-lines` letters lines in C6-P (25 min) ≤ 12 | ≤ 12 (C6-P only; info here) | 0 | n/a |
| `letters-60s` the same letters sentence never twice in 60 s | 0 | 0 | pass |
| `letters-twice` no spelling's full letters line twice in a session | 0 (perfect runs only; info here) | 0 sounds | n/a |
| `letters-echo` "/X/ two letters · /X/ two letters" echoes | 0 | 0 | pass |
| `same-sound-after-reveal` `same_sound_new` after the reveal | 0 | 0 | pass |
| `world-welcomes` world welcomes: 1 per land | ≤ 1 per land | world_2 ×1 | pass |
| `did-it-after-praise` "You did it!" straight after another praise line | 0 | 0 | pass |
| `jump-offers` jump offers: 0 on day one, ≤ 1 a session | ≤ 0 (day one) | 0 | pass |
| `speaker-tip` "Tap the speaker…": ≤ 2 a save, 0 cut | ≤ 2, 0 cut | 0 (0 cut) | pass |
| `map-hint-cut` map hint cut by the next level | 0 | 0 of 3 | pass |
| `over-map` level lines started over the map | 0 | 0 | pass |
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 8 (0 repeats) | pass |
| `swap-place-heard` swap place lines heard to the end | all | 15 of 15 | pass |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.89 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 20 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 12.9 s (build w1-4); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 5 words; 235 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | yes | pass |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 33 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | 12 of 12 | pass |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 13 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 10 of 10 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 107 of 107, rabbit 84 of 84; the paw's 12 replays not judged | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 8 of 8 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 10.9 s (soundhunt w1-7); 0 over | pass |

- **line-60s**: ‹tv_watch_write› "Now watch my ninja write it." from w2-1 @47:05.3; ‹tv_here_sound› "Here's the sound..." from world flower @49:42.8
- **talk-before-action**: build (w1-4) 12.9 s from ‹say_sounds_read› "Say the sounds, and read the word." to ‹last_sound_q› "What's the last sound?"

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

