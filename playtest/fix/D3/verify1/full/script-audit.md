# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/fix/D3/verify1/full/continuous-watcher.json (watcher, one continuous page)

778 Sensei lines, 778 sounds and words, 622 utterances in 94 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_sound_q | 15 | What's the first sound? |
| tv_show_again | 13 | Of course. Watch my paw again. |
| tv_ready_now | 13 | Are you ready to have a go now? |
| last_sound_q | 13 | What's the last sound? |
| tv_your_word | 12 | Your word is... |
| tv_here_sound | 11 | Here's the sound... |
| tv_let_me_listen | 10 | Hmm, let me listen. |
| first_q | 9 | Which one starts with... |
| tv_next_word | 9 | Here's your next word... |
| tv_tap_it_say | 8 | Now you tap it, and say the sound. |
| tv_by_yourself | 8 | Now you do one all by yourself. |
| tv_which_write | 8 | Which of these is the way we write... |
| tv_so_i_tap | 7 | So I'll tap it. |
| tv_watch_write | 7 | Now watch my ninja write it. |
| tv_how_we_write | 7 | This is how we write... |
| tv_petal_say | 7 | Tap the petal, and say it with me. |
| st_first_q2 | 6 | Which picture starts with... |
| tv_to_flower | 6 | Let's take your new sounds to the World Flower. Tap the green arrow. |
| tv_fs_say_slow | 6 | Let's say it the slow way... |
| tv_fs_now_fast | 6 | And now, fast... |
| next_sound_q | 6 | What's the next sound? |
| tv_swap_now_change | 6 | Now let's change it to... |
| st_what_change | 6 | What do we need to change? |
| st_middle_changes | 6 | Yes, the middle sound changes! |
| tv_which_changes | 6 | Which sound changes? |
| tv_pocket_ido | 5 | I'll find one first. |
| tv_and_how_we_write | 5 | And this is how we write... |
| tv_together | 5 | Let's do this one together. |
| tv_yay_thats_it | 5 | That's it! |
| tv_our_word | 5 | Here's our word... |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (32)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 4 | Which of these is the way we write... | level w1-2 @960.1s and @965.6s |
| first_sound_q | 4 | What's the first sound? | level w1-7 @1651.2s and @1665.0s |
| tv_pocket_ido | 2 | I'll find one first. | level (first minutes) @253.8s and @267.1s |
| tv_so_pocket | 2 | So into the pocket it goes! | level (first minutes) @257.8s and @271.0s |
| last_sound_q | 2 | What's the last sound? | level w1-10 @2136.7s and @2150.7s |
| tv_which_changes | 2 | Which sound changes? | level w1-12 @2399.1s and @2408.7s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @124.5s and @132.4s |
| tv_ts_fast | 1 | The rabbit says words fast... | level (first minutes) @171.7s and @185.7s |
| tv_ts_slow | 1 | The tortoise says them slowly... | level (first minutes) @174.1s and @188.2s |
| fs_sun | 1 | Sun starts with... | level (first minutes) @255.1s and @268.3s |
| tv_rail_ido | 1 | I'll read them first. Then you read them. | level (first minutes) @337.7s and @350.6s |
| fm_read_fish_dog | 1 | Fish... dog. Fish dog! | level (first minutes) @340.2s and @353.1s |
| tv_slow_demo | 1 | Here's my slow word... | level w1-wu3 @562.2s and @575.0s |
| tv_i_hear_mug | 1 | I can hear mug! | level w1-wu3 @565.6s and @578.3s |
| tv_hear_middle | 1 | I can hear it in the middle. | level w1-wu3 @619.3s and @633.0s |
| fs_ant | 1 | Ant starts with... | level w1-3 @1062.4s and @1072.4s |
| next_sound_q | 1 | What's the next sound? | level w1-11 @2273.1s and @2287.4s |
| swap_which | 1 | Which sound needs to change? | level w1-12 @2419.2s and @2429.2s |
| tv_swap_now_change | 1 | Now let's change it to... | level w1-12 @2437.6s and @2447.6s |
| st_what_change | 1 | What do we need to change? | level w1-12 @2458.4s and @2467.1s |
| tv_watch_write | 1 | Now watch my ninja write it. | level w2-1 @2891.1s and @2905.8s |
| tv_here_sound | 1 | Here's the sound... | world flower @3068.1s and @3074.3s |

### Spliced utterances: 166 of 622 (27%); chains of 5+ clips: 106

Commonest spliced shapes:

- ×3 ‹st_first_q2› + /X/
- ×3 ‹kai_says› + W + ‹suki_says› + W + ‹read_who›
- ×3 ‹tv_next_word› + W
- ×3 ‹tv_fs_slow_tortoise› + /X/ + /X/ + /X/ + ‹tv_fs_fast_rabbit› + W
- ×2 ‹tv_which_write› + /X/
- ×2 ‹tv_next_sound› + /X/ + ‹tv_petal_say› + /X/
- ×2 ‹tv_ne_again› + ‹tv_which_write› + /X/
- ×2 /X/ + ‹tv_praise_write› + ‹tv_which_write› + /X/
- ×2 /X/ + /X/ + ‹tv_fs_now_fast›
- ×2 W + ‹tv_first_is› + /X/
- ×2 /X/ + ‹tv_our_word› + W
- ×2 /X/ + ‹tv_swap_in›
- ×2 /X/ + /X/ + /X/ + W + ‹tv_swap_now_change› + W + ‹tv_swap_both› + W + W + ‹st_what_change›
- ×2 ‹tv_guess_q› + /X/ + /X/ + /X/
- ×2 ‹tv_battle_again› + ‹tv_your_word› + W

Longest chains:

