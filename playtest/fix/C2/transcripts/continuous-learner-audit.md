# Script audit

Counts by scripts/treadmill/script-audit.ts. Utterance = clips joined within 0.6 s, with no tap between them. Times are game seconds.

## playtest/runs/fix/C2/cont/continuous-learner.json (learner, one continuous page)

334 Sensei lines, 183 sounds and words, 227 utterances in 33 pieces.

### Most-said lines

| Line | Times | Text |
|---|---|---|
| first_q | 6 | Which one starts with... |
| first_sound_q | 5 | What's the first sound? |
| fm_tap_rabbit | 4 | Now tap the rabbit, and say it fast. |
| tv_let_me_listen | 4 | Hmm, let me listen. |
| tv_so_i_tap | 4 | So I'll tap it. |
| tv_tap_it_say | 4 | Now you tap it, and say the sound. |
| tv_by_yourself | 4 | Now you do one all by yourself. |
| st_first_q2 | 4 | Which picture starts with... |
| tv_which_write | 4 | Which of these is the way we write... |
| fs_ant | 4 | Ant starts with... |
| last_sound_q | 4 | What's the last sound? |
| tv_map_hint | 3 | The glowing stone is your next game. Tap it when you're ready. |
| fm_name_van | 3 | This is a van. |
| tv_here_sound | 3 | Here's the sound... |
| tv_fs_stuck_slow | 3 | Let's say it the slow way first... |
| suki_says | 3 | Suki says... |
| kai_says | 3 | Kai says... |
| tv_rhyme | 2 | Tip, tap, tiptoe, quiet as a mouse. |
| fm_name_cat | 2 | This is a cat. |
| fm_tap_tortoise | 2 | Now you tap the tortoise, and say it slowly with me. |
| tv_pocket_ido | 2 | I'll find one first. |
| tv_so_pocket | 2 | So into the pocket it goes! |
| tv_ready_go | 2 | Do you want to have a go now? |
| fm_name_mug | 2 | This is a mug. |
| fm_rw_more | 2 | More stickers for your Sticker Book! |
| fm_name_bus | 2 | This is a bus. |
| tv_first_sound | 2 | Our first sound is... |
| tv_petal_say | 2 | Tap the petal, and say it with me. |
| tv_ready_together | 2 | Let's do the next one together. Are you ready? |
| tv_watch_write | 2 | Now watch my ninja write it. |

### Echoes: the same utterance shape back to back (0)


### Near repeats: the same line again within 15 s (9)

| Line | Repeats | Text | Example |
|---|---|---|---|
| tv_which_write | 2 | Which of these is the way we write... | level w1-2 @870.5s and @877.1s |
| tv_rhyme | 1 | Tip, tap, tiptoe, quiet as a mouse. | dojo welcome @143.0s and @152.1s |
| fs_ant | 1 | Ant starts with... | level w1-3 @993.3s and @1004.3s |
| first_sound_q | 1 | What's the first sound? | level w1-4 @1239.0s and @1251.3s |
| last_sound_q | 1 | What's the last sound? | level w1-4 @1257.6s and @1272.5s |
| read_tap_sounds | 1 | Tap each sound, and say it. | level w1-4 @1314.9s and @1325.7s |
| kai_says | 1 | Kai says... | level w1-4 @1318.4s and @1327.4s |
| suki_says | 1 | Suki says... | level w1-4 @1316.4s and @1329.1s |

### Spliced utterances: 61 of 227 (27%); chains of 5+ clips: 32

Commonest spliced shapes:

- ×2 ‹st_first_q2› + /X/
- ×2 ‹fs_tin› + /X/
- ×1 W + ‹tv_ts_meet› + ‹tv_ts_fast› + W + ‹tv_ts_slow› + W + ‹tv_ready_paw› + ‹fm_tap_tortoise›
- ×1 ‹fm_notice_sun_sock› + /X/ + ‹tv_petal_first›
- ×1 ‹tv_pocket_frame› + ‹tv_pocket_ido› + ‹fs_sun› + /X/ + ‹tv_so_pocket› + ‹tv_pocket_ready_two›
- ×1 W + ‹fm_found_both› + /X/
- ×1 ‹fm_rw_shiny› + ‹fm_rw2_s› + /X/
- ×1 ‹tv_ts_again› + ‹fm_name_mug› + ‹tv_ts_slow_one› + W + ‹fm_tap_tortoise›
- ×1 ‹tv_slow_frame› + ‹tv_slow_demo› + W + ‹tv_i_hear_mug› + ‹tv_ready_go›
- ×1 ‹fm_name_van› + ‹fm_name_bag› + ‹tv_slow_yours› + W + ‹fm_which_pic›
- ×1 ‹tv_pocket_middle› + ‹tv_here_sound› + /X/ + ‹tv_new_petal_say›
- ×1 W + ‹fm_found_all› + ‹t_they_all_have› + /X/
- ×1 /X/ + /X/ + ‹tv_dots_word_ido› + W + ‹tv_dots_ready›
- ×1 ‹tv_first_frame› + ‹tv_first_sound› + /X/ + ‹tv_petal_say› + /X/
- ×1 ‹tv_ido_pair_map_hat› + ‹tv_let_me_listen› + W + ‹fs_map› + /X/ + ‹tv_so_i_tap› + ‹tv_ready_together›

