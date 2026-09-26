# Sound display: a sound is always its petal

**Status:** audit and spec, 26 September 2026, from reading every scene and playing the game at 844×390 (Playwright, `?fast=3`, a "perfect" and a "learner" bot). Evidence: `playtest/sound-display/` (the frames and stills cited here, and `run1-summary.md`); the whole run, with every frame and `log.json`, is in `playtest/runs/sound-display/run1/` (git-ignored, about 400 MB). Frame paths below are relative to `playtest/sound-display/`. The probe is `scripts/treadmill/sound-display.ts`; stills come from `scripts/treadmill/sound-shots.ts`.

**Jonas (verbatim):** "when showing the student a sound as opposed to a spelling, you always have to show it in the petal shape in all games with the image at the top of the petal or next to it, so like kite or whatever."

**Line numbers** were checked at about 21:10 on 26 September. Another workflow was editing `src/scenes`, `src/App.tsx` and `src/ui` during the audit (it added the warm-ups' sound picture while the probe ran), so each row also names the function. Search for the function if a line has moved.

---

## 1. The rule, made precise

A **sound** is a phoneme: /ae/, /sh/, /k/. A **spelling** is the letters that write it: < ai >, < ay >, < a-e >. The game already draws spellings as letters on tiles, gems, chests and word cards, and that stays. Jonas's rule is about the other half: whenever the game shows the child a sound, the child sees its **petal**. The petal is the chart teardrop in the sound's chart colour, with the sound's chart picture in its round top (or beside it when the round top holds gems). The chart data is `src/content/flower.ts` `CHART_PETALS` and the pictures are `public/a/i/petal_<id>.webp`.

Each time the game says a pure sound (a `{ sound }` clip), it is doing one of three jobs. The job decides what the child sees:

| The sound is… | Examples | The child sees |
|---|---|---|
| **A. Presented**: named on its own, as the subject of a question, a teaching, a correction, a reminder or a reward | "Which one starts with… /m/?", "Listen… /b/ /b/", "That's /s/. We need /m/.", "It's two letters, but it's one sound.", "You won back a sound!" | **Its petal**, visible before the clip starts, swelling as it plays. Two sounds get two petals. |
| **B. A spelling's voice**: the sound a tile, gem or sound button makes as it lights up | building a word tile by tile, blending ("c… a… t… cat!"), reading back, sound buttons, a sticker saying its word | **The letters**, lit while their sound plays. No petal. |
| **C. The question**: the child has to find the sound themselves | dictation ("What's the first sound?"), oral blending ("Listen to the sounds. What word do they make?"), which sound changed in a swap | **Nothing that names it** until the child has answered. A neutral marker (a dot, a line) may show *how many* sounds or *where*. |

Why B and C get no petal:
- **B.** Reading is going from letters to sounds unaided. A picture popping up on a letter tile turns into a letter mnemonic, which `src/content/phonics.ts` rules out ("No mnemonics attached to letters") and Sounds~Write avoids. It would also decode the word for the child.
- **C.** Showing the petal would do the segmenting for them (NARRATIVE_AUDIT F27/F29: never say a word's sounds one by one to a child who is spelling it). Many petal pictures are also answer pictures (see §5, A12), so a petal would give picture answers away.

A petal and letters meet in exactly one kind of moment: **sound → spelling teaching**. Examples are Dojo Learn ("this is how we spell it"), "This is how we spell… /m/" under a chosen picture, the gems inside a petal, and the find-the-spelling turns. There the petal sits **beside** the spelling, never on it.

---

## 2. What is wrong today, most important first

1. **Rewards that name sounds show none.** "You won back a sound!" / "You won back some sounds!" (App `Reward`) plays over stickers and gems, with no petal anywhere (`frames/w1-2-perfect-019-talk-petals_got-NONE.png`, `frames/w2-1-perfect-057-talk-petals_got-NONE.png`). It also counts spellings, not sounds: w6-1 teaches < ai > and < ay >, one sound, and says "some sounds".
2. **Corrections, Help and asides name sounds with no petal.** "That's /s/. We need /m/." (the shared `correction()`, used by Dojo Build, Battle and Swap), Dojo Find's "That's /d/. Listen… /b/", Help's "Look! I'll show you. /m/" (Build, Battle, Swap), Swap's "That's /h/. That sound stays the same.", and the reading check's "If it was sit, this would be /i/. Is it? No! It's /a/." Only a child who is struggling hears these, so the child who most needs the picture never gets it.
3. **"Two letters, one sound" shows no sound.** The spaced reminder after a word is read (`lettersReminder`, in Dojo Build, Battle, Swap, Run and Story) lights the tile and says "It's two letters, but it's one sound." without showing the one sound (`frames/w5-6-perfect-056-talk-t_two_letters-NONE.png`). This is the moment Jonas heard in the transcript ("A, two letters, one sound"). With a petal it becomes concrete: two letters on the tile, one petal above it.
4. **Two-sound explanations show one petal, the wrong one, or a blank.**
   - < x > in Dojo Learn is taught as `/ks/`. /ks/ has no chart petal and no picture, so the child sees a **blank beige petal** while Sensei says "two sounds together! /k/ /s/" (`frames/w3-6-perfect-005-sound-k-NONE.png`).
   - Learning < th > as in "this" (w5-1): Sensei says "sometimes /th/… and sometimes /dh/" while only the /dh/ feather shows, so the child **hears /th/ while looking at /dh/'s picture** (`frames/w5-1-perfect-023-sound-th-NONE.png`).
   - The World Flower's "The same spelling can sometimes be…" and "This can be /a/, but in this word, it's /ae/." get one petal at most.
5. **Petal pictures give answers away.** Ten chart pictures are also the game's picture cards: pig, dog, ship, ring, chick, train, tree, boat, apple and moon. Card art also exists for car, bird, chair, ear, mouse, kite and whale. In w1-3, "Which one starts with… /a/?" can offer the apple card while the /a/ petal *is* an apple. In w1-10, /p/'s pig is in the same deck (both checked against the decks' own filters). Placement's find-all can do the same with /ae/ train, /ee/ tree and /oe/ boat. `content/validate.ts` does not check for this.
6. **Petals too small to read on a phone.** The stage is scaled to 0.54 at 844×390, so a petal of width *w* stage px is 0.54·*w* CSS px. The nav row's 96-wide petal has a 58 px picture, about 31 CSS px. Sorting's 84-wide top-bar petal has about a 25 CSS px picture (a smudge that might be a train, `stills/sort-9000.png`). The World Flower's top-right slot is 64 wide. At every size the speaker in the petal's point eats space.
7. **"Petal" is also a rainbow counter.** `item_petal.webp` is the same teardrop in rainbow colours with no sound. It is collected and counted in the Ninja Run, lights up as a tally under Dojo Learn, drifts on the title, and bursts as particles everywhere. "Every petal is one sound" (the World Flower's intro) competes with petals that are points.
8. **The big petal's picture sits in its point.** `BigPetal` (gem trips, gem victory) puts the picture at 58% of the height, low in the point, below the gems (`frames/tree-found-th-perfect-001-sound-dh-petal.png`). Jonas asked for the top or the side. The chart scroll does it right: top-right shoulder, 64 px.
9. **No introduction moment.** The first time a child meets a sound (the warm-ups' notice, Dojo Learn, Reward 2, a new sound in a gem trip), its petal just pops in like any other button. A sound's arrival should look like an arrival (§4.6).

What already works (the probe confirms the petal is on screen as the sound plays): the first-sound, find-the-spelling and sound-hunt turns, the warm-ups' notice and tap-all (added during this audit), Dojo Learn and Find's question, placement's sound, gap and find-all rounds, sorting's top bar, the World Flower's first visit, petal panel, chart scroll, trips and gem victory.

---

## 3. Every place a sound is shown

"Now" is what the child sees at 844×390; "Must" is what the child should see. **A/B/C** is the job from §1. ✓ means it already meets the rule.

### 3.1 Warm-ups and the first session

| # | Screen | Element | File:line | Now | Must |
|---|---|---|---|---|---|
| 1 | W1 "notice" | "Did you notice? Sun and sock start with the same sound… /s/", "Say that sound with me! /s/" (A) | `Warmup.tsx` `noticeShow` 1404 (`patch({ sound })` 1423), `TurnNav` 1764 | ✓ /s/ petal in the nav row from "the same sound" on (added 26 Sep evening) | ✓, plus the **introduction animation** (§4.6), because for a child who starts at W1 this is now their very first petal |
| 2 | W1/W2/W3 "tap all" | "Tap all the pictures that start with… /s/" / "…with /a/ in them", finds, "They all start with… /s/", "This is how we spell /s/" (A) | `Warmup.tsx` `tapall` 709 (746, 787) | ✓ nav-row petal from the question on | ✓ |
| 3 | W1 "notice", dots under the two cards | the first dot turns gold on the held first sound (C) | `Warmup.tsx` `noticeShow` 1414 | gold dot | ✓ as is: a position, not a sound's name |
| 4 | W5 "sounds to words" | "I'll say the sounds. You listen for the word!" then /s/ /u/ /n/ (C: oral blending) | `Warmup.tsx` `sounds` 1145 | nothing on screen while the sounds play | **No petals during the question** (the /d/ petal is a dog, and "dog" is an answer card in this very game: `frames/w1-wu5-perfect-002-sound-s-NONE.png`). Add a row of neutral dots under the cards, one per sound, each lighting as its sound plays. After the right answer the dots may bloom into the sounds' petals under the chosen picture (§5, A1) |
| 5 | W6 "sound dots" | "Every dot is a sound. Ninjas tap them this way!" and each tapped dot says its sound (A once tapped) | `Warmup.tsx` `dots` 1236, `Dots` 1944 | plain dots that turn gold (`frames/w1-wu6-perfect-001-sound-s-NONE.png`) | Once a dot has sounded, it becomes that sound's **mini petal** (72 wide, picture 50). It goes back to a dot for the next word (§5, A4) |
| 6 | Reward 2, step 1 (Sticker Book open) | "Sun, sock, sausage and sunflower. They all start with… /s/" (A) | `Stickers.tsx` step `stickers` 347, 399 | ✓ nav-row /s/ petal (the held step's `sound`) | ✓ |
| 7 | Reward 2, step 2 | "You found your very first sound! Look, its petal is shining through the mist." "This petal is for the sound… /s/" (A) | `Stickers.tsx` step `petal` 412–458, `WorldFlower` 578 | the /s/ petal lit on a 320 px World Flower, its picture a red dot about 10 CSS px across, plus the nav-row petal (`frames/reward2-perfect-003-sound-s-petal.png`) | The /s/ petal **lifts out of the flower** as a 220-wide SoundBadge with the introduction animation on "/s/"; the nav-row duplicate goes |
| 8 | Training | gong, Help, speaker | `Training.tsx` | no sounds | nothing |

### 3.2 Early levels (first sound, sound hunt, early dojo)

| # | Screen | Element | File:line | Now | Must |
|---|---|---|---|---|---|
| 9 | First sound (w1-2, w1-3, w1-10) | "Which one starts with… /m/?", "Map starts with… /m/", "This is how we spell… /m/" (A) | `Early.tsx` `FirstSoundLevel` 1307, 1317, 1326; `TurnNav` 769 | ✓ nav-row petal, 96 wide | ✓, larger picture (§4.2). A turn **never offers the petal's own picture word as a card**: /a/'s apple, /p/'s pig (§5, A12) |
| 10 | First sound, find phase | "Find this sound… /m/" over letter tiles (A, sound → spelling) | `Early.tsx` 1365 | ✓ nav-row petal | ✓ |
| 11 | Sound hunt (w1-7, w1-11) | "Which one has this sound in it? /i/", "Pin has this sound in the middle… /i/" (A) | `Early.tsx` `SoundHuntLevel` 1431 | ✓ nav-row petal | ✓ |
| 12 | "How we write it" lines under the chosen picture | a spelling tile appears on the sound's line (B) | `Early.tsx` `RevealAt` 1204, `SoundLines` 808 | tile on a line | ✓ (the petal stays in the nav row beside it) |
| 13 | Early dojo, build | a tapped tile flies home saying its sound; the I-do demo; "Say the sounds… and read the word!" read-back (B) | `Early.tsx` `BuildOne` 1650, 1709, 1799 | lit tiles | ✓ no petal |
| 14 | Early dojo, build | "What's the first sound?", "What's the last sound?" (C) | `Early.tsx` `BuildOne` 1602 (`slotQ`) | nothing | ✓ nothing until answered |
| 15 | Reading check | sound buttons: tap each and hear its sound (B) | `Early.tsx` `ReadOne` 1975 | lit tile | ✓ no petal |
| 16 | Reading check, a wrong reader chosen | "If it was sit, this would be /i/. Is it? No! It's /a/." (A, two sounds) | `Early.tsx` `ReadOne` 2052 | the tile lights; nothing names the sounds | A **sound pair** pops above the lit tile: /i/ as it is said, then /a/. The /i/ petal dims and shakes; /a/ stays bright until the next turn (§4.5) |
| 17 | Listening Ears (retired level kind) | "listen_sounds" + a word's sounds (C) | `Early.tsx` `ListenLevel` 1230 | nothing | as row 4, if it ever comes back |

### 3.3 Dojo

| # | Screen | Element | File:line | Now | Must |
|---|---|---|---|---|---|
| 18 | Learn | "Listen… /b/ /b/", "And this is how we spell it… /b/", "Tap it, and say it with me!" (A, sound → spelling) | `Dojo.tsx` `Learn` 388, SoundBadge 547 (200 wide) | ✓ the petal centred, then it steps aside for the tile (`stills/dojo-learn-11000.png`) | ✓, plus the **introduction animation** on the first /b/. Two more changes: the petal is 220 wide with the picture at 70%, and the two "say it with me" tally petals (`item_petal`, 560) become two mini /b/ petals that light in turn |
| 19 | Learn < x > (w3-6) | "This spelling is two sounds together!" /k/ /s/ (A, two sounds) | `Dojo.tsx` `Learn` (`p` = "ks"), `lettersSay` in `narrate.tsx` 70 | a **blank beige petal** (no chart entry, no picture) | a **sound pair** /k/ (anchor) + /s/ (circle) with a small "+" between them, each swelling on its own clip. Never a SoundBadge for `ks` (§5, A9) |
| 20 | Learn < th > = /dh/ after /th/ (w5-1) | "The same spelling can sometimes be /th/ in moth… and sometimes /dh/ in this" (A, two sounds) | `Dojo.tsx` `Learn` 414 (`sameSpellingSay`) | only /dh/'s feather while /th/ is said | a sound pair: /th/ (three stars) appears beside the feather as it is said, then dims when /dh/ plays; /dh/ stays |
| 21 | Learn, another spelling of a known sound | "Ooh! You already know this sound…" (A) | `Dojo.tsx` `Learn` 416 | ✓ the known sound's petal | ✓ (skip the introduction animation: it is not new) |
| 22 | Find | "Can you find… /b/?" and its Help (A) | `Dojo.tsx` `Find` 568 (`useNav({ sound: p })`), 605 | ✓ nav-row petal | ✓ |
| 23 | Find, a wrong tile | "That's… /d/. Listen… /b/." (A, two sounds) | `Dojo.tsx` `Find` 633 | only /b/ (nav row); /d/ has no petal | /d/ **pops** above the tapped tile while it is said; the nav-row /b/ swells on "/b/" |
| 24 | Build | a tapped tile's sound; the blend when the word is done (B) | `Dojo.tsx` `Build` 799, 833 | lit tiles | ✓ no petal |
| 25 | Build, "Which sound?" / Help 1–2 (C) | the word, stretched; an arrow at the slot | `Dojo.tsx` `Build` 761–768 | no petal | ✓ |
| 26 | Build, Help 3 | "Look! I'll show you. /m/" and the right tile glows (A) | `Dojo.tsx` `Build` 769 | nothing names /m/ | /m/ pops above the active slot |
| 27 | Build, second miss | "That's… /s/. We need… /m/." or "Yes, that's a spelling of that sound too! But in this word, we spell it like this… /m/" (A) | `Dojo.tsx` `Build` 862 → `engine/feedback.ts` `correction` 22 | nothing | /s/ pops above the wrong tile, then /m/ above the active slot. In the "same sound" case one petal spans both tiles: the same sound, two spellings |
| 28 | Build, after the word | "It's two letters, but it's one sound." / "This can be /th/, but in this word, it's /dh/." (A) | `Dojo.tsx` `Build` 837 (`lettersReminder`, `twoSoundsReminder` in `narrate.tsx` 77, 87) | the tile lights; no sound shown | one petal pops above the lit tile on "one sound" (the tile's own sound, played straight after the line). For the two-sounds reminder, a sound pair (row 16's pattern) |

### 3.4 Battle, Swap, Ninja Run, Story

| # | Screen | Element | File:line | Now | Must |
|---|---|---|---|---|---|
| 29 | Battle | each tile's sound as it lands; the finishing blend (B) | `Battle.tsx` 648, 889 | lit tiles | ✓ |
| 30 | Battle, second miss | "That's /s/. We need /m/." (A) | `Battle.tsx` 687 | nothing | as row 27 |
| 31 | Battle, Help 3 | "Look! I'll show you. /m/" (A) | `Battle.tsx` 1103 | nothing | as row 26 |
| 32 | Battle, after the word | two-letters / two-sounds reminder (A) | `Battle.tsx` 929 | lit tile only | as row 28 |
| 33 | Gem Trial | the trial's gem | `Battle.tsx` 1198 | the gem in the old `PHONEMES` category colour | the gem in its sound's chart colour (`petalColour`), as everywhere else |
| 34 | Swap, the wrong sound tapped | "That's /h/. That sound stays the same. Listen: hat… hot." (A) | `Swap.tsx` 404 | nothing | /h/ pops above the tapped letter |
| 35 | Swap, choosing the new spelling | "Yes, the middle sound changes! Now pick the new sound." over spelling tiles (C) | `Swap.tsx` lines `audit_swap_*` | tiles | no petal: which sound it is is the question (§5, A8) |
| 36 | Swap, Help 3 / wrong spelling | "Look! I'll show you /o/" (564); the shared correction (547) (A) | `Swap.tsx` 547, 564 | nothing | /o/ pops above the gap; the correction as row 27 |
| 37 | Swap, blend and reminder | (B), then the reminder (A) | `Swap.tsx` 485, 490 | lit tiles | reminder as row 28 |
| 38 | Ninja Run, blend mode | "Listen to the sounds. What word do they make?" then /k/ /a/ /t/ (C: oral blending) | `Run.tsx` 653 | nothing (`frames/w1-9-perfect-001-sound-a-NONE.png`) | no petals; neutral dots in the banner, one per sound, lighting as each plays (§5, A1) |
| 39 | Ninja Run, a catch or a wrong lantern | the word lights sound by sound; "That's… [sounds] [word]. Listen… [sounds]" (B) | `Run.tsx` 813, 862 | lit word | ✓ no petal |
| 40 | Ninja Run, reminder | two-letters reminder (A) | `Run.tsx` 819 | lit word | as row 28 |
| 41 | Ninja Run, top bar and track | the rainbow petal counter and the petal pickups | `Run.tsx` 2162, 604, 469 | `item_petal`, a teardrop that is not a sound | not a petal (§5, A11) |
| 42 | Story | tapped words and choice words sound out (B); the reminder (A) | `Story.tsx` 569–570, 849 | lit spellings | reminder as row 28 |

### 3.5 Sorting

| # | Screen | Element | File:line | Now | Must |
|---|---|---|---|---|---|
| 43 | Sorting, top bar | the sound being sorted (A) | `Sort.tsx` 799 (84 wide), `useNav` 756 | ✓ but 84 wide: the train is about 25 CSS px (`stills/sort-9000.png`) | 104 wide at least, with the picture at 70% |
| 44 | Sorting, the introduction | "Sorting time! These words have the same sound…", each chest hopping on "/ae/" and "It's two letters, but it's one sound" (A) | `Sort.tsx` intro 418–437 | the tiny top-bar petal swells, far from the chests | a **220-wide petal** stands above the chests for the introduction. Each chest's spelling "comes out of it" as its chest hops. Then the petal shrinks into the top bar |
| 45 | Sorting, chests and words | spellings on chests; each word blended (B) | `Sort.tsx` 826, 91 | letters | ✓ |

### 3.6 Placement ("Show Sensei")

| # | Screen | Element | File:line | Now | Must |
|---|---|---|---|---|---|
| 46 | Sound round | "Which is the spelling of this sound? /t/" (A) | `Placement.tsx` 154, `useNav` 168 | ✓ nav-row petal | ✓ |
| 47 | Gap round | "Which spelling of /ae/ is in rain?" (A) | `Placement.tsx` 160 | ✓ | ✓ |
| 48 | Find-all round | "Tap every picture that has this sound. /ee/" (A) | `Placement.tsx` 161, `findAllRound` 95 | ✓ petal, but the options can include the petal's own picture (train, tree, boat) | ✓, and `findAllRound` leaves the petal's picture word out (§5, A12) |
| 49 | Spell round | each tile's sound (B) | `Placement.tsx` 263 | lit tiles | ✓ |

### 3.7 The World Flower

| # | Screen | Element | File:line | Now | Must |
|---|---|---|---|---|---|
| 50 | First visit, step 2 | "Every petal is one sound. Listen! This is the petal for the sound… /a/" (A) | `Intros.tsx` `FlowerIntro` 89 (260 wide) | ✓ (`frames/flower-intro-perfect-002-sound-a-petal.png`) | ✓, plus the introduction animation |
| 51 | Free view | every met petal with its picture near the tip; a tap opens the panel and says the sound (A) | `Tree.tsx` `WorldFlower` 95, 177; `openPetal` 1316 | ✓ (pictures are about 10–14 CSS px: an overview) | ✓: the panel is the close-up |
| 52 | Petal panel | the sound as a tappable petal; the gems (spellings) beside it (A) | `Tree.tsx` `PetalDetail` 1571, 1640 (200 wide) | ✓ | ✓ |
| 53 | Chart scroll | every met petal with its picture top-right, the spellings as gems inside; unmet ones in mist (A) | `Tree.tsx` `ScrollPetal` 378, 462 | ✓ | ✓ (this is the "next to it" pattern the big petal should copy) |
| 54 | Trip: new spellings found | the petal big, its gems, the example words; the nav-row petal for the beat's sound (A) | `Intros.tsx` `GemFound` 116, 214, 237; `Tree.tsx` `BigPetal` 691 | the picture sits low in the point, under the gems; the same sound is drawn twice (big petal + nav row) | the picture moves to the **top-right shoulder** at 30% of the petal's width. The nav-row petal only shows a sound the big petal isn't (the "other" sound of a same-spelling beat) |
| 55 | Trip: same spelling, two sounds | "The same spelling can sometimes be /o/ in hot… and sometimes /oe/ in go." (A, two sounds) | `content/teach.ts` `twoSounds` 315, `sameSpelling` 193 | the big petal (/oe/) plus, by luck, the nav row's first sound (/o/) | explicit: /o/'s petal pops beside the big petal as it is said, then dims |
| 56 | A new land's visit, recap | one sound re-explained (A) | `Intros.tsx` `WorldVisit` 335 (88 wide) | ✓ but 88 wide; in the "two sounds" recap only the second sound shows | 104 wide; a sound pair for the two-sounds recap |
| 57 | Gem victory | "This is the way we spell /ae/ in rain…", the petal flying home (A) | `Tree.tsx` `GemVictory` 800, 1017 | ✓ big petal + nav-row petal | as row 54 |

### 3.8 Rewards, map and everything else

| # | Screen | Element | File:line | Now | Must |
|---|---|---|---|---|---|
| 58 | Level reward | "You won back a sound!" / "…some sounds!" (A) | `App.tsx` `Reward` 775, 806, 837 (`talk`) | no petal (`frames/w2-1-perfect-057-talk-petals_got-NONE.png`) | the won sounds' petals (distinct *sounds* of `level.teach`) rise into the panel with the short introduction animation. Each says its sound after the line ("You won back a sound! /m/"). Singular or plural by sounds, not spellings |
| 59 | Level reward, gems | gem energy: spellings (B) | `App.tsx` 967 | gems in chart colours | ✓ |
| 60 | Title, choose, confetti | drifting rainbow teardrops; "petals" particle bursts | `App.tsx` `PetalDrift` 399; `ui.tsx` `FxLayer` 571 | `item_petal` | not a teardrop (§5, A11) |
| 61 | Map | stone icons | `App.tsx` `KIND_ICON` 495 | pictures, not sounds | ✓ (optional later: a stone that teaches a new sound shows its petal in mist until it is played) |
| 62 | Captions (grown-ups' setting) | a sound in Sensei's caption | `engine/audio.ts` 336, `ui.tsx` `SenseiDock` 330 | "/ae/" as text (or 🔊 unless revealed) | a 34 px still petal, as decided in DECISIONS.md (26 Sep) but **not built yet** |
| 63 | Grown-ups' sound check | label, example and a 30 px still petal | `Grownups.tsx` 113 | letters and petal | ✓ (for adults) |
| 64 | Intro film | "every petal was a sound", the petals scattering | `IntroFilm.tsx` | rainbow petals in the video | ✓ (they are the story's lost sounds) |
| 65 | Sticker Book, stories | stickers and story words say their sounds (B) | `Book.tsx`, `Stickers.tsx` 74, `Story.tsx` | lit letters | ✓ |

---

## 4. The petal presentation

### 4.1 Shape and colour

- **Shape:** the chart teardrop: a round top with the point down, width : height = 96 : 132 (`badgeHeight(w) = 1.375·w`), always upright. `src/ui/petal.ts` `teardropAt`.
- **Colour:** fill is the chart colour mixed 82% with white; the outline is the chart colour (9/200 of the width) over an ink line (15/200). The ink-dark /or/ is painted bronze (`petalColour`). Chart colours repeat (/ae/ and /d/ are both #e8312f, /oe/ and /i/ #f7a23b, /ue/ and /k/ #c77de8), so **the picture is the sound's identity and the colour is only a family cue**. Never tell sounds apart by colour alone.
- **Unknown sound:** grey-lilac mist with a "?" (as on the flower and the scroll). Never a blank petal. Today /ks/ falls through to a blank beige petal.
- **No letters** on or inside a petal. Grown-ups get "/ae/" as the `title` tooltip only.

### 4.2 Where the picture sits, and how big

| Kind | What it is | Width (stage px) | On a phone (×0.54) | Picture | Speaker glyph |
|---|---|---|---|---|---|
| **Hero** | a sound being taught or introduced, alone in the middle: Dojo Learn, the flower's first visit, Reward 2, the petal panel, sorting's introduction | 200–260 | 108–140 CSS px | in the round top, **70%** of the width, centred on the circle's centre | yes, in the point, 0.2·w |
| **Turn** | the sound a turn is about: the nav-row slot, placement, find | **104** (was 96) | 56 CSS px | round top, 70% (73 stage px, about 39 CSS px) | no: the whole petal is the button |
| **Header** | sorting's top bar, the World Flower's `top-right` slot, a land's recap | **104** (was 84 / 64 / 88) | 56 CSS px | round top, 70% | no |
| **Pop** | a sound named in a correction, Help or a reminder, anchored to a tile, slot, chest or card | 104 | 56 CSS px | round top, 70% | no |
| **Mini** | a sound inside a row: a W6 dot once sounded, the Dojo tally, a reward list | 72 | 39 CSS px | round top, 70% (27 CSS px) | no |
| **Petal with gems** | the petal holds spellings in its round top: `BigPetal`, `ScrollPetal` | 180–330 | — | **next to it**: on the top-right shoulder, overlapping the outline by about 15%, 30% of the petal's width (100 px on a 330 petal; the scroll's 64 px is right) | no |
| **Flower** | a petal on the World Flower | as the flower draws it | — | near the round tip, upright, 55% (as built) | no |
| **Caption** | grown-ups' captions | 34 | — | the picture only | no |

Minimums: the picture is **at least 70 stage px (38 CSS px on the smallest phone)** wherever the child has to recognise the sound. Mini petals are only a second cue for a sound that is also being said. The tap target is at least 82 stage px wide (44 CSS px). `SoundBadge` today draws the picture at 60% and a speaker from 64 px up (`SoundBadge.tsx` 39, 41), and the nav slots are 96 / 64 / 72 (`nav.tsx` 195–198).

The nav-row slot at 104 × 143 sits centred at (858, 634): y 562–706, clear of the caption bubble's bottom edge (562) and of Next (x 964 on).

### 4.3 Tap and sound

- A tap says the **pure sound** (`say({ sound })`) and plays nothing else. The petal presses in 4 px on finger-down (`tapProps`).
- It **swells** (1 → 1.14 → 1, 300 ms) every time its sound's clip starts, from anywhere (`onClip("sound:<p>")`), so the picture and the sound always arrive together (built).
- While Sensei is mid-way through a key explanation, a tap **nods** the petal and plays `sfx.tink` instead of cutting her off (as Dojo Learn does). It is never silently ignored.
- `aria-label` "Hear the sound", `data-nav="sound"`, `data-p`.
- The petal and Hear it again stay two separate buttons: the speaker repeats Sensei's question, the petal says the sound.

### 4.4 Showing up and leaving

- A petal is on screen **before** its clip starts (at least 150 ms), so the swell lands on the sound. A turn's petal shows from the question and stays for the whole turn (built in `TurnNav` and `useNav({ sound })`).
- A **pop** (rows 16, 23, 26–28, 34, 36) rises from its anchor with a small tail pointing at it: scale 0.6 → 1 in 200 ms, 150 ms before its clip. It leaves 700 ms after the clip ends (fade and shrink, 250 ms). There is one pop per anchor at a time; a second sound on the same anchor replaces it.
- A petal never covers the letters it is about. It sits above a tile or slot, with 12 px clear of the tile's top edge.

### 4.5 Two sounds at once (`SoundPair`)

The pair is used for < x > (/k/ + /s/), "sometimes /th/… sometimes /dh/", "This can be /a/, but in this word, it's /ae/", "If it was sit, this would be /i/… No! It's /a/", "That's /s/. We need /m/." and, when it is used, `whichSound` ("Does this word have /o/ or /oe/?").

- Two petals side by side, 12% of a petal's width apart, in the order they are said. Each appears as its own clip starts and swells on it.
- **Contrast** (a wrong sound, or "this can be… but here it's…"): the first petal dims to 50% saturation and shakes once when the second plays. The second stays bright.
- **Together** (< x >): a small gold "+" between them, and both stay bright. /ks/ and /kw/ never get a SoundBadge of their own. `kw` is unused and sw.ts already says to retire it.

### 4.6 The introduction animation (a sound met for the first time)

Used for the first petal of a sound the child has never been shown: the warm-ups' notice (the first /s/), the first first-sound turn for a sound, Dojo Learn, the flower's first visit, Reward 2, a new sound in a gem trip, and the level reward's short form.

1. **0 ms:** the petal appears as a misty unknown ("?" in grey-lilac) and grows 0.6 → 1 over 250 ms.
2. **On the sound clip's start** (`onClip("sound:<p>")`), all within about 350 ms:
   - The mist wipes up from the point.
   - The chart colour fills from the point upwards, as `BigPetal` fills with won gems.
   - The **picture pops in** (0.4 → 1.12 → 1), timed to the sound's onset.
   - A ring in the chart colour expands behind the petal (`fx.ring`, r 40 → 220) with six twinkles in its colour.
   - No sound effect plays under the pure sound (`audio.ts` already ducks effects).
3. **Afterwards:** a slow breathing pulse (1 ↔ 1.04, 1.6 s) until the child first taps it or the turn ends.
4. **With reduced motion:** the mist and the picture cross-fade in 300 ms.

Later appearances of a known sound use the ordinary pop-in (250 ms) and the swell.

### 4.7 Don'ts

- No petal **on** a letter tile or gem. A petal may stand **beside** one in sound → spelling teaching.
- No petal while the sound is the question (dictation, oral blending, swap).
- No petal of the target sound's own picture word among a turn's answer cards.
- No teardrop that isn't a sound: counters, pickups, tallies and confetti.
- No blank petal: an unknown sound is mist and "?", and a sound with no picture of its own is a pair.

---

## 5. Ambiguous cases and what I recommend

| # | Case | Recommendation | Why |
|---|---|---|---|
| A1 | **Oral blending questions** (W5, Ninja Run blend mode, the retired Listening Ears): the sounds *are* the question | No petals while the sounds play. Neutral dots light one per sound. After the right answer, the dots may bloom into petals under the answer (a small "that's how it's made" moment) | The petals' pictures would name picture answers (/d/ dog, /p/ pig, /a/ apple, /sh/ ship, /ch/ chick, /ng/ ring), and the child must blend by ear. **Jonas to confirm**: this is the one place where a sound is heard and deliberately not shown |
| A2 | **A spelling's voice** (build, blend, read-back, sound buttons, Sort's blend, Story, Sticker Book) | No petal; the lit letters are the display | A picture on a letter is a letter mnemonic (`phonics.ts`: none) and would decode for the child |
| A3 | **Dictation targets** ("What's the first sound?", "Which sound?", Help 1–2 while spelling) | Hidden until answered. The petal only arrives with Help 3 or the second-miss correction, where Sensei names the sound anyway | NARRATIVE_AUDIT F27/F29: never do the segmenting for the child |
| A4 | **W6's dots**: pre-letter sound buttons | Each dot turns into its sound's mini petal once tapped and sounded, for that word only | "Every dot is a sound": showing *which* sound after it is heard leaks nothing, because the picture card already is the word |
| A5 | **Sorting's chests** show spellings, but the game is about one sound | Chests keep letters; the sound is one petal, big in the introduction and docked in the top bar during play (rows 43–44) | Every chest is a spelling of the same sound: one petal, many spellings, as on the chart |
| A6 | **Gems and jewels** in the sound's colour | Keep: gems are spellings, and the colour ties them to their petal. Fix the gems that still use `PHONEMES[].colour` (Battle 1198, `narrate.tsx` 137) | One colour system |
| A7 | **A petal drawn twice** (a big petal plus the nav-row petal of the same sound in trips and the gem victory) | Drop the nav-row petal when a hero or big petal of the same sound is on screen, and make the big petal tappable (say the sound) | One sound, one petal; fewer things to look at |
| A8 | **Swap's "pick the new sound"** over spelling tiles | No petal (the task is to hear which sound changed). The line's wording ("sound" for a spelling tile) goes to the narrative audit | Showing the petal would answer the question |
| A9 | **< x > and < qu >** | < x > is always a sound pair /k/ + /s/. < q > is /k/ and < u > is /w/, as the chart has them; retire `kw` (sw.ts says so). No art needed | /ks/ is two sounds, and a blank petal is worse than none |
| A10 | **Level reward**: `s.petals` stores spellings (m, s, ai, ay), and "petal_got" / "petals_got" is chosen by counting them | Show and count **sounds** (`soundOf` of each taught spelling, de-duplicated). Rename the save field when it is next migrated | "You won back some sounds!" for < ai > + < ay > (one sound) teaches the opposite of the lesson |
| A11 | **The rainbow `item_petal`** as Ninja Run points, the Dojo Learn tally, `PetalDrift` and `fx` "petals" confetti | Ninja Run: count stars or ki orbs, not petals. Dojo tally: two mini petals of the sound being learnt. Confetti and drift: round blossom petals (a new, non-teardrop sprite). Keep the rainbow teardrop only for "all the sounds" (the film, the flower's heart) | "Every petal is one sound" is the metaphor the whole flower rests on |
| A12 | **A petal picture that is also an answer card** (pig, dog, ship, ring, chick, train, tree, boat, apple, moon; card art also exists for car, bird, chair, ear, mouse, kite, whale) | In any turn that shows a sound's petal, leave that petal's `iconWord` out of the options. Add a check to `content/validate.ts` for the first-sound decks (w1-3's apple and w1-10's pig today) and `findAllRound` | Otherwise the child matches two pictures instead of listening |
| A13 | **Pictures a 3-year-old won't hear as the sound** (/s/ circle, /m/ thumb, /k/ anchor, /h/ speech bubble, /uu/ drawn as a duck, /s/ and /b/ both red discs; DECISIONS.md) | Art review, separately. Now more urgent: W1's notice makes /s/'s red circle the first petal most children ever see | The petal only works if the picture says the sound |
| A14 | **"You found a new sound"** trips and **map stones** | Trips: yes (row 54). Map: optional later (a new-sound stone shows its petal in mist) | Low value next to the rest |
| A15 | **Two-letter reminders**: should the petal appear on "two letters" or on "one sound"? | On "one sound": the tile lights on "two letters", the petal pops above it on "one sound", and the tile's sound plays straight after | It pairs the words with the picture, and gives the reminder the sound it currently never says |

---

## 6. How to build it

1. **`SoundBadge` sizes** (`src/ui/SoundBadge.tsx`): picture 70%, speaker glyph only from 160 px, the mist state (`unknown`), and the introduction animation (`intro` prop, keyed to the next `sound:<p>` clip). Nav slots: `row.sound` 104, `top-right.sound` 104, `side.sound` 96.
2. **`SoundPair`** (`src/ui/SoundBadge.tsx`): `<SoundPair a b mode="contrast" | "together" />`, each half driven by its own clip.
3. **`SoundPop`** (`src/ui/SoundBadge.tsx`): `popSound(p, anchorEl)` returns a promise, shows 150 ms before the clip, and leaves 700 ms after. Used by the correction and Help paths (rows 16, 23, 26–28, 30–32, 34, 36, 37, 40, 42).
4. **Say which job a sound has** (`src/engine/audio.ts`): `{ sound: p, show?: "petal" | "tile" | "hidden" }`. The default for a lone `{ sound }` is `"petal"`; a spelling's voice passes `"tile"`; `{ sounds }` blends are `"tile"`, and `"hidden"` in oral blending. `correction()`, `lettersSay`, `canBe` and `sameSpelling` mark their sounds `"petal"` and the anchor (the wrong tile, the slot).
5. **A fallback so nothing is missed** (`src/ui/nav.tsx`, in the nav layer): on every `"petal"` clip, if no petal of that sound is visible, pop one at the scene's anchor (`useSoundAnchor(el)`) or, without one, just left of Sensei (x 1080, y 470). With this, a scene that forgets gets a correct-if-plain petal instead of nothing.
6. **Reward** (`App.tsx` `Reward`): the won sounds' petals, counted by sound (row 58, §5 A10).
7. **`BigPetal`** (`Tree.tsx`): the picture to the top-right shoulder (row 54).
8. **Content check** (`content/validate.ts`): no petal picture word among a sound turn's options (§5, A12).
9. **Sweep invariant** `sound-without-petal` (major) in `scripts/treadmill/sweep.ts`: when a `"petal"` sound clip starts, a visible `.sound-badge[data-p]`, `[data-petal]` or picture petal of that sound must be on screen. The probe below already does this check, keyed on the clip before the sound; with the `show` flag it can be exact.

---

## 7. Evidence

- **Probe:** `bun scripts/treadmill/sound-display.ts [--only w1-2,w2-1] [--persona perfect,learner]` plays 31 cases (the warm-ups, the early levels, Dojo, Battle, Swap, Run, Story, Sort, placement, training, and the World Flower's views, trips and victory) at 844×390. At the instant each pure sound clip starts, it records which petals are visible. It writes `summary.md` (per case and context: how often the sound's own petal was visible, and how) and a frame for the first misses in each context.
- **Run 1** (`playtest/runs/sound-display/run1/` and `run1-reward2/`; the summary is copied to `playtest/sound-display/run1-summary.md`): 61 runs (30 cases × 2 personas, plus Reward 2), with 1,317 pure-sound clips.
  - **After one of Sensei's lines:** 454 clips; the sound's own petal was on screen for 289.
  - **The other 165 are mostly B or C by design:**
    - "Say the sounds… and read the word!" (30)
    - "It's this one! Say it as you put it here." (11)
    - the blends after "Ninjas read this way!" (10) and "Hmm, listen again. What sound comes next?" (10)
    - W5's oral blending and W6's dots
  - **The rest are the gaps in §2, never with a petal:**
    - the "That's…" corrections in Find and Swap
    - < x >'s "/k/ /s/"
    - "The same spelling can sometimes be /th/…" (the /th/ half)
    - "This can be /th/, but in this word, it's /dh/."
  - **Lines that talk about sounds:**
    - "You won back a sound!" / "…some sounds!" was said 14 times, never with a petal on screen.
    - "It's two letters, but it's one sound." had a petal 47 times out of 51; the 4 without are the reminders after a word.
  - **The spelling's voice or part of a blend:** 863 clips. A petal happened to be visible for 128 of them, because the turn's petal was still up.
  - **Where to look:** `summary.md` lists every context; in the run folder, each `frames/*-NONE.png` is a sound said with no petal of it on screen. The probe now writes to `playtest/runs/sound-display/` by default, because its frames run to hundreds of megabytes.
- **Stills:** `bun scripts/treadmill/sound-shots.ts <out> <name> <url> <ms,ms…>`; `playtest/sound-display/stills/` has the badge wall, Dojo Learn, sorting and W1.
