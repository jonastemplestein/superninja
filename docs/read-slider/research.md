# Picture reading v2 and the read slider: research

**27 September 2026. The researcher's report for the read-slider work.** It answers Jonas's note of the same day about the fish-dog exercise (quoted in full in the workflow brief). He asked for three things:
- no fish-dog, so we don't seem to copy Mentava;
- a demo that makes sense;
- a finger slide from left to right that says each part as the finger reaches it, with "you always go from left to right" if the child goes the other way. The same slider should work for sounds: "say the sounds with me… mop".

He wants the exercise to introduce slow and fast reading ("we can also read longer words made from shorter words… rainbow, not bow rain").

This file is the evidence and the recommendations. The designer's spec goes in [../READ_SLIDER.md](../READ_SLIDER.md) and [../PICTURE_READING.md](../PICTURE_READING.md), and the builder's code in `src/ui/ReadSlider.tsx`. No existing file was edited for this report. §7 lists what must change in existing files, ready for `docs/fix-requests.md`.

---

## 0. The short version

1. **Retire the fish-dog, the dog-fish and the "which row did I read?" game.** The two-rows game is Mentava's readiness check ("When you ask for dogfish and then fishdog, can they point to the right pair?"), redrawn in our style. Mentava's own customers report that 3-year-olds fail it for weeks (§2). Picture reading v2 uses **real compound words whose reverse is silly** (rainbow, not bow rain). It uses no emoji and no animal mash-ups.
2. **The read slider.** A bamboo rail runs under the pictures, with a glowing start dot at its left end and **the tortoise sitting on it as the slider's handle**. The child puts a finger on the tortoise and slides it to the right.
   - Each part is said **once, as the tortoise reaches it**: "rain… bow". The audio is discrete and paced by the voice, with at least a 250 ms gap between parts, and it never speeds up with the finger.
   - Then **the rabbit**, waiting at the right-hand end, is tapped for the fast word: "rainbow!". The tortoise is the slow way and the rabbit the fast way, as everywhere else ([TEACHER_SCRIPT §9](../TEACHER_SCRIPT.md)).
3. **This is Sounds~Write's own move, handed to the child.** John Walker's "follow my finger": *"say the sounds until my finger moves on"*, and then *"Reverse roles: the child runs a finger under the word getting you to say the sounds until his finger moves on"*. Also the parent course's *"Stay with my finger"*. Compound words are also where Sounds~Write's own Year 1 plan starts reading longer words: *"Lessons 11 & 12 Starting with IC 2-syllable compound words"* (§3.1).
4. **Backwards never reads.** A slide from right to left says none of the parts. The start dot pulses, and Sensei says gently: "Oops, that's backwards. Ninjas always start on this side." The child's mistake never earns a funny picture, or 3-year-olds will slide backwards on purpose to see it.
5. **"Bow rain" is pictured once, in Sensei's show only:** a small grey cloud raining red ribbon bows. The paw slides the tortoise the wrong way ("bow… rain"), the rainbow flips into raining bows for about 2 s, and it flips back on "Ninjas always start on this side." Other reversals are only said, at most one pictured gag a session.
6. **The ninja never goes back and forth.** During the slow way it does a slow-motion kata where it stands. On the fast word it makes **one straight dash along the rail from left to right**, then vanishes in a ninja smoke puff at the right-hand end and reappears in a puff at home. The child never sees it travel from right to left, and it never strikes each picture.
7. **The bank:** 16 compound words (§4.3). **At the first meeting,** Sensei's demo is **rainbow** (with the bow-rain gag), and the child reads **snowman** and **cupcake**. Rainbow and snowman have every asset already. Cupcake needs `pic_cupcake` and `w/cupcake`, and the gag needs `pic_bowrain`.
8. **The bridge to sounds:** "Words are made of sounds, too." The same slider sits under the mop, with three sound dots: /m/ /o/ /p/, then the rabbit says "mop". It is a short ◇ show at the end of W2. **W6 becomes the child's Sound Slider** ("Now you slide it, and say the sounds with me."), with the slow word's own checked segments (§5.7).

---

## 1. What is wrong today

The warm-up is `W2` in `src/content/warmups.ts`, played by `src/scenes/Warmup.tsx`. Its script is [TEACHER_SCRIPT §3.7](../TEACHER_SCRIPT.md) and its design [FIRST_MINUTES §7](../FIRST_MINUTES.md).

