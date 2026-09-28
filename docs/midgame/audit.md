> SUPERSEDED (R3, 27 Sep): the Baron is fought ONLY in the final battle at Muddle Castle (Jonas: "the final, final battle with really hard words always"). Any "Baron Muddle, first round" below is historical; see docs/MIDGAME_ENDGAME.md §R.3.

# The later game, played as a Year 1 and a Year 2 child

**27 September 2026. The later-game auditor's report for the midgame and endgame review.** Jonas asked:

> "…are these games really good to learn how to spell magician and optician and division and multiplication and all the shuns, which are much longer words… I also don't know that I understand, yeah, how the boss battles work. Is the panda just like the boss of lame sounds? Because more complicated sounds come later, right? Like, I feel like the middle and end game isn't really well thought through."

This report plays today's production game (https://superninja.templestein.com/play/, 27 Sep) at 844×390 as a Year 1 child in the middle of the year and as a Year 2 child. It covers worlds 3–6, every boss from the Yeti on, the Gem Trials, the sorts, the longest words, the stories, the World Flower and the Extended Code data. It also reads the code for each game's limits. The evidence is in `playtest/runs/midgame/` (git-ignored; index in §13). The research on other games is in [prior-art.md](prior-art.md), and this report refers to it rather than repeating it.

Sounds~Write (S~W) facts come from [SOUNDS_WRITE_MODEL.md](../SOUNDS_WRITE_MODEL.md) and the research dossier. No teaching material is copied here.

---

## 0. The short answer

Jonas is right. Today the game is a good Reception game that stops at the first half-term of Year 1. For a Year 2 child it is almost entirely review, and it could not teach *magician*, *division* or *multiplication* in any form.

1. **A Year 1 or Year 2 child gets about 30 minutes of new game.** The opt-in sends both years to the same stone, the Sky Temple's first dojo (w6-1; `startFor` in worlds.ts). From there it is 12 levels, 26–28 minutes of play (measured on the transcripts), to "The World Flower burst into bloom… The end!"
2. **The Extended Code in the game is 8 of the 80 new spelling-to-sound pairs of Year 1, and 0 of the 53 in Year 2.** They are < ai ay ee ea oa ow igh ie >, two spellings each for four of the 19 vowel sounds. Both years get the same 45 words. The "End of Year 2" state shows **32 of 44** petals on the flower, and five of the seven /ae/ gems stay dark forever, but the grown-ups page says "Spellings rescued: 46 of 46" (`playtest/runs/midgame/coverage.txt`; screenshots in `shots/preset-end-year-2/`).
3. **The longest word the game can serve has 5 sounds and 6 letters** (*strong*, *stamp*, *twist*…). There is not one word of two syllables in play. The layout copes with 7 sounds; *multiplication* (13 sounds) runs off the slot box, and its last tile slides under Sensei's Help button (§4, simulated on production).
4. **The game never asks for a spelling choice.** `tileBank()` (engine/learner.ts) removes every tile that spells a sound the word needs. So *rain* never has an < ay > tile beside its < ai >, and *sea* never has an < ee >. The Extended Code's whole difficulty ("which spelling of /ae/ in this word?") is filtered out in battles, bosses, dojos and Gem Trials alike. Sensei's official correction for a right sound with the wrong spelling ("Yes, that's a spelling of that sound too! But in this word, we spell it like this…") is recorded and wired, and it can never play.
5. **Could it teach magician, optician, division or multiplication? No, on four counts.** It has no word over 5 sounds and no word of two syllables. It has no < ci > < si > < ti > spellings, no /j/ as < g >, and no schwa. It has no syllables in the building UI. And it has no spelling choice, which is where all of the difficulty in these words lies (-cian or -tion or -sion; < g > or < j >). S~W teaches these words in the polysyllabic strand, with the ending as a "special ending", syllable by syllable. The National Curriculum puts -tion in Year 2 and -cian and -sion in Years 3–4 (prior-art §0). They are the right *long-term* target and the wrong *Year 1* one.
6. **Bosses are longer battles, nothing more.** Each boss is a battle with 7–9 words instead of 4–5, drawn from the land's words, with 4 distractor tiles instead of 3. It has no timer and no hearts, so it cannot be lost. No boss tests its land's idea, although the Baron *says* it does ("Same sound, different spellings? That was my best muddle of all!") while the child spells *pie* with the only /ie/ tile on the board.
7. **Difficulty goes down at the end.** The average word in the Serpent's fight (Dragon River) has 4.1 sounds; the Knight's has 3.3; the final boss, the Baron, has 3.0, including ten two-sound words (*pie*, *sea*, *day*). The only thing that scales is hit points (7 → 9 words).
8. **The panda is the boss of the first eight sounds** (IC1–2: a i m s t n o p). That is a fair first boss for a four-year-old in their first half-term. A Year 1 or Year 2 child never meets it. The real problem is that every boss after it is the same fight, and the story ends (the Baron reformed, the flower in bloom) at the point where Year 1 starts.
9. **The content for Years 1 and 2 largely exists and isn't plugged in.** `src/content/units/` has word lists for EC1–EC49 (with the Initial Code and Bridging lists, 933 distinct words, all with word audio, 233 with pictures). It also has 370 dictation sentences, 180 polysyllabic words with audio, and swap chains. The game's scenes read only `phonics.ts` (411 words, units 1–12). The core that reads the unit files (`src/core/content/curriculum.ts`) imports EC1–26 only, and no scene imports the core.
10. **After the end, the game loops.** Once every stone has stars, the glowing stone is the Baron again (`frontier()` falls back to the last level). Every Baron win plays the finale ("Every petal is back on the World Flower"), and every return to the map says "Baron Muddle is hiding up here somewhere!" before the reformed Baron threatens again. Following the glowing stone, the continuous run fought the Baron 10 times and saw the finale 9 times in 70 minutes. The only other thing left is Sensei's Challenge: 4–5 short review words (*bus, hot, hutch, bench, strip*), each with one tile per sound (§2.4).
11. **The marketing overclaims.** The site says "aged 3–8", "44 sounds, every spelling", "Complete it, and you've cracked the code of English", and that Spell Battles are "choosing a spelling for each sound". It still shows < a‑e >, the split spelling the game dropped. Of the clips rendered so far, the only battle is Bamboo Village's first (*am, at, mat, sat*); the rest are a warm-up, the film and the World Flower. Section 10 lists each claim, whether it is true today, and honest wording. **The game can't yet be *shown* working for Year 1 and Year 2, because the mechanics that would show it don't exist yet.** Section 11 lists them in priority order, with what each would let the marketing prove.

---

## 1. How I tested

