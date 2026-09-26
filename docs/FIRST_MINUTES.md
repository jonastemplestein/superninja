# The first five minutes

> **Amendment (Jonas, 26 Sep 2026): "have the same let me show you, now you try mechanism in the warm ups".** Every warm-up game type opens with **"Let me show you!"**: Sensei and the ninja demonstrate one item, with the paw tapping and the ninja moving, and nothing for the child to do. Then comes **"Now you try!"**, where the child does it. This applies to Ninja Ears (naming and picking), fast and slow, "tap all that start with /s/", "Ninjas read this way" and "Which did I read?". The demo item counts towards the time budget (keep it to about 5 s). Keep it light: two phases in the warm-ups; the full I do / we do / you do comes back from IC Unit 1. New lines to record: `fm_show_me` "Let me show you!" and `fm_you_try` "Now you try!". Alternates for variety: `fm_show_me_2` "Watch me first!" and `fm_you_try_2` "Your turn!".


**Status:** the spec for implementation, written 26 September 2026 in answer to Jonas's Round 13 feedback (docs/FEEDBACK.md). It merges three competing drafts (a preschool designer, a teacher and a UX designer), scored in section 1.

**What it replaces:**
- PEDAGOGY.md stop 0 (Ninja Training's picture rounds) and stop 1 (Listening Ears, w1-1)
- Placement's seed/star question
- the three-star reward after the first games

Everything else in PEDAGOGY.md and SOUNDS_WRITE_MODEL.md still stands. The new lessons are the "short, clearly labelled warm-up" of Decision 3: game-only activities before Initial Code Unit 1.

**Who it is for:** a 3-year-old playing alone on a landscape phone. Every rule below is tested against that child first. The school paths share the same shape.

---

## 0. What the preview does today

Played on next.superninja.templestein.com at 844×390 (headless Chromium, and the three drafts' own runs):

- **The first game is too long and the same all the way through.**
  - w1-1 is 14 two-picture items with one mechanic.
  - A bot answering 1.2 s after each prompt needs 176–207 s, so a real 3-year-old needs 4 minutes or more.
  - It opens with minimal pairs (pan/pin, top/tap, cat/cot), which are too hard at 3.
  - w1-2 then uses the same board for about 170 s more.
- **Speech is spliced.** "Tap the…" + [mat], "This is a…" + [dog] and "[sun] …starts with… [/s/]" are two or three clips each; 50 of w1-1's 106 clips are splices.
- **Nothing lights up when Sensei names a card.**
- **The pictures are hard to recognise or look cut off.**
  - `PIC_STYLE` says "NO face and NO eyes (unless it is an animal or person)". The image model obeyed the first half for living things too:
    - the dog is a faceless brown blob;
    - the pig and the man are seen from behind;
    - the fish, duck, frog, fox, hen, snail and the "sit" child have no faces.
  - The mat is a coiled rope and the hat a blue fedora-wizard hybrid. Top is a spinning top, pin a drawing pin, and nut looks like a brain. The leg and feet end in a cut, and moth is a brown blob.
  - 162 of the 164 picture files are trimmed to 6 px around the object. The card then fits them into 84% of its width, so tall and wide objects press against the inner edge.
  - When one card is right, the others go 42% see-through over the background. That, plus the faceless crops, reads as "weirdly clipped".
  - Every card is the same cream-white (#fffdf6).
- **The reward is three stars.** Listening games never record a word, so the Word Book stays empty ("0 / 411 words" and a wall of silhouettes).
- **A new child gets no say in their level.** The seed/star question assumes they can judge "Do you know some sounds already?"

---

## 1. How the three drafts scored

Each draft is scored 1–5 against Jonas's Round 13 asks, Sounds~Write (PEDAGOGY.md, and teacher-language.md's "never used" list), a 3-year-old's attention span, delight, and how easy it is to build.

| | Round 13 coverage | Sounds~Write | 3-year-old | Delight | Buildable | Total |
|---|---|---|---|---|---|---|
| **A** (preschool) | 4 | 4 | 5 | 5 | 4 | **22** |
| **B** (teacher) | 4 | 5 | 4 | 3 | 5 | **21** |
| **C** (UX) | 5 | 4 | 4 | 4 | 5 | **22** |

**Taken from A:**
- the best diagnosis of the cards (the 6 px trim, the 84% fit, see-through dimming) and fitting pictures by visible area
- per-picture card colours that stay the same on the sticker
- lesson beads with the sticker as the last bead
- no "Watch me / together / your turn" announcements
- last-tap-wins in the opt-in, and a "Not sure?" choice
- the September moving-up moment
- the sound ribbon and sound dots
- die-cut stickers, the Sticker Book's arrival, and the shiny fish-dog sticker
- the ninja throwing its star to make a starfish
- the 3-year-old rule and the "picture parade"

**Taken from B:**
- the most Sounds~Write-exact wording, including the official "the sounds that make up the word"
- the elastic card
- bullet-time slow words for the ninja
- the praise economy: the ninja's move is the praise
- lists recorded as one clip, with Whisper timings to drive animations
- term-aware start points
- picture stickers that later upgrade to gold word stickers
- the "they all start with /s/" sticker moment
- the card gutter design and a silhouette test for pictures
- the acceptance tests

**Taken from C:**
- teddy versus school, and the child growing taller at each class door
- silence defaults in the opt-in
- starting half a term behind the class
- a spotlight for naming that looks different from the gold hint
- the rabbit and tortoise: the child *does* fast and slow
- saving middle sounds (/a/ in it) for later, with the research behind it
- the audio matching rules (loudness, fades, room tone) and the "one take or joined?" judge
- the time governor, and idle and early-tap handling
- the first petal glowing through the mist

**What each draft got wrong:**
- **A:**
  - no default when a child stays silent in the opt-in;
  - a map hop between the lessons, which adds a step;
  - two compound words plus two "which did I read" items make Lesson 2 run long;
  - a gold ring for naming, which clashes with the gold hint glow.
- **B:**
  - one long clip for the school question can't spotlight each card cleanly;
  - "Tap the fast way!" is unclear;
  - a 110 s cap is too long for a 3-year-old;
  - little visual delight.
- **C:**
  - category colours give weak contrast (an orange sausage on a peach food card);
  - foot + ball needs a body-part picture, the kind that already looks cut off;
  - both rewards run long.

### Conflicts and how they are resolved

| Topic | A | B | C | Decision |
|---|---|---|---|---|
| Where the opt-in goes | after training | after training | after Choose, before a short welcome | **After Choose.** It continues Sensei's "Now, choose your ninja!" in the same dojo, and the settings apply before any teaching. |
| Committing a choice | last tap wins after 1.5 s | first tap counts | one tap commits, back arrow | **Last tap wins after 1.5 s of quiet**, as Choose Your Ninja already does, with a filling ring to show it settling. "Not sure?" is the way back. |
| Silence | no default; "ask a grown-up" | falls back to the not-yet track | picks a default after 16 s and says so | **The game picks after 20 s and says so:** listening games on screen A, Reception on screen B. The first check (§10) catches a wrong guess. |
| Start points | fixed per class | at or just behind the class | half a term behind | **Half a term behind, by the date on the device.** A child should start where they are secure. |
| First-sound or middle-sound game first | /s/ first; /a/ in Lesson 3 | /s/ in both lessons | /s/ first; /a/ later (research) | **/s/ at the start of words in Lessons 1 and 2.** "/a/ in it" comes in warm-up W3 and in Reception's Lesson 2. Initial sounds are far easier at 3 (Puolakanaho 2003; Byrne & Fielding-Barnsley 1995), and Jonas said "…/a/ in it, **or** start with /s/". |
| Explaining fast and slow | ribbon, then "say it with me" | elastic card and dots | rabbit and tortoise buttons | **All three.** Sensei shows it (the elastic card, the ribbon and the dots), then the child makes it happen with the tortoise and rabbit while saying it aloud. Lesson 2 uses the same two buttons to make compound words. |
| Colour of the naming highlight | gold ring | gold ring | warm-white ring | **Warm white.** Gold stays the "this is the answer" hint. |
| Card colour | per picture, by contrast | per picture, by hue distance | per category | **Per picture, by hue distance**, precomputed. |
| Between the lessons | map hop | straight on with an arrow | straight on with an arrow | **Straight on with one big arrow.** The map appears after Reward 2. |
| Lesson 2 compound word | cupcake + starfish | sunflower + cupcake | sunflower + football | **Sunflower (Sensei), then starfish (the child)**: no body-part pictures, and the ninja's star makes the starfish. |
| Rewards | 25 s + 15 s | 22 s + 20 s | 30 s + 25 s | **About 21 s + 26 s the first time.** Later rewards take 4–6 s. |

---

## 2. The five minutes at a glance

The clock starts when the child taps the title screen. The grown-up handover before that (the Get Ready page, and the profile with an optional name) is not counted. "Play as Ninja" should be the default, so the handover stays under 20 s.

**A child who is not at school yet:**

| Clock | Screen | Secs |
|---|---|---|
| 0:00 | Title: tap the big button | 3 |
| 0:03 | Intro film (Baron's lip-sync is done; the film can be skipped after the first viewing) | 45 |
| 0:48 | Choose your ninja | 6 |
| 0:54 | **Opt-in: "Do you go to big school yet?"** (§4) | 16 |
| 1:10 | Dojo welcome: the gong, then "Stuck? Tap me" (Training without its picture rounds) | 12 |
| 1:22 | **Lesson 1: Ninja Ears** (§5) | 85 |
| 2:47 | **Reward 1: the Sticker Book** (§6) | 21 |
| 3:08 | **Lesson 2: Ninjas Read This Way** (§7) | 60 |
| 4:08 | **Reward 2: shiny sticker, first petal, then the map** (§8) | 26 |
| 4:34 | Buffer for a slow child | 26 |

**A Year One child in September:** the opt-in takes 28 s, then the welcome (12 s), a 90 s cut of the Sky Temple dojo, Reward 1 (21 s), a 60 s sort and Reward 2 (20 s). That ends at about 4:45.

---

## 3. Rules for every beat of the first two lessons

1. **Voice and pictures only.** Sensei says everything, and a paw or hand shows every new action. Captions stay off.
2. **Every picture is named aloud when it appears.** Naming spotlights that card (§11).
3. **No mode announcements** ("Watch me first", "Let's do it together", "Now it's your turn"). Sensei's explanation is the "I do". The first tap is the "we do", and its answer glows after 2 s. The next tap is the "you do".
4. **Taps:**
   - A tap while a card is being named echoes its name and spotlights it; it doesn't wiggle.
   - A tap during the question counts as an answer.
5. **Idle:**
   - After 8 s with no tap, the answer glows and Sensei re-asks.
   - After 16 s, the paw taps it and play moves on. That counts as a "we do", not a miss.
6. **Mistakes are errorless:**
   - The wrong card wobbles for 400 ms (never red) and plays its own word, held or stretched. For example: "mmmoon… Moon starts with a different sound."
   - First miss: "Listen again." plus the prompt.
   - Second miss: the answer glows and Sensei says "It's this one!"
   - Nothing is re-queued in the warm-ups.
7. **Help** (bottom-right) and **Hear it again** (the speaker, bottom-centre):
   - Help, one press: repeats the prompt.
   - Help, two presses: the answer glows.
   - Help, three presses: the paw shows it.
   - The speaker replays the prompt.
8. **Praise economy:**
   - The ninja's move is the praise.
   - Sensei says a praise line after at most every third right answer, and never over a streak beat.
   - The streak carries from Lesson 1 into Lesson 2, so a child on a run sees the ninja power up.
9. **Lesson beads replace the thin progress bar:** one big bead per child activity, top-centre, and a sticker as the last bead. The reward is in sight from the first second.
10. **The time governor.** Every lesson has a target and a hard cap.
    - Beats marked ◇ are optional. At the start of an optional beat, if the lesson is more than 5 s behind its target clock, the beat is skipped.
    - At the hard cap, the current beat is finished by the paw ("Here's the last one!"), then the lesson closes.
11. **No star grades in the warm-ups.** The reward is stickers. Stars are still saved behind the scenes so the map unlocks.
12. **Layout** (stage px, 1280×720; docs/HERO.md):
    - The ninja zone is x 0–330 at the bottom and the Help zone is bottom-right.
    - The play area is x 340–1110, y 80–560, and the speaker sits at bottom-centre.
    - Nothing tappable goes in the ninja or Help zones.

---

## 4. The opt-in (a new `OptIn` scene)

The opt-in is shown only to a brand-new profile: no `seenPlacement`, no `placedAt` and no stars. It happens in the dojo, with the ninja bottom-left, Sensei's Help bottom-right and the grown-ups' gear top-right. The gear still needs a press-and-hold to open.

### Screen A: "Do you go to big school yet?"

- **Cards:** two 300 px cards in the play area.
  - **TEDDY** (`opt_teddy`, butter-yellow plate) means not yet.
  - **SCHOOL** (`opt_school`, sky plate) means yes. The child's own ninja sprite is composited small at the school gate.
- **What Sensei says:** `fm_opt_q1`, then `fm_opt_notyet` while the teddy is spotlit, then `fm_opt_yes` while the school is spotlit.
- **Silence:**
  - After 8 s: `fm_opt_q1_again`, and both cards bob.
  - After 20 s: the not-yet path, with `fm_opt_default_home` + `fm_opt_grownups`.

"Big school" is how British families talk about primary school to under-5s, so a nursery child doesn't answer "yes" because they go to nursery.

### Screen B: "Which class are you in?" (only after SCHOOL)

- **Doors:** three class doors in a corridor.
  - Each is `class_door`, tinted sunny yellow, leaf green and sky blue.
  - In front of each stands the child's ninja in a school jumper (`hero_<kai|suki>_school`), shown at 80%, 90% and 100% height: the bigger you are, the higher the class.
  - The badges are UI in Andika, not art: a star for Reception, "1" for Year One and "2" for Year Two.
- **Not sure:** a "Not sure?" thought cloud (`item_think_cloud` with a "?" glyph) sits under the doors.
- **What Sensei says:** `fm_opt_q2`, then `fm_opt_rec`, `fm_opt_y1`, `fm_opt_y2` and `fm_opt_unsure`, each while its door or cloud is spotlit.
- **Silence:**
  - After 8 s: `fm_opt_q2_again`.
  - After 20 s: Reception, with `fm_opt_default_rec` + `fm_opt_grownups`.

### Tap rules

- A tap counts from the moment the cards land, even during the question, and it interrupts Sensei.
- A tap plays that card's label again (`fm_opt_echo_notyet`, `fm_opt_echo_school`, or the door's own label).
- A gold settling ring fills round the tapped card over 1.5 s. The **last tap wins** once the ring is full.
- Help replays the question and its labels.

### Confirming

The chosen card shrinks into a badge that flies to the grown-ups' gear. The gear then glows and wiggles while Sensei says the confirm line followed by `fm_opt_grownups`:

| Choice | Confirm line |
|---|---|
| Not yet | `fm_opt_ok_notyet` "Then I've set up some listening games, just for you!" |
| Not sure | `fm_opt_ok_unsure` "That's fine! I've set up some listening games for you, and we'll see how you get on." |
| Reception | `fm_opt_ok_rec` "I've set up the game for Reception, with sounds just like at school!" |
| Year One | `fm_opt_ok_y1` "I've set up the game for Year One, with new ways to spell the sounds you know!" |
| Year Two | `fm_opt_ok_y2` "I've set up the game for Year Two, with even more ways to spell the sounds you know!" |

### Timings

| | 0–6 s | 6–9.5 s | 9.5–16.5 s | 16.5–26 s |
|---|---|---|---|---|
| Not yet | question, both cards spotlit in turn | tap, echo, settle | confirm + grown-ups line; done by **~16 s** | — |
| At school | same | tap, echo, settle | doors swing in; question and labels | tap, echo, settle, confirm + grown-ups; done by **~28 s** |

### Where each answer starts

The start comes from the date on the device, half a term behind the official Sounds~Write pace: Reception IC1–7 in the autumn, IC8–11 in the spring and the Bridging Unit in the summer; Year One EC1–26; Year Two EC27–49.

| Answer | Sep–Dec | Jan–Mar | Apr–Aug | Until the Extended Code is built |
|---|---|---|---|---|
| Not yet / not sure / silent on A | warm-up W1 | W1 | W1 | — |
| Reception | W1 + W2 (Reception versions, §9), then w1-2 | IC5: `placeAtUnit(4)` | IC9: `placeAtUnit(8)` | — |
| Year One | EC1 | EC9 | EC18 | `placeAtUnit(11)`: Sky Temple w6-1 |
| Year Two | EC27 | EC34 | EC42 | `placeAtUnit(12)`: w6-1, with the gems it covers half-filled |

`placeAtUnit` keeps every earlier level open and never deletes progress.

**What is saved:**
- `schoolYear`: "none", "unsure", "R", "Y1", "Y2" or "unset" for older saves
- `schoolYearAt` (a date) and `band`
- `seenPlacement = true`

### Returning children

- They are never asked. They get "Welcome back" and their next stone.
- **Moving up:** on the first launch on or after 1 September, a child with a school year set gets a 10 s moment.
  - Sensei says `fm_newyear_q`, then shows screen B (its "Not sure?" keeps the old year).
  - A new year gets `fm_newyear_up` and a shiny "moving-up" sticker.
  - The year is updated, but **progress never moves by itself**. The grown-ups' settings show any gap between school and game and offer "Start from here".

### Grown-ups' settings (Grownups.tsx)

- A **School year** row: Not at school yet / Reception / Year One / Year Two / Not set.
  - Changing it only records the year.
  - A separate press-and-hold **"Start from here"** calls `placeAtUnit` for that year and term. The furthest point stays whichever is later: the child's progress or the new start.
- **"Check the starting point"** opens today's Show Sensei quiz (Placement's play phase).
- A short log of automatic moves, for example "Started at Year One; moved to Reception after the first check (26 Sep)".

---

## 5. Lesson 1: Ninja Ears (warm-up W1, kind `ears`)

**Target 85 s** for a real 3-year-old; a bot answering after 1.2 s needs 80 s or less. **Hard cap 100 s.**
- **Cards:** sun, sock, cat, then sausage and moon. Every one is a word a 3-year-old uses weekly, and each is drawn clearly.
- **Taps:** seven child decisions, with the mechanic changing every one or two taps.
- **Ideas taught:**
  - Words can be said fast or slow, and it is the same word.
  - Saying a word slowly lets you hear the sounds that make up the word.
  - Words are made of sounds.
  - Notice the first sound.
  - Find every picture that starts with /s/.

In the table, `[x w]` is the stretched word ("sssuuunnn"), `[o w]` is the held first sound ("sssun"), `[/s/]` is the pure sound and `[w]` is the plain word clip.

| # | Secs | Screen and taps | Sensei | Ninja |
|---|---|---|---|---|
| 1 | 3 | Sun, sock and cat drop in (220 px, one row). The beads appear. | `fm_l1_hello` "Ninja ears on! Let's listen to some words." | bows, then cups its ear (new "listen" pose) |
| 2 | 6 | **Meet the cards.** Each card is spotlit for its own clip. | `fm_name_sun` "This is the sun." · `fm_name_sock` "This is a sock." · `fm_name_cat` "This is a cat." | turns its head to each card |
| 3 | 4 | **The first tap.** The sock's answer glows after 2 s. | `fm_tap_sock` "Tap the sock!" | a **kick** at the sock's corner, and a star stamp |
| 4 | 14 | **Fast and slow (Sensei shows).** Sock and cat slide back and shrink. Sun moves to the centre at 300 px, with a glowing **sound ribbon** under it and the tortoise and rabbit buttons (120 px) either side.<br>• Fast: the card hops, the ribbon zips across in 0.3 s and the rabbit button flashes.<br>• Slow: the card stretches like elastic, the ribbon draws left to right in time with the clip, three **sound dots** pop onto it as each sound begins, and the tortoise button flashes. It snaps back after. | `fm_fast_sun` "I can say a word fast. Sun!" · `fm_slow` "Or I can say it slowly..." [x sun] · `fm_same_word` "Fast or slow, it's the same word. Sun!" · `fm_hear_sounds` "When I say a word slowly, I can hear the sounds that make up the word. Words are made of sounds!" (the dots pulse in turn) | fast: a lightning dash out and back · slow: a slow-motion kata with afterimages, timed to the stretch · on "made of sounds": a small ki pulse at the dots |
| 5 | 10 | **Your turn.** The tortoise pulses. A tap plays [x sun] with the stretch; the child says it along. Then the rabbit pulses, and a tap plays [sun] with the hop. More taps replay it until the beat ends, 1 s after the second tap. | `fm_tap_tortoise` "Your turn! Tap the tortoise, and say it slowly with me." · ◇ `fm_tap_rabbit` "Now tap the rabbit, and say it fast!" | tortoise: slow kata · rabbit: dash |
| 6 | 15 | **Slow words.** The buttons tuck away and sun, sock and cat return to the row. Cat is the first item; its answer glows after 2 s. The sock item is ◇ and has no glow. A right answer plays [x w], a 350 ms gap, then [w]. | `fm_slow_listen` "Listen to my slow word..." [x cat] `fm_which_pic` "Which picture is it?" → "caaat… cat!" · ◇ `fm_slow_another` "Here's another slow word..." [x sock] → "sssooock… sock!" | cat: a gift in **bullet time** (0.35× under the stretched word, snapping to full speed on the word) · sock: a bullet-time strike at the corner |
| 7 | 11 | **Notice the first sound.** Sun and sock slide side by side at 260 px, each with its three dots. On the held sound, **each first dot swells to the same gold**. Then there is a 1.5 s pause for the child to say /s/. | `fm_first_listen` "Listen to the very first sound." [o sun] [o sock] · `fm_notice_sun_sock` "Did you notice? Sun and sock start with the same sound..." [/s/] · `t_everyone_say` "Say that sound with me!" [/s/] | cups its ear, then taps the gold dots with a ki pulse |
| 8 | 17 | **Tap all that start with /s/.** A 2×2 grid of 210 px cards: sock, sausage, moon and cat. Two empty gold **pockets** sit to the right of the grid and show how many to find. The new cards are spotlit as they are named. Each find plays [o w] and a mini-card flies into a pocket. Two misses make the targets left glow, with `fm_look_this` [/s/]. | `fm_name_sausage` "This is a sausage." · `fm_name_moon` "This is the moon." · `fm_tap_all_start` "Tap all the pictures that start with..." [/s/] · wrong: [o moon] `fm_diff_moon` / [cat] `fm_diff_cat` · done: `fm_found_both` "You found them both! They both start with..." [/s/] | each find: a shuriken pins a star on the card's corner · both found: its tier's biggest move, and a spell burst over both |
| 9 | 3 | Every bead lit; the sticker bead bursts. | `fm_l1_done` "You can hear the sounds in words. Brilliant listening!" | celebrates |

That comes to 83 s. The child makes seven decisions: sock, tortoise, rabbit ◇, cat, sock ◇, and two finds; they also say /s/ aloud once.
- If the lesson is behind, the governor drops the rabbit and the second slow word, saving about 12 s.
- The stretched words are never segmented. Sensei stretches, and the dots only show that the sounds are there.

---

## 6. Reward 1: the Sticker Book (first time 21 s; later 4–6 s)

The book is called the **Sticker Book** whenever it is spoken or shown to children. In code it stays `Book`, and the grown-ups area can say "Sticker Book (the words your child has met)".

| t (s) | What happens | Sensei | Ninja |
|---|---|---|---|
| 0–2 | The last move lands, then a gong and petal confetti. The five cards met rise into a fan and **flip into glossy die-cut stickers**: the same plate colour as the card, a thin cream die-cut edge (4 px), a gloss sweep, the picture only and no spelling. | `fm_rw_look` "Look! Your pictures are turning into stickers!" | celebrates, hops, points |
| 2–4.5 | A chunky red leather **Sticker Book** with a gold shuriken clasp (`item_sticker_book`) swoops in on petals, thumps, bounces, pops its clasp and opens. | `fm_rw_book` "This is your Sticker Book!" | gasps, then a fist pump |
| 4.5–9 | Each sticker flies in, peels and presses onto the page with a tape sparkle, landing on its own word in one clip (Whisper word timings). | `fm_rw1_list` "Sun, sock, cat, sausage and moon!" | an air punch or a hop on each landing, alternating |
| 9–12 | The page glows, and a big **5** badge with a sticker icon thunks into the corner. | `fm_rw_every` "Every picture you play with becomes a sticker!" | — |
| 12–17 | The sun sticker wiggles and a hand points at it. A tapped sticker pops, spins and says itself fast, then slow ([w] then [x w], or just [w] if there is no stretched clip). With no tap, this is skipped after 4 s. | `fm_rw_tap` "Tap a sticker!" | cheers at each tap |
| 17–21 | The book closes and tucks into the ninja's pack. A big green arrow bounces in the play area with a pointing hand. It bounces harder after 10 s, and Sensei repeats once. | `fm_rw_next` "Ready for the next game? Tap the big arrow!" | pats the pack |

**Every later reward** (from Lesson 2 of the second session on) skips the open book. The new stickers peel off the cards, fly into the Sticker Book icon in the corner and show "+N", with `fm_rw_more` "More stickers for your Sticker Book!". It takes 4–6 s.

### How stickers work

- **Picture sticker:** earned for any card that was named in a lesson and then tapped or found. It is also earned for a card shown in a reward, such as the merged fish-dog. It has no spelling, and tapping it says the word.
- **Word sticker:** the same sticker gains a gold edge and its written word shimmers in once the child reads or spells the word (`words[w].ok > 0`). It is a second reward from the same card. Tapping it says the sounds and reads the word (`sayBlend`), as today.
- **Shiny sticker:** a holographic rainbow sweep. There is at most one per lesson, saved for its best moment (the fish-dog in Reward 2).
- **Order:** stickers fill pages in the **order they were collected** (`stickers: string[]`), six per side.
  - The page after the last sticker shows three dashed "mystery" outlines, the next pictures on the child's path.
  - There are no walls of silhouettes, and the counter is a big number with a sticker icon, not "N / 411 words".
- **Oral-only words** (sausage, moon, flower, sunflower, star, starfish, fish-dog) are stickers too. The registry is WORDS plus ORAL_WORDS plus shiny extras.

---

## 7. Lesson 2: Ninjas Read This Way (warm-up W2, kind `picread`)

**Target 60 s; hard cap 75 s.** This lesson has a different rhythm from Lesson 1: tapping in order along a line, silly mash-ups and a magic trick, where Lesson 1 was calm listening. It is Round 12's picture-reading warm-up joined to Lesson 1's fast and slow:
- one picture at a time is slow, and together is fast, which is the first taste of blending;
- the ninja running along the rail is the Sounds~Write finger sweep.

A bamboo **reading rail** crosses the play area just right of the ninja (x 360–1090, rail line at y 520). A brush-stroke arrow at its left end points right. The tortoise and rabbit buttons from Lesson 1 sit under the rail's right end.

| # | Secs | Screen and taps | Sensei | Ninja |
|---|---|---|---|---|
| 1 | 3 | The rail slides in and the arrow glows. | `fm_l2_way` "Ninjas read this way!" | **runs along the rail from left to right** with a speed trail (the reading finger), then back to its spot |
| 2 | 7 | **Sensei reads (I do).** Fish on the left and dog on the right, 240 px, on the rail. Each is spotlit as it is named. Then a light passes under each card on its word, and the two bump and **merge into a fish-dog**. | `fm_name_fish` "This is a fish." · `fm_name_dog` "This is a dog." · `fm_read_fish_dog` "Fish... dog. Fish dog!" | runs along with the light, pausing under each card · a gift on the merge |
| 3 | 7 | **Your turn.** The fish-dog splits back into fish and dog, and the fish pulses. Each tap plays its word, then they merge again. If the dog comes first, it wiggles and the arrow pulses from the left. | `fm_l2_turn` "Your turn! Tap them the ninja way." → [fish] [dog] → `fm_pair_fish_dog` "Fish dog!" · wrong order: `fm_l2_start` "Start here, on this side!" | a hop under each tapped card · a gift on the merge |
| 4 | 5 | **The swap (I do).** The ninja leapfrogs the cards and they swap places, then merge into a **dog-fish**: a puppy with goldfish fins. | `fm_l2_swap` "Whoops! Now they're the other way round. Dog... fish. Dog fish!" | a leapfrog flip over the rail |
| 5 | 7 | **Which did I read?** Two short stacked rails, [cat][dog] and [dog][cat], at 160 px. The child taps a whole rail. When right, the rail's light sweeps left to right and it glows. | `fm_which_cat_dog` "Listen. Cat... dog. Which one did I read?" → `fm_pair_cat_dog` "Cat dog!" | a crown of stars round the rail |
| 6 | 8 | **Picture words (I do).** Sun and flower on the rail. The paw taps the tortoise ("sun… flower", each card lighting in turn), then the rabbit: the cards zip together and **bloom into a sunflower**. | `fm_l2_big_word` "Two little words can make one big word!" · `fm_name_flower` "This is a flower." · `fm_sunflower` "Say them slowly: sun... flower. Say them fast: sunflower!" | casts a spell orb that pulls the two cards into one |
| 7 | 9 | **Picture words (you do).** Star and fish on the rail. After the line there is a 1.5 s pause for the child to say it, then the rabbit pulses. The child's tap throws **the ninja's golden star onto the fish**, which turns into a waving starfish. | `fm_name_star` "This is a star." · `fm_starfish_q` "Star... fish. Tap the rabbit to say them fast!" → `fm_starfish` "Starfish!" | throws its star, which lands as a crown of stars on the starfish |
| 8 ◇ | 10 | **Quick: tap all /s/.** A 2×2 grid: sunflower, sock, fish and dog (all known, so no naming), with two pockets. | `fm_quick_tap_all` "Quick! Tap all the pictures that start with..." [/s/] · finds: [o sunflower], [o sock] · wrong: [o fish] `fm_diff_fish` / [dog] `fm_diff_dog` · done: `fm_found_both` [/s/] | shurikens, then its biggest move |
| 9 | 3 | Every bead lit. | `fm_l2_done` "You read the pictures, just like a real reader!" | a bow, then a power pose |

That comes to 59 s, with six decisions (four with ◇ dropped).
- In beat 3, the child's order is the answer: nothing is judged except left before right.
- The governor drops beat 8 if the lesson is more than 5 s behind.

---

## 8. Reward 2: shiny sticker, first petal, map (26 s the first time)

| t (s) | What happens | Sensei | Ninja |
|---|---|---|---|
| 0–2 | Gong and confetti. | — | power-up |
| 2–7 | The Sticker Book pops open at once. Six new stickers fly in as a rising musical run, 0.35 s each, on the word timings. The counter flips from 5 to 11. | `fm_rw2_list` "Fish, dog, flower, sunflower, star and starfish!" | a hop per landing |
| 7–10 | A drumroll, then a **shiny holographic fish-dog** sticker with a rainbow sweep lands in the centre. The counter reaches 12. | `fm_rw_shiny` "Ooh, a shiny sticker! Fish dog!" | laughs (cheer pose, wobbling) |
| 10–15 | The /s/ stickers (sun, sock, sausage, sunflower) hop in turn, each first dot glowing gold. | `fm_rw2_s` "Sun, sock, sausage and sunflower. They all start with..." [/s/] | taps each with a ki pulse |
| 15–20 | A small World Flower (`FlowerIcon`) rises over the book. The **/s/ petal glows through the mist**, from hidden to met, with a chime. **First time only.** | `fm_rw2_petal` "You found your very first sound! Look, its petal is shining through the mist." | powers up, facing the flower |
| 20–26 | The book shuts and flies into the map's Sticker Book button. The map fades in and the ninja hops from stone 1 to stone 3. Stone 3 bounces with the pointing hand. | `fm_rw2_map` "Your Sticker Book lives here, on the map!" then `map_hint` | the map hop |

---

## 9. The other starting points

They follow the same shape: a lesson of up to 90 s, the Sticker Book reward, a lesson of up to 60 s, and a reward. The first three "you do" items at a school start point are also **the check** (§10).

**Reception, autumn** (IC1; `band = "R"`). This is W1 and W2 with `spell: true`:
- **Lesson 1:**
  - Beats 1–4, 6–7 and 8 as above; beat 5 is ◇.
  - After each /s/ find in beat 8, three sound lines appear under the card. The ninja's spell writes < s > on the first line with `how_we_spell` "This is how we spell..." [/s/] (written in full the first time, then simply appearing).
  - Sausage and moon are picture-only words, so only their first line shows.
- **Lesson 2:**
  - Beats 1–7 as above.
  - Beat 8 becomes **"/a/ in it"**: `fm_tap_all_in` "Tap all the pictures with this sound in them..." [/a/]. The grid is cat, bag, sun and dog. Each find plays [x cat] or [x bag] (these clips exist). A wrong tap plays `fm_not_in_sun` or `fm_not_in_dog`.
  - Done: `fm_found_all` + `t_they_all_have` [/a/]. Then < a > is written on cat's middle line with `how_we_spell` [/a/].
- Then the child's path continues at **w1-2**, and W3–W6 are marked done.

**Reception, spring or summer, and Years One and Two:**
- **Lesson 1:** a **90 s cut** of the first dojo at the start point (`budgetMs` on the level; it ends at the next item boundary). The teacher language comes from teach.ts `introPetal` and `introGem`.
  - Year One, September: EC1, with /ae/ spelt < ai > and < ay >. Until EC1 exists, that is Sky Temple w6-1.
  - It ends with `fm_tap_all_words_in` "Tap all the words with this sound in them..." [/ae/], using written words with pictures (rain, tray and snail, against bed and fish).
- **Lesson 2:** a **60 s cut** of the next level (the ai/ay sort for Year One).
- **Rewards:** the same Sticker Book introduction, but these children earn **word stickers** (gold edge, spelling shown) for the words they read or spelt.

---

## 10. How the game adjusts

- **The check** (school paths): the first three "you do" items at the start point.
  - If 0 or 1 is right on the first try, the child **drops one band on the spot**: Year Two to Year One, Year One to Reception (IC1), Reception to the warm-ups.
  - Sensei says `fm_warm_up` "Let's do some warm-up training first!", and the new band's Lesson 1 starts.
  - The move is logged for grown-ups. This catches the 3-year-old who taps "Year Two".
- **Within a lesson:** these first two lessons are fixed scripts. From W3 on, choices go from 2 to 3 to 4 after two first-try answers in a row, and back to 2 after a miss.
- **Across the warm-ups** (last 10 "you do" answers):
  - Under 50% in two lessons: the next lesson repeats the previous warm-up with new pictures ("Let's practise that again!").
  - 90% or more across three warm-ups: W4 and W5 are skipped, with `fm_super_listener` "You're a super listener! Now let's find out how we write the sounds." W6 (the bridge) and then IC1 follow.
- **Upwards on school paths:** never automatic. The existing `jump_offer` still needs a grown-up's press-and-hold.

**The warm-up world** (Bamboo Village's first stones, before today's w1-2):

| Stone | Kind | Content |
|---|---|---|
| **W1** | `ears` | Ninja Ears (§5) |
| **W2** | `picread` | Ninjas Read This Way (§7) |
| **W3** | `ears` | fast/slow recap on mug; **"/a/ in it"** (cat, bag, jam, van against sun, dog); first sound /m/ (mug, moon, map) |
| **W4** | `picread` | three pictures in a row (cat dog fish / fish dog cat); which did I read; two more compound words (rainbow, snowman) |
| **W5** | `ears` | "I'll say the sounds, you listen for the word" (segmented oral blending with 2, then 3 choices); w1-1's minimal pairs, now with clear pictures only |
| **W6** | `picread` | sound dots under pictures, swept left to right exactly like the sound buttons under letters in IC Unit 1 |

After W6 comes w1-2, and **w1-1 is retired**.

---

## 11. Cards

### The look

- Keep what says "tap me": the 30 px radius, the 6 px ink border and the 8 px press shadow.
- Replace the white with a **painted plate**: a radial gradient of the picture's own swatch (12% lighter at the centre), 6% paper grain, and a warm-white halo behind the object (60% of the plate width, 35% opacity). Grounded objects get a soft oval contact shadow; floating things like the sun, moon, star and fish don't.
- **The swatches:** sky `#bfe6ff`, leaf `#cdeeb4`, coral `#ffc9b8`, lilac `#e3d4ff`, butter `#ffe9a6`, teal `#bdeee6`, peach `#ffd9b0`, rose `#ffd0e0`, plus **night** `#2f3b73` for the moon and stars.
- **Choosing the swatch:** each picture gets the swatch **furthest in hue** from its own dominant saturated colour; a tie goes to the swatch with better lightness contrast. The choice is precomputed, and `plate:` in the art manifest can override it.
- A picture keeps its colour everywhere: card, sticker and reward.
- docs/ART_STYLE.md's "Word picture cards" section changes to match: coloured plates, and living things with faces.

### Sizes (stage px; never below 160)

| Layout | Size |
|---|---|
| 2 in a row | 290 |
| 3 in a row | 220, 40 px gaps |
| 2×2 grid | 210 |
| rail pair | 240 |
| stacked rails | 160 |
| fast/slow centre card | 300 |
| opt-in cards | 300 |
| class doors | 220 × 280 |

### Never clipped

1. **Art:** `scripts/post-art.py` re-pads every picture to a square with a **14% transparent margin**. It also writes `src/content/pic-plates.gen.ts` with each picture's swatch, alpha bounding box, coverage and `grounded` flag.
2. **Fit:** the picture is drawn with `contain` in a safe box 78% × 74% of the plate, set 3% above centre. It is then scaled from `pic-plates.gen.ts` so its bounding box fills the safe box. If it covers less than 40% of the box, it grows until it does or until it reaches the box edge, so a wide mat is not a thin strip.
3. **Gutter:** each card element is the plate plus a **28 px gutter** on every side, and the gutter is part of the element's own box.
   - The lift (12 px or less), scale (1.08 or less), ring (10 px or less), bounce and star stamp all stay inside the gutter.
   - Nothing uses a negative offset; today's corner star sits at `-26px`.
4. **Overflow:** no element between the stage and the card row has `overflow: hidden`, `clip` or a `clip-path`. Rows keep their gutters at least 16 px inside the play area.
5. **Dimming** uses `saturate(.4)`, `scale(.9)` and a cream veil. It **never uses opacity**, so a card is never see-through.
6. **Treadmill invariant** (WebKit and Chromium at 844×390, 932×430 and 667×375). Every plate must be:
   - inside the play area;
   - clear of the other cards, the ninja zone, the Help zone and the speaker;
   - big enough to hold its picture's drawn bounding box.

### States: being named must never look like being the answer

| State | Look | When |
|---|---|---|
| **Spotlight** | lifts 12 px, scale 1.06, an 8 px **warm-white** ring and a light sweep; the other cards go to scale 0.96 with `saturate(.6) brightness(.9)`; a soft wood-block tick | from 150 ms before its name clip until 300 ms after. Inside a multi-card clip, from Whisper word timings |
| **Hint** | the existing gold ring that bobs | the answer, when help or idle calls for it |
| **Right** | green ring, tick and the existing bounce | a right answer |
| **Found** | stays with a green tick; a mini-card flies to its pocket | a tap-all find |
| **Wrong** | a 400 ms wobble, then back to normal; never red | a wrong tap |

### The 3-year-old rule (warm-ups, and every oral or picture-only game)

A picture passes when it:
1. is a word a British 3-year-old meets every week: family, food, toys, animals, clothes, home, vehicles, sky, bath time or the park;
2. is drawn **whole**, in its board-book view and usual colour, never from behind, never cropped, never a body part cut off at the edge;
3. shows **one thing**, with nothing in it the child might name instead;
4. shows animals and people **facing the viewer with two eyes and a smile**, while objects have no face;
5. passes the blind picture audit run as a **3-year-old persona**:
   - the exact word 4 times in 5 (a synonym, such as cup for mug, fails);
   - the right first sound 5 times in 5 for sound games (`picSaysFirst`);
   - and a new "has a face" check for living things;
6. still reads as a black silhouette at 120 px;
7. passes the family test: a hidden `?scene=picparade` shows every warm-up picture full screen with ✓/✗ buttons, so Jonas's son can name them and the answers are saved.

### Fixing the prompts at the source (`scripts/art-manifest.ts`)

Split `PIC_STYLE` into two prompts. `LIVING` moves from Early.tsx into `src/content/`, so the scene and the manifest share it.

- **PIC_OBJECT:** "Super Ninja picture-card style: exactly ONE single object, instantly recognisable to a British 3-year-old, drawn whole in its most typical view and usual colour, like a board-book picture, with chunky rounded simple shapes and few details, bold even dark-brown ink outlines, rich cel-shaded colour with one soft shade tone, one highlight and a subtle painterly grain, lit from the top-left. The object has no face. Nothing else in the picture. No flags, no text, no letters, no numbers, no scenery, no ground, no shadow. Centred on a plain flat pure white background with a wide empty margin on every side; nothing touches the edge."
- **PIC_LIVING:** the same, but "exactly ONE single animal or person … drawn whole from head to toe (or tail), facing the viewer or in three-quarter front view, never from behind, with a friendly face, two big clear eyes and a smile". It never mentions "no face".

### Pictures kept out of picture-only early games

- **Unknown to 3-year-olds:** top, pin, tin, zip, lid, match, moth, cot, peg, dot, jet, fog, tub, tie and nut.
- **Named as something else:** hen (chicken), nap (cat), fin (shark), wig (hair), hot (soup), hop, sea (wave), hill (jelly), and everything else in `PIC_NAMES`.
- **Look cut off:** leg and feet.
- **Until redrawn:** sit, mat and hat.

They stay as written words wherever the word is shown. In picture-only games "sand" is said as "sandcastle".

The art jobs are in Appendix B.

---

## 12. Audio

### Rules

1. **Any line that contains a word is one whole recording** with the word inside it: "This is a sock.", "Tap the sock!", "Moon starts with a different sound." There is never an article joined to a word ("This is a" + [dog]), never "Tap the" + [mat], and never "[word] starts with [sound]".
2. **Only pure sounds, stretched words and held-first-sound words are spliced**, because TTS can't say them inside a sentence. They go in only:
   - after a lead-in recorded to end suspended on "..." (its pitch falls no more than 2 semitones over the last 300 ms), with 350–450 ms before the clip and at least 250 ms after it;
   - or alone, between two complete sentences.

   A sound never starts a sentence that then carries on in words.
3. **Lists are one clip** ("Sun, sock, cat, sausage and moon!"), and so is any line that names several cards. `gen-audio.ts` saves Whisper word timings next to them as `public/a/l/<id>.words.json`. Spotlights, sticker landings and rail lights follow those timings.
4. **Matching:**
   - one voice with one set of settings;
   - speech at −18 LUFS ±1 LU, pitch 170–290 Hz;
   - 25 ms fades at every join, and room tone in every gap.
5. **Checks:**
   - Every line gets the usual blind transcription.
   - Every held or stretched clip gets the pure-sound check, which rejects any "uh".
   - A new treadmill stage renders each *assembled* sequence from the bot's audio log and asks the audio judge "one take, or joined?". An audible join fails.
6. **Sounds~Write:**
   - no letter names;
   - spellings "spell" sounds and never "say" or "make" them;
   - Sensei stretches but never segments a word the child is spelling;
   - no "blend" as a noun, no "sound it out", no "long/short sounds".

### New clip kinds

- **Held first sound**, `public/a/o/<w>.mp3`, made by `gen-stretch.ts` in an onset mode: sssun, sssock, sssausage, sssunflower, mmmoon and fffish. A stop consonant (cat, dog) gets the plain word instead.
  - `audio.ts` gains a `{ onset: w }` Say item.
  - If a clip is missing, it falls back to the stretched word, then to the plain word.
- **Stretched words** (`x/`) already exist for sun, sock, cat, dog, bag, jam, van, mug and map. Nothing new is needed for the first five minutes.
- **Word clips** for the new picture-only words (sausage, moon, flower, sunflower, star, starfish) come from the usual word pipeline.

### Retired from the first minutes

- `listen_intro`, `listen_tap`, `listen_slow`, `listen_sounds` and `i_can_hear`
- `this_is_a` and `this_is_an` as splice carriers
- `starts_with`, `has_in_middle` and `first_q`
- `ido`, `wedo` and `youdo`
- the `place_*` seed/star lines
- `tut_tile`, `tut_speaker`, `tut_test` and the long `tut_help`
- `book_i1`–`book_i3`, `book_intro` and `book_new`, whose jobs move to the `fm_rw_*` lines

`its_this_one` ("…Say it as you put it here.") belongs to word building only. Picture games use `fm_its_this` "It's this one!".

**Every new line** is in Appendix A, 89 in all. Every warm-up word from W3 on gets `fm_name_<w>`, `fm_tap_<w>` and `fm_diff_<w>` from one generator script, `scripts/gen-first-lines.ts`, which works like gen-teach-lines.ts.

---

## 13. The ninja

The ninja stands bottom-left all the time and glows on streaks (docs/HERO.md). Living things are never struck; they get a gift or a crown of stars.

| Moment | Move |
|---|---|
| A card is named | turns its head to the card; a tiny point on "this" |
| The first tap (sock) | a kick at the corner and a star stamp, the hook of the whole game |
| "Fast" | a lightning dash out and back |
| "Slow" | a slow-motion kata with afterimages, timed to the stretched clip |
| A slow word right | **bullet time**: the strike or gift at 0.35× speed under the stretched word, snapping to full speed on the fast word |
| Noticing a sound | cups its ear (a new `listen` pose), then a ki pulse on the gold sound dots |
| A tap-all find / all found | a shuriken pins a star and a pocket fills / its tier's biggest move, with a spell burst over every find |
| Picture reading | runs along the rail with a speed trail; hops under each tapped card |
| Swap | a leapfrog flip over the rail |
| Compound word | a spell orb pulls two cards into one; for starfish, **throws its own golden star** onto the fish |
| Wrong | a head-scratch "think" of 0.7 s or less; never hurt, never red |
| 3, 6 and 10 in a row | the existing tier beats, carried from Lesson 1 into Lesson 2 |
| Rewards | a hop or air punch on each sticker landing; laughs at the shiny sticker; powers up as the petal glows |
| Opt-in | leans toward each spotlit card; dashes through the chosen class door |

---

## 14. Timings and acceptance

| Piece | Target | Hard cap | Bot at 1.2 s |
|---|---|---|---|
| Opt-in | 16 s (not yet) / 28 s (at school) | 30 s from first sight to settled | — |
| Dojo welcome | 12 s | — | — |
| Lesson 1 | 85 s | 100 s | ≤ 80 s |
| Reward 1 (first time) | 21 s | 26 s | — |
| Lesson 2 | 60 s | 75 s | ≤ 56 s |
| Reward 2 (first time) | 26 s | 30 s | — |
| Title to the map | 4:34 | 5:00 | — |

**Treadmill acceptance** (scripts/treadmill):
1. The bots stay within the Bot column above, and the 3¾-year-old persona within the hard caps.
2. A random-tapping monkey gets through the opt-in with a valid start in 30 s or less, and never gets stuck in a lesson.
3. The audio log for the first five minutes contains **no word spliced into a line**; the only joins are the sound, stretched and held clips of §12.
4. Every `fm_name_*` clip has its card spotlit for the whole clip.
5. The card-box invariant (§11) passes on all three viewports in both engines.
6. Every warm-up picture passes the 3-year-old audit and has a face if it is a living thing.
7. The Sticker Book holds 12 stickers after the first session (including the shiny one), and "5" shows after Reward 1.
8. After the first session, `schoolYear`, `band` and `seenPlacement` are saved, and a returning child never sees the opt-in again.

---

## 15. Implementation notes

The lesson scripts are **data**, so the architecture work (the event log, planner, narrative director and text-adventure transcripts in docs/ARCHITECTURE.md and `src/core/`) can read them and the scenes only play them.

**New `src/content/warmups.ts`:** the W1–W6 scripts as typed beats.

```ts
type Beat = { optional?: true; secs: number } & (
  | { kind: "say"; lines: string[] }
  | { kind: "name"; cards: string[] }                                   // spotlight + fm_name_<w>
  | { kind: "tap"; target: string; options: string[]; glowAfterMs?: number }
  | { kind: "fastslow"; word: string; child?: ("slow" | "fast")[] }     // Sensei shows; the child taps tortoise/rabbit
  | { kind: "slowpick"; target: string; options: string[]; glowAfterMs?: number }
  | { kind: "notice"; p: PhonemeId; words: [string, string] }
  | { kind: "tapall"; how: "start" | "in"; p: PhonemeId; cards: string[]; targets: string[]; quick?: true; spell?: true }
  | { kind: "rail"; pair: [string, string]; by: "sensei" | "child"; merge?: string }
  | { kind: "which"; read: [string, string] }
  | { kind: "compound"; parts: [string, string]; word: string; by: "sensei" | "child"; via?: "star" }
);
export const WARMUPS: Record<string, { title: string; targetS: number; capS: number; beats: Beat[]; school?: Partial<Record<"R", Beat[]>> }>;
```

| File | Change |
|---|---|
| `src/content/worlds.ts` | New `LevelKind`s `"ears"` and `"picread"`. Add W1–W6 at the front of Bamboo Village with **explicit ids** `w1-wu1` … `w1-wu6`: `L()` gets an optional `id`, and existing ids never change. Remove w1-1 (`listen`) from the list. `Level.budgetMs` for the cut school lessons. `MILESTONES` gets the term-aware starts (§4). |
| `src/engine/gems.ts` | `frontier()` treats the warm-ups as done when any non-warm-up level has stars or `placedAt` is set, so returning children are never sent back. `placeAtUnit()` marks the warm-ups done. Add a `startFor(schoolYear, date)` helper for the table in §4. |
| `src/engine/store.ts` | `Save` gains `schoolYear`, `schoolYearAt`, `band`, `words[w].met` (a timestamp), `stickers: string[]` (collection order), `shiny: string[]`, `firstSession` and `adjustLog`. Add `recordMet(w)`. Migration: old saves get `schoolYear: "unset"` and a sticker for every word with `ok > 0`, in unit order. |
| **New `src/scenes/OptIn.tsx`** | Screens A and B, the settle ring, spotlights, silence defaults, the fly-to-gear confirm, and the September moving-up mode (`mode: "newyear"`). Publishes `__snState = { scene: "optin", screen, choices }`. |
| `src/scenes/Placement.tsx` | The ask phase (seed/star) goes. The quiz stays, reached only from Grown-ups as "Check the starting point". |
| `src/App.tsx` | Routing becomes: choose → `optin` (new profile only) → `training` (welcome) → the first lesson for the band. In the first session, the reward's arrow goes **straight to the next lesson**, and the map comes after Reward 2. Add the September moving-up check on launch, and `?scene=optin` and `?scene=picparade`. `LevelHost` gets `ears` and `picread`. The Reward component hands warm-up levels, and the first session on any path, to the Sticker Book reward. |
| `src/scenes/Training.tsx` | Cut to the gong and Help only, with `fm_help_short` and `fm_help_ok`. |
| `src/scenes/Early.tsx` | • **`PicCard`:** plates from `pic-plates.gen.ts`, the gutter, `spotlight`, `found` and non-opacity dimming, and the sizes in §11.<br>• **`usePickGame`:** a `quiet` mode with no ido/wedo/youdo lines; spotlit naming; echoes for early taps; idle at 8 s and 16 s; no re-queue and no stars for warm-ups; `fm_its_this`; multi-select `targets[]` with pockets.<br>• **New `EarsLevel` and `PicReadLevel`** play `WARMUPS` beats, using the new pieces `FastSlowStage` (elastic card, ribbon, `SoundDots`, `SpeedButtons` for the tortoise and rabbit), `TapAllGrid`, `ReadingRail`, `StackedRails`, `CompoundMerge` and `LessonBeads`.<br>• The time governor.<br>• `Frame` gets a `keepStreak` prop, so the streak carries across the chained lessons.<br>• `ListenLevel` is kept only for W5's segmented blending. |
| `src/content/teach.ts` | A new "first minutes" section of moments that build `Say[]` from the fm_ clips, with the usual `clip()` fallback until audio exists: `nameIt(w)`, `tapIt(w)`, `fastSlow(w)`, `slowPick(w, first)`, `slowThenFast(w)`, `noticeFirst(p, a, b)`, `tapAllStart(p, quick?)`, `tapAllIn(p)`, `differentStart(w)`, `notIn(w)`, `foundAll(p, n)`. The same rules as the existing moments: no letter names, spellings "spell", no splices of words into sentences. |
| `src/content/lines.ts` | A new block "First minutes (docs/FIRST_MINUTES.md)" with the Appendix A lines. Delete the retired lines once nothing uses them. |
| `src/content/phonics.ts` | `ORAL_WORDS` gains sausage, moon, flower, sunflower, star, starfish, fishdog and dogfish, each with a picture prompt, first sound and `segs` for sound dots (for example moon = m·oo·n). Sun, sock and cat already have `segs`. |
| `src/engine/audio.ts` | A `{ onset: w }` Say item; per-clip word timings (`wordTimes(id)`); a spotlight hook (`onClip(id, start, end)`) so cards light exactly with their clip. |
| `src/scenes/Book.tsx` | Picture, word and shiny stickers; pages in collection order, with three mystery outlines after the last sticker; a big counter with a sticker icon; plate colours; stickers say fast then slow, and gold ones say the sounds and read the word. `BookIntro` is replaced by the first reward. |
| **New `src/scenes/Stickers.tsx`** | `StickerReward` with `{ words, first, shiny?, sound?, petal? }` for Rewards 1 and 2 and the short 4–6 s version. |
| `src/scenes/Grownups.tsx` | The School year row, the "Start from here" press-and-hold, "Check the starting point", and the adjustment log. |
| `scripts/art-manifest.ts` | PIC_OBJECT and PIC_LIVING, a `plate:` override, and the jobs in Appendix B. |
| `scripts/post-art.py` | Re-pad to a 14% margin; write `src/content/pic-plates.gen.ts`. |
| `scripts/gen-stretch.ts` | An onset mode that writes `public/a/o/` for the six words in §12. |
| `scripts/gen-audio.ts` | Word timings for the multi-card and list clips; the loudness, fade and room-tone matching. |
| `scripts/treadmill/` | `bot.ts` learns `optin`, `ears`, `picread` and the sticker reward. `sweep.ts` adds the card-box invariant and the timing caps. `pic-audit.ts` adds the 3-year-old persona and the face check. A new stage runs the "one take, or joined?" judge. |
| Docs | ART_STYLE.md (plates, faces); PEDAGOGY.md stops 0 and 1 now point here; FEEDBACK.md Round 13 items move to 🔨/✅ as they land. |

**Order of work:**
1. The audio and art batches first, because they take the longest.
2. Cards (PicCard, plates, gutters), since every early game benefits.
3. The opt-in and routing.
4. W1 and W2.
5. The Sticker Book reward and Book.
6. The treadmill acceptance checks.

**House rules:** never `rm` (move files to `.trash/`), use absolute paths, British English, and don't commit.

---

## Appendix A: every new line

All are Sensei's. `[/s/]`, `[x w]` and `[o w]` after a line are spliced clips, not part of the recording.

| id | Text | Where |
|---|---|---|
| fm_opt_q1 | Do you go to big school yet? | opt-in A |
| fm_opt_notyet | Not yet? Tap the teddy! | opt-in A (teddy spotlit) |
| fm_opt_yes | Yes? Tap the school! | opt-in A (school spotlit) |
| fm_opt_q1_again | Teddy, or school? Tap one! | opt-in A, 8 s idle |
| fm_opt_echo_notyet | Not yet! | teddy tapped |
| fm_opt_echo_school | Big school! | school tapped |
| fm_opt_q2 | Which class are you in? | opt-in B |
| fm_opt_rec | Reception! | door label, spotlight and echo |
| fm_opt_y1 | Year One! | door label |
| fm_opt_y2 | Year Two! | door label |
| fm_opt_unsure | Not sure? Tap the cloud! | cloud label |
| fm_opt_q2_again | Tap your class! | opt-in B, 8 s idle |
| fm_opt_ok_notyet | Then I've set up some listening games, just for you! | confirm |
| fm_opt_ok_unsure | That's fine! I've set up some listening games for you, and we'll see how you get on. | confirm |
| fm_opt_ok_rec | I've set up the game for Reception, with sounds just like at school! | confirm |
| fm_opt_ok_y1 | I've set up the game for Year One, with new ways to spell the sounds you know! | confirm |
| fm_opt_ok_y2 | I've set up the game for Year Two, with even more ways to spell the sounds you know! | confirm |
| fm_opt_grownups | Your grown-ups can change this later, in the grown-ups' settings. | after every confirm |
| fm_opt_default_home | Let's start at the very beginning, with listening games! | silence on A |
| fm_opt_default_rec | Let's start with the Reception games! | silence on B |
| fm_newyear_q | It's a new school year! Which class are you in now? | September |
| fm_newyear_up | Hooray! You've moved up! | September |
| fm_help_short | Stuck? Tap me, down here in the corner. Try it now! | dojo welcome |
| fm_help_ok | That's it! I'm always here to help. | dojo welcome |
| fm_its_this | It's this one! | second miss, picture games |
| fm_last_one | Here's the last one! | time governor |
| fm_l1_hello | Ninja ears on! Let's listen to some words. | L1 |
| fm_name_sun | This is the sun. | L1 |
| fm_name_sock | This is a sock. | L1 |
| fm_name_cat | This is a cat. | L1 |
| fm_tap_sock | Tap the sock! | L1 |
| fm_fast_sun | I can say a word fast. Sun! | L1 fast/slow |
| fm_slow | Or I can say it slowly... | L1, then [x sun] |
| fm_same_word | Fast or slow, it's the same word. Sun! | L1 |
| fm_hear_sounds | When I say a word slowly, I can hear the sounds that make up the word. Words are made of sounds! | L1 |
| fm_tap_tortoise | Your turn! Tap the tortoise, and say it slowly with me. | L1 |
| fm_tap_rabbit | Now tap the rabbit, and say it fast! | L1 ◇ |
| fm_slow_listen | Listen to my slow word... | L1, then [x cat] |
| fm_which_pic | Which picture is it? | L1 |
| fm_slow_another | Here's another slow word... | L1 ◇, then [x sock] |
| fm_first_listen | Listen to the very first sound. | L1, then [o sun] [o sock] |
| fm_notice_sun_sock | Did you notice? Sun and sock start with the same sound... | L1, then [/s/] |
| fm_name_sausage | This is a sausage. | L1 |
| fm_name_moon | This is the moon. | L1 |
| fm_tap_all_start | Tap all the pictures that start with... | L1, then [/s/] |
| fm_diff_moon | Moon starts with a different sound. | L1 wrong tap |
| fm_diff_cat | Cat starts with a different sound. | L1 wrong tap |
| fm_found_both | You found them both! They both start with... | L1/L2, then [/s/] |
| fm_look_this | Look! This one starts with... | tap-all help, then [/s/] |
| fm_l1_done | You can hear the sounds in words. Brilliant listening! | L1 close |
| fm_rw_look | Look! Your pictures are turning into stickers! | Reward 1 |
| fm_rw_book | This is your Sticker Book! | Reward 1 |
| fm_rw1_list | Sun, sock, cat, sausage and moon! | Reward 1 (word timings) |
| fm_rw_every | Every picture you play with becomes a sticker! | Reward 1 |
| fm_rw_tap | Tap a sticker! | Reward 1 |
| fm_rw_next | Ready for the next game? Tap the big arrow! | Reward 1 |
| fm_rw_more | More stickers for your Sticker Book! | later rewards |
| fm_l2_way | Ninjas read this way! | L2 |
| fm_name_fish | This is a fish. | L2 |
| fm_name_dog | This is a dog. | L2 |
| fm_read_fish_dog | Fish... dog. Fish dog! | L2 (word timings) |
| fm_l2_turn | Your turn! Tap them the ninja way. | L2 |
| fm_pair_fish_dog | Fish dog! | L2 |
| fm_l2_start | Start here, on this side! | L2 wrong order |
| fm_l2_swap | Whoops! Now they're the other way round. Dog... fish. Dog fish! | L2 (word timings) |
| fm_which_cat_dog | Listen. Cat... dog. Which one did I read? | L2 (word timings) |
| fm_pair_cat_dog | Cat dog! | L2 |
| fm_l2_big_word | Two little words can make one big word! | L2 |
| fm_name_flower | This is a flower. | L2 |
| fm_sunflower | Say them slowly: sun... flower. Say them fast: sunflower! | L2 (word timings) |
| fm_name_star | This is a star. | L2 |
| fm_starfish_q | Star... fish. Tap the rabbit to say them fast! | L2 (word timings) |
| fm_starfish | Starfish! | L2 |
| fm_quick_tap_all | Quick! Tap all the pictures that start with... | L2 ◇, then [/s/] |
| fm_diff_fish | Fish starts with a different sound. | L2 wrong tap |
| fm_diff_dog | Dog starts with a different sound. | L2 wrong tap |
| fm_l2_done | You read the pictures, just like a real reader! | L2 close |
| fm_rw2_list | Fish, dog, flower, sunflower, star and starfish! | Reward 2 (word timings) |
| fm_rw_shiny | Ooh, a shiny sticker! Fish dog! | Reward 2 |
| fm_rw2_s | Sun, sock, sausage and sunflower. They all start with... | Reward 2, then [/s/] |
| fm_rw2_petal | You found your very first sound! Look, its petal is shining through the mist. | Reward 2, first time |
| fm_rw2_map | Your Sticker Book lives here, on the map! | Reward 2 |
| fm_tap_all_in | Tap all the pictures with this sound in them... | Reception L2, W3, then [/a/] |
| fm_not_in_sun | Sun doesn't have that sound in it. | "/a/ in it" wrong tap |
| fm_not_in_dog | Dog doesn't have that sound in it. | "/a/ in it" wrong tap |
| fm_found_all | You found them all! | tap-all with 3 or more, then `t_they_all_have` [/a/] |
| fm_tap_all_words_in | Tap all the words with this sound in them... | Years 1 and 2, then [/ae/] |
| fm_warm_up | Let's do some warm-up training first! | the check drops a band |
| fm_super_listener | You're a super listener! Now let's find out how we write the sounds. | warm-up fast-forward |

These existing lines are reused: `t_everyone_say`, `how_we_spell`, `t_they_all_have`, `listen_again`, `tut_1`, `map_hint`, `intro_8` and `chose`.

## Appendix B: art jobs

The house style (`STYLE`, plus PIC_OBJECT or PIC_LIVING) is added by the manifest. Each prompt is one iconic, concrete thing with no text.

**Needed for the first five minutes:**

| id | Prompt | Style |
|---|---|---|
| pic_dog (redraw) | a friendly brown-and-white puppy sitting and facing the viewer, floppy ears, big shiny eyes, a little pink tongue, a wagging tail | living |
| pic_fish (redraw) | an orange goldfish swimming side-on, one big round friendly eye, a small smile, flowing tail fins | living |
| pic_sausage | one plump golden-brown cooked sausage, slightly curved | object |
| pic_moon | a glowing pale-yellow crescent moon (`plate: night`) | object |
| pic_flower | one red flower with five round petals, a yellow middle, a green stem and two leaves | object |
| pic_sunflower | one tall sunflower with big bright yellow petals, a round brown middle, a green stem and two leaves | object |
| pic_star | one plump golden five-pointed star with rounded points (`plate: night`) | object |
| pic_starfish | an orange starfish with five chunky rounded arms and little dots, facing the viewer with a friendly smile | living |
| pic_fishdog | a funny goldfish with floppy brown puppy ears, a pink tongue and a wagging puppy tail, facing the viewer and smiling | living |
| pic_dogfish | a funny brown-and-white puppy with orange goldfish fins on its back and a goldfish tail, sitting and facing the viewer, smiling | living |
| opt_teddy | a soft brown teddy bear sitting and facing the viewer, with a friendly stitched smile and a red bow at its neck | living |
| opt_school | a small friendly British primary school building in red brick, with a big blue front door, white windows, a little bell on the roof and green railings in front; no signs | object |
| class_door | a single bright classroom door painted sunny yellow, standing slightly open with warm light spilling out, a round window near the top; no signs | object |
| hero_kai_school, hero_suki_school | (ref `hero_<x>_idle`) the same character wearing a red British school jumper over the ninja outfit and carrying a blue book bag, standing proudly and facing the viewer | sprite |
| item_think_cloud | a single fluffy white thought cloud with two small round puffs trailing below it | item |
| ui_rabbit | a white bunny rabbit leaping to the right, ears streaming back, a happy face | living |
| ui_tortoise | a green tortoise walking slowly to the right with a sleepy, happy smile | living |
| item_sticker_book | a chunky closed red leather sticker book with rounded corners and a gold ninja-star clasp on the front cover, three-quarter view | item |

**Redraws for W3–W6 and Bamboo Village picture games:**

| id | Prompt | Style |
|---|---|---|
| pic_pig | a round pink pig standing side-on with its head turned to smile at the viewer, flat snout, curly tail | living |
| pic_man | a smiling grown-up man with short brown hair, a green jumper and blue jeans, whole from head to toe, facing the viewer and waving | living |
| pic_fox | an orange fox sitting and facing the viewer, white cheeks and chest, black-tipped ears, a bushy white-tipped tail | living |
| pic_frog | a green frog sitting and facing the viewer, big round eyes, a wide smile | living |
| pic_duck | a white farm duck standing side-on with an orange beak, orange feet and one friendly eye | living |
| pic_hat | a red woolly bobble hat with a big white bobble on top | object |
| pic_mat | a rectangular striped mat with a short fringe at both ends, lying flat, seen from slightly above (used only with its written word) | object |
| pic_sit | a smiling child with curly hair sitting on a small red chair, facing the viewer, whole from head to toe | living |
