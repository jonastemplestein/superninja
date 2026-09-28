# Sound Detective: spellings that can be more than one sound

**27 September 2026. The multi-sound researcher's and game designer's spec.** It answers Jonas, on the scroll design v1:

> "…in each spelling gem in a sound we also need to have a measure of progress towards mastery. In fact some spellings can even make multiple sounds. Like ea. That should also be something that is explicitly discussed and has a game."

Sounds~Write's fourth concept is exactly this: "Many spellings can represent more than one sound" (Phonics Lead Handbook 2026). This document covers four things:
- what Sounds~Write teaches about it, and how (§1);
- a game for it, **Sound Detective** (§2), with Sensei's script in the new teacher voice (§3);
- its words and pictures (§4), where it goes in the level order and how often it comes back (§5);
- how progress on it is measured and shown on the World Flower (§6–§7), and the contract for the builders, the bots and acceptance (§8–§10).

Language: with grown-ups a spelling **represents** a sound, and some spellings can represent more than one sound. With children Sensei uses the official classroom form, "It can be /ae/ but, in this word, it's /ee/". A spelling never "makes" or "says" a sound.

Working files (git-ignored) are in `playtest/runs/flower-v2/multi-sound/`:
- `multi.ts` and `multi.txt`: every spelling that represents more than one sound in the official sequence, with its words per sound.
- `words.ts` and `words.txt`: the same per sound, with each word's picture status.
- `pics-have.txt`: the word pictures that exist.

---

## 0. The short version

- **What Sounds~Write does.** Eleven "spelling units" (EC3 < ea >, 5 < o >, 9 < ow >, 13 < oo >, 15 < ou >, 17 < s >, 22 < ew >, 26 < a >, 31 < y >, 39 < g >, 41 < gh >) teach one spelling's sounds with **Lesson 10, One Spelling, Different Sounds**. Each runs in week 2 of the sound unit before it, "a couple of times a unit", then in review. The lesson has the class read words, ask "In this word, what sound is this?", sort them into one column per sound, and **sum up**: "So, the same spelling can sometimes be the sound /o/ and sometimes the sound /oe/." Its follow-up has the teacher read a word "the wrong way" and ask "Does that make sense?" The skill underneath is phoneme manipulation, which the Handbook says children need "to test out alternatives for spellings that represent more than one sound". Freshford tells parents: "Does that make sense? Try it a different way. Can < ea > be a different sound?"
- **Since September 2024 concept 4 is everywhere.** With split spellings gone, < a > in *cake*, < i > in *bike*, < o > in *bone* and < u > in *cube* are single-letter spellings of a second sound. The official correction "This can be /a/, but in this word, it's /ae/" applies from EC1.
- **The game: Sound Detective.**
  - A word appears with its spelling in a gold lens. The spelling's petals sit below, with their pictures (for < ea >: /ee/ tree, /ae/ train, /e/ bread).
  - Tapping a petal *tries* that sound. The word's sounds light and play one at a time, then the word is read that way: /s/ /t/ /ee/ /k/, "steek".
  - When the try makes a real word, the picture window opens (a steak) and the ninja kicks the word into that petal. When it doesn't, Sensei says "That's not a real word. Try it a different way."
  - The child's first tap is the scored decision. The tries teach the Sounds~Write strategy: try each sound in turn, and listen for the real word.
  - Words whose other readings are also real words (*sea*/*say*, *head*/*heed*) are **read by Sensei first** (the listening form). They never appear in the reading form.
  - Review uses a sorting layout: words fall, and the child taps their petals.
- **The explicit discussion** opens every spelling's first game. "Look! This spelling is in three petals." The child taps each petal: "This spelling can be… /ee/ …as in sea." · "Or it can be… /ae/ …as in great." · "Or it can even be… /e/ …as in bread."
  - At the save's first game, a circle becomes a ball, a moon and a pizza. This is the official Lesson 10 scaffold, and the circle then becomes the lens.
  - Then comes Jonas's line in Sensei's words: "When we read this spelling, we try each sound. Then we listen for the real word."
  - Sensei never says "ea" aloud, because letter names are banned. The spelling glows on "This spelling".
