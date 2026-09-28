<!-- TEACHER_SCRIPT §10, to append to docs/TEACHER_SCRIPT.md at integration (docs/fix-requests.md, "Picture reading v2
     and the read slider"). Written by the read-slider workflow, 27 Sep; this file only, because TEACHER_SCRIPT.md is
     another lane's while the fix workflow runs. -->

## 10. Picture reading v2 and the read slider (Jonas, 27 Sep)

> "I don't want you to use fish dog. I want you to use other words because I don't want it to come across as stealing from Mentava. … I think you should use it as a way to introduce the slow and the fast reading, right? You could say, okay, we can also read longer words made from shorter words. … It's like rainbow, not bow rain. … I think one thing that you could ask the user to do is drag their finger from left to right … And then we can have this sort of interface also with sounds where you slide across and the sensei says, say the sounds with me."

W2's and W4's picture reading are rebuilt on the **read slider** with real compound words, and W6's Sound Dots become the **Sound Slider**. The child slides the tortoise from left to right under two pictures (or under a picture's sound dots); each part is said once as the tortoise reaches it (the slow way); the rabbit's tap says the whole word (the fast way). A right-to-left slide reads nothing and gets a gentle line. Sensei's paw does every demo, slowly, in the first person, and she alone ever reads backwards ("Bow rain! It's raining bows!").

- **The beats** (the anatomy tables for W2, W4 and W6): docs/PICTURE_READING.md §3–§5. **The mechanic** (its rules, the wrong way, the idle ladders, Help, demo mode, the bot contract): docs/READ_SLIDER.md. The words: `src/content/compounds.ts`. This section is the index and the list of lines.
- **§9 (fast and slow, more often) holds**: the slider is its tortoise and rabbit made physical, and the new praise lines join §9.5's rotation (each at most once a session).

### 10.1 What it replaces