- **It is Mentava's exercise.** Jonas's prompt of 25 Sep (PROMPTS.md #58) named Mentava as the source, and the build copied its pair: fish and dog, `fishdog` and `dogfish` merged into chimera animals, and "Which did I read?" with the two orders stacked. W4 adds cat–dog–fish rows and a three-picture "which row". FEEDBACK.md line 117 already notes: "Mentava uses 🐶🐟 vs 🐟🐶 in its readiness check".
- **"Fish dog, fish dog, fish dog".** In about 40 s the child hears "fish dog" four or five times:
  - Sensei's rail demo (`fm_read_fish_dog`);
  - the child's taps (`fm_pair_fish_dog`);
  - the swap ("Dog fish!");
  - the which-row demo ("Fish… dog.");
  - Reward 2's "shiny fish-dog".

  Nothing explains why a fish-dog is a thing, so the repetition is all the child gets.
- **Tapping is pointing, not a sweep.** Tapping each picture in order is discrete, and the direction is only implied by the order. A sweep makes the direction a movement the hand learns.
- **The ninja goes back and forth.** The ninja "runs along the rail… then back to its spot" (FIRST_MINUTES §7, beat 1), hops under each tapped card, and in other games travels to each item and back home (HERO.md: the ninja lives in the ninja zone, x 0–330). Each trip has a return from right to left. That is the opposite of the one straight left-to-right line that reading is.

---

## 2. Mentava's picture reading, and how ours differs

**What Mentava does (from its own pages and its customers):**
- **A readiness test with emoji.** "Point to each pair and explain its silly name. Then mix them up. 🐶 🐟 'This is dogfish.' 🐟 🐶 'This is fishdog.' When you ask for dogfish and then fishdog, can they point to the right pair?" The same page adds car plane and plane car (mentava.com/readiness-check, /ready-to-read). It is printed at the end of their free Alphabet Sounds book. It is their gate: "your kid should be… able to understand left-to-right reading order (distinguish dogfish from fishdog)" (/learn-to-read-software, /parents).
- **The same pairs in the app's first lessons.** "One of the first few lessons, showed a picture of a dog and a fish and then a picture of a fish and a dog" (a parent on Medium). Another parent: "The app tries to simplify this a bit by starting off with emojis, however my daughter struggled to understand that 'fish dog' referred to 🐟🐶 and not 🐶🐟" (Dustin Coates, 2024). A case study: "he took maybe 3-4 times doing the fish-dog lesson before it clicked" (mentava.com/case-studies/byrne).
- **The mechanic is receptive and has two choices.** The adult or the app names an order, and the child points to one of two pairs. Both pairs are nonsense.
- **Blending with no pauses.** "Keep your voice on between sounds." The app shows the child's voice as a waveform, and "a flying chick… falls to the ground if there's a pause between letter sounds". Mentava calls it "tactile blending" (its blog and home page; the gesture itself isn't described publicly).

**What is everyone's, not Mentava's.** Left-to-right order, "say it slowly, then say it fast", compound words, and a finger under the word are all at least 40 years older than Mentava:
- Engelmann's *Teach Your Child to Read in 100 Easy Lessons* (1983) opens Lesson 1 with "Let's play say-it-fast. My turn: motor (pause) boat. (Pause.) Say it fast. motorboat." It follows with ice cream and hamburger, and an arrow under every word that the finger follows from its first ball.
- Sounds~Write puts a finger under every word (§3.1).
- Hooked on Phonics lists "simple compound words" among its 42 lessons (App Store).

| | Mentava | Super Ninja, picture reading v2 |
|---|---|---|
| Pictures | emoji 🐶🐟, 🚗✈️ | our painted picture cards on coloured plates |
| Pairs | two animals (or two vehicles), both orders nonsense | **real compound words** whose parts and whole are everyday things; only the backwards order is silly |
| The child's job | **point to** the pair that was named (receptive, one of two) | **produce** the order: slide left to right, and the parts are said in the order the hand made (expressive, errorless) |
| Direction | implied by the pair's order | a start dot, the tortoise and one sliding gesture; backwards never reads |
| Slow and fast | not in the picture step | the heart of it: the tortoise is the slow way (parts with gaps), the rabbit the fast way (the whole word) |
| Blending doctrine | continuous, no pauses; a waveform and a chick that falls | the slow way **has gaps** (Jonas, 27 Sep; §9.1), and pure sounds only (Sounds~Write) |
| Voice | microphone and speech feedback | no microphone; Sensei's recorded voice; the child joins in aloud |
| Used as | a readiness **test** | a **lesson** that teaches direction to every child, and then the bridge to sounds |

**What must go** (§7 has the list of files): the pictures `pic_fishdog` and `pic_dogfish`; the lines `fm_read_fish_dog`, `fm_pair_fish_dog`, `r2_dog_fish`, `fm_l2_swap`, `tv_silly` ("What a silly animal!"), `fm_rw_shiny` and `fm_rw2_list`; the `swap` and `which` beats in W2 and W4 and their lines (`tv_which_*`, `fm_which_*`, `fm_read_cat_dog_fish`, `fm_triple_*`, `fm_l4_swap`); and Reward 2's shiny fish-dog. Single words like "dog" or "fish" in other games (a Pocket Hunt, Guess My Word) are fine. It is the order-of-two-animals game that looks copied.

---

## 3. Prior art for a finger sweep

### 3.1 Sounds~Write (from `assets-src/sw-sources/research/sections/`)

| What | Wording | Where |
|---|---|---|
| The mantra and its two gestures | "Now let's say the sounds *(point to each line individually)* and read the word *(slide your finger along under all the lines)*." | teacher-language.md 1, 41; lessons.md 123 |
| Gesture discipline | "Gestures give students a place to listen", so they must match exactly what the teacher is saying. "When holding a continuant, the finger pauses under that sound's line." | teacher-language.md 303; lessons.md 365 |
| Pace set by the finger | "say the sounds and listen for the word. Stay with my finger. That helps you to control the speed at which the child reads the word." Then "a bit quicker", then "a bit quicker still". | error-correction.md 136; teacher-language.md 113 |
| **The role reversal (our slider)** | Walker (2012): "'I want you to say the sounds until my finger moves on to the next sound.'… Reverse roles: the child runs a finger under the word getting you to say the sounds until his finger moves on." | error-correction.md 144–150 |
| The child's own finger | "Make sure that you put your finger under each sound as you say [them], please." The child "put[s] their finger under each spelling as they say the sounds and read the word." | teacher-language.md 112, 63 |
| Oral blending in Early Years | "A board with three dashes… a dotted arrow running left to right beneath them". On a miss: "take the child's finger and, while gesturing to the dashes… say again, 'm…u…g → mug!'" | nursery-precode.md §12.6 |
| Direction, said out loud | "We spell sounds one at a time from left to right across the page." "(make sure you are moving left to right, top to bottom – as if reading a text)" | initial-code.md 31; lessons.md 213 |
| Rushing ahead | Polysyllabic lessons: pupils may rush ahead, so "use a piece of card or your hand to cover upcoming syllables". "I want you to say the sounds until my finger stops." | polysyllabic.md 184, 574 |
| Compounds first | Schools copying the official Year 1 plan: "Lessons 11 & 12 Starting with IC 2-syllable compound words". Lesson 11: "Now let's say the sounds and read each syllable. Now say the syllables and read the word." Check 3's words are sunset, zigzag, batman, hotdog and cobweb. | polysyllabic.md 15, 39, 51 |
| Jonas's child's school | Reception meets compound words ("windmill") and feels syllables with a hand under the chin. | nursery-precode.md 317 |

What this means for us:
- The slider is the child's side of "Stay with my finger". The child's finger decides *when* each part is said, and the voice decides *how* it sounds.
- "Say the syllables, and read the word" is exactly "rain… bow, rainbow". Compound words are Sounds~Write's own on-ramp to longer words.
- One difference is flagged, not hidden. Sounds~Write holds a continuant while the finger lingers ("mmmaaat"). Our slow way uses separate pure sounds with 250 ms gaps, by Jonas's ear (TEACHER_SCRIPT §9.7, FS1). Holding a continuant under a resting finger would need sustainable recordings of the continuants, so it is out of scope here (§8).

### 3.2 Engelmann, *Teach Your Child to Read in 100 Easy Lessons* (DISTAR, 1983)

- **Say it fast** before any letters, with compound words: "motor (pause) boat… Say it fast", then ice cream, sister, hamburger, motorcycle, lawnmower and sidewalk (Lesson 1–2 outlines).
- **The ball and arrow.** An arrow is printed under every word, with a big ball at its start and a small ball under each sound. "Touch the first ball of the arrow. Move quickly to second ball. Hold two seconds." The child later does it: "Touch the first ball of the arrow… say the sounds as you touch under them… Say it fast."
- Sight words are "read the fast way": "the child slides his finger under the letters… but does not sound out the word" (startreading.com).

For us: the start dot is DISTAR's ball, and the rail is the arrow. "Slow way, then fast way" is DISTAR's "say it slowly, then say it fast", which is public and 43 years old.

### 3.3 UK classroom practice

- **Point and sweep** (Letters and Sounds and its successors). "As I point I want you to say each sound and when I sweep underneath I want you to blend the sounds to say the word." Later: "when they sweep, they say the word out loud" (a Surrey school's Reception guide).
- **Sound sled and arm blending** (US worksheets and parent guides). "Place your finger on the sled. Slide your finger slowly under the letters." "Touch the shoulder for the first sound, the elbow… then sweep the whole arm while saying the word."

### 3.4 Apps

The web search budget ran out part-way. What follows is from the apps' own pages, reviews and help centres. Where nothing public describes a drag, the table says so rather than guess.

| App | A finger drag under the word? | Audio while dragging | Too fast, and direction | Source |
|---|---|---|---|---|
| **Reading Doctor** (Word Builder, AU) | yes: "Slide your finger over the word to hear the speech sounds!" | **discrete**: each sound plays, with a mouth animation, as the finger passes its tile | not described | readingdoctor.com.au |
| **Read Write Phonics** (UK) | yes | discrete per sound, but **speed-coupled**: "If you slide your finger quickly along the word it sounds like the actual word, rather than a weird amalgamation of letters" | speed decides slow or fast | mum-friendly.co.uk review |
| **Lotty Learns** (US) | yes: "Slider that lights up each letter to visualize blending"; "slide your finger across the bar" | discrete lights; the word is a separate button ("Tap to hear word read aloud") | not described | lottylearns.com |
| **Rev & Read** (US, 2026) | yes: "Drag across letters to blend sounds smoothly" | continuous ("smoothly"), with speech recognition | not described | App Store listing |
| **Phonixo** (2026) | a drag of letter tiles, not a sweep | "Letter sounds loop while dragging" | – | phonixo.com |
| **Mentava** | "tactile blending" (not described publicly) | continuous; pauses are punished (the chick falls) | the waveform shows pauses | mentava.com |
| **Teach Your Monster to Read** (UK) | none found: blending is modelled by the narrator, and the child picks graphemes and pictures in mini-games (Space Race, Super Jumper, Stepping Stones) | – | – | teachyourmonster.org |
| **Reading Eggs** | none found: "Sound Buttons"; "students are prompted to say each sound before saying the word on screen"; "blend all the way through the word" | – | "reading words from left to right… from the very first lesson" | readingeggs.ca, readingeggs.com |
| **Phonics Hero** (UK) | none found: blending is "glue the sounds together" games (help the ghost find his house) | – | – | phonicshero.com |
| **Hooked on Phonics** | not described publicly; it lists "simple compound words" in its 42 lessons | – | – | App Store listing |
| **Nessy** | not described: "Blended Phonics", with jigsaw words | – | – | Nessy user guides |
| **Khan Academy Kids** | an activity called "Blend Sounds 1" exists; its gesture is not described publicly | – | – | Khan Kids help centre |
| **Duolingo ABC** | not described: "Letter sounds are presented from left to right and combined into a word". A reviewer criticises the missing "modeling and practice of continuous blending", and says many exercises match whole words | – | – | phonics.org review; abc.duolingo.com |

**What the prior art says about the three hard cases:**
- **Continuous or discrete audio?** Every app that is public about it plays **each unit once as the finger reaches it**. Continuous audio (Rev & Read, Phonixo's loops, Mentava) needs sounds that can be held, and fails on stops (/k/ /t/ /p/). It invites exactly the "duh" and the smear that the house removed on 27 Sep. Coupling the audio to speed (Read Write Phonics) turns a fast slide into a spliced blend, which a real reader never hears. **So: discrete, and paced by the voice.** Each part is one clip, queued so the voice can't be outrun. The fast word is always its own whole recording, on its own gesture (the rabbit).
- **Too fast.** Sounds~Write lets the adult's finger set the pace, and covers the syllables ahead when a child rushes. In the child-led version the **voice** sets the pace: each card lights when its clip starts, not when the finger passes it, and a flick still gets every part in order with its gaps. Nobody is told off for speed. The reading light "catches up" with the finger.
- **Direction.** Sounds~Write shows a dotted arrow under the dashes and "moving left to right… as if reading a text". DISTAR has a ball at the start of the arrow. Foundations A–Z says "The first letter in a word is on the left." Nobody reads backwards to show why. We show it once, as a joke, in Sensei's demo (§5.3).

---

## 4. The compound-word bank

### 4.1 What makes a good picture compound here

1. **Everyday for a British 3-year-old.** The parts and the whole are things a British 3-year-old names every week (FIRST_MINUTES §11's 3-year-old rule). Each passes the picture audit, or can be redrawn to pass it.
2. **Each part sounds the same inside the whole word.** That rules out cupboard (/ˈkʌbəd/), sandwich (/ˈsænwɪdʒ/), and postman or fireman (whose "man" is /mən/). Snowman keeps a full /mæn/ in British English.
3. **The reverse is not a word, or a phrase in use.** "Pot tea" is close to a pot of tea, "cake pan" is a real American word, and "chair arm" is real.
4. **A picture of the reverse can't be mistaken for the real thing.** A "ring ear" drawn as an ear with a ring *is* an earring, and "hat sun" or "glasses sun" drawn as the sun wearing one is a sunhat or sunglasses. Words like that can only be said, never pictured.
5. **No BATH-vowel parts** (castle, glasses, bath, grass, basket). The house TTS voice says /æ/ in about two takes out of three (TEACHER_SCRIPT §9.8).
6. **Not animal + animal, and no fish–dog.** That is Mentava's shape. Hot dog, catfish, dogfish, bulldog and sheepdog are out too.
7. **Better if the last word says what it is:** a snowman is a man, a raincoat is a coat, a cupcake is a cake. It gives Reception the real reason why "bow rain" is silly: it would be rain (§5.8).

### 4.2 Every candidate

P = a picture in `public/a/i/pic_<w>.webp`; A = a word clip in `public/a/w/<w>.mp3`; – = missing. The funny column scores the reverse, ★ to ★★★. The 3-year-old column rates the whole word, with notes on the parts.

| Word | Parts (P/A) | Whole (P/A) | Reverse, as a picture | Funny | 3-year-old | Notes | Verdict |
|---|---|---|---|---|---|---|---|
| **rainbow** | rain PA, bow PA | PA | *bow rain*: a small grey cloud raining red ribbon bows | ★★★ | ★★★. The picture audit names today's rain picture "cloud" (`PIC_NAMES`); bow is a ribbon, said /bəʊ/ | Jonas's own example; every asset exists | **A: Sensei's demo** |
| **snowman** | snow PA, man PA | PA | *man snow*: tiny smiling men falling like snowflakes | ★★ | ★★★. The snow picture is a snowflake | A man made of snow: the plainest meaning in the bank | **A: the child's first** |
| **cupcake** | cup PA, cake PA | – – | *cake cup*: a teacup made of sponge and icing | ★★★ | ★★★. Cup is a teacup and cake a birthday cake, both clear | Needs `pic_cupcake` and `w/cupcake` | **A: the child's second** |
| **raincoat** | rain PA, coat PA | – – | *coat rain*: a cloud raining coats | ★★★ | ★★★ (British weather) | Same first word as rainbow, different last word | **B: W4** |
| **football** | foot PA, ball – – | – – | *ball foot*: a ball with toes | ★★★ | ★★★ | "ball" must be a plain red ball, the whole a black-and-white football | **B: W4** |
| **treehouse** | tree PA, house PA | – – | *house tree*: a tree growing out of a chimney | ★★ | ★★ | | **B** |
| **cowboy** | cow PA, boy PA | – – | *boy cow*: a cow in a boy's clothes | ★★★ | ★★ (Woody) | Draw with a hat, boots and a lasso, never a gun | **B** |
| sunflower | sun PA, flower PA | PA | *flower sun* | ★ | ★★ | A weak reverse, but every asset exists | C: reserve |
| starfish | star PA, fish PA | PA | *fish star* | ★★ | ★★ | Contains "fish": keep it out of first meetings | C |
| pancake | pan PA, cake PA | – – | *cake pan* | ★★ | ★★★ (Pancake Day) | Its reverse is a real American word | C |
| butterfly | butter – –, fly – A | – A | *fly butter*: a fly stuck in butter | ★★★ (yuck) | ★★★. Butter ★★, fly ★★ | The meaning is opaque: good later ("it's just two words") | C |
| ladybird | lady – –, bird PA | – – | *bird lady* | ★★ | ★★★. British: ladybird, never ladybug | Opaque | C |
| jellyfish | jelly – –, fish PA | – – | *fish jelly*: a wobbly jelly with fish in it | ★★★ (yuck) | ★★. British jelly | | C |
| toothbrush | tooth – –, brush – – | – – | *brush tooth*: a tooth with bristles | ★★ | ★★★ | "Brush tooth" sounds like an instruction; /θ/; six assets to make | C |
| hedgehog | hedge PA, hog PA | – – | *hog hedge*: a hedge clipped into a pig | ★★★ | ★★★ for the whole, but a 3-year-old doesn't know "hog", and today's hog is a boar with no face | Needs a hog picture that passes, or "a hog is a big pig" | C |
| seahorse | sea PA, horse PA | – – | *horse sea*: horses swimming in waves | ★★★ | ★★. The picture audit calls today's sea picture "wave" | Blocked until a sea picture reads as "sea" | C |
| earring | ear PA, ring PA | – – | *ring ear* = an earring (fails rule 4) | – | ★★ | Say it only | out |
| sunhat, horseshoe | | | the reverse drawn = the real thing (rule 4) | | | | out |
| sunglasses, sandcastle, bathtub | | | | | | BATH vowel (rule 5). `pic_sand` is a sandcastle. "Bath" is the British word for a bathtub | out |
| teapot, armchair, pancake-like | | | reverse is a phrase in use (rule 3) | | | | out |
| dragonfly | | | "fly dragon" is almost a flying dragon | ★ | ★ | | out |
| fireman, postman | | | "man fire" is a man on fire | | | "man" is /mən/ (rule 2) | out |
| cupboard, sandwich | | | | | | the parts don't sound out (rule 2) | out |
| strawberry, pineapple | | | | | | the vowel is reduced ("-bəri"), and "pine" can't be pictured for a 3-year-old | out |
| eggcup, doorbell, keyhole, lipstick, snowball, kneecap | | | | ★ | ★–★★ | weak reverses, or a part a 3-year-old doesn't know; eggcup is a nice British reserve | out (reserve) |
| hot dog, catfish, dogfish, fishdog, bulldog, sheepdog, Batman | | | | | | Mentava's shape (rule 6); Batman is a trade mark | **never** |

### 4.3 The bank (16)

| Tier | Words | Where |
|---|---|---|
| **A: the first meeting** | rainbow (Sensei), snowman, cupcake (the child) | W2 |
| **B: the second meeting and recaps** | raincoat, football, treehouse, cowboy | W4, then recaps |
| **C: reserve and rotation** | sunflower, starfish, pancake, butterfly, ladybird, jellyfish, toothbrush, hedgehog, seahorse | the practice dojo, Sensei's Challenge, the Sticker Book, and a repeated lesson (`needsRepeat`) |

`src/content/compounds.ts` should carry each word's parts, whole, reverse, its "the last word says what it is" line (when it has one), its tier, and whether the reverse may be pictured. Only rainbow (bow rain) and raincoat (coat rain) are pictured to begin with. Football (ball foot) and cupcake (cake cup) are next if the first two land well.

### 4.4 Why this trio for the first meeting

- **Rainbow is Jonas's word.** Every asset exists, and its reverse is the funniest clean picture in the bank: it's raining bows!
- **Snowman is the plainest meaning** ("a man made of snow"), and every asset exists.
- **Cupcake is the most loved object** in the bank for a 3-year-old, with two parts they name at every meal and party. It needs only two new assets.
- The three share no word, and none is an animal. If cupcake's picture fails the picture audit, **sunflower** takes its place with no new art.

### 4.5 Assets to make (new files only; the art and audio lanes)

**Pictures** (house style, [ART_STYLE.md](../ART_STYLE.md), via `scripts/gen-art.ts`, `scripts/img.ts` and `scripts/post-art.py`; each passes the picture audit with `--age 3`):

| Tier | File | Style | What to draw |
|---|---|---|---|
| A | `pic_cupcake` | PIC_OBJECT | one cupcake in a pleated paper case, with pink swirly icing and one cherry |
| A | `pic_bowrain` | a gag card, no face | one small grey cloud raining a dozen little red ribbon bows (the same bow as `pic_bow`) falling like raindrops, with no rainbow, no rain and no face |
| B | `pic_raincoat` | PIC_OBJECT | a yellow hooded raincoat with toggles, whole |
| B | `pic_ball` | PIC_OBJECT | one plain shiny red rubber ball, not a football and not a beach ball |
| B | `pic_football` | PIC_OBJECT | a classic black-and-white football |
| B | `pic_treehouse` | PIC_OBJECT | a little wooden house with a window and a door, sitting in a big green tree, with a ladder |
| B | `pic_cowboy` | PIC_LIVING | a boy in a cowboy hat, waistcoat and boots, holding a lasso, facing the viewer and smiling; no gun, no holster |
| B | `pic_coatrain` | gag card | one small grey cloud raining little coats (the same coat as `pic_coat`) |
| C | `pic_pancake` | PIC_OBJECT | a stack of three golden pancakes |
| C | `pic_butter` | PIC_OBJECT | a block of butter on a dish, with a knife curl |
| C | `pic_fly` | PIC_LIVING | a housefly |
| C | `pic_butterfly` | PIC_LIVING | a butterfly |
| C | `pic_lady` | PIC_LIVING | a lady |
| C | `pic_ladybird` | PIC_LIVING | a ladybird |
| C | `pic_jelly` | PIC_OBJECT | a wobbly red jelly on a plate |
| C | `pic_jellyfish` | PIC_LIVING | a jellyfish |
| C | `pic_tooth` | PIC_OBJECT | one tooth |
| C | `pic_brush` | PIC_OBJECT | a hairbrush |
| C | `pic_toothbrush` | PIC_OBJECT | a toothbrush |
| C | `pic_hedgehog` | PIC_LIVING | a hedgehog |
| C | `pic_seahorse` | PIC_LIVING | a seahorse |

Seahorse also needs a sea that reads as "sea": a fix request, because `pic_sea` exists. A **redraw of `pic_rain`** helps rainbow and raincoat: heavy rain, many big blue drops falling from a small grey cloud onto a puddle, so it stops reading as "cloud". That is a fix request too (§7).

**Word audio.** The A and B words are cupcake, raincoat, ball, football, treehouse and cowboy. The C words are pancake, butter, lady, ladybird, jelly, jellyfish, tooth, brush, toothbrush, hedgehog and seahorse; fly and butterfly exist.
- **The catch:** `gen-audio.ts words` only makes words listed in `WORDS`, `SPECIAL_WORDS`, the story tokens or `ORAL_WORDS`, and `ORAL_WORDS` is in `src/content/phonics.ts`, an existing file. So either the builder adds them to `ORAL_WORDS` through a fix request (with `pic`, `first` and `segs`), or the lane writes a small script under `playtest/read-slider/` that calls the same `tts()`, blind-word judge and loudness rule as gen-audio's word path.
- **QA:** every clip gets Whisper's word-for-word check. **Check that `w/bow.mp3` is /bəʊ/** (a ribbon), never /baʊ/ (to bend).

---

## 5. Picture reading v2: the design

### 5.1 The idea, in the child's words

- Ninjas always read this way, from this side to that side.
- Little words can make a long word. There is a **slow way** to read it (the tortoise: "rain… bow") and a **fast way** (the rabbit: "rainbow").
- The other way round makes a silly word: bow rain! That's why we always start on this side.
- Words are made of sounds, too. The slow way: /m/ /o/ /p/. The fast way: mop.

### 5.2 The screen (stage 1280×720; HERO.md's zones)

```
 ┌──────────────────────────────────────────────────────────────────┐
 │                                                                  │
 │              ┌────────┐        ┌────────┐                        │  two picture cards, 240 px,
 │              │  rain  │        │  bow   │                        │  on the rail
 │              └────────┘        └────────┘                        │
 │   [tortoise]●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▶ [rabbit] │  the rail at y ≈ 520, x 360–1090
 │ (ninja)  ░░░░░░░░░░░ touch band: x 340–1100, about 150 px tall ░ │  the tortoise sits on the start dot;
 │  zone                                              caption  (?) │  the rabbit at the right-hand end,
 └──────────────────────────────────────────────────────────────────┘  above the help zone
```

- The **tortoise is the handle**. It already faces right (`ui_tortoise`), at least 100 stage px, and sits on a glowing start dot (DISTAR's ball).
- A painted brush-stroke arrow runs along the rail, and behind the tortoise a trail of light fills it as it moves.
- Each card has a small **reading light** under it that lights when its part is said.
- The **rabbit** (`ui_rabbit`) sits at the finish, at the right-hand end, and wakes only when the slow way is done.

### 5.3 The first meeting (W2), beat by beat

Clip lengths are measured where the clip exists. New lines are estimated at about 2.7 words a second, with 0.35 s between clips (TEACHER_SCRIPT §9.3). **A run ends where the line that cues the child's next action starts.**

| t (s) | On screen | Sensei (exact text) | The child | Notes |
|---|---|---|---|---|
| 0.0 | The rail slides in and the start dot glows. On "this way" the ninja runs the rail from left to right with a speed trail, vanishes in a smoke puff at the right-hand end and reappears in a puff at home. | `rs_way` "Ninjas always read this way." (≈ 2.0 s) | – | This comes straight after Reward 1's `tv_rw_next` ("Next, we're going to read some pictures, the ninja way."), so the game is already framed |
| 2.4 | Rain and bow land on the rail. Sensei's **paw** comes down onto the tortoise on "tortoise". | `rs_demo` "Let me show you a long word. I'll slide my tortoise, slowly. Look..." (≈ 4.8 s, suspended) | watches | Jonas's demo shape: "Let me show you. I'm going to… Look". It is Sensei's, never the ninja's |
| 7.5 | The paw slides the tortoise. As it reaches each card, the card's reading light glows and its word plays. The ninja does a slow-motion kata at home. | [rain] (0.72) · 300 ms · [bow] (0.47) | watches | Sensei's slide is a Web Animation keyed to the voice queue, so the paw arrives at "bow" just after "rain" has ended |
| 9.0 | A 0.6 s pause (the child may say it), then the rabbit pulses and grows. | `fm_tap_rabbit` "Now tap the rabbit, and say it fast." (2.43, recorded, /ɑː/) | **taps the rabbit (run: 9.6 s)** | §9's Move 1: the child makes the fast word |
| tap | The rabbit hops. The cards zip together and bloom into the rainbow. The ninja makes **one straight dash** along the rail, left to right, then puffs away and back home. | [rainbow] (0.74) | – | the only "rainbow" in the demo |
| +1.1 | The paw lifts the tortoise in a hop to the rail's **right-hand** end. | `rs_wrong_way` "Now watch. If I slide it the wrong way..." (≈ 3.2 s, suspended) | watches | |
| +4.6 | The paw slides the tortoise from **right to left**, and the tortoise walks backwards, puzzled. | [bow] · 300 ms · [rain] | watches | the only right-to-left reading anywhere, and it is Sensei's |
| +6.2 | The rainbow flips into **`pic_bowrain`** (it's raining bows!). The ninja does its think pose, then laughs. On "Ninjas" the picture flips back, the tortoise pops back onto the start dot, and the arrow sweeps left to right. | `rs_bow_rain` "Bow rain! That's silly. Ninjas always start on this side." (≈ 3.8 s) | laughs | the gag is on screen for about 2 s |
| +10.3 | ▶ and the paw pop in. The ninja faces ▶. | `tv_squish_ready` "Two little words make one big word. Now you make one. Are you ready?" (4.97, recorded) | **taps ▶ (run from the tap: 10.3 s)** | Jonas's "longer words made from shorter words", said as the hand-over |
| bow | Snow and man land. The tortoise pulses. A **ghost hand** slides once from the dot to the right, silently. | `rs_turn` "Put your finger on the tortoise, and slide it this way." (≈ 4.0 s) | **slides** (live from the landing) | no "This is snow." lines: the slide says each part |
| slide | Each card lights as its word plays. The trail follows the finger, and the reading lights follow the voice. | [snow] (0.84) · [man] (0.78) | says them along | |
| +1.5 | The rabbit pulses. | `fm_tap_rabbit` | taps the rabbit | |
| tap | The bloom, and the ninja's dash with its puff. | [snowman] · `tv_fs_praise_both` "Slow, then fast. That's real reading!" (3.45, recorded) | – | the save's first slide is praised; after that, §5.3's rhythm |
| next | Cup and cake land. | `rs_another` "Here's another long word." (≈ 1.6 s) | slides, taps the rabbit | the rabbit pulses with no line. 8 s: it hops and glows. 12 s: Sensei says `tv_fs_now_fast` "And now the fast way..." [cupcake] herself |
| ◇ | Mop lands with **three sound dots** on the rail under it. The paw slides the tortoise, and each dot lights on its sound. | `rs_sounds_too` "Words are made of sounds, too. Let me show you..." · /m/ /o/ /p/ · `tv_fs_now_fast` · [mop] | watches | a Sensei-only teaser (≈ 8 s); the governor drops it for a slower child. The child's own sound slide is W6 |
| close | Every bead lights. | `fm_l2_done` "You read the pictures, just like a real reader!" · `tv_rw_link_book` | – | recorded |

- **Estimated length:** about 61 s for a quick child without the ◇ teaser, and about 69 s with it. The target is 65 s and the cap 75 s.
- **Longest runs of talk:** 9.6 s before the first rabbit tap, and 10.3 s from that tap to the Ready. Both are under the 12 s rule.
- **"Rainbow" is heard once and "bow rain" once**, and each has a reason on screen (the rabbit, the wrong-way slide). That answers "fish dog, fish dog, fish dog".
- **The paw** (Show me again) during the child's turn replays only the slide and the fast word on rain and bow (`tv_show_again` · the slide · [rainbow]), never the gag.

### 5.4 The slider's rules (for READ_SLIDER.md and `ReadSlider.tsx`)

| Case | What happens |
|---|---|
| **Hit area** | The touch band covers the rail's whole length and about 150 px of height, so a finger that drifts up or down still counts. Only x matters. It lies outside the ninja zone (x < 330) and the help zone (x > 1116, y > 556). Set `touch-action: none`. Map `clientX` to stage x with `stageRect()`. |
| **Start** | A read starts with a touch in the **start zone**: the tortoise, the dot, and the rail up to 30% into the first card. The tortoise snaps under the finger. |
| **Firing** | A part fires when the finger's furthest point so far (its **high-water mark**) passes the card's left edge plus 35% of its width, so the finger is really under the picture. A sound dot fires at its centre minus its radius. Moving back to the left never un-fires or re-fires a part. |
| **Audio** | **Discrete and paced by the voice.** Each part plays once, queued: the next clip starts no sooner than the last one's end plus 300 ms for words, or 250 ms (`SLOW_GAP_MS`) for sounds. A card's reading light comes on at its clip's start (through `onClip`), not when the finger passes. The audio never speeds up with the finger, never loops, and never holds a sound. |
| **Too fast (a flick)** | Allowed. The parts play in order with their gaps, and the lights catch up. No correction at the first meeting. An optional ◇ line after three flicks in a session: `rs_slowly` "The tortoise likes to go slowly. Try it slowly, like me." |
| **End of the slow way** | Every part has fired and its clip has ended, and the finger has either lifted or passed the last card. After a 1.5 s pause (the child's own "rainbow"), the rabbit wakes. |
| **Lifting part-way** | The progress is kept for 3 s, and a new touch within 90 px of the tortoise carries on. After 3 s, or a touch elsewhere, the lit cards fade and the tortoise pops back onto the dot (a fade out and in, never a walk to the left). With no touch, after 8 s: `rs_keep_going` "Keep going, all the way to the end." |
| **Backwards** | A touch that starts right of the start zone and moves left 80 px or more. **None of the parts play.** The tortoise pops to the dot, the dot pulses, and the arrow sweeps left to right. Sensei says `rs_backwards` "Oops, that's backwards. Ninjas always start on this side." Never red, never a buzzer, never "No" (TEACHER_SCRIPT §2.4, rule 11). |
| **Starting in the middle** | A touch right of the start zone that moves right. Nothing fires, the tortoise wiggles and the dot pulses. The second time in a turn, Sensei says `rs_start_here` "Ninjas start on this side. Put your finger on the tortoise." |
| **A tap on the tortoise** | It wiggles and the ghost hand shows the slide. |
| **Taps on the cards in order** | This **counts as a slow read**, silently: a fallback for a child who can't drag yet. A card tapped out of order says its word, and the dot pulses. |
| **Several fingers or a palm** | Only the first pointer is followed. |
| **Idle** | 8 s: the ghost hand slides again, with no line. 16 s: `rs_idle` "Put your finger on the tortoise when you're ready." 24 s: `tv_offer_show` (the paw). Nothing moves on by itself (NAVIGATION rule 5). |
| **Motion** | The tortoise follows the finger through `transform: translateX` (clamped to the rail). The trail is a `scaleX` on a painted stroke (origin left), and the lights are `opacity`. Transforms and opacity only. Transforms are written in `pointermove` (at most one rAF while dragging), with **no rAF when idle**. |
| **Words** | `say({ word })` through `src/engine/audio.ts`, so captions and ducking work. |
| **Sounds** | Play the **slow word's own segments**: slice `public/a/x/<w>.mp3` from `SLOW_TIMES[w][i]` to the next onset minus `SLOW_GAP_MS` (the last one runs to the clip's end). That way /g/ and /b/ keep their 45 ms voiced closure and short vowels stay 0.24 s, as in the checked slow words (§9.1). `say({ sound })` plays the raw `public/a/p` clip, which lacks both. |
| **Testing** | On the harness (`playtest/read-slider/`), with real touches (CDP `Input.dispatchTouchEvent`): a slow slide, a flick, a backwards slide, a slide from the middle, a lift and carry on, a lift and time out, two fingers, taps in order, and ten fast slides in a row (the queue must not pile up). |

### 5.5 Who does what

- **Sensei** does every demo with her **paw**, slowly and aloud, in the first person. The ninja never demonstrates.
- **The tortoise** is the slow way: the child's handle, and it walks in Sensei's backwards gag.
- **The rabbit** is the fast way: one tap, and it hops once.
- **The ninja** does a slow-motion kata where it stands during the slow way. On the fast word it makes **one straight dash along the rail, left to right**, then vanishes in a smoke puff and reappears at home. It never strikes each card or runs back along the rail, so the child only ever sees reading movement go left to right. On the bow-rain gag it does its think pose, then laughs.

### 5.6 Later meetings

- **W4 (recap, usually the next session).**
  - `rs_again` "It's Ninja Reading again, with more long words." · the canonical demo (rain, bow, the rabbit, [rainbow], with no gag) · a spoken hand-over · **raincoat** and **football**.
  - After raincoat comes the session's one pictured gag: `rs_wrong_way` · [coat] · [rain] · `rs_coat_rain` "Coat rain! It's raining coats. That's silly." ("Rain" again, but a different last word.)
  - ◇ treehouse.
  - W4's cat–dog–fish rows and the three-picture "which row" retire (§2).
- **The short form (same session).** One line, then the turn. The paw offers the demo.
- **Rotation.** The practice dojo, Sensei's Challenge and a repeated lesson draw from tiers B and C. Each word appears at most once a session. A pictured reversal at most once a session; every other reversal is said only.

### 5.7 The bridge to sounds, and W6

- **W2 ◇:** the Sensei-only mop teaser in §5.3 ("Words are made of sounds, too.").
- **W6 becomes the Sound Slider.** Today's Sound Dots has the child tap each dot. It keeps its recorded frame, `tv_dots_frame` "Every dot is one sound in the word." and `tv_dots_ido` "I start here, and go this way.". Then:
  - **The demo:** the paw slides the tortoise under sun: /s/ /u/ /n/ · `tv_fs_now_fast` · [sun].
  - **The hand-over:** `rs_sounds_you` "Now you slide it, and say the sounds with me." This is Jonas's "the sensei says, say the sounds with me".
  - **The turn:** the child slides under cat, dog and mug: /k/ /a/ /t/ → the rabbit → [cat]. The first word ends with `t_if_you_say_sounds` "If you say the sounds, you can hear the word." (Sounds~Write's own words, once per save).
- The words are the same as today's W6, and the dots already come with their sounds (`segsOf`, `SLOW_TIMES`).
- **Later:** the same slider fits every read-back that Sounds~Write does with "say the sounds (point to each line) and read the word (slide under all the lines)": Word Building's read-back, Kai and Suki, and Story Time's help. That is out of scope for this workflow and is logged in §8.

### 5.8 Reception and older

- **Reception, autumn** plays W1 and W2 only, then goes to w1-2 with W3–W6 marked done (FIRST_MINUTES §9). So:
  - The Reception version of W2 keeps the same slide beats, and its own "/a/ in it" Pocket Hunt beat (it has no fish or dog).
  - **The mop sound-slider teaser is not optional there.** It is the only sound slider a Reception child meets before w1-2. Its budget is 77 s, with a cap of 88 s.
  - An optional idea line gives the real reason for "bow rain": `rs_last_word` "The last little word tells you what it is." · `rs_raincoat_is` "A raincoat is a coat for the rain."
- **Reception later in the year, and Years One and Two,** start with cuts of the dojo, not the warm-ups. They would meet the slider under written words. Its natural home is Sounds~Write's polysyllabic Lessons 11–14 ("say the syllables and read the word"): sun|set, zig|zag. For older children the handle can be a plain brush glow instead of the tortoise (§8).

### 5.9 New lines (proposed ids; the lane that records them appends one block at the end of `LINES`)

**Rule for new lines: none may use "fast".** The recorded `fm_tap_rabbit` and `tv_fs_now_fast` carry "fast" (TEACHER_SCRIPT §9.8: the voice says /æ/ in "fast" about two times in three).
- `fm_tap_rabbit` has been retaken and now has /ɑː/.
- `tv_fs_now_fast` is still /æ/, so where the slider uses it (the 12 s rabbit idle, the mop teaser), another retake round would help.

| id | Exact text | Words | Est. | Where |
|---|---|---|---|---|
| `rs_way` | Ninjas always read this way. | 5 | 2.0 s | W2 frame (replaces `tv_rail_frame` as the opener; that line stays for Year 1+ first meetings) |
| `rs_demo` | Let me show you a long word. I'll slide my tortoise, slowly. Look... | 13 | 4.8 s | W2 demo; a lead-in, suspended |
| `rs_wrong_way` | Now watch. If I slide it the wrong way... | 9 | 3.2 s | the gag's lead-in, suspended |
| `rs_bow_rain` | Bow rain! That's silly. Ninjas always start on this side. | 10 | 3.8 s | W2 gag |
| `rs_coat_rain` | Coat rain! It's raining coats. That's silly. | 7 | 2.8 s | W4 gag |
| `rs_turn` | Put your finger on the tortoise, and slide it this way. | 11 | 4.0 s | the save's first child slide |
| `rs_another` | Here's another long word. | 4 | 1.6 s | later items |
| `rs_again` | It's Ninja Reading again, with more long words. | 8 | 3.0 s | W4 recap |
| `rs_backwards` | Oops, that's backwards. Ninjas always start on this side. | 9 | 3.3 s | a backwards slide |
| `rs_start_here` | Ninjas start on this side. Put your finger on the tortoise. | 11 | 4.0 s | the second slide from the middle |
| `rs_keep_going` | Keep going, all the way to the end. | 8 | 2.8 s | a slide that stops part-way, after 8 s |
| `rs_idle` | Put your finger on the tortoise when you're ready. | 9 | 3.2 s | 16 s idle |
| `rs_slowly` | The tortoise likes to go slowly. Try it slowly, like me. | 11 | 4.0 s | ◇ after three flicks |
| `rs_sounds_too` | Words are made of sounds, too. Let me show you... | 10 | 3.6 s | W2 ◇; a lead-in, suspended |
| `rs_sounds_you` | Now you slide it, and say the sounds with me. | 10 | 3.6 s | W6 hand-over |
| `rs_last_word` | The last little word tells you what it is. | 9 | 3.3 s | Reception idea line |
| `rs_raincoat_is` | A raincoat is a coat for the rain. | 8 | 3.0 s | Reception, after raincoat |
| `fm_rw2_list` ↻ | Rain, bow, snow, man, snowman, cup, cake and cupcake! | 9 | 4.5 s | Reward 2 (was "Fish, dog, flower…") |
| `fm_rw_shiny` ↻ | Ooh, a shiny sticker! Rainbow! | 5 | 2.5 s | Reward 2 (was "…Fish dog!"); the shiny sticker becomes the rainbow, which suits the reward's rainbow sweep |
| `fm_rw2_s` ↻ | Sun, sock, sausage and snowman. They all start with... | 8 | 5.5 s | Reward 2 (was "…and sunflower"; sunflower is no longer in W2) |

All follow TEACHER_SCRIPT §2.4. Every line is a whole sentence of four or more words, except the celebrations. Instructions end in full stops. "!" appears only on "Bow rain!", "Coat rain!" and the reward. There are no letter names. A word said inside a line is part of that one whole recording.

---

## 6. Decisions made without asking (for docs/DECISIONS.md, at integration)

| # | Decision | Why |
|---|---|---|
| RS1 | **Retire the fish-dog, the dog-fish, the swap and the "which row did I read?" game** in W2 and W4, with their pictures and lines. | They are Mentava's readiness check and its pairs (§2). Jonas: "I don't want it to come across as stealing from Mentava." |
| RS2 | **Picture reading uses real compound words whose reverse is silly.** No emoji and no animal + animal. | This is DISTAR's and Sounds~Write's ground, not Mentava's, and a 3-year-old gets the joke of a silly reverse. |
| RS3 | **The tortoise is the slider's handle; the rabbit tap is the fast way.** | It is the house's slow and fast pair (§9), and a clear thing for a small finger to grab. |
| RS4 | **The audio is discrete and paced by the voice**, never tied to speed and never continuous. | This is what the prior art does (§3.4), it keeps gaps and pure sounds, and a flick can't mangle it. |
| RS5 | **A backwards slide never reads**; it gets one gentle line and the arrow. | The child's mistake must not earn the funny picture. |
| RS6 | **"Bow rain" is pictured, once, in Sensei's show**; W4 gets "coat rain". Every other reversal is said only. | The picture is what makes order matter to a 3-year-old, and the show, not the child's mistake, is where it belongs. |
| RS7 | **The ninja makes one straight dash on the fast word and returns in a smoke puff**, with no strike on each item. | Jonas: the back-and-forth "is counterproductive". |
| RS8 | **The slide names the parts**: no "This is rain." before a slide. | It saves about 3 s an item, and the slide itself is the naming. |
| RS9 | **The first meeting is rainbow (Sensei), snowman and cupcake**; sunflower if cupcake's picture fails the audit. | §4.4. |
| RS10 | **Taps on the cards in order count as a slow read.** | A fallback for a child who can't drag yet. |
| RS11 | **The sound slider plays slices of the checked slow word**, not the raw pure-sound clips. | It keeps the voiced closures and the 0.24 s short vowels (§9.1). |
| RS12 | **No new line uses "fast".** | The BATH vowel (§9.8). |
| RS13 | **W2's sound bridge is a ◇ Sensei show; W6 is the child's Sound Slider.** In the Reception version the bridge is not optional. | W2's 65 s budget. Reception skips W3–W6, so W2 is its only sound-slider meeting. |

---

## 7. Changes needed in existing files (for `docs/fix-requests.md`, "## Picture reading v2 and the read slider (27 Sep)")

1. **`src/content/warmups.ts`**
   - Add a new `Beat` kind, `slide`, roughly `{ kind: "slide"; parts: string[] | "sounds"; word: string; by: "sensei" | "child"; gag?: { reverse: string; pic: string; line: string }; intro?: string }`.
   - **W2:** replace the `rail`, `swap`, `which`, `compound` and `tapall` beats with §5.3's beats. Set `stickers: ["rain","bow","snow","man","snowman","cup","cake","cupcake"]` and `shiny: "rainbow"`.
   - **W2 Reception version:** the same slide beats, keeping its "/a/ in it" `tapall`, with the mop sound-slider teaser **not optional** (Reception never plays W6).
   - **W4:** per §5.6. **W6:** `dots` becomes `slide` with `parts: "sounds"`.
   - Update `CHILD_KINDS`, `beadsOf` and `warmupPictures()` for `slide`.
2. **`src/scenes/Warmup.tsx`**
   - Render `<ReadSlider>` for `slide` beats.
   - Drop the rail's per-card hops, the leapfrog, the "which" rows, the fish-dog merge and `tv_silly`.
   - The ninja: a slow kata during the slow way; `dash` along the rail on the fast word, then `fx.puff` away and back home, with no visible return.
3. **`src/content/lines.ts`:** §5.9's block, appended. Retire (from these paths) `fm_read_fish_dog`, `fm_pair_fish_dog`, `r2_dog_fish`, `fm_l2_swap`, `tv_silly`, `tv_which_*`, `fm_which_*`, `fm_read_cat_dog_fish`, `fm_triple_*`, `fm_l4_swap`, `tv_squish_frame`, `tv_squish_slow`, `tv_squish_fast`, `fm_starfish_q` and `fm_starfish`. Keep `tv_squish_ready`, `fm_tap_rabbit` and `tv_fs_now_fast`.
4. **`src/scenes/Stickers.tsx` (Reward 2):** take the new texts of `fm_rw2_list`, `fm_rw_shiny` and `fm_rw2_s`, and change the shiny sticker from `fishdog` to `rainbow`.
5. **`src/content/phonics.ts` `ORAL_WORDS`:** add cupcake (then the tier B and C words), with `pic` prompts, `first` and `segs`, so gen-audio's word path and the picture audit see them.
6. **`src/content/living.ts`:** add cowboy, lady, ladybird, fly, butterfly, jellyfish, hedgehog and seahorse. **`src/content/pic-names.ts`:** after a redraw, re-audit `rain` (today it is named "cloud") and `sea` (today it is named "wave").
7. **`scripts/art-manifest.ts`:** add the art jobs in §4.5, plus redraws of `pic_rain` and `pic_sea`.
8. **Fish-dog references** to remove or retarget (grep `fishdog|fish-dog|dogfish|fish_dog`):
   - code: `src/App.tsx`, `src/scenes/ConfirmDemo.tsx`, `src/scenes/Early.tsx`, `src/core/types.ts`, `src/cheat/{actions,jumps,CheatMenu}.ts(x)`, `src/engine/{feedback,store}.ts`, `src/content/{word-times,pic-plates.gen,pic-names,living,slow-times.gen}.ts`, `src/core/content/line-tags*.ts`, `src/styles/warmup.css`, `scripts/gen-pic-plates.py` and the tests `src/ui/confirm.test.ts` and `src/cheat/actions.test.ts`;
   - docs: TEACHER_SCRIPT §3.7, §3.8 and §3.10; FIRST_MINUTES §7 and §8; NAVIGATION; CONFIRM; CHEATS; MAP_DESIGN; ART_STYLE (the example "the fish-dog"); and `docs/architecture/*`.
9. **The game registry** (TEACHER_SCRIPT §2.6): `rail` and `compound` become one game, "Ninja Reading" ("Ninjas always read this way. Little words make long words."), and `dots` becomes the Sound Slider.
10. **Marketing:** the 26 Sep tweet's "fish-dog warm-up" clip (`assets-src/tweet/2026-09-26/`) is already public. Future trailers and landing shots should use the rainbow slider.

---

## 8. Left open, not blocking (decided for now as above)

- **The tortoise as the handle for older children.** Year 1 and 2 may find it babyish. Start with the tortoise for the warm-ups, and give the Year 1+ slider (under written words) a plain brush-glow handle.
- **Holding continuants under a resting finger** (Sounds~Write EC 4.2, "mmmaaat"). This needs sustainable recordings of the continuants and a rule for stops. It fights FS1's gaps, so it is not done. Jonas's ear decides if it ever comes back.
- **A shiny "bow rain" sticker** in place of the shiny rainbow. It would be a funnier reward, but it puts a non-word into the Sticker Book. Kept as the rainbow for now.
- **The slider in every read-back** (Word Building, Kai and Suki, Story Time help), as Sounds~Write's "slide your finger along under the word". It is a natural next step, and needs a design pass per game.

---

## 9. Sources

**Mentava**
- Readiness check: https://www.mentava.com/readiness-check
- Is your child ready to read: https://www.mentava.com/ready-to-read
- Parents page and the dogfish test: https://www.mentava.com/parents
- Tactile blending, waveform and age rule: https://www.mentava.com/learn-to-read-software
- How it works: https://www.mentava.com/how-it-works
- The flying chick: https://www.mentava.com/blog/how-we-teach-blending-using-visual-feedback
- What makes Mentava different: https://www.mentava.com/blog/what-makes-mentava-different
- The fish-dog lesson, 3–4 tries: https://www.mentava.com/case-studies/byrne/
- Dustin Coates, first review: https://www.dcoates.com/posts/mentava-review/
- Dustin Coates, a year later: https://www.dcoates.com/posts/mentava-review-follow-up/
- A parent on Medium: https://medium.com/@jacqueline.momoh22/why-a-500-month-childs-reading-app-caught-my-eye-f3513d4e77b7
- The Tim Ferriss episode, summarised: https://www.thefabulous.co/pod/tim-ferriss/mentava-reading-app-does-the-500-method-work/

**Engelmann, *Teach Your Child to Read in 100 Easy Lessons***
- Lesson 1 excerpt: https://www.simonandschuster.net/books/Teach-Your-Child-to-Read-in-100-Easy-Lessons/Phyllis-Haddox/9780671631987
- Lesson outlines: http://arthurreadingworkshop.com/wp-content/uploads/2018/10/TeachYourChildToReadLessonOutline1-4.pdf
- Research and reviews: https://startreading.com/research-reviews/

**Sounds~Write** (local): `assets-src/sw-sources/research/sections/`
- `teacher-language.md`
- `lessons.md`
- `error-correction.md` (the Walker "follow my finger" passage)
- `nursery-precode.md` §12.6
- `polysyllabic.md`
- `initial-code.md`

**Apps**
- Reading Doctor: https://www.readingdoctor.com.au/word-builder-overview-of-features
- Read Write Phonics review: https://www.mum-friendly.co.uk/app-time-read-write-phonics/
- Lotty Learns: https://www.lottylearns.com/interactive-phonics-trainer
- Rev & Read: https://mwm.ai/apps/rev-read/6758241758
- Phonixo: https://phonixo.com/
- Duolingo ABC review: https://www.phonics.org/learn-to-read-duoling-abc-review/
- Duolingo ABC: https://abc.duolingo.com/how-we-teach
- Teach Your Monster to Read: https://www.teachyourmonster.org/teach-your-monster-to-read-mini-games/
- Teach Your Monster to Read help: https://help.teachyourmonster.org/en/articles/5736688-how-is-teach-your-monster-to-read-educational
- Reading Eggs: https://readingeggs.ca/articles/synthetic-phonics/
- Reading Eggs: https://readingeggs.com/articles/reading-eggs-or-fast-phonics-which-reading-program-to-use-for-students/
- Phonics Hero: https://phonicshero.com/have-a-go/
- Hooked on Phonics: https://apps.apple.com/mu/app/hooked-on-phonics-learn-read/id588868907
- Khan Academy Kids: https://khankids.zendesk.com/hc/en-us/articles/4403698893965-Phonics-The-building-blocks-of-literacy
- Nessy: https://blogs.glowscotland.org.uk/st/public/dunblaneprimary/uploads/sites/3109/2017/10/Nessy_Reading_User_Guide.pdf

**Classroom practice**
- Point and sweep (a Surrey school's guide): https://www.stpaulsschool-dorking.co.uk/attachments/download.asp?file=4278&type=pdf
- Sound sled: https://www.lenny.com/lesson/blending-cvc-words-802988
- Foundations A–Z ("The first letter in a word is on the left"): https://www.thereadingleague.org/wp-content/uploads/2026/02/The-Reading-League-Curriculum-Navigation-Report-Foundations-A-Z.pdf

**In this repo**
- `docs/TEACHER_SCRIPT.md` §2, §3.7–§3.12, §9
- `docs/FIRST_MINUTES.md` §7, §11
- `docs/HERO.md`
- `docs/ART_STYLE.md`
- `PROMPTS.md` #58
- `docs/FEEDBACK.md` line 117
- The asset check was run on 27 Sep (§4.2), and clip lengths were measured with ffprobe.