- **Where it goes.** Each official spelling unit gets one stone, straight after the level that teaches its second sound plus one practice level (Sounds~Write's "week 2"). There is one PSC stone for < ch > (/ch/ /sh/ /k/) in Year 1 summer. Other spellings with several sounds are played in review and from the World Flower.
  - **Today's game can play only < ea >**, once w6-1 also teaches < ea > as /ae/ (great, steak, break), as EC1 does.
- **How often it comes back.** A second, shorter round in the same unit. Then due-based review at 1, 3, 7, 14 and 30 days, two items per fork in each land's boss (the Extended Code quizzing lag of four units), and a reprise whenever the spelling gains a petal (< ea > gains /e/ at EC7).
- **Progress.**
  - Each sound of a fork has a segment. A segment is **sure** after three right first tries in a row in the reading form, over at least two sessions.
  - A fork is none → outline → filling → full, the same three-stage language as Jonas's petals.
  - A multi-sound gem can't reach its last fill step until its segment is sure (a proposal for `progress.ts`).
- **On the World Flower**, a spelling in two or more met petals carries a quiet **sound line**: a thin underline with one segment per sound, in those petals' colours, faint until sure. On the petal card, the spelling opens its **fork panel**: the explanation, the segments, and a **magnifying-glass gate** that starts a four-word Sound Detective.
- **The learner core is not wired in yet.** Nothing in `src/App.tsx`, `src/scenes`, `src/ui` or `src/engine` imports `src/core`. So v1 measures progress in the save (`sd`), and §6.3 maps it onto the core's KCs for later. The core already has what it needs: a `spelling-sort` item, an `alternative-reading` activity ("try the spelling's sounds until the word makes sense"), and evidence to `gpc:<g>><p>:read` plus `concept:4`.

---

## 1. What Sounds~Write says

Sources are the research dossier (`assets-src/sw-sources/research/DOSSIER.md`, "DOSSIER §x"), with bibliography ids in brackets, and the local copies named in §12. Quotes are kept to a line or two.

### 1.1 The concept

- **Concept 4** (Handbook 2026, current wording; the 2024 staffroom poster is the same): "Many spellings can represent more than one sound." [O1][O3] The lexicon says "A spelling may represent more than one sound", with < a > in "lazy, water, was, aloud" [O17]. Freshford's own guidance says "we say 'one spelling many sounds'" [S39].
- **The skill** is phoneme manipulation, "the ability to insert sounds into and delete sounds out of words". On the poster and the website template: "This skill is necessary to test out alternatives for spellings that represent more than one sound." [O1][O3][O8]
- **The poster's own example** asks the child's question outright: "Spelling < o >. Is it /o/ as in hot, /oe/ as in no, /u/ as in son, or /oo/ as in do?" [O3]
- **The founder's reason** (2012): "Even quite young children have no difficulty in understanding that a circle can represent different things: a ball, a pizza, a moon." Pupils need "the skilled ability to substitute one sound for another when the first attempt doesn't produce a recognisable word" (2013) [literacyblog 2012; X61].
- **When:**
  - In the Initial Code pupils "begin to have an understanding" [O1].
  - The concept is formal from the first spelling unit, EC3 < ea > [O13].
  - The 2024 split-spelling guidance calls it "a concept that we're going to be teaching formally throughout the next ten or so units", from EC1's *cave* [O18].
- **Not too early.** "Don't try teaching one sound/different spellings and one spelling/different sounds until a child can segment and blend to something approaching mastery level throughout the Initial/Basic Code." [X7]
- **Most children find it easy.** "Be aware that most students find this concept very easy; however, students who have issues with phonemic awareness may have more difficulty" (Top Tips for Lesson 10) [O13].

### 1.2 Which spellings represent more than one sound, and when

Computed from `gpcsOfUnit()` over the official sequence (`src/content/sw.ts`, consonant + e policy). A **fork** here is a spelling with two or more sounds. "Second" is the unit where the fork first becomes a choice. The words columns count the one-syllable words the content files (`src/content/units/*`) already have per sound, and how many of them have a picture (`public/a/i/pic_<word>.webp`); they don't check decodability at the unit.

**The official spelling units (Lesson 10):**

| Spelling | Sounds, first unit each | Spelling unit, and when it is taught | Key words (record sheet) | Words / pictured now |
|---|---|---|---|---|
| < ea > | /ae/ EC1, /ee/ EC2, /e/ EC7 | **EC3**, week 2 of EC2 | team, great; after EC7: bread, head, thread | /ae/ 3/1, /ee/ 22/4, /e/ 8/0 |
| < o > | /o/ IC2, /oe/ EC4, /oo/ EC10, /u/ EC14 | **EC5**, week 2 of EC4 | no, hot; after IC11: do, to | /o/ 65/25, /oe/ 23/4, /oo/ 2/0, /u/ 8/0 |
| < ow > | /oe/ EC4, /ou/ EC8 | **EC9**, with EC8 (a one-week unit) | cow, snow | /oe/ 13/3, /ou/ 15/4 |
| < oo > | /oo/ EC10, /uu/ EC12 | **EC13**, week 2 of EC12 | moon, book | /oo/ 21/8, /uu/ 7/2 |
| < ou > | /ou/ EC8, /u/ EC14, /oo/ EC15 (PSC: EC10 'you'), /oe/ EC32 | **EC15**, week 2 of EC14 | loud, double, soup | /ou/ 20/4, /u/ 6/0, /oo/ 3/1, /oe/ 0/0 |
| < s > | /s/ IC1, /z/ EC17 | **EC17**, week 2 of EC16 | bricks, his | /s/ 180/39, /z/ 12/0 |
| < ew > | /oo/ EC10, /ue/ EC21 | **EC22**, week 2 of EC21 | blew, new | /oo/ 8/0, /ue/ 5/1 |
| < a > | /a/ IC1, /ae/ EC1, /or/ EC19, /ar/ EC24, /o/ EC25 | **EC26**, with EC25 (one week) | was, cat, apron, father | /a/ 104/34, /ae/ 21/3, /or/ 0, /ar/ 0, /o/ 9/2 |
| < y > | /y/ IC7, /ee/ EC2, /ie/ EC11, /i/ EC30 | **EC31**, with EC30 (one week) | yellow, hymn, cry, happy | /y/ 10/1, /ee/ 0, /ie/ 7/0, /i/ 0 |
| < g > (and < gg >) | /g/ IC3, /j/ EC37 | **EC39**, week 2 of EC38 | gum, gem (egg, suggest) | /g/ 74/25, /j/ 3/0 |
| < gh > | /g/ EC38, /f/ EC40 | **EC41**, week 2 of EC40 | cough, ghost | /g/ 0, /f/ 3/0 |

**Lesson 10 by PSC guidance, not a numbered unit.** < ch > for /ch/, /sh/ and /k/ ("lunch, chef, school") is taught in Year 1: "Use Lesson 10 to teach the spelling < ch > representing /ch/, /sh/ and /k/" [O11]. The formal units are IC11 for /ch/ and EC45 for /k/; /sh/ is taught tangentially. Words now: /ch/ 30/8, /k/ 1/1 (school), /sh/ 0.

**Forks the sequence creates with no spelling unit of their own.** Lesson 10 may be used "whenever two or more sounds that share a spelling have been completed" [O37], and "an impromptu Lesson 10" when older pupils ask [O13].

| Spelling | Sounds, first unit each | Notes |
|---|---|---|
| < i > | /i/ IC1, /ie/ EC11, /ee/ EC29 | the 2024 consonant + e fork (*hid*/*hide*, *bit*/*bite*); 137/34, 23/3, 1/1 |
| < e > | /e/ IC4, /ee/ EC2, /i/ EC30 | *he, she, we, be, these*; /i/ in *pretty*, *English* |
| < u > | /u/ IC5, /oo/ EC10, /uu/ EC12, /ue/ EC21 | *cup, flute, put, cube*. /w/ after < q > (IC11) is its own teaching point, not a choice (§11 D6) |
| < ai > | /ae/ EC1, /e/ EC7 | only *said* (/e/) |
| < ie > | /ie/ EC11, /ee/ EC29 | *pie* / *chief, field, shield, thief* |
| < ey > | /ae/ EC27, /ee/ EC29 | *grey, they* / *key* |
| < ar > | /or/ EC19, /ar/ EC24, /er/ EC34 | *warm, dwarf* / *car* / *collar* (two syllables) |
| < or > | /er/ EC6, /or/ EC19 | *worm, work, word* / *fork, horse* |
| < al > | /l/ EC18, /or/ EC19, /ar/ EC24 | *pedal* (two syllables) / *chalk, walk* / *half, palm* |
| < au > | /or/ EC19, /ar/ EC24 | *sauce* / *aunt, laugh* |
| < ue > | /oo/ EC10, /ue/ EC21 | *blue, glue* / *due, cue* |
| < ear > | /air/ EC20, /er/ EC34, /eer/ EC49 | *bear* / *earth, learn* / *ear, near*; *tear* is a homograph |
| < ere > | /air/ EC20, /eer/ EC49 | *there, where* / *here* |
| < ui > | /i/ EC30, /oo/ EC36 | *build, built* / *fruit, juice, suit* |
| < ough > | /oe/ EC32, /oo/ EC36, /or/ EC43 | *dough* / *through* / *bought*; the "graphemic word pdf" also lists it [O13] |
| < our > | /er/ EC34, /or/ EC43 | *journey* (two syllables) / *four, pour* |
| < se > | /s/ EC4, /z/ EC17 | *house, horse, goose* / *nose, rose, cheese, please* |
| < c > | /k/ IC3, /s/ EC16 | *cell, city, pencil*; PSC: "Tangentially teach < c > for /s/ as in 'cell'" [O11] |
| < wh > | /w/ IC11, /h/ EC44 | *when* / *who, whole* |
| < ed > | /d/ EC28, /t/ EC47 | *played* / *stopped* |
| < ss > | /s/ IC7, /z/ EC48 | *kiss* / *scissors* |
| < th > | /th/ and /dh/, both IC11 | Sounds~Write "writes voiced and unvoiced both as /th/"; the game has two petals |
| < n > | /n/ IC2, /ng/ IC11 | *think, bank*; "/ng/ should only be taught as one sound if it accurately represents the accents of the children" |

**Not forks:**
- < x > is one spelling for two sounds together, /k/ + /s/ ("box"), not a choice. It sits in two petals on the chart, but `isWayToSpell()` already excludes it.
- < q > < u > are two spellings for two sounds, /k/ and /w/ [O9].

**Accent.** The PSC guidance notes that "In some regions the < oo > in book represents the same sound as the < oo > in room", and similarly for < ea > in *head*. "All regional pronunciations are acceptable." [O11] The validator already excludes the *bath*/*grass* and *book*/*look* vowels unless a file tags them.

### 1.3 How Sounds~Write teachers talk about it

The Lesson 10 manual page is official and one of the few complete public scripts [O37]:

| Moment | Official wording |
|---|---|
| Open | "Today we are going to read some words that have this spelling (pointing to < o >)." |
| Ask for the sound | "In this word, what sound is this?" … "Yes. Good!" |
| Introduce the second sound | "In some words, this spelling can be a different sound." · "Here's a word we see a lot when we are reading. It also has this spelling in it." |
| Start a column | "Let's write the /oe/ words in a new column, like this." |
| **Sum up** (the concept) | "So, the same spelling can sometimes be the sound /o/ (sweep hand over the first column) and sometimes the sound /oe/." Top Tips: this is "a very important part of the lesson as it draws attention to the 4th concept" [O13] |
| Sort | "Does this word have the /o/ sound or the /oe/ sound in it?" · "So, should it go in the column with 'hot' or the column with 'no'?" |
| Read it wrongly | "Does that make sense?" (Everyone): No. · "How shall we read this word then?" |
| A pupil misreads (TTE) | "This can be /a/, but in this word, it's /ae/. Say /ae/ here. Say the sounds and read the word." [O18] · Top Tips: "It can be /ae/ but, in this word, it's /ee/." [O13] |
| Intervention | "This can be /ae/ – do you remember what else it can be?" [O120] |
| A school, < ow > (not official) | "In this word, does the spelling represent the sound /oe/ or /ow/?" · "In this word, this is /oe/. Say /oe/. Now say the sound and read the word" [S35] |
| **Freshford** (what the child hears) | "Does that make sense? Try it a different way. Can < ea > be a different sound?" [S41] · Reception parents, reading 'brown': "The child has to try it as b r /oe/ n, consider if it makes sense, and if not, try it as b r /ow/ n" [S40] |

Never say: letters "make" or "say" sounds, "hard/soft" or "long/short" sounds, "magic e", spelling rules, or letter names to young children [O1][O115]. So the game shows the spelling and never names it aloud (§11 D2).

### 1.4 The activities

1. **Lesson 10, Step 1: link the spelling to its sounds** [O37][O13].
   - The target spelling is in red and underlined.
   - One column per sound, headed by the spelling, with one or two familiar words in each.
   - Then the sum-up. "If you have more than two sounds for a particular spelling, this is where you would create a third column."
2. **Lesson 10, Step 2: read and sort words by sound.** A pupil reads a word, decides its column, then everyone writes it saying the sounds. "Make sure students have time to decide the correct column." Sum up again at the end.
3. **Read it wrongly** (follow-up) [O37].
   - "Choose a word that only makes sense when read with the correct sound, such as 'most'."
   - Read it "the wrong way", ask "Does that make sense?", then re-read with the other sound.
   - A variation: the teacher pretends to read it wrongly "and to become confused because it 'doesn't make sense'. Ask the pupils to help you read it correctly." This is the demo in §3.1.
4. **Silly sentences** with two random target-spelling cards [O37]. We leave these out (writing).
5. **Speed read of a spelling unit's mixed words** (the Extended Code games book, 2019/2020): "How many words can the student read in 20 seconds?", over *speak, leak, each, steak, scream, feast, beach, team, stream, break, great, clean…* This is the sorting layout's pace (§2.5).
6. **The circle analogy** for pupils who struggle: "draw a circle on your board and … ask your students what it could be … a ball, a moon, a pizza" [O13].
7. **The PSC:** for nonsense words, "When a spelling can represent more than one sound, teachers should accept the alternatives within nonsense words" (*meast*, *strow*) [O11]. So a which-sound question only has one answer in a **real** word. Sound Detective never uses nonsense words as targets.

### 1.5 Rules we take from this

- **Vet the words for accent**, and "don't allow students to come up with their own words. If you do, your lesson will dissolve into chaos." [O13] Our pools are curated, and accent-variable words are tagged (§4.1).
- **Only use words that make sense one way** for reading out the alternatives (*most*, not *read*). This is our "try-safe" rule (§4.1).
- **Lesson 10 is short and repeated:** "a couple of times a unit – you don't spend 2 weeks on it", first in the current-unit part, then in review [O13][O60].
- **Say the sounds, then read the word,** always, including in a try.

---

## 2. The game: Sound Detective

### 2.1 In one paragraph

One spelling per game. Its petals, one for each sound the child has met, stand along the bottom with their pictures, and the spelling sits in a gold lens at the top. A word slides in under the lens, with its spelling in gold and a closed picture window above it. The child taps a petal to **try** its sound. The word's spellings light one at a time as their sounds play, with that petal's sound for the gold spelling, and then the word is read that way. If it's a real word, the window opens on its picture, the ninja powers up and kicks the word into that petal, and Sensei gives the model ("In this word, this is… /ae/"). If it isn't, the ninja tilts its head, and Sensei says "That's not a real word. Try it a different way." At the end the petals hold the words like Lesson 10's columns, and Sensei sums up: "The same spelling can sometimes be… /ee/ …and sometimes… /ae/."

**Why it is called Sound Detective.** Jonas's working name was "Which Sound?", but Sensei never says a game name with a question inside it, because it lifts like a question (TEACHER_SCRIPT §2.6). "Sound Detective" fits the house names (Sound Hunt, Sound Swap, Sound Dots), names the strategy of trying each possibility and checking, and gives us the lens.

### 2.2 The screen (stage 1280 × 720)

| thing | where | notes |
|---|---|---|
| Home, Hear it again | top-left, top-right | NavLayer, unchanged |
| **the lens** | top centre, 150 across | the spelling in Andika, gold letters in a gold ring (CSS, no new art). In the save's first game the circle from the analogy shrinks into it (§3.1) |
| **the word card** | under the lens, about 440 × 150 | the word in Andika 700. The fork spelling is gold with a gold underline; the other letters are ink. Each spelling lights as its sound plays, as the lit letters do in Sort (SOUND_DISPLAY A2: no petal over a letter) |
| **the picture window** | above the card's right half, 150 × 150 | a paper shutter, closed until the word is found; it opens on `pic_<word>` or, for a word with no picture, a sparkle. In the listening form it is open from the start |
| **the petals** | one row along the bottom, between the ninja and Help; 2–4 petals, each at least 150 × 220 (74 × 108 CSS px), 24 apart | the chart's shape and colour (`CHART_PETALS`), with their pictures. Each petal is one button (`aria-label="petal <p>"`). Found words stand inside it as small chips, like Sort's chests, so the petals are Lesson 10's columns |
| **the threads** | lens to each petal | faint gold lines, only during the introduction and the sum-up |
| the ninja | bottom-left | Sort's staging: power up during the sounds, a strike on the word (§2.6) |
| ▶ | the right column | the petals fill the bottom row, so Ready sits in the column, as in Sort |
| Help | bottom-right | unchanged |

Nothing moves at rest. Only the lens has a slow shimmer, and only while the child is thinking.

### 2.3 The try, and the two ways a word comes

**The try** is the heart of the game. It is Sounds~Write's "say the sounds and read the word", done with the tapped petal's sound for the fork spelling:
- **The sounds:** each spelling's pure sound (`public/a/p/<p>.mp3`), with the 250 ms gap of the slow words (`scripts/gen-slow-words.ts`). The gold spelling plays the tapped petal's sound. Each spelling on the card lights as its sound plays.
- **Then the word** (400 ms later):
  - a right try plays the word's own clip (`public/a/w/<word>.mp3`);
  - a wrong try plays a new generated clip, `try_<word>_<p>` (§3.7), the word as it would sound with that sound ("steek").
- A try takes about 2.5 s for a four-sound word. The child is invited to say the sounds along with it ("Tap it, and say the sounds with me").

**The reading form** is the default. The word is never said before a try, so the child reads it by trying.
- The first tap is the scored decision.
- Every tap is a try, so the strategy is always in the child's hands: a wrong try is useful information, never a failure.
- Only **try-safe** words appear in this form: words that make sense only one way, like the manual's *most* (§4.1).

**The listening form** is for words whose other readings are also real words (*sea*/*say*, *head*/*heed*, *meal*/*male*). Sensei reads the word first and asks the official question: "[sea] · In this word, what sound is this?" (the spelling pulses on "this"). The picture window is open from the start.
- A wrong petal plays its try, then: "That's a different word. Listen again… [sea]".
- This is Lesson 10's Step 2 when the teacher has read the card.
- At most a third of a play's items are listening items, or two thirds after a struggle (§2.4).

### 2.4 A play

| | first meeting of a spelling (a stone) | a later round (the second stone, review, the flower's gate) |
|---|---|---|
| introduction | the explicit discussion (§3.1 Beat 1). The circle is added at the save's first game and after a struggle | the sum-up form, one line (§3.2) |
| demo | Sensei's "read it wrongly" demo on the fork's demo word (§4.2) | the paw offers it (Show me again) |
| items | 5 you-do words | 4 (the flower's gate) or 8 (the sorting layout) |
| layout | case: one word at a time | case, or sorting when the fork is filling or full (§2.5) |

**Choosing the words** (`forkPool`, §8):
- Every sound shown gets at least one word.
- The newest sound gets one extra.
- Never more than two of the same sound in a row.
- The first you-do word is the easiest: try-safe, with a picture, and from the sound whose gem the child has read most.
- The last word is one the child is likely to get (end on success).
- No word twice in a play; prefer words not seen in Sound Detective for a week.
- Prefer picture words at a first meeting, because the window opening is the reward.
- After a struggle (the second-miss help on two of the first three items), the next play has more listening items and replays the circle.

### 2.5 The sorting layout (review)

The same scene and rules, at Sort's pace:
- Words drift down from under the lens, one at a time, and stop above the petals.
- The child taps a petal, and the try plays at a brisker gap (180 ms).
- 8 words, falling a little faster as the streak grows. It is timed, but never fails, as in Sort.
- The first time, one line: "This time, the words fall down. Tap the petal for each word." (`tv_sd_sort_frame`).

It is used for:
- the second round of a unit;
- Sensei's Challenge rounds;
- the flower's gate once the fork is filling or full;
- and, as a quick speed round of three words, in bosses.

This is the "Speed read: spelling < ea >" of the official games book, with sorting.

### 2.6 The ninja's moves

| moment | the ninja |
|---|---|
| a try is playing | the listening pose (`hero_*_listen`), ear cupped |
| each sound of a right try | Sort's power-up: each lit spelling sends a silent spark into its fists |
| a real word | the strike, by streak tier (Sort's pools: kick, punch, throw; later spin, flip), knocking the word into the petal. At a first-try right answer in tier 2+, a spell floats it in instead |
| a wrong try | the think pose (`hero_*_think`): a head tilt and a small shrug while "That's not a real word" plays. Never the hurt sprite, and nothing shakes |
| the petal gets its word | the petal "drinks" it (a small bloom) and its gem for this spelling glints (energy, §6.2) |
| the sum-up | the ninja bows (*rei*) to the lens |
| the circle (Beat 2) | the ninja watches the circle, then jumps when it becomes the pizza |

### 2.7 Errors and corrections

| the child | what happens | why |
|---|---|---|
| taps a wrong petal (reading form) | the try plays with that sound ("tay"); the window stays shut; the petal dims a little; "That's not a real word. Try it a different way." | Freshford's words and the manual's "read it wrongly"; the correction is the child's own try |
| taps a petal already tried | "We tried that one. Let's try a different petal." The untried petals wiggle | teaches trying each sound in turn |
| a second wrong try (3–4 petals) | Sounds~Write's TTE for a spelling read with its other sound: "This can be… /ae/ · …but in this word, it's… /ee/". The right petal glows: "Tap it, and say the sounds with me." The child taps, the right try plays, and the item counts as helped | the official script [O18][O13]; the turn goes back to the child |
| a wrong petal (listening form) | the try plays ("say"), then "That's a different word. Listen again… [sea]" | they heard the word, so the try is compared with it |
| a wrong try that makes a real word, in the reading form | can't happen: those words are listening-only (§4.1) | |
| taps a petal before the word has landed | ignored (`busy`) | |
| quiet for 8 s | the untried petals wiggle in turn: "Try any petal, and listen for the word." | |
| quiet for 16 s | the paw points at the first untried petal from the left, never at the answer: "Let's start with this one. Tap it when you're ready." | trying is the strategy; pointing at the answer would do it for them |
| quiet for 24 s | "Take your time, ninja." (existing) | |
| Help, press 1 / 2 / 3 | the 8 s line / the tried petals dim, "Look for a petal we haven't tried yet." / the TTE line and the glow | the idle ladder's levels (HelpLevel 1, 2, 3) |
| rapid taps (under `rapidMs`, with 2+ choices) | play on; the evidence is down-weighted (the core's guessing detector) | |

Never "No", "Wrong", a buzzer or red (TEACHER_SCRIPT §5.4).

---

## 3. The teacher script

Tables as in [TEACHER_SCRIPT.md](TEACHER_SCRIPT.md) §1:
- `tv_…` is a new line to record; a plain id is an existing clip.
- `<w>`, `<p>` and `<n>` mark generated families.
- Slots: /ee/ is a pure sound (at the end of a sentence), and [steak] is the word.
- Timings are estimates at Sensei's pace. A Year One child (5–6) has age 5's limits: 18 s of talk before the first action, and about 12 s for the longest run.

### 3.1 Full form: the save's first Sound Detective (< ea >, two petals: the w6-sd-ea stone)

**Beat 1: the frame, and the spelling's petals (the explicit discussion).** Run to the first tap: about 10.1 s.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_sd_frame | 0 s | the board arrives: the spelling < ea > drops into the gold lens at the top; the picture window is shut | This game is called Sound Detective. Some spellings can be more than one sound. | — | full |
| tv_sd_look_<n> (two) | 4.6 s | two petals rise and settle: /ee/ (tree) left, /ae/ (train) right; a faint gold thread runs from the lens to each | Look! This spelling is in two petals. | — | the first stone of each spelling |
| tv_sd_tap_each | 7.3 s | the left petal wiggles | Tap each petal to hear what this spelling can be. | taps the /ee/ petal | the first stone of each spelling |
| tv_sd_can_be · tv_sd_as_in_<w> (sea) | the tap | the petal swells on /ee/; a card "sea" (< ea > gold, its picture) flies out and sits on the petal; its thread glows | This spelling can be… /ee/ · …as in sea. | taps the /ae/ petal (it wiggles) | every time |
| tv_sd_or_can_be · tv_sd_as_in_<w> (great) | the tap | the /ae/ petal swells; "great" flies out | Or it can be… /ae/ · …as in great. | — | every time |
| tv_sd_or_even · tv_sd_as_in_<w> (bread) | a third (or fourth) petal's tap | that petal swells; its own picture (the loaf) glows, and no card flies out (A12: the petal's picture word is never a card on its own board) | Or it can even be… /e/ · …as in bread. | — | every time |

**Beat 2: the circle** (the save's first Sound Detective, and after a struggle). Run from the last circle tap to ▶: about 11.4 s (Beat 3 included).

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_sd_circle_look | straight after | a plain circle is drawn between the petals | Look at this circle. Tap it to see what it can be. | taps the circle | once per save; after a struggle |
| tv_sd_circle_ball | tap 1 | it becomes a ball and bounces once | It can be a ball! | taps | once per save |
| tv_sd_circle_moon | tap 2 | it becomes a moon | It can be a moon! | taps | once per save |
| tv_sd_circle_pizza | tap 3 | it becomes a pizza; the ninja jumps | It can be a pizza! | — | once per save |
| tv_sd_circle_so | straight after | the pizza turns back into the circle, which shrinks round the spelling as its lens | And a spelling can be different sounds, too. | — | once per save |

**Beat 3: the strategy** (Jonas's line: "We have to try the sounds and hear which one makes a real word.")

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_sd_strategy | straight after | the threads pulse to each petal in turn | When we read this spelling, we try each sound. Then we listen for the real word. | — | full; recap |
| tv_sd_ready_watch | 5.4 s | ▶ in the column | I'll show you one. Are you ready to watch? | taps ▶ | full |

**Beat 4: the demo.** This is the manual's "read it wrongly" variation: Sensei gets confused and the child helps. Runs: about 8.4 s and 7.7 s.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_sd_ido_try | after ▶ | the card "steak" slides in under the lens; the window is shut; the paw moves to the /ee/ petal | I'll try this sound first… /ee/ | — | full, recap |
| (the try) | the paw taps /ee/ | the ninja cups its ear; /s/ /t/ /ee/ /k/ light and play in turn; then the whole card lights | (sounds) · try_steak_ee "steek" | — | |
| tv_sd_ido_not | straight after | the think pose; the /ee/ petal dims a little | Hmm. That's not a word I know. | — | full, recap |
| tv_sd_ido_you (two petals) / tv_sd_ido_you_other (three or four) | straight after | the /ae/ petal wiggles | Can you try the other sound for me? / Can you try another sound for me? | taps the /ae/ petal | full, recap |
| (the try) · [steak] · tv_sd_real | the tap | /s/ /t/ /ae/ /k/ light and play; the window opens on a steak; the power-up | (sounds) · steak · That's a real word! | — | full, recap |
| tv_sd_so_petal | straight after | the ninja kicks the card into the /ae/ petal, where it stands | So it goes in this petal. | — | full, recap |
| tv_ready_go | straight after | ▶ and the paw | Do you want to have a go now? | taps ▶ (or the paw: the demo replays) | full |

**Beat 5: the turns.** Five words, for example *tea*, *leaf*, *break*, *clean* and *great*. The last is a listening item; the demo's *steak* is not reused. §3.3 has the lines for every turn.

**Beat 6: the wrap-up** (§3.4), then the trip to the World Flower (§7.3).

### 3.2 The other forms

**A new spelling in a known game.** The spelling's introduction is a teaching show, dosed by the spelling and not by the game (TEACHER_SCRIPT §2.2). So Beat 1's `tv_sd_look_<n>` · `tv_sd_tap_each` · the petal lines play at every spelling's first stone. The game's own frame, demo and Ready then follow the game's form.

**A spelling that has gained a petal** since the child last played it (< ea > after EC7). The new petal rises, a thread grows to it, and Sensei says:

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_sd_new_petal | 0 s | the old petals in place; a new one rises | Guess what? This spelling is in a new petal now. | — | once per spelling and new sound |
| tv_sd_or_even · tv_sd_as_in_<w> (bread) | 3 s | the new petal swells; its picture or card | Or it can even be… /e/ · …as in bread. | — | once per spelling and new sound |

**Recap** (a later day while `n < 2`; after 21 days; after a struggle):

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_sd_recap | 0 s | the lens and the petals arrive | It's Sound Detective again. We try each sound, and listen for the real word. | — | recap |
| tv_sd_can_be · /p1/ · t_or · /p2/ (· t_or · /p3/) | 4.5 s | each petal swells on its sound | This spelling can be… /ee/ · …or… /ae/ | — | recap, short |
| the demo (Beat 4, from `tv_sd_ido_try`) | | | | finishes the demo | recap |
| tv_sd_your_word | the first turn | | (§3.3) | | recap |

**Short** (`n >= 2`): `tv_sd_short` "Let's play Sound Detective again." · the sum-up form above · the turn. The paw offers the canonical demo (`tv_show_offer_short`, existing).

**The sorting layout's first time:** `tv_sd_sort_frame` "This time, the words fall down. Tap the petal for each word."

**From the World Flower's gate** (§7.4): `tv_sd_gate` "Let's play Sound Detective with this spelling." Then the short or recap form.

### 3.3 Turns, praise, corrections, idle

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_sd_your_word | the first two turns of a full or recap form | a card slides in ("tea"); the window is shut | Here's your word. Tap a petal to try its sound. | taps a petal | full, recap |
| (none) | later turns | the card slides in | — | taps | every time |
| (the try) · [tea] · t_in_this_word_this_is · /ee/ | a right try | the sounds light; the window opens; the strike into the petal | (sounds) · tea · In this word, this is… /ee/ | — | the model: the first two right answers of a play, then every third (the try itself models the rest) |
| tv_sd_praise_first | a right first try, at most every second right answer | | You knew which sound it was, straight away. | — | when due |
| (the try) · tv_sd_not_real | a wrong try, reading form | the window stays shut; the think pose; the petal dims | (sounds) · try_tea_ae "tay" · That's not a real word. Try it a different way. | taps another petal | every time |
| (the right try) · [tea] · tv_sd_praise_tried | right after a wrong try | the window opens | (sounds) · tea · You tried the sounds, and found the real word. | — | when due (it is the praise) |
| tv_sd_tried_that | a petal already tried | the untried petals wiggle | We tried that one. Let's try a different petal. | taps | every time |
| t_this_can_be · /x/ · t_but_in_this_word · /y/ · tv_sd_tap_glow | the second wrong try (3–4 petals) | the right petal glows; the paw points at it | This can be… /ae/ · …but in this word, it's… /ee/ · Tap it, and say the sounds with me. | taps; says the sounds | every time |
| [sea] · tv_sd_what_sound | a listening item | a card "sea", the window open | sea · In this word, what sound is this? | taps a petal | every time |
| (the try) · tv_sd_other_word · [sea] | a wrong petal on a listening item | the petal dims | say · That's a different word. Listen again… sea | taps | every time |
| tv_praise_kept_going | right after a helped answer (existing) | the biggest move | That was a tricky one, and you kept going. | — | when due |
| tv_sd_idle | 8 s quiet; Help press 1 | the untried petals wiggle in turn | Try any petal, and listen for the word. | — | every time |
| tv_sd_help_untried | Help press 2 | the tried petals dim | Look for a petal we haven't tried yet. | — | every time |
| tv_sd_idle_point | 16 s quiet | the paw points at the first untried petal from the left (never taps it) | Let's start with this one. Tap it when you're ready. | — | every time |
| tv_take_time | 24 s, once (existing) | | Take your time, ninja. | — | every time |
| fm_last_one | before the last word (existing) | | Here's the last one. | — | every time |

**Hear it again:**
- in a reading turn: the turn's instruction (`tv_sd_your_word` or `tv_sd_idle`), **never the word**, which is the answer;
- in a listening turn: the word and `tv_sd_what_sound`;
- during Beat 1: the petals' lines.

### 3.4 The wrap-up

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| t_same_spelling_sometimes · /p1/ · t_and_sometimes · /p2/ (· t_and_sometimes · /p3/) | after the last word | the threads light; each petal glows in turn with its stack of words | The same spelling can sometimes be… /ee/ · …and sometimes… /ae/ | — | every time (Lesson 10's sum-up) |
| tv_sd_done | straight after | the ninja bows to the lens | You found the right sound for every word. | — | every time |
| tv_sd_to_flower | a spelling's first stone, or one that gained a petal | ▶ | Let's show the World Flower what you found. | taps ▶ | per spelling |

### 3.5 The registry row, the map preview and new symbols

**`games.ts`:**

| Game id | Full | Recap | Short | Paw's canonical demo | Ready at |
|---|---|---|---|---|---|
| `detective` (mech `mech:basket-sort`, name "Sound Detective") | §3.1 | `tv_sd_recap` + the sum-up form + the demo + `tv_sd_your_word` | `tv_sd_short` + the sum-up form | the fork's demo word (§4.2), on its own pictures | column |

Other registry values:
- praise `tv_sd_praise_first`, `tv_sd_praise_tried`; wrap `tv_sd_done`;
- map preview `tv_map_next_detective`: "Next is a new game, called Sound Detective. Tap the glowing stone to play.";
- who does what, in one sentence: "We try each sound, and listen for the real word."

**New symbols** (the TEACHER_SCRIPT §2.5 table):

| Symbol | First seen | Explained by |
|---|---|---|
| the lens (the spelling in a gold ring) | the first stone | the circle shrinks into it ("And a spelling can be different sounds, too.") |
| the threads (spelling to petals) | the first stone | `tv_sd_look_<n>` "Look! This spelling is in two petals." |
| the picture window | the demo | it opens on "That's a real word!" |
| the sound line on the World Flower (§7.2) | the trip after the first stone | `tv_sd_mark_first` |
| the magnifying-glass gate (§7.4) | the fork panel, first time | `tv_sd_gate_first` |

### 3.6 Lines to record

**Single lines** (Sensei's voice; the house style of TEACHER_SCRIPT §2.4):

| line id | exact text |
|---|---|
| tv_sd_frame | This game is called Sound Detective. Some spellings can be more than one sound. |
| tv_sd_look_<n> (two, three, four) | Look! This spelling is in two petals. / …three petals. / …four petals. |
| tv_sd_tap_each | Tap each petal to hear what this spelling can be. |
| tv_sd_can_be | This spelling can be... |
| tv_sd_or_can_be | Or it can be... |
| tv_sd_or_even | Or it can even be... |
| tv_sd_circle_look | Look at this circle. Tap it to see what it can be. |
| tv_sd_circle_ball | It can be a ball! |
| tv_sd_circle_moon | It can be a moon! |
| tv_sd_circle_pizza | It can be a pizza! |
| tv_sd_circle_so | And a spelling can be different sounds, too. |
| tv_sd_strategy | When we read this spelling, we try each sound. Then we listen for the real word. |
| tv_sd_ready_watch | I'll show you one. Are you ready to watch? |
| tv_sd_ido_try | I'll try this sound first... |
| tv_sd_ido_not | Hmm. That's not a word I know. |
| tv_sd_ido_you | Can you try the other sound for me? |
| tv_sd_ido_you_other | Can you try another sound for me? |
| tv_sd_real | That's a real word! |
| tv_sd_so_petal | So it goes in this petal. |
| tv_sd_your_word | Here's your word. Tap a petal to try its sound. |
| tv_sd_what_sound | In this word, what sound is this? |
| tv_sd_not_real | That's not a real word. Try it a different way. |
| tv_sd_other_word | That's a different word. Listen again... |
| tv_sd_tried_that | We tried that one. Let's try a different petal. |
| tv_sd_tap_glow | Tap it, and say the sounds with me. |
| tv_sd_praise_first | You knew which sound it was, straight away. |
| tv_sd_praise_tried | You tried the sounds, and found the real word. |
| tv_sd_idle | Try any petal, and listen for the word. |
| tv_sd_help_untried | Look for a petal we haven't tried yet. |
| tv_sd_idle_point | Let's start with this one. Tap it when you're ready. |
| tv_sd_done | You found the right sound for every word. |
| tv_sd_to_flower | Let's show the World Flower what you found. |
| tv_sd_recap | It's Sound Detective again. We try each sound, and listen for the real word. |
| tv_sd_short | Let's play Sound Detective again. |
| tv_sd_new_petal | Guess what? This spelling is in a new petal now. |
| tv_sd_sort_frame | This time, the words fall down. Tap the petal for each word. |
| tv_sd_gate | Let's play Sound Detective with this spelling. |
| tv_sd_mark_first | Look! This spelling lives in two petals now. See the coloured line under it? It shows the sounds it can be. |
| tv_sd_gate_first | Tap the magnifying glass to play Sound Detective with it. |
| tv_map_next_detective | Next is a new game, called Sound Detective. Tap the glowing stone to play. |

That is 42 recordings, counting `tv_sd_look_<n>` as three. Existing clips reused:
- `t_this_can_be`, `t_but_in_this_word`, `t_same_spelling_sometimes`, `t_and_sometimes`, `t_in_this_word_this_is`, `t_or`;
- `tv_ready_go`, `tv_take_time`, `tv_praise_kept_going`, `tv_show_offer_short`, `fm_last_one`.

**Generated families:**
- `tv_sd_as_in_<w>` "…as in sea." One per explanation example word (§4.2): 3 for < ea >, about 35 for every fork.
- `try_<word>_<p>`: the blend of a wrong try, e.g. `try_steak_ee` "steek". Made with the word TTS in Southern British, from a respelling plus its IPA (`{ word: "steak", p: "ee", say: "steek", ipa: "stiːk" }`), and passed by the audio judge.
  - A take that the judge hears as a different real word is rejected. That word then becomes listening-only.
  - Folder: `public/a/try/<word>_<p>.mp3` (a new folder, so it can't collide).
  - About 20 clips for < ea > (both petals' words, then again for /e/ after EC7); about 300 for all the forks in §4.2.
- No new pure sounds: tries splice the existing `public/a/p/*.mp3` with the slow-word gap.

---

## 4. Words and pictures per spelling

### 4.1 The rules for a fork's pool

`forkPool(g, sounds)` (§8) returns `{ word, answer, mode }`. A word is in the pool only if:
1. **it is one syllable** (v1; two-syllable listening items come with the polysyllabic strand, §11 D7);
2. **it is decodable** with the spellings the child knows (`knownNow()`, as `trialPool` does);
3. **the fork spelling occurs exactly once,** and it is the only place the word could vary (the validator's sort-single-occurrence rule);
4. **it is not a homograph:** *read, tear, live, lead, wind, bow, row, sow, close, use, does, dove, wound*, and any word coded two ways in the content (`tear` is both EC20 /air/ and EC49 /eer/);
5. **it is not the icon word of a petal on this board** (`iconWordOf(p)` for every petal shown; SOUND_DISPLAY A12). The petal's picture is used as the *explanation* example instead, when its word has the fork spelling for that sound. Examples:
   - today: /e/ bread, /ou/ mouse, /o/ wasp, /u/ love, /a/ apple, /j/ giraffe, /g/ ghost, /ch/ chick, /k/ anchor, /ue/ news;
   - after the petal-art change (DECISIONS, 27 Sep): /oo/ balloon, /ie/ pie, /j/ genie, /i/ biscuit, /z/ desert.
6. **it is try-safe for the reading form:** for every other petal on the board, reading the word with that sound gives no real word a child might know. The manual's "a word that only makes sense when read with the correct sound, such as 'most'" [O37]. Words that fail stay in the pool as **listening** items.
7. **no try is rude or unkind.** `count` tried with /u/, and `gap` tried with /j/, are never generated, so those words are never in a pool. Other examples: `cake` tried with /a/ (British slang), `cack`. The `TRIES` table carries a `rude` flag, checked by the judge.
8. **accent-variable words are listening-only:**
   - /uu/ in *book, cook, hook, look, took, shook* (northern /oo/);
   - *roof*, *room* and *broom*;
   - the /ue/ yod (*new*, *stew*).
   Sensei's Southern British reading decides the answer. A northern child would otherwise hear their own word from the "wrong" petal. Once a grown-ups accent setting exists, "northern" accepts both petals for tagged words.

Try-safety depends on which petals are shown, so it is judged per word and per petal set. It must be re-judged when a fork gains a petal:
- *log* is safe against /oe/ ("loag"), but not against /u/ ("lug").
- *bone* is safe against /o/, but not against /u/ ("bun").

The marks in §4.2 were checked by hand and are a starting point. The `TRIES` table and its judge settle them (§8).

### 4.2 The forks, with their words

Key:
- **+** marks a word with a picture (`public/a/i/pic_<word>.webp`);
- *new* is a word the content files don't have yet;
- words not marked + have no picture, and many can't have one (*great*, *deaf*).

**< ea >** (EC3; /ee/ /ae/, then /e/ from EC7). Demo: *steak*, which tries /ee/ first ("steek").

| sound | petal (icon) | explanation example | reading form (try-safe) | listening only (another reading is a real word) |
|---|---|---|---|---|
| /ee/ | tree | sea | leaf+, beach+, tea+, dream, clean, speak, cream, peach (*new*) | sea (say), meal (male), team (tame), eat (ate), seat (set), bean (Ben), sneak (snake), treat, pea (pay) |
| /ae/ | train | great | steak+ (the demo), break | great (greet) |
| /e/ (EC7) | bread (the petal's own picture, the example) | bread | thread, deaf, health, dread, meant | head (heed), sweat (sweet); bread is the icon |

The reading-form words stay safe with all three petals: *leaf*/"lef", *beach*/"bech", *dream*/"drem", *break*/"brek". Pictures to make: **thread, peach, head, pea**.

**< o >** (EC5; /o/ /oe/, then /u/ from EC14). Demo: *frog*, which tries /oe/ first ("froag"). /oo/ (*do, to*) is in the explanation only until EC36's *move, prove* (§11 D14).

| sound | petal (icon) | example | reading form | listening only |
|---|---|---|---|---|
| /o/ | wasp | hot | frog+, fox+, box+, pond+, shop+, top+, mop+; with two petals also log+, dog+ | pot (put, from EC14), cot (coat), sock (soak, suck), clock (cloak), hop (hope), not (note), rod (rode), doll (dole) |
| /oe/ | boat | no | gold, post, rope, both; with two petals also bone+, hole+, mole+, stone, home | cone+ (con), joke (jock), most (must, from EC14) |
| /u/ (EC14) | love (the example) | love | son, won, some, glove (*new*) | come (comb), done (don), ton (tone) |

Pictures to make: **gold, rope, stone, glove**.

**< ow >** (EC9; /ou/ /oe/). Demo: *snow*, which tries /ou/ first ("snau"). Freshford's own example is *brown*.

| sound | petal | example | reading form | listening only |
|---|---|---|---|---|
| /ou/ | mouse | cow | cow+, owl+, brown, frown, growl, down, gown (*new*) | now (no), how (hoe), town (tone), howl (hole), clown+ (clone), crowd (crowed), crown+ (crone) |
| /oe/ | boat | snow | snow+, crow+, blow, grow, glow, slow, throw, show, flow | bowl+ (bowel); never bow, row, sow |

Pictures to make: **frown, gown, town**.

**< oo >** (EC13; /oo/ /uu/). Demo: *spoon*, which tries /uu/ first. Both petals' pictures are the examples (moon, soon balloon; book).

| sound | petal | example | reading form | listening only |
|---|---|---|---|---|
| /oo/ | moon → balloon | moon / balloon | spoon+, hoop+, boot, zoo, food, soon, stool, goose+ | pool+ (pull); broom+, roof+, room (accent) |
| /uu/ | book | book | foot+, good | wood (wooed); hook+, cook, took, shook (accent) |

Pictures to make: **boot, stool, wood**.

**< ou >** (EC15; /ou/ /u/ /oo/, then /oe/ from EC32). Demo: *house*, which tries /oo/ first ("hoose").

| sound | petal | example | reading form | listening only |
|---|---|---|---|---|
| /ou/ | mouse (the example) | mouse | house+, mouth+, out, round, sound, ground, pouch | cloud+ (clued), shout (shoot), found (fund), proud (prude), loud (lewd). **Never *count*** |
| /u/ | love | young | touch, young | double, trouble (two syllables: later) |
| /oo/ | moon → balloon | soup | soup+, group | you (yow) |
| /oe/ (EC32) | boat | mould | mould | soul (sole) |

Pictures to make: **pouch**.

**< s >** (EC17; /s/ /z/). Demo: *his*, in the listening form ("hiss" is a real word). The /s/–/z/ difference at the end of plurals is subtle, so this fork leans on listening items.

| sound | petal | example | reading form | listening only |
|---|---|---|---|---|
| /s/ | circle | cats | tents+, cats, caps, ducks, socks, bricks, yes | bus+ (buzz) |
| /z/ | zebra → desert (s = /z/: the example, after the art change) | dogs | dogs, pigs, beds, bags, legs, has, is | his (hiss), hens (hence) |

Pictures to make: plurals. These are **cheap**: two copies of the singular picture in one frame (dogs, pigs, hens, beds, bags, cats, caps, ducks, socks), so no new art is needed.

**< ew >** (EC22; /oo/ /ue/). Demo: *flew*, which tries /ue/ first ("flyoo").

| sound | petal | example | reading form | listening only |
|---|---|---|---|---|
| /oo/ | moon → balloon | blew | chew, flew, drew, grew, blew, threw, crew, screw (*new*) | |
| /ue/ | news (the example) | news | stew+, few, new | dew (do) |

Pictures to make: **screw**.

**< a >** (EC26; /a/ /o/ /ae/ /ar/, plus /or/). Demo: *watch*, which tries /a/ first. This is the hardest fork: with consonant + e, many /a/ words have a real /ae/ reading (*mat*/*mate*, *tap*/*tape*, *can*/*cane*).

| sound | petal | example | reading form | listening only |
|---|---|---|---|---|
| /a/ | apple (the example) | apple | crab+, lamp+, hand+, sand+, jam+ | mat (mate), hat (hate), tap (tape), cap (cape), can (cane), man (mane), van (vane), flag (flog), ant (aunt), stamp (stomp), cat (Kate, cot, cart) |
| /o/ | wasp (the example) | wasp | watch+ (the demo), swan, wand, swap, want, wash | was, what |
| /ae/ | train | cake | grape (*new*), spade (*new*), whale+, game, name | gate+ (got), cave (carve), plane (plan), snake (snack), lake (lack). **Never *cake*** (cack) |
| /ar/ | car | father | none in one syllable outside the accent-dependent words | father, banana (two syllables: later) |
| /or/ | corn | water | none until *ball, tall, wall* are coded < a > + < ll >, as Walker and the manual do (§4.3) | water (two syllables) |

Pictures to make: **grape, spade, swan, wand**, and later apron, father, baby.

**< y >** (EC31; /y/ /ie/, with /i/ and /ee/ in the explanation). Demo: *cry*, which tries /i/ first ("cri"). At EC31 /i/ has one decodable word (*myth*); *gym* comes at EC37 and *hymn* at EC42. /ee/ is only in two-syllable words (*happy*). So v1 plays /y/ against /ie/ and explains /i/ and /ee/.

| sound | petal | example | reading form | listening only |
|---|---|---|---|---|
| /y/ | yo-yo (the example) | yo-yo | yak+, yes, yell, yum, yet, yap, yard, yawn | |
| /ie/ | kite → pie | cry | cry, dry, spy | fly (flee), try (tree), my (me), by (bee), shy (she), sky (ski) |
| /i/ | build → biscuit | myth | myth (and gym from EC37) | hymn (EC42) |
| /ee/ | tree | happy | (two syllables: later) | happy, puppy, teddy |

Pictures to make: **fly, cry, spy**, and later puppy, teddy.

**< g >** (EC39; /g/ /j/). Demo: *gem*, which tries /g/ first. It is lovely here, because gems are the game's treasure.

| sound | petal | example | reading form | listening only |
|---|---|---|---|---|
| /g/ | ghost | gum | goat+, gate+, girl+, gift+, frog+, pig+, wig+, flag+, mug+, hug+, glue+, gum (*new*) | bag (badge), leg (ledge), log (lodge), jug (judge), got (jot), get (jet), goose+ (juice). **Never *gap*** |
| /j/ | giraffe → genie (the example) | giraffe / genie | gem (*new*), germ, gym | giant, magic, ginger (two syllables: later) |

Pictures to make: **gem, germ, gym, gum**.

**< gh >** (EC41). **Explanation only:**
- *ghost*, the /g/ petal's own picture, can't be a card;
- *ghoul* and *ghee* try to real words (*fool*, *fee*);
- only *laugh* and *trough* are try-safe for /f/.

The fork panel shows *cough* and the ghost.

**< ch >** (PSC, Year 1; /ch/ /sh/ /k/). The stone waits for content: /sh/ has only *chef*, and /k/ only *school*.

| sound | petal | example | reading form | listening only |
|---|---|---|---|---|
| /ch/ | chick (the example) | chick | chest+, bench+, lunch | chip (ship), chin (shin), chop (shop), much (mush), chair+ (share), chain+ (Shane), rich (Rick), beach+ (beak), chalk+ (cork). *church* has the spelling twice (rule 3) |
| /sh/ | ship → shell | chef | chef (*new*) | parachute, machine (later) |
| /k/ | anchor (ch = /k/: the example) | anchor | school+ (from EC45; tangential from EC10) | Christmas, echo (later) |

Pictures to make: **chef**, and later parachute.

**Review-only forks** (no stone; §5.3): < i > (/i/ /ie/: reading *bike*+, *five*, *line*, *nine*, *kind*; *kite*+ is the /ie/ icon today; listening only *lime*+ (limb), *child* (chilled), *hide* (hid), *bite* (bit), *ride* (rid), *time* (Tim)), < e >, < u >, < ie >, < ey >, < ear >, < or >, < ar >, < al >, < ue >, < ui >, < se >, < ough >, < our >, < ed >, < ss >, < wh >, < c >, < ere >, < au >. Each plays when it has at least two words per sound shown, and otherwise it is explanation only.
- < se > is a good small one: /s/ *house*+, *horse*+, *goose*+, *purse*+ against /z/ *nose*, *rose*, *cheese*, *please*. The last four are new pictures, and they are pictureable.
- **Explanation only** (`game: "explain"`): < th > and < n > (/n/ /ng/) (§11 D6), < gh >, < ai > (*said* only), and < gg >.

### 4.3 Content problems found on the way

These are for the content lane, not changed here.

1. **The Bridging Unit file miscodes 11 words that need Extended Code spellings.** Each word has the right coding in a later file:

   | word | coded in BR.ts | should be |
   |---|---|---|
   | park | `p.a.r.k` | `p.ar.k` |
   | shark | `sh.a.r.k` | `sh.ar.k` |
   | watch (also IC11.ts) | `w.a.tch` | `w.a=o.tch` |
   | paw | `p.a.w`, tagged `sort:w` | `p.aw=or` |
   | jaw | `j.a.w` | `j.aw=or` |
   | lawn | `l.a.w.n` | `l.aw=or.n` |
   | wall | `w.a.ll` | `w.a=or.ll` |
   | corn | `c.o.r.n` | `c.or.n` |
   | howl | `h.o.w.l` | `h.ow=ou.l` |
   | drive | `d.r.i.ve` | `d.r.i=ie.ve` |
   | dive | `d.i.ve` | `d.i=ie.ve` |

   None of them is decodable at the Bridging Unit. As coded, a child would sort *paw* as a < w > word and read *drive* as "driv". *dove* is also coded `d.o.ve` with < o > as /o/: the bird is /u/, it is the /v/ petal's own picture, and it is a homograph. Found with the script in `playtest/runs/flower-v2/multi-sound/`.
2. ***ball, tall, wall, small, all, call, fall*** are coded `al=or` + `l` in EC19. `sw.ts`'s own EC19 note says Walker and the manual code *ball* and *tall* as < a > + < ll >, keeping < al > for *chalk* and *talk*. The Sounds~Write coding gives < a > its /or/ petal with good picture words (ball, wall).
3. **`src/core/content/unit-data.ts` imports IC1–EC26 only.** The files EC27–EC49 exist on disk, but the core's curriculum can't see them.
4. **Hazard words** for tries (§4.1 rule 7) and homographs (rule 4) should become validator rules (VALIDATOR_RULES 9 covers dictation homophones, not tries).

---

## 5. Where it goes, and how often it comes back

### 5.1 The stones, in Sounds~Write order

A fork's stone comes **after the level that teaches its second sound, plus one more level** of that sound unit: Sounds~Write's "second week of the sound unit before it" (the Handbook; 07.2024 timeline) [O1][O239]. For a one-week unit it comes straight after the teaching level. The **hard constraint**, alongside the planner's "no sorts before the Bridging Unit": no Sound Detective before EC3's two sounds are taught (concept 4), except explanations.

| Stone (the id takes the land's number when built) | Fork | Petals | After | Land (SOUNDS_WRITE_MODEL §6.1) |
|---|---|---|---|---|
| sd-ea | < ea > | /ee/ /ae/ | EC2's teaching level + 1 | Sky Temple (EC1–5) |
| sd-o | < o > | /o/ /oe/ | EC4's teaching level + 1 | Sky Temple |
| (reprise) | < ea > gains /e/ | + /e/ | EC7's teaching level (one week) | Coral Coast (EC6–9) |
| sd-ow | < ow > | /ou/ /oe/ | EC8's teaching level (one week) | Coral Coast |
| sd-oo | < oo > | /oo/ /uu/ | EC12 + 1 | Moon Marsh (EC10–15) |
| sd-ou | < ou > | /ou/ /u/ /oo/ | EC14 + 1 (the < o > reprise, + /u/, comes with it as a review round) | Moon Marsh |
| sd-s | < s > | /s/ /z/ | EC16 + 1 | Autumn Orchard (EC16–22) |
| sd-ch | < ch > (PSC) | /ch/ /sh/ /k/ | Year 1 summer, before the June PSC: after EC19 + 1, once it has content (§4.2) | Autumn Orchard |
| sd-ew | < ew > | /oo/ /ue/ | EC21 + 1 | Autumn Orchard |
| sd-a | < a > | /a/ /o/ /ae/ (+ /ar/ /or/ later) | EC25's teaching level (one week) | Star Dunes (EC23–26) |
| sd-y | < y > | /y/ /ie/ (+ /i/ /ee/ explained) | EC30's teaching level (one week) | Island of Echoes (EC27–34) |
| sd-g | < g > | /g/ /j/ | EC38 + 1 | Crystal Caves (EC35–42) |
| (< gh >: explanation only) | < gh > | /f/ /g/ | the flower trip after EC40's level | Crystal Caves |

Each stone is a `Level` of kind `"detective"`, with `detective: { g, layout: "case" }`. Its `units` are its words' units. A stone whose fork has fewer than two playable petals, or fewer than two pool words per petal, **isn't placed** (§10 T5).

### 5.2 In today's game: v1 is < ea >

Today's content ends at "unit 12" (the Sky Temple). Only < ea > can be played, and only after two content changes:
- **w6-1 teaches < ea > as /ae/ too** (`teach: ["ai", "ay", "ea=ae"]`), as EC1 does.
- **The live word list gets the < ea > words.** The game reads `phonics.ts` `WORDS` (units 1–12). The words are already coded in `src/content/units/EC1.ts`–`EC7.ts`, which the game doesn't read yet: *steak*+, *great*, *break* (as `s.t.ea=ae.k` …) and *clean*, *speak*, *cream* for unit 12. *leaf*, *beach*, *tea*, *sea*, *dream*, *eat* and *seat* are there already.

Then:
- **`w6-sd-ea`** goes after `w6-4` (the /ee/ sort of < ee > and < ea >: EC2's second week);
- **`w6-sd-ea2`** (the sorting layout, 8 words) goes before the boss, after `w6-9`.

< ow > as /ou/, < o > as /oe/ and < i > as /ie/ aren't in the game yet (the Sky Temple teaches < ow > only as /oe/), so their stones come with those units.

< th > (IC11) already sits in two petals. It gets the sound line and the fork panel's explanation ("The same spelling can sometimes be /th/ in moth, and sometimes /dh/ in this", the existing `sameSpelling`), with no gate (§11 D6).

### 5.3 How often it comes back

Lesson 10 is "used a couple of times a unit", taught first in the current-unit part and then reviewed [O13][O60]. So:

1. **The stone** (full form, 5 words).
2. **The second round, in the same unit**, 2–4 levels later: the sorting layout, 8 words (`sd-<g>2`). Until the planner drives sessions, this is a stone.
3. **Due-based review:**
   - A fork's round sets its next due date by a ladder of 1, 3, 7, 14 and 30 days.
   - A round with at least 80 % first-try right moves one step up; under 50 % goes back to 1 day; anything else stays.
   - A due fork gets a 3-word round in the next **Sensei's Challenge** (`makeReview`), and its sound line's segments glint once on the next World Flower visit. It has no badge: nothing nags.
   - Once every met sound is sure, the fork comes back every 30 days.
4. **Bosses** (the land's progress check): 2 which-sound items per fork taught **four or more units back**, the Extended Code quizzing lag [Quizzing].
5. **Reprise:** when a fork gains a petal (< ea > + /e/ at EC7; < o > + /u/ at EC14; < ou > + /oe/ at EC32; < y > + /i/ at EC37), its next round starts with `tv_sd_new_petal`, and the flower trip shows the new thread.
6. **Review-only forks** (§4.2) join Sensei's Challenge once they are playable, from the unit that completes their second sound. The same ladder applies.
7. **The child's own choice:** the World Flower's gate (§7.4), any time.

**When the core drives** (ARCHITECTURE stages 4–7):
- The fork's KCs (`gpc:<g>><p>:read` for each met sound, and `concept:4`) are scheduled by the planner's `due()` like any other KC.
- Sound Detective becomes the review-block provider for Lesson 10 (sw.ts `SESSION`: the Extended Code review includes L10).
- The ladder above is the fallback until then.

---

## 6. Progress: per gem, and per spelling

### 6.1 The fork measure (v1, in the save)

For each fork `g` and each **met** sound `p` (a sound whose gem `g>p` is met: `isMet(gemState(...))`):
- **A scored decision** is:
  - in the reading form, and
  - on the child's own turn: not the demo, not a helped answer, not a first meeting's first turn (TEACHER_SCRIPT: only the you-do counts; sw.ts `MASTERY_CONFIG.scoredPhases`), and
  - on the first petal tapped for that word.
  A listening item is practice: it charges the gem but doesn't score the fork.
- **sure(g, p)**: the last three scored decisions on `p`-words were all right, and they came from at least two sessions. A wrong scored decision on a `p`-word resets `p`'s run.
- **The fork's state:**

  | state | when | the look (§7.2) |
  |---|---|---|
  | none | fewer than two met sounds | no sound line |
  | outline | two or more met, none sure | faint segments |
  | filling | some sure | the sure segments solid in their petals' colours |
  | full | every met sound sure | all solid, with one glint the first time |

- **Gaining a petal** sends a full fork back to filling (the new segment starts faint).
- **Nothing fades visually.** A fork that is due just comes back in review. A wrong answer there un-sures that sound's segment (§11 D8).

### 6.2 The gem link (a proposal for `progress.ts`)

Jonas asked for "a measure of progress towards mastery" in each gem. For gems whose spelling is a fork, knowing the spelling includes choosing its sound, so:
- **Energy** (today's gem fill): a Sound Detective answer charges the answer's gem `g>p`:
  - +1 for a scored right answer;
  - +0.5 for a listening or helped right answer;
  - −0.25 for a wrong scored decision on it.
  The wrongly chosen gem is never charged down: tapping /ae/ on *tea* is a /ee/-word error.
- **The gem's last step:**
  - Whatever `progress.ts` computes for a gem's progress (gem fill), a gem whose spelling is a fork in the `outline` or `filling` state **stops at 80 %** until `sure(g, p)`.
  - So *ea>ae* completes when the child can read, spell **and choose** it.
  - The petal card says so once: the fork panel's line, §7.4.

### 6.3 In the learner model (for when the core is wired)

The core is **built but not wired**: `src/core` has a tested learner (BKT with forgetting) and a ledger, and nothing in the game imports it. The mapping is ready:

| Sound Detective | core |
|---|---|
| a reading item | `SwActivityId` `"alternative-reading"` (L10, L4; phoneme manipulation; its adaptation text is already "try the spelling's sounds until the word makes sense") |
| a listening or sorting item | `"spelling-sort"` (L10), `SpellingSortItem { spelling, sounds, word, segs, answer }`, plus a `mode: "read" \| "listen"` field |
| the evidence | `evidenceFor`: target `gpc:<g>><answer>:read`, component `concept:4` (already in `core/content/evidence.ts`); mechanic `mech:basket-sort` (the petals are baskets) |
| a wrong first try | `Evidence.errors: ["alternative-sound"]` (the TTE type that the correction script uses) |
| the fork's state | derived from the ledger's scored attempts, as in §6.1; not a new KC |
| the teaching show | `TeachMoment` `{ m: "same-spelling" }` (exists), dosed by the idea `concept:4` and by spelling |

---

## 7. The World Flower link

The flower's look belongs to the flower spec (`docs/SCROLL_DESIGN.md`, v2). This section is the **contract**, with a recommended look that keeps the chart quiet (Jonas: v1 was "a bit busy").

### 7.1 What counts

A spelling is shown as multi-sound on the flower when **two or more of its sounds are met** and it is a fork with `game` ≠ `"none"`. < x > and < u > after < q > never count (`isWayToSpell()`; §11 D6). The state is `forkProgress(g).state` (§6.1).

### 7.2 The sound line (on the chart and the card)

- **Where:** under the spelling's letters, in every petal the spelling appears in. It adds no column and no mark beside the letters. A thin line (3 stage px on the sheet, 6 on the card) is split into one segment per met sound, in that sound's petal colour (`CHART_PETALS.colour`; /or/'s ink reads as bronze, as for its jewel).
- **The states:**
  - outline: the segments dashed, at 45 % opacity;
  - filling: the sure segments solid;
  - full: all solid.
  The segment for *this* petal's sound comes first, so *ea* in the /ee/ petal reads orange first.
- **It reads at a glance.** "This spelling has these colours" shows that it lives in other petals, and how solid the line is shows how well the child knows it.
- **On the radial flower** there is nothing at rest. During a fork trip (§7.3), gold threads arc between the petals that share the spelling, and the spelling floats at the arc's middle.

### 7.3 The trip

After a fork's first stone, or a reprise, the child goes to the World Flower with a new `FlowerVisit`: `{ kind: "fork"; g: string; grew?: PhonemeId }`. Its visit id is `fork:<g>`, or `fork:<g>:<p>` for a new petal.
- **The radial flower:** the fork's petals light in turn, each on its sound, and the threads arc between them.
- **The chart:** the sound line draws itself under the spelling in each petal.
- **Sensei:** `tv_sd_mark_first` (once per save): "Look! This spelling lives in two petals now. See the coloured line under it? It shows the sounds it can be."
  - Later forks: the existing `sameSpelling` explanation ("The same spelling can sometimes be… /o/ …in hot, and sometimes… /oe/ …in no.").
- **Back from a flower-gate game:** `{ kind: "detected"; g; from }` animates the segments that became sure.

### 7.4 The fork panel and the gate

The petal card (SCROLL_DESIGN's card) already selects a spelling when it is tapped. For a fork spelling it adds a **fork panel** to Sensei's explanation:
- **The spelling** big, with its petals (the met ones) around it as mini petals with their pictures, joined by threads, and one example word card per petal (§4.2's examples).
- **The sound line,** at card size.
- **Sensei** gives the explicit discussion in short form: `tv_sd_can_be` · /ee/ · `tv_sd_as_in_<w>` … (§3.1's petal lines, the child doesn't have to tap). The first time, add: "When we read this spelling, we try each sound. Then we listen for the real word." (`tv_sd_strategy`).
- **The gate:** a **magnifying glass** (the game's own lens, gold), at least 104 stage px, next to the sound line. It is not a green arrow: Jonas couldn't tell what v1's green play button did, and this one looks like the game it starts. The first time it shows: `tv_sd_gate_first` "Tap the magnifying glass to play Sound Detective with it."
  - A tap runs `makeDetective(g, { n: 4 })`: the case layout while the fork is outline, the sorting layout when it is filling or full.
  - The game ends with the `detected` trip back to this card.
- **No gate** when the fork is `game: "explain"` (< th >, < n >, < gh >, < ai >, < gg >), or when the pool is too small (§10 T5). Sensei explains only.

---

## 8. The contract for the builders

This is a spec, not code; the lanes build it. New pure modules sit beside `src/content/flower.ts` and `src/engine/gems.ts`. Existing files are changed only by their owners.

```ts
// src/content/forks.ts (new, pure; tests in src/content/forks.test.ts)
export type ForkGame = "stone" | "review" | "explain" | "none";
export interface ForkSound { p: PhonemeId; unit: SwUnitId; example: string /* "…as in sea." */ }
export interface Fork {
  g: string;                      // the spelling ("ea")
  sounds: ForkSound[];            // teaching order; the icon word when it has the spelling for that sound
  lesson10?: SwUnitId | "PSC";    // EC3 … EC41, or "PSC" for < ch >
  game: ForkGame;
  demo?: string;                  // the canonical demo word ("steak"), try-safe, with a picture
  note?: string;
}
export const FORKS: Fork[];       // §1.2, derived from sw.ts gpcsOfUnit() and checked against it in tests
export interface Try { word: string; p: PhonemeId; say: string; ipa: string; real: boolean; rude?: boolean; judged: boolean }
export const TRIES: Try[];        // generated, then judged (real / rude / accent); the source of try-safety
export function forkOf(g: string): Fork | undefined;
export function metForkSounds(g: string, s?: Save): PhonemeId[];              // via gemState / isMet
export function forkPool(g: string, sounds: PhonemeId[], s?: Save):
  { word: Word; answer: PhonemeId; mode: "read" | "listen" }[];               // §4.1 rules 1–8
export function forkProgress(g: string, s?: Save):
  { met: PhonemeId[]; sure: PhonemeId[]; state: "none" | "outline" | "filling" | "full"; due: boolean };
export function playableForks(s?: Save): string[];                          // ≥ 2 petals with ≥ 2 pool words each
```

Engine (the owners of `gems.ts` and `store.ts`):
- `makeDetective(g, { layout, n })` returns a one-off `Level` of kind `"detective"`, like `makePractice`, and `detectiveOf(level)`.
- `recordWhich(word, g, answer, chosen, { scored, mode, help })`:
  - charges and bumps as in §6.2;
  - updates `sd`;
  - adds the word sticker on a right answer;
  - calls `attempted(ok)` only for scored decisions, because a wrong try is a strategy, not an answer.
- Save additions:
  - `sd?: Record<g, Record<p, { n: number; ok: number; run: number; sessions: number[]; last: number }>>`;
  - `sdDue?: Record<g, { at: number; step: number }>`.
- `FlowerVisit` additions: `{ kind: "fork"; g; grew? }` and `{ kind: "detected"; g; from }` (§7.3). `flowerVisitAfter()` returns `fork` after a fork's first stone or a reprise.

Content:
- `LevelKind` adds `"detective"`, and `Level` adds `detective?: { g: string; layout?: "case" | "sort"; n?: number }`.
- `worlds.ts` gets w6-1's `ea=ae` and the stones `w6-sd-ea` and `w6-sd-ea2` (§5.2).
- `games.ts` gets the registry row (§3.5); `lines.ts` gets §3.6.
- New pictures (§4.2):
  - for v1: **thread, peach, head, pea, ball, pizza**. Moon exists; ball and pizza are for the circle.
  - later: the rest of §4.2's lists.

The scene: `src/scenes/Detective.tsx`, reusing Sort's falling word, strike and chip stacking, with `src/styles/detective.css`. Deep link: `?detective=ea` (as `?practise=ai>ae`), for the sweep.

---

## 9. The bot contract (`window.__snState`)

Every scene publishes the answer it is waiting for (docs/TREADMILL.md). Sound Detective publishes:

```ts
window.__snState = {
  scene: "detective",
  g: "ea",                          // the spelling
  petals: ["ee", "ae"],             // the petals on screen, left to right
  layout: "case" | "sort",
  phase: "frame" | "petals" | "circle" | "strategy" | "demo" | "ready" | "turn" | "try" | "reveal" | "sumup" | "done",
  next: "ae" | "circle" | null,     // what to tap now: a petal's sound (its button is [aria-label="petal ae"]),
                                    // the next petal to open in "petals", "circle" during the circle; null otherwise
  wrong: ["ee"],                    // the petals on screen that aren't the answer (for trier bots)
  word: "steak" | null,
  mode: "read" | "listen" | null,
  tried: ["ee"],                    // petals tried on this word, in order
  firstTry: true | false | null,    // null until the first tap
  i: 2, of: 5, last: false,
  busy: boolean,                    // a try, the demo or a line is playing; taps are ignored
  streak: number,
  hint: 0 | 1 | 2 | 3,              // the help level reached on this word
};
```

- **Targets:**
  - petals are `button[aria-label="petal <p>"]` (the same label as the flower's petals, in a different scene);
  - the circle is `[aria-label="circle"]`;
  - ▶ goes through `window.__snNav` as usual.
- **`bot.ts` `step()`:** `if (st.scene === "detective" && st.next && !st.busy) return down(st.next === "circle" ? '[aria-label="circle"]' : `[aria-label="petal ${st.next}"]`)`.
  - A **trier** persona taps `st.wrong[0]` first on every third word, and once taps a petal it already tried. This exercises the try, `tv_sd_tried_that` and the TTE glow.
- **The first check** (`useFirstCheck`) only runs on a school start point's first lessons, and a Sound Detective level is never one of those. Its `next` is the sound id and its buttons are `petal <p>`, following Sort's `basket <g>`.
- **Transcripts:**
  - a try is an utterance with `purpose: "try"`, and its parts are the sounds and `try_<word>_<p>`;
  - the flower's fork trip publishes `{ scene: "tree", visit: "fork", … }` through the existing Tree state;
  - the fork panel adds `fork: "<g>"` and `gate: boolean`.

---

## 10. Acceptance

**Tests** (`src/content/forks.test.ts`, bun test, no browser):
- **T1.** `FORKS` covers every spelling with two or more sounds in `gpcsOfUnit()` over `SW_SEQUENCE`, with each sound's first unit.
  - The 11 official spelling units have `lesson10`, and < ch > has `"PSC"`.
  - < x > is absent. < u > has no /w/ sound.
  - < th >, < n >, < gh >, < ai > and < gg > are `"explain"`.
- **T2.** For every playable fork and every petal set it reaches, every `forkPool` word:
  - is one syllable and decodable with the child's known spellings at that unit;
  - has the fork spelling exactly once;
  - is not a homograph, and not the icon word of any petal shown;
  - is `"read"` only if every other petal's `Try` has `real: false` and no try is `rude`.
  - *count* and *gap* are in no pool, and *cake* is never in a reading-form pool.
- **T3.** `forkProgress`:
  - three right scored decisions in one session aren't sure, but across two sessions they are;
  - a wrong one resets the run;
  - listening and helped answers never score;
  - gaining a petal turns full into filling.
- **T4.** The stones: each official fork's stone comes after the level that teaches its second sound (plus one level, except for one-week units). No `"detective"` level comes before EC3's sounds.
- **T5.** A fork with fewer than two petals that have two or more pool words each has no stone and no gate.
- **T6.** Every `tv_sd_*` line in §3.6 exists in `lines.ts` and in the audio.
  - Every `try_<word>_<p>` used by a playable fork's pool exists and is `judged`.
  - No line text contains a letter name or the words "make", "makes" or "says" about a spelling.

**The sweep** (treadmill, `?detective=ea`, and the w6 path, on an 844×390 phone):
- **S1.** The perfect bot and the trier bot both play `w6-sd-ea` to the end. There are no softlocks, and no auto-answer or auto-advance.
- **S2.** In the full form's transcript the lines come in this order: frame → look → the petal lines → (circle) → strategy → Ready → demo → Ready → turns → sum-up → done.
  - No talk run between the child's actions is longer than 12 s (the transcript's timings).
  - The first action comes by 18 s.
- **S3.** Every petal and the circle is at least 44 CSS px, clear of the Home, Help and ninja zones, and never covered.
- **S4.** In the reading form, the word's own clip is never heard before the child's first tap on that word.
- **S5.** After the stone:
  - the World Flower trip `fork:ea` plays once;
  - the chart shows the sound line under *ea* in the /ee/ and /ae/ petals in the outline state;
  - the card's fork panel has the magnifying-glass gate, whose tap starts a 4-word Sound Detective and comes back to the card.
- **S6.** A save with three scored right answers per sound across two sessions shows the fork full, and both segments solid on the chart.
- **S7.** The performance budgets hold. Nothing animates at rest (the lens's shimmer only runs during a turn). The tries are preloaded per word.

---

## 11. Decisions and open questions

Decisions made without asking (also logged in `docs/DECISIONS.md`):
- **D1. The name is "Sound Detective"**, not "Which Sound?". Sensei never says a game name with a question in it (TEACHER_SCRIPT §2.6), and the name gives us the lens and the gate. *Reverse:* rename the `tv_sd_frame`, `tv_sd_recap`, `tv_sd_short`, `tv_sd_gate*` and `tv_map_next_detective` clips.
- **D2. Sensei never says the spelling's name.** Jonas's "This spelling, ea, is in three petals" becomes "Look! This spelling is in three petals", with the spelling glowing in the lens. Letter names are banned with young children [O1]; Freshford uses them only in Year 1 "to help distinguish between single sounds and two letters one sound". *Reverse:* a `tv_sd_named_<g>` family, for Year 2 only.
- **D3. Reading-form words must be try-safe;** the others are read by Sensei first. This is the manual's "a word that only makes sense when read with the correct sound". Without context, "breed" is as real as "bread". *Alternative:* a sentence as context, later, with the dictation sentences.
- **D4. Real words only**, never nonsense targets. The PSC accepts either sound in nonsense words, so the question would have no answer.
- **D5. A petal's picture word is never a card on its own board.** It is the explanation's example when it has the spelling (*bread* for /e/, *ghost* for /g/, *anchor* for /k/).
- **D6. < th > and < n > are explanation only.**
  - Sounds~Write writes both *th* sounds as /th/, and a wrong voicing still gives the word.
  - /ng/ for < n > is accent-dependent and never changes the word.
  - < x > (two sounds together) and < u > after < q > aren't forks.
- **D7. One syllable in v1.**
  - Two-syllable listening items follow the polysyllabic strand (< y > /ee/ *happy*, < a > /ar/ *father*, < ch > /sh/ *parachute*, < ou > /u/ *double*).
  - Until then those petals are explained but not played.
- **D8. Progress never fades on screen.** A fork falls due and comes back in review, and a wrong answer there un-sures that segment. Visible decay would feel like losing, and Jonas wants the flower to show progress.
- **D9. The paw points at an untried petal, never at the answer.** Trying each sound is the strategy we teach, and the TTE glow comes at the second wrong try.
- **D10. v1 is < ea > only,** because the other forks' units aren't in the game. It needs w6-1 to teach < ea > as /ae/, as EC1 does.
- **D11. The circle analogy at every save's first game,** not only for strugglers. It is official scaffolding, costs about 6 s, and becomes the lens.
- **D12. A multi-sound gem stops at 80 % until its segment is sure** (a proposal to the `progress.ts` owner). *Alternative:* show the fork only on the sound line, with the gems independent.
- **D13. < gh > is explanation only.** *ghost* is the /g/ petal's picture, and *ghoul* and *ghee* try to real words.
- **D14. < o >'s /oo/ petal is explanation only** until EC36 (*move*, *prove*). *do* and *to* are the only one-syllable words before that.
- **D15. The gate is a magnifying glass, not a green arrow,** because Jonas couldn't tell what v1's green button did.

Open questions (nothing is blocked on them):
- **Accent:** do the children say *book*, *look* and *cook* with the /oo/ of *moon*? If so, a grown-ups accent setting (Southern / Northern) should accept both petals for tagged words.
- **Freshford:** does the Year One teacher use the column sort (Lesson 10), or only "Try it a different way"? Does the class meet < ch > as /sh/ (*chef*) before the PSC?
- **Two-syllable words:** when should the polysyllabic strand's words come into Sound Detective's listening items (Sounds~Write starts polysyllabic work in week 2 of EC4)?

---

## 12. Sources

Official Sounds~Write (dossier ids):
- [O1] Phonics Lead Handbook, September 2026: concept 4 wording, spelling units "at the beginning of the second week", "It's two letters but it's one sound".
- [O3] "Skills and Concepts" posters (2024): concept 4; "Spelling < o >. Is it /o/ as in hot, /oe/ as in no, /u/ as in son, or /oo/ as in do?"
- [O8] Website information template (2023).
- [O11] The Phonics Screening Check Guidance (England), 09.2024: Lesson 10 for < ch >; tangential < g > < s > < c >; alternatives in nonsense words. Local: `assets-src/sw-sources/sw-psc-guidance-england-2024.txt`.
- [O13] Top Tips for Lesson 10 (© 2021). Local: `assets-src/sw-sources/research/official-pdfs/2023-01-top-tips-for-lesson-10.txt`.
- [O17] English Spellings: A Lexicon (2011). Local: `assets-src/sw-sources/downloads/_text/sw-lexicon-of-english-spellings.txt`.
- [O18] Changes to guidance on the split spelling (September 2024): "This can be /a/, but in this word, it's /ae/."
- [O37] Manual pp. 145–146, Lesson Ten: One Spelling, Different Sounds (January 2017 update). Local: `assets-src/sw-sources/research/official-pdfs/2023-01-98-lesson-10-pp45-6-update-jan-17.txt`.
- [O60], [O239] Planning guidance and timelines (2023, 07.2024): Lesson 10 in week 2; current unit, then review.
- [O120] Intervention case study: "This can be /ae/ – do you remember what else it can be?"
- Phonics games and activities for the Extended Code, free extract (© 2019, 2020): "Speed read: spelling < ea >". Local: `assets-src/sw-sources/research/extended-code/lordblyton-sw-ec-games-free-2020.txt`.
- Record sheet and word lists [O14][O240], via DOSSIER §9.7; `src/content/sw.ts` `EXTENDED_CODE_UNITS`, `TANGENTIAL_TEACHING`, `PSC_ADJUSTMENTS`.

Founder and secondary:
- John Walker, "One spelling, different sounds" (The Literacy Blog, 2012). Local: `assets-src/sw-sources/research/extended-code/literacyblog-one-spelling-different-sounds-2012.txt`.
- [X7] and [X61] (The Literacy Blog), via DOSSIER §1.4.4 and §4.9.
- [S35] a school's recorded Lesson 10 (< ow >), via DOSSIER §2.3.5.

The child's school (Freshford), not official:
- [S40] Reception parents' slides, "brown" and "does that make sense? Can you try it a different way?". Local: `assets-src/sw-sources/school-yr.txt`.
- [S41] Year 1/2 parents' slides, "Try it a different way. Can < ea > be a different sound?" and < ea > as /ee/ in *tea*, /e/ in *head*, /ae/ in *break*. Local: `assets-src/sw-sources/school-y1y2.txt`.
- [S39] "Teaching Phonics & Spelling at Freshford" (2021), "one spelling many sounds".

In this repo:
- [SOUNDS_WRITE_MODEL.md](SOUNDS_WRITE_MODEL.md) §1.4, §1.8, §6.1;
- [TEACHER_SCRIPT.md](TEACHER_SCRIPT.md) §0–§5;
- [SOUND_DISPLAY.md](SOUND_DISPLAY.md) A2, A5, A12;
- [ARCHITECTURE.md](ARCHITECTURE.md) §5 and §14;
- `src/core/types.ts` (`SpellingSortItem`, `KcId`, `TeachMoment`);
- `src/core/content/evidence.ts`;
- `src/content/teach.ts` (`sameSpelling`, `canBe`, `whichSound`);
- `src/engine/gems.ts` (`gemState`, `otherSoundsOf`, `makePractice`);
- `src/scenes/Sort.tsx` (the staging this scene reuses).