| What | How | Where |
|---|---|---|
| Transcripts, worlds 3–6 | `scripts/treadmill/transcript.ts --base <production> --only w3-9,w3-12,w4-4,w4-7,w4-9,w5-7,w5-9,w5-11,w6-br1,w6-br2,w6-1…w6-11,finale`, personas `perfect` and `learner` (a third of first tries wrong), 844×390 | `transcripts/journey-{perfect,learner}.md` |
| A continuous Year 1 journey | `continuous.ts --from w6-1 --levels 14 --persona learner` on production (every earlier level done, as a child moving up from Reception), one page and one save. After the 12 stones the bot kept following the glowing stone, which is how the post-game loop showed up (§2.4) | `continuous-w6/` |
| After the end | `challenge.ts`: every level starred, the map, then Sensei's Challenge (`?level=review`) twice on production | `shots/challenge-after-end-{0,1}/` |
| Screenshots | `playtest/runs/midgame/capture.ts`: the bot plays each level on production at 844×390 (device scale 2), a shot every 4–6 s, and logs the word and the tiles on screen | `shots/<case>/` with `log.json` |
| Year 1 and Year 2 states | the production cheat menu (`?cheat=1`, Mastery → presets "Middle of Year 1", "End of Year 1", "End of Year 2"), then the map, the World Flower, the /ae/ petal, the chart, grown-ups and the finale | `shots/preset-*/` |
| Gem Trials | `?trial=ai>ae` and `?trial=ee>ee` with a Sky Temple save (every level to w6-9 starred) | `shots/trial-*-y1/` |
| Long words | `longword-sim.ts`: a real production battle, its DOM rewritten to the slot count and tile bank the game's own rules would give *station*, *magician*, *division*, *optician* and *multiplication*. Geometry only, and labelled SIMULATION on every shot | `shots/longword-sim/`, `longword-sim.txt` |
| Word pools, bosses, coverage | read-only scripts over `worlds.ts`, `phonics.ts`, `flower.ts`, `sw.ts` and `units/*.ts` | `pool-stats.txt`, `boss-stats.txt`, `coverage.txt`, `ec-stats-all.txt`, `flower-stats.txt`, `audio-cover.txt`, `sentence-check.txt` |
| Clips | `scripts/tweet-clips.ts record` on production: the Baron's fight and the < ai >/< ay > sort | `clips/` |

Caveat: `transcript.ts` plays each level on a fresh page and save, so once-per-save lines ("Look, a gem!…") repeat in its transcripts. The continuous run doesn't have that problem.

Production was one build throughout (`/assets/play-Z1ApfqUX.js`, byte-identical to the copy in `prod-play.js`, and the landing page identical to `landing-prod.html`, re-checked at 11:00 BST). Other workflows are changing `src/` today, so later builds may differ. The code references were re-checked against `src/` at 11:05 (the `tileBank` filter, `maxLen`, `slotPx`, `timed`, `startFor`, `frontier`, `isFinale`) and still hold.

---

## 2. What a Year 1 and a Year 2 child actually get

### 2.1 The path

- The opt-in "Year One" and "Year Two" both call `startFor()`, which places the child after unit 11 (Year One) or unit 12 (Year Two). There is no unit after 12, so both start at w6-1, the < ai >/< ay > dojo. The code says so: "Until the Extended Code is built, Years One and Two both start at the Sky Temple (w6-1), Year Two with its gems half-filled". `bandBelow()` then skips Year One for a struggling Year Two child, because both start at the same level.
- A placed child skips the two Bridging sorts (w6-br1, w6-br2), which come before w6-1 in the list. That is fine for Year 1, who had the Bridging Unit in Reception.
- From w6-1 it is 12 stones: 3 dojos, 4 sorts, a battle, a run, a story, the dojo for < igh ie > and the Baron. Measured game time to each reward: **26 minutes** for the perfect persona and **28 minutes** for the learner (fresh page per level). In one continuous sitting the learner took **32 minutes** from the title to the finale: about 26 in the 12 levels (dojos 2½–3 minutes each, sorts 1–1½, the battle 2, the run 2⅓, the story 1½, the Baron 3½), 4 on four World Flower visits, and the rest on rewards and the map. Then comes the finale, in which the flower blooms in full.

### 2.2 How much of the school year that is

| | Sounds~Write (official) | In the game today |
|---|---|---|
| Year 1 (EC1–EC26) | 80 new spelling→sound pairs; 19 vowel sounds' first spellings; 7 spelling units (Lesson 10); polysyllabic words from EC4 week 2 | **8 pairs** (< ai ay > EC1, < ee ea > EC2, < oa ow > EC4, < igh ie > EC11), 45 words, no spelling units, no polysyllabic words |
| Year 2 (EC27–EC49) | 53 more pairs (< eigh ey ei >, < dge ge >, < kn gn wr >, < ough augh >…); 4 spelling units; polysyllabic words up to 5 syllables; suffixes | **0 pairs**, 0 polysyllabic words |
| The World Flower | 44 sounds, 182 gems (`flower.ts`) | 48 gems in play; 32 petals can ever be completed; the other 12 (/er/ /ar/ /or/ /ou/ /oy/ /oo/ /uu/ /air/ /eer/ /ue/ /zh/ /schwa/) have no word in the game at all |
| Words | Year 1 progress checks read 20 words each; the unit files hold 693 Year 1 word entries and 581 Year 2 entries | 45 Extended Code words in the Sky Temple. The continuous run spoke **45 different words** in its 32 minutes: 39 of the land's 45, and 6 review words (*crept, glad, jug, lost, must, yak*) |

Sources: `coverage.txt` (from `newGpcsIn()` under the default consonant + e policy), `flower-stats.txt`, `ec-stats-all.txt`.

### 2.3 What they see

- **The map** (`shots/preset-end-year-2/03-map-1.png`): the Sky Temple, all stars gold. Nothing comes after it.
- **The World Flower at "End of Year 2"** (`07-tree-1.png`): "32 of 44". The finale (`15-finale-1.png`) shows the flower in full bloom, which contradicts it.
- **The /ae/ petal** (`08-tree-petal-ae.png`): < ai > and < ay > won, five dark gems, and the example words *rain, tail, nail, train, snail*. No word teaches the dark gems, so they can't be found.
- **The chart** (`09-chart-0.png`): /ae/ 2 of 7, /ee/ 2 of 7, /oy/ still a mystery petal, /ie/ 2 of 5, /oe/ 2 of 7.
- **Grown-ups** (`11-grownups-1.png`): "Levels finished: 74 of 74. Spellings rescued: 46 of 46." The denominator is the game's own spellings (`SPELLING_ORDER`), not the programme's. Beside it, "Relaxed mode (…timers normally start in the Misty Mountains)" is also out of date: only Gem Trials are timed (`timed = !!trialKey`).

### 2.4 After the end

A Year 2 child can finish the game in a weekend (§2.1), so what comes after the finale matters. On production today:

- **The glowing stone is the Baron again.** `frontier()` (engine/gems.ts) returns the first level without stars, or else `LEVELS[LEVELS.length - 1]`, which is w6-11. The map after the end (`shots/challenge-after-end-0/00-map-after-end.png`) has the ninja and the pointing hand on the Baron's stone.
- **Every Baron win is the finale.** `isFinale = level.id === LEVELS[LEVELS.length - 1].id` (App.tsx `Reward`), so each replay ends with "You did it, Super Ninja! Every petal is back on the World Flower" and the Baron's apology. The reward's "A gem is glowing! It's ready for a gem battle." is said and then skipped: Next goes to the finale, then to the map, whose glowing stone points at the Baron and not at the gem.
- **The story undoes itself.** Back on the map after the finale, Sensei says "Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!" (`world_6`). Tapping the glowing stone, the reformed Baron says "So. You came all this way. Same sound, different spellings? That was my best muddle of all! Grrr!" (`baron_w${world.id}` in Battle.tsx, on every boss fight, replays included). Beaten, he says "This is not over, ninja… I will be back!", and half a minute later, in the finale, "Sorry for all the muddle."
- **In one sitting**, the continuous run followed the glowing stone past the end: after the first finale (32:20) it fought the Baron **9 more times** and saw the finale **8 more times** before the run stopped at 70 minutes (`continuous-w6/`). A child who likes the Baron will do the same.
- **Sensei's Challenge** (the target button on the map, `makeReview`) is the only other game. After the end it is a battle over every unit, and it served *bus, hot, hutch, bench, strip* and *pie, grip, west, with*. That is one Extended Code word in nine, all 3–5 sounds, one tile per sound. *hutch* had < tch > and no < ch >, and *bench* had < ch > and no < tch > (`shots/challenge-after-end-*/log.json`, `05-battle-bench.png`).
- **The Gem Trials** of the 48 gems in play can be replayed from the flower. The other 134 gems have no way in (§2.2).

So a Year 2 child's endgame is a loop of the easiest boss in the game and a review battle of Reception words.

---

## 3. Worlds 3–6, level by level, as a teacher and as a 6–7-year-old

