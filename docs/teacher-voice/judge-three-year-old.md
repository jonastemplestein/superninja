# Teacher voice: the three-year-old's judge

**27 September 2026, teacher-voice workflow, judging pass.** One lens only: *would a 3-year-old and a 4-year-old understand this, and stay with it?* I read the three drafts ([draft-reception-teacher.md](draft-reception-teacher.md), [draft-cbeebies-writer.md](draft-cbeebies-writer.md), [draft-early-years-specialist.md](draft-early-years-specialist.md)) against [current.md](current.md) and [mechanics.md](mechanics.md). For every game or moment I counted the words and seconds before the child can act, checked that the words point at things on screen, checked that the child always knows when it's their turn, and checked that repeat plays don't explain everything again. Round 13 said the first game was "too long and boring … the same thing over and over"; Jonas now says the talk is too abbreviated and teachers explain what they're doing. A script passes this lens only if it does both: whole, warm sentences, and a child who is doing something every few seconds.

Nothing was played. I judged the drafts' tables. Short names below: **R** = the Reception teacher, **C** = the CBeebies writer, **E** = the Early Years specialist.

---

## 0. Verdict

| Rank | Draft | Mean score (32 sections) | Sections won | In one line |
|---|---|---|---|---|
| **1** | **CBeebies writer** | **7.6** | **20** | The most child actions per word, the shortest runs between taps, and the best repair of the "Listen!" and the ear. Some of its Ready lines are too long, and a few are clipped. |
| 2 | Reception teacher | 7.0 | 8 | The tightest sentences and the clearest hand-over ("My word is sun… Your word is sock"). But it counts "say it with me" as the child acting, so First Sounds, Middle Sounds, Word Building and Sound Swap run 24–35 s between taps. |
| 3 | Early Years specialist | 6.0 | 4 | The best individual lines, the best idle ladder and the leanest recaps. But it asks "Ready?" *before* the demo, so its longest talk comes straight after the child has said "I'm ready": 16–33 s in nine games. Its own budget table doesn't count those runs. |

