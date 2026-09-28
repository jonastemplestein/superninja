> SUPERSEDED (R3, 27 Sep): the Baron is fought ONLY in the final battle at Muddle Castle (Jonas: "the final, final battle with really hard words always"). Any "Baron Muddle, first round" below is historical; see docs/MIDGAME_ENDGAME.md §R.3.

# The middle and end game: Year 1, Year 2 and after

**27 September 2026. The game designer's spec for the midgame and endgame review.** Nothing here is built yet. It is the design that the build plan, the marketing plan and the playtest plan (docs/midgame/BUILD_PLAN.md, MARKETING_PLAN.md, PLAYTEST_PLAN.md) turn into work.

**What Jonas asked** (27 September), in short:

> "…are these games really good to learn how to spell magician and optician and division and multiplication and all the shuns… I also don't know that I understand, yeah, how the boss battles work. Is the panda just like the boss of lame sounds? Because more complicated sounds come later, right? Like, I feel like the middle and end game isn't really well thought through."

And later the same day, as a direction to design around: overworld **maps** that are broadly pre-school, Reception, Year 1 and Year 2 (never called that); game types that only appear on some maps; a school-entry path that says "we assume you know these things, but no worries if not", with **really obvious catch-up**; and, for later, a **weekly word list** deep link that turns the school's list into about five minutes of practice a day.

**Inputs.** The Sounds~Write research ([midgame/sw-y1y2.md](midgame/sw-y1y2.md), "SW" below), the audit of today's game on production ([midgame/audit.md](midgame/audit.md)) and the prior-art report ([midgame/prior-art.md](midgame/prior-art.md)). Also [SOUNDS_WRITE_MODEL.md](SOUNDS_WRITE_MODEL.md), [MULTI_SOUND.md](MULTI_SOUND.md) (Sound Detective), [TEACHER_SCRIPT.md](TEACHER_SCRIPT.md) (the voice rules and table format), [MAP_DESIGN.md](MAP_DESIGN.md) (one glowing stone), [FIRST_MINUTES.md](FIRST_MINUTES.md) §4, §9–10 (the opt-in and the school start points), `docs/read-slider/research.md` (the read slider) and [architecture/planner.md](architecture/planner.md). The Freshford Year 1–2 parents' presentation (23 September 2026) describes the weekly lists.

**Rules for this document.**
- Sounds~Write material is quoted a phrase at a time, and word examples are a few single words. Full lists stay in the git-ignored `assets-src/sw-sources/`.
- British English. A **sound** is /ae/; a **spelling** is < ai >. A middle dot marks a syllable break (sun·set).
- **School years never appear in the child's view.** They appear here, and on the grown-ups' pages, as "Year 1" or "Y1".
- Sensei's lines follow TEACHER_SCRIPT §2: whole sentences, a pure sound only at the end of a sentence, no letter names, a spelling never "says" or "makes" a sound. Line ids starting `tv_` are new lines to record. The tables have TEACHER_SCRIPT's columns.
- Decisions made without asking are marked **Decision** and collected in §7 for docs/DECISIONS.md.

---

## 0. The short version

### 0.1 The answers to Jonas

**Magician, optician, division, multiplication.** Today, no: the game has no word longer than *strong*, no syllables, no special endings and no spelling choice (audit §4–5). With this design, yes, in the order school teaches them:
- **Year 1** builds and reads two- and three-syllable words syllable by syllable (*sunset*, *fantastic*, *nightmare*) in a new game, the **Syllable Train**, which is Sounds~Write's Lessons 11–14 done with tiles.
- **Year 2** adds four- and five-syllable words (*holiday*, *multiply*, *mechanic*, *character*) and the first special ending, **-tion** (*station*, *addition*, *subtraction*, *multiplication*).
- ***magician*, *optician*, *musician*, *division*, *television*** are **read** syllable by syllable at the end of Year 2 and **spelt** in the post-game **Library of Long Words**, with the root word as the clue (*magic* → *magician*). That is a Year 2 stretch and Year 3 at school: the National Curriculum puts -cian and -sion in Years 3–4 (SW §4). We say so plainly.

**Is the panda the boss of lame sounds?** It is the boss of the first eight sounds, and that is right: those eight sounds make the first words a four-year-old ever spells. What was wrong is that every later boss was the same fight with more hit points. In this design **each boss guards the hardest new code of its land and fights with it**, so the bosses climb:
- the panda squashes three-sound words;
- the Year 1 bosses snatch the vowel gem out of a word (*r _ n*: < ai >, < ay > or < a >?) and read spellings the wrong way;
- the Year 2 bosses swap spellings, and throw rare spellings and long words;
- the final Baron battle is the whole chart, a dictated sentence and a proofread letter;
- the Library's dragons are made of syllables: *mul·ti·pli·ca·tion* has five segments.

Every boss is also its land's Sounds~Write **progress check**, so it tests what school tests at that point (§2).