Longest chains:

- level w1-4 @1226.5s (10 clips): "am" /m/ Say the sounds, and read the word. /a/ /m/ "am" That was a tricky one, and you kept going. Your word is... "at" What's the first sound?
- level (first minutes) @188.3s (8 clips): "sock" Here are my friends, the rabbit and the tortoise. The rabbit says words fast... "sun" The tortoise says them slowly... "sun" (slowly) Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again. Now you tap the tortoise, and say 
- level w1-2 @740.1s (7 clips): I'll go first. Here's a map and a hat. Hmm, let me listen. "map" (held) Map starts with... /m/ So I'll tap it. Let's do the next one together. Are you ready?
- level w1-2 @795.8s (7 clips): I'll go first. Here's a bed and a sock. Hmm, let me listen. "sock" (held) Sock starts with... /s/ So I'll tap it. Let's do the next one together. Are you ready?
- level w1-3 @1004.3s (7 clips): Ant starts with... /a/ Now watch my ninja write it. This is how we write... /a/ Now you tap it, and say the sound. /a/
- level w1-4 @1245.0s (7 clips): Let's say it the slow way... /a/ /t/ And now, fast... "at" "am" What's the first sound?
- level (first minutes) @271.8s (6 clips): In Pocket Hunt, we find pictures that start with this sound. I'll find one first. Sun starts with... /s/ So into the pocket it goes! Now you find the other two. Are you ready?
- level w1-2 @759.9s (6 clips): Man starts with... /m/ Now watch my ninja write it. This is how we write... /m/ Now you tap it, and say the sound.

### Praise: 10 lines (0.4 a minute); stacked (2+ within 5 s): 0


### Silences of 10 s or more inside a level or piece: 0


### Cut-off clips: 15

- intro film @8.5s: "When you're ready to see what happens next, tap the green arrow." cut after 2.7 of 3.8 s by Every petal was a sound. With sounds, we could tal
- choose @72.3s: "First, choose your ninja. Will it be Kai, or Suki?" cut after 0.3 of 3.6 s by Great choice!
- opt-in @106.9s: "Now come with me to the dojo. Tap the green arrow." cut after 2.9 of 3.6 s by Welcome to my dojo. A dojo is a school for ninjas.
- dojo welcome @118.1s: "Trick one is the gong. Tap it, and your ninja will kick it." cut after 3.2 of 4.5 s by Bong! That's your first star.
- level (first minutes) @178.5s: "Look, your ninja is ready. Are you ready too? Tap the green arrow." cut after 2.9 of 4.2 s by Your word is sock. Can you find the sock?
- level (first minutes) @198.6s: "Do you want to have a go now? Tap the green arrow. Or tap my paw to se" cut after 2.7 of 6.1 s by Now you tap the tortoise, and say it slowly with m
- level (first minutes) @356.0s: "Now you read them. Do you want to have a go?" cut after 3.0 of 3.4 s by Tap each picture, starting on this side.
- level (first minutes) @412.5s: "Two little words make one big word. Now you make one. Are you ready?" cut after 3.2 of 4.5 s by This is a star.
- level w1-2 @814.5s: "/s/" cut after 0.4 of 0.7 s by Sit starts with...
- level w1-2 @852.5s: "/s/" cut after 0.1 of 0.7 s by Keep going, ninja.
- level w1-4 @1170.1s: "This card is my word. Tap it, and hear the word." cut after 2.9 of 3.6 s by "am"
- level w1-4 @1211.1s: "Now tap the rabbit, and read the word fast." cut after 0.1 of 3.4 s by "at"
- level w1-4 @1289.6s: "First, you read it. Tap each sound, and say it with me." cut after 0.2 of 4.3 s by /a/
- level w1-4 @1314.9s: "Tap each sound, and say it." cut after 0.3 of 2.0 s by /a/
- level w1-4 @1325.7s: "Tap each sound, and say it." cut after 0.1 of 2.0 s by /a/

### Explanations: where and how often

| Line | Total | Where (times) |
|---|---|---|
| wf_i3 "Inside each petal are shiny gems. Each gem is a wa" | 1 | world flower |
| audit_gem_first "Look, a gem! Each gem holds a way to spell a sound" | 1 | reward |