- level w1-8 @1827.7s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "sat" Listen to them both... "sit" (slowly) "sat" (slowly) What do we need to change?
- level w1-12 @2377.8s (10 clips): /s/ /i/ /t/ "sit" Now let's change it to... "pit" Listen to them both... "sit" (slowly) "pit" (slowly) What do we need to change?
- level (first minutes) @167.8s (8 clips): "sock" Here are my friends, the rabbit and the tortoise. The rabbit says words fast... "sun" The tortoise says them slowly... "sun" (slowly) Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again. Of course. Watch my paw again.
- level w1-10 @2062.3s (8 clips): I'll find one first. This is a bus. This is a pan. Hmm, let me listen. "pan" Pan starts with... /p/ So I'll tap it.
- level w1-12 @2359.1s (8 clips): "sat" If you'd like to see me do one first, tap my paw. Now let's change it to... "sit" Listen to them both... "sat" (slowly) "sit" (slowly) What do we need to change?
- level w1-2 @818.8s (7 clips): I'll go first. Here's a map and a hat. Hmm, let me listen. "map" (held) Map starts with... /m/ So I'll tap it. Let's do the next one together. Are you ready?
- level w1-2 @837.6s (7 clips): I'll go first. Here's a map and a hat. Hmm, let me listen. "map" (held) Map starts with... /m/ So I'll tap it. Are you ready to have a go now?
- level w1-2 @860.0s (7 clips): Man starts with... /m/ Now watch my ninja write it. This is how we write... /m/ Now you tap it, and say the sound. /m/

### Praise: 21 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 50

- intro film @9.0s: "When you're ready to see what happens next, tap the green arrow." cut after 1.5 of 3.8 s by Every petal was a sound. With sounds, we could tal
- choose @62.8s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.8 of 3.6 s by Great choice!
- opt-in @93.7s: "Now come with me to the dojo. Tap the green arrow." cut after 1.5 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @103.6s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 1.6 of 4.5 s by Bong! That's your first star.
- dojo welcome @143.3s: "It's a listening game, called Ninja Ears. Tap the green arrow when you" cut after 3.6 of 4.8 s by I'll say a word. Then you find its picture.
- level (first minutes) @178.2s: "Do you want to have a go now? Tap the green arrow. Or tap my paw to se" cut after 4.8 of 6.1 s by Of course. Watch my paw again.
- level (first minutes) @361.4s: "Tap each picture, starting on this side." cut after 2.0 of 2.7 s by "fish"
- level (first minutes) @377.8s: "When you're ready for the next game, tap the green arrow." cut after 1.9 of 3.3 s by Here are two rows of pictures. I'll read one, and 
- level w1-wu3 @615.6s: "It's a new sound. Tap its petal, and say it with me." cut after 0.1 of 4.0 s by /a/
- level w1-2 @816.2s: "Tap its petal, and say it." cut after 1.4 of 2.4 s by /m/
- level w1-2 @866.8s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /m/
- level w1-2 @920.3s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /s/
- level w1-2 @930.6s: "/s/" cut after 0.4 of 0.7 s by Sun starts with...
- level w1-3 @1053.0s: "Tap its petal, and say it." cut after 1.8 of 2.4 s by /a/
- level w1-3 @1078.6s: "Now you tap it, and say the sound." cut after 1.8 of 2.5 s by /a/
- level w1-3 @1096.3s: "Tap the petal, and say it with me." cut after 1.6 of 2.5 s by /t/
- level w1-3 @1119.8s: "Now you tap it, and say the sound." cut after 1.4 of 2.5 s by /t/
- level w1-4 @1215.0s: "This card is my word. Tap it, and hear the word." cut after 1.7 of 3.6 s by "am"
- level w1-4 @1321.4s: "First, you read it. Tap each sound, and say it with me." cut after 0.2 of 4.3 s by /a/
- level w1-6 @1465.8s: "I'll zap the first one. Tap my word card, and hear the word." cut after 2.0 of 4.0 s by "at"
- level w1-6 @1480.0s: "That's how we spell a word. Now you spell one. Are you ready to zap it" cut after 4.3 of 5.1 s by Of course. Watch my paw again.
- level w1-7 @1578.7s: "Tap the petal, and say it with me." cut after 1.6 of 2.5 s by /i/
- level w1-7 @1625.5s: "Now you tap it, and say the sound." cut after 1.7 of 2.5 s by /i/
- level w1-8 @1821.4s: "What do we need to change?" cut after 0.9 of 1.8 s by Yes, the middle sound changes!
- level w1-8 @1838.4s: "What do we need to change?" cut after 1.2 of 1.8 s by Yes, the middle sound changes!

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| r2_gems_more "Look, these gems have filled a little more." | 2 | reward ×2 |
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |
| audit_left_right "We start here, and go this way." | 1 | level w2-1 |
| audit_gem_more "Look, this gem has filled a little more." | 1 | reward |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C-W: playtest/fix/D3/verify1/full/continuous-watcher.json

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
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.93 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 0 | pass |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 2 lines | **FAIL** |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 21 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 13.3 s (compound w1-wu2); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 16 words (median line 5 words; 240 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | yes | pass |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 34 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | 13 of 13 | pass |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 0 of 13 games | pass |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 10 of 10 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 105 of 105, rabbit 84 of 84; the paw's 13 replays not judged | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 8 of 8 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.4 s (run w1-9); 0 over | pass |

- **line-60s**: ‹tv_your_word› "Your word is..." from w2-1 @49:24.0; ‹tv_here_sound› "Here's the sound..." from world flower @50:50.6
- **talk-before-action**: compound (w1-wu2) 13.3 s from ‹fm_pair_cat_dog› "Cat dog!" to ‹tv_squish_ready› "Two little words make one big word. Now you make one. Are you ready?"

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

