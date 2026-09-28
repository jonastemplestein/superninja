# Picture reading v2

27 September 2026. W2's picture reading, rebuilt on the read slider (docs/READ_SLIDER.md) with real compound words. It replaces the fish-dog everywhere. The script of record is TEACHER_SCRIPT §10 (appended the same day), which points here for the beats. The research is docs/read-slider/research.md; every fish-dog reference and what it becomes is docs/read-slider/fishdog-inventory.md (row ids S1, P3, D7…); the changes to existing files are in docs/fix-requests.md under "## Picture reading v2 and the read slider (27 Sep)".

> Jonas, 27 Sep: "I don't want you to use fish dog. I want you to use other words because I don't want it to come across as stealing from Mentava. … it's confusing when the sensei shows it. It's like, let me show you. Fish dog, fish dog, fish dog. The whole interaction makes no sense. I think you should use it as a way to introduce the slow and the fast reading, right? You could say, okay, we can also read longer words made from shorter words. … It's like rainbow, not bow rain."

---

## 0. The short version

- **No fish-dog, no dog-fish, no swap, no "which row did I read?"** in W2 or W4. They were Mentava's readiness check in our clothes (research §2).
- **Picture reading is now the introduction to the slow way and the fast way of reading.** Two little words make a long word. The slow way is the tortoise: "rain… bow". The fast way is the rabbit: "rainbow".
- **The child reads by sliding the tortoise left to right under the pictures** (the read slider). Each little word is said as the tortoise reaches it; the rabbit's tap says the whole word.
- **Order matters, and Sensei shows why, once:** her paw walks the tortoise the other way and it reads "bow… rain": a cloud raining bows. "Bow rain! It's raining bows! We always start on this side." Only Sensei ever reads backwards; a child's backwards slide reads nothing and gets a gentle line.
- **Demos are Sensei's, slow and explicit** (Jonas, 27 Sep): "Two little words can make one long word. I'll read this one slowly first. Watch my paw…", and her own red panda's paw comes out of her portrait and slides the tortoise. The ninja never strikes the cards or runs back along the rail.
- **Words are made of sounds, too:** the same slider under a picture's sound dots, "say the sounds with me" (/m/ /o/ /p/ … mop). A Sensei-only ◇ bridge at W2, and W6 becomes the child's Sound Slider.
- **Reward 2's shiny sticker is the rainbow.** A save's `fishdog` sticker becomes the rainbow in the same place in the book.

---

## 1. The words

The bank is `src/content/compounds.ts` (16 compounds, research §4). Real compound words whose parts and whole are everyday things for a British 3-year-old, and whose backwards order is silly. No animal + animal, no BATH vowel, no reverse that is a real thing.

| Tier | Where | Compounds (parts) | Reversed (the gag) |
|---|---|---|---|
| **A**, the first meeting (W2) | Sensei's demo | **rainbow** (rain + bow) | "Bow rain! It's raining bows!" **pictured** (`pic_bowrain`) |
| | the child's | **snowman** (snow + man), **cupcake** (cup + cake) | said only: `pr_back_snowman` "Man snow! It's snowing tiny men!", `pr_back_cupcake` "Cake cup! A cup made of cake!" (each then "We always start on this side.") |
| **B**, the second meeting (W4) and recaps | | **raincoat** (rain + coat), **football** (foot + ball), **treehouse** (tree + house), **cowboy** (cow + boy) | raincoat **pictured** at W4 (`pic_coatrain`); the rest said only (`pr_back_football` "Ball foot! A ball with toes!") |
| **C**, the reserve | the practice dojo, Sensei's Challenge, a repeated lesson | sunflower, pancake, starfish, butterfly, ladybird, jellyfish, toothbrush, hedgehog, seahorse | sunflower and pancake have lines (`pr_back_pancake` "Cake pan! A frying pan made of cake!"); the rest none yet |

- **Every said-only reversal paints its silly picture**, as "Bow rain! It's raining bows!" does, and then gives the rule: "We always start on this side." (28 Sep, PR16: the old "Man snow! That's silly." was heard as scolding.) Treehouse, cowboy and sunflower still say "That's silly." until they are reworded and re-taken the same way.