## Checks (FIX_PLAN §11.2: the SCRIPT_FIXES rows, then the teacher's voice rows)

### C-L: playtest/runs/fix/C2/cont/continuous-learner.json

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
| `how-we-spell` "This is how we spell…" once per spelling per level (C-P ≤ 5) | once per spelling per level | 4 (0 repeats) | pass |
| `swap-place-heard` swap place lines heard to the end | all | 0 said | n/a |
| `praise-rate` praise lines a minute | ≤ 1.5 | 0.88 | pass |
| `praise-stacks` praise stacks within 5 s | 0 | 1 | **FAIL** |
| `line-60s` any line more than twice in 60 s (bar the §5.1 routines) | 0 | 0 lines | pass |
| `cut-explanations` cut-off explanations (not prompts) | 0 | 0 | pass |
| `split-correction` split-spelling errors with the two-letter correction (splitter) | 100% | n/a | n/a |
| `master-early` the tier-3 streak line before 7 whole answers | 0 | 0 of 0 | n/a |
| `unframed-turn` every game's first meeting: frame, demo, Ready hold, hand-over, in order | 0 missing | 0 of 14 games | pass |
| `over-framed` a replay that plays a full frame again | 0 | 0 | pass |
| `bare-command` bare-command lines (under 4 words, an instruction) | 0 | 0 said (0 lines) | pass |
| `bare-listen` a one-word "Listen…" opening a game, a beat, a level or a turn | 0 | 0; 0 after quiet or before the level's first tap | pass |
| `talk-before-action` talk before a child action, first meetings | ≤ 12 s (named runs 12.5 s) | max 12.3 s (compound w1-wu2); 1 over | **FAIL** |
| `turn-median` the median Sensei turn (all talk between two child actions) | 8–25 words | 19 words (median line 6 words; 78 turns) | pass |
| `rhetorical-question` rhetorical questions (a ? with no hold or turn that can answer it) | 0 | 0 said (0 lines) | pass |
| `shouted-instruction` instructions that end in "!" | 0 | 0 said (0 lines) | pass |
| `demo-command` a line addressed to the child during Sensei's own demo | 0 | 0 | pass |
| `first-dojo-opening` w2-1 opens with the lesson's frame, tv_learn_how and the Ready hold, before any sound | yes | n/a | n/a |
| `ready-auto-advance` a Ready hold that ends without the child | 0 | 0 of 12 | pass |
| `watcher-replay` the paw at a Ready: the demo, tv_ready_now, and a hold that waits | all | n/a | n/a |
| `handover-once` a hand-over Ready answered on the board isn't asked again | 0 | 0 of 1 re-asked | pass |
| `fs-per-session` fast and slow told once a session in every game that says a word slowly or blends (an idea line or Move 1) | 0 missing | 1 of 7 games | **FAIL** |
| `fs-repeat` an idea line (or a fast/slow praise line) said twice in a session | 0 | 0 | pass |
| `fs-idea-caps` idea lines ≤ 2 a level and ≤ 4 a session; from land 3, Moves 1 and 2 in one game a session | ≤ 2 / ≤ 4; 1 game from land 3 | 2 a level, 4 a session (most) | pass |
| `fs-readback` the first read-back of each game in a session: slow lead-in, the sounds, then the word led by a fast lead | 100% | 3 of 3 (100%) | pass |
| `fs-badges` the tortoise lit on every slow slot, the rabbit on the fast word after it | 100% | tortoise 24 of 24, rabbit 11 of 11 | pass |
| `fs-answer-leak` the answer said before the child answers (Slow Words, Guess My Word, Ninja Run, Kai and Suki) | 0 | 0 | pass |
| `fs-rabbit` Move 1's rabbit: a child action after every rabbit prompt, and live only then | all; 0 outside | 5 of 5 prompts answered (0 timed out); 0 rabbit taps outside a prompt | pass |
| `fs-talk` talk before a child action, in runs with a fast/slow line | ≤ 12 s | max 11.0 s (readcheck w1-4); 0 over | pass |

- **praise-stacks**: w1-2 @14:08.3: "Well done." → "Keep going, ninja."
- **talk-before-action**: compound (w1-wu2) 12.3 s from ‹tv_squish_frame› "Here's a new game, called Word Squish." to ‹tv_squish_ready› "Two little words make one big word. Now you make one. Are you ready?"
- **fs-per-session**: firstsound (w1-2 12:08.4, land 1): no idea line, rabbit prompt or slow-then-fast pair. It said: ‹tv_first_frame› ‹tv_first_sound› ‹tv_petal_say› ‹tv_ido_pair_map_hat›

### Recordings

| `fast-line` new sentence lines faster than 3.3 words a second | 0 (or re-taken) | 0 of 494 | pass |