| Here | Rows | Becomes |
|---|---|---|
| §3.7 A, Ninja Reading (`rail`) | `tv_rail_frame`, `tv_rail_ido`, `fm_read_fish_dog`, `tv_rail_ready`, `tv_rail_turn`, `fm_pair_fish_dog` | PICTURE_READING §3 A–C: `pr_frame`, `pr_demo` and Sensei's slow read of rain + bow, the child's rabbit, `pr_demo_back` and her backwards show, `pr_back_rainbow` |
| §3.7 B, the swap | `fm_l2_swap` | gone (the backwards show is the only reversal, and it is Sensei's) |
| §3.7 C, two rows (`which`) | `tv_which_frame`, `tv_which_demo`, `tv_which_so`, `tv_which_q_*`, `fm_pair_cat_dog` | gone (Mentava's readiness check: research §2) |
| §3.7 D, Word Squish (`compound`) | `tv_squish_frame`, `tv_squish_slow`, `tv_squish_fast`, `fm_name_star`, `fm_starfish_q`, `fm_starfish`, `tv_praise_squish` | folded into Ninja Reading; **`tv_squish_ready` stays** as the Ready ("Two little words make one big word. Now you make one. Are you ready?"), then the child's slides (§3 D–E) |
| §3.7 E, Pocket Hunt | the 2×2 grid with fish and dog | sunflower, sock, cake and bow (no fish next to a dog anywhere) |
| §3.8, Reward 2 | `fm_rw2_list`, `fm_rw_shiny`, `fm_rw2_s` | `pr_rw2_list`, `pr_rw_shiny` (the shiny sticker is the rainbow), `pr_rw2_s` |
| §3.10, W4 | `tv_rail_again`, `tv_rail_yours`, `fm_triple_cat_dog_fish`, `fm_l4_swap`, `tv_which_again`, `fm_triple_fish_dog_cat`, `tv_squish_again`, `fm_rainbow`, `tv_w4_done` | PICTURE_READING §4: `pr_recap`, Sensei's canonical demo, `pr_your_turn`, raincoat (with the `coatrain` show), football, ◇ treehouse, `pr_w4_done` |
| §3.12, W6 Sound Dots | the child taps each dot (`tv_dots_ido`, `tv_dots_word_ido`, `tv_dots_ready`) | PICTURE_READING §5, the Sound Slider: `tv_dots_frame` stays, `pr_sounds_demo`, `rs_sounds_with_me` |
| §2's table of "first meetings" and §4's frames | `tv_rail_frame` "Ninjas always start on this side, and go this way." | `pr_frame` "Ninjas always read this way." (with the rail's light and the ninja's run on "this") |
| §7's lists | every id above that goes | `RETIRED_LINES`, "retired: picture reading v2 (27 Sep)" (docs/fix-requests.md lists them) |

### 10.2 The rules for these lines

- **The idea comes first**: "Two little words can make one long word." opens Sensei's demo, and `tv_squish_ready` says it again at the hand-over (Jonas: "we can also read longer words made from shorter words").
- **Demos**: the lead-in in the first person, and the paw sets off on "Watch" (READ_SLIDER §5). The paw is Sensei's own; the cream glove is only ever the ghost hand, "your turn".
- **The wrong way**: three lines in turn, none says "wrong" or "No", "left to right" only in the first; the corrections lead with "Let's" (27 Sep: the rule first was heard as stern).
- **Praise** only for the child's own fast word (the rabbit tapped), never after Sensei said it herself.
- **"Fast"** is said only in `rs_now_fast` (a BATH word, checked /ɑː/).

### 10.3 The lines and their clips

Recorded in Erinome (en-GB), plain text; every clip word-perfect by Whisper, at most 3.3 words a second, −16 LUFS. **Accent**: the calibrated judge (`scripts/accent-judge.ts`: r after a vowel, t between vowels, the BATH vowel), the clip's lowest word, British share of votes (votes a word). **Warmth**: a Gemini listen, "a kind old red panda talking to a 3-year-old", 1–5 (votes). The seven fix-round-1 clips were taken on `gemini-3.8-flash-lite-tts` (the 3.8-flash quota ran out) with `playtest/read-slider/audio/retake.ts`, and pass ≥ 80 % British on every word, warmth ≥ 4.0 (≥ 4.3 with at most one "told off" for the corrections and the frame); the rest are the first round's, with the judge's 7-vote accent and 3-vote warmth.

| id | text | s | words/s | accent | warmth | model |
|---|---|---|---|---|---|---|
| `rs_how` | Put your finger on the tortoise, and slide it this way. | 3.45 | 3.19 | 100 % (7) | 4.7 (3) | 3.8-flash |
| `rs_back_1` | That way is backwards. We always read from left to right. | 3.83 | 2.88 | 100 % (7) | 3.3 (3) | 3.8-flash |
| `rs_back_2` | Let's try again from the tortoise. Ninjas always start on this side. | 4.84 | 2.48 | 100 % (21) | 4.88 (8) | 3.8-flash-lite, fix round 1 |
| `rs_back_3` | The tortoise only walks this way. Start here, and slide it along. | 4.59 | 2.61 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `rs_start_here` | Let's start on this side. Put your finger on the tortoise. | 4.11 | 2.67 | 100 % (21) | 4.75 (8) | 3.8-flash-lite, fix round 1 |
| `rs_idle` | Put your finger on the tortoise when you're ready. | 2.76 | 3.26 | 100 % (7) | 4.7 (3) | 3.8-flash |
| `rs_keep_going` | Keep going, all the way to the rabbit. | 2.44 | 3.28 | no target words | 4.7 (3) | 3.8-flash |
| `rs_again` | Let's slide it again, from the very start. | 2.75 | 2.91 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `rs_sounds_with_me` | Now you slide it, and say the sounds with me. | 3.08 | 3.25 | no target words | 5.0 (3) | 3.8-flash |
| `rs_now_fast` | That was the slow way. Now tap the rabbit, and say it fast. | 4.17 | 3.12 | 71 % (7) | 3.3 (3) | 3.8-flash |
| `rs_slowly` | The tortoise likes to go slowly. Try it slowly, like me. | 5.74 | 1.92 | 86 % (7) | 5.0 (3) | 3.8-flash |
| `rs_praise_1` | You read each little word, then the whole big word. | 3.61 | 2.77 | 95 % (21) | 4.75 (8) | 3.8-flash-lite, fix round 1 |
| `rs_praise_2` | Tortoise first, then the rabbit. That's ninja reading! | 4.14 | 1.93 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `rs_praise_3` | You started at the beginning, and went all the way. | 3.27 | 3.06 | 71 % (7) | 4.0 (3) | 3.8-flash |
| `pr_frame` | Ninjas always read this way. | 1.88 | 2.66 | no target words | 4.75 (8) | 3.8-flash-lite, fix round 1 |
| `pr_demo` | Two little words can make one long word. I'll read this one slowly first. Watch my paw... | 6.86 | 2.48 | 90 % (21) | 4.88 (8) | 3.8-flash-lite, fix round 1 |
| `pr_demo_back` | Now watch what happens if I start on the other side... | 3.35 | 3.28 | 100 % (7) | 4.3 (3) | 3.8-flash |
| `pr_back_rainbow` | Bow rain! It's raining bows! We always start on this side. | 4.76 | 2.31 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `pr_back_raincoat` | Coat rain! It's raining coats! We always start on this side. | 4.10 | 2.68 | 100 % (7) | 4.7 (3) | 3.8-flash |
| `pr_back_snowman` | Man snow! It's snowing tiny men! We always start on this side. | 5.44 | 2.02 | 100 % (21) | 4.40 (15), 0 told off | 3.8-flash, 28 Sep retake (a 3.3 s pause cut to 0.7 s) |
| `pr_back_cupcake` | Cake cup! A cup made of cake! We always start on this side. | 4.02 | 3.23 | 100 % (21) | 4.80 (15), 0 told off | 3.8-flash, 28 Sep retake |
| `pr_back_football` | Ball foot! A ball with toes! We always start on this side. | 4.33 | 2.77 | 100 % (21) | 4.53 (15), 1 told off | 3.8-flash, 28 Sep retake |
| `pr_back_treehouse` | House tree! That's silly. We always start on this side. | 3.99 | 2.51 | 86 % (7) | 4.7 (3) | 3.8-flash |
| `pr_back_cowboy` | Boy cow! That's silly. We always start on this side. | 4.56 | 2.19 | 100 % (7) | 4.7 (3) | 3.8-flash |
| `pr_back_sunflower` | Flower sun! That's silly. We always start on this side. | 4.64 | 2.15 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `pr_back_pancake` | Cake pan! A frying pan made of cake! We always start on this side. | 6.28 | 2.23 | 100 % (21) | 5.00 (15), 0 told off | 3.8-flash, 28 Sep retake |
| `pr_another` | Here's another long word. | 1.29 | 3.10 | 86 % (7) | 4.7 (3) | 3.8-flash |
| `pr_sounds_too` | Words are made of sounds, too. Let me show you... | 3.19 | 3.14 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `pr_sounds_demo` | Let's say I want to read this word. I'll say its sounds first. Watch my paw... | 5.05 | 3.17 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `pr_recap` | It's Ninja Reading again. Little words make long words. | 4.02 | 2.24 | 86 % (7) | 5.0 (3) | 3.8-flash |
| `pr_your_turn` | Now it's your turn. Slide the tortoise this way. | 3.26 | 2.76 | 100 % (7) | 3.7 (3) | 3.8-flash |
| `pr_short` | It's Ninja Reading again. Slide the tortoise this way. | 3.83 | 2.35 | 100 % (7) | 4.7 (3) | 3.8-flash |
| `pr_w4_done` | You read lots of long words, the ninja way. | 2.93 | 3.07 | 100 % (21) | 5 (8) | 3.8-flash-lite, fix round 1 |
| `pr_last_word` | The last little word tells you what it is. | 2.88 | 3.13 | 86 % (7) | 5.0 (3) | 3.8-flash |
| `pr_what_rainbow` | A rainbow is a big bow of colours in the rain. | 3.70 | 2.97 | 100 % (7) | 3.3 (3) | 3.8-flash |
| `pr_what_snowman` | A snowman is a man made of snow. | 2.76 | 2.89 | no target words | 4.7 (3) | 3.8-flash |
| `pr_what_cupcake` | A cupcake is a little cake in a paper cup. | 3.07 | 3.25 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `pr_what_raincoat` | A raincoat is a coat for the rain. | 2.56 | 3.12 | no target words | 3.7 (3) | 3.8-flash |
| `pr_what_football` | A football is a ball you kick with your foot. | 3.51 | 2.85 | no target words | 3.3 (3) | 3.8-flash |
| `pr_what_treehouse` | A treehouse is a little house up in a tree. | 3.15 | 3.17 | 86 % (21) | 4.63 (8) | 3.8-flash-lite, fix round 1 |
| `pr_what_cowboy` | A cowboy is a boy who looks after cows. | 2.91 | 3.09 | 100 % (7) | 3.7 (3) | 3.8-flash |
| `pr_what_sunflower` | A sunflower is a big flower that looks like the sun. | 4.13 | 2.67 | 86 % (7) | 3.7 (3) | 3.8-flash |
| `pr_what_pancake` | A pancake is a flat cake you make in a pan. | 3.43 | 3.21 | no target words | 5.0 (3) | 3.8-flash |
| `pr_rw2_list` | Rain, bow, snow, man, snowman, cup, cake and cupcake! | 6.62 | 1.36 | no target words | 4.0 (3) | 3.8-flash |
| `pr_rw_shiny` | Ooh, a shiny sticker! Rainbow! | 2.56 | 1.96 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `pr_rw2_s` | Sun, sock, sausage and snowman. They all start with... | 5.61 | 1.61 | 100 % (7) | 4.3 (3) | 3.8-flash |
| `pr_map_replay` | Do you want to play Ninja Reading again? | 2.45 | 3.26 | no target words | 4.7 (3) | 3.8-flash |

Still to watch (not blocking, first-round clips): `rs_now_fast` and `rs_praise_3` at 71 % on 7 votes, `rs_back_1`, `rs_now_fast`, `pr_back_snowman` and `pr_what_rainbow` at 3.3 warmth on 3 votes, `pr_back_cupcake` (1.3 on 3 votes; 4.3 on the judge's 8); and one listener heard `pr_what_rainbow`'s "bow" as the bow of bowing down (/baʊ/): check it by ear. The next re-take on 3.8-flash (docs/fix-requests.md) should take them through `retake.ts`'s gates too.