- Sunflower stands in for cupcake if cupcake's picture ever fails the picture audit (every asset exists).
- Starfish keeps its place in the reserve. Its reverse "fish star" is fine, and it is a real compound, not the fish-dog. It is not at the first meeting because fish and a thing next to it is the pattern Jonas asked to leave.
- Fish and dog stay as ordinary pictures elsewhere, but **no slider, rail or row puts fish and dog next to each other**, and no line says "fish dog" or "dog fish" (inventory §1's rule).

---

## 2. The idea, in the child's words

1. Ninjas always read this way, from this side to that side.
2. Little words can make a long word. There's a **slow way** to read it (the tortoise: rain… bow) and a **fast way** (the rabbit: rainbow).
3. The other way round makes a silly word: bow rain! That's why we always start on this side.
4. Words are made of sounds, too. The slow way: /m/ /o/ /p/. The fast way: mop.

---

## 3. W2, the first meeting (`picread`, full)

*Voice:* warm and unhurried; a magic trick in the demo, and a real giggle in "Bow rain!". The tables use TEACHER_SCRIPT's anatomy (§1): the trigger, what is on screen, the exact text, what the child does, and which forms it plays in. `[w]` is a word clip; `·` separates clips 0.35 s apart. The slider's own lines (the wrong way, idle, Help) are READ_SLIDER.md §3 and §6 and are not repeated here.

### A. The frame

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| pr_frame | 0 s | the rail slides in; the start dot glows. On "this" the start dot and the gold arrow pulse and a light runs the rail left to right (`readSlider.cue()`), and the ninja runs the rail left to right with a speed trail, vanishes in a smoke puff at the right-hand end and reappears in a puff at home (the ninja's run is the scene's) | Ninjas always read this way. | — | full |

(Reward 1 has just said `tv_rw_next` "Next, we're going to read some pictures, the ninja way.", so the lesson is framed. The frame is one sentence, but the first run still measures 14.4 s (§3.2), so the proposal there is to run the rail's cue silently and not say `pr_frame` when W2 follows `tv_rw_next`.)

### B. Sensei's slow demo: rain + bow

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| — | 1.9 s | rain and bow land on the rail, side by side | — | — | full |
| pr_demo | 2.2 s | on "Watch" (`pr_demo.words.json`: 5.94 s) `slideDemo()`: Sensei's own red panda's paw comes out of her portrait and flies an arc to the tortoise (SenseiDemo's rising scoop, under the cards; READ_SLIDER §5), landing on the back of its shell; the ninja turns to watch | Two little words can make one long word. I'll read this one slowly first. Watch my paw... | watches | full |
| [rain] · [bow] | the line ends | 300 ms after her last word the paw presses the tortoise (450 ms), then slides it slowly (170 px a second). As the tortoise reaches each card, the card's light comes on and its word plays; the tortoise waits under "rain" until the word is over. The ninja listens | [rain] · 300 ms · [bow] | watches, may say them | full |
| rs_now_fast | 0.7 s after [bow] | the paw flies back into her portrait; the rabbit wakes and pulses | That was the slow way. Now tap the rabbit, and say it fast. | **taps the rabbit** | full |
| [rainbow] | the tap | the rabbit hops; the cards zip together and bloom into the rainbow; the ninja cheers (◇ the scene's one straight dash along the rail, left to right, into a smoke puff and back home) | [rainbow] | — | full |
| ↳ (idle) | the rabbit untouched | 8 s: it hops and glows. 12 s: Sensei says it | Now the fast way, like the rabbit... · [rainbow] (`tv_fs_fast_rabbit`) | — | every time |

This is TEACHER_SCRIPT §9.2's Move 1: Sensei says the slow way, the child makes the fast word. **"Rainbow" is heard once in the demo**, on the child's own tap.

### C. The backwards show: bow rain (full form only)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| pr_demo_back | 0.7 s after [rainbow] | the rainbow comes apart into rain and bow; on "watch" her paw comes out again onto the tortoise, which is at the rail's **right-hand** end after her slow read | Now watch what happens if I start on the other side... | watches | full |
| [bow] · [rain] | the line ends | the paw walks the tortoise from right to left, puzzled (a backstep wobble); each card lights as the tortoise reaches it from the right | [bow] · [rain] | watches | full |
| pr_back_rainbow | the tortoise reaches the left | the cards flip into **the bow-rain picture** (`pic_bowrain`, a grey cloud raining red bows); the ninja does its think pose, then laughs. **On "We"** the picture flips back to the rainbow, the tortoise pops back onto the start dot, the dot pulses, a light sweeps the rail left to right **and her paw rides it**, from the start dot to the arrow, then goes home: the last movement before the child's turn is the right way | Bow rain! It's raining bows! We always start on this side. | laughs | full |

- The only right-to-left reading in the game, and it is Sensei's. The picture exists only here (`reverse.pic` in compounds.ts); a child's backwards slide never earns a picture (READ_SLIDER §3.1).
- **Show me again** (the paw) during the child's turn replays only B on rain and bow, with `tv_show_again` in place of `pr_demo`, and Sensei says the fast way herself (`fast: "auto"`). Never C.

### D. The readiness hold

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_squish_ready | 0.3 s after C | snow and man land on the rail; ▶ and the paw pop in | Two little words make one big word. Now you make one. Are you ready? | taps ▶ | full |

(Jonas's "we can also read longer words made from shorter words": said first as the demo's opening, "Two little words can make one long word.", and again here as the hand-over. Recorded; its id stays from Word Squish.)

### E. The child's turn: snowman, then cupcake

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| rs_how | after the bow | the tortoise's halo breathes; the ghost hand slides once from the dot to the rabbit, silently | Put your finger on the tortoise, and slide it this way. | **slides** | the save's first slide |
| [snow] · [man] | the tortoise reaches each card | each card lights as its word plays; the trail of light follows the tortoise | [snow] · [man] | says them along | every time |
| rs_now_fast | 0.7 s after [man] | the rabbit wakes | That was the slow way. Now tap the rabbit, and say it fast. | **taps the rabbit** | the save's first; after that the rabbit only pulses |
| [snowman] · rs_praise_1 | the child's tap (not Sensei's 12 s fast way: then no praise line) | the bloom into the snowman; the ninja cheers | [snowman] · You read each little word, then the whole big word. | — | the save's first slide (specific praise) |
| pr_another | cup and cake land | the tortoise's halo | Here's another long word. | slides, taps the rabbit | every time |
| [cup] · [cake] · [cupcake] | the slide, the tap | the bloom into the cupcake | [cup] · [cake] · [cupcake] | — | every time |
| ↳ the wrong way, a start in the middle, idle, a slide left part-way | | READ_SLIDER §3 and §6 | `rs_back_1..3`, `rs_start_here`, `rs_idle`, `rs_keep_going`, `rs_again` | | every time |

- No "This is snow." before a slide: the slide itself names the parts (research RS8).
- Praise rotates across later sessions: `rs_praise_2` "Tortoise first, then the rabbit. That's ninja reading!", `rs_praise_3` "You started at the beginning, and went all the way.", and TEACHER_SCRIPT §9's `tv_fs_praise_both` "Slow, then fast. That's real reading." (§9.5: each praise line at most once a session).

### F. ◇ The bridge to sounds (Sensei's; not optional in the Reception version)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| pr_sounds_too | when the lesson isn't behind | mop lands with three sound dots on the rail under it; on "show" her paw comes out of her portrait and flies to the tortoise | Words are made of sounds, too. Let me show you... | watches | full |
| /m/ · /o/ · /p/ | the line ends | the paw slides the tortoise; each dot lights gold on its sound (slices of the checked slow word, 250 ms apart) | /m/ /o/ /p/ | watches | full |
| tv_fs_fast_rabbit · [mop] | the slow way done | the dots draw together; the mop hops | Now the fast way, like the rabbit... · [mop] | — | full |

The child's own sound slides are W6's (§5). The time governor drops F for a slower child (about 9 s).

### G. ◇ One more Pocket Hunt, and the close

Unchanged from TEACHER_SCRIPT §3.7 E, with one change: the 2×2 grid is **sunflower, sock, cake and bow** (not fish and dog: inventory §1's rule; cake and bow are W2's own pictures, and "cake bow" isn't a word). Then `fm_l2_done` "You read the pictures, just like a real reader!" · `tv_rw_link_book`.

### 3.1 Beats in `warmups.ts`

```ts
W2: {
  key: "W2", title: "Ninjas Read This Way", kind: "picread", targetS: 95, capS: 110,
  stickers: ["rain", "bow", "snow", "man", "snowman", "cup", "cake", "cupcake"], list: "pr_rw2_list", shiny: "rainbow", shinyLine: "pr_rw_shiny",
  beats: [
    { kind: "slide", secs: 34, by: "sensei", compound: "rainbow", frame: "pr_frame", lead: "pr_demo", gag: true },   // A, B, C
    { kind: "slide", secs: 30, by: "child", compounds: ["snowman", "cupcake"], ready: "tv_squish_ready" },           // D, E
    { kind: "slide", secs: 9, optional: true, by: "sensei", sounds: "mop", lead: "pr_sounds_too" },                   // F
    { kind: "tapall", secs: 14, optional: true, how: "start", p: "s", cards: ["sunflower", "sock", "cake", "bow"], targets: ["sunflower", "sock"], demo: "sock" },
    { kind: "done", secs: 7, lines: ["fm_l2_done", "tv_rw_link_book"] },
  ],
}
```

The `slide` beat's exact shape is C2's call (docs/fix-requests.md); the numbers are estimates for the governor until the bot measures them.

### 3.2 Timing (measured 27 Sep; a run ends when the child can next do something the game registers)

Measured on the harness (`playtest/read-slider/`, today's build) from each clip's real start in the page's own audio, in two ways. The first is a child who waits for each prompt and acts about 0.6–1 s after Sensei stops, as `record.ts` plays. The second is an eager child who taps each thing as soon as it is live. Both runs below are the same either way, because the child can do nothing inside them. The read-slider judge's run (27 Sep) agrees to within 0.3 s.

| Run | What plays (s) | Measured |
|---|---|---|
| **The lesson's ▶ (Reward 1's `tv_rw_next`) → the rabbit wakes** (`rs_now_fast`) | the rail's arrival 0.55 · `pr_frame` 1.89 · `pr_demo` 6.86 (the paw sets off on "Watch" and lands as she finishes) · the paw's hover 0.3, press 0.45 and slide to "rain" (1.92 in all) · [rain] 0.72, its gap and the slide on to "bow" (1.59) · [bow] 0.56, the paw on to the end of the rail, and 0.7 (1.62) | **14.4 s** (13.9 s from `pr_frame`'s first word; the judge measured 14.2 s). All watching. |
| **The rabbit tap → the Ready's ▶** (`tv_squish_ready`) | the tap to [rainbow] 0.01 · [rainbow] 0.74 and 0.7 · `pr_demo_back` 3.35, the paw's 0.25 and the walk back to "bow" (4.12) · [bow] 0.56, 0.3 and the walk to "rain" (2.07) · [rain] 0.72 and 0.3 · `pr_back_rainbow` 4.76 (her paw's ride on "We") and 0.3 | **13.8 s** (the judge measured 13.96 s). All watching. |
| The Ready → the first slide | `tv_squish_ready` 4.51 (▶ live all through it) · `rs_how` 3.45 (the child may slide during it) | 0–9 s |
| **`pr_frame` → the child's first own slide** | the two runs above, `rs_now_fast` 4.17, `tv_squish_ready`, `rs_how` and the child's taps | **44.4 s** for a child who waits for each prompt (the judge: about 44 s); about 27.8 s for an eager child (one who taps each thing the moment it is live; re-measured 27 Sep) |

Both runs break TEACHER_SCRIPT §0.1: each is about 14 s of watching with nothing to do. Fix round 1's "12.8 s measured" for the second run was wrong: the videos of that build (`compound-normal.json`) measure 13.7 s from [rainbow] to `tv_squish_ready`.

**The proposal: 11.4 s and 11.0 s, with Sensei's demos as they are.** Jonas asked for demos that are slow and explicit, so both demos keep their shape and their clips. That means `pr_demo`, the paw's flight, its press and its slow slide (170 px a second, waiting under "rain"), and the whole backwards show: `pr_demo_back`, the walk back, the bow-rain picture and `pr_back_rainbow`. The time comes from around them, with no new audio (docs/fix-requests.md, "Picture reading v2 and the read slider", C2 and the slider).

*The first run, 14.4 → about 11.4 s:*
1. **No spoken frame when W2 follows Reward 1 (−1.89 s).** `tv_rw_next` has just framed the lesson ("Next, we're going to read some pictures, the ninja way. Tap the green arrow when you're ready."), and its ▶ is what starts W2. The rail's cue still runs silently as the rail lands: the start dot and the arrow pulse, the light runs the rail left to right, and the ninja dashes. Then `pr_demo` starts. Before the child's first slide, "We always start on this side." (C) and "slide it this way" (`rs_how`) still say it. `pr_frame` stays wherever W2 is entered any other way (the map, a repeated lesson).
2. **The first line starts as the rail starts to slide in (−0.45 s),** not 0.55 s after the slider has mounted (the harness's `show()` waits for the mount and then 350 ms).
3. **The paw presses as soon as she has finished (−0.3 s):** `PAW_MS.hover` 300 → 0 for the forward demo. `quiet()` already waits for her voice to end, so the press never lands on her words.
4. **The rabbit wakes 0.3 s after the demo's last part (−0.4 s):** `slowDone`'s beat 700 → 300 ms when the slider has `demo`. The child's own slides keep 0.7 s, the beat for their own go at the whole word.

*The second run, 13.8 → about 11.0 s:*
1. **The Ready's ▶ pops in on "We" (−1.90 s: the rest of the line and the 0.3 s after it).** That is 3.16 s into `pr_back_rainbow`, as the tortoise pops home and her paw rides the rail left to right. `tv_squish_ready` still follows the line, with ▶ bouncing, as today. A tap on ▶ during "…start on this side." lets that sentence finish (1.4 s; it is the rule), skips `tv_squish_ready`, and goes straight to `rs_how`.
2. **The beat after the child's [rainbow] goes from 0.7 to 0.35 s (−0.35 s).** The bloom carries on under "Now watch…".
3. **The walk back starts as she finishes (−0.25 s):** the backwards demo's `quiet(250)` → `quiet(0)`.
4. **The bow-rain picture and `pr_back_rainbow` come as [rain] ends (−0.3 s),** with no 300 ms part gap after the show's last part.

With all eight, `pr_frame` → the first own slide is about 40.5 s for a child who waits for each prompt (44.4 s now), and about 23.5 s for an eager one.

- **If the frame must be said** (Jonas's call): keep `pr_frame` and take tomorrow's 3.8-flash re-take of `pr_demo` (docs/fix-requests.md, F2). That is the same words at her usual pace, about 3 words a second: the lite take is her slowest line at 2.5, and the first round's 3.8-flash take of 17 words ran 5.22 s. The first run is then 14.4 − 1.15 − about 1.4 = about 11.9 s.
- **A later option for the second run** (not needed for the rule): the child fixes the bow rain. After "Bow rain! It's raining bows!" the picture wobbles. The child's tap flips it back into the rainbow, and "We always start on this side." plays with the pop home and the paw's ride; if untapped for 3 s, her paw taps it. It is a tap that means something, but it needs `pr_back_rainbow` cut into two clips at about 2.6 s (`say()` can't start a line part-way) and a cue that a 3-year-old will follow, so it waits for a playtest.
- The whole lesson: A–E measured 67 s from the lesson's ▶ to `fm_l2_done` for a child who waits for each prompt, and about 41 s for an eager one (about 63 s and 36.5 s with the proposal). F adds about 9 s and G about 14 s. The target stays 95 s, the cap 110 s.
- **"Rainbow" is heard twice in the lesson** (the child's tap, and "rain… bow" as parts) and **"bow rain" once**, each with a reason on screen. That is the answer to "Fish dog, fish dog, fish dog."

---

## 4. W4, the second meeting (usually the next session), and the short form

W4's cat–dog–fish rail, its swap and its three-picture "which row" retire (they say fish and dog in a row, inventory S1). W4 becomes the second meeting with the slider:

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| pr_recap | 0 s | the rail; the ninja's run left to right | It's Ninja Reading again. Little words make long words. | — | recap |
| tv_fs_slow_tortoise · [rain] · [bow] · tv_fs_fast_rabbit · [rainbow] | the line ends | the canonical demo on rain and bow: the paw slides the tortoise; Sensei says the fast way herself (`fast: "auto"`); no gag | First the slow way, like the tortoise... · … · Now the fast way, like the rabbit... · [rainbow] | watches | recap |
| pr_your_turn | the bloom | rain and coat land | Now it's your turn. Slide the tortoise this way. | slides, taps the rabbit | recap |
| [rain] · [coat] · [raincoat] | the slide, the tap | the bloom into the raincoat | [rain] · [coat] · [raincoat] | — | recap |
| pr_demo_back · [coat] · [rain] · pr_back_raincoat | the bloom | the session's one pictured gag: the tortoise walks back; the raincoat flips into a cloud raining coats (`pic_coatrain`); on "We" it flips back and the tortoise pops home | Now watch what happens if I start on the other side... · [coat] · [rain] · Coat rain! It's raining coats! We always start on this side. | laughs | recap |
| ◇ pr_last_word · pr_what_raincoat | after the gag, when the lesson isn't behind | the raincoat glows, then the coat card on "coat" | The last little word tells you what it is. · A raincoat is a coat for the rain. | — | recap |
| pr_another · foot, ball → [football] | | | Here's another long word. | slides, taps the rabbit | recap |
| ◇ pr_another · tree, house → [treehouse] | when the lesson isn't behind | | Here's another long word. | slides, taps the rabbit | recap |
| pr_w4_done | the close | every bead lit | You read lots of long words, the ninja way. | — | every time |

- **W4's stickers** become coat, raincoat, foot, ball and football (◇ treehouse). Today's W4 stickers (rainbow, snowman) move to W2, where rainbow is the shiny one.
- **The short form** (a replay in the same session, from the map): `pr_short` "It's Ninja Reading again. Slide the tortoise this way." and straight into the child's slides. The paw offers the demo; no gag.
- **The meaning family** (`pr_what_<w>`, after `pr_last_word`) is the real reason the reverse is silly, for the child who is ready for it (the Reception version, a recap with time): rainbow, snowman, cupcake, raincoat, football, treehouse, cowboy, sunflower and pancake have one. Recorded, word-timed (`public/a/l/pr_what_<w>.words.json`) so the part's card can glow on its word.
- **Rotation** (the practice dojo, Sensei's Challenge, a repeated lesson): tiers B and C, each compound at most once a session, a pictured reversal at most once a session; every other reversal is said only (`pr_back_<w>`, where one exists).

---

## 5. W6, the Sound Slider

Today's Sound Dots has the child tap each dot. It becomes the slider in `mode: "sounds"` (READ_SLIDER §7):

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_dots_frame | 0 s | sun, with three dots on the rail under it | Every dot is one sound in the word. | — | full |
| pr_sounds_demo | 0 s | on "Watch" her paw comes out of her portrait and flies to the tortoise; it presses once she has finished | Let's say I want to read this word. I'll say its sounds first. Watch my paw... | watches | full |
| /s/ · /u/ · /n/ | the paw slides | each dot lights on its sound | | watches | full |
| rs_now_fast | 0.7 s after | the rabbit wakes | That was the slow way. Now tap the rabbit, and say it fast. | taps the rabbit | full |
| [sun] | the tap | the dots draw together; the sun hops | [sun] | — | full |
| rs_sounds_with_me | cat lands with its dots | the tortoise's halo | Now you slide it, and say the sounds with me. | **slides**, says the sounds | full |
| /k/ /a/ /t/ → the rabbit → [cat] · t_if_you_say_sounds | | | … If you say the sounds, you can hear the word. | taps the rabbit | the save's first (S~W's words, once per save) |
| bus, mug | | | | slides, taps the rabbit | every time |

The words are today's W6 words (cat, bus, mug; the demo sun), and the dots already have their sounds (`SLOW_TIMES`). Pure sounds only, slices of the checked slow words; never letter names. The harness's `sounds` case films this (Sensei on sun, the child on mop).

---

## 6. Who does what

- **Sensei** does every demo with her **paw**, slowly and aloud, in the first person, announced before it moves ("Watch my paw…"). She is the only one who ever reads backwards.
- **The tortoise** is the slow way: the child's handle, and it walks in Sensei's backwards show.
- **The rabbit** is the fast way: one tap, one hop, the whole word.
- **The ninja** watches (the listen pose) during the slow way, cheers on the child's fast word, thinks on a wrong way and laughs at "Bow rain!". On the frame, and optionally on the fast word, it makes **one straight dash along the rail, left to right**, vanishes in a smoke puff and reappears at home. It never strikes a card and never runs back along the rail, so every movement a child sees along the rail goes left to right.

---

## 7. Reward 2, the map, and the save

### 7.1 Reward 2

| line id | trigger | exact text | replaces |
|---|---|---|---|
| pr_rw2_list | the stickers land, each on its word (`public/a/l/pr_rw2_list.words.json`) | Rain, bow, snow, man, snowman, cup, cake and cupcake! | `fm_rw2_list` "Fish, dog, flower, sunflower, star and starfish!" |
| pr_rw_shiny | the shiny sticker lands in the centre | Ooh, a shiny sticker! Rainbow! | `fm_rw_shiny` "Ooh, a shiny sticker! Fish dog!" |
| pr_rw2_s | the /s/ question | Sun, sock, sausage and snowman. They all start with... | `fm_rw2_s` "…and sunflower" (sunflower is no longer a W2 sticker) |

- **The shiny sticker is the rainbow** (`SHINY` in compounds.ts). It is Sensei's demo word, and it suits the reward's own rainbow sweep. (A shiny "bow rain" would be funnier, but it would put a non-word into the Sticker Book: research §8.)
- The Sticker Book count after Reward 2 goes from 5 → 11 (+ shiny 12) to **5 → 13 (+ the shiny rainbow, 14)**. FIRST_MINUTES §8 needs its numbers updated.

### 7.2 The map

- Every `picread` stone's icon: `pic_rainbow` (was `pic_fishdog`, App.tsx `KIND_ICON`).
- The replay question keeps its id `tv_map_replay_picread` (the Confirm builds the id from the stone kind), with the new text "Do you want to play Ninja Reading again?". The clip is recorded as `pr_map_replay`; F2 copies it to the old id or re-records the old id with the new text.

### 7.3 The save: a fish-dog becomes the rainbow

A save can hold `"fishdog"` in `stickers`, in `shiny` and as `words.fishdog` (inventory §6); `"dogfish"` never gets into a save in normal play.

- **Rename, don't drop.** `RENAMED_STICKERS = { fishdog: "rainbow", dogfish: null }` (compounds.ts). A child who had the old Reward 2 keeps a shiny sticker in the same place in the book, and the same count. Dropping it would also make App.tsx's `firstW2` check replay Reward 2's first-time show.
- **Where:** a step in `store.ts` `migrate()` that runs on every load, **before** its early return, and is safe to run twice (the code is inventory §6's, with `SHINY = "rainbow"`; store.ts writes the ids out rather than importing content, and a test checks they equal `WARMUPS.W2.shiny`).
- **The edge case:** a child who already has a (plain) rainbow sticker from the old W4: the fish-dog is dropped and their rainbow becomes the shiny one. The count goes down by one, which is fine.
- **Ship together, in one release:** the migration, `firstW2` reading `WARMUPS.W2.shiny`, the cheat constants (inventory S20–S23) and the sweep's save (T1). Only after that do the fish-dog files move to `.trash/` (P1–P26).

---

## 8. The Reception version

Reception (autumn) plays W1 and W2 only, then goes to w1-2 with W3–W6 marked done (FIRST_MINUTES §9). So W2's Reception version:
- keeps A–E as they are;
- makes **F (the mop sound bridge) not optional**: it is the only sound slider a Reception child meets before w1-2;
- adds the meaning pair after the child's cupcake: `pr_last_word` · `pr_what_cupcake` "A cupcake is a little cake in a paper cup.";
- keeps its own last beat, the middle-sound Pocket Hunt on /a/ with < a > written (unchanged).
- Budget: target 125 s, cap 140 s (was 115 and 130; F and the meaning pair add about 13 s).

---

## 9. The assets (all new files; made 27 Sep)

### 9.1 Pictures (`public/a/i/pic_<w>.webp`)

Made in the house style (`scripts/art-manifest.ts` PIC_OBJECT / PIC_LIVING, `scripts/img.ts`; `playtest/read-slider/art/gen.ts`), four candidates each, cut as `scripts/post-art.py` cuts a word picture (rembg isnet-anime, trimmed, 384 px wide, WebP q86; `playtest/read-slider/art/post.py`), picked by eye on the game's plate at 200 px and 48 px (`playtest/read-slider/art/sheets/`), and checked by the Gemini vision judge as a young British child, 3 votes, with a face check for living things (`playtest/read-slider/art/judge.ts`, `judge.json`).

| Picture | Pick | The judge (first names, 3 votes) |
|---|---|---|
| cupcake | #1 | cupcake ×3 |
| raincoat | #3 | coat ×3 (a fair name: the slider says "raincoat" as the whole; the part is `pic_coat`, a blue coat, so the two differ in colour and hood) |
| ball | #0 | ball ×3 |
| football | #0 | football ×2, ball ×1 |
| treehouse | #1 | treehouse ×3 |
| cowboy | #1 | cowboy ×3, face ×3 |
| pancake | #0 | pancakes ×3 (fair) |
| butter | #1 | butter ×3 |
| fly | #2 | fly ×3, face ×3 |
| butterfly | #0 | butterfly ×3, face ×3 |
| lady | #2 | lady ×3, face ×3 (the others were named "girl" or "mummy") |
| ladybird | #1 | ladybird ×3, face ×3 |
| jelly | #3 | jelly ×3 (#0 was named "castle") |
| jellyfish | #2 | jellyfish ×3, face ×3 |
| tooth | #2 | tooth ×3 |
| brush | #1 | brush ×3 |
| toothbrush | #0 | toothbrush ×3 |
| hedgehog | #3 | hedgehog ×3, face ×3 |
| seahorse | #2 | seahorse ×3, face ×3 |
| **bowrain** (the gag) | #0 | a cloud with bows ×3 |
| **coatrain** (the gag) | #0 | coats with a cloud ×3 |

- The gag pictures and the rain redraw are scenes (several things on white), which rembg cuts down to one thing (it left bowrain as a few ribbon ends), so `post.py` cuts scenes by a flood fill of the white page from the border instead.
- **The rain redraw** (`docs/read-slider/art/pic_rain.webp`; the raw is beside it): today's `pic_rain` is a cloud with two drops and the picture audit names it "cloud". Rain is the first part the child ever hears on the slider, so the redraw (rain pouring from a small cloud into a puddle) is named "rain" 3 of 3. It replaces an existing file, so it is a fix request; the harness serves it over the old one (`playtest/read-slider/overlay/`) so the videos show it.
- **The sea redraw failed**: the model drew buckets, and one tile with "THE SEA" written on it. Sea is only in the reserve (seahorse), so it waits for a better prompt (fix request).
- `pic_hog` is a boar with no face (research §4.5); hedgehog is a whole picture of its own, so the reserve doesn't need it.

### 9.2 Word clips and slow words

- `public/a/w/<w>.mp3` for cupcake, raincoat, ball, football, treehouse, cowboy, pancake, butter, ladybird, lady, jellyfish, jelly, tooth, brush, toothbrush, hedgehog and seahorse (butterfly and fly existed): Sensei's voice (Erinome, en-GB, as `gen-audio.ts` `VOICES.sensei` since Jonas chose it on 27 Sep; the brief said Sulafat, which is the voice that was replaced), made exactly as gen-audio's word path makes a word (`playtest/read-slider/audio/words.ts`, because gen-audio only makes words in its content lists and `ORAL_WORDS` is an existing file). Every clip: the judge 10/10, Gemini's blind word right, −15.9 to −19.1 LUFS (short clips sit lower, as gen-audio levels them). Report: `playtest/read-slider/audio/words.json`.
- `public/a/x/<w>.mp3` slow words for the same words, made with `scripts/gen-slow-words.ts`'s own `compose()` and `finish()` (pure sounds from `public/a/p`, 250 ms apart), and their onsets in `compounds.ts` `NEW_SLOW_TIMES` until `ORAL_WORDS` has the words and gen-slow-words writes them into `SLOW_TIMES`.

### 9.3 Lines

The block in `LINES`, "// --- Picture reading v2 and the read slider (27 Sep)": 47 ids, 14 `rs_*` (the slider's) and 33 `pr_*` (the script's). Recorded with `gen-audio.ts lines --only` (Sensei, plain text), and QA'd with `playtest/voice/qa.py` (Whisper word match, letters, pace, loudness, lead-in tails) and `scripts/accent-judge.ts`. `docs/read-slider/teacher-script-10.md` §10.3 (TEACHER_SCRIPT's §10, to append) lists every clip with its numbers.

**Fix round 1 (27 Sep, afternoon).** The judge's calibrated accent run (r, flap and BATH, 21 votes; the first round had only checked BATH, on three clips) found four clips American: `rs_praise_1` (a rhotic "word" and a flapped "little", 0 %), `pr_what_treehouse` (flapped "little", 0 %), `pr_w4_done` (rhotic "words", 5 %) and `pr_demo` (57 %); and two corrections cold (`rs_back_2` 3.4/5, `rs_start_here` 3.1/5). Three texts changed: `pr_demo` now says the idea first ("Two little words can make one long word. I'll read this one slowly first. Watch my paw..."), and the corrections lead with "Let's" (`rs_back_2` "Let's try again from the tortoise. Ninjas always start on this side.", `rs_start_here` "Let's start on this side. Put your finger on the tortoise."). The four, the two and `pr_frame` (3.8/5, "a bit stern") were re-taken with `playtest/read-slider/audio/retake.ts`: gen-audio's finishing and gates, then the calibrated accent judge (every r, flap and BATH word British on ≥ 80 % of 21 votes) and a warmth listen (8 votes: ≥ 4.3 and at most one "told off" for the corrections and the frame). Every installed take passes (numbers in §10.3). They were taken on `gemini-3.8-flash-lite-tts` (the same Erinome voice), because the shared key's `gemini-3.8-flash-tts` quota of 10,000 requests a day ran out at 13:20; re-taking them on 3.8-flash when it resets is a fix request.

**Fix round 2 (28 Sep, on `gemini-3.8-flash-tts`).** The four stern backwards gags were reworded (PR16) and re-taken with `retake.ts`, which now also checks every take word for word with faster-whisper (`playtest/read-slider/audio/whisper.py`), listens 15 times for warmth on the corrections, the frame and the gags (≥ 4.3, at most one "told off"), and asks the accent judge about "your" too. At most 8 takes an id. Installed (old clips in `.trash/retakes-2026-09-28/`, word timings re-made): `pr_back_snowman` (accent 100 %, warmth 4.40, 0 of 15; its 3.3 s pause after "men!" cut to 0.7 s, 5.4 s), `pr_back_cupcake` (100 %, 4.80, 0), `pr_back_football` (100 %, 4.53, 1) and `pr_back_pancake` (100 %, 5.00, 0; 6.3 s with a 1.2 s beat after "cake!"). Still failing after 8 takes, their old clips kept, for Jonas's ear on the [listening page]((private R2 link: see the local .r2-prefix)): `rs_back_1` (warmth 2.5–3.3, 6–11 of 15 "told off": the words are the problem, and a "Let's" reword as PR13 is the likely fix), `pr_frame` (3.5–4.2) and `pr_what_football` (7 of 8 too fast; the one at 3.23 words a second had a British "your" but warmth 3.63).

---

## 10. Decisions (made without asking; for docs/DECISIONS.md at integration)

| # | Decision | Why |
|---|---|---|
| PR1 | **Retire the fish-dog, the dog-fish, the swap and the which-rows game** in W2 and W4, with W4's cat–dog–fish. | Mentava's readiness check and its pairs (research §2); Jonas: "I don't want it to come across as stealing from Mentava." |
| PR2 | **Real compound words whose reverse is silly**: rainbow (Sensei), snowman and cupcake (the child); raincoat, football and treehouse at W4. | Jonas's own example, and DISTAR's and Sounds~Write's ground (research §3). |
| PR3 | **One pictured reversal per session, always Sensei's**: bow rain at W2, coat rain at W4. | The picture makes order matter; the show, not the child's mistake, is where it belongs. |
| PR4 | **The first frame is one sentence** ("Ninjas always read this way.") and the game's name comes at the recap. | The first run to the child's rabbit tap was 11.64 s (measured); with "This is Ninja Reading." it was about 13.7 s. Since PR11 it measures 14.4 s from the lesson's ▶ (§3.2), and PR15 proposes running the frame silently when W2 follows Reward 1. |
| PR5 | **The backwards show stays as it is.** It measures 13.8 s from the rabbit tap to the Ready (fix round 1's "12.8 s" was wrong), and PR15 brings ▶ in on "We" rather than cutting the show. | It moves the whole time, and it is the one thing that shows why order matters. |
| PR6 | **The shiny sticker is the rainbow; `fishdog` in a save becomes it.** | The same place and count in the book; `firstW2` keeps working. |
| PR7 | **Word Squish folds into Ninja Reading.** `tv_squish_ready` stays as the Ready; `tv_squish_frame`, `_slow`, `_fast`, `fm_starfish_q` and `fm_starfish` retire. | Squish was the same idea (little words make a long word) with the tortoise and rabbit as buttons; the slider does it with one gesture. |
| PR8 | **W6 becomes the Sound Slider**; W2 has a ◇ Sensei-only sound bridge (not optional in Reception). | Jonas's "say the sounds with me"; W2's budget; Reception never plays W6. |
| PR9 | **The Pocket Hunt grid swaps fish and dog for cake and bow.** | No fish next to a dog anywhere (inventory §1). |
| PR10 | **Erinome, not Sulafat**, for the new clips. | Sensei's voice since Jonas chose it on 27 Sep (gen-audio's `VOICES`); the brief's "Sulafat" predates that. |
| PR11 | **The idea comes first, in the demo's own line**: "Two little words can make one long word." opens `pr_demo` (it replaced "Let's say I want to read this long word."), and `tv_squish_ready` says it again at the hand-over. | Jonas: "we can also read longer words made from shorter words"; the judge: it came only at the Ready, after the gag. The line is 1.6 s longer, so the first run grows (§3.2). |
| PR12 | **Praise only for the child's own fast word** (`onDone`'s `how === "tap"`). | After the 12 s timeout Sensei has said the word herself; "You read each little word…" would be untrue (the judge). |
| PR13 | **The corrections lead with "Let's"** (`rs_back_2`, `rs_start_here`). | The rule first ("Ninjas always start on this side.") was heard as stern: 3.1–3.4/5, and 3 of 8 said a child would feel told off. The re-worded, re-taken clips score 4.75–4.88 with none. |
| PR14 | **Seven clips on `gemini-3.8-flash-lite-tts`** until the 3.8-flash quota resets. | The fixes couldn't wait a day; the same voice, the same gates, and the judge's accent and warmth gates on top. |
| PR15 | **Proposed: no watching run over 12 s, with the demos untouched** (§3.2). No spoken `pr_frame` when W2 follows `tv_rw_next`; the first line under the rail's arrival; the paw presses as she finishes; the demo's rabbit wakes at 0.3 s; the Ready's ▶ on "We"; and three gaps of 0.25–0.35 s. 14.4 → about 11.4 s, and 13.8 → about 11.0 s. | The judge (27 Sep) measured 14.2 s and 13.96 s, all watching; the re-run gives 14.4 s and 13.8 s. Jonas asked for slow, explicit demos, so the time comes from around them. |
| PR16 | **The said-only reversals paint their silly picture, like "Bow rain! It's raining bows!"**: "Man snow! It's snowing tiny men!", "Cake cup! A cup made of cake!", "Ball foot! A ball with toes!", "Cake pan! A frying pan made of cake!", each then "We always start on this side." (28 Sep; treehouse, cowboy and sunflower still say "That's silly."). | "That's silly." was heard as scolding (warmth 1.3–4.0 on 3 votes for the four). The picture is the joke, it keeps the child laughing with Sensei rather than being told the order is wrong, and "We" stays the cue. The re-takes score 4.40–5.00 with at most one "told off" in 15. |