"Pool" is `levelWords()` (the level's units, only spellings taught so far, dictation-safe). Battles also draw about 20% review from earlier levels (`chooseWords`).

| Land | Levels | Code | Pool, longest words | As a teacher | As a 6–7-year-old |
|---|---|---|---|---|---|
| 3 Misty Mountains | dojo ×3, swap ×2, run ×2, battle ×2, story, boss (Yeti) | IC5–7: k l r u, j w z, x y ff ll ss zz | 13–84 words; 3 sounds, 4 letters (*buzz*, *hill*) | Correct Initial Code, well paced. Boss words *jog rag rug nut rub off can* | Too easy for Year 1: these are Reception autumn words |
| 4 Dragon River | dojo ×3, run, battle ×2, swap, story, boss (Serpent) | IC8–10: adjacent consonants | 23–126 words; **5 sounds**, 5 letters (*stamp*, *crust*, *twist*) | The hardest spelling in the game: 4.1 sounds on average in the boss, 4.9 in w4-7. No nonsense words, no insert/delete swaps | The one land with some bite for a Year 1 child |
| 5 Shadow Castle | dojo ×3, battle ×3, swap ×2, run, story, boss (Knight) | IC11: sh ch th ck ng wh q u ve tch | 31–78 words; 5 sounds, 6 letters (*strong*, *quilt*, *squid*) | Digraphs well taught ("two letters, one sound"). < c k ck > and < ch tch > are known, yet *fetch* offers < tch > but never < ch >, and *black* offers < ck > but no < c > or < k > | Short words again (3.3 sounds on average) |
| 6 Sky Temple | 2 Bridging sorts, dojo ×4, sort ×4, battle, run, story, boss (Baron) | BR, then 2 spellings each of /ae/ /ee/ /oe/ /ie/ | 12–45 words; 4 sounds, 6 letters (*bright*, *queen*) | Introduces concept 3 by sorting, which is the right order. But no level ever asks which spelling to use, < ea > and < ow > are only /ee/ and /oe/, and the unit's other spellings (< a > < e > < y > < o > < oe > < i >) are missing | Sorts are letter-matching with the word written in front of them; battles are 2–4 sound words |

Game by game:

- **Battles** (`shots/battle-w6-5/`): *pit, stay, seat, bee, green*. For *stay* the bank is `d s ay t z sh` (`log.json`): one /ae/ tile, and the other tiles are wrong sounds, never a rival spelling.
- **Sorts** (`shots/sort-w6-4-ee-ea/`, `transcripts` w6-2): 8 words fall, and the child taps the chest whose label appears in the written word. For < ai >/< ay >, the chests hold *tail rain snail paint* and *play spray tray stay*. Every < ay > is at the end of its word, so the sort is also "is it at the end?", which is useful knowledge. It checks reading, not spelling, and no step asks the child to spell a word with the right chest's spelling (S~W Lesson 6 and 7 have the child write the words).
- **Dojos** (w6-ec11 transcript): "Ooh! You already know this sound. Here's another way to spell it!" is a good line. Then Find, then Build: *high, nest, night, light, crow*. The child builds < igh > words, and no < ie > word in the same build needs a choice.
- **Gem Trials** (`shots/trial-ai-y1/`, `trial-ee-y1/`): every word in a trial uses the gem's spelling (`trialPool`), and the gem hangs above the monster with its letters on it (`03-battle-sleep.png`: the < ee > gem, and a bank of `e p q s l z ee`). The trial "proves" that a child can find < ee > when < ee > is the only /ee/ tile on screen.
- **Ninja Run** (w6-9): 6 items in 150 s. The child hears /d/ /r/ /ee/ /m/ and catches *dream*. That is oral blending of 3–4 sounds, a Reception skill.
- **Story** (s6, "The Last Petal"): the child reads 4 pages, *He sits on his own. He is sad. / I can read to you! / The goat eats a coat. Yuck! / He is not sad. He can grin!*, about 25 words in all, and marks each page read with "I read it!". Nothing checks the reading except one picture question at the end. The Year 1 books from the same programme run to hundreds of words.

---

## 4. Long words: the limits, and magician, division and multiplication

### 4.1 The longest word today

| | Value | Source |
|---|---|---|
| Words in play | 411 (`phonics.ts` `WORDS`) | `pool-stats.txt` |
| By number of sounds | 2: 20 · 3: 239 · 4: 128 · **5: 24** · 6+: **0** | |
| Longest | *strong* (5 sounds, 6 letters, IC11); *stamp, crust, twist, frost, blend, crisp, split, strap, scrub* (5, IC10) | |
| Words of two or more syllables | **0** | |
| Longest word in the unit files' word lists | still 5 sounds (*stand*, *twelve*; the few two-syllable entries, such as *trouble*, *drizzle* and *gentle*, are 5 too) | `ec-stats-all.txt` |
| Polysyllabic words in the unit files | 180 distinct (PW1–9 and 10 per EC unit), **none with its sounds segmented** (syllables only, e.g. "mul\|ti\|pli\|ca\|tion") | `ec-stats-all.txt` |
| "shun"/"-ture" words anywhere | *multiplication* (PW5, 8, 9), *location*, *musician*, *picture* (PW6). No *magician, optician, division, station* | |

### 4.2 The code's limits

| Limit | Code | Effect on a long word |
|---|---|---|
| Word length in battles and bosses | `chooseWords(level, hp, "spell", { maxLen: boss ? 6 : 5 })`, Battle.tsx | Sounds over 5 (6 in a boss) are filtered out of the pool before anything else |
| The tile bank | `tileBank()`: the word's unique spellings plus `min(extra, 7 − unique)` distractors; distractors never share a sound with the word | At 7 or more unique spellings there are **no distractors**; the child only orders tiles. No rival spelling is ever offered (§5) |
| Sound slots | `slotPx = segs ≤ 4 ? 104 : 5 ? 92 : 80` in a 660-px box centred on the card (stage 1280 × 720), `.slots` flex, no wrap | 7 slots fit (632 px). 8 or more overflow the box and spread both ways. 13 slots are 1184 px: they span almost the whole stage, over the ninja's corner and the monster |
| Tile row | `rowFit()`: 104 → 76 px tiles in 748 px between the ninja and Sensei's Help, `flex-wrap: nowrap` | 11 tiles at 76 px are 882 px: the row runs under the Help button |
| Syllables | none in any scene | A polysyllabic word would be one flat row of 13 slots |
| Special endings | none: `GRAPHEMES` has no < ti ci si ssi ture >, no < g >=/j/, no schwa | *-tion* would have to be tiles t·i·o·n (wrong sounds) or a < ti > tile beside a < t > tile and an < i > tile |

**The simulation** (`longword-sim.txt`, `shots/longword-sim/`, each shot labelled SIMULATION):

| Word | Sounds | Slots | Tiles | Verdict |
|---|---|---|---|---|
| stamp (today's longest) | 5 | 508 px of 660 | 7 at 96 px, 732 of 748 | fits |
| station | 6 | 540 | 7 at 96 px | fits |
| magician | 7 | 632 | 7 at 96 px, 1 distractor | fits, just (`2-magician.png`) |
| division | 7 | 632 | 7 at 96 px | fits |
| optician | 7 | 632 | 7, **no distractor** | fits; nothing to choose |
| multiplication | 13 | **1184 of 660** | 11 at 76 px, **882 of 748**, no distractors | broken: the slots cross the scene, and the last tile hides under Sensei (`5-multiplication.png`). The bank holds < t >, < i > and < ti > together |

So the screen is not what stops *magician*. What stops it is the teaching model: the game has no idea what a syllable is, what a special ending is, or what it means to choose between spellings.

### 4.3 Could the game teach *magician* at all?

What a child needs for *magician* (/m/ /a/ /j/ /i/ /sh/ /ə/ /n/, spelt m·a·g·i·ci·a·n or ma|gi|cian):

1. **To hear and build it in syllables.** S~W Lesson 11 draws one line per syllable, asks "What's the first syllable you hear…?", and builds that syllable, then the next (polysyllabic research, official 2020 demonstration). The game has no syllable lines.
2. **To know < g > as /j/** (EC37, Year 2 spring) **and < ci > as /sh/**. S~W treats "-tion" as an "EC special ending - tion representing the three sounds in 'shun'", lists -sion, -ssion, -cial and -ture the same way, and in *ancient* calls < ci > a spelling of /sh/. It teaches them in the polysyllabic strand's last stage, "common suffixes". Its official suffix card set includes *magician, optician, division, multiplication*.
3. **To choose -cian and not -tion or -sion.** This is the hard part, and it is a choice the root decides: *magic → magician*, *optic → optician*, *divide → division*, *multiply → multiplication*. The National Curriculum puts it in Years 3–4 (prior-art §0, §1).
4. **The schwa and the "spelling voice".** S~W's correction is to say the word "in our spelling voice", mul-ti-ply. The game has no schwa.

The game has none of the four. So a child who plays to the end today has never met a word longer than *strong*.

**What would make it possible** (details in §11): syllable "carriages" (prior-art Idea 3), one tile for a special ending (Idea 4), rival spellings in the bank, and a root clue from a word the child already knows ("magic → magic**ian**"). A land for long words, "the Library of Long Words" in SOUNDS_WRITE_MODEL §6.1, would then be the endgame. Year 2 there would read and spell *-tion* words (*station, fiction, motion*), and Year 3 would add *magician, optician, division*. *multiplication* (5 syllables, 13 sounds) is a Year 3–4 reading word and a boss-grade spelling.

---

## 5. Does the game teach the Extended Code? Spelling choices, or tapping the one right tile?

**Tapping the one right tile.** The evidence:

**The filter.** In `tileBank()` (engine/learner.ts):

```ts
const ok = (c: string) => known.includes(c) && !need.includes(c) && !needSounds.has(GRAPHEMES[c]);
```

A tile is only a distractor if its default sound is **not** one of the word's sounds. The confusables table even lists `ai: ["ay", "a"]` and `ee: ["ea", "e"]`, and the filter then removes exactly those. This rule is right for the Initial Code, before concept 3. It is wrong from the Bridging Unit on.

**What the child was actually offered** (from `shots/*/log.json`, production):

| Level | Word | Tiles on screen | Rival spelling the child knows and never sees |
|---|---|---|---|
| Baron (w6-11) | pie | m i p **ie** q b | < igh > |
| Baron | say | a u z sh **ay** s | < ai > |
| Baron | dream | **ea** p w r b d m | < ee > |
| Baron | sea | **ea** z sh x e s | < ee > |
| Baron | road | r b d o th **oa** p | < ow > |
| Battle (w6-5) | stay | d s **ay** t z sh | < ai > |
| Gem Trial < ai > | train | r h **ai** t f m n | < ay > |
| Gem Trial < ee > | sleep | e p q s l z **ee** | < ea > |
| Knight (w5-11) | fetch | th a **tch** v i f e | < ch > |
| Knight | black | p o l a **ck** d b | < c >, < k > |

Screenshot: `shots/boss-w6-baron/00-battle-pie.png`. The Baron's bubble says "Same sound, different spellings? That was my best muddle of all!" over a bank with one way to spell /ie/.

**The line that can never play.** Dojo.tsx has a correction branch for a tile of the right sound with the wrong spelling (`same = GRAPHEMES[g] === need.p`). Its line `same_sound_spelling`, "Yes, that's a spelling of that sound too! But in this word, we spell it like this...", is S~W's "valid alternative spelling" correction. The bank never offers such a tile, so the child can't make the mistake it corrects.

**Everything else that makes the Extended Code the Extended Code is missing:**

- **Lesson 6** (one sound, different spellings, word puzzles): the sort comes closest, but the word is written in front of the child.
- **Lesson 7** (read and write the list): nothing.
- **Lesson 9** (Seek the Sound in a passage): nothing. The stories would suit it.
- **Lesson 10** (one spelling, different sounds) and the 11 spelling units: nothing today. [MULTI_SOUND.md](../MULTI_SOUND.md) designs Sound Detective, and says it can only play < ea > once w6-1 teaches *great*.
- **The official lags:** S~W quizzes Extended Code spelling at least four units back and expects spelling accuracy after 5–7 units. The game tests spelling of a spelling in the same land it was taught.
- **Consonant + e** (< te > < ke > < me > … from EC1): not in `GRAPHEMES`. So there is no *cake*, *time* or *home*, the commonest Year 1 words there are.

A child can win every gem in the Sky Temple without once deciding how to spell a sound. The game tracks "spelling" per spelling (`recordSpell`), but what it records is "found the only tile with this sound".

---

## 6. Bosses: what they mean, what they test, and why the panda

### 6.1 What a boss is today

A boss is `Battle` with `kind: "boss"`. It has `info.hp` words (7–9), `maxLen` 6 and 4 distractors, and it draws from the land's units with about 20% review. It plays boss music, and the monster puffs up and roars halfway ("Grrrr… You dare to fight ME?"). There is a combo finisher at high streak tiers, and the Baron's taunts. There is **no timer, no hearts and no way to lose** (`timed = !!trialKey && !relaxed`). The reward is the same stars, stickers and gem energy as any level, plus the land's end.

| Boss | Land | Code | HP | Words (mean sounds) | Baron's line as the land opens | What the fight actually tests |
|---|---|---|---|---|---|---|
| Sumo panda | Bamboo Village | IC1–2 (a i m s t n o p) | 7 | 28 (2.8) | "My sumo panda will squash you!" | spelling CVC words, one tile per sound |
| Oni | Blossom Hills | IC3–4 | 7 | 49 (3.0) | "My big red monster is hungry… for SOUNDS!" | the same, more letters |
| Yeti | Misty Mountains | IC5–7 | 7 | 84 (3.0) | "every word freezes solid" | the same; its words, *jog rag rug nut rub off can*, have no double consonant except *off* |
| Serpent | Dragon River | IC8–10 | 8 | 126 (**4.1**) | "My river dragon gobbles up sounds" | adjacent consonants: the hardest fight in the game |
| Knight | Shadow Castle | IC11 | 8 | 78 (3.3) | "some sounds are spelt with two letters" | digraphs; < s > can sit beside < sh > (the confusables table), but never < c > or < k > beside < ck >, nor < ch > beside < tch > |
| Baron | Sky Temple | Sky Temple words | 9 | 45 (3.0; ten 2-sound words) | "Same sound, different spellings? That was my best muddle of all!" | one /ae/ tile, one /ee/ tile… never a choice |

Source: `boss-stats.txt`, `lines.ts` `baron_w1…w6`, the boss logs in `shots/boss-*/log.json`.

### 6.2 Is the panda "the boss of lame sounds"?

It is the boss of the **first eight sounds**. For its audience that is a fair first boss: a four-year-old in the first half-term of Reception spells seven words in a row for the first time. Bamboo Village's pandas (the victims in story s1, and Sensei herself, a red panda) make a squashing sumo panda a good first villain. A Year 1 or Year 2 child never meets it, because they start at w6-1.

What Jonas senses is real, but it isn't about the panda:

1. **Every boss is the same fight with more hit points.** None owns its land's idea, although each of the Baron's land lines names one.
2. **Difficulty doesn't climb.** Word length peaks at the Serpent (Reception spring) and falls after it. The final boss is the second-easiest to spell.
3. **A boss can't be lost,** and it teaches nothing a normal battle doesn't.
4. **The story ends at Year 1's first half-term.** The Baron is reformed and the flower blooms after four vowel sounds of the Extended Code. The "more complicated sounds come later" have no land, no boss and no story.

SOUNDS_WRITE_MODEL §6.1 already sketches the fix: each land's boss is its **progress check** (word reading + word dictation + a dictated sentence in the Extended Code, every 6–8 weeks), across 14 lands to the end of Year 2 and a Library of Long Words after it. Section 11.3 turns that into bosses.

---

## 7. How difficulty and rewards scale

**Difficulty.** Mean sounds per word, battles and bosses in play order: 2.5, 2.9, **2.8 (panda)**, 3.0, 3.0, **3.0 (oni)**, 3.0, 3.0, **3.0 (yeti)**, 4.0, 4.9, **4.1 (serpent)**, 3.2, 3.3, 3.3, **3.3 (knight)**, 3.1, **3.0 (Baron)**. The only other knobs are:

- **HP:** 4–5 for a battle, 7–9 for a boss.
- **Distractors:** 1–2 early, then 3, and 4 in a boss. They never share a sound with the word, so a child who can hear the sounds ignores them.
- **Gem Trials:** the only timed game. The timer is shorter for bosses in code (7 s + 2.2 s a sound) but only trials use it.
- **Sort speed:** "Words fall faster as you go", but it never fails.

Nothing scales the *thinking*: no more rival spellings, no longer words, no syllables, no sentences, no less support.

**Rewards** are flat. Every level pays stars (misses-based), stickers of the words met, gem energy and a map walk. A boss adds its land's end and a World Flower trip. A Gem Trial moves a gem to "won". Nothing is worth more because it was harder. For a 6–7-year-old, a sticker of *tray* is not a prize.

**The flower is where the scaling should live, and it contradicts itself.**

- Petals count only the gems "in play", so a petal "completes" with 2 of 7 spellings.
- The finale shows the flower in full bloom while the counter says 32 of 44.
- The landing page promises "Complete it, and you've cracked the code of English". The game's completion is 26% of the flower's gems.

---

## 8. What's boring, for a 6–7-year-old

1. **Knowing every answer.** Every battle is 2–4 sound words with one tile per sound. A Year 1 child who can hear the sounds never has to think, and a Year 2 child has spelt these words for a year.
2. **The same 45 words.** That is the whole of the Year 1 content. In one sitting the child meets 39 of them, *tray* in three levels and *rain, play, nail, paint, tail, feet, sheep, toast, boat, day* in two, across dojo, sort, battle, run and boss.
3. **Explanations pitched at four-year-olds.** In the continuous run, "It's two letters, but it's one sound" was said **23 times in 32 minutes**, twice back to back as the < ai >/< ay > sort opens (once for each spelling). The dojo opens "This is the dojo. A dojo is where ninjas practise!" (twice in the run) for a child who is seven.
4. **Pace.** Ninja Run gives six items in two and a half minutes, each a 3–4 sound oral blend. The < ai >/< ay > sort talks for 23 seconds before its first word falls (`clips/sort-ai-ay.sheet.jpg`).
5. **Stories to tap through:** about 25 words, "I read it!" and a picture question.
6. **No stakes:** a boss can't be lost, and a Gem Trial with the answer drawn on the gem is not a trial.
7. **No new verbs after Shadow Castle.** From w5-1 on it is dojo, battle, swap, run, sort and story. The moves change; the thinking doesn't.

What does work for this age (from the transcripts and screenshots): the streak tiers and finishers, the Baron's cut-ins, the chests' faces in the sort, the petal chart as a collection, and the voice (warm, precise, British). These are worth keeping when the harder mechanics arrive.

---

## 9. What's missing

| Missing | Why it matters for Years 1–2 | What exists already |
|---|---|---|
| **Spelling choice** (rival spellings in the bank; "try it a different way") | The core of the Extended Code; S~W's "valid alternative spelling" correction | the line `same_sound_spelling`; the confusables table in `tileBank` |
| **Syllables** (Lessons 11–14) | S~W starts polysyllabic words in Year 1 at EC4 week 2; Year 2 builds 3–5 syllable words | 180 poly words with audio in `units/PW*.ts` and 10 per EC unit, without sound segs |
| **Sentences** (Lesson 4a dictation) | Part of every S~W session; the Extended Code progress checks end with a dictated sentence | 370 sentences in `units/EC*.ts` (but see §12: 131 use words taught later) |
| **Meaning** | Homophones (*sea/see*, *tail/tale*) are National Curriculum Year 2; the game hides them (`dictationSafe` drops a homophone without a picture) | pictures for 233 unit words |
| **Proofreading** | Year 2 writing includes proof-reading for spelling errors; a perfect fit for a villain called Muddle | nothing |
| **Reading checked, not self-declared** | Year 1 ends with the Phonics Screening Check: 40 words, 20 of them pseudo-words | "who read it right" (reading check, IC only) |
| **Nonsense words** | PSC practice; S~W uses them in Sound Swap from IC9 | none in the game |
| **Special endings and suffixes** (-tion, -ture, -ed, -ing, -s/-es) | -s/-es, -ing, -ed are Year 1 statutory; -tion, -ment, -ful, -ly are Year 2 | none |
| **Consonant + e** (*cake* = c·a·ke) | EC1's most common /ae/ words under the official 2024 coding | in `sw.ts`, not in `GRAPHEMES` |
| **Spelling units** (< ea > < o > < ow > < oo > < ou > < s > < ew > < a > < y > < g > < gh >) | Concept 4 | Sound Detective spec (MULTI_SOUND.md) |
| **Handwriting or typing whole words** | Transfer to paper; the keyboard maps keys to tiles only | none |

---

## 10. Marketing: what is true today, and what to change

### 10.1 The landing page (`index.html`, production today)

| Claim | Where | True today? | Honest wording now |
|---|---|---|---|
| "a phonics adventure for UK children aged 3–8" | `<title>`, meta, og, twitter, trailer end card ("aged 3 to 8") | No. The content ends in the first half-term of Year 1 | "…for children aged 3 to 6: pre-school, Reception and the start of Year 1". Say "Year 1 and Year 2 lands are on the way" once they are being built |
| "44 sounds, every spelling" | hero promises | No: 48 of the 182 gems on its own flower | "All 44 sounds. Their first spellings, and more every month" |
| "Complete it, and you've cracked the code of English" | The big goal, step 3 | No: the flower can't be completed | "Every petal you bring home is a sound of English, in every way you've learned to spell it" |
| "The sound in rain can be ai ay a‑e eigh…" | The big goal | The game follows the 2024 guidance (no split spellings) and doesn't show < a‑e > anywhere | "ai, ay, a (as in *cake*), ea (as in *great*), eigh (as in *eight*)…" |
| Spell Battles: "dictation. Segmenting a spoken word and choosing a spelling for each sound" | Games | Segmenting yes; choosing no (§5) | "…and finding the spelling for each sound". Put "choosing" back once rival spellings are in the bank |
| Boss Battles: "a mixed review of everything taught in that land" | Games | Roughly true (80% land, 20% earlier), but it is a longer battle | "A longer battle over everything the land taught". After §11.3: "each land's big test" |
| "Stories… fully decodable text" | Games | True, but short, with reading self-declared | Keep "decodable"; don't add "for Year 2" |
| FAQ: "3 to 8: …Reception, Year 1 and Year 2 (and beyond for extra practice)… The last reaches the long vowel spellings children meet in Year 1" | FAQ | The last sentence is honest; the first isn't | "Today: pre-school to the start of Year 1. The last land reaches the first long-vowel spellings of Year 1 (ai ay ee ea oa ow igh ie). Year 1 and Year 2 are coming." |
| Grown-ups: "Spellings rescued: 46 of 46" | in game | Misleading denominator | "46 spellings met (Sounds~Write's whole code has 174 spelling–sound pairs)" |

### 10.2 The videos

- **What exists:** `assets-src/tweet/2026-09-26/`, the trailer and the intro film. *battle-streak* is w1-6 (*am, at, mat, sat*), *fish-dog* is a warm-up, and *film-baron* and the trailer are story. Only *gem-victory* (< ai >) and *petal-scroll* touch Year 1.
- **What honest Year 1 footage today can show:** the Sky Temple's < ai >/< ay > sort (`clips/sort-ai-ay`), the petal chart for /ae/, and the Baron's fight. All three show *reading* the first long-vowel spellings. None shows choosing a spelling, a long word, a syllable or a sentence, because the game can't do those yet.
- **So "prove it" can't be done with footage yet.** If the marketing claims Year 1 and Year 2 before §11's mechanics ship, a teacher who watches one clip will see *mat* and *sat*, and a parent of a Year 2 child will see their child finish the game in a weekend.

### 10.3 Proof shots, once §11 ships (what each mechanic lets the marketing show)

| Proof shot | Needs |
|---|---|
| A Year 1 child hears *rain*, sees < ai > < ay > < a > on the bank, taps < ay >, and hears "Yes, that's a spelling of that sound too! But in this word…", then fixes it | §11.1 A |
| A Year 1 boss offers three /ae/ spellings for *play, rain, cake*, and the child gets them right | §11.1 A, §11.3 |
| Sound Detective: *great*, first read as "greet", then "try it a different way" → *great* | MULTI_SOUND.md |
| A Year 2 child builds *station* in two carriages, sta|tion, with a golden < tion > special-ending tile | §11.2 |
| The Baron's muddled note: "I wated for the trayn", and the child fixes both words | §11.4 |
| Year 3: "magic → magic**ian**": the root gives the ending | §11.2, the Library |
| The grown-ups report shows "Year 1: 62 of 80 spellings secure (Sounds~Write units 1–26)" | §11.5 |

---

## 11. What would make the middle and end game work

In priority order. Each item names what it changes; none is built in this review (read-only for game code).

### 11.1 P0: make the Extended Code a choice (small code, big effect)

**A. Rival spellings in the bank from the Bridging Unit on.** In `tileBank()`, once concept 3 has been taught (the level is at or after w6-br1), allow tiles that spell a needed sound, limited to spellings of that sound the child has met. Keep them at one or two per word, and weight them by the child's weak spot. The correction path and line already exist (Dojo `same`, `same_sound_spelling`); Battle needs the same branch. Follow S~W's lag: the current unit's words go through sorting and Lesson 6 puzzles, and battles quiz spellings taught **four or more units back**. Choice is then tested where S~W expects it to be secure.

**B. Gem Trials that test the choice.** Draw a trial's words from the gem's sound, not only its spelling: an < ai > trial has *rain, day, tail, stay, paint*, and the child must pick < ai > or < ay > each time. Hide the gem's letters until the word is done.

**C. The Baron's fight tests what he says it tests.** Its words cover every rival pair in the land; each fight word has two or three spellings of its vowel on the bank. Add a reading phase (who read it right, or Sound Detective on < ea >).

**D. Honest numbers** (§10): the grown-ups denominator, the flower's "in play" wording, and the finale not blooming what isn't there.

**E. An end that stays ended** (§2.4), until the Year 1 lands exist:

- the finale plays on the first Baron win only, and a replayed Baron is a plain boss fight;
- after the end, the map's glowing stone and idle nudge point at a ready Gem Trial or Sensei's Challenge, not at w6-11;
- the reformed Baron doesn't threaten on a replay (a friendly sparring line instead), and `world_6` doesn't say he is hiding;
- Sensei's Challenge after the end draws from the Sky Temple's spellings first, with rival spellings on the bank (A).

### 11.2 P1: plug in the content that already exists, and build long words the S~W way

**A. Wire the unit files into the game.**

- Import EC27–49 and PW1–9 into `unit-data.ts`.
- Give the scenes a word source that reads `units/*.ts` (the core's `createCurriculum`, or a thin adapter), not only `phonics.ts`.
- Extend `GRAPHEMES`/`parseWord` to the 174 official pairs (SOUNDS_WRITE_MODEL §7 step 9).
- The words, audio and 233 pictures are there.

**B. Lands for Year 1 and Year 2,** following SOUNDS_WRITE_MODEL §6.1:

| Lands | Units | When |
|---|---|---|
| Rainbow Bridge | Bridging | Reception summer |
| Sky Temple | EC1–5 | Year 1 autumn 1 |
| Coral Coast | EC6–9 | Year 1 autumn 2 |
| Moon Marsh | EC10–15 | Year 1 spring 1 |
| Autumn Orchard | EC16–22 | Year 1 spring 2 to summer 1 |
| Star Dunes | EC23–26 | Year 1 summer 2 |
| Island of Echoes | EC27–34 | Year 2 autumn |
| Crystal Caves | EC35–42 | Year 2 spring |
| Summit Temple | EC43–49 | Year 2 summer |
| Library of Long Words | PW5–9 | Year 3 on |

That is about 2–3 Sky-Temple-sized lands a school year, matching the 6–8-week progress-check rhythm.

**C. Syllable carriages** (prior-art Idea 3; S~W Lessons 11–14):

- A long word arrives as a train of carriages, one per syllable, each with its own short slot row and its own small tile bank (7 or fewer tiles, which the current row fits).
- Build carriage 1 ("What's the first syllable you hear?"), read it, then carriage 2, then read the word in syllables, then whole.
- This fixes the layout: *multiplication* is five carriages of 2–4 sounds, not 13 slots.
- Start with PW1 compounds (*sun|set*, *zig|zag*) at EC4 week 2, as S~W does. Year 2 gets 3–5 syllables.

**D. Special-ending tiles** (prior-art Idea 4): < tion > < sion > < cian > < ture > as one golden tile that stands for its sounds ("three sounds, one ending"). Introduce them in Year 2 with *-tion* (*station, motion, fiction, section*). *magician, optician, division* come later, with the root as the clue: the carriage shows *magic*, and the child adds the ending. **Schwa** gets S~W's "spelling voice": Sensei says *mul-ti-ply* for spelling and *multiply* for talking.

**E. Lesson 6 and 7 in the dojo:** hear a word, choose the spelling column, then build it. This is the sort, turned the right way round.

### 11.3 P1: bosses that each own a piece of the code

Keep the six monsters and give each a signature phase that is its land's concept (prior-art Idea 1). Every boss becomes the land's progress check: a reading phase, a spelling phase and, from the Sky Temple on, a sentence. The Baron's land lines then tell the truth.

| Boss | Owns | Signature phase |
|---|---|---|
| **Sumo panda** (IC1–2) | "we say sounds left to right" | The panda squashes a word into a blob; the child pulls its sounds apart onto the lines, then reads two of the panda's squashed words (who read it right) |
| **Oni** (IC3–4) | every single-letter sound, b/d/p | It swaps look-alike letters on the bank; the child listens past them |
| **Yeti** (IC5–7) | double consonants, concept 2 ("some spellings are written with a double consonant") | It freezes words solid, and each frozen word ends in < ff ll ss zz > or < x >; the child must break the ice with the double tile, having heard "two letters, one sound". It offers no < l > or < ll > choice yet: that is concept 3, the Bridging Unit's (NARRATIVE_AUDIT F25) |
| **Serpent** (IC8–10) | adjacent consonants | It swallows a sound from a cluster (*strap → sap*); the child puts it back (Sound Swap insert and delete; nonsense words from IC9) |
| **Knight** (IC11) | two letters, one sound | Its shield splits < sh > into < s > + < h >; the bank has both, and the child must use the digraph |
| **Bridge guardian** (new, Bridging) | the same sound spelt differently: < c k ck >, < ch tch > | Position rules as a choice |
| **Year 1 bosses**, one a land | the land's vowel families and spelling units | Rival spellings on the bank (§11.1 A) + Sound Detective + one dictated sentence |
| **Year 2 bosses** | "more spellings", < dge ge >, silent-letter spellings (< kn wr gn mb >) | Rarer spellings as heavy attacks; long words in carriages as the finisher |
| **Baron, at the end of Year 2** | everything | A full progress check, and his muddled letter to proofread (§11.4) |
| **Library guardian** (Year 3+) | syllables, special endings, roots | *magician*, *optician*, *division*, *multiplication* as the big attacks (prior-art Idea 2) |

**Stakes without failure.** S~W never fails a child, but a boss needs weight. Suggestion: a boss that wins a round "retreats with a petal" and comes back later in Sensei's Challenge with the words the child missed. Beating it returns the petal. The child can't lose the game, but can lose a round.

### 11.4 P2: sentences, meaning and proofreading, in the story's own terms

- **Dictation (Lesson 4a):** Sensei says a sentence two units behind, and the child builds it word by word with tiles, then reads it back. This is the last phase of every Extended Code boss.
- **The Baron's muddled notes:** the villain is called Muddle, and in Year 1 and Year 2 his muddle becomes misspellings. "I wated for the trayn." The child taps the wrong word and fixes the spelling. This is proofreading, it is Lesson 10's "try it a different way" in reverse, and it gives the Baron a reason to exist after the Initial Code.
- **Homophones through meaning:** *sea/see*, *tail/tale*, *right/write* are spelt from a picture or a sentence.
- **Stories for older readers:** one per unit (the model's quota), 150–400 words, with Seek the Sound (tap every /ae/, Lesson 9) and questions answered from the text. Reading is checked by the page's own questions, not by "I read it!".
- **Phonics Screening Check practice in Year 1 summer:** real and alien words, as a Ninja Run variant.

### 11.5 P2: difficulty, rewards and the flower, per school year

- **What scales:** the number of rival spellings on the bank, the unit lag of the words (current → 4 back), word length (sounds, then syllables), support (glow → none), and phase count in a boss. HP should follow time (about 2–3 minutes a boss), not word count.
- **Rewards that grow:**
  - belts per land (prior-art Idea 8: from honest data);
  - a new ninja move per concept (a "carriage kick" for syllables);
  - a boss drops a story, not a sticker;
  - the flower shows **this year's** petals and gems. A Year 1 child sees EC1–26's gems as the set to find, and "complete" means complete for that year.
- **The ending:**
  - Move "The Last Petal" and the finale to the end of Year 2 (EC49).
  - End Year 1 at Star Dunes with the Baron fleeing to the Island of Echoes ("I still have my *rarest* spellings!").
  - Open the Library of Long Words after Year 2.

---

## 12. Problems in the Extended Code data (for whoever wires it in)

| Problem | Evidence |
|---|---|
| EC27–49 and PW1–9 are not imported by `src/core/content/unit-data.ts` | the import list stops at EC26 |
| No scene imports `src/core` (except type imports in Early.tsx and store.ts) | MULTI_SOUND.md §0 says the same |
| **131 of 370 dictation sentences use words the curriculum teaches after the sentence's `maxUnit`** (203 including unknown words). The same sentences are pasted across units: "The star is over the barn." (< ar > is EC24) is dictation for EC1–EC6; "The boy found a toy car." (EC23, EC24) for EC2–EC11 | `sentence-check.txt` |
| Polysyllabic entries have syllables but no sound segs, so nothing can build them | `ec-stats-all.txt` |
| Syllable splits break S~W's own rule that a syllable starts with a consonant sound, with a double spelling kept whole: *rot\|ten*, *bot\|tle*, *hol\|i\|day*, *oyst\|er* (and *oys\|ter* elsewhere), *anch\|or*, while *co\|ffee* and *ha\|ppy* follow it | `grep syllables src/content/units/*.ts` |
| Schwa flags are wrong in places: *musician* flags syllables 0 and 2 (mu- is /m y oo/, not a schwa) | `units/PW6.ts` |
| The same filler poly words repeat through the EC units: *lesson* in 30 unit files, *lemon* 18, *seven* 16, so each unit's polysyllabic set has little to do with its code | `grep` counts |
| Spelling units are thin: EC41 < gh > 3 words, EC31 < y > 5, EC35 < vv > 7 (fair: < vv > only comes in polysyllabic words such as *savvy*), EC22 < ew > 8, EC49 /eer/ 9 | `ec-stats-all.txt` |
| `flower.ts` still has split spellings (< a‑e > < i‑e > < o‑e > < u‑e >) against the official 2024 policy | `CHART_PETALS` |

---

## 13. Evidence index (`playtest/runs/midgame/`, git-ignored)

- `transcripts/journey-perfect.md`, `journey-learner.md` (+ `.json`, nav logs): worlds 3–6, both personas, production.
- `continuous-w6/`: one continuous Year 1 journey from w6-1 to the finale (learner, 0:00–32:20), then the post-game loop: the Baron and the finale again and again (32:20–70:00).
- `shots/challenge-after-end-0/`, `challenge-after-end-1/` + `challenge.ts`: every level starred; the map after the end (glowing stone on the Baron) and two rounds of Sensei's Challenge, with `log.json`.
- `shots/boss-w3-yeti/`, `boss-w4-serpent/`, `boss-w5-knight/`, `boss-w6-baron/`: every boss from the Yeti on, with `log.json` (words and tiles on screen).
- `shots/battle-w4-7-ic10/`, `battle-w6-5/`, `sort-w6-2-ai-ay/`, `sort-w6-4-ee-ea/`, `sort-w6-7-igh-ie/`, `sort-w6-br1-c-k-ck/`, `dojo-w6-6/`, `dojo-w6-ec11/`, `run-w6-9/`, `story-w5-10/`, `story-w6-10/`, `swap-w5-8/`.
- `shots/trial-ai-y1/`, `trial-ee-y1/` (a Sky Temple save), and `trial-ai/`, `trial-igh/` (a blank save: no distractors at all, because `knownSpellings` follows the frontier).
- `shots/preset-mid-year-1/`, `preset-end-year-1/`, `preset-end-year-2/`: the map, the World Flower, the /ae/ petal, the chart, grown-ups and the finale.
- `shots/longword-sim/` + `longword-sim.txt`: long words in today's layout (a simulation, labelled).
- `clips/`: `baron-boss` and `sort-ai-ay` masters from `tweet-clips.ts` (production), with contact sheets and timelines; `baron-light-one-ie-tile.mp4` (25 s, trimmed): the Baron's "Same sound, different spellings?" line, then *light* spelt from a bank with < igh > and no other /ie/ tile. The recording drew about 28 fps in SwiftShader, which is fine for evidence and not for marketing.
- Scripts and their outputs:
  - `pool-stats.ts` → `.txt`: the word pool, the longest word and fixed words per level;
  - `boss-stats.ts` → `.txt`: HP, mean sounds and rival spellings known, per battle and boss;
  - `coverage.ts` → `.txt`: Year 1 and 2 pairs in play;
  - `ec-stats.ts`, `ec-stats-all.ts` → `.txt`: the unit files;
  - `flower-stats.ts` → `.txt`: gems in play per petal;
  - `audio-cover.ts` → `.txt`: audio and pictures for the unit words;
  - `sentence-check.ts` → `.txt`: dictation sentences against their `maxUnit`;
  - `capture.ts` and `longword-sim.ts`: the production players;
  - `landing-prod.html`: the landing page as served on 27 Sep.