**Why C wins on this lens:**
1. **The child acts inside the explanation, not after it.** C splits a long demo with a tap that means something: tap the petal and say the sound, tap the word card to hear the word, "Can you find the last one?" in the middle of Sensei's own build, and reading the start word before a swap. In W1 the child taps 11 times for 231 words, one tap every 21 words. R's child taps once every 29 words, E's once every 37. Today's W1 is one tap every 36 words.
2. **Its longest run between taps on any first meeting is 16.7 s** (Sound Swap's demo, which C flags itself). R's is 35.2 s and E's is 33.1 s (§2).
3. **It repairs Jonas's moment with something the child already owns.** In W1 the ear is explained ("Look, your ninja has its ninja ears on. That means listening really carefully."). In w2-1 it comes back as "Here's the first new sound. Get your ninja ears ready." There is no ear icon, the petal blooms on the sound, and the child taps it straight away.
4. **The repeats are lean where it matters.** Word Building's second level has no second demo: "It's Word Building again. This word has three sounds, so there are three lines." Later battles get one line: "Another monster! Let's zap it with spelling."

**Why R is second, not first:** sentence for sentence, R is the best-written teacher. But four of its first meetings (First Sounds, Middle Sounds, Word Building, Sound Swap) are long demos broken only by "Say it with me…", which the game can't hear. A 3-year-old playing alone often won't say anything. Then it is 24–35 s of Sensei between taps. R's W1 also asks for four green-arrow taps, and it offers the paw *before* the arrow ("Do you want to see it again? Tap the paw."), so a 3-year-old who taps the first thing named re-watches a 12 s show.

**Why E is third:** E's frames are the best ("I'll say a word. Then you find its picture."). But its Ready question comes after the frame and before the demo. The child taps "I'm ready to play", then watches the naming, the demo and "Now it's your turn" before they can play. That is 24.5 s in First Sounds, 27.3 s in Sound Hunt and 33.1 s in Sound Swap. That is Round 13's "too long and boring", and it lands at the moment the child has just been promised a turn. E's table measures only to the Ready tap, so it reports 9–11 s for games that actually run 20–33 s.

---

## 1. How I measured

- **Pace:** the drafts' own assumptions. 2.7 words a second and 0.35 s between clips. A pure sound is 0.55 s, a word 0.65 s, a stretched word 1.65 s and a held first sound 0.9 s. The estimator is [playtest/runs/teacher-voice/judge-3yo-runs.py](../../playtest/runs/teacher-voice/judge-3yo-runs.py); the line sequences are copied from each draft's tables.
- **Tap-to-tap:** the talk from one thing the game can register (a tap on ▶, a card, a petal, a tile) to the moment the next one is live and cued. A child may act during a question, so a run ends where the question *starts*.
- **Voice join-ins** ("Say it with me…" + a sound, then 1.5 s of quiet) are good Sounds~Write practice, and I credit them. But I don't count them as a break in the run. The game can't hear them, a 3-year-old alone may stay silent, and nothing on screen changes because of them.
- **The limits:** ARCHITECTURE §6.4 allows 12 s of talk before an action at age 3 and 15 s at 4. research.md §0.6 asks for about 8 s (20 words) per run.
- **Score (1–10):** 10 means a 3-year-old follows every sentence, always knows when it's their turn, never waits more than about 12 s without something to do, and doesn't hear the same explanation twice. I took marks off for abstract words, one-word barks, questions with no answer, and runs over 12 s.

---

## 2. The numbers

**W1 as a whole** (the lesson Round 13 called too long):

| | Today | R | C | E |
|---|---|---|---|---|
| Sensei's words | 180 | 231 | 231 | 257 |
| Child taps | 5 | 8 (4 of them ▶) | 11 (3 of them ▶) | 7 (3 of them ▶) |
| Words per tap | 36 | 29 | **21** | 37 |
| Says the sound aloud | once | once | twice (with a petal tap) | once |

All three drafts make W1 longer. Only C pays for the extra words with the child's own taps. E's W1 has more words per tap than today's.

**The longest run between taps, first meetings** (my estimate; † = a voice join-in inside the run):

| Game | R | C | E (after its Ready tap) |
|---|---|---|---|
| W1 Find the picture | 10.7 s | 12.2 s | 12.1 s |
| W1 Fast and slow | **25.5 s** † (tortoise to the next tap, when the ◇ rabbit is dropped) | 11.2 s | **16.4 s** |
| W1 Pockets | 11.5 s | 12.1 s | 12.8 s |
| W2 rail / which / big words | ≤ 11 s | ≤ 12.1 s | 9.2–9.6 s |
| W3 Fast and slow (a repeat) | 10.1 s | 12.6 s | **18.2 s** |
| W3 Slow Words | 8.9 s | 13.1 s | **19.0 s** |
| W5 Guess My Word | 7.4 s | 14.1 s | **25.6 s** |
| w1-2 First Sounds | **24.8 s** † | 11.1 s | **24.5 s** |
| w1-4 Word Building | **28.7 s** †† | 11.8 s | **21.4 s** |
| w1-6 Monster Battle | 13.7 s | 11.4 s | **19.8 s** |
| w1-7 Sound Hunt | **23.7 s** † | 13.4 s | **27.3 s** |
| w1-8 Sound Swap | **35.2 s** †† | 16.7 s | **33.1 s** |
| w2-1 New Sounds | 11.1 s | 11.1 s | 11.0 s |

The drafts' own budget tables report different figures:
- **R** counts "say it with me" as an action, so its table shows 12.2 s at most.
- **E** counts only up to its pre-demo ▶, so its table shows 9–11 s.
- **C's** figures are the closest to mine, and it marks its own two overruns (Guess My Word and Sound Swap).

---

## 3. Section by section

Each table quotes each draft's best and worst line on this lens. **Fixes** are only what the lens asks for.

**At a glance:**

| § | Section | R | C | E | Winner |
|---|---|---|---|---|---|
| 3.1 | Film and Choose | 7 | **8** | 4 | C |
| 3.2 | Opt-in | 7 | 6 | **7** | E |
| 3.3 | Dojo welcome | 7 | **8** | 7 | C |
| 3.4 | W1 Find the picture | **8** | 7 | 6 | R |
| 3.5 | W1 Fast and slow | 6 | **8** | 4 | C |
| 3.6 | W1 The first sound and petal | 7 | **9** | 7 | C |
| 3.7 | W1 Pockets | 7 | **8** | 6 | C |
| 3.8 | Reward 1 | **8** | 7 | 6 | R |
| 3.9 | W2 Reading rail | **8** | 7 | 7 | R |
| 3.10 | W2 Which row | **8** | 7 | 7 | R |
| 3.11 | W2 Big words | **8** | 7 | 7 | R |
| 3.12 | Reward 2 and the map | 7 | **8** | 6 | C |
| 3.13 | W3 | **7** | 6 | 4 | R |
| 3.14 | W4 and its repeat | 8 | 6 | **8** | E |
| 3.15 | W5 Guess My Word | **7** | 7 | 4 | R |
| 3.16 | W6 Sound Dots | 7 | **7** | 6 | C |
| 3.17 | w1-2 First Sounds and the first letters | 7 | **9** | 4 | C |
| 3.18 | First World Flower visit | 5 | **6** | 5 | C |
| 3.19 | Second meetings | 6 | **8** | 6 | C |
| 3.20 | w1-4 Word Building, Who Read It Right? | 7 | **9** | 6 | C |
| 3.21 | w1-5 Word Building again | 6 | **8** | 5 | C |
| 3.22 | w1-6 Monster Battle | 7 | **8** | 5 | C |
| 3.23 | w1-7 Middle-sound hunt | 6 | **8** | 4 | C |
| 3.24 | w1-8 Sound Swap | 5 | **8** | 3 | C |
| 3.25 | w1-9 Ninja Run | **9** | 7 | 8 | R |
| 3.26 | w1-14 Story Time | 7 | **8** | 8 | C |
| 3.27 | w1-15 Boss | 7 | **9** | 6 | C |
| 3.28 | w2-1 New Sounds, Find, Build | 8 | **9** | 7 | C |
| 3.29 | Ready and Show me again | 5 | **8** | 6 | C |
| 3.30 | Praise, correction, idle, Help | 8 | 8 | **9** | E |
| 3.31 | Replay forms | 6 | 7 | **8** | E |
| 3.32 | Sorting and gem battle (light weight) | 7 | **8** | 6 | C |
| | **Mean** | **7.0** | **7.6** | **6.0** | C 20 · R 8 · E 4 |

Ties at the same score were broken on the line quality noted in the section: W5 (R's runs are shorter), W4 (E has no held step), W6 (C's demo teaches the "say the word" step) and Story Time (C's frame).

### 3.1 The film and Choose your ninja

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "Your ninja will play every game with you." | "Great choice! Let's rescue those sounds!" (kept: nothing on screen says what rescuing a sound means) |
| C | 8 | "First, choose your ninja. Will it be Kai, or Suki?" (a real question with a tap answer, and it names the two readers of w1-4) | "Great choice! Let's rescue those sounds!" (kept) |
| E | 4 | – (not written: E starts at the opt-in, so today's "I am Sensei Maple. I will train you. Now, choose your ninja!" stays) | "I will train you." (today's line: telegraphic, and it says nothing about what training is) |

**Winner: C.** C names Kai and Suki at first sight, and it says "When you're ready to see what happens next, tap the green arrow." at the film's first held step, which teaches ▶ as "when you're ready" from the start.
**Fixes:**
- All: replace "Let's rescue those sounds!" with something concrete, for example "Let's go and find those sounds!".
- C: add R's "Your ninja will play every game with you." as the chosen ninja walks to its corner.

### 3.2 The opt-in

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "Is it the teddy, or the school? Tap one." | "Not yet? Then tap the teddy." (the answer comes as a fragment before the child has worked out the question) |
| C | 6 | "Teddy, or school? Tap one." | "If not yet, tap the teddy." (an elliptical conditional a 3-year-old can't parse) |
| E | 7 | "Not yet. That's fine." (a child who hears "not yet" as failing is reassured) | "Is that right? Then tap the green arrow." (a 3-year-old can't check their own answer: a confirm dialog that adds a tap and 3 s) |

**Winner: E, on wording.** Its lines are the clearest: "If you don't go yet, tap the teddy." It also has the best idle line for a child who doesn't know: "Ask a grown-up to help you choose."
**Fixes:**
- E: cut `tv_opt_check` and let the ring settle, as in R.
- C: replace `tv_opt_notyet` with E's line.

### 3.3 The dojo welcome

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "Welcome to my dojo. A dojo is a school for ninjas." | "Did you miss it? Tap the speaker, and I'll say it again." (the child's honest answer is "no") |
| C | 8 | "Three tricks, three stars. Now you're ready for your first game." | "Trick three is the speaker. Here's a little ninja rhyme." (two ideas in one line, and a speaker isn't a trick) |
| E | 7 | "Tap the gong, and your ninja will kick it." (cause and effect, said before the tap) | "Welcome to my dojo. This is where ninjas practise." ("practise" is abstract next to R's "a school for ninjas") |

**Winner: C.**
- The unexplained stars get a meaning (one per trick).
- The speaker gets something worth hearing again: "Tip, tap, tiptoe, quiet as a mouse.", which the ninja acts out and the first story echoes.
- The welcome ends on a real Ready into a named game: "It's a listening game, called Ninja Ears. Tap the green arrow when you're ready."

It is also the longest welcome, at about 118 words against 87 (R) and 97 (E). No run is over about 10 s, and the child taps four times.
**Fixes:**
- C: open with R's "A dojo is a school for ninjas."
- C: add E's "That's your first star. Two more to go." after the gong.
- C: drop the bare "Trick two." and say "Here's trick two." instead.

### 3.4 W1: find the picture (the very first game)

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 8 | "Your word is sock. Can you find the sock?" (it mirrors "My word is sun", so the pronoun tells the child whose turn it is) | "Now it's your turn. When you're ready, tap the green arrow." ("your turn" means tapping the arrow here, not the sock) |
| C | 7 | "I'll go first. I'm looking for the sun… There it is!" | "Now it's your turn. Look, your ninja is ready. Are you ready too? Tap the green arrow." (16 words, three sentences, and the eyes go bottom left and then right) |
| E | 6 | "I'll say a word. Then you find its picture." (Jonas's "I will show you this, and you will do that", in two short steps) | "Here we go." (said on the Ready tap, then 28 more words of naming and demo, 12.1 s, before the child plays) |

**Winner: R.**
- R names all three cards in one clip ("Here's the sun, a sock and a cat.").
- The demo and the turn are the same sentence with the pronoun swapped.
- The turn follows the Ready tap with nothing in between.

**Fixes:**
- R: the first Ready line becomes "Do you want to have a go? Tap the green arrow.", dropping "Now it's your turn".
- C: frame with E's "I'll say a word. Then you find its picture." ("I say a picture" can't be done).
- C: cut the Ready line to "Your ninja is ready. Are you ready too? Tap the green arrow."
- E: move ▶ to after the demo.

### 3.5 W1: fast and slow (the rabbit and the tortoise)

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 6 | "This is my rabbit. It says words fast. Sun!" | "Do you want to see it again? Tap the paw." (said *before* the arrow line, so a 3-year-old taps the paw and re-watches a 12 s show) |
| C | 8 | "Meet my friends, the rabbit and the tortoise." | "When I say a word slowly, I can hear the sounds that make up the word." (16 words, and "make up" is abstract, said while the child waits for the rabbit) |
| E | 4 | "This is my tortoise. Tortoises are slow." | "Ready? Tap the green arrow." (placed before the show, so the child then waits 16.4 s, 35 words, for the tortoise) |

**Winner: C.**
- The show is 10.4 s.
- The Ready offers the arrow first and the paw second.
- The rabbit tap is no longer optional (C's D6), so the child's second tap splits the "words are made of sounds" idea from the notice.

In R the rabbit is ◇, and the governor usually drops it for a real 3-year-old. Then the run from the tortoise to "Say it with me" is 19.4 s, and 25.5 s to the next tap.
**Fixes:**
- C: merge "Fast or slow, it's the same word. Sun!" and the 16-word line into one: "Fast or slow, it's the same word. Slowly, I can hear its sounds."
- C: add a wrong-button line. E's is the best: "That's my rabbit. It says words fast. Tap the tortoise to say it slowly."
- R: arrow first, paw second, in one line.
- R: make the rabbit a real turn.

### 3.6 W1: the first sound and the first petal (the notice)

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "This is that sound's petal. Every sound has one." | "Next, a game called Sound Hunt. Tap the arrow when you're ready." (the third arrow tap in W1, with a fourth 12 s later) |
| C | 9 | "Look, your ninja has its ninja ears on. That means listening really carefully." (it explains the metaphor that made the w2-1 ear weird) | "Words are made of sounds. Let's listen for the very first one." (an abstract claim, and "the very first one" has no noun) |
| E | 7 | "Look, that sound has its own petal." | "Say it with me. /s/" (the only action is a voice the game can't hear, and E's cut list, §4.2, would drop the petal line) |

**Winner: C, clearly.**
- The child taps the sun ("Tap the sun."), then the sock, and hears each held first sound. They notice the sound themselves.
- The petal blooms on /s/, and the child taps it and says /s/.
- That is three taps and a voice in 30 s, where today there are none.

This beat is the best in any draft for a 3-year-old.
**Fixes:**
- C: "Let's listen for the very first sound." (give it its noun).

### 3.7 W1: the pockets (tap all that start with /s/)

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "You filled every pocket! Sun, sock and sausage all start with…" /s/ | "Do you want to see it again? Tap the paw." (paw first again, at the third Ready of the lesson) |
| C | 8 | "Into the pocket it goes!" (the pockets explained by what happens to them) | "Watch." (a one-word order: the bark register Jonas objected to) |
| E | 6 | "I'll find one first. Then you find the rest." | "Watch my paw." (the start of a 12.8 s run after "Ready? Tap the green arrow.": names, demo and "Now it's your turn") |

**Winner: C** (12.1 s to Ready, and a pocket the child can see filling).
**Fixes:**
- C: "Watch." becomes E's "Watch my paw.", which tells a 3-year-old where to look.
- C: after the Ready tap C says nothing. If the child taps the sock *during* the Ready, the tap should count as the first find, not only as "ready". Otherwise a child who found it is asked again.

### 3.8 Reward 1: the Sticker Book

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 8 | "This is your Sticker Book! Tap it to open it." (a tap about 10 s after the last find) | "Our next game is called Ninjas Read This Way. Tap the green arrow when you're ready." (16 words, and the name is a slogan) |
| C | 7 | "Fast, then slow, like the rabbit and the tortoise!" (the sticker tap links back to the lesson) | "Every picture you play with becomes a sticker!" (a rule about the future, near the end of about 19 s with nothing to tap) |
| E | 6 | "Tap a sticker, and it will say its name." | "Now watch what happens to your pictures." (it adds to a 62-word, about 23 s stretch from the last find to the first tap) |

**Winner: R** (the book tap).
**Fixes:**
- C: graft R's book tap.
- C: drop `fm_l1_done` after `fm_found_both`, because it stacks praise.

### 3.9 W2: the reading rail

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 8 | "Let's read some pictures. Ninjas always start on this side, and go this way." | "Now you read them. Do you want to have a go?" (a child who then taps the fish, the right first move, has it taken as "ready" and must tap it again) |
| C | 7 | "Watch me read them." | "This is a reading rail." (a label with no meaning: "rail" isn't nursery vocabulary) |
| E | 7 | "I'll read some pictures first. Then you read them." | "Ninjas read this way." (the slogan survives as the opener, only with a full stop) |

**Winner: R.**
**Fixes:**
- C: replace `tv_rail_frame` with R's `tv_w2_frame`.
- R and C: during a Ready whose board is the turn's own board, a tap on the right first card counts as the first answer.

### 3.10 W2: which row did I read?

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 8 | "Here's my row. Cat… dog. Which row did I read?" | "Watch. Fish… dog. I read this row." (a one-word opener) |
| C | 7 | "Fish, then dog. That's this one!" | "Now there are two rails. I'll read one of them, and you tap the one I read." (17 words, a "one … one" pronoun chain, and "rails" again) |
| E | 7 | "Fish came first. So I tap this row." (the only demo in any draft that gives the child its *reason*) | "I'll go first. Watch my paw." (another demo after the child has already tapped Ready) |

**Winner: R** ("row" is a word a 3-year-old knows).
**Fixes:**
- R: take E's think-aloud "Fish came first. So I tap this row."
- R: take E's correction "Let's listen again. Cat... dog. Which row has the cat first?"

### 3.11 W2: big words (compound words)

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 8 | "I tap the tortoise, and say them slowly. Sun… flower." | "Now you make a big word. Are you ready?" (said before the star and fish are named, so "a big word" has nothing to point at yet) |
| C | 7 | "Let's squish them together." | "Watch. I say them slowly: sun… flower. I say them fast: sunflower!" (a bare "Watch.", and the buttons being tapped aren't named) |
| E | 7 | "Slowly, like the tortoise: sun... flower. Fast, like the rabbit: sunflower!" | "Now it's your turn." (arrives 9.6 s after the Ready tap, with a new card still to be named) |

**Winner: R** on structure. **E's demo line is the best line** and should be grafted into whichever wins.

### 3.12 Reward 2 and the first map

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "The World Flower is where all your sounds live." | "Tap the glowing stone to start your next adventure." (kept: "adventure" is abstract) |
| C | 8 | "Tap your petal, and hear its sound." (the only tap in 38 s of show) | "You found your very first sound! Look, its petal is shining through the mist." (kept: "mist" means nothing yet) |
| E | 6 | "The glowing stone is your next game. Tap it when you're ready." | "This petal is for the sound... /s/" (kept: it re-explains the petal E named in W1, and there's nothing to tap) |

**Winner: C.**
**Fixes:**
- All: one held step fewer for a first-session warm-up child (mechanics §5.4).
- R: use C's or E's map hint in place of "adventure".

### 3.13 W3: fast and slow again, Slow Words, the middle-sound hunt, the /m/ hunt

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "I can hear mug. There's the mug!" | "I'll do one first. Tap the arrow, and watch me." (an arrow tap before a 5 s demo, then another arrow tap after it) |
| C | 6 | "A new pocket hunt! This time, the sound is hiding inside the words." | "When I say a word slowly, I can hear the sounds that make up the word." (said again, word for word, four minutes after W1) |
| E | 4 | "I'll say a word slowly, like my tortoise. You find its picture." | "Here are my rabbit and my tortoise again." (inside an 18.2 s, 39-word run on a *repeat* before the first tap) |

**Winner: R.** Its fast/slow repeat is 10.1 s to the tortoise, with no Ready, which is right for a game met minutes ago.
**Fixes:**
- C's Slow Words demo is silent. "I'll go first." is followed only by the word, which breaks C's own rule 3. Graft R's "Here's my slow word…" [mug, slowly] "I can hear mug. There's the mug!".
- C: the W3 recap says the insight once, not twice.
- R: drop the Watch? hold before any demo under 8 s.

### 3.14 W4 and the automatic repeat

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 8 | "Let's read some pictures again. This time, there are three!" | "That one was tricky. Let's play it again, with new pictures." (the repeat replays the same pictures, so it's a broken promise) |
| C | 6 | "That game was a bit tricky. Let's play it again, and it will feel easier." | "It's the two-rail game again. Tap the one I read." (C never said "the two-rail game" at the first meeting, and a Ready hold follows) |
| E | 8 | "Two rows again. Tap the row I read." (the name and the task in six words) | "Ninjas read this way." (the slogan opener again) |

**Winner: E** (no holds, and each game is one line and go; it edges R, which keeps a held ▶ after the swap show).
**Fix:** C's recap form adds three Ready holds to W4. Use E's rule: no Ready on a recap unless 21 days have passed or the child struggled.

### 3.15 W5: Guess My Word

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "Here are my sounds…" /s/ /u/ /n/ · "I can hear the word sun. There it is!" | "I'll do one first. Tap the arrow, and watch me." (two arrow taps around a 5 s demo) |
| C | 7 | "My sounds are…" /s/ /u/ /n/ · "I can hear sun!" | "Guess My Word! I'll say the sounds, and you listen for the word." (it never says the child then taps the picture, and the run to Ready is 14.1 s) |
| E | 4 | "I can hear sun. So I tap the sun." | "Now it's your turn." (followed by three more "This is a…" namings before the question: 25.6 s after the Ready tap) |

**Winner: R** (every run 7.4 s or less, and its frame says the whole job: "You listen for the word, and tap its picture.").
**Fix:** graft E's "Let's say it together." /m/ /a/ /p/ [map] after the first right answer. It is a choral blend at the moment the child has just done it.

### 3.16 W6: Sound Dots

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "This game is called Sound Dots. Every dot is one sound in the word." | "Watch me tap them this way." (the demo never says the word is the point) |
| C | 7 | "Then I say the word…" [sun] (the last step of blending, said as a step) | "Sound Dots!" (a name as a shouted opener) |
| E | 6 | "Look at the dots under this picture." (the best attention-getter in the lesson) | "I'll tap them first. Then it's your turn." (then a Ready before the demo, and 12.2 s after it) |

**Winner: C, narrowly.** A tie with R on time; C's demo teaches the final "say the word" step.
**Fix:** C opens with E's "Look at the dots under this picture." instead of "Sound Dots!".

### 3.17 w1-2: First Sounds, the first letters, and the find game

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "Now you do one all by yourself." | "Look! This is how we write…" /m/ (the first letter a child ever sees arrives at the end of a 24.8 s run whose only break is a voice join-in) |
| C | 9 | "Hmm, let me listen." (real thinking aloud, with a beat before the held word) | "Writing a sound down is called spelling." (a definition a 3-year-old won't hold) |
| E | 4 | "Now watch my ninja write that sound." | "Let's do the next one together." (arrives 24.5 s, 47 words, after the Ready tap) |

**Winner: C.**
- The petal tap and say come at 9 s.
- The demo runs 11 s to Ready.
- The first letter is written under the picture *the child* found, and then the child taps it and says the sound.

**Fixes:**
- C: drop `tv_spelling_is`. Introduce "spell" at the first battle with R's "That's how we spell a word.".
- C: the find game's stem "Which of these is the way we write…" is 8 words. R's "Can you find…" is shorter.
- C: take R's name for the find game, **Ninja Eyes**. It pairs with Ninja Ears, and a 3-year-old doesn't know the word "letter".

### 3.18 The first World Flower visit

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 5 | "Your petals will be waiting here. Let's go back to the map." | "Inside each petal are shiny gems. Each gem is a way to spell the sound." (kept: two abstractions for a non-reader) |
| C | 6 | "Tap it, and hear its sound." | "In mat, this is the way we spell…" /m/ · "We see this spelling in man and map." (spelling facts to a child who can't read) |
| E | 5 | "Now let's go and see where your sounds live. Tap the green arrow." (the only draft that says why we're going) | "Inside each petal are shiny gems. Each gem is a way to write the sound." (kept) |

**Winner: C** (one tap in eight held steps).
**Fixes for all three:**
- On the preschool path, the first visit should be three steps: the flower, your petals (tap each to hear it), and back to the map.
- Leave out `wf_i3` and the "We see this spelling in…" lines until the child can read words.

### 3.19 The second meetings (w1-3, w1-10 to w1-13)

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 6 | "Let's play First Sounds again." | "Now you do one. Are you ready?" (an arrow tap after every I do, on every form, even on the third play) |
| C | 8 | "Another monster! Let's zap it with spelling." | "If you'd like to see me do one first, tap my paw. Or tap the arrow to start." (a 15-word two-way choice) |
| E | 6 | "It's First Sounds again, with two new sounds." | "Watch me build the first one." (a full building demo again, on the third building level) |

**Winner: C.** Each new sound keeps its short I do, joined by a petal tap and with no ▶.
**Fix:** C shortens `tv_show_offer` to E's "Not sure? Tap my paw, and I'll show you again.".

### 3.20 w1-4: Word Building, then Who Read It Right?

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "Here are Kai and Suki. They're learning to read too." | "I'll do the first one. Tap the arrow, and watch me." (it opens a 28.7 s demo whose only breaks are two voice join-ins) |
| C | 9 | "Can you find the last one?" (Sensei starts the word, and the child finishes it inside the demo) | "Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up." (a held step in the middle of the level) |
| E | 6 | "Who read it right? Tap Kai, or tap Suki." (the answers are named) | "Look, a gem! Each gem holds a way to write a sound. When you build words, it fills up." (the same held interruption), after a 21.4 s post-Ready run |

**Winner: C.** "This card is my word. Tap it, and hear the word." makes the child start the demo, and every run is under 12 s.
**Fixes:**
- C: move the gem explanation to the level reward, as R does.
- C: take E's "Tap Kai, or tap Suki."
- C's own flag should stand: the child's ninja is one of the two readers, so a child who chose Kai may watch Kai read it wrong. Use two other readers.

### 3.21 w1-5: Word Building again

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 6 | "I can hear three sounds." | "Word Building again! My word is…" [mat] (then the full I do the child saw five minutes ago, and a Ready) |
| C | 8 | "It's Word Building again. This word has three sounds, so there are three lines." (the one new idea, in one sentence, then a we do) | "Kai and Suki are back. First, you read the word." (a "first" with no "then") |
| E | 5 | "Let's build some more words. These ones have three sounds." | "Watch me build the first one." (about 20 s of demo again) |

**Winner: C.** It shows Jonas's "don't re-explain everything": no second demo, and the paw offers w1-4's demo if the child wants it.

### 3.22 w1-6: the first Monster Battle

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "That's how we spell a word. Now you spell one. Are you ready?" | "In a Monster Battle, I say a word, and you spell it." (the child's first "spell", with a roar and no drama) |
| C | 8 | "We can zap it with spelling, just like Word Building." (a known game as the explanation) | "Every sound you get right zaps its power." ("its power" is abstract; the bar is the thing) |
| E | 5 | "Zap! Look, its bar went down." (the bar is named the moment it moves) | "Oh no. One of Baron Muddle's monsters is in the way." (the full-stop rule flattens the one line that earns "!", and a 19.8 s run follows the Ready tap) |

**Winner: C** (11.4 s to Ready, no demo needed after two building levels, and the letters locked until ▶).
**Fix:** C replaces "zaps its power" with E's "Zap! Look, its bar went down.", said at the child's first right sound.

### 3.23 w1-7: the middle-sound hunt

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 6 | "Let's find it together. Which one has this sound in the middle…" /i/ | "In Middle Sounds, we listen for the sound in the middle of a word." ("middle" twice, before any word is on screen; the first tap comes 23.7 s in, with only a voice join-in before it) |
| C | 8 | "Sound Hunt! This time, the sound is hiding in the middle of the word." ("hiding" makes it a game) | "Hmm, let me listen." [pin, slowly] (only the pin is stretched, so the demo never shows why the pan is wrong) |
| E | 4 | "I'll say them both slowly." | "Let's do the next one together." (27.3 s, 48 words, after the Ready tap) |

**Winner: C** (13.4 s from the petal tap to Ready, the shortest of the three).
**Fix:** C takes E's "I'll say them both slowly." [pin, slowly] [pan, slowly], so the contrast is heard.

### 3.24 w1-8: the first Sound Swap

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 5 | "I take this one out, and put this one in." | "I'll do the first one. Tap the arrow, and watch me." (then 35.2 s until the next tap, with two voice join-ins) |
| C | 8 | "So out goes…" /m/ · "…and in goes…" /s/ (a magician's rhythm a 3-year-old can follow) | "I'll show you. Are you ready to watch? Tap the arrow." (the 16.7 s demo after it is the longest run in C) |
| E | 3 | "The first sound changes. So I take it out." | "I'll do the first one. Ready? Tap the green arrow." (33.1 s of Sensei follows before the child's first tap) |

**Winner: C.** The child reads the start word first ("First, let's read this word. Tap each sound, and say it with me."), which is Sounds~Write's own order, and so the child acts before the rules.
**Fix:** split C's demo with its own Word Building device, "I'll start, you finish". After "The first sound changes.", the paw points at < m > and the child kicks it out. Then Sensei puts in /s/.

### 3.25 w1-9: the first Ninja Run

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 9 | "Tap anywhere to make your ninja jump. Try it now." (a practice tap on the mechanic before anything moves) | "When the lanterns come, I'll say some sounds. Listen for the word, and catch it." (15 words and three steps, about things not on screen yet) |
| C | 7 | "Your ninja runs all by itself." | "Which lantern has that word?" (the lanterns carry written words, and nothing says so) |
| E | 8 | "Tap anywhere, and your ninja jumps." (said just in time, at the first crate) | "You help it catch lanterns." (said before there is a lantern) |

**Winner: R** (the practice jump, "Good jumping!", and "Let's catch the first one together.").
**Fix:** R says its lantern line when the first lanterns arrive, as E does.

### 3.26 w1-14: the first Story Time

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "When a page has big words, it's your turn to read." | "Story time! I'll read the pages with lots of words." (a 3-year-old can't tell "lots of words" from "big words": the rule is about the size of the print) |
| C | 8 | "Story time! I'll read some pages to you, and you'll read some pages to me." | "Two places to look! Where is the pot hidden? … Read both words. Then tap the place you want to look." (the instruction is buried after a story line) |
| E | 8 | "Now you choose what happens. Read the two words, and tap one." (agency, in eleven words) | "It's story time." (a celebration flattened by the full-stop rule) |

**Winner: C** (the clearest who-does-what), with E's choice line grafted.
**Fix for all three:** a 3-year-old can't read "Map! Tap it!". On the child's first page, Sensei should read it *with* them, sound by sound, before the tick is asked for.

### 3.27 w1-15: the first boss

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "Don't worry. A Boss Battle is just like a Monster Battle." | "Do you want to have a go now?" (a generic Ready straight after "My sumo panda will squash you!") |
| C | 9 | "Don't worry, ninja. You know what to do." | "A boss takes lots of words to beat." (the weakest line here, but fine) |
| E | 6 | "This is a boss monster. It takes lots of words to zap it." | "Ready? Tap the green arrow." (nobody reassures the child after Baron's threat) |

**Winner: C.** "Are you ready to beat the boss? Tap the arrow." turns the threat into the child's challenge. C also proposes softening "will squash you".

### 3.28 w2-1: the first Dojo Learn (Jonas's "Listen!" and the ear), then Find and Build

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 8 | "This is its petal. Tap the petal to hear it again." (the thing that appears is named and used, as a real turn) | "Watch." (a one-word order, three times, in the very level where a one-word "Listen…" sounded like a bark). Also "You can hear it in hat, hut and hutch." ("hutch") |
| C | 9 | "Here's the first new sound. Get your ninja ears ready." (the ear is back, and this time it's the child's own, explained in W1) | "Your turn." (a two-word clip three times: record it about 3 LU under, per mechanics §7.4) |
| E | 7 | "And once more." (the second tap of the letter, said softly) | "If you want to hear a sound again, tap its petal." (said *after* the first sound's teaching, so the petal's first appearance goes unexplained) |

**Winner: C.**
- The frame is Jonas's teacher talk almost word for word: "Today in the dojo, I'm going to teach you four new sounds. I'll say each sound, and show you how we write it. Then you say it with me. Are you ready for the first one?".
- There are two taps per sound (the petal, then the letter).
- The sounds shorten as a series.
- Find and Build are one line each.

R is close. Its "You can hear it in bat, bag and bin." links each sound to words, but its series repeats six clips per sound, and its Build redoes the full I do behind a Watch? and a Ready (three arrow taps in one level).
**Fixes:**
- C: add R's "You can hear it in…" line on the first sound only, with words a 3-year-old knows.
- C: add E's "And once more." on the second letter tap.

### 3.29 The recurring moves: Ready and Show me again

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 5 | "Do you want to have a go now?" (Jonas's own words) | "Do you want to see it again? Tap the paw." (the "no" answer offered first, and with Watch? some games take two arrow taps around a 5 s demo) |
| C | 8 | "Of course. Watch again." | "Now you. Ready?" (`tv_ready_q1`: three clipped words, the abbreviated register Jonas rejected) |
| E | 6 | "Not sure? Tap my paw, and I'll show you again." (the paw offered when the child needs it, at 8 s idle) | "Ready? Tap the green arrow." (the default for every game, and placed before the demo) |

**Winner: C.** It offers the arrow first and the paw second, introduces the paw at the second Ready, and keeps a real "Ready to watch?" only where a demo is long.
**Fixes:**
- C: retire `tv_ready_q1`, and let "Do you want to have a go now?" and "Ready to have a go?" alternate.
- C: offer the paw on idle as E does ("Not sure? Tap my paw…"), not only as a second button at the first Ready.

### 3.30 The recurring moves: praise, correction, idle and Help

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 8 | "That was a tricky one, and you kept listening." | "Lovely." (a one-word generic, fine now and then, but it's in the rotation) |
| C | 8 | "You checked their reading, like a real teacher!" | "It's this one. You tap it." ("You tap it." is curt, where R and E say "Now you tap it.") |
| E | 9 | "Have a look at each picture. Where's the sock?" (the 8 s idle rephrase) · "Here it is. Tap it when you're ready." (16 s) · "Take your time." (24 s) | "Now you've got it." (after help, when the child tapped what glowed: mild over-praise) |

**Winner: E.** It has the one idle ladder that rephrases, points and then goes quiet. Every other draft's re-ask still leans on repeating the question.

### 3.31 Replay forms: recap and short, across every game

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 6 | "Next is a new game, called Sound Swap. Baron Muddle has mixed up some words! Tap the glowing stone to fix them." (a map preview, so the stone tap is the child's "yes") | "Remember Sound Swap? We change one sound to make a new word." (every recap opens on a question with no answer) |
| C | 7 | "It's Sound Swap again. We change one sound, to make a new word." | "It's Find the Picture again. I say a picture, and you find it." (four warm-up names are said at the recap but never at the first meeting: Find the Picture, Ninja Reading, the two-rail game, Slow Words) |
| E | 8 | "You know this game. I say a word, and you find its picture." (no rhetorical question, and it works without a name) | "Watch me build the first one." (the building games keep a full demo on their short form) |

**Winner: E.** Recaps are statements, there is no Ready hold on a recap (the stone tap is the "yes") unless 21 days have passed or the child struggled, and the short forms are one line.

### 3.32 Outside the preschool path: Sorting and the gem battle (weighted lightly; a 5-year-old's games)

| Draft | Score | Best line | Worst line |
|---|---|---|---|
| R | 7 | "Tap the glowing chest, and I'll tell you its spelling." | "Look at the spelling in the word. It goes in this chest." (the correction answers for the child) |
| C | 8 | "This sound can be spelt in three ways. Tap each chest to open it." | "Sorted! What a clever ninja." (kept: trait praise) |
| E | 6 | "The bar filled up, so you lost a heart. That's fine. Keep going." (hearts explained when one is lost) | "Each chest has a different way to spell it." (said over three closed chests the child can't open) |

**Winner: C** (the chests open on the child's taps). For the gem battle, R's and E's rule is better: explain the hearts when the first one is lost, not up front.

---

## 4. What to graft into the winner (C), from the other two

In priority order. The first ten fix something this lens found wrong in C.

| # | From | Line or idea | Where it goes in C, and why |
|---|---|---|---|
| 1 | R | "My word is sun. There it is!" → "Your word is sock. Can you find the sock?", and "Here's my slow word…" / "Here's your slow word…" | Find the Picture and Slow Words. The pronoun swap is the clearest "now it's your turn" in any draft. |
| 2 | E | "I'll say a word. Then you find its picture." | Replaces `tv_find_frame` ("I say a picture" can't be done). |
| 3 | R | "Here's my slow word…" [mug, slowly] "I can hear mug. There's the mug!" | C's Slow Words demo is silent; this makes it a think-aloud. |
| 4 | R + E | R's "rows" ("Here are two rows of pictures. I'll read one row, and you tap the row I read.") and E's reason, "Fish came first. So I tap this row.", plus E's correction "Which row has the cat first?" | Replaces C's "rails" and "the two-rail game". |
| 5 | R | "Let's read some pictures. Ninjas always start on this side, and go this way." | Replaces "This is a reading rail." |
| 6 | E | "Zap! Look, its bar went down." | Replaces "Every sound you get right zaps its power.", said at the child's first right sound. |
| 7 | E | A recap form with no Ready hold (the stone tap is the "yes"), except after 21 days away or a struggle; recaps as statements ("You know this game. …") | Removes C's extra holds in W3, W4 and w1-12. |
| 8 | E | The idle ladder: 8 s rephrase ("Have a look at each picture. Where's the sock?"), 16 s point ("Here it is. Tap it when you're ready."), 24 s "Take your time.", and the paw offered on idle ("Not sure? Tap my paw, and I'll show you again.") | Every turn. |
| 9 | R | The gem's first-fill explanation moves to the level reward | Takes the held step out of w1-4. |
| 10 | R | "That's how we spell a word." at the first battle | Replaces `tv_spelling_is` "Writing a sound down is called spelling." |
| 11 | R | "This is your Sticker Book! Tap it to open it." | Reward 1: a tap about 10 s after the last find, not about 19 s. |
| 12 | R | "Tap anywhere to make your ninja jump. Try it now." · "Good jumping!" · "Let's catch the first one together." | Ninja Run: a practice tap before the world moves. |
| 13 | E | "Slowly, like the tortoise: sun... flower. Fast, like the rabbit: sunflower!" | Word Squish demo (replaces "Watch. I say them slowly…"). |
| 14 | E | "That's my rabbit. It says words fast. Tap the tortoise to say it slowly." (and its mirror) | Fast and slow: C has no wrong-button line. |
| 15 | E | "Who read it right? Tap Kai, or tap Suki." | Who Read It Right? |
| 16 | E | "Watch my paw." | Replaces every bare "Watch." (tells a 3-year-old where to look). |
| 17 | E | "Not yet. That's fine." · "If you don't go yet, tap the teddy." · "Ask a grown-up to help you choose." | The opt-in. |
| 18 | R + E | R's "A dojo is a school for ninjas." and E's "Tap the gong, and your ninja will kick it." and "That's your first star. Two more to go." | The dojo welcome. |
| 19 | R | "Your ninja will play every game with you." | Choose your ninja. |
| 20 | R | "Ninja Eyes" as the name of the find game | It pairs with Ninja Ears; "letter" is a word a 3-year-old doesn't have. |
| 21 | E | "Now you choose what happens. Read the two words, and tap one." | The story's choice page. |
| 22 | E | "I'll say them both slowly." [pin, slowly] [pan, slowly] | The middle-sound demo, so the contrast is heard. |
| 23 | E | "Let's say it together." /m/ /a/ /p/ [map] | Guess My Word, after the first right answer. |
| 24 | E | "Look at the dots under this picture." | Sound Dots' opener, in place of "Sound Dots!". |
| 25 | R | "You can hear it in bat, bag and bin." | The first new sound of a Dojo Learn only, with words a 3-year-old knows (not "hutch"). |
| 26 | E | "And once more." | The Learn's second tap on the letter. |
| 27 | E | "Now let's go and see where your sounds live." | The reason for the first World Flower trip. |
| 28 | R | "Next is a new game, called {Game}. Tap the glowing stone to play." | The map, before a never-played game (optional: the stone tap becomes the child's "yes"). |

---

## 5. What the winner still has to fix

1. **The first Ready is 16 words.** Cut it to "Your ninja is ready. Are you ready too? Tap the green arrow."
2. **`tv_ready_q1` "Now you. Ready?"** is the clipped register Jonas rejected. Retire it.
3. **One-word and two-word clips** ("Watch.", "Your turn.", "Trick two."). Expand them (graft 16), or record them about 3 LU under the sentences around them (mechanics §7.4).
4. **Names said at a recap but never at the first meeting:** Find the Picture, Ninja Reading, the two-rail game and Slow Words. Say them at the first meeting, or use E's name-free recap ("You know this game.").
5. **W3 tells fast and slow's insight a second time, word for word.** Say it once per session.
6. **Sound Swap's demo is 16.7 s.** Split it with a child tap (the child kicks out the old sound), the device C already uses in Word Building.
7. **"Which lantern has that word?"** The lanterns carry written words. Say "Tap the lantern with my word.", and check that a w1-9 child can read them.
8. **W1 is 231 words (today's is 180).** It is paid for in taps, so keep it, but merge the two post-tortoise lines into one (§3.5) and drop the stacked `fm_l1_done` (§3.8). That brings it to about 205 words.

---

## 6. What all three get wrong

1. **A right tap during a Ready is swallowed.** R and C put the Ready after the demo, on the turn's own board. A 3-year-old who taps the sock (or the fish, or the second pocket) during the Ready has it taken as "I'm ready", then is asked to find it again. When the Ready line has already given the instruction ("Now you find the other two. Ready?"), a right tap on the board should count as the answer. This is a mechanics change for `holdReady()` / `readyTap()`.
2. **Arrow fatigue.** The path to w2-1 asks for about 25–30 green-arrow taps. R's Watch? and C's recap holds add more. A 3-year-old will tap the arrow, but it isn't play. Use a meaningful tap (a petal, a card, a word card) wherever one exists, as C already does, and drop holds on recaps.
3. **The first World Flower visit is still a lecture.** It is 7–9 held steps on gems and "We see this spelling in man and map" for a child who can't read. It should be three steps, with a petal to tap for each sound.
4. **The words 3-year-olds don't know are still in the content:** pin, tin, lid, zip, top, hutch. The /a/ petal's picture is an apple, so "apple starts with /a/" becomes matching two pictures, which only C flags.
5. **Story Time asks a non-reader to read "Map! Tap it!".** All three explain the tick; none reads the first child page *with* the child. Add "Let's read it together." with the words lighting sound by sound on the first child page of the save.
6. **The drafts' own budgets aren't comparable.** E stops counting at its pre-demo ▶, and R counts voice join-ins as actions. The integrator should re-measure the merged script tap-to-tap with the bot (mechanics §9's `talk-before-action`), counting only registered taps, and treat anything over 12 s on a first meeting at age 3 as a blocker.
7. **"Great choice! Let's rescue those sounds!"** and "…your next adventure" are kept as they are, abstract lines at the child's very first taps.