**The middle and end game.** Today the story ends (Baron reformed, flower in bloom) at the first half-term of Year 1. In this design:
- **Year 1** is a map of six lands (the **Sky Isles**) and **Year 2** is a map of six more (the **Muddle Isles**, the Baron's own islands).
- The story ends at the end of Year 2, when every petal and every common gem is back. The reformed Baron then opens the **Library of Long Words**, which is the endgame.

### 0.2 The shape

| Map (the child sees) | For grown-ups | Sounds~Write | Lands (one boss each) | The story beat at the end |
|---|---|---|---|---|
| **Sensei's Garden** | pre-school | before Initial Code (game-only listening and picture reading) | 1 | the white belt; the boat to the Island |
| **The Island of Sounds** | Reception | Initial Code 1–11, Bridging | 6 (Bamboo Village … Shadow Castle, **Rainbow Bridge**, new) | the island's petals are home; the Baron flees up the Rainbow Bridge into the sky |
| **The Sky Isles** | Year 1 | Extended Code 1–26; long words from EC4 | 6 (Sky Temple, Cloud Town, Moon Marsh, Circus Island, Autumn Orchard, Star Dunes) | nearly every petal is on the World Flower; the Baron escapes across the sea with the rarest gems |
| **The Muddle Isles** | Year 2 | Extended Code 27–49; long words to 5 syllables; -tion | 6 (Echo Island, Gnome Hollow, Giant's Gorge, Dolphin Bay, Roaring Peaks, Muddle Castle) | the final battle; the flower is complete; the Baron says sorry, and why he hated words |
| **The Library of Long Words** | Year 2 stretch, Year 3 on | long words, special endings (-tion -cian -sion -ssion -ture), roots | endless wings | the golden bloom (the last, rarest gems) |

### 0.3 The decisions that matter most

1. **Four overworld maps and the Library** (§1.1). Each map is a stage; each land is about one progress check (6–8 weeks of school); each map ends with a story beat. There are no seasons in the child's world. The school term matters only to grown-ups.
2. **Game types belong to maps** (§1.4). The listening games live only in the Garden, first sounds only on the Island, spelling choice from the Sky Isles on, special endings only in the Library.
3. **"We assume you know these things"** (§1.5). A school child starts on their year's map, half a term behind school. Everything before it is **assumed**, and shows as **ghost petals**: outlines on the World Flower and silver sparkles on the maps.
4. **Catch-up is the glowing stone** (§1.6). A ghost petal comes home the moment the child shows they know it, in any game. When the evidence shows a gap, the next glowing stone becomes a **catch-up door** to the earlier level that teaches it, and comes back. A child who wants to go faster can clear a whole earlier land with its **guardian's challenge** (the boss as a quick check). The child never has to find catch-up.
5. **Spelling choice everywhere from the Rainbow Bridge on** (§3.2). Rival spellings go in the bank (*rain* with < ai > < ay > < a >), following Sounds~Write's lags: words just taught are first read, then hidden, then built; blind dictation with rivals comes four units later. Sensei's recorded "that's a spelling of that sound too" correction finally plays.
6. **Long words the Sounds~Write way** (§3.1). The ninja slices a long word into syllable carriages; the child builds each syllable sound by sound; the carriages couple and the gap closes, which is "write it without the gap". The read slider reads a long word the slow way (syllables, in the spelling voice) and the fast way (the whole word, in the talking voice).
7. **Special endings are three sounds under one gold bracket** (§3.3). At sound level *station* is < s t a > | < ti o n >, one tile per sound as Sounds~Write requires, with the ending bracketed in gold ("three sounds, one ending"). At syllable level the ending is one gold chunk.
8. **Bosses are progress checks with a signature phase** (§2.3). There is no losing screen, but there is a stake. Gems whose words needed help don't come home: the boss's helper grabs them and hides them in a **lair** stone, and a short rematch there wins them back.
9. **The weekly word list** (§1.9): `…/play/?list=` opens a week's scroll. It gives five minutes a day of Gem Choice on the list's words, a new game for the special words (**Ninja Vanish**: look, say the sounds, the word vanishes, build it, check), and a practice test on the day before school's.
10. **The story ends once** (§2.2). The finale plays once, at the end of Year 2. After that, nothing loops: the Library's content renews itself.

---

## 1. The progression map

### 1.1 Four maps and a Library: the decision, and why

**Decision.** The game has four overworld maps, one per stage, plus the Library of Long Words after them. Each map has its own lands, and each land has its own stones, as today. The child's names are the Garden, the Island of Sounds, the Sky Isles and the Muddle Isles. School years appear only for grown-ups.

Why this shape, and not seasons, one long map or a second island only:

1. **It is what Jonas asked for,** and it gives game types a natural home: some games only exist on some maps (§1.4).
2. **Fixed-size chunks with a visible end** are what works for 5–7-year-olds: Reading Eggs has 12 maps of 10 lessons, Nessy has islands of half a grade each, and Teach Your Monster has galaxies of 20–40 minutes (prior-art §5). A child can see how far they have come and what is next.
3. **One land is about one Sounds~Write progress check.** Schools give a check every 6–8 weeks, chosen by the last unit taught (SW §3.6, §9.2). Six lands a year gives a check every six or seven weeks of school time, and one boss per land is that check (§2).
4. **The story needs somewhere to go.** Each map ends with the Baron retreating further: up the Rainbow Bridge into the sky, then across the sea to his own islands, where the final battle is. The "more complicated sounds" of Jonas's question live further away because the Baron hid the rarest gems furthest from the World Flower. That is also true of the code: common spellings come first, rare ones later.
5. **Not seasons.** A child plays at their own pace, often faster than school, sometimes slower. Seasons or terms in the child's world would make "behind" visible and tie the game to a calendar that the child doesn't control. The term matters to grown-ups, so it lives in their settings (keeping in step with school, §1.7), not on the map.
6. **Not one long scrolling map.** The land map with one glowing stone and the ninja beside it (MAP_DESIGN.md) is what a three-year-old can use. The overworld map and the Atlas above it are for journeys between lands, for orientation and for catch-up. The child never needs them to find the next thing (§1.8).
7. **A Library after Year 2, not more lands.** Sounds~Write's long-word strand runs from Year 1 to Year 6 (SW §3.1), and the Library's content can renew itself from word lists, the weekly school list and subject words. It replaces today's loop, where the game points the child back at the Baron (audit §2.4).

### 1.2 Map by map, land by land

**What a land contains.** A land teaches three to five Sounds~Write units in about 10–16 stones. Each stone is a short lesson of one to three games (about 3–4 minutes), which is the shape of a Sounds~Write session ("3 or 4" lessons in 30 minutes) cut down for home. A sound unit gets about three stones (new spellings; practice; long words or a story), a spelling unit gets one (Sound Detective), and every land ends with a story, a Dictation Scroll and the boss. The planner adds review between stones (Sensei's Challenge, the catch-up doors, §1.6), so a child who needs more time gets it without the land growing.

The long-word strand runs **4–7 units behind** the land's own code, as the official checks do (SW §1.2, §3.1). The "spells" column uses Sounds~Write's 5–7-unit lag for accurate spelling. "Reads" is the land's code at a one-unit lag.

#### Sensei's Garden (pre-school)

| Land | Stones | Games | Ends with |
|---|---|---|---|
| **Sensei's Garden** | the warm-ups W1–W6 (FIRST_MINUTES §10), and more listening stones as they are made | Ninja Ears, Slow Words, Pocket Hunt, Ninja Reading (the read slider, compound words), Guess My Word, Sound Dots | the white belt, and a boat across to the Island (§1.8). No boss: nothing here is Sounds~Write code, and a boss would be a test of listening games |

#### The Island of Sounds (Reception)

These lands exist. What changes is in §2.4 (the bosses) and §6.1.

| Land | Units | Boss (check) | By the end the child reads … and spells … (lagged) |
|---|---|---|---|
| Bamboo Village | IC1–2 | Sumo Panda (Sounds~Write has no check before Unit 3) | reads and spells *mat, sit, pin, top* |
| Blossom Hills | IC3–4 | Oni (check 2) | *bag, hen, fig, vet*; spells IC1–2 words |
| Misty Mountains | IC5–7 | Yeti (check 5) | *rug, jet, box, hill, buzz*; spells IC3–5 words |
| Dragon River | IC8–10 | River Serpent (check 8) | *jump, frog, strap*; spells IC5–8 words |
| Shadow Castle | IC11 | Shadow Knight (check 9) | *ship, chop, thin, ring, duck, quick, have, catch* |
| **Rainbow Bridge** (new) | Bridging Unit: /k/ c k ck, /ch/ ch tch, /w/ w wh, /v/ v ve | **the Bridge Troll** (check 11) | chooses < c k ck > and < ch tch > by where the sound is (*cat, kit, duck; chip, catch*); the first spelling choice |

#### The Sky Isles (Year 1)

| Land | Units (school time) | New code | Spelling units: Sound Detective | Long words (4–7 units behind) | Boss (check) | By the end: reads … / spells (lagged) … |
|---|---|---|---|---|---|---|
| **Sky Temple** | EC1–5 (Y1 autumn, weeks 1–7), after two review stones for the Initial Code | /ae/ ai ay a ea; /ee/ ee ea e y; /oe/ o oa ow oe; consonant + e: te me ke le pe (EC1), de ne ze se be (EC4) | < ea > (team, great); < o > (hot, no) | PW1 from EC4 week 2: *sun·set, zig·zag, cob·web* | **the Magpie** (check 3) | reads *rain, play, cake, great, feet, sea, she, happy, boat, snow, go, bone* / spells Initial Code and Bridging words, choosing < ck > or < k >, < tch > or < ch > |
| **Cloud Town** | EC6–9 (Y1 autumn 2) | /er/ er ir ur or (+ fe); /e/ e ea ai; /ow/ ou ow | < ow > (cow, snow) | PW2: *in·sect, den·tist, egg·shell, chop·stick* | **the Thunderbird** (check 6) | reads *her, bird, turn, word, bread, said, cloud, town* / spells EC1–2 first spellings: *rain, play, feet, sea* |
| **Moon Marsh** | EC10–13 (Y1 spring 1) | /oo/ oo ew ue u o; /ie/ i igh y ie; /uu/ oo u oul | < oo > (moon, book) | PW3: *fan·tas·tic, splen·did, a·ddress, le·mon* (weak syllables begin) | **the Hoot Owl** (check 9) | reads *moon, blue, flew, June, night, my, pie, find, book, put, could* / spells EC4–6: *boat, snow, bird, turn* |
| **Circus Island** | EC14–18 (Y1 spring 2) | /u/ u o ou; /s/ s ss st c ce se sc; /l/ l ll le al el il ol (in two-syllable words from the start) | < ou > (loud, double, soup); < s > (cats, his) | PW4: *day·break, pain·ting, rain·bow*; /l/ words *ca·mel, pen·cil, a·pple* | **the Circus Lion** (check 12) | reads *come, love, young, face, circle, listen, his, table, camel* / spells EC7–11: *bread, cloud, moon, night* |
| **Autumn Orchard** | EC19–22 (Y1 summer 1) | /or/ or aw au a ar al oor; /air/ air are ear ere eir; /ue/ ue ew u eu | < ew > (blew, new) | PW4–5; syllable level (Lesson 13) for children who are ready: *win·dow, ye·llow, some·times* | **the Scarecrow** (check 15) | reads *born, saw, sauce, walk, door, chair, share, bear, there, few, unit* / spells EC12–16: *book, come, face* |
| **Star Dunes** | EC23–26 (Y1 summer 2) | /oy/ oi oy; /ar/ ar a al au; /o/ o a | < a > (cat, was, apron, father) | PW5: *le·vel, re·port, night·mare* (the end-of-Year-1 check's kind of word); Alien Words for the Phonics Screening Check | **Baron Muddle, first round** (check 18) | reads *coin, boy, car, father, calm, was, want, swan*, and alien words / spells EC17–21 first spellings |

#### The Muddle Isles (Year 2)

| Land | Units (school time) | New code | Spelling units | Long words | Boss (check) | By the end: reads … / spells (lagged) … |
|---|---|---|---|---|---|---|
| **Echo Island** | EC27–31 (Y2 autumn 1) | more /ae/: ei ey eigh; /d/ d dd ed; more /ee/: ey ie i; /i/ i ui e y | < y > (yes, gym, my, happy) | EC19–23 spellings in long words: *air·line, stair·case, au·thor, wa·ter*; -ed endings (*played, called*) | **Captain Parrot** (check 22) | reads *eight, they, vein, ladder, played, key, chief, ski, build, gym* / spells EC19–25 |
| **Gnome Hollow** | EC32–34 (Y2 autumn 2) | more /oe/: ou ough; /n/ n nn gn kn; more /er/: ar ear our re (in two-syllable words) | – | *ho·li·day, de·co·rate, cham·pi·on*; *do·llar, fa·vour, li·tre* | **the Gnome King** (check 25) | reads *soul, dough, though, knee, knock, gnome, sign, earth, heard, collar* / spells EC26–29 |
| **Giant's Gorge** | EC35–39 (Y2 spring 1) | /v/ v vv ve; more /oo/: ui ou ough; /j/ j g ge gg dge; /g/ g gg gh gu | < g > (gum, gem) | *ra·di·o, sym·bol, mul·ti·ply* (the spelling voice for schwa) | **the Giant** (check 29) | reads *have, sleeve, fruit, soup, through, giant, huge, bridge, ghost, guess* / spells EC30–34 |
| **Dolphin Bay** | EC40–42 (Y2 spring 2) | /f/ f ff ph gh; /m/ m mm mb mn | < gh > (laugh, ghost) | *rou·tine, si·mi·lar, knee·cap, gen·tle* | **the Ghost Captain** (check 31) | reads *phone, graph, laugh, rough, photo, climb, thumb, lamb, autumn* / spells EC35–37 |
| **Roaring Peaks** | EC43–45 (Y2 summer 1) | more /or/: oar ore our augh ough; /h/ h wh; /k/ c k ck ch cc | – | *sub·merge, laugh·ter, pho·to·graph*; **-tion begins**: *sta·tion, mo·tion, fic·tion, sec·tion* (National Curriculum Year 2) | **the Roaring Boar** (check 34) | reads *board, more, four, caught, thought, who, whole, school, echo* / spells EC38–40 |
| **Muddle Castle** | EC46–49 (Y2 summer 2) | /r/ r rr wr rh; /t/ t tt te bt ed; /z/ z zz ze s se ss; /eer/ eer ere ear | – | *me·cha·nic, cha·rac·ter, che·mis·try* (the end-of-Year-2 check's kind of word); the maths words *a·ddi·tion, sub·trac·tion, mul·ti·pli·ca·tion* | **Baron Muddle, the final battle** (check 38) | reads *write, wrong, rhyme, carrot, doubt, stopped, please, scissors, deer, here* / spells EC41–44, and first and more spellings together |

#### The Library of Long Words (Year 2 stretch, Year 3 on)

| Wing | Content | Bosses |
|---|---|---|
| The Shun Wing | -tion (*station* … *multiplication*, *information*), -ssion (*mission, permission*), -sion as /sh/ (*tension*) | the Shun Wyrm |
| The Magic Wing | -cian (*magician, optician, musician, electrician*), with the root as the clue | the Cian Wyrm |
| The Treasure Wing | /zh/ (*division, television, decision, treasure, measure*), -ture (*picture, nature, adventure*) | the Treasure Wyrm |
| The Everything Wing | the planner's long words from every unit, the weekly lists, subject words (*Monday, February, hexagon*) | the Great Bookwyrm (a dictated sentence) |

"Wyrm" is the child's word for these long, segmented book dragons: each has one body segment per syllable (§2.5).

**Why the lands have these names.** Each name holds its land's sound, so the name is a small mnemonic: **Cloud Town** has both spellings of /ow/; **Moon Marsh** the /oo/ of moon; **Circus Island** < c > as /s/ and as /k/; **Autumn Orchard** two spellings of /or/; **Star Dunes** /ar/; **Gnome Hollow** < gn > as /n/; **Giant's Gorge** both sounds of < g >; **Dolphin Bay** < ph > as /f/ (the /f/ petal's own picture is a dolphin); **Roaring Peaks** < oar > as /or/. Sensei points this out once per land, in the land's welcome ("Listen… Cloud Town. Can you hear /ow/ twice?"), and never as a test. The Sky Temple keeps its name and art. Moon Marsh, Autumn Orchard and Star Dunes are SOUNDS_WRITE_MODEL §6.1's placeholders, kept because they already carry their sounds.

### 1.3 The targets for Year 1 and Year 2

What the game means by "end of Year 1" and "end of Year 2", from Sounds~Write's own end-of-year picture and the National Curriculum (SW §7.4, §7.1, §7.3):

| | End of Year 1 (Star Dunes done; check 18) | End of Year 2 (Muddle Castle done; check 38) |
|---|---|---|
| **Code** | the first spellings of every vowel sound but /eer/ (EC1–26), and the spellings with several sounds < ea o ow oo ou s ew a > | the whole Extended Code (EC1–49): first and more spellings, rare consonant spellings (< kn gn wr mb ph gh dge >) |
| **Reads** | words with any of that code; two- and three-syllable words with code to about EC20 (*level, report, nightmare*); alien words at Phonics Screening Check level | most words without sounding out; four- and five-syllable words (*mechanic, character, chemistry*); common suffixes as syllables (*payment, useful, slowly*); -tion words |
| **Spells** | first spellings of about EC1–20 in words, choosing between them; -s, -es, -ing, -ed, -er, -est; short dictated sentences | first and more spellings of about EC1–43; long words syllable by syllable in the spelling voice (*multiply, holiday*); -tion words (*station*); common homophones (*sea, see*); longer dictated sentences |
| **Special words** | the code for 233 of the 300 common words has been taught; Year 1's common exception words (*said, friend, school, once*) | all of them; Year 2's (*because, busy, people, climb*) |
| **Stretch** | – | reads *magician, optician, division, television* syllable by syllable (the Library's first wing) |

**How the game proves each target.** Each is the boss check of the land where it lands: a check reads and dictates words the way the official one does (§2.3). The grown-ups' page shows each land's check result with real words ("Moon Marsh check: read 17 of 20, spelt *boat, snow, bird* and *turn*"). Nothing is claimed that a level doesn't test.

### 1.4 Game types belong to maps

Jonas: "some game types just only appear on some maps. That is, in my opinion, totally fine." Here is where each one lives. ✓ means it teaches there; "review" means it appears only in review and challenges.

| Game | Garden | Island | Sky Isles | Muddle Isles | Library | Sounds~Write basis |
|---|---|---|---|---|---|---|
| Ninja Ears, Slow Words, Pocket Hunt, Guess My Word, Sound Dots | ✓ | – | – | – | – | game-only oral work (Decision 3) |
| Ninja Reading (the read slider on compound words) | ✓ | – | returns as the Syllable Train's slider | – | – | "follow my finger" |
| First Sounds, Sound Hunt | – | ✓ (Bamboo Village) | – | – | – | Lesson 1's first-sound question |
| Word Building (the dojo), Kai and Suki | – | ✓ | ✓ (new ways to spell a known sound) | ✓ | – | Lessons 1, 4, 5; Lesson 6 in the Extended Code |
| Monster Battle | – | ✓ | ✓ with rival spellings | ✓ | ✓ | quizzing, Lesson 4a |
| Sound Swap | – | ✓ | review (Initial Code words and alien words only) | review | – | Lesson 3 ("with Initial Code words only" in the Extended Code) |
| Ninja Run | – | ✓ | ✓ as Speed Read and alien words | ✓ | – | Speed Read |
| Story Time | – | ✓ | ✓ with Seek the Sound | ✓ longer, with questions | ✓ | Lessons 4 and 9 |
| Sorting | – | Rainbow Bridge only | ✓ (read, then spell the chests' words) | ✓ | – | Lessons 6–8 |
| Gem Trials | – | ✓ | ✓ as a choice (§3.2) | ✓ | – | quizzing |
| **Gem Choice** (§3.2) | – | – | ✓ | ✓ | ✓ | Lessons 6 and 7; the "valid alternative" correction |
| **Sound Detective** (MULTI_SOUND.md) | – | – | ✓ | ✓ | review | Lesson 10, spelling units |
| **Syllable Train**, sound level (§3.1) | – | – | ✓ from Sky Temple's EC4 stones | ✓ | ✓ | Lessons 11–12 |
| **Syllable Train**, syllable level | – | – | from Autumn Orchard, for children who are ready | ✓ | ✓ | Lessons 13–14 |
| **Dictation Scroll** (§3.5) | – | ✓ from Blossom Hills (short sentences) | ✓ | ✓ | ✓ | Lesson 4a |
| **Alien Words** (§3.8) | – | – | ✓ (Moon Marsh on) | review | – | adapted Phonics Screening Checks |
| **Muddled Notes** (§3.6) | – | – | Star Dunes only (the Baron's first note) | ✓ | – | proofreading (National Curriculum Year 2); reading back |
| **Sound Twins** (§3.7) | – | – | – | ✓ | ✓ | homophones (National Curriculum Year 2) |
| **Word Detective** (§3.8) | – | – | – | ✓ | ✓ | Lesson 15 |
| **Special endings, the Root Dojo, the Shun Sort** (§3.3) | – | – | – | -tion only, from Roaring Peaks | ✓ | "special endings"; Lesson 15 |
| **Ninja Vanish** (§1.9.5) | – | ✓ (with the weekly list) | ✓ | ✓ | – | word building a word with untaught code; "look, say the sounds… cover… write… check" |
| Boss (a progress check, §2) | – | ✓ | ✓ | ✓ | the wyrms | progress checks |
| Sensei's Challenge, the weekly scroll | everywhere, from the map and the title | | | | | review; the school's own list |

**Why some games stop.** The listening games belong to children who don't read yet. First Sounds is a bridge into Lesson 1 and has done its job by Blossom Hills. Sound Swap stays in review because Sounds~Write keeps Lesson 3 to Initial Code and nonsense words after Reception. Sorting starts at the Rainbow Bridge because "the same sound can be spelled in more than one way" is taught formally there (NARRATIVE_AUDIT F25). Special endings start at Roaring Peaks because -tion is Year 2 in the National Curriculum.

**Each map's first meeting with a new game** uses the full form (frame, Sensei's slow demo, the Ready tap, the hand-over; TEACHER_SCRIPT §0.1). A school child who starts on the Sky Isles meets the Island's games only if they go back, and then with the full form too, because the ledger says they have never been introduced to them.

### 1.5 The school-entry path: "we assume you know these things"

Jonas: "if you say, I'm already in school, basically we say, okay, we'll walk you through and say, we assume that you know these things, but, uh, like, no worries if not."

**Where a school child starts.** As today (FIRST_MINUTES §4), half a term behind the official pace, now on a real land:

| The opt-in answer | Sep–Dec | Jan–Mar | Apr–Aug |
|---|---|---|---|
| Not yet, not sure | the Garden (W1) | the Garden | the Garden |
| Reception | the Garden's W1 and W2 (Reception versions), then Bamboo Village | Misty Mountains (IC5) | Dragon River (IC9) |
| Year One | Sky Temple (EC1) | Cloud Town (EC6) | Circus Island (EC14) |
| Year Two | Echo Island (EC27) | Gnome Hollow (EC32) | Dolphin Bay (EC40) |

The child starts at the **first stone of the land** that holds the start unit, which keeps the "half a term behind" margin and gives them the land's story from its start.

**What "assumed" means.** Every unit before the start point is **assumed**:
- Its petals and gems are **ghost petals** and **ghost gems**: a dotted outline with a faint silver shimmer on the World Flower, and silver sparkles over those lands on the maps. They are neither won nor missing; they are waiting.
- The stones of the assumed lands are open. They play with the full forms of their games (the child has never been introduced to them), and a tap on one asks first, as a finished stone does (MAP_DESIGN §7).
- In the planner, assumed code counts as taught (it may appear in words and on the bank), and it starts with a prior, not evidence (§6.3). So the child is never shown code their school hasn't taught, and nothing about them is recorded as known until they show it.

**The welcome to the map** (a school path's first session, after the opt-in's confirmation and before the first lesson). The Atlas unrolls. Run to the child's first tap: about 9.4 s; from the tap to ▶: about 11.5 s.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_atlas_frame | 0 s | the Atlas unrolls: the Garden and the World Flower at the bottom, the Island, the Sky Isles floating above, the sea and misty islands beyond | This is the map of our whole world. | — | once per save (school paths) |
| tv_school_know | 2.6 s | the Garden and the Island glow softly | You go to big school, so you know lots of sounds already. | — | once per save |
| tv_school_start_sky / _muddle | 6.0 s | the view glides to the start map; the child's ninja token lands on the start land and bounces | So your adventure starts up here, in the Sky Isles. / So your adventure starts over here, on the Muddle Isles. | taps the token (the ninja jumps into the land) | once per save |
| tv_school_tap_ninja | ↳ 4 s with no tap | the token pulses | Tap your ninja to jump in. | taps | every time |
| tv_school_island / _both | the tap | the view dips to the Island (and the Sky Isles for Year 2); silver sparkles rise over its lands | Down here is the Island of Sounds. Some of its petals might still be there. / Back there are the Island and the Sky Isles. Some of their petals might still be there. | — | once per save |
| tv_school_collect | 4.2 s | a ghost petal flies up to a small World Flower in the corner and fills with colour | That's fine. When you show me a sound you know, its petal comes home. | — | once per save |
| tv_school_go_<land> | 8.6 s | ▶; the view returns to the start land | Let's go to the Sky Temple. Tap the green arrow. | taps ▶ | once per save |

**For grown-ups** (a card on the grown-ups page, and once by the opt-in's confirmation, press-and-hold to dismiss):

> **Maya starts in the Sky Isles (Year 1, autumn term: Sounds~Write Extended Code Unit 1).** We assume she knows the Reception sounds (the Initial Code and the Bridging Unit). Nothing is marked as known yet. As she plays, every sound she shows she knows is collected on her World Flower. If we spot a gap, a catch-up stone appears on her path and brings her back when it's done. You can also open the Island of Sounds any time from the map.

### 1.6 Catch-up: how it is shown, and how it is nudged

Jonas: "It needs to be, like, really obvious how to sort of do catch-up learning." Obvious to whom matters. A five-year-old can't be expected to go looking for gaps, so for the child **catch-up is simply the next glowing stone**. For grown-ups it is a card that says what was assumed, what was collected and what is on the way.

**Four ways a ghost petal comes home**, all drawn the same way (silver becomes colour, and the petal flies to the World Flower):

| Way | When | What the child sees | What Sensei says |
|---|---|---|---|
| **1. Shown in play** (most of them) | a ghost gem's spelling is right first try, with no help, in two you-do items, with no miss between them | at the end of the level, on the reward: the ghost gem fills, and its petal flies home with the level's stickers | `tv_known_petal` "You knew that sound already! Its petal is flying home." (the first three times per save); later the flight only, and `tv_known_petals_<n>` "You knew three sounds already!" when several come at once |
| **2. The catch-up door** | the planner finds a gap: an assumed spelling missed twice in different items, or a pattern of confusion (/ch/ for /sh/) | the next glowing stone is a round door on a short side path, with a silver swirl and the earlier land's colour and game picture inside (§1.6.1) | `tv_catch_door` (first time), `tv_catch_door_short` |
| **3. The guardian's challenge** | the child or a grown-up chooses to clear an earlier land fast | on the overworld map, an earlier land with ghost petals shows its guardian awake, with a silver "!" | the guardian's own taunt, then the boss check, short (§2.3) |
| **4. The lair** | a boss check left gems unearned (§2.6) | a lair stone on the land map: the petal imp's nest, holding the gems | the imp's taunt, then a short Gem Chase |

**Rules for the doors,** so that catch-up never takes over the adventure:
- A door is only ever the glowing stone. There is never a second glowing thing, and never a list of chores.
- At most one door in every three stones, never two doors in a row, never as the session's first stone (the day starts with the child's own land), and at most two a day. A grown-up's "Catch up first" setting raises this to one in two.
- A door leads to one short earlier level, the one that first teaches the missing spelling (`firstTaught`), cut to its teaching and practice games (about three minutes). Then it brings the child back, with the walk, to the stone after the door.
- The child's own land's next stone stays on the map, calm and open, so a child who taps it plays it (after Sensei's question, as for any stone that isn't the glowing one).
- A door's level counts as a normal level: stars, stickers, and the ghost gems it proves come home.

#### 1.6.1 The door, on the map

- **Where:** the door stands on a short dotted spur off the path, just after the ninja, so it reads as a side trip and not as the land's next stone. The ninja stands beside it (MAP_DESIGN §5.3 treats it as the glowing stone's slot).
- **What it looks like:** a round stone door, 150 stage px, with a slow silver-blue swirl inside, the earlier land's colour on its rim and that level's game picture in the swirl. It has the glowing stone's rays and halo, because it *is* the glowing stone.
- **The walk back:** after the door's level, the reward plays as usual, then the map opens on the current land with the ninja stepping out of the door, which closes and sinks. The just-proven petals fly to the World Flower in the corner.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_catch_door | the map's arrival, the first door of the save | the door glows; the hand points at it; the swirl shows Shadow Castle | This glowing stone is a magic door. It goes back to the Shadow Castle, for a petal you haven't collected yet. | taps the door | once per save |
| tv_catch_door_short | later doors | the door glows | This magic door goes back to the <land>. | taps | first two per land; then the hint only |
| tv_catch_back | the walk back, after the door's level | the ninja steps out; the door closes; the petal flies | You got it! Now back to the <land>. | — | every time (the first three per save; then a chime) |
| tv_ghost_tap | the World Flower: a ghost petal tapped | the petal card: the petal in silver, its land's picture | This petal is waiting on the Island of Sounds. Do you want to go and get it? | the land picture (go) or ▶ (stay) | every time |

#### 1.6.2 The guardian's challenge

On the overworld map, each earlier land that still has ghost petals shows its guardian's portrait awake, with a silver "!" (not gold: the current land keeps the only glow). A tap asks first ("Do you want to take on the Yeti?"), then plays the land's boss as a **short check**: 8–10 words over the land's code, the signature phase cut to two items, no long-word finisher, about two minutes. Every spelling shown right first try comes home at once ("You knew them all!"). Anything missed stays silver and becomes a door later.

A Year 1 child who knows their Reception sounds can clear the whole Island in six guardian challenges, about twelve minutes, and see their World Flower fill. Children love beating bosses, so this fast lane is also the fun lane.

#### 1.6.3 For grown-ups: the catch-up card

On the grown-ups page, under the child's name:

> **Catch-up** · Assumed when Maya started: 29 sounds and 41 spellings (Reception). Collected by showing she knows them: 24 sounds, 33 spellings. Still to check: *ng, qu, x, zz, tch* (these will come up as she plays). Gaps found: she mixed up /ch/ and /sh/ twice, so a catch-up stone to Shadow Castle is on her path. **[Play the Island's guardians]** · **Catch up first:** off

The numbers are the ledger's, never guessed. "Assumed" is always said, so a grown-up never reads "collected" as "taught by the game".

### 1.7 Placement, the first check, Jump ahead, and keeping in step with school

- **The first check** (FIRST_MINUTES §10) stays: the first three you-do items at a school start point. If 0 or 1 is right first try, the child drops one band on the spot: Year Two to Year One's start, Year One to the Island's Reception start, Reception to the Garden. What they were assumed to know from the dropped band stops being assumed.
- **Show Sensei** (the grown-ups' placement quiz) now does two things. It suggests a start land, as today, and every spelling it sees right first try comes home as a collected petal. So a grown-up who runs it on day one gives the child a head start on the flower.
- **Jump ahead** is still a grown-up's decision. The planner offers it when the child is bored and near-perfect on a probe of the next three units (planner §1). A jump moves the child to the first stone of the next land (or the next map), and everything skipped becomes assumed, with ghost petals, the same as a school start. There is never a separate "skipped" state.
- **Start from here** (grown-ups) can move the child's start earlier. Nothing they collected is lost.
- **Keeping in step with school** (a new grown-ups setting, **Decision**): "Go at their own pace" (the default) or "Stay close to school". With "Stay close to school", the child's frontier stops one land ahead of where a Sounds~Write class would be this week (from the school year and the date, `PACING`). When they reach it, the glowing stone offers review, long words, the weekly list and guardian rematches instead of new code. Nothing is time-locked on the map: the next land simply isn't the glowing stone yet, and its gate says "Soon" (a grown-up can open it).
- **Moving up** (1 September) keeps FIRST_MINUTES's ten-second moment and adds a look at the Atlas: the new year's map glows. Progress never moves by itself. If school is now ahead of the game, the grown-ups page offers "Start from here", which turns the gap into ghost petals.

### 1.8 Navigation: the land, the map, the Atlas

Three zoom levels, and the child needs only the first.

| Level | What it is | When the child sees it | Taps |
|---|---|---|---|
| **The land map** (today's map, MAP_DESIGN.md) | one land's stones, the glowing stone, the ninja beside it | always: Home lands here | as MAP_DESIGN |
| **The overworld map** (one per stage) | the stage's six lands as islands on one painting, joined by a route; the child's ninja token on the current land, which glows; beaten guardians as small portraits with a flag; ghost sparkles and guardians awake over earlier lands; lairs; misty lands ahead | the journey after each boss (§2.6); the map-scroll button on the land map (a paper scroll icon beside Sensei's Challenge, indigo like it, never gold); a ghost petal's gate on the World Flower | the current land: its land map. An earlier land: Sensei's question ("Do you want to go back to Moon Marsh?"), then its land map. A guardian awake: its challenge (§1.6.2). A misty land: the hint ("Not yet! Your ninja is here.") |
| **The Atlas** | the four maps and the Library on one painting | the school welcome (§1.5); each map's end (§2.6); the overworld map's zoom-out | a map: its overworld map. The Library, before it opens: a locked door with a keyhole and one line ("This place is locked. I wonder what's inside?") |

**The journeys between maps** are short scenes of up to 10 s. A tap on ▶ ends them after the first viewing.
- **Garden → Island:** Sensei rows the child across to Bamboo Village.
- **Island → Sky Isles:** the child runs up the Rainbow Bridge after the fleeing Baron.
- **Sky Isles → Muddle Isles:** the Petal Ship, a flying ship with petal sails, chases the Baron's balloon across the sea.
- **Muddle Isles → Library:** the reformed Baron unlocks the Library's doors.

**One glowing thing, at every level.** On the land map it is the stone (or door, or scroll). On the overworld map it is the current land. On the Atlas it is the current map. Ghost sparkles are silver, small and still, and never pulse.

### 1.9 The weekly word list: a deep link and five minutes a day

Jonas, "for later": "Every week at school, they get this word list … a list of words that have all got different spellings of a sound they've gone through in phonics class. And also one or two or three special words … there should be a game for those as well … a deep link system where you can just have query params or something that encode the word list and then get a special sort of challenge levels to master that word list with like five minutes of practice a day."

This section designs it in full, and §1.9.8 lists the hooks to build now, so that the build later is small.

#### 1.9.1 What school sends home, and what Sounds~Write says about special words

**Freshford** (the Year 1–2 parents' presentation, 23 September 2026): the lists go out weekly on Seesaw or in the red books, "based on the sounds a child has been taught". Children learn "the different spellings of a particular sound and apply them in some common words", plus "some high frequency 'special words' that cannot be sounded out". There is a test each week. A child who doesn't get all or almost all right practises the same list again, but every two or three weeks the class moves on regardless, so "it is crucial that spelling words are practised regularly at home". The school suggests "Look, cover, write, check", and "trial and error": try each spelling of the sound and see which looks right.

**Sounds~Write** has no "tricky words" or "sight words" (SW §6; DOSSIER §11.1). It calls them words "that contain code which has not yet been taught", and the teacher "takes responsibility" for that part: "This is /e/, say /e/ here". To practise a word that keeps coming up, you build it with its tiles, the hard spelling on one tile, and write it saying the sounds. Its improved "look, cover, write, check" is: look, say the sounds and read the word, talking about the unfamiliar spelling; then cover it, write it saying the sounds, read it back, and check with the original. The limits are "no more than one 'difficult' bit in each word", and "no more than one or two of these words a week" (DOSSIER §11.3).

**Decision.** The game practises the school's list exactly as sent, including the special words, but teaches the special words the Sounds~Write way: every word is sounded out, and the special part is given, not memorised as a shape. The child hears "special words", the school's term, and never "tricky" or "sight words". Sensei's explanation is "Special words have a surprise spelling. I'll tell you the surprise." At most two new special words are taught on one day; a list with three spreads them over two days.

#### 1.9.2 The link

```
https://superninja.templestein.com/play/?list=rain,play,cake,great,eight,they&special=said,because&test=fri
```

| Parameter | Required | Meaning | Rules |
|---|---|---|---|
| `list` | yes | the week's words, comma-separated, in the school's order | 1–15 words; each 1–20 letters (a–z, an apostrophe, a hyphen); lower-cased, trimmed, de-duplicated |
| `special` | no | the special words | 0–3 words, same rules; a word in both lists counts as special |
| `test` | no | the day of the school's test | `mon`–`fri`; default `fri` |
| `week` | no | the Monday of the list's week, `YYYY-MM-DD` | default: this week's Monday on the device |
| `v` | no | the format version | default `1`; unknown versions are refused politely |

- **Readable on purpose.** A teacher can type one, a parent can check it, and a school can post a single link for the whole class on Seesaw or print it as a QR code in the reading log. Commas are allowed in a query string without escaping.
- **It carries no child data.** The link is only a list. It is stored in the save of the profile a grown-up chooses (§1.9.3), never on a server with a name attached. A request for words the game doesn't know yet is logged by word only (§1.9.7).
- **The list maker.** A small page on the site (`/list`) lets a grown-up type or paste the week's words, marks the special ones with a tap, shows how the game will read each word, and gives back the link and a QR code.

#### 1.9.3 What a grown-up sees when the link opens

The link opens the game on a **grown-ups' screen** (the same press-and-hold as the gear, so a child tapping a link on Seesaw doesn't set it up alone):

> **This week's spelling list** · for **Maya** ▾
> This week's sound: **/ae/**, spelt < ai > < ay > < a > < ea > < eigh > < ey >
> rain (r·**ai**·n) · play (p·l·**ay**) · cake (c·**a**·ke) · great (g·r·**ea**·t) · eight (**eigh**·t) · they (th·**ey**)
> Special words: **said** (< ai > is /e/ here) · **because** (be·cause: < au > is /o/ here)
> Test day: Friday. Five minutes a day, from today.
> **[Hold to add this list]** — it replaces last week's list.

- **The week's sound** is the sound most of the list's words share, found from their segmentations (`segs`). A list with no shared sound (a list of common words, say) is fine: the scroll then practises words, not a sound.
- **Each word shows its sounds and spellings,** so a grown-up can see that the game reads *cake* as c·a·ke (the official 2024 coding) and not with a-e. For a school that teaches split spellings, the grown-ups' setting that already exists (`split: "split"`) shows them as Freshford writes them.
- **Special words show their surprise part**, from the game's high-frequency chart (SW §6), or from the aligner when the word isn't on it.
- **Words the game can't play yet** are listed as "coming by tomorrow" (§1.9.7).

#### 1.9.4 The week's scroll: five minutes a day

**For the child** the week's list is a **scroll**. It is the session's first glowing stone each day until that day's scroll is done: a paper scroll with a ribbon standing in the glowing stone's slot, with the stone's glow. Then the adventure's own stone comes back. So a child who plays every day does their school words first, for five minutes, and no one has to find anything. A grown-up can switch "school words first" off, and the scroll then hangs by the map's side as a calm button.

| Day | What the scroll does | About |
|---|---|---|
| **Day 1** (the day the list is added) | *Meet the list.* The week's sound's petal opens and shows this week's gems (a short dojo Learn, known sounds greeted as known). A sort: the list's words drop into their gem chests, read first (Lesson 7). Three words are built with the word seen first, then vanished (Gem Choice's peek, §3.2). Special word 1 in Ninja Vanish (§1.9.5) | 10 items, about 5 min |
| **Days 2 to the day before the test** | *Practise.* Gem Choice on 6–8 list words: with a peek on day 2, without on later days, word by word as each word's rung rises (§3.0.3). One Ninja Vanish, taking turns between special words. A Sound Detective or Syllable Train item if a list word needs one (*great*, *eight*; *because*). Yesterday's misses come first | 8–10 items, about 5 min |
| **The day before the test** | *Practice test.* Sensei dictates every word the way school does, with the full bank: "Your word is… *great*. Build it, and say the sounds as you go." A homophone gets its sentence first (Sounds~Write dictates "the word, a sentence, the word"). The special words too. A result card for the child (every word, ticked or glowing to practise) and for the grown-up | 8–15 items, 4–6 min |
| **After the test** | *Keep.* The list's words join the planner's normal spaced review, so they come back in battles and challenges over the next weeks | – |

- **A week strip** runs along the scroll: seven dots, a stamp for each day's scroll done, a gold stamp for the practice test. A missed day leaves an empty dot, never a broken flame.
- **Five minutes is a budget, not a timer.** The scroll ends at the first item boundary after five minutes, and it ends on a success (the planner's rule). A slow child does fewer items. Nothing is timed on screen.
- **If a list's spellings are ahead of the child's land** (a Year 1 child whose game path is behind school), the scroll teaches them anyway, because school is teaching them this week. They are marked "met at school" in the learner model, and the World Flower charges those gems. The child's land path does not jump.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_wk_new | day 1, the scroll unrolls | the list's words on the scroll | Your grown-up gave me your spelling words from school! | — | once per list |
| tv_wk_sound | straight after | the week's petal opens | This week, our sound is… /ae/ | taps the petal; says it | once per list (if the list has a sound) |
| tv_wk_gems | straight after | the week's gems glow one by one | Here are the ways we spell it this week. | — | once per list |
| tv_wk_daily | days 2 on | the scroll | Let's practise your school words. It only takes a few minutes. | taps ▶ | first two days per list; then short |
| tv_wk_short | later days | the scroll | Here are your school words again. | — | short |
| tv_wk_test_eve | the day before the test | the scroll with a gold ribbon | Tomorrow is your spelling test. Let's try all your words, like a real test. | taps ▶ | every list |
| tv_wk_all | the practice test, every word right | the card: every word ticked | You spelt every word! You're ready for tomorrow. | — | every time |
| tv_wk_some | the practice test, some to practise | the card: the words to practise glow | Nearly all of them! Let's practise these once more. | builds them again | every time |
| tv_wk_stamp | each day's end | a stamp lands on the week strip | That's today's scroll done. Here's your stamp. | — | every time |

#### 1.9.5 Ninja Vanish: the game for special words

**Sounds~Write basis:** word building a word with untaught code, the hard spelling on one tile, and the improved "look, say the sounds and read it, cover it, write it saying the sounds, check" (DOSSIER §11.3). The teacher's line for the surprise part is Sounds~Write's: "This is /e/. Say /e/ here."

**The game in one paragraph.** A scroll unrolls with the special word on it, the surprise part underlined in gold. The child reads it the Sounds~Write way: the read slider's tortoise walks under the spellings and each sound plays, and at the gold part Sensei gives the surprise ("This is… /e/"). Then the rabbit reads the word. The ninja throws a smoke ball: puff, and the scroll rolls up. The child builds the word from its tiles, saying the sounds. Then the scroll unrolls again, and the built word flies up under it: each tile that matches chimes. A tile that doesn't glows, and the child swaps it.

**The screen (stage 1280 × 720; at 844 × 390 the stage is drawn at 0.54).**

| Thing | Where (stage px) | Notes |
|---|---|---|
| the scroll | top centre, 760 × 200, at y 90–290 | the word in Andika 110 px; the surprise spelling underlined in gold. When rolled up it is a 120 px tube at the top |
| the read slider | under the word, y 300–340 | the tortoise at the left end, the rabbit at the right (docs/read-slider/research.md) |
| the lines | y 330–450, centred, one per sound | 104 px slots (92 at five sounds, 80 at six or more) |
| the tiles | the bank row, y 520–620, between the ninja and Help | the word's own tiles, jumbled. From a word's third play, one rival for the surprise part (< e > beside < ai > in *said*) |
| the ninja, Help, Hear it again, Home | as everywhere | the ninja's smoke ball flies from its hand to the scroll |

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_van_frame | 0 s | the scroll unrolls: *said*, with < ai > underlined in gold | This game is called Ninja Vanish. This is a special word. | — | full |
| tv_van_surprise | 3.2 s | the gold part pulses | Special words have a surprise spelling. I'll tell you the surprise. | — | full |
| tv_van_slide | 6.8 s | the tortoise glows at the start of the rail | Slide the tortoise, and say the sounds with me. | slides: /s/ … | full; recap |
| tv_van_this_is · /e/ | the tortoise reaches the gold part | < ai > glows | This is… /e/ | slides on: /d/ | every time |
| tv_fs_rabbit_read · [said] | the tortoise reaches the end | the rabbit wakes | (as TEACHER_SCRIPT §9) · said | taps the rabbit | every time |
| tv_van_vanish | straight after | the ninja throws the smoke ball; puff; the scroll rolls up | Now watch my ninja make it vanish. | — | full; then the puff alone |
| tv_van_build | straight after | the lines and the tiles | Now you build it, and say the sounds as you go. | builds | full; recap |
| tv_van_check | the last tile | the scroll unrolls; the built word flies up under it; each matching tile chimes | Let's check it with the scroll. | — | first two per session |
| tv_van_match · [said] | all match | the word sparkles | You built it just right. · said | — | every time |
| same_sound_spelling (existing) | ↳ a rival tile in the surprise slot | that tile glows; the scroll's gold part glows | Yes, that's a spelling of that sound too! But in this word, we spell it like this... | swaps it | every time |
| tv_van_listen_here | ↳ a wrong sound elsewhere | the slot glows | Let's listen to that part again. | — | every time |

Run to the child's first action (the slide): about 9.5 s. The whole word takes about 25 s. A special word is played once a day in the scroll, and it counts towards its rung like any word (§3.0.3).

**The same game on the adventure path.** Year 1 and Year 2 stones use Ninja Vanish for the common exception words whose code comes late (SW §6's chart), one or two a week, as Sounds~Write advises. When a special word's surprise spelling is later taught in its unit (*said* in EC7), Sensei says so once: "You know the word said. Now you know its spelling too. It's one of the ways to spell… /e/" The word leaves the special words and becomes an ordinary word.

#### 1.9.6 What the list changes in the rest of the game

- **The planner** pins the list's words for the week (planner §3, `pinned`). They count as current-unit words: read before they are spelt, first with a peek, never blind dictation before day 3.
- **The learner model** gets their evidence like any other word's, tagged `source: "school-list"`, so the grown-ups' page can show "School list, week of 29 September: 7 of 8 right in the practice test".
- **The World Flower** charges the gems the list uses. A gem first met in a list shows a small school badge.
- **The boss and the lags** don't change: a list word can appear in a boss only after its week, as review.

#### 1.9.7 Words the game doesn't know yet

The game can play a word only if it has its segmentation (`segs`), its recording and, for picture games, its picture. About 1,100 words have segmentations and recordings today (933 unit words and 180 long words; audit §0.9), and Year 1–2 lists will often go beyond them.

- **v1 (Decision):** a word the game can't play yet is shown to the grown-up as "coming by tomorrow" and logged (the word only) to the Worker. A nightly job segments it with the aligner over the 174 official pairs (SOUNDS_WRITE_MODEL §6.4), records it in Sensei's voice with the existing audio pipeline, runs the validator and the accent gate, and adds it to the served word bank. The list is complete the next day. Words that fail (names, US spellings, rude words) stay out, and the grown-up is told which.
- **Later:** a grown-up can record a word in their own voice (Squeebles's best feature, prior-art §2.6), and pictures for list words that are pictureable.

#### 1.9.8 Hooks to build now

So that the list is a small build later, the first Year 1 slice should already:
- parse `?list=` in `main.tsx` into a **pending list** in `sessionStorage`, and show the grown-ups' confirmation (a stub that stores it is enough);
- add `weekList?: { words: string[]; special: string[]; week: string; test: Day; added: string }` to the save, per profile;
- add the level kinds `"weekly"` and `"vanish"` to `LevelKind`, and a `special?: true` flag on word items (it exists on `DictationItem.words` in sw.ts);
- give the planner a `pinned` source other than authored episodes (`source: "school-list"`);
- make the map's glowing-stone slot able to hold something other than the next level (the scroll, the catch-up door and the lair all need it: MAP_DESIGN §5.2's slot, with a `kind`);
- tag evidence with `source`.

---

## 2. Bosses that make sense

### 2.1 The panda, and what a boss is for

The Sumo Panda is the boss of the first eight sounds: a, i, m, s, t, n, o and p. For a four-year-old in their first half-term of Reception, spelling *mat*, *pin* and *top* one after another is the hardest thing they have ever done with letters. So it is a proper first boss, not the boss of lame sounds. Jonas's instinct is still right about the rest, though. Today every boss is the same battle with more words, no boss tests its land's idea, and the last boss is the second-easiest to spell (audit §6–7).

**What a boss is for, in this design:**
1. **A guardian.** Each boss guards the petals and gems of its land's hardest new code, locked in its chest. That is the story reason for the fight.
2. **A test of the land's own idea.** Each boss has a **signature move** built from that idea, and the child's counter to it is exactly the skill the land taught. The Knight splits two-letter spellings apart; the Magpie snatches vowel gems; the Giant's steps are syllables.
3. **A Sounds~Write progress check.** Reading, spelling and, from the Sky Isles, a dictated sentence, with the official lags (§2.3). So the boss is what tells a parent "she's where school expects".
4. **A climb.** Because the checks follow the programme, the bosses get harder by themselves: three-sound words (panda), spelling choices (Magpie), rare spellings (Gnome King), four-syllable words (Giant), the whole chart (the Baron), special endings (the Library's wyrms).

### 2.2 The story: guardians, chests and the Baron's retreat

**The film's promise** is "Win back every petal, one sound at a time!" The design keeps it and stretches it over three years of school:

| Map | What the Baron did | Who guards what | How the map ends |
|---|---|---|---|
| **Island of Sounds** | blew the petals across the island | his monsters, one guardian per land, each with a chest of that land's petals | the Bridge Troll falls; every island petal is home. The Baron runs up the Rainbow Bridge: "You'll never reach my Sky Isles!" |
| **Sky Isles** | carried the vowel petals up into the sky, where they are hardest to reach | five sky guardians (the Magpie, the Thunderbird, the Hoot Owl, the Circus Lion, the Scarecrow), and the Baron himself at Star Dunes | the Baron is beaten for the first time, and **nearly every petal is on the World Flower** (the last few, such as /eer/ and /zh/, are in the Muddle Isles). But many of its gems are dim: he escapes in his balloon with the rarest gems. "My Muddle Isles are full of spellings you've never seen!" |
| **Muddle Isles** | hid the rarest gems (the "more spellings") on his own islands | his lieutenants (Captain Parrot, the Gnome King, the Giant, the Ghost Captain, the Roaring Boar) | **the final battle** at Muddle Castle. The flower is complete: every petal and every common gem. The Baron says sorry (§2.5.3) |
| **The Library** | – | the book wyrms, long dragons made of syllables that live in the Library's oldest books | no end: the wings renew. The **golden bloom** (the last, rarest gems: < ti ci si ssi >, < t > in -ture, schwa's spellings) is the long goal |

**The finale plays once.** It moves from the Sky Temple to the end of Year 2 (`isFinale` becomes "the final battle, the first time it is won"). A replayed boss is a plain fight with a friendly sparring line, and the land's welcome never says a beaten villain is "hiding up here somewhere". The story's lines are keyed to the story state, not the land (audit §2.4 and §11.1 E).

**The Baron's reveal** gives the Library its reason. After the final battle: "I never could read the long words. They muddled me. So I muddled everyone else." The child has just read *mechanic* and *character* in front of him. Then: "Will you help me read them?" He becomes the Library's keeper and turns up there as a friend, stuck on a long word, asking the child's help. That is the endgame's premise. It also answers the film's "Words, words, WORDS! How I HATE them!" with a reason a child understands.

### 2.3 What every boss is: a check with a signature phase

**The shape.** A boss is a short run of phases. The monster's health bar is split into one segment per phase, and the monster changes pose (and sometimes form) between phases. The phases, in order:

| Phase | What the child does | Sounds~Write rule it follows | Where |
|---|---|---|---|
| **1. Read** | reads the boss's words: who read it right (Kai and Suki), a picture choice, or Sound Detective for a spelling-unit word | word reading, at least one unit behind | every boss |
| **2. Spell** | spells the boss's words from the bank, with rival spellings from the Rainbow Bridge on | word dictation, at least two units behind; rivals only for spellings taught four or more units back (the Extended Code quizzing lag) | every boss |
| **3. The signature** | counters the boss's own move (§2.4) | the land's idea | every boss |
| **4. The big attack** | one or two long words in the Syllable Train; "the longer the word, the bigger the kick" | the check's dictated long words, 4–7 units behind | from the Magpie (Sky Temple) on |
| **5. The last word** | a dictated sentence in the Dictation Scroll | one dictated sentence, at least two units behind | from the Magpie on |

**How long.** Reception bosses 7–9 items (about 3 minutes), Year 1 bosses 10–12 (about 4 minutes), Year 2 bosses 12–14 (about 5 minutes), and the final battle about 16 (6 minutes, with a save point between phases). The official check reads 20 words and dictates several. The boss takes a sample of it, and the land's last two stones (the Dictation Scroll and the story) supply the rest of the evidence.

**Scoring, the Sounds~Write way.** Only an independent first try counts. A word read right only after a correction counts as an error for the record, although the child is still taught it (Teaching Through Errors, then they finish the word). A spelling counts only if the whole word is right. The land is **passed** at 75% or more of first tries, Sounds~Write's move-on rule.

**Stakes without a losing screen.**
- The bar always empties. Every word gets finished, with Sensei's help if needed, so the child always beats the boss.
- **What the check decides is which gems come home.** When the chest opens, each gem whose words the child got right first try (in the boss, or proven earlier in the land) flies home. Each gem that needed help is grabbed by a **petal imp** (the existing `petal_imp` monster, now the Baron's gem thief everywhere). It says "Ha! You missed this one!" and flies off to a **lair** on the land map (§2.6).
- The **belt stripe** for the land (§5.1) is earned with the pass mark. Below it, the stripe waits for the lair.
- This follows Sounds~Write's pace: the class moves on regardless (the next land opens), and the gaps get "keep-up" support (the lair, and the catch-up doors).

**Rematches.** A beaten boss's portrait on the overworld map can be tapped for a **rematch** at a harder rung: no peeks, the full bank and the land's longest words. Winning puts a small gold crown on the portrait. It never replays the story.

**The boss's lines** follow a fixed set, so each new boss is a small writing job:

| Moment | Line kind | Example (the Magpie) |
|---|---|---|
| the land's welcome (once per land) | the boss's taunt, `<boss>_taunt` | "Shiny, shiny gems! They're all mine now!" |
| the fight starts | `<boss>_start` | "You want my gems? Come and get them!" |
| each new phase | `<boss>_phase_<n>` | "Grr! Then I'll snatch them right out of the words!" |
| the big attack | `<boss>_big` | "That word is far too long for you!" |
| beaten | `<boss>_beaten` | "My lovely gems! Oh, all right, take them." |
| a rematch | `<boss>_rematch` | "Back for another go? I've been practising!" |

### 2.4 The bosses

"Signature" is the boss's move, then the child's counter. "Big attack" is the long word of phase 4. New art is needed for every boss not on the Island.

| Map | Land (check) | Boss | Guards | Signature move → the child's counter | Big attack |
|---|---|---|---|---|---|
| Island | Bamboo Village (none) | **Sumo Panda** | the first eight sounds | **Squash:** the panda squashes a word into a blob → the child pulls its sounds apart onto the lines (segmenting), then reads two of its squashed words (who read it right) | the finishing zap: a three-sound word, pushed together with the rabbit |
| Island | Blossom Hills (2) | **Oni** | the next eight | **Mirror trick:** it flips look-alike tiles on the bank (b d p) → the child listens past them and picks the tile for the sound | – |
| Island | Misty Mountains (5) | **Yeti** | double consonants (< ff ll ss zz >), < x > | **Freeze:** each frozen word ends in a double spelling → "two letters, one sound": the child breaks the ice with the double tile | – |
| Island | Dragon River (8) | **River Serpent** | sounds side by side (clusters) | **Gobble:** it swallows a sound from a cluster (*strap* → *sap*) → the child puts it back (Sound Swap's insert); alien words from IC9 | a five-sound word (*stamp*) |
| Island | Shadow Castle (9) | **Shadow Knight** | two letters, one sound | **Shield split:** it splits < sh > into < s > and < h > on the bank → the child uses the two-letter tile | – |
| Island | **Rainbow Bridge** (11) | **the Bridge Troll** (new) | the same sound spelt in different ways | **Toll:** every word pays a toll in the right gem: < c k ck >, < ch tch >, < w wh >, < v ve > → the child chooses by where the sound is (*duck*, *catch*) | – |
| Sky | Sky Temple (3) | **the Magpie** | the first gems of /ae/ /ee/ /oe/ | **Gem Grab:** it snatches the vowel gem out of a word on its sign (r _ n) → the child picks which gem goes back (< ai ay a ea >). **Wrong reading:** it reads *great* as "greet" → "Try it a different way" (Sound Detective) | *sun·set* (the first long word the child ever builds in a boss) |
| Sky | Cloud Town (6) | **the Thunderbird** | /er/ and /ow/ | **Rumble:** thunder shakes four /er/ gems onto the bank (< er ir ur or >) → the child chooses for *bird, her, turn, word*. **Cow or snow?** It reads < ow > the wrong way → Sound Detective | *den·tist*, *in·sect* |
| Sky | Moon Marsh (9) | **the Hoot Owl** | /oo/, /ie/, /oo/ as in book | **Who-who:** it hoots < oo > words the wrong way (*book* as "booook") → Sound Detective. **Night flight:** /ie/ gems in the dark (< igh y ie i >) → choice | *fan·tas·tic* (three syllables) |
| Sky | Circus Island (12) | **the Circus Lion** | /s/, /l/, /u/ | **Juggle:** it juggles /s/ gems (< c ce s ss st se >) → the child catches the right one. **Tightrope:** /l/ at the end of two-syllable words (*ta·ble, ca·mel, pen·cil*) | *ca·mel*, *pen·cil* (their /l/ spellings exist only in long words) |
| Sky | Autumn Orchard (15) | **the Scarecrow** | /or/, /air/, /ue/ | **Crow swarm:** its crows carry seven /or/ gems (< or aw au a ar al oor >) → the child picks the one for *saw, sauce, walk, door*. **Blew or new?** (< ew >) → Sound Detective | *win·dow*, *ye·llow* (syllable level) |
| Sky | Star Dunes (18) | **Baron Muddle, first round** | the end of Year 1 | **The first muddled note:** one misspelt word to fix (§3.6). **Alien pets:** his aliens' names are alien words (the Phonics Screening Check's kind) → who read it right | *le·vel*, *re·port*, *night·mare* |
| Muddle | Echo Island (22) | **Captain Parrot** | more /ae/ and /ee/, /d/, /i/, < y > | **Parrot talk:** it squawks the child's word back with a swapped gem → the child fixes it. **Yes, gym, my or happy?** (< y >) → Sound Detective | *air·line*, *stair·case* |
| Muddle | Gnome Hollow (25) | **the Gnome King** | more /oe/, /n/, more /er/ | **Hide and seek:** it hides the start of a word (_ nee) → the child chooses < n kn gn > (*knee, gnome, nose*). **Weak endings:** /er/ as < ar our re > in *do·llar, fa·vour, li·tre* | *ho·li·day* |
| Muddle | Giant's Gorge (29) | **the Giant** | /v/, more /oo/, /j/, /g/, < g > | **Giant steps:** each footstep is a syllable → the child builds each step. **Gem or gum?** (< g >) → Sound Detective. /j/ choice (< j g ge dge >) | *mul·ti·ply* (the spelling voice for schwa) |
| Muddle | Dolphin Bay (31) | **the Ghost Captain** | /f/, < gh >, /m/ | **Now you see it:** ghostly spellings fade in and out (< gh > in *ghost* and *laugh*) → Sound Detective. /f/ choice (< f ff ph gh >); /m/ as < mb mn > (*thumb, autumn*) | *gi·ant*, *ma·gic* (< g > as /j/, five units back) |
| Muddle | Roaring Peaks (34) | **the Roaring Boar** | more /or/, /h/, /k/ | **Roar:** it blows five more /or/ gems (< oar ore our augh ough >) → choice for *board, more, four, caught, thought*. /k/ as < ch > (*school, echo*) | ***sta·tion*: the first special ending** (§3.3) |
| Muddle | Muddle Castle (38) | **Baron Muddle, the final battle** | the whole chart | five phases: his muddled letter; every petal; two ways; long words; the last word (§2.5.3) | *me·cha·nic*, *cha·rac·ter*; the maths words (*a·ddi·tion, mul·ti·pli·ca·tion*) as optional encores |
| Library | the Shun Wing | **the Shun Wyrm** | -tion, -ssion | **Hidden head:** its head is the ending, hidden → the child chooses the ending from the root's clue (§3.3) | *in·for·ma·tion*, *mul·ti·pli·ca·tion* |
| Library | the Magic Wing | **the Cian Wyrm** | -cian | the root card (*magic*) grows the ending | *ma·gi·cian*, *op·ti·cian*, *e·lec·tri·cian* |
| Library | the Treasure Wing | **the Treasure Wyrm** | /zh/ (< si s >), -ture, -sure | /zh/ and /ch/ in endings | *te·le·vi·sion*, *di·vi·sion*, *ad·ven·ture* |
| Library | the Everything Wing | **the Great Bookwyrm** | every long word the child has met | a dictated sentence of long words | "The magician did a division trick." |

**Why these creatures.** Each belongs to its land and, where possible, carries its sound: the Thunderbird's *bird* is < ir >; the Hoot Owl's *hoot* is < oo >; the Scarecrow's *scare* is < are > and *crow* is < ow >; the Gnome King's *gnome* is < gn >; the Giant's *giant* is < g > as /j/; the Roaring Boar's *roar* and *boar* are < oar >. Sensei may point this out after the fight, never before it.

### 2.5 Three bosses in detail

#### 2.5.1 The Sumo Panda: a proper first boss

It is still seven words and about three minutes, but it now has phases and a chest.
- **Phase 1, Squash (4 words: *mat, sit, pin, top*).** The panda slams its belly; the word card squashes into a round blob that wobbles. Sensei: "The panda squashed the word! Can you pull its sounds apart?" The child builds it on the lines; each tile pops the blob a little, and the word springs back into shape.
- **Phase 2, Read (2 items).** The panda holds up a squashed word and Kai and Suki each read it: who read it right?
- **Phase 3, the big squash (1 word).** A three-sound word, and the finishing zap is the rabbit read-back (TEACHER_SCRIPT §9).
- **The chest.** It opens on the Bamboo petals, eight of them, the flower's first. That is the biggest reward moment of Reception's first half-term, so the panda is remembered as the boss that gave back the first sounds.

#### 2.5.2 The Magpie: Year 1's first boss

The Magpie guards the first gems of /ae/ /ee/ /oe/, in a nest on the Sky Temple's roof. About 4 minutes; check 3.

| Phase | Items | What happens |
|---|---|---|
| 1. Read | 3 | the Magpie holds up shiny word cards; who read it right (*boat, feet, play*) |
| 2. Spell | 3 | dictation of Initial Code and Bridging words with rival tiles (*duck*: < c k ck >; *catch*: < ch tch >), and one EC1 word with its peek (*rain*: seen, vanished, then < ai ay a > on the bank) |
| 3. Gem Grab | 3 | a word hangs on the Magpie's sign with its vowel gem snatched (*r _ n*, *s _*, *b _ t*); the child hears the word and picks the gem to put back. Then the **wrong reading**: the Magpie reads *great* as "greet"; the child taps the /ae/ petal and hears "great" (Sound Detective) |
| 4. Big attack | 1 | ***sun·set*** in the Syllable Train: the ninja slices the word, the child builds *sun* and *set*, the carriages couple, and the ninja's kick knocks the Magpie off its perch |
| 5. The last word | 1 sentence | "I can see the rain." (code at least two units back; *I* and *the* on the board) |

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| mag_taunt | the land's welcome | the Magpie lands on the temple roof, a gem in its beak | Shiny, shiny gems! They're all mine now! | — | once per land |
| mag_start | the fight | the nest glitters | You want my gems? Come and get them! | — | every time |
| tv_boss_phases | the bar appears, the first boss of the Sky Isles | the bar shows five segments, each lit in turn | This boss has five parts. Each part knocks off a piece of its bar. | — | once per save |
| mag_phase_3 | phase 3 | the Magpie snatches the gem out of the sign's word | Grr! Then I'll snatch them right out of the words! | — | every time |
| tv_gem_grab | the first Gem Grab | the empty slot glows; the /ae/ petal fans out its gems | The magpie took a gem. Listen to the word, and put the right gem back. | picks a gem | first two per save |
| mag_big | phase 4 | the Magpie puffs up | That word is far too long for you! | — | every time |
| mag_beaten | the bar empties | the nest tips; the chest falls | My lovely gems! Oh, all right, take them. | — | every time |
| tv_imp_grab | a gem that needed help | the petal imp darts in, grabs it and flies to the land map | Oh! The imp took a gem. Don't worry, we'll get it back. | — | every time a gem is grabbed |

#### 2.5.3 Baron Muddle: the final battle

Muddle Castle, the end of Year 2 (check 38). About six minutes, with a save point at each phase (if the child leaves, the fight resumes at the phase they reached). The Baron's lines are in the voice he has now (`baron_*`, recorded with his own voice).

| Phase | Items | What happens |
|---|---|---|
| 1. The muddled letter | 3 fixes | the Baron's letter to the island, four short sentences, three words muddled with the right sound and the wrong spelling (only words the child spells securely, §3.6). The child reads it with the slider, finds each muddled word and fixes its gem |
| 2. Every petal | 4 | Gem Choice across the year: one word per vowel family, each with two or three rivals on the bank (*eight, chief, though, earth*) |
| 3. Two ways | 3 | a Sound Detective speed round across the spelling units (< ea >, < ow >, < g >, < gh >) |
| 4. Long words | 2 | *me·cha·nic*, *cha·rac·ter* at syllable level. Encore, if the child is on a streak: *mul·ti·pli·ca·tion*, "the Baron's longest word" |
| 5. The last word | 1 sentence | "The World Flower is back in bloom." At the full stop, the ninja's final kick; the flower blooms complete |

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| baron_final_start | the fight | the castle hall; the Baron on his throne of muddled letters | So you found my castle. My rarest spellings are all in here. Mwa-ha-ha! | — | every time |
| baron_final_letter | phase 1 | the letter unrolls | Read my letter, little ninja. I wrote it myself! | reads it; taps a word | every time |
| baron_final_long | phase 4 | the Baron grows | These words are so long, nobody can read them! | — | every time |
| baron_final_beaten | the bar empties | the throne of letters collapses into neat words | No! My muddles! They're all unmuddled! | — | every time |
| baron_sorry_1 | the finale, first win only | the World Flower blooms; the Baron sits on a step, small | I'm sorry. I never could read the long words. They muddled me. | — | once per save |
| baron_sorry_2 | straight after | he looks up at the child | So I muddled everyone else. But you read them all. | — | once per save |
| baron_help | straight after | a key glows in his hand; the Library's doors on the Atlas | Will you help me read them? I know a place full of long words. | taps ▶ | once per save |

#### 2.5.4 The Library's wyrms (in brief)

A wyrm is a long dragon that comes out of a book. Its body has one segment per syllable of its word, and its head is the word's **ending**, drawn closed. The child builds each syllable in the Syllable Train, and each built syllable knocks off a segment, starting from the tail. The head opens only when the child chooses the ending: for *magician*, the root card *magic* appears beside it, and the child chooses < cian > from < tion sion cian > (§3.3). When the last segment falls, the wyrm curls up into its book and becomes a card in the child's word scroll (§5.2).

### 2.6 After the boss: the chest, the lair and the journey

1. **The chest.** The chest opens and the earned petals and gems fly to the World Flower (today's trip). Grabbed gems go with the petal imp.
2. **The lair.** A lair stone appears on the land map, two stones later: the imp's nest, holding the gems. It becomes the glowing stone after one more stone, so practice comes before the rematch. It is a **Gem Chase**, a two-minute battle on exactly those spellings, with the imp as the monster. The gems come home when they are spelt right first try.
3. **The belt stripe** (§5.1) is added on the reward screen.
4. **The journey.** The overworld map opens, and the ninja walks, sails or flies to the next land, whose welcome (and new guardian's taunt) plays on arrival. At a map's end, the Atlas and the map's journey scene play instead (§1.8).
5. **The finale** plays only after the final battle, and only the first time.

---

## 3. New mechanics for Years 1 and 2

Each mechanic has its Sounds~Write basis, where it lives, its screen at 844 × 390, and a script sketch in TEACHER_SCRIPT's form (frame, Sensei's slow demo, the Ready tap, the hand-over). The screen sizes are in stage px (1280 × 720). On an 844 × 390 phone the stage is drawn at 0.54 (390 ÷ 720), so 96 stage px is 52 CSS px, and nothing a child taps is under 81 stage px (44 CSS px).

### 3.0 Three shared parts

#### 3.0.1 The carriage row: one layout for syllables and sentences

A long word is a train of **syllable carriages**, and a dictated sentence is a train of **word carriages**. They use one component, with three rows:

| Row | Stage y | What it holds | Sizes |
|---|---|---|---|
| **A. The train** | 96–196 | an engine on the left (the word's picture, 110 × 100, or a sparkle when there is no picture), then every carriage in compact form, joined by 16 px couplings | a compact carriage is 28 + 40 px per sound wide (at least 68) and 100 tall. Its sounds show as small dots until built, then as small letters |
| **B. The active carriage** | 230–410 | the carriage being built, enlarged, with one line per sound | slots of 104 px (up to 4 sounds), 92 (5) or 80 (6), as battles use today |
| **C. The bank** | 520–630 | only the active carriage's tiles, plus any rivals | at most 7 tiles of 96 px: 744 px, inside the 748 px between the ninja and Help (`rowFit()`) |

**It fits the longest words we will use.** The widths below are the train's, engine included:

| Word | Syllables (sounds) | Train width | Fits the 980 px between x 150 and 1130? |
|---|---|---|---|
| *sunset* | sun (3) · set (3) | 110 + 148 + 148 + 2 × 16 = 438 | yes |
| *multiplication* | mul (3) · ti (2) · pli (3) · ca (2) · tion (3) | 110 + 148 + 108 + 148 + 108 + 148 + 80 = 850 | yes |
| *electrician* | e (1) · lec (3) · tri (3) · cian (3) | 110 + 68 + 148 + 148 + 148 + 64 = 686 | yes |
| *autobiographical* (the longest word in our files, a Year 5–6 word) | au · to · bi · o · gra · phi · cal | 978 | just |
| *The World Flower is back in bloom.* (a 7-word sentence; word carriages use 32 px a sound) | 2 · 4 · 4 · 2 · 3 · 2 · 4 sounds | 868 + 6 × 16 = 964, with no engine | yes |

Today's single row of slots can't do this: *multiplication* is 1,184 px of slots in a 660 px box, and its tiles run under Help (audit §4.2). With carriages, no row ever holds more than one syllable's tiles.

**What moves.** A carriage being built slides down from row A into row B and grows. When it is done, it shrinks back up into its place in the train, carrying its letters. When every carriage is built, rows B and C fade, and the train grows to 1.3× in the middle of the stage for the reading. Transform and opacity only (PERF.md).

#### 3.0.2 The read slider for long words and sentences

The read slider (`src/ui/ReadSlider.tsx`; its spec, docs/READ_SLIDER.md, is being written from docs/read-slider/research.md) puts the tortoise at the start of a rail under the pictures, and the child slides it left to right. Each part is said as the tortoise reaches it (the slow way), and then the rabbit at the end says the whole (the fast way). For long words and sentences it keeps the same gesture and the same two animals, with one new idea: **the tortoise speaks in the spelling voice and the rabbit in the talking voice.** That is Sounds~Write's own pair: "in our talking voice we say 'multiply', but in our spelling voice we say mul-ti-ply" (SW §3.4).

| Level | The tortoise (slow) | The rabbit (fast) | Sounds~Write |
|---|---|---|---|
| **sounds in a syllable** (sound level) | each sound as it reaches it; at each syllable line it stops, and the syllable is said ("sun") | the whole word | Lesson 12: "say the sounds, read up to the line, and say the syllable" |
| **syllables** (syllable level) | each syllable, in the spelling voice: "mul · ti · ply" | "multiply" | Lesson 14, and the spelling voice |
| **words** (a sentence) | each word, as the tortoise passes under it | the sentence, read smoothly | reading back a dictation |

- **The syllable stop.** At a syllable line, the tortoise waits for the syllable's clip to end, with the elastic ratchet the slider already has (clips never overlap). A line between carriages is a small gold notch in the rail.
- **Backwards never reads**, as now.
- **New clips:** each long word's syllables in the spelling voice (`public/a/y/<word>.mp3`, with each syllable's onset in a `SYLL_TIMES` table, like `SLOW_TIMES`), and each dictation sentence read smoothly. The talking-voice word exists for the 180 long words we have.
- **The idea, said.** The fast-and-slow lines (TEACHER_SCRIPT §9) get two long-word forms: `tv_fs_long_slow` "The slow way to say a long word is its syllables." and `tv_fs_long_fast` "The fast way is the whole word, all together."

#### 3.0.3 The support ladder: a rung for every word

Spelling choice is mostly word knowledge (prior-art §4), so every word the learner model tracks has a **rung**, the way Spelling Shed has levels and Pokémon Typing fades its letters (prior-art Idea 5). Every spelling game reads it.

| Rung | The child gets | Moves up after | Used by |
|---|---|---|---|
| **R0** | Sensei builds it (the I do) | being shown once | the first meeting |
| **R1** | the word's own tiles, jumbled, with the word **shown** while they build | one first-try success | the first meeting's we do only |
| **R2** | the word's own tiles, with a **peek**: the word is shown and read, then vanishes, then built | a first-try success on a later day | current-unit words (Sounds~Write's Lesson 7: read, then write) |
| **R3** | own tiles plus **rival spellings** of its sounds, rimmed in their petal's colour ("which /ae/ gem?") | a first-try success on a later day | words four or more units back; the weekly list from day 3 |
| **R4** | the **full bank**: every spelling the child knows for those sounds, no colour rims (dictation) | first-try successes on two days | bosses' spell phase, practice tests |
| **R5** | secure: recalled at spaced intervals (1, 3, 7, 14 days) | – | review |

- A miss drops the word one rung for its next appearance. A word moves up at most once a day, and only the day's first attempt counts (Brain Age's rule, prior-art §2.11).
- Help never pays: a word finished with help earns no rung, stars or gems (PEDAGOGY.md's rule).
- The grown-ups' page shows it in plain words: "*great*: spelt from memory on 3 days."

### 3.1 The Syllable Train (Lessons 11–14)

This is the brief's "Syllable Slice" and "long-word build" in one game: the slice is the ninja's move that opens every long word, and the train is where it is built.

**Sounds~Write basis.** The polysyllabic strand starts "at around the second week of Unit 4 /oe/" in Year 1, with Lessons 11–12 (the teacher splits, the child builds and reads at sound level), then 13–14 (the child splits and works at syllable level), falling back to 11–12 whenever needed ("not linear"). Split by listening, start a syllable with a consonant where possible, never cut a spelling in two (SW §3.1–3.3).

**Where.** The first stone is in the Sky Temple, straight after the /oe/ dojo (EC4's second week). Then one or two stones in every land, and the big attack of every boss from the Magpie on. Its words follow the official order (SW §3.1): Initial Code compounds (*sunset, zigzag*), harder Initial Code (*dentist, insect*), three syllables and weak syllables (*fantastic, lemon*), then Extended Code spellings 4–7 units back (*painting, window*), then four and five syllables and endings.

**Two levels, as in Sounds~Write.**

| | Sound level (Lessons 11–12) | Syllable level (Lessons 13–14) |
|---|---|---|
| Who splits | Sensei says how many syllables, and the ninja slices the long carriage into them | the child slices: they swipe across the long carriage once per extra syllable, then tap ✓ |
| Before each carriage | Sensei says the syllable ("The first syllable is… sun") | nothing; Help's first press plays the syllable |
| Building | tile by tile, saying the sounds; the per-sound help ladder | tile by tile, saying the syllable; rivals on the bank from the word's rung |
| Reading (12, 14) | the word arrives written with its lines in; the tortoise reads sounds and stops at each line | the tortoise reads syllables |
| When | from the Sky Temple | from Autumn Orchard, for a child whose last 10 sound-level words were at least 80% first try; back to sound level after two misses in a word |

**The play, at sound level.**
1. The train pulls in with one long empty carriage behind the engine (the word's picture).
2. Sensei says the word and how many syllables it has. The ninja leaps and slices the carriage into that many, each with its lines.
3. For each carriage: Sensei says the syllable; it drops into row B; its tiles drop into the bank; the child builds it, saying the sounds; the tortoise reads it ("/s/ /u/ /n/ … sun").
4. When all are built: the train grows; the child slides the tortoise under every carriage (the syllables, in the spelling voice), then taps the rabbit ("sunset").
5. **The gap closes.** The couplings pull tight, the carriages click into one, and the word is one word. That is Sounds~Write's "write the word without the gap between the syllables". The ninja's big kick, if it is a battle.

**Sounds~Write's corrections, in the game** (TTE for Lessons 11–14, SW §3.7):

| The child | What happens | Line |
|---|---|---|
| a wrong-sound tile in a carriage | the tile says its sound; the slot glows | `tv_syl_listen_again` "Let's listen to that syllable again… [sun]" |
| a rival spelling (right sound) | the tile glows; the right gem glows | `same_sound_spelling` (existing): "Yes, that's a spelling of that sound too! But in this word, we spell it like this..." |
| slices too few or too many (syllable level) | the slices glow and fade back into one carriage | `tv_syl_precisely` "Let's say it again, precisely in its syllables… [fantastic, syllables]" then the count is given, and this word goes back to sound level |
| a schwa slip (*multuply*) | the carriage with the slip glows | `tv_syl_talking` "In our talking voice we say… [multiply]" · `tv_syl_spelling` "In our spelling voice we say… [multiply, syllables]" |
| taps the rabbit before sliding | the rabbit waits; the tortoise glows | `tv_fs_stuck_slow` (existing family) |

**The screen at 844 × 390** is §3.0.1's. The slicing sword swipe needs a 150 px wide target (the whole long carriage is at least 600 px, so a swipe anywhere across it counts). The ✓ for "that's my count" sits in the right-hand column where ▶ goes (Sort's layout).

**The script: the full form** (the first Syllable Train, in the Sky Temple; the word *sunset* is the we do, *zigzag* the child's own). Run to the child's first action (building *sun*): about 11.5 s.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_syl_frame | 0 s | a little train pulls in: the engine with a sunset picture, one long empty carriage | This game is called Syllable Train. Long words are made of parts called syllables. | — | full |
| tv_syl_my_word · [sunset] | 5.4 s | the paw taps the engine | My word is… sunset | — | full |
| tv_syl_hear_<n> (two) | 7.3 s | the long carriage glows | When I say sunset, I can hear two syllables. | — | full; the count's family is two to five |
| (the slice) | 9.6 s | the ninja leaps and slices the carriage in two; lines appear in each half | (a sword whoosh) | — | every time |
| tv_syl_first_is · [sun] | 10.2 s | the first carriage drops into row B; s, u, n drop into the bank | The first syllable is… sun | — | sound level |
| tv_syl_build_say | 11.5 s | the slots glow | Can you build it? Say the sounds as you go. | builds s, u, n | full; recap |
| tv_syl_read_syl · (sounds) · [sun] | the last tile | the tortoise walks under the carriage | Now say the sounds, and read the syllable. · /s/ /u/ /n/ · sun | — | first two words per session |
| tv_syl_next_is · [set] | straight after | the second carriage drops into row B | The next syllable is… set | builds s, e, t | sound level |
| tv_syl_read_each | the last tile | the train grows; the tortoise glows at the start | Now slide the tortoise, and read each syllable. | slides: sun · set | full; recap |
| tv_syl_read_word | the tortoise reaches the end | the rabbit wakes | Now say the syllables, and read the word. | taps the rabbit: [sunset] | full; recap |
| tv_syl_no_gap | the rabbit's word | the couplings pull tight; the carriages click into one | We write it without the gap, all joined up. | — | full; then the click alone |
| tv_ready_go | straight after | ▶ and the paw | Do you want to have a go now? | taps ▶ | full |
| tv_syl_your_word · [zigzag] · tv_syl_hear_<n> | the hand-over | the engine shows a zigzag; the long carriage | Your word is… zigzag · When I say zigzag, I can hear two syllables. | watches the slice | every time |

Recap (a later day): `tv_syl_recap` "It's the Syllable Train again. We build long words, one syllable at a time." Short: `tv_syl_short` "Here's the Syllable Train." The first syllable-level word gets `tv_syl_you_slice` "This time, you slice it. Swipe once for each extra syllable, then tap the tick." (the only new symbol; explained where it appears, TEACHER_SCRIPT §2.5).

**For the bots.** `window.__snState = { scene: "train", level: "sound" | "syllable", phase: "slice" | "build" | "read" | "rabbit", carriage: n, bank: [...], answer: [...] }`, and the sweep checks that no tile, slot or carriage leaves the stage at 844 × 390 or 667 × 375 for every word in the pool.

### 3.2 Gem Choice: which spelling in this word?

**Sounds~Write basis.** Lesson 6 (one sound, different spellings, word puzzles) opens every Extended Code sound unit, and Lesson 7 has children read the unit's words and then write them. The correction for a right sound with the wrong spelling is "This is a way of spelling /er/, but in this word we need this spelling" (SW §1.3, §3.7). New spellings go into writing only slowly: accurate spelling is expected 5–7 units later, and quizzing runs at least four units behind (SW §1.2).

**Where.** It is not one level. It is how every spelling game works from the Rainbow Bridge on:
- **The dojo** (a new unit's stone): the word puzzle, fan mode, rungs R1–R2.
- **Battles and bosses:** bank mode. Rival spellings are on the bank at rung R3, and the full bank at R4 (the boss's spell phase).
- **Gem Trials:** a trial's words are drawn from the gem's **sound**, not only its spelling, so an < ai > trial has *rain, day, tail, stay, paint*, and the child chooses each time. The gem's letters no longer hang over the monster (audit §3).
- **The weekly scroll** (§1.9.4).

**Fan mode** (teaching): when the child reaches the slot for the unit's sound, its petal opens above the bank like a fan of cards, showing the gems the child has met for that sound (the chart's petal as the palette, Jonas's idea). The gems are 96 px discs in an arc across x 340–1090, y 420–520, with at most 7 (the Scarecrow's /or/). Tapping a gem drops it into the slot.

**Bank mode** (practice): no fan. The rival tiles sit in the bank with the other tiles. At R3 each tile has a thin rim in its sound's petal colour, so the three /ae/ spellings are visibly "the /ae/ gems" and the question is "which one?". At R4 the rims go, and the bank is every spelling the child knows for the word's sounds, which is dictation.

**The change to `tileBank()`.** Today a tile can only be a distractor if its sound is not one of the word's sounds (audit §5). From the Rainbow Bridge on:
- for each sound in the word, up to two rival spellings the child has met for that sound, chosen first from the child's own confusions, then by frequency;
- rivals only for spellings taught four or more units before the level (the quizzing lag), unless the word has had its peek;
- never for Lessons 1 and 5 (word building in the dojo stays the word's own tiles, Sounds~Write's rule);
- the existing `same_sound_spelling` branch moves from Dojo.tsx into Battle.tsx too.

**The script: the full form** (the Sky Temple's first Gem Choice, straight after the /ae/ dojo; *play* is Sensei's word, *rain* the child's). Run to the child's first action (sliding the tortoise under *play*): about 10.5 s.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_gc_frame | 0 s | the /ae/ petal opens: < ai > < ay > < a > < ea > as gems | This game is called Gem Choice. Some sounds have lots of spellings. | — | full |
| tv_gc_gems | 4.2 s | each gem glints in turn | Each spelling is a gem in the sound's petal. | — | full |
| tv_gc_peek · [play] | 7.0 s | the word card *play* with its picture; the tortoise at the rail's start | Here's my word… play. Slide the tortoise, and read it with me. | slides: /p/ /l/ /ae/, taps the rabbit | full |
| tv_gc_vanish | the rabbit's word | the ninja's smoke puff; the card rolls up | Now my ninja makes it vanish. | — | full; then the puff alone |
| tv_gc_ido_build | straight after | the paw builds p, l; the slot for /ae/ glows, and the fan opens | I'll build it. The last sound is… /ae/ | — | full |
| tv_gc_ido_pick | straight after | the paw picks < ay >; the card unrolls to check: it matches | I remember this gem from the word. | — | full |
| tv_ready_go | straight after | ▶ and the paw | Do you want to have a go now? | taps ▶ | full |
| tv_gc_your_word · [rain] | the hand-over | the card *rain*; the tortoise | Your word is… rain. Read it first. | slides, taps the rabbit; the puff; builds; picks < ai > | every time |
| tv_gc_right_gem | a right gem, the first two per session | the card unrolls; the gems match and sparkle | That's the gem we need in rain. | — | every time (the word is a generated family) |
| same_sound_spelling (existing) | ↳ a rival gem | the card unrolls; the rival glows beside the right one | Yes, that's a spelling of that sound too! But in this word, we spell it like this... | swaps it | every time |
| tv_gc_think | ↳ 8 s at the fan | the gems wiggle in turn | Think of the word you read. Which gem did it have? | picks | every time |
| tv_gc_peek_again | ↳ 16 s, or Help's second press | the card unrolls for 2 s | Here's the word again. Look at the gem. | picks | every time |

Recap: `tv_gc_recap` "It's Gem Choice again. We pick the right gem for each word." Short: `tv_gc_short` "Here's Gem Choice." In a battle, the first rival tiles of a save get one line as they appear: `tv_gc_battle_first` "Look, some sounds have more than one gem here. Pick the gem for this word."

### 3.3 Long words with special endings: *magician*, worked through

**Sounds~Write basis.** "Shun" is three sounds, /sh/ + schwa + /n/. < ti >, < ci >, < si > and < ssi > are spellings of /sh/ (< si > is /zh/ in *division*), and the < o > of -tion and the < a > of -cian are schwa spellings. At sound level, one tile is one sound ("ONE sound per letter tile!"). Special endings have no unit: they come through the long-word lessons, and Lesson 15 (analysing a word) links the hard spelling to other words with it. The National Curriculum's guidance adds the root word as the clue: -cian after a root ending in < c > (SW §4).

**Decision: three tiles under one gold bracket.** Prior-art Idea 4 proposed a single gold tile for "tion". That breaks "one sound per tile" at sound level. So:
- **at sound level,** the ending is three tiles, < ti > < o > < n >, under a **gold bracket** that appears over their three lines with Sensei's "This is a special ending. It's three sounds.";
- **at syllable level,** the ending is one gold chunk, *tion*, because it is a syllable;
- **on the World Flower,** < ti > < ci > < si > < ssi > are gems of the /sh/ petal (and < si > of /zh/), won in the Library: the golden bloom's gems.

**When.** *-tion* from Roaring Peaks (National Curriculum Year 2: *station, motion, fiction, section*), and the maths words (*addition, subtraction, multiplication*) in the final battle's encore and the Library's Shun Wing. *-cian*, *-sion*, *-ssion* and *-ture* in the Library (National Curriculum Years 3–4). A Year 2 child may **read** *magician* and *division* earlier (Lesson 12 at sound level, with the lines in), but spelling them comes in the Library.

**The run for *magician*** (the Magic Wing's first word, sound level; tiles m, a, g, i, ci, a, n; three carriages). About 60 s.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_syl_your_word · [magician] | 0 s | the engine: a magician pulling a rabbit from a hat; one long carriage | Your word is… magician | — | every time |
| tv_syl_hear_<n> (three) | 1.8 s | the ninja slices twice | When I say magician, I can hear three syllables. | — | sound level |
| tv_syl_first_is · [ma] | 4.4 s | carriage 1 in row B; m, a in the bank | The first syllable is… ma | builds m, a | sound level |
| tv_syl_next_is · [gi] | the last tile | carriage 2; g, i and a rival < j > | The next syllable is… gi | builds g, i (or taps < j >) | sound level |
| same_sound_spelling | ↳ < j > tapped | < j > glows, then < g > | Yes, that's a spelling of that sound too! But in this word, we spell it like this... | taps < g > | every time |
| tv_lw_last_is · [cian] | the last tile | carriage 3 drops; its three lines light; the gold bracket draws over them | The last syllable is a special ending… shun | — | first two per ending |
| tv_lw_three_sounds | straight after | the bracket glows | It's three sounds, but one ending. | — | first two per ending |
| tv_lw_this_is_sh · /sh/ | the first tile placed | < ci > glows on the first line | This is… /sh/ · It's two letters, but it's one sound. | builds ci, a, n | first meeting of < ci > |
| tv_syl_read_each · tv_syl_read_word | the last tile | the train grows; the slider | Now slide the tortoise, and read each syllable. · Now say the syllables, and read the word. | slides; taps the rabbit | as §3.1 |
| tv_lw_root_1 · [magic] | straight after the click | a small card *magic* floats above *magi*; its < c > glows | Magician has another word inside it… magic | — | the Magic Wing's first two words |
| tv_lw_root_2 | straight after | the < c > of *magic* slides down onto the < ci > of *magician* | A magician does magic. So magician keeps the spelling of magic. | — | the Magic Wing's first two words |
| tv_lw_root_3 · [music] · [musician] | a later word, *musician* | *music* above *musician* | Music… musician. Can you hear the same ending? | — | once |

**Sounds~Write's other lessons for the same word** (SW §4.5) go in later rounds: **Lesson 12** on another day with *musician* and *optician*, the lines put in; **Lesson 15** once the word reads easily (Word Detective, §3.8): "Which part might be hard to spell?" → the child taps *cian*, then < ci >, and *musician* and *optician* appear as easy words with the same spelling. A child who offers *station* hears "That's the same sound, but it's a different spelling."

**The Root Dojo and the Shun Sort** (the Library):
- **The Root Dojo** starts from a word the child knows (*magic, music, optic, electric, divide, discuss, act*) and grows it into its long word, with the ending chosen from two or three gold chunks. The root card always stays on screen, because the root *is* the clue.
- **The Shun Sort** is Sort's scene with ending chests: words fall, and the child sends each to < tion >, < cian >, < sion > or < ssion >. It starts with two chests, by ear and root. It is Lexia's suffix sort, done Sounds~Write's way: the word is read before it is sorted.

### 3.4 Sound Detective, placed on the maps

Sound Detective is designed in full in [MULTI_SOUND.md](MULTI_SOUND.md): a spelling in a gold lens, its petals below, and the child taps a petal to *try* that sound until the word is a real one ("That's not a real word. Try it a different way."). This design only places it and extends it.

**One stone per official spelling unit**, in the week after the sound unit that teaches its second sound (MULTI_SOUND §5):

| Land | Spelling units (Sound Detective stones) |
|---|---|
| Sky Temple | < ea > (EC3: *team*, *great*; /e/ joins at EC7), < o > (EC5: *hot*, *no*) |
| Cloud Town | < ow > (EC9: *cow*, *snow*) |
| Moon Marsh | < oo > (EC13: *moon*, *book*) |
| Circus Island | < ou > (EC15: *loud*, *double*, *soup*), < s > (EC17: *cats*, *his*) |
| Autumn Orchard | < ew > (EC22: *blew*, *new*) |
| Star Dunes | < a > (EC26: *cat*, *was*, *apron*, *father*); < ch > for the Phonics Screening Check (*chip*, *chef*, *school*) |
| Echo Island | < y > (EC31: *yes*, *gym*, *my*, *happy*) |
| Giant's Gorge | < g > (EC39: *gum*, *gem*) |
| Dolphin Bay | < gh > (EC41: *ghost*, *laugh*) |

It also appears as the Magpie's, the Thunderbird's, the Hoot Owl's and the Scarecrow's wrong readings, as a three-word speed round in later bosses, and as the World Flower's gate for a spelling with several sounds.

**In long words (Year 2).** Sounds~Write's Lesson 12 is where children find schwa: a syllable sounds one way on its own and another way in the word (SW §3.2). Sound Detective's lens can sit on a syllable: the child hears *le·mon* in the spelling voice, then the rabbit's "lemon", and Sensei says "In the word, this part sounds weaker. But we still spell it like this." It is a show, not a test (one per land in the Muddle Isles), because schwa is a spelling problem, not a reading problem (SW §3.4).

### 3.5 The Dictation Scroll (Lesson 4a)

**Sounds~Write basis.** Dictation is in every session, at least two units behind. Words with untaught code are "on the board". Children read back what they wrote "to confirm that what they wanted was what they got" (SW §1.7, §8). In the checks, a dictated sentence ends every Extended Code check.

**The game.** Sensei says a sentence. The scroll unrolls with one word carriage per word (§3.0.1). The child builds the words in order: each word's carriage drops into row B as Sensei says it ("The next word is… boat"), and its tiles fill the bank. Words with untaught code are written on a **little board** at the top right (180 × 110 px, below Hear it again); tapping it says the word. The capital letter at the start is given. The full stop is a ninja star the child taps at the end. Then the child slides the tortoise under the words, and the rabbit reads the whole sentence smoothly.

- **Length.** From Blossom Hills, 3–4 words (*Sam sat on a mat.*). In the Sky Isles, 4–6 words. In the Muddle Isles, 6–9 words.
- **Where.** One stone per land, the last before the boss, and the boss's last word.
- **Scoring.** One item per word, first try, each word at its rung (usually R3 or R4, since dictation is two units behind).

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_dict_frame | 0 s | a scroll unrolls with empty word carriages | This game is called Dictation Scroll. I say a sentence, and you build it, word by word. | — | full |
| tv_dict_listen · [sentence] | 4.8 s | the carriages light one by one as each word is said | Listen to my sentence… The boat is on the sea. | — | every time |
| tv_dict_first · [The] | 7.4 s | the first carriage drops into row B | The first word is… The | builds it | full; recap |
| tv_dict_next · [w] | each next word | the next carriage drops | The next word is… boat | builds | every time |
| tv_dict_board | ↳ the first board word of a save | the board glows with the word on it | This word is on the board. You can copy it from there. | builds it | once per save; then the glow |
| tv_dict_star | the last word built | a ninja star glows at the end | Now tap the star to finish it off. | taps the star (the full stop) | first two per save |
| tv_dict_read_back | straight after | the train grows; the tortoise | Now slide the tortoise, and read it back. | slides; taps the rabbit | every time |
| tv_dict_praise | the rabbit's sentence | the scroll glows | You built the whole sentence. | — | every other time |

Run to the child's first action: about 9 s.

### 3.6 The Baron's Muddled Notes (proofreading)

**Basis.** Proofreading for spelling is National Curriculum Year 2 writing (SW §7.3). Sounds~Write's version is reading back what you wrote, and its correction for a real but wrong spelling is the one Gem Choice uses. It is also Lesson 10's "read it wrongly" turned round: here the word *sounds* right but *looks* wrong.

**Why it fits the story.** The villain is called Muddle. From Star Dunes on, his muddles become misspellings: his notes, his letter in the final battle, Captain Parrot's squawks.

**A guard, because misspellings can stick.** Studies with adults and children have found that seeing a word misspelt can make you more likely to misspell it later (Brown 1988; Jacoby and Hollingshead 1990; Dixon and Kaminska 2007; cited from memory, to check before the build). So:
- only words the child already spells securely (rung R4 or R5) are muddled;
- only with a real spelling of the same sound (*trayn*, never random letters);
- at most one muddled word in a Year 1 note and two or three in a Year 2 note;
- every muddled word is fixed and read back correctly before the note leaves the screen, and the corrected note is what's said last;
- never within two weeks of the spelling being taught.

**The game.** The Baron's crow drops a note (a paper 1000 × 300 px at y 90–390, with the sentence in Andika at 64 px, each word its own tap target at least 90 px tall). The child slides the tortoise under it and hears it read. Because each misspelling has the right sounds, it *sounds* right. The child taps the words that look wrong. A tapped muddled word lifts into the fix area (y 420–640) with its wrong gem glowing and the petal's fan open; the child picks the right gem, and the word flies back healed. A word that was spelt right, when tapped, gets a gentle "That word is spelt right." At the end, the rabbit reads the fixed note.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_note_frame | 0 s | the crow drops a note with the Baron's seal | Baron Muddle wrote a note. He muddled some of the spellings. | — | full |
| tv_note_read | 4.0 s | the tortoise at the note's rail | Slide the tortoise, and read it with me. | slides | full; recap |
| tv_note_find_<n> (one, two, three) | the tortoise's end | the words wait | One word has the wrong gem. Can you find it? / Two words have the wrong gems. Can you find them? | taps a word | every time |
| tv_note_fix | a muddled word tapped | it lifts; its wrong gem glows; the fan opens | Which gem should it have? | picks | full; recap |
| tv_note_healed · [w] | the right gem | the word flies back and sparkles | That's the gem we need in… train | — | every time |
| tv_note_fine | ↳ a word spelt right tapped | the word bounces gently | That word is spelt right. Look for another one. | — | every time |
| tv_note_hint | ↳ 12 s | the muddled word's gem glints once | Look closely at each word's gems. | — | every time |
| tv_note_done | the last fix | the rabbit wakes; the note is read smoothly | Now the note is unmuddled! | — | every time |

### 3.7 Sound Twins (homophones)

**Basis.** Homophones and near-homophones are National Curriculum Year 2 spelling (*there/their/they're, see/sea, bare/bear, one/won, sun/son, to/too/two, be/bee, blue/blew, night/knight*). Sounds~Write dictates a word with a sentence, which is how a homophone is told apart. Today the game hides homophones altogether (`dictationSafe`, audit §9). This game brings them out on purpose.

**The game.** A picture or a short sentence at the top (y 90–330). Two word cards below (380 × 180 each, at x 250–630 and 650–1030). Sensei says the word and its sentence. The child taps the card that fits the meaning, and the picture comes alive (the ship sails on the sea). Then, at rung R3 or above, the child builds it.

- **Only pairs the child can decode both of,** by their units: *sea/see*, *tail/tale* and *there/their* from Echo Island (their code is Year 1's); *night/knight* and *new/knew* from Gnome Hollow, where < kn > is taught.
- **Where.** The Muddle Isles, one stone per land from Echo Island, and inside dictation whenever a homophone is dictated.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_twin_frame | 0 s | two cards, *sea* and *see*; a picture of a ship on the waves | This game is called Sound Twins. Some words sound the same, but they're spelt differently. | — | full |
| tv_twin_demo · [sea] | 5.4 s | the paw hovers over each card | Listen… sea. The ship sails on the sea. | — | full |
| tv_twin_ido | 8.6 s | the paw taps *sea*; the ship sails | I'm looking for the sea with the waves. It's this one. | — | full |
| tv_twin_other · [see] | straight after | the other card; eyes blink on it | The other one is see, with your eyes. | — | full |
| tv_ready_go | straight after | ▶ | Do you want to have a go now? | taps ▶ | full |
| tv_twin_your · [pear] · (sentence) | the hand-over | *pear* and *pair*; a bowl of fruit | Your word is… pear. I ate a juicy pear. | taps a card | every time |
| tv_twin_other_one · [w] | ↳ the other twin tapped | that card acts out its meaning (a pair of socks) | That's the other one… pair, like a pair of socks. | taps the other | every time |

### 3.8 Four smaller games

| Game | What it is | Basis | Where |
|---|---|---|---|
| **Alien Words** | Friendly aliens arrive; each has a name that is an alien word made from taught code (*vap, sheb, glimp*, generated from the child's own code). Kai and Suki read the name two ways, and the child taps who read it right. In Star Dunes, a **practice check** of 10 real and 10 alien words, scored for grown-ups the way the Phonics Screening Check is (Sounds~Write's adapted checks); the child sees only "Alien Words" | pseudo-words in the PSC; Sound Swap's nonsense words | Moon Marsh on (Year 1 spring and summer), and the Baron's alien pets |
| **Seek the Sound** | After reading a story page, "Find every /ae/ on this page": the child taps each word with the sound, whatever its spelling; each found spelling glows in the petal's colour, and the petal counts them | Lesson 9 | every Sky Isles and Muddle Isles story |
| **Word Detective** | A long word the child already reads. "Which part might be hard to spell?" The child taps the syllable, then the spelling in it; the lens shows two or three easy words with the same spelling (*happy*: *silly, funny, daddy*). Then the word vanishes and the child builds it by syllables | Lesson 15 | the Muddle Isles and the Library |
| **Speed Read, with a grown-up** | 20 words in 30 seconds, read aloud to a grown-up who taps ✓ or ✗ on each. The result goes on the grown-ups' page. It is the only timed reading game, and a grown-up starts it from their page | SpeedRead ("20 words read correctly in 30 seconds") | Year 2, optional |

**Stories get longer.** From the Sky Isles, each land has two stories of 150–400 words, decodable at one unit behind, with Seek the Sound on two pages and questions answered from the text (not a self-declared "I read it!"). That is SOUNDS_WRITE_MODEL §6.1's quota of one story per sound unit, halved for v1.

---

## 4. Content: words, pictures and audio for Years 1 and 2

### 4.1 What exists, and what is needed

Counts come from `playtest/runs/midgame/quota-gap.txt` (new, read-only: each Extended Code unit's `contentQuota()` in sw.ts against its unit file, unit by unit) and the audit's `ec-stats-all.txt` and `audio-cover.txt`. The quota is SOUNDS_WRITE_MODEL §6.2's: a sound unit needs max(30, 8 × spellings) words and max(12, 3 × spellings) pictures, 10 long words from EC4, and 8 sentences.

| | Exists | Needed for Years 1–2 | Notes |
|---|---|---|---|
| **Unit words** (one syllable) | 693 Year 1 entries, 581 Year 2, all with word audio | **at least 135 more for Year 1, 387 for Year 2** | a floor: several units count filler words that don't use their unit's spellings (EC33 lists *stand* and *train*). The biggest gaps are EC43 /or/ (23 of 96), EC36 /oo/ (13 of 64), EC34 /er/ (19 of 64), EC48 /z/, EC21 /ue/ and EC31 < y > (5 of 32) |
| **Word pictures** | 247 (Year 1 units), 254 (Year 2) | **at least 99 more for Year 1, 179 for Year 2** | one unambiguous thing, no text (validator rule 13) |
| **Long words** | 180 distinct, syllables only, **none with sounds** | about **150 for Year 1, 150 for Year 2, 80 for the Library**, all with `segs` per syllable | the files repeat filler (*lesson* in 30 unit files); curate per land (§4.2) |
| **Long-word pictures** | 4 (*rainbow*, *snowman*, *insect*, *astronaut*) | about 100 (the concrete ones: *sunset, dentist, window, magician, television*) | abstract words (*division, addition*) have no picture; they are read-and-spell words |
| **Dictation sentences** | 370, of which 131 use code taught after their `maxUnit` (audit §12) | about 190: rewrite the 131, write about 60 more; the boss's last-word sentences | each checked by the validator's `decodable` rule at two units behind |
| **Stories** | 6 (one per land, to the Sky Temple) | **24**: two per Year 1 and Year 2 land, 150–400 words each, 4–6 pictures each | one unit behind; Seek the Sound and questions (§3.8) |
| **Special words** | about 10 recorded ("This is 'the'…") | the National Curriculum's Year 1 and 2 common exception words (about 110), each tagged with its surprise part and the unit that teaches it (§4.2) | most have word audio already |
| **Sound Detective try-clips** | MULTI_SOUND §3.6's plan for < ea > | about 10 per spelling unit (11 units) | `try_<word>_<p>` |

### 4.2 The word bank, land by land

For each land: the unit words to add, the pictures, the curated long words (with the official lag), and the special words. A **special word** here is a National Curriculum common exception word whose code the land teaches: it has been a Ninja Vanish word until now (in stories, sentences and the weekly lists), and in this land it becomes an ordinary word, with Sensei's one line ("You know the word *said*. Now you know its spelling too.").

**Year 1: the Sky Isles**

| Land | Unit words to add (at least) | Pictures to add | Long words (about 20 per land, examples) | Special words that graduate here |
|---|---|---|---|---|
| Sky Temple (EC1–5) | 1 | 4 | PW1: *sunset, zigzag, cobweb, upset, comic, hotdog* | *today, great, break* (EC1; *they*'s < ey > is pointed out here and taught in EC27); *be, he, me, she, we* (EC2); *no, go, so, old, cold, told, most, both* (EC4) |
| Cloud Town (EC6–9) | 7 | 13 | PW2: *insect, dentist, desktop, eggshell, chopstick, dishcloth, sandpit* | *were* (EC6); *said, says, friend, again, any, many* (EC7); *our, house* (EC8) |
| Moon Marsh (EC10–13) | 26 | 27 | PW3: *fantastic, splendid, address, lemon, kitchen, carrot, seven* | *do, to, you, school* (EC10); *I, my, by, find, kind, child* (EC11); *put, push, pull, full, could, should, would* (EC12) |
| Circus Island (EC14–18) | 10, plus 16 two-syllable /l/ words: *camel, pencil, medal, pupil, petrol, tunnel* (EC18 has none today, SW §9.4) | 6, plus 8 for the /l/ words | PW4: *daybreak, painting, rainbow, reading, window, snowflake* | *love, come, some, one, once, money, mother* (EC14); *is, his, has* (EC17) |
| Autumn Orchard (EC19–22) | 70 | 37 | PW4–5: *window, yellow, sometimes, birthday, moonlight, teaspoon* | *your, door, floor, poor, water* (EC19); *there, where* (EC20) |
| Star Dunes (EC23–26) | 21 | 12 | PW5 (the end-of-Year-1 kind): *level, report, nightmare, airport, useful, footprint* | *are, father, half* (EC24; *ask, fast, path* only where the child's accent says /ar/); *was* (EC25) |

**Year 2: the Muddle Isles**

| Land | Unit words to add (at least) | Pictures to add | Long words (examples) | Special words that graduate here |
|---|---|---|---|---|
| Echo Island (EC27–31) | 71 | 35 | *staircase, author, water, holiday, happy, sunny* | *they* (EC27; pointed out, not taught, in the Sky Temple); *pretty, busy* (EC30); *people* (EC29, tangential) |
| Gnome Hollow (EC32–34) | 70 | 29 | *decorate, champion, dollar, favour, litre, collar* | none new (*most, only, both, old* came with EC4) |
| Giant's Gorge (EC35–39) | 95 | 39 | *radio, symbol, multiply, piano, tomato, potato* | *of* (EC35); *move, prove, improve, who* (EC36) |
| Dolphin Bay (EC40–42) | 13 | 10 | *routine, similar, kneecap, season, gentle* | *climb* (EC42) |
| Roaring Peaks (EC43–45) | 83 | 40 | *submerge, laughter, photograph, **station, motion, fiction, section, lotion, potion*** | *whole, who* (EC44); *Christmas* (EC45) |
| Muddle Castle (EC46–49) | 55 | 26 | *mechanic, character, chemistry, television, treasure*; *addition, subtraction, multiplication* | *here* (EC49) |

**Never ordinary** (always Ninja Vanish, or long-word lessons with the spelling voice, SW §6): *the, a*; *sure, sugar* (< s > as /sh/ has no unit); *hour, beautiful*; *children, every, everybody, parents, Mr, Mrs*.

**The long-word lists follow three rules** (SW §3.1–3.3, §9.4):
1. **Code 4–7 units behind** the land's own (the official checks' lag), except Units 18, 34 and 35, whose spellings only exist in long words.
2. **Sounds~Write's splits.** Start a syllable with a consonant where possible, keep a double spelling whole at the start of the next syllable (*ha·ppy, bo·ttle, ye·llow*), never cut a spelling in two. The 18 splits that differ from the official ones and the 5 that cut a spelling in two (SW §9.4: *bot|tle, rot|ten, hap|pi|ly, but|ter|fly, to|mor|row*) are fixed.
3. **No filler.** A word appears in one land's list only (*lesson* is in 30 unit files today). The land's list is what its Syllable Train stones, its boss's big attack and its challenges draw from.

### 4.3 The "shun" family, exactly as Sounds~Write codes it

Sounds are per syllable, and a spelling's sound is in brackets where it helps. ə is schwa. **Weak** marks the syllables whose vowel is weak in the talking voice; the tortoise says them in the spelling voice. The "shun" ending is < ti > (or < ci >, < si >, < ssi >) + < o > (or < a >) + < n >: /sh/ ə /n/ (SW §4.1–4.2). Whether Sounds~Write teaches a spelling-voice form of "shun" isn't public (SW §10, question 3), so **Decision:** the ending is always said as it is spoken, "shun", and the gold bracket carries the idea.

| Word | Syllables | Spellings (sounds) | Sounds | Weak | When (National Curriculum) | In the game | Picture | Audio |
|---|---|---|---|---|---|---|---|---|
| station | sta·tion | s t a(ae) \| ti(sh) o(ə) n | 6 | tion | Year 2 | Roaring Peaks: the first special ending | yes (a railway station) | new |
| motion | mo·tion | m o(oe) \| ti(sh) o(ə) n | 5 | tion | Year 2 | Roaring Peaks | – | new |
| lotion | lo·tion | l o(oe) \| ti(sh) o(ə) n | 5 | tion | Year 2 | Roaring Peaks | yes (a bottle) | new |
| potion | po·tion | p o(oe) \| ti(sh) o(ə) n | 5 | tion | Year 2 | Roaring Peaks | yes (a bubbling potion) | new |
| fiction | fic·tion | f i c(k) \| ti(sh) o(ə) n | 6 | tion | Year 2 | Roaring Peaks | – | new |
| section | sec·tion | s e c(k) \| ti(sh) o(ə) n | 6 | tion | Year 2 | Roaring Peaks | – | new |
| location | lo·ca·tion | l o(oe) \| c(k) a(ae) \| ti(sh) o(ə) n | 7 | tion | Year 2 | Muddle Castle | – | exists |
| addition | a·ddi·tion | a \| dd i \| ti(sh) o(ə) n | 6 | a, tion | Year 2 | Muddle Castle: maths encore | – | new |
| subtraction | sub·trac·tion | s u b \| t r a c(k) \| ti(sh) o(ə) n | 10 | tion | Year 2 | Muddle Castle: maths encore | – | new |
| multiplication | mul·ti·pli·ca·tion | m u l \| t i \| p l i \| c(k) a(ae) \| ti(sh) o(ə) n | 13 | ti, pli, tion | Year 2 (-tion); Years 3–4 (-ation) | the final battle's encore; the Shun Wing | – | exists |
| information | in·for·ma·tion | i n \| f or \| m a(ae) \| ti(sh) o(ə) n | 9 | for, tion | Years 3–4 | the Shun Wing | – | new |
| mission | mi·ssion | m i \| ssi(sh) o(ə) n | 5 | ssion | Years 3–4 | the Shun Wing | – | new |
| permission | per·mi·ssion | p er \| m i \| ssi(sh) o(ə) n | 7 | per, ssion | Years 3–4 | the Shun Wing | – | new |
| discussion | dis·cu·ssion | d i s \| c(k) u \| ssi(sh) o(ə) n | 8 | ssion | Years 3–4 | the Shun Wing | – | new |
| tension | ten·sion | t e n \| si(sh) o(ə) n | 6 | sion | Years 3–4 | the Shun Wing | – | new |
| magician | ma·gi·cian | m a \| g(j) i \| ci(sh) a(ə) n | 7 | ma, cian | Years 3–4 | the Magic Wing's first word | yes | new |
| optician | op·ti·cian | o p \| t i \| ci(sh) a(ə) n | 7 | cian | Years 3–4 | the Magic Wing | yes (an optician and glasses) | new |
| musician | mu·si·cian | m u(ue) \| s(z) i \| ci(sh) a(ə) n | 7 | cian | Years 3–4 | the Magic Wing | yes | exists (fix its schwa flag: *mu* is /ue/, not schwa) |
| electrician | e·lec·tri·cian | e \| l e c(k) \| t r i \| ci(sh) a(ə) n | 10 | cian | Years 3–4 | the Magic Wing | yes | new |
| division | di·vi·sion | d i \| v i \| si(zh) o(ə) n | 7 | di, sion | Years 3–4 (/zh/ as s is Year 2) | read in Muddle Castle; spelt in the Treasure Wing | – | new |
| television | te·le·vi·sion | t e \| l e \| v i \| si(zh) o(ə) n | 9 | le, sion | Year 2 example word | read in Muddle Castle; spelt in the Treasure Wing | yes | new |
| decision | de·ci·sion | d e \| c(s) i \| si(zh) o(ə) n | 7 | de, sion | Years 3–4 | the Treasure Wing | – | new |
| treasure | trea·sure | t r ea(e) \| s(zh) ure(ə) | 5 | sure | Year 2 (/zh/ as s) | Muddle Castle; the /zh/ petal's own picture is a treasure chest | yes | new |
| measure | mea·sure | m ea(e) \| s(zh) ure(ə) | 4 | sure | Years 3–4 | the Treasure Wing | – | new |
| picture | pic·ture | p i c(k) \| t(ch) ure(ə) | 5 | ture | Years 3–4; read from Year 1 | the Treasure Wing | yes | exists |
| nature | na·ture | n a(ae) \| t(ch) ure(ə) | 4 | ture | Years 3–4 | the Treasure Wing | – | new |
| adventure | ad·ven·ture | a d \| v e n \| t(ch) ure(ə) | 7 | ture | Years 3–4 | the Treasure Wing | – | new |
| special | spe·cial | s p e \| ci(sh) a(ə) l | 6 | cial | Years 5–6 (-cial) | a Ninja Vanish special word when met earlier | – | new |
| multiply | mul·ti·ply | m u l \| t i \| p l y(ie) | 8 | ti | Year 2 (official check 26) | Giant's Gorge's big attack | – | exists |

**The root clue** (§3.3, the Library): *magic → magician*, *music → musician*, *optic(s) → optician*, *electric → electrician*, *divide → division*, *decide → decision*, *discuss → discussion*, *act → action*, *add → addition*, *subtract → subtraction*, *multiply → multiplication*. With *division*, the maths words are why Year 2 parents care: they are the names of the four operations.

**What the World Flower gains.** < ti ci si ssi > as gems of the /sh/ petal; < si > and < s > of /zh/; < t > of /ch/ (the -ture words); < o >, < a > and < ure > as schwa gems. These are the golden bloom's gems (§5.3).

### 4.4 Audio, in numbers

| Kind | About how many | How |
|---|---|---|
| Unit words (talking voice) | 520 | the existing word pipeline, the accent gate, Jonas's ear on a sample |
| Slow words (pure sounds, 250 ms gaps) | 520 | `gen-slow-words.ts`, from the checked pure sounds (no new recording) |
| Long words (talking voice) | 200 new (180 exist) | the word pipeline |
| **Syllables in the spelling voice** | about 600 distinct syllables, spliced into one clip per long word with `SYLL_TIMES` onsets | a new recording kind: each syllable said on its own with its full vowel (*mul · ti · ply*); the accent gate; Jonas's ear |
| Dictation sentences (read smoothly) | 190 | the line pipeline |
| Story pages | about 150 (24 stories) | the story pipeline |
| Sound Detective try-clips | about 110 | MULTI_SOUND §3.6 |
| Sensei's new lines | about 250, plus word families (`tv_gc_right_gem`'s "…in rain", `tv_note_healed`, `tv_syl_your_word`) | the teacher-voice pipeline; whole sentences, recorded with their slots (TEACHER_SCRIPT §1) |
| The bosses' voices | 11 new bosses and the wyrms, about 6 lines each, and about 20 for the Baron | one character voice each, cast like the Baron's |

**Art.** 11 new boss sprites (the Bridge Troll, the Magpie, the Thunderbird, the Hoot Owl, the Circus Lion, the Scarecrow, Captain Parrot, the Gnome King, the Giant, the Ghost Captain, the Roaring Boar), each with idle, angry and beaten poses as the Baron has; one modular wyrm (head, segment, tail) recoloured per Library wing; two or three battle monsters per new land (about 24, with reuse); 13 land backgrounds and run backgrounds; three overworld paintings and the Atlas; the Petal Ship and the Baron's balloon; the petal imp's grab and lair poses.

### 4.5 Data changes (for whoever wires it in)

- **Long words get sounds.** `poly` entries gain per-syllable `segs` in the unit files' notation, with `|` between syllables: `{ text: "magician", syllables: "ma|gi|cian", segs: "m.a|g=j.i|ci=sh.a=schwa.n", schwa: [0, 2], ending: "cian", root: "magic" }`. `PolyItem` in sw.ts already expects `segs` per syllable.
- **`GRAPHEMES` and `parseWord`** grow to the 174 official pairs (SOUNDS_WRITE_MODEL §7), plus the special-ending spellings (< ti ci si ssi > as /sh/, < si s > as /zh/, < t > as /ch/ before < ure >) and the schwa spellings of the long words.
- **The syllable splits and schwa flags** are fixed to Sounds~Write's (SW §9.4).
- **EC18** gets its < al el il ol > words, all two-syllable.
- **`flower.ts`** drops its split spellings (< a-e > and friends, against the 2024 guidance: audit §12), gains the consonant + e gems (< te ke me … > as gems of their consonants' petals) and the special-ending gems, and recounts. The grown-ups' "46 of 46" becomes the whole programme's count (audit §10.1).
- **The served word bank** (for the weekly lists, §1.9.7) is a JSON of words with `segs`, audio and picture flags, which the nightly job appends to.

---

## 5. Keeping 6- and 7-year-olds coming back

What works for this age, from the prior art (§6): collecting things that are theirs, an avatar they change, story, small frequent completions, something to show outside the app, being good at it, and their own school words. What fails (§7): guessing through, rewards that become the game, no mastery gate, anything bought, timers and leaderboards for anxious children. The audit adds that today's rewards are flat, and "a sticker of *tray* is not a prize" for a seven-year-old.

### 5.1 Ninja belts, earned by the checks

| Belt | Earned by | Stripes |
|---|---|---|
| **White** | finishing the Garden (or starting on a school path) | – |
| **Yellow** | the Island of Sounds (the Bridge Troll's check) | one per Island boss |
| **Orange, green, blue** | the Sky Isles: two lands each | one per land |
| **Purple, brown, black** | the Muddle Isles: two lands each | one per land |
| **Black, with gold bars** | the Library: one bar per wing | – |

- **A stripe needs the land's pass mark** (75% of first tries in the boss check, §2.3). Below it, the stripe waits for the lair.
- **A school starter's earlier belts are stitched in silver**: assumed, not yet shown. The stitching turns gold when that map's ghost petals are all home. Placement is visible, and so is proof.
- **Polish, never take away.** If review of a belt's code lapses (its KCs fall due and are missed), the belt looks dusty on the child's ninja, and Sensei offers a polish round: "Your green belt needs a polish. Shall we?" It is a Sensei's Challenge on that code. A belt is never removed.
- **A printable certificate** for each belt, with real words from the ledger ("Green belt: can read *night, moon, book* and spell *light, spoon, boat*"). Children take it to school, which is Times Tables Rock Stars' best loop (prior-art §2.13).

### 5.2 The Word Scroll: long words to collect

From the Sky Isles on, long words are the collection. Stickers stay for Reception.
- Each long word the child builds becomes a **card** in their Word Scroll: a small wyrm whose body has one segment per syllable, curled round the word, with its picture if it has one.
- **Rarity is length and spelling:** two syllables are common, three uncommon, four rare, five epic, and special endings legendary. *Multiplication* is legendary.
- **Cards grow with the word's rung** (§3.0.3): an egg (met), a hatchling (built), a young wyrm (spelt from memory), a master (spelt from memory on two more days). Only first-try independent spelling grows a card: never time, never a purchase, never a guess (Squeebles keeps its word searches out of its rewards for the same reason, prior-art §2.6).
- **A card is also practice.** Tapping it starts a four-word Syllable Train with that word and three others due for review, as Sound Detective's gate does.
- The grown-ups' page counts it honestly: "Maya's scroll: 64 long words; 18 of three syllables or more; 5 masters."

### 5.3 The World Flower as the long goal

- **This year's flower.** The flower screen gets a view of the current map's petals and gems: a Year 1 child sees EC1–26's gems as the set to find, and "complete" means complete for this map. The whole flower is one tap away.
- **Full bloom** at the end of Year 2 (every petal and every common gem), **the golden bloom** in the Library (< ti ci si ssi >, < t > in -ture, schwa's spellings, and the last rare gems). The finale shows only what is true: no "full bloom" until it is.
- **Ghost petals** (§1.5) make a school starter's flower full of promise from day one, and every gem that comes home is a small event.

### 5.4 Coming back each day

- **The dojo calendar.** A stamp for each day played, a gold stamp for the day's scroll or ten minutes of play. Stamps unlock cosmetic things: dojo decorations, a new ninja outfit every ten stamps, plants in Sensei's Garden. A missed day leaves an empty square, never a broken flame (Brain Age and NumBots, prior-art §2.11, §2.13).
- **The weekly scroll** (§1.9) is the most useful daily habit for a school child, because it is their own school's words.
- **Sensei's Challenge** is the planner's daily review: 3–4 minutes of the child's due words, with rival spellings, drawn from the whole chart.
- **The combo streak** (the tiers and finishers inside a level) stays as it is. It is one of the things the audit found children like.

### 5.5 Reasons to replay

- **Boss rematches** at a harder rung, for a gold crown (§2.3).
- **Guardian challenges** for any land with ghost petals (§1.6.2).
- **New ninja moves per idea:** the carriage kick (the first Syllable Train), the gem flip (the first spelling choice), the lens throw (the first Sound Detective). They are used in every later game, so the ninja visibly grows with what the child knows.
- **The Library,** which renews: its words come from the whole word bank, the weekly lists and subject words, and its wyrms are always new.

### 5.6 What we won't do

No purchases, adverts or leaderboards. No timer the child didn't choose (only Gem Trials and the grown-up's Speed Read are timed). No reward for a word finished with help. No card, stripe or gem that can be earned by repetition alone. No long placement test: the first check is three items, and everything else is collected in play.

---

## 6. What changes in today's game, and what the planner needs

### 6.1 Today's worlds and levels

Level ids never change (saves keep stars by id), so levels keep their ids when they move between lands.

| Land today | What changes |
|---|---|
| Bamboo Village | The warm-ups (`w1-wu1`…`w1-wu6`) move to Sensei's Garden. The land starts at `w1-2`. The panda gets its phases (§2.5.1) |
| Blossom Hills | A Dictation Scroll stone (short sentences, from IC2 code). The Oni's mirror trick |
| Misty Mountains | The Yeti's freeze |
| Dragon River | Nonsense words in Sound Swap from IC9, insert and delete steps (SOUNDS_WRITE_MODEL §4). The Serpent's gobble |
| Shadow Castle | The Knight's shield split |
| **Rainbow Bridge** (new world, between Shadow Castle and the Sky Temple) | `w6-br1` and `w6-br2` (the /k/ and /ch/ sorts) move here, plus /w/ (< w wh >) and /v/ (< v ve >), which the Bridging Unit has and the game doesn't. A battle with the first rival spellings, a story, and the Bridge Troll |
| **Sky Temple** | Becomes EC1–5 in full: `w6-1` teaches < ai ay a ea > and the consonant + e tiles (< te me ke le pe >, so *cake* and *game* at last); `w6-3` < ee ea e y >; `w6-6` < o oa ow oe >. New stones: two Initial Code review stones at the start, Sound Detective < ea > (`w6-sd-ea`, MULTI_SOUND §5) and < o >, the first Syllable Train, a Dictation Scroll and a new story. `w6-ec11` and `w6-7` (< igh ie >) move to Moon Marsh, where EC11 is. `w6-11` keeps its id and becomes the Magpie's fight. "The Last Petal" (story s6) moves to Muddle Castle |
| The Baron | fights at Star Dunes (the end of Year 1) and Muddle Castle (the final battle), never as the Sky Temple's boss |
| The finale | plays once, after the final battle. **Until the Muddle Isles exist,** the last built land's boss ends honestly: the Baron escapes ("I'll be back, in my Muddle Isles!"), and the map says more lands are coming. That replaces the loop at once (audit §11.1 E) |
| Old saves | A child who finished today's Sky Temple sees its new stones appear on a land they had finished: `tv_new_stones` "Look! New stones have appeared in the Sky Temple." once, and the glowing stone points at the first of them. Stars are kept |

### 6.2 Code, by file (for the build plan)

| Where | Change |
|---|---|
| `src/content/worlds.ts` | `World.map` (`garden`, `island`, `sky`, `muddle`, `library`); the new worlds; `Level.sw` (the Sounds~Write unit), `Level.check` (the progress check), boss `phases`; new `LevelKind`s (`train`, `choice`, `detective`, `dictation`, `notes`, `twins`, `aliens`, `vanish`, `weekly`, `lair`, `catchup`); `MILESTONES` → `PACING.milestones` (EC26, EC49); `startFor()` by year and term to a land (§1.5) |
| `src/engine/learner.ts` | `tileBank()`: rival spellings from the Rainbow Bridge on, lagged and weighted by confusions (§3.2) |
| `src/scenes/Battle.tsx` | the `same_sound_spelling` branch; boss phases and the segmented bar; the petal imp's grab; `maxLen` gone for long words (they go to the Syllable Train) |
| `src/scenes/Dojo.tsx` | fan mode for a new unit's spellings |
| new scenes | the carriage component (shared by the Syllable Train and the Dictation Scroll), Ninja Vanish, Muddled Notes, Sound Twins, Sound Detective (MULTI_SOUND §8), Alien Words (a Kai and Suki variant) |
| `src/ui/ReadSlider.tsx` | syllable stops, the spelling-voice clips, sentence mode (§3.0.2) |
| `src/App.tsx` | the overworld maps and the Atlas; the glowing slot's kinds (stone, door, scroll, lair); the journeys; the school welcome; `isFinale` and `frontier()` fixed (audit §2.4) |
| `src/content/flower.ts`, `progress.ts` | ghost petals and gems, the map view, the golden bloom, split spellings gone (§4.5) |
| the save | `assumed`, `weekList`, word rungs, lairs, belts and stitching, stamps, story state |
| `src/main.tsx` | `?list=` parsed into a pending list (§1.9.8) |
| content | EC27–49 and PW1–9 imported into `unit-data.ts`; long words with `segs`; the served word bank |
| scripts | spelling-voice syllables (like `gen-slow-words.ts`); the nightly list-words job |

### 6.3 What the planner and the learner model need

The core (`src/core`, [ARCHITECTURE.md](ARCHITECTURE.md), [architecture/planner.md](architecture/planner.md)) is designed but not yet wired into the scenes. This design adds:

1. **The whole curriculum.** `unit-data.ts` imports EC27–49 and PW1–9 (it stops at EC26 today). Long words carry `segs`, `ending` and `root`.
2. **New knowledge components (KCs).**
   - `word:<w>` with its **rung** and the day's first try (§3.0.3), in the ledger;
   - `poly:<w>:split` (the syllable count and split chosen) and `mech:syllable-level` (whether this child works at Lesson 13–14 level);
   - `ending:<tion|cian|sion|ssion|ture|sure>`;
   - `schwa:<spelling>` for the weak syllables;
   - the existing `gpc:<g>><p>:read|spell` for everything else, including < ti ci si ssi >.
3. **Assumed knowledge.** `ledger.assumed = { units, since, source: "school-start" | "jump" }`. Assumed code counts as taught for the hard constraints (it may appear in words and on the bank), and its KCs start from a prior (pKnown 0.7, a config default), not evidence. The collection rule (two independent first tries with no miss between, §1.6) writes a `collected` event that the flower and the grown-ups' page read.
4. **`catchUp(ctx)`**, a new planner function. It returns at most one catch-up request: a door (for an assumed KC with a lapse, or a confusion pair), found through `firstTaught(kc)` and the authored level that teaches it, cut to its teaching games; or a lair (for gems a boss held). It applies §1.6's caps, and the "Catch up first" setting.
5. **`bossCheck(land, ctx)`**, which composes a boss from the check rules (§2.3): reading at least one unit back, spelling at least two, rivals at least four, long words 4–7 back, one sentence at least two back; the land's authored signature items; the child's weak KCs weighted in; item counts by map. It returns the phases and, at the end, which gems come home.
6. **The scaffold** gains `rivals` (0 before the Rainbow Bridge; from the word's rung; chosen from confusions, then frequency) and `peek` (rung R2).
7. **Pacing by land and map.** `pacing` advances at a land's boss, pass or not (Sounds~Write keeps pace), and emits `game.progress land-done` (with the pass mark and the held gems) for the director's journey. **"Stay close to school"** caps the frontier from `PACING` and the date (§1.7).
8. **The weekly list.** `ledger.weekList`; `outline(ctx, 300_000)` makes the day's scroll from §1.9.4's plan; the list's words are pinned with `source: "school-list"`, may be beyond the frontier, and are tagged `met-at-school`.
9. **The director** keeps `StoryState` (`baronRound`, `finaleSeen`, `libraryOpen`), plays the journeys, and picks every boss and land line by story state, so a reformed Baron never threatens again.
10. **Budgets for 6–7-year-olds** are already in planner §3 (15–20 minutes, 12–14 items a block). The weekly scroll is a separate five-minute budget.

### 6.4 The order to build it

1. **Slice 1: long words and a boss that means it, with today's art.**
   - The carriage component and the Syllable Train at sound level, with about 40 PW1–PW3 words given `segs` and spelling-voice syllables. The read slider's syllable stops.
   - Rival spellings in `tileBank()` from the Rainbow Bridge on, the Battle correction branch, fan mode in the dojo.
   - `w6-11` rebuilt as a check-shaped boss: read, spell with rivals, Gem Grab, *sun·set* as the big attack, a sentence. It uses the Baron's art until the Magpie is drawn, and ends with the Baron's escape instead of the finale.
   - The end-loop fix and the honest numbers (audit §11.1 D–E).
   - The hooks: the glowing slot's kinds and the weekly list's (§1.9.8).
2. **Slice 2: the Sky Temple as EC1–5,** the Garden and the Rainbow Bridge moves, the Island's and the Sky Isles' overworld maps, the school welcome, ghost petals and catch-up doors, and the Magpie's art.
3. **Slice 3: the weekly list:** the link, the grown-ups' confirmation, the scroll, Ninja Vanish, the list maker, the nightly words.
4. **Then one land at a time,** Cloud Town to Star Dunes, then the Muddle Isles, then the Library. Each land ships with its boss, its story, its clips for the site and its bot sweep.

### 6.5 What the marketing can show, and when

The claims and the proof shots are in docs/midgame/MARKETING_PLAN.md. The rule this design gives it: **a claim ships with the slice that makes it true.**

| After | The site can honestly show |
|---|---|
| Slice 1 | a Year 1 child building *sunset* carriage by carriage; *rain* with < ai > < ay > < a > on the bank and the "that's a spelling of that sound too" correction; a boss that tests spelling choice |
| Slice 2 | a Year 1 school start (the welcome, ghost petals filling); Sound Detective on *great*; the Magpie |
| Slice 3 | "Put this week's school spellings in with one link" |
| Each land | that land's words in the "What your child will spell" table, with its clip |
| The Muddle Isles | *station*, *multiply*, *mechanic*; the final battle |
| The Library | *magician*, *optician*, *division*, *multiplication*, labelled "a Year 2 stretch; Year 3 at school" |

---

## 7. Decisions made without asking, and open questions

### 7.1 Decisions (for docs/DECISIONS.md)

| # | Decision | Why | To change it |
|---|---|---|---|
| M1 | Four overworld maps (Garden, Island of Sounds, Sky Isles, Muddle Isles) and a Library after them | Jonas's direction; fixed chunks with a visible end; one story beat per map (§1.1) | rename freely; the structure is in `World.map` |
| M2 | Six lands a school year, one boss each, and each boss is its land's progress check | the 6–8-week check rhythm (§1.1) | merge lands in `worlds.ts` |
| M3 | Land names carry their land's sound (Cloud Town, Giant's Gorge …) | a small mnemonic, said once per land | names are data |
| M4 | Game types belong to maps (§1.4) | Jonas: "totally fine" | the registry in `games.ts` |
| M5 | A school child starts at the first stone of the land holding their start unit; earlier units are assumed and shown as ghost petals | "we assume you know these things" | `startFor()` |
| M6 | A ghost gem is collected after two independent first tries with no miss between | proof without a test | a config value |
| M7 | Catch-up is the glowing stone (a door), at most one in three stones, never first in a session, at most two a day | obvious to a child, never taking over | the caps in the planner's config |
| M8 | The guardian's challenge clears a land's ghost petals in about two minutes | the fast lane is the fun lane | – |
| M9 | The child always beats the boss; unearned gems are grabbed by the petal imp and won back in a lair | stakes without a losing screen; Sounds~Write keeps pace | – |
| M10 | The Sky Temple's boss becomes the Magpie; the Baron fights at the end of Year 1 and Year 2; the finale plays once, at the end of Year 2 | the story must end once, at the end of the programme | – |
| M11 | "Go at their own pace" is the default; "Stay close to school" is a grown-ups' setting | most children play less than school teaches, and some more | the default in settings |
| M12 | Rival spellings from the Rainbow Bridge on, only for spellings four or more units back unless the word was peeked | Sounds~Write's quizzing lag and Lesson 7 | `tileBank()` |
| M13 | Every word has a rung, R0–R5 (§3.0.3) | spelling choice is word knowledge | – |
| M14 | Long words: the ninja slices (sound level) or the child slices (syllable level); the tortoise speaks in the spelling voice and the rabbit in the talking voice | Lessons 11–14 and the spelling voice | – |
| M15 | A special ending is three tiles under a gold bracket at sound level and one chunk at syllable level; "shun" is said as spoken | one sound per tile; the spelling-voice question is open | – |
| M16 | Muddled Notes only use words the child spells securely, one or two per note, always fixed and re-read | seeing misspellings can make them stick | the rung threshold |
| M17 | The weekly list: `?list=…&special=…&test=…`; a grown-up confirms; the scroll is the day's first stone; five minutes a day; "special words", never "tricky"; at most two new special words a day; unknown words ready the next day | §1.9 | – |
| M18 | Belts come from checks; a school starter's earlier belts are stitched in silver until their petals are home | honest placement | – |
| M19 | From the Sky Isles, long words become Word Scroll cards instead of stickers | a sticker of *tray* is no prize at seven | – |
| M20 | Two stories per Year 1–2 land for v1 (the model's quota is one per sound unit) | cost | the quota |

### 7.2 Open questions (none blocks the build)

1. **Names.** The land and map names are ours. *Muddle Isles* tells a Year 2 child whose islands they are; if Jonas prefers something gentler, it is data.
2. **The default pace for school children.** We chose "own pace". A school might prefer "Stay close to school".
3. **Freshford's lists.** What exactly is on a Year 1 list (the sound named, or just words)? Would the class teacher post one link for the class on Seesaw? Does Reception get lists too (Freshford checks Reception word lists fortnightly)?
4. **Does Freshford use the Sounds~Write progress checks?** (SW §10, question 6.) If it does, the grown-ups' page can use the check numbers.
5. **Special endings on the official boards.** How the members' building boards tile -tion, and whether a spelling-voice form of "shun" is taught (SW §10, question 3).
6. **The misspelling studies** in §3.6 were cited from memory and must be checked before Muddled Notes is built.
7. **A grown-up's own voice** for list words (later): where the recordings live, and for how long.

---

## 8. Sources

- **Research for this review:** [midgame/sw-y1y2.md](midgame/sw-y1y2.md) (Sounds~Write in Years 1–2, with its source keys), [midgame/audit.md](midgame/audit.md) (today's game on production; evidence in `playtest/runs/midgame/`), [midgame/prior-art.md](midgame/prior-art.md) (products and research, with links).
- **New evidence from this step:** `playtest/runs/midgame/quota-gap.ts` and `quota-gap.txt` (read-only: the content quota per Extended Code unit against the unit files).
- **The game's own designs:** [SOUNDS_WRITE_MODEL.md](SOUNDS_WRITE_MODEL.md) (§1.4 the units, §1.6 long words, §6.1 the arc), [MULTI_SOUND.md](MULTI_SOUND.md) (Sound Detective), [TEACHER_SCRIPT.md](TEACHER_SCRIPT.md) (§0.1 the anatomy, §2 the voice rules, §9 fast and slow), [MAP_DESIGN.md](MAP_DESIGN.md) (the glowing stone), [FIRST_MINUTES.md](FIRST_MINUTES.md) (§4 the opt-in, §9–10 the school start points), `docs/read-slider/research.md` (the read slider), [architecture/planner.md](architecture/planner.md), [NARRATIVE_AUDIT.md](NARRATIVE_AUDIT.md).
- **The code read:** `src/content/worlds.ts`, `src/content/sw.ts` (`contentQuota`, `PROGRESS_CHECKS`, `PACING`, `PolyItem`), `src/content/flower.ts`, `src/content/lines.ts` (the film, the Baron's lines, the finale), `src/content/units/*.ts`, `src/ui/ReadSlider.tsx`.
- **Sounds~Write** (local, not for publication): `assets-src/sw-sources/research/DOSSIER.md` §11 (high-frequency words: the teacher's language and the load limits); the Freshford Year 1–2 parents' presentation (`assets-src/sw-sources/school-y1y2.txt`, 23 September 2026).
